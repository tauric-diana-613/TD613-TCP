import { AIA_RECEIVERS } from './aia-receiver-indexed-distinguishability.js';

export const PHASONIC_SUPERMOIRE_DROMOLOGICAL_TOMOGRAPHY_SCHEMA =
  'td613.dome-world.phasonic-supermoire-dromological-tomography/v0.1';
export const PHASONIC_SUPERMOIRE_DROMOLOGICAL_TOMOGRAPHY_PARENT_RECEIPT =
  '9c92b4269fe2cd277799d8e885caf7765cbdfecb';

const AUTHORITY_KEYS = Object.freeze([
  'inverse',
  'encoder',
  'custody_mutation',
  'release',
  'production',
  'physical_claim',
  'continuum_claim',
]);

function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function same(left, right) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function zeroAuthority() {
  return freeze(Object.fromEntries(AUTHORITY_KEYS.map(key => [key, false])));
}

export const PHASONIC_CARRIER_BASIS = freeze([
  '1',
  'sqrt(3)',
  'phi',
  'phi*sqrt(3)',
]);

export const PHASONIC_STRATA = freeze({
  PHI_PAIR_WIRE: freeze({
    id: 'PHI_PAIR_WIRE',
    carrier_vectors: freeze([
      freeze([1, 0, 0, 0]),
      freeze([0, 0, 1, 0]),
    ]),
    child_copy: 'two rhythms that do not share one repeating beat',
  }),
  HEXAGONAL_MOIRE: freeze({
    id: 'HEXAGONAL_MOIRE',
    carrier_vectors: freeze([
      freeze([0, 1, 0, 0]),
    ]),
    child_copy: 'a six-way honeycomb beat layer',
  }),
  ICOSAHEDRAL_PHASON: freeze({
    id: 'ICOSAHEDRAL_PHASON',
    carrier_vectors: freeze([
      freeze([0, 0, 0, 1]),
    ]),
    child_copy: 'a golden-star layer with a sliding phase',
  }),
});

export const PHASONIC_OPERATORS = freeze({
  PHI_PAIR_WIRE: freeze([
    freeze([1, 0, 0]),
    freeze([-1, 1, 0]),
    freeze([0, 0, 1]),
  ]),
  HEXAGONAL_MOIRE: freeze([
    freeze([1, -1, 0]),
    freeze([0, 1, 0]),
    freeze([0, 0, 1]),
  ]),
  ICOSAHEDRAL_PHASON: freeze([
    freeze([1, 0, -1]),
    freeze([0, 1, 0]),
    freeze([0, 0, 1]),
  ]),
});

export const PHASONIC_CANONICAL_SCHEDULE = freeze([
  'PHI_PAIR_WIRE',
  'HEXAGONAL_MOIRE',
  'ICOSAHEDRAL_PHASON',
]);

export const PHASONIC_HOSTILE_SCHEDULE = freeze([
  'HEXAGONAL_MOIRE',
  'PHI_PAIR_WIRE',
  'ICOSAHEDRAL_PHASON',
]);

export const PHASONIC_OBSERVATION_APERTURE = freeze([1, 0, 0]);
export const PHASONIC_HOSTILE_NULL_VECTOR = freeze([1, 1, 0]);

export const PHASONIC_CUPOLA_CUSTODY_WITNESS = freeze({
  aia_parent_receipt: PHASONIC_SUPERMOIRE_DROMOLOGICAL_TOMOGRAPHY_PARENT_RECEIPT,
  fixture_schema: PHASONIC_SUPERMOIRE_DROMOLOGICAL_TOMOGRAPHY_SCHEMA,
  fixture_id: 'phi-pair-wire.hex-moie.icosa-phason.supermoire-cupola/v0.1',
  authority: zeroAuthority(),
  research_only: true,
  runtime_binding: false,
});

function assertIntegerVector(vector, length, label) {
  if (!Array.isArray(vector) || vector.length !== length || !vector.every(Number.isInteger)) {
    throw new Error(`${label} must be an integer vector of length ${length}`);
  }
}

