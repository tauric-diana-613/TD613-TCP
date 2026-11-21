/**
 * QA-03 integrated exact-head rendered SOURCE witness, not a human witness.
 * Two real Chromium sessions: 1440 desktop and 390 responsive/phone.
 *
 * The G6 original native return is deliberately disconnected from this
 * public browser, and QA-04 human cadence remains external evidence HELD.
 */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {execFileSync} from 'node:child_process';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';

const exactHead=execFileSync('git',['rev-parse','HEAD'],{
 encoding:'utf8',timeout:8000}).trim();
assert.match(exactHead,/^[a-f0-9]{40}$/);
const dir=resolve('artifacts/vixen-g8-browser');
await mkdir(dir,{recursive:true});
const url='http://127.0.0.1:6130/encyclopedia/vix-cyb.html';
const matrix={
 schema:'td613.vixen.g8.rendered-route-witness/v1',
 source_sha:exactHead,
 status:'RUNNING',
 witness_class:'LOCAL_RENDERED_CHROMIUM_UI_NOT_ACTUAL_HUMAN',
 browser_launch_observed:false,
 human_operator_observed:false,
 live_original_native_return_in_browser:false,
 original_corpus_claim:'32_CANONICAL_WORKS_NO_AUTOMATIC_SUPPLEMENTAL_ADMISSION',
 viewports:[],qa04_human_cadence:'HELD_UNOBSERVED',
 scientific_credit:0,external_origin_authenticated:false,
 release_authority:false
};
let browser;
try{
 browser=await chromium.launch({headless:true});
 matrix.browser_launch_observed=true;
 for(const width of [1440,390]){
  const viewport={width,height:width===390?844:900};
  const context=await browser.newContext({
   viewport,reducedMotion:'reduce',
   ...(width===390?{isMobile:true,hasTouch:true}:{}),
   acceptDownloads:true
  });
  const page=await context.newPage();
  const errors=[],httpErrors=[],dialogs=[];
  page.on('pageerror',e=>errors.push(String(e.message).slice(0,260)));
  page.on('response',r=>{
   if(r.status()>=400)httpErrors.push({status:r.status(),url:r.url().slice(0,240)});
  });
  const rec={
   viewport,status:'RUNNING',page_errors:errors,http_errors:httpErrors,
   simulated_browser_interactions_not_human_field_witness:true,
   active_original_native_engine:false
  };
  matrix.viewports.push(rec);
  try{
   const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:35000});
   assert.equal(response?.status(),200,'Original Vixen must load from checked-out source');
   await page.waitForFunction(()=>window.VixenAIModes?.mounted===true&&
    window.VixenSourceChallenge?.mounted===true,null,{timeout:30000});
   const corpus=await page.evaluate(()=>{
    const c=JSON.parse(document.getElementById('vixen-corpus-bundle').textContent);
    return {works:c.works.length,linked_sources:c.works.reduce(
     (n,w)=>n+(w.linked_sources||[]).length,0)};
   });
   assert.deepEqual(corpus,{works:32,linked_sources:53});
   rec.source_census=corpus;
   assert.equal(await page.evaluate(()=>window.VixenAIModes.model_connected),false);
   const nav=page.locator('#vixenRoomRail [data-view="collection"]').first();
   await nav.click();
   await page.locator('#view-collection:not([hidden])').waitFor({timeout:16000});
   const role=page.locator('[data-vma-role="MAESTRO"]');
   await role.focus();
   await role.press('Enter');
   assert.equal(await role.getAttribute('aria-pressed'),'true',
    'Keyboard selection must be recognized as explicit visitor action');
   assert.equal(await page.locator('#vmaStart').isDisabled(),false);
   await page.locator('#vmaStart').click();
   await page.waitForFunction(()=>window.VixenAIModes.status().result?.active===true,
    null,{timeout:30000});
   const pre=await page.evaluate(()=>window.VixenAIModes.status());
   assert.equal(pre.result.role,'MAESTRO');
   assert.equal(pre.result.note_count,0);
   assert.notEqual(pre.result.program_notes_permission,'GRANTED');
   // QA03 same-episode source excursion: navigate to the original recorded
   // Work through the real visitor control, then return to the same session.
   // A selected Work is neither an independent body read nor a native host
   // proof; keep those observations explicitly separate in the receipt.
   const selectedWork=await page.evaluate(()=>
    window.VixenAIModes.session.handoff().result.source_candidates[0]?.work_id);
   assert.match(selectedWork||'',/^emwork_[a-f0-9]+$/);
   const priorSessionId=pre.result.session_id;
   const sourceJump=page.locator('#vmaSources .vma-source .vma-small').first();
   await sourceJump.waitFor({state:'visible',timeout:15000});
   await sourceJump.scrollIntoViewIfNeeded();
   await sourceJump.click();
   await page.locator('#view-works:not([hidden])').waitFor({timeout:18000});
   const mountedWork=await page.locator('#worksExperimentAReaderMount').getAttribute('data-work-id');
   assert.equal(mountedWork,selectedWork,'Real Work route must match selected source ID');
   const readerScroll=await page.locator('#worksExperimentAReaderMount').evaluate(el=>({
    scroll_width:el.scrollWidth,client_width:el.clientWidth,
    viewport_scroll_y:window.scrollY
   }));
   const dock=page.locator('#vmaJourneyDock');
   await dock.waitFor({state:'visible',timeout:15000});
   await dock.scrollIntoViewIfNeeded();
   await dock.click();
   await page.locator('#view-collection:not([hidden])').waitFor({timeout:18000});
   const returned=await page.evaluate(()=>{
    const session=window.VixenAIModes.status();
    return {session_id:session.result?.session_id,
     role:session.result?.role,active:session.result?.active,
     note_count:session.result?.note_count,
     original_native_connected:window.VixenAIModes.model_connected}
   });
   assert.deepEqual(returned,{session_id:priorSessionId,role:'MAESTRO',
    active:true,note_count:0,original_native_connected:false});
   rec.source_excursion={selected_work_id:selectedWork,
    mounted_work_id:mountedWork,returned_session_id:priorSessionId,
    same_session_return:true,reader_scroll:readerScroll,
    original_host_native_return_observed:false,
    original_document_body_witness_not_inferred:true};
   await page.locator('#vmaNotesRequest').click();
   await page.locator('#vmaNotesApprove').waitFor({state:'visible',timeout:14000});
   assert.equal(await page.evaluate(()=>window.VixenAIModes.status().result.note_count),0);
   await page.locator('#vmaNotesApprove').click();
   await page.waitForFunction(()=>window.VixenAIModes.status().result.program_notes_permission==='GRANTED',
    null,{timeout:13000});
   assert.equal(await page.evaluate(()=>window.VixenAIModes.status().result.note_count),0,
    'No retroactive notes before a separately consented future route');
   await page.locator('#vmaMoves .vma-choice').first().click();
   await page.waitForFunction(()=>window.VixenAIModes.status().result.note_count>=1,
    null,{timeout:30000});
   const notesBefore=await page.evaluate(()=>window.VixenAIModes.status().result.note_count);
   await page.locator('#vmaNotesRevoke').click();
   await page.waitForFunction(()=>window.VixenAIModes.status().result.program_notes_permission==='REVOKED',
    null,{timeout:14000});
   // An unsubmitted source-challenge question belongs only to this role.
   const challenge=page.locator('#vmaSourceChallenge input.ve-control').first();
   await challenge.waitFor({state:'visible',timeout:15000});
   const privateMarker='G8_UNSUBMITTED_FIELD_'+width+'_MUST_NOT_ESCAPE';
   await challenge.fill(privateMarker);
   assert.equal(await page.evaluate(()=>window.VixenSourceChallenge.draftStatus().has_unsent_draft),true);
   // Dismissing the explicit role exit must preserve the unsent question.
   page.once('dialog',async dialog=>{
    dialogs.push({message:dialog.message(),choice:'DISMISSED'});
    await dialog.dismiss();
   });
   await page.locator('#vmaEnd').click();
   assert.equal(await page.evaluate(()=>window.VixenAIModes.status().result.active),true);
   assert.equal(await challenge.inputValue(),privateMarker);
   page.once('dialog',async dialog=>{
    dialogs.push({message:dialog.message(),choice:'ACCEPTED'});
    await dialog.accept();
   });
   await page.locator('#vmaEnd').click();
   await page.locator('#vmaEndSummary').waitFor({state:'visible',timeout:16000});
   assert.equal(dialogs.length,2,'Both explicit unsent-draft decisions must be captured');
   assert.match(dialogs[0].message,/unsent|unsubmitted/i);
   assert.match(dialogs[1].message,/unsent|unsubmitted/i);
   const downloadPromise=page.waitForEvent('download',{timeout:30000});
   await page.locator('#vmaSaveFinal').click();
   const d=await downloadPromise;
   assert.equal(d.suggestedFilename(),'vixen-completed-research-journey.json');
   const target=join(dir,'session-'+width+'.json');
   await d.saveAs(target);
   const raw=await readFile(target,'utf8');
   assert(!raw.includes(privateMarker),
    'Unsubmitted draft bytes cannot be captured in the local archive');
   const archive=JSON.parse(raw);
   assert.equal(archive.schema,'vixen.ai.session-archive/v1');
   assert.equal(archive.role,'MAESTRO');
   assert.equal(archive.active,false);
   assert.equal(archive.original_corpus_modified,false);
   assert.equal(archive.portable_local_export_only,true);
   assert.equal(archive.release_authority,false);
   assert.equal(archive.auto_restore_notes_permission,false);
   assert.equal(archive.operator_side_receipts.has_unsent_drafts,true);
   assert.equal(archive.operator_side_receipts.completed_receipts?.source_challenge,undefined);
   rec.consent={future_only:notesBefore>0,
    post_grant_notes_count:notesBefore,
    revoked_before_role_exit:true,reload_permission_restored:false};
   rec.privacy={exit_requires_choice:dialogs.length===2,
    unsent_draft_bytes_exported:false,
    unsent_draft_metadata_preserved:archive.operator_side_receipts.has_unsent_drafts,
    dialog_choices:dialogs.map(x=>x.choice)};
   rec.archive={local_only:true,release_authority:false,
    auto_restore_notes_permission:false,sha256:createHash('sha256').update(raw).digest('hex'),
    recorded_role:archive.role};
   const nativeState=await page.evaluate(()=>({
    model_connected:window.VixenAIModes.model_connected,
    original_python_executed:window.VixenSourceChallenge.status().original_python_executed===true
   }));
   assert.equal(nativeState.model_connected,false);
   assert.equal(nativeState.original_python_executed,false);
   rec.source_return={model_connected:false,original_native_method_in_browser:false,
    host_only_cli_not_invoked:true};
   const metrics=await page.locator('#vixenAiJourney').evaluate(el=>({
    scroll_width:el.scrollWidth,client_width:el.clientWidth,
    browser_viewport:innerWidth,
    body_overflow:document.documentElement.scrollWidth-innerWidth
   }));
   rec.layout=metrics;
   if(width===390)assert(metrics.scroll_width<=metrics.client_width+2,
    'Mobile visitor journey must not force horizontal overflow: '+JSON.stringify(metrics));
   await page.screenshot({path:join(dir,'g8-'+width+'-post-exit.png'),
    animations:'disabled',fullPage:false});
   // A hard reload must not rehydrate the session, notes or role.
   await page.reload({waitUntil:'domcontentloaded',timeout:35000});
   await page.waitForFunction(()=>window.VixenAIModes?.mounted===true,
    null,{timeout:30000});
   const fresh=await page.evaluate(()=>{
    const r=window.VixenAIModes.status();
    return {status:r.status,model_connected:window.VixenAIModes.model_connected,
     active:typeof r.result?.active==='boolean'?r.result.active:false,
     selected_role:document.querySelector('[data-vma-role][aria-pressed="true"]')?.dataset.vmaRole||null,
     start_disabled:document.getElementById('vmaStart').disabled}
   });
   assert.equal(fresh.model_connected,false);
   assert.equal(fresh.active,false);
   assert.equal(fresh.selected_role,null);
   assert.equal(fresh.start_disabled,true);
   // Fresh role selection is required before a post-reload permission state
   // can be inspected. Merely finding no selected role proves less.
   await page.locator('#vixenRoomRail [data-view="collection"]').first().click();
   await page.locator('#view-collection:not([hidden])').waitFor({timeout:15000});
   await page.locator('[data-vma-role="MAESTRO"]').click();
   await page.locator('#vmaStart').click();
   await page.waitForFunction(()=>
    window.VixenAIModes.status().result?.active===true,
    null,{timeout:30000});
   const restarted=await page.evaluate(()=>{
    const state=window.VixenAIModes.status().result;
    return {role:state.role,notes_permission:state.program_notes_permission,
     note_count:state.note_count,active:state.active,
     model_connected:window.VixenAIModes.model_connected}
   });
   assert.equal(restarted.role,'MAESTRO');
   assert.equal(restarted.active,true);
   assert.equal(restarted.notes_permission,'NOT_REQUESTED',
    'Prior approval/revocation cannot restore notes authorization');
   assert.equal(restarted.note_count,0);
   assert.equal(restarted.model_connected,false);
   rec.consent.reload_permission_restored=false;
   rec.reload={fresh_role_selection_required:true,role_restored:false,
    note_permission_restored:false,notes_permission_reobserved_after_start:'NOT_REQUESTED',
    original_native_connected:false};
   assert.deepEqual(errors,[],'Uncaught JavaScript errors in the rendered route');
   rec.status='BOUNDED_RENDERED_ROUTE_PASS';
  }catch(e){
   rec.status='FAIL_OR_HELD';
   rec.failure=String(e?.stack||e).slice(0,11000);
   try{await page.screenshot({path:join(dir,'g8-'+width+'-failure.png'),
    animations:'disabled',fullPage:false})}catch{}
   throw e;
  }finally{
   await writeFile(join(dir,'viewport-'+width+'.json'),
    JSON.stringify(rec,null,2)+'\n');
   await context.close();
  }
 }
 matrix.status='BROWSER_BOUNDARY_PASS';
}catch(e){
 matrix.status='FAIL_OR_HELD';
 matrix.failure=String(e?.stack||e).slice(0,12000);
 throw e;
}finally{
 await writeFile(join(dir,'qa03-browser-witness.json'),JSON.stringify(matrix,null,2)+'\n');
 if(browser)await browser.close();
}
console.log('G8 QA-03 two real Chromium viewports PASS, QA-04 actual human evidence HELD; source '+exactHead);
