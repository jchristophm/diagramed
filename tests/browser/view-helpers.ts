import type {Page} from '@playwright/test';
/** Test gestures use the actual document-to-viewport transform, including pan. */
export async function canvasPoint(page:Page,x:number,y:number){
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 return page.evaluate(({x,y})=>{const s=(window as any).Konva.stages[0],r=s.container().getBoundingClientRect(),p=s.getAbsoluteTransform().point({x,y});return {x:r.left+p.x,y:r.top+p.y};},{x,y});
}
export async function canvasView(page:Page){await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));return page.evaluate(()=>{const s=(window as any).Konva.stages[0],r=s.container().getBoundingClientRect();return {x:r.left+s.x(),y:r.top+s.y(),scale:s.scaleX()};});}
/** Legacy whole-page regression fixtures explicitly request a view of their
 * original 800x600 region; the application's 100% origin view is tested separately. */
export async function fixtureView(page:Page,doc:any){
 const c=doc.presentation.canvas;
 if(c.width>1000)return;
 await page.locator('[data-action="zoom-reset"]').click();await page.getByRole('button',{name:'Zoom out',exact:true}).click();await page.getByRole('button',{name:'Zoom out',exact:true}).click();
 await page.locator('#main-canvas').evaluate((e,c:any)=>{e.scrollLeft=(0-(c.minX??0))*.5;e.scrollTop=(0-(c.minY??0))*.5;},c);
 await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
}

/** Exact native fixtures exercise tolerance boundaries after numeric orientation
 * was removed from normal UI; direct gestures have separate live regressions. */
export async function fixtureOrientation(page:Page,angle:number){
 const open=await page.locator('#coordinate-dialog').isVisible();if(open)await page.locator('#cancel-coordinates').click();
 const pending=page.waitForEvent('download');await page.getByTitle('Download JSON').click();
 const {readFile}=await import('node:fs/promises');const doc=JSON.parse(await readFile((await(await pending).path())!,'utf8'));
 doc.semantics.coordinateSystems[0].angle=angle;for(const v of doc.semantics.vectors)delete v.componentAngle;
 await page.locator('#file-input').setInputFiles({name:'orientation.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(doc))});
 await page.locator('#status').filter({hasText:'Opened'}).waitFor();if(open)await page.getByTitle('Coordinates',{exact:true}).click();
}
