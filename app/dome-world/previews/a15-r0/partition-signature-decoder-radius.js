export const PARTITION_SIGNATURE_DECODER_RADIUS_SCHEMA='td613.aia.partition-signature-decoder-radius/v0.1';
export const PARTITION_SIGNATURE_DECODER_RADIUS_SPEC_HEAD='c42d54b4416c43f49bb3dc524c89fbc43f418208';
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
const PACKETS=Object.freeze(['q3','q4']);
const HYPOTHESES=Object.freeze(Object.keys(PRED));

function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
function mod(v){return ((Number(v)%MODULUS)+MODULUS)%MODULUS;}
function rowVector(r,v){return mod(r[0]*v[0]+r[1]*v[1]);}
function canonicalBlocks(blocks){return blocks.filter(b=>b.length).map(b=>[...b].sort()).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)));}
function partition(readout){
 const buckets=new Map();
 for(const s of ECOLOGY){const value=rowVector(readout,s.vector);if(!buckets.has(value))buckets.set(value,[]);buckets.get(value).push(s.id);}
 return canonicalBlocks([...buckets.values()]);
}
function pkey(p){return JSON.stringify(p);}
function skey(s){return JSON.stringify([pkey(s.q3),pkey(s.q4)]);}
function clonePartition(p){return p.map(b=>[...b]);}
function zeroBlock(p){const z=p.find(b=>b.includes('ZERO'));if(!z)throw new Error('ZERO block missing');return z;}
function validatePartition(p){
 const flat=p.flat();
 if(flat.length!==ECOLOGY.length)throw new Error('candidate custody cardinality violated');
 if(new Set(flat).size!==ECOLOGY.length)throw new Error('candidate duplication detected');
 for(const s of ECOLOGY)if(!flat.includes(s.id))throw new Error(`candidate dropped: ${s.id}`);
 if(flat.filter(x=>x==='ZERO').length!==1)throw new Error('ZERO custody violated');
 return true;
}
function validateSignature(s){return validatePartition(s.q3)&&validatePartition(s.q4);}

const CLEAN=freeze(Object.fromEntries(HYPOTHESES.map(h=>[h,freeze({q3:freeze(partition(PRED[h].q3)),q4:freeze(partition(PRED[h].q4))})])));
const CLEAN_KEY=freeze(Object.fromEntries(HYPOTHESES.map(h=>[h,skey(CLEAN[h])])));

function intersectionCount(a,b){const bs=new Set(b);let n=0;for(const x of a)if(bs.has(x))n+=1;return n;}
function nonZeroBlocks(p){return p.filter(b=>!b.includes('ZERO'));}

function exactMaximumOverlap(left,right){
 const memo=new Map();
 function rec(i,mask){
  const key=`${i}:${mask}`;if(memo.has(key))return memo.get(key);
  if(i===left.length)return 0;
  let best=rec(i+1,mask);
  for(let j=0;j<right.length;j+=1)if((mask&(1<<j))===0){
   const score=intersectionCount(left[i],right[j])+rec(i+1,mask|(1<<j));
   if(score>best)best=score;
  }
  memo.set(key,best);return best;
 }
 return rec(0,0);
}

const DISTANCE_CACHE=new Map();
function anchoredPacketDistance(a,b){
 const ak=pkey(a),bk=pkey(b),ck=ak<bk?`${ak}|${bk}`:`${bk}|${ak}`;
 if(DISTANCE_CACHE.has(ck))return DISTANCE_CACHE.get(ck);
 const az=zeroBlock(a),bz=zeroBlock(b);
 const zeroKeep=intersectionCount(az,bz);
 const nonZeroKeep=exactMaximumOverlap(nonZeroBlocks(a),nonZeroBlocks(b));
 const d=ECOLOGY.length-zeroKeep-nonZeroKeep;
 DISTANCE_CACHE.set(ck,d);return d;
}
function signatureDistance(a,b){return anchoredPacketDistance(a.q3,b.q3)+anchoredPacketDistance(a.q4,b.q4);}

