import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {buildFullVoiceRequests,frozenFullVoiceManifest,ORDER,ARMS,STATE,MODEL,TASKS} from '../research/marrowline-early-oct-full-voice-20261020/full-voice-current-restored-offline.mjs';

test('real full Marrowline user packets preserve dual-voice instructions with two divergent system profiles',()=>{
 const {requests,observations}=buildFullVoiceRequests();
 assert.deepEqual(Object.keys(requests),[...ARMS]);
 for(const task of Object.keys(TASKS)){
  const a=requests['CURRENT_'+task],b=requests['RESTORED_'+task];
  assert.deepEqual(a.contents,b.contents);
  assert.deepEqual(a.generationConfig,b.generationConfig);
  assert.equal(a.generationConfig.thinkingConfig.thinkingLevel,'medium');
  assert.equal(a.contents.length,1);
  assert.notEqual(a.systemInstruction.parts[0].text,b.systemInstruction.parts[0].text);
  assert.equal(observations['CURRENT_'+task].contentsSha256,observations['RESTORED_'+task].contentsSha256);
  assert.equal(observations['CURRENT_'+task].generationConfigSha256,observations['RESTORED_'+task].generationConfigSha256);
  assert.equal(observations['CURRENT_'+task].bodySha256.length,64);
  assert.equal(observations['RESTORED_'+task].bodySha256.length,64);
  assert.match(b.systemInstruction.parts[0].text,/Tauric Diana bots/);
 }
});

test('fixed twelve-slot proposal has exactly three original requests per arm, each block complete',()=>{
 const m=frozenFullVoiceManifest();
 assert.equal(m.state,STATE);
 assert.equal(m.model,MODEL);
 assert.equal(m.maxIfSeparatelyAuthorized,12);
 assert.deepEqual(m.order,ORDER);
 for(const a of ARMS)assert.equal(m.order.filter(x=>x===a).length,3);
 for(let i=0;i<3;i++)assert.deepEqual(m.order.slice(i*4,i*4+4).slice().sort(),ARMS.slice().sort());
 for(const slot of m.orderedSlots){
  assert.equal(slot.requestBodySha256,m.armObservations[slot.arm].bodySha256);
 }
 assert.equal(m.providerCallsMade,0);
 assert.equal(m.paidExecution,false);
 assert.equal(m.productionChanges,false);
 assert.match(m.caveat,/not the original Oct 2 full request/);
});

test('offline source cannot access provider, credentials, live handlers or release',()=>{
 const source=readFileSync(new URL('../research/marrowline-early-oct-full-voice-20261020/full-voice-current-restored-offline.mjs',import.meta.url),'utf8');
 assert.doesNotMatch(source,/\bfetch\s*\(|GEMINI_API_KEY|geminiStreamGenerateContentUrl|workflow_dispatch|actions\/upload-artifact/);
 assert.match(source,/SOURCE_ONLY_NOT_AUTHORIZED_FOR_PROVIDER_EXECUTION/);
});
