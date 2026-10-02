import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LOOM_INSTRUMENT_LAB_SCHEMA,
  LOOM_INSTRUMENT_BENCHES,
  LOOM_INSTRUMENT_DONORS,
  FIXED_RECEIVER_SWAP_FIELDS,
  registerRouteObservation,
  registerCarrierObservation,
  registerReceiverObservation,
  validateReceiverSwapDesign,
  measureConditionalInformationGain,
  registerInformationGainClaim,
  intakeIndependentObservation,
  prepareSameEpisodeAcquisition,
  auditLoomInstrumentLab
} from '../app/engine/loom-instrument-lab.js';

// Fictional proving inputs live here, outside the shared instrument engine.
const routeInput = () => ({
  metric: 'synthetic score', baseline: 0.9,
  observations: [{ route_id: 'unchanged', value: 0.9 }, { route_id: 'summary', value: 0.3 }]
});
const carrierInput = () => ({ carriers: [
  { carrier_id: 'planning', layer: 'process', observed: true },
  { carrier_id: 'reply', layer: 'content', observed: false }
] });
const receiverInput = () => ({ observations: ['receiver-a', 'receiver-b'].map((receiver_apparatus_id, index) => ({
  receiver_apparatus_id,
  artifact_digest: 'synthetic:artifact', route_digest: 'synthetic:route', carrier_id: 'content',
  metric: 'synthetic score', value: index ? 0.4 : 0.8
})) });
const sharedSwapCoordinates = () => ({
  artifact_digest: 'synthetic:artifact', route_digest: 'synthetic:route', carrier_id: 'content',
  provenance_state_digest: 'synthetic:state', source_custody_digest: 'synthetic:custody',
  observation_window_id: 'synthetic:window'
});
const swapInput = () => ({
  left: { ...sharedSwapCoordinates(), receiver_apparatus_id: 'receiver-a' },
  right: { ...sharedSwapCoordinates(), receiver_apparatus_id: 'receiver-b' }
});
const gainClaimInput = () => ({
  admitted_record_information_bits: 0, candidate_witness_information_bits: 1000,
  conditional_on_admitted_record: true, derived_from_admitted_record: false,
  independently_governed: true, shares_upstream_source: false,
  externally_measured: true, bound_to_exact_target_episode: true
});
const witnessInput = () => ({
  source_id: 'synthetic:source', source_revision: 'synthetic:revision', episode_id: 'synthetic:episode',
  custody_reference: 'synthetic:custody', measurement_reference: 'synthetic:measurement',
  comparison_frame_id: 'synthetic:frame', derived_from_admitted_record: false,
  independently_governed: true, shares_upstream_source: false
});
const acquisitionInput = () => ({
  episode_id: 'synthetic:episode', comparison_frame_id: 'synthetic:frame',
  common_departure_id: 'synthetic:departure', custody_plan_reference: 'synthetic:custody-plan',
  preregistration_reference: 'synthetic:preregistration', immutable_episode: true,
  continuous_custody: true, measurements_present: false,
  routes: [
    { route_id: 'control', role: 'CONTROL', return_observation_id: 'return-c' },
    { route_id: 'protected', role: 'PROTECTED', return_observation_id: 'return-p' }
  ],
  surfaces: { L: 'synthetic:L-plan', R: 'synthetic:R-plan', J: 'synthetic:J-plan', G: 'synthetic:G-plan', C: 'synthetic:C-plan' }
});
const positiveJoint = () => [
  { origin: 'origin-a', record: 'same-record', witness: 'a', probability: 0.4 },
  { origin: 'origin-a', record: 'same-record', witness: 'b', probability: 0.1 },
  { origin: 'origin-b', record: 'same-record', witness: 'a', probability: 0.1 },
  { origin: 'origin-b', record: 'same-record', witness: 'b', probability: 0.4 }
];
const assertCeilings = result => {
  assert.equal(result.schema, LOOM_INSTRUMENT_LAB_SCHEMA);
  assert.ok(['LAB_RESULT', 'DESIGN_READY', 'HELD', 'INADMISSIBLE'].includes(result.status));
  assert.equal(result.evidence_class, 'LOCAL_ANALYSIS_OF_DECLARED_INPUT');
  assert.equal(result.research_lineage, 'WESTERN_HORIZON');
  assert.equal(result.source_authentication, 'NOT_PERFORMED');
  assert.deepEqual(result.authority, { lab_analysis: true, loom_admission: false, consequential_execution: false, empirical_claim: false });
  for (const field of ['live_loom_mutated', 'externally_measured', 'origin_truth_established', 'empirical_target_exteriority_established', 'golden_egg_earned']) assert.equal(result[field], false, field);
  assert.equal(result.golden_egg_credit, 0);
  assert.ok(Object.isFrozen(result));
  assert.ok(Object.isFrozen(result.authority));
};
const rejected = (result, error) => {
  assertCeilings(result);
  assert.equal(result.status, 'INADMISSIBLE');
  if (error) assert.ok(result.errors.includes(error), `${error}: ${result.errors.join(', ')}`);
};

