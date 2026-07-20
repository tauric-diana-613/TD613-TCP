import fs from 'node:fs';
import path from 'node:path';
import { test, expect } from '@playwright/test';

const URL = 'https://td613.com/dome-world/domeblox/';
const OUT = path.resolve('domeblox-browser-observation');

test('DomeBlox production browser interaction', async ({ page }) => {
  fs.mkdirSync(OUT, { recursive: true });
  const consoleErrors = [];
  const pageErrors = [];
  const requestFailures = [];

  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', error => pageErrors.push(String(error)));
  page.on('requestfailed', request => {
    const failed = request.url();
    if (!failed.endsWith('/favicon.ico')) requestFailures.push(`${failed} :: ${request.failure()?.errorText || 'unknown'}`);
  });

  const response = await page.goto(URL, { waitUntil: 'networkidle', timeout: 45_000 });
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle('DomeBlox · Counter-Adversarial Bastion');
  await expect(page.locator('.canonical-scalar')).toHaveText(String.fromCodePoint(0x10D613));
  await expect(page.locator('.badge svg')).toBeVisible();

  const stationButtons = page.locator('.station');
  await expect(stationButtons).toHaveCount(6);
  for (let index = 0; index < 6; index += 1) {
    const button = stationButtons.nth(index);
    const panelId = await button.getAttribute('data-panel');
    await button.click();
    await expect(page.locator(`#${panelId}`)).toBeVisible();
    await expect(button).toHaveAttribute('aria-selected', 'true');
  }

  await page.locator('[data-panel="forge"]').click();
  await page.locator('#buildFamily').click();
  await expect(page.locator('#familyManifest')).toContainText('td613.domeblox.packet-family/v1.1');

  await page.locator('[data-panel="assay"]').click();
  await page.locator('#loadSyntheticFixture').click();
  await page.locator('#runAssay').click();
  await expect(page.locator('#assayResult')).toContainText('td613.domeblox.assay/v1.1');
  await expect(page.locator('#assayPosture')).not.toHaveText('NO ASSAY');

  await page.locator('[data-panel="moire"]').click();
  await page.locator('#runMoire').click();
  await expect(page.locator('#moireResult')).toContainText('td613.domeblox.moire/v1.1');

  await page.locator('[data-panel="registry"]').click();
  await expect(page.locator('#gameList .game-card')).toHaveCount(2);
  await expect(page.locator('#registryPosture')).toContainText('READY');

  await page.locator('[data-panel="receipts"]').click();
  await page.locator('#verifyLedger').click();
  await expect(page.locator('#ledgerStatus')).toContainText('VERIFIED');

  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('[data-panel="assay"]').click();
  await expect(page.locator('#assayResult')).toContainText('td613.domeblox.assay/v1.1');

  await page.screenshot({ path: path.join(OUT, 'domeblox-production.png'), fullPage: true });

  const receipt = {
    schema: 'td613.domeblox.deployed-chromium-interaction/v1',
    url: URL,
    status: 'PASS',
    title: await page.title(),
    exact_u10d613_present: await page.locator('.canonical-scalar').textContent() === String.fromCodePoint(0x10D613),
    stations_clicked: 6,
    packet_family_built: true,
    synthetic_assay_completed: true,
    moire_assay_completed: true,
    game_cards_observed: await page.locator('#gameList .game-card').count(),
    receipt_ledger_verified: true,
    tab_session_recovered_after_reload: true,
    console_errors: consoleErrors,
    page_errors: pageErrors,
    request_failures: requestFailures,
  };

  fs.writeFileSync(path.join(OUT, 'receipt.json'), `${JSON.stringify(receipt, null, 2)}\n`);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
  expect(requestFailures).toEqual([]);
});
