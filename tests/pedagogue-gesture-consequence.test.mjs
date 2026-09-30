import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  compilePedagogueGestureConsequenceAudit,
  PEDAGOGUE_GESTURE_CONSEQUENCE_AUDIT_SCHEMA
} from '../app/engine/pedagogue-gesture-consequence.js';

const load = async name => JSON.parse(await readFile(new URL(`./fixtures/pedagogue/gesture-consequence-${name}.json`, import.meta.url), 'utf8'));
const cases = { loom: await load('loom-two-stage'), review: await load('revision-review') };
const fresh = (name = 'loom') => structuredClone(cases[name]);
const codes = value => new Set(compilePedagogueGestureConsequenceAudit(value).findings.map(item => item.code));

for (const [name, declaration] of Object.entries(cases)) {
  test(`${name}: declared gestures preserve staged/send/answer distinctions, quiet rest, exit and held result`, () => {
    const report = compilePedagogueGestureConsequenceAudit(declaration);
    assert.equal(report.schema, PEDAGOGUE_GESTURE_CONSEQUENCE_AUDIT_SCHEMA);
    assert.equal(report.classification, 'DECLARED_GESTURE_CONSEQUENCES_PRESERVED');
    assert.deepEqual(report.findings, []);
    const stage = report.comparisons.find(item => item.kind === 'STAGE');
    assert.ok(stage.observed_state.staged_refs.length);
    assert.equal(stage.observed_state.send_count, 0);
    assert.equal(stage.observed_state.admitted_result_ref, null);
    const answer = report.comparisons.findLast(item => item.kind === 'WORLD_ANSWER' && item.observed_state.latest_attempt.status === 'ADMITTED');
    assert.ok(answer.observed_state.admitted_result_ref);
    assert.equal(report.final_state.latest_attempt.status, 'HELD');
    assert.equal(report.final_state.admitted_result_ref, answer.observed_state.admitted_result_ref);
    assert.equal(report.final_state.cue_paused, true);
    assert.equal(report.final_state.exited, true);
    assert.equal(report.final_state.expires_at, declaration.initial_state.expires_at);
    assert.equal(report.scope.result_admission_authenticated, false);
    assert.equal(report.scope.natural_language_comprehension_measured, false);
    assert.equal(report.scope.synthetic_fixture_establishes_production_behavior, false);
    assert.equal(report.authority.automatic_redesign, false);
    assert.equal(report.authority.automatic_release, false);
    assert.equal(report.authority.human_closure_required, true);
  });
}

test('opening/staging cannot silently transmit or name an admitted answer', () => {
  const item = fresh();
  item.steps[0].observed_state.send_count = 1;
  item.steps[1].observed_state.admitted_result_ref = 'premature-result';
  const violations = codes(item);
  for (const code of ['TRANSMISSION_WITHOUT_SEND', 'RESULT_CHANGED_BEFORE_WORLD_ANSWER', 'DECLARED_CONSEQUENCE_MISMATCH']) assert.ok(violations.has(code));
});

test('Send requires a separate explicit gesture and prior visible consequence notice', () => {
  const item = fresh();
  const send = item.steps.find(step => step.kind === 'SEND');
  send.explicit_operator_gesture = false;
  send.notice.at = send.at + 1;
  send.consequence_visible = false;
  const violations = codes(item);
  for (const code of ['EXPLICIT_GESTURE_MISSING', 'ACTION_BEFORE_NOTICE', 'CONSEQUENCE_ACKNOWLEDGMENT_MISSING']) assert.ok(violations.has(code));
  send.notice = { visible: false, at: null };
  assert.ok(codes(item).has('CONSEQUENCE_NOTICE_MISSING'));
});

test('the transmitted selection must equal the staged selection', () => {
  const item = fresh();
  const send = item.steps.find(step => step.kind === 'SEND');
  send.item_refs.push('unrelated-nearby-file');
  assert.ok(codes(item).has('TRANSMISSION_DIFFERS_FROM_STAGED'));
});

test('a world answer requires a matching prior Send, while held attempts preserve admitted state', () => {
  const skipped = fresh();
  const answer = skipped.steps.find(step => step.kind === 'WORLD_ANSWER');
  answer.attempt_id = 'never-sent-attempt';
  assert.ok(codes(skipped).has('ANSWER_WITHOUT_MATCHING_SEND'));
  const held = fresh();
  held.steps.find(step => step.outcome === 'HELD').observed_state.admitted_result_ref = 'failed-new-answer';
  assert.ok(codes(held).has('HELD_ATTEMPT_REPLACED_ADMITTED_RESULT'));
});

test('quieting the cue leaves custody expiry explicit and unchanged', () => {
  const item = fresh();
  item.steps.find(step => step.kind === 'PAUSE_CUE').observed_state.expires_at += 100;
  assert.ok(codes(item).has('CUE_PAUSE_CHANGED_EXPIRY'));
});

test('expired stage/send/admission are held without treating a cue pause as new authority', () => {
  const item = fresh();
  item.initial_state.expires_at = 25;
  for (const step of item.steps) step.observed_state.expires_at = 25;
  assert.ok(codes(item).has('ACTION_AFTER_EXPIRY'));
  assert.ok(codes(item).has('ADMISSION_AFTER_EXPIRY'));
});

