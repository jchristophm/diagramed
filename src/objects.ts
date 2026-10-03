import { DocumentStore, newGraphic, type Graphic } from './model';
import {validateRelationships} from './persistence';
import {assertExpressions,ensureNoReferences} from './expressions';
import {physicalConstants} from './constants';
import { synchronizeSymbols } from './naming';
import { attachmentPoint } from './geometry';
import type { PropertyQuantity, Variable, ObjectCategory } from './semantics';
export const propertyDefinitions = {
  mass: { name: 'Mass', symbol: 'm', units: ['kg', 'g'] },
  charge: { name: 'Electric charge', symbol: 'q', units: ['C', 'mC', 'µC', 'nC'] },
  density: { name: 'Density', symbol: '\\rho', units: ['kg/m^3', 'g/cm^3'] },
  gravity: { name: 'Gravitational field strength', symbol: 'g', units: ['m/s^2', 'N/kg'] },
  springConstant: { name: 'Spring constant', symbol: 'k', units: ['N/m'] },
  extension: { name: 'Extension / compression', symbol: '\\Delta x', units: ['m', 'cm'] },
  surfaceChargeDensity: { name: 'Surface charge density', symbol: '\\sigma', units: ['C/m^2', 'µC/m^2'] }
} satisfies Record<PropertyQuantity, { name: string; symbol: string; units: string[] }>;
export interface PropertyDraft { id?:string; expression?:Variable['expression']; symbol?: string; generatedSymbol?: boolean; state: 'known' | 'unknown' | 'expression'; unit: string; value?: number }
export function canonicalSymbol(symbol: string) { return symbol.trim().replace(/\s|[{}]/g, ''); }
export type Representation = 'circle' | 'rectangle' | 'point' | 'surface' | 'spring' | 'cable' | 'none';
export const categoryNames: Record<ObjectCategory,string> = {ordinary:'Ordinary physical object',spatialPoint:'Spatial point',planetSurface:'Planet Surface',spring:'Spring',cable:'String/Cable',chargedPlate:'Charged Plate',fluid:'Fluid'};
export const categoryProperties: Record<ObjectCategory,PropertyQuantity[]> = {ordinary:['mass','charge','density'],spatialPoint:['charge'],planetSurface:['gravity'],spring:['springConstant','extension'],cable:[],chargedPlate:['surfaceChargeDensity'],fluid:['density']};
export const categoryRepresentations: Record<ObjectCategory,Representation[]> = {ordinary:['circle','rectangle','point','none'],spatialPoint:['point','none'],planetSurface:['surface','none'],spring:['spring','none'],cable:['cable','none'],chargedPlate:['surface','none'],fluid:['surface','none']};
export function propertySigned(key: PropertyQuantity) { return ['charge','extension','surfaceChargeDensity'].includes(key); }
export function presetDraft(category: ObjectCategory): ObjectDraft { const properties: ObjectDraft['properties']={}; if(category==='planetSurface')properties.gravity={state:'known',unit:'m/s^2',value:9.8}; if(category==='fluid')properties.density={state:'known',unit:'kg/m^3',value:1000}; return {name:category==='planetSurface'?'Earth':category==='fluid'?'Water':categoryNames[category],category,representation:category==='spatialPoint'?'point':['planetSurface','chargedPlate','fluid'].includes(category)?'surface':category==='spring'?'spring':category==='cable'?'cable':'circle',polarity:'positive',showName:true,showProperties:true,properties}; }
export const objectPresets = (Object.keys(categoryNames) as ObjectCategory[]).filter(key=>key!=='ordinary').map(key=>({key,...presetDraft(key)}));
export function setObjectVisibility(store: DocumentStore, id: string, visible: boolean) {
  const graphic = objectGraphic(store, id);
  if (!graphic) throw new Error('This object has no saved graphical configuration. Edit its definition to choose a representation.');
  store.update(graphic.id, { visible });
}
export interface ObjectDraft { category?: ObjectCategory; polarity?: 'positive' | 'negative'; id?: string; name: string; representation: Representation; showName: boolean; showProperties: boolean; properties?: Partial<Record<PropertyQuantity, PropertyDraft>> }
export function objectGraphic(store: DocumentStore, id: string) { return store.document.presentation.elements.find(e => e.semanticId === id); }
export function saveObject(store: DocumentStore, draft: ObjectDraft): string {
  const name = draft.name.trim(); if (!name) throw new Error('Give this object a name.');
  if (name.length > 120) throw new Error('Object names must be 120 characters or shorter.');
  const next = structuredClone(store.document);
  const existing = draft.id ? next.semantics.objects.find(o => o.id === draft.id) : undefined;
  if (draft.id && !existing) throw new Error('This object no longer exists.');
  const id = existing?.id || crypto.randomUUID();
  const category = draft.category || existing?.category || 'ordinary';
  if (!Object.hasOwn(categoryNames, category)) throw new Error('Unsupported object category.');
  if (!categoryRepresentations[category].includes(draft.representation)) throw new Error('Representation does not match this object category.');
  if(existing && category !== (existing.category || 'ordinary')) throw new Error('Object category cannot be changed.');
  const polarity = draft.polarity || existing?.polarity || 'positive';
  if(!['positive','negative'].includes(polarity))throw new Error('Invalid plate polarity.');
  const previousProperties = existing?.properties || {};
  if (draft.properties !== undefined) {
    const previousIds = new Set(Object.values(previousProperties));
    const definitions: Record<string, string> = {};
    const removedIds = new Set([...previousIds].filter(variableId => !Object.keys(draft.properties!).some(key => previousProperties[key] === variableId)));
    ensureNoReferences(next,removedIds);
    if (next.semantics.vectors.some(v => removedIds.has(v.variableId)) || next.semantics.components.some(c => removedIds.has(c.variableId))) throw new Error('This property is referenced by a vector or component. Remove that reference before removing the property.');
    if (next.semantics.objects.some(o => o.id !== id && Object.values(o.properties || {}).some(v => previousIds.has(v)))) throw new Error('This property variable is shared by another object. Shared ownership needs to be resolved before editing it.');
    const registry = next.semantics.variables.filter(v => !previousIds.has(v.id));
    for (const [quantity, property] of Object.entries(draft.properties)) {
      if (!property || !(Object.hasOwn(propertyDefinitions, quantity))) throw new Error('Unsupported physical property.');
      const key = quantity as PropertyQuantity; if(!categoryProperties[category].includes(key))throw new Error('Property is unavailable for this category.');
      const definition = propertyDefinitions[key], symbol = property.symbol?.trim() || `pending_{${id},${key}}`;
      if (!symbol || symbol.length > 80) throw new Error(`${definition.name} needs a symbol (maximum 80 characters).`);
      if(property.symbol && !property.generatedSymbol && Object.values(physicalConstants).some(c=>canonicalSymbol(c.symbol)===canonicalSymbol(symbol)))throw new Error('This symbol is reserved for a physical constant.');
      const conflict = property.symbol && !property.generatedSymbol && registry.find(v => canonicalSymbol(v.symbol) === canonicalSymbol(symbol));
      if (conflict) {
        const owner = next.semantics.objects.find(o => o.id === conflict.ownerObjectId)?.name;
        throw new Error(`The symbol ${symbol} is already used${owner ? ` by ${owner}` : ''}. Choose a distinct symbol, such as a different subscript.`);
      }
      if (!definition.units.includes(property.unit)) throw new Error(`Choose a supported unit for ${definition.name.toLowerCase()}.`);
      if (!['known', 'unknown','expression'].includes(property.state)) throw new Error('Choose Unknown, Known or Expression for each property.');
      if (property.state === 'known' && (property.value === undefined || !Number.isFinite(property.value) || (!propertySigned(key) && property.value < 0))) throw new Error(`${definition.name} needs a finite ${key === 'charge' ? '' : 'nonnegative '}numerical value.`);
      if(key==='surfaceChargeDensity' && property.state==='known' && property.value!==0 && (property.value! < 0)!==(polarity==='negative')) throw new Error('Plate polarity and signed surface charge density must agree.');
      const variable: Variable = { id: previousProperties[key] || property.id || crypto.randomUUID(), ownerObjectId: id, quantity: key, symbol, generatedSymbol: property.generatedSymbol ?? !property.symbol, unit: property.unit, state: property.state };
      if(registry.some(v=>v.id===variable.id))throw new Error('Property variable identity is already used.');
      if(property.state==='expression')variable.expression=property.expression;
      if (property.state === 'known') variable.value = property.value;
      definitions[key] = variable.id; registry.push(variable);
    }
    next.semantics.variables = registry;
    if (existing) existing.properties = definitions;
    else next.semantics.objects.push({ id, name, properties: definitions });
  }
  if (existing) { existing.abbreviationName ??= existing.name; existing.name = name; } else if (draft.properties === undefined) next.semantics.objects.push({ id, name, properties: {} });
  const physical = next.semantics.objects.find(o=>o.id===id)!; physical.category=category; if(category==='chargedPlate')physical.polarity=polarity;
  let graphic = next.presentation.elements.find(e => e.semanticId === id);
  if (!graphic) {
    graphic = newGraphic(draft.representation === 'none' ? (['planetSurface','chargedPlate','fluid'].includes(category)?'surface':category==='spring'?'spring':category==='cable'?'cable':'circle') : draft.representation, next);
    if(graphic.kind==='surface'){graphic.x=next.presentation.canvas.minX??0;graphic.y=next.presentation.canvas.coordinateSpace?160:next.presentation.canvas.height*.72;graphic.width=next.presentation.canvas.width;graphic.height=(next.presentation.canvas.minY??0)+next.presentation.canvas.height-graphic.y;}
    if(['spring','cable'].includes(graphic.kind))graphic.points=[-80,0,80,0];
    graphic.semanticId = id; graphic.stroke = '#333'; graphic.fill = 'transparent';
    next.presentation.elements.push(graphic);
  }
  if (draft.representation !== 'none' && draft.representation !== graphic.kind) {
    const center = attachmentPoint(graphic); graphic.kind = draft.representation;
    if (graphic.kind === 'circle' && graphic.radius < 10) graphic.radius = 20;
    graphic.scaleX = 1; graphic.scaleY = 1; graphic.rotation = 0;
    graphic.x = center.x - (graphic.kind === 'rectangle' ? graphic.width / 2 : 0);
    graphic.y = center.y - (graphic.kind === 'rectangle' ? graphic.height / 2 : 0);
  }
  if (graphic.kind === 'point') { graphic.radius = 4; graphic.fill = '#333'; }
  else graphic.fill = 'transparent';
  const expected = ['planetSurface','chargedPlate','fluid'].includes(category)?'surface':category==='spring'?'spring':category==='cable'?'cable':category==='spatialPoint'?'point':undefined;
  if(expected && graphic.kind!==expected)throw new Error('Representation does not match this object category.');
  if(graphic.kind==='surface'){graphic.fill=category==='fluid'?'rgba(65,150,240,0.3)':category==='planetSurface'?'#b8ac98':'#ddd';}
  graphic.visible = draft.representation !== 'none';
  graphic.label = { ...graphic.label, ...(!graphic.label ? {placement:'objectCenter' as const}:{}), showName: draft.showName, showProperties: draft.showProperties, offsetX: graphic.label?.offsetX ?? 0, offsetY: graphic.label?.offsetY ?? (graphic.kind==='surface'?28-graphic.height/2:28) };
  next.metadata.updatedAt = new Date().toISOString(); synchronizeSymbols(next); assertExpressions(next); validateRelationships(next); store.replace(next); return id;
}
export function deleteObject(store: DocumentStore, id: string) {
  const next = structuredClone(store.document);
  if (next.semantics.interactions.some(i => i.objectIds.includes(id)) || next.semantics.vectors.some(v => v.objectId === id || v.sourceId===id || v.fromId===id || v.toId===id)) throw new Error('Remove this object’s dependent interactions or vectors before deleting it.');
  const ownedIds = new Set(Object.values(next.semantics.objects.find(o => o.id === id)?.properties || {}));
  if (next.semantics.objects.some(o => o.id !== id && Object.values(o.properties || {}).some(v => ownedIds.has(v)))) throw new Error('Another object references this property variable. Resolve that reference before deleting the object.');
  if (next.semantics.vectors.some(v => ownedIds.has(v.variableId)) || next.semantics.components.some(c => ownedIds.has(c.variableId))) throw new Error('Remove dependent variable references before deleting this object.');
  ensureNoReferences(next,ownedIds);
  next.semantics.objects = next.semantics.objects.filter(o => o.id !== id);
  next.semantics.variables = next.semantics.variables.filter(v => !ownedIds.has(v.id));
  next.presentation.elements = next.presentation.elements.filter(e => e.semanticId !== id);
  synchronizeSymbols(next); next.metadata.updatedAt = new Date().toISOString(); store.replace(next);
}
export function objectDraft(store: DocumentStore, id?: string): ObjectDraft {
  const object = store.document.semantics.objects.find(o => o.id === id), g = id ? objectGraphic(store, id) : undefined;
  const properties: ObjectDraft['properties'] = {};
  for (const [key, variableId] of Object.entries(object?.properties || {})) {
    if (!(Object.hasOwn(propertyDefinitions, key))) continue;
    const variable = store.document.semantics.variables.find(v => v.id === variableId);
    if (variable) properties[key as PropertyQuantity] = { id:variable.id,expression:variable.expression,symbol: variable.symbol, generatedSymbol: !!variable.generatedSymbol, unit: variable.unit || propertyDefinitions[key as PropertyQuantity].units[0], state: variable.state||'unknown', value: variable.value };
  }
  return { id, category:object?.category || 'ordinary',polarity:object?.polarity || 'positive', name: object?.name || '', representation: g?.visible === false ? 'none' : (g?.kind as Representation) || 'circle', showName: g?.label?.showName ?? true, showProperties: g?.label?.showProperties ?? true, properties };
}
