export const HUSH_PR90_STABILITY_VERSION = 'pr90.1-profile-transform-stability';

const $ = (id, doc = document) => doc.getElementById(id);
const tokens = (value = '') => String(value || '').toLowerCase().match(/[a-z0-9][a-z0-9'-]*/g) || [];
const norm = (value = '') => tokens(value).join(' ');

function installStyle(doc = document) {
  if ($('hushPr90StabilityStyle', doc)) return;
  const style = doc.createElement('style');
  style.id = 'hushPr90StabilityStyle';
  style.textContent = `
    body[data-page-kind="adversarial-bench"][data-hush-pr76-analyzed="true"] #messageDraftProfile[data-pr90-holding="true"]{display:block!important;min-height:12rem!important;visibility:hidden!important;overflow:hidden!important;}
    body[data-page-kind="adversarial-bench"][data-hush-pr76-analyzed="true"] #messageDraftProfile[data-pr90-ready="true"]{display:block!important;visibility:visible!important;}
    body[data-page-kind="adversarial-bench"] #messageDraftProfile[data-pr90-empty="true"]{display:none!important;height:0!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important;}
  `;
  doc.head.appendChild(style);
}

function syncProfileState(doc = document) {
  const host = $('messageDraftProfile', doc);
  const input = $('messageDraftInput', doc);
  if (!host || !input) return;
  const analyzed = doc.body?.dataset.hushPr76Analyzed === 'true';
  const hasSource = Boolean(String(input.value || '').trim());
  const hasPanel = Boolean(host.querySelector('.hush-source-profile-panel'));
  host.dataset.pr90Empty = (!hasSource || !analyzed) ? 'true' : 'false';
  host.dataset.pr90Ready = (hasSource && analyzed && hasPanel) ? 'true' : 'false';
  host.dataset.pr90Holding = (hasSource && analyzed && !hasPanel) ? 'true' : 'false';
}

function setStatus(doc = document, message = '', tone = 'info') {
  const status = $('hushGeneratorStatus', doc);
  if (!status) return;
  status.dataset.tone = tone;
  status.textContent = message;
}

function blankOutput(doc = document) {
  const output = $('protectedOutputInput', doc);
  if (!output) return;
  output.value = '';
  output.dispatchEvent(new Event('input', { bubbles: true }));
}

function monitorTransform(doc = document, sourceNorm = '', stopAt = Date.now() + 15000) {
  const output = $('protectedOutputInput', doc);
  if (!output || !sourceNorm) return;
  const currentNorm = norm(output.value || '');
  const warningText = $('acceptWarning', doc)?.textContent || '';
  if (currentNorm && currentNorm === sourceNorm) {
    blankOutput(doc);
    setStatus(doc, 'Generating mask output…', 'info');
  } else if (currentNorm && currentNorm !== sourceNorm) {
    return;
  } else if (/Candidate approval blocked|all-candidates-copied-source|selector_no_approved_candidate|no candidate available/i.test(warningText)) {
    blankOutput(doc);
    setStatus(doc, 'No approved generator candidate was available. Output remains blank; inspect Phase 37 diagnostics or change generator/mask/source.', 'error');
    return;
  }
  if (Date.now() < stopAt) window.setTimeout(() => monitorTransform(doc, sourceNorm, stopAt), 350);
}

function boot(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench') return;
  if (doc.body.dataset.hushPr90Stability === 'true') return;
  doc.body.dataset.hushPr90Stability = 'true';
  installStyle(doc);
  syncProfileState(doc);
  const profile = $('messageDraftProfile', doc);
  if (profile) new MutationObserver(() => syncProfileState(doc)).observe(profile, { childList: true, subtree: true, characterData: true });
  const input = $('messageDraftInput', doc);
  if (input) input.addEventListener('input', () => window.setTimeout(() => syncProfileState(doc), 0), true);
  doc.addEventListener('click', (event) => {
    const target = event.target;
    if (target?.closest?.('#analyzeOutputBtn') || target?.closest?.('[data-hush-use-mask]')) {
      [0, 40, 120, 260, 520, 900].forEach((delay) => window.setTimeout(() => syncProfileState(doc), delay));
    }
    if (target?.closest?.('#generateMaskedOutputBtn')) {
      const sourceNorm = norm($('messageDraftInput', doc)?.value || '');
      blankOutput(doc);
      setStatus(doc, 'Generating mask output…', 'info');
      window.setTimeout(() => monitorTransform(doc, sourceNorm), 80);
    }
  }, true);
}

if (typeof document !== 'undefined') {
  const run = () => boot(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  window.setTimeout(run, 500);
}
