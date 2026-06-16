(function () {
  function run() {
    var body = document.body;
    if (!body || body.getAttribute('data-page-kind') !== 'trainer') return;
    var navs = document.querySelectorAll('.station-nav, .top-tabs');
    for (var i = 0; i < navs.length; i += 1) {
      navs[i].remove();
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
})();
