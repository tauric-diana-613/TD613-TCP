export const ASH_FLICKER_HARDENING_VERSION = 'td613.ash.flicker-hardening/v0.4-stable-finite-motion';
export const ASH_CANONICAL_COMPOSITOR_VERSION = 'td613.ash.flicker-hardening/v1.1-stable-finite-compositor';

const host = globalThis.window;
const doc = globalThis.document;

const diagnostics = {
  cancelledInfiniteAnimations: 0,
  preservedFiniteAnimations: 0,
  installedAt: new Date().toISOString()
};

function animationIterations(animation) {
  try {
    return animation.effect?.getTiming?.().iterations;
  } catch {
    return null;
  }
}

function cancelRunawayAnimations() {
  if (typeof doc?.getAnimations !== 'function') return;
  for (const animation of doc.getAnimations({ subtree: true })) {
    const iterations = animationIterations(animation);
    if (iterations === Infinity) {
      try {
        animation.cancel();
        diagnostics.cancelledInfiniteAnimations += 1;
      } catch {}
    } else {
      diagnostics.preservedFiniteAnimations += 1;
    }
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
      -webkit-overflow-scrolling:touch;
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
    html[data-ash-flicker-hardening] .map-stage,
    html[data-ash-flicker-hardening] .ash-aia__stage,
    html[data-ash-flicker-hardening] .premium-sheet{
      isolation:isolate;
      will-change:auto!important;
    }
    html[data-ash-flicker-hardening] .map-stage canvas{
      will-change:auto!important;
      touch-action:pan-y pinch-zoom!important;
    }
    html[data-ash-flicker-hardening] .ash-aia__stage[data-playing="true"] .aia-step.is-current,
    html[data-ash-flicker-hardening] .ash-ux-motion-node[data-active="true"] i{
      animation-play-state:running!important;
    }
    @media(prefers-reduced-motion:reduce){
      html[data-ash-flicker-hardening] *,
      html[data-ash-flicker-hardening] *::before,
      html[data-ash-flicker-hardening] *::after{
        scroll-behavior:auto!important;
        animation-duration:.001ms!important;
        animation-iteration-count:1!important;
      }
    }
  `;
}

export function installAshFlickerHardening() {
  if (!host || !doc || host.__td613AshFlickerHardening) return false;
  installCompositorStyles();
  cancelRunawayAnimations();
  host.addEventListener('td613:ash:core-ready', cancelRunawayAnimations, { once: true });
  host.addEventListener('td613:ash:composition-stable', cancelRunawayAnimations, { once: true });
  doc.documentElement.dataset.ashFlickerHardening = ASH_FLICKER_HARDENING_VERSION;
  doc.documentElement.dataset.ashCanonicalCompositor = ASH_CANONICAL_COMPOSITOR_VERSION;
  host.__td613AshFlickerHardening = Object.freeze({
    version: ASH_FLICKER_HARDENING_VERSION,
    canonical_version: ASH_CANONICAL_COMPOSITOR_VERSION,
    diagnostics: () => Object.freeze({ ...diagnostics })
  });
  return true;
}

if (host && doc) installAshFlickerHardening();
