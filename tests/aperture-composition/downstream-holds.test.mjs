import assert from 'node:assert/strict';
import { compileCaseMap, compileRouteMemory } from '../../app/engine/ash-keep-core.js';
import { compileChoirCalibrationBinding } from '../../app/engine/ash-keep-choir-calibration.js';
import { compileHushInterventionReceipt } from '../../app/engine/hush-intervention-receipt.js';
import {
  compileApertureCompositionPlan,
  compileApertureCompositionReceipt
} from '../../app/engine/aperture-composition.js';
import { bindingInput } from '../choir-calibration/suite.mjs';
import { buildApertureCompositionFixture, FIXED_TIME } from '../fixtures/aperture-composition-fixture.mjs';

const base = await buildApertureCompositionFixture();
let sequence = 0;
const compile = overrides => compileApertureCompositionReceipt({
  ...base,
  ...overrides,
  receiptId: `apcomp_receipt_downstream_${++sequence}`,
  createdAt: FIXED_TIME
});

const staleCaseMap = await compileCaseMap({
  caseId: 'case_aperture_composition_stale', profile: 'research',
  title: 'Stale composition case', createdAt: FIXED_TIME,
  rooms: [{ id: 'room_stale', label: 'Stale room' }],
  nodes: [{ id: 'node_stale', type: 'entity', label: 'Stale node', room_id: 'room_stale' }],
  relationships: [], evidenceBasis: ['stale Choir composition fixture']
});
const staleRouteMemory = await compileRouteMemory({
  caseId: staleCaseMap.case_id, createdAt: FIXED_TIME, entries: [],
  evidenceBasis: ['stale Choir route fixture']
});
const staleChoirBinding = await compileChoirCalibrationBinding({
  ...bindingInput,
  bindingId: 'choircal_aperture_composition_stale',
  createdAt: FIXED_TIME,
  caseMap: staleCaseMap,
  routeMemory: staleRouteMemory
});
assert.equal((await compile({ choirBinding: staleChoirBinding })).composition_state, 'CHOIR_BINDING_HOLD');

const driftHushReceipt = await compileHushInterventionReceipt({
  ...base.hushReceiptInput,
  receiptId: 'hush_intervention_aperture_composition_drift',
  createdAt: FIXED_TIME,
  sourceDriftState: 'SOURCE_DRIFTED'
});
assert.equal((await compile({ hushReceipt: driftHushReceipt })).composition_state, 'HUSH_BINDING_HOLD');
assert.equal((await compile({ presentationBoundaryReviewed: false })).composition_state, 'PRESENTATION_BOUNDARY_HOLD');

await assert.rejects(
  compileApertureCompositionReceipt({ ...base, mountUi: true }),
  /cannot acquire execution authority/
);
await assert.rejects(
  compileApertureCompositionPlan({ planId: 'apcomp_plan_authority', releaseAuthorized: true }),
  /cannot acquire execution authority/
);

console.log('aperture-composition/downstream-holds.test.mjs passed');
