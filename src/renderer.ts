import {componentAngleGeometry,componentAngleLabel,clearChangedComponentAngles} from './component-angles';
import {quantityLabel} from './quantity-labels';
import Konva from 'konva';
import { coordinateBasis, graphicalComponents, deleteCoordinates, clearComponentAngleDefinitions } from './coordinates';
import { DocumentStore, type DiagramDocument, type Graphic } from './model';
import { renderMath } from './math';
import { displayedVector, isZeroMotionVector, zeroMotionLabelGraphic } from './physics';
import { vectorLatex } from './naming';
import { attachmentPoint, labelPosition, effectiveLabel } from './geometry';
export class DiagramRenderer {
  readonly stage: Konva.Stage;
  private grid = new Konva.Layer({ listening: false });
  private layer = new Konva.Layer();
  private controls = new Konva.Layer();
  private coordinates = new Konva.Layer();
  private components = new Konva.Layer();
  private componentRevision = 0;
  private activeVectorId: string | null = null;
  onCoordinateEdit: () => void = () => {};
  private origins = new Konva.Layer({listening:false});
  private transformer = new Konva.Transformer({ rotateEnabled: true, ignoreStroke: true, padding: 4, anchorSize: 12 });
  private nodes = new Map<string, Konva.Shape>();
  private labels = new Map<string, Konva.Group>();
  selectedId: string | null = null;
  onEdit: (element: Graphic) => void = () => {};
  onSelect: (element: Graphic | null) => void = () => {};
  private symbols(e: Graphic, doc = this.store.document) {
    if(e.vectorId){const v=doc.semantics.vectors.find(v=>v.id===e.vectorId),m=doc.semantics.variables.find(variable=>variable.id===v?.variableId);return m ? quantityLabel(m,v&&isZeroMotionVector(doc,v)?m.symbol:vectorLatex(m.symbol)) : '';}
    const object = doc.semantics.objects.find(o => o.id === e.semanticId);
    return Object.values(object?.properties || {}).map(id => quantityLabel(doc.semantics.variables.find(v => v.id === id))).filter(Boolean).join(',\\; ');
  }

