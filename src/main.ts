import {initializeVectors} from './vector-ui';
import {deleteVector} from './physics';
import katex from 'katex';
import { showPropertyFields, readPropertyFields, refreshPropertySymbols } from './property-form';
import { DocumentStore, newDocument, type Graphic } from './model';
import { DiagramRenderer } from './renderer';
import { parseDocument, downloadDocument } from './persistence';
import { saveObject, deleteObject, objectDraft, objectGraphic, setObjectVisibility, objectPresets, categoryNames, presetDraft, type Representation } from './objects';
import type { ObjectCategory } from './semantics';
const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const container = $<HTMLDivElement>('#container');
const store = new DocumentStore(newDocument(container.clientWidth || 800, container.clientHeight || 600));
const renderer = new DiagramRenderer(store, container);
const vectorUI=initializeVectors(store,renderer);
const dialog = $<HTMLDialogElement>('#object-dialog'), status = $('#status');
for(const [key,name] of Object.entries(categoryNames)){const option=document.createElement('option');option.value=key;option.textContent=name;$<HTMLSelectElement>('#object-category').append(option);}
for(const preset of objectPresets){const option=document.createElement('option');option.value=preset.key;option.textContent=categoryNames[preset.key];$<HTMLSelectElement>('#object-preset').append(option);}
function configureCategory(category:ObjectCategory){ $<HTMLSelectElement>('#object-category').value=category; $('#polarity-label').hidden=category!=='chargedPlate';const rep=$<HTMLSelectElement>('#object-representation');const specific=['planetSurface','chargedPlate','fluid'].includes(category)?'surface':category==='spatialPoint'?'point':category==='spring'?'spring':category==='cable'?'cable':undefined;for(const option of rep.options)option.disabled=option.value!=='none' && (specific?option.value!==specific:['surface','spring','cable'].includes(option.value));}
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
  $<HTMLSelectElement>('#object-preset').value = 'custom';
  $<HTMLSelectElement>('#object-preset').disabled = !!id;
  const draft = objectDraft(store, id); configureCategory(draft.category!);$<HTMLSelectElement>('#object-category').disabled=!!id;$<HTMLSelectElement>('#object-polarity').value=draft.polarity!;
  $<HTMLInputElement>('#object-name').value = draft.name;
  $<HTMLSelectElement>('#object-representation').value = draft.representation;
  $<HTMLInputElement>('#show-name').checked = draft.showName;
  $<HTMLInputElement>('#show-properties').checked = draft.showProperties;
  $('#object-title').textContent = id ? 'Edit object' : 'Define object';
  $('#save-object').textContent = id ? 'Save object' : 'Create object';
  $('#object-error').textContent = '';
  showPropertyFields($('#property-fields'), draft.properties,draft.category);
  refreshPropertyPreview();
  dialog.showModal();
}
$('#cancel-object').addEventListener('click', () => dialog.close());
$('#object-form').addEventListener('submit', async event => {
  event.preventDefault(); if (busy) return; busy = true;
  try {
    const id = saveObject(store, { id: editingId,category:$<HTMLSelectElement>('#object-category').value as ObjectCategory,polarity:$<HTMLSelectElement>('#object-polarity').value as 'positive'|'negative', name: $<HTMLInputElement>('#object-name').value, representation: $<HTMLSelectElement>('#object-representation').value as Representation, showName: $<HTMLInputElement>('#show-name').checked, showProperties: $<HTMLInputElement>('#show-properties').checked, properties: readPropertyFields($('#property-fields')) });
    await renderer.render(); selectObject(id); dialog.close();
  } catch (error) { $('#object-error').textContent = error instanceof Error ? error.message : String(error); } finally { busy = false; }
});
function applyPreset(category:ObjectCategory){const draft=presetDraft(category);configureCategory(category);$<HTMLInputElement>('#object-name').value=draft.name;$<HTMLSelectElement>('#object-representation').value=draft.representation;$<HTMLSelectElement>('#object-polarity').value=draft.polarity!;showPropertyFields($('#property-fields'),draft.properties,category);refreshPropertyPreview();}
$<HTMLSelectElement>('#object-preset').addEventListener('change',event=>{const key=(event.target as HTMLSelectElement).value;if(key==='custom')applyPreset('ordinary');else applyPreset(key as ObjectCategory);});
$<HTMLSelectElement>('#object-category').addEventListener('change',event=>applyPreset((event.target as HTMLSelectElement).value as ObjectCategory));
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
  else renderer.deleteSelected();
}
async function action(name: string) {
  if (busy) return; status.textContent = '';
  try {
    if (name === 'object') openObject();
    else if (name === 'collection') showCollection();
    else if (name === 'edit') {const g=store.document.presentation.elements.find(e=>e.id===renderer.selectedId);if(g?.vectorId){vectorUI.open(g.vectorId);return;} const id = selectedObject(); if (id) openObject(id); else report('Select an object to edit its definition.'); }
    else if (name === 'grid') renderer.toggleGrid();
    else if (name === 'delete') await removeSelected();
    else if (name === 'download') downloadDocument(store.document);
    else if (name === 'open') $<HTMLInputElement>('#file-input').click();
  } catch (error) { report(error); }
}
document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button => button.addEventListener('click', () => void action(button.dataset.action!)));
document.addEventListener('keydown', event => { if (event.key === 'Delete' && !document.querySelector('dialog[open]') && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) void removeSelected().catch(report); });
$<HTMLInputElement>('#file-input').addEventListener('change', async event => {
  const chooser = event.target as HTMLInputElement, file = chooser.files?.[0]; if (!file || busy) return; busy = true;
  const previous = structuredClone(store.document);
  try { if (file.size > 10000000) throw new Error('Cannot open diagram: file exceeds the 10 MB limit.'); const candidate = parseDocument(await file.text()); await renderer.prepare(candidate); store.replace(candidate); await renderer.render(); selectedObjectId = undefined; status.textContent = `Opened ${file.name}`; }
  catch (error) { store.replace(previous); await renderer.render().catch(() => {}); report(error); }
  finally { busy = false; chooser.value = ''; }
});
void renderer.render().catch(report);

function refreshPropertyPreview(){refreshPropertySymbols($('#property-fields'),store.document,$<HTMLInputElement>('#object-name').value,$<HTMLSelectElement>('#object-category').value as ObjectCategory,editingId);}
$('#object-name').addEventListener('input',refreshPropertyPreview);
