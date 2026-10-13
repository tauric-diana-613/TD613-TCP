const root = document.documentElement;
const runButton = document.getElementById('runSearchButton');
const searchForm = document.getElementById('searchForm');
const reviewSearch = document.getElementById('reviewSearch');

let active = false;
let flushQueued = false;

function setDeferred() {
  if (active) return;
  active = true;
  root.dataset.givingSearchRender = 'deferred';
}

function requestReviewConvergenceRender() {
  if (flushQueued) return;
  flushQueued = true;
  queueMicrotask(() => {
    flushQueued = false;
    reviewSearch?.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

function flushDeferred() {
  if (!active) return;
  active = false;
  delete root.dataset.givingSearchRender;
  requestReviewConvergenceRender();
}

// Search validation and queue admission are owned by giving-app.js. Observe the
// canonical run button instead of guessing from submit alone: once it disables,
// the source queue has actually admitted work and heavy Contributions-card DOM
// construction can be deferred safely while source progress remains live.
function observeRunState() {
  if (!runButton) return;
  if (runButton.disabled) setDeferred();
  else flushDeferred();
}

if (runButton) {
  new MutationObserver(observeRunState).observe(runButton, {
    attributes: true,
    attributeFilter: ['disabled']
  });
}

// The microtask closes the tiny interval between submit and the MutationObserver
// callback without trapping invalid submissions: a rejected search never disables
// the canonical run button, so no render deferral begins.
searchForm?.addEventListener('submit', () => queueMicrotask(observeRunState), { capture: true });

// Prefer the first-class settled event when available; the button observer above
// remains a causal fallback if another module fails before dispatching that event.
document.addEventListener('td613:giving-run-settled', flushDeferred);

export const _givingSearchRenderBackpressure = Object.freeze({
  active: () => active,
  flush: flushDeferred
});
