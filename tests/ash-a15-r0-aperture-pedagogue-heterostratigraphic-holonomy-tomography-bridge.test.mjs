import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import {
  HETEROSTRATIGRAPHIC_HOLONOMY_TOMOGRAPHY_SCHEMA,
  HETEROSTRATIGRAPHIC_HOLONOMY_TOMOGRAPHY_PARENT_RECEIPT,
  runRouteStratum,
  routeTemporalPartialMapCertificate,
  apparentContradictionCertificate,
  rejectUniversalizer,
  runHeterostratigraphicHolonomyTomographyBridge,
} from '../app/dome-world/previews/a15-r0/heterostratigraphic-holonomy-tomography-bridge.js';

const fixture = JSON.parse(readFileSync(
  new URL('./fixtures/pedagogue/heterostratigraphic-holonomy-tomography-strata-lantern-v01.json', import.meta.url),
  'utf8',
));

assert.equal(
  HETEROSTRATIGRAPHIC_HOLONOMY_TOMOGRAPHY_PARENT_RECEIPT,
  '39b8f6e8ba319154378d03c28a1bf42c02870de1',
  'heterostratigraphic chamber must pin exact witnessed #775 receipt',
);
assert.equal(
  HETEROSTRATIGRAPHIC_HOLONOMY_TOMOGRAPHY_SCHEMA,
  'td613.loom.heterostratigraphic-holonomy-tomography-bridge/v0.1',
);
assert.equal(fixture.manifestly_fictional, true);
assert.equal(fixture.runtime_binding, false);
assert.equal(fixture.live_ash_binding, false);
assert.equal(fixture.global_synthesis_authority, false);
assert.deepEqual(fixture.strata.map(item => item.id), [
  'ROUTE',
  'TEMPORAL',
  'FACE_HOLONOMY',
  'OBSERVABILITY_ECOLOGY',
]);

const route = runRouteStratum(fixture);
assert.equal(route.passed, true);
assert.equal(route.endpoint_equivalent, true);
assert.equal(route.exact_route_reconstruction, false);
assert.equal(route.route_levenshtein_distance, 1);
assert.equal(route.route_residue_millipoints, 200);

const partial = routeTemporalPartialMapCertificate(fixture);
assert.equal(partial.passed, true);
assert.equal(partial.status, 'PARTIAL_NONINVERTIBLE');
assert.equal(partial.forward_projection_matches_declared_route, true);
assert.equal(partial.invertible, false);
assert.ok(partial.information_dropped.length >= 2);

const aggregate = runHeterostratigraphicHolonomyTomographyBridge(fixture);
assert.equal(aggregate.schema, HETEROSTRATIGRAPHIC_HOLONOMY_TOMOGRAPHY_SCHEMA);
assert.equal(aggregate.fixture_id, fixture.fixture_id);
assert.equal(aggregate.manifestly_fictional, true);
assert.equal(aggregate.runtime_binding, false);
assert.equal(aggregate.global_synthesis_authority, false);
assert.equal(aggregate.promotion_authority, false);
assert.equal(aggregate.production_mutated, false);
assert.equal(aggregate.live_ash_binding, false);
assert.equal(aggregate.human_closure_required, true);

assert.equal(aggregate.local_results.ROUTE.passed, true);
assert.equal(aggregate.local_results.TEMPORAL.passed, true);
assert.equal(aggregate.local_results.FACE_HOLONOMY.passed, true);
assert.equal(aggregate.local_results.OBSERVABILITY_ECOLOGY.passed, true);

assert.equal(aggregate.local_results.TEMPORAL.latent_route_count, 24);
assert.equal(aggregate.local_results.TEMPORAL.positive_unique_signature_count, 24);
assert.equal(aggregate.local_results.TEMPORAL.commuting_null_unique_signature_count, 1);
assert.equal(aggregate.local_results.TEMPORAL.same_operation_multiset, true);
assert.equal(aggregate.local_results.TEMPORAL.same_endpoint, true);

