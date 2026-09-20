export const GEMINI_BROWSER_LEDGER_SCHEMA = 'td613.gemini-browser-consumption-ledger/v0.1';
export const GEMINI_BROWSER_LEDGER_KEY = 'TD613_GEMINI_CONSUMPTION_LEDGER_V1';
const MAX_EVENTS = 500;

const safe = (value = '') => String(value ?? '').trim();
const arr = (value) => Array.isArray(value) ? value : [];
const boundedNumber = (value) => value !== null && value !== undefined && value !== ''
  && Number.isFinite(Number(value)) ? Number(value) : null;
const PACIFIC_TIME_ZONE = 'America/Los_Angeles';

function pacificDayKey(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: PACIFIC_TIME_ZONE,
    year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(date);
  const row = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return row.year && row.month && row.day ? `${row.year}-${row.month}-${row.day}` : '';
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

export function currentGeminiDailyQuotaHints(root = globalThis, at = new Date()) {
  const ledger = readLedger(root);
  const currentPacificDay = pacificDayKey(at);
  const models = new Set();
  for (const event of arr(ledger.events)) {
    const quota = event?.quota && typeof event.quota === 'object' ? event.quota : null;
    if (!quota || Number(event?.status) !== 429 || safe(quota.scope) !== 'model') continue;
    const cadence = `${safe(quota.quota_id)} ${safe(quota.metric)}`;
    if (!/(?:PerDay|daily|free_tier_requests)/i.test(cadence)) continue;
    if (!currentPacificDay || pacificDayKey(event?.observed_at) !== currentPacificDay) continue;
    const model = safe(quota.model || event.model).replace(/^models\//, '');
    if (model) models.add(model);
  }
  return {
    schema: 'td613.gemini-browser-daily-quota-hints/v0.1',
    coverage: 'this-browser-current-pacific-day-model-scoped-429s-only',
    pacific_day: currentPacificDay || null,
    models: [...models]
  };
}

export function clearGeminiBrowserLedger(root = globalThis) {
  try { root.localStorage?.removeItem(GEMINI_BROWSER_LEDGER_KEY); } catch {}
  return summarizeGeminiBrowserLedger(root);
}
