import assert from 'node:assert/strict';

// The caller owns bootstrap quiescence before this assay begins. Once this
// request listener is installed, every Giving API network call belongs to the
// observed practice window. The fictional source and practice Vault deliberately
// terminate inside the browser, so traversal can exercise the real Giving route
// without an external /api/td613-ledger request.
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
    queue: document.querySelector('#contactQueueInput')?.value ?? null,
    exactMatch: Boolean(document.querySelector('#exactMatchToggle')?.checked),
    status: document.querySelector('#researchFileSampleStatus')?.textContent?.trim() ?? '',
    statusHidden: Boolean(document.querySelector('#researchFileSampleStatus')?.hidden),
    runSummary: document.querySelector('#runSummary')?.textContent?.trim() ?? '',
    sourceProgress: document.querySelector('#sourceProgress')?.innerHTML ?? '',
    recordList: document.querySelector('#recordList')?.innerHTML ?? '',
    receiptList: document.querySelector('#receiptList')?.innerHTML ?? '',
    campaignReceipts: document.querySelector('#campaignReceipts')?.innerHTML ?? '',
    vaultVersions: document.querySelector('#vaultVersions')?.innerHTML ?? '',
    coverageExecutiveLine: document.querySelector('#coverageExecutiveLine')?.textContent?.trim() ?? '',
    practiceLocked: document.querySelector('.source-picker')?.classList.contains('practice-source-locked') || false,
    practiceSource: document.querySelector('#sourceRegistry input[value="practice-bikini-bottom-votes"]')?.checked || false,
    fictionalCards: document.querySelectorAll('#recordList .record-card[data-fictional-sample="true"]').length,
    fictionalChips: document.querySelectorAll('#recordList .fictional-sample-chip').length,
    reviewCount: Number(document.querySelector('#reviewCount')?.textContent || 0),
    queueCount: document.querySelectorAll('#contactQueueList .contact-queue-item').length,
    queueStates: [...document.querySelectorAll('#contactQueueList .contact-queue-item')].map((row) => row.dataset.status || ''),
    vaultVersionCount: document.querySelectorAll('#vaultVersions .version-item').length,
    localSampleOptions: [...(document.querySelector('#localDossierSelect')?.options || [])].filter((option) => /SAMPLE — Bikini Bottom contributor review/.test(option.textContent || '')).length
  }));
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

  // Traversal begins only after the separate SEARCH gesture. Compress the
  // pedagogical delay for CI; production users still receive the authored 8–16s.
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
    await page.waitForSelector('#recordList .fictional-sample-chip', { state: 'visible', timeout: 10000 });
    await page.waitForTimeout(120);
  } finally {
    page.off('request', onTraversalRequest);
  }
  const afterSearch = await snapshot(page);
  assert.deepEqual(traversalRequests, [], `BikiniBottomVotes search must terminate in the browser practice boundary: ${JSON.stringify(traversalRequests)}`);
  assert.equal(afterSearch.fictionalCards, 13, 'SpongeBob practice retrieval must expose the authored 13-record grassroots history including the referendum contrast');
  assert.equal(afterSearch.fictionalChips, afterSearch.fictionalCards, 'every fictional contribution card must carry the magenta provenance chip');
  assert.match(afterSearch.recordList, /Krusty Krab Parking Expansion Referendum Committee/);
  assert.match(afterSearch.recordList, /Bikini Bottom/);
  assert.match(afterSearch.recordList, /Oceania/);
  assert.match(afterSearch.recordList, />X</);
  assert.match(afterSearch.sourceProgress, /BikiniBottomVotes/);
  assert.match(afterSearch.coverageExecutiveLine, /1\/1 selected sources complete/);

  // Now hydrate the other four authored contributors through the actual contact
  // queue. Hold is explicit so SpongeBob remains in the dossier; the end state is
  // a 49-record, five-person practice file that exercises all eight committee
  // objects without crossing the external Giving boundary.
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
  document = undefined;
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

  // The real local Save route must now have a meaningful sample to reopen.
  await page.locator('#saveDossierButton').click();
  await page.waitForFunction(() => [...(document.querySelector('#localDossierSelect')?.options || [])]
    .some((option) => /SAMPLE — Bikini Bottom contributor review/.test(option.textContent || '')), null, { timeout: 5000 });
  const afterSave = await snapshot(page);
  assert.ok(afterSave.localSampleOptions >= 1, 'explicit Save must produce an openable local fictional research file');

  // Vault traversal uses the real WebCrypto encryption function. Only the hosted
  // shelf is virtualized, so ciphertext never leaves the practice browser.
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

  return Object.freeze({
    schema: 'td613.giving.practice-fixture-browser-witness/v0.2',
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
    fictional_records_observed: afterQueue.reviewCount,
    fictional_record_provenance_chips: afterQueue.fictionalChips,
    fictional_contributors_observed: 5,
    fictional_committee_objects_observed: 8,
    political_object_contrast_observed: true,
    local_practice_file_saved: true,
    encrypted_practice_vault_version_observed: true,
    external_retrieval_requests: 0,
    external_vault_requests: 0,
    evidence_authority_granted: false,
    consequence_authority_granted: false,
    status: 'PASS'
  });
}
