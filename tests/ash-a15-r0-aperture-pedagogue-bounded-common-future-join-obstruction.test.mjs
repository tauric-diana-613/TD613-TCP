import assert from 'node:assert/strict';

import {
  BOUNDED_COMMON_FUTURE_JOIN_OBSTRUCTION_SCHEMA,
  runBoundedCommonFutureJoinObstructionAssay,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-bounded-common-future-join-obstruction.js';

const result = runBoundedCommonFutureJoinObstructionAssay();

assert.equal(result.schema, BOUNDED_COMMON_FUTURE_JOIN_OBSTRUCTION_SCHEMA);
assert.equal(result.passed, true, 'The preregistered bounded common-future join obstruction assay must pass its process gates.');
assert.equal(result.status, 'BOUNDED_COMMON_FUTURE_JOIN_OBSTRUCTION_ROUND_CLOSED');
assert.equal(result.reconvergent_fork_count, 11);
assert.equal(result.silent_H4_control_count, 4);
assert.equal(result.fork_audits.length, 11);

for (const fork of result.fork_audits) {
  assert.equal(fork.passed, true, `${fork.source_node_id} H4/H5/H6 future-cone audit must pass.`);
  assert.equal(fork.horizons.length, 3);
  assert.deepEqual(fork.horizons.map((row) => row.horizon), [4, 5, 6]);

  for (const row of fork.horizons) {
    assert.equal(row.passed, true, `${fork.source_node_id} H${row.horizon} must be fully audited.`);
    assert.equal(row.common.passed, true);
    assert.ok(row.common.object_count > 0);
    assert.equal(row.common.left_cone.passed, true);
    assert.equal(row.common.right_cone.passed, true);
    assert.equal(row.order.passed, true);
    assert.deepEqual(row.order.reflexivity_failures, []);
    assert.deepEqual(row.order.antisymmetry_failures, []);
    assert.deepEqual(row.order.transitivity_failures, []);
    assert.ok(row.profile.minimal_common_future_count >= 1);
    assert.ok(row.profile.least_common_future_count >= 0);
    assert.ok(row.profile.minimum_join_cost >= 0);
    assert.ok(row.profile.minimum_cost_common_future_count >= 1);
    assert.ok([
      `NO_BOUNDED_LEAST_COMMON_FUTURE_WITHIN_H${row.horizon}`,
      `UNIQUE_BOUNDED_LEAST_COMMON_FUTURE_WITHIN_H${row.horizon}`,
      'MULTIPLE_LEAST_CANDIDATES_INVALIDATE_ANTISYMMETRY_ASSUMPTION',
    ].includes(row.profile.least_classification));
    assert.ok([
      'UNIQUE_MINIMUM_COST_COMMON_FUTURE_IS_NOT_ORDER_THEORETIC_LEAST_UPPER_BOUND',
      'UNIQUE_MINIMUM_COST_COMMON_FUTURE_ALSO_BOUNDED_LEAST',
      'MINIMUM_COST_TARGET_NOT_UNIQUE',
    ].includes(row.profile.cost_hostile_classification));
  }

  assert.equal(fork.profile_tuple.length, 10);
  assert.equal(fork.minimal_frontier_counts.length, 3);
  assert.ok([
    'BOUNDED_LEAST_COMMON_FUTURE_NOT_STABILIZED_THROUGH_H6',
    'NO_BOUNDED_LEAST_COMMON_FUTURE_THROUGH_H6_WITH_STABLE_MINIMAL_COUNT',
    'BOUNDED_LEAST_COMMON_FUTURE_APPEARS_WITHIN_TESTED_HORIZONS',
  ].includes(fork.horizon_classification));
}

for (const control of result.pure_T_spine_controls) {
  assert.equal(control.parent_classification, 'NO_COMMON_FUTURE_FOUND_WITHIN_H4');
  assert.equal(control.retained_as_H4_bounded_control, true);
}

if (result.cross_fork_profile_shared) {
  assert.equal(
    result.cross_fork_classification,
    'RECONVERGENT_FORKS_SHARE_COMMON_BOUNDED_UPPER_BOUND_PROFILE_THROUGH_H6',
  );
} else {
  assert.equal(result.cross_fork_classification, 'RECONVERGENT_FORK_BOUNDED_UPPER_BOUND_PROFILES_DIVERGE');
}

if (result.all_minimum_cost_hostiles_fire) {
  for (const fork of result.fork_audits) {
    for (const row of fork.horizons) {
      assert.equal(
        row.profile.cost_hostile_classification,
        'UNIQUE_MINIMUM_COST_COMMON_FUTURE_IS_NOT_ORDER_THEORETIC_LEAST_UPPER_BOUND',
      );
      assert.equal(row.profile.unique_minimum_cost_is_least, false);
    }
  }
}

assert.equal(result.parent_custody_unchanged, true);
assert.equal(result.parent_custody_classification, 'PARENT_718_719_720_CUSTODY_UNCHANGED');
assert.equal(
  result.canonical_classification,
  'FINITE_H4_H5_H6_COMMON_FUTURE_ORDER_AUDIT_WITH_MINIMUM_COST_LEASTNESS_SEPARATION_AND_BOUNDED_JOIN_OBSTRUCTION',
);
assert.match(result.bounded_claim, /^IN_THE_ELEVEN_AUTHORED_RECONVERGENT_FORKS_/);
assert.ok(result.anti_equivalences.includes('MINIMUM_COST_IS_NOT_ORDER_THEORETIC_LEAST'));
assert.ok(result.anti_equivalences.includes('NO_BOUNDED_LEAST_IS_NOT_NO_AMBIENT_LEAST'));
assert.ok(result.anti_equivalences.includes('HORIZON_STABILITY_IS_NOT_THEOREM_BEYOND_TESTED_HORIZONS'));

assert.equal(result.claim_ceiling.ambient_join, false);
assert.equal(result.claim_ceiling.join_semilattice, false);
assert.equal(result.claim_ceiling.lattice, false);
assert.equal(result.claim_ceiling.church_rosser, false);
assert.equal(result.claim_ceiling.global_confluence, false);
assert.equal(result.claim_ceiling.domain_theory, false);
assert.equal(result.claim_ceiling.inverse_morphisms, false);
assert.equal(result.claim_ceiling.groupoid, false);
assert.equal(result.claim_ceiling.transport_or_connection, false);
assert.equal(result.claim_ceiling.loop_endomorphism, false);
assert.equal(result.claim_ceiling.holonomy, false);
assert.equal(result.claim_ceiling.curvature, false);
assert.equal(result.claim_ceiling.proto_loom, false);
assert.equal(result.claim_ceiling.a16, false);
assert.equal(result.claim_ceiling.merge, false);
assert.equal(result.claim_ceiling.production, false);
assert.equal(result.claim_ceiling.vercel, false);
assert.equal(result.stop, 'HUMAN_𝄐_QUALIFIED_FOR_DIRECTED_FUTURE_CONE_STRATIFICATION_AUDITION');

console.log('Ash A15-R0 Aperture × Pedagogue bounded common-future join obstruction tests passed.');
