import { createCustomMask, addCustomMaskSample, rebuildCustomMaskProfile } from './engine/hush-custom-mask.js';

const MIN_SAMPLE_CHARS = 1200;
const VERSION = 'phase-31.1';
const text = (value) => String(value ?? '').trim();
const byId = (id, doc = document) => doc.getElementById(id);
const words = (value = '') => (String(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length;
const slug = (value = 'custom-mask') => text(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'custom-mask';

let dotTimer = null;
let samples = [];
let activeMask = null;

function installLoading(doc = document) {
  if (!doc.body || byId('td613HushLoading', doc)) return;
  const overlay = doc.createElement('div');
  overlay.id = 'td613HushLoading';
  overlay.innerHTML = '<div class="td613-hush-loading-core"><div class="td613-hush-loading-mark">TD613 / Hush</div><div class="td613-hush-loading-text">TD613 Hush is loading<span id="td613HushLoadingDots" class="td613-hush-loading-dots">.</span></div></div>';
  doc.body.prepend(overlay);
  const dots = byId('td613HushLoadingDots', doc);
  let n = 0;
  dotTimer = setInterval(() => { if (dots) dots.textContent = ['.', '..', '...'][n++ % 3]; }, 360);
  const hide = () => window.setTimeout(() => { overlay.hidden = true; clearInterval(dotTimer); }, 450);
  window.addEventListener('load', hide, { once: true });
  window.setTimeout(hide, 3800);
}

function shellHtml() {
  return `<section id="hushPhase31CustomizerPanel" class="hush-phase31-customizer" hidden>
    <div class="hush-phase31-head"><div><p class="hush-phase31-title">Voice reference samples</p><p class="hush-phase31-note">Paste one rigorous reference sample at a time. Minimum ${MIN_SAMPLE_CHARS} characters before Hush will log it into the custom mask profile.</p></div><span id="hushPhase31ProfileStatus" class="hush-phase31-status">empty</span></div>
    <label class="hush-phase31-label" for="hushVoiceReferenceSamplesSaved"><span>Saved voice reference samples</span><span>Log samples here; the custom mask profile refines after every accepted sample.</span></label>
    <textarea id="hushVoiceReferenceSamplesSaved" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Paste one voice reference sample, then tap Log Sample. Saved sample count will update below."></textarea>
    <div class="hush-phase31-actions"><button id="hushPhase31SaveMaskBtn" type="button" class="secondary">Save Mask</button><button id="hushPhase31LogSampleBtn" type="button" class="secondary">Log Sample</button><span class="hush-phase31-mini">count <strong id="hushPhase31SampleCount">0</strong></span><button id="hushPhase31Undo" type="button" class="hush-phase31-mini hush-phase31-link" aria-disabled="true">undo</button></div>
    <div id="hushPhase31SampleStatus" class="persona-memory-summary">No samples logged.</div>
  </section>`;
}

function modalHtml() {
  return `<div id="hushPhase31SaveModal" class="hush-phase31-modal" hidden role="dialog" aria-modal="true" aria-labelledby="hushPhase31ModalTitle">
    <div class="hush-phase31-modal-card"><h3 id="hushPhase31ModalTitle">Save Custom Mask</h3>
      <div class="hush-phase31-modal-grid">
        <label>Name<input id="hushPhase31MaskName" autocomplete="off" placeholder="Glitching Cassandra"></label>
        <label>Family<input id="hushPhase31MaskFamily" autocomplete="off" placeholder="custom field mask"></label>
        <label class="wide">Persona Story<textarea id="hushPhase31MaskDescription" placeholder="A short scene or context for this voice."></textarea></label>
        <label class="wide">Use When<textarea id="hushPhase31MaskIntendedUse" placeholder="Where this mask should be used."></textarea></label>
        <label class="wide">Risk Tell<textarea id="hushPhase31MaskRiskTell" placeholder="What becomes identifying or unstable."></textarea></label>
        <label>Sentence Shape<input id="hushPhase31MaskSentence" placeholder="short / mid / long / jagged"></label>
        <label>Ornament<input id="hushPhase31MaskOrnament" placeholder="low / medium / high"></label>
        <label>Warmth<input id="hushPhase31MaskWarmth" placeholder="low / medium / high"></label>
        <label>Custody<input id="hushPhase31MaskCustody" placeholder="medium / high / very-high"></label>
        <label class="wide">Pressure Warnings<textarea id="hushPhase31MaskWarnings" placeholder="Comma or line separated warnings."></textarea></label>
      </div>
      <div class="hush-phase31-modal-actions"><button id="hushPhase31CancelSave" type="button" class="ghost">Cancel</button><button id="hushPhase31AddToStudio" type="button" class="primary-cta">Add to Mask Studio</button></div>
      <div id="hushPhase31ModalStatus" class="hush-phase31-modal-status"></div>
    </div>
  </div>`;
}

function renderLedger(doc = document) {
  const area = byId('hushVoiceReferenceSamplesSaved', doc);
  const count = byId('hushPhase31SampleCount', doc);
  const status = byId('hushPhase31SampleStatus', doc);
  const profile = byId('hushPhase31ProfileStatus', doc);
  const undo = byId('hushPhase31Undo', doc);
  if (count) count.textContent = String(samples.length);
  if (undo) undo.setAttribute('aria-disabled', samples.length ? 'false' : 'true');
  if (area && samples.length) area.value = samples.map((sample, index) => `--- sample ${index + 1} / ${sample.length} chars / ${words(sample)} words ---\n${sample}`).join('\n\n');
  const total = samples.join('\n\n');
  if (status) status.innerHTML = samples.length ? `Samples ${samples.length} · chars ${total.length} · words ${words(total)}` : 'No samples logged.';
  if (profile) profile.textContent = activeMask ? `${activeMask.profileStatus} · ${activeMask.totalWords || 0} words` : 'empty';
}

function syncBench(mask, doc = document) {
  const bench = window.__TD613_HUSH_BENCH__ || {};
  const state = bench.benchState || {};
  if (!mask || !state) return;
  state.activeCustomMask = mask;
  state.selectedHushMask = mask;
  state.selectedHushMaskId = mask.id;
  const ref = byId('maskReferenceInput', doc);
  if (ref) ref.value = samples.join('\n\n');
  if (typeof bench.renderHushMaskProfile === 'function') bench.renderHushMaskProfile();
  if (typeof bench.renderHushProfileMatch === 'function') bench.renderHushProfileMatch(null);
}

function logSample(doc = document) {
  const area = byId('hushVoiceReferenceSamplesSaved', doc);
  const status = byId('hushPhase31SampleStatus', doc);
  const raw = text(area?.value || '').replace(/--- sample \d+[\s\S]*?(?=--- sample \d+|$)/g, '').trim() || text(area?.value || '');
  if (raw.length < MIN_SAMPLE_CHARS) {
    if (status) status.textContent = `Sample too short: ${raw.length}/${MIN_SAMPLE_CHARS} characters. Paste a fuller reference sample before logging.`;
    return null;
  }
  samples.push(raw);
  activeMask = activeMask || createCustomMask({ label: 'Unsaved Custom Mask', id: 'custom-unsaved-phase31-1' });
  activeMask = addCustomMaskSample(activeMask, raw, { includePrivateText: true });
  syncBench(activeMask, doc);
  renderLedger(doc);
  return activeMask;
}

function undoSample(doc = document) {
  if (!samples.length) return;
  samples.pop();
  activeMask = createCustomMask({ label: 'Unsaved Custom Mask', id: 'custom-unsaved-phase31-1' });
  for (const sample of samples) activeMask = addCustomMaskSample(activeMask, sample, { includePrivateText: true });
  if (!samples.length) activeMask = null;
  syncBench(activeMask, doc);
  renderLedger(doc);
}

function readModal(doc = document) {
  const warnings = text(byId('hushPhase31MaskWarnings', doc)?.value).split(/[\n,]+/).map((item) => item.trim()).filter(Boolean);
  return {
    label: text(byId('hushPhase31MaskName', doc)?.value),
    family: text(byId('hushPhase31MaskFamily', doc)?.value) || 'custom field mask',
    description: text(byId('hushPhase31MaskDescription', doc)?.value),
    intendedUse: text(byId('hushPhase31MaskIntendedUse', doc)?.value),
    riskTell: text(byId('hushPhase31MaskRiskTell', doc)?.value),
    transformHints: {
      sentence: text(byId('hushPhase31MaskSentence', doc)?.value),
      ornament: text(byId('hushPhase31MaskOrnament', doc)?.value),
      warmth: text(byId('hushPhase31MaskWarmth', doc)?.value),
      custody: text(byId('hushPhase31MaskCustody', doc)?.value)
    },
    pressureWarnings: warnings
  };
}

function addToStudio(doc = document) {
  const bench = window.__TD613_HUSH_BENCH__ || {};
  const state = bench.benchState || {};
  const modalStatus = byId('hushPhase31ModalStatus', doc);
  if (!activeMask || !samples.length) { if (modalStatus) modalStatus.textContent = 'Log at least one rigorous sample before saving.'; return null; }
  const fields = readModal(doc);
  const missing = ['label', 'description', 'intendedUse', 'riskTell'].filter((key) => !fields[key]);
  if (missing.length) { if (modalStatus) modalStatus.textContent = `Missing: ${missing.join(', ')}`; return null; }
  const saved = rebuildCustomMaskProfile({ ...activeMask, id: `custom-${slug(fields.label)}-${Date.now().toString(36)}`, label: fields.label }, { includePrivateText: true });
  Object.assign(saved, fields, { source: 'custom', sampleSeed: samples.join('\n\n'), profile: saved.compositeProfile });
  state.customMasks = [saved, ...(state.customMasks || []).filter((mask) => mask.id !== saved.id)];
  state.activeCustomMask = saved;
  state.selectedHushMask = saved;
  state.selectedHushMaskId = saved.id;
  if (typeof bench.renderHushMaskOptions === 'function') bench.renderHushMaskOptions();
  const select = byId('maskFieldSelect', doc);
  if (select && !select.querySelector(`option[value="${saved.id}"]`)) select.insertAdjacentHTML('afterbegin', `<option value="${saved.id}">${saved.label} — ${saved.family}</option>`);
  if (select) { select.value = saved.id; const option = select.querySelector(`option[value="${saved.id}"]`); if (option) select.prepend(option); }
  if (typeof bench.selectHushMask === 'function') bench.selectHushMask(saved.id);
  byId('hushPhase31SaveModal', doc).hidden = true;
  return saved;
}

function orderCustomizer(doc = document) {
  const warnings = byId('hushSwapWarningsPanel', doc);
  const match = byId('hushProfileMatchPanel', doc);
  if (!warnings || !match || !warnings.parentElement) return null;
  const parent = warnings.parentElement;
  if (warnings.compareDocumentPosition(match) & Node.DOCUMENT_POSITION_PRECEDING) parent.insertBefore(warnings, match);
  let panel = byId('hushPhase31CustomizerPanel', doc);
  if (!panel) {
    const wrap = doc.createElement('div');
    wrap.innerHTML = shellHtml();
    panel = wrap.firstElementChild;
  }
  parent.insertBefore(panel, match);
  if (!byId('hushPhase31SaveModal', doc)) doc.body.insertAdjacentHTML('beforeend', modalHtml());
  return panel;
}

function setCustomizerVisible(doc = document) {
  const panel = byId('hushPhase31CustomizerPanel', doc);
  const active = byId('hushCustomizeTabBtn', doc)?.getAttribute('aria-pressed') === 'true';
  if (panel) panel.hidden = !active;
}

export function initHushPhase311(doc = document) {
  document.title = 'TD613 Hush';
  installLoading(doc);
  const panel = orderCustomizer(doc);
  if (!panel) return { version: VERSION, installed: false };
  setCustomizerVisible(doc);
  byId('hushCustomizeTabBtn', doc)?.addEventListener('click', () => setTimeout(() => setCustomizerVisible(doc), 0));
  byId('hushBuiltInTabBtn', doc)?.addEventListener('click', () => setTimeout(() => setCustomizerVisible(doc), 0));
  byId('hushPhase31LogSampleBtn', doc)?.addEventListener('click', () => logSample(doc));
  byId('hushPhase31Undo', doc)?.addEventListener('click', () => undoSample(doc));
  byId('hushPhase31SaveMaskBtn', doc)?.addEventListener('click', () => { const modal = byId('hushPhase31SaveModal', doc); if (modal) modal.hidden = false; });
  byId('hushPhase31CancelSave', doc)?.addEventListener('click', () => { const modal = byId('hushPhase31SaveModal', doc); if (modal) modal.hidden = true; });
  byId('hushPhase31AddToStudio', doc)?.addEventListener('click', () => addToStudio(doc));
  renderLedger(doc);
  return { version: VERSION, installed: true, minSampleChars: MIN_SAMPLE_CHARS };
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  installLoading(document);
  const boot = () => initHushPhase311(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 80);
  window.setTimeout(boot, 360);
}
