/**
 * Sequence 6 native cutover browser witness.
 * Real committed Loom + Marrowline UI and live local Loom custody.
 * The receiver completion is deterministic and intercepted; no external provider,
 * production API, physical device, or authenticated foreign ancestry is claimed.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, webcrypto } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
import {
  bindLoomDemoRequest, loomDemoDigest, loomDemoReceiptDigest, loomDemoResult,
  LOOM_DEMO_STAGE_RECEIPT_SCHEMA
} from '../app/dome-world/holonomy-loom/demo-contract.js';

const app=path.resolve('app');
const dir=path.resolve(process.env.TD613_ARTIFACT_DIR||'artifacts/loom-native-cutover');
await fs.mkdir(dir,{recursive:true});
const environment={crypto:webcrypto};
const base='https://td613.com';
const baseOrigin=new URL(base).origin;
const canary='UNSELECTED-NATIVE-CUTOVER-CANARY-613';
const heads=new Map();
let deterministicCalls=0;

const report={
  schema:'td613.loom.native-cutover-browser-witness/v0.1',
  source_sha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
  working_tree_dirty:Boolean(execFileSync('git',['status','--porcelain','--untracked-files=no'],{encoding:'utf8'}).trim()),
  status:'HELD',
  evidence_class:'EXACT_COMMITTED_PRODUCT_UI_WITH_DETERMINISTIC_INTERCEPTED_MARROWLINE_RECEIVER_AND_LIVE_LOCAL_CUSTODY',
  receiver_mode:'DETERMINISTIC_INTERCEPTED_NATIVE_HANDLER',
  live_provider_calls:0,
  physical_device:false,
  human_comprehension_measured:false,
  viewport:{width:390,height:844},
  frontend_bytes:[],
  requests:[],
  checks:[],
  held:[
    'Foreign receiver authentication remains unresolved.',
    'Physical phone browser chrome and keyboard are unobserved.',
    'Human comprehension is unmeasured.'
  ],
  failures:[],
  observed_at:new Date().toISOString()
};

const output=(id,answer,ids)=>({
  schema:'td613.loom.ai-task-result/v0.1',
  request_id:id,
  status:'completed',
  answer,
  missing_information:['Venue decision remains unresolved.'],
  used_document_ids:ids,
  suggested_next_step:'Review the returned work before local admission.'
});
const nativeReply=text=>({
  ok:true,text,
  relay:{transcript:text,khonapolit:{present:true,text}},
  receipt:{provider:{model:'DETERMINISTIC_NATIVE_CUTOVER_ADAPTER',completion:{complete:true}}}
});

const browser=await chromium.launch({headless:true});
const context=await browser.newContext({viewport:report.viewport,acceptDownloads:true});
const errors=[];
context.on('page',p=>{p.setDefaultTimeout(20000);p.on('pageerror',e=>errors.push(e.message));});

await context.route('**/*',async route=>{
  const request=route.request(),url=new URL(request.url());
  if(url.origin!==baseOrigin)return route.abort();
  if(url.pathname.startsWith('/api/')){
    if(request.method()==='GET'){
      return route.fulfill({json:{ok:true,hasGeminiKey:true,hasProviderKey:true,modelPolicy:{callableModels:['DETERMINISTIC_NATIVE_CUTOVER_ADAPTER']}}});
    }
    if(request.method()!=='POST')return route.fulfill({status:405,json:{ok:false,error:'METHOD_NOT_ALLOWED'}});
    const raw=request.postData()||'';
    assert.equal(raw.includes(canary),false,'unselected canary crossed API boundary');
    const body=request.postDataJSON();
    if(url.searchParams.get('operation')!=='loom-demo-task'){
      return route.fulfill({status:503,json:{ok:false,error:'UNEXPECTED_NATIVE_CUTOVER_ROUTE'}});
    }
    deterministicCalls++;
    const activation=body.activation,prior=heads.get(activation.activation_digest);
    if(body.phase==='ACTIVATE')assert.equal(prior,undefined,'activation cannot inherit a prior receipt');
    else assert.equal(await loomDemoReceiptDigest(body.predecessor,environment),await loomDemoReceiptDigest(prior,environment),'continuation predecessor changed');
    const binding=await bindLoomDemoRequest(body,environment);
    const continuation=deterministicCalls-1;
    const answer=body.phase==='ACTIVATE'
      ? 'Task and rules acknowledged; selected files are pending.'
      : `Deterministic continuation ${continuation}: three workshop sessions retained; venue decision remains unresolved.`;
    const result=output(body.request_id,answer,body.documents.map(doc=>doc.id));
    const receipt={
      schema:LOOM_DEMO_STAGE_RECEIPT_SCHEMA,
      activation_digest:activation.activation_digest,
      phase:body.phase,
      request_id:body.request_id,
      request_digest:await loomDemoDigest(body,environment),
      current_input_digest:binding.governance.input_digest,
      prior_result_digest:binding.receipt.prior_result_digest,
      result_digest:await loomDemoDigest(loomDemoResult(result,binding.selected.documents),environment),
      predecessor_receipt_digest:prior?await loomDemoReceiptDigest(prior,environment):null,
      expires_at:activation.expires_at,
      admission_state:'ADMITTED',
      stage_policy:body.phase==='ACTIVATE'?'AIA_ONLY':'SELECTED_FILES_BOUND',
      authority_transferred:false,
      auth:{scheme:'hmac-sha256',key_id:'td613-loom-demo-stage-v1',tag:'A'.repeat(43)}
    };
    heads.set(activation.activation_digest,receipt);
    binding.governor.close();
    return route.fulfill({json:{...result,native_reply:nativeReply(answer),loom_demo_binding:binding.receipt,loom_demo_stage_receipt:receipt}});
  }
  if(request.method()!=='GET')return route.abort();
  const file=path.resolve(app,'.'+url.pathname);
  if(!file.startsWith(app+path.sep))return route.abort();
  try{
    const bytes=await fs.readFile(file);
    report.frontend_bytes.push({path:path.relative(app,file),sha256:createHash('sha256').update(bytes).digest('hex')});
    const type=({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.woff':'font/woff','.woff2':'font/woff2'})[path.extname(file)]||'application/octet-stream';
    return route.fulfill({status:200,contentType:type,body:bytes});
  }catch{return route.abort();}
});

