import assert from 'node:assert/strict';
import { runMveX2Pilot } from '../scripts/mve-x2-independent-rfc3161-witness.mjs';
import {
  MVE_X2_CONTRACT,
  evaluateMveX2Design,
  adjudicateMveX2Pilot
} from '../app/dome-world/previews/a15-r0/mve-x2-independent-tsa-witness.js';

const design=evaluateMveX2Design();
assert.equal(design.status,'MVE_X2_INDEPENDENT_TSA_DESIGN_ADMISSIBLE');
assert.equal(design.actual_external_tsa_pilot_required,true);
assert.equal(design.exact_external_request_ceiling,2);
assert.equal(design.paid_specialized_service_required,false);
assert.equal(design.privileged_resource_required,false);
assert.equal(design.independent_external_receipt_acquired,false);
assert.equal(design.empirical_exogenous_channel_acquired,false);
assert.equal(design.independent_origin_sensor_acquired,false);
assert.equal(design.golden_egg_earned,false);

const pilot=await runMveX2Pilot({pairs:2,custodyPath:'artifacts/pedagogue-observation-custody/mve-x2-rfc3161-observation.json'});
assert.equal(pilot.status,'MVE_X2_INDEPENDENT_TSA_PILOT_OBSERVED');
assert.equal(pilot.pairs,2);
assert.equal(pilot.external_requests_issued,2);
assert.equal(pilot.artifact_pair_byte_identity,true);
assert.equal(pilot.actual_externally_signed_rfc3161_receipts_observed,true);
assert.equal(pilot.pinned_external_tsa_certificate_files_verified,true);
assert.equal(pilot.same_run_signed_receipt_custody_required,true);
assert.equal(pilot.signed_receipts_preserved_in_same_run_custody,true);
assert.equal(pilot.custody_record_written,true);
assert.equal(pilot.custody_record_contains_raw_artifact,false);
assert.equal(pilot.custody_record_contains_origin_labels,false);
assert.equal(pilot.external_witness_received_origin_labels,false);
assert.equal(pilot.external_witness_received_raw_artifact,false);
assert.equal(pilot.external_witness_received_message_imprint_only,true);
assert.equal(pilot.external_authority_under_experiment_orchestrator_control,false);
assert.equal(pilot.external_authority_distinct_trust_anchor_observed,true);
assert.equal(pilot.paid_subscription_used,false);
assert.equal(pilot.service_credentials_used,false);
assert.equal(pilot.public_transparency_log_written,false);
assert.equal(pilot.specialized_lab_hardware_used,false);
assert.equal(pilot.privileged_model_internal_state_used,false);
assert.equal(pilot.a_only_origin_accuracy,0.5);
assert.equal(pilot.a_plus_x_origin_accuracy,1);
assert.ok(Math.abs(pilot.bounded_conditional_origin_information_bits-1)<1e-12,'Balanced route-conditioned TSA receipt presence should be perfectly associated with the orchestrator-selected route.');
assert.equal(pilot.route_conditioned_attestation_association_observed,true);
assert.equal(pilot.independently_administered_external_attestation_observed,true);
assert.equal(pilot.independently_governed_external_witness_acquired,false);
assert.equal(pilot.independent_origin_sensor_acquired,false);
assert.equal(pilot.empirical_exogenous_channel_acquired,false);
assert.equal(pilot.bounded_empirical_exteriority_information_gain_measured,false);
assert.equal(pilot.external_origin_of_admitted_artifact_proven,false);
assert.equal(pilot.empirical_credit_to_golden_egg,0);
assert.equal(pilot.golden_egg_earned,false);

const earned=adjudicateMveX2Pilot(pilot);
assert.equal(earned.status,'MVE_X2_INDEPENDENT_RFC3161_ATTESTATION_CUSTODY_EARNED');
assert.equal(earned.rest_symbol,'𝄐');
assert.equal(earned.independently_administered_external_attestation_observed,true);
assert.equal(earned.independently_governed_external_witness_acquired,false);
assert.equal(earned.independent_origin_sensor_acquired,false);
assert.equal(earned.empirical_exogenous_channel_acquired,false);
assert.equal(earned.signed_external_witness_material_preserved_in_same_run_custody,true);
assert.equal(earned.bounded_empirical_exteriority_information_gain_measured,false);
assert.equal(earned.empirical_exteriority_scope,'NONE_ORIGIN_OBSERVATION_NOT_ACQUIRED');
assert.equal(earned.a_only_origin_accuracy,0.5);
assert.equal(earned.a_plus_x_origin_accuracy,1);
assert.ok(Math.abs(earned.bounded_conditional_origin_information_bits-1)<1e-12);
assert.equal(earned.conditional_information_interpretation,'ROUTE_CONDITIONED_ATTESTATION_ASSOCIATION_NOT_INDEPENDENT_ORIGIN_INFORMATION');
assert.equal(earned.paid_specialized_service_required,false);
assert.equal(earned.external_origin_of_admitted_artifact_proven,false);
assert.equal(earned.empirical_credit_to_golden_egg,0);
assert.equal(earned.golden_egg_earned,false);

for(const [label,mutate] of [
  ['raw artifact disclosure',copy=>{copy.external_witness_receives_raw_artifact=true;}],
  ['origin label disclosure',copy=>{copy.external_witness_receives_origin_label=true;}],
  ['unpinned cert',copy=>{copy.certificate_file_hashes_preregistered=false;}],
  ['paid subscription',copy=>{copy.paid_subscription_required=true;}],
  ['credentials',copy=>{copy.service_credentials_required=true;}],
  ['public log',copy=>{copy.public_transparency_log_required=true;}],
  ['orchestrator-owned authority',copy=>{copy.external_authority_under_experiment_orchestrator_control=true;}],
  ['exotic hardware',copy=>{copy.exotic_hardware_required=true;}]
]){
  const hostile=structuredClone(MVE_X2_CONTRACT);
  mutate(hostile);
  assert.equal(evaluateMveX2Design(hostile).status,'INADMISSIBLE',`${label} must fail MVE-X2 preregistration.`);
}

assert.equal(adjudicateMveX2Pilot({...pilot,actual_externally_signed_rfc3161_receipts_observed:false}).status,'INADMISSIBLE');
assert.equal(adjudicateMveX2Pilot({...pilot,pinned_external_tsa_certificate_files_verified:false}).status,'INADMISSIBLE');
assert.equal(adjudicateMveX2Pilot({...pilot,signed_receipts_preserved_in_same_run_custody:false}).status,'INADMISSIBLE');
assert.equal(adjudicateMveX2Pilot({...pilot,independently_administered_external_attestation_observed:false}).status,'INADMISSIBLE');
assert.equal(adjudicateMveX2Pilot({...pilot,empirical_exogenous_channel_acquired:true}).status,'INADMISSIBLE');
assert.equal(adjudicateMveX2Pilot({...pilot,bounded_empirical_exteriority_information_gain_measured:true}).status,'INADMISSIBLE');
assert.equal(adjudicateMveX2Pilot({...pilot,independent_origin_sensor_acquired:true}).status,'INADMISSIBLE');
assert.equal(adjudicateMveX2Pilot({...pilot,external_origin_of_admitted_artifact_proven:true}).status,'INADMISSIBLE');
assert.equal(adjudicateMveX2Pilot({...pilot,golden_egg_earned:true,empirical_credit_to_golden_egg:1}).status,'INADMISSIBLE');

console.log('MVE-X2 independently administered RFC3161 attestation-custody tests passed.');
