(function () {
  try { document.title = 'TD613 Hush'; } catch (error) {}
  window.TD613_ASSET_VERSIONS = {
    styles:      '202604192040',
    data:        '202605281815',
    diagnostics: '202604230045',
    engine:      '202605281855',
    fixtures:    '202604230045',
    receipt:     '202605010945',
    main:        '202606151705',
    aperture:    '202606151705',
    chrome:      '202606151735',
    gatewayHousekeeping: '202606151825',
    gatewayApertureDesktopAlign: '202606151940',
    gatewayApertureSubtitle: '202606151940',
    gatewayBounceBanner: '202606152000',
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
    hushPhase39: '202605301720'
  };
  var V = window.TD613_ASSET_VERSIONS;
  document.write('<link rel="stylesheet" href="./styles.css?v=' + V.styles + '" />');
  document.write('<link rel="stylesheet" href="./hush-phase39.css?v=' + V.hushPhase39 + '" />');
  document.write('<link rel="stylesheet" href="./gateway-bounce-banner.css?v=' + (V.gatewayBounceBanner || V.main || '') + '" />');
  document.write('<script src="./gateway-aperture-subtitle.js?v=' + (V.gatewayApertureSubtitle || V.main || '') + '"><\/script>');
  if (document.body && document.body.dataset && document.body.dataset.pageKind === 'adversarial-bench') {
    document.write('<script type="module" src="./hush-phase39-ui.js?v=' + V.hushPhase39 + '"><\/script>');
  } else {
    window.addEventListener('DOMContentLoaded', function () {
      try { document.title = 'TD613 Hush'; } catch (error) {}
      if (document.body && document.body.dataset && document.body.dataset.pageKind === 'adversarial-bench') {
        var script = document.createElement('script');
        script.type = 'module';
        script.src = './hush-phase39-ui.js?v=' + V.hushPhase39;
        document.body.appendChild(script);
      }
    });
  }
}());