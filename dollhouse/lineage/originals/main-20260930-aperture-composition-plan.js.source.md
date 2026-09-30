import {
  APERTURE_COMPOSITION_DOMAINS,
  APERTURE_COMPOSITION_ORDER,
  APERTURE_COMPOSITION_PLAN_SCHEMA,
  APERTURE_COMPOSITION_VERSION,
  compositionId,
  rejectCompositionAuthorityClaims,
  sealCompositionRecord,
  uniqueSorted,
  verifyCompositionRecord
} from './aperture-composition-common.js';

export async function compileApertureCompositionPlan(input = {}, options = {}) {
  rejectCompositionAuthorityClaims(input);
  const order = Array.isArray(input.layerOrder) ? input.layerOrder.map(String) : [...APERTURE_COMPOSITION_ORDER];
  return sealCompositionRecord(APERTURE_COMPOSITION_DOMAINS.plan, {
    schema: APERTURE_COMPOSITION_PLAN_SCHEMA,
    version: APERTURE_COMPOSITION_VERSION,
    plan_id: compositionId('apcomp_plan_', input.planId, options),
    created_at: input.createdAt || new Date().toISOString(),
    layer_order: order,
    station_ownership: {
      authority_and_custody: 'Ash',
      source_ensemble_lattice_tomography: 'Aperture',
      calibration_evidence: 'Choir',
      candidate_evidence: 'Hush',
      presentation_projection: 'Future Choir UI / read-only',
      closure: 'Human'
    },
    consumer_contracts: {
      authority_context: ['CONTROLLED_SOURCE', 'CHOIR_CALIBRATION_BINDING', 'HUSH_INTERVENTION_RECEIPT'],
      controlled_source: ['SNAPSHOT_LATTICE', 'EXPERIMENT_RUN', 'TOMOGRAPHY_RECEIPT'],
      instrument_ensemble: ['SNAPSHOT_LATTICE', 'EXPERIMENT_RUN', 'TOMOGRAPHY_RECEIPT'],
      snapshot_lattice: ['TOMOGRAPHY_RECEIPT'],
      experiment_run: ['TOMOGRAPHY_RECEIPT'],
      tomography_receipt: ['PRESENTATION_PROJECTION'],
      choir_calibration_binding: ['PRESENTATION_PROJECTION'],
      hush_intervention_receipt: ['PRESENTATION_PROJECTION']
    },
    read_only_projection_required: true,
    provenance_visible_required: true,
    warning_collapse_allowed: false,
    raw_source_allowed: false,
    candidate_body_allowed: false,
    case_map_body_allowed: false,
    route_memory_body_allowed: false,
    provider_log_allowed: false,
    reader_result_body_allowed: false,
    ui_mount_authorized: false,
    automatic_instrument_selection: false,
    automatic_model_selection: false,
    promotion_authorized: false,
    release_authorized: false,
    transport_authorized: false,
    cinder_action_authorized: false,
    automatic_hold: false,
    automatic_ash_action: false,
    universal_score: null,
    evidence_basis: uniqueSorted(input.evidenceBasis || [
      'declared station ownership',
      'fixed layer order',
      'read-only presentation boundary',
      'explicit non-authority ceiling'
    ]),
    missingness: uniqueSorted(input.missingness || []),
    alternatives: uniqueSorted(input.alternatives || []),
    open_questions: uniqueSorted(input.openQuestions || []),
    operator_notes: uniqueSorted(input.operatorNotes || []),
    closure: { required: true, status: String(input.closureStatus || 'OPEN') },
    plan_digest: null
  }, 'plan_digest', options);
}

export const verifyApertureCompositionPlan = (value, options = {}) => verifyCompositionRecord(
  APERTURE_COMPOSITION_DOMAINS.plan,
  value,
  'plan_digest',
  APERTURE_COMPOSITION_PLAN_SCHEMA,
  options
);
