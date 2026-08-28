import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  TRANSITION_FAMILY_ROBUSTNESS_SCHEMA,
  validateTransitionCandidateDefinition,
  evaluateTransitionCandidate,
  nominalOnlyHostileSelector,
  robustTransitionFamilySelector,
  runTransitionFamilyDefinitionHostiles,
  buildTransitionFamilyRobustnessFixture,
  runTransitionFamilyRobustnessGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-transition-family-robustness.js';

const stable=value=>JSON.stringify(value);
const fixture=buildTransitionFamilyRobustnessFixture();
const sourceBefore=stable(fixture);

assert.equal(fixture.current_operator.length,1);
assert.deepEqual(fixture.current_operator[0],[1,0]);
assert.equal(fixture.candidates.length,5);
assert.equal(Object.isFrozen(fixture),true);
assert.equal(Object.isFrozen(fixture.candidates),true);

for (const candidate of fixture.candidates) {
  assert.equal(validateTransitionCandidateDefinition(candidate),true);
}
assert.equal(stable(fixture),sourceBefore);

const evaluations=fixture.candidates.map(evaluateTransitionCandidate);
assert.equal(stable(fixture),sourceBefore,'Candidate evaluation must not mutate the frozen source fixture.');
const byId=Object.fromEntries(evaluations.map(item=>[item.candidate_id,item]));

for (const item of evaluations) {
  assert.equal(item.pre_question.geometry.rank,2);
  assert.equal(item.pre_question.aperture.deficit_class,'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT');
  assert.equal(item.pre_question.aperture.disposition,'ASK_NOTHING');
  assert.equal(item.automatic_execution,false);
  assert.equal(item.promotion_authority,false);
}

assert.equal(byId.Q_DECLARED_STABLE.transition_knowledge,'DECLARED');
assert.equal(byId.Q_DECLARED_STABLE.family_outcome,'POINT_ADMISSIBLE');
assert.equal(byId.Q_DECLARED_STABLE.healthy_member_count,1);
assert.equal(byId.Q_DECLARED_STABLE.ranking_eligible,true);
assert.ok(byId.Q_DECLARED_STABLE.worst_condition_number > 1);

assert.equal(byId.Q_ROBUST_FAMILY.transition_knowledge,'SET_IDENTIFIED');
assert.equal(byId.Q_ROBUST_FAMILY.family_outcome,'ROBUSTLY_ADMISSIBLE');
assert.equal(byId.Q_ROBUST_FAMILY.family_size,3);
assert.equal(byId.Q_ROBUST_FAMILY.healthy_member_count,3);
assert.equal(byId.Q_ROBUST_FAMILY.unhealthy_member_count,0);
assert.equal(byId.Q_ROBUST_FAMILY.ranking_eligible,true);
assert.equal(byId.Q_ROBUST_FAMILY.family_members.every(member=>member.healthy),true);
assert.ok(byId.Q_DECLARED_STABLE.worst_condition_number < byId.Q_ROBUST_FAMILY.worst_condition_number);

assert.equal(byId.Q_MIXED_FAMILY.transition_knowledge,'SET_IDENTIFIED');
assert.equal(byId.Q_MIXED_FAMILY.family_outcome,'TRANSITION_FAMILY_DECISION_UNRESOLVED');
assert.equal(byId.Q_MIXED_FAMILY.family_size,3);
assert.equal(byId.Q_MIXED_FAMILY.healthy_member_count,1);
assert.equal(byId.Q_MIXED_FAMILY.unhealthy_member_count,2);
assert.equal(byId.Q_MIXED_FAMILY.ranking_eligible,false);
assert.equal(byId.Q_MIXED_FAMILY.nominal_post_question.healthy,true);
assert.equal(byId.Q_MIXED_FAMILY.nominal_post_question.geometry.condition_number,1);
assert.deepEqual(
  new Set(byId.Q_MIXED_FAMILY.family_members.map(member=>member.aperture.deficit_class)),
  new Set([
    'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT',
    'STRUCTURAL_RANK_DEFICIT',
    'NUMERICAL_STABILITY_DEFICIT'
  ])
);

