import {test,expect,type Page} from './test-fixture';
import {DocumentStore} from '../../src/model';
import {saveObject,presetDraft} from '../../src/objects';
import {saveVector} from '../../src/physics';
import {saveCoordinates} from '../../src/coordinates';
import {readFile} from 'node:fs/promises';
async function saved(page:Page){const p=page.waitForEvent('download');await page.getByTitle('Download JSON').click();return JSON.parse(await readFile((await(await p).path())!,'utf8'));}
async function load(page:Page,doc:any){await page.locator('#file-input').setInputFiles({name:'labels.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(doc))});await expect(page.locator('#status')).toContainText('Opened');}
async function select(page:Page,symbol:string){await page.locator('#elements-menu summary').click();await page.getByRole('button',{name:'Vectors',exact:true}).click();await page.getByRole('button',{name:`Select ${symbol}`,exact:true}).click();await expect.poll(()=>page.evaluate(()=>(window as any).Konva.stages[0].find('.angle-label').length)).toBe(2);}
function fixture(){const s=new DocumentStore(),o=saveObject(s,{...presetDraft('ordinary'),name:'Book'});const v=saveVector(s,{kind:'velocity',targetId:o,magnitude:{state:'unknown',unit:'m/s'},angle:-35,length:100});saveCoordinates(s,{dimensions:2,angle:0,origin:[-120,100]});return {s,v,symbol:s.document.semantics.variables[0].symbol};}
async function snapshot(page:Page){return page.evaluate(()=>{const s=(window as any).Konva.stages[0];return {labels:[...s.find('.component-label'),...s.find('.angle-label')].map((n:any)=>({name:n.name(),axis:n.getAttr('axis'),x:n.x(),y:n.y(),math:n.getAttr('math')})),components:s.find('.vector-component').map((n:any)=>n.points()),angles:s.find('.component-angle').map((n:any)=>({x:n.x(),y:n.y(),axis:n.getAttr('axis')})),active:s.findOne('.vector-components')?.getAttr('vectorId')};});}
async function drag(page:Page,mobile:boolean,name:string,axis:string,dx:number,dy:number){
 const p=await page.evaluate(({name,axis})=>{const s=(window as any).Konva.stages[0],n=s.find('.'+name).find((n:any)=>n.getAttr('axis')===axis),r=n.getClientRect(),c=s.container().getBoundingClientRect();return {x:c.left+r.x+r.width/2,y:c.top+r.y+r.height/2,scale:s.scaleX()};},{name,axis});
 const end={x:p.x+dx*p.scale,y:p.y+dy*p.scale};
 if(mobile){const c=await page.context().newCDPSession(page);await c.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:p.x,y:p.y}]});for(let i=1;i<=10;i++)await c.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:p.x+(end.x-p.x)*i/10,y:p.y+(end.y-p.y)*i/10}]});await c.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await c.detach();}else{await page.mouse.move(p.x,p.y);await page.mouse.down();await page.mouse.move(end.x,end.y,{steps:10});await page.mouse.up();}
}
test('four independent label offsets preserve geometry, history, zoom, pan and reload',async({page},info)=>{
 const {s,v,symbol}=fixture();s.document.semantics.vectors[0].componentAngle={coordinateSystemId:s.document.semantics.coordinateSystems[0].id,axis:'x',value:35};await page.goto('./');await load(page,s.document);await select(page,symbol);
 const original=await saved(page),initial=await snapshot(page);
 for(const [name,axis,dx,dy] of [['component-label','x',30,40],['component-label','y',-30,-40],['angle-label','x',-55,40],['angle-label','y',35,40]] as const){
   const before=await snapshot(page);await drag(page,info.project.name==='mobile',name,axis,dx,dy);const after=await snapshot(page);
   for(let i=0;i<before.labels.length;i++){const a=before.labels[i],b=after.labels[i];expect(b.x-a.x).toBeCloseTo(a.name===name&&a.axis===axis?dx:0);expect(b.y-a.y).toBeCloseTo(a.name===name&&a.axis===axis?dy:0);}
   expect(after.components).toEqual(initial.components);expect(after.angles).toEqual(initial.angles);
   const changed=await saved(page);expect(changed.semantics).toEqual(original.semantics);
   await page.getByTitle('Undo',{exact:true}).click();await expect.poll(async()=>(await snapshot(page)).labels).toEqual(before.labels);
   await page.getByTitle('Redo',{exact:true}).click();await expect.poll(async()=>(await snapshot(page)).labels).toEqual(after.labels);
 }
 const moved=await saved(page),positions=(await snapshot(page)).labels,g=moved.presentation.elements.find((g:any)=>g.vectorId===v);
 for(const [kind,axis,dx,dy]of [['components','x',30,40],['components','y',-30,-40],['angles','x',-55,40],['angles','y',35,40]] as const){expect(g.decompositionLabels[kind][axis][0]).toBeCloseTo(dx);expect(g.decompositionLabels[kind][axis][1]).toBeCloseTo(dy);}
 await page.getByRole('button',{name:'Zoom in',exact:true}).click();await page.locator('#main-canvas').evaluate(e=>{e.scrollLeft+=20;e.scrollTop+=20;});await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
 await drag(page,info.project.name==='mobile','component-label','x',20,20);const zoomed=(await saved(page)).presentation.elements.find((g:any)=>g.vectorId===v).decompositionLabels.components.x;expect(zoomed[0]).toBeCloseTo(50);expect(zoomed[1]).toBeCloseTo(60);
 await page.getByTitle('Undo',{exact:true}).click();await expect.poll(async()=>(await snapshot(page)).labels).toEqual(positions);
 await page.reload();await load(page,moved);await select(page,symbol);expect((await snapshot(page)).labels).toEqual(positions);expect(await saved(page)).toEqual(moved);
});
test('coordinate selection retains the active vector, configuration updates it and another vector takes over',async({page})=>{
 const {s,v,symbol}=fixture();const other=saveVector(s,{kind:'acceleration',targetId:s.document.semantics.objects[0].id,magnitude:{state:'unknown',unit:'m/s^2'},angle:-60,length:120}),otherSymbol=s.document.semantics.variables.find(x=>x.ownerVectorId===other)!.symbol;
 await page.goto('./');await load(page,s.document);await select(page,symbol);const before=await snapshot(page);
 await page.getByTitle('Coordinates',{exact:true}).click();await page.locator('#coordinate-angle').fill('15');await page.getByRole('button',{name:'Save coordinates'}).click();await expect.poll(async()=>(await snapshot(page)).active).toBe(v);expect((await snapshot(page)).components).not.toEqual(before.components);expect((await snapshot(page)).angles).toHaveLength(2);
 await page.getByTitle('Coordinates',{exact:true}).click();await page.locator('#coordinate-reverse-x').check();await page.getByRole('button',{name:'Save coordinates'}).click();await expect.poll(async()=>(await snapshot(page)).active).toBe(v);
 await select(page,otherSymbol);expect((await snapshot(page)).active).toBe(other);
});
