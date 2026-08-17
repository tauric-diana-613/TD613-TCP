import assert from 'node:assert/strict';

function isGivingApiRequest(request) {
  if (!['fetch', 'xhr'].includes(request.resourceType())) return false;
  try {
    const url = new URL(request.url());
    return /\/api\/giving\/?$/.test(url.pathname);
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
    coverageExecutiveLine: document.querySelector('#coverageExecutiveLine')?.textContent?.trim() ?? '',
    resilienceShellReady: document.documentElement.dataset.givingResilienceShellReady === 'true',
    bootstrapReady: document.documentElement.dataset.givingBootstrapReady === 'true'
  }));
}

async function stableSnapshot(page, { timeout = 10000, interval = 100, consecutive = 3 } = {}) {
  const deadline = Date.now() + timeout;
  let previous = null;
  let stableCount = 0;
  while (Date.now() < deadline) {
    const current = await snapshot(page);
    const serialized = JSON.stringify(current);
    if (serialized === previous) {
      stableCount += 1;
      if (stableCount >= consecutive) return current;
    } else {
      previous = serialized;
      stableCount = 1;
    }
    await page.waitForTimeout(interval);
  }
  throw new Error('Giving practice fixture baseline did not settle before observation.');
}

async function requireBootstrapSettlement(page) {
  await page.waitForFunction(() => (
    document.documentElement.dataset.givingResilienceShellReady === 'true' &&
    document.documentElement.dataset.givingBootstrapReady === 'true'
  ), undefined, { timeout: 15000 });
  const state = await snapshot(page);
  assert.equal(state.resilienceShellReady, true, 'Giving resilience shell settlement must precede practice observation');
  assert.equal(state.bootstrapReady, true, 'Giving full bootstrap settlement must precede practice observation');
}

export async function witnessGivingPracticeFixture(page) {
  await requireBootstrapSettlement(page);
  await page.waitForSelector('#loadResearchSampleButton', { state: 'visible', timeout: 5000 });
  await page.waitForSelector('#contactQueueInput', { state: 'attached', timeout: 5000 });

  const requests = [];
  const onRequest = (request) => {
    if (!isGivingApiRequest(request)) return;
    let operation = null;
    try { operation = JSON.parse(request.postData() || '{}')?.operation || null; } catch {}
    requests.push({ method: request.method(), url: request.url(), operation });
  };

  const before = await stableSnapshot(page);
  page.on('request', onRequest);
  try {
    await page.locator('#loadResearchSampleButton').click();
    await page.waitForFunction(() => (
      document.querySelector('#dossierTitle')?.value === 'SAMPLE — Bikini Bottom contributor review' &&
      document.querySelector('#searchName')?.value === 'SpongeBob SquarePants' &&
      document.querySelector('#researchFileSampleStatus')?.hidden === false
    ), undefined, { timeout: 5000 });
  } finally {
    page.off('request', onRequest);
  }
  const after = await stableSnapshot(page);

  assert.equal(after.title, 'SAMPLE — Bikini Bottom contributor review');
  assert.equal(after.searchName, 'SpongeBob SquarePants');
  assert.match(after.queue || '', /Patrick Star/);
  assert.match(after.queue || '', /Sandy Cheeks/);
  assert.match(after.queue || '', /Eugene H\. Krabs/);
  assert.match(after.queue || '', /Squidward Q\. Tentacles/);
  assert.equal(after.statusHidden, false);
  assert.match(after.status, /Fictional sample loaded locally/i);
  assert.match(after.status, /no records were preloaded/i);
  assert.equal(after.resilienceShellReady, true);
  assert.equal(after.bootstrapReady, true);

  assert.deepEqual(requests, [], `loading the fictional practice case must not call Giving API: ${JSON.stringify(requests)}`);
  assert.equal(after.runSummary, before.runSummary, 'practice load must not start a retrieval run');
  assert.equal(after.sourceProgress, before.sourceProgress, 'practice load must not mutate source-run evidence');
  assert.equal(after.recordList, before.recordList, 'practice load must not fabricate or alter contribution records');
  assert.equal(after.receiptList, before.receiptList, 'practice load must not create retrieval/operator receipts');
  assert.equal(after.campaignReceipts, before.campaignReceipts, 'practice load must not create Campaign Deputy receipts');
  assert.equal(after.vaultVersions, before.vaultVersions, 'practice load must not write or hydrate Vault versions');
  assert.equal(after.coverageExecutiveLine, before.coverageExecutiveLine, 'practice load must not create a coverage claim');

  return Object.freeze({
    schema: 'td613.giving.practice-fixture-browser-witness/v0.2-bootstrap-settled',
    fixture: 'giving.bikini-bottom-practice/v0.1',
    manifestly_fictional: true,
    resilience_shell_settled: true,
    bootstrap_settled: true,
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
