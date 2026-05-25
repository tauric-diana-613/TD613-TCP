export const HUSH_PR80_REMOTE_EMPTY_FALLBACK_VERSION = 'pr80-remote-empty-candidate-fallback';

const $ = (id, doc = document) => doc.getElementById(id);
const clean = (value) => String(value ?? '').trim();
let fallbackInFlight = false;
let fallbackCount = 0;

function surfaceText(doc = document) {
  return [
    $('hushGeneratorStatus', doc)?.textContent || '',
    $('acceptWarning', doc)?.textContent || '',
    $('hushPhase32Diagnostics', doc)?.textContent || ''
  ].join('\n');
}

function setStatus(message = '', tone = 'warn', doc = document) {
  const status = $('hushGeneratorStatus', doc);
  if (!status) return;
  status.dataset.tone = tone;
  status.textContent = message;
}

function needsRemoteFallback(doc = document) {
  const output = clean($('protectedOutputInput', doc)?.value || '');
  if (output) return false;
  const text = surfaceText(doc);
  return /remote-provider-empty-candidates|provider-returned-invalid-json|No approved candidate was produced|Candidate approval blocked/i.test(text);
}

function nextFallbackMode(current = '') {
  if (current === 'remote-llm-proxy') return 'hybrid';
  if (current === 'hybrid') return 'offline-expressive';
  return '';
}

function tryFallback(doc = document) {
  if (fallbackInFlight || fallbackCount >= 2 || !needsRemoteFallback(doc)) return false;
  const select = $('hushGeneratorMode', doc);
  const button = $('generateMaskedOutputBtn', doc);
  if (!select || !button) return false;
  const mode = nextFallbackMode(select.value || 'remote-llm-proxy');
  if (!mode) return false;
  fallbackInFlight = true;
  fallbackCount += 1;
  select.value = mode;
  select.dispatchEvent(new Event('change', { bubbles: true }));
  setStatus(`Remote candidate route returned no releasable output. Retrying with ${mode}.`, 'warn', doc);
  if (typeof window !== 'undefined') {
    window.__TD613_HUSH_REMOTE_EMPTY_FALLBACK__ = {
      version: HUSH_PR80_REMOTE_EMPTY_FALLBACK_VERSION,
      fallbackCount,
      mode,
      appliedAt: new Date().toISOString(),
      reason: 'remote-empty-candidates-or-no-approved-candidate'
    };
  }
  window.setTimeout(() => {
    button.click();
    window.setTimeout(() => { fallbackInFlight = false; }, 1600);
  }, 80);
  return true;
}

function bind(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench' || doc.body.dataset.hushPr80 === 'true') return;
  doc.body.dataset.hushPr80 = 'true';
  const button = $('generateMaskedOutputBtn', doc);
  if (!button) return;
  button.addEventListener('click', () => {
    [1800, 3600, 6200].forEach((delay) => window.setTimeout(() => tryFallback(doc), delay));
  }, false);
}

if (typeof document !== 'undefined') {
  const run = () => bind(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [240, 900, 1800].forEach((delay) => window.setTimeout(run, delay));
}
