import './hush-simple-path.js';
import hushMasks from './data/hush-masks.js';
import phase22HushMasks from './data/hush-phase22-masks.js';
import phase24HushMasks from './data/hush-phase24-masks.js';
import phase27HushMasks from './data/hush-phase27-masks.js';
import phase28HushMasks from './data/hush-phase28-masks.js';
import { enrichHushMask } from './data/hush-mask-traits.js';
import { isActiveStyleMask, applyStyleDiversity } from './engine/hush-style-diversity.js';
import { CONTEXT_TYPES } from './engine/context-profile.js';
import { createIterationLedger, exportIterationLedgerJson } from './engine/iteration-ledger.js';
import { initHushInvisibleShell } from './hush-invisible-shell.js';
import { initHushAlienConsole } from './hush-alien-console.js';

const DEFAULT_MODE = 'neutralize';
const RAW_MASKS = [...hushMasks, ...phase22HushMasks, ...phase24HushMasks, ...phase27HushMasks, ...phase28HushMasks];
const asArray = (value) => Array.isArray(value) ? value : [];
const text = (value) => String(value ?? '').trim();
const byId = (id, doc = document) => doc?.getElementById?.(id) || null;
const esc = (value = '') => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

function initialProfiles() {
  return { protectedBaseline: null, maskReference: null, messageDraft: null, protectedOutput: null };
}

