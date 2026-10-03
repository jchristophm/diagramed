import type {DiagramDocument,Graphic} from './model';
import type {ComponentAngleDefinition,PhysicalVector} from './semantics';
import {coordinateBasis,graphicalComponents} from './coordinates';
import {displayedVector,isZeroMotionVector,vectorGraphic} from './physics';
import {vectorSymbol} from './naming';
import {numericalLabel} from './quantity-labels';

const round=(n:number)=>Number(n.toPrecision(12));
const difference=(a:number,b:number)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
export function componentAngleSymbol(doc:DiagramDocument,vector:PhysicalVector,axis:'x'|'y') {
  const symbol=vectorSymbol(doc,vector),base=symbol.split('_')[0];
  const peers=doc.semantics.vectors.filter(v=>vectorSymbol(doc,v).split('_')[0]===base);
  const name=peers.length===1 ? base : doc.semantics.variables.find(v=>v.id===vector.variableId)?.symbol||symbol;
  return `\\theta_{${name},${axis}}`;
}
export function componentAngleValues(vector:PhysicalVector) {
  const a=vector.componentAngle;if(!a)return;
  return a.axis==='x'?{x:a.value,y:round(90-a.value)}:{x:round(90-a.value),y:a.value};
}
export function componentAngleLabel(doc:DiagramDocument,vector:PhysicalVector,axis:'x'|'y') {
  return numericalLabel(componentAngleSymbol(doc,vector,axis),componentAngleValues(vector)?.[axis],'°');
}
/** Hidden graphics retain semantic geometry; the same component tolerance controls availability. */
export function angleGraphic(doc:DiagramDocument,vector:PhysicalVector) {
  const g=vectorGraphic(doc,vector.id);if(!g||isZeroMotionVector(doc,vector))return;
  const visibleDoc={...doc,presentation:{...doc.presentation,elements:doc.presentation.elements.map(g=>({...g,visible:true}))}};
  return displayedVector(visibleDoc,vector,g);
}
export function componentAngleGeometry(graphic:Graphic,doc:DiagramDocument) {
  const c=doc.semantics.coordinateSystems[0];if(!c||c.dimensions!==2)return [];
  const projections=graphicalComponents(graphic,c);if(projections.length!==2)return [];
  const r=graphic.rotation*Math.PI/180,dx=(graphic.points[2]-graphic.points[0])*graphic.scaleX,dy=(graphic.points[3]-graphic.points[1])*graphic.scaleY;
  const start=Math.atan2(-(dx*Math.sin(r)+dy*Math.cos(r)),dx*Math.cos(r)-dy*Math.sin(r));
  return projections.map(p=>({...p,start,sweep:difference(Math.atan2(-p.dy,p.dx),start)}));
}
export function validateComponentAngle(a:ComponentAngleDefinition,doc:DiagramDocument) {
  const c=doc.semantics.coordinateSystems[0];
  if(!c||c.dimensions!==2||c.id!==a.coordinateSystemId||!['x','y'].includes(a.axis)||!Number.isFinite(a.value)||a.value<0||a.value>90)throw new Error('Enter a component angle between 0° and 90° in the active 2D coordinate system.');
}
/** Independent direction changes invalidate authored constraints, including linked contact directions. */
export function clearChangedComponentAngles(doc:DiagramDocument,before:DiagramDocument) {
  for(const v of doc.semantics.vectors){if(!v.componentAngle)continue;
    const old=before.semantics.vectors.find(n=>n.id===v.id),a=old&&angleGraphic(before,old),b=angleGraphic(doc,v);
    if(!a||!b||Math.hypot(b.points[2],b.points[3])<1e-8||Math.abs(difference(Math.atan2(a.points[3],a.points[2]),Math.atan2(b.points[3],b.points[2])))>1e-8)delete v.componentAngle;
  }
}
/** Pick the closest local solution, preserving quadrant and exact drawn length (no grid-length rounding). */
export function applyComponentAngle(doc:DiagramDocument,id:string,definition:ComponentAngleDefinition|undefined) {
  const vector=doc.semantics.vectors.find(v=>v.id===id);if(!vector)throw new Error('Vector no longer exists.');
  if(!definition){delete vector.componentAngle;return;}
  validateComponentAngle(definition,doc);
  const g=angleGraphic(doc,vector);if(!g)throw new Error('A zero vector has no component angles.');
  const length=Math.hypot(g.points[2],g.points[3]);if(length<1e-8)throw new Error('A zero vector has no component angles.');
  const c=doc.semantics.coordinateSystems[0],basis=coordinateBasis(c.angle,c.reverseX,c.reverseY),bx=Math.atan2(basis.x[1],basis.x[0]);
  const xAngle=(definition.axis==='x'?definition.value:90-definition.value)*Math.PI/180,current=Math.atan2(g.points[3],g.points[2]);
  const candidates=[bx+xAngle,bx-xAngle,bx+Math.PI+xAngle,bx+Math.PI-xAngle];
  const target=candidates.reduce((best,a)=>Math.abs(difference(a,current))<Math.abs(difference(best,current))-1e-12?a:best),delta=difference(target,current);
  const before=structuredClone(doc);
  if(vector.kind==='separation') {
    // A separation is endpoint geometry: keep FROM fixed and relocate TO, retaining attachment.
    const end=doc.presentation.elements.find(g=>g.semanticId===vector.toId)!;
    end.x+=length*Math.cos(target)-g.points[2];end.y+=length*Math.sin(target)-g.points[3];
  } else {
    const linked=vector.role ? doc.semantics.vectors.filter(v=>v.interactionId===vector.interactionId) : [vector];
    for(const v of linked){const graphic=vectorGraphic(doc,v.id)!;const [x,y]=graphic.points.slice(2);graphic.points=[0,0,x*Math.cos(delta)-y*Math.sin(delta),x*Math.sin(delta)+y*Math.cos(delta)];}
  }
  clearChangedComponentAngles(doc,before);
  vector.componentAngle={...definition};
}
