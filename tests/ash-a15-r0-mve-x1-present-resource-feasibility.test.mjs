import assert from 'node:assert/strict';
import { runMveX1Pilot } from '../scripts/mve-x1-bounded-origin-pilot.mjs';
import {
  MVE_X1_CONTRACT,
  evaluateMveX1Design,
  adjudicateMveX1Pilot
} from '../app/dome-world/previews/a15-r0/mve-x1-present-resource-feasibility.js';

const design=evaluateMveX1Design();
assert.equal(design.status,'MVE_X1_PRESENT_RESOURCE_DESIGN_ADMISSIBLE');
assert.equal(design.standard_resources_only,true);
assert.equal(design.unavailable_science_required,false);
assert.equal(design.unavailable_lab_instrument_required,false);
assert.equal(design.empirical_exogenous_channel_acquired,false);
assert.equal(design.golden_egg_earned,false);

const pilot=await runMveX1Pilot({pairs:10});
assert.equal(pilot.status,'MVE_X1_BOUNDED_PROCESS_PILOT_OBSERVED');
assert.equal(pilot.actual_os_process_boundary_observed,true);
assert.equal(pilot.actual_tcp_socket_events_observed,true);
assert.equal(pilot.artifact_pair_byte_identity,true);
assert.equal(pilot.a_only_origin_accuracy,0.5);
assert.equal(pilot.a_plus_x_origin_accuracy,1);
assert.ok(Math.abs(pilot.bounded_conditional_origin_information_bits-1)<1e-12,'Balanced perfect socket-event separation should carry one bounded origin bit.');
assert.equal(pilot.observer_received_origin_labels,false);
assert.equal(pilot.observer_feature_uses_payload,false);
assert.equal(pilot.observer_governance_independent_from_experiment_orchestrator,false);
assert.equal(pilot.independently_governed_external_witness_acquired,false);
assert.equal(pilot.empirical_exogenous_channel_acquired,false);
assert.equal(pilot.golden_egg_earned,false);

const earned=adjudicateMveX1Pilot(pilot);
assert.equal(earned.status,'MVE_X1_PRESENT_RESOURCE_FEASIBILITY_EARNED');
assert.equal(earned.rest_symbol,'𝄐');
assert.equal(earned.present_resource_experiment_executed,true);
assert.equal(earned.bounded_process_separated_origin_observability_observed,true);
assert.equal(earned.present_resource_impossibility_refuted_for_this_bounded_architecture,true);
assert.equal(earned.universal_externality_claim,false);
assert.equal(earned.independently_governed_external_witness_acquired,false);
assert.equal(earned.empirical_exogenous_channel_acquired,false);
assert.equal(earned.empirical_exteriority_information_gain_measured,false);
assert.equal(earned.empirical_credit_to_golden_egg,0);
assert.equal(earned.golden_egg_earned,false);

for(const [label,mutate] of [
  ['exotic hardware',copy=>{copy.exotic_hardware_required=true;}],
  ['privileged internals',copy=>{copy.privileged_model_internal_state_required=true;}],
  ['future resource',copy=>{copy.unavailable_or_speculative_resources_required=true;}],
  ['fake exogenous promotion',copy=>{copy.empirical_exogenous_channel_acquired=true;}],
  ['fake independent witness',copy=>{copy.independently_governed_external_witness_acquired=true;}]
]){
  const hostile=structuredClone(MVE_X1_CONTRACT);
  mutate(hostile);
  assert.equal(evaluateMveX1Design(hostile).status,'INADMISSIBLE',`${label} must fail present-resource feasibility.`);
}

const fakePilot={...pilot,observer_received_origin_labels:true};
assert.equal(adjudicateMveX1Pilot(fakePilot).status,'INADMISSIBLE');
const payloadObserver={...pilot,observer_feature_uses_payload:true};
assert.equal(adjudicateMveX1Pilot(payloadObserver).status,'INADMISSIBLE');
const noGain={...pilot,a_plus_x_origin_accuracy:0.5,bounded_conditional_origin_information_bits:0};
assert.equal(adjudicateMveX1Pilot(noGain).status,'INADMISSIBLE');

console.log('MVE-X1 present-resource feasibility and bounded process-origin observability tests passed.');
