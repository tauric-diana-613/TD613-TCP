import {clamp01,digestRecord,nowIso,uniqueStrings,withoutKeys} from './ash-stretch12-r02-common.js';

export const PROJECTION_MANIFEST_SCHEMA='td613.ash.projection-manifest/v0.1';
export const PROJECTION_RANK_SCHEMA='td613.ash.projection-rank-receipt/v0.1';
export const READER_CALIBRATION_SCHEMA='td613.aperture.reader-calibration/v0.1';
export const READER_CONTROL_BANK_SCHEMA='td613.aperture.reader-control-bank/v0.1';
export const JOINING_KEY_ASSAY_SCHEMA='td613.aperture.joining-key-assay/v0.1';
export const METADATA_ASSAY_SCHEMA='td613.aperture.metadata-reconstruction-assay/v0.1';
export const SEMANTIC_ASSAY_SCHEMA='td613.aperture.semantic-reconstruction-assay/v0.2';
export const TOMOGRAPHY_SCHEMA='td613.aperture.heterostratigraphic-tomography/v0.1';
export const ASSAY_REPLAY_SCHEMA='td613.aperture.reconstruction-assay-replay/v0.1';
export const PORTABLE_ASSURANCE_SCHEMA='td613.ash.portable-assurance-state/v0.1';

export const PROTECTED_DIMENSIONS=Object.freeze(['identity','institution','source_identity','relationships','room_bridges','chronology','document_provenance','source_style_linkage','hypotheses','next_actions','lifecycle_state','rare_fact_conjunctions','metadata_linkage','workspace_membership','recipient_identity','key_topology']);
export const STRATA=Object.freeze(['content','projection','cryptographic','endpoint','provider','reader','metadata','temporal','custody','human']);
const subject=value=>withoutKeys(value,['record_digest']);

function matrixRank(matrix,tolerance=1e-10){
  const rows=matrix.map(row=>row.map(Number));if(!rows.length||!rows[0]?.length)return 0;
  const width=rows[0].length;if(rows.some(row=>row.length!==width))throw new TypeError('Matrix rows must have equal width.');
  let rank=0;
  for(let col=0;col<width&&rank<rows.length;col+=1){
    let pivot=rank;for(let row=rank+1;row<rows.length;row+=1)if(Math.abs(rows[row][col])>Math.abs(rows[pivot][col]))pivot=row;
    if(Math.abs(rows[pivot][col])<=tolerance)continue;[rows[rank],rows[pivot]]=[rows[pivot],rows[rank]];
    const divisor=rows[rank][col];for(let c=col;c<width;c+=1)rows[rank][c]/=divisor;
    for(let row=0;row<rows.length;row+=1){if(row===rank)continue;const factor=rows[row][col];for(let c=col;c<width;c+=1)rows[row][c]-=factor*rows[rank][c];}
    rank+=1;
  }
  return rank;
}

function vectorForDimension(protectedDimensions,included,transforms){return protectedDimensions.map(dimension=>{if(!included.includes(dimension))return 0;const transform=transforms.find(item=>item.dimension===dimension);if(!transform)return 1;if(transform.operation==='OMIT')return 0;if(transform.operation==='COARSEN')return 0.5;if(transform.operation==='SURROGATE')return 0.25;return 1;});}

