import { freeze } from '../../../engine/flowcore-pedagogue-utils.js';

export const SELF_CALIBRATING_JOINT_STATE_OPERATOR_SCHEMA = 'td613.ash.a15-r0.self-calibrating-joint-state-operator/v0.1';

const POSITIVE_ORACLE = Object.freeze({ x:2, y:3, theta:2 });
const CONFOUNDED_ORACLE = Object.freeze({ x:2, y:2, theta:2 });
const CONFOUNDED_FAMILY = Object.freeze([
  Object.freeze({ candidate_id:'K0', x:2, y:2, theta:2 }),
  Object.freeze({ candidate_id:'K1', x:3, y:3, theta:1 }),
  Object.freeze({ candidate_id:'K2', x:1, y:1, theta:5 })
]);
const TOLERANCE = 1e-12;

function round15(value) {
  return Number(value.toFixed(15));
}

function determinant3(matrix) {
  const [[a,b,c],[d,e,f],[g,h,i]] = matrix;
  return round15(a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g));
}

function matrixRank(matrix, tolerance = TOLERANCE) {
  const work = matrix.map(row => row.map(Number));
  let rank = 0;
  let column = 0;
  while (rank < work.length && column < work[0].length) {
    let pivot = rank;
    for (let row = rank + 1; row < work.length; row += 1) {
      if (Math.abs(work[row][column]) > Math.abs(work[pivot][column])) pivot = row;
    }
    if (Math.abs(work[pivot][column]) <= tolerance) {
      column += 1;
      continue;
    }
    [work[rank], work[pivot]] = [work[pivot], work[rank]];
    const divisor = work[rank][column];
    for (let c = column; c < work[rank].length; c += 1) work[rank][c] /= divisor;
    for (let row = 0; row < work.length; row += 1) {
      if (row === rank) continue;
      const factor = work[row][column];
      for (let c = column; c < work[row].length; c += 1) work[row][c] -= factor * work[rank][c];
    }
    rank += 1;
    column += 1;
  }
  return rank;
}

export function jointForwardObservation({ x, y, theta }) {
  for (const [label, value] of Object.entries({ x, y, theta })) {
    if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite.`);
  }
  return freeze({
    P1: round15(x + theta * y),
    P2: round15(theta * x + y),
    P3: round15(x - y)
  });
}

export function jointStateCalibrationJacobian({ x, y, theta }) {
  for (const [label, value] of Object.entries({ x, y, theta })) {
    if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite.`);
  }
  return freeze([
    freeze([1, theta, y]),
    freeze([theta, 1, x]),
    freeze([1, -1, 0])
  ]);
}

