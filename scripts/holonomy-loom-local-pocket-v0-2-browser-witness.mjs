import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

import { renderLocalPocketHtml } from './holonomy-loom-local-pocket-v0-2-builder.mjs';

const browserName = String(process.env.TD613_BROWSER || 'chromium').trim().toLowerCase();
const engine = { chromium, firefox, webkit }[browserName];
if (!engine) throw new Error(`Unsupported TD613_BROWSER: ${browserName}`);

const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/local-pocket-v0-2');
const html = renderLocalPocketHtml();
const artifactName = 'holonomy-loom-local-pocket-v0.2.html';
const artifactPath = path.join(artifactDir, artifactName);
const receiptPath = path.join(artifactDir, `holonomy-loom-local-pocket-v0.2-${browserName}-receipt.json`);
const artifactSha256 = crypto.createHash('sha256').update(html).digest('hex');
const rawCanary = `RAW_DRAFT_${browserName.toUpperCase()}_613_MUST_NOT_TRAVEL`;
const protectedCanary = `PROTECTED_${browserName.toUpperCase()}_613_MUST_NOT_TRAVEL`;
const digestCanary = `sha256:${'6'.repeat(64)}`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function isFirefoxBrowserChromeFaviconCspDiagnostic(message) {
  if (browserName !== 'firefox' || message.type() !== 'error') return false;
  const text = String(message.text() || '');
  const location = String(message.location()?.url || '');
  return text.includes('Content-Security-Policy')
    && text.includes('/favicon.ico')
    && (location.includes('resource:///modules/FaviconLoader.sys.mjs') || text.includes('FaviconLoader.sys.mjs'));
}

await fs.mkdir(artifactDir, { recursive: true });
await fs.writeFile(artifactPath, html, 'utf8');

const serverHits = [];
const server = http.createServer((request, response) => {
  serverHits.push({ method: request.method, url: request.url });
  if (request.method === 'GET' && request.url === `/${artifactName}`) {
    response.writeHead(200, {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store'
    });
    response.end(html);
    return;
  }
  response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
  response.end('not found');
});

await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});
const address = server.address();
if (!address || typeof address === 'string') throw new Error('Local Pocket witness server did not bind a TCP port.');
const url = `http://127.0.0.1:${address.port}/${artifactName}`;

const report = {
  schema: 'td613.holonomy-loom.local-pocket-browser-witness/v0.2',
  browser: browserName,
  status: 'RUNNING',
  artifact: {
    name: artifactName,
    sha256: artifactSha256,
    bytes: Buffer.byteLength(html, 'utf8'),
    generated_from_canonical_builder: true
  },
  observations: {},
  canary_absence: {
    raw_draft: false,
    protected_term: false,
    digest: false
  },
  network: {
    initial_document_requests: 0,
    unexpected_requests: [],
    server_hits: []
  },
  storage: {},
  errors: {
    console: [],
    page: [],
    browser_chrome: []
  },
  authority: {
    release_authority: false,
    deployment_authorized: false,
    provider_call_performed: false,
    production_mutation: false,
    human_closure_required: true
  },
  seal: '⟐'
};

