import { freeze } from '../../../engine/flowcore-pedagogue-utils.js';
import { evaluateCorrelatedNoiseCandidate } from './aperture-pedagogue-correlated-noise-geometry.js';

export const APERTURE_PEDAGOGUE_CONSEQUENCE_CONDITIONED_SELECTION_SCHEMA =
  'td613.ash.a15-r0.aperture-pedagogue-consequence-conditioned-selection/v0.1';

const TOLERANCE = 1e-12;
const BOUNDARY_RHO = 0.546918160706758;
const DOMINANCE_CONTROL_RHO = 0.9;
const FUNCTIONALS = Object.freeze({
  H_Y:Object.freeze([0,1]),
  H_DIFF:Object.freeze([1,-1]),
  H_SUM:Object.freeze([1,1])
});
const CANDIDATES = Object.freeze([
  Object.freeze({ probe_id:'P_ORTH', definition:'orthogonal y', gradient:Object.freeze([0,1]) }),
  Object.freeze({ probe_id:'P_DIAG', definition:'normalized diagonal x+y', gradient:Object.freeze([1,1]) })
]);

const LOSS_CARDS = Object.freeze({
  L_Y:Object.freeze({
    card_id:'L_Y', kind:'SINGLE_FUNCTIONAL', functional_id:'H_Y',
    declaration_status:'PREDECLARED_SYNTHETIC', aggregation_rule:'IDENTITY', posthoc:false
  }),
  L_DIFF:Object.freeze({
    card_id:'L_DIFF', kind:'SINGLE_FUNCTIONAL', functional_id:'H_DIFF',
    declaration_status:'PREDECLARED_SYNTHETIC', aggregation_rule:'IDENTITY', posthoc:false
  }),
  L_SUM:Object.freeze({
    card_id:'L_SUM', kind:'SINGLE_FUNCTIONAL', functional_id:'H_SUM',
    declaration_status:'PREDECLARED_SYNTHETIC', aggregation_rule:'IDENTITY', posthoc:false
  }),
  L_EQUAL:Object.freeze({
    card_id:'L_EQUAL', kind:'WEIGHTED_FUNCTIONALS',
    weights:Object.freeze({ H_Y:1/3, H_DIFF:1/3, H_SUM:1/3 }),
    declaration_status:'PREDECLARED_SYNTHETIC', aggregation_rule:'WEIGHTED_SUM', posthoc:false
  }),
  L_SUM_HEAVY:Object.freeze({
    card_id:'L_SUM_HEAVY', kind:'WEIGHTED_FUNCTIONALS',
    weights:Object.freeze({ H_Y:0.1, H_DIFF:0.1, H_SUM:0.8 }),
    declaration_status:'PREDECLARED_SYNTHETIC', aggregation_rule:'WEIGHTED_SUM', posthoc:false
  })
});

function round(value,digits=12){ return Number(value.toFixed(digits)); }
function covariance(rho){ return [[1,rho],[rho,1]]; }
function norm(vector){ return Math.hypot(...vector); }
function normalized(vector){ const n=norm(vector); return vector.map(value=>value/n); }
function transpose(matrix){ return matrix[0].map((_,column)=>matrix.map(row=>row[column])); }
function multiplyMatrices(left,right){
  return left.map(row => right[0].map((_,column) =>
    row.reduce((sum,value,index)=>sum+value*right[index][column],0)
  ));
}
function inverse2(matrix){
  const [[a,b],[c,d]]=matrix;
  const determinant=a*d-b*c;
  if(Math.abs(determinant)<=TOLERANCE) return null;
  return [[d/determinant,-b/determinant],[-c/determinant,a/determinant]];
}
function quadratic(row,matrix){
  const product=matrix.map(matrixRow=>matrixRow.reduce((sum,value,index)=>sum+value*row[index],0));
  return row.reduce((sum,value,index)=>sum+value*product[index],0);
}

