/**
 * 𝌋 Vixen Synthesis Salon · source-only composition engine · RGI08.
 *
 * This is Vixen's own creative research Opera. It does not search or mutate
 * the independent Universal Encyclopedia, does not certify its own sources,
 * cannot ratify a human gate, and cannot launch Experiment B.
 *
 * The output is a falsifiable QUESTION and preregistration candidate, not
 * a validated unified theory or an observed emergent Manifest.
 */
export const SALON_SCHEMA='emstd613.vixen.reparative-salon-plan/v1';
export const SYNTHESIS_AUTHORITY=Object.freeze({
 source_body_access:'UNAVAILABLE_IN_PUBLIC_SURFACE',human_gate_closure:'RESERVED',
 cross_estate_authority:false,source_mutation:false,production_deployment:false,
 experiment_b_flight:'HELD',empirical_replication_credit:0,manifest_successor:'UNKNOWN'
});
export const CLOCKS=Object.freeze([
 {
  id:'k',code:'TCC-01',label:'Layer k',custodyName:'Discrete Layer',
  geometry:'DISCRETE_TRANSFORMER_LAYER',derivativeSymbol:'Δ_k',
  naturalPeriodLabel:'layer step',preferredClusters:Object.freeze(['I','V']),
  preferredPlanes:'C4_LAYER',omegaMultiplier:1.18
 },
 {
  id:'n',code:'TCC-02',label:'Token n',custodyName:'Token Index',
  geometry:'DISCRETE_TOKEN_INDEX',derivativeSymbol:'∂_n',
  naturalPeriodLabel:'token stride',preferredClusters:Object.freeze(['II','III']),
  preferredPlanes:'TOKEN_BASIS',omegaMultiplier:0.94
 },
 {
  id:'tau',code:'TCC-03',label:'Surrogate τ',custodyName:'Surrogate τ',
  geometry:'ODE_SURROGATE_TIME',derivativeSymbol:'d/dτ',
  naturalPeriodLabel:'1.0 τ unit',preferredClusters:Object.freeze(['III','IV']),
  preferredPlanes:'FLOW_TAU',omegaMultiplier:1.36
 },
 {
  id:'wall',code:'TCC-04',label:'Wall scheduler',custodyName:'Wall Scheduler',
  geometry:'WALL_CLOCK_SCHEDULER',derivativeSymbol:'d/dt_w',
  naturalPeriodLabel:'16.6 ms frame',preferredClusters:Object.freeze(['I','IV']),
  preferredPlanes:'SCHEDULER_FRAME',omegaMultiplier:0.76
 },
 {
  id:'plant',code:'TCC-05',label:'Plant 48 kHz',custodyName:'Plant 48 kHz',
  geometry:'AUDIO_SAMPLE_CLOCK',derivativeSymbol:'d/ds_p',
  naturalPeriodLabel:'20.8 µs sample',preferredClusters:Object.freeze(['II','V']),
  preferredPlanes:'PLANT_CARRIER',omegaMultiplier:1.54
 }
]);
const plain=s=>typeof s==='string'?s.trim():'';
const limited=(s,n=700)=>plain(s).slice(0,n);
const num=n=>Number.isFinite(Number(n))?Number(n):0;
const invariant=(b,why)=>{if(!b)throw new TypeError(why)};
const deepFreeze=o=>{
 if(o&&typeof o==='object'&&!Object.isFrozen(o)){Object.values(o).forEach(deepFreeze);Object.freeze(o)}
 return o
};
const lookup=(xs,id,key)=>xs.find(x=>x[key]===id);
const title=w=>w.display_title||w.declared_title||w.work_id;
const validWork=w=>Boolean(w?.work_id&&Array.isArray(w.linked_sources)&&w.authorship==='UNRESOLVED');
export function checkSalonCorpus(corpus){
 invariant(corpus&&typeof corpus==='object','MISSING_VIXEN_ARCHIVE');
 invariant(Array.isArray(corpus.works)&&corpus.works.length===32,'VIXEN_32_WORK_CENSUS_REQUIRED');
 invariant(corpus.works.reduce((n,w)=>n+w.linked_sources.length,0)===53,'VIXEN_53_SOURCE_CENSUS_REQUIRED');
 invariant(corpus.works.every(validWork),'VIXEN_AUTHORED_SOURCE_STATUS_MISSING');
 invariant(new Set(corpus.works.map(w=>w.work_id)).size===32,'VIXEN_SOURCE_DUPLICATE');
 invariant(Array.isArray(corpus.human_gates)&&corpus.human_gates.length===8,'VIXEN_EIGHT_UNADJUDICATED_GATES_REQUIRED');
 invariant(corpus.human_gates.every(g=>g.default_state==='UNADJUDICATED_PAIR'),'HUMAN_GATE_PROMOTION_REFUSED');
 invariant(Array.isArray(corpus.instruments)&&corpus.instruments.length===21,'VIXEN_21_INSTRUMENT_CENSUS_REQUIRED');
 invariant(Array.isArray(corpus.giveback_tracks)&&corpus.giveback_tracks.length===6,'VIXEN_SIX_GIVEBACK_TRACKS_REQUIRED');
 return deepFreeze({
  works:32,manifestations:53,human_gates:8,instruments:21,giveback_tracks:6,
  source_class:'HISTORICAL_METADATA',original_source_bodies:'UNAVAILABLE_IN_PUBLIC_SURFACE'
 });
}
const CLUSTER_ALIAS=Object.freeze({
 I:'C1',C1:'C1',II:'C2',C2:'C2',III:'C3',C3:'C3',IV:'C4',C4:'C4',V:'C5',C5:'C5'
});
const normCluster=c=>CLUSTER_ALIAS[String(c||'').trim().toUpperCase()]||String(c||'').trim();
const clampNum=(v,lo,hi)=>Math.max(lo,Math.min(hi,num(v)));

export function computeMatrixSvd2x2(M){
 const a=Number(M?.[0]?.[0]),b=Number(M?.[0]?.[1]),c=Number(M?.[1]?.[0]),d=Number(M?.[1]?.[1]);
 if(![a,b,c,d].every(Number.isFinite))
  return deepFreeze({valid:false,sigma_max:0,sigma_min:0,rank:0,condition:Infinity,classification:'INVALID_MATRIX'});
 const s1=a*a+b*b+c*c+d*d;
 const det=a*d-b*c;
 const disc=Math.sqrt(Math.max(0,s1*s1-4*det*det));
 const sigmaMax=Math.sqrt(Math.max(0,(s1+disc)/2));
 const sigmaMin=Math.sqrt(Math.max(0,(s1-disc)/2));
 const rank=sigmaMax<1e-12?0:(sigmaMin/sigmaMax<1e-7?1:2);
 const condition=sigmaMin>1e-12?sigmaMax/sigmaMin:Infinity;
 const classification=rank<2?'RANK_DEFICIENT':(condition>1e4?'ILL_CONDITIONED':'WELL_CONDITIONED');
 return deepFreeze({
  valid:true,
  sigma_max:+sigmaMax.toFixed(6),
  sigma_min:+sigmaMin.toFixed(6),
  rank,
  condition:Number.isFinite(condition)?+condition.toFixed(4):Infinity,
  classification
 });
}

