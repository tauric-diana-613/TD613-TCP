import assert from 'node:assert/strict';
import { HUSH_PHASE10_NON_CLAIMS } from '../app/data/hush-phase10-release-statuses.js';
import { buildPhase10FixturePacket } from '../app/engine/hush-phase10-release-discipline.js';

const clean = buildPhase10FixturePacket();
for (const claim of HUSH_PHASE10_NON_CLAIMS) assert.ok(clean.non_claims.includes(claim));
assert.notEqual(clean.release_status, 'blocked');

const missing = buildPhase10FixturePacket({ non_claims: [] });
assert.equal(missing.release_status, 'blocked');
assert.ok(missing.hard_blockers.includes('non-claims missing'));

const providerAddsClaim = buildPhase10FixturePacket({
  provider_contract_validation: { pass: false, mode: 'fixture-backed', preserved_propositions: ['FILE-72'], dropped_propositions: [], new_claims: ['proves the whole story'], risk_flags: ['new claim'], drift_classified: true }
});
assert.equal(providerAddsClaim.release_status, 'blocked');
assert.ok(providerAddsClaim.hard_blockers.includes('new factual claim added'));

console.log('hush-phase10-nonclaims-release-policy: ok');
