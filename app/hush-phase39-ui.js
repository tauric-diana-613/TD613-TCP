import { PHASE39_AUDIENCES, runPhase39, phase39Receipt } from './hush-phase39-engine.js';

const byId = (id) => document.getElementById(id);
const clean = (value) => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
const tone = (severity) => severity === 'high' ? 'alert' : severity === 'medium' ? 'warn' : severity === 'low' ? 'good' : '';

function selectedMask() {
  const select = byId('maskFieldSelect');
  return { id: select?.value || null, label: select?.selectedOptions?.[0]?.textContent || null };
}

function chip(label, severity = '') {
  return `<span class="hush-phase39-chip ${tone(severity)}">${clean(label)}</span>`;
}

function buildPanel() {
  if (byId('hushPhase39Panel')) return byId('hushPhase39Panel');
  const panel = document.createElement('section');
  panel.id = 'hushPhase39Panel';
  panel.className = 'hush-phase39-panel';
  panel.innerHTML = `
    <div class="hush-phase39-head">
      <div><div class="hush-phase39-kicker">Phase 39 · reader</div><h2 class="hush-phase39-title">Meaning Survives the Mask</h2></div>
      <p class="hush-phase39-copy">Audit claim drift, meaning loss, audience pressure, over-polish, and receipt custody.</p>
    </div>
    <div class="hush-phase39-controls">
      <label>Audience mode<select id="hushPhase39Audience"></select></label>
      <label>Protected meaning lockbox<textarea id="hushPhase39Lockbox" placeholder="One protected meaning per line: dates, claims, refusals, sacred phrases, boundaries."></textarea></label>
    </div>
    <div class="hush-phase39-actions">
      <button id="hushPhase39RunBtn" class="primary" type="button">Run Phase 39</button>
      <button id="hushPhase39ReceiptBtn" type="button">Export Receipt</button>
    </div>
    <div class="hush-phase39-grid">
      <article class="hush-phase39-card"><h4>Reader Warnings</h4><div id="hushPhase39Reader" class="hush-phase39-chiprow"></div></article>
      <article class="hush-phase39-card"><h4>Protected Meaning</h4><div id="hushPhase39LockboxResults" class="hush-phase39-chiprow"></div></article>
      <article class="hush-phase39-card"><h4>Epistemicide Alarm</h4><div id="hushPhase39Epistemicide" class="hush-phase39-chiprow"></div></article>
      <article class="hush-phase39-card"><h4>Register Drift</h4><div id="hushPhase39Drift" class="hush-phase39-chiprow"></div><div class="hush-phase39-meter"><i id="hushPhase39PrettyBar"></i></div><div id="hushPhase39PrettyText" class="hush-phase39-small">Beauty is not admissibility.</div></article>
      <article class="hush-phase39-card"><h4>Plain Speech Recovery</h4><div id="hushPhase39Plain" class="hush-phase39-output">Run Phase 39 after generating output.</div></article>
      <article class="hush-phase39-card"><h4>Clean Receipt</h4><div id="hushPhase39Receipt" class="hush-phase39-output">Receipt excludes source/output text and carries hashes only.</div></article>
    </div>`;
  const anchor = byId('hushComparePanel') || byId('hushPressureRibbon') || byId('protectedOutputHeading')?.closest('.hush-output-card');
  if (anchor?.parentNode) anchor.parentNode.insertBefore(panel, anchor.nextSibling);
  return panel;
}

function populateAudience() {
  const select = byId('hushPhase39Audience');
  if (!select || select.options.length) return;
  select.innerHTML = PHASE39_AUDIENCES.map((item) => `<option value="${clean(item)}">${clean(item.replaceAll('-', ' '))}</option>`).join('');
}

function renderPhase39() {
  buildPanel();
  populateAudience();
  const source = byId('messageDraftInput')?.value || '';
  const output = byId('protectedOutputInput')?.value || '';
  const audience = byId('hushPhase39Audience')?.value || 'employer-review';
  const lockboxText = byId('hushPhase39Lockbox')?.value || '';
  const report = runPhase39({ source, output, audience, lockboxText, mask: selectedMask() });
  byId('hushPhase39Reader').innerHTML = report.adversarialReaderWarnings.map((item) => chip(`${item.label}: ${item.detail}`, item.severity)).join('');
  byId('hushPhase39LockboxResults').innerHTML = report.protectedMeaningResults.map((item) => chip(`${item.label}: ${item.status}`, item.severity)).join('');
  byId('hushPhase39Epistemicide').innerHTML = report.epistemicideWarnings.length ? report.epistemicideWarnings.map((item) => chip(`${item.pattern}: ${item.sourcePhrase} → ${item.outputPhrase}`, item.severity)).join('') : chip('no unmarked knowledge-loss alarm', 'low');
  const drift = report.registerDrift;
  byId('hushPhase39Drift').innerHTML = [
    chip(`claim Δ ${drift.claimSpecificity.delta.toFixed(3)}`, drift.claimSpecificity.delta < 0 ? 'medium' : 'low'),
    chip(`softening Δ ${drift.softening.delta.toFixed(3)}`, drift.softening.delta > 0 ? 'medium' : 'low'),
    chip(`ornament Δ ${drift.ornament.delta.toFixed(3)}`, drift.ornament.delta > 0 ? 'medium' : 'low'),
    chip(`length Δ ${drift.length.delta}`, 'low')
  ].join('');
  const prettyPct = Math.round(report.tooPrettyScore * 100);
  byId('hushPhase39PrettyBar').style.width = `${prettyPct}%`;
  byId('hushPhase39PrettyText').textContent = prettyPct > 45 ? `Too-pretty risk ${prettyPct}%. Beauty is not admissibility.` : `Too-pretty risk ${prettyPct}%.`;
  byId('hushPhase39Plain').textContent = report.plainSpeech || 'No plain speech recovery yet.';
  byId('hushPhase39Receipt').textContent = JSON.stringify(report.receipt, null, 2);
  window.__TD613_HUSH_PHASE39_LAST__ = report;
  return report;
}

function exportReceipt() {
  const source = byId('messageDraftInput')?.value || '';
  const output = byId('protectedOutputInput')?.value || '';
  const audience = byId('hushPhase39Audience')?.value || 'employer-review';
  const lockboxText = byId('hushPhase39Lockbox')?.value || '';
  const json = JSON.stringify(phase39Receipt({ source, output, audience, lockboxText, mask: selectedMask() }), null, 2);
  const target = byId('ledgerExportOutput') || byId('reportExportOutput');
  if (target) target.value = json;
  byId('hushPhase39Receipt').textContent = json;
}

function bindPhase39() {
  buildPanel();
  populateAudience();
  byId('hushPhase39RunBtn')?.addEventListener('click', renderPhase39);
  byId('hushPhase39ReceiptBtn')?.addEventListener('click', exportReceipt);
  ['messageDraftInput','protectedOutputInput','hushPhase39Lockbox','hushPhase39Audience','maskFieldSelect'].forEach((id) => byId(id)?.addEventListener('input', () => setTimeout(renderPhase39, 50)));
  ['generateMaskedOutputBtn','analyzeOutputBtn','acceptOutputBtn'].forEach((id) => byId(id)?.addEventListener('click', () => setTimeout(renderPhase39, 150)));
  renderPhase39();
  window.__TD613_HUSH_PHASE39__ = { renderPhase39, exportReceipt };
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(bindPhase39, 220));
else setTimeout(bindPhase39, 220);
