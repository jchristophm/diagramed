import { describe, expect, it } from 'vitest';
import { DocumentStore, newDocument, newGraphic, type ElementKind } from '../../src/model';
import { parseDocument, serializeDocument } from '../../src/persistence';
describe('native documents', () => {
  it('round trips all primitives, geometry, LaTeX, drawing order, metadata and semantics', () => {
    const doc = newDocument();
    for (const kind of ['rectangle','circle','line','arrow','dashedArrow','text','latex'] as ElementKind[]) {
      const e = newGraphic(kind, doc); Object.assign(e, { x: 123, y: 245, rotation: 37, scaleX: 1.5, scaleY: .8, points: [-20, 30, 150, -70], latex: '\\vec{F}=m\\vec{a}', text: '<label> α', width: 90, height: 130, radius: 30 }); doc.presentation.elements.push(e);
    }
    doc.semantics.variables.push({ id: 'mass', symbol: 'm', value: 4, unit: 'kg' });
    doc.semantics.objects.push({ id: 'body', name: 'Body', properties: { mass: 'mass' } });
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
