(function () {
  var V = window.TD613_ASSET_VERSIONS || {};
  var srcs = [
    './browser-data.js?v='        + (V.data        || ''),
    './browser-diagnostics.js?v=' + (V.diagnostics || ''),
    './browser-engine.js?v='      + (V.engine      || ''),
    './retrieval-fixtures.js?v='  + (V.fixtures    || ''),
    './browser-main.js?v='        + (V.main        || ''),
    './chamber-chrome.js?v='      + (V.chrome      || '')
  ];
  for (var i = 0; i < srcs.length; i++) {
    document.write('<script src="' + srcs[i] + '"><\/script>');
  }
}());