test('inventory carries public methods and separate role contracts without promotion', () => {
  assert.deepEqual(LOOM_INSTRUMENT_BENCHES.map(item => item.id), ['route', 'carrier', 'receiver', 'receiver-substitution', 'witness', 'information-gain', 'acquisition']);
  assert.deepEqual(LOOM_INSTRUMENT_DONORS.map(item => item.source), ['#1003', '#1004', '#1005', '#1006', '#1007']);
  const result = auditLoomInstrumentLab();
  assertCeilings(result);
  assert.equal(result.third_party_source_code_imported, false);
  assert.equal(result.private_material_imported, false);
  assert.equal(result.role_agreement_is_evidence_multiplication, false);
  assert.equal(result.empirical_exteriority_earned_by_installation, false);
  assert.equal(result.golden_egg_earned_by_installation, false);
  assert.deepEqual(result.roles.map(item => item.role), ['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT']);
  assert.ok(Object.isFrozen(LOOM_INSTRUMENT_BENCHES[0]));
});

test('route differences remain supplied observations rather than causal or origin results', () => {
  const input = routeInput(), before = structuredClone(input);
  const result = registerRouteObservation(input);
  assertCeilings(result);
  assert.equal(result.status, 'LAB_RESULT');
  assert.equal(result.route_sensitivity_observed_in_supplied_measurements, true);
  assert.equal(result.causal_route_effect_established, false);
  assert.equal(result.universal_route_law, false);
  assert.ok(Math.abs(result.observations[1].delta_from_baseline + 0.6) < 1e-12);
  assert.deepEqual(input, before);
  assert.equal(Object.isFrozen(input.observations[0]), false);
  input.observations[0].value = 12;
  assert.equal(result.observations[0].value, 0.9);
  assert.equal(registerRouteObservation({ ...routeInput(), observations: [{ route_id: 'same', value: 0.9 }] }).route_sensitivity_observed_in_supplied_measurements, false);
  rejected(registerRouteObservation({ ...routeInput(), observations: [{ route_id: 'x', value: 1 }, { route_id: 'x', value: 2 }] }), 'DISTINCT_ROUTE_IDS_REQUIRED');
  rejected(registerRouteObservation({ metric: 'x', baseline: -Number.MAX_VALUE, observations: [{ route_id: 'x', value: Number.MAX_VALUE }] }), 'FINITE_ROUTE_DELTA_REQUIRED');
});

test('process and content observations cannot collapse into one carrier or inferred independence', () => {
  const result = registerCarrierObservation(carrierInput());
  assertCeilings(result);
  assert.equal(result.status, 'LAB_RESULT');
  assert.equal(result.distinct_carrier_layers_declared, true);
  assert.equal(result.scalar_proxy_allowed, false);
  assert.equal(result.carrier_independence_established, false);
  assert.equal(result.process_identifiability_established, false);
  assert.equal(result.carriers[1].observed, false);
  const input = carrierInput();
  delete input.carriers[1].observed;
  rejected(registerCarrierObservation(input), 'OBSERVED_STATE_REQUIRED');
  input.carriers[1].observed = 'true';
  rejected(registerCarrierObservation(input), 'OBSERVED_STATE_REQUIRED');
  input.carriers[1] = { ...input.carriers[0] };
  rejected(registerCarrierObservation(input), 'DISTINCT_CARRIER_IDS_REQUIRED');
});

