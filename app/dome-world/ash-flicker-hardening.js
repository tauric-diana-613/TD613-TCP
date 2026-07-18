export const ASH_FLICKER_HARDENING_VERSION = 'td613.ash.flicker-hardening/v0.1-static-compositor';

const host = globalThis.window;
const doc = globalThis.document;

const diagnostics = {
  blockedAshMapFrames: 0,
  filteredLifecycleMutations: 0,
  installedAt: new Date().toISOString()
};

function isAshMapFrame(callback) {
  if (typeof callback !== 'function' || callback.name !== 'frame') return false;
  try {
    const source = Function.prototype.toString.call(callback);
    return source.includes('state.mapVisible') && source.includes('drawMap(time)') && source.includes('scheduleFrame(frame)');
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

function installCompositorStyles() {
  if (!doc?.head || doc.getElementById('td613-ash-flicker-hardening-css')) return;
  const style = doc.createElement('style');
  style.id = 'td613-ash-flicker-hardening-css';
  style.textContent = `
    html[data-ash-flicker-hardening] body{background-attachment:scroll!important}
    html[data-ash-flicker-hardening] .mast,
    html[data-ash-flicker-hardening] .launch,
    html[data-ash-flicker-hardening] .premium-context-bar,
    html[data-ash-flicker-hardening] .premium-primary-dock,
    html[data-ash-flicker-hardening] .premium-command-sheet,
    html[data-ash-flicker-hardening] .premium-command-sheet::backdrop,
    html[data-ash-flicker-hardening] .guided-map-control-legend{
      -webkit-backdrop-filter:none!important;
      backdrop-filter:none!important;
    }
    html[data-ash-flicker-hardening] .premium-workspace{animation:none!important}
    html[data-ash-flicker-hardening] .map-stage{contain:layout paint;isolation:isolate}
    html[data-ash-flicker-hardening] .map-stage canvas{will-change:auto!important}
  `;
  doc.head.append(style);
}

export function installAshFlickerHardening() {
  if (!host || !doc || host.__td613AshFlickerHardening) return false;
  installStaticMapScheduler();
  installStableLifecycleObserver();
  installCompositorStyles();
  doc.documentElement.dataset.ashFlickerHardening = ASH_FLICKER_HARDENING_VERSION;
  host.__td613AshFlickerHardening = Object.freeze({
    version: ASH_FLICKER_HARDENING_VERSION,
    diagnostics: () => Object.freeze({ ...diagnostics })
  });
  return true;
}

if (host && doc) installAshFlickerHardening();
