export const PARTITION_KERNEL_SUBSTITUTION_SCHEMA='td613.aia.partition-kernel-substitution-two-move/v0.1';
export const PARTITION_KERNEL_SUBSTITUTION_SPEC_HEAD='db0a5f093933e7d63a993f74f72685ae06f9cb69';
export const MODULUS=31;

const ECOLOGY=Object.freeze([
 Object.freeze({id:'ZERO',vector:Object.freeze([0,0])}),
 ...[12,13,16,17,18,19,24].map(t=>Object.freeze({id:`D_${t}`,vector:Object.freeze([1,t])}))
]);
const PRED=Object.freeze({
 H0:Object.freeze({q3:Object.freeze([1,13]),q4:Object.freeze([1,9])}),
 H1:Object.freeze({q3:Object.freeze([1,12]),q4:Object.freeze([1,20])}),
 H2:Object.freeze({q3:Object.freeze([1,19]),q4:Object.freeze([1,18])}),
 H3:Object.freeze({q3:Object.freeze([1,20]),q4:Object.freeze([1,29])})
});
function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
function mod(v){return ((Number(v)%MODULUS)+MODULUS)%MODULUS;}
function inv(v){const a=mod(v);if(!a)throw new Error('zero inverse');for(let k=1;k<MODULUS;k+=1)if(mod(a*k)===1)return k;throw new Error('inverse missing');}
function normalize(r){const [a,b]=r.map(mod);if(a){const s=inv(a);return freeze([1,mod(b*s)]);}if(b)return freeze([0,1]);throw new Error('zero direction');}
function rowVector(r,v){return mod(r[0]*v[0]+r[1]*v[1]);}
function canonicalBlocks(blocks){return freeze(blocks.filter(b=>b.length).map(b=>freeze([...b].sort())).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))));}
function partition(r){const buckets=new Map();for(const s of ECOLOGY){const value=rowVector(r,s.vector);if(!buckets.has(value))buckets.set(value,[]);buckets.get(value).push(s.id);}return freeze({blocks:canonicalBlocks([...buckets.values()])});}
function pkey(p){return JSON.stringify(p.blocks);}
function zeroBlock(p){return p.blocks.find(b=>b.includes('ZERO'))??null;}
function state(id){return ECOLOGY.find(s=>s.id===id);}
function allDirections(){return freeze([...Array.from({length:31},(_,t)=>freeze([1,t])),freeze([0,1])]);}
const VALID=Object.freeze(allDirections().map(direction=>freeze({direction,partition:partition(direction)})));
function fullDecode(p){const compatible=VALID.filter(x=>pkey(x.partition)===pkey(p)).map(x=>x.direction);if(compatible.length===0)return freeze({status:'MODEL_DEFEAT',direction:null,compatible:freeze([])});if(compatible.length>1)return freeze({status:'AMBIGUOUS',direction:null,compatible:freeze(compatible)});return freeze({status:'UNIQUE',direction:compatible[0],compatible:freeze(compatible)});}
function zeroDecode(p){const zb=zeroBlock(p),nz=zb.filter(id=>id!=='ZERO');if(nz.length!==1)return freeze({status:nz.length===0?'MISSING':'AMBIGUOUS',direction:null});const [x,y]=state(nz[0]).vector;return freeze({status:'UNIQUE',direction:normalize([y,mod(-x)]),kernel_state_id:nz[0]});}
function cleanPreflight(p){const zb=zeroBlock(p);if(!zb||zb.length!==2)return false;return p.blocks.filter(b=>!b.includes('ZERO')).every(b=>b.length===1);}
function trueKernel(p){const zb=zeroBlock(p);return zb.find(id=>id!=='ZERO');}
function substitute(p,wrongId){
 if(!cleanPreflight(p))throw new Error('clean singleton preflight failed');const trueId=trueKernel(p);if(wrongId===trueId||wrongId==='ZERO')throw new Error('wrong witness required');
 const blocks=p.blocks.map(b=>[...b]);const zi=blocks.findIndex(b=>b.includes('ZERO')),wi=blocks.findIndex(b=>b.includes(wrongId));
 blocks[zi]=blocks[zi].filter(id=>id!==trueId);blocks[wi].push(trueId);blocks[wi]=blocks[wi].filter(id=>id!==wrongId);blocks[zi].push(wrongId);
 const out=freeze({blocks:canonicalBlocks(blocks)});const ids=out.blocks.flat();if(ids.length!==ECOLOGY.length||new Set(ids).size!==ECOLOGY.length)throw new Error('substitution damaged candidate custody');
 return freeze({original_kernel_id:trueId,substitute_kernel_id:wrongId,moved_candidate_count:2,partition:out});
}
function q3Survivors(direction){return Object.keys(PRED).filter(id=>JSON.stringify(PRED[id].q3)===JSON.stringify(direction));}

