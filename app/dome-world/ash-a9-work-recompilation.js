import {
  byId,
  escapeHtml,
  humanize,
  installAshStage,
  publishStageWorldAnswer
} from './ash-a7-a11-recompiler-core.js';

export const ASH_A9_WORK_VERSION = 'td613.ash.a9-work-recompilation/v0.1';

const host = globalThis.window;
const doc = globalThis.document;

const LIFECYCLE_ORDER = Object.freeze([
  'ARRIVAL_UNPERSISTED',
  'READINESS_OBSERVED',
  'CUSTODY_ROOT_PROVISIONAL',
  'CUSTODY_ROOT_VERIFIED',
  'CASE_BOUND',
  'REBUILD_ELIGIBLE',
  'RELEASE_ELIGIBLE',
  'CONTINUITY_SEALED'
]);

const ACTION_FAMILIES = Object.freeze([
  Object.freeze({ family:'preserve', label:'Preserve continuity', workspace:'capsule', required:'ARRIVAL_UNPERSISTED', purpose:'Keep the current local continuity posture inspectable without treating a seal as proof.', answer:'Capsule opens with the current preservation limits and return posture.', receipt:'A Save Point or Capsule receipt exists only after its native owner completes the action.' }),
  Object.freeze({ family:'review', label:'Review bounded work', workspace:'draft', required:'REBUILD_ELIGIBLE', purpose:'Review one kept derivative against source, custody, route, and claim-ceiling obligations.', answer:'The existing Draft review chamber opens; no approval is implied by navigation.', receipt:'A review receipt appears only after the native review action succeeds.' }),
  Object.freeze({ family:'draft', label:'Prepare a derivative', workspace:'draft', required:'REBUILD_ELIGIBLE', purpose:'Prepare one minimized, purpose-shaped derivative under the existing Draft and Hush controls.', answer:'The derivative chamber opens with local fields and provider approval still separate.', receipt:'A draft receipt appears only after Keep this version succeeds.' }),
  Object.freeze({ family:'compare', label:'Compare bounded readings', workspace:'choir', required:'CASE_BOUND', purpose:'Compare declared routes or Readers without converting residue into attribution, truth, or action authority.', answer:'Choir opens for pairwise comparison; no assay runs automatically.', receipt:'A Choir receipt exists only after a deliberate native assay.' }),
  Object.freeze({ family:'route', label:'Record a crossing', workspace:'routes', required:'CASE_BOUND', purpose:'Record what actually left while keeping source bytes and local joining keys separate.', answer:'Route Memory opens; no crossing is recorded by navigation.', receipt:'A route receipt appears only after the existing Record what left action.' }),
  Object.freeze({ family:'verify', label:'Run a Rebuild Test', workspace:'test', required:'CASE_BOUND', purpose:'Test whether a declared Reader can reconstruct what should remain hidden.', answer:'Rebuild Test opens with the current case and route posture; no test runs automatically.', receipt:'A test receipt appears only after a deliberate native test.' }),
  Object.freeze({ family:'save', label:'Create a Save Point', workspace:'save', required:'CASE_BOUND', purpose:'Preserve a continuity snapshot with unanswered questions and next-step posture visible.', answer:'Save Points opens; continuity is not sealed by navigation.', receipt:'A Save Point receipt exists only after the native save action succeeds.' }),
  Object.freeze({ family:'prepare handoff', label:'Prepare destination handoff', workspace:'capsule', required:'RELEASE_ELIGIBLE', purpose:'Prepare a bounded transfer posture without collapsing preparation into boundary crossing.', answer:'Capsule opens for continuity and transfer preparation; the separately gated destination crossing remains closed.', receipt:'A handoff receipt can follow only from the separate destination authority surface.' })
]);

function lifecycleRank(state) {
  const index = LIFECYCLE_ORDER.indexOf(String(state || 'ARRIVAL_UNPERSISTED').toUpperCase());
  return index < 0 ? 0 : index;
}

