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
  await page.getByTitle('Object',{exact:true}).click();await page.locator('#object-name').fill('Rock');await page.locator('#mass-enabled').check();await page.locator('#mass-symbol').fill('m_2');await page.getByRole('button',{name:'Create object',exact:true}).click();
  await expect(page.locator('#object-dialog')).not.toBeVisible();
  const doc=await save(page);expect(doc.semantics.variables[0].state).toBe('unknown');expect(doc.semantics.variables[0]).not.toHaveProperty('value');expect(doc.semantics.objects).toHaveLength(1);expect(doc.presentation.elements[0].semanticId).toBe(doc.semantics.objects[0].id);
  await page.getByTitle('Edit object').click();await page.locator('#object-name').fill('Stone');await page.locator('#mass-state').selectOption('known');await page.locator('#mass-value').fill('2.5');await page.getByRole('button',{name:'Save object',exact:true}).click();await expect(page.locator('#object-dialog')).not.toBeVisible();
  const changed=await save(page);expect(changed.semantics.variables[0]).toMatchObject({id:doc.semantics.variables[0].id,state:'known',value:2.5});expect(changed.semantics.objects[0].id).toBe(doc.semantics.objects[0].id);
  await page.reload();await page.locator('#file-input').setInputFiles({name:'saved.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(changed))});await expect(page.locator('#status')).toContainText('Opened');expect(await save(page)).toEqual(changed);
  expect(await page.locator('[data-action="addArrow"]').count()).toBe(0);expect(errors).toEqual([]);
});
