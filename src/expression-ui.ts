import katex from 'katex';
import type {DiagramDocument} from './model';
import type {Expression,PhysicalVector} from './semantics';
import {contextualReferences,expressionTokens,parseTokens,expressionLatex,type Token,validateExpression} from './expressions';
import {physicalConstants} from './constants';
const builders=new WeakMap<HTMLElement,{tokens:Token[];allowed:Set<string>}>();
export function mountExpression(host:HTMLElement,doc:DiagramDocument,vector:PhysicalVector,expression?:Expression){
 host.replaceChildren();const allowed=new Set(contextualReferences(doc,vector));const state={tokens:expression?expressionTokens(expression):[],allowed};builders.set(host,state);
 const palette=document.createElement('div');palette.className='expression-palette';const preview=document.createElement('div');preview.className='expression-preview';preview.setAttribute('aria-live','polite');const message=document.createElement('p');message.className='expression-error';
 const render=()=>{message.textContent='';try{const e=parseTokens(state.tokens);validateExpression(e,allowed);preview.innerHTML=katex.renderToString(expressionLatex(e,doc),{throwOnError:false,trust:false,maxExpand:1000});}catch(e){preview.textContent=state.tokens.map(t=>t.type==='reference'?doc.semantics.variables.find(v=>v.id===t.id)?.symbol||Object.values(physicalConstants).find(c=>c.id===t.id)?.symbol:t.type==='number'?t.value:t.value).join(' ');if(state.tokens.length)message.textContent=(e as Error).message;}};
 const button=(label:string,action:()=>void)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',()=>{try{action();render();}catch(e){message.textContent=(e as Error).message;}});palette.append(b);return b;};
 for(const id of allowed){const symbol=doc.semantics.variables.find(v=>v.id===id)?.symbol||Object.values(physicalConstants).find(c=>c.id===id)?.symbol||id;const b=button(symbol,()=>state.tokens.push({type:'reference',id}));b.dataset.referenceId=id;b.setAttribute('aria-label',`Insert ${symbol}`);b.innerHTML=katex.renderToString(symbol,{throwOnError:false,trust:false,maxExpand:1000});}
 for(const op of ['+','-','*','/','^','(',')','pi','abs'])button(op,()=>{state.tokens.push({type:'operation',value:op});if(op==='abs')state.tokens.push({type:'operation',value:'('});});
 const literal=document.createElement('input');literal.type='text';literal.inputMode='decimal';literal.placeholder='Number';literal.setAttribute('aria-label','Numerical literal');palette.append(literal);button('Insert number',()=>{const text=literal.value.trim();if(!text || !Number.isFinite(Number(text))){throw new Error('Enter a finite number.');}state.tokens.push({type:'number',value:Number(text)});literal.value='';});button('Backspace',()=>{state.tokens.pop();});button('Clear expression',()=>{state.tokens=[];});host.append(palette,preview,message);render();
}
export function readExpression(host:HTMLElement):Expression{const state=builders.get(host);if(!state)throw new Error('Expression editor is unavailable.');const e=parseTokens(state.tokens);validateExpression(e,state.allowed);return e;}
