import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  runHeterostratigraphicHolonomyTomographyBridge,
} from '../app/dome-world/previews/a15-r0/heterostratigraphic-holonomy-tomography-bridge.js';
import {
  HOLO_LOOM_HETEROSTRATIGRAPHIC_APPARATUS_SCHEMA,
  ASH_HETEROSTRATIGRAPHIC_READONLY_SCHEMA,
  HOLO_LOOM_HETEROSTRATIGRAPHIC_STACKED_PARENT,
  compileLoomHeterostratigraphicApparatusReceipt,
  compileAshReadOnlyTomographyProjection,
  apparatusAuthorityMonotonicityCertificate,
  rejectAshAuthorityWidening,
} from '../app/dome-world/previews/a15-r0/holonomy-loom-heterostratigraphic-apparatus-adapter.js';

const fixture = JSON.parse(fs.readFileSync(
  new URL('./fixtures/pedagogue/heterostratigraphic-holonomy-tomography-strata-lantern-v01.json', import.meta.url),
  'utf8',
));

assert.equal(
  HOLO_LOOM_HETEROSTRATIGRAPHIC_STACKED_PARENT,
  'aad04e9cbb4532b4fc63dea16ef179f2e66200ed',
  'apparatus adapter must pin the exact frozen #788 bridge head',
);

const bridge = runHeterostratigraphicHolonomyTomographyBridge(fixture);
assert.equal(bridge.findings.assay_mechanism_validated, true);
assert.equal(bridge.global_synthesis_authority, false);
assert.equal(bridge.promotion_authority, false);
assert.equal(bridge.live_ash_binding, false);

const receipt = compileLoomHeterostratigraphicApparatusReceipt(bridge);
assert.equal(receipt.schema, HOLO_LOOM_HETEROSTRATIGRAPHIC_APPARATUS_SCHEMA);
assert.equal(receipt.apparatus_owner, 'HOLONOMY_LOOM_RESEARCH');
assert.equal(receipt.research_only, true);
assert.equal(receipt.runtime_binding, false);
assert.equal(receipt.stratum_panels.length, 4);
assert.deepEqual(receipt.stratum_panels.map(panel => panel.id), [
  'ROUTE',
  'TEMPORAL',
  'FACE_HOLONOMY',
  'OBSERVABILITY_ECOLOGY',
]);
assert.equal(receipt.stratum_panels.every(panel => panel.local_pass === true), true);
assert.equal(receipt.inspection.comparison_edge_count, 12);
assert.equal(receipt.inspection.partial_bridge_count, 2);
assert.equal(receipt.inspection.hold_count, 10);
assert.equal(receipt.inspection.defined_bridge_count, 0);
assert.equal(receipt.inspection.encoder_required_count, 8);
assert.equal(receipt.inspection.incommensurable_count, 2);
assert.equal(receipt.partial_bridges.every(item => item.invertible === false), true);
assert.equal(receipt.comparison_holds.filter(item => item.status === 'ENCODER_REQUIRED').length, 8);
assert.equal(receipt.comparison_holds.filter(item => item.status === 'INCOMMENSURABLE').length, 2);
assert.equal(receipt.static_truth.stratum_count, 4);
assert.equal(receipt.static_truth.comparison_edge_count, 12);
assert.equal(receipt.static_truth.panels.length, 4);
assert.equal(receipt.static_truth.comparisons.length, 12);
assert.equal(receipt.static_truth.global_synthesis_authority, false);
assert.equal(receipt.claim_ceiling.scientific_bridge_promoted, false);
assert.equal(receipt.claim_ceiling.live_ash_tomography, false);
assert.equal(receipt.claim_ceiling.proto_loom, false);
assert.equal(receipt.claim_ceiling.production_authority, false);

for (const field of ['truth', 'global_truth', 'global_holonomy', 'global_route', 'global_confidence', 'privileged_stratum']) {
  assert.equal(Object.prototype.hasOwnProperty.call(receipt, field), false, `receipt must not emit ${field}`);
}

const routePanel = receipt.stratum_panels.find(panel => panel.id === 'ROUTE');
const temporalPanel = receipt.stratum_panels.find(panel => panel.id === 'TEMPORAL');
const facePanel = receipt.stratum_panels.find(panel => panel.id === 'FACE_HOLONOMY');
const ecologyPanel = receipt.stratum_panels.find(panel => panel.id === 'OBSERVABILITY_ECOLOGY');
assert.equal(routePanel.plain_language_consequence, 'Same endpoint, different route history.');
assert.match(temporalPanel.plain_language_consequence, /order of the same operations/i);
assert.match(facePanel.plain_language_consequence, /declared order and common basepoint/i);
assert.match(ecologyPanel.plain_language_consequence, /observed ecology and calibration support/i);

