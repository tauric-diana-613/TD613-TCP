import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildDIngressFactorLadder, dIngressManifest, hashD,
  D_PERFORMANCE_LINE, D_INGRESS_LADDER_SCHEMA
} from '../research/marrowline-d-ingress-factor-ladder-20261019/d-ingress-ladder.mjs';
import {
  UNICODE_ASSAY_SYSTEM, UNICODE_ASSAY_TASKS
} from '../server/marrowline-unicode-capability-assay.js';
import { frameMarrowlineUserTurn } from '../app/dome-world/khonapolit-covenant.js';
import { ROLE_BOUNDARY_LINE } from '../research/marrowline-role-boundary-20261017/role-boundary-contrast.mjs';

test('D0 is exactly the registered original D creative request constructor, no new specimen',()=>{
  const { model,d0 }=buildDIngressFactorLadder();
  assert.equal(model,'gemini-3.8-flash');
  assert.equal(d0.systemInstruction.parts[0].text,UNICODE_ASSAY_SYSTEM);
  assert.equal(d0.contents[0].parts[0].text,UNICODE_ASSAY_TASKS['creative-multistack-v1']);
  assert.deepEqual(d0.generationConfig.thinkingConfig,{thinkingLevel:'medium'});
  assert.equal(d0.generationConfig.responseMimeType,undefined);
  assert.equal(d0.contents.length,1);
});

test('D1 differs from D0 only in the actual Marrowline ingress/closure user part',()=>{
  const {d0,d1}=buildDIngressFactorLadder();
  assert.deepEqual(d0.systemInstruction,d1.systemInstruction);
  assert.deepEqual(d0.generationConfig,d1.generationConfig);
  assert.equal(d1.contents[0].parts[0].text,frameMarrowlineUserTurn(d0.contents[0].parts[0].text));
  assert.equal(d1.contents[0].parts[0].text.startsWith('𝌋'),true);
  assert.equal(d1.contents[0].parts[0].text.endsWith('⟐'),true);
  assert.notEqual(hashD(d0.contents),hashD(d1.contents));
});

test('D2 adds only two plain heading labels to framed D1, without persona performance',()=>{
  const {d1,d2}=buildDIngressFactorLadder();
  assert.deepEqual(d1.contents,d2.contents);
  assert.deepEqual(d1.generationConfig,d2.generationConfig);
  assert.equal(d2.systemInstruction.parts[0].text,d1.systemInstruction.parts[0].text+'\n'+ROLE_BOUNDARY_LINE);
  assert.match(ROLE_BOUNDARY_LINE,/do not perform TD613 character personas/);
});

test('D3 changes exactly one D2 instruction line, not model, task, history or Unicode',()=>{
  const {d2,d3}=buildDIngressFactorLadder();
  assert.deepEqual(d2.contents,d3.contents);
  assert.deepEqual(d2.generationConfig,d3.generationConfig);
  const a=d2.systemInstruction.parts[0].text.split('\n');
  const b=d3.systemInstruction.parts[0].text.split('\n');
  assert.equal(a.length,b.length);
  assert.deepEqual(a.slice(0,-1),b.slice(0,-1));
  assert.equal(a.at(-1),ROLE_BOUNDARY_LINE);
  assert.equal(b.at(-1),D_PERFORMANCE_LINE);
  assert.match(D_PERFORMANCE_LINE,/sole exception to the preceding prohibition/);
  assert.doesNotMatch(D_PERFORMANCE_LINE,/mandatory code.?point|every paragraph|minimum mark count|postprocess/i);
});

test('manifest remains offline, declares D0 empirical history, and refuses inference for untested arms',()=>{
  const result=dIngressManifest();
  assert.equal(result.schema,D_INGRESS_LADDER_SCHEMA);
  assert.equal(result.status,'SOURCE_ONLY_NO_NEW_PROVIDER_OBSERVATION');
  assert.equal(result.paidExecution,false);
  assert.equal(result.providerCalls,0);
  assert.equal(result.verification.configAllEqual,true);
  assert.equal(result.verification.ingressOnlyChangesContents,true);
  assert.equal(result.verification.headingOnlyChangesSystem,true);
  assert.equal(result.verification.personaOnlyChangesOneLine,true);
  assert.match(result.interpretation,/unobserved counterfactuals/);
  const source=readFileSync(new URL('../research/marrowline-d-ingress-factor-ladder-20261019/d-ingress-ladder.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(source,/\bfetch\s*\(|\bhttps?\.request\s*\(|workflow_dispatch|child_process/);
});
