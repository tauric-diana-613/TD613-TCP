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

async function returnToMap(page) {
  await page.locator('[data-premium-workspace="map"]').click();
  await page.waitForSelector('#ashA8RelationWorkshop', { state:'visible', timeout:90_000 });
  await page.waitForFunction(() => document.getElementById('workspace-map')?.classList.contains('active'), null, { timeout:30_000 });
}

async function waitForStableCaseMap(page) {
  await page.waitForFunction(() => {
    const snapshot = window.__td613AshPremiumUI?.snapshot?.();
    const caseMap = snapshot?.caseMap;
    if (!caseMap?.case_map_digest) return false;
    const signature = `${caseMap.case_map_digest}:${caseMap.nodes?.length || 0}:${caseMap.relationships?.length || 0}`;
    const now = performance.now();
    const prior = window.__td613A8BaselineStability;
    if (!prior || prior.signature !== signature) {
      window.__td613A8BaselineStability = { signature, since:now };
      return false;
    }
    return now - prior.since >= 800;
  }, null, { timeout:90_000, polling:100 });
}

async function inspectA8(page) {
  await returnToMap(page);
  await waitForStableCaseMap(page);
  for (const selector of ['#ashA8ObjectPreview','#ashA8RelationPreview','#ashA8RelationshipList','#ashA8RelationDetail','#accessibleTable']) {
    if (!(await page.locator(selector).count())) throw new Error(`A8 missing ${selector}`);
  }
  if (await page.locator('#ashA8RelationDirection').count()) throw new Error('A8 exposed an undirected state the map engine cannot store.');

  const before = await page.evaluate(() => ({
    digest:window.__td613AshPremiumUI?.snapshot?.()?.caseMap?.case_map_digest || null,
    objects:window.__td613AshPremiumUI?.snapshot?.()?.caseMap?.nodes?.length || 0,
    relations:window.__td613AshPremiumUI?.snapshot?.()?.caseMap?.relationships?.length || 0,
    notes:document.getElementById('researchNotes')?.value || '',
    lifecycle:document.body.dataset.ashLifecycle || null
  }));

  const witnessName = `A8 Witness Object ${browserName}`;
  await page.locator('#ashA8ObjectName').fill(witnessName);
  await page.locator('#ashA8ObjectKnown').fill('Synthetic browser witness object.');
  await page.locator('#ashA8ObjectUncertain').fill('No human evidence inferred.');
  await page.locator('#ashA8ObjectEvidence').fill('browser-local synthetic fixture');
  await page.locator('#ashA8ObjectNotes').fill('A8 constitutionally held object witness.');
  await page.locator('#ashA8CommitObject').click();
  await page.waitForFunction(() => /Object held:.*CASE_BOUND required/i.test(document.getElementById('ashA8Status')?.textContent || ''), null, { timeout:30_000 });
  const afterObjectHold = await page.evaluate(() => ({
    digest:window.__td613AshPremiumUI?.snapshot?.()?.caseMap?.case_map_digest || null,
    objects:window.__td613AshPremiumUI?.snapshot?.()?.caseMap?.nodes?.length || 0,
    notes:document.getElementById('researchNotes')?.value || '',
    status:document.getElementById('ashA8Status')?.textContent || ''
  }));
  if (afterObjectHold.digest !== before.digest || afterObjectHold.objects !== before.objects) throw new Error('A8 pre-CASE_BOUND object hold mutated the Case Map.');
  if (afterObjectHold.notes !== before.notes) throw new Error('A8 pre-CASE_BOUND object hold wrote notes without stored successor state.');

  await returnToMap(page);
  if (await page.locator('#ashA8ObjectName').inputValue() !== witnessName) throw new Error('A8 object draft did not survive the Custody hold and explicit Map return.');

  const relationOptions = await page.locator('#ashA8RelationFrom option').evaluateAll(options => options.map(option => option.value).filter(Boolean));
  if (relationOptions.length < 2) throw new Error('A8 requires two existing objects to test the constitutional relation hold.');
  await page.locator('#ashA8RelationFrom').selectOption(relationOptions[0]);
  await page.locator('#ashA8RelationTo').selectOption(relationOptions[1]);
  await page.locator('#ashA8RelationType').fill('browser-witness-supports');
  await page.locator('#ashA8RelationEvidence').fill('browser-local synthetic fixture');
  await page.locator('#ashA8RelationUncertain').fill('Relation remains open to review.');
  await page.locator('#ashA8RelationNotes').fill('A8 constitutionally held relation witness.');
  await page.locator('#ashA8CommitRelation').click();
  await page.waitForFunction(() => /Relationship held:.*CASE_BOUND required/i.test(document.getElementById('ashA8Status')?.textContent || ''), null, { timeout:30_000 });
  const afterRelationHold = await page.evaluate(() => ({
    digest:window.__td613AshPremiumUI?.snapshot?.()?.caseMap?.case_map_digest || null,
    relations:window.__td613AshPremiumUI?.snapshot?.()?.caseMap?.relationships?.length || 0,
    notes:document.getElementById('researchNotes')?.value || '',
    status:document.getElementById('ashA8Status')?.textContent || ''
  }));
  if (afterRelationHold.digest !== before.digest || afterRelationHold.relations !== before.relations) throw new Error('A8 pre-CASE_BOUND relationship hold mutated the Case Map.');
  if (afterRelationHold.notes !== before.notes) throw new Error('A8 pre-CASE_BOUND relationship hold wrote notes without stored successor state.');

  await returnToMap(page);
  if (await page.locator('#ashA8RelationType').inputValue() !== 'browser-witness-supports') throw new Error('A8 relation draft did not survive the Custody hold and explicit Map return.');

  const inspect = page.locator('[data-ash-a8-inspect-relation]').first();
  if (!(await inspect.count())) throw new Error('A8 demo exposed no existing relationship for lawful inspection.');
  await inspect.click();
  await page.waitForFunction(() => document.getElementById('ashA8RelationDetail')?.hidden === false);
  const detail = await page.locator('#ashA8RelationDetail').innerText();
  if (!/Source posture/i.test(detail) || !/Exact relation ID/i.test(detail)) throw new Error('A8 stored relationship detail omitted source posture or exact identity.');
  await page.locator('[data-ash-a8-open-table]').first().click();
  await page.waitForFunction(() => document.getElementById('accessibleTable')?.classList.contains('active'));
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
    exact_workspace:[...document.querySelectorAll('.workspace.active')].map(node => node.id),
    lifecycle:document.body.dataset.ashLifecycle || null,
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