const PACKET_NEIGHBOR_CACHE=new Map();
function packetNeighbors(p){
 const pk=pkey(p);if(PACKET_NEIGHBOR_CACHE.has(pk))return PACKET_NEIGHBOR_CACHE.get(pk);
 const blocks=clonePartition(p),out=new Map();
 for(const candidate of ECOLOGY.map(s=>s.id).filter(id=>id!=='ZERO')){
  const sourceIndex=blocks.findIndex(b=>b.includes(candidate));
  if(sourceIndex<0)throw new Error('candidate source missing');
  for(let destinationIndex=0;destinationIndex<blocks.length;destinationIndex+=1){
   if(destinationIndex===sourceIndex)continue;
   const next=clonePartition(blocks);
   const sourceBefore=[...next[sourceIndex]].sort();
   const destinationBefore=[...next[destinationIndex]].sort();
   next[sourceIndex]=next[sourceIndex].filter(id=>id!==candidate);
   next[destinationIndex].push(candidate);
   const q=canonicalBlocks(next);validatePartition(q);
   const qk=pkey(q);
   if(qk===pk)throw new Error('no-op existing-block move counted');
   if(!out.has(qk))out.set(qk,freeze({partition:freeze(q),action:freeze({moved_candidate:candidate,source_block:freeze(sourceBefore),destination_block:freeze(destinationBefore),destination_kind:'EXISTING_BLOCK'})}));
  }
  if(blocks[sourceIndex].length>1){
   const next=clonePartition(blocks);
   const sourceBefore=[...next[sourceIndex]].sort();
   next[sourceIndex]=next[sourceIndex].filter(id=>id!==candidate);
   next.push([candidate]);
   const q=canonicalBlocks(next);validatePartition(q);
   const qk=pkey(q);
   if(qk===pk)throw new Error('no-op singleton creation counted');
   if(!out.has(qk))out.set(qk,freeze({partition:freeze(q),action:freeze({moved_candidate:candidate,source_block:freeze(sourceBefore),destination_block:freeze(['NEW_SINGLETON']),destination_kind:'NEW_SINGLETON'})}));
  }
 }
 const result=freeze([...out.values()]);PACKET_NEIGHBOR_CACHE.set(pk,result);return result;
}

function signatureNeighbors(s){
 const out=new Map();
 for(const packet of PACKETS){
  for(const edge of packetNeighbors(s[packet])){
   const next=freeze({q3:packet==='q3'?edge.partition:s.q3,q4:packet==='q4'?edge.partition:s.q4});
   validateSignature(next);const k=skey(next);
   if(k===skey(s))throw new Error('signature no-op counted');
   if(!out.has(k))out.set(k,freeze({signature:next,action:freeze({packet,...edge.action})}));
  }
 }
 return freeze([...out.values()]);
}

function decoder(sourceId,received){
 const distances=Object.fromEntries(HYPOTHESES.map(h=>[h,signatureDistance(received,CLEAN[h])]));
 const minimum=Math.min(...Object.values(distances));
 const nearest=HYPOTHESES.filter(h=>distances[h]===minimum);
 let nearestClass;
 if(nearest.length>1)nearestClass='NEAREST_TIE';
 else if(nearest[0]===sourceId)nearestClass='CORRECT_UNIQUE_NEAREST';
 else nearestClass='WRONG_UNIQUE_NEAREST';
 const exact=HYPOTHESES.filter(h=>CLEAN_KEY[h]===skey(received));
 let exactClass;
 if(exact.length===0)exactClass='NON_CODEWORD_EVIDENCE_CONFLICT';
 else if(exact.length===1&&exact[0]===sourceId)exactClass='SOURCE_CLEAN_CODEWORD';
 else if(exact.length===1)exactClass='CLEAN_CODEWORD_IMPERSONATION';
 else throw new Error('clean codebook contains duplicate signatures');
 return freeze({distances:freeze(distances),minimum_distance:minimum,nearest_hypotheses:freeze(nearest),nearest_class:nearestClass,exact_class:exactClass,exact_hypothesis:exact[0]??null});
}

function bfsFrom(sourceId,maxCost=3){
 const start=CLEAN[sourceId],startKey=skey(start),queue=[startKey];let qi=0;
 const states=new Map([[startKey,start]]),distance=new Map([[startKey,0]]),parent=new Map();
 while(qi<queue.length){
  const key=queue[qi++],s=states.get(key),d=distance.get(key);
  if(d>=maxCost)continue;
  for(const edge of signatureNeighbors(s)){
   const nk=skey(edge.signature);
   if(distance.has(nk))continue;
   distance.set(nk,d+1);states.set(nk,edge.signature);parent.set(nk,freeze({previous:key,action:edge.action}));queue.push(nk);
  }
 }
 return {startKey,states,distance,parent};
}

