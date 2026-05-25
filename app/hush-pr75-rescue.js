const $ = (id, doc = document) => doc.getElementById(id);

function installStyle(doc = document) {
  if ($('hushPr75RescueStyle', doc)) return;
  const style = doc.createElement('style');
  style.id = 'hushPr75RescueStyle';
  style.textContent = `
    body[data-page-kind="adversarial-bench"]{padding-bottom:max(3rem,env(safe-area-inset-bottom))!important;}
    body[data-page-kind="adversarial-bench"] .shell.hush-instrument{padding-bottom:calc(5rem + env(safe-area-inset-bottom))!important;}
    .hush-input-control-rail{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:.52rem!important;margin:.55rem 0 .7rem!important;width:100%!important;}
    .hush-input-control-rail #analyzeOutputBtn,.hush-input-control-rail #hushPhase32ClearInput{min-height:2.35rem!important;border-radius:999px!important;padding:.5rem .8rem!important;text-align:center!important;text-decoration:none!important;text-transform:uppercase!important;letter-spacing:.18em!important;font-weight:800!important;font-size:.74rem!important;}
    .hush-input-control-rail #analyzeOutputBtn{border:0!important;color:#071013!important;background:linear-gradient(105deg,#c69cff 0%,#89e7ff 52%,#a9f5ff 100%)!important;box-shadow:0 0 26px rgba(137,231,255,.22)!important;}
    .hush-input-control-rail #hushPhase32ClearInput{border:1px solid rgba(137,255,240,.30)!important;background:rgba(5,9,20,.82)!important;color:#f1fff6!important;}
    .hush-phase32-compact-actions #analyzeOutputBtn{display:none!important;}
    .hush-phase32-compact-actions{display:grid!important;grid-template-columns:1fr 1fr!important;gap:.46rem!important;}
    .hush-phase32-compact-actions #generateMaskedOutputBtn,.hush-phase32-compact-actions #copyHushOutputBtn{grid-column:1/-1!important;width:100%!important;min-height:2.65rem!important;}
    .hush-phase32-compact-actions #acceptOutputBtn,.hush-phase32-compact-actions #openHushReviewBtn{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:min(42vw,11rem)!important;width:100%!important;max-width:none!important;min-height:2.05rem!important;padding:.45rem .85rem!important;font-size:.72rem!important;letter-spacing:.16em!important;}
    .hush-phase32-compact-actions #resetBenchBtn{display:none!important;}
    .hush-generator-status[data-tone="ok"]{border-color:rgba(49,255,138,.44)!important;color:#caffdf!important;}
    .hush-generator-status[data-tone="error"]{border-color:rgba(255,103,143,.55)!important;color:#ffd5df!important;}
    @media(max-width:760px){
      .hush-input-control-rail{grid-template-columns:1fr 1fr!important;gap:.44rem!important;}
      .hush-input-control-rail #analyzeOutputBtn,.hush-input-control-rail #hushPhase32ClearInput{min-height:2.15rem!important;font-size:.66rem!important;}
      .hush-phase32-compact-actions #acceptOutputBtn,.hush-phase32-compact-actions #openHushReviewBtn{min-width:0!important;font-size:.66rem!important;}
    }
  `;
  doc.head.appendChild(style);
}

function moveAnalyze(doc = document) {
  const input = $('messageDraftInput', doc);
  if (!input) return;
  let rail = $('hushInputControlRail', doc);
  if (!rail) {
    rail = doc.createElement('div');
    rail.id = 'hushInputControlRail';
    rail.className = 'hush-input-control-rail';
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
    clear.addEventListener('click', () => {
      const field = $('messageDraftInput', doc);
      if (field) field.value = '';
      if (window.__TD613_HUSH_BENCH__?.benchState) window.__TD613_HUSH_BENCH__.benchState.messageDraftText = '';
    });
  }
  if (clear.parentElement !== rail) rail.appendChild(clear);
}

function bindPatch38Transform(doc = document) {
  const button = $('generateMaskedOutputBtn', doc);
  const patch = window.__TD613_HUSH_PATCH38__;
  if (!button || !patch?.runPatch38Transform || button.dataset.pr75Bound === 'true') return false;
  const clone = button.cloneNode(true);
  clone.dataset.pr75Bound = 'true';
  clone.dataset.patch38 = 'true';
  clone.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    patch.runPatch38Transform(doc);
  }, true);
  button.replaceWith(clone);
  const mode = $('hushGeneratorMode', doc);
  const status = $('hushGeneratorStatus', doc);
  if (mode && status) {
    const sync = () => { status.textContent = `Generator mode selected: ${mode.options[mode.selectedIndex]?.textContent || mode.value}.`; };
    mode.addEventListener('change', sync);
    sync();
  }
  return true;
}

function boot(doc = document) {
  if (!doc?.body || doc.body.dataset.pageKind !== 'adversarial-bench') return;
  doc.body.dataset.hushPr75Rescue = 'true';
  installStyle(doc);
  moveAnalyze(doc);
  bindPatch38Transform(doc);
}

if (typeof document !== 'undefined') {
  const run = () => boot(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true }); else run();
  [240, 720, 1400, 2600].forEach((delay) => window.setTimeout(run, delay));
}
