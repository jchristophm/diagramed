import { emptySemantics, type Semantics } from './semantics';
export type ElementKind = 'surface' | 'spring' | 'cable' | 'rectangle' | 'circle' | 'point' | 'line' | 'arrow' | 'dashedArrow' | 'text' | 'latex';
export interface Graphic {
  id: string; kind: ElementKind; semanticId?: string; vectorId?: string;
  x: number; y: number; rotation: number; scaleX: number; scaleY: number;
  width: number; height: number; radius: number; points: [number, number, number, number];
  stroke: string; fill: string; strokeWidth: number;
  text: string; latex: string; fontSize: number; fontFamily: string;
  visible?: boolean;
  label?: { showName: boolean; showProperties: boolean; offsetX: number; offsetY: number };
}
export interface DiagramDocument {
  format: 'diagramed'; version: 3; id: string;
  metadata: { title: string; createdAt: string; updatedAt: string };
  semantics: Semantics;
  presentation: { canvas: { width: number; height: number }; grid: { size: number; visible: boolean }; elements: Graphic[] };
}
export function newDocument(width = 800, height = 600): DiagramDocument {
  const now = new Date().toISOString();
  return { format: 'diagramed', version: 3, id: crypto.randomUUID(), metadata: { title: 'Untitled diagram', createdAt: now, updatedAt: now }, semantics: emptySemantics(), presentation: { canvas: { width, height }, grid: { size: 20, visible: true }, elements: [] } };
}
export function newGraphic(kind: ElementKind, doc: DiagramDocument): Graphic {
  const { width, height } = doc.presentation.canvas;
  const snap = (v: number) => Math.round(v / doc.presentation.grid.size) * doc.presentation.grid.size;
  const x = snap(width / 2), y = snap(height / 2);
  return { id: crypto.randomUUID(), kind, x: kind === 'rectangle' ? x - 20 : x, y: kind === 'rectangle' ? y - 20 : y,
    rotation: 0, scaleX: 1, scaleY: 1, width: 40, height: 40, radius: 20,
    points: kind === 'dashedArrow' ? [0, 0, 0, -80] : kind === 'line' ? [-80, 0, 80, 0] : [0, 0, 80, 0],
    stroke: kind === 'rectangle' ? 'blue' : kind === 'circle' ? 'green' : kind === 'arrow' ? 'red' : kind === 'dashedArrow' ? '#666' : 'black',
    fill: kind === 'text' || kind === 'latex' ? 'black' : 'transparent', strokeWidth: kind.includes('Arrow') || kind === 'arrow' ? 3 : 2,
    text: 'Label', latex: '', fontSize: 20, fontFamily: 'Arial' };
}
export class DocumentStore {
  document: DiagramDocument;
  private listeners = new Set<() => void>();
  constructor(document = newDocument()) { this.document = structuredClone(document); }
  subscribe(fn: () => void) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  private notify() { this.listeners.forEach(fn => fn()); }
  changed() { this.document.metadata.updatedAt = new Date().toISOString(); this.notify(); }
  replace(document: DiagramDocument) { this.document = structuredClone(document); this.notify(); }
  add(element: Graphic) { this.document.presentation.elements.push(structuredClone(element)); this.changed(); }
  update(id: string, patch: Partial<Graphic>) { const e = this.document.presentation.elements.find(e => e.id === id); if (e) { Object.assign(e, patch); this.changed(); } }
  remove(id: string) { this.document.presentation.elements = this.document.presentation.elements.filter(e => e.id !== id); this.changed(); }
}
