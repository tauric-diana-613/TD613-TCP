import { freeze } from '../../../engine/flowcore-pedagogue-utils.js';
import {
  normalizeProbeRow,
  singularValuePosture2,
  selectConditioningAwareWidening
} from './aperture-pedagogue-conditioning-widening.js';
import { matrixRank } from './identifiability-deficit-targeting.js';

export const APERTURE_PEDAGOGUE_COVARIANCE_WHITENED_WIDENING_SCHEMA =
  'td613.ash.a15-r0.aperture-pedagogue-covariance-whitened-widening/v0.1';

const TOLERANCE = 1e-12;
const BASE = Object.freeze([[1,0]]);
const BASE_VARIANCE = 1;
const TRUTH = Object.freeze([2,3]);
const STANDARDIZED_PERTURBATION = Object.freeze([0.01,-0.01]);
const COMPLETE_PROBES = Object.freeze([
  Object.freeze({ probe_id:'P_DUP', definition:'duplicate x', gradient:Object.freeze([1,0]), variance:1, variance_source_status:'DECLARED_SYNTHETIC' }),
  Object.freeze({ probe_id:'P_ORTH', definition:'orthogonal y but noisy', gradient:Object.freeze([0,1]), variance:100, variance_source_status:'DECLARED_SYNTHETIC' }),
  Object.freeze({ probe_id:'P_DIAG', definition:'diagonal x+y', gradient:Object.freeze([1,1]), variance:1, variance_source_status:'DECLARED_SYNTHETIC' })
]);

function round(value, digits=15){ return Number(value.toFixed(digits)); }
function finiteVariance(value){ return Number.isFinite(value) && value > 0; }
function approximatelyEqual(left,right,tolerance=TOLERANCE){ return Math.abs(left-right)<=tolerance; }
function multiply(matrix, vector){ return matrix.map(row=>row[0]*vector[0]+row[1]*vector[1]); }
function l2(left,right){ return Math.hypot(left[0]-right[0],left[1]-right[1]); }
function solve2(matrix, obs){
  const [[a,b],[c,d]]=matrix; const det=a*d-b*c;
  if(Math.abs(det)<=TOLERANCE) return null;
  return freeze([
    round((obs[0]*d-b*obs[1])/det),
    round((a*obs[1]-obs[0]*c)/det)
  ]);
}

function normalizedAugmented(probe){
  const row=normalizeProbeRow(probe.gradient);
  return { row, matrix:[[1,0],[...row]] };
}

export function whitenTwoChannelOperator(matrix, variances){
  if(!Array.isArray(matrix)||matrix.length!==2||matrix.some(row=>!Array.isArray(row)||row.length!==2||row.some(v=>!Number.isFinite(v)))) throw new TypeError('matrix must be 2x2 finite.');
  if(!Array.isArray(variances)||variances.length!==2||variances.some(v=>!finiteVariance(v))) throw new TypeError('variances must contain two positive finite values.');
  return freeze(matrix.map((row,i)=>freeze(row.map(value=>round(value/Math.sqrt(variances[i]))))));
}

export function evaluateWhitenedCandidate(probe, baseVariance=BASE_VARIANCE){
  if(!probe||typeof probe.probe_id!=='string'||!Array.isArray(probe.gradient)) throw new TypeError('probe must provide probe_id and gradient.');
  const {row,matrix}=normalizedAugmented(probe);
  const rankBefore=1;
  const rankAfter=matrixRank(matrix,TOLERANCE);
  const unwhitened=singularValuePosture2(matrix,TOLERANCE);
  if(!finiteVariance(baseVariance) || !finiteVariance(probe.variance)) {
    return freeze({
      probe_id:probe.probe_id,
      definition:probe.definition||probe.probe_id,
      normalized_gradient:row,
      variance:probe.variance ?? null,
      variance_source_status:probe.variance_source_status||'UNRESOLVED',
      rank_before:rankBefore,
      rank_after:rankAfter,
      rank_lift:rankAfter-rankBefore,
      complete_noise_geometry:false,
      sigma_min_unwhitened:unwhitened.sigma_min,
      condition_number_unwhitened:unwhitened.condition_number_2,
      sigma_min_whitened:null,
      condition_number_whitened:null,
      whitening_status:'UNRESOLVED_NOISE_GEOMETRY'
    });
  }
  const whitenedMatrix=whitenTwoChannelOperator(matrix,[baseVariance,probe.variance]);
  const whitened=singularValuePosture2(whitenedMatrix,TOLERANCE);
  return freeze({
    probe_id:probe.probe_id,
    definition:probe.definition||probe.probe_id,
    normalized_gradient:row,
    variance:probe.variance,
    variance_source_status:probe.variance_source_status||'DECLARED',
    rank_before:rankBefore,
    rank_after:rankAfter,
    rank_lift:rankAfter-rankBefore,
    complete_noise_geometry:true,
    sigma_min_unwhitened:unwhitened.sigma_min,
    condition_number_unwhitened:unwhitened.condition_number_2,
    sigma_min_whitened:whitened.sigma_min,
    condition_number_whitened:whitened.condition_number_2,
    whitening_status:'DECLARED_DIAGONAL_NOISE_GEOMETRY'
  });
}

