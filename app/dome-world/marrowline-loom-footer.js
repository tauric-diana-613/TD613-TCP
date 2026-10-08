import { LOOM_GATE_LABEL } from '../engine/portable-loom-output.js';

const REVIEW_KEY = 'TD613_LOOM_GATE_REVIEW_V1';
const memories = new WeakMap();
function reviews(environment) {
  if (memories.has(environment)) return memories.get(environment);
  let stored = [];
  try { stored = JSON.parse(environment.sessionStorage?.getItem(REVIEW_KEY) || '[]'); } catch {}
  const value = new Set(Array.isArray(stored) ? stored.filter(id => typeof id === 'string' && id.length <= 200).slice(-256) : []);
  memories.set(environment, value); return value;
}
function acknowledge(environment, requestId) {
  if (!requestId) return;
  const value = reviews(environment); value.add(requestId);
  while (value.size > 256) value.delete(value.values().next().value);
  try { environment.sessionStorage?.setItem(REVIEW_KEY, JSON.stringify([...value])); } catch {}
}

export function openMarrowlineLoomGate(doc, environment, { requestId = null } = {}) {
  const mobile = environment.matchMedia?.('(max-width:860px)')?.matches;
  const control = mobile ? doc.querySelector('.mobile-dock [data-mobile-target="gatePanel"]') : doc.getElementById('marrowlineInstrumentTab-gatePanel');
  const panel = doc.getElementById('gatePanel');
  if (!control && !panel) return false;
  if (control) control.click(); else panel.open = true;
  acknowledge(environment, requestId);
  // Acknowledgment stops attention only; it never edits Gate evidence.
  for (const footer of doc.querySelectorAll('.marrowline-loom-footer')) {
    if (footer.dataset.loomRequestId !== requestId) continue;
    footer.querySelector('button').dataset.gateAttention = 'false';
    footer.querySelector('.marrowline-loom-gate-state').textContent = footer.dataset.gateFinding + ' · review opened';
  }
  doc.getElementById('loomGateEvidenceReview')?.focus?.({ preventScroll: false });
  return true;
}

export function handleMarrowlineLoomGateCommand(message, doc, environment) {
  const state = environment.__TD613_LOOM_DEMO_CONTROLLER__?.snapshot?.();
  const command=String(message ?? '').trim();
  if (!['米','下'].includes(command) || !state?.active) return false;
  if(command==='下'){
    openMarrowlineLoomGate(doc,environment);
    const help=doc.getElementById('loomGateHowButton');
    if(help?.getAttribute('aria-expanded')!=='true')help?.click();
    doc.getElementById('marrowlineLoomGateHow')?.focus?.();
    return true;
  }
  openMarrowlineLoomGate(doc, environment, { requestId: state.current_result_request_id || null });
  return true;
}

export function createMarrowlineLoomFooter(doc, environment, authority) {
  const footer = doc.createElement('footer'); footer.className = 'marrowline-loom-footer';
  footer.dataset.loomRequestId = authority.request_id;
  const phase = doc.createElement('span'); phase.textContent = `Loom demo · ${authority.phase}${authority.held ? ' · HELD' : ''}`;
  const provenance = environment.__TD613_LOOM_DEMO_CONTROLLER__?.getObservedProvenance?.();
  const hasReceipt = provenance?.stages?.some(stage => stage.receipt?.request_id === authority.request_id) === true;
  const governance = doc.createElement('small'); governance.className = 'marrowline-loom-governance-state';
  governance.textContent = `Session: UNKNOWN · Route: ${authority.phase} · Posture: demo / local review · Auth: fresh gesture required · Receipt: ${hasReceipt ? 'available for local review' : 'UNKNOWN'} · HOLD: ${authority.held ? 'HELD' : 'inspect Gate'}`;
  const state = doc.createElement('small'); state.className = 'marrowline-loom-gate-state';
  const alerts = environment.__TD613_LOOM_DEMO_CONTROLLER__?.getGateReports?.()?.filter(report=>report.status==='OBSERVED_EXPOSURE'||report.coverage?.disclosed_targets>0||report.coverage?.successful_reconstruction_attempts>0) || [];
  const finding = alerts.length ? `Carried alert (${alerts.length} registered scope${alerts.length===1?'':'s'}) · this reply unchecked` : 'Gate: not checked for this reply';
  footer.dataset.gateFinding = finding;
  state.textContent = finding + (reviews(environment).has(authority.request_id) ? ' · review opened' : '');
  const button = doc.createElement('button'); button.type = 'button'; button.className = 'marrowline-loom-gate-check';
  button.textContent = LOOM_GATE_LABEL; button.setAttribute('aria-controls', 'gatePanel');
  button.title = 'Demo: open Loom Gate review. Opening does not run a check or clear an alert.';
  button.dataset.gateAttention = String(!reviews(environment).has(authority.request_id));
  button.addEventListener('click', () => openMarrowlineLoomGate(doc, environment, { requestId: authority.request_id }));
  footer.append(phase, button, state, governance); return footer;
}
