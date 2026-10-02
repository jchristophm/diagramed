import {assertNoAngleDependents} from './angles';
import type { CoordinateSystem } from './semantics';
import type { Graphic } from './model';
import { DocumentStore } from './model';

/** Presentation tolerance, in degrees; never modifies authoritative geometry. */
export const COMPONENT_ANGLE_TOLERANCE_DEGREES = 10;
export function coordinateBasis(angle: number, reverseX = false, reverseY = false) {
  const radians = angle * Math.PI / 180;
  const xDirection = reverseX ? -1 : 1, yDirection = reverseY ? -1 : 1;
  return { x: [xDirection * Math.cos(radians), -xDirection * Math.sin(radians)] as const, y: [-yDirection * Math.sin(radians), -yDirection * Math.cos(radians)] as const };
}
export function graphicalComponents(graphic: Graphic, system: CoordinateSystem) {
  const r = graphic.rotation * Math.PI / 180;
  const dx = (graphic.points[2] - graphic.points[0]) * graphic.scaleX;
  const dy = (graphic.points[3] - graphic.points[1]) * graphic.scaleY;
  const vx = dx * Math.cos(r) - dy * Math.sin(r), vy = dx * Math.sin(r) + dy * Math.cos(r);
  const length = Math.hypot(vx, vy);
  if (!length) return [];
  const basis = coordinateBasis(system.angle, system.reverseX, system.reverseY);
  const x = vx * basis.x[0] + vy * basis.x[1], y = vx * basis.y[0] + vy * basis.y[1];
  const axisAngle = Math.acos(Math.min(1, Math.abs(x) / length)) * 180 / Math.PI;
  // Undirected x axis: 0..90 degrees includes both positive and negative directions.
  // In 1D the perpendicular direction also suppresses negligible x projections.
  if (axisAngle <= COMPONENT_ANGLE_TOLERANCE_DEGREES + 1e-10 || 90 - axisAngle <= COMPONENT_ANGLE_TOLERANCE_DEGREES + 1e-10) return [];
  return ([{axis: 'x' as const, direction: x < 0 ? -1 : 1, dx: x * basis.x[0], dy: x * basis.x[1]},
    ...(system.dimensions === 2 ? [{axis: 'y' as const, direction: y < 0 ? -1 : 1, dx: y * basis.y[0], dy: y * basis.y[1]}] : [])]);
}
export function saveCoordinates(store: DocumentStore, draft: Omit<CoordinateSystem, 'id'> & {id?: string}) {
  if (![1, 2].includes(draft.dimensions) || !Number.isFinite(draft.angle) || Math.abs(draft.angle) > 1000000 || draft.origin.length !== 2 || draft.origin.some(v => !Number.isFinite(v) || Math.abs(v) > 1000000)) throw new Error('Invalid coordinate system.');
  for (const key of ['reverseX','reverseY'] as const) if (draft[key] !== undefined && typeof draft[key] !== 'boolean') throw new Error('Axis reversal must be true or false.');
  const systems = store.document.semantics.coordinateSystems;
  if (systems.length > 1 || (systems.length && systems[0].id !== draft.id) || (draft.id && !systems.some(c => c.id === draft.id))) throw new Error('Only one coordinate system is supported.');
  const system = {...draft, id: draft.id || crypto.randomUUID(), visible: draft.visible ?? true};
  store.document.semantics.coordinateSystems = [system];
  // A hidden y axis does not invalidate retained semantic components.
  store.changed();
  return system.id;
}
export function deleteCoordinates(store: DocumentStore) {
  assertNoAngleDependents(store.document,[],store.document.semantics.coordinateSystems[0]?.id);
  store.document.semantics.coordinateSystems = [];
  store.document.semantics.components = [];
  for (const graphic of store.document.presentation.elements) if (graphic.vectorId) delete graphic.showComponents;
  store.changed();
}
