const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

let cycle = 0;
let active = null;
let observer = null;
let timer = null;

function terminalStatus(status) {
  return ['COMPLETE', 'PARTIAL', 'FAILED', 'ERROR', 'DRIFTED', 'UNAVAILABLE', 'CANCELLED'].includes(status);
}

function compact(value) {
  return String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
}

function selectedSourceIds() {
  return $$('#sourceRegistry input[type="checkbox"]:checked')
    .map((input) => compact(input.value))
    .filter(Boolean)
    .slice(0, 64);
}

function observationAperture() {
  const aliases = String($('#searchAliases')?.value || '')
    .split(/\r?\n|;/)
    .map(compact)
    .filter(Boolean);
  const sourceIds = selectedSourceIds();
  return Object.freeze({
    schema: 'td613.giving.observation-aperture/v0.1',
    selected_source_count: sourceIds.length,
    selected_source_ids: Object.freeze(sourceIds),
    date_from: compact($('#dateFrom')?.value) || null,
    date_to: compact($('#dateTo')?.value) || null,
    exact_match: Boolean($('#exactMatchToggle')?.checked),
    alias_count: aliases.length,
    amount_min_present: compact($('#amountMin')?.value) !== '',
    amount_max_present: compact($('#amountMax')?.value) !== '',
    practice_mode: document.documentElement.dataset.givingPractice === 'true',
    query_identity_redacted: true,
    raw_records_included: false,
    donor_identity_included: false,
    authority_effect: 'NONE'
  });
}

function snapshot() {
  const cards = $$('.source-run-card');
  const states = cards.map((card) => ({
    source_id: card.querySelector('[data-source-retry]')?.dataset.sourceRetry || card.querySelector('[data-source-continue]')?.dataset.sourceContinue || card.querySelector('.source-run-head strong')?.textContent?.trim() || 'unknown',
    label: card.querySelector('.source-run-head strong')?.textContent?.trim() || 'source',
    status: String(card.dataset.status || '').toUpperCase()
  }));
  const held = states.filter((item) => ['PARTIAL', 'FAILED', 'ERROR', 'DRIFTED', 'UNAVAILABLE', 'CANCELLED'].includes(item.status));
  return {
    states,
    held,
    status: held.length ? 'HELD' : states.length && states.every((item) => item.status === 'COMPLETE') ? 'COMPLETE' : 'UNRESOLVED'
  };
}

function clearWatch() {
  observer?.disconnect();
  observer = null;
  clearTimeout(timer);
  timer = null;
}

function settleDetail(current, { heldByObserver = false } = {}) {
  return {
    schema: 'td613.giving.run-settled/v1',
    cycle_id: active.cycle_id,
    submitted_at: active.submitted_at,
    settled_at: new Date().toISOString(),
    status: heldByObserver ? 'HELD' : current.status,
    source_states: current.states,
    held_sources: heldByObserver
      ? (current.held.length ? current.held : [{ source_id: 'client-observer', label: 'Client observer', status: 'HELD' }])
      : current.held,
    observation_aperture: active.observation_aperture,
    ...(heldByObserver ? { client_error: 'Search run did not expose a terminal UI state within the bounded observation window.' } : {})
  };
}

function maybeSettle() {
  if (!active) return;
  const run = $('#runSearchButton');
  if (!run) return;
  if (run.disabled) active.saw_running = true;
  const current = snapshot();
  const cardsTerminal = current.states.length > 0 && current.states.every((item) => terminalStatus(item.status));
  if (!active.saw_running || run.disabled || !cardsTerminal) return;
  const detail = settleDetail(current);
  clearWatch();
  active = null;
  document.dispatchEvent(new CustomEvent('td613:giving-run-settled', { detail }));
}

function beginCycle() {
  clearWatch();
  cycle += 1;
  active = {
    cycle_id: `giving-run-${cycle}`,
    submitted_at: new Date().toISOString(),
    saw_running: Boolean($('#runSearchButton')?.disabled),
    observation_aperture: observationAperture()
  };
  observer = new MutationObserver(maybeSettle);
  const run = $('#runSearchButton');
  const progress = $('#sourceProgress');
  if (run) observer.observe(run, { attributes: true, attributeFilter: ['disabled'] });
  if (progress) observer.observe(progress, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-status'] });
  timer = setTimeout(() => {
    if (!active) return;
    const current = snapshot();
    const detail = settleDetail(current, { heldByObserver: true });
    clearWatch();
    active = null;
    document.dispatchEvent(new CustomEvent('td613:giving-run-settled', { detail }));
  }, 190000);
  queueMicrotask(maybeSettle);
}

function install() {
  const form = $('#searchForm');
  if (!form || form.dataset.runSettledBound === 'true') return;
  form.dataset.runSettledBound = 'true';
  form.addEventListener('submit', beginCycle, { capture: true });
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
else install();

export const _givingRunSettled = Object.freeze({
  observationAperture,
  selectedSourceIds
});