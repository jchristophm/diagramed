import {it,expect} from 'vitest';
import {DocumentStore} from '../../src/model';
import {saveObject,presetDraft,objectDraft} from '../../src/objects';
import {saveVector,vectorGraphic,displayedVector} from '../../src/physics';
import {parseDocument,serializeDocument} from '../../src/persistence';
import {expressionLatex,expressionVocabulary,references,validateExpression} from '../../src/expressions';
import {quantityLabel} from '../../src/quantity-labels';
import {EditorController} from '../../src/vendor/mathed/controller';
import type {Expression} from '../../src/semantics';
it('Mathed trees retain nested structures, persistent IDs, renames and rendered definitions',()=>{
 const s=new DocumentStore(),b=saveObject(s,{...presetDraft('ordinary'),name:'Book',properties:{mass:{state:'unknown',unit:'kg'}}}),mass=s.document.semantics.objects[0].properties!.mass;
 const e:Expression={type:'mathed',expression:[{type:'fraction',numerator:[{type:'variable',id:mass}],denominator:[{type:'power',base:[{type:'constant',name:'pi'}],exponent:[{type:'number',value:'2'}]}]}]};
 const id=saveVector(s,{kind:'velocity',targetId:b,magnitude:{state:'expression',expression:e,unit:'m/s'}}),v=s.document.semantics.variables.find(v=>v.ownerVectorId===id)!;expect(references(e)).toEqual([mass]);expect(quantityLabel(v,undefined,s.document)).toContain('\\frac');
 saveObject(s,{...objectDraft(s,b),name:'Novel'});expect(expressionLatex(e,s.document)).toContain('m_{N}');expect(parseDocument(serializeDocument(s.document))).toEqual(s.document);
});
it('friction implies an unknown dimensionless coefficient, preserving its ID when defined or cleared',()=>{
 const s=new DocumentStore(),b=saveObject(s,{...presetDraft('ordinary'),name:'Book'}),r=saveObject(s,{...presetDraft('ordinary'),name:'Ramp'}),d={kind:'force' as const,interactionType:'contact' as const,contactType:'ordinary' as const,sourceId:r,targetId:b,friction:'static' as const,magnitude:{state:'unknown' as const,unit:'N'}};
 const id=saveVector(s,d),i=s.document.semantics.interactions[0],mu=i.properties!.staticFriction;expect(s.document.semantics.variables.find(v=>v.id===mu)).toMatchObject({state:'unknown',unit:'1'});
 saveVector(s,{...d,id,coefficient:{state:'known',unit:'1',value:.3}});expect(s.document.semantics.interactions[0].properties!.staticFriction).toBe(mu);saveVector(s,{...d,id});expect(s.document.semantics.variables.find(v=>v.id===mu)).toMatchObject({state:'unknown',unit:'1'});expect(expressionVocabulary(s.document).map(v=>v.id)).toContain(mu);
});
it('full unknown vocabulary permits wrong relationships and cycles while missing IDs remain invalid',()=>{
 const s=new DocumentStore(),b=saveObject(s,{...presetDraft('ordinary'),name:'Book',properties:{mass:{state:'unknown',unit:'kg'}}}),v=saveVector(s,{kind:'velocity',targetId:b,magnitude:{state:'unknown',unit:'m/s'}}),m=s.document.semantics.variables.find(m=>m.ownerVectorId===v)!;
 saveVector(s,{id:v,kind:'velocity',targetId:b,magnitude:{state:'expression',unit:'m/s',expression:{type:'reference',id:m.id}}});expect(parseDocument(serializeDocument(s.document))).toEqual(s.document);expect(expressionVocabulary(s.document)).toHaveLength(s.document.semantics.variables.length+2);
 expect(()=>validateExpression({type:'mathed',expression:[{type:'variable',id:'missing'}]},new Set())).toThrow(/unavailable/);
 expect(()=>validateExpression({type:'mathed',expression:[{type:'fraction',numerator:[],denominator:[]}]},new Set())).toThrow();
});
it('motion position stays free when its object moves; force attachment remains derived',()=>{
 const s=new DocumentStore(),b=saveObject(s,{...presetDraft('ordinary'),name:'Book'}),r=saveObject(s,{...presetDraft('ordinary'),name:'Ramp'}),motion=saveVector(s,{kind:'acceleration',targetId:b,magnitude:{state:'unknown',unit:'m/s^2'}}),force=saveVector(s,{kind:'force',interactionType:'contact',contactType:'ordinary',sourceId:r,targetId:b,magnitude:{state:'unknown',unit:'N'}});
 const mg=vectorGraphic(s.document,motion)!;mg.x=120;mg.y=-70;const bg=s.document.presentation.elements.find(g=>g.semanticId===b)!;bg.x=300;bg.y=400;
 expect(displayedVector(s.document,s.document.semantics.vectors.find(v=>v.id===motion)!,mg)).toMatchObject({x:120,y:-70});expect(displayedVector(s.document,s.document.semantics.vectors.find(v=>v.id===force)!,vectorGraphic(s.document,force)!)).toMatchObject({x:300,y:400});expect(parseDocument(serializeDocument(s.document))).toEqual(s.document);
});
it('reused Mathed controller inserts into nested cursors and repeated Backspace removes the whole expression',()=>{
 const c=new EditorController({mode:'controlled',vocabulary:[{id:'m',symbol:'m'}]});c.insertStructure('fraction');c.chooseVariable('m');c.nextSlot();c.input('2');c.commitBuffer();c.exit();c.insertStructure('power');c.chooseVariable('m');c.nextSlot();c.input('2');c.commitBuffer();c.home(true);
 for(let i=0;i<80&&c.expression.length;i++)c.delete();expect(c.expression).toEqual([]);
});
it('legacy motion graphics adopt their attached origin once and future free positions persist',()=>{
 const s=new DocumentStore(),b=saveObject(s,{...presetDraft('ordinary'),name:'Book'}),v=saveVector(s,{kind:'velocity',targetId:b,magnitude:{state:'unknown',unit:'m/s'}}),g=vectorGraphic(s.document,v)!;delete g.motionPlacement;const object=s.document.presentation.elements.find(g=>g.semanticId===b)!;object.x=250;object.y=100;
 const first=parseDocument(serializeDocument(s.document)),fg=vectorGraphic(first,v)!;expect(fg).toMatchObject({x:250,y:100,motionPlacement:'free'});fg.x=400;fg.y=300;expect(parseDocument(serializeDocument(first))).toEqual(first);
});
it('legacy friction without a coefficient acquires an unknown coefficient on load',()=>{
 const s=new DocumentStore(),b=saveObject(s,{...presetDraft('ordinary'),name:'Book'}),r=saveObject(s,{...presetDraft('ordinary'),name:'Ramp'});saveVector(s,{kind:'force',interactionType:'contact',contactType:'ordinary',sourceId:r,targetId:b,friction:'kinetic',magnitude:{state:'unknown',unit:'N'}});const i=s.document.semantics.interactions[0],mu=i.properties!.kineticFriction;delete i.properties!.kineticFriction;s.document.semantics.variables=s.document.semantics.variables.filter(v=>v.id!==mu);
 const first=parseDocument(serializeDocument(s.document)),id=first.semantics.interactions[0].properties!.kineticFriction;expect(first.semantics.variables.find(v=>v.id===id)).toMatchObject({symbol:'\\mu_{k,R,B}',state:'unknown',unit:'1'});expect(parseDocument(serializeDocument(first))).toEqual(first);
});
