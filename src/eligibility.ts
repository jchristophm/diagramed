import type {DiagramDocument} from './model';
import type {PhysicalObject} from './semantics';
export type VectorChoice='force'|'field'|'separation'|'velocity'|'acceleration'|'displacement';
export interface Configuration {kind:VectorChoice;interactionType?:'gravitational'|'electric'|'contact'|'buoyant';contactType?:'ordinary'|'spring'|'cable';sourceId?:string;targetId?:string;separationId?:string}
export function matchingSeparations(doc:DiagramDocument,c:Configuration){return doc.semantics.vectors.filter(v=>v.kind==='separation' && ((v.fromId===c.sourceId && v.toId===c.targetId)||(c.kind!=='field' && v.fromId===c.targetId && v.toId===c.sourceId)));}
export function eligibility(doc:DiagramDocument,c:Configuration,requireSeparation=true):boolean{
 const source=doc.semantics.objects.find(o=>o.id===c.sourceId),target=doc.semantics.objects.find(o=>o.id===c.targetId);const cat=(o?:PhysicalObject)=>o?.category||'ordinary';const charge=(o?:PhysicalObject)=>!!o?.properties?.charge;
 if(!target)return false;
 if(['velocity','acceleration','displacement'].includes(c.kind))return cat(target)==='ordinary';
 if(!source || source.id===target.id)return false;
 if(c.kind==='separation')return true;
 const separation=()=>!requireSeparation || matchingSeparations(doc,c).some(v=>!c.separationId || v.id===c.separationId);
 if(c.kind==='field'){
  if(cat(target)!=='spatialPoint')return false;
  if(c.interactionType==='gravitational')return cat(source)==='planetSurface'||(cat(source)==='ordinary' && !!source.properties?.mass && separation());
  if(c.interactionType==='electric')return cat(source)==='chargedPlate'||(['ordinary','spatialPoint'].includes(cat(source)) && charge(source) && separation());return false;
 }
 if(c.kind!=='force')return false;
 if(c.interactionType==='electric')return ['ordinary','spatialPoint'].includes(cat(source)) && ['ordinary','spatialPoint'].includes(cat(target)) && charge(source)&&charge(target)&&separation();
 if(cat(target)!=='ordinary')return false;
 if(c.interactionType==='gravitational')return cat(source)==='planetSurface'||(cat(source)==='ordinary' && separation());
 if(c.interactionType==='buoyant')return cat(source)==='fluid';
 if(c.interactionType==='contact')return c.contactType==='spring'?cat(source)==='spring':c.contactType==='cable'?cat(source)==='cable':['ordinary','planetSurface','chargedPlate'].includes(cat(source));return false;
}
export function anyEligible(doc:DiagramDocument,c:Partial<Configuration> & {kind:VectorChoice}){return doc.semantics.objects.some(target=>doc.semantics.objects.some(source=>eligibility(doc,{...c,targetId:target.id,sourceId:source.id})));}
export function choiceAvailable(doc:DiagramDocument,kind:VectorChoice){if(kind==='force')return (['gravitational','electric','contact','buoyant'] as const).some(interactionType=>interactionType==='contact'?(['ordinary','spring','cable'] as const).some(contactType=>anyEligible(doc,{kind,interactionType,contactType})):anyEligible(doc,{kind,interactionType}));if(kind==='field')return (['gravitational','electric'] as const).some(interactionType=>anyEligible(doc,{kind,interactionType}));return anyEligible(doc,{kind});}