function readiness(snapshot, action) {
  const current = snapshot?.lifecycle?.exact || 'ARRIVAL_UNPERSISTED';
  const lifecycleReady = lifecycleRank(current) >= lifecycleRank(action.required);
  if (action.family === 'compare' && (snapshot?.counts?.routes || 0) < 2) return Object.freeze({ ready:false, reason:'Two remembered routes are required before a pairwise Choir assay can be meaningful.' });
  if (action.family === 'review' && !snapshot?.latestDraft) return Object.freeze({ ready:false, reason:'Keep one draft version before review.' });
  if (action.family === 'prepare handoff' && !snapshot?.latestRelease) return Object.freeze({ ready:false, reason:'A retained Release Receipt is required before handoff preparation can be treated as ready.' });
  return lifecycleReady
    ? Object.freeze({ ready:true, reason:'Native owner available for deliberate inspection or action.' })
    : Object.freeze({ ready:false, reason:`${action.required} required; current lifecycle state ${current}.` });
}

function actionCard(snapshot, action) {
  const state = readiness(snapshot, action);
  const verb = state.ready ? action.label : `Inspect held ${action.family}`;
  return `<article class="ash-stage-card" data-ash-a9-family="${escapeHtml(action.family)}" data-posture="${state.ready ? 'ready' : 'held'}">
    <p class="ash-stage-kicker">${escapeHtml(action.family)}</p>
    <h3>${escapeHtml(action.label)}</h3>
    <dl class="ash-stage-facts">
      <div><dt>Purpose</dt><dd>${escapeHtml(action.purpose)}</dd></div>
      <div><dt>Action</dt><dd>${escapeHtml(verb)}</dd></div>
      <div><dt>Expected world answer</dt><dd>${escapeHtml(action.answer)}</dd></div>
      <div><dt>Held prerequisites</dt><dd>${escapeHtml(state.ready ? 'None observed for navigation. The native owner may still hold the consequential action.' : state.reason)}</dd></div>
      <div><dt>Receipt / return posture</dt><dd>${escapeHtml(action.receipt)} Return to Work through the primary Work tab.</dd></div>
    </dl>
    <div class="premium-action-row"><button type="button" class="premium-action ${state.ready ? 'primary' : ''}" data-route-workspace="${escapeHtml(action.workspace)}" data-ash-a9-action="${escapeHtml(action.family)}" data-ash-a9-ready="${state.ready}">${escapeHtml(verb)}</button></div>
  </article>`;
}

function priorityItems(snapshot) {
  const nodes = [...(snapshot?.openActions || []), ...(snapshot?.gaps || [])];
  if (!nodes.length) return '<li class="ash-stage-hold">No intended action or evidence gap is currently open. Work may rest without manufacturing a demand.</li>';
  return nodes.map((node, index) => `<li>
    <strong>${String(index + 1).padStart(2, '0')} · ${escapeHtml(node.label || 'Unnamed work item')}</strong>
    <span>${escapeHtml(humanize(node.room_id || 'current room'))} · ${escapeHtml(humanize(node.source_status || 'UNRESOLVED'))} · ${escapeHtml(humanize(node.confidence_posture || 'OPEN'))}</span>
    <small>Purpose: inspect and resolve only what the source and current authority support. Expected world answer: a visible successor state, receipt, or truthful hold.</small>
  </li>`).join('');
}

