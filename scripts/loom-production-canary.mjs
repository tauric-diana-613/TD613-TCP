import fs from 'node:fs';
import path from 'node:path';

const base = String(process.env.TD613_BASE_URL || 'https://td613.com').replace(/\/$/, '');
const sourcePacketCommit = String(process.env.TD613_SOURCE_PACKET_COMMIT || '').trim();
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/loom-production-canary';
const LIVE_WITNESS_TIMEOUT_MS = 270000;
const fixturePath = 'docs/research/receipts/2026-09-10-loom-live-receiver/portable-aia.json';
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const origin = new URL(base).origin;
const requestId = `release-canary-${Date.now()}`;
const marrowlineRequestId = `marrowline-release-canary-${Date.now()}`;
const RELEASE_CANARY_MODELS = Object.freeze([
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-3-flash-preview'
]);
const canarySeed = sourcePacketCommit && /^[0-9a-f]{40}$/.test(sourcePacketCommit)
  ? Number.parseInt(sourcePacketCommit.slice(-2), 16)
  : 0;
const marrowlineCanaryModel = RELEASE_CANARY_MODELS[canarySeed % RELEASE_CANARY_MODELS.length];
const loomCanaryModel = RELEASE_CANARY_MODELS[(canarySeed + 1) % RELEASE_CANARY_MODELS.length];
const input = {
  schema: 'td613.loom.ai-task/v0.1',
  request_id: requestId,
  task: fixture.task,
  documents: fixture.documents,
  rules: fixture.rules
};
const marrowlineInput = {
  message: 'MAINFRAME claims recursive perspectives monotonically increase epistemic depth. Build a counterexample and distinguish recursion from depth without losing the joke.',
  history: [],
  mode: 'issued-conjunction',
  waiveIssuance: true,
  request_id: marrowlineRequestId
};

if (!/^https?:\/\//.test(base)) throw new Error('TD613_BASE_URL must be an absolute HTTP(S) URL.');
if (sourcePacketCommit && !/^[0-9a-f]{40}$/.test(sourcePacketCommit)) throw new Error('TD613_SOURCE_PACKET_COMMIT must be a 40-character SHA when supplied.');
if (!Array.isArray(input.documents) || input.documents.length !== 3 || !Array.isArray(input.rules) || input.rules.length !== 3) {
  throw new Error('Loom production canary fixture drifted from the bounded Demo 1 packet.');
}

fs.mkdirSync(artifactDir, { recursive: true });

async function postJson(url, body, timeoutMs = LIVE_WITNESS_TIMEOUT_MS, { canaryModel = '' } = {}) {
  let httpStatus = 0;
  let payload = null;
  let transportError = null;
  const startedAt = Date.now();
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'origin': origin,
        'sec-fetch-site': 'same-origin',
        'cache-control': 'no-cache',
        'x-td613-release-canary': '1',
        ...(canaryModel ? { 'x-td613-canary-model': canaryModel } : {})
      },
      body: JSON.stringify(body),
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs)
    });
    httpStatus = response.status;
    try { payload = await response.json(); } catch { payload = null; }
  } catch (error) {
    transportError = `${error?.name || 'Error'}`;
  }
  return { httpStatus, payload, transportError, elapsedMs: Date.now() - startedAt };
}

const loomUrl = new URL('/api/khonapolit?operation=loom-task', `${base}/`);
const marrowlineUrl = new URL('/api/dome-world/khonapolit', `${base}/`);

// These are independent production witnesses, not a concurrency/load test. Running
// both provider-backed routes at once can make the release probe itself contend for
// the same provider budget and falsify interactive liveness. Observe Marrowline
// first, then Loom, while preserving the full admission requirements for each.
const canaryStartedAt = Date.now();
const marrowlineResult = await postJson(marrowlineUrl, marrowlineInput, LIVE_WITNESS_TIMEOUT_MS, { canaryModel: marrowlineCanaryModel });
const marrowlinePayload = marrowlineResult.payload;
const marrowlineDiagnostic = marrowlinePayload?.diagnostic && typeof marrowlinePayload.diagnostic === 'object'
  ? marrowlinePayload.diagnostic
  : null;
