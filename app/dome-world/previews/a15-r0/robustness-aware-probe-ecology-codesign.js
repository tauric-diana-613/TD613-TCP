export const ROBUSTNESS_AWARE_CODESIGN_SCHEMA='td613.aia.robustness-aware-probe-ecology-codesign/v0.1';
export const ROBUSTNESS_AWARE_CODESIGN_SPEC_HEAD='d36e2b8280bb6cd4f9166c73adf1c5eef97b1dce';
export const MODULUS=31;

const PROBES=Object.freeze({q1:Object.freeze([1,3]),q2:Object.freeze([1,7]),q3:Object.freeze([1,11]),q4:Object.freeze([1,19])});
const PRED=Object.freeze({
 H0:Object.freeze({q1:Object.freeze([1,7]),q2:Object.freeze([1,5]),q3:Object.freeze([1,13]),q4:Object.freeze([1,9])}),
 H1:Object.freeze({q1:Object.freeze([1,4]),q2:Object.freeze([1,8]),q3:Object.freeze([1,12]),q4:Object.freeze([1,20])}),
 H2:Object.freeze({q1:Object.freeze([1,24]),q2:Object.freeze([1,28]),q3:Object.freeze([1,19]),q4:Object.freeze([1,18])}),
 H3:Object.freeze({q1:Object.freeze([1,7]),q2:Object.freeze([1,25]),q3:Object.freeze([1,20]),q4:Object.freeze([1,29])})
});
const HYPOTHESES=Object.freeze(Object.keys(PRED));
const PROBE_IDS=Object.freeze(Object.keys(PROBES));

function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
function mod(v){return ((Number(v)%MODULUS)+MODULUS)%MODULUS;}
function inv(v){const a=mod(v);if(!a)throw new Error('zero inverse');for(let k=1;k<MODULUS;k+=1)if(mod(a*k)===1)return k;throw new Error('inverse missing');}
function kernelId(r){const [a,b]=r.map(mod);if(b)return `D_${mod(-a*inv(b))}`;return 'D_inf';}
function stateFromId(id){if(id==='D_inf')return freeze({id,vector:freeze([0,1])});return freeze({id,vector:freeze([1,Number(id.slice(2))])});}
function rowVector(r,v){return mod(r[0]*v[0]+r[1]*v[1]);}
function canonicalBlocks(blocks){return freeze(blocks.filter(b=>b.length).map(b=>freeze([...b].sort())).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))));}
function partition(r,ecology){const buckets=new Map();for(const s of ecology){const value=rowVector(r,s.vector);if(!buckets.has(value))buckets.set(value,[]);buckets.get(value).push(s.id);}return canonicalBlocks([...buckets.values()]);}
function pkey(p){return JSON.stringify(p);}
function zeroBlock(p){const z=p.find(b=>b.includes('ZERO'));if(!z)throw new Error('ZERO block missing');return z;}
function intersectionCount(a,b){const bs=new Set(b);let n=0;for(const x of a)if(bs.has(x))n+=1;return n;}
function nonZeroBlocks(p){return p.filter(b=>!b.includes('ZERO'));}
function exactMaximumOverlap(left,right){
 const memo=new Map();
 function rec(i,mask){const key=`${i}:${mask}`;if(memo.has(key))return memo.get(key);if(i===left.length)return 0;let best=rec(i+1,mask);for(let j=0;j<right.length;j+=1)if((mask&(1<<j))===0){const score=intersectionCount(left[i],right[j])+rec(i+1,mask|(1<<j));if(score>best)best=score;}memo.set(key,best);return best;}
 return rec(0,0);
}
function anchoredPacketDistance(a,b,ecologySize){const keep=intersectionCount(zeroBlock(a),zeroBlock(b))+exactMaximumOverlap(nonZeroBlocks(a),nonZeroBlocks(b));return ecologySize-keep;}
function subsets(values){const out=[];for(let mask=1;mask<(1<<values.length);mask+=1){const s=[];for(let i=0;i<values.length;i+=1)if(mask&(1<<i))s.push(values[i]);out.push(freeze(s));}return freeze(out);}
function hypothesisPairs(){const out=[];for(let i=0;i<HYPOTHESES.length;i+=1)for(let j=i+1;j<HYPOTHESES.length;j+=1)out.push(freeze([HYPOTHESES[i],HYPOTHESES[j]]));return freeze(out);}
const PAIRS=hypothesisPairs();

