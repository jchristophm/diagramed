import katex from 'katex';
import { DocumentStore, newDocument, newGraphic, type ElementKind, type Graphic } from './model';
import { DiagramRenderer } from './renderer';
import { parseDocument, downloadDocument } from './persistence';
const container = document.querySelector<HTMLDivElement>('#container')!;
const store = new DocumentStore(newDocument(container.clientWidth || 800, container.clientHeight || 600));
const renderer = new DiagramRenderer(store, container);
const modal = document.querySelector<HTMLDivElement>('#mathModal')!;
const input = document.querySelector<HTMLTextAreaElement>('#latexInput')!;
const preview = document.querySelector<HTMLDivElement>('#preview')!;
const status = document.querySelector<HTMLParagraphElement>('#status')!;
let editing: Graphic | null = null;
let editKind: 'text' | 'latex' = 'latex';
let busy = false;
function report(error: unknown) { status.textContent = error instanceof Error ? error.message : String(error); }
function showEditor(kind: 'text' | 'latex', element: Graphic | null = null) {
  editing = element; editKind = kind; input.value = element ? kind === 'text' ? element.text : element.latex : '';
  document.querySelector('#editor-title')!.textContent = kind === 'text' ? 'Edit Label' : 'Enter LaTeX Equation';
  modal.style.display = 'block'; updatePreview(); input.focus();
}
function updatePreview() { if (editKind === 'latex') preview.innerHTML = katex.renderToString(input.value, { throwOnError: false, trust: false, maxExpand: 1000 }); else preview.textContent = input.value; }
input.addEventListener('input', updatePreview);
function closeEditor() { modal.style.display = 'none'; editing = null; }
renderer.onEdit = e => showEditor(e.kind === 'text' ? 'text' : 'latex', e);
const kinds: Record<string, ElementKind> = { addBox: 'rectangle', addCircle: 'circle', addLine: 'line', addArrow: 'arrow', addDashedArrow: 'dashedArrow', addText: 'text' };
async function action(name: string) {
  if (busy) return;
  busy = true; status.textContent = '';
  try {
    if (name in kinds) { const e = newGraphic(kinds[name], store.document); store.add(e); await renderer.addNode(e); }
    else if (name === 'addEquation') showEditor('latex');
    else if (name === 'toggleGrid') renderer.toggleGrid();
    else if (name === 'deleteSelected') renderer.deleteSelected();
    else if (name === 'closeMathModal') closeEditor();
    else if (name === 'download') downloadDocument(store.document);
    else if (name === 'open') document.querySelector<HTMLInputElement>('#file-input')!.click();
    else if (name === 'insertEquation') {
      const e = editing ? { ...editing } : newGraphic(editKind, store.document);
      if (editKind === 'text') e.text = input.value; else e.latex = input.value;
      await renderer.prepare({ ...store.document, presentation: { ...store.document.presentation, elements: [e] } });
      if (editing) store.update(e.id, e); else store.add(e);
      await renderer.render(); closeEditor(); renderer.select(e.id);
    }
  } catch (error) { report(error); } finally { busy = false; }
}
document.querySelectorAll<HTMLButtonElement>('[data-action]').forEach(button => button.addEventListener('click', () => void action(button.dataset.action!)));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape') { closeEditor(); renderer.select(null); }
  if (event.key === 'Delete' && !(event.target instanceof HTMLInputElement) && !(event.target instanceof HTMLTextAreaElement)) renderer.deleteSelected();
});
void renderer.render().catch(report);
document.querySelector<HTMLInputElement>('#file-input')!.addEventListener('change', async event => {
  const chooser = event.target as HTMLInputElement, file = chooser.files?.[0];
  if (!file || busy) return;
  busy = true;
  const previous = structuredClone(store.document);
  try {
    if (file.size > 10000000) throw new Error('Cannot open diagram: file exceeds the 10 MB limit.');
    const candidate = parseDocument(await file.text());
    await renderer.prepare(candidate);
    store.replace(candidate); await renderer.render(); closeEditor(); status.textContent = `Opened ${file.name}`;
  } catch (error) { store.replace(previous); await renderer.render().catch(() => {}); report(error); }
  finally { busy = false; chooser.value = ''; }
});
