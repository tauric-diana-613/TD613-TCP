import { freeze } from '../../../engine/flowcore-pedagogue-utils.js';
import {
  normalizeProbeRow,
  singularValuePosture2
} from './aperture-pedagogue-conditioning-widening.js';
import {
  selectCovarianceWhitenedWidening
} from './aperture-pedagogue-covariance-whitened-widening.js';
import { matrixRank } from './identifiability-deficit-targeting.js';

export const APERTURE_PEDAGOGUE_CORRELATED_NOISE_GEOMETRY_SCHEMA =
  'td613.ash.a15-r0.aperture-pedagogue-correlated-noise-geometry/v0.1';

const TOLERANCE = 1e-12;
const BASE = Object.freeze([[1,0]]);
const TRUTH = Object.freeze([2,3]);
const RHO = 0.9;
const FULL_COVARIANCE = Object.freeze([
  Object.freeze([1,RHO]),
  Object.freeze([RHO,1])
]);
const STANDARDIZED_PERTURBATION = Object.freeze([
  0.01 / Math.sqrt(2),
  0.01 / Math.sqrt(2)
]);
const COMPLETE_PROBES = Object.freeze([
  Object.freeze({ probe_id:'P_DUP', definition:'duplicate x', gradient:Object.freeze([1,0]), covariance:FULL_COVARIANCE, covariance_source_status:'DECLARED_SYNTHETIC_FULL_COVARIANCE' }),
  Object.freeze({ probe_id:'P_ORTH', definition:'orthogonal y', gradient:Object.freeze([0,1]), covariance:FULL_COVARIANCE, covariance_source_status:'DECLARED_SYNTHETIC_FULL_COVARIANCE' }),
  Object.freeze({ probe_id:'P_DIAG', definition:'diagonal x+y', gradient:Object.freeze([1,1]), covariance:FULL_COVARIANCE, covariance_source_status:'DECLARED_SYNTHETIC_FULL_COVARIANCE' })
]);

function round(value,digits=15){ return Number(value.toFixed(digits)); }
function finite(value){ return Number.isFinite(value); }
function multiply(matrix,vector){ return matrix.map(row=>row[0]*vector[0]+row[1]*vector[1]); }
function l2(left,right){ return Math.hypot(left[0]-right[0],left[1]-right[1]); }
function normalizedAugmented(probe){
  const row=normalizeProbeRow(probe.gradient);
  return { row, matrix:[[1,0],[...row]] };
}
function solve2(matrix,obs){
  const [[a,b],[c,d]]=matrix;
  const det=a*d-b*c;
  if(Math.abs(det)<=TOLERANCE) return null;
  return freeze([
    round((obs[0]*d-b*obs[1])/det),
    round((a*obs[1]-obs[0]*c)/det)
  ]);
}

export function classifyCovariance2(covariance,tolerance=TOLERANCE){
  if(!Array.isArray(covariance)||covariance.length!==2||covariance.some(row=>!Array.isArray(row)||row.length!==2)){
    return freeze({status:'INVALID_NOISE_GEOMETRY_SHAPE',positive_definite:false});
  }
  const [[a,b],[c,d]]=covariance;
  if(![a,b,c,d].every(finite)) return freeze({status:'INVALID_NOISE_GEOMETRY_NONFINITE',positive_definite:false});
  if(Math.abs(b-c)>tolerance) return freeze({status:'INVALID_NOISE_GEOMETRY_NONSYMMETRIC',positive_definite:false});
  const determinant=a*d-b*c;
  if(a<=tolerance || d<=tolerance || determinant<=tolerance){
    return freeze({status:'INVALID_NOISE_GEOMETRY_NOT_POSITIVE_DEFINITE',positive_definite:false,determinant:round(determinant)});
  }
  const trace=a+d;
  const discriminant=Math.sqrt(Math.max(0,(a-d)**2+4*b*c));
  const eigenMin=(trace-discriminant)/2;
  const eigenMax=(trace+discriminant)/2;
  return freeze({
    status:'VALID_SYMMETRIC_POSITIVE_DEFINITE_COVARIANCE',
    positive_definite:true,
    determinant:round(determinant),
    eigen_min:round(eigenMin),
    eigen_max:round(eigenMax),
    correlation:round(b/Math.sqrt(a*d))
  });
}