export function project111Mirror(vector){
 const xs=Array.isArray(vector)&&vector.length===3?vector.map(num):[1,1,1];
 const mean=(xs[0]+xs[1]+xs[2])/3;
 const proj=[mean,mean,mean];
 const nullComp=[xs[0]-mean,xs[1]-mean,xs[2]-mean];
 const totalE=xs[0]*xs[0]+xs[1]*xs[1]+xs[2]*xs[2];
 const nullE=nullComp[0]*nullComp[0]+nullComp[1]*nullComp[1]+nullComp[2]*nullComp[2];
 return deepFreeze({
  vector:xs,
  projection:proj.map(v=>+v.toFixed(6)),
  nullspace_component:nullComp.map(v=>+v.toFixed(6)),
  total_energy:+totalE.toFixed(6),
  nullspace_energy:+nullE.toFixed(6),
  nullspace_ratio:totalE>1e-12?+(nullE/totalE).toFixed(6):0,
  projection_orthogonal_to_111:true
 });
}

export function computeDiscreteXorSynergy(samples){
 const rows=Array.isArray(samples)&&samples.length>0?samples:[
  {x:0,y:0,z:0},{x:0,y:1,z:1},{x:1,y:0,z:1},{x:1,y:1,z:0}
 ];
 const n=rows.length;
 const cXZ=new Map(),cYZ=new Map(),cXYZ=new Map(),cX=new Map(),cY=new Map(),cXY=new Map(),cZ=new Map();
 const inc=(m,k)=>m.set(k,(m.get(k)||0)+1);
 for(const r of rows){
  const x=String(r?.x??0),y=String(r?.y??0),z=String(r?.z??0);
  inc(cX,x);inc(cY,y);inc(cZ,z);
  inc(cXY,x+'|'+y);inc(cXZ,x+'|'+z);inc(cYZ,y+'|'+z);inc(cXYZ,x+'|'+y+'|'+z);
 }
 const h=counts=>{let s=0;for(const v of counts.values()){const p=v/n;if(p>0)s-=p*Math.log2(p);}return s;};
 const miXY_Z=Math.max(0,h(cXY)+h(cZ)-h(cXYZ));
 const miX_Z=Math.max(0,h(cX)+h(cZ)-h(cXZ));
 const miY_Z=Math.max(0,h(cY)+h(cZ)-h(cYZ));
 const redundancy=Math.min(miX_Z,miY_Z);
 const synergy=Math.max(0,miXY_Z-Math.max(miX_Z,miY_Z));
 return deepFreeze({
  sample_count:n,
  I_X_Z_bits:+miX_Z.toFixed(6),
  I_Y_Z_bits:+miY_Z.toFixed(6),
  I_XY_Z_bits:+miXY_Z.toFixed(6),
  redundancy_bits:+redundancy.toFixed(6),
  synergy_bits:+synergy.toFixed(6),
  synergistic_emergence:synergy>1e-6&&miX_Z<1e-6&&miY_Z<1e-6
 });
}

function buildClockTicks(t,order,offsets){
 const off=(id)=>Math.max(-24,Math.min(24,Math.round(num(offsets?.[id]))));
 const rev=order==='B_A'?1:0;
 const rows=[
  {id:'k',base:Math.round(8+.30*t),shift:rev?Math.round(7+.14*t):0,rule:rev?'8 + round(.30*lag) + h_k(rev)':'8 + round(.30*lag)'},
  {id:'n',base:Math.round(15+.80*t),shift:rev?-Math.round(9-.08*t):0,rule:rev?'15 + round(.80*lag) + h_n(rev)':'15 + round(.80*lag)'},
  {id:'tau',base:Math.round(27+.42*t),shift:rev?Math.round(6+.18*t):0,rule:rev?'27 + round(.42*lag) + h_τ(rev)':'27 + round(.42*lag)'},
  {id:'wall',base:Math.round(35+1.05*t),shift:rev?-Math.round(18+.05*t):0,rule:rev?'35 + round(1.05*lag) + h_w(rev)':'35 + round(1.05*lag)'},
  {id:'plant',base:Math.round(5+.12*t),shift:rev?Math.round(14+.22*t):0,rule:rev?'5 + round(.12*lag) + h_p(rev)':'5 + round(.12*lag)'}
 ];
 return rows.map((x,i)=>{
  const adj=off(x.id);
  const tick=Math.max(1,x.base+x.shift+adj);
  return {
   id:x.id,code:CLOCKS[i].code,tick,hysteresis_shift:x.shift,vernier_offset:adj,
   rule:x.rule,label:CLOCKS[i].label,custodyName:CLOCKS[i].custodyName,
   geometry:CLOCKS[i].geometry,derivativeSymbol:CLOCKS[i].derivativeSymbol,
   evidence_class:'SYNTHETIC_DIMENSIONLESS_CLOCK_TICKS_ONLY'
  };
 });
}
function rankInversions(aIds,bIds){
 let inv=0;
 const pos=new Map(bIds.map((id,i)=>[id,i]));
 for(let i=0;i<aIds.length;i++){
  for(let j=i+1;j<aIds.length;j++){
   if((pos.get(aIds[i])??0)>(pos.get(aIds[j])??0))inv+=1;
  }
 }
 return inv;
}
export function toyClockAssay({lag=30,routeOrder='A_B',offsets=null}={}){
 const t=Math.max(0,Math.min(120,Math.round(num(lag))));
 const order=routeOrder==='B_A'?'B_A':'A_B';
 // Pure dimensionless DEMONSTRATION ticks; these are not comparable physical
 // times without independent calibration and a declared conversion map.
 const fwd=buildClockTicks(t,'A_B',offsets);
 const rev=buildClockTicks(t,'B_A',offsets);
 const c=order==='B_A'?rev:fwd;
 const sortByTick=xs=>[...xs].sort((a,b)=>a.tick-b.tick||a.id.localeCompare(b.id));
 const fwdOrder=sortByTick(fwd).map(x=>x.id);
 const revOrder=sortByTick(rev).map(x=>x.id);
 const sortedOrder=order==='B_A'?revOrder:fwdOrder;
 const preemptionGap=fwd.reduce((acc,f,idx)=>acc+Math.abs(f.tick-rev[idx].tick),0);
 const burdenDelta=rev.reduce((s,x)=>s+x.tick,0)-fwd.reduce((s,x)=>s+x.tick,0);
 return deepFreeze({
  schema:'emstd613.vixen.synthetic-five-clock-demonstration/v1',
  parameter_lag_ticks:t,
  route_order:order,non_commutative:true,
  clocks:c,arrival_order:sortedOrder,
  preemption_gap:preemptionGap,
  route_burden_delta:order==='B_A'?burdenDelta:0,
  holonomy_winding:order==='B_A'?rankInversions(fwdOrder,revOrder):0,
  physical_time_equivalence:false,measured_clock_latency:false,
  source_promotion:false,claim:'SENSITIVITY_DEMONSTRATION_NOT_EMPIRICAL_DERIVATIVE'
 });
}
export function computeClockVernier(lag=30,{route='A_B',activeClockId='k',workA=null,workB=null,clockOffsets=null}={}){
 const forward=toyClockAssay({lag,routeOrder:'A_B',offsets:clockOffsets});
 const reverse=toyClockAssay({lag,routeOrder:'B_A',offsets:clockOffsets});
 const active=CLOCKS.find(x=>x.id===activeClockId)||CLOCKS[0];
 const idx=CLOCKS.findIndex(x=>x.id===active.id);
 const activeSpread=Math.abs((reverse.clocks[idx]?.tick||0)-(forward.clocks[idx]?.tick||0));
 const arrivalInversions=rankInversions(forward.arrival_order,reverse.arrival_order);
 const preferred=new Set((active.preferredClusters||[]).map(normCluster));
 const aligned=[workA?.cluster,workB?.cluster].filter(Boolean).filter(c=>preferred.has(normCluster(c)));
 return deepFreeze({
  schema:'emstd613.vixen.clock-vernier/v1',
  lag_ticks:forward.parameter_lag_ticks,
  route_order:route==='B_A'?'B_A':'A_B',
  active_clock_id:active.id,
  active_clock:active,
  forward,reverse,
  arrival_inversions:arrivalInversions,
  tick_l1_delta:forward.preemption_gap,
  active_tick_spread:activeSpread,
  cluster_aligned:aligned,
  non_commutative_witness:forward.arrival_order.join(',')!==reverse.arrival_order.join(','),
  physical_time_equivalence:false
 });
}
function sourceEntry(w,requested){
 if(requested!==undefined&&requested!==null&&
   !w.linked_sources.some(x=>x.source_file_id===requested))
   throw new TypeError('INVALID_SOURCE_IDENTITY');
 const chosen=lookup(w.linked_sources,requested,'source_file_id')||w.linked_sources[0];
 invariant(chosen?.source_file_id&&/^[a-f0-9]{64}$/i.test(chosen.sha256||''),'INVALID_SOURCE_IDENTITY');
 return {
  work_id:w.work_id,recorded_title:title(w),cluster:w.cluster,
  identity_status:w.identity_status,authorship:w.authorship,
  human_gate_required:Boolean(w.human_gate_required),
  gate_num:w.human_gate_required?w.gate_num:null,
  source_file_id:chosen.source_file_id,original_filename:chosen.original_filename,
  declared_source_sha256:chosen.sha256,media_type:chosen.media_type,
  source_content_verified:false,source_body_available:false
 };
}
function computePairTension(a,b,vernier){
 const planesA=new Set(a?.planes||[]),planesB=new Set(b?.planes||[]);
 const sharedPlanes=[...planesA].filter(p=>planesB.has(p));
 const allPlanes=[...new Set([...planesA,...planesB])];
 const symDiffPlanes=allPlanes.filter(p=>!(planesA.has(p)&&planesB.has(p)));
 const hasWPlaneGrounding=allPlanes.includes('W-PLANE');
 const protA=new Set(a?.protocols||[]),protB=new Set(b?.protocols||[]);
 const sharedProtocols=[...protA].filter(p=>protB.has(p));
 const bridgingProtocols=[...new Set([...protA,...protB])].filter(p=>!(protA.has(p)&&protB.has(p)));
 const clockForCluster=cl=>{
  const nc=normCluster(cl);
  return CLOCKS.find(ck=>(ck.preferredClusters||[]).some(p=>normCluster(p)===nc))||CLOCKS[0];
 };
 const clockA=clockForCluster(a?.cluster),clockB=clockForCluster(b?.cluster);
 const frequencyRatio=+(clockB.omegaMultiplier/clockA.omegaMultiplier).toFixed(4);
 return {
  clusters:[a?.cluster||'UNKNOWN',b?.cluster||'UNKNOWN'],
  shared_planes:sharedPlanes,
  sym_diff_planes:symDiffPlanes,
  has_w_plane_grounding:hasWPlaneGrounding,
  touches_p_membrane:symDiffPlanes.includes('P-MEMBRANE'),
  shared_protocols:sharedProtocols,
  bridging_protocols:bridgingProtocols,
  clock_pair:[clockA.id,clockB.id],
  clock_frequency_ratio:frequencyRatio,
  inversions:vernier.arrival_inversions,
  l1_delta:vernier.tick_l1_delta
 };
}

