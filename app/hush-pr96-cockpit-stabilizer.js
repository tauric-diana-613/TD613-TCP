(function () {
  'use strict';

  var VERSION = 'pr96.1-cockpit-stabilizer';
  var analyzeTimer = 0;
  var analyzeSource = '';
  var pendingUntil = 0;

  function $(id) { return document.getElementById(id); }
  function txt(value) { return String(value == null ? '' : value); }
  function clean(value) { return txt(value).trim(); }

  function setStatus(message, tone) {
    var status = $('hushGeneratorStatus') || $('hushOutputStatusText');
    if (!status) return;
    status.dataset.tone = tone || 'info';
    status.textContent = message;
  }

  function clearWarning() {
    var warning = $('acceptWarning');
    if (!warning) return;
    warning.hidden = true;
    warning.textContent = '';
  }

  function quietPending() {
    var output = $('protectedOutputInput');
    if (output && clean(output.value)) return;
    if (Date.now() <= pendingUntil) {
      clearWarning();
      setStatus('Generating mask output…', 'info');
      window.setTimeout(quietPending, 750);
      return;
    }
    clearWarning();
    setStatus('Still waiting for an approved generator candidate…', 'info');
  }

  function beginPending() {
    pendingUntil = Date.now() + 45000;
    var output = $('protectedOutputInput');
    if (output) {
      output.value = '';
      output.dispatchEvent(new Event('input', { bubbles: true }));
    }
    clearWarning();
    setStatus('Generating mask output…', 'info');
    window.setTimeout(quietPending, 650);
  }

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
    if (document.body.dataset.pr96CockpitStabilizer === 'true') return;
    document.body.dataset.pr96CockpitStabilizer = 'true';
    installStyle();
    document.addEventListener('click', function (event) {
      if (event.target && event.target.closest && event.target.closest('#analyzeOutputBtn')) beginAnalyze();
      if (event.target && event.target.closest && event.target.closest('#generateMaskedOutputBtn')) beginPending();
    }, true);
    var output = $('protectedOutputInput');
    if (output) output.addEventListener('input', function () { if (clean(output.value)) pendingUntil = 0; }, true);
    var input = $('messageDraftInput');
    if (input) input.addEventListener('input', function () { if (analyzeTimer) window.clearTimeout(analyzeTimer); document.body.dataset.pr96Analyzing = 'false'; }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
  window.TD613_HUSH_PR96 = { version: VERSION, beginAnalyze: beginAnalyze, beginPending: beginPending };
}());
