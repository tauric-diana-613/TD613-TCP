import { canonicalDigest } from '../dome-world/ash/canonical-json.js';
import { clone, freeze, randomId } from './aperture-v31-core.js';
import {
  inspectChoirCalibrationReceiptSet,
  rejectFreeCalibrationClaims,
  sameStrings,
  uniqueSorted
} from './ash-keep-choir-calibration-inspect.js';
import { verifyChoirCalibrationBinding } from './ash-keep-choir-calibration-binding.js';

export const CHOIR_CALIBRATION_REPLAY_SCHEMA = 'td613.aperture.choir-calibration-replay/v0.1';
const REPLAY_DOMAIN = 'TD613:ASH-KEEP:CHOIR-CALIBRATION-REPLAY:v1';
const SHA256 = /^sha256:[0-9a-f]{64}$/;

function without(value, field) {
  const output = clone(value);
  delete output[field];
  return output;
}

export async function replayChoirCalibrationBinding(value, input = {}, options = {}) {
  rejectFreeCalibrationClaims(input);
  const bindingVerified = await verifyChoirCalibrationBinding(value, options);
  const inspected = await inspectChoirCalibrationReceiptSet(input, options);
  const referencesVerified = JSON.stringify(inspected.references) === JSON.stringify(value?.receipt_references || {});
  const currentCaseVerified = inspected.activeCaseId === value?.case_id
    && inspected.activeCaseMapDigest === value?.case_map_digest
    && inspected.activeRouteMemoryDigest === value?.route_memory_digest
    && inspected.checks.current_case_binding
    && inspected.checks.receipt_case_binding;
  const readerSetVerified = sameStrings(inspected.readers.assays, value?.reader_ids || []);
  const statusVerified = inspected.state === value?.binding_state;
  const verified = bindingVerified
    && inspected.checks.verified_receipts
    && referencesVerified
    && currentCaseVerified
    && readerSetVerified
    && statusVerified;
  const record = {
    schema: CHOIR_CALIBRATION_REPLAY_SCHEMA,
    version: 'v0.1',
    replay_id: input.replayId || randomId('choircalreplay_', options.cryptoImpl || globalThis.crypto),
    created_at: input.createdAt || new Date().toISOString(),
    source_binding_id: value?.binding_id || null,
    source_binding_digest: value?.binding_digest || null,
    status: verified ? 'CHOIR_CALIBRATION_REPLAY_VERIFIED' : 'CHOIR_CALIBRATION_REPLAY_HELD',
    binding_digest_verified: bindingVerified,
    receipt_set_verified: inspected.checks.verified_receipts,
    receipt_references_verified: referencesVerified,
    current_case_verified: currentCaseVerified,
    reader_set_verified: readerSetVerified,
    binding_state_verified: statusVerified,
    componentwise_comparison_recomputed: false,
    readers_reexecuted: false,
    provider_called: false,
    network_called: false,
    storage_mutated: false,
    release_authorized: false,
    transport_authorized: false,
    cinder_action_authorized: false,
    prediction_authorized: false,
    automatic_hold: false,
    automatic_ash_action: false,
    recommendation_not_command: true,
    observations: verified
      ? ['Choir calibration binding and exact receipt set verified without Reader re-execution.']
      : ['Choir calibration replay held for binding, current-case, or receipt-reference repair.'],
    missingness: verified ? [] : uniqueSorted(inspected.failedChecks),
    alternatives: [],
    open_questions: verified ? [] : ['Which binding or referenced receipt changed after sealing?'],
    closure: { required: true, status: 'OPEN' },
    replay_digest: null
  };
  record.replay_digest = await canonicalDigest(REPLAY_DOMAIN, without(record, 'replay_digest'), options);
  return freeze(record);
}

export async function verifyChoirCalibrationReplay(value, options = {}) {
  return Boolean(value
    && value.schema === CHOIR_CALIBRATION_REPLAY_SCHEMA
    && SHA256.test(String(value.replay_digest || ''))
    && value.replay_digest === await canonicalDigest(REPLAY_DOMAIN, without(value, 'replay_digest'), options));
}
