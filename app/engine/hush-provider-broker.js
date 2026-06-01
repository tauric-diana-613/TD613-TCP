export const HUSH_PROVIDER_BROKER_VERSION = 'pr124-provider-broker/v1';

const MEMORY = new Map();
const STORAGE_KEY = 'td613:hush:provider-broker';
const DEFAULT_PROVIDER = 'gemini-strict';
const DEFAULT_MODEL = 'gemini-2.5-flash-lite';
const DEFAULT_ENDPOINT = 'https://td613.com/api/hush-generate-strict';

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
  if (!entry) return { version: HUSH_PROVIDER_BROKER_VERSION, key, state: 'available', mayCall: true, retryAfterSeconds: 0 };
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
    delete store[key];
    writeStore(store);
  }
  return { version: HUSH_PROVIDER_BROKER_VERSION, key, state: 'available', mayCall: true, retryAfterSeconds: 0 };
}

export function providerMayCall(input = {}, at = nowMs()) {
  return readProviderState(input, at);
}

export function writeProviderCooldown(input = {}, receipt = {}, at = nowMs()) {
  const key = providerKey(input);
  const retry = Math.max(1, Number(receipt.retryAfterSeconds || receipt.retry_after_seconds || 0) || 0);
  const reason = safe(receipt.reason || receipt.error || 'provider_quota_exhausted') || 'provider_quota_exhausted';
  const store = readStore();
  store[key] = {
    provider: safe(input.provider || receipt.provider || DEFAULT_PROVIDER) || DEFAULT_PROVIDER,
    model: safe(input.model || receipt.model || DEFAULT_MODEL) || DEFAULT_MODEL,
    endpoint: safe(input.endpoint || DEFAULT_ENDPOINT) || DEFAULT_ENDPOINT,
    state: 'cooling_down',
    reason,
    httpStatus: Number(receipt.httpStatus || receipt.http_status || 429) || 429,
    retryAfterSeconds: retry,
    cooldownUntil: at + retry * 1000,
    writtenAt: at
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
    fallbackReleased: false,
    message: providerState.state === 'cooling_down'
      ? 'Remote provider is cooling down. No fallback was released.'
      : 'Remote provider is unavailable. No fallback was released.',
    nextStep: retry ? 'Try again after the provider cooldown window or configure a higher-quota provider key.' : 'Review provider settings before retrying.',
    warnings: [...new Set(['provider-cooling-down', reason, ...(extra.warnings || [])])],
    triedEndpoints: extra.triedEndpoints || [],
    packetTier: extra.packetTier || '',
    maskEvidenceState: extra.maskEvidenceState || '',
    debugPacketAvailable: Boolean(extra.debugPacketAvailable)
  };
}
