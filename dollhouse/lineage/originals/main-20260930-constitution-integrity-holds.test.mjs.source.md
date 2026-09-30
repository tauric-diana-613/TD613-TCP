import assert from 'node:assert/strict';
import {
  compileApertureCompositionPlan,
  compileApertureCompositionReceipt
} from '../../app/engine/aperture-composition-constitution.js';
import { buildApertureCompositionFixture, FIXED_TIME } from '../fixtures/aperture-composition-fixture.mjs';

const base = await buildApertureCompositionFixture();
let sequence = 0;
const compile = overrides => compileApertureCompositionReceipt({
  ...base,
  ...overrides,
  receiptId: `apcomp_receipt_integrity_${++sequence}`,
  createdAt: FIXED_TIME
});

assert.equal((await compile({ hushReceipt: null })).composition_state, 'MISSING_LAYER_HOLD');
const tamperedSource = structuredClone(base.source);
tamperedSource.source_status = 'OBSERVED';
assert.equal((await compile({ source: tamperedSource })).composition_state, 'TAMPER_HOLD');
assert.equal((await compile({
  currentCase: { ...base.currentCase, caseMapDigest: `sha256:${'9'.repeat(64)}` }
})).composition_state, 'STALE_AUTHORITY_HOLD');

const wrongOrderPlan = await compileApertureCompositionPlan({
  planId: 'apcomp_plan_wrong_order',
  createdAt: FIXED_TIME,
  layerOrder: [
    'AUTHORITY_CONTEXT', 'INSTRUMENT_ENSEMBLE', 'CONTROLLED_SOURCE', 'SNAPSHOT_LATTICE',
    'EXPERIMENT_RUN', 'TOMOGRAPHY_RECEIPT', 'CHOIR_CALIBRATION_BINDING',
    'HUSH_INTERVENTION_RECEIPT', 'PRESENTATION_PROJECTION'
  ]
});
assert.equal((await compile({ plan: wrongOrderPlan })).composition_state, 'LAYER_ORDER_HOLD');

console.log('aperture-composition/constitution-integrity-holds.test.mjs passed');
