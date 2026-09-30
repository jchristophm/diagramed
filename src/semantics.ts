/** Physics definitions are independent of graphics. No primitive implies physics. */
export type PropertyQuantity = 'mass' | 'charge' | 'density' | 'gravity' | 'springConstant' | 'extension' | 'surfaceChargeDensity';
export type Quantity = PropertyQuantity | 'force' | 'gravitationalField' | 'electricField' | 'length' | 'velocity' | 'acceleration' | 'displacement' | 'staticFriction' | 'kineticFriction' | 'volume';
export type Expression = {type:'number';value:number} | {type:'reference';id:string} | {type:'pi'} | {type:'unary';op:'-'|'abs';operand:Expression} | {type:'binary';op:'+'|'-'|'*'|'/'|'^';left:Expression;right:Expression};
export interface Variable { expression?: Expression; ownerInteractionId?: string; ownerVectorId?: string; generatedSymbol?: boolean; id: string; symbol: string; value?: number; unit?: string; quantity?: Quantity; state?: 'known' | 'unknown' | 'expression'; ownerObjectId?: string }
export type ObjectCategory = 'ordinary' | 'spatialPoint' | 'planetSurface' | 'spring' | 'cable' | 'chargedPlate' | 'fluid';
export interface PhysicalObject { category?: ObjectCategory; abbreviation?: string; polarity?: 'positive' | 'negative'; id: string; name: string; properties?: Record<string, string> }
export interface Interaction { id: string; objectIds: string[]; kind: string; sourceId?: string; targetId?: string; model?: 'nearSurface'|'universal'|'pointSource'|'uniform'|'ordinary'|'spring'|'cable'; separationId?: string; properties?: Record<string,string>; friction?: 'static'|'kinetic'; resultantVisible?: boolean }
export interface CoordinateSystem { id: string; dimensions: 1 | 2; origin: [number, number]; angle: number }
export interface PhysicalVector { id: string; kind: 'force' | 'field' | 'motion' | 'separation'; fromId?: string; toId?: string; sourceId?: string; separationId?: string; fieldType?: 'gravitational'|'electric'; motionType?: 'velocity'|'acceleration'|'displacement'; role?: 'normal'|'friction'|'resultant'; variableId: string; objectId?: string; interactionId?: string }
export interface VectorComponent { id: string; vectorId: string; coordinateSystemId: string; axis: 'x' | 'y'; variableId: string }
export interface Semantics {
  objects: PhysicalObject[]; interactions: Interaction[]; variables: Variable[];
  vectors: PhysicalVector[]; coordinateSystems: CoordinateSystem[]; components: VectorComponent[];
}
export const emptySemantics = (): Semantics => ({ objects: [], interactions: [], variables: [], vectors: [], coordinateSystems: [], components: [] });
