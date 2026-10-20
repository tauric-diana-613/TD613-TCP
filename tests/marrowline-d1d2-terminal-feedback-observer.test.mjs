import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {observeGoogleSseTerminal} from '../research/marrowline-d-ingress-factor-ladder-20261019/d1d2-terminal-feedback-observer.mjs';
const block=entries=>entries.map(x=>'data: '+JSON.stringify(x)+'\r\n\r\n').join('');
test('HTTP 200 with native candidate fragments followed by OTHER remains HELD',()=>{
  const s=block([
    {candidates:[{content:{parts:[{text:'A\u0307\u0323'}]},index:0}]},
    {candidates:[{content:{parts:[{text:'B\u0301\u0329'}]},index:0}]},
    {promptFeedback:{blockReason:'OTHER'}}
  ]);
  const o=observeGoogleSseTerminal(Buffer.from(s,'utf8'));
  assert.equal(o.events,3);
  assert.equal(o.hasCandidate,true);
  assert.equal(o.latestCandidateFinish,null);
  assert.equal(o.terminalKind,'PROMPT_FEEDBACK');
  assert.equal(o.terminalBlockReason,'OTHER');
  assert.equal(o.terminalFeedbackAt,3);
  assert.equal(o.completed,false);
  assert.equal(o.interpretation,'UNFINISHED_OR_BLOCKED_HOLD');
});
test('complete candidate STOP is different from an abnormal terminal feedback',()=>{
  const a=observeGoogleSseTerminal(block([
    {candidates:[{content:{parts:[{text:'X'}]},finishReason:'STOP'}]},
    {usageMetadata:{totalTokenCount:13}}
  ]));
  assert.equal(a.latestCandidateFinish,'STOP');
  assert.equal(a.terminalBlockReason,null);
  assert.equal(a.completed,true);
  const b=observeGoogleSseTerminal(block([{promptFeedback:{blockReason:'SAFETY'}}]));
  assert.equal(b.hasCandidate,false);
  assert.equal(b.completed,false);
  assert.equal(b.terminalBlockReason,'SAFETY');
});
test('terminal observer is offline and cannot authorize a provider call',()=>{
  const source=readFileSync(new URL('../research/marrowline-d-ingress-factor-ladder-20261019/d1d2-terminal-feedback-observer.mjs',import.meta.url),'utf8');
  assert.doesNotMatch(source,/\bfetch\s*\(|GEMINI_API_KEY|workflow_dispatch|geminiRequestHeaders/);
});
