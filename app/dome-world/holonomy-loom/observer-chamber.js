import { analyzeFiniteChannel } from './observer-channel.js';
import { OBSERVER_CASES, getObserverCase } from './observer-cases.js';

/** Local synthetic inputs only. Never reads the composer, provider state or storage. */
export function mountObserverChamber(root) {
  const doc = root.ownerDocument;
  root.innerHTML = `
    <p class="oc-kicker">INSTRUMENT LAB / SYNTHETIC RESEARCH</p>
    <h2>What could an observer learn?</h2>
    <p>Try a known secret in a small, fully declared world. Compare what an observer already knows, what a route adds, and what becomes visible when clues are joined.</p>
    <p class="oc-boundary">Fictional cases only. This chamber does not read your conversation or call a model. Its results do not certify a real conversation.</p>
    <label class="oc-label" for="ocCase">Choose a question</label>
    <select id="ocCase"></select>
    <p id="ocQuestion"></p>
    <fieldset><legend>What can this observer see?</legend><div id="ocChannels" class="oc-channels"></div></fieldset>
    <p class="oc-note">All selected views are joined. An empty selection measures prior knowledge alone.</p>
    <div class="oc-actions"><button type="button" id="ocRun">Run comparison</button><button type="button" id="ocRest">𝄐 Rest</button><a href="#loomAiWorkspace">Return to workspace</a></div>
    <p id="ocStatus" role="status" aria-live="polite">Choose a case, then run it. Nothing calculated yet.</p>
    <section id="ocResult" hidden aria-label="Synthetic disclosure comparison">
      <p id="ocLesson" class="oc-lesson"></p>
      <div class="oc-table-wrap"><table><caption>Declared finite population · bits of information</caption><thead><tr><th scope="col">Measurement</th><th scope="col">Control route</th><th scope="col">Protected candidate</th></tr></thead><tbody id="ocMetrics"></tbody></table></div>
      <p class="oc-note">For the fair-bit cases, 1 bit means the secret is determined; 0 bits means no information in this declared view. Recovery is the best possible guess under this finite model, not a tested real-world attacker.</p>
      <p id="ocCapture" class="oc-boundary"></p>
      <details id="ocExact"><summary>Inspect the calculation</summary>
        <p>Baseline = knowledge before this route. Additional = information gained beyond that baseline. Total = both together. The permitted task projection is kept separate from observer knowledge.</p>
        <div class="oc-table-wrap"><table><caption>Captured subsets · total information, including baseline</caption><thead><tr><th scope="col">View</th><th scope="col">Control</th><th scope="col">Candidate</th></tr></thead><tbody id="ocSubsets"></tbody></table></div>
        <p>Signed excess compares the joined additional information with the sum of its marginal contributions. Negative values can mean duplicate disclosure. It is not a privacy verdict.</p>
        <pre id="ocCalculation"></pre>
        <details><summary>Declared synthetic population</summary><pre id="ocPopulation"></pre></details>
      </details>
    </section>
    <p class="oc-ceiling">Golden Egg: UNEARNED · Independent empirical acquisition: HELD</p>`;
  const $ = selector => root.querySelector(selector);
  let result = null;
  for (const item of OBSERVER_CASES) {
    const option = doc.createElement('option'); option.value = item.id; option.textContent = item.title; $('#ocCase').append(option);
  }
  function invalidate(message) {
    result = null; root.dataset.analysisState = 'NOT_RUN'; $('#ocResult').hidden = true;
    $('#ocCalculation').textContent = ''; $('#ocPopulation').textContent = '';
    $('#ocMetrics').replaceChildren(); $('#ocSubsets').replaceChildren();
    $('#ocExact').open = false; $('#ocStatus').textContent = message;
  }
  function choose() {
    const item = getObserverCase($('#ocCase').value);
    $('#ocQuestion').textContent = item.question; $('#ocChannels').replaceChildren();
    for (const channel of item.channels) {
      const label = doc.createElement('label'), input = doc.createElement('input');
      input.type = 'checkbox'; input.value = channel.id; input.checked = true;
      label.append(input, doc.createTextNode(channel.label)); $('#ocChannels').append(label);
    }
    invalidate('Case selected. Run comparison to calculate this observer’s view.');
  }
  const number = value => value === null || value === undefined ? 'HELD · missing channel' : `${Number(value.toFixed(6))} bits`;
  const percent = value => `${Number((value * 100).toFixed(2))}%`;
  function tableRow(parent, label, control, candidate) {
    const tr = doc.createElement('tr'), th = doc.createElement('th'); th.scope = 'row'; th.textContent = label; tr.append(th);
    for (const text of [control, candidate]) { const td = doc.createElement('td'); td.textContent = text; tr.append(td); }
    parent.append(tr);
  }
  function run() {
    const item = getObserverCase($('#ocCase').value);
    const selected = [...$('#ocChannels').querySelectorAll('input:checked')].map(input => input.value);
    result = analyzeFiniteChannel(item, selected);
    root.dataset.analysisState = result.status;
    if (result.status === 'INADMISSIBLE') { $('#ocStatus').textContent = 'Calculation rejected: malformed synthetic case.'; return; }
    $('#ocMetrics').replaceChildren(); $('#ocSubsets').replaceChildren();
    const routes = [result.routes.control, result.routes.protected];
    for (const [label, key] of [['Already known', 'baseline_bits'], ['Added by this view', 'additional_bits'], ['Total disclosed', 'total_bits'], ['Still uncertain', 'remaining_bits']]) {
      tableRow($('#ocMetrics'), label, ...routes.map(route => number(key === 'baseline_bits' ? result.baseline_bits : route.selected_view?.[key])));
    }
    tableRow($('#ocMetrics'), 'Best guess before route', ...routes.map(route => percent(route.captured_subview.baseline_recovery)));
    tableRow($('#ocMetrics'), 'Best guess after route', ...routes.map(route => route.selected_view ? percent(route.selected_view.total_recovery) : 'HELD · missing channel'));
    tableRow($('#ocMetrics'), 'Authorized task correct', ...routes.map(route => percent(route.authorized_accuracy)));
    tableRow($('#ocMetrics'), 'Signed joining excess', ...routes.map(route => number(route.signed_excess_bits)));
    const union = new Map();
    for (const route of routes) for (const subset of route.subsets) union.set(JSON.stringify(subset.channels), subset.channels);
    for (const [key, ids] of union) {
      const label = ids.length ? ids.map(id => item.channels.find(channel => channel.id === id).label).join(' + ') : 'Prior knowledge only';
      tableRow($('#ocSubsets'), label, ...routes.map(route => {
        const subset = route.subsets.find(entry => JSON.stringify(entry.channels) === key);
        return subset ? number(subset.total_bits) : 'HELD · missing channel';
      }));
    }
    $('#ocLesson').textContent = item.lesson;
    const missing = routes.flatMap((route, index) => route.missing_channels.map(id => `${index ? 'candidate' : 'control'} / ${id}`));
    $('#ocCapture').textContent = missing.length
      ? `Missing capture: ${missing.join(', ')}. The selected combined view is held. Captured subsets below are limited calculations, never a substitute for the missing channel.`
      : 'Every selected channel has a declared value in this synthetic population. Channels outside this boundary remain untested.';
    $('#ocCalculation').textContent = JSON.stringify(result, null, 2);
    $('#ocPopulation').textContent = JSON.stringify(item, null, 2);
    $('#ocResult').hidden = false;
    $('#ocStatus').textContent = result.status === 'HELD_MISSING_CHANNELS'
      ? 'HELD: a selected channel is missing. Captured subsets remain inspectable.'
      : 'Calculated from the declared synthetic population. This is not a privacy pass.';
  }
  function rest() { invalidate('𝄐 Rest. Calculation cleared; nothing is running or sent.'); }
  function changed() { invalidate('Observer changed. Run comparison again; the previous result no longer applies.'); }
  $('#ocCase').addEventListener('change', choose);
  $('#ocChannels').addEventListener('change', changed);
  $('#ocRun').addEventListener('click', run);
  $('#ocRest').addEventListener('click', rest);
  choose();
  return { inspect: () => result, destroy() {
    $('#ocCase').removeEventListener('change', choose); $('#ocChannels').removeEventListener('change', changed);
    $('#ocRun').removeEventListener('click', run); $('#ocRest').removeEventListener('click', rest);
    root.replaceChildren(); result = null;
  } };
}

if (typeof document !== 'undefined') {
  const root = document.getElementById('loomObserverChamber');
  if (root) mountObserverChamber(root);
  if (root && location.hash === '#loomObserverChamber') {
    for (let parent = root.parentElement; parent; parent = parent.parentElement) if (parent.tagName === 'DETAILS') parent.open = true;
  }
}
