(function () {
  'use strict';

  var VERSION = 'pr94.1-analysis-surface-debouncer';
  var lastAnalyzeSource = '';
  var rerenderTimer = 0;

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value); }
  function trim(value) { return text(value).trim(); }
  function clearTimer() {
    if (rerenderTimer) window.clearTimeout(rerenderTimer);
    rerenderTimer = 0;
  }

  function lockSurfaces() {
    var profile = $('messageDraftProfile');
    var suggested = $('hushSuggestedMasksPanel');
    if (profile) profile.dataset.pr94Locked = 'true';
    if (suggested) suggested.dataset.pr94Locked = 'true';
  }

  function unlockSurfaces() {
    var profile = $('messageDraftProfile');
    var suggested = $('hushSuggestedMasksPanel');
    if (profile) profile.dataset.pr94Locked = 'false';
    if (suggested) suggested.dataset.pr94Locked = 'false';
  }

  function renderOnce() {
    var input = $('messageDraftInput');
    var source = input ? input.value : '';
    if (!trim(source) || source !== lastAnalyzeSource) return;
    lockSurfaces();
    try {
      if (window.TD613_HUSH_PR92 && typeof window.TD613_HUSH_PR92.arm === 'function') window.TD613_HUSH_PR92.arm();
      if (window.TD613_HUSH_PR93 && typeof window.TD613_HUSH_PR93.render === 'function') window.TD613_HUSH_PR93.render();
    } finally {
      window.setTimeout(unlockSurfaces, 160);
    }
  }

  function scheduleOneRender() {
    clearTimer();
    rerenderTimer = window.setTimeout(renderOnce, 180);
  }

  function installStyle() {
    if ($('hushPr94AnalysisDebouncerStyle')) return;
    var style = document.createElement('style');
    style.id = 'hushPr94AnalysisDebouncerStyle';
    style.textContent = [
      '#messageDraftProfile[data-pr94-locked="true"]{contain:layout paint!important;}',
      '#hushSuggestedMasksPanel[data-pr94-locked="true"]{contain:layout paint!important;}',
      'body[data-pr94-analyzing="true"] #hushSuggestedMasksPanel{min-height:10rem!important;visibility:hidden!important;}',
      'body[data-pr94-analyzing="false"] #hushSuggestedMasksPanel{visibility:visible!important;}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function boot() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    if (document.body.dataset.pr94AnalysisDebouncer === 'true') return;
    document.body.dataset.pr94AnalysisDebouncer = 'true';
    installStyle();
    document.addEventListener('click', function (event) {
      var analyze = event.target && event.target.closest && event.target.closest('#analyzeOutputBtn');
      if (!analyze) return;
      lastAnalyzeSource = $('messageDraftInput') ? $('messageDraftInput').value : '';
      document.body.dataset.pr94Analyzing = 'true';
      lockSurfaces();
      scheduleOneRender();
      window.setTimeout(function () { document.body.dataset.pr94Analyzing = 'false'; unlockSurfaces(); }, 420);
    }, true);
    var input = $('messageDraftInput');
    if (input) input.addEventListener('input', function () {
      clearTimer();
      lastAnalyzeSource = '';
      document.body.dataset.pr94Analyzing = 'false';
      unlockSurfaces();
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
  window.TD613_HUSH_PR94 = { version: VERSION, renderOnce: renderOnce };
}());
