export const ASH_FLICKER_HARDENING_VERSION = 'td613.ash.flicker-hardening/v0.3-emergency-static-surface';
export const ASH_CANONICAL_COMPOSITOR_VERSION = 'td613.ash.flicker-hardening/v1.0-native-compositor';

const host = globalThis.window;
const doc = globalThis.document;

const diagnostics = {
  cancelledAnimations: 0,
  global_animation_frame_wrapped: false,
  global_mutation_observer_wrapped: false,
  installedAt: new Date().toISOString()
};

function cancelDocumentAnimations() {
  if (typeof doc?.getAnimations !== 'function') return;
  for (const animation of doc.getAnimations({ subtree:true })) {
    try {
      animation.cancel();
      diagnostics.cancelledAnimations += 1;
    } catch {}
  }
}

function installCompositorStyles() {
  if (!doc?.head) return;
  let style = doc.getElementById('td613-ash-flicker-hardening-css');
  if (!style) {
    style = doc.createElement('style');
    style.id = 'td613-ash-flicker-hardening-css';
    doc.head.append(style);
  }
  style.textContent = `
    html[data-ash-flicker-hardening],
    html[data-ash-flicker-hardening] body{
      overflow-x:hidden!important;
      overscroll-behavior-y:auto!important;
      scroll-behavior:auto!important;
    }
    html[data-ash-flicker-hardening] body{
      overflow-y:auto!important;
      background-attachment:scroll!important;
      background-image:none!important;
      background-color:#03100c!important;
      -webkit-overflow-scrolling:touch;
    }
    html[data-ash-flicker-hardening] body::before,
    html[data-ash-flicker-hardening] body::after{
      content:none!important;
      display:none!important;
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
    html[data-ash-flicker-hardening] main,
    html[data-ash-flicker-hardening] .workspace,
    html[data-ash-flicker-hardening] .premium-workspace,
    html[data-ash-flicker-hardening] .premium-sheet,
    html[data-ash-flicker-hardening] .guided-stable-host{
      overflow:visible!important;
      animation:none!important;
      will-change:auto!important;
    }
    html[data-ash-flicker-hardening] .map-stage{
      isolation:isolate;
      transform:none!important;
      will-change:auto!important;
    }
    html[data-ash-flicker-hardening] .map-stage canvas{
      animation:none!important;
      transition:none!important;
      will-change:auto!important;
      transform:none!important;
      touch-action:pan-y pinch-zoom!important;
    }
  `;
}

export function installAshFlickerHardening() {
  if (!host || !doc || host.__td613AshFlickerHardening) return false;
  installCompositorStyles();
  cancelDocumentAnimations();
  host.addEventListener('td613:ash:core-ready', cancelDocumentAnimations, { once:true });
  doc.documentElement.dataset.ashFlickerHardening = ASH_FLICKER_HARDENING_VERSION;
  doc.documentElement.dataset.ashCanonicalCompositor = ASH_CANONICAL_COMPOSITOR_VERSION;
  host.__td613AshFlickerHardening = Object.freeze({
    version:ASH_FLICKER_HARDENING_VERSION,
    canonical_version:ASH_CANONICAL_COMPOSITOR_VERSION,
    diagnostics:() => Object.freeze({ ...diagnostics })
  });
  return true;
}

if (host && doc) installAshFlickerHardening();
