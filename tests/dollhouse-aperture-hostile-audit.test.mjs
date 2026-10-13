import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  compileLoomDemoScene,
  validateLoomSemanticField
} from '../app/dome-world/holonomy-loom/semantic-field.js';
import {
  createPortableFlowcoreControl,
  runAtlasAgent,
  loomComparedSurfacesToFadt
} from '../app/engine/dollhouse-atlas-fadt.js';
import {
  compileDollhousePortableProjection,
  operateDollhousePortableProjection,
  revalidateDollhousePortableReturn
} from '../app/engine/dollhouse-portable-aia-roundtrip.js';

const clone = value => JSON.parse(JSON.stringify(value));

test('Dollhouse cannot turn an invalid origin release flag into admissible action support', () => {
  const packet = compileLoomDemoScene(2);
  const returned = operateDollhousePortableProjection(compileDollhousePortableProjection(packet), {
    operation: 'PROPOSE_ACTION', proposedAction: 'COPY_CHECKED_MESSAGE'
  });
  assert.equal(revalidateDollhousePortableReturn(packet, returned).status, 'HOLD');
  const forged = clone(packet);
  forged.analysis.release_boundary.raw_release_allowed = true;
  assert.equal(validateLoomSemanticField(forged).valid, false);
  for (const boundary of [createPortableFlowcoreControl, runAtlasAgent, compileDollhousePortableProjection]) {
    assert.throws(() => boundary(forged), /requires an admitted/);
  }
  assert.throws(() => revalidateDollhousePortableReturn(forged, returned), /requires an admitted/);
});

test('changed model provenance and erased missingness are rejected before projection', () => {
  const mutations = [
    [4, packet => { packet.alert.observed_vs_modeled = 'OBSERVED_PROVIDER_STATE'; }],
    [4, packet => { packet.receipt.model.empirically_calibrated = true; }],
    [5, packet => { packet.geometry.missingness = []; }],
    [5, packet => { packet.distinctions.C = 'RECOVERED'; }],
    [5, packet => { packet.receipt.compared_surfaces[0].status = 'RED'; }]
  ];
  for (const [index, mutate] of mutations) {
    const packet = compileLoomDemoScene(index);
    const returned = operateDollhousePortableProjection(compileDollhousePortableProjection(packet));
    const forged = clone(packet);
    mutate(forged);
    assert.throws(() => createPortableFlowcoreControl(forged), /requires an admitted/);
    assert.throws(() => revalidateDollhousePortableReturn(forged, returned), /requires an admitted/);
    if (index === 5) assert.throws(() => loomComparedSurfacesToFadt(forged), /requires an admitted/);
  }
});

test('projection preserves warning and missingness evidence while source authentication stays unearned', () => {
  for (let index = 0; index < 8; index += 1) {
    const packet = compileLoomDemoScene(index, { sourceRevision: 'a'.repeat(40) });
    const control = createPortableFlowcoreControl(packet);
    assert.deepEqual(control.evidentiary_coordinates, packet.distinctions);
    assert.deepEqual(control.evidence_context.alert, packet.alert);
    assert.deepEqual(control.evidence_context.model, packet.receipt.model);
    assert.equal(control.evidence_context.missingness_basis, packet.receipt.missingness_basis);
    assert.deepEqual(control.evidence_context.geometry_basis, packet.receipt.geometry_basis);
    assert.equal(control.source_revision, 'a'.repeat(40));
    assert.equal(control.evidence_context.source_kind, 'FICTIONAL_DEMO');
    assert.equal(control.evidence_context.source_revision_authenticated, false);
    assert.equal(control.governance.remote_host_release_authority, false);
    assert.equal(control.raw_source_included, false);
  }
});

test('modeled evidence cannot return as measured evidence under an equal action-support audit', () => {
  const packet = compileLoomDemoScene(4);
  const projection = compileDollhousePortableProjection(packet);
  const candidate = clone(operateDollhousePortableProjection(projection));
  candidate.returned_control.evidence_context.alert.observed_vs_modeled = 'OBSERVED_PROVIDER_STATE';
  candidate.returned_control.evidence_context.model.empirically_calibrated = true;
  const result = revalidateDollhousePortableReturn(packet, candidate);
  assert.equal(result.status, 'HOLD');
  assert.equal(result.fadt.all_fibres_exact, true);
  assert.equal(result.atlas.control_plane_equal, false);
  assert.ok(result.reason_codes.includes('CONTROL_PLANE_DRIFT'));
  assert.equal(result.release_authority, false);
});

test('hostile origin accessors do not run at the control boundary', () => {
  const packet = clone(compileLoomDemoScene(4));
  let reads = 0;
  Object.defineProperty(packet, 'analysis', { enumerable: true, get() { reads += 1; return {}; } });
  assert.throws(() => createPortableFlowcoreControl(packet), /accessors or hidden data/);
  assert.equal(reads, 0);
});
