#!/usr/bin/env node

/**
 * TD613 Dome-World Phase 0–2 deployment probe.
 *
 * Exercises bounded public routes without artifact bytes or an artifact digest:
 * guarded Dome ping/readiness, Ash v0.8 readiness, L0 registration, v0.8 replay
 * verification, and negative legacy-engine custody execution.
 */

import { pathToFileURL } from 'node:url';

const PROBE_SCHEMA = 'td613.dome-world.deployment-probe/v0.2';
const L0_ASSURANCE = 'L0_METADATA_ONLY';
const FORBIDDEN_CUSTODY_OPERATIONS = new Set([
  'ash-custody-register',
  'ash-custody-replay',
  'ash-custody-migrate',
]);

function normalizeBaseUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) throw new Error('Provide a base URL as the first argument or set DOME_WORLD_BASE_URL.');
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const url = new URL(withProtocol);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error('Dome-World deployment probe supports HTTP(S) URLs only.');
  }
  url.pathname = url.pathname.replace(/\/+$/, '');
  url.search = '';
  url.hash = '';
  return url.toString().replace(/\/$/, '');
}

function probeTraceId() {
  const random = globalThis.crypto?.randomUUID?.() || Math.random().toString(36).slice(2);
  return `phase2_probe_${random.replace(/-/g, '')}`;
}

function l0ProbeEnvelope(traceId) {
  return {
    operation: 'ash-custody-register',
    traceId,
    apertureContext: {
      version: 'v3.0-alpha',
      schema: 'td613-aperture/v3.0-alpha',
      observedRegime: 'PRCS-A',
    },
    payload: {
      artifactId: `phase2_probe_${traceId}`,
      sourceEnvironment: 'manual',
      sourceLocator: {
        label: 'phase2-live-deployment-probe',
        path_or_ref: null,
        revision: null,
        commit_sha: null,
        blob_sha: null,
      },
      artifactMetadata: {
        mediaType: 'application/x-td613-probe+json',
        byteLength: null,
        lastModified: null,
        artifactDigest: null,
        contentHash: null,
        hashScope: 'unavailable',
        assuranceClass: L0_ASSURANCE,
        localCommitment: null,
      },
      credentialReference: { credentialType: 'none' },
      privacyBoundary: { public_weather_only: true },
      ashPosture: {
        roomRoute: 'private-sense-only',
        recommendedTending: ['ash-receipt'],
      },
      operatorMetadata: { raw_content_supplied: false, notes: null },
    },
  };
}

async function readJson(response, label) {
  const body = await response.json().catch(() => null);
  if (!body || typeof body !== 'object') throw new Error(`${label} returned a non-JSON response.`);
  return body;
}

