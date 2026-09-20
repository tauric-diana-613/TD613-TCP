import crypto from 'node:crypto';
import {
  BINDING_FRAGMENT,
  CLAIMED_PUA,
  COVENANT_KEY,
  HERITAGE_COVENANT,
  KHONAPOLIT_RECEIPT_SCHEMA,
  KHONAPOLIT_TERMINAL_SCHEMA,
  buildInvocationPacket,
  classifyEmergence
} from '../app/dome-world/khonapolit-covenant.js';
import { observeTD613ApertureEgress } from '../app/engine/td613-aperture-egress-contract.js';
import {
  APERTURE_V3_SCHEMA,
  APERTURE_V3_VERSION,
  buildApertureV3InvocationReceipt,
  classifyApertureDiscourseMode
} from '../app/engine/aperture-v3-task-intent.js';
import {
  KHONAPOLIT_RAW_PACKET_PROTOCOL,
  KHONAPOLIT_RELAY_SCHEMA,
  buildRelaySystemAddendum,
  parseRelayEnvelope
} from '../app/dome-world/khonapolit-relay.js';
import {
  GEMINI_MODEL_POLICY_VERSION,
  recordGeminiModelOutcome,
  resolveGeminiModelPlan,
  resolveGeminiProviderPlan
} from './gemini-model-policy.js';
import {
  buildGeminiGenerationConfig,
  geminiThinkingConfig
} from './gemini-generation-envelope.js';
import {
  assessGeminiQuotaEntitlement,
  classifyGeminiTransport,
  geminiStreamGenerateContentUrl,
  geminiRequestHeaders,
  observeGeminiQuota
} from './gemini-provider-transport.js';
import { buildGeminiConsumptionReceipt, logGeminiConsumption } from './gemini-consumption-receipt.js';

export const KHONAPOLIT_API_VERSION = 'td613.khonapolit-gemini/v1';
export const KHONAPOLIT_QUALITY_API_VERSION = 'td613.khonapolit-gemini/v20-consumption-receipts';
export const KHONAPOLIT_MAX_PROVIDER_CALLS = 5;
export const KHONAPOLIT_MAX_STRUCTURAL_REPAIRS = 1;
export const KHONAPOLIT_MAX_TOTAL_PROVIDER_REQUESTS = KHONAPOLIT_MAX_PROVIDER_CALLS + KHONAPOLIT_MAX_STRUCTURAL_REPAIRS;
const PRIMARY_REQUEST_TIMEOUT_MS = 50000;
const STRUCTURAL_REPAIR_TIMEOUT_MS = 30000;
const MIN_STRUCTURAL_REPAIR_BUDGET_MS = 4000;
const FALLBACK_REQUEST_TIMEOUT_MS = 30000;
const WALL_TIMEOUT_MS = 210000;
const RESPONSE_RESERVE_MS = 5000;
const MAX_SHARED_RATE_RETRY_SECONDS = 8;
const DEFAULT_EXPECTED_DAILY_RPD = 100;
function expectedDailyRpd(env = process.env) {
  const raw = Number(env.KHONAPOLIT_GEMINI_EXPECTED_DAILY_RPD || env.GEMINI_EXPECTED_DAILY_RPD || DEFAULT_EXPECTED_DAILY_RPD);
  return Number.isFinite(raw) && raw > 0 ? Math.floor(raw) : DEFAULT_EXPECTED_DAILY_RPD;
}
const LEGACY_OUTPUT_TOKENS = 4096;
// Marrowline is a quality-gated frontier route. A lower-generation compatibility
// answer is not an acceptable substitute for a failed covenant return. Spend the
// bounded wall-clock budget on callable Gemini 3.x models and HOLD when those lanes
// cannot produce an admitted answer.
const HUMAN_LIVENESS_MODEL_ORDER = Object.freeze([
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3-flash-preview'
]);
export const KHONAPOLIT_MAX_OUTPUT_TOKENS = 65536;
const QUALITY_ENVELOPE_MODELS = new Set([
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3-flash-preview'
]);
const WINDOW_MS = 10 * 60 * 1000;
const REQUESTS_PER_WINDOW = 12;
const buckets = new Map();
const REPAIRABLE_STRUCTURAL_REASONS = new Set([
  'khonapolit-nominative-missing',
  'tauric-diana-bots-nominative-missing',
  'voice-order-invalid',
  'khonapolit-combining-mark-contamination',
  'tauric-diana-zalgo-absent',
  'tauric-diana-zalgo-underflow',
  'tauric-diana-zalgo-unipolar-field',
  'tauric-diana-zalgo-monoculture',
  'tauric-diana-zalgo-field-thin',
  'tauric-diana-zalgo-horizontal-dominant',
  'tauric-diana-zalgo-mechanical-clone',
  'tauric-diana-zalgo-sparse-keyword-targeting'
]);

