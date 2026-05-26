import * as bench from './adversarial-bench.mjs';

export const HUSH_PR77_FLIGHT_CONTROLS_VERSION = 'pr77.1-transform-output-accept-ready';

const $ = (id, doc = document) => doc.getElementById(id);
const text = (value) => String(value ?? '').trim();
let lastSourceSignature = '';
let lastOutputSignature = '';
let lastAnalyzedOutputSignature = '';
let explicitTransformInFlight = false;

function sourceSignature(doc = document) {
  return [
    $('messageDraftInput', doc)?.value || '',
    $('maskFieldSelect', doc)?.value || '',
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
  // Analyze may advise caution, but it should not leave the UI in a stale unreviewed state.
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
    clearAcceptWarning({ disableAccept: true }, doc);
    setGeneratorStatus('No protected output is present yet. Hit Transform to create one.', 'info', doc);
  }
}

function clearOutputForNewSource(doc = document, reason = 'source-changed') {
  const currentSource = sourceSignature(doc);
  if (currentSource === lastSourceSignature) return;
  lastSourceSignature = currentSource;
  const output = $('protectedOutputInput', doc);
  if (output && output.value) output.value = '';
  const state = bench.benchState || {};
  state.protectedOutputText = '';
  state.hushSwapResult = null;
  lastOutputSignature = '';
  lastAnalyzedOutputSignature = '';
  resetReviewState(doc, reason);
  setGeneratorStatus('Message or mask changed. Transform is waiting for an explicit button press.', 'info', doc);
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
    clearAcceptWarning({ disableAccept: true }, doc);
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
  if (select) select.addEventListener('change', () => window.setTimeout(() => clearOutputForNewSource(doc, 'mask-changed'), 0));
  doc.addEventListener('click', (event) => {
    if (event.target?.closest?.('[data-hush-use-mask]')) window.setTimeout(() => clearOutputForNewSource(doc, 'mask-card-selected'), 160);
  }, true);

  setGeneratorStatus('Flight controls ready. Analyze reads the message; Transform rewrites it. Accept is available once protected output exists.', 'info', doc);
}

if (typeof document !== 'undefined') {
  const run = () => bind(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [240, 720, 1400, 2600].forEach((delay) => window.setTimeout(run, delay));
}
