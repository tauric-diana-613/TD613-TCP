import './hush-simple-path.js';
import * as bench from './adversarial-bench.mjs';
import { initHushInvisibleShell } from './hush-invisible-shell.js';
import { initHushAlienConsole } from './hush-alien-console.js';

function releasedHushOutput() {
  const state = bench.benchState || {};
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
export { releasedHushOutput, syncMaskMemoryGate };
