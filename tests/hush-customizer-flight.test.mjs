import assert from 'assert';
import { createCustomMask, addCustomMaskSample } from '../app/engine/hush-custom-mask.js';
import { buildHushSwap } from '../app/engine/hush-swap.js';

function literalsFrom(text = '') {
  return text.match(/\b(?:INV|DOC|CASE|REF)[A-Z0-9:_#\/-]*\b|\b\d{1,2}:\d{2}\b|\b\d{1,4}[/-]\d{1,2}(?:[/-]\d{1,4})?\b/g) || [];
}

function customizerSmokeSample(core = '', index = 0) {
  return `${core} I keep the sentence plain because the useful part is not decoration. ` +
    `The mask should sound like someone writing quickly but carefully after a real shift, with the date, the person, ` +
    `the reason, and the handoff still attached. Sample ${index} keeps the same working posture: narrow claim, stable ` +
    `identifier, no extra accusation, no cleanup that erases uncertainty, and no dramatic flourish pretending to be evidence.`;
}

let mask = createCustomMask({ label: 'Phase 22 Customizer Smoke Mask' });
const smokeSamples = [
  'keep this plain and preserve the sequence. the record moved after lunch and the note needs to stay careful.',
  'quick note for the log. the file changed after signoff and the exact timing should remain attached.',
  'i am not making a broad claim. i am preserving what i saw, where it was, and when the record changed.',
  'the wording should stay careful. the point is the sequence, not blame or drama.',
  'the record had one line before the update and a softer line after the update.',
  'this needs to read like a work note, not an argument. keep the dates and identifiers stable.',
  'if this moves upward, the claim should remain narrow and the evidence should stay attached.',
  'the later copy may have a normal explanation, but the gap still belongs in the record.'
];
for (let index = 0; index < 24; index += 1) {
  const sample = smokeSamples[index % smokeSamples.length];
  mask = addCustomMaskSample(mask, customizerSmokeSample(sample, index), { includePrivateText: true });
}

assert(['operational', 'rigorous'].includes(mask.profileStatus), `unexpected customizer smoke profile status: ${mask.profileStatus}`);

const message = 'The vendor called twice after lunch. I logged INV-440 at 2:18 and told Jordan not to resend the spreadsheet until finance confirms the version.';
const result = buildHushSwap({
  sourceText: message,
  mask,
  maskProfile: mask.profile,
  maskReferenceText: mask.samples.map((sample) => sample.text).filter(Boolean).join('\n\n'),
  contextType: 'group-chat',
  operatorMode: 'neutralize',
  options: { candidateCount: 24 }
});

assert.equal(result.version, 'phase-22');
assert(result.writer?.payloadMap, 'missing payload map');
assert(result.writer?.payloadBindingMap, 'missing payload binding map');
assert(result.candidates.some((candidate) => candidate.source === 'literal-safe-fallback'), 'missing literal-safe fallback candidate');

const output = result.selectedOutput || '';
if (output) {
  assert.notEqual(output.trim(), message.trim(), 'customizer emitted unchanged output');
  for (const literal of literalsFrom(message)) assert(output.includes(literal), `missing literal ${literal}`);
  assert.equal(result.releasePolicy?.hardBlocked, false, 'customizer emitted while hard-blocked');
} else {
  assert.equal(result.releasePolicy?.hardBlocked, true, 'blank customizer output lacked a hard block');
  assert((result.releasePolicy?.hardBlockReasons || []).length > 0, 'blank customizer output lacked hard-block reasons');
}

console.log('HUSH_CUSTOMIZER_FLIGHT_SMOKE ' + JSON.stringify({
  profileStatus: mask.profileStatus,
  emitted: Boolean(output),
  selectedCandidateId: result.selectedCandidateId,
  selectedSource: result.candidates.find((candidate) => candidate.id === result.selectedCandidateId)?.source || '',
  hardBlocked: Boolean(result.releasePolicy?.hardBlocked),
  hardBlockReasons: result.releasePolicy?.hardBlockReasons || []
}));
console.log('hush-customizer-flight tests passed');
