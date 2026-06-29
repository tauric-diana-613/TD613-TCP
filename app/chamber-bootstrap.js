(function () {
  var V = window.TD613_ASSET_VERSIONS || {};
  var query = window.location.search || '';
  var hash = window.location.hash || '';
  var pageKind = document.body && document.body.getAttribute('data-page-kind');
  var isFlightPage = /\/td613-flight\.html(?:$|[?#])/i.test(window.location.href) || /TD613 Flight/i.test(document.title || '');
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

  function installFlightOutputMicroControls() {
    if (!isFlightPage || document.getElementById('td613-flight-output-micro-controls')) return;
    var style = document.createElement('style');
    style.id = 'td613-flight-output-micro-controls';
    style.textContent = [
      '/* TD613 Flight: protect output authorship/payload micro-controls from page button normalization. */',
      '.output-card .status-bar{align-items:center!important;}',
      '.output-card .output-auth-toggle{display:inline-flex!important;align-items:center!important;justify-content:flex-end!important;gap:.28rem!important;width:auto!important;min-width:0!important;min-height:0!important;margin-left:auto!important;padding:.18rem .28rem .18rem .42rem!important;border:1px solid rgba(36,240,109,.22)!important;border-radius:14px!important;background:linear-gradient(90deg,rgba(36,240,109,.075),rgba(0,7,7,.58))!important;box-shadow:inset 0 0 0 1px rgba(120,247,255,.045)!important;clip-path:polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px))!important;color:rgba(190,255,223,.78)!important;font-family:var(--font-mono)!important;font-size:.48rem!important;line-height:1!important;letter-spacing:.08em!important;text-transform:uppercase!important;white-space:nowrap!important;}',
      '.output-card .output-auth-toggle input[type="checkbox"]{appearance:none!important;-webkit-appearance:none!important;display:inline-grid!important;place-content:center!important;width:.78rem!important;height:.78rem!important;min-width:.78rem!important;min-height:.78rem!important;margin:0!important;border:1px solid rgba(36,240,109,.58)!important;border-radius:0!important;background:rgba(0,7,7,.72)!important;box-shadow:inset 0 0 0 1px rgba(120,247,255,.08),0 0 14px rgba(36,240,109,.08)!important;clip-path:polygon(0 0,calc(100% - 5px) 0,100% 5px,100% 100%,5px 100%,0 calc(100% - 5px))!important;}',
      '.output-card .output-auth-toggle input[type="checkbox"]::before{content:""!important;width:.44rem!important;height:.44rem!important;transform:scale(0)!important;transition:transform .12s ease!important;background:var(--moss)!important;box-shadow:0 0 12px rgba(36,240,109,.45)!important;clip-path:polygon(14% 48%,35% 70%,84% 15%,96% 28%,36% 91%,2% 58%)!important;}',
      '.output-card .output-auth-toggle input[type="checkbox"]:checked::before{transform:scale(1)!important;}',
      '.output-card .status-bar .payload-stepper{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:auto!important;min-width:76px!important;max-width:104px!important;min-height:18px!important;height:18px!important;margin-left:auto!important;padding:1px 4px!important;gap:3px!important;border:1px solid rgba(120,247,255,.16)!important;border-radius:0!important;background:rgba(0,7,7,.48)!important;box-shadow:inset 0 0 0 1px rgba(36,240,109,.035)!important;clip-path:polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px))!important;transform:none!important;-webkit-transform:none!important;}',
      '.output-card .status-bar .payload-stepper-label,.output-card .status-bar .payload-stepper-value{font-family:var(--font-mono)!important;line-height:1!important;text-transform:uppercase!important;}',
      '.output-card .status-bar .payload-stepper-label{max-width:34px!important;color:var(--bone-dim)!important;font-size:5px!important;letter-spacing:.08em!important;}',
      '.output-card .status-bar .payload-stepper-value{min-width:1.05rem!important;text-align:center!important;color:var(--bone-bright)!important;font-size:7px!important;letter-spacing:.04em!important;}',
      '.output-card .status-bar .payload-stepper .payload-stepper-btn,.output-card .status-bar .payload-stepper .icon-btn{appearance:none!important;-webkit-appearance:none!important;display:inline-grid!important;place-items:center!important;width:14px!important;min-width:14px!important;max-width:14px!important;height:14px!important;min-height:14px!important;max-height:14px!important;padding:0!important;margin:0!important;border:1px solid rgba(36,240,109,.24)!important;border-radius:50%!important;background:rgba(0,3,3,.68)!important;box-shadow:inset 0 0 0 1px rgba(120,247,255,.05)!important;clip-path:none!important;color:var(--moss)!important;font-family:var(--font-mono)!important;font-size:8px!important;font-weight:700!important;line-height:1!important;letter-spacing:0!important;text-align:center!important;text-transform:none!important;}',
      '@media (max-width:820px){.output-card .status-bar{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;grid-template-areas:"counts auth" ". payload"!important;gap:4px 8px!important;align-items:center!important;}.output-card #statusCounts{grid-area:counts!important;}.output-card .output-auth-toggle{grid-area:auth!important;justify-self:end!important;margin-left:0!important;font-size:.48rem!important;padding:.2rem .26rem .2rem .42rem!important;}.output-card .status-bar .payload-stepper{grid-area:payload!important;justify-self:end!important;align-self:start!important;margin:-1px 0 0!important;}}'
    ].join('\n');
    document.head.appendChild(style);
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

  installFlightOutputMicroControls();

  if (pageKind === 'gateway') {
    appendStylesheet('./gateway-housekeeping.css', './gateway-housekeeping.css?v=' + (V.gatewayHousekeeping || V.chrome || V.main || ''));
    appendStylesheet('./gateway-aperture-desktop-align.css', './gateway-aperture-desktop-align.css?v=' + (V.gatewayApertureDesktopAlign || V.gatewayHousekeeping || V.main || ''));
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

  if (pageKind === 'trainer') {
    [
      './td613-constants.js',
      './browser-data.js?v=' + (V.data || V.main || ''),
      './browser-diagnostics.js?v=' + (V.diagnostics || V.main || ''),
      './browser-engine.js?v=' + (V.engine || V.main || ''),
      './operator-receipt.js?v=' + (V.receipt || V.main || ''),
      './trainer-standalone.js?v=' + (V.trainerStandalone || V.main || '202606162245')
    ].forEach(appendScript);
    return;
  }

  appendScript('./tcp-copy-hygiene.js?v=' + (V.copyHygiene || V.chrome || V.main || '202606010455'));

  var srcs = [
    './td613-constants.js',
    './browser-data.js?v=' + (V.data || V.main || ''),
    './browser-diagnostics.js?v=' + (V.diagnostics || V.main || ''),
    './browser-engine.js?v=' + (V.engine || V.main || ''),
    './operator-receipt.js?v=' + (V.receipt || V.main || ''),
    './browser-main.js?v=' + (V.main || ''),
    './tcp-gateway-rescue.js?v=' + (V.gatewayRescue || V.main || '202606110235'),
    './chamber-chrome.js?v=' + (V.chrome || V.main || '')
  ];
  if (needsRetrievalFixtures) {
    srcs.splice(2, 0, './retrieval-fixtures.js?v=' + (V.fixtures || V.main || ''));
  }
  srcs.forEach(appendScript);
}());
