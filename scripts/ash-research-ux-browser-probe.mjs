import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const engines = { chromium, firefox, webkit };
const browserName = process.env.TD613_BROWSER || 'chromium';
const engine = engines[browserName];
if (!engine) throw new Error(`Unsupported browser: ${browserName}`);

const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const outputDir = path.resolve(process.env.TD613_ARTIFACT_DIR || `artifacts/ash-research-ux-${browserName}`);
const assert = (value, message) => { if (!value) throw new Error(message); };

function installObservers(page, report) {
  page.on('pageerror', error => report.page_errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error') report.console_errors.push(message.text());
  });
  page.on('response', response => {
    if (response.status() >= 400 && !/favicon\.ico/.test(response.url())) report.http_errors.push(`${response.status()} ${response.url()}`);
  });
  page.on('request', request => {
    const url = request.url();
    if (new URL(url).origin !== new URL(base).origin) report.external_requests.push(url);
    if (!['GET', 'HEAD'].includes(request.method())) report.non_read_requests.push(`${request.method()} ${url}`);
  });
}

async function waitForStableIngress(page) {
  await page.waitForFunction(() => {
    const composition = window.__td613AshAia3Composition?.current?.() || null;
    const url = new URL(location.href);
    const governedAshPath = location.pathname.endsWith('/dome-world/ash-threshold.html')
      || location.pathname.endsWith('/dome-world/ash-keep.html');
    return governedAshPath
      && !url.searchParams.has('ash_epoch')
      && document.documentElement.dataset.ashCompositionStable?.includes('stable-navigation-motion')
      && document.documentElement.dataset.ashCompositionHydrating !== 'true'
      && composition?.session_open === false
      && composition?.case_id == null
      && [null, 'WAITING_INGRESS_PROFILE'].includes(composition?.hold)
      && window.__td613AshResearchDemo?.version
      && window.__td613AshResearchControlState?.version;
  }, null, { timeout:60_000 });
}

async function waitForResearchHydration(page) {
  await page.waitForFunction(() => {
    const composition = window.__td613AshAia3Composition?.current?.() || null;
    const report = window.__td613AshResearchSurfaceReport || null;
    return document.documentElement.dataset.ashDemoProfile === 'research'
      && document.getElementById('caseTitle')?.textContent?.includes('Lumen Atlas Research Project')
      && composition?.session_open === true
      && composition?.membrane_ready === true
      && composition?.hold == null
      && Boolean(composition?.lifecycle_state)
      && composition?.route_count >= 4
      && composition?.task_count >= 4
      && report?.schema === 'td613.ash.research-surface-ledger/v0.1'
      && document.getElementById('researchMethodDocket')
      && document.getElementById('researchHydrationLedger')
      && document.documentElement.dataset.ashPremiumWorkspace === 'work';
  }, null, { timeout:60_000 });
}

async function workspaceState(page, workspace) {
  return page.evaluate(name => {
    const panel = document.getElementById(`workspace-${name}`);
    const rect = panel?.getBoundingClientRect() || null;
    const visible = node => {
      if (!node) return false;
      const style = getComputedStyle(node);
      const box = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > 0 && box.width > 0 && box.height > 0;
    };
    return {
      active:Boolean(panel?.classList.contains('active')),
      visible:visible(panel),
      top:rect ? Math.round(rect.top) : null,
      scrollY:Math.round(scrollY),
      target:document.documentElement.dataset.ashUxScrollTarget || null,
      premium_workspace:document.documentElement.dataset.ashPremiumWorkspace || null
    };
  }, workspace);
}

async function waitForWorkspaceGeometry(page, workspace) {
  await page.waitForFunction(name => {
    const panel = document.getElementById(`workspace-${name}`);
    if (!panel?.classList.contains('active')) return false;
    const style = getComputedStyle(panel);
    const rect = panel.getBoundingClientRect();
    return document.documentElement.dataset.ashUxScrollTarget === name
      && document.documentElement.dataset.ashPremiumWorkspace === name
      && style.display !== 'none'
      && style.visibility !== 'hidden'
      && Number(style.opacity) > 0
      && rect.width > 0
      && rect.height > 0;
  }, workspace);
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
}

async function openWorkDock(page) {
  const current = await page.evaluate(() => document.documentElement.dataset.ashPremiumWorkspace || null);
  if (current !== 'work') {
    const button = page.locator('#premiumPrimaryDock [data-premium-workspace="work"]');
    await button.click();
    await waitForWorkspaceGeometry(page, 'work');
  }
  await page.locator('#researchHydrationLedger').waitFor({ state:'visible' });
}

