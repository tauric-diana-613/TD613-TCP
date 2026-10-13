import {
  ASH_A7_A11_RECOMPILER_CORE_VERSION,
  byId,
  escapeHtml,
  humanize,
  installAshStage,
  publishStageWorldAnswer
} from './ash-a7-a11-recompiler-core.js';

export const ASH_A7_HOME_VERSION = 'td613.ash.a7-home-recompilation/v0.1';

function priorityCopy(snapshot) {
  const priority = snapshot?.currentPriority || null;
  if (!snapshot?.caseMap) return Object.freeze({
    title:'Choose a case path deliberately',
    needs:'No local case is open.',
    matters:'Ash cannot orient continuity or bounded work without a selected local case.',
    action:'Open cases & profiles',
    destination:'profile',
    changes:'The explicit case/profile selector opens.',
    unchanged:'No profile is inferred; no case, custody, transport, release, or closure state changes.',
    done:'A case or governed demo is explicitly selected.'
  });
  return Object.freeze({
    title:priority?.label || 'No open priority',
    needs:priority ? `${priority.label} remains ${humanize(priority.confidence_posture || 'OPEN').toLowerCase()} in ${humanize(priority.room_id || 'the current room')}.` : 'No intended action or evidence gap is currently open.',
    matters:priority ? 'This unresolved relation shapes the next bounded case action while remaining separate from truth, guilt, identity, and release authority.' : 'The case remains reviewable without manufacturing a new demand.',
    action:priority ? (snapshot.profile === 'fundraiser' ? 'Open next ask' : 'Review next response') : 'Inspect continuity',
    destination:priority ? 'work' : 'capsule',
    changes:priority ? 'Ash opens the Work surface and foregrounds the current bounded action.' : 'Ash opens Capsule continuity for inspection.',
    unchanged:'Source bytes stay local. Custody, claim ceiling, release posture, station ownership, and human closure remain unchanged.',
    done:priority ? 'The bounded action receives a visible world answer, receipt, or truthful held explanation.' : 'The current continuity posture has been inspected without inventing work.'
  });
}

function continuityRows(snapshot) {
  if (!snapshot?.caseMap) return [
    ['What remains attached','No case is attached.'],
    ['What became stale','Nothing can be classed as stale before a local case is selected.'],
    ['What can be returned to','The explicit case/profile selector or an authenticated Capsule.'],
    ['What must be checked again','The intended local case and profile.'],
    ['What has not been sealed','No current case continuity has been sealed.']
  ];
  const point = snapshot.latestSavePoint;
  return [
    ['What remains attached', `${snapshot.title}; ${snapshot.counts.objects} objects; ${snapshot.counts.relations} relations; ${snapshot.receipts.length} receipt reference${snapshot.receipts.length === 1 ? '' : 's'}.`],
    ['What became stale', snapshot.continuityChanged ? 'The current Case Map digest differs from the latest Save Point.' : point ? 'No digest drift is currently observed.' : 'Staleness cannot be compared because no Save Point exists yet.'],
    ['What can be returned to', point ? `Save Point ${point.save_point_id}; return preserves current external reality and does not silently overwrite the Case Map.` : 'The current local case and its existing workspaces.'],
    ['What must be checked again', snapshot.continuityChanged ? 'Source/map changes and any release receipt bound before the last seal.' : 'Any source, route, or map relation changed after the latest visible receipt.'],
    ['What has not been sealed', point ? 'Open questions, later changes, recipient behavior, external deletion, and human closure remain outside the seal.' : 'The complete current continuity posture remains unsealed.']
  ];
}

function routeRows(snapshot) {
  const entries = snapshot?.routeMemory?.entries || [];
  if (!entries.length) return '<tr><td colspan="8">Nothing has been recorded as leaving this case. Local references and inspection remain distinct from transport.</td></tr>';
  return [...entries].reverse().map((entry, index) => {
    const version = entry.draft_digest ? String(entry.draft_digest).slice(0, 14) : `route-${entries.length - index}`;
    const receipt = entry.entry_id || entry.route_memory_entry_id || entry.route_id || 'receipt-unavailable';
    const stale = humanize(entry.recall_state || 'NOT_RECALLED');
    return `<tr>
      <td>${escapeHtml((entry.disclosed_opaque_references || []).join(', ') || 'Opaque route reference only')}</td>
      <td>Case bytes and joining keys</td>
      <td>${escapeHtml(humanize(entry.recipient_class || 'UNDECLARED'))}</td>
      <td><code>${escapeHtml(version)}</code></td>
      <td><code>${escapeHtml(entry.route_id || 'UNDECLARED')}</code></td>
      <td><code>${escapeHtml(receipt)}</code></td>
      <td>${escapeHtml(stale)}</td>
      <td>${escapeHtml(entry.recorded_at || 'Local timestamp unavailable')}</td>
    </tr>`;
  }).join('');
}

