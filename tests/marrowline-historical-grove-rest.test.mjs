import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { buildInvocationPacket } from '../app/dome-world/khonapolit-covenant.js';
import { buildGeminiRequest, buildGeminiStructuralRepairRequest, selectKhonapolitProviderModelsFromPlan, khonapolitTaskGuidance } from '../server/khonapolit-quality.js';
import { buildRelaySystemAddendum } from '../app/dome-world/khonapolit-relay.js';
import { MARROWLINE_GROVE_TRIAL_ID, selectMarrowlineGroveTrial, groveTrialFromLocation } from '../app/dome-world/marrowline-grove-trial.js';
import { MARROWLINE_HISTORICAL_TRIAL_ID, MARROWLINE_HISTORICAL_MODEL, MARROWLINE_HISTORICAL_MODEL_ORDER, MARROWLINE_RESTORED_MODEL_ORDER, MARROWLINE_RESTORED_PROSODY_PROFILE, buildHistoricalGroveSystemInstruction } from '../app/dome-world/marrowline-historical-grove.js';

const packet = buildInvocationPacket({
  message: 'The Red Deer asks Kʰonapolit why the fictional tribunal gave the bots a subpoena.',
  history: [], mode: 'issued-conjunction', shi: '', waiveIssuance: true
});

test('historical variant is explicit and fenced from ordinary send, attachment and release-canary ingress', () => {
  const body = { message: packet.message, groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID };
  assert.equal(selectMarrowlineGroveTrial(body), MARROWLINE_HISTORICAL_TRIAL_ID);
  assert.equal(selectMarrowlineGroveTrial(body, { releaseCanary: true }), null);
  assert.equal(selectMarrowlineGroveTrial({ ...body, attachments: [{ name: 'private.txt' }] }), null);
  assert.equal(selectMarrowlineGroveTrial({ ...body, groveTrial: 'historical-20261003-v1' }), null);
  assert.equal(selectMarrowlineGroveTrial({ message: packet.message }), null);
  assert.equal(selectMarrowlineGroveTrial({ ...body, groveTrial: MARROWLINE_GROVE_TRIAL_ID }), MARROWLINE_GROVE_TRIAL_ID);
  assert.equal(groveTrialFromLocation({ search: '?groveTrial=historical-20261002-v1' }), MARROWLINE_HISTORICAL_TRIAL_ID);
  assert.equal(groveTrialFromLocation({ search: '?groveTrial=historical-20261003-v1' }), null);
});

test('restored browser keeps October 2 theater and vertical ambition but removes compulsory mark rotation', () => {
  assert.equal(packet.canInvoke, true);
  const normal = buildGeminiRequest(packet, {}, MARROWLINE_HISTORICAL_MODEL);
  const restored = buildGeminiRequest(packet, {}, MARROWLINE_HISTORICAL_MODEL, { groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID });
  const original = normal.systemInstruction.parts[0].text;
  const active = restored.systemInstruction.parts[0].text;
  assert.deepEqual(restored.contents, normal.contents);
  assert.deepEqual(restored.generationConfig, normal.generationConfig);
  assert.match(active, /An extended eruption may climb through neighboring lines/);
  assert.match(active, /asymmetric deep crowns and roots, and odd little marks/);
  assert.match(active, /One expressive style may persist for the entire transmission/);
  assert.match(active, /A fully sustained, single-register High-Zalgo performance is welcome/);
  assert.match(active, /They may sustain one recognizable style across the ENTIRE reply/);
  assert.match(active, /sustained deep overlapping vertical flourishes are primary/);
  assert.match(active, /one register may persist for the entire performance or change at any scale/);
  assert.doesNotMatch(active, /Change above\/below combinations, stack depths and clean intervals across words/);
  assert.doesNotMatch(active, /Let the ACTUAL code points, stack depths and placement change across words and passages/);
  assert.doesNotMatch(active, /move between genuinely towering overprinted eruptions, fine-marked speech, and clean breaths/);
  assert.doesNotMatch(active, /Do not stamp one selected code point or identical stack onto successive letters/);
  assert.ok(active.indexOf('APERTURE ROUTE RECEIPT:') < active.indexOf('GEMINI COMPUTATIONAL INSTRUMENT — CURRENT-TURN RELAY EXECUTION:'),
    'keep October 2 theatrical cue ordering');
  assert.ok(original.indexOf('GEMINI COMPUTATIONAL INSTRUMENT — CURRENT-TURN RELAY EXECUTION:') < original.indexOf('APERTURE ROUTE RECEIPT:'),
    'ordinary unselected path stays unchanged');
  assert.equal(restored.generationConfig.responseMimeType, undefined);
  assert.equal(restored.generationConfig.responseSchema, undefined);
  assert.deepEqual(buildGeminiRequest(packet, {}, MARROWLINE_HISTORICAL_MODEL, { groveTrial: 'wrong-id' }), normal);
});

