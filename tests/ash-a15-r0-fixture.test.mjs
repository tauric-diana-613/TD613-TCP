import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import './ash-a15-r0-stochastic-criterion-family.test.mjs';
import './ash-a15-r0-partial-identification-contraction.test.mjs';
import './ash-a15-r0-model-misspecification-heldout.test.mjs';
import './ash-a15-r0-predeclared-reserve-recovery.test.mjs';
import './ash-a15-r0-inadequate-reserve-open-set-hold.test.mjs';
import {
  A15_R0_ACTION_SEQUENCE,
  A15_R0_SCHEMAS,
  validateGovernedTaskFixture
} from '../app/dome-world/previews/a15-r0/a15-r0-contracts.js';

const fixturePath = 'app/dome-world/fixtures/a15-r0/governed-task-fixture-v01.json';
const fixtureSource = fs.readFileSync(fixturePath, 'utf8');
const fixture = JSON.parse(fixtureSource);

assert.equal(validateGovernedTaskFixture(fixture), fixture);
assert.equal(fixture.schema, A15_R0_SCHEMAS.fixture);
assert.equal(fixture.source_status, 'SIMULATED');
assert.equal(fixture.namespace.codepoint, 'U+10D613');
assert.equal(fixture.namespace.surrogate_pair, '\\uDBF5\\uDE13');
assert.equal(fixture.namespace.meaning, 'TD613 = Tauric Diana 613');
assert.deepEqual(fixture.allowed_action_sequence, A15_R0_ACTION_SEQUENCE);
assert.equal(fixture.local_source.raw_bytes_local, true);
assert.equal(fixture.local_source.raw_bytes_transport_authorized, false);
assert.equal(fixture.local_source.external_content, false);
assert.equal(fixture.authority.human_review_required, true);
assert.equal(fixture.authority.human_closure_required, true);
for (const [key, value] of Object.entries(fixture.authority)) {
  if (key.startsWith('automatic_')) assert.equal(value, false, `${key} widened fixture authority.`);
}
assert.doesNotMatch(fixtureSource, /\b(?:https?|wss?|ftp):\/\//i);
assert.doesNotMatch(fixtureSource, /-----BEGIN [A-Z ]*PRIVATE KEY-----|bearer\s+[A-Za-z0-9._~+/-]{8,}|api[_ -]?key|access[_ -]?token|password|passphrase/i);

const clone = () => structuredClone(fixture);

for (const mutation of [
  value => { value.source_status = 'OBSERVED'; },
  value => { value.local_source.raw_bytes_transport_authorized = true; },
  value => { value.authority.automatic_release = true; },
  value => { value.allowed_action_sequence = ['ARRIVE', 'RETURN']; },
  value => { value.namespace.codepoint = 'U+10D614'; },
  value => { value.local_source.label = 'person@example.com'; },
  value => { value.local_source.label = 'api_key = abc123'; },
  value => { value.local_source.label = 'https://example.invalid/live'; },
  value => { value.phone = 9045551212; }
]) {
  const changed = clone();
  mutation(changed);
  assert.throws(() => validateGovernedTaskFixture(changed));
}

const cyclic = clone();
cyclic.self = cyclic;
assert.throws(() => validateGovernedTaskFixture(cyclic));

const opaque = clone();
opaque.unknown_context = new Map([['safe', 'synthetic']]);
assert.throws(() => validateGovernedTaskFixture(opaque));

const schemaDir = 'app/dome-world/schemas/a15-r0';
const schemas = fs.readdirSync(schemaDir).filter(name => name.endsWith('.json')).sort();
assert.deepEqual(schemas, [
  'bounded-transformation-envelope-v01.schema.json',
  'governed-task-fixture-v01.schema.json',
  'interaction-owner-record-v01.schema.json',
  'observable-event-v01.schema.json',
  'open-research-field-v02.schema.json',
  'open-research-hypothesis-registry-v01.schema.json',
  'operator-rejection-receipt-v01.schema.json',
  'projection-descriptor-v01.schema.json',
  'projection-run-receipt-v01.schema.json',
  'wedding-identifiability-assay-v01.schema.json'
]);
for (const filename of schemas) {
  const schema = JSON.parse(fs.readFileSync(path.join(schemaDir, filename), 'utf8'));
  assert.equal(schema.$schema, 'https://json-schema.org/draft/2020-12/schema');
  assert.match(schema.$id, /^td613\.ash\.a15-r0\./);
  assert.equal(schema.additionalProperties, false);
}

console.log(JSON.stringify({
  ok: true,
  schema: 'td613.ash.a15-r0.fixture-test/v0.1',
  fixture_deterministic: true,
  fixture_synthetic: true,
  sensitive_context_rejected: true,
  live_external_content_rejected: true,
  schemas: schemas.length,
  raw_transport: false,
  human_closure_required: true
}, null, 2));