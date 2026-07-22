import {
  createBlindPrecommitment,
  runBlindCustodyChallenge,
  blindChallengeContainsRawText
} from './safe-harbor-blind-custody-challenge.js';
import {
  buildPerturbationInvarianceReceipt,
  perturbationReceiptContainsRawText
} from './safe-harbor-perturbation-invariance.js';

export const TRACK_R_SCHEMA = 'td613.safe-harbor.track-r/v1';
export const TRACK_R_GATE = 'td613.safe-harbor.track-r-explicit-invocation/v1';

function clone(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
function isObject(value) { return Boolean(value && typeof value === 'object' && !Array.isArray(value)); }

function hold(packet, blocker, detail) {
  const out = clone(packet || {});
  out.bridge = isObject(out.bridge) ? out.bridge : {};
  out.bridge.export_gate = isObject(out.bridge.export_gate) ? out.bridge.export_gate : {};
  out.bridge.export_gate.ready = false;
  out.bridge.export_gate.state = 'hold';
  out.bridge.export_gate.blockers = Array.from(new Set([...(out.bridge.export_gate.blockers || []), blocker]));
  out.track_r = {
    schema_version: TRACK_R_SCHEMA,
    gate_policy_version: TRACK_R_GATE,
    status: 'held',
    blocker,
    detail,
    baseline_intake_authorized: false,
    production_promotion_authorized: false
  };
  return out;
}

export async function runSafeHarborTrackR(packet = {}, input = {}, options = {}) {
  if (!isObject(packet) || packet.schema_version !== 'td613.safe-harbor.packet/v1') return hold(packet, 'track-r-packet-invalid', 'Track R requires a Safe Harbor packet/v1 object.');
  if (options.researchMode !== true) return hold(packet, 'track-r-explicit-invocation-required', 'Research Track R cannot run through baseline entrant intake.');
  if (options.operatorGesture !== 'AUTHORIZE_TRACK_R_RESEARCH_EXECUTION') return hold(packet, 'track-r-operator-gesture-required', 'A packet-scoped research execution gesture is required.');
  const precommitment = await createBlindPrecommitment({
    windows: input.windows || [],
    packet_hash_sha256: packet.packet_hash_sha256,
    selection_nonce: input.selection_nonce,
    selection_seed_authority: input.selection_seed_authority,
    sequestered_at_utc: input.sequestered_at_utc,
    profile_policy: input.profile_policy
  });
  const blind = await runBlindCustodyChallenge({
    precommitment_bundle: precommitment,
    controls: input.controls || [],
    ranking_nonce: input.ranking_nonce,
    leakage_assessment: input.leakage_assessment,
    calibration_triads_completed: input.calibration_triads_completed
  });
  const perturbation = await buildPerturbationInvarianceReceipt({
    ...(input.perturbation || {}),
    blind_custody_challenge_ref: blind.result_digest,
    calibration_triads_completed: input.calibration_triads_completed
  });
  const out = clone(packet);
  out.authorship_evidence = isObject(out.authorship_evidence) ? out.authorship_evidence : {};
  out.authorship_evidence.blind_custody_challenge = blind;
  out.authorship_evidence.perturbation_invariance = perturbation;
  out.track_r = {
    schema_version: TRACK_R_SCHEMA,
    gate_policy_version: TRACK_R_GATE,
    status: 'research-executed-unpromoted',
    baseline_intake_authorized: false,
    production_promotion_authorized: false,
    blind_result_digest: blind.result_digest,
    restoration_receipt_digest: perturbation.restoration_receipt.restoration_receipt_digest,
    adverse_results_preserved: true,
    raw_text_included: false,
    claim_ceiling: 'Research-only packet-internal stylometric falsification and deformation evidence; not identity adjudication or universal authorship proof.'
  };
  if (blindChallengeContainsRawText(blind) || perturbationReceiptContainsRawText(perturbation)) return hold(out, 'track-r-raw-text-receipt-hold', 'Research receipts must not export raw writing.');
  return out;
}