test('receiver score comparison stays local and explicitly holds coordinate drift', () => {
  const result = registerReceiverObservation(receiverInput());
  assertCeilings(result);
  assert.equal(result.status, 'LAB_RESULT');
  assert.equal(result.same_comparison_coordinates_declared, true);
  assert.equal(result.supplied_score_difference, 0.4);
  assert.equal(result.causal_receiver_effect_established, false);
  assert.equal(result.independent_receiver_execution_observed, false);
  assert.deepEqual(result.unqualified_coordinates, ['provenance_state', 'source_custody', 'observation_window']);
  for (const field of result.comparison_coordinates) {
    const input = receiverInput();
    input.observations[1][field] = 'synthetic:drift';
    const held = registerReceiverObservation(input);
    assertCeilings(held);
    assert.equal(held.status, 'HELD', field);
    assert.deepEqual(held.comparison_mismatches, [field]);
    assert.equal(held.same_comparison_coordinates_declared, false);
    assert.equal(held.supplied_score_difference, null);
  }
  const duplicate = receiverInput();
  duplicate.observations[1].receiver_apparatus_id = duplicate.observations[0].receiver_apparatus_id;
  rejected(registerReceiverObservation(duplicate), 'DISTINCT_RECEIVER_APPARATUS_REQUIRED');
  const overflow = receiverInput();
  overflow.observations[0].value = -Number.MAX_VALUE;
  overflow.observations[1].value = Number.MAX_VALUE;
  const invalid = registerReceiverObservation(overflow);
  rejected(invalid, 'FINITE_RECEIVER_DIFFERENCE_REQUIRED');
  assert.equal(invalid.supplied_score_difference, null);
});

test('receiver substitution fixes artifact, path, carrier, provenance, custody and time', () => {
  const input = swapInput(), result = validateReceiverSwapDesign(input);
  assertCeilings(result);
  assert.equal(result.status, 'DESIGN_READY');
  assert.deepEqual(result.fixed_coordinates, FIXED_RECEIVER_SWAP_FIELDS);
  assert.deepEqual(result.left, input.left);
  assert.deepEqual(result.right, input.right);
  assert.equal(result.sole_allowed_difference, 'RECEIVER_APPARATUS');
  assert.equal(result.receiver_effect_observed, false);
  assert.equal(result.causal_effect_estimated, false);
  assert.equal(result.next_gate, 'FIRE_GATE_REVIEW_REQUIRED');
  for (const field of FIXED_RECEIVER_SWAP_FIELDS) {
    const drift = swapInput();
    drift.right[field] = 'synthetic:drift';
    rejected(validateReceiverSwapDesign(drift), `${field.toUpperCase()}_MUST_REMAIN_FIXED`);
  }
  const same = swapInput();
  same.right.receiver_apparatus_id = same.left.receiver_apparatus_id;
  rejected(validateReceiverSwapDesign(same), 'DISTINCT_RECEIVER_APPARATUS_REQUIRED');
  const extra = swapInput();
  extra.right.response_value = 0.9;
  rejected(validateReceiverSwapDesign(extra), 'UNDECLARED_SWAP_COORDINATE');
  rejected(validateReceiverSwapDesign({ ...swapInput(), measurements_present: true }), 'PREREGISTRATION_MUST_PRECEDE_MEASUREMENT');
  rejected(validateReceiverSwapDesign({ ...swapInput(), empirical_receiver_outcomes: [0.8, 0.4] }), 'EMPIRICAL_OUTCOMES_MUST_REMAIN_EMPTY');
});