async function openFromLedger(page, workspace) {
  if (workspace === 'work') {
    await openWorkDock(page);
    await waitForWorkspaceGeometry(page, 'work');
    return workspaceState(page, 'work');
  }
  await openWorkDock(page);
  const button = page.locator(`[data-research-open="${workspace}"]`).first();
  await button.scrollIntoViewIfNeeded();
  await button.click();
  await waitForWorkspaceGeometry(page, workspace);
  return workspaceState(page, workspace);
}

await fs.mkdir(outputDir, { recursive:true });
const browser = await engine.launch({ headless:true });
const context = await browser.newContext({ viewport:{ width:1440, height:1000 }, locale:'en-US', colorScheme:'dark', reducedMotion:'no-preference' });
const page = await context.newPage();
page.setDefaultTimeout(60_000);

const report = {
  schema:'td613.ash.research-ux-browser-evidence/v0.2-composed-workspace-geometry',
  browser:browserName,
  status:'RUNNING',
  console_errors:[],
  page_errors:[],
  http_errors:[],
  external_requests:[],
  non_read_requests:[],
  observations:{},
  authority:{ counts_as_human_evidence:false, authorizes_provider_use:false, authorizes_transport:false, authorizes_release:false, authorizes_child_study:false }
};
installObservers(page, report);

