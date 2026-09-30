import { describe,it,expect } from 'vitest';
import { DocumentStore } from '../../src/model';
import { saveObject,objectDraft,objectGraphic,deleteObject } from '../../src/objects';
import { attachmentPoint } from '../../src/geometry';
describe('semantic object operations',()=>{
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
