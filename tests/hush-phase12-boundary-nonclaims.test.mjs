import assert from 'node:assert/strict';
import { HUSH_PHASE10_NON_CLAIMS } from '../app/data/hush-phase10-release-statuses.js';
import { buildPhase10FixturePacket } from '../app/engine/hush-phase10-release-discipline.js';
import { buildHushPhase11DashboardState, summarizeHushPhase11DashboardState } from '../app/engine/hush-phase11-dashboard-state.js';
import { evaluateHushPhase11Action } from '../app/engine/hush-phase11-action-gates.js';

const clean = buildHushPhase11DashboardState({ phase10_packet: buildPhase10FixturePacket() });
const summary = summarizeHushPhase11DashboardState(clean);
for (const claim of HUSH_PHASE10_NON_CLAIMS) assert.ok(summary.non_claims.includes(claim));
assert.equal(clean.boundary_posture.safe_harbor.status, 'assessed-not-eligible');
assert.equal(clean.boundary_posture.aperture.status, 'checked');

const safeHarborAsProof = buildHushPhase11DashboardState({
  phase10_packet: buildPhase10FixturePacket({
    safe_harbor_boundary: { assessed: true, eligible: true, receipt_treated_as_proof: true }
  })
});
assert.equal(safeHarborAsProof.release_discipline.release_status, 'blocked');
assert.ok(safeHarborAsProof.hard_blockers.includes('Safe Harbor receipt treated as proof'));
assert.equal(evaluateHushPhase11Action('mark-sealed', safeHarborAsProof).allowed, false);

const apertureAsAuthority = buildHushPhase11DashboardState({
  phase10_packet: buildPhase10FixturePacket({
    aperture_boundary: { checked: true, release_authority: true, validator_bypass: false }
  })
});
assert.equal(apertureAsAuthority.release_discipline.release_status, 'blocked');
assert.ok(apertureAsAuthority.hard_blockers.includes('Aperture treated as release authority'));

const validatorBypass = buildHushPhase11DashboardState({
  phase10_packet: buildPhase10FixturePacket({
    aperture_boundary: { checked: true, release_authority: false, validator_bypass: true }
  })
});
assert.equal(validatorBypass.release_discipline.release_status, 'blocked');
assert.ok(validatorBypass.hard_blockers.includes('validator bypass implied'));

const missingNonClaims = buildHushPhase11DashboardState({
  phase10_packet: buildPhase10FixturePacket({ non_claims: ['authorship proof'] })
});
assert.equal(missingNonClaims.release_discipline.release_status, 'blocked');
assert.ok(missingNonClaims.hard_blockers.includes('non-claims missing'));
assert.equal(evaluateHushPhase11Action('export-redacted', missingNonClaims).allowed, false);

console.log('hush-phase12-boundary-nonclaims: ok');
