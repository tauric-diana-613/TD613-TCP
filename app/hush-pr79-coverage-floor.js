export const HUSH_PR79_COVERAGE_FLOOR_VERSION = 'pr79-coverage-floor';

const $ = (id, doc = document) => doc.getElementById(id);
const clean = (value) => String(value ?? '').trim();

function softenLine(line = '') {
  return clean(line)
    .replace(/^That’s sounds\b/i, 'That sounds')
    .replace(/^Thats sounds\b/i, 'That sounds')
    .replace(/\bas like\b/gi, 'like')
    .replace(/\bgives it to other people\b/gi, 'gives them to other people')
    .replace(/\bI thought, epistemically, maybe it came from you\b/i, 'I wondered, epistemically, whether it maybe came from you')
    .replace(/\s+/g, ' ')
    .trim();
}

function sourcePreservingDraft(source = '') {
  const lines = clean(source).split(/\n+/).map(softenLine).filter(Boolean);
  return lines.join('\n\n');
}

function setStatus(message = '', doc = document) {
  const status = $('hushGeneratorStatus', doc);
  if (status) {
    status.dataset.tone = 'warn';
    status.textContent = message;
  }
  const warning = $('acceptWarning', doc);
  if (warning) {
    warning.hidden = false;
    warning.textContent = message;
  }
  const accept = $('acceptOutputBtn', doc);
  if (accept) accept.disabled = true;
}

function maybeApplyCoverageFloor(doc = document) {
  const input = $('messageDraftInput', doc);
  const output = $('protectedOutputInput', doc);
  if (!input || !output || clean(output.value)) return;
  const draft = sourcePreservingDraft(input.value);
  if (!draft) return;
  output.value = draft;
  output.dispatchEvent(new Event('input', { bubbles: true }));
  setStatus('Coverage floor used: selector returned no approved candidate, so Hush preserved every source unit. Review/edit, then hit Analyze before Accept.', doc);
  if (typeof window !== 'undefined') {
    window.__TD613_HUSH_COVERAGE_FLOOR__ = {
      version: HUSH_PR79_COVERAGE_FLOOR_VERSION,
      appliedAt: new Date().toISOString(),
      sourceChars: clean(input.value).length,
      outputChars: clean(output.value).length
    };
  }
}

function bind(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench' || doc.body.dataset.hushPr79 === 'true') return;
  doc.body.dataset.hushPr79 = 'true';
  const transform = $('generateMaskedOutputBtn', doc);
  if (!transform) return;
  transform.addEventListener('click', () => {
    [900, 1800, 3200, 5200].forEach((delay) => window.setTimeout(() => maybeApplyCoverageFloor(doc), delay));
  }, true);
}

if (typeof document !== 'undefined') {
  const run = () => bind(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [240, 900, 1800].forEach((delay) => window.setTimeout(run, delay));
}
