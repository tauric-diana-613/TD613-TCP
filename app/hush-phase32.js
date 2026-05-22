import * as bench from './adversarial-bench.mjs';
import { buildHushSwap, HUSH_SWAP_PHASE33_VERSION } from './engine/hush-swap-phase33.js';

export const HUSH_PHASE32_UI_VERSION = 'phase-32-mask-surface-ui+phase-33-expressive-payload-ui';

const $ = (id, doc = document) => doc.getElementById(id);
const text = (value) => String(value ?? '').trim();
const esc = (value = '') => String(value ?? '').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
let suppressAuto = false;

function selectedMask(state = bench.benchState || {}) {
  const masks = [...(state.hushMasks || []), ...(state.customMasks || [])];
  return masks.find((mask) => mask.id === state.selectedHushMaskId) || state.selectedHushMask || masks[0] || null;
}

function activeField(state = bench.benchState || {}) {
  const mask = selectedMask(state) || {};
  return state.profiles?.maskReference || mask.profile || {};
}

function renderDiagnostics(result = {}, doc = document) {
  const target = $('hushPhase32Diagnostics', doc);
  if (!target) return;
  const d = result.phase32Diagnostics || {};
  const e = result.phase33Diagnostics || {};
  const diff = d.differentiation || {};
  const report = Array.isArray(e.selectorRows) ? e.selectorRows.slice(0, 4) : (Array.isArray(d.candidateReport) ? d.candidateReport.slice(0, 4) : []);
  const expressive = e.expressive || {};
  target.innerHTML = `<strong>Phase 33 expressive selector</strong><div class="hush-phase32-diagnostic-grid"><span>Selected: <code>${esc(e.selectedCandidateId || d.selectedCandidateId || 'none')}</code></span><span>Fallback: <code>${esc(String(Boolean(e.selectedWasFallback ?? d.selectedWasFallback)))}</code></span><span>Boilerplate: <code>${esc(d.selectedBoilerplateScore ?? 'n/a')}</code></span><span>Surface score: <code>${esc(d.selectedMaskSurfaceScore ?? 'n/a')}</code></span><span>Expressive: <code>${esc(String(Boolean(e.expressiveActive ?? expressive.active)))}</code></span><span>Retention: <code>${esc(e.selectedRetentionScore ?? e.selected?.retention?.retentionScore ?? 'n/a')}</code></span><span>Wrapper fatigue: <code>${esc(e.selectedWrapperFatigue ?? e.selected?.wrapperFatigue ?? 'n/a')}</code></span><span>Warning: <code>${esc(e.warning || d.warning || 'none')}</code></span><span>Unique surfaces: <code>${esc(diff.uniqueSurfaceCount ?? 'n/a')}</code></span></div>${report.length ? `<details><summary>candidate report</summary>${report.map((row) => `<div><code>${esc(row.id)}</code> ${esc(row.source || '')} / ${esc(row.strategy || '')} · p33 ${esc(row.expressiveScore ?? row.phase32Score ?? 'n/a')} · retain ${esc(row.retention ?? 'n/a')}</div>`).join('')}</details>` : ''}`;
}

function readStateInputs(doc = document) {
  const state = bench.benchState || {};
  state.protectedBaselineText = $('protectedBaselineInput', doc)?.value || '';
  state.maskReferenceText = $('maskReferenceInput', doc)?.value || '';
  state.messageDraftText = $('messageDraftInput', doc)?.value || '';
  state.protectedOutputText = $('protectedOutputInput', doc)?.value || '';
  state.selectedHushMaskId = $('maskFieldSelect', doc)?.value || state.selectedHushMaskId;
  return state;
}

