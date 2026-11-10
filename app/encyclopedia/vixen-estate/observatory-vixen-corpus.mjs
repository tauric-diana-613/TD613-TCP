/**
 * VIXEN ELECTRIC FOUNDRY · CANONICAL SUBJECT CONTRACT.
 *
 * SUBJECT MATTER: Vixen's OWN original Em corpus, original 22 mathematical
 * folios, 6 giveback track definitions and 32 historical source Work IDs.
 *
 * DISPLAY MACHINERY: Dome-Art samplers, Loom's 39-strata roster, Aperture
 * observation geometry and Refractive Couture optics. Borrowed engines
 * NEVER become Vixen subject Works or Performers.
 *
 * Historical math is a declared source record; numeric dials illustrate
 * bounded, authored models, with explicit evidence ceiling. The register is
 * data-derived and extensible. No arbitrary four/sixteen-lab ceiling.
 */
import {
 fieldAt,sceneProbe,project111,singularValues2,fiveClockTicks,
 FOUNDRY_SCHEMA,CARRIERS
} from './observatory-foundry-kernel.mjs';

export const VIXEN_LABS_SCHEMA='emstd613.vixen.corpus-referenced-observatory/v1';
export const VIXEN_SOURCE_ESTATES=Object.freeze({
 opera:'EMSTD613_VIXEN',operahouse:'TD613_ENCYCLOPEDIA',
 performer:'EMSTD613_ORIGINAL_WORK_MANIFESTATION_ONLY',
 cross_estate_promotion:false,external_empirical_credit:0
});
const OPTICS_BY_FOLIO=Object.freeze({
 'TCC-01':'CONTROL_PLANES','TCC-02':'CONTROL_PLANES',
 'TCC-03':'FOLD_SEAM','TCC-04':'FIVE_CLOCKS',
 'TCC-05':'ALGEDONIC','TCC-06':'COUTURE_111',
 'TCC-07':'TWIN_WORLD','TCC-08':'TOROID',
 'RC-01':'FOURIER','RC-02':'FIVE_CLOCKS','RC-03':'COUTURE_111',
 'RC-04':'D3_MOIRE','RC-05':'PHI_QUASI',
 'RC-06':'GATE_256','RC-07':'APERTURE_SVD',
 'RC-08':'FOLD_SEAM','RC-09':'HOLONOMY',
 'RC-10':'PHI_QUASI','RC-11':'CONTROL_PLANES',
 'RC-12':'TWIN_WORLD','RC-13':'GRADIENT_CAUSTIC',
 'RC-14':'GRADIENT_CAUSTIC'
});
const TRACK_BINDINGS=Object.freeze({
 'TRACK-A':{folio:'TCC-01',optic:'CONTROL_PLANES'},
 'TRACK-B':{folio:'TCC-04',optic:'FIVE_CLOCKS'},
 'TRACK-C':{folio:'TCC-05',optic:'ALGEDONIC'},
 'TRACK-D':{folio:'RC-09',optic:'HOLONOMY'},
 'TRACK-E':{folio:'TCC-07',optic:'TWIN_WORLD'},
 'TRACK-F':{folio:'TCC-07',optic:'TWIN_WORLD'}
});
const ensure=(x,reason)=>{if(!x)throw new TypeError(reason)};
const r6=x=>Math.round(x*1e6)/1e6;
const clamp=(n,lo=0,hi=1)=>Math.min(hi,Math.max(lo,Number.isFinite(+n)?+n:0));
const finite=n=>Number.isFinite(n);
const freeze=o=>Object.freeze(o);
export function buildVixenLaboratories(corpus){
 ensure(corpus&&Array.isArray(corpus.formula_folios)&&corpus.formula_folios.length===22,
  'VIXEN_22_CANONICAL_FOLIOS_REQUIRED');
 ensure(Array.isArray(corpus.works)&&corpus.works.length===32,'VIXEN_32_WORKS_REQUIRED');
 ensure(Array.isArray(corpus.instruments)&&corpus.instruments.length===21,'VIXEN_21_PROTOCOLS_REQUIRED');
 ensure(Array.isArray(corpus.giveback_tracks)&&corpus.giveback_tracks.length===6,
  'VIXEN_SIX_PROSPECTIVE_TRACKS_REQUIRED');
 ensure(Array.isArray(corpus.human_gates)&&corpus.human_gates.length===8&&
  corpus.human_gates.every(g=>g.default_state==='UNADJUDICATED_PAIR'),
  'VIXEN_HUMAN_GATE_INTEGRITY');
 const works=new Map(corpus.works.map(w=>[w.work_id,w]));
 const methods=new Map(corpus.instruments.map(i=>[i.instrument_id,i]));
 const folios=new Map(corpus.formula_folios.map(f=>[f.id,f]));
 const entries=[];
 for(const f of corpus.formula_folios){
  const optic=OPTICS_BY_FOLIO[f.id];
  ensure(optic,'FOLIO_VISUALIZATION_PROGRAM_UNDECLARED:'+f.id);
  const workRefs=(f.links||[]).filter(id=>id.startsWith('emwork_'));
  const protocolRefs=(f.links||[]).filter(id=>methods.has(id));
  ensure(workRefs.every(id=>works.has(id)),'FOLIO_FOREIGN_WORK_REFUSED');
  entries.push(freeze({
   id:'LAB_'+f.id,folio_id:f.id,source_estate:'EMSTD613',
   research_family:f.group==='couture'?'REFRACTIVE_COUTURE_FORMALISM':'TYPED_CONSTITUTIVE_CYBERNETICS',
   name:f.title,summary:f.summary,formula:f.fallback,status:f.status,
   ceiling:f.ceiling,optic_program:optic,work_refs:freeze(workRefs),
   instrument_refs:freeze(protocolRefs),manifestation_identity:'INDEPENDENT_HUMAN_CUSTODY',
   empirical_credit:0,kind:'CANONICAL_FORMULA_SIMULATION'
  }));
 }
 for(const t of corpus.giveback_tracks){
  const bind=TRACK_BINDINGS[t.id];ensure(bind&&folios.has(bind.folio),'UNKNOWN_VIXEN_TRACK');
  ensure(t.protocols.every(id=>methods.has(id)),'FOREIGN_METHOD_IN_GIVEBACK');
  entries.push(freeze({
   id:'LAB_'+t.id,folio_id:bind.folio,source_estate:'EMSTD613',
   research_family:'VIXEN_GIVEBACK_PROSPECTIVE',name:t.title,summary:t.summary,
   formula:folios.get(bind.folio).fallback,
   status:t.status||'PROSPECTIVE_ONLY',ceiling:'PREREGISTRATION_CANDIDATE_NOT_EXECUTED',
   optic_program:bind.optic,work_refs:freeze([]),
   instrument_refs:freeze([...t.protocols]),empirical_credit:0,
   manifestation_identity:'NO_PROMOTION',kind:'PROSPECTIVE_GIVEBACK_SIMULATION'
  }));
 }
 ensure(entries.length===corpus.formula_folios.length+corpus.giveback_tracks.length,
  'UNEXPLAINED_LAB_COUNT');
 ensure(new Set(entries.map(x=>x.id)).size===entries.length,'DUPLICATE_LAB_ID');
 return freeze(entries);
}
export function labById(corpus,id){
 return buildVixenLaboratories(corpus).find(x=>x.id===id)||null
}
export function assessVixenLab(corpus,id,controls={},probe={x:0,y:0}){
 const lab=labById(corpus,id);ensure(lab,'UNKNOWN_VIXEN_LAB');
 const gain=clamp(controls.gain??.72),
  witness=clamp(controls.witness??.68),
  voltage=clamp(controls.voltage??.81),
  twist=clamp(controls.twist??.45),
  sampleIndex=Math.min(120,Math.max(0,Math.round(+(controls.sampleIndex??40)||0)));
 const visual=sceneProbe(lab.optic_program,
  {gain,voltage,twist,time:+controls.time||0},
  {x:clamp(probe.x??0,-1,1),y:clamp(probe.y??0,-1,1)});
 const diagnostics=[];
 const add=(name,value,unit,ceiling='AUTHORED_SYNTHETIC_DEMONSTRATION')=>{
  diagnostics.push(freeze({name,value,unit,claim_ceiling:ceiling}))
 };
 const f=lab.folio_id;
 if(f==='TCC-01'||f==='TCC-02'){
  const ref=(witness>.5&&voltage>.3);
  add('semantic_setpoint',r6(gain),'normalized synthetic control');
  add('witness_freshness',r6(witness),'normalized simulated trust');
  add('guarded_actuation',ref?'AUTHORIZED_IN_MODEL':'HELD_STALE_OR_UNSHIELDED','typed transition');
  add('semantic_alignment_entails_witness',false,'conservation law');
  if(f==='TCC-02')add('crossing_morphisms',freeze(['R_WS','C_S','T_SA','M_AW']),'typed set');
 }else if(f==='TCC-03'){
  add('recursive_context_persistence',r6(gain),'illustrative recursive state');
  add('independent_witness_content',null,'NOT_OBSERVED');
  add('recursive_stability_proves_factuality',false,'formal refusal');
 }else if(f==='TCC-04'||f==='RC-02'){
  add('five_distinct_clocks',fiveClockTicks(sampleIndex),'distinct native clock domains');
  add('common_derivative_without_conversion','REJECTED','clock custody');
 }else if(f==='TCC-05'){
  const alpha=.05+.9*gain,threshold=.65;
  let smooth=0,emaPeak=0,smoothImpulse=0;
  for(let i=0;i<14;i++){
   const raw=i===5?voltage:0;
   smooth=alpha*raw+(1-alpha)*smooth;
   emaPeak=Math.max(emaPeak,smooth);
   if(i===5)smoothImpulse=smooth;
  }
  add('alpha',r6(alpha),'EMA smoothing coefficient');
  add('raw_impulse',r6(voltage),'normalized sample-5 impulse');
  add('ema_impulse_peak',r6(smoothImpulse),'normalized filtered sample-5 peak');
  add('raw_preempts_0_65',voltage>=threshold,'threshold model');
  add('ema_preempts_0_65',emaPeak>=threshold,'threshold model');
  add('real_plant_safety_proven',false,'external trial missing');
 }else if(f==='TCC-06'){
  const vector=[gain,witness,voltage];
  const p=project111(vector);
  add('coordinate_projection',p.projection,'P111 projected 3-vector');
  add('constitutive_coupling_demonstrated',false,'requires operator relation');
 }else if(f==='TCC-07'){
  add('L0_MOTIF','UNQUALIFIED','source analogy');
  add('L1_ISOMORPHISM','PROSPECTIVE','source-bounded candidate');
  add('L2_COMPOSABLE','HELD_UNLESS_TYPED','retain domain residue');
  add('L3_FALSIFIABLE','UNEXECUTED','external matched witness');
 }else if(f==='TCC-08'){
  add('signature','Sₑ ≡ [x+y] = z+1','AUTHORIAL_BRANDING_ONLY');
  add('arithmetic_or_empirical_operator',null,'NO_THEOREM');
 }else if(f==='RC-01'){
  add('circuit',freeze(['M0','VISUAL_INSTRUCTION','RENDERED_VT','AUDIT_QUESTION_QT1']),'formal design grammar');
  add('empirically_better_question',null,'POSTFLIGHT_TEST_UNEXECUTED');
 }else if(f==='RC-03'){
  const p=project111([gain,witness,voltage]);
  add('projected_vector',p.projection,'2D-observable 3-vector');
  add('discarded_nullspace',p.nullspace_component,'ker P111');
  add('unique_inverse',false,'rank deficient projection');
 }else if(f==='RC-04'){
  add('independent_operator_stages',freeze([120,12,6,2,1]),'group-order grammar');
  add('single_subgroup_chain',false,'OH48 not subgroup of H3(120)');
 }else if(f==='RC-05'){
  add('reported_ROI_C3_C6',4.704,'source-bounded quoted measurement');
  add('reported_fullframe_C3_C6',.512,'source-bounded quoted measurement');
  add('auto_global_symmetry_inference',false,'ROI matters');
 }else if(f==='RC-06'){
  add('historical_estate_files',87,'declared archive count');
  add('substantive_records',54,'20 PDF + 33 MD + 1 ZIP');
  add('AppleDouble_sidecars',33,'quarantined c4 coordinate');
  add('external_rehash_this_session',false,'source bytes unavailable');
 }else if(f==='RC-07'){
  const M=[[1,.2+gain*.3],[.1+twist*.2,.3+voltage*.5]];
  add('live_2x2_operator',M,'synthetic observation matrix');
  add('singular_values',singularValues2(M),'computed 2x2 observation');
  add('historical_collinear_countermodel',singularValues2([[1,1],[.15,.15]]),'rank one');
  add('historical_3x2_condition_quoted',2.6311,'cited distinct historical test');
 }else if(f==='RC-08'){
  add('projection_covariance_nullity',0,'retained counterexample');
  add('cycle_rank',2,'retained counterexample');
  add('universal_equality_refuted',true,'finite mathematical counterexample');
  add('corrected_bridge','J=CB','factorized incidence');
 }else if(f==='RC-09'){
  add('AIA_route',freeze(['EXPERIENTIAL','CUSTODIAL','AUDIT','IMPLEMENTATION']),'typed traversal');
  add('reverse_route_equivalent','UNESTABLISHED','path-memory required');
 }else if(f==='RC-10'){
  add('xor_truth_table',freeze([[0,0,0],[0,1,1],[1,0,1],[1,1,0]]),'exact balanced toy');
  add('pairwise_I_X_Z',0,'bit');
  add('pairwise_I_Y_Z',0,'bit');
  add('joint_I_XY_Z',1,'bit');
 }else if(f==='RC-11'){
  add('required_sequence',freeze(['NOTICE','ACT','WORLD_ANSWERS','NAME']),'governed inquiry');
  add('premature_name',false,'cadence refusal');
 }else if(f==='RC-12'){
  add('three_arm_question_discovery',freeze(['PP0_TEXT','PP1_COUTURE','PP2_MATCHED_CONTROL']),'prospective only');
  add('observations',null,'POST_POSTFLIGHT_UNEXECUTED');
 }else if(f==='RC-13'){
  add('theme_can_change_visual',true,'presentation');
  add('theme_authorizes_corpus_mutation',false,'source digest stays external');
 }else if(f==='RC-14'){
  add('presentation_theme_swap','GAUGE_REDUNDANCY','Atlas A08');
  add('metadata_projection','COARSE_GRAINING','Atlas A08');
  add('physical_transformation_observed',false,'no physical intervention');
 }
 if(lab.kind==='PROSPECTIVE_GIVEBACK_SIMULATION'){
  add('track_id',id.slice(4),'original giveback track');
  add('standalone_executor_count',0,'documentary only');
  add('flight','HELD','Experiment B remains protected');
 }
 const annotation=freeze({
  lab_id:id,source_folio:lab.folio_id,source_family:lab.research_family,
  original_formula:lab.formula,original_status:lab.status,
  source_works:lab.work_refs,recorded_methods:lab.instrument_refs,
  requested_mode:'INTERACTIVE_SYNTHETIC_REFERENCE_PROJECTION'
 });
 return freeze({
  schema:VIXEN_LABS_SCHEMA,source_estate:'EMSTD613',
  corpus_coordinates:annotation,
  lab_title:lab.name,model_domain:lab.research_family,
  optical_engine:freeze({program:lab.optic_program,borrowed_from:'DOME_ART_LOOM_APERTURE_COUTURE_TOOLING_ONLY'}),
  probe:visual.probe,visual_scalar:visual.diagnostic.field_value,
  metrics:freeze(diagnostics),
  authority:freeze({subject_from:'EMSTD613_CANONICAL_SOURCE_RECORDS',
   optical_tooling_is_not_authorship:true,empirical_replication_credit:0,
   human_closure:'RESERVED',experiment_b_flight:'HELD',
   scientific_claim:'BOUNDED_SYNTHETIC_OR_SOURCE_RECORDED_ONLY'})
 });
}
export function completeVixenSourceCensus(corpus){
 const labs=buildVixenLaboratories(corpus);
 return freeze({
  schema:VIXEN_LABS_SCHEMA,lab_count:labs.length,
  source_formula_labs:labs.filter(x=>x.kind==='CANONICAL_FORMULA_SIMULATION').length,
  source_track_labs:labs.filter(x=>x.kind==='PROSPECTIVE_GIVEBACK_SIMULATION').length,
  source_work_count:corpus.works.length,
  source_original_record_count:corpus.works.reduce((n,w)=>n+w.linked_sources.length,0),
  source_instruments:corpus.instruments.length,
  source_human_gates:corpus.human_gates.length,
  optical_strata:CARRIERS.length,source_estate:'EMSTD613',
  foreign_opera_as_performer_count:0
 });
}