function completedItems(snapshot) {
  const rows = [
    ['Rebuild Test', snapshot?.latestTest?.test_id, snapshot?.latestTest?.status || 'receipt kept'],
    ['Draft', snapshot?.latestDraft?.draft_id, snapshot?.latestDraft?.status || 'version kept'],
    ['Review', snapshot?.latestReview?.review_id, snapshot?.latestReview?.status || 'review kept'],
    ['Release', snapshot?.latestRelease?.receipt_id, snapshot?.latestRelease?.status || 'receipt kept'],
    ['Save Point', snapshot?.latestSavePoint?.save_point_id, snapshot?.latestSavePoint?.created_at || 'continuity kept']
  ].filter(([, id]) => id);
  for (const receipt of snapshot?.custodyReceipts || []) {
    if (receipt?.receipt_id) rows.push(['Custody', receipt.receipt_id, receipt.status || receipt.receipt_type || 'receipt kept']);
  }
  if (!rows.length) return '<li class="ash-stage-hold">No completed or receipted work is attached to this case yet.</li>';
  return rows.map(([kind, id, posture]) => `<li><strong>${escapeHtml(kind)}</strong><code>${escapeHtml(id)}</code><small>${escapeHtml(humanize(posture))}</small></li>`).join('');
}

function heldItems(snapshot) {
  const held = ACTION_FAMILIES.map(action => ({ action, state:readiness(snapshot, action) })).filter(entry => !entry.state.ready);
  if (!held.length) return '<li class="ash-stage-hold">No stage-level prerequisite is currently held. Native owners still retain their own exact checks.</li>';
  return held.map(({ action, state }) => `<li><strong>${escapeHtml(action.label)}</strong><span>${escapeHtml(state.reason)}</span><small>Inspection remains available; the consequential native action stays held.</small></li>`).join('');
}

function bindWork(root) {
  if (!root || root.dataset.bound === 'true') return;
  root.dataset.bound = 'true';
  root.addEventListener('click', event => {
    const control = event.target.closest('[data-ash-a9-action]');
    if (!control) return;
    const family = control.dataset.ashA9Action;
    const ready = control.dataset.ashA9Ready === 'true';
    publishStageWorldAnswer('A9', ready
      ? `Work routed ${family} to its existing Ash owner. Navigation changed; custody, source bytes, release posture, transport, and human closure did not.`
      : `Work exposed the held ${family} owner for inspection. The prerequisite remains held; no consequential state changed.`);
  });
}

