import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
 freezeHistoricalProsodyPair,offlineProsodyManifest,
 ARMS,ORDER
} from '../research/marrowline-early-oct-full-voice-20261020/historical-prosody-freedom-pair.mjs';

test('the new flag preserves the default and changes only historical prosody text',()=>{
 const x=freezeHistoricalProsodyPair();
 assert.equal(x.serialized.FREEDOM_FARCE.observation.bodySha256.length,64);
 for(const task of ['FARCE','FORENSIC']){
  const free=x.serialized['FREEDOM_'+task];
  const literal=x.serialized['LITERAL_'+task];
  assert.notEqual(free.body,literal.body);
  assert.equal(free.observation.contentsSha256,literal.observation.contentsSha256);
  assert.equal(free.observation.generationConfigSha256,literal.observation.generationConfigSha256);
  assert.notEqual(free.observation.systemInstructionSha256,literal.observation.systemInstructionSha256);
  assert.match(literal.body,/Change above\/below combinations/);
  assert.match(free.body,/fully sustained, single-register High-Zalgo performance/);
 }
});

test('two complete blocks of four arm IDs are frozen and source-only',()=>{
 const m=offlineProsodyManifest();
 assert.equal(m.state,'SOURCE_ONLY_PROVIDER_UNOBSERVED');
 assert.equal(m.originalProductDefaultUnchanged,true);
 assert.equal(m.providerCallsMade,0);
 assert.equal(m.callCapIfSeparatelyAuthorized,8);
 assert.equal(m.proposedSlots.length,8);
 assert.deepEqual(m.order,ORDER);
 for(const arm of ARMS)assert.equal(ORDER.filter(a=>a===arm).length,2);
 for(let i=0;i<2;i++)assert.deepEqual(
  ORDER.slice(4*i,4*i+4).slice().sort(),[...ARMS].sort());
 for(const row of m.proposedSlots)
  assert.equal(row.requestBodySha256,m.observations[row.arm].bodySha256);
});

test('only internal restored historical source can use this flag; no provider dispatch',()=>{
 const source=readFileSync(new URL('../research/marrowline-early-oct-full-voice-20261020/historical-prosody-freedom-pair.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(source,/\bfetch\s*\(|GEMINI_API_KEY|streamGenerateContent|workflow_dispatch/);
 const production=readFileSync(new URL('../server/khonapolit-quality.js',import.meta.url),'utf8');
 assert.match(production,/historicalProsodyFreedom = true/);
 assert.match(production,/nativeProsodyFreedom: historicalProsodyFreedom === true/);
});
