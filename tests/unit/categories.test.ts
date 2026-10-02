import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {DocumentStore} from '../../src/model';
import {presetDraft,saveObject,objectDraft,objectGraphic,setObjectVisibility} from '../../src/objects';
import {parseDocument,serializeDocument,migrateDocumentSpace} from '../../src/persistence';
import type {ObjectCategory} from '../../src/semantics';
it.each(['spatialPoint','planetSurface','spring','cable','chargedPlate','fluid'] as ObjectCategory[])('round trips specialized %s with stable hidden configuration',category=>{
 const s=new DocumentStore();const id=saveObject(s,presetDraft(category));const g=objectGraphic(s,id)!;setObjectVisibility(s,id,false);setObjectVisibility(s,id,true);expect(objectGraphic(s,id)!.id).toBe(g.id);expect(parseDocument(serializeDocument(s.document))).toEqual(s.document);
 saveObject(s,{...objectDraft(s,id),name:'Renamed'});expect(s.document.semantics.objects[0].category).toBe(category);
});
it('rejects spatial mass and contradictory plate polarity atomically',()=>{
 const s=new DocumentStore(),before=structuredClone(s.document);expect(()=>saveObject(s,{...presetDraft('spatialPoint'),properties:{mass:{symbol:'m',unit:'kg',state:'unknown'}}})).toThrow(/unavailable/);expect(s.document).toEqual(before);
 expect(()=>saveObject(s,{...presetDraft('chargedPlate'),polarity:'negative',properties:{surfaceChargeDensity:{symbol:'\\sigma',state:'known',value:1,unit:'C/m^2'}}})).toThrow(/polarity/);expect(s.document).toEqual(before);
});
it('migrates v2 without renaming Earth or reinterpreting points',()=>{
 const legacy=JSON.parse(readFileSync('examples/version2.diagramed.json','utf8'));const result=parseDocument(JSON.stringify(legacy));expect(result.semantics.objects.map(o=>o.name)).toEqual(['Rock','Table','Earth']);migrateDocumentSpace(legacy);expect(result.presentation).toEqual(legacy.presentation);expect(result.semantics.objects.every(o=>o.category==='ordinary')).toBe(true);expect(result.semantics.variables).toEqual(legacy.semantics.variables);
});
