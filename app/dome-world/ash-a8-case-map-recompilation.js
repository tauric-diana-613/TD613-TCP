import {
  byId,
  escapeHtml,
  humanize,
  installAshStage,
  publishStageWorldAnswer
} from './ash-a7-a11-recompiler-core.js';

export const ASH_A8_CASE_MAP_VERSION = 'td613.ash.a8-case-map-recompilation/v0.1';

const host = globalThis.window;
const doc = globalThis.document;
let pendingObjectName = null;
let pendingRelation = null;
let lastCreatedObject = null;
let lastCreatedRelation = null;

function currentSnapshot(fallback = null) {
  return host?.__td613AshPremiumUI?.snapshot?.() || fallback;
}

function optionMarkup(select, selected = '') {
  return [...(select?.options || [])].map(option => `<option value="${escapeHtml(option.value)}"${option.value === selected ? ' selected' : ''}>${escapeHtml(option.textContent)}</option>`).join('');
}

function nodeLabel(snapshot, id) {
  return snapshot?.caseMap?.nodes?.find(node => node.id === id)?.label || id || 'Choose an object';
}

function relationRows(snapshot) {
  const relations = snapshot?.caseMap?.relationships || [];
  if (!relations.length) return '<li class="ash-stage-hold">No stored relationship yet. Add two objects, choose a plain relation, preview the direction, then commit deliberately.</li>';
  return relations.map(relation => `<li id="ashA8Relation-${escapeHtml(relation.id)}">
    <strong>${escapeHtml(nodeLabel(snapshot, relation.from))}</strong>
    <span> —${escapeHtml(humanize(relation.type || 'related to').toLowerCase())}→ </span>
    <strong>${escapeHtml(nodeLabel(snapshot, relation.to))}</strong>
    <small>Stored relation <code>${escapeHtml(relation.id)}</code>. Source posture, uncertainty, contradiction, and local notes remain inspectable; none of them become truth by storage.</small>
    <button class="premium-action" type="button" data-ash-a8-inspect-relation="${escapeHtml(relation.id)}">Inspect stored relationship</button>
  </li>`).join('');
}

function copyToLegacy(id, value) {
  const control = byId(id);
  if (!control) return false;
  control.value = value;
  control.dispatchEvent(new Event('input', { bubbles:true }));
  control.dispatchEvent(new Event('change', { bubbles:true }));
  return true;
}

function appendResearchNote(kind, detail) {
  const notes = byId('researchNotes');
  if (!notes) return false;
  const line = `[A8 ${kind}] known=${detail.known || 'not stated'}; uncertain=${detail.uncertain || 'not stated'}; evidence=${detail.evidence || 'not stated'}; notes=${detail.notes || 'none'}`;
  notes.value = [notes.value.trim(), line].filter(Boolean).join('\n');
  notes.dispatchEvent(new Event('input', { bubbles:true }));
  notes.dispatchEvent(new Event('change', { bubbles:true }));
  return true;
}

function objectPreview() {
  const name = byId('ashA8ObjectName')?.value.trim() || 'Unnamed object';
  const type = byId('ashA8ObjectType')?.selectedOptions?.[0]?.textContent || 'Choose a type';
  const room = byId('ashA8ObjectRoom')?.selectedOptions?.[0]?.textContent || 'Choose a room';
  const known = byId('ashA8ObjectKnown')?.value.trim() || 'Nothing declared yet.';
  const uncertain = byId('ashA8ObjectUncertain')?.value.trim() || 'Uncertainty not yet recorded.';
  const target = byId('ashA8ObjectPreview');
  if (target) target.innerHTML = `<strong>${escapeHtml(name)}</strong><span>${escapeHtml(type)} · ${escapeHtml(room)}</span><p>Known: ${escapeHtml(known)}</p><p>Uncertain: ${escapeHtml(uncertain)}</p><em>Preview only. No map state changed.</em>`;
}

function relationPreview(snapshot) {
  const from = byId('ashA8RelationFrom')?.value || '';
  const to = byId('ashA8RelationTo')?.value || '';
  const type = byId('ashA8RelationType')?.value.trim() || 'choose relation';
  const target = byId('ashA8RelationPreview');
  if (target) target.innerHTML = `<strong>${escapeHtml(nodeLabel(snapshot, from))}</strong><span> —— ${escapeHtml(type)} ——&gt; </span><strong>${escapeHtml(nodeLabel(snapshot, to))}</strong><p>Direction: Object A → Object B. Reverse it by swapping the two object cards.</p><p>Evidence: ${escapeHtml(byId('ashA8RelationEvidence')?.value.trim() || 'not yet stated')}</p><p>Uncertainty: ${escapeHtml(byId('ashA8RelationUncertain')?.value.trim() || 'not yet stated')}</p><em>Preview only. Relation authority remains with the existing Ash map engine.</em>`;
}