export async function compileProjectionManifest(input,options={}){
  if('outbound_rank'in input||'inbound_rank'in input||'portable_anisotropy_demonstrated'in input)throw new TypeError('Caller-supplied rank and demonstration booleans are forbidden.');
  const protectedDimensions=uniqueStrings(input.protected_dimensions);if(!protectedDimensions.length)throw new TypeError('Protected dimensions are required.');
  if(protectedDimensions.some(dimension=>!PROTECTED_DIMENSIONS.includes(dimension)))throw new TypeError('Unknown protected dimension.');
  const included=uniqueStrings(input.included_dimensions),transformations=[...(input.transformations||[])].map(item=>({dimension:String(item.dimension),operation:String(item.operation||'KEEP').toUpperCase(),basis:String(item.basis||'')}));
  const projectionVector=vectorForDimension(protectedDimensions,included,transformations);
  const matrix=protectedDimensions.map((dimension,index)=>protectedDimensions.map((_,column)=>column===index?projectionVector[index]:0));
  const manifest={schema:PROJECTION_MANIFEST_SCHEMA,schema_version:'0.1',record_id:input.record_id||`projection:${input.case_id}:${Date.now()}`,case_id:String(input.case_id||''),created_at:input.created_at||nowIso(options.now),source_status:String(input.source_status||'DERIVED'),purpose_reference:String(input.purpose_reference||''),source_commitment:String(input.source_commitment||''),environment_reference:String(input.environment_reference||''),protected_dimensions:protectedDimensions,included_dimensions:included,transformations,canonical_projection_matrix:matrix,compiler_derived_rank:matrixRank(matrix),caller_rank_accepted:false,complete_case_projection:false,missingness:uniqueStrings(input.missingness),uncertainty:uniqueStrings(input.uncertainty),claim_ceiling:'PROJECTION_STRUCTURE_ONLY',operator_closure:String(input.operator_closure||'OPEN')};
  manifest.record_digest=await digestRecord(PROJECTION_MANIFEST_SCHEMA,subject(manifest),options.cryptoImpl);return Object.freeze(manifest);
}

export async function compileContinuityBasis(input,options={}){
  if('inbound_rank'in input)throw new TypeError('Caller-supplied inbound rank is forbidden.');
  const dimensions=uniqueStrings(input.authenticated_dimensions),rows=dimensions.map((dimension,index)=>dimensions.map((_,column)=>index===column?1:0));
  const basis={schema:'td613.ash.authenticated-continuity-basis/v0.1',schema_version:'0.1',record_id:input.record_id||`continuity-basis:${input.case_id}`,case_id:String(input.case_id||''),created_at:input.created_at||nowIso(options.now),source_status:'DERIVED',authenticated_dimensions:dimensions,canonical_continuity_matrix:rows,compiler_derived_rank:matrixRank(rows),origin_reference:String(input.origin_reference||''),custody_reference:String(input.custody_reference||''),cryptographic_verification_reference:String(input.cryptographic_verification_reference||''),missingness:uniqueStrings(input.missingness),uncertainty:uniqueStrings(input.uncertainty),claim_ceiling:'AUTHENTICATED_RETURN_BASIS_ONLY',operator_closure:'OPEN'};
  basis.record_digest=await digestRecord(basis.schema,subject(basis),options.cryptoImpl);return Object.freeze(basis);
}

export async function compileProjectionRankReceipt(projectionManifest,continuityBasis,options={}){
  if(projectionManifest.schema!==PROJECTION_MANIFEST_SCHEMA)throw new TypeError('Projection manifest required.');
  const receipt={schema:PROJECTION_RANK_SCHEMA,schema_version:'0.1',record_id:`rank:${projectionManifest.record_id}`,case_id:projectionManifest.case_id,created_at:nowIso(options.now),source_status:'DERIVED',projection_reference:projectionManifest.record_id,projection_digest:projectionManifest.record_digest,continuity_reference:continuityBasis.record_id,continuity_digest:continuityBasis.record_digest,outbound_rank:projectionManifest.compiler_derived_rank,inbound_rank:continuityBasis.compiler_derived_rank,directional_condition:continuityBasis.compiler_derived_rank>projectionManifest.compiler_derived_rank,caller_rank_accepted:false,portable_anisotropy_demonstrated:null,promotion_authority:false,missingness:uniqueStrings([...projectionManifest.missingness,...continuityBasis.missingness]),uncertainty:uniqueStrings([...projectionManifest.uncertainty,...continuityBasis.uncertainty]),claim_ceiling:'COMPILER_DERIVED_DIRECTIONAL_RANK_ONLY',operator_closure:'OPEN'};
  receipt.record_digest=await digestRecord(PROJECTION_RANK_SCHEMA,subject(receipt),options.cryptoImpl);return Object.freeze(receipt);
}

