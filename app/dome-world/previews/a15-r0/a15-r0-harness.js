import { createAshKernelAdapter } from './ash-kernel-adapter.js';
import { A15_R0_PROJECTIONS, getProjectionDescriptor } from './projection-registry.js';
import { A15_R0_INTERACTION_OWNERS } from './interaction-owner-registry.js';
import { createObservableEventRecorder } from './observable-event-recorder.js';
import { validateGovernedTaskFixture } from './a15-r0-contracts.js';

const FIXTURE_URL = '../../fixtures/a15-r0/governed-task-fixture-v01.json';
const ACTIVE_DESCRIPTOR_ID = 'A15_CONTROL';
const TASK_ORDER = Object.freeze(['ARRIVE', 'BIND_REFERENCE', 'FORM_RELATION', 'COMPARE_ROUTE', 'PRESERVE', 'RETURN']);
const ACTION_METHODS = Object.freeze({
  BIND_REFERENCE: 'bindReference',
  FORM_RELATION: 'formRelation',
  COMPARE_ROUTE: 'compareRoute',
  PRESERVE: 'preserve',
  RETURN: 'returnToCustody',
  REST: 'rest',
  RESET: 'resetFixture'
});
const CONTROL_BY_ACTION = Object.freeze({
  BIND_REFERENCE: 'bind-reference',
  FORM_RELATION: 'form-relation',
  COMPARE_ROUTE: 'compare-route',
  PRESERVE: 'preserve-result',
  RETURN: 'return-custody',
  REST: 'rest-run',
  RESET: 'reset-fixture'
});
const REQUIRED_STATE = Object.freeze({
  BIND_REFERENCE: 'ARRIVE',
  FORM_RELATION: 'BIND_REFERENCE',
  COMPARE_ROUTE: 'FORM_RELATION',
  PRESERVE: 'COMPARE_ROUTE',
  RETURN: 'PRESERVE'
});

let fixture = null;
let adapter = null;
let recorder = createObservableEventRecorder();
let busy = false;

const byId = id => document.getElementById(id);
const pretty = value => JSON.stringify(value, null, 2);

function setList(id, values, fallback) {
  const host = byId(id);
  host.replaceChildren();
  const items = values?.length ? values : [fallback];
  for (const value of items) {
    const item = document.createElement('li');
    item.textContent = String(value);
    host.append(item);
  }
}

function renderProjectionRegistry() {
  const host = byId('projectionRegistry');
  host.replaceChildren();
  for (const descriptor of A15_R0_PROJECTIONS) {
    const article = document.createElement('article');
    article.className = `projection-record${descriptor.implementation_status === 'NOT_IMPLEMENTED' ? ' not-implemented' : ''}`;
    const status = document.createElement('span');
    status.className = 'projection-status';
    status.textContent = descriptor.implementation_status.replaceAll('_', ' ');
    const title = document.createElement('h3');
    title.textContent = descriptor.label;
    const copy = document.createElement('p');
    copy.textContent = descriptor.projection_id === 'A15_CONTROL'
      ? 'Current A15 witness. The assay does not mount, repair, or mutate it.'
      : 'Descriptor prepared for later work. No interface or active control exists in R0.1.';
    const posture = document.createElement('p');
    posture.textContent = 'Noncanonical · preview only · production cutover closed · human selection required';
    article.append(status, title, copy, posture);
    host.append(article);
  }
  byId('currentDescriptor').textContent = pretty(getProjectionDescriptor(ACTIVE_DESCRIPTOR_ID));
}

function renderOwnerRegistry() {
  const host = byId('ownerRegistry');
  host.replaceChildren();
  for (const owner of A15_R0_INTERACTION_OWNERS) {
    const row = document.createElement('tr');
    for (const value of [
      owner.control_id,
      owner.projection_owner,
      owner.action_owner,
      owner.event_phase,
      String(owner.delegated),
      String(owner.competing_owner_detected)
    ]) {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.append(cell);
    }
    host.append(row);
  }
}

function renderFixtureSummary() {
  const host = byId('fixtureSummary');
  host.replaceChildren();
  const rows = [
    ['Fixture', fixture.fixture_id],
    ['Case', fixture.case_id],
    ['Source posture', `${fixture.local_source.posture} · raw bytes local`],
    ['Question', fixture.question.label],
    ['Sensor', `${fixture.sensor_id} · ${fixture.authority_class}`],
    ['External transmission', 'None authorized']
  ];
  for (const [term, description] of rows) {
    const wrapper = document.createElement('div');
    const dt = document.createElement('dt');
    const dd = document.createElement('dd');
    dt.textContent = term;
    dd.textContent = description;
    wrapper.append(dt, dd);
    host.append(wrapper);
  }
  setList('claimCeiling', fixture.claim_ceiling, 'No claim ceiling supplied.');
}

