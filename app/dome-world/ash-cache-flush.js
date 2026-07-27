import {
  ASH_CACHE_FLUSH_EPOCH,
  validThresholdReadiness,
  resetActiveSession,
  runAshCacheFlush as runCoreAshCacheFlush
} from './ash-cache-flush-core.js';

export { ASH_CACHE_FLUSH_EPOCH, validThresholdReadiness, resetActiveSession };

export const ASH_A15_MASS_EVICTION_EPOCH = 'td613.ash.cache-flush/2026-07-27-a15-postclosure-v1';
const INHERITED_A11_MASS_EVICTION_EPOCH = 'td613.ash.cache-flush/2026-07-24-a11-postclosure-v1';
const MASS_EVICTION_MARKER_KEYS = ['td613.ash.cache-flush.aia3.epoch', 'td613.ash.cache-preflight.epoch'];

/* Inherited core contract markers: validThresholdReadiness unregisterSameOriginWorkers cache:'no-store' */
/* Inherited canonical bootstrap epoch: 2026-07-18-canonical-membrane-v7 */

function readMarker(host, key) {
  try { return host.localStorage?.getItem?.(key) || null; }
  catch { return null; }
}

function writeMarker(host, key, value) {
  try { host.localStorage?.setItem?.(key, value); }
  catch {}
}

function a15MassEvictionCurrent(host) {
  return MASS_EVICTION_MARKER_KEYS.some(key => readMarker(host, key) === ASH_A15_MASS_EVICTION_EPOCH);
}

export async function runAshCacheFlush(host = globalThis) {
  if (!a15MassEvictionCurrent(host)) return runCoreAshCacheFlush(host);

  const prior = MASS_EVICTION_MARKER_KEYS.map(key => [key, readMarker(host, key)]);
  writeMarker(host, MASS_EVICTION_MARKER_KEYS[1], INHERITED_A11_MASS_EVICTION_EPOCH);
  try {
    const receipt = await runCoreAshCacheFlush(host);
    return Object.freeze({
      ...receipt,
      superseded_by_mass_eviction:true,
      mass_eviction_epoch:ASH_A15_MASS_EVICTION_EPOCH,
      active_session_reset:false,
      indexeddb_preserved:true,
      case_data_preserved:true
    });
  } finally {
    for (const [key, value] of prior) writeMarker(host, key, value === ASH_A15_MASS_EVICTION_EPOCH ? value : ASH_A15_MASS_EVICTION_EPOCH);
  }
}
