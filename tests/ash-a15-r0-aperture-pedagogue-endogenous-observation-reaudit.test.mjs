import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ENDOGENOUS_OBSERVATION_REAUDIT_SCHEMA,
  operatorGeometry,
  evaluateEndogenousCandidate,
  evaluateCandidateFamily,
  naivePreQuestionSelector,
  postQuestionReauditSelector,
  runEndogenousObservationReauditGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-endogenous-observation-reaudit.js';

const rankOne = operatorGeometry([[1,0]]);
assert.equal(rankOne.rank, 1);
assert.equal(rankOne.nullity, 1);
assert.equal(rankOne.sigma_min, 0);
assert.ok(rankOne.condition_number >= 10);

const identity = operatorGeometry([[1,0],[0,1]]);
assert.equal(identity.rank, 2);
assert.equal(identity.nullity, 0);
assert.equal(identity.sigma_min, 1);
assert.equal(identity.sigma_max, 1);
assert.equal(identity.condition_number, 1);

const fragileGeometry = operatorGeometry([[1,0],[1,0.001]]);
assert.equal(fragileGeometry.rank, 2);
assert.ok(fragileGeometry.sigma_min > 0);
assert.ok(fragileGeometry.sigma_min < 0.001);
assert.ok(Math.abs(fragileGeometry.sigma_min - 0.0007071067) < 1e-9);
assert.ok(fragileGeometry.condition_number > 1999);
assert.ok(fragileGeometry.condition_number < 2001);

assert.throws(() => operatorGeometry([]), /at least one observation row/);
assert.throws(() => operatorGeometry([[1,2,3]]), /two-component row/);
assert.throws(() => operatorGeometry([[1,Number.NaN]]), /must be finite/);

const unknown = evaluateEndogenousCandidate({
  candidate_id:'Q_UNKNOWN_TEST',
  q_pre:[0,1],
  q_post:null,
  transition_status:'UNDECLARED'
});
assert.equal(unknown.status, 'POST_QUESTION_OPERATOR_MODEL_INCOMPLETE');
assert.equal(unknown.disposition, 'ABSTAIN_BEFORE_COUNTERFACTUAL_REAUDIT');
assert.equal(unknown.post_question, null);
assert.equal(unknown.ranking_eligible, false);

const family = evaluateCandidateFamily();
const byId = Object.fromEntries(family.map(item => [item.candidate_id,item]));

