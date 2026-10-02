const deepFreeze = value => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) deepFreeze(child);
    Object.freeze(value);
  }
  return value;
};

export const WESTERN_METHOD_LAB_SCHEMA = 'td613.western-horizon.method-lab/v0.1';

export const WESTERN_METHOD_DONORS = deepFreeze([
  {
    id: 'route-deformation',
    lineage: '#1003 / run 33629043531',
    method: 'Treat provenance observability as route-sensitive and preserve before/after measurements without assuming invariance.',
    accession: 'PUBLIC_METHOD_REIMPLEMENTATION'
  },
  {
    id: 'carrier-separation',
    lineage: '#1004 / run 33630246352',
    method: 'Keep process/planning and output/content provenance as separate carriers with separate failure envelopes.',
    accession: 'PUBLIC_METHOD_REIMPLEMENTATION'
  },
  {
    id: 'receiver-indexing',
    lineage: '#1005 / run 33632056113',
    method: 'Treat the receiver apparatus as an explicit observation coordinate rather than as invisible background.',
    accession: 'PUBLIC_METHOD_REIMPLEMENTATION'
  },
  {
    id: 'receiver-swap',
    lineage: '#1006',
    method: 'Hold artifact, route, carrier, provenance state, custody, and time fixed while receiver apparatus alone changes.',
    accession: 'TD613_OWN_UNMERGED_METHOD'
  },
  {
    id: 'conditional-information-gain',
    lineage: '#1007',
    method: 'A new witness must contribute information unavailable from admitted record A before it can raise an origin claim.',
    accession: 'TD613_OWN_UNMERGED_METHOD'
  }
]);

const unique = values => [...new Set(values)];

export function registerRouteObservation({
  metric,
  baseline,
  observations
} = {}) {
  const errors = [];
  if (typeof metric !== 'string' || metric.length === 0) errors.push('METRIC_REQUIRED');
  if (!Number.isFinite(baseline)) errors.push('FINITE_BASELINE_REQUIRED');
  if (!Array.isArray(observations) || observations.length === 0) errors.push('OBSERVATIONS_REQUIRED');

  const rows = [];
  for (const observation of observations || []) {
    if (typeof observation?.route_id !== 'string' || observation.route_id.length === 0) {
      errors.push('ROUTE_ID_REQUIRED');
      continue;
    }
    if (!Number.isFinite(observation?.value)) {
      errors.push('FINITE_ROUTE_VALUE_REQUIRED');
      continue;
    }
    rows.push({
      route_id: observation.route_id,
      value: observation.value,
      delta_from_baseline: Number.isFinite(baseline) ? observation.value - baseline : null
    });
  }

  const admitted = errors.length === 0;
  return deepFreeze({
    schema: WESTERN_METHOD_LAB_SCHEMA,
    assay: 'ROUTE_OBSERVATION',
    status: admitted ? 'ADMITTED' : 'INADMISSIBLE',
    errors: unique(errors),
    metric: typeof metric === 'string' ? metric : null,
    baseline: Number.isFinite(baseline) ? baseline : null,
    observations: rows,
    route_sensitivity_observed_in_supplied_measurements:
      admitted && rows.some(row => row.delta_from_baseline !== 0),
    causal_route_effect_established: false,
    universal_route_law: false,
    origin_truth_established: false
  });
}

export function registerCarrierObservation({ carriers } = {}) {
  const errors = [];
  if (!Array.isArray(carriers) || carriers.length < 2) errors.push('AT_LEAST_TWO_CARRIERS_REQUIRED');

  const rows = (carriers || []).map(carrier => ({
    carrier_id: carrier?.carrier_id ?? null,
    layer: carrier?.layer ?? null,
    observed: carrier?.observed === true
  }));

  for (const row of rows) {
    if (typeof row.carrier_id !== 'string' || row.carrier_id.length === 0) errors.push('CARRIER_ID_REQUIRED');
    if (typeof row.layer !== 'string' || row.layer.length === 0) errors.push('CARRIER_LAYER_REQUIRED');
  }

  if (new Set(rows.map(row => row.carrier_id)).size !== rows.length) errors.push('DISTINCT_CARRIER_IDS_REQUIRED');
  if (new Set(rows.map(row => row.layer)).size < 2) errors.push('DISTINCT_CARRIER_LAYERS_REQUIRED');

  const admitted = errors.length === 0;
  return deepFreeze({
    schema: WESTERN_METHOD_LAB_SCHEMA,
    assay: 'CARRIER_OBSERVATION',
    status: admitted ? 'ADMITTED' : 'INADMISSIBLE',
    errors: unique(errors),
    carriers: rows,
    heterostratigraphic: admitted,
    scalar_proxy_allowed: false,
    carrier_independence_established: false,
    process_identifiability_established: false,
    origin_truth_established: false
  });
}

const FIXED_RECEIVER_SWAP_FIELDS = Object.freeze([
  'artifact_digest',
  'route_digest',
  'carrier_id',
  'provenance_state_digest',
  'source_custody_digest',
  'observation_window_id'
]);

