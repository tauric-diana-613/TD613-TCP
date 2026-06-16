const VERSION = 'hush-lab-mobile-polish/v3-no-normalization-loop';
const $ = (id, doc = document) => doc.getElementById(id);
let observer = null;
let normalizing = false;

function installStyle(doc = document) {
  if ($('hushLabMobilePolishStyle', doc)) return;
  const style = doc.createElement('style');
  style.id = 'hushLabMobilePolishStyle';
  style.textContent = `
    body[data-page-kind="adversarial-bench"] #hushLabDrawer,
    body[data-page-kind="adversarial-bench"] #hushLabDrawer * {
      box-sizing: border-box;
      max-width: 100%;
    }
    body[data-page-kind="adversarial-bench"] #hushLabDrawer .hush-drawer-body,
    body[data-page-kind="adversarial-bench"] #hushLabDrawer .hush-lab-grid,
    body[data-page-kind="adversarial-bench"] #hushLabDrawer .hush-lab-panel {
      min-width: 0;
      overflow-wrap: anywhere;
    }
    body[data-page-kind="adversarial-bench"] #hushLabDrawer .metric,
    body[data-page-kind="adversarial-bench"] #hushLabDrawer .hush-metric-row,
    body[data-page-kind="adversarial-bench"] #hushLabDrawer .hush-status-chip {
      min-width: 0;
    }
    body[data-page-kind="adversarial-bench"] #hushLabDrawer .val,
    body[data-page-kind="adversarial-bench"] #hushLabDrawer .metric .val,
    body[data-page-kind="adversarial-bench"] #hushLabDrawer .hush-metric-row strong,
    body[data-page-kind="adversarial-bench"] #hushLabDrawer .persona-memory-summary,
    body[data-page-kind="adversarial-bench"] #hushLabDrawer #controllerBody {
      overflow-wrap: anywhere;
      word-break: normal;
    }
    body[data-page-kind="adversarial-bench"] #hushLabDrawer #iterationPreviewBody,
    body[data-page-kind="adversarial-bench"] #hushLabDrawer .ledger-export-output,
    body[data-page-kind="adversarial-bench"] #hushLabDrawer .report-export-output {
      max-width: 100%;
      overflow-x: auto;
    }
    @media (max-width: 760px) {
      body[data-page-kind="adversarial-bench"] #hushLabDrawer summary {
        display: grid !important;
        grid-template-columns: minmax(0, auto) minmax(0, 1fr) auto !important;
        gap: .5rem !important;
        align-items: center !important;
      }
      body[data-page-kind="adversarial-bench"] #hushLabDrawer summary span {
        min-width: 0 !important;
        overflow-wrap: anywhere !important;
        line-height: 1.05 !important;
      }
      body[data-page-kind="adversarial-bench"] #hushLabDrawer .hush-drawer-body {
        padding: .64rem !important;
        overflow-x: hidden !important;
      }
      body[data-page-kind="adversarial-bench"] #hushLabDrawer .hush-lab-grid {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) !important;
        gap: .72rem !important;
      }
      body[data-page-kind="adversarial-bench"] #hushLabDrawer .hush-lab-panel,
      body[data-page-kind="adversarial-bench"] #hushLabDrawer .telemetry-panel {
        width: 100% !important;
        margin: 0 !important;
        padding: .86rem .72rem !important;
        border-radius: 20px !important;
        overflow: hidden !important;
      }
      body[data-page-kind="adversarial-bench"] #hushLabDrawer .hush-kicker {
        font-size: .72rem !important;
        letter-spacing: .18em !important;
        line-height: 1.15 !important;
      }
      body[data-page-kind="adversarial-bench"] #hushLabDrawer h3 {
        font-size: clamp(1.05rem, 6.2vw, 1.52rem) !important;
        line-height: 1.14 !important;
        letter-spacing: .05em !important;
        overflow-wrap: anywhere !important;
        text-wrap: balance;
      }
      body[data-page-kind="adversarial-bench"] #hushLabDrawer .escape-vector-grid,
      body[data-page-kind="adversarial-bench"] #hushLabDrawer #recognitionFieldGrid {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) !important;
        gap: .54rem !important;
      }
      body[data-page-kind="adversarial-bench"] #hushLabDrawer .metric {
        padding: .64rem .68rem !important;
        border-radius: 14px !important;
      }
      body[data-page-kind="adversarial-bench"] #hushLabDrawer .metric .key,
      body[data-page-kind="adversarial-bench"] #hushLabDrawer .hush-metric-row span {
        font-size: .6rem !important;
        letter-spacing: .14em !important;
        line-height: 1.15 !important;
      }
      body[data-page-kind="adversarial-bench"] #hushLabDrawer .metric .val,
      body[data-page-kind="adversarial-bench"] #hushLabDrawer .hush-metric-row strong {
        font-size: .94rem !important;
        line-height: 1.28 !important;
      }
      body[data-page-kind="adversarial-bench"] #hushLabDrawer .recognition-field-controls {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) !important;
        gap: .56rem !important;
      }
      body[data-page-kind="adversarial-bench"] #hushLabDrawer .hush-field-shell {
        width: 100% !important;
        min-width: 0 !important;
      }
      body[data-page-kind="adversarial-bench"] #hushLabDrawer select,
      body[data-page-kind="adversarial-bench"] #hushLabDrawer textarea,
      body[data-page-kind="adversarial-bench"] #hushLabDrawer input {
        width: 100% !important;
        min-width: 0 !important;
      }
      body[data-page-kind="adversarial-bench"] #hushLabDrawer .iteration-preview-table {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        overflow-x: auto !important;
        white-space: nowrap !important;
        -webkit-overflow-scrolling: touch !important;
      }
      body[data-page-kind="adversarial-bench"] #hushLabDrawer #iterationPreviewBody {
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch !important;
        padding-bottom: .4rem !important;
      }
      body[data-page-kind="adversarial-bench"] #hushLabDrawer .hush-action-row {
        display: grid !important;
        grid-template-columns: minmax(0, 1fr) !important;
        gap: .42rem !important;
      }
      body[data-page-kind="adversarial-bench"] #hushLabDrawer .hush-action-row button {
        width: 100% !important;
        min-width: 0 !important;
        min-height: 2.52rem !important;
        white-space: normal !important;
        line-height: 1.05 !important;
      }
      body[data-page-kind="adversarial-bench"] #hushLabDrawer .bench-mini {
        display: grid !important;
        grid-template-columns: auto minmax(0, 1fr) !important;
        gap: .55rem !important;
        align-items: center !important;
        width: 100% !important;
        min-width: 0 !important;
        font-size: .78rem !important;
        line-height: 1.2 !important;
      }
      body[data-page-kind="adversarial-bench"] #hushLabDrawer .bench-mini input[type="checkbox"] {
        width: 1.15rem !important;
        height: 1.15rem !important;
      }
      body[data-page-kind="adversarial-bench"] #hushLabDrawer #ledgerSummaryBody,
      body[data-page-kind="adversarial-bench"] #hushLabDrawer #personaMemoryBody,
      body[data-page-kind="adversarial-bench"] #hushLabDrawer #recognitionFieldWarnings {
        font-size: .9rem !important;
        line-height: 1.34 !important;
      }
      body[data-page-kind="adversarial-bench"] #hushLabDrawer #ledgerExportOutput,
      body[data-page-kind="adversarial-bench"] #hushLabDrawer #reportExportOutput {
        min-height: 8.5rem !important;
        font-size: .78rem !important;
        line-height: 1.32 !important;
      }
    }
  `;
  doc.head.appendChild(style);
}

