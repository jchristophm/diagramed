import { newGraphic, type DiagramDocument } from './model';
import { canonicalSymbol, propertyDefinitions, propertySigned, categoryNames, categoryProperties } from './objects';
import type { PropertyQuantity } from './semantics';
type ObjectValue = Record<string, unknown>;
function fail(message: string): never { throw new Error(`Cannot open diagram: ${message}`); }
function object(value: unknown, name: string): ObjectValue { if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${name} must be an object.`); return value as ObjectValue; }
function string(value: unknown, name: string) { if (typeof value !== 'string' || value.length > 100000) fail(`${name} must be text (maximum 100,000 characters).`); }
function number(value: unknown, name: string, positive = false) { if (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > 1000000 || (positive && value <= 0)) fail(`${name} is not a supported number.`); }
function list(value: unknown, name: string): unknown[] { if (!Array.isArray(value) || value.length > 5000) fail(`${name} must be an array with at most 5,000 entries.`); return value; }
export function parseDocument(text: string): DiagramDocument {
  if (text.length > 10000000) fail('file exceeds the 10 MB limit.');
  let value: unknown; try { value = JSON.parse(text); } catch { fail('file is not valid JSON.'); }
  const d = object(value, 'document');
  if (d.format !== 'diagramed') fail('this is not a Diagramed document.');
  if (d.version !== 1 && d.version !== 2 && d.version !== 3) fail(`unsupported format version ${String(d.version)}. This editor supports versions 1, 2 and 3.`);
  string(d.id, 'document identity');
  if (!d.id) fail('document identity cannot be empty.');
  const metadata = object(d.metadata, 'metadata'); for (const key of ['title', 'createdAt', 'updatedAt']) string(metadata[key], `metadata.${key}`);
  const p = object(d.presentation, 'presentation'), c = object(p.canvas, 'canvas'), g = object(p.grid, 'grid');
  for (const key of ['width', 'height']) { number(c[key], `canvas.${key}`, true); if ((c[key] as number) > 10000) fail('canvas dimensions exceed 10,000.'); }
  number(g.size, 'grid.size', true); if (typeof g.visible !== 'boolean') fail('grid visibility must be true or false.');
  if (Math.ceil((c.width as number) / (g.size as number)) + Math.ceil((c.height as number) / (g.size as number)) > 10000) fail('grid has too many lines.');
  const ids = new Set<string>();
  for (const entry of list(p.elements, 'elements')) {
    const e = object(entry, 'element'); string(e.id, 'element identity');
    if (!e.id || ids.has(e.id as string)) fail('element identities must be unique and nonempty.'); ids.add(e.id as string);
    if (!['surface', 'spring', 'cable', 'rectangle', 'circle', 'point', 'line', 'arrow', 'dashedArrow', 'text', 'latex'].includes(e.kind as string)) fail('unknown graphical element type.');
    for (const key of ['x', 'y', 'rotation', 'scaleX', 'scaleY', 'width', 'height', 'radius', 'strokeWidth', 'fontSize']) number(e[key], `element.${key}`, ['width', 'height', 'radius', 'fontSize'].includes(key));
    if (e.scaleX === 0 || e.scaleY === 0 || (e.strokeWidth as number) < 0) fail('invalid element scale or stroke width.');
    for (const key of ['stroke', 'fill', 'text', 'latex', 'fontFamily']) string(e[key], `element.${key}`);
    const points = list(e.points, 'points'); if (points.length !== 4) fail('line endpoints require four coordinates.'); points.forEach(v => number(v, 'endpoint'));
    if (e.semanticId !== undefined) string(e.semanticId, 'semantic identity');
    if (e.visible !== undefined && typeof e.visible !== 'boolean') fail('element visibility must be true or false.');
    if (e.label !== undefined) {
      const label = object(e.label, 'label presentation');
      if (typeof label.showName !== 'boolean' || typeof label.showProperties !== 'boolean') fail('label visibility settings must be true or false.');
      number(label.offsetX, 'label offset'); number(label.offsetY, 'label offset');
    }
  }
  const semantics = object(d.semantics, 'semantics');
  const semanticIds = new Set<string>();
  for (const key of ['objects', 'interactions', 'variables', 'vectors', 'coordinateSystems', 'components']) {
    for (const item of list(semantics[key], `semantics.${key}`)) {
      const entry = object(item, key); string(entry.id, `${key}.id`);
      if (!entry.id || semanticIds.has(entry.id as string)) fail('semantic identities must be unique and nonempty.'); semanticIds.add(entry.id as string);
      const fields: Record<string, string[]> = { objects: ['name'], interactions: ['kind'], variables: ['symbol'], vectors: ['kind', 'variableId'], coordinateSystems: [], components: ['vectorId', 'coordinateSystemId', 'axis', 'variableId'] };
      fields[key].forEach(field => string(entry[field], `${key}.${field}`));
      if (key === 'objects' && entry.properties !== undefined) Object.values(object(entry.properties, 'properties')).forEach(v => string(v, 'property variable reference'));
      if (key === 'interactions') list(entry.objectIds, 'interaction objects').forEach(v => string(v, 'object reference'));
      if (key === 'variables') { if (entry.value !== undefined && (typeof entry.value !== 'number' || !Number.isFinite(entry.value))) fail('variable value must be a finite number.'); if (entry.unit !== undefined) string(entry.unit, 'variable unit'); }
      if (key === 'vectors') { if (!['force', 'field', 'motion'].includes(entry.kind as string)) fail('unknown semantic vector kind.'); for (const f of ['objectId', 'interactionId']) if (entry[f] !== undefined) string(entry[f], f); }
      if (key === 'coordinateSystems') { if (entry.dimensions !== 1 && entry.dimensions !== 2) fail('coordinate system dimension must be 1 or 2.'); const origin = list(entry.origin, 'origin'); if (origin.length !== 2) fail('origin must contain two coordinates.'); origin.forEach(v => number(v, 'origin coordinate')); number(entry.angle, 'coordinate angle'); }
      if (key === 'components' && !['x', 'y'].includes(entry.axis as string)) fail('component axis must be x or y.');
    }
  }
  const result = structuredClone(value) as DiagramDocument;
  if (d.version === 1) {
    // Upgrade only explicit semantic definitions. Never tag legacy drawing primitives.
    result.version = 3;
    for (const physical of result.semantics.objects) {
      for (const [key, id] of Object.entries(physical.properties || {})) {
        const variable = result.semantics.variables.find(v => v.id === id);
        if (variable && Object.hasOwn(propertyDefinitions, key)) {
          variable.quantity ??= key as PropertyQuantity;
          variable.ownerObjectId ??= physical.id;
          variable.state ??= variable.value === undefined ? 'unknown' : 'known';
          variable.unit ??= propertyDefinitions[key as PropertyQuantity].units[0];
        }
      }
      let graphic = result.presentation.elements.find(e => e.semanticId === physical.id);
      if (!graphic) { graphic = newGraphic('circle', result); graphic.semanticId = physical.id; graphic.visible = false; result.presentation.elements.push(graphic); }
      graphic.visible ??= true;
      graphic.label ??= { showName: true, showProperties: true, offsetX: 24, offsetY: 24 };
    }
  }
  result.version = 3;
  for(const physical of result.semantics.objects){physical.category ??= 'ordinary';}
  validateRelationships(result);
  return result;
}
function validateRelationships(doc: DiagramDocument) {
  const objects = new Map(doc.semantics.objects.map(o => [o.id, o]));
  const variables = new Map(doc.semantics.variables.map(v => [v.id, v]));
  const symbols = new Set<string>();
  const referenced = new Set<string>();
  for (const object of objects.values()) {
    if(!object.category || !Object.hasOwn(categoryNames,object.category))fail('unsupported object category.');
    if(object.category==='chargedPlate' && !['positive','negative'].includes(object.polarity || ''))fail('invalid plate polarity.');
    if (!object.name.trim() || object.name.length > 120) fail('object names must be nonempty and at most 120 characters.');
    for (const [key, id] of Object.entries(object.properties || {})) {
      if (!(Object.hasOwn(propertyDefinitions, key)) || !categoryProperties[object.category!].includes(key as PropertyQuantity)) fail('unsupported object property.');
      const variable = variables.get(id);
      if (!variable || variable.ownerObjectId !== object.id || variable.quantity !== key) fail('property variable ownership or quantity reference is invalid.');
      if (referenced.has(id)) fail('each property variable must have one owning object.'); referenced.add(id);
    }
    const graphics = doc.presentation.elements.filter(e => e.semanticId === object.id);
    if (graphics.length !== 1) fail('each physical object requires exactly one saved graphical configuration, including hidden objects.');
    if (!['circle','rectangle','point','surface','spring','cable'].includes(graphics[0].kind) || typeof graphics[0].visible !== 'boolean' || !graphics[0].label) fail('object graphical configuration is incomplete or incompatible.');
  }
  for(const physical of objects.values()){const g=doc.presentation.elements.find(e=>e.semanticId===physical.id)!; const expected=['planetSurface','chargedPlate','fluid'].includes(physical.category!)?'surface':physical.category==='spring'?'spring':physical.category==='cable'?'cable':physical.category==='spatialPoint'?'point':undefined;if(expected && g.kind!==expected)fail('incompatible category representation.');if(g.kind==='surface' && (g.x!==0 || g.width!==doc.presentation.canvas.width || g.y<0 || g.y>=doc.presentation.canvas.height || g.height!==doc.presentation.canvas.height-g.y || g.rotation!==0 || g.scaleX!==1 || g.scaleY!==1))fail('invalid anchored surface geometry.');const v=variables.get(physical.properties?.surfaceChargeDensity || '');if(v?.state==='known' && v.value!==0 && (v.value!<0)!==(physical.polarity==='negative'))fail('plate polarity contradicts surface charge density.');}
  for (const variable of variables.values()) {
    const symbol = canonicalSymbol(variable.symbol); if (!symbol) fail('variable symbol cannot be empty.');
    if (variable.quantity && variable.symbol.length > 80) fail('property symbols must be at most 80 characters.');
    if (symbols.has(symbol)) fail('ambiguous duplicate variable symbols. Choose distinct subscripts.'); symbols.add(symbol);
    if (variable.ownerObjectId !== undefined || variable.quantity !== undefined || variable.state !== undefined) {
      if (!variable.ownerObjectId || !objects.has(variable.ownerObjectId) || !referenced.has(variable.id)) fail('orphaned property variable.');
      const definition = propertyDefinitions[variable.quantity as PropertyQuantity];
      if (!definition || !definition.units.includes(variable.unit || '')) fail('property unit does not match its quantity.');
      if (variable.state !== 'known' && variable.state !== 'unknown') fail('property state must explicitly be known or unknown.');
      if (variable.state === 'unknown' && variable.value !== undefined) fail('an unknown property cannot contain a numerical value.');
      if (variable.state === 'known' && (variable.value === undefined || !Number.isFinite(variable.value) || (!propertySigned(variable.quantity as PropertyQuantity) && variable.value < 0))) fail('known property requires a finite appropriate numerical value.');
    }
  }
  for (const e of doc.presentation.elements) if (e.semanticId && !objects.has(e.semanticId)) fail('graphical element references a missing physical object.');
  const interactions = new Set(doc.semantics.interactions.map(i => i.id));
  const vectors = new Set(doc.semantics.vectors.map(v => v.id));
  const coordinates = new Set(doc.semantics.coordinateSystems.map(c => c.id));
  for (const i of doc.semantics.interactions) if (i.objectIds.some(id => !objects.has(id))) fail('interaction references a missing object.');
  for (const v of doc.semantics.vectors) if (!variables.has(v.variableId) || (v.objectId && !objects.has(v.objectId)) || (v.interactionId && !interactions.has(v.interactionId))) fail('vector references are invalid.');
  for (const c of doc.semantics.components) if (!vectors.has(c.vectorId) || !coordinates.has(c.coordinateSystemId) || !variables.has(c.variableId)) fail('component references are invalid.');
}
export function serializeDocument(document: DiagramDocument) { return JSON.stringify(document, null, 2) + '\n'; }
export function downloadDocument(document: DiagramDocument) {
  const blob = new Blob([serializeDocument(document)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a'); link.href = url;
  link.download = `${document.metadata.title.replace(/[^a-z0-9_-]+/gi, '-').slice(0, 80) || 'diagram'}.diagramed.json`;
  link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
