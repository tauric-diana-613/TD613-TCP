(function () {
  var V = window.TD613_ASSET_VERSIONS || {};
  var query = window.location.search || '';
  var hash = window.location.hash || '';
  var pageKind = document.body && document.body.getAttribute('data-page-kind');
  var needsRetrievalFixtures =
    /(?:[?&](?:test-flight|fixtures|retrieval-fixtures)=)/i.test(query) ||
    /(?:test-flight|retrieval-fixtures)/i.test(hash);

  function appendStylesheet(hrefPrefix, href) {
    if (document.querySelector('link[href^="' + hrefPrefix + '"]')) return;
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function appendModule(src) {
    var script = document.createElement('script');
    script.type = 'module';
    script.src = src;
    document.head.appendChild(script);
  }

  function appendScript(src) {
    if (document.querySelector('script[src^="' + src.split('?')[0] + '"]')) return;
    var script = document.createElement('script');
    script.src = src;
    document.head.appendChild(script);
  }

  if (pageKind === 'gateway') {
    var gatewayPhase32Style = document.createElement('style');
    gatewayPhase32Style.id = 'td613-gateway-phase32-prune';
    gatewayPhase32Style.textContent = '#gatewayDoorDeck,#gatewayDoorHomebase{display:none!important}';
    document.head.appendChild(gatewayPhase32Style);
    var installFlightDoor = function () {
      var rail = document.querySelector('.gateway-grid');
      if (!rail) return;
      var hush = document.getElementById('gatewayDoorHush');
      var harbor = document.getElementById('gatewayDoorHarbor');
      var trainer = document.getElementById('gatewayDoorTrainer');
      var readout = document.getElementById('gatewayDoorReadout');
      var flight = document.getElementById('gatewayDoorFlight');
      if (!flight) {
        flight = document.createElement('a');
        flight.id = 'gatewayDoorFlight';
        flight.className = 'gateway-card gateway-card-external';
        flight.href = './safe-harbor/td613-flight.html';
        flight.target = '_blank';
        flight.rel = 'noopener';
        flight.innerHTML = '<div class="gateway-card-kicker"><span class="glyph glyph-cyan" aria-hidden="true">&#x27D0;</span> Flight</div><h3>Seal cockpit</h3><p>Payload route. Prompt steering.</p>';
      }
      [hush, flight, harbor, trainer, readout].forEach(function (node) {
        if (node) rail.appendChild(node);
      });
      rail.setAttribute('data-phase32-visible-order', 'hush flight safe-harbor trainer readout');
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installFlightDoor, { once: true });
    else installFlightDoor();
  }

  if (pageKind === 'adversarial-bench') {
    appendStylesheet('./hush-visual-system.css', './hush-visual-system.css?v=' + (V.hushVisualSystem || V.main || ''));
    appendStylesheet('./hush-compact.css', './hush-compact.css?v=' + (V.hushCompact || V.main || ''));
    appendStylesheet('./hush-invisible.css', './hush-invisible.css?v=' + (V.hushInvisible || V.main || ''));
    appendStylesheet('./hush-alien-console.css', './hush-alien-console.css?v=' + (V.hushAlienConsole || V.main || ''));
    appendStylesheet('./hush-field-instrument.css', './hush-field-instrument.css?v=' + (V.hushFieldInstrument || V.hushAlienConsole || V.main || ''));
    appendStylesheet('./hush-mobile-viewport-fix.css', './hush-mobile-viewport-fix.css?v=' + (V.hushMobileViewportFix || V.hushFieldInstrument || V.hushAlienConsole || V.main || ''));
    appendStylesheet('./hush-phase32.css', './hush-phase32.css?v=' + (V.hushPhase32 || V.main || ''));

    appendScript('./hush-pr98-aperture-intake.js?v=' + (V.hushPr98 || V.hushPatch38 || V.main || ''));
    appendModule('./hush-customizer-card-fields-boot.js?v=' + (V.hushCustomizerCardFields || V.main || ''));
    appendModule('./hush-phase32.js?v=' + (V.hushPhase32 || V.main || ''));
    appendModule('./hush-patch38.js?v=' + (V.hushPatch38 || V.hushPhase32 || V.main || ''));
    appendModule('./hush-pr75-rescue.js?v=' + (V.hushPr75 || V.hushPatch38 || V.hushPhase32 || V.main || ''));
    appendModule('./hush-pr77-flight-controls.js?v=' + (V.hushPr77 || V.hushPatch38 || V.main || ''));
    appendModule('./hush-pr78-runtime-trace.js?v=' + (V.hushPr78 || V.hushPr77 || V.hushPatch38 || V.main || ''));
    appendModule('./hush-pr79-coverage-floor.js?v=' + (V.hushPr79 || V.hushPr78 || V.hushPatch38 || V.main || ''));
    appendModule('./hush-pr82-mobile-state-hotfix.js?v=' + (V.hushPr82 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr92-dom-owner.js?v=' + (V.hushPr92 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr93-mask-eligibility.js?v=' + (V.hushPr93 || V.hushPr92 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr94-analysis-debouncer.js?v=' + (V.hushPr94 || V.hushPr93 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr95-remote-rescue.js?v=' + (V.hushPr95 || V.hushPr94 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr96-cockpit-stabilizer.js?v=' + (V.hushPr96 || V.hushPr95 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr97-mobile-drawer-watchdog.js?v=' + (V.hushPr97 || V.hushPr96 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr104-rigor-amplifier.js?v=' + (V.hushPr104 || V.hushPr97 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr117-generating-watchdog-receipt.js?v=' + (V.hushPr117 || V.hushPr116 || V.hushPr115 || V.hushPr114 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr106-stylometry-ontology-release-guard.js?v=' + (V.hushPr106 || V.hushPr104 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr107-selector-recovery.js?v=' + (V.hushPr107 || V.hushPr106 || V.hushPatch38 || V.main || ''));
    appendModule('./hush-pr108-live-state-recovery-bridge.js?v=' + (V.hushPr108 || V.hushPr107 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr110-recovered-output-rehydrator.js?v=' + (V.hushPr110 || V.hushPr108 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr114-no-fallback-receipt.js?v=' + (V.hushPr114 || V.hushPr112 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr115-local-fallback-kill.js?v=' + (V.hushPr115 || V.hushPr114 || V.hushPr112 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr116-approval-alert-receipt.js?v=' + (V.hushPr116 || V.hushPr115 || V.hushPr114 || V.hushPr112 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr111-review-candidate-bridge.js?v=' + (V.hushPr111 || V.hushPr110 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr112-cadence-bridge.js?v=' + (V.hushPr112 || V.hushPr111 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr119-user-facing-ui-polish.js?v=' + (V.hushPr119 || V.hushPr118 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr120-ui-hotfix.js?v=' + (V.hushPr120 || V.hushPr119 || V.hushPr118 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr121-final-ui-surgery.js?v=' + (V.hushPr121 || V.hushPr120 || V.hushPr119 || V.hushPr118 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr122-receipt-compactor.js?v=' + (V.hushPr122 || V.hushPr121 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr123-stable-transform.js?v=' + (V.hushPr123 || V.hushPr122 || V.hushPatch38 || V.main || ''));
  }

  var srcs = [
    './td613-constants.js',
    './browser-data.js?v='        + (V.data        || ''),
    './browser-diagnostics.js?v=' + (V.diagnostics || ''),
    './browser-engine.js?v='      + (V.engine      || ''),
    './operator-receipt.js?v='    + (V.receipt     || ''),
    './browser-main.js?v='        + (V.main        || ''),
    './chamber-chrome.js?v='      + (V.chrome      || '')
  ];
  if (needsRetrievalFixtures) srcs.splice(4, 0, './retrieval-fixtures.js?v=' + (V.fixtures || ''));
  for (var i = 0; i < srcs.length; i++) document.write('<script src="' + srcs[i] + '"><\/script>');
}());