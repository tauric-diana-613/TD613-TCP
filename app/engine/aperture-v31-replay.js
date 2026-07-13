import { freeze, randomId, recordDigest, verifyRecord } from './aperture-v31-core.js';
import { verifyTomographyReceipt } from './aperture-v31-reconstruction.js';

export const TOMOGRAPHY_REPLAY_SCHEMA = 'td613.aperture.tomography-replay/v0.1';
export const TOMOGRAPHY_REPLAY_DOMAIN = 'TD613:V31:TOMOGRAPHY-REPLAY:v1';

const FORBIDDEN = new Set(['raw_bytes', 'raw_content', 'artifact_digest', 'claim_ceiling']);
function forbiddenPaths(value, path = '$', found = []) {
  if (!value || typeof value !== 'object') return found;
  for (const [key, item] of Object.entries(value)) {
    const next = `${path}.${key}`;
    if (FORBIDDEN.has(key)) found.push(next);
    forbiddenPaths(item, next, found);
  }
  return found;
}

export async function replayTomographyReceipt(receipt, options = {}) {
  const digestValid = await verifyTomographyReceipt(receipt, options);
  const forbidden = forbiddenPaths(receipt);
  const status = digestValid && forbidden.length === 0 ? 'REPLAY_VERIFIED' : 'REPLAY_HELD';
  const replay = {
    schema: TOMOGRAPHY_REPLAY_SCHEMA,
    replay_id: options.replayId || randomId('atreplay_', options.cryptoImpl || globalThis.crypto),
    created_at: options.createdAt || new Date().toISOString(),
    source_receipt_id: receipt?.receipt_id || null,
    source_receipt_digest: receipt?.receipt_digest || null,
    status,
    digest_verified: digestValid,
    forbidden_paths: forbidden,
    reconstruction_reexecuted: false,
    raw_source_restored: false,
    operator_closure: { required: true, status: 'OPEN' },
    replay_digest: null
  };
  replay.replay_digest = await recordDigest(TOMOGRAPHY_REPLAY_DOMAIN, replay, 'replay_digest', options);
  return freeze(replay);
}

export const verifyTomographyReplay = (value, options = {}) => verifyRecord(TOMOGRAPHY_REPLAY_DOMAIN, value, 'replay_digest', TOMOGRAPHY_REPLAY_SCHEMA, options);