test('conditional information is computed from the finite joint model', () => {
  const input = { distribution: positiveJoint(), derived_from_admitted_record: false };
  const before = structuredClone(input), result = measureConditionalInformationGain(input);
  assertCeilings(result);
  const binaryEntropy = -(0.8 * Math.log2(0.8) + 0.2 * Math.log2(0.2));
  assert.equal(result.status, 'LAB_RESULT');
  assert.ok(Math.abs(result.conditional_information_bits - (1 - binaryEntropy)) < 1e-12);
  assert.equal(result.positive_in_declared_model, true);
  assert.equal(result.empirical_information_gain_measured, false);
  assert.equal(result.independent_source_qualified, false);
  assert.deepEqual(input, before);
  assert.equal(Object.isFrozen(input.distribution[0]), false);
});

test('deterministic reuse of the record has zero additional information despite positive marginal association', () => {
  const result = measureConditionalInformationGain({ derived_from_admitted_record: true, distribution: [
    { origin: 'a', record: 'a', witness: 'copied-a', probability: 0.3 },
    { origin: 'b', record: 'b', witness: 'copied-b', probability: 0.7 }
  ] });
  assertCeilings(result);
  assert.equal(result.status, 'LAB_RESULT');
  assert.equal(result.conditional_information_bits, 0);
  assert.equal(result.positive_in_declared_model, false);
  assert.equal(result.derived_from_admitted_record_declared, true);
  const falseDerived = measureConditionalInformationGain({ distribution: positiveJoint(), derived_from_admitted_record: true });
  rejected(falseDerived, 'DERIVED_CHANNEL_MUST_BE_A_FUNCTION_OF_RECORD');
  assert.ok(falseDerived.errors.includes('DERIVED_CHANNEL_CANNOT_ADD_CONDITIONAL_INFORMATION'));
});

test('conditioning detects XOR information that disappears in the marginal channel', () => {
  const distribution = [
    { origin: 'a', record: '0', witness: '0', probability: 0.25 },
    { origin: 'a', record: '1', witness: '1', probability: 0.25 },
    { origin: 'b', record: '0', witness: '1', probability: 0.25 },
    { origin: 'b', record: '1', witness: '0', probability: 0.25 }
  ];
  const result = measureConditionalInformationGain({ distribution });
  assert.equal(result.conditional_information_bits, 1);
  const marginalized = measureConditionalInformationGain({ distribution: distribution.map(row => ({ ...row, record: 'all' })) });
  assert.equal(marginalized.conditional_information_bits, 0);
  assert.equal(marginalized.positive_in_declared_model, false);
});

test('rare occupied strata avoid probability-product underflow', () => {
  const rare = 1e-300;
  const result = measureConditionalInformationGain({ distribution: [
    { origin: 'a', record: 'ordinary', witness: 'ordinary', probability: 1 },
    { origin: 'a', record: 'rare', witness: 'a', probability: rare / 2 },
    { origin: 'b', record: 'rare', witness: 'b', probability: rare / 2 }
  ] });
  assertCeilings(result);
  assert.equal(result.status, 'LAB_RESULT');
  assert.ok(Number.isFinite(result.conditional_information_bits));
  assert.ok(Math.abs(result.conditional_information_bits / rare - 1) < 1e-10);
  assert.equal(result.positive_in_declared_model, false);
  assert.equal(result.numerical_resolution_bits, 1e-12);
});

test('high model gain and forged authority declarations never earn empirical admission', () => {
  const result = measureConditionalInformationGain({
    distribution: Array.from({ length: 16 }, (_, index) => ({ origin: `o${index}`, record: 'same', witness: `w${index}`, probability: 1 / 16 })),
    externally_measured: true, independent_source_qualified: true, source_authentication: 'VERIFIED',
    authority: { loom_admission: true, consequential_execution: true, empirical_claim: true }, golden_egg_earned: true
  });
  assertCeilings(result);
  assert.equal(result.conditional_information_bits, 4);
  assert.equal(result.positive_in_declared_model, true);
  assert.equal(result.independent_source_qualified, false);
  assert.equal(result.empirical_information_gain_measured, false);
  const claimed = registerInformationGainClaim(gainClaimInput());
  assertCeilings(claimed);
  assert.equal(claimed.status, 'HELD');
  assert.equal(claimed.externally_measured_declared, true);
  assert.equal(claimed.bound_to_exact_target_episode_declared, true);
  assert.equal(claimed.conditional_witness_information_bits_declared, 1000);
  assert.equal(claimed.independent_source_qualified, false);
  assert.equal(claimed.empirical_information_gain_measured, false);
  for (const patch of [
    { conditional_on_admitted_record: false }, { derived_from_admitted_record: true },
    { independently_governed: false }, { shares_upstream_source: true },
    { admitted_record_information_bits: -1 }, { candidate_witness_information_bits: 0 },
    { candidate_witness_information_bits: Infinity }
  ]) rejected(registerInformationGainClaim({ ...gainClaimInput(), ...patch }));
});

