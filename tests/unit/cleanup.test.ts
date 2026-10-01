import {it,expect} from 'vitest';
import {DocumentStore,newGraphic,newDocument} from '../../src/model';
import {coordinateBasis,graphicalComponents,saveCoordinates} from '../../src/coordinates';
import {saveObject,objectDraft,presetDraft,objectGraphic} from '../../src/objects';
import {saveVector} from '../../src/physics';
import {parseDocument,serializeDocument} from '../../src/persistence';
const axes={id:'axes',dimensions:2 as 1|2,origin:[300,200] as [number,number],angle:0};
const combinations=[[false,false],[true,false],[false,true],[true,true]] as const;
function vector(angle:number){const g=newGraphic('arrow',newDocument());g.points=[0,0,100*Math.cos(angle*Math.PI/180),-100*Math.sin(angle*Math.PI/180)];return g;}
for(const [reverseX,reverseY] of combinations)for(const angle of [0,37,-143]){
 it(`reversed basis stays perpendicular and projections keep physical geometry ${reverseX}/${reverseY}/${angle}`,()=>{
  const basis=coordinateBasis(angle,reverseX,reverseY),original=coordinateBasis(angle);
  expect(basis.x[0]*basis.y[0]+basis.x[1]*basis.y[1]).toBeCloseTo(0);
  expect(Math.hypot(...basis.x)).toBeCloseTo(1);expect(Math.hypot(...basis.y)).toBeCloseTo(1);
  for(const axis of ['x','y'] as const)for(const index of [0,1])expect(basis[axis][index]).toBeCloseTo(original[axis][index]*(axis==='x'?reverseX? -1:1:reverseY? -1:1));
  const g=vector(angle+35),before=structuredClone(g),parts=graphicalComponents(g,{...axes,angle,reverseX,reverseY});
  expect(parts).toHaveLength(2);expect(parts[0].direction).toBe(reverseX?-1:1);expect(parts[1].direction).toBe(reverseY?-1:1);
  const conventional=graphicalComponents(g,{...axes,angle});for(let i=0;i<2;i++){expect(parts[i].dx).toBeCloseTo(conventional[i].dx);expect(parts[i].dy).toBeCloseTo(conventional[i].dy);}
  expect(parts.reduce((n,p)=>n+p.dx,0)).toBeCloseTo(g.points[2]);expect(parts.reduce((n,p)=>n+p.dy,0)).toBeCloseTo(g.points[3]);expect(g).toEqual(before);
 });
 it(`angular boundaries and 1D display stay invariant ${reverseX}/${reverseY}/${angle}`,()=>{
  for(const axis of [0,90,180,270])for(const offset of [-10,0,10])expect(graphicalComponents(vector(angle+axis+offset),{...axes,angle,reverseX,reverseY})).toEqual([]);
  for(const axis of [0,90,180,270])for(const offset of [-10.001,10.001])expect(graphicalComponents(vector(angle+axis+offset),{...axes,angle,reverseX,reverseY})).toHaveLength(2);
  expect(graphicalComponents(vector(angle+35),{...axes,angle,dimensions:1,reverseX,reverseY})).toHaveLength(1);
  for(const offset of [0,10,80,90,100,170,180])expect(graphicalComponents(vector(angle+offset),{...axes,angle,dimensions:1,reverseX,reverseY})).toEqual([]);
 });
}
it('reversals persist through dimensionality changes and legacy absence preserves directions',()=>{
 const s=new DocumentStore();const id=saveCoordinates(s,{...axes,id:undefined,angle:37,reverseX:true,reverseY:true});const c=s.document.semantics.coordinateSystems[0];saveCoordinates(s,{...c,dimensions:1});expect(s.document.semantics.coordinateSystems[0]).toMatchObject({id,angle:37,origin:[300,200],reverseX:true,reverseY:true});expect(parseDocument(serializeDocument(s.document))).toEqual(s.document);saveCoordinates(s,{...s.document.semantics.coordinateSystems[0],dimensions:2});expect(s.document.semantics.coordinateSystems[0].reverseY).toBe(true);
 const old=newDocument();old.semantics.coordinateSystems=[axes];expect(parseDocument(serializeDocument(old))).toEqual(old);expect(coordinateBasis(axes.angle,old.semantics.coordinateSystems[0].reverseX,old.semantics.coordinateSystems[0].reverseY)).toEqual(coordinateBasis(0));
 for(const key of ['reverseX','reverseY']){const malformed=JSON.parse(serializeDocument(s.document));malformed.semantics.coordinateSystems[0][key]='false';expect(()=>parseDocument(JSON.stringify(malformed))).toThrow('reversal');}
});
it('new Earth defaults are visible with independent name and gravity, without migrating older objects',()=>{
 const s=new DocumentStore(),id=saveObject(s,presetDraft('planetSurface'));const object=s.document.semantics.objects[0],gravity=s.document.semantics.variables[0];expect(object).toMatchObject({name:'Earth',category:'planetSurface'});expect(objectGraphic(s,id)).toMatchObject({visible:true,kind:'surface'});expect(gravity).toMatchObject({value:9.8,unit:'m/s^2'});
 saveObject(s,{...objectDraft(s,id),name:'Mars'});expect(s.document.semantics.variables.find(v=>v.id===gravity.id)?.value).toBe(9.8);
 const draft=objectDraft(s,id);draft.properties!.gravity!.value=3.7;saveObject(s,draft);expect(s.document.semantics.objects[0].name).toBe('Mars');saveObject(s,{...objectDraft(s,id),representation:'none'});const old=structuredClone(s.document);expect(parseDocument(serializeDocument(old))).toEqual(old);saveObject(s,objectDraft(s,id));expect(s.document.semantics.objects[0].name).toBe('Mars');expect(objectGraphic(s,id)?.visible).toBe(false);expect(s.document.semantics.variables[0].value).toBe(3.7);
});
it('duplicate weight BY/ON naming and persistent identities survive rotations and both reversals',()=>{
 const s=new DocumentStore(),earth=saveObject(s,presetDraft('planetSurface')),book=saveObject(s,{...objectDraft(s),name:'Book'});const d={kind:'force' as const,interactionType:'gravitational' as const,sourceId:earth,targetId:book,magnitude:{state:'unknown' as const,unit:'N'}};saveVector(s,d);saveVector(s,d);
 const before=structuredClone(s.document);const symbols=s.document.semantics.variables.filter(v=>v.ownerVectorId).map(v=>v.symbol);expect(new Set(symbols).size).toBe(2);expect(symbols.some(s=>s.endsWith(',2}'))).toBe(true);
 const id=saveCoordinates(s,{...axes,id:undefined});for(const [reverseX,reverseY]of combinations)saveCoordinates(s,{...axes,id,angle:37,reverseX,reverseY});expect(s.document.semantics.vectors).toEqual(before.semantics.vectors);expect(s.document.semantics.variables).toEqual(before.semantics.variables);expect(s.document.presentation).toEqual(before.presentation);expect(parseDocument(serializeDocument(s.document))).toEqual(s.document);
});
