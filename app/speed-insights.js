// TD613 rescue stylesheet/module loader.
// Safe Harbor desktop rescue remains scoped; Hush PR76 restores Analyze surfaces.

window.si = window.si || function () {
  (window.siq = window.siq || []).push(arguments);
};

(function loadSafeHarborDesktopRescueStylesheet() {
  const route = window.location.pathname + window.location.search + window.location.hash;
  const safeHarbor = /\/safe-harbor\/(?:index\.html)?(?:$|[?#])/i.test(route) || /TD613 Safe Harbor/i.test(document.title || '');
  const flight = /\/safe-harbor\/td613-flight\.html(?:$|[?#])/i.test(route) || /TD613 Flight/i.test(document.title || '');
  if (!safeHarbor || flight || document.getElementById('td613SafeHarborDesktopRescueCss')) return;

  const rescue = document.createElement('link');
  rescue.id = 'td613SafeHarborDesktopRescueCss';
  rescue.rel = 'stylesheet';
  rescue.href = 'app/desktop-rescue.css';
  document.head.appendChild(rescue);
})();

(function loadHushPr76AnalysisSurfaces() {
  const route = window.location.pathname + window.location.search + window.location.hash;
  const hush = /\/adversarial-bench\.html(?:$|[?#])/i.test(route) || /TD613 Hush/i.test(document.title || '');
  if (!hush || document.querySelector('script[src^="./hush-pr76-mask-recommender.js"]')) return;

  const script = document.createElement('script');
  script.type = 'module';
  script.src = './hush-pr76-mask-recommender.js?v=202606160045';
  document.head.appendChild(script);
})();
