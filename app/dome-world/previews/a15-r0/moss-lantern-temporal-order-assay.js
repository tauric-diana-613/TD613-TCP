import { compileObservationAperture } from '../../../engine/flowcore-observation-aperture.js';

export const MOSS_LANTERN_TEMPORAL_ORDER_SCHEMA = 'td613.ash.a15-r0.moss-lantern-temporal-order/v0.1';
export const MOSS_LANTERN_TEMPORAL_MODULUS = 31;
export const MOSS_LANTERN_TEMPORAL_OBSERVATION_BUDGET = 2;
export const MOSS_LANTERN_TEMPORAL_OPERATIONS = Object.freeze([
  'custody-hold',
  'projection-observe',
  'rest',
  'prepare-return'
]);

export const MOSS_LANTERN_ORDER_SENSITIVE_OPERATORS = Object.freeze({
  'custody-hold': Object.freeze([[1, 2], [3, 1]].map(row => Object.freeze(row))),
  'projection-observe': Object.freeze([[0, 3], [3, 0]].map(row => Object.freeze(row))),
  rest: Object.freeze([[0, 3], [2, 3]].map(row => Object.freeze(row))),
  'prepare-return': Object.freeze([[2, 3], [2, 2]].map(row => Object.freeze(row)))
});

export const MOSS_LANTERN_COMMUTING_NULL_OPERATORS = Object.freeze({
  'custody-hold': Object.freeze([[2, 0], [0, 1]].map(row => Object.freeze(row))),
  'projection-observe': Object.freeze([[3, 0], [0, 1]].map(row => Object.freeze(row))),
  rest: Object.freeze([[5, 0], [0, 1]].map(row => Object.freeze(row))),
  'prepare-return': Object.freeze([[7, 0], [0, 1]].map(row => Object.freeze(row)))
});

const START_VECTOR = Object.freeze([1, 2]);
const round6 = value => Number(value.toFixed(6));
const mod = value => ((value % MOSS_LANTERN_TEMPORAL_MODULUS) + MOSS_LANTERN_TEMPORAL_MODULUS) % MOSS_LANTERN_TEMPORAL_MODULUS;

function freeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(freeze);
  return Object.freeze(value);
}

function permutations(items) {
  if (items.length === 1) return [items];
  const out = [];
  items.forEach((item, index) => {
    const rest = [...items.slice(0, index), ...items.slice(index + 1)];
    permutations(rest).forEach(tail => out.push([item, ...tail]));
  });
  return out;
}

export function buildMossLanternTemporalRoutes() {
  return freeze(permutations([...MOSS_LANTERN_TEMPORAL_OPERATIONS]).map((operationOrder, index) => ({
    route_id: `ML3-R${String(index + 1).padStart(2, '0')}`,
    open_boundary: 'open-practice-case',
    operation_order: [...operationOrder],
    terminal_action: 'return',
    endpoint: 'returned-practice-capsule',
    operation_multiset: [...MOSS_LANTERN_TEMPORAL_OPERATIONS].sort()
  })));
}

function matVec(matrix, vector) {
  return Object.freeze([
    mod(matrix[0][0] * vector[0] + matrix[0][1] * vector[1]),
    mod(matrix[1][0] * vector[0] + matrix[1][1] * vector[1])
  ]);
}

function matMul(left, right) {
  return [
    [
      mod(left[0][0] * right[0][0] + left[0][1] * right[1][0]),
      mod(left[0][0] * right[0][1] + left[0][1] * right[1][1])
    ],
    [
      mod(left[1][0] * right[0][0] + left[1][1] * right[1][0]),
      mod(left[1][0] * right[0][1] + left[1][1] * right[1][1])
    ]
  ];
}

function matricesEqual(left, right) {
  return left.every((row, rowIndex) => row.every((value, colIndex) => value === right[rowIndex][colIndex]));
}

export function forwardMossLanternTemporalWitness(route, operatorFamily) {
  if (!route || !Array.isArray(route.operation_order) || route.operation_order.length !== 4) {
    throw new Error('Temporal witness requires a declared four-operation Moss Lantern route.');
  }
  let witness = START_VECTOR;
  route.operation_order.forEach(operation => {
    const matrix = operatorFamily?.[operation];
    if (!matrix) throw new Error(`Missing temporal operator for ${operation}.`);
    witness = matVec(matrix, witness);
  });
  return witness;
}

