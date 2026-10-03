import {expressionUsesRemovedVariables,focusExpression,mountExpression,readExpression,updateExpressionVocabulary} from './expression-ui';
import katex from 'katex';
import {abbreviate,propertySymbol,synchronizeSymbols} from './naming';
import type {DiagramDocument} from './model';
import { intrinsicProperties, presetDraft, propertyDefinitions, categoryProperties, type ObjectDraft, type PropertyDraft } from './objects';
import type { PropertyQuantity, ObjectCategory } from './semantics';
/** Form fields are draft state only; the registry is updated on confirmation. */
export function showPropertyFields(host: HTMLElement, properties: ObjectDraft['properties'] = {}, category: ObjectCategory = 'ordinary',doc?:DiagramDocument) {
  host.replaceChildren();
  for (const [key, definition] of Object.entries(propertyDefinitions)) {
    if (!categoryProperties[category].includes(key as PropertyQuantity)) continue;
    const intrinsic=!!intrinsicProperties[category]?.includes(key as PropertyQuantity);
    const property = properties[key as PropertyQuantity] || (intrinsic?presetDraft(category).properties![key as PropertyQuantity]:undefined);
    const fieldset = document.createElement('fieldset'); fieldset.dataset.quantity = key;fieldset.dataset.variableId=property?.id||crypto.randomUUID();
    const heading = document.createElement('label'); heading.className = 'check';
    const enabled = document.createElement('input'); enabled.type = 'checkbox'; enabled.id = `${key}-enabled`; enabled.checked = intrinsic || !!property; enabled.disabled = !categoryProperties[category].includes(key as PropertyQuantity);
    if(!intrinsic)heading.append(enabled); heading.append(document.createTextNode(definition.name)); fieldset.append(heading);
    const details = document.createElement('div'); details.className = 'property-details';
    const symbol = document.createElement('input'); symbol.id = `${key}-symbol`; symbol.value = property?.symbol || ''; symbol.type='hidden'; symbol.dataset.generated=String(property?.generatedSymbol ?? !property?.symbol); symbol.maxLength = 80; symbol.autocomplete = 'off';
    const state = document.createElement('select'); state.id = `${key}-state`; for (const value of ['unknown', 'known','expression']) { const option=document.createElement('option'); option.value=value; option.textContent=value === 'unknown' ? 'Unknown' : value==='expression'?'Expression':'Known'; state.append(option); } state.value = property?.state || 'unknown';
    const value = document.createElement('input'); value.id = `${key}-value`; value.type = 'text'; value.inputMode = 'decimal'; value.placeholder = 'e.g. 2.5 or 1e-3'; value.value = property?.value === undefined ? '' : String(property.value);
    const unit = document.createElement('select'); unit.id = `${key}-unit`; for (const name of definition.units) { const option=document.createElement('option');option.value=name;option.textContent=name;unit.append(option); } unit.value=property?.unit || definition.units[0];
    const preview = document.createElement('div'); preview.className = 'symbol-preview'; preview.id = `${key}-preview`;
    const label = (name: string, control: HTMLElement) => { const element=document.createElement('label');element.textContent=name;element.append(control);details.append(element);return element; };
    details.append(symbol,preview);label('Property state',state);const valueLabel=label('Numerical value',value);label('Units',unit);
    const expression=document.createElement('div');expression.id=`${key}-expression`;details.append(expression);if(doc)mountExpression(expression,doc,undefined,property?.expression);
    const refresh = () => {
      details.hidden=!enabled.checked; valueLabel.hidden=state.value!=='known';value.disabled=!enabled.checked || state.value!=='known';expression.hidden=state.value!=='expression';
      symbol.required=false;value.required=enabled.checked && state.value==='known';
      preview.innerHTML=katex.renderToString(symbol.value,{throwOnError:false,trust:false,maxExpand:1000});
    };
    enabled.addEventListener('change',refresh);state.addEventListener('change',()=>{refresh();if(state.value==='expression')focusExpression(expression);});symbol.addEventListener('input',refresh);refresh();
    fieldset.append(details);host.append(fieldset);
  }
}
export function readPropertyFields(host: HTMLElement): ObjectDraft['properties'] {
  const properties: ObjectDraft['properties'] = {};
  for (const fieldset of host.querySelectorAll<HTMLFieldSetElement>('fieldset[data-quantity]')) {
    const key=fieldset.dataset.quantity as PropertyQuantity;
    if (fieldset.querySelector<HTMLInputElement>(`#${key}-enabled`)?.checked===false) continue;
    const symbol=fieldset.querySelector<HTMLInputElement>(`#${key}-symbol`)!.value.trim();
    try { katex.renderToString(symbol,{throwOnError:true,trust:false,maxExpand:1000}); } catch { throw new Error(`Check the symbol for ${propertyDefinitions[key].name.toLowerCase()}.`); }
    const state=fieldset.querySelector<HTMLSelectElement>(`#${key}-state`)!.value as PropertyDraft['state'];
    const unit=fieldset.querySelector<HTMLSelectElement>(`#${key}-unit`)!.value;
    const valueText=fieldset.querySelector<HTMLInputElement>(`#${key}-value`)!.value.trim();
    if (state==='known' && !valueText) throw new Error(`Enter a numerical value for ${propertyDefinitions[key].name.toLowerCase()}.`);
    const control=fieldset.querySelector<HTMLInputElement>(`#${key}-symbol`)!;
    properties[key]={state,unit,id:fieldset.dataset.variableId};if(state==='expression')properties[key]!.expression=readExpression(fieldset.querySelector(`#${key}-expression`)!); if(control.dataset.generated==='false')properties[key]!.symbol=symbol;if(state==='known') properties[key]!.value=Number(valueText);
  }
  return properties;
}

