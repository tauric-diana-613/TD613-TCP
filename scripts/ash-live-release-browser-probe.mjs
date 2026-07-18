import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';
import { ASH_CACHE_FLUSH_EPOCH } from '../app/dome-world/ash-cache-flush.js';

const base=String(process.env.TD613_BASE_URL||'http://127.0.0.1:6130').replace(/\/$/,'');
const out=path.resolve(process.env.TD613_ARTIFACT_DIR||'artifacts/ash-live-release');
const engineName=process.env.TD613_BROWSER||'chromium';
const engine={chromium,firefox,webkit}[engineName];
const executable=process.env.TD613_BROWSER_EXECUTABLE;
const launchOptions={headless:true,...(executable&&fs.existsSync(executable)?{executablePath:executable}:{})};
const expected={rooms:14,nodes:72,relationships:112,routes:6};
const sessionEpoch='20260718-canonical-membrane-v6';
const plans={
  political_campaign:{title:'Harbor City Mayoral Campaign',docket:'apeqPaiaMethodDocket'},
  fundraiser:{title:'Northstar Arts Benefit',docket:'apeqPaiaMethodDocket'},
  investigation:{title:'Glass Meridian Vendor Integrity Inquiry',docket:'apeqPaiaMethodDocket'},
  research:{title:'Lumen Atlas Study',docket:'researchMethodDocket'}
};
const assert=(value,message)=>{if(!value)throw new Error(message);};

function cleanUrl(){return new URL('/dome-world/ash-keep.html',base).toString();}
function epochUrl(){
  const url=new URL('/dome-world/ash-keep.html',base);
  url.searchParams.set('ash_flush',ASH_CACHE_FLUSH_EPOCH);
  url.searchParams.set('asset_epoch',sessionEpoch);
  return url.toString();
}

async function current(page){
  return page.evaluate(()=>new Promise((resolve,reject)=>{
    const id=localStorage.getItem('td613.ash-keep.current-case');
    const request=indexedDB.open('td613-ash-keep');
    request.onsuccess=()=>{
      const db=request.result;
      const tx=db.transaction(['cases','routeMemory']);
      const c=tx.objectStore('cases').get(id),r=tx.objectStore('routeMemory').get(id);
      tx.oncomplete=()=>{db.close();resolve({caseMap:c.result||null,routeMemory:r.result?.value||null});};
      tx.onerror=()=>{db.close();reject(tx.error);};
    };
    request.onerror=()=>reject(request.error);
  }));
}

async function waitForRuntime(page){
  await page.waitForFunction(epoch=>Boolean(window.__td613AshKeep?.version)
    && window.__td613AshIngressLayout?.version==='td613.ash.ingress-layout/v1.0-canonical-native-scroll'
    && window.__td613AshProfileDemos?.version==='td613.ash.apeq-paia-profile-demos/v0.1'
    && window.__td613AshResearchDemo?.version==='td613.ash.research-demo/v0.2-lumen-atlas'
    && window.__td613AshResearchControlState?.version==='td613.ash.research-control-state/v0.3-blank-case'
    && window.__td613AshCacheTransition?.epoch===epoch
    && document.documentElement.dataset.ashMembraneReady==='true',
  ASH_CACHE_FLUSH_EPOCH,{timeout:60000});
}

function observe(page, surface, report){
  page.on('console',m=>{if(m.type()==='error')report.console_errors.push({surface,text:m.text()});});
  page.on('pageerror',e=>report.console_errors.push({surface,text:e.message}));
  page.on('request',r=>{
    const url=r.url();
    if(/\/fixtures\/(?:ash-keep-demo|ash-investigation-)/.test(url))report.legacy_fixture_requests.push(url);
    const parsed=new URL(url);
    if(parsed.origin!==new URL(base).origin)report.external_requests.push(url);
  });
  page.on('response',r=>{if(r.status()>=400&&!/favicon\.ico/.test(r.url()))report.http_errors.push({surface,status:r.status(),url:r.url()});});
}