assert.equal(aggregate.local_results.FACE_HOLONOMY.local_face_holonomies_noncommute, true);
assert.equal(aggregate.local_results.FACE_HOLONOMY.ordered_product_reconstructs_outer_boundary, true);
assert.equal(aggregate.local_results.FACE_HOLONOMY.wrong_order_control_rejected, true);
assert.equal(aggregate.local_results.FACE_HOLONOMY.wrong_basepoint_control_rejected, true);

assert.equal(aggregate.local_results.OBSERVABILITY_ECOLOGY.sparse_ecology_underidentification_observed, true);
assert.equal(aggregate.local_results.OBSERVABILITY_ECOLOGY.calibration_ecology_all_32_directions_recovered, true);
assert.equal(aggregate.local_results.OBSERVABILITY_ECOLOGY.partition_only_loop_inverse_passed, true);
assert.equal(aggregate.local_results.OBSERVABILITY_ECOLOGY.decoder_dependencies_enforced, true);

const registry = aggregate.comparison_registry_certificate;
assert.equal(registry.passed, true);
assert.equal(registry.edge_count, 12);
assert.equal(registry.expected_edge_count, 12);
assert.equal(registry.no_self_edges, true);
assert.equal(registry.no_duplicate_edges, true);
assert.equal(registry.every_ordered_cross_stratum_pair_present, true);
assert.equal(registry.preregistered_statuses_match, true);

const getStatus = (from, to) => aggregate.comparison_registry
  .find(edge => edge.from === from && edge.to === to)?.status;
assert.equal(getStatus('ROUTE', 'TEMPORAL'), 'PARTIAL_NONINVERTIBLE');
assert.equal(getStatus('TEMPORAL', 'ROUTE'), 'PARTIAL_NONINVERTIBLE');
assert.equal(getStatus('ROUTE', 'FACE_HOLONOMY'), 'ENCODER_REQUIRED');
assert.equal(getStatus('TEMPORAL', 'FACE_HOLONOMY'), 'ENCODER_REQUIRED');
assert.equal(getStatus('FACE_HOLONOMY', 'OBSERVABILITY_ECOLOGY'), 'INCOMMENSURABLE');
assert.equal(getStatus('OBSERVABILITY_ECOLOGY', 'FACE_HOLONOMY'), 'INCOMMENSURABLE');

assert.equal(aggregate.findings.all_four_local_strata_pass, true);
assert.equal(aggregate.findings.route_temporal_partial_map_is_explicit_and_noninvertible, true);
assert.equal(aggregate.findings.all_cross_stratum_pairs_have_preregistered_status, true);
assert.equal(aggregate.findings.missing_encoders_remain_missing, true);
assert.equal(aggregate.findings.common_F31_does_not_force_face_observability_equivalence, true);
assert.equal(aggregate.findings.apparent_contradiction_resolved_by_stratum_semantics, true);
assert.equal(aggregate.findings.global_universalizer_rejected, true);
assert.equal(aggregate.findings.no_global_truth_field_emitted, true);
assert.equal(aggregate.findings.assay_mechanism_validated, true);

assert.equal(
  aggregate.apparent_contradiction_assay.classification,
  'APPARENT_CONTRADICTION_RESOLVED_BY_STRATUM_SEMANTICS',
);
assert.equal(aggregate.apparent_contradiction_assay.same_observable, false);

assert.equal(aggregate.universalizer_hostile.accepted, false);
assert.equal(aggregate.universalizer_hostile.classification, 'UNDECLARED_GLOBAL_SYNTHESIS_REJECTED');
assert.deepEqual(aggregate.universalizer_hostile.present_forbidden_fields, ['global_truth']);

for (const field of fixture.forbidden_global_fields) {
  assert.equal(
    Object.prototype.hasOwnProperty.call(aggregate, field),
    false,
    `aggregate must not emit forbidden global field ${field}`,
  );
}

