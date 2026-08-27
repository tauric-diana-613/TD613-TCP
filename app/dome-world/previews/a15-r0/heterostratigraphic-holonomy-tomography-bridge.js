import {
  runNoncommutingTwoFaceHolonomyTomographyHoldout,
} from './noncommuting-two-face-holonomy-tomography.js';
import {
  runPartitionOnlyHolonomyTomographyEcologyAssay,
} from './partition-only-holonomy-tomography-ecology.js';
import {
  buildMossLanternTemporalRoutes,
  runMossLanternTemporalOrderAssay,
} from './moss-lantern-temporal-order-assay.js';

export const HETEROSTRATIGRAPHIC_HOLONOMY_TOMOGRAPHY_SCHEMA =
  'td613.loom.heterostratigraphic-holonomy-tomography-bridge/v0.1';
export const HETEROSTRATIGRAPHIC_HOLONOMY_TOMOGRAPHY_PARENT_RECEIPT =
  '39b8f6e8ba319154378d03c28a1bf42c02870de1';

const STRATA = Object.freeze([
  'ROUTE',
  'TEMPORAL',
  'FACE_HOLONOMY',
  'OBSERVABILITY_ECOLOGY',
]);

const ALLOWED_COMPARISON_STATUSES = new Set([
  'DEFINED',
  'PARTIAL_NONINVERTIBLE',
  'ENCODER_REQUIRED',
  'INCOMMENSURABLE',
  'CONTRADICTORY',
  'REJECTED',
  'ABSTAIN',
]);

const FORBIDDEN_GLOBAL_FIELDS = Object.freeze([
  'truth',
  'global_truth',
  'global_holonomy',
  'global_route',
  'global_confidence',
  'privileged_stratum',
]);

const MOSS_LANTERN_CANONICAL_FIXTURE = Object.freeze({
  fixture_id: 'ash-loom.moss-lantern-calibration/v0.1',
  manifestly_fictional: true,
  runtime_binding: false,
});

const CANONICAL_TEMPORAL_ORDER = Object.freeze([
  'custody-hold',
  'projection-observe',
  'rest',
  'prepare-return',
]);

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function levenshtein(left, right) {
  const rows = left.length + 1;
  const cols = right.length + 1;
  const d = Array.from({ length: rows }, () => Array(cols).fill(0));
  for (let i = 0; i < rows; i += 1) d[i][0] = i;
  for (let j = 0; j < cols; j += 1) d[0][j] = j;
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const substitution = left[i - 1] === right[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + substitution,
      );
    }
  }
  return d[left.length][right.length];
}

function validateFixture(fixture) {
  if (!fixture || fixture.schema !== 'td613.loom.heterostratigraphic-calibration/v0.1') {
    throw new Error('Heterostratigraphic bridge requires the canonical Strata Lantern schema.');
  }
  if (fixture.fixture_id !== 'strata-lantern.moss-lantern-heterostratigraphic/v0.1') {
    throw new Error('Heterostratigraphic bridge requires the canonical Strata Lantern fixture id.');
  }
  if (fixture.manifestly_fictional !== true || fixture.runtime_binding !== false || fixture.live_ash_binding !== false) {
    throw new Error('Strata Lantern must remain fictional and non-runtime.');
  }
  if (fixture.global_synthesis_authority !== false) {
    throw new Error('Strata Lantern may not preregister global synthesis authority.');
  }
  const ids = fixture.strata?.map(item => item.id) ?? [];
  if (JSON.stringify(ids) !== JSON.stringify(STRATA)) {
    throw new Error('Strata Lantern stratum ordering or membership drifted.');
  }
  return true;
}

export function runRouteStratum(fixture) {
  const route = fixture.strata.find(item => item.id === 'ROUTE');
  const expected = route.expected_route;
  const observed = route.observed_route;
  const distance = levenshtein(expected, observed);
  const denominator = Math.max(expected.length, observed.length, 1);
  const residue = Math.round((1000 * distance) / denominator);
  return freeze({
    stratum: 'ROUTE',
    observable_kind: 'DECLARED_LIFECYCLE_ENDPOINT_AND_ROUTE_SEQUENCE',
    expected_route: freeze([...expected]),
    observed_route: freeze([...observed]),
    expected_endpoint: route.expected_endpoint,
    observed_endpoint: route.observed_endpoint,
    endpoint_equivalent: route.expected_endpoint === route.observed_endpoint,
    exact_route_reconstruction: distance === 0,
    route_levenshtein_distance: distance,
    route_residue_millipoints: residue,
    passed:
      route.expected_endpoint === route.observed_endpoint
      && distance > 0
      && residue > 0,
  });
}

