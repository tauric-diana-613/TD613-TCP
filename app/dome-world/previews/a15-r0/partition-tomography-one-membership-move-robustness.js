export const PARTITION_ONE_MOVE_ROBUSTNESS_SCHEMA='td613.aia.partition-tomography-one-membership-move-robustness/v0.1';
export const PARTITION_ONE_MOVE_ROBUSTNESS_SPEC_HEAD='69a7446d8252d8ddfc8f2364102a830866f85a43';
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
function allDirections(){return freeze([...Array.from({length:31},(_,t)=>freeze([1,t])),freeze([0,1])]);}
function canonicalBlocks(blocks){return freeze(blocks.filter(b=>b.length).map(b=>freeze([...b].sort())).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))));}
function partition(r){const buckets=new Map();for(const s of ECOLOGY){const value=rowVector(r,s.vector);if(!buckets.has(value))buckets.set(value,[]);buckets.get(value).push(s.id);}return freeze({blocks:canonicalBlocks([...buckets.values()])});}
function pkey(p){return JSON.stringify(p.blocks);}
function zeroBlock(p){return p.blocks.find(b=>b.includes('ZERO'))??null;}
function state(id){return ECOLOGY.find(s=>s.id===id);}

function zeroDecoder(p){
 const zb=zeroBlock(p);if(!zb)return freeze({status:'NO_ZERO_ANCHOR',direction:null});
 const nz=zb.filter(id=>id!=='ZERO');
 if(nz.length===0)return freeze({status:'ABSTAIN_MISSING',direction:null});
 if(nz.length>1)return freeze({status:'ABSTAIN_AMBIGUOUS',direction:null});
 const [x,y]=state(nz[0]).vector;return freeze({status:'UNIQUE',direction:normalize([y,mod(-x)])});
}
const DIRECTION_PARTITIONS=Object.freeze(allDirections().map(direction=>freeze({direction,partition:partition(direction)})));
function fullDecoder(p){
 const compatible=DIRECTION_PARTITIONS.filter(item=>pkey(item.partition)===pkey(p)).map(item=>item.direction);
 if(compatible.length===0)return freeze({status:'MODEL_DEFEAT',direction:null,compatible:freeze([])});
 if(compatible.length>1)return freeze({status:'AMBIGUOUS',direction:null,compatible:freeze(compatible)});
 return freeze({status:'UNIQUE',direction:compatible[0],compatible:freeze(compatible)});
}

function oneMoves(clean){
 const out=[];
 for(const sid of ECOLOGY.map(s=>s.id).filter(id=>id!=='ZERO')){
   const sourceIndex=clean.blocks.findIndex(block=>block.includes(sid));
   for(let targetIndex=0;targetIndex<clean.blocks.length;targetIndex+=1){
     if(targetIndex===sourceIndex)continue;
     const blocks=clean.blocks.map(block=>[...block]);
     blocks[sourceIndex]=blocks[sourceIndex].filter(id=>id!==sid);
     blocks[targetIndex].push(sid);
     out.push(freeze({moved_state_id:sid,source_block:freeze([...clean.blocks[sourceIndex]]),target_block:freeze([...clean.blocks[targetIndex]]),partition:freeze({blocks:canonicalBlocks(blocks)})}));
   }
 }
 return freeze(out);
}
function classifyDecode(decoderResult,trueDirection){
 if(decoderResult.status==='UNIQUE')return JSON.stringify(decoderResult.direction)===JSON.stringify(trueDirection)?'CORRECT_UNIQUE':'WRONG_UNIQUE';
 if(decoderResult.status==='ABSTAIN_MISSING')return 'ABSTAIN_MISSING';
 if(decoderResult.status==='ABSTAIN_AMBIGUOUS')return 'ABSTAIN_AMBIGUOUS';
 if(decoderResult.status==='MODEL_DEFEAT')return 'MODEL_DEFEAT';
 return 'AMBIGUOUS';
}
function increment(counter,key){counter[key]=(counter[key]??0)+1;}
function hypothesisFromPrimary(direction){if(!direction)return freeze([]);return freeze(Object.keys(PRED).filter(id=>JSON.stringify(PRED[id].q3)===JSON.stringify(direction)));}

function cleanRecords(){
 const records=[];
 for(const [hid,table] of Object.entries(PRED))for(const probe of ['q3','q4']){
   const clean=partition(table[probe]),a=zeroDecoder(clean),b=fullDecoder(clean);
   records.push(freeze({hypothesis:hid,probe,direction:table[probe],partition:clean,decoder_A:a,decoder_B:b,A_correct:a.status==='UNIQUE'&&JSON.stringify(a.direction)===JSON.stringify(table[probe]),B_correct:b.status==='UNIQUE'&&JSON.stringify(b.direction)===JSON.stringify(table[probe])}));
 }
 return freeze(records);
}