const projection = compileAshReadOnlyTomographyProjection(receipt);
assert.equal(projection.schema, ASH_HETEROSTRATIGRAPHIC_READONLY_SCHEMA);
assert.equal(projection.surface_owner, 'ASH_KEEP_RESEARCH_SURFACE');
assert.equal(projection.runtime_binding, false);
assert.equal(projection.cards.length, 4);
assert.equal(projection.holds.length, 10);
assert.equal(projection.partial_bridges.length, 2);
assert.equal(projection.cards.every(card => card.read_only === true), true);
assert.deepEqual(projection.available_actions, [
  'INSPECT_LOCAL_RESULT',
  'INSPECT_COMPARISON_HOLD',
  'RETURN',
  'REST',
]);
for (const forbidden of [
  'RUN_TOMOGRAPHY_INVERSE',
  'CREATE_CROSS_STRATUM_ENCODER',
  'PROMOTE_CLAIM',
  'MUTATE_CASE_CUSTODY',
  'WRITE_ROUTE_MEMORY',
  'AUTHORIZE_RELEASE',
  'TRANSMIT_SOURCE_CONTENT',
]) {
  assert.equal(projection.prohibited_actions.includes(forbidden), true, `Ash must preserve prohibition ${forbidden}`);
  assert.equal(projection.available_actions.includes(forbidden), false, `Ash may not make ${forbidden} available`);
}
assert.equal(projection.claim_ceiling.tomography_inverse_authority, false);
assert.equal(projection.claim_ceiling.encoder_authority, false);
assert.equal(projection.claim_ceiling.live_case_mutation, false);
assert.equal(projection.claim_ceiling.route_memory_write, false);
assert.equal(projection.claim_ceiling.release_authority, false);
assert.equal(projection.claim_ceiling.production_authority, false);

const authority = apparatusAuthorityMonotonicityCertificate(receipt, projection);
assert.equal(authority.passed, true);
assert.equal(authority.all_coordinates_monotone, true);
assert.equal(authority.all_prohibited_actions_preserved, true);
assert.equal(authority.all_hold_and_partial_comparisons_preserved, true);
assert.equal(authority.coordinates.every(row => row.loom === false && row.ash === false && row.monotone), true);
assert.equal(authority.scar, 'RECEIPT_VISIBILITY != TOMOGRAPHY_AUTHORITY');

// Hostile 1: make the inverse callable from Ash.
const hostileInverse = rejectAshAuthorityWidening({
  ...projection,
  available_actions: [...projection.available_actions, 'RUN_TOMOGRAPHY_INVERSE'],
});
assert.equal(hostileInverse.accepted, false);
assert.equal(hostileInverse.classification, 'ASH_AUTHORITY_WIDENING_REJECTED');
assert.deepEqual(hostileInverse.widened_actions, ['RUN_TOMOGRAPHY_INVERSE']);

// Hostile 2: grant encoder authority through the authority vector.
const hostileEncoder = rejectAshAuthorityWidening({
  ...projection,
  authority: { ...projection.authority, encoder: true },
});
assert.equal(hostileEncoder.accepted, false);
assert.equal(hostileEncoder.widened_authority_coordinates.includes('encoder'), true);

// Hostile 3: live runtime binding is not a harmless rendering flag.
const hostileRuntime = rejectAshAuthorityWidening({
  ...projection,
  runtime_binding: true,
});
assert.equal(hostileRuntime.accepted, false);
assert.equal(hostileRuntime.live_runtime_binding_attempted, true);

// Hostile 4: INCOMMENSURABLE must remain a hold, not contradiction.
for (const hold of projection.holds.filter(item => item.status === 'INCOMMENSURABLE')) {
  assert.equal(hold.operator_posture, 'HOLD_AND_INSPECT');
  assert.match(hold.prohibited_inference, /DO_NOT_RENDER_AS_CONTRADICTION/);
}

// Hostile 5: ENCODER_REQUIRED must remain a hold, not guessed equivalence.
for (const hold of projection.holds.filter(item => item.status === 'ENCODER_REQUIRED')) {
  assert.equal(hold.operator_posture, 'HOLD_AND_INSPECT');
  assert.match(hold.prohibited_inference, /DO_NOT_INVENT_ENCODER/);
}

// Hostile 6: static truth must preserve every hold/partial edge even without a visual renderer.
const staticHoldCount = receipt.static_truth.comparisons.filter(item => item.kind === 'HOLD').length;
const staticPartialCount = receipt.static_truth.comparisons.filter(item => item.kind === 'PARTIAL_BRIDGE').length;
assert.equal(staticHoldCount, projection.holds.length);
assert.equal(staticPartialCount, projection.partial_bridges.length);

// Hostile 7: the projection may not smuggle global synthesis fields.
for (const field of ['truth', 'global_truth', 'global_holonomy', 'global_route', 'global_confidence', 'privileged_stratum']) {
  assert.equal(Object.prototype.hasOwnProperty.call(projection, field), false, `projection must not emit ${field}`);
}

console.log('Ash A15-R0 Holonomy Loom heterostratigraphic apparatus adapter hostiles passed.');
