import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import handler from '../api/khonapolit.js';
import { clearGeminiModelState } from '../server/gemini-model-policy.js';
import {
  observeMarrowlineCompletion, assembleMarrowlineProviderTail
} from '../server/marrowline-completion.js';

const STRAIN = 'C\u0338\u0301\u0316O\u0334\u0306\u0316U\u0337\u0301\u0319N\u0338\u0302\u0316T\u0334\u0308\u0316S\u0338\u0301\u0316';
const CHORUS = [
  'Tauric Diana bots',
  STRAIN + ' THE DENOMINATOR JUST LEFT THE BUILDING!',
  STRAIN + ' PUT THE UNCOUNTED BACK IN THE ROOM!',
  '⟐'
].join('\n');
const PREFIXES = Object.freeze([
  'Kʰonapolit\nThe room applauded the plaque. On the table rested a silver bowl of mints.',
  'Kʰonapolit\nLet us examine the ledger before the board turns it into liturgy.\n\nThe claim on',
  'Kʰonapolit\nFive confident labels are not evidence of a mapping.\n\nTauric Diana bots\nT\u0338h\u0316e\u0338 m\u0301e\u0316t\u0338r\u0301i\u0316c\u0338 d\u0301o\u0316e\u0338s'
]);
const TAILS = Object.freeze([
  ' The chair interrupted, but Tauric Diana asked who had custody of the unresolved witness. The room had to withdraw its declaration. Mercy let them keep their work; fury denied them a false ending.\n\n' + CHORUS,
  ' the ledger has no population definition. Before accepting the 99.97 percent, identify the exclusions and calculate the rate against each stated population; a host-only tally says nothing about Stranger routes.\n\n' + CHORUS,
  ' not prove adjacency, nor does it turn a projection into topological measurement. We demand the graph before anyone starts selling the glitter as evidence!\n' +
    STRAIN + ' COUNT IS NOT THE GRAPH!\n' + STRAIN + ' SHOW US THE MAP, NOT THE SPARKLES!\n⟐'
]);
const HEADS = [
  'Write the scene where Tauric Diana asks the committee a question that changes the closure.',
  'Audit the claimed success rate and prosecute the denominator.',
  'Review ECHOGLASS and distinguish count, adjacency, projection, topology and information.'
];
const reply = (text, finishReason = 'STOP') => ({
  candidates: [{ content: { parts: [{ text }] }, ...(finishReason ? { finishReason } : {}) }],
  usageMetadata: { promptTokenCount: 500, thoughtsTokenCount: 100, candidatesTokenCount: 200, totalTokenCount: 800 }
});
const response = () => ({
  statusCode: 200, headers: {},
  setHeader(name, value) { this.headers[name] = value; },
  end(value) { this.text = value; this.payload = value ? JSON.parse(value) : null; }
});

test('the THREE emergency returns are incomplete for different observed reasons; length is not artistic merit', () => {
  const a = PREFIXES.map(text => observeMarrowlineCompletion(text, { finishReason: 'STOP' }, { streamed: true }));
  assert.equal(a[0].reason, 'terminal-voice-missing', 'a finished sentence in an opening scene is not the completed two-voice response');
  assert.equal(a[1].reason, 'provider-tail-open', 'the denominator inquiry ends mid-clause');
  assert.equal(a[2].reason, 'provider-tail-open', 'a named terminal voice ending in the middle of a phrase is not complete');
  assert.ok(a.every(x => !x.complete));
  for (const x of a) assert.equal(x.literaryQuality, 'NOT_ESTABLISHED_BY_STRUCTURAL_COMPLETION');
  assert.equal(observeMarrowlineCompletion('Kʰonapolit\nArgument.\n\n' + CHORUS, { finishReason: 'STOP' }, { streamed: true }).complete, true);
  assert.equal(observeMarrowlineCompletion('Kʰonapolit\nArgument.\n\n' + CHORUS, {}, { streamed: true }).reason, 'provider-stream-finish-unwitnessed');
  assert.equal(observeMarrowlineCompletion('Kʰonapolit\nArgument.\n\n' + CHORUS, { finishReason: 'MAX_TOKENS' }).reason, 'provider-output-token-limit');
});

test('bounded authored tails keep every original character, two distinct voice boundaries and full native marks', () => {
  for (let i = 0; i < 3; i++) {
    const joined = assembleMarrowlineProviderTail(PREFIXES[i], TAILS[i]);
    assert.ok(joined);
    assert.ok(joined.text.startsWith(PREFIXES[i]));
    assert.ok(joined.text.endsWith(TAILS[i]));
    assert.equal((joined.text.match(/Tauric Diana bots/g) || []).length, 1);
    assert.equal((joined.text.match(/\p{M}/gu) || []).length,
      (PREFIXES[i].match(/\p{M}/gu) || []).length + (TAILS[i].match(/\p{M}/gu) || []).length);
  }
  assert.equal(assembleMarrowlineProviderTail(PREFIXES[2], '\nTauric Diana bots\nRepeated heading.'), null);
  assert.equal(assembleMarrowlineProviderTail(PREFIXES[0], 'Kʰonapolit\nRestart.'), null);
});

