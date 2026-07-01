import assert from 'node:assert/strict';
import { HUSH_RELEASE_STATUSES, isKnownHushReleaseStatus } from '../app/data/hush-phase10-release-statuses.js';
import { buildPhase10FixturePacket } from '../app/engine/hush-phase10-release-discipline.js';

const expected = ['draft','local-pass','fixture-provider-pass','runtime-flight-pending','runtime-flight-pass','release-candidate','harbor-eligible','sealed','blocked','revoked'];
assert.deepEqual(HUSH_RELEASE_STATUSES, expected);
for (const status of expected) assert.equal(isKnownHushReleaseStatus(status), true);

const clean = buildPhase10FixturePacket();
assert.notEqual(clean.release_status, 'sealed');
assert.equal(clean.release_status, 'fixture-provider-pass');
assert.equal(clean.schema, 'td613-hush-release-discipline/v1');

const phase8Missing = buildPhase10FixturePacket({
  phase8_mask_validation: { pass: false, fixture_bank_present: false, docs_present: false }
});
assert.equal(phase8Missing.release_status, 'local-pass');
assert.equal(phase8Missing.evidence_ladder_level, 1);

const failedFixtureProvider = buildPhase10FixturePacket({
  provider_contract_validation: {
    pass: false,
    mode: 'fixture-backed',
    preserved_propositions: ['FILE-72'],
    dropped_propositions: ['footer mismatch'],
    new_claims: [],
    risk_flags: [],
    drift_classified: true
  }
});
assert.equal(failedFixtureProvider.release_status, 'blocked');
assert.ok(failedFixtureProvider.hard_blockers.includes('provider validation failed'));

console.log('hush-phase10-release-status-model: ok');
