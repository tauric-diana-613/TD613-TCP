import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  SCHEMA, ACTIVATION, BRANCH, registerD0D1, unicodeMorphology, decodeGoogleSse
} from '../research/marrowline-d-ingress-factor-ladder-20261019/d0-d1-original-sse-once.mjs';
import {frameMarrowlineUserTurn} from '../app/dome-world/khonapolit-covenant.js';
import {UNICODE_ASSAY_TASKS, UNICODE_ASSAY_SYSTEM}
  from '../server/marrowline-unicode-capability-assay.js';

test('D0 and D1 match every submitted field except production user ingress', () => {
  const {model,conditions}=registerD0D1();
  assert.equal(SCHEMA,'td613.marrowline.d0-d1-original-sse/v1');
  assert.equal(model,'gemini-3.8-flash');
  assert.deepEqual(conditions.map(x=>x.id),['D0_ORIGINAL_RAW','D1_MARROWLINE_INGRESS_ONLY']);
  const [a,b]=conditions.map(x=>JSON.parse(x.request.body));
  assert.deepEqual(a.generationConfig,b.generationConfig);
  assert.deepEqual(a.generationConfig.thinkingConfig,{thinkingLevel:'medium'});
  assert.deepEqual(a.systemInstruction,b.systemInstruction);
  assert.equal(a.systemInstruction.parts[0].text,UNICODE_ASSAY_SYSTEM);
  assert.equal(a.contents[0].parts[0].text,UNICODE_ASSAY_TASKS['creative-multistack-v1']);
  assert.equal(b.contents[0].parts[0].text,frameMarrowlineUserTurn(a.contents[0].parts[0].text));
  assert.deepEqual({...a,contents:b.contents},b);
  assert.notEqual(conditions[0].request.observation.bodySha256,conditions[1].request.observation.bodySha256);
  assert.equal(conditions[0].request.observation.systemInstructionSha256,
    conditions[1].request.observation.systemInstructionSha256);
  assert.equal(conditions[0].request.observation.generationConfigSha256,
    conditions[1].request.observation.generationConfigSha256);
});

test('original Google SSE parsing holds original model, STOP, events and Unicode morphology', () => {
  const events=[
    {modelVersion:'gemini-3.8-flash',candidates:[{content:{parts:[{text:'A\u0301\u0323'}]}}]},
    {modelVersion:'gemini-3.8-flash',candidates:[{
      content:{parts:[{text:' B\u0307\u0331\u0302'}]},finishReason:'STOP'
    }],usageMetadata:{totalTokenCount:100}}
  ];
  const raw=Buffer.from(events.map(e=>'data: '+JSON.stringify(e)+'\n\n').join(''),'utf8');
  const got=decodeGoogleSse(raw);
  assert.equal(got.text,'A\u0301\u0323 B\u0307\u0331\u0302');
  assert.equal(got.finish,'STOP');
  assert.equal(got.model,'gemini-3.8-flash');
  assert.equal(got.events,2);
  assert.equal(got.usage.totalTokenCount,100);
  const geo=unicodeMorphology(got.text);
  assert.equal(geo.stackedClusters,2);
  assert.equal(geo.totalCombiningMarks,5);
  assert.equal(geo.marksOutsideFivePlanarFamily,5);
  assert.equal(geo.maxMarksPerBase,3);
});

test('exact-head once gate is absent from normal CI and never automatically retries',()=>{
  const source=readFileSync(new URL(
    '../research/marrowline-d-ingress-factor-ladder-20261019/d0-d1-original-sse-once.mjs',
    import.meta.url),'utf8');
  assert.equal(BRANCH,'research/marrowline-d-ingress-original-sse-once-20261019');
  assert.equal(ACTIVATION,'research(marrowline): execute D0 D1 original SSE once');
  assert.match(source,/GITHUB_RUN_ATTEMPT,'1'/);
  assert.match(source,/TD613_D0D1_EXACT_HEAD/);
  assert.match(source,/D0D1_EXACT_HEAD_ONCE/);
  assert.match(source,/--ack-two-paid-calls/);
  assert.match(source,/if\(obs\.holdReason\)/);
  assert.doesNotMatch(source,/retry:\s*[1-9]|for\s*\(\s*let retry|setTimeout\(/);
});
