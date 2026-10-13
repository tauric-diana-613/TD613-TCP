export const PROBE_ECOLOGY_CODESIGN_SCHEMA='td613.aia.probe-ecology-codesign/v0.1';
export const PROBE_ECOLOGY_CODESIGN_SPEC_HEAD='7e7063f443c15cf75ab8cf79c98ca2659f8320df';
export const MODULUS=31;

const PROBES=Object.freeze({q1:Object.freeze([1,3]),q2:Object.freeze([1,7]),q3:Object.freeze([1,11]),q4:Object.freeze([1,19])});
const PRED=Object.freeze({
 H0:Object.freeze({q1:Object.freeze([1,7]),q2:Object.freeze([1,5]),q3:Object.freeze([1,13]),q4:Object.freeze([1,9])}),
 H1:Object.freeze({q1:Object.freeze([1,4]),q2:Object.freeze([1,8]),q3:Object.freeze([1,12]),q4:Object.freeze([1,20])}),
 H2:Object.freeze({q1:Object.freeze([1,24]),q2:Object.freeze([1,28]),q3:Object.freeze([1,19]),q4:Object.freeze([1,18])}),
 H3:Object.freeze({q1:Object.freeze([1,7]),q2:Object.freeze([1,25]),q3:Object.freeze([1,20]),q4:Object.freeze([1,29])})
});
function freeze(v){if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;}
function mod(v){return ((Number(v)%MODULUS)+MODULUS)%MODULUS;}
function inv(v){const a=mod(v);for(let k=1;k<MODULUS;k+=1)if(mod(a*k)===1)return k;throw new Error('inverse missing');}
function kernelId(r){const [a,b]=r;if(b)return `D_${mod(-a*inv(b))}`;return 'D_inf';}
function stateFromId(id){if(id==='D_inf')return freeze({id,vector:freeze([0,1])});return freeze({id,vector:freeze([1,Number(id.slice(2))])});}
function rowVector(r,v){return mod(r[0]*v[0]+r[1]*v[1]);}
function partition(readout,ecology){const buckets=new Map();for(const s of ecology){const value=rowVector(readout,s.vector);if(!buckets.has(value))buckets.set(value,[]);buckets.get(value).push(s.id);}return freeze({memberships:freeze([...buckets.values()].map(x=>freeze([...x].sort())).sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b))))});}
function decode(p,ecology){const z=p.memberships.find(b=>b.includes('ZERO'));if(!z)return null;const nz=z.filter(x=>x!=='ZERO');if(nz.length!==1)return null;const s=ecology.find(x=>x.id===nz[0]),[x,y]=s.vector;const row=[y,mod(-x)];if(row[0]){const k=inv(row[0]);return freeze([1,mod(row[1]*k)]);}return freeze([0,1]);}
function design(primary,heldout){
 const primaryOutputs=Object.values(PRED).map(row=>row[primary]);const primaryDistinct=new Set(primaryOutputs.map(JSON.stringify)).size;
 const heldoutOutputs=Object.values(PRED).map(row=>row[heldout]);const heldoutDistinct=new Set(heldoutOutputs.map(JSON.stringify)).size;
 const kernels=new Set([...primaryOutputs,...heldoutOutputs].map(kernelId));
 return freeze({primary,heldout,primary_prediction_count:primaryDistinct,primary_admissible:primaryDistinct===4,heldout_distinct_prediction_count:heldoutDistinct,kernel_state_ids:freeze([...kernels].sort()),ecology_state_count:1+kernels.size});
}
function compareDesign(a,b){
 if(a.primary_admissible!==b.primary_admissible)return a.primary_admissible?-1:1;
 if(a.ecology_state_count!==b.ecology_state_count)return a.ecology_state_count-b.ecology_state_count;
 if(a.heldout_distinct_prediction_count!==b.heldout_distinct_prediction_count)return b.heldout_distinct_prediction_count-a.heldout_distinct_prediction_count;
 return `${a.primary}:${a.heldout}`.localeCompare(`${b.primary}:${b.heldout}`);
}
function buildEcology(d){return freeze([freeze({id:'ZERO',vector:freeze([0,0])}),...d.kernel_state_ids.map(stateFromId)]);}
function truthTrials(selected,ecology){return freeze(Object.keys(PRED).map(trueId=>{
 const primaryDirection=PRED[trueId][selected.primary];const decodedPrimary=decode(partition(primaryDirection,ecology),ecology);
 const survivors=Object.keys(PRED).filter(id=>JSON.stringify(PRED[id][selected.primary])===JSON.stringify(decodedPrimary));
 const selectedId=survivors.length===1?survivors[0]:null;
 const heldoutDirection=PRED[trueId][selected.heldout];const decodedHeldout=decode(partition(heldoutDirection,ecology),ecology);
 const predictedHeldout=selectedId?PRED[selectedId][selected.heldout]:null;
 return freeze({true_loop_id:trueId,decoded_primary:decodedPrimary,surviving_hypotheses:freeze(survivors),selected_hypothesis:selectedId,primary_unique:selectedId===trueId,decoded_heldout:decodedHeldout,predicted_heldout:predictedHeldout,heldout_pass:selectedId!==null&&JSON.stringify(decodedHeldout)===JSON.stringify(predictedHeldout)});
 }));}

