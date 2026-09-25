import test from 'node:test';
import assert from 'node:assert/strict';
import { assessIntegratedTransmission, buildNativeProsodyGuidance, parseRelayEnvelope } from '../app/dome-world/khonapolit-relay.js';
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
  for (const [mark, expected] of [['\u0301', 'U+0301'], ['\u0336', 'U+0336'], ['\u0317', 'U+0317']]) {
    const flat = heading + [
      'THE MAP COUNTS THE ASH AND MISPLACES THE WITNESS.',
      'THE FLOOR REMAINS FLAT EVEN WHEN THE ACCENT CHANGES.',
      'A SECOND PHRASE REPEATS THE IDENTICAL ORNAMENT.'
    ].map(line => line.replace(/[A-Z]/g, letter => letter + mark)).join('\n');
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
  assert.match(last.parts[1].text, /changing crowns above and roots below the prose letters/);
  assert.match(last.parts[1].text, /deep, irregular overlaps even when the subject is tender/);
  assert.match(last.parts[1].text, /return with a changed silhouette/);
  assert.doesNotMatch(last.parts[1].text, /\p{M}/u, 'do not provide a tiny morphology template at recency edge');
  assert.match(request.systemInstruction.parts[0].text, /a little repeated accent make a joke/);
  assert.match(request.systemInstruction.parts[0].text, /without an after-the-fact transform/);
});

test('a locally repeated accent and tiny combining-letter play coexist with original deep crowns and roots', () => {
  const repeated = 'H\u0301A\u0301H\u0301A\u0301!\n' +
    'i\u0367t\u036d \u0301is a little joke.\n\n';
  const raw = heading + repeated + peaks + ' — and now the roots answer.\n' +
    peaks + ' throws its crown across a neighboring line.\n\nQuiet.';
  const relay = parseRelayEnvelope(raw);
  assert.equal(relay.transcript, raw);
  assert.equal(relay.highZalgo.applied, false);
  assert.ok(relay.highZalgo.combiningMarkCount > 0);
  const result = assessIntegratedTransmission(raw);
  assert.ok(result.maxVerticalOrnamentStackDepth > 0);
  const request = buildGeminiRequest({ systemInstruction: 'base', mode: 'plain', message: 'Speak.', history: [] }, {}, 'gemini-3.8-flash');
  const cue = request.contents.at(-1).parts[1].text;
  const guidance = request.systemInstruction.parts[0].text;
  assert.match(cue, /tumble into tiny combining-letter jokes, repeat an accent as a refrain/);
  assert.match(guidance, /a little repeated accent make a joke/);
  assert.match(cue, /deep, irregular overlaps even when the subject is tender/);
  assert.match(guidance, /deep enough to overlap the next line/);
  assert.doesNotMatch(cue, /one sampled mark copied|identical stack across letters/);
  assert.doesNotMatch(guidance, /Do not stamp one selected code point/);
});

test('locally welcomed patterns cannot stand in for the bots whole expressive vertical register', () => {
  const request = buildGeminiRequest(
    { systemInstruction: 'base', mode: 'plain', message: 'Follow the consequence into the choral movement.', history: [] },
    {}, 'gemini-3.8-flash'
  );
  const cue = request.contents.at(-1).parts[1].text;
  const native = buildNativeProsodyGuidance();
  const system = request.systemInstruction.parts[0].text;
  assert.ok(system.includes(native), 'the shared prosody remains in the effective provider system instruction');
  assert.match(cue, /repeat an accent as a refrain, then return with a changed silhouette/);
  assert.match(native, /a little repeated accent make a joke/);
  assert.match(cue, /whole chorus of cloned stacks loses their voice/);
  assert.match(native, /rather than stamping one accent or stack onto every letter/);
  assert.match(cue, /changing crowns above and roots below the prose letters/);
  assert.match(native, /combinations of crowns ABOVE and roots BELOW/);
  assert.match(cue, /Kʰonapolit develops the first movement at the scale the operator requests/);
  assert.match(cue, /strongest plausible resistance enough force to make the answer earn its consequence/);
  assert.match(native, /Kʰonapolit writes undecorated prose with ZERO combining diacritical marks/);
  assert.doesNotMatch(cue + native, /marks.per.character quota|mandatory vertical threshold|repeat the following glyphs/i);
  assert.doesNotMatch(cue + native, /[\u0300-\u036f]/u, 'do not insert sample combining marks as an implicit stamp');
});