const safe = (value = '') => String(value ?? '').trim();
const requestHeader = (req = {}, name = '') => {
  const target = String(name || '').toLowerCase();
  const pair = Object.entries(req.headers || {}).find(([key]) => String(key).toLowerCase() === target);
  return typeof pair?.[1] === 'string' ? pair[1].trim() : '';
};
const sha256 = (value = '') => crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
const qualityEnvelope = (model = '') => QUALITY_ENVELOPE_MODELS.has(String(model || '').replace(/^models\//, ''));
const outputBudget = (model = '') => qualityEnvelope(model) ? KHONAPOLIT_MAX_OUTPUT_TOKENS : LEGACY_OUTPUT_TOKENS;

const ORDINARY_PROJECT_GUIDANCE = [
  'ORDINARY PROJECT WORK:',
  '- Separate supplied facts, calculations, assumptions and missing evidence.',
  '- Do not infer venue quality, accessibility or amenities from price.',
  '- Respect requests to avoid personal data; prefer anonymous attendance counts when names are unnecessary.',
  '- Prior AI text is unverified context.',
  '- Never promise complete privacy, anonymity or destination enforcement.',
  '- Do not inject portability or handoff instructions unless the operator explicitly asks for them.'
].join('\n');

const CREATIVE_GUIDANCE = [
  'CREATIVE TURN:',
  '- Follow the operator’s requested form, scale, cadence and imaginative range rather than collapsing the work into a synopsis.',
  '- Treat supplied mythology, characters, names and canon as creative source material. Invent within that field when the operator asks for invention; do not convert corpus phrases into a compulsory keyword litany.',
  '- A story requires event, tension, transformation and consequence. Atmospheric exposition alone is not a completed story.',
  '- Factual and ontological claim boundaries still govern what may be asserted as verified, but they are not a brevity rule or a prose voice. Keep receipt language out of the creative work unless it materially belongs there.',
  '- Do not inject unrelated project-management, venue, privacy, portability or compliance boilerplate into the creative response.'
].join('\n');

const SPECULATIVE_GUIDANCE = [
  'OPEN-FIELD SPECULATIVE TURN:',
  '- Distinguish supplied corpus claims from independently verified facts and preserve uncertainty where it materially matters.',
  '- Answer in the form and depth the operator requested; do not turn uncertainty into repeated disclaimers or a forced short summary.'
].join('\n');

const LEGAL_GUIDANCE = [
  'LEGAL SYNTHESIS TURN:',
  '- Separate supplied facts, assumptions, legal questions and missing jurisdiction or date context.',
  '- Do not invent authorities, holdings, filings or procedural facts. Preserve uncertainty while still answering the requested legal synthesis directly.'
].join('\n');

const RUNTIME_GUIDANCE = [
  'RUNTIME DIAGNOSIS TURN:',
  '- Diagnose the concrete runtime evidence supplied by the operator. Distinguish observed state, inference and missing telemetry.',
  '- Prefer exact failing surfaces and repairable causes over generic caution or prose about the governance system.'
].join('\n');

export function khonapolitTaskGuidance(apertureReceipt = {}) {
  const route = apertureReceipt?.taskIntent?.primary_route || 'REQUESTED_SYNTHESIS';
  if (route === 'OPEN_FIELD_CREATIVE_SYNTHESIS') return CREATIVE_GUIDANCE;
  if (route === 'OPEN_FIELD_SPECULATIVE_SYNTHESIS') return SPECULATIVE_GUIDANCE;
  if (route === 'LEGAL_SYNTHESIS') return LEGAL_GUIDANCE;
  if (route === 'RUNTIME_DIAGNOSIS') return RUNTIME_GUIDANCE;
  return ORDINARY_PROJECT_GUIDANCE;
}

export function selectKhonapolitProviderModels(callableModels = []) {
  const available = [...new Set((Array.isArray(callableModels) ? callableModels : [])
    .map((model) => String(model || '').replace(/^models\//, '').trim())
    .filter(Boolean)
    .filter((model) => /^gemini-3(?:\.|-|$)/.test(model))
    .filter((model) => !/lite/i.test(model)))];
  if (!available.length) return [];
  const selected = [];
  for (const model of HUMAN_LIVENESS_MODEL_ORDER) {
    if (selected.length >= KHONAPOLIT_MAX_PROVIDER_CALLS) break;
    if (available.includes(model) && !selected.includes(model)) selected.push(model);
  }
  for (const model of available) {
    if (selected.length >= KHONAPOLIT_MAX_PROVIDER_CALLS) break;
    if (!selected.includes(model)) selected.push(model);
  }
  return selected;
}

export function selectKhonapolitProviderModelsFromPlan(plan = {}) {
  const rows = Array.isArray(plan?.rows) ? plan.rows : [];
  const callable = Array.isArray(plan?.callableModels) ? plan.callableModels : [];
  const coolingEligible = rows
    .filter((row) => row?.eligibility?.eligible === true && row?.state?.mayCall === false)
    .map((row) => row.model);
  const providerAbsentCurrent = rows
    .filter((row) => {
      const reasons = Array.isArray(row?.eligibility?.reasons) ? row.eligibility.reasons : [];
      return row?.metadata?.lifecycle === 'current'
        && HUMAN_LIVENESS_MODEL_ORDER.includes(row?.model)
        && reasons.length === 1
        && reasons[0] === 'provider-absent';
    })
    .map((row) => row.model);

  // Category boundaries matter. Healthy observed seats run first. Process-local
  // cooling seats remain bounded fallbacks after them. A current configured seat
  // omitted by one fresh discovery snapshot may be probed last: absence from the
  // listing is evidence, but it does not get to erase a known-current frontier
  // lane before the request has actually tried it. Disabled, Lite, pre-3.x,
  // specialized, or lifecycle-invalid models never enter this recovery set.
  const orderedGroups = [
    selectKhonapolitProviderModels(callable),
    selectKhonapolitProviderModels(coolingEligible),
    selectKhonapolitProviderModels(providerAbsentCurrent)
  ];
  const selected = [];
  for (const group of orderedGroups) {
    for (const model of group) {
      if (selected.length >= KHONAPOLIT_MAX_PROVIDER_CALLS) break;
      if (!selected.includes(model)) selected.push(model);
    }
  }
  return selected;
}

export function allocateKhonapolitAttemptTimeout({ remainingMs = 0, index = 0, modelCount = 1, fairShare = false } = {}) {
  const remaining = Math.max(0, Math.floor(Number(remainingMs) || 0));
  const position = Math.max(0, Math.floor(Number(index) || 0));
  const inheritedCap = position === 0 ? PRIMARY_REQUEST_TIMEOUT_MS : FALLBACK_REQUEST_TIMEOUT_MS;
  if (!fairShare) return Math.min(inheritedCap, remaining);

  const total = Math.max(position + 1, Math.floor(Number(modelCount) || 1));
  const remainingAttempts = Math.max(1, total - position);
  if (total === 1) return Math.min(PRIMARY_REQUEST_TIMEOUT_MS, remaining);

  // Human-liveness geometry: these are completion windows, not health probes.
  // 3.8 remains first; 3.5 retains the empirically proven continuity lane; later
  // Gemini 3 seats receive enough time to finish a real dual-packet generation.
  const caps = [50000, 75000, 40000, 30000];
  if (remainingAttempts === 1) return remaining;
  const cap = caps[position] || FALLBACK_REQUEST_TIMEOUT_MS;

  const laterMinimums = [75000, 40000, 30000, 10000];
  let reserveForLater = 0;
  for (let i = position; i < total - 1; i += 1) {
    reserveForLater += laterMinimums[i] || 15000;
  }
  reserveForLater = Math.min(reserveForLater, Math.max(0, remaining - 1));
  const availableForThisSeat = Math.max(1, remaining - reserveForLater);
  // Discovery, receipt construction, and scheduler bookkeeping consume a few
  // milliseconds before the first provider call. Preserve the declared
  // completion window when the shortfall is only bounded orchestration drift;
  // later seats recompute from the actual remaining wall and absorb that drift.
  const orchestrationDriftGraceMs = 250;
  if (remaining >= cap && cap - availableForThisSeat <= orchestrationDriftGraceMs) return cap;
  return Math.min(cap, availableForThisSeat);
}

function headerValue(headers = {}, key = '') {
  const target = key.toLowerCase();
  const pair = Object.entries(headers || {}).find(([name]) => String(name).toLowerCase() === target);
  return pair ? String(pair[1] ?? '') : '';
}
function clientKey(req = {}) {
  const forwarded = headerValue(req.headers, 'x-forwarded-for').split(',')[0].trim();
  return forwarded || headerValue(req.headers, 'x-real-ip') || req.socket?.remoteAddress || 'unknown';
}
export function consumeRateSlot(key = 'unknown', now = Date.now()) {
  const current = buckets.get(key);
  if (!current || now - current.startedAt >= WINDOW_MS) {
    const next = { startedAt: now, count: 1 };
    buckets.set(key, next);
    return { allowed: true, remaining: REQUESTS_PER_WINDOW - 1, resetAt: now + WINDOW_MS };
  }
  current.count += 1;
  buckets.set(key, current);
  return {
    allowed: current.count <= REQUESTS_PER_WINDOW,
    remaining: Math.max(0, REQUESTS_PER_WINDOW - current.count),
    resetAt: current.startedAt + WINDOW_MS
  };
}
function parseBody(req = {}) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}
function setBaseHeaders(res, apertureEgress = {}) {
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-TD613-Khonapolit-Terminal', KHONAPOLIT_QUALITY_API_VERSION);
  res.setHeader('X-TD613-Aperture-Egress', apertureEgress.status || 'absent');
  res.setHeader('X-TD613-Aperture-Version', APERTURE_V3_VERSION);
  res.setHeader('X-TD613-Aperture-Schema', APERTURE_V3_SCHEMA);
  res.setHeader('X-TD613-Gemini-Policy', GEMINI_MODEL_POLICY_VERSION);
  res.setHeader('X-TD613-Relay-Schema', KHONAPOLIT_RELAY_SCHEMA);
  res.setHeader('Vary', 'Accept, Content-Type');
}
function setApertureTaskHeaders(res, apertureReceipt = {}) {
  const task = apertureReceipt?.taskIntent || {};
  res.setHeader('X-TD613-Aperture-Route', task.primary_route || 'REQUESTED_SYNTHESIS');
  res.setHeader('X-TD613-Aperture-Materiality', task.runtime_materiality || 'BACKGROUND');
}
function send(res, status, payload, extraHeaders = {}) {
  const attempts = Array.isArray(payload?.receipt?.provider?.attempts)
    ? payload.receipt.provider.attempts
    : Array.isArray(payload?.attempts)
      ? payload.attempts
      : [];
  const geminiConsumption = buildGeminiConsumptionReceipt({ route: 'marrowline', attempts });
  const body = geminiConsumption.call_count
    ? { ...payload, gemini_consumption: geminiConsumption }
    : payload;
  if (geminiConsumption.call_count) logGeminiConsumption(geminiConsumption);
  res.statusCode = status;
  for (const [name, value] of Object.entries(extraHeaders)) res.setHeader(name, value);
  res.end(JSON.stringify(body));
}
function providerError(payload = {}) {
  const error = payload?.error || payload || {};
  return { status: safe(error.status), code: error.code ?? null, message: safe(error.message).slice(0, 800) };
}
function retryAfterSeconds(response) {
  const raw = response?.headers?.get?.('retry-after');
  const seconds = Number(raw || 0);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
}
function geminiContents(packet = {}) {
  const history = packet.history.map((entry) => ({ role: entry.role, parts: [{ text: entry.text }] }));
  return [...history, { role: 'user', parts: [{ text: packet.message }] }];
}

function khonapolitReasoning(model = '', { fallback = false } = {}) {
  if (!qualityEnvelope(model)) return null;
  return {
    // Fallback means transport position, not permission to lower the requested reasoning level.
    level: 'high'
  };
}

export function buildGeminiRequest(packet = {}, apertureReceipt = {}, model = '', { fallback = false } = {}) {
  const taskGuidance = khonapolitTaskGuidance(apertureReceipt);
  return {
    systemInstruction: {
      parts: [{ text: `${packet.systemInstruction}\n${taskGuidance}\n${buildRelaySystemAddendum(apertureReceipt)}` }]
    },
    contents: geminiContents(packet),
    generationConfig: buildGeminiGenerationConfig({
      model,
      maxOutputTokens: outputBudget(model),
      sampling: {
        // Gemini 3.x strips these legacy overrides and uses provider-default sampling
        // (temperature 1.0). They remain only for unknown/synthetic compatibility.
        temperature: packet.mode === 'issued-conjunction' ? 0.78 : 0.7,
        topP: 0.9,
        topK: 40
      },
      reasoning: khonapolitReasoning(model, { fallback })
    })
  };
}

export function repairableKhonapolitAdmission(reasons = []) {
  const values = Array.isArray(reasons) ? reasons.filter(reason => typeof reason === 'string') : [];
  return values.length > 0 && values.every(reason => REPAIRABLE_STRUCTURAL_REASONS.has(reason));
}

export function buildGeminiStructuralRepairRequest(
  packet = {},
  apertureReceipt = {},
  model = '',
  heldText = '',
  reasons = [],
  { fallback = false } = {}
) {
  const request = buildGeminiRequest(packet, apertureReceipt, model, { fallback });
  const reasonList = (Array.isArray(reasons) ? reasons : [])
    .filter(reason => REPAIRABLE_STRUCTURAL_REASONS.has(reason))
    .slice(0, 8);
  const {
    analyticStart,
    analyticEnd,
    stressStart,
    stressEnd
  } = KHONAPOLIT_RAW_PACKET_PROTOCOL;
  const repairDirective = [
    'STRUCTURAL REPAIR PASS — DO NOT ANSWER THE OPERATOR FROM SCRATCH.',
    `The previous draft was held only for these locally observed structural reasons: ${reasonList.join(', ') || 'unspecified-structural-hold'}.`,
    'Preserve the prior draft’s substantive reasoning, prompt-specific mathematics, examples, jokes, and conclusions unless a listed structural defect makes a small edit necessary.',
    'Return only the corrected raw dual-packet envelope. Do not discuss this repair pass, the admission gate, or the held draft.',
    `Packet A must begin with ${analyticStart}, contain the exact standalone visible heading “Kʰonapolit”, remain free of combining diacritics, and close with ${analyticEnd}.`,
    `Packet B must begin with ${stressStart}, contain the exact standalone visible heading “Tauric Diana bots”, preserve provider-authored expressive combining-diacritic stress when required, and close with ${stressEnd}.`,
    'If the prior draft had absent, underflowing, unipolar, monoculture, sparse, flat, or mechanically cloned Tauric Diana marks, preserve its substantive prose while authoring the missing stress yourself as a visibly distributed High-Zalgo field across several separate Packet B lines. Use multiple distinct above-line AND below-line combining-mark species on ordinary graphemes, vary stack height and composition, and include genuine two-sided clusters. Repeating the same circumflex-like mark at different stack heights is still a monoculture. Isolated dots, one marked word, or strike/slash overlays alone are not sufficient. Do not use a numeric quota and do not alter protected literals.',
    'Keep Packet A before Packet B. Do not add any provider/instrument speaker and do not duplicate the answer.'
  ].join('\n');
  return {
    ...request,
    contents: [
      ...geminiContents(packet),
      { role: 'model', parts: [{ text: String(heldText || '') }] },
      { role: 'user', parts: [{ text: repairDirective }] }
    ]
  };
}

export function extractGeminiText(payload = {}) {
  return (payload?.candidates?.[0]?.content?.parts || [])
    .map((part) => safe(part?.text))
    .filter(Boolean)
    .join('\n\n')
    .trim();
}

export function observeGeminiOutput(payload = {}, model = '', { fallback = false } = {}) {
  const usage = {};
  for (const key of ['promptTokenCount', 'candidatesTokenCount', 'thoughtsTokenCount', 'totalTokenCount']) {
    const value = payload?.usageMetadata?.[key];
    if (Number.isSafeInteger(value) && value >= 0) usage[key] = value;
  }
  const rawReason = payload?.candidates?.[0]?.finishReason;
  const finishReason = typeof rawReason === 'string' && /^[A-Z_]{1,64}$/.test(rawReason) ? rawReason : null;
  const reasoning = khonapolitReasoning(model, { fallback });
  const thinkingConfig = reasoning
    ? geminiThinkingConfig(model, { enabled: true, level: reasoning.level, budget: reasoning.budget })
    : null;
  return Object.freeze({
    finishReason,
    outputTokenLimitReached: finishReason === 'MAX_TOKENS',
    maxOutputTokens: outputBudget(model),
    thinkingLevel: thinkingConfig?.thinkingLevel || (thinkingConfig?.thinkingBudget !== undefined ? 'not-applicable' : 'provider-default'),
    ...(thinkingConfig?.thinkingBudget !== undefined ? { thinkingBudget: thinkingConfig.thinkingBudget } : {}),
    usage: Object.freeze(usage)
  });
}

export function buildTerminalReceipt({ packet, text, relay = null, model, providerStatus, providerOutput = null, apertureEgress, apertureReceipt, attempts = [] } = {}) {
  const observedText = relay?.transcript || text || '';
  const emergence = classifyEmergence(observedText, { mode: packet.mode });
  const partsPresent = Object.freeze((relay?.parts || []).filter((part) => part.present).map((part) => part.id));
  return Object.freeze({
    schema: KHONAPOLIT_RECEIPT_SCHEMA,
    terminalSchema: KHONAPOLIT_TERMINAL_SCHEMA,
    apiVersion: KHONAPOLIT_QUALITY_API_VERSION,
    status: observedText ? 'MODEL_RESPONSE_OBSERVED' : 'PROVIDER_RESPONSE_EMPTY',
    route: '/api/dome-world/khonapolit',
    provider: Object.freeze({ family: 'Gemini', model, status: providerStatus, output: providerOutput, attempts: Object.freeze(attempts) }),
    invocation: Object.freeze({
      mode: packet.mode,
      promptSha256: sha256(packet.systemInstruction + '\n\n' + packet.message),
      responseSha256: observedText ? sha256(observedText) : null,
      issuanceState: packet.issuance.state,
      issuanceSuffix: packet.issuance.suffix,
      namespace: CLAIMED_PUA,
      heritageKey: HERITAGE_COVENANT,
      covenantKey: COVENANT_KEY,
      bindingFragment: BINDING_FRAGMENT,
      emergenceNameSeeded: packet.keys.emergenceNameSeeded,
      tauricLineageSeeded: packet.keys.tauricLineageSeeded,
      presentationFrameSeeded: packet.keys.presentationFrameSeeded === true
    }),
    relay: Object.freeze({
      schema: relay?.schema || KHONAPOLIT_RELAY_SCHEMA,
      partsPresent,
      signal: relay?.signal || Object.freeze({ state: 'NOT_LOCKED' }),
      admission: relay?.admission || null,
      highZalgo: relay?.highZalgo || Object.freeze({ applied: false })
    }),
    emergence,
    aperture: apertureReceipt,
    apertureEgress,
    corpus: packet.corpus,
    seal: Object.freeze({ state: 'OPEN', glyph: '⟐', suppliedBy: null }),
    storage: Object.freeze({ serverConversationStorage: false, browserSessionStorage: 'operator-controlled' }),
    recommendationNotCommand: true,
    claimCeiling: packet.claimCeiling
  });
}

function mergeGeminiStreamPayload(chunks = []) {
  let text = '';
  let finishReason = null;
  let usageMetadata = null;
  for (const payload of chunks) {
    const candidate = payload?.candidates?.[0] || null;
    for (const part of candidate?.content?.parts || []) {
      if (typeof part?.text === 'string' && part.thought !== true) text += part.text;
    }
    if (typeof candidate?.finishReason === 'string' && candidate.finishReason) finishReason = candidate.finishReason;
    if (payload?.usageMetadata && typeof payload.usageMetadata === 'object') usageMetadata = payload.usageMetadata;
  }
  const candidate = {
    content: { parts: text ? [{ text }] : [] },
    ...(finishReason ? { finishReason } : {})
  };
  return {
    candidates: [candidate],
    ...(usageMetadata ? { usageMetadata } : {})
  };
}

function consumeGeminiSseEvent(rawEvent = '', chunks = [], progress = {}) {
  const data = String(rawEvent || '')
    .split(/\r?\n/)
    .filter((line) => /^data:/.test(line))
    .map((line) => line.replace(/^data:\s?/, ''))
    .join('\n')
    .trim();
  if (!data || data === '[DONE]') return;
  try {
    const payload = JSON.parse(data);
    chunks.push(payload);
    progress.chunkCount += 1;
    if (progress.firstChunkMs === null) progress.firstChunkMs = Date.now() - progress.startedAt;
  } catch {
    progress.parseErrors += 1;
  }
}

async function readGeminiSse(response, progress) {
  const reader = response?.body?.getReader?.();
  if (!reader) return null;
  const decoder = new TextDecoder();
  let buffer = '';
  const chunks = [];
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    progress.byteCount += value?.byteLength || 0;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() || '';
    for (const event of events) consumeGeminiSseEvent(event, chunks, progress);
  }
  buffer += decoder.decode();
  if (buffer.trim()) consumeGeminiSseEvent(buffer, chunks, progress);
  return mergeGeminiStreamPayload(chunks);
}

async function callGemini(
  model,
  packet,
  apertureReceipt,
  timeoutMs = PRIMARY_REQUEST_TIMEOUT_MS,
  { fallback = false, structuralRepair = null } = {}
) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const progress = { startedAt: Date.now(), chunkCount: 0, firstChunkMs: null, byteCount: 0, parseErrors: 0 };
  try {
    const request = structuralRepair
      ? buildGeminiStructuralRepairRequest(
          packet,
          apertureReceipt,
          model,
          structuralRepair.heldText,
          structuralRepair.reasons,
          { fallback }
        )
      : buildGeminiRequest(packet, apertureReceipt, model, { fallback });
    const response = await fetch(geminiStreamGenerateContentUrl(model), {
      method: 'POST',
      headers: geminiRequestHeaders(process.env.GEMINI_API_KEY),
      body: JSON.stringify(request),
      signal: controller.signal
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      return { response, payload, text: '', timedOut: false, streamed: false, ...progress };
    }
    const streamedPayload = await readGeminiSse(response, progress);
    const payload = streamedPayload || await response.json().catch(() => ({}));
    return {
      response,
      payload,
      text: extractGeminiText(payload),
      timedOut: false,
      streamed: Boolean(streamedPayload),
      ...progress
    };
  } catch (error) {
    const timedOut = error?.name === 'AbortError';
    return {
      response: { ok: false, status: timedOut ? 408 : 599, headers: { get: () => null } },
      payload: { error: { status: error?.name || 'FETCH_ERROR', message: safe(error?.message || error) } },
      text: '',
      timedOut,
      streamed: progress.chunkCount > 0,
      ...progress
    };
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  const apertureEgress = observeTD613ApertureEgress(req?.headers || {});
  let plan = resolveGeminiModelPlan({ task: 'khonapolit-dialogue', maxModels: 8 });
  setBaseHeaders(res, apertureEgress);

  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return send(res, 204, {});
  }
  if (req.method === 'GET') {
    const aperture = buildApertureV3InvocationReceipt({ apertureEgress, modelPlan: plan });
    setApertureTaskHeaders(res, aperture);
    return send(res, 200, {
      ok: true,
      route: '/api/dome-world/khonapolit',
      version: KHONAPOLIT_QUALITY_API_VERSION,
      inheritedVersion: KHONAPOLIT_API_VERSION,
      provider: 'Gemini',
      modelPolicy: plan,
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
      aperture,
      aperture_egress: apertureEgress,
      relaySchema: KHONAPOLIT_RELAY_SCHEMA,
      claim_ceiling: 'readiness-and-routing-plan-only-not-provider-response-entity-or-quality-proof'
    });
  }
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST, OPTIONS');
    return send(res, 405, { ok: false, error: 'method-not-allowed', allowed: ['GET', 'POST', 'OPTIONS'] });
  }
  if (!process.env.GEMINI_API_KEY) {
    return send(res, 503, { ok: false, error: 'missing-gemini-api-key', version: KHONAPOLIT_QUALITY_API_VERSION, modelPolicy: plan });
  }

  const rate = consumeRateSlot(clientKey(req));
  res.setHeader('X-RateLimit-Remaining', String(rate.remaining));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(rate.resetAt / 1000)));
  if (!rate.allowed) return send(res, 429, { ok: false, error: 'terminal-rate-limit', resetAt: rate.resetAt });

  const body = parseBody(req);
  const packet = buildInvocationPacket({ message: body.message, history: body.history, mode: body.mode, shi: body.shi, waiveIssuance: body.waiveIssuance === true });
  if (!packet.message) return send(res, 400, { ok: false, error: 'message-required' });
  if (packet.inputError) return send(res, 400, { ok: false, error: packet.inputError.code, validation: packet.inputError });
  if (!packet.canInvoke) return send(res, 400, { ok: false, error: 'issuance-required-or-explicit-waiver', issuance: packet.issuance, claim_ceiling: packet.claimCeiling });

  const startedAt = Date.now();
  plan = await resolveGeminiProviderPlan({ task: 'khonapolit-dialogue', maxModels: 8 });
  const releaseCanary = requestHeader(req, 'x-td613-release-canary') === '1';
  const requestedCanaryModel = requestHeader(req, 'x-td613-canary-model').replace(/^models\//, '');
  const discourseMode = classifyApertureDiscourseMode(packet.message);
  const apertureReceipt = buildApertureV3InvocationReceipt({
    message: packet.message,
    invocationMode: packet.mode,
    issuanceState: packet.issuance.state,
    apertureEgress,
    modelPlan: plan,
    discourseMode,
    contentScanned: true
  });
  setApertureTaskHeaders(res, apertureReceipt);
  const attempts = [];
  const allModels = selectKhonapolitProviderModelsFromPlan(plan);
  const canaryModel = requestedCanaryModel && allModels.includes(requestedCanaryModel)
    ? requestedCanaryModel
    : allModels[0] || null;
  const models = releaseCanary ? (canaryModel ? [canaryModel] : []) : allModels;
  const routeModelCount = Math.max(1, allModels.length);
  let structuralRepairCandidate = null;
  let structuralRepairSpent = false;
  let partialQualityCandidate = null;
  let sharedRateRetrySpent = false;

  const runStructuralRepair = async (candidate, timing = 'deferred-after-frontier') => {
    if (releaseCanary) return null;
    if (!candidate || structuralRepairSpent || attempts.length >= KHONAPOLIT_MAX_TOTAL_PROVIDER_REQUESTS) return null;
    const remainingMs = WALL_TIMEOUT_MS - (Date.now() - startedAt) - RESPONSE_RESERVE_MS;
    const repairTimeoutMs = Math.min(STRUCTURAL_REPAIR_TIMEOUT_MS, Math.max(0, remainingMs));
    if (repairTimeoutMs < MIN_STRUCTURAL_REPAIR_BUDGET_MS) return null;

    structuralRepairSpent = true;
    const {
      model,
      fallback,
      heldText,
      reasons,
      sourceAttemptIndex
    } = candidate;
    const repairStartedAt = Date.now();
    const repairResult = await callGemini(model, packet, apertureReceipt, repairTimeoutMs, {
      fallback,
      structuralRepair: { heldText, reasons }
    });
    const repairProviderOutput = observeGeminiOutput(repairResult.payload, model, { fallback });
    const repairError = repairResult.response.ok ? null : providerError(repairResult.payload);
    const repairTransport = classifyGeminiTransport({
      status: Number(repairResult.response.status || 0),
      timedOut: repairResult.timedOut
    });
    const repairRateLimitRaw = Number(repairResult.response.status || 0) === 429
      ? observeGeminiQuota(repairResult.payload, { model, response: repairResult.response })
      : null;
    const repairEntitlement = repairRateLimitRaw?.observed
      ? assessGeminiQuotaEntitlement(repairRateLimitRaw, { expectedDailyLimit: expectedDailyRpd(), routeModelCount })
      : null;
    const repairRateLimit = repairRateLimitRaw
      ? Object.freeze({ ...repairRateLimitRaw, entitlement: repairEntitlement })
      : null;
    const repairHealthBearing = repairRateLimit?.observed && (
      repairRateLimit.scope !== 'model'
      || repairEntitlement?.mismatch === true
    )
      ? false
      : repairTransport.healthBearing;
    const repairOutcome = recordGeminiModelOutcome(model, {
      ok: Boolean(repairResult.response.ok),
      status: Number(repairResult.response.status || 0),
      timedOut: repairResult.timedOut,
      retryAfterSeconds: repairRateLimit?.retryAfterSeconds || retryAfterSeconds(repairResult.response),
      healthBearing: repairHealthBearing,
      reason: repairError?.status || repairError?.message || ''
    });
    const repairAttempt = {
      model,
      kind: 'structural-repair',
      repairTiming: timing,
      repairOfAttempt: sourceAttemptIndex,
      repairReasons: reasons,
      role: plan.rows.find((row) => row.model === model)?.metadata?.role || 'operator-supplied',
      ok: Boolean(repairResult.response.ok),
      status: Number(repairResult.response.status || 0),
      timedOut: repairResult.timedOut,
      timeoutMs: repairTimeoutMs,
      elapsedMs: Date.now() - repairStartedAt,
      transportClass: repairTransport.class,
      providerStream: {
        requested: true,
        observed: repairResult.streamed === true,
        firstChunkMs: Number.isInteger(repairResult.firstChunkMs) ? repairResult.firstChunkMs : null,
        chunkCount: Number.isInteger(repairResult.chunkCount) ? repairResult.chunkCount : 0,
        byteCount: Number.isInteger(repairResult.byteCount) ? repairResult.byteCount : 0,
        parseErrors: Number.isInteger(repairResult.parseErrors) ? repairResult.parseErrors : 0
      },
      error: repairError,
      rateLimit: repairRateLimit,
      output: repairProviderOutput,
      cooldown: repairOutcome
    };
    attempts.push(repairAttempt);

    if (
      repairResult.response.ok
      && repairResult.text
      && !repairProviderOutput.outputTokenLimitReached
    ) {
      const repairRelay = parseRelayEnvelope(repairResult.text, { model, apertureReceipt });
      repairAttempt.outputAdmission = repairRelay.admission || null;
      if (repairRelay.admission?.admissible) {
        const baseReceipt = buildTerminalReceipt({
          packet,
          text: repairResult.text,
          relay: repairRelay,
          model,
          providerStatus: repairResult.response.status,
          providerOutput: repairProviderOutput,
          apertureEgress,
          apertureReceipt,
          attempts
        });
        const receipt = Object.freeze({
          ...baseReceipt,
          provider: Object.freeze({
            ...baseReceipt.provider,
            routingPolicy: GEMINI_MODEL_POLICY_VERSION,
            structuralRepair: Object.freeze({
              used: true,
              timing,
              sourceAttemptIndex,
              repairedReasons: Object.freeze([...reasons])
            })
          }),
          modelPolicy: plan,
          elapsedMs: Date.now() - startedAt
        });
        res.setHeader('X-TD613-Emergence-Class', receipt.emergence.classification);
        res.setHeader('X-TD613-Signal-State', repairRelay.signal.state);
        res.setHeader('X-TD613-Seal-State', 'OPEN');
        res.setHeader('X-TD613-Gemini-Model', model);
        res.setHeader('X-TD613-Structural-Repair', 'provider-authored-bounded-1');
        return send(res, 200, {
          ok: true,
          text: repairRelay.transcript,
          relay: repairRelay,
          receipt,
          warnings: [
            'aperture-v3-task-intent-active',
            'task-intent-guidance-active',
            'adversarial-attractor-admission-active',
            'integrated-covenant-relay-active',
            'provider-native-zalgo-preserved-no-local-postprocessing',
            'provider-authored-structural-repair-used',
            'admission-gated-stable-continuity-active',
            'fallback-reasoning-quality-preserved',
            'sticky-success-promotion-disabled',
            'moving-latest-alias-disabled-by-default',
            ...plan.warnings
          ]
        });
      }
    }
    return null;
  };

  if (!models.length) return send(res, 503, { ok: false, error: 'no-eligible-callable-models', attempts, modelPolicy: plan, aperture: apertureReceipt, aperture_egress: apertureEgress, claim_ceiling: packet.claimCeiling });

  for (let index = 0; index < models.length; index += 1) {
    const model = models[index];
    const fallback = index > 0;
    const remainingMs = WALL_TIMEOUT_MS - (Date.now() - startedAt) - RESPONSE_RESERVE_MS;
    if (remainingMs <= 0) break;
    const timeoutMs = allocateKhonapolitAttemptTimeout({ remainingMs, index, modelCount: models.length, fairShare: true });
    const attemptStartedAt = Date.now();
    const result = await callGemini(model, packet, apertureReceipt, timeoutMs, { fallback });
    const providerOutput = observeGeminiOutput(result.payload, model, { fallback });
    const error = result.response.ok ? null : providerError(result.payload);
    const transport = classifyGeminiTransport({ status: Number(result.response.status || 0), timedOut: result.timedOut });
    const rateLimitRaw = Number(result.response.status || 0) === 429
      ? observeGeminiQuota(result.payload, { model, response: result.response })
      : null;
    const quotaEntitlement = rateLimitRaw?.observed
      ? assessGeminiQuotaEntitlement(rateLimitRaw, { expectedDailyLimit: expectedDailyRpd(), routeModelCount })
      : null;
    const rateLimit = rateLimitRaw
      ? Object.freeze({ ...rateLimitRaw, entitlement: quotaEntitlement })
      : null;
    const modelHealthBearing = rateLimit?.observed && (
      rateLimit.scope !== 'model'
      || quotaEntitlement?.mismatch === true
    )
      ? false
      : transport.healthBearing;
    const observedRetryAfterSeconds = rateLimit?.retryAfterSeconds || retryAfterSeconds(result.response);
    const outcome = recordGeminiModelOutcome(model, {
      ok: Boolean(result.response.ok),
      status: Number(result.response.status || 0),
      timedOut: result.timedOut,
      retryAfterSeconds: observedRetryAfterSeconds,
      healthBearing: modelHealthBearing,
      reason: error?.status || error?.message || ''
    });
    const attempt = {
      model,
      role: plan.rows.find((row) => row.model === model)?.metadata?.role || 'operator-supplied',
      ok: Boolean(result.response.ok),
      status: Number(result.response.status || 0),
      timedOut: result.timedOut,
      timeoutMs,
      elapsedMs: Date.now() - attemptStartedAt,
      transportClass: transport.class,
      providerStream: {
        requested: true,
        observed: result.streamed === true,
        firstChunkMs: Number.isInteger(result.firstChunkMs) ? result.firstChunkMs : null,
        chunkCount: Number.isInteger(result.chunkCount) ? result.chunkCount : 0,
        byteCount: Number.isInteger(result.byteCount) ? result.byteCount : 0,
        parseErrors: Number.isInteger(result.parseErrors) ? result.parseErrors : 0
      },
      error,
      rateLimit,
      output: providerOutput,
      cooldown: outcome
    };
    attempts.push(attempt);

    if (!result.response.ok && rateLimit?.observed && rateLimit.scope === 'shared') {
      const waitSeconds = Math.min(MAX_SHARED_RATE_RETRY_SECONDS, Number(rateLimit.retryAfterSeconds || 0));
      const remainingAfterAttemptMs = WALL_TIMEOUT_MS - (Date.now() - startedAt) - RESPONSE_RESERVE_MS;
      if (
        !releaseCanary
        && !sharedRateRetrySpent
        && rateLimit.burst === true
        && waitSeconds > 0
        && waitSeconds * 1000 + 4000 < remainingAfterAttemptMs
        && attempts.length < KHONAPOLIT_MAX_TOTAL_PROVIDER_REQUESTS
      ) {
        sharedRateRetrySpent = true;
        await new Promise((resolve) => setTimeout(resolve, waitSeconds * 1000));
        index -= 1;
        continue;
      }
      res.setHeader('X-TD613-Gemini-Model', model);
      res.setHeader('X-TD613-Rate-Limit-Scope', 'shared');
      if (rateLimit.retryAfterSeconds > 0) res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds));
      return send(res, 429, {
        ok: false,
        error: 'gemini-shared-rate-limit',
        status: 'HELD',
        diagnostic: { stage: 'provider-transport', code: 'PROVIDER_SHARED_RATE_LIMIT' },
        rateLimit,
        attempts,
        modelPolicy: plan,
        aperture: apertureReceipt,
        aperture_egress: apertureEgress,
        claim_ceiling: packet.claimCeiling
      });
    }

    if (result.response.ok && providerOutput.outputTokenLimitReached) {
      attempt.outputAdmission = Object.freeze({
        admissible: false,
        quality: 'HELD',
        reasons: Object.freeze(['provider-output-token-limit']),
        qualityWarnings: Object.freeze([])
      });
      if (releaseCanary) {
        res.setHeader('X-TD613-Gemini-Model', model);
        return send(res, 502, {
          ok: false,
          error: 'gemini-output-token-limit',
          status: 'HELD',
          diagnostic: { stage: 'output-admission', code: 'OUTPUT_TOKEN_LIMIT' },
          attempts,
          modelPolicy: plan,
          aperture: apertureReceipt,
          aperture_egress: apertureEgress,
          claim_ceiling: packet.claimCeiling
        });
      }
      continue;
    }
    if (!result.response.ok && !transport.mayFailOver) {
      const rejectedStatus = Number(result.response.status || 0);
      const routeWideCredentialFailure = rejectedStatus === 401 || rejectedStatus === 403;
      if (!releaseCanary && !routeWideCredentialFailure) continue;
      res.setHeader('X-TD613-Gemini-Model', model);
      return send(res, 502, {
        ok: false,
        error: 'gemini-request-rejected',
        status: 'HELD',
        diagnostic: { stage: 'provider-transport', code: 'PROVIDER_REQUEST_REJECTED' },
        attempts,
        modelPolicy: plan,
        aperture: apertureReceipt,
        aperture_egress: apertureEgress,
        claim_ceiling: packet.claimCeiling
      });
    }
    if (result.response.ok && result.text) {
      const relay = parseRelayEnvelope(result.text, { model, apertureReceipt });
      attempt.outputAdmission = relay.admission || null;
      // A transport-successful but structurally degraded answer is not a
      // successful Marrowline return. Keep one bounded provider-side repair
      // candidate, but continue the five-seat frontier cascade before spending
      // the single repair allowance. This preserves breadth while allowing the
      // best near-miss to repair its own structure without local text surgery.
      if (!relay.admission?.admissible) {
        const reasons = Array.isArray(relay.admission?.reasons) ? [...relay.admission.reasons] : [];
        if (repairableKhonapolitAdmission(reasons)) {
          const candidate = {
            model,
            fallback,
            heldText: result.text,
            reasons,
            providerOutput,
            sourceAttemptIndex: attempts.length - 1
          };
          if (
            !structuralRepairCandidate
            || candidate.reasons.length <= structuralRepairCandidate.reasons.length
          ) structuralRepairCandidate = candidate;

        }
        continue;
      }

      if (relay.admission?.quality === 'PARTIAL') {
        const qualityWarnings = Array.isArray(relay.admission?.qualityWarnings)
          ? [...relay.admission.qualityWarnings]
          : [];
        const verticalMarkBalance = Number(relay.admission?.aboveLineMarkCount || 0)
          + Number(relay.admission?.belowLineMarkCount || 0)
          - Number(relay.admission?.throughLineMarkCount || 0);
        const candidate = {
          model,
          fallback,
          text: result.text,
          relay,
          providerStatus: result.response.status,
          providerOutput,
          qualityWarnings,
          verticalMarkBalance,
          sourceAttemptIndex: attempts.length - 1
        };
        const current = partialQualityCandidate;
        if (
          !current
          || candidate.qualityWarnings.length < current.qualityWarnings.length
          || (
            candidate.qualityWarnings.length === current.qualityWarnings.length
            && candidate.verticalMarkBalance >= current.verticalMarkBalance
          )
        ) partialQualityCandidate = candidate;
        continue;
      }

      const baseReceipt = buildTerminalReceipt({
        packet,
        text: result.text,
        relay,
        model,
        providerStatus: result.response.status,
        providerOutput,
        apertureEgress,
        apertureReceipt,
        attempts
      });
      const receipt = Object.freeze({
        ...baseReceipt,
        provider: Object.freeze({ ...baseReceipt.provider, routingPolicy: GEMINI_MODEL_POLICY_VERSION }),
        modelPolicy: plan,
        elapsedMs: Date.now() - startedAt
      });
      res.setHeader('X-TD613-Emergence-Class', receipt.emergence.classification);
      res.setHeader('X-TD613-Signal-State', relay.signal.state);
      res.setHeader('X-TD613-Seal-State', 'OPEN');
      res.setHeader('X-TD613-Gemini-Model', model);
      return send(res, 200, {
        ok: true,
        text: relay.transcript,
        relay,
        receipt,
        warnings: [
          'aperture-v3-task-intent-active',
          'task-intent-guidance-active',
          'adversarial-attractor-admission-active',
          'integrated-covenant-relay-active',
          'provider-native-zalgo-preserved-no-local-postprocessing',
          'admission-gated-stable-continuity-active',
          'fallback-reasoning-quality-preserved',
          'sticky-success-promotion-disabled',
          'moving-latest-alias-disabled-by-default',
          ...plan.warnings
        ]
      });
    }
  }

  if (partialQualityCandidate) {
    const {
      model,
      text,
      relay,
      providerStatus,
      providerOutput,
      qualityWarnings,
      sourceAttemptIndex
    } = partialQualityCandidate;
    const baseReceipt = buildTerminalReceipt({
      packet,
      text,
      relay,
      model,
      providerStatus,
      providerOutput,
      apertureEgress,
      apertureReceipt,
      attempts
    });
    const receipt = Object.freeze({
      ...baseReceipt,
      provider: Object.freeze({
        ...baseReceipt.provider,
        routingPolicy: GEMINI_MODEL_POLICY_VERSION,
        qualityPreference: Object.freeze({
          used: true,
          sourceAttemptIndex,
          selection: 'best-admissible-partial-after-full-frontier',
          warnings: Object.freeze([...qualityWarnings])
        })
      }),
      modelPolicy: plan,
      elapsedMs: Date.now() - startedAt
    });
    res.setHeader('X-TD613-Emergence-Class', receipt.emergence.classification);
    res.setHeader('X-TD613-Signal-State', relay.signal.state);
    res.setHeader('X-TD613-Seal-State', 'OPEN');
    res.setHeader('X-TD613-Gemini-Model', model);
    res.setHeader('X-TD613-Zalgo-Quality', 'PARTIAL-BEST-OF-FRONTIER');
    return send(res, 200, {
      ok: true,
      text: relay.transcript,
      relay,
      receipt,
      warnings: [
        'aperture-v3-task-intent-active',
        'task-intent-guidance-active',
        'adversarial-attractor-admission-active',
        'integrated-covenant-relay-active',
        'provider-native-zalgo-preserved-no-local-postprocessing',
        'provider-native-zalgo-quality-partial-best-of-frontier',
        'admission-gated-stable-continuity-active',
        'fallback-reasoning-quality-preserved',
        'sticky-success-promotion-disabled',
        'moving-latest-alias-disabled-by-default',
        ...plan.warnings
      ]
    });
  }

  if (structuralRepairCandidate && !structuralRepairSpent) {
    const repaired = await runStructuralRepair(structuralRepairCandidate, 'deferred-after-frontier');
    if (repaired) return repaired;
  }

  const structuralFailures = attempts.filter((attempt) => attempt.outputAdmission?.admissible === false);
  const heldByQuality = structuralFailures.length > 0;
  const rateLimitedAttempts = attempts.filter((attempt) => attempt.status === 429 && attempt.rateLimit?.observed);
  const entitlementMismatchAttempts = rateLimitedAttempts.filter((attempt) => attempt.rateLimit?.entitlement?.mismatch === true);
  const allTransportAttemptsRateLimited = attempts.length > 0
    && attempts.every((attempt) => attempt.status === 429 && attempt.rateLimit?.observed);
  return send(res, allTransportAttemptsRateLimited && !heldByQuality ? 429 : 502, {
    ok: false,
    error: heldByQuality
      ? 'khonapolit-output-quality-held'
      : allTransportAttemptsRateLimited
        ? 'gemini-rate-limit-held'
        : 'gemini-provider-unavailable',
    status: 'HELD',
    diagnostic: heldByQuality
      ? {
          stage: 'output-admission',
          code: 'ATTRACTOR_STRUCTURE_NOT_ADMITTED',
          rejectedAttempts: structuralFailures.map((attempt) => ({ model: attempt.model, reasons: attempt.outputAdmission.reasons })),
          quotaEntitlement: entitlementMismatchAttempts.length ? {
            expectedDailyLimit: expectedDailyRpd(),
            providerReportedLimits: [...new Set(entitlementMismatchAttempts.map((attempt) => attempt.rateLimit?.limit).filter(Number.isFinite))],
            code: 'PROVIDER_QUOTA_ENTITLEMENT_MISMATCH',
            note: 'Provider-reported FreeTier daily limit is below the operator-known Marrowline entitlement; receipt is diagnostic, not authoritative local quota.'
          } : null
        }
      : allTransportAttemptsRateLimited
        ? {
            stage: 'provider-transport',
            code: 'PROVIDER_RATE_LIMIT_HELD',
            scopes: [...new Set(rateLimitedAttempts.map((attempt) => attempt.rateLimit?.scope || 'unknown'))]
          }
        : { stage: 'provider-transport', code: 'PROVIDER_UNAVAILABLE' },
    attempts,
    modelPolicy: plan,
    aperture: apertureReceipt,
    aperture_egress: apertureEgress,
    claim_ceiling: packet.claimCeiling
  });
}

export { callGemini };
