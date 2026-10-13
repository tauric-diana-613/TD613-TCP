// Pure local instruments. Supplied evidence remains a declaration: these adapters
// never acquire a source, execute a receiver, admit custody, or establish origin.
const deepFreeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value).forEach(deepFreeze);
    Object.freeze(value);
  }
  return value;
};
const record = value => {
  if (value === null || typeof value !== 'object' || Array.isArray(value)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) return {};
  const descriptors = Object.getOwnPropertyDescriptors(value);
  return Object.values(descriptors).every(item => Object.hasOwn(item, 'value') && item.enumerable) ? value : {};
};
const text = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 512;
const unique = values => [...new Set(values)];
const boundedRows = (value, errors, label, minimum = 1) => {
  if (!Array.isArray(value) || value.length < minimum || value.length > 4096) {
    errors.push(`${label}_BOUNDED_ARRAY_REQUIRED`);
    return [];
  }
  // Materialize sparse slots so absent rows cannot bypass per-row validation.
  return Array.from({ length: value.length }, (_, index) => Object.getOwnPropertyDescriptor(value, String(index))?.value);
};

export const LOOM_INSTRUMENT_LAB_SCHEMA = 'td613.loom.instrument-lab/v0.1';
export const LOOM_INSTRUMENT_BENCHES = deepFreeze([
  { id: 'route', label: 'Route observation', scope: 'Compare supplied measurements along declared paths.' },
  { id: 'carrier', label: 'Provenance carriers', scope: 'Keep process and content channels distinguishable.' },
  { id: 'receiver', label: 'Receiver comparison', scope: 'Compare apparatus reports without inferring origin.' },
  { id: 'receiver-substitution', label: 'Receiver substitution', scope: 'Prepare a controlled comparison with one apparatus difference.' },
  { id: 'witness', label: 'Independent observation intake', scope: 'Inspect declared source and custody references; qualification stays held.' },
  { id: 'information-gain', label: 'Conditional information gain', scope: 'Measure a finite declared model, separately from empirical evidence.' },
  { id: 'acquisition', label: 'Same-episode preparation', scope: 'Prepare a common-frame acquisition contract without executing it.' }
]);
export const LOOM_INSTRUMENT_DONORS = deepFreeze([
  { id: 'route-deformation', source: '#1003', method: 'Route-sensitive observation', accession: 'PUBLIC_METHOD_REIMPLEMENTATION' },
  { id: 'carrier-separation', source: '#1004', method: 'Process/content carrier separation', accession: 'PUBLIC_METHOD_REIMPLEMENTATION' },
  { id: 'receiver-indexing', source: '#1005', method: 'Receiver-indexed observation', accession: 'PUBLIC_METHOD_REIMPLEMENTATION' },
  { id: 'receiver-substitution', source: '#1006', method: 'Controlled receiver substitution', accession: 'TD613_OWN_UNMERGED_METHOD' },
  { id: 'conditional-information-gain', source: '#1007', method: 'Conditional information beyond the admitted record', accession: 'TD613_OWN_UNMERGED_METHOD' }
]);

function receipt(assay, errors, fields = {}, readyStatus = 'LAB_RESULT') {
  return deepFreeze({
    schema: LOOM_INSTRUMENT_LAB_SCHEMA,
    assay,
    status: errors.length ? 'INADMISSIBLE' : readyStatus,
    errors: unique(errors),
    ...fields,
    research_lineage: 'WESTERN_HORIZON',
    evidence_class: 'LOCAL_ANALYSIS_OF_DECLARED_INPUT',
    source_authentication: 'NOT_PERFORMED',
    authority: { lab_analysis: true, loom_admission: false, consequential_execution: false, empirical_claim: false },
    live_loom_mutated: false,
    externally_measured: false,
    origin_truth_established: false,
    empirical_target_exteriority_established: false,
    golden_egg_credit: 0,
    golden_egg_earned: false
  });
}