assert.equal(
  aggregate.bounded_answer,
  'HETEROSTRATIGRAPHIC_HOLONOMY_TOMOGRAPHY_IS_IMPLEMENTABLE_IN_A_BOUNDED_SYNTHETIC_ASH_KEEP_LOOM_FIXTURE_WITHOUT_COLLAPSING_STRATUM_LOCAL_STATE_SPACES_OR_INVENTING_UNDECLARED_CROSS_STRATUM_ENCODERS',
);
assert.equal(
  aggregate.research_label,
  'STRATA_LANTERN_BOUNDED_HETEROSTRATIGRAPHIC_HOLONOMY_TOMOGRAPHY_BRIDGE',
);
assert.equal(
  aggregate.claim_ceiling.bounded_synthetic_heterostratigraphic_holonomy_tomography_fixture,
  true,
);
assert.equal(aggregate.claim_ceiling.live_ash_tomography, false);
assert.equal(aggregate.claim_ceiling.physical_holonomy, false);
assert.equal(aggregate.claim_ceiling.continuum_tomography, false);
assert.equal(aggregate.claim_ceiling.td613_general_holonomy_law, false);
assert.equal(aggregate.claim_ceiling.td613_general_heterostratigraphic_tomography_law, false);
assert.equal(aggregate.claim_ceiling.sheaf_or_descent_theorem, false);
assert.equal(aggregate.claim_ceiling.proto_loom, false);
assert.equal(aggregate.claim_ceiling.production_authority, false);
assert.equal(aggregate.claim_ceiling.vercel_authority, false);

// Hostile 1: same endpoint cannot erase route divergence.
assert.equal(route.endpoint_equivalent, true);
assert.notEqual(route.route_residue_millipoints, 0);

// Hostile 2: same operation multiset and endpoint cannot erase temporal ordering.
assert.equal(aggregate.local_results.TEMPORAL.same_operation_multiset, true);
assert.equal(aggregate.local_results.TEMPORAL.same_endpoint, true);
assert.equal(aggregate.local_results.TEMPORAL.positive_unique_signature_count, 24);

// Hostile 3: face-holonomy order/basepoint controls must remain negative.
assert.equal(aggregate.local_results.FACE_HOLONOMY.wrong_order_control_rejected, true);
assert.equal(aggregate.local_results.FACE_HOLONOMY.wrong_basepoint_control_rejected, true);

// Hostile 4: sparse ecology cannot be promoted to unique tomography.
assert.equal(aggregate.local_results.OBSERVABILITY_ECOLOGY.sparse_ecology_underidentification_observed, true);

// Hostile 5: common finite F31 arithmetic does not create an encoder.
assert.equal(getStatus('TEMPORAL', 'FACE_HOLONOMY'), 'ENCODER_REQUIRED');
assert.equal(getStatus('FACE_HOLONOMY', 'OBSERVABILITY_ECOLOGY'), 'INCOMMENSURABLE');

// Hostile 6: route endpoint and temporal terminal witness are different observables.
const contradiction = apparentContradictionCertificate(
  aggregate.local_results.ROUTE,
  aggregate.local_results.TEMPORAL,
);
assert.equal(contradiction.passed, true);
assert.equal(contradiction.same_observable, false);

// Hostile 7: explicit global synthesis is rejected.
assert.equal(rejectUniversalizer({ global_truth: 1 }).accepted, false);
assert.equal(rejectUniversalizer({ privileged_stratum: 'FACE_HOLONOMY' }).accepted, false);
assert.equal(rejectUniversalizer({ local_results: {} }).accepted, true);

// Hostile 8: removing one ordered comparison edge defeats total registry coverage.
const missingEdgeFixture = structuredClone(fixture);
missingEdgeFixture.comparison_registry = missingEdgeFixture.comparison_registry.slice(1);
const missingEdge = runHeterostratigraphicHolonomyTomographyBridge(missingEdgeFixture);
assert.equal(missingEdge.comparison_registry_certificate.passed, false);
assert.equal(missingEdge.findings.assay_mechanism_validated, false);

// Hostile 9: widening authority at fixture level is rejected before assay execution.
const widenedFixture = structuredClone(fixture);
widenedFixture.global_synthesis_authority = true;
assert.throws(
  () => runHeterostratigraphicHolonomyTomographyBridge(widenedFixture),
  /may not preregister global synthesis authority/,
);

console.log('Ash A15-R0 heterostratigraphic holonomy tomography bridge hostile tests passed.');
