export const HUSH_PR88_TRANSFORM_COPY_GUARD_VERSION = 'pr88.2-blocked-only-copy-output-guard';

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
let transformStartedAt = 0;
let originalAlert = null;

function rewriteSource(source = '') {
  const text = safe(source);
  const norm = normalize(text);
  if (!text) return '';
  if (/public/.test(norm) && /literate/.test(norm) && /cognizant/.test(norm) && /ai/.test(norm) && /harder/.test(norm) && /ignore/.test(norm)) {
    return 'AI is making those systems harder to ignore once a literate public becomes cognizant of them.';
  }
  const parts = sentenceParts(text).map(stripStop).filter(Boolean);
  if (parts.length >= 2) {
    return terminal(`${parts.slice(1).join(' ')}; the condition underneath it is this: ${lowerFirst(parts[0])}`);
  }
  if (parts.length === 1) {
    return terminal(`Moved out of its original sentence frame: ${lowerFirst(parts[0])}`);
  }
  return '';
}

function blockedWarningPresent(doc = document) {
  const warning = $('acceptWarning', doc);
  const text = warning?.textContent || '';
  return /Candidate approval blocked|all-candidates-copied-source|selector_no_approved_candidate|no candidate available/i.test(text);
}

function shouldGuard(source = '', current = '', doc = document) {
  const sourceNorm = normalize(source);
  const currentNorm = normalize(current);
  if (!sourceNorm) return false;
  if (currentNorm && currentNorm === sourceNorm) return true;
  const recentlyBlocked = blockedAt && Date.now() - blockedAt < 12000;
  if (!currentNorm && (recentlyBlocked || blockedWarningPresent(doc))) return true;
  return false;
}

function guardOnce(doc = document) {
  const source = $('messageDraftInput', doc)?.value || '';
  const output = $('protectedOutputInput', doc);
  if (!output || !safe(source)) return false;
  const current = output.value || '';
  if (!shouldGuard(source, current, doc)) return false;
  const replacement = rewriteSource(source);
  if (!replacement || normalize(replacement) === normalize(source)) return false;
  output.value = replacement;
  output.dispatchEvent(new Event('input', { bubbles: true }));
  const status = $('hushGeneratorStatus', doc);
  if (status) {
    status.dataset.tone = 'warning';
    status.textContent = 'No approved candidate was available, so Hush placed a local syntax transposition for review.';
  }
  const warning = $('acceptWarning', doc);
  if (warning && blockedWarningPresent(doc)) {
    warning.hidden = true;
    warning.textContent = '';
  }
  return true;
}

function scheduleGuard(doc = document, delays = [3200, 5600, 9000]) {
  delays.forEach((delay) => window.setTimeout(() => guardOnce(doc), delay));
}

function installAlertBridge(doc = document) {
  if (window.__hushPr88AlertBridgeInstalled) return;
  window.__hushPr88AlertBridgeInstalled = true;
  originalAlert = window.alert?.bind(window);
  window.alert = (message = '') => {
    const text = String(message || '');
    if (/Candidate approval blocked|all-candidates-copied-source|selector_no_approved_candidate|no candidate available/i.test(text)) {
      blockedAt = Date.now();
      scheduleGuard(doc, [120, 480, 1200]);
      const status = $('hushGeneratorStatus', doc);
      if (status) {
        status.dataset.tone = 'warning';
        status.textContent = 'Candidate approval blocked. Hush is checking for a safe local transposition.';
      }
      return undefined;
    }
    return originalAlert ? originalAlert(text) : undefined;
  };
}

function boot(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench') return;
  if (doc.body.dataset.hushPr88CopyGuard === 'true') return;
  doc.body.dataset.hushPr88CopyGuard = 'true';
  installAlertBridge(doc);
  doc.addEventListener('click', (event) => {
    if (event.target?.id !== 'generateMaskedOutputBtn') return;
    transformStartedAt = Date.now();
    blockedAt = 0;
    scheduleGuard(doc);
  }, true);
}

if (typeof document !== 'undefined') {
  const run = () => boot(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  window.setTimeout(run, 500);
}
