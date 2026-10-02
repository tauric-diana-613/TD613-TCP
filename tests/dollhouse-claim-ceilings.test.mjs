import assert from 'node:assert/strict';
import fs from 'node:fs';

import {
  CLAIM_CEILING_OBSERVATORY_SCHEMA,
  CLAIM_CEILING_REGISTRY,
  CLAIM_CEILING_STATES,
  auditClaimCeilingRegistry,
  claimCeilingSummary
} from '../app/engine/dollhouse-claim-ceilings.js';

import {
  WESTERN_METHOD_DONORS,
  auditWesternMethodLab,
  registerRouteObservation,
  registerCarrierObservation,
  validateReceiverSwapDesign,
  registerInformationGainClaim
} from '../app/engine/western-method-lab.js';

assert.equal(CLAIM_CEILING_OBSERVATORY_SCHEMA, 'td613.dollhouse.claim-ceiling-observatory/v0.1');
assert.equal(CLAIM_CEILING_REGISTRY.length, 8);
assert.equal(new Set(CLAIM_CEILING_REGISTRY.map(item => item.id)).size, CLAIM_CEILING_REGISTRY.length);

const byId = new Map(CLAIM_CEILING_REGISTRY.map(item => [item.id, item]));

assert.equal(byId.get('physical-device-behavior').state, CLAIM_CEILING_STATES.EARNED_BOUNDED);
assert.match(byId.get('physical-device-behavior').earned_coordinate, /Physical-iPhone production behavior has been observed/i);
assert.match(byId.get('physical-device-behavior').current_ceiling, /exact-current-build/i);

assert.equal(byId.get('authenticated-foreign-ancestry').state, CLAIM_CEILING_STATES.SPLIT);
assert.match(byId.get('authenticated-foreign-ancestry').earned_coordinate, /TD613-controlled cross-instance stage ancestry/i);
assert.match(byId.get('authenticated-foreign-ancestry').current_ceiling, /not the foreign provider as origin/i);

assert.equal(byId.get('provider-internal-enforcement').state, CLAIM_CEILING_STATES.SPLIT);
assert.match(byId.get('provider-internal-enforcement').current_ceiling, /Provider-internal enforcement remains unobserved/i);

assert.equal(byId.get('universal-provider-behavior').state, CLAIM_CEILING_STATES.SPLIT);
assert.match(byId.get('universal-provider-behavior').current_ceiling, /Finite provider\/model observations do not establish universal behavior/i);

assert.equal(byId.get('human-comprehension').state, CLAIM_CEILING_STATES.SPLIT);
assert.match(byId.get('human-comprehension').current_ceiling, /do not by themselves measure comprehension/i);

