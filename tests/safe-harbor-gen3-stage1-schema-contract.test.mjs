import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  AUTHORSHIP_EVIDENCE_SCHEMA,
  buildAuthorshipEvidenceContract,
  ENTRANT_BINDING_SCHEMA,
  HISTORICAL_EXAMPLE
} from '../app/safe-harbor/app/safe-harbor-gen3-evidence-contract.js';
import {
  buildGen3ReportContract,
  GEN3_REPORT_SCHEMA,
  GEN3_REPORT_SECTION_ORDER
} from '../app/safe-harbor/app/safe-harbor-gen3-report-contract.js';

function readSchema(relativePath) {
  return JSON.parse(readFileSync(new URL(relativePath, import.meta.url), 'utf8'));
}

function sortedKeys(value) {
  return Object.keys(value || {}).sort();
}

const evidenceSchema = readSchema('../app/safe-harbor/schemas/td613-safe-harbor.authorship-evidence.v1.schema.json');
const bindingSchema = readSchema('../app/safe-harbor/schemas/td613-safe-harbor.entrant-authorship-binding.v1.schema.json');
const reportSchema = readSchema('../app/safe-harbor/schemas/td613-safe-harbor.forensic-authorship-report.v1.schema.json');

assert.equal(evidenceSchema.$schema, 'https://json-schema.org/draft/2020-12/schema');
assert.equal(evidenceSchema.$id, AUTHORSHIP_EVIDENCE_SCHEMA);
assert.equal(evidenceSchema.additionalProperties, false);
assert.equal(evidenceSchema.$defs.evidenceContract.properties.historical_example.const, HISTORICAL_EXAMPLE);
assert.deepEqual(evidenceSchema.$defs.samplingSufficiency.properties.checkpoint_targets.const, [120, 240, 360]);
assert.equal(evidenceSchema.$defs.elicitationContext.properties.keystroke_telemetry_collected.const, false);
assert.equal(evidenceSchema.$defs.elicitationContext.properties.pause_timing_collected.const, false);
assert.equal(evidenceSchema.$defs.stabilityReceipt.properties.identity_probability.type, 'null');

assert.equal(bindingSchema.$schema, 'https://json-schema.org/draft/2020-12/schema');
assert.equal(bindingSchema.$id, ENTRANT_BINDING_SCHEMA);
assert.equal(bindingSchema.additionalProperties, false);
assert.equal(bindingSchema.properties.namespace_anchor.properties.claimed_pua.const, 'U+10D613');
assert.equal(bindingSchema.properties.namespace_anchor.properties.utf16_surrogate_pair.const, '\\uDBF5\\uDE13');
assert.equal(bindingSchema.properties.entrant_credential.properties.shi_number.pattern, '^TD613-SH-9B07D8B-[0-9A-F]{8}$');
assert.deepEqual(bindingSchema.properties.countersignature.properties.signed_scope.const, [
  'shi_number',
  'packet_hash_sha256',
  'stylometric_fingerprint',
  'stability_digest',
  'blind_challenge_precommitment_digest',
  'blind_challenge_result_digest',
  'restoration_receipt_digest',
  'authorship_and_custody_assertion'
]);

assert.equal(reportSchema.$schema, 'https://json-schema.org/draft/2020-12/schema');
assert.equal(reportSchema.$id, GEN3_REPORT_SCHEMA);
assert.equal(reportSchema.additionalProperties, false);
assert.deepEqual(reportSchema.properties.section_order.const, GEN3_REPORT_SECTION_ORDER);
assert.equal(reportSchema.properties.interpretation_provenance.properties.raw_text_consumed.const, false);
assert.equal(reportSchema.properties.interpretation_provenance.properties.external_identity_data_consumed.const, false);
assert.equal(reportSchema.properties.interpretation_provenance.properties.claim_ceiling_enforced.const, true);

const evidence = buildAuthorshipEvidenceContract({}, {
  segments: {
    future_self: 'future',
    past_self: 'past',
    higher_self: 'higher'
  }
});
assert.deepEqual(sortedKeys(evidence), sortedKeys(evidenceSchema.properties));
for (const required of evidenceSchema.required) assert.ok(Object.prototype.hasOwnProperty.call(evidence, required), `missing evidence schema field ${required}`);

const report = buildGen3ReportContract({
  schema_version: 'td613.safe-harbor.packet/v1',
  packet_hash_sha256: 'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
  authorship_evidence: evidence,
  temporal_lineage: {
    badge_protocol_history: { historical_example: HISTORICAL_EXAMPLE }
  },
  gen3_evidence_contract: {
    shi_exact_match: { status: 'pass' }
  }
});
assert.deepEqual(sortedKeys(report), sortedKeys(reportSchema.properties));
for (const required of reportSchema.required) assert.ok(Object.prototype.hasOwnProperty.call(report, required), `missing report schema field ${required}`);
for (const sectionId of GEN3_REPORT_SECTION_ORDER) {
  assert.ok(report.sections[sectionId], `missing report section ${sectionId}`);
  assert.deepEqual(sortedKeys(report.sections[sectionId]), sortedKeys(reportSchema.$defs.reportSection.properties));
}

console.log('safe-harbor-gen3-stage1-schema-contract: ok');