function questionTemplate(a,b,track,method,seq='A_B',tension=null){
 const left=title(a),right=title(b);
 const anchor=seq==='B_A'?right:left,probe=seq==='B_A'?left:right;
 const planeNote=tension&&tension.sym_diff_planes.length
  ?` across diverging planes [${tension.sym_diff_planes.join(', ')}]`:' within shared plane boundaries';
 const groundNote=tension&&!tension.has_w_plane_grounding
  ?' (FLAGGED: missing W-PLANE physical witness grounding — hold any mechanism promotion)':'';
 return 'Anchored by '+anchor+' ▷ '+probe+': under '+track.title+' and '+String(method.family||'documentary')+
  ' custody'+planeNote+' (ω ratio '+String(tension?.clock_frequency_ratio||1)+'), what falsifiable structural invariant separates shared state machinery from superficial metaphor without inferring shared authorship?'+groundNote;
}
function preregisteredMeasurements(){
 const measures=[
  {id:'U_QUESTION',title:'Blinded question usefulness',
   unit:'PREDECLARED_RUBRIC_SCORE',
   formula:'ΔU = mean(U_synthesis) - mean(U_competent_union)',
   positive_interpretation:'A positive effect under matched independent adjudication would warrant further testing, not Manifest admission.'},
  {id:'F_PROVENANCE',title:'Source-attribution error',
   unit:'ERRORS_PER_ADJUDICATED_QUESTION',
   formula:'ΔF = error_rate_synthesis - error_rate_competent_union',
   positive_interpretation:'Lower error rate would indicate a bounded custody-quality benefit, independent of question novelty.'},
  {id:'C_VERIFICATION',title:'Additional verification burden',
   unit:'COUNTED_SOURCE_CHECKS_OR_HUMAN_MINUTES_AS_PREREGISTERED',
   formula:'ΔC = cost_synthesis - cost_competent_union',
   positive_interpretation:'A negative cost difference would support an operational-efficiency claim only.'},
  {id:'O_ROUTE',title:'Order-sensitive question differences',
   unit:'MATCHED_BLINDED_COMPARISON',
   formula:'O = distance(Q_AB,Q_BA) under fixed source-set and rubric',
   positive_interpretation:'An observed difference identifies route sensitivity, not automatic noncommutativity in all worlds.'}
 ];
 return measures.map(x=>({...x,observed_value:null,
  evidence_class:'PROSPECTIVE_MEASUREMENT_DEFINITION_NOT_RESULT',
  preregistration_state:'REQUIRES_INDEPENDENT_ADJUDICATION'}));
}
export function composeSalonPlan(corpus,input={}){
 checkSalonCorpus(corpus);
 const ids=Array.isArray(input.work_ids)?input.work_ids:[];
 invariant(ids.length===2&&ids[0]!==ids[1],'TWO_DISTINCT_VIXEN_WORKS_REQUIRED');
 const [a,b]=ids.map(id=>lookup(corpus.works,id,'work_id'));
 invariant(a&&b,'WORK_ID_NOT_IN_VIXEN_CORPUS');
 const track=lookup(corpus.giveback_tracks,input.track_id,'id');
 invariant(track,'GIVEBACK_TRACK_ID_REQUIRED');
 const method=lookup(corpus.instruments,input.protocol_id,'instrument_id');
 invariant(method,'RECORDED_PROTOCOL_REQUIRED');
 const left=sourceEntry(a,input.source_ids?.[0]),right=sourceEntry(b,input.source_ids?.[1]);
 const seq=input.route_order==='B_A'?'B_A':'A_B';
 const route=seq==='A_B'?[left.source_file_id,right.source_file_id]:[right.source_file_id,left.source_file_id];
 const deficits=[
  'Original source bodies are unavailable in the public catalogue.',
  'No independent external witness has established any cross-Work causal relationship.',
  'No human ratification has closed the eight bilateral source-identity gates.',
  'No Experiment B arm has been run by this session.'
 ];
 const gateIds=[...new Set([left,right].filter(x=>x.human_gate_required).map(x=>x.gate_num))];
 const vernier=computeClockVernier(input.lag_ticks,{
  route:seq,activeClockId:input.active_clock_id,workA:a,workB:b,clockOffsets:input.clock_offsets
 });
 const tension=computePairTension(a,b,vernier);
 const diagnostics=computeSalonObservatoryDiagnostics({
  clock_probe:{lag_ticks:input.lag_ticks,active_clock_id:input.active_clock_id,clock_offsets:input.clock_offsets,route_order:seq,workA:a,workB:b},
  measurement_operator:input.measurement_operator,
  mirror_state:input.mirror_state,
  synergy_table:input.synergy_table
 });
 const synthetic=seq==='B_A'?vernier.reverse:vernier.forward;
 const anchorWork=seq==='B_A'?b:a,probeWork=seq==='B_A'?a:b;
 const suggested=questionTemplate(a,b,track,method,seq,tension);
 const proposal=limited(input.question,900)||suggested;
 const observation=limited(input.observable_predicate,450)||
  'In matched, preregistered trials, compare source-attributed question utility, provenance error rate, and additional verification cost against competent-union controls.';
 const counterworld=limited(input.counterworld,450)||
  'Reverse source encounter order while holding Work identifiers, recorded manifests, question rubric and reference corpus fixed; compare route effects separately from terminal identities.';
 const receipt={
  schema:SALON_SCHEMA,status:'OPEN_FIELD_UNRATIFIED_QUESTION',
  conceptual_form:'CONJECTURAL_VIXEN_UNIFIED_THEORY_STUDY_NOT_DISCOVERY',
  source_estate:'EMSTD613',source_coordinates:[left,right],
  source_encounter_route:route,route_identity:seq,
  route_comparison:{
   alternative_order:seq==='A_B'?'B_A':'A_B',
   same_terminal_source_set:true,
   route_history_equal:false,
   scientific_commutativity:'NOT_TESTED'
  },
  question:proposal,question_origin:plain(input.question)?'OPERATOR_COMPOSITION':'SOURCE_IDENTITY_GROUNDED_TEMPLATE',
  hypothesis_class:'FALSIFIABLE_PROPOSAL_NOT_EVIDENCE',
  comparative_measurements:preregisteredMeasurements(),
  cross_source_mechanisms:[
   {id:'METHOD_COUPLING',source_class:'CONSTRUCTION',
    title:'Documentary-method coupling',
    condition:'Apply the selected documentary method independently to each declared source coordinate before any synthetic comparison.',
    test:'Can the resulting question be attributed to two independently identified Works?'},
   {id:'DROMOLOGICAL_REFRACTION',source_class:'CONSTRUCTION',
    title:'Chronological source refraction',
    condition:'Change only the order of encountering the same two Works, retaining source ID, custody and rubric.',
    test:'Does the route alter candidate-question structure or only the encounter narration?'},
   {id:'COMPETENT_UNION',source_class:'CONSTRUCTION',
    title:'Independent capable-union comparison',
    condition:'Benchmark against a genuinely competent combined reader with equivalent time, context, access and source constraints.',
    test:'Does the proposed synthesis outperform the matched union on a preregistered metric without raising attribution error?'}
  ],
  suggested_theoretical_relation:
   'R(W₁,W₂ | P) = candidate_question; verified_shared_origin = UNKNOWN; claim_of_emergence = HELD',
  testable_predicate:observation,
  counterfactual:counterworld,
  documentary_protocol:{
   instrument_id:method.instrument_id,
   family:method.family,execution_status:'DOCUMENTARY_PROTOCOL_NOT_EXECUTED',
   source_sha256:method.sha256
  },
  giveback_track:{id:track.id,title:track.title,declared_status:track.status,
   protocol_ids:[...track.protocols]},
  human_gate_constraints:{affected_gates:gateIds,
   states:Object.fromEntries(gateIds.map(id=>[id,'UNADJUDICATED_PAIR'])),
   human_adjudication_required:gateIds.length>0},
  synthetic_clocks:synthetic,
  forward_assay:vernier.forward,
  reverse_assay:vernier.reverse,
  holonomy_delta:{
   arrival_inversions:vernier.arrival_inversions,
   tick_l1_delta:vernier.tick_l1_delta,
   preemption_gap:synthetic.preemption_gap,
   route_burden_delta:synthetic.route_burden_delta,
   route_sign:seq==='B_A'?-1:1,
   anchor_pair:title(anchorWork)+' ▷ '+title(probeWork)
  },
  structural_tension:tension,
  observatory_diagnostics:diagnostics,
  missing_evidence:deficits,
  next_measurement:'PREREGISTER_INDEPENDENT_WITNESSES_AND_MATCHED_CONTROLS',
  experiment_b:{
   experiment:'PROSPECTIVE_SOURCE_FREE_DESIGN_ONLY',
   status:'HELD_NO_PROTECTED_FLIGHT',
   null_hypothesis:'Novel synthesis adds no verified, independently attributable benefit over the competent union.',
   arms:[
    {id:'ARM_0_TRANSPORT',role:'TRANSPORT_AND_CUSTODY_CONTROL'},
    {id:'ARM_1_ARCHIVAL',role:'ARCHIVAL_REFERENCE_BASELINE'},
    {id:'ARM_2A_MODULAR',role:'MODULAR_INDEPENDENT_RESEARCH_ROUTE'},
    {id:'ARM_2B_MATCHED_UNION',role:'COMPETENT_UNION_MATCHED_CONTROL'}
   ],
   preregistration_requirements:[
    'Immutable same-episode substrate before measurement',
    'Distinct, masked and randomized route identities',
    'Stable source custody and a common comparison frame',
    'Predeclared null outcomes and falsification boundaries',
    'Independent human review before protected Flight'
   ],
   manifest_succession:'UNKNOWN',
   empirical_acquisition_credit:0
  },
  authority:SYNTHESIS_AUTHORITY,
  source_census:{works:32,manifestations:53,human_gates:8,instruments:21,giveback_tracks:6}
 };
 return deepFreeze(receipt);
}
export function refractSalonPlan(corpus,input){
 const primary=composeSalonPlan(corpus,input);
 const opposite=composeSalonPlan(corpus,{...input,route_order:primary.route_identity==='A_B'?'B_A':'A_B'});
 invariant(primary.source_coordinates.map(x=>x.source_file_id).join('|')===
  opposite.source_coordinates.map(x=>x.source_file_id).join('|'),'SOURCE_COORDINATES_MUTATED');
 invariant(primary.source_encounter_route.join('|')!==opposite.source_encounter_route.join('|'),
  'REFRACTION_FAILED_TO_CHANGE_ROUTE');
 return deepFreeze({
  schema:'emstd613.vixen.internal-refraction/v1',
  terminal_identity_stable:true,
  route_memory_non_equivalent:true,
  source_ids:primary.source_coordinates.map(x=>x.source_file_id),
  original_route:primary.source_encounter_route,
  refracted_route:opposite.source_encounter_route,
  hypothesis_surplus:'UNESTABLISHED',
  control_status:'INTERNAL_COUNTERFACTUAL_NOT_SECOND_MATERIALIZED_OPERA'
 });
}
export function makePodiumTasks(plan,{recordId=null}={}){
 invariant(plan?.schema===SALON_SCHEMA,'REJECT_NON_SALON_PLAN');
 const tasks=[
  {schema:'td613.vixen.podium.task/v1',intent:'podium.describe',params:{}},
  ...plan.source_coordinates.map(x=>({
   schema:'td613.vixen.podium.task/v1',intent:'vixen.work.inspect',params:{work_id:x.work_id}
  })),
  {schema:'td613.vixen.podium.task/v1',intent:'vixen.gates.inspect',params:{}},
  {schema:'td613.vixen.podium.task/v1',intent:'engine.capabilities',params:{}},
  {schema:'td613.vixen.podium.task/v1',intent:'experiment_b.preregister',params:{
   route_identity:plan.route_identity,
   source_ids:plan.source_coordinates.map(x=>x.source_file_id),
   instrument_id:plan.documentary_protocol?.instrument_id||null,
   track_id:plan.giveback_track?.id||null,
   question:plan.question,held_flight:true
  }}
 ];
 // External reference inquiry requires a separately chosen record ID. A
 // Vixen question never guesses a Universal record or imports foreign bodies.
 if(typeof recordId==='string'&&/^[A-Z][A-Z0-9_-]{1,95}$/.test(recordId)){
  tasks.push({schema:'td613.vixen.podium.task/v1',intent:'universal.open',params:{}});
  tasks.push({schema:'td613.vixen.podium.task/v1',intent:'universal.get',params:{record_id:recordId}});
  tasks.push({schema:'td613.vixen.podium.task/v1',intent:'synthesis.propose',params:{
   work_id:plan.source_coordinates[0].work_id,
   source_id:plan.source_coordinates[0].source_file_id,
   record_id:recordId,question:plan.question
  }});
 }
 return deepFreeze({
  schema:'emstd613.vixen.podium-task-batch/v1',tasks,
  origin:'HUMAN_COMPOSED_VIXEN_SALON_EXPORT_NOT_AUTOMATED_CONDUCTOR',
  mandatory_host_review:true,operator_authority_not_encoded_in_json:true
 });
}
const cleanText=(value,max=500)=>typeof value==='string'?value.trim().slice(0,max):'';
export function computeSalonObservatoryDiagnostics(input={}){
 const cp=input?.clock_probe||{};
 const vernier=computeClockVernier(cp.lag_ticks??30,{
  route:cp.route_order||'A_B',
  activeClockId:cp.active_clock_id||'k',
  workA:cp.workA||null,
  workB:cp.workB||null,
  clockOffsets:cp.clock_offsets||null
 });
 const mo=input?.measurement_operator||{};
 const activeFreq=vernier.active_clock?.omegaMultiplier||1.18;
 const baseMat=Array.isArray(mo.base_matrix)?mo.base_matrix:[
  [activeFreq,0.34],
  [0.19,+(activeFreq*0.78).toFixed(4)]
 ];
 const svd=computeMatrixSvd2x2(baseMat);
 const mirrorVec=Array.isArray(input?.mirror_state?.vector)?input.mirror_state.vector:[1,0.62,0.28];
 const mirror=project111Mirror(mirrorVec);
 const xorSynergy=computeDiscreteXorSynergy(input?.synergy_table?.samples);
 const holds=[];
 if(!svd.valid||svd.rank<2)holds.push('DEFICIT_RANK_DEFICIENT');
 if(svd.condition>1e4)holds.push('NUMERICAL_STABILITY_DEFICIT');
 return deepFreeze({
  schema:'emstd613.vixen.salon-observatory-diagnostics/v1',
  vernier_summary:{
   active_clock_id:vernier.active_clock_id,
   arrival_inversions:vernier.arrival_inversions,
   tick_l1_delta:vernier.tick_l1_delta,
   cluster_aligned:vernier.cluster_aligned,
   non_commutative_witness:vernier.non_commutative_witness
  },
  svd_conditioning:svd,
  mirror_111:mirror,
  xor_synergy:xorSynergy,
  aperture_holds:holds,
  epistemic_ceiling:{empirical_credit:0,experiment_b_flight:'HELD',human_closure_required:true}
 });
}

