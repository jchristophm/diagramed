import { describe, expect, it } from 'vitest';
import { DocumentStore, newDocument, newGraphic, type ElementKind } from '../../src/model';
import { parseDocument, serializeDocument } from '../../src/persistence';
import { readFileSync } from 'node:fs';
import { saveObject, objectDraft } from '../../src/objects';
describe('native documents', () => {
  it('upgrades a genuine Phase 1 fixture without changing or tagging its graphics', () => {
    const legacy = JSON.parse(readFileSync('examples/representative.diagramed.json','utf8'));
    expect(legacy.version).toBe(1);
    const result = parseDocument(JSON.stringify(legacy)); expect(result.version).toBe(3);
    expect(result.presentation).toEqual(legacy.presentation); expect(result.semantics).toEqual(legacy.semantics); expect(result.metadata).toEqual(legacy.metadata);
    expect(result.presentation.elements.every(e => e.semanticId === undefined)).toBe(true);
    expect(parseDocument(serializeDocument(result))).toEqual(result);
  });
  it('round trips an object registry and rejects dangling links, orphan variables and contradictory states', () => {
    const store = new DocumentStore(); const id = saveObject(store,{name:'Rock',representation:'circle',showName:true,showProperties:true,properties:{mass:{symbol:'m_2',state:'unknown',unit:'kg'}}});
    expect(parseDocument(serializeDocument(store.document))).toEqual(store.document);
    const broken=structuredClone(store.document);broken.semantics.variables[0].value=0;expect(()=>parseDocument(serializeDocument(broken))).toThrow(/unknown/);
    delete broken.semantics.variables[0].value; broken.semantics.variables[0].ownerObjectId='missing';expect(()=>parseDocument(serializeDocument(broken))).toThrow(/ownership/);
    const dangling=structuredClone(store.document);dangling.presentation.elements[0].semanticId='missing';expect(()=>parseDocument(serializeDocument(dangling))).toThrow(/configuration|missing/);
    const orphan=structuredClone(store.document);orphan.semantics.objects[0].properties={};expect(()=>parseDocument(serializeDocument(orphan))).toThrow(/orphan/);
    saveObject(store,{...objectDraft(store,id),properties:{mass:{symbol:'m_2',state:'known',unit:'kg',value:2}}});expect(parseDocument(serializeDocument(store.document))).toEqual(store.document);
  });
  it('round trips all primitives, geometry, LaTeX, drawing order, metadata and semantics', () => {
    const doc = newDocument();
    for (const kind of ['rectangle','circle','line','arrow','dashedArrow','text','latex'] as ElementKind[]) {
      const e = newGraphic(kind, doc); Object.assign(e, { x: 123, y: 245, rotation: 37, scaleX: 1.5, scaleY: .8, points: [-20, 30, 150, -70], latex: '\\vec{F}=m\\vec{a}', text: '<label> α', width: 90, height: 130, radius: 30 }); doc.presentation.elements.push(e);
    }
    doc.semantics.variables.push({ id: 'mass', symbol: 'm', value: 4, unit: 'kg', quantity: 'mass', ownerObjectId: 'body', state: 'known' });
    doc.semantics.objects.push({ id: 'body', category: 'ordinary', name: 'Body', properties: { mass: 'mass' } });
    Object.assign(doc.presentation.elements[0], { semanticId: 'body', visible: true, label: { showName: true, showProperties: true, offsetX: 24, offsetY: 24 } });
    const reopened = parseDocument(serializeDocument(doc));
    expect(reopened).toEqual(doc); expect(parseDocument(serializeDocument(reopened))).toEqual(doc);
    expect(serializeDocument(doc)).not.toMatch(/Transformer|touchHit|selectedShape/);
  });
  it('editing a reconstructed element retains its persistent identity', () => {
    const doc = newDocument(), e = newGraphic('latex', doc); e.latex = 'x^2'; doc.presentation.elements.push(e);
    const store = new DocumentStore(parseDocument(serializeDocument(doc))); store.update(e.id, { latex: 'x^3', x: 400 });
    expect(parseDocument(serializeDocument(store.document)).presentation.elements[0]).toMatchObject({ id: e.id, latex: 'x^3', x: 400 });
  });
  it.each(['{','{}',JSON.stringify({format:'diagramed', version:99}),JSON.stringify({...newDocument(), presentation:{}})])('rejects malformed, incompatible or incomplete data', text => { expect(() => parseDocument(text)).toThrow(/Cannot open diagram/); });
  it('rejects duplicate identities and unsafe geometry', () => {
    const doc = newDocument(), e = newGraphic('arrow', doc); doc.presentation.elements.push(e, {...e}); expect(() => parseDocument(serializeDocument(doc))).toThrow(/unique/);
    doc.presentation.elements.pop(); e.scaleX = 0; expect(() => parseDocument(serializeDocument(doc))).toThrow(/scale/);
  });
  it('model operations preserve order and do not mutate the supplied document', () => {
    const doc = newDocument(), store = new DocumentStore(doc), a = newGraphic('arrow', doc), b = newGraphic('circle', doc);
    store.add(a); store.add(b); store.update(a.id,{points:[0,0,100,200]}); store.remove(b.id);
    expect(store.document.presentation.elements).toHaveLength(1); expect(doc.presentation.elements).toHaveLength(0);
  });
});
