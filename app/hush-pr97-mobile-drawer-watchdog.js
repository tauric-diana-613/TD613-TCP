(function () {
  'use strict';

  var VERSION = 'pr97.1-mobile-custody-drawer-generator-watchdog';
  var watchdogTimer = 0;
  var rescueTimer = 0;
  var startedAt = 0;
  var rescueAttempted = false;

  function $(id) { return document.getElementById(id); }
  function text(value) { return String(value == null ? '' : value); }
  function clean(value) { return text(value).trim(); }

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

  function outputReady() {
    var output = $('protectedOutputInput');
    return Boolean(output && clean(output.value));
  }

  function clearTimers() {
    if (watchdogTimer) window.clearTimeout(watchdogTimer);
    if (rescueTimer) window.clearTimeout(rescueTimer);
    watchdogTimer = 0;
    rescueTimer = 0;
  }

  function attemptRescue() {
    if (outputReady()) return;
    if (rescueAttempted) return;
    rescueAttempted = true;
    clearWarning();
    setStatus('Generator is taking too long. Starting remote rescue route…', 'warning');
    if (window.TD613_HUSH_PR95 && typeof window.TD613_HUSH_PR95.remoteRescue === 'function') {
      window.TD613_HUSH_PR95.remoteRescue('pr97-watchdog-timeout-no-output');
    } else {
      setStatus('Generator watchdog fired, but remote rescue is not loaded yet.', 'error');
    }
  }

  function finalTimeout() {
    if (outputReady()) return;
    clearWarning();
    setStatus('Generator timed out before producing an approved candidate. Try another mask or check the remote API probe.', 'error');
    window.__TD613_HUSH_GENERATOR_WATCHDOG__ = {
      version: VERSION,
      status: 'timeout-no-output',
      startedAt: startedAt ? new Date(startedAt).toISOString() : null,
      endedAt: new Date().toISOString(),
      rescueAttempted: rescueAttempted,
      lastPr95: window.TD613_HUSH_PR95_LAST || null
    };
  }

  function startWatchdog() {
    clearTimers();
    startedAt = Date.now();
    rescueAttempted = false;
    clearWarning();
    setStatus('Generating mask output…', 'info');
    watchdogTimer = window.setTimeout(attemptRescue, 28000);
    rescueTimer = window.setTimeout(finalTimeout, 90000);
  }

  function installStyle() {
    if ($('hushPr97MobileDrawerWatchdogStyle')) return;
    var style = document.createElement('style');
    style.id = 'hushPr97MobileDrawerWatchdogStyle';
    style.textContent = [
      '@media(max-width:760px){',
      'body[data-page-kind="adversarial-bench"] .hush-vault-stack,',
      'body[data-page-kind="adversarial-bench"] .hush-vault-stack details,',
      'body[data-page-kind="adversarial-bench"] .hush-drawer-console,',
      'body[data-page-kind="adversarial-bench"] .hush-drawer-body,',
      'body[data-page-kind="adversarial-bench"] .hush-lab-grid,',
      'body[data-page-kind="adversarial-bench"] .hush-vault-grid,',
      'body[data-page-kind="adversarial-bench"] .hush-lab-panel{',
      '  inline-size:100%!important;',
      '  width:100%!important;',
      '  max-inline-size:100%!important;',
      '  max-width:100%!important;',
      '  min-inline-size:0!important;',
      '  min-width:0!important;',
      '}',
      'body[data-page-kind="adversarial-bench"] .hush-drawer-console{overflow:visible!important;}',
      'body[data-page-kind="adversarial-bench"] .hush-drawer-body{overflow-x:hidden!important;overflow-y:visible!important;}',
      'body[data-page-kind="adversarial-bench"] .hush-lab-panel{overflow:hidden!important;}',
      'body[data-page-kind="adversarial-bench"] .hush-lab-panel h3,',
      'body[data-page-kind="adversarial-bench"] .hush-lab-panel h4,',
      'body[data-page-kind="adversarial-bench"] .hush-lab-panel strong,',
      'body[data-page-kind="adversarial-bench"] .hush-drawer-body h3,',
      'body[data-page-kind="adversarial-bench"] .hush-drawer-body h4,',
      'body[data-page-kind="adversarial-bench"] .hush-drawer-body strong{',
      '  white-space:normal!important;',
      '  overflow-wrap:anywhere!important;',
      '  word-break:normal!important;',
      '  max-inline-size:100%!important;',
      '}',
      'body[data-page-kind="adversarial-bench"] .hush-drawer-console summary{',
      '  display:grid!important;',
      '  grid-template-columns:minmax(0,1fr) auto!important;',
      '  gap:.5rem!important;',
      '}',
      'body[data-page-kind="adversarial-bench"] .hush-drawer-console summary > *{min-width:0!important;}',
      'body[data-page-kind="adversarial-bench"] .recognition-field-controls{grid-template-columns:1fr!important;}',
      'body[data-page-kind="adversarial-bench"] .recognition-field-controls select{min-width:0!important;width:100%!important;}',
      '}',
      '@media(max-width:430px){',
      'body[data-page-kind="adversarial-bench"] .hush-drawer-body{padding:.62rem!important;}',
      'body[data-page-kind="adversarial-bench"] .hush-lab-panel{padding:.82rem!important;}',
      'body[data-page-kind="adversarial-bench"] .hush-lab-panel h3,',
      'body[data-page-kind="adversarial-bench"] .hush-lab-panel h4{font-size:clamp(1.05rem,6.4vw,1.6rem)!important;line-height:1.18!important;letter-spacing:.08em!important;}',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function boot() {
    if (!document.body || document.body.dataset.pageKind !== 'adversarial-bench') return;
    if (document.body.dataset.pr97MobileDrawerWatchdog === 'true') return;
    document.body.dataset.pr97MobileDrawerWatchdog = 'true';
    installStyle();
    document.addEventListener('click', function (event) {
      if (event.target && event.target.closest && event.target.closest('#generateMaskedOutputBtn')) startWatchdog();
    }, true);
    var output = $('protectedOutputInput');
    if (output) output.addEventListener('input', function () { if (outputReady()) clearTimers(); }, true);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
  window.TD613_HUSH_PR97 = { version: VERSION, startWatchdog: startWatchdog, attemptRescue: attemptRescue };
}());
