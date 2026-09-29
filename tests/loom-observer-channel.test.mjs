import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeFiniteChannel } from '../app/dome-world/holonomy-loom/observer-channel.js';
import { OBSERVER_CASES, getObserverCase } from '../app/dome-world/holonomy-loom/observer-cases.js';
const clone = value => JSON.parse(JSON.stringify(value));
const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 1e-10, `${actual} != ${expected}`);
const run = (id, selected) => analyzeFiniteChannel(getObserverCase(id), selected);

test('baseline disclosure survives zero incremental leakage', () => {
  const r = run('baseline');
  for (const route of Object.values(r.routes)) {
    assert.equal(route.selected_view.baseline_bits, 1);
    assert.equal(route.selected_view.additional_bits, 0);
    assert.equal(route.selected_view.total_bits, 1);
    assert.equal(route.selected_view.total_recovery, 1);
  }
});
test('length reveals the bit despite identical lawful answers; scoped text alone does not', () => {
  const all = run('length'), text = run('length', ['reply']);
  assert.equal(all.routes.control.authorized_accuracy, 1);
  assert.equal(all.routes.protected.authorized_accuracy, 1);
  assert.equal(all.routes.control.selected_view.total_bits, 1);
  assert.equal(all.routes.protected.selected_view.total_bits, 0);
  assert.equal(text.routes.control.selected_view.total_bits, 0);
  assert.equal(all.routes.protected.selected_view.total_recovery, .5);
});
test('every proper parity subset hides the secret but its triple reveals it', () => {
  const r = run('parity');
  assert.equal(r.routes.control.subsets.length, 8);
  for (const subset of r.routes.control.subsets) assert.equal(subset.total_bits, subset.channels.length === 3 ? 1 : 0);
  assert.deepEqual(r.routes.control.captured_sequence.map(x => x.conditional_increment_bits), [0, 0, 1]);
  assert.equal(r.routes.control.signed_excess_bits, 1);
  assert.equal(r.routes.protected.selected_view.total_bits, 0);
});
test('negative signed excess cannot become a privacy verdict', () => {
  const r = run('redundancy');
  assert.equal(r.routes.control.signed_excess_bits, -1);
  assert.equal(r.routes.control.selected_view.total_bits, 1);
  assert.equal(r.routes.control.selected_view.total_recovery, 1);
  assert.equal(r.ceiling.golden_egg, 'UNEARNED');
  assert.equal(r.ceiling.release_authority, false);
});
test('missing capture preserves only a labeled subview, never a complete zero', () => {
  const r = run('missing');
  assert.equal(r.status, 'HELD_MISSING_CHANNELS');
  assert.equal(r.routes.protected.selected_view, null);
  assert.equal(r.routes.protected.signed_excess_bits, null);
  assert.deepEqual(r.routes.protected.missing_channels, ['error']);
  assert.equal(r.routes.protected.captured_subview.total_bits, 0);
  assert.equal(run('missing', ['reply']).status, 'SYNTHETIC_CALCULATED');
});
test('permitted projection does not fabricate prior knowledge; hiding it costs task utility', () => {
  const r = run('utility');
  assert.equal(r.baseline_bits, 0);
  assert.equal(r.routes.control.selected_view.total_bits, 1);
  assert.equal(r.routes.protected.selected_view.total_bits, 0);
  assert.equal(r.routes.control.authorized_accuracy, 1);
  assert.equal(r.routes.protected.authorized_accuracy, .5);
});
test('biased populations use declared mass and the optimal guessing baseline', () => {
  const model = clone(getObserverCase('length')); model.rows[1].weight = 3;
  const r = analyzeFiniteChannel(model);
  const h = -.25 * Math.log2(.25) - .75 * Math.log2(.75);
  near(r.secret_entropy_bits, h); near(r.routes.control.selected_view.total_bits, h);
  assert.equal(r.routes.protected.selected_view.total_recovery, .75);
  assert.equal(r.routes.control.selected_view.baseline_recovery, .75);
});
test('auxiliary knowledge participates in baseline and an empty trace means prior only', () => {
  const model = clone(getObserverCase('length'));
  model.rows.forEach(row => { row.auxiliary = row.secret; });
  const r = analyzeFiniteChannel(model, []);
  assert.equal(r.baseline_bits, 1);
  assert.equal(r.routes.control.selected_view.total_bits, 1);
  assert.equal(r.routes.control.selected_view.additional_bits, 0);
});
test('mass scaling, splitting, row order and channel order preserve the same finite law', () => {
  const model = clone(getObserverCase('parity')), original = analyzeFiniteChannel(model);
  model.rows = model.rows.flatMap(row => [row, { ...clone(row), id: `${row.id}-copy` }]).reverse();
  const revised = analyzeFiniteChannel(model, ['third', 'first', 'second']);
  for (const route of ['control', 'protected']) {
    near(revised.routes[route].selected_view.total_bits, original.routes[route].selected_view.total_bits);
    near(revised.routes[route].selected_view.total_recovery, original.routes[route].selected_view.total_recovery);
    near(revised.routes[route].captured_sequence.reduce((sum, x) => sum + x.conditional_increment_bits, 0), revised.routes[route].selected_view.additional_bits);
  }
});
test('postprocessing and forgetting views never improve information or optimal recovery', () => {
  for (const example of OBSERVER_CASES.filter(x => x.id !== 'missing')) {
    const r = analyzeFiniteChannel(example);
    for (const route of Object.values(r.routes)) for (const a of route.subsets) for (const b of route.subsets) {
      if (a.channels.every(id => b.channels.includes(id))) {
        assert.ok(a.total_bits <= b.total_bits + 1e-10);
        assert.ok(a.total_recovery <= b.total_recovery + 1e-10);
      }
    }
  }
  const coarse = clone(getObserverCase('length'));
  coarse.rows.forEach(row => { row.control.trace.length = Math.floor(row.control.trace.length / 10); });
  assert.equal(analyzeFiniteChannel(coarse).routes.control.selected_view.total_bits, 0);
});
test('typed scalar encoding distinguishes strings, numbers, null and empty text', () => {
  const model = clone(getObserverCase('length'));
  model.rows[0].control.trace.reply = 1; model.rows[1].control.trace.reply = '1';
  assert.equal(analyzeFiniteChannel(model, ['reply']).routes.control.selected_view.total_bits, 1);
  model.rows[0].control.trace.reply = null; model.rows[1].control.trace.reply = '';
  assert.equal(analyzeFiniteChannel(model, ['reply']).routes.control.selected_view.total_bits, 1);
});
test('invalid, missing, oversized and empirical inputs fail closed', () => {
  const mutations = [
    m => { m.evidence_class = 'EMPIRICAL'; }, m => { m.rows = []; }, m => { m.channels = 'invalid'; },
    m => { m.rows[0].weight = 0; }, m => { m.rows[0].weight = -.5; },
    m => { m.rows[0].weight = Number.MAX_SAFE_INTEGER; },
    m => { m.rows[1].id = m.rows[0].id; }, m => { m.rows[0].secret = NaN; },
    m => { delete m.rows[0].baseline; }, m => { delete m.rows[0].control.trace.reply; },
    m => { m.rows[0].control.trace.extra = 1; }, m => { m.rows[0].control.trace.reply = {}; },
    m => { m.channels[0].capture.control = 'MISSING'; },
    m => { m.channels[1].id = m.channels[0].id; }, m => { m.rows = Array(1025).fill(m.rows[0]); },
    m => { m.channels = Array(7).fill(m.channels[0]); }
  ];
  for (const change of mutations) {
    const model = clone(getObserverCase('length')); change(model);
    const r = analyzeFiniteChannel(model);
    assert.equal(r.status, 'INADMISSIBLE'); assert.equal(r.routes, undefined);
    assert.equal(r.ceiling.release_authority, false);
  }
  for (const value of [null, {}, 5, 'secret']) assert.equal(analyzeFiniteChannel(value).status, 'INADMISSIBLE');
  for (const selection of [['reply', 'reply'], ['unknown'], 'reply', null]) assert.equal(analyzeFiniteChannel(getObserverCase('length'), selection).status, 'INADMISSIBLE');
});
test('results are immutable, deterministic, input-preserving and cannot inherit claimed authority', () => {
  for (const model of OBSERVER_CASES) {
    const before = JSON.stringify(model), r = analyzeFiniteChannel(model);
    assert.equal(JSON.stringify(model), before); assert.deepEqual(analyzeFiniteChannel(model), r);
    assert.ok(Object.isFrozen(r.routes.control.subsets));
    assert.equal(r.ceiling.empirical_credit, 0); assert.equal(r.ceiling.empirical_contract, 'HELD');
    assert.throws(() => { r.ceiling.golden_egg = 'EARNED'; }, TypeError);
  }
  const spoof = clone(getObserverCase('length')); spoof.release_authority = true; spoof.golden_egg = 'EARNED';
  assert.equal(analyzeFiniteChannel(spoof).ceiling.release_authority, false);
});
