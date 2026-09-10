import {
  auditTypedEpistemicDeficit
} from '../../../engine/aperture-v32-typed-epistemic-deficit.js';
import {
  operatorGeometry
} from './aperture-pedagogue-endogenous-observation-reaudit.js';

export const MULTI_STEP_QUESTION_ORDER_SCHEMA =
  'td613.a15-r0.aperture-pedagogue-multi-step-question-order/v0.1';

const LOCAL_THRESHOLDS = Object.freeze({
  sigma_min_floor: 0.25,
  condition_number_ceiling: 10,
  uncertainty_status: 'VALID_DECLARED',
  threshold_authority: 'A15_R0_SYNTHETIC_LOCAL'
});

const START_OPERATOR = Object.freeze([Object.freeze([1,0]),Object.freeze([0,0.1])]);
const IDENTITY_OPERATOR = Object.freeze([Object.freeze([1,0]),Object.freeze([0,1])]);

export const QUESTION_TRANSITIONS = Object.freeze({
  A:Object.freeze({question_id:'A',transition_status:'DECLARED_SYNTHETIC_REUSABLE',matrix:Object.freeze([Object.freeze([0.5,1]),Object.freeze([-1,0.5])])}),
  B:Object.freeze({question_id:'B',transition_status:'DECLARED_SYNTHETIC_REUSABLE',matrix:Object.freeze([Object.freeze([-0.5,2]),Object.freeze([-1,-1])])}),
  C:Object.freeze({question_id:'C',transition_status:'DECLARED_SYNTHETIC_REUSABLE',matrix:Object.freeze([Object.freeze([1,0]),Object.freeze([0,1.5])])}),
  D:Object.freeze({question_id:'D',transition_status:'DECLARED_SYNTHETIC_REUSABLE',matrix:Object.freeze([Object.freeze([1,0]),Object.freeze([0,2])])}),
  R:Object.freeze({question_id:'R',transition_status:'DECLARED_SYNTHETIC_IRREVERSIBLE',matrix:Object.freeze([Object.freeze([1,0]),Object.freeze([0,0])])}),
  S:Object.freeze({question_id:'S',transition_status:'DECLARED_SYNTHETIC_REUSABLE',matrix:Object.freeze([Object.freeze([0,1]),Object.freeze([1,0])])}),
  U:Object.freeze({question_id:'U',transition_status:'UNDECLARED',matrix:null})
});

function deepFreeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(deepFreeze);Object.freeze(value);}return value;}
function matrix2(matrix,label){if(!Array.isArray(matrix)||matrix.length!==2)throw new TypeError(`${label} must be 2x2`);return matrix.map((row,i)=>{if(!Array.isArray(row)||row.length!==2)throw new TypeError(`${label}[${i}] must contain two values`);return row.map((value,j)=>{const n=Number(value);if(!Number.isFinite(n))throw new TypeError(`${label}[${i}][${j}] must be finite`);return n;});});}

export function multiply2(left,right){const A=matrix2(left,'left');const B=matrix2(right,'right');return deepFreeze([[A[0][0]*B[0][0]+A[0][1]*B[1][0],A[0][0]*B[0][1]+A[0][1]*B[1][1]],[A[1][0]*B[0][0]+A[1][1]*B[1][0],A[1][0]*B[0][1]+A[1][1]*B[1][1]]].map(deepFreeze));}
export function determinant2(matrix){const M=matrix2(matrix,'matrix');return M[0][0]*M[1][1]-M[0][1]*M[1][0];}
function sameMatrix(left,right,tolerance=1e-12){const A=matrix2(left,'left');const B=matrix2(right,'right');return A.every((row,i)=>row.every((value,j)=>Math.abs(value-B[i][j])<=tolerance));}
function auditOperator(operator){const geometry=operatorGeometry(operator);const aperture=auditTypedEpistemicDeficit({latent_dimension:geometry.latent_dimension,current_rank:geometry.rank,sigma_min:geometry.sigma_min,condition_number:geometry.condition_number,...LOCAL_THRESHOLDS});return deepFreeze({geometry,aperture});}

