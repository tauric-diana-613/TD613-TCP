import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const url = 'http://127.0.0.1:6130/encyclopedia/vix-cyb.html';
const entranceUrl = 'http://127.0.0.1:6130/encyclopedia/vix-cyb/podium.html';
const humanPodiumUrl = 'http://127.0.0.1:6130/encyclopedia/vix-cyb/human-podium.html';
const browser = await chromium.launch({ headless: true });

try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => Boolean(window.VixenReference && window.VIXEN_FOYER?.mounted === true), null, { timeout: 25000 });

  // 1. Header navigation cluster, history stack, cart badge truly empty & hidden at 0, motion icon, ? Help
  assert.equal(await page.locator('#collectionCount').isVisible(), false, 'Cart badge must stay hidden at 0');
  assert.equal((await page.locator('#collectionCount').innerText()).trim(), '', 'Empty cart badge must render zero counter text');
  assert.equal((await page.locator('#vixenCarryCount').innerText()).trim(), '', 'Empty carry rail counter must not show 0');
  assert.equal(await page.locator('#vixenHistoryBack').isDisabled(), true);
  assert.equal((await page.locator('#motionBtn').innerText()).trim(), '', 'Motion button uses SVG icon without visible text');

  // Open Works -> Verify Back / Forward history
  await page.locator('#vixenRoomRail [data-view="works"]').click();
  await page.locator('#view-works:not([hidden])').waitFor({ timeout: 10000 });
  assert.equal(await page.locator('#vixenHistoryBack').isDisabled(), false);
  await page.locator('#vixenHistoryBack').click();
  await page.locator('#view-overview:not([hidden])').waitFor({ timeout: 10000 });
  await page.locator('#vixenHistoryForward').click();
  await page.locator('#view-works:not([hidden])').waitFor({ timeout: 10000 });

  // 2. Works Sorting (filename, date, author + unresolved notice), Markdown inline image & PDF .extracted.txt truthfulness
  assert.ok((await page.locator('#worksListContainer .work-received-filenames').count()) === 32);
  await page.locator('#workSortSelect').selectOption('filename');
  const firstFilename = await page.locator('#worksListContainer .work-received-filenames').first().innerText();
  assert.match(firstFilename, /^1\+1=3\.md/i);

  await page.locator('#workSortSelect').selectOption('date');
  await page.locator('#workSortNotice:not([hidden])').waitFor({ timeout: 5000 });
  assert.match(await page.locator('#workSortNotice').innerText(), /CHRONOLOGY_UNRESOLVED/i);
  await page.locator('#workSortSelect').selectOption('author');
  assert.match(await page.locator('#workSortNotice').innerText(), /UNRESOLVED/i);
  await page.locator('#workSortOrderBtn').click();
  const firstDescNum = await page.locator('#worksListContainer .record-num').first().innerText();
  assert.equal(firstDescNum.trim(), '32', 'Descending unresolved sort must preserve deterministic catalogue #32 first');
  await page.locator('#workSortOrderBtn').click();

  // Select Work #02 Algedonic Systems (.pdf + .md pair): verify PDF downloads as .extracted.txt, never .pdf
  await page.locator('#worksListContainer [data-select-work="emwork_085223e721130117f5510975"]').click();
  const worksPdfDlPromise = page.waitForEvent('download');
  await page.locator('[data-download-kind="EXTRACTED_NATIVE_PDF_TEXT"]').first().click();
  const worksPdfDl = await worksPdfDlPromise;
  assert.match(worksPdfDl.suggestedFilename(), /\.extracted\.txt$/i, 'Works PDF derivative download must end in .extracted.txt');
  assert.doesNotMatch(worksPdfDl.suggestedFilename(), /\.pdf$/i);

  // Select Wearable Drone Control System Design (.md with embedded base64 images) & verify .md download
  await page.locator('#worksListContainer [data-select-work="emwork_0885af7e4851a2e81618b37a"]').click();
  await page.locator('#worksExperimentAReaderMount img.vix-reader-inline-img').first().waitFor({ state: 'visible', timeout: 20000 });
  const readerHeight = await page.locator('#expaCompanionBodyPre').evaluate((el) => el.scrollHeight);
  assert.ok(readerHeight < 60000, 'Base64 reference dump suppressed from prose; height=' + readerHeight);
  const worksMdDlPromise = page.waitForEvent('download');
  await page.locator('[data-download-kind="NATIVE_MARKDOWN"]').first().click();
  const worksMdDl = await worksMdDlPromise;
  assert.match(worksMdDl.suggestedFilename(), /\.md$/i);

  // Save Work to Cart -> Verify badge visible & Cart Popout functional
  await page.locator('[data-save-tray="emwork_0885af7e4851a2e81618b37a"]').click();
  assert.equal(await page.locator('#collectionCount').isVisible(), true);
  assert.equal(await page.locator('#collectionCount').innerText(), '1');
  await page.locator('#researchCartBtn').click();
  await page.locator('#researchCartPopout:not([hidden])').waitFor({ timeout: 5000 });
  assert.equal(await page.locator('#exportTrayBtn').isDisabled(), false);
  assert.equal(await page.locator('#researchCartPopout .cart-popout-item').count(), 1);
  await page.locator('#closeResearchCartBtn').click();

  // 3. Global Search Filename Verification -> Real user-facing open route for LLM Architecture Deep Dive
  await page.locator('.site-header [data-action="search"]').click();
  await page.locator('#searchDialog[open]').waitFor({ timeout: 5000 });
  await page.locator('#globalSearchInput').fill('LLM Architecture Deep Dive');
  await page.waitForFunction(() => document.querySelector('#globalSearchResults')?.innerText?.includes('LLM Architecture Deep Dive.md'), null, { timeout: 15000 });
  await page.locator('#globalSearchResults button[data-search-pick]').first().click();
  await page.locator('#view-works:not([hidden])').waitFor({ timeout: 10000 });
  assert.equal(await page.locator('#worksExperimentAReaderMount').getAttribute('data-work-id'), 'emwork_48f6c55fadb2e4d6b9dc4be8');

  // 4. Salon Crib, Manifesto, PDF .extracted.txt download & Carry Draft to Human Podium Composer
  await page.locator('#vixenRoomRail [data-view="collection"]').click();
  await page.locator('#view-collection:not([hidden])').waitFor({ timeout: 12000 });
  assert.ok((await page.locator('#salonMathCrib').innerText()).includes('S ≠ W ≠ A'));
  const manifestoText=await page.locator('#salonManifestoPanel').innerText();
  assert.match(manifestoText,/original manuscripts retain separate custody/i);
  assert.match(manifestoText,/no empirical validation/i);
  assert.doesNotMatch(manifestoText,/OPERAHOUSE ≠ OPERA ≠ PERFORMER/);
  assert.equal(await page.locator('#ciConjectureGrid .ci-conj-files').count(), 7);
  assert.equal(await page.locator('#salonSourceComparison').getAttribute('open'),null,'External source reader must not occupy the default synthesis page');
  await page.locator('#salonSourceComparison > summary').click();
  // Switch Salon Work I to Algedonic Systems PDF manifestation and verify .extracted.txt download
  await page.locator('#vixenSynthesisSalon select[aria-label="Choose Work 1"]').selectOption('emwork_085223e721130117f5510975');
  const salonPdfBtn = page.locator('#vixenSynthesisSalon [data-download-kind="EXTRACTED_NATIVE_PDF_TEXT"]').first();
  await salonPdfBtn.waitFor({ state: 'visible', timeout: 10000 });
  const salonDlPromise = page.waitForEvent('download');
  await salonPdfBtn.click();
  const salonDl = await salonDlPromise;
  assert.match(salonDl.suggestedFilename(), /\.extracted\.txt$/i, 'Salon PDF derivative download must end in .extracted.txt');

  // Verify standalone Footer Link -> Dual-Door Podium Entrance -> Human Podium
  await page.locator('#footerPodiumLink').click();
  await page.waitForURL('**/encyclopedia/vix-cyb/podium.html', { timeout: 10000 });
  assert.equal(await page.locator('#podiumDoorAi').getAttribute('href'), './llms.txt');
  assert.equal(await page.locator('#collectionCount').innerText(), '1', 'Cart badge must carry across standalone podium.html');
  // RP-F07: exercise actual optical links after AI focus reverses the geometry.
  const humanHit = page.locator('#bcThresholdPortal [data-bc-door="human"]');
  const aiHit = page.locator('#bcThresholdPortal [data-bc-door="ai"]');
  const prepareReversedThreshold = async () => {
    await humanHit.waitFor({ state: 'visible', timeout: 10000 });
    const initial = await humanHit.getAttribute('d');
    await page.locator('#podiumDoorAi').focus();
    await page.waitForFunction(d => document.querySelector('#bcThresholdPortal [data-bc-door="human"]')?.getAttribute('d') !== d, initial, { timeout: 10000 });
    assert.match(await page.locator('#bcThresholdPortal svg desc').textContent(), /Left bias panel \(HUMAN EXPEDITION\) and right counter-bias panel \(AI \/ LLM BRIEF\)/);
  };
  await prepareReversedThreshold();
  await aiHit.click();
  await page.waitForURL('**/encyclopedia/vix-cyb/llms.txt', { timeout: 10000 });
  await page.goto(entranceUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await prepareReversedThreshold();
  await humanHit.click();
  await page.waitForURL('**/encyclopedia/vix-cyb/human-podium.html*', { timeout: 10000 });
  await page.waitForFunction(() => window.VixenAIModes?.mounted === true, null, { timeout: 25000 });
  assert.equal(await page.locator('#collectionCount').innerText(), '1', 'Cart badge must carry into human-podium.html');
  assert.equal(await page.locator('#vmaStart').isDisabled(), true, 'Fresh Human Podium entry must keep Start disabled until role choice');

  // Composer Workbench inside standalone Human Podium + RP-F02 active-session role lock & tab coherence
  await page.locator('[data-podium-tab="composer"]').click();
  assert.equal(await page.locator('[data-podium-tab="composer"]').getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('[data-vma-role="COMPOSER"]').getAttribute('aria-pressed'), 'true');
  await page.locator('#vmaStart').click();
  await page.locator('#vmaComposerWorkbench:not([hidden])').waitFor({ timeout: 25000 });
  assert.equal(await page.evaluate(() => document.body.dataset.podiumEnv), 'composer', 'Active Composer must set data-podium-env="composer"');
  // Attempted switch to Maestro while Composer is locked must be refused and keep Composer tab active
  await page.locator('[data-podium-tab="maestro"]').click();
  assert.equal(await page.locator('[data-podium-tab="composer"]').getAttribute('aria-pressed'), 'true', 'Active Composer lock must keep composer tab highlighted');
  assert.equal(await page.locator('[data-podium-tab="maestro"]').getAttribute('aria-pressed'), 'false', 'Active Composer lock must refuse maestro tab highlight');
  assert.match(await page.locator('#vmaStatus').innerText(), /locked to COMPOSER/i);
  await page.getByRole('button', { name: 'Compute Podium Score & Gate' }).click();
  await page.waitForFunction(() => document.querySelector('#vmaComposerWorkbench .vma-comp-output')?.innerText?.includes('HELD_AWAITING_HUMAN_COMPOSER'), null, { timeout: 20000 });

  // End Composer session, lock Maestro, and verify reverse-direction refusal (Maestro -> Composer)
  await page.locator('#vmaEnd').click();
  await page.locator('#vmaEndSummary:not([hidden])').waitFor({ timeout: 10000 });
  await page.locator('[data-podium-tab="maestro"]').click();
  await page.locator('#vmaStart').click();
  await page.waitForFunction(() => window.VixenAIModes?.status()?.result?.role === 'MAESTRO', null, { timeout: 15000 });
  await page.locator('[data-podium-tab="composer"]').click();
  assert.equal(await page.locator('[data-podium-tab="maestro"]').getAttribute('aria-pressed'), 'true', 'Active Maestro lock must keep maestro tab highlighted');
  assert.equal(await page.locator('[data-podium-tab="composer"]').getAttribute('aria-pressed'), 'false', 'Active Maestro lock must refuse composer tab highlight');
  assert.match(await page.locator('#vmaStatus').innerText(), /locked to MAESTRO/i);
  await page.locator('#vmaEnd').click();
  await page.locator('[data-podium-tab="composer"]').click();
  await page.locator('#vmaStart').click();
  await page.locator('#vmaComposerWorkbench:not([hidden])').waitFor({ timeout: 25000 });

  // Verify F5 Refresh preserves deliberate restore rather than silently locking role/notes
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForFunction(() => window.VixenAIModes?.mounted === true, null, { timeout: 25000 });
  assert.equal(await page.locator('#vmaStart').isDisabled(), true, 'Refresh must not silently auto-lock role');
  assert.equal(await page.locator('#vmaRestoreBanner').isVisible(), true, 'Refresh must offer explicit restore banner');
  await page.locator('#vmaRestoreSessionBtn').click();
  await page.locator('#vmaPlayPanel:not([hidden])').waitFor({ timeout: 10000 });

  // Check Podium Settings & Help Tabs + User Help Guide Modal
  await page.locator('[data-podium-tab="settings"]').click();
  await page.locator('#view-operator:not([hidden])').waitFor({ timeout: 10000 });
  await page.locator('[data-podium-tab="help"]').click();
  await page.locator('#podiumHelpPane:not([hidden])').waitFor({ timeout: 5000 });

  // Return to Works & Back/Forward browser history
  await page.locator('.vix-podium-nav-links a[href="../vix-cyb.html#works"]').click();
  await page.waitForURL('**/encyclopedia/vix-cyb.html#works', { timeout: 10000 });
  await page.goBack({ waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForURL('**/encyclopedia/vix-cyb/human-podium.html*', { timeout: 10000 });

  // Verify Salon -> Carry to Podium Composer -> Human Podium direct handoff
  await page.goto(url + '#collection', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('#salonManifestoPanel button', { hasText: 'Carry to Podium Composer' }).click();
  await page.waitForURL('**/encyclopedia/vix-cyb/human-podium.html?from=salon#composer', { timeout: 10000 });
  await page.waitForFunction(() => window.VixenAIModes?.mounted === true, null, { timeout: 25000 });
  assert.equal(await page.locator('#vmaStart').isDisabled(), false, 'Explicit Salon Manifesto carry preselects Composer');

  // Verify User Help Guide Modal on main Opera
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('#headerHelpBtn').click();
  await page.locator('#inspectorDialog[open]').waitFor({ timeout: 5000 });
  assert.ok((await page.locator('#inspectorDialog').innerText()).includes('OPERAHOUSE ≠ OPERA ≠ PERFORMER'));
  await page.locator('#closeInspectorBtn').click();

  await ctx.close();

  // 6. Mobile 390x844 check across standalone podium.html + human-podium.html + main Search
  const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mPage = await mob.newPage();
  mPage.on('pageerror', (err) => errors.push(err.message));
  await mPage.goto(entranceUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  const mobEntranceOverflow = await mPage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  assert.equal(mobEntranceOverflow, true, 'Mobile standalone podium.html must not overflow');
  await mPage.locator('#podiumDoorHuman').click();
  await mPage.waitForURL('**/encyclopedia/vix-cyb/human-podium.html*', { timeout: 10000 });
  const mobHumanOverflow = await mPage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1);
  assert.equal(mobHumanOverflow, true, 'Mobile standalone human-podium.html must not overflow');
  await mPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await mPage.locator('.site-header [data-action="search"]').click();
  await mPage.locator('#searchDialog[open]').waitFor({ timeout: 5000 });
  await mPage.locator('#closeSearchBtn').click();
  await mob.close();

  assert.deepEqual(errors, [], 'Unexpected uncaught JS errors: ' + errors.join('; '));
  console.log('VIXEN SEAM ALLOWANCE INSTRUMENT BROWSER TEST PASS');
} finally {
  await browser.close();
}
