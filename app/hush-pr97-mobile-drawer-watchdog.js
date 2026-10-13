(function () {
  'use strict';

  var VERSION = 'pr97.2-mobile-drawer-css-only-no-generator-watchdog';

  function $(id) { return document.getElementById(id); }

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
    if (document.body.dataset.pr97MobileDrawerWatchdog === VERSION) return;
    document.body.dataset.pr97MobileDrawerWatchdog = VERSION;
    installStyle();
    window.__TD613_HUSH_GENERATOR_WATCHDOG__ = {
      version: VERSION,
      status: 'disabled-css-only',
      reason: 'PR97 generator timeout watchdog disabled because it misclassified every mask/message as timeout.'
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
  window.setTimeout(boot, 500);
  window.TD613_HUSH_PR97 = { version: VERSION, startWatchdog: function () {}, attemptRescue: function () {} };
}());
