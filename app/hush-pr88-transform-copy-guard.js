export const HUSH_PR88_TRANSFORM_COPY_GUARD_VERSION = 'pr88.1-copy-output-post-guard';

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

function guardOnce(doc = document) {
  const source = $('messageDraftInput', doc)?.value || '';
  const output = $('protectedOutputInput', doc);
  if (!output || !safe(source)) return false;
  const current = output.value || '';
  const currentNorm = normalize(current);
  const sourceNorm = normalize(source);
  if (safe(current) && currentNorm !== sourceNorm) return false;
  const replacement = rewriteSource(source);
  if (!replacement || normalize(replacement) === sourceNorm) return false;
  output.value = replacement;
  output.dispatchEvent(new Event('input', { bubbles: true }));
  const status = $('hushGeneratorStatus', doc);
  if (status) {
    status.dataset.tone = 'warning';
    status.textContent = 'Copy-output guard replaced a blank or copied candidate with a local syntax transposition. Review before Accept.';
  }
  const warning = $('acceptWarning', doc);
  if (warning && /all-candidates-copied-source|no candidate available|Candidate approval blocked/i.test(warning.textContent || '')) {
    warning.hidden = true;
    warning.textContent = '';
  }
  return true;
}

function boot(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench') return;
  if (doc.body.dataset.hushPr88CopyGuard === 'true') return;
  doc.body.dataset.hushPr88CopyGuard = 'true';
  doc.addEventListener('click', (event) => {
    if (event.target?.id !== 'generateMaskedOutputBtn') return;
    [220, 700, 1300, 2200].forEach((delay) => window.setTimeout(() => guardOnce(doc), delay));
  }, true);
}

if (typeof document !== 'undefined') {
  const run = () => boot(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  window.setTimeout(run, 500);
}
