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
    script.async = false;
    script.src = src;
    document.head.appendChild(script);
  }

  function installHushPhase31BindGuard() {
    if (window.__TD613_HUSH_PHASE31_BIND_GUARD__) return;
    window.__TD613_HUSH_PHASE31_BIND_GUARD__ = 'chamber-bootstrap/v3-boot-listener-only';
    var ids = {
      hushPhase31LogSampleBtn: { click: true },
      hushPhase31Undo: { click: true },
      hushPhase31SaveMaskBtn: { click: true },
      hushPhase31CancelSave: { click: true },
      hushPhase31AddToStudio: { click: true },
      hushPhase31ResetCustomizer: { click: true },
      hushVoiceReferenceSamplesSaved: { input: true }
    };
    var bootListenerPattern = /(logSample\(doc\)|undoSample\(doc\)|openSaveModal\(doc\)|addToStudio\(doc\)|resetCustomizer\(doc\)|updateWordCounter\(doc\)|modal\.hidden\s*=\s*true|input\.click\(\)|exportMask\(doc\))/;
    var originalAdd = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (type, listener, options) {
      try {
        var id = this && this.id;
        if (id && ids[id] && ids[id][type] && this.dataset) {
          var source = '';
          try { source = Function.prototype.toString.call(listener); } catch (error) { source = ''; }
          if (bootListenerPattern.test(source)) {
            var key = 'td613Phase31' + type.charAt(0).toUpperCase() + type.slice(1) + 'BootBound';
            if (this.dataset[key] === 'true') return;
            this.dataset[key] = 'true';
          }
        }
      } catch (error) {}
      return originalAdd.call(this, type, listener, options);
    };
  }

  if (pageKind === 'gateway') {
    appendStylesheet('./gateway-housekeeping.css', './gateway-housekeeping.css?v=' + (V.gatewayHousekeeping || V.chrome || V.main || ''));
    var gatewayHousekeepingStyle = document.createElement('style');
    gatewayHousekeepingStyle.id = 'td613-gateway-housekeeping-prune';
    gatewayHousekeepingStyle.textContent = '#gatewayDoorDeck,#gatewayDoorHomebase,#gatewayDoorReadout,#gatewayPreviewPhaseStatus{display:none!important}';
    document.head.appendChild(gatewayHousekeepingStyle);
    var installFlightDoor = function () {
      var rail = document.querySelector('.gateway-grid');
      if (!rail) return;
      var hush = document.getElementById('gatewayDoorHush');
      var harbor = document.getElementById('gatewayDoorHarbor');
      var trainer = document.getElementById('gatewayDoorTrainer');
      var readout = document.getElementById('gatewayDoorReadout');
      var openFull = document.getElementById('gatewayApertureOpenFull');
      var phaseStatus = document.getElementById('gatewayPreviewPhaseStatus');
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
      if (readout) readout.remove();
      if (phaseStatus) phaseStatus.remove();
      if (openFull) openFull.classList.add('gateway-aperture-open-top');
      [hush, flight, harbor, trainer].forEach(function (node) {
        if (node) rail.appendChild(node);
      });
      rail.setAttribute('data-phase32-visible-order', 'hush flight safe-harbor trainer');
      rail.setAttribute('data-gateway-housekeeping', 'pr125');
    };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installFlightDoor, { once: true });
    else installFlightDoor();
  }

  if (pageKind === 'adversarial-bench') {
    installHushPhase31BindGuard();
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
    appendModule('./hush-pr77-flight-controls.js?v=' + (V.hushPr77 || V.hushPatch38 || V.hushPhase32 || V.main || ''));
    appendModule('./hush-pr78-runtime-trace.js?v=' + (V.hushPr78 || V.hushPr77 || V.hushPatch38 || V.main || ''));
    appendModule('./hush-pr79-coverage-floor.js?v=' + (V.hushPr79 || V.hushPr78 || V.hushPatch38 || V.main || ''));
    appendModule('./hush-pr82-mobile-state-hotfix.js?v=' + (V.hushPr82 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr92-dom-owner.js?v=' + (V.hushPr92 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr93-mask-eligibility.js?v=' + (V.hushPr93 || V.hushPr92 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr94-analysis-debouncer.js?v=' + (V.hushPr94 || V.hushPr93 || V.hushPr92 || V.main || ''));
    appendScript('./hush-pr176-analysis-surface-stabilizer.js?v=' + (V.hushPr176 || V.hushPr94 || V.hushPr93 || V.hushPr92 || V.main || ''));
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
    appendScript('./hush-pr121-final-ui-surgery.js?v=' + (V.hushPr121 || V.hushPr120 || V.hushPr119 || V.hushPr118 || V.main || ''));
    appendScript('./hush-pr122-receipt-compactor.js?v=' + (V.hushPr122 || V.hushPr121 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr132-strict-endpoint-router.js?v=' + (V.hushPr132 || V.hushPr123 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr123-stable-transform.js?v=' + (V.hushPr123 || V.hushPr122 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr141-receipt-truth-normalizer.js?v=' + (V.hushPr141 || V.hushPr123 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr131-suppress-pr130-rescue-release.js?v=' + (V.hushPr131 || V.hushPr141 || V.hushPr123 || V.hushPatch38 || V.main || ''));
    appendScript('./hush-pr168-strict-transform-run-lock.js?v=202606122415');
  }

  appendScript('./tcp-copy-hygiene.js?v=' + (V.copyHygiene || V.chrome || V.main || '202606010455'));

  var srcs = [
    './td613-constants.js',
    './browser-data.js?v=' + (V.data || V.main || ''),
    './browser-diagnostics.js?v=' + (V.diagnostics || V.main || ''),
    './browser-engine.js?v=' + (V.engine || V.main || ''),
    './browser-main.js?v=' + (V.main || ''),
    './tcp-gateway-rescue.js?v=' + (V.gatewayRescue || V.main || '202606110235'),
    './chamber-chrome.js?v=' + (V.chrome || V.main || '')
  ];
  if (needsRetrievalFixtures) {
    srcs.splice(2, 0, './retrieval-fixtures.js?v=' + (V.fixtures || V.main || ''));
  }
  srcs.forEach(appendScript);
}());