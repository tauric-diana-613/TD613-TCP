const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function setText(node, next) {
  if (!node || node.textContent === next) return false;
  node.textContent = next;
  return true;
}

function replaceText(node, replacements) {
  if (!node) return false;
  const text = node.textContent || '';
  let next = text;
  for (const [pattern, replacement] of replacements) next = next.replace(pattern, replacement);
  return next !== text ? setText(node, next) : false;
}

function applyMatchLanguage(root = document) {
  for (const button of root.querySelectorAll?.('[data-decision="CANDIDATE"]') || []) setText(button, 'Match');
  for (const state of root.querySelectorAll?.('.identity-state[data-state="CANDIDATE"]') || []) setText(state, 'Match');
  const cluster = document.getElementById('clusterNotice');
  if (cluster && /candidate cluster/i.test(cluster.textContent || '')) {
    replaceText(cluster, [[/candidate cluster/ig, 'match cluster']]);
  }
}

function applyRecordAttributionLanguage(root = document) {
  const legend = $('#view-review .legend');
  if (legend) {
    if (legend.getAttribute('aria-label') === 'Identity states') legend.setAttribute('aria-label', 'Review states');
    setText(legend.querySelector('[data-state="CONFIRMED"]'), 'record attributed');
    setText(legend.querySelector('[data-state="UNREVIEWED"]'), 'record unresolved');
  }

  setText($('#reviewFilter option[value="CONFIRMED"]'), 'Record attributed');
  setText($('#reviewFilter option[value="UNREVIEWED"]'), 'Record unresolved');

  for (const button of root.querySelectorAll?.('[data-decision="CONFIRMED"]') || []) setText(button, 'Record attributed');
  for (const button of root.querySelectorAll?.('[data-decision="UNREVIEWED"]') || []) setText(button, 'Record unresolved');
  for (const state of root.querySelectorAll?.('.identity-state[data-state="CONFIRMED"]') || []) setText(state, 'Record attributed');
  for (const state of root.querySelectorAll?.('.identity-state[data-state="UNREVIEWED"]') || []) setText(state, 'Record unresolved');

  const searchHintsLabel = $('#searchHints')?.closest('.field')?.querySelector(':scope > span');
  if (searchHintsLabel && /^IDENTITY HINTS\b/i.test(searchHintsLabel.textContent || '')) {
    const first = searchHintsLabel.childNodes[0];
    if (first?.textContent !== 'SEARCH HINTS ') first.textContent = 'SEARCH HINTS ';
  }

  const safetyHeading = $$('.safety-block strong').find((node) => /Identity matching stays manual/i.test(node.textContent || ''));
  setText(safetyHeading, safetyHeading ? 'Record matching stays manual' : '');

  const holdReview = $('#holdReviewButton');
  if (holdReview?.title) {
    const nextTitle = holdReview.title
      .replace(/this Identity Review/gi, 'this contribution review')
      .replace(/Identity Review/gi, 'Contribution review');
    if (nextTitle !== holdReview.title) holdReview.title = nextTitle;
  }

  replaceText($('#loadedCampaignContext small'), [
    [/reviewed campaign identity/gi, 'reviewed campaign / committee record'],
    [/reviewed filing identity/gi, 'reviewed filing record']
  ]);

  const ledgerEyebrow = $('#view-ledger .section-head .eyebrow');
  if (/IDENTITY-CONFIRMED RECORDS ONLY/i.test(ledgerEyebrow?.textContent || '')) setText(ledgerEyebrow, 'ATTRIBUTED RECORDS ONLY');
  else if (/COMMITTEE SEARCH \+ CONFIRMED DONOR TOTALS/i.test(ledgerEyebrow?.textContent || '')) setText(ledgerEyebrow, 'COMMITTEE SEARCH + ATTRIBUTED DONOR TOTALS');

  const totalLabel = $('#confirmedTotalLabel');
  if (/identity-confirmed contributions/i.test(totalLabel?.textContent || '')) setText(totalLabel, 'Attributed contributions');

  replaceText($('#confirmedRecordCount'), [
    [/\bidentity-confirmed record\b/gi, 'attributed record'],
    [/\bidentity-confirmed records\b/gi, 'attributed records']
  ]);
  replaceText($('#filingTotalState'), [
    [/^Identity confirmed\b/i, 'Record attributed'],
    [/^IDENTITY CONFIRMED\b/, 'RECORD ATTRIBUTED']
  ]);
  replaceText($('#wakeIdentityState'), [[/^(\d+) identity confirmed$/i, '$1 records attributed']]);

  setText($('.identity-ceiling'), 'Record attribution is a research determination, not a legal compliance determination.');

  const ledger = $('#committeeLedger');
  if (ledger) {
    for (const node of ledger.querySelectorAll('strong, span, b, small, .committee-records')) {
      replaceText(node, [
        [/No identity-confirmed giving\./gi, 'No attributed giving.'],
        [/confirmed donor totals/gi, 'attributed donor totals'],
        [/identity-confirmed/gi, 'attributed'],
        [/IDENTITY CONFIRMED/g, 'RECORD ATTRIBUTED'],
        [/confirm record identity/gi, 'attribute the record'],
        [/confirm contribution identity/gi, 'attribute the contribution record']
      ]);
    }
  }

  replaceText($('#campaignTargetSummary'), [
    [/(\d+) identity confirmed\b/gi, '$1 records attributed'],
    [/identity-confirmed/gi, 'attributed']
  ]);

  const committeeSelect = $('#committeeSelect');
  if (committeeSelect) {
    for (const option of committeeSelect.options) replaceText(option, [[/identity-confirmed committee/gi, 'attributed committee']]);
  }

  const recordSelect = $('#createRecordSelect');
  if (recordSelect) {
    for (const option of recordSelect.options) replaceText(option, [[/identity-confirmed record/gi, 'attributed record']]);
  }

  for (const label of $$('#view-campaign .field > span')) replaceText(label, [[/Identity-confirmed source record/gi, 'Attributed source record']]);
  for (const paragraph of $$('#view-campaign p')) {
    replaceText(paragraph, [
      [/identity-confirmed gift/gi, 'attributed gift'],
      [/identity-confirmed record/gi, 'attributed record']
    ]);
  }

  for (const toast of $$('#toastStack .toast')) {
    replaceText(toast, [
      [/Identity Review/gi, 'Contribution review'],
      [/identity-confirmed/gi, 'attributed'],
      [/identity state/gi, 'review state']
    ]);
  }

  // The 12-step Committee workspace may arrive after this module. Its copy is
  // normalized here too so the newer explanatory layer cannot reintroduce the
  // retired status ontology.
  for (const node of $$('#view-ledger .committee-search-lane-copy, #confirmedGivingLaneHeading span, #confirmedGivingLaneHeading strong, #confirmedGivingLaneHeading small')) {
    replaceText(node, [
      [/donor identity confirmation/gi, 'record attribution'],
      [/Identity confirmed/gi, 'Record attributed'],
      [/identity confirmed/gi, 'record attributed'],
      [/confirmed giving totals/gi, 'attributed giving totals'],
      [/confirmed donor totals/gi, 'attributed donor totals'],
      [/confirm contribution identity/gi, 'attribute a contribution record']
    ]);
  }

  applyMatchLanguage(root);
}

let queued = false;
function queueApply() {
  if (queued) return;
  queued = true;
  queueMicrotask(() => {
    queued = false;
    applyRecordAttributionLanguage();
  });
}

for (const id of ['view-review', 'view-ledger', 'view-campaign', 'wakeIdentityState', 'toastStack']) {
  const node = document.getElementById(id);
  if (node) new MutationObserver(queueApply).observe(node, { childList: true, subtree: true, characterData: true });
}
const holdReview = document.getElementById('holdReviewButton');
if (holdReview) new MutationObserver(queueApply).observe(holdReview, { attributes: true, attributeFilter: ['title'] });

applyRecordAttributionLanguage();

export { applyRecordAttributionLanguage };
