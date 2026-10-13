import assert from 'node:assert/strict';
import fs from 'node:fs';
import { computeRelationDigest, findForbiddenRelationFields } from '../app/engine/phase5-relation-envelope.js';

const envelope = JSON.parse(fs.readFileSync('app/dome-world/fixtures/phase5-relation-envelope.json', 'utf8'));
const threats = JSON.parse(fs.readFileSync('app/dome-world/fixtures/phase5-relation-threats.json', 'utf8'));

assert.equal(envelope.schema, 'td613.relation-envelope/v0.1');
assert.equal(await computeRelationDigest(envelope), envelope.relation_digest);
assert.deepEqual(findForbiddenRelationFields(envelope), []);
assert.equal(envelope.assurance_class, 'R0_RECEIPT_REFERENCES_ONLY');
assert.equal(envelope.ash_reference, null);
assert.equal(envelope.hmac, null);
assert.equal(envelope.visibility.server_persistence, false);
assert.equal(envelope.open_field_promotion, false);
assert.equal(JSON.stringify(envelope).includes('artifact_digest'), false);

const expected = new Set(threats.fixtures.map(fixture => fixture.expected));
for (const outcome of [
  'REJECT_ARTIFACT_DISCLOSURE', 'REJECT_AUTHORITY_OR_IDENTITY_CLAIM',
  'HOLD_NONCE_REUSE', 'HOLD_REFERENCE_MISMATCH',
  'RELATION_REPLAY_HELD_KEY_UNAVAILABLE', 'RELATION_REPLAY_HELD_PHASON_FORK',
  'HOLD_CARRIER_MUTATION', 'RELATION_ADMISSIBLE_WITH_WARNINGS'
]) assert.ok(expected.has(outcome), `missing threat fixture for ${outcome}`);
assert.equal(threats.fixtures.find(item => item.id === 'open-field-proximity').open_field_promotion, false);

console.log('phase5-fixtures.test.mjs passed');
