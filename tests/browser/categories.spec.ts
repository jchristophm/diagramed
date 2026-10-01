import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
test('specialized presets, point eligibility and category persistence',async({page})=>{
 await page.goto('./');
 for(const [category,name] of [['planetSurface','Planet Surface'],['spatialPoint','Spatial point'],['spring','Spring'],['cable','String/Cable'],['chargedPlate','Charged Plate'],['fluid','Water']]){
  await page.getByTitle('Object',{exact:true}).click();await page.locator('#object-type').selectOption(category);await expect(page.locator('#object-name')).toHaveValue(name);
  if(category==='spatialPoint'){await expect(page.locator('#mass-enabled')).toHaveCount(0);await expect(page.locator('#density-enabled')).toHaveCount(0);}
  await page.getByRole('button',{name:'Create object',exact:true}).click();await expect(page.locator('#object-dialog')).not.toBeVisible();
 }
 const download=page.waitForEvent('download');await page.getByTitle('Download JSON').click();const file=await download;const doc=JSON.parse(await readFile((await file.path())!,'utf8'));expect(doc.version).toBe(3);expect(doc.semantics.objects).toHaveLength(6);expect(doc.semantics.variables.map((v:any)=>v.value)).toEqual([9.8,1000]);
 await page.reload();await page.locator('#file-input').setInputFiles({name:'specialized.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(doc))});await expect(page.locator('#status')).toContainText('Opened');await page.locator('#elements-menu summary').click();await page.getByRole('button',{name:'Objects',exact:true}).click();for(const o of doc.semantics.objects)await expect(page.getByRole('button',{name:`Select ${o.name}`,exact:true})).toBeVisible();
});
