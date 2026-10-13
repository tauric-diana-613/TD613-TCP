import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createAshKernelAdapter } from '../app/dome-world/previews/a15-r0/ash-kernel-adapter.js';
import { verifyCaseMap, verifyRouteMemory, verifyRebuildTest } from '../app/engine/ash-keep-core.js';
import { verifySavePoint } from '../app/engine/ash-keep-continuity.js';

const fixture = JSON.parse(fs.readFileSync('app/dome-world/fixtures/a15-r0/governed-task-fixture-v01.json', 'utf8'));
const adapterSource = fs.readFileSync('app/dome-world/previews/a15-r0/ash-kernel-adapter.js', 'utf8');
const adapter = await createAshKernelAdapter(fixture);

function hasOwnKey(value, expectedKey) {
  if (!value || typeof value !== 'object') return false;
  if (Object.hasOwn(value, expectedKey)) return true;
  return Object.values(value).some(entry => hasOwnKey(entry, expectedKey));
}

const initial = await adapter.snapshot();
assert.equal(initial.task_state, 'ARRIVE');
assert.equal(initial.production_state_read, false);
assert.equal(initial.production_state_mutated, false);
assert.equal(initial.raw_bytes_moved, false);
assert.equal(initial.case_map.nodes.length, 2);
assert.equal(initial.case_map.relationships.length, 0);
assert.equal(await verifyCaseMap(initial.case_map), true);
assert.equal(await verifyRouteMemory(initial.route_memory), true);

const held = await adapter.formRelation();
assert.equal(held.status, 'HELD');
assert.equal(held.state_before.task_state, 'ARRIVE');
assert.equal(held.state_after.task_state, 'ARRIVE');
assert.deepEqual(held.authority, {
  automatic_ash_action: false,
  raw_bytes_moved: false,
  external_send: false,
  stable_artifact_digest_exposed_to_flowcore: false,
  automatic_relation_binding: false,
  automatic_comparison: false,
  automatic_save: false,
  automatic_handoff: false,
  automatic_export: false,
  automatic_release: false,
  automatic_closure: false,
  release_authority_changed: false,
  destination_authority_changed: false,
  custody_silently_transferred: false
});

const receipts = [];
receipts.push(await adapter.bindReference());
assert.equal(receipts.at(-1).state_after.task_state, 'BIND_REFERENCE');
assert.match(receipts.at(-1).world_answer, /raw synthetic source remains local/i);
receipts.push(await adapter.formRelation());
assert.equal(receipts.at(-1).state_after.task_state, 'FORM_RELATION');
receipts.push(await adapter.compareRoute());
assert.equal(receipts.at(-1).state_after.task_state, 'COMPARE_ROUTE');
assert.ok(receipts.at(-1).owner_receipts.some(record => record.owner.endsWith('#compileRouteMemory')));
assert.ok(receipts.at(-1).owner_receipts.some(record => record.owner.endsWith('#compileRebuildTest')));
receipts.push(await adapter.preserve());
assert.equal(receipts.at(-1).state_after.task_state, 'PRESERVE');
assert.ok(receipts.at(-1).owner_receipts.some(record => record.owner.endsWith('#compileSavePoint')));
receipts.push(await adapter.returnToCustody());
assert.equal(receipts.at(-1).state_after.task_state, 'RETURN');
assert.deepEqual(receipts.at(-1).return_summary.what_was_sent, []);
assert.ok(receipts.at(-1).return_summary.what_remained_local.includes('Case Map'));
assert.ok(receipts.at(-1).return_summary.what_remains_unknown_externally.includes('External retention, knowledge, and reconstruction were not measured.'));

for (const receipt of receipts) {
  assert.equal(receipt.status, 'OPEN');
  assert.equal(receipt.source_status, 'SIMULATED');
  assert.equal(receipt.sensor_id, 'simulated-fixture');
  assert.equal(receipt.authority_class, 'A2_DERIVATIONAL');
  assert.equal(receipt.human_closure_required, true);
  assert.match(receipt.receipt_digest, /^sha256:[0-9a-f]{64}$/);
  assert.equal(hasOwnKey(receipt, 'artifact_digest'), false);
  assert.equal(receipt.authority.external_send, false);
  assert.equal(receipt.authority.automatic_release, false);
  assert.equal(receipt.authority.automatic_closure, false);
}

const completed = await adapter.snapshot();
assert.equal(await verifyCaseMap(completed.case_map), true);
assert.equal(await verifyRouteMemory(completed.route_memory), true);
assert.equal(await verifyRebuildTest(completed.rebuild_test), true);
assert.equal(await verifySavePoint(completed.save_point), true);
assert.equal(completed.route_memory.entries.length, 0);
assert.equal(completed.route_memory.controlled_test_recovery.length, 2);
assert.equal(completed.rebuild_test.calibration_state, 'NOT_ENOUGH_TEST_DATA');
assert.equal(completed.rebuild_test.exposure_bands_active, false);
assert.equal(completed.rebuild_test.real_surveillance_probability, null);

const beforeRest = await adapter.snapshot();
const rest = await adapter.rest('test rest');
const afterRest = await adapter.snapshot();
assert.equal(rest.action_id, 'REST');
assert.equal(afterRest.task_state, beforeRest.task_state);
assert.equal(afterRest.rest_active, true);
assert.match(rest.world_answer, /Active demand has stopped/);

const reset = await adapter.resetFixture();
const resetSnapshot = await adapter.snapshot();
assert.equal(reset.action_id, 'RESET');
assert.equal(resetSnapshot.task_state, 'ARRIVE');
assert.equal(resetSnapshot.case_map.nodes.length, 2);
assert.equal(resetSnapshot.case_map.relationships.length, 0);
assert.equal(resetSnapshot.route_memory.controlled_test_recovery.length, 0);
assert.equal(resetSnapshot.production_state_mutated, false);

const second = await createAshKernelAdapter(fixture);
const deterministicA = await second.bindReference();
const third = await createAshKernelAdapter(fixture);
const deterministicB = await third.bindReference();
assert.equal(deterministicA.receipt_digest, deterministicB.receipt_digest);
assert.deepEqual(deterministicA, deterministicB);

for (const ownerImport of [
  "../../../engine/ash-keep-core.js",
  "../../../engine/ash-keep-continuity.js",
  "../../ash/canonical-json.js"
]) assert.ok(adapterSource.includes(ownerImport), `Adapter omitted owner import ${ownerImport}`);
for (const duplicatedKernel of ['function normalizeNode', 'function normalizeRelationship', 'function vectorFor', 'function trigrams']) {
  assert.equal(adapterSource.includes(duplicatedKernel), false, `Adapter duplicated ${duplicatedKernel}`);
}
for (const pattern of [
  /indexedDB/,
  /localStorage/,
  /sessionStorage/,
  /caches\./,
  /serviceWorker/,
  /fetch\s*\(/,
  /XMLHttpRequest/,
  /sendBeacon/,
  /new\s+(?:Worker|SharedWorker)/,
  /automatic_release:\s*true/,
  /external_send:\s*true/
]) assert.doesNotMatch(adapterSource, pattern);

console.log(JSON.stringify({
  ok: true,
  schema: 'td613.ash.a15-r0.kernel-adapter-test/v0.1',
  existing_owners_reused: true,
  actions_completed: receipts.length,
  out_of_order_hold: true,
  deterministic_receipts: true,
  stable_artifact_digest_exposed_to_flowcore: false,
  raw_bytes_moved: false,
  external_send: false,
  human_closure_required: true
}, null, 2));
