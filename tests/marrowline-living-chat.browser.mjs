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
const report={schema:'td613.marrowline.living-chat-browser/v0.4-ios-operator-readiness',status:'HELD',engine,
 source_sha:process.env.TD613_SOURCE_HEAD||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 observed_at:new Date().toISOString(),workflow_run_id:process.env.GITHUB_RUN_ID||null,
 run_attempt:process.env.GITHUB_RUN_ATTEMPT||null,context:'LOCAL_BROWSER_SYNTHETIC_PROVIDER',live_provider_calls:0,checks:[],failures:[]};
const text='  A\u0315\u0300\u0338\u035c\u0361\u0308\u0302\u0301\u0342\u0303  \n\nKhona‌lit-po · 𝌋 · 𐰸  ';
let browser;
try{
 browser=await type.launch({headless:true});
 for(const [posture,viewport,reducedMotion] of [['desktop',{width:1280,height:900},'no-preference'],['mobile-reduced',{width:390,height:844},'reduce']]){
  const page=await browser.newPage({viewport,reducedMotion});page.setDefaultTimeout(12000);
  const errors=[];let posts=0;let gateCalls=0;
  page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/dome-world/khonapolit',async route=>{
   if(route.request().method()==='GET')return route.fulfill({json:{hasGeminiKey:true,modelPolicy:{callableModels:['SYNTHETIC_MODEL']}}});
   posts++;
   const request=route.request().postDataJSON?.()||{};
   if(String(request.message||'').includes('SYNTHETIC HOLD TEST'))return route.fulfill({status:503,json:{ok:false,error:'no-eligible-callable-models'}});
   await route.fulfill({json:{ok:true,text,relay:{apertureHeader:'SYNTHETIC ROUTE · TECHNICAL_RUNTIME_REVIEW',signal:{state:'LOCKED'},parts:[{id:'gemini',label:'Gemini',present:true,text},{id:'khonapolit',label:'Kʰonapolit',present:true,text:'SYNTHETIC COVENANT VOICE'},{id:'tauric-diana-bots',label:'Tauric Diana',present:true,text:text.repeat(5),motif:'synthetic',intensity:3}]},receipt:{provider:{model:'SYNTHETIC_MODEL'},relay:{signal:{state:'LOCKED'}},seal:{state:'OPEN'}}}});
  });
  await page.route('**/api/dome-world/marrowline?*',async route=>{
   gateCalls++;
   const headers=route.request().headers();
   const authorized=headers['x-td613-marrowline-operator']==='SYNTHETIC_OPERATOR';
   const commonHeaders={
    'x-td613-route':authorized?'operator-bypass':'live-marrowline-ingress',
    'x-td613-trap':authorized?'bypass':'absorbing',
    'x-td613-marrowline-live':'synthetic-v1'
   };
   if(authorized)return route.fulfill({status:200,headers:commonHeaders,json:{ok:true,authorized:true,authorization_basis:'server-side-operator-token-match',route:'operator-bypass',aperture_egress:{status:'exact'},reflex_spine:{active_steps:[1,2]}}});
   return route.fulfill({status:200,headers:commonHeaders,json:{status:'absorbing',request_digest:'synthetic-public-digest',matrix:{flattenCostHint:0,layers:[]},aperture_egress:{status:'exact'},reflex_spine:{active_steps:[1,2]}}});
  });
  try{
   await page.goto(`${base}/dome-world/marrowline.html`,{waitUntil:'domcontentloaded'});
   await page.locator('.starter-prompts button').first().waitFor();
   await page.waitForFunction(()=>document.querySelector('#marrowlineLivingGeometry')?.dataset.geometryReady==='true');
   await page.waitForFunction(()=>Boolean(window.__TD613_MARROWLINE_OPERATOR_READINESS__));
   await page.locator('#marrowlineRest').click();
   await page.waitForFunction(()=>document.querySelector('#marrowlineLivingGeometry')?.dataset.pendingFrames==='0');
   assert.equal(posts,0);
   assert.equal(await page.locator('#khonapolitWaive').isChecked(),true,'ordinary workspace starts in explicit unissued research mode');
   assert.equal(await page.locator('#khonapolitMessages').evaluate(e=>e.scrollTop),0,'welcome remains at the top');
   const initial=await page.locator('#khonapolitPrompt').boundingBox();
   assert.ok(initial&&initial.y>=0&&initial.y+initial.height<=viewport.height,'composer is visible on first screen');
   assert.equal(await page.locator('.living-geometry-canvas').count(),1);
   assert.equal(await page.locator('#retryKhonapolitTask').count(),1);
   assert.equal(await page.locator('#copyKhonapolitPortable').count(),1);
   assert.equal(await page.locator('#exportKhonapolitPortable').count(),1);
   assert.equal(await page.locator('#marrowlineOperatorToken').count(),1,'human operator gate token control is installed');
   await page.screenshot({path:path.join(dir,`${posture}-welcome.png`)});
   await page.locator('.starter-prompts button').first().click();
   assert.equal(posts,0,'starter fills without sending');
   if(posture.startsWith('mobile'))assert.equal(await page.locator('.mobile-dock [data-mobile-target="speakingPanel"]').getAttribute('data-active'),'true','mobile speaking view is already active');
   await page.locator('#khonapolitPrompt').fill('SYNTHETIC UI TEST: return the supplied Unicode fixture.');
   if(posture.startsWith('mobile')){
    await page.locator('#khonapolitPrompt').focus();
    await page.setViewportSize({width:390,height:520});
    await page.waitForTimeout(80);
    const keyboardLayout=await page.evaluate(()=>{
     const panel=document.querySelector('#speakingPanel');
     const messages=document.querySelector('#khonapolitMessages');
     const form=document.querySelector('#khonapolitForm');
     const prompt=document.querySelector('#khonapolitPrompt');
     const send=document.querySelector('#khonapolitSend');
     const box=node=>node?.getBoundingClientRect()||{top:0,bottom:0,height:0};
     return {innerHeight,composerActive:document.body.dataset.composerActive,panel:box(panel),messages:box(messages),form:box(form),prompt:box(prompt),send:box(send)};
    });
    assert.equal(keyboardLayout.composerActive,'true','focused mobile composer enters keyboard posture');
    assert.ok(keyboardLayout.form.bottom<=keyboardLayout.innerHeight+2,`composer remains inside shrunken visual chamber (${JSON.stringify(keyboardLayout)})`);
    assert.ok(keyboardLayout.send.bottom<=keyboardLayout.innerHeight+2,'page send control remains reachable above keyboard posture');
    assert.ok(keyboardLayout.messages.height>=72,'keyboard posture retains a usable transcript strip');
    await page.locator('#khonapolitPrompt').press('Enter');
    await page.setViewportSize(viewport);
   }else await page.locator('#khonapolitSend').click();
   await page.waitForFunction(()=>document.querySelector('#khonapolitTerminalStatus')?.textContent.includes('RETURN OBSERVED'));
   assert.equal(posts,1,'blank-workspace task sends directly, including native Enter on mobile');
   assert.equal(await page.locator('#marrowlinePortableActions').isVisible(),true,'portable recovery controls become available after the first operator message');
   if(posture.startsWith('mobile')){
    const mobileLayout=await page.evaluate(()=>{
     const panel=document.querySelector('#speakingPanel');
     const messages=document.querySelector('#khonapolitMessages');
     const form=document.querySelector('#khonapolitForm');
     const portable=document.querySelector('#marrowlinePortableActions');
     return {
      panelHeight:panel?.getBoundingClientRect().height||0,
      transcriptHeight:messages?.getBoundingClientRect().height||0,
      composerHeight:form?.getBoundingClientRect().height||0,
      composerOverflowY:form?getComputedStyle(form).overflowY:'',
      portableHeight:portable?.getBoundingClientRect().height||0
     };
    });
    assert.equal(mobileLayout.composerOverflowY,'auto','mobile composer must own overflow when portable recovery controls expand');
    assert.ok(mobileLayout.transcriptHeight>=mobileLayout.panelHeight*.32,`portable controls must not crush the transcript viewport (${JSON.stringify(mobileLayout)})`);
   }
   assert.equal(await page.locator('.relay-stage-text').first().textContent(),text,'exact marks and whitespace retained');
   assert.equal(await page.locator('.additional-voices').getAttribute('open'),null,'additional voices do not displace the main answer');
   assert.match(await page.locator('.relay-stage-text').first().evaluate(e=>getComputedStyle(e).fontFamily),/system-ui|Segoe UI|Roboto|Noto Sans|Reddit Sans/,'answer uses the Unicode-capable sans stack');
   await page.screenshot({path:path.join(dir,`${posture}-answer-first.png`)});
   await page.locator('.additional-voices > summary').click();
   assert.equal(await page.locator('.relay-bots .relay-stage-text').textContent(),text.repeat(5),'expanded flourishes preserve exact text');
   await page.locator('.return-details > summary').click();
   assert.match(await page.locator('.relay-aperture-header').last().textContent(),/TECHNICAL_RUNTIME_REVIEW/);

   if(posture.startsWith('mobile')){
    await page.locator('.mobile-dock [data-mobile-target="gatePanel"]').click();
    await page.locator('#marrowlineOperatorToken').fill('SYNTHETIC_OPERATOR');
    await page.locator('#marrowlineForm button[type="submit"]').click();
    await page.waitForFunction(()=>document.querySelector('#marrowlineStatus')?.textContent.includes('OPERATOR LIVE'));
    assert.equal(gateCalls,1,'operator fire makes exactly one live ingress request');
    assert.equal(await page.locator('#marrowlineOperatorToken').inputValue(),'','operator token clears before the network return is presented');
    const operatorReceipt=await page.locator('#marrowlineReceipt').textContent();
    assert.match(operatorReceipt,/OPERATOR_AUTHORIZED/);
    assert.doesNotMatch(operatorReceipt,/SYNTHETIC_OPERATOR/,'operator token never enters the receipt');
    assert.match(await page.locator('#marrowlineStatus').textContent(),/AUTHORIZED BY SERVER TOKEN MATCH/);

    await page.locator('#marrowlineForm button[type="submit"]').click();
    await page.waitForFunction(()=>document.querySelector('#marrowlineStatus')?.textContent.includes('LIVE · HTTP 200'));
    assert.equal(gateCalls,2,'blank operator field preserves the canonical public Fire live Marrowline path');
    assert.match(await page.locator('#marrowlineReceipt').textContent(),/LIVE_ABSORBING|LIVE_RESPONSE/);

    await page.locator('.mobile-dock [data-mobile-target="speakingPanel"]').click();
    await page.locator('#khonapolitPrompt').fill('SYNTHETIC HOLD TEST');
    await page.locator('#khonapolitPrompt').press('Enter');
    await page.waitForFunction(()=>document.querySelector('#marrowlineTerminalHold')?.textContent.includes('AI route held'));
    assert.match(await page.locator('#marrowlineTerminalHold').textContent(),/No callable model route was admitted/,'provider failure is visible as transport status rather than silence');
    assert.match(await page.locator('#marrowlineTerminalHold').textContent(),/not a Kʰonapolit or Tauric Diana voice/,'held transport is not laundered into a covenant voice');
   }

   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   assert.deepEqual(errors,[]);
   await page.screenshot({path:path.join(dir,`${posture}-unicode-return.png`)});
   report.checks.push({posture,status:'PASS',composer_visible:true,native_mobile_send:posture.startsWith('mobile'),keyboard_posture_bounded:posture.startsWith('mobile'),ordinary_unissued_entry:true,one_explicit_post:true,exact_unicode:true,route_retrievable:true,portable_controls_present:true,portable_recovery_does_not_crush_transcript:true,human_operator_gate:posture.startsWith('mobile'),public_gate_fire:posture.startsWith('mobile'),visible_transport_hold:posture.startsWith('mobile'),no_horizontal_overflow:true});
  }catch(error){report.failures.push({posture,error:error.stack});await page.screenshot({path:path.join(dir,`${posture}-failure.png`)}).catch(()=>{});}
  finally{await page.close();}
 }
 report.status=report.failures.length?'HELD':'PASS';
}catch(error){report.failures.push({posture:'infrastructure',error:error.stack});}
finally{await browser?.close();await fs.writeFile(path.join(dir,'receipt.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report));if(report.status!=='PASS')process.exitCode=1;
