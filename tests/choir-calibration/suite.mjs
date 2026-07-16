import { compileMatchedBenignControlBank } from '../../app/engine/ash-keep-benign-controls.js';
import {
  buildFixture,
  controlOne,
  controlTwo,
  controlZero,
  createdAt,
  targetSummaries
} from '../fixtures/choir-calibration-fixture.mjs';

export { controlOne, controlTwo, controlZero, createdAt, targetSummaries };
export const targetBundle = await buildFixture('fixture_choir_target', targetSummaries, { fixture_class: 'TARGET' });
export const controlA = await buildFixture('fixture_choir_control_a', controlZero);
export const controlB = await buildFixture('fixture_choir_control_b', controlOne);
export const controlC = await buildFixture('fixture_choir_control_c', controlTwo);
export const controlBank = await compileMatchedBenignControlBank({
  bankId: 'controlbank_choir_calibration',
  createdAt,
  target: targetBundle.fixture,
  controls: [controlA.fixture, controlB.fixture, controlC.fixture]
});
export const bindingInput = {
  bindingId: 'choircal_verified_fixture',
  createdAt,
  caseMap: targetBundle.caseMap,
  routeMemory: targetBundle.routeMemory,
  moireAssays: targetBundle.fixture.moire_assays,
  provenances: targetBundle.fixture.provenances,
  disagreementLedger: targetBundle.fixture.disagreement_ledger,
  controlBank
};