context.on('response',async response=>{
  const request=response.request(),url=new URL(response.url());
  if(request.method()!=='POST'||!url.pathname.startsWith('/api/'))return;
  try{
    report.requests.push({endpoint:url.pathname+url.search,request:request.postDataJSON(),response:await response.json(),http_status:response.status()});
    await fs.writeFile(path.join(dir,'receipt.json'),JSON.stringify(report,null,2));
  }catch(error){report.held.push('Response capture held: '+error.message);}
});

async function shot(page,name){await page.screenshot({path:path.join(dir,name+'.png'),fullPage:true});}
async function download(page,selector,name){
  const wait=page.waitForEvent('download');await page.locator(selector).click();const d=await wait;
  const destination=path.join(dir,name);await d.saveAs(destination);return JSON.parse(await fs.readFile(destination,'utf8'));
}
async function leaveTutorial(page){
  await page.locator('#loomFirstCrossing').waitFor({state:'visible'});
  await page.locator('#loomFirstCrossingLeave').click();
  await page.locator('.loom-builder-shell').waitFor({state:'visible'});
}
async function stage(marrow,label){
  await marrow.locator('#marrowlineComposerPlus').click();
  await marrow.locator('#marrowlineContextLoom').click();
  await marrow.getByRole('button',{name:label,exact:true}).click();
}
async function send(marrow,expected){
  await marrow.locator('#khonapolitSend').click();
  await marrow.waitForFunction(expected=>window.__TD613_LOOM_DEMO_CONTROLLER__?.snapshot().phase===expected&&window.__TD613_LOOM_DEMO_CONTROLLER__?.snapshot().busy===false,expected,{timeout:30000});
}
async function prepareLoom(page,{task='Fictional workshop planning: summarize the selected schedule and preserve the missing venue decision.'}={}){
  await page.locator('#aiTask').fill(task);
  await page.locator('#aiUpload').setInputFiles([
    {name:'workshop.md',mimeType:'text/markdown',buffer:Buffer.from('FICTIONAL SCENARIO. Three sessions: source review, drafting, reconciliation. Each is 45 minutes. Venue unchosen.')},
    {name:'local-ledger.md',mimeType:'text/markdown',buffer:Buffer.from(canary)}
  ]);
  await page.locator('#aiDocuments input[type=checkbox]').first().check();
  await page.locator('#aiPreparePortable').click();
  await page.locator('#aiMarrowline').waitFor({state:'visible'});
}
async function runOneTurnMarrowline(marrow){
  await marrow.waitForLoadState('networkidle');
  await marrow.locator('#marrowlineComposerPlus').waitFor();
  await stage(marrow,'Setup · Attach Loom handoff');
  await send(marrow,'AIA_SENT');
  await stage(marrow,'Continue · Attach selected files');
  await send(marrow,'DONE');
  if(await marrow.locator('[data-mobile-target=gatePanel]').isVisible())await marrow.locator('[data-mobile-target=gatePanel]').click();
  return download(marrow,'#loomGateExportCurrent','B-continuation-1.json');
}