export function registerRouteObservation(input = {}) {
  const { metric, baseline, observations } = record(input);
  const errors = [];
  if (!text(metric)) errors.push('METRIC_REQUIRED');
  if (!Number.isFinite(baseline)) errors.push('FINITE_BASELINE_REQUIRED');
  const rows = boundedRows(observations, errors, 'OBSERVATIONS').map(raw => {
    const item = record(raw);
    if (!text(item.route_id)) errors.push('ROUTE_ID_REQUIRED');
    if (!Number.isFinite(item.value)) errors.push('FINITE_ROUTE_VALUE_REQUIRED');
    const delta = Number.isFinite(item.value) && Number.isFinite(baseline) ? item.value - baseline : null;
    if (delta !== null && !Number.isFinite(delta)) errors.push('FINITE_ROUTE_DELTA_REQUIRED');
    return {
      route_id: text(item.route_id) ? item.route_id : null,
      value: Number.isFinite(item.value) ? item.value : null,
      delta_from_baseline: Number.isFinite(delta) ? delta : null
    };
  });
  if (new Set(rows.map(item => item.route_id)).size !== rows.length) errors.push('DISTINCT_ROUTE_IDS_REQUIRED');
  return receipt('ROUTE_OBSERVATION', errors, {
    metric: text(metric) ? metric : null,
    baseline: Number.isFinite(baseline) ? baseline : null,
    observations: rows,
    route_sensitivity_observed_in_supplied_measurements: errors.length === 0 && rows.some(item => item.delta_from_baseline !== 0),
    causal_route_effect_established: false,
    universal_route_law: false
  });
}

export function registerCarrierObservation(input = {}) {
  const errors = [];
  const rows = boundedRows(record(input).carriers, errors, 'CARRIERS', 2).map(raw => {
    const item = record(raw);
    if (!text(item.carrier_id)) errors.push('CARRIER_ID_REQUIRED');
    if (!text(item.layer)) errors.push('CARRIER_LAYER_REQUIRED');
    if (typeof item.observed !== 'boolean') errors.push('OBSERVED_STATE_REQUIRED');
    return {
      carrier_id: text(item.carrier_id) ? item.carrier_id : null,
      layer: text(item.layer) ? item.layer : null,
      observed: typeof item.observed === 'boolean' ? item.observed : null
    };
  });
  if (new Set(rows.map(item => item.carrier_id)).size !== rows.length) errors.push('DISTINCT_CARRIER_IDS_REQUIRED');
  if (new Set(rows.map(item => item.layer)).size < 2) errors.push('DISTINCT_CARRIER_LAYERS_REQUIRED');
  return receipt('CARRIER_OBSERVATION', errors, {
    carriers: rows,
    distinct_carrier_layers_declared: errors.length === 0,
    scalar_proxy_allowed: false,
    carrier_independence_established: false,
    process_identifiability_established: false
  });
}

