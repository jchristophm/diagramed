import type { DiagramDocument } from './model';
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
  if (d.version !== 1) fail(`unsupported format version ${String(d.version)}. This editor supports version 1.`);
  string(d.id, 'document identity');
  const metadata = object(d.metadata, 'metadata'); for (const key of ['title', 'createdAt', 'updatedAt']) string(metadata[key], `metadata.${key}`);
  const p = object(d.presentation, 'presentation'), c = object(p.canvas, 'canvas'), g = object(p.grid, 'grid');
  for (const key of ['width', 'height']) { number(c[key], `canvas.${key}`, true); if ((c[key] as number) > 10000) fail('canvas dimensions exceed 10,000.'); }
  number(g.size, 'grid.size', true); if (typeof g.visible !== 'boolean') fail('grid visibility must be true or false.');
  if (Math.ceil((c.width as number) / (g.size as number)) + Math.ceil((c.height as number) / (g.size as number)) > 10000) fail('grid has too many lines.');
  const ids = new Set<string>();
  for (const entry of list(p.elements, 'elements')) {
    const e = object(entry, 'element'); string(e.id, 'element identity');
    if (!e.id || ids.has(e.id as string)) fail('element identities must be unique and nonempty.'); ids.add(e.id as string);
    if (!['rectangle', 'circle', 'point', 'line', 'arrow', 'dashedArrow', 'text', 'latex'].includes(e.kind as string)) fail('unknown graphical element type.');
    for (const key of ['x', 'y', 'rotation', 'scaleX', 'scaleY', 'width', 'height', 'radius', 'strokeWidth', 'fontSize']) number(e[key], `element.${key}`, ['width', 'height', 'radius', 'fontSize'].includes(key));
    if (e.scaleX === 0 || e.scaleY === 0 || (e.strokeWidth as number) < 0) fail('invalid element scale or stroke width.');
    for (const key of ['stroke', 'fill', 'text', 'latex', 'fontFamily']) string(e[key], `element.${key}`);
    const points = list(e.points, 'points'); if (points.length !== 4) fail('line endpoints require four coordinates.'); points.forEach(v => number(v, 'endpoint'));
    if (e.semanticId !== undefined) string(e.semanticId, 'semantic identity');
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
      if (key === 'variables') { if (entry.value !== undefined) number(entry.value, 'variable value'); if (entry.unit !== undefined) string(entry.unit, 'variable unit'); }
      if (key === 'vectors') { if (!['force', 'field', 'motion'].includes(entry.kind as string)) fail('unknown semantic vector kind.'); for (const f of ['objectId', 'interactionId']) if (entry[f] !== undefined) string(entry[f], f); }
      if (key === 'coordinateSystems') { if (entry.dimensions !== 1 && entry.dimensions !== 2) fail('coordinate system dimension must be 1 or 2.'); const origin = list(entry.origin, 'origin'); if (origin.length !== 2) fail('origin must contain two coordinates.'); origin.forEach(v => number(v, 'origin coordinate')); number(entry.angle, 'coordinate angle'); }
      if (key === 'components' && !['x', 'y'].includes(entry.axis as string)) fail('component axis must be x or y.');
    }
  }
  // Retain extensible metadata and semantic definitions without Konva-specific state.
  return structuredClone(value) as DiagramDocument;
}
export function serializeDocument(document: DiagramDocument) { return JSON.stringify(document, null, 2) + '\n'; }
export function downloadDocument(document: DiagramDocument) {
  const blob = new Blob([serializeDocument(document)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = window.document.createElement('a'); link.href = url;
  link.download = `${document.metadata.title.replace(/[^a-z0-9_-]+/gi, '-').slice(0, 80) || 'diagram'}.diagramed.json`;
  link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
}
