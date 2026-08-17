import path from 'node:path';
import { waitForGivingReleaseContent } from './giving-release-content-probe.mjs';

const REQUIRED_GIVING_MARKERS = Object.freeze([
  '<title>TD613 Giving History</title>',
  'id="exportCampaignDeputyBundleButton"',
  'id="bulkGivingHistoryButton"',
  'id="sessionMembrane"'
]);

const RELEASE_RECEIPT_POLICIES = Object.freeze(['match-source', 'observe-existing']);
const RELEASE_RECEIPT_SCHEMA = 'td613.giving.release-source/v1';

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function receiptPolicy(value = '') {
  const explicit = String(value || '').trim();
  if (explicit) {
    if (!RELEASE_RECEIPT_POLICIES.includes(explicit)) {
      throw new Error(`Unsupported Giving release receipt policy: ${explicit}`);
    }
    return explicit;
  }

  // Production practice confirmation reuses the existing Giving product package.
  // Its output lane is deliberately distinct from a Giving product release, whose
  // release-source receipt must continue to match the newly authorized source commit.
  const artifactDir = String(process.env.TD613_ARTIFACT_DIR || '').replaceAll('\\', '/');
  return /(^|\/)practice-production(?:\/|$)/.test(artifactDir)
    ? 'observe-existing'
    : 'match-source';
}

function validGivingReleaseReceipt(receipt) {
  return Boolean(
    receipt &&
    receipt.schema === RELEASE_RECEIPT_SCHEMA &&
    /^[0-9a-f]{40}$/.test(String(receipt.source_packet_commit || ''))
  );
}

export function hasGivingProductionSurface(html) {
  const source = String(html || '');
  return REQUIRED_GIVING_MARKERS.every((marker) => source.includes(marker));
}

export function givingProductionSurfaceUrl(baseUrl, { sourceCommit = '', attempt = 1 } = {}) {
  const url = new URL('/giving/history/', String(baseUrl || '').replace(/\/$/, ''));
  url.searchParams.set('td613-giving-release', String(sourceCommit || 'unspecified'));
  url.searchParams.set('readiness-attempt', String(positiveInteger(attempt, 1)));
  return url.href;
}

export function givingProductionReceiptUrl(baseUrl, { sourceCommit = '', attempt = 1 } = {}) {
  const url = new URL('/giving/history/release-source.json', String(baseUrl || '').replace(/\/$/, ''));
  url.searchParams.set('td613-giving-release', String(sourceCommit || 'unspecified'));
  url.searchParams.set('readiness-attempt', String(positiveInteger(attempt, 1)));
  return url.href;
}

