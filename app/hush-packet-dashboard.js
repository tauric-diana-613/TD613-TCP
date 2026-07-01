import { buildPhase10FixturePacket } from './engine/hush-phase10-release-discipline.js';
import { buildHushPhase11DashboardState } from './engine/hush-phase11-dashboard-state.js';
import { buildHushPhase11ActionGateReport } from './engine/hush-phase11-action-gates.js';

const state = buildHushPhase11DashboardState({ phase10_packet: buildPhase10FixturePacket() });
const gateReport = buildHushPhase11ActionGateReport(state);

function text(value) {
  return String(value ?? 'not recorded');
}

function clear(root) {
  while (root.firstChild) root.removeChild(root.firstChild);
}

function appendTextElement(parent, tagName, value, className) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = text(value);
  parent.appendChild(element);
  return element;
}

function renderDl(root, rows) {
  clear(root);
  for (const [term, value] of rows) {
    appendTextElement(root, 'dt', term);
    appendTextElement(root, 'dd', value);
  }
}

renderDl(document.getElementById('releaseTribunal'), [
  ['Source mode', 'fixture preview / no live packet loaded'],
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
clear(exportConsole);
for (const [label, value] of [
  ['Redacted export', state.export_posture.redacted_export_possible ? 'available in fixture preview' : 'blocked'],
  ['Public default', state.export_posture.public_default_allowed ? 'allowed' : 'blocked by default'],
  ['Raw surfaces', state.export_posture.operator_private_required ? 'private review required' : 'excluded'],
  ['Export authority', 'fixture preview only; no clipboard or public export action is performed here']
]) {
  const paragraph = document.createElement('p');
  appendTextElement(paragraph, 'strong', `${label}: `);
  paragraph.appendChild(document.createTextNode(text(value)));
  exportConsole.appendChild(paragraph);
}

const ladder = document.getElementById('evidenceLadder');
clear(ladder);
for (const rung of state.evidence_ladder) {
  const item = document.createElement('li');
  item.className = `rung ${rung.status}`;
  appendTextElement(item, 'span', rung.id, 'rung-id');
  appendTextElement(item, 'span', rung.label, 'rung-label');
  appendTextElement(item, 'span', rung.status, 'rung-status');
  ladder.appendChild(item);
}

const chainSpine = document.getElementById('chainSpine');
clear(chainSpine);
for (const lane of state.chain_spine) {
  const article = document.createElement('article');
  article.className = `lane ${lane.status}`;
  appendTextElement(article, 'h3', lane.label);
  appendTextElement(article, 'p', lane.status);
  appendTextElement(article, 'small', lane.packet_id || lane.schema || 'awaiting packet');
  chainSpine.appendChild(article);
}

const actionGates = document.getElementById('actionGates');
clear(actionGates);
for (const gate of gateReport.gates) {
  const button = document.createElement('button');
  button.className = `gate ${gate.gate_status}`;
  button.type = 'button';
  button.dataset.allowed = String(gate.allowed);
  button.setAttribute('aria-label', `${gate.action}: ${gate.gate_status}`);
  appendTextElement(button, 'span', gate.action);
  appendTextElement(button, 'small', gate.gate_status);
  actionGates.appendChild(button);
}

const nonClaims = document.getElementById('nonClaims');
clear(nonClaims);
for (const claim of state.non_claims) {
  appendTextElement(nonClaims, 'li', claim);
}