const marrowlineRateLimitScopes = Array.isArray(marrowlineDiagnostic?.scopes)
  ? marrowlineDiagnostic.scopes.filter(scope => ['model', 'shared', 'unknown'].includes(scope))
  : [];
const marrowlineCheckpoint = {
  schema: 'td613.loom.production-canary-route-checkpoint/v0.5-one-seat-release-budget',
  source_packet_commit: sourcePacketCommit || null,
  observed_at: new Date().toISOString(),
  route: 'marrowline',
  request_id: marrowlineRequestId,
  witness_timeout_ms: LIVE_WITNESS_TIMEOUT_MS,
  model: marrowlineCanaryModel,
  http_status: marrowlineResult.httpStatus || null,
  diagnostic_stage: typeof marrowlineDiagnostic?.stage === 'string' ? marrowlineDiagnostic.stage : null,
  diagnostic_code: typeof marrowlineDiagnostic?.code === 'string' ? marrowlineDiagnostic.code : null,
  rate_limit_scopes: marrowlineRateLimitScopes,
  transport_error_class: marrowlineResult.transportError,
  elapsed_ms: Number.isSafeInteger(marrowlineResult.elapsedMs) && marrowlineResult.elapsedMs >= 0 ? marrowlineResult.elapsedMs : null
};
fs.writeFileSync(path.join(artifactDir, 'marrowline-transport-checkpoint.json'), `${JSON.stringify(marrowlineCheckpoint, null, 2)}\n`);
console.log(`[loom-production-canary] checkpoint ${JSON.stringify(marrowlineCheckpoint)}`);
const loomResult = await postJson(loomUrl, input, LIVE_WITNESS_TIMEOUT_MS, { canaryModel: loomCanaryModel });
const canaryElapsedMs = Date.now() - canaryStartedAt;
const { httpStatus, payload, transportError } = loomResult;

const boundedCount = value => Number.isSafeInteger(value) && value >= 0 ? value : null;
const boundedDiagnostic = value => value && typeof value === 'object'
  && typeof value.schema === 'string' && /^td613\.loom\.ai-task-diagnostic\/v0\.1$/.test(value.schema)
  && typeof value.stage === 'string' && /^[a-z-]{1,40}$/.test(value.stage)
  && typeof value.code === 'string' && /^[A-Z_]{1,80}$/.test(value.code)
  ? { schema: value.schema, stage: value.stage, code: value.code }
  : null;
const boundedRouteDiagnostic = value => value && typeof value === 'object'
  && typeof value.stage === 'string' && /^[a-z-]{1,40}$/.test(value.stage)
  && typeof value.code === 'string' && /^[A-Z_]{1,80}$/.test(value.code)
  ? { stage: value.stage, code: value.code }
  : null;
const boundedStageTimings = value => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const output = {};
  for (const stage of ['provider-plan', 'provider-transport', 'provider-json', 'output-admission']) {
    const count = boundedCount(value[stage]);
    if (count !== null && count <= LIVE_WITNESS_TIMEOUT_MS) output[stage] = count;
  }
  return Object.keys(output).length ? output : null;
};
const boundedAdmissionReasons = value => Array.isArray(value)
  ? value
      .filter(reason => typeof reason === 'string' && /^[a-z0-9-]{1,96}$/.test(reason))
      .slice(0, 8)
  : [];