for (const id of ['hidden-retention-training-memory', 'golden-egg-realization']) {
  assert.equal(byId.get(id).state, CLAIM_CEILING_STATES.HELD, `${id} must remain HELD`);
}
assert.equal(byId.get('empirical-exteriority').state, CLAIM_CEILING_STATES.SPLIT);
assert.match(byId.get('empirical-exteriority').earned_coordinate, /PR #1003/i);
assert.match(byId.get('empirical-exteriority').earned_coordinate, /33629043531/);
assert.match(byId.get('empirical-exteriority').current_ceiling, /research field is reopened/i);
assert.match(byId.get('empirical-exteriority').current_ceiling, /empirical exteriority itself remains unearned/i);
assert.match(byId.get('golden-egg-realization').current_ceiling, /No immutable same-episode record currently establishes/i);

const summary = claimCeilingSummary();
assert.deepEqual(summary.earned_bounded, ['physical-device-behavior']);
assert.deepEqual(summary.held, [
  'hidden-retention-training-memory',
  'golden-egg-realization'
]);
assert.equal(summary.split.length, 5);

const audit = auditClaimCeilingRegistry();
assert.equal(audit.role_agreement_is_evidence_multiplication, false);
assert.equal(audit.release_authority, false);
assert.equal(audit.entries.length, CLAIM_CEILING_REGISTRY.length);
for (const entry of audit.entries) {
  assert.deepEqual(entry.findings.map(finding => finding.role), ['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT']);
  assert.equal(new Set(entry.findings.map(finding => finding.role)).size, 4);
}

assert.equal(WESTERN_METHOD_DONORS.length, 5);
assert.equal(WESTERN_METHOD_DONORS.every(item => typeof item.lineage === 'string' && item.lineage.length > 0), true);

const route = registerRouteObservation({
  metric: 'bounded_observation_metric',
  baseline: 0.98,
  observations: [
    { route_id: 'route-a', value: 0.72 },
    { route_id: 'route-b', value: 0.91 }
  ]
});
assert.equal(route.status, 'ADMITTED');
assert.equal(route.route_sensitivity_observed_in_supplied_measurements, true);
assert.equal(route.causal_route_effect_established, false);
assert.equal(route.origin_truth_established, false);

const carriers = registerCarrierObservation({
  carriers: [
    { carrier_id: 'planning', layer: 'process-planning', observed: true },
    { carrier_id: 'content', layer: 'execution-output', observed: true }
  ]
});
assert.equal(carriers.status, 'ADMITTED');
assert.equal(carriers.heterostratigraphic, true);
assert.equal(carriers.scalar_proxy_allowed, false);
assert.equal(carriers.carrier_independence_established, false);

const sharedReceiver = {
  artifact_digest: 'sha256:a',
  route_digest: 'sha256:r',
  carrier_id: 'carrier',
  provenance_state_digest: 'sha256:p',
  source_custody_digest: 'sha256:c',
  observation_window_id: 'window-1'
};

const receiver = validateReceiverSwapDesign({
  left: { ...sharedReceiver, receiver_apparatus_id: 'rho-0' },
  right: { ...sharedReceiver, receiver_apparatus_id: 'rho-1' }
});
assert.equal(receiver.status, 'ADMISSIBLE_DESIGN');
assert.equal(receiver.sole_allowed_difference, 'RECEIVER_APPARATUS');
assert.equal(receiver.receiver_effect_observed, false);

const receiverDrift = validateReceiverSwapDesign({
  left: { ...sharedReceiver, receiver_apparatus_id: 'rho-0' },
  right: { ...sharedReceiver, route_digest: 'sha256:changed', receiver_apparatus_id: 'rho-1' }
});
assert.equal(receiverDrift.status, 'INADMISSIBLE');
assert.ok(receiverDrift.errors.includes('ROUTE_DIGEST_MUST_REMAIN_FIXED'));

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

const derivedWitness = registerInformationGainClaim({
  admitted_record_information_bits: 0,
  candidate_witness_information_bits: 0.4,
  derived_from_admitted_record: true,
  independently_governed: true,
  shares_upstream_source: false,
  bound_to_exact_target_episode: true,
  externally_measured: true
});
assert.equal(derivedWitness.status, 'INADMISSIBLE');
assert.ok(derivedWitness.errors.includes('NON_DERIVATIVE_WITNESS_REQUIRED'));

const westernAudit = auditWesternMethodLab();
assert.equal(westernAudit.clean_room_method_accession, true);
assert.equal(westernAudit.third_party_source_code_imported, false);
assert.equal(westernAudit.private_material_imported, false);
assert.equal(westernAudit.role_agreement_is_evidence_multiplication, false);
assert.equal(westernAudit.empirical_exteriority_earned_by_installation, false);
assert.equal(westernAudit.golden_egg_earned_by_installation, false);
assert.deepEqual(westernAudit.roles.map(item => item.role), ['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT']);

const page = fs.readFileSync('app/dome-world/claim-ceilings.html', 'utf8');
for (const needle of [
  'Claim Ceiling Observatory',
  'Raise the ceiling.',
  'TD613 CUSTODY ANCESTRY ≠ FOREIGN ORIGIN',
  'HISTORICAL DEVICE WITNESS ≠ CURRENT-BUILD DEVICE CLOSURE',
  'DOLLHOUSE ROLE AGREEMENT ≠ EVIDENCE MULTIPLICATION',
  '/engine/dollhouse-claim-ceilings.js'
]) {
  assert.ok(page.includes(needle), `claim ceiling page missing ${needle}`);
}

const westernPage = fs.readFileSync('app/dome-world/western-method-lab.html', 'utf8');
for (const needle of [
  'Western Horizon Method Lab',
  'Take the method.',
  'METHOD ACCESSION ≠ SOURCE-CODE IMPORT',
  'POSITIVE INFORMATION GAIN ≠ EXTERIORITY',
  '/engine/western-method-lab.js'
]) {
  assert.ok(westernPage.includes(needle), `Western method page missing ${needle}`);
}

console.log('Dollhouse claim ceiling and Western method-lab contracts passed');
