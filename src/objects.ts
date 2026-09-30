import { DocumentStore, newGraphic, type Graphic } from './model';
import { attachmentPoint } from './geometry';
export type Representation = 'circle' | 'rectangle' | 'point' | 'none';
export interface ObjectDraft { id?: string; name: string; representation: Representation; showName: boolean; showProperties: boolean }
export function objectGraphic(store: DocumentStore, id: string) { return store.document.presentation.elements.find(e => e.semanticId === id); }
export function saveObject(store: DocumentStore, draft: ObjectDraft): string {
  const name = draft.name.trim(); if (!name) throw new Error('Give this object a name.');
  if (name.length > 120) throw new Error('Object names must be 120 characters or shorter.');
  const next = structuredClone(store.document);
  const existing = draft.id ? next.semantics.objects.find(o => o.id === draft.id) : undefined;
  if (draft.id && !existing) throw new Error('This object no longer exists.');
  const id = existing?.id || crypto.randomUUID();
  if (existing) existing.name = name; else next.semantics.objects.push({ id, name, properties: {} });
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
  if (next.semantics.vectors.some(v => ownedIds.has(v.variableId)) || next.semantics.components.some(c => ownedIds.has(c.variableId))) throw new Error('Remove dependent variable references before deleting this object.');
  next.semantics.objects = next.semantics.objects.filter(o => o.id !== id);
  next.semantics.variables = next.semantics.variables.filter(v => !ownedIds.has(v.id));
  next.presentation.elements = next.presentation.elements.filter(e => e.semanticId !== id);
  next.metadata.updatedAt = new Date().toISOString(); store.replace(next);
}
export function objectDraft(store: DocumentStore, id?: string): ObjectDraft {
  const object = store.document.semantics.objects.find(o => o.id === id), g = id ? objectGraphic(store, id) : undefined;
  return { id, name: object?.name || '', representation: g?.visible === false ? 'none' : (g?.kind as Representation) || 'circle', showName: g?.label?.showName ?? true, showProperties: g?.label?.showProperties ?? true };
}