export function selectCovarianceWhitenedWidening(probes=COMPLETE_PROBES, baseVariance=BASE_VARIANCE){
  if(!Array.isArray(probes)||probes.length===0) throw new TypeError('probes must be non-empty.');
  const scores=probes.map(probe=>evaluateWhitenedCandidate(probe,baseVariance));
  const materiallyMissing=scores.filter(score=>score.rank_lift>0 && !score.complete_noise_geometry);
  const declaredRankLifters=scores.filter(score=>score.rank_lift>0 && score.complete_noise_geometry && score.sigma_min_whitened!==null);
  const subsetRanked=[...declaredRankLifters].sort((l,r)=>
    r.sigma_min_whitened-l.sigma_min_whitened ||
    l.condition_number_whitened-r.condition_number_whitened ||
    l.probe_id.localeCompare(r.probe_id)
  );
  const subsetBest=subsetRanked[0]||null;
  if(materiallyMissing.length>0){
    return freeze({
      source_status:'DERIVED',
      authority_class:'A2_DERIVATIONAL',
      sensor_provenance_status:'PARTIALLY_DECLARED_WITH_MATERIAL_MISSINGNESS',
      complete_noise_geometry:false,
      scores:freeze(scores),
      missing_rank_lifting_probe_ids:freeze(materiallyMissing.map(item=>item.probe_id)),
      best_declared_subset_probe_id:subsetBest?.probe_id||null,
      selected_probe_id:null,
      selection_status:'NO_GLOBAL_WIDENING_SELECTION_MISSING_NOISE_GEOMETRY',
      automatic_widening_execution:false,
      held_out_used_for_selection:false,
      oracle_identity_consulted:false
    });
  }
  return freeze({
    source_status:'DERIVED',
    authority_class:'A2_DERIVATIONAL',
    sensor_provenance_status:'DECLARED_SYNTHETIC_DIAGONAL_NOISE_MODEL',
    complete_noise_geometry:true,
    scores:freeze(scores),
    missing_rank_lifting_probe_ids:freeze([]),
    best_declared_subset_probe_id:subsetBest?.probe_id||null,
    selected_probe_id:subsetBest?.probe_id||null,
    selection_status:subsetBest?'COVARIANCE_WHITENED_WIDENING_PROPOSED':'NO_RANK_AUGMENTING_CANDIDATE',
    automatic_widening_execution:false,
    held_out_used_for_selection:false,
    oracle_identity_consulted:false
  });
}

function standardizedPerturbationWitness(probe){
  const {matrix}=normalizedAugmented(probe);
  if(matrixRank(matrix,TOLERANCE)<2 || !finiteVariance(probe.variance)) return null;
  const eta=freeze([
    round(STANDARDIZED_PERTURBATION[0]*Math.sqrt(BASE_VARIANCE)),
    round(STANDARDIZED_PERTURBATION[1]*Math.sqrt(probe.variance))
  ]);
  const clean=multiply(matrix,TRUTH);
  const observed=clean.map((value,i)=>value+eta[i]);
  const reconstruction=solve2(matrix,observed);
  const error=round(l2(reconstruction,TRUTH));
  const heldTruth=TRUTH[0]-TRUTH[1];
  const heldRecon=reconstruction[0]-reconstruction[1];
  return freeze({physical_perturbation:eta,reconstruction,reconstruction_error:error,held_out_residual:round(Math.abs(heldRecon-heldTruth))});
}

