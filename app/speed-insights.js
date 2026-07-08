// TD613 Safe Harbor desktop rescue loader
// Mobile Safe Harbor remains governed by the primary app stylesheet.

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

(function removeCloneStationChips() {
  function run() {
    if (!document.body || !['trainer', 'clone'].includes(document.body.getAttribute('data-page-kind'))) return;
    const nav = document.querySelector('.station-nav');
    if (nav) nav.remove();
    try { document.title = 'TCP / Clone'; } catch (error) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
})();
