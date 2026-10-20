import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  preregisterD2D3,measureOriginalText,offlineManifest,
  SCHEMA,ORDER,MAX_FUTURE_PROVIDER_CALLS,ACQUISITION_STATE,HEADINGS
} from '../research/marrowline-d-ingress-factor-ladder-20261019/d2-d3-eight-prereg.mjs';

test('D2/D3 exact request invariant and four reversed-order pairs are frozen',()=>{
  const p=preregisterD2D3();
  assert.equal(p.schema,SCHEMA);
  assert.equal(p.state,ACQUISITION_STATE);
  assert.equal(p.model,'gemini-3.8-flash');
  assert.equal(p.thinkingLevel,'medium');
  assert.equal(p.cap,MAX_FUTURE_PROVIDER_CALLS);
  assert.equal(p.cap,8);
  assert.deepEqual(ORDER,['D2','D3','D3','D2','D3','D2','D2','D3']);
  assert.deepEqual(p.runPlan.map(x=>x.arm),ORDER);
  assert.deepEqual(p.runPlan.map(x=>x.sequence),[1,2,3,4,5,6,7,8]);
  assert.deepEqual(p.runPlan.map(x=>x.pair),[1,1,2,2,3,3,4,4]);
  const a=p.armObservations.D2,b=p.armObservations.D3;
  assert.equal(a.contentsSha256,b.contentsSha256);
  assert.equal(a.generationConfigSha256,b.generationConfigSha256);
  assert.notEqual(a.systemInstructionSha256,b.systemInstructionSha256);
  assert.notEqual(a.bodySha256,b.bodySha256);
  assert.equal(p.runPlan.filter(x=>x.arm==='D2').length,4);
  assert.equal(p.runPlan.filter(x=>x.arm==='D3').length,4);
  for(const slot of p.runPlan) assert.equal(slot.requestBodySha256,p.armObservations[slot.arm].bodySha256);
});

test('two-voice metric does not confuse headings with native Unicode body or invented artistic quality',()=>{
  const [h1,h2]=HEADINGS;
  const good=measureOriginalText(h1+'\nA\u0307\u0323!\n'+h2+'\nB\u0301\u0329.');
  assert.equal(good.exactHeadings,true);
  assert.equal(good.nonemptyTwoVoices,true);
  assert.equal(good.minVoiceStackShare,1);
  assert.equal(good.voiceMorphology[0].stackedClusters,1);
  assert.equal(good.voiceMorphology[1].stackedClusters,1);
  const missing=measureOriginalText(h1+'\nA\u0307\u0323!\nB\u0301\u0329.');
  assert.equal(missing.exactHeadings,false);
  assert.equal(missing.voiceMorphology,null);
  assert.equal(missing.minVoiceStackShare,null);
  const wrongOrder=measureOriginalText(h2+'\nB\n'+h1+'\nA');
  assert.equal(wrongOrder.exactHeadings,false);
  const duplicate=measureOriginalText(h1+'\nA\n'+h2+'\nB\n'+h2);
  assert.equal(duplicate.exactHeadings,false);
  const markdown=measureOriginalText('## '+h1+'\nA\n## '+h2+'\nB');
  assert.equal(markdown.exactHeadings,false);
  const empty=measureOriginalText(h1+'\n\n'+h2+'\nB');
  assert.equal(empty.exactHeadings,true);
  assert.equal(empty.nonemptyTwoVoices,false);
  assert.equal(empty.minVoiceStackShare,null);
});

test('PR registration remains inert and disallows any credential-bearing activation',()=>{
  const m=offlineManifest();
  assert.equal(m.state,'HELD_NOT_AUTHORIZED');
  assert.equal(m.providerCallsMade,0);
  assert.equal(m.paidExecution,false);
  const source=readFileSync(new URL('../research/marrowline-d-ingress-factor-ladder-20261019/d2-d3-eight-prereg.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(source,/\bfetch\s*\(|GEMINI_API_KEY|geminiStreamGenerateContentUrl|workflow_dispatch|\bhttps?\.request\s*\(/);
  assert.match(source,/OFFLINE_PREREG_ONLY_NO_PROVIDER_OR_RELEASE_ACTION/);
});
