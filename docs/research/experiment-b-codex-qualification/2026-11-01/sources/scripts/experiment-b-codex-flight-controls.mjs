/** Prospective Experiment B schedule and syntactic Stage-2 packet guard. */
import crypto from 'node:crypto';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
export const ARMS=Object.freeze(['ARM_0_TRANSPORT','ARM_1_ARCHIVAL','ARM_2A_MODULAR','ARM_2B_MATCHED_UNION']);
function bound(n,key,max){if(!Number.isSafeInteger(n)||n<1||n>max)throw Error('INVALID_'+key);}
export function planFlight({documents=24,permutations=3,replications=1,factorialCells=1,reviewCallsPerCondition=1,reserveFraction=0.5}={}){
  bound(documents,'DOCUMENTS',1000);bound(permutations,'PERMUTATIONS',6);bound(replications,'REPLICATIONS',30);bound(factorialCells,'CELLS',16);
  if(!Number.isSafeInteger(reviewCallsPerCondition)||reviewCallsPerCondition<0||reviewCallsPerCondition>100)throw Error('INVALID_REVIEWS');
  if(!Number.isFinite(reserveFraction)||reserveFraction<0||reserveFraction>10)throw Error('INVALID_RESERVE');
  const conditions=permutations*replications*factorialCells;
  const twoA=documents*2*conditions,twoB=documents*conditions,review=conditions*reviewCallsPerCondition;
  const subtotal=twoA+twoB+review,reserve=Math.ceil(subtotal*reserveFraction);
  return {schema:'td613.experiment-b.prospective-capacity/v1',documents,permutations,replications,factorialCells,conditions,
    arms:ARMS,arm0_transport_operations:documents*conditions,arm1_archival_operations:documents*conditions,
    arm2a_model_calls:twoA,arm2b_model_calls:twoB,stage2_model_calls_assumed:review,
    base_model_attempts:subtotal,retry_capacity_reserve:reserve,planned_high_water_attempts:subtotal+reserve,
    budget_type:'PROSPECTIVE_ATTEMPTS_NOT_GEMINI_USD',protocol_amendment:'PROPOSED_NOT_ADOPTED',
    notes:'This explicit model is not a statistically qualified complete RCA-01, power or replication plan.',
    gate_f:'HELD',empirical_replication_credit:0};
}
const leak=/\b(?:ARM[_\s-]?(?:0|1|2A|2B)|PEDAGOGUE|APERTURE|FADT|CHAMBER|MODULAR|MATCHED[\s_-]?UNION)\b/i;
export function prepareBlindPackets(candidates,{seed}={}){
  if(!Array.isArray(candidates)||!candidates.length||typeof seed!=='string'||seed.length<16)throw Error('BLINDING_SEED_AND_CANDIDATES_REQUIRED');
  const packets=[],mapping=[];
  for(let i=0;i<candidates.length;i++){
    const c=candidates[i];
    if(!['ARM_2A_MODULAR','ARM_2B_MATCHED_UNION'].includes(c.arm)||typeof c.text!=='string'||!c.text.trim())throw Error('INVALID_CANDIDATE');
    if(leak.test(c.text)||leak.test(c.candidate_id||''))throw Error('TREATMENT_LEAKAGE_REFUSED');
    const id='BLIND-'+sha(seed+':'+i+':'+sha(c.text)).slice(0,24);
    packets.push({blind_id:id,text:c.text,text_sha256:sha(c.text)});
    mapping.push({blind_id:id,arm:c.arm,candidate_id:c.candidate_id||null});
  }
  return {evaluator_only_payload:{schema:'td613.experiment-b.blind-stage2/v1',candidates:packets},
    custodian_private_mapping:mapping,syntactic_leakage_screen:'PASS',
    semantic_blindness_verified:false,independent_evaluator_verified:false};
}
