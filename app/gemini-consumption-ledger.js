export const GEMINI_BROWSER_LEDGER_SCHEMA = 'td613.gemini-browser-consumption-ledger/v0.1';
export const GEMINI_BROWSER_LEDGER_KEY = 'TD613_GEMINI_CONSUMPTION_LEDGER_V1';
const MAX_EVENTS = 500;

const safe = (value = '') => String(value ?? '').trim();
const arr = (value) => Array.isArray(value) ? value : [];
const boundedNumber = (value) => value !== null && value !== undefined && value !== ''
  && Number.isFinite(Number(value)) ? Number(value) : null;

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

export function clearGeminiBrowserLedger(root = globalThis) {
  try { root.localStorage?.removeItem(GEMINI_BROWSER_LEDGER_KEY); } catch {}
  return summarizeGeminiBrowserLedger(root);
}
