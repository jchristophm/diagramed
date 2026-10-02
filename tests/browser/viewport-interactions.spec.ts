import {test,expect} from './test-fixture';
import {DocumentStore} from '../../src/model';
import {saveObject,presetDraft} from '../../src/objects';
import {saveVector} from '../../src/physics';
import {saveCoordinates} from '../../src/coordinates';
import {readFile} from 'node:fs/promises';
async function saved(page:any){const pending=page.waitForEvent('download');await page.getByTitle('Download JSON').click();return JSON.parse(await readFile((await (await pending).path())!,'utf8'));}
async function point(page:any,x:number,y:number){await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));return page.evaluate(({x,y})=>{const s=(window as any).Konva.stages[0],r=s.container().getBoundingClientRect(),p=s.getAbsoluteTransform().point({x,y});return {x:r.left+p.x,y:r.top+p.y};},{x,y});}
async function drag(page:any,mobile:boolean,start:any,end:any){if(mobile){const c=await page.context().newCDPSession(page);await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[start]});for(let i=1;i<=8;i++)await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:start.x+(end.x-start.x)*i/8,y:start.y+(end.y-start.y)*i/8}]});await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await c.detach();}else{await page.mouse.move(start.x,start.y);await page.mouse.down();await page.mouse.move(end.x,end.y,{steps:8});await page.mouse.up();}}
test('object, label, vector endpoint, surface and coordinate gestures work after pan and zoom',async({page},info)=>{
 const s=new DocumentStore();const book=saveObject(s,{name:'Book',representation:'circle',showName:true,showProperties:true,properties:{mass:{state:'unknown',unit:'kg'}}});const table=saveObject(s,{name:'Table',representation:'rectangle',showName:true,showProperties:true});const bg=s.document.presentation.elements[0],tg=s.document.presentation.elements[1];bg.x=-60;bg.y=-60;tg.x=40;tg.y=40;
 saveObject(s,presetDraft('planetSurface'));const surface=s.document.presentation.elements[2];surface.y=180;surface.height=1020;
 const v=saveVector(s,{kind:'force',interactionType:'contact',contactType:'ordinary',sourceId:table,targetId:book,magnitude:{state:'unknown',unit:'N'},angle:-90,length:80});const vg=s.document.presentation.elements.find(g=>g.vectorId===v)!;
 saveCoordinates(s,{dimensions:2,angle:30,origin:[0,80]});
 await page.goto('./');await page.locator('#file-input').setInputFiles({name:'gestures.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(s.document))});await expect(page.locator('#status')).toContainText('Opened');await page.getByRole('button',{name:'Zoom in',exact:true}).click();
 await page.locator('#main-canvas').evaluate(e=>{e.scrollLeft+=20;e.scrollTop+=20;});
 const mobile=info.project.name==='mobile';await drag(page,mobile,await point(page,-60,-42),await point(page,-90,-12));let d=await saved(page);expect(d.presentation.elements[0]).toMatchObject({x:-90,y:-30});
 await page.locator('#elements-menu summary').click();await page.getByRole('button',{name:'Vectors',exact:true}).click();await page.getByRole('button',{name:'Select N_{T,B}',exact:true}).count();await page.getByRole('button',{name:'Close',exact:true}).click();
 // Select the full vector, then its endpoint; both transforms must include translation.
 await page.mouse.click((await point(page,-90,-70)).x,(await point(page,-90,-70)).y);
 await drag(page,mobile,await point(page,-90,-110),await point(page,-50,-130));d=await saved(page);const points=d.presentation.elements.find((g:any)=>g.id===vg.id).points;expect(points[2]).toBeCloseTo(40);expect(points[3]).toBeCloseTo(-100);
 await drag(page,mobile,await point(page,100,180),await point(page,100,160));d=await saved(page);expect(d.presentation.elements.find((g:any)=>g.id===surface.id).y).toBe(160);
 await drag(page,mobile,await point(page,0,80),await point(page,20,100));d=await saved(page);expect(d.semantics.coordinateSystems[0].origin).toEqual([20,100]);
 const label=await page.evaluate(id=>{const s=(window as any).Konva.stages[0],l=s.find('.semantic-label').find((n:any)=>n.getAttr('graphicId')===id),r=l.getClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};},bg.id);const rect=(await page.locator('.konvajs-content').boundingBox())!;await drag(page,mobile,{x:rect.x+label.x,y:rect.y+label.y},{x:rect.x+label.x+30,y:rect.y+label.y+25});expect((await saved(page)).presentation.elements[0].label.offsetX).not.toBe(0);
 await page.screenshot({path:`test-results/viewport-${info.project.name}.png`});
});