function buildDesign(selectedProbes){
 const kernels=new Set();for(const h of HYPOTHESES)for(const q of selectedProbes)kernels.add(kernelId(PRED[h][q]));
 const kernelIds=[...kernels].sort();const ecology=freeze([freeze({id:'ZERO',vector:freeze([0,0])}),...kernelIds.map(stateFromId)]);
 const signatures=freeze(Object.fromEntries(HYPOTHESES.map(h=>[h,freeze(Object.fromEntries(selectedProbes.map(q=>[q,partition(PRED[h][q],ecology)]))) ])));
 const signatureKeys=HYPOTHESES.map(h=>JSON.stringify(selectedProbes.map(q=>pkey(signatures[h][q]))));
 const identificationAdmissible=new Set(signatureKeys).size===HYPOTHESES.length;
 const pairwise={};
 for(const [a,b] of PAIRS){let total=0;const packetDistances={};for(const q of selectedProbes){const d=anchoredPacketDistance(signatures[a][q],signatures[b][q],ecology.length);packetDistances[q]=d;total+=d;}pairwise[`${a}:${b}`]=freeze({packet_distances:freeze(packetDistances),total});}
 const totals=Object.values(pairwise).map(x=>x.total),dMin=Math.min(...totals),bottlenecks=Object.entries(pairwise).filter(([,v])=>v.total===dMin).map(([k])=>k);
 return freeze({
  probes:selectedProbes,probe_count:selectedProbes.length,kernel_state_ids:freeze(kernelIds),ecology_state_count:ecology.length,identification_admissible:identificationAdmissible,minimum_clean_signature_distance:dMin,bottleneck_hypothesis_pairs:freeze(bottlenecks),pairwise_signature_distances:freeze(pairwise),signatures,ecology
 });
}
function dominates(a,b){if(!a.identification_admissible||!b.identification_admissible)return false;const weak=a.probe_count<=b.probe_count&&a.ecology_state_count<=b.ecology_state_count&&a.minimum_clean_signature_distance>=b.minimum_clean_signature_distance;const strict=a.probe_count<b.probe_count||a.ecology_state_count<b.ecology_state_count||a.minimum_clean_signature_distance>b.minimum_clean_signature_distance;return weak&&strict;}

