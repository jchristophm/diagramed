import {it,expect} from 'vitest';
import {DocumentStore} from '../../src/model';
import {saveObject} from '../../src/objects';
import {saveVector,saveSeparation,deleteVector,vectorGraphic,deleteInteraction} from '../../src/physics';
import {saveCoordinates,deleteCoordinates,graphicalComponents} from '../../src/coordinates';
import {componentAngleGeometry,componentAngleValues,componentAngleSymbol,componentAngleLabel,applyComponentAngle,clearChangedComponentAngles,angleGraphic} from '../../src/component-angles';
import {parseDocument,serializeDocument} from '../../src/persistence';
function fixture(direction=30,rotation=0,reverseX=false,reverseY=false){const s=new DocumentStore(),book=saveObject(s,{name:'Book',representation:'circle',showName:true,showProperties:true});const v=saveVector(s,{kind:'velocity',targetId:book,magnitude:{state:'unknown',unit:'m/s'},angle:-direction,length:100});const c=saveCoordinates(s,{dimensions:2,angle:rotation,reverseX,reverseY,origin:[80,120]});return {s,book,v,c,vector:s.document.semantics.vectors[0]};}
for(const rotation of [0,37,-48])for(const direction of [30,150,210,330])for(const reversal of [[false,false],[true,false],[false,true],[true,true]])it(`acute signed angles ${rotation}/${direction}/${reversal}`,()=>{
 const {s,vector}=fixture(rotation+direction,rotation,...reversal as [boolean,boolean]),g=angleGraphic(s.document,vector)!,before=structuredClone(s.document),a=componentAngleGeometry(g,s.document);
 expect(a).toHaveLength(2);expect(a.reduce((sum,p)=>sum+Math.abs(p.sweep)*180/Math.PI,0)).toBeCloseTo(90);for(const p of a)expect(Math.abs(p.sweep)*180/Math.PI).toBeCloseTo(p.axis==='x'?30:60);expect(s.document).toEqual(before);expect(componentAngleLabel(s.document,vector,'x')).toBe('\\theta_{v,x}');
});
for(const axis of [0,90,180,270])for(const delta of [9.999,10,10.001])it(`same 10 degree rule ${axis}/${delta}`,()=>{
 const {s,vector}=fixture(axis+delta+23,23,true,true),g=angleGraphic(s.document,vector)!;
 expect(componentAngleGeometry(g,s.document).length).toBe(graphicalComponents(g,s.document.semantics.coordinateSystems[0]).length);expect(componentAngleGeometry(g,s.document)).toHaveLength(delta>10?2:0);
});
for(const direction of [30,150,210,330])for(const rotation of [0,37])for(const axis of ['x','y'] as const)it(`nearest constraint preserves tail and magnitude ${direction}/${rotation}/${axis}`,()=>{
 const {s,v,c,vector}=fixture(direction+rotation,rotation,true,true),before=angleGraphic(s.document,vector)!;
 applyComponentAngle(s.document,v,{coordinateSystemId:c,axis,value:40});const g=angleGraphic(s.document,vector)!;
 expect(Math.hypot(g.points[2],g.points[3])).toBeCloseTo(100);expect([g.x,g.y]).toEqual([before.x,before.y]);expect(g.points[2]*before.points[2]+g.points[3]*before.points[3]).toBeGreaterThan(0);
 expect(Math.abs(componentAngleGeometry(g,s.document).find(p=>p.axis===axis)!.sweep)*180/Math.PI).toBeCloseTo(40);expect(componentAngleValues(vector)?.[axis==='x'?'y':'x']).toBe(50);expect(parseDocument(serializeDocument(s.document))).toEqual(s.document);
});
it('one authored axis persists, replaces and clears; definitions survive hidden overlays and reload',()=>{
 const {s,v,c,vector}=fixture();applyComponentAngle(s.document,v,{coordinateSystemId:c,axis:'x',value:30});expect(componentAngleValues(vector)).toEqual({x:30,y:60});
 applyComponentAngle(s.document,v,{coordinateSystemId:c,axis:'y',value:25});expect(vector.componentAngle).toEqual({coordinateSystemId:c,axis:'y',value:25});expect(componentAngleLabel(s.document,vector,'x')).toBe('\\theta_{v,x}=65^\\circ');vector.showAngles=false;vectorGraphic(s.document,v)!.showComponents=false;expect(parseDocument(serializeDocument(s.document))).toEqual(s.document);
 applyComponentAngle(s.document,v,undefined);expect(componentAngleLabel(s.document,vector,'x')).toBe('\\theta_{v,x}');
});
it('coordinate configuration and deletion invalidate without changing physical vectors',()=>{
 const {s,v,c}=fixture();for(const patch of [{angle:35},{reverseX:true},{reverseY:true},{dimensions:1 as const}]){
  saveCoordinates(s,{...s.document.semantics.coordinateSystems[0],dimensions:2});applyComponentAngle(s.document,v,{coordinateSystemId:c,axis:'x',value:30});const before=structuredClone(vectorGraphic(s.document,v));saveCoordinates(s,{...s.document.semantics.coordinateSystems[0],...patch});expect(s.document.semantics.vectors[0].componentAngle).toBeUndefined();expect(vectorGraphic(s.document,v)).toEqual(before);
 }
 saveCoordinates(s,{...s.document.semantics.coordinateSystems[0],dimensions:2});applyComponentAngle(s.document,v,{coordinateSystemId:c,axis:'x',value:30});const before=structuredClone(vectorGraphic(s.document,v));deleteCoordinates(s);expect(s.document.semantics.vectors[0].componentAngle).toBeUndefined();expect(vectorGraphic(s.document,v)).toEqual(before);
});
it('origin/visibility and length changes preserve definitions; independent direction changes clear',()=>{
 const {s,v,c}=fixture();applyComponentAngle(s.document,v,{coordinateSystemId:c,axis:'x',value:30});saveCoordinates(s,{...s.document.semantics.coordinateSystems[0],origin:[200,300],visible:false});expect(s.document.semantics.vectors[0].componentAngle).toBeDefined();
 let before=structuredClone(s.document),g=vectorGraphic(s.document,v)!;g.points=[0,0,g.points[2]*2,g.points[3]*2];clearChangedComponentAngles(s.document,before);expect(s.document.semantics.vectors[0].componentAngle).toBeDefined();before=structuredClone(s.document);g.points=[0,0,60,-60];clearChangedComponentAngles(s.document,before);expect(s.document.semantics.vectors[0].componentAngle).toBeUndefined();
});
it('same-type vectors use existing participant/disambiguated notation and x/y axis names',()=>{
 const {s,book}=fixture();saveVector(s,{kind:'velocity',targetId:book,magnitude:{state:'unknown',unit:'m/s'}});const symbols=s.document.semantics.vectors.map(v=>componentAngleSymbol(s.document,v,'x'));expect(new Set(symbols).size).toBe(2);expect(symbols.every(s=>!s.includes('-x'))).toBe(true);
});
it('obsolete generic records including malformed/dangling entries are dropped, with no deletion restrictions',()=>{
 const {s,v,c}=fixture();const raw=JSON.parse(serializeDocument(s.document));raw.semantics.angles=[{id:c,from:{vectorId:'missing'},presentation:null}];const doc=parseDocument(JSON.stringify(raw));expect(doc.semantics).not.toHaveProperty('angles');const store=new DocumentStore(doc);deleteVector(store,v);deleteCoordinates(store);expect(store.document.semantics.vectors).toHaveLength(0);
});
it('contact constraints rotate the linked group and preserve lengths',()=>{
 const {s,book,c}=fixture();const table=saveObject(s,{name:'Table',representation:'rectangle',showName:true,showProperties:true});const normal=saveVector(s,{kind:'force',interactionType:'contact',contactType:'ordinary',sourceId:table,targetId:book,friction:'static',magnitude:{state:'unknown',unit:'N'},angle:-40,length:100,frictionLength:50});const group=s.document.semantics.vectors.filter(v=>v.interactionId===s.document.semantics.vectors.find(v=>v.id===normal)!.interactionId);
 for(const v of group){applyComponentAngle(s.document,v.id,{coordinateSystemId:c,axis:'x',value:35});expect(Math.abs(componentAngleGeometry(angleGraphic(s.document,v)!,s.document).find(p=>p.axis==='x')!.sweep)*180/Math.PI).toBeCloseTo(35);}
 expect(Math.hypot(...vectorGraphic(s.document,normal)!.points.slice(2))).toBeCloseTo(100);deleteInteraction(s,group[0].interactionId!);
});
it('1D/zero vectors have no angles and malformed authored state is rejected',()=>{
 const {s,v,c,book,vector}=fixture();for(const value of [-1,91,NaN,Infinity])expect(()=>applyComponentAngle(s.document,v,{coordinateSystemId:c,axis:'x',value})).toThrow();saveCoordinates(s,{...s.document.semantics.coordinateSystems[0],dimensions:1});expect(componentAngleGeometry(angleGraphic(s.document,vector)!,s.document)).toEqual([]);
 saveCoordinates(s,{...s.document.semantics.coordinateSystems[0],dimensions:2});saveVector(s,{id:v,kind:'velocity',targetId:book,magnitude:{state:'known',unit:'m/s',value:0}});expect(angleGraphic(s.document,s.document.semantics.vectors[0])).toBeUndefined();
 for(const a of [{coordinateSystemId:'missing',axis:'x',value:30},{coordinateSystemId:c,axis:'z',value:30},{coordinateSystemId:c,axis:'x',value:'30'}]){const raw=JSON.parse(serializeDocument(s.document));raw.semantics.vectors[0].componentAngle=a;expect(()=>parseDocument(JSON.stringify(raw))).toThrow(/component-angle/);}
});
it('separation constraints retain FROM, magnitude and endpoint attachment; endpoint moves invalidate',()=>{
 const {s,book,c}=fixture(),other=saveObject(s,{name:'Ball',representation:'circle',showName:true,showProperties:true});s.document.presentation.elements.find(g=>g.semanticId===other)!.x=100;s.document.presentation.elements.find(g=>g.semanticId===other)!.y=-100;
 const id=saveSeparation(s,{fromId:book,toId:other,magnitude:{state:'unknown',unit:'m'}}),vector=s.document.semantics.vectors.find(v=>v.id===id)!,before=angleGraphic(s.document,vector)!;
 applyComponentAngle(s.document,id,{coordinateSystemId:c,axis:'x',value:30});const after=angleGraphic(s.document,vector)!;expect([after.x,after.y]).toEqual([before.x,before.y]);expect(Math.hypot(after.points[2],after.points[3])).toBeCloseTo(Math.hypot(before.points[2],before.points[3]));expect(Math.abs(componentAngleGeometry(after,s.document)[0].sweep)*180/Math.PI).toBeCloseTo(30);expect(parseDocument(serializeDocument(s.document))).toEqual(s.document);
 const prior=structuredClone(s.document);s.document.presentation.elements.find(g=>g.semanticId===other)!.y-=30;clearChangedComponentAngles(s.document,prior);expect(vector.componentAngle).toBeUndefined();
});
it('known-zero edits clear existing angle definitions without inventing replacements',()=>{
 const {s,book,v,c}=fixture();applyComponentAngle(s.document,v,{coordinateSystemId:c,axis:'x',value:30});saveVector(s,{id:v,kind:'velocity',targetId:book,magnitude:{state:'known',value:0,unit:'m/s'}});expect(s.document.semantics.vectors[0].componentAngle).toBeUndefined();
});
