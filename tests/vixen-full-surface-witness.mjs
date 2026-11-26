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
const root=path.resolve(process.env.VIXEN_WITNESS_OUT_DIR || 'artifacts/vixen-full-surface');
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
function jpegPixelDimensions(bytes){
 if(bytes[0]!==0xff||bytes[1]!==0xd8)throw Error('SCREENSHOT_NOT_JPEG');
 let p=2;
 while(p+9<bytes.length){
  if(bytes[p]!==0xff){p++;continue;}
  const marker=bytes[p+1];p+=2;
  if(marker===0xd9||marker===0xda)break;
  if(marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;
  const length=bytes.readUInt16BE(p);
  if(length<2)throw Error('SCREENSHOT_BAD_JPEG_SEGMENT');
  if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker))
   return {width:bytes.readUInt16BE(p+5),height:bytes.readUInt16BE(p+3)};
  p+=length;
 }
 throw Error('SCREENSHOT_JPEG_DIMENSIONS_MISSING');
}
// A forced click can hit the fixed mobile dock instead of its intended
// control. Center critical actions, require a real Playwright hit-test, then
// separately verify the resulting application state.
async function clickExposed(target,timeout=15000){
 await target.evaluate(el=>el.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'}),null,{timeout});
 await target.click({noWaitAfter:true,timeout});
}
async function capture(target,rel,details,screenshotOptions={}){
 const dest=path.join(root,rel);
 await mkdir(path.dirname(dest),{recursive:true});
 const started=Date.now();
 await target.screenshot({path:dest,type:'jpeg',quality:85,animations:'allow',timeout:30000,...screenshotOptions});
 const bytes=await readFile(dest);
 const record={file:rel,captured_at:new Date().toISOString(),capture_elapsed_ms:Date.now()-started,sha256:createHash('sha256').update(bytes).digest('hex'),byte_length:bytes.length,pixel_dimensions:jpegPixelDimensions(bytes),...details};
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
    /auto|scroll/.test(st.overflowY)&&st.display!=='none'&&
    el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true});
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
    // Actual visible pane pixels, bounded to the current viewport; avoids
    // Playwright element-screenshot's hidden/offscreen auto-scroll loop.
    const left=Math.max(0,Math.floor(rect.left)),top=Math.max(0,Math.floor(rect.top));
    const right=Math.min(innerWidth,Math.ceil(rect.right)),bottom=Math.min(innerHeight,Math.ceil(rect.bottom));
    const clip={x:left,y:top,width:Math.max(0,right-left),height:Math.max(0,bottom-top)};
    return {scrollTop:node.scrollTop,max:node.scrollHeight-node.clientHeight,clip,
      visible:clip.width>=100&&clip.height>=90&&node.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})};
   },{key:pane.key,y:target});
   if(!observed)throw Error('NESTED_PANE_DISAPPEARED '+pane.key);
   await page.waitForTimeout(50);
   if(!observed.visible)throw Error('NESTED_PANE_UNOBSERVABLE '+surface+' '+pane.key+' '+JSON.stringify(observed));
   const frame=await capture(page,path.join(profile.name,slug(surface),'pane-'+pane.key+'-'+String(i).padStart(3,'0')+'.jpg'),{
    profile:profile.name,surface,kind:'nested_scroll_tile',pane_id:pane.key,tile:i,
    observed_scroll:observed.scrollTop,pane_max_scroll:observed.max,
    capture_target:'nested_viewport_clip',clip_css_pixels:observed.clip,
    device_scale_factor:profile.deviceScaleFactor??1
   },{clip:observed.clip});
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
  const consoleErrors=[];
  page.on('pageerror',e=>pageErrors.push(String(e.message||e)));
  page.on('crash',()=>pageErrors.push('BROWSER_PAGE_CRASH'));
  page.on('console',message=>{
   if(message.type()==='error'){
    const loc=message.location();
    consoleErrors.push({text:message.text().slice(0,900),source_url:loc.url||null,line:loc.lineNumber,column:loc.columnNumber});
   }
  });
  page.on('requestfailed',req=>httpFailures.push({path:new URL(req.url()).pathname,error:req.failure()?.errorText??'FAILED'}));
  page.on('response',resp=>{if(resp.status()>=400)httpFailures.push({path:new URL(resp.url()).pathname,status:resp.status()});});
  const response=await page.goto(origin,{waitUntil:'domcontentloaded',timeout:60000});
  if(response?.status()!==200)throw Error('SOURCE_HTTP_FAILED '+profile.name);
  await page.waitForFunction(()=>window.VIXEN_FOX_HOUSE?.mounted===true,null,{timeout:25000});
  // A DOM node marked REVEALED cannot provide a genuine loading witness.
  // Observations may also race the transition. Such frames are classified
  // as transitions rather than relabeling a decoded frontispiece as a veil.
  const veilSnapshot=()=>page.evaluate(()=>{
   const el=document.getElementById('vixEntryVeil');
   if(!el)return {present:false,state:null,visible:false};
   const css=getComputedStyle(el),rect=el.getBoundingClientRect();
   return {present:true,state:el.getAttribute('data-state'),
    visible:!el.hidden&&css.display!=='none'&&css.visibility!=='hidden'&&
     Number(css.opacity)>.01&&rect.width>0&&rect.height>0};
  });
  const veilStart=await veilSnapshot();
  let arrivingFrame=null;
  if(veilStart.present&&veilStart.visible&&veilStart.state==='arriving'){
   arrivingFrame=await capture(page,path.join(profile.name,'arrival','veil-phase-observed.jpg'),{
    profile:profile.name,surface:'arrival-loading',kind:'arrival_loading_state',
    veil_state_start:veilStart.state,is_final_frontispiece:false
   });
   const veilEnd=await veilSnapshot();
   const stableArrival=veilEnd.present&&veilEnd.visible&&veilEnd.state==='arriving';
   arrivingFrame.veil_state_end=veilEnd.state;
   if(!stableArrival){
    arrivingFrame.surface='arrival-transition';
    arrivingFrame.kind='arrival_transition_state';
   }
   matrix.push({profile:profile.name,route:stableArrival?'arrival-loading':'arrival-transition-observed',
    observed_before:veilStart,observed_after:veilEnd,covered_bottom:true,tiles:1});
  }else{
   matrix.push({profile:profile.name,route:'arrival-loading-unobserved',
    reason:'NO_VISIBLE_ARRIVING_VEIL',observed:veilStart,covered_bottom:false,tiles:0});
  }
  await page.waitForFunction(()=>{
   const img=document.querySelector('#view-overview #cover .hero-art img');
   return document.body.dataset.vixenArrival==='ready'&&
    !document.getElementById('vixEntryVeil')&&img?.complete&&img.naturalWidth>0;
  },null,{timeout:15000});
  const hero=await page.evaluate(()=>{
   const img=document.querySelector('#view-overview #cover .hero-art img');
   return {natural_width:img?.naturalWidth||0,natural_height:img?.naturalHeight||0,
    current_src_path:img?new URL(img.currentSrc).pathname:null,
    arrival_state:document.body.dataset.vixenArrival,
    veil_present:!!document.getElementById('vixEntryVeil')};
  });
  if(hero.veil_present||hero.natural_width<=0)throw Error('FRONTISPIECE_NOT_DECODED '+JSON.stringify(hero));
  const decoded=await capture(page,path.join(profile.name,'arrival','decoded-frontispiece.jpg'),{
   profile:profile.name,surface:'decoded-frontispiece',kind:'arrival_ready_frontispiece',
   hero,device_scale_factor:profile.deviceScaleFactor??1
  });
  if(arrivingFrame?.sha256===decoded.sha256)
   failure.push({profile:profile.name,route:'arrival',
    error:'LOADING_PHASE_PIXELS_IDENTICAL_TO_DECODED_FRONTSPIECE'});
  matrix.push({profile:profile.name,route:'decoded-frontispiece',covered_bottom:true,tiles:1});
  for(const route of primaryRoutes){
   try{
    await page.locator('#vixenRoomRail button[data-view="'+route+'"]').click({force:true,timeout:15000});
    await page.waitForFunction(r=>document.body.dataset.view===r,route,{timeout:10000});
    await page.waitForTimeout(150);
    if(route==='reference'){
     const stacking=await page.evaluate(()=>{
      const folio=document.querySelector('#view-reference>.page-pad');
      const mesh=document.getElementById('vixenLivingMesh');
      if(!folio||!mesh)return {error:'MISSING_FOLIOS_OR_MESH'};
      return {folioZ:getComputedStyle(folio).zIndex,
       meshZ:getComputedStyle(mesh).zIndex,
       folioIsolation:getComputedStyle(folio).isolation};
     });
     if(stacking.error||!(Number(stacking.folioZ)>Number(stacking.meshZ)))
      throw Error('FOLIOS_FOREGROUND_BELOW_OPTICAL_FIELD '+JSON.stringify(stacking));
     matrix.push({profile:profile.name,route:'folios-optical-layer-check',
      observed:stacking,covered_bottom:true,tiles:0});
    }
    matrix.push({profile:profile.name,...await scrollCapture(page,profile,route)});
   }catch(e){failure.push({profile:profile.name,route,error:String(e)});}
  }
  try{
   await page.evaluate(()=>{ window.location.hash = '#operator'; });
   await page.waitForFunction(()=>document.body.dataset.view==='operator',null,{timeout:9000});
   matrix.push({profile:profile.name,...await scrollCapture(page,profile,'operator-settings')});
  }catch(e){failure.push({profile:profile.name,route:'operator-settings',error:String(e)});}
  // Render the actual Observatory inspector, not a fictional proof route.
  try{
   await page.locator('#vixenRoomRail button[data-view="observatory"]').click({force:true,timeout:8000});
   const proofSelector='#vixenElectricFoundry .ef-inspector-switch';
   const proof=()=>page.locator(proofSelector).first();
   await proof().waitFor({state:'visible',timeout:10000});
   // The instrument may retain an open proof state across room navigation.
   // Establish a known closed baseline, then exercise both real transitions.
   const prior=await proof().getAttribute('aria-expanded');
   if(prior==='true'){
    await clickExposed(proof(),12000);
    await page.waitForFunction(()=>document.querySelector('#vixenElectricFoundry .ef-inspector-switch')?.getAttribute('aria-expanded')==='false',null,{timeout:8000});
   }
   await clickExposed(proof(),12000);
   await page.waitForFunction(()=>document.querySelector('#vixenElectricFoundry .ef-inspector-switch')?.getAttribute('aria-expanded')==='true',null,{timeout:8000});
   const expanded=await proof().getAttribute('aria-expanded');
   const proofVisible=await page.locator('#vixenElectricFoundry [data-inspector-open="true"]').count();
   if(expanded!=='true'||!proofVisible)throw Error('OBSERVATORY_PROOF_NOT_EXPANDED '+JSON.stringify({expanded,prior,proofVisible}));
   await capture(page,path.join(profile.name,'observatory-proof','proof-open.jpg'),{
    profile:profile.name,surface:'observatory-proof',kind:'source_proof_open',
    aria_expanded:expanded
   });
   matrix.push({profile:profile.name,route:'observatory-proof-open',covered_bottom:true,tiles:1});
   await clickExposed(proof(),12000);
   await page.waitForFunction(()=>document.querySelector('#vixenElectricFoundry .ef-inspector-switch')?.getAttribute('aria-expanded')==='false',null,{timeout:8000});
   if(await proof().getAttribute('aria-expanded')!=='false')
    throw Error('OBSERVATORY_PROOF_CLOSE_FAILED');
  }catch(e){failure.push({profile:profile.name,route:'observatory-proof',error:String(e)});}
  // Search is an actual dialog, not a fictional dedicated Advanced Search room.
  try{
   await page.locator('[data-action="search"]').first().click({force:true,timeout:6000});
   await page.locator('#searchDialog').waitFor({state:'visible',timeout:10000});
   await capture(page,path.join(profile.name,'search-dialog','initial.jpg'),{
    profile:profile.name,surface:'search',kind:'dialog_open',device_scale_factor:profile.deviceScaleFactor??1
   });
   await page.locator('#globalSearchInput').fill('provenance');
   await page.waitForTimeout(350);
   for(const mode of ['hybrid','lexical','phrase','exact','src_projective']){
    await page.locator('[data-search-mode="'+mode+'"]').click({force:true,noWaitAfter:true,timeout:6000});
    await page.waitForFunction(m=>document.querySelector('[data-search-mode="'+m+'"]')?.getAttribute('aria-checked')==='true',mode,{timeout:8000});
    await page.waitForTimeout(180);
    await capture(page,path.join(profile.name,'search-dialog',mode+'-results.jpg'),{
     profile:profile.name,surface:'search-'+mode,kind:'ranked_result_view',
     result_excerpt:(await page.locator('#globalSearchResults').innerText()).slice(0,300),
     device_scale_factor:profile.deviceScaleFactor??1
    });
    matrix.push({profile:profile.name,route:'search-'+mode,covered_bottom:true,tiles:1,modal:true});
   }
   // Negative query preserves an actually observed result/empty state; never
   // fabricate an error or claim the search layer returned zero without data.
   await page.locator('#globalSearchInput').fill('TD613__UNLIKELY_NEGATIVE_QUERY__Q8X19');
   await page.waitForTimeout(200);
   const negativeText=(await page.locator('#globalSearchResults').innerText()).slice(0,400);
   await capture(page,path.join(profile.name,'search-dialog','negative-query.jpg'),{
    profile:profile.name,surface:'search-negative-query',kind:'negative_query_observed',
    query:'TD613__UNLIKELY_NEGATIVE_QUERY__Q8X19',result_excerpt:negativeText
   });
   matrix.push({profile:profile.name,route:'search-negative-query',covered_bottom:true,tiles:1,modal:true});
   await page.locator('#globalSearchInput').fill('provenance');
   await page.waitForTimeout(180);
   if(!await page.locator('#vixenFusionConsole').evaluate(el=>el.open))
    await clickExposed(page.locator('#vixenFusionConsole > summary'),15000);
   await page.waitForFunction(()=>document.getElementById('vixenFusionConsole')?.open===true,null,{timeout:8000});
   await page.waitForTimeout(120);
   await capture(page,path.join(profile.name,'search-dialog','fusion-laboratory.jpg'),{
    profile:profile.name,surface:'fusion-laboratory',kind:'fusion_laboratory',device_scale_factor:profile.deviceScaleFactor??1
   });
   matrix.push({profile:profile.name,route:'fusion-laboratory',covered_bottom:true,tiles:1,modal:true});
   await clickExposed(page.locator('#closeSearchBtn'),15000);
   if(await page.locator('#searchDialog').isVisible())throw Error('SEARCH_OVERLAY_FAILED_TO_CLOSE');
  }catch(e){
   failure.push({profile:profile.name,route:'search-and-fusion',error:String(e)});
   await page.keyboard.press('Escape').catch(()=>{});
  }
  // Capture the explicitly entered separate reading room. Do not infer a
  // relationship between its reference records and Vixen's Works.
  try{
   await page.locator('#vixenRoomRail button[data-view="reference"]').click({force:true});
   await page.waitForFunction(()=>document.body.dataset.view==='reference',null,{timeout:10000});
   const invitation=page.locator('#vixenReferenceChamber button.vxe-text-control')
    .filter({hasText:/Open independent reference reading room/i});
   await invitation.first().waitFor({state:'attached',timeout:12000}).catch(async()=>{
    const status=await page.evaluate(()=>({
     route:document.body.dataset.view,stage:document.body.dataset.activeResearchStage||null,
     chamberPresent:!!document.getElementById('vixenReferenceChamber'),
     buttons:[...document.querySelectorAll('#vixenReferenceChamber button')].slice(-12)
      .map(b=>({text:b.textContent,visible:b.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})}))
    }));
    throw Error('INDEPENDENT_READING_ROOM_INVITATION_NOT_MOUNTED '+JSON.stringify(status));
   });
   await clickExposed(invitation.first(),12000);
   await page.waitForFunction(()=>document.body.dataset.activeResearchStage==='OPERAHOUSE',null,{timeout:10000});
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
   const humanPodiumUrl=new URL('./vix-cyb/human-podium.html',origin).href;
   const hpResp=await page.goto(humanPodiumUrl,{waitUntil:'domcontentloaded',timeout:30000});
   if(hpResp?.status()!==200)throw Error('HUMAN_PODIUM_HTTP_FAILED '+hpResp?.status());
   await page.waitForFunction(()=>window.VixenAIModes?.mounted===true,null,{timeout:25000});
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
   // Role selection alone must never count as Program Notes consent.
   // Start a synthetic COMPOSER session and stop at AWAITING permission.
   await page.locator('#vmaGoal').fill('Compare original source routes without writing notes.');
   await clickExposed(page.locator('#vmaStart'),15000);
   // Starting a source-backed Podium route can await read-only host calls.
   // A hidden notes control before session activation is neither a consent
   // failure nor grounds for inventing an active session. Await the real UI.
   try{
    await page.waitForFunction(()=>{const panel=document.getElementById('vmaPlayPanel');return !!panel&&!panel.hidden;},null,{timeout:30000});
   }catch(e){
    const observed=await page.evaluate(()=>({
     status:document.getElementById('vmaStatus')?.textContent?.slice(0,300),
     start_hidden:document.getElementById('vmaStartPanel')?.hidden,
     play_hidden:document.getElementById('vmaPlayPanel')?.hidden,
     button_disabled:document.getElementById('vmaStart')?.disabled
    }));
    throw Error('PODIUM_SESSION_NEVER_ACTIVATED '+JSON.stringify(observed)+' '+String(e));
   }
   await page.locator('#vmaNotesRequest').waitFor({state:'visible',timeout:10000});
   const notesOff=(await page.locator('#vmaNotesState').innerText()).trim();
   if(!/^(?:Notes )?OFF\b/i.test(notesOff))throw Error('PROGRAM_NOTES_DEFAULT_NOT_OFF '+notesOff);
   await capture(page,path.join(profile.name,'podium-roles','program-notes-off.jpg'),{
    profile:profile.name,surface:'program-notes-off',kind:'consent_off',
    program_notes_permission:'NOT_REQUESTED',grant_performed:false
   });
   matrix.push({profile:profile.name,route:'program-notes-off',covered_bottom:true,tiles:1});
   await clickExposed(page.locator('#vmaNotesRequest'),12000);
   await page.locator('#vmaNotesApprove').waitFor({state:'visible',timeout:8000});
   await capture(page,path.join(profile.name,'podium-roles','program-notes-awaiting-human.jpg'),{
    profile:profile.name,surface:'program-notes-pending',kind:'consent_pending',
    program_notes_permission:'AWAITING_HUMAN_PERMISSION',grant_performed:false
   });
   matrix.push({profile:profile.name,route:'program-notes-pending',covered_bottom:true,tiles:1});
   await page.goto(origin,{waitUntil:'domcontentloaded',timeout:30000});
   await page.waitForFunction(()=>window.VIXEN_FOX_HOUSE?.mounted===true,null,{timeout:20000});
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

  // Explicitly distinguish responsive reduced-motion evidence from two live
  // motion frames. Two frames do not establish frame rate or synchronization.
  try{
   await page.locator('#vixenRoomRail button[data-view="collection"]').click({force:true,timeout:8000});
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.waitForTimeout(150);
   if(!await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches))
    throw Error('REDUCED_MOTION_MEDIA_NOT_ACTIVE');
   await capture(page,path.join(profile.name,'motion','collection-reduced-motion.jpg'),{
    profile:profile.name,surface:'collection-reduced-motion',kind:'reduced_motion_frame',prefers_reduced_motion:true
   });
   matrix.push({profile:profile.name,route:'collection-reduced-motion',covered_bottom:true,tiles:1});
   await page.emulateMedia({reducedMotion:'no-preference'});
   for(const frame of [0,1]){
    if(frame)await page.waitForTimeout(150);
    const mesh=await page.evaluate(()=>window.VixenLivingMesh?.status?.()??null);
    await capture(page,path.join(profile.name,'motion','collection-live-frame-'+frame+'.jpg'),{
     profile:profile.name,surface:'collection-live-motion',kind:'motion_frame',
     frame,mesh_status:mesh,prefers_reduced_motion:false
    });
   }
   matrix.push({profile:profile.name,route:'collection-live-motion',covered_bottom:true,tiles:2,
     limits:'captured frames document visible motion states; not an FPS benchmark'});
  }catch(e){
   failure.push({profile:profile.name,route:'motion-comparison',error:String(e)});
   await page.emulateMedia({reducedMotion:'no-preference'}).catch(()=>{});
  }
  // Overlapping instant tiles are structural coverage, not proof of live
  // mesh/corset behavior while scrolling. This separate interleaved series
  // captures browser frames during smooth scrolling and contemporaneous mesh.
  try{
   await page.locator('#vixenRoomRail button[data-view="collection"]').click({force:true,timeout:8000});
   await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
   const maxScroll=await page.evaluate(()=>Math.max(0,Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)-innerHeight));
   if(maxScroll<350)throw Error('SALON_PAGE_TOO_SHORT_FOR_SCROLL_MOTION_WITNESS '+maxScroll);
   let previous=0;
   for(const i of [1,2,3]){
    const target=Math.floor(maxScroll*i/4);
    await page.evaluate(y=>window.scrollTo({top:y,behavior:'smooth'}),target);
    await page.waitForTimeout(170);
    const observed=await page.evaluate(()=>({y:Math.round(window.scrollY),mesh:window.VixenLivingMesh?.status?.()??null}));
    if(observed.y<=previous+5)throw Error('SALON_INTERLEAVED_SCROLL_NOT_MOVING '+JSON.stringify({previous,observed,target}));
    previous=observed.y;
    await capture(page,path.join(profile.name,'motion','collection-scrolling-'+i+'.jpg'),{
     profile:profile.name,surface:'collection-scrolling-motion',kind:'interleaved_salon_scroll',
     requested_y:target,observed_y:observed.y,mesh_status:observed.mesh,
     motion_mode:'smooth',prefers_reduced_motion:false
    });
   }
   matrix.push({profile:profile.name,route:'collection-scrolling-motion',covered_bottom:false,tiles:3,
     limits:'frames document scroll positions and visible states, not FPS or physical-device performance'});
  }catch(e){failure.push({profile:profile.name,route:'collection-scrolling-motion',error:String(e)});}
  if(pageErrors.length)failure.push({profile:profile.name,route:'browser',count:pageErrors.length,errors:pageErrors.slice(0,25)});
  if(httpFailures.length)failure.push({profile:profile.name,route:'http',count:httpFailures.length,errors:httpFailures.slice(0,25)});
  if(consoleErrors.length)failure.push({profile:profile.name,route:'console',count:consoleErrors.length,errors:consoleErrors.slice(0,25)});
  await context.close();
 }
}finally{await browser.close();}
const requiredSurfaceRoutes=[
 ...primaryRoutes,'operator-settings','folios-optical-layer-check',
 'decoded-frontispiece','observatory-proof-open',
 'search-hybrid','search-lexical','search-phrase','search-exact','search-src_projective',
 'search-negative-query','fusion-laboratory','independent-reading-room','works-original-reader',
 'podium-maestro','podium-composer','program-notes-off','program-notes-pending',
 'inspector-census','inspector-bench','inspector-provenance','inspector-podium',
 'collection-reduced-motion','collection-live-motion','collection-scrolling-motion'
];
const missingSurfaceRoutes=profiles.flatMap(profile=>requiredSurfaceRoutes
 .filter(route=>!matrix.some(item=>item.profile===profile.name&&item.route===route))
 .map(route=>({profile:profile.name,route,error:'REQUIRED_ROUTE_UNOBSERVED'})));
failure.push(...missingSurfaceRoutes);
const report={
 schema:'td613.vixen.full-surface-witness/v4',source_revision:revision,
 mode:isHostedPreview?'CHROMIUM_HTTPS_PREVIEW_NEEDS_SERVED_SOURCE_AUDIT':'REAL_CHROMIUM_LOCAL_HTTP_NOT_PHYSICAL_DEVICE',
 witness_url_origin:isHostedPreview?new URL(origin).origin:'LOCAL_HTTP',captured_at:new Date().toISOString(),elapsed_ms:Date.now()-startedAt,
 vertical_tile_stride_fraction:.58,conservative_tile_overlap_fraction:.42,
 profiles,primary_routes:primaryRoutes,required_surface_routes:requiredSurfaceRoutes,missing_surface_routes:missingSurfaceRoutes,matrices:matrix,images:records,
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
