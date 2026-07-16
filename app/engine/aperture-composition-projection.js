import {
  APERTURE_COMPOSITION_DOMAINS,
  APERTURE_PRESENTATION_PROJECTION_SCHEMA,
  APERTURE_COMPOSITION_VERSION,
  compositionId,
  forbiddenProjectionPaths,
  sealCompositionRecord,
  verifyCompositionRecord
} from './aperture-composition-common.js';
import { verifyApertureCompositionReceipt } from './aperture-composition-receipt.js';

export async function compileAperturePresentationProjection(receipt, input = {}, options = {}) {
  const receiptVerified = await verifyApertureCompositionReceipt(receipt, options);
  const forbidden = forbiddenProjectionPaths(input);
  const eligible = receiptVerified
    && receipt?.composition_state === 'COMPOSITION_ELIGIBLE'
    && receipt?.presentation_projection_eligible === true
    && forbidden.length === 0;
  return sealCompositionRecord(APERTURE_COMPOSITION_DOMAINS.projection, {
    schema: APERTURE_PRESENTATION_PROJECTION_SCHEMA,
    version: APERTURE_COMPOSITION_VERSION,
    projection_id: compositionId('apcomp_projection_', input.projectionId, options),
    created_at: input.createdAt || new Date().toISOString(),
    composition_receipt_reference: receipt?.receipt_id || null,
    composition_receipt_digest: receipt?.receipt_digest || null,
    status: eligible ? 'PRESENTATION_READY' : 'PRESENTATION_HELD',
    receipt_verified: receiptVerified,
    forbidden_paths: forbidden,
    case_reference: receipt?.case_id || null,
    layer_order: receipt?.layer_order || [],
    layer_references: receipt?.layer_references || {},
    composition_state: receipt?.composition_state || null,
    holds: receipt?.holds || ['PRESENTATION_BOUNDARY_HOLD'],
    tomography_posture: receipt?.tomography_posture || {},
    choir_posture: receipt?.choir_posture || {},
    hush_posture: receipt?.hush_posture || {},
    render_contract: {
      read_only: true,
      provenance_visible: true,
      warnings_visible: true,
      warnings_collapsible: false,
      instruments_selectable: false,
      models_selectable: false,
      candidate_selectable: false,
      mutation_controls_present: false
    },
    raw_source_present: false,
    candidate_body_present: false,
    case_map_body_present: false,
    route_memory_body_present: false,
    provider_log_present: false,
    reader_result_body_present: false,
    ui_mounted: false,
    ui_mount_authorized: false,
    instruments_executed: false,
    readers_executed: false,
    provider_called: false,
    network_called: false,
    storage_mutated: false,
    promotion_authorized: false,
    release_authorized: false,
    transport_authorized: false,
    cinder_action_authorized: false,
    automatic_hold: false,
    automatic_ash_action: false,
    recommendation_not_command: true,
    universal_score: null,
    projection_digest: null
  }, 'projection_digest', options);
}

export const verifyAperturePresentationProjection = (value, options = {}) => verifyCompositionRecord(
  APERTURE_COMPOSITION_DOMAINS.projection,
  value,
  'projection_digest',
  APERTURE_PRESENTATION_PROJECTION_SCHEMA,
  options
);
