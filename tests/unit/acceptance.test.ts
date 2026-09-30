import {it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {scenarios} from '../fixtures/scenarios';
import {parseDocument,serializeDocument} from '../../src/persistence';
import {objectGraphic,objectDraft,saveObject} from '../../src/objects';
import {contextualReferences,expressionLatex} from '../../src/expressions';
import {displayedVector,vectorGraphic} from '../../src/physics';
it.each(['A','B','C','D','E','F'])('full required scenario %s persists independently of illustrative geometry',key=>{
 const s=scenarios()[key],before=structuredClone(s.document.semantics);for(const o of s.document.semantics.objects){const g=objectGraphic(s,o.id)!;if(g.kind!=='surface')s.update(g.id,{x:g.x+40,y:g.y+20});}expect(s.document.semantics).toEqual(before);expect(parseDocument(serializeDocument(s.document))).toEqual(s.document);expect(parseDocument(serializeDocument(parseDocument(serializeDocument(s.document))))).toEqual(s.document);
 for(const v of s.document.semantics.vectors){const graphic=vectorGraphic(s.document,v.id)!;expect(displayedVector(s.document,v,graphic)).toBeDefined();const variable=s.document.semantics.variables.find(n=>n.id===v.variableId)!;if(variable.expression)expect(expressionLatex(variable.expression,s.document)).not.toContain('?');}
});
it('A renames mass without changing student expression references; B has only relevant masses, r and G',()=>{const all=scenarios(),s=all.A,book=s.document.semantics.objects.find(o=>o.name==='Book')!,mass=book.properties!.mass,e=structuredClone(s.document.semantics.variables.find(v=>v.ownerVectorId)!.expression);saveObject(s,{...objectDraft(s,book.id),properties:{mass:{symbol:'M_B',state:'unknown',unit:'kg'}}});expect(s.document.semantics.objects.find(o=>o.id===book.id)!.properties!.mass).toBe(mass);expect(s.document.semantics.variables.find(v=>v.ownerVectorId)!.expression).toEqual(e);const b=all.B,force=b.document.semantics.vectors.find(v=>v.kind==='force')!;expect(contextualReferences(b.document,force)).toHaveLength(4);expect(contextualReferences(b.document,force)).toContain('constant:G');});
it('G loads genuine v1/v2 and rejects missing endpoints, invalid interaction and malformed expression',()=>{
 for(const filename of ['representative','version2']){const legacy=JSON.parse(readFileSync(`examples/${filename}.diagramed.json`,'utf8'));const result=parseDocument(JSON.stringify(legacy));expect(result.presentation).toEqual(legacy.presentation);expect(result.semantics.objects.map(o=>o.id)).toEqual(legacy.semantics.objects.map((o:any)=>o.id));}
 const doc=scenarios().B.document;const missing=structuredClone(doc);missing.semantics.objects.pop();expect(()=>parseDocument(serializeDocument(missing))).toThrow();const bad=structuredClone(doc);bad.semantics.variables.find(v=>v.expression)!.expression={type:'reference',id:'absent'};expect(()=>parseDocument(serializeDocument(bad))).toThrow(/unavailable/);const interaction=structuredClone(doc);interaction.semantics.interactions[0].targetId='absent';expect(()=>parseDocument(serializeDocument(interaction))).toThrow();
});