  zoom = 1;
  onViewChange: () => void = () => {};
  private viewport: HTMLElement;
  private extent: HTMLElement;
  private viewDocumentId = '';
  private pinch?: { distance: number; zoom: number; x: number; y: number };
  constructor(private store: DocumentStore, private container: HTMLDivElement) {
    this.viewport = container.parentElement!; this.extent = document.querySelector<HTMLElement>('#document-extent')!;
    this.stage = new Konva.Stage({ container, width: 800, height: 600 });
    this.stage.add(this.grid, this.layer, this.components, this.coordinates, this.origins, this.controls);
    this.controls.add(this.transformer);
    this.stage.on('click tap', e => { if (e.target === this.stage) this.select(null); });
    new ResizeObserver(() => this.fit()).observe(this.viewport);
    this.viewport.addEventListener('scroll', () => this.applyView());
    container.addEventListener('touchstart', e => this.touchView(e), {passive:false,capture:true});
    container.addEventListener('touchmove', e => this.touchView(e), {passive:false,capture:true});
    for(const event of ['touchend','touchcancel'])container.addEventListener(event, () => {this.pinch=undefined;}, {capture:true});
    const finishGesture=()=>{if(!this.store.inTransaction)return;this.stage.find('*').forEach(node=>{if(node.isDragging())node.stopDrag();});while(this.store.inTransaction)this.store.endTransaction();};
    window.addEventListener('pointercancel',finishGesture);window.addEventListener('touchcancel',finishGesture);window.addEventListener('blur',finishGesture);
  }
  private historyGesture(node: Konva.Node, transform = false) {
    node.on(transform?'dragstart.history transformstart.history':'dragstart.history',()=>this.store.beginTransaction());
    node.on(transform?'dragend.history transformend.history':'dragend.history',()=>this.store.endTransaction());
  }
  private snap(v: number) { const size = this.store.document.presentation.grid.size; return Math.round(v / size) * size; }
  fit() {
    const { width, height, minX=0, minY=0 } = this.store.document.presentation.canvas;
    const w=this.viewport.clientWidth,h=this.viewport.clientHeight;if(!w || !h)return;
    this.container.style.width=`${w}px`;this.container.style.height=`${h}px`;
    this.stage.size({width:w,height:h});
    this.extent.style.width=`${Math.max(w,width*this.zoom)}px`;
    this.extent.style.height=`${Math.max(h,height*this.zoom)}px`;
    if(this.viewDocumentId!==this.store.document.id){
      this.viewDocumentId=this.store.document.id;
      this.viewport.scrollLeft=-minX*this.zoom-w/2;
      this.viewport.scrollTop=-minY*this.zoom-h/2;
    }
    this.applyView();
  }
  private styleTransformer() {
    // Transformer chrome uses screen coordinates internally; make its visible
    // dimensions track document zoom while retaining invisible handle targets.
    this.transformer.anchorSize(12*this.zoom);this.transformer.padding(4*this.zoom);
    this.transformer.borderStrokeWidth(this.zoom);this.transformer.anchorStrokeWidth(this.zoom);
    this.transformer.rotateAnchorOffset(50*this.zoom);this.transformer.forceUpdate();
    this.transformer.find<Konva.Rect>('._anchor').forEach(anchor=>anchor.hitStrokeWidth(20));
  }
  private applyView() {
    const {minX=0,minY=0}=this.store.document.presentation.canvas;
    this.stage.scale({x:this.zoom,y:this.zoom});
    this.stage.position({x:-minX*this.zoom-this.viewport.scrollLeft,y:-minY*this.zoom-this.viewport.scrollTop});
    this.stage.find<Konva.Shape>('Shape').forEach(shape => {if(!shape.hasName('_anchor') && (shape instanceof Konva.Line || shape instanceof Konva.Circle || shape instanceof Konva.Rect) && shape.getAttr('hitStrokeWidth') !== undefined && shape.getAttr('hitStrokeWidth') !== 'auto')shape.hitStrokeWidth(Math.max(shape.strokeWidth(),20/this.zoom));});
    this.styleTransformer();this.stage.batchDraw();this.onViewChange();
  }
  setZoom(value:number, focal={x:this.viewport.clientWidth/2,y:this.viewport.clientHeight/2}) {
    const {minX=0,minY=0}=this.store.document.presentation.canvas;
    const point=this.stage.getAbsoluteTransform().copy().invert().point(focal);
    this.zoom=Math.max(.5,Math.min(2,value));this.fit();
    this.viewport.scrollLeft=(point.x-minX)*this.zoom-focal.x;
    this.viewport.scrollTop=(point.y-minY)*this.zoom-focal.y;this.applyView();
  }
  private touchView(event:TouchEvent) {
    if(event.touches.length!==2)return;
    event.preventDefault();event.stopImmediatePropagation();
    const rect=this.container.getBoundingClientRect(),a=event.touches[0],b=event.touches[1];
    const x=(a.clientX+b.clientX)/2-rect.left,y=(a.clientY+b.clientY)/2-rect.top,distance=Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY);
    if(!this.pinch){
      this.stage.find('*').forEach(node=>{if(node.isDragging())node.stopDrag();});
      while(this.store.inTransaction)this.store.endTransaction();
      this.pinch={distance,zoom:this.zoom,x,y};return;
    }
    const previous=this.pinch;
    this.setZoom(previous.zoom*distance/Math.max(1,previous.distance),{x:previous.x,y:previous.y});
    this.viewport.scrollLeft+=previous.x-x;this.viewport.scrollTop+=previous.y-y;this.applyView();
    this.pinch={distance,zoom:this.zoom,x,y};
  }
  async prepare(doc: DiagramDocument) {
    await Promise.all(doc.presentation.elements.filter(e => e.kind === 'latex').map(e => renderMath(e.latex, e.fontSize)));
    await Promise.all(doc.presentation.elements.filter(e => (e.semanticId || e.vectorId) && e.visible !== false && e.label?.showProperties && this.symbols(e, doc)).map(e => renderMath(this.symbols(e, doc), 16)));
  }
  async render() {
    const previousActiveVector=this.activeVectorId,previousSelection=this.selectedId;
    await this.prepare(this.store.document);
    this.select(null); this.layer.destroyChildren(); this.nodes.clear(); this.labels.clear(); this.grid.destroyChildren();
    const { canvas, grid, elements } = this.store.document.presentation;
    for (let x = canvas.minX??0; x < (canvas.minX??0)+canvas.width; x += grid.size) this.grid.add(new Konva.Line({ points: [x, canvas.minY??0, x, (canvas.minY??0)+canvas.height], stroke: x % (grid.size*5) === 0 ? '#d4dbe1' : '#eef0f2', strokeWidth: 1 }));
    for (let y = canvas.minY??0; y < (canvas.minY??0)+canvas.height; y += grid.size) this.grid.add(new Konva.Line({ points: [canvas.minX??0, y, (canvas.minX??0)+canvas.width, y], stroke: y % (grid.size*5) === 0 ? '#d4dbe1' : '#eef0f2', strokeWidth: 1 }));
    this.grid.visible(grid.visible);
    for (const e of [...elements.filter(e=>e.kind==='surface'),...elements.filter(e=>e.kind!=='surface')]) await this.addNode(e);
    this.renderCoordinates();this.refreshOrigins(this.store.document);this.fit();
    if(previousActiveVector && this.nodes.has(previousActiveVector)){
      this.activeVectorId=previousActiveVector;
      this.select(this.store.document.semantics.coordinateSystems.some(c=>c.id===previousSelection)?previousSelection:previousActiveVector);
      await this.refreshComponents();
    }
    this.stage.draw();
  }
  async addNode(record: Graphic) {
    let e=record; if(e.vectorId){const v=this.store.document.semantics.vectors.find(v=>v.id===e.vectorId);if(!v)return;const shown=displayedVector(this.store.document,v,e);if(!shown)return;e=shown;}
    if (e.visible === false) return;
    const base = { id: e.id, x: e.x, y: e.y, rotation: e.rotation, scaleX: e.scaleX, scaleY: e.scaleY, stroke: e.stroke, strokeWidth: e.strokeWidth, strokeScaleEnabled: true, fill: e.fill, draggable: true };
    let node: Konva.Shape;
    if(e.vectorId && isZeroMotionVector(this.store.document,this.store.document.semantics.vectors.find(v=>v.id===e.vectorId)!)){node=new Konva.Circle({...base,name:'zero-motion-anchor',radius:0,visible:false,listening:false});}
    else if(e.kind==='surface'){
      node=new Konva.Rect({...base,width:e.width,height:e.height,draggable:true});
      node.hitFunc((context,shape)=>{context.beginPath();context.rect(0,-12/this.zoom,e.width,24/this.zoom);context.closePath();context.fillStrokeShape(shape);});
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
    node.on('dragmove', () => { if(e.kind==='surface'){node.position({x:e.x,y:this.snap(node.y())});}else node.position({ x: this.snap(node.x()), y: this.snap(node.y()) }); this.positionLabel(e.id); this.refreshAttachments(); });
    node.on('dragend', () => { const before=structuredClone(this.store.document);Object.assign(this.element(e.id)!,{x:node.x(),y:node.y()});clearChangedComponentAngles(this.store.document,before);this.store.changed();this.select(e.id); });
    node.on('transformend', () => {
      const before=structuredClone(this.store.document);
      const patch = { x: this.snap(node.x()), y: this.snap(node.y()), rotation: node.rotation(), scaleX: node.scaleX(), scaleY: node.scaleY(), ...(node instanceof Konva.Line?{points:node.points() as Graphic['points']}:{}) };
      node.position({ x: patch.x, y: patch.y }); Object.assign(this.element(e.id)!,patch);clearChangedComponentAngles(this.store.document,before);this.store.changed(); this.positionLabel(e.id); this.refreshAttachments(); this.select(e.id);
    });
    node.on('transform', () => {this.positionLabel(e.id);this.refreshAttachments();});
    this.historyGesture(node,true);this.layer.draw();
  }
  private currentGraphic(id: string): Graphic {
    const e = this.element(id)!, node = this.nodes.get(id)!;
    const current:Graphic = { ...e, x: node.x(), y: node.y(), rotation: node.rotation(), scaleX: node.scaleX(), scaleY: node.scaleY(), ...(node instanceof Konva.Line?{points:node.points() as Graphic['points']}:{}) };
    const v=e.vectorId&&this.store.document.semantics.vectors.find(v=>v.id===e.vectorId);return v&&isZeroMotionVector(this.store.document,v)?zeroMotionLabelGraphic(current):current;
  }
  private positionLabel(id: string) {
    const e = this.element(id), label = this.labels.get(id); if (!e || !label) return;
    const size=label.getClientRect({skipTransform:true});
    label.position(labelPosition(this.currentGraphic(id),size.width,size.height,true));
  }
  private async addLabel(e: Graphic) {
    const object = this.store.document.semantics.objects.find(o => o.id === e.semanticId);
    if ((!object && !e.vectorId) || !e.label || (!e.label.showName && !e.label.showProperties)) return;
    const group = new Konva.Group({ draggable: true,name:'semantic-label',graphicId:e.id });
    const symbols = e.label.showProperties ? this.symbols(e) : '';
    let text:Konva.Text|undefined;
    if(e.label.showName && object){text=new Konva.Text({text:object.name+(symbols?', ':''),fontSize:16,fontFamily:'Arial',fill:'#222',hitStrokeWidth:8});group.add(text);}
    if(symbols){const image=await renderMath(symbols,16);group.add(new Konva.Image({image,width:image.width/2,height:image.height/2,x:text?.width()||0,y:0,math:symbols}));if(text)text.y(Math.max(0,(image.height/2-text.height())/2));}
    group.getChildren().forEach(child=>{if(child instanceof Konva.Shape)child.hitFunc((context,shape)=>{context.beginPath();context.rect(0,0,Math.max(child.width(),30/this.zoom),Math.max(child.height(),20/this.zoom));context.closePath();context.fillStrokeShape(shape);});});
    this.labels.set(e.id, group); this.layer.add(group); this.positionLabel(e.id);
    group.on('click tap', () => this.select(e.id));
    group.on('dblclick dbltap', () => this.onEdit(this.element(e.id)!));
    group.on('dragend', () => { const current = this.element(e.id)!; const size=group.getClientRect({skipTransform:true}),anchor=labelPosition(this.currentGraphic(e.id),size.width,size.height,false); this.store.update(e.id, { label: { ...effectiveLabel(current)!, offsetX: group.x() - anchor.x, offsetY: group.y() - anchor.y } }); this.select(e.id); });
    this.historyGesture(group);
  }
  private refreshAttachments(){
    const doc=structuredClone(this.store.document);for(const g of doc.presentation.elements)if(g.semanticId && this.nodes.has(g.id))Object.assign(g,this.currentGraphic(g.id));
    for(const g of doc.presentation.elements){if(!g.vectorId)continue;const v=doc.semantics.vectors.find(v=>v.id===g.vectorId),node=this.nodes.get(g.id);if(!v||!node)continue;const current=displayedVector(doc,v,g);if(!current)continue;node.position({x:current.x,y:current.y});if(node instanceof Konva.Line)node.points(current.points);this.positionLabel(g.id);}
    this.refreshOrigins(doc); void this.refreshComponents();
  }
  private refreshOrigins(doc:DiagramDocument){
    this.origins.destroyChildren();const counts=new Map<string,number>();
    for(const v of doc.semantics.vectors){const g=doc.presentation.elements.find(g=>g.vectorId===v.id);if(v.kind==='separation'||isZeroMotionVector(doc,v)||!v.objectId||!g||g.visible===false||!displayedVector(doc,v,g))continue;counts.set(v.objectId,(counts.get(v.objectId)||0)+1);}
    for(const [id,count]of counts){if(count<2)continue;const graphic=doc.presentation.elements.find(g=>g.semanticId===id);if(!graphic)continue;const point=attachmentPoint(graphic);this.origins.add(new Konva.Circle({name:'shared-origin',ownerObjectId:id,x:point.x,y:point.y,radius:3.5,fill:'#000',listening:false}));}
    this.origins.batchDraw();
  }
  private element(id: string) { return this.store.document.presentation.elements.find(e => e.id === id); }
  select(id: string | null) {
    const old = this.selectedId && this.nodes.get(this.selectedId);
    if (old) { const e = this.element(this.selectedId!); if (e && !['text', 'latex'].includes(e.kind)) old.stroke(e.stroke); old.draggable(!e?.vectorId); }
    this.controls.destroyChildren(); this.transformer = new Konva.Transformer({ rotateEnabled: true, ignoreStroke: true, padding: 4, anchorSize: 12 }); this.controls.add(this.transformer);
    this.selectedId = id;
    const selectedVector = id && this.element(id)?.vectorId;
    if(selectedVector)this.activeVectorId=id;
    else if(!this.store.document.semantics.coordinateSystems.some(c=>c.id===id))this.activeVectorId=null;
    void this.refreshComponents();
    this.onSelect(id ? this.element(id) || null : null);
    if (!id) { this.stage.batchDraw(); return; }
    if (this.store.document.semantics.coordinateSystems.some(c => c.id === id)) { this.coordinateHandles(); this.stage.batchDraw(); return; }
    const e = this.element(id), node = this.nodes.get(id);
    if (!e || !node) return;
    const selectedMotion=e.vectorId&&this.store.document.semantics.vectors.find(v=>v.id===e.vectorId);if(selectedMotion&&isZeroMotionVector(this.store.document,selectedMotion)){this.stage.batchDraw();return;}
    if (['line', 'arrow', 'dashedArrow','spring','cable'].includes(e.kind)) {
      node.stroke('orange'); node.draggable(false);
      const v=e.vectorId && this.store.document.semantics.vectors.find(v=>v.id===e.vectorId);
      for (const index of v ? (v.kind==='separation'||v.role==='resultant'?[]:[2]) : [0,2]) {
        const abs = node.getAbsoluteTransform().copy(); const scale = this.stage.scaleX();
        const screen = abs.point({ x: (node as Konva.Line).points()[index], y: (node as Konva.Line).points()[index + 1] });
        const p=this.stage.getAbsoluteTransform().copy().invert().point(screen);
        const handle = new Konva.Circle({ x: p.x, y: p.y, radius: 6, fill: '#ff0', stroke: '#000', strokeWidth: 1, draggable: true });
        const hit = new Konva.Circle({ x: handle.x(), y: handle.y(), radius: 16/scale, fill: 'rgba(0,0,0,0.01)', draggable: true });
        const move = (target: Konva.Circle) => {
          target.position({ x: this.snap(target.x()), y: this.snap(target.y()) });
          handle.position(target.position()); hit.position(target.position());
          const local = node.getAbsoluteTransform().copy().invert().point(this.stage.getAbsoluteTransform().point(target.position()));
          const points = [...this.element(id)!.points] as Graphic['points']; points[index] = local.x; points[index + 1] = local.y;
          if(v && v.role==='friction'){const normal=this.store.document.semantics.vectors.find(n=>n.interactionId===v.interactionId && n.role==='normal');const ng=normal && this.store.document.presentation.elements.find(g=>g.vectorId===normal.id);if(ng){const a=Math.atan2(ng.points[3],ng.points[2])+Math.PI/2,ux=Math.cos(a),uy=Math.sin(a),length=Math.max(20,local.x*ux+local.y*uy);points[2]=ux*length;points[3]=uy*length;const absolute=node.getAbsoluteTransform().point({x:points[2],y:points[3]});handle.position(this.stage.getAbsoluteTransform().copy().invert().point(absolute));hit.position(handle.position());}}
          const before=structuredClone(this.store.document);(node as Konva.Line).points(points); Object.assign(this.element(id)!,{points});clearChangedComponentAngles(this.store.document,before);this.store.changed(); this.refreshAttachments(); this.stage.batchDraw();
        };
        handle.on('dragmove', () => move(handle)); hit.on('dragmove', () => move(hit));
        this.historyGesture(handle);this.historyGesture(hit);this.controls.add(handle, hit);
      }
    } else if (e.kind === 'surface' || e.kind === 'point') { node.stroke('orange'); } else {
      if (e.kind !== 'text' && e.kind !== 'latex') node.stroke('orange');
      this.transformer.keepRatio(e.kind !== 'rectangle');
      if (e.kind === 'circle' && e.semanticId) this.transformer.enabledAnchors(['top-left','top-right','bottom-left','bottom-right']);
      this.transformer.nodes([node]);this.styleTransformer();
    }
    this.stage.batchDraw();
  }
  deleteSelected() { if (this.selectedId && this.store.document.semantics.coordinateSystems.some(c=>c.id===this.selectedId)) { deleteCoordinates(this.store); this.select(null); this.coordinates.destroyChildren(); this.stage.draw(); return; } if (this.selectedId) { const id = this.selectedId; if (this.element(id)?.semanticId || this.element(id)?.vectorId) throw new Error('Semantic objects must be deleted through the object operations.'); this.select(null); this.nodes.get(id)?.destroy(); this.labels.get(id)?.destroy(); this.nodes.delete(id); this.labels.delete(id); this.store.remove(id); this.stage.draw(); } }
  private renderCoordinates() {
    this.coordinates.destroyChildren();
    const system = this.store.document.semantics.coordinateSystems[0];
    if (!system || system.visible === false) return;
    const group = new Konva.Group({name:'coordinate-system',id:system.id,x:system.origin[0],y:system.origin[1]});
    const basis = coordinateBasis(system.angle, system.reverseX, system.reverseY);
    for (const axis of system.dimensions === 2 ? ['x','y'] as const : ['x'] as const) {
      const [dx,dy]=basis[axis];
      const arrow=new Konva.Arrow({name:'coordinate-axis',axis,points:[-dx*16,-dy*16,dx*64,dy*64],stroke:'#42566b',fill:'#42566b',strokeWidth:2,pointerLength:8,pointerWidth:8,hitStrokeWidth:18});
      const label=new Konva.Text({text:axis,x:dx*78-5,y:dy*78-8,fontSize:16,fill:'#42566b'});
      group.add(arrow,label);
    }
    const origin=new Konva.Circle({name:'coordinate-origin',radius:5,fill:'#42566b',hitStrokeWidth:0});
    origin.hitFunc((context,shape)=>{context.beginPath();context.arc(0,0,22/(this.stage.scaleX()||1),0,Math.PI*2);context.closePath();context.fillStrokeShape(shape);});group.add(origin);
    group.on('click tap',()=>this.select(system.id));
    group.on('dblclick dbltap',()=>this.onCoordinateEdit());
    // Only the origin drags the frame; vector/object nodes are independent.
    origin.draggable(true);
    origin.on('dragstart',()=>this.select(system.id));
    origin.on('dragmove',()=>{system.origin=[group.x()+origin.x(),group.y()+origin.y()];group.position({x:system.origin[0],y:system.origin[1]});origin.position({x:0,y:0});this.store.changed();this.select(system.id);});
    this.historyGesture(origin);this.coordinates.add(group);
  }
  private coordinateHandles() {
    const system=this.store.document.semantics.coordinateSystems[0];if(!system || system.visible===false)return;
    const basis=coordinateBasis(system.angle),distance=105;
    const handle=new Konva.Circle({name:'coordinate-rotation-handle',x:system.origin[0]+basis.x[0]*distance,y:system.origin[1]+basis.x[1]*distance,radius:8,fill:'#ff0',stroke:'#42566b',hitStrokeWidth:24,draggable:true});
    handle.hitFunc((context,shape)=>{context.beginPath();context.arc(0,0,22/(this.stage.scaleX()||1),0,Math.PI*2);context.closePath();context.fillStrokeShape(shape);});
    handle.on('dragmove',()=>{const dx=handle.x()-system.origin[0],dy=handle.y()-system.origin[1];if(Math.hypot(dx,dy)<1)return;const angle=Math.atan2(-dy,dx)*180/Math.PI;if(Math.abs(angle-system.angle)>1e-8)clearComponentAngleDefinitions(this.store.document);system.angle=angle;this.store.changed();this.renderCoordinates();void this.refreshComponents();this.stage.batchDraw();});
    handle.on('dragend',()=>this.select(system.id));this.historyGesture(handle);this.controls.add(handle);
  }
  private decompositionLabel(label:Konva.Image,record:Graphic,kind:'components'|'angles',axis:'x'|'y',anchor:{x:number;y:number}) {
    const offset=record.decompositionLabels?.[kind]?.[axis] || [0,0];
    label.position({x:anchor.x+offset[0],y:anchor.y+offset[1]});label.draggable(true);
    label.hitFunc((context,shape)=>{context.beginPath();context.rect(0,0,Math.max(label.width(),30/this.zoom),Math.max(label.height(),20/this.zoom));context.closePath();context.fillStrokeShape(shape);});
    label.on('dragend',()=>{
      const current=this.element(record.id)!;
      this.store.update(record.id,{decompositionLabels:{...current.decompositionLabels,[kind]:{...current.decompositionLabels?.[kind],[axis]:[label.x()-anchor.x,label.y()-anchor.y]}}});
    });
    this.historyGesture(label);
  }
  private async refreshComponents() {
    const revision=++this.componentRevision;this.components.destroyChildren();
    const id=this.activeVectorId,system=this.store.document.semantics.coordinateSystems[0];
    const record=id?this.element(id):undefined;
    if(!record?.vectorId || !system || record.showComponents===false || record.visible===false || !this.nodes.has(record.id)) {this.components.batchDraw();return;}
    const graphic=this.currentGraphic(record.id),projections=graphicalComponents(graphic,system);
    const vector=this.store.document.semantics.vectors.find(v=>v.id===record.vectorId)!;
    const symbol=this.store.document.semantics.variables.find(v=>v.id===vector.variableId)?.symbol || '';
    const group=new Konva.Group({name:'vector-components',vectorId:vector.id});
    // Compute default anchors independently of manual offsets so redraw/reload
    // cannot reposition another label after a drag.
    const obstacles=[...this.labels.values()].map(label=>label.getClientRect({relativeTo:this.stage}));
    for(const projection of projections){
      const x=graphic.x,y=graphic.y;
      group.add(new Konva.Arrow({name:'vector-component',listening:false,axis:projection.axis,coordinateDirection:projection.direction,points:[x,y,x+projection.dx,y+projection.dy],stroke:record.stroke,fill:record.stroke,strokeWidth:2,dash:[2,5],pointerLength:7,pointerWidth:7}));
      // Append the coordinate axis to the existing participant subscripts.
      const indexed=symbol.endsWith('}')?symbol.slice(0,-1)+','+projection.axis+'}':symbol+'_{'+projection.axis+'}';
      const latex=vectorLatex(indexed),image=await renderMath(latex,16);
      const position={x:x+projection.dx+8,y:y+projection.dy+8};
      const label=new Konva.Image({name:'component-label',axis:projection.axis,math:latex,image,width:image.width/2,height:image.height/2,...position});
      obstacles.push({...position,width:label.width(),height:label.height()});
      this.decompositionLabel(label,record,'components',projection.axis,position);group.add(label);
    }
    if(vector.showAngles!==false)for(const geometry of componentAngleGeometry(graphic,this.store.document)){
      const {start,sweep,axis}=geometry,radius=axis==='x'?32:42;
      const angle=new Konva.Group({name:'component-angle',vectorId:vector.id,axis,x:graphic.x,y:graphic.y});
      angle.add(new Konva.Shape({name:'angle-arc',listening:false,axis,stroke:'#735889',strokeWidth:2,
        sceneFunc:(context,shape)=>{context.beginPath();context.arc(0,0,radius,-start,-start-sweep,sweep>0);context.strokeShape(shape);}}));
      const math=componentAngleLabel(this.store.document,vector,axis),image=await renderMath(math,16),mid=start+sweep/2;
      const preferred={x:graphic.x+(radius+18)*Math.cos(mid)+(Math.cos(mid)>=0?8:-8-image.width/2),y:graphic.y-(radius+18)*Math.sin(mid)-image.height/4};
      const position=overlayLabelPosition(preferred,image.width/2,image.height/2,obstacles);
      obstacles.push({...position,width:image.width/2,height:image.height/2});
      const anchor={x:position.x-graphic.x,y:position.y-graphic.y};
      const label=new Konva.Image({name:'angle-label',axis,math,image,width:image.width/2,height:image.height/2,...anchor});
      this.decompositionLabel(label,record,'angles',axis,anchor);angle.add(label);
      group.add(angle);
    }
    if(revision!==this.componentRevision){group.destroy();return;}
    this.components.add(group);this.components.batchDraw();
  }
  toggleGrid() { const p = this.store.document.presentation; p.grid.visible = !p.grid.visible; this.grid.visible(p.grid.visible); this.store.changed(); this.stage.draw(); }
}

/** Keep longer numerical labels readable without changing their semantic/arc anchors. */
function overlayLabelPosition(preferred:{x:number;y:number},width:number,height:number,obstacles:{x:number;y:number;width:number;height:number}[]) {
  const candidates=[0,-24,24,-48,48,-72,72,-96,96].flatMap(y=>[0,-32,32,-64,64,-96,96].map(x=>({x,y})));
  candidates.sort((a,b)=>Math.hypot(a.x,a.y)-Math.hypot(b.x,b.y));
  for(const offset of candidates){const p={x:preferred.x+offset.x,y:preferred.y+offset.y};
    if(!obstacles.some(r=>p.x<r.x+r.width+6 && p.x+width+6>r.x && p.y<r.y+r.height+6 && p.y+height+6>r.y))return p;
  }
  return preferred;
}
