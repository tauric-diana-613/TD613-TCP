import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

import { renderMarrowlineCarryCaseHtml } from './marrowline-pocket-hosted-carry-case-builder.mjs';

const browserName = String(process.env.TD613_BROWSER || 'chromium').trim().toLowerCase();
const engine = { chromium, firefox, webkit }[browserName];
if (!engine) throw new Error(`Unsupported TD613_BROWSER: ${browserName}`);

const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/marrowline-pocket-hosted-carry-case');
const html = renderMarrowlineCarryCaseHtml();
const artifactName = 'marrowline-pocket-hosted-carry-case-v0.1.html';
const artifactPath = path.join(artifactDir, artifactName);
const receiptPath = path.join(artifactDir, `marrowline-pocket-hosted-carry-case-v0.1-${browserName}-receipt.json`);
const artifactSha256 = crypto.createHash('sha256').update(html).digest('hex');

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

for (const forbidden of [
  '<textarea',
  '<input',
  'contenteditable=',
  '"raw_message":',
  'rawMessage',
  'raw_draft',
  'rawDraft',
  'checked_text',
  'checkedText',
  'matched_value',
  'matchedValue',
  'selected_text',
  'selectedText',
  'conversation_history',
  'conversationHistory',
  'prompt_transcript',
  'promptTranscript',
  'policy_digest',
  'policyDigest',
  'source_state_digest',
  'sourceStateDigest',
  '"local_binding":',
  'localBinding',
  'journeyLabel',
  'source_host',
  'target_host',
  'sha256:',
  'generativelanguage.googleapis.com',
  '/api/khonapolit'
]) {
  assert(!html.includes(forbidden), `Carry Case artifact contains forbidden transport surface: ${forbidden}`);
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
if (!address || typeof address === 'string') throw new Error('Carry Case witness server did not bind a TCP port.');
const url = `http://127.0.0.1:${address.port}/${artifactName}`;

const report = {
  schema: 'td613.marrowline.pocket-hosted-carry-case-browser-witness/v0.1',
  browser: browserName,
  status: 'RUNNING',
  artifact: {
    name: artifactName,
    sha256: artifactSha256,
    bytes: Buffer.byteLength(html, 'utf8'),
    generated_from_canonical_builder: true
  },
  observations: {},
  network: {
    document_requests: 0,
    unexpected_requests: [],
    server_hits: []
  },
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

  async function openFresh() {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-carry-case]');
  }

  await openFresh();
  const boot = await page.evaluate(() => ({
    schema: window.__TD613_MARROWLINE_CARRY_CASE__?.schema || null,
    state: window.__TD613_MARROWLINE_CARRY_CASE__?.getState?.() || null,
    manifest: window.__TD613_MARROWLINE_CARRY_CASE__?.manifest || null,
    csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || null,
    text_inputs: document.querySelectorAll('textarea,input,[contenteditable="true"]').length,
    route_beats: [...document.querySelectorAll('[data-beat]')].map(node => node.textContent.trim())
  }));
  assert(boot.schema === 'td613.marrowline.pocket-hosted-carry-case-artifact/v0.1', 'Carry Case artifact schema mismatch.');
  assert(boot.state?.stage === 'PACKED', 'Carry Case must boot PACKED IN POCKET.');
  assert(boot.state?.release_authority === false && boot.state?.human_closure_required === true, 'Carry Case boot widened authority.');
  assert(boot.state?.provider_call_performed === false && boot.state?.production_mutation === false && boot.state?.deployment_authority === false, 'Carry Case boot crossed a closed authority membrane.');
  assert(boot.text_inputs === 0, 'Carry Case exposed a free-text transport input.');
  assert(/connect-src 'none'/.test(boot.csp || ''), 'Carry Case CSP does not deny connections.');
  for (const beat of ['🧳 PACKED IN POCKET', '🚪 CHECKED AT MARROWLINE', '🏠 OPENED IN TD613', '𝄐 REST / RETURN']) {
    assert(boot.route_beats.includes(beat), `Carry Case lost child-legible route beat: ${beat}`);
  }
  assert(boot.manifest?.source_packet?.schema === 'td613.holonomy-loom.local-pocket-export/v0.2-born-minimized', 'Browser did not receive canonical Pocket packet fixture.');
  assert(boot.manifest?.source_packet?.portable_findings?.length === 1, 'Browser Pocket packet fixture must carry exactly one canonical finding.');
  assert(boot.manifest?.carry_case?.receipt?.finding_count === 1, 'Carry Case did not import canonical Pocket finding.');
  assert(boot.manifest?.carry_case?.receipt?.raw_message_carried === false, 'Carry Case claimed a raw message carrier.');
  assert(boot.manifest?.carry_case?.receipt?.local_binding_carried === false, 'Carry Case transported local binding.');
  report.observations.boot = {
    stage: boot.state.stage,
    packet_schema: boot.manifest.source_packet.schema,
    finding_count: boot.manifest.carry_case.receipt.finding_count,
    no_free_text_transport_input: true
  };

  await page.click('#checkCase');
  const checked = await page.evaluate(() => ({
    state: window.__TD613_MARROWLINE_CARRY_CASE__.getState(),
    receipt: window.__TD613_MARROWLINE_CARRY_CASE__.manifest.carry_case.receipt,
    machine: document.querySelector('#machineText').textContent
  }));
  assert(checked.state.stage === 'CHECKED', 'Marrowline check did not advance to CHECKED.');
  assert(checked.machine.includes(checked.receipt.source_boundary_token), 'Marrowline check did not show canonical source boundary token.');
  assert(checked.machine.includes(checked.receipt.transport_action_token), 'Marrowline check did not show canonical transport action token.');
  report.observations.marrowline_check = {
    stage: checked.state.stage,
    source_boundary_token: checked.receipt.source_boundary_token,
    transport_action_token: checked.receipt.transport_action_token
  };

  await page.click('#openHosted');
  const opened = await page.evaluate(() => ({
    state: window.__TD613_MARROWLINE_CARRY_CASE__.getState(),
    carry: window.__TD613_MARROWLINE_CARRY_CASE__.manifest.carry_case,
    machine: document.querySelector('#machineText').textContent
  }));
  assert(opened.state.stage === 'OPENED', 'Carry Case did not open in TD613 Hosted.');
  assert(opened.carry.atlas.policy_equivalent === true, 'Policy receiver did not preserve equivalence.');
  assert(opened.carry.atlas.boundary_distinguishable === true, 'Boundary receiver did not preserve Pocket/Hosted distinction.');
  assert(opened.carry.receipt.source_boundary_token !== opened.carry.receipt.arrival_boundary_token, 'Canonical source and arrival boundary tokens collapsed.');
  assert(opened.machine.includes(opened.carry.receipt.arrival_boundary_token), 'Hosted opening did not show canonical arrival boundary token.');
  report.observations.atlas = {
    policy_equivalent: true,
    boundary_distinguishable: true,
    source_boundary_token: opened.carry.receipt.source_boundary_token,
    arrival_boundary_token: opened.carry.receipt.arrival_boundary_token,
    route_label_used_in_key: opened.carry.atlas.route_label_used_in_key,
    presentation_used_in_key: opened.carry.atlas.presentation_used_in_key,
    raw_message_used_in_key: opened.carry.atlas.raw_message_used_in_key
  };

  // First observe the hostile supported-action mismatch.
  await page.click('#returnMismatch');
  const mismatch = await page.evaluate(() => ({
    state: window.__TD613_MARROWLINE_CARRY_CASE__.getState(),
    verdict: document.querySelector('#verdict').textContent,
    envelope: window.__TD613_MARROWLINE_CARRY_CASE__.manifest.mismatching_return.envelope
  }));
  assert(mismatch.state.stage === 'RETURN' && mismatch.state.return_status === 'HOLD', 'Mismatching canonical action did not HOLD.');
  assert(mismatch.verdict === 'HOLD', 'Child-legible mismatch verdict did not display HOLD.');
  assert(mismatch.envelope.trusted === false && mismatch.envelope.release_authority === false && mismatch.envelope.must_revalidate === true, 'Mismatch envelope widened trust or release.');
  assert(!('source_host' in mismatch.envelope) && !('source_route_mode' in mismatch.envelope), 'Return envelope leaked host/route prose.');
  report.observations.mismatching_return = { status: 'HOLD', trusted: false, release_authority: false };

  // Reload only the same generated artifact to observe the matching branch independently.
  await openFresh();
  await page.click('#checkCase');
  await page.click('#openHosted');
  await page.click('#returnMatch');
  const matching = await page.evaluate(() => ({
    state: window.__TD613_MARROWLINE_CARRY_CASE__.getState(),
    verdict: document.querySelector('#verdict').textContent,
    result: window.__TD613_MARROWLINE_CARRY_CASE__.manifest.matching_return.result
  }));
  assert(matching.state.stage === 'RETURN' && matching.state.return_status === 'PRESENT_TO_HUMAN', 'Matching canonical action did not PRESENT_TO_HUMAN.');
  assert(matching.verdict === 'PRESENT_TO_HUMAN', 'Child-legible matching verdict did not display PRESENT_TO_HUMAN.');
  assert(matching.result.release_authority === false && matching.result.human_closure_required === true && matching.result.local_binding_retained === true, 'Matching return widened release or dropped local binding retention.');
  report.observations.matching_return = { status: 'PRESENT_TO_HUMAN', release_authority: false, human_closure_required: true, local_binding_retained: true };

  await page.click('#rest');
  let restState = await page.evaluate(() => window.__TD613_MARROWLINE_CARRY_CASE__.getState());
  assert(restState.resting === true, 'Carry Case Rest did not enter resting state.');
  await page.click('#comeBack');
  restState = await page.evaluate(() => window.__TD613_MARROWLINE_CARRY_CASE__.getState());
  assert(restState.resting === false, 'Carry Case Return did not leave resting state.');
  report.observations.rest_return = true;

  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const mobile = await page.evaluate(() => {
    const selectors = ['#checkCase', '#openHosted', '#returnMatch', '#returnMismatch', '#rest', '#comeBack', '#exit'];
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
  assert(mobile.reduced_motion === true, 'Carry Case reduced-motion preference was not observed.');
  assert(mobile.scroll_width <= mobile.viewport_width + 2, `Carry Case overflowed 390px viewport by ${mobile.scroll_width - mobile.viewport_width}px.`);
  assert(mobile.controls.every(item => item.visible && item.left >= -1 && item.right <= mobile.viewport_width + 1 && item.height >= 38), 'Carry Case mobile controls were not all visible/touchable.');
  report.observations.mobile_reduced_motion = { status: 'PASS', viewport: '390x844', reduced_motion: true };

  await page.click('#exit');
  const exited = await page.evaluate(() => window.__TD613_MARROWLINE_CARRY_CASE__.getState());
  assert(exited.exited === true && exited.stage === 'EXITED', 'Carry Case Exit did not close the local demonstration.');
  assert(exited.release_authority === false && exited.provider_call_performed === false && exited.production_mutation === false, 'Exit observation widened authority.');
  report.observations.exit = true;

  const finalNetworkAudit = await page.evaluate(() => window.__TD613_MARROWLINE_CARRY_CASE__.networkAudit);
  assert(finalNetworkAudit.attempts === 0, `Carry Case attempted ${finalNetworkAudit.attempts} page-owned network calls.`);

  const unexpectedRequests = requests.filter(requestUrl => requestUrl !== url);
  report.network.document_requests = requests.filter(requestUrl => requestUrl === url).length;
  report.network.unexpected_requests = unexpectedRequests;
  report.network.server_hits = [...serverHits];
  assert(report.network.document_requests === 2, `Carry Case expected two same-artifact document loads for independent return branches; observed ${report.network.document_requests}.`);
  assert(unexpectedRequests.length === 0, `Carry Case emitted unexpected browser requests: ${JSON.stringify(unexpectedRequests)}`);
  assert(serverHits.length === 2 && serverHits.every(hit => hit.method === 'GET' && hit.url === `/${artifactName}`), `Carry Case witness server observed unexpected requests: ${JSON.stringify(serverHits)}`);
  assert(report.errors.console.length === 0, `Carry Case document console errors: ${JSON.stringify(report.errors.console)}`);
  assert(report.errors.page.length === 0, `Carry Case page errors: ${JSON.stringify(report.errors.page)}`);
  if (browserName !== 'firefox') assert(report.errors.browser_chrome.length === 0, `Unexpected browser-chrome diagnostics on ${browserName}.`);
  assert(report.errors.browser_chrome.length <= 2, `Firefox emitted more browser-chrome diagnostics than same-document loads: ${JSON.stringify(report.errors.browser_chrome)}`);

  report.observations.network = { page_owned_attempts: 0, unexpected_requests: 0, same_artifact_document_loads: 2 };
  report.status = 'GREEN';
} catch (error) {
  terminalError = error;
  report.status = 'RED';
  report.error = error?.stack || String(error);
} finally {
  report.network.server_hits = [...serverHits];
  await fs.writeFile(receiptPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8').catch(() => {});
  if (browser) await browser.close().catch(() => {});
  await new Promise(resolve => server.close(resolve));
}

if (terminalError) throw terminalError;
console.log(JSON.stringify(report, null, 2));
