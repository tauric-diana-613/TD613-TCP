import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const base = String(process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-profile-demo-flight');
const keepUrl = `${base}/dome-world/ash-keep.html`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function browserExecutable() {
  const requested = process.env.TD613_BROWSER_EXECUTABLE;
  if (requested && fs.existsSync(requested)) return requested;
  return ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(candidate => fs.existsSync(candidate)) || null;
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

async function readCurrent(page) {
  return page.evaluate(() => new Promise((resolve, reject) => {
    const caseId = localStorage.getItem('td613.ash-keep.current-case');
    const request = indexedDB.open('td613-ash-keep');
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['cases', 'routeMemory']);
      const caseRequest = transaction.objectStore('cases').get(caseId);
      const routeRequest = transaction.objectStore('routeMemory').get(caseId);
      transaction.oncomplete = () => {
        db.close();
        resolve({ caseMap: caseRequest.result || null, routeMemory: routeRequest.result?.value || null });
      };
      transaction.onerror = () => { db.close(); reject(transaction.error); };
    };
    request.onerror = () => reject(request.error);
  }));
}

async function layoutReceipt(page) {
  return page.evaluate(() => ({
    viewport: { width: innerWidth, height: innerHeight },
    horizontal_overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
    active_workspace: document.querySelector('.workspace.active')?.id || null,
    visible_legacy_tabs: [...document.querySelectorAll('.work-tab')].filter(node => {
      const rect = node.getBoundingClientRect();
      return getComputedStyle(node).display !== 'none' && rect.width > 0 && rect.height > 0;
    }).map(node => node.dataset.workspace),
    visible_primary_destinations: [...document.querySelectorAll('[data-premium-workspace]')].filter(node => {
      const rect = node.getBoundingClientRect();
      return getComputedStyle(node).display !== 'none' && rect.width > 0 && rect.height > 0;
    }).map(node => node.dataset.premiumWorkspace),
    demo_profile: document.documentElement.dataset.ashDemoProfile || null,
    demo_version: document.documentElement.dataset.ashDemoProfiles || null
  }));
}

await fsp.mkdir(artifactDir, { recursive: true });
const executablePath = browserExecutable();
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const report = {
  schema: 'td613.ash.profile-demo-flight/v0.3-research-registered',
  base_url: base,
  status: 'RUNNING',
  profiles: {},
  research_registration: null,
  seams: [],
  console_errors: [],
  http_errors: []
};

