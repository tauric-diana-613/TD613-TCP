const VERSION = 'hush-pr76-profile-hold/v2-stable-host-aware';
const $ = (id, doc = document) => doc.getElementById(id);
let observer = null;
let holding = false;
let lastAnalyzeAt = 0;

function sourceText(doc = document) {
  return String($('messageDraftInput', doc)?.value || '').trim();
}

function hasPr76Profile(doc = document) {
  return Boolean(doc.querySelector('#hushPr76AuthorshipProfileHost .hush-pr76-profile-panel') || doc.querySelector('#messageDraftProfile .hush-pr76-profile-panel'));
}

function restoreProfile(doc = document) {
  const stable = window.__TD613_HUSH_PR76_STABLE_PROFILE_HOST__;
  if (stable && typeof stable.renderIntoStableHost === 'function') return stable.renderIntoStableHost(doc);
  const api = window.__TD613_HUSH_PR76_LIGHT_PANELS__;
  if (!api || typeof api.render !== 'function') return false;
  if (!sourceText(doc)) return false;
  return api.render(doc) === true;
}

function scheduleHold(doc = document) {
  lastAnalyzeAt = Date.now();
  holding = true;
  const stable = window.__TD613_HUSH_PR76_STABLE_PROFILE_HOST__;
  if (stable && typeof stable.scheduleStableRender === 'function') stable.scheduleStableRender(doc);
  [0, 80, 180, 360, 720, 1200, 1900].forEach((delay) => {
    window.setTimeout(() => restoreProfile(doc), delay);
  });
  window.setTimeout(() => { holding = false; }, 2400);
}

function installObserver(doc = document) {
  const host = $('messageDraftProfile', doc);
  if (!host || observer) return;
  observer = new MutationObserver(() => {
    if (!holding && Date.now() - lastAnalyzeAt > 2600) return;
    if (!sourceText(doc) || hasPr76Profile(doc)) return;
    window.setTimeout(() => restoreProfile(doc), 30);
  });
  observer.observe(host, { childList: true, subtree: true, characterData: true });
}

function bind(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench' || doc.body.dataset.hushPr76ProfileHold === VERSION) return;
  doc.body.dataset.hushPr76ProfileHold = VERSION;
  installObserver(doc);
  const analyze = $('analyzeOutputBtn', doc);
  if (analyze) analyze.addEventListener('click', () => scheduleHold(doc));
}

if (typeof document !== 'undefined') {
  const run = () => bind(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [300, 900, 1800, 3200].forEach((delay) => window.setTimeout(run, delay));
}

window.__TD613_HUSH_PR76_PROFILE_HOLD__ = { version: VERSION, restoreProfile, scheduleHold };
