import { buildPhase10FixturePacket } from './engine/hush-phase10-release-discipline.js';
import { buildHushPhase11DashboardState } from './engine/hush-phase11-dashboard-state.js';
import { buildHushPhase11ActionGateReport } from './engine/hush-phase11-action-gates.js';

const state = buildHushPhase11DashboardState({ phase10_packet: buildPhase10FixturePacket() });
const gateReport = buildHushPhase11ActionGateReport(state);

function text(value) {
  return String(value ?? 'not recorded');
}

function renderDl(root, rows) {
  root.innerHTML = rows.map(([term, value]) => `<dt>${term}</dt><dd>${text(value)}</dd>`).join('');
}

renderDl(document.getElementById('releaseTribunal'), [
  ['Release status', state.release_discipline.release_status],
  ['Evidence rung', `L${state.release_discipline.evidence_ladder_level}`],
  ['Hard blockers', state.hard_blockers.length || 'none'],
  ['Runtime posture', state.runtime_flight_posture.status]
]);

renderDl(document.getElementById('boundaryPosture'), [
  ['Safe Harbor', state.boundary_posture.safe_harbor.status],
  ['Aperture', state.boundary_posture.aperture.status],
  ['EO-RFD', state.boundary_posture.eorfd.status],
  ['Boundary rule', 'boundaries witness; they do not bypass Hush packet law']
]);

const exportConsole = document.getElementById('exportConsole');
exportConsole.innerHTML = `
  <p><strong>Redacted export:</strong> ${state.export_posture.redacted_export_possible ? 'available' : 'blocked'}</p>
  <p><strong>Public default:</strong> ${state.export_posture.public_default_allowed ? 'allowed' : 'blocked by default'}</p>
  <p><strong>Raw surfaces:</strong> ${state.export_posture.operator_private_required ? 'private review required' : 'excluded'}</p>
`;

document.getElementById('evidenceLadder').innerHTML = state.evidence_ladder.map((rung) => `
  <li class="rung ${rung.status}">
    <span class="rung-id">${rung.id}</span>
    <span class="rung-label">${rung.label}</span>
    <span class="rung-status">${rung.status}</span>
  </li>
`).join('');

document.getElementById('chainSpine').innerHTML = state.chain_spine.map((lane) => `
  <article class="lane ${lane.status}">
    <h3>${lane.label}</h3>
    <p>${lane.status}</p>
    <small>${lane.packet_id || lane.schema || 'awaiting packet'}</small>
  </article>
`).join('');

document.getElementById('actionGates').innerHTML = gateReport.gates.map((gate) => `
  <button class="gate ${gate.gate_status}" type="button" aria-label="${gate.action}: ${gate.gate_status}" data-allowed="${gate.allowed}">
    <span>${gate.action}</span>
    <small>${gate.gate_status}</small>
  </button>
`).join('');

document.getElementById('nonClaims').innerHTML = state.non_claims.map((claim) => `<li>${claim}</li>`).join('');
