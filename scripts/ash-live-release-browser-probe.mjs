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
const plans={
  political_campaign:{title:'Harbor City Mayoral Campaign',docket:'apeqPaiaMethodDocket'},
  fundraiser:{title:'Northstar Arts Benefit',docket:'apeqPaiaMethodDocket'},
  investigation:{title:'Glass Meridian Vendor Integrity Inquiry',docket:'apeqPaiaMethodDocket'},
  research:{title:'Lumen Atlas Study',docket:'researchMethodDocket'}
};
const assert=(value,message)=>{if(!value)throw new Error(message);};

function liveUrl(){
  const url=new URL('/dome-world/ash-keep.html',base);
  url.searchParams.set('ash_flush',ASH_CACHE_FLUSH_EPOCH);
  url.searchParams.set('asset_epoch','20260718-live-ingress-v3');
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
    && window.__td613AshIngressLayout?.version==='td613.ash.ingress-layout/v0.3-live-release'
    && window.__td613AshProfileDemos?.version==='td613.ash.apeq-paia-profile-demos/v0.1'
    && window.__td613AshResearchDemo?.version==='td613.ash.research-demo/v0.2-lumen-atlas'
    && window.__td613AshResearchControlState?.version==='td613.ash.research-control-state/v0.3-blank-case'
    && window.__td613AshCacheTransition?.epoch===epoch,
  ASH_CACHE_FLUSH_EPOCH,{timeout:60000});
}

await fsp.mkdir(out,{recursive:true});
const report={schema:'td613.ash.live-release-browser-flight/v0.1',browser:engineName,status:'RUNNING',cache_epoch:ASH_CACHE_FLUSH_EPOCH,ingress:null,profiles:{},legacy_fixture_requests:[],external_requests:[],console_errors:[],http_errors:[],seams:[]};
let browser=null,terminalError=null;
try{
  if(!engine)throw new Error(`Unsupported browser engine: ${engineName}`);
  browser=await engine.launch(launchOptions);

  {
    const context=await browser.newContext({viewport:{width:1280,height:360},reducedMotion:'reduce'});
    const page=await context.newPage();page.setDefaultTimeout(60000);
    page.on('console',m=>{if(m.type()==='error')report.console_errors.push({surface:'ingress',text:m.text()});});
    page.on('pageerror',e=>report.console_errors.push({surface:'ingress',text:e.message}));
    page.on('request',r=>{const url=r.url();if(/\/fixtures\/(?:ash-keep-demo|ash-investigation-)/.test(url))report.legacy_fixture_requests.push(url);const parsed=new URL(url);if(parsed.origin!==new URL(base).origin)report.external_requests.push(url);});
    page.on('response',r=>{if(r.status()>=400&&!/favicon\.ico/.test(r.url()))report.http_errors.push({surface:'ingress',status:r.status(),url:r.url()});});
    await page.goto(liveUrl(),{waitUntil:'domcontentloaded'});
    await waitForRuntime(page);
    const measurement=await page.evaluate(()=>window.__td613AshIngressLayout.measure());
    assert(measurement.horizontal_overflow===0,'Compressed ingress has horizontal overflow.');
    assert(Math.abs(measurement.center_delta.x)<=2,'Compressed ingress is not horizontally centered.');
    assert(measurement.panel.width<=780.5,'Ingress panel exceeded live width ceiling.');
    assert(measurement.panel.scrollable===true,'Compressed ingress did not activate the inner scroll membrane.');
    await page.locator('#launch .launch-panel').evaluate(node=>node.scrollTo({top:node.scrollHeight,behavior:'auto'}));
    assert(await page.locator('#startDemo').isVisible(),'Demo action is unreachable after ingress scroll.');
    assert(await page.locator('#newCase').isVisible(),'New case action is unreachable after ingress scroll.');
    await page.screenshot({path:path.join(out,`${engineName}-compressed-ingress.png`),fullPage:true});
    report.ingress=measurement;
    await context.close();
  }

  for(const [profile,plan] of Object.entries(plans)){
    const context=await browser.newContext({viewport:{width:1366,height:768},reducedMotion:'reduce'});
    const page=await context.newPage();page.setDefaultTimeout(60000);
    page.on('console',m=>{if(m.type()==='error')report.console_errors.push({surface:profile,text:m.text()});});
    page.on('pageerror',e=>report.console_errors.push({surface:profile,text:e.message}));
    page.on('request',r=>{const url=r.url();if(/\/fixtures\/(?:ash-keep-demo|ash-investigation-)/.test(url))report.legacy_fixture_requests.push(url);const parsed=new URL(url);if(parsed.origin!==new URL(base).origin)report.external_requests.push(url);});
    page.on('response',r=>{if(r.status()>=400&&!/favicon\.ico/.test(r.url()))report.http_errors.push({surface:profile,status:r.status(),url:r.url()});});
    await page.goto(liveUrl(),{waitUntil:'domcontentloaded'});
    await waitForRuntime(page);
    await page.locator('#newProfile').selectOption(profile);
    if(profile==='research'){
      await page.waitForFunction(()=>{const button=document.getElementById('startDemo');return button&&!button.disabled&&button.dataset.ashResearchControlState==='READY'&&document.getElementById('newCase')?.disabled===false;});
    }else{
      await page.waitForFunction(value=>{const button=document.getElementById('startDemo');return document.getElementById('newProfile')?.value===value&&button&&!button.disabled&&button.dataset.ashMethodDemoState==='READY';},profile);
    }
    await page.locator('#startDemo').click();
    await page.waitForFunction(({profile,title,docket})=>document.documentElement.dataset.ashDemoProfile===profile&&document.getElementById('caseTitle')?.textContent?.includes(title)&&document.getElementById(docket),plan?{profile,title:plan.title,docket:plan.docket}:null);
    const state=await current(page);
    assert(state.caseMap?.rooms?.length===expected.rooms,`${profile}: Room count drifted.`);
    assert(state.caseMap?.nodes?.length===expected.nodes,`${profile}: object count drifted.`);
    assert(state.caseMap?.relationships?.length===expected.relationships,`${profile}: relation count drifted.`);
    assert(state.routeMemory?.entries?.length===expected.routes,`${profile}: route count drifted.`);
    const docketText=await page.locator(`#${plan.docket}`).textContent();
    assert(/PA2/.test(docketText)&&/Unknown Readers UNMEASURED/.test(docketText),`${profile}: qualification ceiling is absent.`);
    await page.screenshot({path:path.join(out,`${engineName}-${profile}.png`),fullPage:true});
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
