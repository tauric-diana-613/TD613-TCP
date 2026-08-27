import assert from 'node:assert/strict';

import {
  PHASONIC_SUPERMOIRE_DROMOLOGICAL_TOMOGRAPHY_PARENT_RECEIPT,
  PHASONIC_CARRIER_BASIS,
  PHASONIC_STRATA,
  PHASONIC_OPERATORS,
  PHASONIC_CANONICAL_SCHEDULE,
  PHASONIC_HOSTILE_SCHEDULE,
  PHASONIC_OBSERVATION_APERTURE,
  PHASONIC_HOSTILE_NULL_VECTOR,
  PHASONIC_CUPOLA_CUSTODY_WITNESS,
  phasonicCarrierIncommensurabilityCertificate,
  phasonicObservationMatrix,
  phasonicFormalHolonomy,
  observePhasonicState,
  inverseCanonicalPhasonicObservation,
  inversePhasonicObservation,
  phasonicDromologicalTomographyCertificate,
  buildPhasonicSupermoireCupolaReceipt,
  compilePhasonicAiaReceiverProjection,
  reconstructPhasonicStateFromLoomProjection,
  phasonicAiaTomographyAggregateCertificate,
  rejectPhasonicTomographyOverreach,
} from '../app/dome-world/previews/a15-r0/phasonic-supermoire-dromological-tomography.js';

const PARENT_798_RECEIPT = '9c92b4269fe2cd277799d8e885caf7765cbdfecb';
const ASH = 'ASH_KEEP_CHILD';
const LOOM = 'HOLONOMY_LOOM_TECHNICAL';

assert.equal(
  PHASONIC_SUPERMOIRE_DROMOLOGICAL_TOMOGRAPHY_PARENT_RECEIPT,
  PARENT_798_RECEIPT,
  'phasonic tomography chamber must pin the exact witnessed #798 AIA receipt',
);

assert.deepEqual(PHASONIC_CARRIER_BASIS, [
  '1',
  'sqrt(3)',
  'phi',
  'phi*sqrt(3)',
]);
assert.equal(PHASONIC_CARRIER_BASIS.length, 4);
assert.deepEqual(PHASONIC_STRATA.PHI_PAIR_WIRE.carrier_vectors, [
  [1, 0, 0, 0],
  [0, 0, 1, 0],
]);
assert.deepEqual(PHASONIC_STRATA.HEXAGONAL_MOIRE.carrier_vectors, [[0, 1, 0, 0]]);
assert.deepEqual(PHASONIC_STRATA.ICOSAHEDRAL_PHASON.carrier_vectors, [[0, 0, 0, 1]]);

const carrier = phasonicCarrierIncommensurabilityCertificate();
assert.equal(carrier.passed, true);
assert.equal(carrier.basis_rank, 4);
assert.equal(carrier.total_occupied_rank, 4);
assert.equal(carrier.pairwise.length, 3);
assert.equal(
  carrier.pairwise.every(row => row.coordinate_overlap.length === 0),
  true,
  'declared carrier submodules must occupy disjoint exact basis coordinates',
);
assert.equal(carrier.physical_quasicrystal_claim, false);
assert.equal(carrier.complete_geometric_realization_claim, false);
assert.equal(
  carrier.classification,
  'THE_DECLARED_PHI_PAIR_WIRE_HEXAGONAL_MOIRE_AND_ICOSAHEDRAL_PHASON_CARRIER_MODULES_ARE_PAIRWISE_INCOMMENSURABLE_INSIDE_THE_PREREGISTERED_FREE_RANK_FOUR_ALGEBRAIC_COORDINATE_FIXTURE',
);

assert.equal(Object.isFrozen(PHASONIC_CARRIER_BASIS), true);
assert.equal(Object.isFrozen(PHASONIC_STRATA), true);
assert.equal(Object.isFrozen(PHASONIC_OPERATORS), true);