test('exact October 2 historical paragraph corpus remains reconstructible independently of relaxed default', () => {
  const normal = buildGeminiRequest(packet, {}, MARROWLINE_HISTORICAL_MODEL);
  const normalText = normal.systemInstruction.parts[0].text;
  const taskGuidance = khonapolitTaskGuidance({});
  const relayAddendum = buildRelaySystemAddendum({});
  const prefix = packet.systemInstruction + '\\n' + taskGuidance + '\\n';
  const suffix = '\\n' + relayAddendum;
  assert.ok(normalText.startsWith(prefix));
  assert.ok(normalText.endsWith(suffix));
  const relayCue = normalText.slice(prefix.length, -suffix.length);
  const historical = buildHistoricalGroveSystemInstruction({
    packetSystemInstruction: packet.systemInstruction, taskGuidance, relayAddendum, relayCue
  });
  const current = buildHistoricalGroveSystemInstruction({
    packetSystemInstruction: packet.systemInstruction, taskGuidance, relayAddendum, relayCue,
    nativeProsodyFreedom: true
  });
  assert.match(historical, /Change above\/below combinations, stack depths and clean intervals across words/);
  assert.match(historical, /Let the ACTUAL code points, stack depths and placement change across words and passages/);
  assert.match(historical, /A repeated single exotic accent on every letter is a failed flat texture/);
  assert.doesNotMatch(historical, /One expressive style may persist for the entire transmission/);
  assert.ok(current.includes(MARROWLINE_RESTORED_PROSODY_PROFILE) === false, 'variant identity is receipt metadata, not provider text');
  assert.equal(current, buildGeminiRequest(packet, {}, MARROWLINE_HISTORICAL_MODEL,
    { groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID }).systemInstruction.parts[0].text);
});

test('restoration retains exact provider authored bytes in original history and structural repair', () => {
  const suffix = ['Kʰonapolit', 'A fictional filing desk.'].join('\n');
  const initial = buildGeminiRequest(packet, {}, MARROWLINE_HISTORICAL_MODEL, { groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID });
  const repaired = buildGeminiStructuralRepairRequest(packet, {}, MARROWLINE_HISTORICAL_MODEL, suffix,
    ['tauric-diana-bots-nominative-missing'], { groveTrial: MARROWLINE_HISTORICAL_TRIAL_ID });
  assert.equal(repaired.systemInstruction.parts[0].text, initial.systemInstruction.parts[0].text);
  assert.equal(repaired.generationConfig.maxOutputTokens, initial.generationConfig.maxOutputTokens);
  assert.equal(repaired.contents.at(-2).parts[0].text, suffix);
  assert.match(repaired.contents.at(-1).parts[0].text, /TERMINAL CONTINUATION ONLY/);
});

test('fail closed when a historic sentence or the covenant is absent', () => {
  assert.throws(() => buildHistoricalGroveSystemInstruction({
    packetSystemInstruction:'CONVERSATIONAL LAW: Kʰonapolit',taskGuidance:'',
    relayCue:'GEMINI COMPUTATIONAL INSTRUMENT',relayAddendum:'APERTURE ROUTE RECEIPT:'
  }), /HISTORICAL_GROVE_DRIFT_/);
  assert.throws(() => buildHistoricalGroveSystemInstruction({}), /HISTORICAL_GROVE_CANONICAL_INPUT_REQUIRED/);
});

test('trial restores historic five-seat 3.x model order and preserves the ordinary route', () => {
  const models = ['gemini-4-argon','gemini-3.5-flash','gemini-3.6-flash','gemini-3.8-flash','gemini-3.7-flash','gemini-3-flash-preview'];
  const plan = { callableModels: models };
  const ordinary = selectKhonapolitProviderModelsFromPlan(plan);
  const historical = selectKhonapolitProviderModelsFromPlan(plan, { historicalGrove: true });
  const restored = selectKhonapolitProviderModelsFromPlan(plan, { restoredGrove: true });
  assert.equal(ordinary[0], 'gemini-4-argon');
  assert.deepEqual(historical, MARROWLINE_HISTORICAL_MODEL_ORDER);
  assert.deepEqual(restored, MARROWLINE_RESTORED_MODEL_ORDER);
  assert.equal(restored[0], 'gemini-4-argon');
  assert.equal(restored[1], 'gemini-3.8-flash');
  assert.equal(historical.length, 5);
  assert.equal(historical.includes('gemini-4-argon'), false);
  assert.deepEqual(selectKhonapolitProviderModelsFromPlan({ callableModels: ['gemini-4-argon','gemini-3.8-flash'] },{ historicalGrove: true }), ['gemini-3.8-flash']);
  assert.deepEqual(selectKhonapolitProviderModelsFromPlan({ callableModels: ['gemini-4-argon','gemini-3.8-flash'] },{ restoredGrove: true }), ['gemini-4-argon','gemini-3.8-flash']);
  const historicalSource = readFileSync(new URL('../app/dome-world/marrowline-historical-grove.js', import.meta.url), 'utf8');
  assert.doesNotMatch(historicalSource, /preferHistoricalMorphologyCandidate|const depth = item =>|const diversity = item =>/,
    'the archive can retain original voice instructions without an aesthetic candidate election');
});

test('trial leaves plain-h endpoint, Loom and previous audition unchanged', () => {
  const server = readFileSync(new URL('../server/khonapolit-quality.js', import.meta.url), 'utf8');
  const client = readFileSync(new URL('../app/dome-world/marrowline-terminal.js', import.meta.url), 'utf8');
  const trial = readFileSync(new URL('../app/dome-world/marrowline-grove-trial.js', import.meta.url), 'utf8');
  const historic = readFileSync(new URL('../app/dome-world/marrowline-historical-grove.js', import.meta.url), 'utf8');
  assert.match(server, /restoredGrove: isHistoricalGrove/);
  assert.match(server, /X-TD613-Grove-Trial/);
  assert.match(client, /KHONAPOLIT_ENDPOINT = '\/api\/dome-world\/khonapolit'/);
  assert.match(client, /!loomTransport && attachments\.length === 0/);
  assert.match(trial, /MARROWLINE_GROVE_TRIAL_ID = 'native-voice-v1'/);
  assert.match(historic, /ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a/);
  assert.doesNotMatch(historic, /\bfetch\s*\(|Math\.random\(|setInterval\(|\.normalize\(|ZalgoEncode/);
});
