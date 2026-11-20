import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {mkdir} from 'node:fs/promises';

const dest='artifacts/vixen-browser-witness';
await mkdir(dest,{recursive:true});
const browser=await chromium.launch({headless:true});
const url='http://127.0.0.1:6130/encyclopedia/vix-cyb.html';
const ids=['emwork_dd9a66eba0e2dde8e29f00f6','emwork_f2c89864337f162e88991e28'];
const open=async page=>{
 await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
 await page.waitForFunction(()=>window.VixenSourceChallenge?.mounted===true&&
  window.VixenAIModes?.mounted===true,null,{timeout:30000});
 await page.evaluate(()=>{
  const nav=document.querySelector('#vixenRoomRail [data-view="collection"]')||
   document.querySelector('button[data-view="collection"]');
  if(!nav)throw Error('SOURCE_EXPEDITION_NO_COLLECTION_ROOM');
  nav.click();
 });
 await page.locator('#view-collection:not([hidden])').waitFor({timeout:18000});
};
const role=async page=>{
 await page.locator('[data-vma-role="MAESTRO"]').click();
 await page.locator('#vmaStart').click();
 await page.locator('#vmaSourceChallenge').waitFor({state:'visible',timeout:18000});
};
async function fillEvidence(page,form){
 const snippets=await page.evaluate(async ids=>{
  const catalogue=JSON.parse(document.getElementById('vixen-corpus-bundle').textContent);
  const m=await import('./vixen-estate/corpus-experiment-a.mjs');
  const out=[];
  for(const id of ids){
   const i=catalogue.works.findIndex(w=>w.work_id===id),w=catalogue.works[i],s=w.linked_sources[0];
   const r=await m.loadExperimentABodyBySourceId(s.source_file_id,{hintShard:m.shardForWorkIndex(i)});
   if(r?.body_sha256_verified!==true)throw Error('SOURCE_NOT_VERIFIED');
   out.push(r.text_body.slice(0,110));
  }
  return out;
 },ids);
 for(let i=0;i<2;i++)await form.locator('[name=excerpt_'+i+']').fill(snippets[i]);
 const fields={
  entities:'These manuscripts refer to separately identifiable entities requiring source checks.',
  operators:'The proposed relation needs exact operators and transformations in the original sections.',
  boundary_conditions:'The assumptions and applicability conditions may differ between the two manuscripts.',
  predicted_consequences:'Specify an outcome whose predicted value changes under the two models.',
  field_generic_rival:'The similarity could follow from standard field vocabulary and shared upstream references.',
  non_metaphorical_rule:'Define the underlying formal transformations without metaphorical labels.',
  disconfirming_observation:'A reproducible opposing observation would expose incompatible predicted outputs.',
  next_source_action:'Inspect the original equation definitions and matched-control literature.'
 };
 for(const [name,value]of Object.entries(fields))await form.locator('[name='+name+']').fill(value);
 return snippets;
}
try{
 const desktop=await browser.newContext({viewport:{width:1440,height:900},
  reducedMotion:'reduce',acceptDownloads:true});
 const page=await desktop.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await open(page);
 assert.equal(await page.locator('#vmaSourceChallenge').isVisible(),false);
 await role(page);
 let panel=page.locator('#vmaSourceChallenge');
 assert.equal(await page.evaluate(()=>window.VixenSourceChallenge.status().phase),'SETUP');
 assert.equal(await panel.locator('.ve-steps .ve-step').count(),4);
 const options=panel.locator('select.ve-control');
 await options.nth(0).selectOption(ids[0]);
 await options.nth(1).selectOption(ids[0]);
 await panel.locator('input.ve-control').fill('Which formal mechanism is shared by the two original source manuscripts?');
 await panel.getByRole('button',{name:'Inspect the two original sources'}).click();
 await page.waitForFunction(()=>window.VixenSourceChallenge.status().phase==='SETUP',
  null,{timeout:30000});
 assert.match(await panel.locator('.ve-error').innerText(),/two different original Works/i);
 await options.nth(1).selectOption(ids[1]);
 await panel.getByRole('button',{name:'Inspect the two original sources'}).click();
 await page.waitForFunction(()=>window.VixenSourceChallenge.status().phase==='SOURCE',
  null,{timeout:45000});
 assert.equal(await panel.locator('.ve-source').count(),2);
 assert.equal(await panel.locator('.ve-passage').count(),2);
 assert.equal(await page.evaluate(()=>window.VixenSourceChallenge.status().original_python_executed),false);
 assert.doesNotMatch(await panel.innerText(),/\b(?:Wendbine|SignalRupture|SRC_ATELIER|EMSTD613)\b/,
  'Public operator source-challenge interface must avoid machine-side estate naming');
 // The original reader should open and return without losing source state.
 await panel.getByRole('button',{name:'Read the original Work'}).first().click();
 await page.locator('#view-works:not([hidden])').waitFor({timeout:16000});
 assert.equal(await page.locator('#worksExperimentAReaderMount').getAttribute('data-work-id'),ids[0]);
 await page.locator('#vmaJourneyDock').click();
 await page.locator('#view-collection:not([hidden])').waitFor({timeout:16000});
 assert.equal(await page.evaluate(()=>window.VixenSourceChallenge.status().phase),'SOURCE');
 await panel.getByRole('button',{name:'Test the strongest rival explanation'}).click();
 await page.waitForFunction(()=>window.VixenSourceChallenge.status().phase==='COUNTERTEST');
 assert.match(await panel.innerText(),/before → 0 after/);
 assert.match(await panel.innerText(),/Common vocabulary/);
 assert.match(await panel.innerText(),/Scientific classification: HELD/);
 await panel.getByRole('button',{name:'Investigate the actual structural claim'}).click();
 await page.waitForFunction(()=>window.VixenSourceChallenge.status().phase==='FIELDWORK');
 const form=panel.locator('form.ve-form');
 await fillEvidence(page,form);
 await form.locator('[name=excerpt_0]').fill('Fabricated passage. This exact text is absent from the original source.');
 await form.getByRole('button',{name:'Record the redpen and prepare local receipt'}).click();
 await page.waitForFunction(()=>document.querySelector('#vmaSourceChallenge .ve-status')?.textContent?.includes('HELD_CHALLENGE_EXCERPT_NOT_IN_VERIFIED_SOURCE'),
  null,{timeout:20000});
 assert.equal(await page.evaluate(()=>window.VixenSourceChallenge.status().report_recorded),false);
 await fillEvidence(page,form);
 await form.locator('[name=judgment]').selectOption('STRUCTURAL_CANDIDATE_UNPROVEN');
 await form.getByRole('button',{name:'Record the redpen and prepare local receipt'}).click();
 await page.waitForFunction(()=>window.VixenSourceChallenge.status().phase==='RECEIPT',
  null,{timeout:30000});
 const result=await page.evaluate(()=>window.VixenSourceChallenge.copyLocalReceipt());
 assert.equal(result.schema,'td613.vixen.visitor-hostile-source-challenge-receipt/v1');
 assert.equal(result.verified_source_challenge.identity_census.split_collapse_partitions,256);
 assert.equal(result.verified_source_challenge.control.source_two_occurrences_after,0);
 assert.equal(result.verified_source_challenge.original_native_method_executed_in_browser,false);
 assert.equal(result.visitor_review.passage_provenance.length,2);
 assert.equal(result.visitor_review.judgment,'STRUCTURAL_CANDIDATE_UNPROVEN');
 assert.equal(result.scientific_credit,0);
 assert.equal(result.composer_publication_authority,false);
 assert.equal(result.network_submission_performed,false);
 const onDownload=page.waitForEvent('download');
 await panel.getByRole('button',{name:/Save my complete research receipt/}).click();
 const file=await onDownload;
 assert.match(file.suggestedFilename(),/vixen-source-challenge-field-receipt\.json/);
 await page.screenshot({path:dest+'/vixen-source-expedition-desktop-1440.png',
  animations:'disabled',fullPage:false});
 await page.locator('#vmaEnd').click();
 assert.equal(await panel.isVisible(),false);
 await page.locator('[data-vma-role="COMPOSER"]').click();
 await page.locator('#vmaStart').click();
 assert.equal(await panel.isVisible(),false);
 assert.equal(await page.evaluate(()=>window.VixenSourceChallenge.status().report_recorded),false);
 await page.locator('#vmaEnd').click();
 await role(page);
 assert.equal(await page.evaluate(()=>window.VixenSourceChallenge.status().phase),'SETUP');
 assert.equal(await panel.locator('input.ve-control').inputValue(),'',
  'A new Maestro role session must not inherit a prior private question');
 assert.deepEqual(errors,[]);
 await desktop.close();

 const mobile=await browser.newContext({viewport:{width:390,height:844},
  isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const phone=await mobile.newPage(),phoneErrors=[];
 phone.on('pageerror',e=>phoneErrors.push(e.message));
 await open(phone);await role(phone);
 panel=phone.locator('#vmaSourceChallenge');
 const measure=await panel.evaluate(x=>({scroll:x.scrollWidth,client:x.clientWidth,width:x.getBoundingClientRect().width}));
 assert(measure.scroll<=measure.client+2,'Mobile source challenge overflow '+JSON.stringify(measure));
 await panel.locator('input.ve-control').fill('My unsubmitted research question should be cleared on exit');
 await phone.locator('#vmaEnd').click();
 await role(phone);
 assert.equal(await panel.locator('input.ve-control').inputValue(),'');
 await phone.screenshot({path:dest+'/vixen-source-expedition-mobile-390.png',
  animations:'disabled',fullPage:false});
 assert.deepEqual(phoneErrors,[]);
 await mobile.close();
 console.log('VIXEN_SOURCE_CHALLENGE_OPERATOR_TRIAL_READY desktop/mobile real source, adverse control, human form, local export and role privacy; not external replication');
}finally{await browser.close();}
