const HUSH_INPUT_CONTROL_RAIL_VERSION = 'hush-input-control-rail/v3-desktop-stylometrics-export';
const $ = (id, doc = document) => doc.getElementById(id);

function installStyle(doc = document) {
  if ($('hushInputControlRailStyle', doc)) return;
  const style = doc.createElement('style');
  style.id = 'hushInputControlRailStyle';
  style.textContent = `
    body[data-page-kind="adversarial-bench"] .hush-input-control-rail {
      display: grid !important;
      grid-template-columns: minmax(0, 1fr) !important;
      gap: .52rem !important;
      width: 100% !important;
      margin: .34rem 0 .44rem !important;
      align-items: stretch !important;
    }
    body[data-page-kind="adversarial-bench"] .hush-input-control-rail + #messageDraftProfile,
    body[data-page-kind="adversarial-bench"] .hush-input-control-rail + .bay-profile {
      margin-top: .12rem !important;
    }
    body[data-page-kind="adversarial-bench"] .hush-input-control-rail #analyzeOutputBtn,
    body[data-page-kind="adversarial-bench"] .hush-input-control-rail #hushPhase32ClearInput,
    body[data-page-kind="adversarial-bench"] .hush-input-control-rail #hushExportStylometrics {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 100% !important;
      min-height: 2.35rem !important;
      border-radius: 999px !important;
      padding: .5rem .8rem !important;
      text-align: center !important;
      text-decoration: none !important;
      text-transform: uppercase !important;
      letter-spacing: .18em !important;
      font-weight: 800 !important;
      font-size: .74rem !important;
      line-height: 1 !important;
      white-space: nowrap !important;
    }
    body[data-page-kind="adversarial-bench"] .hush-input-control-rail #analyzeOutputBtn {
      border: 0 !important;
      color: #071013 !important;
      background: linear-gradient(105deg, #c69cff 0%, #89e7ff 52%, #a9f5ff 100%) !important;
      box-shadow: 0 0 26px rgba(137,231,255,.22) !important;
    }
    body[data-page-kind="adversarial-bench"] .hush-input-control-rail #hushPhase32ClearInput {
      border: 1px solid rgba(137,255,240,.30) !important;
      background: rgba(5,9,20,.82) !important;
      color: #f1fff6 !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.06), 0 0 18px rgba(137,255,240,.10) !important;
    }
    body[data-page-kind="adversarial-bench"] .hush-input-control-rail #hushExportStylometrics {
      display: none !important;
      border: 1px solid rgba(228,198,108,.38) !important;
      background: rgba(16,18,30,.86) !important;
      color: #fff4c8 !important;
      box-shadow: inset 0 1px 0 rgba(255,255,255,.05), 0 0 18px rgba(228,198,108,.10) !important;
    }
    @media (min-width: 901px) {
      body[data-page-kind="adversarial-bench"] .hush-input-control-rail #hushExportStylometrics {
        display: inline-flex !important;
      }
    }
    body[data-page-kind="adversarial-bench"] .hush-phase32-compact-actions #analyzeOutputBtn,
    body[data-page-kind="adversarial-bench"] .hush-phase32-compact-actions #hushPhase32ClearInput {
      display: none !important;
    }
    @media (max-width: 760px) {
      body[data-page-kind="adversarial-bench"] .hush-input-control-rail {
        grid-template-columns: 1fr 1fr !important;
        gap: .44rem !important;
        margin: .28rem 0 .38rem !important;
      }
      body[data-page-kind="adversarial-bench"] .hush-input-control-rail #analyzeOutputBtn,
      body[data-page-kind="adversarial-bench"] .hush-input-control-rail #hushPhase32ClearInput {
        min-height: 2.15rem !important;
        font-size: .66rem !important;
        letter-spacing: .15em !important;
      }
    }
  `;
  doc.head.appendChild(style);
}

function clearInput(doc = document) {
  const field = $('messageDraftInput', doc);
  if (field) {
    field.value = '';
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.focus({ preventScroll: true });
  }
  if (window.__TD613_HUSH_BENCH__?.benchState) window.__TD613_HUSH_BENCH__.benchState.messageDraftText = '';
}

