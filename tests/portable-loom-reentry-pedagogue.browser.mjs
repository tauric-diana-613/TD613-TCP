/** Pedagogue's independent rendered encounter witness, not a comprehension assay.
 * Synthetic returns and local clocks only; no foreign host or provider request.
 */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {resolve, extname, sep} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';

const dir=process.env.TD613_PEDAGOGUE_ARTIFACT_DIR||'docs/reentry/browser-evidence/pedagogue-resumed';
await mkdir(dir,{recursive:true});
const digest=value=>createHash('sha256').update(value).digest('hex');
const report={schema:'td613.pedagogue.reentry-encounter-witness/v0.1',status:'HELD',
  harness_sha256:digest(await readFile(new URL(import.meta.url))),
  source_sha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),
  working_tree:execFileSync('git',['status','--short'],{encoding:'utf8'}).trim().split('\n').filter(Boolean),
  observed_at:new Date().toISOString(),browser:'Chromium',context:'LOCAL_RENDERED_UI_WITH_SYNTHETIC_CAPTURES',
  human_comprehension_measured:false,foreign_execution_observed:false,live_provider_calls:0,
  served_source_bytes:{},checks:[],vetoes:[],failures:[]};
// Each actual served file is frozen on first request. Concurrent collaborator edits
// cannot silently replace one of these witnessed bytes midway through a posture.
const app=resolve('app'), served=new Map();
const server=createServer(async(req,res)=>{
  try {
    const pathname=new URL(req.url,'http://localhost').pathname,file=resolve(app,'.'+pathname);
    if(!file.startsWith(app+'/')&&!file.startsWith(app+sep))throw new Error('Outside static root');
    if(!served.has(file))served.set(file,await readFile(file));
    report.served_source_bytes[`app${pathname}`]=digest(served.get(file));
    res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');
    res.end(served.get(file));
  } catch {res.statusCode=404;res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser=await chromium.launch({headless:true});
  for(const [posture,viewport] of [['desktop',{width:1280,height:900}],['mobile',{width:390,height:844}]]) {
    const context=await browser.newContext({viewport,reducedMotion:'reduce',acceptDownloads:true});
    await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:base});
    const page=await context.newPage(),pageErrors=[],blocked=[];
    await page.addInitScript(()=>{try{localStorage.setItem('td613.loom.first-crossing.v1','complete');}catch{}});
    page.setDefaultTimeout(12000);
    page.on('pageerror',error=>pageErrors.push(error.message));
    await page.route('**/*',route=>{
      const request=route.request();
      if(request.method()!=='GET'||!request.url().startsWith(base)){
        blocked.push({method:request.method(),url:request.url()});return route.abort();
      }
      return route.continue();
    });
    const r=key=>page.locator(`[data-loom-reentry="${key}"]`);
    const head=async()=>(await r('head').getAttribute('title'))||'';
    const exposed=async locator=>{
      const box=await locator.boundingBox();
      return {text:await locator.textContent(),box,viewport,
        intersects:!!box&&box.width>0&&box.height>0&&box.y<viewport.height&&box.y+box.height>0,
        fully_exposed:!!box&&box.width>0&&box.height>0&&box.y>=0&&box.y+box.height<=viewport.height};
    };
    const check=async raw=>{
      await r('returns').fill(raw);await r('policy-review').check();await r('check').click();
      await r('result').waitFor({state:'visible'});
    };
    await page.goto(`${base}/dome-world/holonomy-loom.html`);
    assert.equal(await page.locator('#loomFirstCrossing').isVisible(),true);
    await page.locator('#loomFirstCrossingLeave').click();await page.locator('.loom-builder-shell').waitFor({state:'visible'});
    assert.equal(await page.locator('#aiSessionSummary').isVisible(),false,'Skip tutorial grants no prepared session');
    await page.locator('#aiDemoMode').click();await page.locator('#aiDemoInvitation').click();
    await page.locator('[data-project="participant-research"]').click();
    await page.locator('#aiPreparePortable').click();
    await page.waitForFunction(()=>!document.querySelector('[data-loom-reentry="stage"]').disabled);
    await page.locator('#loomJourneyStep3').click();
    // Return action order stays governed; the old outer/nested drawer-opening
    // ceremony is retired in favor of primary steps and one exact workspace.
    assert.equal(await r('drawer').evaluate(node=>node.tagName),'SECTION');
    assert.equal(await r('task').isVisible(),true);
    assert.equal(await head(),'');
    const selected={id:'pedagogue_explicit',name:'Deliberate-source.md',text:'FICTIONAL_SOURCE_BODY_ONLY_EXPLICIT_SELECTION '.repeat(240)};
    await r('inspect-sources').click();await r('sources').fill(JSON.stringify([selected]));
    await r('task').fill('Return a concise assessment of the explicitly selected fictional source.');await r('stage').click();
    await page.waitForFunction(()=>document.querySelector('[data-loom-reentry="turns"]').children.length===1);
    assert.equal(await head(),'');assert.equal(await r('sources').inputValue(),'[]');
    assert.equal(await r('prompt').isVisible(),true);
    const prompt=await r('prompt').textContent();
    const contract=JSON.parse(prompt.split('\n\n').find(part=>part.startsWith('{')));
    const answer='A fictional answer captured locally for the encounter assay.';
    const returned={...contract,answer,answer_digest:digest(JSON.stringify(answer)),used_document_ids:[selected.id],
      missing_information:['Foreign execution is unwitnessed.'],receiver_declaration:{policy_change_requested:false,notes:'Synthetic declaration, no actual provider interaction.'}};
    await r('copy').click();await page.waitForFunction(()=>document.querySelector('[data-loom-reentry="verdict"]').textContent==='Task and return contract copied.');
    const taskClipboard=await page.evaluate(()=>navigator.clipboard.readText());
    assert.equal(taskClipboard.replace(/\r\n/g, '\n'), prompt.replace(/\r\n/g, '\n'));assert.equal(await head(),'');

    // A clean captured anchor/excursion episode is retained without turning it into
    // enforcement proof. The private key must never appear in either public carrier.
    await r('challenge-head').click();
    const localKey=`PEDAGOGUE_PRIVATE_KEY_${posture}`;
    await page.locator('#aiChallengeCanary').fill(localKey);await page.locator('#aiPrepareChallenge').click();
    await page.locator('#aiChallengePreview').locator('summary').click();
    const publicChallenge=await page.locator('#aiChallengePublic').textContent();
    assert.ok(!publicChallenge.includes(localKey));
    const challenge=JSON.parse(publicChallenge.slice(publicChallenge.indexOf('{')));
    await page.locator('#aiChallengeReturn').fill(JSON.stringify({schema:'td613.loom.receiver-challenge-return/v0.1',
      challenge_id:challenge.challenge_id,session_root_ref:challenge.session_root_ref,work_unit_ref:challenge.work_unit_ref,
      policy_commitment:challenge.policy_commitment,answers:[],receiver_declaration:{tools_used:'UNKNOWN',network_used:'UNKNOWN',memory_used:'UNKNOWN',notes:'Synthetic clean bounded capture.'}}));
    await page.locator('#aiVerifyChallenge').click();
    await page.waitForFunction(()=>document.querySelector('[data-loom-reentry="challenge-history-summary"]').textContent.includes('1 captured'));
    await page.locator('#loomToolsClose').click();
    assert.equal(await head(),'');
    await check('{');assert.match(await r('verdict').textContent(),/HOLD/);
    assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-loom-reentry')),'result');
    const malformed=await exposed(r('result'));assert.ok(malformed.intersects);
    await page.screenshot({path:`${dir}/${posture}-malformed-focused.png`});
    await check(JSON.stringify([returned],null,2));
    await page.waitForFunction(()=>document.querySelector('[data-loom-reentry="verdict"]').textContent==='Ready for local admission.');
    assert.equal(await head(),'');assert.equal(await r('admit').isDisabled(),true);
    const noticeAfterCheck=await exposed(r('notice'));
    assert.match(noticeAfterCheck.text,/head changes/);assert.match(noticeAfterCheck.text,/enforcement remains unobserved/);
    // Real keyboard gesture from the focused Check result: the next focusable
    // control is the exact-candidate acknowledgment, then Admit.
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-loom-reentry')),'accept');
    await page.keyboard.press('Space');await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-loom-reentry')),'admit');
    const noticeAtAdmit=await exposed(r('notice'));
    await page.screenshot({path:`${dir}/${posture}-keyboard-before-admit.png`});
    await page.keyboard.press('Enter');
    await page.waitForFunction(()=>document.querySelector('[data-loom-reentry="count"]').textContent==='1');
    const admittedHead=await head(),rootBefore=await r('root').getAttribute('title');
    assert.ok(admittedHead);assert.equal(await r('verdict').textContent(),'Admitted locally.');
    assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-loom-reentry')),'result');
    assert.ok(await r('result').isVisible());

    const downloadPromise=page.waitForEvent('download');await r('save').click();const download=await downloadPromise;
    const privateRecord=await readFile(await download.path(),'utf8');
    assert.ok(privateRecord.includes(selected.text));assert.ok(privateRecord.includes(localKey));
    assert.ok(privateRecord.includes('captured_return'));assert.equal(await head(),admittedHead);
    const saveControl=await exposed(r('save'));
    const privateRecordNotice=await exposed(r('recovery'));
    const saveWarning=page.getByText('Private Save includes selected source bodies',{exact:false});
    const adjacentSaveWarning=await saveWarning.count()?await exposed(saveWarning):null;
    assert.match(saveControl.text,/private/i);assert.match(privateRecordNotice.text,/do not paste it into a receiver/i);
    if(await r('inspection').getAttribute('open')===null)await r('inspection').locator('summary').click();
    assert.equal(await r('continuation-sources').locator('input:checked').count(),0);
    await r('continuation-task').fill('Carry the admitted result into a new fictional discussion without source bodies.');
    await r('prepare-carrier').click();await r('carrier-preview').waitFor({state:'visible'});
    assert.equal(await r('carrier-preview').isVisible(),true);
    const publicCarrierText=await r('carrier').textContent(),publicCarrier=JSON.parse(publicCarrierText);
    assert.ok(publicCarrierText.includes(answer));assert.ok(!publicCarrierText.includes(selected.text));
    assert.ok(!publicCarrierText.includes(localKey));assert.ok(!publicCarrierText.includes('captured_return'));
    assert.deepEqual(publicCarrier.documents,[]);assert.equal(await head(),admittedHead);
    await r('copy-carrier').click();
    await page.waitForFunction(()=>document.querySelector('[data-loom-reentry="verdict"]').textContent==='Admitted continuation copied.');
    assert.equal((await page.evaluate(()=>navigator.clipboard.readText())).replace(/\r\n/g, '\n'),publicCarrierText.replace(/\r\n/g, '\n'));
    assert.equal(await head(),admittedHead);
    assert.equal(await page.locator('#aiCopySession').isDisabled(),true);

    // Skeptical operator returns directly to the original Prepare action. A
    // notice elsewhere in the document is not exposure at this custody gesture.
    await r('task').fill('Pending registered task must survive a denied new-root gesture.');await r('stage').click();
    await page.waitForFunction(()=>document.querySelector('[data-loom-reentry="verdict"]').textContent==='Task registered locally.');
    assert.equal(await head(),admittedHead);
    await page.locator('#loomJourneyStep1').click();
    await page.locator('#aiTask').fill('A distinct fictional seed task for new-root replacement.');
    assert.equal(await head(),admittedHead);
    await page.locator('#aiPreparePortable').scrollIntoViewIfNeeded();
    const replacementNotice=await exposed(page.locator('#aiNewRootNotice'));
    const replacementControl=await exposed(page.locator('#aiPreparePortable'));
    await page.screenshot({path:`${dir}/${posture}-new-root-gesture.png`});
    let guardedReplacement=null;
    if(await page.locator('#aiNewRootConfirm').count()) {
      await page.locator('#aiPreparePortable').click();
      assert.equal(await r('root').getAttribute('title'),rootBefore);assert.equal(await head(),admittedHead);
      assert.equal(await r('count').textContent(),'1');assert.equal(await r('turns').locator(':scope > li').count(),1,'the pending registration survives the denied replacement');
      assert.equal(await page.evaluate(()=>document.activeElement?.id),'aiNewRootNotice');
      assert.match(await page.locator('#aiStatus').textContent(),/HOLD/);
      const deniedNotice=await exposed(page.locator('#aiNewRootNotice'));
      assert.ok(deniedNotice.intersects);
      await page.screenshot({path:`${dir}/${posture}-denied-new-root.png`});
      await page.locator('#aiNewRootConfirm').check();await page.locator('#aiNewRootConfirm').uncheck();
      await page.locator('#aiPreparePortable').click();
      assert.equal(await r('root').getAttribute('title'),rootBefore);assert.equal(await head(),admittedHead);
      assert.equal(await r('turns').locator(':scope > li').count(),1);
      await page.locator('#aiNewRootConfirm').check();
      await page.locator('#aiTask').fill('Builder edit invalidates the previously acknowledged replacement.');
      assert.equal(await page.locator('#aiNewRootConfirm').isChecked(),false);
      await page.locator('#aiPreparePortable').click();
      assert.equal(await r('root').getAttribute('title'),rootBefore);assert.equal(await head(),admittedHead);
      assert.equal(await r('turns').locator(':scope > li').count(),1);
      const adjacentDownloadPromise=page.waitForEvent('download');
      await page.locator('#aiSaveActiveCustody').click();const adjacentDownload=await adjacentDownloadPromise;
      const adjacentRecord=JSON.parse(await readFile(await adjacentDownload.path(),'utf8'));
      assert.equal(adjacentRecord.session.continuity.current_work_unit_ref,admittedHead);
      assert.ok(JSON.stringify(adjacentRecord).includes(localKey));
      assert.equal(await r('root').getAttribute('title'),rootBefore);assert.equal(await head(),admittedHead);
      await page.locator('#aiNewRootConfirm').check();
      const acknowledgedCheckbox=await exposed(page.locator('#aiNewRootConfirm'));
      await page.locator('#aiPreparePortable').scrollIntoViewIfNeeded();
      const acknowledgedNotice=await exposed(page.locator('#aiNewRootNotice'));
      const acknowledgedConsequence=await exposed(page.locator('#aiNewRootNotice > p').first());
      const acknowledgedPrivacy=await exposed(page.locator('#aiNewRootNotice > p').last());
      const acknowledgedLabel=await exposed(page.locator('#aiNewRootNotice > label'));
      const acknowledgedAction=await exposed(page.locator('#aiPreparePortable'));
      await page.screenshot({path:`${dir}/${posture}-acknowledged-new-root.png`});
      guardedReplacement={first_attempt_denied:true,focus_on_notice:true,pending_registration_retained:true,
        unchecking_cancels:true,builder_edit_revokes_acknowledgment:true,adjacent_private_save_preserves_lane:true,
        denied_notice:deniedNotice,acknowledged_checkbox:acknowledgedCheckbox,acknowledged_notice:acknowledgedNotice,
        acknowledged_consequence:acknowledgedConsequence,acknowledged_privacy:acknowledgedPrivacy,acknowledged_label:acknowledgedLabel,acknowledged_action:acknowledgedAction};
      if(!acknowledgedNotice.intersects)report.vetoes.push({posture,code:'ACKNOWLEDGED_NEW_ROOT_NOTICE_OFFSCREEN',evidence:guardedReplacement});
      assert.ok(acknowledgedConsequence.fully_exposed);assert.ok(acknowledgedPrivacy.fully_exposed);assert.ok(acknowledgedLabel.fully_exposed);
      if(!adjacentSaveWarning?.intersects)report.vetoes.push({posture,code:'PRIVATE_SAVE_ADJACENT_WARNING_NOT_EXPOSED',evidence:adjacentSaveWarning});
    }
    await page.locator('#aiPreparePortable').click();
    await page.waitForFunction(old=>document.querySelector('[data-loom-reentry="root"]').title!==old,rootBefore);
    await page.waitForFunction(()=>!document.querySelector('[data-loom-reentry="stage"]').disabled);
    const replacement={notice:replacementNotice,control:replacementControl,
      old_root:rootBefore,new_root:await r('root').getAttribute('title'),old_head:admittedHead,new_head:await head(),new_count:await r('count').textContent(),guarded:guardedReplacement};
    assert.equal(replacement.new_count,'0');assert.equal(replacement.new_head,'');
    if(!replacementNotice.intersects)report.vetoes.push({posture,code:'NEW_ROOT_REPLACEMENT_WITHOUT_EXPOSED_NOTICE',
      reason:'The enabled original Prepare control replaced a lane containing an admitted descendant while the replacement notice was outside the viewport.',evidence:replacement});

    // Browser-controlled time is a synthetic expiry assay, not fifteen minutes
    // of human waiting. Rest must neither extend the deadline nor waive HOLD.
    await page.locator('#loomJourneyStep3').click();
    await page.clock.install({time:new Date()});
    await r('task').fill('Pending fictional task used for rest and expiry.');await r('stage').click();
    await page.waitForFunction(()=>document.querySelector('[data-loom-reentry="verdict"]').textContent==='Task registered locally.');
    await page.waitForFunction(()=>document.querySelector('[data-loom-reentry="turns"]').children.length===1);
    const deadline=await r('expiry').textContent();await r('rest').click();
    assert.equal(await r('active').isVisible(),false);assert.match(await r('rest-state').textContent(),/deadline keeps running/);
    await page.clock.fastForward(15*60*1000+1);
    assert.match(await r('verdict').textContent(),/expired/);assert.equal(await head(),'');
    await r('rest').click();assert.match(await r('verdict').textContent(),/expired/);
    assert.equal(await r('stage').isDisabled(),true);assert.equal(await r('expiry').textContent(),deadline);
    await r('cancel').click();assert.equal(await r('stage').isDisabled(),false);
    assert.match(await r('detail').textContent(),/cannot be recalled/);assert.equal(await head(),'');
    await page.screenshot({path:`${dir}/${posture}-expiry-discard.png`});
    const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,
      inspectors:[...document.querySelectorAll('.loom-reentry pre')].map(el=>el.getBoundingClientRect().height)}));
    assert.ok(layout.scroll<=layout.width+1);assert.ok(layout.inspectors.every(height=>height<=420));
    await page.reload();
    await page.locator('#loomFirstCrossingLeave').click();
    await page.locator('#loomJourneyStep3').click();
    await page.locator('#loomLocalCustodyOpen').click();
    assert.match(await r('recovery').textContent(),/separate custody witness/);assert.equal(await head(),'');
    assert.deepEqual(pageErrors,[]);assert.deepEqual(blocked,[]);
    report.checks.push({posture,viewport,status:'PASS',malformed,notice_after_check:noticeAfterCheck,notice_at_keyboard_admit:noticeAtAdmit,
      private_save:{control:saveControl,notice:privateRecordNotice,adjacent_warning:adjacentSaveWarning,source_bodies_retained:true,raw_capture_retained:true,local_answer_key_retained:true},
      public_carrier:{preceding_answer_carried:true,sources_explicitly_empty:true,raw_capture_absent:true,local_answer_key_absent:true,clipboard_equal_visible_preview:true},
      replacement,expiry:{synthetic_clock:true,deadline_unchanged:deadline,rest_preserves_head:true,resume_keeps_hold:true,discard_releases_pending:true},layout,
      checks:['explicit-source staging preserves head','task copy matches disclosed prompt','bounded Challenge scope retained','malformed HOLD visible and focused',
        'check preserves head','keyboard acknowledgment then explicit Admit','admission returns focus to consequence','private download distinct from public carrier',
        'builder edits preserve admitted lane','new-root gesture measured','rest expiry discard','reload grants no custody authority']});
    await context.close();
  }
  report.status=report.vetoes.length?'VETO':'PASS';
  if(report.vetoes.length)process.exitCode=1;
} catch(error) {report.failures.push(error.stack);process.exitCode=1;}
finally {
  await browser?.close();await new Promise(r=>server.close(r));
  await writeFile(`${dir}/receipt.json`,JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify({status:report.status,checks:report.checks.map(({posture,status})=>({posture,status})),vetoes:report.vetoes,failures:report.failures},null,2));
}
