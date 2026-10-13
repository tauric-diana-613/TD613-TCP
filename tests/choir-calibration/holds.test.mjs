import assert from 'node:assert/strict';
import { compileCaseMap, compileRouteMemory } from '../../app/engine/ash-keep-core.js';
import { compileMoireRebuildAssay } from '../../app/engine/ash-keep-moire.js';
import { compileMatchedBenignControlBank } from '../../app/engine/ash-keep-benign-controls.js';
import { compileChoirCalibrationBinding } from '../../app/engine/ash-keep-choir-calibration.js';
import { buildFixture, moireResults, readers } from '../fixtures/choir-calibration-fixture.mjs';
import {
  bindingInput,
  controlA,
  controlB,
  controlC,
  controlZero,
  controlBank,
  createdAt,
  targetBundle,
  targetSummaries
} from './suite.mjs';

const tamperedBank = structuredClone(controlBank);
tamperedBank.eligible_control_count = 99;
const tamperHold = await compileChoirCalibrationBinding({ ...bindingInput, bindingId: 'choircal_tamper_fixture', controlBank: tamperedBank });
assert.equal(tamperHold.binding_state, 'TAMPER_HOLD');
assert.equal(tamperHold.calibration_eligible, false);
assert.equal(tamperHold.automatic_hold, false);

const staleCaseMap = await compileCaseMap({
  caseId: 'case_stale_current_fixture', profile: 'research', title: 'Different current case', createdAt,
  rooms: [{ id: 'room_stale', label: 'Stale room' }],
  nodes: [{ id: 'node_stale', type: 'entity', label: 'Stale node', room_id: 'room_stale' }],
  relationships: [], evidenceBasis: ['stale-case hold fixture']
});
const staleRoute = await compileRouteMemory({ caseId: staleCaseMap.case_id, createdAt, entries: [], evidenceBasis: ['stale route fixture'] });
const staleHold = await compileChoirCalibrationBinding({ ...bindingInput, bindingId: 'choircal_stale_fixture', caseMap: staleCaseMap, routeMemory: staleRoute });
assert.equal(staleHold.binding_state, 'STALE_CASE_HOLD');
assert.equal(staleHold.automatic_hold, false);

const driftTarget = await buildFixture('fixture_choir_drift_target', targetSummaries, { fixture_class: 'TARGET', source_drift_state: 'SOURCE_DRIFTED' });
const driftControlBank = await compileMatchedBenignControlBank({
  bankId: 'controlbank_choir_drift', createdAt, target: driftTarget.fixture,
  controls: [controlA.fixture, controlB.fixture, controlC.fixture]
});
const driftHold = await compileChoirCalibrationBinding({
  bindingId: 'choircal_drift_fixture', createdAt,
  caseMap: driftTarget.caseMap, routeMemory: driftTarget.routeMemory,
  moireAssays: driftTarget.fixture.moire_assays,
  provenances: driftTarget.fixture.provenances,
  disagreementLedger: driftTarget.fixture.disagreement_ledger,
  controlBank: driftControlBank
});
assert.equal(driftHold.binding_state, 'SOURCE_DRIFT_HOLD');
assert.equal(driftHold.calibration_eligible, false);

const replacementAssay = await compileMoireRebuildAssay({
  assayId: 'moire_replacement_reader_choir_alpha', createdAt: '2026-07-16T06:00:01.000Z',
  caseMap: targetBundle.caseMap, routeMemory: targetBundle.routeMemory, reader: readers[0],
  projections: [
    { projection_id: 'projection_left', disclosed_opaque_references: ['node_left'], route_id: 'route_left', purpose: 'left projection', source_status: 'SUPPLIED' },
    { projection_id: 'projection_right', disclosed_opaque_references: ['node_right'], route_id: 'route_right', purpose: 'right projection', source_status: 'SUPPLIED' }
  ],
  results: moireResults(readers[0].reader_id, 0),
  calibration: {
    preregisteredFixture: true, benignControl: true, heldOut: true,
    sourceDriftCheck: true, alternativeReader: true,
    exactThresholds: { minimum_observed_pairs: 1 }
  }
});
const referenceHold = await compileChoirCalibrationBinding({
  ...bindingInput, bindingId: 'choircal_reference_fixture',
  moireAssays: [replacementAssay, targetBundle.fixture.moire_assays[1]]
});
assert.equal(referenceHold.binding_state, 'RECEIPT_REFERENCE_HOLD');
assert.equal(referenceHold.calibration_eligible, false);

const mismatchedControl = await buildFixture('fixture_choir_control_mismatch', controlZero, { match_profile: { register: 'press release' } });
const heldBank = await compileMatchedBenignControlBank({
  bankId: 'controlbank_choir_held', createdAt, target: targetBundle.fixture,
  controls: [controlA.fixture, controlB.fixture, mismatchedControl.fixture]
});
const notEnough = await compileChoirCalibrationBinding({ ...bindingInput, bindingId: 'choircal_not_enough_fixture', controlBank: heldBank });
assert.equal(notEnough.binding_state, 'NOT_ENOUGH_TEST_DATA');
assert.equal(notEnough.calibration_eligible, false);
