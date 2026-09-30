import type { Graphic } from './model';
/** Central attachment point in document coordinates, independent of Konva. */
export function attachmentPoint(graphic: Graphic): { x: number; y: number } {
  const localX = graphic.kind === 'rectangle' ? graphic.width / 2 : 0;
  const localY = graphic.kind === 'rectangle' ? graphic.height / 2 : 0;
  const radians = graphic.rotation * Math.PI / 180;
  return { x: graphic.x + localX * graphic.scaleX * Math.cos(radians) - localY * graphic.scaleY * Math.sin(radians), y: graphic.y + localX * graphic.scaleX * Math.sin(radians) + localY * graphic.scaleY * Math.cos(radians) };
}
