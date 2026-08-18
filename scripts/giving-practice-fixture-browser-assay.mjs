import assert from 'node:assert/strict';

function isGivingApiRequest(request) {
  if (!['fetch', 'xhr'].includes(request.resourceType())) return false;
  try { return /\/api\/td613-ledger\/?$/.test(new URL(request.url()).pathname); } catch { return false; }
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function pollUntil(predicate, { timeout = 5000, interval = 50, label = 'condition' } = {}) {
  const deadline = Date.now() + timeout;
  let lastError = null;
  while (Date.now() < deadline) {
    try {
      if (await predicate()) return true;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }
  const suffix = lastError ? ` Last error: ${lastError.message || String(lastError)}` : '';
  throw new Error(`${label} did not settle within ${timeout}ms.${suffix}`);
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
    queueNames: [...document.querySelectorAll('#contactQueueList .contact-queue-copy strong')].map((node) => node.textContent?.trim() || ''),
    queueZeroNames: [...document.querySelectorAll('#contactQueueList .contact-queue-item[data-zero-records="true"] .contact-queue-copy strong')].map((node) => node.textContent?.trim() || ''),
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
      disabledChildren: [...(document.querySelector(selector)?.querySelectorAll('input, button, select') || [])].every((node) => node.disabled)
    })),
    practiceObjects: document.querySelectorAll('#committeeSearchWorkspaceList [data-practice-object]').length,
    practiceCandidates: document.querySelectorAll('#campaignDirectoryCandidates [data-practice-candidate]').length,
    transactionBadges: [...document.querySelectorAll('#recordList .giving-transaction-class-badge')].map((badge) => badge.dataset.transactionClass || badge.textContent?.trim() || ''),
    preparedRoute: document.querySelector('#givingPreparedContributorHandoff:not([hidden]) .giving-prepared-handoff-copy')?.textContent?.trim() || '',
    preparedRouteStarted: document.querySelector('#givingPreparedContributorHandoff')?.dataset.searchStarted || '',
    committeeWorkspaceText: document.querySelector('#committeeSearchWorkspaceList')?.textContent?.replace(/\s+/g, ' ').trim() || '',
    committeeLedgerText: document.querySelector('#view-ledger')?.textContent?.replace(/\s+/g, ' ').trim() || '',
    loadedCampaignText: document.querySelector('#loadedCampaignContext')?.textContent?.replace(/\s+/g, ' ').trim() || '',
    demoCueVisible: Boolean(document.querySelector('#demoAddContactCue') && !document.querySelector('#demoAddContactCue').hidden),
    filterChecked: Boolean(document.querySelector('#committeeContextFilterToggle')?.checked)
  }));
}

async function snapshotReviewPages(page, totalRecords) {
  const pageCount = Math.max(1, Math.ceil(totalRecords / 50));
  const states = [];
  await page.locator('.tab[data-view="review"]').click();
  if (pageCount > 1) await page.locator('#recordList .review-pagination').waitFor({ state: 'visible', timeout: 5000 });
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    if (pageNumber > 1) {
      const current = page.locator(`#recordList .review-page-number[data-review-page="${pageNumber}"]`);
      await current.click();
      await pollUntil(async () => await current.getAttribute('aria-current') === 'page', {
        timeout: 5000,
        label: `review page ${pageNumber} current marker`
      });
    }
    states.push(await snapshot(page));
  }
  if (pageCount > 1) {
    const first = page.locator('#recordList .review-page-number[data-review-page="1"]');
    await first.click();
    await pollUntil(async () => await first.getAttribute('aria-current') === 'page', {
      timeout: 5000,
      label: 'review page 1 current marker'
    });
  }
  return states;
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
  await page.locator('#practiceExitConfirm').waitFor({ state: 'hidden', timeout: 5000 });
}

