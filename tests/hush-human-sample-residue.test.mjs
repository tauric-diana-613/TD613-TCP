import assert from 'assert';
import { getHushMask } from '../app/engine/hush-mask-studio.js';
import { buildPhase37ProviderTelemetry } from '../app/engine/hush-generator-provider-phase35.js';
import { HUMAN_SAMPLE_RESIDUE, HUSH_HUMAN_SAMPLE_RESIDUE_VERSION, PROCEDURAL_SAMPLE_IDS } from '../app/engine/hush-human-sample-residue.js';

const humanIds = [
  'plain-witness',
  'busy-admin',
  'group-chat-soft',
  'forum-regular',
  'mutual-aid-coordinator',
  'quirky-orbit',
  'grandma-receipts',
  'night-shift-note',
  'library-ghost',
  'soft-snark',
  'phase22-jagged-record',
  'phase27-register-preserve',
  'phase28-transform-to-chatspeak'
];

function sentenceCount(text = '') {
  return String(text).split(/[.!?]+/).map((part) => part.trim()).filter(Boolean).length;
}

function hasHumanIrregularity(text = '') {
  return /—|\/|\b(?:dont|didnt|yall|bc|imo|ok|pls|unfortunately|honestly|apparently|probably|maybe)\b/i.test(text)
    || sentenceCount(text) >= 3
    || /,\s+(?:so|but|and|assuming|though)\b/i.test(text);
}

for (const id of humanIds) {
  const sample = HUMAN_SAMPLE_RESIDUE[id];
  assert(sample, `missing human-residue sample for ${id}`);
  assert(hasHumanIrregularity(sample), `human sample still too mannequin-clean for ${id}: ${sample}`);

  const mask = getHushMask(id);
  const telemetry = buildPhase37ProviderTelemetry({
    sourceText: 'Can this route carry a normal request without making every mask sound the same?',
    mask,
    candidateCount: 4
  });
  const vector = telemetry.flightPacket.mask_style_vector;
  assert.equal(vector.human_sample_residue_version, HUSH_HUMAN_SAMPLE_RESIDUE_VERSION, `packet did not carry residue version for ${id}`);
  assert(vector.sample_seed_excerpt.includes(sample.slice(0, 24)), `packet sample excerpt did not use residue sample for ${id}`);
  assert(vector.avoid_list.some((item) => /mannequin|symmetrical sample|demo one-liner/i.test(item)), `avoid list lacks synthetic-shape warning for ${id}`);
  assert.equal(telemetry.flightPacket.stylometry_engine.generator_constraints.apply_human_sample_residue, true, `generator constraint did not request residue for ${id}`);
}

for (const id of PROCEDURAL_SAMPLE_IDS) {
  const mask = getHushMask(id);
  const telemetry = buildPhase37ProviderTelemetry({
    sourceText: 'Can this route preserve a record without pretending the procedural shell is a person?',
    mask,
    candidateCount: 4
  });
  const vector = telemetry.flightPacket.mask_style_vector;
  assert.equal(vector.human_sample_residue_version, '', `procedural mask should not carry human residue: ${id}`);
  assert.equal(telemetry.flightPacket.stylometry_engine.generator_constraints.apply_human_sample_residue, false, `procedural mask should not request human residue: ${id}`);
}

const uniqueSamples = new Set(Object.values(HUMAN_SAMPLE_RESIDUE));
assert.equal(uniqueSamples.size, Object.values(HUMAN_SAMPLE_RESIDUE).length, 'human residue samples collapsed into duplicates');

console.log('hush-human-sample-residue tests passed');