export function runPartitionKernelSubstitutionTwoMoveAssay(){
 const records=[];const countsA={},countsB={};const inc=(o,k)=>o[k]=(o[k]??0)+1;
 for(const [hid,table] of Object.entries(PRED))for(const probe of ['q3','q4']){
   const clean=partition(table[probe]);if(!cleanPreflight(clean))throw new Error('inherited clean partition violated singleton preflight');const tk=trueKernel(clean);
   for(const wrong of ECOLOGY.map(s=>s.id).filter(id=>id!=='ZERO'&&id!==tk)){
     const sub=substitute(clean,wrong),a=zeroDecode(sub.partition),b=fullDecode(sub.partition);
     const classA=a.status==='UNIQUE'?(JSON.stringify(a.direction)===JSON.stringify(table[probe])?'CORRECT_UNIQUE':'WRONG_UNIQUE'):a.status;
     const classB=b.status==='UNIQUE'?(JSON.stringify(b.direction)===JSON.stringify(table[probe])?'CORRECT_UNIQUE':'WRONG_UNIQUE'):b.status;
     inc(countsA,classA);inc(countsB,classB);
     records.push(freeze({hypothesis:hid,probe,true_direction:table[probe],clean_partition:clean,...sub,decoder_A:a,decoder_A_class:classA,decoder_B:b,decoder_B_class:classB,substituted_partition_equals_lawful_partition:b.status==='UNIQUE',lawful_direction:b.direction}));
   }
 }
 const primaryCounts={};const primaryRecords=[];
 for(const hid of Object.keys(PRED)){
   const clean=partition(PRED[hid].q3),tk=trueKernel(clean);
   for(const wrong of ECOLOGY.map(s=>s.id).filter(id=>id!=='ZERO'&&id!==tk)){
     const sub=substitute(clean,wrong),decoded=zeroDecode(sub.partition).direction,survivors=q3Survivors(decoded);let outcome;
     if(survivors.length===0)outcome='PRIMARY_DIRECTION_OUTSIDE_HYPOTHESIS_SIGNATURE_TABLE';
     else if(survivors.length===1&&survivors[0]!==hid){const selected=survivors[0];outcome=JSON.stringify(PRED[selected].q4)===JSON.stringify(PRED[hid].q4)?'WRONG_PRIMARY_THEN_FALSE_HELDOUT_PASS':'WRONG_PRIMARY_THEN_CLEAN_HELDOUT_REJECTS';}
     else outcome='OTHER';inc(primaryCounts,outcome);primaryRecords.push(freeze({true_hypothesis:hid,substitute_kernel_id:wrong,decoded_primary:decoded,surviving_hypotheses:freeze(survivors),outcome}));
   }
 }
 const heldoutCounts={};const heldoutRecords=[];
 for(const hid of Object.keys(PRED)){
   const clean=partition(PRED[hid].q4),tk=trueKernel(clean);
   for(const wrong of ECOLOGY.map(s=>s.id).filter(id=>id!=='ZERO'&&id!==tk)){
     const sub=substitute(clean,wrong),decoded=zeroDecode(sub.partition).direction;const matches=JSON.stringify(decoded)===JSON.stringify(PRED[hid].q4);const outcome=matches?'HELDOUT_ACCIDENTAL_FALSE_PASS':'HELDOUT_WRONG_UNIQUE_EVIDENCE_CONFLICT';inc(heldoutCounts,outcome);heldoutRecords.push(freeze({true_hypothesis:hid,substitute_kernel_id:wrong,decoded_heldout:decoded,selected_primary_hypothesis:hid,outcome}));
   }
 }
 const pass=records.length===48&&(countsA.WRONG_UNIQUE??0)===48&&(countsB.WRONG_UNIQUE??0)===48&&records.every(r=>r.substituted_partition_equals_lawful_partition&&r.decoder_A.direction&&JSON.stringify(r.decoder_A.direction)===JSON.stringify(r.decoder_B.direction))&&
   (primaryCounts.WRONG_PRIMARY_THEN_CLEAN_HELDOUT_REJECTS??0)===12&&(primaryCounts.PRIMARY_DIRECTION_OUTSIDE_HYPOTHESIS_SIGNATURE_TABLE??0)===12&&(primaryCounts.WRONG_PRIMARY_THEN_FALSE_HELDOUT_PASS??0)===0&&
   (heldoutCounts.HELDOUT_WRONG_UNIQUE_EVIDENCE_CONFLICT??0)===24&&(heldoutCounts.HELDOUT_ACCIDENTAL_FALSE_PASS??0)===0;
 return freeze({
  schema:PARTITION_KERNEL_SUBSTITUTION_SCHEMA,spec_head:PARTITION_KERNEL_SUBSTITUTION_SPEC_HEAD,source_status:'SIMULATED',arithmetic_domain:'F_31',corruption_family:'TRUE_KERNEL_WITNESS_SWAPPED_WITH_ONE_WRONG_CALIBRATION_WITNESS',total_substitutions:records.length,expected_total:48,
  substitution_ledger:freeze(records),decoder_A_counts:freeze(countsA),decoder_B_counts:freeze(countsB),
  primary_corruption:freeze({counts:freeze(primaryCounts),records:freeze(primaryRecords),clean_heldout_rejects_every_wrong_selected_hypothesis:(primaryCounts.WRONG_PRIMARY_THEN_FALSE_HELDOUT_PASS??0)===0}),
  heldout_corruption:freeze({counts:freeze(heldoutCounts),records:freeze(heldoutRecords),governed_classification:'EVIDENCE_CONFLICT_DO_NOT_AUTO_OVERWRITE_CLEAN_PRIMARY'}),
  findings:freeze({every_two_move_kernel_substitution_creates_wrong_unique_zero_bucket_direction:(countsA.WRONG_UNIQUE??0)===48,every_substituted_partition_is_another_lawful_linear_readout_partition:(countsB.WRONG_UNIQUE??0)===48,full_partition_model_consistency_cannot_recover_corruption_provenance_from_final_partition_alone:(countsB.WRONG_UNIQUE??0)===48,clean_heldout_rejects_all_wrong_primary_hypothesis_impersonations:(primaryCounts.WRONG_PRIMARY_THEN_CLEAN_HELDOUT_REJECTS??0)===12&&(primaryCounts.WRONG_PRIMARY_THEN_FALSE_HELDOUT_PASS??0)===0,corrupted_heldout_packet_can_create_lawful_wrong_validation_direction:(heldoutCounts.HELDOUT_WRONG_UNIQUE_EVIDENCE_CONFLICT??0)===24,validation_disagreement_does_not_identify_which_packet_is_wrong:true,assay_mechanism_validated:pass}),
  bounded_answer:pass?'IN_THE_DECLARED_EIGHT_STATE_ECOLOGY_TWO_COORDINATED_MEMBERSHIP_MOVES_CAN_REPLACE_THE_TRUE_KERNEL_WITNESS_WITH_A_FALSE_ONE_AND_PRODUCE_THE_EXACT_LAWFUL_PARTITION_OF_ANOTHER_PROJECTIVE_READOUT_SO_NEITHER_ZERO_BUCKET_NOR_FULL_PARTITION_CONSISTENCY_CAN_RECOVER_PROVENANCE_FROM_THE_FINAL_PARTITION_ALONE_WHILE_A_CLEAN_HELDOUT_PACKET_REJECTS_ALL_WRONG_PRIMARY_HYPOTHESIS_IMPERSONATIONS':'PARTITION_KERNEL_SUBSTITUTION_TWO_MOVE_ASSAY_FAILED',
  claim_ceiling:freeze({two_move_kernel_substitution_vulnerability_in_fixture:pass,arbitrary_two_move_attack:false,multi_packet_attack_tolerance:false,adversarial_security_guarantee:false,physical_robustness:false,proto_loom:false,production_authority:false,vercel_authority:false}),
  promotion_authority:false,production_mutated:false,human_closure_required:true
 });
}
