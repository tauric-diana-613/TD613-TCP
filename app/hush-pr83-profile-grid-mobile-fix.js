const STYLE_ID = 'hushPr83ProfileGridMobileFix';

function installProfileGridMobileFix(doc = document) {
  if (!doc?.head || doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    body[data-page-kind="adversarial-bench"] .hush-source-profile-panel {
      overflow: hidden !important;
    }

    body[data-page-kind="adversarial-bench"] .hush-source-profile-grid {
      grid-template-columns: repeat(auto-fit, minmax(7.8rem, 1fr)) !important;
      align-items: stretch !important;
      min-width: 0 !important;
    }

    body[data-page-kind="adversarial-bench"] .hush-source-metric {
      min-width: 0 !important;
      overflow: hidden !important;
    }

    body[data-page-kind="adversarial-bench"] .hush-source-metric strong {
      display: block !important;
      white-space: normal !important;
      word-break: normal !important;
      overflow-wrap: anywhere !important;
      line-height: 1.25 !important;
      max-width: 100% !important;
    }

    body[data-page-kind="adversarial-bench"] .hush-source-metric span {
      white-space: normal !important;
      overflow-wrap: anywhere !important;
    }

    @media (max-width: 520px) {
      body[data-page-kind="adversarial-bench"] .hush-source-profile-grid {
        grid-template-columns: minmax(0, 1fr) !important;
      }

      body[data-page-kind="adversarial-bench"] .hush-source-metric {
        min-height: auto !important;
        padding: .5rem .55rem !important;
      }

      body[data-page-kind="adversarial-bench"] .hush-source-metric strong {
        font-size: .72rem !important;
      }
    }
  `;
  doc.head.appendChild(style);
  if (doc.body) doc.body.dataset.hushPr83ProfileGridMobileFix = 'true';
}

if (typeof document !== 'undefined') {
  const run = () => installProfileGridMobileFix(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [240, 720, 1400].forEach((delay) => window.setTimeout(run, delay));
}

export { installProfileGridMobileFix };
