import * as bench from './adversarial-bench.mjs';

export const HUSH_PR77_FLIGHT_CONTROLS_VERSION = 'pr77.2-mask-change-sleeps-generated-state';

const $ = (id, doc = document) => doc.getElementById(id);
const text = (value) => String(value ?? '').trim();
let lastSourceSignature = '';
let lastOutputSignature = '';
let lastAnalyzedOutputSignature = '';
let explicitTransformInFlight = false;

function selectedMaskSignature() {
  const state = bench.benchState || {};
  return [state.selectedHushMaskId || '', state.selectedHushMask?.id || '', state.selectedHushMask?.label || ''].join('|');
}

function sourceSignature(doc = document) {
  return [
    $('messageDraftInput', doc)?.value || '',
    $('maskFieldSelect', doc)?.value || '',
    selectedMaskSignature(),
    $('recognitionIntentMode', doc)?.value || '',
    $('recognitionContextType', doc)?.value || '',
    $('recognitionExposureDuration', doc)?.value || ''
  ].join('\n⟐\n');
}

function outputSignature(doc = document) {
  return [sourceSignature(doc), $('protectedOutputInput', doc)?.value || ''].join('\n𝌋\n');
}

function setAcceptWarning(message = '', { hidden = false, disableAccept = true } = {}, doc = document) {
  const accept = $('acceptOutputBtn', doc);
  const warning = $('acceptWarning', doc);
  if (accept) accept.disabled = Boolean(disableAccept);
  if (!warning) return;
  warning.hidden = hidden || !message;
  warning.textContent = message || '';
}

function clearAcceptWarning({ disableAccept = false } = {}, doc = document) {
  setAcceptWarning('', { hidden: true, disableAccept }, doc);
}

function setGeneratorStatus(message = '', tone = 'info', doc = document) {
  const status = $('hushGeneratorStatus', doc);
  if (!status) return;
  status.dataset.tone = tone;
  status.textContent = message || status.textContent || 'Generator mode ready.';
}

function setText(id, value, doc = document) {
  const node = $(id, doc);
  if (node) node.textContent = value;
}

function setHtml(id, value, doc = document) {
  const node = $(id, doc);
  if (node) node.innerHTML = value;
}

function putGeneratedSurfacesToSleep(doc = document, reason = 'mask-changed') {
  const state = bench.benchState || {};
  const output = $('protectedOutputInput', doc);
  if (output) {
    output.value = '';
    output.dispatchEvent(new Event('input', { bubbles: true }));
  }

  state.protectedOutputText = '';
  state.hushSwapResult = null;
  state.hushProfileMatch = null;
  state.ingestionAudit = null;
  state.escapeVector = null;
  state.controllerDecision = null;
  state.claimCeiling = null;
  state.contextProfile = null;
  state.recognitionField = null;
  state.reportPayload = null;
  if (state.profiles) state.profiles.protectedOutput = null;

  lastOutputSignature = '';
  lastAnalyzedOutputSignature = '';
  explicitTransformInFlight = false;

  clearAcceptWarning({ disableAccept: true }, doc);
  setGeneratorStatus(reason === 'mask-changed'
    ? 'Mask changed. Generated output and analysis are asleep; hit Transform to create a new output.'
    : 'Input changed. Generated output and analysis are asleep; hit Transform to create a new output.', 'info', doc);

  setText('controllerStatePill', 'Controller // waiting', doc);
  setText('sealStatePill', 'Seal // unavailable', doc);
  setHtml('escapeVectorGrid', '', doc);
  setHtml('recognitionFieldGrid', '', doc);
  setHtml('recognitionFieldWarnings', '<span class="section-note">Waiting for Transform.</span>', doc);
  setHtml('controllerPanel', '<div class="section-kicker">Controller / Steering Surface</div><h3 id="controllerHeading">Waiting for Transform</h3><div id="controllerBody"><p>Generated-state controls are asleep until a new protected output exists.</p></div>', doc);
  setHtml('claimCeilingPanel', '<p class="section-note">Waiting for Transform.</p>', doc);
  setHtml('hushProfileMatchPanel', '<p class="section-note">Waiting for Transform.</p>', doc);
  setHtml('hushSwapWarningsPanel', '<span class="section-note">No Hush swap warnings yet.</span>', doc);
  setHtml('hushPhase32Diagnostics', '', doc);

  if (typeof window !== 'undefined') {
    window.__TD613_HUSH_LAST_SLEEP_RESET__ = {
      version: HUSH_PR77_FLIGHT_CONTROLS_VERSION,
      reason,
      appliedAt: new Date().toISOString(),
      mask: selectedMaskSignature()
    };
  }
}

function outputReady(doc = document, message = 'Output produced. Review/edit if needed; Analyze is optional before Accept.') {
  const output = text($('protectedOutputInput', doc)?.value || '');
  if (!output) return false;
  clearAcceptWarning({ disableAccept: false }, doc);
  setGeneratorStatus(message, 'ok', doc);
  return true;
}

