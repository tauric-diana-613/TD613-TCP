import assert from 'node:assert/strict';

function isGivingApiRequest(request) {
  if (!['fetch', 'xhr'].includes(request.resourceType())) return false;
  try {
    const url = new URL(request.url());
    return /\/api\/td613-ledger\/?$/.test(url.pathname);
  } catch {
    return false;
  }
}

async function snapshot(page) {
  return page.evaluate(() => ({
    title: document.querySelector('#dossierTitle')?.value ?? null,
    searchName: document.querySelector('#searchName')?.value ?? null,
    dateFrom: document.querySelector('#dateFrom')?.value ?? null,
    dateTo: document.querySelector('#dateTo')?.value ?? null,
    queue: document.querySelector('#contactQueueInput')?.value ?? null,
    exactMatch: Boolean(document.querySelector('#exactMatchToggle')?.checked),
    selectedSources: [...document.querySelectorAll('#sourceRegistry input[type="checkbox"]:checked')].map((input) => input.value),
    status: document.querySelector('#researchFileSampleStatus')?.textContent?.trim() ?? '',
    statusHidden: Boolean(document.querySelector('#researchFileSampleStatus')?.hidden),
    runSummary: document.querySelector('#runSummary')?.textContent?.trim() ?? '',
    sourceProgress: document.querySelector('#sourceProgress')?.innerHTML ?? '',
    sourceCards: [...document.querySelectorAll('#sourceProgress .source-run-card')].map((card) => ({
      status: card.dataset.status || '',
      text: card.textContent?.replace(/\s+/g, ' ').trim() || ''
    })),
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
    campaignAsleep: document.querySelector('.tab[data-view="campaign"]')?.dataset.practiceAsleep === 'true',
    activeTab: document.querySelector('.ledger-tabs .tab.active')?.dataset.view || null,
    exitConfirmVisible: Boolean(document.querySelector('#practiceExitConfirm:not([hidden])'))
  }));
}

function searchDiagnostics(state, traversalRequests) {
  return JSON.stringify({
    searchName: state.searchName,
    dateFrom: state.dateFrom,
    dateTo: state.dateTo,
    exactMatch: state.exactMatch,
    selectedSources: state.selectedSources,
    runSummary: state.runSummary,
    sourceCards: state.sourceCards,
    reviewCount: state.reviewCount,
    rawPracticeCards: state.rawPracticeCards,
    fictionalCards: state.fictionalCards,
    fictionalChips: state.fictionalChips,
    coverageExecutiveLine: state.coverageExecutiveLine,
    externalRequests: traversalRequests
  });
}

