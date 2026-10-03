import {initializeCoordinates} from './coordinate-ui';
import {initializeVectors} from './vector-ui';
import {deleteVector} from './physics';
import katex from 'katex';
import { showPropertyFields, readPropertyFields, refreshPropertySymbols } from './property-form';
import { DocumentStore, newDocument, type Graphic } from './model';
import { DiagramRenderer } from './renderer';
import { parseDocument, downloadDocument } from './persistence';
import { saveObject, deleteObject, objectDraft, objectGraphic, setObjectVisibility, categoryNames, categoryRepresentations, categoryProperties, presetDraft, type Representation } from './objects';
import type { ObjectCategory } from './semantics';
const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const container = $<HTMLDivElement>('#container');
const store = new DocumentStore(newDocument());
const renderer = new DiagramRenderer(store, container);
const vectorUI=initializeVectors(store,renderer);
const coordinateUI=initializeCoordinates(store,renderer);
const dialog = $<HTMLDialogElement>('#object-dialog'), status = $('#status');
for(const [key,name] of Object.entries(categoryNames)){const option=document.createElement('option');option.value=key;option.textContent=name;$<HTMLSelectElement>('#object-type').append(option);}
function configureCategory(category:ObjectCategory){
 $<HTMLSelectElement>('#object-type').value=category;
 $('#polarity-label').hidden=category!=='chargedPlate';
 $('#representation-hint').hidden=category!=='ordinary';
 const rep=$<HTMLSelectElement>('#object-representation'),old=rep.value;
 const names:Record<Representation,string>={circle:'Circle',rectangle:'Rectangle',point:'Point',surface:'Surface',spring:'Spring',cable:'Cable',none:'No visible representation'};
 rep.replaceChildren();for(const key of categoryRepresentations[category]){const option=document.createElement('option');option.value=key;option.textContent=names[key];rep.append(option);}
 if(categoryRepresentations[category].includes(old as Representation))rep.value=old;
}
let editingId: string | undefined;
let selectedObjectId: string | undefined;
let legacy: Graphic | undefined;
let busy = false;
function report(error: unknown) { status.textContent = error instanceof Error ? error.message : String(error); }
function selectedObject() { return renderer.selectedId ? store.document.presentation.elements.find(e => e.id === renderer.selectedId)?.semanticId : selectedObjectId; }
function updateSelectionName() { $('#selected-name').textContent = store.document.semantics.objects.find(o => o.id === selectedObjectId)?.name || ''; }
renderer.onSelect = element => { selectedObjectId = element?.semanticId; updateSelectionName(); };
function selectObject(id: string) { const g = objectGraphic(store, id); renderer.select(g && g.visible !== false ? g.id : null); selectedObjectId = id; updateSelectionName(); }
function openObject(id?: string) {
  editingId = id;
  const draft = objectDraft(store, id); configureCategory(draft.category!);$<HTMLSelectElement>('#object-type').disabled=!!id;$<HTMLSelectElement>('#object-polarity').value=draft.polarity!;
  $<HTMLInputElement>('#object-name').value = draft.name;
  $<HTMLSelectElement>('#object-representation').value = draft.representation;
  $<HTMLInputElement>('#show-name').checked = draft.showName;
  $<HTMLInputElement>('#show-properties').checked = draft.showProperties;
  $('#delete-object').hidden=!id;
  $('#object-title').textContent = id ? 'Edit object' : 'Define object';
  $('#save-object').textContent = id ? 'Save object' : 'Create object';
  $('#object-error').textContent = '';
  showPropertyFields($('#property-fields'), draft.properties,draft.category);
  refreshPropertyPreview();
  dialog.showModal();
}
$('#delete-object').addEventListener('click',async()=>{if(!editingId||busy)return;busy=true;try{deleteObject(store,editingId);await renderer.render();selectedObjectId=undefined;dialog.close();}catch(error){$('#object-error').textContent=(error as Error).message;}finally{busy=false;}});
$('#cancel-object').addEventListener('click', () => dialog.close());
$('#object-form').addEventListener('submit', async event => {
  event.preventDefault(); if (busy) return; busy = true;
  try {
    const id = saveObject(store, { id: editingId,category:$<HTMLSelectElement>('#object-type').value as ObjectCategory,polarity:$<HTMLSelectElement>('#object-polarity').value as 'positive'|'negative', name: $<HTMLInputElement>('#object-name').value, representation: $<HTMLSelectElement>('#object-representation').value as Representation, showName: $<HTMLInputElement>('#show-name').checked, showProperties: $<HTMLInputElement>('#show-properties').checked, properties: readPropertyFields($('#property-fields')) });
    await renderer.render(); selectObject(id); dialog.close();
  } catch (error) { $('#object-error').textContent = error instanceof Error ? error.message : String(error); } finally { busy = false; }
});
function applyType(category:ObjectCategory){
 const currentName=$<HTMLInputElement>('#object-name').value;
 let previous:ReturnType<typeof readPropertyFields>={};try{previous=readPropertyFields($('#property-fields'));}catch{/* Incomplete draft fields must not prevent changing type. */}
 const customName=currentName.trim() && !Object.values(categoryNames).includes(currentName) && !['Water','Earth'].includes(currentName);
 const draft=presetDraft(category);configureCategory(category);
 $<HTMLInputElement>('#object-name').value=customName?currentName:category==='ordinary'?'':draft.name;
 $<HTMLSelectElement>('#object-representation').value=draft.representation;
 $<HTMLSelectElement>('#object-polarity').value=draft.polarity!;
 for(const key of categoryProperties[category])if(previous?.[key])draft.properties![key]=previous[key];
 showPropertyFields($('#property-fields'),draft.properties,category);refreshPropertyPreview();
}
$<HTMLSelectElement>('#object-type').addEventListener('change',event=>{try{applyType((event.target as HTMLSelectElement).value as ObjectCategory);}catch(error){$('#object-error').textContent=(error as Error).message;}});
function showCollection() {
  const host = $('#object-list'); host.replaceChildren();
  if (!store.document.semantics.objects.length) { const empty=document.createElement('p');empty.textContent='No objects yet. Use Object to define one.';host.append(empty); }
  for (const object of store.document.semantics.objects) {
    const row = document.createElement('div'); row.className='object-row'; row.dataset.objectId=object.id;
    const graphic = objectGraphic(store, object.id), visible = !!graphic && graphic.visible !== false;
    const name = document.createElement('button'); name.className='object-name'; name.textContent=object.name; name.title=`Select ${object.name}`; name.setAttribute('aria-label',`Select ${object.name}`);
    name.addEventListener('click', () => { selectObject(object.id); $<HTMLDialogElement>('#collection-dialog').close(); status.textContent = visible ? `Selected ${object.name}` : `Selected hidden object: ${object.name}`; });
    const visibility=document.createElement('button');visibility.textContent=visible ? 'Hide' : 'Show';visibility.setAttribute('aria-label',`${visible ? 'Hide' : 'Show'} ${object.name}`);
    visibility.addEventListener('click',async()=>{if(busy)return;busy=true;try{setObjectVisibility(store,object.id,!visible);await renderer.render();selectObject(object.id);showCollection();}catch(error){report(error);}finally{busy=false;}});
    const edit=document.createElement('button');edit.textContent='Edit';edit.setAttribute('aria-label',`Edit ${object.name}`);edit.addEventListener('click',()=>{$<HTMLDialogElement>('#collection-dialog').close();selectObject(object.id);openObject(object.id);});
    const remove=document.createElement('button');remove.textContent='Delete';remove.setAttribute('aria-label',`Delete ${object.name}`);remove.addEventListener('click',async()=>{if(busy)return;busy=true;try{deleteObject(store,object.id);await renderer.render();showCollection();}catch(error){report(error);}finally{busy=false;}});
    const state=document.createElement('span');state.className='object-state';state.textContent=visible ? 'Visible' : 'Hidden';
    row.append(name,state,visibility,edit,remove);host.append(row);
  }
  const collection=$<HTMLDialogElement>('#collection-dialog');if(!collection.open)collection.showModal();
}
$('#close-collection').addEventListener('click',()=> $<HTMLDialogElement>('#collection-dialog').close());
renderer.onEdit = element => {
  if(element.vectorId){vectorUI.open(element.vectorId);return;}
  if (element.semanticId) { selectedObjectId = element.semanticId; openObject(element.semanticId); return; }
  legacy = structuredClone(element); $<HTMLTextAreaElement>('#legacy-input').value = element.kind === 'latex' ? element.latex : element.text;
  $('#legacy-title').textContent = element.kind === 'latex' ? 'Edit legacy equation' : 'Edit legacy label'; updateLegacyPreview(); $<HTMLDialogElement>('#legacy-dialog').showModal();
};
function updateLegacyPreview() { const text = $<HTMLTextAreaElement>('#legacy-input').value; if (legacy?.kind === 'latex') $('#legacy-preview').innerHTML = katex.renderToString(text, { throwOnError: false, trust: false }); else $('#legacy-preview').textContent = text; }
$('#legacy-input').addEventListener('input', updateLegacyPreview);
$('#cancel-legacy').addEventListener('click', () => $<HTMLDialogElement>('#legacy-dialog').close());
$('#legacy-form').addEventListener('submit', async event => {
  event.preventDefault(); if (!legacy || busy) return; busy = true;
  try { const e = { ...legacy, [legacy.kind === 'latex' ? 'latex' : 'text']: $<HTMLTextAreaElement>('#legacy-input').value }; await renderer.prepare({ ...store.document, presentation: { ...store.document.presentation, elements: [e] } }); store.update(e.id, e); await renderer.render(); $<HTMLDialogElement>('#legacy-dialog').close(); }
  catch (error) { report(error); } finally { busy = false; }
});
async function removeSelected() {
  const selected=store.document.presentation.elements.find(e=>e.id===renderer.selectedId);if(selected?.vectorId){deleteVector(store,selected.vectorId);await renderer.render();return;}
  const id = selectedObject();
  if (id) { deleteObject(store, id); selectedObjectId = undefined; await renderer.render(); }
  else {renderer.deleteSelected();await renderer.render();}
}
async function action(name: string) {
  if (busy) return; status.textContent = '';
  try {
    if (name === 'object') openObject();
    else if (name === 'collection') showCollection();
    else if (name === 'coordinates') coordinateUI.open();
    else if (name === 'edit') {const g=store.document.presentation.elements.find(e=>e.id===renderer.selectedId);if(g?.vectorId){vectorUI.open(g.vectorId);return;} const id = selectedObject(); if (id) openObject(id); else report('Select an object to edit its definition.'); }
    else if (name === 'zoom-in') renderer.setZoom(renderer.zoom + .25);
    else if (name === 'zoom-out') renderer.setZoom(renderer.zoom - .25);
    else if (name === 'zoom-reset') renderer.setZoom(1);
    else if (name === 'grid') renderer.toggleGrid();
    else if (name === 'undo' || name === 'redo') {busy=true;try{if(name==='undo'?store.undo():store.redo()){selectedObjectId=undefined;await renderer.render();}}finally{busy=false;}}
    else if (name === 'download') {downloadDocument(store.document);store.markSaved();}
    else if (name === 'open') $<HTMLInputElement>('#file-input').click();
  } catch (error) { report(error); }
}
document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button => button.addEventListener('click', () => { $<HTMLDetailsElement>('#elements-menu').open=false; void action(button.dataset.action!); }));
function editorOwnsKeyboard(event:KeyboardEvent) {
 return event.defaultPrevented || !!document.querySelector('dialog[open]') || (event.target instanceof Element && !!event.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"]),[role="textbox"]'));
}
document.addEventListener('keydown',event=>{
 if(editorOwnsKeyboard(event)||busy||store.inTransaction)return;
 const key=event.key.toLowerCase(),modifier=event.ctrlKey||event.metaKey;
 if(modifier&&!event.altKey&&(key==='z'||(key==='y'&&event.ctrlKey))){
  const redo=key==='y'||event.shiftKey;if(redo?store.canRedo:store.canUndo){event.preventDefault();void action(redo?'redo':'undo');}
 }else if(event.key==='Delete'){event.preventDefault();void removeSelected().catch(report);}
});
function refreshDocumentControls(){
 $<HTMLButtonElement>('[data-action="undo"]').disabled=!store.canUndo;
 $<HTMLButtonElement>('[data-action="redo"]').disabled=!store.canRedo;
 $('[data-action="grid"]').setAttribute('aria-pressed',String(store.document.presentation.grid.visible));
 document.body.dataset.dirty=String(store.dirty);
}
store.subscribe(refreshDocumentControls);refreshDocumentControls();
window.addEventListener('beforeunload',event=>{if(store.dirty){event.preventDefault();event.returnValue='';}});
$<HTMLInputElement>('#file-input').addEventListener('change',async event=>{
 const chooser=event.target as HTMLInputElement,file=chooser.files?.[0];if(!file||busy||store.inTransaction){chooser.value='';return;}busy=true;
 const selection=renderer.selectedId;let replacing=false;
 try{
  if(file.size>10000000)throw new Error('Cannot open diagram: file exceeds the 10 MB limit.');
  const candidate=parseDocument(await file.text());await renderer.prepare(candidate);
  if(store.dirty&&!window.confirm('This diagram has unsaved changes. Open another file and discard them?'))return;
  store.beginTransaction();replacing=true;store.replace(candidate);await renderer.render();store.resetHistory();replacing=false;selectedObjectId=undefined;status.textContent=`Opened ${file.name}`;
 }catch(error){if(replacing){store.cancelTransaction();await renderer.render().catch(()=>{});renderer.select(selection);}report(error);}
 finally{busy=false;chooser.value='';}
});
document.addEventListener('click',event=>{if(!$("#elements-menu").contains(event.target as Node))$<HTMLDetailsElement>('#elements-menu').open=false;});
document.addEventListener('keydown',event=>{if(event.key==='Escape')$<HTMLDetailsElement>('#elements-menu').open=false;});
renderer.onViewChange = () => {
 $('[data-action="zoom-reset"]').textContent = `${Math.round(renderer.zoom * 100)}%`;
 $<HTMLButtonElement>('[data-action="zoom-in"]').disabled = renderer.zoom >= 2;
 $<HTMLButtonElement>('[data-action="zoom-out"]').disabled = renderer.zoom <= .5;
};
void renderer.render().catch(report);

function refreshPropertyPreview(){refreshPropertySymbols($('#property-fields'),store.document,$<HTMLInputElement>('#object-name').value,$<HTMLSelectElement>('#object-type').value as ObjectCategory,editingId);}
$('#object-name').addEventListener('input',refreshPropertyPreview);
