import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const base=String(process.env.TD613_BASE_URL||'http://127.0.0.1:6130').replace(/\/$/,'');
const out=path.resolve(process.env.TD613_ARTIFACT_DIR||'artifacts/ash-profile-demo-flight');
const url=`${base}/dome-world/ash-keep.html`;
const METHOD='td613.ash.apeq-paia-profile-demos/v0.1';
const expectedCounts={rooms:14,nodes:72,relationships:112,rules:8,routes:6,controls:12,held_outs:8,strata:10,joining_keys:8};
const plans={
  political_campaign:{title:'Harbor City Mayoral Campaign',route:'route_reporter_response',button:'Political Campaign'},
  fundraiser:{title:'Northstar Arts Benefit',route:'route_lead_host_brief',button:'Fundraiser'}
};
const assert=(value,message)=>{if(!value)throw new Error(message);};
const executable=process.env.TD613_BROWSER_EXECUTABLE;
const launch={headless:true,...(executable&&fs.existsSync(executable)?{executablePath:executable}:{})};

async function current(page){return page.evaluate(()=>new Promise((resolve,reject)=>{const id=localStorage.getItem('td613.ash-keep.current-case');const request=indexedDB.open('td613-ash-keep');request.onsuccess=()=>{const db=request.result;const tx=db.transaction(['cases','routeMemory']);const c=tx.objectStore('cases').get(id),r=tx.objectStore('routeMemory').get(id);tx.oncomplete=()=>{db.close();resolve({caseMap:c.result,routeMemory:r.result?.value});};tx.onerror=()=>reject(tx.error);};request.onerror=()=>reject(request.error);}));}
async function open(page,name){await page.evaluate(value=>(window.__td613AshPremiumUI?.open||window.__td613OpenAshWorkspace)(value),name);await page.waitForFunction(value=>document.getElementById(`workspace-${value}`)?.classList.contains('active'),name);}

await fsp.mkdir(out,{recursive:true});
const browser=await chromium.launch(launch);
const report={schema:'td613.ash.profile-demo-flight/v0.4-apeq-paia',status:'RUNNING',profiles:{},errors:[],http_errors:[],seams:[]};
try{
  for(const [profile,plan] of Object.entries(plans)){
    const context=await browser.newContext({viewport:{width:1366,height:900},reducedMotion:'reduce'});
    const page=await context.newPage();page.setDefaultTimeout(60000);
    page.on('console',message=>{if(message.type()==='error')report.errors.push({profile,text:message.text()});});
    page.on('pageerror',error=>report.errors.push({profile,text:error.message}));
    page.on('response',response=>{if(response.status()>=400&&!/favicon\.ico/.test(response.url()))report.http_errors.push({profile,status:response.status(),url:response.url()});});
    await page.goto(url,{waitUntil:'domcontentloaded'});
    await page.waitForFunction(version=>window.__td613AshProfileDemos?.version===version&&Boolean(window.__td613AshKeep?.version)&&Boolean(window.__td613AshPremiumUI?.version),METHOD);
    if(profile==='political_campaign'){
      assert(await page.locator('#newProfile').inputValue()==='','Launch did not begin at Select a profile.');
      assert(await page.locator('#startDemo').isDisabled(),'Demo action was active before profile selection.');
      const investigation=await page.evaluate(()=>({version:window.__td613AshInvestigationDemo.version,counts:window.__td613AshInvestigationDemo.counts,assurance:window.__td613AshInvestigationDemo.assurance}));
      assert(investigation.version==='td613.ash.investigation-demo/v0.2-apeq-paia','Investigation registration version drifted.');
      assert(JSON.stringify(investigation.counts)===JSON.stringify(expectedCounts),'Investigation registration counts drifted.');
      assert(investigation.assurance.maximum==='PA2_LOCALLY_EXECUTED','Investigation registration ceiling drifted.');
    }
    await page.locator('#newProfile').selectOption(profile);
    await page.waitForFunction(value=>{const button=document.getElementById('startDemo');return document.getElementById('newProfile')?.value===value&&button&&!button.disabled&&button.getAttribute('aria-disabled')==='false'&&button.dataset.ashMethodDemoState==='READY';},profile);
    assert((await page.locator('#startDemo').textContent()).includes(plan.button),`${profile}: button label drifted.`);
    await page.locator('#startDemo').click();
    await page.waitForFunction(value=>document.documentElement.dataset.ashDemoProfile===value,profile);
    await page.waitForFunction(value=>document.getElementById('caseTitle')?.textContent?.includes(value),plan.title);
    await page.locator('#apeqPaiaMethodDocket').waitFor({state:'visible'});
    const state=await current(page);
    assert(state.caseMap.rooms.length===14,`${profile}: Room count drifted.`);
    assert(state.caseMap.nodes.length===72,`${profile}: object count drifted.`);
    assert(state.caseMap.relationships.length===112,`${profile}: relation count drifted.`);
    assert(state.routeMemory.entries.length===6,`${profile}: route count drifted.`);
    assert(await page.locator('#routeId').inputValue()===plan.route,`${profile}: route default drifted.`);
    const docket=await page.locator('#apeqPaiaMethodDocket').textContent();
    for(const token of ['APEQ environment qualification','PAIA anisotropic projection field','joining keys · 8','controls · 12','held outs · 8','strata · 10','Unknown Readers UNMEASURED'])assert(docket.includes(token),`${profile}: docket omitted ${token}.`);
    await page.screenshot({path:path.join(out,`${profile}-method-docket.png`),fullPage:true});
    await open(page,'routes');assert(await page.locator('#routeList .route-card').count()===6,`${profile}: route cards drifted.`);
    await page.setViewportSize({width:390,height:844});await open(page,'map');await page.waitForTimeout(120);
    const mobile=await page.evaluate(()=>({overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),destinations:[...document.querySelectorAll('[data-premium-workspace]')].filter(node=>{const rect=node.getBoundingClientRect();return getComputedStyle(node).display!=='none'&&rect.width>0&&rect.height>0;}).length}));
    assert(mobile.overflow===0,`${profile}: mobile overflow.`);assert(mobile.destinations===5,`${profile}: destination dock incomplete.`);
    const api=await page.evaluate(value=>({counts:window.__td613AshProfileDemos.counts[value],assurance:window.__td613AshProfileDemos.assurance}),profile);
    assert(JSON.stringify(api.counts)===JSON.stringify(expectedCounts),`${profile}: API counts drifted.`);assert(api.assurance.maximum==='PA2_LOCALLY_EXECUTED',`${profile}: PA2 ceiling drifted.`);
    report.profiles[profile]={case_id:state.caseMap.case_id,case_map_digest:state.caseMap.case_map_digest,route_memory_digest:state.routeMemory.route_memory_digest,...api.counts,mobile};
    await context.close();
  }
  assert(report.errors.length===0,`Console errors: ${JSON.stringify(report.errors)}`);assert(report.http_errors.length===0,`HTTP errors: ${JSON.stringify(report.http_errors)}`);report.status='PASS';
}catch(error){report.status='HOLD';report.seams.push({message:error.message,stack:error.stack});throw error;}
finally{await fsp.writeFile(path.join(out,'ash-profile-demo-flight.json'),JSON.stringify(report,null,2));await browser.close();}
console.log('ash-profile-demo-browser-probe.mjs passed');