test('rest and exit omissions remain separate deficits rather than a user score', () => {
  const item = fresh();
  item.rest_exit = { cue_pause_available: false, exit_available: false };
  const violations = codes(item);
  assert.ok(violations.has('CUE_PAUSE_WITHHELD'));
  assert.ok(violations.has('EXIT_WITHHELD'));
  assert.equal(compilePedagogueGestureConsequenceAudit(item).scope.user_level_score_created, false);
});

test('exit can cancel a pending attempt while retaining the prior admitted result', () => {
  const item = fresh();
  item.steps = item.steps.slice(0, 10);
  const pending = structuredClone(item.steps.at(-1).observed_state);
  pending.staged_refs = [];
  pending.cue_paused = true;
  pending.exited = true;
  pending.pending_attempt_id = null;
  pending.latest_attempt.status = 'HELD';
  item.steps.push({ step_id: 'exit-pending', kind: 'EXIT', at: 101, explicit_operator_gesture: true, notice: { visible: true, at: 100 }, consequence_visible: true, item_refs: [], attempt_id: null, outcome: 'NONE', result_ref: null, observed_state: pending });
  const report = compilePedagogueGestureConsequenceAudit(item);
  assert.deepEqual(report.findings, []);
  assert.equal(report.final_state.admitted_result_ref, 'answer-B');
});

test('actions following exit, reversed ticks, and reused attempt IDs remain distinguishable', () => {
  const item = fresh();
  const late = structuredClone(item.steps[0]);
  late.step_id = 'late-open';
  late.at = 121;
  late.notice.at = 120;
  late.observed_state = structuredClone(item.steps.at(-1).observed_state);
  item.steps.push(late);
  assert.ok(codes(item).has('ACTION_AFTER_EXIT'));
  const reversed = fresh();
  reversed.steps[4].at = 1;
  assert.ok(codes(reversed).has('OBSERVATION_TICK_REVERSED'));
  const reused = fresh();
  reused.steps[9].attempt_id = 'continuation-1';
  assert.ok(codes(reused).has('ATTEMPT_ID_REUSED'));
});

test('strict schemas reject missing/extra/symbol keys and accessors without reading them', () => {
  const alterations = [
    item => { delete item.rest_exit; },
    item => { item.user_score = 10; },
    item => { item.steps[0].notice.extra = true; },
    item => { item.steps[0].observed_state.latest_attempt.extra = true; },
    item => { item[Symbol('hidden')] = true; },
    item => { Object.defineProperty(item, 'case_id', { get() { throw new Error('accessor evaluated'); } }); }
  ];
  for (const alter of alterations) {
    const item = fresh(); alter(item);
    assert.throws(() => compilePedagogueGestureConsequenceAudit(item), /exactly|required|data property/);
  }
});

test('sparse arrays and extra array properties are rejected, including hole-plus-extra-key camouflage', () => {
  const alterations = [
    item => { delete item.steps[1]; },
    item => { item.steps.extra = true; },
    item => { delete item.steps[1]; item.steps.extra = true; },
    item => { item.steps[1].item_refs = new Array(1); },
    item => { item.steps[1].item_refs.extra = true; },
    item => { class CustomArray extends Array {} item.steps = CustomArray.from(item.steps); },
    item => { Object.defineProperty(item.steps, '0', { get() { throw new Error('accessor evaluated'); } }); }
  ];
  for (const alter of alterations) {
    const item = fresh(); alter(item);
    assert.throws(() => compilePedagogueGestureConsequenceAudit(item), /dense bounded array|own data elements/);
  }
});

test('malformed/coerced values and pre-answer result declarations are rejected', () => {
  const alterations = [
    item => { item.steps[0].at = -0; },
    item => { item.steps[0].at = 1.5; },
    item => { item.steps[0].notice.visible = 'true'; },
    item => { item.steps[0].kind = 'AUTOMATIC_DEPLOY'; },
    item => { item.steps[0].outcome = 'ADMITTED'; item.steps[0].result_ref = 'premature'; },
    item => { item.steps[0].observed_state.pending_attempt_id = 'ghost'; },
    item => { item.steps[1].item_refs.push(item.steps[1].item_refs[0]); },
    item => { item.steps[0].step_id = '\uD800'; },
    item => { item.steps = []; }
  ];
  for (const alter of alterations) {
    const item = fresh(); alter(item);
    assert.throws(() => compilePedagogueGestureConsequenceAudit(item), TypeError);
  }
});

test('reports replay deterministically, deeply freeze outputs, and leave declarations untouched', () => {
  const item = fresh();
  const prior = structuredClone(item);
  const report = compilePedagogueGestureConsequenceAudit(item);
  assert.deepEqual(item, prior);
  assert.deepEqual(report, compilePedagogueGestureConsequenceAudit(item));
  function checkFrozen(value) {
    if (!value || typeof value !== 'object') return;
    assert.equal(Object.isFrozen(value), true);
    for (const child of Object.values(value)) checkFrozen(child);
  }
  checkFrozen(report);
  assert.throws(() => { report.final_state.expires_at += 1; }, TypeError);
  item.steps[0].observed_state.expires_at += 1;
  assert.equal(report.comparisons[0].observed_state.expires_at, 600);
});
