import {DocumentStore,type DiagramDocument} from './model';
import {deletionDocument,type DeleteTarget} from './deletion';
/** Native modal confirmation, including Escape cancellation; no state changes before approval. */
export function confirmCascade(title:string):Promise<boolean>{
 return new Promise(resolve=>{
  const dialog=document.createElement('dialog');dialog.id='cascade-dialog';dialog.setAttribute('aria-labelledby','cascade-title');
  const heading=document.createElement('h2');heading.id='cascade-title';heading.textContent=title;
  const message=document.createElement('p');message.textContent='This will also remove dependent interactions, vectors, variables, and components. Expressions that use removed variables will return to Unknown.';
  const actions=document.createElement('div');actions.className='dialog-actions';
  const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Cancel';
  const confirm=document.createElement('button');confirm.type='button';confirm.textContent='Delete all';
  const finish=(approved:boolean)=>{dialog.close();dialog.remove();resolve(approved);};
  cancel.addEventListener('click',()=>finish(false));confirm.addEventListener('click',()=>finish(true));dialog.addEventListener('cancel',e=>{e.preventDefault();finish(false);});
  actions.append(cancel,confirm);dialog.append(heading,message,actions);document.body.append(dialog);dialog.showModal();cancel.focus();
 });
}
export function removedDefinitionDependencies(before:DiagramDocument,after:DiagramDocument){
 const remaining=new Set(after.semantics.variables.map(v=>v.id));
 return before.semantics.variables.some(v=>!remaining.has(v.id)) || before.semantics.vectors.some(v=>!after.semantics.vectors.some(n=>n.id===v.id));
}
export async function confirmDefinitionRemoval(before:DiagramDocument,after:DiagramDocument){return !removedDefinitionDependencies(before,after)||await confirmCascade('Remove quantities and their dependencies?');}
export async function requestDelete(store:DocumentStore,target:DeleteTarget){
 const before=store.document,after=deletionDocument(before,target);
 const name=target.kind==='object'?before.semantics.objects.find(o=>o.id===target.id)?.name:target.kind==='interaction'?'interaction':target.kind==='vector'?'vector':'coordinate system';
 const dependent=target.kind==='interaction'||removedDefinitionDependencies(before,after)||before.semantics.components.length!==after.semantics.components.length;
 if(dependent&&!await confirmCascade(`Delete ${name||'element'}?`))return false;
 store.replace(after);return true;
}
