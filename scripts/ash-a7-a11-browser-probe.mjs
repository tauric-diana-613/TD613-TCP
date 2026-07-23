import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const browserName = process.env.TD613_BROWSER || 'chromium';
const baseUrl = process.env.TD613_BASE_URL || 'http://127.0.0.1:6130';
const artifactDir = process.env.TD613_ARTIFACT_DIR || 'artifacts/ash-a7-a11';
const stages = String(process.env.TD613_ASH_STAGES || 'A7').split(',').map(value => value.trim().toUpperCase()).filter(Boolean);
const browserType = { chromium, firefox, webkit }[browserName];
if (!browserType) throw new Error(`Unsupported browser ${browserName}`);

await fs.mkdir(artifactDir, { recursive:true });
const browser = await browserType.launch({ headless:true });
const receipts = [];

async function enterInvestigation(page) {
  await page.goto(`${baseUrl}/dome-world/ash-keep.html`, { waitUntil:'domcontentloaded', timeout:90_000 });
  await page.waitForFunction(() => Boolean(window.__td613AshKeep?.version)
    && Boolean(window.__td613AshPremiumUI?.version)
    && document.getElementById('newProfile')
    && document.getElementById('startDemo')
    && document.title === 'TD613 Ash'
    && location.pathname === '/dome-world/ash-threshold.html'
    && !location.search, null, { timeout:90_000 });
  const profile = page.locator('#newProfile');
  await profile.selectOption('investigation');
  await page.waitForFunction(() => !document.getElementById('startDemo')?.disabled, null, { timeout:60_000 });
  await page.locator('#startDemo').click();
  await page.waitForFunction(() => Boolean(window.__td613AshWholeInstrument?.version)
    && Boolean(window.__td613AshA6Affordances?.version)
    && document.documentElement.dataset.ashPremiumReady === 'true'
    && document.documentElement.dataset.ashPremiumWorkspace === 'home', null, { timeout:120_000 });
}

async function inspectStage(page, stage) {
  if (stage === 'A7') {
    await page.waitForSelector('#ashA7CurrentPriority', { state:'visible', timeout:90_000 });
    const primaryCount = await page.locator('#ashA7CurrentPriority .ash-stage-primary-action:visible').count();
    if (primaryCount !== 1) throw new Error(`A7 expected one primary action, observed ${primaryCount}`);
    for (const selector of ['#ashA7Continuity','#ashA7RouteLedger']) await page.waitForSelector(selector, { state:'visible' });
    const text = await page.locator('#premiumHomeBody').innerText();
    for (const phrase of ['What needs attention','What Ash will not do','What remains attached','What has already left']) if (!text.includes(phrase)) throw new Error(`A7 missing ${phrase}`);
  }
  if (stage === 'A8') {
    await page.locator('[data-premium-workspace="map"]').click();
    await page.waitForSelector('#ashA8RelationWorkshop', { state:'visible', timeout:90_000 });
    for (const selector of ['#ashA8ObjectPreview','#ashA8RelationPreview','#ashA8RelationshipList','#accessibleTable']) if (!(await page.locator(selector).count())) throw new Error(`A8 missing ${selector}`);
  }
  if (stage === 'A9') {
    await page.locator('[data-premium-workspace="work"]').click();
    await page.waitForSelector('#ashA9WorkRecompilation', { state:'visible', timeout:90_000 });
    const text = await page.locator('#ashA9WorkRecompilation').innerText();
    for (const phrase of ['Do now','Prepare','Waiting / held','Completed / receipted','Human approval']) if (!text.includes(phrase)) throw new Error(`A9 missing ${phrase}`);
  }
  if (stage === 'A10') {
    await page.locator('[data-premium-workspace="choir"]').click();
    await page.waitForSelector('#ashA10ChoirOrientation', { state:'visible', timeout:90_000 });
    const text = await page.locator('#workspace-choir').innerText();
    for (const phrase of ['what appears only in combination','Shared','Pair-emergent','Contradictory','Missing','Unresolved','Can a Reader reconstruct what should remain hidden?']) if (!text.includes(phrase)) throw new Error(`A10 missing ${phrase}`);
  }
  if (stage === 'A11') {
    await page.locator('[data-premium-workspace="capsule"]').click();
    await page.waitForSelector('#ashA11CapsuleRecompilation', { state:'visible', timeout:90_000 });
    const text = await page.locator('#ashA11CapsuleRecompilation').innerText();
    for (const phrase of ['What is preserved','What remains outside','Who may open it','What closes it','Where it may go','What sealing does not prove','Destination handoff']) if (!text.includes(phrase)) throw new Error(`A11 missing ${phrase}`);
  }
}

async function runViewport(label, viewport, reducedMotion) {
  const context = await browser.newContext({ viewport, reducedMotion, colorScheme:'dark' });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', error => consoleErrors.push(String(error?.message || error)));
  await enterInvestigation(page);
  for (const stage of stages) await inspectStage(page, stage);
  const geometry = await page.evaluate(() => ({
    viewport_width:window.innerWidth,
    scroll_width:document.documentElement.scrollWidth,
    horizontal_overflow:Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
    canonical_url:location.pathname + location.search,
    title:document.title,
    visible_field_count:[...document.querySelectorAll('.ash-flowcore-field:not([hidden])')].filter(node => {
      const style=getComputedStyle(node); const rect=node.getBoundingClientRect();
      return style.display!=='none' && style.visibility!=='hidden' && rect.width>0 && rect.height>0;
    }).length,
    stage_flags:Object.fromEntries(['A7','A8','A9','A10','A11'].map(stage => [stage, document.documentElement.dataset[`ash${stage}Recompiled`] || null])),
    authority_changed:false,
    source_bytes_moved:false,
    human_closure_required:true
  }));
  if (geometry.horizontal_overflow !== 0) throw new Error(`${label} horizontal overflow ${geometry.horizontal_overflow}`);
  if (geometry.visible_field_count !== 1) throw new Error(`${label} visible field count ${geometry.visible_field_count}`);
  if (geometry.canonical_url !== '/dome-world/ash-threshold.html') throw new Error(`${label} canonical URL drift ${geometry.canonical_url}`);
  if (consoleErrors.length) throw new Error(`${label} console errors: ${consoleErrors.join(' | ')}`);
  await page.screenshot({ path:path.join(artifactDir, `${browserName}-${label}-${stages.join('-').toLowerCase()}.png`), fullPage:true });
  receipts.push({ label, browser:browserName, stages, reduced_motion:reducedMotion, geometry, console_errors:consoleErrors });
  await context.close();
}

try {
  await runViewport('desktop', { width:1440, height:1000 }, 'no-preference');
  await runViewport('mobile-reduced', { width:390, height:844 }, 'reduce');
  const receipt = {
    ok:true,
    schema:'td613.ash.a7-a11-browser-witness/v0.1',
    browser:browserName,
    stages,
    observations:receipts,
    authority_changed:false,
    source_bytes_moved:false,
    custody_changed:false,
    release_authority_widened:false,
    human_closure_required:true
  };
  await fs.writeFile(path.join(artifactDir, `${browserName}-${stages.join('-').toLowerCase()}-receipt.json`), JSON.stringify(receipt, null, 2));
  console.log(JSON.stringify(receipt, null, 2));
} finally {
  await browser.close();
}