async function requestJson(fetchImpl, url, options, label) {
  const response = await fetchImpl(url, options);
  return { response, body: await readJson(response, label) };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertSha256(value, label) {
  assert(/^sha256:[0-9a-f]{64}$/.test(String(value || '')), `${label} is not canonical SHA-256.`);
}

function assertGuardedReadiness(body) {
  assert(body.ok === true, 'Dome-World readiness did not return ok=true.');
  const operations = Array.isArray(body.operations) ? body.operations : [];
  for (const operation of operations) {
    assert(!FORBIDDEN_CUSTODY_OPERATIONS.has(operation), `Guarded readiness leaked custody operation ${operation}.`);
  }
  assert(
    body.metadataDigestFallbackOnPublicCustodyRoute === false,
    'Guarded readiness did not deny metadata-derived custody digests.',
  );
}

function assertAshReadiness(body) {
  assert(body.ok === true, 'Ash readiness did not return ok=true.');
  assert(body.status === 'phase-2-active', 'Ash readiness did not report Phase 2 active.');
  assert(body.schema === 'td613.ash.canonical-digest-readiness/v0.8', 'Ash readiness schema drifted.');
  assert(body.canonicalJsonProfile === 'td613.ash.canonical-json/v0.1', 'Canonical JSON profile drifted.');
  assert(body.metadataDigestFallback === false, 'Ash readiness reported a metadata digest fallback.');
  assert(body.rawBytesAcceptedByServer === false, 'Ash readiness reported raw-byte acceptance.');
  assert(body.universalStableDigestPublishedByDefault === false, 'Ash readiness enabled universal digest publication.');
  const operations = new Set(Array.isArray(body.operations) ? body.operations : []);
  for (const operation of FORBIDDEN_CUSTODY_OPERATIONS) {
    assert(operations.has(operation), `Ash readiness omitted ${operation}.`);
  }
}

function assertL0Receipt(body) {
  assert(body.ok === true, 'L0 registration did not return ok=true.');
  const result = body.result || body;
  assert(result.schema === 'td613.ash.custody-receipt/v0.8', 'L0 registration returned the wrong receipt schema.');
  assert(result.assurance_class === L0_ASSURANCE, 'L0 assurance class changed.');
  assert(result.artifact_digest_present === false, 'L0 receipt carried an artifact digest.');
  const metadata = result.manifest?.artifact_metadata || {};
  assert(metadata.artifact_digest === null, 'L0 manifest synthesized artifact_digest.');
  assert(!('content_hash' in metadata), 'v0.8 manifest revived content_hash.');
  assert(result.manifest?.local_commitment === null, 'L0 manifest carried a local commitment.');
  assertSha256(result.manifest_digest, 'manifest_digest');
  assertSha256(result.receipt_digest, 'receipt_digest');
  assert(result.manifest_digest === result.manifest?.manifest_digest, 'Manifest digest references disagree.');
  assert(result.manifest_digest !== result.receipt_digest, 'Manifest and receipt digests collapsed.');
  assert(
    result.manifest?.privacy_boundary?.raw_content_received_by_server === false,
    'L0 receipt did not preserve the raw-content boundary.',
  );
  return result;
}

function assertReplay(body, registration) {
  assert(body.ok === true, 'v0.8 replay did not return ok=true.');
  const result = body.result || body;
  assert(result.schema === 'td613.ash.custody-replay/v0.8', 'Replay schema drifted.');
  assert(result.validation_status === 'V0_8_DIGEST_SPINE_VERIFIED', 'Replay did not verify the digest spine.');
  assert(result.manifest_digest === registration.manifest_digest, 'Replay manifest digest changed.');
  assert(result.receipt_digest === registration.receipt_digest, 'Replay receipt digest changed.');
  assert(result.artifact_digest === null, 'L0 replay promoted an artifact digest.');
  assert(result.raw_replay_available === false, 'Replay exposed raw content.');
}

export async function runDomeWorldDeploymentProbe({
  baseUrl,
  fetchImpl = globalThis.fetch,
  traceId = probeTraceId(),
} = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('A Fetch-compatible implementation is required.');
  const base = normalizeBaseUrl(baseUrl);
  const checks = [];

  const ping = await requestJson(fetchImpl, `${base}/api/dome-world/ping`, { method: 'GET', headers: { accept: 'application/json' } }, 'Dome-World ping');
  assert(ping.response.ok, `Dome-World ping returned HTTP ${ping.response.status}.`);
  assert(ping.body.ok === true, 'Dome-World ping did not return ok=true.');
  checks.push({ id: 'dome_ping', status: 'PASS', operation: ping.body.operation || 'ping' });

  const readiness = await requestJson(fetchImpl, `${base}/api/dome-world/readiness`, { method: 'GET', headers: { accept: 'application/json' } }, 'Dome-World readiness');
  assert(readiness.response.ok, `Dome-World readiness returned HTTP ${readiness.response.status}.`);
  assertGuardedReadiness(readiness.body);
  checks.push({ id: 'dome_readiness', status: 'PASS' });

  const ashReadiness = await requestJson(fetchImpl, `${base}/api/ash-local-commitment?operation=readiness`, { method: 'GET', headers: { accept: 'application/json' } }, 'Ash readiness');
  assert(ashReadiness.response.ok, `Ash readiness returned HTTP ${ashReadiness.response.status}.`);
  assertAshReadiness(ashReadiness.body);
  checks.push({ id: 'ash_phase2_readiness', status: 'PASS' });

  const envelope = l0ProbeEnvelope(traceId);
  const registration = await requestJson(fetchImpl, `${base}/api/dome-world/ash-custody-register`, {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify(envelope),
  }, 'Ash L0 registration');
  assert(registration.response.ok, `Ash L0 registration returned HTTP ${registration.response.status}.`);
  const registeredReceipt = assertL0Receipt(registration.body);
  checks.push({ id: 'ash_l0_digest_spine', status: 'PASS', trace_id: traceId });

  const replay = await requestJson(fetchImpl, `${base}/api/dome-world/ash-custody-replay`, {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({
      operation: 'ash-custody-replay',
      traceId: `${traceId}_replay`,
      apertureContext: envelope.apertureContext,
      payload: { receipt: registeredReceipt },
    }),
  }, 'Ash v0.8 replay');
  assert(replay.response.ok, `Ash replay returned HTTP ${replay.response.status}.`);
  assertReplay(replay.body, registeredReceipt);
  checks.push({ id: 'ash_v08_replay_verification', status: 'PASS' });

  const denied = await requestJson(fetchImpl, `${base}/api/dome-world-engine`, {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify({ operation: 'ash-custody-register', traceId: `${traceId}_negative`, payload: {} }),
  }, 'Legacy custody bypass check');
  assert(denied.response.status === 400, `Legacy custody bypass returned HTTP ${denied.response.status}; expected 400.`);
  assert(denied.body.ok === false && /owned exclusively/i.test(String(denied.body.error || '')), 'Legacy engine did not clearly reject public custody registration.');
  checks.push({ id: 'legacy_custody_bypass_denied', status: 'PASS' });

  return {
    schema: PROBE_SCHEMA,
    status: 'PASS',
    base_url: base,
    trace_id: traceId,
    checks,
    transmitted: {
      artifact_bytes: false,
      raw_document_text: false,
      credential_secret: false,
      artifact_digest: false,
      l0_manifest_and_receipt_digests: true,
    },
    cannot_establish: [
      'artifact possession',
      'authorship',
      'authenticity',
      'identity',
      'permission',
      'external-world truth',
      'trusted time',
    ],
  };
}

async function main() {
  const baseUrl = process.argv[2] || process.env.DOME_WORLD_BASE_URL || process.env.VERCEL_URL;
  try {
    process.stdout.write(`${JSON.stringify(await runDomeWorldDeploymentProbe({ baseUrl }), null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`${JSON.stringify({ schema: PROBE_SCHEMA, status: 'FAIL', error: error.message }, null, 2)}\n`);
    process.exitCode = 1;
  }
}

const invokedUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === invokedUrl) await main();
