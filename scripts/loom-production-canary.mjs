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

const observations = payload?.observations && typeof payload.observations === 'object' ? payload.observations : {};
const providerAttempts = Array.isArray(observations.provider_attempts)
  ? observations.provider_attempts.slice(0, 3).map(attempt => ({ model: String(attempt?.model || ''), status: Number(attempt?.status || 0) }))
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
  provider_calls: Number.isSafeInteger(observations.provider_calls) ? observations.provider_calls : null,
  provider_attempts: providerAttempts,
  final_model: typeof observations.model === 'string' ? observations.model : null,
  provider_http_status: Number.isInteger(observations.http_status) ? observations.http_status : null,
  elapsed_ms: Number.isSafeInteger(observations.elapsed_ms) ? observations.elapsed_ms : null,
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
  const attempts = providerAttempts.map(attempt => `${attempt.model}:${attempt.status}`).join(',') || 'none';
  throw new Error(`Loom production canary held: HTTP ${httpStatus || 'none'} status=${payload?.status || 'missing'} attempts=${attempts}.`);
}
if (payload.request_id !== requestId) throw new Error('Loom production canary returned a mismatched request receipt.');
if (!receipt.answer_nonempty) throw new Error('Loom production canary returned no admitted answer.');
if (!usedDocumentIds.length || !usedDocumentIds.every(id => input.documents.some(document => document.id === id))) {
  throw new Error('Loom production canary returned invalid selected-document claims.');
}

console.log(`[loom-production-canary] PASS source=${sourcePacketCommit || 'unbound'} model=${receipt.final_model || 'unknown'} calls=${receipt.provider_calls ?? 'unknown'} elapsed_ms=${receipt.elapsed_ms ?? 'unknown'}`);