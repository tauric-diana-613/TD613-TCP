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
    practiceCandidates: document.querySelectorAll('#campaignDirectoryCandidates [data-practice-candidate]').length,
    transactionBadges: [...document.querySelectorAll('#recordList .giving-transaction-class-badge')].map((badge) => badge.dataset.transactionClass || badge.textContent?.trim() || ''),
    preparedRoute: document.querySelector('#givingPreparedContributorHandoff:not([hidden]) .giving-prepared-handoff-copy')?.textContent?.trim() || '',
    preparedRouteStarted: document.querySelector('#givingPreparedContributorHandoff')?.dataset.searchStarted || '',
    committeeWorkspaceText: document.querySelector('#committeeSearchWorkspaceList')?.textContent?.replace(/\s+/g, ' ').trim() || ''
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
    transactionBadges: state.transactionBadges,
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

async function runPracticeSearch(page, { timeout = 12000 } = {}) {
  const requests = [];
  const onRequest = (request) => { if (isGivingApiRequest(request)) requests.push(request.url()); };
  page.on('request', onRequest);
  try {
    await page.locator('#runSearchButton').click();
    await page.waitForFunction(() => {
      const card = document.querySelector('#sourceProgress .source-run-card');
      return card && !['QUEUED', 'RUNNING', 'NOT_RUN'].includes(card.dataset.status || '');
    }, null, { timeout }).catch(() => {});
    await page.waitForTimeout(120);
  } finally { page.off('request', onRequest); }
  const state = await snapshot(page);
  assert.deepEqual(requests, [], `fictional search may not leave the browser: ${diagnostics(state, requests)}`);
  assert.equal(state.sourceCards.length, 1, `practice search needs exactly one fictional source run: ${diagnostics(state)}`);
  assert.equal(state.sourceCards[0]?.status, 'COMPLETE', `practice source did not complete: ${diagnostics(state)}`);
  return state;
}