export async function witnessGivingPracticeFixture(page) {
  await page.waitForSelector('#loadResearchSampleButton', { state: 'visible', timeout: 5000 });
  await page.waitForSelector('#contactQueueInput', { state: 'attached', timeout: 5000 });

  const loadRequests = [];
  const onLoadRequest = (request) => {
    if (!isGivingApiRequest(request)) return;
    let operation = null;
    try { operation = JSON.parse(request.postData() || '{}')?.operation || null; } catch {}
    loadRequests.push({ method: request.method(), url: request.url(), operation });
  };

  const before = await snapshot(page);
  page.on('request', onLoadRequest);
  try {
    await page.locator('#loadResearchSampleButton').click();
    await page.waitForTimeout(180);
  } finally {
    page.off('request', onLoadRequest);
  }
  const afterLoad = await snapshot(page);

  assert.equal(afterLoad.title, 'SAMPLE — Bikini Bottom contributor review');
  assert.equal(afterLoad.searchName, 'SpongeBob SquarePants');
  assert.match(afterLoad.queue || '', /Patrick Star/);
  assert.match(afterLoad.queue || '', /Sandy Cheeks/);
  assert.match(afterLoad.queue || '', /Eugene H\. Krabs/);
  assert.match(afterLoad.queue || '', /Squidward Q\. Tentacles/);
  assert.equal(afterLoad.exactMatch, true, 'fictional practice must begin under normalized exact match');
  assert.equal(afterLoad.practiceLocked, true, 'real electronic source picker must freeze behind the practice exit membrane');
  assert.equal(afterLoad.practiceSource, true, 'BikiniBottomVotes must be the only selected practice source');
  assert.deepEqual(afterLoad.selectedSources, ['practice-bikini-bottom-votes']);
  assert.equal(afterLoad.floatingExit, true, 'a fixed Exit Demo chip must follow the learner across practice tabs');
  assert.equal(afterLoad.campaignAsleep, true, 'Campaign Deputy must visibly sleep during fictional practice');
  assert.equal(afterLoad.statusHidden, false);
  assert.match(afterLoad.status, /Practice case loaded/i);
  assert.match(afterLoad.status, /Press SEARCH/i);
  assert.match(afterLoad.status, /nothing in this case can become real evidence/i);

  assert.deepEqual(loadRequests, [], `loading the fictional practice case must not call Giving API: ${JSON.stringify(loadRequests)}`);
  assert.equal(afterLoad.runSummary, before.runSummary, 'practice load must not start a retrieval run');
  assert.equal(afterLoad.sourceProgress, before.sourceProgress, 'practice load must not mutate source-run evidence');
  assert.equal(afterLoad.recordList, before.recordList, 'practice load must not fabricate or alter contribution records');
  assert.equal(afterLoad.receiptList, before.receiptList, 'practice load must not create retrieval/operator receipts');
  assert.equal(afterLoad.campaignReceipts, before.campaignReceipts, 'practice load must not create Campaign Deputy receipts');
  assert.equal(afterLoad.vaultVersions, before.vaultVersions, 'practice load must not write or hydrate Vault versions');
  assert.equal(afterLoad.coverageExecutiveLine, before.coverageExecutiveLine, 'practice load must not create a coverage claim');

  const beforeCampaignTab = afterLoad.activeTab;
  await page.locator('.tab[data-view="campaign"]').click();
  await page.waitForSelector('#practiceExitConfirm:not([hidden])', { timeout: 5000 });
  const campaignExitPrompt = await snapshot(page);
  assert.equal(campaignExitPrompt.activeTab, beforeCampaignTab, 'sleeping Campaign Deputy must not switch into the real CRM surface');
  assert.equal(campaignExitPrompt.exitConfirmVisible, true, 'sleeping Campaign Deputy must route to the shared Exit Sample Demo confirmation');
  await page.locator('[data-practice-exit="no"]').click();

  await page.evaluate(() => { globalThis.__TD613_GIVING_PRACTICE_DELAY_MS__ = 25; });
  const traversalRequests = [];
  const onTraversalRequest = (request) => {
    if (!isGivingApiRequest(request)) return;
    let operation = null;
    try { operation = JSON.parse(request.postData() || '{}')?.operation || null; } catch {}
    traversalRequests.push({ method: request.method(), url: request.url(), operation });
  };
  page.on('request', onTraversalRequest);
  try {
    await page.locator('#runSearchButton').click();
    await page.waitForFunction(() => {
      const card = document.querySelector('#sourceProgress .source-run-card');
      if (!card) return false;
      return !['QUEUED', 'RUNNING', 'NOT_RUN'].includes(card.dataset.status || '');
    }, null, { timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(120);
  } finally {
    page.off('request', onTraversalRequest);
  }
  const afterSearch = await snapshot(page);
  const diagnostics = searchDiagnostics(afterSearch, traversalRequests);
  assert.deepEqual(traversalRequests, [], `BikiniBottomVotes search must terminate in the browser practice boundary: ${diagnostics}`);
  assert.equal(afterSearch.searchName, 'SpongeBob SquarePants', `first practice search posture drifted: ${diagnostics}`);
  assert.equal(afterSearch.dateFrom, '2020-01-01', `practice beginning date drifted: ${diagnostics}`);
  assert.equal(afterSearch.exactMatch, true, `practice exact match drifted: ${diagnostics}`);
  assert.deepEqual(afterSearch.selectedSources, ['practice-bikini-bottom-votes'], `practice source aperture drifted: ${diagnostics}`);
  assert.equal(afterSearch.sourceCards.length, 1, `practice search never produced a source-run card: ${diagnostics}`);
  assert.equal(afterSearch.sourceCards[0]?.status, 'COMPLETE', `practice source did not complete: ${diagnostics}`);
  assert.equal(afterSearch.reviewCount, 13, `SpongeBob practice retrieval did not retain 13 records: ${diagnostics}`);
  assert.equal(afterSearch.rawPracticeCards, 13, `13 retained practice records were not rendered into Contributions: ${diagnostics}`);
  assert.equal(afterSearch.fictionalCards, 13, `SpongeBob practice retrieval must expose the authored 13-record grassroots history: ${diagnostics}`);
  assert.equal(afterSearch.fictionalChips, afterSearch.fictionalCards, `every fictional contribution card must carry the magenta provenance chip: ${diagnostics}`);
  assert.match(afterSearch.recordList, /Krusty Krab Parking Expansion Referendum Committee/);
  assert.match(afterSearch.recordList, /Bikini Bottom/);
  assert.match(afterSearch.recordList, /Oceania · X/);
  assert.match(afterSearch.sourceProgress, /BikiniBottomVotes/);
  assert.match(afterSearch.coverageExecutiveLine, /1\/1 selected sources complete/);

  // Search concludes in the ordinary Source run view. Move through the same
  // visible Contributions tab a learner must use before review/custody gestures.
  await page.locator('.tab[data-view="review"]').click();
  await page.waitForSelector('#recordList .fictional-sample-chip', { state: 'visible', timeout: 5000 });
  assert.equal((await snapshot(page)).floatingExit, true, 'Exit Demo must remain fixed after switching to Contributions');
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
    await page.waitForTimeout(150);
  } finally {
    page.off('request', onQueueRequest);
  }
  const afterQueue = await snapshot(page);
  assert.deepEqual(queueRequests, [], 'all four queued Bikini Bottom contributors must remain inside the browser practice boundary');
  assert.deepEqual(afterQueue.queueStates, ['SEARCHED', 'SEARCHED', 'SEARCHED', 'SEARCHED']);
  assert.equal(afterQueue.reviewCount, 49, 'full practice hydration must retain all 49 fictional contributions across five contributors');
  assert.equal(afterQueue.fictionalCards, 49, 'the 49-record practice file must fit inside one 50-card Contributions page');
  assert.equal(afterQueue.fictionalChips, 49, 'every hydrated practice contribution must retain its fictional provenance chip');
  for (const name of ['SpongeBob SquarePants', 'Patrick Star', 'Sandy Cheeks', 'Eugene H. Krabs', 'Squidward Q. Tentacles']) {
    assert.match(afterQueue.recordList, new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
  for (const committee of [
    'King Neptune for King',
    'Mrs. Puff for Bikini Bottom School District #67',
    'Every Villain Is Lemons PAC',
    'Sheldon Plankton for Bikini Bottom Campaign',
    'Larry Lobster for Mayor of Bikini Bottom',
    'Fishocratic Executive Committee',
    'Friends of Aquaman PC',
    'Krusty Krab Parking Expansion Referendum Committee'
  ]) assert.match(afterQueue.recordList, new RegExp(committee.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));

  await page.locator('#saveDossierButton').click();
  await page.waitForFunction(() => [...(document.querySelector('#localDossierSelect')?.options || [])]
    .some((option) => /SAMPLE — Bikini Bottom contributor review/.test(option.textContent || '')), null, { timeout: 5000 });
  const afterSave = await snapshot(page);
  assert.ok(afterSave.localSampleOptions >= 1, 'explicit Save must produce an openable local fictional research file');

  await page.evaluate(() => {
    const select = document.querySelector('#localDossierSelect');
    const option = [...(select?.options || [])].find((candidate) => /SAMPLE — Bikini Bottom contributor review/.test(candidate.textContent || ''));
    if (select && option) {
      select.value = option.value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await page.locator('#openDossierButton').click();
  await page.waitForFunction(() => Number(document.querySelector('#reviewCount')?.textContent || 0) === 49, null, { timeout: 5000 });
  const afterOpen = await snapshot(page);
  assert.equal(afterOpen.title, 'SAMPLE — Bikini Bottom contributor review');
  assert.equal(afterOpen.reviewCount, 49, 'Open selected file must reopen the fully hydrated fictional dossier');

  await page.locator('#researchFileVaultButton').click();
  await page.locator('#vaultPassphrase').fill('Bikini-Bottom-Practice-613-Key');
  const vaultRequests = [];
  const onVaultRequest = (request) => { if (isGivingApiRequest(request)) vaultRequests.push(request.url()); };
  page.on('request', onVaultRequest);
  try {
    await page.locator('#syncVaultButton').click();
    await page.waitForSelector('#vaultVersions .version-item', { state: 'visible', timeout: 20000 });
  } finally {
    page.off('request', onVaultRequest);
  }
  const afterVault = await snapshot(page);
  assert.deepEqual(vaultRequests, [], 'practice Vault must keep encrypted custody on the reversible in-memory shelf');
  assert.ok(afterVault.vaultVersionCount >= 1, 'practice Vault must expose at least one encrypted version after explicit gesture');
  assert.equal(afterVault.floatingExit, true, 'Exit Demo must remain fixed in Vault');

  await page.locator('#practiceFloatingExitButton').click();
  await page.waitForSelector('#practiceExitConfirm:not([hidden])', { timeout: 5000 });
  await page.locator('[data-practice-exit="no"]').click();
  assert.equal((await snapshot(page)).practiceLocked, true, 'No must preserve the active fictional sample');
  await page.locator('#practiceFloatingExitButton').click();
  await page.locator('[data-practice-exit="yes"]').click();
  await page.waitForFunction(() => document.documentElement.dataset.givingPractice !== 'true', null, { timeout: 5000 });
  const afterExit = await snapshot(page);
  assert.equal(afterExit.practiceLocked, false, 'confirmed exit must restore the live source picker');
  assert.equal(afterExit.exactMatch, false, 'confirmed exit must release the sample exact-match posture');
  assert.equal(afterExit.floatingExit, false, 'fixed Exit Demo chip must disappear after confirmed exit');
  assert.equal(afterExit.campaignAsleep, false, 'Campaign Deputy must wake after confirmed exit');
  assert.ok(afterExit.localSampleOptions >= 1, 'exiting the demo must not destroy an explicitly saved fictional local file');

  return Object.freeze({
    schema: 'td613.giving.practice-fixture-browser-witness/v0.3',
    fixture: 'giving.bikini-bottom-practice/v0.1',
    manifestly_fictional: true,
    fictional_inputs_loaded: true,
    load_api_requests_delta: 0,
    load_retrieval_started: false,
    load_evidence_records_changed: false,
    load_receipts_changed: false,
    load_vault_versions_changed: false,
    load_campaign_deputy_changed: false,
    normalized_exact_match: true,
    practice_source_locked: true,
    floating_exit_persistent: true,
    campaign_deputy_slept_during_practice: true,
    fictional_records_observed: afterQueue.reviewCount,
    fictional_record_provenance_chips: afterQueue.fictionalChips,
    fictional_contributors_observed: 5,
    fictional_committee_objects_observed: 8,
    political_object_contrast_observed: true,
    local_practice_file_saved_and_reopened: true,
    encrypted_practice_vault_version_observed: true,
    exit_confirmation_preserved_saved_copy: true,
    external_retrieval_requests: 0,
    external_vault_requests: 0,
    evidence_authority_granted: false,
    consequence_authority_granted: false,
    status: 'PASS'
  });
}
