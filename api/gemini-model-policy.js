export const GEMINI_MODEL_POLICY_VERSION = 'td613.gemini-model-policy/v1-quality-first';

const MODEL_CATALOG = Object.freeze({
  'gemini-3.5-flash': Object.freeze({ tier: 'frontier', stability: 'stable', quality: 100, role: 'primary-quality' }),
  'gemini-3-flash-preview': Object.freeze({ tier: 'frontier', stability: 'preview', quality: 92, role: 'secondary-quality' }),
  'gemini-2.5-flash': Object.freeze({ tier: 'reasoning', stability: 'stable', quality: 84, role: 'stable-fallback' }),
  'gemini-3.1-flash-lite': Object.freeze({ tier: 'economy', stability: 'stable', quality: 70, role: 'high-volume-fallback' }),
  'gemini-2.5-flash-lite': Object.freeze({ tier: 'economy', stability: 'stable', quality: 58, role: 'last-resort-fallback' }),
  'gemini-3.1-pro-preview': Object.freeze({ tier: 'frontier-pro', stability: 'preview', quality: 105, role: 'explicit-opt-in-only' }),
  'gemini-2.5-pro': Object.freeze({ tier: 'pro', stability: 'stable', quality: 90, role: 'explicit-opt-in-only' })
});

const QUALITY_ORDER = Object.freeze([
  'gemini-3.5-flash',
  'gemini-3-flash-preview',
  'gemini-2.5-flash',
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash-lite'
]);

const TASK_DEFAULTS = Object.freeze({
  'hush-transform': QUALITY_ORDER,
  'khonapolit-dialogue': QUALITY_ORDER,
  'general-text': QUALITY_ORDER,
  readiness: Object.freeze(['gemini-3.1-flash-lite', 'gemini-2.5-flash-lite'])
});

const MODEL_STATE = new Map();
const LIST_CACHE = { value: null, expiresAt: 0 };
const LIST_CACHE_MS = 10 * 60 * 1000;

const safe = (value = '') => String(value ?? '').trim();
const normModel = (value = '') => safe(value).replace(/^models\//, '');
const uniq = (values = []) => [...new Set(values.map(normModel).filter(Boolean))];
const splitModels = (value = '') => safe(value).split(',').map(normModel).filter(Boolean);

function routeEnvNames(task = 'general-text') {
  if (task === 'hush-transform') return { preferred: 'HUSH_GEMINI_MODEL', fallbacks: 'HUSH_GEMINI_FALLBACKS' };
  if (task === 'khonapolit-dialogue') return { preferred: 'KHONAPOLIT_GEMINI_MODEL', fallbacks: 'KHONAPOLIT_GEMINI_FALLBACKS' };
  return { preferred: 'GEMINI_MODEL', fallbacks: 'GEMINI_MODEL_FALLBACKS' };
}

function disabledModels(env = process.env) {
  return new Set(splitModels(env.GEMINI_DISABLED_MODELS));
}

function explicitModels(task = 'general-text', env = process.env) {
  const names = routeEnvNames(task);
  return uniq([
    ...splitModels(env[names.preferred]),
    ...splitModels(env[names.fallbacks]),
    ...splitModels(env.GEMINI_MODEL),
    ...splitModels(env.GEMINI_MODEL_FALLBACKS)
  ]);
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

export function resolveGeminiModelPlan({ task = 'general-text', env = process.env, at = Date.now(), maxModels = 8 } = {}) {
  const defaults = TASK_DEFAULTS[task] || TASK_DEFAULTS['general-text'];
  const disabled = disabledModels(env);
  const explicit = explicitModels(task, env);
  const requested = uniq([...explicit, ...defaults]).filter((model) => !disabled.has(model));
  const rows = requested.map((model, index) => {
    const state = readGeminiModelState(model, at);
    const metadata = MODEL_CATALOG[model] || Object.freeze({ tier: 'operator-supplied', stability: 'unknown', quality: 0, role: 'operator-supplied' });
    return Object.freeze({ model, index, explicit: explicit.includes(model), metadata, state });
  });
  const available = rows.filter((row) => row.state.mayCall);
  const cooling = rows.filter((row) => !row.state.mayCall);
  const ordered = [...available, ...cooling].slice(0, Math.max(1, maxModels));
  const warnings = [];
  if (requested.some((model) => /-latest$/.test(model))) warnings.push('moving-latest-alias-explicitly-configured');
  if (explicit.some((model) => !MODEL_CATALOG[model])) warnings.push('operator-supplied-model-outside-pinned-catalog');
  if (cooling.length) warnings.push('cooling-models-demoted');
  return Object.freeze({
    version: GEMINI_MODEL_POLICY_VERSION,
    task,
    mode: safe(env.GEMINI_ROUTING_MODE || 'quality-first') || 'quality-first',
    models: Object.freeze(ordered.map((row) => row.model)),
    callableModels: Object.freeze(available.map((row) => row.model)),
    rows: Object.freeze(ordered),
    explicitModels: Object.freeze(explicit),
    disabledModels: Object.freeze([...disabled]),
    warnings: Object.freeze(warnings),
    stickySuccessPromotion: false,
    latestAliasDefaulted: false,
    claimCeiling: 'quality-prioritized-routing-not-provider-availability-quota-or-output-quality-proof'
  });
}

export async function listGeminiGenerateContentModels(apiKey, { force = false, fetchImpl = fetch, at = Date.now() } = {}) {
  if (!force && LIST_CACHE.value && LIST_CACHE.expiresAt > at) return Object.freeze({ ...LIST_CACHE.value, cached: true });
  if (!safe(apiKey)) return Object.freeze({ ok: false, models: Object.freeze([]), error: 'missing-gemini-api-key', cached: false });
  try {
    const response = await fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=1000&key=${encodeURIComponent(apiKey)}`);
    const payload = await response.json().catch(() => ({}));
    const models = (Array.isArray(payload.models) ? payload.models : [])
      .filter((model) => Array.isArray(model.supportedGenerationMethods) && model.supportedGenerationMethods.includes('generateContent'))
      .map((model) => normModel(model.name))
      .filter(Boolean);
    const result = Object.freeze({ ok: response.ok, status: response.status, models: Object.freeze(uniq(models)), cached: false, error: response.ok ? null : safe(payload?.error?.message || 'model-list-failed') });
    if (response.ok) {
      LIST_CACHE.value = result;
      LIST_CACHE.expiresAt = at + LIST_CACHE_MS;
    }
    return result;
  } catch (error) {
    return Object.freeze({ ok: false, status: 599, models: Object.freeze([]), cached: false, error: safe(error?.message || error) });
  }
}

export function geminiModelCatalog() {
  return MODEL_CATALOG;
}

export { MODEL_CATALOG, QUALITY_ORDER, TASK_DEFAULTS, normModel };