function lightProfile(textValue = '') {
  const words = (text(textValue).match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length;
  return words ? { wordCount: words, empty: false, light: true } : { wordCount: 0, empty: true, light: true };
}

function dedupeMasks(masks = RAW_MASKS) {
  const seen = new Set();
  const out = [];
  for (const mask of masks) {
    const id = text(mask?.id);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    if (!isActiveStyleMask(mask)) continue;
    const enriched = applyStyleDiversity(enrichHushMask(mask));
    const sampleSeed = text(enriched.sampleSeed || enriched.canonicalMaskSeed || enriched.description || '');
    out.push({
      source: 'built-in',
      ...enriched,
      sampleSeed,
      profileStatus: enriched.profileStatus || (sampleSeed ? 'deferred' : 'empty'),
      profileSummary: enriched.profileSummary || { wordCount: sampleSeed ? (sampleSeed.match(/[A-Za-z0-9][A-Za-z0-9'-]*/g) || []).length : 0 },
      profile: enriched.profile || null
    });
  }
  return out;
}

export const benchState = {
  protectedBaselineText: '',
  maskReferenceText: '',
  messageDraftText: '',
  protectedOutputText: '',
  selectedPersonaId: '',
  selectedHushMaskId: '',
  hushMasks: dedupeMasks(),
  selectedHushMask: null,
  customMasks: [],
  activeCustomMask: null,
  hushProfileMatch: null,
  hushSwapResult: null,
  hushMode: 'built-in',
  recognitionContextType: 'group-chat',
  recognitionIntentMode: 'neutralize',
  recognitionExposureDuration: 'single-use',
  contextProfile: null,
  recognitionField: null,
  personaMemory: { personaId: 'hush-mask-field', label: 'Hush Mask Field', memory: { entries: [], acceptedCount: 0 } },
  profiles: initialProfiles(),
  ingestionAudit: null,
  escapeVector: null,
  controllerDecision: null,
  claimCeiling: null,
  reportPayload: null,
  iterationPreview: [],
  iterationTextCache: {},
  iterationLedger: createIterationLedger({ context: { benchVersion: 'phase-11-light', product: 'TD613 Hush', mode: DEFAULT_MODE } })
};

let initializedFor = null;
let heavyBenchPromise = null;
let phase39Promise = null;

function selectedMask() {
  const masks = [...benchState.hushMasks, ...benchState.customMasks];
  return masks.find((mask) => mask.id === benchState.selectedHushMaskId) || masks[0] || null;
}

function readInputs(doc = document) {
  benchState.protectedBaselineText = byId('protectedBaselineInput', doc)?.value || '';
  benchState.maskReferenceText = byId('maskReferenceInput', doc)?.value || '';
  benchState.messageDraftText = byId('messageDraftInput', doc)?.value || '';
  benchState.protectedOutputText = byId('protectedOutputInput', doc)?.value || '';
  benchState.selectedHushMaskId = byId('maskFieldSelect', doc)?.value || benchState.selectedHushMaskId;
  benchState.selectedPersonaId = benchState.selectedHushMaskId;
  benchState.recognitionContextType = byId('recognitionContextType', doc)?.value || benchState.recognitionContextType;
  benchState.recognitionIntentMode = byId('recognitionIntentMode', doc)?.value || benchState.recognitionIntentMode;
  benchState.recognitionExposureDuration = byId('recognitionExposureDuration', doc)?.value || benchState.recognitionExposureDuration;
}

function extractLightProfiles() {
  benchState.profiles.protectedBaseline = lightProfile(benchState.protectedBaselineText);
  benchState.profiles.maskReference = lightProfile(benchState.maskReferenceText);
  benchState.profiles.messageDraft = lightProfile(benchState.messageDraftText);
  benchState.profiles.protectedOutput = lightProfile(benchState.protectedOutputText);
}

function setText(doc, id, value) {
  const el = byId(id, doc);
  if (el) el.textContent = String(value ?? '');
}

function metricRow(label, value) {
  return `<div class="hush-metric-row"><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;
}

function renderLightProfiles(doc = document) {
  setText(doc, 'protectedBaselineProfile', benchState.protectedBaselineText ? `Words ${benchState.profiles.protectedBaseline?.wordCount || 0}` : 'Most users can leave this blank. Hush will use the message as reference when needed.');
  setText(doc, 'maskFieldProfile', benchState.maskReferenceText ? `Words ${benchState.profiles.maskReference?.wordCount || 0}` : 'Mask profile loads when analysis runs.');
  setText(doc, 'messageDraftProfile', benchState.messageDraftText ? `Words ${benchState.profiles.messageDraft?.wordCount || 0}` : 'No profile yet.');
}

export function renderHushMaskOptions(doc = document) {
  const select = byId('maskFieldSelect', doc);
  if (!select) return;
  const masks = [...benchState.hushMasks, ...benchState.customMasks];
  const current = select.value || benchState.selectedHushMaskId || masks[0]?.id || '';
  select.innerHTML = masks.map((mask) => `<option value="${esc(mask.id)}">${esc(mask.label || mask.id)} - ${esc(mask.family || mask.profileStatus || 'Hush mask')}</option>`).join('');
  benchState.selectedHushMaskId = masks.some((mask) => mask.id === current) ? current : masks[0]?.id || '';
  select.value = benchState.selectedHushMaskId;
}

export function selectHushMask(maskId = '', doc = document) {
  const masks = [...benchState.hushMasks, ...benchState.customMasks];
  const mask = masks.find((item) => item.id === maskId) || masks[0] || null;
  benchState.selectedHushMaskId = mask?.id || '';
  benchState.selectedPersonaId = benchState.selectedHushMaskId;
  benchState.selectedHushMask = mask;
  const select = byId('maskFieldSelect', doc);
  if (select && mask) select.value = mask.id;
  const reference = byId('maskReferenceInput', doc);
  if (reference && mask) {
    reference.value = mask.sampleSeed || mask.description || '';
    benchState.maskReferenceText = reference.value;
    reference.dispatchEvent(new Event('input', { bubbles: true }));
  }
  renderHushMaskProfile(doc);
  return mask;
}

export function renderHushMaskProfile(doc = document) {
  const mask = selectedMask();
  const panel = byId('hushMaskProfilePanel', doc);
  const note = byId('hushMaskDescription', doc);
  if (note && mask) note.innerHTML = `<strong>${esc(mask.label || '')}</strong><br>${esc(mask.description || '')}<br><span>Use: ${esc(mask.intendedUse || '')}</span><br><span>Risk tell: ${esc(mask.riskTell || '')}</span>`;
  if (!panel || !mask) return;
  panel.innerHTML = [
    metricRow('Profile status', mask.profileStatus || 'deferred'),
    metricRow('Words', mask.profileSummary?.wordCount ?? 'deferred'),
    metricRow('Avg sentence', 'loads on analysis'),
    metricRow('Punctuation', 'loads on analysis'),
    metricRow('Contractions', 'loads on analysis'),
    metricRow('Recurrence', 'loads on analysis'),
    metricRow('Warnings', asArray(mask.warnings).join(', ') || 'none')
  ].join('');
}

export function renderHushProfileMatch(match = benchState.hushProfileMatch, doc = document) {
  const panel = byId('hushProfileMatchPanel', doc);
  if (!panel) return;
  if (!match) panel.innerHTML = '<p class="section-note">Swap or analyze to calculate mask match.</p>';
}

function renderEmptyLab(doc = document) {
  const emptyGrid = '<article class="metric"><div class="key">Waiting</div><div class="val">quiet</div></article>';
  const escapeGrid = byId('escapeVectorGrid', doc);
  const recognitionGrid = byId('recognitionFieldGrid', doc);
  if (escapeGrid && !escapeGrid.innerHTML.trim()) escapeGrid.innerHTML = emptyGrid;
  if (recognitionGrid && !recognitionGrid.innerHTML.trim()) recognitionGrid.innerHTML = emptyGrid;
  const claim = byId('claimCeilingPanel', doc);
  if (claim && !claim.innerHTML.trim()) claim.innerHTML = '<p class="section-note">Run analysis to calculate claim ceiling.</p>';
  const iteration = byId('iterationPreviewBody', doc);
  if (iteration && !iteration.innerHTML.trim()) iteration.innerHTML = '<p class="section-note">No iteration rows yet.</p>';
}

function populateRecognitionContexts(doc = document) {
  const select = byId('recognitionContextType', doc);
  if (select && !select.options.length) {
    select.innerHTML = CONTEXT_TYPES.map((context) => `<option value="${esc(context.id)}">${esc(context.label)}</option>`).join('');
  }
  if (select) select.value = benchState.recognitionContextType;
  const mode = byId('recognitionIntentMode', doc);
  if (mode) mode.value = benchState.recognitionIntentMode;
  const duration = byId('recognitionExposureDuration', doc);
  if (duration) duration.value = benchState.recognitionExposureDuration;
}

export function switchHushMaskTab(tab = 'built-in', doc = document) {
  benchState.hushMode = tab === 'customize' ? 'customize' : 'built-in';
  const builtIn = byId('hushBuiltInMaskPanel', doc);
  const custom = byId('hushCustomizePanel', doc);
  const builtBtn = byId('hushBuiltInTabBtn', doc);
  const customBtn = byId('hushCustomizeTabBtn', doc);
  if (builtIn) builtIn.hidden = benchState.hushMode !== 'built-in';
  if (custom) custom.hidden = benchState.hushMode !== 'customize';
  builtBtn?.setAttribute('aria-pressed', benchState.hushMode === 'built-in' ? 'true' : 'false');
  customBtn?.setAttribute('aria-pressed', benchState.hushMode === 'customize' ? 'true' : 'false');
}

function syncHeavySelection(heavy, doc = document) {
  const selectValue = byId('maskFieldSelect', doc)?.value || benchState.selectedHushMaskId || '';
  if (selectValue) {
    heavy.benchState.selectedHushMaskId = selectValue;
    heavy.benchState.selectedPersonaId = selectValue;
  }
}

export async function loadHeavyBench(doc = document) {
  if (!heavyBenchPromise) {
    heavyBenchPromise = import('./adversarial-bench.mjs').then((heavy) => {
      syncHeavySelection(heavy, doc);
      heavy.initAdversarialBench?.(doc);
      syncHeavySelection(heavy, doc);
      const selected = byId('maskFieldSelect', doc)?.value || '';
      if (selected) heavy.selectHushMask?.(selected);
      window.__TD613_HUSH_BENCH__ = heavy;
      initHushInvisibleShell(doc, heavy);
      initHushAlienConsole(doc, heavy);
      return heavy;
    });
  }
  return heavyBenchPromise;
}

async function withHeavy(fn, doc = document) {
  readInputs(doc);
  const heavy = await loadHeavyBench(doc);
  return fn(heavy);
}

export function initHushMaskStudio(doc = document) {
  renderHushMaskOptions(doc);
  selectHushMask(byId('maskFieldSelect', doc)?.value || benchState.selectedHushMaskId, doc);
  byId('hushBuiltInTabBtn', doc)?.addEventListener('click', () => switchHushMaskTab('built-in', doc));
  byId('hushCustomizeTabBtn', doc)?.addEventListener('click', () => switchHushMaskTab('customize', doc));
}

export function initAdversarialBench(doc = document) {
  if (!doc || initializedFor === doc) return benchState;
  initializedFor = doc;
  populateRecognitionContexts(doc);
  initHushMaskStudio(doc);
  readInputs(doc);
  extractLightProfiles();
  renderLightProfiles(doc);
  renderEmptyLab(doc);
  renderHushProfileMatch(null, doc);
  byId('analyzeOutputBtn', doc)?.addEventListener('click', () => analyzeProtectedOutput(doc));
  byId('acceptOutputBtn', doc)?.addEventListener('click', () => acceptOutputIntoPersonaMemory(doc));
  byId('resetBenchBtn', doc)?.addEventListener('click', () => resetBench(doc));
  byId('exportLedgerJsonBtn', doc)?.addEventListener('click', () => exportLedgerJson(doc));
  byId('exportReportJsonBtn', doc)?.addEventListener('click', () => exportCurrentReportJson(doc));
  byId('exportReportMarkdownBtn', doc)?.addEventListener('click', () => exportCurrentReportMarkdown(doc));
  byId('exportHushMaskProfileBtn', doc)?.addEventListener('click', () => exportCurrentHushMaskProfile(doc));
  byId('exportHushSwapJsonBtn', doc)?.addEventListener('click', () => exportCurrentHushSwapJson(doc));
  byId('maskFieldSelect', doc)?.addEventListener('change', () => selectHushMask(byId('maskFieldSelect', doc)?.value || '', doc));
  for (const id of ['recognitionContextType', 'recognitionIntentMode', 'recognitionExposureDuration']) byId(id, doc)?.addEventListener('change', () => readInputs(doc));
  for (const id of ['protectedBaselineInput', 'maskReferenceInput', 'messageDraftInput', 'protectedOutputInput']) byId(id, doc)?.addEventListener('input', () => { readInputs(doc); extractLightProfiles(); renderLightProfiles(doc); });
  initHushInvisibleShell(doc, lightApi);
  initHushAlienConsole(doc, lightApi);
  schedulePhase39(doc);
  try { window.dispatchEvent(new CustomEvent('td613:hush:core-ready', { detail: { version: 'light' } })); } catch (error) {}
  return benchState;
}

export function resetBench(doc = document) {
  for (const id of ['protectedBaselineInput', 'maskReferenceInput', 'messageDraftInput', 'protectedOutputInput']) {
    const el = byId(id, doc);
    if (el) el.value = '';
  }
  benchState.protectedBaselineText = '';
  benchState.maskReferenceText = '';
  benchState.messageDraftText = '';
  benchState.protectedOutputText = '';
  benchState.profiles = initialProfiles();
  benchState.hushSwapResult = null;
  benchState.hushProfileMatch = null;
  benchState.escapeVector = null;
  benchState.controllerDecision = null;
  benchState.claimCeiling = null;
  benchState.recognitionField = null;
  benchState.iterationLedger = createIterationLedger({ context: { benchVersion: 'phase-11-light', product: 'TD613 Hush', mode: DEFAULT_MODE, selectedMaskId: benchState.selectedHushMaskId } });
  renderLightProfiles(doc);
  renderEmptyLab(doc);
}

export function addHushCustomMaskSample() { return null; }
export function saveHushCustomMask() { return null; }
export function renderEscapeVector() {}
export function renderRecognitionField() {}
export function renderControllerDecision() {}
export function renderClaimCeiling() {}

export function runHushSwap(doc = document) {
  return withHeavy((heavy) => heavy.runHushSwap(), doc);
}

export function generateMaskedOutput(doc = document) {
  return withHeavy((heavy) => heavy.generateMaskedOutput(), doc);
}

export function analyzeProtectedOutput(doc = document) {
  return withHeavy((heavy) => heavy.analyzeProtectedOutput(), doc);
}

export function acceptOutputIntoPersonaMemory(doc = document) {
  return withHeavy((heavy) => heavy.acceptOutputIntoPersonaMemory(), doc);
}

export function buildCurrentReportPayload(doc = document) {
  return withHeavy((heavy) => heavy.buildCurrentReportPayload(), doc);
}

export function exportCurrentReportJson(doc = document) {
  return withHeavy((heavy) => heavy.exportCurrentReportJson(), doc);
}

export function exportCurrentReportMarkdown(doc = document) {
  return withHeavy((heavy) => heavy.exportCurrentReportMarkdown(), doc);
}

export function exportCurrentHushMaskProfile(doc = document) {
  return withHeavy((heavy) => heavy.exportCurrentHushMaskProfile(), doc);
}

export function exportCurrentHushSwapJson(doc = document) {
  return withHeavy((heavy) => heavy.exportCurrentHushSwapJson(), doc);
}

export function exportLedgerJson(doc = document) {
  if (!heavyBenchPromise) {
    const includeTexts = Boolean(byId('includeLedgerTextsToggle', doc)?.checked);
    const json = exportIterationLedgerJson(benchState.iterationLedger, { includeTexts, pretty: true });
    const out = byId('ledgerExportOutput', doc);
    if (out) out.value = json;
    return json;
  }
  return withHeavy((heavy) => heavy.exportLedgerJson(), doc);
}

export function releasedHushOutput() {
  const output = text(benchState.protectedOutputText || byId('protectedOutputInput')?.value || '');
  const result = benchState.hushSwapResult || window.__TD613_HUSH_PATCH38_LAST_RESULT || null;
  const release = result?.releasePolicy || {};
  return Boolean(output && !release.hardBlocked && release.mayPopulateOutput !== false);
}

export function syncMaskMemoryGate() {
  const button = byId('acceptOutputBtn');
  const warning = byId('acceptWarning');
  if (!button || !releasedHushOutput()) return false;
  if (benchState.controllerDecision && !['seal', 'continue'].includes(benchState.controllerDecision.state)) {
    benchState.controllerDecision = { ...benchState.controllerDecision, state: 'continue', action: benchState.controllerDecision.action || 'hush-release-accepted' };
  }
  button.disabled = false;
  if (warning && warning.textContent.includes('controller is asking for restore or hold')) {
    warning.hidden = true;
    warning.textContent = '';
  }
  return true;
}

function schedulePhase39(doc = document) {
  const load = () => {
    if (!phase39Promise) phase39Promise = import('./hush-phase39-ui.js?v=202605301720');
    return phase39Promise;
  };
  const idle = doc.defaultView?.requestIdleCallback || ((cb) => doc.defaultView?.setTimeout?.(cb, 2200));
  idle(() => load(), { timeout: 4200 });
  byId('protectedOutputInput', doc)?.addEventListener('input', () => { if (text(byId('protectedOutputInput', doc)?.value)) load(); }, { once: true });
  for (const id of ['generateMaskedOutputBtn', 'analyzeOutputBtn', 'acceptOutputBtn']) byId(id, doc)?.addEventListener('click', () => load(), { once: true });
}

export const lightApi = {
  benchState,
  initAdversarialBench,
  initHushMaskStudio,
  selectHushMask,
  switchHushMaskTab,
  renderHushMaskOptions,
  renderHushMaskProfile,
  renderHushProfileMatch,
  renderEscapeVector,
  renderRecognitionField,
  renderControllerDecision,
  renderClaimCeiling,
  runHushSwap,
  generateMaskedOutput,
  analyzeProtectedOutput,
  acceptOutputIntoPersonaMemory,
  buildCurrentReportPayload,
  exportCurrentReportJson,
  exportCurrentReportMarkdown,
  exportLedgerJson,
  exportCurrentHushMaskProfile,
  exportCurrentHushSwapJson,
  addHushCustomMaskSample,
  saveHushCustomMask,
  resetBench,
  releasedHushOutput,
  syncMaskMemoryGate,
  loadHeavyBench
};

if (typeof window !== 'undefined') window.__TD613_HUSH_BENCH__ = lightApi;
export const ready = typeof document !== 'undefined' && document.body?.dataset?.pageKind === 'adversarial-bench' ? initAdversarialBench(document) : benchState;