export function cholesky2(covariance,tolerance=TOLERANCE){
  const classification=classifyCovariance2(covariance,tolerance);
  if(!classification.positive_definite){
    const error=new Error(classification.status);
    error.code=classification.status;
    throw error;
  }
  const [[a,b],[,d]]=covariance;
  const l11=Math.sqrt(a);
  const l21=b/l11;
  const residual=d-l21*l21;
  if(residual<=tolerance){
    const error=new Error('INVALID_NOISE_GEOMETRY_NOT_POSITIVE_DEFINITE');
    error.code='INVALID_NOISE_GEOMETRY_NOT_POSITIVE_DEFINITE';
    throw error;
  }
  return freeze([
    freeze([round(l11),0]),
    freeze([round(l21),round(Math.sqrt(residual))])
  ]);
}

export function whitenByFullCovariance(matrix,covariance){
  if(!Array.isArray(matrix)||matrix.length!==2||matrix.some(row=>!Array.isArray(row)||row.length!==2||row.some(value=>!finite(value)))){
    throw new TypeError('matrix must be 2x2 finite.');
  }
  const L=cholesky2(covariance);
  const [[l11],[l21,l22]]=L;
  const first=matrix[0].map(value=>value/l11);
  const second=matrix[1].map((value,index)=>(value-l21*first[index])/l22);
  return freeze([
    freeze(first.map(value=>round(value))),
    freeze(second.map(value=>round(value)))
  ]);
}

export function evaluateCorrelatedNoiseCandidate(probe){
  if(!probe||typeof probe.probe_id!=='string'||!Array.isArray(probe.gradient)) throw new TypeError('probe must provide probe_id and gradient.');
  const {row,matrix}=normalizedAugmented(probe);
  const rankBefore=1;
  const rankAfter=matrixRank(matrix,TOLERANCE);
  const diagonalModel=singularValuePosture2(matrix,TOLERANCE);
  const sourceStatus=probe.covariance_source_status||'UNRESOLVED';
  if(sourceStatus==='UNRESOLVED' || probe.covariance==null){
    return freeze({
      probe_id:probe.probe_id,
      definition:probe.definition||probe.probe_id,
      normalized_gradient:row,
      covariance_source_status:'UNRESOLVED',
      covariance_matrix:null,
      marginal_variances:freeze([1,1]),
      correlation:null,
      positive_definite_status:'UNRESOLVED',
      rank_before:rankBefore,
      rank_after:rankAfter,
      rank_lift:rankAfter-rankBefore,
      complete_joint_noise_geometry:false,
      sigma_min_diagonal_model:diagonalModel.sigma_min,
      condition_number_diagonal_model:diagonalModel.condition_number_2,
      sigma_min_full_covariance:null,
      condition_number_full_covariance:null,
      whitening_status:'UNRESOLVED_JOINT_NOISE_GEOMETRY'
    });
  }
  const covarianceClass=classifyCovariance2(probe.covariance);
  if(!covarianceClass.positive_definite){
    return freeze({
      probe_id:probe.probe_id,
      definition:probe.definition||probe.probe_id,
      normalized_gradient:row,
      covariance_source_status:sourceStatus,
      covariance_matrix:freeze(probe.covariance.map(r=>freeze([...r]))),
      marginal_variances:freeze([probe.covariance[0]?.[0]??null,probe.covariance[1]?.[1]??null]),
      correlation:null,
      positive_definite_status:covarianceClass.status,
      rank_before:rankBefore,
      rank_after:rankAfter,
      rank_lift:rankAfter-rankBefore,
      complete_joint_noise_geometry:false,
      sigma_min_diagonal_model:diagonalModel.sigma_min,
      condition_number_diagonal_model:diagonalModel.condition_number_2,
      sigma_min_full_covariance:null,
      condition_number_full_covariance:null,
      whitening_status:covarianceClass.status
    });
  }
  const whitened=whitenByFullCovariance(matrix,probe.covariance);
  const fullPosture=singularValuePosture2(whitened,TOLERANCE);
  return freeze({
    probe_id:probe.probe_id,
    definition:probe.definition||probe.probe_id,
    normalized_gradient:row,
    covariance_source_status:sourceStatus,
    covariance_matrix:freeze(probe.covariance.map(r=>freeze([...r]))),
    marginal_variances:freeze([round(probe.covariance[0][0]),round(probe.covariance[1][1])]),
    correlation:covarianceClass.correlation,
    positive_definite_status:covarianceClass.status,
    rank_before:rankBefore,
    rank_after:rankAfter,
    rank_lift:rankAfter-rankBefore,
    complete_joint_noise_geometry:true,
    sigma_min_diagonal_model:diagonalModel.sigma_min,
    condition_number_diagonal_model:diagonalModel.condition_number_2,
    sigma_min_full_covariance:fullPosture.sigma_min,
    sigma_max_full_covariance:fullPosture.sigma_max,
    condition_number_full_covariance:fullPosture.condition_number_2,
    whitening_status:'FULL_COVARIANCE_CHOLESKY_WHITENED'
  });
}