export function simulateGovernedQuestionSequence(questionIds,options={}){
  if(!Array.isArray(questionIds)||questionIds.length===0)throw new TypeError('questionIds must be a non-empty array');
  let operator=matrix2(options.start_operator||START_OPERATOR,'start_operator');
  const library=options.transition_library||QUESTION_TRANSITIONS;
  const route=[];
  let stopReason=null;
  for(let index=0;index<questionIds.length;index+=1){
    const id=String(questionIds[index]);
    const before=auditOperator(operator);
    if(before.aperture.disposition!=='PROPOSE'){
      stopReason='APERTURE_NO_FURTHER_QUESTION_NEEDED';
      route.push(deepFreeze({step_index:index,question_id:id,operator_before:deepFreeze(operator),aperture_before:before.aperture,transition_status:'NOT_APPLIED_NEED_GATE_CLOSED',transition_matrix:null,operator_after:null,geometry_after:null,aperture_after:null,stop_reason:stopReason}));
      break;
    }
    const transition=library[id];
    if(!transition||transition.transition_status==='UNDECLARED'||transition.matrix==null){
      stopReason='QUESTION_TRANSITION_MODEL_INCOMPLETE';
      route.push(deepFreeze({step_index:index,question_id:id,operator_before:deepFreeze(operator),aperture_before:before.aperture,transition_status:transition?.transition_status||'MISSING_FROM_LIBRARY',transition_matrix:null,operator_after:null,geometry_after:null,aperture_after:null,stop_reason:'ABSTAIN_BEFORE_SEQUENCE_REAUDIT'}));
      break;
    }
    const transitionMatrix=matrix2(transition.matrix,`${id}.matrix`);
    const afterOperator=multiply2(operator,transitionMatrix);
    const after=auditOperator(afterOperator);
    route.push(deepFreeze({step_index:index,question_id:id,operator_before:deepFreeze(operator),aperture_before:before.aperture,transition_status:transition.transition_status,transition_matrix:deepFreeze(transitionMatrix),operator_after:afterOperator,geometry_after:after.geometry,aperture_after:after.aperture,stop_reason:after.aperture.disposition==='ASK_NOTHING'?'DEFICIT_CLOSED_AFTER_STEP':null}));
    operator=afterOperator;
  }
  const terminal=auditOperator(operator);
  if(stopReason==null)stopReason=terminal.aperture.disposition==='ASK_NOTHING'?'DEFICIT_CLOSED_AT_DECLARED_SEQUENCE_END':'DECLARED_SEQUENCE_EXHAUSTED_WITH_OPEN_DEFICIT';
  return deepFreeze({question_sequence:deepFreeze(questionIds.map(String)),start_operator:deepFreeze(matrix2(options.start_operator||START_OPERATOR,'start_operator')),route:deepFreeze(route),applied_step_count:route.filter(step=>step.operator_after!=null).length,terminal_operator:deepFreeze(operator),terminal_geometry:terminal.geometry,terminal_aperture:terminal.aperture,stop_reason:stopReason,real_observation_executed:false,automatic_experiment_execution:false,promotion_authority:false});
}

export function analyzeIrreversibleOrderControl(){const R=QUESTION_TRANSITIONS.R.matrix;const S=QUESTION_TRANSITIONS.S.matrix;const RS=multiply2(multiply2(IDENTITY_OPERATOR,R),S);const SR=multiply2(multiply2(IDENTITY_OPERATOR,S),R);const rs=auditOperator(RS);const sr=auditOperator(SR);return deepFreeze({control_class:'IRREVERSIBLE_MUTATION_ORDER_CONTROL',projection_determinant:determinant2(R),swap_determinant:determinant2(S),terminal_RS:RS,terminal_SR:SR,terminal_matrices_differ:!sameMatrix(RS,SR),RS_aperture:rs.aperture,SR_aperture:sr.aperture,reusable_transport_inference_permitted:false,holonomy_inference_permitted:false});}