export function refreshPropertySymbols(host:HTMLElement,document:DiagramDocument,name:string,category:ObjectCategory,id?:string){
 const doc=structuredClone(document),object=doc.semantics.objects.find(o=>o.id===id);const target=id||'preview-object';if(object)object.name=name;else doc.semantics.objects.push({id:target,name,category});abbreviate(doc);
 const fields=[...host.querySelectorAll<HTMLFieldSetElement>('fieldset[data-quantity]')];
 for(const fieldset of fields){const key=fieldset.dataset.quantity as PropertyQuantity,control=fieldset.querySelector<HTMLInputElement>(`#${key}-symbol`)!;
  if(control.dataset.generated==='true')control.value=propertySymbol(doc,target,key);
  fieldset.querySelector(`#${key}-preview`)!.innerHTML=katex.renderToString(control.value,{throwOnError:false,trust:false,maxExpand:1000});
  const id=fieldset.dataset.variableId!;doc.semantics.variables=doc.semantics.variables.filter(v=>v.id!==id);
  if(fieldset.querySelector<HTMLInputElement>(`#${key}-enabled`)?.checked!==false)doc.semantics.variables.push({id,symbol:control.value,generatedSymbol:control.dataset.generated==='true',quantity:key,state:'unknown',unit:fieldset.querySelector<HTMLSelectElement>(`#${key}-unit`)!.value,ownerObjectId:target});
 }
 synchronizeSymbols(doc);
 for(const fieldset of fields){const key=fieldset.dataset.quantity!,control=fieldset.querySelector<HTMLInputElement>(`#${key}-symbol`)!,v=doc.semantics.variables.find(v=>v.id===fieldset.dataset.variableId);if(v&&control.dataset.generated==='true')control.value=v.symbol;fieldset.querySelector(`#${key}-preview`)!.innerHTML=katex.renderToString(control.value,{throwOnError:false,trust:false,maxExpand:1000});const expression=fieldset.querySelector<HTMLElement>(`#${key}-expression`)!;if(expressionUsesRemovedVariables(expression,doc)){const state=fieldset.querySelector<HTMLSelectElement>(`#${key}-state`)!;if(state.value==='expression'){state.value='unknown';state.dispatchEvent(new Event('change'));}}updateExpressionVocabulary(expression,doc);}
}
