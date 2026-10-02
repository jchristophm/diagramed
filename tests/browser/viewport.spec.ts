import {test,expect} from './test-fixture';
async function save(page:any){const pending=page.waitForEvent('download');await page.getByTitle('Download JSON').click();return JSON.parse(await readFile((await (await pending).path())!,'utf8'));}
import {readFile} from 'node:fs/promises';
async function create(page:any,name:string){await page.getByTitle('Object',{exact:true}).click();await page.locator('#object-name').fill(name);await page.getByRole('button',{name:'Create object',exact:true}).click();await expect(page.locator('#object-dialog')).not.toBeVisible();}
test('view transforms preserve document geometry, spawn scale, surfaces and history',async({page})=>{
 await page.goto('./');await create(page,'Book');
 await page.getByTitle('Object',{exact:true}).click();await page.locator('#object-type').selectOption('planetSurface');await page.getByRole('button',{name:'Create object',exact:true}).click();await expect(page.locator('#object-dialog')).not.toBeVisible();
 const before=await save(page);expect(before.presentation.elements[0]).toMatchObject({x:0,y:0,radius:20});
 await page.getByRole('button',{name:'Zoom in',exact:true}).click();await expect(page.locator('[data-action="zoom-reset"]')).toHaveText('125%');
 await page.locator('#main-canvas').evaluate(e=>{e.scrollLeft+=120;e.scrollTop+=80;});
 await page.setViewportSize({width:600,height:500});expect(await save(page)).toEqual(before);
 await page.getByRole('button',{name:'Zoom out',exact:true}).click();await page.locator('[data-action="zoom-reset"]').click();expect(await save(page)).toEqual(before);
 await create(page,'Rock');const after=await save(page);expect(after.presentation.elements[2].radius).toBe(20);expect(after.presentation.elements[2].x).toBe(20);
 await page.getByTitle('Undo',{exact:true}).click();expect(await save(page)).toEqual(before);
 await page.reload();await page.locator('#file-input').setInputFiles({name:'view.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(after))});await expect(page.locator('#status')).toContainText('Opened');expect(await save(page)).toEqual(after);
});
test('two finger pinch and pan share zoom without changing or dirtying the document',async({page})=>{
 await page.goto('./');await create(page,'Book');const before=await save(page);
 const c=await page.context().newCDPSession(page);const start=[{x:120,y:230,id:1},{x:240,y:230,id:2}];
 await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:start});
 await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:100,y:250,id:1},{x:260,y:250,id:2}]});
 await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await expect(page.locator('[data-action="zoom-reset"]')).toHaveText('133%');expect(await save(page)).toEqual(before);expect(await page.locator('body').getAttribute('data-dirty')).toBe('false');await c.detach();
});
test('all historical examples migrate once and remain identical on a second save/load',async({page})=>{
 await page.goto('./');for(const name of ['representative','version2','semantic-objects','scenario-A','scenario-B','scenario-C','scenario-D','scenario-E','scenario-F']){
 const text=await readFile(`examples/${name}.diagramed.json`,'utf8');await page.locator('#file-input').setInputFiles({name:`${name}.json`,mimeType:'application/json',buffer:Buffer.from(text)});await expect(page.locator('#status')).toContainText('Opened');const first=await save(page);
 await page.locator('#file-input').setInputFiles({name:'again.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(first))});await expect(page.locator('#status')).toContainText('again.json');expect(await save(page)).toEqual(first);
 }
});
