const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function applyMatchLanguage(root = document) {
  for (const button of root.querySelectorAll?.('[data-decision="CANDIDATE"]') || []) {
    if (button.textContent !== 'Match') button.textContent = 'Match';
  }
  for (const state of root.querySelectorAll?.('.identity-state[data-state="CANDIDATE"]') || []) {
    if (state.textContent !== 'Match') state.textContent = 'Match';
  }
  const cluster = document.getElementById('clusterNotice');
  if (cluster && /candidate cluster/i.test(cluster.textContent)) {
    const next = cluster.textContent.replace(/candidate cluster/ig, 'match cluster');
    if (next !== cluster.textContent) cluster.textContent = next;
  }
}

function replaceText(node, replacements) {
  if (!node) return;
  let text = node.textContent || '';
  let next = text;
  for (const [pattern, replacement] of replacements) next = next.replace(pattern, replacement);
  if (next !== text) node.textContent = next;
}

function applyRecordAttributionLanguage(root = document) {
  const legend = $('#view-review .legend');
  if (legend) {
    if (legend.getAttribute('aria-label') === 'Identity states') legend.setAttribute('aria-label', 'Review states');
    const attributed = legend.querySelector('[data-state="CONFIRMED"]');
    if (attributed) attributed.textContent = 'record attributed';
  }

  const confirmedOption = $('#reviewFilter option[value="CONFIRMED"]');
  if (confirmedOption) confirmedOption.textContent = 'Record attributed';

  const loadedCopy = $('#loadedCampaignContext small');
  replaceText(loadedCopy, [
    [/reviewed campaign identity/gi, 'reviewed campaign / committee record'],
    [/reviewed filing identity/gi, 'reviewed filing record']
  ]);

  const ledgerEyebrow = $('#view-ledger .section-head .eyebrow');
  if (ledgerEyebrow && /IDENTITY-CONFIRMED RECORDS ONLY/i.test(ledgerEyebrow.textContent || '')) {
    ledgerEyebrow.textContent = 'ATTRIBUTED RECORDS ONLY';
  }

  const totalLabel = $('#confirmedTotalLabel');
  if (totalLabel && /identity-confirmed contributions/i.test(totalLabel.textContent || '')) totalLabel.textContent = 'Attributed contributions';

  replaceText($('#confirmedRecordCount'), [
    [/\bidentity-confirmed record\b/gi, 'attributed record'],
    [/\bidentity-confirmed records\b/gi, 'attributed records']
  ]);
  replaceText($('#filingTotalState'), [
    [/^Identity confirmed\b/i, 'Record attributed'],
    [/^IDENTITY CONFIRMED\b/, 'RECORD ATTRIBUTED']
  ]);

  const ceiling = $('.identity-ceiling');
  if (ceiling) ceiling.textContent = 'Record attribution is a research determination, not a legal compliance determination.';

  const ledger = $('#committeeLedger');
  if (ledger) {
    for (const node of ledger.querySelectorAll('strong, span, b, small, .committee-records')) {
      replaceText(node, [
        [/No identity-confirmed giving\./gi, 'No attributed giving.'],
        [/identity-confirmed/gi, 'attributed'],
        [/IDENTITY CONFIRMED/g, 'RECORD ATTRIBUTED'],
        [/confirm record identity/gi, 'attribute the record'],
        [/confirm contribution identity/gi, 'attribute the contribution record']
      ]);
    }
  }

  const targetSummary = $('#campaignTargetSummary');
  replaceText(targetSummary, [
    [/(\d+) identity confirmed\b/gi, '$1 records attributed'],
    [/identity-confirmed/gi, 'attributed']
  ]);

  const committeeSelect = $('#committeeSelect');
  if (committeeSelect) {
    for (const option of committeeSelect.options) {
      replaceText(option, [[/identity-confirmed committee/gi, 'attributed committee']]);
    }
  }

  const recordSelect = $('#createRecordSelect');
  if (recordSelect) {
    for (const option of recordSelect.options) {
      replaceText(option, [[/identity-confirmed record/gi, 'attributed record']]);
    }
  }

  for (const label of $$('#view-campaign .field > span')) {
    replaceText(label, [[/Identity-confirmed source record/gi, 'Attributed source record']]);
  }
  for (const paragraph of $$('#view-campaign p')) {
    replaceText(paragraph, [
      [/identity-confirmed gift/gi, 'attributed gift'],
      [/identity-confirmed record/gi, 'attributed record']
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

for (const id of ['view-review', 'view-ledger', 'view-campaign']) {
  const node = document.getElementById(id);
  if (node) new MutationObserver(queueApply).observe(node, { childList: true, subtree: true, characterData: true });
}

applyRecordAttributionLanguage();

export { applyRecordAttributionLanguage };
