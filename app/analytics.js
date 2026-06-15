// Vercel Web Analytics initialization
// This script initializes Vercel Analytics for the TD613-TCP project
// Documentation: https://vercel.com/docs/analytics/quickstart

// Initialize the analytics queue
window.va = window.va || function(...params) {
  (window.vaq = window.vaq || []).push(params);
};

(function installFlightMicroControlRescue() {
  const isFlight = /\/safe-harbor\/td613-flight\.html(?:$|[?#])/i.test(window.location.pathname + window.location.search + window.location.hash) || /TD613 Flight/i.test(document.title || '');
  if (!isFlight || document.getElementById('td613FlightMicroControlRescue')) return;
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

(function restoreCompactSealSpacing() {
  const isFlight = /\/safe-harbor\/td613-flight\.html(?:$|[?#])/i.test(window.location.pathname + window.location.search + window.location.hash) || /TD613 Flight/i.test(document.title || '');
  if (!isFlight || document.getElementById('td613CompactSealSpacing')) return;
  const style = document.createElement('style');
  style.id = 'td613CompactSealSpacing';
  style.textContent = `
    html body .flight-lane-output .seal-card .section-split-row.seal-spacing-grid,
    html body .seal-card .section-split-row.seal-spacing-grid {
      display: grid !important;
      grid-template-columns: minmax(0, .86fr) minmax(0, 1.14fr) !important;
      gap: .46rem !important;
      align-items: stretch !important;
      width: auto !important;
      max-width: 100% !important;
    }
    html body .seal-card .section-split-row.seal-spacing-grid > .seal-target-panel,
    html body .seal-card .section-split-row.seal-spacing-grid > .seal-zwnj-panel {
      min-width: 0 !important;
      width: auto !important;
      max-width: none !important;
      margin-top: 0 !important;
      transform: none !important;
      -webkit-transform: none !important;
    }
    html body .seal-card .section-split-row.seal-spacing-grid > .seal-target-panel input#sealTargetWord {
      width: 100% !important;
      max-width: 100% !important;
      min-width: 0 !important;
    }
  `;
  document.head.appendChild(style);
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