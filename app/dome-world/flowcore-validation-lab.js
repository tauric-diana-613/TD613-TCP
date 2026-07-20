import {
  compileValidationProtocol,
  compileValidationTrial,
  compileValidationBundle,
  VALIDATION_CONDITIONS
} from '../engine/flowcore-empirical-validation.js';

const state = { fixture: null, bundle: null, condition: 'A_CURRENT_FORM', resting: false };
const root = document.querySelector('[data-validation-lab]');
const stage = root.querySelector('[data-stage]');
const live = root.querySelector('[data-bounded-live]');

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = String(text);
  return node;
}

function card(title, rows) {
  const section = element('section', 'validation-lab__card');
  section.append(element('h2', null, title));
  const list = element('dl', 'validation-lab__grid');
  for (const [label, value] of rows) {
    list.append(element('dt', null, label));
    list.append(element('dd', null, value));
  }
  section.append(list);
  return section;
}

function listCard(title, values = []) {
  const section = element('section', 'validation-lab__card');
  section.append(element('h2', null, title));
  const list = element('ul');
  for (const value of values) list.append(element('li', null, typeof value === 'string' ? value : JSON.stringify(value)));
  if (!values.length) list.append(element('li', null, 'None declared.'));
  section.append(list);
  return section;
}

function render() {
  const bundle = state.bundle;
  const summary = bundle.comparison.conditions.find(item => item.condition === state.condition);
  const trial = bundle.trials.find(item => item.condition === state.condition);
  for (const button of root.querySelectorAll('[data-condition]')) {
    button.setAttribute('aria-pressed', String(button.dataset.condition === state.condition));
  }
  live.textContent = state.resting
    ? 'Rest holds the current comparison. Return, replay, and exit remain available.'
    : `${state.condition}: synthetic pipeline demonstration only.`;

  stage.replaceChildren();
  stage.append(card('Condition summary', [
    ['Trials', summary.trial_count],
    ['Next-state successes', summary.next_state_prediction_successes],
    ['Causal-route successes', summary.causal_route_explanation_successes],
    ['Missingness recognized', summary.missingness_recognition_successes],
    ['Station ownership recognized', summary.station_ownership_recognition_successes],
    ['Recovery successes', summary.recovery_successes],
    ['Abandonments', summary.abandonment_count],
    ['Transfer successes', summary.transfer_successes],
    ['Mean first consequence', `${summary.mean_time_to_first_consequence_ms} ms`],
    ['Mean calibration', `${summary.mean_confidence_calibration_millipoints} / 1000`]
  ]));
  stage.append(card('Evidence posture', [
    ['Evidence class', trial.evidence_class],
    ['Counts as human evidence', trial.empirical_authority.counts_as_human_evidence],
    ['Quoted language included', trial.source_boundary.quoted_participant_language_included],
    ['Raw case content included', trial.source_boundary.raw_case_content_included],
    ['Automatic redesign', trial.empirical_authority.automatic_redesign_command]
  ]));
  stage.append(listCard('Qualitative summary codes', trial.qualitative.summary_codes));
  stage.append(listCard('Confusing elements', trial.qualitative.confusing_elements));
  stage.append(listCard('Helpful elements', trial.qualitative.helpful_elements));
  stage.append(listCard('Adverse findings', bundle.adverse_findings.findings.filter(item => item.condition === state.condition)));
  stage.append(card('Child-pilot gate', [
    ['Eligible', bundle.child_pilot.eligible],
    ['Adult evidence complete', bundle.child_pilot.adult_evidence_complete],
    ['Safety clear', bundle.child_pilot.safety_clear],
    ['Clarity clear', bundle.child_pilot.clarity_clear],
    ['Synthetic counts as adult evidence', bundle.child_pilot.synthetic_trials_count_as_adult_evidence],
    ['Human authorization still required', bundle.child_pilot.human_authorization_still_required]
  ]));
  stage.append(card('Promotion hold', [
    ['Empirical exit gate passed', bundle.promotion.empirical_exit_gate_passed],
    ['Reason', bundle.promotion.reason],
    ['Merge may satisfy gate', bundle.promotion.merge_may_satisfy_empirical_gate],
    ['Deployment may satisfy gate', bundle.promotion.deployment_may_satisfy_empirical_gate]
  ]));
  root.dataset.resting = String(state.resting);
}

async function load() {
  const response = await fetch('./fixtures/pedagogue/flowcore-validation-synthetic-pipeline.json');
  if (!response.ok) throw new Error(`Fixture load failed: ${response.status}`);
  state.fixture = await response.json();
  const protocol = await compileValidationProtocol(state.fixture.protocol, {
    ...state.fixture.determinism.protocol,
    cryptoImpl: globalThis.crypto
  });
  const trials = [];
  for (let index = 0; index < state.fixture.observations.length; index += 1) {
    trials.push(await compileValidationTrial(protocol, state.fixture.observations[index], {
      ...state.fixture.determinism.trials[index],
      cryptoImpl: globalThis.crypto
    }));
  }
  state.bundle = await compileValidationBundle(protocol, trials, {
    ...state.fixture.determinism.bundle,
    cryptoImpl: globalThis.crypto
  });

  const nav = root.querySelector('[data-condition-nav]');
  for (const condition of VALIDATION_CONDITIONS) {
    const button = element('button', 'validation-lab__choice', condition);
    button.type = 'button';
    button.dataset.condition = condition;
    button.setAttribute('aria-pressed', String(condition === state.condition));
    button.addEventListener('click', () => {
      state.condition = condition;
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
  live.textContent = `Validation lab held: ${error.message}`;
});
