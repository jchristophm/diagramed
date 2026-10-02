import katex from 'katex';
import {DocumentStore} from './model';
import {DiagramRenderer} from './renderer';
import {angleSymbol,deleteAngle,directionChoices,directionKey,invalidAngleReason,resolveDirection,saveAngle} from './angles';
import type {DirectionReference} from './semantics';
const $=<T extends HTMLElement>(s:string)=>document.querySelector<T>(s)!;
const math=(host:HTMLElement,symbol:string)=>{host.innerHTML=katex.renderToString(symbol,{throwOnError:false,trust:false,maxExpand:1000});};
export function initializeAngles(store:DocumentStore,renderer:DiagramRenderer){
 const dialog=$<HTMLDialogElement>('#angle-dialog'),collectionDialog=$<HTMLDialogElement>('#angle-collection');let editingId:string|undefined,saving=false;
 const read=(key:string):DirectionReference|undefined=>{const text=$<HTMLSelectElement>(key).value;return text?JSON.parse(text):undefined;};
 function preview(){const from=read('#angle-from'),to=read('#angle-to');$('#angle-symbol').replaceChildren();if(from&&to)math($('#angle-symbol'),angleSymbol(store.document,{from,to}));$<HTMLButtonElement>('#save-angle').disabled=!from||!to||!resolveDirection(store.document,from)||!resolveDirection(store.document,to);}
 function open(id?:string){
  editingId=id;const angle=store.document.semantics.angles?.find(a=>a.id===id),choices=directionChoices(store.document);
  for(const [key,ref]of [['#angle-from',angle?.from],['#angle-to',angle?.to]] as const){
   const select=$<HTMLSelectElement>(key);select.replaceChildren();const empty=new Option('Choose direction','');select.add(empty);
   for(const group of ['Vectors','Vector components','Coordinate axes']){const opt=document.createElement('optgroup');opt.label=group;for(const choice of choices.filter(c=>c.group===group))opt.append(new Option(choice.label,directionKey(choice.reference)));if(opt.children.length)select.append(opt);}
   if(ref){const key=directionKey(ref);if(!choices.some(c=>directionKey(c.reference)===key)){const missing=new Option('Undefined source — choose a direction',key);missing.disabled=true;select.add(missing);}select.value=key;}
  }
  $('#angle-title').textContent=id?'Configure Angle':'Add Angle';$('#delete-angle').hidden=!id;
  $<HTMLInputElement>('#angle-value').value=angle?.value===undefined?'':String(angle.value);$<HTMLInputElement>('#angle-visible').checked=angle?.visible??true;
  $('#angle-error').textContent=angle?invalidAngleReason(store.document,angle):choices.length?'':'Define a directional vector or coordinate system first.';preview();dialog.showModal();
 }
 function collection(){
  const host=$('#angle-list');host.replaceChildren();for(const a of store.document.semantics.angles??[]){const row=document.createElement('div');row.className='object-row';const symbol=angleSymbol(store.document,a),reason=invalidAngleReason(store.document,a);
   const text=document.createElement('div');math(text,symbol);row.append(text);
   const state=document.createElement('span');state.textContent=reason|| (a.visible?'Visible':'Hidden');row.append(state);
   for(const label of ['Select','Edit','Delete']){const b=document.createElement('button');b.textContent=label;b.setAttribute('aria-label',`${label} ${symbol}`);b.addEventListener('click',async()=>{if(label==='Edit'){collectionDialog.close();open(a.id);}else if(label==='Select'){collectionDialog.close();renderer.select(a.id);}else{deleteAngle(store,a.id);await renderer.render();collection();}});row.append(b);}host.append(row);
  }
  if(!host.children.length)host.textContent='No angles yet.';if(!collectionDialog.open)collectionDialog.showModal();
 }
 $('#angle-from').addEventListener('change',preview);$('#angle-to').addEventListener('change',preview);
 $('#cancel-angle').addEventListener('click',()=>dialog.close());$('#close-angles').addEventListener('click',()=>collectionDialog.close());$('#add-angle').addEventListener('click',()=>{collectionDialog.close();open();});
 $('#angle-form').addEventListener('submit',async e=>{e.preventDefault();if(saving)return;saving=true;try{const text=$<HTMLInputElement>('#angle-value').value.trim();const id=saveAngle(store,{id:editingId,from:read('#angle-from')!,to:read('#angle-to')!,value:text?Number(text):undefined,visible:$<HTMLInputElement>('#angle-visible').checked});await renderer.render();renderer.select(id);dialog.close();}catch(error){$('#angle-error').textContent=(error as Error).message;}finally{saving=false;}});
 $('#delete-angle').addEventListener('click',async()=>{if(!editingId||saving)return;deleteAngle(store,editingId);await renderer.render();dialog.close();});
 renderer.onAngleEdit=open;return {open,collection};
}