function pairwiseCommutation(operatorFamily) {
  let commuting = 0;
  let noncommuting = 0;
  for (let left = 0; left < MOSS_LANTERN_TEMPORAL_OPERATIONS.length; left += 1) {
    for (let right = left + 1; right < MOSS_LANTERN_TEMPORAL_OPERATIONS.length; right += 1) {
      const a = operatorFamily[MOSS_LANTERN_TEMPORAL_OPERATIONS[left]];
      const b = operatorFamily[MOSS_LANTERN_TEMPORAL_OPERATIONS[right]];
      if (matricesEqual(matMul(a, b), matMul(b, a))) commuting += 1;
      else noncommuting += 1;
    }
  }
  return freeze({ pairwise_commuting_pair_count: commuting, pairwise_noncommuting_pair_count: noncommuting });
}

function makeRng(seed) {
  let value = seed >>> 0;
  return () => {
    value = (Math.imul(1664525, value) + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function jitterCoordinate(value, noiseRate, rng) {
  if (rng() >= noiseRate) return value;
  const deltas = [-2, -1, 1, 2];
  const delta = deltas[Math.min(3, Math.floor(rng() * deltas.length))];
  return mod(value + delta);
}

function circularDistance(left, right) {
  const raw = Math.abs(left - right);
  return Math.min(raw, MOSS_LANTERN_TEMPORAL_MODULUS - raw);
}

function signatureKey(signature) {
  return `${signature[0]}:${signature[1]}`;
}

function decodeWitness(observed, signatures) {
  let bestDistance = Infinity;
  const candidates = [];
  signatures.forEach((signature, index) => {
    const distance = circularDistance(observed[0], signature[0]) + circularDistance(observed[1], signature[1]);
    if (distance < bestDistance) {
      bestDistance = distance;
      candidates.length = 0;
      candidates.push(index);
    } else if (distance === bestDistance) {
      candidates.push(index);
    }
  });
  return freeze({ distance: bestDistance, candidates: freeze([...candidates]) });
}

function exactMetrics(signatures) {
  const counts = new Map();
  signatures.forEach(signature => counts.set(signatureKey(signature), (counts.get(signatureKey(signature)) || 0) + 1));
  const candidateSizes = signatures.map(signature => counts.get(signatureKey(signature)));
  return freeze({
    unique_signature_count: counts.size,
    exact_unique_recovery_rate: round6(candidateSizes.filter(size => size === 1).length / signatures.length),
    mean_candidate_set_size: round6(candidateSizes.reduce((sum, size) => sum + size, 0) / candidateSizes.length),
    maximum_candidate_set_size: Math.max(...candidateSizes)
  });
}

function noisyMetrics(signatures, options, salt) {
  let exact = 0;
  let ambiguous = 0;
  let wrongUnique = 0;
  const total = signatures.length * options.trials_per_route;

  signatures.forEach((signature, routeIndex) => {
    for (let trial = 0; trial < options.trials_per_route; trial += 1) {
      const rng = makeRng(options.seed + routeIndex * 1009 + trial * 9176 + salt * 131);
      const observed = freeze(signature.map(value => jitterCoordinate(value, options.noise_rate, rng)));
      const decoded = decodeWitness(observed, signatures);
      if (decoded.candidates.length !== 1) ambiguous += 1;
      else if (decoded.candidates[0] === routeIndex) exact += 1;
      else wrongUnique += 1;
    }
  });

  return freeze({
    noisy_exact_recovery_rate: round6(exact / total),
    ambiguous_decode_rate: round6(ambiguous / total),
    wrong_unique_decode_rate: round6(wrongUnique / total)
  });
}

function familyMetrics(routes, operatorFamily, options, salt) {
  const signatures = routes.map(route => forwardMossLanternTemporalWitness(route, operatorFamily));
  return freeze({
    latent_route_count: routes.length,
    observation_budget: MOSS_LANTERN_TEMPORAL_OBSERVATION_BUDGET,
    ...exactMetrics(signatures),
    ...noisyMetrics(signatures, options, salt),
    ...pairwiseCommutation(operatorFamily)
  });
}

function sameOperationMultiset(routes) {
  const key = JSON.stringify(routes[0].operation_multiset);
  return routes.every(route => JSON.stringify(route.operation_multiset) === key);
}

function sameEndpoint(routes) {
  return routes.every(route => route.endpoint === routes[0].endpoint);
}

function validateFixture(fixture) {
  if (!fixture || fixture.fixture_id !== 'ash-loom.moss-lantern-calibration/v0.1') {
    throw new Error('ML3 requires the canonical Moss Lantern calibration fixture.');
  }
  if (fixture.manifestly_fictional !== true || fixture.runtime_binding !== false) {
    throw new Error('ML3 requires a fictional, non-runtime Moss Lantern fixture.');
  }
}

export function runMossLanternTemporalOrderAssay(fixture, options = {}) {
  validateFixture(fixture);
  const noiseRate = options.noise_rate ?? 0.10;
  const trialsPerRoute = options.trials_per_route ?? 64;
  const seed = options.seed ?? 613;
  if (!Number.isFinite(noiseRate) || noiseRate < 0 || noiseRate >= 1) throw new Error('noise_rate must be finite in [0, 1).');
  if (!Number.isInteger(trialsPerRoute) || trialsPerRoute <= 0) throw new Error('trials_per_route must be a positive integer.');
  if (!Number.isInteger(seed)) throw new Error('seed must be an integer.');

  const routes = buildMossLanternTemporalRoutes();
  const assayOptions = freeze({ noise_rate: noiseRate, trials_per_route: trialsPerRoute, seed });
  const positive = familyMetrics(routes, MOSS_LANTERN_ORDER_SENSITIVE_OPERATORS, assayOptions, 1);
  const commutingNull = familyMetrics(routes, MOSS_LANTERN_COMMUTING_NULL_OPERATORS, assayOptions, 2);
  const multisetMatched = sameOperationMultiset(routes);
  const endpointMatched = sameEndpoint(routes);
  const orderBlindCandidateSetSize = routes.length;

  const observerFirewall = freeze({
    observer_receives_route_labels: false,
    observer_receives_absolute_timestamps: false,
    observer_receives_transition_timestamps: false,
    observer_receives_hidden_intermediate_states: false,
    full_route_memory_used: false,
    levenshtein_distance_used: false,
    observation_budget_coordinates: MOSS_LANTERN_TEMPORAL_OBSERVATION_BUDGET
  });

  const positivePass = (
    positive.unique_signature_count === 24
    && positive.exact_unique_recovery_rate === 1
    && positive.noisy_exact_recovery_rate >= 0.85
    && positive.pairwise_noncommuting_pair_count === 6
  );
  const nullPass = (
    commutingNull.unique_signature_count === 1
    && commutingNull.exact_unique_recovery_rate === 0
    && commutingNull.mean_candidate_set_size === 24
    && commutingNull.ambiguous_decode_rate === 1
    && commutingNull.pairwise_commuting_pair_count === 6
  );
  const firewallPass = Object.entries(observerFirewall)
    .filter(([key]) => key !== 'observation_budget_coordinates')
    .every(([, value]) => value === false);
  const assayMechanismValidated = positivePass && nullPass && multisetMatched && endpointMatched && firewallPass;

  const aperture = compileObservationAperture({
    source_ids: ['moss-lantern-practice-capsule'],
    source_count: 1,
    instrument_scope: ['pedagogue-research-hydration', 'moss-lantern-temporal-order-tomography'],
    condition_scope: ['order-sensitive-classical-operator-train', 'commuting-operator-null', 'order-blind-multiset-null'],
    matching_posture: 'DECLARED_FINITE_CANDIDATE_INVERSE_MODEL',
    filter_flags: {
      live_ash_runtime: false,
      raw_source_transport: false,
      route_labels_exposed_to_observer: false,
      absolute_timestamps_used: false,
      full_route_memory_used: false
    },
    context_labels: ['A15-R0', 'Moss Lantern', 'ML3'],
    practice_mode: true,
    identity_redacted: true
  });

  return freeze({
    schema: MOSS_LANTERN_TEMPORAL_ORDER_SCHEMA,
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    fixture_id: fixture.fixture_id,
    manifestly_fictional: true,
    latent_route_family: 'ALL_4_OPERATION_PERMUTATIONS_WITH_FIXED_BOUNDARIES',
    latent_route_count: routes.length,
    fixed_open_boundary: 'open-practice-case',
    fixed_terminal_action: 'return',
    fixed_endpoint: 'returned-practice-capsule',
    operation_multiset: freeze([...MOSS_LANTERN_TEMPORAL_OPERATIONS].sort()),
    witness_space: 'Z_31^2_CLASSICAL_FINITE_STATE',
    start_vector: START_VECTOR,
    observation_budget: MOSS_LANTERN_TEMPORAL_OBSERVATION_BUDGET,
    noise_model: freeze({
      kind: 'SEEDED_MODULAR_COORDINATE_JITTER',
      jitter_probability: noiseRate,
      jitter_set: freeze([-2, -1, 1, 2]),
      trials_per_route: trialsPerRoute,
      seed
    }),
    positive_control: positive,
    commuting_null: commutingNull,
    order_blind_aggregate_null: freeze({
      candidate_set_size: orderBlindCandidateSetSize,
      operation_multiset_only: true,
      endpoint_only: true,
      unique_order_recovery_possible: false
    }),
    controls: freeze({
      same_operation_multiset: multisetMatched,
      same_endpoint: endpointMatched,
      same_operation_count: true,
      same_open_boundary: true,
      same_terminal_action: true,
      observer_firewall: observerFirewall
    }),
    observation_aperture: aperture,
    findings: freeze({
      order_sensitive_process_separates_all_permutations: positive.unique_signature_count === 24,
      commuting_null_erases_order: commutingNull.unique_signature_count === 1,
      order_blind_aggregate_erases_order: orderBlindCandidateSetSize === 24,
      noisy_reconstruction_above_calibration_threshold: positive.noisy_exact_recovery_rate >= 0.85,
      assay_mechanism_validated: assayMechanismValidated
    }),
    hypothesis_status: freeze({
      H_MOSS_LANTERN_TEMPORAL_ORDER_ASSAY: assayMechanismValidated
        ? 'SUPPORTED_IN_BOUNDED_SYNTHETIC_TEMPORAL_FIXTURE'
        : 'FALSIFIED_IN_BOUNDED_SYNTHETIC_TEMPORAL_FIXTURE',
      H_TD613_TEMPORAL_ORDER_IDENTIFIABILITY: 'OPEN_UNMEASURED'
    }),
    research_transfer_relation: 'ORDER_IS_PART_OF_PROCESS_STATE',
    internal_synthetic_witness_eligible: assayMechanismValidated,
    classical_finite_operator_claim: true,
    quantum_noncommutativity_claim: false,
    physical_noncommutativity_claim: false,
    connection_declared: false,
    curvature_claim: false,
    holonomy_claim: false,
    quantum_behavior_claim: false,
    physical_realization_claim: false,
    promotion_authority: false,
    production_mutated: false,
    live_ash_binding: false,
    proto_loom_implementation: false,
    external_transmission: false,
    human_closure_required: true,
    claim_ceiling: 'FINITE_CLASSICAL_Z31_TEMPORAL_ORDER_CALIBRATION_ONLY; may support that the authored order-sensitive operator train retains reconstructable route-order information while matched route multiset and endpoint are fixed and the commuting null does not. It does not establish quantum temporal tomography, live TD613 temporal-order identifiability, physical noncommutativity, D3 geometry, connection, curvature, holonomy, Berry structure, phasons, A16, Proto-Loom, or production authority.',
    finding: assayMechanismValidated
      ? 'The bounded classical ML3 process retains reconstructable temporal-order information in a terminal two-coordinate witness while the matched commuting and order-blind controls erase route order. Live TD613 temporal-order identifiability remains OPEN_UNMEASURED.'
      : 'At least one ML3 positive, commuting-null, multiset, endpoint, or observer-firewall gate failed; no temporal-order reconstruction claim is admitted.'
  });
}
