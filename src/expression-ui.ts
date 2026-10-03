import katex from 'katex';
import type {DiagramDocument} from './model';
import type {Expression,PhysicalVector} from './semantics';
import {expressionVocabulary,validateExpression} from './expressions';
import {createEditor,type MathedEditor} from './vendor/mathed/mathed';
import {makeDocument,type Expression as MathExpression} from './vendor/mathed/model';

/** Lossless legacy-tree import; new definitions retain Mathed's structured tree. */
export function toMathed(e:Expression):MathExpression{
 if(e.type==='mathed')return structuredClone(e.expression);
 if(e.type==='reference')return [{type:'variable',id:e.id}];
 if(e.type==='number')return [{type:'number',value:String(e.value)}];
 if(e.type==='pi')return [{type:'constant',name:'pi'}];
 if(e.type==='unary')return e.op==='abs'?[{type:'function',name:'abs',argument:toMathed(e.operand)}]:[{type:'operator',value:'-'},{type:'group',body:toMathed(e.operand)}];
 if(e.op==='/')return [{type:'fraction',numerator:toMathed(e.left),denominator:toMathed(e.right)}];
 if(e.op==='^')return [{type:'power',base:toMathed(e.left),exponent:toMathed(e.right)}];
 return [{type:'group',body:[...toMathed(e.left),{type:'operator',value:e.op},...toMathed(e.right)]}];
}
const builders=new WeakMap<HTMLElement,{editor:MathedEditor;doc:DiagramDocument;menu:HTMLElement}>();
export function mountExpression(host:HTMLElement,doc:DiagramDocument,_vector?:PhysicalVector,expression?:Expression){
 builders.get(host)?.editor.destroy();host.replaceChildren();
 const dropdown=document.createElement('details');dropdown.className='expression-vocabulary';
 const summary=document.createElement('summary');summary.textContent='Variables';summary.setAttribute('aria-label','Variables');
 const menu=document.createElement('div');menu.className='expression-variable-menu';dropdown.append(summary,menu);host.append(dropdown);
 const editor=createEditor(host,{mode:'controlled',vocabulary:expressionVocabulary(doc),document:makeDocument(expression?toMathed(expression):[])});
 host.querySelectorAll<HTMLElement>('[title]').forEach(el=>{el.title='Mathed '+el.title;});
 builders.set(host,{editor,doc,menu});
 // Opening a menu does not move Mathed's logical cursor. Insertion uses that
 // retained path, including nested slots; Mathed restores input focus itself.
 menu.addEventListener('click',event=>{const button=(event.target as HTMLElement).closest<HTMLButtonElement>('[data-reference-id]');if(button){editor.insertVariable(button.dataset.referenceId!);dropdown.open=false;}});
 updateExpressionVocabulary(host,doc);
}
export function updateExpressionVocabulary(host:HTMLElement,doc:DiagramDocument){
 const state=builders.get(host);if(!state)return;state.doc=doc;
 const vocabulary=expressionVocabulary(doc);state.editor.updateVocabulary(vocabulary);state.menu.replaceChildren();
 for(const v of vocabulary){const b=document.createElement('button');b.type='button';b.dataset.referenceId=v.id;b.setAttribute('aria-label',`Insert ${v.symbol}`);b.innerHTML=katex.renderToString(v.symbol,{throwOnError:false,trust:false,maxExpand:1000});state.menu.append(b);}
}
export function readExpression(host:HTMLElement):Expression{
 const state=builders.get(host);if(!state)throw new Error('Expression editor is unavailable.');
 if(!state.editor.submit())throw new Error('Complete the Mathed expression before saving.');
 const expression:Expression={type:'mathed',expression:state.editor.getDocument().expression};
 validateExpression(expression,new Set(expressionVocabulary(state.doc).map(v=>v.id)));return expression;
}