function releaseAcceptIfAnalyzed(doc = document) {
  const output = text($('protectedOutputInput', doc)?.value || '');
  if (!output) return false;
  const state = bench.benchState || {};
  const decision = state.controllerDecision;
  const route = state.recognitionField?.classifications?.route;
  const analyzed = Boolean(state.escapeVector && decision && lastAnalyzedOutputSignature === outputSignature(doc));
  if (!analyzed) return outputReady(doc);
  const held = route === 'hold' || decision.state === 'hold';
  if (!held) {
    return outputReady(doc, 'Analyze complete. Output remains ready for Mask Memory if you accept it.');
  }
  clearAcceptWarning({ disableAccept: false }, doc);
  setGeneratorStatus('Analyze complete with a hold/caution route. Review the output; Accept remains operator-controlled.', 'warn', doc);
  return true;
}

function resetReviewState(doc = document, reason = 'pending-review') {
  const state = bench.benchState || {};
  state.escapeVector = null;
  state.controllerDecision = null;
  state.recognitionField = null;
  state.contextProfile = null;
  state.claimCeiling = null;
  state.hushProfileMatch = null;
  lastAnalyzedOutputSignature = '';
  const output = text($('protectedOutputInput', doc)?.value || '');
  if (output) {
    outputReady(doc, reason === 'transform'
      ? 'Output produced. Review/edit if needed; Analyze is optional before Accept.'
      : 'Output changed. Review/edit if needed; Analyze is optional before Accept.');
  } else {
    putGeneratedSurfacesToSleep(doc, reason === 'mask-changed' ? 'mask-changed' : 'source-changed');
  }
}

function clearOutputForNewSource(doc = document, reason = 'source-changed', { force = false } = {}) {
  const currentSource = sourceSignature(doc);
  if (!force && currentSource === lastSourceSignature) return;
  lastSourceSignature = currentSource;
  putGeneratedSurfacesToSleep(doc, reason);
}

function afterTransform(doc = document, pass = 0) {
  const output = text($('protectedOutputInput', doc)?.value || '');
  if (output) {
    explicitTransformInFlight = false;
    lastSourceSignature = sourceSignature(doc);
    lastOutputSignature = outputSignature(doc);
    resetReviewState(doc, 'transform');
    return;
  }
  if (pass < 8) window.setTimeout(() => afterTransform(doc, pass + 1), 300);
  else {
    explicitTransformInFlight = false;
    clearAcceptWarning({ disableAccept: true }, doc);
    setGeneratorStatus('Transform finished without protected output. Check generator diagnostics, then edit source/mask or try Transform again.', 'warn', doc);
  }
}

function afterAnalyze(doc = document) {
  const output = text($('protectedOutputInput', doc)?.value || '');
  if (!output) {
    putGeneratedSurfacesToSleep(doc, 'source-changed');
    setGeneratorStatus('Analyze ran, but there is no protected output to accept yet. Hit Transform first.', 'info', doc);
    return;
  }
  lastOutputSignature = outputSignature(doc);
  if (bench.benchState?.escapeVector && bench.benchState?.controllerDecision) {
    lastAnalyzedOutputSignature = outputSignature(doc);
  }
  releaseAcceptIfAnalyzed(doc);
}

function bind(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench' || doc.body.dataset.hushPr77 === 'true') return;
  doc.body.dataset.hushPr77 = 'true';
  lastSourceSignature = sourceSignature(doc);

  const transform = $('generateMaskedOutputBtn', doc);
  if (transform) {
    transform.addEventListener('click', () => {
      explicitTransformInFlight = true;
      lastAnalyzedOutputSignature = '';
      setGeneratorStatus('Explicit Transform pressed. Remote candidate flight in progress.', 'info', doc);
      window.setTimeout(() => afterTransform(doc), 500);
    }, true);
  }

  const analyze = $('analyzeOutputBtn', doc);
  if (analyze) {
    analyze.addEventListener('click', () => {
      window.setTimeout(() => afterAnalyze(doc), 220);
      window.setTimeout(() => afterAnalyze(doc), 900);
      window.setTimeout(() => afterAnalyze(doc), 1800);
    }, true);
  }

  const input = $('messageDraftInput', doc);
  if (input) {
    input.addEventListener('input', () => window.setTimeout(() => clearOutputForNewSource(doc, 'source-changed'), 0));
    input.addEventListener('paste', () => window.setTimeout(() => clearOutputForNewSource(doc, 'source-pasted'), 0));
  }

  const output = $('protectedOutputInput', doc);
  if (output) {
    output.addEventListener('input', () => window.setTimeout(() => {
      if (!explicitTransformInFlight && outputSignature(doc) !== lastOutputSignature) resetReviewState(doc, 'output-edited');
    }, 0));
  }

  const select = $('maskFieldSelect', doc);
  if (select) {
    select.addEventListener('change', () => window.setTimeout(() => clearOutputForNewSource(doc, 'mask-changed', { force: true }), 0));
  }
  doc.addEventListener('click', (event) => {
    if (event.target?.closest?.('[data-hush-use-mask]')) {
      [80, 240, 600].forEach((delay) => window.setTimeout(() => clearOutputForNewSource(doc, 'mask-changed', { force: true }), delay));
    }
  }, true);

  setGeneratorStatus('Flight controls ready. Transform wakes generated-state controls. Mask changes put them back to sleep.', 'info', doc);
}

if (typeof document !== 'undefined') {
  const run = () => bind(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [240, 720, 1400, 2600].forEach((delay) => window.setTimeout(run, delay));
}
