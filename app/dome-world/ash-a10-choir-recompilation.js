import {
  byId,
  escapeHtml,
  humanize,
  installAshStage,
  publishStageWorldAnswer
} from './ash-a7-a11-recompiler-core.js';

export const ASH_A10_CHOIR_VERSION = 'td613.ash.a10-choir-recompilation/v0.1';

const host = globalThis.window;
const doc = globalThis.document;

const RESIDUE_CLASSES = Object.freeze([
  Object.freeze({ name:'Shared', meaning:'Both singleton readings already expose the same bounded relation.' }),
  Object.freeze({ name:'Pair-emergent', meaning:'The relation appears only when the selected readings are combined.' }),
  Object.freeze({ name:'Contradictory', meaning:'The readings make non-equivalent claims that remain visibly in tension.' }),
  Object.freeze({ name:'Missing', meaning:'A required source, route, comparison, or control is absent.' }),
  Object.freeze({ name:'Unresolved', meaning:'The available observations do not support lawful closure.' })
]);

function declaredRoutes(snapshot) {
  return snapshot?.routeMemory?.entries || [];
}

function singletonRows(snapshot) {
  const routes = declaredRoutes(snapshot);
  if (!routes.length) {
    return '<tr><td colspan="5">No remembered route is available. Record actual crossings before treating Choir as comparison-ready.</td></tr>';
  }
  return routes.map((entry, index) => `<tr>
    <td>${String(index + 1).padStart(2, '0')}</td>
    <td>${escapeHtml(humanize(entry.recipient_class || 'declared reader'))}</td>
    <td>${escapeHtml(humanize(entry.purpose || 'purpose unresolved'))}</td>
    <td>${escapeHtml(String(entry.disclosed_opaque_references?.length || 0))} opaque references</td>
    <td><code>${escapeHtml(entry.route_id || entry.entry_id || `route_${index + 1}`)}</code></td>
  </tr>`).join('');
}

function readiness(snapshot) {
  const routeCount = declaredRoutes(snapshot).length;
  if (!snapshot?.caseMap) return Object.freeze({ ready:false, message:'Open one explicit local case before compiling Choir.' });
  if (routeCount < 2) return Object.freeze({ ready:false, message:`Two remembered routes are required; ${routeCount} is currently available.` });
  return Object.freeze({ ready:true, message:`${routeCount} remembered routes are available for deliberate pair selection.` });
}

function ensureOrientation() {
  const workspace = byId('workspace-choir');
  if (!workspace) return null;
  let root = byId('ashA10ChoirOrientation');
  if (!root) {
    root = doc.createElement('section');
    root.id = 'ashA10ChoirOrientation';
    root.className = 'ash-stage-card wide';
    root.setAttribute('aria-labelledby', 'ashA10ChoirTitle');
    const head = workspace.querySelector('.workspace-head');
    if (head) head.insertAdjacentElement('afterend', root);
    else workspace.prepend(root);
  }
  return root;
}

function bindChoir(root) {
  if (!root || root.dataset.bound === 'true') return;
  root.dataset.bound = 'true';
  root.addEventListener('click', event => {
    const control = event.target.closest('[data-ash-a10-action]');
    if (!control) return;
    const action = control.dataset.ashA10Action;
    publishStageWorldAnswer('A10', action === 'hold-interpretation'
      ? 'Human interpretation remains an editable local view draft. Choir did not convert it into attribution, truth, storage, custody, release, or action authority.'
      : 'Choir exposed the requested bounded instrument. Navigation changed; no assay, Rebuild Test, storage mutation, release, or closure occurred automatically.');
  });
}

