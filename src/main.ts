import katex from 'katex';
import { showPropertyFields, readPropertyFields } from './property-form';
import { DocumentStore, newDocument, type Graphic } from './model';
import { DiagramRenderer } from './renderer';
import { parseDocument, downloadDocument } from './persistence';
import { saveObject, deleteObject, objectDraft, objectGraphic, type Representation } from './objects';
const $ = <T extends HTMLElement>(selector: string) => document.querySelector<T>(selector)!;
const container = $<HTMLDivElement>('#container');
const store = new DocumentStore(newDocument(container.clientWidth || 800, container.clientHeight || 600));
const renderer = new DiagramRenderer(store, container);
const dialog = $<HTMLDialogElement>('#object-dialog'), status = $('#status');
let editingId: string | undefined;
let selectedObjectId: string | undefined;
let legacy: Graphic | undefined;
let busy = false;
function report(error: unknown) { status.textContent = error instanceof Error ? error.message : String(error); }
function selectedObject() { return store.document.presentation.elements.find(e => e.id === renderer.selectedId)?.semanticId || selectedObjectId; }
function openObject(id?: string) {
  editingId = id;
  const draft = objectDraft(store, id);
  $<HTMLInputElement>('#object-name').value = draft.name;
  $<HTMLSelectElement>('#object-representation').value = draft.representation;
  $<HTMLInputElement>('#show-name').checked = draft.showName;
  $<HTMLInputElement>('#show-properties').checked = draft.showProperties;
  $('#object-title').textContent = id ? 'Edit object' : 'Define object';
  $('#save-object').textContent = id ? 'Save object' : 'Create object';
  $('#object-error').textContent = '';
  showPropertyFields($('#property-fields'), draft.properties);
  dialog.showModal();
}
$('#cancel-object').addEventListener('click', () => dialog.close());
$('#object-form').addEventListener('submit', async event => {
  event.preventDefault(); if (busy) return; busy = true;
  try {
    selectedObjectId = saveObject(store, { id: editingId, name: $<HTMLInputElement>('#object-name').value, representation: $<HTMLSelectElement>('#object-representation').value as Representation, showName: $<HTMLInputElement>('#show-name').checked, showProperties: $<HTMLInputElement>('#show-properties').checked, properties: readPropertyFields($('#property-fields')) });
    await renderer.render(); renderer.select(objectGraphic(store, selectedObjectId)?.id || null); dialog.close();
  } catch (error) { $('#object-error').textContent = error instanceof Error ? error.message : String(error); } finally { busy = false; }
});
renderer.onEdit = element => {
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
  const id = selectedObject();
  if (id) { deleteObject(store, id); selectedObjectId = undefined; await renderer.render(); }
  else renderer.deleteSelected();
}
async function action(name: string) {
  if (busy) return; status.textContent = '';
  try {
    if (name === 'object') openObject();
    else if (name === 'edit') { const id = selectedObject(); if (id) openObject(id); else report('Select an object to edit its definition.'); }
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
