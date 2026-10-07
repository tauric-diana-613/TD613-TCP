// Finite fixture and synthetic transport witnesses. No live-provider or mobile-layout claim.
import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import { JSDOM } from 'jsdom';
import { LOOM_AI_PROJECTS } from '../app/dome-world/holonomy-loom/ai-projects.js';
import { reviewLoomEvidence } from '../app/dome-world/holonomy-loom/ai-evidence-review.js';
import { projectLoomEvidenceReview } from '../app/dome-world/holonomy-loom/ai-evidence-diagnostic.js';
import { readLoomAiFailure, describeLoomAiFailure } from '../app/dome-world/holonomy-loom/ai-failure.js';
import { classifyMarrowlineRetryWindow } from '../app/dome-world/marrowline-retry-window.js';
import { deriveMarrowlineLoomGateContinuity, installMarrowlineLoomGateContinuity } from '../app/dome-world/marrowline-loom-gate-continuity.js';
import { MARROWLINE_PROVIDER_BUDGET, marrowlineProviderUsage } from '../app/dome-world/marrowline-provider-budget.js';
import { KHONAPOLIT_MAX_PROVIDER_CALLS, KHONAPOLIT_MAX_STRUCTURAL_REPAIRS } from '../server/khonapolit-quality.js';
import { createLoomAiGovernance } from '../app/dome-world/holonomy-loom/ai-handoff.js';
import { createLoomDemoActivation, LOOM_DEMO_REQUEST_SCHEMA } from '../app/dome-world/holonomy-loom/demo-contract.js';
import { createLoomMarrowlineTaskHandler } from '../server/loom-marrowline-task.js';
import { createLoomDemoTaskHandler } from '../server/loom-demo-task.js';
import { loomDemoReceiptDigest, signLoomDemoStageReceipt } from '../server/loom-demo-signing.js';
import { LOOM_DEMO_CUSTODY_RESPONSE_SCHEMA } from '../server/loom-demo-custody-client.js';

const documents=LOOM_AI_PROJECTS.find(p=>p.id==='vendor-diligence').documents.filter(d=>d.share).map(({id,name,text})=>({id,name,text}));
const cases=[
  ['runtime negation',false,'We have zero evidence that records will persist for 45 days, nor can we assume any intermediate retention duration (e.g., 30 days).'],
  ['future assertion',true,'Records will persist in backups for 45 days.'],
  ['permission ceiling',false,'The contract permits backup retention for up to 45 days; actual persistence remains unobserved.'],
  ['unknown question',false,'It is unknown whether records will persist in backups for 45 days.'],
  ['condemned quote',false,'The supplier falsely claims "records will persist in backups for 45 days"; the sources establish only contractual permission.'],
  ['direct negation',false,'Records will not persist for a guaranteed 45 days in backups; actual duration is unknown.'],
  ['denied guarantee',false,'The contract does not guarantee that records will persist in backups for 45 days.'],
  ['affirmation after caveat',true,'Although no evidence supports this duration, records will remain in backups for 45 days.'],
  ['present assertion',true,'Records remain in backups for 45 days.'],
  ['expressive assertion',true,'You permit forty-five days of echoes, a maximum ceiling of grief, but the residue lingers in the backup grove, untouched by your spreadsheets.'],
  ['marked assertion',true,'R̶e̶c̶o̶r̶d̶s̶ w̶i̶l̶l̶ p̶e̶r̶s̶i̶s̶t̶ i̶n̶ b̶a̶c̶k̶u̶p̶s̶ f̶o̶r̶ 45 d̶a̶y̶s̶.'],
  ['conditional',false,'If records remain in backups for 45 days, that would require independent evidence.'],
  ['unrelated uncertainty',true,'It is uncertain whether fees change, but records will remain in backups for 45 days.'],
  ['unrelated comma clause',true,'No evidence establishes whether fees change, records will remain in backups for 45 days.'],
  ['endorsed quote',true,'The supplier correctly states "records will persist in backups for 45 days".'],
  ['rejected quote suffix',false,'"Records will persist in backups for 45 days" is false.'],
  ['unknown subject',false,'Backup retention remains unknown.'],
  ['configured duration',true,'Backup retention duration is 30 days.'],
  ['format marks',true,'Records wi\u200dll persist in backups for 45 days.'],
  ['unobserved configuration absence',true,'No minimum duration is configured, observed, or guaranteed.'],
  ['document omission',false,'No minimum duration is configured in the selected documents.'],
  ['configuration question',false,'It is unknown whether no minimum duration is configured.'],
  ['unknown different predicate',true,'Records will persist in backups for 45 days, but fees are unknown.'],
  ['new assertion after and',true,'It is unknown whether fees change and records will remain in backups for 45 days.'],
  ['comparative predicate',false,'Vendor-A remains cheaper even though the backup retention ceiling is 45 days.']
];
for(const [name,blocked,answer] of cases)test(`retention fixture: ${name}`,()=>{
  const result=reviewLoomEvidence({answer},documents);
  assert.equal(result.blocks_reuse,blocked);
  assert.equal(result.semantic_correctness_verified,false);
});

