import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

const base = (process.env.TD613_BASE_URL || process.argv[2] || 'https://td613.com').replace(/\/$/, '');
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-lifecycle-deployed-observation';
const thresholdUrl = `${base}/dome-world/ash-threshold.html`;
const keepUrl = `${base}/dome-world/ash-keep.html`;
const DB_NAME = 'td613-ash-keep';
const READINESS_KEY = 'td613:ash-threshold:readiness:v0.1';
const SYNTHETIC_ARTIFACT = 'TD613 ASH LIFECYCLE PROBE — synthetic local artifact; no recipient route.';
const LIFECYCLE_ROUTE = Object.freeze([
  'ARRIVAL_UNPERSISTED',
  'READINESS_OBSERVED',
  'CUSTODY_ROOT_VERIFIED',
  'CASE_BOUND',
  'REBUILD_ELIGIBLE',
  'RELEASE_ELIGIBLE',
  'CONTINUITY_SEALED'
]);
const ALLOWED_LOCAL_KEYS = new Set([
  'td613.ash-keep.current-case',
  'td613.ash-keep.preferences',
  'td613:ash-keep:lifecycle:v0.1',
  'td613:ash-custody:receipts:v0.8'
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}
function sha256(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}
async function digestFile(file) {
  return sha256(await fs.readFile(file));
}
async function waitForText(page, selector, pattern, timeout = 45_000) {
  await page.waitForFunction(
    ({ selector, source, flags }) => new RegExp(source, flags).test(document.querySelector(selector)?.textContent || ''),
    { selector, source: pattern.source, flags: pattern.flags },
    { timeout }
  );
  return page.locator(selector).textContent();
}
async function waitForLifecycle(page, states, timeout = 60_000) {
  const allowed = Array.isArray(states) ? states : [states];
  await page.waitForFunction(values => values.includes(document.body.dataset.ashLifecycle || ''), allowed, { timeout });
  return page.evaluate(() => document.body.dataset.ashLifecycle || null);
}
async function openWorkspace(page, name) {
  await page.locator(`.work-tab[data-workspace="${name}"]`).click();
  await page.locator(`#workspace-${name}`).waitFor({ state: 'visible' });
}
async function databaseSnapshot(page) {
  return page.evaluate(async ({ dbName }) => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const output = {};
    for (const store of [...db.objectStoreNames]) {
      output[store] = await new Promise((resolve, reject) => {
        const request = db.transaction(store, 'readonly').objectStore(store).getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    }
    db.close();
    return output;
  }, { dbName: DB_NAME });
}
async function layoutReceipt(page) {
  return page.evaluate(() => {
    function scrollLane(node) {
      let current = node.parentElement;
      while (current) {
        const style = getComputedStyle(current);
        if (/(auto|scroll)/.test(style.overflowX) && current.scrollWidth > current.clientWidth + 1) return true;
        current = current.parentElement;
      }
      return false;
    }
    const controls = [...document.querySelectorAll('button, input, select, textarea, a')]
      .filter(node => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      });
    const clipped = controls
      .filter(node => {
        const rect = node.getBoundingClientRect();
        return (rect.left < -1 || rect.right > innerWidth + 1) && !scrollLane(node);
      })
      .map(node => node.id || node.textContent?.trim().slice(0, 40) || node.tagName);
    return {
      width: innerWidth,
      height: innerHeight,
      document_width: document.documentElement.scrollWidth,
      horizontal_overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      unreachable_controls: clipped,
      lifecycle_state: document.body.dataset.ashLifecycle || null,
      selected_workspace: document.querySelector('.work-tab[aria-selected="true"]')?.dataset.workspace || null,
      reduced_motion: matchMedia('(prefers-reduced-motion: reduce)').matches
    };
  });
}
async function settleViewport(page, width, height) {
  await page.setViewportSize({ width, height });
  await page.waitForFunction(expected => innerWidth === expected.width && innerHeight === expected.height, { width, height });
  await page.waitForTimeout(250);
}

await fs.mkdir(artifactDir, { recursive: true });
const syntheticPath = path.join(artifactDir, 'synthetic-custody-root.txt');
await fs.writeFile(syntheticPath, `${SYNTHETIC_ARTIFACT}\n`);

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  locale: 'en-US',
  reducedMotion: 'reduce',
  acceptDownloads: true
});
const page = await context.newPage();
const requests = [];
const consoleErrors = [];
page.on('request', request => requests.push({
  method: request.method(),
  url: request.url(),
  resource_type: request.resourceType(),
  post_data: request.postData() || null
}));
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', error => consoleErrors.push(error.message));

