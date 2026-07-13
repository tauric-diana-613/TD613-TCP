import assert from 'node:assert/strict';
import fs from 'node:fs';
import { compileAshDerivativeEligibility, verifyAshDerivativeEligibility } from '../app/dome-world/ash/derivative-eligibility.js';

const baseline = {
  eligibilityId: 'ashelig_0123456789abcdef0123',
  createdAt: '2026-07-13T02:00:00.000Z',
  tomographyResultCustodyReference: 'ashtomo_0123456789abcdef0123',
  operatorPurpose: 'bounded derivative review',
  sourceCustodyVerified: true,
  sourceDriftStatus: 'SOURCE_INVARIANT',
  coverageStatus: 'ADEQUATE',
  tamperStatus: 'VERIFIED',
  phasonSensitivity: 'BOUNDED',
  sharedLayerBurden: 'BOUNDED'
};

const cases = [
  [{ sourceCustodyVerified: false }, 'INELIGIBLE_MISSING_SOURCE_CUSTODY'],
  [{ sourceDriftStatus: 'DRIFT_DETECTED' }, 'INELIGIBLE_SOURCE_DRIFT'],
  [{ coverageStatus: 'INADEQUATE' }, 'INELIGIBLE_INSUFFICIENT_COVERAGE'],
  [{ tamperStatus: 'UNRESOLVED' }, 'INELIGIBLE_UNRESOLVED_TAMPER'],
  [{ phasonSensitivity: 'HIGH' }, 'REVIEW_REQUIRED_HIGH_PHASON_SENSITIVITY'],
  [{ sharedLayerBurden: 'HIGH' }, 'REVIEW_REQUIRED_HIGH_SHARED_LAYER_BURDEN'],
  [{}, 'ELIGIBLE_FOR_OPERATOR_DERIVATIVE_REVIEW']
];
for (let index = 0; index < cases.length; index += 1) {
  const [overrides, expected] = cases[index];
  const receipt = await compileAshDerivativeEligibility({ ...baseline, ...overrides, eligibilityId: `ashelig_0123456789abcdef0${index}aa` });
  assert.equal(receipt.decision, expected);
  assert.equal(receipt.recommendation_only, true);
  assert.equal(receipt.derivative_constructed, false);
  assert.equal(receipt.export_authorized, false);
  assert.equal(receipt.cinder_constructed, false);
  assert.equal(receipt.transport_authorized, false);
  assert.equal(receipt.automatic_ash_action, false);
  assert.equal(receipt.claim_ceiling, undefined);
  assert.equal(await verifyAshDerivativeEligibility(receipt), true);
}
await assert.rejects(compileAshDerivativeEligibility({ ...baseline, operatorPurpose: '' }), /Operator purpose/);
const schema = JSON.parse(fs.readFileSync('app/dome-world/schemas/ash-derivative-eligibility-v01.schema.json', 'utf8'));
assert.equal(schema.additionalProperties, false);
console.log('ash-v09-derivative-eligibility.test.mjs passed');