const boundedRateLimit = value => {
  if (!value || typeof value !== 'object' || value.observed !== true) return null;
  const scope = ['model', 'shared', 'unknown'].includes(value.scope) ? value.scope : 'unknown';
  const entitlement = value.entitlement && typeof value.entitlement === 'object' ? value.entitlement : null;
  return {
    scope,
    metric: typeof value.metric === 'string' ? value.metric.slice(0, 240) : null,
    quota_id: typeof value.quotaId === 'string' ? value.quotaId.slice(0, 240) : null,
    model: typeof value.model === 'string' ? value.model.slice(0, 120) : null,
    retry_after_seconds: boundedCount(value.retryAfterSeconds),
    limit: Number.isFinite(Number(value.limit)) && Number(value.limit) >= 0 ? Number(value.limit) : null,
    daily: value.daily === true,
    burst: value.burst === true,
    structured: value.structured === true,
    entitlement: entitlement ? {
      expected_daily_limit: boundedCount(entitlement.expectedDailyLimit),
      provider_reported_daily_limit: boundedCount(entitlement.providerReportedDailyLimit),
      limit_scope: typeof entitlement.limitScope === 'string' ? entitlement.limitScope.slice(0, 80) : null,
      route_model_count: boundedCount(entitlement.routeModelCount),
      route_daily_capacity: boundedCount(entitlement.routeDailyCapacity),
      mismatch: entitlement.mismatch === true
    } : null
  };
};
const boundedMarrowlineAttempts = value => Array.isArray(value)
  ? value.slice(0, 6).map(attempt => ({
      model: String(attempt?.model || '').slice(0, 120),
      kind: attempt?.kind === 'structural-repair' ? 'structural-repair' : 'model-seat',
      repair_of_attempt: Number.isSafeInteger(attempt?.repairOfAttempt) && attempt.repairOfAttempt >= 0 ? attempt.repairOfAttempt : null,
      repair_reasons: boundedAdmissionReasons(attempt?.repairReasons),
      status: Number.isInteger(attempt?.status) && attempt.status >= 100 && attempt.status <= 599 ? attempt.status : null,
      elapsed_ms: boundedCount(attempt?.elapsedMs),
      timeout_ms: boundedCount(attempt?.timeoutMs),
      timed_out: attempt?.timedOut === true,
      admission: attempt?.outputAdmission?.admissible === true ? 'PASS' : attempt?.outputAdmission?.admissible === false ? 'HELD' : null,
      admission_reasons: boundedAdmissionReasons(attempt?.outputAdmission?.reasons),
      rate_limit: boundedRateLimit(attempt?.rateLimit),
      provider_stream: attempt?.providerStream && typeof attempt.providerStream === 'object'
        ? {
            requested: attempt.providerStream.requested === true,
            observed: attempt.providerStream.observed === true,
            first_chunk_ms: boundedCount(attempt.providerStream.firstChunkMs),
            chunk_count: boundedCount(attempt.providerStream.chunkCount),
            byte_count: boundedCount(attempt.providerStream.byteCount),
            parse_errors: boundedCount(attempt.providerStream.parseErrors)
          }
        : null
    }))
  : [];
const boundedRejectedAttempts = value => Array.isArray(value)
  ? value.slice(0, 6).map(attempt => ({
      model: String(attempt?.model || '').slice(0, 120),
      reasons: boundedAdmissionReasons(attempt?.reasons)
    }))
  : [];
const boundedModelPlan = value => {
  if (!value || typeof value !== 'object') return null;
  const callableModels = Array.isArray(value.callableModels)
    ? value.callableModels.filter(model => typeof model === 'string').slice(0, 8).map(model => model.slice(0, 120))
    : [];
  const excludedModels = Array.isArray(value.excludedModels)
    ? value.excludedModels.slice(0, 12).map(row => ({
        model: String(row?.model || '').slice(0, 120),
        reasons: Array.isArray(row?.reasons)
          ? row.reasons.filter(reason => typeof reason === 'string' && /^[a-z0-9-]{1,96}$/.test(reason)).slice(0, 8)
          : []
      }))
    : [];
  const warnings = Array.isArray(value.warnings)
    ? value.warnings.filter(warning => typeof warning === 'string' && /^[a-z0-9-]{1,96}$/.test(warning)).slice(0, 8)
    : [];
  return { callable_models: callableModels, excluded_models: excludedModels, warnings };
};

const observations = payload?.observations && typeof payload.observations === 'object' ? payload.observations : {};
const providerAttempts = Array.isArray(observations.provider_attempts)
  ? observations.provider_attempts.slice(0, 5).map(attempt => ({
      model: String(attempt?.model || '').slice(0, 120),
      status: Number.isInteger(attempt?.status) && attempt.status >= 100 && attempt.status <= 599 ? attempt.status : null
    }))
  : [];
