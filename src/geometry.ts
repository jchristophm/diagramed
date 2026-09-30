import type { Graphic } from './model';
/** Central attachment point in document coordinates, independent of Konva. */
export function attachmentPoint(graphic: Graphic): { x: number; y: number } {
  if(['spring','cable'].includes(graphic.kind)){ const [x1,y1,x2,y2]=graphic.points; const r=graphic.rotation*Math.PI/180,x=(x1+x2)/2*graphic.scaleX,y=(y1+y2)/2*graphic.scaleY;return {x:graphic.x+x*Math.cos(r)-y*Math.sin(r),y:graphic.y+x*Math.sin(r)+y*Math.cos(r)}; }
  const localX = ['rectangle','surface'].includes(graphic.kind) ? graphic.width / 2 : 0;
  const localY = ['rectangle','surface'].includes(graphic.kind) ? graphic.height / 2 : 0;
  const radians = graphic.rotation * Math.PI / 180;
  return { x: graphic.x + localX * graphic.scaleX * Math.cos(radians) - localY * graphic.scaleY * Math.sin(radians), y: graphic.y + localX * graphic.scaleX * Math.sin(radians) + localY * graphic.scaleY * Math.cos(radians) };
}