function revealAccessibleTable() {
  const table = byId('accessibleTable');
  if (!table) return false;
  table.classList.add('active');
  table.scrollIntoView?.({ block:'start', behavior:'auto' });
  publishStageWorldAnswer('A8', 'The existing accessible object table is now visible. No case state, custody, release posture, or closure authority changed.');
  return true;
}

function renderRelationDetail(snapshot, relationId) {
  const relation = snapshot?.caseMap?.relationships?.find(item => item.id === relationId);
  const target = byId('ashA8RelationDetail');
  if (!target || !relation) return false;
  target.hidden = false;
  target.innerHTML = `<p class="ash-stage-kicker">Stored relationship detail</p>
    <h3>${escapeHtml(nodeLabel(snapshot, relation.from))} ${escapeHtml(humanize(relation.type || 'related to').toLowerCase())} ${escapeHtml(nodeLabel(snapshot, relation.to))}</h3>
    <dl class="ash-stage-facts">
      <div><dt>Direction</dt><dd>${escapeHtml(nodeLabel(snapshot, relation.from))} → ${escapeHtml(nodeLabel(snapshot, relation.to))}</dd></div>
      <div><dt>Source posture</dt><dd>${escapeHtml(humanize(relation.source_status || 'SUPPLIED'))}</dd></div>
      <div><dt>Uncertainty</dt><dd>${escapeHtml(humanize(relation.confidence_posture || 'OPEN'))}</dd></div>
      <div><dt>Disclosure</dt><dd>${escapeHtml(humanize(relation.disclosure_state || 'LOCAL'))}</dd></div>
      <div><dt>Exact relation ID</dt><dd><code>${escapeHtml(relation.id)}</code></dd></div>
    </dl>
    <p class="ash-stage-copy">Context and history remain in the local Research Notes lane. Stored relation ≠ truth, causation, intent, identity, or release authority.</p>`;
  target.scrollIntoView?.({ block:'start', behavior:'auto' });
  return true;
}

function resolvePending(snapshot) {
  if (pendingObjectName) {
    const object = snapshot?.caseMap?.nodes?.find(node => node.label === pendingObjectName);
    if (object) {
      lastCreatedObject = Object.freeze({ id:object.id, label:object.label });
      pendingObjectName = null;
    }
  }
  if (pendingRelation) {
    const relation = [...(snapshot?.caseMap?.relationships || [])].reverse().find(item =>
      item.from === pendingRelation.from && item.to === pendingRelation.to && item.type === pendingRelation.type);
    if (relation) {
      lastCreatedRelation = Object.freeze({ id:relation.id, ...pendingRelation });
      pendingRelation = null;
    }
  }
}

function commitObject() {
  const name = byId('ashA8ObjectName')?.value.trim();
  if (!name) return publishStageWorldAnswer('A8', 'Object held: name what you are placing before the deliberate Add gesture. No map state changed.');
  const detail = {
    known:byId('ashA8ObjectKnown')?.value.trim(),
    uncertain:byId('ashA8ObjectUncertain')?.value.trim(),
    evidence:byId('ashA8ObjectEvidence')?.value.trim(),
    notes:byId('ashA8ObjectNotes')?.value.trim()
  };
  copyToLegacy('objectName', name);
  copyToLegacy('objectType', byId('ashA8ObjectType')?.value || 'artifact');
  copyToLegacy('objectRoom', byId('ashA8ObjectRoom')?.value || '');
  copyToLegacy('objectSource', byId('ashA8ObjectSource')?.value || 'UNRESOLVED');
  appendResearchNote('object', detail);
  pendingObjectName = name;
  byId('addObject')?.click();
  return publishStageWorldAnswer('A8', `Ash delegated “${name}” to the existing map engine. Storage confirmation remains pending until the native Case Map emits its successor state.`);
}

