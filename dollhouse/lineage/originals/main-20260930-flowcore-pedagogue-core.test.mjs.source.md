import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { webcrypto } from 'node:crypto';
import {
  PEDAGOGUE_PHASES, compilePedagogicalScene, compilePedagogicalTransition,
  advancePedagoguePhase, compileRestState, compileTransferEncounter,
  compilePedagogueReceipt, verifyPedagogueReceipt, serializePedagogueReceipt
} from '../app/engine/flowcore-pedagogue-core.js';
import { TD613_NAMESPACE_SCALAR, TD613_NAMESPACE_UTF16, WRITERLY_LANE, ZWNJ } from '../app/dome-world/data/flowcore-glyph-semantics-v01.js';
import { FLOWCORE_AIA_ROUTE_IDS, FLOWCORE_AIA_ROUTES } from '../app/dome-world/data/flowcore-aia-route-registry-v01.js';

const paths = [
  'app/dome-world/fixtures/pedagogue/gluing-soft-fold.json',
  'app/dome-world/fixtures/pedagogue/phason-content-invariant.json',
  'app/dome-world/fixtures/pedagogue/moire-pair-emergence.json'
];
const fixture = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const options = value => ({ ...value.determinism, cryptoImpl: webcrypto });

async function cycle(value) {
  const opts = options(value);
  const scene = await compilePedagogicalScene(value.scene_input, opts);
  const notice = await compilePedagogicalTransition(scene, null, null, { ...opts, phase: 'NOTICE', staticEquivalent: { summary: scene.visible_condition.plain_language, steps: ['condition', 'source and ceiling'] } });
  const act = await compilePedagogicalTransition(scene, value.action, null, { ...opts, phase: 'ACT', priorTransitions: [notice], staticEquivalent: { summary: 'Declared action and authority.', steps: ['purpose', 'authority', 'reversibility and exit'] } });
  const answer = await compilePedagogicalTransition(scene, value.action, value.world_delta, { ...opts, phase: 'WORLD_ANSWERS', priorTransitions: [notice, act] });
  const name = await compilePedagogicalTransition(scene, null, null, { ...opts, phase: 'NAME', priorTransitions: [notice, act, answer], name: value.name, staticEquivalent: { summary: value.name.plain_language, steps: ['plain relation', 'glyph', 'technical term', 'non-equivalence'] } });
  const rest = await compilePedagogicalTransition(scene, null, null, { ...opts, phase: 'REST', priorTransitions: [notice, act, answer, name], staticEquivalent: { summary: 'Demand stops; consequence, return, and exit remain.', steps: ['stop prompts', 'retain state', 'return', 'exit'] } });
  const restState = await compileRestState(scene, rest, opts);
  const transfer = await compileTransferEncounter(name, value.transfer_context, opts);
  const receipt = await compilePedagogueReceipt(scene, [notice, act, answer, name, rest], { ...opts, transferEncounters: [transfer] });
  return { scene, notice, act, answer, name, rest, restState, transfer, receipt };
}

test('cycle and routes remain canonical', () => {
  assert.deepEqual(PEDAGOGUE_PHASES, ['NOTICE', 'ACT', 'WORLD_ANSWERS', 'NAME', 'REST', 'TRANSFER']);
  assert.deepEqual(FLOWCORE_AIA_ROUTE_IDS, ['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION']);
  assert.equal(new Set(FLOWCORE_AIA_ROUTE_IDS.map(id => FLOWCORE_AIA_ROUTES.routes[id].purpose)).size, 4);
  assert.equal(FLOWCORE_AIA_ROUTES.inference_forbidden, true);
});

test('three canonical scenes carry complete falsifiable frames', async () => {
  for (const path of paths) {
    const compiled = await cycle(fixture(path));
    for (const field of ['alternative_explanations', 'expected_failure_modes', 'falsifier', 'abstention_conditions']) assert.ok(compiled.scene.research_frame[field].length, `${path}:${field}`);
    assert.equal(compiled.scene.closure.status, 'OPEN');
    assert.equal(compiled.scene.authority.automatic_ash_action, false);
    assert.equal(compiled.restState.penalty, false);
    assert.equal(compiled.restState.exit_available, true);
    assert.equal((await verifyPedagogueReceipt(compiled.receipt, { cryptoImpl: webcrypto })).valid, true);
  }
});

