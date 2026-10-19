import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import {
  offlineRegistration, STUDY_SCHEMA, ACTIVATION_BRANCH, ACTIVATION_SUBJECT
} from '../research/marrowline-d-thinking-isolation-20261019/live-once.mjs';
import { UNICODE_ASSAY_TASKS, UNICODE_ASSAY_SYSTEM }
  from '../server/marrowline-unicode-capability-assay.js';

const sha = x => createHash('sha256').update(x).digest('hex');

test('two original-SSE request bodies differ exclusively in MEDIUM versus HIGH thinking', () => {
  const pair = offlineRegistration();
  assert.equal(pair.registration.schema, STUDY_SCHEMA);
  assert.equal(pair.requests.length, 2);
  assert.equal(pair.model, 'gemini-3.8-flash');
  assert.equal(pair.registration.maximumProviderCalls, 2);
  assert.equal(pair.registration.automaticRetries, 0);
  assert.equal(pair.registration.fallback, false);
  const [a, b] = pair.requests.map(x => JSON.parse(x.wire.body));
  assert.equal(a.contents[0].parts[0].text, UNICODE_ASSAY_TASKS['creative-multistack-v1']);
  assert.equal(a.systemInstruction.parts[0].text, UNICODE_ASSAY_SYSTEM);
  const removeThinking = x => ({
    ...x, generationConfig: Object.fromEntries(Object.entries(x.generationConfig)
      .filter(([field]) => field !== 'thinkingConfig'))
  });
  assert.deepEqual(removeThinking(a), removeThinking(b));
  assert.deepEqual(a.generationConfig.thinkingConfig, { thinkingLevel: 'medium' });
  assert.deepEqual(b.generationConfig.thinkingConfig, { thinkingLevel: 'high' });
  assert.equal(sha(JSON.stringify(a.contents)), sha(JSON.stringify(b.contents)));
  assert.notEqual(pair.requests[0].wire.observation.bodySha256,
    pair.requests[1].wire.observation.bodySha256);
});

test('activation is exact-head, single-attempt, strictly disabled during ordinary CI', () => {
  const contents = readFileSync(
    new URL('../research/marrowline-d-thinking-isolation-20261019/live-once.mjs', import.meta.url),
    'utf8'
  );
  assert.equal(ACTIVATION_BRANCH, 'research/marrowline-d-thinking-live-once-20261019');
  assert.equal(ACTIVATION_SUBJECT, 'research(marrowline): execute D thinking original SSE once');
  assert.match(contents, /process\.env\.GITHUB_RUN_ATTEMPT, '1'/);
  assert.match(contents, /TD613_D_THINKING_AUTHORIZE/);
  assert.match(contents, /execFileSync\('git', \['rev-parse', 'HEAD'\]/);
  assert.match(contents, /--ack-paid/);
  assert.match(contents, /MAX_FIRST_TOTAL_TOKENS = 20000/);
  assert.match(contents, /if \(row\.holdReason\)/);
  assert.doesNotMatch(contents, /\/\/\s*TODO:.*provider.*retry/i);
});