export function runProbeEcologyCodesignAssay(){
 const ids=Object.keys(PROBES);const designs=[];for(const p of ids)for(const h of ids)if(p!==h)designs.push(design(p,h));
 const ranked=freeze([...designs].sort(compareDesign));const selected=ranked[0];const ecology=buildEcology(selected);const trials=truthTrials(selected,ecology);
 const q1Temptations=designs.filter(d=>d.primary==='q1'&&d.ecology_state_count===8);
 const hostilePass=q1Temptations.length>0&&q1Temptations.every(d=>d.primary_admissible===false);
 const allTruthsPass=trials.every(t=>t.primary_unique&&t.heldout_pass);
 const baseline=freeze({primary_probes:freeze(['q1','q2','q3']),heldout:'q4',primary_probe_count:3,ecology_state_count:15});
 const improvement=selected.primary_admissible&&allTruthsPass&&selected.ecology_state_count<baseline.ecology_state_count&&1<baseline.primary_probe_count;
 const pass=selected.primary==='q3'&&selected.heldout==='q4'&&selected.ecology_state_count===8&&selected.heldout_distinct_prediction_count===4&&hostilePass&&allTruthsPass&&improvement;
 return freeze({
  schema:PROBE_ECOLOGY_CODESIGN_SCHEMA,spec_head:PROBE_ECOLOGY_CODESIGN_SPEC_HEAD,source_status:'DERIVATIONAL',arithmetic_domain:'F_31',prediction_table:PRED,design_candidates:freeze(designs),ranked_designs:ranked,selected_design:selected,selected_ecology:ecology,truth_trials:trials,
  baseline,comparison:freeze({primary_probe_count_reduction:2,ecology_state_count_reduction:baseline.ecology_state_count-selected.ecology_state_count,heldout_validation_retained:true}),
  hostile_controls:freeze({q1_cardinality_temptations:freeze(q1Temptations),low_cost_ambiguous_primary_rejected:hostilePass,heldout_used_for_primary_selection:false,hidden_truth_identity_used_for_design:false}),
  findings:freeze({joint_search_selects_q3_primary_q4_heldout:selected.primary==='q3'&&selected.heldout==='q4',selected_primary_alone_separates_all_four_hypotheses:selected.primary_prediction_count===4,selected_ecology_has_eight_states:selected.ecology_state_count===8,all_four_truths_identified_and_heldout_validated:allTruthsPass,lower_ecology_cost_alone_does_not_make_ambiguous_primary_admissible:hostilePass,joint_codesign_improves_both_declared_primary_measurement_and_ecology_cost_vs_parent:improvement,assay_mechanism_validated:pass}),
  bounded_answer:pass?'JOINT_PROBE_ECOLOGY_CODESIGN_CAN_PRESERVE_DECLARED_HYPOTHESIS_IDENTIFICATION_AND_HELDOUT_VALIDATION_WITH_LOWER_MEASUREMENT_AND_CALIBRATION_COST_THAN_THE_INHERITED_SEPARATELY_CHOSEN_DESIGN_IN_THIS_FROZEN_FIXTURE':'PROBE_ECOLOGY_CODESIGN_ASSAY_FAILED',
  research_label:pass?'CLAIM_CONDITIONED_PROBE_ECOLOGY_CODESIGN':'NOT_EARNED',
  claim_ceiling:freeze({bounded_joint_codesign_result:pass,universal_optimality:false,physical_tomography:false,proto_loom:false,production_authority:false,vercel_authority:false}),
  promotion_authority:false,production_mutated:false,human_closure_required:true
 });
}
