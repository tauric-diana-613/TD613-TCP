import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  CLAIM_CEILING_OBSERVATORY_SCHEMA,
  CLAIM_CEILING_REGISTRY,
  CLAIM_CEILING_STATES,
  auditClaimCeilingRegistry,
  claimCeilingSummary
} from '../app/engine/dollhouse-claim-ceilings.js';

assert.equal(CLAIM_CEILING_OBSERVATORY_SCHEMA, 'td613.dollhouse.claim-ceiling-observatory/v0.1');
assert.equal(CLAIM_CEILING_REGISTRY.length, 8);
assert.equal(new Set(CLAIM_CEILING_REGISTRY.map(item => item.id)).size, CLAIM_CEILING_REGISTRY.length);

const byId = new Map(CLAIM_CEILING_REGISTRY.map(item => [item.id, item]));

assert.equal(byId.get('physical-device-behavior').state, CLAIM_CEILING_STATES.EARNED_BOUNDED);
assert.match(byId.get('physical-device-behavior').earned_coordinate, /Physical-iPhone production behavior has been observed/i);
assert.match(byId.get('physical-device-behavior').current_ceiling, /exact-current-build/i);

assert.equal(byId.get('authenticated-foreign-ancestry').state, CLAIM_CEILING_STATES.SPLIT);
assert.match(byId.get('authenticated-foreign-ancestry').earned_coordinate, /TD613-controlled cross-instance stage ancestry/i);
assert.match(byId.get('authenticated-foreign-ancestry').current_ceiling, /not the foreign provider as origin/i);

assert.equal(byId.get('provider-internal-enforcement').state, CLAIM_CEILING_STATES.SPLIT);
assert.match(byId.get('provider-internal-enforcement').current_ceiling, /Provider-internal enforcement remains unobserved/i);

assert.equal(byId.get('universal-provider-behavior').state, CLAIM_CEILING_STATES.SPLIT);
assert.match(byId.get('universal-provider-behavior').current_ceiling, /Finite provider\/model observations do not establish universal behavior/i);

assert.equal(byId.get('human-comprehension').state, CLAIM_CEILING_STATES.SPLIT);
assert.match(byId.get('human-comprehension').current_ceiling, /do not by themselves measure comprehension/i);

for (const id of ['hidden-retention-training-memory', 'empirical-exteriority', 'golden-egg-realization']) {
  assert.equal(byId.get(id).state, CLAIM_CEILING_STATES.HELD, `${id} must remain HELD`);
}
assert.match(byId.get('empirical-exteriority').current_ceiling, /Western Horizon empirical-shore rest remains in force/i);
assert.match(byId.get('golden-egg-realization').current_ceiling, /No immutable same-episode record currently establishes/i);

const summary = claimCeilingSummary();
assert.deepEqual(summary.earned_bounded, ['physical-device-behavior']);
assert.deepEqual(summary.held, [
  'hidden-retention-training-memory',
  'empirical-exteriority',
  'golden-egg-realization'
]);
assert.equal(summary.split.length, 4);

const audit = auditClaimCeilingRegistry();
assert.equal(audit.role_agreement_is_evidence_multiplication, false);
assert.equal(audit.release_authority, false);
assert.equal(audit.entries.length, CLAIM_CEILING_REGISTRY.length);
for (const entry of audit.entries) {
  assert.deepEqual(entry.findings.map(finding => finding.role), ['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT']);
  assert.equal(new Set(entry.findings.map(finding => finding.role)).size, 4);
}

const page = fs.readFileSync('app/dome-world/claim-ceilings.html', 'utf8');
for (const needle of [
  'Claim Ceiling Observatory',
  'Raise the ceiling.',
  'TD613 CUSTODY ANCESTRY ≠ FOREIGN ORIGIN',
  'HISTORICAL DEVICE WITNESS ≠ CURRENT-BUILD DEVICE CLOSURE',
  'DOLLHOUSE ROLE AGREEMENT ≠ EVIDENCE MULTIPLICATION',
  '/engine/dollhouse-claim-ceilings.js'
]) {
  assert.ok(page.includes(needle), `claim ceiling page missing ${needle}`);
}

console.log('Dollhouse claim ceiling observatory contracts passed');
