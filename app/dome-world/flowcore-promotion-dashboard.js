import { compilePromotionPacket, REQUIRED_PROMOTION_ARTIFACTS } from '../engine/flowcore-production-promotion.js';

const state = { packet: null, evidenceKey: 'phase_receipts', resting: false };
const root = document.querySelector('[data-promotion-dashboard]');
const stage = root.querySelector('[data-stage]');
const live = root.querySelector('[data-bounded-live]');

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = String(text);
  return node;
}

function card(title, rows = []) {
  const section = element('section', 'promotion-dashboard__card');
  section.append(element('h2', null, title));
  const list = element('dl', 'promotion-dashboard__grid');
  for (const [label, value] of rows) {
    list.append(element('dt', null, label));
    list.append(element('dd', null, value));
  }
  section.append(list);
  return section;
}

function listCard(title, values = []) {
  const section = element('section', 'promotion-dashboard__card');
  section.append(element('h2', null, title));
  const list = element('ul');
  for (const value of values) list.append(element('li', null, typeof value === 'string' ? value : JSON.stringify(value)));
  if (!values.length) list.append(element('li', null, 'None declared.'));
  section.append(list);
  return section;
}

function render() {
  const packet = state.packet;
  const evidence = packet.evidence[state.evidenceKey];
  for (const button of root.querySelectorAll('[data-evidence-key]')) {
    button.setAttribute('aria-pressed', String(button.dataset.evidenceKey === state.evidenceKey));
  }
  live.textContent = state.resting
    ? 'Rest holds the promotion packet. Return, replay, and exit remain available.'
    : `Current state: ${packet.current_state}. Selected evidence: ${state.evidenceKey}.`;

  stage.replaceChildren();
  stage.append(card('Promotion state', [
    ['Current state', packet.current_state],
    ['Promotion complete', packet.promotion_complete],
    ['Inferred from merge', packet.state_inferred_from_merge],
    ['Inferred from deployment', packet.state_inferred_from_deployment],
    ['Feature gate default enabled', packet.feature_gate.default_enabled],
    ['Public route promotion authorized', packet.feature_gate.public_route_promotion_authorized],
    ['Human promotion required', packet.authority.human_promotion_required],
    ['Human closure required', packet.authority.human_closure_required]
  ]));
  stage.append(card('Selected evidence', [
    ['Artifact', state.evidenceKey],
    ['Status', evidence.status],
    ['Observed at', evidence.observed_at || 'not observed'],
    ['Merge inference', evidence.observation_is_merge_inference]
  ]));
  stage.append(listCard('Evidence references', evidence.references));
  stage.append(listCard('Promotion holds', packet.promotion_holds));
  stage.append(card('Empirical gate', [
    ['Human adult evidence present', packet.empirical_validation.human_adult_evidence_present],
    ['Empirical exit passed', packet.empirical_validation.empirical_exit_gate_passed],
    ['Reason', packet.empirical_validation.reason],
    ['Merge may satisfy', packet.empirical_validation.merge_may_satisfy_gate],
    ['Deployment may satisfy', packet.empirical_validation.deployment_may_satisfy_gate]
  ]));
  stage.append(card('Rollback boundary', [
    ['Feature path', packet.rollback.feature_gate_path],
    ['Restores prior UI', packet.rollback.restores_prior_ui],
    ['Mutates governed state', packet.rollback.rollback_mutates_governed_state],
    ['Requires data migration', packet.rollback.rollback_requires_data_migration],
    ['Creates release', packet.rollback.rollback_creates_release],
    ['Creates transport', packet.rollback.rollback_creates_transport]
  ]));
  stage.append(listCard('Rollback preserves', packet.rollback.preserves));
  stage.append(card('Packet authority', [
    ['Can enable feature', packet.authority.packet_can_enable_feature],
    ['Can mutate governed state', packet.authority.packet_can_mutate_governed_state],
    ['Can authorize release', packet.authority.packet_can_authorize_release],
    ['Can close program', packet.authority.packet_can_close_program],
    ['Closure', packet.closure.status]
  ]));
  root.dataset.resting = String(state.resting);
}

async function load() {
  const response = await fetch('./fixtures/pedagogue/flowcore-promotion-evidence.json');
  if (!response.ok) throw new Error(`Promotion evidence load failed: ${response.status}`);
  const fixture = await response.json();
  state.packet = await compilePromotionPacket(fixture, { ...fixture.determinism, cryptoImpl: globalThis.crypto });

  const nav = root.querySelector('[data-evidence-nav]');
  for (const key of REQUIRED_PROMOTION_ARTIFACTS) {
    const button = element('button', 'promotion-dashboard__choice', key.replaceAll('_', ' '));
    button.type = 'button';
    button.dataset.evidenceKey = key;
    button.setAttribute('aria-pressed', String(key === state.evidenceKey));
    button.addEventListener('click', () => {
      state.evidenceKey = key;
      state.resting = false;
      render();
    });
    nav.append(button);
  }

  root.querySelector('[data-rest]').addEventListener('click', () => { state.resting = true; render(); });
  root.querySelector('[data-return]').addEventListener('click', () => { state.resting = false; render(); });
  root.querySelector('[data-replay]').addEventListener('click', () => { state.resting = false; render(); });
  root.removeAttribute('aria-busy');
  render();
}

load().catch(error => {
  root.removeAttribute('aria-busy');
  root.dataset.held = 'true';
  live.textContent = `Promotion dashboard held: ${error.message}`;
});
