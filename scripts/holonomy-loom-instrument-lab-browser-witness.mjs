/** Actual local interface; provider replies are intercepted fixtures. No human
 * comprehension, foreign origin, hardware or empirical acquisition claim. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { execFileSync } from 'node:child_process';
import { chromium } from 'playwright';
const appRoot=path.resolve('app'), dir=path.resolve(process.env.TD613_ARTIFACT_DIR||'artifacts/loom-instrument-lab-browser');
await fs.mkdir(dir,{recursive:true});
const server=http.createServer(async(req,res)=>{try{const file=path.resolve(appRoot,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(appRoot+path.sep))throw Error();const body=await fs.readFile(file);res.setHeader('Content-Type',({'.js':'text/javascript','.html':'text/html','.css':'text/css','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(body);}catch{res.statusCode=404;res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${server.address().port}`;
const report={schema:'td613.loom.instrument-lab-browser-witness/v0.1',status:'HELD',source_sha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),working_tree_dirty:Boolean(execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim()),scope:'REAL_LOCAL_UI_MOCK_PROVIDER',live_provider_calls:0,human_comprehension_measured:false,checks:[],failures:[]};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const[posture,width]of[['desktop',1280],['portrait-390',390]]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce',acceptDownloads:true});const page=await context.newPage();page.setDefaultTimeout(12000);
  const errors=[],posts=[];let releaseReply;
  page.on('pageerror',error=>errors.push(error.message));
  await context.route('**/api/**',async route=>{
   const req=route.request();if(req.method()==='GET')return route.fulfill({json:{ok:true,hasProviderKey:true}});
   posts.push({url:req.url(),body:req.postDataJSON()});
   const input=req.postDataJSON();await new Promise(resolve=>{releaseReply=resolve;});
   await route.fulfill({json:{schema:'td613.loom.ai-task-result/v0.1',request_id:input.request_id,status:'completed',answer:'Bounded fixture answer. Independent evidence remains missing.',used_document_ids:[],missing_information:['Independent observation missing.'],suggested_next_step:'Review the packet.'}});
  });
  try{
   await page.goto(base+'/dome-world/holonomy-loom.html',{waitUntil:'networkidle'});
   assert.equal(await page.locator('#loomLegacy').evaluate(n=>n.open),false);
   assert.equal(await page.locator('#loomObserverChamber').evaluate(n=>n.closest('details').open),false);
   assert.equal(await page.locator('#ilState [data-instrument-active-glyph]').textContent(),'','hidden visualization has not drawn');
   await page.locator('#loomLegacy > summary').focus();await page.keyboard.press('Enter');
   await page.waitForFunction(()=>document.querySelector('#ilState').dataset.clientPhase==='prepared');
   assert.equal(await page.locator('#ilState [data-instrument-active-glyph]').textContent(),'à');
   await page.locator('#ilBench').selectOption('information-gain');await page.locator('#ilPractice').click();assert.equal(posts.length,0);
   await page.locator('#ilRun').focus();await page.keyboard.press('Enter');await page.locator('#ilFinding').waitFor({state:'visible'});
   assert.match(await page.locator('#ilFinding').innerText(),/1\.000000 bits/);
   const quick=await page.locator('#ilReceipt').textContent();await page.locator('#ilDeep').click();assert.equal(await page.locator('#ilReceipt').textContent(),quick);
   await page.locator('#ilRest').click();assert.equal(await page.locator('#ilResult').isVisible(),true);await page.locator('#ilResume').click();assert.equal(await page.locator('#ilReceipt').textContent(),quick);
   const dl=page.waitForEvent('download');await page.locator('#ilSave').click();const download=await dl;await download.saveAs(path.join(dir,posture+'-assay.json'));
   const receipt=JSON.parse(await fs.readFile(path.join(dir,posture+'-assay.json'),'utf8'));assert.equal(receipt.authority.admission,false);
   await page.locator('#ilInput').fill('{broken');assert.equal(await page.locator('#ilResult').isVisible(),false);await page.locator('#ilRun').click();await page.waitForFunction(()=>document.querySelector('#ilStatus').textContent.includes('Input held'));
   await page.locator('#ilBench').selectOption('receiver-substitution');assert.equal(await page.locator('#ilInput').inputValue(),'');
   await page.locator('#aiTask').fill('Prepare one bounded test.');await page.locator('#aiRuntimeProfile').selectOption('quick');await page.locator('#aiRun').click();
   await page.waitForFunction(()=>document.querySelector('#ilState').dataset.clientPhase==='pending');assert.equal(posts.length,1);assert.ok(posts[0].url.endsWith('profile=quick'));assert.deepEqual(Object.keys(posts[0].body).sort(),['documents','request_id','rules','schema','task']);
   await page.locator('#ilRest').click();releaseReply();await page.waitForFunction(()=>document.querySelector('#ilState').dataset.clientPhase==='completed');
   assert.equal(await page.locator('#ilState').getAttribute('data-reduced-motion'),'true');assert.equal(await page.locator('#ilState [data-instrument-active-glyph]').textContent(),'hõt');assert.ok(!(await page.locator('#ilStateStatus').textContent()).includes('held'));
   await page.locator('#ilResume').click();
   await page.locator('#loomInstrumentLab').screenshot({path:path.join(dir,posture+'-lab.png')});
   await page.locator('#loomLegacy > summary').click();
   await page.evaluate(()=>{window.hiddenLabMutations=0;window.labObserver=new MutationObserver(records=>window.hiddenLabMutations+=records.length);window.labObserver.observe(document.querySelector('#ilState'),{subtree:true,attributes:true,childList:true,characterData:true});});
   await page.locator('#aiTask').fill('Changed task remains local.');await page.waitForTimeout(150);assert.equal(await page.evaluate(()=>window.hiddenLabMutations),0);await page.evaluate(()=>window.labObserver.disconnect());
   await page.locator('#loomLegacy > summary').click();await page.waitForFunction(()=>document.querySelector('#ilState').dataset.clientPhase==='prepared');
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   await page.reload({waitUntil:'networkidle'});assert.equal(await page.locator('#loomLegacy').evaluate(n=>n.open),false);assert.equal(await page.locator('#aiPortableMode').getAttribute('aria-selected'),'true');
   await page.locator('#aiDemoMode').click();assert.equal(await page.locator('#loomLegacy > summary').isVisible(),true);await page.locator('#aiPortableMode').click();assert.equal(await page.locator('#loomLegacy > summary').isVisible(),true);
   assert.deepEqual(errors,[]);report.checks.push({posture,width,status:'PASS',explicit_keyboard_entrance:true,closed_default:true,real_runtime_state:true,hidden_draws_zero:true,practice_inert:true,positive_information_gain:true,exact_receipt_profile_invariance:true,rest_preserves_evidence:true,pending_completion_survives_rest:true,stale_result_revoked:true,route_switching:true,reload:true,no_horizontal_overflow:true,runtime_errors:0,intercepted_model_requests:posts.length});
  }catch(error){report.failures.push({posture,error:error.stack,workspace:await page.locator('#aiStatus').textContent(),projection:await page.locator('#ilStateStatus').textContent(),phase:await page.locator('#ilState').getAttribute('data-client-phase')});await page.screenshot({path:path.join(dir,posture+'-failure.png'),fullPage:true});}finally{await context.close();}
 }
 report.status=report.failures.length?'HELD':'PASS';
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve));await fs.writeFile(path.join(dir,'witness.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report));if(report.status!=='PASS')process.exitCode=1;