export function validateReceiverSwapDesign({ left, right } = {}) {
  const errors = [];
  left = left || {};
  right = right || {};

  for (const key of FIXED_RECEIVER_SWAP_FIELDS) {
    if (typeof left[key] !== 'string' || left[key].length === 0) errors.push(`LEFT_${key.toUpperCase()}_REQUIRED`);
    if (typeof right[key] !== 'string' || right[key].length === 0) errors.push(`RIGHT_${key.toUpperCase()}_REQUIRED`);
    if (left[key] !== right[key]) errors.push(`${key.toUpperCase()}_MUST_REMAIN_FIXED`);
  }

  if (typeof left.receiver_apparatus_id !== 'string' || left.receiver_apparatus_id.length === 0) errors.push('LEFT_RECEIVER_APPARATUS_REQUIRED');
  if (typeof right.receiver_apparatus_id !== 'string' || right.receiver_apparatus_id.length === 0) errors.push('RIGHT_RECEIVER_APPARATUS_REQUIRED');
  if (left.receiver_apparatus_id === right.receiver_apparatus_id) errors.push('DISTINCT_RECEIVER_APPARATUS_REQUIRED');

  const admitted = errors.length === 0;
  return deepFreeze({
    schema: WESTERN_METHOD_LAB_SCHEMA,
    assay: 'RECEIVER_SWAP_DESIGN',
    status: admitted ? 'ADMISSIBLE_DESIGN' : 'INADMISSIBLE',
    errors: unique(errors),
    fixed_coordinates: admitted ? [...FIXED_RECEIVER_SWAP_FIELDS] : [],
    sole_allowed_difference: admitted ? 'RECEIVER_APPARATUS' : null,
    receiver_effect_observed: false,
    causal_effect_estimated: false,
    origin_truth_established: false
  });
}

export function registerInformationGainClaim({
  admitted_record_information_bits,
  candidate_witness_information_bits,
  derived_from_admitted_record,
  independently_governed,
  shares_upstream_source,
  bound_to_exact_target_episode,
  externally_measured
} = {}) {
  const errors = [];
  if (!Number.isFinite(admitted_record_information_bits)) errors.push('ADMITTED_RECORD_INFORMATION_REQUIRED');
  if (!Number.isFinite(candidate_witness_information_bits)) errors.push('CANDIDATE_WITNESS_INFORMATION_REQUIRED');
  if (derived_from_admitted_record !== false) errors.push('NON_DERIVATIVE_WITNESS_REQUIRED');
  if (independently_governed !== true) errors.push('INDEPENDENT_GOVERNANCE_REQUIRED');
  if (shares_upstream_source !== false) errors.push('NO_SHARED_UPSTREAM_SOURCE_REQUIRED');
  if (!(candidate_witness_information_bits > 0)) errors.push('POSITIVE_INFORMATION_GAIN_REQUIRED');

  const admitted = errors.length === 0;
  const targetBound = bound_to_exact_target_episode === true;
  const empirical = externally_measured === true;

  return deepFreeze({
    schema: WESTERN_METHOD_LAB_SCHEMA,
    assay: 'INFORMATION_GAIN_CLAIM',
    status: !admitted
      ? 'INADMISSIBLE'
      : empirical && targetBound
        ? 'TARGET_EPISODE_CANDIDATE'
        : 'METHOD_READY',
    errors: unique(errors),
    admitted_record_information_bits:
      Number.isFinite(admitted_record_information_bits) ? admitted_record_information_bits : null,
    candidate_witness_information_bits:
      Number.isFinite(candidate_witness_information_bits) ? candidate_witness_information_bits : null,
    externally_measured: empirical,
    bound_to_exact_target_episode: targetBound,
    empirical_target_exteriority_established: false,
    golden_egg_credit: 0,
    law: 'POSITIVE_INFORMATION_GAIN_IS_NECESSARY_NOT_SUFFICIENT_FOR_TARGET_EXTERIORITY'
  });
}

function roleFinding(role) {
  if (role === 'PEDAGOGUE') return 'SHOW_CONSEQUENCE_BEFORE_ONTOLOGY';
  if (role === 'APERTURE') return 'KEEP_OBSERVABILITY_AND_IDENTIFIABILITY_SEPARATE';
  if (role === 'ATLAS') return 'KEEP_ROUTE_CARRIER_RECEIVER_SOURCE_AND_TIME_DISTINCT';
  return 'ERASURE_MUST_NOT_CREATE_ADMISSIBILITY';
}

export function auditWesternMethodLab() {
  const roles = ['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT'];
  return deepFreeze({
    schema: WESTERN_METHOD_LAB_SCHEMA,
    donors: WESTERN_METHOD_DONORS,
    clean_room_method_accession: true,
    third_party_source_code_imported: false,
    private_material_imported: false,
    role_agreement_is_evidence_multiplication: false,
    empirical_exteriority_earned_by_installation: false,
    golden_egg_earned_by_installation: false,
    roles: roles.map(role => ({ role, finding: roleFinding(role) }))
  });
}
