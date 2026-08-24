import assert from 'node:assert/strict';

import {
  BOUNDED_FUTURE_CONE_JOIN_SCHEMA,
  runBoundedFutureConeJoinAudition,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-bounded-future-cone-join.js';

const result = runBoundedFutureConeJoinAudition();

assert.equal(result.schema, BOUNDED_FUTURE_CONE_JOIN_SCHEMA);
assert.equal(result.passed, true, 'The preregistered bounded future-cone join audition must pass before classification.');
assert.equal(result.status, 'BOUNDED_FUTURE_CONE_JOIN_AUDITION_CLOSED');
assert.equal(result.horizon, 4);
assert.equal(result.fork_count, 15);

for (const fork of result.forks) {
  assert.equal(fork.passed, true, `${fork.source_node_id} future-cone audit must pass.`);
  assert.equal(fork.cone.representative_independent, true);
  assert.equal(fork.cone.strict_mass_increase, true);
  assert.deepEqual(fork.cone.edge_failures, []);
  assert.equal(fork.reachability.passed, true);
  assert.deepEqual(fork.reachability.reflexivity_failures, []);
  assert.deepEqual(fork.reachability.antisymmetry_failures, []);
  assert.deepEqual(fork.reachability.transitivity_failures, []);
  assert.equal(fork.upper_bound_audit.existence_matches_parent, true);
  assert.equal(fork.upper_bound_audit.membership_matches_parent, true);

  for (const edge of fork.cone.edges) {
    assert.ok(edge.delta_mass > 0, `${fork.source_node_id} ${edge.edge_id} must remain strictly forward in endpoint mass.`);
    assert.equal(edge.strictly_increases_mass, true);
    assert.equal(edge.representative_independent, true);
  }

  const audit = fork.upper_bound_audit;
  if (audit.classification === 'UNIQUE_LEAST_COMMON_FUTURE_WITHIN_H4_CONE') {
    assert.equal(audit.upper_bound_count > 0, true);
    assert.equal(audit.minimal_upper_bound_count, 1);
    assert.equal(audit.least_upper_bound_count, 1);
    assert.ok(audit.unique_least_upper_bound);
    assert.equal(audit.provenance_survives_at_least_target, true);
    assert.ok(audit.least_provenance_hits.length > 0);
    const witness = audit.least_provenance_hits[0];
    assert.equal(witness.routes_distinct, true);
    assert.equal(witness.endpoint_mass_equal, true);
    assert.notDeepEqual(witness.left_total_route, witness.right_total_route);
    assert.equal(witness.left_total_route[0], 'T');
    assert.equal(witness.right_total_route[0], 'Q');
  } else if (audit.classification === 'NO_COMMON_UPPER_BOUND_WITHIN_H4_CONE') {
    assert.equal(audit.upper_bound_count, 0);
    assert.equal(audit.minimal_upper_bound_count, 0);
    assert.equal(audit.least_upper_bound_count, 0);
    assert.equal(audit.unique_least_upper_bound, null);
    assert.equal(fork.parent_common_future_hit_count, 0);
  } else {
    assert.fail(`Unexpected bounded join classification at ${fork.source_node_id}: ${audit.classification}`);
  }
}

assert.equal(result.census.unique_least_common_future_count, 11);
assert.equal(result.census.no_common_upper_bound_within_H4_count, 4);
assert.equal(result.census.multiple_minimal_without_least_count, 0);
assert.equal(result.census.common_future_without_least_count, 0);
assert.equal(result.partial_join_domain.length, 11);
assert.equal(result.bounded_unresolved_forks.length, 4);

for (const join of result.partial_join_domain) {
  assert.ok(join.join_key);
  assert.ok(join.join_state);
  assert.ok(join.provenance_witness);
  assert.equal(join.provenance_witness.routes_distinct, true);
}

for (const unresolved of result.bounded_unresolved_forks) {
  assert.equal(unresolved.classification, 'NO_COMMON_UPPER_BOUND_WITHIN_H4_CONE');
}

assert.equal(
  result.minimum_cost_hostile.anti_equivalence,
  'MINIMUM_JOIN_COST_IS_NOT_LEAST_UPPER_BOUND_BY_DEFINITION',
);
assert.equal(result.minimum_cost_hostile.all_unique_least_targets_are_parent_minimum_cost_targets, true);
assert.equal(result.minimum_cost_hostile.least_minimum_cost_coincidence_count, 11);

assert.equal(result.parent_custody_unchanged, true);
assert.equal(result.parent_custody_classification, 'PARENT_719_720_CUSTODY_UNCHANGED');
assert.equal(
  result.canonical_classification,
  'FINITE_H4_PARTIAL_SIBLING_JOIN_STRUCTURE_WITH_ELEVEN_UNIQUE_LEAST_COMMON_FUTURES_AND_FOUR_BOUNDED_UNRESOLVED_FORKS',
);
assert.match(result.bounded_claim, /^IN_EACH_AUTHORED_H4_SIBLING_FUTURE_CONE_/);

assert.ok(result.anti_equivalences.includes('MINIMUM_COST_COMMON_FUTURE_IS_NOT_LEAST_COMMON_FUTURE_BY_DEFINITION'));
assert.ok(result.anti_equivalences.includes('MINIMAL_COMMON_FUTURE_IS_NOT_LEAST_COMMON_FUTURE'));
assert.ok(result.anti_equivalences.includes('PARTIAL_SIBLING_JOIN_IS_NOT_JOIN_SEMILATTICE'));
assert.ok(result.anti_equivalences.includes('NO_COMMON_UPPER_BOUND_WITHIN_H4_IS_NOT_NO_COMMON_UPPER_BOUND_AT_ANY_HORIZON'));

assert.equal(result.claim_ceiling.ambient_td613_join, false);
assert.equal(result.claim_ceiling.join_semilattice, false);
assert.equal(result.claim_ceiling.lattice, false);
assert.equal(result.claim_ceiling.complete_lattice, false);
assert.equal(result.claim_ceiling.domain_theory, false);
assert.equal(result.claim_ceiling.church_rosser, false);
assert.equal(result.claim_ceiling.global_confluence, false);
assert.equal(result.claim_ceiling.permanent_divergence, false);
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

assert.equal(
  result.stop,
  'HUMAN_𝄐_REQUIRED_BEFORE_ANY_SEMILATTICE_OR_DOMAIN_THEORY_PROMOTION',
);

console.log('Ash A15-R0 Aperture × Pedagogue bounded future-cone join audition tests passed.');
