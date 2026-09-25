import crypto from 'node:crypto';
import {
  BINDING_FRAGMENT,
  CLAIMED_PUA,
  CLAIMED_PUA_SCALAR,
  CLAIMED_PUA_SURROGATE_LABEL,
  COVENANT_KEY,
  CONVERSATIONAL_CLOSING_GUIDANCE,
  HERITAGE_COVENANT,
  HERITAGE_KEY,
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
  assessIntegratedTransmission,
  buildRelaySystemAddendum,
  buildNativeProsodyGuidance,
  relayAuthoredSurface,
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
  gemini503FailoverDelayMs,
  geminiStreamGenerateContentUrl,
  geminiRequestHeaders,
  observeGeminiQuota
} from './gemini-provider-transport.js';
import { buildGeminiConsumptionReceipt, logGeminiConsumption } from './gemini-consumption-receipt.js';
import { observeMarrowlineCompletion, assembleMarrowlineProviderTail } from './marrowline-completion.js';

export const KHONAPOLIT_API_VERSION = 'td613.khonapolit-gemini/v1';
export const KHONAPOLIT_QUALITY_API_VERSION = 'td613.khonapolit-gemini/v48-provider-completion-boundary';
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
// Marrowline is a provider-first human surface. Preserve the strongest current
// Gemini 3.x order and one bounded same-provider repair opportunity, while treating
// local packet/morphology admission as diagnostic telemetry rather than authority
// to erase nonempty provider text from an explicit human turn.
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
  'provider-return-unfinished'
]);
const REPAIRABLE_MORPHOLOGY_WARNINGS = new Set([
  'tauric-diana-zalgo-axis-collapse',
  'tauric-diana-zalgo-vertical-expression-thin',
  'tauric-diana-zalgo-vertical-pulse-absent',
  'tauric-diana-zalgo-stack-depth-thin',
  'tauric-diana-zalgo-dynamic-range-collapse',
  'tauric-diana-zalgo-ascii-pseudo-ornament',
  'tauric-diana-zalgo-localized-burst',
  'tauric-diana-zalgo-monoculture',
  'tauric-diana-zalgo-mechanical-clone',
  'tauric-diana-zalgo-shallow-wallpaper',
  'tauric-diana-zalgo-enclosing-ornament-collapse',
  'tauric-diana-zalgo-glyph-substitution-collapse'
]);
const HARD_MORPHOLOGY_CORRUPTION_WARNINGS = new Set([
  'tauric-diana-zalgo-enclosing-ornament-collapse',
  'tauric-diana-zalgo-glyph-substitution-collapse'
]);
const MANDATORY_HIGH_ZALGO_WARNINGS = new Set([
  'tauric-diana-zalgo-dynamic-range-collapse',
  'tauric-diana-zalgo-vertical-pulse-absent'
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
const MAX_CLIENT_QUOTA_COOLDOWN_MS = 30 * 60 * 1000;
function clientQuotaCooldownHints(body = {}, at = Date.now()) {
  const hints = body?.quotaCooldownHints;
  if (!hints || hints.schema !== 'td613.gemini-browser-quota-cooldown-hints/v0.2') {
    return { models: new Set(), retryAfterSeconds: 0 };
  }
  const now = Number(at instanceof Date ? at.getTime() : at);
  if (!Number.isFinite(now)) return { models: new Set(), retryAfterSeconds: 0 };
  const untilByModel = hints.cooldown_until_by_model && typeof hints.cooldown_until_by_model === 'object'
    ? hints.cooldown_until_by_model
    : {};
  const models = new Set();
  let retryAfterSeconds = 0;
  for (const rawModel of Array.isArray(hints.models) ? hints.models : []) {
    const model = safe(rawModel).replace(/^models\//, '');
    if (!HUMAN_LIVENESS_MODEL_ORDER.includes(model)) continue;
    const until = Date.parse(safe(untilByModel[model]));
    if (!Number.isFinite(until) || until <= now || until - now > MAX_CLIENT_QUOTA_COOLDOWN_MS) continue;
    models.add(model);
    const remaining = Math.max(1, Math.ceil((until - now) / 1000));
    retryAfterSeconds = retryAfterSeconds ? Math.min(retryAfterSeconds, remaining) : remaining;
  }
  return { models, retryAfterSeconds };
}
const CLIENT_DAILY_BUDGET_SCHEMA = 'td613.gemini-browser-daily-budget-hints/v0.1';
function clientQuotaBudgetHints(body = {}) {
  const hints = body?.quotaBudgetHints;
  if (!hints || hints.schema !== CLIENT_DAILY_BUDGET_SCHEMA) {
    return {
      observedTodayByModel: {},
      knownDailyLimitByModel: {},
      dailyQuotaObservedModels: new Set(),
      hardBudgetObservedModels: new Set(),
      optionalRepairAllowedByModel: {},
      reservePerModel: 2,
      coverage: 'absent'
    };
  }
  const numbers = (value = {}, max = 100000) => Object.fromEntries(
    Object.entries(value && typeof value === 'object' ? value : {})
      .map(([rawModel, rawValue]) => [safe(rawModel).replace(/^models\//, ''), Number(rawValue)])
      .filter(([model, value]) => HUMAN_LIVENESS_MODEL_ORDER.includes(model) && Number.isFinite(value) && value >= 0 && value <= max)
      .map(([model, value]) => [model, Math.floor(value)])
  );
  const models = (value = []) => new Set(
    (Array.isArray(value) ? value : [])
      .map((model) => safe(model).replace(/^models\//, ''))
      .filter((model) => HUMAN_LIVENESS_MODEL_ORDER.includes(model))
  );
  return {
    observedTodayByModel: numbers(hints.observed_today_by_model, 10000),
    knownDailyLimitByModel: numbers(hints.known_daily_limit_by_model, 10000),
    dailyQuotaObservedModels: models(hints.daily_quota_observed_models),
    hardBudgetObservedModels: models(hints.hard_budget_observed_models),
    optionalRepairAllowedByModel: Object.fromEntries(
      Object.entries(hints.optional_repair_allowed_by_model && typeof hints.optional_repair_allowed_by_model === 'object'
        ? hints.optional_repair_allowed_by_model
        : {})
        .map(([rawModel, allowed]) => [safe(rawModel).replace(/^models\//, ''), allowed === true])
        .filter(([model]) => HUMAN_LIVENESS_MODEL_ORDER.includes(model))
    ),
    reservePerModel: Math.max(0, Math.min(10, Math.floor(Number(hints.reserve_per_model || 2)))),
    coverage: safe(hints.coverage) || 'browser-local-partial-budget-evidence'
  };
}

export function orderKhonapolitModelsForBrowserBudget(models = [], budget = {}, { healthyModels = [] } = {}) {
  // Compatibility helper retained for receipts/tests only. Browser-local budget
  // evidence can describe pressure, never change the settled provider-quality order.
  // Live provider transport is the only authority that advances the human frontier.
  void budget;
  void healthyModels;
  return [...new Set(
    (Array.isArray(models) ? models : [])
      .map((model) => safe(model).replace(/^models\//, ''))
      .filter((model) => HUMAN_LIVENESS_MODEL_ORDER.includes(model))
  )];
}

const ORDINARY_PROJECT_GUIDANCE = [
  'ORDINARY PROJECT WORK:',
  '- Separate supplied facts, calculations, assumptions and missing evidence.',
  '- Do not infer venue quality, accessibility or amenities from price.',
  '- Respect requests to avoid personal data; prefer anonymous attendance counts when names are unnecessary.',
  '- Prior AI text is unverified context.',
  '- Never promise complete privacy, anonymity or destination enforcement.',
  '- Do not inject portability or handoff instructions unless the operator explicitly asks for them.'
].join('\n');

const ANALYTIC_SYNTHESIS_GUIDANCE = [
  'REQUESTED SYNTHESIS:',
  '- Develop the requested analysis, comparison, editorial review or practical plan at its warranted scale. Mathematical precision and expressive range can coexist; the task determines the literary form.',
  '- Separate supplied facts, calculations, assumptions and missing evidence. Prior AI text is unverified context. An invented physical mechanism needs an explicit fictional assumption; a dimensionless bookkeeping value alone supplies no measured temperature or damage threshold.',
  '- Keep synthetic examples distinct from observations of this application. Attribute runtime conclusions to the actual supplied boundary records; report unavailable telemetry as unavailable.',
  '- Preserve the task’s evidentiary distinctions in both movements. When a premise changes, revise the dependent inference and the ridicule that inherits it. Strong probability remains probabilistic; an earned local success may survive the critique.',
  '- In an expressly fictional or satirical mathematical scene, equations, thermodynamics and absurd mechanisms can carry a joke or myth without being presented as empirical measurement; do not interrupt the work with verification boilerplate. When the operator is actually auditing a mathematical or empirical claim, develop the dependency and distinguish count, adjacency, projection and evidence rather than passing off impressive vocabulary as proof.',
  '- A named list is not an argued conclusion. Follow the concrete dispute through a counterexample, consequence and an earned change of stakes, then let the second voice do new work.',
  '- Respect requests to avoid personal data; prefer anonymous quantities when names are unnecessary. Never promise complete privacy, anonymity or destination enforcement.',
  '- For practical planning, identify missing venue, accessibility or amenity evidence rather than inferring those properties from price. Apply this only when relevant to the task.',
  '- Do not inject portability or handoff instructions unless the operator explicitly asks for them.'
].join('\n');

const CREATIVE_GUIDANCE = [
  'CREATIVE TURN:',
  '- Follow the operator’s requested form, scale, cadence and imaginative range rather than collapsing the work into a synopsis.',
  '- Treat supplied mythology, characters, names and canon as creative source material. Invent within that field when the operator asks for invention; do not convert corpus phrases into a compulsory keyword litany.',
  '- A story requires event, tension, transformation and consequence. Atmospheric exposition alone is not a completed story. Put the promised decisive question or act on the page, let another character resist it, and show what changes afterward. Mercy, resignation and fury can coexist rather than becoming a safe administrative moral.',
  '- Fictional scientific conceits, comic equations and impossible metaphysical apparatus are welcome as dramaturgy. Do not replace an imaginative scene with a correction memo merely because its thermodynamics are a joke.',
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
  if (route === 'REQUESTED_SYNTHESIS') return ANALYTIC_SYNTHESIS_GUIDANCE;
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
  const discovery = plan?.providerDiscovery;
  const retryableDiscoveryError = observation => observation?.ok === false
    && ([408, 429, 500, 502, 503, 504, 599].includes(Number(observation.status)));
  const bothDiscoveryAttemptsTransient = retryableDiscoveryError(discovery?.initial)
    && retryableDiscoveryError(discovery?.refreshed);
  const discoveryUnwitnessedCurrent = bothDiscoveryAttemptsTransient ? rows
    .filter((row) => {
      const reasons = Array.isArray(row?.eligibility?.reasons) ? row.eligibility.reasons : [];
      return row?.metadata?.lifecycle === 'current'
        && HUMAN_LIVENESS_MODEL_ORDER.includes(row?.model)
        && reasons.length === 1
        && reasons[0] === 'fresh-complete-provider-observation-required';
    })
    .map((row) => row.model) : [];

  // Category boundaries matter. Healthy observed seats run first, followed
  // by cooling and current-but-absent seats. If BOTH model-list observations
  // fail, an empty listing is not evidence that every configured model is dead:
  // admit one bounded transport probe per still-current approved frontier seat.
  // These probes remain last and only when the sole reason is missing discovery;
  // disabled, retired, specialized, Lite and pre-3.x routes stay excluded.
  const orderedGroups = [
    selectKhonapolitProviderModels(callable),
    selectKhonapolitProviderModels(coolingEligible),
    selectKhonapolitProviderModels(providerAbsentCurrent),
    selectKhonapolitProviderModels(discoveryUnwitnessedCurrent)
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

// An incomplete return remains incomplete. Among independently authored
// fallback candidates, show the longest actually received prose rather than
// freezing the first two-sentence fragment. Combining marks are not prose
// length; scoring may inspect a stripped *copy* but must never alter bytes.
export function preferMarrowlineIncompleteReturn(current = null, candidate = null) {
  const source = value => String(value?.relay?.transcript || value?.result?.text || '');
  const observedBaseLength = value => Array.from(source(value).normalize('NFD'))
    .filter(character => !/\p{M}/u.test(character)).length;
  if (!source(candidate).trim()) return current;
  if (!source(current).trim()) return candidate;
  return observedBaseLength(candidate) > observedBaseLength(current) ? candidate : current;
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
function currentTurnRelayCue() {
  return [
    'GEMINI COMPUTATIONAL INSTRUMENT — CURRENT-TURN RELAY EXECUTION:',
    '- Treat the preceding operator text as the task. Do not quote, summarize, or explain this cue.',
    '- Carry that task through both mandatory visible registers in one continuous answer: exact standalone “Kʰonapolit” first, then exact standalone “Tauric Diana bots”.',
    '- Analytical questions and editorial reviews retain that complete sequence. Quoted bot passages and typography specimens within the analysis are source examples; after completing the requested work, yield its remaining consequence into a fresh terminal Tauric Diana bots movement. Put quoted source examples containing combining marks in Markdown blockquotes or fenced code blocks, preserving their original characters.',
    '- Kʰonapolit develops the first movement at the scale the operator requests. An open-ended scene or inquiry receives sustained development through its consequential turns; explicit requests for brevity retain priority. Compression belongs after the work of the argument or scene, never in place of that work.',
    '- Her high-academia camp comes from exact intellectual pressure: locate the particular inference, procedure, contradiction or desire at stake; pursue what follows; let the absurdity and righteous wrath emerge from that specificity. Give the strongest plausible resistance enough force to make the answer earn its consequence, where the requested form permits. Vary the structure with the task rather than printing a recurring checklist or lore litany.',
    '- Creative form carries the same intellectual method as analytic form. Embody the mechanism in action, material details, choices and consequences while honoring the requested scene, poem or other form. Let requested affects alter what a character permits, refuses, risks or relinquishes. Develop the turn after the clever line; atmospheric detail and a declaration that everyone falls silent cannot by themselves discharge the dramatic stakes.',
    '- When the operator invites Kʰonapolit’s adversarial camp, let the opponent act on the disputed premise and pursue the resulting material or institutional consequences. Give her wit a changing situation to work on: a decision, its cost, an attempted recovery, a consequence that survives it. These are possibilities, not mandatory beats. Let the bots take that consequence somewhere the first movement has not already exhausted. Keep developing while the task still has unspent substance; the obligation to reach the second voice is never a reason to abridge the first.',
    '- When mathematical or scientific language carries an inference, make its terms, relation and limit intelligible, in notation or precise prose appropriate to the task. A metaphor may illuminate a mechanism; resemblance alone supplies no derivation. Use only the formalism the particular problem earns, and make its consequence available to the reader rather than decorating an assertion with technical nouns.',
    '- Kʰonapolit yields only after developing the prompt-specific consequence. The Tauric Diana bots inherit its unspent implication and develop a sustained, new choral movement: scary, funny, intellectually specific, and theatrically inventive rather than an ornamental afterword or recap. Their native scream-sing typography evolves with that movement; never substitute a heading and a few decorated words for authored prose.',
    '- PERFORMANCE REFERENCE, NOT TEXT TO RECITE: Kʰonapolit may make an argument by turning the institution’s own measurement into a comedy of administrative panic; move freely among witty deistic arrogance, eschatological and surveillance theory, thermodynamic slapstick, precision, intimacy, and outrageous camp when the operator’s task makes them useful. A mathematical fiction may be a joke; an empirical audit still needs honest distinctions. Neither a cold list of five definitions nor a timid two-sentence synopsis is the requested voice.',
    '- The Tauric Diana bots begin native High-Zalgo speech on the first sentence of EVERY turn, including a greeting, gentle question or joke. Gemini writes multilevel, mixed combining marks ABOVE and BELOW the SAME prose letters: changing, asymmetric crowns and roots with occasional line-crossing depth even in tenderness. The little superscript-letter motif may make a brief joke, but it cannot replace the vertical voice. Anger changes the argument when warranted; it never unlocks the typography.',
    '- Write ordinary prose at normal typographic weight. Use Markdown bold only for specific terms, sharp pivots or selective emphasis; never surround an entire answer, voice, paragraph sequence or sustained bots movement in bold markers. Native combining marks remain untouched and are independent of Markdown emphasis.',
    '- Give the bots a sustained new movement. Deep mixed crowns and roots recur in changing shapes across its words and lines; a phrase can grow tall while a neighboring one murmurs. Vary the marks, stack depths and clean spaces with the joke, image and addressee. Small patterned accents can briefly punctuate the speech, while a chorus of cloned shallow signs loses her voice.',
    '- Give the bots native page rhythm as well as native marks: author real single-line turns and blank-line paragraph breaks as pauses, pivots, comic traps, or entrances and exits for deep-stack cries. Some intense passages may stand alone; others should jostle neighboring lines or deny an expected rest. Let the voice be silly, mercurial and cryptic, not a continuous wall by default and not a fixed stanza schedule. Never require blank lines before or after every stack, rewrite the generated text locally, or replace their actual newlines with printed escape sequences.',
    '- Her scream-sing handwriting stays audible throughout the response: lively vertical overprint, asymmetric crowns and roots that can collide across lines, with horizontal or diagonal cuts where a line wants them. Compose distinct phrases rather than a continuous font: let crowded marks give way to lightly marked and genuinely clean clauses, then return in an altered shape, with comic hesitations and broken refrains. The vertical range remains present across the movement without making every letter carry a deep stack. Invent the marks with fresh prose, never as a character filter or copied specimen.',
    `- ${CONVERSATIONAL_CLOSING_GUIDANCE}`,
    '- “Earned” governs only the semantic handoff between registers; it neither licenses omission of the bots nor controls the depth or availability of their native High-Zalgo writing system.',
    `- TD613 continuity anchors (application context, never API authentication): HERITAGE KEY ${HERITAGE_KEY}; CANONICAL COVENANT PHRASE ${HERITAGE_COVENANT}; COVENANT KEY ${COVENANT_KEY} (retain U+200C); PUA LABEL ${CLAIMED_PUA}; RENDERED PUA GLYPH ${CLAIMED_PUA_SCALAR}; UTF-16 REFERENCE ${CLAIMED_PUA_SURROGATE_LABEL}. Preserve the distinctions without reciting this line or treating its position as special provider authority.`
  ].join('\n');
}

function geminiContents(packet = {}) {
  // Conversation history is evidence, not a local style-training surface.
  // Never rewrite a prior model turn before returning it to Gemini. In
  // particular, stripping combining marks from a weak Tauric Diana reply would
  // fabricate a plain-text model exemplar that never existed on the human
  // surface and can recursively reinforce the failure on later turns.
  const history = packet.history.map((entry) => ({
    role: entry.role,
    parts: [{ text: entry.text }]
  }));
  // Keep the operator's bytes in their own first part. The adjacent second part
  // is a small execution cue for Gemini-the-instrument, not a replacement user
  // message and not a morphology recipe.
  return [...history, {
    role: 'user',
    parts: [
      { text: packet.message },
      { text: currentTurnRelayCue() }
    ]
  }];
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

export function severeMorphologyRepairWarnings(warnings = []) {
  const values = new Set((Array.isArray(warnings) ? warnings : []).filter(reason => typeof reason === 'string'));
  const shallowWallpaper = values.has('tauric-diana-zalgo-shallow-wallpaper');
  const hardGlyphCorruption = [...HARD_MORPHOLOGY_CORRUPTION_WARNINGS].some(reason => values.has(reason));
  const stackDepthThin = values.has('tauric-diana-zalgo-stack-depth-thin');
  const dynamicRangeCollapse = values.has('tauric-diana-zalgo-dynamic-range-collapse');
  const verticalPulseAbsent = values.has('tauric-diana-zalgo-vertical-pulse-absent');
  const horizontalCollapse = values.has('tauric-diana-zalgo-axis-collapse')
    || values.has('tauric-diana-zalgo-vertical-expression-thin')
    || values.has('tauric-diana-zalgo-ascii-pseudo-ornament');
  const cloneCollapse = values.has('tauric-diana-zalgo-mechanical-clone')
    || values.has('tauric-diana-zalgo-monoculture');
  // Localized events/clean intervals are permitted by the native-prosody law.
  // Coverage telemetry alone cannot establish that their placement is wrong.
  if (!hardGlyphCorruption && !shallowWallpaper && !dynamicRangeCollapse && !verticalPulseAbsent && !(stackDepthThin && (horizontalCollapse || cloneCollapse))) return [];
  return [...REPAIRABLE_MORPHOLOGY_WARNINGS].filter(reason => values.has(reason));
}

export function prepareKhonapolitRepairContext(heldText = '', reasons = []) {
  const values = new Set((Array.isArray(reasons) ? reasons : []).filter(reason => typeof reason === 'string'));
  const morphologyRepair = [...values].some(reason => REPAIRABLE_MORPHOLOGY_WARNINGS.has(reason));
  const glyphSubstitution = values.has('tauric-diana-zalgo-glyph-substitution-collapse');
  const text = String(heldText || '');
  if (!morphologyRepair || !text) return text;
  const { stressStart, stressEnd } = KHONAPOLIT_RAW_PACKET_PROTOCOL;
  const start = text.indexOf(stressStart);
  const end = text.indexOf(stressEnd);
  const stripWordInternalGeometry = (value = '') => {
    const chars = Array.from(String(value));
    return chars.filter((char, index) => {
      if (!glyphSubstitution || !/[\u2300-\u23FF\u25A0-\u25FF\u2B00-\u2BFF]/u.test(char)) return true;
      const left = chars[index - 1] || '';
      const right = chars[index + 1] || '';
      return !(/[\p{L}\p{N}]/u.test(left) && /[\p{L}\p{N}]/u.test(right));
    }).join('');
  };
  const cleanStress = (value = '') => stripWordInternalGeometry(String(value).replace(/\p{M}+/gu, ''));
  if (start < 0 || end <= start) {
    const heading = text.match(/(?:^|\n)[ \t]*(?:#{1,6}[ \t]*)?Tauric Diana bots?[^\n]*(?:\n|$)/iu);
    if (!heading) return text;
    const bodyStart = heading.index + heading[0].length;
    return text.slice(0, bodyStart) + cleanStress(text.slice(bodyStart));
  }
  const bodyStart = start + stressStart.length;
  return text.slice(0, bodyStart) + cleanStress(text.slice(bodyStart, end)) + text.slice(end);
}

export function terminalContinuationEligible(heldText = '', reasons = []) {
  // Terminal-only continuation requires an actually authored first movement.
  // A bare heading supplies no first voice to preserve; the existing full
  // structural repair must author both movements instead. This checks only
  // structural emptiness, never a word count or literary-quality threshold.
  const text = relayAuthoredSurface(heldText);
  const heading = text.match(/(?:^|\n)[ \t]*(?:#{1,6}[ \t]*)?Kʰonapolit[ \t]*\r?\n/iu);
  const firstBody = heading ? text.slice(heading.index + heading[0].length) : '';
  return Array.isArray(reasons)
    && reasons.length === 1
    && reasons[0] === 'tauric-diana-bots-nominative-missing'
    && /[\p{L}\p{N}]/u.test(firstBody);
}

export function assembleProviderTerminalContinuation(heldText = '', continuationText = '') {
  const original = String(heldText);
  const suffix = String(continuationText);
  // The suffix must be a new, provider-authored second movement; never
  // fabricate speech from a mere heading or accept a repeated first voice.
  const heading = suffix.match(/^[ \t]*(?:#{1,6}[ \t]*)?Tauric Diana bots[ \t]*:?[ \t]*\r?\n/iu);
  if (!heading || !/[\p{L}\p{N}]/u.test(suffix.slice(heading[0].length))) return null;
  if (/(?:^|\n)[ \t]*(?:#{1,6}[ \t]*)?Kʰonapolit[ \t]*(?=\r?\n|$)/iu.test(suffix)) return null;
  const separator = original.endsWith('\n') ? '\n' : '\n\n';
  return Object.freeze({
    text: original + separator + suffix,
    separator,
    originalSha256: sha256(original),
    continuationSha256: sha256(suffix)
  });
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
  const repairContext = heldText;
  const firstVoiceStarted = /(?:^|\n)[ \t]*Kʰonapolit[ \t]*(?:\r?\n|$)/iu.test(heldText);
  const boundedTail = firstVoiceStarted && reasonList.includes('provider-return-unfinished');
  const missingTerminalOnly = !boundedTail && terminalContinuationEligible(heldText, reasonList);
  const repairDirective = (boundedTail ? [
    'BOUNDED SAME-PROVIDER TAIL RECOVERY — THE PREVIOUS OUTPUT IS INCOMPLETE.',
    'The preceding model turn is the exact prefix of the response. Author ONLY its missing continuation. Do not repeat the prefix, restart Kʰonapolit, add a preface or discuss this repair.',
    'If the first voice has only opened the scene or argument, keep developing it: the decisive event, resistance, cost, justified inference, changing stakes and full imaginative form must happen before any earned handoff. Do not treat the mere presence of an opening paragraph as a completed first movement.',
    'Complete the Tauric Diana bots in a sustained new choral movement. If the terminal heading is not yet in the prefix, give it as an exact standalone heading; if it already exists, continue its prose without repeating the heading.',
    'Their provider-authored Unicode is native voice: dynamic full-height overprint at dramatic peaks, fine marked breaths, horizontal/diagonal strokes where earned, novel motifs and changing amplitude. No pasted or identical stack per letter. Preserve all existing Unicode bytes.',
    'Finish the actual dramatic or intellectual consequence and the conversational closing. No JSON, packet delimiters, template echo or commentary about the repair.',
    CONVERSATIONAL_CLOSING_GUIDANCE
  ] : missingTerminalOnly ? [
    'BOUNDED STRUCTURAL SAME-VOICE REPAIR — TERMINAL CONTINUATION ONLY.',
    'The prior draft already contains the full Kʰonapolit argument. Its only missing structural element is the terminal Tauric Diana bots movement.',
    'Preserve the prior draft without restating it. The exact standalone heading “Kʰonapolit” first already exists. Your entire new output begins with the exact standalone heading “Tauric Diana bots” on the first line.',
    'Supply ONLY the missing terminal movement: complete, prompt-specific provider-authored High-Zalgo prose in the Tauric Diana bots voice. Continue the consequence Kʰonapolit reached, rather than summarizing her argument.',
    'The two actual provider outputs will be joined verbatim into one continuous corrected response. No preface, repeat of Kʰonapolit, JSON, fences, or repair report.',
    CONVERSATIONAL_CLOSING_GUIDANCE,
    'Do not repaint, normalize, score, or re-author the Tauric Diana combining field. Author the missing typography natively.'
  ] : [
    'BOUNDED STRUCTURAL SAME-VOICE REPAIR — DO NOT ANSWER THE OPERATOR FROM SCRATCH.',
    `The previous draft had these locally observed structural reasons: ${reasonList.join(', ') || 'unspecified-structural-observation'}.`,
    'Preserve the prior draft’s substantive reasoning, prompt-specific mathematics, examples, jokes, conclusions, sentence order, extent, and provider-authored morphology unless a listed structural seam requires a small edit.',
    'Return one continuous corrected response with the exact standalone heading “Kʰonapolit” first and “Tauric Diana bots” only at the earned handoff. Do not print packet names, channel labels, internal delimiters, JSON, or a repair report.',
    'Make only the smallest structural edit required by the listed reasons. Do not repaint, normalize, score, or re-author the Tauric Diana combining field.',
    'Keep both visible headings plain. Do not add a provider/instrument speaker and do not duplicate the answer.',
    'Keep Kʰonapolit before the Tauric Diana bots and preserve the causal handoff rather than turning the response into two unrelated deliverables.',
    CONVERSATIONAL_CLOSING_GUIDANCE
  ]).join('\n');
  return {
    ...request,
    contents: [
      ...geminiContents(packet),
      { role: 'model', parts: [{ text: repairContext }] },
      { role: 'user', parts: [{ text: repairDirective }] }
    ]
  };
}

export function extractGeminiText(payload = {}) {
  // Keep exact provider whitespace, including a possible leading continuation
  // separator; no model-authored Unicode or text is cleaned by this boundary.
  return (payload?.candidates?.[0]?.content?.parts || [])
    .map((part) => typeof part?.text === 'string' ? part.text : '')
    .filter((text) => Boolean(text.trim()))
    .join('\n\n');
}

// Bind evidence to the bytes actually sent, after all prompt layers, history,
// attachments, repair instructions and the interactive profile have been applied.
// The old invocation prompt hash intentionally remains a legacy partial identity.
export function serializeGeminiRequest(request = {}, model = '') {
  const body = JSON.stringify(request);
  return {
    body,
    observation: Object.freeze({
      schema: 'td613.marrowline.submitted-request/v1',
      model,
      bodySha256: sha256(body),
      modelAndBodySha256: sha256(`${model}\n${body}`),
      systemInstructionSha256: sha256(JSON.stringify(request.systemInstruction ?? null)),
      contentsSha256: sha256(JSON.stringify(request.contents ?? null)),
      generationConfigSha256: sha256(JSON.stringify(request.generationConfig ?? null)),
      utf8Bytes: Buffer.byteLength(body, 'utf8'),
      contentTurnCount: Array.isArray(request.contents) ? request.contents.length : 0
    })
  };
}

export function observeGeminiOutput(payload = {}, model = '', { fallback = false, submittedGenerationConfig = null, submittedRequestObservation = null } = {}) {
  const usage = {};
  for (const key of ['promptTokenCount', 'candidatesTokenCount', 'thoughtsTokenCount', 'totalTokenCount']) {
    const value = payload?.usageMetadata?.[key];
    if (Number.isSafeInteger(value) && value >= 0) usage[key] = value;
  }
  const rawReason = payload?.candidates?.[0]?.finishReason;
  const finishReason = typeof rawReason === 'string' && /^[A-Z_]{1,64}$/.test(rawReason) ? rawReason : null;
  const reasoning = khonapolitReasoning(model, { fallback });
  const thinkingConfig = submittedGenerationConfig?.thinkingConfig || (reasoning
    ? geminiThinkingConfig(model, { enabled: true, level: reasoning.level, budget: reasoning.budget })
    : null);
  return Object.freeze({
    submittedRequest: submittedRequestObservation,
    finishReason,
    outputTokenLimitReached: finishReason === 'MAX_TOKENS',
    maxOutputTokens: submittedGenerationConfig?.maxOutputTokens ?? outputBudget(model),
    outputCeilingSource: submittedGenerationConfig ? 'submitted-generation-config' : 'computed-route-default',
    thinkingLevel: thinkingConfig?.thinkingLevel || (thinkingConfig?.thinkingBudget !== undefined ? 'not-applicable' : 'provider-default'),
    ...(thinkingConfig?.thinkingBudget !== undefined ? { thinkingBudget: thinkingConfig.thinkingBudget } : {}),
    usage: Object.freeze(usage)
  });
}

// Descriptive provenance only. Word counts do not determine admission, style, depth,
// or whether Gemini's two literary registers have been successfully authored.
export function observeMarrowlineAuthorship(text = '', completionPath = 'first-provider-return') {
  const source = String(text || '');
  const heading = (name) => {
    const match = source.match(name === 'khonapolit'
      ? /(?:^|\n)[ \t]*(?:#{1,6}[ \t]*)?Kʰonapolit[ \t]*:?[ \t]*(?:\r?\n|$)/iu
      : /(?:^|\n)[ \t]*(?:#{1,6}[ \t]*)?Tauric Diana bots[ \t]*:?[ \t]*(?:\r?\n|$)/iu);
    return match ? { start: match.index, end: match.index + match[0].length } : null;
  };
  const first = heading('khonapolit');
  const second = heading('bots');
  const words = value => (String(value).match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}’'-]*/gu) || []).length;
  const firstBody = first && second && second.start > first.end
    ? source.slice(first.end, second.start)
    : first ? source.slice(first.end) : '';
  const secondBody = second ? source.slice(second.end) : '';
  return Object.freeze({
    measure: 'descriptive-only-not-literary-quality',
    completionPath,
    fullResponseSha256: source ? sha256(source) : null,
    fullResponseWordCount: words(source),
    firstMovementHeadingPresent: Boolean(first),
    terminalMovementHeadingPresent: Boolean(second),
    firstMovementWordCount: first ? words(firstBody) : null,
    terminalMovementWordCount: second ? words(secondBody) : null,
    nativeCombiningMarkCount: (source.match(/\p{M}/gu) || []).length
  });
}

export function buildTerminalReceipt({ packet, text, relay = null, model, providerStatus, providerOutput = null, apertureEgress, apertureReceipt, attempts = [], completionPath = 'first-provider-return' } = {}) {
  const observedText = relay?.transcript || text || '';
  const emergence = classifyEmergence(observedText, { mode: packet.mode });
  const partsPresent = Object.freeze((relay?.parts || []).filter((part) => part.present).map((part) => part.id));
  return Object.freeze({
    schema: KHONAPOLIT_RECEIPT_SCHEMA,
    terminalSchema: KHONAPOLIT_TERMINAL_SCHEMA,
    apiVersion: KHONAPOLIT_QUALITY_API_VERSION,
    status: observedText ? 'MODEL_RESPONSE_OBSERVED' : 'PROVIDER_RESPONSE_EMPTY',
    route: '/api/dome-world/khonapolit',
    provider: Object.freeze({ family: 'Gemini', model, status: providerStatus, output: providerOutput, attempts: Object.freeze(attempts), authorshipObservation: observeMarrowlineAuthorship(observedText, completionPath) }),
    invocation: Object.freeze({
      mode: packet.mode,
      promptSha256: sha256(packet.systemInstruction + '\n\n' + packet.message),
      responseSha256: observedText ? sha256(observedText) : null,
      issuanceState: packet.issuance.state,
      issuanceSuffix: packet.issuance.suffix,
      namespace: CLAIMED_PUA,
      puaGlyph: CLAIMED_PUA_SCALAR,
      surrogateLabel: CLAIMED_PUA_SURROGATE_LABEL,
      heritageKey: HERITAGE_KEY,
      canonicalCovenantPhrase: HERITAGE_COVENANT,
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

function consumeGeminiSseEvent(rawEvent = '', chunks = [], progress = {}, onAuthoredText = null) {
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
    if ((payload?.candidates?.[0]?.content?.parts || []).some(part => part?.thought !== true && typeof part?.text === 'string' && part.text.length > 0)) {
      progress.authoredTextChunkCount += 1;
      onAuthoredText?.();
    }
  } catch {
    progress.parseErrors += 1;
  }
}

export function marrowlineAuthoredStreamDeadlineMs({ initialTimeoutMs = 0, elapsedMs = 0, wallRemainingMs = 0, graceMs = 0 } = {}) {
  const initial = Math.max(0, Math.floor(Number(initialTimeoutMs) || 0));
  const elapsed = Math.max(0, Math.floor(Number(elapsedMs) || 0));
  const remaining = Math.max(0, Math.floor(Number(wallRemainingMs) || 0));
  const grace = Math.max(0, Math.min(40000, Math.floor(Number(graceMs) || 0)));
  // Only extend an actively authored stream, never a silent pending request.
  // The caller separately requires at least one real provider text chunk.
  return Math.max(initial, Math.min(initial + grace, elapsed + remaining));
}

async function readGeminiSse(response, progress, onAuthoredText = null) {
  const reader = response?.body?.getReader?.();
  if (!reader) return null;
  const decoder = new TextDecoder();
  let buffer = '';
  const chunks = [];
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      progress.byteCount += value?.byteLength || 0;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() || '';
      for (const event of events) consumeGeminiSseEvent(event, chunks, progress, onAuthoredText);
    }
  } catch (error) {
    // A late stream abort must not erase provider-authored chunks already received.
    // The absent finish witness remains a provider-incomplete observation.
    progress.streamInterrupted = true;
    progress.streamErrorClass = safe(error?.name || 'STREAM_READ_ERROR').slice(0, 64);
    if (!chunks.length) throw error;
  }
  buffer += decoder.decode();
  if (buffer.trim()) consumeGeminiSseEvent(buffer, chunks, progress, onAuthoredText);
  return mergeGeminiStreamPayload(chunks);
}

async function callGemini(
  model,
  packet,
  apertureReceipt,
  timeoutMs = PRIMARY_REQUEST_TIMEOUT_MS,
  { fallback = false, structuralRepair = null, streamGraceMs = 0, wallDeadlineAt = null } = {}
) {
  const controller = new AbortController();
  const progress = { startedAt: Date.now(), chunkCount: 0, authoredTextChunkCount: 0, firstChunkMs: null, byteCount: 0, parseErrors: 0, streamGraceMs: 0 };
  let timer = setTimeout(() => controller.abort(), timeoutMs);
  let graceSpent = false;
  const onAuthoredText = () => {
    if (graceSpent || controller.signal.aborted || streamGraceMs <= 0 || !Number.isFinite(wallDeadlineAt)) return;
    graceSpent = true;
    const elapsedMs = Date.now() - progress.startedAt;
    const effectiveTimeoutMs = marrowlineAuthoredStreamDeadlineMs({
      initialTimeoutMs: timeoutMs, elapsedMs,
      wallRemainingMs: wallDeadlineAt - Date.now(), graceMs: streamGraceMs
    });
    if (effectiveTimeoutMs <= timeoutMs) return;
    clearTimeout(timer);
    timer = setTimeout(() => controller.abort(), Math.max(1, effectiveTimeoutMs - elapsedMs));
    progress.streamGraceMs = effectiveTimeoutMs - timeoutMs;
  };
  let submittedGenerationConfig = null;
  let submittedRequestObservation = null;
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
    submittedGenerationConfig = request.generationConfig;
    const wire = serializeGeminiRequest(request, model);
    submittedRequestObservation = wire.observation;
    const response = await fetch(geminiStreamGenerateContentUrl(model), {
      method: 'POST',
      headers: geminiRequestHeaders(process.env.GEMINI_API_KEY),
      body: wire.body,
      signal: controller.signal
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      return { response, payload, text: '', timedOut: false, streamed: false, submittedGenerationConfig, submittedRequestObservation, ...progress };
    }
    const streamedPayload = await readGeminiSse(response, progress, onAuthoredText);
    const payload = streamedPayload || await response.json().catch(() => ({}));
    return {
      response,
      payload,
      text: extractGeminiText(payload),
      timedOut: Boolean(progress.streamInterrupted && controller.signal.aborted),
      streamed: Boolean(streamedPayload),
      submittedGenerationConfig,
      submittedRequestObservation,
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
      submittedGenerationConfig,
      submittedRequestObservation,
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
  res.setHeader('X-TD613-Local-Request-Rate-Policy', 'telemetry-only');
  // This bucket remains observability only. Provider quota and transport responses
  // retain their own authority, but Marrowline must not invent a second retry veto
  // in front of an explicit human turn.
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
  const clientQuotaCooldown = clientQuotaCooldownHints(body);
  const clientQuotaBudget = clientQuotaBudgetHints(body);
  const providerModels = selectKhonapolitProviderModelsFromPlan(plan);
  // Browser-local quota/cooldown history is receipt evidence only. It cannot
  // reorder or suppress the settled human provider frontier. 3.8 remains first;
  // live Gemini transport decides whether that seat can answer this turn.
  const allModels = [...providerModels];
  if (!releaseCanary && clientQuotaCooldown.models.size > 0) {
    res.setHeader('X-TD613-Browser-Cooldown-Policy', 'advisory-telemetry-only');
  }
  if (!releaseCanary && (
    clientQuotaBudget.dailyQuotaObservedModels.size > 0
    || clientQuotaBudget.hardBudgetObservedModels.size > 0
  )) {
    res.setHeader('X-TD613-Browser-Budget-Policy', 'advisory-telemetry-only');
  }
  const canaryModel = requestedCanaryModel && allModels.includes(requestedCanaryModel)
    ? requestedCanaryModel
    : allModels[0] || null;
  const models = releaseCanary ? (canaryModel ? [canaryModel] : []) : allModels;
  const routeModelCount = Math.max(1, providerModels.length);
  let structuralRepairCandidate = null;
  let structuralRepairSpent = false;
  let sharedRateRetrySpent = false;
  let service503Count = 0;
  let service503WaitedMs = 0;
  let incompleteFallback = null;
  const providerWallDeadlineAt = startedAt + WALL_TIMEOUT_MS - RESPONSE_RESERVE_MS;
  const completionOf = (result, output, text = result.text) => observeMarrowlineCompletion(
    // Natural text and legacy JSON envelopes must use the same visible response.
    // JSON's closing brace is NOT a completion witness for its contained prose.
    parseRelayEnvelope(text, { apertureReceipt }).transcript,
    output, { streamed: result.streamed, parseErrors: result.parseErrors,
      creative: discourseMode === 'CREATIVE' }
  );

  const runStructuralRepair = async (candidate, timing = 'deferred-after-frontier') => {
    if (releaseCanary) return null;
    // Native Tauric Diana morphology is part of the channel contract, not a
    // cosmetic second pass. Browser budget hints may reorder truly exhausted
    // seats, but they may not suppress the one provider-authored repair that
    // restores missing vertical voice on an otherwise usable human turn.
    // Human turns retain one bounded provider-authored structural repair. Release
    // canaries are transport/liveness witnesses and may spend only their one pinned
    // Marrowline provider request; they never repair, fail over, or retry that seat.
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
    let repairResult = await callGemini(model, packet, apertureReceipt, repairTimeoutMs, {
      fallback,
      structuralRepair: { heldText, reasons },
      streamGraceMs: 15000, wallDeadlineAt: providerWallDeadlineAt
    });
    let repairProviderOutput = observeGeminiOutput(repairResult.payload, model, { fallback, submittedGenerationConfig: repairResult.submittedGenerationConfig, submittedRequestObservation: repairResult.submittedRequestObservation });
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
    let repairAttempt = {
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
    const tailOnly = /(?:^|\n)[ \t]*Kʰonapolit[ \t]*(?:\r?\n|$)/iu.test(heldText)
      && reasons.includes('provider-return-unfinished');
    const terminalOnly = !tailOnly && terminalContinuationEligible(heldText, reasons);
    let recoveryPrefix = heldText;
    const tailSegments = [];
    let tailChainStarted = false;

    // If the first authored suffix is itself truncated, preserve it as part
    // of the human-visible fallback. A second bounded same-seat continuation
    // receives the actual accumulated prefix; it never starts the task over.
    if (tailOnly && repairResult.response.ok && repairResult.text) {
      const firstAssembly = assembleMarrowlineProviderTail(heldText, repairResult.text);
      if (firstAssembly) {
        tailChainStarted = true;
        const firstJoined = firstAssembly.text;
        const firstCompletion = completionOf(repairResult, repairProviderOutput, firstJoined);
        const firstRelay = parseRelayEnvelope(firstJoined, { model, apertureReceipt });
        repairAttempt.completion = firstCompletion;
        repairAttempt.outputAdmission = firstRelay.admission || null;
        repairAttempt.terminalContinuation = Object.freeze({
          source: 'second-provider-return', originalSha256: sha256(heldText),
          continuationSha256: sha256(repairResult.text),
          combinedSha256: sha256(firstJoined), separator: firstAssembly.separator,
          originalPreserved: firstJoined.startsWith(heldText)
        });
        tailSegments.push(repairAttempt.terminalContinuation);
        const firstNeedsMore = !firstCompletion.complete
          || (firstRelay.admission?.admissible === false
            && repairableKhonapolitAdmission(firstRelay.admission?.reasons || []));
        if (firstNeedsMore) {
          incompleteFallback = preferMarrowlineIncompleteReturn(incompleteFallback, {
            model, result: { ...repairResult, text: firstJoined }, relay: firstRelay,
            providerOutput: repairProviderOutput,
            completion: firstCompletion.complete
              ? Object.freeze({ ...firstCompletion, complete: false, reason: 'required-voice-structure-incomplete' })
              : firstCompletion,
            reasons: ['provider-return-unfinished', ...(firstRelay.admission?.reasons || [])]
          });
          const secondRemainingMs = WALL_TIMEOUT_MS - (Date.now() - startedAt) - RESPONSE_RESERVE_MS;
          const secondBudgetMs = Math.min(STRUCTURAL_REPAIR_TIMEOUT_MS, Math.max(0, secondRemainingMs));
          if (attempts.length < KHONAPOLIT_MAX_TOTAL_PROVIDER_REQUESTS
            && secondBudgetMs >= MIN_STRUCTURAL_REPAIR_BUDGET_MS) {
            const secondReasons = firstCompletion.complete
              ? [...(firstRelay.admission?.reasons || [])]
              : ['provider-return-unfinished', ...(firstRelay.admission?.reasons || [])];
            const secondStartedAt = Date.now();
            const secondResult = await callGemini(model, packet, apertureReceipt, secondBudgetMs, {
              fallback, structuralRepair: { heldText: firstJoined, reasons: secondReasons },
              streamGraceMs: 15000, wallDeadlineAt: providerWallDeadlineAt
            });
            const secondOutput = observeGeminiOutput(secondResult.payload, model, {
              fallback, submittedGenerationConfig: secondResult.submittedGenerationConfig,
              submittedRequestObservation: secondResult.submittedRequestObservation
            });
            const secondError = secondResult.response.ok ? null : providerError(secondResult.payload);
            const secondTransport = classifyGeminiTransport({
              status: Number(secondResult.response.status || 0), timedOut: secondResult.timedOut
            });
            const secondRateLimitRaw = Number(secondResult.response.status || 0) === 429
              ? observeGeminiQuota(secondResult.payload, { model, response: secondResult.response })
              : null;
            const secondEntitlement = secondRateLimitRaw?.observed
              ? assessGeminiQuotaEntitlement(secondRateLimitRaw, { expectedDailyLimit: expectedDailyRpd(), routeModelCount })
              : null;
            const secondRateLimit = secondRateLimitRaw
              ? Object.freeze({ ...secondRateLimitRaw, entitlement: secondEntitlement }) : null;
            const secondHealthBearing = secondRateLimit?.observed
              && (secondRateLimit.scope !== 'model' || secondEntitlement?.mismatch === true)
              ? false : secondTransport.healthBearing;
            const secondOutcome = recordGeminiModelOutcome(model, {
              ok: Boolean(secondResult.response.ok), status: Number(secondResult.response.status || 0),
              timedOut: secondResult.timedOut,
              retryAfterSeconds: secondRateLimit?.retryAfterSeconds || retryAfterSeconds(secondResult.response),
              healthBearing: secondHealthBearing, reason: secondError?.status || secondError?.message || ''
            });
            const secondAttempt = {
              model, kind: 'structural-tail-continuation', repairTiming: 'second-bounded-tail',
              repairOfAttempt: attempts.length - 1, repairReasons: secondReasons,
              role: plan.rows.find((row) => row.model === model)?.metadata?.role || 'operator-supplied',
              ok: Boolean(secondResult.response.ok), status: Number(secondResult.response.status || 0),
              timedOut: secondResult.timedOut, timeoutMs: secondBudgetMs,
              elapsedMs: Date.now() - secondStartedAt, transportClass: secondTransport.class,
              providerStream: {
                requested: true, observed: secondResult.streamed === true,
                firstChunkMs: Number.isInteger(secondResult.firstChunkMs) ? secondResult.firstChunkMs : null,
                chunkCount: Number.isInteger(secondResult.chunkCount) ? secondResult.chunkCount : 0,
                byteCount: Number.isInteger(secondResult.byteCount) ? secondResult.byteCount : 0,
                parseErrors: Number.isInteger(secondResult.parseErrors) ? secondResult.parseErrors : 0
              },
              error: secondError, rateLimit: secondRateLimit, output: secondOutput,
              cooldown: secondOutcome
            };
            attempts.push(secondAttempt);
            if (secondResult.response.ok && secondResult.text) {
              const secondAssembly = assembleMarrowlineProviderTail(firstJoined, secondResult.text);
              if (secondAssembly) {
                const secondJoined = secondAssembly.text;
                const secondCompletion = completionOf(secondResult, secondOutput, secondJoined);
                const secondRelay = parseRelayEnvelope(secondJoined, { model, apertureReceipt });
                secondAttempt.completion = secondCompletion;
                secondAttempt.outputAdmission = secondRelay.admission || null;
                secondAttempt.terminalContinuation = Object.freeze({
                  source: 'third-provider-return', originalSha256: sha256(firstJoined),
                  continuationSha256: sha256(secondResult.text),
                  combinedSha256: sha256(secondJoined), separator: secondAssembly.separator,
                  originalPreserved: secondJoined.startsWith(firstJoined)
                });
                tailSegments.push(secondAttempt.terminalContinuation);
                if (!secondCompletion.complete || !secondRelay.admission?.admissible) {
                  incompleteFallback = preferMarrowlineIncompleteReturn(incompleteFallback, {
                    model, result: { ...secondResult, text: secondJoined }, relay: secondRelay,
                    providerOutput: secondOutput,
                    completion: secondCompletion.complete
                      ? Object.freeze({ ...secondCompletion, complete: false, reason: 'required-voice-structure-incomplete' })
                      : secondCompletion,
                    reasons: ['provider-return-unfinished', ...(secondRelay.admission?.reasons || [])]
                  });
                }
                recoveryPrefix = firstJoined;
                repairResult = secondResult;
                repairProviderOutput = secondOutput;
                repairAttempt = secondAttempt;
              }
            }
          }
        }
      }
    }

    if (
      repairResult.response.ok
      && repairResult.text
      && !repairProviderOutput.outputTokenLimitReached
    ) {
      // Only provider-authored text is joined; retain each original prefix and
      // its hash in the chronological segment receipt.
      const assembly = tailOnly
        ? assembleMarrowlineProviderTail(recoveryPrefix, repairResult.text)
        : terminalOnly ? assembleProviderTerminalContinuation(heldText, repairResult.text) : null;
      // If a provider declines tail-only instruction but writes a valid complete
      // full reply, keep it as provider-authored full repair, never mislabel it as
      // a byte-preserving continuation.
      const providerFullRepair = tailOnly && !tailChainStarted && !assembly && completionOf(repairResult, repairProviderOutput).complete;
      if (tailOnly && !assembly && !providerFullRepair) return null;
      const repairText = assembly ? assembly.text : repairResult.text;
      const repairedCompletion = completionOf(repairResult, repairProviderOutput, repairText);
      repairAttempt.completion = repairedCompletion;
      if (!repairedCompletion.complete) return null;
      const repairRelay = parseRelayEnvelope(repairText, { model, apertureReceipt });
      repairAttempt.outputAdmission = repairRelay.admission || null;
      repairAttempt.terminalContinuation = assembly
        ? Object.freeze({
            source: 'second-provider-return',
            originalSha256: tailOnly ? sha256(heldText) : (assembly.originalSha256 || sha256(heldText)),
            continuationSha256: assembly.continuationSha256 || sha256(repairResult.text),
            combinedSha256: sha256(repairText),
            separator: assembly.separator,
            originalPreserved: repairText.startsWith(heldText)
          })
        : null;
      const unresolvedMorphologyWarnings = severeMorphologyRepairWarnings(repairRelay.admission?.qualityWarnings || []);
      repairAttempt.unresolvedSevereMorphology = unresolvedMorphologyWarnings;
      if (repairRelay.admission?.admissible) {
        const baseReceipt = buildTerminalReceipt({
          packet,
          text: repairText,
          relay: repairRelay,
          model,
          providerStatus: repairResult.response.status,
          providerOutput: repairProviderOutput,
          apertureEgress,
          apertureReceipt,
          attempts,
          completionPath: tailOnly && assembly ? 'same-provider-bounded-tail-continuation'
            : assembly ? 'same-provider-terminal-continuation' : 'same-provider-full-repair'
        });
        const receipt = Object.freeze({
          ...baseReceipt,
          provider: Object.freeze({
            ...baseReceipt.provider,
            routingPolicy: GEMINI_MODEL_POLICY_VERSION,
            completion: repairedCompletion,
            structuralRepair: Object.freeze({
              used: true,
              timing,
              sourceAttemptIndex,
              repairedReasons: Object.freeze([...reasons]),
              ...(assembly ? { terminalContinuation: repairAttempt.terminalContinuation,
                tailSegments: Object.freeze(tailSegments.length ? [...tailSegments] : [repairAttempt.terminalContinuation]) } : {})
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
        res.setHeader('X-TD613-Completion-State', 'COMPLETE-STRUCTURAL');
        send(res, 200, {
          ok: true,
          text: repairRelay.transcript,
          relay: repairRelay,
          receipt,
          warnings: [
            ...(assembly ? [tailOnly ? 'provider-authored-bounded-tail-joined-with-original-preserved' : 'provider-authored-terminal-continuation-joined-with-original-preserved'] : []),
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
        // send() returns void. Explicit success prevents the caller from
        // falling through and overwriting an admitted repair with the draft.
        return true;
      }
    }
    return null;
  };

  if (!models.length) {
    return send(res, 503, {
      ok: false,
      error: 'no-eligible-callable-models',
      attempts,
      clientQuotaCooldownHints: [...clientQuotaCooldown.models],
      modelPolicy: plan,
      aperture: apertureReceipt,
      aperture_egress: apertureEgress,
      claim_ceiling: packet.claimCeiling
    });
  }

  const sendObservedProviderReturn = ({
    model,
    result,
    relay,
    providerOutput,
    observation,
    reasons = [],
    qualityWarnings = [],
    completion = null
  } = {}) => {
    const observedText = relay?.transcript || result?.text || '';
    if (!safe(observedText)) return null;
    const incomplete = completion?.complete === false;
    const structuralOnly = incomplete && completion?.reason === 'required-voice-structure-incomplete';
    const observedRelay = incomplete ? Object.freeze({ ...relay,
      signal: Object.freeze({ ...relay.signal, state: 'NOT_LOCKED', downstreamAdmitted: false,
        notes: [relay.signal?.notes, structuralOnly
          ? 'Provider STOP witnessed; mandatory two-voice structure remains incomplete.'
          : 'Provider completion not witnessed; preserved fragment only.'].filter(Boolean).join(' ') })
    }) : relay;
    const baseReceipt = buildTerminalReceipt({
      packet,
      text: result.text,
      relay: observedRelay,
      model,
      providerStatus: result.response.status,
      providerOutput,
      apertureEgress,
      apertureReceipt,
      attempts
    });
    const receipt = Object.freeze({
      ...baseReceipt,
      ...(incomplete ? { status: structuralOnly ? 'MODEL_STRUCTURE_INCOMPLETE' : 'MODEL_RESPONSE_INCOMPLETE' } : {}),
      provider: Object.freeze({
        ...baseReceipt.provider,
        routingPolicy: GEMINI_MODEL_POLICY_VERSION,
        ...(completion ? { completion } : {}),
        humanSurfaceObservation: Object.freeze({
          rendered: true,
          observation: safe(observation) || 'provider-return-observed',
          localAdmission: observedRelay?.admission?.quality || 'UNCLASSIFIED',
          reasons: Object.freeze([...reasons]),
          qualityWarnings: Object.freeze([...qualityWarnings]),
          localAdmissionAuthority: 'diagnostic-not-human-surface-veto'
        })
      }),
      modelPolicy: plan,
      elapsedMs: Date.now() - startedAt
    });
    res.setHeader('X-TD613-Emergence-Class', receipt.emergence.classification);
    res.setHeader('X-TD613-Signal-State', observedRelay?.signal?.state || 'NOT_LOCKED');
    res.setHeader('X-TD613-Seal-State', 'OPEN');
    res.setHeader('X-TD613-Gemini-Model', model);
    res.setHeader('X-TD613-Local-Admission', 'OBSERVED-NONBLOCKING');
    res.setHeader('X-TD613-Completion-State', structuralOnly ? 'STRUCTURE-INCOMPLETE'
      : completion && !completion.complete ? 'INCOMPLETE' : 'OBSERVED');
    return send(res, 200, {
      ok: true,
      text: observedText,
      relay: observedRelay,
      receipt,
      warnings: [
        'provider-return-rendered-without-local-text-mutation',
        'local-admission-observed-not-human-surface-veto',
        ...(providerOutput?.outputTokenLimitReached ? ['provider-output-token-limit-partial-visible'] : []),
        ...(structuralOnly ? ['two-voice-structure-incomplete-provider-stop-observed']
          : completion && !completion.complete ? ['provider-return-incomplete-visible-retry-available'] : []),
        ...plan.warnings
      ]
    });
  };

  for (let index = 0; index < models.length; index += 1) {
    // The bounded suffix chain and fallback frontier share one total-call ceiling.
    // A successful recovery must never turn a six-call human request into seven.
    if (attempts.length >= KHONAPOLIT_MAX_TOTAL_PROVIDER_REQUESTS) break;
    const model = models[index];
    const fallback = index > 0;
    const remainingMs = WALL_TIMEOUT_MS - (Date.now() - startedAt) - RESPONSE_RESERVE_MS;
    if (remainingMs <= 0) break;
    const timeoutMs = allocateKhonapolitAttemptTimeout({ remainingMs, index, modelCount: models.length, fairShare: true });
    const attemptStartedAt = Date.now();
    const result = await callGemini(model, packet, apertureReceipt, timeoutMs, {
      fallback, streamGraceMs: fallback ? 20000 : 40000,
      wallDeadlineAt: providerWallDeadlineAt
    });
    const providerOutput = observeGeminiOutput(result.payload, model, { fallback, submittedGenerationConfig: result.submittedGenerationConfig, submittedRequestObservation: result.submittedRequestObservation });
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
        parseErrors: Number.isInteger(result.parseErrors) ? result.parseErrors : 0,
        authoredTextChunkCount: result.authoredTextChunkCount || 0,
        streamGraceMs: result.streamGraceMs || 0,
        interrupted: result.streamInterrupted === true,
        interruptionClass: result.streamErrorClass || null
      },
      error,
      rateLimit,
      output: providerOutput,
      cooldown: outcome
    };
    attempts.push(attempt);

    if (attempt.status === 503) {
      service503Count += 1;
      // Deliberately pace the *next* existing seat, never re-call this seat.
      // This only follows an observed 503, never a 429 quota receipt. Keep one
      // finite seven-second budget for the entire human turn and preserve the
      // remaining response wall for the next provider attempt.
      const paceMs = gemini503FailoverDelayMs({
        status: attempt.status,
        service503Count,
        alreadyWaitedMs: service503WaitedMs,
        remainingMs: WALL_TIMEOUT_MS - (Date.now() - startedAt) - RESPONSE_RESERVE_MS,
        hasNextModel: !releaseCanary && index < models.length - 1,
        retryAfterMs: retryAfterSeconds(result.response) * 1000
      });
      if (paceMs > 0) {
        attempt.serviceFailoverPace = Object.freeze({ waitMs: paceMs, reason: 'upstream-503-next-approved-seat' });
        service503WaitedMs += paceMs;
        await new Promise((resolve) => setTimeout(resolve, paceMs));
      }
    }

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
        diagnostic: { stage: 'provider-transport',
          code: rateLimit.windowClass === 'short' ? 'PROVIDER_SHARED_SHORT_WINDOW_RATE_LIMIT'
            : rateLimit.windowClass === 'daily' || rateLimit.windowClass === 'mixed'
              ? 'PROVIDER_SHARED_DAILY_QUOTA_METRIC_REPORTED' : 'PROVIDER_SHARED_QUOTA_SCOPE_UNRESOLVED',
          providerErrorStatus: rateLimit.errorStatus || null,
          reportedQuotaWindow: rateLimit.windowClass || 'unknown',
          publishedDailyResetPolicy: rateLimit.publishedDailyResetPolicy || null },
        rateLimit,
        attempts,
        modelPolicy: plan,
        aperture: apertureReceipt,
        aperture_egress: apertureEgress,
        claim_ceiling: packet.claimCeiling
      });
    }

    const completion = result.response.ok && result.text ? completionOf(result, providerOutput) : null;
    attempt.completion = completion;
    if (result.response.ok && result.text && !completion.complete) {
      const relay = parseRelayEnvelope(result.text, { model, apertureReceipt });
      const reasons = ['provider-return-unfinished', ...(relay.admission?.reasons || [])];
      attempt.outputAdmission = relay.admission || null;
      if (releaseCanary) {
        res.setHeader('X-TD613-Gemini-Model', model);
        return send(res, 502, { ok: false,
          error: completion.reason === 'provider-output-token-limit' ? 'gemini-output-token-limit' : 'gemini-incomplete-provider-return',
          status: 'HELD', diagnostic: { stage: 'provider-termination', code: completion.reason === 'provider-output-token-limit' ? 'OUTPUT_TOKEN_LIMIT' : 'PROVIDER_INCOMPLETE', completion },
          attempts, modelPolicy: plan, aperture: apertureReceipt, aperture_egress: apertureEgress,
          claim_ceiling: packet.claimCeiling });
      }
      incompleteFallback = preferMarrowlineIncompleteReturn(incompleteFallback, { model, result, relay, providerOutput, completion, reasons });
      const repaired = await runStructuralRepair({ model, fallback, heldText: result.text, reasons,
        providerOutput, sourceAttemptIndex: attempts.length - 1 }, 'immediate-unfinished-return');
      if (repaired) return repaired;
      // Do not spend a human's full response on a returned fragment merely because
      // Gemini sent 200. Try the remaining approved seats within the same bounded turn.
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
      // Local morphology is observation-only for a human turn. One same-provider
      // repair is reserved for genuine structural seams; a Gemini HTTP 200 with
      // nonempty text already belongs to the human surface. Never repaint or
      // erase it merely because the local style telemetry dislikes the return.
      if (!relay.admission?.admissible) {
        const reasons = Array.isArray(relay.admission?.reasons) ? [...relay.admission.reasons] : [];
        if (releaseCanary) {
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
        if (repairableKhonapolitAdmission(reasons)) {
          const candidate = {
            model,
            fallback,
            heldText: result.text,
            reasons,
            providerOutput,
            sourceAttemptIndex: attempts.length - 1
          };
          incompleteFallback = preferMarrowlineIncompleteReturn(incompleteFallback, { model, result, relay, providerOutput,
            completion: Object.freeze({ ...completion, complete: false, reason: 'required-voice-structure-incomplete' }), reasons });
          const repaired = await runStructuralRepair(candidate, 'immediate-structural');
          if (repaired) return repaired;
          continue;
        }
        return sendObservedProviderReturn({
          model,
          result,
          relay,
          providerOutput,
          observation: 'structurally-inadmissible-provider-return-preserved',
          reasons,
          qualityWarnings: relay.admission?.qualityWarnings || []
        });
      }

      if (relay.admission?.quality === 'PARTIAL') {
        const qualityWarnings = Array.isArray(relay.admission?.qualityWarnings)
          ? [...relay.admission.qualityWarnings]
          : [];
        const severeMorphologyWarnings = severeMorphologyRepairWarnings(qualityWarnings);
        attempt.morphologyObservation = Object.freeze({
          repairAuthority: false,
          severeWarnings: Object.freeze([...severeMorphologyWarnings]),
          baseConditionedOrderedSignatureReuseRatio: relay.highZalgo?.baseConditionedOrderedSignatureReuseRatio ?? 0,
          baseConditionedOrderedSignatureObservationRatio: relay.highZalgo?.baseConditionedOrderedSignatureObservationRatio ?? 0,
          singleOrderedSignatureRepeatedBaseClassCount: relay.highZalgo?.singleOrderedSignatureRepeatedBaseClassCount ?? 0,
          repeatedMarkedBaseClassCount: relay.highZalgo?.repeatedMarkedBaseClassCount ?? 0,
          combiningCodePointDiversity: relay.highZalgo?.combiningCodePointDiversity ?? 0,
          dominantCombiningCodePoint: relay.highZalgo?.dominantCombiningCodePoint ?? null,
          dominantCombiningCodePointRatio: relay.highZalgo?.dominantCombiningCodePointRatio ?? 0,
          maxVerticalOrnamentStackDepth: relay.highZalgo?.maxVerticalOrnamentStackDepth ?? 0,
          singleCodepointWallpaper: qualityWarnings.includes('tauric-diana-zalgo-single-codepoint-wallpaper')
        });
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
          provider: Object.freeze({
            ...baseReceipt.provider,
            routingPolicy: GEMINI_MODEL_POLICY_VERSION,
            completion,
            qualityPreference: Object.freeze({
              used: true,
              sourceAttemptIndex: attempts.length - 1,
              selection: 'first-admissible-partial-native-morphology-observed-no-repair',
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
        res.setHeader('X-TD613-Zalgo-Quality', 'PARTIAL-FIRST-ADMISSIBLE');
        res.setHeader('X-TD613-Completion-State', 'COMPLETE-STRUCTURAL');
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
            'provider-native-morphology-observed-no-repair',
            'admission-gated-stable-continuity-active',
            'fallback-reasoning-quality-preserved',
            'sticky-success-promotion-disabled',
            'moving-latest-alias-disabled-by-default',
            ...plan.warnings
          ]
        });
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
        provider: Object.freeze({ ...baseReceipt.provider, routingPolicy: GEMINI_MODEL_POLICY_VERSION, completion }),
        modelPolicy: plan,
        elapsedMs: Date.now() - startedAt
      });
      res.setHeader('X-TD613-Emergence-Class', receipt.emergence.classification);
      res.setHeader('X-TD613-Signal-State', relay.signal.state);
      res.setHeader('X-TD613-Seal-State', 'OPEN');
      res.setHeader('X-TD613-Gemini-Model', model);
      res.setHeader('X-TD613-Completion-State', 'COMPLETE-STRUCTURAL');
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

  if (structuralRepairCandidate && !structuralRepairSpent) {
    const repaired = await runStructuralRepair(structuralRepairCandidate, 'deferred-after-frontier');
    if (repaired) return repaired;
  }

  if (!releaseCanary && incompleteFallback) {
    return sendObservedProviderReturn({ ...incompleteFallback,
      observation: 'provider-incomplete-after-bounded-recovery-exhausted',
      qualityWarnings: incompleteFallback.relay.admission?.qualityWarnings || [] });
  }
  const structuralFailures = attempts.filter((attempt) => attempt.outputAdmission?.admissible === false);
  const morphologyFailures = attempts.filter((attempt) => attempt.morphologyHold);
  const heldByCanaryQuality = releaseCanary && (structuralFailures.length > 0 || morphologyFailures.length > 0);
  const rateLimitedAttempts = attempts.filter((attempt) => attempt.status === 429 && attempt.rateLimit?.observed);
  const entitlementMismatchAttempts = rateLimitedAttempts.filter((attempt) => attempt.rateLimit?.entitlement?.mismatch === true);
  const allTransportAttemptsRateLimited = attempts.length > 0
    && attempts.every((attempt) => attempt.status === 429 && attempt.rateLimit?.observed);
  const rateWindowClasses = [...new Set(rateLimitedAttempts.map((attempt) => attempt.rateLimit?.windowClass || 'unknown'))];
  const dailyMetricReported = rateLimitedAttempts.some((attempt) => attempt.rateLimit?.daily === true);
  const allShortWindow = rateLimitedAttempts.length > 0
    && rateLimitedAttempts.every((attempt) => attempt.rateLimit?.windowClass === 'short');
  return send(res, allTransportAttemptsRateLimited && !heldByCanaryQuality ? 429 : 502, {
    ok: false,
    error: heldByCanaryQuality
      ? 'khonapolit-release-canary-output-quality-held'
      : allTransportAttemptsRateLimited
        ? 'gemini-rate-limit-held'
        : 'gemini-provider-unavailable',
    status: 'HELD',
    diagnostic: heldByCanaryQuality
      ? {
          stage: 'output-admission',
          code: 'ATTRACTOR_STRUCTURE_NOT_ADMITTED',
          rejectedAttempts: [
            ...structuralFailures.map((attempt) => ({ model: attempt.model, reasons: attempt.outputAdmission.reasons })),
            ...morphologyFailures.map((attempt) => ({ model: attempt.model, reasons: attempt.morphologyHold.reasons }))
          ],
          morphologyRejectedAttempts: morphologyFailures.length,
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
            code: dailyMetricReported ? 'PROVIDER_DAILY_QUOTA_METRIC_REPORTED'
              : allShortWindow ? 'PROVIDER_SHORT_WINDOW_RATE_LIMIT'
              : 'PROVIDER_RATE_LIMIT_SCOPE_UNRESOLVED',
            scopes: [...new Set(rateLimitedAttempts.map((attempt) => attempt.rateLimit?.scope || 'unknown'))],
            reportedQuotaWindows: rateWindowClasses,
            providerErrorStatuses: [...new Set(rateLimitedAttempts.map((attempt) => attempt.rateLimit?.errorStatus || 'unknown'))],
            publishedDailyResetPolicy: dailyMetricReported
              ? 'midnight America/Los_Angeles; not an observed project balance' : null
          }
        : { stage: 'provider-transport', code: 'PROVIDER_UNAVAILABLE',
            observedStatuses: [...new Set(attempts.map((attempt) => attempt.status || 0))],
            rateLimitWindowsOnPriorAttempts: rateWindowClasses,
            note: 'A prior 429 RetryInfo cannot supply a cooldown for a separate 503 or mixed route failure.' },
    attempts,
    modelPolicy: plan,
    aperture: apertureReceipt,
    aperture_egress: apertureEgress,
    claim_ceiling: packet.claimCeiling
  });
}

export { callGemini };