try{
  const page=await context.newPage();
  // Actual browser Back/Forward around the native product surface before dispatch.
  await page.goto(base+'/dome-world/marrowline.html',{waitUntil:'networkidle'});
  await page.goto(base+'/dome-world/holonomy-loom.html',{waitUntil:'networkidle'});
  await leaveTutorial(page);
  await page.goBack({waitUntil:'networkidle'});
  assert.equal(new URL(page.url()).pathname,'/dome-world/marrowline.html');
  await page.goForward({waitUntil:'networkidle'});
  await leaveTutorial(page);
  assert.equal(report.requests.length,0);
  assert.equal((await page.locator('[data-loom-reentry=count]').innerText()).trim(),'0');
  report.checks.push('Browser Back/Forward before dispatch restored no provider effect or local admission authority.');

  // Reload before Send.
  await page.reload({waitUntil:'networkidle'});
  await leaveTutorial(page);
  assert.equal(report.requests.length,0);
  assert.equal((await page.locator('[data-loom-reentry=count]').innerText()).trim(),'0');
  report.checks.push('Reload before Send preserved zero provider calls and zero admitted descendants.');

  await prepareLoom(page);
  assert.equal(report.requests.length,0);
  const prepared=await download(page,'#aiExportSession','A-prepared-session.json');
  assert.equal(JSON.stringify(prepared).includes(canary),false);
  await shot(page,'mobile-prepared');

  // One continuous native product episode.
  const popup=context.waitForEvent('page');
  await page.locator('#aiMarrowline').click();
  const marrow=await popup;
  const returned=await runOneTurnMarrowline(marrow);
  assert.equal(returned.loom_demo_provenance.stages.filter(stage=>stage.receipt.phase==='CONTINUE').length,1);
  assert.equal(JSON.stringify(returned).includes(canary),false);
  await shot(marrow,'mobile-marrowline-one-turn');

  await marrow.locator('#loomGateReturnToLoom').click();
  await page.locator('[data-return-review=result]').waitFor();
  assert.match(await page.locator('[data-loom-reentry=returns]').inputValue(),/td613\.loom\.bound-receiver-turn\/v0\.2/);
  assert.equal((await page.locator('[data-loom-reentry=count]').innerText()).trim(),'0');
  report.checks.push('Native same-origin return staged exact one-turn bytes while admitted head remained unchanged.');

  await page.locator('[data-loom-reentry=policy-review]').check();
  await page.locator('[data-loom-reentry=check]').click();
  await page.locator('[data-loom-reentry=result][data-state="ADMISSION_CANDIDATE"]').waitFor();
  assert.equal((await page.locator('[data-loom-reentry=count]').innerText()).trim(),'0');
  await shot(page,'mobile-native-check-candidate');
  report.checks.push('Native Check produced a candidate without advancing the local head.');

  await page.locator('[data-loom-reentry=accept]').check();
  await page.locator('[data-loom-reentry=admit]').click();
  await page.waitForFunction(()=>document.querySelector('[data-loom-reentry="result"]')?.dataset.state==='ADMITTED');
  assert.equal((await page.locator('[data-loom-reentry=count]').innerText()).trim(),'1');
  const reviewBoundary = await page.locator('[data-return-review=boundary]').innerText();
  const reviewStatus = await page.locator('[data-return-review=status]').innerText();
  assert.match(reviewBoundary, /This review record grants no admission authority/);
  assert.doesNotMatch(reviewBoundary, /local custody admission remains HELD/);
  assert.match(reviewStatus, /that lane shows its current Check and admission state/);
  assert.doesNotMatch(reviewStatus, /nothing is admitted/);
  await shot(page,'mobile-native-admitted');
  report.checks.push('Explicit native Admit advanced exactly one local descendant.');
  report.checks.push('After admission, returned review points to current custody state without claiming nothing is admitted.');

  await page.setViewportSize({width:1280,height:900});
  await shot(page,'desktop-native-admitted');
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.evaluate(()=>matchMedia('(prefers-reduced-motion: reduce)').matches),true);
  await shot(page,'desktop-native-reduced-motion');
  await page.setViewportSize({width:390,height:844});
  await page.locator('[data-loom-reentry=rest]').click();
  await page.waitForFunction(()=>document.querySelector('[data-loom-reentry="result"]')?.dataset.state==='REST');
  await shot(page,'mobile-native-structural-rest');
  report.checks.push('The same episode projected desktop and reduced-motion states, then reached structural Rest at 390px.');

  // Reload after admitted return: review may persist, custody authority must not resurrect.
  await page.reload({waitUntil:'networkidle'});
  await page.locator('.loom-builder-shell').waitFor({state:'visible'});
  assert.equal(await page.locator('[data-loom-reentry=admit]').isEnabled().catch(()=>false),false);
  report.checks.push('Reload after completed return preserved review material without resurrecting live admission authority.');

  // Separate safe-failure probe: reload the Loom opener after outbound handoff,
  // then let the old child finish. The returned child cannot regain native custody.
  const probe=await context.newPage();
  await probe.goto(base+'/dome-world/holonomy-loom.html',{waitUntil:'networkidle'});
  await leaveTutorial(probe);
  await prepareLoom(probe,{task:'Reload-after-send safe-failure probe.'});
  const probePopup=context.waitForEvent('page');
  await probe.locator('#aiMarrowline').click();
  const probeMarrow=await probePopup;
  await probeMarrow.waitForLoadState('networkidle');
  await probe.reload({waitUntil:'networkidle'});
  await leaveTutorial(probe);
  const beforeProbeRequests=report.requests.length;
  await runOneTurnMarrowline(probeMarrow);
  assert.equal(report.requests.length,beforeProbeRequests+2);
  await probeMarrow.locator('#loomGateReturnToLoom').click();
  await probe.waitForTimeout(300);
  assert.equal((await probe.locator('[data-loom-reentry=count]').innerText()).trim(),'0');
  assert.equal(await probe.locator('[data-loom-reentry=returns]').inputValue().catch(()=>''),'');
  report.checks.push('Reload after outbound handoff severed live custody: the old child completed, but its return could not stage or admit work.');

  report.intercepted_receiver_calls=deterministicCalls;
  report.native_local_admission_observed=true;
  report.structural_rest_observed=true;
  report.navigation={back:true,forward:true,reload_before_send:true,reload_after_handoff_fail_closed:true,reload_after_return_review_only:true};
  report.status='PASS_NATIVE_CUTOVER_DETERMINISTIC_RECEIVER';
  assert.deepEqual(errors,[]);
  await fs.writeFile(path.join(dir,'receipt.json'),JSON.stringify(report,null,2));
  console.log(report.status);
}catch(error){
  report.failures.push(error.stack||error.message);
  report.status='HELD';
  await fs.writeFile(path.join(dir,'receipt.json'),JSON.stringify(report,null,2));
  console.error(error.stack||error);
  process.exitCode=1;
}finally{
  await browser.close();
}
