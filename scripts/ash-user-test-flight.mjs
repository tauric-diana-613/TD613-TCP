import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-user-test-flight');
const syntheticCustody = process.env.TD613_SYNTHETIC_CUSTODY === '1';
const sourceStatus = /localhost|127\.0\.0\.1/.test(base) ? 'LOCAL_CANDIDATE' : 'DEPLOYED_USER_FLIGHT';
const thresholdUrl = `${base}/dome-world/ash-threshold.html`;
const keepUrl = `${base}/dome-world/ash-keep.html`;
const passphrase = 'TD613-user-flight-613';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

function browserExecutable() {
  const requested = process.env.TD613_BROWSER_EXECUTABLE;
  if (requested && fs.existsSync(requested)) return requested;
  return ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(candidate => fs.existsSync(candidate)) || null;
}

async function openDb(page) {
  return page.evaluate(() => new Promise((resolve, reject) => {
    const request = indexedDB.open('td613-ash-keep');
    request.onsuccess = () => resolve([...request.result.objectStoreNames]);
    request.onerror = () => reject(request.error);
  }));
}

async function readStore(page, storeName) {
  return page.evaluate(store => new Promise((resolve, reject) => {
    const request = indexedDB.open('td613-ash-keep');
    request.onsuccess = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(store)) {
        db.close();
        resolve([]);
        return;
      }
      const rows = db.transaction(store).objectStore(store).getAll();
      rows.onsuccess = () => { db.close(); resolve(rows.result || []); };
      rows.onerror = () => { db.close(); reject(rows.error); };
    };
    request.onerror = () => reject(request.error);
  }), storeName);
}

async function currentCase(page) {
  return page.evaluate(() => new Promise((resolve, reject) => {
    const caseId = localStorage.getItem('td613.ash-keep.current-case');
    const request = indexedDB.open('td613-ash-keep');
    request.onsuccess = () => {
      const db = request.result;
      const row = db.transaction('cases').objectStore('cases').get(caseId);
      row.onsuccess = () => { db.close(); resolve(row.result || null); };
      row.onerror = () => { db.close(); reject(row.error); };
    };
    request.onerror = () => reject(request.error);
  }));
}

