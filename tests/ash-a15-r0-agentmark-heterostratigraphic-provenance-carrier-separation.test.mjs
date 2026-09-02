import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  AGENTMARK_EXTERNAL_WITNESS as W,
  AGENTMARK_HETEROSTRATIGRAPHIC_PARENT,
  AGENTMARK_HETEROSTRATIGRAPHIC_PROVENANCE_CERTIFICATE as C,
  evaluateAgentMarkHeterostratigraphicProvenance
} from '../app/dome-world/previews/a15-r0/agentmark-heterostratigraphic-provenance-carrier-separation.js';
import { ENTROBENCH_EXOGENOUS_WITNESS_ADMISSION_CERTIFICATE as E } from '../app/dome-world/previews/a15-r0/entrobench-exogenous-witness-admission.js';

assert.equal(AGENTMARK_HETEROSTRATIGRAPHIC_PARENT,'b7b72dc96b3225a94a92af69e78b08a664f9c65e');
assert.equal(E.status,'REOPENED_EXOGENOUS_WITNESS_ADMITTED');
assert.equal(E.exogenous_witness_acquired,true);
assert.equal(E.golden_egg_earned,false);

assert.equal(W.anthology_id,'2026.acl-long.573');
assert.equal(W.doi,'10.18653/v1/2026.acl-long.573');
assert.equal(W.code_repository,'Tooooa/AgentMark');
assert.equal(W.code_head,'070daa1cb57aa3c053d89ff5b3a788f6585824ea');
assert.equal(W.code_tree,'aa78b3daa59feea7c31140877ec7e877f9cc159b');
assert.equal(W.absent_from_frozen_td613_parent_search,true);
assert.deepEqual(W.carriers.map(x=>x.name),['planning_behavior','action_content']);
assert.equal(W.dual_channel.behavior_decoding_percent,100.0);
assert.equal(W.dual_channel.synthid_content_detection_percent,96.6);
assert.equal(W.semantic_rewrite.behavior_match_percent,49.45);
assert.equal(W.semantic_rewrite.avg_kl,3.227);
assert.equal(W.semantic_rewrite.bit_recovery_percent,16.84);
assert.equal(W.utility_capacity.toolbench.baseline_success_percent,59.9);
assert.equal(W.utility_capacity.toolbench.agentmark_success_percent,59.7);
assert.equal(W.utility_capacity.toolbench.bits_per_step,0.49);
assert.equal(W.utility_capacity.toolbench.bits_per_task,4.93);

assert.equal(C.status,'HETEROSTRATIGRAPHIC_PROVENANCE_CARRIER_SEPARATION_EARNED');
assert.deepEqual(C.errors,[]);
assert.equal(C.rest_symbol,'𝄐');
assert.equal(C.planning_behavior_carrier_admitted,true);
assert.equal(C.action_content_carrier_admitted,true);
assert.equal(C.same_study_dual_channel_composability_observed,true);
assert.equal(C.provenance_observability_heterostratigraphic,true);
assert.equal(C.provenance_observability_route_sensitive,true);
assert.equal(C.output_content_observability_scalar_proxy_for_process_provenance,false);
assert.equal(C.process_provenance_universally_invariant,false);
assert.equal(C.cross_study_entrobench_agentmark_same_episode,false);
assert.equal(C.cross_study_comparison_credit,'CONTEXTUAL_COMPARATIVE_ONLY');
assert.deepEqual(C.exact_golden_egg_surfaces_added,[]);
assert.equal(C.empirical_credit_to_golden_egg,0);
assert.equal(C.golden_egg_earned,false);
assert.equal(C.sequence_authority,false);
assert.equal(C.numbered_stage_authority,false);
assert.equal(C.live_loom_mutated,false);
assert.match(C.candidate_theorem,/HETEROSTRATIGRAPHIC_PROVENANCE_CARRIER_SEPARATION/);

const internalTheater=structuredClone(W);
internalTheater.evidence_class='INTERNAL_SELF_ATTESTED_EXTERNAL_LABEL';
assert.equal(evaluateAgentMarkHeterostratigraphicProvenance(internalTheater).status,'INADMISSIBLE');

const parentPresent=structuredClone(W);
parentPresent.absent_from_frozen_td613_parent_search=false;
assert.equal(evaluateAgentMarkHeterostratigraphicProvenance(parentPresent).status,'INADMISSIBLE');

const carrierCollapse=structuredClone(W);
carrierCollapse.carriers[1].name='planning_behavior';
assert.equal(evaluateAgentMarkHeterostratigraphicProvenance(carrierCollapse).status,'INADMISSIBLE');

const dualChannelDrift=structuredClone(W);
dualChannelDrift.dual_channel.behavior_decoding_percent=99.9;
assert.equal(evaluateAgentMarkHeterostratigraphicProvenance(dualChannelDrift).status,'INADMISSIBLE');

const routeTheater=structuredClone(W);
routeTheater.semantic_rewrite.bit_recovery_percent=100;
assert.equal(evaluateAgentMarkHeterostratigraphicProvenance(routeTheater).status,'INADMISSIBLE');

const receipt=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/AGENTMARK_HETEROSTRATIGRAPHIC_PROVENANCE_CARRIER_SEPARATION_RECEIPT_V0_1.md','utf8');
assert.match(receipt,/PROVENANCE HAS MORE THAN ONE CARRIER STRATUM/);
assert.match(receipt,/CROSS_STUDY_COMPARISON != SAME_EPISODE_COOBSERVATION/);
assert.match(receipt,/HETEROSTRATIGRAPHIC_PROVENANCE_CARRIER_SEPARATION != GOLDEN_EGG_EARNED/);

console.log('A15-R0 AgentMark heterostratigraphic provenance carrier separation tests passed.');
