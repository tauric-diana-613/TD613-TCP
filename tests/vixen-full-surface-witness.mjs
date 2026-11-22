/**
 * Exact-source full-scroll visual inventory for the Vixen preview.
 * Run with scripts/run-vixen-browser-tests.mjs (real localhost HTTP).
 * Images document rendered browser states; they confer neither human visual
 * acceptance nor physical-iPhone/empirical/scholarly closure.
 */
import {chromium} from 'playwright';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import path from 'node:path';

const origin='http://127.0.0.1:6130/encyclopedia/vix-cyb.html';
const root=path.resolve('artifacts/vixen-full-surface');
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const profiles=[
 {name:'desktop-1440x900',width:1440,height:900},
 {name:'desktop-1024x768',width:1024,height:768},
 {name:'iphone-390x844',width:390,height:844,isMobile:true},
 {name:'iphone-428x926',width:428,height:926,isMobile:true}
];
const primaryRoutes=['overview','works','observatory','collection','reference','protocols','gates','holds'];
const records=[],failure=[];
await mkdir(root,{recursive:true});
function slug(x){return String(x).toLowerCase().replace(/[^a-z0-9_-]+/g,'-').slice(0,100);}
async function capture(page,rel,details){
 const dest=path.join(root,rel);
 await mkdir(path.dirname(dest),{recursive:true});
 await page.screenshot({path:dest,type:'jpeg',quality:85,animations:'allow',timeout:30000});
 const bytes=await readFile(dest);
 const record={file:rel,sha256:createHash('sha256').update(bytes).digest('hex'),byte_length:bytes.length,...details};
 records.push(record);
 return record;
}
async function scrollCapture(page,profile,surface,{rootSelector='body'}={}){
 const dom=await page.evaluate(()=>({scrollHeight:Math.max(document.body.scrollHeight,document.documentElement.scrollHeight),viewport:innerHeight,view:document.body.dataset.view}));
 const travel=Math.max(0,dom.scrollHeight-dom.viewport);
 // Fixed masthead and mobile dock obscure the top/bottom of each image.
 // Use a deliberate 42% tile overlap so each portion of scrollable content
 // appears unobscured in at least one neighboring viewport capture.
 const step=Math.max(1,Math.floor(dom.viewport*.58));
 const yPositions=new Set([0,travel]);
 for(let y=0;y<travel;y+=step)yPositions.add(Math.min(travel,y));
 const positions=[...yPositions].sort((a,b)=>a-b);
 if(positions.length>125)throw Error('UNBOUNDED_DOCUMENT_HEIGHT '+surface+' '+dom.scrollHeight+' tiles='+positions.length);
 let last=-1;
 for(const [i,y] of positions.entries()){
  await page.evaluate(v=>window.scrollTo({top:v,behavior:'instant'}),y);
  await page.waitForTimeout(75);
  const observed=await page.evaluate(()=>({y:Math.round(window.scrollY),total:Math.max(document.body.scrollHeight,document.documentElement.scrollHeight),viewport:innerHeight,mesh:window.VixenLivingMesh?.status?.()??null}));
  if(observed.y<last)throw Error('SCROLL_EPOCH_REGRESSED '+surface);
  last=observed.y;
  await capture(page,path.join(profile.name,slug(surface),'document-'+String(i).padStart(3,'0')+'-y'+observed.y+'.jpg'),{
   profile:profile.name,surface,kind:'document_scroll_tile',tile:i,requested_y:y,observed_y:observed.y,
   document_height:observed.total,viewport_height:observed.viewport,room:observed.mesh?.route??null,
   mesh_status:observed.mesh?.motion??null
  });
 }
 // Live Observatory and other panels may increase height while images
 // are captured. Extend coverage at the original overlap until two stable
 // bottom observations agree; bounded failure preserves any missing evidence.
 let end=null,correctionTiles=0,stableBottomObservations=0;
 while(correctionTiles<80){
  await page.waitForTimeout(90);
  end=await page.evaluate(()=>({y:Math.round(window.scrollY),max:Math.max(0,Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)-innerHeight)}));
  if(end.max-end.y<=2){
   stableBottomObservations++;
   if(stableBottomObservations>=2)break;
   continue;
  }
  stableBottomObservations=0;
  const next=Math.min(end.max,end.y+step);
  await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),next);
  await page.waitForTimeout(75);
  const observed=await page.evaluate(()=>({y:Math.round(window.scrollY),total:Math.max(document.body.scrollHeight,document.documentElement.scrollHeight),viewport:innerHeight,mesh:window.VixenLivingMesh?.status?.()??null}));
  if(observed.y<=end.y)throw Error('SCROLL_EXPANSION_STALLED '+surface+' '+JSON.stringify({end,observed}));
  await capture(page,path.join(profile.name,slug(surface),'document-'+String(positions.length+correctionTiles).padStart(3,'0')+'-y'+observed.y+'.jpg'),{
   profile:profile.name,surface,kind:'document_scroll_tile',tile:positions.length+correctionTiles,
   requested_y:next,observed_y:observed.y,document_height:observed.total,
   viewport_height:observed.viewport,room:observed.mesh?.route??null,mesh_status:observed.mesh?.motion??null,
   adaptive_growth:true
  });
  correctionTiles++;
 }
 if(stableBottomObservations<2)throw Error('SCROLL_BOTTOM_NOT_COVERED '+surface+' '+JSON.stringify(end));
 // Probe contained scroll panes independently: manuscripts, inspector, dialogue and reading cards.
 const panes=await page.evaluate(()=>{
  const scope=document.querySelector('.view:not([hidden])')||document.body;
  return [...scope.querySelectorAll('*')].filter(el=>{
   const st=getComputedStyle(el),r=el.getBoundingClientRect();
   return r.width>=125&&r.height>=130&&el.scrollHeight-el.clientHeight>=200&&
    /auto|scroll/.test(st.overflowY)&&st.display!=='none';
  }).map(el=>{
   if(!el.dataset.vixenWitnessPane)el.dataset.vixenWitnessPane='witness-'+Math.random().toString(16).slice(2,10);
   return {key:el.dataset.vixenWitnessPane,max:el.scrollHeight-el.clientHeight,height:el.clientHeight};
  });
 });
 if(panes.length>50)throw Error('TOO_MANY_NESTED_SCROLLPORTS '+surface+' '+panes.length);
 for(const pane of panes){
  const steps=Math.max(2,Math.ceil(pane.max/Math.max(100,pane.height*.58))+1);
  if(steps>650)throw Error('NESTED_SCROLL_COVERAGE_EXCEEDS_BOUND '+surface+' '+pane.key+' tiles='+steps);
  for(let i=0;i<steps;i++){
   const target=i===steps-1?pane.max:Math.round(i*pane.max/(steps-1));
   const observed=await page.evaluate(({key,y})=>{
    const node=document.querySelector('[data-vixen-witness-pane="'+key+'"]');
    if(!node)return null;
    node.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});
    node.scrollTop=y;
    const rect=node.getBoundingClientRect();
    return {scrollTop:node.scrollTop,max:node.scrollHeight-node.clientHeight,
      visible:rect.bottom>0&&rect.top<innerHeight&&rect.width>0};
   },{key:pane.key,y:target});
   if(!observed)throw Error('NESTED_PANE_DISAPPEARED '+pane.key);
   await page.waitForTimeout(50);
   await capture(page,path.join(profile.name,slug(surface),'pane-'+pane.key+'-'+String(i).padStart(2,'0')+'.jpg'),{
    profile:profile.name,surface,kind:'nested_scroll_tile',pane_id:pane.key,tile:i,
    observed_scroll:observed.scrollTop,pane_max_scroll:observed.max
   });
  }
  const bottom=await page.evaluate(key=>{const n=document.querySelector('[data-vixen-witness-pane="'+key+'"]');return n?{y:n.scrollTop,max:n.scrollHeight-n.clientHeight}:null;},pane.key);
  if(!bottom||bottom.max-bottom.y>2)throw Error('NESTED_SCROLL_BOTTOM_NOT_COVERED '+surface+' '+pane.key);
 }
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
 return {route:surface,scrollHeight:dom.scrollHeight,tiles:positions.length+correctionTiles,nestedPanes:panes.length,covered_bottom:true};
}
const browser=await chromium.launch({headless:true});
const matrix=[];
try{
 for(const profile of profiles){
  const context=await browser.newContext({
   viewport:{width:profile.width,height:profile.height},deviceScaleFactor:1,
   isMobile:!!profile.isMobile,hasTouch:!!profile.isMobile,
   reducedMotion:'no-preference'
  });
  const page=await context.newPage();
  const pageErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e.message||e)));
  const response=await page.goto(origin,{waitUntil:'domcontentloaded',timeout:60000});
  if(response?.status()!==200)throw Error('SOURCE_HTTP_FAILED '+profile.name);
  await page.waitForFunction(()=>window.VIXEN_FOX_HOUSE?.mounted===true,null,{timeout:25000});
  for(const route of primaryRoutes){
   try{
    await page.locator('#vixenRoomRail button[data-view="'+route+'"]').click({force:true,timeout:15000});
    await page.waitForFunction(r=>document.body.dataset.view===r,route,{timeout:10000});
    await page.waitForTimeout(150);
    matrix.push({profile:profile.name,...await scrollCapture(page,profile,route)});
   }catch(e){failure.push({profile:profile.name,route,error:String(e)});}
  }
  try{
   await page.evaluate(()=>document.querySelector('[data-view="operator"]')?.click());
   await page.waitForFunction(()=>document.body.dataset.view==='operator',null,{timeout:9000});
   matrix.push({profile:profile.name,...await scrollCapture(page,profile,'operator-settings')});
  }catch(e){failure.push({profile:profile.name,route:'operator-settings',error:String(e)});}
  // Capture the explicitly entered separate reading room. Do not infer a
  // relationship between its reference records and Vixen's Works.
  try{
   await page.locator('#vixenRoomRail button[data-view="reference"]').click({force:true});
   await page.waitForTimeout(100);
   const entrance=page.locator('#vixenReferenceChamber').getByRole('button',{name:/Open independent reference reading room/i}).first();
   await entrance.click({force:true,timeout:7000});
   await page.waitForTimeout(250);
   const opened=await page.evaluate(()=>document.body.dataset.activeResearchStage==='OPERAHOUSE');
   if(!opened)throw Error('SEPARATE_READING_ROOM_NOT_OPEN');
   matrix.push({profile:profile.name,...await scrollCapture(page,profile,'independent-reading-room')});
  }catch(e){failure.push({profile:profile.name,route:'independent-reading-room',error:String(e)});}
  // Return to Vixen, then inspect actual original Work reader and its own
  // scrollports without presuming every Work/manuscript permutation was visited.
  try{
   await page.evaluate(()=>{
    const b=document.getElementById('operahouseStageReturn');
    if(b&&!b.hidden)b.click();
   });
   await page.locator('#vixenRoomRail button[data-view="works"]').click({force:true});
   await page.locator('#worksListContainer button[data-select-work]').first().click({force:true,timeout:12000});
   await page.waitForTimeout(250);
   matrix.push({profile:profile.name,...await scrollCapture(page,profile,'works-original-reader')});
  }catch(e){failure.push({profile:profile.name,route:'works-original-reader',error:String(e)});}
  // Inspect every public research-inspector pane, including scrollable
  // dialog content. A hidden/pinned developer panel is not omitted silently.
  try{
   await page.evaluate(()=>document.querySelector('[data-action="inspector"]')?.click());
   await page.locator('#inspectorDialog').waitFor({state:'visible',timeout:7000});
   for(const tab of ['census','bench','provenance','podium']){
    await page.locator('[data-insp-tab="'+tab+'"]').click({force:true,timeout:5000});
    await page.waitForTimeout(80);
    const metrics=await page.evaluate(()=>{
     const el=document.querySelector('#inspectorDialog .dialog-body');
     return {max:Math.max(0,el.scrollHeight-el.clientHeight),clientHeight:el.clientHeight};
    });
    const step=Math.max(120,Math.floor(metrics.clientHeight*.82));
    const ys=new Set([0,metrics.max]);
    for(let y=0;y<metrics.max;y+=step)ys.add(Math.min(y,metrics.max));
    const positions=[...ys].sort((a,b)=>a-b);
    if(positions.length>35)throw Error('UNBOUNDED_INSPECTOR_'+tab);
    for(const [i,y] of positions.entries()){
     await page.evaluate(v=>{const el=document.querySelector('#inspectorDialog .dialog-body');el.scrollTop=v;},y);
     await page.waitForTimeout(60);
     await capture(page,path.join(profile.name,'inspector-'+tab,'dialog-'+String(i).padStart(3,'0')+'.jpg'),{
      profile:profile.name,surface:'inspector-'+tab,kind:'dialog_scroll_tile',
      tile:i,requested_y:y,modal_scroll_max:metrics.max
     });
    }
    matrix.push({profile:profile.name,route:'inspector-'+tab,tiles:positions.length,modal:true,
      scrollHeight:metrics.max+metrics.clientHeight,covered_bottom:true});
   }
   await page.locator('#closeInspectorBtn').click({force:true,timeout:5000});
  }catch(e){failure.push({profile:profile.name,route:'research-inspector-all-tabs',error:String(e)});}
  if(pageErrors.length)failure.push({profile:profile.name,route:'browser',errors:pageErrors.slice(0,25)});
  await context.close();
 }
}finally{await browser.close();}
const report={
 schema:'td613.vixen.full-surface-witness/v1',source_revision:revision,
 mode:'REAL_CHROMIUM_LOCAL_HTTP_NOT_PHYSICAL_DEVICE',captured_at:new Date().toISOString(),
 vertical_tile_stride_fraction:.58,conservative_tile_overlap_fraction:.42,
 profiles,primary_routes:primaryRoutes,matrices:matrix,images:records,
 errors:failure,
 limits:['Tiled coverage includes four viewports and reachable principal routes; it is not all 32 original manuscript permutations.',
 'Human aesthetic and native-device acceptance remain reserved.',
 'Source hashes attest local rendered screenshot bytes; no external origin or empirical credit.'],
 complete:failure.length===0&&matrix.length>=profiles.length*(primaryRoutes.length+1)
};
await writeFile(path.join(root,'COVERAGE.json'),JSON.stringify(report,null,2)+'\n');
const thumbs=records.map(x=>'<article><img loading="lazy" src="'+x.file+'" alt="'+x.profile+' '+x.surface+' '+(x.observed_y??'')+'"><p>'+x.profile+' · '+x.surface+' · '+x.kind+'</p></article>').join('\n');
await writeFile(path.join(root,'INDEX.html'),'<!doctype html><html><meta charset="utf-8"><title>Vixen full-surface visual witness</title><style>body{background:#10151b;color:#f6f4f0;font:13px system-ui;margin:25px}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px}img{width:100%;height:auto}article{border:1px solid #cba3b4;padding:8px}</style><h1>Vixen full-surface witness · '+revision+'</h1><p>Read COVERAGE.json for bounded observational status.</p><main>'+thumbs+'</main></html>');
console.log(JSON.stringify({status:report.complete?'FULL_SURFACE_CAPTURED':'HELD_INCOMPLETE_SURFACE_CAPTURE',source_revision:revision,profiles:profiles.length,routes:matrix.length,images:records.length,errors:failure.slice(0,12)}));
if(!report.complete)process.exitCode=1;
