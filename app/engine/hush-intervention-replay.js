import { randomId } from './aperture-v31-core.js';
import {
  HUSH_INTERVENTION_DOMAINS,
  HUSH_INTERVENTION_REPLAY_SCHEMA,
  sealHushRecord,
  verifyHushRecord
} from './hush-intervention-common.js';
import { verifyHushInterventionReceipt } from './hush-intervention-receipt.js';

export async function replayHushInterventionReceipt(value, input = {}, options = {}) {
  const verified = await verifyHushInterventionReceipt(value, options);
  return sealHushRecord(HUSH_INTERVENTION_DOMAINS.replay, {
    schema: HUSH_INTERVENTION_REPLAY_SCHEMA,
    replay_id: input.replayId || randomId('hush_replay_', options.cryptoImpl || globalThis.crypto),
    created_at: input.createdAt || new Date().toISOString(),
    source_receipt_reference: value?.receipt_id || null,
    source_receipt_digest: value?.receipt_digest || null,
    status: verified ? 'HUSH_INTERVENTION_REPLAY_VERIFIED' : 'HUSH_INTERVENTION_REPLAY_HELD',
    intervention_reexecuted: false,
    readers_reexecuted: false,
    provider_reexecuted: false,
    candidate_kept: false,
    release_authorized: false,
    transport_authorized: false,
    cinder_action_authorized: false,
    replay_digest: null
  }, 'replay_digest', options);
}

export const verifyHushInterventionReplay = (value, options = {}) => verifyHushRecord(
  HUSH_INTERVENTION_DOMAINS.replay,
  value,
  'replay_digest',
  HUSH_INTERVENTION_REPLAY_SCHEMA,
  options
);
