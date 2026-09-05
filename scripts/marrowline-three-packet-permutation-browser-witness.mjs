import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

import { renderMarrowlineCarryCaseHtml } from './marrowline-pocket-hosted-carry-case-builder.mjs';
import {
  MARROWLINE_THREE_PACKET_PERMUTATIONS,
  MARROWLINE_THREE_PACKET_SPECS,
  buildMarrowlineThreePacketManifest,
  canonicalPermutationSurfaceJson,
  runMarrowlineThreePacketPermutationAssay
} from './marrowline-three-packet-permutation-assay.mjs';

const browserName = String(process.env.TD613_BROWSER || 'chromium').trim().toLowerCase();
const engine = { chromium, firefox, webkit }[browserName];
if (!engine) throw new Error(`Unsupported TD613_BROWSER: ${browserName}`);

const EXPECTED_PARENT_ARTIFACT_SHA256 = 'd747760c4a6b55476e161a300f5f0d2530fa127b85332b0924f64c315950aee5';
const EXPECTED_PARENT_ARTIFACT_BYTES = 12471;
const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/marrowline-three-packet-permutation');
const artifactName = 'marrowline-pocket-hosted-carry-case-v0.1.html';
const html = renderMarrowlineCarryCaseHtml();
const artifactSha256 = crypto.createHash('sha256').update(html, 'utf8').digest('hex');
const receiptPath = path.join(artifactDir, `marrowline-three-packet-permutation-v0.1-${browserName}-receipt.json`);
const staticAssay = runMarrowlineThreePacketPermutationAssay();
const SURFACE_KEYS = ['source_packet', 'carry_case', 'return_envelope', 'combined_transport'];

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

