import fs from 'node:fs';
import path from 'node:path';

const base = String(process.env.TD613_BASE_URL || 'https://td613.com').replace(/\/$/, '');
const sourcePacketCommit = String(process.env.TD613_SOURCE_PACKET_COMMIT || '').trim();
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/loom-production-canary';
const fixturePath = 'docs/research/receipts/2026-09-10-loom-live-receiver/portable-aia.json';
const fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf8'));
const origin = new URL(base).origin;
const requestId = `release-canary-${Date.now()}`;
const input = {
  schema: 'td613.loom.ai-task/v0.1',
  request_id: requestId,
  task: fixture.task,
  documents: fixture.documents,
  rules: fixture.rules
};

if (!/^https?:\/\//.test(base)) throw new Error('TD613_BASE_URL must be an absolute HTTP(S) URL.');
if (sourcePacketCommit && !/^[0-9a-f]{40}$/.test(sourcePacketCommit)) throw new Error('TD613_SOURCE_PACKET_COMMIT must be a 40-character SHA when supplied.');
if (!Array.isArray(input.documents) || input.documents.length !== 3 || !Array.isArray(input.rules) || input.rules.length !== 3) {
  throw new Error('Loom production canary fixture drifted from the bounded Demo 1 packet.');
}

fs.mkdirSync(artifactDir, { recursive: true });
const url = new URL('/api/khonapolit?operation=loom-task', `${base}/`);
let httpStatus = 0;
let payload = null;
let transportError = null;
try {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'origin': origin,
      'sec-fetch-site': 'same-origin',
      'cache-control': 'no-cache'
    },
    body: JSON.stringify(input),
    redirect: 'follow',
    signal: AbortSignal.timeout(57000)
  });
  httpStatus = response.status;
  try { payload = await response.json(); } catch { payload = null; }
} catch (error) {
  transportError = `${error?.name || 'Error'}`;
}

const boundedCount = value => Number.isSafeInteger(value) && value >= 0 ? value : null;
const boundedDiagnostic = value => value && typeof value === 'object'
  && typeof value.schema === 'string' && /^td613\.loom\.ai-task-diagnostic\/v0\.1$/.test(value.schema)
  && typeof value.stage === 'string' && /^[a-z-]{1,40}$/.test(value.stage)
  && typeof value.code === 'string' && /^[A-Z_]{1,80}$/.test(value.code)
  ? { schema: value.schema, stage: value.stage, code: value.code }
  : null;
const boundedStageTimings = value => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const output = {};
  for (const stage of ['provider-plan', 'provider-transport', 'provider-json', 'output-admission']) {
    const count = boundedCount(value[stage]);
    if (count !== null && count <= 60000) output[stage] = count;
  }
  return Object.keys(output).length ? output : null;
};

const observations = payload?.observations && typeof payload.observations === 'object' ? payload.observations : {};
const providerAttempts = Array.isArray(observations.provider_attempts)
  ? observations.provider_attempts.slice(0, 3).map(attempt => ({
      model: String(attempt?.model || '').slice(0, 120),
      status: Number.isInteger(attempt?.status) && attempt.status >= 100 && attempt.status <= 599 ? attempt.status : null
    }))
  : [];
const providerAttemptTimings = Array.isArray(observations.provider_attempt_timings)
  ? observations.provider_attempt_timings.slice(0, 3).map(attempt => ({
      model: String(attempt?.model || '').slice(0, 120),
      status: Number.isInteger(attempt?.status) && attempt.status >= 100 && attempt.status <= 599 ? attempt.status : null,
      elapsed_ms: boundedCount(attempt?.elapsed_ms),
      timeout_ms: boundedCount(attempt?.timeout_ms),
      timed_out: attempt?.timed_out === true
    }))
  : [];
const usedDocumentIds = Array.isArray(payload?.used_document_ids) ? payload.used_document_ids.filter(id => typeof id === 'string').slice(0, 8) : [];
const receipt = {
  schema: 'td613.loom.production-canary/v0.1',
  source_packet_commit: sourcePacketCommit || null,
  observed_at: new Date().toISOString(),
  target_origin: origin,
  request_id: requestId,
  request_count: 1,
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
  counts_as_human_evidence: false
};
fs.writeFileSync(path.join(artifactDir, 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`);
console.log(`[loom-production-canary] ${JSON.stringify(receipt)}`);

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

console.log(`[loom-production-canary] PASS source=${sourcePacketCommit || 'unbound'} model=${receipt.final_model || 'unknown'} calls=${receipt.provider_calls ?? 'unknown'} elapsed_ms=${receipt.elapsed_ms ?? 'unknown'}`);