let browser;
let terminalError = null;
try {
  browser = await engine.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    reducedMotion: 'no-preference'
  });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  const requests = [];
  page.on('request', request => requests.push(request.url()));
  page.on('console', message => {
    if (message.type() !== 'error') return;
    if (isFirefoxBrowserChromeFaviconCspDiagnostic(message)) {
      report.errors.browser_chrome.push({ text: message.text(), location: message.location()?.url || null });
      return;
    }
    report.errors.console.push(message.text());
  });
  page.on('pageerror', error => report.errors.page.push(error.message));

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('[data-local-pocket]');

  report.observations.boot = await page.evaluate(() => ({
    schema: window.__TD613_LOCAL_POCKET_V0_2__?.schema || null,
    route_mode: window.__TD613_LOCAL_POCKET_V0_2__?.route_mode || null,
    state: window.__TD613_LOCAL_POCKET_V0_2__?.getState?.() || null,
    csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || null
  }));
  assert(report.observations.boot.schema === 'td613.holonomy-loom.local-pocket-artifact/v0.2', 'Pocket observer did not boot expected artifact schema.');
  assert(report.observations.boot.route_mode === 'LOCAL_POCKET', 'Pocket observer did not boot LOCAL_POCKET route mode.');
  assert(report.observations.boot.state?.checked === false, 'Pocket must boot unchecked.');
  assert(report.observations.boot.state?.release_authority === false, 'Pocket boot widened release authority.');
  assert(report.observations.boot.state?.human_closure_required === true, 'Pocket boot dropped human closure.');
  assert(/connect-src 'none'/.test(report.observations.boot.csp || ''), 'Pocket CSP does not deny connections.');

  const controlsInitially = await page.evaluate(() => ({
    safer: document.querySelector('#safer')?.disabled,
    copy_text: document.querySelector('#copyText')?.disabled,
    copy_packet: document.querySelector('#copyPacket')?.disabled
  }));
  assert(controlsInitially.safer === true && controlsInitially.copy_text === true && controlsInitially.copy_packet === true, 'Pocket copy/export controls must boot closed.');

  // Clean local check: no canonical detector fires; both operator-controlled doors may open.
  await page.fill('#draft', `A small clean note. ${rawCanary}`);
  await page.click('#check');
  const cleanState = await page.evaluate(() => window.__TD613_LOCAL_POCKET_V0_2__.getState());
  const cleanButtons = await page.evaluate(() => ({ copy_text: document.querySelector('#copyText').disabled, copy_packet: document.querySelector('#copyPacket').disabled }));
  assert(cleanState.checked === true && cleanState.posture === 'GREEN', 'Clean draft did not reach checked GREEN posture.');
  assert(cleanButtons.copy_text === false && cleanButtons.copy_packet === false, 'Clean checked draft did not open both explicit copy doors.');
  assert(!JSON.stringify(cleanState.packet).includes(rawCanary), 'Raw draft canary entered clean portable packet.');
  report.observations.clean_check = { checked: cleanState.checked, posture: cleanState.posture, copy_doors_open: true };

  // Any edit after a check must relock both doors.
  await page.fill('#draft', `A changed clean note. ${rawCanary}`);
  const relock = await page.evaluate(() => ({
    state: window.__TD613_LOCAL_POCKET_V0_2__.getState(),
    copy_text: document.querySelector('#copyText').disabled,
    copy_packet: document.querySelector('#copyPacket').disabled
  }));
  assert(relock.state.checked === false && relock.copy_text === true && relock.copy_packet === true, 'Draft mutation did not relock the Pocket.');
  report.observations.mutation_relocks = true;

  // Canonical REMOVE via credential-like material.
  await page.fill('#protected', '');
  await page.fill('#draft', `credential fixture AIzaABCDEFGHIJKLMNOPQRSTUVWXYZabcdef123456 ${rawCanary}`);
  await page.click('#check');
  const credentialState = await page.evaluate(() => window.__TD613_LOCAL_POCKET_V0_2__.getState());
  const credentialButtons = await page.evaluate(() => ({ copy_text: document.querySelector('#copyText').disabled, copy_packet: document.querySelector('#copyPacket').disabled, safer: document.querySelector('#safer').disabled }));
  assert(credentialState.posture === 'RED', 'Credential fixture did not reach RED posture.');
  assert(credentialState.finding_rule_ids.includes('COMMON_API_KEY_BLOCK'), 'Credential fixture did not map to canonical COMMON_API_KEY_BLOCK.');
  assert(credentialButtons.copy_text === true && credentialButtons.copy_packet === true, 'Canonical REMOVE did not keep both copy doors closed.');
  assert(credentialButtons.safer === false, 'Safer-copy action was not offered for a removable finding.');
  assert(!JSON.stringify(credentialState.packet).includes(rawCanary), 'Raw draft canary entered credential packet.');
  report.observations.credential_remove = { posture: credentialState.posture, rule_ids: credentialState.finding_rule_ids, export_closed: true };

  // Safer copy changes local text and forces another check.
  await page.click('#safer');
  const saferRelock = await page.evaluate(() => ({
    draft: document.querySelector('#draft').value,
    state: window.__TD613_LOCAL_POCKET_V0_2__.getState(),
    copy_text: document.querySelector('#copyText').disabled,
    copy_packet: document.querySelector('#copyPacket').disabled
  }));
  assert(saferRelock.draft.includes('[PROTECTED]'), 'Safer copy did not replace REMOVE span locally.');
  assert(saferRelock.state.checked === false && saferRelock.copy_text === true && saferRelock.copy_packet === true, 'Safer copy did not relock after mutation.');
  await page.click('#check');
  const saferChecked = await page.evaluate(() => window.__TD613_LOCAL_POCKET_V0_2__.getState());
  assert(!saferChecked.finding_rule_ids.includes('COMMON_API_KEY_BLOCK'), 'Credential REMOVE remained after safer-copy recheck.');
  report.observations.safer_copy_recheck = { posture: saferChecked.posture, credential_rule_cleared: true };

  // User-declared exact protection remains local and hard-blocking.
  await page.fill('#draft', `This mentions ${protectedCanary} and ${rawCanary}.`);
  await page.fill('#protected', protectedCanary);
  await page.click('#check');
  const protectedState = await page.evaluate(() => window.__TD613_LOCAL_POCKET_V0_2__.getState());
  assert(protectedState.posture === 'RED', 'User-protected exact term did not reach RED posture.');
  assert(protectedState.finding_rule_ids.includes('USER_DECLARED_PROTECTED_TERM'), 'Protected exact term did not map to canonical protected-term rule.');
  const protectedPacketText = JSON.stringify(protectedState.packet);
  assert(!protectedPacketText.includes(protectedCanary), 'Protected exact value entered portable packet.');
  assert(!protectedPacketText.includes(rawCanary), 'Raw draft canary entered protected-term packet.');
  report.observations.user_protected_remove = { posture: protectedState.posture, export_closed: await page.locator('#copyPacket').isDisabled() };

  // CHANGE findings may remain advisory while export is operator-controlled; raw values still stay out of packet.
  await page.fill('#protected', '');
  await page.fill('#draft', `${rawCanary} email person@example.com at 2026-09-05T03:33:00-04:00`);
  await page.click('#check');
  const changeState = await page.evaluate(() => window.__TD613_LOCAL_POCKET_V0_2__.getState());
  assert(changeState.posture === 'YELLOW', 'Email/timestamp fixture did not reach YELLOW posture.');
  assert(changeState.finding_rule_ids.includes('EMAIL_IDENTIFIER'), 'Email fixture did not map to EMAIL_IDENTIFIER.');
  assert(changeState.finding_rule_ids.includes('EXACT_TIMESTAMP'), 'Timestamp fixture did not map to EXACT_TIMESTAMP.');
  assert(await page.locator('#copyPacket').isEnabled(), 'YELLOW posture unexpectedly hard-blocked packet door.');
  const packetText = JSON.stringify(changeState.packet);
  for (const forbidden of [rawCanary, protectedCanary, 'person@example.com', '2026-09-05T03:33:00-04:00', digestCanary, 'sha256:']) {
    assert(!packetText.includes(forbidden), `Forbidden value entered born-minimized packet: ${forbidden === rawCanary ? 'raw-canary' : forbidden === protectedCanary ? 'protected-canary' : forbidden}`);
  }
  assert(!packetText.includes('LOCAL_POCKET'), 'Route label appeared inside portable packet payload.');
  assert(changeState.packet.release_authority === false && changeState.packet.human_closure_required === true, 'Pocket packet widened authority.');
  report.observations.born_minimized_packet = {
    posture: changeState.posture,
    finding_count: changeState.packet.portable_findings.length,
    release_authority: changeState.packet.release_authority,
    human_closure_required: changeState.packet.human_closure_required
  };
  report.canary_absence.raw_draft = !packetText.includes(rawCanary);
  report.canary_absence.protected_term = !packetText.includes(protectedCanary);
  report.canary_absence.digest = !packetText.includes('sha256:');

  // Exercise the packet copy door. Clipboard availability is not an authority claim.
  await page.click('#copyPacket');
  await page.waitForTimeout(40);
  const copyResultText = await page.locator('#answer').innerText();
  assert(/Pocket packet copied|Clipboard unavailable/.test(copyResultText), 'Explicit packet copy gesture did not reach a bounded local result.');
  report.observations.packet_copy_gesture = /Pocket packet copied/.test(copyResultText) ? 'CLIPBOARD_WRITE_OBSERVED' : 'CLIPBOARD_UNAVAILABLE_NO_EGRESS';

  // Rest stops new controlled actions; Return restores the last checked result without rerunning a detector.
  await page.click('#rest');
  const restingState = await page.evaluate(() => ({
    state: window.__TD613_LOCAL_POCKET_V0_2__.getState(),
    check_disabled: document.querySelector('#check').disabled,
    packet_disabled: document.querySelector('#copyPacket').disabled
  }));
  assert(restingState.state.resting === true && restingState.check_disabled === true && restingState.packet_disabled === true, 'Rest did not close active Pocket controls.');
  await page.click('#return');
  const returnedState = await page.evaluate(() => window.__TD613_LOCAL_POCKET_V0_2__.getState());
  assert(returnedState.resting === false && returnedState.checked === true, 'Return did not restore the last checked local state.');
  report.observations.rest_return = true;

  // Mobile / reduced-motion visibility and touchability.
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const mobile = await page.evaluate(() => {
    const selectors = ['#check', '#safer', '#copyText', '#copyPacket', '#rest', '#return', '#clear'];
    const controls = selectors.map(selector => {
      const node = document.querySelector(selector);
      const rect = node.getBoundingClientRect();
      return { selector, width: rect.width, height: rect.height, left: rect.left, right: rect.right, visible: rect.width > 0 && rect.height > 0 };
    });
    return {
      reduced_motion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      viewport_width: innerWidth,
      scroll_width: document.documentElement.scrollWidth,
      controls
    };
  });
  assert(mobile.reduced_motion === true, 'Reduced-motion preference was not observed.');
  assert(mobile.scroll_width <= mobile.viewport_width + 2, `Pocket overflowed 390px viewport by ${mobile.scroll_width - mobile.viewport_width}px.`);
  assert(mobile.controls.every(item => item.visible && item.left >= -1 && item.right <= mobile.viewport_width + 1 && item.height >= 38), 'Pocket mobile controls were not all visible/touchable.');
  report.observations.mobile_reduced_motion = { status: 'PASS', viewport: '390x844', reduced_motion: true };

  // Clear/Exit clears local fields and closes export again.
  await page.click('#clear');
  const cleared = await page.evaluate(() => ({
    draft: document.querySelector('#draft').value,
    protected: document.querySelector('#protected').value,
    state: window.__TD613_LOCAL_POCKET_V0_2__.getState(),
    copy_text: document.querySelector('#copyText').disabled,
    copy_packet: document.querySelector('#copyPacket').disabled
  }));
  assert(cleared.draft === '' && cleared.protected === '' && cleared.state.checked === false, 'Clear/Exit did not clear local editable state.');
  assert(cleared.copy_text === true && cleared.copy_packet === true, 'Clear/Exit did not close copy doors.');
  report.observations.clear_exit = true;

  report.storage = await page.evaluate(async () => ({
    local_storage_entries: localStorage.length,
    session_storage_entries: sessionStorage.length,
    cookie_present: document.cookie.length > 0,
    indexed_db_count: typeof indexedDB?.databases === 'function' ? (await indexedDB.databases()).length : null,
    cache_count: typeof caches?.keys === 'function' ? (await caches.keys()).length : null,
    service_worker_controller: Boolean(navigator.serviceWorker?.controller)
  }));
  assert(report.storage.local_storage_entries === 0, 'Pocket wrote localStorage.');
  assert(report.storage.session_storage_entries === 0, 'Pocket wrote sessionStorage.');
  assert(report.storage.cookie_present === false, 'Pocket set a cookie.');
  if (report.storage.indexed_db_count != null) assert(report.storage.indexed_db_count === 0, 'Pocket wrote IndexedDB.');
  if (report.storage.cache_count != null) assert(report.storage.cache_count === 0, 'Pocket wrote Cache API state.');
  assert(report.storage.service_worker_controller === false, 'Pocket acquired a service worker controller.');

  const stateNetworkAudit = await page.evaluate(() => window.__TD613_LOCAL_POCKET_V0_2__.networkAudit);
  assert(stateNetworkAudit.attempts === 0, `Pocket runtime attempted ${stateNetworkAudit.attempts} blocked network operations.`);

  report.network.initial_document_requests = requests.filter(requestUrl => requestUrl === url).length;
  report.network.unexpected_requests = requests.filter(requestUrl => requestUrl !== url);
  report.network.server_hits = [...serverHits];
  assert(report.network.initial_document_requests === 1, `Expected exactly one document request, observed ${report.network.initial_document_requests}.`);
  assert(report.network.unexpected_requests.length === 0, `Unexpected browser requests: ${JSON.stringify(report.network.unexpected_requests)}`);
  assert(serverHits.length === 1 && serverHits[0].url === `/${artifactName}`, `Unexpected local witness server hits: ${JSON.stringify(serverHits)}`);
  assert(report.errors.browser_chrome.length <= 1, `Unexpected browser-chrome diagnostic count: ${report.errors.browser_chrome.length}.`);
  if (browserName !== 'firefox') assert(report.errors.browser_chrome.length === 0, `Non-Firefox browser produced classified browser-chrome diagnostics: ${JSON.stringify(report.errors.browser_chrome)}`);
  assert(report.errors.console.length === 0, `Console errors: ${JSON.stringify(report.errors.console)}`);
  assert(report.errors.page.length === 0, `Page errors: ${JSON.stringify(report.errors.page)}`);

  report.status = 'PASS';
  await context.close();
} catch (error) {
  terminalError = error;
  report.status = 'HELD';
  report.hold_reason = error.message;
} finally {
  if (browser) await browser.close().catch(() => {});
  await new Promise(resolve => server.close(resolve));
  report.completed_at = new Date().toISOString();
  await fs.writeFile(receiptPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

if (terminalError) throw terminalError;
console.log(JSON.stringify({ status: report.status, browser: browserName, artifact: artifactPath, receipt: receiptPath, artifact_sha256: artifactSha256 }, null, 2));
