export const HUSH_INVISIBLE_SHELL_VERSION = 'phase-15';

const LIGHTS = [
  ['hushMeaningLight', 'Meaning'],
  ['hushLiteralLight', 'Literals'],
  ['hushMaskFitLight', 'Mask Fit'],
  ['hushReviewLight', 'Review']
];

function $(id, root = document) { return root.getElementById(id); }
function num(value) { return Number.isFinite(Number(value)) ? Number(value) : null; }
function stateFromScore(value, ready = 0.78, review = 0.55) {
  const score = num(value);
  if (score === null) return 'quiet';
  if (score >= ready) return 'ready';
  if (score >= review) return 'review';
  return 'hold';
}
function textFromState(state) { return state === 'ready' ? 'Ready' : state === 'review' ? 'Review' : state === 'hold' ? 'Hold' : 'Quiet'; }
function setLight(id, state, detail) {
  const el = $(id);
  if (!el) return;
  el.dataset.state = state;
  const span = el.querySelector('span');
  if (span) span.textContent = `${textFromState(state)} · ${detail}`;
}

export function updateHushPressureRibbon(bench = window.__TD613_HUSH_BENCH__ || {}) {
  const vector = bench.benchState?.escapeVector || bench.escapeVector || null;
  const scores = vector?.scores || {};
  const match = bench.benchState?.hushProfileMatch || null;
  const decision = bench.benchState?.controllerDecision || null;
  const claim = bench.benchState?.claimCeiling || null;
  const recognition = bench.benchState?.recognitionField || null;
  const semantic = num(scores.semanticFidelity);
  const maskFit = num(match?.matchScore ?? scores.maskFit);
  const literalState = (vector?.warnings || []).some((w) => String(w).includes('literal')) ? 'hold' : semantic === null ? 'quiet' : semantic >= 0.72 ? 'ready' : 'review';
  const reviewState = decision?.state === 'hold' || decision?.state === 'restore' || recognition?.classifications?.route === 'hold' ? 'hold' : decision?.state === 'seal' || decision?.state === 'continue' ? 'ready' : claim ? 'review' : 'quiet';
  setLight('hushMeaningLight', stateFromScore(semantic), semantic === null ? 'awaiting analysis' : `${semantic.toFixed(2)} fidelity`);
  setLight('hushLiteralLight', literalState, literalState === 'hold' ? 'check anchors' : 'anchor scan');
  setLight('hushMaskFitLight', stateFromScore(maskFit), maskFit === null ? 'awaiting match' : `${maskFit.toFixed(2)} fit`);
  setLight('hushReviewLight', reviewState, claim?.label || decision?.state || 'waiting');
}

export function copyHushOutput(doc = document) {
  const value = $('protectedOutputInput', doc)?.value || '';
  if (!value) return false;
  if (navigator?.clipboard?.writeText) navigator.clipboard.writeText(value).catch(() => {});
  return true;
}

export function initHushInvisibleShell(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench') return null;
  for (const [id, label] of LIGHTS) {
    const el = $(id, doc);
    if (!el) continue;
    el.dataset.state = 'quiet';
    if (!el.querySelector('strong')) el.innerHTML = `<strong>${label}</strong><span>Quiet · waiting</span>`;
  }
  $('copyHushOutputBtn', doc)?.addEventListener('click', () => copyHushOutput(doc));
  $('openHushReviewBtn', doc)?.addEventListener('click', () => { const lab = $('hushLabDrawer', doc); if (lab) lab.open = true; lab?.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  doc.addEventListener('click', (event) => {
    const id = event.target?.id || '';
    if (['generateMaskedOutputBtn', 'analyzeOutputBtn', 'acceptOutputBtn'].includes(id)) window.setTimeout(() => updateHushPressureRibbon(window.__TD613_HUSH_BENCH__), 0);
  }, true);
  doc.addEventListener('input', (event) => {
    if (event.target?.id === 'protectedOutputInput') updateHushPressureRibbon(window.__TD613_HUSH_BENCH__);
  });
  updateHushPressureRibbon(window.__TD613_HUSH_BENCH__);
  return { version: HUSH_INVISIBLE_SHELL_VERSION };
}

export const ready = typeof document !== 'undefined' ? initHushInvisibleShell(document) : null;