for (const id of ['Q_COLLAPSE','Q_FRAGILE','Q_STABLE']) {
  assert.equal(byId[id].pre_question.geometry.rank, 2, `${id} must appear rank-restoring before transition`);
  assert.equal(byId[id].pre_question.aperture.deficit_class, 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT');
  assert.equal(byId[id].pre_question.aperture.disposition, 'ASK_NOTHING');
}

assert.equal(byId.Q_COLLAPSE.post_question.geometry.rank, 1);
assert.equal(byId.Q_COLLAPSE.post_question.aperture.deficit_class, 'STRUCTURAL_RANK_DEFICIT');
assert.equal(byId.Q_COLLAPSE.post_question.aperture.disposition, 'PROPOSE');

assert.equal(byId.Q_FRAGILE.post_question.geometry.rank, 2);
assert.equal(byId.Q_FRAGILE.post_question.aperture.deficit_class, 'NUMERICAL_STABILITY_DEFICIT');
assert.equal(byId.Q_FRAGILE.post_question.aperture.disposition, 'PROPOSE');
assert.ok(byId.Q_FRAGILE.post_question.geometry.condition_number > 1000);

assert.equal(byId.Q_STABLE.post_question.geometry.rank, 2);
assert.equal(byId.Q_STABLE.post_question.geometry.condition_number, 1);
assert.equal(byId.Q_STABLE.post_question.aperture.deficit_class, 'NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT');
assert.equal(byId.Q_STABLE.post_question.aperture.disposition, 'ASK_NOTHING');
assert.equal(byId.Q_STABLE.healthy_after_declared_transition, true);

assert.equal(byId.Q_UNKNOWN.status, 'POST_QUESTION_OPERATOR_MODEL_INCOMPLETE');
assert.equal(byId.Q_UNKNOWN.ranking_eligible, false);

const naive = naivePreQuestionSelector(family);
assert.equal(naive.selected_candidate_id, 'Q_COLLAPSE');
assert.equal(naive.post_question_reaudit_consulted, false);

const reaudit = postQuestionReauditSelector(family);
assert.equal(reaudit.selected_candidate_id, 'Q_STABLE');
assert.equal(reaudit.post_question_reaudit_consulted, true);
assert.equal(reaudit.automatic_execution, false);

const receipt = runEndogenousObservationReauditGauntlet();
assert.equal(receipt.schema, ENDOGENOUS_OBSERVATION_REAUDIT_SCHEMA);
assert.equal(receipt.source_status, 'SIMULATED');
assert.equal(receipt.authority_class, 'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional, true);
assert.equal(receipt.current.aperture.deficit_class, 'STRUCTURAL_RANK_DEFICIT');
assert.equal(receipt.current.aperture.disposition, 'PROPOSE');
assert.equal(receipt.naive_pre_question_selector.selected_candidate_id, 'Q_COLLAPSE');
assert.equal(receipt.post_question_reaudit_selector.selected_candidate_id, 'Q_STABLE');
assert.equal(receipt.no_deficit_control.aperture.disposition, 'ASK_NOTHING');
assert.equal(receipt.no_deficit_control.candidate_library_present, true);
assert.equal(receipt.no_deficit_control.candidate_ranking_allowed, false);
assert.equal(receipt.gauntlet_status, 'ENDOGENOUS_OBSERVATION_REAUDIT_BOUNDARY_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE');
assert.match(receipt.bounded_refinement_candidate, /post-question observation\/operator state/);
assert.ok(receipt.anti_equivalences.includes('operator motion != information gain'));
assert.ok(receipt.anti_equivalences.includes('synthetic intervention dependence != quantum measurement disturbance'));
assert.match(receipt.next_learning_action, /MULTI_STEP_ADAPTIVE_QUESTION_SEQUENCE/);
assert.equal(receipt.claims.quantum_measurement_disturbance, false);
assert.equal(receipt.claims.physical_holonomy, false);
assert.equal(receipt.claims.proto_loom, false);
assert.equal(receipt.claims.production_authority, false);
assert.equal(receipt.claims.vercel_authority, false);
assert.equal(receipt.installed_aperture_mutated, false);
assert.equal(receipt.pedagogue_law_promoted, false);
assert.equal(receipt.automatic_observation, false);
assert.equal(receipt.automatic_experiment_execution, false);
assert.equal(receipt.promotion_authority, false);
assert.equal(receipt.production_mutation, false);
assert.equal(receipt.human_closure_required, true);

const spec = fs.readFileSync(
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_ENDOGENOUS_OBSERVATION_REAUDIT_GAUNTLET_SPEC_V0_1.md',
  'utf8'
);
assert.match(spec, /pre-question admissibility != post-question admissibility/);
assert.match(spec, /operator motion != information gain/);
assert.match(spec, /POST_QUESTION_OPERATOR_MODEL_INCOMPLETE/);
assert.match(spec, /ABSTAIN_BEFORE_COUNTERFACTUAL_REAUDIT/);
assert.match(spec, /quantum measurement disturbance/);
assert.match(spec, /TEST_MULTI_STEP_ADAPTIVE_QUESTION_SEQUENCE/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  current_deficit:receipt.current.aperture.deficit_class,
  naive_pre_question_pick:receipt.naive_pre_question_selector.selected_candidate_id,
  post_question_reaudit_pick:receipt.post_question_reaudit_selector.selected_candidate_id,
  collapse_post_deficit:byId.Q_COLLAPSE.post_question.aperture.deficit_class,
  fragile_post_deficit:byId.Q_FRAGILE.post_question.aperture.deficit_class,
  fragile_post_condition_number:byId.Q_FRAGILE.post_question.geometry.condition_number,
  stable_post_deficit:byId.Q_STABLE.post_question.aperture.deficit_class,
  unknown_transition:byId.Q_UNKNOWN.status,
  no_deficit_control:receipt.no_deficit_control.aperture.disposition,
  next_learning_action:receipt.next_learning_action,
  promotion_authority:receipt.promotion_authority
}, null, 2));