export function registerReceiverObservation(input = {}) {
  const errors = [];
  const rows = boundedRows(record(input).observations, errors, 'RECEIVER_OBSERVATIONS', 2).map(raw => {
    const item = record(raw);
    for (const key of ['receiver_apparatus_id', 'artifact_digest', 'route_digest', 'carrier_id', 'metric']) {
      if (!text(item[key])) errors.push(`${key.toUpperCase()}_REQUIRED`);
    }
    if (!Number.isFinite(item.value)) errors.push('FINITE_RECEIVER_VALUE_REQUIRED');
    return {
      receiver_apparatus_id: text(item.receiver_apparatus_id) ? item.receiver_apparatus_id : null,
      artifact_digest: text(item.artifact_digest) ? item.artifact_digest : null,
      route_digest: text(item.route_digest) ? item.route_digest : null,
      carrier_id: text(item.carrier_id) ? item.carrier_id : null,
      metric: text(item.metric) ? item.metric : null,
      value: Number.isFinite(item.value) ? item.value : null
    };
  });
  if (new Set(rows.map(item => item.receiver_apparatus_id)).size !== rows.length) errors.push('DISTINCT_RECEIVER_APPARATUS_REQUIRED');
  const comparisonCoordinates = ['artifact_digest', 'route_digest', 'carrier_id', 'metric'];
  const mismatches = comparisonCoordinates.filter(key => rows.some(item => item[key] !== rows[0]?.[key]));
  const comparable = errors.length === 0 && mismatches.length === 0;
  const difference = comparable ? Math.max(...rows.map(item => item.value)) - Math.min(...rows.map(item => item.value)) : null;
  if (difference !== null && !Number.isFinite(difference)) errors.push('FINITE_RECEIVER_DIFFERENCE_REQUIRED');
  return receipt('RECEIVER_OBSERVATION', errors, {
    observations: rows,
    comparison_coordinates: comparisonCoordinates,
    comparison_scope: 'SUPPLIED_ARTIFACT_ROUTE_CARRIER_METRIC_ONLY',
    unqualified_coordinates: ['provenance_state', 'source_custody', 'observation_window'],
    comparison_mismatches: mismatches,
    same_comparison_coordinates_declared: comparable && errors.length === 0,
    supplied_score_difference: errors.length === 0 ? difference : null,
    causal_receiver_effect_established: false,
    independent_receiver_execution_observed: false
  }, comparable ? 'LAB_RESULT' : 'HELD');
}

export const FIXED_RECEIVER_SWAP_FIELDS = Object.freeze([
  'artifact_digest', 'route_digest', 'carrier_id', 'provenance_state_digest', 'source_custody_digest', 'observation_window_id'
]);
export function validateReceiverSwapDesign(input = {}) {
  const proposal = record(input);
  const { left: rawLeft, right: rawRight } = proposal;
  const left = record(rawLeft), right = record(rawRight), errors = [];
  for (const key of FIXED_RECEIVER_SWAP_FIELDS) {
    if (!text(left[key])) errors.push(`LEFT_${key.toUpperCase()}_REQUIRED`);
    if (!text(right[key])) errors.push(`RIGHT_${key.toUpperCase()}_REQUIRED`);
    if (left[key] !== right[key]) errors.push(`${key.toUpperCase()}_MUST_REMAIN_FIXED`);
  }
  if (!text(left.receiver_apparatus_id)) errors.push('LEFT_RECEIVER_APPARATUS_REQUIRED');
  if (!text(right.receiver_apparatus_id)) errors.push('RIGHT_RECEIVER_APPARATUS_REQUIRED');
  if (left.receiver_apparatus_id === right.receiver_apparatus_id) errors.push('DISTINCT_RECEIVER_APPARATUS_REQUIRED');
  // Reject undeclared outcome/confound coordinates. An extra coordinate cannot
  // silently slip around the six-coordinate fixed-input design.
  const allowed = new Set([...FIXED_RECEIVER_SWAP_FIELDS, 'receiver_apparatus_id']);
  if ([...Object.keys(left), ...Object.keys(right)].some(key => !allowed.has(key))) errors.push('UNDECLARED_SWAP_COORDINATE');
  if (proposal.measurements_present !== undefined && proposal.measurements_present !== false) errors.push('PREREGISTRATION_MUST_PRECEDE_MEASUREMENT');
  if (proposal.empirical_receiver_outcomes !== undefined && proposal.empirical_receiver_outcomes !== null) errors.push('EMPIRICAL_OUTCOMES_MUST_REMAIN_EMPTY');
  const project = item => Object.fromEntries([...allowed].map(key => [key, text(item[key]) ? item[key] : null]));
  return receipt('RECEIVER_SWAP_DESIGN', errors, {
    left: project(left),
    right: project(right),
    fixed_coordinates: errors.length ? [] : [...FIXED_RECEIVER_SWAP_FIELDS],
    sole_allowed_difference: errors.length ? null : 'RECEIVER_APPARATUS',
    receiver_effect_observed: false,
    causal_effect_estimated: false,
    next_gate: errors.length ? null : 'FIRE_GATE_REVIEW_REQUIRED'
  }, 'DESIGN_READY');
}

