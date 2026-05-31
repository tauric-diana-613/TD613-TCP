(function () {
  'use strict';

  var VERSION = 'pr96.2-analyze-stabilizer-no-generator-wait-loop';
  var analyzeTimer = 0;
  var analyzeSource = '';

  function $(id) { return document.getElementById(id); }
  function txt(value) { return String(value == null ? '' : value); }
  function clean(value) { return txt(value).trim(); }

  function finishAnalyze() {
    document.body.dataset.pr96Analyzing = 'false';
    if (window.TD613_HUSH_PR92 && typeof window.TD613_HUSH_PR92.arm === 'function') window.TD613_HUSH_PR92.arm();
    if (window.TD613_HUSH_PR93 && typeof window.TD613_HUSH_PR93.render === 'function') window.TD613_HUSH_PR93.render();
  }

  function beginAnalyze() {
    analyzeSource = $('messageDraftInput') ? $('messageDraftInput').value : '';
    if (!clean(analyzeSource)) return;
    if (analyzeTimer) window.clearTimeout(analyzeTimer);
    document.body.dataset.pr96Analyzing = 'true';
    analyzeTimer = window.setTimeout(finishAnalyze, 1750);
  }

  function installStyle() {
    if ($('hushPr96CockpitStabilizerStyle')) return;
    var style = document.createElement('style');
    style.id = 'hushPr96CockpitStabilizerStyle';
    style.textContent = 'body[data-pr96-analyzing="true"] #hushSuggestedMasksPanel{visibility:hidden!important;opacity:0!important;pointer-events:none!important;min-height:10rem!important}body[data-pr96-analyzing="false"] #hushSuggestedMasksPanel{visibility:visible!important;opacity:1!important;pointer-events:auto!important}';
    document.head.appendChild(style);
  }

  function boot() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    if (document.body.dataset.pr96CockpitStabilizer === VERSION) return;
    document.body.dataset.pr96CockpitStabilizer = VERSION;
    installStyle();
    document.addEventListener('click', function (event) {
      if (event.target && event.target.closest && event.target.closest('#analyzeOutputBtn')) beginAnalyze();
    }, true);
    var input = $('messageDraftInput');
    if (input) input.addEventListener('input', function () {
      if (analyzeTimer) window.clearTimeout(analyzeTimer);
      document.body.dataset.pr96Analyzing = 'false';
    }, true);
    window.__TD613_HUSH_PR96_STATE__ = {
      version: VERSION,
      generatorWaitLoop: 'disabled',
      reason: 'Patch38/PR106 now own generator approval and hold states.'
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
  window.TD613_HUSH_PR96 = { version: VERSION, beginAnalyze: beginAnalyze, beginPending: function () {} };
}());
