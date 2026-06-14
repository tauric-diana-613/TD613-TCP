const VERSION = 'hush-corpus-export-placement/v1';

function installCorpusExportPlacement() {
  if (document.getElementById('hushCorpusExportPlacementStyle')) return;
  const style = document.createElement('style');
  style.id = 'hushCorpusExportPlacementStyle';
  style.textContent = `
    #hushPhase31CustomizerPanel:not([hidden]) #hushPhase31CorpusExportLink {
      top: 4.92rem !important;
      right: 2.72rem !important;
      font-size: .43rem !important;
      letter-spacing: .055em !important;
      color: rgba(236,255,244,.96) !important;
      text-shadow: 0 0 8px rgba(49,255,138,.42) !important;
    }
  `;
  document.head.appendChild(style);
}

function boot() {
  installCorpusExportPlacement();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
window.addEventListener('td613:hush:core-ready', boot, { once: true });
window.__TD613_HUSH_CORPUS_EXPORT_PLACEMENT__ = { version: VERSION, installCorpusExportPlacement };
