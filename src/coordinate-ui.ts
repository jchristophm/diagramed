import { DocumentStore } from './model';
import { DiagramRenderer } from './renderer';
import { saveCoordinates, deleteCoordinates } from './coordinates';
const $ = <T extends HTMLElement>(s: string) => document.querySelector<T>(s)!;
export function initializeCoordinates(store: DocumentStore, renderer: DiagramRenderer) {
  const dialog=$<HTMLDialogElement>('#coordinate-dialog');
  const dimensions=$<HTMLSelectElement>('#coordinate-dimensions');
  const refreshDimensions=()=>{$('#reverse-y-label').hidden=dimensions.value!=='2';};
  dimensions.addEventListener('change',refreshDimensions);
  function open() {
    const c=store.document.semantics.coordinateSystems[0];
    $('#coordinate-title').textContent=c?'Configure coordinate system':'Define coordinate system';
    $<HTMLSelectElement>('#coordinate-dimensions').value=String(c?.dimensions??2);
    $<HTMLInputElement>('#coordinate-angle').value=String(c?.angle??0);
    $<HTMLInputElement>('#coordinate-visible').checked=c?.visible!==false;
    $<HTMLInputElement>('#coordinate-reverse-x').checked=c?.reverseX??false;
    $<HTMLInputElement>('#coordinate-reverse-y').checked=c?.reverseY??false;refreshDimensions();
    $('#delete-coordinates').hidden=!c;$('#coordinate-error').textContent='';dialog.showModal();
  }
  renderer.onCoordinateEdit=open;
  $('#cancel-coordinates').addEventListener('click',()=>dialog.close());
  $('#coordinate-form').addEventListener('submit',async event=>{
    event.preventDefault();try {
      const c=store.document.semantics.coordinateSystems[0],canvas=store.document.presentation.canvas;
      const text=$<HTMLInputElement>('#coordinate-angle').value.trim();if(!text)throw new Error('Enter a rotation angle.');
      const id=saveCoordinates(store,{id:c?.id,dimensions:Number($<HTMLSelectElement>('#coordinate-dimensions').value) as 1|2,angle:Number(text),origin:c?.origin??[0,0],visible:$<HTMLInputElement>('#coordinate-visible').checked,reverseX:$<HTMLInputElement>('#coordinate-reverse-x').checked,reverseY:$<HTMLInputElement>('#coordinate-reverse-y').checked});
      await renderer.render();renderer.select(id);dialog.close();
    } catch(error){$('#coordinate-error').textContent=(error as Error).message;}
  });
  $('#delete-coordinates').addEventListener('click',async()=>{deleteCoordinates(store);await renderer.render();dialog.close();});
  return {open};
}
