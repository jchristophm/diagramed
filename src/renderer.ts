import Konva from 'konva';
import { DocumentStore, type DiagramDocument, type Graphic } from './model';
import { renderMath } from './math';
export class DiagramRenderer {
  readonly stage: Konva.Stage;
  private grid = new Konva.Layer({ listening: false });
  private layer = new Konva.Layer();
  private controls = new Konva.Layer();
  private transformer = new Konva.Transformer({ rotateEnabled: true, ignoreStroke: true, padding: 4, anchorSize: 12 });
  private nodes = new Map<string, Konva.Shape>();
  selectedId: string | null = null;
  onEdit: (element: Graphic) => void = () => {};
  constructor(private store: DocumentStore, private container: HTMLDivElement) {
    this.stage = new Konva.Stage({ container, width: 800, height: 600 });
    this.stage.add(this.grid, this.layer, this.controls);
    this.controls.add(this.transformer);
    this.stage.on('click tap', e => { if (e.target === this.stage) this.select(null); });
    new ResizeObserver(() => this.fit()).observe(container);
  }
  private snap(v: number) { const size = this.store.document.presentation.grid.size; return Math.round(v / size) * size; }
  fit() {
    const { width, height } = this.store.document.presentation.canvas;
    const scale = Math.min(this.container.clientWidth / width, this.container.clientHeight / height);
    if (scale <= 0) return;
    this.stage.size({ width: width * scale, height: height * scale }); this.stage.scale({ x: scale, y: scale }); this.stage.batchDraw();
  }
  async prepare(doc: DiagramDocument) {
    await Promise.all(doc.presentation.elements.filter(e => e.kind === 'latex').map(e => renderMath(e.latex, e.fontSize)));
  }
  async render() {
    await this.prepare(this.store.document);
    this.select(null); this.layer.destroyChildren(); this.nodes.clear(); this.grid.destroyChildren();
    const { canvas, grid, elements } = this.store.document.presentation;
    for (let x = 0; x < canvas.width; x += grid.size) this.grid.add(new Konva.Line({ points: [x, 0, x, canvas.height], stroke: '#eee', strokeWidth: 1 }));
    for (let y = 0; y < canvas.height; y += grid.size) this.grid.add(new Konva.Line({ points: [0, y, canvas.width, y], stroke: '#eee', strokeWidth: 1 }));
    this.grid.visible(grid.visible);
    for (const e of elements) await this.addNode(e);
    this.fit(); this.stage.draw();
  }
  async addNode(e: Graphic) {
    const base = { id: e.id, x: e.x, y: e.y, rotation: e.rotation, scaleX: e.scaleX, scaleY: e.scaleY, stroke: e.stroke, strokeWidth: e.strokeWidth, fill: e.fill, draggable: true };
    let node: Konva.Shape;
    if (e.kind === 'rectangle') node = new Konva.Rect({ ...base, width: e.width, height: e.height });
    else if (e.kind === 'circle') node = new Konva.Circle({ ...base, radius: e.radius });
    else if (e.kind === 'line') node = new Konva.Line({ ...base, points: e.points, hitStrokeWidth: 20 });
    else if (e.kind === 'arrow' || e.kind === 'dashedArrow') node = new Konva.Arrow({ ...base, points: e.points, fill: e.stroke, pointerLength: 10, pointerWidth: 10, hitStrokeWidth: 20, dash: e.kind === 'dashedArrow' ? [6, 4] : [] });
    else if (e.kind === 'text') node = new Konva.Text({ ...base, strokeWidth: 0, stroke: undefined, text: e.text, fontSize: e.fontSize, fontFamily: e.fontFamily });
    else { const image = await renderMath(e.latex, e.fontSize); node = new Konva.Image({ ...base, stroke: undefined, strokeWidth: 0, image, width: image.width / 2, height: image.height / 2 }); }
    this.nodes.set(e.id, node); this.layer.add(node);
    node.on('click tap', () => this.select(e.id));
    node.on('dblclick dbltap', () => { if (e.kind === 'text' || e.kind === 'latex') this.onEdit(this.element(e.id)!); });
    node.on('dragmove', () => { node.position({ x: this.snap(node.x()), y: this.snap(node.y()) }); });
    node.on('dragend', () => { this.store.update(e.id, { x: node.x(), y: node.y() }); this.select(e.id); });
    node.on('transformend', () => {
      const patch = { x: this.snap(node.x()), y: this.snap(node.y()), rotation: node.rotation(), scaleX: node.scaleX(), scaleY: node.scaleY() };
      node.position({ x: patch.x, y: patch.y }); this.store.update(e.id, patch); this.select(e.id);
    });
    this.layer.draw();
  }
  private element(id: string) { return this.store.document.presentation.elements.find(e => e.id === id); }
  select(id: string | null) {
    const old = this.selectedId && this.nodes.get(this.selectedId);
    if (old) { const e = this.element(this.selectedId!); if (e && !['text', 'latex'].includes(e.kind)) old.stroke(e.stroke); old.draggable(true); }
    this.controls.destroyChildren(); this.transformer = new Konva.Transformer({ rotateEnabled: true, ignoreStroke: true, padding: 4, anchorSize: 12 }); this.controls.add(this.transformer);
    this.selectedId = id;
    if (!id) { this.stage.batchDraw(); return; }
    const e = this.element(id), node = this.nodes.get(id);
    if (!e || !node) return;
    if (['line', 'arrow', 'dashedArrow'].includes(e.kind)) {
      node.stroke('orange'); node.draggable(false);
      for (const index of [0, 2]) {
        const abs = node.getAbsoluteTransform().copy(); const scale = this.stage.scaleX();
        const p = abs.point({ x: e.points[index], y: e.points[index + 1] });
        const handle = new Konva.Circle({ x: p.x / scale, y: p.y / scale, radius: 6, fill: '#ff0', stroke: '#000', strokeWidth: 1, draggable: true });
        const hit = new Konva.Circle({ x: handle.x(), y: handle.y(), radius: 16, fill: 'rgba(0,0,0,0.01)', draggable: true });
        const move = (target: Konva.Circle) => {
          target.position({ x: this.snap(target.x()), y: this.snap(target.y()) });
          handle.position(target.position()); hit.position(target.position());
          const local = node.getAbsoluteTransform().copy().invert().point({ x: target.x() * scale, y: target.y() * scale });
          const points = [...this.element(id)!.points] as Graphic['points']; points[index] = local.x; points[index + 1] = local.y;
          (node as Konva.Line).points(points); this.store.update(id, { points }); this.stage.batchDraw();
        };
        handle.on('dragmove', () => move(handle)); hit.on('dragmove', () => move(hit));
        this.controls.add(handle, hit);
      }
    } else { if (e.kind !== 'text' && e.kind !== 'latex') node.stroke('orange'); this.transformer.nodes([node]); }
    this.stage.batchDraw();
  }
  deleteSelected() { if (this.selectedId) { const id = this.selectedId; this.select(null); this.nodes.get(id)?.destroy(); this.nodes.delete(id); this.store.remove(id); this.stage.draw(); } }
  toggleGrid() { const p = this.store.document.presentation; p.grid.visible = !p.grid.visible; this.grid.visible(p.grid.visible); this.store.changed(); this.stage.draw(); }
}
