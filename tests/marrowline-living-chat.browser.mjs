/** Real local browser UI; synthetic provider response, zero live generation. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { chromium, firefox, webkit } from 'playwright';
const engine=process.env.TD613_BROWSER||'chromium';
const type={chromium,firefox,webkit}[engine];
if(!type)throw new Error('Unknown browser');
const base=process.env.TD613_BASE_URL||'http://127.0.0.1:6130';
if(!['127.0.0.1','localhost'].includes(new URL(base).hostname))throw new Error('Local fixture only');
const dir=process.env.TD613_ARTIFACT_DIR||`artifacts/marrowline-living-chat/${engine}`;
await fs.mkdir(dir,{recursive:true});
const report={schema:'td613.marrowline.living-chat-browser/v0.1',status:'HELD',engine,
 source_sha:process.env.TD613_SOURCE_HEAD||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 observed_at:new Date().toISOString(),workflow_run_id:process.env.GITHUB_RUN_ID||null,
 run_attempt:process.env.GITHUB_RUN_ATTEMPT||null,context:'LOCAL_BROWSER_SYNTHETIC_PROVIDER',live_provider_calls:0,checks:[],failures:[]};
const text='  A\u0315\u0300\u0338\u035c\u0361\u0308\u0302\u0301\u0342\u0303  \n\nKhona‌lit-po · 𝌋 · 𐰸  ';
let browser;
try{
 browser=await type.launch({headless:true});
 for(const [posture,viewport,reducedMotion] of [['desktop',{width:1280,height:900},'no-preference'],['mobile-reduced',{width:390,height:844},'reduce']]){
  const page=await browser.newPage({viewport,reducedMotion});page.setDefaultTimeout(12000);
  const errors=[];let posts=0;
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/dome-world/khonapolit',async route=>{
   if(route.request().method()==='GET')return route.fulfill({json:{hasGeminiKey:true,modelPolicy:{callableModels:['SYNTHETIC_MODEL']}}});
   posts++;
   await route.fulfill({json:{ok:true,text,relay:{apertureHeader:'SYNTHETIC ROUTE · TECHNICAL_RUNTIME_REVIEW',signal:{state:'NOT_LOCKED'},parts:[{id:'gemini',label:'Gemini',present:true,text},{id:'khonapolit',label:'Kʰonapolit',present:false,text:''},{id:'tauric-diana-bots',label:'Tauric Diana',present:false,text:''}]},receipt:{provider:{model:'SYNTHETIC_MODEL'},seal:{state:'OPEN'}}}});
  });
  try{
   await page.goto(`${base}/dome-world/marrowline.html`,{waitUntil:'domcontentloaded'});
   await page.locator('.starter-prompts button').first().waitFor();
   await page.waitForFunction(()=>document.querySelector('#marrowlineLivingGeometry')?.dataset.pendingFrames==='0');
   assert.equal(posts,0);
   const initial=await page.locator('#khonapolitPrompt').boundingBox();
   assert.ok(initial&&initial.y>=0&&initial.y+initial.height<=viewport.height,'composer is visible on first screen');
   assert.equal(await page.locator('.living-geometry-canvas').count(),1);
   await page.screenshot({path:path.join(dir,`${posture}-welcome.png`)});
   await page.locator('.starter-prompts button').first().click();
   assert.equal(posts,0,'starter fills without sending');
   await page.locator('#khonapolitSend').click();
   assert.equal(posts,0,'no implicit waiver');
   await page.locator('#khonapolitWaive').check();
   if(posture.startsWith('mobile'))await page.locator('.mobile-dock [data-mobile-target="speakingPanel"]').click();
   await page.locator('#khonapolitPrompt').fill('SYNTHETIC UI TEST: return the supplied Unicode fixture.');
   await page.locator('#khonapolitSend').click();
   await page.waitForFunction(()=>document.querySelector('#khonapolitTerminalStatus')?.textContent.includes('RETURN OBSERVED'));
   assert.equal(posts,1);
   assert.equal(await page.locator('.relay-stage-text').first().textContent(),text,'exact marks and whitespace retained');
   await page.locator('.return-details > summary').click();
   assert.match(await page.locator('.relay-aperture-header').last().textContent(),/TECHNICAL_RUNTIME_REVIEW/);
   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   assert.deepEqual(errors,[]);
   await page.screenshot({path:path.join(dir,`${posture}-unicode-return.png`)});
   report.checks.push({posture,status:'PASS',composer_visible:true,one_explicit_post:true,exact_unicode:true,route_retrievable:true,no_horizontal_overflow:true});
  }catch(error){report.failures.push({posture,error:error.stack});await page.screenshot({path:path.join(dir,`${posture}-failure.png`)}).catch(()=>{});}
  finally{await page.close();}
 }
 report.status=report.failures.length?'HELD':'PASS';
}catch(error){report.failures.push({posture:'infrastructure',error:error.stack});}
finally{await browser?.close();await fs.writeFile(path.join(dir,'receipt.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report));if(report.status!=='PASS')process.exitCode=1;