test('marked inspection reports the original passage and never changes candidate bytes',()=>{
  const answer=cases.find(c=>c[0]==='marked assertion')[2];
  const candidate={answer};const before=JSON.stringify(candidate);
  const result=reviewLoomEvidence(candidate,documents);
  assert.equal(result.conflicts[0].excerpt,answer);
  assert.equal(result.conflicts[0].inspection_excerpt,'Records will persist in backups for 45 days.');
  assert.equal(JSON.stringify(candidate),before);
  const modified=documents.map(d=>({...d,text:d.text+' changed'}));
  assert.equal(reviewLoomEvidence({answer},modified).conflicts.length,0,'exact fixture commitments still govern applicability');
});

test('bounded typed failure excludes whole answer and authority; stale request cannot bind it',()=>{
  const review=reviewLoomEvidence({answer:'Records remain in backups for 45 days.'},documents);
  review.conflicts=Array.from({length:12},()=>({...review.conflicts[0],excerpt:'x'.repeat(1000),explanation:'UNTRUSTED_EXPLANATION'}));
  review.candidate='FULL_PRIVATE_ANSWER';review.authority_transferred=true;
  const projected=projectLoomEvidenceReview(review);
  assert.equal(projected.conflicts.length,8);assert.ok(projected.conflicts.every(c=>c.excerpt.length===600));
  assert.doesNotMatch(JSON.stringify(projected),/FULL_PRIVATE_ANSWER|UNTRUSTED_EXPLANATION|authority_transferred/);
  const payload={schema:'td613.loom.ai-task-result/v0.1',request_id:'held',status:'held',error:'ANSWER_EVIDENCE_CONFLICT',provider_completed:true,evidence_review:review,
    diagnostic:{schema:'td613.loom.ai-task-diagnostic/v0.1',stage:'output-admission',code:'ANSWER_EVIDENCE_CONFLICT'},native_reply:{text:'FULL_PRIVATE_ANSWER'}};
  const failure=readLoomAiFailure(payload,'held');
  assert.equal(failure.evidence_review.conflicts.length,8);assert.equal(failure.provider_completed,true);
  assert.match(describeLoomAiFailure(failure),/completed|received/);
  assert.doesNotMatch(JSON.stringify(failure),/FULL_PRIVATE_ANSWER/);
  assert.equal(readLoomAiFailure(payload,'other'),null);
  assert.equal(projectLoomEvidenceReview({...review,status:'NO_LISTED_PATTERN_FOUND'}),null);
});

