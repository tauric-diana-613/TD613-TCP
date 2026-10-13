// Ash cache-transition compatibility surface.
// Historical eviction is retired: the 2026-09-27 site-wide browser epoch is the
// sole stale-client migration authority. These exports remain so the Ash museum
// surface can load without performing cache, worker, storage, or network mutation.
export const ASH_CACHE_FLUSH_EPOCH = 'td613.ash.cache-flush/2026-07-18-canonical-membrane-v7';
export const ASH_CACHE_FLUSH_POSTURE = 'RETIRED_SITE_EPOCH_AUTHORITY';

const RECEIPT_KEY = 'td613.ash.cache-flush.receipt';
const READINESS_KEY = 'td613:ash-threshold:readiness:v0.1';
const POINTER_KEY = 'td613.ash-keep.current-case';
const SESSION_EPOCH_KEY = 'td613.ash.session.epoch';
const TRANSITION_QUERY_KEYS = ['ash_flush', 'asset_epoch', 'cache_nonce', 'arrival'];
const READINESS_MAX_AGE_MS = 15 * 60 * 1000;
const READINESS_CLOCK_SKEW_MS = 60 * 1000;
const READINESS_ROUTES = new Set(['/dome-world/ash-threshold.html', '/dome-world/ash-keep.html']);

function writeReceipt(receipt, host = globalThis) {
  try { host.sessionStorage?.setItem?.(RECEIPT_KEY, JSON.stringify(receipt)); }
  catch {}
}

export function validThresholdReadiness(host = globalThis, storage = host.sessionStorage) {
  try {
    const url = new URL(host.location.href);
    if (!READINESS_ROUTES.has(url.pathname)) return false;
    const receipt = JSON.parse(storage?.getItem?.(READINESS_KEY) || 'null');
    const observedAt = Date.parse(receipt?.observed_at || '');
    const age = Date.now() - observedAt;
    return receipt?.schema === 'td613.ash.readiness-receipt/v0.1'
      && receipt?.lifecycle_schema === 'td613.ash.lifecycle/v0.1'
      && receipt?.state === 'READINESS_OBSERVED'
      && receipt?.source_surface === 'dome-world-ash-threshold'
      && receipt?.threshold_gestures?.arrival_acknowledged === true
      && receipt?.threshold_gestures?.boundary_acknowledged === true
      && receipt?.threshold_gestures?.custody_acknowledged === true
      && receipt?.raw_content_accepted === false
      && receipt?.raw_content_persisted === false
      && receipt?.transport_performed === false
      && receipt?.readiness_is_custody === false
      && typeof receipt?.readiness_digest === 'string'
      && /^sha256:[0-9a-f]{64}$/i.test(receipt.readiness_digest)
      && Number.isFinite(observedAt)
      && age >= -READINESS_CLOCK_SKEW_MS
      && age <= READINESS_MAX_AGE_MS;
  } catch {
    return false;
  }
}

// Case-close remains an explicit user action and is not part of retired eviction.
export function resetActiveSession(host = globalThis) {
  const clearedSessionKeys = [];
  const preservedSessionKeys = [];
  try {
    host.localStorage?.removeItem?.(POINTER_KEY);
    host.localStorage?.removeItem?.(SESSION_EPOCH_KEY);
  } catch {}
  try {
    const storage = host.sessionStorage;
    const preserveReadiness = validThresholdReadiness(host, storage);
    if (storage) {
      for (let index = storage.length - 1; index >= 0; index -= 1) {
        const key = storage.key(index);
        if (!key || !/^td613(?::|\.)ash/i.test(key)) continue;
        if (key === READINESS_KEY && preserveReadiness) {
          preservedSessionKeys.push(key);
          continue;
        }
        storage.removeItem(key);
        clearedSessionKeys.push(key);
      }
    }
  } catch {}
  try {
    host.document?.documentElement?.classList?.remove?.('ash-has-current-case');
    if (host.document?.documentElement) host.document.documentElement.dataset.ashSessionOpen = 'false';
    if (host.document?.body) host.document.body.dataset.ashCaseClosed = 'true';
  } catch {}
  return Object.freeze({ clearedSessionKeys, preservedSessionKeys });
}

function cleanTransitionUrl(host = globalThis) {
  try {
    const url = new URL(host.location.href);
    let changed = false;
    for (const key of TRANSITION_QUERY_KEYS) {
      if (url.searchParams.has(key)) {
        url.searchParams.delete(key);
        changed = true;
      }
    }
    if (changed) host.history?.replaceState?.(null, '', `${url.pathname}${url.search}${url.hash}`);
    return changed;
  } catch {
    return false;
  }
}

export async function runAshCacheFlush(host = globalThis) {
  const transition_url_cleaned = cleanTransitionUrl(host);
  const receipt = Object.freeze({
    schema:'td613.ash.cache-transition-receipt/v1.0-retired',
    epoch:ASH_CACHE_FLUSH_EPOCH,
    posture:ASH_CACHE_FLUSH_POSTURE,
    performed:false,
    retired:true,
    superseded_by_sitewide_epoch:true,
    reload_required:false,
    navigation_replaced:false,
    http_cache:{ attempted:false, observed:false, reason:'ASH_EVICTION_RETIRED' },
    cache_names:[],
    worker_scopes:[],
    indexeddb_preserved:true,
    case_data_preserved:true,
    active_session_reset:false,
    local_case_pointer_preserved:true,
    storage_cleared:false,
    readiness_receipt_preserved:Boolean(host.sessionStorage?.getItem?.(READINESS_KEY)),
    transition_url_cleaned
  });
  writeReceipt(receipt, host);
  host.__td613AshCacheTransition = receipt;
  return receipt;
}