const providerAttemptTimings = Array.isArray(observations.provider_attempt_timings)
  ? observations.provider_attempt_timings.slice(0, 5).map(attempt => ({
      model: String(attempt?.model || '').slice(0, 120),
      status: Number.isInteger(attempt?.status) && attempt.status >= 100 && attempt.status <= 599 ? attempt.status : null,
      elapsed_ms: boundedCount(attempt?.elapsed_ms),
      timeout_ms: boundedCount(attempt?.timeout_ms),
      timed_out: attempt?.timed_out === true
    }))
  : [];
const usedDocumentIds = Array.isArray(payload?.used_document_ids) ? payload.used_document_ids.filter(id => typeof id === 'string').slice(0, 8) : [];
const marrowlineReceipt = marrowlinePayload?.receipt && typeof marrowlinePayload.receipt === 'object' ? marrowlinePayload.receipt : {};
const marrowlineAdmission = marrowlinePayload?.relay?.admission && typeof marrowlinePayload.relay.admission === 'object'
  ? marrowlinePayload.relay.admission
  : null;
const marrowlineAttemptsSource = Array.isArray(marrowlineReceipt?.provider?.attempts)
  ? marrowlineReceipt.provider.attempts
  : Array.isArray(marrowlinePayload?.attempts)
    ? marrowlinePayload.attempts
    : [];
