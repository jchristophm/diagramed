import { emptySemantics, type Semantics } from './semantics';
export type ElementKind = 'surface' | 'spring' | 'cable' | 'rectangle' | 'circle' | 'point' | 'line' | 'arrow' | 'dashedArrow' | 'text' | 'latex';
export interface Graphic {
  id: string; kind: ElementKind; semanticId?: string; vectorId?: string;
  x: number; y: number; rotation: number; scaleX: number; scaleY: number;
  width: number; height: number; radius: number; points: [number, number, number, number];
  stroke: string; fill: string; strokeWidth: number;
  text: string; latex: string; fontSize: number; fontFamily: string;
  visible?: boolean;
  showComponents?: boolean;
  decompositionLabels?: { components?: Partial<Record<'x' | 'y', [number, number]>>; angles?: Partial<Record<'x' | 'y', [number, number]>> };
  // Dormant arrow geometry for returning a known-zero motion label to an arrow.
  motionArrowPoints?: [number, number, number, number];
  label?: { placement?: 'objectCenter'|'vectorTip'; showName: boolean; showProperties: boolean; offsetX: number; offsetY: number };
}
export interface DiagramDocument {
  format: 'diagramed'; version: 3; id: string;
  metadata: { title: string; createdAt: string; updatedAt: string };
  semantics: Semantics;
  presentation: { canvas: { width: number; height: number; minX?: number; minY?: number; coordinateSpace?: 'grid' }; grid: { size: number; visible: boolean }; elements: Graphic[] };
}
export function newDocument(width = 3200, height = 2400): DiagramDocument {
  const now = new Date().toISOString();
  return { format: 'diagramed', version: 3, id: crypto.randomUUID(), metadata: { title: 'Untitled diagram', createdAt: now, updatedAt: now }, semantics: emptySemantics(), presentation: { canvas: { width, height, minX: -width / 2, minY: -height / 2, coordinateSpace: 'grid' }, grid: { size: 10, visible: true }, elements: [] } };
}
export function newGraphic(kind: ElementKind, doc: DiagramDocument): Graphic {
  const { width, height } = doc.presentation.canvas;
  const snap = (v: number) => Math.round(v / doc.presentation.grid.size) * doc.presentation.grid.size;
  const offset = (doc.presentation.elements.filter(e => e.semanticId).length % 8) * doc.presentation.grid.size;
  const x = snap(doc.presentation.canvas.coordinateSpace ? offset : width / 2), y = snap(doc.presentation.canvas.coordinateSpace ? offset : height / 2);
  return { id: crypto.randomUUID(), kind, x: kind === 'rectangle' ? x - 20 : x, y: kind === 'rectangle' ? y - 20 : y,
    rotation: 0, scaleX: 1, scaleY: 1, width: 40, height: 40, radius: 20,
    points: kind === 'dashedArrow' ? [0, 0, 0, -80] : kind === 'line' ? [-80, 0, 80, 0] : [0, 0, 80, 0],
    stroke: kind === 'rectangle' ? 'blue' : kind === 'circle' ? 'green' : kind === 'arrow' ? 'red' : kind === 'dashedArrow' ? '#666' : 'black',
    fill: kind === 'text' || kind === 'latex' ? 'black' : 'transparent', strokeWidth: kind.includes('Arrow') || kind === 'arrow' ? 3 : 2,
    text: 'Label', latex: '', fontSize: 20, fontFamily: 'Arial' };
}
export class DocumentStore {
  document: DiagramDocument;
  private past: DiagramDocument[] = [];
  private future: DiagramDocument[] = [];
  private committed: DiagramDocument;
  private saved: string;
  private depth = 0;
  readonly historyLimit = 100;
  private listeners = new Set<() => void>();
  constructor(document = newDocument()) { this.document = structuredClone(document); this.committed = structuredClone(document); this.saved = documentContent(document); }
  get canUndo() { return !this.depth && this.past.length > 0; }
  get canRedo() { return !this.depth && this.future.length > 0; }
  get dirty() { return documentContent(this.document) !== this.saved; }
  get inTransaction() { return this.depth > 0; }
  beginTransaction() { this.depth++; this.notify(); }
  endTransaction() { if (this.depth && --this.depth === 0) this.commit(); }
  transaction<T>(edit: () => T): T {
    this.beginTransaction();
    try { const result = edit(); this.endTransaction(); return result; }
    catch (error) { this.cancelTransaction(); throw error; }
  }
  cancelTransaction() { this.depth = 0; this.document = structuredClone(this.committed); this.notify(); }
  private commit() {
    if (documentContent(this.document) !== documentContent(this.committed)) {
      this.past.push(this.committed); if (this.past.length > this.historyLimit) this.past.shift();
      this.future = []; this.committed = structuredClone(this.document);
    }
    this.notify();
  }
  undo() {
    if (!this.canUndo) return false;
    this.future.push(this.committed); this.committed = this.past.pop()!;
    this.document = structuredClone(this.committed); this.notify(); return true;
  }
  redo() {
    if (!this.canRedo) return false;
    this.past.push(this.committed); this.committed = this.future.pop()!;
    this.document = structuredClone(this.committed); this.notify(); return true;
  }
  markSaved() { this.saved = documentContent(this.document); this.notify(); }
  load(document: DiagramDocument) { this.document = structuredClone(document); this.resetHistory(); }
  resetHistory() {
    this.depth = 0; this.past = []; this.future = [];
    this.committed = structuredClone(this.document);
    this.saved = documentContent(this.document); this.notify();
  }
  subscribe(fn: () => void) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  private notify() { this.listeners.forEach(fn => fn()); }
  changed() { this.document.metadata.updatedAt = new Date().toISOString(); if (this.depth) this.notify(); else this.commit(); }
  replace(document: DiagramDocument) { this.document = structuredClone(document); if (this.depth) this.notify(); else this.commit(); }
  add(element: Graphic) { this.document.presentation.elements.push(structuredClone(element)); this.changed(); }
  update(id: string, patch: Partial<Graphic>) { const e = this.document.presentation.elements.find(e => e.id === id); if (e) { Object.assign(e, patch); this.changed(); } }
  remove(id: string) { this.document.presentation.elements = this.document.presentation.elements.filter(e => e.id !== id); this.changed(); }
}
// Ignore edit timestamps and ordering of semantic records, neither of which is
// a user edit. Presentation array order remains significant (canvas stacking).
export function documentContent(document: DiagramDocument): string {
  const canonical = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).sort(([a],[b]) => a.localeCompare(b)).map(([key,v]) => [key,canonical(v)]));
    return value;
  };
  const copy = structuredClone(document); copy.metadata.updatedAt = '';
  for(const c of copy.semantics.coordinateSystems){c.reverseX??=false;c.reverseY??=false;c.visible??=true;}
  for(const g of copy.presentation.elements){g.visible??=true;if(g.vectorId)g.showComponents??=true;}
  for (const records of Object.values(copy.semantics)) if (Array.isArray(records)) records.sort((a,b) => a.id.localeCompare(b.id));
  return JSON.stringify(canonical(copy));
}
