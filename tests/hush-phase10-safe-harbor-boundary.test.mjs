import assert from 'node:assert/strict';
import { buildPhase10FixturePacket } from '../app/engine/hush-phase10-release-discipline.js';

const eligibleButFixture = buildPhase10FixturePacket({
  safe_harbor_boundary: { assessed: true, eligible: true, receipt_treated_as_proof: false }
});
assert.notEqual(eligibleButFixture.release_status, 'sealed');
assert.notEqual(eligibleButFixture.release_status, 'release-candidate');
assert.equal(eligibleButFixture.release_status, 'fixture-provider-pass');

const receiptAsProof = buildPhase10FixturePacket({
  safe_harbor_boundary: { assessed: true, eligible: true, receipt_treated_as_proof: true }
});
assert.equal(receiptAsProof.release_status, 'blocked');
assert.ok(receiptAsProof.hard_blockers.includes('Safe Harbor receipt treated as proof'));

const apertureAsAuthority = buildPhase10FixturePacket({
  aperture_boundary: { checked: true, release_authority: true, validator_bypass: false }
});
assert.equal(apertureAsAuthority.release_status, 'blocked');
assert.ok(apertureAsAuthority.hard_blockers.includes('Aperture treated as release authority'));

console.log('hush-phase10-safe-harbor-boundary: ok');