test('same governed input yields byte-identical receipt', async () => {
  const value = fixture(paths[0]);
  const left = await cycle(value); const right = await cycle(value);
  const a = serializePedagogueReceipt(left.receipt); const b = serializePedagogueReceipt(right.receipt);
  assert.equal(a.canonical_json, b.canonical_json);
  assert.deepEqual([...a.canonical_bytes], [...b.canonical_bytes]);
  assert.equal(left.receipt.receipt_digest, right.receipt.receipt_digest);
});

test('seed changes deterministic identity', async () => {
  const leftInput = fixture(paths[0]); const rightInput = structuredClone(leftInput);
  rightInput.determinism.idSeed += '-changed';
  const left = await cycle(leftInput); const right = await cycle(rightInput);
  assert.notEqual(left.receipt.receipt_id, right.receipt.receipt_id);
  assert.notEqual(left.receipt.receipt_digest, right.receipt.receipt_digest);
});

test('protected Unicode survives without normalization', async () => {
  assert.equal(TD613_NAMESPACE_SCALAR, TD613_NAMESPACE_UTF16);
  assert.deepEqual([...TD613_NAMESPACE_SCALAR].map(x => x.codePointAt(0)), [0x10d613]);
  assert.deepEqual([...WRITERLY_LANE].map(x => x.codePointAt(0)), [0x1d30b, 0x200c]);
  assert.equal(ZWNJ.codePointAt(0), 0x200c);
  const a = fixture(paths[0]); const b = structuredClone(a);
  a.scene_input.visible_condition.probe = 'é'; b.scene_input.visible_condition.probe = 'e\u0301';
  const left = await cycle(a); const right = await cycle(b);
  assert.notEqual(left.receipt.receipt_digest, right.receipt.receipt_digest);
  assert.equal(left.receipt.determinism.unicode_normalization, 'NONE');
});

test('premature naming and constitutional drift reject', async () => {
  const value = fixture(paths[0]); const opts = options(value);
  const scene = await compilePedagogicalScene(value.scene_input, opts);
  await assert.rejects(() => compilePedagogicalTransition(scene, null, null, { ...opts, phase: 'NAME', priorTransitions: [], name: value.name, staticEquivalent: { summary: 'premature', steps: ['premature'] } }), /prior NOTICE/);
  for (const mutate of [
    x => { x.learner_id = 'stable'; }, x => { x.authority = { automatic_ash_action: true }; },
    x => { x.rest = { available: true, penalty: true }; }, x => { x.exit = { available: false }; },
    x => { x.closure = { status: 'CLOSED' }; }, x => { x.raw_artifact_content = 'forbidden'; }
  ]) { const invalid = structuredClone(value.scene_input); mutate(invalid); await assert.rejects(() => compilePedagogicalScene(invalid, opts)); }
});

test('world answer requires causal trace or unresolved relation', async () => {
  const value = fixture(paths[0]); const opts = options(value); const scene = await compilePedagogicalScene(value.scene_input, opts);
  const notice = await compilePedagogicalTransition(scene, null, null, { ...opts, phase: 'NOTICE', staticEquivalent: { summary: 'notice', steps: ['notice'] } });
  const act = await compilePedagogicalTransition(scene, value.action, null, { ...opts, phase: 'ACT', priorTransitions: [notice], staticEquivalent: { summary: 'act', steps: ['act'] } });
  await assert.rejects(() => compilePedagogicalTransition(scene, value.action, { static_equivalent: { summary: 'empty', steps: ['empty'] } }, { ...opts, phase: 'WORLD_ANSWERS', priorTransitions: [notice, act] }), /causal trace or explicit unresolved relation/);
});

test('advance remains operator-controlled and open', async () => {
  const c = await cycle(fixture(paths[0]));
  const result = advancePedagoguePhase(c.scene, [c.notice, c.act, c.answer], 'NAME');
  assert.equal(result.allowed, true); assert.equal(result.automatic_advance, false);
  assert.equal(result.operator_action_required, true); assert.equal(result.closure.status, 'OPEN');
});