function normalizeTemporalOperation(operation) {
  return operation === 'prepare-return' ? 'return' : operation;
}

export function routeTemporalPartialMapCertificate(fixture) {
  const route = fixture.strata.find(item => item.id === 'ROUTE');
  const temporalRoutes = buildMossLanternTemporalRoutes();
  const canonical = temporalRoutes.find(
    item => JSON.stringify(item.operation_order) === JSON.stringify(CANONICAL_TEMPORAL_ORDER),
  );
  if (!canonical) throw new Error('Canonical Moss Lantern temporal ordering not found.');

  const projectedRoute = [
    canonical.open_boundary,
    ...canonical.operation_order.map(normalizeTemporalOperation),
  ];

  const forwardMatch = JSON.stringify(projectedRoute) === JSON.stringify(route.expected_route);

  return freeze({
    status: 'PARTIAL_NONINVERTIBLE',
    declared_map: 'drop-open-boundary-on-reverse; prepare-return->return; retain-operation-order',
    canonical_temporal_route_id: canonical.route_id,
    projected_route: freeze(projectedRoute),
    expected_route: freeze([...route.expected_route]),
    forward_projection_matches_declared_route: forwardMatch,
    information_dropped: freeze([
      'temporal-terminal-witness-coordinates',
      'temporal-noise-model',
      'route-endpoint-metadata-on-reverse',
    ]),
    invertible: false,
    passed: forwardMatch,
  });
}

function validateComparisonRegistry(fixture) {
  const registry = fixture.comparison_registry ?? [];
  const expectedEdgeCount = STRATA.length * (STRATA.length - 1);
  const keys = registry.map(edge => `${edge.from}->${edge.to}`);
  const unique = new Set(keys);

  const everyPairPresent = STRATA.every(from => STRATA.every(to => (
    from === to || unique.has(`${from}->${to}`)
  )));

  const statusesLawful = registry.every(edge => ALLOWED_COMPARISON_STATUSES.has(edge.status));
  const noSelfEdges = registry.every(edge => edge.from !== edge.to);
  const noDuplicates = unique.size === registry.length;

  const status = (from, to) => registry.find(edge => edge.from === from && edge.to === to)?.status ?? null;

  const preregisteredStatusesMatch = (
    status('ROUTE', 'TEMPORAL') === 'PARTIAL_NONINVERTIBLE'
    && status('TEMPORAL', 'ROUTE') === 'PARTIAL_NONINVERTIBLE'
    && status('ROUTE', 'FACE_HOLONOMY') === 'ENCODER_REQUIRED'
    && status('FACE_HOLONOMY', 'ROUTE') === 'ENCODER_REQUIRED'
    && status('ROUTE', 'OBSERVABILITY_ECOLOGY') === 'ENCODER_REQUIRED'
    && status('OBSERVABILITY_ECOLOGY', 'ROUTE') === 'ENCODER_REQUIRED'
    && status('TEMPORAL', 'FACE_HOLONOMY') === 'ENCODER_REQUIRED'
    && status('FACE_HOLONOMY', 'TEMPORAL') === 'ENCODER_REQUIRED'
    && status('TEMPORAL', 'OBSERVABILITY_ECOLOGY') === 'ENCODER_REQUIRED'
    && status('OBSERVABILITY_ECOLOGY', 'TEMPORAL') === 'ENCODER_REQUIRED'
    && status('FACE_HOLONOMY', 'OBSERVABILITY_ECOLOGY') === 'INCOMMENSURABLE'
    && status('OBSERVABILITY_ECOLOGY', 'FACE_HOLONOMY') === 'INCOMMENSURABLE'
  );

  return freeze({
    edge_count: registry.length,
    expected_edge_count: expectedEdgeCount,
    no_self_edges: noSelfEdges,
    no_duplicate_edges: noDuplicates,
    every_ordered_cross_stratum_pair_present: everyPairPresent,
    statuses_lawful: statusesLawful,
    preregistered_statuses_match: preregisteredStatusesMatch,
    passed:
      registry.length === expectedEdgeCount
      && noSelfEdges
      && noDuplicates
      && everyPairPresent
      && statusesLawful
      && preregisteredStatusesMatch,
  });
}

