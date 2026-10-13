import { buildPhase10FixturePacket } from './engine/hush-phase10-release-discipline.js';
import { buildHushPhase11DashboardState } from './engine/hush-phase11-dashboard-state.js';
import { buildHushPhase11ActionGateReport } from './engine/hush-phase11-action-gates.js';

const state = buildHushPhase11DashboardState({ phase10_packet: buildPhase10FixturePacket() });
const gateReport = buildHushPhase11ActionGateReport(state);

const ACTION_LABELS = Object.freeze({
  'build-contract': 'Build Contract',
  'attach-provider-log': 'Attach Provider Log',
  'build-contract-log-pair': 'Build Contract-Log Pair',
  'build-stylometry-audit': 'Build Stylometry Audit',
  'attach-eorfd-signal': 'Attach EO-RFD Signal',
  'build-unified-audit': 'Build Unified Audit',
  'open-boundary-review': 'Open Boundary Review',
  'open-mask-registry': 'Open Mask Registry',
  'run-phase9-collision-audit': 'Run Collision Audit',
  'run-phase10-release-audit': 'Run Release Audit',
  'attach-runtime-flight-evidence': 'Attach Runtime Evidence',
  'export-redacted': 'Export Redacted Receipt',
  'export-private-backup': 'Export Private Backup',
  'copy-dashboard-summary': 'Copy Drawer Summary',
  'copy-non-claim-summary': 'Copy Non-Claim Summary',
  'mark-release-candidate': 'Mark Release Candidate',
  'mark-sealed': 'Mark Sealed',
  'revoke-release': 'Revoke Release'
});

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

function gateLabel(action = '') {
  return ACTION_LABELS[action] || text(action).replace(/-/g, ' ');
}

function buildDrawerReceipt() {
  return {
    schema: 'td613.hush.packet-drawer-custody-receipt/v1',
    created_at: new Date().toISOString(),
    drawer_mode: document.querySelector('[data-drawer-mode]')?.getAttribute('data-drawer-mode') || 'fixture-preview',
    release: {
      status: state.release_discipline.release_status,
      recommendation: state.release_discipline.release_recommendation,
      evidence_level: state.release_discipline.evidence_ladder_level,
      hard_blockers: state.hard_blockers
    },
    runtime: {
      status: state.runtime_flight_posture.status,
      missing_fields: state.runtime_flight_posture.missing_fields
    },
    boundaries: {
      safe_harbor: state.boundary_posture.safe_harbor.status,
      aperture: state.boundary_posture.aperture.status,
      eorfd: state.boundary_posture.eorfd.status
    },
    export_posture: {
      redacted_export_possible: state.export_posture.redacted_export_possible,
      public_default_allowed: state.export_posture.public_default_allowed,
      raw_surfaces_private: state.export_posture.operator_private_required
    },
    chain_spine: state.chain_spine.map((lane) => ({
      label: lane.label,
      status: lane.status,
      packet_id: lane.packet_id || null,
      evidence_class: lane.evidence_class,
      blocker: lane.blocker || null
    })),
    evidence_ladder: state.evidence_ladder.map((rung) => ({
      id: rung.id,
      label: rung.label,
      status: rung.status,
      blocking_reason: rung.blocking_reason || null
    })),
    action_gates: gateReport.gates.map((gate) => ({
      action: gateLabel(gate.action),
      status: gate.gate_status,
      allowed: gate.allowed,
      reason: gate.reason,
      repair: gate.repair
    })),
    non_claims: state.non_claims,
    receipt_limits: [
      'This export is a custody receipt, not a publication action.',
      'This export does not prove identity, legal authorship, provider compliance, release approval, or seal authority.',
      'Fixture preview may omit live runtime evidence.'
    ]
  };
}

async function copyTextToClipboard(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return true;
  }
  const scratch = document.createElement('textarea');
  scratch.value = value;
  scratch.setAttribute('readonly', '');
  scratch.style.position = 'fixed';
  scratch.style.opacity = '0';
  document.body.appendChild(scratch);
  scratch.select();
  const copied = document.execCommand('copy');
  scratch.remove();
  return copied;
}

function setActionStatus(message) {
  const status = document.getElementById('drawerActionStatus');
  if (status) status.textContent = message;
}

function exportReceipt() {
  const receipt = buildDrawerReceipt();
  const blob = new Blob([JSON.stringify(receipt, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `hush-packet-drawer-custody-${receipt.created_at.replace(/[:.]/g, '-')}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setActionStatus('Custody receipt exported. No release authority granted.');
}

async function copyReceipt() {
  const receipt = buildDrawerReceipt();
  try {
    const copied = await copyTextToClipboard(JSON.stringify(receipt, null, 2));
    setActionStatus(copied ? 'Custody receipt copied. No release authority granted.' : 'Copy unavailable in this browser.');
  } catch {
    setActionStatus('Copy unavailable in this browser.');
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
  ['Export authority', 'copy/export creates a local custody receipt only; no public release action is performed here']
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
  const label = gateLabel(gate.action);
  button.className = `gate ${gate.gate_status}`;
  button.type = 'button';
  button.dataset.allowed = String(gate.allowed);
  button.dataset.action = gate.action;
  button.setAttribute('aria-label', `${label}: ${gate.gate_status}`);
  appendTextElement(button, 'span', label);
  appendTextElement(button, 'small', gate.gate_status);
  actionGates.appendChild(button);
}

const nonClaims = document.getElementById('nonClaims');
clear(nonClaims);
for (const claim of state.non_claims) {
  appendTextElement(nonClaims, 'li', claim);
}

document.getElementById('copyPacketDrawerBtn')?.addEventListener('click', copyReceipt);
document.getElementById('exportPacketDrawerBtn')?.addEventListener('click', exportReceipt);

export { buildDrawerReceipt, gateLabel };
