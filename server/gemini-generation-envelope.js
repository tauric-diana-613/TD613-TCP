import { AsyncLocalStorage } from 'node:async_hooks';

export const GEMINI_GENERATION_ENVELOPE_VERSION = 'td613.gemini-generation-envelope/v0.3-gemini3-only-20260918';
export const GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE = 'khonapolit-interactive';
export const KHONAPOLIT_INTERACTIVE_MAX_OUTPUT_TOKENS = 16384;

const THINKING_LEVELS = new Set(['minimal', 'low', 'medium', 'high']);
const GENERATION_PROFILE_STORAGE = new AsyncLocalStorage();

export function normalizeGeminiModel(model = '') {
  return String(model || '').replace(/^models\//, '');
}

export function geminiGeneration(model = '') {
  const normalized = normalizeGeminiModel(model);
  if (/^gemini-3(?:[.-]|$)/.test(normalized)) return '3';
  return 'unknown';
}

export function currentGeminiGenerationProfile() {
  return GENERATION_PROFILE_STORAGE.getStore() || null;
}

export function withGeminiGenerationProfile(profile, callback) {
  if (typeof callback !== 'function') throw new TypeError('Gemini generation profile requires a callback');
  const normalized = String(profile || '').trim();
  return GENERATION_PROFILE_STORAGE.run(normalized || null, callback);
}

function khonapolitInteractiveProfile() {
  return currentGeminiGenerationProfile() === GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE;
}

function finiteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function geminiSamplingConfig(model = '', sampling = {}) {
  // Gemini 3.x is tuned for provider-default sampling. Google explicitly warns that
  // legacy temperature/topP/topK overrides can degrade reasoning quality. Preserve
  // caller controls only for unknown/synthetic fixtures. Active provider routes are Gemini 3.x.
  if (geminiGeneration(model) === '3') return {};
  const config = {};
  if (finiteNumber(sampling.temperature)) config.temperature = sampling.temperature;
  if (finiteNumber(sampling.topP)) config.topP = sampling.topP;
  if (Number.isInteger(sampling.topK) && sampling.topK > 0) config.topK = sampling.topK;
  return config;
}

export function geminiThinkingConfig(model = '', {
  enabled = false,
  level = 'high'
} = {}) {
  if (!enabled) return null;
  const generation = geminiGeneration(model);
  if (generation === '3') {
    let requestedLevel = THINKING_LEVELS.has(level) ? level : 'high';
    // Marrowline is an interactive route with its own bounded wall-clock budget.
    // Keep the frontier attempt deliberate, but let the stable 3.5 continuity lane
    // behave as an actual rescue instead of spending another frontier-sized reasoning
    // window. The model identity and reasoning envelope remain visible in receipts.
    if (khonapolitInteractiveProfile() && requestedLevel === 'high') {
      requestedLevel = normalizeGeminiModel(model) === 'gemini-3.5-flash' ? 'low' : 'medium';
    }
    return { thinkingLevel: requestedLevel };
  }
  return null;
}

export function buildGeminiGenerationConfig({
  model = '',
  maxOutputTokens,
  responseMimeType,
  responseSchema,
  sampling = {},
  reasoning = null
} = {}) {
  const config = {};
  if (Number.isInteger(maxOutputTokens) && maxOutputTokens > 0) {
    config.maxOutputTokens = khonapolitInteractiveProfile()
      ? Math.min(maxOutputTokens, KHONAPOLIT_INTERACTIVE_MAX_OUTPUT_TOKENS)
      : maxOutputTokens;
  }
  Object.assign(config, geminiSamplingConfig(model, sampling));
  const thinkingConfig = reasoning
    ? geminiThinkingConfig(model, {
      enabled: true,
      level: reasoning.level,
      budget: reasoning.budget
    })
    : null;
  if (thinkingConfig) config.thinkingConfig = thinkingConfig;
  if (typeof responseMimeType === 'string' && responseMimeType) config.responseMimeType = responseMimeType;
  if (responseSchema && typeof responseSchema === 'object' && !Array.isArray(responseSchema)) config.responseSchema = responseSchema;
  return config;
}

export function describeGeminiGenerationEnvelope(model = '', options = {}) {
  const generation = geminiGeneration(model);
  const thinkingConfig = options.reasoning
    ? geminiThinkingConfig(model, { enabled: true, level: options.reasoning.level, budget: options.reasoning.budget })
    : null;
  return Object.freeze({
    version: GEMINI_GENERATION_ENVELOPE_VERSION,
    model: normalizeGeminiModel(model),
    generation,
    sampling: generation === '3' ? 'provider-default' : 'caller-synthetic-compatible',
    thinking: thinkingConfig ? Object.freeze({ ...thinkingConfig }) : null,
    profile: currentGeminiGenerationProfile()
  });
}