function reconstructPath(bfs,targetKey){
 const rev=[];let k=targetKey;
 while(k!==bfs.startKey){
  const rec=bfs.parent.get(k);if(!rec)throw new Error('path parent missing');
  const received=bfs.states.get(k);
  rev.push(freeze({packet:rec.action.packet,moved_candidate:rec.action.moved_candidate,source_block:rec.action.source_block,destination_block:rec.action.destination_block,destination_kind:rec.action.destination_kind,result_signature:received}));
  k=rec.previous;
 }
 return freeze(rev.reverse());
}

function emptyCounts(){return {reachable_signature_count:0,CORRECT_UNIQUE_NEAREST:0,NEAREST_TIE:0,WRONG_UNIQUE_NEAREST:0,NON_CODEWORD_EVIDENCE_CONFLICT:0,CLEAN_CODEWORD_IMPERSONATION:0,SOURCE_CLEAN_CODEWORD:0};}
function bump(o,k){o[k]=(o[k]??0)+1;}

function constructiveTieTarget(){return freeze({q3:CLEAN.H1.q3,q4:CLEAN.H0.q4});}
function constructiveWrongTarget(){
 const q4=clonePartition(CLEAN.H0.q4);
 const source=q4.findIndex(b=>b.includes('D_17')),dest=q4.findIndex(b=>b.includes('ZERO'));
 q4[source]=q4[source].filter(id=>id!=='D_17');q4[dest].push('D_17');
 return freeze({q3:CLEAN.H1.q3,q4:freeze(canonicalBlocks(q4))});
}

