import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

const base = (process.env.TD613_BASE_URL || process.argv[2] || 'http://127.0.0.1:6130').replace(/\/$/, '');
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-keep-production-closure';
const keepUrl = `${base}/dome-world/ash-keep.html?presentation=legacy`;
const DB_NAME = 'td613-ash-keep';
const ALLOWED_LOCAL_KEYS = new Set([
  'td613.ash-keep.current-case',
  'td613.ash-keep.preferences',
  'td613.ash.cache-flush.epoch'
]);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function browserExecutable() {
  const requested = process.env.TD613_BROWSER_EXECUTABLE;
  if (requested && fsSync.existsSync(requested)) return requested;
  const candidates = process.platform === 'win32'
    ? [
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
      ]
    : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  return candidates.find(candidate => fsSync.existsSync(candidate)) || null;
}

function sha256(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

async function digestFile(file) {
  return sha256(await fs.readFile(file));
}

async function waitForText(page, selector, pattern, timeout = 30_000) {
  await page.waitForFunction(
    ({ selector, source, flags }) => new RegExp(source, flags).test(document.querySelector(selector)?.textContent || ''),
    { selector, source: pattern.source, flags: pattern.flags },
    { timeout }
  );
  return page.locator(selector).textContent();
}

async function openWorkspace(page, name) {
  await page.evaluate(workspace => {
    const open = window.__td613AshPremiumUI?.open
      || window.__td613OpenAshWorkspace
      || window.__td613AshKeep?.openWorkspace;
    if (typeof open !== 'function') throw new Error('Ash guided workspace API is unavailable.');
    open(workspace);
  }, name);
  await page.waitForFunction(workspace => document.getElementById(`workspace-${workspace}`)?.classList.contains('active'), name);
}

async function databaseSnapshot(page) {
  return page.evaluate(async ({ dbName }) => {
    const open = await new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const stores = [...open.objectStoreNames];
    const output = {};
    for (const store of stores) {
      output[store] = await new Promise((resolve, reject) => {
        const request = open.transaction(store, 'readonly').objectStore(store).getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    }
    open.close();
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
    const tabs = [...document.querySelectorAll('.work-tab')];
    return {
      width: window.innerWidth,
      height: window.innerHeight,
      document_width: document.documentElement.scrollWidth,
      horizontal_overflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
      clipped_controls: clipped,
      workspace_tab_count: tabs.length,
      selected_workspace: document.documentElement.dataset.ashPremiumWorkspace || document.querySelector('.workspace.active')?.id?.replace('workspace-', '') || null,
      reduced_motion: matchMedia('(prefers-reduced-motion: reduce)').matches
    };
  });
}

async function settleViewport(page, width, height) {
  await page.setViewportSize({ width, height });
  await page.waitForFunction(
    expected => innerWidth === expected.width && innerHeight === expected.height,
    { width, height }
  );
  await page.waitForTimeout(250);
}

async function staleReleaseAssay(page) {
  return page.evaluate(async () => {
    const {
      compileAshDraft,
      compileDraftReview,
      compileReleaseReceipt,
      releaseStillMatches
    } = await import('/engine/ash-keep-drafts.js');
    const draft = await compileAshDraft({
      draftId: 'draft_production_probe',
      caseId: 'case_production_probe',
      body: 'Request the synthetic public archive index.',
      version: '1',
      selectedRoute: 'route_public_request',
      recipientClass: 'public-records-office',
      purpose: 'request-public-index',
      disclosedOpaqueReferences: ['node_archive']
    });
    const review = await compileDraftReview({
      draft,
      validCustody: true,
      sufficientTestCoverage: true,
      unresolvedTamper: false,
      explicitReview: true,
      protectedIdentityReviewed: true,
      confidentialPassagesReviewed: true,
      metadataReviewed: true,
      sourceReferencesReviewed: true,
      promptInjectionReviewed: true,
      routeHistoryReviewed: true,
      roomBridgesReviewed: true,
      chronologyReviewed: true,
      hushLinkCheckReviewed: true,
      approvalScope: 'LOCAL_EXPORT'
    });
    const release = await compileReleaseReceipt({
      draft,
      review,
      receiptId: 'release_production_probe',
      route: 'route_public_request',
      recipientClass: 'public-records-office',
      purpose: 'request-public-index',
      version: '1',
      nonce: 'nonce_production_probe',
      operatorGesture: 'production probe local approval'
    });
    const exact = releaseStillMatches(release, {
      draftDigest: draft.draft_digest,
      route: 'route_public_request',
      recipientClass: 'public-records-office',
      purpose: 'request-public-index',
      version: '1'
    });
    const staleVersion = releaseStillMatches(release, {
      draftDigest: draft.draft_digest,
      route: 'route_public_request',
      recipientClass: 'public-records-office',
      purpose: 'request-public-index',
      version: '2'
    });
    const staleRoute = releaseStillMatches(release, {
      draftDigest: draft.draft_digest,
      route: 'route_other',
      recipientClass: 'public-records-office',
      purpose: 'request-public-index',
      version: '1'
    });
    return {
      exact,
      stale_version_matches: staleVersion,
      stale_route_matches: staleRoute,
      transmission_performed: release.transmission_performed,
      recipient_transport: release.recipient_transport || false
    };
  });
}

async function largeCaseAssay(page) {
  return page.evaluate(async () => {
    const { compileCaseMap, verifyCaseMap } = await import('/engine/ash-keep-core.js');
    const rooms = Array.from({ length: 10 }, (_, index) => ({
      id: `room_scale_${index}`,
      label: `Scale Room ${index}`
    }));
    const nodes = Array.from({ length: 250 }, (_, index) => ({
      id: `node_scale_${index}`,
      type: index % 17 === 0 ? 'hypothesis' : index % 23 === 0 ? 'intended-action' : 'claim',
      label: `Synthetic scale node ${index}`,
      room_id: rooms[index % rooms.length].id,
      chronology_index: index
    }));
    const relationships = Array.from({ length: 400 }, (_, index) => ({
      id: `edge_scale_${index}`,
      from: nodes[index % nodes.length].id,
      to: nodes[(index * 7 + 13) % nodes.length].id,
      type: 'synthetic-scale-link'
    })).filter(edge => edge.from !== edge.to);
    const started = performance.now();
    const record = await compileCaseMap({
      caseId: 'case_scale_probe',
      profile: 'research',
      title: 'Synthetic scale probe',
      rooms,
      nodes,
      relationships,
      evidenceBasis: ['synthetic performance fixture']
    });
    const verified = await verifyCaseMap(record);
    return {
      rooms: record.rooms.length,
      nodes: record.nodes.length,
      relationships: record.relationships.length,
      compile_and_verify_ms: Math.round((performance.now() - started) * 100) / 100,
      verified
    };
  });
}

await fs.mkdir(artifactDir, { recursive: true });
const executablePath = browserExecutable();
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  locale: 'en-US',
  reducedMotion: 'reduce',
  acceptDownloads: true
});
const page = await context.newPage();
const requests = [];
const consoleErrors = [];
page.on('request', request => requests.push({ method: request.method(), url: request.url(), resource_type: request.resourceType(), post_data: request.postData() || null }));
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', error => consoleErrors.push(error.message));

const report = {
  schema: 'td613.ash.lifecycle-production-observation/v0.1',
  status: 'RUNNING',
  promotion_authorized: false,
  base_url: base,
  dome_url: domeUrl,
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
  await page.goto(domeUrl, { waitUntil: 'networkidle', timeout: 60_000 });
  assert((await page.title()) === 'Dome-World', 'Dome-World title was not observed before Ash selection');
  await page.locator('.tab[data-view="ash"]').click();
  await page.locator('[data-ash-threshold-membrane].active').waitFor({ state: 'visible' });
  await page.locator('#ashThresholdTitle').waitFor({ state: 'visible' });
  const thresholdLocalKeys = await page.evaluate(() => Object.keys(localStorage).sort());
  const thresholdSessionKeys = await page.evaluate(() => Object.keys(sessionStorage).sort());
  await page.waitForTimeout(900);
  assert((await page.evaluate(() => location.pathname)).replace(/\/$/, '') === '/dome-world', 'Selecting Ash redirected without an operator entry gesture');
  assert(JSON.stringify(await page.evaluate(() => Object.keys(localStorage).sort())) === JSON.stringify(thresholdLocalKeys), 'Embedded threshold changed localStorage before operator action');
  assert(JSON.stringify(await page.evaluate(() => Object.keys(sessionStorage).sort())) === JSON.stringify(thresholdSessionKeys), 'Embedded threshold changed sessionStorage before operator action');

  await page.locator('[data-ash-law-step="2"]').click();
  await waitForText(page, '[data-ash-threshold-status]', /order broke/i);
  assert((await page.locator('[data-ash-threshold-enter]').getAttribute('aria-disabled')) === 'true', 'Broken ritual order enabled entry');
  for (const step of [1, 2, 3]) await page.locator(`[data-ash-law-step="${step}"]`).click();
  assert((await page.locator('[data-ash-threshold-enter]').getAttribute('aria-disabled')) === 'false', 'Correct threshold sequence did not enable entry');
  const thresholdShot = path.join(artifactDir, 'ash-threshold-cleared.png');
  await page.screenshot({ path: thresholdShot, fullPage: true });

  await Promise.all([
    page.waitForURL(/\/dome-world\/ash-threshold\.html\?arrival=cleared/, { timeout: 30_000 }),
    page.locator('[data-ash-threshold-enter]').click()
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
  const custodyReceipts = (afterBinding.custodyReceipts || []).map(item => item.value || item);
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
    lifecycle_state: afterBinding.lifecycle.find(item => item.id === caseMap.case_id)?.value?.lifecycle_state || null
  };

  await page.locator('.work-tab[data-workspace="test"]').click();
  await waitForText(page, '#testStatus', /Test held/i);
  await page.locator('#loadSeed').click();
  const rebuild = JSON.parse(await waitForText(page, '#testReceipt', /"test_digest"/, 45_000));
  assert(rebuild.trials.some(trial => trial.benign_control), 'Rebuild Test omitted its benign control');
  assert(rebuild.trials.some(trial => trial.held_out), 'Rebuild Test omitted its held-out observation');
  assert(rebuild.real_surveillance_probability === null, 'Rebuild Test manufactured a real surveillance probability');
  assert(rebuild.automatic_hold === false, 'Rebuild Test silently activated an automatic hold');
  await page.locator('#replayTest').click();
  await waitForText(page, '#replayReceipt', /REPLAY_VERIFIED/);
  report.rebuild = {
    test_id: rebuild.test_id,
    calibration_state: rebuild.calibration_state,
    trials: rebuild.trials.length,
    benign_controls: rebuild.trials.filter(trial => trial.benign_control).length,
    held_out: rebuild.trials.filter(trial => trial.held_out).length,
    replay: 'REPLAY_VERIFIED',
    real_surveillance_probability: rebuild.real_surveillance_probability,
    automatic_hold: rebuild.automatic_hold
  };

  await page.locator('.work-tab[data-workspace="draft"]').click();
  await page.locator('#draftBody').fill('Synthetic lifecycle export approval');
  await page.locator('#draftRefs').fill('node_archive, node_register');
  await page.locator('#keepDraft').click();
  await page.locator('#reviewDraft').click();
  await page.locator('#approveRelease').click();
  await waitForText(page, '#reviewStatus', /READY_FOR_LOCAL_RELEASE_APPROVAL/i);
  const continuityState = await page.evaluate(() => document.body.dataset.ashLifecycle);
  assert(continuityState === 'CONTINUITY_SEALED', 'Release approval did not seal continuity');
  report.draft_review_release = {
    draft_state: true,
    review_state: 'READY_FOR_LOCAL_RELEASE_APPROVAL',
    continuity_state: continuityState
  };

  await page.locator('.work-tab[data-workspace="save"]').click();
  await page.locator('#saveQuestions').fill('What remains to be checked?');
  await page.locator('#saveNext').fill('Return to the hold surface.');
  await page.locator('#makeSave').click();
  await waitForText(page, '#saveStatus', /Save Point .* sealed locally\./);
  await page.locator('#exportCapsule').click();
  await waitForText(page, '#capsuleStatus', /Encrypted copy exported/);
  const afterCapsule = await databaseSnapshot(page);
  const savePoint = afterCapsule.savePoints.find(item => item.value?.case_id === caseMap.case_id)?.value || null;
  assert(savePoint?.save_point_digest, 'Save Point was not stored before Capsule export');
  report.continuity = {
    save_point_digest: savePoint.save_point_digest,
    release_reference: savePoint.release_receipt_reference,
    exported: true
  };

  await settleViewport(page, 390, 844);
  report.mobile_portrait = await layoutReceipt(page);
  assert(report.mobile_portrait.horizontal_overflow === 0, 'Mobile portrait has horizontal overflow');
  assert(report.mobile_portrait.clipped_controls.length === 0, `Mobile portrait clipped controls: ${report.mobile_portrait.clipped_controls.join(', ')}`);

  await settleViewport(page, 844, 390);
  report.mobile_landscape = await layoutReceipt(page);
  assert(report.mobile_landscape.horizontal_overflow === 0, 'Mobile landscape has horizontal overflow');
  assert(report.mobile_landscape.clipped_controls.length === 0, `Mobile landscape clipped controls: ${report.mobile_landscape.clipped_controls.join(', ')}`);

  await settleViewport(page, 1440, 1000);
  report.desktop = await layoutReceipt(page);
  assert(report.desktop.horizontal_overflow === 0, 'Desktop has horizontal overflow');
  assert(report.desktop.clipped_controls.length === 0, `Desktop clipped controls: ${report.desktop.clipped_controls.join(', ')}`);

  report.storage = { keys: await page.evaluate(() => Object.keys(localStorage)), snapshot: await databaseSnapshot(page) };
  report.network = { requests: requests.filter(item => item.method !== 'GET' && item.method !== 'HEAD') };
  assert(report.network.requests.every(request => request.url.startsWith(base)), 'Production probe emitted an off-origin request');
  assert(consoleErrors.length === 0, `Console errors: ${consoleErrors.join(' | ')}`);
  assert(report.storage.keys.every(key => ALLOWED_LOCAL_KEYS.has(key)), `Unexpected localStorage key set: ${report.storage.keys.join(', ')}`);
  report.promotion_authorized = true;
  report.status = 'PASS';
} catch (error) {
  report.status = 'HOLD_FOR_REPAIR';
  report.error = { message: error.message, stack: error.stack };
} finally {
  await persistReport();
  await context.close();
  await browser.close();
}

if (report.status !== 'PASS') throw new Error(`${report.status}: ${report.error?.message || 'unknown error'}`);
console.log(JSON.stringify(report, null, 2));