// Computes I(origin; witness | record) from an explicitly normalized finite joint
// model. Conditioning is essential: marginal MI may duplicate record information.
export function measureConditionalInformationGain(input = {}) {
  const proposal = record(input), errors = [];
  const rows = boundedRows(proposal.distribution, errors, 'DISTRIBUTION').map(raw => {
    const item = record(raw);
    for (const key of ['origin', 'record', 'witness']) if (!text(item[key])) errors.push(`${key.toUpperCase()}_STATE_REQUIRED`);
    if (!Number.isFinite(item.probability) || item.probability < 0 || item.probability > 1) errors.push('VALID_PROBABILITY_REQUIRED');
    return {
      origin: text(item.origin) ? item.origin : null,
      record: text(item.record) ? item.record : null,
      witness: text(item.witness) ? item.witness : null,
      probability: Number.isFinite(item.probability) && item.probability >= 0 && item.probability <= 1 ? item.probability : null
    };
  });
  const mass = rows.reduce((sum, item) => sum + (Number.isFinite(item.probability) ? item.probability : 0), 0);
  if (Math.abs(mass - 1) > 1e-10) errors.push('NORMALIZED_JOINT_DISTRIBUTION_REQUIRED');
  const cellKeys = rows.map(item => JSON.stringify([item.origin, item.record, item.witness]));
  if (new Set(cellKeys).size !== cellKeys.length) errors.push('DUPLICATE_JOINT_CELL');
  if (new Set(rows.filter(item => item.probability > 0).map(item => item.origin)).size < 2) errors.push('AT_LEAST_TWO_OCCUPIED_ORIGIN_STATES_REQUIRED');
  if (proposal.derived_from_admitted_record !== undefined && typeof proposal.derived_from_admitted_record !== 'boolean') errors.push('BOOLEAN_DERIVED_CHANNEL_DECLARATION_REQUIRED');
  let bits = null;
  if (!errors.length) {
    const pA = new Map(), pOA = new Map(), pAX = new Map();
    const add = (map, key, value) => map.set(key, (map.get(key) || 0) + value);
    const key = (...parts) => JSON.stringify(parts);
    // Only repair floating-point summation within the admitted mass tolerance.
    // Materially unnormalized models are rejected above rather than rescaled.
    const normalizedRows = rows.map(item => ({ ...item, probability: item.probability / mass }));
    for (const item of normalizedRows) {
      add(pA, key(item.record), item.probability);
      add(pOA, key(item.origin, item.record), item.probability);
      add(pAX, key(item.record, item.witness), item.probability);
    }
    let gain = 0;
    for (const item of normalizedRows) if (item.probability > 0) {
      // Log terms avoid underflow of joint-probability products in rare strata.
      const logRatio = (Math.log2(item.probability) - Math.log2(pOA.get(key(item.origin, item.record))))
        + (Math.log2(pA.get(key(item.record))) - Math.log2(pAX.get(key(item.record, item.witness))));
      gain += item.probability * logRatio;
    }
    if (!Number.isFinite(gain) || gain < -1e-10) errors.push('INVALID_INFORMATION_GEOMETRY');
    else bits = Math.max(0, gain);
    if (proposal.derived_from_admitted_record === true) {
      const occupied = new Map();
      for (const item of rows) if (item.probability > 0) {
        if (!occupied.has(item.record)) occupied.set(item.record, new Set());
        occupied.get(item.record).add(item.witness);
      }
      if ([...occupied.values()].some(values => values.size > 1)) errors.push('DERIVED_CHANNEL_MUST_BE_A_FUNCTION_OF_RECORD');
      if (bits > 1e-10) errors.push('DERIVED_CHANNEL_CANNOT_ADD_CONDITIONAL_INFORMATION');
    }
  }
  return receipt('CONDITIONAL_INFORMATION_GAIN', errors, {
    model_class: 'FINITE_DECLARED_JOINT_MODEL',
    supplied_probability_mass: Number.isFinite(mass) ? mass : null,
    conditional_information_bits: errors.length ? null : bits,
    numerical_resolution_bits: 1e-12,
    positive_in_declared_model: errors.length === 0 && bits > 1e-12,
    derived_from_admitted_record_declared: proposal.derived_from_admitted_record === true,
    independent_source_qualified: false,
    empirical_information_gain_measured: false,
    law: 'POSITIVE_MODEL_INFORMATION_DOES_NOT_AUTHENTICATE_SOURCE_OR_PROVE_ORIGIN'
  });
}

