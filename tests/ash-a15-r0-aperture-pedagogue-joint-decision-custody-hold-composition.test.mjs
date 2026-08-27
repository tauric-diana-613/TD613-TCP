import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  JOINT_DECISION_CUSTODY_HOLD_COMPOSITION_SCHEMA,
  composeDecisionCustodyState,
  buildJointCompositionFixture,
  runJointDecisionCustodyHoldCompositionGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-joint-decision-custody-hold-composition.js';
import { buildProvenanceFixtures } from '../app/dome-world/previews/a15-r0/aperture-pedagogue-noisy-orientation-provenance-independence.js';

const P=buildProvenanceFixtures();

const actionableConflict=composeDecisionCustodyState({
  case_id:'ACTIONABLE_CONFLICT_HOSTILE',
  decision_input:{y_hat:0.001,bound:0.0002,actual_eta:0},
  custody_classification:P.P3
});
assert.equal(actionableConflict.decision.status,'DECISION_ACTIONABLE_PLUS');
assert.equal(actionableConflict.decision.selected_action,'Q_PLUS_REPAIR');
assert.equal(actionableConflict.custody.status,'CUSTODY_PROVENANCE_CONFLICT_HOLD');
assert.equal(actionableConflict.custody.resolved_route,null);
assert.equal(actionableConflict.composition.decision_authority_from_custody,false);
assert.equal(actionableConflict.composition.custody_authority_from_decision,false);
assert.equal(actionableConflict.composition.combined_confidence_scalar,null);

const abstainAgreement=composeDecisionCustodyState({
  case_id:'ABSTAIN_AGREEMENT_HOSTILE',
  decision_input:{y_hat:0,bound:0.0002},
  custody_classification:P.P2
});
assert.equal(abstainAgreement.decision.status,'DECISION_ABSTAIN_ORIENTATION_UNRESOLVED');
assert.equal(abstainAgreement.decision.selected_action,null);
assert.equal(abstainAgreement.custody.status,'CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT');
assert.equal(abstainAgreement.custody.resolved_route,'Q_A');

const ineligibleAgreement=composeDecisionCustodyState({
  case_id:'INELIGIBLE_AGREEMENT_HOSTILE',
  decision_input:{y_hat:-0.0001,bound:0.00005,actual_eta:-0.0009},
  custody_classification:P.P2
});
assert.equal(ineligibleAgreement.decision.status,'DECISION_EVIDENCE_INELIGIBLE_BOUND_FALSIFIED');
assert.equal(ineligibleAgreement.decision.support_eligible,false);
assert.equal(ineligibleAgreement.decision.selected_action,null);
assert.equal(ineligibleAgreement.custody.status,'CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT');

assert.throws(() => composeDecisionCustodyState({
  case_id:'BAD_CUSTODY',
  decision_input:{y_hat:0,bound:0.0002},
  custody_classification:{status:'UNDECLARED_CUSTODY'}
}), /undeclared custody posture/);
assert.throws(() => composeDecisionCustodyState({
  case_id:'',
  decision_input:{y_hat:0,bound:0.0002},
  custody_classification:P.P2
}), /case_id/);
assert.throws(() => composeDecisionCustodyState({
  case_id:'BAD_BOUND',
  decision_input:{y_hat:0,bound:-1},
  custody_classification:P.P2
}), /non-negative/);
assert.throws(() => composeDecisionCustodyState({
  case_id:'BAD_VALUE',
  decision_input:{y_hat:Number.NaN,bound:0.1},
  custody_classification:P.P2
}), /finite/);

