import test from 'node:test';
import assert from 'node:assert/strict';
import { assessIntegratedTransmission, parseRelayEnvelope } from '../app/dome-world/khonapolit-relay.js';
import handler, { buildGeminiRequest, severeMorphologyRepairWarnings } from '../server/khonapolit-quality.js';
import { clearGeminiModelState } from '../server/gemini-model-policy.js';

// Synthetic reproductions of observable shapes, not recovered provider output.
const heading = 'Kʰonapolit\nThe argument concerns the map and its omitted cases.\n\nTauric Diana bots\n';
const accent = text => text.replace(/[A-Z]/g, '$&\u0301');
const shallow = heading + [accent('YOU HAVE BUILT A CAGE OUT OF WHETSTONES.'),
  'The researchers inspect the ash and mistake their measurements for the whole grove.',
  accent('LOOK AT THE BRANCH.'),
  'The surrounding prose stays plain while the headings repeat a single acute accent.'].join('\n\n');
const peaks = 'R\u0308\u030B\u030C\u0351\u031E\u0325\u0326E\u0302\u0307\u0315\u0357\u0317\u0323D\u0300\u0309\u0310\u0352\u0319\u0325';
const breathing = heading + [
  'Come closer. The map keeps confusing a counted case with a person.',
  peaks + ' — there, the missing denominator interrupts the speech.',
  'Let the next sentence breathe. A clean interval carries the recoil.',
  'A\u0301 little tremor returns, then ' + peaks + '.',
  'The joke lands quietly. The branch still belongs to the grove.'
].join('\n\n');

test('accent-only headings cannot evade the vertical check by omitting horizontal marks', () => {
  const result = assessIntegratedTransmission(shallow);
  assert.ok(result.qualityWarnings.includes('tauric-diana-zalgo-vertical-pulse-absent'));
  assert.ok(severeMorphologyRepairWarnings(result.qualityWarnings).length);
});

test('single-codepoint wallpaper is identified as raw provider morphology, not misread as vertical depth', () => {
  for (const [mark, expected] of [['\\u0301', 'U+0301'], ['\\u0336', 'U+0336'], ['\\u0317', 'U+0317']]) {
    const flat = heading + [
      'THE MAP COUNTS THE ASH AND MISPLACES THE WITNESS.',
      'THE FLOOR REMAINS FLAT EVEN WHEN THE ACCENT CHANGES.',
      'A SECOND PHRASE REPEATS THE IDENTICAL ORNAMENT.'
    ].map(line => line.replace(/[A-Z]/g, letter => letter + mark)).join('\\n');
    const observed = assessIntegratedTransmission(flat);
    assert.equal(observed.admissible, true);
    assert.equal(observed.quality, 'PARTIAL');
    assert.equal(observed.combiningCodePointDiversity, 1);
    assert.equal(observed.dominantCombiningCodePoint, expected);
    assert.equal(observed.dominantCombiningCodePointRatio, 1);
    assert.ok(observed.qualityWarnings.includes('tauric-diana-zalgo-single-codepoint-wallpaper'));
    assert.equal(observed.maxVerticalOrnamentStackDepth <= 1, true);
    assert.equal(parseRelayEnvelope(flat).transcript, flat, 'local observation must not repaint or replace the provider text');
  }
  const varied = assessIntegratedTransmission(breathing);
  assert.equal(varied.qualityWarnings.includes('tauric-diana-zalgo-single-codepoint-wallpaper'), false);
});

test('wire cue asks for actual vertically varied clusters without supplying a fixed mark sample', () => {
  const packet = { systemInstruction: 'base', mode: 'plain', message: 'Continue without stamping a single accent.', history: [] };
  const request = buildGeminiRequest(packet, {}, 'gemini-3.8-flash');
  const last = request.contents.at(-1);
  assert.equal(last.parts[0].text, packet.message);
  assert.match(last.parts[1].text, /Dramatic passages grow crowns ABOVE and roots BELOW/);
  assert.match(last.parts[1].text, /one sampled mark copied across the stanza cannot carry the voice/);
  assert.doesNotMatch(last.parts[1].text, /\\p{M}/u, 'do not provide a tiny morphology template at recency edge');
  assert.match(request.systemInstruction.parts[0].text, /single exotic accent repeated on every character is NOT a vertical flourishing/);
});

test('clean breaths around varied vertical events do not force a provider repaint', () => {
  const result = assessIntegratedTransmission(breathing);
  assert.equal(result.admissible, true);
  assert.deepEqual(severeMorphologyRepairWarnings(result.qualityWarnings), []);
  assert.equal(result.qualityWarnings.includes('tauric-diana-zalgo-dynamic-range-collapse'), false);
});