function researchCandidate(probe,rho){
  return {
    ...probe,
    covariance:covariance(rho),
    covariance_source_status:'DECLARED_SYNTHETIC_FULL_COVARIANCE'
  };
}

function admissibility(probe,rho){
  const receipt=evaluateCorrelatedNoiseCandidate(researchCandidate(probe,rho));
  return freeze({
    probe_id:probe.probe_id,
    rank_lift:receipt.rank_lift,
    complete_joint_noise_geometry:receipt.complete_joint_noise_geometry,
    positive_definite_status:receipt.positive_definite_status,
    admissible:
      receipt.rank_lift>0 &&
      receipt.complete_joint_noise_geometry===true &&
      receipt.positive_definite_status==='VALID_SYMMETRIC_POSITIVE_DEFINITE_COVARIANCE'
  });
}

function riskVector(probe,rho){
  const A=[[1,0],normalized(probe.gradient)];
  const inv=inverse2(A);
  if(!inv) throw new Error(`${probe.probe_id} must be invertible in the declared fixture.`);
  const C=multiplyMatrices(multiplyMatrices(inv,covariance(rho)),transpose(inv));
  const risks={};
  for(const [id,row] of Object.entries(FUNCTIONALS)) risks[id]=round(quadratic(row,C));
  return freeze({ probe_id:probe.probe_id, rho:round(rho,15), risks:freeze(risks) });
}

function validateWeights(weights){
  if(!weights || typeof weights!=='object') return false;
  const entries=Object.entries(weights);
  if(entries.length===0 || entries.some(([id,value])=>!(id in FUNCTIONALS)||!Number.isFinite(value)||value<0)) return false;
  const total=entries.reduce((sum,[,value])=>sum+value,0);
  return Math.abs(total-1)<=1e-12;
}

function scoreCard(card,risk){
  if(card.kind==='SINGLE_FUNCTIONAL') return risk.risks[card.functional_id];
  if(card.kind==='WEIGHTED_FUNCTIONALS'){
    if(!validateWeights(card.weights)) throw new Error('weighted loss card must provide declared non-negative weights summing to one.');
    return round(Object.entries(card.weights).reduce((sum,[id,weight])=>sum+weight*risk.risks[id],0));
  }
  throw new Error(`unsupported loss-card kind ${card.kind}.`);
}

