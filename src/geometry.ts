import type { Graphic } from './model';
/** Central attachment point in document coordinates, independent of Konva. */
export function attachmentPoint(graphic: Graphic): { x: number; y: number } {
  if(['spring','cable'].includes(graphic.kind)){ const [x1,y1,x2,y2]=graphic.points; const r=graphic.rotation*Math.PI/180,x=(x1+x2)/2*graphic.scaleX,y=(y1+y2)/2*graphic.scaleY;return {x:graphic.x+x*Math.cos(r)-y*Math.sin(r),y:graphic.y+x*Math.sin(r)+y*Math.cos(r)}; }
  const localX = ['rectangle','surface'].includes(graphic.kind) ? graphic.width / 2 : 0;
  const localY = ['rectangle','surface'].includes(graphic.kind) ? graphic.height / 2 : 0;
  const radians = graphic.rotation * Math.PI / 180;
  return { x: graphic.x + localX * graphic.scaleX * Math.cos(radians) - localY * graphic.scaleY * Math.sin(radians), y: graphic.y + localX * graphic.scaleX * Math.sin(radians) + localY * graphic.scaleY * Math.cos(radians) };
}

/** Screen-upright label anchor; offsets are presentation only, never physical geometry. */
export function effectiveLabel(graphic:Graphic){const label=graphic.label;if(!label || label.placement)return label;if(graphic.vectorId && label.offsetX===12 && label.offsetY===12)return {...label,placement:'vectorTip' as const,offsetX:0,offsetY:0};if(graphic.semanticId && label.offsetX===24 && label.offsetY===24)return {...label,placement:'objectCenter' as const,offsetX:0,offsetY:28};return label;}
export function labelPosition(graphic:Graphic,width:number,height:number,offsets=true,bounds?:{width:number;height:number}){
 const label=effectiveLabel(graphic),center=attachmentPoint(graphic);let x=center.x,y=center.y;
 if(label?.placement==='objectCenter'){x-=width/2;}
 else if(label?.placement==='vectorTip'){
  const a=graphic.rotation*Math.PI/180,dx=(graphic.points[2]-graphic.points[0])*graphic.scaleX,dy=(graphic.points[3]-graphic.points[1])*graphic.scaleY;
  const vx=dx*Math.cos(a)-dy*Math.sin(a),vy=dx*Math.sin(a)+dy*Math.cos(a),length=Math.hypot(vx,vy)||1,ux=vx/length,uy=vy/length;
  x=graphic.x+graphic.points[2]*graphic.scaleX*Math.cos(a)-graphic.points[3]*graphic.scaleY*Math.sin(a)+ux*20-uy*14-width/2;
  y=graphic.y+graphic.points[2]*graphic.scaleX*Math.sin(a)+graphic.points[3]*graphic.scaleY*Math.cos(a)+uy*20+ux*14-height/2;
 }
 if(label?.placement==='vectorTip' && bounds){x=Math.max(4,Math.min(bounds.width-width-4,x));y=Math.max(4,Math.min(bounds.height-height-4,y));}
 if(offsets){x+=label?.offsetX??24;y+=label?.offsetY??24;}return {x,y};
}
