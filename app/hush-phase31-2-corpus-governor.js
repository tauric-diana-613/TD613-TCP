import {
  HUSH_CUSTOM_MASK_CORPUS_POLICY as POLICY,
  createCustomMask,
  addCustomMaskSample,
  rebuildCustomMaskProfile
} from './engine/hush-custom-mask.js';

export const HUSH_PHASE31_2_CORPUS_GOVERNOR_VERSION = 'phase-31.2-corpus-governor';

const CATEGORIES = [
  ['explanatory', 'explanatory'],
  ['argumentative', 'argumentative'],
  ['narrative', 'narrative'],
  ['procedural', 'procedural'],
  ['reflective', 'reflective / affective'],
  ['casual', 'casual / conversational'],
  ['technical', 'technical / operational'],
  ['forensic', 'legal / forensic'],
  ['poetic', 'poetic / symbolic'],
  ['repair', 'repair / correction'],
  ['strategic', 'strategic / planning']
];

const text = (value) => String(value ?? '').trim();
const byId = (id, doc = document) => doc.getElementById(id);
const words = (value = '') => (String(value).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length;
const slug = (value = 'custom-mask') => text(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'custom-mask';
const escapeHtml = (value = '') => String(value).replace(/[&<>"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));

const state = {
  records: [],
  mask: null
};

function optionHtml() {
  return CATEGORIES.map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
}

function corpusShell() {
  return `<div class="hush-phase31-head hush-phase31-corpus-head">
    <div>
      <p class="hush-phase31-title">Corpus Customizer</p>
      <p class="hush-phase31-note">Build the mask as a corpus, not one heroic paragraph. ${POLICY.minWordsPerSample}+ words per sample. ${POLICY.provisionalSamples} samples for provisional, ${POLICY.operationalSamples} for operational, ${POLICY.rigorousSamples} for rigorous.</p>
    </div>
    <span id="hushPhase312ProfileStatus" class="hush-phase31-status" data-status="empty">empty</span>
  </div>
  <div class="hush-phase31-ladder" aria-label="Custom mask corpus ladder">
    <span class="hush-phase31-rung" data-tier="sample"><strong>${POLICY.minWordsPerSample}</strong><em>word sample</em></span>
    <span class="hush-phase31-rung" data-tier="provisional"><strong>${POLICY.provisionalSamples}</strong><em>provisional</em></span>
    <span class="hush-phase31-rung" data-tier="operational"><strong>${POLICY.operationalSamples}</strong><em>operational</em></span>
    <span class="hush-phase31-rung" data-tier="rigorous"><strong>${POLICY.rigorousSamples}</strong><em>rigorous</em></span>
  </div>
  <div id="hushPhase312CorpusStats" class="hush-phase31-corpus-stats" aria-live="polite"></div>
  <div class="hush-phase31-input-grid">
    <label class="hush-phase31-label hush-phase31-category" for="hushPhase312PromptCategory"><span>Prompt category</span><span>Category diversity keeps the mask from becoming a one-mood puppet.</span><select id="hushPhase312PromptCategory">${optionHtml()}</select></label>
    <label class="hush-phase31-label hush-phase31-category" for="hushPhase312ContextLabel"><span>Context label</span><span>Optional tag for pressure, genre, or scene.</span><input id="hushPhase312ContextLabel" autocomplete="off" placeholder="explaining under pressure"></label>
  </div>
  <label class="hush-phase31-label" for="hushPhase312SampleInput"><span>New voice reference sample</span><span>Raw text stays local unless an operator explicitly exports private text.</span></label>
  <textarea id="hushPhase312SampleInput" autocomplete="off" autocapitalize="off" autocorrect="off" spellcheck="false" placeholder="Paste one 75+ word reference sample. Hush will hash it, profile it, and add it to the corpus ledger."></textarea>
  <div class="hush-phase31-actions"><button id="hushPhase312SaveMaskBtn" type="button" class="secondary">Save Mask</button><button id="hushPhase312LogSampleBtn" type="button" class="secondary">Log Sample</button><span class="hush-phase31-mini">accepted <strong id="hushPhase312SampleCount">0</strong></span><button id="hushPhase312Undo" type="button" class="hush-phase31-mini hush-phase31-link" aria-disabled="true">undo</button></div>
  <div id="hushPhase312SampleStatus" class="persona-memory-summary">No samples logged.</div>
  <div id="hushPhase312CorpusLedger" class="hush-phase31-ledger" aria-live="polite"></div>`;
}

function modalShell() {
  return `<div id="hushPhase312SaveModal" class="hush-phase31-modal" hidden role="dialog" aria-modal="true" aria-labelledby="hushPhase312ModalTitle">
    <div class="hush-phase31-modal-card"><h3 id="hushPhase312ModalTitle">Save Custom Mask</h3>
      <div class="hush-phase31-modal-grid">
        <label>Name<input id="hushPhase312MaskName" autocomplete="off" placeholder="Glitching Cassandra"></label>
        <label>Family<input id="hushPhase312MaskFamily" autocomplete="off" placeholder="custom field mask"></label>
        <label class="wide">Persona Story<textarea id="hushPhase312MaskDescription" placeholder="A short scene or context for this voice."></textarea></label>
        <label class="wide">Use When<textarea id="hushPhase312MaskIntendedUse" placeholder="Where this mask should be used."></textarea></label>
        <label class="wide">Risk Tell<textarea id="hushPhase312MaskRiskTell" placeholder="What becomes identifying or unstable."></textarea></label>
        <label>Sentence Shape<input id="hushPhase312MaskSentence" placeholder="short / mid / long / jagged"></label>
        <label>Ornament<input id="hushPhase312MaskOrnament" placeholder="low / medium / high"></label>
        <label>Warmth<input id="hushPhase312MaskWarmth" placeholder="low / medium / high"></label>
        <label>Custody<input id="hushPhase312MaskCustody" placeholder="medium / high / very-high"></label>
        <label class="wide">Pressure Warnings<textarea id="hushPhase312MaskWarnings" placeholder="Comma or line separated warnings."></textarea></label>
      </div>
      <div class="hush-phase31-modal-actions"><button id="hushPhase312CancelSave" type="button" class="ghost">Cancel</button><button id="hushPhase312AddToStudio" type="button" class="primary-cta">Add to Mask Studio</button></div>
      <div id="hushPhase312ModalStatus" class="hush-phase31-modal-status"></div>
    </div>
  </div>`;
}

function ensureMask() {
  state.mask = state.mask || createCustomMask({ label: 'Unsaved Custom Mask', id: 'custom-unsaved-phase31-2' });
  return state.mask;
}

function readiness() {
  return state.mask?.corpusReadiness || {
    status: 'empty',
    acceptedSampleCount: 0,
    acceptedWords: 0,
    promptCategoryCount: 0,
    promptCategories: [],
    readinessScore: 0,
    generationAllowed: false,
    rigorousEligible: false
  };
}

function statusCopy(data = readiness()) {
  if (data.status === 'rigorous') return 'rigorous · holdout ready';
  if (data.status === 'operational') return 'operational · generation allowed';
  if (data.status === 'provisional') return 'provisional · preview only';
  if (data.status === 'corpus-building') return 'corpus building';
  return 'empty';
}

function syncBench(doc = document) {
  const bench = window.__TD613_HUSH_BENCH__ || {};
  const benchState = bench.benchState || {};
  if (!state.mask || !benchState) return;
  benchState.activeCustomMask = state.mask;
  benchState.selectedHushMask = state.mask;
  benchState.selectedHushMaskId = state.mask.id;
  const ref = byId('maskReferenceInput', doc);
  if (ref) ref.value = state.records.map((record) => record.text).join('\n\n');
  if (typeof bench.renderHushMaskProfile === 'function') bench.renderHushMaskProfile();
  if (typeof bench.renderHushProfileMatch === 'function') bench.renderHushProfileMatch(null);
}

function renderRungs(doc = document, data = readiness()) {
  for (const rung of doc.querySelectorAll('#hushPhase31CustomizerPanel .hush-phase31-rung')) {
    const tier = rung.dataset.tier;
    const accepted = data.acceptedSampleCount || 0;
    const acceptedWords = data.acceptedWords || 0;
    let active = false;
    if (tier === 'sample') active = accepted > 0;
    if (tier === 'provisional') active = accepted >= POLICY.provisionalSamples && acceptedWords >= POLICY.provisionalWords;
    if (tier === 'operational') active = accepted >= POLICY.operationalSamples && acceptedWords >= POLICY.operationalWords;
    if (tier === 'rigorous') active = accepted >= POLICY.rigorousSamples && acceptedWords >= POLICY.rigorousWords && (data.promptCategoryCount || 0) >= POLICY.rigorousPromptCategories;
    rung.dataset.active = active ? 'true' : 'false';
  }
}

function render(doc = document) {
  const data = readiness();
  const input = byId('hushPhase312SampleInput', doc);
  const liveWords = words(input?.value || '');
  const status = byId('hushPhase312SampleStatus', doc);
  const profile = byId('hushPhase312ProfileStatus', doc);
  const count = byId('hushPhase312SampleCount', doc);
  const undo = byId('hushPhase312Undo', doc);
  const stats = byId('hushPhase312CorpusStats', doc);
  const ledger = byId('hushPhase312CorpusLedger', doc);

  if (profile) {
    profile.textContent = `${data.status} · ${data.acceptedWords || 0}w`;
    profile.dataset.status = data.status || 'empty';
  }
  if (count) count.textContent = String(data.acceptedSampleCount || 0);
  if (undo) undo.setAttribute('aria-disabled', state.records.length ? 'false' : 'true');
  if (stats) stats.innerHTML = `<div class="hush-phase31-stat"><span>accepted</span><strong>${data.acceptedSampleCount || 0}/${POLICY.rigorousSamples}</strong></div><div class="hush-phase31-stat"><span>words</span><strong>${data.acceptedWords || 0}/${POLICY.rigorousWords}</strong></div><div class="hush-phase31-stat"><span>categories</span><strong>${data.promptCategoryCount || 0}/${POLICY.rigorousPromptCategories}</strong></div><div class="hush-phase31-stat"><span>current</span><strong>${Math.max(0, POLICY.minWordsPerSample - liveWords) || 'ready'}${liveWords >= POLICY.minWordsPerSample ? '' : 'w short'}</strong></div>`;
  if (status) status.innerHTML = state.records.length ? `Corpus ${statusCopy(data)} · samples ${state.records.length} · accepted words ${data.acceptedWords || 0}` : 'No samples logged.';
  if (ledger) ledger.innerHTML = state.records.length ? state.records.map((record, index) => `<article class="hush-phase31-ledger-row"><strong>#${index + 1}</strong><span>${escapeHtml(record.promptCategory)}</span><em>${words(record.text)} words</em><p>${escapeHtml(record.text.slice(0, 180))}${record.text.length > 180 ? '…' : ''}</p></article>`).join('') : '<p class="hush-phase31-ledger-empty">The corpus is empty. Feed it 75+ word samples until the mask earns its name.</p>';
  renderRungs(doc, data);
}

function logSample(doc = document) {
  const input = byId('hushPhase312SampleInput', doc);
  const status = byId('hushPhase312SampleStatus', doc);
  const sample = text(input?.value || '');
  const count = words(sample);
  if (count < POLICY.minWordsPerSample) {
    if (status) status.textContent = `Sample too short: ${count}/${POLICY.minWordsPerSample} words. Hush needs architecture, not a postcard.`;
    render(doc);
    return null;
  }
  const promptCategory = text(byId('hushPhase312PromptCategory', doc)?.value) || 'uncategorized';
  const contextLabel = text(byId('hushPhase312ContextLabel', doc)?.value) || promptCategory;
  state.records.push({ text: sample, promptCategory, contextLabel });
  state.mask = addCustomMaskSample(ensureMask(), sample, { includePrivateText: true, promptCategory, contextLabel });
  if (input) input.value = '';
  syncBench(doc);
  render(doc);
  return state.mask;
}

function undoSample(doc = document) {
  state.records.pop();
  state.mask = createCustomMask({ label: 'Unsaved Custom Mask', id: 'custom-unsaved-phase31-2' });
  for (const record of state.records) state.mask = addCustomMaskSample(state.mask, record.text, { includePrivateText: true, promptCategory: record.promptCategory, contextLabel: record.contextLabel });
  if (!state.records.length) state.mask = null;
  syncBench(doc);
  render(doc);
}

function readModal(doc = document) {
  const warnings = text(byId('hushPhase312MaskWarnings', doc)?.value).split(/[\n,]+/).map((item) => item.trim()).filter(Boolean);
  return {
    label: text(byId('hushPhase312MaskName', doc)?.value),
    family: text(byId('hushPhase312MaskFamily', doc)?.value) || 'custom field mask',
    description: text(byId('hushPhase312MaskDescription', doc)?.value),
    intendedUse: text(byId('hushPhase312MaskIntendedUse', doc)?.value),
    riskTell: text(byId('hushPhase312MaskRiskTell', doc)?.value),
    transformHints: {
      sentence: text(byId('hushPhase312MaskSentence', doc)?.value),
      ornament: text(byId('hushPhase312MaskOrnament', doc)?.value),
      warmth: text(byId('hushPhase312MaskWarmth', doc)?.value),
      custody: text(byId('hushPhase312MaskCustody', doc)?.value)
    },
    pressureWarnings: warnings
  };
}

function addToStudio(doc = document) {
  const bench = window.__TD613_HUSH_BENCH__ || {};
  const benchState = bench.benchState || {};
  const modalStatus = byId('hushPhase312ModalStatus', doc);
  if (!state.mask || !state.records.length) { if (modalStatus) modalStatus.textContent = 'Log a corpus before saving. Minimum accepted sample: 75 words.'; return null; }
  const fields = readModal(doc);
  const missing = ['label', 'description', 'intendedUse', 'riskTell'].filter((key) => !fields[key]);
  if (missing.length) { if (modalStatus) modalStatus.textContent = `Missing: ${missing.join(', ')}`; return null; }
  const saved = rebuildCustomMaskProfile({ ...state.mask, id: `custom-${slug(fields.label)}-${Date.now().toString(36)}`, label: fields.label }, { includePrivateText: true });
  Object.assign(saved, fields, { source: 'custom', sampleSeed: state.records.map((record) => record.text).join('\n\n'), profile: saved.compositeProfile });
  benchState.customMasks = [saved, ...(benchState.customMasks || []).filter((mask) => mask.id !== saved.id)];
  benchState.activeCustomMask = saved;
  benchState.selectedHushMask = saved;
  benchState.selectedHushMaskId = saved.id;
  if (typeof bench.renderHushMaskOptions === 'function') bench.renderHushMaskOptions();
  const select = byId('maskFieldSelect', doc);
  if (select && !select.querySelector(`option[value="${saved.id}"]`)) {
    const option = doc.createElement('option');
    option.value = saved.id;
    option.textContent = `${saved.label} — ${saved.family} · ${saved.profileStatus}`;
    select.prepend(option);
  }
  if (select) select.value = saved.id;
  if (typeof bench.selectHushMask === 'function') bench.selectHushMask(saved.id);
  const modal = byId('hushPhase312SaveModal', doc);
  if (modal) modal.hidden = true;
  return saved;
}

function bind(doc = document) {
  byId('hushPhase312SampleInput', doc)?.addEventListener('input', () => render(doc));
  byId('hushPhase312PromptCategory', doc)?.addEventListener('change', () => render(doc));
  byId('hushPhase312ContextLabel', doc)?.addEventListener('input', () => render(doc));
  byId('hushPhase312LogSampleBtn', doc)?.addEventListener('click', () => logSample(doc));
  byId('hushPhase312Undo', doc)?.addEventListener('click', () => undoSample(doc));
  byId('hushPhase312SaveMaskBtn', doc)?.addEventListener('click', () => { const modal = byId('hushPhase312SaveModal', doc); if (modal) modal.hidden = false; });
  byId('hushPhase312CancelSave', doc)?.addEventListener('click', () => { const modal = byId('hushPhase312SaveModal', doc); if (modal) modal.hidden = true; });
  byId('hushPhase312AddToStudio', doc)?.addEventListener('click', () => addToStudio(doc));
}

function install(doc = document) {
  const panel = byId('hushPhase31CustomizerPanel', doc);
  if (!panel || panel.dataset.corpusGovernor === 'phase31.2') return false;
  panel.dataset.corpusGovernor = 'phase31.2';
  panel.innerHTML = corpusShell();
  if (!byId('hushPhase312SaveModal', doc)) doc.body.insertAdjacentHTML('beforeend', modalShell());
  bind(doc);
  render(doc);
  return true;
}

export function initHushCorpusGovernor(doc = document) {
  const run = () => install(doc);
  run();
  window.setTimeout(run, 90);
  window.setTimeout(run, 420);
  return { version: HUSH_PHASE31_2_CORPUS_GOVERNOR_VERSION, installed: Boolean(byId('hushPhase31CustomizerPanel', doc)?.dataset.corpusGovernor) };
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const boot = () => initHushCorpusGovernor(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
}