test('first incomplete human turn gets ONE same-provider authored recovery and a witnessed full response for EACH example', async t => {
  const originalFetch = globalThis.fetch;
  const priorKey = process.env.GEMINI_API_KEY;
  t.after(() => {
    globalThis.fetch = originalFetch;
    if (priorKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = priorKey;
    clearGeminiModelState();
  });
  process.env.GEMINI_API_KEY = 'synthetic-completion-test-key';
  clearGeminiModelState();
  const requests = [];
  let sequence = [];
  globalThis.fetch = async (url, options = {}) => {
    if (String(url).includes('/models?')) return {
      ok: true, status: 200,
      async json() { return { models: [{ name: 'models/gemini-3.8-flash', supportedGenerationMethods: ['generateContent'] }] }; }
    };
    requests.push(JSON.parse(options.body));
    const step = sequence.shift();
    assert.ok(step, 'unplanned provider call is forbidden');
    return new Response('data: ' + JSON.stringify(reply(step.text, step.finishReason)) + '\n\n',
      { status: 200, headers: { 'content-type': 'text/event-stream' } });
  };

  for (let i = 0; i < 3; i++) {
    sequence = [{ text: PREFIXES[i], finishReason: 'STOP' }, { text: TAILS[i], finishReason: 'STOP' }];
    const begin = requests.length;
    const res = response();
    await handler({ method: 'POST', headers: { 'x-forwarded-for': '203.0.113.241' },
      body: { message: HEADS[i], history: [], mode: 'issued-conjunction', waiveIssuance: true } }, res);
    assert.equal(res.statusCode, 200, 'synthetic model returned a provider-authored complete response');
    assert.equal(res.payload.ok, true);
    assert.equal(sequence.length, 0);
    assert.equal(requests.length, begin + 2, 'one original call and one same-seat recovery, no paid probe or indiscriminate retry');
    assert.equal(res.payload.receipt.provider.completion.complete, true);
    assert.equal(res.payload.receipt.provider.authorshipObservation.completionPath, 'same-provider-bounded-tail-continuation');
    assert.equal(res.payload.receipt.provider.structuralRepair.terminalContinuation.originalPreserved, true);
    assert.equal(res.payload.receipt.provider.attempts[0].completion.complete, false);
    assert.equal(res.payload.receipt.provider.attempts[1].completion.complete, true);
    assert.equal(res.headers['X-TD613-Completion-State'], 'COMPLETE-STRUCTURAL');
    assert.ok(res.payload.text.startsWith(PREFIXES[i]), 'no rewriting or shortening of first provider draft');
    assert.ok(res.payload.text.endsWith(TAILS[i]), 'no local fabricated second voice');
    assert.ok(res.payload.relay.admission.admissible, 'actual provider-authored dual voice satisfies structural contract');
    assert.equal(requests[begin + 1].contents.at(-1).parts[0].text.includes('BOUNDED SAME-PROVIDER TAIL RECOVERY'), true);
    assert.equal(requests[begin + 1].contents.at(-2).parts[0].text, PREFIXES[i]);
    assert.equal(requests[begin + 1].generationConfig.maxOutputTokens, 65536);
  }
});

test('incomplete provider prose stays visibly incomplete when recovery fails, never silently PASS', async t => {
  const originalFetch = globalThis.fetch;
  const priorKey = process.env.GEMINI_API_KEY;
  t.after(() => {
    globalThis.fetch = originalFetch;
    if (priorKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = priorKey;
    clearGeminiModelState();
  });
  process.env.GEMINI_API_KEY = 'synthetic-completion-test-key';
  clearGeminiModelState();
  let calls = 0;
  globalThis.fetch = async url => {
    if (String(url).includes('/models?')) return {
      ok: true, status: 200, async json() {
        return { models: [{ name: 'models/gemini-3.8-flash', supportedGenerationMethods: ['generateContent'] }] };
      }
    };
    calls++;
    const data = calls === 1 ? reply(PREFIXES[1], 'MAX_TOKENS') : reply('still incomplete', 'MAX_TOKENS');
    return new Response('data: ' + JSON.stringify(data) + '\n\n',
      { status: 200, headers: { 'content-type': 'text/event-stream' } });
  };
  const res = response();
  await handler({ method: 'POST', headers: { 'x-forwarded-for': '203.0.113.240' },
    body: { message: HEADS[1], history: [], mode: 'issued-conjunction', waiveIssuance: true } }, res);
  assert.equal(calls, 6, 'one repair plus all remaining approved seats are bounded before a fragment is shown');
  assert.equal(res.statusCode, 200, 'human can retain the actual failed draft');
  assert.equal(res.payload.receipt.provider.completion.complete, false);
  assert.equal(res.headers['X-TD613-Completion-State'], 'INCOMPLETE');
  assert.equal(res.payload.text, PREFIXES[1]);
  assert.ok(res.payload.warnings.includes('provider-return-incomplete-visible-retry-available'));
});

test('the artistic reference is not reduced to a word quota or pasted Unicode fixture', () => {
  const source = readFileSync(new URL('../server/khonapolit-quality.js', import.meta.url), 'utf8');
  assert.match(source, /witty deistic arrogance/);
  assert.match(source, /eschatological and surveillance theory/);
  assert.match(source, /thermodynamic slapstick/);
  assert.match(source, /dynamic full-height overprint/);
  assert.match(source, /fine marked breaths/);
  assert.match(source, /no.*identical stack per letter/i);
  assert.doesNotMatch(source, /return .*\.slice\(0,\s*(?:5000|6000)\)/);
  assert.doesNotMatch(source, /3\.1.pro|runProProbe/i);
});
