import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';
const base='http://127.0.0.1:6130/encyclopedia/vix-cyb.html';
const dest='artifacts/vixen-browser-witness';
await mkdir(dest,{recursive:true});
const browser=await chromium.launch({headless:true});
const go=async page=>{
 await page.goto(base,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>window.VixenAIModes?.mounted===true&&
  window.VixenComparativeFieldTrial?.mounted===true,null,{timeout:25000});
 await page.evaluate(()=>{
  const nav=document.querySelector('#vixenRoomRail [data-view="collection"]')||
   document.querySelector('button[data-view="collection"]');
  if(!nav)throw Error('NO_ORIGINAL_COLLECTION_NAVIGATION');
  nav.click();
 });
 await page.locator('#view-collection:not([hidden])').waitFor({timeout:16000});
};
const ids=['emwork_dd9a66eba0e2dde8e29f00f6','emwork_f2c89864337f162e88991e28'];
try{
 const ctx=await browser.newContext({viewport:{width:1440,height:900},
  reducedMotion:'reduce',acceptDownloads:true});
 const page=await ctx.newPage(),jsErrors=[];
 page.on('pageerror',e=>jsErrors.push(e.message));
 await go(page);
 assert.equal(await page.locator('#vmaComparativeFieldLab').isVisible(),false,
  'Field trial cannot be active before a real visitor locks Maestro role');
 await page.locator('[data-vma-role="MAESTRO"]').click();
 await page.locator('#vmaStart').click();
 await page.locator('#vmaComparativeFieldLab').waitFor({state:'visible',timeout:15000});
 assert.equal(await page.evaluate(()=>window.VixenComparativeFieldTrial.status().role_active),true);
 const selects=page.locator('#vmaComparativeFieldLab select.vf-input');
 await selects.nth(0).selectOption(ids[0]);
 await selects.nth(1).selectOption(ids[0]);
 await page.locator('#vmaComparativeFieldLab input.vf-input').fill('Test source identity, not semantic resemblance');
 await page.getByRole('button',{name:'Run the two research routes'}).click();
 await page.waitForFunction(()=>window.VixenComparativeFieldTrial.status().phase==='SETUP',null,{timeout:25000});
 assert.match(await page.locator('#vmaComparativeFieldLab .vf-error').innerText(),/two distinct original/i);
 await selects.nth(1).selectOption(ids[1]);
 await page.getByRole('button',{name:'Run the two research routes'}).click();
 await page.waitForFunction(()=>window.VixenComparativeFieldTrial.status().phase==='REVIEW',null,{timeout:50000});
 assert.equal(await page.locator('#vmaComparativeFieldLab .vf-method').count(),2);
 assert.equal(await page.locator('#vmaComparativeFieldLab .vf-source').count(),2);
 assert.equal(await page.locator('[name=trustworthy] option[value=TIE]').textContent(),
  'Equally trustworthy');
 assert.equal(await page.locator('[name=trustworthy] option[value=NEITHER]').textContent(),
  'Neither was trustworthy');
 assert.doesNotMatch(await page.locator('#vmaComparativeFieldLab').innerText(),/\b(?:Wendbine|SignalRupture|SRC_ATELIER)\b/,
  'Machine method names cannot leak into visitor presentation');
 const userView=await page.evaluate(()=>window.VixenComparativeFieldTrial.status());
 assert.equal(userView.original_python_host_executed,false);
 assert.equal(userView.method_parity,'HELD_UNPROVEN');
 // Confirm real Work reader responds to the visitor click without losing trial state.
 await page.getByRole('button',{name:'Read this original Work'}).first().click();
 await page.locator('#view-works:not([hidden])').waitFor({timeout:15000});
 assert.equal(await page.locator('#worksExperimentAReaderMount').getAttribute('data-work-id'),ids[0]);
 await page.locator('#vmaJourneyDock').click();
 await page.locator('#view-collection:not([hidden])').waitFor({timeout:15000});
 // Provide deliberate fake evidence. The validator must refuse it even when other judgments are filled.
 const extracts=await page.evaluate(async ids=>{
  const catalogue=JSON.parse(document.getElementById('vixen-corpus-bundle').textContent);
  const data=await import('./vixen-estate/corpus-experiment-a.mjs');
  const selections=[];
  for(const id of ids){
   const idx=catalogue.works.findIndex(w=>w.work_id===id),w=catalogue.works[idx];
   const s=w.linked_sources[0];
   const r=await data.loadExperimentABodyBySourceId(s.source_file_id,
    {hintShard:data.shardForWorkIndex(idx)});
   if(r.body_sha256_verified!==true)throw Error('EXCERPT_SOURCE_NOT_VERIFIED');
   selections.push(r.text_body.slice(0,100));
  }
  return selections;
 },ids);
 await page.locator('[name=excerpt_0]').fill('I invented this passage; it never occurred in the verified source.');
 await page.locator('[name=excerpt_1]').fill(extracts[1]);
 await page.locator('[name=useful]').selectOption('DOCUMENTARY');
 await page.locator('[name=trustworthy]').selectOption('NEITHER');
 await page.locator('[name=rationale]').fill('The documentary method provided a useful route, but both are only proposals requiring original-text evidence.');
 await page.locator('[name=contradiction]').fill('One inferred source relation fails when the actual manuscript passage is inspected closely.');
 await page.locator('[name=next_action]').fill('Find the independent text passage and test the conflicting explanation against the same source anchor.');
 await page.evaluate(()=>window.dispatchEvent(new CustomEvent('vixen-maestro-session-state',
  {detail:{active:true,role:'MAESTRO'}})));
 assert.match(await page.locator('[name=next_action]').inputValue(),/independent text passage/);
 assert.equal(await page.evaluate(()=>window.VixenComparativeFieldTrial.draftStatus().has_unsent_draft),true);
 await page.getByRole('button',{name:'Record my comparison and export receipt'}).click();
 await page.waitForFunction(()=>document.querySelector('#vmaComparativeFieldLab .vf-status')?.textContent?.includes('HELD_JUDGMENT_PASSAGE_NOT_IN_VERIFIED_BODY'),null,{timeout:15000});
 assert.equal(await page.evaluate(()=>window.VixenComparativeFieldTrial.status().report_recorded),false);
 await page.locator('[name=excerpt_0]').fill(extracts[0]);
 await page.getByRole('button',{name:'Record my comparison and export receipt'}).click();
 await page.waitForFunction(()=>window.VixenComparativeFieldTrial.status().phase==='RECEIPT',null,{timeout:25000});
 const receipt=await page.evaluate(()=>window.VixenComparativeFieldTrial.copyLocalReceipt());
 assert.equal(receipt.schema,'td613.vixen.human-operator-comparative-field-session/v1');
 assert.equal(receipt.operator_report.source_passage_exact_match_count,2);
 assert.equal(receipt.operator_report.science_credit,0);
 assert.equal(receipt.original_native_python_execution_in_browser,false);
 assert.equal(receipt.real_public_native_wendbine_engine_execution_in_browser,false);
 assert.equal(receipt.no_network_submission,true);
 assert.equal(receipt.engine_methods.source_works.length,2);
 assert.equal(receipt.operator_report.useful_method,'DOCUMENTARY');
 const takeDownload=page.waitForEvent('download');
 await page.getByRole('button',{name:/Save the complete research receipt/}).click();
 const downloaded=await takeDownload;
 assert.match(downloaded.suggestedFilename(),/vixen-human-comparative-field-receipt\.json/);
 await page.screenshot({path:dest+'/vixen-human-research-trial-desktop-1440.png',
  animations:'disabled',fullPage:false});
 await page.locator('#vmaEnd').click();
 assert.equal(await page.locator('#vmaComparativeFieldLab').isVisible(),false);
 await page.locator('[data-vma-role="COMPOSER"]').click();
 await page.locator('#vmaStart').click();
 assert.equal(await page.locator('#vmaComparativeFieldLab').isVisible(),false);
 assert.equal(await page.evaluate(()=>window.VixenComparativeFieldTrial.status().report_recorded),false,
  'Field trial must zeroize browser state when the role terminates');
 // Privacy regression: an unsent question in SETUP must be forgotten on exit.
 await page.locator('#vmaEnd').click();
 await page.locator('[data-vma-role="MAESTRO"]').click();
 await page.locator('#vmaStart').click();
 await page.locator('#vmaComparativeFieldLab').waitFor({state:'visible',timeout:15000});
 const setup=page.locator('#vmaComparativeFieldLab');
 const originalSources=await setup.locator('select.vf-input').evaluateAll(xs=>xs.map(x=>x.value));
 await setup.locator('input.vf-input').fill('Private unsent source question should disappear on role exit');
 await setup.locator('select.vf-input').nth(0).selectOption(
  originalSources[0]===ids[0]?ids[1]:ids[0]);
 assert.equal(await page.evaluate(()=>window.VixenComparativeFieldTrial.draftStatus().has_unsent_draft),true);
 page.once('dialog',async dialog=>{assert.match(dialog.message(),/unsent drafts/i);await dialog.dismiss();});
 await page.locator('#vmaEnd').click();
 assert.equal(await page.evaluate(()=>window.VixenAIModes.status().result.active),true);
 page.once('dialog',dialog=>dialog.accept());
 await page.locator('#vmaEnd').click();
 assert.equal(await setup.isVisible(),false);
 await page.locator('[data-vma-role="MAESTRO"]').click();
 await page.locator('#vmaStart').click();
 await setup.waitFor({state:'visible',timeout:15000});
 assert.equal(await setup.locator('input.vf-input').inputValue(),'');
 assert.deepEqual(await setup.locator('select.vf-input').evaluateAll(xs=>xs.map(x=>x.value)),
  originalSources,'Role exit must revoke unsent source selections');
 assert.deepEqual(jsErrors,[]);
 await ctx.close();
 const mobile=await browser.newContext({viewport:{width:390,height:844},
  isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const phone=await mobile.newPage(),phoneErrors=[];
 phone.on('pageerror',e=>phoneErrors.push(e.message));
 await go(phone);
 await phone.locator('[data-vma-role="MAESTRO"]').click();
 await phone.locator('#vmaStart').click();
 await phone.locator('#vmaComparativeFieldLab').waitFor({state:'visible',timeout:20000});
 const panel=phone.locator('#vmaComparativeFieldLab');
 const overflow=await panel.evaluate(x=>({scrollWidth:x.scrollWidth,clientWidth:x.clientWidth,
  windowWidth:innerWidth,width:x.getBoundingClientRect().width}));
 assert(overflow.scrollWidth<=overflow.clientWidth+2,
  'Mobile human-trial horizontal overflow: '+JSON.stringify(overflow));
 await phone.screenshot({path:dest+'/vixen-human-research-trial-mobile-390.png',
  animations:'disabled',fullPage:false});
 assert.deepEqual(phoneErrors,[]);
 await mobile.close();
 console.log('VIXEN_REAL_VISITOR_READY field-trial UI: desktop method execution, passage challenge, receipt, mobile responsive; humans not simulated as empirically observed');
}finally{await browser.close()}
