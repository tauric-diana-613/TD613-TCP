import assert from 'node:assert/strict';

import {
  DIRECTED_BRANCHING_CONFLUENCE_SCHEMA,
  runDirectedBranchingConfluenceAssay,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-directed-branching-confluence.js';

const result = runDirectedBranchingConfluenceAssay();

assert.equal(result.schema, DIRECTED_BRANCHING_CONFLUENCE_SCHEMA);
assert.equal(result.passed, true, 'The preregistered directed branching / confluence assay must pass its process gates.');
assert.equal(result.status, 'DIRECTED_BRANCHING_CONFLUENCE_ROUND_CLOSED');
assert.equal(result.continuation_horizon, 4);
assert.equal(result.continuation_word_count, 31);
assert.equal(result.expected_pair_comparisons_per_fork, 961);
assert.ok(result.forks.length > 0);
assert.equal(result.census.fork_source_count, result.forks.length);

for (const fork of result.forks) {
  assert.equal(fork.passed, true, `${fork.source_node_id} fork must satisfy preregistered process obligations.`);
  assert.equal(fork.left_child.representative_independent, true);
  assert.equal(fork.right_child.representative_independent, true);
  assert.equal(fork.left_cone.passed, true);
  assert.equal(fork.right_cone.passed, true);
  assert.equal(fork.left_cone.word_count, 31);
  assert.equal(fork.right_cone.word_count, 31);
  assert.equal(fork.continuation_pair_comparison_count, 961);
  assert.ok([
    'LOCAL_TQ_QT_SQUARE_COMMUTES',
    'LOCAL_TQ_QT_ORDER_SENSITIVE',
  ].includes(fork.local_square.classification));
  assert.ok([
    'CHILDREN_COMPARABLE_WITHIN_H4',
    'CHILDREN_INCOMPARABLE_WITHIN_H4',
  ].includes(fork.child_comparability.classification));
  assert.ok([
    'STRICT_FORWARD_RECONVERGENCE_WITNESSED_WITHIN_H4',
    'ONE_SIDED_COMPARABILITY_JOIN_WITNESSED_WITHIN_H4',
    'NO_COMMON_FUTURE_FOUND_WITHIN_H4',
  ].includes(fork.confluence_classification));

  for (const hit of fork.common_future_hits) {
    assert.equal(hit.routes_distinct, true, 'A common future must not erase the distinct first branch generator.');
    assert.equal(hit.endpoint_mass_equal, true, 'Complete operational equality requires equal endpoint mass.');
    assert.notDeepEqual(hit.left_total_route, hit.right_total_route);
    assert.equal(hit.left_total_route[0], 'T');
    assert.equal(hit.right_total_route[0], 'Q');
    assert.ok(hit.join_cost >= 0);
  }

  if (fork.strict_reconvergence_hit_count > 0) {
    assert.equal(fork.confluence_classification, 'STRICT_FORWARD_RECONVERGENCE_WITNESSED_WITHIN_H4');
    assert.ok(fork.strict_reconvergence_hits.every((hit) => hit.both_continuations_nonempty));
  }
  if (fork.common_future_hit_count === 0) {
    assert.equal(fork.confluence_classification, 'NO_COMMON_FUTURE_FOUND_WITHIN_H4');
    assert.equal(fork.minimum_join_cost, null);
  }
}

assert.ok(result.root_fork);
assert.equal(result.root_fork.nontrivial_fork, true, 'The canonical root must retain distinct T and Q children.');
assert.ok([
  'ROOT_STRICT_FORWARD_RECONVERGENCE_WITHIN_H4',
  'ROOT_ONE_SIDED_JOIN_WITHIN_H4',
  'ROOT_NO_COMMON_FUTURE_WITHIN_H4',
].includes(result.root_classification));

if (result.root_classification === 'ROOT_STRICT_FORWARD_RECONVERGENCE_WITHIN_H4') {
  assert.ok(result.root_fork.strict_reconvergence_hit_count > 0);
}
if (result.root_classification === 'ROOT_ONE_SIDED_JOIN_WITHIN_H4') {
  assert.equal(result.root_fork.strict_reconvergence_hit_count, 0);
  assert.ok(result.root_fork.common_future_hit_count > 0);
}
if (result.root_classification === 'ROOT_NO_COMMON_FUTURE_WITHIN_H4') {
  assert.equal(result.root_fork.common_future_hit_count, 0);
}

assert.equal(
  result.census.local_commuting_square_count + result.census.local_noncommuting_square_count,
  result.census.fork_source_count,
);
assert.equal(
  result.census.bounded_child_comparable_count + result.census.bounded_child_incomparable_count,
  result.census.fork_source_count,
);
assert.equal(
  result.census.bounded_common_future_fork_count + result.census.no_common_future_within_H4_count,
  result.census.fork_source_count,
);
assert.ok(result.census.strict_reconvergence_fork_count <= result.census.bounded_common_future_fork_count);

assert.equal(result.parent_custody_unchanged, true);
assert.equal(result.parent_custody_classification, 'PARENT_718_719_CUSTODY_UNCHANGED');
assert.match(result.canonical_classification, /^FINITE_H4_DIRECTED_BRANCHING_CONFLUENCE_CENSUS_WITH_ROOT_/);
assert.match(result.bounded_claim, /^IN_THE_AUTHORED_S3_SOURCE_SET_/);
assert.ok(result.anti_equivalences.includes('NO_BOUNDED_JOIN_IS_NOT_NO_FUTURE_JOIN'));
assert.ok(result.anti_equivalences.includes('COMMON_FUTURE_IS_NOT_LOOP'));
assert.ok(result.anti_equivalences.includes('LOCAL_NONCOMMUTATION_IS_NOT_GLOBAL_NONCONFLUENCE'));

assert.equal(result.claim_ceiling.church_rosser, false);
assert.equal(result.claim_ceiling.global_confluence, false);
assert.equal(result.claim_ceiling.permanent_irrecoverable_fork, false);
assert.equal(result.claim_ceiling.lattice_or_semilattice, false);
assert.equal(result.claim_ceiling.least_upper_bound, false);
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
assert.equal(result.stop, 'HUMAN_𝄐_QUALIFIED_FOR_BOUNDED_FUTURE_CONE_AND_JOIN_STRUCTURE_AUDITION');

console.log('Ash A15-R0 Aperture × Pedagogue directed branching / confluence tests passed.');
