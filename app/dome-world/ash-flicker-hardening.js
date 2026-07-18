export const ASH_FLICKER_HARDENING_VERSION = 'td613.ash.flicker-hardening/v0.3-emergency-static-surface';

const host = globalThis.window;
const doc = globalThis.document;

const diagnostics = {
  blockedAshMapFrames: 0,
  filteredLifecycleMutations: 0,
  cancelledAnimations: 0,
  installedAt: new Date().toISOString()
};

function isAshMapFrame(callback) {
  if (typeof callback !== 'function') return false;
  try {
    const source = Function.prototype.toString.call(callback);
    return source.includes('drawMap')
      && source.includes('scheduleFrame')
      && source.includes('mapVisible');
  } catch {
    return false;
  }
}

function installStaticMapScheduler() {
  if (!host?.requestAnimationFrame || host.__td613AshStaticMapSchedulerInstalled) return;
  const nativeRequestAnimationFrame = host.requestAnimationFrame.bind(host);
  const nativeCancelAnimationFrame = host.cancelAnimationFrame.bind(host);
  let ashFrameExecuting = false;
  let syntheticFrameId = -1;

  host.requestAnimationFrame = callback => {
    if (!isAshMapFrame(callback)) return nativeRequestAnimationFrame(callback);
    if (ashFrameExecuting) {
      diagnostics.blockedAshMapFrames += 1;
      return syntheticFrameId--;
    }
    return nativeRequestAnimationFrame(time => {
      ashFrameExecuting = true;
      try {
        callback(time);
      } finally {
        ashFrameExecuting = false;
      }
    });
  };

  host.cancelAnimationFrame = frameId => {
    if (Number(frameId) < 0) return;
    nativeCancelAnimationFrame(frameId);
  };

  Object.defineProperty(host, '__td613AshStaticMapSchedulerInstalled', {
    value: true,
    configurable: false,
    enumerable: false,
    writable: false
  });
}

function installStableLifecycleObserver() {
  const NativeMutationObserver = host?.MutationObserver;
  if (!NativeMutationObserver || host.__td613AshStableLifecycleObserverInstalled) return;

  const filterRecords = records => records.filter(record => {
    const duplicateLifecycleWrite = record.type === 'attributes'
      && record.attributeName === 'data-ash-lifecycle'
      && record.oldValue === record.target?.getAttribute?.('data-ash-lifecycle');
    if (duplicateLifecycleWrite) diagnostics.filteredLifecycleMutations += 1;
    return !duplicateLifecycleWrite;
  });

  class StableMutationObserver {
    constructor(callback) {
      this.callback = callback;
      this.observer = new NativeMutationObserver(records => {
        const filtered = filterRecords(records);
        if (filtered.length) callback(filtered, this);
      });
    }

    observe(target, options = {}) {
      const stableOptions = { ...options };
      if (stableOptions.attributes
        && Array.isArray(stableOptions.attributeFilter)
        && stableOptions.attributeFilter.includes('data-ash-lifecycle')) {
        stableOptions.attributeOldValue = true;
      }
      return this.observer.observe(target, stableOptions);
    }

    disconnect() {
      return this.observer.disconnect();
    }

    takeRecords() {
      return filterRecords(this.observer.takeRecords());
    }
  }

  Object.defineProperty(host, 'MutationObserver', {
    value: StableMutationObserver,
    configurable: true,
    enumerable: false,
    writable: true
  });
  Object.defineProperty(host, '__td613AshStableLifecycleObserverInstalled', {
    value: true,
    configurable: false,
    enumerable: false,
    writable: false
  });
}

function cancelDocumentAnimations() {
  if (typeof doc?.getAnimations !== 'function') return;
  for (const animation of doc.getAnimations({ subtree: true })) {
    try {
      animation.cancel();
      diagnostics.cancelledAnimations += 1;
    } catch {}
  }
}

function installCompositorStyles() {
  if (!doc?.head || doc.getElementById('td613-ash-flicker-hardening-css')) return;
  const style = doc.createElement('style');
  style.id = 'td613-ash-flicker-hardening-css';
  style.textContent = `
    html[data-ash-flicker-hardening] body{
      background-attachment:scroll!important;
      background-image:none!important;
      background-color:#03100c!important;
    }
    html[data-ash-flicker-hardening] body::before,
    html[data-ash-flicker-hardening] body::after{
      content:none!important;
      display:none!important;
      animation:none!important;
    }
    html[data-ash-flicker-hardening] *,
    html[data-ash-flicker-hardening] *::before,
    html[data-ash-flicker-hardening] *::after{
      animation:none!important;
      animation-name:none!important;
      transition:none!important;
      scroll-behavior:auto!important;
    }
    html[data-ash-flicker-hardening] .mast,
    html[data-ash-flicker-hardening] .launch,
    html[data-ash-flicker-hardening] .launch-panel,
    html[data-ash-flicker-hardening] .premium-context-bar,
    html[data-ash-flicker-hardening] .premium-primary-dock,
    html[data-ash-flicker-hardening] .premium-command-sheet,
    html[data-ash-flicker-hardening] .premium-command-sheet::backdrop,
    html[data-ash-flicker-hardening] .guided-map-control-legend,
    html[data-ash-flicker-hardening] .map-tools,
    html[data-ash-flicker-hardening] .map-legend{
      -webkit-backdrop-filter:none!important;
      backdrop-filter:none!important;
      will-change:auto!important;
    }
    html[data-ash-flicker-hardening] .premium-workspace,
    html[data-ash-flicker-hardening] .workspace,
    html[data-ash-flicker-hardening] .premium-sheet,
    html[data-ash-flicker-hardening] .guided-stable-host{
      animation:none!important;
      will-change:auto!important;
    }
    html[data-ash-flicker-hardening] .map-stage{
      contain:layout paint style;
      isolation:isolate;
      transform:none!important;
      will-change:auto!important;
    }
    html[data-ash-flicker-hardening] .map-stage canvas{
      animation:none!important;
      transition:none!important;
      will-change:auto!important;
      transform:none!important;
    }
  `;
  doc.head.append(style);
}

export function installAshFlickerHardening() {
  if (!host || !doc || host.__td613AshFlickerHardening) return false;
  installStaticMapScheduler();
  installStableLifecycleObserver();
  installCompositorStyles();
  cancelDocumentAnimations();
  host.addEventListener('td613:ash:core-ready', cancelDocumentAnimations, { once: true });
  host.addEventListener('td613:ash:case-opened', cancelDocumentAnimations);
  host.addEventListener('td613:ash:case-created', cancelDocumentAnimations);
  doc.documentElement.dataset.ashFlickerHardening = ASH_FLICKER_HARDENING_VERSION;
  host.__td613AshFlickerHardening = Object.freeze({
    version: ASH_FLICKER_HARDENING_VERSION,
    diagnostics: () => Object.freeze({ ...diagnostics })
  });
  return true;
}

if (host && doc) installAshFlickerHardening();
