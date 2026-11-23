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

const origin=process.env.VIXEN_WITNESS_ORIGIN || 'http://127.0.0.1:6130/encyclopedia/vix-cyb.html';
const root=path.resolve('artifacts/vixen-full-surface');
const isHostedPreview=origin.startsWith('https://');
const startedAt=Date.now();
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const profiles=[
 {name:'desktop-1440x900',width:1440,height:900},
 {name:'desktop-1920x1080',width:1920,height:1080},
 {name:'iphone-390x844',width:390,height:844,deviceScaleFactor:3,isMobile:true},
 {name:'iphone-428x926',width:428,height:926,deviceScaleFactor:3,isMobile:true}
];
const primaryRoutes=['overview','works','observatory','collection','reference','protocols','gates','holds'];
const records=[],failure=[];
await mkdir(root,{recursive:true});
function slug(x){return String(x).toLowerCase().replace(/[^a-z0-9_-]+/g,'-').slice(0,100);}
async function capture(target,rel,details){
 const dest=path.join(root,rel);
 await mkdir(path.dirname(dest),{recursive:true});
 const started=Date.now();
 await target.screenshot({path:dest,type:'jpeg',quality:85,animations:'allow',timeout:30000});
 const bytes=await readFile(dest);
 const record={file:rel,captured_at:new Date().toISOString(),capture_elapsed_ms:Date.now()-started,sha256:createHash('sha256').update(bytes).digest('hex'),byte_length:bytes.length,...details};
 records.push(record);
 return record;
}
async function scrollCapture(page,profile,surface){
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
  let priorHash=null,priorScroll=null;
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
   if(!observed.visible)throw Error('NESTED_PANE_UNOBSERVABLE '+surface+' '+pane.key);
   const element=page.locator('[data-vixen-witness-pane="'+pane.key+'"]');
   const frame=await capture(element,path.join(profile.name,slug(surface),'pane-'+pane.key+'-'+String(i).padStart(3,'0')+'.jpg'),{
    profile:profile.name,surface,kind:'nested_scroll_tile',pane_id:pane.key,tile:i,
    observed_scroll:observed.scrollTop,pane_max_scroll:observed.max,
    capture_target:'nested_element',device_scale_factor:profile.deviceScaleFactor??1
   });
   if(priorHash===frame.sha256&&Math.abs(observed.scrollTop-priorScroll)>50){
    throw Error('NESTED_PANE_STALE_PIXELS '+surface+' '+pane.key+' '+observed.scrollTop);
   }
   priorHash=frame.sha256;priorScroll=observed.scrollTop;
  }
  const bottom=await page.evaluate(key=>{const n=document.querySelector('[data-vixen-witness-pane="'+key+'"]');return n?{y:n.scrollTop,max:n.scrollHeight-n.clientHeight}:null;},pane.key);
  if(!bottom||bottom.max-bottom.y>2)throw Error('NESTED_SCROLL_BOTTOM_NOT_COVERED '+surface+' '+pane.key);
 }
 await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
 return {route:surface,scrollHeight:dom.scrollHeight,tiles:positions.length+correctionTiles,nestedPanes:panes.length,covered_bottom:true};
}
const browser=await chromium.launch({headless:true,executablePath:process.env.VIXEN_CHROMIUM_PATH||undefined});
const matrix=[];
try{
 for(const profile of profiles){
  const context=await browser.newContext({
   viewport:{width:profile.width,height:profile.height},deviceScaleFactor:profile.deviceScaleFactor??1,
   isMobile:!!profile.isMobile,hasTouch:!!profile.isMobile,
   reducedMotion:'no-preference'
  });
  const page=await context.newPage();
  const pageErrors=[];
  const httpFailures=[];
  page.on('pageerror',e=>pageErrors.push(String(e.message||e)));
  page.on('requestfailed',req=>httpFailures.push({path:new URL(req.url()).pathname,error:req.failure()?.errorText??'FAILED'}));
  page.on('response',resp=>{if(resp.status()>=400)httpFailures.push({path:new URL(resp.url()).pathname,status:resp.status()});});
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
  // Search is an actual dialog, not a fictional dedicated Advanced Search room.
  try{
   await page.locator('[data-action="search"]').first().click({force:true,timeout:6000});
   await page.locator('#searchDialog').waitFor({state:'visible',timeout:10000});
   await capture(page,path.join(profile.name,'search-dialog','initial.jpg'),{
    profile:profile.name,surface:'search',kind:'dialog_open',device_scale_factor:profile.deviceScaleFactor??1
   });
   await page.locator('#globalSearchInput').fill('provenance');
   await page.waitForTimeout(350);
   for(const mode of ['hybrid','lexical','phrase','exact']){
    await page.locator('[data-search-mode="'+mode+'"]').click({force:true,timeout:6000});
    await page.waitForTimeout(180);
    await capture(page,path.join(profile.name,'search-dialog',mode+'-results.jpg'),{
     profile:profile.name,surface:'search-'+mode,kind:'ranked_result_view',
     result_excerpt:(await page.locator('#globalSearchResults').innerText()).slice(0,300),
     device_scale_factor:profile.deviceScaleFactor??1
    });
    matrix.push({profile:profile.name,route:'search-'+mode,covered_bottom:true,tiles:1,modal:true});
   }
   await page.locator('#vixenFusionConsole summary').click({force:true,timeout:5000});
   await page.waitForTimeout(120);
   await capture(page,path.join(profile.name,'search-dialog','fusion-laboratory.jpg'),{
    profile:profile.name,surface:'fusion-laboratory',kind:'fusion_laboratory',device_scale_factor:profile.deviceScaleFactor??1
   });
   matrix.push({profile:profile.name,route:'fusion-laboratory',covered_bottom:true,tiles:1,modal:true});
   await page.locator('#closeSearchBtn').click({force:true,timeout:5000});
   if(await page.locator('#searchDialog').isVisible())throw Error('SEARCH_OVERLAY_FAILED_TO_CLOSE');
  }catch(e){
   failure.push({profile:profile.name,route:'search-and-fusion',error:String(e)});
   await page.keyboard.press('Escape').catch(()=>{});
  }
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
  // Record the human-facing role choices without granting Program Notes consent.
  try{
   await page.locator('#vixenRoomRail button[data-view="collection"]').click({force:true,timeout:8000});
   for(const role of ['MAESTRO','COMPOSER']){
    const selector='[data-vma-role="'+role+'"]';
    await page.locator(selector).click({force:true,timeout:5000});
    await page.waitForTimeout(130);
    await capture(page,path.join(profile.name,'podium-roles',role.toLowerCase()+'.jpg'),{
     profile:profile.name,surface:'podium-'+role.toLowerCase(),
     kind:'role_selection',selected_role:role,program_notes_permission:'NOT_REQUESTED'
    });
    matrix.push({profile:profile.name,route:'podium-'+role.toLowerCase(),covered_bottom:true,tiles:1});
   }
  }catch(e){failure.push({profile:profile.name,route:'podium-role-choices',error:String(e)});}
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
  if(httpFailures.length)failure.push({profile:profile.name,route:'http',errors:httpFailures.slice(0,25)});
  await context.close();
 }
}finally{await browser.close();}
const report={
 schema:'td613.vixen.full-surface-witness/v2',source_revision:revision,
 mode:isHostedPreview?'CHROMIUM_HTTPS_PREVIEW_NEEDS_SERVED_SOURCE_AUDIT':'REAL_CHROMIUM_LOCAL_HTTP_NOT_PHYSICAL_DEVICE',
 witness_url_origin:isHostedPreview?new URL(origin).origin:'LOCAL_HTTP',captured_at:new Date().toISOString(),elapsed_ms:Date.now()-startedAt,
 vertical_tile_stride_fraction:.58,conservative_tile_overlap_fraction:.42,
 profiles,primary_routes:primaryRoutes,matrices:matrix,images:records,
 errors:failure,
 limits:['Tiled coverage includes four viewports and reachable principal routes; it is not all 32 original manuscript permutations.',
 'Human aesthetic and native-device acceptance remain reserved.',
 'Source hashes attest rendered screenshot bytes; cryptographic integrity alone cannot establish source origin or empirical credit.',
 'Live alias attestation requires a separately verified served-revision record and may not be inferred from local HTTP.'],
 complete:failure.length===0&&matrix.length>=profiles.length*(primaryRoutes.length+8)
};
await writeFile(path.join(root,'COVERAGE.json'),JSON.stringify(report,null,2)+'\n');
const thumbs=records.map(x=>'<article><img loading="lazy" src="'+x.file+'" alt="'+x.profile+' '+x.surface+' '+(x.observed_y??'')+'"><p>'+x.profile+' · '+x.surface+' · '+x.kind+'</p></article>').join('\n');
await writeFile(path.join(root,'INDEX.html'),'<!doctype html><html><meta charset="utf-8"><title>Vixen full-surface visual witness</title><style>body{background:#10151b;color:#f6f4f0;font:13px system-ui;margin:25px}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:20px}img{width:100%;height:auto}article{border:1px solid #cba3b4;padding:8px}</style><h1>Vixen full-surface witness · '+revision+'</h1><p>Read COVERAGE.json for bounded observational status.</p><main>'+thumbs+'</main></html>');
console.log(JSON.stringify({status:report.complete?'FULL_SURFACE_CAPTURED':'HELD_INCOMPLETE_SURFACE_CAPTURE',source_revision:revision,profiles:profiles.length,routes:matrix.length,images:records.length,errors:failure.slice(0,12)}));
if(!report.complete)process.exitCode=1;
