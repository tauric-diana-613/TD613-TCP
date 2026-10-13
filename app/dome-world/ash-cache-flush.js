import {
  ASH_CACHE_FLUSH_EPOCH,
  ASH_CACHE_FLUSH_POSTURE,
  validThresholdReadiness,
  resetActiveSession,
  runAshCacheFlush as runRetiredAshCacheFlush
} from './ash-cache-flush-core.js';

export {
  ASH_CACHE_FLUSH_EPOCH,
  ASH_CACHE_FLUSH_POSTURE,
  validThresholdReadiness,
  resetActiveSession
};

// Historical labels retained only for old imports/receipts. They grant no runtime action.
export const ASH_A15_MASS_EVICTION_EPOCH = 'td613.ash.cache-flush/2026-07-27-a15-postclosure-v1';
export const ASH_MASS_EVICTION_RETIRED = true;

export async function runAshCacheFlush(host = globalThis) {
  return runRetiredAshCacheFlush(host);
}
