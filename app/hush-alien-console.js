export const HUSH_ALIEN_CONSOLE_VERSION = 'phase-20';

let activeDoc = typeof document !== 'undefined' ? document : null;
let activeBench = null;
const INIT_FLAG = 'hushAlienConsoleReady';

function $(id, root = activeDoc) { return root?.getElementById(id) || null; }
function safeText(value = '') { return String(value ?? ''); }
function asArray(value) { return Array.isArray(value) ? value.filter(Boolean) : []; }
function fmt(value) { return Number.isFinite(Number(value)) ? Number(value).toFixed(2) : 'quiet'; }
function escapeHtml(value = '') { return safeText(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }
function stateFromScore(value, ready = 0.78, review = 0.55) { const n = Number(value); if (!Number.isFinite(n)) return 'quiet'; if (n >= ready) return 'ready'; if (n >= review) return 'review'; return 'hold'; }
function textFromState(state) { return state === 'ready' ? 'Ready' : state === 'review' ? 'Review' : state === 'hold' ? 'Hold' : 'Quiet'; }
function currentBench(fallback = {}) { return activeBench || (typeof window !== 'undefined' && window.__TD613_HUSH_BENCH__) || fallback || {}; }
function maskList(bench = currentBench()) { return [...asArray(bench?.benchState?.hushMasks), ...asArray(bench?.benchState?.customMasks)]; }

function setLight(id, state, detail, root = activeDoc) {
  const el = $(id, root);
  if (!el) return;
  el.dataset.state = state;
  const span = el.querySelector('span');
  if (span) span.textContent = `${textFromState(state)} / ${detail}`;
}

function setText(id, value, root = activeDoc) {
  const el = $(id, root);
  if (el) el.textContent = safeText(value);
}

function maskRouteMarkup(mask = {}, selectedId = '') {
  const selected = mask.id === selectedId;
  const bestFor = mask.intendedUse || mask.family || 'local message routing';
  const posture = mask.riskTell || mask.description || 'bounded mask route';
  return `<button type="button" class="hush-route-card" data-mask-id="${escapeHtml(mask.id)}" aria-selected="${selected ? 'true' : 'false'}">
    <strong>${escapeHtml(mask.label || mask.id || 'Mask')}</strong>
    <small>${escapeHtml(mask.description || bestFor)}</small>
    <span class="hush-route-meta"><span>${escapeHtml(mask.family || 'mask')}</span><span>${escapeHtml(bestFor)}</span></span>
    <small>${escapeHtml(posture)}</small>
  </button>`;
}

export function renderHushMaskRouteCards(doc = activeDoc, bench = currentBench()) {
  activeDoc = doc || activeDoc;
  activeBench = bench || activeBench;
  const grid = $('hushMaskRouteGrid', doc);
  if (!grid) return null;
  const masks = maskList(bench);
  const selectedId = bench?.benchState?.selectedHushMaskId || $('maskFieldSelect', doc)?.value || masks[0]?.id || '';
  grid.innerHTML = masks.map((mask) => maskRouteMarkup(mask, selectedId)).join('') || '<p class="section-note">Masks will appear after Hush initializes.</p>';
  return { version: HUSH_ALIEN_CONSOLE_VERSION, count: masks.length, selectedId };
}

function updateSelectedRoute(doc = activeDoc, bench = currentBench()) {
  const selectedId = bench?.benchState?.selectedHushMaskId || $('maskFieldSelect', doc)?.value || '';
  doc?.querySelectorAll?.('.hush-route-card')?.forEach((card) => {
    const active = card.getAttribute('data-mask-id') === selectedId;
    card.setAttribute('aria-selected', active ? 'true' : 'false');
  });
}

export function updateHushOperatorPath(doc = activeDoc, bench = currentBench()) {
  const state = bench?.benchState || {};
  const messageLoaded = Boolean(($('messageDraftInput', doc)?.value || state.messageDraftText || '').trim());
  const maskSelected = Boolean(state.selectedHushMaskId || $('maskFieldSelect', doc)?.value);
  const result = state.hushSwapResult || null;
  const outputLoaded = Boolean(($('protectedOutputInput', doc)?.value || state.protectedOutputText || '').trim());
  const release = result?.releasePolicy || {};
  const reviewState = release.hardBlocked ? 'hold' : result ? 'review' : 'quiet';
  const path = [
    ['hushPathMessage', messageLoaded ? 'ready' : 'quiet'],
    ['hushPathMask', maskSelected ? 'ready' : 'quiet'],
    ['hushPathTransform', messageLoaded && maskSelected ? 'ready' : 'quiet'],
    ['hushPathHeat', result ? reviewState : 'quiet'],
    ['hushPathCopy', outputLoaded ? 'ready' : 'quiet']
  ];
  for (const [id, value] of path) { const el = $(id, doc); if (el) el.dataset.state = value; }
}

export function updateHushOutputStatus(doc = activeDoc, bench = currentBench()) {
  const state = bench?.benchState || {};
  const result = state.hushSwapResult || null;
  const release = result?.releasePolicy || {};
  const selected = asArray(result?.candidates).find((candidate) => candidate.id === result?.selectedCandidateId) || asArray(result?.candidates)[0] || {};
  const claim = selected.claimIntegrity || result?.claimIntegrity || null;
  const literals = selected.lockboxVerification || result?.lockboxVerification || null;
  const residue = selected.sourceResidue || result?.sourceResidue || null;
  const sourceHeat = residue?.metrics?.cadenceBodyRisk;
  setText('hushOutputStatusText', release.releaseStatus || (result ? 'Review' : 'Waiting'), doc);
  setText('hushOutputClaimText', claim ? (claim.passed ? 'Held' : 'Hold') : 'Quiet', doc);
  setText('hushOutputLiteralText', literals ? `${fmt(literals.preservationScore)} locked` : 'Quiet', doc);
  setText('hushOutputSourceText', Number.isFinite(Number(sourceHeat)) ? `${fmt(sourceHeat)} heat` : 'Quiet', doc);
}

export function updateHushAlienHeat(doc = activeDoc, bench = currentBench()) {
  const state = bench?.benchState || {};
  const result = state.hushSwapResult || null;
  const selected = asArray(result?.candidates).find((candidate) => candidate.id === result?.selectedCandidateId) || asArray(result?.candidates)[0] || {};
  const scores = selected.escapeVector?.scores || state.escapeVector?.scores || {};
  const semantic = scores.semanticFidelity;
  const literalScore = selected.lockboxVerification?.preservationScore ?? result?.lockboxVerification?.preservationScore;
  const maskFit = selected.match?.matchScore ?? state.hushProfileMatch?.matchScore ?? scores.maskFit;
  const syntax = selected.syntaxShift?.metrics?.syntaxShiftScore ?? result?.syntaxShift?.metrics?.syntaxShiftScore;
  const sourceHeat = selected.sourceResidue?.metrics?.cadenceBodyRisk ?? result?.sourceResidue?.metrics?.cadenceBodyRisk;
  const claim = selected.claimIntegrity || result?.claimIntegrity || null;
  const release = result?.releasePolicy || {};
  setLight('hushMeaningLight', stateFromScore(semantic), Number.isFinite(Number(semantic)) ? `${fmt(semantic)} fidelity` : 'awaiting signal', doc);
  setLight('hushLiteralLight', stateFromScore(literalScore), Number.isFinite(Number(literalScore)) ? `${fmt(literalScore)} locked` : 'anchor scan', doc);
  setLight('hushMaskFitLight', stateFromScore(maskFit), Number.isFinite(Number(maskFit)) ? `${fmt(maskFit)} fit` : 'awaiting route', doc);
  setLight('hushSyntaxLight', stateFromScore(syntax), Number.isFinite(Number(syntax)) ? `${fmt(syntax)} shift` : 'awaiting recomposition', doc);
  setLight('hushSourceHeatLight', Number.isFinite(Number(sourceHeat)) ? (Number(sourceHeat) > 0.82 ? 'hold' : Number(sourceHeat) > 0.55 ? 'review' : 'ready') : 'quiet', Number.isFinite(Number(sourceHeat)) ? `${fmt(sourceHeat)} heat` : 'awaiting residue', doc);
  setLight('hushClaimLight', claim ? (claim.passed ? 'ready' : 'hold') : 'quiet', claim ? (claim.passed ? 'held' : 'failed') : 'awaiting claim', doc);
  setLight('hushReviewLight', release.hardBlocked ? 'hold' : result ? 'review' : 'quiet', release.releaseStatus || 'waiting', doc);
  updateHushOutputStatus(doc, bench);
  updateHushOperatorPath(doc, bench);
}

function bindRouteCards(doc = activeDoc, bench = currentBench()) {
  const grid = $('hushMaskRouteGrid', doc);
  const select = $('maskFieldSelect', doc);
  if (!grid || grid.dataset.bound === 'true') return;
  grid.dataset.bound = 'true';
  grid.addEventListener('click', (event) => {
    const card = event.target?.closest?.('.hush-route-card');
    if (!card) return;
    const maskId = card.getAttribute('data-mask-id');
    if (select) select.value = maskId;
    if (bench?.selectHushMask) bench.selectHushMask(maskId);
    renderHushMaskRouteCards(doc, bench);
    updateSelectedRoute(doc, bench);
    updateHushOperatorPath(doc, bench);
  });
  select?.addEventListener('change', () => {
    renderHushMaskRouteCards(doc, bench);
    updateSelectedRoute(doc, bench);
    updateHushOperatorPath(doc, bench);
  });
}

function bindSurfaceUpdates(doc = activeDoc, bench = currentBench()) {
  if (!doc || doc.body?.dataset.hushAlienEvents === 'true') return;
  doc.body.dataset.hushAlienEvents = 'true';
  const defer = () => doc.defaultView?.setTimeout?.(() => updateHushAlienHeat(doc, bench), 0);
  doc.addEventListener('click', (event) => {
    if (['generateMaskedOutputBtn', 'analyzeOutputBtn', 'resetBenchBtn', 'copyHushOutputBtn'].includes(event.target?.id || '')) defer();
  }, true);
  doc.addEventListener('input', (event) => {
    if (['messageDraftInput', 'protectedOutputInput'].includes(event.target?.id || '')) updateHushOperatorPath(doc, bench);
  });
}

export function initHushAlienConsole(doc = document, bench = currentBench()) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench') return null;
  activeDoc = doc;
  activeBench = bench || activeBench;
  if (typeof window !== 'undefined' && bench) window.__TD613_HUSH_BENCH__ = bench;
  doc.body.dataset[INIT_FLAG] = 'true';
  renderHushMaskRouteCards(doc, bench);
  bindRouteCards(doc, bench);
  bindSurfaceUpdates(doc, bench);
  updateHushAlienHeat(doc, bench);
  const timer = doc.defaultView?.setTimeout || (typeof setTimeout !== 'undefined' ? setTimeout : null);
  if (timer) {
    timer(() => { renderHushMaskRouteCards(doc, bench); updateHushAlienHeat(doc, bench); }, 0);
    timer(() => { renderHushMaskRouteCards(doc, bench); updateHushAlienHeat(doc, bench); }, 50);
  }
  return { version: HUSH_ALIEN_CONSOLE_VERSION };
}

export const ready = null;