function commitRelation(snapshot) {
  const from = byId('ashA8RelationFrom')?.value || '';
  const to = byId('ashA8RelationTo')?.value || '';
  const type = byId('ashA8RelationType')?.value.trim();
  if (!from || !to || !type) return publishStageWorldAnswer('A8', 'Relationship held: choose Object A, Object B, and a plain relation before commit. No relation was created.');
  if (from === to) return publishStageWorldAnswer('A8', 'Relationship held: Object A and Object B must be different. No relation was created.');
  const detail = {
    known:`${nodeLabel(snapshot, from)} ${type} ${nodeLabel(snapshot, to)}`,
    uncertain:byId('ashA8RelationUncertain')?.value.trim(),
    evidence:byId('ashA8RelationEvidence')?.value.trim(),
    notes:byId('ashA8RelationNotes')?.value.trim()
  };
  copyToLegacy('linkFrom', from);
  copyToLegacy('linkTo', to);
  copyToLegacy('linkType', type);
  appendResearchNote('relationship', detail);
  pendingRelation = Object.freeze({ from, to, type, committed_at:new Date().toISOString() });
  byId('addRelationship')?.click();
  return publishStageWorldAnswer('A8', `Ash delegated one directed relation to the existing map engine: ${nodeLabel(snapshot, from)} ${type} ${nodeLabel(snapshot, to)}. Storage confirmation remains pending.`);
}

function bindWorkshop(snapshot) {
  const root = byId('ashA8RelationWorkshop');
  if (!root || root.dataset.bound === 'true') return;
  root.dataset.bound = 'true';
  root.addEventListener('input', event => {
    if (event.target.closest('#ashA8ObjectForm')) objectPreview();
    if (event.target.closest('#ashA8RelationForm')) relationPreview(currentSnapshot(snapshot));
  });
  root.addEventListener('change', event => {
    if (event.target.closest('#ashA8ObjectForm')) objectPreview();
    if (event.target.closest('#ashA8RelationForm')) relationPreview(currentSnapshot(snapshot));
  });
  root.addEventListener('click', event => {
    const objectCommit = event.target.closest('#ashA8CommitObject');
    if (objectCommit) { event.preventDefault(); commitObject(); return; }
    const relationCommit = event.target.closest('#ashA8CommitRelation');
    if (relationCommit) { event.preventDefault(); commitRelation(currentSnapshot(snapshot)); return; }
    const tableControl = event.target.closest('[data-ash-a8-open-table]');
    if (tableControl) { event.preventDefault(); revealAccessibleTable(); return; }
    const inspect = event.target.closest('[data-ash-a8-inspect-relation]');
    if (inspect) {
      event.preventDefault();
      renderRelationDetail(currentSnapshot(snapshot), inspect.dataset.ashA8InspectRelation);
    }
  });
}

