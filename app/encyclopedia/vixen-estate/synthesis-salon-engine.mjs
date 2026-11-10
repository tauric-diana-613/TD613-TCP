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
 {id:'k',label:'Layer k',geometry:'DISCRETE_TRANSFORMER_LAYER'},
 {id:'n',label:'Token n',geometry:'DISCRETE_TOKEN_INDEX'},
 {id:'tau',label:'Surrogate τ',geometry:'ODE_SURROGATE_TIME'},
 {id:'wall',label:'Wall scheduler',geometry:'WALL_CLOCK_SCHEDULER'},
 {id:'plant',label:'Plant 48 kHz',geometry:'AUDIO_SAMPLE_CLOCK'}
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
export function toyClockAssay({lag=30,routeOrder='A_B'}={}){
 const t=Math.max(0,Math.min(120,Math.round(num(lag))));
 const order=routeOrder==='B_A'?'B_A':'A_B';
 // Pure dimensionless DEMONSTRATION ticks; these are not comparable physical
 // times without independent calibration and a declared conversion map.
 const c=[
  {id:'k',tick:Math.round(8+.30*t),rule:'8 + round(.30*lag)'},
  {id:'n',tick:Math.round(15+.80*t),rule:'15 + round(.80*lag)'},
  {id:'tau',tick:Math.round(27+.42*t),rule:'27 + round(.42*lag)'},
  {id:'wall',tick:Math.round(35+1.05*t),rule:'35 + round(1.05*lag)'},
  {id:'plant',tick:Math.round(5+.12*t),rule:'5 + round(.12*lag)'}
 ].map((x,i)=>({
  ...x,label:CLOCKS[i].label,geometry:CLOCKS[i].geometry,
  evidence_class:'SYNTHETIC_DIMENSIONLESS_CLOCK_TICKS_ONLY'
 }));
 const sorted=[...c].sort((a,b)=>a.tick-b.tick||a.id.localeCompare(b.id));
 return deepFreeze({
  schema:'emstd613.vixen.synthetic-five-clock-demonstration/v1',
  parameter_lag_ticks:t,
  route_order:order,clocks:c,arrival_order:sorted.map(x=>x.id),
  physical_time_equivalence:false,measured_clock_latency:false,
  source_promotion:false,claim:'SENSITIVITY_DEMONSTRATION_NOT_EMPIRICAL_DERIVATIVE'
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
function questionTemplate(a,b,track,method){
 const left=title(a),right=title(b);
 return 'Can a source-attributed '+String(method.family||'documentary')+
  ' comparison of '+left+' and '+right+
  ' under '+track.title+
  ' yield a falsifiable question whose provenance and utility survive matched competent-union controls without inferring shared authorship?';
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
 const suggested=questionTemplate(a,b,track,method);
 const proposal=limited(input.question,900)||suggested;
 const observation=limited(input.observable_predicate,450)||
  'In matched, preregistered trials, compare source-attributed question utility, provenance error rate, and additional verification cost against competent-union controls.';
 const counterworld=limited(input.counterworld,450)||
  'Reverse source encounter order while holding Work identifiers, recorded manifests, question rubric and reference corpus fixed; compare route effects separately from terminal identities.';
 const deficits=[
  'Original source bodies are unavailable in the public catalogue.',
  'No independent external witness has established any cross-Work causal relationship.',
  'No human ratification has closed the eight bilateral source-identity gates.',
  'No Experiment B arm has been run by this session.'
 ];
 const gateIds=[...new Set([left,right].filter(x=>x.human_gate_required).map(x=>x.gate_num))];
 const synthetic=toyClockAssay({lag:input.lag_ticks,routeOrder:seq});
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
  {schema:'td613.vixen.podium.task/v1',intent:'engine.capabilities',params:{}}
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