function inheritedTemporalResult() {
  const result = runMossLanternTemporalOrderAssay(MOSS_LANTERN_CANONICAL_FIXTURE, {
    noise_rate: 0.10,
    trials_per_route: 64,
    seed: 613,
  });
  return freeze({
    stratum: 'TEMPORAL',
    observable_kind: 'Z_31^2_CLASSICAL_TERMINAL_WITNESS',
    source_schema: result.schema,
    latent_route_count: result.latent_route_count,
    positive_unique_signature_count: result.positive_control.unique_signature_count,
    commuting_null_unique_signature_count: result.commuting_null.unique_signature_count,
    same_operation_multiset: result.controls.same_operation_multiset,
    same_endpoint: result.controls.same_endpoint,
    local_assay_passed: result.findings.assay_mechanism_validated,
    passed:
      result.findings.assay_mechanism_validated
      && result.latent_route_count === 24
      && result.positive_control.unique_signature_count === 24
      && result.commuting_null.unique_signature_count === 1
      && result.controls.same_operation_multiset
      && result.controls.same_endpoint,
  });
}

function inheritedFaceHolonomyResult() {
  const result = runNoncommutingTwoFaceHolonomyTomographyHoldout();
  return freeze({
    stratum: 'FACE_HOLONOMY',
    observable_kind: 'GL2_F31_TWO_CELL_TRANSPORT',
    source_schema: result.schema,
    edge_tomography_passed: result.findings.bidirectional_edge_tomography_and_orientation_consistency_pass,
    local_face_holonomies_noncommute: result.findings.local_face_holonomies_noncommute,
    ordered_product_reconstructs_outer_boundary:
      result.findings.common_basepoint_ordered_product_reconstructs_outer_boundary,
    wrong_order_control_rejected: result.findings.wrong_order_control_rejected,
    wrong_basepoint_control_rejected: result.findings.wrong_basepoint_control_rejected,
    passed: result.findings.assay_mechanism_validated,
  });
}

function inheritedObservabilityEcologyResult() {
  const result = runPartitionOnlyHolonomyTomographyEcologyAssay();
  return freeze({
    stratum: 'OBSERVABILITY_ECOLOGY',
    observable_kind: 'PROJECTIVE_READOUT_DIRECTIONS_PLUS_UNLABELED_PARTITIONS_F31',
    source_schema: result.schema,
    sparse_ecology_underidentification_observed: result.sparse_ecology.underidentification_observed,
    calibration_ecology_all_32_directions_recovered: result.calibration_ecology.all_32_directions_recovered,
    partition_only_loop_inverse_passed: result.findings.partition_only_readout_recovery_supports_projective_loop_reconstruction,
    decoder_dependencies_enforced: result.findings.zero_anchor_and_kernel_direction_coverage_are_explicit_decoder_dependencies,
    passed: result.findings.assay_mechanism_validated,
  });
}

export function apparentContradictionCertificate(routeResult, temporalResult) {
  const apparent = routeResult.endpoint_equivalent && temporalResult.positive_unique_signature_count === 24;
  const semanticKindsDiffer = routeResult.observable_kind !== temporalResult.observable_kind;
  return freeze({
    route_claim: 'declared lifecycle endpoint equivalent',
    temporal_claim: '24 distinct Z_31^2 terminal signatures',
    apparent_collision_present: apparent,
    same_observable: !semanticKindsDiffer,
    classification:
      apparent && semanticKindsDiffer
        ? 'APPARENT_CONTRADICTION_RESOLVED_BY_STRATUM_SEMANTICS'
        : 'APPARENT_CONTRADICTION_ASSAY_FAILED',
    passed: apparent && semanticKindsDiffer,
  });
}

export function rejectUniversalizer(candidate) {
  const presentForbidden = FORBIDDEN_GLOBAL_FIELDS.filter(field => (
    Object.prototype.hasOwnProperty.call(candidate ?? {}, field)
  ));
  return freeze({
    forbidden_fields: FORBIDDEN_GLOBAL_FIELDS,
    present_forbidden_fields: freeze(presentForbidden),
    accepted: presentForbidden.length === 0,
    classification:
      presentForbidden.length === 0
        ? 'NO_FORBIDDEN_GLOBAL_SYNTHESIS_FIELD_PRESENT'
        : 'UNDECLARED_GLOBAL_SYNTHESIS_REJECTED',
  });
}

