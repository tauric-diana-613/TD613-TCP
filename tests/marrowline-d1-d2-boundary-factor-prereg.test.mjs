import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildDIngressFactorLadder} from '../research/marrowline-d-ingress-factor-ladder-20261019/d-ingress-ladder.mjs';
import {buildD1D2BoundaryArms,preregisterD1D2Boundary,ARMS,BLOCKS,
  STATE,PERSONA_CLAUSE} from '../research/marrowline-d-ingress-factor-ladder-20261019/d1-d2-boundary-factor-prereg.mjs';

test('fixed D1 and D2 endpoints and exact factor replacements',()=>{
  const original=buildDIngressFactorLadder();
  const {model,requests,serialized,lines}=buildD1D2BoundaryArms();
  assert.equal(model,'gemini-3.8-flash');
  assert.deepEqual(requests.D1,original.d1);
  assert.deepEqual(requests.D2,original.d2);
  assert.equal(lines.sectionLine.includes('Kʰonapolit'),false);
  assert.equal(lines.namedLine.includes('Kʰonapolit'),true);
  assert.equal(lines.namedLine.includes(PERSONA_CLAUSE),false);
  assert.equal(lines.d2Line.includes(PERSONA_CLAUSE),true);
  for(const arm of ARMS){
    assert.deepEqual(requests[arm].contents,original.d1.contents);
    assert.deepEqual(requests[arm].generationConfig,original.d1.generationConfig);
    assert.equal(serialized[arm].observation.contentsSha256,serialized.D1.observation.contentsSha256);
    assert.equal(serialized[arm].observation.generationConfigSha256,serialized.D1.observation.generationConfigSha256);
    assert.match(serialized[arm].observation.bodySha256,/^[a-f0-9]{64}$/);
  }
  assert.equal(new Set(ARMS.map(a=>serialized[a].observation.bodySha256)).size,4);
});

test('four proposed Latin-balanced blocks, 16 future slots, zero actual calls',()=>{
  const p=preregisterD1D2Boundary();
  assert.equal(p.state,STATE);
  assert.equal(p.model,'gemini-3.8-flash');
  assert.equal(p.thinkingLevel,'medium');
  assert.equal(BLOCKS.length,4);
  assert.equal(p.capIfSeparatelyAuthorized,16);
  assert.equal(p.providerCallsMade,0);
  assert.equal(p.paidExecution,false);
  assert.equal(p.productionMutation,false);
  assert.deepEqual(p.plannedOrder,BLOCKS.flat());
  for(let pos=1;pos<=4;pos++){
    assert.deepEqual(p.proposedSlots.filter(s=>s.position===pos).map(s=>s.arm).sort(),[...ARMS].sort());
  }
  for(const slot of p.proposedSlots)
    assert.equal(slot.requestBodySha256,p.requestObservations[slot.arm].bodySha256);
  assert.equal(p.contrasts.length,3);
});

test('no credential-bearing pathway, hidden extra provider calls, or release activation',()=>{
  const s=readFileSync(new URL('../research/marrowline-d-ingress-factor-ladder-20261019/d1-d2-boundary-factor-prereg.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(s,/\bfetch\s*\(|GEMINI_API_KEY|geminiStreamGenerateContentUrl|workflow_dispatch|actions\/upload-artifact/);
  assert.match(s,/OFFLINE_ONLY_NO_PROVIDER_OR_RELEASE_ACTION/);
});