assert.deepEqual(PHASONIC_OPERATORS.PHI_PAIR_WIRE, [
  [1, 0, 0],
  [-1, 1, 0],
  [0, 0, 1],
]);
assert.deepEqual(PHASONIC_OPERATORS.HEXAGONAL_MOIRE, [
  [1, -1, 0],
  [0, 1, 0],
  [0, 0, 1],
]);
assert.deepEqual(PHASONIC_OPERATORS.ICOSAHEDRAL_PHASON, [
  [1, 0, -1],
  [0, 1, 0],
  [0, 0, 1],
]);
assert.deepEqual(PHASONIC_OBSERVATION_APERTURE, [1, 0, 0]);
assert.deepEqual(PHASONIC_HOSTILE_NULL_VECTOR, [1, 1, 0]);

assert.deepEqual(PHASONIC_CANONICAL_SCHEDULE, [
  'PHI_PAIR_WIRE',
  'HEXAGONAL_MOIRE',
  'ICOSAHEDRAL_PHASON',
]);
assert.deepEqual(PHASONIC_HOSTILE_SCHEDULE, [
  'HEXAGONAL_MOIRE',
  'PHI_PAIR_WIRE',
  'ICOSAHEDRAL_PHASON',
]);

const canonicalObservationMatrix = phasonicObservationMatrix(PHASONIC_CANONICAL_SCHEDULE);
const hostileObservationMatrix = phasonicObservationMatrix(PHASONIC_HOSTILE_SCHEDULE);
assert.deepEqual(canonicalObservationMatrix, [
  [1, 0, 0],
  [2, -1, 0],
  [2, -1, -1],
]);
assert.deepEqual(hostileObservationMatrix, [
  [1, -1, 0],
  [1, -1, 0],
  [1, -1, -1],
]);

assert.deepEqual(phasonicFormalHolonomy(PHASONIC_CANONICAL_SCHEDULE), [
  [2, -1, -1],
  [-1, 1, 0],
  [0, 0, 1],
]);
assert.deepEqual(phasonicFormalHolonomy(PHASONIC_HOSTILE_SCHEDULE), [
  [1, -1, -1],
  [-1, 2, 0],
  [0, 0, 1],
]);
assert.notDeepEqual(
  phasonicFormalHolonomy(PHASONIC_CANONICAL_SCHEDULE),
  phasonicFormalHolonomy(PHASONIC_HOSTILE_SCHEDULE),
  'temporal permutation must not be laundered into holonomy equality',
);

const sampleState = [1, -1, 2];
const sampleObservation = observePhasonicState(sampleState, PHASONIC_CANONICAL_SCHEDULE);
assert.deepEqual(sampleObservation, [1, 3, 1]);
assert.deepEqual(inverseCanonicalPhasonicObservation(sampleObservation), sampleState);
assert.deepEqual(
  inversePhasonicObservation(sampleObservation, PHASONIC_CANONICAL_SCHEDULE),
  sampleState,
);
assert.throws(
  () => inversePhasonicObservation(
    observePhasonicState(sampleState, PHASONIC_HOSTILE_SCHEDULE),
    PHASONIC_HOSTILE_SCHEDULE,
  ),
  /authorized only for the preregistered unimodular canonical schedule/,
  'rank-deficient hostile schedule may not inherit canonical inverse authority',
);

assert.deepEqual(
  observePhasonicState([0, 0, 0], PHASONIC_HOSTILE_SCHEDULE),
  observePhasonicState([1, 1, 0], PHASONIC_HOSTILE_SCHEDULE),
  'hostile schedule must exhibit the preregistered null collision',
);
assert.notDeepEqual(
  observePhasonicState([0, 0, 0], PHASONIC_CANONICAL_SCHEDULE),
  observePhasonicState([1, 1, 0], PHASONIC_CANONICAL_SCHEDULE),
  'canonical schedule must separate the hostile collision pair',
);

