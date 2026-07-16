import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

import { compileReturnProductionObservation } from '../app/engine/ash-custodian-return-closure.js';
import { buildSyntheticReturnFixtures } from './ash-custodian-return-fixture.mjs';

const baseUrl = String(process.env.TD613_BASE_URL || process.env.TD613_DEPLOYED_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-custodian-return';
const observedCommit = process.env.TD613_OBSERVED_COMMIT || process.env.GITHUB_SHA || null;

await fs.mkdir(artifactDir, { recursive: true });
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
  await page.goto(`${baseUrl}/dome-world/ash-keep.html?arrival=cleared`, { waitUntil: 'networkidle', timeout: 90000 });
  await page.waitForFunction(() => document.documentElement.dataset.ashCustodianReturnClosure === 'td613.ash.custodian-return-closure/v0.1', null, { timeout: 30000 });
  await page.evaluate(() => {
    document.getElementById('launch')?.classList.add('hidden');
    window.__td613OpenAshWorkspace?.('save');
  });
  await page.waitForSelector('#ashReturnPanel');
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

const desktop = await openSurface({ viewport: { width: 1440, height: 1000 }, label: 'desktop' });
const beforeCases = await indexedCaseCount(desktop.page);
const valid = await runCapsule(desktop.page, fixturePaths.valid, fixtures.passphrase, /sealed; live case untouched/i);
const afterCases = await indexedCaseCount(desktop.page);
if (afterCases !== beforeCases) liveCaseMutations.push({ before: beforeCases, after: afterCases, surface: 'desktop' });
await desktop.page.click('#replayCustodianReturn');
await desktop.page.waitForFunction(() => /REPLAY_VERIFIED/.test(document.getElementById('returnStatus')?.textContent || ''), null, { timeout: 30000 });
const replay = await desktop.page.textContent('#returnReplayReceipt');
const interruptedId = await desktop.page.evaluate(() => window.TD613AshCustodianReturnClosure.seedInterruptedImportForProbe());
const recoveredInterrupted = await desktop.page.evaluate(() => window.TD613AshCustodianReturnClosure.recoverInterruptedImports());
if (recoveredInterrupted < 1) throw new Error(`Interrupted import ${interruptedId} was not recovered.`);
const desktopShot = path.join(artifactDir, 'custodian-return-desktop.png');
await desktop.page.screenshot({ path: desktopShot, fullPage: true });
screenshots.desktop = desktopShot;

const wrong = await openSurface({ viewport: { width: 1280, height: 900 }, label: 'wrong-passphrase' });
const wrongResult = await runCapsule(wrong.page, fixturePaths.valid, 'wrong-passphrase', /authentication failed/i);

const tamper = await openSurface({ viewport: { width: 1280, height: 900 }, label: 'tamper' });
const tamperResult = await runCapsule(tamper.page, fixturePaths.tampered, fixtures.passphrase, /verification held/i);

const partial = await openSurface({ viewport: { width: 1280, height: 900 }, label: 'partial-capsule' });
const partialResult = await runCapsule(partial.page, fixturePaths.partial, fixtures.passphrase, /return-ready bundle is absent/i);

const stale = await openSurface({ viewport: { width: 1280, height: 900 }, label: 'stale-receipt' });
const staleResult = await runCapsule(stale.page, fixturePaths.stale, fixtures.passphrase, /verification held/i);

const mobile = await openSurface({ viewport: { width: 390, height: 844 }, label: 'mobile' });
const mobileResult = await runCapsule(mobile.page, fixturePaths.valid, fixtures.passphrase, /sealed; live case untouched/i);
const mobileShot = path.join(artifactDir, 'custodian-return-mobile.png');
await mobile.page.screenshot({ path: mobileShot, fullPage: true });
screenshots.mobile = mobileShot;

const reduced = await openSurface({ viewport: { width: 1024, height: 768 }, reducedMotion: 'reduce', label: 'reduced-motion' });
const reducedResult = await runCapsule(reduced.page, fixturePaths.valid, fixtures.passphrase, /sealed; live case untouched/i);
const reducedMotionMatched = await reduced.page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
if (!reducedMotionMatched) throw new Error('Reduced-motion context did not report the declared preference.');

const matrix = {
  valid_return: /sealed/.test(valid.status) ? 'PASS' : 'FAIL',
  wrong_passphrase: /WRONG_PASSPHRASE/.test(wrongResult.hold_receipt) ? 'PASS' : 'FAIL',
  tamper: /TAMPER_HOLD/.test(tamperResult.hold_receipt) ? 'PASS' : 'FAIL',
  partial_capsule: /PARTIAL_CAPSULE_HOLD/.test(partialResult.hold_receipt) ? 'PASS' : 'FAIL',
  stale_receipt: /STALE_RECEIPT_HOLD/.test(staleResult.hold_receipt) ? 'PASS' : 'FAIL',
  interrupted_import: recoveredInterrupted >= 1 ? 'PASS' : 'FAIL',
  replay: /REPLAY_VERIFIED/.test(replay || '') ? 'PASS' : 'FAIL'
};
for (const [name, value] of Object.entries(matrix)) if (value !== 'PASS') throw new Error(`Stretch 2 matrix failed: ${name}`);
if (!/sealed/.test(mobileResult.status) || !/sealed/.test(reducedResult.status)) throw new Error('Responsive return interaction failed.');
if (providerRequests.length || recipientTransportRequests.length || liveCaseMutations.length || cinderActions.length) {
  throw new Error('Stretch 2 crossed a prohibited provider, transport, live-case, or Cinder boundary.');
}

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

for (const surface of [desktop, wrong, tamper, partial, stale, mobile, reduced]) await surface.context.close();
await browser.close();

console.log(JSON.stringify({ status: 'PASS', observation, report_sha256: reportSha256, manifest }, null, 2));
