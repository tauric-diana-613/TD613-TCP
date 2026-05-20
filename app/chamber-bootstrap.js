(function () {
  var V = window.TD613_ASSET_VERSIONS || {};
  var query = window.location.search || '';
  var hash = window.location.hash || '';
  var pageKind = document.body && document.body.getAttribute('data-page-kind');
  var needsRetrievalFixtures =
    /(?:[?&](?:test-flight|fixtures|retrieval-fixtures)=)/i.test(query) ||
    /(?:test-flight|retrieval-fixtures)/i.test(hash);

  if (pageKind === 'adversarial-bench') {
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