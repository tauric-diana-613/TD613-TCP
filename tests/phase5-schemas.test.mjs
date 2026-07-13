import assert from 'node:assert/strict';
import fs from 'node:fs';
const paths = [
  'app/dome-world/schemas/relation-envelope-v01.schema.json',
  'app/dome-world/schemas/relation-confirmation-receipt-v01.schema.json',
  'app/dome-world/schemas/aperture-relation-audit-v01.schema.json',
  'app/dome-world/schemas/phason-relation-event-v01.schema.json',
  'app/dome-world/schemas/phason-relation-chain-v01.schema.json',
  'app/dome-world/schemas/relation-replay-receipt-v01.schema.json',
  'app/dome-world/schemas/phase5-relation-runtime-v01.json'
];
for (const path of paths) {
  const parsed = JSON.parse(fs.readFileSync(path, 'utf8'));
  assert.ok(parsed.schema || parsed.$schema, `${path} must declare a schema`);
}
const envelope = JSON.parse(fs.readFileSync(paths[0], 'utf8'));
assert.equal(envelope.$id, 'td613.relation-envelope/v0.1');
for (const field of ['automatic_ash_action','prediction_authorized','open_field_promotion','relation_is_identity','relation_is_causation','relation_is_permission','marrowline_confirmation_authority']) assert.equal(envelope.properties[field].const, false);
const forbidden = envelope.not.anyOf.flatMap(entry => entry.required || []);
for (const field of ['artifact_digest','raw_bytes','identity_proof','causation_proof','permission_proof']) assert.ok(forbidden.includes(field));
const release = JSON.parse(fs.readFileSync(paths.at(-1), 'utf8'));
assert.equal(release.invariants.new_serverless_function, false);
assert.equal(release.invariants.operator_confirmation_required, true);
assert.equal(release.baseline.phase_4_1, 'PHASE_4_ACTIVE');
assert.equal(release.status, 'IMPLEMENTED_VALIDATION_GATED');
assert.equal(release.production_status, 'PRODUCTION_GATED');
assert.equal(release.baseline.phase_5, 'IMPLEMENTED_VALIDATION_GATED');
console.log('phase5-schemas.test.mjs passed');
