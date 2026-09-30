import { test, expect, type Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
async function save(page: Page) {
  const downloaded = page.waitForEvent('download'); await page.getByTitle('Download JSON').click();
  const file = await downloaded; return JSON.parse(await readFile((await file.path())!, 'utf8'));
}
test('create, manipulate, download, reopen, edit math and save again', async ({ page }, info) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.goto('./'); await expect(page.locator('canvas').first()).toBeVisible();
  for (const title of ['Box', 'Circle', 'Arrow', 'Arrow', 'Dashed Arrow', 'Line', 'Label']) await page.getByTitle(title, {exact:true}).click();
  await page.getByTitle('Insert Math').click(); await page.locator('#latexInput').fill('F=ma'); await page.getByRole('button', {name:'Insert',exact:true}).click();
  await expect(page.locator('#mathModal')).toBeHidden();
  const original = await save(page); expect(original.presentation.elements).toHaveLength(8);
  expect(original.presentation.elements.at(-1).latex).toBe('F=ma');
  // Reopen modified native geometry, proving the renderer uses the document model.
  const arrow = original.presentation.elements.find((e:any) => e.kind === 'arrow'); arrow.points = [0,0,-80,100]; arrow.x = 80; arrow.y = 100;
  const label = original.presentation.elements.find((e:any) => e.kind === 'text'); label.x = 40; label.y = 40;
  const math = original.presentation.elements.at(-1); math.x = 120; math.y = 200;
  await page.reload(); await page.locator('#file-input').setInputFiles({name:'roundtrip.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(original))});
  await expect(page.locator('#status')).toContainText('Opened'); expect(await save(page)).toEqual(original);
  const box = await page.locator('#container').boundingBox();
  const canvas = original.presentation.canvas; const scale = Math.min(box!.width / canvas.width,box!.height / canvas.height);
  // Adjust the first arrow's endpoint through the actual enlarged hit target.
  const head = {x:box!.x+80*scale,y:box!.y+100*scale};
  const mid = {x:box!.x+40*scale,y:box!.y+150*scale};
  if (info.project.name === 'mobile') await page.touchscreen.tap(mid.x,mid.y); else await page.mouse.click(mid.x,mid.y);
  if (info.project.name === 'mobile') {
    const session = await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:head.x,y:head.y}]});
    for (let step=1;step<=5;step++) await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:head.x+step*8*scale,y:head.y+step*8*scale}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]}); await session.detach();
  } else {
    await page.mouse.move(head.x,head.y); await page.mouse.down(); await page.mouse.move(head.x+40*scale,head.y+40*scale,{steps:5}); await page.mouse.up();
  }
  const adjusted = await save(page); expect(adjusted.presentation.elements.find((e:any)=>e.id===arrow.id).points).not.toEqual(arrow.points);
  await page.mouse.click(box!.x+canvas.width*scale-20,box!.y+canvas.height*scale-20);
  // Text double-click/tap invokes editing on reconstructed nodes.
  const point = {x:box!.x+40*scale+8,y:box!.y+40*scale+8};
  await page.mouse.dblclick(point.x,point.y); await expect(page.locator('#mathModal')).toBeVisible();
  await page.locator('#latexInput').fill('Updated label'); await page.getByRole('button',{name:'Insert',exact:true}).click(); await expect(page.locator('#mathModal')).toBeHidden();
  const mathPoint={x:box!.x+120*scale+8,y:box!.y+200*scale+8}; await page.mouse.dblclick(mathPoint.x,mathPoint.y);
  await expect(page.locator('#latexInput')).toHaveValue('F=ma'); await page.locator('#latexInput').fill('F=2ma'); await page.getByRole('button',{name:'Insert',exact:true}).click(); await expect(page.locator('#mathModal')).toBeHidden();
  const changed=await save(page); expect(changed.presentation.elements.find((e:any)=>e.id===math.id).latex).toBe('F=2ma');
  expect(changed.presentation.elements.find((e:any)=>e.id===label.id).text).toBe('Updated label');
  await page.locator('#file-input').setInputFiles({name:'broken.json',mimeType:'application/json',buffer:Buffer.from('{')});
  await expect(page.locator('#status')).toContainText('not valid JSON'); expect(await save(page)).toEqual(changed);
  expect(errors).toEqual([]); await page.screenshot({path:`test-results/${info.project.name}.png`});
});
test('drag snapping, transformation, grid state and deletion persist', async ({ page }, info) => {
  await page.goto('./'); await page.getByTitle('Box',{exact:true}).click();
  const doc=await save(page), e=doc.presentation.elements[0];
  const box=(await page.locator('#container').boundingBox())!;
  const scale=Math.min(box.width/doc.presentation.canvas.width,box.height/doc.presentation.canvas.height);
  const start={x:box.x+(e.x+10)*scale,y:box.y+(e.y+10)*scale};
  // Rectangle fill is transparent; click its left border to select and drag.
  start.x=box.x+e.x*scale+2;
  await page.mouse.move(start.x,start.y); await page.mouse.down(); await page.mouse.move(start.x+63*scale,start.y+43*scale,{steps:5}); await page.mouse.up();
  const moved=await save(page), rect=moved.presentation.elements[0];
  expect(rect.x).not.toBe(e.x); expect(rect.x%20).toBe(0); expect(rect.y%20).toBe(0);
  await page.mouse.click(box.x+rect.x*scale+2,box.y+(rect.y+10)*scale);
  // Drag the bottom-right transformer anchor to resize.
  const corner={x:box.x+(rect.x+rect.width+4)*scale,y:box.y+(rect.y+rect.height+4)*scale};
  await page.mouse.move(corner.x,corner.y); await page.mouse.down(); await page.mouse.move(corner.x+40*scale,corner.y+40*scale,{steps:5}); await page.mouse.up();
  const transformed=await save(page); expect(transformed.presentation.elements[0].scaleX).not.toBe(1);
  await page.getByTitle('Toggle Grid').click(); expect((await save(page)).presentation.grid.visible).toBe(false);
  await page.getByTitle('Delete',{exact:true}).click(); expect((await save(page)).presentation.elements).toHaveLength(0);
});
