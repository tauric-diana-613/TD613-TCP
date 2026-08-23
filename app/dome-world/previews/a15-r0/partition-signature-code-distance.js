export const PARTITION_SIGNATURE_CODE_DISTANCE_SCHEMA='td613.aia.partition-signature-code-distance/v0.1';
export const PARTITION_SIGNATURE_CODE_DISTANCE_SPEC_HEAD='c272de9c9031991af47afd6826c12e184609f082';
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

function freeze(v){
 if(v&&typeof v==='object'&&!Object.isFrozen(v)){
  Object.values(v).forEach(freeze);Object.freeze(v);
 }
 return v;
}
function mod(v){return ((Number(v)%MODULUS)+MODULUS)%MODULUS;}
function rowVector(r,v){return mod(r[0]*v[0]+r[1]*v[1]);}
function canonicalBlocks(blocks){
 return freeze(blocks.filter(b=>b.length).map(b=>freeze([...b].sort())).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))));
}
function partition(readout){
 const buckets=new Map();
 for(const s of ECOLOGY){
  const value=rowVector(readout,s.vector);
  if(!buckets.has(value))buckets.set(value,[]);
  buckets.get(value).push(s.id);
 }
 return freeze({blocks:canonicalBlocks([...buckets.values()])});
}
function pkey(p){return JSON.stringify(p.blocks);}
function zeroBlock(p){const block=p.blocks.find(b=>b.includes('ZERO'));if(!block)throw new Error('ZERO block missing');return block;}
function nonZeroBlocks(p){return p.blocks.filter(b=>!b.includes('ZERO'));}
function intersectionSize(a,b){const bs=new Set(b);return a.reduce((n,x)=>n+(bs.has(x)?1:0),0);}

function optimalBlockMatching(left,right){
 const n=Math.max(left.length,right.length);
 const L=[...left.map(x=>[...x]),...Array.from({length:n-left.length},()=>[])];
 const R=[...right.map(x=>[...x]),...Array.from({length:n-right.length},()=>[])];
 let bestRetention=-1,bestPermutation=null,assignmentCount=0;
 const used=Array(n).fill(false),perm=Array(n).fill(-1);
 function walk(i,retained){
  if(i===n){
   assignmentCount+=1;
   if(retained>bestRetention){bestRetention=retained;bestPermutation=[...perm];}
   return;
  }
  for(let j=0;j<n;j+=1){
   if(used[j])continue;
   used[j]=true;perm[i]=j;
   walk(i+1,retained+intersectionSize(L[i],R[j]));
   used[j]=false;
  }
 }
 walk(0,0);
 const pairs=bestPermutation.map((j,i)=>freeze({left:freeze([...L[i]]),right:freeze([...R[j]]),retained:intersectionSize(L[i],R[j])}));
 return freeze({best_retention:bestRetention,best_permutation:freeze(bestPermutation),matched_blocks:freeze(pairs),assignment_count:assignmentCount});
}

export function anchoredPartitionDistance(left,right){
 const zl=zeroBlock(left),zr=zeroBlock(right);
 const zeroRetention=intersectionSize(zl,zr);
 const matching=optimalBlockMatching(nonZeroBlocks(left),nonZeroBlocks(right));
 const retention=zeroRetention+matching.best_retention;
 const distance=ECOLOGY.length-retention;
 return freeze({
  distance,
  ecology_size:ECOLOGY.length,
  zero_anchor_forced:true,
  zero_left:freeze([...zl]),zero_right:freeze([...zr]),zero_retention:zeroRetention,
  nonzero_block_matching:matching,
  total_retention:retention,
  block_order_invariant:true
 });
}

function cleanSingletonPreflight(p){
 const zb=zeroBlock(p);
 return zb.length===2&&nonZeroBlocks(p).every(b=>b.length===1)&&p.blocks.flat().length===ECOLOGY.length;
}
function kernelId(p){return zeroBlock(p).find(id=>id!=='ZERO');}
function moveMember(p,member,destinationContains){
 const blocks=p.blocks.map(b=>[...b]);
 const si=blocks.findIndex(b=>b.includes(member));
 const di=blocks.findIndex(b=>b.includes(destinationContains));
 if(si<0||di<0||si===di)throw new Error('invalid membership move');
 blocks[si]=blocks[si].filter(id=>id!==member);
 blocks[di].push(member);
 return freeze({blocks:canonicalBlocks(blocks)});
}
function lawfulKernelSwapPath(source,target){
 if(!cleanSingletonPreflight(source)||!cleanSingletonPreflight(target))throw new Error('clean singleton preflight failed');
 const fromKernel=kernelId(source),toKernel=kernelId(target);
 if(fromKernel===toKernel)return freeze({move_count:0,moves:freeze([]),terminal:source,terminal_matches_target:pkey(source)===pkey(target)});
 const step1=moveMember(source,fromKernel,toKernel);
 const step2=moveMember(step1,toKernel,'ZERO');
 return freeze({
  move_count:2,
  moves:freeze([
   freeze({member:fromKernel,from:'ZERO_BLOCK',to:`BLOCK_CONTAINING_${toKernel}`,partition:step1}),
   freeze({member:toKernel,from:`BLOCK_CONTAINING_${fromKernel}`,to:'ZERO_BLOCK',partition:step2})
  ]),
  terminal:step2,
  terminal_matches_target:pkey(step2)===pkey(target),
  from_kernel:fromKernel,to_kernel:toKernel
 });
}

function cleanCodewords(){
 return freeze(Object.fromEntries(Object.entries(PRED).map(([hid,row])=>[hid,freeze({q3:partition(row.q3),q4:partition(row.q4)})])));
}
function unorderedPairs(ids){const out=[];for(let i=0;i<ids.length;i++)for(let j=i+1;j<ids.length;j++)out.push([ids[i],ids[j]]);return out;}