async function bindSyntheticCustody(page) {
  return page.evaluate(async () => {
    const caseId = localStorage.getItem('td613.ash-keep.current-case');
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('td613-ash-keep');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const read = (store, key) => new Promise((resolve, reject) => {
      const request = db.transaction(store).objectStore(store).get(key);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
    const before = await read('cases', caseId);
    const { compileCaseMap } = await import('/engine/ash-keep-core.js');
    const custodyReference = `ashc_user_flight_${crypto.randomUUID()}`;
    const root = {
      id: `node_custody_${crypto.randomUUID().replaceAll('-', '')}`,
      type: 'artifact',
      label: 'User flight custody root',
      notes: 'Synthetic local candidate fixture. No source bytes imported.',
      room_id: before.rooms[0]?.id || 'room_primary',
      sensitivity: 'PRIVATE',
      source_status: 'OBSERVED',
      confidence_posture: 'HELD',
      custody_reference: custodyReference,
      disclosure_state: 'LOCAL',
      chronology_index: 0
    };
    const after = await compileCaseMap({
      profile: before.profile,
      caseId: before.case_id,
      title: before.title,
      createdAt: before.created_at,
      updatedAt: new Date().toISOString(),
      custodyReference,
      tamperState: before.tamper_state,
      rooms: before.rooms,
      nodes: [root, ...before.nodes.map(node => ({ ...node, chronology_index: Number(node.chronology_index || 0) + 1 }))],
      relationships: before.relationships,
      privateChronology: before.private_chronology,
      intendedActions: before.intended_actions,
      sourceStatus: before.source_status,
      evidenceBasis: [...before.evidence_basis, 'synthetic user-flight custody fixture'],
      observations: [...before.observations, { kind: 'SYNTHETIC_USER_FLIGHT_CUSTODY', raw_content_imported: false }],
      missingness: before.missingness.filter(item => !/custody|case root/i.test(item)),
      alternatives: before.alternatives,
      openQuestions: before.open_questions,
      operatorNotes: before.operator_notes,
      closureStatus: before.closure?.status
    });
    const readiness = { receipt_id: 'ash_ready_user_flight', state: 'READINESS_OBSERVED' };
    const custody = {
      receipt_id: custodyReference,
      receipt_digest: 'sha256:user-flight-synthetic-custody',
      manifest_digest: 'sha256:user-flight-synthetic-manifest',
      source_status: 'SYNTHETIC_LOCAL_FIXTURE',
      manifest: { source_locator: { label: 'User flight custody root' } }
    };
    await new Promise((resolve, reject) => {
      const transaction = db.transaction(['cases', 'custodyReceipts', 'lifecycle'], 'readwrite');
      transaction.objectStore('cases').put(after);
      transaction.objectStore('custodyReceipts').put({ id: custodyReference, value: custody });
      transaction.objectStore('lifecycle').put({ id: caseId, value: {
        readiness_receipt: readiness,
        custody_receipt_reference: custodyReference,
        custody_receipt_digest: custody.receipt_digest,
        custody_verified: true,
        case_map_digest: after.case_map_digest,
        lifecycle_state: 'CASE_BOUND',
        lifecycle_receipt: { lifecycle: { state: 'CASE_BOUND', holds: [] } }
      } });
      transaction.oncomplete = resolve;
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
    db.close();
    window.dispatchEvent(new CustomEvent('td613:ash:custody-bound', { detail: {
      case_id: caseId,
      case_map_digest: after.case_map_digest,
      custody_root_receipt_reference: custodyReference
    } }));
    await window.__td613AshKeep.refresh();
    await window.__td613AshLifecycleRefresh();
    await window.TD613AshConvergence.reconcileAuthority('user-flight-synthetic-custody');
    return { case_id: caseId, custody_reference: custodyReference, case_map_digest: after.case_map_digest };
  });
}

async function layoutReceipt(page) {
  return page.evaluate(() => {
    const visible = [...document.querySelectorAll('button,input,select,textarea,a')].filter(node => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
    });
    const clipped = visible.filter(node => {
      const rect = node.getBoundingClientRect();
      let parent = node.parentElement;
      while (parent && parent !== document.body) {
        const style = getComputedStyle(parent);
        if (/(auto|scroll)/.test(style.overflowX) && parent.scrollWidth > parent.clientWidth + 1) return false;
        parent = parent.parentElement;
      }
      return rect.left < -1 || rect.right > innerWidth + 1;
    }).map(node => node.id || node.textContent.trim().slice(0, 48));
    const tiny = visible.filter(node => {
      const rect = node.getBoundingClientRect();
      return node.tagName === 'BUTTON' && (rect.width < 28 || rect.height < 28);
    }).map(node => ({ id: node.id || null, label: node.textContent.trim().slice(0, 48), width: Math.round(node.getBoundingClientRect().width), height: Math.round(node.getBoundingClientRect().height) }));
    return {
      viewport: { width: innerWidth, height: innerHeight },
      horizontal_overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      clipped_controls: clipped,
      undersized_buttons: tiny,
      active_workspace: document.querySelector('.workspace.active')?.id || null,
      lifecycle: document.body.dataset.ashLifecycle || null
    };
  });
}

async function waitAuthority(page, state) {
  await page.waitForFunction(async expected => {
    const context = await window.TD613AshConvergence?.currentAuthorityContext?.();
    return context?.lifecycle_rank === expected;
  }, state, { timeout: 60000 });
}

async function bootAsh(page, { throughThreshold = true } = {}) {
  await page.goto(throughThreshold ? thresholdUrl : keepUrl, { waitUntil: 'networkidle' });
  await page.waitForURL(/\/dome-world\/ash-keep\.html/, { timeout: 60000 });
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.version)
    && typeof window.__td613AshLifecycleRefresh === 'function'
    && typeof window.TD613AshConvergence?.authorize === 'function'
    && Boolean(document.querySelector('.work-tab[data-workspace="custody"]')),
  null, { timeout: 60000 });
}

async function screenshot(page, name) {
  await page.screenshot({ path: path.join(artifactDir, name), fullPage: true });
}

await fsp.mkdir(artifactDir, { recursive: true });
const executablePath = browserExecutable();
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce', acceptDownloads: true });
const page = await context.newPage();
page.setDefaultTimeout(60000);

const consoleErrors = [];
const httpErrors = [];
const nonReadRequests = [];
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', error => consoleErrors.push(error.message));
page.on('request', request => { if (!['GET', 'HEAD'].includes(request.method())) nonReadRequests.push({ method: request.method(), url: request.url() }); });
page.on('response', response => { if (response.status() >= 400 && !/favicon\.ico/.test(response.url())) httpErrors.push({ status: response.status(), url: response.url() }); });
page.on('dialog', dialog => dialog.accept());

const report = {
  schema: 'td613.ash.user-test-flight/v0.1',
  source_status: sourceStatus,
  base_url: base,
  synthetic_custody: syntheticCustody,
  status: 'RUNNING',
  promotion_authorized: false,
  observations: {},
  seams: [],
  console_errors: consoleErrors,
  http_errors: httpErrors,
  non_read_requests: nonReadRequests
};

let downloadedCapsule = null;
try {
  await bootAsh(page);
  report.observations.threshold_entry = {
    redirected_to_keep: /ash-keep\.html/.test(page.url()),
    arrival_cleared: page.url().includes('arrival=cleared'),
    custody_workspace_injected: await page.locator('.work-tab[data-workspace="custody"]').count() === 1
  };
  await screenshot(page, '01-threshold-arrival.png');

  assert(await page.locator('#launch').isVisible(), 'Blank-browser launch dialog was not visible.');
  await page.locator('#newTitle').fill('TD613 Ash user flight');
  await page.locator('#newProfile').selectOption('research');
  await page.locator('#newCase').click();
  await page.waitForFunction(() => /TD613 Ash user flight/.test(document.getElementById('caseTitle')?.textContent || ''));
  await openDb(page);
  report.observations.case_creation = { case_id: await page.evaluate(() => localStorage.getItem('td613.ash-keep.current-case')), profile: 'research' };

  await page.locator('#objectName').fill('Held-before-custody');
  await page.locator('#addObject').click();
  await page.waitForFunction(() => document.querySelector('.workspace.active')?.id === 'workspace-custody');
  const holdText = await page.locator('#custodyStatus').textContent();
  assert(/CASE_BOUND required/.test(holdText || ''), 'Pre-custody action failed to explain its CASE_BOUND hold.');
  report.observations.pre_custody_hold = { routed_to_custody: true, message: holdText };

  await page.locator('#lifeArtifactClass').selectOption('private-note');
  await page.locator('#lifeMediaType').fill('text/plain');
  await page.locator('#compileQuickScan').click();
  await page.waitForFunction(() => /ash_readiness_/.test(document.getElementById('readinessReceipt')?.textContent || ''));

  if (syntheticCustody) {
    report.observations.custody = await bindSyntheticCustody(page);
  } else {
    await page.locator('#lifeSourceLabel').fill('User flight metadata root');
    await page.locator('#lifePathRef').fill('flight://metadata-only/root');
    await page.locator('#lifeSourceEnvironment').selectOption({ label: 'manual' });
    await page.locator('#lifeCredentialType').selectOption({ label: 'operator-attested' });
    await page.locator('#registerCustodyRoot').click();
    await page.waitForFunction(() => document.body.dataset.ashLifecycle === 'CASE_BOUND', null, { timeout: 90000 });
    report.observations.custody = {
      lifecycle: await page.evaluate(() => document.body.dataset.ashLifecycle),
      status: await page.locator('#custodyStatus').textContent(),
      metadata_only: true
    };
  }
  await page.waitForFunction(() => document.body.dataset.ashLifecycle === 'CASE_BOUND');
  await waitAuthority(page, 'CASE_BOUND');
  await screenshot(page, '02-custody-bound.png');

  await page.locator('.work-tab[data-workspace="rooms"]').click();
  await page.locator('#roomName').fill('Source chamber');
  await page.locator('#addRoom').click();
  await page.waitForFunction(() => /Source chamber/.test(document.getElementById('roomList')?.textContent || ''));
  await page.locator('#ruleRoute').fill('route_user_flight');
  await page.locator('#ruleRooms').fill('room_primary');
  await page.locator('#ruleKeys').fill('edge_local_only');
  await page.locator('#saveRule').click();
  await page.waitForFunction(() => /Rule kept/.test(document.getElementById('roomStatus')?.textContent || ''));

  await page.locator('.work-tab[data-workspace="map"]').click();
  for (const [label, type, source] of [
    ['Public filing index', 'artifact', 'OBSERVED'],
    ['Unpublished working inference', 'hypothesis', 'INFERRED'],
    ['Missing corroborating record', 'evidence-gap', 'UNRESOLVED']
  ]) {
    await page.locator('#objectName').fill(label);
    await page.locator('#objectType').selectOption(type);
    await page.locator('#objectSource').selectOption(source);
    await page.locator('#addObject').click();
    await page.waitForFunction(expected => /added to/i.test(document.getElementById('mapEditStatus')?.textContent || '') && document.getElementById('objectName')?.value === '', label);
  }
  const caseAfterObjects = await currentCase(page);
  const filing = caseAfterObjects.nodes.find(node => node.label === 'Public filing index');
  const inference = caseAfterObjects.nodes.find(node => node.label === 'Unpublished working inference');
  const gap = caseAfterObjects.nodes.find(node => node.label === 'Missing corroborating record');
  assert(filing && inference && gap, 'User-created map objects were not persisted.');

  await page.locator('#linkFrom').selectOption(filing.id);
  await page.locator('#linkTo').selectOption(inference.id);
  await page.locator('#linkType').fill('constrains');
  await page.locator('#addRelationship').click();
  await page.waitForFunction(() => /connected/i.test(document.getElementById('relationshipStatus')?.textContent || ''));
  await page.locator('#toggleTable').click();
  assert(await page.locator('#accessibleTable').isVisible(), 'Accessible map table did not open.');
  report.observations.case_map = { rooms: caseAfterObjects.rooms.length, user_nodes: [filing.id, inference.id, gap.id], accessible_table_opened: true };

  await page.locator('.work-tab[data-workspace="routes"]').click();
  await page.locator('#routeId').fill('route_user_flight');
  await page.locator('#routeRecipient').fill('bounded-test-recipient');
  await page.locator('#routePurpose').fill('test-purpose-shaped-index');
  await page.locator('#routeDigest').fill(`sha256:${'a'.repeat(64)}`);
  await page.locator('#routeRefs').fill(filing.id);
  await page.locator('#recordRoute').click();
  await page.waitForFunction(() => /immutable successor entry/i.test(document.getElementById('routeStatus')?.textContent || ''));
  report.observations.route_memory = { recorded_reference: filing.id };

  await page.locator('.work-tab[data-workspace="test"]').click();
  await page.locator('#readerClass').selectOption('deterministic-baseline');
  await page.locator('#testRefs').fill([filing.id, inference.id, gap.id].join(', '));
  await page.locator('#runTest').click();
  await page.waitForFunction(() => /"test_digest"/.test(document.getElementById('testReceipt')?.textContent || ''), null, { timeout: 90000 });
  await page.waitForFunction(() => document.body.dataset.ashLifecycle === 'REBUILD_ELIGIBLE');
  await waitAuthority(page, 'REBUILD_ELIGIBLE');
  await page.locator('#replayTest').click();
  await page.waitForFunction(() => !document.getElementById('replayReceipt')?.hidden && /replay/i.test(document.getElementById('replayReceipt')?.textContent || ''));
  await page.locator('#linkLeft').fill('Purpose-shaped filing index.');
  await page.locator('#linkRight').fill('Purpose shaped filing summary.');
  await page.locator('#compareDrafts').click();
  await page.waitForFunction(() => /shared structure/i.test(document.getElementById('linkStatus')?.textContent || ''));
  report.observations.rebuild = { lifecycle: 'REBUILD_ELIGIBLE', replay_visible: true, link_check_visible: true };

  await page.locator('.work-tab[data-workspace="draft"]').click();
  await page.locator('#draftBody').fill('Please provide the public filing index and the date range represented by that index.');
  await page.locator('#draftRoute').fill('route_user_flight');
  await page.locator('#draftRecipient').fill('bounded-test-recipient');
  await page.locator('#draftPurpose').fill('request-public-index');
  await page.locator('#draftVersion').fill('1');
  await page.locator('#draftRefs').fill(filing.id);
  await page.locator('#keepDraft').click();
  await page.waitForFunction(() => /Kept/.test(document.getElementById('draftStatus')?.textContent || ''));
  const reviewInputs = page.locator('[data-review]:not(:disabled)');
  for (let index = 0; index < await reviewInputs.count(); index += 1) await reviewInputs.nth(index).check();
  await page.locator('#reviewDraft').click();
  await page.waitForFunction(() => /READY_FOR_LOCAL_RELEASE_APPROVAL/.test(document.getElementById('reviewStatus')?.textContent || ''));
  await page.waitForFunction(() => document.getElementById('approveRelease')?.disabled === false);
  await page.locator('#approveRelease').click();
  await page.waitForFunction(() => /"receipt_digest"/.test(document.getElementById('releaseReceipt')?.textContent || ''));
  await page.waitForFunction(() => document.body.dataset.ashLifecycle === 'RELEASE_ELIGIBLE');
  report.observations.release = { lifecycle: 'RELEASE_ELIGIBLE', exact_review_checks: await page.locator('[data-review]:checked').count() };

  await page.locator('.work-tab[data-workspace="save"]').click();
  await page.locator('#saveQuestions').fill('What additional public index confirms the range?');
  await page.locator('#saveNext').fill('Request the bounded public index.');
  await page.locator('#makeSave').click();
  await page.waitForFunction(() => /sealed locally/i.test(document.getElementById('saveStatus')?.textContent || ''));
  await page.waitForFunction(() => document.body.dataset.ashLifecycle === 'CONTINUITY_SEALED');
  await page.locator('#capsulePassphrase').fill(passphrase);
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#exportCapsule').click();
  const download = await downloadPromise;
  downloadedCapsule = path.join(artifactDir, await download.suggestedFilename());
  await download.saveAs(downloadedCapsule);
  await page.waitForFunction(() => /Encrypted copy exported/.test(document.getElementById('capsuleStatus')?.textContent || ''));
  report.observations.continuity = { lifecycle: 'CONTINUITY_SEALED', capsule_file: path.basename(downloadedCapsule) };
  await screenshot(page, '03-continuity-sealed.png');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => scrollTo(0, 0));
  const mobileCompleted = await layoutReceipt(page);
  assert(mobileCompleted.horizontal_overflow <= 1, `Completed mobile case introduced ${mobileCompleted.horizontal_overflow}px horizontal overflow.`);
  assert(mobileCompleted.clipped_controls.length === 0, `Completed mobile case clipped controls: ${mobileCompleted.clipped_controls.join(', ')}`);
  report.observations.mobile_completed_case = mobileCompleted;
  await screenshot(page, '04-mobile-completed-case.png');

  const recoveryContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce', acceptDownloads: true });
  const recoveryPage = await recoveryContext.newPage();
  recoveryPage.setDefaultTimeout(60000);
  await bootAsh(recoveryPage, { throughThreshold: false });
  assert(await recoveryPage.locator('#launch').isVisible(), 'Fresh recovery context did not expose the launch dialog.');
  await recoveryPage.locator('.work-tab[data-workspace="save"]').click();
  await recoveryPage.waitForTimeout(250);
  const recoveryWorkspace = await recoveryPage.evaluate(() => document.querySelector('.workspace.active')?.id || null);
  const importVisible = await recoveryPage.locator('#capsuleFile').isVisible();
  report.observations.blank_browser_capsule_recovery = { active_workspace: recoveryWorkspace, import_controls_visible: importVisible };
  await screenshot(recoveryPage, '05-blank-browser-recovery.png');
  if (!importVisible || recoveryWorkspace !== 'workspace-save') {
    report.seams.push({
      id: 'CAPSULE_RECOVERY_ENTRY_BLOCKED',
      severity: 'HIGH',
      surface: 'blank-browser recovery',
      evidence: { active_workspace: recoveryWorkspace, import_controls_visible: importVisible },
      required_patch: 'Expose capsule import before a case reaches RELEASE_ELIGIBLE while preserving save/export action gates.'
    });
    throw new Error('Encrypted capsule recovery is unreachable from a blank browser because the Save workspace is lifecycle-gated.');
  }

  await recoveryPage.locator('#capsulePassphrase').fill(passphrase);
  await recoveryPage.locator('#capsuleFile').setInputFiles(downloadedCapsule);
  await recoveryPage.locator('#importCapsule').click();
  await recoveryPage.waitForFunction(() => /Authenticated capsule opened/.test(document.getElementById('capsuleStatus')?.textContent || ''), null, { timeout: 90000 });
  await recoveryPage.waitForFunction(() => /TD613 Ash user flight/.test(document.getElementById('caseTitle')?.textContent || ''));
  report.observations.capsule_round_trip = { restored: true, lifecycle: await recoveryPage.evaluate(() => document.body.dataset.ashLifecycle) };
  const mobileBlank = await layoutReceipt(recoveryPage);
  assert(mobileBlank.horizontal_overflow <= 1, `Recovery mobile layout introduced ${mobileBlank.horizontal_overflow}px horizontal overflow.`);
  assert(mobileBlank.clipped_controls.length === 0, `Recovery mobile layout clipped controls: ${mobileBlank.clipped_controls.join(', ')}`);
  report.observations.mobile_recovery = mobileBlank;
  await recoveryContext.close();

  const cases = await readStore(page, 'cases');
  const releases = await readStore(page, 'releases');
  const saves = await readStore(page, 'savePoints');
  assert(cases.length >= 1 && releases.length >= 1 && saves.length >= 1, 'Flight records were not retained in local custody stores.');
  const unexpectedPost = nonReadRequests.filter(request => !/\/api\/dome-world\/ash-custody-register$/.test(request.url));
  if (syntheticCustody) assert(nonReadRequests.length === 0, `Local candidate emitted non-read requests: ${nonReadRequests.map(request => request.url).join(', ')}`);
  else assert(unexpectedPost.length === 0, `User flight emitted an unexpected write request: ${unexpectedPost.map(request => request.url).join(', ')}`);
  assert(httpErrors.length === 0, `User flight loaded failing product resources: ${httpErrors.map(item => `${item.status} ${item.url}`).join(', ')}`);
  assert(consoleErrors.length === 0, `User flight console errors: ${consoleErrors.join(' | ')}`);

  report.status = 'PASS';
} catch (error) {
  report.status = 'HOLD_FOR_REPAIR';
  report.error = { message: error.message, stack: error.stack };
  try { await screenshot(page, 'ash-user-flight-held.png'); } catch {}
  throw error;
} finally {
  const reportPath = path.join(artifactDir, 'ash-user-test-flight.json');
  await fsp.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  const files = await fsp.readdir(artifactDir).catch(() => []);
  const manifest = {};
  for (const file of files) {
    const target = path.join(artifactDir, file);
    if ((await fsp.stat(target)).isFile()) manifest[file] = sha256(await fsp.readFile(target));
  }
  await fsp.writeFile(path.join(artifactDir, 'evidence-manifest.json'), `${JSON.stringify({
    schema: 'td613.ash.user-test-flight-evidence-manifest/v0.1',
    source_status: sourceStatus,
    promotion_authorized: false,
    files: manifest
  }, null, 2)}\n`);
  await browser.close();
}

console.log('ash-user-test-flight.mjs passed');