function controlStats(trials){const by=kind=>trials.filter(trial=>trial.control_class===kind),mean=values=>values.length?values.reduce((a,b)=>a+b,0)/values.length:null;return {positive_mean:mean(by('POSITIVE').map(item=>item.score)),benign_mean:mean(by('MATCHED_BENIGN').map(item=>item.score)),null_mean:mean(by('NULL').map(item=>item.score)),heldout_mean:mean(by('HELD_OUT').map(item=>item.score)),replicate_count:trials.length,positive_count:by('POSITIVE').length,benign_count:by('MATCHED_BENIGN').length,null_count:by('NULL').length,heldout_count:by('HELD_OUT').length};}

export async function compileReaderCalibration(input,options={}){
  const trials=[...(input.trials||[])].map((trial,index)=>({trial_id:String(trial.trial_id||`trial:${index}`),control_class:String(trial.control_class||'UNCLASSIFIED').toUpperCase(),score:clamp01(trial.score),source_status:String(trial.source_status||'OBSERVED'),held_out:trial.control_class==='HELD_OUT'||trial.held_out===true,missingness:uniqueStrings(trial.missingness)}));
  const stats=controlStats(trials),required=stats.positive_count>0&&stats.benign_count>0&&stats.null_count>0&&stats.heldout_count>0&&stats.replicate_count>=Number(input.minimum_replicates||8);
  const discrimination=stats.positive_mean===null||stats.benign_mean===null?null:stats.positive_mean-stats.benign_mean;
  const heldoutError=stats.heldout_mean===null?null:Math.abs(stats.heldout_mean-Number(input.expected_heldout_score??stats.heldout_mean));
  const status=required&&discrimination>=Number(input.minimum_discrimination||0.2)&&heldoutError<=Number(input.maximum_heldout_error||0.2)?'CALIBRATED_FOR_DECLARED_FIXTURE':'CALIBRATION_HELD';
  const calibration={schema:READER_CALIBRATION_SCHEMA,schema_version:'0.1',record_id:input.record_id||`reader-calibration:${input.reader_id}`,case_id:String(input.case_id||''),created_at:input.created_at||nowIso(options.now),source_status:String(input.source_status||'DERIVED'),reader_id:String(input.reader_id||''),reader_class:String(input.reader_class||''),reader_version:String(input.reader_version||''),implementation_digest:String(input.implementation_digest||''),context_class:String(input.context_class||'DECLARED'),corpus_declaration:uniqueStrings(input.corpus_declaration),execution_environment:String(input.execution_environment||''),acquisition_route:String(input.acquisition_route||'LOCAL'),controlled_variables:uniqueStrings(input.controlled_variables),blind_spots:uniqueStrings(input.blind_spots),trials,statistics:{...stats,discrimination,heldout_error:heldoutError},status,promotion_eligible:status==='CALIBRATED_FOR_DECLARED_FIXTURE'&&input.source_status!=='CONSTRUCTED',unknown_readers:'UNMEASURED',missingness:uniqueStrings([...(input.missingness||[]),...trials.flatMap(item=>item.missingness)]),uncertainty:uniqueStrings(input.uncertainty),claim_ceiling:'DECLARED_READER_CALIBRATION_ONLY',operator_closure:String(input.operator_closure||'OPEN')};
  calibration.record_digest=await digestRecord(READER_CALIBRATION_SCHEMA,subject(calibration),options.cryptoImpl);return Object.freeze(calibration);
}