export function runCovarianceWhitenedWideningGauntlet(){
  const euclideanProbes=COMPLETE_PROBES.map(({probe_id,definition,gradient})=>({probe_id,definition,gradient}));
  const euclidean=selectConditioningAwareWidening(BASE,euclideanProbes);
  const whitened=selectCovarianceWhitenedWidening(COMPLETE_PROBES,BASE_VARIANCE);
  const missingSet=COMPLETE_PROBES.map(probe=>probe.probe_id==='P_DIAG'
    ? {...probe,variance:null,variance_source_status:'UNRESOLVED'}
    : probe);
  const missing=selectCovarianceWhitenedWidening(missingSet,BASE_VARIANCE);
  const orthWitness=standardizedPerturbationWitness(COMPLETE_PROBES.find(p=>p.probe_id==='P_ORTH'));
  const diagWitness=standardizedPerturbationWitness(COMPLETE_PROBES.find(p=>p.probe_id==='P_DIAG'));
  const orth=whitened.scores.find(s=>s.probe_id==='P_ORTH');
  const diag=whitened.scores.find(s=>s.probe_id==='P_DIAG');
  const duplicate=whitened.scores.find(s=>s.probe_id==='P_DUP');

  const passed=
    euclidean.selected_probe_id==='P_ORTH' &&
    whitened.selected_probe_id==='P_DIAG' &&
    whitened.complete_noise_geometry===true &&
    orth.rank_lift===1 && diag.rank_lift===1 && duplicate.rank_lift===0 &&
    approximatelyEqual(orth.sigma_min_whitened,0.1) && approximatelyEqual(orth.condition_number_whitened,10) &&
    diag.sigma_min_whitened>0.54 && diag.sigma_min_whitened<0.55 &&
    diag.condition_number_whitened>2.41 && diag.condition_number_whitened<2.42 &&
    diag.sigma_min_whitened>orth.sigma_min_whitened &&
    missing.selected_probe_id===null &&
    missing.selection_status==='NO_GLOBAL_WIDENING_SELECTION_MISSING_NOISE_GEOMETRY' &&
    missing.missing_rank_lifting_probe_ids.includes('P_DIAG') &&
    missing.best_declared_subset_probe_id==='P_ORTH' &&
    orthWitness.reconstruction_error>0.1 && orthWitness.reconstruction_error<0.101 &&
    diagWitness.reconstruction_error>0.026 && diagWitness.reconstruction_error<0.027 &&
    orthWitness.held_out_residual>0.109 && orthWitness.held_out_residual<0.111 &&
    diagWitness.held_out_residual>0.034 && diagWitness.held_out_residual<0.035;
  if(!passed) throw new Error('Covariance-whitened widening gauntlet violated an authored expectation.');

  return freeze({
    schema:APERTURE_PEDAGOGUE_COVARIANCE_WHITENED_WIDENING_SCHEMA,
    source_status:'SIMULATED',
    authority_class:'A2_DERIVATIONAL',
    manifestly_fictional:true,
    experiment_host:'DOME_WORLD_A15_R0',
    sensor_provenance_status:'DECLARED_SYNTHETIC_NOISE_MODEL',
    euclidean_conditioning_baseline:freeze({selected_probe_id:euclidean.selected_probe_id,scope:'DECLARED_EQUAL_VARIANCE_GEOMETRY_ONLY'}),
    covariance_whitened_selection:whitened,
    missing_noise_geometry_control:missing,
    standardized_perturbation:STANDARDIZED_PERTURBATION,
    validation_witnesses:freeze({P_ORTH:orthWitness,P_DIAG:diagWitness}),
    bounded_results:freeze([
      'UNCERTAINTY_WEIGHTED_WIDENING_REFINEMENT_CANDIDATE',
      'MISSING_NOISE_GEOMETRY_ABSTENTION_SUPPORTED_IN_BOUNDED_SYNTHETIC_FIXTURE'
    ]),
    reusable_relation_status:'RESEARCH_REFINEMENT_CANDIDATE_ONLY',
    reusable_relations:freeze([
      'candidate observation geometry is relative to a declared uncertainty model; equal Euclidean angle does not imply equal practical information quality under unequal observation noise',
      'when a materially competing rank-lifting candidate lacks comparable noise geometry, a global widening recommendation should be withheld rather than silently imputing reliability'
    ]),
    anti_equivalences:freeze([
      'equal Euclidean angle != equal information quality under unequal uncertainty',
      'full rank != stable reconstruction',
      'known forward row != known observation reliability',
      'missing covariance != unit covariance',
      'widening proposal != widening execution',
      'widening != validation'
    ]),
    next_learning_action:'TEST_CORRELATED_COVARIANCE_AND_JOINT_NOISE_DIRECTIONS_BEFORE_ANY_INFORMATION_GEOMETRY_PROMOTION',
    claims:freeze({
      optimal_experimental_design:false,active_learning_theorem:false,fisher_information_optimality:false,
      physical_sensor_design:false,physical_sensor_calibration:false,physical_tomography:false,blind_tomography:false,
      operator_tomography:false,live_td613_reconstruction:false,autonomous_aperture_widening:false,
      autonomous_experiment_execution:false,correlated_noise_solution:false,connection:false,curvature:false,
      holonomy:false,quantum_behavior:false,proto_loom:false,production_authority:false
    }),
    promotion_authority:false,
    production_mutated:false,
    standalone_aperture_ui_mutated:false,
    live_ash_binding:false,
    human_closure_required:true
  });
}