export function runRobustnessAwareProbeEcologyCodesignAssay(){
 const designs=freeze(subsets(PROBE_IDS).map(buildDesign));
 const admissible=designs.filter(d=>d.identification_admissible);
 const frontier=freeze(admissible.filter(d=>!admissible.some(other=>other!==d&&dominates(other,d))).map(d=>freeze({probes:d.probes,probe_count:d.probe_count,ecology_state_count:d.ecology_state_count,minimum_clean_signature_distance:d.minimum_clean_signature_distance})));
 const byKey=new Map(designs.map(d=>[d.probes.join('+'),d]));
 const q1=byKey.get('q1'),q2=byKey.get('q2'),q3=byKey.get('q3'),q4=byKey.get('q4'),q3q4=byKey.get('q3+q4'),robustTriple=byKey.get('q2+q3+q4'),allFour=byKey.get('q1+q2+q3+q4');
 const greaterThanFour=freeze(admissible.filter(d=>d.minimum_clean_signature_distance>4).map(d=>freeze({probes:d.probes,probe_count:d.probe_count,ecology_state_count:d.ecology_state_count,minimum_clean_signature_distance:d.minimum_clean_signature_distance,bottleneck_hypothesis_pairs:d.bottleneck_hypothesis_pairs})));
 const allSubsetsPresent=designs.length===15&&new Set(designs.map(d=>d.probes.join('+'))).size===15;
 const singleProbeAudit=!q1.identification_admissible&&q2.identification_admissible&&q3.identification_admissible&&q4.identification_admissible;
 const inheritedReproduced=q3q4.identification_admissible&&q3q4.minimum_clean_signature_distance===4&&q3q4.ecology_state_count===8;
 const robustTriplePass=robustTriple.identification_admissible&&robustTriple.minimum_clean_signature_distance===6&&robustTriple.ecology_state_count===12;
 const q1BottleneckControl=allFour.minimum_clean_signature_distance===robustTriple.minimum_clean_signature_distance&&allFour.probe_count>robustTriple.probe_count&&allFour.ecology_state_count>robustTriple.ecology_state_count&&allFour.bottleneck_hypothesis_pairs.includes('H0:H3')&&JSON.stringify(PRED.H0.q1)===JSON.stringify(PRED.H3.q1);
 const frontierKeys=frontier.map(x=>x.probes.join('+'));
 const expectedFrontier=['q2','q3','q4','q3+q4','q2+q3+q4'];
 const frontierPass=expectedFrontier.every(k=>frontierKeys.includes(k))&&frontierKeys.length===expectedFrontier.length;
 const pass=allSubsetsPresent&&singleProbeAudit&&inheritedReproduced&&robustTriplePass&&q1BottleneckControl&&frontierPass&&greaterThanFour.length===2;
 return freeze({
  schema:ROBUSTNESS_AWARE_CODESIGN_SCHEMA,spec_head:ROBUSTNESS_AWARE_CODESIGN_SPEC_HEAD,source_status:'DERIVATIONAL',arithmetic_domain:'F_31',prediction_table:PRED,complete_subset_census:designs,
  pareto_frontier:frontier,designs_with_minimum_distance_above_four:greaterThanFour,
  comparisons:freeze({
   efficiency_pair:freeze({probes:q3q4.probes,probe_count:q3q4.probe_count,ecology_state_count:q3q4.ecology_state_count,minimum_clean_signature_distance:q3q4.minimum_clean_signature_distance}),
   robustness_triple:freeze({probes:robustTriple.probes,probe_count:robustTriple.probe_count,ecology_state_count:robustTriple.ecology_state_count,minimum_clean_signature_distance:robustTriple.minimum_clean_signature_distance}),
   redundant_q1_control:freeze({triple_without_q1:robustTriple.minimum_clean_signature_distance,all_four_with_q1:allFour.minimum_clean_signature_distance,q1_H0_H3_alias:true,added_probe_increases_minimum_distance:false})
  }),
  findings:freeze({all_fifteen_nonempty_subsets_censused:allSubsetsPresent,q1_single_probe_preserves_H0_H3_alias:!q1.identification_admissible,q2_q3_q4_each_single_probe_identifies_all_four_hypotheses:q2.identification_admissible&&q3.identification_admissible&&q4.identification_admissible,inherited_q3_q4_design_reproduces_minimum_distance_four:inheritedReproduced,q2_q3_q4_triple_reaches_minimum_distance_six:robustTriplePass,adding_q1_to_robustness_triple_adds_cost_without_increasing_minimum_distance:q1BottleneckControl,pareto_frontier_matches_exact_finite_census:frontierPass,design_optimality_changes_with_declared_epistemic_guarantee:inheritedReproduced&&robustTriplePass,assay_mechanism_validated:pass}),
  bounded_answer:pass?'THE_EFFICIENCY_OPTIMAL_AND_ROBUSTNESS_SEEKING_PROBE_ECOLOGY_ARCHITECTURES_DIFFER_IN_THE_FROZEN_HYPOTHESIS_FAMILY_BECAUSE_ADDED_MEASUREMENT_REDUNDANCY_ONLY_INCREASES_MINIMUM_CLEAN_SIGNATURE_SEPARATION_WHEN_IT_DISTINGUISHES_THE_ACTIVE_BOTTLENECK_HYPOTHESIS_PAIR':'ROBUSTNESS_AWARE_PROBE_ECOLOGY_CODESIGN_ASSAY_FAILED',
  research_label:pass?'GUARANTEE_RELATIVE_OBSERVATION_ARCHITECTURE_CODESIGN':'NOT_EARNED',
  claim_ceiling:freeze({bounded_finite_codesign_frontier:pass,universal_experimental_design_theorem:false,generic_coding_theorem:false,arbitrary_attack_tolerance:false,cryptographic_integrity:false,byzantine_tolerance:false,physical_tomography:false,continuum_information_geometry:false,td613_general_aia_theorem:false,proto_loom:false,production_authority:false,vercel_authority:false}),
  promotion_authority:false,production_mutated:false,human_closure_required:true
 });
}
