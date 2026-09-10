export const GEMINI_MODEL_POLICY_VERSION = 'td613.gemini-model-policy/v3-frontier-quality-floor';

import { MODEL_CATALOG, assessGeminiEligibility } from './gemini-model-registry.js';
import { listGeminiGenerateContentModels } from './gemini-model-discovery.js';

// Interactive generation never defaults to Flash-Lite. Operator-order remains an
// explicit escape hatch, while quality-first follows the current stable Flash frontier.
const QUALITY_ORDER = Object.freeze([
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3-flash-preview',
  'gemini-2.5-flash'
]);

const TASK_DEFAULTS = Object.freeze({
  'hush-transform': QUALITY_ORDER,
  'khonapolit-dialogue': QUALITY_ORDER,
  'general-text': QUALITY_ORDER,
  readiness: Object.freeze(['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-2.5-flash-lite'])
});

const MODEL_STATE = new Map();

const safe = (value = '') => String(value ?? '').trim();
const normModel = (value = '') => safe(value).replace(/^models\//, '');
const uniq = (values = []) => [...new Set(values.map(normModel).filter(Boolean))];
const splitModels = (value = '') => safe(value).split(',').map(normModel).filter(Boolean);

function routeEnvNames(task = 'general-text') {
  if (task === 'hush-transform') return { preferred: 'HUSH_GEMINI_MODEL', fallbacks: 'HUSH_GEMINI_FALLBACKS' };
  if (task === 'khonapolit-dialogue') return { preferred: 'KHONAPOLIT_GEMINI_MODEL', fallbacks: 'KHONAPOLIT_GEMINI_FALLBACKS' };
  return { preferred: '', fallbacks: '' };
}

function disabledModels(env = process.env) {
  return new Set(splitModels(env.GEMINI_DISABLED_MODELS));
}

function routeSpecificModels(task = 'general-text', env = process.env) {
  const names = routeEnvNames(task);
  return uniq([
    ...(names.preferred ? splitModels(env[names.preferred]) : []),
    ...(names.fallbacks ? splitModels(env[names.fallbacks]) : [])
  ]);
}

function legacyGlobalModels(env = process.env) {
  return uniq([...splitModels(env.GEMINI_MODEL), ...splitModels(env.GEMINI_MODEL_FALLBACKS)]);
}

function routingMode(env = process.env) {
  if (/^(?:1|true|yes)$/i.test(safe(env.GEMINI_MODEL_OVERRIDE))) return 'operator-order';
  const mode = safe(env.GEMINI_ROUTING_MODE || 'quality-first').toLowerCase();
  return mode === 'operator-order' ? 'operator-order' : 'quality-first';
}

function cooldownFor(status = 0, timedOut = false, retryAfterSeconds = 0, strike = 1) {
  if (status === 429) return Math.max(120, retryAfterSeconds || 0, Math.min(1800, 120 * (2 ** Math.max(0, strike - 1))));
  if (status === 404 || status === 400) return 60 * 60;
  if (timedOut || status === 408 || status === 504) return Math.min(300, 30 * Math.max(1, strike));
  if (status >= 500 || status === 599) return Math.min(180, 20 * Math.max(1, strike));
  return 0;
}

export function clearGeminiModelState() {
  MODEL_STATE.clear();
}

export function recordGeminiModelOutcome(model, outcome = {}, at = Date.now()) {
  const id = normModel(model);
  if (!id) return null;
  const previous = MODEL_STATE.get(id) || {};
  if (outcome.ok === true && Number(outcome.status || 200) < 400) {
    const next = Object.freeze({ model: id, state: 'available', strikeCount: 0, cooldownUntil: 0, lastSuccessAt: at, lastStatus: Number(outcome.status || 200) });
    MODEL_STATE.set(id, next);
    return next;
  }
  const recent = Number(previous.writtenAt || 0) + 10 * 60 * 1000 > at;
  const strikeCount = Math.min(6, (recent ? Number(previous.strikeCount || 0) : 0) + 1);
  const seconds = cooldownFor(Number(outcome.status || 0), Boolean(outcome.timedOut), Number(outcome.retryAfterSeconds || 0), strikeCount);
  const next = Object.freeze({
    model: id,
    state: seconds ? 'cooling_down' : 'available',
    strikeCount,
    cooldownUntil: seconds ? at + seconds * 1000 : 0,
    retryAfterSeconds: seconds,
    writtenAt: at,
    lastStatus: Number(outcome.status || 0),
    reason: safe(outcome.reason || outcome.error || (outcome.timedOut ? 'provider_timeout' : 'provider_failure'))
  });
  MODEL_STATE.set(id, next);
  return next;
}

export function readGeminiModelState(model, at = Date.now()) {
  const id = normModel(model);
  const state = MODEL_STATE.get(id);
  if (!state) return Object.freeze({ model: id, state: 'available', mayCall: true, retryAfterSeconds: 0, strikeCount: 0 });
  if (state.cooldownUntil && state.cooldownUntil > at) return Object.freeze({ ...state, mayCall: false, retryAfterSeconds: Math.max(1, Math.ceil((state.cooldownUntil - at) / 1000)) });
  if (state.cooldownUntil && state.cooldownUntil <= at) {
    const next = Object.freeze({ ...state, state: 'available', mayCall: true, cooldownUntil: 0, retryAfterSeconds: 0 });
    MODEL_STATE.set(id, next);
    return next;
  }
  return Object.freeze({ ...state, mayCall: true, retryAfterSeconds: 0 });
}

export function resolveGeminiModelPlan({ task = 'general-text', env = process.env, at = Date.now(), maxModels = 8, providerListing } = {}) {
  const defaults = TASK_DEFAULTS[task] || TASK_DEFAULTS['general-text'];
  const disabled = disabledModels(env);
  const routeSpecific = routeSpecificModels(task, env);
  const legacyGlobal = legacyGlobalModels(env);
  const explicit = uniq([...routeSpecific, ...legacyGlobal]);
  const mode = routingMode(env);
  const requested = uniq(mode === 'operator-order'
    ? [...routeSpecific, ...legacyGlobal, ...defaults]
    : [...defaults, ...routeSpecific, ...legacyGlobal]
  ).filter((model) => !disabled.has(model));
  const rows = requested.map((model, index) => {
    const state = readGeminiModelState(model, at);
    const metadata = MODEL_CATALOG[model] || Object.freeze({ tier: 'operator-supplied', stability: 'unknown', quality: 0, role: 'operator-supplied' });
    const eligibility = assessGeminiEligibility(model, { explicit: explicit.includes(model), listing: providerListing, at });
    return Object.freeze({ eligibility, model, index, explicit: explicit.includes(model), routeSpecific: routeSpecific.includes(model), legacyGlobal: legacyGlobal.includes(model), metadata, state });
  });
  const available = rows.filter((row) => row.state.mayCall);
  const eligible = available.filter((row) => row.eligibility.eligible);
  const cooling = rows.filter((row) => !row.state.mayCall);
  const held = available.filter((row) => !row.eligibility.eligible);
  const ordered = [...eligible, ...held, ...cooling].slice(0, Math.max(1, maxModels));
  const warnings = [];
  if (requested.some((model) => /-latest$/.test(model))) warnings.push('moving-latest-alias-explicitly-configured');
  if (explicit.some((model) => !MODEL_CATALOG[model])) warnings.push('operator-supplied-model-outside-pinned-catalog');
  if (mode === 'quality-first' && routeSpecific.length) warnings.push('route-specific-models-demoted-under-quality-first');
  if (mode === 'quality-first' && legacyGlobal.length) warnings.push('legacy-global-models-demoted-under-quality-first');
  if (cooling.length) warnings.push('cooling-models-demoted');
  return Object.freeze({
    version: GEMINI_MODEL_POLICY_VERSION,
    task,
    mode,
    models: Object.freeze(ordered.map((row) => row.model)),
    callableModels: Object.freeze(eligible.slice(0, Math.max(1, maxModels)).map((row) => row.model)),
    excludedModels: Object.freeze(rows.filter((row) => !row.eligibility.eligible).map((row) => ({ model: row.model, reasons: row.eligibility.reasons }))),
    rows: Object.freeze(ordered),
    explicitModels: Object.freeze(explicit),
    routeSpecificModels: Object.freeze(routeSpecific),
    legacyGlobalModels: Object.freeze(legacyGlobal),
    disabledModels: Object.freeze([...disabled]),
    warnings: Object.freeze(warnings),
    stickySuccessPromotion: false,
    latestAliasDefaulted: false,
    claimCeiling: 'quality-prioritized-routing-not-provider-availability-quota-or-output-quality-proof'
  });
}

export { listGeminiGenerateContentModels };

// Only this acquisition path supplies runtime listing evidence; archived receipts are never imported.
export async function resolveGeminiProviderPlan(options = {}) {
  const env = options.env || process.env;
  const listing = await listGeminiGenerateContentModels(env.GEMINI_API_KEY);
  return resolveGeminiModelPlan({ ...options, env, at: Date.now(), providerListing: listing });
}

export function geminiModelCatalog() {
  return MODEL_CATALOG;
}

export { MODEL_CATALOG, QUALITY_ORDER, TASK_DEFAULTS, normModel };