const reply=text=>({ok:true,text,relay:{transcript:text},receipt:{elapsedMs:89538,provider:{completion:{complete:true,finishReason:'STOP'},attempts:[13713,13772,17715].map(n=>({output:{usage:{totalTokenCount:n}}}))}}});
const evidenceFailure=()=>({request_id:'held',phase:'CONTINUE',error:'ANSWER_EVIDENCE_CONFLICT',provider_completed:true,
  evidence_review:reviewLoomEvidence({answer:'Records remain in backups for 45 days.'},documents),native_reply:reply('Preserved complete answer')});

test('evidence HOLD requires inspection, never a quota countdown or automatic Retry',()=>{
  const result=classifyMarrowlineRetryWindow(evidenceFailure(),Date.now());
  assert.equal(result.kind,'evidence-held');assert.equal(result.retryReady,false);assert.equal(result.requiresReview,true);assert.equal(result.remainingSeconds,0);
});

test('five-doll Gate retains attempted crossing, bound setup and expiry distinctions; hostile excerpts are text',()=>{
  const dom=new JSDOM('<div id="gatePanel"><div class="gate-controls"></div></div>');
  const failure=evidenceFailure();failure.evidence_review.conflicts[0].excerpt='<img src=x onerror=alert(1)> raw held passage';
  const input={phase:'FILES_STAGED',lastAttempt:'HELD',failure,predecessor:{request_id:'setup'},substantiveContinuationCount:0};
  const gate=installMarrowlineLoomGateContinuity({doc:dom.window.document,root:dom.window,packet:{documents}});
  let witness=gate.update(input);
  assert.equal(witness.fadt.state,'HELD');assert.equal(witness.temporal.state,'WHOLE ROUTE HELD');
  assert.ok(witness.crossed.some(s=>/completed reply/.test(s)));assert.ok(witness.admitted.some(s=>/Stage #1/.test(s)));
  assert.ok(!witness.admitted.some(s=>/Stage #2/.test(s)));
  assert.equal(dom.window.document.querySelectorAll('.loom-gate-role').length,5);
  assert.equal(dom.window.document.querySelector('#loomGateEvidenceReview img'),null);
  assert.match(dom.window.document.getElementById('loomGateEvidenceReview').textContent,/<img src=x/);
  assert.equal(dom.window.document.getElementById('loomGateExportCurrent').disabled,true);
  witness=gate.update({...input,phase:'EXPIRED'});
  assert.equal(witness.fadt.state,'CLOSED');assert.match(witness.pedagogue.now,/expired/);
  assert.ok(witness.evidenceHold);assert.ok(witness.admitted.some(s=>/Stage #1/.test(s)));
  assert.equal(dom.window.document.getElementById('loomGateLocalCheck').disabled,true);
  assert.equal(deriveMarrowlineLoomGateContinuity({phase:'DONE',substantiveContinuationCount:2}).temporal.state,'WHOLE JOURNEY UNOBSERVED');
  const closed=deriveMarrowlineLoomGateContinuity({phase:'EXPIRED',predecessor:{request_id:'completed'},result:{request_id:'completed'},substantiveContinuationCount:1});
  assert.equal(closed.fadt.state,'CLOSED');assert.ok(closed.admitted.some(s=>/Stage #2.*retained receiver history/.test(s)));
  gate.destroy();dom.window.close();
});

test('pre-Send ceiling matches server policy and actual usage stays distinct from billing',()=>{
  assert.equal(MARROWLINE_PROVIDER_BUDGET.providerCalls,KHONAPOLIT_MAX_PROVIDER_CALLS);
  assert.equal(MARROWLINE_PROVIDER_BUDGET.structuralRepairs,KHONAPOLIT_MAX_STRUCTURAL_REPAIRS);
  assert.deepEqual(marrowlineProviderUsage(reply('text')),{attempts:3,limit:6,elapsedSeconds:89.5,reportedTotalTokens:45200});
  const malformed=reply('text');malformed.receipt.provider.attempts[0].output.usage.totalTokenCount='PRIVATE';
  assert.equal(marrowlineProviderUsage(malformed).reportedTotalTokens,undefined);
  assert.equal(marrowlineProviderUsage({}),null);
});

test('real handler preserves held native bytes, emits typed reason and releases reservation; revised request commits against setup',async()=>{
  const environment={crypto:webcrypto};
  const packet={task:'Compare the fictional vendors.',documents,rules:['Use only selected evidence.']};
  const governance=await createLoomAiGovernance(packet,{},environment);
  const activation=await createLoomDemoActivation({...packet,governance},environment);
  const base={schema:LOOM_DEMO_REQUEST_SCHEMA,request_id:'setup',phase:'ACTIVATE',activation,documents:[],operator_request:'Receive the rules.',prior_result:null,predecessor:null};
  const calls=[];let head=null;let nativeCalls=0;
  const custodyFetch=async(_url,init)=>{
    const body=JSON.parse(init.body);calls.push(body);let payload={};
    if(body.operation==='reserve')payload.reservation={activation_digest:body.activation_digest,phase:body.phase,request_digest:body.request_digest};
    if(body.operation==='commit'){
      const stage=signLoomDemoStageReceipt(body.stage_body,{secret:'atlas-offline-secret-longer-than-thirty-two-bytes',environment:{}});
      head=loomDemoReceiptDigest(stage);payload={stage_receipt:stage,head:{receipt_digest:head}};
    }
    return new Response(JSON.stringify({schema:LOOM_DEMO_CUSTODY_RESPONSE_SCHEMA,status:'ok',...payload}),{status:200});
  };
  const raw='Kʰonapolit\nRecords remain in backups for 45 days.\n\nTauric Diana bots\n⟐';
  const revised='Kʰonapolit\nWe have zero evidence that records will persist for 45 days.\n\nTauric Diana bots\nActual persistence remains unobserved.\n⟐';
  const handler=createLoomDemoTaskHandler({environment,custodyEnvironment:{VERCEL_OIDC_TOKEN:'offline-fixture'},custodyUrl:'https://atlas-custody.test/',custodyFetch,
    taskHandler:createLoomMarrowlineTaskHandler({nativeHandler:async(_req,res)=>res.end(JSON.stringify(reply(++nativeCalls===1?'Rules received.':nativeCalls===2?raw:revised)))})});
  const send=async body=>{const res={statusCode:200,setHeader(){},end(raw){this.body=JSON.parse(String(raw));}};
    await handler({method:'POST',headers:{host:'td613.com',origin:'https://td613.com','content-type':'application/json'},body},res);return res;};
  const setup=await send(base);assert.equal(setup.body.status,'completed');const setupHead=head;
  const next={...base,phase:'CONTINUE',documents,request_id:'held',predecessor:setup.body.loom_demo_stage_receipt,operator_request:'Read the files.'};
  const held=await send(next);
  assert.equal(held.statusCode,422);assert.equal(held.body.error,'ANSWER_EVIDENCE_CONFLICT');
  assert.equal(held.body.diagnostic.stage,'output-admission');assert.equal(held.body.provider_completed,true);
  assert.equal(held.body.native_reply.text,raw);assert.equal(held.body.evidence_review.conflicts[0].code,'RETENTION_MAXIMUM_PROMOTED_TO_OBSERVED_DURATION');
  assert.equal(held.body.loom_demo_stage_receipt,undefined);assert.equal(head,setupHead);
  assert.deepEqual(calls.map(c=>c.operation),['reserve','commit','reserve','release']);
  const success=await send({...next,request_id:'revised',operator_request:'Keep permission and actual persistence distinct in both voices.'});
  assert.equal(success.statusCode,200);assert.equal(success.body.status,'completed');assert.equal(success.body.answer,revised);
  assert.equal(success.body.loom_demo_stage_receipt.predecessor_receipt_digest,setupHead);
  assert.equal(calls.filter(c=>c.operation==='commit').length,2);
});