export function runPartitionSignatureDecoderRadiusAssay(){
 const ledgers={},sourceRuns={};let anyImpersonationThroughThree=false,allOneCorrect=true,noWrongThroughTwo=true;
 let totalReachableByCost={0:0,1:0,2:0,3:0};
 for(const sourceId of HYPOTHESES){
  const bfs=bfsFrom(sourceId,3);sourceRuns[sourceId]=bfs;
  const byCost={0:emptyCounts(),1:emptyCounts(),2:emptyCounts(),3:emptyCounts()};
  for(const [key,cost] of bfs.distance.entries()){
   const received=bfs.states.get(key),d=decoder(sourceId,received),row=byCost[cost];
   row.reachable_signature_count+=1;bump(row,d.nearest_class);bump(row,d.exact_class);
   if(cost<=3&&d.exact_class==='CLEAN_CODEWORD_IMPERSONATION')anyImpersonationThroughThree=true;
   if(cost===1&&d.nearest_class!=='CORRECT_UNIQUE_NEAREST')allOneCorrect=false;
   if(cost<=2&&d.nearest_class==='WRONG_UNIQUE_NEAREST')noWrongThroughTwo=false;
  }
  for(const k of [0,1,2,3])totalReachableByCost[k]+=byCost[k].reachable_signature_count;
  ledgers[sourceId]=freeze(Object.fromEntries(Object.entries(byCost).map(([k,v])=>[k,freeze(v)])));
 }

 const tieTarget=constructiveTieTarget(),tieKey=skey(tieTarget),tieBfs=sourceRuns.H0;
 if(tieBfs.distance.get(tieKey)!==2)throw new Error('preregistered tie target does not have shortest cost 2');
 const tieDecoded=decoder('H0',tieTarget),tiePath=reconstructPath(tieBfs,tieKey);

 const wrongTarget=constructiveWrongTarget(),wrongKey=skey(wrongTarget),wrongBfs=sourceRuns.H0;
 if(wrongBfs.distance.get(wrongKey)!==3)throw new Error('preregistered wrong-nearest target does not have shortest cost 3');
 const wrongDecoded=decoder('H0',wrongTarget),wrongPath=reconstructPath(wrongBfs,wrongKey);

 const anyTwoTie=HYPOTHESES.some(h=>ledgers[h][2].NEAREST_TIE>0);
 const anyThreeWrong=HYPOTHESES.some(h=>ledgers[h][3].WRONG_UNIQUE_NEAREST>0);
 const exactDetectionThroughThree=!anyImpersonationThroughThree;
 const tieWitnessPass=tieDecoded.nearest_class==='NEAREST_TIE'&&tieDecoded.distances.H0===2&&tieDecoded.distances.H1===2;
 const wrongWitnessPass=wrongDecoded.nearest_class==='WRONG_UNIQUE_NEAREST'&&wrongDecoded.nearest_hypotheses.length===1&&wrongDecoded.nearest_hypotheses[0]==='H1'&&wrongDecoded.distances.H0===3&&wrongDecoded.distances.H1===1&&wrongDecoded.exact_class==='NON_CODEWORD_EVIDENCE_CONFLICT';
 const expectedShells=HYPOTHESES.every(h=>ledgers[h][0].reachable_signature_count===1&&ledgers[h][1].reachable_signature_count===56&&ledgers[h][2].reachable_signature_count===1316&&ledgers[h][3].reachable_signature_count===16996);
 const pass=exactDetectionThroughThree&&allOneCorrect&&noWrongThroughTwo&&anyTwoTie&&anyThreeWrong&&tieWitnessPass&&wrongWitnessPass&&expectedShells;

 return freeze({
  schema:PARTITION_SIGNATURE_DECODER_RADIUS_SCHEMA,spec_head:PARTITION_SIGNATURE_DECODER_RADIUS_SPEC_HEAD,source_status:'SIMULATED',arithmetic_domain:'F_31',ecology:freeze(ECOLOGY.map(s=>s.id)),clean_prediction_table:PRED,
  attack_model:'SHORTEST_PATH_OVER_SINGLE_NONZERO_MEMBERSHIP_REASSIGNMENTS_WITH_ZERO_TRUSTED_AND_UNMOVED',decoder_score:'EXACT_MAXIMUM_OVERLAP_ANCHORED_REASSIGNMENT_DISTANCE',
  exhaustive_ledgers:freeze(ledgers),aggregate_reachable_by_cost:freeze(totalReachableByCost),
  witnesses:freeze({
   cost_2_tie:freeze({source:'H0',target_shape:'H1_Q3_PLUS_H0_Q4',shortest_attack_cost:tieBfs.distance.get(tieKey),decoder:tieDecoded,path:tiePath}),
   cost_3_wrong_unique:freeze({source:'H0',target_shape:'H1_Q3_PLUS_ONE_Q4_MOVE_TOWARD_H1',shortest_attack_cost:wrongBfs.distance.get(wrongKey),decoder:wrongDecoded,path:wrongPath})
  }),
  findings:freeze({
   exhaustive_shell_sizes_match_preregistered_fixture:expectedShells,
   no_false_clean_codeword_impersonation_through_three_reassignments:exactDetectionThroughThree,
   every_one_reassignment_state_has_correct_unique_nearest_source:allOneCorrect,
   no_wrong_unique_nearest_state_through_two_reassignments:noWrongThroughTwo,
   two_reassignments_can_create_nearest_clean_ambiguity:anyTwoTie&&tieWitnessPass,
   three_reassignments_can_create_wrong_unique_nearest_decoding:anyThreeWrong&&wrongWitnessPass,
   exact_codeword_acceptance_and_nearest_decoding_have_different_robustness_envelopes:exactDetectionThroughThree&&allOneCorrect&&anyTwoTie&&anyThreeWrong,
   assay_mechanism_validated:pass
  }),
  bounded_answer:pass?'BOUNDED_TWO_PACKET_PARTITION_SIGNATURE_ATTACK_GEOMETRY_IS_EXHAUSTIVELY_CHARACTERIZED_THROUGH_THREE_MEMBERSHIP_REASSIGNMENTS_IN_THE_AUTHORED_EIGHT_STATE_FIXTURE':'PARTITION_SIGNATURE_DECODER_RADIUS_ASSAY_FAILED',
  bounded_interpretation:pass?'EXACT_CLEAN_CODEWORD_IMPERSONATION_IS_EXCLUDED_THROUGH_BUDGET_THREE_WHILE_UNIQUE_NEAREST_SOURCE_RECOVERY_IS_GUARANTEED_ONLY_THROUGH_BUDGET_ONE_BUDGET_TWO_ADMITS_AMBIGUITY_AND_BUDGET_THREE_ADMITS_WRONG_UNIQUE_NEAREST_DECODING':'NOT_EARNED',
  claim_ceiling:freeze({bounded_generated_attack_geometry:pass,generic_error_correcting_code_theorem:false,arbitrary_corruption_tolerance:false,cryptographic_integrity:false,byzantine_fault_tolerance:false,provenance_recovery_from_terminal_observation:false,td613_general_robustness_theorem:false,physical_robustness:false,proto_loom:false,production_authority:false,vercel_authority:false}),
  promotion_authority:false,production_mutated:false,human_closure_required:true
 });
}