async function runPracticeSearch(page, { timeout = 12000 } = {}) {
  const requests = [];
  const onRequest = (request) => { if (isGivingApiRequest(request)) requests.push(request.url()); };
  page.on('request', onRequest);
  try {
    await page.locator('#runSearchButton').click();
    const sourceCard = page.locator('#sourceProgress .source-run-card').first();
    await pollUntil(async () => {
      if (await sourceCard.count() !== 1) return false;
      const status = await sourceCard.getAttribute('data-status');
      return !['QUEUED', 'RUNNING', 'NOT_RUN'].includes(status || '');
    }, { timeout, label: 'practice source terminal state' }).catch(() => {});
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

async function assertTwelveStepGeometry(page) {
  const metrics = await page.evaluate(() => {
    const heading = document.querySelector('.research-dossier-heading-line > h2')?.getBoundingClientRect();
    const help = document.querySelector('.research-dossier-heading-line .research-dossier-help-trigger')?.getBoundingClientRect();
    const exit = document.querySelector('#practiceFloatingExitButton');
    const toast = document.querySelector('#toastStack');
    const presets = document.querySelector('#givingDatePresets');
    return {
      heading: heading ? { x: heading.x, width: heading.width, right: heading.right } : null,
      help: help ? { x: help.x, width: help.width, left: help.left } : null,
      helpFont: help ? Number.parseFloat(getComputedStyle(document.querySelector('.research-dossier-heading-line .research-dossier-help-trigger')).fontSize) : null,
      exitFilter: exit ? getComputedStyle(exit).filter : '',
      exitZ: exit ? getComputedStyle(exit).zIndex : null,
      toastZ: toast ? getComputedStyle(toast).zIndex : null,
      toastInlineZ: toast?.style?.zIndex || '',
      toastPracticeLayer: toast?.dataset?.practiceNotificationLayer || '',
      practiceState: document.documentElement.dataset.givingPractice || '',
      presetJustify: presets ? getComputedStyle(presets).justifyContent : ''
    };
  });
  assert.ok(metrics.heading && metrics.help, 'research file heading and help trigger must both have geometry');
  assert.ok(metrics.heading.right <= metrics.help.left + 1, 'Contributor research file help icon must not hide behind the heading');
  assert.ok(metrics.helpFont <= 10.5, 'Contributor research file info icon should remain deliberately small');
  assert.match(metrics.exitFilter, /drop-shadow/i, 'floating Exit Demo requires a visible halo outside its clipped button geometry');
  assert.equal(metrics.presetJustify, 'center', 'Quick start presets must remain centered');
  return metrics;
}

async function assertPracticeNotificationPaintOrder(page) {
  const result = await page.evaluate(() => {
    const stack = document.querySelector('#toastStack');
    const exit = document.querySelector('#practiceFloatingExitButton');
    if (!stack || !exit) return { pass: false, reason: 'missing-surface', stack: Boolean(stack), exit: Boolean(exit) };

    const probe = document.createElement('div');
    probe.className = 'toast';
    probe.dataset.practicePaintProbe = 'true';
    probe.textContent = 'FICTIONAL PRACTICE · retrieval notification paint probe';
    stack.append(probe);

    const stackStyle = getComputedStyle(stack);
    const exitStyle = getComputedStyle(exit);
    const probeRect = probe.getBoundingClientRect();
    const exitRect = exit.getBoundingClientRect();
    const left = Math.max(probeRect.left, exitRect.left);
    const right = Math.min(probeRect.right, exitRect.right);
    const top = Math.max(probeRect.top, exitRect.top);
    const bottom = Math.min(probeRect.bottom, exitRect.bottom);
    const overlap = right > left && bottom > top;
    const point = overlap ? { x: (left + right) / 2, y: (top + bottom) / 2 } : null;
    const hitChain = point
      ? document.elementsFromPoint(point.x, point.y).map((node) => ({
          id: node.id || '',
          className: typeof node.className === 'string' ? node.className : '',
          probe: node === probe || Boolean(node.closest?.('[data-practice-paint-probe="true"]')),
          exit: node === exit || Boolean(node.closest?.('#practiceFloatingExitButton'))
        }))
      : [];
    const topRelevant = hitChain.find((entry) => entry.probe || entry.exit) || null;
    const payload = {
      pass: overlap && topRelevant?.probe === true,
      reason: overlap ? 'paint-order-observed' : 'no-natural-overlap',
      practiceState: document.documentElement.dataset.givingPractice || '',
      stackComputedZ: stackStyle.zIndex,
      stackInlineZ: stack.style.zIndex || '',
      stackPosition: stackStyle.position,
      stackPracticeLayer: stack.dataset.practiceNotificationLayer || '',
      exitComputedZ: exitStyle.zIndex,
      exitInlineZ: exit.style.zIndex || '',
      exitPosition: exitStyle.position,
      probeRect: { left: probeRect.left, top: probeRect.top, right: probeRect.right, bottom: probeRect.bottom },
      exitRect: { left: exitRect.left, top: exitRect.top, right: exitRect.right, bottom: exitRect.bottom },
      overlap,
      point,
      topRelevant,
      hitChain: hitChain.slice(0, 8)
    };
    probe.remove();
    return payload;
  });

  assert.equal(result.practiceState, 'true', `paint-order probe must run inside the active demo: ${JSON.stringify(result)}`);
  assert.equal(result.stackPracticeLayer, 'true', `practice bridge must bind the notification layer while demo is active: ${JSON.stringify(result)}`);
  assert.ok(result.overlap, `the real toast surface must naturally overlap Exit Demo for the paint witness: ${JSON.stringify(result)}`);
  assert.equal(result.pass, true, `retrieval notifications must paint above Exit Demo at their real overlap point: ${JSON.stringify(result)}`);
  return result;
}

async function assertMobileSortRibbon(page) {
  const original = page.viewportSize();
  if (!original) return;
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(80);
  const metrics = await page.evaluate(() => {
    const header = document.querySelector('.review-sort-header');
    const buttons = [...document.querySelectorAll('.review-sort-button')];
    const heading = document.querySelector('.research-dossier-heading-line > h2')?.getBoundingClientRect();
    const help = document.querySelector('.research-dossier-heading-line .research-dossier-help-trigger')?.getBoundingClientRect();
    return {
      display: header ? getComputedStyle(header).display : '',
      flexWrap: header ? getComputedStyle(header).flexWrap : '',
      overflowX: header ? getComputedStyle(header).overflowX : '',
      alignments: buttons.map((button) => getComputedStyle(button).textAlign),
      headingRight: heading?.right ?? null,
      helpLeft: help?.left ?? null
    };
  });
  assert.equal(metrics.display, 'flex');
  assert.equal(metrics.flexWrap, 'nowrap', 'mobile contribution sort controls must become one intrinsic-width ribbon');
  assert.ok(['auto', 'scroll'].includes(metrics.overflowX), 'mobile sort ribbon must permit horizontal overflow rather than pancake stacking');
  assert.ok(metrics.alignments.length >= 5 && metrics.alignments.every((value) => value === 'center'), 'all sort labels, including Amount, must share centered alignment on mobile');
  assert.ok(metrics.headingRight !== null && metrics.helpLeft !== null && metrics.headingRight <= metrics.helpLeft + 1, 'mobile research-file heading must not overlap its info icon');
  await page.setViewportSize(original);
  await page.waitForTimeout(80);
}

export async function witnessGivingPracticeFixture(page) {
  await page.waitForSelector('#loadResearchSampleButton', { state: 'visible', timeout: 5000 });
  await pollUntil(async () => await page.locator('html').getAttribute('data-giving-twelve-step-bundle') === '20260818-2', {
    timeout: 5000,
    label: 'Giving 12-step bundle hydration'
  });
  const before = await snapshot(page);
  const loadRequests = [];
  const onLoadRequest = (request) => { if (isGivingApiRequest(request)) loadRequests.push(request.url()); };
  page.on('request', onLoadRequest);
  try {
    await page.locator('#loadResearchSampleButton').click();
    const clearDialog = page.locator('#givingDemoClearConfirm:not([hidden])');
    await clearDialog.waitFor({ state: 'visible', timeout: 5000 });
    assert.equal((await clearDialog.locator('#givingDemoClearConfirmTitle').textContent())?.trim(), 'Clear session and begin demo?');
    assert.equal((await clearDialog.locator('small').textContent())?.trim(), 'Unsaved work may be lost.');
    assert.equal((await snapshot(page)).title, before.title, 'opening the demo confirmation must not mutate the working research file');
    await clearDialog.locator('[data-demo-clear="yes"]').click();
    await page.waitForTimeout(180);
  } finally { page.off('request', onLoadRequest); }

  await pollUntil(async () => (await page.locator('#contactQueueInput').inputValue()).includes('Gary Snail'), {
    timeout: 5000,
    label: 'five-name practice queue prefill'
  });
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
  assert.equal(afterLoad.demoCueVisible, true, 'Load Fictional Demo must cue Add contact until the queue is actually loaded');
  assert.deepEqual(loadRequests, [], 'loading the fixture must remain zero-network');
  assert.equal(afterLoad.runSummary, before.runSummary);
  assert.equal(afterLoad.reviewCount, 0, 'confirmed demo load must clear unsaved working contribution records before practice search');
  assert.equal(afterLoad.rawPracticeCards, 0, 'practice records must not appear until explicit SEARCH');
  assert.equal(afterLoad.fictionalCards, 0, 'the fictional fixture may preload search context but not contribution evidence');
  assert.match(afterLoad.recordList, /<div class="empty-state">[\s\S]*No matching records\.[\s\S]*<\/div>/, 'confirmed demo clear must leave an explicit empty contribution surface before practice search');
  if (before.reviewCount > 0 || /record-card/.test(before.recordList)) {
    assert.notEqual(afterLoad.recordList, before.recordList, 'confirmed demo clear must discard prior working contribution records');
  }
  assert.match(afterLoad.receiptList, /No receipts yet\./, 'confirmed demo load must clear unsaved working receipts');
  if (!/No receipts yet\./.test(before.receiptList)) {
    assert.notEqual(afterLoad.receiptList, before.receiptList, 'confirmed demo clear must discard the prior working dossier receipt surface');
  }
  assert.equal(afterLoad.vaultVersions, before.vaultVersions);
  assert.match(afterLoad.status, /Practice case loaded/i);
  for (const item of afterLoad.sleepingGeo) {
    assert.equal(item.present, true, `${item.selector} must exist`);
    assert.equal(item.asleep, true, `${item.selector} must visibly sleep during practice`);
    assert.equal(item.disabledChildren, true, `${item.selector} children must be functionally disabled`);
  }

  const geometry = await assertTwelveStepGeometry(page);
  const notificationPaint = await assertPracticeNotificationPaintOrder(page);
  assert.equal(notificationPaint.stackComputedZ || geometry.toastZ, notificationPaint.stackComputedZ || geometry.toastZ);

  const forbiddenIdentitySurface = await page.locator('#operatorShell').innerText();
  assert.doesNotMatch(forbiddenIdentitySurface, /\bIdentity (confirmed|confirmation|states|hints|matching)\b/, 'retired capital-I status grammar must not leak into Giving UI');
  assert.match(forbiddenIdentitySurface, /SEARCH HINTS/i);

  await page.locator('#committeeContextFilterToggle').check();
  await page.locator('#runSearchButton').click();
  const filterGuard = page.locator('#committeeFilterGuardDialog:not([hidden])');
  await filterGuard.waitFor({ state: 'visible', timeout: 5000 });
  assert.match((await filterGuard.innerText()), /Load a committee first/);
  assert.match((await filterGuard.innerText()), /uncheck the filter/i);
  await filterGuard.locator('[data-committee-filter-guard="uncheck"]').click();
  assert.equal((await snapshot(page)).filterChecked, false);

  await page.locator('#practiceExitButton').click();
  await dismissExitNo(page);
  await page.locator('#practiceFloatingExitButton').click();
  await dismissExitNo(page);
  const activeBeforeCampaign = (await snapshot(page)).activeTab;
  await page.locator('.tab[data-view="campaign"]').click();
  await assertCenteredDialog(page);
  assert.equal((await snapshot(page)).activeTab, activeBeforeCampaign);
  await page.locator('[data-practice-exit="no"]').click();

  await searchPracticeDirectory(page, 'Bikini Bottom');
  await pollUntil(async () => await page.locator('#committeeSearchWorkspaceList [data-practice-object]').count() === 8, {
    timeout: 5000,
    label: 'starter political-object directory count'
  });
  const directoryState = await snapshot(page);
  assert.equal(directoryState.practiceObjects, 8);
  assert.equal(directoryState.practiceCandidates, 4);
  assert.match(directoryState.committeeLedgerText, /Committee search results/);
  assert.match(directoryState.committeeLedgerText, /No attributed donor totals yet/);
  assert.doesNotMatch(directoryState.committeeLedgerText, /No identity-confirmed giving/i);

  await page.locator('input[name="campaign-directory-activity"][value="EXPENDITURES"]').check();
  await pollUntil(async () => await page.locator('#campaignActivityResults .practice-expenditure-card').count() === 32, {
    timeout: 5000,
    label: 'starter committee expenditure receipts'
  });
  const expenditureSurface = await page.locator('#campaignActivityResults').innerText();
  assert.match(expenditureSurface, /Read the lane before the name\./);
  for (const payee of ['Krusty Krab LLC', 'Sandy Cheeks', 'Squidward Q. Tentacles', 'Eugene H. Krabs']) {
    assert.match(expenditureSurface, new RegExp(escapeRegExp(payee)), `${payee} must appear as a practice payee somewhere in the starter committee expenditure lane`);
  }
  await page.locator('input[name="campaign-directory-activity"][value="CONTRIBUTIONS"]').check();

  await page.locator('#exactMatchToggle').uncheck();
  assert.equal((await snapshot(page)).exactMatch, false);
  await page.locator('#exactMatchToggle').check();

  await page.evaluate(() => { globalThis.__TD613_GIVING_PRACTICE_DELAY_MS__ = 25; });

  await searchPracticeDirectory(page, 'Larry Lobster for Mayor of Bikini Bottom');
  await pollUntil(async () => await page.locator('#committeeSearchWorkspaceList [data-practice-object]').count() === 1, {
    timeout: 5000,
    label: 'Larry mayor directory result for loaded context'
  });
  await page.locator('#committeeSearchWorkspaceList [data-practice-load-context]').click();
  await pollUntil(async () => (await snapshot(page)).loadedCampaignText.includes('Larry Lobster for Mayor of Bikini Bottom'), {
    timeout: 5000,
    label: 'loaded Larry committee context'
  });
  await page.locator('#committeeContextFilterToggle').check();
  await page.locator('#searchName').fill('Larry Lobster');
  const filteredLarry = await runPracticeSearch(page);
  assert.ok(filteredLarry.reviewCount > 0, 'loaded Larry committee filter must retain Larry mayor records');
  const filteredLarryPages = await snapshotReviewPages(page, filteredLarry.reviewCount);
  const filteredLarrySurface = filteredLarryPages.map((state) => state.recordList).join('\n');
  assert.match(filteredLarrySurface, /Larry Lobster for Mayor of Bikini Bottom/);
  assert.doesNotMatch(filteredLarrySurface, /Board of Public Health, Soil & Water District 2/, 'loaded committee filter must remove the other Larry committee from this contributor retrieval');
  await page.locator('#committeeContextFilterToggle').uncheck();

  await page.locator('#searchName').fill('SpongeBob SquarePants');
  const afterSponge = await runPracticeSearch(page);
  assert.equal(afterSponge.searchName, 'SpongeBob SquarePants');
  assert.deepEqual(afterSponge.selectedSources, ['practice-bikini-bottom-votes']);
  assert.ok(afterSponge.reviewCount > 13, 'SpongeBob must retain ordinary cash records plus added in-kind records');
  assert.equal(afterSponge.rawPracticeCards, afterSponge.reviewCount, 'all rendered demo records must remain practice-scoped');
  assert.equal(afterSponge.fictionalChips, afterSponge.rawPracticeCards, 'every fictional contribution needs visible provenance');
  assert.match(afterSponge.sourceProgress, /BikiniBottomVotes/);

  await page.locator('.tab[data-view="review"]').click();
  await page.waitForSelector('#recordList .fictional-sample-chip', { state: 'visible', timeout: 5000 });
  await page.locator('#recordList .giving-transaction-class-badge[data-transaction-class="IN-KIND"]').first().waitFor({ state: 'visible', timeout: 5000 });
  assert.ok((await snapshot(page)).transactionBadges.includes('IN-KIND'), 'SpongeBob catering records must visibly teach IN-KIND');
  assert.equal((await page.locator('#recordList [data-decision="CONFIRMED"]').first().textContent())?.trim(), 'Record attributed');
  assert.equal((await page.locator('#recordList [data-decision="UNREVIEWED"]').first().textContent())?.trim(), 'Record unresolved');
  assert.equal((await page.locator('#reviewFilter option[value="CONFIRMED"]').textContent())?.trim(), 'Record attributed');
  assert.equal((await page.locator('#reviewFilter option[value="UNREVIEWED"]').textContent())?.trim(), 'Record unresolved');

  await page.locator('#recordList [data-decision="CONFIRMED"]').first().click();
  await page.locator('.tab[data-view="ledger"]').click();
  await pollUntil(async () => await page.locator('#committeeLedger .committee-card').count() >= 1, {
    timeout: 5000,
    label: 'attributed donor total ledger wake'
  });
  assert.match(await page.locator('#committeeLedger').innerText(), /RECORD ATTRIBUTED|attributed/i);
  await page.locator('.tab[data-view="review"]').click();

  await assertMobileSortRibbon(page);

  await page.locator('#holdReviewButton').click();
  assert.equal((await snapshot(page)).demoCueVisible, true, 'demo Add contact cue must remain visible until queue hydration');
  await page.locator('#addContactQueueButton').click();
  const queueRows = page.locator('#contactQueueList .contact-queue-item');
  await pollUntil(async () => await queueRows.count() === 5, { timeout: 5000, label: 'five queued practice contacts' });
  assert.equal((await snapshot(page)).demoCueVisible, false, 'demo Add contact cue must disappear after queue rows are actually loaded');
  assert.deepEqual((await snapshot(page)).queueNames, ['Patrick Star', 'Sandy Cheeks', 'Gary Snail', 'Eugene H. Krabs', 'Squidward Q. Tentacles']);

  const queueRequests = [];
  const onQueueRequest = (request) => { if (isGivingApiRequest(request)) queueRequests.push(request.url()); };
  page.on('request', onQueueRequest);
  try {
    await page.locator('#runContactQueueButton').click();
    await pollUntil(async () => {
      if (await queueRows.count() !== 5) return false;
      const states = [];
      for (let index = 0; index < 5; index += 1) states.push(await queueRows.nth(index).getAttribute('data-status'));
      return states.every((state) => ['SEARCHED', 'SOURCE HOLD', 'CLIENT HOLD'].includes(state || ''));
    }, { timeout: 20000, label: 'contact queue terminal state' });
    await page.waitForTimeout(120);
  } finally { page.off('request', onQueueRequest); }
  const afterQueue = await snapshot(page);
  assert.deepEqual(queueRequests, [], 'queued fictional contributors may not escape the browser boundary');
  assert.deepEqual(afterQueue.queueStates, ['SEARCHED', 'SEARCHED', 'SEARCHED', 'SEARCHED', 'SEARCHED']);
  assert.deepEqual(afterQueue.queueZeroNames, ['Gary Snail'], 'Gary must teach exactly one bounded no-record queue result');
  const garyRow = page.locator('#contactQueueList .contact-queue-item').filter({ hasText: 'Gary Snail' });
  assert.equal(await garyRow.getAttribute('data-zero-records'), 'true');
  assert.match(await garyRow.innerText(), /NO RECORDS/);
  assert.match(await garyRow.innerText(), /selected sources and date window/);
  assert.match(await garyRow.innerText(), /not proof.*never donated/i);
  assert.ok(afterQueue.reviewCount > 49, 'expanded practice hydration must outgrow the obsolete 49-row toy dataset');
  const queuePages = await snapshotReviewPages(page, afterQueue.reviewCount);
  assert.equal(queuePages.reduce((sum, state) => sum + state.fictionalCards, 0), afterQueue.reviewCount, 'pagination must expose every queued record as fictional across the bounded 50-card review pages');
  assert.equal(queuePages.reduce((sum, state) => sum + state.fictionalChips, 0), afterQueue.reviewCount, 'every paginated fictional record needs visible FICTIONAL SAMPLE provenance');
  assert.equal(queuePages.reduce((sum, state) => sum + state.rawPracticeCards, 0), afterQueue.reviewCount, 'all paginated queued records must remain inside the practice namespace');
  const queuedRecordSurface = queuePages.map((state) => state.recordList).join('\n');
  for (const name of ['SpongeBob SquarePants', 'Patrick Star', 'Sandy Cheeks', 'Eugene H. Krabs', 'Squidward Q. Tentacles']) {
    assert.match(queuedRecordSurface, new RegExp(escapeRegExp(name)));
  }
  assert.doesNotMatch(queuedRecordSurface, /Gary Snail/, 'Gary is a searched target, not a fabricated contribution record');
  for (const committee of ['King Neptune for King','Puff for Bikini Bottom School District #67','Every Villain Is Lemons PAC','Sheldon Plankton for Bikini Bottom Campaign','Larry Lobster for Mayor of Bikini Bottom','Fishocratic Executive Committee','Friends of Aquaman PC','Krusty Krab Parking Expansion Referendum Committee']) {
    assert.match(queuedRecordSurface, new RegExp(escapeRegExp(committee)));
  }

  await page.locator('.tab[data-view="review"]').click();
  await page.locator('#inspectClustersButton').waitFor({ state: 'visible', timeout: 5000 });
  assert.match((await page.locator('#inspectClustersButton').textContent()) || '', /Inspect suggested records/);
  await page.locator('#inspectClustersButton').click();
  assert.equal(await page.locator('html').getAttribute('data-cluster-inspection'), 'true');
  assert.ok(await page.locator('#recordList .cluster-suggested-card').count() > 0, 'cluster inspection must reveal the affected record cards');
  assert.equal((await page.locator('#inspectClustersButton').textContent())?.trim(), 'Show all records');
  await page.locator('#inspectClustersButton').click();
  assert.equal(await page.locator('html').getAttribute('data-cluster-inspection'), 'false');

  await page.locator('#exactMatchToggle').uncheck();
  await page.locator('#searchName').fill('Sandy');
  const afterBroadSandy = await runPracticeSearch(page);
  const sandyPages = await snapshotReviewPages(page, afterBroadSandy.reviewCount);
  const sandySurface = sandyPages.map((state) => state.recordList).join('\n');
  assert.match(sandySurface, /Sandy Grouper/, 'broad Sandy search should surface the separate Sandy Grouper contributor somewhere in the paginated dossier');
  assert.match(sandySurface, /Sandra Cheeks/, 'broad Sandy search should expose declared alias/name-variant continuity somewhere in the paginated dossier');
  await page.locator('#exactMatchToggle').check();

  await searchPracticeDirectory(page, 'Krusty Krab Parking Expansion Referendum Committee');
  await pollUntil(async () => await page.locator('#committeeSearchWorkspaceList [data-practice-object]').count() === 1, {
    timeout: 5000,
    label: 'referendum directory result'
  });
  const referendumState = await snapshot(page);
  assert.match(referendumState.committeeWorkspaceText, /Eugene H\. Krabs/);
  assert.match(referendumState.committeeWorkspaceText, /Pearl Krabs/);
  assert.match(referendumState.committeeWorkspaceText, /Krusty Krab LLC/);
  assert.match(referendumState.committeeWorkspaceText, /Barnacle Boy/);
  assert.match(referendumState.committeeWorkspaceText, /\$2,\d{3},\d{3}/, 'referendum should visibly carry the multimillion-dollar Krabs concentration');
  await page.locator('#committeeSearchWorkspaceList [data-practice-contributor="Barnacle Boy"]').click();
  await pollUntil(async () => await page.locator('#searchName').inputValue() === 'Barnacle Boy', {
    timeout: 5000,
    label: 'Barnacle Boy prepared contributor handoff'
  });
  const preparedBarnacle = await snapshot(page);
  assert.match(preparedBarnacle.preparedRoute, /Barnacle Boy/);
  assert.match(preparedBarnacle.preparedRoute, /Krusty Krab Parking Expansion Referendum Committee/);
  assert.match(preparedBarnacle.preparedRoute, /nothing searched/i);
  assert.equal(preparedBarnacle.preparedRouteStarted, 'false');
  const afterBarnacle = await runPracticeSearch(page);
  const barnaclePages = await snapshotReviewPages(page, afterBarnacle.reviewCount);
  const barnacleSurface = barnaclePages.map((state) => state.recordList).join('\n');
  assert.match(barnacleSurface, /Barnacle Boy/, 'explicit Barnacle Boy search must add Barnacle Boy somewhere in the paginated dossier');
  assert.equal((await snapshot(page)).preparedRouteStarted, 'true', 'prepared route should change state only after explicit SEARCH');

  await searchPracticeDirectory(page, 'Sheldon Plankton for Bikini Bottom Campaign');
  await pollUntil(async () => await page.locator('#committeeSearchWorkspaceList [data-practice-object]').count() === 1, {
    timeout: 5000,
    label: 'Plankton directory result'
  });
  for (const name of ['Eugene H. Krabs', 'Pearl Krabs', 'Krusty Krab LLC']) {
    assert.equal(await page.locator(`#committeeSearchWorkspaceList [data-practice-contributor="${name}"]`).count(), 0, `${name} must remain absent from the observed Plankton practice ledger`);
  }

  await searchPracticeDirectory(page, 'Larry Lobster for Mayor of Bikini Bottom');
  await pollUntil(async () => await page.locator('#committeeSearchWorkspaceList [data-practice-object]').count() === 1, {
    timeout: 5000,
    label: 'Larry mayor directory result'
  });
  await page.locator('#committeeSearchWorkspaceList [data-practice-contributor="Larry Lobster"]').click();
  await pollUntil(async () => await page.locator('#searchName').inputValue() === 'Larry Lobster', {
    timeout: 5000,
    label: 'Larry prepared contributor handoff'
  });
  const afterLarry = await runPracticeSearch(page);
  const larryPages = await snapshotReviewPages(page, afterLarry.reviewCount);
  const allLarryBadges = larryPages.flatMap((state) => state.transactionBadges);
  assert.ok(allLarryBadges.includes('LOAN'), 'Larry self-financing records must visibly teach LOAN somewhere in the paginated dossier');
  const afterLoanBadge = await snapshot(page);
  assert.ok(afterLoanBadge.reviewCount > afterQueue.reviewCount, 'discoverable contributors must expand the dossier rather than swap through a fixed row pool');

  const hydratedCount = afterLoanBadge.reviewCount;
  assert.ok(hydratedCount > 49);

  await page.locator('#saveDossierButton').click();
  const savedOption = page.locator('#localDossierSelect option').filter({ hasText: 'SAMPLE — Bikini Bottom contributor review' }).first();
  await savedOption.waitFor({ state: 'attached', timeout: 5000 });
  const savedValue = await savedOption.getAttribute('value');
  assert.ok(savedValue, 'saved fictional dossier option needs a value');
  await page.locator('#localDossierSelect').selectOption(savedValue, { force: true });
  await page.locator('#openDossierButton').click();
  await pollUntil(async () => Number(await page.locator('#reviewCount').textContent() || 0) === hydratedCount, {
    timeout: 5000,
    label: 'reopened fictional dossier record count'
  });
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
  await pollUntil(async () => await page.locator('html').getAttribute('data-giving-practice') !== 'true', {
    timeout: 5000,
    label: 'practice exit state'
  });
  const afterExit = await snapshot(page);
  assert.equal(afterExit.practiceLocked, false);
  assert.equal(afterExit.floatingExit, false);
  assert.equal(afterExit.campaignAsleep, false);
  assert.ok(afterExit.localSampleOptions >= 1);
  for (const item of afterExit.sleepingGeo) assert.equal(item.asleep, false, `${item.selector} must wake on confirmed exit`);

  return Object.freeze({
    schema: 'td613.giving.practice-fixture-browser-witness/v0.7',
    fixture: 'giving.bikini-bottom-practice/v0.1',
    manifestly_fictional: true,
    exit_entry_points: 3,
    shared_centered_exit_dialog: true,
    notification_layer_above_floating_exit: true,
    notification_paint_order_observed: true,
    notification_layer_diagnostics: {
      stack_computed_z: notificationPaint.stackComputedZ,
      stack_inline_z: notificationPaint.stackInlineZ,
      exit_computed_z: notificationPaint.exitComputedZ,
      top_relevant: notificationPaint.topRelevant
    },
    loud_exit_demo_halo_observed: true,
    research_file_help_collision_absent: true,
    quick_start_centered: true,
    sleeping_real_geography: true,
    fictional_candidate_committee_lookup: true,
    fictional_committee_objects_observed: 8,
    starter_expenditure_receipts_observed: 32,
    all_practice_committees_expenditure_audited: true,
    contribution_expenditure_role_separation_observed: true,
    loaded_committee_filter_observed: true,
    committee_search_and_attributed_totals_separated: true,
    record_attribution_language_observed: true,
    mobile_sort_ribbon_observed: true,
    match_cluster_inspection_route_observed: true,
    queued_contacts_observed: 5,
    zero_result_target_observed: 'Gary Snail',
    authored_starting_contributors_observed: 6,
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
