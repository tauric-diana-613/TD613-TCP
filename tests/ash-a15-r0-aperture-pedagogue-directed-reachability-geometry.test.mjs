import assert from 'node:assert/strict';

import {
  DIRECTED_REACHABILITY_GEOMETRY_SCHEMA,
  runDirectedReachabilityGeometryAssay,
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-directed-reachability-geometry.js';

const result = runDirectedReachabilityGeometryAssay();

assert.equal(result.schema, DIRECTED_REACHABILITY_GEOMETRY_SCHEMA);
assert.equal(result.passed, true, 'The preregistered directed reachability geometry assay must pass before classification.');
assert.equal(result.status, 'DIRECTED_REACHABILITY_GEOMETRY_ROUND_CLOSED');
assert.match(result.canonical_classification, /^FINITE_S3_DIRECTED_REACHABILITY_PARTIAL_ORDER_/);
assert.ok(result.object_count > 1);
assert.ok(result.arrow_count >= result.object_count);
assert.ok(result.generator_edge_count > 0);

assert.equal(result.reachability.passed, true);
assert.equal(result.reachability.relation_classification, 'FINITE_S3_REACHABILITY_IS_A_PARTIAL_ORDER');
assert.deepEqual(result.reachability.reflexivity.failures, []);
assert.deepEqual(result.reachability.antisymmetry.failures, []);
assert.deepEqual(result.reachability.transitivity.failures, []);
assert.equal(result.reachability.reflexivity.checks.length, result.object_count);
assert.equal(result.reachability.antisymmetry.checks.length, result.object_count ** 2);
assert.ok(result.reachability.transitivity.checks.length > 0);
for (const row of result.reachability.reflexivity.checks) assert.equal(row.reachable_to_self, true);
for (const row of result.reachability.antisymmetry.checks) assert.equal(row.passed, true);
for (const row of result.reachability.transitivity.checks) assert.equal(row.a_reaches_c, true);

assert.ok(result.path_multiplicity.maximum_endpoint_pair_multiplicity >= 1);
if (result.path_multiplicity.thin) {
  assert.equal(result.path_multiplicity.multiple_endpoint_pair_count, 0);
  assert.equal(result.path_multiplicity.classification, 'FINITE_S3_PATH_CATEGORY_IS_THIN_ON_AUDITED_SLICE');
} else {
  assert.ok(result.path_multiplicity.multiple_endpoint_pair_count > 0);
  assert.ok(result.path_multiplicity.maximum_endpoint_pair_multiplicity > 1);
  assert.equal(
    result.path_multiplicity.classification,
    'FINITE_S3_PATH_CATEGORY_IS_NONTHIN_AND_REACHABILITY_FORGETS_ROUTE_MULTIPLICITY',
  );
}

assert.equal(result.height.passed, true);
assert.equal(result.height.strict_monotone_height, true);
assert.deepEqual(result.height.edge_audit.strict_failures, []);
assert.equal(result.height.node_heights.find((row) => row.node_id === result.height.root_node_id)?.height, 0);
for (const edge of result.height.edge_audit.rows) {
  assert.ok(edge.delta_height > 0, `${edge.edge_id} must strictly raise the authored endpoint-mass height.`);
  assert.equal(edge.strictly_positive, true);
}
if (result.height.unit_graded) {
  assert.equal(result.height.every_generator_edge_unit_increment, true);
  assert.equal(result.height.every_arrow_length_equals_height_difference, true);
  assert.deepEqual(result.height.edge_audit.unit_failures, []);
  assert.deepEqual(result.height.arrow_audit.grade_failures, []);
  assert.equal(result.height.classification, 'FINITE_S3_UNIT_GRADED_BY_ENDPOINT_MASS_DIFFERENCE');
} else {
  assert.equal(result.height.classification, 'STRICT_MONOTONE_HEIGHT_ON_S3_WITHOUT_UNIT_GRADING_PROMOTION');
}

assert.equal(result.same_height_antichain.passed, true);
for (const row of result.same_height_antichain.rows) {
  assert.equal(row.incomparable, true);
  assert.equal(row.a_reaches_b, false);
  assert.equal(row.b_reaches_a, false);
}
if (result.same_height_antichain.witness) {
  assert.equal(
    result.same_height_antichain.classification,
    'SAME_HEIGHT_DISTINCT_OBJECTS_FORM_A_DIRECTED_ANTICHAIN_WITNESS',
  );
}

assert.equal(result.directed_distance.passed, true);
assert.equal(result.directed_distance.classification, 'FINITE_S3_EXTENDED_DIRECTED_SHORTEST_PATH_QUASIMETRIC');
assert.deepEqual(result.directed_distance.zero_law.failures, []);
assert.deepEqual(result.directed_distance.finite_distance_audit.failures, []);
assert.deepEqual(result.directed_distance.triangle_inequality.failures, []);
assert.ok(result.directed_distance.triangle_inequality.checks.length > 0);
assert.ok(result.directed_distance.asymmetry_witness);
assert.equal(result.directed_distance.asymmetry_classification, 'DIRECTED_DISTANCE_ASYMMETRY_WITNESSED');
assert.equal(result.directed_distance.asymmetry_witness.d_ba, 'INFINITY');
assert.ok(Number.isInteger(result.directed_distance.asymmetry_witness.d_ab));
assert.ok(result.directed_distance.asymmetry_witness.d_ab > 0);

if (result.path_multiplicity.thin) {
  assert.equal(
    result.distance_information_loss.classification,
    'PATH_CATEGORY_THIN_DISTANCE_ROUTE_COLLAPSE_HOSTILE_NOT_INSTANTIATED',
  );
} else {
  assert.ok(result.distance_information_loss.rows.length > 0);
  assert.ok([
    'DIRECTED_DISTANCE_FORGETS_ROUTE_IDENTITY',
    'DIRECTED_DISTANCE_RETAINS_ONLY_MINIMUM_LENGTH_NOT_PATH_SET',
    'REACHABILITY_FORGETS_ROUTE_MULTIPLICITY_WITHOUT_DISTANCE_LENGTH_DIVERGENCE',
  ].includes(result.distance_information_loss.classification));
}

assert.equal(result.root_profile.passed, true);
assert.equal(result.root_profile.reachable_object_count + result.root_profile.unreachable_object_count, result.object_count);
assert.equal(result.root_profile.unreachable_object_count, 0, 'Every S3 node was constructed from the canonical root and should remain root-reachable.');
assert.ok(result.root_profile.height_histogram.length > 0);
if (result.height.unit_graded) {
  assert.equal(result.root_profile.unit_grade_root_distance_compatibility, true);
  for (const row of result.root_profile.rows) assert.equal(row.distance_equals_height, true);
}

assert.equal(result.parent_custody_unchanged, true);
assert.equal(result.parent_custody_classification, 'PARENT_717_718_CUSTODY_UNCHANGED');
assert.match(result.bounded_claim, /^IN_THE_AUTHORED_FINITE_S3_SLICE_/);
assert.ok(result.anti_equivalences.includes('PATH_IDENTITY_IS_NOT_ENDPOINT_REACHABILITY'));
assert.ok(result.anti_equivalences.includes('SAME_HEIGHT_IS_NOT_MUTUAL_REACHABILITY'));
assert.ok(result.anti_equivalences.includes('DIRECTED_QUASIMETRIC_IS_NOT_SYMMETRIC_METRIC'));

assert.equal(result.claim_ceiling.ambient_td613_partial_order, false);
assert.equal(result.claim_ceiling.causal_set_theorem, false);
assert.equal(result.claim_ceiling.symmetric_metric_geometry, false);
assert.equal(result.claim_ceiling.lawvere_enriched_category_promotion, false);
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
assert.equal(result.stop, 'HUMAN_𝄐_QUALIFIED_FOR_DIRECTED_BRANCHING_AND_CONFLUENCE_AUDITION');

console.log('Ash A15-R0 Aperture × Pedagogue directed reachability geometry tests passed.');
