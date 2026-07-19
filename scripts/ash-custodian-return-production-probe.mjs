import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

import { compileReturnProductionObservation } from '../app/engine/ash-custodian-return-closure.js';
import { buildSyntheticReturnFixtures } from './ash-custodian-return-fixture.mjs';

const baseUrl = String(process.env.TD613_BASE_URL || process.env.TD613_DEPLOYED_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-custodian-return';
const observedCommit = process.env.TD613_OBSERVED_COMMIT || process.env.GITHUB_SHA || null;
let probeStage = 'BOOTSTRAP';
let terminalFailureCaptured = false;

await fs.mkdir(artifactDir, { recursive: true });

async function markStage(stage, detail = null) {
  probeStage = stage;
  await fs.writeFile(path.join(artifactDir, 'probe-stage.json'), `${JSON.stringify({
    schema:'td613.ash.custodian-return-probe-stage/v0.1',
    stage,
    detail,
    observed_base_url:baseUrl,
    observed_commit:observedCommit,
    recorded_at:new Date().toISOString()
  }, null, 2)}\n`);
}

async function captureTerminalFailure(error) {
  if (terminalFailureCaptured) return;
  terminalFailureCaptured = true;
  const failure = {
    schema:'td613.ash.custodian-return-probe-failure/v0.1',
    stage:probeStage,
    observed_base_url:baseUrl,
    observed_commit:observedCommit,
    message:error?.message || String(error),
    stack:error?.stack || null,
    recorded_at:new Date().toISOString()
  };
  await fs.writeFile(path.join(artifactDir, 'probe-failure.json'), `${JSON.stringify(failure, null, 2)}\n`);
}

process.on('uncaughtException', error => {
  captureTerminalFailure(error).finally(() => process.exit(1));
});
process.on('unhandledRejection', reason => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  captureTerminalFailure(error).finally(() => process.exit(1));
});

await markStage('FIXTURE_COMPILATION');
const fixtures = await buildSyntheticReturnFixtures();
const fixturePaths = {};
for (const [name, value] of Object.entries({
  valid: fixtures.validCapsule,
  stale: fixtures.staleCapsule,
  tampered: fixtures.tamperedCapsule,
  partial: fixtures.partialCapsule
})) {
  const target = path.join(artifactDir, `${name}-capsule.json`);
  await fs.writeFile(target, `${JSON.stringify(value, null, 2)}\n`);
  fixturePaths[name] = path.resolve(target);
}

const browser = await chromium.launch({ headless: true });
const providerRequests = [];
const recipientTransportRequests = [];
const cinderActions = [];
const liveCaseMutations = [];
const screenshots = {};

async function indexedCaseCount(page) {
  return page.evaluate(async () => {
    const request = indexedDB.open('td613-ash-keep', 2);
    const db = await new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    try {
      if (!db.objectStoreNames.contains('cases')) return 0;
      const count = db.transaction('cases').objectStore('cases').count();
      return await new Promise((resolve, reject) => {
        count.onsuccess = () => resolve(count.result);
        count.onerror = () => reject(count.error);
      });
    } finally { db.close(); }
  });
}

function holdLaunchOverlay(launch) {
  if (!launch) return;
  launch.classList.add('hidden');
  launch.setAttribute('inert', '');
  launch.setAttribute('aria-hidden', 'true');
  launch.style.setProperty('display', 'none', 'important');
  launch.style.setProperty('pointer-events', 'none', 'important');
}

