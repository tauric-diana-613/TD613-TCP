/**
 * G5 explicit browser-only portable session qualification, never original-corpus
 * or human-cadence closure. Run on actual GitHub checkout and build SHA.
 * Genuine Chromium download -> ZIP extraction -> new local origin -> readback.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {execFileSync,spawn} from 'node:child_process';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';

const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const root=resolve('artifacts/vixen-g5-extracted');
const sourceURL='http://127.0.0.1:6130/encyclopedia/vix-cyb.html';
const extractedOrigin='http://127.0.0.1:6132';
const extractedURL=extractedOrigin+'/encyclopedia/vix-cyb.html';
const snapshots=[];
const output={schema:'td613.vixen.g5.extracted-browser-witness/v1',
 source_sha:head,source_route:'LIVE_CHECKOUT_HTTP',extracted_route:'SEPARATE_LOCAL_HTTP',
 generated_in_browser:true,reference_corpus_admitted:false,
 human_cadence_witness:false,scientific_credit:0,
 viewports:[],status:'RUNNING',limits:[
  'STATIC_LITERAL_DEPENDENCY_CLOSURE_ONLY',
  'RENDERED_BROWSER_ROUTE_NOT_HUMAN_INTERACTION',
  'CENSUS_VERIFIED_IS_NOT_RECORD_BODY_READBACK',
  'NO_PERSISTED_NOTES_OR_ROLE_RESTORATION'
 ]};
await mkdir(root,{recursive:true});
const temp=await mkdtemp(join(tmpdir(),'td613-g5-actual-export-'));
let server=null;
const browser=await chromium.launch({headless:true});
async function available(url){
 for(let i=0;i<50;i++){
  try{const r=await fetch(url);if(r.ok)return true;}catch(_){}
  await new Promise(r=>setTimeout(r,120));
 }
 return false;
}
try{
 for(const width of [1440,390]){
  const device={width,height:width===1440?900:844};
  const context=await browser.newContext({viewport:device,reducedMotion:'reduce',acceptDownloads:true});
  const page=await context.newPage();
  const errors=[],network=[];
  page.on('pageerror',error=>errors.push(error.message));
  page.on('response',res=>{
   if(res.status()>=400)network.push({status:res.status(),url:res.url().slice(0,240)});
  });
  const opened=await page.goto(sourceURL,{waitUntil:'domcontentloaded',timeout:35000});
  assert.equal(opened?.status(),200,'Original Vixen source must serve');
  const preflight=await page.evaluate(async()=>{
   const mod=await import('./vixen-estate/session-zip.mjs');
   const result=await mod.collectVixenSessionFiles({documentRef:document,
    synthesisState:{},sessionMeta:{},exportedAt:'2026-11-20T23:00:00Z'});
   return {
    fidelity:result.fidelity,counts:{entries:result.entries.length,omitted:result.omitted.length},
    manifest:{
     required_missing_paths:result.manifest.required_missing_paths,
     optional_missing_paths:result.manifest.optional_missing_paths,
     reference:result.manifest.reference,
     external_resource_dependencies:result.manifest.external_resource_dependencies,
     undecodable_dependency_sources:result.manifest.undecodable_dependency_sources
    }
   };
  });
  const receipt={viewport:device,preflight,source_page_errors:[...errors],source_http_errors:[...network]};
  output.viewports.push(receipt);
  await writeFile(join(root,'preflight-'+width+'.json'),JSON.stringify(receipt,null,2)+'\n');
  // A real failure is valuable: record it instead of fabricating a green ZIP.
  assert.equal(preflight.fidelity,'ONLINE_REFERENCE_REQUIRED',
   'G5 source bundle must be free of boot-critical omissions but honest about unbundled record bodies: '+
   JSON.stringify(preflight).slice(0,18000));
  assert.equal(preflight.manifest.reference.index_census_verified,true);
  assert.equal(preflight.manifest.reference.bundled_verified_record_bodies,0);
  if (await page.locator('#researchCartPopout').isHidden()) {
    await page.locator('#researchCartBtn').click();
  }
  const button=page.locator('#footerSaveSessionBtn');
  await button.waitFor({state:'visible',timeout:15000});
  const downloadPromise=page.waitForEvent('download',{timeout:65000});
  await button.click({timeout:15000});
  const download=await downloadPromise;
  assert(download.suggestedFilename().endsWith('.zip'),'Browser must download a real ZIP');
  const downloaded=join(root,'actual-vixen-'+width+'.zip');
  await download.saveAs(downloaded);
  receipt.zip_sha256=createHash('sha256').update(await readFile(downloaded)).digest('hex');
  const extracted=join(temp,'extracted-'+width);
  await mkdir(extracted,{recursive:true});
  receipt.extraction=JSON.parse(execFileSync('python3',[
    'scripts/vixen-g5-archive-verify.py',downloaded,extracted
  ],{encoding:'utf8',timeout:35000,maxBuffer:1024*1024}));
  assert.equal(receipt.extraction.manifest,'ONLINE_REFERENCE_REQUIRED');
  // Each replay serves ZIP bytes only; never silently fall back to checkout.
  if(server){server.kill();server=null}
  server=spawn('python3',['-m','http.server','6132','--bind','127.0.0.1','--directory',extracted],
    {stdio:'ignore'});
  assert(await available(extractedURL),'Extracted archive failed to serve locally');
  const offline=await context.newPage();
  const extractedErrors=[],missingAssets=[],offOrigin=[];
  await offline.route('**/*',route=>{
   const requested=route.request().url();
   if(requested.startsWith(extractedOrigin+'/'))return route.continue();
   offOrigin.push(requested);
   return route.abort();
  });
  offline.on('pageerror',e=>extractedErrors.push(e.message));
  offline.on('response',res=>{
   if(res.status()>=400)missingAssets.push({status:res.status(),url:res.url()});
  });
  const replay=await offline.goto(extractedURL,{waitUntil:'domcontentloaded',timeout:35000});
  assert.equal(replay?.status(),200,'Actual extracted HTML must boot through independent origin');
  await offline.waitForFunction(()=>window.VIXEN_FOX_HOUSE?.mounted===true,null,{timeout:25000});
  await offline.locator('#vixenRoomRail button[data-view="reference"]').click();
  await offline.waitForFunction(()=>document.body.dataset.view==='reference',null,{timeout:10000});
  const membrane=await offline.evaluate(async()=>{
   const mod=await import('./reference/vixen-read-gateway.mjs');
   const gateway=mod.createVixenReferenceMembrane({
    baseURL:new URL('./reference/',location.href).href
   });
   const census=await gateway.open();
   let record={status:'UNKNOWN'};
   try{await gateway.getRecord('G-001');record={status:'INCORRECTLY_READABLE'}}
   catch(e){record={status:'HELD',code:e.code||e.name}}
   return {census,record};
  });
  receipt.extracted={origin:extractedOrigin,
   boot:'VIXEN_FOX_HOUSE_MOUNTED',reference:membrane,
   errors:extractedErrors,missing_http:missingAssets,off_origin:offOrigin};
  await offline.screenshot({path:join(root,'extracted-'+width+'.png'),animations:'disabled'});
  assert.equal(membrane.census.state,'CENSUS_MATCHED');
  assert.equal(membrane.record.status,'HELD','Unbundled records cannot become offline bodies');
  assert.equal(membrane.record.code,'REFERENCE_NETWORK_UNAVAILABLE');
  assert.deepEqual(extractedErrors,[],'Extracted browser must not throw');
  assert.deepEqual(offOrigin,[],'Extracted archive must not request its original host/CDN');
  const missingCritical=missingAssets.filter(e=>!e.url.includes('/reference/records/'));
  assert.deepEqual(missingCritical,[],'ZIP must include every boot-critical requested asset');
  await context.close();
  server.kill();server=null;
 }
 output.status='EXTRACTED_BROWSER_WITNESS_PASS';
}catch(e){
 output.status='FAIL_OR_HELD';
 output.error=String(e?.stack||e);
 throw e;
}finally{
 await writeFile(join(root,'witness-receipt.json'),JSON.stringify(output,null,2)+'\n');
 await browser.close();
 if(server)server.kill();
 await rm(temp,{recursive:true,force:true});
}
console.log('G5 extracted source ZIP Chromium: '+output.status+' on 1440px and 390px, source SHA '+head);
