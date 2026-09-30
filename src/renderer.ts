import Konva from 'konva';
import { DocumentStore, type DiagramDocument, type Graphic } from './model';
import { renderMath } from './math';
import { displayedVector } from './physics';
import { vectorLatex } from './naming';
import { attachmentPoint, labelPosition } from './geometry';
export class DiagramRenderer {
  readonly stage: Konva.Stage;
  private grid = new Konva.Layer({ listening: false });
  private layer = new Konva.Layer();
  private controls = new Konva.Layer();
  private origins = new Konva.Layer({listening:false});
  private transformer = new Konva.Transformer({ rotateEnabled: true, ignoreStroke: true, padding: 4, anchorSize: 12 });
  private nodes = new Map<string, Konva.Shape>();
  private labels = new Map<string, Konva.Group>();
  selectedId: string | null = null;
  onEdit: (element: Graphic) => void = () => {};
  onSelect: (element: Graphic | null) => void = () => {};
  private symbols(e: Graphic, doc = this.store.document) {
    if(e.vectorId){const v=doc.semantics.vectors.find(v=>v.id===e.vectorId);return doc.semantics.variables.find(variable=>variable.id===v?.variableId)?.symbol ? vectorLatex(doc.semantics.variables.find(variable=>variable.id===v?.variableId)!.symbol) : '';}
    const object = doc.semantics.objects.find(o => o.id === e.semanticId);
    return Object.values(object?.properties || {}).map(id => doc.semantics.variables.find(v => v.id === id)?.symbol).filter(Boolean).join(',\\; ');
  }
  constructor(private store: DocumentStore, private container: HTMLDivElement) {
    this.stage = new Konva.Stage({ container, width: 800, height: 600 });
    this.stage.add(this.grid, this.layer, this.origins, this.controls);
    this.controls.add(this.transformer);
    this.stage.on('click tap', e => { if (e.target === this.stage) this.select(null); });
    new ResizeObserver(() => this.fit()).observe(container);
  }
  private snap(v: number) { const size = this.store.document.presentation.grid.size; return Math.round(v / size) * size; }
  fit() {
    const { width, height } = this.store.document.presentation.canvas;
    const scale = Math.min(this.container.clientWidth / width, this.container.clientHeight / height);
    if (scale <= 0) return;
    this.stage.size({ width: width * scale, height: height * scale }); this.stage.scale({ x: scale, y: scale }); this.origins.find<Konva.Circle>('Circle').forEach(dot=>dot.radius(3.5/scale));this.stage.batchDraw();
  }
  async prepare(doc: DiagramDocument) {
    await Promise.all(doc.presentation.elements.filter(e => e.kind === 'latex').map(e => renderMath(e.latex, e.fontSize)));
    await Promise.all(doc.presentation.elements.filter(e => (e.semanticId || e.vectorId) && e.visible !== false && e.label?.showProperties && this.symbols(e, doc)).map(e => renderMath(this.symbols(e, doc), 16)));
  }
  async render() {
    await this.prepare(this.store.document);
    this.select(null); this.layer.destroyChildren(); this.nodes.clear(); this.labels.clear(); this.grid.destroyChildren();
    const { canvas, grid, elements } = this.store.document.presentation;
    for (let x = 0; x < canvas.width; x += grid.size) this.grid.add(new Konva.Line({ points: [x, 0, x, canvas.height], stroke: '#eee', strokeWidth: 1 }));
    for (let y = 0; y < canvas.height; y += grid.size) this.grid.add(new Konva.Line({ points: [0, y, canvas.width, y], stroke: '#eee', strokeWidth: 1 }));
    this.grid.visible(grid.visible);
    for (const e of [...elements.filter(e=>e.kind==='surface'),...elements.filter(e=>e.kind!=='surface')]) await this.addNode(e);
    this.refreshOrigins(this.store.document);this.fit(); this.stage.draw();
  }
  async addNode(record: Graphic) {
    let e=record; if(e.vectorId){const v=this.store.document.semantics.vectors.find(v=>v.id===e.vectorId);if(!v)return;const shown=displayedVector(this.store.document,v,e);if(!shown)return;e=shown;}
    if (e.visible === false) return;
    const base = { id: e.id, x: e.x, y: e.y, rotation: e.rotation, scaleX: e.scaleX, scaleY: e.scaleY, stroke: e.stroke, strokeWidth: e.strokeWidth, strokeScaleEnabled: !e.semanticId, fill: e.fill, draggable: true };
    let node: Konva.Shape;
    if(e.kind==='surface'){
      node=new Konva.Rect({...base,width:e.width,height:e.height,draggable:true});
      node.hitFunc((context,shape)=>{context.beginPath();context.rect(0,-10,e.width,20);context.closePath();context.fillStrokeShape(shape);});
      const physical=this.store.document.semantics.objects.find(o=>o.id===e.semanticId);
      if(physical?.category==='chargedPlate')node.sceneFunc((context,shape)=>{const rect=shape as Konva.Rect;context.beginPath();context.rect(0,0,rect.width(),rect.height());context.closePath();context.fillStrokeShape(shape);context.setAttr('fillStyle','#555');context.setAttr('font','18px Arial');for(let x=20;x<rect.width();x+=40)context.fillText(physical.polarity==='negative'?'−':'+',x,24);});
    }
    else if(['spring','cable'].includes(e.kind)){node=new Konva.Line({...base,points:e.points,hitStrokeWidth:20});if(e.kind==='spring')node.sceneFunc((context,shape)=>{const [x1,y1,x2,y2]=(shape as Konva.Line).points(),dx=x2-x1,dy=y2-y1,len=Math.hypot(dx,dy)||1;context.beginPath();context.moveTo(x1,y1);for(let i=1;i<16;i++){const t=i/16,offset=i%2?7:-7;context.lineTo(x1+dx*t-dy/len*offset,y1+dy*t+dx/len*offset);}context.lineTo(x2,y2);context.strokeShape(shape);});}
    else if (e.kind === 'rectangle') node = new Konva.Rect({ ...base, width: e.width, height: e.height });
    else if (e.kind === 'circle' || e.kind === 'point') node = new Konva.Circle({ ...base, radius: e.radius, hitStrokeWidth: e.kind === 'point' ? 28 : 2 });
    else if (e.kind === 'line') node = new Konva.Line({ ...base, points: e.points, hitStrokeWidth: 20 });
    else if (e.kind === 'arrow' || e.kind === 'dashedArrow') node = new Konva.Arrow({ ...base, points: e.points, fill: e.stroke, pointerLength: 10, pointerWidth: 10, hitStrokeWidth: 20, dash: e.kind === 'dashedArrow' ? [6, 4] : [] });
    else if (e.kind === 'text') node = new Konva.Text({ ...base, strokeWidth: 0, stroke: undefined, text: e.text, fontSize: e.fontSize, fontFamily: e.fontFamily });
    else { const image = await renderMath(e.latex, e.fontSize); node = new Konva.Image({ ...base, fill: undefined, stroke: undefined, strokeWidth: 0, image, width: image.width / 2, height: image.height / 2 }); }
    this.nodes.set(e.id, node); this.layer.add(node);
    if (e.kind === 'point') {
      node.hitStrokeWidth(0);
      node.hitFunc((context, shape) => {
        context.beginPath(); context.arc(0, 0, 22 / this.stage.scaleX(), 0, Math.PI * 2, false); context.closePath(); context.fillStrokeShape(shape);
      });
    }
    if (e.semanticId || e.vectorId) await this.addLabel(e); if(e.vectorId)node.draggable(false);
    node.on('click tap', () => this.select(e.id));
    node.on('dblclick dbltap', () => { if (e.semanticId || e.vectorId || e.kind === 'text' || e.kind === 'latex') this.onEdit(this.element(e.id)!); });
    node.on('dragmove', () => { if(e.kind==='surface'){node.position({x:0,y:Math.max(0,Math.min(this.store.document.presentation.canvas.height-20,this.snap(node.y())))});(node as Konva.Rect).height(this.store.document.presentation.canvas.height-node.y());}else node.position({ x: this.snap(node.x()), y: this.snap(node.y()) }); this.positionLabel(e.id); this.refreshAttachments(); });
    node.on('dragend', () => { this.store.update(e.id, { x: node.x(), y: node.y(),...(e.kind==='surface'?{height:this.store.document.presentation.canvas.height-node.y()}: {}) }); this.select(e.id); });
    node.on('transformend', () => {
      const patch = { x: this.snap(node.x()), y: this.snap(node.y()), rotation: node.rotation(), scaleX: node.scaleX(), scaleY: node.scaleY(), ...(node instanceof Konva.Line?{points:node.points() as Graphic['points']}:{}) };
      node.position({ x: patch.x, y: patch.y }); this.store.update(e.id, patch); this.positionLabel(e.id); this.refreshAttachments(); this.select(e.id);
    });
    node.on('transform', () => {this.positionLabel(e.id);this.refreshAttachments();});
    this.layer.draw();
  }
  private currentGraphic(id: string): Graphic {
    const e = this.element(id)!, node = this.nodes.get(id)!;
    return { ...e, x: node.x(), y: node.y(), rotation: node.rotation(), scaleX: node.scaleX(), scaleY: node.scaleY(), ...(node instanceof Konva.Line?{points:node.points() as Graphic['points']}:{}) };
  }
  private positionLabel(id: string) {
    const e = this.element(id), label = this.labels.get(id); if (!e || !label) return;
    const size=label.getClientRect({skipTransform:true});
    label.position(labelPosition(this.currentGraphic(id),size.width,size.height));
  }
  private async addLabel(e: Graphic) {
    const object = this.store.document.semantics.objects.find(o => o.id === e.semanticId);
    if ((!object && !e.vectorId) || !e.label || (!e.label.showName && !e.label.showProperties)) return;
    const group = new Konva.Group({ draggable: true,name:'semantic-label',graphicId:e.id });
    const symbols = e.label.showProperties ? this.symbols(e) : '';
    let text:Konva.Text|undefined;
    if(e.label.showName && object){text=new Konva.Text({text:object.name+(symbols?', ':''),fontSize:16,fontFamily:'Arial',fill:'#222',hitStrokeWidth:8});group.add(text);}
    if(symbols){const image=await renderMath(symbols,16);group.add(new Konva.Image({image,width:image.width/2,height:image.height/2,x:text?.width()||0,y:0,math:symbols}));if(text)text.y(Math.max(0,(image.height/2-text.height())/2));}
    this.labels.set(e.id, group); this.layer.add(group); this.positionLabel(e.id);
    group.on('click tap', () => this.select(e.id));
    group.on('dblclick dbltap', () => this.onEdit(this.element(e.id)!));
    group.on('dragend', () => { const current = this.element(e.id)!; const size=group.getClientRect({skipTransform:true}),anchor=labelPosition(this.currentGraphic(e.id),size.width,size.height,false); this.store.update(e.id, { label: { ...current.label!, offsetX: group.x() - anchor.x, offsetY: group.y() - anchor.y } }); this.select(e.id); });
  }
  private refreshAttachments(){
    const doc=structuredClone(this.store.document);for(const g of doc.presentation.elements)if(g.semanticId && this.nodes.has(g.id))Object.assign(g,this.currentGraphic(g.id));
    for(const g of doc.presentation.elements){if(!g.vectorId)continue;const v=doc.semantics.vectors.find(v=>v.id===g.vectorId),node=this.nodes.get(g.id);if(!v||!node)continue;const current=displayedVector(doc,v,g);if(!current)continue;node.position({x:current.x,y:current.y});(node as Konva.Line).points(current.points);this.positionLabel(g.id);}
    this.refreshOrigins(doc);
  }
  private refreshOrigins(doc:DiagramDocument){
    this.origins.destroyChildren();const counts=new Map<string,number>();
    for(const v of doc.semantics.vectors){const g=doc.presentation.elements.find(g=>g.vectorId===v.id);if(v.kind==='separation'||!v.objectId||!g||g.visible===false||!displayedVector(doc,v,g))continue;counts.set(v.objectId,(counts.get(v.objectId)||0)+1);}
    for(const [id,count]of counts){if(count<2)continue;const graphic=doc.presentation.elements.find(g=>g.semanticId===id);if(!graphic)continue;const point=attachmentPoint(graphic);this.origins.add(new Konva.Circle({name:'shared-origin',ownerObjectId:id,x:point.x,y:point.y,radius:3.5/(this.stage.scaleX()||1),fill:'#000',listening:false}));}
    this.origins.batchDraw();
  }
  private element(id: string) { return this.store.document.presentation.elements.find(e => e.id === id); }
  select(id: string | null) {
    const old = this.selectedId && this.nodes.get(this.selectedId);
    if (old) { const e = this.element(this.selectedId!); if (e && !['text', 'latex'].includes(e.kind)) old.stroke(e.stroke); old.draggable(!e?.vectorId); }
    this.controls.destroyChildren(); this.transformer = new Konva.Transformer({ rotateEnabled: true, ignoreStroke: true, padding: 4, anchorSize: 12 }); this.controls.add(this.transformer);
    this.selectedId = id;
    this.onSelect(id ? this.element(id) || null : null);
    if (!id) { this.stage.batchDraw(); return; }
    const e = this.element(id), node = this.nodes.get(id);
    if (!e || !node) return;
    if (['line', 'arrow', 'dashedArrow','spring','cable'].includes(e.kind)) {
      node.stroke('orange'); node.draggable(false);
      const v=e.vectorId && this.store.document.semantics.vectors.find(v=>v.id===e.vectorId);
      for (const index of v ? (v.kind==='separation'||v.role==='resultant'?[]:[2]) : [0,2]) {
        const abs = node.getAbsoluteTransform().copy(); const scale = this.stage.scaleX();
        const p = abs.point({ x: (node as Konva.Line).points()[index], y: (node as Konva.Line).points()[index + 1] });
        const handle = new Konva.Circle({ x: p.x / scale, y: p.y / scale, radius: 6, fill: '#ff0', stroke: '#000', strokeWidth: 1, draggable: true });
        const hit = new Konva.Circle({ x: handle.x(), y: handle.y(), radius: 16, fill: 'rgba(0,0,0,0.01)', draggable: true });
        const move = (target: Konva.Circle) => {
          target.position({ x: this.snap(target.x()), y: this.snap(target.y()) });
          handle.position(target.position()); hit.position(target.position());
          const local = node.getAbsoluteTransform().copy().invert().point({ x: target.x() * scale, y: target.y() * scale });
          const points = [...this.element(id)!.points] as Graphic['points']; points[index] = local.x; points[index + 1] = local.y;
          if(v && v.role==='friction'){const normal=this.store.document.semantics.vectors.find(n=>n.interactionId===v.interactionId && n.role==='normal');const ng=normal && this.store.document.presentation.elements.find(g=>g.vectorId===normal.id);if(ng){const a=Math.atan2(ng.points[3],ng.points[2])+Math.PI/2,ux=Math.cos(a),uy=Math.sin(a),length=Math.max(20,local.x*ux+local.y*uy);points[2]=ux*length;points[3]=uy*length;const absolute=node.getAbsoluteTransform().point({x:points[2],y:points[3]});handle.position({x:absolute.x/scale,y:absolute.y/scale});hit.position(handle.position());}}
          (node as Konva.Line).points(points); this.store.update(id, { points }); this.refreshAttachments(); this.stage.batchDraw();
        };
        handle.on('dragmove', () => move(handle)); hit.on('dragmove', () => move(hit));
        this.controls.add(handle, hit);
      }
    } else if (e.kind === 'surface' || e.kind === 'point') { node.stroke('orange'); } else {
      if (e.kind !== 'text' && e.kind !== 'latex') node.stroke('orange');
      this.transformer.keepRatio(e.kind !== 'rectangle');
      if (e.kind === 'circle' && e.semanticId) this.transformer.enabledAnchors(['top-left','top-right','bottom-left','bottom-right']);
      this.transformer.nodes([node]);
    }
    this.stage.batchDraw();
  }
  deleteSelected() { if (this.selectedId) { const id = this.selectedId; if (this.element(id)?.semanticId || this.element(id)?.vectorId) throw new Error('Semantic objects must be deleted through the object operations.'); this.select(null); this.nodes.get(id)?.destroy(); this.labels.get(id)?.destroy(); this.nodes.delete(id); this.labels.delete(id); this.store.remove(id); this.stage.draw(); } }
  toggleGrid() { const p = this.store.document.presentation; p.grid.visible = !p.grid.visible; this.grid.visible(p.grid.visible); this.store.changed(); this.stage.draw(); }
}