export function renderAshA8CaseMap(snapshot) {
  const workspace = byId('workspace-map');
  const mapLayout = workspace?.querySelector('.map-layout');
  if (!workspace || !mapLayout) return false;
  resolvePending(snapshot);
  let root = byId('ashA8RelationWorkshop');
  const legacyType = byId('objectType');
  const legacyRoom = byId('objectRoom');
  const legacySource = byId('objectSource');
  const legacyFrom = byId('linkFrom');
  const legacyTo = byId('linkTo');
  if (!root) {
    root = doc.createElement('section');
    root.id = 'ashA8RelationWorkshop';
    root.className = 'ash-stage-card wide';
    root.setAttribute('aria-labelledby', 'ashA8RelationWorkshopTitle');
    mapLayout.insertAdjacentElement('beforebegin', root);
  }
  root.dataset.ashA8CaseMap = ASH_A8_CASE_MAP_VERSION;
  const confirmation = lastCreatedRelation
    ? `Stored relationship confirmed: ${nodeLabel(snapshot, lastCreatedRelation.from)} ${lastCreatedRelation.type} ${nodeLabel(snapshot, lastCreatedRelation.to)}. Inspect it below.`
    : lastCreatedObject
      ? `Stored object confirmed: ${lastCreatedObject.label}. It is now available in the relationship cards.`
      : 'No new object or relation has been confirmed in this session.';
  root.innerHTML = `
    <p class="ash-stage-kicker">Case Map · relation workshop</p>
    <h3 id="ashA8RelationWorkshopTitle">Place one object, then make one relation visible</h3>
    <p class="ash-stage-copy">Plain relation comes first. Technical IDs, source enums, exact state, and claim ceilings remain available under Inspection. The existing Ash map engine still owns every stored object and relationship.</p>
    <div class="ash-stage-grid">
      <section class="ash-stage-card" aria-labelledby="ashA8ObjectTitle">
        <p class="ash-stage-kicker">Add to the map</p><h3 id="ashA8ObjectTitle">What are you placing?</h3>
        <div class="ash-stage-form" id="ashA8ObjectForm">
          <label class="wide">Plain name<input id="ashA8ObjectName" placeholder="Example: interview transcript"></label>
          <label>Plain type<select id="ashA8ObjectType">${optionMarkup(legacyType, legacyType?.value)}</select></label>
          <label>Where it belongs<select id="ashA8ObjectRoom">${optionMarkup(legacyRoom, legacyRoom?.value)}</select></label>
          <label class="wide">What is known<textarea id="ashA8ObjectKnown" placeholder="State only what the source supports."></textarea></label>
          <label class="wide">What remains uncertain<textarea id="ashA8ObjectUncertain" placeholder="Name missing, contradictory, or unresolved material."></textarea></label>
          <label>Evidence/source<input id="ashA8ObjectEvidence" placeholder="receipt, note, or source reference"></label>
          <label>Source posture<select id="ashA8ObjectSource">${optionMarkup(legacySource, legacySource?.value)}</select></label>
          <label class="wide">Notes/history<textarea id="ashA8ObjectNotes" placeholder="Local human note; never converted into truth."></textarea></label>
        </div>
        <div id="ashA8ObjectPreview" class="ash-stage-hold" aria-live="polite">Preview waits for a plain name. No map state changed.</div>
        <div class="premium-action-row"><button type="button" class="premium-action primary ash-stage-primary-action" id="ashA8CommitObject">Add deliberately</button><button type="button" class="premium-action" data-route-workspace="rooms">Inspect Rooms</button></div>
      </section>
      <section class="ash-stage-card" aria-labelledby="ashA8RelationTitle">
        <p class="ash-stage-kicker">Connect two objects</p><h3 id="ashA8RelationTitle">Object A —— choose relation ——&gt; Object B</h3>
        <div class="ash-stage-form" id="ashA8RelationForm">
          <label>Object A<select id="ashA8RelationFrom">${optionMarkup(legacyFrom, legacyFrom?.value)}</select></label>
          <label>Object B<select id="ashA8RelationTo">${optionMarkup(legacyTo, legacyTo?.value)}</select></label>
          <label class="wide">Plain relation<input id="ashA8RelationType" placeholder="supports, precedes, contradicts…"></label>
          <div class="ash-stage-hold wide"><strong>Direction: A → B.</strong> Reverse the stored direction by swapping the object cards; the engine has no undirected relation state.</div>
          <label>Evidence/source<input id="ashA8RelationEvidence" placeholder="source or receipt reference"></label>
          <label class="wide">Uncertainty<textarea id="ashA8RelationUncertain" placeholder="What remains unresolved about this link?"></textarea></label>
          <label class="wide">Notes/history<textarea id="ashA8RelationNotes" placeholder="Local contextual note"></textarea></label>
        </div>
        <div id="ashA8RelationPreview" class="ash-stage-hold" aria-live="polite">Choose two objects and a plain relation to preview direction. No relation exists yet.</div>
        <div class="premium-action-row"><button type="button" class="premium-action primary ash-stage-primary-action" id="ashA8CommitRelation">Commit relationship</button><button type="button" class="premium-action" data-ash-a8-open-table>Open accessible table</button></div>
      </section>
    </div>
    <section class="ash-stage-card wide" aria-labelledby="ashA8InspectionTitle">
      <p class="ash-stage-kicker">Relationship inspection</p><h3 id="ashA8InspectionTitle">Stored relationships, contradictions, missingness, notes, and source posture</h3>
      <ul class="ash-stage-list" id="ashA8RelationshipList">${relationRows(snapshot)}</ul>
      <section class="ash-stage-hold" id="ashA8RelationDetail" hidden></section>
      <div class="premium-action-row"><a class="premium-action" href="#mapStage">Graph view</a><a class="premium-action" href="#selectionTitle">Object detail</a><a class="premium-action" href="#researchNotes">Notes and history</a><button type="button" class="premium-action" data-ash-a8-open-table>Accessible table</button><button type="button" class="premium-action" data-route-workspace="routes">Inspect Routes</button></div>
      <p class="ash-stage-status" id="ashA8Status" role="status" aria-live="polite">${escapeHtml(confirmation)}</p>
    </section>`;
  bindWorkshop(snapshot);
  objectPreview();
  relationPreview(snapshot);
  publishStageWorldAnswer('A8', lastCreatedRelation || lastCreatedObject
    ? confirmation
    : 'Case Map recompiled as a relation workshop. Existing map authority, source bytes, custody, release posture, and human closure remain unchanged.');
  return true;
}

installAshStage({
  stage:'A8',
  sync:renderAshA8CaseMap,
  navigationSelectors:'[data-premium-workspace="map"],[data-route-workspace="map"],[data-route-workspace="rooms"],[data-route-workspace="routes"]'
});

host && (host.__td613AshA8CaseMap = Object.freeze({
  version:ASH_A8_CASE_MAP_VERSION,
  render:renderAshA8CaseMap,
  authority_changed:false,
  source_bytes_moved:false,
  human_closure_required:true
}));
