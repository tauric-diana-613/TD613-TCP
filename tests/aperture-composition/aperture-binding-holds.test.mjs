import assert from 'node:assert/strict';
import { compileDomeExperimentRun } from '../../app/engine/aperture-v31-experiment-contract.js';
import { compileTomographyReceipt } from '../../app/engine/aperture-v31-reconstruction.js';
import { compileApertureCompositionReceipt } from '../../app/engine/aperture-composition.js';
import { buildApertureCompositionFixture, FIXED_TIME } from '../fixtures/aperture-composition-fixture.mjs';

const base = await buildApertureCompositionFixture();
let sequence = 0;
const compile = overrides => compileApertureCompositionReceipt({
  ...base,
  ...overrides,
  receiptId: `apcomp_receipt_aperture_${++sequence}`,
  createdAt: FIXED_TIME
});

const sourceMismatchRun = await compileDomeExperimentRun({
  experimentId: base.experimentRun.experiment_id,
  createdAt: FIXED_TIME,
  sourceReceiptReference: 'ashc_other_aperture_source',
  preRegistrationDigest: `sha256:${'5'.repeat(64)}`,
  instrumentEnsembleReference: base.ensemble.ensemble_id,
  snapshotBatchReference: 'ashsnap_aperture_composition',
  tomographyReceiptReference: base.tomographyReceipt.receipt_id
});
assert.equal((await compile({ experimentRun: sourceMismatchRun })).composition_state, 'SOURCE_BINDING_HOLD');

const experimentMismatchRun = await compileDomeExperimentRun({
  experimentId: base.experimentRun.experiment_id,
  createdAt: FIXED_TIME,
  sourceReceiptReference: base.source.source_receipt_reference,
  preRegistrationDigest: `sha256:${'5'.repeat(64)}`,
  instrumentEnsembleReference: base.ensemble.ensemble_id,
  snapshotBatchReference: 'ashsnap_aperture_composition',
  tomographyReceiptReference: 'attomo_other_composition_receipt'
});
assert.equal((await compile({ experimentRun: experimentMismatchRun })).composition_state, 'EXPERIMENT_BINDING_HOLD');

const abstainTomography = await compileTomographyReceipt({
  experimentId: 'atx_aperture_composition_abstain',
  receiptId: 'attomo_aperture_composition_abstain',
  createdAt: FIXED_TIME,
  source: base.source,
  ensemble: base.ensemble,
  lattice: base.lattice,
  ...base.tomographyParts,
  heldoutValidation: { status: 'NOT_RUN' },
  alternativeModels: ['linear response'],
  benignControls: ['no-op route']
});
const abstainRun = await compileDomeExperimentRun({
  experimentId: abstainTomography.experiment_id,
  createdAt: FIXED_TIME,
  sourceReceiptReference: base.source.source_receipt_reference,
  preRegistrationDigest: `sha256:${'5'.repeat(64)}`,
  instrumentEnsembleReference: base.ensemble.ensemble_id,
  snapshotBatchReference: 'ashsnap_aperture_composition',
  tomographyReceiptReference: abstainTomography.receipt_id
});
assert.equal((await compile({
  tomographyReceipt: abstainTomography,
  experimentRun: abstainRun
})).composition_state, 'TOMOGRAPHY_HOLD');

console.log('aperture-composition/aperture-binding-holds.test.mjs passed');
