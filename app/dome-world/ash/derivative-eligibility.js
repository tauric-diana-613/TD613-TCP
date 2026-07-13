import { canonicalDigest } from './canonical-json.js';

export const ASH_DERIVATIVE_ELIGIBILITY_SCHEMA = 'td613.ash.derivative-eligibility-receipt/v0.1';
export const ASH_DERIVATIVE_ELIGIBILITY_DOMAIN = 'TD613:V31:ASH-DERIVATIVE-ELIGIBILITY:v1';

const clone = value => JSON.parse(JSON.stringify(value));
const freeze = value => { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; Object.values(value).forEach(freeze); return Object.freeze(value); };
const digestSubject = value => { const subject = clone(value); delete subject.eligibility_digest; return subject; };
const randomId = cryptoImpl => { const bytes = new Uint8Array(10); cryptoImpl.getRandomValues(bytes); return `ashelig_${Array.from(bytes, byte => byte.toString(16).padStart(2, '0')).join('')}`; };

function decide(input) {
  if (input.sourceCustodyVerified !== true) return ['INELIGIBLE_MISSING_SOURCE_CUSTODY', ['source_custody_unverified']];
  if (input.sourceDriftStatus !== 'SOURCE_INVARIANT') return ['INELIGIBLE_SOURCE_DRIFT', ['source_invariance_not_verified']];
  if (input.coverageStatus !== 'ADEQUATE') return ['INELIGIBLE_INSUFFICIENT_COVERAGE', ['coverage_inadequate']];
  if (input.tamperStatus !== 'VERIFIED') return ['INELIGIBLE_UNRESOLVED_TAMPER', ['tamper_posture_unresolved']];
  if (input.phasonSensitivity === 'HIGH') return ['REVIEW_REQUIRED_HIGH_PHASON_SENSITIVITY', ['high_phason_sensitivity_requires_human_review']];
  if (input.sharedLayerBurden === 'HIGH') return ['REVIEW_REQUIRED_HIGH_SHARED_LAYER_BURDEN', ['high_shared_layer_burden_requires_human_review']];
  return ['ELIGIBLE_FOR_OPERATOR_DERIVATIVE_REVIEW', ['minimum_review_conditions_satisfied']];
}

export async function compileAshDerivativeEligibility(input, options = {}) {
  if (!String(input.operatorPurpose || '').trim()) throw new Error('Operator purpose is required.');
  const [decision, reasons] = decide(input);
  const receipt = {
    schema: ASH_DERIVATIVE_ELIGIBILITY_SCHEMA,
    eligibility_id: input.eligibilityId || randomId(options.cryptoImpl || globalThis.crypto),
    created_at: input.createdAt || new Date().toISOString(),
    time_posture: 'local-clock-not-trusted-time',
    tomography_result_custody_reference: String(input.tomographyResultCustodyReference || ''),
    operator_purpose: String(input.operatorPurpose),
    inputs: {
      source_custody_verified: input.sourceCustodyVerified === true,
      source_drift_status: String(input.sourceDriftStatus || 'UNRESOLVED'),
      coverage_status: String(input.coverageStatus || 'UNRESOLVED'),
      tamper_status: String(input.tamperStatus || 'UNRESOLVED'),
      phason_sensitivity: String(input.phasonSensitivity || 'UNRESOLVED'),
      shared_layer_burden: String(input.sharedLayerBurden || 'UNRESOLVED')
    },
    decision,
    reasons,
    recommendation_only: true,
    derivative_constructed: false,
    export_authorized: false,
    cinder_constructed: false,
    transport_authorized: false,
    automatic_ash_action: false,
    scope_statement: 'Eligibility recommends whether a human may begin derivative review; it is not construction, permission, or transport authority.',
    cannot_establish: ['identity', 'authorship', 'ownership', 'permission', 'external truth', 'fitness for release'],
    promotion_conditions: ['operator review of selected observations', 'operator review of residuals and uncertainty', 'separate Phase VI-B gate'],
    operator_closure: { required: true, status: 'OPEN' },
    eligibility_digest: null
  };
  receipt.eligibility_digest = await canonicalDigest(ASH_DERIVATIVE_ELIGIBILITY_DOMAIN, digestSubject(receipt), options);
  return freeze(receipt);
}

export async function verifyAshDerivativeEligibility(receipt, options = {}) {
  if (!receipt || receipt.schema !== ASH_DERIVATIVE_ELIGIBILITY_SCHEMA) return false;
  return receipt.eligibility_digest === await canonicalDigest(ASH_DERIVATIVE_ELIGIBILITY_DOMAIN, digestSubject(receipt), options);
}