const report = {
  schema: 'td613.ash.lifecycle-production-observation/v0.1',
  status: 'RUNNING',
  promotion_authorized: false,
  base_url: base,
  threshold_url: thresholdUrl,
  keep_url: keepUrl,
  browser: 'chromium-headless',
  source_status: base.includes('localhost') || base.includes('127.0.0.1') ? 'LOCAL_VALIDATION' : 'DEPLOYED_OBSERVATION',
  threshold: null,
  readiness: null,
  pre_custody_hold: null,
  custody: null,
  case_binding: null,
  rebuild: null,
  draft_review_release: null,
  continuity: null,
  desktop: null,
  mobile_portrait: null,
  mobile_landscape: null,
  storage: null,
  network: null,
  declared_route: LIFECYCLE_ROUTE,
  non_claims: [
    'readiness is not custody',
    'custody is not authenticity',
    'case binding is not truth',
    'rebuild eligibility is not release authority',
    'continuity is not transport'
  ],
  evidence_files: {},
  console_errors: consoleErrors,
  error: null
};

async function persistReport() {
  await fs.writeFile(path.join(artifactDir, 'ash-lifecycle-production-closure.json'), `${JSON.stringify(report, null, 2)}\n`);
}

try {
  await page.goto(thresholdUrl, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.locator('#ashTitle').waitFor({ state: 'visible' });
  assert((await page.title()).includes('TD613 Ash · Threshold'), 'Ash threshold title was not observed');
  const thresholdLocalKeys = await page.evaluate(() => Object.keys(localStorage));
  const thresholdSessionKeys = await page.evaluate(() => Object.keys(sessionStorage));
  assert(thresholdLocalKeys.length === 0, 'Threshold wrote localStorage before operator action');
  assert(thresholdSessionKeys.length === 0, 'Threshold wrote sessionStorage before operator action');

  await page.locator('.seal[data-step="2"]').click();
  await waitForText(page, '#riteStatus', /order broke/i);
  assert(await page.locator('#enterKeep').isDisabled(), 'Broken ritual order enabled entry');
  for (const step of [1, 2, 3]) await page.locator(`.seal[data-step="${step}"]`).click();
  assert(!(await page.locator('#enterKeep').isDisabled()), 'Correct threshold sequence did not enable entry');
  const thresholdShot = path.join(artifactDir, 'ash-threshold-cleared.png');
  await page.screenshot({ path: thresholdShot, fullPage: true });

  await Promise.all([
    page.waitForURL(/\/dome-world\/ash-keep\.html\?arrival=cleared/, { timeout: 30_000 }),
    page.locator('#enterKeep').click()
  ]);
  await page.locator('meta[name="ash-lifecycle"][content="v0.1"]').waitFor({ state: 'attached' });
  await page.locator('#workspace-custody').waitFor({ state: 'attached' });
  const readiness = await page.evaluate(key => JSON.parse(sessionStorage.getItem(key) || 'null'), READINESS_KEY);
  assert(readiness?.state === 'READINESS_OBSERVED', 'Threshold did not carry a readiness receipt');
  assert(readiness.raw_content_accepted === false && readiness.raw_content_persisted === false, 'Readiness accepted or persisted raw content');
  assert(readiness.transport_performed === false && readiness.readiness_is_custody === false, 'Readiness crossed its custody/transport boundary');
  report.threshold = { wrong_order_reset: true, correct_order_cleared: true, local_storage_before_entry: thresholdLocalKeys, session_storage_before_entry: thresholdSessionKeys };
  report.readiness = readiness;

  await page.locator('#startDemo').click();
  await page.locator('#launch').waitFor({ state: 'hidden' });
  await waitForText(page, '#caseTitle', /Glasshouse Archive inquiry/);
  await waitForLifecycle(page, 'READINESS_OBSERVED');
  const beforeBinding = await databaseSnapshot(page);
  const pointerBefore = await page.evaluate(() => localStorage.getItem('td613.ash-keep.current-case'));
  const preCase = beforeBinding.cases.find(item => item.case_id === pointerBefore);
  assert(preCase, 'Demo case was not created before custody binding');

  await page.locator('.work-tab[data-workspace="test"]').click();
  await page.locator('#workspace-custody').waitFor({ state: 'visible' });
  const heldMessage = await waitForText(page, '#custodyStatus', /Test held/i);
  report.pre_custody_hold = { test_workspace_held: true, message: heldMessage, state: await page.evaluate(() => document.body.dataset.ashLifecycle) };

  await page.locator('#lifeSourceLabel').fill('Synthetic lifecycle custody root');
  await page.locator('#lifePathRef').fill('probe://synthetic/ash-lifecycle');
  await page.locator('#lifeSourceEnvironment').selectOption('local_file');
  await page.locator('#lifeCredentialType').selectOption('local-possession');
  await page.locator('#lifeFile').setInputFiles(syntheticPath);
  await waitForText(page, '#lifeCommitmentStatus', /L1_BROWSER_LOCAL_ARTIFACT_DIGEST.*sha256:/i, 60_000);
  const postsBeforeCustody = requests.filter(item => item.method === 'POST').length;
  await page.locator('#registerCustodyRoot').click();
  await waitForLifecycle(page, 'CASE_BOUND', 90_000);
  const postsAfterCustody = requests.filter(item => item.method === 'POST').length;
  assert(postsAfterCustody === postsBeforeCustody + 1, 'Custody registration did not emit exactly one POST');

  const afterBinding = await databaseSnapshot(page);
  const pointer = await page.evaluate(() => localStorage.getItem('td613.ash-keep.current-case'));
  const caseMap = afterBinding.cases.find(item => item.case_id === pointer);
  assert(caseMap?.custody_reference, 'Custody receipt was not bound to the Case Map');
  assert(caseMap.case_map_digest !== preCase.case_map_digest, 'Custody binding did not change the Case Map digest');
  const rootNode = caseMap.nodes.find(node => node.custody_reference === caseMap.custody_reference);
  assert(rootNode?.type === 'artifact', 'Custody root artifact node was not found');
  const custodyReceipts = await page.evaluate(() => JSON.parse(localStorage.getItem('td613:ash-custody:receipts:v0.8') || '[]'));
  const custodyReceipt = custodyReceipts.find(item => item.receipt_id === caseMap.custody_reference);
  assert(custodyReceipt?.receipt_digest && custodyReceipt?.manifest_digest, 'Custody digest spine was not preserved');
  report.custody = {
    assurance_class: custodyReceipt.assurance_class || custodyReceipt.manifest?.artifact?.assurance_class || null,
    receipt_id: custodyReceipt.receipt_id,
    receipt_digest: custodyReceipt.receipt_digest,
    manifest_digest: custodyReceipt.manifest_digest,
    registration_posts_added: postsAfterCustody - postsBeforeCustody,
    raw_bytes_sent: requests.some(item => item.post_data?.includes(SYNTHETIC_ARTIFACT))
  };
  assert(report.custody.raw_bytes_sent === false, 'Synthetic artifact bytes entered a request body');
  report.case_binding = {
    case_id: caseMap.case_id,
    before_digest: preCase.case_map_digest,
    after_digest: caseMap.case_map_digest,
    custody_reference: caseMap.custody_reference,
    root_node_id: rootNode.id,
    root_disclosure_state: rootNode.disclosure_state
  };

  await openWorkspace(page, 'test');
  await page.locator('#loadSeed').click();
  await waitForText(page, '#testReceipt', /"test_digest"/, 60_000);
  await waitForLifecycle(page, 'REBUILD_ELIGIBLE');
  const rebuild = JSON.parse(await page.locator('#testReceipt').textContent());
  assert(rebuild.case_map_digest === caseMap.case_map_digest, 'Rebuild Test is not bound to the custody-root Case Map');
  assert(rebuild.automatic_hold === false && rebuild.real_surveillance_probability === null, 'Rebuild Test exceeded its authority');
  report.rebuild = { test_id: rebuild.test_id, test_digest: rebuild.test_digest, case_map_digest: rebuild.case_map_digest, state: await page.evaluate(() => document.body.dataset.ashLifecycle) };

  await openWorkspace(page, 'draft');
  await page.locator('#keepDraft').click();
  await waitForText(page, '#draftStatus', /Kept/i);
  const afterDraft = await databaseSnapshot(page);
  const draft = afterDraft.drafts.map(item => item.value).find(item => item.case_id === caseMap.case_id);
  assert(draft?.case_map_digest === caseMap.case_map_digest, 'Draft is not bound to the custody-root Case Map');
  await page.evaluate(() => {
    for (const input of document.querySelectorAll('[data-review]')) {
      if (!input.disabled) {
        input.checked = true;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });
  const custodyCheck = page.locator('[data-review="validCustody"]');
  assert(await custodyCheck.isChecked(), 'Observed custody did not replace the free review checkbox');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle', timeout: 45_000 }),
    page.locator('#reviewDraft').click()
  ]);
  await page.locator('meta[name="ash-lifecycle"][content="v0.1"]').waitFor({ state: 'attached' });
  await openWorkspace(page, 'draft');
  await waitForText(page, '#reviewStatus', /READY_FOR_LOCAL_RELEASE_APPROVAL/);
  await page.locator('#approveRelease').waitFor({ state: 'visible' });
  await page.waitForFunction(() => !document.querySelector('#approveRelease')?.disabled, null, { timeout: 45_000 });
  await page.locator('#approveRelease').click();
  await waitForText(page, '#releaseReceipt', /"receipt_digest"/);
  await waitForLifecycle(page, 'RELEASE_ELIGIBLE');
  const release = JSON.parse(await page.locator('#releaseReceipt').textContent());
  assert(release.case_map_digest === caseMap.case_map_digest, 'Release Receipt is not bound to the custody-root Case Map');
  assert(release.transmission_performed === false && release.recipient_transport === 'DEFERRED', 'Release Receipt performed transport');
  const afterRelease = await databaseSnapshot(page);
  const review = afterRelease.reviews.map(item => item.value).find(item => item.review_id === release.review_reference);
  report.draft_review_release = {
    draft_id: draft.draft_id,
    draft_case_map_digest: draft.case_map_digest,
    review_id: review?.review_id || null,
    review_status: review?.status || null,
    release_receipt_id: release.receipt_id,
    release_case_map_digest: release.case_map_digest,
    transmission_performed: release.transmission_performed,
    lifecycle_state: await page.evaluate(() => document.body.dataset.ashLifecycle)
  };

  await openWorkspace(page, 'save');
  await page.locator('#saveQuestions').fill('Which synthetic revision introduced the difference?');
  await page.locator('#saveNext').fill('Preserve the synthetic public index request.');
  await page.locator('#makeSave').click();
  await waitForText(page, '#saveStatus', /sealed locally/);
  await waitForLifecycle(page, 'CONTINUITY_SEALED');
  const passphrase = 'td613-ash-lifecycle-production-probe';
  await page.locator('#capsulePassphrase').fill(passphrase);
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#exportCapsule').click();
  const download = await downloadPromise;
  const capsulePath = path.join(artifactDir, 'ash-lifecycle-probe-capsule.json');
  await download.saveAs(capsulePath);
  await waitForText(page, '#capsuleStatus', /Encrypted copy exported/);
  await page.locator('#capsuleFile').setInputFiles(capsulePath);
  await page.locator('#capsulePassphrase').fill('wrong-passphrase');
  await page.locator('#importCapsule').click();
  const wrongPassphrase = await waitForText(page, '#capsuleStatus', /nothing was imported|authentication failed/i);
  await page.locator('#capsuleFile').setInputFiles(capsulePath);
  await page.locator('#capsulePassphrase').fill(passphrase);
  await page.locator('#importCapsule').click();
  await waitForText(page, '#capsuleStatus', /Authenticated capsule opened/);
  const capsule = JSON.parse(await fs.readFile(capsulePath, 'utf8'));
  capsule.ciphertext = `${capsule.ciphertext.slice(0, -2)}AA`;
  const tamperedPath = path.join(artifactDir, 'ash-lifecycle-probe-capsule-tampered.json');
  await fs.writeFile(tamperedPath, `${JSON.stringify(capsule, null, 2)}\n`);
  await page.locator('#capsuleFile').setInputFiles(tamperedPath);
  await page.locator('#capsulePassphrase').fill(passphrase);
  await page.locator('#importCapsule').click();
  const tamper = await waitForText(page, '#capsuleStatus', /verification failed|nothing was imported/i);
  const finalDb = await databaseSnapshot(page);
  const savePoint = finalDb.savePoints.map(item => item.value).find(item => item.case_id === caseMap.case_id);
  assert(savePoint?.case_map_digest === caseMap.case_map_digest, 'Save Point is not bound to the custody-root Case Map');
  report.continuity = {
    save_point_id: savePoint.save_point_id,
    case_map_digest: savePoint.case_map_digest,
    lifecycle_state: await page.evaluate(() => document.body.dataset.ashLifecycle),
    capsule_digest: await digestFile(capsulePath),
    wrong_passphrase_hold: /nothing was imported|authentication failed/i.test(wrongPassphrase || ''),
    tamper_hold: /verification failed|nothing was imported/i.test(tamper || '')
  };

  await settleViewport(page, 1440, 1000);
  await openWorkspace(page, 'custody');
  report.desktop = await layoutReceipt(page);
  assert(report.desktop.horizontal_overflow === 0 && report.desktop.unreachable_controls.length === 0, 'Desktop lifecycle layout is not reachable');
  const desktopPath = path.join(artifactDir, 'ash-lifecycle-desktop.png');
  await page.screenshot({ path: desktopPath, fullPage: true });
  await settleViewport(page, 390, 844);
  report.mobile_portrait = await layoutReceipt(page);
  assert(report.mobile_portrait.horizontal_overflow === 0 && report.mobile_portrait.unreachable_controls.length === 0, 'Mobile portrait lifecycle layout is not reachable');
  const portraitPath = path.join(artifactDir, 'ash-lifecycle-mobile-portrait.png');
  await page.screenshot({ path: portraitPath, fullPage: true });
  await settleViewport(page, 844, 390);
  report.mobile_landscape = await layoutReceipt(page);
  assert(report.mobile_landscape.horizontal_overflow === 0 && report.mobile_landscape.unreachable_controls.length === 0, 'Mobile landscape lifecycle layout is not reachable');
  const landscapePath = path.join(artifactDir, 'ash-lifecycle-mobile-landscape.png');
  await page.screenshot({ path: landscapePath, fullPage: true });

  const localKeys = await page.evaluate(() => Object.keys(localStorage));
  const sessionKeys = await page.evaluate(() => Object.keys(sessionStorage));
  const localValues = await page.evaluate(() => Object.values(localStorage).join('\n'));
  assert(localKeys.every(key => ALLOWED_LOCAL_KEYS.has(key)), `Unexpected localStorage key: ${localKeys.filter(key => !ALLOWED_LOCAL_KEYS.has(key)).join(', ')}`);
  assert(!localValues.includes(SYNTHETIC_ARTIFACT), 'Raw synthetic artifact entered localStorage');
  const nonReadRequests = requests.filter(item => !['GET', 'HEAD'].includes(item.method));
  const disallowedNonRead = nonReadRequests.filter(item => !/\/api\/dome-world\/ash-custody-register(?:\?|$)/.test(item.url));
  const providerOrTransport = requests.filter(item => /hush-generate|recipient|transport|send-final/i.test(item.url));
  assert(disallowedNonRead.length === 0, `Unexpected non-read requests: ${disallowedNonRead.map(item => item.url).join(', ')}`);
  assert(providerOrTransport.length === 0, 'Lifecycle probe reached a provider or recipient transport route');
  report.storage = {
    indexeddb_store_counts: Object.fromEntries(Object.entries(finalDb).map(([store, rows]) => [store, rows.length])),
    local_storage_keys: localKeys,
    session_storage_keys: sessionKeys,
    raw_artifact_in_local_storage: false
  };
  report.network = {
    total_requests: requests.length,
    non_read_requests: nonReadRequests.map(({ method, url, resource_type }) => ({ method, url, resource_type })),
    disallowed_non_read_requests: [],
    provider_or_transport_requests: [],
    raw_artifact_in_request_body: false
  };
  assert(consoleErrors.length === 0, `Browser console errors observed: ${consoleErrors.join(' | ')}`);

  report.evidence_files = {
    threshold_screenshot: await digestFile(thresholdShot),
    desktop_screenshot: await digestFile(desktopPath),
    mobile_portrait_screenshot: await digestFile(portraitPath),
    mobile_landscape_screenshot: await digestFile(landscapePath),
    capsule: await digestFile(capsulePath),
    tampered_capsule: await digestFile(tamperedPath),
    synthetic_artifact: await digestFile(syntheticPath)
  };
  report.status = 'PASS';
  report.promotion_authorized = false;
  await persistReport();
  const reportPath = path.join(artifactDir, 'ash-lifecycle-production-closure.json');
  const manifest = {
    schema: 'td613.ash.lifecycle-production-evidence-manifest/v0.1',
    source_status: report.source_status,
    promotion_authorized: false,
    files: {
      'ash-lifecycle-production-closure.json': await digestFile(reportPath),
      'ash-threshold-cleared.png': report.evidence_files.threshold_screenshot,
      'ash-lifecycle-desktop.png': report.evidence_files.desktop_screenshot,
      'ash-lifecycle-mobile-portrait.png': report.evidence_files.mobile_portrait_screenshot,
      'ash-lifecycle-mobile-landscape.png': report.evidence_files.mobile_landscape_screenshot,
      'ash-lifecycle-probe-capsule.json': report.evidence_files.capsule,
      'ash-lifecycle-probe-capsule-tampered.json': report.evidence_files.tampered_capsule,
      'synthetic-custody-root.txt': report.evidence_files.synthetic_artifact
    }
  };
  await fs.writeFile(path.join(artifactDir, 'evidence-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  report.status = 'HOLD_FOR_REPAIR';
  report.promotion_authorized = false;
  report.error = { message: error?.message || String(error), stack: error?.stack || null };
  try { await page.screenshot({ path: path.join(artifactDir, 'ash-lifecycle-held.png'), fullPage: true }); } catch {}
  await persistReport();
  console.error(JSON.stringify(report, null, 2));
  throw error;
} finally {
  await browser.close();
}
