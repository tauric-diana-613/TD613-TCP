const REQUIRED_GIVING_MARKERS = Object.freeze([
  '<title>TD613 Giving</title>',
  'id="exportCampaignDeputyBundleButton"',
  'id="bulkGivingHistoryButton"',
  'id="sessionMembrane"'
]);

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
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
  attempts = 72,
  delayMs = 5000,
  requestTimeoutMs = 15000,
  fetchImpl = globalThis.fetch,
  sleep = (duration) => new Promise((resolve) => setTimeout(resolve, duration)),
  onAttempt = () => {}
} = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('Giving production readiness requires fetch.');
  const expectedCommit = String(sourceCommit || '').trim();
  if (!/^[0-9a-f]{40}$/.test(expectedCommit)) throw new Error('Giving production readiness requires the authorized 40-character source commit.');
  const boundedAttempts = positiveInteger(attempts, 72);
  const boundedDelayMs = positiveInteger(delayMs, 5000);
  const boundedRequestTimeoutMs = positiveInteger(requestTimeoutMs, 15000);
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
      const receiptMatches = receiptResponse.ok && releaseReceipt?.source_packet_commit === expectedCommit;
      let ready = false;
      let status = receiptResponse.status;
      if (!receiptResponse.ok) {
        lastObservation = `release receipt HTTP ${receiptResponse.status}`;
      } else if (!receiptMatches) {
        lastObservation = `release receipt commit ${releaseReceipt?.source_packet_commit || 'missing'} does not match ${expectedCommit}`;
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
        lastObservation = response.ok
          ? (ready ? 'authorized release receipt and required Giving markers present' : 'required Giving markers absent')
          : `Giving HTML HTTP ${response.status}`;
      }
      onAttempt({ attempt, attempts: boundedAttempts, ready, status, observation: lastObservation, url, receiptUrl });
      if (ready) return { attempt, attempts: boundedAttempts, status, url, receiptUrl, sourceCommit: expectedCommit, releaseReceipt };
    } catch (error) {
      lastObservation = error instanceof Error ? error.message : String(error);
      onAttempt({ attempt, attempts: boundedAttempts, ready: false, status: null, observation: lastObservation, url, receiptUrl });
    }
    if (attempt < boundedAttempts) await sleep(boundedDelayMs);
  }

  throw new Error(`Giving production route did not become ready after ${boundedAttempts} attempts: ${lastObservation}`);
}

export const _givingProductionReadinessInternals = Object.freeze({ REQUIRED_GIVING_MARKERS, positiveInteger });
