import {DocumentStore,type DiagramDocument} from './model';
import type {DirectionReference,SemanticAngle} from './semantics';
import {coordinateBasis} from './coordinates';
import {displayedVector,isZeroMotionVector,objectPosition,vectorGraphic} from './physics';
import {vectorSymbol} from './naming';
export interface DirectionChoice { reference:DirectionReference; label:string; symbol:string; group:'Vectors'|'Vector components'|'Coordinate axes' }
export const directionKey=(r:DirectionReference)=>JSON.stringify(r.type==='vector'?{type:r.type,vectorId:r.vectorId}:r.type==='axis'?{type:r.type,coordinateSystemId:r.coordinateSystemId,axis:r.axis,sign:r.sign}:{type:r.type,vectorId:r.vectorId,coordinateSystemId:r.coordinateSystemId,axis:r.axis});
export function directionExists(doc:DiagramDocument,r:DirectionReference):boolean {
 if(!r || !['vector','component','axis'].includes(r.type))return false;
 if(r.type!=='axis' && !doc.semantics.vectors.some(v=>v.id===r.vectorId))return false;
 if(r.type!=='vector' && (!['x','y'].includes(r.axis)||!doc.semantics.coordinateSystems.some(c=>c.id===r.coordinateSystemId)))return false;
 return r.type!=='axis'||r.sign===1||r.sign===-1;
}
/** Direction belongs to the model even when the source's graphic is hidden. */
export function resolveDirection(doc:DiagramDocument,r:DirectionReference):{dx:number;dy:number}|undefined {
 if(!directionExists(doc,r))return;
 const system=r.type!=='vector'?doc.semantics.coordinateSystems.find(c=>c.id===r.coordinateSystemId):undefined;
 if(system && r.type!=='vector' && r.axis==='y' && system.dimensions!==2)return;
 if(r.type==='axis'){const [dx,dy]=coordinateBasis(system!.angle,system!.reverseX,system!.reverseY)[r.axis];return {dx:dx*r.sign,dy:dy*r.sign};}
 const v=doc.semantics.vectors.find(v=>v.id===r.vectorId)!,g=vectorGraphic(doc,v.id);if(!g || isZeroMotionVector(doc,v))return;
 let dx:number,dy:number;
 if(v.kind==='separation'){const a=objectPosition(doc,v.fromId),b=objectPosition(doc,v.toId);if(!a||!b)return;dx=b.x-a.x;dy=b.y-a.y;}
 else {
  // displayedVector's visibility rule applies to drawing, not direction semantics.
  const visibleDoc={...doc,presentation:{...doc.presentation,elements:doc.presentation.elements.map(g=>({...g,visible:true}))}};
  const shown=displayedVector(visibleDoc,v,g);if(!shown)return;
  const a=shown.rotation*Math.PI/180,x=(shown.points[2]-shown.points[0])*shown.scaleX,y=(shown.points[3]-shown.points[1])*shown.scaleY;
  dx=x*Math.cos(a)-y*Math.sin(a);dy=x*Math.sin(a)+y*Math.cos(a);
 }
 if(Math.hypot(dx,dy)<1e-8)return;
 if(r.type==='component'){
  const [x,y]=coordinateBasis(system!.angle,system!.reverseX,system!.reverseY)[r.axis],projection=dx*x+dy*y;
  if(Math.abs(projection)<1e-8)return;
  return {dx:projection*x,dy:projection*y};
 }
 return {dx,dy};
}
export function directionSymbol(doc:DiagramDocument,r:DirectionReference):string {
 if(r.type==='axis')return `${r.sign===1?'+':'-'}${r.axis}`;
 const vector=doc.semantics.vectors.find(v=>v.id===r.vectorId);if(!vector)return '?';
 // vectorSymbol reuses object abbreviations and the existing participant notation.
 let symbol=vectorSymbol(doc,vector);
 const duplicates=doc.semantics.vectors.filter(v=>vectorSymbol(doc,v)===symbol).sort((a,b)=>a.id.localeCompare(b.id));
 if(duplicates.length>1){const index=duplicates.findIndex(v=>v.id===vector.id)+1;symbol=symbol.endsWith('}')?`${symbol.slice(0,-1)},${index}}`:`${symbol}_{${index}}`;}
 if(r.type==='component')symbol=symbol.endsWith('}')?`${symbol.slice(0,-1)},${r.axis}}`:`${symbol}_{${r.axis}}`;
 return symbol;
}
export function angleSymbol(doc:DiagramDocument,a:Pick<SemanticAngle,'from'|'to'>){return `\\theta_{${'{'+directionSymbol(doc,a.from)+'}'},${'{'+directionSymbol(doc,a.to)+'}'}}`;}
export function directionChoices(doc:DiagramDocument):DirectionChoice[] {
 const result:DirectionChoice[]=[];
 const add=(reference:DirectionReference,group:DirectionChoice['group'],label:string)=>{if(!resolveDirection(doc,reference))return;const symbol=directionSymbol(doc,reference);result.push({reference,group,label:`${label} ${symbol}`,symbol});};
 for(const v of doc.semantics.vectors){const type=v.kind==='motion'?v.motionType!:v.role?`${v.role} force`:v.kind;add({type:'vector',vectorId:v.id},'Vectors',type);}
 const c=doc.semantics.coordinateSystems[0];if(c){
  for(const v of doc.semantics.vectors)for(const axis of c.dimensions===2?['x','y'] as const:['x'] as const)add({type:'component',vectorId:v.id,coordinateSystemId:c.id,axis},'Vector components',`${axis}-component`);
  for(const axis of c.dimensions===2?['x','y'] as const:['x'] as const)for(const sign of [1,-1] as const)add({type:'axis',coordinateSystemId:c.id,axis,sign},'Coordinate axes','axis');
 }
 return result;
}
export function angleGeometry(doc:DiagramDocument,a:Pick<SemanticAngle,'from'|'to'>){
 const from=resolveDirection(doc,a.from),to=resolveDirection(doc,a.to);if(!from||!to)return;
 const start=Math.atan2(-from.dy,from.dx),end=Math.atan2(-to.dy,to.dx);
 let sweep=Math.atan2(Math.sin(end-start),Math.cos(end-start));if(Math.abs(sweep)<1e-12)sweep=0;
 return {start,sweep};
}
export function invalidAngleReason(doc:DiagramDocument,a:SemanticAngle){return !resolveDirection(doc,a.from)?'From direction is undefined. Edit or delete this angle.':!resolveDirection(doc,a.to)?'To direction is undefined. Edit or delete this angle.':'';}
export function saveAngle(store:DocumentStore,d:Pick<SemanticAngle,'from'|'to'> & {id?:string;value?:number;visible?:boolean}) {
 if(!resolveDirection(store.document,d.from)||!resolveDirection(store.document,d.to))throw new Error('Choose two defined From and To directions.');
 if(d.value!==undefined && (!Number.isFinite(d.value)||Math.abs(d.value)>1000000))throw new Error('Enter a finite angle value in degrees.');
 const doc=structuredClone(store.document),old=doc.semantics.angles?.find(a=>a.id===d.id);if(d.id&&!old)throw new Error('This angle no longer exists.');
 const id=old?.id||crypto.randomUUID();const angle:SemanticAngle={id,from:structuredClone(d.from),to:structuredClone(d.to),visible:d.visible??true,presentation:old?.presentation??{x:0,y:0,labelOffset:[0,0]}};
 if(d.value!==undefined)angle.value=d.value;
 doc.semantics.angles=[...(doc.semantics.angles??[]).filter(a=>a.id!==id),angle];store.replace(doc);return id;
}
export function deleteAngle(store:DocumentStore,id:string){store.document.semantics.angles=(store.document.semantics.angles??[]).filter(a=>a.id!==id);store.changed();}
export function assertNoAngleDependents(doc:DiagramDocument,vectorIds:string[]=[],coordinateId?:string){
 if(doc.semantics.angles?.some(a=>[a.from,a.to].some(r=>(r.type!=='axis'&&vectorIds.includes(r.vectorId))||(r.type!=='vector'&&r.coordinateSystemId===coordinateId))))throw new Error('Delete dependent angles before deleting their direction sources.');
}