export function renderAshA10Choir(snapshot) {
  const root = ensureOrientation();
  if (!root) return false;
  const state = readiness(snapshot);
  const routeCount = declaredRoutes(snapshot).length;
  root.dataset.ashA10Choir = ASH_A10_CHOIR_VERSION;
  root.innerHTML = `<p class="ash-stage-kicker">Choir · pairwise comparison and reconstruction laboratory</p>
    <h3 id="ashA10ChoirTitle">Choir compares bounded readings to show what appears only in combination, what remains disagreement, and what no Reader can establish.</h3>
    <p class="ash-stage-copy">Choose two Readers or declared routes, inspect what each receives alone, run the pair through the existing local Choir owner, render the residue field, classify the residue, preserve human interpretation, then rest or test another pair.</p>
    <div class="ash-stage-grid">
      <section class="ash-stage-card">
        <p class="ash-stage-kicker">Singletons before combination</p>
        <h3>What each receives alone</h3>
        <div class="ash-stage-table-wrap"><table class="ash-stage-table"><thead><tr><th>#</th><th>Declared Reader / recipient</th><th>Purpose</th><th>Visible alone</th><th>Exact route</th></tr></thead><tbody>${singletonRows(snapshot)}</tbody></table></div>
        <p class="ash-stage-status">${escapeHtml(state.message)}</p>
      </section>
      <section class="ash-stage-card">
        <p class="ash-stage-kicker">Pair sequence</p>
        <h3>One comparison, one visible world answer</h3>
        <ol class="ash-stage-list">
          <li><strong>Choose two Readers or routes.</strong> Selection grants no truth authority.</li>
          <li><strong>Show each singleton.</strong> Keep what each receives alone visible before combination.</li>
          <li><strong>Run the pair.</strong> Use the existing deterministic Pairwise Moiré control below; A10 performs no automatic assay.</li>
          <li><strong>Render residue.</strong> The native receipt and matrix remain the exact observed answer.</li>
          <li><strong>Classify without closing.</strong> Shared, Pair-emergent, Contradictory, Missing, or Unresolved remain non-equivalent.</li>
          <li><strong>Preserve human interpretation.</strong> The person names significance; the instrument does not infer it.</li>
          <li><strong>Rest or test another pair.</strong> Repetition remains deliberate.</li>
        </ol>
      </section>
    </div>
    <section class="ash-stage-card wide" aria-labelledby="ashA10ResidueTitle">
      <p class="ash-stage-kicker">Residue field · human classification</p>
      <h3 id="ashA10ResidueTitle">Five lawful postures after the pair answers</h3>
      <div class="ash-stage-grid">${RESIDUE_CLASSES.map(item => `<article class="ash-stage-card"><p class="ash-stage-kicker">${escapeHtml(item.name)}</p><h3>${escapeHtml(item.name)}</h3><p class="ash-stage-copy">${escapeHtml(item.meaning)}</p></article>`).join('')}</div>
      <form class="ash-stage-form" aria-label="Human Choir interpretation draft" onsubmit="return false">
        <label>Human residue classification<select id="ashA10ResidueClass"><option value="">Hold classification open</option>${RESIDUE_CLASSES.map(item => `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)}</option>`).join('')}</select></label>
        <label class="wide">Human interpretation<textarea id="ashA10HumanInterpretation" placeholder="Record what the pair may mean, what it cannot establish, and what remains missing."></textarea></label>
        <div class="wide premium-action-row"><button type="button" class="premium-action" data-ash-a10-action="hold-interpretation">Hold interpretation in this view</button></div>
      </form>
    </section>
    <section class="ash-stage-card wide" aria-labelledby="ashA10RebuildTitle">
      <p class="ash-stage-kicker">Rebuild Test · principal Choir instrument</p>
      <h3 id="ashA10RebuildTitle">Can a Reader reconstruct what should remain hidden?</h3>
      <p class="ash-stage-copy">Choir explains and routes into the existing advanced Rebuild Test room. That room remains a separate technical owner because comparison and reconstruction testing carry different procedures and receipts.</p>
      <dl class="ash-stage-facts">
        <div><dt>Choir authority</dt><dd>Compare bounded singleton and pair observations; render residue for human interpretation.</dd></div>
        <div><dt>Rebuild authority</dt><dd>Test a declared Reader against protected reconstruction boundaries through its existing owner.</dd></div>
        <div><dt>Current readiness</dt><dd>${escapeHtml(state.message)}</dd></div>
        <div><dt>World answer</dt><dd>Opening Rebuild Test changes the visible workspace only. No test runs until the deliberate native action.</dd></div>
      </dl>
      <div class="premium-action-row"><button type="button" class="premium-action primary" data-route-workspace="test" data-ash-a10-action="open-rebuild">Open Rebuild Test</button><button type="button" class="premium-action" data-route-workspace="choir" data-ash-a10-action="rest-choir">Rest or test another pair</button></div>
    </section>
    <section class="ash-stage-card wide" aria-labelledby="ashA10CeilingTitle">
      <p class="ash-stage-kicker">Claim ceiling</p>
      <h3 id="ashA10CeilingTitle">Residue remains an observed relation, not a verdict</h3>
      <ul class="ash-stage-list"><li>Shared does not prove common authorship, intent, causation, identity, consent, coordination, or truth.</li><li>Pair-emergent does not prove conspiracy, hidden agency, surveillance probability, or release prohibition.</li><li>Contradictory, Missing, and Unresolved remain reportable postures rather than defects the interface may silently repair.</li><li>Choir and Rebuild Test may produce bounded receipts; neither may mutate custody, move source bytes, approve release, cross a destination boundary, or close the case.</li></ul>
      <p class="ash-stage-status" id="ashA10Status" role="status" aria-live="polite">A10 compiled ${routeCount} declared route${routeCount === 1 ? '' : 's'} into singleton-first Choir orientation. Human interpretation and closure remain required.</p>
    </section>`;
  const run = byId('runPremiumChoir');
  if (run) run.setAttribute('aria-describedby', 'ashA10ChoirTitle ashA10ResidueTitle ashA10CeilingTitle');
  bindChoir(root);
  publishStageWorldAnswer('A10', 'Choir recompiled around singleton visibility, deliberate pairing, residue classification, Rebuild Test relation, rest, and a strict claim ceiling. Existing Ash owners retain every consequential action.');
  return true;
}

installAshStage({
  stage:'A10',
  sync:renderAshA10Choir,
  navigationSelectors:'[data-premium-workspace="choir"],[data-route-workspace="choir"],[data-route-workspace="test"],#runPremiumChoir,#replayPremiumChoir'
});

if (host) host.__td613AshA10Choir = Object.freeze({
  version:ASH_A10_CHOIR_VERSION,
  residue_classes:RESIDUE_CLASSES.map(item => item.name),
  automatic_assay:false,
  automatic_rebuild_test:false,
  human_interpretation_required:true,
  authority_changed:false,
  source_bytes_moved:false,
  human_closure_required:true,
  render:renderAshA10Choir
});
