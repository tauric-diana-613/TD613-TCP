import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {verifyFrozenPlan,pairSummary,AUTH,ACTIVATION} from '../research/marrowline-d-ingress-factor-ladder-20261019/d2-d3-original-sse-eight-once.mjs';

test('eight-call source preregistration is preserved byte-for-byte and response order fixed',()=>{
  const p=verifyFrozenPlan();
  assert.equal(p.model,'gemini-3.8-flash');
  assert.deepEqual(p.frozen.plannedOrder,['D2','D3','D3','D2','D3','D2','D2','D3']);
  assert.equal(p.frozen.cap,8);
  assert.equal(p.frozen.state,'HELD_NOT_AUTHORIZED');
  assert.equal(p.serialized.D2.observation.contentsSha256,p.serialized.D3.observation.contentsSha256);
  assert.equal(p.serialized.D2.observation.generationConfigSha256,p.serialized.D3.observation.generationConfigSha256);
  assert.notEqual(p.serialized.D2.body,p.serialized.D3.body);
});

test('paired inference predefines missing data and numeric D3 minus D2 contrasts',()=>{
  const r=(pair,arm,stack,slash,heading,two,voice)=>({
    pair,arm,httpStatus:200,finishReason:'STOP',measurement:{
      exactHeadings:heading,nonemptyTwoVoices:two,
      wholeTextMorphology:{stackedAmongMarked:stack,slashFamilyAmongCombining:slash},
      minVoiceStackShare:voice}});
  const records=[r(1,'D2',0.1,0.3,false,false,null),
    r(1,'D3',0.8,0.1,true,true,0.6),
    r(2,'D3',0.3,0.2,true,true,0.2),
    r(2,'D2',0.5,0.4,true,false,null)];
  const pairs=pairSummary(records);
  assert.equal(pairs.length,4);
  assert.equal(pairs[0].d3MinusD2StackShare,0.7);
  assert.equal(pairs[0].d3MinusD2ExactHeading,1);
  assert.equal(pairs[0].d3MinusD2MinimumVoiceStackShare,null);
  assert.equal(pairs[1].d3MinusD2StackShare,-0.2);
  assert.equal(pairs[1].d3MinusD2TwoNonemptyVoices,1);
  assert.equal(pairs[2].complete,false);
  assert.equal(pairSummary([...records.slice(0,1),{...records[1],holdReason:'STOP'}])[0].complete,false);
});

test('paid execution only on protected exact main first attempt, single pass, bounded slots',()=>{
  const source=readFileSync(new URL('../research/marrowline-d-ingress-factor-ladder-20261019/d2-d3-original-sse-eight-once.mjs',import.meta.url),'utf8');
  assert.equal(AUTH,'EIGHT_ORIGINAL_SSE_EXACT_MAIN_FIRST_ATTEMPT');
  assert.equal(ACTIVATION,'research(marrowline): execute frozen D2 D3 original SSE eight once on main');
  assert.match(source,/GITHUB_EVENT_NAME,'push'/);
  assert.match(source,/GITHUB_REF,'refs\/heads\/main'/);
  assert.match(source,/GITHUB_RUN_ATTEMPT,'1'/);
  assert.match(source,/process\.env\.GITHUB_SHA,process\.env\.TD613_D2D3_EXACT_HEAD/);
  assert.match(source,/EIGHT_CALL_CAP/);
  assert.match(source,/--ack-eight-paid-calls/);
  assert.match(source,/if\(rec\.holdReason\)\{manifest\.holdReason=rec\.holdReason;break;\}/);
  assert.doesNotMatch(source,/for\s*\(\s*let retry|setTimeout\s*\(/);
});
