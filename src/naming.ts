import type {DiagramDocument} from './model';
import type {PhysicalVector} from './semantics';
/** Names only generate presentation symbols; every relationship uses IDs. */
export function abbreviate(doc:DiagramDocument){
 const objects=doc.semantics.objects;
 for(const o of objects){const word=o.name.replace(/[^a-zA-Z0-9]/g,'')||'O';let length=1;while(length<word.length && objects.some(other=>other.id!==o.id && (other.name.replace(/[^a-zA-Z0-9]/g,'')||'O').slice(0,length).toLowerCase()===word.slice(0,length).toLowerCase()))length++;let ab=word.slice(0,length);const same=objects.filter(other=>(other.name.replace(/[^a-zA-Z0-9]/g,'')||'O').toLowerCase()===word.toLowerCase());if(same.length>1)ab+=String(same.findIndex(other=>other.id===o.id)+1);o.abbreviation=ab;}
}
export function vectorSymbol(doc:DiagramDocument,v:PhysicalVector){
 const ab=(id?:string)=>doc.semantics.objects.find(o=>o.id===id)?.abbreviation || 'O';
 if(v.kind==='separation')return `r_{${ab(v.fromId)},${ab(v.toId)}}`;
 if(v.kind==='motion')return `${v.motionType==='velocity'?'v':v.motionType==='acceleration'?'a':'\\Delta r'}_{${ab(v.objectId)}}`;
 if(v.kind==='field')return `${v.fieldType==='gravitational'?'g':'E'}_{${ab(v.sourceId)},${ab(v.objectId)}}`;
 const i=doc.semantics.interactions.find(i=>i.id===v.interactionId);const prefix=v.role==='normal'?'N':v.role==='friction'?'f':i?.model==='nearSurface'?'W':i?.model==='cable'?'T':'F';return `${prefix}_{${ab(i?.sourceId)},${ab(v.objectId)}}`;
}
export function synchronizeSymbols(doc:DiagramDocument){
 abbreviate(doc);const taken=new Set(doc.semantics.variables.filter(v=>!v.generatedSymbol).map(v=>v.symbol.replace(/\s|[{}]/g,'')));
 for(const vector of doc.semantics.vectors){const variable=doc.semantics.variables.find(v=>v.id===vector.variableId);if(!variable?.generatedSymbol)continue;const base=vectorSymbol(doc,vector);let symbol=base,n=2;while(taken.has(symbol.replace(/\s|[{}]/g,'')))symbol=`${base.slice(0,-1)},${n++}}`;variable.symbol=symbol;taken.add(symbol.replace(/\s|[{}]/g,''));}
}
