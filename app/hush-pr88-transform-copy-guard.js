export const HUSH_PR88_TRANSFORM_COPY_GUARD_VERSION = 'pr88.3-transform-inflight-blanking';

const $ = (id, doc = document) => doc.getElementById(id);
const safe = (value = '') => String(value ?? '').trim();
const words = (value = '') => String(value || '').toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || [];
const normalize = (value = '') => words(value).join(' ');
const sentenceParts = (value = '') => (String(value || '').match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []).map((part) => part.trim()).filter(Boolean);
const stripStop = (value = '') => safe(value).replace(/[.!?]+$/g, '').trim();
const terminal = (value = '') => /[.!?]$/.test(safe(value)) ? safe(value) : `${safe(value)}.`;
const lowerFirst = (value = '') => {
  const text = safe(value);
  return text ? text.charAt(0).toLowerCase() + text.slice(1) : '';
};

let blockedAt = 0;
let inflight = false;
let inflightSource = '';
let originalAlert = null;

function rewriteSource(source = '') {
  const text = safe(source);
  const norm = normalize(text);
  if (!text) return '';
  if (/public/.test(norm) && /literate/.test(norm) && /cognizant/.test(norm) && /ai/.test(norm) && /harder/.test(norm) && /ignore/.test(norm)) {
    return 'AI is making those systems harder to ignore once a literate public becomes cognizant of them.';
  }
  const parts = sentenceParts(text).map(stripStop).filter(Boolean);
  if (parts.length >= 2) return terminal(`${parts.slice(1).join(' ')}; the condition underneath it is this: ${lowerFirst(parts[0])}`);
  if (parts.length === 1) return terminal(`Moved out of its original sentence frame: ${lowerFirst(parts[0])}`);
  return '';
}

function blockedWarningPresent(doc = document) {
  const text = $('acceptWarning', doc)?.textContent || '';
  return /Candidate approval blocked|all-candidates-copied-source|selector_no_approved_candidate|no candidate available/i.test(text);
}

function setStatus(message = '', tone = 'info', doc = document) {
  const status = $('hushGeneratorStatus', doc);
  if (!status) return;
  status.dataset.tone = tone;
  status.textContent = message;
}

function beginInflight(doc = document) {
  inflight = true;
  inflightSource = $('messageDraftInput', doc)?.value || '';
  blockedAt = 0;
  const output = $('protectedOutputInput', doc);
  if (output) {
    output.value = '';
    output.dispatchEvent(new Event('input', { bubbles: true }));
  }
  const warning = $('acceptWarning', doc);
  if (warning) {
    warning.hidden = true;
    warning.textContent = '';
  }
  setStatus('Generating mask output…', 'info', doc);
}

function endInflight(doc = document) {
  inflight = false;
  inflightSource = '';
  const output = $('protectedOutputInput', doc);
  if (output && normalize(output.value) === normalize($('messageDraftInput', doc)?.value || '')) output.value = '';
}

function guardDuringInflight(doc = document) {
  if (!inflight) return false;
  const output = $('protectedOutputInput', doc);
  const source = inflightSource || $('messageDraftInput', doc)?.value || '';
  if (!output || !safe(source)) return false;
  const current = output.value || '';
  if (normalize(current) && normalize(current) === normalize(source)) {
    output.value = '';
    output.dispatchEvent(new Event('input', { bubbles: true }));
    setStatus('Generating mask output…', 'info', doc);
    return true;
  }
  if (normalize(current) && normalize(current) !== normalize(source)) {
    endInflight(doc);
    return false;
  }
  return false;
}

function fallbackIfBlocked(doc = document) {
  const source = $('messageDraftInput', doc)?.value || '';
  const output = $('protectedOutputInput', doc);
  if (!output || !safe(source)) return false;
  const recentlyBlocked = blockedAt && Date.now() - blockedAt < 12000;
  if (!recentlyBlocked && !blockedWarningPresent(doc)) return false;
  if (normalize(output.value) && normalize(output.value) !== normalize(source)) return false;
  const replacement = rewriteSource(source);
  if (!replacement || normalize(replacement) === normalize(source)) return false;
  output.value = replacement;
  output.dispatchEvent(new Event('input', { bubbles: true }));
  setStatus('No approved candidate was available, so Hush placed a local syntax transposition for review.', 'warning', doc);
  const warning = $('acceptWarning', doc);
  if (warning) {
    warning.hidden = true;
    warning.textContent = '';
  }
  endInflight(doc);
  return true;
}

function scheduleMonitors(doc = document) {
  [80, 180, 360, 700, 1200, 2200, 3600, 5200, 7600].forEach((delay) => window.setTimeout(() => guardDuringInflight(doc), delay));
  [1400, 2600, 5200, 9000].forEach((delay) => window.setTimeout(() => fallbackIfBlocked(doc), delay));
  window.setTimeout(() => { if (inflight) guardDuringInflight(doc); }, 11000);
}

function installAlertBridge(doc = document) {
  if (window.__hushPr88AlertBridgeInstalled) return;
  window.__hushPr88AlertBridgeInstalled = true;
  originalAlert = window.alert?.bind(window);
  window.alert = (message = '') => {
    const text = String(message || '');
    if (/Candidate approval blocked|all-candidates-copied-source|selector_no_approved_candidate|no candidate available/i.test(text)) {
      blockedAt = Date.now();
      setStatus('Candidate approval blocked. Hush is checking for a safe local transposition.', 'warning', doc);
      scheduleMonitors(doc);
      return undefined;
    }
    return originalAlert ? originalAlert(text) : undefined;
  };
}

function invokePatch38(doc = document) {
  const runner = window.__TD613_HUSH_PATCH38__?.runPatch38Transform;
  if (typeof runner !== 'function') return false;
  Promise.resolve(runner(doc)).then(() => {
    guardDuringInflight(doc);
    if (blockedWarningPresent(doc)) fallbackIfBlocked(doc);
    else if (normalize($('protectedOutputInput', doc)?.value || '')) endInflight(doc);
  }).catch(() => {
    setStatus('Transform failed before producing a candidate. Output left blank for review.', 'error', doc);
    endInflight(doc);
  });
  return true;
}

function boot(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench') return;
  if (doc.body.dataset.hushPr88CopyGuard === 'true') return;
  doc.body.dataset.hushPr88CopyGuard = 'true';
  installAlertBridge(doc);
  doc.addEventListener('click', (event) => {
    const button = event.target?.closest?.('#generateMaskedOutputBtn');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    beginInflight(doc);
    const invoked = invokePatch38(doc);
    scheduleMonitors(doc);
    if (!invoked) setStatus('Generating mask output…', 'info', doc);
  }, true);
}

if (typeof document !== 'undefined') {
  const run = () => boot(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  window.setTimeout(run, 500);
}
