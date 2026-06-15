// Vercel Web Analytics initialization
// This script initializes Vercel Analytics for the TD613-TCP project
// Documentation: https://vercel.com/docs/analytics/quickstart

// Initialize the analytics queue
window.va = window.va || function(...params) {
  (window.vaq = window.vaq || []).push(params);
};

function isTD613FlightPage() {
  return /\/safe-harbor\/td613-flight\.html(?:$|[?#])/i.test(window.location.pathname + window.location.search + window.location.hash) || /TD613 Flight/i.test(document.title || '');
}

(function installFlightMicroControlRescue() {
  if (!isTD613FlightPage() || document.getElementById('td613FlightMicroControlRescue')) return;
  const style = document.createElement('style');
  style.id = 'td613FlightMicroControlRescue';
  style.textContent = `
    /* TD613 Flight: unboxed output authorship/payload micro-controls. */
    html body .output-card .status-bar {
      align-items: center !important;
    }

    html body .output-card .output-auth-toggle {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: flex-end !important;
      gap: .24rem !important;
      flex: 0 0 auto !important;
      width: auto !important;
      min-width: 0 !important;
      max-width: max-content !important;
      min-height: 0 !important;
      height: auto !important;
      margin-left: auto !important;
      padding: 0 !important;
      border: 0 !important;
      border-radius: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      clip-path: none !important;
      color: rgba(190,255,223,.82) !important;
      font-family: var(--font-mono) !important;
      font-size: 7px !important;
      line-height: 1 !important;
      letter-spacing: .08em !important;
      text-transform: uppercase !important;
      white-space: nowrap !important;
      overflow: visible !important;
      text-align: right !important;
    }

    html body .output-card .output-auth-toggle input[type="checkbox"] {
      appearance: none !important;
      -webkit-appearance: none !important;
      display: inline-grid !important;
      place-content: center !important;
      flex: 0 0 10px !important;
      width: 10px !important;
      min-width: 10px !important;
      height: 10px !important;
      min-height: 10px !important;
      margin: 0 !important;
      border: 1px solid rgba(36,240,109,.64) !important;
      border-radius: 50% !important;
      background: rgba(0,7,7,.58) !important;
      box-shadow: 0 0 9px rgba(36,240,109,.14) !important;
      clip-path: none !important;
    }

    html body .output-card .output-auth-toggle input[type="checkbox"]::before {
      content: "" !important;
      width: 5px !important;
      height: 5px !important;
      border-radius: 50% !important;
      transform: scale(0) !important;
      transition: transform .12s ease !important;
      background: var(--moss) !important;
      box-shadow: 0 0 10px rgba(36,240,109,.48) !important;
      clip-path: none !important;
    }

    html body .output-card .output-auth-toggle input[type="checkbox"]:checked::before {
      transform: scale(1) !important;
    }

    html body .output-card .status-bar .payload-stepper {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      flex: 0 0 auto !important;
      width: auto !important;
      min-width: 0 !important;
      max-width: max-content !important;
      min-height: 0 !important;
      height: auto !important;
      margin-left: auto !important;
      padding: 0 !important;
      gap: 5px !important;
      border: 0 !important;
      border-radius: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      clip-path: none !important;
      transform: none !important;
      -webkit-transform: none !important;
    }

    html body .output-card .status-bar .payload-stepper-label,
    html body .output-card .status-bar .payload-stepper-value {
      font-family: var(--font-mono) !important;
      line-height: 1 !important;
      text-transform: uppercase !important;
    }

    html body .output-card .status-bar .payload-stepper-label {
      max-width: none !important;
      color: var(--bone-dim) !important;
      font-size: 5px !important;
      letter-spacing: .08em !important;
    }

    html body .output-card .status-bar .payload-stepper-value {
      min-width: 1.05rem !important;
      text-align: center !important;
      color: var(--bone-bright) !important;
      font-size: 7px !important;
      letter-spacing: .04em !important;
    }

    html body .output-card .status-bar .payload-stepper .payload-stepper-btn,
    html body .output-card .status-bar .payload-stepper .icon-btn,
    html body .flight-lane .payload-stepper button {
      appearance: none !important;
      -webkit-appearance: none !important;
      display: inline-grid !important;
      place-items: center !important;
      flex: 0 0 auto !important;
      width: auto !important;
      min-width: 0 !important;
      max-width: none !important;
      height: auto !important;
      min-height: 0 !important;
      max-height: none !important;
      padding: 0 1px !important;
      margin: 0 !important;
      border: 0 !important;
      border-radius: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      clip-path: none !important;
      color: var(--moss) !important;
      font-family: var(--font-mono) !important;
      font-size: 10px !important;
      font-weight: 700 !important;
      line-height: 1 !important;
      letter-spacing: 0 !important;
      text-align: center !important;
      text-transform: none !important;
      white-space: nowrap !important;
      overflow: visible !important;
      justify-content: center !important;
      text-shadow: 0 0 8px rgba(36,240,109,.28) !important;
    }

    @media (max-width: 820px) {
      html body .output-card .status-bar {
        display: grid !important;
        grid-template-columns: minmax(0,1fr) auto !important;
        grid-template-areas: "counts auth" ". payload" !important;
        gap: 4px 8px !important;
        align-items: center !important;
      }
      html body .output-card #statusCounts { grid-area: counts !important; }
      html body .output-card .output-auth-toggle {
        grid-area: auth !important;
        justify-self: end !important;
        margin-left: 0 !important;
      }
      html body .output-card .status-bar .payload-stepper {
        grid-area: payload !important;
        justify-self: end !important;
        align-self: start !important;
        margin: -1px 0 0 !important;
      }
    }
  `;
  document.head.appendChild(style);
})();

(function installFlightSealSpacingRescue() {
  if (!isTD613FlightPage() || document.getElementById('td613FlightSealSpacingRescue')) return;
  const style = document.createElement('style');
  style.id = 'td613FlightSealSpacingRescue';
  style.textContent = `
    /* PR123 resolved: definitive Seal spacing panel repair. */
    html body .flight-lane-output .seal-card .seal-spacing-grid {
      display: grid !important;
      grid-template-columns: minmax(0, .86fr) minmax(0, 1.14fr) !important;
      grid-template-areas: "target zwnj" !important;
      align-items: stretch !important;
      gap: .46rem !important;
      margin-top: .08rem !important;
    }

    html body .flight-lane-output .seal-card .seal-spacing-grid > div {
      min-width: 0 !important;
      align-self: stretch !important;
      margin-top: 0 !important;
      transform: none !important;
      -webkit-transform: none !important;
    }

    html body .flight-lane-output .seal-card .seal-target-panel { grid-area: target !important; }
    html body .flight-lane-output .seal-card .seal-zwnj-panel { grid-area: zwnj !important; }

    html body .flight-lane-output .seal-card .seal-target-panel input#sealTargetWord {
      width: 100% !important;
      max-width: 100% !important;
    }

    @media (max-width: 520px) {
      html body .flight-lane-output .seal-card .seal-spacing-grid {
        grid-template-columns: 1fr !important;
        grid-template-areas: "target" "zwnj" !important;
      }
    }
  `;
  document.head.appendChild(style);
})();

(function installFlightMobileLanePreloadRescue() {
  if (!isTD613FlightPage() || document.getElementById('td613FlightMobileLanePreloadRescue')) return;
  const style = document.createElement('style');
  style.id = 'td613FlightMobileLanePreloadRescue';
  style.textContent = `
    /* PR124 resolved: mobile lane sizing, touch, and preload rescue. */
    html body .card {
      content-visibility: visible !important;
      contain-intrinsic-size: unset !important;
    }

    html body .grid > .flight-lane-output {
      touch-action: pan-y pinch-zoom !important;
    }

    html body .mobile-lane-tab,
    html body [data-flight-lane-target],
    html body button,
    html body input,
    html body select,
    html body textarea,
    html body .payload-stepper,
    html body .output-auth-toggle {
      touch-action: manipulation !important;
    }
  `;
  document.head.appendChild(style);

  const mobile = () => window.matchMedia && window.matchMedia('(max-width: 820px)').matches;
  const q = (selector) => document.querySelector(selector);
  const laneName = () => document.documentElement.dataset.flightMobileLane === 'output' ? 'output' : 'prompt';
  const activeLane = () => q(laneName() === 'output' ? '.flight-lane-output' : '.flight-lane-prompt');
  const viewportHeight = () => window.visualViewport && window.visualViewport.height ? window.visualViewport.height : window.innerHeight;

  function preloadFlightPage() {
    if (!mobile()) return;
    document.querySelectorAll('.flight-lane .card, .flight-lane .output-card, .flight-lane .seal-card, .flight-lane .copy-bin-card, .flight-lane textarea, .flight-lane input, .flight-lane button').forEach((el) => {
      if (el && el.style) el.style.setProperty('content-visibility', 'visible', 'important');
    });
    const prompt = q('.flight-lane-prompt');
    const output = q('.flight-lane-output');
    if (prompt) void prompt.offsetHeight;
    if (output) void output.offsetHeight;
    document.querySelectorAll('.copy-chip').forEach((chip) => { void chip.offsetHeight; });
  }

  function syncGridHeight() {
    if (!mobile()) return;
    const grid = q('.grid');
    const lane = activeLane();
    if (!grid || !lane) return;
    const rect = lane.getBoundingClientRect();
    const height = Math.max(lane.scrollHeight, lane.offsetHeight, rect.height, viewportHeight() * 0.55);
    grid.style.setProperty('height', `${Math.ceil(height)}px`, 'important');
  }

  function settleGridHeight() {
    preloadFlightPage();
    syncGridHeight();
    window.requestAnimationFrame(syncGridHeight);
    window.setTimeout(syncGridHeight, 120);
    window.setTimeout(syncGridHeight, 360);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', settleGridHeight, { once: true });
  else settleGridHeight();
  window.addEventListener('load', settleGridHeight, { passive: true });
  window.addEventListener('pageshow', settleGridHeight, { passive: true });
  window.addEventListener('resize', settleGridHeight, { passive: true });
  window.addEventListener('orientationchange', settleGridHeight, { passive: true });
  if (window.visualViewport) window.visualViewport.addEventListener('resize', settleGridHeight, { passive: true });
})();

// Load the Vercel Analytics script
// When deployed to Vercel, analytics will be automatically tracked
// The script is loaded from Vercel's CDN at /_vercel/insights/script.js
(function() {
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/insights/script.js';
  document.head.appendChild(script);
})();