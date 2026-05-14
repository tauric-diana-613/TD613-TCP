(function () {
  var V = window.TD613_ASSET_VERSIONS || {};
  var query = window.location.search || '';
  var hash = window.location.hash || '';
  var needsRetrievalFixtures =
    /(?:[?&](?:test-flight|fixtures|retrieval-fixtures)=)/i.test(query) ||
    /(?:test-flight|retrieval-fixtures)/i.test(hash);
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