export async function compileControlBank(input,options={}){
  const controls=[...(input.controls||[])].map(control=>({control_id:String(control.control_id),control_class:String(control.control_class),fixture_digest:String(control.fixture_digest),route_order:String(control.route_order||'BASELINE'),source_status:String(control.source_status||'CONSTRUCTED')}));
  const classes=new Set(controls.map(item=>item.control_class));
  const bank={schema:READER_CONTROL_BANK_SCHEMA,schema_version:'0.1',record_id:input.record_id||`control-bank:${input.case_id}`,case_id:String(input.case_id||''),created_at:input.created_at||nowIso(options.now),source_status:String(input.source_status||'CONSTRUCTED'),controls,required_classes_present:['POSITIVE','MATCHED_BENIGN','NULL','MISSING','CONTRADICTORY','HELD_OUT','SHUFFLED','TRUNCATED','ROUTE_ORDER','DELAYED_DISCLOSURE','CROSS_SESSION','SOURCE_DRIFT'].every(item=>classes.has(item)),promotion_authority:false,missingness:uniqueStrings(input.missingness),uncertainty:uniqueStrings(input.uncertainty),claim_ceiling:'CONTROL_FIXTURE_REGISTRY_ONLY',operator_closure:'OPEN'};
  bank.record_digest=await digestRecord(READER_CONTROL_BANK_SCHEMA,subject(bank),options.cryptoImpl);return Object.freeze(bank);
}

function interval(values){if(!values.length)return {point:null,lower:null,upper:null,count:0};const sorted=[...values].sort((a,b)=>a-b),point=sorted.reduce((a,b)=>a+b,0)/sorted.length;return {point,lower:sorted[Math.floor((sorted.length-1)*0.1)],upper:sorted[Math.ceil((sorted.length-1)*0.9)],count:sorted.length};}

export async function compileSemanticAssay(input,options={}){
  const calibration=input.calibration,results={};
  for(const dimension of uniqueStrings(input.protected_dimensions)){const values=(input.trials||[]).filter(trial=>trial.dimension===dimension).map(trial=>clamp01(trial.recovery));results[dimension]={...interval(values),threshold:Number(input.thresholds?.[dimension]??0.2),status:values.length?'OBSERVED':'UNOBSERVED'};}
  const calibrated=calibration?.status==='CALIBRATED_FOR_DECLARED_FIXTURE',heldoutPresent=(input.trials||[]).some(trial=>trial.held_out===true),controlsPresent=(input.trials||[]).some(trial=>trial.control===true);
  const exceeds=Object.entries(results).filter(([,value])=>value.upper!==null&&value.upper>value.threshold).map(([dimension])=>dimension);
  const assay={schema:SEMANTIC_ASSAY_SCHEMA,schema_version:'0.2',record_id:input.record_id||`semantic-assay:${input.case_id}:${Date.now()}`,case_id:String(input.case_id||''),created_at:input.created_at||nowIso(options.now),source_status:String(input.source_status||'OBSERVED'),environment_reference:String(input.environment_reference||''),projection_reference:String(input.projection_reference||''),reader_calibration_reference:calibration?.record_id||null,reader_calibration_digest:calibration?.record_digest||null,protected_dimensions:uniqueStrings(input.protected_dimensions),results,controls_present:controlsPresent,heldout_present:heldoutPresent,replicate_count:(input.trials||[]).length,threshold_exceedances:exceeds,marginal_consistency:String(input.marginal_consistency||'UNMEASURED'),rare_combination_ablation_reference:input.rare_combination_ablation_reference||null,joining_key_assay_reference:input.joining_key_assay_reference||null,unknown_readers:'UNMEASURED',recommendation:!calibrated||calibration.promotion_eligible!==true||!heldoutPresent||!controlsPresent?'NO_PROMOTION':exceeds.length?'COOL_AND_RETEST':'ELIGIBLE_FOR_COMPONENTWISE_REVIEW',promotion_eligible:calibrated&&calibration.promotion_eligible===true&&heldoutPresent&&controlsPresent&&exceeds.length===0,no_identity_inference:true,no_truth_inference:true,no_causation_inference:true,missingness:uniqueStrings(input.missingness),uncertainty:uniqueStrings(input.uncertainty),claim_ceiling:'DECLARED_READER_AND_ENVIRONMENT_ONLY',operator_closure:'OPEN'};
  assay.record_digest=await digestRecord(SEMANTIC_ASSAY_SCHEMA,subject(assay),options.cryptoImpl);return Object.freeze(assay);
}

