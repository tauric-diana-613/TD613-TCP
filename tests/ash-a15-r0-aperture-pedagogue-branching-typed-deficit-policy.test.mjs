import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  BRANCHING_TYPED_DEFICIT_POLICY_SCHEMA,
  Q_BRANCH_STRUCTURAL,
  Q_BRANCH_NUMERICAL,
  Q_RANK_REPAIR,
  Q_STABILITY_REPAIR,
  multiplyMatrixVector,
  selectQuestionFamilyFromTypedDeficit,
  replayTypedBranchingPolicy,
  replayFixedSecondQuestion,
  runBranchingTypedDeficitPolicyGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-branching-typed-deficit-policy.js';

const EPSILON = 0.001;
const r0 = [1,0];
assert.deepEqual(multiplyMatrixVector(Q_BRANCH_STRUCTURAL,r0), [2,0]);
assert.deepEqual(multiplyMatrixVector(Q_BRANCH_NUMERICAL,r0), [1,EPSILON]);
assert.deepEqual(multiplyMatrixVector(Q_RANK_REPAIR,[2,0]), [0,1]);
assert.deepEqual(multiplyMatrixVector(Q_RANK_REPAIR,[1,EPSILON]), [1,0]);
assert.deepEqual(multiplyMatrixVector(Q_STABILITY_REPAIR,[2,0]), [1,0]);
assert.deepEqual(multiplyMatrixVector(Q_STABILITY_REPAIR,[1,EPSILON]), [0,1]);
assert.throws(() => multiplyMatrixVector([[1,0]],r0), /2x2/);
assert.throws(() => multiplyMatrixVector(Q_BRANCH_STRUCTURAL,[1]), /two values/);

const structural = replayTypedBranchingPolicy('STRUCTURAL');
const numerical = replayTypedBranchingPolicy('NUMERICAL');
assert.equal(structural.audit.aperture.deficit_class,'STRUCTURAL_RANK_DEFICIT');
assert.equal(numerical.audit.aperture.deficit_class,'NUMERICAL_STABILITY_DEFICIT');
assert.equal(structural.selection.action,'Q_RANK_REPAIR');
assert.equal(numerical.selection.action,'Q_STABILITY_REPAIR');
assert.equal(structural.selection.branch_identity_consulted,false);
assert.equal(numerical.selection.terminal_outcomes_consulted,false);
assert.equal(structural.selection.consequence_losses_consulted,false);
assert.equal(structural.terminal_audit.aperture.disposition,'ASK_NOTHING');
assert.equal(numerical.terminal_audit.aperture.disposition,'ASK_NOTHING');
assert.equal(structural.consequence.recommended_action,'STOP');
assert.equal(numerical.consequence.recommended_action,'STOP');

const fixedRankStructural = replayFixedSecondQuestion('STRUCTURAL','Q_RANK_REPAIR');
const fixedRankNumerical = replayFixedSecondQuestion('NUMERICAL','Q_RANK_REPAIR');
assert.equal(fixedRankStructural.terminal_audit.aperture.disposition,'ASK_NOTHING');
assert.equal(fixedRankNumerical.terminal_audit.aperture.disposition,'PROPOSE');
assert.equal(fixedRankNumerical.consequence.recommended_action,'CONTINUE_ONE_DECLARED_QUESTION');
const fixedStabilityStructural = replayFixedSecondQuestion('STRUCTURAL','Q_STABILITY_REPAIR');
const fixedStabilityNumerical = replayFixedSecondQuestion('NUMERICAL','Q_STABILITY_REPAIR');
assert.equal(fixedStabilityStructural.terminal_audit.aperture.disposition,'PROPOSE');
assert.equal(fixedStabilityNumerical.terminal_audit.aperture.disposition,'ASK_NOTHING');
assert.ok([
  fixedRankStructural,
  fixedRankNumerical,
  fixedStabilityStructural,
  fixedStabilityNumerical
].every(route => route.question_count === 2));

const unknown = selectQuestionFamilyFromTypedDeficit('SOMETHING_NOT_PREREGISTERED');
assert.equal(unknown.action,'ABSTAIN_POLICY_STATE_UNDECLARED');
assert.equal(unknown.automatic_execution,false);
const healthy = selectQuestionFamilyFromTypedDeficit('NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT');
assert.equal(healthy.action,'ASK_NOTHING');

const receipt = runBranchingTypedDeficitPolicyGauntlet();
assert.equal(receipt.schema,BRANCHING_TYPED_DEFICIT_POLICY_SCHEMA);
assert.equal(receipt.source_status,'SIMULATED');
assert.equal(receipt.authority_class,'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional,true);
assert.equal(receipt.typed_policy.closure_count,2);
assert.equal(receipt.typed_policy.branch_count,2);
assert.equal(receipt.typed_policy.classification,'TYPED_DEFICIT_BRANCHING_POLICY_SEPARATES_AUTHORED_TWO_BRANCH_REPAIR_TASK');
assert.equal(receipt.fixed_controls.rank_repair.closure_count,1);
assert.equal(receipt.fixed_controls.stability_repair.closure_count,1);
assert.equal(receipt.matched_max_question_budget,2);
assert.equal(receipt.consequence_ledger_post_terminal_reaudit,true);
assert.equal(receipt.scalar_utility_crown,false);
assert.equal(receipt.controls.unknown_state.action,'ABSTAIN_POLICY_STATE_UNDECLARED');
assert.equal(receipt.controls.healthy_state.action,'ASK_NOTHING');
assert.equal(receipt.gauntlet_status,'BRANCHING_TYPED_DEFICIT_POLICY_BOUNDARY_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE');
assert.ok(receipt.anti_equivalences.includes('deficit class != sufficient policy state by assumption'));
assert.ok(receipt.anti_equivalences.includes('typed branch table != active learning'));
assert.match(receipt.next_learning_action,/TYPED_POLICY_STATE_ALIASING/);
assert.equal(receipt.claims.active_learning_policy,false);
assert.equal(receipt.claims.policy_state_sufficiency,false);
assert.equal(receipt.claims.holonomy,false);
assert.equal(receipt.claims.production_authority,false);
assert.equal(receipt.claims.vercel_authority,false);
assert.equal(receipt.installed_aperture_mutated,false);
assert.equal(receipt.pedagogue_law_promoted,false);
assert.equal(receipt.production_mutated,false);
assert.equal(receipt.promotion_authority,false);
assert.equal(receipt.human_closure_required,true);

const spec = fs.readFileSync(
  'app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_BRANCHING_TYPED_DEFICIT_POLICY_GAUNTLET_SPEC_V0_1.md',
  'utf8'
);
assert.match(spec,/policy replay fixture/);
assert.match(spec,/deficit class != sufficient policy state by assumption/);
assert.match(spec,/TEST_TYPED_POLICY_STATE_ALIASING/);
assert.match(spec,/ABSTAIN_POLICY_STATE_UNDECLARED/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  structural_first_deficit:receipt.branches.structural.audit.aperture.deficit_class,
  numerical_first_deficit:receipt.branches.numerical.audit.aperture.deficit_class,
  typed_policy_closures:receipt.typed_policy.closure_count,
  fixed_rank_closures:receipt.fixed_controls.rank_repair.closure_count,
  fixed_stability_closures:receipt.fixed_controls.stability_repair.closure_count,
  unknown_state:receipt.controls.unknown_state.action,
  next_learning_action:receipt.next_learning_action,
  promotion_authority:receipt.promotion_authority
},null,2));
