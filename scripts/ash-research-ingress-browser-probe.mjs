import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const base=String(process.env.TD613_BASE_URL||'http://127.0.0.1:6130').replace(/\/$/,'');
const out=path.resolve(process.env.TD613_ARTIFACT_DIR||'artifacts/ash-research-ingress');
const engineName=process.env.TD613_BROWSER||'chromium';
const engine={chromium,firefox,webkit}[engineName];
if(!engine) throw new Error(`Unsupported browser engine: ${engineName}`);
const executable=process.env.TD613_BROWSER_EXECUTABLE;
const launchOptions={headless:true,...(executable&&fs.existsSync(executable)?{executablePath:executable}:{})};
const viewports=[
  {name:'desktop-short',width:1280,height:480},
  {name:'desktop-standard',width:1366,height:768},
  {name:'desktop-wide',width:1440,height:900},
  {name:'desktop-hd',width:1920,height:1080}
];
function assert(v,m){if(!v) throw new Error(m);}
async function readCurrent(page){
  return page.evaluate(()=>new Promise((resolve,reject)=>{
    const id=localStorage.getItem('td613.ash-keep.current-case');
    const request=indexedDB.open('td613-ash-keep');
    request.onsuccess=()=>{
      const db=request.result;const tx=db.transaction(['cases','routeMemory']);
      const c=tx.objectStore('cases').get(id),r=tx.objectStore('routeMemory').get(id);
      tx.oncomplete=()=>{db.close();resolve({caseMap:c.result||null,routeMemory:r.result?.value||null});};
      tx.onerror=()=>{db.close();reject(tx.error);};
    };request.onerror=()=>reject(request.error);
  }));
}
await fsp.mkdir(out,{recursive:true});
const browser=await engine.launch(launchOptions);
const report={schema:'td613.ash.research-ingress-flight/v0.1',browser:engineName,status:'RUNNING',ingress:[],research:null,external_requests:[],console_errors:[],http_errors:[],seams:[]};
try{
  for(const viewport of viewports){
    const context=await browser.newContext({viewport:{width:viewport.width,height:viewport.height},reducedMotion:'reduce'});
    const page=await context.newPage();page.setDefaultTimeout(60000);
    page.on('console',m=>{if(m.type()==='error')report.console_errors.push({viewport:viewport.name,text:m.text()});});
    page.on('pageerror',e=>report.console_errors.push({viewport:viewport.name,text:e.message}));
    page.on('response',r=>{if(r.status()>=400&&!/favicon\.ico/.test(r.url()))report.http_errors.push({viewport:viewport.name,status:r.status(),url:r.url()});});
    page.on('request',r=>{const u=new URL(r.url());if(u.origin!==new URL(base).origin)report.external_requests.push(r.url());});
    await page.goto(`${base}/dome-world/ash-keep.html`,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>Boolean(window.__td613AshIngressLayout?.version)&&Boolean(window.__td613AshResearchDemo?.version)&&Boolean(window.__td613AshKeep?.version));
    const measurement=await page.evaluate(()=>window.__td613AshIngressLayout.measure());
    assert(measurement.horizontal_overflow===0,`${viewport.name}: horizontal overflow.`);
    assert(Math.abs(measurement.center_delta.x)<=2,`${viewport.name}: membrane is not horizontally centered.`);
    assert(measurement.panel.width<=900.5,`${viewport.name}: panel exceeded width ceiling.`);
    if(!measurement.panel.scrollable) assert(Math.abs(measurement.center_delta.y)<=3,`${viewport.name}: fitting panel is not vertically centered.`);
    if(measurement.panel.scrollable){
      await page.locator('#launch .launch-panel').evaluate(node=>node.scrollTo({top:node.scrollHeight,behavior:'auto'}));
      assert(await page.locator('#startDemo').isVisible(),`${viewport.name}: demo action not reachable after scroll.`);
      assert(await page.locator('#newCase').isVisible(),`${viewport.name}: new-case action not reachable after scroll.`);
    }
    await page.screenshot({path:path.join(out,`${engineName}-${viewport.name}-ingress.png`),fullPage:true});
    report.ingress.push({name:viewport.name,...measurement});

    if(viewport.name==='desktop-standard'){
      await page.locator('#newProfile').selectOption('research');
      await page.waitForFunction(()=>!document.getElementById('startDemo')?.disabled && /Research qualification/.test(document.getElementById('startDemo')?.textContent||''));
      await page.locator('#startDemo').click();
      await page.waitForFunction(()=>document.documentElement.dataset.ashDemoProfile==='research'&&document.getElementById('researchMethodDocket'));
      const current=await readCurrent(page);
      assert(current.caseMap?.rooms?.length===14,'Research Room count drifted.');
      assert(current.caseMap?.nodes?.length===72,'Research node count drifted.');
      assert(current.caseMap?.relationships?.length===112,'Research relation count drifted.');
      assert(current.routeMemory?.entries?.length===6,'Research route count drifted.');
      const docket=await page.locator('#researchMethodDocket').textContent();
      assert(/12/.test(docket)&&/8/.test(docket)&&/PA2/.test(docket)&&/Unknown Readers/i.test(docket),'Research Method Docket omitted qualification boundaries.');
      const api=await page.evaluate(()=>({counts:window.__td613AshResearchDemo.counts,assurance:window.__td613AshResearchDemo.assurance}));
      assert(api.counts.controls===12&&api.counts.held_outs===8&&api.counts.strata===10,'Research assay counts drifted.');
      assert(api.assurance.maximum==='PA2_LOCALLY_EXECUTED'&&api.assurance.unknown_readers==='UNMEASURED'&&api.assurance.universal_secrecy===false,'Research assurance ceiling drifted.');
      await page.screenshot({path:path.join(out,`${engineName}-research-method-docket.png`),fullPage:true});
      report.research={case_id:current.caseMap.case_id,case_map_digest:current.caseMap.case_map_digest,route_memory_digest:current.routeMemory.route_memory_digest,...api.counts,assurance:api.assurance};
    }
    await context.close();
  }
  assert(report.ingress.some(item=>item.panel.scrollable),`${engineName}: no desktop viewport exercised the scroll membrane.`);
  assert(report.external_requests.length===0,`External requests: ${report.external_requests.join(', ')}`);
  assert(report.console_errors.length===0,`Console errors: ${JSON.stringify(report.console_errors)}`);
  assert(report.http_errors.length===0,`HTTP errors: ${JSON.stringify(report.http_errors)}`);
  report.status='PASS';
}catch(error){report.status='HOLD';report.seams.push({message:error.message,stack:error.stack});throw error;}
finally{await fsp.writeFile(path.join(out,`${engineName}-research-ingress-flight.json`),JSON.stringify(report,null,2));await browser.close();}
console.log(`ash-research-ingress-browser-probe.mjs passed for ${engineName}`);