async function fly(profile, expected) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  page.on('console', message => { if (message.type() === 'error') report.console_errors.push({ profile, text: message.text() }); });
  page.on('pageerror', error => report.console_errors.push({ profile, text: error.message }));
  page.on('response', response => { if (response.status() >= 400 && !/favicon\.ico/.test(response.url())) report.http_errors.push({ profile, status: response.status(), url: response.url() }); });

  await page.goto(keepUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.version)
    && Boolean(window.__td613AshProfileDemos?.version)
    && Boolean(window.__td613AshResearchDemo?.version)
    && Boolean(window.__td613AshResearchControlState?.version)
    && Boolean(window.__td613AshPremiumUI?.version)
    && Boolean(window.__td613AshGuidedOperatorUI?.version)
    && document.documentElement.dataset.ashDemoProfiles === 'td613.ash.profile-demos/v0.2-campaign-fundraiser');
  assert(await page.locator('#launch').isVisible(), `${profile}: launch was not visible in a blank browser.`);

  if (profile === 'political_campaign') {
    assert(await page.locator('#newProfile').inputValue() === '', 'Launch preloaded a workspace profile instead of Select a profile…');
    assert(await page.locator('#startDemo').isDisabled(), 'Demo button was active with no selected profile.');
    assert(await page.locator('#newCase').isDisabled(), 'New Case was active with no selected profile.');
    await page.locator('#newProfile').selectOption('research');
    await page.waitForFunction(() => {
      const button = document.getElementById('startDemo');
      return button && !button.disabled && button.getAttribute('aria-disabled') === 'false'
        && button.dataset.ashResearchControlState === 'READY'
        && /Research qualification demo/.test(button.textContent || '');
    });
    assert(await page.locator('#startDemo').isEnabled(), 'Research qualification demo did not register.');
    assert(await page.locator('#startDemo').evaluate(node => node.classList.contains('demo-available')), 'Research demo did not use the available visual posture.');
    assert(await page.locator('#newCase').isEnabled(), 'Blank Research workspace should remain available.');
    report.research_registration = await page.evaluate(() => ({
      version: window.__td613AshResearchDemo.version,
      control_state_version: window.__td613AshResearchControlState.version,
      counts: window.__td613AshResearchDemo.counts,
      assurance: window.__td613AshResearchDemo.assurance
    }));
  }

  await page.locator('#newProfile').selectOption(profile);
  assert(await page.locator('#startDemo').isEnabled(), `${profile}: demo button did not activate.`);
  assert((await page.locator('#startDemo').textContent()).includes(expected.button), `${profile}: demo button label is ambiguous.`);
  await page.locator('#startDemo').click();
  await page.waitForFunction(value => document.documentElement.dataset.ashDemoProfile === value, profile);
  await page.waitForFunction(title => document.getElementById('caseTitle')?.textContent?.includes(title), expected.title);

  const current = await readCurrent(page);
  assert(current.caseMap?.profile === profile, `${profile}: Case Map profile identity drifted.`);
  assert(current.caseMap?.rooms?.length === expected.rooms, `${profile}: Room count drifted.`);
  assert(current.caseMap?.nodes?.length === expected.nodes, `${profile}: object count drifted.`);
  assert(current.caseMap?.relationships?.length === expected.relationships, `${profile}: relation count drifted.`);
  assert(current.routeMemory?.entries?.length === 3, `${profile}: Route Memory was not hydrated.`);
  assert(await page.locator('#routeId').inputValue() === expected.route, `${profile}: route default did not hydrate.`);
  assert((await page.locator('#draftBody').inputValue()).length > 80, `${profile}: working draft did not hydrate.`);
  assert((await page.locator('#testRefs').inputValue()).split(',').length >= 5, `${profile}: test reference bank is too thin.`);
  assert((await page.locator('#researchNotes').inputValue()).includes('Synthetic'), `${profile}: synthetic-use note is absent.`);

  await openWorkspace(page, 'routes');
  assert(await page.locator('#routeList .route-card').count() === 3, `${profile}: hydrated routes are not visible.`);
  await page.screenshot({ path: path.join(artifactDir, `${profile}-desktop-routes.png`), fullPage: true });

  await openWorkspace(page, 'draft');
  assert(await page.locator('#workspace-draft').evaluate(node => node.classList.contains('active')), `${profile}: Draft workspace did not open.`);
  await page.screenshot({ path: path.join(artifactDir, `${profile}-desktop-draft.png`), fullPage: true });

  await page.setViewportSize({ width: 390, height: 844 });
  await openWorkspace(page, 'map');
  await page.waitForTimeout(150);
  const mobile = await layoutReceipt(page);
  assert(mobile.horizontal_overflow === 0, `${profile}: mobile document overflowed horizontally.`);
  assert(mobile.visible_legacy_tabs.length === 0, `${profile}: legacy workspace tabs reappeared.`);
  assert(mobile.visible_primary_destinations.length === 5, `${profile}: premium destination dock is incomplete.`);
  await page.screenshot({ path: path.join(artifactDir, `${profile}-mobile-map.png`), fullPage: true });

  report.profiles[profile] = {
    case_id: current.caseMap.case_id,
    case_map_digest: current.caseMap.case_map_digest,
    route_memory_digest: current.routeMemory.route_memory_digest,
    room_count: current.caseMap.rooms.length,
    node_count: current.caseMap.nodes.length,
    relationship_count: current.caseMap.relationships.length,
    route_count: current.routeMemory.entries.length,
    desktop_route_cards: 3,
    guided_navigation: true,
    mobile
  };
  await context.close();
}

try {
  await fly('political_campaign', {
    button: 'Political Campaign',
    title: 'Harbor City Mayoral Campaign',
    rooms: 9,
    nodes: 32,
    relationships: 34,
    route: 'route_reporter_response'
  });
  await fly('fundraiser', {
    button: 'Fundraiser',
    title: 'Northstar Arts Benefit',
    rooms: 10,
    nodes: 33,
    relationships: 35,
    route: 'route_lead_host_brief'
  });
  assert(report.research_registration?.assurance?.maximum === 'PA2_LOCALLY_EXECUTED', 'Research registration lost its PA2 ceiling.');
  assert(report.research_registration?.assurance?.unknown_readers === 'UNMEASURED', 'Research registration flattened unknown Readers.');
  assert(report.console_errors.length === 0, `Profile flights emitted console errors: ${JSON.stringify(report.console_errors)}`);
  assert(report.http_errors.length === 0, `Profile flights emitted HTTP errors: ${JSON.stringify(report.http_errors)}`);
  report.status = 'PASS';
} catch (error) {
  report.status = 'HOLD';
  report.seams.push({ message: error.message, stack: error.stack });
  throw error;
} finally {
  await fsp.writeFile(path.join(artifactDir, 'ash-profile-demo-flight.json'), JSON.stringify(report, null, 2));
  await browser.close();
}

console.log('ash-profile-demo-browser-probe.mjs passed');