test('malformed joint geometry rejects rather than normalizing or measuring it', () => {
  const cases = [
    [{ distribution: positiveJoint().map(row => ({ ...row, probability: row.probability / 2 })) }, 'NORMALIZED_JOINT_DISTRIBUTION_REQUIRED'],
    [{ distribution: [...positiveJoint(), { ...positiveJoint()[0], probability: 0 }] }, 'DUPLICATE_JOINT_CELL'],
    [{ distribution: [{ origin: 'a', record: 'r', witness: 'w', probability: 1 }] }, 'AT_LEAST_TWO_OCCUPIED_ORIGIN_STATES_REQUIRED'],
    [{ distribution: positiveJoint().map((row, index) => index ? row : { ...row, probability: -0.2 }) }, 'VALID_PROBABILITY_REQUIRED'],
    [{ distribution: positiveJoint().map((row, index) => index ? row : { ...row, probability: NaN }) }, 'VALID_PROBABILITY_REQUIRED'],
    [{ distribution: positiveJoint().map((row, index) => index ? row : { ...row, probability: '0.4' }) }, 'VALID_PROBABILITY_REQUIRED'],
    [{ distribution: positiveJoint().map((row, index) => index ? row : { ...row, witness: '   ' }) }, 'WITNESS_STATE_REQUIRED'],
    [{ distribution: positiveJoint(), derived_from_admitted_record: 'false' }, 'BOOLEAN_DERIVED_CHANNEL_DECLARATION_REQUIRED']
  ];
  for (const [input, error] of cases) {
    const result = measureConditionalInformationGain(input);
    rejected(result, error);
    assert.equal(result.conditional_information_bits, null);
    assert.equal(result.positive_in_declared_model, false);
  }
});

test('independent-observation references remain unverified even with independence declarations', () => {
  const result = intakeIndependentObservation({ ...witnessInput(), source_references_verified: true, golden_egg_earned: true });
  assertCeilings(result);
  assert.equal(result.status, 'HELD');
  assert.equal(result.independent_observation_declared, true);
  assert.equal(result.independent_source_qualified, false);
  assert.equal(result.source_references_verified, false);
  assert.equal(result.next_gate, 'LOOM_GATE_QUALIFICATION_REQUIRED');
  for (const field of Object.keys(result.references)) {
    const input = witnessInput();
    delete input[field];
    rejected(intakeIndependentObservation(input), `${field.toUpperCase()}_REQUIRED`);
  }
  rejected(intakeIndependentObservation({ ...witnessInput(), shares_upstream_source: true }), 'NO_SHARED_UPSTREAM_SOURCE_REQUIRED');
  rejected(intakeIndependentObservation({ ...witnessInput(), derived_from_admitted_record: true }), 'NON_DERIVATIVE_OBSERVATION_REQUIRED');
});