export async function compileMetadataAssay(input,options={}){
  const fields=[...(input.fields||[])].map(item=>({field:String(item.field),recovery:clamp01(item.recovery),threshold:Number(item.threshold??0.2),source_status:String(item.source_status||'OBSERVED')})),exceedances=fields.filter(item=>item.recovery>item.threshold).map(item=>item.field);
  const assay={schema:METADATA_ASSAY_SCHEMA,schema_version:'0.1',record_id:input.record_id||`metadata-assay:${input.case_id}`,case_id:String(input.case_id||''),created_at:input.created_at||nowIso(options.now),source_status:'DERIVED',fields,exceedances,recommendation:exceedances.length?'REMOVE_METADATA_AND_RETEST':'ELIGIBLE_FOR_COMPONENTWISE_REVIEW',promotion_eligible:fields.length>0&&exceedances.length===0,missingness:uniqueStrings(input.missingness),uncertainty:uniqueStrings(input.uncertainty),claim_ceiling:'DECLARED_METADATA_FIELDS_ONLY',operator_closure:'OPEN'};
  assay.record_digest=await digestRecord(METADATA_ASSAY_SCHEMA,subject(assay),options.cryptoImpl);return Object.freeze(assay);
}

export async function compileJoiningKeyAssay(input,options={}){
  const fields=[...(input.fields||[])].map(item=>({id:String(item.id),individual_recovery:clamp01(item.individual_recovery)})),joinedRecovery=clamp01(input.joined_recovery),sum=fields.reduce((total,item)=>total+item.individual_recovery,0),superadditivity=joinedRecovery-sum;
  const assay={schema:JOINING_KEY_ASSAY_SCHEMA,schema_version:'0.1',record_id:input.record_id||`joining-key:${input.case_id}`,case_id:String(input.case_id||''),created_at:input.created_at||nowIso(options.now),source_status:String(input.source_status||'OBSERVED'),fields,joined_recovery:joinedRecovery,individual_recovery_sum:sum,superadditivity,positive_joining_key:superadditivity>Number(input.threshold||0),recommendation:superadditivity>Number(input.threshold||0)?'JOINING_KEY_HOLD':'NO_SUPERADDITIVE_JOIN_OBSERVED',promotion_eligible:false,missingness:uniqueStrings(input.missingness),uncertainty:uniqueStrings(input.uncertainty),claim_ceiling:'DECLARED_FEATURE_SET_ONLY',operator_closure:'OPEN'};
  assay.record_digest=await digestRecord(JOINING_KEY_ASSAY_SCHEMA,subject(assay),options.cryptoImpl);return Object.freeze(assay);
}

