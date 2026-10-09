import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { timingSafeEqual } from 'node:crypto';
import { ASSAY_RESPONSE_SCHEMA, ASSAY_RECOVERY_POLICY_SCHEMA, ASSAY_RECOVERY_RUN_IDS, sha256, canonicalJson, exactFields, requireThat, buildAssayProviderWire, inspectAssayResponse } from './loom-assay-contract.js';
import { createAssayBudgetClient } from './loom-assay-budget-client.js';
import { readLoomDemoVercelOidcToken } from './loom-demo-custody-client.js';

const estate = 'research/portable-loom-server-transport-20261009';
function send(res, status, body) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.statusCode = status;
  res.end(JSON.stringify({ schema: ASSAY_RESPONSE_SCHEMA, ...body }));
}
function authorization(req, env) {
  const header = req.headers?.authorization;
  const digest = env.TD613_LOOM_ASSAY_ACCESS_SHA256;
  requireThat(typeof digest === 'string' && /^[a-f0-9]{64}$/.test(digest), 'ASSAY_DISABLED');
  requireThat(typeof header === 'string' && /^Bearer [a-zA-Z0-9_-]{32,256}$/.test(header), 'ASSAY_UNAUTHORIZED');
  const token = header.slice(7), observed = sha256(token);
  requireThat(timingSafeEqual(Buffer.from(observed), Buffer.from(digest)), 'ASSAY_UNAUTHORIZED');
  return { token, credential_sha256: observed };
}
export function createLoomAssayHandler({ environment = process.env, fetchImpl = fetch, budget = null,
  manifest, artifactText, fixture = false, allowedRunId = null, allowedRunIds = null } = {}) {
  fixture = fixture || fetchImpl !== globalThis.fetch;
  return async (req, res) => {
    if (req.method !== 'POST') return send(res, 405, { status: 'HELD', error: 'ASSAY_POST_REQUIRED' });
    let auth, request, policy, wire, reservation, activeBudget, workloadToken;
    try {
      auth = authorization(req, environment);
      // Vercel Functions supplies identity on this request, rather than the
      // build-time environment. Resolve it afresh; Neon still verifies it.
      workloadToken = readLoomDemoVercelOidcToken({ environment, requestHeaders: req.headers });
      activeBudget = budget ?? createAssayBudgetClient({
        environment: { ...environment, VERCEL_OIDC_TOKEN: workloadToken }, fetchImpl
      });
      requireThat(typeof environment.GEMINI_API_KEY === 'string' && environment.GEMINI_API_KEY.length > 0, 'ASSAY_PROVIDER_UNCONFIGURED');
      const raw = typeof req.body === 'string' || Buffer.isBuffer(req.body) ? Buffer.from(req.body)
        : Buffer.from(JSON.stringify(req.body));
      requireThat(raw.length <= 2000000, 'ASSAY_REQUEST_BYTE_LIMIT');
      requireThat(![environment.GEMINI_API_KEY, auth.token, workloadToken].filter(Boolean)
        .some(secret => raw.includes(Buffer.from(secret))), 'ASSAY_PROTECTED_CREDENTIAL_IN_PAYLOAD');
      request = JSON.parse(raw.toString('utf8'));
      requireThat(allowedRunId === null || request.run_id === allowedRunId, 'ASSAY_RUN_OUTSIDE_ACTIVATION');
      requireThat(allowedRunIds === null || allowedRunIds.includes(request.run_id), 'ASSAY_RUN_OUTSIDE_ACTIVATION');
      requireThat(/^[a-f0-9]{40}$/.test(environment.VERCEL_GIT_COMMIT_SHA || '')
        && request.protocol_commit === environment.VERCEL_GIT_COMMIT_SHA, 'ASSAY_DEPLOYED_SOURCE_MISMATCH');
      ({ policy } = await activeBudget('inspect', { run_id: request.run_id, credential_sha256: auth.credential_sha256 }));
      const m = manifest ?? JSON.parse(readFileSync(resolve(estate, 'TRIAL_MANIFEST.json')));
      const artifact = artifactText ?? readFileSync(resolve(m.artifact_path), 'utf8');
      wire = buildAssayProviderWire(request, policy, m, artifact);
      reservation = await activeBudget('reserve', { run_id: request.run_id, credential_sha256: auth.credential_sha256,
        protocol_commit: request.protocol_commit, artifact_sha256: request.artifact_sha256, trial: request.trial,
        request_sha256: wire.request_sha256, output_limit: wire.output_limit, prior_assistant_sha256: wire.prior_assistant_sha256,
        ...(policy.schema === ASSAY_RECOVERY_POLICY_SCHEMA ? { input_token_bound: wire.input_token_bound } : {}) });
      requireThat(reservation.durable_reservation === true && reservation.request_sha256 === wire.request_sha256
        && reservation.call_key === `${request.trial.trial_id}:${request.trial.role}:${request.trial.turn_index}`
        && reservation.reserved_cost_nanos === String(wire.reserved_cost_nanos), 'ASSAY_RESERVATION_RECEIPT_MISMATCH');
      requireThat(policy.schema !== ASSAY_RECOVERY_POLICY_SCHEMA || reservation.input_token_bound === wire.input_token_bound,
        'ASSAY_RESERVATION_RECEIPT_MISMATCH');
    } catch (error) {
      const code = /^ASSAY_[A-Z_]+$/.test(error.message) ? error.message : 'ASSAY_PREFLIGHT_HELD';
      return send(res, code === 'ASSAY_UNAUTHORIZED' ? 401 : code === 'ASSAY_DISABLED' ? 503 : 409,
        { status: 'HELD', error: code, provider_requests: 0 });
    }
    let deadlineExpired = false;
    const controller = new AbortController(), timer = setTimeout(() => {
      deadlineExpired = true;
      controller.abort();
    }, policy.binding.limits.timeout_ms);
    const chunks = []; let response, returned = null, error = null, responseBytes = 0, attempted = false, bodyComplete = false;
    const startedAt = new Date().toISOString();
    try {
      attempted = true;
      response = await fetchImpl(wire.url, { method: 'POST', redirect: 'error', signal: controller.signal,
        headers: { 'content-type': 'application/json', 'x-goog-api-key': environment.GEMINI_API_KEY }, body: wire.body });
      requireThat(response.body, 'ASSAY_MISSING_PROVIDER_BODY');
      for await (const chunk of response.body) {
        const data = Buffer.from(chunk);
        const available = Math.max(0, policy.binding.limits.max_response_bytes - responseBytes);
        chunks.push(data.subarray(0, available)); responseBytes += data.length;
        if (responseBytes > policy.binding.limits.max_response_bytes) { controller.abort(); throw new Error('ASSAY_RESPONSE_BYTE_LIMIT'); }
      }
      bodyComplete = true;
      requireThat(response.ok, 'ASSAY_PROVIDER_HTTP_FAILURE');
      returned = inspectAssayResponse(Buffer.concat(chunks), policy, wire.output_limit, wire.input_token_bound);
    } catch (e) { error = /^ASSAY_[A-Z_]+$/.test(e.message) ? e.message
      : deadlineExpired ? 'ASSAY_PROVIDER_DEADLINE_EXCEEDED' : 'ASSAY_PROVIDER_TRANSPORT_HELD'; }
    finally { clearTimeout(timer); }
    const rawResponse = Buffer.concat(chunks);
    const credentialEcho = [environment.GEMINI_API_KEY, auth.token, workloadToken].filter(Boolean)
      .some(secret => rawResponse.includes(Buffer.from(secret)));
    if (credentialEcho) { error = 'ASSAY_PROTECTED_CREDENTIAL_ECHO'; returned = null; }
    const status = error ? 'HELD_EVIDENCE_GAP' : 'CAPTURED_NOT_ADMITTED';
    let completion;
    try {
      completion = await activeBudget('complete', { run_id: request.run_id, credential_sha256: auth.credential_sha256,
        call_key: reservation.call_key, request_sha256: wire.request_sha256, response_sha256: sha256(rawResponse),
        answer_sha256: returned?.answer_sha256 ?? null, status });
      requireThat(completion.retained === true && completion.call_key === reservation.call_key && completion.status === status, 'ASSAY_COMPLETION_RECEIPT_MISMATCH');
    } catch { error = 'ASSAY_COMPLETION_UNCONFIRMED'; }
    return send(res, error ? 409 : 200, { status: error ? 'HELD_EVIDENCE_GAP' : status, error,
      evidence_class: fixture ? 'LOCAL_STRUCTURAL_TEST' : 'ACTUAL_RECEIVER_TEST',
      origin_scope: fixture ? 'MOCK_HTTP_FIXTURE_ONLY' : 'SERVER_OBSERVED_HTTPS_RESPONSE; client still requires retained transport bytes',
      source_commit: environment.VERCEL_GIT_COMMIT_SHA, artifact_sha256: request.artifact_sha256,
      trial: request.trial, provider_requests: attempted ? 1 : 0, retries: 0, started_at: startedAt, ended_at: new Date().toISOString(),
      provider_request_sha256: wire.request_sha256, provider_response_sha256: sha256(rawResponse),
      provider_response_base64: credentialEcho ? null : rawResponse.toString('base64'),
      response_complete: bodyComplete,
      provider_deadline_ms: policy.binding.limits.timeout_ms, provider_deadline_expired: deadlineExpired,
      http_status: response?.status ?? null, returned, reservation, completion: completion ?? null,
      receipt_authority: 'Byte and budget record; no custody admission or external empirical promotion' });
  };
}
export function loadApprovedRunConfiguration(path = resolve('server/loom-assay-run-config.json')) {
  const c = JSON.parse(readFileSync(path, 'utf8'));
  const recovery = c.schema === 'td613.loom.approved-assay-activation/v0.2';
  exactFields(c, ['schema', recovery ? 'run_ids' : 'run_id', 'access_sha256', 'budget_url', 'authorization_ref']);
  requireThat((recovery ? canonicalJson(c.run_ids) === canonicalJson(ASSAY_RECOVERY_RUN_IDS)
    : c.schema === 'td613.loom.approved-assay-activation/v0.1' && /^[a-zA-Z0-9_-]{1,80}$/.test(c.run_id))
    && /^[a-f0-9]{64}$/.test(c.access_sha256)
    && c.budget_url === 'https://br-round-union-b5v3ludi-loomassaybudget.compute.c-7.us-east-2.aws.neon.tech/'
    && c.authorization_ref === 'research/portable-loom-assay-activation-20261009/AUTHORIZATION.json', 'ASSAY_APPROVED_CONFIGURATION');
  return c;
}
export default function handler(req, res) {
  try {
      const c = loadApprovedRunConfiguration();
      // Public endpoint and high-entropy capability digest are source-bound. Provider key and platform workload token remain runtime-only.
      requireThat(!process.env.TD613_LOOM_ASSAY_ACCESS_SHA256 || process.env.TD613_LOOM_ASSAY_ACCESS_SHA256 === c.access_sha256,
        'ASSAY_CONFIGURATION_CONFLICT');
      requireThat(!process.env.TD613_LOOM_ASSAY_BUDGET_URL || process.env.TD613_LOOM_ASSAY_BUDGET_URL === c.budget_url,
        'ASSAY_CONFIGURATION_CONFLICT');
      const environment = { ...process.env, TD613_LOOM_ASSAY_ACCESS_SHA256: c.access_sha256, TD613_LOOM_ASSAY_BUDGET_URL: c.budget_url };
      return createLoomAssayHandler({ environment, allowedRunIds: c.run_ids ?? [c.run_id] })(req, res);
  } catch { return send(res, 503, { status: 'HELD', error: 'ASSAY_CONFIGURATION_UNAVAILABLE' }); }
}