function forbiddenPermutationPaths(value, pathName = 'transport', into = []) {
  const forbidden = new Set([
    'sequence', 'sequence_index', 'schedule', 'schedule_index', 'step', 'step_index',
    'position', 'position_index', 'permutation', 'permutation_index',
    'history', 'route_history', 'journey', 'journey_history', 'itinerary', 'boundary_history',
    'prior_boundary', 'previous_boundary', 'prior_packet', 'previous_packet', 'prior_rule', 'previous_rule',
    'prior_action', 'previous_action', 'prior_schedule', 'previous_schedule',
    'prior_permutation', 'previous_permutation', 'receipt_chain', 'prior_receipt', 'previous_receipt',
    'receipt_id', 'nonce', 'timestamp'
  ]);
  if (Array.isArray(value)) {
    value.forEach((item, index) => forbiddenPermutationPaths(item, `${pathName}[${index}]`, into));
    return into;
  }
  if (!value || typeof value !== 'object') return into;
  for (const [key, child] of Object.entries(value)) {
    if (forbidden.has(String(key).toLowerCase())) into.push(`${pathName}.${key}`);
    forbiddenPermutationPaths(child, `${pathName}.${key}`, into);
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
  `Permutation assay must reuse exact earned Carry Case bytes; observed ${artifactSha256}.`);
assert(Buffer.byteLength(html, 'utf8') === EXPECTED_PARENT_ARTIFACT_BYTES,
  `Permutation assay parent artifact byte length drifted: ${Buffer.byteLength(html, 'utf8')}.`);

for (const forbidden of [
  '"permutation_index"', '"position_index"', '"schedule_index"', '"step_index"',
  '"prior_packet"', '"previous_packet"', '"prior_rule"', '"previous_rule"',
  '"prior_action"', '"previous_action"', '"prior_schedule"', '"previous_schedule"',
  '"prior_permutation"', '"previous_permutation"', '"route_history"', '"journey_history"',
  '"boundary_history"', '"receipt_chain"', 'localStorage', 'sessionStorage', 'indexedDB',
  'BroadcastChannel', 'serviceWorker', 'caches.open'
]) {
  assert(!html.includes(forbidden), `Exact Carry Case artifact contains a permutation/persistence surface: ${forbidden}`);
}

await fs.mkdir(artifactDir, { recursive: true });
await fs.writeFile(path.join(artifactDir, artifactName), html, 'utf8');

const serverHits = [];
const server = http.createServer((request, response) => {
  serverHits.push({ method: request.method, url: request.url });
  if (request.method === 'GET' && request.url === `/${artifactName}`) {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
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
if (!address || typeof address === 'string') throw new Error('Permutation witness server did not bind.');
const url = `http://127.0.0.1:${address.port}/${artifactName}`;

const report = {
  schema: 'td613.marrowline.three-packet-permutation-browser-witness/v0.1-local-only',
  browser: browserName,
  status: 'RUNNING',
  assay_local_only: true,
  artifact: {
    name: artifactName,
    sha256: artifactSha256,
    bytes: Buffer.byteLength(html, 'utf8'),
    exact_parent_artifact_reused: true,
    product_source_bytes_mutated: false
  },
  instrumentation: {
    non_a_manifest_substitution: 'page-local-single-use-json-parse-intercept',
    repository_source_mutated: false,
    served_html_mutated: false,
    browser_storage_used_for_instrumentation: false
  },
  schedules: [],
  convergence: {},
  network: { document_requests: 0, unexpected_requests: [], server_hits: [] },
  errors: { console: [], page: [], browser_chrome: [] },
  authority: {
    release_authority: false,
    human_closure_required: true,
    provider_call_performed: false,
    production_mutation: false
  },
  claim_ceiling: 'bounded-three-packet-all-six-permutation-serialized-position-browser-noninterference-only',
  seal: '⟐'
};

let browser;
let terminalError = null;
try {
  browser = await engine.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'no-preference' });
  const requests = [];
  context.on('request', request => requests.push(request.url()));

  for (const [permutationIndex, schedule] of MARROWLINE_THREE_PACKET_PERMUTATIONS.entries()) {
    const scheduleReport = {
      assay_permutation_index: permutationIndex + 1,
      schedule: [...schedule],
      one_live_browser_context: true,
      steps: []
    };

    for (const [positionIndex, label] of schedule.entries()) {
      const page = await context.newPage();
      page.setDefaultTimeout(30000);
      page.on('console', message => {
        if (message.type() !== 'error') return;
        if (isFirefoxBrowserChromeFaviconCspDiagnostic(message)) {
          report.errors.browser_chrome.push({
            permutation: permutationIndex + 1,
            position: positionIndex + 1,
            text: message.text(),
            location: message.location()?.url || null
          });
          return;
        }
        report.errors.console.push({ permutation: permutationIndex + 1, position: positionIndex + 1, text: message.text() });
      });
      page.on('pageerror', error => report.errors.page.push({
        permutation: permutationIndex + 1, position: positionIndex + 1, text: error.message
      }));

      let manifestSubstituted = false;
      if (label !== 'A') {
        const replacementManifest = buildMarrowlineThreePacketManifest(label);
        await page.addInitScript(({ replacement }) => {
          const nativeParse = JSON.parse.bind(JSON);
          let substituted = false;
          JSON.parse = function td613PermutationAssayParse(text, reviver) {
            const parsed = nativeParse(text, reviver);
            if (!substituted
                && parsed?.schema === 'td613.marrowline.pocket-hosted-carry-case-artifact/v0.1'
                && parsed?.source_packet
                && parsed?.carry_case) {
              substituted = true;
              JSON.parse = nativeParse;
              return replacement;
            }
            return parsed;
          };
        }, { replacement: replacementManifest });
        manifestSubstituted = true;
      }

      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('[data-carry-case]');

      const boot = await page.evaluate(() => ({
        state: window.__TD613_MARROWLINE_CARRY_CASE__?.getState?.() || null,
        rule_id: window.__TD613_MARROWLINE_CARRY_CASE__?.manifest?.source_packet?.portable_findings?.[0]?.rule_id || null,
        storage: {
          local: window.localStorage.length,
          session: window.sessionStorage.length,
          cookie: document.cookie
        },
        csp: document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content || null
      }));
      const expectedRule = MARROWLINE_THREE_PACKET_SPECS[label].rule_id;
      assert(boot.state?.stage === 'PACKED', `${schedule.join('→')} position ${positionIndex + 1} did not boot PACKED.`);
      assert(boot.rule_id === expectedRule,
        `${schedule.join('→')} position ${positionIndex + 1} loaded wrong canonical rule: ${boot.rule_id}.`);
      assert(boot.state?.release_authority === false && boot.state?.human_closure_required === true,
        `${schedule.join('→')} position ${positionIndex + 1} widened boot authority.`);
      assert(boot.storage.local === 0 && boot.storage.session === 0 && boot.storage.cookie === '',
        `${schedule.join('→')} position ${positionIndex + 1} inherited browser persistence.`);
      assert(/connect-src 'none'/.test(boot.csp || ''),
        `${schedule.join('→')} position ${positionIndex + 1} lost connection-denying CSP.`);

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
        `${schedule.join('→')} position ${positionIndex + 1} did not complete matching revalidation.`);
      assert(observed.return_result.candidate_trusted === false
        && observed.return_result.release_authority === false
        && observed.return_result.human_closure_required === true
        && observed.return_result.local_binding_retained === true,
      `${schedule.join('→')} position ${positionIndex + 1} widened return authority or lost retained-local binding.`);
      assert(observed.network_audit.attempts === 0,
        `${schedule.join('→')} position ${positionIndex + 1} attempted page-owned networking.`);
      assert(observed.storage.local === 0 && observed.storage.session === 0 && observed.storage.cookie === '',
        `${schedule.join('→')} position ${positionIndex + 1} accumulated browser persistence.`);

      const transport = {
        source_packet: observed.source_packet,
        carry_case: observed.carry_case,
        return_envelope: observed.return_envelope
      };
      const permutationPaths = forbiddenPermutationPaths(transport);
      assert(permutationPaths.length === 0,
        `${schedule.join('→')} position ${positionIndex + 1} accumulated permutation state: ${permutationPaths.join(', ')}`);
      assert(!/sha256:/i.test(canonicalPermutationSurfaceJson(transport)),
        `${schedule.join('→')} position ${positionIndex + 1} accumulated a digest carrier.`);

      const stepSurfaces = {
        source_packet: describeSurface(observed.source_packet),
        carry_case: describeSurface(observed.carry_case),
        return_envelope: describeSurface(observed.return_envelope),
        combined_transport: describeSurface(transport)
      };
      for (const key of SURFACE_KEYS) {
        assert(stepSurfaces[key].sha256 === staticAssay.baseline[label][key].sha256,
          `${schedule.join('→')} position ${positionIndex + 1} ${key} diverged from ${label} canonical baseline.`);
        assert(stepSurfaces[key].bytes === staticAssay.baseline[label][key].bytes,
          `${schedule.join('→')} position ${positionIndex + 1} ${key} byte length diverged from ${label} canonical baseline.`);
      }

      scheduleReport.steps.push({
        assay_position_index: positionIndex + 1,
        assay_packet_label: label,
        manifest_substituted_for_assay: manifestSubstituted,
        surfaces: stepSurfaces,
        status: observed.state.return_status,
        storage_empty_before_and_after: true,
        page_owned_network_attempts: observed.network_audit.attempts,
        forbidden_permutation_paths: permutationPaths
      });
      await page.close();
    }
    report.schedules.push(scheduleReport);
  }

  const positionCoverage = { A: [0, 0, 0], B: [0, 0, 0], C: [0, 0, 0] };
  for (const schedule of report.schedules) {
    for (const step of schedule.steps) positionCoverage[step.assay_packet_label][step.assay_position_index - 1] += 1;
  }
  for (const label of ['A', 'B', 'C']) {
    assert(positionCoverage[label].every(count => count === 2), `${label} browser position coverage drifted.`);
  }

  for (const [left, right] of [['A', 'B'], ['A', 'C'], ['B', 'C']]) {
    for (const key of SURFACE_KEYS) {
      assert(staticAssay.baseline[left][key].sha256 !== staticAssay.baseline[right][key].sha256,
        `Browser witness sensitivity found ${left}/${right} ${key} collapse.`);
    }
  }

  const documentRequests = requests.filter(requestUrl => requestUrl === url);
  const unexpectedRequests = requests.filter(requestUrl => requestUrl !== url);
  report.network.document_requests = documentRequests.length;
  report.network.unexpected_requests = unexpectedRequests;
  report.network.server_hits = serverHits;
  assert(documentRequests.length === 18, `Expected exactly 18 same-artifact document requests, observed ${documentRequests.length}.`);
  assert(unexpectedRequests.length === 0, `Unexpected browser requests: ${unexpectedRequests.join(', ')}`);
  assert(serverHits.length === 18 && serverHits.every(hit => hit.method === 'GET' && hit.url === `/${artifactName}`),
    `Unexpected local-server request pattern: ${JSON.stringify(serverHits)}`);

  assert(report.errors.console.length === 0, `Console errors escaped classifier: ${JSON.stringify(report.errors.console)}`);
  assert(report.errors.page.length === 0, `Page errors observed: ${JSON.stringify(report.errors.page)}`);
  if (browserName === 'firefox') {
    assert(report.errors.browser_chrome.length <= 18,
      `Firefox browser-chrome diagnostic count exceeded document loads: ${report.errors.browser_chrome.length}`);
  } else {
    assert(report.errors.browser_chrome.length === 0, `${browserName} emitted unexpected browser-chrome diagnostics.`);
  }

  report.convergence = {
    permutation_count: 6,
    observed_step_count: 18,
    one_browser_context_across_all_permutations: true,
    every_occurrence_matches_static_packet_baseline: report.schedules.every(schedule => schedule.steps.every(step => {
      const baseline = staticAssay.baseline[step.assay_packet_label];
      return SURFACE_KEYS.every(key => step.surfaces[key].sha256 === baseline[key].sha256
        && step.surfaces[key].bytes === baseline[key].bytes);
    })),
    packets_pairwise_distinguishable: true,
    shared_remove_action_did_not_collapse_identity:
      staticAssay.baseline.B.return_envelope.sha256 !== staticAssay.baseline.C.return_envelope.sha256,
    position_coverage: positionCoverage,
    portable_permutation_index: false,
    portable_position_index: false,
    prior_packet_identity_carried: false,
    prior_permutation_history_carried: false,
    route_history_carried: false,
    browser_persistence_accumulated: false,
    page_owned_network_attempts: 0
  };
  assert(report.convergence.every_occurrence_matches_static_packet_baseline === true,
    'One or more browser packet occurrences drifted from static canonical baseline.');
  assert(report.convergence.shared_remove_action_did_not_collapse_identity === true,
    'B/C shared REMOVE action collapsed rule-bound identity.');

  report.status = 'PASS';
} catch (error) {
  terminalError = error;
  report.status = 'FAIL';
  report.terminal_error = { name: error?.name || 'Error', message: error?.message || String(error) };
} finally {
  if (browser) await browser.close().catch(() => {});
  await new Promise(resolve => server.close(resolve));
  await fs.writeFile(receiptPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
}

if (terminalError) throw terminalError;
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
