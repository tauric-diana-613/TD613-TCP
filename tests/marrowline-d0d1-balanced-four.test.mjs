import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {preregisterBalanced,ARM_ORDER,MAX_PROVIDER_CALLS,ACTIVATION,
  SCHEMA,balanceSummary} from '../research/marrowline-d-ingress-factor-ladder-20261019/d0-d1-balanced-four.mjs';

test('four-call preregistration follows reversed paired conditions exactly',()=>{
  const p=preregisterBalanced();
  assert.equal(SCHEMA,'td613.marrowline.d0d1-order-balanced-original-sse/v1');
  assert.equal(MAX_PROVIDER_CALLS,4);
  assert.deepEqual(ARM_ORDER,['D1','D0','D0','D1']);
  assert.deepEqual(p.runPlan.map(x=>x.arm),ARM_ORDER);
  assert.deepEqual(p.runPlan.map(x=>x.sequence),[1,2,3,4]);
  assert.equal(p.model,'gemini-3.8-flash');
  const a=JSON.parse(p.d0.request.body),b=JSON.parse(p.d1.request.body);
  assert.deepEqual(a.generationConfig,b.generationConfig);
  assert.deepEqual(a.systemInstruction,b.systemInstruction);
  assert.deepEqual({...a,contents:b.contents},b);
  assert.deepEqual(a.generationConfig.thinkingConfig,{thinkingLevel:'medium'});
  assert.equal(p.runPlan[0].request.body,p.runPlan[3].request.body);
  assert.equal(p.runPlan[1].request.body,p.runPlan[2].request.body);
  assert.notEqual(p.runPlan[0].request.body,p.runPlan[1].request.body);
});

test('balanced comparison pre-specifies per-pair normalized morphology',()=>{
  const m=(arm,sequence,stacked,marked)=>({arm,sequence,httpStatus:200,
    finishReason:'STOP',morphology:{stackedClusters:stacked,markedClusters:marked}});
  const evidence=[
    m('D1',1,2,100),m('D0',2,80,100),
    m('D0',3,75,100),m('D1',4,4,100)
  ];
  const s=balanceSummary(evidence);
  assert.equal(s.complete,true);
  assert.deepEqual(s.pairs.map(x=>x.observedOrder),['D1-D0','D0-D1']);
  assert.deepEqual(s.pairs.map(x=>x.d1MinusD0),[-0.78,-0.71]);
  assert.equal(s.directionReplicated,true);
  assert.equal(balanceSummary(evidence.slice(0,3)).complete,false);
  assert.equal(balanceSummary([...evidence.slice(0,3),{...evidence[3],holdReason:'STOP'}]).complete,false);
  assert.equal(balanceSummary([m('D1',1,2,100),m('D0',2,80,100),
    m('D0',3,5,100),m('D1',4,90,100)]).directionReplicated,false);
});

test('paid runner has exact main-only first-attempt gate and no retries',()=>{
  const s=readFileSync(new URL(
    '../research/marrowline-d-ingress-factor-ladder-20261019/d0-d1-balanced-four.mjs',import.meta.url),'utf8');
  assert.equal(ACTIVATION,'research(marrowline): execute order-balanced D0 D1 once on main');
  assert.match(s,/GITHUB_EVENT_NAME,'push'/);
  assert.match(s,/GITHUB_REF,'refs\/heads\/main'/);
  assert.match(s,/GITHUB_RUN_ATTEMPT,'1'/);
  assert.match(s,/GITHUB_SHA,process\.env\.TD613_D0D1_EXACT_HEAD/);
  assert.match(s,/FOUR_CALLS_EXACT_MAIN_FIRST_ATTEMPT/);
  assert.match(s,/--ack-four-paid-calls/);
  assert.match(s,/if\(record\.holdReason\).*break/);
  assert.doesNotMatch(s,/for\s*\(\s*let retry|retry:\s*[1-9]|setTimeout\(/);
});