async function searchPracticeDirectory(page, query) {
  const requests = [];
  const onRequest = (request) => { if (isGivingApiRequest(request)) requests.push(request.url()); };
  page.on('request', onRequest);
  try {
    await page.locator('#campaignDirectoryQuery').fill(query);
    await page.locator('#campaignDirectorySearchButton').click();
    await page.waitForTimeout(80);
  } finally { page.off('request', onRequest); }
  assert.deepEqual(requests, [], 'fictional candidate & committee lookup may not call real Giving APIs');
  return snapshot(page);
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

  // Exactly three exit entry points, all converging on one centered dialog.
  await page.locator('#practiceExitButton').click();
  await dismissExitNo(page);
  await page.locator('#practiceFloatingExitButton').click();
  await dismissExitNo(page);
  const activeBeforeCampaign = (await snapshot(page)).activeTab;
  await page.locator('.tab[data-view="campaign"]').click();
  await assertCenteredDialog(page);
  assert.equal((await snapshot(page)).activeTab, activeBeforeCampaign);
  await page.locator('[data-practice-exit="no"]').click();

  // Candidate/committee lookup remains usable against exactly eight fictional objects.
  const afterDirectory = await searchPracticeDirectory(page, 'Bikini Bottom');
  await page.waitForFunction(() => document.querySelectorAll('#committeeSearchWorkspaceList [data-practice-object]').length === 8, null, { timeout: 5000 });
  const directoryState = await snapshot(page);
  assert.equal(directoryState.practiceObjects, 8);
  assert.equal(directoryState.practiceCandidates, 4);

  // Exact starts ON but an explicit learner toggle remains honored.
  await page.locator('#exactMatchToggle').uncheck();
  assert.equal((await snapshot(page)).exactMatch, false);
  await page.locator('#exactMatchToggle').check();

  // Speed only the witness; production practice keeps the authored 8–16 second search delay.
  await page.evaluate(() => { globalThis.__TD613_GIVING_PRACTICE_DELAY_MS__ = 25; });

  // SpongeBob: ordinary cash records plus the in-kind catering lane.
  const afterSponge = await runPracticeSearch(page);
  assert.equal(afterSponge.searchName, 'SpongeBob SquarePants');
  assert.deepEqual(afterSponge.selectedSources, ['practice-bikini-bottom-votes']);
  assert.ok(afterSponge.reviewCount > 13, 'SpongeBob must retain ordinary cash records plus added in-kind records');
  assert.equal(afterSponge.rawPracticeCards, afterSponge.reviewCount, 'all rendered demo records must remain practice-scoped');
  assert.equal(afterSponge.fictionalChips, afterSponge.rawPracticeCards, 'every fictional contribution needs visible provenance');
  assert.match(afterSponge.sourceProgress, /BikiniBottomVotes/);

  await page.locator('.tab[data-view="review"]').click();
  await page.waitForSelector('#recordList .fictional-sample-chip', { state: 'visible', timeout: 5000 });
  await page.waitForFunction(() => document.querySelectorAll('#recordList .giving-transaction-class-badge[data-transaction-class="IN-KIND"]').length >= 1, null, { timeout: 5000 });
  assert.ok((await snapshot(page)).transactionBadges.includes('IN-KIND'), 'SpongeBob catering records must visibly teach IN-KIND');

  // Preserve the authored five-person starting route: SpongeBob + four queued names.
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
  assert.ok(afterQueue.reviewCount > 49, 'expanded practice hydration must outgrow the obsolete 49-row toy dataset');
  assert.equal(afterQueue.fictionalCards, afterQueue.reviewCount);
  assert.equal(afterQueue.fictionalChips, afterQueue.reviewCount);
  for (const name of ['SpongeBob SquarePants', 'Patrick Star', 'Sandy Cheeks', 'Eugene H. Krabs', 'Squidward Q. Tentacles']) {
    assert.match(afterQueue.recordList, new RegExp(escapeRegExp(name)));
  }
  for (const committee of ['King Neptune for King','Puff for Bikini Bottom School District #67','Every Villain Is Lemons PAC','Sheldon Plankton for Bikini Bottom Campaign','Larry Lobster for Mayor of Bikini Bottom','Fishocratic Executive Committee','Friends of Aquaman PC','Krusty Krab Parking Expansion Referendum Committee']) {
    assert.match(afterQueue.recordList, new RegExp(escapeRegExp(committee)));
  }

  // Broad matching creates consequence: nearby names become visible only after the learner widens the aperture.
  await page.locator('#exactMatchToggle').uncheck();
  await page.locator('#searchName').fill('Sandy');
  const afterBroadSandy = await runPracticeSearch(page);
  assert.match(afterBroadSandy.recordList, /Sandy Grouper/, 'broad Sandy search should surface the separate Sandy Grouper contributor');
  assert.match(afterBroadSandy.recordList, /Sandra Cheeks/, 'broad Sandy search should expose declared alias/name-variant continuity');
  await page.locator('#exactMatchToggle').check();

  // Referendum rabbit hole: committee -> unexpected donor -> prepared Individual Contributor.
  await searchPracticeDirectory(page, 'Krusty Krab Parking Expansion Referendum Committee');
  await page.waitForFunction(() => document.querySelectorAll('#committeeSearchWorkspaceList [data-practice-object]').length === 1, null, { timeout: 5000 });
  const referendumState = await snapshot(page);
  assert.match(referendumState.committeeWorkspaceText, /Eugene H\. Krabs/);
  assert.match(referendumState.committeeWorkspaceText, /Pearl Krabs/);
  assert.match(referendumState.committeeWorkspaceText, /Krusty Krab LLC/);
  assert.match(referendumState.committeeWorkspaceText, /Barnacle Boy/);
  assert.match(referendumState.committeeWorkspaceText, /\$2,\d{3},\d{3}/, 'referendum should visibly carry the multimillion-dollar Krabs concentration');
  await page.locator('#committeeSearchWorkspaceList [data-practice-contributor="Barnacle Boy"]').click();
  await page.waitForFunction(() => document.querySelector('#searchName')?.value === 'Barnacle Boy');
  const preparedBarnacle = await snapshot(page);
  assert.match(preparedBarnacle.preparedRoute, /Barnacle Boy/);
  assert.match(preparedBarnacle.preparedRoute, /Krusty Krab Parking Expansion Referendum Committee/);
  assert.match(preparedBarnacle.preparedRoute, /nothing searched/i);
  assert.equal(preparedBarnacle.preparedRouteStarted, 'false');
  const afterBarnacle = await runPracticeSearch(page);
  assert.match(afterBarnacle.recordList, /Barnacle Boy/);
  assert.equal((await snapshot(page)).preparedRouteStarted, 'true', 'prepared route should change state only after explicit SEARCH');

  // Plankton negative space: the Krabs trio is absent inside this fictional committee aperture.
  await searchPracticeDirectory(page, 'Sheldon Plankton for Bikini Bottom Campaign');
  await page.waitForFunction(() => document.querySelectorAll('#committeeSearchWorkspaceList [data-practice-object]').length === 1, null, { timeout: 5000 });
  for (const name of ['Eugene H. Krabs', 'Pearl Krabs', 'Krusty Krab LLC']) {
    assert.equal(await page.locator(`#committeeSearchWorkspaceList [data-practice-contributor="${name}"]`).count(), 0, `${name} must remain absent from the observed Plankton practice ledger`);
  }

  // Larry is the separate transaction-class lane: large candidate self-financing appears as LOAN.
  await searchPracticeDirectory(page, 'Larry Lobster for Mayor of Bikini Bottom');
  await page.waitForFunction(() => document.querySelectorAll('#committeeSearchWorkspaceList [data-practice-object]').length === 1, null, { timeout: 5000 });
  await page.locator('#committeeSearchWorkspaceList [data-practice-contributor="Larry Lobster"]').click();
  await page.waitForFunction(() => document.querySelector('#searchName')?.value === 'Larry Lobster');
  const afterLarry = await runPracticeSearch(page);
  await page.locator('.tab[data-view="review"]').click();
  await page.waitForFunction(() => document.querySelectorAll('#recordList .giving-transaction-class-badge[data-transaction-class="LOAN"]').length >= 1, null, { timeout: 5000 });
  const afterLoanBadge = await snapshot(page);
  assert.ok(afterLoanBadge.transactionBadges.includes('LOAN'), 'Larry self-financing records must visibly teach LOAN');
  assert.ok(afterLoanBadge.reviewCount > afterQueue.reviewCount, 'discoverable contributors must expand the dossier rather than swap through a fixed row pool');

  const hydratedCount = afterLoanBadge.reviewCount;
  assert.ok(hydratedCount > 49);

  // The richer dossier must still survive local custody and reopen at its actual dynamic size.
  await page.locator('#saveDossierButton').click();
  await page.waitForFunction(() => [...(document.querySelector('#localDossierSelect')?.options || [])].some((option) => /SAMPLE — Bikini Bottom contributor review/.test(option.textContent || '')), null, { timeout: 5000 });
  await page.evaluate(() => {
    const select = document.querySelector('#localDossierSelect');
    const option = [...(select?.options || [])].find((candidate) => /SAMPLE — Bikini Bottom contributor review/.test(candidate.textContent || ''));
    if (select && option) { select.value = option.value; select.dispatchEvent(new Event('change', { bubbles: true })); }
  });
  await page.locator('#openDossierButton').click();
  await page.waitForFunction((count) => Number(document.querySelector('#reviewCount')?.textContent || 0) === count, hydratedCount, { timeout: 5000 });
  assert.equal((await snapshot(page)).title, 'SAMPLE — Bikini Bottom contributor review');

  // Vault handoff must snap to the top and keep practice custody in-browser.
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
    schema: 'td613.giving.practice-fixture-browser-witness/v0.5',
    fixture: 'giving.bikini-bottom-practice/v0.1',
    manifestly_fictional: true,
    exit_entry_points: 3,
    shared_centered_exit_dialog: true,
    sleeping_real_geography: true,
    fictional_candidate_committee_lookup: true,
    fictional_committee_objects_observed: 8,
    authored_starting_contributors_observed: 5,
    expanded_dossier_record_count: hydratedCount,
    expanded_dataset_exceeds_legacy_49: hydratedCount > 49,
    broad_match_consequence_observed: true,
    non_preloaded_discovery_route_observed: true,
    prepared_route_memory_observed: true,
    in_kind_badge_observed: true,
    loan_badge_observed: true,
    referendum_multimillion_concentration_observed: true,
    plankton_negative_space_observed_inside_practice_aperture: true,
    local_practice_file_saved_and_reopened: true,
    encrypted_practice_vault_version_observed: true,
    external_retrieval_requests: 0,
    external_vault_requests: 0,
    evidence_authority_granted: false,
    consequence_authority_granted: false,
    status: 'PASS'
  });
}