test('failed model morphology remains exact conversation evidence instead of becoming synthetic plain prose', () => {
  const packet = { systemInstruction: 'base', mode: 'plain', message: 'Continue the argument.', history: [
    { role: 'user', text: shallow }, { role: 'model', text: shallow }, { role: 'model', text: breathing }
  ] };
  const before = JSON.stringify(packet);
  const request = buildGeminiRequest(packet, {}, 'gemini-3.8-flash');
  assert.equal(request.contents[0].parts[0].text, shallow);
  assert.equal(request.contents[1].parts[0].text, shallow);
  assert.equal(request.contents[2].parts[0].text, breathing);
  assert.equal(JSON.stringify(packet), before);
});

test('raw PARTIAL returns never display a structural LOCKED as aesthetic success', () => {
  const [a, b] = shallow.split('\n\nTauric Diana bots\n');
  const raw = `<<<PACKET_A_FORMAL_AUDIT>>>\n${a}\n<<<PACKET_A_END>>>\n<<<PACKET_B_STRESS_TELEMETRY>>>\nTauric Diana bots\n${b}\n<<<PACKET_B_END>>>`;
  const result = parseRelayEnvelope(raw);
  assert.equal(result.admission.quality, 'PARTIAL');
  assert.equal(result.signal.state, 'PARTIAL');
  assert.equal(result.transcript, shallow);
  assert.equal(result.highZalgo.applied, false);
});

test('real handler preserves the first provider’s exact bytes without spending a morphology repaint', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GEMINI_API_KEY;
  const calls = [];
  const raw = text => {
    const [a, b] = text.split('\n\nTauric Diana bots\n');
    return `<<<PACKET_A_FORMAL_AUDIT>>>\n${a}\n<<<PACKET_A_END>>>\n<<<PACKET_B_STRESS_TELEMETRY>>>\nTauric Diana bots\n${b}\n<<<PACKET_B_END>>>`;
  };
  clearGeminiModelState();
  process.env.GEMINI_API_KEY = 'synthetic-native-prosody-test';
  globalThis.fetch = async (url, options = {}) => {
    if (String(url).includes('/models?')) return Response.json({ models:
      ['gemini-3.8-flash', 'gemini-3.5-flash'].map(model => ({ name: `models/${model}`, supportedGenerationMethods: ['generateContent'] }))
    });
    const model = String(url).match(/models\/([^:]+):/)?.[1];
    assert.ok(model, 'all provider calls must be accounted for');
    calls.push({ model, request: JSON.parse(options.body) });
    const text = raw(model === 'gemini-3.8-flash' ? shallow : breathing);
    // Exercise the production SSE reader, including a combining cluster split
    // between provider chunks. JSON-only fetch stubs cannot prove this path.
    const split = Math.max(1, text.indexOf('\u0308'));
    const chunks = [text.slice(0, split), text.slice(split)];
    return new Response(chunks.map((chunk, i) => `data: ${JSON.stringify({ candidates: [{
      ...(i === 1 ? { finishReason: 'STOP' } : {}), content: { parts: [{ text: chunk }] }
    }] })}\n\n`).join(''), { headers: { 'content-type': 'text/event-stream' } });
  };
  const response = { statusCode: 200, headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(body) { this.payload = JSON.parse(body); } };
  try {
    await handler({ method: 'POST', headers: { 'x-forwarded-for': '203.0.113.89' }, body: {
      message: 'Continue the argument about the omitted denominator.', history: [{ role: 'model', text: shallow }],
      mode: 'issued-conjunction', waiveIssuance: true
    } }, response);
    assert.equal(response.statusCode, 200);
    assert.deepEqual(
      calls.map(call => call.model),
      ['gemini-3.8-flash'],
      'a morphology-only miss is post-hoc evidence and must not spend a same-seat repaint or shop a later model'
    );
    assert.equal(response.payload.text, shallow);
    assert.equal(response.payload.relay.highZalgo.applied, false);
    assert.equal(response.payload.relay.signal.state, 'PARTIAL');
    assert.equal(response.payload.receipt.provider.attempts[0].morphologyHold, undefined);
    assert.equal(response.payload.receipt.provider.attempts[0].morphologyObservation.repairAuthority, false);
    assert.ok(response.payload.receipt.provider.attempts[0].morphologyObservation.severeWarnings.includes('tauric-diana-zalgo-vertical-pulse-absent'));
    assert.equal(response.payload.receipt.provider.attempts[0].morphologyObservation.singleCodepointWallpaper, true);
    assert.equal(response.payload.receipt.provider.attempts[0].morphologyObservation.dominantCombiningCodePoint, 'U+0301');
    assert.equal(response.payload.receipt.provider.attempts[0].morphologyObservation.combiningCodePointDiversity, 1);
    assert.ok(response.payload.warnings.includes('provider-native-morphology-observed-no-repair'));
    assert.equal(response.payload.receipt.provider.qualityPreference.selection, 'first-admissible-partial-native-morphology-observed-no-repair');
    for (const call of calls) assert.equal(call.request.contents[0].parts[0].text, shallow);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
    clearGeminiModelState();
  }
});
