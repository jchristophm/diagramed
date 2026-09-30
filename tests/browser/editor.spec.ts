import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
export async function save(page: Page) {
  const pending=page.waitForEvent('download'); await page.getByTitle('Download JSON').click();
  const file=await pending; return JSON.parse(await readFile((await file.path())!,'utf8'));
}
test('object creation is atomic, editable and persistent', async ({page}) => {
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('./');await page.getByTitle('Object',{exact:true}).click();
  await page.locator('#object-name').fill('Canceled');await page.getByRole('button',{name:'Cancel',exact:true}).click();
  expect((await save(page)).semantics.objects).toHaveLength(0);
  await page.getByTitle('Object',{exact:true}).click();await page.locator('#object-name').fill('Rock');await page.locator('#mass-enabled').check();await page.getByRole('button',{name:'Create object',exact:true}).click();
  await expect(page.locator('#object-dialog')).not.toBeVisible();
  const doc=await save(page);expect(doc.semantics.variables[0].state).toBe('unknown');expect(doc.semantics.variables[0]).not.toHaveProperty('value');expect(doc.semantics.objects).toHaveLength(1);expect(doc.presentation.elements[0].semanticId).toBe(doc.semantics.objects[0].id);
  await page.getByTitle('Edit object').click();await page.locator('#object-name').fill('Stone');await page.locator('#mass-state').selectOption('known');await page.locator('#mass-value').fill('2.5');await page.getByRole('button',{name:'Save object',exact:true}).click();await expect(page.locator('#object-dialog')).not.toBeVisible();
  const changed=await save(page);expect(changed.semantics.variables[0]).toMatchObject({id:doc.semantics.variables[0].id,state:'known',value:2.5});expect(changed.semantics.objects[0].id).toBe(doc.semantics.objects[0].id);
  await page.reload();await page.locator('#file-input').setInputFiles({name:'saved.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(changed))});await expect(page.locator('#status')).toContainText('Opened');expect(await save(page)).toEqual(changed);
  expect(await page.locator('[data-action="addArrow"]').count()).toBe(0);expect(errors).toEqual([]);
});
test('collection includes Earth and retains hidden appearance', async ({page},info)=>{
 await page.goto('./');
 await page.getByTitle('Object',{exact:true}).click();await page.locator('#object-name').fill('Table');await page.locator('#object-representation').selectOption('rectangle');await page.getByRole('button',{name:'Create object',exact:true}).click();await expect(page.locator('#object-dialog')).not.toBeVisible();
 const original=await save(page),g=original.presentation.elements[0];
 await page.getByTitle('Objects',{exact:true}).click();await page.getByRole('button',{name:'Hide Table',exact:true}).click();await expect(page.getByRole('button',{name:'Show Table',exact:true})).toBeVisible();await page.getByRole('button',{name:'Close',exact:true}).click();
 expect((await save(page)).presentation.elements[0]).toEqual({...g,visible:false});
 await page.getByTitle('Objects',{exact:true}).click();await page.getByRole('button',{name:'Show Table',exact:true}).click();await page.getByRole('button',{name:'Close',exact:true}).click();expect((await save(page)).presentation.elements[0]).toEqual(g);
 await page.getByTitle('Object',{exact:true}).click();await page.locator('#object-preset').selectOption('planetSurface');await expect(page.locator('#object-name')).toHaveValue('Planet Surface');await expect(page.locator('#object-representation')).toHaveValue('none');await page.getByRole('button',{name:'Create object',exact:true}).click();await expect(page.locator('#object-dialog')).not.toBeVisible();
 const withEarth=await save(page);expect(withEarth.semantics.objects).toHaveLength(2);expect(withEarth.semantics.variables).toHaveLength(1);expect(withEarth.presentation.elements[1].visible).toBe(false);
 await page.getByTitle('Objects',{exact:true}).click();await expect(page.getByRole('button',{name:'Select Planet Surface',exact:true})).toBeVisible();await page.getByRole('button',{name:'Edit Planet Surface',exact:true}).click();await page.locator('#object-name').fill('Planet Surface model');await page.getByRole('button',{name:'Save object',exact:true}).click();await expect(page.locator('#object-dialog')).not.toBeVisible();
 await page.getByTitle('Objects',{exact:true}).click();await page.getByRole('button',{name:'Delete Planet Surface model',exact:true}).click();await expect(page.getByRole('button',{name:'Select Planet Surface model',exact:true})).toHaveCount(0);await page.getByRole('button',{name:'Close',exact:true}).click();
 expect((await save(page)).semantics.objects).toHaveLength(1);await page.screenshot({path:`test-results/phase2-${info.project.name}.png`});
});
async function gesture(page:Page, mobile:boolean, start:{x:number;y:number}, end:{x:number;y:number}) {
 if(mobile) {const cdp=await page.context().newCDPSession(page);await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});for(let i=1;i<=6;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*i/6,y:start.y+(end.y-start.y)*i/6}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await cdp.detach();}
 else {await page.mouse.move(start.x,start.y);await page.mouse.down();await page.mouse.move(end.x,end.y,{steps:6});await page.mouse.up();}
}
test('required Rock Table Earth acceptance with movement resize and reload',async({page},info)=>{
 await page.goto('./');await page.getByTitle('Object',{exact:true}).click();await page.locator('#object-name').fill('Rock');await page.locator('#mass-enabled').check();await page.getByRole('button',{name:'Create object',exact:true}).click();await expect(page.locator('#object-dialog')).not.toBeVisible();
 const before=await save(page);const rockId=before.semantics.objects[0].id,variableId=before.semantics.variables[0].id;const rock=before.presentation.elements[0];
 const box=(await page.locator('.konvajs-content').boundingBox())!;const scale=box.width/before.presentation.canvas.width;
 const rockStart={x:box.x+(rock.x+rock.radius)*scale,y:box.y+rock.y*scale};
 await gesture(page,info.project.name==='mobile',rockStart,{x:rockStart.x-80*scale,y:rockStart.y-120*scale});
 const moved=await save(page);expect(moved.presentation.elements[0].y).not.toBe(rock.y);expect(moved.semantics.objects[0].id).toBe(rockId);
 await page.getByTitle('Object',{exact:true}).click();await page.locator('#object-name').fill('Table');await page.locator('#object-representation').selectOption('rectangle');await page.getByRole('button',{name:'Create object',exact:true}).click();await expect(page.locator('#object-dialog')).not.toBeVisible();
 const withTable=await save(page),table=withTable.presentation.elements[1];
 const anchor={x:box.x+(table.x+table.width+4)*scale,y:box.y+(table.y+table.height/2)*scale};
 await gesture(page,info.project.name==='mobile',anchor,{x:anchor.x+100*scale,y:anchor.y});
 const resized=await save(page);expect(resized.presentation.elements[1].scaleX).toBeGreaterThan(2);expect(resized.presentation.elements[1].scaleY).toBeCloseTo(1);
 await page.getByTitle('Object',{exact:true}).click();await page.locator('#object-preset').selectOption('planetSurface');await page.getByRole('button',{name:'Create object',exact:true}).click();await expect(page.locator('#object-dialog')).not.toBeVisible();
 await page.getByTitle('Objects',{exact:true}).click();for(const name of ['Rock','Table','Planet Surface'])await expect(page.getByRole('button',{name:`Select ${name}`,exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Edit Rock',exact:true}).click();await page.locator('#mass-state').selectOption('known');await page.locator('#mass-value').fill('2.5');await page.getByRole('button',{name:'Save object',exact:true}).click();await expect(page.locator('#object-dialog')).not.toBeVisible();
 const complete=await save(page);expect(complete.semantics.variables.find((v:any)=>v.id===variableId)).toMatchObject({id:variableId,state:'known',value:2.5});expect(complete.presentation.elements[2].visible).toBe(false);
 await page.reload();await page.locator('#file-input').setInputFiles({name:'three-objects.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(complete))});await expect(page.locator('#status')).toContainText('Opened');expect(await save(page)).toEqual(complete);
 await page.getByTitle('Objects',{exact:true}).click();await page.getByRole('button',{name:'Edit Rock',exact:true}).click();await page.locator('#object-name').fill('Pebble');await page.getByRole('button',{name:'Save object',exact:true}).click();await expect(page.locator('#object-dialog')).not.toBeVisible();const final=await save(page);expect(final.semantics.objects[0]).toMatchObject({id:rockId,name:'Pebble'});expect(final.semantics.variables.find((v:any)=>v.id===variableId)).toMatchObject({id:variableId,symbol:'m_{P}'});
 await page.locator('#file-input').setInputFiles({name:'bad-reference.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...final,semantics:{...final.semantics,variables:[]}}))});await expect(page.locator('#status')).toContainText('Cannot open');expect(await save(page)).toEqual(final);
 await page.screenshot({path:`test-results/acceptance-${info.project.name}.png`});
});
test('Phase 1 graphics remain intact and editable with no generic creation tools',async({page})=>{
 const legacy=JSON.parse(await readFile('examples/representative.diagramed.json','utf8'));
 await page.goto('./');await page.locator('#file-input').setInputFiles({name:'phase1.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacy))});await expect(page.locator('#status')).toContainText('Opened');
 const reopened=await save(page);expect(reopened.version).toBe(3);expect(reopened.presentation).toEqual(legacy.presentation);expect(reopened.semantics).toEqual(legacy.semantics);
 const label=legacy.presentation.elements.find((e:any)=>e.kind==='text');const box=(await page.locator('.konvajs-content').boundingBox())!;const scale=box.width/legacy.presentation.canvas.width;
 await page.mouse.dblclick(box.x+label.x*scale+8,box.y+label.y*scale+8);await expect(page.locator('#legacy-dialog')).toBeVisible();await page.locator('#legacy-input').fill('Legacy edited');await page.getByRole('button',{name:'Save label',exact:true}).click();await expect(page.locator('#legacy-dialog')).not.toBeVisible();
 expect((await save(page)).presentation.elements.find((e:any)=>e.id===label.id).text).toBe('Legacy edited');expect(await page.getByTitle('Arrow',{exact:true}).count()).toBe(0);
});
test('point touch targets, charge density editing and symbol collision guidance',async({page},info)=>{
 await page.goto('./');await page.getByTitle('Object',{exact:true}).click();await page.locator('#object-name').fill('Particle');await page.locator('#object-representation').selectOption('point');await page.locator('#charge-enabled').check();await page.locator('#charge-state').selectOption('known');await page.locator('#charge-value').fill('-1e-6');await page.locator('#density-enabled').check();await page.getByRole('button',{name:'Create object',exact:true}).click();await expect(page.locator('#object-dialog')).not.toBeVisible();
 const doc=await save(page);expect(doc.semantics.variables.find((v:any)=>v.quantity==='charge')).toMatchObject({value:-1e-6,state:'known',unit:'C'});const density=doc.semantics.variables.find((v:any)=>v.quantity==='density');expect(density).toMatchObject({symbol:'\\rho_{P}',state:'unknown',unit:'kg/m^3'});
 const g=doc.presentation.elements[0],box=(await page.locator('.konvajs-content').boundingBox())!,scale=box.width/doc.presentation.canvas.width;
 const start={x:box.x+(g.x+14)*scale,y:box.y+g.y*scale};await gesture(page,info.project.name==='mobile',start,{x:start.x+60*scale,y:start.y+40*scale});expect((await save(page)).presentation.elements[0].x).not.toBe(g.x);
 await page.getByTitle('Object',{exact:true}).click();await page.locator('#object-name').fill('Conflict');await page.locator('#mass-enabled').check();await expect(page.locator('#mass-symbol')).not.toBeVisible();await expect(page.locator('#mass-preview .katex')).toBeVisible();await page.getByRole('button',{name:'Cancel',exact:true}).click();expect((await save(page)).semantics.objects).toHaveLength(1);
 await page.getByTitle('Objects',{exact:true}).click();await page.getByRole('button',{name:'Edit Particle',exact:true}).click();await page.locator('#charge-enabled').uncheck();await page.getByRole('button',{name:'Save object',exact:true}).click();await expect(page.locator('#object-dialog')).not.toBeVisible();const edited=await save(page);expect(edited.semantics.variables).toHaveLength(1);expect(edited.semantics.variables[0].id).toBe(density.id);
 await page.getByTitle('Objects',{exact:true}).click();await page.getByRole('button',{name:'Delete Particle',exact:true}).click();await expect(page.getByRole('button',{name:'Select Particle',exact:true})).toHaveCount(0);await page.getByRole('button',{name:'Close',exact:true}).click();const empty=await save(page);expect(empty.semantics.objects).toHaveLength(0);expect(empty.semantics.variables).toHaveLength(0);expect(empty.presentation.elements).toHaveLength(0);
});
