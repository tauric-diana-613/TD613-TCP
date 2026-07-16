import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const base = (process.env.TD613_BASE_URL || 'http://127.0.0.1:6138').replace(/\/$/, '');
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-safe-harbor-ingress-browser';
const digest = letter => `sha256:${letter.repeat(64)}`;

await fs.mkdir(artifactDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  locale: 'en-US',
  reducedMotion: 'reduce'
});
const page = await context.newPage();
page.setDefaultTimeout(10_000);
page.setDefaultNavigationTimeout(45_000);

const consoleErrors = [];
const failedRequests = [];
const unauthorizedRequests = [];
for (const target of [page]) {
  target.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  target.on('pageerror', error => consoleErrors.push(error.message));
  target.on('requestfailed', request => failedRequests.push({
    url: request.url(), method: request.method(), failure: request.failure()?.errorText || 'unknown'
  }));
  target.on('request', request => {
    const url = new URL(request.url());
    if (url.origin !== new URL(base).origin || !['GET', 'HEAD'].includes(request.method())) {
      unauthorizedRequests.push({ url: request.url(), method: request.method(), type: request.resourceType() });
    }
  });
}

await page.goto(`${base}/safe-harbor/`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#bindPacketInAsh', { state: 'attached' });
await page.locator('#bindPacketInAsh').evaluate(element => {
  let cursor = element.parentElement;
  while (cursor) {
    if (cursor instanceof HTMLDetailsElement) cursor.open = true;
    cursor = cursor.parentElement;
  }
  element.scrollIntoView({ block: 'center' });
});
await page.locator('#bindPacketInAsh').waitFor({ state: 'visible' });
assert.equal(await page.locator('#bindPacketInAsh').textContent(), 'Bind in Ash Keep');
assert.equal(await page.locator('#bindPacketInAsh').isDisabled(), true);
assert.match(await page.locator('#ashIngressStatus').textContent(), /awaits|held/i);
assert.ok((await page.locator('body').innerText()).length > 500, 'Safe Harbor loader must not replace the document stream.');

const token = await page.evaluate(async ({ digestA, digestB, digestC }) => {
  const module = await import('/engine/ash-safe-harbor-ingress.js');
  const packet = {
    schema_version: 'td613.safe-harbor.packet/v2',
    packet_id: 'packet-browser-probe',
    packet_hash_sha256: digestA,
    source_status: 'OPERATOR_STAGED',
    binding_provenance: {
      canonical_declaration_sha256: digestB,
      binding_receipt_sha256: digestC
    },
    signature: { status: 'absent', operator_signature_claimed: false },
    ingress: { future_self: 'excluded raw body' }
  };
  const tokenValue = 'ash_ingress_browser_probe_123456789';
  const envelope = await module.compileSafeHarborIngressEnvelope(packet, {
    token: tokenValue,
    envelopeId: 'harboringress_browser_probe',
    createdAt: '2026-07-16T23:30:00.000Z',
    origin: window.location.origin,
    ttlMs: 900000,
    elapsedMs: 0,
    packetHashVerified: true,
    authoritySurfaceStatus: 'EXPORT_HARDENED',
    sourceStatus: 'OPERATOR_STAGED',
    operatorIntent: 'CONSIDER_SAFE_HARBOR_REFERENCE_IN_ASH',
    rawBodyIncluded: false
  });
  if (!envelope.ingress_eligible) throw new Error(`Synthetic envelope held: ${envelope.state}`);
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open('td613-ash-ingress-v1', 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      const store = database.objectStoreNames.contains('envelopes')
        ? request.transaction.objectStore('envelopes')
        : database.createObjectStore('envelopes', { keyPath: 'token' });
      if (!store.indexNames.contains('packet_hash')) store.createIndex('packet_hash', 'packet_hash', { unique: false });
      if (!store.indexNames.contains('state')) store.createIndex('state', 'state', { unique: false });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  await new Promise((resolve, reject) => {
    const transaction = db.transaction('envelopes', 'readwrite');
    const request = transaction.objectStore('envelopes').put({
      token: tokenValue,
      packet_hash: envelope.packet.packet_hash_sha256,
      envelope,
      created_local_ms: Date.now(),
      origin: window.location.origin,
      state: 'STAGED',
      consumed_local_ms: null,
      cancellation_reason: null
    });
    request.onsuccess = resolve;
    request.onerror = () => reject(request.error);
  });
  db.close();
  return tokenValue;
}, { digestA: digest('a'), digestB: digest('b'), digestC: digest('c') });

await page.goto(`${base}/dome-world/ash-keep.html?safe_harbor_token=${encodeURIComponent(token)}`, { waitUntil: 'domcontentloaded' });
await page.waitForSelector('#safeHarborIngressReview');
await page.waitForFunction(() => document.querySelector('#safeHarborIngressState')?.textContent?.includes('INGRESS_ENVELOPE_ELIGIBLE'));
assert.equal(new URL(page.url()).searchParams.has('safe_harbor_token'), false, 'Token must leave the visible URL after intake.');
assert.match(await page.locator('#safeHarborIngressPacket').textContent(), /packet-browser-probe/);
assert.match(await page.locator('#safeHarborIngressRefs').textContent(), /3 bounded digest reference/);
assert.equal(await page.locator('#safeHarborBindL0').isEnabled(), true);
await page.locator('#safeHarborBindL0').click();
await page.waitForFunction(() => document.querySelector('#safeHarborIngressState')?.textContent?.includes('CUSTODY_REFERENCE_BOUND'));
const bindingReceipt = JSON.parse(await page.locator('#safeHarborIngressReceipt').textContent());
assert.equal(bindingReceipt.binding_level, 'L0');
assert.equal(bindingReceipt.custody_reference_bound, true);
assert.equal(bindingReceipt.custody_root_created, false);
assert.equal(bindingReceipt.case_created, false);
assert.equal(bindingReceipt.relation_created, false);
assert.equal(bindingReceipt.authenticity_concluded, false);
assert.equal(bindingReceipt.identity_concluded, false);
assert.equal(bindingReceipt.authorship_concluded, false);
assert.equal(bindingReceipt.truth_concluded, false);
assert.equal(bindingReceipt.destination_transport_authorized, false);
assert.equal(bindingReceipt.release_authorized, false);
assert.equal(bindingReceipt.cinder_action_authorized, false);

const storedState = await page.evaluate(async tokenValue => {
  const db = await new Promise((resolve, reject) => {
    const request = indexedDB.open('td613-ash-ingress-v1', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const record = await new Promise((resolve, reject) => {
    const request = db.transaction('envelopes', 'readonly').objectStore('envelopes').get(tokenValue);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return record?.state || null;
}, token);
assert.equal(storedState, 'CONSUMED');

const replayPage = await context.newPage();
replayPage.setDefaultTimeout(10_000);
replayPage.setDefaultNavigationTimeout(45_000);
await replayPage.goto(`${base}/dome-world/ash-keep.html?safe_harbor_token=${encodeURIComponent(token)}`, { waitUntil: 'domcontentloaded' });
await replayPage.waitForSelector('#safeHarborIngressReview');
await replayPage.waitForFunction(() => document.querySelector('#safeHarborIngressState')?.textContent?.includes('REPLAY_HOLD'));
assert.equal(await replayPage.locator('#safeHarborBindL0').isDisabled(), true);

assert.equal(unauthorizedRequests.length, 0, `Unexpected external or mutating requests: ${JSON.stringify(unauthorizedRequests)}`);
const materialConsoleErrors = consoleErrors.filter(value => !/favicon|404|Failed to load resource/i.test(value));
assert.equal(materialConsoleErrors.length, 0, `Browser console errors: ${JSON.stringify(materialConsoleErrors)}`);

const receipt = {
  schema: 'td613.ash.safe-harbor.ingress-browser-observation/v0.1',
  observed_base: base,
  viewport: { width: 390, height: 844 },
  reduced_motion: true,
  safe_harbor_button_observed: true,
  document_stream_preserved: true,
  l0_reference_bound: true,
  token_removed_from_visible_url: true,
  token_consumed: true,
  replay_hold_observed: true,
  raw_body_transferred: false,
  provider_called: false,
  server_custody_created: false,
  destination_transport_authorized: false,
  release_authorized: false,
  cinder_action_authorized: false,
  unauthorized_requests: unauthorizedRequests,
  failed_requests: failedRequests,
  console_errors: materialConsoleErrors
};
await fs.writeFile(path.join(artifactDir, 'browser-observation.json'), `${JSON.stringify(receipt, null, 2)}\n`);
await fs.writeFile(path.join(artifactDir, 'binding-receipt.json'), `${JSON.stringify(bindingReceipt, null, 2)}\n`);
await browser.close();
console.log('ash-safe-harbor-ingress-browser-probe.mjs passed');
