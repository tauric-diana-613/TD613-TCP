import assert from 'node:assert/strict';

// The caller owns bootstrap quiescence before this assay begins. Once this
// request listener is installed, every Giving API call belongs to the fixture
// load observation window and remains fatal; the assay grants no bootstrap
// exception of its own. Keep this canonical-practice path in the release
// packet so production must exercise the same zero-effect witness after the
// request-causality repair rather than judging late bootstrap responses.
// Protected pre-practice refusal count is diagnostic only; causal placement
// before the fixture boundary controls admissibility, while post-boundary
// Giving request starts remain fatal without exception.
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
    status: document.querySelector('#researchFileSampleStatus')?.textContent?.trim() ?? '',
    statusHidden: Boolean(document.querySelector('#researchFileSampleStatus')?.hidden),
    runSummary: document.querySelector('#runSummary')?.textContent?.trim() ?? '',
    sourceProgress: document.querySelector('#sourceProgress')?.innerHTML ?? '',
    recordList: document.querySelector('#recordList')?.innerHTML ?? '',
    receiptList: document.querySelector('#receiptList')?.innerHTML ?? '',
    campaignReceipts: document.querySelector('#campaignReceipts')?.innerHTML ?? '',
    vaultVersions: document.querySelector('#vaultVersions')?.innerHTML ?? '',
    coverageExecutiveLine: document.querySelector('#coverageExecutiveLine')?.textContent?.trim() ?? ''
  }));
}

export async function witnessGivingPracticeFixture(page) {
  await page.waitForSelector('#loadResearchSampleButton', { state: 'visible', timeout: 5000 });
  await page.waitForSelector('#contactQueueInput', { state: 'attached', timeout: 5000 });

  const requests = [];
  const onRequest = (request) => {
    if (!isGivingApiRequest(request)) return;
    let operation = null;
    try { operation = JSON.parse(request.postData() || '{}')?.operation || null; } catch {}
    requests.push({ method: request.method(), url: request.url(), operation });
  };

  const before = await snapshot(page);
  page.on('request', onRequest);
  try {
    await page.locator('#loadResearchSampleButton').click();
    await page.waitForTimeout(150);
  } finally {
    page.off('request', onRequest);
  }
  const after = await snapshot(page);

  assert.equal(after.title, 'SAMPLE — Bikini Bottom contributor review');
  assert.equal(after.searchName, 'SpongeBob SquarePants');
  assert.match(after.queue || '', /Patrick Star/);
  assert.match(after.queue || '', /Sandy Cheeks/);
  assert.match(after.queue || '', /Eugene H\. Krabs/);
  assert.match(after.queue || '', /Squidward Q\. Tentacles/);
  assert.equal(after.statusHidden, false);
  assert.match(after.status, /Fictional sample loaded locally/i);
  assert.match(after.status, /no records were preloaded/i);

  assert.deepEqual(requests, [], `loading the fictional practice case must not call Giving API: ${JSON.stringify(requests)}`);
  assert.equal(after.runSummary, before.runSummary, 'practice load must not start a retrieval run');
  assert.equal(after.sourceProgress, before.sourceProgress, 'practice load must not mutate source-run evidence');
  assert.equal(after.recordList, before.recordList, 'practice load must not fabricate or alter contribution records');
  assert.equal(after.receiptList, before.receiptList, 'practice load must not create retrieval/operator receipts');
  assert.equal(after.campaignReceipts, before.campaignReceipts, 'practice load must not create Campaign Deputy receipts');
  assert.equal(after.vaultVersions, before.vaultVersions, 'practice load must not write or hydrate Vault versions');
  assert.equal(after.coverageExecutiveLine, before.coverageExecutiveLine, 'practice load must not create a coverage claim');

  return Object.freeze({
    schema: 'td613.giving.practice-fixture-browser-witness/v0.1',
    fixture: 'giving.bikini-bottom-practice/v0.1',
    manifestly_fictional: true,
    fictional_inputs_loaded: true,
    api_requests_delta: 0,
    retrieval_started: false,
    evidence_records_changed: false,
    receipts_changed: false,
    vault_versions_changed: false,
    campaign_deputy_changed: false,
    evidence_authority_granted: false,
    consequence_authority_granted: false,
    status: 'PASS'
  });
}
