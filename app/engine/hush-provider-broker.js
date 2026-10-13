export const HUSH_PROVIDER_BROKER_VERSION = 'pr144-provider-broker-quota-circuit/v2-auto-quality';

const MEMORY = new Map();
const STORAGE_KEY = 'td613:hush:provider-broker';
const DEFAULT_PROVIDER = 'gemini-strict';
const DEFAULT_MODEL = 'auto-quality';
const DEFAULT_ENDPOINT = 'https://td613.com/api/hush-generate-strict';
const QUOTA_FLOOR_SECONDS = 120;
const QUOTA_GRACE_SECONDS = 45;
const TIMEOUT_FLOOR_SECONDS = 25;
const STRIKE_WINDOW_MS = 10 * 60 * 1000;

const safe = (value) => String(value ?? '').trim();
const nowMs = () => Date.now();

function canStore() {
  try {
    return typeof localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function readStore() {
  const obj = {};
  for (const [key, value] of MEMORY.entries()) obj[key] = value;
  if (!canStore()) return obj;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    if (parsed && typeof parsed === 'object') Object.assign(obj, parsed);
  } catch {}
  return obj;
}

function writeStore(obj = {}) {
  MEMORY.clear();
  for (const [key, value] of Object.entries(obj)) MEMORY.set(key, value);
  if (!canStore()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {}
}

export function providerKey(input = {}) {
  const provider = safe(input.provider || DEFAULT_PROVIDER) || DEFAULT_PROVIDER;
  const model = safe(input.model || DEFAULT_MODEL) || DEFAULT_MODEL;
  const endpoint = safe(input.endpoint || DEFAULT_ENDPOINT) || DEFAULT_ENDPOINT;
  return `${provider}:${model}:${endpoint}`;
}

export function clearProviderBrokerState() {
  MEMORY.clear();
  if (!canStore()) return;
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

export function readProviderState(input = {}, at = nowMs()) {
  const key = typeof input === 'string' ? input : providerKey(input);
  const store = readStore();
  const entry = store[key] || null;
  if (!entry) return { version: HUSH_PROVIDER_BROKER_VERSION, key, state: 'available', mayCall: true, retryAfterSeconds: 0, strikeCount: 0 };
  const cooldownUntil = Number(entry.cooldownUntil || 0);
  if (cooldownUntil && cooldownUntil > at) {
    return {
      version: HUSH_PROVIDER_BROKER_VERSION,
      key,
      ...entry,
      state: 'cooling_down',
      mayCall: false,
      retryAfterSeconds: Math.max(1, Math.ceil((cooldownUntil - at) / 1000))
    };
  }
  if (cooldownUntil && cooldownUntil <= at) {
    if (Number(entry.strikeCount || 0) > 0 && Number(entry.writtenAt || 0) + STRIKE_WINDOW_MS > at) {
      store[key] = { ...entry, state: 'available', cooldownUntil: 0 };
    } else {
      delete store[key];
    }
    writeStore(store);
  }
  return { version: HUSH_PROVIDER_BROKER_VERSION, key, state: 'available', mayCall: true, retryAfterSeconds: 0, strikeCount: Number(entry?.strikeCount || 0) || 0 };
}

export function providerMayCall(input = {}, at = nowMs()) {
  return readProviderState(input, at);
}

function quotaCooldownSeconds(receipt = {}, previous = {}) {
  const retry = Math.max(0, Number(receipt.retryAfterSeconds || receipt.retry_after_seconds || 0) || 0);
  const previousAt = Number(previous.writtenAt || 0);
  const previousStrikes = previousAt && previousAt + STRIKE_WINDOW_MS > nowMs() ? Number(previous.strikeCount || 0) || 0 : 0;
  const strikeCount = Math.min(6, previousStrikes + 1);
  const strikeBackoff = [0, 120, 210, 360, 600, 900, 1200][strikeCount] || 1200;
  const seconds = Math.max(QUOTA_FLOOR_SECONDS, Math.ceil(retry * 2.5) + QUOTA_GRACE_SECONDS, strikeBackoff);
  return { seconds, strikeCount, providerRetryAfterSeconds: retry };
}

function timeoutCooldownSeconds(receipt = {}, previous = {}) {
  const retry = Math.max(0, Number(receipt.retryAfterSeconds || receipt.retry_after_seconds || 0) || 0);
  const previousAt = Number(previous.writtenAt || 0);
  const previousStrikes = previousAt && previousAt + STRIKE_WINDOW_MS > nowMs() ? Number(previous.strikeCount || 0) || 0 : 0;
  const strikeCount = Math.min(4, previousStrikes + 1);
  const seconds = Math.max(TIMEOUT_FLOOR_SECONDS, retry || 0, [0, 25, 45, 90, 150][strikeCount] || 150);
  return { seconds, strikeCount, providerRetryAfterSeconds: retry };
}

export function writeProviderCooldown(input = {}, receipt = {}, at = nowMs()) {
  const key = providerKey(input);
  const reason = safe(receipt.reason || receipt.error || 'provider_quota_exhausted') || 'provider_quota_exhausted';
  const store = readStore();
  const previous = store[key] || {};
  const isQuota = reason === 'provider_quota_exhausted' || Number(receipt.httpStatus || receipt.http_status || 0) === 429;
  const computed = isQuota ? quotaCooldownSeconds(receipt, previous) : timeoutCooldownSeconds(receipt, previous);
  store[key] = {
    provider: safe(input.provider || receipt.provider || DEFAULT_PROVIDER) || DEFAULT_PROVIDER,
    model: safe(input.model || receipt.model || DEFAULT_MODEL) || DEFAULT_MODEL,
    endpoint: safe(input.endpoint || DEFAULT_ENDPOINT) || DEFAULT_ENDPOINT,
    state: 'cooling_down',
    reason,
    httpStatus: Number(receipt.httpStatus || receipt.http_status || (isQuota ? 429 : 504)) || (isQuota ? 429 : 504),
    retryAfterSeconds: computed.seconds,
    providerRetryAfterSeconds: computed.providerRetryAfterSeconds,
    cooldownUntil: at + computed.seconds * 1000,
    writtenAt: at,
    strikeCount: computed.strikeCount,
    circuitBreaker: isQuota ? 'quota-conservative' : 'timeout-conservative'
  };
  writeStore(store);
  return readProviderState(key, at);
}

export function writeProviderStateFromReceipt(input = {}, receipt = {}, at = nowMs()) {
  const reason = safe(receipt.reason || receipt.error || '').toLowerCase();
  const status = Number(receipt.httpStatus || receipt.status || 0);
  if (reason === 'provider_quota_exhausted' || status === 429) return writeProviderCooldown(input, { ...receipt, reason: 'provider_quota_exhausted', httpStatus: 429 }, at);
  if (reason === 'provider_timeout') return writeProviderCooldown(input, { ...receipt, reason: 'provider_timeout', httpStatus: receipt.httpStatus || 504, retryAfterSeconds: receipt.retryAfterSeconds || 15 }, at);
  return readProviderState(input, at);
}

export function buildProviderHeldReceipt(providerState = {}, extra = {}) {
  const retry = Math.max(0, Number(providerState.retryAfterSeconds || 0) || 0);
  const reason = safe(providerState.reason || 'provider_cooling_down') || 'provider_cooling_down';
  return {
    version: HUSH_PROVIDER_BROKER_VERSION,
    at: new Date().toISOString(),
    status: 'held',
    reason: providerState.state === 'cooling_down' ? 'provider_cooling_down' : reason,
    provider: providerState.provider || extra.provider || DEFAULT_PROVIDER,
    model: providerState.model || extra.model || DEFAULT_MODEL,
    httpStatus: Number(providerState.httpStatus || extra.httpStatus || 429) || 429,
    retryAfterSeconds: retry,
    providerRetryAfterSeconds: Number(providerState.providerRetryAfterSeconds || 0) || null,
    strikeCount: Number(providerState.strikeCount || 0) || 0,
    circuitBreaker: providerState.circuitBreaker || '',
    fallbackReleased: false,
    message: providerState.state === 'cooling_down'
      ? 'Remote provider is cooling down. No fallback was released.'
      : 'Remote provider is unavailable. No fallback was released.',
    nextStep: retry ? 'Try again after the provider cooldown window; the server quality router will move to another eligible model when available.' : 'Review provider settings before retrying.',
    warnings: [...new Set(['provider-cooling-down', reason, ...(providerState.circuitBreaker ? [providerState.circuitBreaker] : []), ...(extra.warnings || [])])],
    triedEndpoints: extra.triedEndpoints || [],
    packetTier: extra.packetTier || '',
    maskEvidenceState: extra.maskEvidenceState || '',
    debugPacketAvailable: Boolean(extra.debugPacketAvailable)
  };
}
