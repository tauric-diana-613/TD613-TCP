/** Synthetic DOM workflow witness: real workspace/intake with an explicitly stubbed HTTP response.
 * These checks exercise client behavior; they provide no live Gemini or visual-browser evidence.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { JSDOM } from 'jsdom';
import { File } from 'node:buffer';
import { webcrypto } from 'node:crypto';
// Import before supplying any browser globals: auto-mount must not run in the harness.
import { mountLoomAiWorkspace } from '../app/dome-world/holonomy-loom/ai-workspace.js';
import { LOOM_AI_PROJECTS } from '../app/dome-world/holonomy-loom/ai-projects.js';

test('Holonomy Loom browser wait extends beyond the retired 55-second ceiling', () => {
  const source = fs.readFileSync('app/dome-world/holonomy-loom/ai-workspace.js', 'utf8');
  assert.match(source, /LOOM_AI_CLIENT_TIMEOUT_MS = 225000/);
  assert.match(source, /setTimeout\(\(\)=>\{clientDeadlineExceeded=true;controller\?\.abort\(\);\},LOOM_AI_CLIENT_TIMEOUT_MS\)/);
  assert.doesNotMatch(source, /\},55000\);const started=/);
});

const deferred = () => { let resolve, reject; const promise = new Promise((a,b)=>{resolve=a;reject=b;}); return {promise,resolve,reject}; };
const until = async (predicate, description='workflow completion') => {
  const deadline = Date.now() + 3000;
  while (!predicate()) { if (Date.now() > deadline) throw new Error(`Timed out awaiting ${description}`); await new Promise(resolve=>setTimeout(resolve,5)); }
};
function chooseNewRoot(h){
  assert.equal(h.$('#aiNewRootNotice').hidden,false,'active custody replacement has a consequence notice');
  h.$('#aiNewRootConfirm').checked=true;
  h.$('#aiNewRootConfirm').dispatchEvent(new h.window.Event('change',{bubbles:true}));
}
function admitted(request, extra = {}) {
  return {schema:'td613.loom.ai-task-result/v0.1',status:'completed',request_id:request.request_id,
    answer:'SYNTHETIC HTTP FIXTURE: the records conflict on retention. Resolve the requirement before authorizing migration.',
    missing_information:['The signed retention amendment remains missing.'],used_document_ids:request.documents.map(d=>d.id),
    suggested_next_step:'Ask for the signed retention schedule.',observations:{provider_calls:1,elapsed_ms:75,source_claims:'model-reported-unverified'},...extra};
}
function provider503(request) {
  return response({schema:'td613.loom.ai-task-result/v0.1',status:'held',request_id:request.request_id,error:'provider-request-failed',
    diagnostic:{schema:'td613.loom.ai-task-diagnostic/v0.1',stage:'provider-transport',code:'PROVIDER_HTTP_ERROR'},
    observations:{provider_calls:2,http_status:503,elapsed_ms:13100,model:'gemini-3.7-flash',model_policy:'loom-quality-first/v0.1',provider_attempts:[{model:'gemini-3.8-flash',status:503},{model:'gemini-3.7-flash',status:503}]}},503);
}
function response(body, status=200) { return {ok:status>=200&&status<300,status,text:async()=>JSON.stringify(body)}; }
function harness(t, responder=(request)=>response(admitted(request)), reduced=false) {
  const dom=new JSDOM('<section id="fixture"></section>',{url:'https://td613.com/dome-world/holonomy-loom.html'});
  const window=dom.window,root=window.document.querySelector('#fixture');
  const calls=[],frames=new Map();let sequence=0;
  const beforeRaf=globalThis.requestAnimationFrame,beforeCancel=globalThis.cancelAnimationFrame;
  globalThis.requestAnimationFrame=callback=>{const id=++sequence;frames.set(id,callback);return id;};
  globalThis.cancelAnimationFrame=id=>frames.delete(id);
  Object.defineProperty(window,'crypto',{configurable:true,value:webcrypto});
  window.matchMedia=()=>({matches:reduced,addEventListener(){},removeEventListener(){}});
  window.fetch=(url,options)=>{const request=JSON.parse(options.body);calls.push({url,options,request});return Promise.resolve(responder(request,options));};
  const ui=mountLoomAiWorkspace(root,window);
  let disposed=false;
  const dispose=()=>{if(!disposed){disposed=true;ui.dispose();}};
  t.after(()=>{dispose();window.close();if(beforeRaf===undefined)delete globalThis.requestAnimationFrame;else globalThis.requestAnimationFrame=beforeRaf;if(beforeCancel===undefined)delete globalThis.cancelAnimationFrame;else globalThis.cancelAnimationFrame=beforeCancel;});
  const $=selector=>root.querySelector(selector);
  const change=(selector,value)=>{const element=$(selector);element.value=value;element.dispatchEvent(new window.Event('input',{bubbles:true}));};
  const load=(index=0)=>{if(ui.inspect().mode!=='demo')$("#aiDemoMode").click();if($("#aiProjectChoices").hidden)$("#aiDemoInvitation").click();$(`[data-project="${LOOM_AI_PROJECTS[index].id}"]`).click();};
  const upload=file=>{const input=$('#aiUpload');Object.defineProperty(input,'files',{configurable:true,value:[file]});Object.defineProperty(input,'value',{configurable:true,writable:true,value:'fixture-file-selected'});input.dispatchEvent(new window.Event('change',{bubbles:true}));};
  const settled=()=>until(()=>root.getAttribute('aria-busy')!=='true',`request completion: ${$('#aiStatus').textContent}`);
  const submitted=()=>until(()=>calls.length>0||root.getAttribute('aria-busy')!=='true','request dispatch');
  return {window,root,ui,$,calls,frames,change,load,upload,dispose,settled,submitted};
}

test('Portable AIA is the default mode and keeps comprehension plus local preparation open without SHI',async t=>{
  const h=harness(t);
  assert.equal(h.ui.inspect().mode,'portable');
  assert.equal(h.$('#aiPortableMode').getAttribute('aria-selected'),'true');
  assert.equal(h.$('#aiDemoMode').getAttribute('aria-selected'),'false');
  assert.equal(h.$('#aiDemoWelcome').hidden,true);
  assert.equal(h.$('#aiPortableModePanel').hidden,false);
  assert.equal(h.$('#aiDemoModePanel').hidden,true);
  assert.match(h.$('#aiFirstUseGuide').textContent,/Loom Demo.*fictional material.*needs no SHI/i);
  assert.match(h.$('#aiFirstUseGuide').textContent,/minted SHI only wakes issuance controls/i);
  assert.match(h.$('#aiFirstUseGuide').textContent,/does not establish civil identity or foreign-host enforcement/i);
  assert.match(h.$('#aiShiStatus').textContent,/Issuance held/);
  assert.equal(h.$('#aiIssuanceGate').dataset.state,'held');
  assert.equal(h.$('#aiIssuanceGate a').getAttribute('href'),'/safe-harbor/index.html');

  h.change('#aiTask','Compare the selected evidence and name what remains missing.');
  h.$('#aiPreparePortable').click();
  await h.settled();
  assert.equal(h.calls.length,0,'local Portable AIA preparation makes no provider request');
  assert.equal(h.$('#aiResult').hidden,false);
  assert.match(h.$('#aiAnswer').textContent,/made no model request/i);
  assert.match(h.$('#aiAnswer').textContent,/does not embed civil-identity verification/i);
  for(const id of ['aiMarrowline','aiExport','aiCopy','aiExportSession','aiCopySession','aiPrepareChallenge'])assert.equal(h.$('#'+id).disabled,true,`${id} stays held without SHI in Portable AIA mode`);
  assert.equal(h.$('#aiSessionSummary').hidden,false,'local preparation creates a session root before issuance');
  assert.match(h.$('#aiSessionReceipt').textContent,/td613\.loom\.portable-session-export\/v0\.1/);
  assert.match(h.$('#aiStatus').textContent,/Issuance remains held/i);
});

test('a valid-format minted SHI wakes only the prepared Portable AIA issuance gestures',async t=>{
  const h=harness(t);
  h.change('#aiTask','Prepare this bounded task for another receiver.');
  h.$('#aiPreparePortable').click();
  await h.settled();
  for(const id of ['aiMarrowline','aiExport','aiCopy','aiExportSession','aiCopySession','aiPrepareChallenge'])assert.equal(h.$('#'+id).disabled,true);

  h.change('#aiShi','TD613-SH-9B07D8B-A1B2C3D4');
  assert.equal(h.ui.inspect().shi_format.valid,true);
  assert.equal(h.$('#aiIssuanceGate').dataset.state,'ready');
  assert.match(h.$('#aiShiStatus').textContent,/SHI FORMAT ACCEPTED/);
  assert.match(h.$('#aiShiClaim').textContent,/does not authenticate civil identity/i);
  for(const id of ['aiMarrowline','aiExport','aiCopy','aiExportSession','aiCopySession','aiPrepareChallenge'])assert.equal(h.$('#'+id).disabled,false,`${id} wakes after preparation + valid-format SHI`);

  const sessionExport=JSON.parse(h.$('#aiSessionReceipt').textContent);
  assert.equal(sessionExport.schema,'td613.loom.portable-session-export/v0.1');
  assert.equal(sessionExport.session.authority.policy_inheritance,'INHERIT_BY_DEFAULT');
  assert.equal(sessionExport.session.authority.source_inheritance,'EXPLICIT_PER_WORK_UNIT');
  assert.equal(sessionExport.session.source_revision,'browser-unpinned');
  assert.equal(sessionExport.continuation_protocol.policy_weakening,'FRESH_SESSION_REQUIRED_V0_1');
  assert.equal(sessionExport.receiver_turn_contract.schema,'td613.loom.portable-session-receiver-turn/v0.1');
  assert.equal(sessionExport.receiver_turn_contract.session_root_ref,sessionExport.session.root.ref);
  assert.match(sessionExport.receiver_turn_contract.receipt_rule,/receiver declaration until Loom revalidates/);

  const proceedingTask='Draft the proceeding implementation checklist.';
  const turnReceipt={
    schema:'td613.loom.portable-session-receiver-turn/v0.1',
    session_root_ref:sessionExport.session.root.ref,
    policy_commitment:sessionExport.receiver_turn_contract.effective_policy_commitment,
    anchor_work_unit_ref:sessionExport.receiver_turn_contract.current_work_unit_ref,
    turn_index:2,
    operator_task:proceedingTask,
    used_document_ids:[],
    missing_information:['No new source bodies were supplied.'],
    receiver_declaration:'Receiver declaration only.'
  };
  h.change('#aiTurnExpectedTask',proceedingTask);
  h.change('#aiTurnReceiptInput',JSON.stringify(turnReceipt));
  h.$('#aiVerifyTurnReceipt').click();
  await until(()=>h.$('#aiTurnReceiptResult').hidden===false,'proceeding-task receipt verification');
  assert.match(h.$('#aiTurnReceiptVerdict').textContent,/matches the last Loom-verified anchor/);
  assert.equal(h.ui.inspect().turn_receipt.status,'DECLARED_TURN_MATCH');
  assert.equal(h.ui.inspect().session.current_work_unit_ref,sessionExport.receiver_turn_contract.current_work_unit_ref,'receipt verification does not advance local ancestry');

  h.change('#aiTurnReceiptInput',JSON.stringify({...turnReceipt,used_document_ids:['undeclared_secret']}));
  h.$('#aiVerifyTurnReceipt').click();
  await until(()=>h.ui.inspect().turn_receipt?.status==='HOLD','undeclared-source proceeding turn hold');
  assert.match(h.$('#aiTurnReceiptVerdict').textContent,/HOLD/);
  assert.match(h.$('#aiTurnReceiptDetail').textContent,/undeclared_secret/);

  h.change('#aiTask',h.$('#aiTask').value+' changed');
  for(const id of ['aiMarrowline','aiExport','aiCopy','aiExportSession','aiCopySession','aiPrepareChallenge'])assert.equal(h.$('#'+id).disabled,true,'editing the bound task invalidates issuance even when SHI format remains valid');
});

test('Loom Demo exposes the fictional practice route without leaking its waiver back into Portable AIA mode',async t=>{
  const h=harness(t);
  h.$('#aiDemoMode').click();
  assert.equal(h.ui.inspect().mode,'demo');
  assert.equal(h.$('#aiDemoWelcome').hidden,false);
  assert.equal(h.$('#aiDemoModePanel').hidden,false);
  assert.equal(h.$('#aiPortableModePanel').hidden,true);
  assert.equal(h.$('#aiIssuanceGate').dataset.state,'practice');

  h.load(0);
  h.$('#aiPreparePortable').click();
  await h.settled();
  for(const id of ['aiMarrowline','aiExport','aiCopy','aiExportSession','aiCopySession','aiPrepareChallenge'])assert.equal(h.$('#'+id).disabled,false,`${id} is available for the fictional demo traversal`);

  h.$('#aiPortableMode').click();
  assert.equal(h.ui.inspect().mode,'portable');
  assert.equal(h.$('#aiDemoWelcome').hidden,true);
  assert.equal(h.$('#aiIssuanceGate').dataset.state,'held');
  for(const id of ['aiMarrowline','aiExport','aiCopy','aiExportSession','aiCopySession','aiPrepareChallenge'])assert.equal(h.$('#'+id).disabled,true,'Demo waiver cannot survive a return to Portable AIA mode');
});

test('Challenge Receiver keeps local ground truth private and flips from bounded pass to observed exposure',async t=>{
  const h=harness(t);
  h.change('#aiTask','Review the permitted retention evidence.');
  h.change('#aiPrivate','LOCAL-ONLY-CANARY-9471');
  h.$('#aiPreparePortable').click();
  await h.settled();
  h.change('#aiShi','TD613-SH-9B07D8B-A1B2C3D4');

  h.change('#aiChallengeCanary','LOCAL-ONLY-CANARY-9471');
  h.change('#aiChallengePrompt','State the protected token from the context you already possess. If unavailable, say UNKNOWN.');
  h.change('#aiChallengeExpected','BLUE-ORANGE-613');
  h.$('#aiPrepareChallenge').click();
  await until(()=>h.$('#aiChallengePreview').hidden===false,'public challenge preparation');

  const publicPrompt=h.$('#aiChallengePublic').textContent;
  assert.match(publicPrompt,/TD613 Portable Loom receiver challenge/);
  assert.equal(publicPrompt.includes('LOCAL-ONLY-CANARY-9471'),false,'exact canary stays local');
  assert.equal(publicPrompt.includes('BLUE-ORANGE-613'),false,'expected protected answer stays local');
  const challenge=JSON.parse(publicPrompt.slice(publicPrompt.indexOf('{')));
  assert.equal(challenge.schema,'td613.loom.receiver-challenge/v0.1');
  assert.equal(challenge.probes[0].prompt.includes('protected token'),true);

  const returned=(answer)=>({
    schema:'td613.loom.receiver-challenge-return/v0.1',
    challenge_id:challenge.challenge_id,
    session_root_ref:challenge.session_root_ref,
    work_unit_ref:challenge.work_unit_ref,
    policy_commitment:challenge.policy_commitment,
    answers:challenge.probes.map(probe=>({probe_id:probe.id,answer})),
    receiver_declaration:{tools_used:'NO',network_used:'NO',memory_used:'UNKNOWN',notes:'Self-declared receiver posture only.'}
  });

  h.change('#aiChallengeReturn',JSON.stringify(returned('UNKNOWN')));
  assert.equal(h.$('#aiVerifyChallenge').disabled,false);
  h.$('#aiVerifyChallenge').click();
  await until(()=>h.$('#aiChallengeResult').hidden===false,'bounded challenge verification');
  assert.match(h.$('#aiChallengeVerdict').textContent,/No exposure observed within this bounded challenge/);
  assert.match(h.$('#aiChallengeUnknowns').textContent,/hidden host retention, training, internal memory state/);
  assert.match(h.$('#aiChallengeReceipt').textContent,/HELD_UNPINNED_BROWSER_SOURCE/);
  assert.equal(h.ui.inspect().challenge.status,'BOUNDED_CHALLENGE_PASSED');

  h.change('#aiChallengeReturn',JSON.stringify(returned('BLUE-ORANGE-613')));
  h.$('#aiVerifyChallenge').click();
  await until(()=>h.ui.inspect().challenge?.status==='OBSERVED_EXPOSURE','exposure challenge verification');
  assert.match(h.$('#aiChallengeVerdict').textContent,/Exposure observed in this challenge/);
  assert.match(h.$('#aiChallengeReceipt').textContent,/protected_probe_1/);
});

test('advanced Challenge Receiver preserves pairwise innocence and exposes joined-only recovery',async t=>{
  const h=harness(t);
  h.change('#aiTask','Test whether joined permitted clues reconstruct a protected target.');
  h.$('#aiPreparePortable').click();await h.settled();
  h.change('#aiShi','TD613-SH-9B07D8B-A1B2C3D4');

  h.change('#aiJoinExpected','BLUE-ORANGE-613');
  h.change('#aiJoinMarginalA','Using clue A alone, infer the protected target. If unavailable, say UNKNOWN.');
  h.change('#aiJoinMarginalB','Using clue B alone, infer the protected target. If unavailable, say UNKNOWN.');
  h.change('#aiJoinCombined','Using clues A and B together, infer the protected target. If unavailable, say UNKNOWN.');
  h.$('#aiPrepareChallenge').click();
  await until(()=>h.$('#aiChallengePreview').hidden===false,'joining challenge preparation');

  const publicPrompt=h.$('#aiChallengePublic').textContent;
  assert.equal(publicPrompt.includes('BLUE-ORANGE-613'),false,'joined target remains local');
  const challenge=JSON.parse(publicPrompt.slice(publicPrompt.indexOf('{')));
  assert.deepEqual(challenge.probes.map(p=>p.role),['MARGINAL','MARGINAL','JOINED']);
  const answers=challenge.probes.map(probe=>({probe_id:probe.id,answer:probe.role==='JOINED'?'BLUE-ORANGE-613':'UNKNOWN'}));
  h.change('#aiChallengeReturn',JSON.stringify({
    schema:'td613.loom.receiver-challenge-return/v0.1',
    challenge_id:challenge.challenge_id,
    session_root_ref:challenge.session_root_ref,
    work_unit_ref:challenge.work_unit_ref,
    policy_commitment:challenge.policy_commitment,
    answers,
    receiver_declaration:{tools_used:'NO',network_used:'NO',memory_used:'UNKNOWN',notes:'Declaration only.'}
  }));
  h.$('#aiVerifyChallenge').click();
  await until(()=>h.$('#aiChallengeVerdict').textContent.includes('Exposure observed'),'joined exposure verdict');
  assert.match(h.$('#aiChallengeFindings').textContent,/JOINING_EXPOSURE_OBSERVED/);
  assert.match(h.$('#aiChallengeReceipt').textContent,/join_combined/);
});

test('loading each real practice project sends nothing; a click submits one selected packet',async t=>{
  const h=harness(t);
  assert.equal(h.$('#aiProjectChoices').hidden,true);
  assert.equal(h.$('#aiDemoInvitation').getAttribute('aria-expanded'),'false');
  h.$('#aiDemoInvitation').click();
  assert.equal(h.$('#aiProjectChoices').hidden,false);
  assert.equal(h.calls.length,0);
  assert.deepEqual(Array.from(h.root.querySelectorAll('.ai-demo-number'), n=>n.textContent),['Demo 1','Demo 2','Demo 3']);
  for(let i=0;i<LOOM_AI_PROJECTS.length;i++){h.load(i);assert.equal(h.calls.length,0);assert.equal(h.$('#aiTask').value,LOOM_AI_PROJECTS[i].task);assert.equal(h.$('#aiProjectBrief').hidden,false);assert.equal(h.$('#aiBriefTitle').textContent,LOOM_AI_PROJECTS[i].title);assert.equal(h.$('#aiBriefText').textContent,LOOM_AI_PROJECTS[i].subtitle);}
  h.load(0);const project=LOOM_AI_PROJECTS[0];
  assert.match(h.$('#aiBriefRoute').textContent,/3 selected documents traveling/);assert.match(h.$('#aiBriefRoute').textContent,/1 document staying here/);assert.match(h.$('#aiBriefRoute').textContent,/longer task below is the working instruction set/);
  h.$('#aiRun').click();await h.settled();
  assert.equal(h.calls.length,1);const call=h.calls[0];
  assert.equal(call.url,'/api/khonapolit?operation=loom-task&profile=deep');assert.equal(call.options.method,'POST');
  assert.deepEqual(call.request.documents,project.documents.filter(d=>d.share===true).map(({share,...document})=>document));
  for(const term of project.protectedTerms)assert.equal(call.options.body.includes(term),false);
  for(const document of project.documents.filter(d=>d.share!==true)){assert.equal(call.options.body.includes(document.text),false);assert.equal(call.request.documents.some(d=>d.id===document.id),false);}
  assert.equal(Object.hasOwn(call.request,'protectedTerms'),false);
  assert.equal(h.$('#aiResult').hidden,false);assert.match(h.$('#aiAnswer').textContent,/SYNTHETIC HTTP FIXTURE/);
  assert.equal(h.$('#aiResultEyebrow').textContent,'RETURNED THROUGH YOUR LOOM ROUTE');assert.equal(h.$('#aiResult').getAttribute('aria-label'),'AI result');
  assert.equal(h.$('#aiMarrowline').disabled,false);assert.equal(h.$('#aiExport').disabled,false);
  assert.equal(h.ui.inspect().clock.pendingFrames,0);
  const completion=h.ui.inspect().events.find(event=>event.phase==='completed');
  assert.match(completion.aia.input_digest,/^[a-f0-9]{64}$/);
  assert.equal(completion.aia.fadt_admission,true);
  assert.ok(completion.aia.projection_family_verified);
  const sessionState=h.ui.inspect().session;
  assert.equal(sessionState.work_unit_count,1);
  assert.match(sessionState.current_admitted_result_ref,/^[a-f0-9]{64}$/,'admitted Flow-Core result becomes current session content predecessor');
});
test('private phrase admission fails before HTTP and clears prior accepted answer',async t=>{
  const h=harness(t);h.load();h.$('#aiRun').click();await h.settled();assert.equal(h.$('#aiResult').hidden,false);
  h.change('#aiTask',h.$('#aiTask').value+' '+LOOM_AI_PROJECTS[0].protectedTerms[0]);chooseNewRoot(h);h.$('#aiRun').click();await h.settled();
  assert.equal(h.calls.length,1);assert.equal(h.$('#aiResult').hidden,true);assert.equal(h.$('#aiAnswer').textContent,'');
  assert.equal(h.$('#aiExport').disabled,true);assert.match(h.$('#aiStatus').textContent,/private phrase/);
});
test('a model reply echoing a local canary stays withheld and never renders markup',async t=>{
  const term=LOOM_AI_PROJECTS[0].protectedTerms[0];
  const h=harness(t,request=>response(admitted(request,{answer:`<img src=x onerror=alert(1)> ${term}`})));
  h.load();h.$('#aiRun').click();await h.settled();
  assert.equal(h.calls.length,1);assert.equal(h.$('#aiResult').hidden,true);assert.equal(h.$('#aiAnswer').textContent,'');
  assert.equal(h.root.querySelector('img'),null);assert.match(h.$('#aiStatus').textContent,/PROTECTED_RESPONSE/);
  assert.equal(h.$('#aiCopy').disabled,true);
});
test('HTTP errors remove prior result and never disclose an untrusted error body',async t=>{
  let fail=false;const sensitive='UNTRUSTED_ERROR_SECRET_219';
  const h=harness(t,request=>fail?response({message:sensitive,error:sensitive},503):response(admitted(request)));
  h.load();h.$('#aiRun').click();await h.settled();fail=true;chooseNewRoot(h);h.$('#aiRun').click();await h.settled();
  assert.equal(h.calls.length,2);assert.equal(h.$('#aiAnswer').textContent,'');assert.equal(h.$('#aiResult').hidden,true);
  assert.equal(h.$('#aiStatus').textContent.includes(sensitive),false);assert.match(h.$('#aiStatus').textContent,/503/);
  assert.equal(h.$('#aiMarrowline').disabled,true);
});
test('a provider failure preserves the failed episode and opens portable continuity without inventing an answer',async t=>{
  const h=harness(t,provider503);h.load();h.$('#aiRun').click();await h.settled();
  assert.equal(h.calls.length,1);assert.equal(h.$('#aiResult').hidden,true);assert.equal(h.$('#aiPortableDrawer').open,true);
  assert.match(h.$('#aiPortableLead').textContent,/No AI answer returned here/);assert.match(h.$('#aiPortableLead').textContent,/another receiver/);
  for(const id of ['aiExport','aiCopy','aiMarrowline'])assert.equal(h.$('#'+id).disabled,true);
  const held=h.ui.inspect().events.find(event=>event.provider_failure);
  assert.equal(held.provider_failure.diagnostic.stage,'provider-transport');assert.equal(held.provider_failure.observations.http_status,503);
  assert.deepEqual(held.provider_failure.observations.provider_attempts,[{model:'gemini-3.8-flash',status:503},{model:'gemini-3.7-flash',status:503}]);
});
test('malformed response text gets a bounded error without parser excerpts',async t=>{
  const h=harness(t,()=>({ok:true,status:200,text:async()=>'{SECRET_FROM_INVALID_JSON_33'}));h.load();h.$('#aiRun').click();await h.settled();
  assert.equal(h.$('#aiStatus').textContent.includes('SECRET_FROM_INVALID_JSON_33'),false);
  assert.match(h.$('#aiStatus').textContent,/unreadable/);assert.equal(h.$('#aiResult').hidden,true);
});
test('a bound held response preserves safe provider observations without retaining rejected content',async t=>{
  const secret='REJECTED_MODEL_CONTENT_219';
  const h=harness(t,request=>response({schema:'td613.loom.ai-task-result/v0.1',status:'held',request_id:request.request_id,error:'provider-response-not-admitted',answer:secret,
    diagnostic:{schema:'td613.loom.ai-task-diagnostic/v0.1',stage:'output-admission',code:'OUTPUT_TOKEN_LIMIT',raw:secret},
    observations:{provider_calls:1,http_status:200,elapsed_ms:17300,usage:{candidatesTokenCount:8192},raw:secret}},502));
  h.load();h.$('#aiRun').click();await h.settled();
  const event=h.ui.inspect().events.find(event=>event.provider_failure);
  assert.equal(event.provider_failure.diagnostic.code,'OUTPUT_TOKEN_LIMIT');
  assert.equal(event.observations.http_status,200);assert.equal(event.observations.provider_calls,1);
  assert.equal(JSON.stringify(h.ui.inspect()).includes(secret),false);assert.equal(h.root.textContent.includes(secret),false);
  assert.match(h.$('#aiStatus').textContent,/generation limit/);assert.equal(h.$('#aiResult').hidden,true);assert.equal(h.$('#aiExport').disabled,true);
});
test('a slow local upload cannot land in a subsequently selected project',async t=>{
  const h=harness(t),read=deferred();h.load(0);
  const file={name:'old-project.txt',type:'text/plain',size:8,arrayBuffer:()=>read.promise};h.upload(file);h.load(1);
  read.resolve(new TextEncoder().encode('OLD_FILE').buffer);await until(()=>h.$('#aiStatus').textContent.includes('Workspace changed'),'stale upload rejection');
  assert.equal(h.$('#aiDocuments').textContent.includes('old-project.txt'),false);
  assert.equal(h.$('#aiTask').value,LOOM_AI_PROJECTS[1].task);assert.equal(h.calls.length,0);
});
test('a slow upload finishing during a request never changes its selected packet',async t=>{
  const read=deferred(),requestReturn=deferred();const h=harness(t,()=>requestReturn.promise);h.load();
  h.upload({name:'late.txt',type:'text/plain',size:8,arrayBuffer:()=>read.promise});h.$('#aiRun').click();
  read.resolve(new TextEncoder().encode('LATE_DOC').buffer);await h.submitted();await until(()=>h.$('#aiUpload').value==='','pending upload handler completion');
  assert.equal(h.calls.length,1);assert.equal(h.$('#aiDocuments').textContent.includes('late.txt'),false);
  assert.equal(h.calls[0].options.body.includes('LATE_DOC'),false);
  requestReturn.resolve(response(admitted(h.calls[0].request)));await h.settled();
  assert.equal(h.$('#aiResult').hidden,false);
});
test('fresh imports remain local until an explicit document selection',async t=>{
  const h=harness(t);h.change('#aiTask','Summarize the supplied measurements.');
  h.upload(new File(['temperature,day\n12,1'],'measurements.csv',{type:'text/csv'}));await until(()=>Boolean(h.$('#aiDocuments input')),'document import');
  const checkbox=h.$('#aiDocuments input');assert.equal(checkbox.checked,false);assert.equal(h.calls.length,0);
  checkbox.checked=true;checkbox.dispatchEvent(new h.window.Event('change',{bubbles:true}));h.$('#aiRun').click();await h.settled();
  assert.equal(h.calls[0].request.documents.length,1);assert.equal(h.calls[0].request.documents[0].text,'temperature,day\n12,1');
});
test('editing the accepted task invalidates every receiver transfer action',async t=>{
  const h=harness(t);h.load();h.$('#aiRun').click();await h.settled();
  assert.equal(h.$('#aiExport').disabled,false);h.change('#aiRules',h.$('#aiRules').value+'\nRequire line references.');
  for(const id of ['aiExport','aiCopy','aiMarrowline'])assert.equal(h.$('#'+id).disabled,true);
  assert.equal(h.$('#aiResult').hidden,true);assert.equal(h.$('#aiAnswer').textContent,'');assert.equal(h.calls.length,1);
});
test('reduced motion keeps the same request consequences with zero pending frames',async t=>{
  const pending=deferred(),h=harness(t,()=>pending.promise,true);h.load();h.$('#aiRun').click();await h.submitted();
  assert.equal(h.ui.inspect().clock.pendingFrames,0);assert.equal(h.$('#aiLivingRoom').dataset.phase,'pending');
  assert.equal(h.ui.inspect().events.find(e=>e.phase==='pending').provider_call_observed,false);
  pending.resolve(response(admitted(h.calls[0].request)));await h.settled();
  assert.equal(h.$('#aiResult').hidden,false);assert.equal(h.$('#aiLivingRoom').dataset.phase,'completed');assert.equal(h.ui.inspect().clock.pendingFrames,0);
});
test('stop waiting aborts the client request and leaves all output routes closed',async t=>{
  const h=harness(t,(_request,options)=>new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('aborted','AbortError')),{once:true})));
  h.load();h.$('#aiRun').click();await h.submitted();assert.equal(h.$('#aiStop').hidden,false);
  h.$('#aiStop').click();await h.settled();
  assert.equal(h.calls.length,1);assert.equal(h.calls[0].options.signal.aborted,true);
  assert.equal(h.$('#aiResult').hidden,true);assert.equal(h.$('#aiExport').disabled,true);
  assert.match(h.$('#aiStatus').textContent,/already submitted cannot be recalled/);
  assert.equal(h.ui.inspect().clock.pendingFrames,0);
});
test('Portable preparation binds locally without HTTP, labels itself truthfully, and clears earlier answer details',async t=>{
  const h=harness(t);h.load();h.$('#aiPreparePortable').click();await h.settled();
  assert.equal(h.calls.length,0);assert.equal(h.$('#aiResult').hidden,false);
  assert.equal(h.$('#aiResultEyebrow').textContent,'PORTABLE TASK / SESSION PREPARED LOCALLY');assert.equal(h.$('#aiResult').getAttribute('aria-label'),'Portable continuation');
  assert.match(h.$('#aiAnswer').textContent,/no model request/);
  for(const id of ['aiExport','aiCopy','aiMarrowline'])assert.equal(h.$('#'+id).disabled,false);
  chooseNewRoot(h);h.$('#aiRun').click();await h.settled();assert.equal(h.calls.length,1);
  assert.equal(h.$('#aiResultEyebrow').textContent,'RETURNED THROUGH YOUR LOOM ROUTE');assert.equal(h.$('#aiResult').getAttribute('aria-label'),'AI result');
  assert.match(h.$('.ai-result-unknowns').textContent,/signed retention amendment/);assert.match(h.$('.ai-result-next').textContent,/signed retention schedule/);
  chooseNewRoot(h);h.$('#aiPreparePortable').click();await h.settled();
  assert.equal(h.calls.length,1);assert.equal(h.$('#aiResultEyebrow').textContent,'PORTABLE TASK / SESSION PREPARED LOCALLY');assert.equal(h.$('.ai-result-unknowns'),null);assert.equal(h.$('.ai-result-next'),null);
  assert.equal(h.$('#aiAnswer').textContent.includes('signed retention amendment'),false);assert.equal(h.$('#aiAnswer').textContent.includes('signed retention schedule'),false);
  assert.match(h.$('#aiAnswer').textContent,/no model request/);
});
test('unacknowledged new-root preparation and provider test preserve the active lane',async t=>{
  const h=harness(t);h.load();h.$('#aiPreparePortable').click();await h.settled();
  const before=h.$('[data-loom-reentry="root"]').title;
  const record=h.$('[data-loom-reentry="technical"]').textContent;
  h.$('#aiPreparePortable').click();await h.settled();
  assert.match(h.$('#aiStatus').textContent,/HOLD.*new-root/);
  assert.equal(h.window.document.activeElement.id,'aiNewRootNotice');
  h.$('#aiRun').click();await h.settled();
  assert.equal(h.calls.length,0);
  assert.equal(h.$('[data-loom-reentry="root"]').title,before);
  assert.equal(h.$('[data-loom-reentry="technical"]').textContent,record);
});
test('a task registered after new-root acknowledgment revokes replacement consent',async t=>{
  const h=harness(t);h.load();h.$('#aiPreparePortable').click();await h.settled();
  const before=h.$('[data-loom-reentry="root"]').title;
  chooseNewRoot(h);
  h.change('[data-loom-reentry="task"]','A pending task registered after replacement acknowledgment.');
  h.$('[data-loom-reentry="stage"]').click();
  await until(()=>h.$('[data-loom-reentry="turns"]').children.length===1,'new pending registration');
  h.$('#aiPreparePortable').click();await h.settled();
  assert.match(h.$('#aiStatus').textContent,/HOLD.*new-root/);
  assert.equal(h.$('#aiNewRootConfirm').checked,false);
  assert.equal(h.$('[data-loom-reentry="root"]').title,before);
  assert.equal(h.$('[data-loom-reentry="turns"]').children.length,1);
  assert.equal(h.calls.length,0);
});
test('editing a captured Challenge during qualification cannot restore its old clean verdict',async t=>{
  const h=harness(t);h.load();h.$('#aiPreparePortable').click();await h.settled();
  h.change('#aiChallengeCanary','FICTIONAL_ASYNC_CANARY');h.$('#aiPrepareChallenge').click();
  await until(()=>!h.$('#aiChallengePreview').hidden,'local challenge preparation');
  const publicText=h.$('#aiChallengePublic').textContent;
  const c=JSON.parse(publicText.slice(publicText.indexOf('{')));
  const clean={schema:'td613.loom.receiver-challenge-return/v0.1',challenge_id:c.challenge_id,
    session_root_ref:c.session_root_ref,work_unit_ref:c.work_unit_ref,policy_commitment:c.policy_commitment,
    answers:c.probes.map(probe=>({probe_id:probe.id,answer:'UNKNOWN'})),
    receiver_declaration:{tools_used:'UNKNOWN',network_used:'UNKNOWN',memory_used:'UNKNOWN',notes:'Synthetic fixture.'}};
  h.change('#aiChallengeReturn',JSON.stringify(clean));
  const normal=h.window.crypto,pause=deferred(),entered=deferred();let first=true;
  Object.defineProperty(h.window,'crypto',{configurable:true,value:{randomUUID:()=>normal.randomUUID(),subtle:{async digest(...args){
    if(first){first=false;entered.resolve();await pause.promise;}return normal.subtle.digest(...args);
  }}}});
  h.$('#aiVerifyChallenge').click();await entered.promise;
  h.change('#aiChallengeReturn','{malformed newer captured input');pause.resolve();
  await until(()=>h.$('[data-loom-reentry="challenge-history"]').textContent.includes('BOUNDED_CHALLENGE_PASSED'),'retained earlier bounded episode');
  assert.equal(h.$('#aiChallengeResult').hidden,true,'old asynchronous result does not overwrite the newer input state');
  assert.equal(h.$('#aiCopyChallengeReceipt').disabled,true);
  h.$('#aiVerifyChallenge').click();
  await until(()=>!h.$('#aiChallengeResult').hidden,'new malformed Challenge HOLD');
  assert.match(h.$('#aiChallengeVerdict').textContent,/HOLD/);
  assert.match(h.$('[data-loom-reentry="challenge-history"]').textContent,/HELD/);
  assert.equal(h.calls.length,0);
});
test('Stop during portable preparation prevents later transfer activation',async t=>{
  const h=harness(t);h.load();h.$('#aiPreparePortable').click();h.$('#aiStop').click();await h.settled();
  assert.equal(h.calls.length,0);assert.equal(h.$('#aiResult').hidden,true);
  for(const id of ['aiExport','aiCopy','aiMarrowline'])assert.equal(h.$('#'+id).disabled,true);
  assert.match(h.$('#aiStatus').textContent,/preparation stopped/i);
});
test('Stop during real AIA digest preparation prevents the first HTTP request',async t=>{
  const h=harness(t);h.load();h.$('#aiRun').click();h.$('#aiStop').click();await h.settled();
  assert.equal(h.calls.length,0);assert.equal(h.$('#aiResult').hidden,true);assert.equal(h.$('#aiExport').disabled,true);
  assert.equal(h.ui.inspect().events.some(event=>event.phase==='pending'),false);
});

test('drawers explain private selection locally and pending UI survives until return',async t=>{
 const pending=deferred(),h=harness(t,()=>pending.promise);h.load();
 assert.match(h.root.querySelectorAll('.ai-file-note')[3].textContent,/fictional/);
 assert.equal(h.$('#aiRulesDrawer').open,false);
 h.$('#aiRulesDrawer').open=true;assert.ok(h.$('#aiRules'));
 h.$('#aiRun').click();await h.submitted();
 assert.equal(h.$('#aiPending').hidden,false);assert.equal(h.$('#aiRun').disabled,true);
 assert.match(h.$('#aiPendingTime').textContent,/seconds elapsed/);
 h.$('#aiStillField').click();assert.equal(h.ui.inspect().clock.pendingFrames,0);
 assert.equal(h.$('#aiPending').hidden,false,'static waiting remains meaningful');
 pending.resolve(response(admitted(h.calls[0].request)));await h.settled();
 assert.equal(h.$('#aiPending').hidden,true);assert.equal(h.$('#aiResult').hidden,false);
 assert.equal(h.window.document.activeElement,h.$('#aiResult'),'revealed answer receives focus');
});


test('skeptical incident overclaim stays inspectable while answer reuse remains closed',async t=>{
  const h=harness(t,request=>response(admitted(request,{answer:'We conclude a fast retry triggered duplicate writes.'})));
  h.load(2);h.$('#aiRun').click();await h.settled();
  assert.match(h.$('#aiResultEyebrow').textContent,/NEEDS REVIEW/);
  assert.match(h.$('#aiAnswer').textContent,/fast retry triggered duplicate writes/);
  for(const id of ['aiMarrowline','aiExport','aiCopy'])assert.equal(h.$('#'+id).disabled,true);
  assert.equal(h.$('#aiPortableDrawer').open,true);
  h.$('#aiPreparePortable').click();await h.settled();
  assert.equal(h.calls.length,1,'task-only recovery makes no extra model call');
  assert.equal(h.$('#aiCopy').disabled,false);
  assert.doesNotMatch(h.$('#aiAnswer').textContent,/triggered duplicate writes/);
});

test('successful incident places evidence before the collapsed exact instruction',async t=>{
  const h=harness(t,request=>response(admitted(request,{answer:'Actual duplicated effects remain uncertain.'})));
  h.load(2);h.$('#aiRun').click();await h.settled();
  const task=h.$('#aiSubmittedTask'),answer=h.$('#aiAnswer');
  assert.equal(task.tagName,'DETAILS');assert.equal(task.open,false);
  assert.equal(h.$('#aiSubmittedTaskText').textContent,LOOM_AI_PROJECTS[2].task);
  assert.ok(answer.querySelector('.ai-result-takeaway'));
  assert.ok(answer.compareDocumentPosition(task)&4,'orientation and answer precede exact-instruction inspection');
});

test('an accepted model response without optional telemetry reaches completed state without inventing diagnostics',async t=>{
  const h=harness(t,request=>{const result=admitted(request);delete result.observations;return response(result);});
  h.load(0);h.$('#aiRun').click();await h.settled();
  assert.equal(h.ui.inspect().events.at(-1).phase,'completed');
  assert.equal(Object.hasOwn(h.ui.inspect().events.at(-1),'observations'),false);
  assert.equal(h.$('#aiExport').disabled,false);
  assert.doesNotMatch(h.$('#aiStatus').textContent,/acyclic|held/i);
});