export function selectCorrelatedNoiseWidening(probes=COMPLETE_PROBES){
  if(!Array.isArray(probes)||probes.length===0) throw new TypeError('probes must be non-empty.');
  const scores=probes.map(evaluateCorrelatedNoiseCandidate);
  const invalid=scores.filter(score=>score.rank_lift>0 && score.positive_definite_status?.startsWith('INVALID_NOISE_GEOMETRY_'));
  if(invalid.length>0){
    return freeze({
      scores:freeze(scores),
      selected_probe_id:null,
      selection_status:'INVALID_NOISE_GEOMETRY_PRESENT_NO_SELECTION',
      invalid_probe_ids:freeze(invalid.map(item=>item.probe_id)),
      missing_joint_noise_probe_ids:freeze([]),
      automatic_widening_execution:false,
      held_out_used_for_selection:false,
      oracle_identity_consulted:false
    });
  }
  const missing=scores.filter(score=>score.rank_lift>0 && !score.complete_joint_noise_geometry);
  const declared=scores.filter(score=>score.rank_lift>0 && score.complete_joint_noise_geometry && score.sigma_min_full_covariance!==null);
  const ranked=[...declared].sort((left,right)=>
    right.sigma_min_full_covariance-left.sigma_min_full_covariance ||
    left.condition_number_full_covariance-right.condition_number_full_covariance ||
    left.probe_id.localeCompare(right.probe_id)
  );
  const subsetBest=ranked[0]||null;
  if(missing.length>0){
    return freeze({
      scores:freeze(scores),
      selected_probe_id:null,
      best_declared_subset_probe_id:subsetBest?.probe_id||null,
      selection_status:'NO_GLOBAL_WIDENING_SELECTION_MISSING_JOINT_NOISE_GEOMETRY',
      invalid_probe_ids:freeze([]),
      missing_joint_noise_probe_ids:freeze(missing.map(item=>item.probe_id)),
      automatic_widening_execution:false,
      held_out_used_for_selection:false,
      oracle_identity_consulted:false
    });
  }
  return freeze({
    scores:freeze(scores),
    selected_probe_id:subsetBest?.probe_id||null,
    best_declared_subset_probe_id:subsetBest?.probe_id||null,
    selection_status:subsetBest?'FULL_COVARIANCE_WIDENING_PROPOSED':'NO_RANK_AUGMENTING_CANDIDATE',
    invalid_probe_ids:freeze([]),
    missing_joint_noise_probe_ids:freeze([]),
    automatic_widening_execution:false,
    held_out_used_for_selection:false,
    oracle_identity_consulted:false
  });
}