export function reconstructJointStateCalibration(observation, tolerance = TOLERANCE) {
  if (!Number.isFinite(tolerance) || tolerance < 0) throw new TypeError('tolerance must be a non-negative finite number.');
  const { P1, P2, P3 } = observation || {};
  for (const [label, value] of Object.entries({ P1, P2, P3 })) {
    if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite.`);
  }
  if (Math.abs(P3) <= tolerance) {
    return freeze({
      status: 'JOINT_STATE_CALIBRATION_UNIDENTIFIED',
      reason: 'STATE_INSTRUMENT_CONFOUND_AT_ZERO_DIFFERENCE_PROBE',
      reconstructed: null,
      unique_within_declared_model: false
    });
  }

  const theta = round15(1 - (P1 - P2) / P3);
  if (Math.abs(1 + theta) <= tolerance) {
    return freeze({
      status: 'JOINT_STATE_CALIBRATION_UNIDENTIFIED',
      reason: 'SUM_CHANNEL_SINGULAR_AT_THETA_MINUS_ONE',
      reconstructed: null,
      unique_within_declared_model: false
    });
  }
  const sum = (P1 + P2) / (1 + theta);
  const x = round15((sum + P3) / 2);
  const y = round15((sum - P3) / 2);
  return freeze({
    status: 'JOINT_STATE_CALIBRATION_RECONSTRUCTED_IN_DECLARED_SYNTHETIC_GEOMETRY',
    reason: 'DECLARED_CLOSED_FORM_INVERSE_APPLICABLE',
    reconstructed: freeze({ x, y, theta }),
    unique_within_declared_model: true
  });
}

const PROBE_LIBRARY = Object.freeze([
  Object.freeze({ probe_id:'C1', definition:'theta*x', apply: candidate => candidate.theta * candidate.x }),
  Object.freeze({ probe_id:'C2', definition:'x+y', apply: candidate => candidate.x + candidate.y }),
  Object.freeze({ probe_id:'C3', definition:'x+theta*y', duplicate_of:'P1', apply: candidate => candidate.x + candidate.theta * candidate.y })
]);

function scoreProbe(probe, compatibleFamily) {
  const outcomes = compatibleFamily.map(candidate => round15(probe.apply(candidate)));
  const groups = new Map();
  outcomes.forEach((value, index) => {
    const key = String(value);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(compatibleFamily[index].candidate_id);
  });
  const bucketSizes = [...groups.values()].map(group => group.length);
  const pairCount = compatibleFamily.length * (compatibleFamily.length - 1) / 2;
  const unresolvedPairs = bucketSizes.reduce((sum, size) => sum + size * (size - 1) / 2, 0);
  const separationFraction = pairCount === 0 ? 0 : round15(1 - unresolvedPairs / pairCount);
  return freeze({
    probe_id: probe.probe_id,
    definition: probe.definition,
    duplicate_of: probe.duplicate_of || null,
    outcomes: freeze(outcomes),
    partition_count: groups.size,
    maximum_bucket_size: Math.max(...bucketSizes),
    separation_fraction: separationFraction,
    redundant_over_current_family: groups.size === 1
  });
}

export function selectDiscriminatingProbe(compatibleFamily = CONFOUNDED_FAMILY) {
  if (!Array.isArray(compatibleFamily) || compatibleFamily.length < 2) {
    throw new TypeError('compatibleFamily must contain at least two candidates.');
  }
  const scores = PROBE_LIBRARY.map(probe => scoreProbe(probe, compatibleFamily));
  const ranked = [...scores].sort((left, right) =>
    right.separation_fraction - left.separation_fraction ||
    left.maximum_bucket_size - right.maximum_bucket_size ||
    left.probe_id.localeCompare(right.probe_id)
  );
  return freeze({
    candidate_library_predeclared: true,
    oracle_identity_consulted: false,
    scores: freeze(scores),
    selected_probe_id: ranked[0].probe_id,
    selected_probe_definition: ranked[0].definition,
    selected_separation_fraction: ranked[0].separation_fraction,
    automatic_measurement_execution: false,
    primary_inverse_verdict_overwritten: false,
    classification: 'DISCRIMINATING_NEXT_OBSERVATION_PROPOSED_FROM_COMPATIBLE_FAMILY_ONLY'
  });
}

export function runSelfCalibratingJointStateOperatorGauntlet() {
  const positiveObservation = jointForwardObservation(POSITIVE_ORACLE);
  const positiveInverse = reconstructJointStateCalibration(positiveObservation);
  const positiveJacobian = jointStateCalibrationJacobian(POSITIVE_ORACLE);
  const positiveRank = matrixRank(positiveJacobian);
  const positiveDeterminant = determinant3(positiveJacobian);

  const confoundedObservation = jointForwardObservation(CONFOUNDED_ORACLE);
  const confoundedInverse = reconstructJointStateCalibration(confoundedObservation);
  const confoundedJacobian = jointStateCalibrationJacobian(CONFOUNDED_ORACLE);
  const confoundedRank = matrixRank(confoundedJacobian);
  const confoundedDeterminant = determinant3(confoundedJacobian);
  const compatibleFamily = CONFOUNDED_FAMILY.map(candidate => freeze({
    ...candidate,
    observation: jointForwardObservation(candidate)
  }));
  const compatibleObservationsMatch = compatibleFamily.every(candidate =>
    JSON.stringify(candidate.observation) === JSON.stringify(confoundedObservation)
  );
  const nextProbe = selectDiscriminatingProbe(CONFOUNDED_FAMILY);
  const redundantScore = nextProbe.scores.find(score => score.probe_id === 'C3');

  const passed =
    JSON.stringify(positiveObservation) === JSON.stringify({ P1:8, P2:7, P3:-1 }) &&
    positiveInverse.status === 'JOINT_STATE_CALIBRATION_RECONSTRUCTED_IN_DECLARED_SYNTHETIC_GEOMETRY' &&
    JSON.stringify(positiveInverse.reconstructed) === JSON.stringify(POSITIVE_ORACLE) &&
    positiveRank === 3 &&
    positiveDeterminant === -3 &&
    JSON.stringify(confoundedObservation) === JSON.stringify({ P1:6, P2:6, P3:0 }) &&
    confoundedInverse.status === 'JOINT_STATE_CALIBRATION_UNIDENTIFIED' &&
    confoundedInverse.reconstructed === null &&
    confoundedRank === 2 &&
    confoundedDeterminant === 0 &&
    compatibleObservationsMatch === true &&
    nextProbe.oracle_identity_consulted === false &&
    nextProbe.selected_probe_id === 'C1' &&
    nextProbe.selected_separation_fraction === 1 &&
    nextProbe.automatic_measurement_execution === false &&
    nextProbe.primary_inverse_verdict_overwritten === false &&
    redundantScore.redundant_over_current_family === true &&
    redundantScore.separation_fraction === 0;

  if (!passed) throw new Error('Self-calibrating joint state/operator gauntlet violated an authored expectation.');

  return freeze({
    schema: SELF_CALIBRATING_JOINT_STATE_OPERATOR_SCHEMA,
    source_status: 'SIMULATED',
    authority_class: 'A2_DERIVATIONAL',
    manifestly_fictional: true,
    forward_model: freeze({
      definitions: freeze({ P1:'x+theta*y', P2:'theta*x+y', P3:'x-y' }),
      partially_unknown_forward_operator: true,
      hidden_parameter_count: 1,
      hidden_parameter_id: 'theta'
    }),
    positive: freeze({
      observation: positiveObservation,
      inverse: positiveInverse,
      jacobian: positiveJacobian,
      jacobian_rank: positiveRank,
      jacobian_determinant: positiveDeterminant,
      local_joint_identifiability_classification: 'FULL_LOCAL_RANK_IN_DECLARED_SYNTHETIC_GEOMETRY'
    }),
    hostile_confound: freeze({
      observation: confoundedObservation,
      inverse: confoundedInverse,
      jacobian: confoundedJacobian,
      jacobian_rank: confoundedRank,
      jacobian_determinant: confoundedDeterminant,
      compatible_family: freeze(compatibleFamily),
      compatible_observations_match: compatibleObservationsMatch,
      primary_verdict: 'JOINT_STATE_CALIBRATION_UNIDENTIFIED',
      confound_classification: 'LATENT_STATE_AND_CALIBRATION_ARE_OBSERVATIONALLY_EXCHANGEABLE_IN_DECLARED_SINGULAR_GEOMETRY'
    }),
    next_measurement_design: nextProbe,
    gauntlet_status: 'SELF_CALIBRATING_IDENTIFIABILITY_BOUNDARY_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE',
    reusable_relation_status: 'RESEARCH_REFINEMENT_CANDIDATE_ONLY',
    reusable_relations: freeze([
      'joint reconstruction is warranted only where the state-instrument split is itself identifiable',
      'when the current compatible family remains unresolved, a next probe can be selected for discriminatory power rather than forcing a point estimate'
    ]),
    next_learning_action: 'EXECUTE_PREDECLARED_DISCRIMINATOR_WITHOUT_OVERWRITING_PRIMARY_UNIDENTIFIED_VERDICT',
    claims: freeze({
      blind_tomography: false,
      operator_tomography: false,
      physical_tomography: false,
      physical_sensor_calibration: false,
      live_td613_self_calibration: false,
      autonomous_experiment_execution: false,
      connection: false,
      curvature: false,
      holonomy: false,
      quantum_behavior: false,
      proto_loom: false,
      production_authority: false
    }),
    promotion_authority: false,
    production_mutated: false,
    live_ash_binding: false,
    human_closure_required: true
  });
}