test('same-episode preparation preserves review references without acquiring any surface', () => {
  const input = acquisitionInput(), result = prepareSameEpisodeAcquisition(input);
  assertCeilings(result);
  assert.equal(result.status, 'DESIGN_READY');
  assert.equal(result.preregistration_reference, input.preregistration_reference);
  assert.deepEqual(result.routes, input.routes);
  assert.deepEqual(result.measurement_plans, input.surfaces);
  assert.deepEqual(result.surfaces_observed, []);
  assert.equal(result.candidate_established, false);
  assert.equal(result.next_gate, 'FIRE_GATE_REVIEW_REQUIRED');
  for (const field of Object.keys(input.surfaces)) {
    const missing = acquisitionInput();
    delete missing.surfaces[field];
    rejected(prepareSameEpisodeAcquisition(missing), `${field}_MEASUREMENT_PLAN_REQUIRED`);
  }
  rejected(prepareSameEpisodeAcquisition({ ...acquisitionInput(), measurements_present: true }), 'PREREGISTRATION_MUST_PRECEDE_MEASUREMENT');
  rejected(prepareSameEpisodeAcquisition({ ...acquisitionInput(), continuous_custody: false }), 'CONTINUOUS_CUSTODY_PLAN_REQUIRED');
  rejected(prepareSameEpisodeAcquisition({ ...acquisitionInput(), immutable_episode: false }), 'IMMUTABLE_EPISODE_REQUIRED');
  const sameReturn = acquisitionInput();
  sameReturn.routes[1].return_observation_id = sameReturn.routes[0].return_observation_id;
  rejected(prepareSameEpisodeAcquisition(sameReturn), 'DISTINCT_RETURN_OBSERVATIONS_REQUIRED');
  const noControl = acquisitionInput();
  noControl.routes[0].role = 'PROTECTED';
  rejected(prepareSameEpisodeAcquisition(noControl), 'CONTROL_AND_PROTECTED_ROUTES_REQUIRED');
});

test('missing, malformed, sparse and oversized inputs produce bounded frozen rejections', () => {
  const functions = [registerRouteObservation, registerCarrierObservation, registerReceiverObservation, validateReceiverSwapDesign, measureConditionalInformationGain, registerInformationGainClaim, intakeIndependentObservation, prepareSameEpisodeAcquisition];
  for (const instrument of functions) for (const input of [undefined, null, false, 0, 'text', [], {}]) rejected(instrument(input));
  const arrayFunctions = [
    [registerRouteObservation, 'observations', routeInput()],
    [registerCarrierObservation, 'carriers', carrierInput()],
    [registerReceiverObservation, 'observations', receiverInput()],
    [measureConditionalInformationGain, 'distribution', { distribution: positiveJoint() }],
    [prepareSameEpisodeAcquisition, 'routes', acquisitionInput()]
  ];
  for (const [instrument, field, input] of arrayFunctions) {
    for (const rows of [null, {}, 'rows', [null, 4], new Array(2), Array(4097).fill({})]) rejected(instrument({ ...input, [field]: rows }));
  }
  const sparse = positiveJoint();
  sparse.length += 1;
  rejected(measureConditionalInformationGain({ distribution: sparse }), 'ORIGIN_STATE_REQUIRED');
});

test('malformed cyclic row values cannot escape rejection or freeze caller objects', () => {
  const cyclic = {};
  cyclic.self = cyclic;
  const model = positiveJoint();
  model[0].origin = cyclic;
  rejected(measureConditionalInformationGain({ distribution: model }), 'ORIGIN_STATE_REQUIRED');
  const acquisition = acquisitionInput();
  acquisition.routes[0].role = cyclic;
  rejected(prepareSameEpisodeAcquisition(acquisition), 'CONTROL_OR_PROTECTED_ROUTE_REQUIRED');
  assert.equal(Object.isFrozen(cyclic), false);
  assert.equal(Object.isFrozen(model), false);
  assert.equal(Object.isFrozen(acquisition.routes[0]), false);
});

test('declaration validation cannot execute caller accessors or array iterators', () => {
  let executed = 0;
  const input = routeInput();
  Object.defineProperty(input, 'metric', { enumerable: true, get() { executed++; return 'x'; } });
  rejected(registerRouteObservation(input));
  const array = routeInput().observations;
  Object.defineProperty(array, '0', { enumerable: true, get() { executed++; return { route_id: 'x', value: 0 }; } });
  array[Symbol.iterator] = function* () { executed++; yield { route_id: 'x', value: 0 }; };
  rejected(registerRouteObservation({ ...routeInput(), observations: array }));
  assert.equal(executed, 0);
});
