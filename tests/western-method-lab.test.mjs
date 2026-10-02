import assert from 'node:assert/strict';

import {
  WESTERN_METHOD_DONORS,
  auditWesternMethodLab,
  registerRouteObservation,
  registerCarrierObservation,
  validateReceiverSwapDesign,
  registerInformationGainClaim
} from '../app/engine/western-method-lab.js';

assert.equal(WESTERN_METHOD_DONORS.length, 5);
assert.equal(WESTERN_METHOD_DONORS.every(item => item.accession), true);

const route = registerRouteObservation({
  metric: 'bounded_detection_metric',
  baseline: 0.98,
  observations: [
    { route_id: 'summarize', value: 0.266 },
    { route_id: 'bullet-points', value: 0.72 }
  ]
});
assert.equal(route.status, 'ADMITTED');
assert.equal(route.route_sensitivity_observed_in_supplied_measurements, true);
assert.equal(route.causal_route_effect_established, false);
assert.equal(route.origin_truth_established, false);

const carrier = registerCarrierObservation({
  carriers: [
    { carrier_id: 'planning', layer: 'process-planning', observed: true },
    { carrier_id: 'content', layer: 'execution-output', observed: true }
  ]
});
assert.equal(carrier.status, 'ADMITTED');
assert.equal(carrier.heterostratigraphic, true);
assert.equal(carrier.scalar_proxy_allowed, false);
assert.equal(carrier.carrier_independence_established, false);

const shared = {
  artifact_digest: 'sha256:a',
  route_digest: 'sha256:r',
  carrier_id: 'carrier',
  provenance_state_digest: 'sha256:p',
  source_custody_digest: 'sha256:c',
  observation_window_id: 'window-1'
};

const receiver = validateReceiverSwapDesign({
  left: { ...shared, receiver_apparatus_id: 'rho-0' },
  right: { ...shared, receiver_apparatus_id: 'rho-1' }
});
assert.equal(receiver.status, 'ADMISSIBLE_DESIGN');
assert.equal(receiver.sole_allowed_difference, 'RECEIVER_APPARATUS');
assert.equal(receiver.receiver_effect_observed, false);

const badReceiver = validateReceiverSwapDesign({
  left: { ...shared, receiver_apparatus_id: 'rho-0' },
  right: { ...shared, route_digest: 'sha256:changed', receiver_apparatus_id: 'rho-1' }
});
assert.equal(badReceiver.status, 'INADMISSIBLE');
assert.ok(badReceiver.errors.includes('ROUTE_DIGEST_MUST_REMAIN_FIXED'));

const methodReady = registerInformationGainClaim({
  admitted_record_information_bits: 0,
  candidate_witness_information_bits: 0.4,
  derived_from_admitted_record: false,
  independently_governed: true,
  shares_upstream_source: false,
  bound_to_exact_target_episode: false,
  externally_measured: false
});
assert.equal(methodReady.status, 'METHOD_READY');
assert.equal(methodReady.empirical_target_exteriority_established, false);
assert.equal(methodReady.golden_egg_credit, 0);

const targetCandidate = registerInformationGainClaim({
  admitted_record_information_bits: 0,
  candidate_witness_information_bits: 0.4,
  derived_from_admitted_record: false,
  independently_governed: true,
  shares_upstream_source: false,
  bound_to_exact_target_episode: true,
  externally_measured: true
});
assert.equal(targetCandidate.status, 'TARGET_EPISODE_CANDIDATE');
assert.equal(targetCandidate.empirical_target_exteriority_established, false);

const derived = registerInformationGainClaim({
  admitted_record_information_bits: 0,
  candidate_witness_information_bits: 0.4,
  derived_from_admitted_record: true,
  independently_governed: true,
  shares_upstream_source: false,
  bound_to_exact_target_episode: true,
  externally_measured: true
});
assert.equal(derived.status, 'INADMISSIBLE');
assert.ok(derived.errors.includes('NON_DERIVATIVE_WITNESS_REQUIRED'));

const audit = auditWesternMethodLab();
assert.equal(audit.clean_room_method_accession, true);
assert.equal(audit.third_party_source_code_imported, false);
assert.equal(audit.private_material_imported, false);
assert.equal(audit.role_agreement_is_evidence_multiplication, false);
assert.equal(audit.empirical_exteriority_earned_by_installation, false);
assert.equal(audit.golden_egg_earned_by_installation, false);
assert.deepEqual(audit.roles.map(item => item.role), ['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT']);

console.log('Western Horizon method-lab contracts passed.');
