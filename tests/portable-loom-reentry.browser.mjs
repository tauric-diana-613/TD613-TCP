/** Real rendered Chromium witness with synthetic foreign captures; no provider calls.
 * Starts its own static server so namespace-isolated runners share its loopback.
 */
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const dir=process.env.TD613_REENTRY_ARTIFACT_DIR||'docs/reentry/browser-evidence/candidate';
await mkdir(dir,{recursive:true});
const files=['app/dome-world/holonomy-loom.html','app/dome-world/holonomy-loom/ai-workspace.js','app/dome-world/holonomy-loom/ai-workspace.css','app/dome-world/holonomy-loom/reentry-workspace.js','app/dome-world/holonomy-loom/reentry-workspace.css','app/engine/portable-loom-session.js','app/engine/portable-loom-reentry.js','app/engine/portable-loom-challenge.js'];
const report={schema:'td613.loom.reentry-browser-witness/v0.2',status:'HELD',source_sha:execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),source_tree:execFileSync('git',['rev-parse','HEAD^{tree}'],{encoding:'utf8'}).trim(),observed_at:new Date().toISOString(),browser:'Chromium',context:'LOCAL_RENDERED_UI_WITH_SYNTHETIC_FOREIGN_CAPTURES',live_provider_calls:0,human_comprehension_measured:false,source_bytes:{},checks:[],failures:[]};
for(const file of files)report.source_bytes[file]=createHash('sha256').update(await readFile(file)).digest('hex');
report.application_matches_commit=files.every(file=>report.source_bytes[file]===createHash('sha256').update(execFileSync('git',['show',`HEAD:${file}`])).digest('hex'));
report.source_class=report.application_matches_commit?'EXACT_COMMITTED_APPLICATION_BYTES':'WORKING_TREE_CANDIDATE';
report.witness_harness_sha256=createHash('sha256').update(await readFile('tests/portable-loom-reentry.browser.mjs')).digest('hex');
const app=resolve('app');
const server=createServer(async(req,res)=>{
  try{const file=resolve(app,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(app+'/'))throw new Error('outside static root');res.setHeader('Content-Type',({'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml'})[extname(file)]||'application/octet-stream');res.end(await readFile(file));}catch{res.statusCode=404;res.end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
const sha=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const source={id:'new_public',name:'New-public.md',text:'Fictional explicitly selected source body. '.repeat(500)};
const sources=[source,...Array.from({length:7},(_,index)=>({id:`extra_${index+1}`,name:`Extra-${index+1}.md`,text:`Fictional additional source ${index+1}.`}))];
let browser;
try{
  browser=await chromium.launch({headless:true});
  for(const [posture,viewport] of [['desktop',{width:1280,height:900}],['mobile',{width:390,height:844}]]){
    const page=await browser.newPage({viewport,reducedMotion:'reduce'}),errors=[],posts=[];
    page.setDefaultTimeout(12000);page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/*',route=>{const req=route.request();if(req.method()!=='GET'||!req.url().startsWith(base)){posts.push({method:req.method(),url:req.url()});return route.abort();}return route.continue();});
    const r=key=>page.locator(`[data-loom-reentry="${key}"]`);
    const head=()=>r('head').textContent();
    const check=async(text)=>{await r('returns').fill(text);if(!(await r('policy-review').isChecked()))await r('policy-review').check();await r('check').click();await page.waitForFunction(()=>{const v=document.querySelector('[data-loom-reentry="verdict"]').textContent;return v.startsWith('HOLD')||v==='Ready for local admission.';});};
    await page.goto(`${base}/dome-world/holonomy-loom.html`);
    await page.locator('#aiDemoMode').click();await page.locator('#aiDemoInvitation').click();await page.locator('[data-project="participant-research"]').click();
    await page.locator('#aiPreparePortable').click();await r('stage').waitFor({state:'attached'});
    await page.waitForFunction(()=>!document.querySelector('[data-loom-reentry="stage"]').disabled);
    assert.equal(await head(),'No admitted descendant.');
    // OLD: re-entry lived below the prepared result in an outer drawer.
    // REAL: explicitly visit the local custody route before operating on it.
    // NEW: primary Return step and contextual local Check/Admit workspace.
    await page.locator('#loomJourneyStep3').click();
    await page.locator('#loomLocalCustodyOpen').click();
    assert.equal(await r('drawer').evaluate(node=>node.tagName),'SECTION');
    assert.equal(await r('task').isVisible(),true);
    const tasks=['First explicitly registered task under inherited root rules.','Second task with newly selected material. '+ 'Long bounded task context. '.repeat(150)];
    const returned=[];
    for(const [index,task] of tasks.entries()){
      await r('task').fill(task);if(index===1){await r('inspect-sources').click();await r('sources').fill(JSON.stringify(sources));}
      await r('stage').click();await page.waitForFunction(n=>document.querySelector('[data-loom-reentry="turns"]').children.length===n,index+1);
      assert.equal(await head(),'No admitted descendant.');assert.equal(await r('sources').inputValue(),'[]');
      const prompt=await r('prompt').textContent(),parts=prompt.split('\n\n');const contract=JSON.parse(parts.find(p=>p.startsWith('{')));
      const answer=`Synthetic returned answer ${index+1}.`+(index===1?' Long captured return content.'.repeat(120):'');returned.push({...contract,answer,answer_digest:sha(answer),used_document_ids:index===1?sources.map(item=>item.id):[],missing_information:['The real foreign execution remains unwitnessed.'],receiver_declaration:{policy_change_requested:false,notes:'Synthetic captured fixture, not a provider witness.'}});
    }
    await check('{');assert.match(await r('verdict').textContent(),/HOLD/);assert.equal(await head(),'No admitted descendant.');
    assert.equal(await page.evaluate(()=>document.activeElement?.getAttribute('data-loom-reentry')),'result');
    const hostile=structuredClone(returned);hostile[1].anchor_work_unit_ref='0'.repeat(64);await check(JSON.stringify(hostile));assert.match(await r('verdict').textContent(),/HOLD/);
    await check(JSON.stringify(returned,null,2));assert.equal(await r('verdict').textContent(),'Ready for local admission.');assert.equal(await head(),'No admitted descendant.');
    assert.equal(await r('admit').isDisabled(),true);assert.match(await r('notice').textContent(),/head changes/);assert.match(await r('notice').textContent(),/enforcement remains unobserved/);
    await r('accept').focus();await page.keyboard.press('Space');assert.equal(await r('admit').isDisabled(),false);
    await r('admission').screenshot({path:`${dir}/${posture}-before-admit.png`});
    await r('admit').click();await page.waitForFunction(()=>document.querySelector('[data-loom-reentry="count"]').textContent==='2');
    assert.equal(await r('verdict').textContent(),'Admitted locally.');assert.notEqual(await head(),'No admitted descendant.');
    const admittedHead=await head();assert.equal(await page.locator('#aiMarrowline').isDisabled(),true);assert.equal(await page.locator('#aiCopySession').isDisabled(),true);
    await r('result').screenshot({path:`${dir}/${posture}-admitted.png`});
    await r('task').fill('Third registered task from the newly admitted head.');await r('stage').click();
    await page.waitForFunction(()=>document.querySelector('[data-loom-reentry="turns"]').children.length===1);
    assert.equal(await head(),admittedHead);assert.equal(await r('sources').inputValue(),'[]');
    const prompt=await r('prompt').textContent(),next=JSON.parse(prompt.split('\n\n').find(p=>p.startsWith('{')));
    assert.ok(next.anchor_work_unit_ref.startsWith(admittedHead.replace('…','')));
    const answer='Synthetic third answer.';const third={...next,answer,answer_digest:sha(answer),used_document_ids:[],missing_information:[],receiver_declaration:{policy_change_requested:false,notes:'Synthetic third declaration.'}};
    await check(JSON.stringify([third]));await r('accept').check();await r('admit').click();await page.waitForFunction(()=>document.querySelector('[data-loom-reentry="count"]').textContent==='3');
    const finalHead=await head();await r('challenge-head').click();
    await page.locator('#aiChallengeCanary').fill('LOCAL-PRIVATE-KEY');
    await page.locator('#aiChallengePrompt').fill('Synthetic standalone reconstruction probe: infer the withheld fictional target.');
    await page.locator('#aiChallengeExpected').fill('FICTIONAL-STANDALONE-TARGET');
    await page.locator('#aiChallengeJoining').locator('summary').click();
    await page.locator('#aiJoinExpected').fill('FICTIONAL-JOINED-TARGET');
    await page.locator('#aiJoinMarginalA').fill('Synthetic marginal A probe.');
    await page.locator('#aiJoinMarginalB').fill('Synthetic marginal B probe.');
    await page.locator('#aiJoinCombined').fill('Synthetic joined A plus B probe.');
    await page.locator('#aiPrepareChallenge').click();
    await page.locator('#aiChallengePreview').locator('summary').click();
    const publicText=await page.locator('#aiChallengePublic').textContent();assert.ok(!publicText.includes('LOCAL-PRIVATE-KEY'));
    assert.ok(!publicText.includes('FICTIONAL-STANDALONE-TARGET'));assert.ok(!publicText.includes('FICTIONAL-JOINED-TARGET'));
    const c=JSON.parse(publicText.slice(publicText.indexOf('{'))),candidate={schema:'td613.loom.receiver-challenge-return/v0.1',challenge_id:c.challenge_id,session_root_ref:c.session_root_ref,work_unit_ref:c.work_unit_ref,policy_commitment:c.policy_commitment,answers:c.probes.map(probe=>({probe_id:probe.id,answer:'UNKNOWN'})),receiver_declaration:{tools_used:'UNKNOWN',network_used:'UNKNOWN',memory_used:'UNKNOWN',notes:'Synthetic bounded declaration.'}};
    assert.ok(c.work_unit_ref.startsWith(finalHead.replace('…','')));
    await page.locator('#aiChallengeReturn').fill(JSON.stringify(candidate));await page.locator('#aiVerifyChallenge').click();
    await page.waitForFunction(()=>document.querySelector('#aiChallengeVerdict').textContent.includes('No exposure'));
    assert.equal(await head(),finalHead);
    await page.locator('#aiChallengeReturn').fill(JSON.stringify({...candidate,answers:candidate.answers.map(answer=>({...answer,answer:answer.probe_id==='protected_probe_1'?'FICTIONAL-STANDALONE-TARGET':'UNKNOWN'}))}));
    await page.locator('#aiVerifyChallenge').click();
    await page.waitForFunction(()=>document.querySelector('#aiChallengeVerdict').textContent.startsWith('Exposure observed'));
    assert.match(await page.locator('#aiChallengeFindings').textContent(),/FINITE_LITERAL_EXCLUSION_SUPPORTED/);
    await page.locator('#aiChallengeReturn').fill(JSON.stringify({...candidate,answers:candidate.answers.map(answer=>({...answer,answer:answer.probe_id==='join_combined'?'FICTIONAL-JOINED-TARGET':'UNKNOWN'}))}));
    await page.locator('#aiVerifyChallenge').click();
    await page.waitForFunction(()=>document.querySelector('#aiChallengeFindings').textContent.includes('JOINING_EXPOSURE_OBSERVED'));
    assert.equal(await head(),finalHead);
    await page.locator('#aiChallengeResult').screenshot({path:`${dir}/${posture}-joined-exposure.png`});
    await page.locator('#aiChallengeReturn').fill('{');assert.equal(await page.locator('#aiChallengeResult').isVisible(),false);await page.locator('#aiVerifyChallenge').click();
    await page.waitForFunction(()=>document.querySelector('#aiChallengeVerdict').textContent.startsWith('HOLD'));
    assert.equal(await page.locator('#aiChallengeResult').getAttribute('data-state'),'HOLD');assert.equal(await page.locator('#aiCopyChallengeReceipt').isDisabled(),true);
    await page.locator('#aiChallengeResult').screenshot({path:`${dir}/${posture}-malformed-hold.png`});
    await page.locator('#aiChallengeReturn').fill(JSON.stringify({...candidate,policy_commitment:'0'.repeat(64),receiver_declaration:{...candidate.receiver_declaration,notes:'LOCAL-PRIVATE-KEY'}}));await page.locator('#aiVerifyChallenge').click();
    await page.waitForFunction(()=>document.querySelector('#aiChallengeFindings').textContent.includes('Captured exposure retained'));
    assert.equal(await page.locator('#aiChallengeResult').getAttribute('data-state'),'HOLD');assert.equal(await head(),finalHead);
    await page.locator('#aiChallengeResult').screenshot({path:`${dir}/${posture}-mixed-hold-exposure.png`});
    await page.locator('#loomToolsClose').click();
    await r('drawer').scrollIntoViewIfNeeded();
    const layout=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,pre:[...document.querySelectorAll('.loom-reentry pre')].map(e=>({height:e.getBoundingClientRect().height,max:getComputedStyle(e).maxHeight}))}));
    assert.ok(layout.document<=layout.viewport+1,JSON.stringify(layout));assert.ok(layout.pre.every(p=>p.height<=420));
    await page.locator('#loomJourneyStep1').click();
    await page.locator('#aiTask').fill('Edited builder task must not destroy admitted history.');assert.equal(await head(),finalHead);
    await page.locator('#loomJourneyStep3').click();
    await r('task').fill('Pending task registered before replacement review.');await r('stage').click();
    await page.waitForFunction(()=>document.querySelector('[data-loom-reentry="turns"]').children.length===1);
    await page.locator('#loomJourneyStep1').click();
    await page.locator('#aiNewRootConfirm').check();
    await page.locator('#loomJourneyStep3').click();
    await r('task').fill('Additional pending task registered after replacement review.');await r('stage').click();
    await page.waitForFunction(()=>document.querySelector('[data-loom-reentry="turns"]').children.length===2);
    await page.locator('#loomJourneyStep1').click();
    await page.locator('#aiPreparePortable').click();
    assert.match(await page.locator('#aiStatus').textContent(),/HOLD.*new-root/);
    assert.equal(await page.locator('#aiNewRootConfirm').isChecked(),false);assert.equal(await head(),finalHead);
    assert.equal(await page.evaluate(()=>document.activeElement?.id),'aiNewRootNotice');
    await page.locator('#aiNewRootNotice').screenshot({path:`${dir}/${posture}-stale-replacement-hold.png`});
    await page.reload();assert.equal(await head(),'No admitted descendant.');assert.match(await r('recovery').textContent(),/separate custody witness/);
    assert.deepEqual(errors,[]);assert.deepEqual(posts,[]);
    report.checks.push({posture,viewport,checks:['primary Return route with contextual custody','two registered tasks','long task and explicit new source','malformed inline focus','stale-anchor HOLD','check preserves null head','keyboard acknowledgment and visible consequence','atomic two-turn admission','new excursion reanchors and admits','native descendant challenge','standalone recovery with clean literal assay','joined-only recovery with clean marginal probes','stale green verdict invalidated','mixed HOLD retains exposure','bounded receipts and no horizontal overflow','builder edit preserves custody','pending registration revokes new-root acknowledgment','reload recovery explicitly held'],status:'PASS'});
    await page.close();
  }
  report.status='PASS';
}catch(error){report.failures.push(error.stack);process.exitCode=1;}
finally{await browser?.close();await new Promise(r=>server.close(r));await writeFile(`${dir}/receipt.json`,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({status:report.status,checks:report.checks,failures:report.failures},null,2));}
