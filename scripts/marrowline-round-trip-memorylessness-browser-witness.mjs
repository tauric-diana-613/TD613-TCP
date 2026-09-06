import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

import { renderMarrowlineCarryCaseHtml } from './marrowline-pocket-hosted-carry-case-builder.mjs';
import {
  canonicalSurfaceJson,
  runMarrowlineRoundTripMemorylessnessAssay
} from './marrowline-round-trip-memorylessness-assay.mjs';

const browserName = String(process.env.TD613_BROWSER || 'chromium').trim().toLowerCase();
const engine = { chromium, firefox, webkit }[browserName];
if (!engine) throw new Error(`Unsupported TD613_BROWSER: ${browserName}`);

const EXPECTED_PARENT_ARTIFACT_SHA256 = 'd747760c4a6b55476e161a300f5f0d2530fa127b85332b0924f64c315950aee5';
const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/marrowline-round-trip-memorylessness');
const artifactName = 'marrowline-pocket-hosted-carry-case-v0.1.html';
const html = renderMarrowlineCarryCaseHtml();
const artifactSha256 = crypto.createHash('sha256').update(html, 'utf8').digest('hex');
const receiptPath = path.join(artifactDir, `marrowline-round-trip-memorylessness-v0.1-${browserName}-receipt.json`);
const staticAssay = runMarrowlineRoundTripMemorylessnessAssay();

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

function describeSurface(value) {
  const json = JSON.stringify(stable(value));
  return {
    sha256: crypto.createHash('sha256').update(json, 'utf8').digest('hex'),
    bytes: Buffer.byteLength(json, 'utf8')
  };
}

function forbiddenHistoryPaths(value, pathName = 'transport', into = []) {
  const forbidden = new Set([
    'cycle', 'cycle_count', 'cycle_index', 'history', 'route_history', 'journey', 'journey_history',
    'itinerary', 'boundary_history', 'prior_boundary', 'previous_boundary', 'receipt_chain',
    'prior_receipt', 'previous_receipt', 'receipt_id', 'nonce', 'timestamp'
  ]);
  if (Array.isArray(value)) {
    value.forEach((item, index) => forbiddenHistoryPaths(item, `${pathName}[${index}]`, into));
    return into;
  }
  if (!value || typeof value !== 'object') return into;
  for (const [key, child] of Object.entries(value)) {
    if (forbidden.has(String(key).toLowerCase())) into.push(`${pathName}.${key}`);
    forbiddenHistoryPaths(child, `${pathName}.${key}`, into);
  }
  return into;
}

function isFirefoxBrowserChromeFaviconCspDiagnostic(message) {
  if (browserName !== 'firefox' || message.type() !== 'error') return false;
  const text = String(message.text() || '');
  const location = String(message.location()?.url || '');
  return text.includes('Content-Security-Policy')
    && text.includes('/favicon.ico')
    && (location.includes('resource:///modules/FaviconLoader.sys.mjs') || text.includes('FaviconLoader.sys.mjs'));
}

assert(artifactSha256 === EXPECTED_PARENT_ARTIFACT_SHA256,
  `Round-trip assay must reuse exact #1049 Carry Case bytes; observed ${artifactSha256}.`);
assert(Buffer.byteLength(html, 'utf8') === 12471,
  `Round-trip assay parent artifact byte length drifted: ${Buffer.byteLength(html, 'utf8')}.`);

for (const forbidden of [
  '"cycle_count"',
  '"cycle_index"',
  '"route_history"',
  '"journey_history"',
  '"boundary_history"',
  '"receipt_chain"',
  '"prior_boundary"',
  '"previous_boundary"',
  '"prior_receipt"',
  '"previous_receipt"',
  '"receipt_id"',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'BroadcastChannel',
  'serviceWorker',
  'caches.open'
]) {
  assert(!html.includes(forbidden), `Exact Carry Case artifact contains a persistence/history surface: ${forbidden}`);
}