test('authored paragraph rests coexist with crowded deep stacks without local reflow', () => {
  const packet = { systemInstruction: 'base', mode: 'plain', message: 'Make the consequence sing.', history: [] };
  const request = buildGeminiRequest(packet, {}, 'gemini-3.8-flash');
  const shared = request.systemInstruction.parts[0].text;
  const cue = request.contents.at(-1).parts[1].text;
  assert.match(shared, /actual blank-line paragraph rests/);
  assert.match(shared, /silly, mercurial and cryptic/);
  assert.match(shared, /Do not impose a stanza template/);
  assert.match(cue, /blank-line paragraph breaks as pauses, pivots, comic traps/);
  assert.match(cue, /Never require blank lines before or after every stack/);
  const raw = heading + 'A\u0301 quick turn.\n' + peaks + ' presses against its neighbor.\n\n' +
    'Quiet.\n\n' + peaks + ' — then the interruption.\n' + 'No pause was owed.\n⟐';
  const parsed = parseRelayEnvelope(raw);
  assert.equal(parsed.transcript, raw);
  assert.equal(parsed.highZalgo.applied, false);
  assert.match(parsed.transcript, /neighbor\.\n\nQuiet\.\n\n/);
  assert.match(parsed.transcript, /interruption\.\nNo pause was owed/);
  assert.equal(assessIntegratedTransmission(raw).admissible, true);
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


test('operator-authored prompts have starter-equivalent dramatic latitude without global rage or blanket bold', () => {
  const typed = 'Could we look at the consequences of this rule without assuming the answer?';
  const request = buildGeminiRequest({ systemInstruction: 'base', mode: 'plain', message: typed, history: [] }, {}, 'gemini-3.8-flash');
  const cue = request.contents.at(-1).parts[1].text;
  const shared = request.systemInstruction.parts[0].text;
  assert.match(cue, /EVERY turn, including a greeting, gentle question or joke/);
  assert.match(cue, /Anger changes the argument when warranted; it never unlocks the typography/);
  assert.match(shared, /No anger, inflammatory premise or dramatic rupture unlocks this alphabet/);
  assert.match(shared, /Do not treat typography as a checklist, quota, fixed contour/);
  assert.match(cue, /Use Markdown bold only for specific terms, sharp pivots or selective emphasis/);
  assert.match(request.contents.at(-1).parts[0].text, /Could we look at the consequences of this rule/);
});


test('ordinary, tender and adversarial typed requests all retain the full native High-Zalgo vocabulary', () => {
  const prompts = [
    'Hi! How is the evening going?',
    'Tell me a gentle story about the red deer.',
    'Please explain a spreadsheet column.',
    'Challenge this institution with all your indignation.'
  ];
  const shared = buildNativeProsodyGuidance();
  assert.match(shared, /first sentence in every conversation, including ordinary questions, jokes and tenderness/);
  assert.match(shared, /combinations of crowns ABOVE and roots BELOW/);
  assert.match(shared, /No anger, inflammatory premise or dramatic rupture unlocks this alphabet/);
  assert.doesNotMatch(shared, /at an earned rupture|Typed prompts may earn fury/);
  for (const message of prompts) {
    const packet = { systemInstruction: 'base', mode: 'plain', message, history: [] };
    const request = buildGeminiRequest(packet, {}, 'gemini-3.8-flash');
    const cue = request.contents.at(-1).parts[1].text;
    const actual = request.contents.at(-1).parts[0].text;
    assert.equal(actual, message);
    assert.ok(request.systemInstruction.parts[0].text.includes(shared));
    assert.match(cue, /native High-Zalgo speech on the first sentence of EVERY turn/);
    assert.match(cue, /scream-sing handwriting stays audible throughout the response/);
    assert.match(cue, /deep, irregular overlaps even when the subject is tender/);
    assert.match(cue, /Anger changes the argument when warranted; it never unlocks the typography/);
    assert.doesNotMatch(cue, /When the subject earns indignation|at an earned rupture the same speech can carry/);
    assert.doesNotMatch(cue + shared, /marks.per.character quota|automatic rage mode|repeat the following glyphs/i);
    assert.doesNotMatch(cue + shared, /\p{M}/u, 'do not introduce a fixed mark specimen into provider guidance');
  }
});
