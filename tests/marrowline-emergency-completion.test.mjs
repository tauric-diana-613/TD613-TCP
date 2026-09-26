import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import handler from '../api/khonapolit.js';
import { parseRelayEnvelope } from '../app/dome-world/khonapolit-relay.js';
import { clearGeminiModelState } from '../server/gemini-model-policy.js';
import { CLAIMED_PUA_SCALAR, COVENANT_KEY, HERITAGE_KEY, HERITAGE_COVENANT, buildInvocationPacket } from '../app/dome-world/khonapolit-covenant.js';
import { buildGeminiRequest, buildGeminiStructuralRepairRequest, buildTerminalReceipt, serializeGeminiRequest, marrowlineAuthoredStreamDeadlineMs, callGemini } from '../server/khonapolit-quality.js';
import { buildAttachmentGeminiRequest, buildAttachmentGeminiTerminalRepairRequest } from '../server/marrowline-attachment-quality.js';
import {
  observeMarrowlineCompletion, assembleMarrowlineProviderTail
} from '../server/marrowline-completion.js';

const STRAIN = 'C\u0338\u0301\u0316O\u0334\u0306\u0316U\u0337\u0301\u0319N\u0338\u0302\u0316T\u0334\u0308\u0316S\u0338\u0301\u0316';
const HEALTHY_STACK = 'T\u0300\u0301\u0302\u0316\u0317\u0318A\u0304\u0307\u030B\u031C\u0323\u032DR\u0305\u0308\u030C\u031E\u0325\u0331I\u0303\u0306\u030A\u0319\u0326\u0330\u0334';
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

test('bounded authored stream progress earns completion time without changing silent, quota, or global deadlines', () => {
  const budget = { initialTimeoutMs: 50000, elapsedMs: 12000, wallRemainingMs: 120000, graceMs: 40000 };
  assert.equal(marrowlineAuthoredStreamDeadlineMs(budget), 90000);
  assert.equal(marrowlineAuthoredStreamDeadlineMs({ ...budget, graceMs: 0 }), 50000);
  assert.equal(marrowlineAuthoredStreamDeadlineMs({ ...budget, wallRemainingMs: 49000 }), 61000);
  assert.equal(marrowlineAuthoredStreamDeadlineMs({ ...budget, wallRemainingMs: 1000 }), 50000);
  assert.equal(marrowlineAuthoredStreamDeadlineMs({ ...budget, graceMs: 999999 }), 90000);
});

