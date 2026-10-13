import './hush-simple-path.js';
import * as bench from './adversarial-bench.mjs';
import { initHushInvisibleShell } from './hush-invisible-shell.js';
import { initHushAlienConsole } from './hush-alien-console.js';

const RESCUE_FALLBACK_CODES = new Set([
  'literal-safe-fallback',
  'literal-safe-fallback-review',
  'source-normalized-literal-anchor'
]);

function escapeHtml(value = '') {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function isLiteralSafeFallbackCandidate(candidate = {}) {
  return String(candidate?.id || '').startsWith('literal-safe-candidate-') ||
    candidate?.source === 'literal-safe-fallback' ||
    candidate?.strategy === 'literal-safe-fallback' ||
    candidate?.family === 'literal-safe-fallback';
}

function rescueFallbackIsActuallyNeeded(result = {}) {
  const selected = (result.candidates || []).find((candidate) => candidate?.id === result.selectedCandidateId) || null;
  const release = result.releasePolicy || {};
  return Boolean(
    result.allCandidatesFailed ||
    !String(result.selectedOutput || '').trim() ||
    release.hardBlocked ||
    release.mayPopulateOutput === false ||
    isLiteralSafeFallbackCandidate(selected)
  );
}

function filterRescueFallbackWarnings(warnings = []) {
  return (Array.isArray(warnings) ? warnings : [])
    .filter((warning) => !RESCUE_FALLBACK_CODES.has(String(warning || '').trim()));
}

function sanitizeInactiveRescueFallbacks(result = null) {
  if (!result || rescueFallbackIsActuallyNeeded(result)) return result;
  result.candidates = (result.candidates || []).filter((candidate) => !isLiteralSafeFallbackCandidate(candidate));
  result.warnings = filterRescueFallbackWarnings(result.warnings || []);
  if (result.writer) {
    result.writer = {
      ...result.writer,
      warnings: filterRescueFallbackWarnings(result.writer.warnings || [])
    };
  }
  return result;
}

function rerenderHushWarningsPanel() {
  const panel = document.getElementById('hushSwapWarningsPanel');
  const result = sanitizeInactiveRescueFallbacks(bench.benchState?.hushSwapResult || null);
  if (!panel || !result) return false;
  const warnings = Array.isArray(result.warnings) ? result.warnings : [];
  panel.innerHTML = warnings.length
    ? warnings.map((item) => `<span class="chip">${escapeHtml(item)}</span>`).join(' ')
    : '<span class="section-note">No Hush swap warnings yet.</span>';
  return true;
}

function releasedHushOutput() {
  const state = bench.benchState || {};
  sanitizeInactiveRescueFallbacks(state.hushSwapResult || null);
  const result = state.hushSwapResult || {};
  const release = result.releasePolicy || {};
  const output = String(state.protectedOutputText || document.getElementById('protectedOutputInput')?.value || '').trim();
  if (!output) return false;
  if (state.recognitionField?.classifications?.route === 'hold') return false;
  if (release.hardBlocked || release.mayPopulateOutput === false) return false;
  if (result.payloadIntegrity?.passed === false || result.claimIntegrity?.passed === false) return false;
  return Boolean(result.selectedOutput || result.recommendedOutput || result.reviewOutput || release.mayPopulateOutput);
}

function syncMaskMemoryGate() {
  const state = bench.benchState || {};
  const button = document.getElementById('acceptOutputBtn');
  const warning = document.getElementById('acceptWarning');
  rerenderHushWarningsPanel();
  if (!button || !releasedHushOutput()) return false;
  if (state.controllerDecision && !['seal', 'continue'].includes(state.controllerDecision.state)) {
    state.controllerDecision = { ...state.controllerDecision, state: 'continue', action: state.controllerDecision.action || 'hush-release-accepted' };
  }
  button.disabled = false;
  if (warning && warning.textContent.includes('controller is asking for restore or hold')) {
    warning.hidden = true;
    warning.textContent = '';
  }
  return true;
}

function initMaskMemoryGatePatch() {
  const refresh = () => syncMaskMemoryGate();
  document.getElementById('acceptOutputBtn')?.addEventListener('click', refresh, true);
  for (const id of ['generateMaskedOutputBtn', 'analyzeOutputBtn', 'protectedOutputInput']) {
    document.getElementById(id)?.addEventListener('click', () => setTimeout(refresh, 0));
    document.getElementById(id)?.addEventListener('input', () => setTimeout(refresh, 0));
  }
  setTimeout(refresh, 0);
}

if (typeof window !== 'undefined') window.__TD613_HUSH_BENCH__ = bench;
if (typeof document !== 'undefined') {
  initHushInvisibleShell(document, bench);
  initHushAlienConsole(document, bench);
  initMaskMemoryGatePatch();
}

export * from './adversarial-bench.mjs';
export { releasedHushOutput, syncMaskMemoryGate, sanitizeInactiveRescueFallbacks };