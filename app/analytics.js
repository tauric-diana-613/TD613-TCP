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
    /* TD613 Flight: final rescue for output authorship/payload micro-controls. */
    html body .output-card .status-bar {
      align-items: center !important;
    }

    html body .output-card .output-auth-toggle {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: flex-end !important;
      gap: .28rem !important;
      flex: 0 0 auto !important;
      width: auto !important;
      min-width: 0 !important;
      max-width: max-content !important;
      min-height: 18px !important;
      height: 18px !important;
      margin-left: auto !important;
      padding: 2px 7px 2px 9px !important;
      border: 1px solid rgba(36,240,109,.22) !important;
      border-radius: 0 !important;
      background: linear-gradient(90deg, rgba(36,240,109,.075), rgba(0,7,7,.58)) !important;
      box-shadow: inset 0 0 0 1px rgba(120,247,255,.045) !important;
      clip-path: polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px)) !important;
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
      border: 1px solid rgba(36,240,109,.58) !important;
      border-radius: 0 !important;
      background: rgba(0,7,7,.72) !important;
      box-shadow: inset 0 0 0 1px rgba(120,247,255,.08), 0 0 14px rgba(36,240,109,.08) !important;
      clip-path: polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px)) !important;
    }

    html body .output-card .output-auth-toggle input[type="checkbox"]::before {
      content: "" !important;
      width: 6px !important;
      height: 6px !important;
      transform: scale(0) !important;
      transition: transform .12s ease !important;
      background: var(--moss) !important;
      box-shadow: 0 0 12px rgba(36,240,109,.45) !important;
      clip-path: polygon(14% 48%, 35% 70%, 84% 15%, 96% 28%, 36% 91%, 2% 58%) !important;
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
      min-width: 76px !important;
      max-width: 104px !important;
      min-height: 18px !important;
      height: 18px !important;
      margin-left: auto !important;
      padding: 1px 4px !important;
      gap: 3px !important;
      border: 1px solid rgba(120,247,255,.16) !important;
      border-radius: 0 !important;
      background: rgba(0,7,7,.48) !important;
      box-shadow: inset 0 0 0 1px rgba(36,240,109,.035) !important;
      clip-path: polygon(0 0, calc(100% - 7px) 0, 100% 7px, 100% 100%, 7px 100%, 0 calc(100% - 7px)) !important;
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
      max-width: 34px !important;
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
      flex: 0 0 14px !important;
      width: 14px !important;
      min-width: 14px !important;
      max-width: 14px !important;
      height: 14px !important;
      min-height: 14px !important;
      max-height: 14px !important;
      padding: 0 !important;
      margin: 0 !important;
      border: 1px solid rgba(36,240,109,.24) !important;
      border-radius: 50% !important;
      background: rgba(0,3,3,.68) !important;
      box-shadow: inset 0 0 0 1px rgba(120,247,255,.05) !important;
      clip-path: none !important;
      color: var(--moss) !important;
      font-family: var(--font-mono) !important;
      font-size: 8px !important;
      font-weight: 700 !important;
      line-height: 1 !important;
      letter-spacing: 0 !important;
      text-align: center !important;
      text-transform: none !important;
      white-space: nowrap !important;
      overflow: hidden !important;
      justify-content: center !important;
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

// Load the Vercel Analytics script
// When deployed to Vercel, analytics will be automatically tracked
// The script is loaded from Vercel's CDN at /_vercel/insights/script.js
(function() {
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/insights/script.js';
  document.head.appendChild(script);
})();