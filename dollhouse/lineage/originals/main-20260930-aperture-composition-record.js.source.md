import {
  APERTURE_COMPOSITION_DOMAINS,
  APERTURE_COMPOSITION_RECEIPT_SCHEMA,
  APERTURE_COMPOSITION_VERSION,
  compositionId,
  sealCompositionRecord,
  uniqueSorted
} from './aperture-composition-common.js';
import { compositionLayerReferences } from './aperture-composition-inspect.js';

export function compileApertureCompositionRecord(input, inspection, options = {}) {
  const { current, missing, verified, checks, state } = inspection;
  const eligible = state === 'COMPOSITION_ELIGIBLE';
  return sealCompositionRecord(APERTURE_COMPOSITION_DOMAINS.receipt, {
    schema: APERTURE_COMPOSITION_RECEIPT_SCHEMA,
    version: APERTURE_COMPOSITION_VERSION,
    receipt_id: compositionId('apcomp_receipt_', input.receiptId, options),
    created_at: input.createdAt || new Date().toISOString(),
    case_id: current.caseId || null,
    case_map_digest: current.caseMapDigest || null,
    route_memory_digest: current.routeMemoryDigest || null,
    layer_order: input.plan?.layer_order || [],
    layer_references: compositionLayerReferences(input),
    verified,
    binding_checks: checks,
    missing_layers: missing,
    composition_state: state,
    composition_eligible: eligible,
    presentation_projection_eligible: eligible,
    holds: eligible ? [] : [state],
    tomography_posture: {
      status: input.tomographyReceipt?.status || null,
      assurance_class: input.tomographyReceipt?.assurance_class || null,
      warnings: input.tomographyReceipt?.holds || []
    },
    choir_posture: {
      binding_state: input.choirBinding?.binding_state || null,
      calibration_eligible: input.choirBinding?.calibration_eligible === true,
      universal_score: null
    },
    hush_posture: {
      intervention_state: input.hushReceipt?.intervention_state || null,
      candidate_status: input.hushReceipt?.candidate_status || null,
      candidate_kept: false
    },
    ui_mounted: false,
    ui_mount_authorized: false,
    instruments_executed_by_composition: false,
    readers_executed_by_composition: false,
    provider_called_by_composition: false,
    reconstruction_reexecuted: false,
    network_called: false,
    storage_mutated: false,
    promotion_authorized: false,
    release_authorized: false,
    transport_authorized: false,
    cinder_action_authorized: false,
    automatic_hold: false,
    automatic_ash_action: false,
    automatic_instrument_selection: false,
    automatic_model_selection: false,
    recommendation_not_command: true,
    universal_score: null,
    source_status: 'DERIVED',
    evidence_basis: uniqueSorted(input.evidenceBasis || [
      'verified current Authority Context',
      'verified Aperture v3.1 source-to-tomography chain',
      'verified receipt-bound Choir calibration',
      'verified lifecycle-bound Hush intervention receipt',
      'fixed read-only presentation boundary'
    ]),
    missingness: uniqueSorted([
      ...(input.missingness || []),
      ...missing.map(value => `missing layer: ${value}`),
      ...Object.entries(verified).filter(([, value]) => !value).map(([key]) => `unverified layer: ${key}`),
      ...Object.entries(checks).filter(([, value]) => !value).map(([key]) => `binding check failed: ${key}`)
    ]),
    alternatives: uniqueSorted(input.alternatives || [
      'repair receipt references without rerunning instruments',
      'rebind to the current Authority Context',
      'preserve an ineligible layer as an explicit hold',
      'compile a new composition plan when order changes'
    ]),
    open_questions: uniqueSorted(input.openQuestions || []),
    operator_notes: uniqueSorted(input.operatorNotes || []),
    closure: { required: true, status: String(input.closureStatus || 'OPEN') },
    receipt_digest: null
  }, 'receipt_digest', options);
}
