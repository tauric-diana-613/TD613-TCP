import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const base = (process.env.TD613_BASE_URL || 'http://127.0.0.1:6130').replace(/\/$/, '');
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-map-object-registry';
const keepUrl = `${base}/dome-world/ash-keep.html`;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function waitForRegistry(page) {
  await page.waitForFunction(() => {
    const registry = document.getElementById('ashObjectRegistry');
    const items = document.querySelectorAll('#ashObjectRegistryList [data-object-index]');
    const state = window.__td613AshMapRegistryState?.();
    return registry?.dataset.registryState === 'POPULATED'
      && items.length > 0
      && state?.record_count === items.length;
  });
}

async function registrySnapshot(page) {
  return page.evaluate(() => {
    const registry = document.getElementById('ashObjectRegistry');
    const list = document.getElementById('ashObjectRegistryList');
    const items = [...document.querySelectorAll('#ashObjectRegistryList [data-object-index]')];
    const tooltip = document.getElementById('ashMapNodeLabel');
    const focus = document.getElementById('ashMapNodeFocus');
    const state = window.__td613AshMapRegistryState?.() || null;
    return {
      registry_state: registry?.dataset.registryState || null,
      count: items.length,
      row_count: document.querySelectorAll('#objectRows tr').length,
      first_label: items[0]?.querySelector('strong')?.textContent || null,
      last_label: items.at(-1)?.querySelector('strong')?.textContent || null,
      active_indices: items.filter(item => item.classList.contains('is-active')).map(item => Number(item.dataset.objectIndex)),
      list_scroll_top: list?.scrollTop || 0,
      tooltip_hidden: tooltip?.hidden ?? true,
      tooltip_text: tooltip?.textContent || '',
      focus_hidden: focus?.hidden ?? true,
      focus_transform: focus?.style.transform || '',
      state,
      horizontal_overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth)
    };
  });
}

async function hoverRegistryItem(page, position = 'last') {
  const items = page.locator('#ashObjectRegistryList [data-object-index]');
  const count = await items.count();
  const item = position === 'last' ? items.nth(count - 1) : items.nth(0);
  const label = (await item.locator('strong').textContent())?.trim();
  await item.hover();
  await page.waitForFunction(expected => {
    const tooltip = document.getElementById('ashMapNodeLabel');
    const focus = document.getElementById('ashMapNodeFocus');
    return tooltip && !tooltip.hidden && tooltip.textContent.includes(expected)
      && focus && !focus.hidden && /^translate\(/.test(focus.style.transform);
  }, label);
  return { item, label };
}

async function clickFocusedNode(page) {
  const coordinates = await page.evaluate(() => {
    const focus = document.getElementById('ashMapNodeFocus');
    const match = focus?.style.transform.match(/translate\((-?\d+)px,\s*(-?\d+)px\)/);
    if (!match) return null;
    return { x: Number(match[1]), y: Number(match[2]) };
  });
  assert(coordinates, 'Map focus coordinates were unavailable.');
  await page.locator('#caseCanvas').evaluate((canvas, point) => {
    const rect = canvas.getBoundingClientRect();
    const init = {
      bubbles: true,
      cancelable: true,
      pointerId: 613,
      pointerType: 'mouse',
      isPrimary: true,
      button: 0,
      buttons: 1,
      clientX: rect.left + point.x,
      clientY: rect.top + point.y
    };
    canvas.dispatchEvent(new PointerEvent('pointerdown', init));
    canvas.dispatchEvent(new PointerEvent('pointerup', { ...init, buttons: 0 }));
  }, coordinates);
}

await fs.mkdir(artifactDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
const page = await context.newPage();
const consoleErrors = [];
page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
page.on('pageerror', error => consoleErrors.push(error.message));

const report = {
  schema: 'td613.ash-keep.object-registry-observation/v0.1',
  status: 'RUNNING',
  source_status: base.includes('127.0.0.1') || base.includes('localhost') ? 'LOCAL_VALIDATION' : 'DEPLOYED_OBSERVATION',
  promotion_authorized: false,
  desktop: null,
  mobile: null,
  console_errors: consoleErrors,
  error: null
};

try {
  await page.goto(keepUrl, { waitUntil: 'networkidle' });
  await page.locator('#startDemo').click();
  await page.waitForFunction(() => /Glasshouse Archive/i.test(document.getElementById('caseTitle')?.textContent || ''));
  await waitForRegistry(page);

  let snapshot = await registrySnapshot(page);
  assert(snapshot.count === snapshot.row_count, 'Object Registry count diverged from the accessible object table.');
  assert(snapshot.state?.label_mode === 'overlay-only', 'Map label posture was not overlay-only.');
  assert(snapshot.state?.suppressed_label_count >= snapshot.count, 'Desktop legacy node labels were not fully suppressed.');
  const { item: desktopItem, label: desktopLabel } = await hoverRegistryItem(page, 'last');
  assert(await desktopItem.evaluate(node => node.classList.contains('is-active')), 'Registry hover did not highlight the registry object.');
  await clickFocusedNode(page);
  await page.waitForFunction(() => {
    const items = [...document.querySelectorAll('#ashObjectRegistryList [data-object-index]')];
    return items.some(item => item.classList.contains('is-returned') || item.getAttribute('aria-selected') === 'true');
  });
  snapshot = await registrySnapshot(page);
  assert(snapshot.tooltip_text.includes(desktopLabel), 'Map node click did not preserve the object label.');
  assert(snapshot.active_indices.length === 1, 'Map node click did not synchronize one registry object.');
  await page.screenshot({ path: path.join(artifactDir, 'ash-object-registry-desktop.png'), fullPage: true });
  report.desktop = snapshot;

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  await waitForRegistry(page);
  const mobileItems = page.locator('#ashObjectRegistryList [data-object-index]');
  const mobileCount = await mobileItems.count();
  const mobileItem = mobileItems.nth(Math.max(0, mobileCount - 1));
  const mobileLabel = (await mobileItem.locator('strong').textContent())?.trim();
  await mobileItem.click();
  await page.waitForFunction(expected => {
    const tooltip = document.getElementById('ashMapNodeLabel');
    return tooltip && !tooltip.hidden && tooltip.textContent.includes(expected);
  }, mobileLabel);
  snapshot = await registrySnapshot(page);
  assert(snapshot.count === snapshot.row_count, 'Mobile registry count diverged from the object table.');
  assert(snapshot.horizontal_overflow <= 1, `Mobile Object Registry introduced ${snapshot.horizontal_overflow}px horizontal overflow.`);
  assert(snapshot.state?.pinned_index !== null, 'Mobile tap did not pin a map object.');
  await page.screenshot({ path: path.join(artifactDir, 'ash-object-registry-mobile.png'), fullPage: true });
  report.mobile = snapshot;

  assert(consoleErrors.length === 0, `Object Registry emitted console errors: ${consoleErrors.join(' | ')}`);
  report.status = 'PASS';
} catch (error) {
  report.status = 'HOLD';
  report.error = error.stack || error.message;
  throw error;
} finally {
  await fs.writeFile(path.join(artifactDir, 'ash-map-object-registry.json'), `${JSON.stringify(report, null, 2)}\n`);
  await browser.close();
}

console.log('ash-map-object-registry-probe.mjs passed');
