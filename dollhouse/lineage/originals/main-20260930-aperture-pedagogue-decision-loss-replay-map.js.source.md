import { freeze } from '../../../engine/flowcore-pedagogue-utils.js';
import { selectByDeclaredConsequence } from './aperture-pedagogue-consequence-conditioned-selection.js';

export const APERTURE_PEDAGOGUE_DECISION_LOSS_REPLAY_MAP_SCHEMA =
  'td613.ash.a15-r0.aperture-pedagogue-decision-loss-replay-map/v0.1';

const SQRT2 = Math.sqrt(2);
const DECISION_BOUNDARY_RHO = 0.546918160706758;
const FIXED_DECISION_S = 0.55;
const TOLERANCE = 1e-10;

function round(value,digits=15){ return Number(value.toFixed(digits)); }

function lossCardForS(s,cardId=`L_S_${round(s,12)}`){
  if(!Number.isFinite(s) || s<0 || s>1) throw new TypeError('s must be a finite number in [0,1].');
  const flank=(1-s)/2;
  return freeze({
    card_id:cardId,
    kind:'WEIGHTED_FUNCTIONALS',
    weights:freeze({ H_Y:flank, H_DIFF:flank, H_SUM:s }),
    declaration_status:'PREDECLARED_SYNTHETIC',
    aggregation_rule:'WEIGHTED_SUM',
    posthoc:false
  });
}

function selectionAt(rho,s){
  if(!Number.isFinite(rho) || rho<=-1 || rho>=1) throw new TypeError('rho must remain inside the valid correlation interval (-1,1).');
  const receipt=selectByDeclaredConsequence({ rho, loss_card:lossCardForS(s) });
  if(receipt.status!=='CONSEQUENCE_CONDITIONED_QUESTION_PROPOSED'){
    throw new Error(`expected consequence-conditioned proposal at rho=${rho}, s=${s}; got ${receipt.status}.`);
  }
  const allAdmissible=receipt.candidate_admissibility.every(item=>item.admissible===true);
  if(!allAdmissible) throw new Error(`candidate admissibility changed inside replay map at rho=${rho}, s=${s}.`);
  return freeze({
    rho:round(rho),
    s:round(s),
    selected_probe_id:receipt.selected_probe_id,
    candidate_admissibility:receipt.candidate_admissibility,
    scores:receipt.scores,
    automatic_execution:receipt.automatic_execution,
    universal_best_question:receipt.universal_best_question
  });
}

export function analyticDecisionBoundaryS(rho){
  if(!Number.isFinite(rho) || rho<=-1 || rho>=1) throw new TypeError('rho must remain inside (-1,1).');
  const A=3+rho-3*SQRT2*rho;
  return A/(A+2*rho);
}

export function analyticMeasurementBoundaryRho(s){
  if(!Number.isFinite(s) || s<0 || s>1) throw new TypeError('s must be in [0,1].');
  const denominator=2*s-(1-s)*(1-3*SQRT2);
  if(Math.abs(denominator)<=1e-15) throw new Error('analytic rho boundary denominator vanished.');
  return 3*(1-s)/denominator;
}

function bracketBoundary({ lower, upper, coordinate, fixedValue }){
  let lo=lower;
  let hi=upper;
  const choose=(value)=>coordinate==='s'
    ? selectionAt(fixedValue,value).selected_probe_id
    : selectionAt(value,fixedValue).selected_probe_id;

  if(choose(lo)!=='P_ORTH' || choose(hi)!=='P_DIAG'){
    throw new Error(`${coordinate} seed interval must bracket P_ORTH -> P_DIAG.`);
  }

  let iterations=0;
  while(hi-lo>=1e-10 && iterations<96){
    const midpoint=(lo+hi)/2;
    const selected=choose(midpoint);
    if(selected==='P_ORTH') lo=midpoint;
    else if(selected==='P_DIAG') hi=midpoint;
    else throw new Error(`unexpected selected probe ${selected}.`);
    iterations+=1;
  }

  return freeze({
    coordinate,
    lower:round(lo),
    upper:round(hi),
    midpoint:round((lo+hi)/2),
    width:round(hi-lo),
    iterations,
    lower_selected_probe_id:choose(lo),
    upper_selected_probe_id:choose(hi)
  });
}

function decisionSpecificationReplay(){
  const analytic=analyticDecisionBoundaryS(DECISION_BOUNDARY_RHO);
  const bracket=bracketBoundary({
    lower:0.52,
    upper:0.54,
    coordinate:'s',
    fixedValue:DECISION_BOUNDARY_RHO
  });
  const left=selectionAt(DECISION_BOUNDARY_RHO,bracket.lower);
  const right=selectionAt(DECISION_BOUNDARY_RHO,bracket.upper);
  return freeze({
    fixed_rho:DECISION_BOUNDARY_RHO,
    analytic_boundary_s:round(analytic),
    numeric_boundary:bracket,
    absolute_boundary_error:round(Math.abs(bracket.midpoint-analytic)),
    measurement_model_unchanged:true,
    candidate_admissibility_unchanged:
      left.candidate_admissibility.every(item=>item.admissible) &&
      right.candidate_admissibility.every(item=>item.admissible),
    selection_flip:left.selected_probe_id==='P_ORTH' && right.selected_probe_id==='P_DIAG',
    classification:'DECISION_SPECIFICATION_SENSITIVE_WITH_MEASUREMENT_POSTURE_HELD'
  });
}