const cases=buildJointCompositionFixture();
assert.equal(cases.length,8);
const byId=new Map(cases.map(item=>[item.case_id,item]));
assert.equal(byId.get('J1_ACTIONABLE_PLUS_MULTI_ROOT_AGREEMENT').decision.status,'DECISION_ACTIONABLE_PLUS');
assert.equal(byId.get('J1_ACTIONABLE_PLUS_MULTI_ROOT_AGREEMENT').custody.status,'CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT');
assert.equal(byId.get('J2_ABSTAIN_MULTI_ROOT_AGREEMENT').decision.status,'DECISION_ABSTAIN_ORIENTATION_UNRESOLVED');
assert.equal(byId.get('J2_ABSTAIN_MULTI_ROOT_AGREEMENT').custody.status,'CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT');
assert.equal(byId.get('J3_ACTIONABLE_PLUS_PROVENANCE_CONFLICT').decision.status,'DECISION_ACTIONABLE_PLUS');
assert.equal(byId.get('J3_ACTIONABLE_PLUS_PROVENANCE_CONFLICT').custody.status,'CUSTODY_PROVENANCE_CONFLICT_HOLD');
assert.equal(byId.get('J4_DUAL_HOLD').decision.status,'DECISION_ABSTAIN_ORIENTATION_UNRESOLVED');
assert.equal(byId.get('J4_DUAL_HOLD').custody.status,'CUSTODY_PROVENANCE_CONFLICT_HOLD');
assert.equal(byId.get('J5_ACTIONABLE_MINUS_SINGLE_ROOT_DUPLICATES').decision.status,'DECISION_ACTIONABLE_MINUS');
assert.equal(byId.get('J5_ACTIONABLE_MINUS_SINGLE_ROOT_DUPLICATES').custody.status,'CUSTODY_SINGLE_ROOT_SUPPORTED_NOT_CORROBORATED');
assert.equal(byId.get('J6_ACTIONABLE_MINUS_DUPLICATE_MAJORITY_CONFLICT').decision.status,'DECISION_ACTIONABLE_MINUS');
assert.equal(byId.get('J6_ACTIONABLE_MINUS_DUPLICATE_MAJORITY_CONFLICT').custody.status,'CUSTODY_PROVENANCE_CONFLICT_HOLD');
assert.equal(byId.get('J7_ABSTAIN_SOURCE_ROOT_INTERNAL_CONFLICT').decision.status,'DECISION_ABSTAIN_ORIENTATION_UNRESOLVED');
assert.equal(byId.get('J7_ABSTAIN_SOURCE_ROOT_INTERNAL_CONFLICT').custody.status,'CUSTODY_SOURCE_ROOT_INTERNAL_CONFLICT_HOLD');
assert.equal(byId.get('J8_FALSIFIED_BOUND_MULTI_ROOT_AGREEMENT').decision.status,'DECISION_EVIDENCE_INELIGIBLE_BOUND_FALSIFIED');
assert.equal(byId.get('J8_FALSIFIED_BOUND_MULTI_ROOT_AGREEMENT').custody.status,'CUSTODY_MULTI_ROOT_SYNTHETIC_AGREEMENT');
assert.ok(cases.every(item=>item.composition.combined_confidence_scalar===null));
assert.ok(cases.every(item=>item.composition.majority_vote_used===false));
assert.ok(cases.every(item=>item.composition.automatic_escalation===false));
assert.ok(cases.every(item=>item.composition.automatic_execution===false));
assert.ok(cases.every(item=>item.composition.human_closure_required===true));

const receipt=runJointDecisionCustodyHoldCompositionGauntlet();
assert.equal(receipt.schema,JOINT_DECISION_CUSTODY_HOLD_COMPOSITION_SCHEMA);
assert.equal(receipt.source_status,'SIMULATED');
assert.equal(receipt.authority_class,'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional,true);
assert.equal(receipt.authored_case_count,8);
assert.equal(receipt.invariants.decision_invariant_across_custody_change,true);
assert.equal(receipt.invariants.custody_invariant_across_decision_change,true);
assert.equal(receipt.invariants.all_cases_preserve_null_confidence_scalar,true);
assert.equal(receipt.invariants.all_cases_preserve_no_majority_vote,true);
assert.equal(receipt.invariants.all_cases_preserve_human_closure,true);
assert.equal(receipt.gauntlet_status,'JOINT_DECISION_AND_CUSTODY_TYPED_COMPOSITION_WITNESSED_IN_BOUNDED_SYNTHETIC_FIXTURE');
assert.match(receipt.bounded_refinement_candidate,/independently typed axes/);
assert.match(receipt.bounded_refinement_candidate,/without scalar collapse or cross-axis authority/);
assert.match(receipt.next_learning_action,/TEST_DECISION_STATE_TRANSITION_WITH_CUSTODY_MONOTONIC_REPLAY/);
assert.equal(receipt.claims.sufficient_statistic_theorem,false);
assert.equal(receipt.claims.markov_state_theorem,false);
assert.equal(receipt.claims.pomdp_theorem,false);
assert.equal(receipt.claims.active_learning,false);
assert.equal(receipt.claims.holonomy,false);
assert.equal(receipt.claims.production_authority,false);
assert.equal(receipt.claims.vercel_authority,false);
assert.equal(receipt.installed_aperture_mutated,false);
assert.equal(receipt.pedagogue_law_promoted,false);
assert.equal(receipt.production_mutated,false);
assert.equal(receipt.promotion_authority,false);
assert.equal(receipt.human_closure_required,true);

const spec=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_JOINT_DECISION_CUSTODY_HOLD_COMPOSITION_GAUNTLET_SPEC_V0_1.md','utf8');
assert.match(spec,/Preregistration boundary: \*\*frozen before executable implementation\.\*\*/);
assert.match(spec,/E_t = <D_t, C_t>/);
assert.match(spec,/decision state != custody state/);
assert.match(spec,/combined_confidence_scalar = null/);
assert.match(spec,/majority records != provenance resolution/);
assert.match(spec,/TEST_DECISION_STATE_TRANSITION_WITH_CUSTODY_MONOTONIC_REPLAY/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  authored_case_count:receipt.authored_case_count,
  joint_states:receipt.cases.map(item=>({case_id:item.case_id,joint_state_id:item.composition.joint_state_id})),
  invariants:receipt.invariants,
  next_learning_action:receipt.next_learning_action,
  promotion_authority:receipt.promotion_authority
},null,2));