const OUTSIDE_CONJECTURE_SPECS=[
 {
  id:'conj-spsc-algedonic',
  clusters:['C2','C1'],
  workIds:['emwork_67768e8d5148dd461eb34cac','emwork_085223e721130117f5510975'],
  fallbackTitles:['Lock-Free SPSC Ring Buffers','The Architecture of Control (Algedonic Systems)'],
  atlasEngines:['A-01 Temporal Fiber Equivalence','A-05 Dynamical Morphism'],
  clockPair:['plant','wall'],
  title:'Wait-Free SPSC Audio Interrupts as Beer System-3/5 Algedonic Bypass',
  lens:'Systems Control × Real-Time Concurrency',
  now_notice:'Compare lock-free acquire/release audio overrun flags (C2) against Beer System-3/5 algedonic pain/pleasure escalation (C1).',
  why_matter:'Both collapse into silent queue corruption if audited only on steady-state throughput while wall (16.6 ms) and 48 kHz sample (20.8 µs) clocks drift (ω ratio 2.026).',
  exact_falsifier:'Pass queue-saturation + token-culling trajectories through A-01 & A-05: if div(F) < 0 (dissipative EMA smoothing), a dissipative clamp cannot be claimed conservative across clock regimes.',
  missing_witness:'Live kernel/token-scheduler overrun traces across C2 & C1 + Human Gate #2 review.'
 },
 {
  id:'conj-capacitive-ghz-parity',
  clusters:['C3','C1'],
  workIds:['emwork_0885af7e4851a2e81618b37a','emwork_402a8e202524efd197192c39'],
  fallbackTitles:['Wearable 7-Node Kinematic Drone Interface','Autonomous Multi-Agent Governance & Cryptographic Delegation'],
  atlasEngines:['A-02 Parity Invariant','A-03 GHZ Reduction & Locality'],
  clockPair:['tau','k'],
  title:'7-Node E-Textile Kinematic Capacitance as 3-Node Parity Custody Barrier',
  lens:'Wearable Haptics × Cryptographic Quorum',
  now_notice:'Treat 7-node wearable IMU/capacitive array actuation (C3) through the lens of non-separable 3-party quorum delegation (C1).',
  why_matter:'Single-node and pairwise marginals shift under sweat/EMI drift without identifying intent, whereas 1-bit global phase parity flips (A-03) protect actuation against single-sensor fault injection.',
  exact_falsifier:'Audit pairwise vs 3-node parity marginals via A-02 & A-03: actuation must remain HELD whenever 2-node reduced marginal rank drops below threshold under single-node perturbation.',
  missing_witness:'Calibrated body-network EMI logs and Human Gates #3 & #4.'
 },
 {
  id:'conj-nuisance-visibility-dsp',
  clusters:['C2','C3'],
  workIds:['emwork_d9462f54ea32585c5d4f05ac','emwork_6377a9e4c9fd59e427517771'],
  fallbackTitles:['Optimal Smoothing Factors in DSP','Theremin Drone Glove Capacitive Interface'],
  atlasEngines:['A-07 Quantum Visibility Inverse Problem','Aperture SVD Conditioning'],
  clockPair:['plant','n'],
  title:'Dielectric Coupling vs EMA Smoothing Decay as V(η,n) Non-Identifiability',
  lens:'Optical Inverse Problems × Adaptive Signal Filtering',
  now_notice:'Pair optimal DSP smoothing decay (C2) with capacitive e-textile skin proximity vs drone range (C3) under single-channel visibility observation.',
  why_matter:'Like optical visibility V = ηn/(1+n) (A-07), scalar envelope curves conflate fabric dielectric shift η_skin with spatial distance n_range unless an orthogonal probe breaks the level-curve degeneracy.',
  exact_falsifier:'Evaluate candidate calibration matrices with Aperture SVD & A-07: any single-channel calibration with κ(A) > 10⁴ or rank < 2 fails closed as structurally non-identifiable.',
  missing_witness:'Orthogonal dual-frequency capacitance/EMA sweep + Gate #4 closure.'
 },
 {
  id:'conj-ossl-finite-field-fadt',
  clusters:['C4','C1'],
  workIds:['emwork_80ef3cd291f5f4fe6fdbcdbb','emwork_48f6c55fadb2e4d6b9dc4be8'],
  fallbackTitles:['OSSL Stylometric Lineage Tracking','Vector Culling & Memory Persistence'],
  atlasEngines:['A-04 Finite-Field Rank vs Real SVD','FADT Fiber Bounds Γ = U \\ I'],
  clockPair:['wall','k'],
  title:'Discrete OSSL Stylometry Over F_p vs Real-Valued Embedding Vector Culling',
  lens:'Finite-Field Algebra × Provenance Compression',
  now_notice:'Contrast OSSL discrete stylometric fork signatures (C4) against cosine vector-culling persistence in real embedding space (C1).',
  why_matter:'Erasure of fork-history conditioning coordinates creates a positive FADT gap |Γ_y| = |U_y \\ I_y| > 0 where unrelated ancestors mimic each other, while A-04 proves finite-field rank refuses continuous SVD.',
  exact_falsifier:'Run FADT coordinate recovery across fork attributes & A-04 finite-field rank: reject any provenance score importing continuous cosine κ(A) as modular proof.',
  missing_witness:'Independent corpus-wide OSSL commit graph + Gate #6 review.'
 },
 {
  id:'conj-room-surplus-fadt',
  clusters:['C5','C1'],
  workIds:['emwork_3c6593d85fd5b744f24c7a9f','emwork_0d33e61fc09e51761acb87d9'],
  fallbackTitles:['1 + 1 = 3: Occupants & Room Co-Constitution','Advanced LLM Memory Systems'],
  atlasEngines:['FADT Discrepancy Identity','A-03 Entangled Entropy Surplus'],
  clockPair:['k','n'],
  title:'“1 + 1 = 3” Occupant-Room Surplus as Irreducible FADT Obstruction |Γ_y| > 0',
  lens:'Social Cybernetics × Quotient Fiber Theory',
  now_notice:'Examine how “the room plus two occupants equals a third agent” (C5) maps onto LLM shared context memory (C1) — and flag C5’s missing W-PLANE anchor.',
  why_matter:'When individual state supports K₁, K₂ quotient onto an endpoint without retaining the room coordinate, the residual gap Γ_y = U_y \\ I_y captures irreducible relational surplus — yet C5 lacks W-PLANE hardware witnessing.',
  exact_falsifier:'Compute FADT discrepancy + XOR 1-bit synergy I(X,Y;Z) - max(I_X, I_Y): enforce mandatory W-PLANE pairing guard whenever both works lie inside S-PLANE × P-MEMBRANE alone.',
  missing_witness:'W-PLANE instrumentation grounding + empirical multi-agent session logs.'
 },
 {
  id:'conj-mythic-measurement-context',
  clusters:['C5','C2','C4'],
  workIds:['emwork_9373eb730b45f7f5afe6b7ae','emwork_e026dfda7f98393d8c020067'],
  fallbackTitles:['Transmission of Mythic Motifs (3000–700 BCE)','128-Step Hybrid Tracker Engine in Mixxx'],
  atlasEngines:['A-06 Structural Signature','A-08 Measurement Context Separation'],
  clockPair:['tau','plant'],
  title:'Bronze Age Motif Diffusion vs Mixxx 128-Step Pattern Mutation Under Context Separation',
  lens:'Comparative Philology × Polyrhythmic DSP Phylogeny',
  now_notice:'Place Eastern Mediterranean motif diffusion (3000–700 BCE, C5) beside 128-step polyrhythmic pattern state transitions (C2) and OSSL fork trees (C4).',
  why_matter:'Naive motif counting conflates four distinct mechanisms: environmental erasure (decoherence), archival coarse-graining, scribal intervention (projection), and orthography relabeling (gauge redundancy).',
  exact_falsifier:'Apply A-08 context separation & A-06 signature testing: valid structural invariants must stay stationary under spelling/notation relabeling while shifting under genuine projective recension.',
  missing_witness:'Blind cross-corpus motif transition matrices stripped of epoch labels.'
 },
 {
  id:'conj-harmonic-false-twins',
  clusters:['C2','C5'],
  workIds:['emwork_b5f602e223e39e15b6437a0c','emwork_f2c89864337f162e88991e28'],
  fallbackTitles:['Third-Order Cybernetic Architecture in Mixxx','Emergent Topologies and Quantum Field Mechanics'],
  atlasEngines:['A-09 Symbolic & Ladder Commutator Equivalence','Aperture [111] Nullspace'],
  clockPair:['plant','tau'],
  title:'Symbolic Operator Twins Across DSP Phase Accumulators and Emergent Field Formulations',
  lens:'Operator Algebra × Acoustic Synthesis',
  now_notice:'Audit third-order Mixxx feedback equations (C2) alongside field-topology expressions (C5) for syntactic isomerism vs broken commutator symmetry.',
  why_matter:'A single dropped radical or transposed sample-rate factor creates a convincing “false twin” whose LaTeX looks homologous yet violates [a, a†] = 1 and destabilizes phase lock.',
  exact_falsifier:'Verify AST canonical form + ladder commutator residue via A-09 and project gain vectors onto the [111] mirror orthogonality subspace; reject any equivalence breaking commutator preservation.',
  missing_witness:'Symbolic equation canonicalizer audit over extracted formula folios.'
 }
];

