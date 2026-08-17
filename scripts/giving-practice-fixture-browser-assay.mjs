import assert from 'node:assert/strict';

function isGivingApiRequest(request) {
  if (!['fetch', 'xhr'].includes(request.resourceType())) return false;
  try { return /\/api\/td613-ledger\/?$/.test(new URL(request.url()).pathname); } catch { return false; }
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function snapshot(page) {
  return page.evaluate(() => ({
    title: document.querySelector('#dossierTitle')?.value ?? null,
    searchName: document.querySelector('#searchName')?.value ?? null,
    dateFrom: document.querySelector('#dateFrom')?.value ?? null,
    exactMatch: Boolean(document.querySelector('#exactMatchToggle')?.checked),
    selectedSources: [...document.querySelectorAll('#sourceRegistry input[type="checkbox"]:checked')].map((input) => input.value),
    status: document.querySelector('#researchFileSampleStatus')?.textContent?.trim() ?? '',
    runSummary: document.querySelector('#runSummary')?.textContent?.trim() ?? '',
    sourceProgress: document.querySelector('#sourceProgress')?.innerHTML ?? '',
    sourceCards: [...document.querySelectorAll('#sourceProgress .source-run-card')].map((card) => ({ status: card.dataset.status || '', text: card.textContent?.replace(/\s+/g, ' ').trim() || '' })),
    recordList: document.querySelector('#recordList')?.innerHTML ?? '',
    receiptList: document.querySelector('#receiptList')?.innerHTML ?? '',
    campaignReceipts: document.querySelector('#campaignReceipts')?.innerHTML ?? '',
    vaultVersions: document.querySelector('#vaultVersions')?.innerHTML ?? '',
    coverageExecutiveLine: document.querySelector('#coverageExecutiveLine')?.textContent?.trim() ?? '',
    practiceLocked: document.querySelector('.source-picker')?.classList.contains('practice-source-locked') || false,
    practiceSource: document.querySelector('#sourceRegistry input[value="practice-bikini-bottom-votes"]')?.checked || false,
    fictionalCards: document.querySelectorAll('#recordList .record-card[data-fictional-sample="true"]').length,
    fictionalChips: document.querySelectorAll('#recordList .fictional-sample-chip').length,
    rawPracticeCards: [...document.querySelectorAll('#recordList .record-card')].filter((card) => String(card.dataset.record || '').startsWith('practice:giving.bikini-bottom-practice/')).length,
    reviewCount: Number(document.querySelector('#reviewCount')?.textContent || 0),
    queueStates: [...document.querySelectorAll('#contactQueueList .contact-queue-item')].map((row) => row.dataset.status || ''),
    vaultVersionCount: document.querySelectorAll('#vaultVersions .version-item').length,
    localSampleOptions: [...(document.querySelector('#localDossierSelect')?.options || [])].filter((option) => /SAMPLE — Bikini Bottom contributor review/.test(option.textContent || '')).length,
    floatingExit: Boolean(document.querySelector('#practiceFloatingExitButton')),
    exitDialogs: document.querySelectorAll('#practiceExitConfirm').length,
    campaignAsleep: document.querySelector('.tab[data-view="campaign"]')?.dataset.practiceAsleep === 'true',
    activeTab: document.querySelector('.ledger-tabs .tab.active')?.dataset.view || null,
    sleepingGeo: ['#givingStateFilter', '#campaignDirectoryState', '#campaignDirectoryMunicipal', '#campaignDirectoryJurisdiction'].map((selector) => ({
      selector,
      present: Boolean(document.querySelector(selector)),
      asleep: document.querySelector(selector)?.classList.contains('practice-geo-asleep') || false,
      disabledChildren: [...(document.querySelector(selector)?.querySelectorAll('input,button,select') || [])].every((node) => node.disabled)
    })),
    practiceObjects: document.querySelectorAll('#committeeSearchWorkspaceList [data-practice-object]').length,
    practiceCandidates: document.querySelectorAll('#campaignDirectoryCandidates [data-practice-candidate]').length
  }));
}

function diagnostics(state, requests = []) {
  return JSON.stringify({
    searchName: state.searchName,
    dateFrom: state.dateFrom,
    exactMatch: state.exactMatch,
    selectedSources: state.selectedSources,
    runSummary: state.runSummary,
    sourceCards: state.sourceCards,
    reviewCount: state.reviewCount,
    rawPracticeCards: state.rawPracticeCards,
    fictionalCards: state.fictionalCards,
    coverageExecutiveLine: state.coverageExecutiveLine,
    externalRequests: requests
  });
}

async function assertCenteredDialog(page) {
  const dialog = page.locator('#practiceExitConfirm:not([hidden])');
  await dialog.waitFor({ state: 'visible', timeout: 5000 });
  const box = await dialog.boundingBox();
  const viewport = page.viewportSize();
  assert.ok(box && viewport, 'Exit Sample Demo dialog must have a viewport box.');
  assert.ok(Math.abs((box.x + box.width / 2) - viewport.width / 2) < 32, 'Exit Sample Demo dialog must remain horizontally centered.');
  assert.ok(Math.abs((box.y + box.height / 2) - viewport.height / 2) < 48, 'Exit Sample Demo dialog must remain vertically centered.');
  assert.equal(await page.locator('#practiceExitConfirm').count(), 1, 'all exit entry points must share one dialog node');
}

async function dismissExitNo(page) {
  await assertCenteredDialog(page);
  await page.locator('[data-practice-exit="no"]').click();
  await page.waitForFunction(() => document.querySelector('#practiceExitConfirm')?.hidden === true);
}

export async function witnessGivingPracticeFixture(page) {
  await page.waitForSelector('#loadResearchSampleButton', { state: 'visible', timeout: 5000 });
  const before = await snapshot(page);
  const loadRequests = [];
  const onLoadRequest = (request) => { if (isGivingApiRequest(request)) loadRequests.push(request.url()); };
  page.on('request', onLoadRequest);
  try {
    await page.locator('#loadResearchSampleButton').click();
    await page.waitForTimeout(180);
  } finally { page.off('request', onLoadRequest); }

  const afterLoad = await snapshot(page);
  assert.equal(afterLoad.title, 'SAMPLE — Bikini Bottom contributor review');
  assert.equal(afterLoad.searchName, 'SpongeBob SquarePants');
  assert.equal(afterLoad.exactMatch, true);
  assert.equal(afterLoad.practiceLocked, true);
  assert.equal(afterLoad.practiceSource, true);
  assert.deepEqual(afterLoad.selectedSources, ['practice-bikini-bottom-votes']);
  assert.equal(afterLoad.floatingExit, true);
  assert.equal(afterLoad.exitDialogs, 1);
  assert.equal(afterLoad.campaignAsleep, true);
  assert.deepEqual(loadRequests, [], 'loading the fixture must remain zero-network');
  assert.equal(afterLoad.runSummary, before.runSummary);
  assert.equal(afterLoad.recordList, before.recordList);
  assert.equal(afterLoad.receiptList, before.receiptList);
  assert.equal(afterLoad.vaultVersions, before.vaultVersions);
  assert.match(afterLoad.status, /Practice case loaded/i);
  for (const item of afterLoad.sleepingGeo) {
    assert.equal(item.present, true, `${item.selector} must exist`);
    assert.equal(item.asleep, true, `${item.selector} must visibly sleep during practice`);
    assert.equal(item.disabledChildren, true, `${item.selector} children must be functionally disabled`);
  }

  // Exactly three exit entry points, all converging on the same centered dialog.
  await page.locator('#practiceExitButton').click();
  await dismissExitNo(page);
  await page.locator('#practiceFloatingExitButton').click();
  await dismissExitNo(page);
  const activeBeforeCampaign = (await snapshot(page)).activeTab;
  await page.locator('.tab[data-view="campaign"]').click();
  await assertCenteredDialog(page);
  assert.equal((await snapshot(page)).activeTab, activeBeforeCampaign);
  await page.locator('[data-practice-exit="no"]').click();

  // Candidate/committee lookup stays usable, but only the eight fictional objects
  // are reachable and no real Giving API request may escape.
  const directoryRequests = [];
  const onDirectoryRequest = (request) => { if (isGivingApiRequest(request)) directoryRequests.push(request.url()); };
  page.on('request', onDirectoryRequest);
  try {
    await page.locator('#campaignDirectoryQuery').fill('Bikini Bottom');
    await page.locator('#campaignDirectorySearchButton').click();
    await page.waitForFunction(() => document.querySelectorAll('#committeeSearchWorkspaceList [data-practice-object]').length === 8, null, { timeout: 5000 });
  } finally { page.off('request', onDirectoryRequest); }
  const afterDirectory = await snapshot(page);
  assert.deepEqual(directoryRequests, [], 'fictional candidate & committee lookup may not call real Giving APIs');
  assert.equal(afterDirectory.practiceObjects, 8);
  assert.equal(afterDirectory.practiceCandidates, 4);

  // Exact match begins ON but an explicit learner toggle remains honored.
  await page.locator('#exactMatchToggle').uncheck();
  assert.equal((await snapshot(page)).exactMatch, false);
  await page.locator('#exactMatchToggle').check();

  await page.evaluate(() => { globalThis.__TD613_GIVING_PRACTICE_DELAY_MS__ = 25; });
  const traversalRequests = [];
  const onTraversalRequest = (request) => { if (isGivingApiRequest(request)) traversalRequests.push(request.url()); };
  page.on('request', onTraversalRequest);
  try {
    await page.locator('#runSearchButton').click();
    await page.waitForFunction(() => {
      const card = document.querySelector('#sourceProgress .source-run-card');
      return card && !['QUEUED', 'RUNNING', 'NOT_RUN'].includes(card.dataset.status || '');
    }, null, { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(100);
  } finally { page.off('request', onTraversalRequest); }
  const afterSearch = await snapshot(page);
  const searchState = diagnostics(afterSearch, traversalRequests);
  assert.deepEqual(traversalRequests, [], `BikiniBottomVotes search must terminate in-browser: ${searchState}`);
  assert.equal(afterSearch.searchName, 'SpongeBob SquarePants', `seed query drifted: ${searchState}`);
  assert.deepEqual(afterSearch.selectedSources, ['practice-bikini-bottom-votes'], `source aperture drifted: ${searchState}`);
  assert.equal(afterSearch.sourceCards.length, 1, `missing practice source run: ${searchState}`);
  assert.equal(afterSearch.sourceCards[0]?.status, 'COMPLETE', `practice source did not complete: ${searchState}`);
  assert.equal(afterSearch.reviewCount, 13, `SpongeBob practice retrieval did not retain 13 records: ${searchState}`);
  assert.equal(afterSearch.rawPracticeCards, 13, `practice records were not rendered: ${searchState}`);
  assert.equal(afterSearch.fictionalChips, 13, `every practice contribution needs provenance: ${searchState}`);
  assert.match(afterSearch.sourceProgress, /BikiniBottomVotes/);

  await page.locator('.tab[data-view="review"]').click();
  await page.waitForSelector('#recordList .fictional-sample-chip', { state: 'visible', timeout: 5000 });
  await page.locator('#holdReviewButton').click();
  await page.locator('#addContactQueueButton').click();
  await page.waitForFunction(() => document.querySelectorAll('#contactQueueList .contact-queue-item').length === 4, null, { timeout: 5000 });

  const queueRequests = [];
  const onQueueRequest = (request) => { if (isGivingApiRequest(request)) queueRequests.push(request.url()); };
  page.on('request', onQueueRequest);
  try {
    await page.locator('#runContactQueueButton').click();
    await page.waitForFunction(() => {
      const rows = [...document.querySelectorAll('#contactQueueList .contact-queue-item')];
      return rows.length === 4 && rows.every((row) => ['SEARCHED', 'SOURCE HOLD', 'CLIENT HOLD'].includes(row.dataset.status || ''));
    }, null, { timeout: 20000 });
    await page.waitForTimeout(120);
  } finally { page.off('request', onQueueRequest); }
  const afterQueue = await snapshot(page);
  assert.deepEqual(queueRequests, [], 'queued fictional contributors may not escape the browser boundary');
  assert.deepEqual(afterQueue.queueStates, ['SEARCHED', 'SEARCHED', 'SEARCHED', 'SEARCHED']);
  assert.equal(afterQueue.reviewCount, 49, 'full practice hydration must retain all 49 fictional contributions');
  assert.equal(afterQueue.fictionalCards, 49);
  assert.equal(afterQueue.fictionalChips, 49);
  for (const name of ['SpongeBob SquarePants', 'Patrick Star', 'Sandy Cheeks', 'Eugene H. Krabs', 'Squidward Q. Tentacles']) assert.match(afterQueue.recordList, new RegExp(escapeRegExp(name)));
  for (const committee of ['King Neptune for King','Mrs. Puff for Bikini Bottom School District #67','Every Villain Is Lemons PAC','Sheldon Plankton for Bikini Bottom Campaign','Larry Lobster for Mayor of Bikini Bottom','Fishocratic Executive Committee','Friends of Aquaman PC','Krusty Krab Parking Expansion Referendum Committee']) assert.match(afterQueue.recordList, new RegExp(escapeRegExp(committee)));

  await page.locator('#saveDossierButton').click();
  await page.waitForFunction(() => [...(document.querySelector('#localDossierSelect')?.options || [])].some((option) => /SAMPLE — Bikini Bottom contributor review/.test(option.textContent || '')), null, { timeout: 5000 });

  await page.evaluate(() => {
    const select = document.querySelector('#localDossierSelect');
    const option = [...(select?.options || [])].find((candidate) => /SAMPLE — Bikini Bottom contributor review/.test(candidate.textContent || ''));
    if (select && option) { select.value = option.value; select.dispatchEvent(new Event('change', { bubbles: true })); }
  });
  await page.locator('#openDossierButton').click();
  await page.waitForFunction(() => Number(document.querySelector('#reviewCount')?.textContent || 0) === 49, null, { timeout: 5000 });
  assert.equal((await snapshot(page)).title, 'SAMPLE — Bikini Bottom contributor review');

  await page.locator('#researchFileVaultButton').click();
  await page.locator('#vaultPassphrase').fill('Bikini-Bottom-Practice-613-Key');
  const vaultRequests = [];
  const onVaultRequest = (request) => { if (isGivingApiRequest(request)) vaultRequests.push(request.url()); };
  page.on('request', onVaultRequest);
  try {
    await page.locator('#syncVaultButton').click();
    await page.waitForSelector('#vaultVersions .version-item', { state: 'visible', timeout: 20000 });
  } finally { page.off('request', onVaultRequest); }
  const afterVault = await snapshot(page);
  assert.deepEqual(vaultRequests, []);
  assert.ok(afterVault.vaultVersionCount >= 1);
  assert.equal(afterVault.floatingExit, true);

  await page.locator('#practiceFloatingExitButton').click();
  await assertCenteredDialog(page);
  await page.locator('[data-practice-exit="yes"]').click();
  await page.waitForFunction(() => document.documentElement.dataset.givingPractice !== 'true', null, { timeout: 5000 });
  const afterExit = await snapshot(page);
  assert.equal(afterExit.practiceLocked, false);
  assert.equal(afterExit.floatingExit, false);
  assert.equal(afterExit.campaignAsleep, false);
  assert.ok(afterExit.localSampleOptions >= 1);
  for (const item of afterExit.sleepingGeo) assert.equal(item.asleep, false, `${item.selector} must wake on confirmed exit`);

  return Object.freeze({
    schema: 'td613.giving.practice-fixture-browser-witness/v0.4',
    fixture: 'giving.bikini-bottom-practice/v0.1',
    manifestly_fictional: true,
    exit_entry_points: 3,
    shared_centered_exit_dialog: true,
    sleeping_real_geography: true,
    fictional_candidate_committee_lookup: true,
    fictional_committee_objects_observed: 8,
    fictional_contributors_observed: 5,
    fictional_records_observed: 49,
    local_practice_file_saved_and_reopened: true,
    encrypted_practice_vault_version_observed: true,
    external_retrieval_requests: 0,
    external_vault_requests: 0,
    evidence_authority_granted: false,
    consequence_authority_granted: false,
    status: 'PASS'
  });
}
