// TD613 Safe Harbor desktop rescue loader
// Mobile Safe Harbor remains governed by the primary app stylesheet.

window.si = window.si || function () {
  (window.siq = window.siq || []).push(arguments);
};

(function installSafeHarborHardSignOut() {
  const route = window.location.pathname + window.location.search + window.location.hash;
  const safeHarbor = /\/safe-harbor\/(?:index\.html)?(?:$|[?#])/i.test(route) || /TD613 Safe Harbor/i.test(document.title || '');
  const flight = /\/safe-harbor\/td613-flight\.html(?:$|[?#])/i.test(route) || /TD613 Flight/i.test(document.title || '');
  if (!safeHarbor || flight) return;

  const SESSION_KEY = 'td613.safe-harbor.session.v1';
  const MIRROR_KEY = 'td613.safe-harbor.session.mirror.v1';
  const DEFAULT_BYPASS_KEY = 'td613.safe-harbor.operator-bypass.hash';
  const DEFAULT_DEV_MODE_KEY = 'td613.safe-harbor.dev-mode.enabled';
  let signingOut = false;

  function storageKeys() {
    const data = window.TD613_SAFE_HARBOR_DATA;
    const operator = data && data.operatorBypass ? data.operatorBypass : {};
    return Array.from(new Set([
      SESSION_KEY,
      MIRROR_KEY,
      DEFAULT_BYPASS_KEY,
      DEFAULT_DEV_MODE_KEY,
      operator.storage_key,
      operator.dev_mode_storage_key
    ].filter(Boolean)));
  }

  function availableStorages() {
    const storages = [];
    try { if (window.sessionStorage) storages.push(window.sessionStorage); } catch (error) {}
    try { if (window.localStorage && !storages.includes(window.localStorage)) storages.push(window.localStorage); } catch (error) {}
    return storages;
  }

  function purgeStorage() {
    const keys = storageKeys();
    availableStorages().forEach((storage) => {
      keys.forEach((key) => {
        try { storage.removeItem(key); } catch (error) {}
      });
    });
    try { delete window.TD613_SAFE_HARBOR_OPERATOR; } catch (error) {}
    try { window.TD613_SAFE_HARBOR_OPERATOR = {}; } catch (error) {}
  }

  function restoreSealedSurface() {
    delete document.documentElement.dataset.safeHarborSessionOpen;
    const body = document.body;
    if (body) {
      body.classList.add('vault-sealed');
      body.classList.remove('vault-open');
    }
    const membrane = document.getElementById('ingressMembrane');
    if (membrane) {
      membrane.hidden = false;
      membrane.classList.remove('is-hidden');
      membrane.removeAttribute('aria-hidden');
    }
    const vault = document.getElementById('vaultSurface');
    if (vault) vault.classList.remove('harbor-map-floating');
  }

  function hardSignOut(event) {
    const trigger = event.target && event.target.closest
      ? event.target.closest('#signOutIngress,#signOutVault,#railSignOut')
      : null;
    if (!trigger) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    if (signingOut) return;
    signingOut = true;

    window.__TD613_SAFE_HARBOR_SIGNING_OUT__ = true;
    purgeStorage();
    window.dispatchEvent(new CustomEvent('td613:safe-harbor-session-reset', {
      detail: { source: 'always-loaded-bootstrap', hard_reset: true }
    }));
    purgeStorage();
    restoreSealedSurface();

    const target = new URL(window.location.href);
    target.search = '';
    target.hash = '';
    target.searchParams.set('signed_out', String(Date.now()));
    window.setTimeout(() => window.location.replace(target.href), 0);
  }

  // Window capture runs before the main runtime, housekeeping wrappers, and
  // any target-level listener. Sign Out therefore remains available even when
  // the chamber runtime has partially failed or an async packet task is alive.
  window.addEventListener('click', hardSignOut, true);
})();

(function loadSafeHarborDesktopRescueStylesheet() {
  const route = window.location.pathname + window.location.search + window.location.hash;
  const safeHarbor = /\/safe-harbor\/(?:index\.html)?(?:$|[?#])/i.test(route) || /TD613 Safe Harbor/i.test(document.title || '');
  const flight = /\/safe-harbor\/td613-flight\.html(?:$|[?#])/i.test(route) || /TD613 Flight/i.test(document.title || '');
  if (!safeHarbor || flight || document.getElementById('td613SafeHarborDesktopRescueCss')) return;

  const rescue = document.createElement('link');
  rescue.id = 'td613SafeHarborDesktopRescueCss';
  rescue.rel = 'stylesheet';
  rescue.href = 'app/desktop-rescue.css?v=20260710-stable-cockpit';
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
