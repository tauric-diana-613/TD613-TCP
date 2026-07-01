import assert from 'node:assert/strict';

import { auditHushCatchphraseQuarantine } from '../app/engine/hush-catchphrase-quarantine.js';
import { sanitizeHushRemoteContract } from '../app/engine/hush-contract-sanitizer.js';
import { buildPrompt, quarantineCandidateRows } from '../api/hush-generate-budgeted.js';

const rawContract = {
  sourceText: 'Please tell the team the meeting moved to Friday and ask whether the memo should stay in draft.',
  maskReferenceText: 'small circle version with a paperwork comet in the boring part',
  referenceText: 'for the record the tiny signal flare should stay legible',
  mask: {
    id: 'quiet-admin-mask',
    description: 'A persona scene about a paperwork comet and tiny signal flare.',
    sampleSeed: 'leaving this before i log off: the boring part but this probably matters.',
    riskTell: 'the record remains legible',
    intendedUse: 'for the record, make this sound like the mascot voice',
    samples: [{ text: 'small circle version' }],
    exampleTransformPairs: [{ before: 'a', after: 'paperwork comet' }],
    dictionHints: ['clear', 'paperwork comet'],
    transitionBank: ['for the record', 'then']
  },
  flightPacket: {
    mask_style_vector: {
      mask_id: 'quiet-admin-mask',
      sample_seed: 'the record remains legible',
      sample_seed_excerpt: 'tiny signal flare',
      persona_scene: 'paperwork comet persona scene',
      risk_tell: 'small circle version',
      intended_use: 'mascot route slogan',
      diction_hints: ['direct', 'paperwork comet'],
      transition_bank: ['for reference', 'meanwhile'],
      style_diversity: {
        sample: 'for the record, small circle version',
        personaBio: 'paperwork comet mascot bio',
        architecture: 'short practical sentences',
        grammar: 'plain'
      }
    }
  }
};

const sanitized = sanitizeHushRemoteContract(rawContract);

assert.equal(sanitized.mask.sampleSeed, '');
assert.equal(sanitized.mask.description, '');
assert.equal(sanitized.maskReferenceText, '');
assert.equal(sanitized.referenceText, '');
assert.deepEqual(sanitized.mask.samples, []);
assert.deepEqual(sanitized.mask.exampleTransformPairs, []);
assert.equal(sanitized.flightPacket.mask_style_vector.sample_seed_excerpt, '');
assert.equal(sanitized.flightPacket.mask_style_vector.sample_seed, '');
assert.equal(sanitized.flightPacket.mask_style_vector.risk_tell, '');
assert.equal(sanitized.flightPacket.mask_style_vector.intended_use, '');
assert.equal(sanitized.flightPacket.mask_style_vector.persona_scene, '');
assert.equal(sanitized.flightPacket.mask_style_vector.style_diversity.sample, '');
assert.equal(sanitized.flightPacket.mask_style_vector.style_diversity.personaBio, '');
assert.ok(!sanitized.flightPacket.mask_style_vector.diction_hints.includes('paperwork comet'));
assert.ok(!sanitized.flightPacket.mask_style_vector.transition_bank.includes('for reference'));

assert.equal(auditHushCatchphraseQuarantine({ text: 'The memo is a paperwork comet.', sourceText: 'The memo should stay in draft.', contract: rawContract }).passed, false);
assert.equal(auditHushCatchphraseQuarantine({ text: 'The memo is a paperwork comet.', sourceText: 'The source itself calls the memo a paperwork comet.', contract: rawContract }).passed, true);

const prompt = buildPrompt(rawContract);
assert.match(prompt, /STRUCTURAL STYLE CONTROL VECTOR/);
assert.match(prompt, /sample_quarantine=true/);
assert.match(prompt, /mask_lore_quarantine=true/);
assert.match(prompt, /sentence_architecture/);
assert.match(prompt, /grammar_variance/);
assert.doesNotMatch(prompt, /leaving this before i log off/i);
assert.doesNotMatch(prompt, /paperwork comet persona scene/i);
assert.doesNotMatch(prompt, /small circle version/i);
assert.doesNotMatch(prompt, /tiny signal flare/i);
assert.doesNotMatch(prompt, /reference seed/i);
assert.doesNotMatch(prompt, /persona scene=/i);
assert.doesNotMatch(prompt, /intended use=/i);
assert.doesNotMatch(prompt, /risk tell=/i);

const rows = quarantineCandidateRows([
  { text: 'For the record, the memo is a paperwork comet.' },
  { text: 'Tell the team the meeting moved to Friday and ask whether the memo should stay in draft.' }
], rawContract);
assert.equal(rows[0].passed, false);
assert.equal(rows[0].catchphraseQuarantine.passed, false);
assert.equal(rows[1].catchphraseQuarantine.passed, true);

console.log('Hush backend prompt detox: PASS');