export function renderAshA9Work(snapshot) {
  const target = byId('premiumWorkBody');
  if (!target) return false;
  target.dataset.ashA9Work = ASH_A9_WORK_VERSION;
  if (!snapshot?.caseMap) {
    target.innerHTML = `<section class="ash-stage-card wide" id="ashA9WorkRecompilation"><p class="ash-stage-kicker">Work · human intention</p><h3>Open a case before compiling work</h3><p class="ash-stage-copy">No queue, priority, draft, Hush packet, receipt, or handoff posture is inferred without an explicit local case.</p><div class="premium-action-row"><button type="button" class="premium-action primary" data-command-action="profile">Open cases & profiles</button></div><p class="ash-stage-status" id="ashA9Status" role="status" aria-live="polite">A9 is present; no case work has been compiled.</p></section>`;
    bindWork(byId('ashA9WorkRecompilation'));
    return true;
  }

  const doNow = ACTION_FAMILIES.filter(action => ['verify','route'].includes(action.family));
  const prepare = ACTION_FAMILIES.filter(action => ['preserve','draft','review','compare','save','prepare handoff'].includes(action.family));
  target.innerHTML = `<section class="ash-stage-card wide" id="ashA9WorkRecompilation" aria-labelledby="ashA9WorkTitle">
    <p class="ash-stage-kicker">Work · human intention before machine module</p>
    <h3 id="ashA9WorkTitle">Choose what you are trying to do, then enter the existing owner</h3>
    <p class="ash-stage-copy">Work compiles current case posture into four queues. It does not create a parallel task engine, run Hush, approve a derivative, record a route, seal continuity, cross a boundary, or close the case.</p>
    <div class="ash-stage-grid">
      <section class="ash-stage-card"><p class="ash-stage-kicker">Do now</p><h3>Current bounded attention</h3><ul class="ash-stage-list">${priorityItems(snapshot)}</ul>${doNow.map(action => actionCard(snapshot, action)).join('')}</section>
      <section class="ash-stage-card"><p class="ash-stage-kicker">Prepare</p><h3>Purpose-shaped next work</h3>${prepare.map(action => actionCard(snapshot, action)).join('')}</section>
      <section class="ash-stage-card"><p class="ash-stage-kicker">Waiting / held</p><h3>Prerequisites remain visible</h3><ul class="ash-stage-list">${heldItems(snapshot)}</ul></section>
      <section class="ash-stage-card"><p class="ash-stage-kicker">Completed / receipted</p><h3>Exact local records</h3><ul class="ash-stage-list">${completedItems(snapshot)}</ul><div class="premium-action-row"><button type="button" class="premium-action" data-route-workspace="capsule" data-ash-a9-action="preserve" data-ash-a9-ready="true">Inspect continuity</button></div></section>
    </div>
    <section class="ash-stage-card wide" aria-labelledby="ashA9HushTitle">
      <p class="ash-stage-kicker">Hush integration · bounded register transformation</p><h3 id="ashA9HushTitle">Original → transformation purpose → protected obligations → changed register → side-by-side comparison → Human approval</h3>
      <ol class="ash-stage-list">
        <li><strong>Original</strong> remains locally selected under the Draft owner.</li>
        <li><strong>Transformation purpose</strong> is declared before provider work.</li>
        <li><strong>Protected obligations</strong> are screened locally and remain distinct from provider permission.</li>
        <li><strong>Changed register</strong> returns as a derivative, not as source replacement.</li>
        <li><strong>Side-by-side comparison</strong> keeps omissions, additions, and changed register inspectable.</li>
        <li><strong>Human approval</strong> remains separate from generation, local review, release receipt, and recipient transport.</li>
      </ol>
      <div class="premium-action-row"><button type="button" class="premium-action gold" data-route-workspace="draft" data-ash-a9-action="draft" data-ash-a9-ready="${readiness(snapshot, ACTION_FAMILIES.find(action => action.family === 'draft')).ready}">Open Draft & Hush</button></div>
    </section>
    <section class="ash-stage-card wide" aria-labelledby="ashA9CeilingTitle">
      <p class="ash-stage-kicker">Claim ceiling</p><h3 id="ashA9CeilingTitle">Queue placement grants no truth or release authority</h3>
      <ul class="ash-stage-list"><li>Ready means the Work compiler sees no stage-level prerequisite for entering the native owner; it does not certify completion, safety, truth, identity, authorship, intent, guilt, consent, or permission.</li><li>Held means the prerequisite remains visible. It does not diagnose the operator or forbid inspection.</li><li>Hush output remains a derivative candidate. Generation, review, release, destination crossing, and human closure remain separate gestures.</li></ul>
      <p class="ash-stage-status" id="ashA9Status" role="status" aria-live="polite">Work recompiled into Do now, Prepare, Waiting / held, and Completed / receipted. No Ash authority changed.</p>
    </section>
  </section>`;
  bindWork(byId('ashA9WorkRecompilation'));
  publishStageWorldAnswer('A9', 'Work recompiled around human intention, explicit prerequisites, visible world answers, and receipt/return posture. Existing Ash owners retain every consequential action.');
  return true;
}

installAshStage({
  stage:'A9',
  sync:renderAshA9Work,
  navigationSelectors:'[data-premium-workspace="work"],[data-route-workspace="work"],[data-route-workspace="draft"],[data-route-workspace="test"],[data-route-workspace="routes"],[data-route-workspace="save"],[data-route-workspace="capsule"],[data-route-workspace="choir"]'
});

host && (host.__td613AshA9Work = Object.freeze({
  version:ASH_A9_WORK_VERSION,
  render:renderAshA9Work,
  action_families:ACTION_FAMILIES.map(action => action.family),
  authority_changed:false,
  source_bytes_moved:false,
  human_closure_required:true
}));