assert.equal(byId.Q_BAD_FAMILY.transition_knowledge,'SET_IDENTIFIED');
assert.equal(byId.Q_BAD_FAMILY.family_outcome,'ROBUSTLY_INADMISSIBLE');
assert.equal(byId.Q_BAD_FAMILY.healthy_member_count,0);
assert.equal(byId.Q_BAD_FAMILY.unhealthy_member_count,3);
assert.equal(byId.Q_BAD_FAMILY.ranking_eligible,false);

assert.equal(byId.Q_UNMODELED.transition_knowledge,'UNMODELED');
assert.equal(byId.Q_UNMODELED.family_outcome,'TRANSITION_MODEL_UNDECLARED');
assert.equal(byId.Q_UNMODELED.disposition,'ABSTAIN_BEFORE_ROBUST_COUNTERFACTUAL_REAUDIT');
assert.equal(byId.Q_UNMODELED.nominal_post_question,null);
assert.deepEqual(byId.Q_UNMODELED.family_members,[]);
assert.equal(byId.Q_UNMODELED.ranking_eligible,false);

const nominalSelector=nominalOnlyHostileSelector(evaluations);
assert.equal(nominalSelector.selected_candidate_id,'Q_MIXED_FAMILY');
assert.equal(nominalSelector.transition_family_consulted,false);
assert.equal(nominalSelector.automatic_execution,false);

const robustSelector=robustTransitionFamilySelector(evaluations);
assert.equal(robustSelector.selected_candidate_id,'Q_DECLARED_STABLE');
assert.equal(robustSelector.transition_family_consulted,true);
assert.equal(robustSelector.majority_vote_used,false);
assert.equal(robustSelector.automatic_execution,false);
assert.equal(robustSelector.promotion_authority,false);

const hostiles=runTransitionFamilyDefinitionHostiles();
assert.deepEqual(hostiles,{
  dropped_adverse_member_rejected:true,
  duplicate_member_rejected:true,
  collapsed_family_rejected:true,
  majority_vote_rejected:true,
  set_to_declared_laundering_rejected:true,
  unmodeled_identity_laundering_rejected:true,
  undeclared_member_rejected:true
});

const mixed=structuredClone(fixture.candidates.find(candidate=>candidate.candidate_id === 'Q_MIXED_FAMILY'));
mixed.transition_family.splice(1,1);
assert.throws(()=>validateTransitionCandidateDefinition(mixed),/REJECT_FAMILY_MEMBERSHIP_MISMATCH/);

const duplicate=structuredClone(fixture.candidates.find(candidate=>candidate.candidate_id === 'Q_MIXED_FAMILY'));
duplicate.transition_family.push([0,1]);
assert.throws(()=>validateTransitionCandidateDefinition(duplicate),/REJECT_DUPLICATE_FAMILY_MEMBER/);

const majority=structuredClone(fixture.candidates.find(candidate=>candidate.candidate_id === 'Q_MIXED_FAMILY'));
majority.majority_vote_used=true;
assert.throws(()=>validateTransitionCandidateDefinition(majority),/REJECT_MAJORITY_VOTE/);

const laundered=structuredClone(fixture.candidates.find(candidate=>candidate.candidate_id === 'Q_MIXED_FAMILY'));
laundered.transition_knowledge='DECLARED';
laundered.transition_family=null;
laundered.family_representation=null;
assert.throws(()=>validateTransitionCandidateDefinition(laundered),/REJECT_TRANSITION_KNOWLEDGE_LAUNDERING/);

const identityLaundered=structuredClone(fixture.candidates.find(candidate=>candidate.candidate_id === 'Q_UNMODELED'));
identityLaundered.nominal_q_post=[0,1];
assert.throws(()=>validateTransitionCandidateDefinition(identityLaundered),/REJECT_UNMODELED_IDENTITY_LAUNDERING/);

