/**
 * 𝌋 THE PODIUM · machine-legible research route, not a human UI or autonomous
 * agent. OPERAHOUSE ≠ OPERA ≠ PERFORMER. Explicit task intent is required.
 *
 * No ambient credentials, external agents, import/admission, release, merge,
 * personal data access, or privileged execution. A supplied native adapter
 * runs only via an independent host-provided authorization boolean.
 */
import {createVixenAiSession} from '../vixen-estate/vixen-ai-session.mjs';
import {createVixenReferenceMembrane} from './vixen-read-gateway.mjs';
import {constructCrossAtelierWitness} from './vixen-operator-encounter.mjs';
import {composeSalonPlan,refractSalonPlan,deriveSynthesisHeadline,synthesizeOutsidePerspectiveConjectures,scoreUnifiedSynthesisCandidates,assertNoBoilerplateSubtitle} from '../vixen-estate/synthesis-salon-engine.mjs';
import {inspectVixenCrossOperaWarrant} from '../vixen-estate/cross-opera-warrant.mjs';
import {SUPPORTED_SEARCH_MODES} from '../vixen-estate/semantic-semiotic-search.mjs';
import {makePodiumScore,reachPodiumComposeGate} from '../vixen-estate/podium-composition-score.mjs';
import {createPodiumComposeGate} from '../vixen-estate/podium-compose-gate.mjs';
import {buildRedpenPacket,makeBlankRedpenReturn,adjudicateRedpenReturn,
 buildInChatRedpenControls} from '../vixen-estate/podium-redpen-adjudication.mjs';
import {buildNativeVisualDiff} from '../vixen-estate/podium-native-visual-diff.mjs';
import {
 normalizeFusionControls,boundedFusionComparisonSpec,
 FUSION_CHANNEL_KEYS,FUSION_PROFILE_IDS,FUSION_WEIGHT_POLICIES,FUSION_PROFILES
} from '../vixen-estate/fusion-controls.mjs';
import {
 SRC_CORPUS_ROOMS,
 SRC_HETEROSTRATIGRAPHIC_STRATA,
 SRC_AUTHORITY_AXES,
 SRC_EPISTEMIC_STATE_AXES,
 SRC_FALSE_CONTINUITY_SCREENS,
 SRC_QUERY_REGIMES,
 runSrcHeterostratigraphicAudit
} from '../vixen-estate/src-atelier-engines.mjs';
export {deriveSynthesisHeadline,scoreUnifiedSynthesisCandidates};

