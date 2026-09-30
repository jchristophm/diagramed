import {it,expect} from 'vitest';
import {DocumentStore} from '../../src/model';
import {saveObject,deleteObject,objectGraphic} from '../../src/objects';
import {saveSeparation,displayedVector,vectorGraphic,deleteVector,saveInteraction,magnitudeVariable} from '../../src/physics';
import {parseDocument,serializeDocument} from '../../src/persistence';
import {physicalConstants} from '../../src/constants';
it('separation follows endpoints without changing physical magnitude and protects dependencies',()=>{
 const s=new DocumentStore(),a=saveObject(s,{name:'Earth',representation:'circle',showName:true,showProperties:true}),b=saveObject(s,{name:'Emu',representation:'circle',showName:true,showProperties:true});const id=saveSeparation(s,{fromId:a,toId:b,magnitude:{state:'known',unit:'m',value:2}}),v=s.document.semantics.vectors[0],g=vectorGraphic(s.document,id)!;
 expect(s.document.semantics.objects.map(o=>o.abbreviation)).toEqual(['Ea','Em']);s.update(objectGraphic(s,b)!.id,{x:500,y:100});expect(displayedVector(s.document,v,g)!.points.slice(2)).toEqual([100,-200]);expect(s.document.semantics.variables.find(n=>n.id===v.variableId)!.value).toBe(2);expect(()=>deleteObject(s,a)).toThrow(/dependent/);const i=saveInteraction(s,{kind:'gravitational',model:'universal',sourceId:a,targetId:b,separationId:id,properties:{}});const volumeId=crypto.randomUUID();magnitudeVariable(s.document,volumeId,{ownerInteractionId:i},'volume',{state:'unknown',unit:'m^3'},'V_disp');s.document.semantics.interactions[0].properties={volume:volumeId};expect(parseDocument(serializeDocument(s.document))).toEqual(s.document);expect(()=>deleteVector(s,id)).toThrow(/dependent/);
});
it('constant identities and values are canonical and immutable',()=>{expect(physicalConstants['constant:G'].value).toBe(6.67430e-11);expect(Object.isFrozen(physicalConstants['constant:ke'])).toBe(true);expect(physicalConstants['constant:ke'].symbol).toBe('k_e');});
it('invalid separation confirmation is atomic',()=>{const s=new DocumentStore(),before=structuredClone(s.document);expect(()=>saveSeparation(s,{fromId:'x',toId:'x',magnitude:{state:'unknown',unit:'m'}})).toThrow();expect(s.document).toEqual(before);});
