import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

const base = (process.env.TD613_BASE_URL || process.argv[2] || 'http://127.0.0.1:6130').replace(/\/$/, '');
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-keep-production-closure';
const keepUrl = `${base}/dome-world/ash-keep.html`;
const DB_NAME = 'td613-ash-keep';
const ALLOWED_LOCAL_KEYS = new Set([
  'td613.ash-keep.current-case',
  'td613.ash-keep.preferences'
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
    const visible = [...document.querySelectorAll('button, input, select, textarea, a')]
      .filter(node => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      });
    const clipped = visible
      .map(node => ({ id: node.id || node.textContent?.trim().slice(0, 32) || node.tagName, rect: node.getBoundingClientRect() }))
      .filter(item => item.rect.left < -1 || item.rect.right > window.innerWidth + 1)
      .map(item => item.id);
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
page.on('request', request => requests.push({ method: request.method(), url: request.url(), resource_type: request.resourceType() }));
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', error => consoleErrors.push(error.message));

const report = {
  schema: 'td613.ash-keep.production-closure-observation/v0.1',
  status: 'RUNNING',
  promotion_authorized: false,
  base_url: base,
  keep_url: keepUrl,
  browser: 'chromium-headless',
  source_status: base.includes('localhost') || base.includes('127.0.0.1') ? 'LOCAL_VALIDATION' : 'DEPLOYED_OBSERVATION',
  clean_arrival: null,
  continuity: null,
  room_and_route_memory: null,
  rebuild_test: null,
  stale_release: null,
  hush_screen: null,
  save_and_capsule: null,
  large_case: null,
  desktop: null,
  mobile_portrait: null,
  mobile_landscape: null,
  rotation_return: null,
  network: null,
  storage: null,
  console_errors: consoleErrors,
  evidence_files: {},
  error: null
};

async function persistReport() {
  await fs.writeFile(path.join(artifactDir, 'ash-keep-production-closure.json'), `${JSON.stringify(report, null, 2)}\n`);
}

try {
  await page.goto(keepUrl, { waitUntil: 'networkidle', timeout: 60_000 });
  await page.locator('h1').waitFor({ state: 'visible' });
  assert((await page.title()).includes('TD613 Ash Keep'), 'Ash Keep title was not observed');
  assert(await page.locator('#launch').isVisible(), 'Clean profile did not begin at the explicit launch gate');

  const cleanDb = await databaseSnapshot(page);
  const cleanCount = Object.values(cleanDb).reduce((total, rows) => total + rows.length, 0);
  const cleanKeys = await page.evaluate(() => Object.keys(localStorage));
  const initialNonGet = requests.filter(request => request.method !== 'GET' && request.method !== 'HEAD');
  assert(cleanCount === 0, 'Clean arrival created case records before operator action');
  assert(cleanKeys.length === 0, 'Clean arrival wrote localStorage before operator action');
  assert(initialNonGet.length === 0, 'Clean arrival emitted a non-read network request');
  report.clean_arrival = {
    launch_visible: true,
    indexeddb_record_count: cleanCount,
    local_storage_keys: cleanKeys,
    non_read_requests: initialNonGet
  };

  await page.locator('#startDemo').click();
  await page.locator('#launch').waitFor({ state: 'hidden' });
  await waitForText(page, '#caseTitle', /Glasshouse Archive inquiry/);
  const afterDemo = await databaseSnapshot(page);
  assert(afterDemo.cases.length === 1, 'Demo creation did not create exactly one Case Map');
  const caseMap = afterDemo.cases[0];
  const caseId = caseMap.case_id;
  const pointer = await page.evaluate(() => localStorage.getItem('td613.ash-keep.current-case'));
  assert(pointer === caseId, 'Current-case pointer did not bind to the created case');
  const storageKeys = await page.evaluate(() => Object.keys(localStorage));
  assert(storageKeys.every(key => ALLOWED_LOCAL_KEYS.has(key)), 'Unexpected localStorage key was written');
  const localValues = await page.evaluate(() => Object.values(localStorage).join('\n'));
  assert(!localValues.includes('Glasshouse Archive inquiry') && !localValues.includes('node_archive'), 'Private case material entered localStorage');

  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('#launch').waitFor({ state: 'hidden' });
  await waitForText(page, '#caseTitle', /Glasshouse Archive inquiry/);
  const afterReload = await databaseSnapshot(page);
  assert(afterReload.cases[0]?.case_id === caseId, 'Case identity did not survive reload');
  assert(afterReload.cases[0]?.case_map_digest === caseMap.case_map_digest, 'Case Map digest drifted across reload');
  report.continuity = {
    case_id: caseId,
    case_map_digest: caseMap.case_map_digest,
    reloaded: true,
    digest_preserved: true
  };

  const nodeById = new Map(caseMap.nodes.map(node => [node.id, node]));
  const crossRoomEdges = caseMap.relationships.filter(edge => nodeById.get(edge.from)?.room_id !== nodeById.get(edge.to)?.room_id);
  assert(caseMap.rooms.length >= 2, 'Demo fixture did not contain multiple Rooms');
  assert(crossRoomEdges.length >= 1, 'Demo fixture did not contain a cross-Room relationship');

  await openWorkspace(page, 'routes');
  const disclosed = caseMap.nodes.slice(0, 2).map(node => node.id);
  await page.locator('#routeDigest').fill(`sha256:${'a'.repeat(64)}`);
  await page.locator('#routeRefs').fill(disclosed.join(', '));
  await page.locator('#recordRoute').click();
  await waitForText(page, '#routeStatus', /immutable successor entry/);
  const afterRoute = await databaseSnapshot(page);
  const routeRecord = afterRoute.routeMemory.find(item => item.id === caseId)?.value;
  assert(routeRecord?.entries.length === 1, 'Route Memory did not append exactly one successor entry');
  assert(routeRecord.entries[0].record_class === 'WHAT_ACTUALLY_LEFT', 'Route Memory collapsed actual disclosure into another evidence class');
  report.room_and_route_memory = {
    room_count: caseMap.rooms.length,
    cross_room_relationship_count: crossRoomEdges.length,
    route_entry_count: routeRecord.entries.length,
    route_record_class: routeRecord.entries[0].record_class
  };

  await openWorkspace(page, 'test');
  await page.locator('#loadSeed').click();
  await waitForText(page, '#testReceipt', /"test_digest"/, 45_000);
  const rebuild = JSON.parse(await page.locator('#testReceipt').textContent());
  assert(rebuild.trials.some(trial => trial.benign_control), 'Rebuild Test omitted its benign control');
  assert(rebuild.trials.some(trial => trial.held_out), 'Rebuild Test omitted its held-out observation');
  assert(rebuild.real_surveillance_probability === null, 'Rebuild Test manufactured a real surveillance probability');
  assert(rebuild.automatic_hold === false, 'Rebuild Test silently activated an automatic hold');
  await page.locator('#replayTest').click();
  await waitForText(page, '#replayReceipt', /REPLAY_VERIFIED/);
  report.rebuild_test = {
    test_id: rebuild.test_id,
    calibration_state: rebuild.calibration_state,
    trials: rebuild.trials.length,
    benign_controls: rebuild.trials.filter(trial => trial.benign_control).length,
    held_out: rebuild.trials.filter(trial => trial.held_out).length,
    replay: 'REPLAY_VERIFIED',
    real_surveillance_probability: rebuild.real_surveillance_probability,
    automatic_hold: rebuild.automatic_hold
  };

  report.stale_release = await staleReleaseAssay(page);
  assert(report.stale_release.exact === true, 'Exact release binding did not verify');
  assert(report.stale_release.stale_version_matches === false, 'Stale draft version remained release-eligible');
  assert(report.stale_release.stale_route_matches === false, 'Changed route remained release-eligible');
  assert(report.stale_release.transmission_performed === false, 'Local release receipt performed transmission');

  await openWorkspace(page, 'draft');
  await page.locator('#protectedLiterals').fill('Synthetic Person');
  const postsBeforeScreen = requests.filter(request => request.method === 'POST').length;
  await page.locator('#screenProvider').click();
  await waitForText(page, '#providerStatus', /READY_FOR_OPERATOR_REVIEW|HOLD_FOR_REPAIR/);
  const postsAfterScreen = requests.filter(request => request.method === 'POST').length;
  assert(postsAfterScreen === postsBeforeScreen, 'Local provider screening emitted a POST request');
  const screen = JSON.parse(await page.locator('#providerPacket').textContent());
  assert(screen.provider_called === false || screen.provider_called == null, 'Local screen claimed a provider call');
  report.hush_screen = {
    status: screen.status,
    provider_called: false,
    post_requests_added: postsAfterScreen - postsBeforeScreen
  };

  await openWorkspace(page, 'save');
  await page.locator('#saveQuestions').fill('Which synthetic revision introduced the difference?');
  await page.locator('#saveNext').fill('Request the synthetic public index.');
  await page.locator('#makeSave').click();
  await waitForText(page, '#saveStatus', /sealed locally/);

  const passphrase = 'td613-production-probe-passphrase';
  await page.locator('#capsulePassphrase').fill(passphrase);
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#exportCapsule').click();
  const download = await downloadPromise;
  const capsulePath = path.join(artifactDir, 'ash-keep-probe-capsule.json');
  await download.saveAs(capsulePath);
  await waitForText(page, '#capsuleStatus', /Encrypted copy exported/);

  await page.locator('#capsuleFile').setInputFiles(capsulePath);
  await page.locator('#capsulePassphrase').fill('wrong-passphrase');
  await page.locator('#importCapsule').click();
  const wrongMessage = await waitForText(page, '#capsuleStatus', /nothing was imported|authentication failed/i);

  await page.locator('#capsuleFile').setInputFiles(capsulePath);
  await page.locator('#capsulePassphrase').fill(passphrase);
  await page.locator('#importCapsule').click();
  await waitForText(page, '#capsuleStatus', /Authenticated capsule opened/);

  const capsule = JSON.parse(await fs.readFile(capsulePath, 'utf8'));
  capsule.ciphertext = `${capsule.ciphertext.slice(0, -2)}AA`;
  const tamperedPath = path.join(artifactDir, 'ash-keep-probe-capsule-tampered.json');
  await fs.writeFile(tamperedPath, `${JSON.stringify(capsule, null, 2)}\n`);
  await page.locator('#capsuleFile').setInputFiles(tamperedPath);
  await page.locator('#capsulePassphrase').fill(passphrase);
  await page.locator('#importCapsule').click();
  const tamperMessage = await waitForText(page, '#capsuleStatus', /verification failed|nothing was imported/i);
  report.save_and_capsule = {
    save_point: true,
    export: true,
    authenticated_import: true,
    wrong_passphrase_hold: /nothing was imported|authentication failed/i.test(wrongMessage || ''),
    tamper_hold: /verification failed|nothing was imported/i.test(tamperMessage || ''),
    capsule_digest: await digestFile(capsulePath)
  };

  report.large_case = await largeCaseAssay(page);
  assert(report.large_case.verified === true, 'Synthetic large Case Map failed verification');
  assert(report.large_case.compile_and_verify_ms < 5_000, 'Synthetic large Case Map exceeded the 5 second closure threshold');

  await settleViewport(page, 1440, 1000);
  await openWorkspace(page, 'map');
  report.desktop = await layoutReceipt(page);
  assert(report.desktop.horizontal_overflow === 0, 'Desktop Ash Keep has horizontal overflow');
  assert(report.desktop.clipped_controls.length === 0, 'Desktop Ash Keep clips visible controls');
  assert(report.desktop.reduced_motion === true, 'Reduced-motion context was not honored');
  const desktopPath = path.join(artifactDir, 'ash-keep-desktop.png');
  await page.screenshot({ path: desktopPath, fullPage: true });

  await settleViewport(page, 390, 844);
  report.mobile_portrait = await layoutReceipt(page);
  assert(report.mobile_portrait.horizontal_overflow === 0, 'Mobile portrait Ash Keep has horizontal overflow');
  assert(report.mobile_portrait.clipped_controls.length === 0, 'Mobile portrait Ash Keep clips visible controls');
  const portraitPath = path.join(artifactDir, 'ash-keep-mobile-portrait.png');
  await page.screenshot({ path: portraitPath, fullPage: true });

  await settleViewport(page, 844, 390);
  report.mobile_landscape = await layoutReceipt(page);
  assert(report.mobile_landscape.horizontal_overflow === 0, 'Mobile landscape Ash Keep has horizontal overflow');
  assert(report.mobile_landscape.clipped_controls.length === 0, 'Mobile landscape Ash Keep clips visible controls');
  const landscapePath = path.join(artifactDir, 'ash-keep-mobile-landscape.png');
  await page.screenshot({ path: landscapePath, fullPage: true });

  await settleViewport(page, 390, 844);
  report.rotation_return = await layoutReceipt(page);
  assert(report.rotation_return.horizontal_overflow === 0, 'Portrait return has horizontal overflow');
  assert(report.rotation_return.clipped_controls.length === 0, 'Portrait return clips visible controls');

  const finalDb = await databaseSnapshot(page);
  const finalLocalKeys = await page.evaluate(() => Object.keys(localStorage));
  const nonReadRequests = requests.filter(request => request.method !== 'GET' && request.method !== 'HEAD');
  const recipientRequests = requests.filter(request => /recipient|transport|send-final/i.test(request.url));
  assert(nonReadRequests.length === 0, 'Closure path emitted a non-read network request');
  assert(recipientRequests.length === 0, 'Closure path emitted a recipient-transport request');
  assert(finalLocalKeys.every(key => ALLOWED_LOCAL_KEYS.has(key)), 'Unexpected localStorage key appeared after closure workflow');
  report.network = {
    total_requests: requests.length,
    non_read_requests: nonReadRequests,
    recipient_transport_requests: recipientRequests
  };
  report.storage = {
    indexeddb_store_counts: Object.fromEntries(Object.entries(finalDb).map(([store, rows]) => [store, rows.length])),
    local_storage_keys: finalLocalKeys,
    local_storage_case_material: false
  };

  assert(consoleErrors.length === 0, `Browser console errors observed: ${consoleErrors.join(' | ')}`);
  report.evidence_files = {
    desktop_screenshot: await digestFile(desktopPath),
    mobile_portrait_screenshot: await digestFile(portraitPath),
    mobile_landscape_screenshot: await digestFile(landscapePath),
    capsule: await digestFile(capsulePath),
    tampered_capsule: await digestFile(tamperedPath)
  };
  report.status = 'PASS';
  report.promotion_authorized = false;
  await persistReport();
  const reportPath = path.join(artifactDir, 'ash-keep-production-closure.json');
  const manifest = {
    schema: 'td613.ash-keep.production-closure-evidence-manifest/v0.1',
    source_status: report.source_status,
    promotion_authorized: false,
    files: {
      'ash-keep-production-closure.json': await digestFile(reportPath),
      'ash-keep-desktop.png': report.evidence_files.desktop_screenshot,
      'ash-keep-mobile-portrait.png': report.evidence_files.mobile_portrait_screenshot,
      'ash-keep-mobile-landscape.png': report.evidence_files.mobile_landscape_screenshot,
      'ash-keep-probe-capsule.json': report.evidence_files.capsule,
      'ash-keep-probe-capsule-tampered.json': report.evidence_files.tampered_capsule
    }
  };
  await fs.writeFile(path.join(artifactDir, 'evidence-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  report.status = 'HOLD_FOR_REPAIR';
  report.promotion_authorized = false;
  report.error = { message: error?.message || String(error), stack: error?.stack || null };
  try {
    await page.screenshot({ path: path.join(artifactDir, 'ash-keep-held.png'), fullPage: true });
  } catch {
    // Evidence capture must never conceal the originating failure.
  }
  await persistReport();
  console.error(JSON.stringify(report, null, 2));
  throw error;
} finally {
  await browser.close();
}