function runPhase32Transform(doc = document) {
  const state = readStateInputs(doc);
  const source = text(state.messageDraftText);
  if (!source) return null;
  const mask = selectedMask(state);
  const expressiveMode = $('recognitionIntentMode', doc)?.value === 'expressive-theory' || /rose bush|dromological|rot latency|scholastic|potentiality/i.test(source);
  const result = buildHushSwap({
    sourceText: state.messageDraftText,
    protectedBaselineText: state.protectedBaselineText,
    mask,
    maskProfile: activeField(state) || mask?.profile || {},
    maskReferenceText: state.maskReferenceText || mask?.sampleSeed || '',
    protectedLiterals: [],
    operatorMode: expressiveMode ? 'expressive-theory' : (state.recognitionIntentMode || 'neutralize'),
    contextType: state.recognitionContextType || 'group-chat',
    exposureDuration: state.recognitionExposureDuration || 'single-use',
    personaSummary: {},
    iterationLedger: state.iterationLedger || {},
    options: { candidateCount: 28, includePrivateText: false, expressiveMode }
  });
  state.hushSwapResult = result;
  state.hushProfileMatch = result.match;
  state.selectedHushMask = mask;
  state.protectedOutputText = result.selectedOutput || '';
  const output = $('protectedOutputInput', doc);
  if (output) output.value = state.protectedOutputText;
  renderDiagnostics(result, doc);
  if (typeof bench.analyzeProtectedOutput === 'function' && state.protectedOutputText.trim()) bench.analyzeProtectedOutput();
  return result;
}

function clearInput(doc = document) {
  const input = $('messageDraftInput', doc);
  if (input) input.value = '';
  const state = bench.benchState || {};
  state.messageDraftText = '';
}

function installClearInput(doc = document) {
  const input = $('messageDraftInput', doc);
  if (!input || $('hushPhase32ClearInput', doc)) return;
  input.insertAdjacentHTML('afterend', '<button id="hushPhase32ClearInput" type="button" class="hush-phase32-clear-input">clear input</button>');
  $('hushPhase32ClearInput', doc)?.addEventListener('click', () => clearInput(doc));
}

function installDiagnostics(doc = document) {
  const warnings = $('hushSwapWarningsPanel', doc);
  if (!warnings || $('hushPhase32Diagnostics', doc)) return;
  warnings.insertAdjacentHTML('afterend', '<div id="hushPhase32Diagnostics" class="hush-phase32-diagnostic-panel"><strong>Phase 33 expressive selector</strong><br>Awaiting transform.</div>');
}

function compactControls(doc = document) {
  const row = $('generateMaskedOutputBtn', doc)?.closest('.hush-action-row');
  if (row) row.classList.add('hush-phase32-compact-actions');
}

function fixLoaderDots(doc = document) {
  const dots = $('td613HushLoadingDots', doc);
  if (dots) dots.textContent = '...';
}

function installExpressiveMode(doc = document) {
  const select = $('recognitionIntentMode', doc);
  if (!select || select.querySelector('option[value="expressive-theory"]')) return;
  const option = doc.createElement('option');
  option.value = 'expressive-theory';
  option.textContent = 'Expressive / Theory';
  select.appendChild(option);
}

function installAutoMaskTransform(doc = document) {
  const select = $('maskFieldSelect', doc);
  if (!select || select.dataset.phase32Auto === 'true') return;
  select.dataset.phase32Auto = 'true';
  select.addEventListener('change', () => {
    if (suppressAuto) return;
    window.setTimeout(() => { if (text($('messageDraftInput', doc)?.value)) runPhase32Transform(doc); }, 0);
  });
}

function interceptTransforms(doc = document) {
  const transform = $('generateMaskedOutputBtn', doc);
  if (transform && transform.dataset.phase32Intercept !== 'true') {
    transform.dataset.phase32Intercept = 'true';
    transform.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopImmediatePropagation();
      runPhase32Transform(doc);
    }, true);
  }
}

export function initHushPhase32(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench') return { installed: false, version: HUSH_PHASE32_UI_VERSION };
  doc.body.dataset.hushPhase32 = 'true';
  doc.body.dataset.hushPhase33 = 'true';
  compactControls(doc);
  installClearInput(doc);
  installDiagnostics(doc);
  installExpressiveMode(doc);
  installAutoMaskTransform(doc);
  interceptTransforms(doc);
  fixLoaderDots(doc);
  if (typeof window !== 'undefined') window.__TD613_HUSH_PHASE32__ = { version: HUSH_PHASE32_UI_VERSION, selectorVersion: HUSH_SWAP_PHASE33_VERSION, runPhase32Transform };
  return { installed: true, version: HUSH_PHASE32_UI_VERSION };
}

if (typeof document !== 'undefined') {
  const boot = () => initHushPhase32(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 120);
  window.setTimeout(boot, 480);
}
