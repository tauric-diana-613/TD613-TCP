/**
 * RGI09 · Real GPU shader qualification when Chromium software WebGL2 is
 * available. Distinguishes actual WebGL2 execution from the beautiful but
 * computationally separate Canvas2D engine. No claim is inferred from CSS.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const url='http://127.0.0.1:6130/encyclopedia/vix-cyb.html';
const dir=path.resolve('artifacts/vixen-browser-witness');
await mkdir(dir,{recursive:true});
const receipt={
 schema:'emstd613.vixen.rgi09.real-webgl-candidate/v1',
 head,classification:'HELD_NOT_RUN',renderer:'UNKNOWN',gpu_context_offered:false,
 source_estate:'EMSTD613',shader_compilation:'UNESTABLISHED',
 external_empirical_credit:0,operator_approval:'RESERVED'
};
let browser;
try{
 browser=await chromium.launch({headless:true,args:[
  '--enable-webgl','--use-gl=angle','--use-angle=swiftshader',
  '--enable-unsafe-swiftshader','--disable-gpu-sandbox'
 ]});
 const page=await browser.newPage({viewport:{width:1440,height:900},deviceScaleFactor:1});
 const errors=[];
 page.on('pageerror',err=>errors.push(err.message));
 const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
 assert.equal(response?.status(),200);
 await page.locator('#menuToggle').click();
 await page.locator('#mobileNav button[data-view="observatory"]').click();
 await page.waitForFunction(()=>{
  const api=window.VIXEN_ELECTRIC_FOUNDRY;
  return api&&api.status().backend!=='PENDING';
 },null,{timeout:25000});
 const result=await page.evaluate(()=>{
  const offered=Boolean(document.createElement('canvas').getContext('webgl2'));
  const status=window.VIXEN_ELECTRIC_FOUNDRY.status();
  const canvas=document.querySelector('#vixenElectricFoundry .ef-canvas');
  return {offered,status,fieldSize:[canvas.width,canvas.height]};
 });
 receipt.gpu_context_offered=result.offered;
 receipt.renderer=result.status.backend;
 receipt.field_dimensions=result.fieldSize;
 receipt.shader_failure=result.status.renderer?.shader_failure||null;
 receipt.backend_refusal_events=(result.status.history||[]).filter(x=>
  /GPU|RENDER|FOUNDRY/.test(x.event||'')).slice(-12);
 if(!receipt.shader_failure&&receipt.backend_refusal_events.length){
  receipt.shader_failure=receipt.backend_refusal_events
   .map(x=>x.reason||x.event).join(' | ').slice(0,2400);
 }
 if(result.offered){
  assert.equal(result.status.backend,'WEBGL2_COMPUTED_CAUSTICS',
   'WebGL2 available but live authored shader fell back: '+receipt.shader_failure);
  assert(result.status.frames>=1,'Renderer must draw a real frame');
  assert.equal(errors.length,0,'WebGL runtime errors: '+errors.join(' | '));
  receipt.classification='WEBGL2_SHADER_EXECUTED';
  receipt.shader_compilation='RUNTIME_COMPILE_AND_LINK_PASS';
  await page.evaluate(()=>{
   const n=document.querySelector('#vixenElectricFoundry .ef-stage');
   scrollTo({top:Math.max(0,scrollY+n.getBoundingClientRect().top-118),behavior:'instant'});
  });
  await page.waitForTimeout(120);
  await page.screenshot({path:path.join(dir,'vixen-1440x900-real-webgl2-canary.png')});
 }else{
  receipt.classification='HELD_WEBGL2_UNAVAILABLE_IN_CI';
  receipt.shader_compilation='NOT_TESTED_BY_THIS_RUNTIME';
 }
 console.log(JSON.stringify(receipt));
}catch(err){
 receipt.classification='HELD_TEST_ERROR';
 receipt.error=String(err?.message||err).slice(0,1500);
 console.error(JSON.stringify(receipt));
 // A missing software GPU is acceptable. Failed compilation on an
 // available GPU is not: it signals a broken renderer even with fallback.
 if(receipt.gpu_context_offered)process.exitCode=1;
}finally{
 await writeFile(path.join(dir,'webgl2-canary.json'),JSON.stringify(receipt,null,2)+'\n');
 await browser?.close();
}