await fs.mkdir(artifactDir, { recursive: true });
await fs.writeFile(path.join(artifactDir, artifactName), html, 'utf8');

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
if (!address || typeof address === 'string') throw new Error('Round-trip witness server did not bind.');
const url = `http://127.0.0.1:${address.port}/${artifactName}`;

const report = {
  schema: 'td613.marrowline.round-trip-memorylessness-browser-witness/v0.1-local-only',
  browser: browserName,
  status: 'RUNNING',
  assay_local_only: true,
  artifact: {
    name: artifactName,
    sha256: artifactSha256,
    bytes: Buffer.byteLength(html, 'utf8'),
    exact_parent_artifact_reused: true
  },
  cycles: [],
  convergence: {},
  network: { document_requests: 0, unexpected_requests: [], server_hits: [] },
  errors: { console: [], page: [], browser_chrome: [] },
  authority: {
    release_authority: false,
    human_closure_required: true,
    provider_call_performed: false,
    production_mutation: false
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

  for (let index = 0; index < 3; index += 1) {
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('[data-carry-case]');

    const boot = await page.evaluate(() => ({
      state: window.__TD613_MARROWLINE_CARRY_CASE__?.getState?.() || null,
      storage: {
        local: window.localStorage.length,
        session: window.sessionStorage.length,
        cookie: document.cookie
      },
      csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || null
    }));
    assert(boot.state?.stage === 'PACKED', `cycle ${index + 1} did not boot PACKED.`);
    assert(boot.state?.release_authority === false && boot.state?.human_closure_required === true,
      `cycle ${index + 1} widened boot authority.`);
    assert(boot.storage.local === 0 && boot.storage.session === 0 && boot.storage.cookie === '',
      `cycle ${index + 1} inherited browser persistence before transport.`);
    assert(/connect-src 'none'/.test(boot.csp || ''), `cycle ${index + 1} lost connection-denying CSP.`);

    await page.click('#checkCase');
    await page.click('#openHosted');
    await page.click('#returnMatch');

    const observed = await page.evaluate(() => ({
      state: window.__TD613_MARROWLINE_CARRY_CASE__.getState(),
      source_packet: window.__TD613_MARROWLINE_CARRY_CASE__.manifest.source_packet,
      carry_case: window.__TD613_MARROWLINE_CARRY_CASE__.manifest.carry_case,
      return_envelope: window.__TD613_MARROWLINE_CARRY_CASE__.manifest.matching_return.envelope,
      return_result: window.__TD613_MARROWLINE_CARRY_CASE__.manifest.matching_return.result,
      network_audit: window.__TD613_MARROWLINE_CARRY_CASE__.networkAudit,
      storage: {
        local: window.localStorage.length,
        session: window.sessionStorage.length,
        cookie: document.cookie
      }
    }));

    assert(observed.state.stage === 'RETURN' && observed.state.return_status === 'PRESENT_TO_HUMAN',
      `cycle ${index + 1} did not complete matching Pocket revalidation.`);
    assert(observed.return_result.candidate_trusted === false
      && observed.return_result.release_authority === false
      && observed.return_result.human_closure_required === true
      && observed.return_result.local_binding_retained === true,
      `cycle ${index + 1} widened return authority or lost local binding retention.`);
    assert(observed.network_audit.attempts === 0, `cycle ${index + 1} attempted page-owned networking.`);
    assert(observed.storage.local === 0 && observed.storage.session === 0 && observed.storage.cookie === '',
      `cycle ${index + 1} accumulated browser persistence after transport.`);

    const transport = {
      source_packet: observed.source_packet,
      carry_case: observed.carry_case,
      return_envelope: observed.return_envelope
    };
    const historyPaths = forbiddenHistoryPaths(transport);
    assert(historyPaths.length === 0, `cycle ${index + 1} accumulated portable history: ${historyPaths.join(', ')}`);
    assert(!/sha256:/i.test(canonicalSurfaceJson(transport)), `cycle ${index + 1} accumulated a digest carrier.`);

    const surfaces = {
      source_packet: describeSurface(observed.source_packet),
      carry_case: describeSurface(observed.carry_case),
      return_envelope: describeSurface(observed.return_envelope),
      combined_transport: describeSurface(transport)
    };
    for (const key of Object.keys(surfaces)) {
      assert(surfaces[key].sha256 === staticAssay.canonical_surface[key].sha256,
        `cycle ${index + 1} ${key} diverged from static canonical compiler surface.`);
      assert(surfaces[key].bytes === staticAssay.canonical_surface[key].bytes,
        `cycle ${index + 1} ${key} byte length diverged from static canonical compiler surface.`);
    }

    report.cycles.push({
      assay_cycle_index: index + 1,
      assay_local_only: true,
      surfaces,
      status: observed.state.return_status,
      storage_empty_before_and_after: true,
      page_owned_network_attempts: observed.network_audit.attempts,
      forbidden_history_paths: historyPaths
    });
  }

  const same = key => report.cycles.every(cycle => cycle.surfaces[key].sha256 === report.cycles[0].surfaces[key].sha256
    && cycle.surfaces[key].bytes === report.cycles[0].surfaces[key].bytes);
  report.convergence = {
    cycle_count: 3,
    packet_byte_identical: same('source_packet'),
    carry_case_byte_identical: same('carry_case'),
    return_envelope_byte_identical: same('return_envelope'),
    combined_transport_byte_identical: same('combined_transport'),
    portable_cycle_index: false,
    route_history_carried: false,
    browser_persistence_accumulated: false
  };
  assert(Object.entries(report.convergence)
    .filter(([key]) => !['cycle_count', 'portable_cycle_index', 'route_history_carried', 'browser_persistence_accumulated'].includes(key))
    .every(([, value]) => value === true), 'Three-cycle browser transport did not converge byte-identically.');
  assert(report.convergence.portable_cycle_index === false
    && report.convergence.route_history_carried === false
    && report.convergence.browser_persistence_accumulated === false,
    'Three-cycle browser witness accumulated history state.');

  const unexpectedRequests = requests.filter(requestUrl => requestUrl !== url);
  report.network.document_requests = requests.filter(requestUrl => requestUrl === url).length;
  report.network.unexpected_requests = unexpectedRequests;
  report.network.server_hits = [...serverHits];
  assert(report.network.document_requests === 3, `Expected exactly three same-artifact document loads; observed ${report.network.document_requests}.`);
  assert(unexpectedRequests.length === 0, `Round-trip witness emitted unexpected requests: ${JSON.stringify(unexpectedRequests)}`);
  assert(serverHits.length === 3 && serverHits.every(hit => hit.method === 'GET' && hit.url === `/${artifactName}`),
    `Round-trip witness server observed unexpected requests: ${JSON.stringify(serverHits)}`);
  assert(report.errors.console.length === 0, `Round-trip document console errors: ${JSON.stringify(report.errors.console)}`);
  assert(report.errors.page.length === 0, `Round-trip page errors: ${JSON.stringify(report.errors.page)}`);
  if (browserName === 'firefox') {
    assert(report.errors.browser_chrome.length <= 3, `Firefox emitted excess classified browser-chrome diagnostics: ${report.errors.browser_chrome.length}`);
  } else {
    assert(report.errors.browser_chrome.length === 0, `${browserName} emitted unexpected browser-chrome diagnostics.`);
  }

  report.status = 'PASS';
  await context.close();
} catch (error) {
  terminalError = error;
  report.status = 'FAIL';
  report.failure = String(error?.stack || error);
} finally {
  if (browser) await browser.close().catch(() => {});
  await new Promise(resolve => server.close(resolve));
  await fs.writeFile(receiptPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

process.stdout.write(`${JSON.stringify(report)}\n`);
if (terminalError) throw terminalError;
