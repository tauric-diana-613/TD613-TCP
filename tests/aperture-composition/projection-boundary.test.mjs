import assert from 'node:assert/strict';
import {
  compileApertureCompositionReceipt,
  compileAperturePresentationProjection
} from '../../app/engine/aperture-composition.js';
import { buildApertureCompositionFixture, FIXED_TIME } from '../fixtures/aperture-composition-fixture.mjs';

const fixture = await buildApertureCompositionFixture();
const receipt = await compileApertureCompositionReceipt({
  ...fixture,
  receiptId: 'apcomp_receipt_projection_boundary',
  createdAt: FIXED_TIME
});
const held = await compileAperturePresentationProjection(receipt, {
  projectionId: 'apcomp_projection_forbidden',
  createdAt: FIXED_TIME,
  rawSource: 'forbidden source text',
  candidateBody: 'forbidden candidate body',
  caseMap: { nodes: [] },
  routeMemory: { entries: [] },
  providerLog: { request: true },
  readerResultBody: { value: 1 }
});
assert.equal(held.status, 'PRESENTATION_HELD');
assert.equal(held.forbidden_paths.length, 6);
assert.equal(held.raw_source_present, false);
assert.equal(held.candidate_body_present, false);
assert.equal(held.case_map_body_present, false);
assert.equal(held.route_memory_body_present, false);
assert.equal(held.provider_log_present, false);
assert.equal(held.reader_result_body_present, false);
assert.equal(held.ui_mounted, false);
assert.equal(held.release_authorized, false);
assert.equal(held.transport_authorized, false);
assert.equal(held.cinder_action_authorized, false);
assert.equal(held.universal_score, null);

console.log('aperture-composition/projection-boundary.test.mjs passed');
