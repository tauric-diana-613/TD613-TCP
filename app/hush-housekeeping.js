const HUSH_HOUSEKEEPING_VERSION = 'phase-32-housekeeping';
const $ = (id) => document.getElementById(id);
const text = (value) => String(value ?? '').trim();
const words = (value) => (text(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []);
const sentences = (value) => text(value).split(/[.!?]+/).map((item) => item.trim()).filter(Boolean);
const esc = (value) => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');

function bench() { return window.__TD613_HUSH_BENCH__ || {}; }
function state() { return bench().benchState || {}; }

function chip(label, level = '') {
  return `<span class="hush-quality-chip ${level}">${esc(label)}</span>`;
}

function ensureAfter(anchor, node) {
  if (!anchor || !anchor.parentNode || !node) return;
  if (node.parentNode) return;
  anchor.parentNode.insertBefore(node, anchor.nextSibling);
}

function buildHousekeepingPanel() {
  if ($('hushHousekeepingPanel')) return $('hushHousekeepingPanel');
  const panel = document.createElement('section');
  panel.id = 'hushHousekeepingPanel';
  panel.className = 'hush-housekeeping-panel';
  panel.innerHTML = `
    <div class="hush-housekeeping-head">
      <div><div class="hush-housekeeping-kicker">Custody / housekeeping</div><h2 class="hush-housekeeping-title">Private Text Custody</h2></div>
      <p class="hush-housekeeping-copy">Reference samples and draft text are local operator material. Export defaults should carry receipts, not private passages.</p>
    </div>
    <div class="hush-housekeeping-actions">
      <button id="hushClearSamplesBtn" type="button">Clear Samples</button>
      <button id="hushClearCustomMaskBtn" type="button">Clear Custom Mask</button>
      <button id="hushExportCleanReceiptBtn" type="button">Export Clean Receipt</button>
      <button id="hushCopyCleanReceiptBtn" type="button">Copy Receipt</button>
    </div>
    <details class="hush-housekeeping-details"><summary>More Mask Anatomy</summary><div class="hush-housekeeping-detail-body">Start with name, use-when, and risk-tell. Sentence shape, ornament, warmth, custody, and pressure warnings are advanced knobs; they are powerful but easy to overfit.</div></details>
    <div id="hushCustodyStatus" class="hush-custody-status">Custody pass ready. Private text excluded from clean receipts.</div>`;
  const path = $('hushOperatorPath');
  ensureAfter(path, panel);
  return panel;
}

function buildComparePanel() {
  if ($('hushComparePanel')) return $('hushComparePanel');
  const panel = document.createElement('section');
  panel.id = 'hushComparePanel';
  panel.className = 'hush-compare-panel';
  panel.innerHTML = `
    <div class="hush-compare-head"><div><div class="hush-compare-kicker">Before / after / losses</div><h2 class="hush-compare-title">Transformation Check</h2></div><p class="hush-compare-copy">Inspect what moved, what held, and what still feels too source-shaped.</p></div>
    <div class="hush-compare-grid">
      <article class="hush-compare-cell"><h4>Before</h4><div id="hushCompareBefore" class="hush-compare-text">No message yet.</div></article>
      <article class="hush-compare-cell"><h4>After</h4><div id="hushCompareAfter" class="hush-compare-text">No transformed message yet.</div></article>
      <article class="hush-compare-cell"><h4>Losses / Preserved</h4><div id="hushCompareLosses" class="hush-compare-losses"></div></article>
    </div>`;
  ensureAfter($('hushPressureRibbon'), panel);
  return panel;
}

function buildQualityPanel() {
  if ($('hushQualityPanel')) return $('hushQualityPanel');
  const panel = document.createElement('section');
  panel.id = 'hushQualityPanel';
  panel.className = 'hush-quality-panel';
  panel.innerHTML = `<div class="hush-quality-head"><div><div class="hush-quality-kicker">Sample quality</div><h3 class="hush-quality-title">Reference Fitness</h3></div></div><div id="hushQualityList" class="hush-quality-list"></div>`;
  const custom = $('hushCustomizePanel') || $('hushBuiltInMaskPanel');
  ensureAfter(custom, panel);
  return panel;
}

function buildIdentPanel() {
  if ($('hushIdentPanel')) return $('hushIdentPanel');
  const panel = document.createElement('section');
  panel.id = 'hushIdentPanel';
  panel.className = 'hush-ident-panel';
  panel.innerHTML = `<div class="hush-ident-head"><div><div class="hush-ident-kicker">Too-identifiable meter</div><h3 class="hush-ident-title">Source Residual</h3></div><span id="hushIdentScore" class="hush-ident-score">0%</span></div><div class="hush-ident-meter"><i id="hushIdentBar"></i></div><div id="hushIdentAdvice" class="hush-ident-advice"></div>`;
  ensureAfter($('hushProfileMatchPanel'), panel);
  return panel;
}

function buildActiveMaskBadge() {
  if ($('hushActiveMaskBadge')) return $('hushActiveMaskBadge');
  const badge = document.createElement('div');
  badge.id = 'hushActiveMaskBadge';
  badge.className = 'hush-active-mask-badge';
  badge.innerHTML = '<span>Active mask</span><strong id="hushActiveMaskName">pending</strong>';
  ensureAfter($('maskFieldSelect'), badge);
  return badge;
}

function sampleQuality(value) {
  const chars = text(value).length;
  const w = words(value);
  const s = sentences(value);
  const unique = new Set(w.map((item) => item.toLowerCase())).size;
  const variety = w.length ? unique / w.length : 0;
  const proper = (text(value).match(/\b[A-Z][a-z]+\b/g) || []).length;
  return { chars, wordCount: w.length, sentenceCount: s.length, variety, proper };
}

function updateQuality() {
  buildQualityPanel();
  const sample = $('hushVoiceReferenceSamplesSaved')?.value || $('hushCustomMaskSampleInput')?.value || $('maskReferenceInput')?.value || '';
  const q = sampleQuality(sample);
  const list = $('hushQualityList');
  if (!list) return;
  list.innerHTML = [
    chip(`${q.chars} chars`, q.chars >= 1200 ? 'good' : 'warn'),
    chip(`${q.wordCount} words`, q.wordCount >= 180 ? 'good' : 'warn'),
    chip(`${q.sentenceCount} sentences`, q.sentenceCount >= 8 ? 'good' : 'warn'),
    chip(`variety ${Math.round(q.variety * 100)}%`, q.variety > .38 ? 'good' : 'warn'),
    chip(`${q.proper} proper-name signals`, q.proper > 14 ? 'alert' : 'good')
  ].join('');
}

function overlapScore(a, b) {
  const aw = new Set(words(a).map((item) => item.toLowerCase()).filter((item) => item.length > 3));
  const bw = new Set(words(b).map((item) => item.toLowerCase()).filter((item) => item.length > 3));
  if (!aw.size || !bw.size) return 0;
  let both = 0;
  for (const item of aw) if (bw.has(item)) both += 1;
  return both / Math.max(aw.size, 1);
}

function updateCompareAndResidual() {
  buildComparePanel();
  buildIdentPanel();
  const source = $('messageDraftInput')?.value || '';
  const output = $('protectedOutputInput')?.value || '';
  if ($('hushCompareBefore')) $('hushCompareBefore').textContent = source || 'No message yet.';
  if ($('hushCompareAfter')) $('hushCompareAfter').textContent = output || 'No transformed message yet.';
  const overlap = overlapScore(source, output);
  const profileMatch = state().hushProfileMatch || {};
  const summary = profileMatch.summary || profileMatch;
  const residual = Number(summary.sourceResidualRisk ?? summary.sourceResidual ?? overlap) || overlap;
  const pct = Math.max(0, Math.min(100, Math.round(residual * 100)));
  if ($('hushIdentScore')) $('hushIdentScore').textContent = `${pct}%`;
  if ($('hushIdentBar')) $('hushIdentBar').style.width = `${pct}%`;
  const advice = [];
  if (!output.trim()) advice.push(chip('waiting for output', 'warn'));
  else if (pct > 60) advice.push(chip('too source-shaped', 'alert'));
  else if (pct > 34) advice.push(chip('review rhythm', 'warn'));
  else advice.push(chip('source residual low', 'good'));
  if ($('hushIdentAdvice')) $('hushIdentAdvice').innerHTML = advice.join('');
  const losses = [];
  losses.push(chip(`lexical overlap ${Math.round(overlap * 100)}%`, overlap > .55 ? 'alert' : overlap > .32 ? 'warn' : 'good'));
  losses.push(chip(`before words ${words(source).length}`));
  losses.push(chip(`after words ${words(output).length}`));
  const protectedTokens = (source.match(/\b(?:TD613|SHI|SAC|REF|CASE|DOC|ID)[A-Z0-9:_#/-]*\b/g) || []).length;
  losses.push(chip(`${protectedTokens} protected-token signals`, 'good'));
  if ($('hushCompareLosses')) $('hushCompareLosses').innerHTML = losses.join('');
}

function selectedMaskLabel() {
  const select = $('maskFieldSelect');
  return select?.selectedOptions?.[0]?.textContent || state().selectedHushMask?.label || 'pending';
}

function updateActiveMask() {
  buildActiveMaskBadge();
  const select = $('maskFieldSelect');
  if ($('hushActiveMaskName')) $('hushActiveMaskName').textContent = selectedMaskLabel();
  if (select) {
    select.classList.add('hush-selected');
    try { localStorage.setItem('td613-hush-selected-mask', select.value || ''); } catch (error) {}
  }
  document.querySelectorAll('.persona-select').forEach((button) => {
    const active = button.dataset.maskId && button.dataset.maskId === (select?.value || state().selectedHushMaskId);
    button.classList.toggle('is-active', Boolean(active));
    if (active) button.textContent = 'Selected';
  });
}

function cleanReceipt() {
  const s = state();
  const mask = s.selectedHushMask || {};
  return {
    schema: 'td613-hush-receipt/v1',
    createdAt: new Date().toISOString(),
    includesPrivateText: false,
    privateTextExcluded: true,
    mask: { id: s.selectedHushMaskId || mask.id || null, label: mask.label || selectedMaskLabel(), source: mask.source || 'built-in' },
    route: s.recognitionField?.classifications?.route || 'unrun',
    controller: { state: s.controllerDecision?.state || 'waiting', action: s.controllerDecision?.action || 'waiting' },
    scores: s.escapeVector?.scores || null,
    claimCeiling: s.claimCeiling?.label || null,
    warnings: [ ...(s.hushProfileMatch?.warnings || []), ...(s.recognitionField?.warnings || []), ...(s.controllerDecision?.warnings || []) ].slice(0, 20),
    custody: 'Receipt carries metrics and route metadata only; source drafts, mask samples, and outputs are excluded.'
  };
}

function exportCleanReceipt(copy = false) {
  const json = JSON.stringify(cleanReceipt(), null, 2);
  const out = $('ledgerExportOutput') || $('reportExportOutput');
  if (out) out.value = json;
  if (copy && navigator.clipboard) navigator.clipboard.writeText(json).catch(() => {});
  if ($('hushCustodyStatus')) $('hushCustodyStatus').textContent = copy ? 'Clean receipt copied. Private text excluded.' : 'Clean receipt exported. Private text excluded.';
  return json;
}

function clearSamples() {
  ['hushVoiceReferenceSamplesSaved','hushCustomMaskSampleInput','maskReferenceInput'].forEach((id) => { const el = $(id); if (el) el.value = ''; });
  const s = state();
  s.activeCustomMask = null;
  if ($('hushCustodyStatus')) $('hushCustodyStatus').textContent = 'Reference samples cleared from visible fields and active custom-mask state.';
  updateQuality();
}

function clearCustomMask() {
  const s = state();
  s.activeCustomMask = null;
  s.customMasks = [];
  if (typeof bench().renderHushMaskOptions === 'function') bench().renderHushMaskOptions();
  const select = $('maskFieldSelect');
  if (select && select.options.length) {
    select.value = select.options[0].value;
    if (typeof bench().selectHushMask === 'function') bench().selectHushMask(select.value);
  }
  if ($('hushCustodyStatus')) $('hushCustodyStatus').textContent = 'Custom masks cleared for this session. Built-in mask route restored.';
  updateActiveMask();
}

function improveLabels() {
  const labels = [
    ['generateMaskedOutputBtn','Transform the message through the selected mask. Review before use.'],
    ['acceptOutputBtn','Accept only after review; accepted output enters local mask memory.'],
    ['includeLedgerTextsToggle','Off by default. Turning this on includes private text in export.'],
    ['maskReferenceInput','Advanced: reference text can improve a mask but increases custody burden.']
  ];
  for (const [id, title] of labels) { const el = $(id); if (el) el.title = title; }
}

function bind() {
  buildHousekeepingPanel();
  buildComparePanel();
  buildQualityPanel();
  buildIdentPanel();
  buildActiveMaskBadge();
  improveLabels();
  $('hushClearSamplesBtn')?.addEventListener('click', clearSamples);
  $('hushClearCustomMaskBtn')?.addEventListener('click', clearCustomMask);
  $('hushExportCleanReceiptBtn')?.addEventListener('click', () => exportCleanReceipt(false));
  $('hushCopyCleanReceiptBtn')?.addEventListener('click', () => exportCleanReceipt(true));
  $('maskFieldSelect')?.addEventListener('change', () => setTimeout(updateActiveMask, 0));
  for (const id of ['hushVoiceReferenceSamplesSaved','hushCustomMaskSampleInput','maskReferenceInput']) $(id)?.addEventListener('input', updateQuality);
  for (const id of ['messageDraftInput','protectedOutputInput']) $(id)?.addEventListener('input', updateCompareAndResidual);
  for (const id of ['generateMaskedOutputBtn','analyzeOutputBtn','copyHushOutputBtn','acceptOutputBtn']) $(id)?.addEventListener('click', () => setTimeout(() => { updateCompareAndResidual(); updateActiveMask(); }, 80));
  try {
    const saved = localStorage.getItem('td613-hush-selected-mask');
    if (saved && $('maskFieldSelect') && typeof bench().selectHushMask === 'function') {
      $('maskFieldSelect').value = saved;
      bench().selectHushMask(saved);
    }
  } catch (error) {}
  updateQuality();
  updateCompareAndResidual();
  updateActiveMask();
  window.__TD613_HUSH_HOUSEKEEPING__ = { version: HUSH_HOUSEKEEPING_VERSION, cleanReceipt, clearSamples, clearCustomMask, updateQuality, updateCompareAndResidual };
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(bind, 120));
else setTimeout(bind, 120);
