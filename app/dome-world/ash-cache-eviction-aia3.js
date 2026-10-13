export const ASH_AIA3_CACHE_EPOCH = 'td613.ash.cache-flush/2026-07-27-a15-postclosure-v1';
export const ASH_AIA3_ASSET_EPOCH = '20260727-a15-postclosure-v1';
export const ASH_LEGACY_CACHE_EPOCH = 'td613.ash.cache-flush/2026-07-18-canonical-membrane-v7';
export const ASH_AIA3_EVICTION_POSTURE = 'RETIRED_SITE_EPOCH_AUTHORITY';
const RECEIPT_KEY = 'td613.ash.cache-flush.aia3.receipt';

function writeReceipt(host, receipt) {
  try { host.sessionStorage?.setItem?.(RECEIPT_KEY, JSON.stringify(receipt)); }
  catch {}
}

export async function runAshAia3CacheEviction(host = globalThis) {
  const receipt = Object.freeze({
    schema:'td613.ash.cache-transition-receipt/v1.0-retired',
    epoch:ASH_AIA3_CACHE_EPOCH,
    asset_epoch:ASH_AIA3_ASSET_EPOCH,
    posture:ASH_AIA3_EVICTION_POSTURE,
    performed:false,
    retired:true,
    superseded_by_sitewide_epoch:true,
    legacy_reset_suppressed:true,
    http_cache:{ attempted:false, observed:false, reason:'ASH_EVICTION_RETIRED' },
    cache_names:[],
    worker_scopes:[],
    indexeddb_preserved:true,
    case_data_preserved:true,
    active_session_reset:false,
    local_case_pointer_preserved:true,
    session_epoch_preserved:true,
    storage_cleared:false,
    reload_required:false
  });
  writeReceipt(host, receipt);
  host.__td613AshAia3CacheTransition = receipt;
  return receipt;
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  await runAshAia3CacheEviction(window);
}