export function runPartitionSignatureCodeDistanceAssay(){
 const codewords=cleanCodewords();
 const ids=Object.keys(codewords);
 const pairRecords=[];
 for(const [leftId,rightId] of unorderedPairs(ids)){
  const q3=anchoredPartitionDistance(codewords[leftId].q3,codewords[rightId].q3);
  const q4=anchoredPartitionDistance(codewords[leftId].q4,codewords[rightId].q4);
  pairRecords.push(freeze({left:leftId,right:rightId,q3_distance:q3.distance,q4_distance:q4.distance,signature_distance:q3.distance+q4.distance,q3_certificate:q3,q4_certificate:q4}));
 }
 const dMin=Math.min(...pairRecords.map(r=>r.signature_distance));
 const minPairs=pairRecords.filter(r=>r.signature_distance===dMin).map(r=>`${r.left}:${r.right}`);

 // Calibration against inherited exact two-move vulnerability: all distinct lawful packets in this frozen code family should cost two anchored reassignments.
 const packetDistances=pairRecords.flatMap(r=>[r.q3_distance,r.q4_distance]);
 const inheritedTwoMoveCalibrated=packetDistances.every(d=>d===2);

 // Tight constructive H0 -> H1 codeword impersonation: q3 kernel D_19 -> D_18 and q4 D_24 -> D_17.
 const q3Path=lawfulKernelSwapPath(codewords.H0.q3,codewords.H1.q3);
 const q4Path=lawfulKernelSwapPath(codewords.H0.q4,codewords.H1.q4);
 const tightPath=freeze({
  from:'H0',to:'H1',q3:q3Path,q4:q4Path,total_membership_moves:q3Path.move_count+q4Path.move_count,
  exact_target_reached:q3Path.terminal_matches_target&&q4Path.terminal_matches_target
 });

 const everyPacketSearchExhaustive=pairRecords.every(r=>r.q3_certificate.nonzero_block_matching.assignment_count===720&&r.q4_certificate.nonzero_block_matching.assignment_count===720);
 const everyPairBothPacketsDiffer=pairRecords.every(r=>r.q3_distance>0&&r.q4_distance>0);
 const threeOrFewerCannotReachOtherClean=dMin>=4;
 const tight=dMin===4&&tightPath.total_membership_moves===4&&tightPath.exact_target_reached;
 const pass=pairRecords.length===6&&dMin===4&&minPairs.length===6&&inheritedTwoMoveCalibrated&&everyPacketSearchExhaustive&&everyPairBothPacketsDiffer&&threeOrFewerCannotReachOtherClean&&tight;

 return freeze({
  schema:PARTITION_SIGNATURE_CODE_DISTANCE_SCHEMA,
  spec_head:PARTITION_SIGNATURE_CODE_DISTANCE_SPEC_HEAD,
  source_status:'DERIVATIONAL_PLUS_EXACT_FINITE_ENUMERATION',
  arithmetic_domain:'F_31',
  ecology:freeze(ECOLOGY),
  prediction_table:PRED,
  clean_codewords:codewords,
  pairwise_distance_ledger:freeze(pairRecords),
  minimum_signature_distance:dMin,
  minimum_distance_pairs:freeze(minPairs),
  inherited_two_move_calibration:freeze({all_distinct_hypothesis_packet_distances_equal_two:inheritedTwoMoveCalibrated,observed_packet_distances:freeze(packetDistances)}),
  constructive_tight_attack:tightPath,
  findings:freeze({
   zero_block_correspondence_anchored:true,
   all_nonzero_block_permutation_searches_exhaustive:everyPacketSearchExhaustive,
   all_distinct_hypotheses_differ_in_both_packets:everyPairBothPacketsDiffer,
   every_distinct_clean_hypothesis_packet_pair_has_anchored_distance_two:inheritedTwoMoveCalibrated,
   minimum_two_packet_signature_distance_four:dMin===4,
   three_or_fewer_anchored_reassignments_cannot_exactly_impersonate_another_clean_signature:threeOrFewerCannotReachOtherClean,
   explicit_four_reassignment_exact_impersonation_exists:tight,
   correction_radius_earned:false,
   assay_mechanism_validated:pass
  }),
  bounded_answer:pass?'THE_AUTHORED_Q3_Q4_PARTITION_SIGNATURE_FAMILY_HAS_MINIMUM_ANCHORED_REASSIGNMENT_DISTANCE_FOUR_SO_EXACT_IMPERSONATION_OF_A_DIFFERENT_CLEAN_SIGNATURE_REQUIRES_AT_LEAST_FOUR_CROSS_PACKET_MEMBERSHIP_REASSIGNMENTS_AND_AN_EXPLICIT_FOUR_REASSIGNMENT_ATTACK_ESTABLISHES_TIGHTNESS':'PARTITION_SIGNATURE_CODE_DISTANCE_ASSAY_FAILED',
  research_label:pass?'ANCHORED_TWO_PACKET_PARTITION_SIGNATURE_DISTANCE':'NOT_EARNED',
  claim_ceiling:freeze({
   bounded_clean_codeword_impersonation_distance:pass,
   arbitrary_corruption_detection:false,
   error_correction:false,
   provenance_recovery_from_terminal_observation:false,
   cryptographic_security:false,
   byzantine_fault_tolerance:false,
   physical_robustness:false,
   td613_general_code_theorem:false,
   proto_loom:false,
   production_authority:false,
   vercel_authority:false
  }),
  promotion_authority:false,
  production_mutated:false,
  human_closure_required:true
 });
}
