(function () {
  function purgeRetiredDesktopVisibility() {
    var stale = document.querySelectorAll('link[href*="desktop-visibility-parity.css"]');
    for (var i = 0; i < stale.length; i++) {
      if (stale[i] && stale[i].parentNode) stale[i].parentNode.removeChild(stale[i]);
    }
  }

  purgeRetiredDesktopVisibility();
  window.addEventListener('pageshow', purgeRetiredDesktopVisibility);

  try { document.title = 'TD613 Hush'; } catch (error) {}
  window.TD613_ASSET_VERSIONS = {
    styles:      '202607101945',
    data:        '202607010240',
    diagnostics: '202604230045',
    engine:      '202607010240',
    fixtures:    '202604230045',
    receipt:     '202605010945',
    main:        '202607081245',
    aperture:    '202607120500',
    chrome:      '202606151735',
    stationPolish: '202606162255',
    trainerStandalone: '202607081245',
    gatewayHousekeeping: '202607081245',
    gatewayApertureDesktopAlign: '202606162210',
    gatewayApertureSubtitle: '202606162225',
    gatewayBounceBanner: '202606162210',
    gatewayMoirePanel: '202606152055',
    copyHygiene: '202606011235',
    gatewayRescue: '202606110305',
    hushAlienConsole: '202605250326',
    hushFieldInstrument: '202605250326',
    hushMobileViewportFix: '202605200003',
    hushPhase32: '202605250101',
    hushPatch38: '202606050009',
    hushPr75: '202605250326',
    hushPr77: '202605251735',
    hushPr78: '202605250311',
    hushPr79: '202605302135',
    hushPr82: '202605251746',
    hushPr92: '202606091846',
    hushPr93: '202606091846',
    hushPr94: '202606091846',
    hushPr95: '202605301835',
    hushPr96: '202605302115',
    hushPr97: '202605301845',
    hushPr98: '202605281855',
    hushPr99: '202605281855',
    hushPr104: '202605301905',
    hushPr106: '202605302105',
    hushPr107: '202605302150',
    hushPr108: '202605302215',
    hushPr110: '202605302305',
    hushPr111: '202605310058',
    hushPr112: '202606010146',
    hushPr114: '202606010205',
    hushPr115: '202606010218',
    hushPr116: '202606010221',
    hushPr117: '202606011755',
    hushPr118: '202606010342',
    hushPr119: '202606010312',
    hushPr120: '202606010320',
    hushPr121: '202606010350',
    hushPr122: '202606010350',
    hushPr123: '202606050009',
    hushPr124: '202606050009',
    hushPr130: '202606011235',
    hushPr132: '202606060224',
    hushPr141: '202606060322',
    hushPr168: '202606091916',
    hushPr176: '202606091846',
    hushPhase39: '202607010240'
  };
  var V = window.TD613_ASSET_VERSIONS;
  document.write('<link rel="stylesheet" href="./styles.css?v=' + V.styles + '" />');
  document.write('<link rel="stylesheet" href="./hush-phase39.css?v=' + V.hushPhase39 + '" />');
  if (/\/(?:trainer|clone)\.html(?:$|[?#])/i.test(window.location.pathname + window.location.search + window.location.hash)) {
    document.write('<link rel="stylesheet" href="./station-polish.css?v=' + V.stationPolish + '" />');
  }
  document.write('<link rel="stylesheet" href="./gateway-bounce-banner.css?v=' + (V.gatewayBounceBanner || V.main || '') + '" />');
  document.write('<script src="./gateway-aperture-subtitle.js?v=' + (V.gatewayApertureSubtitle || V.main || '') + '"><\/script>');
  document.write('<script src="./gateway-aperture-moire-panel.js?v=' + (V.gatewayMoirePanel || V.main || '') + '"><\/script>');
  if (document.body && document.body.dataset && document.body.dataset.pageKind === 'adversarial-bench') {
    document.write('<script type="module" src="./hush-phase39-ui.js?v=' + V.hushPhase39 + '"><\/script>');
  } else {
    window.addEventListener('DOMContentLoaded', function () {
      try { document.title = 'TD613 Hush'; } catch (error) {}
      purgeRetiredDesktopVisibility();
      if (document.body && document.body.dataset && document.body.dataset.pageKind === 'adversarial-bench') {
        var script = document.createElement('script');
        script.type = 'module';
        script.src = './hush-phase39-ui.js?v=' + V.hushPhase39;
        document.body.appendChild(script);
      }
    });
  }
}());
