import { freeze } from '../../../engine/flowcore-pedagogue-utils.js';
import { selectByDeclaredConsequence } from './aperture-pedagogue-consequence-conditioned-selection.js';
import { analyticDecisionBoundaryS, analyticMeasurementBoundaryRho } from './aperture-pedagogue-decision-loss-replay-map.js';
import { evaluateCorrelatedNoiseCandidate } from './aperture-pedagogue-correlated-noise-geometry.js';

export const APERTURE_PEDAGOGUE_REPLAY_SENSITIVITY_GATE_SCHEMA =
  'td613.ash.a15-r0.aperture-pedagogue-replay-sensitivity-gate-vs-annotation/v0.1';

const DECISION_RHO = 0.546918160706758;
const FIXED_S = 0.55;
const EPS = 1e-4;
const IDENTITY_COV = Object.freeze([Object.freeze([1,0]), Object.freeze([0,1])]);

function freezeArray(items){ return freeze(items.map(item=>freeze(item))); }
function lossCard(s,id='L_REPLAY'){
  const flank=(1-s)/2;
  return freeze({card_id:id,kind:'WEIGHTED_FUNCTIONALS',weights:freeze({H_Y:flank,H_DIFF:flank,H_SUM:s}),declaration_status:'PREDECLARED_SYNTHETIC',aggregation_rule:'WEIGHTED_SUM',posthoc:false});
}
function select(rho,s){ return selectByDeclaredConsequence({rho,loss_card:lossCard(s)}); }
function probeSet(receipts){ return new Set(receipts.map(item=>item.selected_probe_id)); }
function allAdmissible(receipts){ return receipts.every(item=>item.candidate_admissibility.every(candidate=>candidate.admissible===true)); }
function typedPosture({id,deficitClass='STRUCTURAL_RANK_DEFICIT',baseDisposition='PROPOSE',replayDisposition,measurementAdmissibility,measurementModelCoordinate,decisionSpecificationCoordinate,replaySensitivityAxis='NONE',selectionStability,selectedProbeId=null,proposalAnnotation=null,refusalReason=null}){
  return freeze({fixture_id:id,deficit_class:deficitClass,base_epistemic_disposition:baseDisposition,replay_policy_disposition:replayDisposition,measurement_admissibility:measurementAdmissibility,measurement_model_coordinate:measurementModelCoordinate,decision_specification_coordinate:decisionSpecificationCoordinate,replay_sensitivity_axis:replaySensitivityAxis,selection_stability:selectionStability,selected_probe_id:selectedProbeId,proposal_annotation:proposalAnnotation,refusal_reason:refusalReason,automatic_execution:false});
}
function stableInteriorFixture(){
  const s=0.4; const rhos=[0.49,0.50,0.51]; const receipts=rhos.map(rho=>select(rho,s)); const choices=probeSet(receipts); const admissible=allAdmissible(receipts);
  return typedPosture({id:'F1_STABLE_INTERIOR',replayDisposition:'PROPOSE_STABLE_WITHIN_DECLARED_REPLAY_ENVELOPE',measurementAdmissibility:admissible?'STABLE_VALID':'UNSTABLE',measurementModelCoordinate:freeze({rho_values:freeze(rhos)}),decisionSpecificationCoordinate:freeze({s,fixed:true}),replaySensitivityAxis:'NONE',selectionStability:choices.size===1?'STABLE':'UNSTABLE',selectedProbeId:choices.size===1?[...choices][0]:null,proposalAnnotation:'LOCAL_STABILITY_ONLY_NOT_UNIVERSAL_ROBUSTNESS'});
}
function measurementSensitivityFixture(){
  const boundary=analyticMeasurementBoundaryRho(FIXED_S); const rhos=[boundary-EPS,boundary+EPS]; const receipts=rhos.map(rho=>select(rho,FIXED_S)); const choices=probeSet(receipts); const admissible=allAdmissible(receipts);
  return typedPosture({id:'F2_MEASUREMENT_MODEL_SELECTION_SENSITIVITY',replayDisposition:'PROPOSE_WITH_REPLAY_SENSITIVITY_ANNOTATION',measurementAdmissibility:admissible?'STABLE_VALID':'UNSTABLE',measurementModelCoordinate:freeze({boundary_rho:boundary,rho_values:freeze(rhos)}),decisionSpecificationCoordinate:freeze({s:FIXED_S,fixed:true}),replaySensitivityAxis:'MEASUREMENT_MODEL',selectionStability:choices.size===1?'STABLE':'SENSITIVE',selectedProbeId:null,proposalAnnotation:'SELECTED_QUESTION_CHANGES_ACROSS_DECLARED_MEASUREMENT_MODEL_ENVELOPE'});
}
function decisionSensitivityFixture(){
  const boundary=analyticDecisionBoundaryS(DECISION_RHO); const ss=[boundary-EPS,boundary+EPS]; const receipts=ss.map(s=>select(DECISION_RHO,s)); const choices=probeSet(receipts); const admissible=allAdmissible(receipts);
  return typedPosture({id:'F3_DECISION_SPECIFICATION_SELECTION_SENSITIVITY',replayDisposition:'PROPOSE_WITH_REPLAY_SENSITIVITY_ANNOTATION',measurementAdmissibility:admissible?'STABLE_VALID':'UNSTABLE',measurementModelCoordinate:freeze({rho:DECISION_RHO,fixed:true}),decisionSpecificationCoordinate:freeze({boundary_s:boundary,s_values:freeze(ss)}),replaySensitivityAxis:'DECISION_SPECIFICATION',selectionStability:choices.size===1?'STABLE':'SENSITIVE',selectedProbeId:null,proposalAnnotation:'SELECTED_QUESTION_CHANGES_ACROSS_DECLARED_DECISION_SPECIFICATION_ENVELOPE'});
}
function candidateAdmissibilityFixture(){
  const ts=[0,0.01,0.02];
  const evaluations=ts.map(t=>evaluateCorrelatedNoiseCandidate({probe_id:'P_SWEEP',definition:'declared synthetic probe family [1,t]',gradient:[1,t],covariance:IDENTITY_COV,covariance_source_status:'DECLARED_SYNTHETIC_FULL_COVARIANCE'}));
  const rankLifts=evaluations.map(item=>item.rank_lift); const covarianceValid=evaluations.every(item=>item.positive_definite_status==='VALID_SYMMETRIC_POSITIVE_DEFINITE_COVARIANCE'); const uniformlyAdmissible=rankLifts.every(value=>value>0)&&covarianceValid;
  return freeze({...typedPosture({id:'F4_CANDIDATE_ADMISSIBILITY_INSTABILITY',replayDisposition:'ABSTAIN_CANDIDATE_ADMISSIBILITY_NOT_STABLE',measurementAdmissibility:uniformlyAdmissible?'STABLE_VALID':'NOT_STABLE_ACROSS_DECLARED_ENVELOPE',measurementModelCoordinate:freeze({covariance:'IDENTITY',fixed:true,probe_family_parameter_t:freeze(ts)}),decisionSpecificationCoordinate:freeze({status:'HELD_FIXED_NOT_CAUSAL'}),replaySensitivityAxis:'CANDIDATE_MEASUREMENT_ADMISSIBILITY',selectionStability:'NOT_EVALUATED_BECAUSE_DECLARED_CANDIDATE_SET_IS_NOT_UNIFORMLY_ADMISSIBLE',selectedProbeId:null,proposalAnnotation:'DECLARED_COMPARISON_HELD_WHILE_CANDIDATE_UNIVERSE_CHANGES_ADMISSIBILITY',refusalReason:'CANDIDATE_RANK_LIFT_NOT_STABLE_ACROSS_DECLARED_ENVELOPE'}),envelope_evaluations:freezeArray(evaluations.map((item,index)=>({t:ts[index],rank_lift:item.rank_lift,covariance_status:item.positive_definite_status,complete_joint_noise_geometry:item.complete_joint_noise_geometry})))});
}
function refusalFixtures(){
  const undeclared=selectByDeclaredConsequence({rho:0.5});
  const conflict=selectByDeclaredConsequence({rho:0.5,unaggregated_functionals:['H_Y','H_SUM']});
  const posthoc=selectByDeclaredConsequence({rho:0.5,loss_card:{...lossCard(0.7,'L_POSTHOC'),posthoc:true}});
  return freeze({undeclared,conflict,posthoc});
}
export function runAperturePedagogueReplaySensitivityGateGauntlet(){
  const F1=stableInteriorFixture(); const F2=measurementSensitivityFixture(); const F3=decisionSensitivityFixture(); const F4=candidateAdmissibilityFixture(); const F5=refusalFixtures();
  const passed=F1.replay_policy_disposition==='PROPOSE_STABLE_WITHIN_DECLARED_REPLAY_ENVELOPE'&&F1.measurement_admissibility==='STABLE_VALID'&&F1.selection_stability==='STABLE'&&F2.replay_policy_disposition==='PROPOSE_WITH_REPLAY_SENSITIVITY_ANNOTATION'&&F2.replay_sensitivity_axis==='MEASUREMENT_MODEL'&&F2.measurement_admissibility==='STABLE_VALID'&&F2.selection_stability==='SENSITIVE'&&F3.replay_policy_disposition==='PROPOSE_WITH_REPLAY_SENSITIVITY_ANNOTATION'&&F3.replay_sensitivity_axis==='DECISION_SPECIFICATION'&&F3.measurement_admissibility==='STABLE_VALID'&&F3.selection_stability==='SENSITIVE'&&F4.replay_policy_disposition==='ABSTAIN_CANDIDATE_ADMISSIBILITY_NOT_STABLE'&&F4.measurement_admissibility==='NOT_STABLE_ACROSS_DECLARED_ENVELOPE'&&F4.envelope_evaluations[0].rank_lift===0&&F4.envelope_evaluations.slice(1).every(item=>item.rank_lift===1)&&F4.envelope_evaluations.every(item=>item.covariance_status==='VALID_SYMMETRIC_POSITIVE_DEFINITE_COVARIANCE')&&F5.undeclared.status==='NO_SELECTION_UNDECLARED_DECISION_LOSS'&&F5.conflict.status==='NO_SELECTION_CONFLICTING_LOSSES_WITHOUT_AGGREGATION_RULE'&&F5.posthoc.status==='POSTHOC_DECISION_LOSS_MUTATION_NOT_CONFIRMATORY';
  if(!passed) throw new Error('Aperture × Pedagogue replay sensitivity gate-vs-annotation gauntlet violated an authored expectation.');
  return freeze({schema:APERTURE_PEDAGOGUE_REPLAY_SENSITIVITY_GATE_SCHEMA,source_status:'SIMULATED',authority_class:'A2_DERIVATIONAL',manifestly_fictional:true,experiment_host:'DOME_WORLD_A15_R0',fixtures:freeze({F1,F2,F3,F4,F5}),bounded_results:freeze(['REPLAY_SENSITIVE_SELECTION_CAN_REMAIN_PROPOSAL_ELIGIBLE_WHEN_MEASUREMENT_ADMISSIBILITY_IS_STABLE','MEASUREMENT_MODEL_AND_DECISION_SPECIFICATION_SENSITIVITY_REMAIN_DISTINCT_ANNOTATION_AXES','DECLARED_CANDIDATE_SET_ADMISSIBILITY_INSTABILITY_CAN_JUSTIFY_A_STRONGER_REPLAY_HOLD','VALUE_CONTINGENCY_DOES_NOT_CREATE_AN_EPISTEMIC_DEFICIT','UNDECLARED_CONFLICTING_OR_POSTHOC_DECISION_CONSEQUENCES_RETAIN_THEIR_EXISTING_REFUSAL_CLASSES']),related_unresolved_pr_evidence:freeze({pr_number:677,relationship:'ADDITIONAL_BOUNDED_SYNTHETIC_EVIDENCE_ONLY',hypothesis_status_mutated:false}),sibling_pr_684_posture:freeze({pr_number:684,relationship:'UNRESOLVED_HISTORY_RECONCILIATION_SURFACE_ONLY',mutated:false}),anti_equivalences:freeze(['replay-sensitive selection != invalid measurement','replay-sensitive selection != automatic abstention','value contingency != epistemic deficit','admissibility instability != value contingency','annotation != execution authority','stable interior != universal robustness','measurement-model sensitivity != decision-specification sensitivity','#686 evidence != #677 hypothesis promotion']),no_scalar_crown:true,next_learning_action:'TEST_WHETHER_MULTI_AXIS_REPLAY_ANNOTATIONS_CAN_BE_COMPOSED_WITHOUT_COLLAPSING_MEASUREMENT_UNCERTAINTY_DECISION_CONTINGENCY_AND_ROUTE_PROVENANCE_INTO_ONE_CONFIDENCE_OBJECT',promotion_authority:false,automatic_execution:false,value_inference:false,preference_learning:false,production_mutated:false,standalone_aperture_ui_mutated:false,sibling_pr_677_mutated:false,sibling_pr_684_mutated:false,human_closure_required:true,claims:freeze({universal_replay_radius:false,universal_best_question:false,universal_utility:false,human_preference_inference:false,preference_learning:false,optimal_experimental_design:false,decision_theory_promotion:false,active_learning_optimality:false,information_geometry:false,physical_sensor_design:false,physical_tomography:false,blind_tomography:false,operator_tomography:false,autonomous_experiment_execution:false,connection:false,curvature:false,holonomy:false,berry_structure:false,quantum_behavior:false,proto_loom:false,production_authority:false,release_authority:false})});
}