const receipt=runTransitionFamilyRobustnessGauntlet();
assert.equal(receipt.schema,TRANSITION_FAMILY_ROBUSTNESS_SCHEMA);
assert.equal(receipt.source_status,'SIMULATED');
assert.equal(receipt.authority_class,'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional,true);
assert.equal(receipt.current.geometry.rank,1);
assert.equal(receipt.current.aperture.deficit_class,'STRUCTURAL_RANK_DEFICIT');
assert.equal(receipt.current.aperture.disposition,'PROPOSE');
assert.equal(receipt.nominal_only_hostile_selector.selected_candidate_id,'Q_MIXED_FAMILY');
assert.equal(receipt.robust_transition_family_selector.selected_candidate_id,'Q_DECLARED_STABLE');
assert.equal(receipt.all_hostiles_rejected,true);
assert.equal(receipt.source_inputs_preserved,true);
assert.match(receipt.gauntlet_status,/TRANSITION_FAMILY_ROBUSTNESS_BOUNDARY_VALIDATED/);
assert.match(receipt.bounded_refinement_candidate,/declared transition uncertainty/);
assert.equal(receipt.next_learning_action,'TEST_TRANSITION_OPERATOR_IDENTIFIABILITY_FROM_PARTIAL_INPUT_OUTPUT_PROBES_WITH_EXPLICIT_OPERATOR_COMPATIBLE_FAMILY_NULLSPACE_CONDITIONING_HELDOUT_PREDICTION_AND_OPEN_SET_OPERATOR_CONTROLS_BEFORE_ANY_OPERATOR_TOMOGRAPHY_PATH_TRANSPORT_OR_HOLONOMY_PROMOTION');
assert.equal(receipt.claims.system_identification,false);
assert.equal(receipt.claims.operator_identification,false);
assert.equal(receipt.claims.operator_tomography,false);
assert.equal(receipt.claims.path_category_theorem,false);
assert.equal(receipt.claims.path_dependent_transport_theorem,false);
assert.equal(receipt.claims.loop_endomorphism,false);
assert.equal(receipt.claims.holonomy,false);
assert.equal(receipt.claims.curvature,false);
assert.equal(receipt.claims.proto_loom,false);
assert.equal(receipt.claims.production_authority,false);
assert.equal(receipt.claims.vercel_authority,false);
assert.equal(receipt.installed_aperture_mutated,false);
assert.equal(receipt.pedagogue_law_promoted,false);
assert.equal(receipt.automatic_observation,false);
assert.equal(receipt.automatic_experiment_execution,false);
assert.equal(receipt.sequence_authority,false);
assert.equal(receipt.promotion_authority,false);
assert.equal(receipt.production_mutation,false);
assert.equal(receipt.human_closure_required,true);
assert.equal(Object.isFrozen(receipt),true);

const spec=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_TRANSITION_FAMILY_ROBUSTNESS_GAUNTLET_SPEC_V0_1.md','utf8');
assert.match(spec,/transition uncertainty != transition ignorance/);
assert.match(spec,/TRANSITION_FAMILY_DECISION_UNRESOLVED/);
assert.match(spec,/No unknown transition operator is inferred in this chamber/);
assert.match(spec,/system identification/);
assert.match(spec,/operator tomography/);
assert.match(spec,/holonomy/);
assert.match(spec,/A16 remains held/);

const correction=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_TRANSITION_FAMILY_ROBUSTNESS_PREREGISTRATION_CORRECTION_001.md','utf8');
assert.match(correction,/Executable implementation existed when correction authored:\*\* NO/);
assert.match(correction,/q_post = \[0\.1,1\]/);
assert.match(correction,/post-result retuning/);

const docket=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/WESTERN_HORIZON_EPISTEMIC_TRANSPORT_RESEARCH_DOCKET_V0_1.md','utf8');
assert.match(docket,/path category before groupoid/i);
assert.match(docket,/ledger records the path/);
assert.match(docket,/transition uncertainty != transition ignorance/);
assert.match(docket,/operator rank sufficiency != stable operator identifiability/);
assert.match(docket,/content unreconstructible/);
assert.match(docket,/creative liberty != self-authored standing authority/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  current_deficit:receipt.current.aperture.deficit_class,
  nominal_hostile_selection:receipt.nominal_only_hostile_selector.selected_candidate_id,
  robust_selection:receipt.robust_transition_family_selector.selected_candidate_id,
  family_outcomes:Object.fromEntries(receipt.candidates.map(item=>[item.candidate_id,item.family_outcome])),
  all_hostiles_rejected:receipt.all_hostiles_rejected,
  next_learning_action:receipt.next_learning_action,
  promotion_authority:receipt.promotion_authority,
  production_mutation:receipt.production_mutation
},null,2));
