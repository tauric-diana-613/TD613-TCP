import assert from 'node:assert/strict';
import test from 'node:test';

import { runFadtAgent } from '../app/engine/dollhouse-atlas-fadt.js';
import { compileLoomDemoScene } from '../app/dome-world/holonomy-loom/semantic-field.js';
import {
  compileDollhousePortableProjection,
  operateDollhousePortableProjection,
  revalidateDollhousePortableReturn
} from '../app/engine/dollhouse-portable-aia-roundtrip.js';

const audit = (left, right) => runFadtAgent({
  fibres: [{ id: 'q', antecedents: [{ id: 'left', support: left }, { id: 'right', support: right }] }]
}).fibres[0];
const clone = value => JSON.parse(JSON.stringify(value));

test('every pair of subsets of a three-action universe preserves exact U, I, and Gamma', () => {
  const universe = ['COPY', 'REST', 'RETURN'];
  const subsets = Array.from({ length: 8 }, (_, bits) => universe.filter((_, index) => bits & (1 << index)));
  for (const left of subsets) {
    for (const right of subsets) {
      const receipt = audit(left, right);
      const union = universe.filter(value => left.includes(value) || right.includes(value));
      const intersection = universe.filter(value => left.includes(value) && right.includes(value));
      const gap = universe.filter(value => left.includes(value) !== right.includes(value));
      assert.deepEqual(receipt.union, union);
      assert.deepEqual(receipt.intersection, intersection);
      assert.deepEqual(receipt.irreducible_gap, gap);
      assert.deepEqual(receipt.largest_universally_sound_rule, intersection);
      assert.deepEqual(receipt.smallest_universally_complete_rule, union);
      assert.equal(receipt.exact_descended_admissibility, gap.length === 0);
      assert.equal(receipt.support_constant_on_fibre, gap.length === 0);
      assert.equal(receipt.verdict, gap.length === 0 ? 'AUTHORIZED' : 'HOLD');
    }
  }
});

test('duplicate support atoms and order do not change support, while empty occupied support stays empty', () => {
  assert.deepEqual(audit(['REST', 'RETURN', 'REST'], ['RETURN', 'REST']).irreducible_gap, []);
  const empty = audit([], []);
  assert.equal(empty.verdict, 'AUTHORIZED');
  assert.deepEqual(empty.union, []);
  assert.deepEqual(empty.intersection, []);
  assert.deepEqual(empty.irreducible_gap, []);
  const partialEmpty = audit([], ['REST']);
  assert.equal(partialEmpty.verdict, 'HOLD');
  assert.deepEqual(partialEmpty.intersection, []);
  assert.deepEqual(partialEmpty.irreducible_gap, ['REST']);
});

test('unoccupied and sparse fibres cannot acquire an exactness receipt', () => {
  for (const input of [
    { fibres: [] },
    { fibres: [{ antecedents: [] }] },
    { fibres: Array(1) },
    { fibres: [{ antecedents: [{ support: ['REST'] }, ,] }] },
    { fibres: [{ antecedents: [{ support: Array(1) }] }] }
  ]) assert.throws(() => runFadtAgent(input), TypeError);
});

test('malformed support atoms cannot be coerced into false support equality', () => {
  for (const value of [1, true, null, undefined, {}, [], Symbol('REST'), '', '   ']) {
    assert.throws(() => audit([value], [String(value)]), TypeError);
  }
  assert.throws(() => audit([{ action: 'REST' }], [{ action: 'RELEASE' }]), TypeError);
  assert.throws(() => audit('REST', ['REST']), TypeError);
});

test('duplicate quotient IDs cannot partition incompatible support into two exact fibres', () => {
  assert.throws(() => runFadtAgent({ fibres: [
    { id: 'q', antecedents: [{ support: ['REST'] }] },
    { id: 'q', antecedents: [{ support: ['COPY'] }] }
  ] }), /Duplicate FADT fibre id/);
  assert.throws(() => runFadtAgent({ fibres: [{ antecedents: [
    { id: 'same', support: ['REST'] },
    { id: 'same', support: ['COPY'] }
  ] }] }), /Duplicate FADT antecedent id/);
  assert.throws(() => runFadtAgent({ fibres: [
    { id: 'fibre-1', antecedents: [{ support: ['REST'] }] },
    { antecedents: [{ support: ['COPY'] }] }
  ] }), /Duplicate FADT fibre id/);
});

test('malformed records and IDs do not manufacture named antecedents or quotient states', () => {
  for (const input of [null, [], 1, { fibres: [null] }, { fibres: [{ antecedents: [null] }] }]) {
    assert.throws(() => runFadtAgent(input), TypeError);
  }
  for (const id of [null, 1, {}, '', '  ']) {
    assert.throws(() => runFadtAgent({ fibres: [{ id, antecedents: [{ support: ['REST'] }] }] }), TypeError);
    assert.throws(() => runFadtAgent({ fibres: [{ antecedents: [{ id, support: ['REST'] }] }] }), TypeError);
  }
});

test('erasing a supported action keeps the exact gap visible through Loom revalidation', () => {
  const scene = compileLoomDemoScene(2, { sourceRevision: 'working-tree' });
  const returned = clone(operateDollhousePortableProjection(compileDollhousePortableProjection(scene)));
  const key = 'safer_copy_available';
  assert.equal(returned.returned_control.governance[key], true);
  delete returned.returned_control.governance[key];
  const receipt = revalidateDollhousePortableReturn(scene, returned);
  assert.equal(receipt.status, 'HOLD');
  assert.ok(receipt.reason_codes.includes('FADT_ADMISSIBILITY_GAP'));
  assert.deepEqual(receipt.fadt.fibres[0].irreducible_gap, ['MAKE_SAFER_COPY']);
  assert.equal(receipt.fadt.fibres[0].exact_descended_admissibility, false);
  assert.equal(receipt.release_authority, false);
  assert.equal(receipt.human_closure_required, true);
});

test('equal-size different returned supports preserve both sides of Gamma', () => {
  const scene = compileLoomDemoScene(2, { sourceRevision: 'working-tree' });
  const returned = clone(operateDollhousePortableProjection(compileDollhousePortableProjection(scene)));
  returned.returned_control.governance.safer_copy_available = false;
  returned.returned_control.governance.raw_release_allowed = true;
  const receipt = revalidateDollhousePortableReturn(scene, returned);
  assert.equal(receipt.action.origin_support.length, receipt.action.returned_support.length);
  assert.equal(receipt.status, 'HOLD');
  assert.deepEqual(receipt.fadt.fibres[0].irreducible_gap, ['COPY_CHECKED_MESSAGE', 'MAKE_SAFER_COPY']);
  assert.equal(receipt.fadt.fibres[0].verdict, 'HOLD');
});

test('control erasure remains held even when finite action support is unchanged', () => {
  const scene = compileLoomDemoScene(2, { sourceRevision: 'working-tree' });
  const returned = clone(operateDollhousePortableProjection(compileDollhousePortableProjection(scene)));
  delete returned.returned_control.route_state;
  const receipt = revalidateDollhousePortableReturn(scene, returned);
  assert.equal(receipt.status, 'HOLD');
  assert.ok(receipt.reason_codes.includes('CONTROL_PLANE_DRIFT'));
  assert.equal(receipt.fadt.all_fibres_exact, true);
  assert.deepEqual(receipt.fadt.fibres[0].irreducible_gap, []);
  assert.equal(receipt.release_authority, false);
});
