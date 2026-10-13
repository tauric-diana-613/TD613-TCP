import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  APERTURE_PEDAGOGUE_CONSEQUENCE_CONDITIONED_SELECTION_SCHEMA,
  selectByDeclaredConsequence,
  runAperturePedagogueConsequenceConditionedSelectionGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-consequence-conditioned-selection.js';
import { APERTURE_V32_REPLAY_STABILITY } from '../app/engine/aperture-v32-typed-epistemic-deficit.js';

const receipt=runAperturePedagogueConsequenceConditionedSelectionGauntlet();
assert.equal(receipt.schema,APERTURE_PEDAGOGUE_CONSEQUENCE_CONDITIONED_SELECTION_SCHEMA);
assert.equal(receipt.source_status,'SIMULATED');
assert.equal(receipt.authority_class,'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional,true);

assert.equal(receipt.criterion_conditioned_results.L_Y.selected_probe_id,'P_ORTH');
assert.equal(receipt.criterion_conditioned_results.L_DIFF.selected_probe_id,'P_ORTH');
assert.equal(receipt.criterion_conditioned_results.L_SUM.selected_probe_id,'P_DIAG');
assert.equal(receipt.criterion_conditioned_results.L_EQUAL.selected_probe_id,'P_ORTH');
assert.equal(receipt.criterion_conditioned_results.L_SUM_HEAVY.selected_probe_id,'P_DIAG');

assert.equal(receipt.refusal_controls.undeclared.status,'NO_SELECTION_UNDECLARED_DECISION_LOSS');
assert.equal(receipt.refusal_controls.undeclared.selected_probe_id,null);
assert.equal(receipt.refusal_controls.conflict.status,'NO_SELECTION_CONFLICTING_LOSSES_WITHOUT_AGGREGATION_RULE');
assert.equal(receipt.refusal_controls.conflict.selected_probe_id,null);
assert.equal(receipt.refusal_controls.posthoc.status,'POSTHOC_DECISION_LOSS_MUTATION_NOT_CONFIRMATORY');
assert.equal(receipt.refusal_controls.posthoc.selected_probe_id,null);

assert.equal(receipt.bounded_dominance_control.declared_subset.selected_probe_id,'P_DIAG');
assert.equal(receipt.bounded_dominance_control.excluded_functional_counterexample.selected_probe_id,'P_ORTH');
assert.match(receipt.bounded_dominance_control.classification,/DOES_NOT_TRANSFER/);

const conflictDirect=selectByDeclaredConsequence({unaggregated_functionals:['H_Y','H_SUM']});
assert.equal(conflictDirect.selected_probe_id,null);
assert.throws(()=>selectByDeclaredConsequence({unaggregated_functionals:['H_Y','H_FAKE']}),/declared/);
assert.throws(()=>selectByDeclaredConsequence({loss_card:{card_id:'BAD',kind:'SINGLE_FUNCTIONAL',functional_id:'H_FAKE',declaration_status:'PREDECLARED_SYNTHETIC',aggregation_rule:'IDENTITY',posthoc:false}}),/declared functional/);

assert.equal(receipt.related_unresolved_pr_evidence.pr_number,677);
assert.equal(receipt.related_unresolved_pr_evidence.hypothesis_id,'H1_CONSEQUENCE_CONSERVATION');
assert.equal(receipt.related_unresolved_pr_evidence.hypothesis_status_mutated,false);
assert.ok(receipt.anti_equivalences.includes('measurement admissibility != decision value'));
assert.ok(receipt.anti_equivalences.includes('selected under declared loss != universally best'));
assert.ok(receipt.anti_equivalences.includes('#686 evidence != #677 hypothesis promotion'));
assert.equal(receipt.no_scalar_crown,true);
assert.equal(receipt.value_inference,false);
assert.equal(receipt.preference_learning,false);
assert.equal(receipt.sibling_pr_677_mutated,false);
assert.equal(receipt.sibling_pr_684_mutated,false);
assert.equal(receipt.installed_aperture_replay_flag_mutated,false);
assert.equal(APERTURE_V32_REPLAY_STABILITY,'HELD_NOT_YET_WITNESSED');
assert.equal(receipt.promotion_authority,false);
assert.equal(receipt.automatic_execution,false);
assert.equal(receipt.production_mutated,false);
assert.equal(receipt.standalone_aperture_ui_mutated,false);
assert.equal(receipt.human_closure_required,true);
for(const claim of Object.values(receipt.claims)) assert.equal(claim,false);

const spec=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_CONSEQUENCE_CONDITIONED_SELECTION_SPEC_V0_1.md','utf8');
assert.match(spec,/best next question is undefined without a declared decision consequence/i);
assert.match(spec,/NO_SELECTION_UNDECLARED_DECISION_LOSS/);
assert.match(spec,/POSTHOC_DECISION_LOSS_MUTATION_NOT_CONFIRMATORY/);
assert.match(spec,/H1 · Consequence Conservation/);
assert.match(spec,/#686 evidence != #677 hypothesis promotion/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  boundary_rho:receipt.boundary_rho,
  single_functional_choices:{
    H_Y:receipt.criterion_conditioned_results.L_Y.selected_probe_id,
    H_DIFF:receipt.criterion_conditioned_results.L_DIFF.selected_probe_id,
    H_SUM:receipt.criterion_conditioned_results.L_SUM.selected_probe_id
  },
  weighted_choices:{
    equal:receipt.criterion_conditioned_results.L_EQUAL.selected_probe_id,
    sum_heavy:receipt.criterion_conditioned_results.L_SUM_HEAVY.selected_probe_id
  },
  undeclared_status:receipt.refusal_controls.undeclared.status,
  conflict_status:receipt.refusal_controls.conflict.status,
  posthoc_status:receipt.refusal_controls.posthoc.status,
  declared_subset_dominance:receipt.bounded_dominance_control.declared_subset.selected_probe_id,
  excluded_functional_counterexample:receipt.bounded_dominance_control.excluded_functional_counterexample.selected_probe_id,
  next_learning_action:receipt.next_learning_action,
  promotion_authority:receipt.promotion_authority
},null,2));