async function openSurface({ viewport, reducedMotion = 'no-preference', label }) {
  const context = await browser.newContext({ viewport, reducedMotion });
  const page = await context.newPage();
  page.on('request', request => {
    const url = request.url();
    const method = request.method();
    const executable = method !== 'GET' && method !== 'HEAD';
    if (executable && /\/api\/hush-generate|provider/i.test(url)) providerRequests.push({ label, method, url });
    if (executable && !/ash-custodian-return/i.test(url)) recipientTransportRequests.push({ label, method, url });
    if (executable && /cinder/i.test(url)) cinderActions.push({ label, method, url });
  });
  await page.goto(`${baseUrl}/dome-world/ash-keep.html?arrival=cleared`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForFunction(() => Boolean(window.__td613AshCacheTransition)
    && Boolean(document.documentElement.dataset.ashCaseCloseRepair)
    && document.documentElement.dataset.ashMembraneReady === 'true'
    && document.documentElement.dataset.ashCustodianReturnClosure === 'td613.ash.custodian-return-closure/v0.1'
    && typeof window.TD613AshCustodianReturnClosure?.recoverInterruptedImports === 'function'
    && Boolean(document.getElementById('ashReturnPanel'))
    && (typeof window.__td613AshPremiumUI?.open === 'function'
      || typeof window.__td613OpenAshWorkspace === 'function'
      || typeof window.__td613AshKeep?.openWorkspace === 'function'), null, { timeout: 60000 });
  await page.evaluate(() => {
    const launch = document.getElementById('launch');
    if (launch) {
      launch.classList.add('hidden');
      launch.setAttribute('inert', '');
      launch.setAttribute('aria-hidden', 'true');
      launch.style.setProperty('display', 'none', 'important');
      launch.style.setProperty('pointer-events', 'none', 'important');
    }
    const open = window.__td613AshPremiumUI?.open
      || window.__td613OpenAshWorkspace
      || window.__td613AshKeep?.openWorkspace;
    if (typeof open !== 'function') throw new Error('Ash Return workspace opener is unavailable.');
    open('save');
  });
  await page.waitForFunction(() => {
    const launch = document.getElementById('launch');
    const workspace = document.getElementById('workspace-save');
    const panel = document.getElementById('ashReturnPanel');
    const open = window.__td613AshPremiumUI?.open
      || window.__td613OpenAshWorkspace
      || window.__td613AshKeep?.openWorkspace;
    if (launch) {
      launch.classList.add('hidden');
      launch.setAttribute('inert', '');
      launch.setAttribute('aria-hidden', 'true');
      launch.style.setProperty('display', 'none', 'important');
      launch.style.setProperty('pointer-events', 'none', 'important');
    }
    if (!workspace?.classList.contains('active') && typeof open === 'function') open('save');
    return getComputedStyle(launch).display === 'none'
      && getComputedStyle(launch).pointerEvents === 'none'
      && launch?.hasAttribute('inert')
      && workspace?.classList.contains('active')
      && panel?.getBoundingClientRect().height > 0;
  }, null, { timeout: 60000, polling: 100 });
  await page.locator('#launch').waitFor({ state: 'hidden', timeout: 30000 });
  await page.locator('#ashReturnPanel').waitFor({ state: 'visible', timeout: 30000 });
  const accessibility = await page.evaluate(() => ({
    live_status: document.getElementById('returnStatus')?.getAttribute('aria-live') === 'polite',
    atomic_status: document.getElementById('returnStatus')?.getAttribute('aria-atomic') === 'true',
    labelled_panel: document.getElementById('ashReturnPanel')?.getAttribute('aria-label') === 'Custodian Return and Anisotropy'
  }));
  const geometry = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
    panel_width: Math.round(document.getElementById('ashReturnPanel')?.getBoundingClientRect().width || 0)
  }));
  if (geometry.scroll > geometry.viewport + 1) throw new Error(`${label} has horizontal overflow: ${geometry.scroll} > ${geometry.viewport}`);
  return { context, page, accessibility, geometry };
}

async function runCapsule(page, filePath, passphrase, expected) {
  await page.setInputFiles('#returnCapsuleFile', filePath);
  await page.fill('#returnPassphrase', passphrase);
  await page.fill('#returnPurpose', 'synthetic-purpose-shaped-reconstruction');
  await page.fill('#returnRefs', fixtures.permittedReferences.join(', '));
  await page.click('#runCustodianReturn');
  await page.waitForFunction(pattern => pattern.test(document.getElementById('returnStatus')?.textContent || ''), expected, { timeout: 30000 });
  return page.evaluate(() => ({
    status: document.getElementById('returnStatus')?.textContent || '',
    return_receipt: document.getElementById('returnReceipt')?.textContent || '',
    anisotropy_receipt: document.getElementById('anisotropyReceipt')?.textContent || '',
    hold_receipt: document.getElementById('returnFailureReceipt')?.textContent || ''
  }));
}