function renderSequence(taskState) {
  const currentIndex = TASK_ORDER.indexOf(taskState);
  for (const item of byId('taskSequence').querySelectorAll('li')) {
    const index = TASK_ORDER.indexOf(item.dataset.state);
    item.classList.toggle('current', index === currentIndex);
    item.classList.toggle('complete', currentIndex >= 0 && index < currentIndex);
  }
}

function updateControls(snapshot) {
  for (const [actionId, requiredState] of Object.entries(REQUIRED_STATE)) {
    const button = byId(CONTROL_BY_ACTION[actionId]);
    button.disabled = busy || snapshot.task_state !== requiredState;
  }
  byId('rest-run').disabled = busy;
  byId('reset-fixture').disabled = busy;
}

async function render(snapshot = null) {
  const current = snapshot || await adapter.snapshot();
  byId('taskState').textContent = current.task_state;
  byId('taskState').dataset.state = current.task_state;
  renderSequence(current.task_state);
  updateControls(current);
  byId('kernelSnapshot').textContent = pretty(current);
  byId('lastReceipt').textContent = current.last_receipt ? pretty(current.last_receipt) : 'No action receipt.';
  const missingness = current.last_receipt?.missingness || current.case_map?.missingness || [];
  setList('missingness', missingness, 'No missingness recorded.');
  byId('observableEvents').textContent = recorder.snapshot().length
    ? pretty(recorder.snapshot())
    : 'No observable event.';
  return current;
}

async function recordVisibleGesture({ actionId, button, gestureFacts, before, receipt, after }) {
  const boundaryCrossings = actionId === 'COMPARE_ROUTE'
    ? ['fixture-local projection boundary']
    : actionId === 'PRESERVE'
      ? ['local continuity record boundary']
      : [];
  await recorder.record({
    taskStateBefore: before.task_state,
    controlId: button.id,
    controlVisible: gestureFacts.visible,
    controlEnabled: gestureFacts.enabled,
    gesture: 'click',
    actionId,
    kernelReceiptId: receipt.receipt_id,
    worldAnswerId: receipt.world_answer_id,
    actionToConsequenceDistance: 1,
    boundaryCrossings,
    unexplainedSeams: receipt.missingness,
    backtrack: actionId === 'RESET',
    helpRequested: false,
    restAvailable: true,
    returnAvailable: after.task_state === 'PRESERVE' || after.task_state === 'RETURN',
    missingness: receipt.missingness
  });
}

async function runAction(actionId, button) {
  if (busy || !adapter) return;
  const gestureFacts = {
    visible: button.getClientRects().length > 0,
    enabled: !button.disabled
  };
  busy = true;
  const before = await adapter.snapshot();
  updateControls(before);
  try {
    const method = ACTION_METHODS[actionId];
    const receipt = actionId === 'REST'
      ? await adapter[method]('operator selected Rest in the fixed-kernel preview')
      : await adapter[method]();
    if (actionId === 'RESET') recorder.reset();
    const after = await adapter.snapshot();
    byId('worldAnswer').textContent = receipt.world_answer;
    await recordVisibleGesture({ actionId, button, gestureFacts, before, receipt, after });
    await render(after);
  } catch (error) {
    byId('worldAnswer').textContent = `HELD · ${error.message}`;
  } finally {
    busy = false;
    if (adapter) updateControls(await adapter.snapshot());
  }
}

function bindControls() {
  for (const button of document.querySelectorAll('[data-action]')) {
    button.addEventListener('click', () => runAction(button.dataset.action, button));
  }
}

async function start() {
  renderProjectionRegistry();
  renderOwnerRegistry();
  bindControls();
  const response = await fetch(FIXTURE_URL, { cache: 'no-store', credentials: 'same-origin' });
  if (!response.ok) throw new Error(`Fixture request failed with HTTP ${response.status}.`);
  fixture = validateGovernedTaskFixture(await response.json());
  renderFixtureSummary();
  adapter = await createAshKernelAdapter(fixture);
  await render();
  byId('worldAnswer').textContent = 'A synthetic source posture and one bounded question are present. Production Ash remains unchanged.';
  document.documentElement.dataset.a15R0Ready = 'true';
  window.dispatchEvent(new CustomEvent('td613:ash:a15-r0-ready', {
    detail: {
      schema: 'td613.ash.a15-r0.preview-ready/v0.1',
      fixture_id: fixture.fixture_id,
      projection_descriptor: ACTIVE_DESCRIPTOR_ID,
      p0_mutated: false,
      p1_implemented: false,
      p2_implemented: false,
      production_mutated: false,
      external_transmission: false,
      human_selection_required: true,
      human_closure_required: true
    }
  }));
}

start().catch(error => {
  byId('worldAnswer').textContent = `PREVIEW HELD · ${error.message}`;
  byId('taskState').textContent = 'HELD';
  document.documentElement.dataset.a15R0Ready = 'held';
});