export function runMultiStepQuestionOrderGauntlet(){
  const start=auditOperator(START_OPERATOR);
  const AB=simulateGovernedQuestionSequence(['A','B']);
  const BA=simulateGovernedQuestionSequence(['B','A']);
  const CD=simulateGovernedQuestionSequence(['C','D']);
  const DC=simulateGovernedQuestionSequence(['D','C']);
  const missing=simulateGovernedQuestionSequence(['U']);
  const irreversible=analyzeIrreversibleOrderControl();
  const TA=QUESTION_TRANSITIONS.A.matrix;const TB=QUESTION_TRANSITIONS.B.matrix;
  const TAB=multiply2(TA,TB);const TBA=multiply2(TB,TA);const noncommuting=!sameMatrix(TAB,TBA);
  const firstA=AB.route[0];const firstB=BA.route[0];
  const passed=start.aperture.deficit_class==='NUMERICAL_STABILITY_DEFICIT'&&start.aperture.disposition==='PROPOSE'&&firstA.aperture_after.deficit_class==='NUMERICAL_STABILITY_DEFICIT'&&firstA.aperture_after.disposition==='PROPOSE'&&firstB.aperture_after.deficit_class==='NUMERICAL_STABILITY_DEFICIT'&&firstB.aperture_after.disposition==='PROPOSE'&&AB.applied_step_count===2&&AB.terminal_aperture.deficit_class==='NO_DECLARED_LOCAL_IDENTIFIABILITY_DEFICIT'&&AB.terminal_aperture.disposition==='ASK_NOTHING'&&Math.abs(AB.terminal_geometry.sigma_min-0.25)<1e-12&&Math.abs(AB.terminal_geometry.condition_number-5)<1e-12&&BA.applied_step_count===2&&BA.terminal_geometry.rank===2&&BA.terminal_aperture.deficit_class==='NUMERICAL_STABILITY_DEFICIT'&&BA.terminal_aperture.disposition==='PROPOSE'&&BA.terminal_geometry.sigma_min>0.13&&BA.terminal_geometry.sigma_min<0.14&&BA.terminal_geometry.condition_number>17&&BA.terminal_geometry.condition_number<18&&noncommuting===true&&determinant2(TA)!==0&&determinant2(TB)!==0&&CD.applied_step_count===2&&DC.applied_step_count===2&&sameMatrix(CD.terminal_operator,DC.terminal_operator)&&CD.terminal_aperture.deficit_class===DC.terminal_aperture.deficit_class&&CD.terminal_aperture.disposition==='ASK_NOTHING'&&irreversible.projection_determinant===0&&irreversible.terminal_matrices_differ===true&&irreversible.RS_aperture.deficit_class==='STRUCTURAL_RANK_DEFICIT'&&irreversible.SR_aperture.deficit_class==='STRUCTURAL_RANK_DEFICIT'&&irreversible.reusable_transport_inference_permitted===false&&missing.applied_step_count===0&&missing.stop_reason==='QUESTION_TRANSITION_MODEL_INCOMPLETE'&&missing.route[0].stop_reason==='ABSTAIN_BEFORE_SEQUENCE_REAUDIT';
  if(!passed)throw new Error('Multi-step question-order gauntlet violated an authored expectation.');
  return deepFreeze({schema:MULTI_STEP_QUESTION_ORDER_SCHEMA,source_status:'SIMULATED',authority_class:'A2_DERIVATIONAL',manifestly_fictional:true,current:start,reusable_main_pair:deepFreeze({transition_A_determinant:determinant2(TA),transition_B_determinant:determinant2(TB),transition_AB:TAB,transition_BA:TBA,noncommuting_in_declared_finite_fixture:noncommuting,AB,BA}),commuting_control:deepFreeze({CD,DC,terminal_operators_equal:sameMatrix(CD.terminal_operator,DC.terminal_operator)}),irreversible_control:irreversible,missing_transition_control:missing,gauntlet_status:'MULTI_STEP_QUESTION_ORDER_BOUNDARY_VALIDATED_IN_BOUNDED_SYNTHETIC_FIXTURE',bounded_refinement_candidate:'when reusable declared synthetic question transitions alter the observation operator inherited by later questions, the same question multiset may terminate in different typed Aperture deficit states under different orders; commuting and irreversible controls are required before interpreting that sequence sensitivity',next_learning_action:'TEST_REFLEXIVE_QUESTION_POLICY_WHERE_APERTURE_TYPED_DEFICIT_SELECTS_THE_NEXT_PEDAGOGUE_QUESTION_FAMILY_AND_EACH_SYNTHETIC_QUESTION_CHANGES_THE_STATE_USED_FOR_THE_NEXT_SELECTION_WITH_STOPPING_ABSTENTION_AND_REPLAY_INVARIANTS',anti_equivalences:deepFreeze(['question order dependence != holonomy','noncommuting finite transition pair != connection','noncommuting finite transition pair != curvature','noncommuting finite transition pair != quantum behavior','reusable invertible transition != irreversible overwrite','same question multiset != same ordered route','same observation budget != same future aperture','Aperture PROPOSE != authorization to execute a real experiment','Aperture ASK_NOTHING != universal sufficiency']),claims:deepFreeze({general_adaptive_experimental_design:false,optimal_policy:false,active_learning_optimality:false,performative_prediction_theorem:false,causal_intervention_law:false,physical_sensor_feedback:false,physical_tomography:false,blind_tomography:false,operator_tomography:false,quantum_measurement_disturbance:false,berry_structure:false,connection:false,curvature:false,physical_holonomy:false,continuum_holonomy:false,td613_general_aia_theorem:false,proto_loom:false,autonomous_experiment_execution:false,production_authority:false,vercel_authority:false}),installed_aperture_mutated:false,pedagogue_law_promoted:false,automatic_observation:false,automatic_experiment_execution:false,promotion_authority:false,production_mutation:false,human_closure_required:true});
}