export async function waitForGivingProductionSurface({
  baseUrl,
  sourceCommit = '',
  releaseReceiptPolicy = '',
  attempts = 72,
  delayMs = 5000,
  requestTimeoutMs = 15000,
  fetchImpl = globalThis.fetch,
  sleep = (duration) => new Promise((resolve) => setTimeout(resolve, duration)),
  onAttempt = () => {},
  verifyExactContent = process.env.TD613_PRODUCTION_OBSERVATION === 'true'
} = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('Giving production readiness requires fetch.');
  const expectedCommit = String(sourceCommit || '').trim();
  if (!/^[0-9a-f]{40}$/.test(expectedCommit)) throw new Error('Giving production readiness requires the authorized 40-character source commit.');
  const policy = receiptPolicy(releaseReceiptPolicy);
  const boundedAttempts = positiveInteger(attempts, 72);
  const boundedDelayMs = positiveInteger(delayMs, 5000);
  const boundedRequestTimeoutMs = positiveInteger(requestTimeoutMs, 15000);
  let exactContentObservation = null;

  if (verifyExactContent === true) {
    const parentArtifactDir = String(process.env.TD613_ARTIFACT_DIR || 'artifacts/giving-production');
    exactContentObservation = await waitForGivingReleaseContent({
      baseUrl,
      sourcePacketCommit: expectedCommit,
      artifactDir: path.join(parentArtifactDir, 'exact-source'),
      attempts: boundedAttempts,
      delayMs: boundedDelayMs,
      onAttempt: ({ attempt, attempts: total, ready, observation }) => {
        onAttempt({
          attempt,
          attempts: total,
          ready: false,
          status: null,
          observation: `exact-source ${ready ? 'PASS' : 'WAIT'}: ${observation}`,
          url: null,
          receiptUrl: null,
          releaseReceiptPolicy: policy,
          receiptMatches: false,
          exactSourcePhase: true
        });
      }
    });
    if (exactContentObservation?.practice_critical_surface_exact_source !== true) {
      throw new Error('Giving production readiness requires exact practice-critical surface bytes.');
    }
  }

  let lastObservation = 'no response';

  for (let attempt = 1; attempt <= boundedAttempts; attempt += 1) {
    const url = givingProductionSurfaceUrl(baseUrl, { sourceCommit, attempt });
    const receiptUrl = givingProductionReceiptUrl(baseUrl, { sourceCommit, attempt });
    try {
      const receiptResponse = await fetchImpl(receiptUrl, {
        cache: 'no-store',
        redirect: 'follow',
        headers: { 'cache-control': 'no-cache' },
        signal: AbortSignal.timeout(boundedRequestTimeoutMs)
      });
      const receiptText = await receiptResponse.text();
      let releaseReceipt = null;
      try { releaseReceipt = JSON.parse(receiptText); } catch {}
      const receiptValid = receiptResponse.ok && validGivingReleaseReceipt(releaseReceipt);
      const receiptMatches = receiptValid && releaseReceipt.source_packet_commit === expectedCommit;
      let ready = false;
      let status = receiptResponse.status;

      if (!receiptResponse.ok) {
        lastObservation = `release receipt HTTP ${receiptResponse.status}`;
      } else if (!receiptValid) {
        lastObservation = 'Giving release receipt is missing or invalid';
      } else if (policy === 'match-source' && !receiptMatches) {
        lastObservation = `release receipt commit ${releaseReceipt.source_packet_commit} does not match ${expectedCommit}`;
      } else {
        const response = await fetchImpl(url, {
          cache: 'no-store',
          redirect: 'follow',
          headers: { 'cache-control': 'no-cache' },
          signal: AbortSignal.timeout(boundedRequestTimeoutMs)
        });
        const html = await response.text();
        ready = response.ok && hasGivingProductionSurface(html);
        status = response.status;
        if (!response.ok) {
          lastObservation = `Giving HTML HTTP ${response.status}`;
        } else if (!ready) {
          lastObservation = 'required Giving markers absent';
        } else if (policy === 'match-source') {
          lastObservation = 'authorized Giving release receipt and required Giving markers present';
        } else {
          lastObservation = `existing Giving release receipt ${releaseReceipt.source_packet_commit} observed; required Giving markers present under independently verified deployment`;
        }
      }

      onAttempt({
        attempt,
        attempts: boundedAttempts,
        ready,
        status,
        observation: lastObservation,
        url,
        receiptUrl,
        releaseReceiptPolicy: policy,
        receiptMatches,
        exactSourcePhase: false
      });
      if (ready) {
        return {
          attempt,
          attempts: boundedAttempts,
          status,
          url,
          receiptUrl,
          sourceCommit: expectedCommit,
          releaseReceipt,
          releaseReceiptPolicy: policy,
          releaseReceiptMatchesSource: receiptMatches,
          exactContentObservation
        };
      }
    } catch (error) {
      lastObservation = error instanceof Error ? error.message : String(error);
      onAttempt({
        attempt,
        attempts: boundedAttempts,
        ready: false,
        status: null,
        observation: lastObservation,
        url,
        receiptUrl,
        releaseReceiptPolicy: policy,
        receiptMatches: false,
        exactSourcePhase: false
      });
    }
    if (attempt < boundedAttempts) await sleep(boundedDelayMs);
  }

  throw new Error(`Giving production route did not become ready after ${boundedAttempts} attempts: ${lastObservation}`);
}

export const _givingProductionReadinessInternals = Object.freeze({
  REQUIRED_GIVING_MARKERS,
  RELEASE_RECEIPT_POLICIES,
  RELEASE_RECEIPT_SCHEMA,
  positiveInteger,
  receiptPolicy,
  validGivingReleaseReceipt
});
