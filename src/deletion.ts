import {DocumentStore,type DiagramDocument} from './model';
import {references,assertExpressions} from './expressions';
import {synchronizeSymbols} from './naming';
import {eligibility} from './eligibility';
import {validateRelationships} from './persistence';
export type DeleteTarget={kind:'object'|'interaction'|'vector'|'variable'|'coordinates';id:string};
/** One dependency closure, shared by deletion and removal inside configuration. */
export function removeDependencies(doc:DiagramDocument,targets:DeleteTarget[]){
 if(!targets.length)return;
 const objects=new Set<string>(),interactions=new Set<string>(),vectors=new Set<string>(),variables=new Set<string>(),components=new Set<string>(),coordinates=new Set<string>();
 for(const t of targets)({object:objects,interaction:interactions,vector:vectors,variable:variables,coordinates}[t.kind]).add(t.id);
 // A linked contact force is deleted as its semantic group from every entry point.
 for(const v of doc.semantics.vectors)if(vectors.has(v.id)&&v.role&&v.interactionId)interactions.add(v.interactionId);
 let previous=-1;
 while(previous!==objects.size+interactions.size+vectors.size+variables.size+components.size){
  previous=objects.size+interactions.size+vectors.size+variables.size+components.size;
  for(const o of doc.semantics.objects)if(objects.has(o.id))for(const id of Object.values(o.properties||{}))variables.add(id);
  for(const i of doc.semantics.interactions)if(i.objectIds.some(id=>objects.has(id))||objects.has(i.sourceId||'')||objects.has(i.targetId||'')||vectors.has(i.separationId||''))interactions.add(i.id);
  for(const v of doc.semantics.vectors){
   if([v.objectId,v.sourceId,v.fromId,v.toId].some(id=>objects.has(id||''))||interactions.has(v.interactionId||'')||vectors.has(v.separationId||'')||variables.has(v.variableId))vectors.add(v.id);
   if(vectors.has(v.id))variables.add(v.variableId);
   if(v.interactionId&&vectors.has(v.id)&&!doc.semantics.vectors.some(n=>n.interactionId===v.interactionId&&!vectors.has(n.id)))interactions.add(v.interactionId);
  }
  for(const i of doc.semantics.interactions)if(interactions.has(i.id))for(const id of Object.values(i.properties||{}))variables.add(id);
  for(const v of doc.semantics.variables)if(objects.has(v.ownerObjectId||'')||interactions.has(v.ownerInteractionId||'')||vectors.has(v.ownerVectorId||''))variables.add(v.id);
  for(const c of doc.semantics.components)if(vectors.has(c.vectorId)||coordinates.has(c.coordinateSystemId)||variables.has(c.variableId)){components.add(c.id);variables.add(c.variableId);}
  // Removing an optional charge/mass can destroy a field/interaction's eligibility.
  const remaining=structuredClone(doc);remaining.semantics.vectors=remaining.semantics.vectors.filter(v=>!vectors.has(v.id));
  for(const o of remaining.semantics.objects)o.properties=Object.fromEntries(Object.entries(o.properties||{}).filter(([,id])=>!variables.has(id)));
  for(const v of remaining.semantics.vectors){const i=doc.semantics.interactions.find(i=>i.id===v.interactionId);
   const c={kind:v.kind==='motion'?v.motionType!:v.kind,sourceId:v.fromId||v.sourceId||i?.sourceId,targetId:v.toId||v.objectId,interactionType:(v.fieldType||i?.kind) as 'electric'|'gravitational'|'contact'|'buoyant',contactType:i?.model as 'ordinary'|'spring'|'cable',separationId:v.separationId||i?.separationId};
   if(!eligibility(remaining,c)){vectors.add(v.id);if(v.interactionId)interactions.add(v.interactionId);}
  }
 }
 doc.semantics.objects=doc.semantics.objects.filter(o=>!objects.has(o.id));
 doc.semantics.interactions=doc.semantics.interactions.filter(i=>!interactions.has(i.id));
 doc.semantics.vectors=doc.semantics.vectors.filter(v=>!vectors.has(v.id));
 doc.semantics.components=doc.semantics.components.filter(c=>!components.has(c.id));
 doc.semantics.coordinateSystems=doc.semantics.coordinateSystems.filter(c=>!coordinates.has(c.id));
 doc.semantics.variables=doc.semantics.variables.filter(v=>!variables.has(v.id));
 for(const parent of [...doc.semantics.objects,...doc.semantics.interactions])if(parent.properties)parent.properties=Object.fromEntries(Object.entries(parent.properties).filter(([,id])=>!variables.has(id)));
 for(const v of doc.semantics.variables)if(v.expression&&references(v.expression).some(id=>variables.has(id))){v.state='unknown';delete v.expression;delete v.value;}
 for(const v of doc.semantics.vectors)if(coordinates.has(v.componentAngle?.coordinateSystemId||''))delete v.componentAngle;
 doc.presentation.elements=doc.presentation.elements.filter(g=>!objects.has(g.semanticId||'')&&!vectors.has(g.vectorId||'')&&!components.has(g.semanticId||'')&&!variables.has(g.semanticId||''));
 if(coordinates.size)for(const g of doc.presentation.elements)if(g.vectorId)delete g.showComponents;
}
export function deletionDocument(document:DiagramDocument,target:DeleteTarget){const doc=structuredClone(document);removeDependencies(doc,[target]);synchronizeSymbols(doc);assertExpressions(doc);validateRelationships(doc);doc.metadata.updatedAt=new Date().toISOString();return doc;}
export function deleteSemantic(store:DocumentStore,target:DeleteTarget){store.replace(deletionDocument(store.document,target));}