function measurementModelReplay(){
  const analytic=analyticMeasurementBoundaryRho(FIXED_DECISION_S);
  const bracket=bracketBoundary({
    lower:0.52,
    upper:0.54,
    coordinate:'rho',
    fixedValue:FIXED_DECISION_S
  });
  const left=selectionAt(bracket.lower,FIXED_DECISION_S);
  const right=selectionAt(bracket.upper,FIXED_DECISION_S);
  return freeze({
    fixed_s:FIXED_DECISION_S,
    analytic_boundary_rho:round(analytic),
    numeric_boundary:bracket,
    absolute_boundary_error:round(Math.abs(bracket.midpoint-analytic)),
    decision_specification_unchanged:true,
    candidate_admissibility_unchanged:
      left.candidate_admissibility.every(item=>item.admissible) &&
      right.candidate_admissibility.every(item=>item.admissible),
    selection_flip:left.selected_probe_id==='P_ORTH' && right.selected_probe_id==='P_DIAG',
    classification:'MEASUREMENT_MODEL_SENSITIVE_WITH_DECISION_SPECIFICATION_HELD'
  });
}

function stableInteriorControls(){
  const lowS=[0.39,0.40,0.41].map(s=>selectionAt(DECISION_BOUNDARY_RHO,s));
  const highS=[0.69,0.70,0.71].map(s=>selectionAt(DECISION_BOUNDARY_RHO,s));
  const lowRho=[0.495,0.50,0.505].map(rho=>selectionAt(rho,FIXED_DECISION_S));
  const highRho=[0.595,0.60,0.605].map(rho=>selectionAt(rho,FIXED_DECISION_S));
  return freeze({
    decision_low_interior:freeze(lowS),
    decision_high_interior:freeze(highS),
    measurement_low_interior:freeze(lowRho),
    measurement_high_interior:freeze(highRho),
    decision_low_stable:lowS.every(item=>item.selected_probe_id==='P_ORTH'),
    decision_high_stable:highS.every(item=>item.selected_probe_id==='P_DIAG'),
    measurement_low_stable:lowRho.every(item=>item.selected_probe_id==='P_ORTH'),
    measurement_high_stable:highRho.every(item=>item.selected_probe_id==='P_DIAG'),
    classification:'STABLE_INTERIORS_EXIST_ON_BOTH_REPLAY_AXES'
  });
}

function jointReplayMap(){
  const rhos=[0.50,DECISION_BOUNDARY_RHO,0.60];
  const ss=[0.40,0.55,0.70];
  const cells=[];
  for(const rho of rhos){
    for(const s of ss){
      const selection=selectionAt(rho,s);
      cells.push(freeze({
        rho:round(rho),
        s:round(s),
        selected_probe_id:selection.selected_probe_id,
        all_candidates_admissible:selection.candidate_admissibility.every(item=>item.admissible),
        universal_best_question:selection.universal_best_question
      }));
    }
  }
  const selectedIds=new Set(cells.map(cell=>cell.selected_probe_id));
  return freeze({
    rho_axis:freeze(rhos),
    decision_s_axis:freeze(ss),
    cells:freeze(cells),
    contains_orth:selectedIds.has('P_ORTH'),
    contains_diag:selectedIds.has('P_DIAG'),
    all_candidates_admissible:cells.every(cell=>cell.all_candidates_admissible),
    separate_provenance_coordinates:true,
    collapsed_scalar_coordinate:false
  });
}

