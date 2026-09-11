export const GEMINI_GENERATION_ENVELOPE_VERSION = 'td613.gemini-generation-envelope/v0.1-20260911';
export const GEMINI25_HIGH_THINKING_BUDGET = 24576;

const THINKING_LEVELS = new Set(['minimal', 'low', 'medium', 'high']);

export function normalizeGeminiModel(model = '') {
  return String(model || '').replace(/^models\//, '');
}

export function geminiGeneration(model = '') {
  const normalized = normalizeGeminiModel(model);
  if (/^gemini-2\.5(?:[.-]|$)/.test(normalized)) return '2.5';
  if (/^gemini-3(?:[.-]|$)/.test(normalized)) return '3';
  return 'unknown';
}

function finiteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

export function geminiSamplingConfig(model = '', sampling = {}) {
  // Gemini 3.x is tuned for provider-default sampling. Google explicitly warns that
  // legacy temperature/topP/topK overrides can degrade reasoning quality. Preserve
  // those controls only for 2.5 and unknown/synthetic models where the caller's
  // legacy envelope remains the conservative compatibility posture.
  if (geminiGeneration(model) === '3') return {};
  const config = {};
  if (finiteNumber(sampling.temperature)) config.temperature = sampling.temperature;
  if (finiteNumber(sampling.topP)) config.topP = sampling.topP;
  if (Number.isInteger(sampling.topK) && sampling.topK > 0) config.topK = sampling.topK;
  return config;
}

export function geminiThinkingConfig(model = '', {
  enabled = false,
  level = 'high',
  budget = GEMINI25_HIGH_THINKING_BUDGET
} = {}) {
  if (!enabled) return null;
  const generation = geminiGeneration(model);
  if (generation === '3') {
    return { thinkingLevel: THINKING_LEVELS.has(level) ? level : 'high' };
  }
  if (generation === '2.5') {
    const requested = Number.isInteger(budget) ? budget : GEMINI25_HIGH_THINKING_BUDGET;
    return { thinkingBudget: Math.max(0, Math.min(requested, GEMINI25_HIGH_THINKING_BUDGET)) };
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
  if (Number.isInteger(maxOutputTokens) && maxOutputTokens > 0) config.maxOutputTokens = maxOutputTokens;
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
    sampling: generation === '3' ? 'provider-default' : 'caller-legacy-compatible',
    thinking: thinkingConfig ? Object.freeze({ ...thinkingConfig }) : null
  });
}