export const PODIUM_SCHEMA='td613.vixen.podium.task/v1';
export const PODIUM_RECEIPT='td613.vixen.podium.receipt/v1';
export const PODIUM_ROUTES=Object.freeze([
 'podium.describe','vixen.work.inspect','vixen.gates.inspect',
 'universal.open','universal.search','universal.get','universal.related',
 'synthesis.propose','vixen.salon.compose','experiment_b.preregister',
 'engine.capabilities','engine.invoke',
 'vixen.fusion.capabilities','vixen.fusion.search','vixen.fusion.compare','vixen.fusion.explain',
 'podium.score','podium.redpen','podium.compose',
 'vixen.ai.start','vixen.ai.choose','vixen.ai.report','vixen.ai.status',
 'vixen.ai.notes','vixen.ai.handoff','vixen.ai.archive','vixen.ai.finish'
]);
export const BOUNDED_ENGINE_OPERATIONS=Object.freeze({
 ATLAS:Object.freeze([
  'compare_routes','trace_relations','atlas_math_dispatch',
  'fadt_fiber_audit','fadt_coordinate_recovery','fadt_discrepancy',
  'vixen_semantic_search'
 ]),
 RULEFIELD:Object.freeze([
  'assess_roles','propose_rulefield','score_unified_candidates','pedagogue_cadence','pedagogue_institutional_time'
 ]),
 APERTURE:Object.freeze([
  'audit_epistemic_deficit','evaluate_probe_stability','compute_matrix_svd',
  'td613_governed_exposure','observatory_diagnostics'
 ]),
 DOLLHOUSE:Object.freeze(['audit','fadt_reparative_packet','temporal_non_retroactivity']),
 UNIVERSAL_ATELIER:Object.freeze(['search','get','cite','neighbors','route','context','verify']),
 SRC_ATELIER:Object.freeze([
  'src_projective_routing','src_verified_vixen_work_pair',
   'src_verified_vixen_original_projective_differential',
   'src_verified_vixen_original_typed_traversal',
  'src_phase2_tomography',
  'src_phase2_context_roles',
  'src_rabbit_hole_traversal',
  'src_untypical_retrieval',
  'src_heterostratigraphic_audit','src_native_epoch_query','src_native_text',
  'src_native_semantic','src_native_projective_assay','src_native_evidence_traverse','src_native_research_journey'
 ]),
 WENDBINE_ATELIER:Object.freeze(['wendbine_private_status','wendbine_private_search',
  'wendbine_public_query','wendbine_sealed_epoch_query']),
 EM_ATELIER:Object.freeze(['em_native_text','em_native_semantic','em_native_work_route','em_native_research_journey']),
 CROSS_ATELIER:Object.freeze(['cross_atelier_lexical','cross_atelier_semantic'])
});
const RX_SHA=/^[a-f0-9]{64}$/;
const text=(x,max=500)=>typeof x==='string'?x.slice(0,max):'';
const recordId=id=>typeof id==='string'&&/^[A-Z][A-Z0-9]*-[A-Z0-9][A-Z0-9_-]{0,95}$/.test(id);
const rejection=(state,reason)=>({state,reason,scientific_claim:'UNESTABLISHED'});
const census=corpus=>({
 works:corpus.works.length,manifestations:corpus.works.reduce((n,w)=>n+(w.linked_sources||[]).length,0),
 gates:corpus.human_gates.length,protocols:corpus.instruments.length
});
const safeRecord=w=>({
 estate:'EMSTD613',role:'PERFORMER',work_id:w.work_id,
 title:w.display_title||w.declared_title||w.work_id,
 identity_status:w.identity_status||'UNRESOLVED',authorship:w.authorship||'UNRESOLVED',
 linked_sources:(w.linked_sources||[]).map(s=>({
  source_file_id:s.source_file_id,original_filename:s.original_filename,
  sha256:s.sha256||null,media_type:s.media_type||null,
  source_body_access:'EXPERIMENT_A_PREVIEW_AUTHORIZED'
 }))
});
export function createVixenPodium({corpus,membrane=null,engineAdapters={},engines=null,
  semanticSearch=null,operatorAuthorized=false,sourceRevision='UNVERIFIED_EXTERNAL_INPUT',verifyHumanApproval=null,
   nativeReviewCaptureProvider=null,readVisitorCart=null,verifyProgramNotesConsent=null,
   authorProgramNote=null,narrateAiTurn=null}={}){
 const normalizeAdapters=map=>{
  if(map===undefined||map===null)return Object.create(null);
  if(typeof map!=='object'||Array.isArray(map))throw new TypeError('VIXEN_PODIUM_INVALID_ENGINE_ADAPTER_MAP');
  const out=Object.create(null);
  for(const k of Object.keys(BOUNDED_ENGINE_OPERATIONS)){
   if(Object.hasOwn(map,k)&&typeof map[k]==='function')out[k]=map[k];
  }
  return out;
 };
 const boundAdapters={...normalizeAdapters(engines),...normalizeAdapters(engineAdapters)};
 // Independent approval only through host-injected verification; never task JSON.
 const composeGate=createPodiumComposeGate({sourceRevision,verifyHumanApproval});
 let latestScore=null,latestRedpenPacket=null,latestRedpenReturn=null,latestNativeReview=null;
 const attachedSemantic=(semanticSearch&&typeof semanticSearch.search==='function')?semanticSearch:null;
 const counts=corpus&&Array.isArray(corpus.works)&&Array.isArray(corpus.human_gates)&&
  Array.isArray(corpus.instruments)?census(corpus):null;
 if(!counts||counts.works!==32||counts.manifestations!==53||counts.gates!==8||counts.protocols!==21)
   throw new TypeError('VIXEN_PODIUM_CENSUS_MISMATCH_FAIL_CLOSED');
 if(!corpus.works.every(w=>typeof w.work_id==='string'&&w.work_id.length>0&&
   Array.isArray(w.linked_sources)) ||new Set(corpus.works.map(w=>w.work_id)).size!==32)
   throw new TypeError('VIXEN_PODIUM_IDENTITY_BOUNDARY_FAILED');
 const reader=membrane||createVixenReferenceMembrane();
 if(!reader||!['open','search','getRecord','related','status'].every(k=>typeof reader[k]==='function'))
   throw new TypeError('PODIUM_REFERENCE_READER_CONTRACT_MISSING');
 const state={
  opened:false,seen:new Map(),events:[],seq:0,epoch:0,activePlan:null,activeRefraction:null,
  operatorQuestion:null,operatorMethod:null,customHeadline:null,customSubtitle:null,
  customHeroStatement:null,customLeftSpine:null,selectedCandidateId:null,lagTicks:36,
  supplementalSources:[],inquiryConjectures:[]
 };
 const applyHeadlineParams=params=>{
  if(!params||typeof params!=='object')return;
  if(params.reset_to_baseline===true){
   state.activePlan=null;state.activeRefraction=null;
   state.operatorQuestion=null;state.operatorMethod=null;
   state.customHeadline=null;state.customSubtitle=null;
   state.customHeroStatement=null;state.customLeftSpine=null;
   state.selectedCandidateId=null;state.lagTicks=36;
   state.supplementalSources=[];state.inquiryConjectures=[];
   return;
  }
  if(typeof params.research_question==='string')state.operatorQuestion=text(params.research_question,600).trim()||null;
  else if(typeof params.operator_question==='string')state.operatorQuestion=text(params.operator_question,600).trim()||null;
  if(typeof params.method_label==='string')state.operatorMethod=text(params.method_label,96).trim()||null;
  if(typeof params.header_tagline==='string')state.customHeadline=text(params.header_tagline,120).trim()||null;
  if(typeof params.pattern_subtitle==='string'){
   const sub=text(params.pattern_subtitle,140).trim()||null;
   if(sub)assertNoBoilerplateSubtitle(sub);
   state.customSubtitle=sub;
  }
  if(typeof params.hero_statement==='string')state.customHeroStatement=text(params.hero_statement,240).trim()||null;
  if(typeof params.left_spine==='string')state.customLeftSpine=text(params.left_spine,120).trim()||null;
  const rawSel=params.selected_candidate_id??params.select_candidate_id??params.candidate_id;
  if(typeof rawSel==='string')state.selectedCandidateId=text(rawSel,96).trim()||null;
  else if(rawSel===null)state.selectedCandidateId=null;
  if(params.lag_ticks!==undefined&&Number.isFinite(Number(params.lag_ticks))){
   state.lagTicks=Math.max(4,Math.min(120,Math.round(Number(params.lag_ticks))));
  }
  if(Array.isArray(params.supplemental_sources)){
   state.supplementalSources=params.supplemental_sources
    .filter(x=>x&&typeof x==='object'&&!Array.isArray(x))
    .slice(0,24)
    .map((x,i)=>({
     id:text(x.id||`SUP-${i+1}`,80)||`SUP-${i+1}`,
     title:text(x.title||x.id||`Supplemental Source ${i+1}`,160)
    }));
  }
  if(Array.isArray(params.inquiry_conjectures)){
   state.inquiryConjectures=params.inquiry_conjectures
    .filter(x=>x&&typeof x==='object'&&!Array.isArray(x))
    .slice(0,12)
    .map((x,i)=>({
     id:text(x.id||`op-conj-${i+1}`,64),
     title:text(x.title||`Conjecture ${i+1}`,160),
     lens:text(x.lens||'Operator Dictated Lens',96),
     now_notice:text(x.now_notice||'',320),
     why_matter:text(x.why_matter||'',420),
     exact_falsifier:text(x.exact_falsifier||'',420)
    }));
  }else if(params.synthesize_conjectures===true){
   state.inquiryConjectures=synthesizeOutsidePerspectiveConjectures(corpus,{
    lagTicks:Number(params.lag_ticks??36),
    filterCluster:params.cluster||null,
    limit:Number(params.limit||7)
   }).map(c=>({...c}));
  }
 };
 const ensureReferenceOpened=async params=>{
  if(state.opened)return true;
  if(operatorAuthorized===true||params?.auto_open===true||params?.operator_directive===true){
   event('UNIVERSAL_CENSUS_AUTO_OPENED_BY_OPERATOR_DIRECTIVE');
   const x=await reader.open();
   if(x.state==='CENSUS_MATCHED'){
    state.opened=true;
    event('UNIVERSAL_CENSUS_MATCHED',{records:x.records,edges:x.edges});
    return true;
   }
  }
  return false;
 };
 const runAttachedVixenSearch=async(query,opts={})=>{
  const mode=SUPPORTED_SEARCH_MODES.includes(opts.mode)?opts.mode:'hybrid';
  const limit=Math.min(24,Math.max(1,Number(opts.limit)||12));
  if(attachedSemantic){
   if(typeof attachedSemantic.searchAsync==='function'&&(opts.async===true||mode==='src_projective'||mode==='exact')){
    return {available:true,via:'ATTACHED_SEMANTIC_SEMIOTIC_ENGINE',result:await attachedSemantic.searchAsync(query,{...opts,mode,limit})};
   }
   return {available:true,via:'ATTACHED_SEMANTIC_SEMIOTIC_ENGINE',result:attachedSemantic.search(query,{...opts,mode,limit})};
  }
  if(operatorAuthorized===true&&typeof boundAdapters.SRC_ATELIER==='function'&&(mode==='src_projective'||opts.prefer_src===true)){
   const res=await boundAdapters.SRC_ATELIER({operation:'src_untypical_retrieval',payload:{query,mode,options:{...opts,limit}}});
   return {available:true,via:'SRC_ATELIER_ADAPTER',result:res};
  }
  if(operatorAuthorized===true&&typeof boundAdapters.ATLAS==='function'){
   const res=await boundAdapters.ATLAS({operation:'vixen_semantic_search',payload:{query,options:{...opts,mode,limit}}});
   return {available:true,via:'ATLAS_ADAPTER',result:res};
  }
  return {available:false,reason:operatorAuthorized?'HELD_NO_SEARCH_ADAPTER_OR_ENGINE_ATTACHED':'HELD_SEARCH_ENGINE_NOT_ATTACHED_OR_UNAUTHORIZED'};
 };
 const buildHeadline=()=>deriveSynthesisHeadline({
  corpus,
  activePlan:state.activePlan,
  refraction:state.activeRefraction,
  podiumEvents:state.events,
  supplementalSources:state.supplementalSources,
  operatorQuestion:state.operatorQuestion,
  operatorMethod:state.operatorMethod,
  customHeadline:state.customHeadline,
  customSubtitle:state.customSubtitle,
  customHeroStatement:state.customHeroStatement,
  customLeftSpine:state.customLeftSpine,
  selectedCandidateId:state.selectedCandidateId,
  lagTicks:state.lagTicks
 });
 const event=(action,extra={})=>{
  const e=Object.freeze({sequence:++state.seq,action,observation_time:new Date().toISOString(),
    recording_class:'VOLATILE_SESSION_NOT_APPEND_ONLY_PROOF',...extra});
  state.events.push(e);return e;
 };
 const receipt=(intent,status,result)=>{
  const value=Object.freeze({
   schema:PODIUM_RECEIPT,task_schema:PODIUM_SCHEMA,intent,
   status,result,
   evidence_class:'SOURCE_FREE_READ_ONLY_BOUNDED',
   source_revision_declared:sourceRevision,
   source_revision_externally_verified:false,
   current_sequence:state.seq,
   authority:Object.freeze({
    operator_closure:'RESERVED',merge:false,release:false,deployment:false,
    experiment_b_flight:'HELD',identity_adjudication:false,
    automatic_cross_opera_mapping:false,empirical_replication_credit:0
   })
  });
  return value;
 };
 // An explicit role governs a single human/AI journey. The API never
 // impersonates an LLM and never treats a task boolean as notes consent.
 const aiSession=createVixenAiSession({
  corpus,readCart:typeof readVisitorCart==='function'?readVisitorCart:()=>[],
  verifyProgramNotesConsent,authorProgramNote,
  hostNarrate:typeof narrateAiTurn==='function'?narrateAiTurn:null,
  hostRead:async({intent,params})=>run({schema:PODIUM_SCHEMA,intent,params})
 });
 const run=async task=>{
  if(!task||typeof task!=='object'||Array.isArray(task)||task.schema!==PODIUM_SCHEMA ||
    !PODIUM_ROUTES.includes(task.intent))
   return receipt(text(task?.intent,100)||'UNKNOWN','HELD',rejection('HELD_TASK_CONTRACT','Exact declared intent and schema required'));
  const intent=task.intent,params=task.params||{};
  if(!params||typeof params!=='object'||Array.isArray(params))
   return receipt(intent,'HELD',rejection('HELD_INVALID_PARAMETERS','Parameters must be a typed object'));
  try{
   if(intent.startsWith('vixen.ai.')){
    let result;
    switch(intent){
     case 'vixen.ai.start':
      result=await aiSession.start({role:params.role,goal:params.goal});
      break;
     case 'vixen.ai.choose':
      result=await aiSession.choose({
       choice_id:params.choice_id,source_work_id:params.source_work_id??null,
       question:params.question||''});
      break;
     case 'vixen.ai.report':
      result=await aiSession.report({quest_id:params.quest_id,outcome:params.outcome||'',
       observation:params.observation||'',skip:params.skip===true});
      break;
     case 'vixen.ai.status':result=aiSession.status();break;
     case 'vixen.ai.notes':
      result=params.phase==='view'?aiSession.notes():
       await aiSession.permission({phase:params.phase,proof:params.proof??null});
      break;
     case 'vixen.ai.handoff':result=aiSession.handoff();break;
     case 'vixen.ai.archive':result=aiSession.archive();break;
     case 'vixen.ai.finish':result=aiSession.finish();break;
    }
    if(result?.status==='SUPPORTED')event('AI_RESEARCH_SESSION_STEP',{
     role:result?.result?.role||null,session_intent:intent,
     notes_written_only_after_verification:true,claim_ceiling:'READ_ONLY'});
    return receipt(intent,result?.status||'HELD',result?.result||rejection('HELD_AI_SESSION_ROUTING','Unknown session response'));
   }
   if(intent==='podium.describe'){
    applyHeadlineParams(params);
    event('MACHINE_ROUTE_INSPECTED');
    return receipt(intent,'SUPPORTED',{
     podium:'MACHINE_FACING_RESEARCH_CONDUCTOR',roles:['OPERAHOUSE','OPERA','PERFORMER'],
     counts,available_routes:PODIUM_ROUTES,reader_state:reader.status().state,
     source_revision:sourceRevision,external_engine_connection:'EXPLICIT_ADAPTER_ONLY',
     route_memory:'SESSION_LOCAL_ONLY',
     synthesis_headline:buildHeadline(),
     aix_conductor:{
      canon_name:'SignalRupture Canon (SRC)',
      heterostratigraphic_strata:SRC_HETEROSTRATIGRAPHIC_STRATA,
      corpus_rooms:SRC_CORPUS_ROOMS,
      src_query_regimes:Object.keys(SRC_QUERY_REGIMES),
      semantic_search_modes:SUPPORTED_SEARCH_MODES,
      fusion_controls:{
       channels:FUSION_CHANNEL_KEYS,profiles:FUSION_PROFILE_IDS,
       weight_policies:FUSION_WEIGHT_POLICIES,
       finite_comparison_limit:6,finite_hit_limit:24,
       no_implicit_external_engine_connection:true
      },
      authority_axes:SRC_AUTHORITY_AXES,
      epistemic_state_axes:SRC_EPISTEMIC_STATE_AXES,
      false_continuity_screens:SRC_FALSE_CONTINUITY_SCREENS,
      first_class_methods:['conduct','search','exactSearch','neighbors','route','heterostratigraphicAudit'],
      semantic_search_attached:Boolean(attachedSemantic),
      src_adapter_connected:typeof boundAdapters.SRC_ATELIER==='function',
      atlas_adapter_connected:typeof boundAdapters.ATLAS==='function'
     }
    });
   }
   if(intent==='podium.score'){
    const score=await makePodiumScore(corpus,params,sourceRevision);
    if(latestScore?.score_sha256!==score.score_sha256){
     composeGate.invalidate('NEW_COMPUTATIONAL_SCORE_INVALIDATES_PREVIOUS_HUMAN_CHALLENGE');
    }
    latestScore=score;latestRedpenPacket=null;latestRedpenReturn=null;latestNativeReview=null;
    event('COMPUTATIONAL_SCORE_PREPARED',{digest:score.score_sha256,change_count:score.changes_count,
     visual_form:score.visuals.selected.id});
    return receipt(intent,'SUPPORTED',score);
   }
   if(intent==='podium.redpen'){
    // Redpen is a returnable critique; never independent WebAuthn authority.
    if(!latestScore||params.score_sha256!==latestScore.score_sha256)
     return receipt(intent,'HELD',rejection('HELD_CURRENT_COMPUTATIONAL_SCORE_REQUIRED',
      'An immutable current Score must be explicitly selected'));
    if(!latestRedpenPacket)latestRedpenPacket=buildRedpenPacket(latestScore);
    if(params.phase==='export'||params.phase==='chat')
     return receipt(intent,'SUPPORTED',{
      packet:latestRedpenPacket,
      blank_return:makeBlankRedpenReturn(latestRedpenPacket,{
       transport:params.phase==='chat'?'IN_CHAT_DECISION_RETURN':'REDPEN_JSON_RETURN'}),
      chat_controls:buildInChatRedpenControls(latestRedpenPacket),
      visual_attachment_gate:latestRedpenPacket.visual_review_attachment,
      release_authority:false
     });
    if(params.phase==='visual'){
     if(!latestRedpenPacket.visual_review_required)
      return receipt(intent,'SUPPORTED',buildNativeVisualDiff(latestRedpenPacket));
     if(typeof nativeReviewCaptureProvider!=='function')
      return receipt(intent,'HELD',rejection('HELD_NATIVE_CAPTURES_NOT_CONNECTED',
       'Host must generate both previous and new interactive scenes from the exact build'));
     let captures;try{captures=await nativeReviewCaptureProvider({
      score:latestScore,packet:latestRedpenPacket,source_revision:sourceRevision
     });}catch(_){
      return receipt(intent,'HELD',rejection('HELD_NATIVE_CAPTURE_FAILED','Renderer capture refused'));
     }
     const review=buildNativeVisualDiff(latestRedpenPacket,captures);
     latestNativeReview=review.status==='READY_FOR_OPERATOR_VISUAL_REVIEW'?review:null;
     return receipt(intent,review.status.startsWith('HELD')?'HELD':'SUPPORTED',review);
    }
    if(params.phase==='return'){
     const decision=adjudicateRedpenReturn(latestRedpenPacket,params.submission);
     if(decision.status==='REVIEW_READY_FOR_INDEPENDENT_AUTHENTICATION'&&
        latestRedpenPacket.visual_review_required&&!latestNativeReview)
      return receipt(intent,'HELD',rejection('HELD_REQUIRED_EXACT_VISUAL_REVIEW_NOT_ATTACHED',
       'Before final review, the native previous and replacement scenes must be available.'));

     latestRedpenReturn=decision.status==='REVIEW_READY_FOR_INDEPENDENT_AUTHENTICATION'?
      decision:null;
     if(!latestRedpenReturn)composeGate.invalidate('REDPEN_REVISION_OR_REJECTION_REQUIRES_NEW_SCORE');
     event('REDPEN_REVIEW_RETURNED',{score_sha256:latestScore.score_sha256,
      state:decision.status,human_authentication_completed:false});
     return receipt(intent,decision.status.startsWith('HELD')?'HELD':'SUPPORTED',decision);
    }
    return receipt(intent,'HELD',rejection('HELD_RED_PEN_PHASE_REQUIRED',
     'Choose export, chat, visual or return. No automatic Compose.'));
   }
   if(intent==='podium.compose'){
    // Agent-only Compose: stage -> request -> STOP. Task booleans cannot approve.
    if(params.phase==='inspect')return receipt(intent,'HELD',composeGate.inspect());
    if(params.phase==='stage'){
     if(!latestScore||params.score_sha256!==latestScore.score_sha256)
      return receipt(intent,'HELD',rejection('HELD_CURRENT_COMPUTATIONAL_SCORE_REQUIRED','Review and bind the exact computational Score digest'));
     const held=await composeGate.stage({...params.materials,
      computation_score_digest:latestScore.score_sha256,computed_score:latestScore});
     event('COMPOSE_SCORE_STAGE_ATTEMPT',{digest:latestScore.score_sha256,state:held.state});
     return receipt(intent,'HELD',held);
    }
    if(params.phase==='request'){
     if(!latestScore||composeGate.inspect().score?.computation_score_digest!==latestScore.score_sha256)
      return receipt(intent,'HELD',rejection('HELD_CURRENT_COMPUTATIONAL_SCORE_REQUIRED','Previously staged Score is stale or unavailable'));
     const held=await composeGate.requestCompose({score_digest:params.score_digest});
     event('COMPOSE_HUMAN_AUTHORIZATION_REQUESTED',{state:held.state,release_authority:false});
     return receipt(intent,'HELD',held);
    }
    if(params.phase==='compose'){
     if(!latestScore||composeGate.inspect().score?.computation_score_digest!==latestScore.score_sha256)
      return receipt(intent,'HELD',rejection('HELD_CURRENT_COMPUTATIONAL_SCORE_REQUIRED','Re-score requires a new independent human review'));
     const result=composeGate.compose({score_digest:params.score_digest});
     event('COMPOSE_PREVIEW_ATTEMPT',{state:result.state,release_authority:false});
     return receipt(intent,result.status==='SUPPORTED'?'SUPPORTED':'HELD',result);
    }
    const staged=await reachPodiumComposeGate(corpus,params,sourceRevision);
    if(latestScore?.score_sha256!==staged.score_sha256)
     composeGate.invalidate('NEW_COMPUTATIONAL_SCORE_INVALIDATES_PREVIOUS_HUMAN_CHALLENGE');
    latestScore=staged.score;
    event('COMPOSE_STOPPED_FOR_HUMAN_CLOSURE',{digest:staged.score_sha256,canonical_write:false,
     source_mutation:false,authorization:'NOT_RECEIVED'});
    return receipt(intent,'HELD',staged);
   }
   // Four finite fusion routes are read-only and cannot acquire external
   // execution authority, scientific promotion, or private-source access.
   if(intent==='vixen.fusion.capabilities'){
    event('FUSION_CAPABILITIES_INSPECTED');
    return receipt(intent,'SUPPORTED',{
     schema:'td613.vixen.fusion-machine-capabilities/v1',
     engine:'LEXICAL_SEMANTIC_SEMIOTIC_SRC_RETRIEVAL',
     connected:Boolean(attachedSemantic),
     channels:FUSION_CHANNEL_KEYS,
     profiles:Object.fromEntries(FUSION_PROFILE_IDS.map(k=>[k,FUSION_PROFILES[k]])),
     supported_modes:SUPPORTED_SEARCH_MODES,
     weight_policies:FUSION_WEIGHT_POLICIES,
     bounds:{min_query_chars:2,max_query_chars:200,max_hits:24,max_profiles:6},
     source_evidence:'RETRIEVED_PASSAGES_WITH_SOURCE_AND_OFFSET',
     all_semiotic_rungs:'CANDIDATE_ONLY_NOT_ENTAILMENT',
     fallback_status:'FALLBACK_NOT_FUSION',
     output_receipts:PODIUM_RECEIPT,
     native_invocation_required:false,
     independent_empirical_witness_observed:false,
     release_authority:false
    });
   }
   if(['vixen.fusion.search','vixen.fusion.compare','vixen.fusion.explain'].includes(intent)){
    const q=params.query;
    if(typeof q!=='string'||q.trim().length<2||q.length>200){
     return receipt(intent,'HELD',rejection('HELD_FUSION_QUERY_BOUNDS','Query must contain 2–200 characters'));
    }
    if(!attachedSemantic){
     return receipt(intent,'HELD',rejection('HELD_FUSION_ENGINE_NOT_ATTACHED','Attach the full semantic-semiotic index; fallback cannot substitute for fusion'));
    }
    const runFusion=async(mode,limit,spec)=>{
     if(!['hybrid','lexical','phrase','src_projective'].includes(mode)){
      throw new TypeError('VIXEN_FUSION_UNSUPPORTED_ABLATION_MODE');
     }
     const fusion=normalizeFusionControls(spec);
     const args={mode,limit,fusion};
     const raw=typeof attachedSemantic.searchAsync==='function'
      ?await attachedSemantic.searchAsync(q,args)
      :attachedSemantic.search(q,args);
     if(raw?.fusion_state!=='FULL_INDEX_FUSION'||raw?.status==='INLINE_FALLBACK_OK'){
      return {available:false,status:raw?.status||'UNAVAILABLE'};
     }
     return {available:true,result:raw,fusion};
    };
    if(intent==='vixen.fusion.compare'){
     const request=boundedFusionComparisonSpec(params);
     const comparisons=[];
     for(const profile of request.profiles){
      const calc=await runFusion(request.mode,request.limit,{profile,weight_policy:request.weight_policy});
      if(!calc.available)return receipt(intent,'HELD',rejection('HELD_FUSION_FULL_INDEX_REQUIRED',calc.status));
      comparisons.push({
       profile,channels:calc.fusion.channels,weight_policy:calc.fusion.weight_policy,
       status:calc.result.status,total_hits:calc.result.total_hits,
       hits:(calc.result.hits||[]).slice(0,request.limit).map((h,i)=>({
        id:h.id,rank:i+1,score:h.score_total,
        channels:h.fusion_contributions||null,
        raw:{lex:h.s_lex,semantic:h.s_sem,semiotic:h.s_semi,src:h.s_src},
        rung:h.highest_rung,source_file_id:h.source_file_id,
        page_span:h.page_span||null,chunk_sha256:h.chunk_sha256||null
       }))
      });
     }
     const anchorResult=comparisons[0];
     const changes=(anchorResult?.hits||[]).slice(0,12).map(h=>({
      id:h.id,source_file_id:h.source_file_id,
      per_profile:Object.fromEntries(comparisons.map(c=>{
       const m=c.hits.find(x=>x.id===h.id);
       return [c.profile,m?{rank:m.rank,score:m.score}:null];
      }))
     }));
     event('VIXEN_FUSION_ABLATION_COMPARED',{profile_count:comparisons.length,query:q.slice(0,80)});
     return receipt(intent,'SUPPORTED',{
      schema:'td613.vixen.fusion-comparison/v1',
      query:q,mode:request.mode,weight_policy:request.weight_policy,
      comparisons,anchor_deltas:changes,engine:'FULL_INDEX_FUSION',
      qualification:'RETRIEVAL_RANKING_NOT_BODY_ENTAILMENT',
      source_revision:sourceRevision,
      empirical_replication_credit:0
     });
    }
    const limit=Number(params.limit??12);
    if(!Number.isInteger(limit)||limit<1||limit>24){
     return receipt(intent,'HELD',rejection('HELD_FUSION_HIT_LIMIT','Fusion hits must be an integer 1–24'));
    }
    const mode=params.mode??'hybrid';
    const spec={
     profile:params.profile??'FULL_FUSION',
     channels:params.channels??{},
     weight_policy:params.weight_policy??'PRESERVE_BASELINE'
    };
    const calc=await runFusion(mode,limit,spec);
    if(!calc.available)return receipt(intent,'HELD',rejection('HELD_FUSION_FULL_INDEX_REQUIRED',calc.status));
    if(intent==='vixen.fusion.explain'){
     const id=text(params.hit_id,160);
     if(!id)return receipt(intent,'HELD',rejection('HELD_FUSION_HIT_ID_REQUIRED','Supply a returned hit_id'));
     const hit=(calc.result.hits||[]).find(x=>x.id===id);
     if(!hit)return receipt(intent,'HELD',rejection('HELD_FUSION_HIT_NOT_IN_BOUNDED_PAGE','Hit not found in specified query/limit/profile result'));
     event('VIXEN_FUSION_HIT_EXPLAINED',{hit_id:id});
     return receipt(intent,'SUPPORTED',{
      query:q,profile:calc.fusion.profile,mode,hit_id:id,
      source_file_id:hit.source_file_id,
      source_sha256:hit.sha256||null,
      chunk_sha256:hit.chunk_sha256||null,
      citation:hit.citation||null,
      scoring:{
       total:hit.score_total,lexical:hit.s_lex,semantic:hit.s_sem,
       semiotic:hit.s_semi,src:hit.s_src,
       effective_contributions:hit.fusion_contributions,
       normalization:hit.fusion_normalization_factor,
       active_weight_sum:hit.fusion_active_weight_sum,
       highest_rung:hit.highest_rung,why:hit.why
      },
      claim_ceiling:'SEARCH_EVIDENCE_ONLY_NOT_SEMANTIC_ENTAILMENT'
     });
    }
    event('VIXEN_FUSION_SEARCH_READ',{mode,profile:calc.fusion.profile,hits:calc.result.returned_hits});
    return receipt(intent,'SUPPORTED',{
     query:q,mode,profile:calc.fusion.profile,
     engine:'FULL_INDEX_FUSION',fusion_controls:calc.fusion,
     search:calc.result,
     claim_ceiling:'SEARCH_RETRIEVAL_AND_SEMIOTIC_AFFINITY_NOT_PROOF'
    });
   }
   if(intent==='vixen.work.inspect'){
    const id=text(params.work_id,160);
    const w=corpus.works.find(x=>x.work_id===id);
    event('VIXEN_WORK_LOOKUP',{work_id:id,found:Boolean(w)});
    return receipt(intent,w?'SUPPORTED':'HELD',w? {
      ...safeRecord(w),
      src_heterostratigraphic_context:{
       canon_name:'SignalRupture Canon (SRC)',
       corpus_rooms:SRC_CORPUS_ROOMS,
       strata:SRC_HETEROSTRATIGRAPHIC_STRATA,
       epistemic_state_model:'X_t=(E,V,R,P,L,A)',
       authority_model:'A_t=(G,C,E,F,K)',
       composite_state_score:null,
       path_lifts_to_direct_edge:false
      }
     }:
      rejection('HELD_WORK_NOT_FOUND','No such historical Vixen Work'));
   }
   if(intent==='vixen.gates.inspect'){
    event('VIXEN_GATE_CENSUS_INSPECTED');
    return receipt(intent,'SUPPORTED',{
     gates:corpus.human_gates.map(g=>({
      gate_num:g.gate_num,
      status:'UNADJUDICATED_PAIR',
      source_identity:'SEPARATE_MD_AND_PDF_MANIFESTATIONS',
      substantive_equivalence:'HUMAN_EDITORIAL_REVIEW_REQUIRED'
     })),automated_adjudication:false
    });
   }
   if(intent==='universal.open'){
    event('UNIVERSAL_CENSUS_REQUESTED');
    const x=await reader.open();
    if(x.state==='CENSUS_MATCHED'){
     state.opened=true;event('UNIVERSAL_CENSUS_MATCHED',{records:x.records,edges:x.edges});
     return receipt(intent,'SUPPORTED',{state:x.state,edition:x.edition,records:x.records,edges:x.edges,
       provenance:'INDEX_SELF_CONSISTENCY_NOT_EXTERNAL_ORIGIN'});
    }
    return receipt(intent,'HELD',rejection('HELD_REFERENCE_CENSUS','Reference not independently opened'));
   }
   if(intent==='universal.search'){
    if(!(await ensureReferenceOpened(params)))return receipt(intent,'HELD',rejection('HELD_INDEX_NOT_OPEN','Call universal.open first or pass auto_open:true under explicit operator directive'));
    const q=text(params.query,200).trim();if(!q)return receipt(intent,'HELD',rejection('HELD_EMPTY_QUERY','Operator must supply query'));
    const limit=Math.min(24,Math.max(1,Number(params.limit)||12));
    const hits=reader.search(q,{limit});
    event('UNIVERSAL_LEXICAL_SEARCH',{query:q,count:hits.length,classification:'LEXICAL_MATCH_NOT_RELATION'});
    let vixen_search;
    if(params.include_vixen_search===true){
     const requestedMode=SUPPORTED_SEARCH_MODES.includes(params.mode)?params.mode:'hybrid';
     const sem=await runAttachedVixenSearch(q,{mode:requestedMode,limit});
     vixen_search=sem.available
      ?{available:true,estate:'EMSTD613',cross_opera_merged:false,via:sem.via,claim_ceiling:'SEARCH_MATCH_ONLY_NOT_ENTAILMENT',...sem.result}
      :{available:false,estate:'EMSTD613',cross_opera_merged:false,reason:sem.reason||'HELD_SEMANTIC_SEARCH_UNAVAILABLE'};
     event('UNIVERSAL_SEARCH_WITH_SEPARATE_VIXEN_LANE',{query:q,mode:requestedMode,vixen_available:vixen_search.available,cross_opera_merged:false});
    }
    return receipt(intent,'SUPPORTED',{query:q,hits,...(vixen_search?{vixen_search}:{}),claim_ceiling:'SEARCH_MATCH_ONLY_NOT_ENTAILMENT'});
   }
   if(intent==='universal.get'){
    if(!(await ensureReferenceOpened(params)))return receipt(intent,'HELD',rejection('HELD_INDEX_NOT_OPEN','Call universal.open first or pass auto_open:true under explicit operator directive'));
    const id=text(params.record_id,100);
    if(!recordId(id))return receipt(intent,'HELD',rejection('HELD_REFERENCE_ID','Invalid canonical record ID'));
    const witness=await reader.getRecord(id);
    if(!witness?.verified_at_interaction||!RX_SHA.test(witness.record_sha256||'')||witness.id!==id)
      return receipt(intent,'HELD',rejection('HELD_RECORD_NOT_VERIFIED','Canonical byte witness unavailable'));
    state.seen.set(id,witness);
    event('UNIVERSAL_RECORD_BYTES_VERIFIED',{record_id:id,sha256:witness.record_sha256});
    return receipt(intent,'SUPPORTED',{
     estate:'UNIVERSAL_REFERENCE',record_id:id,record:witness.record,
     canonical_sha256:witness.record_sha256,served_file_sha256:witness.served_file_sha256,
     source_path:witness.source_path,
     claim_ceiling:'CANONICAL_PAYLOAD_SHA256_VERIFIED_NOT_CLAIM_ENTAILMENT'
    });
   }
   if(intent==='universal.related'){
    if(!(await ensureReferenceOpened(params)))return receipt(intent,'HELD',rejection('HELD_INDEX_NOT_OPEN','Call universal.open first or pass auto_open:true under explicit operator directive'));
    const id=text(params.record_id,100);
    if(!recordId(id))return receipt(intent,'HELD',rejection('HELD_REFERENCE_ID','Invalid canonical record ID'));
    if(!state.seen.has(id)&&(operatorAuthorized===true||params.auto_verify_record===true||params.operator_directive===true)){
     const witness=await reader.getRecord(id);
     if(witness?.verified_at_interaction&&RX_SHA.test(witness.record_sha256||'')&&witness.id===id){
      state.seen.set(id,witness);
      event('UNIVERSAL_RECORD_BYTES_VERIFIED',{record_id:id,sha256:witness.record_sha256});
     }
    }
    if(!state.seen.has(id))
      return receipt(intent,'HELD',rejection('HELD_SOURCE_NOT_VERIFIED','First verify the exact reference record'));
    const edges=reader.related(id,{limit:Math.min(24,Math.max(1,Number(params.limit)||12))});
    event('UNIVERSAL_GRAPH_RELATIONS_READ',{record_id:id,count:edges.length});
    return receipt(intent,'SUPPORTED',{record_id:id,edges,
     claim_ceiling:'UNIVERSAL_GRAPH_EDGE_NOT_CROSS_ESTATE_CAUSAL_PROOF'});
   }
   if(intent==='synthesis.propose'){
    applyHeadlineParams(params);
    const work=corpus.works.find(w=>w.work_id===text(params.work_id,160));
    const source=work?.linked_sources.find(s=>s.source_file_id===text(params.source_id,160));
    const id=text(params.record_id,100);
    let witness=state.seen.get(id);
    if(!witness&&recordId(id)&&(operatorAuthorized===true||params.auto_verify_record===true||params.operator_directive===true)){
     await ensureReferenceOpened(params);
     if(state.opened){
      const wBytes=await reader.getRecord(id);
      if(wBytes?.verified_at_interaction&&RX_SHA.test(wBytes.record_sha256||'')&&wBytes.id===id){
       state.seen.set(id,wBytes);
       witness=wBytes;
       event('UNIVERSAL_RECORD_BYTES_VERIFIED',{record_id:id,sha256:wBytes.record_sha256});
      }
     }
    }
    if(!work||!source)return receipt(intent,'HELD',rejection('HELD_VIXEN_SOURCE_IDENTITY','Historical Work/manifestation pair absent'));
    if(!witness)return receipt(intent,'HELD',rejection('HELD_REFERENCE_NOT_VERIFIED','Verify explicit Universal record first'));
    const warrant=inspectVixenCrossOperaWarrant({work,source});
    const proposal=constructCrossAtelierWitness({
     work,source,witness,warrant,humanQuestion:text(params.question,700),history:state.events
    });
    const srcHeterostratigraphicAudit=runSrcHeterostratigraphicAudit({
     corpus,
     operatorQuestion:text(params.question,700)||state.operatorQuestion||'',
     activePlan:state.activePlan
    });
    event('CROSS_ATELIER_UNRATIFIED_PROPOSAL',{
     vixen_work_id:work.work_id,source_id:source.source_file_id,record_id:id,
     state:proposal.disposition,claim:'UNESTABLISHED'
    });
    return receipt(intent,'HELD',{
     ...proposal,state:'WITNESSED_UNLINKED_PAIR',
     synthesis_headline:buildHeadline(),
     src_heterostratigraphic_audit:srcHeterostratigraphicAudit,
     aix_conducting_steps:['universal.open','universal.get','vixen.work.inspect','engine.invoke(SRC_ATELIER)','synthesis.propose'],
     question_need:'INDEPENDENT_EVIDENCE_AND_HUMAN_WARRANT_REQUIRED',
     no_automatic_promotion:true,
     scientific_surplus:'UNESTABLISHED'
    });
   }
   if(intent==='vixen.salon.compose'){
    applyHeadlineParams(params);
    const plan=composeSalonPlan(corpus,params);
    state.activePlan=plan;
    state.activeRefraction=null;
    if(!state.inquiryConjectures.length){
     state.inquiryConjectures=synthesizeOutsidePerspectiveConjectures(corpus,{
      lagTicks:Number(params.lag_ticks??36),limit:7
     }).map(c=>({...c}));
    }
    event('VIXEN_SOURCE_BOUND_THEORY_PROPOSED',{
     source_work_ids:plan.source_coordinates.map(x=>x.work_id),
     status:'OPEN_FIELD_UNRATIFIED_QUESTION',
     independent_source_body_observed:false
    });
    return receipt(intent,'HELD',{
     state:'CREATIVE_PROPOSAL_AWAITING_HUMAN_REVIEW',plan,
     observatory_diagnostics:plan.observatory_diagnostics,
     outside_conjectures:state.inquiryConjectures,
     synthesis_headline:buildHeadline(),
     claim_ceiling:'SOURCE_METADATA_PLUS_OPERATOR_QUESTION_NOT_SCIENCE'
    });
   }
   if(intent==='experiment_b.preregister'){
    applyHeadlineParams(params);
    const plan=composeSalonPlan(corpus,params);
    const counterfactual=refractSalonPlan(corpus,params);
    state.activePlan=plan;
    state.activeRefraction=counterfactual;
    event('EXPERIMENT_B_PROSPECTIVE_PREREG_ONLY',{
     experiment_b_flight:'HELD',
     human_closure:'RESERVED',
     same_terminal_sources:true,
     distinct_route_history:true
    });
    return receipt(intent,'HELD',{
     state:'PREREGISTRATION_CANDIDATE_ONLY',
     baseline:'COMPETENT_UNION_MATCHED_CONTROL',
     plan:plan.experiment_b,counterfactual,
     synthesis_headline:buildHeadline(),
     prospective_measurements:plan.comparative_measurements,
     constructed_mechanisms:plan.cross_source_mechanisms,
     testable_predicate:plan.testable_predicate,
     source_coordinates:plan.source_coordinates,
     experiment_b_flight:'HELD',release_authority:false,
     manifest_succession:'UNKNOWN',empirical_replication_credit:0
    });
   }
   if(intent==='engine.capabilities'){
    event('ENGINE_CAPABILITIES_INSPECTED');
    return receipt(intent,'SUPPORTED',{
     adapters:Object.fromEntries(Object.entries(BOUNDED_ENGINE_OPERATIONS).map(([k,ops])=>
      [k,{connected:typeof boundAdapters[k]==='function',allowed_operations:ops}])),
     semantic_search_attached:Boolean(attachedSemantic),
     native_receiver_status:typeof boundAdapters.WENDBINE_ATELIER==='function' &&
      typeof boundAdapters.EM_ATELIER==='function' && typeof boundAdapters.CROSS_ATELIER==='function'
      ?'ORIGINAL_NATIVE_HOST_BRIDGES_CONNECTED_PRIVATE_INDEX_STILL_REQUIRED'
      :'ORIGINAL_NATIVE_RESEARCH_ENGINES_NOT_CONNECTED',
     no_execution_without_host_explicit_authority:true
    });
   }
   if(intent==='engine.invoke'){
    const engine=text(params.engine,64),operation=text(params.operation,80);
    const allowed=BOUNDED_ENGINE_OPERATIONS[engine];
    if(!allowed||!allowed.includes(operation))
      return receipt(intent,'HELD',rejection('HELD_ENGINE_OPERATION_NOT_ALLOWED','No write/admission/elevation routes'));
    if(operatorAuthorized!==true)
      return receipt(intent,'HELD',rejection('HELD_OPERATOR_AUTHORITY_NOT_SUPPLIED','Task JSON cannot grant execution authority'));
    const adapter=boundAdapters[engine];
    if(typeof adapter!=='function')
      return receipt(intent,'HELD',rejection('HELD_ENGINE_NOT_CONNECTED','No native tool adapter installed for this host'));
    const payload=params.payload??{};
    if(!payload||typeof payload!=='object'||Array.isArray(payload))
      return receipt(intent,'HELD',rejection('HELD_INVALID_ENGINE_PAYLOAD','Expected typed object'));
    event('EXPLICIT_ENGINE_ADAPTER_INVOKED',{engine,operation,authority:'HOST_PASSED_ONLY'});
    const output=await adapter({operation,payload,claim_ceiling:'ADAPTER_RESULT_NOT_SCIENTIFIC_PROMOTION'});
    const serialized=JSON.stringify(output);
    if(typeof serialized!=='string'||serialized.length>50000)
      return receipt(intent,'HELD',rejection('HELD_ADAPTER_OUTPUT_TOO_LARGE','Bounded result exceeded 50k characters'));
    return receipt(intent,'HELD',{
     state:'UNVERIFIED_ENGINE_ADAPTER_RETURN',engine,operation,output,
     native_engine_execution_claim:'EXTERNAL_HOST_RESPONSIBLE_FOR_PROVENANCE',
     endorsement:false,adjudication:false,scientific_credit:0
    });
   }
  }catch(error){
   event('TASK_REFUSED',{intent,error_code:String(error?.code||'INTERNAL_FAILURE').slice(0,80)});
   return receipt(intent,'HELD',rejection(
    text(error?.code,100)||'HELD_EXECUTION_FAILURE',text(error?.message,300)||'Execution failed closed'
   ));
  }
 };
 const conductSearch=async(query,opts={})=>{
  const q=text(query,200).trim();
  if(!q)return receipt('aix.conductor.search','HELD',rejection('HELD_EMPTY_QUERY','Operator must supply query'));
  const mode=SUPPORTED_SEARCH_MODES.includes(opts.mode)?opts.mode:'hybrid';
  const limit=Math.min(24,Math.max(1,Number(opts.limit)||12));
  const sem=await runAttachedVixenSearch(q,{...opts,mode,limit});
  let universalHits=null;
  if(opts.include_universal===true){
   if(await ensureReferenceOpened({auto_open:opts.auto_open,operator_directive:opts.operator_directive})){
    universalHits=reader.search(q,{limit});
   }
  }
  if(!sem.available&&universalHits===null){
   return receipt('aix.conductor.search','HELD',rejection(sem.reason,'Attach semanticSearch or authorize native search adapter'));
  }
  event('AIX_CONDUCTOR_SEARCH',{query:q,mode,via:sem.available?sem.via:'UNIVERSAL_ONLY',cross_opera_merged:false});
  return receipt('aix.conductor.search',sem.available?'SUPPORTED':'HELD',{
   query:q,
   mode,
   estate:'EMSTD613',
   cross_opera_merged:false,
   via:sem.available?sem.via:null,
   vixen_search:sem.available?sem.result:null,
   ...(universalHits!==null?{universal_hits:universalHits}:{}),
   claim_ceiling:'SEARCH_MATCH_ONLY_NOT_ENTAILMENT'
  });
 };
 const conductExactSearch=async(query,opts={})=>{
  const q=text(query,200).trim();
  if(!q)return receipt('aix.conductor.exact_search','HELD',rejection('HELD_EMPTY_QUERY','Operator must supply query'));
  if(attachedSemantic&&typeof attachedSemantic.exactSearch==='function'){
   const res=await attachedSemantic.exactSearch(q,opts);
   event('AIX_CONDUCTOR_EXACT_SEARCH',{query:q,cross_opera_merged:false});
   return receipt('aix.conductor.exact_search','SUPPORTED',{
    query:q,mode:'exact',estate:'EMSTD613',cross_opera_merged:false,
    via:'ATTACHED_SEMANTIC_SEMIOTIC_EXACT',vixen_search:res,
    claim_ceiling:'SEARCH_MATCH_ONLY_NOT_ENTAILMENT'
   });
  }
  return conductSearch(q,{...opts,mode:'exact'});
 };
 const conductNeighbors=async(id,opts={})=>{
  const target=text(id,160).trim();
  if(!target)return receipt('aix.conductor.neighbors','HELD',rejection('HELD_EMPTY_ID','Operator must supply node ID'));
  const vixenNeighbors=attachedSemantic&&typeof attachedSemantic.neighbors==='function'
   ?attachedSemantic.neighbors(target,opts)
   :null;
  let universalEdges=null;
  if(opts.include_universal===true&&recordId(target)){
   if(await ensureReferenceOpened({auto_open:opts.auto_open,operator_directive:opts.operator_directive})){
    if(!state.seen.has(target)&&(operatorAuthorized===true||opts.auto_verify_record===true||opts.operator_directive===true)){
     const w=await reader.getRecord(target);
     if(w?.verified_at_interaction&&RX_SHA.test(w.record_sha256||'')&&w.id===target)state.seen.set(target,w);
    }
    if(state.seen.has(target))universalEdges=reader.related(target,{limit:Math.min(24,Math.max(1,Number(opts.limit)||12))});
   }
  }
  if(!vixenNeighbors&&universalEdges===null){
   return receipt('aix.conductor.neighbors','HELD',rejection('HELD_GRAPH_NEIGHBORS_UNAVAILABLE','Attach semanticSearch or verify Universal record ID'));
  }
  event('AIX_CONDUCTOR_NEIGHBORS',{id:target,cross_opera_merged:false});
  return receipt('aix.conductor.neighbors','SUPPORTED',{
   id:target,cross_opera_merged:false,path_lifts_to_direct_edge:false,
   vixen_neighbors:vixenNeighbors,
   ...(universalEdges!==null?{universal_edges:universalEdges}:{})
  });
 };
 const conductRoute=async(fromId,toId,opts={})=>{
  const a=text(fromId,160).trim(),b=text(toId,160).trim();
  if(!a||!b)return receipt('aix.conductor.route','HELD',rejection('HELD_ROUTE_ENDPOINTS_REQUIRED','Operator must supply from and to IDs'));
  if(opts.universal===true&&operatorAuthorized===true&&typeof boundAdapters.UNIVERSAL_ATELIER==='function'){
   const res=await boundAdapters.UNIVERSAL_ATELIER({operation:'route',payload:{from:a,to:b,max_depth:opts.max_depth}});
   event('AIX_CONDUCTOR_ROUTE',{from:a,to:b,estate:'UNIVERSAL_REFERENCE'});
   return receipt('aix.conductor.route','HELD',{
    from:a,to:b,estate:'UNIVERSAL_REFERENCE',path_lifts_to_direct_edge:false,route:res
   });
  }
  if(attachedSemantic&&typeof attachedSemantic.route==='function'){
   const res=attachedSemantic.route(a,b,opts);
   event('AIX_CONDUCTOR_ROUTE',{from:a,to:b,estate:'EMSTD613'});
   return receipt('aix.conductor.route',res?'SUPPORTED':'HELD',{
    from:a,to:b,estate:'EMSTD613',path_lifts_to_direct_edge:false,route:res
   });
  }
  return receipt('aix.conductor.route','HELD',rejection('HELD_ROUTE_UNAVAILABLE','Attach semanticSearch or use operatorAuthorized UNIVERSAL_ATELIER route'));
 };
 const conductHeterostratigraphicAudit=async(opts={})=>{
  const question=text(opts?.operatorQuestion??opts?.operator_question??'',600)||state.operatorQuestion||'';
  const plan=opts?.activePlan||state.activePlan||null;
  const candidateEnvelope=opts?.candidateEnvelope||opts?.candidate_envelope||null;
  let audit;
  if(opts?.prefer_adapter===true&&operatorAuthorized===true&&typeof boundAdapters.SRC_ATELIER==='function'){
   audit=await boundAdapters.SRC_ATELIER({
    operation:'src_heterostratigraphic_audit',
    payload:{corpus,operator_question:question,active_plan:plan,candidate_envelope:candidateEnvelope}
   });
  }else{
   audit=runSrcHeterostratigraphicAudit({corpus,operatorQuestion:question,activePlan:plan,candidateEnvelope});
  }
  event('SRC_HETEROSTRATIGRAPHIC_AUDIT_RUN',{
   regime:audit?.query_conditioning?.regime_id||null,
   universalizer_rejected:Boolean(audit?.universalizer_guard&&!audit.universalizer_guard.accepted)
  });
  return receipt('aix.conductor.heterostratigraphic_audit','HELD',{
   ...audit,
   advisory_only:true
  });
 };
 const conductSingle=async step=>{
  if(!step||typeof step!=='object'||Array.isArray(step)){
   return receipt('aix.conductor.invalid','HELD',rejection('HELD_CONDUCTOR_DIRECTIVE','Expected task or directive object'));
  }
  if(step.schema===PODIUM_SCHEMA)return run(step);
  if(typeof step.intent==='string'&&PODIUM_ROUTES.includes(step.intent)){
   return run({schema:PODIUM_SCHEMA,intent:step.intent,params:step.params||{}});
  }
  if(typeof step.search==='string')return conductSearch(step.search,step);
  if(typeof step.exact==='string')return conductExactSearch(step.exact,step);
  if(typeof step.neighbors==='string')return conductNeighbors(step.neighbors,step);
  if(Array.isArray(step.route)&&step.route.length===2)return conductRoute(step.route[0],step.route[1],step);
  if(typeof step.from==='string'&&typeof step.to==='string')return conductRoute(step.from,step.to,step);
  if(step.src_projective!==undefined){
   if(typeof step.src_projective==='string')return conductSearch(step.src_projective,{...step,mode:'src_projective'});
   return run({
    schema:PODIUM_SCHEMA,intent:'engine.invoke',
    params:{engine:'SRC_ATELIER',operation:'src_projective_routing',payload:{documents:Array.isArray(step.src_projective)?step.src_projective:[],catalog:step.catalog}}
   });
  }
  if(step.src_tomography!==undefined){
   return run({
    schema:PODIUM_SCHEMA,intent:'engine.invoke',
    params:{engine:'SRC_ATELIER',operation:'src_phase2_tomography',payload:{lift_candidates:Array.isArray(step.src_tomography)?step.src_tomography:[]}}
   });
  }
  if(step.src_heterostratigraphic!==undefined){
   const opts=typeof step.src_heterostratigraphic==='object'&&step.src_heterostratigraphic!==null
    ?step.src_heterostratigraphic
    :{operatorQuestion:typeof step.src_heterostratigraphic==='string'?step.src_heterostratigraphic:''};
   return conductHeterostratigraphicAudit(opts);
  }
  if(step.propose_headline&&typeof step.propose_headline==='object'){
   return run({schema:PODIUM_SCHEMA,intent:'podium.describe',params:step.propose_headline});
  }
  return receipt('aix.conductor.unknown','HELD',rejection('HELD_CONDUCTOR_DIRECTIVE','Unsupported AIx conductor directive'));
 };
 const conduct=async taskOrBatch=>{
  if(Array.isArray(taskOrBatch)){
   if(taskOrBatch.length>32){
    return receipt('aix.conductor.batch','HELD',rejection('HELD_BATCH_TOO_LARGE','Bounded to 32 AIx conducting steps'));
   }
   const steps=[];
   for(const item of taskOrBatch)steps.push(await conductSingle(item));
   return Object.freeze({
    schema:'td613.vixen.podium.conduct-batch/v1',
    canon_name:'SignalRupture Canon (SRC)',
    step_count:steps.length,
    steps,
    synthesis_headline:buildHeadline(),
    empirical_replication_credit:0,
    release_authority:false,
    human_closure_required:true
   });
  }
  return conductSingle(taskOrBatch);
 };
 return Object.freeze({
  schema:PODIUM_SCHEMA,routes:()=>[...PODIUM_ROUTES],
  dispatch:run,conduct,
  acceptHumanApprovalFromHost:proof=>composeGate.acceptHumanApproval(proof),
  compositionStatus:()=>composeGate.inspect(),
  search:conductSearch,exactSearch:conductExactSearch,
  neighbors:conductNeighbors,route:conductRoute,
  heterostratigraphicAudit:conductHeterostratigraphicAudit,
  history:()=>state.events.slice(),
   synthesisState:()=>{
   const headline=buildHeadline();
   return Object.freeze({
    schema:'emstd613.vixen.podium-synthesis-state/v1',
    status:headline.regime,
    operator_question:state.operatorQuestion,
    operator_method:state.operatorMethod,
    custom_headline:state.customHeadline,
    custom_subtitle:state.customSubtitle,
    custom_hero_statement:state.customHeroStatement,
    custom_left_spine:state.customLeftSpine,
    selected_candidate_id:state.selectedCandidateId||headline.provenance?.selected_candidate_id||null,
    lag_ticks:state.lagTicks,
    active_plan:state.activePlan,
    refraction:state.activeRefraction,
    inquiry_conjectures:state.inquiryConjectures.slice(),
    supplemental_sources:state.supplementalSources.slice(),
    podium_events:state.events.slice(-24),
    synthesis_headline:headline,
    empirical_replication_credit:0,
    scientific_promotion_authority:false,
    human_closure_required:true,
    release_authority:false
   });
  },
  state:()=>Object.freeze({opened:state.opened,verified_record_ids:[...state.seen.keys()],
   engine_adapter_count:Object.keys(boundAdapters).filter(k=>typeof boundAdapters[k]==='function').length,
   semantic_search_attached:Boolean(attachedSemantic),
   evidence:'VOLATILE_SESSION_ONLY'})
 });
}
