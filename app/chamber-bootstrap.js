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
    return;
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