await fsp.mkdir(out,{recursive:true});
const report={schema:'td613.ash.live-release-browser-flight/v0.3-canonical-no-reload',browser:engineName,status:'RUNNING',cache_epoch:ASH_CACHE_FLUSH_EPOCH,ingress:null,session_logout:null,profiles:{},legacy_fixture_requests:[],external_requests:[],console_errors:[],http_errors:[],seams:[]};
let browser=null,terminalError=null;
try{
  if(!engine)throw new Error(`Unsupported browser engine: ${engineName}`);
  browser=await engine.launch(launchOptions);

  {
    const context=await browser.newContext({viewport:{width:1280,height:360},reducedMotion:'reduce'});
    await context.addInitScript(({pointerKey,sessionKey})=>{
      localStorage.setItem('td613.ash.cache-flush.epoch','td613.ash.cache-flush/2026-07-18-emergency-stability-v5');
      localStorage.setItem(pointerKey,'case_stale_demo');
      localStorage.setItem(sessionKey,'20260718-emergency-stability-v5');
      sessionStorage.setItem('td613:ash-threshold:readiness:v0.1','{"stale":true}');
    },{pointerKey:'td613.ash-keep.current-case',sessionKey:'td613.ash.session.epoch'});
    const page=await context.newPage();page.setDefaultTimeout(60000);observe(page,'ingress',report);
    const membraneStates=[];
    await page.addInitScript(()=>{
      window.__ashMembraneStates=[];
      const start=()=>{
        const root=document.documentElement;
        if(!root){document.addEventListener('readystatechange',start,{once:true});return;}
        const record=()=>window.__ashMembraneStates.push({
          ready:root.dataset.ashMembraneReady||null,
          session:root.dataset.ashSessionOpen||null,
          launch:document.getElementById('launch')?.className||null
        });
        record();
        new MutationObserver(record).observe(root,{attributes:true,subtree:true,childList:true});
      };
      start();
    });
    await page.goto(cleanUrl(),{waitUntil:'domcontentloaded'});
    await waitForRuntime(page);
    await page.waitForTimeout(250);
    membraneStates.push(...await page.evaluate(()=>window.__ashMembraneStates||[]));
    const measurement=await page.evaluate(()=>window.__td613AshIngressLayout.measure());
    const storage=await page.evaluate(()=>({
      pointer:localStorage.getItem('td613.ash-keep.current-case'),
      session:localStorage.getItem('td613.ash.session.epoch'),
      old_readiness:sessionStorage.getItem('td613:ash-threshold:readiness:v0.1'),
      url:location.href,
      launch_visible:getComputedStyle(document.getElementById('launch')).display!=='none',
      final_ready:document.documentElement.dataset.ashMembraneReady,
      composition:document.documentElement.dataset.ashMembraneComposition,
      cache_navigation_replaced:window.__td613AshCacheTransition?.navigation_replaced
    }));
    assert(storage.pointer===null,'Stale demo pointer survived cache/session migration.');
    assert(storage.session===null,'Stale Ash session epoch survived cache/session migration.');
    assert(storage.old_readiness===null,'Stale Ash sessionStorage survived cache/session migration.');
    assert(storage.launch_visible,'Canonical membrane is not visible after final composition.');
    assert(storage.final_ready==='true','Canonical membrane never reached final-ready posture.');
    assert(storage.cache_navigation_replaced===false,'Cache migration replaced the active document.');
    assert(!/[?&](?:ash_flush|asset_epoch|cache_nonce|arrival)=/.test(storage.url),'Transition query markers survived canonical cleanup.');
    assert(measurement.horizontal_overflow===0,'Compressed ingress has horizontal overflow.');
    assert(measurement.panel_nested_scroll===false,'Ingress retained nested panel scrolling.');
    assert(measurement.membrane_scroll_owner===true,'Ingress membrane does not own its one scroll lane.');
    assert(measurement.membrane.scrollable===true,'Compressed ingress did not expose native membrane scrolling.');
    await page.locator('#launch').evaluate(node=>node.scrollTo({top:node.scrollHeight,behavior:'auto'}));
    assert(await page.locator('#startDemo').isVisible(),'Demo action is unreachable after native membrane scroll.');
    assert(await page.locator('#newCase').isVisible(),'New case action is unreachable after native membrane scroll.');
    const visibleHistoricalStates=[...new Map(membraneStates
      .filter(state=>state.ready==='true'&&state.launch&&state.launch!=='launch hidden')
      .map(state=>[JSON.stringify(state),state])).values()];
    assert(visibleHistoricalStates.length===1,`Membrane exposed multiple visible compositions: ${JSON.stringify(visibleHistoricalStates)}`);
    await page.screenshot({path:path.join(out,`${engineName}-canonical-ingress.png`),fullPage:true});
    report.ingress={...measurement,storage,visible_membrane_compositions:visibleHistoricalStates};
    await context.close();
  }

  {
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:engineName==='webkit',hasTouch:engineName==='webkit',reducedMotion:'reduce'});
    const page=await context.newPage();page.setDefaultTimeout(60000);observe(page,'session-logout',report);
    await page.goto(epochUrl(),{waitUntil:'domcontentloaded'});
    await waitForRuntime(page);
    await page.locator('#newProfile').selectOption('investigation');
    await page.waitForFunction(()=>{const button=document.getElementById('startDemo');return button&&!button.disabled;});
    await page.locator('#startDemo').click();
    await page.waitForFunction(()=>Boolean(localStorage.getItem('td613.ash-keep.current-case'))&&localStorage.getItem('td613.ash.session.epoch')==='20260718-canonical-membrane-v6');
    const demo=await current(page);
    assert(demo.caseMap?.case_id,'Demo case did not open.');
    const scrollBefore=await page.evaluate(()=>({height:document.documentElement.scrollHeight,viewport:innerHeight,y:scrollY,touch:getComputedStyle(document.querySelector('.map-stage canvas')).touchAction}));
    await page.evaluate(()=>window.scrollTo({top:Math.min(500,document.documentElement.scrollHeight-innerHeight),behavior:'auto'}));
    await page.waitForTimeout(100);
    const scrollAfter=await page.evaluate(()=>scrollY);
    assert(scrollBefore.height>scrollBefore.viewport,'Main case page is not long enough to test native scroll.');
    assert(scrollAfter>0,'Main case page resisted native document scroll.');
    assert(/pan-y/.test(scrollBefore.touch),'Case Map canvas still blocks vertical page scroll.');

    await page.locator('#closeCase').click();
    await page.waitForFunction(()=>!localStorage.getItem('td613.ash-keep.current-case')
      && !localStorage.getItem('td613.ash.session.epoch')
      && document.documentElement.dataset.ashSessionOpen==='false'
      && document.documentElement.dataset.ashMembraneReady==='true'
      && getComputedStyle(document.getElementById('launch')).display!=='none');
    const closed=await page.evaluate(()=>({
      pointer:localStorage.getItem('td613.ash-keep.current-case'),
      session:localStorage.getItem('td613.ash.session.epoch'),
      selected:document.getElementById('selectCase')?.value||'',
      url:location.href,
      launch_visible:getComputedStyle(document.getElementById('launch')).display!=='none'
    }));
    assert(closed.selected==='','Close Case retained an armed case selection.');
    assert(!/[?&](?:ash_flush|asset_epoch|cache_nonce|arrival|case|demo)=/.test(closed.url),'Close Case retained session query markers.');

    await page.reload({waitUntil:'domcontentloaded'});
    await waitForRuntime(page);
    const afterReload=await page.evaluate(()=>({
      pointer:localStorage.getItem('td613.ash-keep.current-case'),
      session:localStorage.getItem('td613.ash.session.epoch'),
      visible:getComputedStyle(document.getElementById('launch')).display!=='none'
    }));
    assert(afterReload.pointer===null&&afterReload.session===null&&afterReload.visible,'Closed demo case reopened after reload.');
    await page.waitForFunction(id=>[...document.querySelectorAll('#selectCase option')].some(option=>option.value===id),demo.caseMap.case_id);
    await page.locator('#selectCase').selectOption(demo.caseMap.case_id);
    await page.locator('#openSelectedCase').click();
    await page.waitForFunction(id=>localStorage.getItem('td613.ash-keep.current-case')===id
      && localStorage.getItem('td613.ash.session.epoch')==='20260718-canonical-membrane-v6'
      && getComputedStyle(document.getElementById('launch')).display==='none',demo.caseMap.case_id);
    const reopened=await current(page);
    assert(reopened.caseMap?.case_id===demo.caseMap.case_id,'Deliberate reopen did not restore the saved case.');
    report.session_logout={case_id:demo.caseMap.case_id,closed,after_reload:afterReload,reopened:true,main_scroll_y:scrollAfter,canvas_touch_action:scrollBefore.touch};
    await page.screenshot({path:path.join(out,`${engineName}-session-reopened.png`),fullPage:true});
    await context.close();
  }

  for(const [profile,plan] of Object.entries(plans)){
    const context=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
    const page=await context.newPage();page.setDefaultTimeout(60000);observe(page,profile,report);
    await page.goto(epochUrl(),{waitUntil:'domcontentloaded'});
    await waitForRuntime(page);
    await page.locator('#newProfile').selectOption(profile);
    if(profile==='research'){
      await page.waitForFunction(()=>{const button=document.getElementById('startDemo');return button&&!button.disabled&&button.dataset.ashResearchControlState==='READY'&&document.getElementById('newCase')?.disabled===false;});
    }else{
      await page.waitForFunction(value=>{const button=document.getElementById('startDemo');return document.getElementById('newProfile')?.value===value&&button&&!button.disabled&&button.dataset.ashMethodDemoState==='READY';},profile);
    }
    await page.locator('#startDemo').click();
    await page.waitForFunction(({profile,title,docket})=>document.documentElement.dataset.ashDemoProfile===profile&&document.getElementById('caseTitle')?.textContent?.includes(title)&&document.getElementById(docket),{profile,title:plan.title,docket:plan.docket});
    const state=await current(page);
    assert(state.caseMap?.rooms?.length===expected.rooms,`${profile}: Room count drifted.`);
    assert(state.caseMap?.nodes?.length===expected.nodes,`${profile}: object count drifted.`);
    assert(state.caseMap?.relationships?.length===expected.relationships,`${profile}: relation count drifted.`);
    assert(state.routeMemory?.entries?.length===expected.routes,`${profile}: route count drifted.`);
    const docketText=await page.locator(`#${plan.docket}`).textContent();
    assert(/PA2/.test(docketText)&&/Unknown Readers UNMEASURED/.test(docketText),`${profile}: qualification ceiling is absent.`);
    report.profiles[profile]={case_id:state.caseMap.case_id,case_map_digest:state.caseMap.case_map_digest,route_memory_digest:state.routeMemory.route_memory_digest,...expected,docket:plan.docket};
    await context.close();
  }

  assert(report.legacy_fixture_requests.length===0,`Legacy fixture requests survived: ${report.legacy_fixture_requests.join(', ')}`);
  assert(report.external_requests.length===0,`External requests: ${report.external_requests.join(', ')}`);
  assert(report.console_errors.length===0,`Console errors: ${JSON.stringify(report.console_errors)}`);
  assert(report.http_errors.length===0,`HTTP errors: ${JSON.stringify(report.http_errors)}`);
  report.status='PASS';
}catch(error){
  terminalError=error;report.status='HOLD';report.seams.push({message:error.message,stack:error.stack});
}finally{
  await fsp.writeFile(path.join(out,`${engineName}-ash-live-release.json`),JSON.stringify(report,null,2));
  if(browser)await browser.close().catch(()=>{});
}
if(terminalError)throw terminalError;
console.log(`ash-live-release-browser-probe.mjs passed for ${engineName}`);
