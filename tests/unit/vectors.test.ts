import {it,expect} from 'vitest';
import {DocumentStore} from '../../src/model';
import {saveObject,presetDraft,objectGraphic} from '../../src/objects';
import {saveVector,saveSeparation,displayedVector,vectorGraphic,deleteInteraction} from '../../src/physics';
import {choiceAvailable,eligibility} from '../../src/eligibility';
import {parseDocument,serializeDocument} from '../../src/persistence';
const unknown={state:'unknown' as const,unit:'N'};
function ordinary(s:DocumentStore,name:string,properties={}){return saveObject(s,{name,representation:'circle',showName:true,showProperties:true,properties});}
it('near surface weight, spring, cable, buoyancy and motion have persistent physical definitions',()=>{
 const s=new DocumentStore(),book=ordinary(s,'Book'),planet=saveObject(s,presetDraft('planetSurface'));
 const w=saveVector(s,{kind:'force',interactionType:'gravitational',sourceId:planet,targetId:book,magnitude:unknown});expect(s.document.semantics.variables.find(v=>v.ownerVectorId===w)?.symbol).toMatch(/^W_/);
 for(const category of ['spring','cable','fluid'] as const){const source=saveObject(s,presetDraft(category));saveVector(s,{kind:'force',interactionType:category==='fluid'?'buoyant':'contact',contactType:category==='fluid'?undefined:category,sourceId:source,targetId:book,magnitude:unknown});}
 for(const kind of ['velocity','acceleration','displacement'] as const)saveVector(s,{kind,targetId:book,magnitude:{state:'unknown',unit:kind==='velocity'?'m/s':kind==='acceleration'?'m/s^2':'m'}});
 expect(parseDocument(serializeDocument(s.document))).toEqual(s.document);
});
it('electric and mass source fields require ordered separation; plate fields do not',()=>{
 const s=new DocumentStore(),source=ordinary(s,'Charge',{charge:{symbol:'q',unit:'C',state:'unknown'}}),point=saveObject(s,presetDraft('spatialPoint'));expect(eligibility(s.document,{kind:'field',interactionType:'electric',sourceId:source,targetId:point})).toBe(false);
 saveSeparation(s,{fromId:point,toId:source,magnitude:{state:'unknown',unit:'m'}});expect(eligibility(s.document,{kind:'field',interactionType:'electric',sourceId:source,targetId:point})).toBe(false);
 const sep=saveSeparation(s,{fromId:source,toId:point,magnitude:{state:'unknown',unit:'m'}});saveVector(s,{kind:'field',interactionType:'electric',sourceId:source,targetId:point,separationId:sep,magnitude:{state:'unknown',unit:'N/C'}});
 const plate=saveObject(s,presetDraft('chargedPlate'));saveVector(s,{kind:'field',interactionType:'electric',sourceId:plate,targetId:point,magnitude:{state:'unknown',unit:'N/C'}});expect(parseDocument(serializeDocument(s.document))).toEqual(s.document);
});
it('contact components stay perpendicular, independently sized, attached and geometrically summed',()=>{
 const s=new DocumentStore(),book=ordinary(s,'Book'),table=ordinary(s,'Table');const id=saveVector(s,{kind:'force',interactionType:'contact',contactType:'ordinary',sourceId:table,targetId:book,friction:'static',coefficient:{symbol:'mu',state:'known',unit:'1',value:.4},resultantVisible:true,magnitude:unknown,frictionMagnitude:unknown,angle:30,length:100,frictionLength:50});
 const vs=s.document.semantics.vectors,n=vs.find(v=>v.role==='normal')!,f=vs.find(v=>v.role==='friction')!,r=vs.find(v=>v.role==='resultant')!;const ng=displayedVector(s.document,n,vectorGraphic(s.document,n.id)!)!,fg=displayedVector(s.document,f,vectorGraphic(s.document,f.id)!)!,rg=displayedVector(s.document,r,vectorGraphic(s.document,r.id)!)!;expect(ng.points[2]*fg.points[2]+ng.points[3]*fg.points[3]).toBeCloseTo(0);expect(Math.hypot(fg.points[2],fg.points[3])).toBeCloseTo(50);expect(rg.points[2]).toBeCloseTo(ng.points[2]+fg.points[2]);s.update(objectGraphic(s,book)!.id,{x:100,y:120});expect(displayedVector(s.document,n,vectorGraphic(s.document,id)!)!.x).toBe(100);expect(parseDocument(serializeDocument(s.document))).toEqual(s.document);deleteInteraction(s,n.interactionId!);expect(s.document.semantics.variables).toHaveLength(0);expect(s.document.semantics.vectors).toHaveLength(0);
});
it('availability is structural and invalid creation leaves no orphan state',()=>{const s=new DocumentStore();expect(choiceAvailable(s.document,'force')).toBe(false);const a=ordinary(s,'A');expect(choiceAvailable(s.document,'velocity')).toBe(true);expect(choiceAvailable(s.document,'force')).toBe(false);const before=structuredClone(s.document);expect(()=>saveVector(s,{kind:'force',sourceId:a,targetId:a,interactionType:'contact',magnitude:unknown})).toThrow(/Unavailable/);expect(s.document).toEqual(before);});
