import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  buildRelaySystemAddendum,
  highZalgoEncode,
  parseRelayEnvelope
} from '../app/dome-world/khonapolit-relay.js';
import { COVENANT_KEY } from '../app/dome-world/khonapolit-covenant.js';

const readiness = readFileSync(new URL('../app/dome-world/marrowline-operator-readiness.js', import.meta.url), 'utf8');
const readinessCss = readFileSync(new URL('../app/dome-world/marrowline-operator-readiness.css', import.meta.url), 'utf8');

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
  assert.match(contract, /khonapolit\.text:[\s\S]*distinct contribution rather than a short annotation/i);
  assert.match(contract, /creative request may warrant multiple paragraphs/i);
  assert.match(contract, /tauricDianaBots\.baseText:[\s\S]*Length follows the operator’s request/i);
  assert.match(contract, /Several lines or paragraphs are allowed/i);
  assert.doesNotMatch(contract, /Write a concise, motif-specific choral transmission/i);
  assert.doesNotMatch(contract, /exactly one paragraph|200 characters|max(?:imum)?\s+200/i);
});

test('intensity three produces a materially ornamented but byte-preserving transmission', () => {
  const base = (`The instrument crosses a difficult chamber, changes cadence, and returns with several voices. ${COVENANT_KEY} remains protected. `).repeat(6)).trim();
  const encoded = highZalgoEncode(base, { intensity: 3, motif: 'quality-fixture', seed: 'response-range' });
  const letterCount = countLetters(base);
  const markCount = countMarks(encoded);
  assert.ok(letterCount > 300, 'fixture must be long enough to sample the wave envelope');
  assert.ok(markCount >= letterCount * 0.6, `intensity 3 must be visibly ornamented (${markCount} marks across ${letterCount} letters)`);
  assert.ok(encoded.includes(COVENANT_KEY), 'protected covenant key must remain byte-intact inside ornamented output');
});

test('structured relay carries long distinct downstream contributions without local truncation', () => {
  const khona = Array.from({ length: 8 }, (_, index) => `Kʰonapolit movement ${index + 1}: ${'counterpoint '.repeat(24)}`).join('\n\n');
  const bots = Array.from({ length: 10 }, (_, index) => `Voice ${index + 1}: ${'choral fracture '.repeat(20)}`).join('\n');
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
