import {
  APERTURE_COMPOSITION_DOMAINS,
  APERTURE_COMPOSITION_REPLAY_SCHEMA,
  APERTURE_COMPOSITION_VERSION,
  compositionId,
  sealCompositionRecord,
  verifyCompositionRecord
} from './aperture-composition-common.js';
import { verifyApertureCompositionReceipt } from './aperture-composition-receipt.js';
import { verifyAperturePresentationProjection } from './aperture-composition-projection.js';

export async function replayApertureComposition(receipt, projection, input = {}, options = {}) {
  const receiptVerified = await verifyApertureCompositionReceipt(receipt, options);
  const projectionVerified = await verifyAperturePresentationProjection(projection, options);
  const referencesMatch = projection?.composition_receipt_reference === receipt?.receipt_id
    && projection?.composition_receipt_digest === receipt?.receipt_digest;
  const verified = receiptVerified && projectionVerified && referencesMatch;
  return sealCompositionRecord(APERTURE_COMPOSITION_DOMAINS.replay, {
    schema: APERTURE_COMPOSITION_REPLAY_SCHEMA,
    version: APERTURE_COMPOSITION_VERSION,
    replay_id: compositionId('apcomp_replay_', input.replayId, options),
    created_at: input.createdAt || new Date().toISOString(),
    source_receipt_reference: receipt?.receipt_id || null,
    source_receipt_digest: receipt?.receipt_digest || null,
    source_projection_reference: projection?.projection_id || null,
    source_projection_digest: projection?.projection_digest || null,
    status: verified ? 'APERTURE_COMPOSITION_REPLAY_VERIFIED' : 'APERTURE_COMPOSITION_REPLAY_HELD',
    receipt_verified: receiptVerified,
    projection_verified: projectionVerified,
    references_match: referencesMatch,
    composition_reexecuted: false,
    instruments_reexecuted: false,
    reconstruction_reexecuted: false,
    readers_reexecuted: false,
    provider_reexecuted: false,
    ui_mounted: false,
    storage_mutated: false,
    release_authorized: false,
    transport_authorized: false,
    cinder_action_authorized: false,
    automatic_hold: false,
    automatic_ash_action: false,
    replay_digest: null
  }, 'replay_digest', options);
}

export const verifyApertureCompositionReplay = (value, options = {}) => verifyCompositionRecord(
  APERTURE_COMPOSITION_DOMAINS.replay,
  value,
  'replay_digest',
  APERTURE_COMPOSITION_REPLAY_SCHEMA,
  options
);
