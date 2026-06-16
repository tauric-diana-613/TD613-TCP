const VERSION = 'hush-pr76-stable-profile-host/v1-no-flicker';
const $ = (id, doc = document) => doc.getElementById(id);
let observer = null;
let activeSignature = '';
let rendering = false;

function sourceText(doc = document) {
  return String($('messageDraftInput', doc)?.value || '').trim();
}

function installStyle(doc = document) {
  if ($('hushPr76StableProfileHostStyle', doc)) return;
  const style = doc.createElement('style');
  style.id = 'hushPr76StableProfileHostStyle';
  style.textContent = `
    body[data-page-kind="adversarial-bench"] #hushPr76AuthorshipProfileHost[hidden] { display: none !important; }
    body[data-page-kind="adversarial-bench"] #hushPr76AuthorshipProfileHost {
      display: block !important;
      margin: .38rem 0 .58rem !important;
    }
    body[data-page-kind="adversarial-bench"][data-hush-pr76-stable-profile="true"] #messageDraftProfile {
      display: none !important;
      min-height: 0 !important;
      height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
    body[data-page-kind="adversarial-bench"] #hushPr76AuthorshipProfileHost .hush-pr76-profile-panel {
      margin-top: 0 !important;
      margin-bottom: 0 !important;
    }
  `;
  doc.head.appendChild(style);
}

function ensureHost(doc = document) {
  installStyle(doc);
  let host = $('hushPr76AuthorshipProfileHost', doc);
  if (host) return host;
  host = doc.createElement('section');
  host.id = 'hushPr76AuthorshipProfileHost';
  host.setAttribute('aria-label', 'Authorship profile host');
  host.hidden = true;
  const profile = $('messageDraftProfile', doc);
  const suggested = $('hushSuggestedMasksPanel', doc);
  const rail = $('hushInputControlRail', doc);
  const anchor = profile || rail || $('messageDraftInput', doc);
  if (profile) profile.insertAdjacentElement('afterend', host);
  else if (suggested) suggested.insertAdjacentElement('beforebegin', host);
  else if (anchor) anchor.insertAdjacentElement('afterend', host);
  else doc.body.appendChild(host);
  return host;
}

function hasStableProfile(doc = document) {
  return Boolean(doc.querySelector('#hushPr76AuthorshipProfileHost .hush-pr76-profile-panel'));
}

function moveRenderedProfile(doc = document) {
  const host = ensureHost(doc);
  const profile = $('messageDraftProfile', doc);
  const panel = profile?.querySelector?.('.hush-pr76-profile-panel');
  if (panel) host.appendChild(panel);
  if (host.querySelector('.hush-pr76-profile-panel')) {
    host.hidden = false;
    if (doc.body) doc.body.dataset.hushPr76StableProfile = 'true';
    return true;
  }
  return false;
}

function renderIntoStableHost(doc = document) {
  const source = sourceText(doc);
  if (!source || source !== activeSignature) return false;
  if (hasStableProfile(doc)) {
    const host = ensureHost(doc);
    host.hidden = false;
    if (doc.body) doc.body.dataset.hushPr76StableProfile = 'true';
    return true;
  }
  const api = window.__TD613_HUSH_PR76_LIGHT_PANELS__;
  if (!api || typeof api.render !== 'function' || rendering) return moveRenderedProfile(doc);
  rendering = true;
  try {
    api.render(doc);
  } finally {
    rendering = false;
  }
  return moveRenderedProfile(doc);
}

function scheduleStableRender(doc = document) {
  activeSignature = sourceText(doc);
  if (!activeSignature) return;
  [0, 40, 100, 220, 480, 900, 1500].forEach((delay) => {
    window.setTimeout(() => renderIntoStableHost(doc), delay);
  });
}

function deactivate(doc = document) {
  activeSignature = '';
  const host = $('hushPr76AuthorshipProfileHost', doc);
  if (host) { host.hidden = true; host.innerHTML = ''; }
  if (doc.body) doc.body.dataset.hushPr76StableProfile = 'false';
}

function bind(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench' || doc.body.dataset.hushPr76StableProfileHost === VERSION) return;
  doc.body.dataset.hushPr76StableProfileHost = VERSION;
  ensureHost(doc);

  const analyze = $('analyzeOutputBtn', doc);
  if (analyze) analyze.addEventListener('click', () => scheduleStableRender(doc));

  const input = $('messageDraftInput', doc);
  if (input) input.addEventListener('input', () => {
    if (sourceText(doc) !== activeSignature) deactivate(doc);
  });

  const profile = $('messageDraftProfile', doc);
  if (profile && !observer) {
    observer = new MutationObserver(() => {
      if (!activeSignature || sourceText(doc) !== activeSignature) return;
      window.setTimeout(() => renderIntoStableHost(doc), 20);
    });
    observer.observe(profile, { childList: true, subtree: true, characterData: true });
  }
}

if (typeof document !== 'undefined') {
  const run = () => bind(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [320, 920, 1800, 3200].forEach((delay) => window.setTimeout(run, delay));
}

window.__TD613_HUSH_PR76_STABLE_PROFILE_HOST__ = { version: VERSION, renderIntoStableHost, scheduleStableRender, deactivate };