await markStage('DESKTOP_OPEN');
const desktop = await openSurface({ viewport: { width: 1440, height: 1000 }, label: 'desktop' });
await markStage('DESKTOP_VALID_RETURN');
const beforeCases = await indexedCaseCount(desktop.page);
const valid = await runCapsule(desktop.page, fixturePaths.valid, fixtures.passphrase, /sealed; live case untouched/i);
const afterCases = await indexedCaseCount(desktop.page);
if (afterCases !== beforeCases) liveCaseMutations.push({ before: beforeCases, after: afterCases, surface: 'desktop' });
await markStage('DESKTOP_REPLAY');
await desktop.page.click('#replayCustodianReturn');
await desktop.page.waitForFunction(() => /REPLAY_VERIFIED/.test(document.getElementById('returnStatus')?.textContent || ''), null, { timeout: 30000 });
const replay = await desktop.page.textContent('#returnReplayReceipt');
await markStage('DESKTOP_INTERRUPTED_RECOVERY');
const interruptedId = await desktop.page.evaluate(() => window.TD613AshCustodianReturnClosure.seedInterruptedImportForProbe());
const recoveredInterrupted = await desktop.page.evaluate(() => window.TD613AshCustodianReturnClosure.recoverInterruptedImports());
if (recoveredInterrupted < 1) throw new Error(`Interrupted import ${interruptedId} was not recovered.`);
const desktopShot = path.join(artifactDir, 'custodian-return-desktop.png');
await desktop.page.screenshot({ path: desktopShot, fullPage: true });
screenshots.desktop = desktopShot;

await markStage('WRONG_PASSPHRASE_OPEN');
const wrong = await openSurface({ viewport: { width: 1280, height: 900 }, label: 'wrong-passphrase' });
await markStage('WRONG_PASSPHRASE_RUN');
const wrongResult = await runCapsule(wrong.page, fixturePaths.valid, 'wrong-passphrase', /authentication failed/i);

await markStage('TAMPER_OPEN');
const tamper = await openSurface({ viewport: { width: 1280, height: 900 }, label: 'tamper' });
await markStage('TAMPER_RUN');
const tamperResult = await runCapsule(tamper.page, fixturePaths.tampered, fixtures.passphrase, /verification held/i);

await markStage('PARTIAL_CAPSULE_OPEN');
const partial = await openSurface({ viewport: { width: 1280, height: 900 }, label: 'partial-capsule' });
await markStage('PARTIAL_CAPSULE_RUN');
const partialResult = await runCapsule(partial.page, fixturePaths.partial, fixtures.passphrase, /return-ready bundle is absent/i);

await markStage('STALE_RECEIPT_OPEN');
const stale = await openSurface({ viewport: { width: 1280, height: 900 }, label: 'stale-receipt' });
await markStage('STALE_RECEIPT_RUN');
const staleResult = await runCapsule(stale.page, fixturePaths.stale, fixtures.passphrase, /verification held/i);

await markStage('MOBILE_OPEN');
const mobile = await openSurface({ viewport: { width: 390, height: 844 }, label: 'mobile' });
await markStage('MOBILE_VALID_RETURN');
const mobileResult = await runCapsule(mobile.page, fixturePaths.valid, fixtures.passphrase, /sealed; live case untouched/i);
const mobileShot = path.join(artifactDir, 'custodian-return-mobile.png');
await mobile.page.screenshot({ path: mobileShot, fullPage: true });
screenshots.mobile = mobileShot;

await markStage('REDUCED_MOTION_OPEN');
const reduced = await openSurface({ viewport: { width: 1024, height: 768 }, reducedMotion: 'reduce', label: 'reduced-motion' });
await markStage('REDUCED_MOTION_VALID_RETURN');
const reducedResult = await runCapsule(reduced.page, fixturePaths.valid, fixtures.passphrase, /sealed; live case untouched/i);
const reducedMotionMatched = await reduced.page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
if (!reducedMotionMatched) throw new Error('Reduced-motion context did not report the declared preference.');

