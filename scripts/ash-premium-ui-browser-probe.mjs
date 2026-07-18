import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const base = (process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const artifactDir = path.resolve(process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-premium-ui');
const executablePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined;
const reportPath = path.join(artifactDir, 'ash-premium-ui-flight.json');

async function waitForPremium(page) {
  await page.waitForFunction(() => Boolean(
    window.__td613AshPremiumUI?.version
    && document.documentElement.dataset.ashPremiumUi?.includes('command-instrument')
  ), null, { timeout: 60_000 });
}

async function clearLocalAsh(page) {
  await page.evaluate(async () => {
    localStorage.clear();
    sessionStorage.clear();
    await new Promise(resolve => {
      const request = indexedDB.deleteDatabase('td613-ash-keep');
      request.onsuccess = request.onerror = request.onblocked = () => resolve();
    });
  });
}

async function layoutReceipt(page) {
  return page.evaluate(() => {
    const viewport = { width: innerWidth, height: innerHeight };
    const visible = [...document.querySelectorAll('button,a,input,select,textarea,[role="tab"]')]
      .filter(node => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
      });
    const intentionalScrollLane = node => {
      let parent = node.parentElement;
      while (parent && parent !== document.body) {
        const style = getComputedStyle(parent);
        if (/(auto|scroll)/.test(style.overflowX) && parent.scrollWidth > parent.clientWidth + 1) return parent;
        parent = parent.parentElement;
      }
      return null;
    };
    const controls = visible.map(node => ({
      id: node.id || node.textContent?.trim().slice(0, 40) || node.tagName,
      rect: node.getBoundingClientRect(),
      scroll_lane: intentionalScrollLane(node)?.className || null
    }));
    const clipped = controls
      .filter(item => !item.scroll_lane && (item.rect.left < -1 || item.rect.right > innerWidth + 1))
      .map(item => item.id);
    const scrollLaneControls = controls
      .filter(item => item.scroll_lane && (item.rect.left < -1 || item.rect.right > innerWidth + 1))
      .map(item => ({ id: item.id, lane: item.scroll_lane }));
    const dock = [...document.querySelectorAll('#premiumPrimaryDock button')].map(node => {
      const rect = node.getBoundingClientRect();
      return { label: node.textContent.trim(), width: rect.width, height: rect.height };
    });
    return {
      viewport,
      horizontal_overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      clipped_controls: clipped,
      scroll_lane_controls: scrollLaneControls,
      dock
    };
  });
}

async function hydrateProfile(page, profile, expectedTitle) {
  await page.locator('#newProfile').selectOption(profile);
  const demo = page.locator('#startDemo');
  await page.waitForFunction(value => {
    const button = document.getElementById('startDemo');
    return document.getElementById('newProfile')?.value === value
      && button && !button.disabled
      && button.getAttribute('aria-disabled') === 'false'
      && button.dataset.ashMethodDemoState === 'READY';
  }, profile, { timeout: 60_000 });
  assert(await demo.isEnabled(), `${profile} demo did not become available`);
  const started = Date.now();
  await demo.click();
  await page.waitForFunction(({ profile: value, title }) =>
    document.documentElement.dataset.ashDemoProfile === value
      && document.getElementById('caseTitle')?.textContent?.includes(title)
      && document.getElementById('apeqPaiaMethodDocket'),
  { profile, title: expectedTitle }, { timeout: 60_000 });
  assert.equal(document ? true : true, true);
  await page.evaluate(() => window.__td613AshPremiumUI.open('home'));
  await page.waitForFunction(title =>
    document.documentElement.dataset.ashPremiumWorkspace === 'home'
      && document.getElementById('premiumCaseLabel')?.textContent?.includes(title),
  expectedTitle, { timeout: 60_000 });
  const orientationMs = Date.now() - started;
  assert(orientationMs < 10_000, `${profile} exceeded ten-second useful-state measure`);
  return orientationMs;
}

async function flightProfile(context, profile, title) {
  const page = await context.newPage();
  const errors = [];
  const badResponses = [];
  let stage = 'open-page';
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400 && !/favicon\.ico/.test(response.url())) badResponses.push(`${response.status()} ${response.url()}`); });

  try {
    await page.goto(`${base}/dome-world/ash-keep.html`, { waitUntil: 'networkidle', timeout: 60_000 });
    await waitForPremium(page);
    await clearLocalAsh(page);
    await page.reload({ waitUntil: 'networkidle', timeout: 60_000 });
    await waitForPremium(page);

    stage = 'verify-primary-hierarchy';
    assert.equal(await page.locator('#premiumPrimaryDock button').count(), 5, 'Primary dock must contain exactly five destinations');
    const labels = await page.locator('#premiumPrimaryDock button').allTextContents();
    assert.deepEqual(labels.map(value => value.trim()), ['⌂Home', '米Map', 'àWork', '≈Choir', '⟐Capsule']);

    stage = 'verify-explicit-launch';
    assert(await page.locator('#launch').isVisible(), 'Clean Ash must show the explicit launch gate');
    assert.equal(await page.locator('#newProfile').inputValue(), '', 'Clean profile selection must begin blank');
    assert(!(await page.locator('#startDemo').isEnabled()), 'Demo must remain inert before profile selection');

    stage = 'hydrate-profile';
    const orientationMs = await hydrateProfile(page, profile, title);
    assert(await page.locator('#workspace-home').isVisible(), 'Hydration must arrive on Home after explicit premium navigation');
    assert(await page.locator('#premiumHomeBody .premium-hero').isVisible(), 'Command Deck hero missing');
    assert.match(await page.locator('#premiumProfileLabel').textContent(), profile === 'political_campaign' ? /Political Campaign/ : /Fundraiser/);
    assert.notEqual((await page.locator('#premiumNextAction').textContent()).trim(), '', 'Next lawful action must be visible');

    stage = 'open-work-queue';
    await page.locator('[data-premium-workspace="work"]').click();
    assert(await page.locator('#workspace-work').isVisible(), 'Work destination did not open');
    assert(await page.locator('#premiumWorkBody .priority-list').isVisible(), 'Profile work queue missing');
    assert(await page.locator('#premiumReceiptInventory').isVisible(), 'Receipt inventory missing');

    stage = 'run-choir';
    await page.locator('[data-premium-workspace="choir"]').click();
    assert(await page.locator('#workspace-choir').isVisible(), 'Choir destination did not open');
    assert.equal(await page.locator('[data-choir-projection]').count(), 6, 'Choir must expose all six qualified route projections');
    await page.locator('#runPremiumChoir').click();
    await page.waitForFunction(() => {
      const text = document.getElementById('premiumChoirReceipt')?.textContent || '';
      return text.includes('"mode": "PAIRWISE_MOIRE_REBUILD"') && text.includes('"real_surveillance_probability": null');
    }, null, { timeout: 60_000 });
    const receipt = JSON.parse(await page.locator('#premiumChoirReceipt').textContent());
    assert.equal(receipt.real_surveillance_probability, null);
    assert.equal(receipt.automatic_hold, false);
    assert.equal(receipt.automatic_ash_action, false);
    assert.equal(receipt.prediction_authorized, false);
    assert.equal(receipt.calibration_state, 'NOT_ENOUGH_TEST_DATA');
    await page.locator('#replayPremiumChoir').click();
    await page.waitForFunction(() => /MOIRE_REPLAY_VERIFIED/.test(document.getElementById('premiumChoirStatus')?.textContent || ''));

    stage = 'open-capsule';
    await page.locator('[data-premium-workspace="capsule"]').click();
    assert(await page.locator('#workspace-capsule').isVisible(), 'Capsule destination did not open');
    assert(await page.locator('#premiumCapsulePassphrase').isVisible(), 'Premium Capsule passphrase control missing');
    assert(await page.locator('#premiumImportCapsule').isEnabled(), 'Capsule recovery must remain available without a release');

    stage = 'open-command-sheet';
    await page.locator('#premiumMenuButton').click();
    assert(await page.locator('#premiumCommandSheet').isVisible(), 'Command sheet did not open');
    assert.equal(await page.locator('#premiumCommandSheet a[href="/safe-harbor/index.html"]').count(), 1);
    assert.equal(await page.locator('#premiumCommandSheet a[href="/dome-world/ash-destination-handoff.html"]').count(), 1);
    await page.locator('#closePremiumCommands').click();

    stage = 'verify-grouped-review';
    await page.evaluate(() => window.__td613AshPremiumUI.open('draft'));
    await page.waitForFunction(() => document.documentElement.dataset.ashPremiumWorkspace === 'draft');
    assert.equal(await page.locator('#reviewChecks .review-group').count(), 5, 'Review checks were not grouped into five decision clusters');

    stage = 'verify-mobile-layout';
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(250);
    const mobile = await layoutReceipt(page);
    assert.equal(mobile.horizontal_overflow, 0, `${profile} mobile document overflow`);
    assert.deepEqual(mobile.clipped_controls, [], `${profile} mobile clipped controls`);
    assert(mobile.dock.every(item => item.height >= 48), `${profile} dock target below 48px`);

    await fs.mkdir(artifactDir, { recursive: true });
    const screenshot = path.join(artifactDir, `${profile}-premium-mobile.png`);
    await page.screenshot({ path: screenshot, fullPage: true });

    stage = 'verify-runtime-errors';
    assert.deepEqual(errors, [], `${profile} browser errors: ${errors.join(' | ')}`);
    assert.deepEqual(badResponses, [], `${profile} HTTP errors: ${badResponses.join(' | ')}`);

    return {
      profile,
      orientation_ms: orientationMs,
      method_first_arrival: true,
      premium_home_opened_explicitly: true,
      qualified_route_projections: 6,
      mobile,
      choir: {
        assay_id: receipt.assay_id,
        pair_count: receipt.pairwise_residue.length,
        emergent_pair_count: receipt.emergent_pair_count,
        calibration_state: receipt.calibration_state,
        claim_ceiling_preserved: true
      },
      screenshot
    };
  } catch (error) {
    await fs.mkdir(artifactDir, { recursive: true });
    const failureScreenshot = path.join(artifactDir, `${profile}-held-${stage}.png`);
    try { await page.screenshot({ path: failureScreenshot, fullPage: true }); } catch {}
    error.premiumFlight = { profile, stage, errors, badResponses, failureScreenshot };
    throw error;
  } finally {
    await page.close();
  }
}

await fs.mkdir(artifactDir, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  locale: 'en-US',
  reducedMotion: 'reduce',
  acceptDownloads: true
});

const report = {
  schema: 'td613.ash.premium-ui-browser-flight/v0.2-apeq-paia',
  status: 'RUNNING',
  base_url: base,
  production_promotion_authorized: false,
  transport_authorized: false,
  cinder_authorized: false,
  profiles: [],
  hold: null
};

try {
  report.profiles.push(await flightProfile(context, 'political_campaign', 'Harbor City Mayoral Campaign'));
  report.profiles.push(await flightProfile(context, 'fundraiser', 'Northstar Arts Benefit'));
  report.status = 'PASS';
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));
} catch (error) {
  report.status = 'HOLD_FOR_REPAIR';
  report.hold = {
    message: error?.message || String(error),
    stack: error?.stack || null,
    ...(error?.premiumFlight || {})
  };
  await fs.writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.error(JSON.stringify(report, null, 2));
  throw error;
} finally {
  await context.close();
  await browser.close();
}
