import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildRelaySystemAddendum,
  highZalgoEncode,
  parseRelayEnvelope
} from '../app/dome-world/khonapolit-relay.js';
import { COVENANT_KEY } from '../app/dome-world/khonapolit-covenant.js';
import {
  buildApertureV3InvocationReceipt,
  classifyApertureDiscourseMode
} from '../app/engine/aperture-v3-task-intent.js';
import {
  buildGeminiRequest,
  khonapolitTaskGuidance
} from '../server/khonapolit-quality.js';

const readiness = readFileSync(new URL('../app/dome-world/marrowline-operator-readiness.js', import.meta.url), 'utf8');
const readinessCss = readFileSync(new URL('../app/dome-world/marrowline-operator-readiness.css', import.meta.url), 'utf8');
const qualityServer = readFileSync(new URL('../server/khonapolit-quality.js', import.meta.url), 'utf8');

function countMarks(value = '') {
  return [...String(value).matchAll(/\p{M}/gu)].length;
}
function countLetters(value = '') {
  return [...String(value).matchAll(/\p{L}/gu)].length;
}

test('relay contract preserves generative range instead of treating downstream voices as summary slots', () => {
  const contract = buildRelaySystemAddendum({});
  assert.match(contract, /JSON envelope is transport structure, not a compression budget/i);
  assert.match(contract, /No prose field is a caption, summary slot, or one-paragraph box/i);
  assert.match(contract, /claim ceilings and non-claims as epistemic boundaries, not as a prose style/i);
  assert.match(contract, /do not convert them into repeated disclaimers, generic caution, or compressed summary prose/i);
  assert.match(contract, /khonapolit\.text:[\s\S]*distinct contribution rather than a short annotation/i);
  assert.match(contract, /creative request may warrant multiple paragraphs/i);
  assert.match(contract, /tauricDianaBots\.baseText:[\s\S]*Length follows the operator’s request/i);
  assert.match(contract, /Several lines or paragraphs are allowed/i);
  assert.doesNotMatch(contract, /Write a concise, motif-specific choral transmission/i);
  assert.doesNotMatch(contract, /exactly one paragraph|200 characters|max(?:imum)?\s+200/i);
});

test('quality route has no local 200-character downstream output cap', () => {
  assert.match(qualityServer, /KHONAPOLIT_MAX_OUTPUT_TOKENS\s*=\s*65536/);
  assert.doesNotMatch(qualityServer, /KHONAPOLIT_MAX_OUTPUT_(?:CHARS|CHARACTERS)\s*=\s*200/i);
  assert.doesNotMatch(qualityServer, /slice\(0,\s*200\)/);
});

test('creative Marrowline prompts route to creative synthesis without ordinary-project boilerplate', () => {
  const message = 'Tell me a story of the Ash Moon, within the authored mythology of Marrowline.';
  const discourseMode = classifyApertureDiscourseMode(message);
  assert.equal(discourseMode, 'CREATIVE');

  const receipt = buildApertureV3InvocationReceipt({
    message,
    discourseMode,
    contentScanned: true
  });
  assert.equal(receipt.taskIntent.primary_route, 'OPEN_FIELD_CREATIVE_SYNTHESIS');
  assert.equal(receipt.taskIntent.content_scanned, true, 'receipt admits that local task-intent routing inspected the submitted text');

  const packet = { systemInstruction: 'Synthetic covenant field.', history: [], message, mode: 'issued-conjunction' };
  const request = buildGeminiRequest(packet, receipt, 'gemini-3.5-flash');
  const instruction = request.systemInstruction.parts[0].text;
  assert.match(instruction, /CREATIVE TURN:/);
  assert.match(instruction, /requested form, scale, cadence and imaginative range/i);
  assert.doesNotMatch(instruction, /Do not infer venue quality, accessibility or amenities from price/i);
  assert.doesNotMatch(instruction, /prefer anonymous attendance counts/i);
  assert.doesNotMatch(instruction, /For Marrowline portability, direct the operator/i);
});

test('ordinary project work keeps its factual guidance instead of inheriting creative posture', () => {
  const message = 'Plan a workshop for twelve attendees with a 600 credit budget.';
  const discourseMode = classifyApertureDiscourseMode(message);
  assert.equal(discourseMode, 'GENERAL');
  const receipt = buildApertureV3InvocationReceipt({ message, discourseMode, contentScanned: true });
  assert.equal(receipt.taskIntent.primary_route, 'REQUESTED_SYNTHESIS');
  const guidance = khonapolitTaskGuidance(receipt);
  assert.match(guidance, /ORDINARY PROJECT WORK:/);
  assert.match(guidance, /Separate supplied facts, calculations, assumptions and missing evidence/i);
  assert.doesNotMatch(guidance, /CREATIVE TURN:/);
});