function syncExportButton(doc = document) {
  const button = $('hushExportStylometrics', doc);
  if (!button) return false;
  const input = $('messageDraftInput', doc);
  const bench = window.__TD613_HUSH_BENCH__;
  const profile = $('hushPr76AuthorshipProfileHost', doc);
  const ready = Boolean(input?.value.trim() && (bench?.benchState?.escapeVector || profile && !profile.hidden && profile.textContent.trim()));
  button.disabled = !ready;
  button.setAttribute('aria-disabled', ready ? 'false' : 'true');
  button.title = ready ? 'Export the current local stylometry report as JSON.' : 'Analyze the message first to wake the stylometry export.';
  return ready;
}

function exportStylometrics(doc = document) {
  if (!syncExportButton(doc)) return false;
  $('exportReportJsonBtn', doc)?.click();
  const output = $('reportExportOutput', doc);
  const json = output?.value || '';
  if (!json) return false;
  const view = doc.defaultView;
  if (view?.URL?.createObjectURL && view.Blob) {
    const url = view.URL.createObjectURL(new view.Blob([json], { type: 'application/json' }));
    const link = doc.createElement('a');
    link.href = url;
    link.download = 'td613-hush-stylometrics.json';
    link.click();
    view.setTimeout(() => view.URL.revokeObjectURL(url), 1200);
  }
  return json;
}

function ensureRail(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench') return false;
  const input = $('messageDraftInput', doc);
  if (!input) return false;

  installStyle(doc);

  let rail = $('hushInputControlRail', doc);
  if (!rail) {
    rail = doc.createElement('div');
    rail.id = 'hushInputControlRail';
    rail.className = 'hush-input-control-rail';
  }

  if (rail.parentElement !== input.parentElement || rail.previousElementSibling !== input) {
    input.insertAdjacentElement('afterend', rail);
  }

  const analyze = $('analyzeOutputBtn', doc);
  if (analyze && analyze.parentElement !== rail) rail.appendChild(analyze);

  let clear = $('hushPhase32ClearInput', doc);
  if (!clear) {
    clear = doc.createElement('button');
    clear.id = 'hushPhase32ClearInput';
    clear.type = 'button';
    clear.textContent = 'Clear Input';
  }
  if (clear.dataset.hushInputRailBound !== 'true') {
    clear.dataset.hushInputRailBound = 'true';
    clear.addEventListener('click', () => clearInput(doc));
  }
  if (clear.parentElement !== rail) rail.appendChild(clear);

  let exportButton = $('hushExportStylometrics', doc);
  if (!exportButton) {
    exportButton = doc.createElement('button');
    exportButton.id = 'hushExportStylometrics';
    exportButton.type = 'button';
    exportButton.textContent = 'Export Stylometrics';
    exportButton.disabled = true;
  }
  if (exportButton.dataset.hushStylometricsExportBound !== 'true') {
    exportButton.dataset.hushStylometricsExportBound = 'true';
    exportButton.addEventListener('click', () => exportStylometrics(doc));
  }
  if (exportButton.parentElement !== rail) rail.appendChild(exportButton);
  if (input.dataset.hushStylometricsSync !== 'true') {
    input.dataset.hushStylometricsSync = 'true';
    input.addEventListener('input', () => syncExportButton(doc));
  }
  if (analyze?.dataset.hushStylometricsWake !== 'true') {
    analyze.dataset.hushStylometricsWake = 'true';
    analyze.addEventListener('click', () => [0, 180, 600, 1200].forEach((delay) => window.setTimeout(() => syncExportButton(doc), delay)));
  }
  syncExportButton(doc);
  return true;
}

function boot(doc = document) {
  ensureRail(doc);
}

if (typeof document !== 'undefined') {
  const run = () => boot(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
  [120, 360, 900, 1600, 2800, 4600].forEach((delay) => window.setTimeout(run, delay));
  window.addEventListener('td613:hush:core-ready', run);
}

window.__TD613_HUSH_INPUT_CONTROL_RAIL__ = { version: HUSH_INPUT_CONTROL_RAIL_VERSION, ensureRail, clearInput, syncExportButton, exportStylometrics };