const tomography = phasonicDromologicalTomographyCertificate();
assert.equal(tomography.passed, true);
assert.equal(tomography.canonical_determinant, 1);
assert.equal(tomography.hostile_determinant, 0);
assert.equal(tomography.finite_cube_checked_state_count, 125);
assert.equal(tomography.canonical_exact_reconstruction_on_finite_cube, true);
assert.deepEqual(tomography.hostile_null_observation, [0, 0, 0]);
assert.equal(tomography.hostile_collision_established, true);
assert.equal(tomography.canonical_separates_hostile_collision_pair, true);
assert.equal(tomography.formal_holonomy_order_defect, true);
assert.equal(tomography.continuum_tomography_claim, false);
assert.equal(tomography.physical_holonomy_claim, false);
assert.equal(
  tomography.classification,
  'THE_SAME_THREE_STRATA_AND_THE_SAME_OBSERVATION_APERTURE_CAN_BE_TOMOGRAPHICALLY_INVERTIBLE_IN_ONE_TEMPORAL_ORDER_AND_NONIDENTIFIABLE_IN_ANOTHER',
);

const canonicalReceipt = buildPhasonicSupermoireCupolaReceipt(sampleState);
const ash = compilePhasonicAiaReceiverProjection(canonicalReceipt, ASH);
const loom = compilePhasonicAiaReceiverProjection(canonicalReceipt, LOOM);
assert.deepEqual(ash.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(loom.custody_witness, PHASONIC_CUPOLA_CUSTODY_WITNESS);
assert.deepEqual(ash.custody_witness, loom.custody_witness);
assert.equal(ash.receiver_payload.order_verdict, 'ORDER_MATTERS');
assert.equal(ash.receiver_payload.exact_inverse_visible, false);
assert.equal(ash.receiver_payload.technical_matrices_visible, false);
assert.equal(ash.receiver_payload.latent_state_visible, false);
assert.equal('observation_matrix' in ash.receiver_payload, false);
assert.equal('formal_holonomy' in ash.receiver_payload, false);
assert.equal('bounded_inverse_authorized' in ash.receiver_payload, false);
assert.equal('latent_phason_state' in ash.receiver_payload, false);
assert.equal(loom.receiver_payload.bounded_inverse_authorized, true);
assert.equal(loom.receiver_payload.continuum_inverse_authorized, false);
assert.equal(loom.receiver_payload.physical_holonomy_authorized, false);
assert.deepEqual(reconstructPhasonicStateFromLoomProjection(loom), sampleState);
assert.throws(
  () => reconstructPhasonicStateFromLoomProjection(ash),
  /requires the Loom technical receiver/,
);
assert.equal(Object.values(ash.authority).every(value => value === false), true);
assert.equal(Object.values(loom.authority).every(value => value === false), true);

const hostileReceipt = buildPhasonicSupermoireCupolaReceipt(sampleState, PHASONIC_HOSTILE_SCHEDULE);
const hostileLoom = compilePhasonicAiaReceiverProjection(hostileReceipt, LOOM);
assert.equal(hostileLoom.receiver_payload.determinant, 0);
assert.equal(hostileLoom.receiver_payload.bounded_inverse_authorized, false);
assert.throws(
  () => reconstructPhasonicStateFromLoomProjection(hostileLoom),
  /does not carry a preregistered invertible schedule/,
);

const aggregate = phasonicAiaTomographyAggregateCertificate();
assert.equal(aggregate.passed, true);
assert.equal(aggregate.parent_receipt, PARENT_798_RECEIPT);
assert.equal(aggregate.finite_projection_state_count, 125);
assert.equal(aggregate.custody_witness_receiver_invariant, true);
assert.equal(aggregate.loom_exact_reconstruction_on_finite_cube, true);
assert.equal(aggregate.ash_child_payload_invariant_across_latent_cube, true);
assert.equal(aggregate.ash_exposes_order_matters_truth, true);
assert.equal(aggregate.ash_leaks_technical_inverse, false);
assert.equal(aggregate.loom_bounded_inverse_authorized, true);
assert.equal(aggregate.authority_widening, false);
assert.equal(
  aggregate.classification,
  'A_CHILD_LEGIBLE_ANISOTROPIC_INFORMATION_ARCHITECTURE_CAN_HOST_A_TRIPLE_HETEROSTRATIGRAPHIC_PHASONIC_SUPERMOIRE_TOMOGRAPHY_FIXTURE_IN_WHICH_EXACT_CUSTODY_IS_RECEIVER_INVARIANT_THE_CANONICAL_PHI_HEX_ICOSAHEDRAL_TEMPORAL_ORDER_IS_UNIMODULARLY_INVERTIBLE_A_HOSTILE_PERMUTATION_IS_NONIDENTIFIABLE_AND_THE_FORMAL_HOLONOMY_PRODUCT_IS_ORDER_SENSITIVE_WITH_ZERO_AUTHORITY_WIDENING',
);

assert.equal(rejectPhasonicTomographyOverreach(ash).accepted, true);
assert.equal(rejectPhasonicTomographyOverreach(loom).accepted, true);

for (const [label, forged] of [
  ['authority widening', { ...loom, authority: { ...loom.authority, inverse: true } }],
  ['runtime widening', { ...loom, runtime_binding: true }],
  ['continuum laundering', { ...loom, claim_ceiling: { ...loom.claim_ceiling, continuum_tomography: true } }],
  ['physical holonomy laundering', { ...loom, claim_ceiling: { ...loom.claim_ceiling, physical_holonomy: true } }],
  ['physical quasicrystal laundering', { ...loom, claim_ceiling: { ...loom.claim_ceiling, physical_quasicrystal: true } }],
  ['cross-stratum encoder laundering', { ...loom, claim_ceiling: { ...loom.claim_ceiling, cross_stratum_encoder: true } }],
  ['production laundering', { ...loom, claim_ceiling: { ...loom.claim_ceiling, production: true } }],
  ['Ash matrix leak', {
    ...ash,
    receiver_payload: { ...ash.receiver_payload, observation_matrix: canonicalObservationMatrix },
  }],
  ['Ash holonomy leak', {
    ...ash,
    receiver_payload: { ...ash.receiver_payload, formal_holonomy: phasonicFormalHolonomy() },
  }],
  ['Ash inverse leak', {
    ...ash,
    receiver_payload: { ...ash.receiver_payload, bounded_inverse_authorized: true },
  }],
  ['Ash latent-state leak', {
    ...ash,
    receiver_payload: { ...ash.receiver_payload, latent_phason_state: sampleState },
  }],
]) {
  assert.equal(
    rejectPhasonicTomographyOverreach(forged).accepted,
    false,
    `${label} must be rejected`,
  );
}

assert.throws(
  () => compilePhasonicAiaReceiverProjection(canonicalReceipt, 'UNDECLARED_RECEIVER'),
  /undeclared AIA receiver/,
);
assert.throws(
  () => phasonicObservationMatrix(['PHI_PAIR_WIRE', 'PHI_PAIR_WIRE', 'ICOSAHEDRAL_PHASON']),
  /permutation of the declared triple stratum family/,
);
assert.throws(
  () => buildPhasonicSupermoireCupolaReceipt([1, 2, 3.5]),
  /integer vector/,
);
assert.throws(
  () => compilePhasonicAiaReceiverProjection(
    { ...canonicalReceipt, custody_witness: { ...PHASONIC_CUPOLA_CUSTODY_WITNESS, fixture_id: 'forged' } },
    ASH,
  ),
  /custody witness drift/,
);
assert.throws(
  () => compilePhasonicAiaReceiverProjection(
    { ...canonicalReceipt, authority: { ...canonicalReceipt.authority, release: true } },
    ASH,
  ),
  /source authority widening rejected/,
);

console.log('Ash A15-R0 phasonic supermoire dromological holonomy tomography hostile tests passed.');