export function selectByDeclaredConsequence({ rho=BOUNDARY_RHO, loss_card=null, unaggregated_functionals=null }={}){
  const candidateRisks=freeze(CANDIDATES.map(probe=>riskVector(probe,rho)));
  const candidateAdmissibility=freeze(CANDIDATES.map(probe=>admissibility(probe,rho)));
  const admissibleIds=new Set(candidateAdmissibility.filter(item=>item.admissible).map(item=>item.probe_id));
  if(admissibleIds.size!==CANDIDATES.length){
    return freeze({
      status:'NO_SELECTION_CANDIDATE_ADMISSIBILITY_INCOMPLETE',
      selected_probe_id:null,
      candidate_risks:candidateRisks,
      candidate_admissibility:candidateAdmissibility,
      automatic_execution:false
    });
  }
  if(Array.isArray(unaggregated_functionals) && unaggregated_functionals.length>1){
    if(unaggregated_functionals.some(id=>!(id in FUNCTIONALS))) throw new Error('unaggregated functional must be declared.');
    const winners=new Set(unaggregated_functionals.map(id=>{
      const ranked=[...candidateRisks].sort((a,b)=>a.risks[id]-b.risks[id]||a.probe_id.localeCompare(b.probe_id));
      return ranked[0].probe_id;
    }));
    return freeze({
      status:winners.size>1?'NO_SELECTION_CONFLICTING_LOSSES_WITHOUT_AGGREGATION_RULE':'DECLARED_SET_DOMINANCE_WITHIN_UNAGGREGATED_FAMILY',
      selected_probe_id:winners.size>1?null:[...winners][0],
      declared_functionals:freeze([...unaggregated_functionals]),
      candidate_risks:candidateRisks,
      candidate_admissibility:candidateAdmissibility,
      universal_best_question:false,
      automatic_execution:false
    });
  }
  if(!loss_card){
    return freeze({
      status:'NO_SELECTION_UNDECLARED_DECISION_LOSS',
      selected_probe_id:null,
      candidate_risks:candidateRisks,
      candidate_admissibility:candidateAdmissibility,
      automatic_execution:false
    });
  }
  if(loss_card.declaration_status!=='PREDECLARED_SYNTHETIC'){
    return freeze({
      status:'REJECT_UNDECLARED_OR_INVALID_DECISION_LOSS',
      selected_probe_id:null,
      candidate_risks:candidateRisks,
      candidate_admissibility:candidateAdmissibility,
      automatic_execution:false
    });
  }
  if(loss_card.posthoc===true){
    return freeze({
      status:'POSTHOC_DECISION_LOSS_MUTATION_NOT_CONFIRMATORY',
      selected_probe_id:null,
      candidate_risks:candidateRisks,
      candidate_admissibility:candidateAdmissibility,
      automatic_execution:false
    });
  }
  if(loss_card.kind==='SINGLE_FUNCTIONAL' && !(loss_card.functional_id in FUNCTIONALS)) throw new Error('single-functional loss card must name a declared functional.');
  const scores=candidateRisks.map(risk=>freeze({
    probe_id:risk.probe_id,
    decision_loss:scoreCard(loss_card,risk)
  }));
  const ranked=[...scores].sort((a,b)=>a.decision_loss-b.decision_loss||a.probe_id.localeCompare(b.probe_id));
  return freeze({
    status:'CONSEQUENCE_CONDITIONED_QUESTION_PROPOSED',
    loss_card_id:loss_card.card_id,
    selected_probe_id:ranked[0].probe_id,
    scores:freeze(scores),
    candidate_risks:candidateRisks,
    candidate_admissibility:candidateAdmissibility,
    universal_best_question:false,
    held_out_other_consequences_used_for_selection:false,
    automatic_execution:false
  });
}