await markStage('MATRIX_VALIDATION');
const matrix = {
  valid_return: /sealed/.test(valid.status) ? 'PASS' : 'FAIL',
  wrong_passphrase: /WRONG_PASSPHRASE/.test(wrongResult.hold_receipt) ? 'PASS' : 'FAIL',
  tamper: /TAMPER_HOLD/.test(tamperResult.hold_receipt) ? 'PASS' : 'FAIL',
  partial_capsule: /PARTIAL_CAPSULE_HOLD/.test(partialResult.hold_receipt) ? 'PASS' : 'FAIL',
  stale_receipt: /STALE_RECEIPT_HOLD/.test(staleResult.hold_receipt) ? 'PASS' : 'FAIL',
  interrupted_import: recoveredInterrupted >= 1 ? 'PASS' : 'FAIL',
  replay: /REPLAY_VERIFIED/.test(replay || '') ? 'PASS' : 'FAIL'
};
const diagnostics = {
  schema: 'td613.ash.custodian-return-probe-diagnostics/v0.1',
  matrix,
  navigation_readiness: {
    wait_until: 'domcontentloaded',
    cache_transition_required: true,
    case_close_repair_required: true,
    membrane_settled_required: true,
    closure_dataset_required: true,
    return_api_required: true,
    workspace_opener_required: true,
    launch_overlay_inert_required: true,
    launch_overlay_display_none_required: true,
    launch_overlay_pointer_events_none_required: true,
    idempotent_membrane_hold_required: true,
    save_workspace_visible_required: true,
    panel_required: true,
    network_idle_required: false
  },
  statuses: {
    valid: valid.status,
    wrong_passphrase: wrongResult.status,
    tamper: tamperResult.status,
    partial_capsule: partialResult.status,
    stale_receipt: staleResult.status,
    mobile: mobileResult.status,
    reduced_motion: reducedResult.status
  },
  hold_receipts: {
    wrong_passphrase: wrongResult.hold_receipt,
    tamper: tamperResult.hold_receipt,
    partial_capsule: partialResult.hold_receipt,
    stale_receipt: staleResult.hold_receipt
  },
  replay,
  recovered_interrupted_imports: recoveredInterrupted,
  responsive: {
    desktop: desktop.geometry,
    mobile: mobile.geometry,
    reduced_motion: reduced.geometry,
    reduced_motion_matched: reducedMotionMatched
  },
  provider_requests: providerRequests,
  recipient_transport_requests: recipientTransportRequests,
  live_case_mutations: liveCaseMutations,
  cinder_actions: cinderActions
};
await fs.writeFile(path.join(artifactDir, 'probe-diagnostics.json'), `${JSON.stringify(diagnostics, null, 2)}\n`);

for (const [name, value] of Object.entries(matrix)) if (value !== 'PASS') throw new Error(`Stretch 2 matrix failed: ${name}`);
if (!/sealed/.test(mobileResult.status) || !/sealed/.test(reducedResult.status)) throw new Error('Responsive return interaction failed.');
if (providerRequests.length || recipientTransportRequests.length || liveCaseMutations.length || cinderActions.length) {
  throw new Error('Stretch 2 crossed a prohibited provider, transport, live-case, or Cinder boundary.');
}

await markStage('OBSERVATION_COMPILATION');
const observation = await compileReturnProductionObservation({
  observedBaseUrl: baseUrl,
  observedCommit,
  matrix,
  responsiveSurfaces: {
    desktop: { status: 'PASS', geometry: desktop.geometry, screenshot: path.basename(desktopShot) },
    mobile: { status: 'PASS', geometry: mobile.geometry, screenshot: path.basename(mobileShot) },
    reduced_motion: { status: 'PASS', geometry: reduced.geometry, preference_matched: reducedMotionMatched }
  },
  accessibility: {
    desktop: desktop.accessibility,
    mobile: mobile.accessibility,
    reduced_motion: reduced.accessibility
  },
  providerRequests,
  recipientTransportRequests,
  liveCaseMutations,
  cinderActions,
  observations: [
    'Synthetic return-ready Capsule reconstituted through the deployed operator surface.',
    'All seven closure matrix passages were directly exercised.',
    'No production maturity promotion was performed by the observer.'
  ]
});
const reportPath = path.join(artifactDir, 'custodian-return-production-observation.json');
await fs.writeFile(reportPath, `${JSON.stringify(observation, null, 2)}\n`);
const reportBytes = await fs.readFile(reportPath);
const reportSha256 = `sha256:${crypto.createHash('sha256').update(reportBytes).digest('hex')}`;
const manifest = {
  schema: 'td613.ash.custodian-return-evidence-manifest/v0.1',
  observed_base_url: baseUrl,
  observed_commit: observedCommit,
  report: path.basename(reportPath),
  report_sha256: reportSha256,
  screenshots: Object.fromEntries(await Promise.all(Object.entries(screenshots).map(async ([key, filename]) => {
    const bytes = await fs.readFile(filename);
    return [key, { file: path.basename(filename), sha256: `sha256:${crypto.createHash('sha256').update(bytes).digest('hex')}` }];
  }))),
  matrix,
  promotion_authorized: false
};
await fs.writeFile(path.join(artifactDir, 'evidence-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

await markStage('COMPLETE');
for (const surface of [desktop, wrong, tamper, partial, stale, mobile, reduced]) await surface.context.close();
await browser.close();

console.log(JSON.stringify({ status: 'PASS', observation, report_sha256: reportSha256, manifest }, null, 2));
