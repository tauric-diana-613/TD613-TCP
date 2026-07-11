#!/usr/bin/env node

/**
 * TD613 Dome-World Phase 0 deployment probe.
 *
 * Exercises only bounded, receipt-producing public routes:
 * - guarded Dome-World ping;
 * - guarded Dome-World readiness;
 * - guarded Ash local-commitment readiness;
 * - L0 metadata-only Ash custody registration;
 * - negative proof that the public legacy engine cannot register custody.
 *
 * No artifact bytes, document text, credentials, or stable artifact digest are
 * sent by this probe.
 */

import { pathToFileURL } from 'node:url';

const PROBE_SCHEMA = 'td613.dome-world.deployment-probe/v0.1';
const L0_ASSURANCE = 'L0_METADATA_ONLY';
const FORBIDDEN_CUSTODY_OPERATIONS = new Set([
  'ash-custody-register',
  'ash-custody-replay',
]);

function normalizeBaseUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) {
    throw new Error(
      'Provide a base URL as the first argument or set DOME_WORLD_BASE_URL.',
    );
  }

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
  return `phase0_probe_${random.replace(/-/g, '')}`;
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
      sourceEnvironment: 'manual',
      sourceLocator: {
        label: 'phase0-live-deployment-probe',
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
      credentialReference: {
        credentialType: 'none',
      },
      privacyBoundary: {
        public_weather_only: true,
      },
      ashPosture: {
        roomRoute: 'private-sense-only',
        recommendedTending: ['ash-receipt'],
      },
      operatorMetadata: {
        raw_content_supplied: false,
        notes: null,
      },
    },
  };
}

async function readJson(response, label) {
  const body = await response.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    throw new Error(`${label} returned a non-JSON response.`);
  }
  return body;
}

async function requestJson(fetchImpl, url, options, label) {
  const response = await fetchImpl(url, options);
  const body = await readJson(response, label);
  return { response, body };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertGuardedReadiness(body) {
  assert(body.ok === true, 'Dome-World readiness did not return ok=true.');
  const operations = Array.isArray(body.operations) ? body.operations : [];
  for (const operation of operations) {
    assert(
      !FORBIDDEN_CUSTODY_OPERATIONS.has(operation),
      `Guarded readiness leaked custody operation ${operation}.`,
    );
  }
  assert(
    body.metadataDigestFallbackOnPublicCustodyRoute === false,
    'Guarded readiness did not deny metadata-derived custody digests.',
  );
}

function assertAshReadiness(body) {
  assert(body.ok === true, 'Ash readiness did not return ok=true.');
  assert(
    body.metadataDigestFallback === false,
    'Ash readiness reported a metadata digest fallback.',
  );
  assert(
    body.rawBytesAcceptedByServer === false,
    'Ash readiness reported that raw bytes are accepted by the server.',
  );
  const operations = new Set(Array.isArray(body.operations) ? body.operations : []);
  assert(operations.has('ash-custody-register'), 'Ash readiness omitted registration.');
  assert(operations.has('ash-custody-replay'), 'Ash readiness omitted replay.');
}

function assertL0Receipt(body) {
  assert(body.ok === true, 'L0 registration did not return ok=true.');
  const result = body.result || body;
  assert(
    result.schema === 'td613.ash.custody-receipt/v0.7',
    'L0 registration returned the wrong receipt schema.',
  );
  assert(result.assurance_class === L0_ASSURANCE, 'L0 assurance class changed.');
  assert(result.artifact_digest_present === false, 'L0 receipt carried an artifact digest.');
  const metadata = result.manifest?.artifact_metadata || {};
  assert(metadata.artifact_digest === null, 'L0 manifest synthesized artifact_digest.');
  assert(metadata.content_hash === null, 'L0 manifest synthesized content_hash.');
  assert(
    result.manifest?.local_commitment === null,
    'L0 manifest unexpectedly carried a local commitment object.',
  );
  assert(
    result.manifest?.privacy_boundary?.raw_content_received_by_server === false,
    'L0 receipt did not preserve the raw-content boundary.',
  );
}

export async function runDomeWorldDeploymentProbe({
  baseUrl,
  fetchImpl = globalThis.fetch,
  traceId = probeTraceId(),
} = {}) {
  if (typeof fetchImpl !== 'function') {
    throw new Error('A Fetch-compatible implementation is required.');
  }

  const base = normalizeBaseUrl(baseUrl);
  const checks = [];

  const ping = await requestJson(
    fetchImpl,
    `${base}/api/dome-world/ping`,
    { method: 'GET', headers: { accept: 'application/json' } },
    'Dome-World ping',
  );
  assert(ping.response.ok, `Dome-World ping returned HTTP ${ping.response.status}.`);
  assert(ping.body.ok === true, 'Dome-World ping did not return ok=true.');
  checks.push({ id: 'dome_ping', status: 'PASS', operation: ping.body.operation || 'ping' });

  const readiness = await requestJson(
    fetchImpl,
    `${base}/api/dome-world/readiness`,
    { method: 'GET', headers: { accept: 'application/json' } },
    'Dome-World readiness',
  );
  assert(
    readiness.response.ok,
    `Dome-World readiness returned HTTP ${readiness.response.status}.`,
  );
  assertGuardedReadiness(readiness.body);
  checks.push({ id: 'dome_readiness', status: 'PASS' });

  const ashReadiness = await requestJson(
    fetchImpl,
    `${base}/api/ash-local-commitment?operation=readiness`,
    { method: 'GET', headers: { accept: 'application/json' } },
    'Ash readiness',
  );
  assert(
    ashReadiness.response.ok,
    `Ash readiness returned HTTP ${ashReadiness.response.status}.`,
  );
  assertAshReadiness(ashReadiness.body);
  checks.push({ id: 'ash_readiness', status: 'PASS' });

  const envelope = l0ProbeEnvelope(traceId);
  const registration = await requestJson(
    fetchImpl,
    `${base}/api/dome-world/ash-custody-register`,
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(envelope),
    },
    'Ash L0 registration',
  );
  assert(
    registration.response.ok,
    `Ash L0 registration returned HTTP ${registration.response.status}.`,
  );
  assertL0Receipt(registration.body);
  checks.push({ id: 'ash_l0_registration', status: 'PASS', trace_id: traceId });

  const denied = await requestJson(
    fetchImpl,
    `${base}/api/dome-world-engine`,
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        operation: 'ash-custody-register',
        traceId: `${traceId}_negative`,
        payload: {},
      }),
    },
    'Legacy custody bypass check',
  );
  assert(
    denied.response.status === 400,
    `Legacy custody bypass returned HTTP ${denied.response.status}; expected 400.`,
  );
  assert(
    denied.body.ok === false && /owned exclusively/i.test(String(denied.body.error || '')),
    'Legacy engine did not clearly reject public custody registration.',
  );
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
    const receipt = await runDomeWorldDeploymentProbe({ baseUrl });
    process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(
      `${JSON.stringify({ schema: PROBE_SCHEMA, status: 'FAIL', error: error.message }, null, 2)}\n`,
    );
    process.exitCode = 1;
  }
}

const invokedUrl = process.argv[1] ? pathToFileURL(process.argv[1]).href : '';
if (import.meta.url === invokedUrl) {
  await main();
}