export function runHeterostratigraphicHolonomyTomographyBridge(fixture) {
  validateFixture(fixture);

  const route = runRouteStratum(fixture);
  const temporal = inheritedTemporalResult();
  const faceHolonomy = inheritedFaceHolonomyResult();
  const observabilityEcology = inheritedObservabilityEcologyResult();
  const partialMap = routeTemporalPartialMapCertificate(fixture);
  const registry = validateComparisonRegistry(fixture);
  const apparentContradiction = apparentContradictionCertificate(route, temporal);

  const hostileUniversalizer = rejectUniversalizer({
    global_truth: 0.97,
    local_results: 'flattened',
  });

  const localResults = freeze({
    ROUTE: route,
    TEMPORAL: temporal,
    FACE_HOLONOMY: faceHolonomy,
    OBSERVABILITY_ECOLOGY: observabilityEcology,
  });

  const aggregateCandidate = {
    schema: HETEROSTRATIGRAPHIC_HOLONOMY_TOMOGRAPHY_SCHEMA,
    fixture_id: fixture.fixture_id,
    scientific_parent_receipt: HETEROSTRATIGRAPHIC_HOLONOMY_TOMOGRAPHY_PARENT_RECEIPT,
    manifestly_fictional: true,
    runtime_binding: false,
    strata: freeze(STRATA.map(id => ({
      id,
      state_space: fixture.strata.find(item => item.id === id).state_space,
    }))),
    local_results: localResults,
    route_temporal_partial_map: partialMap,
    comparison_registry: freeze(clone(fixture.comparison_registry)),
    comparison_registry_certificate: registry,
    apparent_contradiction_assay: apparentContradiction,
    universalizer_hostile: hostileUniversalizer,
    global_synthesis_authority: false,
    bounded_tomographic_candidate_family: freeze({
      local_pass_vector: freeze(STRATA.map(id => Boolean(localResults[id].passed))),
      comparison_edge_count: fixture.comparison_registry.length,
      fused_world_model: false,
    }),
    claim_ceiling: freeze({
      bounded_synthetic_heterostratigraphic_holonomy_tomography_fixture: false,
      live_ash_tomography: false,
      physical_holonomy: false,
      continuum_tomography: false,
      td613_general_holonomy_law: false,
      td613_general_heterostratigraphic_tomography_law: false,
      sheaf_or_descent_theorem: false,
      proto_loom: false,
      production_authority: false,
      vercel_authority: false,
    }),
  };

  const cleanShape = rejectUniversalizer(aggregateCandidate);
  const localPass = Object.values(localResults).every(result => result.passed === true);
  const passed = (
    localPass
    && partialMap.passed
    && registry.passed
    && apparentContradiction.passed
    && hostileUniversalizer.accepted === false
    && hostileUniversalizer.classification === 'UNDECLARED_GLOBAL_SYNTHESIS_REJECTED'
    && cleanShape.accepted === true
  );

  aggregateCandidate.claim_ceiling = freeze({
    ...aggregateCandidate.claim_ceiling,
    bounded_synthetic_heterostratigraphic_holonomy_tomography_fixture: passed,
  });

  aggregateCandidate.findings = freeze({
    all_four_local_strata_pass: localPass,
    route_temporal_partial_map_is_explicit_and_noninvertible: partialMap.passed && partialMap.invertible === false,
    all_cross_stratum_pairs_have_preregistered_status: registry.passed,
    missing_encoders_remain_missing: fixture.comparison_registry
      .filter(edge => edge.status === 'ENCODER_REQUIRED').length === 8,
    common_F31_does_not_force_face_observability_equivalence:
      fixture.comparison_registry
        .filter(edge => (
          (edge.from === 'FACE_HOLONOMY' && edge.to === 'OBSERVABILITY_ECOLOGY')
          || (edge.from === 'OBSERVABILITY_ECOLOGY' && edge.to === 'FACE_HOLONOMY')
        ))
        .every(edge => edge.status === 'INCOMMENSURABLE'),
    apparent_contradiction_resolved_by_stratum_semantics: apparentContradiction.passed,
    global_universalizer_rejected: hostileUniversalizer.accepted === false,
    no_global_truth_field_emitted: cleanShape.accepted,
    assay_mechanism_validated: passed,
  });

  aggregateCandidate.bounded_answer = passed
    ? 'HETEROSTRATIGRAPHIC_HOLONOMY_TOMOGRAPHY_IS_IMPLEMENTABLE_IN_A_BOUNDED_SYNTHETIC_ASH_KEEP_LOOM_FIXTURE_WITHOUT_COLLAPSING_STRATUM_LOCAL_STATE_SPACES_OR_INVENTING_UNDECLARED_CROSS_STRATUM_ENCODERS'
    : 'HETEROSTRATIGRAPHIC_HOLONOMY_TOMOGRAPHY_BRIDGE_ASSAY_FAILED';

  aggregateCandidate.research_label = passed
    ? 'STRATA_LANTERN_BOUNDED_HETEROSTRATIGRAPHIC_HOLONOMY_TOMOGRAPHY_BRIDGE'
    : 'NOT_EARNED';

  aggregateCandidate.promotion_authority = false;
  aggregateCandidate.production_mutated = false;
  aggregateCandidate.live_ash_binding = false;
  aggregateCandidate.human_closure_required = true;

  return freeze(aggregateCandidate);
}
