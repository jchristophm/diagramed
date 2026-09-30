import { DocumentStore, newGraphic, type Graphic } from './model';
import { attachmentPoint } from './geometry';
import type { PropertyQuantity, Variable } from './semantics';
export const propertyDefinitions = {
  mass: { name: 'Mass', symbol: 'm', units: ['kg', 'g'] },
  charge: { name: 'Electric charge', symbol: 'q', units: ['C', 'mC', 'µC', 'nC'] },
  density: { name: 'Density', symbol: '\\rho', units: ['kg/m^3', 'g/cm^3'] }
} satisfies Record<PropertyQuantity, { name: string; symbol: string; units: string[] }>;
export interface PropertyDraft { symbol: string; state: 'known' | 'unknown'; unit: string; value?: number }
export function canonicalSymbol(symbol: string) { return symbol.trim().replace(/\s|[{}]/g, ''); }
export type Representation = 'circle' | 'rectangle' | 'point' | 'none';
export interface ObjectDraft { id?: string; name: string; representation: Representation; showName: boolean; showProperties: boolean; properties?: Partial<Record<PropertyQuantity, PropertyDraft>> }
export function objectGraphic(store: DocumentStore, id: string) { return store.document.presentation.elements.find(e => e.semanticId === id); }
export function saveObject(store: DocumentStore, draft: ObjectDraft): string {
  const name = draft.name.trim(); if (!name) throw new Error('Give this object a name.');
  if (name.length > 120) throw new Error('Object names must be 120 characters or shorter.');
  const next = structuredClone(store.document);
  const existing = draft.id ? next.semantics.objects.find(o => o.id === draft.id) : undefined;
  if (draft.id && !existing) throw new Error('This object no longer exists.');
  const id = existing?.id || crypto.randomUUID();
  const previousProperties = existing?.properties || {};
  if (draft.properties !== undefined) {
    const previousIds = new Set(Object.values(previousProperties));
    const definitions: Record<string, string> = {};
    const removedIds = new Set([...previousIds].filter(variableId => !Object.keys(draft.properties!).some(key => previousProperties[key] === variableId)));
    if (next.semantics.vectors.some(v => removedIds.has(v.variableId)) || next.semantics.components.some(c => removedIds.has(c.variableId))) throw new Error('This property is referenced by a vector or component. Remove that reference before removing the property.');
    if (next.semantics.objects.some(o => o.id !== id && Object.values(o.properties || {}).some(v => previousIds.has(v)))) throw new Error('This property variable is shared by another object. Shared ownership needs to be resolved before editing it.');
    const registry = next.semantics.variables.filter(v => !previousIds.has(v.id));
    for (const [quantity, property] of Object.entries(draft.properties)) {
      if (!property || !(quantity in propertyDefinitions)) throw new Error('Unsupported physical property.');
      const key = quantity as PropertyQuantity, definition = propertyDefinitions[key], symbol = property.symbol.trim();
      if (!symbol || symbol.length > 80) throw new Error(`${definition.name} needs a symbol (maximum 80 characters).`);
      const conflict = registry.find(v => canonicalSymbol(v.symbol) === canonicalSymbol(symbol));
      if (conflict) {
        const owner = next.semantics.objects.find(o => o.id === conflict.ownerObjectId)?.name;
        throw new Error(`The symbol ${symbol} is already used${owner ? ` by ${owner}` : ''}. Choose a distinct symbol, such as a different subscript.`);
      }
      if (!definition.units.includes(property.unit)) throw new Error(`Choose a supported unit for ${definition.name.toLowerCase()}.`);
      if (!['known', 'unknown'].includes(property.state)) throw new Error('Choose Known or Unknown for each property.');
      if (property.state === 'known' && (property.value === undefined || !Number.isFinite(property.value) || (key !== 'charge' && property.value < 0))) throw new Error(`${definition.name} needs a finite ${key === 'charge' ? '' : 'nonnegative '}numerical value.`);
      const variable: Variable = { id: previousProperties[key] || crypto.randomUUID(), ownerObjectId: id, quantity: key, symbol, unit: property.unit, state: property.state };
      if (property.state === 'known') variable.value = property.value;
      definitions[key] = variable.id; registry.push(variable);
    }
    next.semantics.variables = registry;
    if (existing) existing.properties = definitions;
    else next.semantics.objects.push({ id, name, properties: definitions });
  }
  if (existing) existing.name = name; else if (draft.properties === undefined) next.semantics.objects.push({ id, name, properties: {} });
  let graphic = next.presentation.elements.find(e => e.semanticId === id);
  if (!graphic) {
    graphic = newGraphic(draft.representation === 'none' ? 'circle' : draft.representation, next);
    graphic.semanticId = id; graphic.stroke = '#333'; graphic.fill = 'transparent';
    next.presentation.elements.push(graphic);
  }
  if (draft.representation !== 'none' && draft.representation !== graphic.kind) {
    const center = attachmentPoint(graphic); graphic.kind = draft.representation;
    graphic.scaleX = 1; graphic.scaleY = 1; graphic.rotation = 0;
    graphic.x = center.x - (graphic.kind === 'rectangle' ? graphic.width / 2 : 0);
    graphic.y = center.y - (graphic.kind === 'rectangle' ? graphic.height / 2 : 0);
  }
  if (graphic.kind === 'point') { graphic.radius = 4; graphic.fill = '#333'; }
  else graphic.fill = 'transparent';
  graphic.visible = draft.representation !== 'none';
  graphic.label = { showName: draft.showName, showProperties: draft.showProperties, offsetX: graphic.label?.offsetX ?? 24, offsetY: graphic.label?.offsetY ?? 24 };
  next.metadata.updatedAt = new Date().toISOString(); store.replace(next); return id;
}
export function deleteObject(store: DocumentStore, id: string) {
  const next = structuredClone(store.document);
  if (next.semantics.interactions.some(i => i.objectIds.includes(id)) || next.semantics.vectors.some(v => v.objectId === id)) throw new Error('Remove this object’s dependent interactions or vectors before deleting it.');
  const ownedIds = new Set(Object.values(next.semantics.objects.find(o => o.id === id)?.properties || {}));
  if (next.semantics.objects.some(o => o.id !== id && Object.values(o.properties || {}).some(v => ownedIds.has(v)))) throw new Error('Another object references this property variable. Resolve that reference before deleting the object.');
  if (next.semantics.vectors.some(v => ownedIds.has(v.variableId)) || next.semantics.components.some(c => ownedIds.has(c.variableId))) throw new Error('Remove dependent variable references before deleting this object.');
  next.semantics.objects = next.semantics.objects.filter(o => o.id !== id);
  next.semantics.variables = next.semantics.variables.filter(v => !ownedIds.has(v.id));
  next.presentation.elements = next.presentation.elements.filter(e => e.semanticId !== id);
  next.metadata.updatedAt = new Date().toISOString(); store.replace(next);
}
export function objectDraft(store: DocumentStore, id?: string): ObjectDraft {
  const object = store.document.semantics.objects.find(o => o.id === id), g = id ? objectGraphic(store, id) : undefined;
  const properties: ObjectDraft['properties'] = {};
  for (const [key, variableId] of Object.entries(object?.properties || {})) {
    if (!(key in propertyDefinitions)) continue;
    const variable = store.document.semantics.variables.find(v => v.id === variableId);
    if (variable) properties[key as PropertyQuantity] = { symbol: variable.symbol, unit: variable.unit || propertyDefinitions[key as PropertyQuantity].units[0], state: variable.state || (variable.value === undefined ? 'unknown' : 'known'), value: variable.value };
  }
  return { id, name: object?.name || '', representation: g?.visible === false ? 'none' : (g?.kind as Representation) || 'circle', showName: g?.label?.showName ?? true, showProperties: g?.label?.showProperties ?? true, properties };
}