export function runAperturePedagogueDecisionLossReplayMapGauntlet(){
  const checkpoints=freeze([
    freeze({rho:0.50, analytic_s:round(analyticDecisionBoundaryS(0.50))}),
    freeze({rho:DECISION_BOUNDARY_RHO, analytic_s:round(analyticDecisionBoundaryS(DECISION_BOUNDARY_RHO))}),
    freeze({rho:0.60, analytic_s:round(analyticDecisionBoundaryS(0.60))})
  ]);
  const decisionReplay=decisionSpecificationReplay();
  const measurementReplay=measurementModelReplay();
  const interiors=stableInteriorControls();
  const map=jointReplayMap();

  const passed=
    Math.abs(checkpoints[0].analytic_s-0.5795987083454195)<1e-12 &&
    Math.abs(checkpoints[1].analytic_s-0.5285954791769510)<1e-12 &&
    Math.abs(checkpoints[2].analytic_s-0.4677112744730746)<1e-12 &&
    decisionReplay.selection_flip===true &&
    decisionReplay.candidate_admissibility_unchanged===true &&
    decisionReplay.numeric_boundary.width<1e-8 &&
    decisionReplay.absolute_boundary_error<TOLERANCE &&
    measurementReplay.selection_flip===true &&
    measurementReplay.candidate_admissibility_unchanged===true &&
    measurementReplay.numeric_boundary.width<1e-8 &&
    measurementReplay.absolute_boundary_error<TOLERANCE &&
    Math.abs(measurementReplay.analytic_boundary_rho-0.527511006183077)<1e-12 &&
    interiors.decision_low_stable===true &&
    interiors.decision_high_stable===true &&
    interiors.measurement_low_stable===true &&
    interiors.measurement_high_stable===true &&
    map.contains_orth===true && map.contains_diag===true &&
    map.all_candidates_admissible===true &&
    map.separate_provenance_coordinates===true &&
    map.collapsed_scalar_coordinate===false;

  if(!passed) throw new Error('Aperture × Pedagogue decision-loss replay map gauntlet violated an authored falsifier.');

  return freeze({
    schema:APERTURE_PEDAGOGUE_DECISION_LOSS_REPLAY_MAP_SCHEMA,
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    experiment_host:'DOME_WORLD_A15_R0',
    analytic_checkpoints:checkpoints,
    decision_specification_replay:decisionReplay,
    measurement_model_replay:measurementReplay,
    stable_interiors:interiors,
    joint_replay_map:map,
    decision_state_coordinates:freeze([
      'measurement_posture',
      'decision_consequence_specification',
      'question_selection',
      'replay_sensitivity'
    ]),
    bounded_results:freeze([
      'DECISION_SPECIFICATION_SENSITIVITY_SEPARATED_FROM_MEASUREMENT_POSTURE_IN_BOUNDED_SYNTHETIC_FIXTURE',
      'MEASUREMENT_MODEL_SENSITIVITY_SEPARATED_FROM_DECISION_SPECIFICATION_IN_BOUNDED_SYNTHETIC_FIXTURE',
      'CANDIDATE_ADMISSIBILITY_CAN_REMAIN_STABLE_WHILE_QUESTION_SELECTION_FLIPS',
      'STABLE_INTERIORS_EXIST_ALONG_BOTH_REPLAY_AXES',
      'MEASUREMENT_AND_DECLARED_CONSEQUENCE_REMAIN_SEPARATELY_REPLAYABLE_COORDINATES'
    ]),
    related_unresolved_pr_evidence:freeze({
      pr_number:677,
      hypothesis_id:'H1_CONSEQUENCE_CONSERVATION',
      relationship:'ADDITIONAL_BOUNDED_SYNTHETIC_EVIDENCE_ONLY',
      hypothesis_status_mutated:false
    }),
    reusable_relation_status:'RESEARCH_REFINEMENT_CANDIDATE_ONLY',
    reusable_relations:freeze([
      'what the measurement model permits and what declared consequence makes one admissible question preferable are separable replay coordinates',
      'candidate admissibility can remain unchanged while question selection changes because either measurement assumptions or declared decision consequences move',
      'boundary sensitivity does not imply universal instability when stable interiors are independently witnessed',
      'declared consequence replay must not be converted into human preference inference'
    ]),
    anti_equivalences:freeze([
      'measurement-model sensitivity != decision-specification sensitivity',
      'stable measurement admissibility != stable question selection',
      'stable declared loss != stable question selection under changed measurement model',
      'boundary sensitivity != universal instability',
      'loss replay != human preference inference',
      'joint replay map != information geometry',
      '#686 evidence != #677 hypothesis promotion'
    ]),
    no_scalar_crown:true,
    next_learning_action:'TEST_WHETHER_REPLAY_SENSITIVITY_ITSELF_SHOULD_GATE_QUESTION_PROPOSAL_OR_ONLY_ANNOTATE_IT_WITHOUT_CONVERTING_DECLARED_VALUE_CONTINGENCY_INTO_ABSTENTION_BY_DEFAULT',
    installed_aperture_replay_flag_mutated:false,
    promotion_authority:false,
    automatic_execution:false,
    value_inference:false,
    preference_learning:false,
    production_mutated:false,
    standalone_aperture_ui_mutated:false,
    sibling_pr_677_mutated:false,
    sibling_pr_684_mutated:false,
    human_closure_required:true,
    claims:freeze({
      universal_best_question:false,
      universal_utility:false,
      human_preference_inference:false,
      preference_learning:false,
      optimal_experimental_design:false,
      decision_theory_promotion:false,
      active_learning_optimality:false,
      information_geometry:false,
      physical_sensor_design:false,
      physical_tomography:false,
      blind_tomography:false,
      operator_tomography:false,
      autonomous_experiment_execution:false,
      connection:false,
      curvature:false,
      holonomy:false,
      berry_structure:false,
      quantum_behavior:false,
      proto_loom:false,
      production_authority:false,
      release_authority:false
    })
  });
}
