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

async function inspectA8(page) {
  await page.locator('[data-premium-workspace="map"]').click();
  await page.waitForSelector('#ashA8RelationWorkshop', { state:'visible', timeout:90_000 });
  for (const selector of ['#ashA8ObjectPreview','#ashA8RelationPreview','#ashA8RelationshipList','#ashA8RelationDetail','#accessibleTable']) {
    if (!(await page.locator(selector).count())) throw new Error(`A8 missing ${selector}`);
  }
  if (await page.locator('#ashA8RelationDirection').count()) throw new Error('A8 exposed an undirected state the map engine cannot store.');

  const witnessName = `A8 Witness Object ${browserName}`;
  await page.locator('#ashA8ObjectName').fill(witnessName);
  await page.locator('#ashA8ObjectKnown').fill('Synthetic browser witness object.');
  await page.locator('#ashA8ObjectUncertain').fill('No human evidence inferred.');
  await page.locator('#ashA8ObjectEvidence').fill('browser-local synthetic fixture');
  await page.locator('#ashA8ObjectNotes').fill('A8 delegated-storage witness.');
  await page.locator('#ashA8CommitObject').click();
  await page.waitForFunction(name => window.__td613AshPremiumUI?.snapshot?.()?.caseMap?.nodes?.some(node => node.label === name), witnessName, { timeout:90_000 });
  await page.waitForFunction(name => [...document.querySelectorAll('#ashA8RelationTo option')].some(option => option.textContent === name), witnessName, { timeout:90_000 });

  const fromValue = await page.locator('#ashA8RelationFrom option').first().getAttribute('value');
  await page.locator('#ashA8RelationFrom').selectOption(fromValue || '');
  await page.locator('#ashA8RelationTo').selectOption({ label:witnessName });
  await page.locator('#ashA8RelationType').fill('browser-witness-supports');
  await page.locator('#ashA8RelationEvidence').fill('browser-local synthetic fixture');
  await page.locator('#ashA8RelationUncertain').fill('Relation remains open to review.');
  await page.locator('#ashA8RelationNotes').fill('A8 delegated-relation witness.');
  await page.locator('#ashA8CommitRelation').click();
  await page.waitForFunction(name => {
    const snapshot = window.__td613AshPremiumUI?.snapshot?.();
    const node = snapshot?.caseMap?.nodes?.find(item => item.label === name);
    return Boolean(node && snapshot?.caseMap?.relationships?.some(item => item.to === node.id && item.type === 'browser-witness-supports'));
  }, witnessName, { timeout:90_000 });
  await page.waitForFunction(() => /Stored relationship confirmed/i.test(document.getElementById('ashA8Status')?.textContent || ''), null, { timeout:90_000 });

  const inspect = page.locator('[data-ash-a8-inspect-relation]').last();
  await inspect.click();
  await page.waitForFunction(() => document.getElementById('ashA8RelationDetail')?.hidden === false);
  await page.locator('[data-ash-a8-open-table]').first().click();
  await page.waitForFunction(() => document.getElementById('accessibleTable')?.classList.contains('active'));
  const notes = await page.locator('#researchNotes').inputValue();
  if (!notes.includes('[A8 object]') || !notes.includes('[A8 relationship]')) throw new Error('A8 local notes/history lane did not receive both delegated records.');
}

async function inspectStage(page, stage) {
  if (stage === 'A7') {
    await page.locator('[data-premium-workspace="home"]').click();
    await page.waitForFunction(() => {
      const priority = document.getElementById('ashA7CurrentPriority');
      const continuity = document.getElementById('ashA7Continuity');
      const ledger = document.getElementById('ashA7RouteLedger');
      const text = (document.getElementById('premiumHomeBody')?.textContent || '').toLowerCase();
      return Boolean(priority?.isConnected && continuity?.isConnected && ledger?.isConnected)
        && ['what needs attention','what ash will not do','what remains attached','what has already left'].every(phrase => text.includes(phrase));
    }, null, { timeout:90_000 });
    const primaryCount = await page.locator('#ashA7CurrentPriority .ash-stage-primary-action:visible').count();
    if (primaryCount !== 1) throw new Error(`A7 expected one primary action, observed ${primaryCount}`);
  }
  if (stage === 'A8') await inspectA8(page);
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

async function preserveFailure(page, label, consoleErrors, error) {
  const diagnostic = await page.evaluate(() => ({
    title:document.title,
    url:location.pathname + location.search,
    module_graph:document.documentElement.dataset.ashModuleGraph || null,
    premium_ready:document.documentElement.dataset.ashPremiumReady || null,
    premium_workspace:document.documentElement.dataset.ashPremiumWorkspace || null,
    a7_flag:document.documentElement.dataset.ashA7Recompiled || null,
    a8_flag:document.documentElement.dataset.ashA8Recompiled || null,
    a7_api:window.__td613AshA7Home?.version || null,
    a8_api:window.__td613AshA8CaseMap?.version || null,
    premium_api:window.__td613AshPremiumUI?.version || null,
    snapshot:window.__td613AshPremiumUI?.snapshot?.() || null,
    home_dataset:document.getElementById('premiumHomeBody')?.dataset?.ashA7Home || null,
    home_html:document.getElementById('premiumHomeBody')?.innerHTML || null,
    home_text:document.getElementById('premiumHomeBody')?.textContent || null,
    priority_present:Boolean(document.getElementById('ashA7CurrentPriority')),
    continuity_present:Boolean(document.getElementById('ashA7Continuity')),
    ledger_present:Boolean(document.getElementById('ashA7RouteLedger')),
    a8_workshop_present:Boolean(document.getElementById('ashA8RelationWorkshop')),
    a8_status:document.getElementById('ashA8Status')?.textContent || null,
    accessible_table_active:document.getElementById('accessibleTable')?.classList.contains('active') || false,
    primary_count:document.querySelectorAll('#ashA7CurrentPriority .ash-stage-primary-action').length
  }));
  await fs.writeFile(path.join(artifactDir, `${browserName}-${label}-failure.json`), JSON.stringify({
    schema:'td613.ash.a7-a11-browser-failure/v0.1',
    browser:browserName,
    label,
    stages,
    error:String(error?.stack || error),
    console_errors:consoleErrors,
    diagnostic
  }, null, 2));
  await page.screenshot({ path:path.join(artifactDir, `${browserName}-${label}-failure.png`), fullPage:true }).catch(() => {});
}

async function runViewport(label, viewport, reducedMotion) {
  const context = await browser.newContext({ viewport, reducedMotion, colorScheme:'dark' });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', error => consoleErrors.push(String(error?.message || error)));
  try {
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
  } catch (error) {
    await preserveFailure(page, label, consoleErrors, error);
    throw error;
  } finally {
    await context.close();
  }
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
