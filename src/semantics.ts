/** Physics definitions are independent of graphics. No primitive implies physics. */
export type PropertyQuantity = 'mass' | 'charge' | 'density';
export interface Variable { id: string; symbol: string; value?: number; unit?: string; quantity?: PropertyQuantity; state?: 'known' | 'unknown'; ownerObjectId?: string }
export interface PhysicalObject { id: string; name: string; properties?: Record<string, string> }
export interface Interaction { id: string; objectIds: string[]; kind: string }
export interface CoordinateSystem { id: string; dimensions: 1 | 2; origin: [number, number]; angle: number }
export interface PhysicalVector { id: string; kind: 'force' | 'field' | 'motion'; variableId: string; objectId?: string; interactionId?: string }
export interface VectorComponent { id: string; vectorId: string; coordinateSystemId: string; axis: 'x' | 'y'; variableId: string }
export interface Semantics {
  objects: PhysicalObject[]; interactions: Interaction[]; variables: Variable[];
  vectors: PhysicalVector[]; coordinateSystems: CoordinateSystem[]; components: VectorComponent[];
}
export const emptySemantics = (): Semantics => ({ objects: [], interactions: [], variables: [], vectors: [], coordinateSystems: [], components: [] });
