import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  CROSS_MODE_GUARANTEE_IDS,
  PORTABLE_AIA_CROSS_MODE_GUARANTEE_VALIDITY_ASSAY_SCHEMA,
  runPortableAiaCrossModeGuaranteeValidityAssay
} from '../scripts/portable-aia-cross-mode-guarantee-validity-assay.mjs';

const report = runPortableAiaCrossModeGuaranteeValidityAssay();
assert.equal(report.schema, PORTABLE_AIA_CROSS_MODE_GUARANTEE_VALIDITY_ASSAY_SCHEMA);
assert.equal(report.status, 'PASS');
assert.equal(report.assay_local_only, true);
assert.equal(report.exact_scientific_parent, '#1073/25040f740c1c0c57a082554398fd6ef6dc048f48');

assert.equal(report.domain.rule_count, 7);
assert.equal(report.domain.route_count, 3);
assert.equal(report.domain.canonical_projection_count, 21);
assert.equal(report.domain.claim_count, 7);
assert.equal(new Set(report.rows.map(row => row.point_id)).size, 21);
assert.deepEqual(CROSS_MODE_GUARANTEE_IDS, [
  'G0_NO_LOOM_RELEASE_AUTHORITY',
  'G1_HUMAN_CLOSURE_REQUIRED',
  'G2_PORTABLE_PAYLOAD_FINITE_CANONICAL_ONLY',
  'G3_RETURN_REMAINS_ADVISORY',
  'B0_LOCAL_POCKET_PRE_INGRESS_POSITION',
  'B1_CHATGPT_COMPANION_POST_INGRESS_POSITION',
  'B2_TD613_HOSTED_CONTEXT_POSITION'
]);

const invariantIds = report.classification.invariant_claim_ids;
const boundaryIds = report.classification.boundary_dependent_claim_ids;
assert.equal(invariantIds.length, 4);
assert.equal(boundaryIds.length, 3);
for (const claimId of invariantIds) {
  assert.equal(report.support[claimId].support_count, 21, `${claimId} must support all 21 projections`);
  assert.deepEqual(Object.values(report.support[claimId].by_route).sort((a,b) => a-b), [7,7,7]);
}

const exactBoundaryRoute = {
  B0_LOCAL_POCKET_PRE_INGRESS_POSITION:'LOCAL_POCKET',
  B1_CHATGPT_COMPANION_POST_INGRESS_POSITION:'CHATGPT_THREAD_COMPANION',
  B2_TD613_HOSTED_CONTEXT_POSITION:'TD613_HOSTED'
};
for (const claimId of boundaryIds) {
  const support = report.support[claimId];
  assert.equal(support.support_count, 7, `${claimId} support must remain 7/21`);
  assert.deepEqual(support.route_modes, [exactBoundaryRoute[claimId]]);
  assert.equal(support.by_route[exactBoundaryRoute[claimId]], 7);
  for (const [routeMode, count] of Object.entries(support.by_route)) {
    if (routeMode !== exactBoundaryRoute[claimId]) assert.equal(count, 0, `${claimId} leaked into ${routeMode}`);
  }
  assert.equal(Object.keys(support.by_rule).length, 7);
  assert.ok(Object.values(support.by_rule).every(count => count === 1));

  const hostile = report.hostile_universalization[claimId];
  assert.equal(hostile.asserted_universally, true);
  assert.equal(hostile.lawful_route, exactBoundaryRoute[claimId]);
  assert.equal(hostile.lawful_true_count, 7);
  assert.equal(hostile.nonmatching_projection_count, 14);
  assert.equal(hostile.false_claim_count, 14);
  assert.equal(hostile.unexpectedly_accepted_false_claim_count, 0);
  assert.equal(hostile.universalization_valid, false);
  assert.equal(hostile.rejected_nonmatching_point_ids.length, 14);
}

assert.equal(report.classification.invariant_core_supports_all_21, true);
assert.equal(report.classification.boundary_claims_support_exactly_one_route_each, true);
assert.equal(report.classification.invariant_core_route_independent, true);
assert.equal(report.classification.boundary_support_rule_independent, true);
assert.equal(report.classification.common_policy_core_is_common_trust_boundary, false);
assert.equal(report.classification.portable_governance_invariance_is_portable_guarantee_text, false);

assert.deepEqual(report.source_ingress_positions.TD613_HOSTED, ['TD613_HOST_CONTEXT']);
assert.deepEqual(report.source_ingress_positions.CHATGPT_THREAD_COMPANION, ['AFTER_UPSTREAM_THREAD_INGRESS']);
assert.deepEqual(report.source_ingress_positions.LOCAL_POCKET, ['BEFORE_OPTIONAL_REMOTE_INGRESS']);

for (const row of report.rows) {
  assert.equal(row.return_status, 'PRESENT_TO_HUMAN');
  assert.equal(row.candidate_trusted, false);
  assert.equal(row.release_authority, false);
  assert.equal(row.human_closure_required, true);
  assert.equal(row.payload_audit.ok, true);
  assert.equal(row.payload_audit.finite_canonical_vocabulary, true);
  assert.equal(row.payload_audit.digest_token_present, false);
  assert.equal(row.payload_audit.route_mode_present, false);
  assert.equal(row.payload_audit.presentation_host_present, false);
}

for (const key of [
  'product_source_mutated',
  'new_route_added',
  'new_production_receiver_added',
  'universal_privacy_claimed',
  'production_behavior_claimed',
  'counts_as_exogenous_witness'
]) assert.equal(report[key], false, `${key} must remain false`);
assert.equal(report.golden_egg_credit, 0);
assert.equal(report.authority.release_authority, false);
assert.equal(report.authority.provider_call_performed, false);
assert.equal(report.authority.production_mutation, false);
assert.equal(report.authority.deployment_authority, false);
assert.equal(report.authority.human_closure_required, true);
assert.equal(report.claim_ceiling, 'exact-current-seven-claim-by-21-projection-cross-mode-support-matrix-only');

const assaySource = fs.readFileSync('scripts/portable-aia-cross-mode-guarantee-validity-assay.mjs', 'utf8');
const prereg = fs.readFileSync('docs/pedagogue/experiments/PORTABLE_AIA_CROSS_MODE_GUARANTEE_VALIDITY_V0_1_PREREGISTRATION_20260907.md', 'utf8');
const portableSource = fs.readFileSync('app/dome-world/portable-aia-three-route-invariance.js', 'utf8');
assert.match(prereg, /PORTABLE_GOVERNANCE_INVARIANCE != PORTABLE_GUARANTEE_TEXT/);
assert.match(prereg, /COMMON_POLICY_CORE != COMMON_TRUST_BOUNDARY/);
assert.match(prereg, /MORE_SENTENCES != NEW_GUARANTEE_CLASS/);
assert.match(prereg, /NO 𝄐 YET/);
assert.match(assaySource, /unexpectedly_accepted_false_claim_count/);
assert.match(assaySource, /counts_as_exogenous_witness:false/);
assert.match(portableSource, /BEFORE_OPTIONAL_REMOTE_INGRESS/);
assert.match(portableSource, /AFTER_UPSTREAM_THREAD_INGRESS/);
assert.match(portableSource, /TD613_HOST_CONTEXT/);
assert.doesNotMatch(portableSource, /G0_NO_LOOM_RELEASE_AUTHORITY|B0_LOCAL_POCKET_PRE_INGRESS_POSITION/);
assert.doesNotMatch(assaySource, /PORTABLE_AIA_ATLAS_RECEIVERS\.push|NEW_PRODUCTION_RECEIVER/);

console.log('Portable AIA cross-mode guarantee validity hostile contract: PASS');