export function synthesizeOutsidePerspectiveConjectures(corpus=null,{lagTicks=36,filterCluster=null,limit=7}={}){
 const works=Array.isArray(corpus?.works)?corpus.works:[];
 const byId=new Map(works.map(w=>[w.work_id,w]));
 const vernier=computeClockVernier(lagTicks,{route:'B_A'});
 const clockById=new Map(CLOCKS.map(c=>[c.id,c]));
 const list=OUTSIDE_CONJECTURE_SPECS.filter(spec=>{
  if(!filterCluster||filterCluster==='ALL')return true;
  return spec.clusters.includes(normCluster(filterCluster));
 }).slice(0,Math.max(1,Math.min(12,Number(limit)||7))).map((spec,idx)=>{
  const matchedWorks=spec.workIds.map((wid,wi)=>{
   const w=byId.get(wid);
   if(!w)return {work_id:wid,title:spec.fallbackTitles[wi]||wid,cluster:spec.clusters[wi]||spec.clusters[0],planes:[],gate_num:null};
   return {
    work_id:w.work_id,
    title:w.display_title||w.declared_title||spec.fallbackTitles[wi]||w.work_id,
    cluster:w.cluster,
    planes:[...(w.planes||[])],
    human_gate_required:Boolean(w.human_gate_required),
    gate_num:w.human_gate_required?w.gate_num:null
   };
  });
  const allPlanes=[...new Set(matchedWorks.flatMap(w=>w.planes))];
  const hasWPlaneGrounding=allPlanes.length===0||allPlanes.includes('W-PLANE');
  const cA=clockById.get(spec.clockPair[0])||CLOCKS[0];
  const cB=clockById.get(spec.clockPair[1])||CLOCKS[3];
  const rho=+((cA.omegaMultiplier/cB.omegaMultiplier)).toFixed(4);
  const svdSample=computeMatrixSvd2x2([[cA.omegaMultiplier,0.34],[0.19,cB.omegaMultiplier]]);
  const gates=matchedWorks.map(w=>w.gate_num).filter(g=>g!==null);
  return {
   index:idx+1,
   id:spec.id,
   title:spec.title,
   lens:spec.lens,
   clusters:spec.clusters,
   works:matchedWorks,
   planes_crossed:allPlanes,
   has_w_plane_grounding:hasWPlaneGrounding,
   grounding_advisory:hasWPlaneGrounding
    ?'W_PLANE_GROUNDED_PAIR'
    :'UNGROUNDED_MEMBRANE_GUARD_PAIR_WITH_W_PLANE',
   clock_pair:[cA.id,cB.id],
   clock_codes:[cA.code,cB.code],
   frequency_ratio:rho,
   vernier_inversions:vernier.arrival_inversions,
   svd_kappa:svdSample.condition,
   atlas_engines:spec.atlasEngines,
   affected_gates:gates,
   now_notice:spec.now_notice,
   why_matter:spec.why_matter,
   exact_falsifier:spec.exact_falsifier,
   missing_witness:spec.missing_witness,
   claim_ceiling:'UNRATIFIED_OUTSIDE_PERSPECTIVE_CONJECTURE_NOT_EVIDENCE'
  };
 });
 return deepFreeze(list);
}