function corruptionLedger(){
 const records=[];const countsA={},countsB={};
 for(const [hid,table] of Object.entries(PRED))for(const probe of ['q3','q4']){
   const clean=partition(table[probe]),moves=oneMoves(clean);
   for(const move of moves){
     const a=zeroDecoder(move.partition),b=fullDecoder(move.partition);
     const classA=classifyDecode(a,table[probe]),classB=classifyDecode(b,table[probe]);
     increment(countsA,classA);increment(countsB,classB);
     records.push(freeze({hypothesis:hid,probe,true_direction:table[probe],...move,decoder_A:a,decoder_A_class:classA,decoder_B:b,decoder_B_class:classB}));
   }
 }
 return freeze({records:freeze(records),decoder_A_counts:freeze(countsA),decoder_B_counts:freeze(countsB)});
}

function primaryEndToEnd(decoderName){
 const counts={};const records=[];
 for(const hid of Object.keys(PRED)){
   const cleanHeld=partition(PRED[hid].q4),heldDecoder=decoderName==='A'?zeroDecoder(cleanHeld):fullDecoder(cleanHeld);
   for(const move of oneMoves(partition(PRED[hid].q3))){
     const d=decoderName==='A'?zeroDecoder(move.partition):fullDecoder(move.partition);
     let outcome;
     if(d.status!=='UNIQUE')outcome='PRIMARY_ABSTENTION_OR_MODEL_DEFEAT';
     else {
       const survivors=hypothesisFromPrimary(d.direction);
       if(survivors.length!==1)outcome='PRIMARY_ABSTENTION_OR_MODEL_DEFEAT';
       else if(survivors[0]===hid) outcome='CORRECT_PRIMARY_IDENTIFICATION';
       else {
         const selected=survivors[0];
         const heldoutPass=heldDecoder.status==='UNIQUE'&&JSON.stringify(heldDecoder.direction)===JSON.stringify(PRED[selected].q4);
         outcome=heldoutPass?'WRONG_PRIMARY_THEN_FALSE_HELDOUT_PASS':'WRONG_PRIMARY_THEN_HELDOUT_REJECTED';
       }
     }
     increment(counts,outcome);records.push(freeze({true_hypothesis:hid,...move,decoder:d,outcome}));
   }
 }
 return freeze({counts:freeze(counts),records:freeze(records)});
}
function heldoutEndToEnd(decoderName){
 const counts={};const records=[];
 for(const hid of Object.keys(PRED)){
   const primary=decoderName==='A'?zeroDecoder(partition(PRED[hid].q3)):fullDecoder(partition(PRED[hid].q3));
   if(primary.status!=='UNIQUE'||JSON.stringify(primary.direction)!==JSON.stringify(PRED[hid].q3))throw new Error('clean primary failed');
   for(const move of oneMoves(partition(PRED[hid].q4))){
     const d=decoderName==='A'?zeroDecoder(move.partition):fullDecoder(move.partition);
     let outcome;
     if(d.status!=='UNIQUE') outcome='HELDOUT_CORRUPTION_DETECTED_OR_ABSTAINED';
     else if(JSON.stringify(d.direction)===JSON.stringify(PRED[hid].q4)) outcome='HELDOUT_CORRECT_PASS_UNDETECTED_CORRUPTION';
     else outcome='HELDOUT_FALSE_REJECTION_WRONG_UNIQUE';
     increment(counts,outcome);records.push(freeze({true_hypothesis:hid,...move,decoder:d,outcome}));
   }
 }
 return freeze({counts:freeze(counts),records:freeze(records)});
}

