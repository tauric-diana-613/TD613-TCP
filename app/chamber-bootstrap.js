(function () {
  var V = window.TD613_ASSET_VERSIONS || {};
  var query = window.location.search || '';
  var hash = window.location.hash || '';
  var pageKind = document.body && document.body.getAttribute('data-page-kind');
  var needsRetrievalFixtures =
    /(?:[?&](?:test-flight|fixtures|retrieval-fixtures)=)/i.test(query) ||
    /(?:test-flight|retrieval-fixtures)/i.test(hash);

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
    var visualHref = './hush-visual-system.css?v=' + (V.hushVisualSystem || V.main || '');
    var existingVisual = document.querySelector('link[href^="./hush-visual-system.css"]');
    if (!existingVisual) {
      var visualLink = document.createElement('link');
      visualLink.rel = 'stylesheet';
      visualLink.href = visualHref;
      document.head.appendChild(visualLink);
    }
    var compactHref = './hush-compact.css?v=' + (V.hushCompact || V.main || '');
    var existingCompact = document.querySelector('link[href^="./hush-compact.css"]');
    if (!existingCompact) {
      var compactLink = document.createElement('link');
      compactLink.rel = 'stylesheet';
      compactLink.href = compactHref;
      document.head.appendChild(compactLink);
    }
    var invisibleHref = './hush-invisible.css?v=' + (V.hushInvisible || V.main || '');
    var existingInvisible = document.querySelector('link[href^="./hush-invisible.css"]');
    if (!existingInvisible) {
      var invisibleLink = document.createElement('link');
      invisibleLink.rel = 'stylesheet';
      invisibleLink.href = invisibleHref;
      document.head.appendChild(invisibleLink);
    }
    var alienHref = './hush-alien-console.css?v=' + (V.hushAlienConsole || V.main || '');
    var existingAlien = document.querySelector('link[href^="./hush-alien-console.css"]');
    if (!existingAlien) {
      var alienLink = document.createElement('link');
      alienLink.rel = 'stylesheet';
      alienLink.href = alienHref;
      document.head.appendChild(alienLink);
    }
    var fieldHref = './hush-field-instrument.css?v=' + (V.hushFieldInstrument || V.hushAlienConsole || V.main || '');
    var existingField = document.querySelector('link[href^="./hush-field-instrument.css"]');
    if (!existingField) {
      var fieldLink = document.createElement('link');
      fieldLink.rel = 'stylesheet';
      fieldLink.href = fieldHref;
      document.head.appendChild(fieldLink);
    }
    var mobileFixHref = './hush-mobile-viewport-fix.css?v=' + (V.hushMobileViewportFix || V.hushFieldInstrument || V.hushAlienConsole || V.main || '');
    var existingMobileFix = document.querySelector('link[href^="./hush-mobile-viewport-fix.css"]');
    if (!existingMobileFix) {
      var mobileFixLink = document.createElement('link');
      mobileFixLink.rel = 'stylesheet';
      mobileFixLink.href = mobileFixHref;
      document.head.appendChild(mobileFixLink);
    }
    var phase32Href = './hush-phase32.css?v=' + (V.hushPhase32 || V.main || '');
    var existingPhase32 = document.querySelector('link[href^="./hush-phase32.css"]');
    if (!existingPhase32) {
      var phase32Link = document.createElement('link');
      phase32Link.rel = 'stylesheet';
      phase32Link.href = phase32Href;
      document.head.appendChild(phase32Link);
    }
    var customizerBoot = document.createElement('script');
    customizerBoot.type = 'module';
    customizerBoot.src = './hush-customizer-card-fields-boot.js?v=' + (V.hushCustomizerCardFields || V.main || '');
    document.head.appendChild(customizerBoot);
    var phase32Boot = document.createElement('script');
    phase32Boot.type = 'module';
    phase32Boot.src = './hush-phase32.js?v=' + (V.hushPhase32 || V.main || '');
    document.head.appendChild(phase32Boot);
    var patch38Boot = document.createElement('script');
    patch38Boot.type = 'module';
    patch38Boot.src = './hush-patch38.js?v=' + (V.hushPatch38 || V.hushPhase32 || V.main || '');
    document.head.appendChild(patch38Boot);
    var pr75Boot = document.createElement('script');
    pr75Boot.type = 'module';
    pr75Boot.src = './hush-pr75-rescue.js?v=' + (V.hushPr75 || V.hushPatch38 || V.hushPhase32 || V.main || '');
    document.head.appendChild(pr75Boot);
    var pr76Boot = document.createElement('script');
    pr76Boot.type = 'module';
    pr76Boot.src = './hush-pr76-mask-recommender.js?v=' + (V.hushPr76 || V.hushPr75 || V.hushPatch38 || V.hushPhase32 || V.main || '');
    document.head.appendChild(pr76Boot);
    var pr77Boot = document.createElement('script');
    pr77Boot.type = 'module';
    pr77Boot.src = './hush-pr77-flight-controls.js?v=' + (V.hushPr77 || V.hushPr76 || V.hushPr75 || V.hushPatch38 || V.main || '');
    document.head.appendChild(pr77Boot);
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
  if (needsRetrievalFixtures) {
    srcs.splice(4, 0, './retrieval-fixtures.js?v=' + (V.fixtures || ''));
  }
  for (var i = 0; i < srcs.length; i++) {
    document.write('<script src="' + srcs[i] + '"><\/script>');
  }
}());