export function runAperturePedagogueConsequenceConditionedSelectionGauntlet(){
  const byY=selectByDeclaredConsequence({loss_card:LOSS_CARDS.L_Y});
  const byDiff=selectByDeclaredConsequence({loss_card:LOSS_CARDS.L_DIFF});
  const bySum=selectByDeclaredConsequence({loss_card:LOSS_CARDS.L_SUM});
  const equal=selectByDeclaredConsequence({loss_card:LOSS_CARDS.L_EQUAL});
  const sumHeavy=selectByDeclaredConsequence({loss_card:LOSS_CARDS.L_SUM_HEAVY});
  const undeclared=selectByDeclaredConsequence();
  const conflict=selectByDeclaredConsequence({unaggregated_functionals:['H_Y','H_SUM']});
  const boundedDominance=selectByDeclaredConsequence({rho:DOMINANCE_CONTROL_RHO,unaggregated_functionals:['H_Y','H_SUM']});
  const excludedDominanceCounter=selectByDeclaredConsequence({rho:DOMINANCE_CONTROL_RHO,loss_card:LOSS_CARDS.L_DIFF});
  const posthoc=selectByDeclaredConsequence({loss_card:{...LOSS_CARDS.L_SUM,card_id:'L_SUM_POSTHOC',posthoc:true}});

  const passed=
    byY.selected_probe_id==='P_ORTH' &&
    byDiff.selected_probe_id==='P_ORTH' &&
    bySum.selected_probe_id==='P_DIAG' &&
    equal.selected_probe_id==='P_ORTH' &&
    sumHeavy.selected_probe_id==='P_DIAG' &&
    undeclared.status==='NO_SELECTION_UNDECLARED_DECISION_LOSS' && undeclared.selected_probe_id===null &&
    conflict.status==='NO_SELECTION_CONFLICTING_LOSSES_WITHOUT_AGGREGATION_RULE' && conflict.selected_probe_id===null &&
    boundedDominance.status==='DECLARED_SET_DOMINANCE_WITHIN_UNAGGREGATED_FAMILY' && boundedDominance.selected_probe_id==='P_DIAG' &&
    excludedDominanceCounter.selected_probe_id==='P_ORTH' &&
    posthoc.status==='POSTHOC_DECISION_LOSS_MUTATION_NOT_CONFIRMATORY' && posthoc.selected_probe_id===null &&
    [byY,byDiff,bySum,equal,sumHeavy].every(receipt=>receipt.automatic_execution===false && receipt.universal_best_question===false);

  if(!passed) throw new Error('Aperture × Pedagogue consequence-conditioned selection gauntlet violated an authored expectation.');

  return freeze({
    schema:APERTURE_PEDAGOGUE_CONSEQUENCE_CONDITIONED_SELECTION_SCHEMA,
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    experiment_host:'DOME_WORLD_A15_R0',
    boundary_rho:BOUNDARY_RHO,
    criterion_conditioned_results:freeze({
      L_Y:byY,
      L_DIFF:byDiff,
      L_SUM:bySum,
      L_EQUAL:equal,
      L_SUM_HEAVY:sumHeavy
    }),
    refusal_controls:freeze({ undeclared, conflict, posthoc }),
    bounded_dominance_control:freeze({
      rho:DOMINANCE_CONTROL_RHO,
      declared_subset:boundedDominance,
      excluded_functional_counterexample:excludedDominanceCounter,
      classification:'DOMINANCE_WITHIN_DECLARED_CONSEQUENCE_FAMILY_DOES_NOT_TRANSFER_BEYOND_THAT_FAMILY'
    }),
    bounded_results:freeze([
      'QUESTION_SELECTION_IS_DECISION_CONSEQUENCE_RELATIVE_IN_BOUNDED_SYNTHETIC_FIXTURE',
      'UNDECLARED_DECISION_LOSS_REFUSES_UNIVERSAL_QUESTION_SELECTION',
      'CONFLICTING_UNAGGREGATED_CONSEQUENCES_REFUSE_FORCED_SELECTION',
      'PREDECLARED_WEIGHTING_CAN_CHANGE_SELECTED_QUESTION_WITHOUT_CREATING_UNIVERSAL_OPTIMALITY',
      'POSTHOC_DECISION_LOSS_MUTATION_NOT_CONFIRMATORY',
      'DECLARED_FAMILY_DOMINANCE_DOES_NOT_TRANSFER_TO_EXCLUDED_CONSEQUENCES'
    ]),
    related_unresolved_pr_evidence:freeze({
      pr_number:677,
      hypothesis_id:'H1_CONSEQUENCE_CONSERVATION',
      relationship:'ADDITIONAL_BOUNDED_SYNTHETIC_EVIDENCE_ONLY',
      hypothesis_status_mutated:false
    }),
    reusable_relation_status:'RESEARCH_REFINEMENT_CANDIDATE_ONLY',
    reusable_relations:freeze([
      'best next question is undefined without a declared decision consequence once admissible downstream consequences disagree',
      'predeclared loss can condition question selection without transferring universal value or execution authority',
      'dominance over a declared consequence subset does not imply dominance over excluded consequences',
      'posthoc value-function mutation cannot retroactively make a selection confirmatory'
    ]),
    anti_equivalences:freeze([
      'measurement admissibility != decision value',
      'selected under declared loss != universally best',
      'predeclared aggregation != natural law',
      'declared-subset dominance != universal dominance',
      'posthoc loss switch != confirmatory evidence',
      '#686 evidence != #677 hypothesis promotion'
    ]),
    no_scalar_crown:true,
    next_learning_action:'TEST_DECISION_LOSS_REPLAY_STABILITY_AND_MULTI_AXIS_ENVELOPE_INTERSECTIONS_BEFORE_ANY_DECISION_THEORY_OR_OPTIMAL_DESIGN_PROMOTION',
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
