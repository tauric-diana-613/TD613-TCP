import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  APERTURE_PEDAGOGUE_DECISION_LOSS_REPLAY_MAP_SCHEMA,
  analyticDecisionBoundaryS,
  analyticMeasurementBoundaryRho,
  runAperturePedagogueDecisionLossReplayMapGauntlet
} from '../app/dome-world/previews/a15-r0/aperture-pedagogue-decision-loss-replay-map.js';
import { APERTURE_V32_REPLAY_STABILITY } from '../app/engine/aperture-v32-typed-epistemic-deficit.js';

assert.ok(Math.abs(analyticDecisionBoundaryS(0.50)-0.5795987083454195)<1e-12);
assert.ok(Math.abs(analyticDecisionBoundaryS(0.546918160706758)-0.5285954791769510)<1e-12);
assert.ok(Math.abs(analyticDecisionBoundaryS(0.60)-0.4677112744730746)<1e-12);
assert.ok(Math.abs(analyticMeasurementBoundaryRho(0.55)-0.527511006183077)<1e-12);
assert.throws(()=>analyticDecisionBoundaryS(1),/inside/);
assert.throws(()=>analyticMeasurementBoundaryRho(-0.1),/\[0,1\]/);

const receipt=runAperturePedagogueDecisionLossReplayMapGauntlet();
assert.equal(receipt.schema,APERTURE_PEDAGOGUE_DECISION_LOSS_REPLAY_MAP_SCHEMA);
assert.equal(receipt.source_status,'SIMULATED');
assert.equal(receipt.authority_class,'A2_DERIVATIONAL');
assert.equal(receipt.manifestly_fictional,true);
assert.equal(receipt.experiment_host,'DOME_WORLD_A15_R0');

const decision=receipt.decision_specification_replay;
assert.equal(decision.fixed_rho,0.546918160706758);
assert.equal(decision.measurement_model_unchanged,true);
assert.equal(decision.candidate_admissibility_unchanged,true);
assert.equal(decision.selection_flip,true);
assert.ok(decision.numeric_boundary.width<1e-8);
assert.ok(decision.absolute_boundary_error<1e-10);
assert.equal(decision.numeric_boundary.lower_selected_probe_id,'P_ORTH');
assert.equal(decision.numeric_boundary.upper_selected_probe_id,'P_DIAG');
assert.equal(decision.classification,'DECISION_SPECIFICATION_SENSITIVE_WITH_MEASUREMENT_POSTURE_HELD');

const measurement=receipt.measurement_model_replay;
assert.equal(measurement.fixed_s,0.55);
assert.equal(measurement.decision_specification_unchanged,true);
assert.equal(measurement.candidate_admissibility_unchanged,true);
assert.equal(measurement.selection_flip,true);
assert.ok(measurement.numeric_boundary.width<1e-8);
assert.ok(measurement.absolute_boundary_error<1e-10);
assert.equal(measurement.numeric_boundary.lower_selected_probe_id,'P_ORTH');
assert.equal(measurement.numeric_boundary.upper_selected_probe_id,'P_DIAG');
assert.equal(measurement.classification,'MEASUREMENT_MODEL_SENSITIVE_WITH_DECISION_SPECIFICATION_HELD');

const interiors=receipt.stable_interiors;
assert.equal(interiors.decision_low_stable,true);
assert.equal(interiors.decision_high_stable,true);
assert.equal(interiors.measurement_low_stable,true);
assert.equal(interiors.measurement_high_stable,true);
assert.ok(interiors.decision_low_interior.every(item=>item.selected_probe_id==='P_ORTH'));
assert.ok(interiors.decision_high_interior.every(item=>item.selected_probe_id==='P_DIAG'));
assert.ok(interiors.measurement_low_interior.every(item=>item.selected_probe_id==='P_ORTH'));
assert.ok(interiors.measurement_high_interior.every(item=>item.selected_probe_id==='P_DIAG'));
assert.equal(interiors.classification,'STABLE_INTERIORS_EXIST_ON_BOTH_REPLAY_AXES');

const map=receipt.joint_replay_map;
assert.equal(map.cells.length,9);
assert.equal(map.contains_orth,true);
assert.equal(map.contains_diag,true);
assert.equal(map.all_candidates_admissible,true);
assert.equal(map.separate_provenance_coordinates,true);
assert.equal(map.collapsed_scalar_coordinate,false);
assert.ok(map.cells.every(cell=>cell.universal_best_question===false));
const expected=[
  [0.50,0.40,'P_ORTH'],
  [0.50,0.55,'P_ORTH'],
  [0.50,0.70,'P_DIAG'],
  [0.546918160706758,0.40,'P_ORTH'],
  [0.546918160706758,0.55,'P_DIAG'],
  [0.546918160706758,0.70,'P_DIAG'],
  [0.60,0.40,'P_ORTH'],
  [0.60,0.55,'P_DIAG'],
  [0.60,0.70,'P_DIAG']
];
assert.deepEqual(map.cells.map(cell=>[cell.rho,cell.s,cell.selected_probe_id]),expected);

assert.deepEqual(receipt.decision_state_coordinates,[
  'measurement_posture',
  'decision_consequence_specification',
  'question_selection',
  'replay_sensitivity'
]);
assert.ok(receipt.bounded_results.includes('MEASUREMENT_AND_DECLARED_CONSEQUENCE_REMAIN_SEPARATELY_REPLAYABLE_COORDINATES'));
assert.ok(receipt.anti_equivalences.includes('measurement-model sensitivity != decision-specification sensitivity'));
assert.ok(receipt.anti_equivalences.includes('loss replay != human preference inference'));
assert.ok(receipt.anti_equivalences.includes('#686 evidence != #677 hypothesis promotion'));
assert.equal(receipt.related_unresolved_pr_evidence.pr_number,677);
assert.equal(receipt.related_unresolved_pr_evidence.hypothesis_status_mutated,false);
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

const spec=fs.readFileSync('app/dome-world/docs/ash/experiments/a15-r0/APERTURE_PEDAGOGUE_DECISION_LOSS_REPLAY_MAP_SPEC_V0_1.md','utf8');
assert.match(spec,/measurement-model sensitivity != decision-specification sensitivity/);
assert.match(spec,/DECISION_SPECIFICATION_SENSITIVE_WITH_MEASUREMENT_POSTURE_HELD/);
assert.match(spec,/MEASUREMENT_MODEL_SENSITIVE_WITH_DECISION_SPECIFICATION_HELD/);
assert.match(spec,/loss replay != human preference inference/);
assert.match(spec,/#686 evidence != #677 hypothesis promotion/);

console.log(JSON.stringify({
  ok:true,
  schema:receipt.schema,
  analytic_checkpoints:receipt.analytic_checkpoints,
  decision_specification_boundary:{
    analytic:decision.analytic_boundary_s,
    numeric:decision.numeric_boundary,
    error:decision.absolute_boundary_error
  },
  measurement_model_boundary:{
    analytic:measurement.analytic_boundary_rho,
    numeric:measurement.numeric_boundary,
    error:measurement.absolute_boundary_error
  },
  stable_interiors:{
    decision_low:interiors.decision_low_stable,
    decision_high:interiors.decision_high_stable,
    measurement_low:interiors.measurement_low_stable,
    measurement_high:interiors.measurement_high_stable
  },
  joint_map:map.cells.map(cell=>({rho:cell.rho,s:cell.s,selected_probe_id:cell.selected_probe_id})),
  next_learning_action:receipt.next_learning_action,
  promotion_authority:receipt.promotion_authority
},null,2));