export async function compileTomography(input,options={}){
  const cells=[...(input.cells||[])].map(cell=>({dimension:String(cell.dimension),stratum:String(cell.stratum),reader_id:String(cell.reader_id),environment_id:String(cell.environment_id),time:String(cell.time),replicate:Number(cell.replicate||0),point:cell.point==null?null:clamp01(cell.point),lower:cell.lower==null?null:clamp01(cell.lower),upper:cell.upper==null?null:clamp01(cell.upper),observed:cell.observed==null?null:clamp01(cell.observed),expected:cell.expected==null?null:clamp01(cell.expected),signed_residual:cell.observed==null||cell.expected==null?null:Number(cell.observed)-Number(cell.expected),status:String(cell.status||'UNOBSERVED'),source_status:String(cell.source_status||'MISSING'),held_out:cell.held_out===true,missingness:uniqueStrings(cell.missingness),alternative_model:String(cell.alternative_model||'UNDECLARED')}));
  if(cells.some(cell=>!PROTECTED_DIMENSIONS.includes(cell.dimension)||!STRATA.includes(cell.stratum)))throw new TypeError('Unknown tomography dimension or stratum.');
  const folds=[];for(const cell of cells){if(cell.status==='CONTRADICTORY')folds.push({cell:`${cell.dimension}:${cell.stratum}`,fold:'CONTRADICTORY'});else if(cell.status==='UNOBSERVED')folds.push({cell:`${cell.dimension}:${cell.stratum}`,fold:'UNOBSERVED'});else if(cell.signed_residual!==null&&Math.abs(cell.signed_residual)>Number(input.residual_threshold||0.25))folds.push({cell:`${cell.dimension}:${cell.stratum}`,fold:'DRIFT'});}
  const tomography={schema:TOMOGRAPHY_SCHEMA,schema_version:'0.1',record_id:input.record_id||`tomography:${input.case_id}`,case_id:String(input.case_id||''),created_at:input.created_at||nowIso(options.now),source_status:'DERIVED',strata:[...STRATA],cells,folds,zero_mean_does_not_erase_structure:true,fold_establishes_intent:false,promotion_eligible:false,missingness:uniqueStrings(cells.flatMap(cell=>cell.missingness)),uncertainty:uniqueStrings(input.uncertainty),claim_ceiling:'HETEROSTRATIGRAPHIC_OBSERVATION_ONLY',operator_closure:'OPEN'};
  tomography.record_digest=await digestRecord(TOMOGRAPHY_SCHEMA,subject(tomography),options.cryptoImpl);return Object.freeze(tomography);
}

export async function compilePortableAssuranceState(input,options={}){
  const evidence={spec:Boolean(input.spec_authored),static:Boolean(input.static_verified),local:Boolean(input.locally_executed),adversarial:Boolean(input.adversarially_observed),environment:Boolean(input.environment_specific_demonstration),bounded:Boolean(input.bounded_assurance)};
  let assuranceClass='PA0_AUTHORED';if(evidence.static)assuranceClass='PA1_STATICALLY_VERIFIED';if(evidence.static&&evidence.local)assuranceClass='PA2_LOCALLY_EXECUTED';if(evidence.static&&evidence.local&&evidence.adversarial)assuranceClass='PA3_ADVERSARIALLY_OBSERVED';if(evidence.static&&evidence.local&&evidence.adversarial&&evidence.environment)assuranceClass='PA4_ENVIRONMENT_SPECIFICALLY_DEMONSTRATED';if(evidence.static&&evidence.local&&evidence.adversarial&&evidence.environment&&evidence.bounded)assuranceClass='PA5_BOUNDED_ASSURANCE';
  const state={schema:PORTABLE_ASSURANCE_SCHEMA,schema_version:'0.1',record_id:input.record_id||`assurance:${input.case_id}`,case_id:String(input.case_id||''),created_at:input.created_at||nowIso(options.now),source_status:'DERIVED',assurance_class:assuranceClass,artifact_scope:String(input.artifact_scope||''),environment_scope:String(input.environment_scope||''),reader_scope:uniqueStrings(input.reader_scope),cryptographic_posture:String(input.cryptographic_posture||'UNMEASURED'),semantic_coverage:String(input.semantic_coverage||'UNMEASURED'),environment_coverage:String(input.environment_coverage||'PARTIAL'),flowcore_weather_state:String(input.flowcore_weather_state||'UNCOMPILED'),unknown_readers:'UNMEASURED',unresolved_surfaces:uniqueStrings(input.unresolved_surfaces),eligible_claim:assuranceClass==='PA5_BOUNDED_ASSURANCE'?'NO_TESTED_RECOVERY_ABOVE_DECLARED_THRESHOLDS':'NO_HIGHER_PROMOTION_EARNED',universal_secrecy:false,portable_anisotropy_demonstrated:null,operator_closure:String(input.operator_closure||'OPEN'),missingness:uniqueStrings(input.missingness),uncertainty:uniqueStrings(input.uncertainty),claim_ceiling:'PA0_PA5_ENVIRONMENT_SPECIFIC_ONLY'};
  state.record_digest=await digestRecord(PORTABLE_ASSURANCE_SCHEMA,subject(state),options.cryptoImpl);return Object.freeze(state);
}
