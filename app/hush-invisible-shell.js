export const HUSH_INVISIBLE_SHELL_VERSION = 'phase-15';

const INIT_FLAG = 'hushInvisibleShellReady';
const LIGHTS = [
  ['hushMeaningLight', 'Meaning'],
  ['hushLiteralLight', 'Literals'],
  ['hushMaskFitLight', 'Mask Fit'],
  ['hushReviewLight', 'Review']
];

let activeDoc = typeof document !== 'undefined' ? document : null;

function $(id, root = activeDoc) { return root?.getElementById(id) || null; }
function num(value) { return Number.isFinite(Number(value)) ? Number(value) : null; }

function stateFromScore(value, ready = 0.78, review = 0.55) {
  const score = num(value);
  if (score === null) return 'quiet';
  if (score >= ready) return 'ready';
  if (score >= review) return 'review';
  return 'hold';
}

function textFromState(state) {
  if (state === 'ready') return 'Ready';
  if (state === 'review') return 'Review';
  if (state === 'hold') return 'Hold';
  return 'Quiet';
}

function currentBench(fallback = {}) {
  return (typeof window !== 'undefined' && window.__TD613_HUSH_BENCH__) || fallback || {};
}

function setLight(id, state, detail) {
  const el = $(id);
  if (!el) return;
  el.dataset.state = state;
  const span = el.querySelector('span');
  if (span) span.textContent = `${textFromState(state)} / ${detail}`;
}

export function updateHushPressureRibbon(bench = currentBench()) {
  const state = bench?.benchState || {};
  const vector = state.escapeVector || bench.escapeVector || null;
  const scores = vector?.scores || {};
  const match = state.hushProfileMatch || null;
  const decision = state.controllerDecision || null;
  const claim = state.claimCeiling || null;
  const recognition = state.recognitionField || null;
  const semantic = num(scores.semanticFidelity);
  const maskFit = num(match?.matchScore ?? scores.maskFit);
  const literalState = (vector?.warnings || []).some((warning) => String(warning).includes('literal'))
    ? 'hold'
    : semantic === null
      ? 'quiet'
      : semantic >= 0.72
        ? 'ready'
        : 'review';
  const reviewState =
    decision?.state === 'hold' ||
    decision?.state === 'restore' ||
    recognition?.classifications?.route === 'hold'
      ? 'hold'
      : decision?.state === 'seal' || decision?.state === 'continue'
        ? 'ready'
        : claim
          ? 'review'
          : 'quiet';
  setLight('hushMeaningLight', stateFromScore(semantic), semantic === null ? 'awaiting analysis' : `${semantic.toFixed(2)} fidelity`);
  setLight('hushLiteralLight', literalState, literalState === 'hold' ? 'check anchors' : 'anchor scan');
  setLight('hushMaskFitLight', stateFromScore(maskFit), maskFit === null ? 'awaiting match' : `${maskFit.toFixed(2)} fit`);
  setLight('hushReviewLight', reviewState, claim?.label || decision?.state || 'waiting');
}

export function copyHushOutput(doc = document) {
  const value = $('protectedOutputInput', doc)?.value || '';
  if (!value) return false;
  const clipboard = doc?.defaultView?.navigator?.clipboard || (typeof navigator !== 'undefined' ? navigator.clipboard : null);
  if (clipboard?.writeText) clipboard.writeText(value).catch(() => {});
  return true;
}

function defer(doc, callback) {
  const timer = doc?.defaultView?.setTimeout || (typeof window !== 'undefined' ? window.setTimeout : setTimeout);
  timer(callback, 0);
}

export function initHushInvisibleShell(doc = document, bench = currentBench()) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench') return null;
  activeDoc = doc;
  if (typeof window !== 'undefined' && bench) window.__TD613_HUSH_BENCH__ = bench;
  if (doc.body.dataset[INIT_FLAG] === 'true') {
    updateHushPressureRibbon(currentBench(bench));
    return { version: HUSH_INVISIBLE_SHELL_VERSION, idempotent: true };
  }
  doc.body.dataset[INIT_FLAG] = 'true';

  for (const [id, label] of LIGHTS) {
    const el = $(id, doc);
    if (!el) continue;
    el.dataset.state = 'quiet';
    if (!el.querySelector('strong')) el.innerHTML = `<strong>${label}</strong><span>Quiet / waiting</span>`;
  }

  $('copyHushOutputBtn', doc)?.addEventListener('click', () => copyHushOutput(doc));
  $('openHushReviewBtn', doc)?.addEventListener('click', () => {
    const lab = $('hushLabDrawer', doc);
    if (lab) lab.open = true;
    if (typeof lab?.scrollIntoView === 'function') lab.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  doc.addEventListener('click', (event) => {
    const id = event.target?.id || '';
    if (['generateMaskedOutputBtn', 'analyzeOutputBtn', 'acceptOutputBtn', 'resetBenchBtn'].includes(id)) {
      defer(doc, () => updateHushPressureRibbon(currentBench(bench)));
    }
  }, true);
  doc.addEventListener('input', (event) => {
    if (event.target?.id === 'protectedOutputInput') updateHushPressureRibbon(currentBench(bench));
  });

  updateHushPressureRibbon(currentBench(bench));
  return { version: HUSH_INVISIBLE_SHELL_VERSION };
}

export const ready = null;