export function renderAshA7Home(snapshot) {
  const target = byId('premiumHomeBody');
  if (!target) return false;
  const priority = priorityCopy(snapshot);
  const continuity = continuityRows(snapshot);
  target.dataset.ashA7Home = ASH_A7_HOME_VERSION;
  target.innerHTML = `
    <section class="ash-stage-card wide" id="ashA7CurrentPriority" aria-labelledby="ashA7CurrentPriorityTitle">
      <p class="ash-stage-kicker">Current Priority · one bounded next action</p>
      <h3 id="ashA7CurrentPriorityTitle">${escapeHtml(priority.title)}</h3>
      <dl class="ash-stage-facts">
        <div><dt>What needs attention</dt><dd>${escapeHtml(priority.needs)}</dd></div>
        <div><dt>Why it matters</dt><dd>${escapeHtml(priority.matters)}</dd></div>
        <div><dt>What you can do now</dt><dd>${escapeHtml(priority.action)}</dd></div>
        <div><dt>What Ash will change</dt><dd>${escapeHtml(priority.changes)}</dd></div>
        <div><dt>What Ash will not do</dt><dd>${escapeHtml(priority.unchanged)}</dd></div>
        <div><dt>Done when</dt><dd>${escapeHtml(priority.done)}</dd></div>
      </dl>
      <div class="premium-action-row">
        ${priority.destination === 'profile'
          ? '<button type="button" class="premium-action primary ash-stage-primary-action" data-command-action="profile">Open cases & profiles</button>'
          : `<button type="button" class="premium-action primary ash-stage-primary-action" data-route-workspace="${escapeHtml(priority.destination)}">${escapeHtml(priority.action)}</button>`}
        <button type="button" class="premium-action" data-route-workspace="map">Inspect source relations</button>
      </div>
      <p class="ash-stage-status" id="ashA7Status" role="status" aria-live="polite">Home presents orientation before technical descent. No Ash authority changed.</p>
    </section>
    <div class="ash-stage-grid">
      <section class="ash-stage-card" id="ashA7Continuity" aria-labelledby="ashA7ContinuityTitle">
        <p class="ash-stage-kicker">Continuity</p><h3 id="ashA7ContinuityTitle">What remains recoverable—and what requires review</h3>
        <dl class="ash-stage-facts">${continuity.map(([term,value]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(value)}</dd></div>`).join('')}</dl>
        <div class="premium-action-row"><button type="button" class="premium-action gold" data-route-workspace="capsule">Open Capsule continuity</button><button type="button" class="premium-action" data-route-workspace="work">Inspect receipts</button></div>
      </section>
      <section class="ash-stage-card" aria-labelledby="ashA7ClaimTitle">
        <p class="ash-stage-kicker">Claim ceiling</p><h3 id="ashA7ClaimTitle">Orientation grants no authority</h3>
        <ul class="ash-stage-list">
          <li>Home may name current local posture, bounded actions, stale relations, and receipt references.</li>
          <li>Home may not establish truth, identity, authorship, intent, guilt, release permission, recipient acceptance, or human closure.</li>
          <li>A Save Point preserves continuity; it cannot rewind external reality or prove external deletion.</li>
        </ul>
      </section>
    </div>
    <section class="ash-stage-card wide" id="ashA7RouteLedger" aria-labelledby="ashA7RouteLedgerTitle">
      <p class="ash-stage-kicker">What has already left</p><h3 id="ashA7RouteLedgerTitle">Route ledger</h3>
      <p class="ash-stage-copy">The ledger separates what left from what stayed local, and keeps route, receipt, version, recipient, and later stale posture visible.</p>
      <div class="ash-stage-table-wrap"><table class="ash-stage-table"><thead><tr><th>What left</th><th>What stayed local</th><th>Recipient</th><th>Version</th><th>Route</th><th>Receipt</th><th>Later stale status</th><th>Recorded</th></tr></thead><tbody>${routeRows(snapshot)}</tbody></table></div>
    </section>`;
  publishStageWorldAnswer('A7', 'Home recompiled around current condition, one bounded next action, continuity, and the route ledger. Source bytes and Ash authority remain unchanged.');
  return true;
}

installAshStage({
  stage:'A7',
  sync:renderAshA7Home,
  navigationSelectors:'[data-premium-workspace="home"],[data-route-workspace="home"],#premiumReturnHome,[data-command-action="profile"]'
});

globalThis.window && (globalThis.window.__td613AshA7Home = Object.freeze({
  version:ASH_A7_HOME_VERSION,
  core_version:ASH_A7_A11_RECOMPILER_CORE_VERSION,
  render:renderAshA7Home,
  authority_changed:false,
  source_bytes_moved:false,
  human_closure_required:true
}));