export function runPartitionTomographyOneMembershipMoveRobustnessAssay(){
 const clean=cleanRecords();const ledger=corruptionLedger();
 const primaryA=primaryEndToEnd('A'),primaryB=primaryEndToEnd('B');
 const heldoutA=heldoutEndToEnd('A'),heldoutB=heldoutEndToEnd('B');
 const total=ledger.records.length;
 const legalExpected=8*7*6;
 const A=ledger.decoder_A_counts,B=ledger.decoder_B_counts;
 const pass=clean.every(r=>r.A_correct&&r.B_correct)&&total===legalExpected&&
   (A.CORRECT_UNIQUE??0)===240&&(A.WRONG_UNIQUE??0)===0&&(A.ABSTAIN_MISSING??0)===48&&(A.ABSTAIN_AMBIGUOUS??0)===48&&
   (B.MODEL_DEFEAT??0)===336&&(B.WRONG_UNIQUE??0)===0&&
   (primaryA.counts.CORRECT_PRIMARY_IDENTIFICATION??0)===120&&(primaryA.counts.PRIMARY_ABSTENTION_OR_MODEL_DEFEAT??0)===48&&(primaryA.counts.WRONG_PRIMARY_THEN_FALSE_HELDOUT_PASS??0)===0&&
   (primaryB.counts.PRIMARY_ABSTENTION_OR_MODEL_DEFEAT??0)===168&&
   (heldoutA.counts.HELDOUT_CORRECT_PASS_UNDETECTED_CORRUPTION??0)===120&&(heldoutA.counts.HELDOUT_CORRUPTION_DETECTED_OR_ABSTAINED??0)===48&&(heldoutA.counts.HELDOUT_FALSE_REJECTION_WRONG_UNIQUE??0)===0&&
   (heldoutB.counts.HELDOUT_CORRUPTION_DETECTED_OR_ABSTAINED??0)===168;
 return freeze({
  schema:PARTITION_ONE_MOVE_ROBUSTNESS_SCHEMA,spec_head:PARTITION_ONE_MOVE_ROBUSTNESS_SPEC_HEAD,source_status:'SIMULATED',arithmetic_domain:'F_31',corruption_family:'EXACTLY_ONE_NONZERO_CANDIDATE_REASSIGNED_TO_DIFFERENT_EXISTING_BLOCK_ZERO_TRUSTED',
  clean_controls:freeze({records:clean,all_pass:clean.every(r=>r.A_correct&&r.B_correct)}),
  exhaustive_corruption_ledger:ledger,total_corruptions:total,expected_total:legalExpected,
  decoder_A_zero_bucket:freeze({counts:ledger.decoder_A_counts,wrong_unique_count:A.WRONG_UNIQUE??0,undetected_corruption_with_correct_direction:A.CORRECT_UNIQUE??0,fail_safe_under_declared_one_move_family:(A.WRONG_UNIQUE??0)===0}),
  decoder_B_full_partition:freeze({counts:ledger.decoder_B_counts,all_one_move_corruptions_rejected_as_model_inconsistent:(B.MODEL_DEFEAT??0)===total}),
  end_to_end:freeze({primary_corruption:freeze({decoder_A:primaryA,decoder_B:primaryB}),heldout_corruption:freeze({decoder_A:heldoutA,decoder_B:heldoutB})}),
  findings:freeze({correct_direction_estimate_does_not_certify_clean_partition:(A.CORRECT_UNIQUE??0)>0,zero_bucket_decoder_never_returns_wrong_unique_under_declared_one_move_family:(A.WRONG_UNIQUE??0)===0,full_partition_consistency_rejects_all_declared_one_move_corruptions:(B.MODEL_DEFEAT??0)===total,full_partition_validation_is_stricter_but_less_tolerant_than_zero_bucket_direction_recovery:(B.MODEL_DEFEAT??0)===total&&(A.CORRECT_UNIQUE??0)>0,no_false_hypothesis_acceptance_after_clean_heldout_under_declared_one_move_family:(primaryA.counts.WRONG_PRIMARY_THEN_FALSE_HELDOUT_PASS??0)===0&&(primaryB.counts.WRONG_PRIMARY_THEN_FALSE_HELDOUT_PASS??0)===0,assay_mechanism_validated:pass}),
  bounded_answer:pass?'UNDER_THE_DECLARED_SINGLE_NONZERO_MEMBERSHIP_MOVE_FAMILY_THE_ZERO_BUCKET_DECODER_IS_DIRECTION_FAIL_SAFE_BUT_CAN_SILENTLY_ACCEPT_CORRUPTED_PARTITIONS_WHILE_THE_FULL_PARTITION_CONSISTENCY_DECODER_REJECTS_EVERY_CORRUPTED_PARTITION_AS_OUTSIDE_THE_LINEAR_READOUT_MODEL':'PARTITION_TOMOGRAPHY_ONE_MEMBERSHIP_MOVE_ROBUSTNESS_ASSAY_FAILED',
  claim_ceiling:freeze({one_membership_move_direction_fail_safety_for_zero_bucket_decoder:pass,arbitrary_corruption_tolerance:false,two_move_robustness:false,adversarial_security_guarantee:false,physical_robustness:false,proto_loom:false,production_authority:false,vercel_authority:false}),
  promotion_authority:false,production_mutated:false,human_closure_required:true
 });
}
