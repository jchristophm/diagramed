import { describe,it,expect } from 'vitest';
import { DocumentStore } from '../../src/model';
import { saveObject,objectDraft,objectGraphic,deleteObject } from '../../src/objects';
import { attachmentPoint } from '../../src/geometry';
describe('semantic object operations',()=>{
 it('unknown and known properties have stable variable references; undefined is absent',()=>{
 const store=new DocumentStore();const id=saveObject(store,{name:'Rock',representation:'circle',showName:true,showProperties:true,properties:{mass:{symbol:'m_2',state:'unknown',unit:'kg'}}});
 const variableId=store.document.semantics.objects[0].properties!.mass;
 expect(store.document.semantics.variables[0]).toMatchObject({id:variableId,state:'unknown',ownerObjectId:id,quantity:'mass'});expect(store.document.semantics.variables[0]).not.toHaveProperty('value');expect(store.document.semantics.objects[0].properties).not.toHaveProperty('charge');
 saveObject(store,{...objectDraft(store,id),properties:{mass:{symbol:'M',state:'known',unit:'kg',value:5.97e24}}});
 expect(store.document.semantics.variables[0]).toMatchObject({id:variableId,symbol:'M',state:'known',value:5.97e24});
 saveObject(store,{...objectDraft(store,id),properties:{mass:{symbol:'M',state:'unknown',unit:'kg'}}});expect(store.document.semantics.variables[0]).not.toHaveProperty('value');
 saveObject(store,{...objectDraft(store,id),properties:{}});expect(store.document.semantics.variables).toHaveLength(0);
 });
 it('rejects symbol ambiguity atomically and deletes owned variables',()=>{
 const store=new DocumentStore();const id=saveObject(store,{name:'Rock',representation:'circle',showName:true,showProperties:true,properties:{mass:{symbol:'m_2',state:'unknown',unit:'kg'}}});const before=structuredClone(store.document);
 expect(()=>saveObject(store,{name:'Other',representation:'point',showName:true,showProperties:true,properties:{mass:{symbol:'m_{2}',state:'known',unit:'kg',value:2}}})).toThrow(/already used/);expect(store.document).toEqual(before);
 expect(()=>saveObject(store,{...objectDraft(store,id),properties:{density:{symbol:'rho',state:'known',unit:'kg/m^3',value:-1}}})).toThrow(/nonnegative/);expect(store.document).toEqual(before);
 deleteObject(store,id);expect(store.document.semantics.variables).toHaveLength(0);
 });
 it('creates independent stable identities and preserves appearance while hidden',()=>{
 const store=new DocumentStore();const id=saveObject(store,{name:'Rock',representation:'circle',showName:true,showProperties:true});
 const g=objectGraphic(store,id)!;expect(g.id).not.toBe(id);store.update(g.id,{x:100,y:240});
 saveObject(store,{...objectDraft(store,id),name:'Stone',representation:'none'});expect(objectGraphic(store,id)).toMatchObject({id:g.id,x:100,y:240,visible:false});
 saveObject(store,{...objectDraft(store,id),representation:'circle'});expect(objectGraphic(store,id)).toMatchObject({id:g.id,visible:true,x:100,y:240});
 });
 it('validation leaves the model untouched and deletion removes linked graphics',()=>{
 const store=new DocumentStore(),before=structuredClone(store.document);expect(()=>saveObject(store,{name:' ',representation:'point',showName:true,showProperties:false})).toThrow();expect(store.document).toEqual(before);
 const id=saveObject(store,{name:'Table',representation:'rectangle',showName:true,showProperties:true});const g=objectGraphic(store,id)!;
 expect(attachmentPoint(g)).toEqual({x:g.x+g.width/2,y:g.y+g.height/2});deleteObject(store,id);expect(store.document.semantics.objects).toHaveLength(0);expect(store.document.presentation.elements).toHaveLength(0);
 });
});
