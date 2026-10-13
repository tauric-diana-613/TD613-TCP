import './hush-remote-contract-detox.js';
import { cleanVisibleHushLabels } from './hush-visible-detox-seam-guard.js';
import { benchState as lightBenchState } from './adversarial-bench-light.js';

export const HUSH_CURRENT_LIGHT_BENCH_VERSION = 'current-hush-light/20260701';
export const HUSH_CURRENT_HEAVY_BENCH_VERSION = 'current-hush-heavy/20260701';

function patchLedgerContext(ledger = null, version = HUSH_CURRENT_LIGHT_BENCH_VERSION) {
  if (!ledger || typeof ledger !== 'object') return false;
  ledger.context = { ...(ledger.context || {}), benchVersion: version };
  ledger.reproducibility = { ...(ledger.reproducibility || {}), currentHushSurface: true };
  return true;
}

export function patchCurrentHushRuntimeState() {
  const patched = [];
  if (patchLedgerContext(lightBenchState?.iterationLedger, HUSH_CURRENT_LIGHT_BENCH_VERSION)) patched.push('light-ledger');
  if (window.__TD613_HUSH_BENCH__?.benchState?.iterationLedger && patchLedgerContext(window.__TD613_HUSH_BENCH__.benchState.iterationLedger, HUSH_CURRENT_HEAVY_BENCH_VERSION)) patched.push('heavy-ledger');
  cleanVisibleHushLabels(document.body);
  window.__TD613_HUSH_CURRENTNESS__ = {
    surface: 'current-hush-console',
    lightBenchVersion: lightBenchState?.iterationLedger?.context?.benchVersion || '',
    heavyBenchVersion: window.__TD613_HUSH_BENCH__?.benchState?.iterationLedger?.context?.benchVersion || '',
    userFacingInternalLabelsCleaned: true,
    patched
  };
  return window.__TD613_HUSH_CURRENTNESS__;
}

function patchSoon() {
  patchCurrentHushRuntimeState();
  setTimeout(patchCurrentHushRuntimeState, 0);
  setTimeout(patchCurrentHushRuntimeState, 50);
  setTimeout(patchCurrentHushRuntimeState, 250);
}

if (typeof window !== 'undefined') {
  patchSoon();
  window.addEventListener('td613:hush:core-ready', patchSoon);
  window.addEventListener('td613:hush:phase39-ready', patchSoon);
  window.addEventListener('td613:hush:patch38-result', patchSoon);
  window.addEventListener('click', (event) => {
    const id = event.target?.closest?.('button, a, input, select')?.id || '';
    if (/generateMaskedOutputBtn|analyzeOutputBtn|resetBenchBtn|exportLedgerJsonBtn|exportReportJsonBtn|exportHushMaskProfileBtn|exportHushSwapJsonBtn/.test(id)) patchSoon();
  }, true);
  window.addEventListener('change', (event) => {
    const id = event.target?.id || '';
    if (/maskFieldSelect|recognitionContextType|recognitionIntentMode|recognitionExposureDuration/.test(id)) patchSoon();
  }, true);
}
