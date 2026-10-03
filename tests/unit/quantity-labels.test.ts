import {it,expect} from 'vitest';
import {quantityLabel,numericalLabel} from '../../src/quantity-labels';
import {DocumentStore} from '../../src/model';
import {saveObject,objectDraft,presetDraft} from '../../src/objects';
import {parseDocument,serializeDocument} from '../../src/persistence';
it('formats stored numerical definitions and units, excluding unknown/expression values',()=>{
 expect(quantityLabel({id:'m',symbol:'m_R',state:'known',value:5,unit:'kg'})).toBe('m_R=5\\,\\mathrm{kg}');expect(quantityLabel({id:'g',symbol:'g_E',state:'known',value:9.8,unit:'m/s^2'})).toBe('g_E=9.8\\,\\mathrm{m}/\\mathrm{s}^{2}');
 for(const state of ['unknown','expression'] as const)expect(quantityLabel({id:'u',symbol:'u',state,value:5,unit:'kg'})).toBe('u');
 expect(numericalLabel('q',-1e-9,'C')).toBe('q=-1\\times 10^{-9}\\,\\mathrm{C}');expect(numericalLabel('\\mu',0,'1')).toBe('\\mu=0');expect(numericalLabel('\\theta',30,'°')).toBe('\\theta=30^\\circ');
});
it('edits, removals and reload preserve quantity identities and regenerate labels',()=>{
 const s=new DocumentStore(),id=saveObject(s,{...presetDraft('ordinary'),name:'Rock',properties:{mass:{state:'known',value:5,unit:'kg'}}}),identity=s.document.semantics.variables[0].id;
 expect(quantityLabel(s.document.semantics.variables[0])).toBe('m_{R}=5\\,\\mathrm{kg}');saveObject(s,{...objectDraft(s,id),properties:{mass:{state:'known',value:200,unit:'g'}}});expect(s.document.semantics.variables[0].id).toBe(identity);expect(quantityLabel(s.document.semantics.variables[0])).toBe('m_{R}=200\\,\\mathrm{g}');expect(quantityLabel(parseDocument(serializeDocument(s.document)).semantics.variables[0])).toBe('m_{R}=200\\,\\mathrm{g}');expect(serializeDocument(s.document)).not.toContain('=200');
 saveObject(s,{...objectDraft(s,id),properties:{mass:{state:'unknown',unit:'kg'}}});expect(quantityLabel(s.document.semantics.variables[0])).toBe('m_{R}');
});
it('stored preset gravity and density use numerical labels',()=>{
 const s=new DocumentStore();saveObject(s,presetDraft('planetSurface'));saveObject(s,presetDraft('fluid'));expect(s.document.semantics.variables.map(v=>quantityLabel(v))).toEqual(expect.arrayContaining(['g=9.8\\,\\mathrm{m}/\\mathrm{s}^{2}','\\rho_{W}=1000\\,\\mathrm{kg}/\\mathrm{m}^{3}']));
});