export function registerInformationGainClaim(input = {}) {
  const proposal = record(input), errors = [];
  for (const key of ['admitted_record_information_bits', 'candidate_witness_information_bits']) {
    if (!Number.isFinite(proposal[key]) || proposal[key] < 0) errors.push(`${key.toUpperCase()}_NONNEGATIVE_REQUIRED`);
  }
  if (proposal.conditional_on_admitted_record !== true) errors.push('CONDITIONAL_INFORMATION_DECLARATION_REQUIRED');
  if (proposal.derived_from_admitted_record !== false) errors.push('NON_DERIVATIVE_WITNESS_REQUIRED');
  if (proposal.independently_governed !== true) errors.push('INDEPENDENT_GOVERNANCE_REQUIRED');
  if (proposal.shares_upstream_source !== false) errors.push('NO_SHARED_UPSTREAM_SOURCE_REQUIRED');
  if (!(proposal.candidate_witness_information_bits > 0)) errors.push('POSITIVE_INFORMATION_GAIN_REQUIRED');
  return receipt('INFORMATION_GAIN_CLAIM', errors, {
    admitted_record_information_bits_declared: Number.isFinite(proposal.admitted_record_information_bits) ? proposal.admitted_record_information_bits : null,
    conditional_witness_information_bits_declared: Number.isFinite(proposal.candidate_witness_information_bits) ? proposal.candidate_witness_information_bits : null,
    externally_measured_declared: proposal.externally_measured === true,
    bound_to_exact_target_episode_declared: proposal.bound_to_exact_target_episode === true,
    independent_source_qualified: false,
    empirical_information_gain_measured: false,
    next_observation: 'INDEPENDENT_SOURCE_EPISODE_CUSTODY_AND_MEASUREMENT_QUALIFICATION_REQUIRED'
  }, 'HELD');
}

export function intakeIndependentObservation(input = {}) {
  const proposal = record(input), errors = [];
  const required = ['source_id', 'source_revision', 'episode_id', 'custody_reference', 'measurement_reference', 'comparison_frame_id'];
  for (const key of required) if (!text(proposal[key])) errors.push(`${key.toUpperCase()}_REQUIRED`);
  if (proposal.derived_from_admitted_record !== false) errors.push('NON_DERIVATIVE_OBSERVATION_REQUIRED');
  if (proposal.independently_governed !== true) errors.push('INDEPENDENT_GOVERNANCE_REQUIRED');
  if (proposal.shares_upstream_source !== false) errors.push('NO_SHARED_UPSTREAM_SOURCE_REQUIRED');
  return receipt('INDEPENDENT_OBSERVATION_INTAKE', errors, {
    references: Object.fromEntries(required.map(key => [key, text(proposal[key]) ? proposal[key] : null])),
    independent_observation_declared: errors.length === 0,
    independent_source_qualified: false,
    source_references_verified: false,
    next_gate: errors.length ? null : 'LOOM_GATE_QUALIFICATION_REQUIRED'
  }, 'HELD');
}

