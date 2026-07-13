import { compileRoundTripReceipt } from '../../app/engine/aperture-v3-reciprocal-bridge.js';
import { computeManifestDigest, computeReceiptDigest } from '../../app/dome-world/ash/canonical-json.js';

export const ARTIFACT_DIGEST = `sha256:${'a'.repeat(64)}`;
export async function ashReceipt(assurance = 'L1_BROWSER_LOCAL_ARTIFACT_DIGEST') {
  const manifest = {
    schema: 'td613.ash.custody-manifest/v0.8',
    artifact_id: 'artifact_phase5_fixture',
    assurance_class: assurance,
    artifact_digest_present: assurance === 'L1_BROWSER_LOCAL_ARTIFACT_DIGEST',
    artifact_metadata: {
      artifact_digest: assurance === 'L1_BROWSER_LOCAL_ARTIFACT_DIGEST' ? ARTIFACT_DIGEST : null
    },
    manifest_digest: null
  };
  manifest.manifest_digest = await computeManifestDigest(manifest);
  const receipt = {
    schema: 'td613.ash.custody-receipt/v0.8',
    receipt_id: null,
    assurance_class: assurance,
    artifact_digest_present: assurance === 'L1_BROWSER_LOCAL_ARTIFACT_DIGEST',
    manifest_digest: manifest.manifest_digest,
    receipt_digest: null,
    manifest,
    seal: '⟐'
  };
  receipt.receipt_digest = await computeReceiptDigest(receipt);
  receipt.receipt_id = `ashc_${receipt.receipt_digest.slice(7, 27)}`;
  return receipt;
}
export function flowReceipt(route = 'REQUESTED_SYNTHESIS') {
  return {
    schema: 'td613.flowcore.context-receipt/v0.1',
    receipt_id: 'flowctx_0123456789abcdef0123',
    diagnostic_receipt_reference: 'apdiag_0123456789abcdef0123',
    status: 'OPEN', context_posture: 'CONTEXT_READY',
    artifact_reference: null, artifact_blind: true,
    automatic_ash_action: false, prediction_authorized: false,
    recommendation_not_command: true,
    privacy: { visibility: 'PRIVATE_LOCAL_DEFAULT', public_export: false, persistent_server_storage: false },
    task_intent_route: route
  };
}
export function diagnosticReceipt(route = 'REQUESTED_SYNTHESIS') {
  return {
    schema: 'td613.aperture.diagnostic-receipt/v3.0-alpha',
    receipt_id: 'apdiag_0123456789abcdef0123',
    taskIntent: { primary_route: route, runtime_materiality: 'BACKGROUND', automatic_redirect: false }
  };
}
export async function sourceSet({ assurance = 'L1_BROWSER_LOCAL_ARTIFACT_DIGEST', route = 'REQUESTED_SYNTHESIS' } = {}) {
  const ash = await ashReceipt(assurance);
  const flow = flowReceipt(route);
  const roundTrip = await compileRoundTripReceipt(diagnosticReceipt(route), flow);
  return { ash, flow, roundTrip };
}