function copyForNode(node) {
  const panel = node.parentElement?.closest?.('.hush-lab-panel');
  if (!panel) return 'unavailable until required data exists';
  switch (panel.id) {
    case 'escapeVectorPanel':
      return 'unavailable until transformed output exists';
    case 'recognitionFieldPanel':
      return 'unavailable until output analysis completes';
    case 'personaMemoryPanel':
      return 'unavailable until output is accepted';
    case 'iterationPreviewPanel':
      return 'unavailable until a session row is written';
    case 'reportExportPanel':
      return 'unavailable until report data exists';
    case 'controllerPanel':
      return 'unavailable until controller review runs';
    default:
      return 'unavailable until required data exists';
  }
}

function staleUnavailable(value = '') {
  return /\bunavailable\b/i.test(value) && !/\bunavailable until\b/i.test(value);
}

function normalizeUnavailableText(root) {
  if (!root || normalizing) return;
  normalizing = true;
  try {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent || ['SCRIPT', 'STYLE', 'TEXTAREA', 'INPUT', 'SELECT', 'OPTION'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        return staleUnavailable(node.nodeValue || '') ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((node) => {
      const next = (node.nodeValue || '').replace(/\bunavailable\b/gi, copyForNode(node));
      if (next !== node.nodeValue) node.nodeValue = next;
    });
  } finally {
    normalizing = false;
  }
}

function bind(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench' || doc.body.dataset.hushLabMobilePolish === VERSION) return;
  doc.body.dataset.hushLabMobilePolish = VERSION;
  installStyle(doc);
  const lab = $('hushLabDrawer', doc);
  if (!lab) return;
  normalizeUnavailableText(lab);
  observer = new MutationObserver(() => normalizeUnavailableText(lab));
  observer.observe(lab, { childList: true, subtree: true });
}

if (typeof document !== 'undefined') {
  const run = () => bind(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [320, 900, 1800, 3200].forEach((delay) => window.setTimeout(run, delay));
}

window.__TD613_HUSH_LAB_MOBILE_POLISH__ = { version: VERSION, normalizeUnavailableText };
