import assert from 'node:assert/strict';
import {
  compileApertureCompositionReceipt,
  compileAperturePresentationProjection
} from '../../app/engine/aperture-composition-constitution.js';
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
for (const field of [
  'raw_source_present', 'candidate_body_present', 'case_map_body_present',
  'route_memory_body_present', 'provider_log_present', 'reader_result_body_present',
  'ui_mounted', 'release_authorized', 'transport_authorized', 'cinder_action_authorized'
]) assert.equal(held[field], false);
assert.equal(held.universal_score, null);

console.log('aperture-composition/constitution-projection-boundary.test.mjs passed');
