import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  buildAuthorshipMaturityEvidence,
  GEN3_MATURITY_ENGINE_VERSION,
  GEN3_STABILITY_RECEIPT_VERSION,
  GEN3_WINDOW_POLICY_VERSION
} from '../app/safe-harbor/app/safe-harbor-gen3-maturity-engine.js';

function readJson(relative) {
  return JSON.parse(readFileSync(new URL(relative, import.meta.url), 'utf8'));
}

function sortedKeys(value) {
  return Object.keys(value || {}).sort();
}

function lane(prefix) {
  return Array.from({ length: 30 }, (_, index) => (
    `However ${prefix} sentence ${index + 1} carries evidence through a bounded route, and the record returns with qualification, contrast, uncertainty, and closure.`
  )).join(' ');
}

const maturitySchema = readJson('../app/safe-harbor/schemas/td613-safe-harbor.authorship-maturity-evidence.v1.schema.json');
const evidenceSchema = readJson('../app/safe-harbor/schemas/td613-safe-harbor.authorship-evidence.v1.schema.json');
const evidence = await buildAuthorshipMaturityEvidence({
  future_self: lane('future'),
  past_self: lane('past'),
  higher_self: lane('higher')
});

assert.equal(maturitySchema.$schema, 'https://json-schema.org/draft/2020-12/schema');
assert.equal(maturitySchema.$id, 'td613.safe-harbor.authorship-maturity-evidence/v1');
assert.equal(maturitySchema.additionalProperties, false);
assert.equal(maturitySchema.properties.engine_version.const, GEN3_MATURITY_ENGINE_VERSION);
assert.equal(maturitySchema.$defs.windowPolicy.properties.schema_version.const, GEN3_WINDOW_POLICY_VERSION);
assert.equal(maturitySchema.$defs.stabilityReceipt.properties.schema_version.const, GEN3_STABILITY_RECEIPT_VERSION);
assert.deepEqual(maturitySchema.$defs.windowPolicy.properties.checkpoint_targets.const, [120, 240, 360]);
assert.equal(maturitySchema.$defs.windowPolicy.properties.local_target_words.const, 120);
assert.equal(maturitySchema.$defs.windowPolicy.properties.required_local_windows_per_lane.const, 3);
assert.equal(maturitySchema.$defs.windowPolicy.properties.non_overlapping_local_windows.const, true);
assert.equal(maturitySchema.properties.prompt_conditioned_features.properties.prompt_text_exported.const, false);
assert.equal(maturitySchema.$defs.stabilityReceipt.properties.identity_probability.type, 'null');
assert.equal(maturitySchema.$defs.stabilityReceipt.properties.raw_text_included.const, false);
assert.equal(maturitySchema.properties.raw_text_included.const, false);
assert.deepEqual(sortedKeys(evidence), sortedKeys(maturitySchema.properties));
for (const required of maturitySchema.required) assert.ok(Object.prototype.hasOwnProperty.call(evidence, required), `missing maturity field ${required}`);
for (const laneId of ['future_self', 'past_self', 'higher_self']) {
  assert.deepEqual(sortedKeys(evidence.lanes[laneId]), sortedKeys(maturitySchema.$defs.laneEvidence.properties));
}
assert.deepEqual(sortedKeys(evidence.stability_receipt), sortedKeys(maturitySchema.$defs.stabilityReceipt.required.reduce((object, key) => ({ ...object, [key]: true }), {})));

assert.ok(Object.prototype.hasOwnProperty.call(evidenceSchema.properties, 'authorship_maturity'), 'Stage 1 evidence schema must declare the optional Stage 2 maturity surface');
assert.deepEqual(evidenceSchema.properties.authorship_maturity.type, ['object', 'null']);

console.log('safe-harbor-gen3-stage2-schema-contract: ok');
