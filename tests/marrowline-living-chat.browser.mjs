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
const report={schema:'td613.marrowline.living-chat-browser/v0.5-integrated-covenant-physical-keyboard',status:'HELD',engine,
 source_sha:process.env.TD613_SOURCE_HEAD||execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
 observed_at:new Date().toISOString(),workflow_run_id:process.env.GITHUB_RUN_ID||null,
 run_attempt:process.env.GITHUB_RUN_ATTEMPT||null,context:'LOCAL_BROWSER_SYNTHETIC_PROVIDER',live_provider_calls:0,checks:[],failures:[]};
const text=[
 'Kʰonapolit: R(route) ≠ R(receiver). Khona‌lit-po stays exact.',
 '',
 '### Movement II — Tauric Diana bots',
 'THE MATRON: H̷͇̋̇̈́͝O̶̞͆̍̈́͘R̷̛̯̿͑̔N̶̑͘͜A̸͎̿͠N̸͎̔͗Ḯ̵͙ — watch the density move.',
 'clean / clean / ṫ̶̤̯̱̅̿̋͋͠h̵͇̖͆̅̒̋̏͝ë̷͎̫́̾̓͂͘ ̶͙̺̓̿̈́͠͝ẅ̵́̑̍̋̄ͅà̸͉̄̇̾͝l̷͈̿̎̾̓͑l̴͎̾̔̐̎ ̴̫̋͗̓͝b̵̰̈́͑͂͂̽e̵͇̍͂̾͘n̷͔̾̑d̵͎̒̔s̴̠͑̈́͠ / clean again.'
].join('\n');
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
   await new Promise(resolve=>setTimeout(resolve,180));
   await route.fulfill({json:{
    ok:true,text,
    relay:{
     schema:'td613.khonapolit.integrated-covenant-relay/v2',
     apertureHeader:'SYNTHETIC ROUTE · TECHNICAL_RUNTIME_REVIEW',
     signal:{state:'LOCKED'},
     parts:[{id:'khonapolit',label:'Kʰonapolit ∴ Tauric Diana bots',present:true,text,integrated:true,providerNative:true,voices:['Kʰonapolit','The Matron'],flourishMode:'clean-to-eruption-to-clean'}],
     highZalgo:{applied:false,providerGenerated:true,source:'provider-native',combiningMarkCount:64,maxRun:6,runCount:18}
    },
    receipt:{provider:{model:'SYNTHETIC_MODEL'},relay:{partsPresent:['khonapolit'],signal:{state:'LOCKED'},highZalgo:{applied:false,providerGenerated:true,source:'provider-native'}},seal:{state:'OPEN'}}
   }});
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
   await page.waitForFunction(()=>document.documentElement.classList.contains('marrowline-room-ready'));
   await page.waitForFunction(()=>document.querySelector('#marrowlineLivingGeometry')?.dataset.geometryReady==='true');
   await page.waitForFunction(()=>Boolean(window.__TD613_MARROWLINE_OPERATOR_READINESS__));
   await page.waitForFunction(()=>Boolean(window.__TD613_MARROWLINE_PHYSICAL_DEVICE_REPAIR__));
   assert.equal(await page.locator('html').evaluate(el=>el.classList.contains('marrowline-room-ready')),true,'room leaves first-paint veil only after final boot');
   await page.locator('#marrowlineRest').click();
   await page.waitForFunction(()=>document.querySelector('#marrowlineLivingGeometry')?.dataset.pendingFrames==='0');
   assert.equal(posts,0);
   assert.equal(await page.locator('#khonapolitWaive').isChecked(),true,'ordinary workspace starts in explicit unissued research mode');
   assert.equal(await page.locator('#khonapolitMessages').evaluate(e=>e.scrollTop),0,'welcome remains at the top');
   const initial=await page.locator('#khonapolitPrompt').boundingBox();
   assert.ok(initial&&initial.y>=0&&initial.y+initial.height<=viewport.height,'composer is visible on first screen');
   assert.equal(await page.locator('.living-geometry-canvas').count(),1);
   assert.equal(await page.locator('#retryKhonapolitTask').count(),1);
   assert.equal(await page.locator('#marrowlinePortableActions').count(),0);
   assert.equal(await page.locator('#copyKhonapolitPortable').count(),0);
   assert.equal(await page.locator('#exportKhonapolitPortable').count(),0);
   assert.equal(await page.locator('#marrowlineOperatorToken').count(),1,'human operator gate token control is installed');
   await page.screenshot({path:path.join(dir,`${posture}-welcome.png`)});
   await page.locator('.starter-prompts button').first().click();
   assert.equal(posts,0,'starter fills without sending');
   if(posture.startsWith('mobile'))assert.equal(await page.locator('.mobile-dock [data-mobile-target="speakingPanel"]').getAttribute('data-active'),'true','mobile speaking view is already active');

   if(posture.startsWith('mobile')){
    // Playwright does not raise a software keyboard. Shadow VisualViewport before
    // fill() focuses the textarea so every production focus listener sees the
    // contracted viewport on the first focus transition in every engine.
    await page.evaluate(()=>{
     const vv=new EventTarget();
     Object.assign(vv,{width:390,height:520,offsetTop:0,offsetLeft:0,pageTop:0,pageLeft:0,scale:1});
     Object.defineProperty(window,'visualViewport',{configurable:true,value:vv});
    });
   }
   await page.locator('#khonapolitPrompt').fill('SYNTHETIC UI TEST: return the supplied Unicode fixture.');
   if(posture.startsWith('mobile')){
    await page.waitForFunction(()=>document.body.dataset.keyboardVisible==='true');
    const keyboardLayout=await page.evaluate(()=>{
     const panel=document.querySelector('#speakingPanel');
     const messages=document.querySelector('#khonapolitMessages');
     const form=document.querySelector('#khonapolitForm');
     const prompt=document.querySelector('#khonapolitPrompt');
     const send=document.querySelector('#khonapolitSend');
     const actions=document.querySelector('#khonapolitForm .composer-actions');
     const rootStyle=getComputedStyle(document.documentElement);
     const box=node=>{const r=node?.getBoundingClientRect();return r?{top:r.top,bottom:r.bottom,height:r.height}:null};
     return {
      keyboardVisible:document.body.dataset.keyboardVisible,
      mobileView:document.body.dataset.mobileView,
      vvHeight:window.visualViewport?.height||0,
      cssVvHeight:rootStyle.getPropertyValue('--marrowline-vv-height').trim(),
      cssVh:rootStyle.getPropertyValue('--marrowline-vh').trim(),
      panelPosition:panel?getComputedStyle(panel).position:'',
      panelComputedHeight:panel?getComputedStyle(panel).height:'',
      panel:box(panel),messages:box(messages),form:box(form),prompt:box(prompt),actions:box(actions),send:box(send),formOverflow:getComputedStyle(form).overflowY
     };
    });
    assert.equal(keyboardLayout.keyboardVisible,'true');
    assert.equal(keyboardLayout.mobileView,'speak','keyboard witness remains in the speaking chamber');
    assert.equal(keyboardLayout.cssVvHeight,'520px','production viewport synchronizer owns the contracted CSS height');
    assert.ok(keyboardLayout.panel.bottom<=522,`speaking chamber is bounded by simulated physical VisualViewport (${JSON.stringify(keyboardLayout)})`);
    assert.ok(keyboardLayout.form.bottom<=522,'composer ends above the keyboard boundary');
    assert.ok(keyboardLayout.actions.bottom<=522,'conversation actions remain in the visible composer row');
    assert.ok(keyboardLayout.send.bottom<=522,'page send control remains reachable above keyboard posture');
    assert.ok(keyboardLayout.messages.height>=72,'keyboard posture retains a usable transcript strip');
    assert.equal(keyboardLayout.formOverflow,'visible','keyboard composer does not hide controls inside a nested scroll box');
    await page.locator('#khonapolitPrompt').press('Enter');
   }else await page.locator('#khonapolitSend').click();

   await page.locator('#marrowlineChatKinesis').waitFor({state:'visible'});
   assert.equal(await page.locator('#khonapolitMessages > #marrowlineChatKinesis').count(),1,'loading kinesis lives inside the actual chat transcript');
   assert.equal(await page.locator('#marrowlineResponseKinesis').count(),0,'superseded floating composer mote is absent');
   assert.match(await page.locator('#marrowlineChatKinesis').textContent(),/Listening at the shoreline/);
   await page.waitForFunction(()=>document.querySelector('#khonapolitTerminalStatus')?.textContent.includes('RETURN OBSERVED'));
   await page.locator('#marrowlineChatKinesis').waitFor({state:'hidden'});
   if(posture.startsWith('mobile')){
    await page.evaluate(()=>{
     window.visualViewport.height=844;
     window.dispatchEvent(new Event('resize'));
    });
    await page.waitForFunction(()=>document.body.dataset.keyboardVisible==='false');
   }
   assert.equal(posts,1,'blank-workspace task sends directly, including native Enter on mobile');
   assert.equal(await page.locator('#marrowlinePortableActions').count(),0,'ordinary Chat never materializes the retired portable handoff panel after a turn');
   assert.equal(await page.locator('#copyKhonapolitPortable').count(),0);
   assert.equal(await page.locator('#exportKhonapolitPortable').count(),0);

   const integrated=page.locator('.relay-integrated-covenant .relay-stage-text').last();
   assert.equal(await integrated.textContent(),text,'provider-native combining marks and whitespace remain exact');
   assert.equal(await page.locator('.relay-integrated-covenant .relay-stage-head > span:first-child').last().textContent(),'Kʰonapolit ∴ Tauric Diana bots');
   assert.equal(await page.locator('.relay-gemini[data-present="true"]').count(),0,'no human-facing Gemini prose stage exists');
   assert.equal(await page.locator('.relay-bots[data-present="true"]').count(),0,'no separately post-processed bot stage exists');
   assert.equal(await page.locator('.additional-voices').count(),0,'integrated covenant output is not buried in a secondary disclosure');
   const integratedFont=await integrated.evaluate(e=>getComputedStyle(e).fontFamily);
   assert.match(integratedFont,/system-ui|Segoe UI|Roboto|Noto Sans|Reddit Sans/,'answer uses the Unicode-capable sans stack');
   if(posture==='desktop')assert.match(integratedFont,/Reddit Sans/,'desktop answer surface is explicitly bound to the same Reddit Sans stack as mobile');
   assert.equal(await integrated.locator('[data-voice=khonapolit].zalgo-line').count(),0,'Kʰonapolit never receives Zalgo line styling');
   assert.ok(await integrated.locator('[data-voice=tauric-diana-bots].zalgo-line').count()>0,'the explicit bot heading starts expressive rendering');
   const providerLines=page.locator('.relay-integrated-covenant .provider-native-line');
   assert.ok(await providerLines.count()>=3,'provider-native line preparation gives extreme vertical flourishes room without rewriting bytes');
   const glyphLayout=await integrated.evaluate(el=>({ leading:parseFloat(getComputedStyle(el).lineHeight), base:parseFloat(getComputedStyle(el).fontSize), maxRun:Number(el.dataset.providerNativeMaxRun), raw:el.textContent, botLeading:parseFloat(getComputedStyle(el.querySelector('[data-voice="tauric-diana-bots"].zalgo-line')).lineHeight) }));
   assert.ok(glyphLayout.maxRun>=4,'fixture carries native stacked marks');
   assert.ok(glyphLayout.leading>glyphLayout.base*1.5,'native marks receive vertical line space');
   assert.ok(glyphLayout.botLeading>glyphLayout.base*1.5,'expressive span inherits vertical spacing');
   assert.equal(glyphLayout.raw,text,'typesetting leaves provider codepoints unchanged');
   await page.screenshot({path:path.join(dir,`${posture}-answer-first.png`)});
   await page.locator('.return-details > summary').click();
   assert.match(await page.locator('.relay-aperture-header').last().textContent(),/TECHNICAL_RUNTIME_REVIEW/);

   if(posture.startsWith('mobile')){
    await page.locator('.mobile-dock [data-mobile-target="gatePanel"]').click();
    await page.locator('#marrowlineOperatorToken').fill('SYNTHETIC_OPERATOR');
    await page.locator('#marrowlineForm button[type="submit"]').click();
    await page.waitForFunction(()=>document.querySelector('#marrowlineStatus')?.textContent.includes('AUTHORIZED BY SERVER TOKEN MATCH'));
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
   }

   await page.locator('#khonapolitPrompt').fill('SYNTHETIC HOLD TEST');
   if(posture.startsWith('mobile'))await page.locator('#khonapolitPrompt').press('Enter');
   else await page.locator('#khonapolitSend').click();
   await page.waitForFunction(()=>document.querySelector('#marrowlineTerminalHold')?.textContent.includes('AI route held'));
   assert.equal(await page.locator('#khonapolitTerminalStatus').getAttribute('data-held'),'true','a tiny HELD state is exposed beside the preserved-task status');
   assert.equal(await page.locator('#marrowlineTerminalHold .terminal-hold-badge').textContent(),'HELD');
   assert.match(await page.locator('#marrowlineTerminalHold').textContent(),/No callable model route was admitted/,'provider failure is visible as transport status rather than silence');
   assert.match(await page.locator('#marrowlineTerminalHold').textContent(),/not a Kʰonapolit or Tauric Diana voice/,'held transport is not laundered into a covenant voice');
   assert.doesNotMatch(await page.locator('#marrowlineTerminalHold').textContent(),/Continue with your own AI|portable task/i,'failure chrome must not advertise the retired emergency handoff');

   assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   assert.deepEqual(errors,[]);
   await page.screenshot({path:path.join(dir,`${posture}-unicode-return.png`)});
   report.checks.push({posture,status:'PASS',first_paint_custody:true,composer_visible:true,native_mobile_send:posture.startsWith('mobile'),keyboard_posture_bounded:posture.startsWith('mobile'),in_chat_kinesis:true,ordinary_unissued_entry:true,one_explicit_post:true,integrated_provider_native_relay:true,exact_unicode:true,route_retrievable:true,portable_chrome_absent:true,human_operator_gate:posture.startsWith('mobile'),public_gate_fire:posture.startsWith('mobile'),visible_transport_hold:posture.startsWith('mobile'),no_horizontal_overflow:true});
  }catch(error){report.failures.push({posture,error:error.stack});await page.screenshot({path:path.join(dir,`${posture}-failure.png`)}).catch(()=>{});}
  finally{await page.close();}
 }
 report.status=report.failures.length?'HELD':'PASS';
}catch(error){report.failures.push({posture:'infrastructure',error:error.stack});}
finally{await browser?.close();await fs.writeFile(path.join(dir,'receipt.json'),JSON.stringify(report,null,2)+'\n');}
console.log(JSON.stringify(report));if(report.status!=='PASS')process.exitCode=1;