export function prepareSameEpisodeAcquisition(input = {}) {
  const proposal = record(input), errors = [];
  for (const key of ['episode_id', 'comparison_frame_id', 'common_departure_id', 'custody_plan_reference', 'preregistration_reference']) {
    if (!text(proposal[key])) errors.push(`${key.toUpperCase()}_REQUIRED`);
  }
  if (proposal.immutable_episode !== true) errors.push('IMMUTABLE_EPISODE_REQUIRED');
  if (proposal.continuous_custody !== true) errors.push('CONTINUOUS_CUSTODY_PLAN_REQUIRED');
  if (proposal.measurements_present !== false) errors.push('PREREGISTRATION_MUST_PRECEDE_MEASUREMENT');
  const routes = boundedRows(proposal.routes, errors, 'ROUTES', 2).map(raw => {
    const item = record(raw);
    if (!text(item.route_id)) errors.push('ROUTE_ID_REQUIRED');
    if (!['CONTROL', 'PROTECTED'].includes(item.role)) errors.push('CONTROL_OR_PROTECTED_ROUTE_REQUIRED');
    if (!text(item.return_observation_id)) errors.push('DISTINCT_RETURN_OBSERVATION_ID_REQUIRED');
    return { route_id: text(item.route_id) ? item.route_id : null, role: ['CONTROL', 'PROTECTED'].includes(item.role) ? item.role : null, return_observation_id: text(item.return_observation_id) ? item.return_observation_id : null };
  });
  if (new Set(routes.map(item => item.route_id)).size !== routes.length) errors.push('DISTINCT_ROUTE_IDS_REQUIRED');
  if (new Set(routes.map(item => item.return_observation_id)).size !== routes.length) errors.push('DISTINCT_RETURN_OBSERVATIONS_REQUIRED');
  if (!routes.some(item => item.role === 'CONTROL') || !routes.some(item => item.role === 'PROTECTED')) errors.push('CONTROL_AND_PROTECTED_ROUTES_REQUIRED');
  const surfaces = record(proposal.surfaces);
  for (const key of ['L', 'R', 'J', 'G', 'C']) if (!text(surfaces[key])) errors.push(`${key}_MEASUREMENT_PLAN_REQUIRED`);
  return receipt('SAME_EPISODE_PREPARATION', errors, {
    episode_id: text(proposal.episode_id) ? proposal.episode_id : null,
    comparison_frame_id: text(proposal.comparison_frame_id) ? proposal.comparison_frame_id : null,
    common_departure_id: text(proposal.common_departure_id) ? proposal.common_departure_id : null,
    custody_plan_reference: text(proposal.custody_plan_reference) ? proposal.custody_plan_reference : null,
    preregistration_reference: text(proposal.preregistration_reference) ? proposal.preregistration_reference : null,
    routes,
    measurement_plans: Object.fromEntries(['L', 'R', 'J', 'G', 'C'].map(key => [key, text(surfaces[key]) ? surfaces[key] : null])),
    surfaces_observed: [],
    candidate_established: false,
    next_gate: errors.length ? null : 'FIRE_GATE_REVIEW_REQUIRED'
  }, 'DESIGN_READY');
}

export function auditLoomInstrumentLab() {
  return receipt('INSTRUMENT_INVENTORY', [], {
    benches: LOOM_INSTRUMENT_BENCHES,
    donors: LOOM_INSTRUMENT_DONORS,
    clean_room_method_accession: true,
    third_party_source_code_imported: false,
    private_material_imported: false,
    role_agreement_is_evidence_multiplication: false,
    empirical_exteriority_earned_by_installation: false,
    golden_egg_earned_by_installation: false,
    authority_boundaries: ['LAB_RESULT ≠ LOOM_ADMISSION', 'LOOM_ADMISSION ≠ EMPIRICAL_EXECUTION', 'FIRE_GATE_EXECUTION ≠ EMPIRICAL_CLAIM'],
    roles: [
      { role: 'PEDAGOGUE', finding: 'SHOW_CONSEQUENCE_BEFORE_ONTOLOGY' },
      { role: 'APERTURE', finding: 'KEEP_OBSERVABILITY_AND_IDENTIFIABILITY_SEPARATE' },
      { role: 'ATLAS', finding: 'KEEP_ROUTE_CARRIER_RECEIVER_SOURCE_AND_TIME_DISTINCT' },
      { role: 'FADT', finding: 'ERASURE_MUST_NOT_CREATE_ADMISSIBILITY' }
    ]
  });
}
