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
  rescue.href = 'app/desktop-rescue.css?v=20260708-harbor-map-scroll-swap';
  document.head.appendChild(rescue);
})();

(function installSafeHarborMapScrollSwap() {
  function mount() {
    const vault = document.getElementById('vaultSurface');
    const rail = vault && vault.querySelector('.safe-harbor-scroll-rail');
    const conscience = vault && vault.querySelector('.conscience-panel');
    if (!vault || !rail || !conscience) return;

    const desktop = window.matchMedia('(min-width: 1024px)');
    let frame = 0;

    function sync() {
      frame = 0;
      const sessionOpen = document.documentElement.dataset.safeHarborSessionOpen === 'true'
        || !document.body.classList.contains('vault-sealed');
      const pastConscience = conscience.getBoundingClientRect().bottom <= 18;
      const floating = desktop.matches && sessionOpen && pastConscience;

      vault.classList.toggle('harbor-map-floating', floating);
      rail.setAttribute('aria-hidden', String(!floating));
      if ('inert' in rail) rail.inert = !floating;
    }

    function requestSync() {
      if (!frame) frame = window.requestAnimationFrame(sync);
    }

    rail.setAttribute('aria-hidden', 'true');
    if ('inert' in rail) rail.inert = true;

    window.addEventListener('scroll', requestSync, { passive: true });
    window.addEventListener('resize', requestSync, { passive: true });
    if (desktop.addEventListener) desktop.addEventListener('change', requestSync);
    else if (desktop.addListener) desktop.addListener(requestSync);

    const observer = new MutationObserver(requestSync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-safe-harbor-session-open']
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    requestSync();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
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
