(function () {
  'use strict';

  var VERSION = 'pr176.1-analysis-surface-stabilizer';
  var releaseTimer = 0;
  var settleTimer = 0;

  function $(id) { return document.getElementById(id); }
  function setTitle() { try { document.title = 'TD613 Hush'; } catch (error) {} }
  function surfaceNodes() { return [$('messageDraftProfile'), $('hushSuggestedMasksPanel')].filter(Boolean); }

  function installStyle() {
    if ($('hushPr176AnalysisSurfaceStabilizerStyle')) return;
    var style = document.createElement('style');
    style.id = 'hushPr176AnalysisSurfaceStabilizerStyle';
    style.textContent = [
      'body[data-page-kind="adversarial-bench"][data-pr176-analysis-stabilizing="true"] #messageDraftProfile,body[data-page-kind="adversarial-bench"][data-pr176-analysis-stabilizing="true"] #hushSuggestedMasksPanel{visibility:hidden!important;contain:layout paint!important;}',
      'body[data-page-kind="adversarial-bench"][data-pr176-analysis-stabilizing="true"] #messageDraftProfile{min-height:clamp(12rem,34vh,16rem)!important;}',
      'body[data-page-kind="adversarial-bench"][data-pr176-analysis-stabilizing="true"] #hushSuggestedMasksPanel{min-height:10rem!important;}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function finalPass() {
    try {
      if (window.TD613_HUSH_PR92 && typeof window.TD613_HUSH_PR92.arm === 'function') window.TD613_HUSH_PR92.arm();
      if (window.TD613_HUSH_PR93 && typeof window.TD613_HUSH_PR93.render === 'function') window.TD613_HUSH_PR93.render();
    } catch (error) {}
  }

  function release() {
    if (!document.body) return;
    finalPass();
    document.body.dataset.pr176AnalysisStabilizing = 'false';
    surfaceNodes().forEach(function (node) { node.dataset.pr176Stabilizing = 'false'; });
  }

  function stabilize() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    setTitle();
    installStyle();
    window.clearTimeout(releaseTimer);
    window.clearTimeout(settleTimer);
    document.body.dataset.pr176AnalysisStabilizing = 'true';
    surfaceNodes().forEach(function (node) { node.dataset.pr176Stabilizing = 'true'; });
    settleTimer = window.setTimeout(finalPass, 1320);
    releaseTimer = window.setTimeout(release, 1520);
  }

  function boot() {
    setTitle();
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    if (document.body.dataset.pr176AnalysisSurfaceStabilizer === 'true') return;
    document.body.dataset.pr176AnalysisSurfaceStabilizer = 'true';
    installStyle();
    document.addEventListener('click', function (event) {
      var analyze = event.target && event.target.closest && event.target.closest('#analyzeOutputBtn');
      if (analyze) stabilize();
    }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
  window.TD613_HUSH_PR176 = { version: VERSION, stabilize: stabilize, release: release };
}());