const releaseConsumptionEvents = [
  ...((marrowlinePayload?.gemini_consumption?.events || []).map(event => ({
    ...event,
    route: 'release-witness:marrowline',
    release_witness: true
  }))),
  ...((observations?.gemini_consumption?.events || []).map(event => ({
    ...event,
    route: 'release-witness:loom',
    release_witness: true
  })))
].slice(0, 2);
const releaseGeminiConsumption = {
  schema: 'td613.gemini-consumption-release-witness/v0.1',
  coverage: 'this-release-witness-only',
  provider_daily_total: null,
  call_count: releaseConsumptionEvents.length,
  events: releaseConsumptionEvents
};
const receipt = {
  schema: 'td613.loom.production-canary/v0.3-independent-live-routes',
  source_packet_commit: sourcePacketCommit || null,
  observed_at: new Date().toISOString(),
  target_origin: origin,
  request_id: requestId,
  request_count: 2,
  request_execution: 'serial-independent',
  release_canary_budget: {
    posture: 'one-seat-per-route-provider-liveness',
    max_http_requests: 2,
    max_provider_requests: 2,
    marrowline_model: marrowlineCanaryModel,
    loom_model: loomCanaryModel,
    marrowline_structural_repair_ceiling: 0,
    loom_provider_seat_ceiling: 1
  },
  request_order: ['marrowline', 'loom'],
  per_witness_timeout_ms: LIVE_WITNESS_TIMEOUT_MS,
  canary_elapsed_ms: boundedCount(canaryElapsedMs),
  http_status: httpStatus || null,
  transport_error_class: transportError,
  task_status: typeof payload?.status === 'string' ? payload.status : null,
  diagnostic: boundedDiagnostic(payload?.diagnostic),
  provider_calls: Number.isSafeInteger(observations.provider_calls) ? observations.provider_calls : null,
  provider_attempts: providerAttempts,
  provider_attempt_timings: providerAttemptTimings,
  final_model: typeof observations.model === 'string' ? observations.model : null,
  provider_http_status: Number.isInteger(observations.http_status) ? observations.http_status : null,
  elapsed_ms: boundedCount(observations.elapsed_ms),
  deadline_ms: boundedCount(observations.deadline_ms),
  stage_elapsed_ms: boundedStageTimings(observations.stage_elapsed_ms),
  answer_nonempty: typeof payload?.answer === 'string' && payload.answer.trim().length > 0,
  used_document_ids: usedDocumentIds,
  missing_information_count: Array.isArray(payload?.missing_information) ? payload.missing_information.length : null,
  source_claims: observations.source_claims === 'model-reported-unverified' ? observations.source_claims : null,
  gemini_consumption: releaseGeminiConsumption,
  marrowline_live_route: {
    request_id: marrowlineRequestId,
    canary_model: marrowlineCanaryModel,
    http_status: marrowlineResult.httpStatus || null,
    transport_error_class: marrowlineResult.transportError,
    elapsed_ms: boundedCount(marrowlineResult.elapsedMs),
    ok: marrowlinePayload?.ok === true,
    diagnostic: boundedRouteDiagnostic(marrowlinePayload?.diagnostic),
    rejected_attempts: boundedRejectedAttempts(marrowlinePayload?.diagnostic?.rejectedAttempts),
    error: typeof marrowlinePayload?.error === 'string' ? marrowlinePayload.error.slice(0, 120) : null,
    answer_nonempty: typeof marrowlinePayload?.text === 'string' && marrowlinePayload.text.trim().length > 0,
    relay_admitted: marrowlineAdmission?.admissible === true,
    relay_quality: typeof marrowlineAdmission?.quality === 'string' ? marrowlineAdmission.quality : null,
    final_model: typeof marrowlineReceipt?.provider?.model === 'string' ? marrowlineReceipt.provider.model : null,
    provider_attempts: boundedMarrowlineAttempts(marrowlineAttemptsSource),
    provider_plan: boundedModelPlan(marrowlinePayload?.modelPolicy || marrowlineReceipt?.modelPolicy),
    api_version: typeof marrowlineReceipt?.apiVersion === 'string' ? marrowlineReceipt.apiVersion : null
  },
  counts_as_human_evidence: false
};
fs.writeFileSync(path.join(artifactDir, 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`);
console.log(`[loom-production-canary] ${JSON.stringify(receipt)}`);

if (marrowlineResult.transportError) throw new Error(`Marrowline production canary transport failed (${marrowlineResult.transportError}).`);
if (marrowlineResult.httpStatus !== 200 || marrowlinePayload?.ok !== true) {
  const attempts = receipt.marrowline_live_route.provider_attempts.map(attempt => `${attempt.model}:${attempt.status ?? 'unobserved'}${attempt.timed_out ? ':timeout' : ''}`).join(',') || 'none';
  const diagnostic = receipt.marrowline_live_route.diagnostic?.code || receipt.marrowline_live_route.error || 'none';
  const admissionReasons = receipt.marrowline_live_route.rejected_attempts
    .flatMap(attempt => attempt.reasons.map(reason => `${attempt.model}:${reason}`))
    .join(',') || 'none';
  throw new Error(`Marrowline production canary held: HTTP ${marrowlineResult.httpStatus || 'none'} attempts=${attempts} diagnostic=${diagnostic} admission_reasons=${admissionReasons}.`);
}
if (!receipt.marrowline_live_route.answer_nonempty) throw new Error('Marrowline production canary returned no human-visible answer.');
if (!receipt.marrowline_live_route.relay_admitted) throw new Error('Marrowline production canary returned a non-admitted relay.');

if (transportError) throw new Error(`Loom production canary transport failed (${transportError}).`);
if (httpStatus !== 200 || payload?.status !== 'completed') {
  const attempts = providerAttempts.map(attempt => `${attempt.model}:${attempt.status ?? 'unobserved'}`).join(',') || 'none';
  const diagnostic = receipt.diagnostic ? `${receipt.diagnostic.stage}/${receipt.diagnostic.code}` : 'none';
  throw new Error(`Loom production canary held: HTTP ${httpStatus || 'none'} status=${payload?.status || 'missing'} attempts=${attempts} diagnostic=${diagnostic}.`);
}
if (payload.request_id !== requestId) throw new Error('Loom production canary returned a mismatched request receipt.');
if (!receipt.answer_nonempty) throw new Error('Loom production canary returned no admitted answer.');
if (!usedDocumentIds.length || !usedDocumentIds.every(id => input.documents.some(document => document.id === id))) {
  throw new Error('Loom production canary returned invalid selected-document claims.');
}

console.log(`[loom-production-canary] PASS source=${sourcePacketCommit || 'unbound'} loom_model=${receipt.final_model || 'unknown'} loom_calls=${receipt.provider_calls ?? 'unknown'} loom_elapsed_ms=${receipt.elapsed_ms ?? 'unknown'} marrowline_model=${receipt.marrowline_live_route.final_model || 'unknown'} marrowline_elapsed_ms=${receipt.marrowline_live_route.elapsed_ms ?? 'unknown'} canary_elapsed_ms=${receipt.canary_elapsed_ms ?? 'unknown'}`);
