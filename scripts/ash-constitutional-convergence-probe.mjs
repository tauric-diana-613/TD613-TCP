import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

const base = (process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-constitutional-convergence';
const keepUrl = `${base}/dome-world/ash-keep.html`;
const allowedLocalKeys = new Set(['td613.ash-keep.current-case', 'td613.ash-keep.preferences']);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function executable() {
  const requested = process.env.TD613_BROWSER_EXECUTABLE;
  if (requested && fs.existsSync(requested)) return requested;
  const candidates = process.platform === 'win32'
    ? [
        'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe'
      ]
    : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  return candidates.find(candidate => fs.existsSync(candidate)) || null;
}

function digest(bytes) {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`;
}

async function snapshot(page) {
  return page.evaluate(async () => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('td613-ash-keep');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const output = {};
    for (const name of [...db.objectStoreNames]) {
      output[name] = await new Promise((resolve, reject) => {
        const request = db.transaction(name).objectStore(name).getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    }
    db.close();
    return output;
  });
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
    const custodyReference = `ashc_synthetic_${crypto.randomUUID()}`;
    const root = {
      id: `node_custody_${crypto.randomUUID().replaceAll('-', '')}`,
      type: 'artifact',
      label: 'Synthetic custody root',
      room_id: before.rooms[0]?.id || 'room_local',
      sensitivity: 'HIGH',
      source_status: 'OBSERVED',
      confidence_posture: 'OPEN',
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
      evidenceBasis: [...before.evidence_basis, 'synthetic local convergence fixture'],
      observations: [...before.observations, { kind: 'SYNTHETIC_CUSTODY_BINDING', raw_content_imported: false }],
      missingness: before.missingness,
      alternatives: before.alternatives,
      openQuestions: before.open_questions,
      operatorNotes: before.operator_notes,
      closureStatus: before.closure?.status
    });
    const readiness = { receipt_id: 'ash_ready_synthetic_convergence', state: 'READINESS_OBSERVED' };
    const custody = { receipt_id: custodyReference, receipt_digest: 'sha256:synthetic-custody-receipt', manifest_digest: 'sha256:synthetic-manifest', source_status: 'SYNTHETIC_LOCAL_FIXTURE' };
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
    await window.TD613AshConvergence.reconcileAuthority('synthetic-convergence-fixture');
    return { case_id: caseId, before_digest: before.case_map_digest, after_digest: after.case_map_digest, custody_reference: custodyReference };
  });
}

async function layout(page) {
  return page.evaluate(() => {
    const controls = [...document.querySelectorAll('button,input,select,textarea,a')].filter(node => {
      const rect = node.getBoundingClientRect();
      const style = getComputedStyle(node);
      return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    });
    const clipped = controls.filter(node => {
      const rect = node.getBoundingClientRect();
      let parent = node.parentElement;
      while (parent && parent !== document.body) {
        const style = getComputedStyle(parent);
        if (/(auto|scroll)/.test(style.overflowX) && parent.scrollWidth > parent.clientWidth + 1) return false;
        parent = parent.parentElement;
      }
      return rect.left < -1 || rect.right > innerWidth + 1;
    }).map(node => node.id || node.textContent.trim().slice(0, 40));
    return {
      width: innerWidth,
      height: innerHeight,
      horizontal_overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      clipped_controls: clipped,
      composition: document.documentElement.dataset.ashComposition || null,
      convergence: document.documentElement.dataset.ashConvergence || null,
      lifecycle: document.body.dataset.ashLifecycle || null
    };
  });
}

await fsp.mkdir(artifactDir, { recursive: true });
const executablePath = executable();
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const consoleErrors = [];
const requests = [];
const httpErrors = [];
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', error => consoleErrors.push(error.message));
page.on('request', request => requests.push({ method: request.method(), url: request.url(), body: request.postData() }));
page.on('response', response => {
  if (response.status() < 400) return;
  httpErrors.push({
    status: response.status(),
    url: response.url(),
    resource_type: response.request().resourceType()
  });
});
page.on('dialog', dialog => dialog.accept());

const report = {
  schema: 'td613.ash.constitutional-convergence-observation/v0.1',
  source_status: /localhost|127\.0\.0\.1/.test(base) ? 'LOCAL_VALIDATION' : 'DEPLOYED_OBSERVATION',
  status: 'RUNNING',
  promotion_authorized: false,
  observations: {},
  console_errors: consoleErrors,
  http_errors: httpErrors,
  browser_chrome_http_errors: []
};

try {
  await page.goto(keepUrl, { waitUntil: 'networkidle' });
  await page.locator('#startDemo').click();
  await page.waitForFunction(() => /Glasshouse Archive/i.test(document.getElementById('caseTitle')?.textContent || ''));
  await page.waitForFunction(() => document.documentElement.dataset.ashConvergence?.includes('constitutional-convergence'));
  const boot = await snapshot(page);
  const manifest = await page.evaluate(() => window.TD613AshConvergence.composition());
  assert(manifest?.layers?.map(layer => layer.layer_id).join('>') === 'dome-threshold>quick-scan>custody-root>keep-core>lifecycle>custody-workspace-bridges>controls-mobile>flowcore-adapter>aperture-adapter>hush-adapter>observer', 'Canonical composition order diverged.');
  const beforePermission = await page.evaluate(async () => {
    try { await window.TD613AshConvergence.authorize('APERTURE_REBUILD'); return 'OPEN'; }
    catch (error) { return error.message; }
  });
  assert(/CASE_BOUND/.test(beforePermission), 'Pre-custody Rebuild did not hold on lifecycle rank.');
  report.observations.composition = { manifest_digest: manifest.manifest_digest, layer_count: manifest.layers.length, pre_custody_rebuild: 'HELD' };

  report.observations.custody_binding = await bindSyntheticCustody(page);
  assert(report.observations.custody_binding.before_digest !== report.observations.custody_binding.after_digest, 'Custody binding did not mutate the Case Map digest.');
  await page.waitForFunction(() => document.body.dataset.ashLifecycle === 'CASE_BOUND');
  let authority = await page.evaluate(() => window.TD613AshConvergence.currentAuthorityContext());
  assert(authority?.lifecycle_rank === 'CASE_BOUND', 'Authority Context did not receive CASE_BOUND.');
  assert(authority?.case_map_digest === report.observations.custody_binding.after_digest, 'Authority Context did not bind the current Case Map.');

  await page.locator('[data-workspace="test"]').click();
  await page.locator('#loadSeed').click();
  await page.waitForFunction(() => /"test_digest"/.test(document.getElementById('testReceipt')?.textContent || ''));
  await page.waitForFunction(() => document.body.dataset.ashLifecycle === 'REBUILD_ELIGIBLE');
  await page.waitForFunction(async () => (await window.TD613AshConvergence.currentAuthorityContext())?.lifecycle_rank === 'REBUILD_ELIGIBLE');
  authority = await page.evaluate(() => window.TD613AshConvergence.currentAuthorityContext());
  const hushPermission = await page.evaluate(() => window.TD613AshConvergence.authorize('HUSH_CANDIDATE'));
  assert(hushPermission.authorized === true, 'Hush candidate permission did not open after current Rebuild evidence.');
  report.observations.authority_propagation = { authority_context_reference: authority.receipt_id, lifecycle_rank: authority.lifecycle_rank, rebuild_receipt_reference: authority.rebuild_receipt_reference };

  await page.locator('[data-workspace="map"]').click();
  await page.locator('#objectName').fill('Synthetic successor fact');
  await page.locator('#addObject').click();
  await page.waitForFunction(() => /added to/i.test(document.getElementById('mapEditStatus')?.textContent || ''));
  await page.waitForFunction(async () => {
    const context = await window.TD613AshConvergence.currentAuthorityContext();
    return context?.lifecycle_rank === 'CASE_BOUND' && context?.rebuild_receipt_reference === null;
  });
  const afterMutation = await snapshot(page);
  const invalidations = afterMutation.invalidations.map(record => record.value);
  const invalidation = invalidations.filter(receipt => receipt.changed_dimensions?.includes('CASE_MAP')).at(-1);
  assert(invalidation?.invalidated_targets?.length === 9, 'Stale invalidation omitted an authority surface.');
  assert(afterMutation.tests.length > 0, 'Stale Rebuild history was deleted instead of preserved.');
  report.observations.stale_invalidation = {
    receipt_id: invalidation.receipt_id,
    changed_dimensions: invalidation.changed_dimensions,
    invalidated_targets: invalidation.invalidated_targets,
    prior_test_preserved: true
  };

  await page.locator('#saveCase').click();
  await page.waitForFunction(() => /Case saved/i.test(document.getElementById('storageState')?.textContent || ''));
  const firstCase = await page.evaluate(() => localStorage.getItem('td613.ash-keep.current-case'));
  await page.locator('#closeCase').click();
  await page.locator('#launch').waitFor({ state: 'visible' });
  await page.locator('#newTitle').fill('Synthetic second case');
  await page.locator('#newCase').click();
  await page.waitForFunction(() => /Synthetic second case/i.test(document.getElementById('caseTitle')?.textContent || ''));
  const secondCase = await page.evaluate(() => localStorage.getItem('td613.ash-keep.current-case'));
  await page.locator('#saveCase').click();
  await page.locator('#closeCase').click();
  await page.locator('#launch').waitFor({ state: 'visible' });
  await page.waitForFunction(id => document.getElementById('selectCase')?.dataset.caseListState === 'READY' && [...document.getElementById('selectCase').options].some(option => option.value === id), secondCase);
  await page.locator('#selectCase').selectOption(firstCase);
  await page.waitForFunction(id => document.getElementById('selectCase')?.value === id, firstCase);
  await page.waitForFunction(() => document.getElementById('openSelectedCase')?.disabled === false);
  await page.evaluate(() => { window.__convergenceNoReload = crypto.randomUUID(); });
  const noReloadMarker = await page.evaluate(() => window.__convergenceNoReload);
  await page.locator('#openSelectedCase').click();
  await page.waitForFunction(id => localStorage.getItem('td613.ash-keep.current-case') === id && document.getElementById('launch')?.classList.contains('hidden'), firstCase);
  assert(await page.evaluate(() => window.__convergenceNoReload) === noReloadMarker, 'Opening a case reloaded the page.');
  await page.locator('#closeCase').click();
  await page.waitForFunction(id => document.getElementById('selectCase')?.dataset.caseListState === 'READY' && [...document.getElementById('selectCase').options].some(option => option.value === id), secondCase);
  await page.locator('#selectCase').selectOption(secondCase);
  await page.waitForFunction(() => document.getElementById('deleteSelectedCase')?.disabled === false);
  await page.locator('#deleteSelectedCase').click();
  await page.waitForFunction(({ deletedId, remainingId }) => {
    const select = document.getElementById('selectCase');
    return select?.dataset.caseListState === 'READY'
      && [...select.options].every(option => option.value !== deletedId)
      && [...select.options].some(option => option.value === remainingId);
  }, { deletedId: secondCase, remainingId: firstCase });
  const afterDelete = await snapshot(page);
  assert(afterDelete.tombstones.some(record => record.id === secondCase && record.value.status === 'DELETED_LOCAL'), 'Successful local deletion did not retain its scoped receipt.');
  report.observations.multi_case = { first_case: firstCase, second_case: secondCase, open_without_reload: true, second_case_deleted_locally: true };

  await page.locator('#selectCase').selectOption(firstCase);
  await page.waitForFunction(() => document.getElementById('openSelectedCase')?.disabled === false);
  await page.locator('#openSelectedCase').click();
  const secondPage = await context.newPage();
  await secondPage.goto(keepUrl, { waitUntil: 'networkidle' });
  const firstLock = page.evaluate(() => window.TD613AshConvergence.withOperation('probe-contention', async () => {
    localStorage.setItem('td613.ash-keep.probe-lock', 'HELD_BY_FIRST_TAB');
    await new Promise(resolve => setTimeout(resolve, 240));
    localStorage.setItem('td613.ash-keep.probe-lock', 'RELEASED_BY_FIRST_TAB');
    return 'RELEASED_BY_FIRST_TAB';
  }));
  await secondPage.waitForFunction(() => localStorage.getItem('td613.ash-keep.probe-lock') === 'HELD_BY_FIRST_TAB');
  const secondLock = secondPage.evaluate(() => window.TD613AshConvergence.withOperation('probe-contention', async () => localStorage.getItem('td613.ash-keep.probe-lock')));
  const [firstResult, secondResult] = await Promise.all([firstLock, secondLock]);
  assert(firstResult === 'RELEASED_BY_FIRST_TAB' && secondResult === 'RELEASED_BY_FIRST_TAB', 'Cross-tab lock did not serialize the same Ash operation.');
  await page.evaluate(() => localStorage.removeItem('td613.ash-keep.probe-lock'));
  await secondPage.close();
  report.observations.multi_tab = { serialized: true, second_tab_observed: secondResult };

  const deletionPlan = await page.evaluate(id => window.TD613AshConvergence.planDeletion(id, 'Synthetic interrupted case', true), firstCase);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(ref => indexedDB.open('td613-ash-keep') && document.documentElement.dataset.ashCaseControls, deletionPlan.receipt_id);
  await page.waitForFunction(async ref => {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('td613-ash-keep');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const rows = await new Promise((resolve, reject) => {
      const request = db.transaction('deletionReceipts').objectStore('deletionReceipts').getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return rows.some(row => row.value?.deletion_plan_reference === ref && row.value?.status === 'DELETE_PARTIAL_HOLD');
  }, deletionPlan.receipt_id);
  const audit = await page.evaluate(() => window.TD613AshConvergence.runDryCompatibilityAudit());
  assert(audit.mode === 'DRY_AUDIT_ONLY' && audit.mutation_performed === false && audit.migration_performed === false, 'Compatibility audit crossed its dry boundary.');
  report.observations.recovery = { interrupted_plan: deletionPlan.receipt_id, recovered_as: 'DELETE_PARTIAL_HOLD', compatibility_audit: audit.receipt_id, finding_count: audit.findings.length };

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => scrollTo(0, 0));
  report.observations.desktop = await layout(page);
  await page.screenshot({ path: path.join(artifactDir, 'constitutional-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => scrollTo(0, 0));
  report.observations.mobile_portrait = await layout(page);
  await page.screenshot({ path: path.join(artifactDir, 'constitutional-mobile-portrait.png'), fullPage: true });
  await page.setViewportSize({ width: 844, height: 390 });
  await page.evaluate(() => scrollTo(0, 0));
  report.observations.mobile_landscape = await layout(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => scrollTo(0, 0));
  report.observations.rotation_return = await layout(page);
  for (const [name, receipt] of Object.entries({ desktop: report.observations.desktop, mobile_portrait: report.observations.mobile_portrait, mobile_landscape: report.observations.mobile_landscape, rotation_return: report.observations.rotation_return })) {
    assert(receipt.horizontal_overflow <= 1, `${name} introduced horizontal overflow.`);
    assert(receipt.clipped_controls.length === 0, `${name} clipped visible controls: ${receipt.clipped_controls.join(', ')}`);
  }

  const localKeys = await page.evaluate(() => Object.keys(localStorage));
  assert(localKeys.every(key => allowedLocalKeys.has(key)), `Unexpected localStorage key: ${localKeys.filter(key => !allowedLocalKeys.has(key)).join(', ')}`);
  const nonRead = requests.filter(request => !['GET', 'HEAD'].includes(request.method));
  assert(nonRead.length === 0, `Convergence preview emitted non-read requests: ${nonRead.map(request => request.url).join(', ')}`);
  assert(!requests.some(request => /hush-generate|recipient|transport|cinder/i.test(request.url)), 'Convergence preview reached a provider, Cinder, or recipient route.');
  const browserChromeHttpErrors = httpErrors.filter(item => {
    try {
      return new URL(item.url).pathname === '/favicon.ico' && item.resource_type === 'other';
    } catch {
      return false;
    }
  });
  const productHttpErrors = httpErrors.filter(item => !browserChromeHttpErrors.includes(item));
  const materialConsoleErrors = consoleErrors.filter(message => {
    if (!/Failed to load resource: the server responded with a status of 404/i.test(message)) return true;
    return productHttpErrors.length > 0 || browserChromeHttpErrors.length === 0;
  });
  report.browser_chrome_http_errors = browserChromeHttpErrors;
  assert(productHttpErrors.length === 0, `Convergence preview loaded failing product resources: ${productHttpErrors.map(item => `${item.status} ${item.url}`).join(', ')}`);
  assert(materialConsoleErrors.length === 0, `Browser console errors: ${materialConsoleErrors.join(' | ')}`);
  report.observations.boundaries = {
    local_storage_keys: localKeys,
    non_read_requests: [],
    provider_recipient_cinder_transport_requests: [],
    product_http_errors: [],
    browser_chrome_http_errors: browserChromeHttpErrors
  };
  report.status = 'PASS';
} catch (error) {
  report.status = 'HOLD_FOR_REPAIR';
  report.error = { message: error.message, stack: error.stack };
  try { await page.screenshot({ path: path.join(artifactDir, 'constitutional-held.png'), fullPage: true }); } catch {}
  throw error;
} finally {
  const reportPath = path.join(artifactDir, 'ash-constitutional-convergence.json');
  await fsp.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  const files = await fsp.readdir(artifactDir).catch(() => []);
  const manifest = {};
  for (const file of files.filter(name => /\.(json|png)$/.test(name))) manifest[file] = digest(await fsp.readFile(path.join(artifactDir, file)));
  await fsp.writeFile(path.join(artifactDir, 'evidence-manifest.json'), `${JSON.stringify({
    schema: 'td613.ash.constitutional-convergence-evidence-manifest/v0.1',
    source_status: report.source_status,
    promotion_authorized: false,
    files: manifest
  }, null, 2)}\n`);
  await browser.close();
}

console.log('ash-constitutional-convergence-probe.mjs passed');