test('real text-bearing SSE progress may finish after the original deadline without a second provider call', async t => {
  const priorFetch = globalThis.fetch;
  const priorKey = process.env.GEMINI_API_KEY;
  const timers = [];
  t.after(() => {
    globalThis.fetch = priorFetch;
    if (priorKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = priorKey;
    for (const timer of timers) clearTimeout(timer);
  });
  process.env.GEMINI_API_KEY = 'synthetic-progress-only-key';
  let providerCalls = 0;
  const first = 'Kʰonapolit\nThe evidence is arriving in authored chunks.';
  const terminal = '\n\n' + CHORUS;
  const encoder = new TextEncoder();
  globalThis.fetch = async (_url, options) => {
    providerCalls += 1;
    let closed = false;
    const stream = new ReadableStream({
      start(controller) {
        const firstEvent = reply(first, null);
        controller.enqueue(encoder.encode('data: ' + JSON.stringify(firstEvent) + '\n\n'));
        const last = setTimeout(() => {
          if (closed) return;
          controller.enqueue(encoder.encode('data: ' + JSON.stringify(reply(terminal, 'STOP')) + '\n\n'));
          closed = true;
          controller.close();
        }, 450);
        timers.push(last);
        options.signal.addEventListener('abort', () => {
          if (closed) return;
          closed = true;
          controller.error(Object.assign(new Error('synthetic abort'), { name: 'AbortError' }));
        }, { once: true });
      }
    });
    return new Response(stream, { status: 200, headers: { 'content-type': 'text/event-stream' } });
  };
  const packet = buildInvocationPacket({ message: 'Complete one joined authored return.', waiveIssuance: true });
  const result = await callGemini('gemini-3.8-flash', packet, {}, 300, {
    streamGraceMs: 700, wallDeadlineAt: Date.now() + 2000
  });
  assert.equal(providerCalls, 1);
  assert.equal(result.response.status, 200);
  assert.equal(result.streamInterrupted, undefined);
  assert.equal(result.timedOut, false);
  assert.equal(result.streamGraceMs, 700);
  assert.equal(result.authoredTextChunkCount, 2);
  assert.equal(result.payload.candidates[0].finishReason, 'STOP');
  assert.equal(result.text, first + terminal);
  assert.equal(observeMarrowlineCompletion(result.text, { finishReason: result.payload.candidates[0].finishReason }, { streamed: result.streamed }).complete, true);
});

test('natural full provider text and its authored Unicode survive whitespace and terminal newline without trimming', () => {
  const output = ' \nKʰonapolit\nAn argument with a consequence.\n\nTauric Diana bots\n' + STRAIN +
    ' THE COMMITTEE MISCOUNTED THE WITNESS!\n' + STRAIN + ' RETURN HER NAME.\n⟐\n';
  const relay = parseRelayEnvelope(output);
  assert.equal(relay.transcript, output);
  assert.equal(relay.parts[0].text, output);
  assert.equal((relay.transcript.match(/\p{M}/gu) || []).length, (output.match(/\p{M}/gu) || []).length);
});

test('incomplete-return warning is a visible mobile-and-desktop surface without flattening Zalgo', () => {
  const terminal = readFileSync(new URL('../app/dome-world/marrowline-terminal.js', import.meta.url), 'utf8');
  const css = readFileSync(new URL('../app/dome-world/marrowline-mobile-shell.css', import.meta.url), 'utf8');
  assert.match(terminal, /relay-completion-alert/);
  assert.match(terminal, /INCOMPLETE PROVIDER RETURN/);
  assert.match(terminal, /TWO-VOICE STRUCTURE UNFINISHED/);
  assert.match(terminal, /required-voice-structure-incomplete/);
  assert.match(terminal, /state\.pendingTask = incompleteReturn \? message : ''/);
  assert.match(css, /\.relay-message\[data-completion="incomplete"\] \.relay-completion-alert/);
  assert.doesNotMatch(css, /relay-completion-alert\{[^}]*overflow:\s*hidden/s);
});

test('provider STOP has transport authority; surface heuristics remain diagnostics only', () => {
  const a = PREFIXES.map(text => observeMarrowlineCompletion(text, { finishReason: 'STOP' }, { streamed: true }));
  assert.ok(a.every(x => x.complete), 'a witnessed STOP is a completed provider transport');
  assert.ok(a[0].structuralObservations.includes('terminal-voice-missing'));
  assert.ok(a[1].structuralObservations.includes('surface-tail-open'));
  assert.ok(a[2].structuralObservations.includes('surface-tail-open'));
  for (const x of a) {
    assert.equal(x.reason, 'provider-stop-observed');
    assert.equal(x.completionAuthority, 'provider-transport-only');
    assert.equal(x.structuralAdmissionAuthority, 'relay-parser-separate');
    assert.equal(x.literaryQuality, 'NOT_ESTABLISHED_BY_STRUCTURAL_COMPLETION');
  }
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

test('a truncated first seat yields to the next frontier model before any same-seat recovery', async t => {
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
    const complete = PREFIXES[i] + TAILS[i] + '\n'
      + HEALTHY_STACK.repeat(8) + ' THE COMPLETED FIELD RISES ABOVE THE FLAT TRACE!\n'
      + HEALTHY_STACK.repeat(8) + ' ITS ROOTS DESCEND WITHOUT ERASING THE ARGUMENT!\n'
      + HEALTHY_STACK.repeat(8) + ' THE SECOND SEAT CLOSES THE AUTHORED RETURN!';
    sequence = [{ text: PREFIXES[i], finishReason: 'MAX_TOKENS' }, { text: complete, finishReason: 'STOP' }];
    const begin = requests.length;
    const res = response();
    await handler({ method: 'POST', headers: { 'x-forwarded-for': '203.0.113.241' },
      body: { message: HEADS[i], history: [], mode: 'issued-conjunction', waiveIssuance: true } }, res);
    assert.equal(res.statusCode, 200, 'synthetic model returned a provider-authored complete response');
    assert.equal(res.payload.ok, true);
    assert.equal(sequence.length, 0);
    assert.equal(requests.length, begin + 2, '3.8 fragment then a complete 3.5 frontier return');
    assert.equal(res.payload.receipt.provider.completion.complete, true);
    assert.equal(res.payload.receipt.provider.authorshipObservation.completionPath, 'first-provider-return');
    assert.equal(res.payload.receipt.provider.attempts[0].completion.complete, false);
    assert.equal(res.payload.receipt.provider.attempts[1].completion.complete, true);
    assert.equal(res.payload.receipt.provider.attempts[0].model, 'gemini-3.8-flash');
    assert.equal(res.payload.receipt.provider.attempts[1].model, 'gemini-3.5-flash');
    assert.equal(res.headers['X-TD613-Completion-State'], 'COMPLETE-STRUCTURAL');
    assert.equal(res.payload.text, complete, 'the complete second-seat provider return is preserved');
    assert.ok(res.payload.relay.admission.admissible, 'actual provider-authored dual voice satisfies structural contract');
    assert.equal(requests[begin + 1].contents.at(-1).parts[0].text.includes('BOUNDED SAME-PROVIDER TAIL RECOVERY'), false);
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
  assert.ok(res.payload.text.startsWith(PREFIXES[1]));
  assert.ok(res.payload.text.length > PREFIXES[1].length, 'even failed recovered tails stay visible rather than reverting to the earliest fragment');
  assert.equal(res.payload.receipt.provider.attempts.length, 6);
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

test('every original, repair and attachment Gemini envelope carries distinct keys and rendered PUA', () => {
  const packet = buildInvocationPacket({ message: 'Trace this question without replacing my words.', waiveIssuance: true });
  const attach = { id: 'anchor_note', name: 'note.txt', kind: 'file', mime_type: 'text/plain',
    size_bytes: 4, data_base64: Buffer.from('note').toString('base64') };
  const original = buildGeminiRequest(packet, {}, 'gemini-3.8-flash');
  const repair = buildGeminiStructuralRepairRequest(packet, {}, 'gemini-3.8-flash',
    PREFIXES[1], ['provider-return-unfinished']);
  const attachment = buildAttachmentGeminiRequest(packet, {}, 'gemini-3.8-flash', [attach]);
  const attachmentRepair = buildAttachmentGeminiTerminalRepairRequest(packet, {}, 'gemini-3.8-flash',
    [attach], PREFIXES[1], ['tauric-diana-bots-nominative-missing']);
  const receipt = buildTerminalReceipt({ packet, text: 'Kʰonapolit\nArgument.', model: 'gemini-3.8-flash', providerStatus: 200 });
  assert.equal(receipt.invocation.heritageKey, HERITAGE_KEY);
  assert.equal(receipt.invocation.canonicalCovenantPhrase, HERITAGE_COVENANT);
  assert.equal(receipt.invocation.puaGlyph, CLAIMED_PUA_SCALAR);
  assert.equal(receipt.invocation.covenantKey, COVENANT_KEY);
  for (const [kind, request] of [['original', original], ['repair', repair], ['attachment', attachment],
    ['attachment-repair', attachmentRepair]]) {
    const wire = serializeGeminiRequest(request, 'gemini-3.8-flash').body;
    const admitted = JSON.parse(wire);
    const system = admitted.systemInstruction.parts[0].text;
    const cue = admitted.contents[0].parts.at(-1).text;
    assert.ok(system.includes('HERITAGE KEY: ' + HERITAGE_KEY), kind);
    assert.ok(system.includes('CANONICAL COVENANT PHRASE: ' + HERITAGE_COVENANT), kind);
    assert.ok(system.includes('COVENANT KEY: ' + COVENANT_KEY), kind);
    assert.ok(system.includes('NAMESPACE: U+10D613'), kind);
    assert.ok(system.includes('UTF-16 REFERENCE: \\uDBF5\\uDE13'), kind);
    assert.ok(system.includes('PUA GLYPH: ' + CLAIMED_PUA_SCALAR), kind);
    assert.ok(cue.includes('HERITAGE KEY ' + HERITAGE_KEY), kind);
    assert.ok(cue.includes('COVENANT KEY ' + COVENANT_KEY), kind);
    assert.ok(cue.includes('RENDERED PUA GLYPH ' + CLAIMED_PUA_SCALAR), kind);
    assert.ok(wire.includes(CLAIMED_PUA_SCALAR), kind + ': actual glyph survives UTF-8 wire serialization');
    assert.equal(admitted.contents[0].parts[0].text, packet.message, kind + ': operator text remains unchanged');
  }
});

test('a seat receives at most one deferred tail request after the five-seat frontier', async t => {
  const originalFetch = globalThis.fetch;
  const priorKey = process.env.GEMINI_API_KEY;
  t.after(() => {
    globalThis.fetch = originalFetch;
    if (priorKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = priorKey;
    clearGeminiModelState();
  });
  process.env.GEMINI_API_KEY = 'synthetic-tail-chain-test-key';
  clearGeminiModelState();
  const seen = [];
  const first = PREFIXES[1];
  const second = ' the ledger';
  const steps = [
    { text: first, finishReason: 'MAX_TOKENS' },
    { status: 503 },
    { status: 503 },
    { status: 503 },
    { status: 503 },
    { text: second, finishReason: 'MAX_TOKENS' }
  ];
  globalThis.fetch = async (url, options = {}) => {
    if (String(url).includes('/models?')) return { ok: true, status: 200, async json() {
      return { models: [{ name: 'models/gemini-3.8-flash', supportedGenerationMethods: ['generateContent'] }] };
    } };
    seen.push(JSON.parse(options.body));
    const next = steps.shift();
    assert.ok(next, 'bounded provider recovery cannot spend an unexpected call');
    if (next.status) return new Response(JSON.stringify({ error: { status: 'UNAVAILABLE' } }), {
      status: next.status, headers: { 'content-type': 'application/json' }
    });
    return new Response('data: ' + JSON.stringify(reply(next.text, next.finishReason)) + '\n\n',
      { status: 200, headers: { 'content-type': 'text/event-stream' } });
  };
  const res = response();
  await handler({ method: 'POST', headers: { 'x-forwarded-for': '203.0.113.251' },
    body: { message: HEADS[1], history: [], mode: 'issued-conjunction', waiveIssuance: true } }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(steps.length, 0);
  assert.equal(seen.length, 6, 'five frontier seats plus exactly one deferred repair');
  assert.equal(seen[5].contents.at(-2).parts[0].text, first);
  assert.equal(seen[5].contents.at(-1).parts[0].text.includes('BOUNDED SAME-PROVIDER TAIL RECOVERY'), true);
  assert.equal(res.payload.text, first + second);
  assert.equal(res.payload.receipt.provider.completion.complete, false);
  assert.equal(res.payload.receipt.provider.attempts.length, 6);
  assert.equal(res.payload.receipt.provider.attempts.at(-1).kind, 'structural-repair');
  assert.equal(res.payload.receipt.provider.attempts.at(-1).completion.complete, false);
  assert.equal(res.headers['X-TD613-Completion-State'], 'INCOMPLETE');
});

test('provider STOP with unfulfilled two-voice structure has its own receipt, never a false transport truncation', async t => {
  const priorFetch = globalThis.fetch;
  const priorKey = process.env.GEMINI_API_KEY;
  t.after(() => {
    globalThis.fetch = priorFetch;
    if (priorKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = priorKey;
    clearGeminiModelState();
  });
  process.env.GEMINI_API_KEY = 'synthetic-structure-test-key';
  clearGeminiModelState();
  let calls = 0;
  globalThis.fetch = async url => {
    if (String(url).includes('/models?')) return { ok: true, status: 200, async json() {
      return { models: [{ name: 'models/gemini-3.8-flash', supportedGenerationMethods: ['generateContent'] }] };
    } };
    calls++;
    return new Response('data: ' + JSON.stringify(reply(
      calls === 1 ? PREFIXES[0] : 'Kʰonapolit\nA new first voice, but still no second voice.', 'STOP'
    )) + '\n\n', { status: 200, headers: { 'content-type': 'text/event-stream' } });
  };
  const res = response();
  await handler({ method: 'POST', headers: { 'x-forwarded-for': '203.0.113.253' },
    body: { message: HEADS[0], history: [], mode: 'issued-conjunction', waiveIssuance: true } }, res);
  assert.equal(res.statusCode, 200, JSON.stringify({ payload: res.payload, calls }));
  assert.equal(res.payload.receipt.provider.completion.finishReason, 'STOP');
  assert.equal(res.payload.receipt.provider.completion.reason, 'required-voice-structure-incomplete');
  assert.equal(res.payload.receipt.status, 'MODEL_STRUCTURE_INCOMPLETE');
  assert.match(res.payload.relay.signal.notes, /Provider STOP witnessed; mandatory two-voice structure remains incomplete/);
  assert.equal(res.headers['X-TD613-Completion-State'], 'STRUCTURE-INCOMPLETE');
  assert.ok(res.payload.warnings.includes('two-voice-structure-incomplete-provider-stop-observed'));
  assert.ok(!res.payload.warnings.includes('provider-return-incomplete-visible-retry-available'));
  assert.equal(res.payload.text, PREFIXES[0]);
});