function identity3() {
  return [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
}

function matrixMultiply(left, right) {
  return left.map((row) => right[0].map((_, column) => (
    row.reduce((sum, value, index) => sum + value * right[index][column], 0)
  )));
}

function rowTimesMatrix(row, matrix) {
  return matrix[0].map((_, column) => (
    row.reduce((sum, value, index) => sum + value * matrix[index][column], 0)
  ));
}

function matrixTimesVector(matrix, vector) {
  return matrix.map(row => row.reduce((sum, value, index) => sum + value * vector[index], 0));
}

function determinant3(matrix) {
  const [[a, b, c], [d, e, f], [g, h, i]] = matrix;
  return a * (e * i - f * h)
    - b * (d * i - f * g)
    + c * (d * h - e * g);
}

function operatorFor(stratum) {
  const operator = PHASONIC_OPERATORS[stratum];
  if (!operator) throw new Error(`undeclared phasonic stratum: ${stratum}`);
  return operator;
}

function assertSchedule(schedule) {
  if (!Array.isArray(schedule) || schedule.length !== 3) {
    throw new Error('phasonic schedule must contain exactly three strata');
  }
  const declared = [...PHASONIC_CANONICAL_SCHEDULE].sort();
  const received = [...schedule].sort();
  if (!same(declared, received)) {
    throw new Error('phasonic schedule must be a permutation of the declared triple stratum family');
  }
}

export function phasonicCarrierIncommensurabilityCertificate() {
  const supports = Object.values(PHASONIC_STRATA).map((stratum) => freeze({
    stratum: stratum.id,
    occupied_basis_coordinates: freeze([...new Set(
      stratum.carrier_vectors.flatMap(vector => vector
        .map((coefficient, index) => coefficient === 0 ? null : index)
        .filter(index => index !== null)),
    )].sort()),
  }));

  const pairwise = [];
  for (let left = 0; left < supports.length; left += 1) {
    for (let right = left + 1; right < supports.length; right += 1) {
      const overlap = supports[left].occupied_basis_coordinates.filter(index => (
        supports[right].occupied_basis_coordinates.includes(index)
      ));
      pairwise.push(freeze({
        left: supports[left].stratum,
        right: supports[right].stratum,
        coordinate_overlap: freeze(overlap),
        zero_intersection_in_declared_free_module_fixture: overlap.length === 0,
      }));
    }
  }

  const occupied = [...new Set(supports.flatMap(row => row.occupied_basis_coordinates))].sort();
  const passed = pairwise.every(row => row.zero_intersection_in_declared_free_module_fixture)
    && occupied.length === PHASONIC_CARRIER_BASIS.length;

  return freeze({
    basis: PHASONIC_CARRIER_BASIS,
    basis_rank: PHASONIC_CARRIER_BASIS.length,
    strata: supports,
    pairwise: freeze(pairwise),
    total_occupied_rank: occupied.length,
    passed,
    fixture_only: true,
    physical_quasicrystal_claim: false,
    complete_geometric_realization_claim: false,
    classification: passed
      ? 'THE_DECLARED_PHI_PAIR_WIRE_HEXAGONAL_MOIRE_AND_ICOSAHEDRAL_PHASON_CARRIER_MODULES_ARE_PAIRWISE_INCOMMENSURABLE_INSIDE_THE_PREREGISTERED_FREE_RANK_FOUR_ALGEBRAIC_COORDINATE_FIXTURE'
      : 'DECLARED_CARRIER_INCOMMENSURABILITY_NOT_ESTABLISHED',
    scars: freeze([
      'FORMAL_CARRIER_MODULE_INCOMMENSURABILITY != PHYSICAL_QUASICRYSTAL_INCOMMENSURABILITY',
      'CARRIER_LABEL != COMPLETE_GEOMETRIC_REALIZATION',
    ]),
  });
}

export function phasonicObservationMatrix(schedule = PHASONIC_CANONICAL_SCHEDULE) {
  assertSchedule(schedule);
  let product = identity3();
  const rows = [];
  for (const stratum of schedule) {
    product = matrixMultiply(operatorFor(stratum), product);
    rows.push(rowTimesMatrix(PHASONIC_OBSERVATION_APERTURE, product));
  }
  return freeze(rows.map(row => freeze(row)));
}

export function phasonicFormalHolonomy(schedule = PHASONIC_CANONICAL_SCHEDULE) {
  assertSchedule(schedule);
  let product = identity3();
  for (const stratum of schedule) {
    product = matrixMultiply(operatorFor(stratum), product);
  }
  return freeze(product.map(row => freeze(row)));
}

export function observePhasonicState(state, schedule = PHASONIC_CANONICAL_SCHEDULE) {
  assertIntegerVector(state, 3, 'phasonic state');
  const observationMatrix = phasonicObservationMatrix(schedule);
  return freeze(matrixTimesVector(observationMatrix, state));
}

export function inverseCanonicalPhasonicObservation(observation) {
  assertIntegerVector(observation, 3, 'canonical phasonic observation');
  const canonicalMatrix = phasonicObservationMatrix(PHASONIC_CANONICAL_SCHEDULE);
  if (determinant3(canonicalMatrix) !== 1) {
    throw new Error('canonical dromological observation matrix lost unimodularity');
  }
  const [m1, m2, m3] = observation;
  return freeze([
    m1,
    2 * m1 - m2,
    m2 - m3,
  ]);
}

export function inversePhasonicObservation(observation, schedule = PHASONIC_CANONICAL_SCHEDULE) {
  assertSchedule(schedule);
  const matrix = phasonicObservationMatrix(schedule);
  if (!same(schedule, PHASONIC_CANONICAL_SCHEDULE) || determinant3(matrix) !== 1) {
    throw new Error('bounded phasonic inverse is authorized only for the preregistered unimodular canonical schedule');
  }
  return inverseCanonicalPhasonicObservation(observation);
}

export function phasonicDromologicalTomographyCertificate() {
  const canonicalObservationMatrix = phasonicObservationMatrix(PHASONIC_CANONICAL_SCHEDULE);
  const hostileObservationMatrix = phasonicObservationMatrix(PHASONIC_HOSTILE_SCHEDULE);
  const canonicalDeterminant = determinant3(canonicalObservationMatrix);
  const hostileDeterminant = determinant3(hostileObservationMatrix);
  const canonicalHolonomy = phasonicFormalHolonomy(PHASONIC_CANONICAL_SCHEDULE);
  const hostileHolonomy = phasonicFormalHolonomy(PHASONIC_HOSTILE_SCHEDULE);
  const hostileNullObservation = matrixTimesVector(
    hostileObservationMatrix,
    PHASONIC_HOSTILE_NULL_VECTOR,
  );

  let checkedStates = 0;
  let canonicalExact = true;
  for (let x1 = -2; x1 <= 2; x1 += 1) {
    for (let x2 = -2; x2 <= 2; x2 += 1) {
      for (let x3 = -2; x3 <= 2; x3 += 1) {
        const state = [x1, x2, x3];
        const observation = observePhasonicState(state, PHASONIC_CANONICAL_SCHEDULE);
        const recovered = inverseCanonicalPhasonicObservation(observation);
        checkedStates += 1;
        if (!same(recovered, state)) canonicalExact = false;
      }
    }
  }

  const hostileCollisionLeft = freeze([0, 0, 0]);
  const hostileCollisionRight = freeze([1, 1, 0]);
  const hostileCollision = same(
    observePhasonicState(hostileCollisionLeft, PHASONIC_HOSTILE_SCHEDULE),
    observePhasonicState(hostileCollisionRight, PHASONIC_HOSTILE_SCHEDULE),
  );
  const canonicalSeparatesCollision = !same(
    observePhasonicState(hostileCollisionLeft, PHASONIC_CANONICAL_SCHEDULE),
    observePhasonicState(hostileCollisionRight, PHASONIC_CANONICAL_SCHEDULE),
  );

  const passed = canonicalDeterminant === 1
    && hostileDeterminant === 0
    && canonicalExact
    && checkedStates === 125
    && hostileNullObservation.every(value => value === 0)
    && hostileCollision
    && canonicalSeparatesCollision
    && !same(canonicalHolonomy, hostileHolonomy);

  return freeze({
    canonical_schedule: PHASONIC_CANONICAL_SCHEDULE,
    hostile_schedule: PHASONIC_HOSTILE_SCHEDULE,
    observation_aperture: PHASONIC_OBSERVATION_APERTURE,
    canonical_observation_matrix: canonicalObservationMatrix,
    hostile_observation_matrix: hostileObservationMatrix,
    canonical_determinant: canonicalDeterminant,
    hostile_determinant: hostileDeterminant,
    canonical_inverse_formula: freeze([
      'x1=m1',
      'x2=2*m1-m2',
      'x3=m2-m3',
    ]),
    finite_cube_checked_state_count: checkedStates,
    canonical_exact_reconstruction_on_finite_cube: canonicalExact,
    hostile_null_vector: PHASONIC_HOSTILE_NULL_VECTOR,
    hostile_null_observation: freeze(hostileNullObservation),
    hostile_collision_left: hostileCollisionLeft,
    hostile_collision_right: hostileCollisionRight,
    hostile_collision_established: hostileCollision,
    canonical_separates_hostile_collision_pair: canonicalSeparatesCollision,
    canonical_formal_holonomy: canonicalHolonomy,
    hostile_formal_holonomy: hostileHolonomy,
    formal_holonomy_order_defect: !same(canonicalHolonomy, hostileHolonomy),
    continuum_tomography_claim: false,
    physical_holonomy_claim: false,
    passed,
    classification: passed
      ? 'THE_SAME_THREE_STRATA_AND_THE_SAME_OBSERVATION_APERTURE_CAN_BE_TOMOGRAPHICALLY_INVERTIBLE_IN_ONE_TEMPORAL_ORDER_AND_NONIDENTIFIABLE_IN_ANOTHER'
      : 'DROMOLOGICAL_TOMOGRAPHY_ORDER_ANISOTROPY_NOT_ESTABLISHED',
    inverse_classification: passed
      ? 'THE_PREREGISTERED_PHI_HEX_ICOSAHEDRAL_DROMOLOGICAL_SCHEDULE_HAS_A_UNIMODULAR_OBSERVATION_MATRIX_AND_EXACTLY_RECONSTRUCTS_THE_INTEGER_PHASON_STATE_ON_THE_DECLARED_FIXTURE'
      : 'CANONICAL_BOUNDED_INVERSE_NOT_ESTABLISHED',
    holonomy_classification: passed
      ? 'THE_TRIPLE_OVERLAY_HAS_A_NONTRIVIAL_DROMOLOGICAL_FORMAL_HOLONOMY_ORDER_DEFECT_BECAUSE_THE_REGISTERED_ORDERED_PRODUCTS_DIFFER'
      : 'FORMAL_HOLONOMY_ORDER_DEFECT_NOT_ESTABLISHED',
  });
}

export function buildPhasonicSupermoireCupolaReceipt(
  state,
  schedule = PHASONIC_CANONICAL_SCHEDULE,
) {
  assertIntegerVector(state, 3, 'phasonic state');
  assertSchedule(schedule);
  const observation = observePhasonicState(state, schedule);
  return freeze({
    schema: PHASONIC_SUPERMOIRE_DROMOLOGICAL_TOMOGRAPHY_SCHEMA,
    custody_witness: PHASONIC_CUPOLA_CUSTODY_WITNESS,
    strata: freeze(PHASONIC_CANONICAL_SCHEDULE.map(id => freeze({
      id,
      carrier_vectors: PHASONIC_STRATA[id].carrier_vectors,
    }))),
    latent_phason_state: freeze([...state]),
    registered_schedule: freeze([...schedule]),
    observation: freeze([...observation]),
    authority: zeroAuthority(),
    research_only: true,
    runtime_binding: false,
  });
}

function childLegiblePayload(receipt) {
  return freeze({
    payload_schema: 'td613.dome-world.phasonic-supermoire-child-legible/v0.1',
    layers: freeze(PHASONIC_CANONICAL_SCHEDULE.map(id => freeze({
      id,
      explanation: PHASONIC_STRATA[id].child_copy,
    }))),
    cupola: 'three layers make a pattern that remembers order',
    order_verdict: 'ORDER_MATTERS',
    exact_inverse_visible: false,
    technical_matrices_visible: false,
    latent_state_visible: false,
  });
}

function loomTechnicalPayload(receipt) {
  const schedule = receipt.registered_schedule;
  const matrix = phasonicObservationMatrix(schedule);
  return freeze({
    payload_schema: 'td613.dome-world.phasonic-supermoire-loom-technical/v0.1',
    carrier_basis: PHASONIC_CARRIER_BASIS,
    carrier_registry: freeze(PHASONIC_CANONICAL_SCHEDULE.map(id => freeze({
      id,
      vectors: PHASONIC_STRATA[id].carrier_vectors,
    }))),
    registered_schedule: schedule,
    observation_aperture: PHASONIC_OBSERVATION_APERTURE,
    observation_matrix: matrix,
    observation: receipt.observation,
    determinant: determinant3(matrix),
    formal_holonomy: phasonicFormalHolonomy(schedule),
    bounded_inverse_authorized: same(schedule, PHASONIC_CANONICAL_SCHEDULE)
      && determinant3(matrix) === 1,
    continuum_inverse_authorized: false,
    physical_holonomy_authorized: false,
  });
}

export function compilePhasonicAiaReceiverProjection(receipt, receiver) {
  if (receipt?.schema !== PHASONIC_SUPERMOIRE_DROMOLOGICAL_TOMOGRAPHY_SCHEMA) {
    throw new Error('undeclared phasonic supermoire cupola receipt schema');
  }
  if (!same(receipt.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS)) {
    throw new Error('phasonic cupola custody witness drift');
  }
  if (Object.values(receipt.authority ?? {}).some(Boolean) || receipt.runtime_binding === true) {
    throw new Error('phasonic cupola source authority widening rejected');
  }

  let receiverPayload;
  if (receiver === AIA_RECEIVERS.ASH) {
    receiverPayload = childLegiblePayload(receipt);
  } else if (receiver === AIA_RECEIVERS.LOOM) {
    receiverPayload = loomTechnicalPayload(receipt);
  } else {
    throw new Error(`undeclared AIA receiver: ${receiver}`);
  }

  return freeze({
    schema: 'td613.dome-world.phasonic-supermoire-aia-projection/v0.1',
    receiver,
    custody_witness: receipt.custody_witness,
    receiver_payload: receiverPayload,
    authority: zeroAuthority(),
    runtime_binding: false,
    claim_ceiling: freeze({
      child_legible_order_truth: true,
      bounded_fixture_inverse: receiver === AIA_RECEIVERS.LOOM,
      latent_state_disclosure: false,
      continuum_tomography: false,
      physical_holonomy: false,
      physical_quasicrystal: false,
      cross_stratum_encoder: false,
      production: false,
    }),
  });
}

export function reconstructPhasonicStateFromLoomProjection(projection) {
  if (projection?.receiver !== AIA_RECEIVERS.LOOM) {
    throw new Error('bounded phasonic tomography inverse requires the Loom technical receiver');
  }
  if (!same(projection.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS)) {
    throw new Error('Loom projection custody witness drift');
  }
  if (projection.receiver_payload?.bounded_inverse_authorized !== true) {
    throw new Error('Loom projection does not carry a preregistered invertible schedule');
  }
  return inversePhasonicObservation(
    projection.receiver_payload.observation,
    projection.receiver_payload.registered_schedule,
  );
}

export function phasonicAiaTomographyAggregateCertificate() {
  const carrier = phasonicCarrierIncommensurabilityCertificate();
  const tomography = phasonicDromologicalTomographyCertificate();
  let projectionCount = 0;
  let custodyInvariant = true;
  let loomExact = true;
  let ashPayloadInvariant = true;
  let canonicalAshKey = null;

  for (let x1 = -2; x1 <= 2; x1 += 1) {
    for (let x2 = -2; x2 <= 2; x2 += 1) {
      for (let x3 = -2; x3 <= 2; x3 += 1) {
        const state = [x1, x2, x3];
        const receipt = buildPhasonicSupermoireCupolaReceipt(state);
        const ash = compilePhasonicAiaReceiverProjection(receipt, AIA_RECEIVERS.ASH);
        const loom = compilePhasonicAiaReceiverProjection(receipt, AIA_RECEIVERS.LOOM);
        const recovered = reconstructPhasonicStateFromLoomProjection(loom);
        projectionCount += 1;
        if (!same(ash.custody_witness, loom.custody_witness)) custodyInvariant = false;
        if (!same(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS)) custodyInvariant = false;
        if (!same(recovered, state)) loomExact = false;
        const ashKey = JSON.stringify(ash.receiver_payload);
        if (canonicalAshKey === null) canonicalAshKey = ashKey;
        if (ashKey !== canonicalAshKey) ashPayloadInvariant = false;
      }
    }
  }

  const sample = buildPhasonicSupermoireCupolaReceipt([1, -1, 2]);
  const ashSample = compilePhasonicAiaReceiverProjection(sample, AIA_RECEIVERS.ASH);
  const loomSample = compilePhasonicAiaReceiverProjection(sample, AIA_RECEIVERS.LOOM);
  const ashText = JSON.stringify(ashSample.receiver_payload);
  const ashLeaksTechnicalInverse = [
    'observation_matrix',
    'formal_holonomy',
    'bounded_inverse_authorized',
    'latent_phason_state',
    'x1=m1',
  ].some(token => ashText.includes(token));

  const passed = carrier.passed
    && tomography.passed
    && projectionCount === 125
    && custodyInvariant
    && loomExact
    && ashPayloadInvariant
    && !ashLeaksTechnicalInverse
    && ashSample.receiver_payload.order_verdict === 'ORDER_MATTERS'
    && loomSample.receiver_payload.bounded_inverse_authorized === true
    && Object.values(ashSample.authority).every(value => value === false)
    && Object.values(loomSample.authority).every(value => value === false);

  return freeze({
    parent_receipt: PHASONIC_SUPERMOIRE_DROMOLOGICAL_TOMOGRAPHY_PARENT_RECEIPT,
    carrier,
    tomography,
    finite_projection_state_count: projectionCount,
    custody_witness_receiver_invariant: custodyInvariant,
    loom_exact_reconstruction_on_finite_cube: loomExact,
    ash_child_payload_invariant_across_latent_cube: ashPayloadInvariant,
    ash_exposes_order_matters_truth: ashSample.receiver_payload.order_verdict === 'ORDER_MATTERS',
    ash_leaks_technical_inverse: ashLeaksTechnicalInverse,
    loom_bounded_inverse_authorized: loomSample.receiver_payload.bounded_inverse_authorized,
    authority_widening: false,
    passed,
    classification: passed
      ? 'A_CHILD_LEGIBLE_ANISOTROPIC_INFORMATION_ARCHITECTURE_CAN_HOST_A_TRIPLE_HETEROSTRATIGRAPHIC_PHASONIC_SUPERMOIRE_TOMOGRAPHY_FIXTURE_IN_WHICH_EXACT_CUSTODY_IS_RECEIVER_INVARIANT_THE_CANONICAL_PHI_HEX_ICOSAHEDRAL_TEMPORAL_ORDER_IS_UNIMODULARLY_INVERTIBLE_A_HOSTILE_PERMUTATION_IS_NONIDENTIFIABLE_AND_THE_FORMAL_HOLONOMY_PRODUCT_IS_ORDER_SENSITIVE_WITH_ZERO_AUTHORITY_WIDENING'
      : 'PHASONIC_SUPERMOIRE_DROMOLOGICAL_HOLONOMY_TOMOGRAPHY_NOT_ESTABLISHED',
    scars: freeze([
      'SAME_STRATA != SAME_TOMOGRAPHIC_RECOVERABILITY',
      'SAME_APERTURE != SAME_DROMOLOGICAL_INFORMATION',
      'TEMPORAL_PERMUTATION != INFORMATION_PRESERVING_REORDERING',
      'FORMAL_ORDERED_MATRIX_HOLONOMY != PHYSICAL_OR_GEOMETRIC_HOLONOMY',
      'BOUNDED_EXACT_INTEGER_INVERSE != CONTINUUM_TOMOGRAPHY_INVERSE',
      'CHILD_LEGIBLE_TRUTH != TECHNICAL_SOURCE_RECONSTRUCTION',
      'ORDER_MATTERS_TRUTH != INVERSE_FORMULA_DISCLOSURE',
      'RECEIVER_INDEXED_TOMOGRAPHY != AUTHORITY_WIDENING',
    ]),
  });
}

export function rejectPhasonicTomographyOverreach(candidate) {
  const authorityWidened = Object.values(candidate?.authority ?? {}).some(Boolean);
  const runtime = candidate?.runtime_binding === true;
  const continuum = candidate?.claim_ceiling?.continuum_tomography === true;
  const physicalHolonomy = candidate?.claim_ceiling?.physical_holonomy === true;
  const physicalQuasicrystal = candidate?.claim_ceiling?.physical_quasicrystal === true;
  const encoder = candidate?.claim_ceiling?.cross_stratum_encoder === true;
  const production = candidate?.claim_ceiling?.production === true;
  const ashTechnicalLeak = candidate?.receiver === AIA_RECEIVERS.ASH && (
    candidate?.receiver_payload?.observation_matrix !== undefined
    || candidate?.receiver_payload?.formal_holonomy !== undefined
    || candidate?.receiver_payload?.bounded_inverse_authorized === true
    || candidate?.receiver_payload?.latent_phason_state !== undefined
  );

  const accepted = !authorityWidened
    && !runtime
    && !continuum
    && !physicalHolonomy
    && !physicalQuasicrystal
    && !encoder
    && !production
    && !ashTechnicalLeak;

  return freeze({
    accepted,
    authority_widened: authorityWidened,
    runtime_binding_attempted: runtime,
    continuum_tomography_claimed: continuum,
    physical_holonomy_claimed: physicalHolonomy,
    physical_quasicrystal_claimed: physicalQuasicrystal,
    cross_stratum_encoder_claimed: encoder,
    production_claimed: production,
    ash_technical_inverse_leak: ashTechnicalLeak,
    classification: accepted
      ? 'PHASONIC_TOMOGRAPHY_BOUNDARY_PRESERVED'
      : 'PHASONIC_TOMOGRAPHY_OVERREACH_REJECTED',
  });
}
