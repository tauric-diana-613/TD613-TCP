export const HUSH_PR78_RUNTIME_TRACE_VERSION = 'pr78-runtime-trace-panel';

const MAX_ROWS = 24;
const rows = [];
const safe = (value) => String(value ?? '').slice(0, 900);

function add(row = {}) {
  const entry = { time: new Date().toISOString(), ...row };
  rows.unshift(entry);
  rows.splice(MAX_ROWS);
  render();
  if (typeof window !== 'undefined') window.__TD613_HUSH_RUNTIME_TRACE__ = { version: HUSH_PR78_RUNTIME_TRACE_VERSION, rows, latest: rows[0] || null };
}

function ensurePanel() {
  if (typeof document === 'undefined' || !document.body || document.body.dataset.pageKind !== 'adversarial-bench') return null;
  let panel = document.getElementById('hushRuntimeTracePanel');
  if (panel) return panel;
  panel = document.createElement('details');
  panel.id = 'hushRuntimeTracePanel';
  panel.className = 'hush-warning-panel hush-runtime-trace-panel';
  panel.innerHTML = '<summary><span>Runtime Trace</span><span id="hushRuntimeTraceCount">0 events</span></summary><div id="hushRuntimeTraceBody" class="hush-runtime-trace-body">Quiet.</div>';
  const anchor = document.getElementById('hushSwapWarningsPanel') || document.getElementById('acceptWarning') || document.querySelector('.hush-vault-stack') || document.body;
  if (anchor === document.body) document.body.appendChild(panel);
  else anchor.insertAdjacentElement('afterend', panel);
  return panel;
}

function render() {
  const panel = ensurePanel();
  if (!panel) return;
  const count = document.getElementById('hushRuntimeTraceCount');
  const body = document.getElementById('hushRuntimeTraceBody');
  if (count) count.textContent = `${rows.length} event${rows.length === 1 ? '' : 's'}`;
  if (!body) return;
  body.innerHTML = rows.length ? rows.map((row) => `<article class="hush-runtime-trace-row"><strong>${safe(row.kind || 'event')}</strong><code>${safe(row.message || row.url || '')}</code><span>${safe(row.time || '')}</span></article>`).join('') : 'Quiet.';
}

function patchFetch() {
  if (typeof window === 'undefined' || window.__TD613_HUSH_FETCH_PATCHED__) return;
  const original = window.fetch?.bind(window);
  if (!original) return;
  window.__TD613_HUSH_FETCH_PATCHED__ = true;
  window.fetch = async (...args) => {
    const url = String(args[0]?.url || args[0] || '');
    try {
      const response = await original(...args);
      if (/hush-generate|api\//i.test(url) && !response.ok) add({ kind: 'fetch-failed', url, message: `${response.status} ${response.statusText || ''}` });
      return response;
    } catch (error) {
      if (/hush-generate|api\//i.test(url)) add({ kind: 'fetch-exception', url, message: error?.message || String(error) });
      throw error;
    }
  };
}

function bind() {
  if (typeof document === 'undefined' || !document.body || document.body.dataset.pageKind !== 'adversarial-bench' || document.body.dataset.hushPr78 === 'true') return;
  document.body.dataset.hushPr78 = 'true';
  ensurePanel();
  patchFetch();
  window.addEventListener('error', (event) => add({ kind: 'runtime-error', message: `${event.message || 'error'} @ ${event.filename || ''}:${event.lineno || ''}:${event.colno || ''}` }));
  window.addEventListener('unhandledrejection', (event) => add({ kind: 'unhandled-rejection', message: event.reason?.message || String(event.reason || 'unknown rejection') }));
  document.addEventListener('click', (event) => {
    if (event.target?.closest?.('#generateMaskedOutputBtn')) add({ kind: 'operator-transform', message: 'Transform button pressed' });
    if (event.target?.closest?.('#analyzeOutputBtn')) add({ kind: 'operator-analyze', message: 'Analyze button pressed' });
  }, true);
  add({ kind: 'trace-ready', message: 'Runtime trace installed' });
}

if (typeof document !== 'undefined') {
  const run = () => bind();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [240, 720, 1400].forEach((delay) => window.setTimeout(run, delay));
}
