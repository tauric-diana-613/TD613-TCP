import assert from 'node:assert/strict';
import {
  APERTURE_COMPOSITION_ORDER,
  compileApertureCompositionReceipt,
  compileAperturePresentationProjection,
  replayApertureComposition,
  verifyApertureCompositionPlan,
  verifyApertureCompositionReceipt,
  verifyApertureCompositionReplay,
  verifyAperturePresentationProjection
} from '../../app/engine/aperture-composition.js';
import { buildApertureCompositionFixture, FIXED_TIME } from '../fixtures/aperture-composition-fixture.mjs';

export const fixture = await buildApertureCompositionFixture();
assert.equal(await verifyApertureCompositionPlan(fixture.plan), true);

export const receipt = await compileApertureCompositionReceipt({
  ...fixture,
  receiptId: 'apcomp_receipt_eligible',
  createdAt: FIXED_TIME
});
assert.equal(receipt.composition_state, 'COMPOSITION_ELIGIBLE');
assert.equal(receipt.composition_eligible, true);
assert.equal(receipt.presentation_projection_eligible, true);
assert.deepEqual(receipt.layer_order, APERTURE_COMPOSITION_ORDER);
assert.equal(Object.values(receipt.verified).every(Boolean), true);
assert.equal(Object.values(receipt.binding_checks).every(Boolean), true);
assert.equal(receipt.tomography_posture.status, 'TOMOGRAPHY_READY');
assert.equal(receipt.choir_posture.binding_state, 'CALIBRATION_ELIGIBLE');
assert.equal(receipt.hush_posture.intervention_state, 'INTERVENTION_ELIGIBLE');
assert.equal(receipt.hush_posture.candidate_status, 'UNKEPT_CANDIDATE');
assert.equal(receipt.hush_posture.candidate_kept, false);
assert.equal(receipt.ui_mounted, false);
assert.equal(receipt.ui_mount_authorized, false);
assert.equal(receipt.universal_score, null);
assert.equal(receipt.release_authorized, false);
assert.equal(receipt.transport_authorized, false);
assert.equal(receipt.cinder_action_authorized, false);
assert.equal(await verifyApertureCompositionReceipt(receipt), true);

export const projection = await compileAperturePresentationProjection(receipt, {
  projectionId: 'apcomp_projection_eligible',
  createdAt: FIXED_TIME
});
assert.equal(projection.status, 'PRESENTATION_READY');
assert.equal(projection.receipt_verified, true);
assert.equal(projection.render_contract.read_only, true);
assert.equal(projection.render_contract.provenance_visible, true);
assert.equal(projection.render_contract.warnings_collapsible, false);
assert.equal(projection.render_contract.instruments_selectable, false);
assert.equal(projection.render_contract.models_selectable, false);
assert.equal(projection.render_contract.candidate_selectable, false);
assert.equal(projection.raw_source_present, false);
assert.equal(projection.candidate_body_present, false);
assert.equal(projection.case_map_body_present, false);
assert.equal(projection.route_memory_body_present, false);
assert.equal(projection.provider_log_present, false);
assert.equal(projection.reader_result_body_present, false);
assert.equal(await verifyAperturePresentationProjection(projection), true);

export const replay = await replayApertureComposition(receipt, projection, {
  replayId: 'apcomp_replay_eligible',
  createdAt: FIXED_TIME
});
assert.equal(replay.status, 'APERTURE_COMPOSITION_REPLAY_VERIFIED');
assert.equal(replay.composition_reexecuted, false);
assert.equal(replay.instruments_reexecuted, false);
assert.equal(replay.reconstruction_reexecuted, false);
assert.equal(replay.readers_reexecuted, false);
assert.equal(replay.provider_reexecuted, false);
assert.equal(await verifyApertureCompositionReplay(replay), true);

const tamperedProjection = structuredClone(projection);
tamperedProjection.status = 'PRESENTATION_HELD';
const heldReplay = await replayApertureComposition(receipt, tamperedProjection, {
  replayId: 'apcomp_replay_held',
  createdAt: FIXED_TIME
});
assert.equal(heldReplay.status, 'APERTURE_COMPOSITION_REPLAY_HELD');

console.log('aperture-composition/eligible.test.mjs passed');