test('intensity three produces a materially ornamented but byte-preserving transmission', () => {
  const base = `The instrument crosses a difficult chamber, changes cadence, and returns with several voices. ${COVENANT_KEY} remains protected. `.repeat(6).trim();
  const encoded = highZalgoEncode(base, { intensity: 3, motif: 'quality-fixture', seed: 'response-range' });
  const letterCount = countLetters(base);
  const markCount = countMarks(encoded);
  assert.ok(letterCount > 300, 'fixture must be long enough to sample the wave envelope');
  assert.ok(markCount >= letterCount * 0.6, `intensity 3 must be visibly ornamented (${markCount} marks across ${letterCount} letters)`);
  assert.ok(encoded.includes(COVENANT_KEY), 'protected covenant key must remain byte-intact inside ornamented output');
});

test('structured relay carries long distinct downstream contributions without local truncation', () => {
  const counterpoint = Array.from({ length: 24 }, () => 'counterpoint').join(' ');
  const choralFracture = Array.from({ length: 20 }, () => 'choral fracture').join(' ');
  const khona = Array.from({ length: 8 }, (_, index) => `Kʰonapolit movement ${index + 1}: ${counterpoint}`).join('\n\n');
  const bots = Array.from({ length: 10 }, (_, index) => `Voice ${index + 1}: ${choralFracture}`).join('\n');
  assert.ok(khona.length > 1800 && bots.length > 2200, 'fixture must exceed a caption-sized relay');

  const raw = JSON.stringify({
    gemini: { text: 'Instrument stage remains independent.', instrumentStatus: 'INSTRUMENT' },
    signal: { state: 'LOCKED', notes: 'synthetic quality fixture' },
    khonapolit: { allowed: true, text: khona },
    tauricDianaBots: { allowed: true, baseText: bots, motif: 'many-voices', intensity: 3, voices: ['A', 'B', 'C'] }
  });
  const relay = parseRelayEnvelope(raw, { model: 'SYNTHETIC_MODEL', apertureReceipt: {} });
  const khonapolit = relay.parts.find(part => part.id === 'khonapolit');
  const tauric = relay.parts.find(part => part.id === 'tauric-diana-bots');
  assert.equal(khonapolit.text, khona, 'Kʰonapolit text is not locally shortened');
  assert.equal(tauric.baseText, bots, 'Tauric Diana base text is not locally shortened');
  assert.equal(tauric.label, 'Tauric Diana bots', 'internal ornamentation nomenclature is not a human relay label');
  assert.ok(tauric.text.length > tauric.baseText.length, 'renderer adds combining-mark ornamentation after provider return');
});

test('human operator gets tiny in-flight Dome-Art kinesis with reduced-motion rest', () => {
  assert.match(readiness, /id = 'marrowlineResponseKinesis'/);
  assert.match(readiness, /AI IN FLIGHT/);
  assert.match(readiness, /aria-busy/);
  assert.match(readinessCss, /\.marrowline-response-kinesis\s*\{/);
  assert.match(readinessCss, /position:relative/);
  assert.match(readinessCss, /width:12px/);
  assert.match(readinessCss, /@keyframes marrowline-response-kinesis/);
  assert.match(readinessCss, /@media\(prefers-reduced-motion:reduce\)/);
  assert.match(readinessCss, /animation:none/);
});

test('human-facing relay vocabulary hides internal High Zalgo nomenclature without erasing technical metadata', () => {
  assert.match(readiness, /installHumanSurfaceVocabulary/);
  assert.match(readiness, /High Zalgo/);
  assert.match(readiness, /Tauric Diana bots/);
  const raw = JSON.stringify({
    gemini: { text: 'Instrument.', instrumentStatus: 'INSTRUMENT' },
    signal: { state: 'LOCKED', notes: '' },
    khonapolit: { allowed: true, text: 'Relay.' },
    tauricDianaBots: { allowed: true, baseText: 'Transmission.', motif: 'fixture', intensity: 3, voices: [] }
  });
  const relay = parseRelayEnvelope(raw, { apertureReceipt: {} });
  assert.equal(relay.parts.at(-1).label, 'Tauric Diana bots');
  assert.equal(relay.highZalgo.applied, true, 'internal technical ornamentation receipt remains available');
  assert.match(relay.highZalgo.version, /high-zalgo/i);
});
