import type {DiagramDocument} from './model';
import type {PhysicalVector,PropertyQuantity} from './semantics';
import {physicalConstants} from './constants';
const canonical=(s:string)=>s.replace(/\s|[{}]/g,'');
const word=(s:string)=>s.replace(/[^a-zA-Z0-9]/g,'').slice(0,26)||'O';
const ordered=<T extends {id:string}>(items:T[])=>[...items].sort((a,b)=>a.id.localeCompare(b.id));
/** Stored abbreviations survive reordering/deletion. Names never establish semantic relationships. */
export function abbreviate(doc:DiagramDocument){
 const objects=ordered(doc.semantics.objects);
 for(const o of objects){if(!o.abbreviation || (o.abbreviationName!==undefined && o.abbreviationName!==o.name))o.abbreviation=word(o.name)[0];o.abbreviationName=o.name;}
 const names=new Map<string,typeof objects>();for(const o of objects){const k=word(o.name).toLowerCase();names.set(k,[...(names.get(k)||[]),o]);}
 for(const group of names.values()){if(group.length<2)continue;const base=word(group[0].name),used=new Set(group.map(o=>o.abbreviation!.toLowerCase()));for(const o of group){const suffix=o.abbreviation!.slice(base.length);if(o.abbreviation!.toLowerCase().startsWith(base.toLowerCase()) && /^\d+$/.test(suffix))continue;let n=1;while(used.has((base+n).toLowerCase()))n++;o.abbreviation=word(o.name)+n;used.add(o.abbreviation.toLowerCase());}}
 for(let pass=0;pass<125;pass++){
  const groups=new Map<string,typeof objects>();for(const o of objects){const k=o.abbreviation!.toLowerCase();groups.set(k,[...(groups.get(k)||[]),o]);}
  const conflicts=[...groups.values()].filter(g=>g.length>1);if(!conflicts.length)return;
  for(const group of conflicts){const same=group.every(o=>word(o.name).toLowerCase()===word(group[0].name).toLowerCase());
   if(same){group.forEach((o,i)=>o.abbreviation=word(o.name)+String(i+1));continue;}
   for(const o of group){const w=word(o.name);const length=Math.min(w.length,o.abbreviation!.length+1);o.abbreviation=w.slice(0,length);if(length===w.length && group.some(n=>n.id!==o.id && word(n.name).toLowerCase()===w.toLowerCase()))o.abbreviation+=String(group.filter(n=>word(n.name).toLowerCase()===w.toLowerCase()).findIndex(n=>n.id===o.id)+1);}
  }
 }
 // Prefix-identical names (e.g. A/A1) eventually receive deterministic unique suffixes.
 const used=new Set<string>();for(const o of objects){let base=o.abbreviation!,s=base,n=2;while(used.has(s.toLowerCase()))s=base+String(n++);o.abbreviation=s;used.add(s.toLowerCase());}
}
const ab=(doc:DiagramDocument,id?:string)=>doc.semantics.objects.find(o=>o.id===id)?.abbreviation||'O';
export function propertySymbol(doc:DiagramDocument,objectId:string,q:PropertyQuantity){
 const prefixes:Record<PropertyQuantity,string>={mass:'m',charge:'q',density:'\\rho',gravity:'g',springConstant:'k',extension:'\\Delta x',surfaceChargeDensity:'\\sigma'};
 const object=doc.semantics.objects.find(o=>o.id===objectId);const single=['gravity','springConstant','extension'].includes(q) && doc.semantics.objects.filter(o=>o.category===object?.category).length===1;
 return single?prefixes[q]:`${prefixes[q]}_{${ab(doc,objectId)}}`;
}
export function interactionSymbol(doc:DiagramDocument,interactionId:string,q:string){const i=doc.semantics.interactions.find(i=>i.id===interactionId);const p=q==='staticFriction'?'\\mu':q==='kineticFriction'?'\\mu':'V';const sub=q==='staticFriction'?'s,':q==='kineticFriction'?'k,':'disp,';return `${p}_{${sub}${ab(doc,i?.sourceId)},${ab(doc,i?.targetId)}}`;}
export function vectorSymbol(doc:DiagramDocument,v:PhysicalVector){
 if(v.kind==='separation')return `r_{${ab(doc,v.fromId)},${ab(doc,v.toId)}}`;
 if(v.kind==='motion')return `${v.motionType==='velocity'?'v':v.motionType==='acceleration'?'a':'\\Delta r'}_{${ab(doc,v.objectId)}}`;
 if(v.kind==='field')return `${v.fieldType==='gravitational'?'g':'E'}_{${ab(doc,v.sourceId)},${ab(doc,v.objectId)}}`;
 const i=doc.semantics.interactions.find(i=>i.id===v.interactionId);const p=v.role==='normal'?'N':v.role==='friction'?'f':i?.model==='nearSurface'?'W':i?.model==='cable'?'T':'F';return `${p}_{${ab(doc,i?.sourceId)},${ab(doc,v.objectId)}}`;
}
export function vectorLatex(symbol:string){if(/^\\(?:vec|overrightarrow)\{/.test(symbol))return symbol;const at=symbol.indexOf('_');return at<0?`\\vec{${symbol}}`:`\\vec{${symbol.slice(0,at)}}${symbol.slice(at)}`;}
/** Only the unambiguous historical generic contact component gets corrected. Other authored notation stays custom. */
export function repairContactNotation(doc:DiagramDocument){
 for(const v of doc.semantics.vectors){if(v.role!=='normal')continue;const m=doc.semantics.variables.find(n=>n.id===v.variableId),i=doc.semantics.interactions.find(i=>i.id===v.interactionId);
  if(!m || !i?.friction || canonical(m.symbol)!==canonical(vectorSymbol(doc,{...v,role:undefined})))continue;
  m.generatedSymbol=true;
  for(const role of ['normal','friction','resultant'] as const){const component=doc.semantics.vectors.find(n=>n.interactionId===i.id && n.role===role),variable=component && doc.semantics.variables.find(n=>n.id===component.variableId);if(!component || !variable?.generatedSymbol)continue;const base=vectorSymbol(doc,component);let symbol=base,n=2;while(doc.semantics.variables.some(other=>other.id!==variable.id && canonical(other.symbol)===canonical(symbol)))symbol=`${base.slice(0,-1)},${n++}}`;variable.symbol=symbol;}
 }
}
export function synchronizeSymbols(doc:DiagramDocument){
 abbreviate(doc);repairContactNotation(doc);
 const taken=new Set([...Object.values(physicalConstants).map(c=>canonical(c.symbol)),...doc.semantics.variables.filter(v=>!v.generatedSymbol).map(v=>canonical(v.symbol))]);
 for(const v of ordered(doc.semantics.variables)){if(!v.generatedSymbol)continue;let base:string|undefined;
  if(v.ownerObjectId)base=propertySymbol(doc,v.ownerObjectId,v.quantity as PropertyQuantity);
  else if(v.ownerInteractionId)base=interactionSymbol(doc,v.ownerInteractionId,v.quantity!);
  else {const vector=doc.semantics.vectors.find(n=>n.variableId===v.id);if(vector)base=vectorSymbol(doc,vector);}
  if(!base)continue;let symbol=base,n=2;while(taken.has(canonical(symbol)))symbol=base.endsWith('}')?`${base.slice(0,-1)},${n++}}`:`${base}_{${n++}}`;v.symbol=symbol;taken.add(canonical(symbol));
 }
}
export function generatedMagnitudeSymbol(doc:DiagramDocument,v?:PhysicalVector,q?:string){if(v)return vectorSymbol(doc,v);return q==='staticFriction'?'\\mu_s':q==='kineticFriction'?'\\mu_k':q==='volume'?'V_{disp}':'';}
