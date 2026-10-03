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
const builders=new WeakMap<HTMLElement,{editor:MathedEditor;doc:DiagramDocument}>();
export function mountExpression(host:HTMLElement,doc:DiagramDocument,_vector?:PhysicalVector,expression?:Expression){
 builders.get(host)?.editor.destroy();host.replaceChildren();
 const editor=createEditor(host,{mode:'controlled',vocabulary:expressionVocabulary(doc),document:makeDocument(expression?toMathed(expression):[])});
 host.querySelectorAll<HTMLElement>('[title]').forEach(el=>{el.title='Mathed '+el.title;});
 builders.set(host,{editor,doc});
 updateExpressionVocabulary(host,doc);
}
export function updateExpressionVocabulary(host:HTMLElement,doc:DiagramDocument){
 const state=builders.get(host);if(!state)return;state.doc=doc;
 state.editor.updateVocabulary(expressionVocabulary(doc));
}
export function readExpression(host:HTMLElement):Expression{
 const state=builders.get(host);if(!state)throw new Error('Expression editor is unavailable.');
 if(!state.editor.submit())throw new Error('Complete the Mathed expression before saving.');
 const expression:Expression={type:'mathed',expression:state.editor.getDocument().expression};
 validateExpression(expression,new Set(expressionVocabulary(state.doc).map(v=>v.id)));return expression;
}

export function focusExpression(host:HTMLElement){ builders.get(host)?.editor.focus(); }
/** Configuration can destroy a quantity while a dependent editor is open. */
export function expressionUsesRemovedVariables(host:HTMLElement,doc:DiagramDocument){
 const state=builders.get(host);if(!state)return false;
 const old=new Set(expressionVocabulary(state.doc).map(v=>v.id)),current=new Set(expressionVocabulary(doc).map(v=>v.id));
 let removed=false;
 const visit=(nodes:MathExpression)=>{for(const n of nodes){if(n.type==='variable'&&old.has(n.id)&&!current.has(n.id))removed=true;for(const value of Object.values(n))if(Array.isArray(value))visit(value as MathExpression);}};
 visit(state.editor.getDocument().expression);return removed;
}