function correlatedPerturbationWitness(probe){
  const {matrix}=normalizedAugmented(probe);
  if(matrixRank(matrix,TOLERANCE)<2) return null;
  const L=cholesky2(probe.covariance);
  const eta=freeze([
    round(L[0][0]*STANDARDIZED_PERTURBATION[0]+L[0][1]*STANDARDIZED_PERTURBATION[1]),
    round(L[1][0]*STANDARDIZED_PERTURBATION[0]+L[1][1]*STANDARDIZED_PERTURBATION[1])
  ]);
  const clean=multiply(matrix,TRUTH);
  const observed=clean.map((value,index)=>value+eta[index]);
  const reconstruction=solve2(matrix,observed);
  const error=round(l2(reconstruction,TRUTH));
  const heldTruth=TRUTH[0]-TRUTH[1];
  const heldRecon=reconstruction[0]-reconstruction[1];
  return freeze({
    standardized_perturbation:STANDARDIZED_PERTURBATION,
    physical_perturbation:eta,
    reconstruction,
    reconstruction_error:error,
    held_out_residual:round(Math.abs(heldRecon-heldTruth))
  });
}

export function runCorrelatedNoiseGeometryGauntlet(){
  const diagonalBaseline=selectCovarianceWhitenedWidening(COMPLETE_PROBES.map(probe=>({
    probe_id:probe.probe_id,
    definition:probe.definition,
    gradient:probe.gradient,
    variance:1,
    variance_source_status:'DECLARED_SYNTHETIC_DIAGONAL_ONLY'
  })),1);
  const full=selectCorrelatedNoiseWidening(COMPLETE_PROBES);
  const orth=full.scores.find(item=>item.probe_id==='P_ORTH');
  const diag=full.scores.find(item=>item.probe_id==='P_DIAG');

  const missingSet=COMPLETE_PROBES.map(probe=>probe.probe_id==='P_DIAG'
    ? {...probe,covariance:null,covariance_source_status:'UNRESOLVED'}
    : probe);
  const missing=selectCorrelatedNoiseWidening(missingSet);

  const invalidProbe={
    probe_id:'P_BAD',
    definition:'invalid covariance hostile control',
    gradient:[1,1],
    covariance:[[1,1.05],[1.05,1]],
    covariance_source_status:'DECLARED_SYNTHETIC_INVALID_CONTROL'
  };
  const invalidEvaluation=evaluateCorrelatedNoiseCandidate(invalidProbe);
  const invalidSelection=selectCorrelatedNoiseWidening([COMPLETE_PROBES[1],invalidProbe]);

  const orthWitness=correlatedPerturbationWitness(COMPLETE_PROBES.find(item=>item.probe_id==='P_ORTH'));
  const diagWitness=correlatedPerturbationWitness(COMPLETE_PROBES.find(item=>item.probe_id==='P_DIAG'));

  const passed=
    diagonalBaseline.selected_probe_id==='P_ORTH' &&
    full.selected_probe_id==='P_DIAG' &&
    orth.rank_lift===1 && diag.rank_lift===1 &&
    orth.marginal_variances[0]===1 && orth.marginal_variances[1]===1 &&
    diag.marginal_variances[0]===1 && diag.marginal_variances[1]===1 &&
    orth.correlation===0.9 && diag.correlation===0.9 &&
    orth.sigma_min_full_covariance>0.72 && orth.sigma_min_full_covariance<0.73 &&
    diag.sigma_min_full_covariance>0.94 && diag.sigma_min_full_covariance<0.95 &&
    diag.sigma_min_full_covariance>orth.sigma_min_full_covariance &&
    orth.condition_number_full_covariance>4.35 && orth.condition_number_full_covariance<4.37 &&
    diag.condition_number_full_covariance>1.8 && diag.condition_number_full_covariance<1.81 &&
    missing.selected_probe_id===null &&
    missing.selection_status==='NO_GLOBAL_WIDENING_SELECTION_MISSING_JOINT_NOISE_GEOMETRY' &&
    missing.missing_joint_noise_probe_ids.includes('P_DIAG') &&
    missing.best_declared_subset_probe_id==='P_ORTH' &&
    invalidEvaluation.positive_definite_status==='INVALID_NOISE_GEOMETRY_NOT_POSITIVE_DEFINITE' &&
    invalidSelection.selected_probe_id===null &&
    invalidSelection.selection_status==='INVALID_NOISE_GEOMETRY_PRESENT_NO_SELECTION' &&
    diagWitness.reconstruction_error<orthWitness.reconstruction_error &&
    diagWitness.held_out_residual<orthWitness.held_out_residual;

  if(!passed) throw new Error('Correlated noise geometry gauntlet violated an authored expectation.');

  return freeze({
    schema:APERTURE_PEDAGOGUE_CORRELATED_NOISE_GEOMETRY_SCHEMA,
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    experiment_host:'DOME_WORLD_A15_R0',
    diagonal_only_baseline:freeze({
      selected_probe_id:diagonalBaseline.selected_probe_id,
      marginal_variances:freeze([1,1]),
      off_diagonal_covariance_used:false
    }),
    full_covariance_selection:full,
    missing_joint_noise_geometry_control:missing,
    invalid_covariance_control:freeze({evaluation:invalidEvaluation,selection:invalidSelection}),
    validation_witnesses:freeze({P_ORTH:orthWitness,P_DIAG:diagWitness}),
    bounded_results:freeze([
      'CORRELATED_NOISE_WIDENING_REFINEMENT_CANDIDATE',
      'MISSING_JOINT_NOISE_GEOMETRY_ABSTENTION_SUPPORTED_IN_BOUNDED_SYNTHETIC_FIXTURE'
    ]),
    reusable_relation_status:'RESEARCH_REFINEMENT_CANDIDATE_ONLY',
    reusable_relations:freeze([
      'structurally different probe directions can remain statistically coupled through a shared noise direction; operator diversity and uncertainty diversity are non-equivalent',
      'identical marginal variances do not determine joint noise geometry; off-diagonal covariance can change a widening preference',
      'when disposition-changing correlation is unresolved, independence may not be silently substituted'
    ]),
    anti_equivalences:freeze([
      'different probe directions != independent noise directions',
      'same marginal variances != same joint noise geometry',
      'diagonal covariance != full covariance',
      'known variances != known correlations',
      'positive rank lift != independent evidence',
      'full rank != stable reconstruction',
      'widening proposal != widening execution',
      'widening != validation'
    ]),
    next_learning_action:'TEST_JOINT_OPERATOR_AND_UNCERTAINTY_DIVERSITY_AS_ONE_EXPERIMENT_DESIGN_STATE_WITHOUT_PROMOTING_TO_INFORMATION_GEOMETRY',
    claims:freeze({
      optimal_experimental_design:false,active_learning_theorem:false,fisher_information_optimality:false,
      information_geometry:false,physical_sensor_design:false,physical_sensor_calibration:false,
      physical_tomography:false,blind_tomography:false,operator_tomography:false,live_td613_reconstruction:false,
      autonomous_aperture_widening:false,autonomous_experiment_execution:false,connection:false,curvature:false,
      holonomy:false,quantum_behavior:false,proto_loom:false,production_authority:false
    }),
    promotion_authority:false,
    production_mutated:false,
    standalone_aperture_ui_mutated:false,
    live_ash_binding:false,
    human_closure_required:true
  });
}
