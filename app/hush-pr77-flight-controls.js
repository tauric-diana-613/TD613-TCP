import * as bench from './adversarial-bench.mjs';

export const HUSH_PR77_FLIGHT_CONTROLS_VERSION = 'pr77-explicit-flight-controls-review-clear';

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

function setGeneratorStatus(message = '', tone = 'info', doc = document) {
  const status = $('hushGeneratorStatus', doc);
  if (!status) return;
  status.dataset.tone = tone;
  status.textContent = message || status.textContent || 'Generator mode ready.';
}

function releaseAcceptIfAnalyzed(doc = document) {
  const output = text($('protectedOutputInput', doc)?.value || '');
  if (!output) return false;
  const state = bench.benchState || {};
  const decision = state.controllerDecision;
  const route = state.recognitionField?.classifications?.route;
  const analyzed = Boolean(state.escapeVector && decision && lastAnalyzedOutputSignature === outputSignature(doc));
  if (!analyzed) return false;
  const allowed = ['seal', 'continue'].includes(decision.state) && route !== 'hold';
  if (allowed) {
    setAcceptWarning('', { hidden: true, disableAccept: false }, doc);
    setGeneratorStatus('Analyze complete. Output is reviewed and ready for Mask Memory if you accept it.', 'ok', doc);
    return true;
  }
  setAcceptWarning('Analyze completed. Accept remains paused by controller or Recognition Field routing; edit the output or switch masks, then Analyze again.', { hidden: false, disableAccept: true }, doc);
  setGeneratorStatus('Analyze complete, but this output is still held. Edit or switch masks, then Analyze again.', 'warn', doc);
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
    setAcceptWarning('Output is unreviewed. Hit Analyze after Transform before accepting into Mask Memory.', { hidden: false, disableAccept: true }, doc);
    setGeneratorStatus(reason === 'transform' ? 'Output produced. Review/edit it, then hit Analyze before Accept.' : 'Review state reset. Hit Analyze before accepting into Mask Memory.', 'info', doc);
  } else {
    setAcceptWarning('', { hidden: true, disableAccept: true }, doc);
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
  else explicitTransformInFlight = false;
}

function afterAnalyze(doc = document) {
  const output = text($('protectedOutputInput', doc)?.value || '');
  if (!output) {
    setAcceptWarning('', { hidden: true, disableAccept: true }, doc);
    setGeneratorStatus('Input profile analyzed. Transform is still waiting for an explicit button press.', 'info', doc);
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

  setGeneratorStatus('Flight controls ready. Analyze reads the message; Transform rewrites it.', 'info', doc);
}

if (typeof document !== 'undefined') {
  const run = () => bind(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [240, 720, 1400, 2600].forEach((delay) => window.setTimeout(run, delay));
}