let terminal = null;
try {
  await page.goto(`${base}/dome-world/ash-keep.html?presentation=aia&profile=research&nonce=${Date.now()}`, { waitUntil:'domcontentloaded' });
  await waitForStableIngress(page);
  assert(await page.locator('#launch').isVisible(), 'Research ingress was not visible after coherent release.');

  await page.locator('#newProfile').selectOption('research');
  await page.waitForFunction(() => {
    const button = document.getElementById('startDemo');
    return document.getElementById('newProfile')?.value === 'research'
      && button && !button.disabled
      && button.dataset.ashResearchControlState === 'READY'
      && button.textContent === 'Open Research project demo';
  });
  await page.locator('#startDemo').click();
  await waitForResearchHydration(page);

  const surfaceReport = await page.evaluate(() => window.__td613AshResearchSurfaceReport);
  const statuses = Object.fromEntries(surfaceReport.entries.map(entry => [entry.id, entry.status]));
  const bad = surfaceReport.entries.filter(entry => ['BLOCKED_OR_MISSING', 'BLOCKED_UNEXPECTEDLY', 'OVERHYDRATED_REVIEW'].includes(entry.status));
  assert(bad.length === 0, `Research ledger found unresolved UI surfaces: ${bad.map(entry => `${entry.id}:${entry.status}`).join(', ')}`);

  for (const id of ['home_view', 'map_view', 'work_view', 'rooms_view', 'routes_view', 'test_view', 'draft_view', 'save_view', 'choir_view', 'capsule_view', 'custody_view']) {
    assert(statuses[id] === 'HYDRATED', `${id} was not hydrated: ${statuses[id]}`);
  }
  for (const id of ['map_authoring', 'room_authoring', 'route_recording', 'accessible_table', 'quick_scan', 'custody_registration']) {
    assert(statuses[id] === 'READY_FOR_GESTURE', `${id} was not gesture-ready: ${statuses[id]}`);
  }
  for (const id of ['provider_approval', 'release_approval', 'unexpected_detail', 'imported_reader', 'capsule_passphrase']) {
    assert(statuses[id] === 'DORMANT_AS_DESIGNED', `${id} lost intentional dormancy: ${statuses[id]}`);
  }
  assert(statuses.destination_handoff === 'SEPARATE_BOUNDARY', 'Destination handoff collapsed into the local surface.');
  for (const id of ['custody_binding', 'rebuild_execution', 'draft_keep', 'save_point']) {
    assert(['HELD_BY_LIFECYCLE', 'AVAILABLE_AFTER_PRIOR_STATE'].includes(statuses[id]), `${id} escaped named lifecycle posture: ${statuses[id]}`);
  }

  const dormant = await page.evaluate(() => ({
    provider_approval:document.getElementById('providerApproval')?.checked,
    release_disabled:document.getElementById('approveRelease')?.disabled,
    unexpected:document.getElementById('unexpectedText')?.value,
    imported:document.getElementById('importedReaderOutput')?.value,
    passphrase:document.getElementById('premiumCapsulePassphrase')?.value || document.getElementById('capsulePassphrase')?.value || '',
    test_receipt:document.getElementById('testReceipt')?.textContent || '',
    release_receipt:document.getElementById('releaseReceipt')?.textContent || '',
    provider_packet:document.getElementById('providerPacket')?.textContent || '',
    save_cards:document.querySelectorAll('#saveList .save-card').length,
    capsule_status:document.getElementById('capsuleStatus')?.textContent || ''
  }));
  assert(dormant.provider_approval === false, 'Research demo pre-authorized provider generation.');
  assert(dormant.release_disabled === true, 'Research demo pre-authorized release.');
  assert(dormant.unexpected === '' && dormant.imported === '' && dormant.passphrase === '', 'Research demo fabricated provider output, novelty, or a Capsule credential.');
  assert(/No Rebuild Test yet/i.test(dormant.test_receipt), 'Research demo ran a Rebuild Test automatically.');
  assert(/No Release Receipt yet/i.test(dormant.release_receipt), 'Research demo created a Release Receipt automatically.');
  assert(/No Provider Packet yet/i.test(dormant.provider_packet), 'Research demo created a Provider Packet automatically.');
  assert(dormant.save_cards === 0, 'Research demo created a Save Point automatically.');

  const navigation = {};
  for (const workspace of ['map', 'test', 'draft', 'custody', 'choir', 'capsule', 'work']) {
    navigation[workspace] = await openFromLedger(page, workspace);
    assert(navigation[workspace].active && navigation[workspace].visible, `${workspace} failed to open from the Research hydration ledger.`);
    assert(navigation[workspace].premium_workspace === workspace, `${workspace} premium state drifted.`);
  }

  await page.setViewportSize({ width:390, height:844 });
  await openFromLedger(page, 'work');
  const mobile = await page.evaluate(() => ({
    overflow:Math.max(0, document.documentElement.scrollWidth - innerWidth),
    ledger_width:Math.round(document.getElementById('researchHydrationLedger')?.getBoundingClientRect().width || 0),
    dock:[...document.querySelectorAll('#premiumPrimaryDock button')].map(button => {
      const rect = button.getBoundingClientRect();
      return { width:Math.round(rect.width), height:Math.round(rect.height) };
    }),
    clipped:[...document.querySelectorAll('button,input,select,textarea,a')].filter(node => {
      const style = getComputedStyle(node), rect = node.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
    }).map(node => node.id || node.textContent?.trim().slice(0, 40))
  }));
  assert(mobile.overflow <= 1, `Research mobile overflow: ${mobile.overflow}`);
  assert(mobile.ledger_width > 0 && mobile.ledger_width <= 390, `Research ledger escaped the mobile viewport: ${mobile.ledger_width}`);
  assert(mobile.dock.length === 5 && mobile.dock.every(item => item.height >= 48), 'Research mobile dock targets regressed.');
  assert(mobile.clipped.length === 0, `Research mobile controls clipped: ${mobile.clipped.join(', ')}`);

  assert(report.console_errors.length === 0, `Console errors: ${report.console_errors.join(' | ')}`);
  assert(report.page_errors.length === 0, `Page errors: ${report.page_errors.join(' | ')}`);
  assert(report.http_errors.length === 0, `HTTP errors: ${report.http_errors.join(' | ')}`);
  assert(report.external_requests.length === 0, `External requests: ${report.external_requests.join(' | ')}`);
  assert(report.non_read_requests.length === 0, `Non-read requests: ${report.non_read_requests.join(' | ')}`);

  await page.screenshot({ path:path.join(outputDir, `${browserName}-research-hydration-ledger.png`), fullPage:true });
  report.status = 'PASS';
  report.observations = { surface_summary:surfaceReport.summary, statuses, dormant, navigation, mobile };
} catch (error) {
  terminal = error;
  report.status = 'HELD';
  report.hold_reason = error.message;
  report.hold_stack = error.stack;
  try { await page.screenshot({ path:path.join(outputDir, `${browserName}-research-hydration-ledger-held.png`), fullPage:true }); } catch {}
} finally {
  report.completed_at = new Date().toISOString();
  await fs.writeFile(path.join(outputDir, 'ash-research-ux-browser.json'), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  await context.close();
  await browser.close();
}

if (terminal) throw terminal;
console.log(JSON.stringify({ status:report.status, browser:browserName, summary:report.observations.surface_summary }, null, 2));
