export const GEMINI_BROWSER_LEDGER_SCHEMA = 'td613.gemini-browser-consumption-ledger/v0.1';
export const GEMINI_BROWSER_LEDGER_KEY = 'TD613_GEMINI_CONSUMPTION_LEDGER_V1';
const MAX_EVENTS = 500;
const DEFAULT_MODEL_QUOTA_COOLDOWN_SECONDS = 120;
const MAX_MODEL_QUOTA_COOLDOWN_SECONDS = 1800;

const safe = (value = '') => String(value ?? '').trim();
const arr = (value) => Array.isArray(value) ? value : [];
const boundedNumber = (value) => value !== null && value !== undefined && value !== ''
  && Number.isFinite(Number(value)) ? Number(value) : null;

function quotaCooldownSeconds(quota = {}) {
  const observed = boundedNumber(quota?.retry_after_seconds);
  if (observed !== null && observed > 0) {
    return Math.max(1, Math.min(MAX_MODEL_QUOTA_COOLDOWN_SECONDS, Math.ceil(observed)));
  }
  return DEFAULT_MODEL_QUOTA_COOLDOWN_SECONDS;
}

function candidateReceipt(payload = {}) {
  if (!payload || typeof payload !== 'object') return null;
  return payload.gemini_consumption
    || payload.geminiConsumption
    || payload.receipt?.gemini_consumption
    || payload.receipt?.geminiConsumption
    || payload.observations?.gemini_consumption
    || payload.observations?.geminiConsumption
    || payload.failure?.gemini_consumption
    || payload.failure?.geminiConsumption
    || null;
}

function readLedger(root = globalThis) {
  try {
    const parsed = JSON.parse(root.localStorage?.getItem(GEMINI_BROWSER_LEDGER_KEY) || 'null');
    if (parsed?.schema === GEMINI_BROWSER_LEDGER_SCHEMA && Array.isArray(parsed.events)) return parsed;
  } catch {}
  return { schema: GEMINI_BROWSER_LEDGER_SCHEMA, coverage: 'this-browser-interactive-receipts-only', events: [] };
}

function writeLedger(root, ledger) {
  try { root.localStorage?.setItem(GEMINI_BROWSER_LEDGER_KEY, JSON.stringify(ledger)); } catch {}
}

export function ingestGeminiConsumption(payload = {}, root = globalThis) {
  const receipt = candidateReceipt(payload);
  if (!receipt || !Array.isArray(receipt.events) || !receipt.events.length) return summarizeGeminiBrowserLedger(root);
  const ledger = readLedger(root);
  const seen = new Set(ledger.events.map((event) => safe(event?.event_id)).filter(Boolean));
  for (const event of receipt.events) {
    const id = safe(event?.event_id);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ledger.events.push({
      event_id: id,
      observed_at: safe(event.observed_at || receipt.observed_at) || null,
      route: safe(event.route) || 'unknown',
      request_id: safe(event.request_id) || null,
      ordinal: Number(event.ordinal || 0) || null,
      model: safe(event.model) || null,
      status: event.status !== null && event.status !== undefined && Number.isInteger(Number(event.status)) ? Number(event.status) : null,
      outcome: safe(event.outcome) || 'unknown',
      release_witness: event.release_witness === true,
      quota: event.quota && typeof event.quota === 'object' ? {
        scope: safe(event.quota.scope) || null,
        quota_id: safe(event.quota.quota_id) || null,
        metric: safe(event.quota.metric) || null,
        model: safe(event.quota.model) || null,
        limit: boundedNumber(event.quota.limit),
        retry_after_seconds: boundedNumber(event.quota.retry_after_seconds)
      } : null
    });
  }
  ledger.events = ledger.events.slice(-MAX_EVENTS);
  writeLedger(root, ledger);
  return summarizeGeminiBrowserLedger(root);
}

export function summarizeGeminiBrowserLedger(root = globalThis) {
  const ledger = readLedger(root);
  const byRoute = {};
  const byModel = {};
  for (const event of arr(ledger.events)) {
    const route = safe(event?.route) || 'unknown';
    const model = safe(event?.model) || 'unknown';
    byRoute[route] = (byRoute[route] || 0) + 1;
    byModel[model] = (byModel[model] || 0) + 1;
  }
  return {
    schema: GEMINI_BROWSER_LEDGER_SCHEMA,
    coverage: 'this-browser-interactive-receipts-only',
    provider_daily_total: null,
    observed_calls: arr(ledger.events).length,
    by_route: byRoute,
    by_model: byModel,
    events: arr(ledger.events)
  };
}

export function currentGeminiQuotaCooldownHints(root = globalThis, at = new Date()) {
  const ledger = readLedger(root);
  const now = at instanceof Date ? at.getTime() : new Date(at).getTime();
  const active = new Map();
  if (!Number.isFinite(now)) {
    return {
      schema: 'td613.gemini-browser-quota-cooldown-hints/v0.2',
      coverage: 'this-browser-active-model-scoped-429-cooldowns-only',
      observed_at: null,
      models: [],
      cooldown_until_by_model: {}
    };
  }

  for (const event of arr(ledger.events)) {
    const quota = event?.quota && typeof event.quota === 'object' ? event.quota : null;
    if (!quota || Number(event?.status) !== 429 || safe(quota.scope) !== 'model' || event?.release_witness === true) continue;
    const observedAt = new Date(event?.observed_at || '').getTime();
    if (!Number.isFinite(observedAt)) continue;
    const model = safe(event?.model || quota.model).replace(/^models\//, '');
    if (!model) continue;
    const cooldownSeconds = quotaCooldownSeconds(quota);
    const cooldownUntil = observedAt + cooldownSeconds * 1000;
    if (cooldownUntil <= now) continue;
    const previous = active.get(model);
    if (!previous || cooldownUntil > previous.cooldownUntil) {
      active.set(model, { cooldownUntil, retryAfterSeconds: cooldownSeconds });
    }
  }

  const models = [...active.keys()];
  return {
    schema: 'td613.gemini-browser-quota-cooldown-hints/v0.2',
    coverage: 'this-browser-active-model-scoped-429-cooldowns-only',
    observed_at: new Date(now).toISOString(),
    models,
    cooldown_until_by_model: Object.fromEntries(models.map((model) => [
      model,
      new Date(active.get(model).cooldownUntil).toISOString()
    ])),
    retry_after_seconds_by_model: Object.fromEntries(models.map((model) => [
      model,
      active.get(model).retryAfterSeconds
    ]))
  };
}

export function clearGeminiBrowserLedger(root = globalThis) {
  try { root.localStorage?.removeItem(GEMINI_BROWSER_LEDGER_KEY); } catch {}
  return summarizeGeminiBrowserLedger(root);
}