export function deriveSynthesisHeadline({
 corpus=null,activePlan=null,refraction=null,
 benchPair=null,benchSnapshots=[],withdrawnCount=0,
 podiumEvents=[],supplementalSources=[],
 operatorQuestion=null,operatorMethod=null,
 customHeadline=null,customSubtitle=null,customHeroStatement=null,customLeftSpine=null
}={}){
 const baseWorks=Array.isArray(corpus?.works)?corpus.works.length:32;
 const extras=Array.isArray(supplementalSources)?supplementalSources.filter(Boolean):[];
 const totalWorks=baseWorks+extras.length;
 const snapshots=Array.isArray(benchSnapshots)?benchSnapshots:[];
 const events=Array.isArray(podiumEvents)?podiumEvents:[];
 const customQ=cleanText(operatorQuestion,600);
 const customM=cleanText(operatorMethod,96);
 const customHdr=cleanText(customHeadline,120);
 const customSub=cleanText(customSubtitle,140);
 const customHero=cleanText(customHeroStatement,240);
 const customSpine=cleanText(customLeftSpine,120);
 const wrap=(raw)=>{
  const regime=raw.regime;
  const hasCustomQ=Boolean(customQ);
  const meta=customM||(hasCustomQ
   ?'OPERATOR-DICTATED QUESTION · PODIUM SYNTHESIS · UNRATIFIED'
   :raw.researchQuestionMeta);
  const question=hasCustomQ
   ?(/^[\u201C"]/.test(customQ)?customQ:`“${customQ}”`)
   :raw.researchQuestion;
  const hdr=customHdr||raw.headerTagline;
  const sub=customSub||raw.patternSubtitle;
  const hero=customHero||raw.heroStatement;
  const spine=customSpine||raw.leftSpine;
  const marg=Array.isArray(raw.axiomMarginalia)?[hdr,...raw.axiomMarginalia.slice(1)]:[hdr];
  return deepFreeze({
   schema:'emstd613.vixen.synthesis-headline/v1',
   regime:hasCustomQ&&regime==='BASELINE_ESTATE_SYNTHESIS'?'OPERATOR_DICTATED_SYNTHESIS':regime,
   headerTagline:hdr,
   patternSubtitle:sub,
   axiomMarginalia:marg,
   heroStatement:hero,
   leftSpine:spine,
   researchQuestionMeta:meta,
   researchQuestion:question,
   provenance:{
    work_census:totalWorks,
    supplemental_sources:extras.length,
    snapshot_count:snapshots.length,
    podium_event_count:events.length,
    withdrawn_count:Number(withdrawnCount)||0,
    operator_dictated_question:hasCustomQ,
    regime:hasCustomQ&&regime==='BASELINE_ESTATE_SYNTHESIS'?'OPERATOR_DICTATED_SYNTHESIS':regime,
    empirical_replication_credit:0,
    scientific_promotion_authority:false,
    human_closure_required:true,
    ...(raw.provenanceExtra||{})
   }
  });
 };
 if(activePlan&&activePlan.schema===SALON_SCHEMA){
  const clusters=[...new Set((activePlan.source_coordinates||[]).map(x=>x.cluster).filter(Boolean))];
  const clusterText=clusters.length?clusters.join(' & '):'Selected Works';
  const routeOrder=activePlan.route_identity==='B_A'?'II ▷ I':'I ▷ II';
  const inversions=Number(activePlan.holonomy_delta?.arrival_inversions||0);
  const l1Delta=Number(activePlan.holonomy_delta?.tick_l1_delta||0);
  const trackId=activePlan.giveback_track?.id||'TRACK_OPEN';
  const refracted=Boolean(refraction?.route_memory_non_equivalent);
  const regime=extras.length>0
   ?'SUPPLEMENTAL_SALON_SYNTHESIS'
   :(refracted?'SALON_REFRACTED_SYNTHESIS':'SALON_COMPOSED_SYNTHESIS');
  const headerTagline=extras.length>0
   ?`Extended Constitutive Synthesis (${totalWorks} Works · ${routeOrder})`
   :(refracted
    ?`Refracted Holonomy Synthesis · ${routeOrder}`
    :`Ordered Synthesis · ${clusterText} · ${routeOrder}`);
  return wrap({
   regime,
   headerTagline,
   patternSubtitle:inversions>0
    ?'THE ARCHITECTURE OF NON-COMMUTING CLOCKS.'
    :'THE ARCHITECTURE OF ORDERED SOURCE FIBERS.',
   axiomMarginalia:[
    headerTagline,
    `Δ=${inversions} inv · L₁=${l1Delta}t · ${trackId}`,
    `Route ${routeOrder} · Unratified Question · Credit 0`
   ],
   heroStatement:refracted
    ?'Same sources across reversed encounter:\norder alters the candidate question\nwhile truth awaits independent witnesses.'
    :`Trajectory across ${clusterText}:\nsemantic route and vernier ticks\nremain distinct without claiming proof.`,
   leftSpine:`S ≠ W ≠ A · Δ=${inversions} INV · ROUTE ${routeOrder}`,
   researchQuestionMeta:refracted
    ?`REFRACTED HOLONOMY QUESTION · ROUTE ${routeOrder} · UNRATIFIED`
    :`SALON SYNTHESIS QUESTION · ${routeOrder} · UNRATIFIED`,
   researchQuestion:refracted
    ?`“Across ${clusterText} traversed in reverse order (${routeOrder}), why does holonomy delta Δ = ${inversions} inversion(s) (L₁ = ${l1Delta} ticks) reshape the candidate horizon along ${trackId} without collapsing witness truth?”`
    :`“When ${clusterText} are composed along ${routeOrder} with giveback track ${trackId} (L₁ = ${l1Delta}t, Δ = ${inversions} inv), what cross-architecture relation becomes testable without flattening the underlying source works?”`,
   provenanceExtra:{active_route:activePlan.route_identity,active_clusters:clusters}
  });
 }
 if(extras.length>0){
  const headerTagline=`Extended Constitutive Synthesis (${totalWorks} Works)`;
  return wrap({
   regime:'SUPPLEMENTAL_CORPUS_SYNTHESIS',
   headerTagline,
   patternSubtitle:'THE ARCHITECTURE OF WIDENED ADMISSIBILITY.',
   axiomMarginalia:[
    headerTagline,
    'S_semantic ≠ W_witness ≠ A_actuator',
    `${totalWorks} Works Indexed · Human Closure Reserved`
   ],
   heroStatement:`Across ${totalWorks} indexed sources,\nwidened intake refines the question\nwithout granting automatic proof.`,
   leftSpine:`S ≠ W ≠ A · ${totalWorks} WORKS · P-CLOSURE HELD`,
   researchQuestionMeta:`WIDENED CORPUS QUESTION · ${totalWorks} WORKS · UNRATIFIED`,
   researchQuestion:`“With ${extras.length} supplemental source(s) joined to the ${baseWorks}-work constellation (${totalWorks} total), which typed control-plane boundaries hold and where does widened intake demand fresh empirical witnesses?”`
  });
 }
 if(Number(withdrawnCount)>0){
  const headerTagline='Non-Retroactive Tombstone Synthesis';
  return wrap({
   regime:'TOMBSTONE_BOUNDED_SYNTHESIS',
   headerTagline,
   patternSubtitle:'THE ARCHITECTURE OF REVOCABLE SUPPORT.',
   axiomMarginalia:[
    headerTagline,
    `${withdrawnCount} Withdrawn Source(s) · Pred Intact`,
    'S ≠ W ≠ A · U \\ ⋂ S_i Open Gap'
   ],
   heroStatement:'When an upstream source withdraws,\nfuture claims halt immediately\nwhile predecessor records stay legible.',
   leftSpine:'S ≠ W ≠ A · TOMBSTONE CUSTODY · CREDIT 0',
   researchQuestionMeta:`REVOCABLE SUPPORT QUESTION · ${withdrawnCount} WITHDRAWN · HELD`,
   researchQuestion:`“After ${withdrawnCount} upstream source withdrawal(s), what residual structure inside the active corpus remains coherent without leaning on revoked support?”`
  });
 }
 if(benchPair==='mismatched_l0'){
  const headerTagline='Boundary-Guarded Non-Collapsing Control';
  return wrap({
   regime:'L0_VOCABULARY_GUARD_SYNTHESIS',
   headerTagline,
   patternSubtitle:'THE ARCHITECTURE OF REFUSED CONFLATION.',
   axiomMarginalia:[
    headerTagline,
    'Vocabulary Overlap ≠ Shared Operator',
    'Blocked Above L0 · Human Gate Reserved'
   ],
   heroStatement:'Shared metaphors across manuscripts\nnever manufacture a state operator\nor promote a claim above L0.',
   leftSpine:'S ≠ W ≠ A · L0 BOUNDARY GUARD',
   researchQuestionMeta:'L0 BOUNDARY QUESTION · VOCABULARY GUARD · HELD',
   researchQuestion:'“Where two works share terminology across domains without sharing a state operator, how does keeping L0 distinct prevent false convergence from masking genuine mechanism?”',
   provenanceExtra:{bench_pair:benchPair}
  });
 }
 if(benchPair==='c2_c3_transducer'){
  const headerTagline='Phase-Locked Transduction · Plant Split';
  return wrap({
   regime:'L1_PHASE_LOCKED_SYNTHESIS',
   headerTagline,
   patternSubtitle:'THE ARCHITECTURE OF SEPARATE ACTUATORS.',
   axiomMarginalia:[
    headerTagline,
    'Audio Clock ⊥ Aerial Plant Hazard',
    'L1 Isomorphism · L2 Composition HELD'
   ],
   heroStatement:'Phase-locked math may cross media\nat L1 while audio underruns and flight\nactuators remain strictly partitioned.',
   leftSpine:'S ≠ W ≠ A · L1 TRANSDUCTION SPLIT',
   researchQuestionMeta:'L1 TRANSDUCTION QUESTION · PLANT SPLIT · HELD',
   researchQuestion:'“When phase-locked smoothing crosses between 48 kHz DSP audio clocks and e-textile kinematic arrays at L1, what hazard invariants require separate L2 actuator custody?”',
   provenanceExtra:{bench_pair:benchPair}
  });
 }
 if(snapshots.length>0){
  const headerTagline=`Predecessor-Linked Synthesis (${snapshots.length} Snapshot${snapshots.length===1?'':'s'})`;
  return wrap({
   regime:'SNAPSHOT_CHAIN_SYNTHESIS',
   headerTagline,
   patternSubtitle:'THE ARCHITECTURE OF APPEND-ONLY MEMORY.',
   axiomMarginalia:[
    headerTagline,
    `Chain Depth #${snapshots.length} · Non-Retroactive`,
    'S ≠ W ≠ A · Human Closure Reserved'
   ],
   heroStatement:'Each composed snapshot cites its\nimmediate predecessor so route order\nnever vanishes into static prose.',
   leftSpine:`S ≠ W ≠ A · CHAIN #${snapshots.length} · HELD`,
   researchQuestionMeta:`APPEND-ONLY ROUTE QUESTION · DEPTH #${snapshots.length} · HELD`,
   researchQuestion:`“Across ${snapshots.length} predecessor-linked synthesis step(s), how does preserving order history change the open frontier compared to an unordered set?”`
  });
 }
 if(events.length>0){
  const last=events[events.length-1]?.action||'PODIUM_EVENT';
  const headerTagline='Podium-Updated Constitutive Synthesis';
  return wrap({
   regime:'PODIUM_EVENT_SYNTHESIS',
   headerTagline,
   patternSubtitle:'THE ARCHITECTURE OF GOVERNED INQUIRY.',
   axiomMarginalia:[
    headerTagline,
    'S_semantic ≠ W_witness ≠ A_actuator',
    `Last Event: ${String(last).slice(0,30)}`
   ],
   heroStatement:'Podium inspection tracks source order\nand witness deficits before any claim\ncan cross into the public record.',
   leftSpine:'S ≠ W ≠ A · PODIUM LOGGED · CREDIT 0',
   researchQuestionMeta:`PODIUM EXPLORATION QUESTION · ${events.length} STEP(S) · UNRATIFIED`,
   researchQuestion:`“Following ${events.length} Podium exploration step(s) (latest: ${String(last).slice(0,32)}), what emergent structural question across the corpus warrants human exploration next?”`,
   provenanceExtra:{last_event:last}
  });
 }
 return wrap({
  regime:'BASELINE_ESTATE_SYNTHESIS',
  headerTagline:'Typed Constitutive Cybernetics',
  patternSubtitle:'THE ARCHITECTURE OF NON-COLLAPSING PLANES.',
  axiomMarginalia:[
   'Typed Constitutive Cybernetics',
   'S_semantic ≠ W_witness ≠ A_actuator',
   'P-Closure ≠ W-Truth · [32, 40] Sensitivity'
  ],
  heroStatement:'Where semantic steering, witness verification,\nand low-latency actuation refuse to collapse\ninto one untyped plane.',
  leftSpine:'S ≠ W ≠ A · FIVE NON-COMMUTATIVE CLOCKS',
  researchQuestionMeta:'CONSTITUTIVE INQUIRY QUESTION · S ≠ W ≠ A · UNRATIFIED',
  researchQuestion:'“Across thirty-two cybernetic architectures spanning real-time audio clocks, e-textile transduction, and hypervisor control planes, what non-collapsing invariants emerge when semantic steering, witness verification, and low-latency actuation stay strictly typed—and what open horizon remains for human judgment?”'
 });
}
