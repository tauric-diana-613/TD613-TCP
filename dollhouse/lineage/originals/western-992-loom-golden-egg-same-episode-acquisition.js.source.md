import { GOLDEN_EGG_EVIDENCE_CLOSURE_NOGO_CERTIFICATE as P, GOLDEN_EGG_OPERATIONAL_SURFACES, evaluateGoldenEggEvidenceClosure } from './golden-egg-evidence-closure-nogo.js';

export const LOOM_GOLDEN_EGG_ACQUISITION_SCHEMA='td613.dome-world.loom-golden-egg-same-episode-acquisition-contract/v0.1';
export const LOOM_GOLDEN_EGG_ACQUISITION_PARENT='28ba14628326db37282d3d78335d6ee707b087b4';
export const LOOM_RUNTIME_SOURCE_CUSTODY=Object.freeze({
  commit:'d652c5e151471be7e40ff6a08936ba26c0cef1ad',
  blob:'695d22ec77339bc54512fe6a6a7c0203240ff135',
  path:'app/dome-world/index.html',
  display:'Loom Room',
  receives:Object.freeze(['transmission','cadence-sample','motif-return']),
  preserves:Object.freeze(['holonomy','pattern-flow','anti-equivalence-edge']),
  emits:Object.freeze(['motif','cloth-map','route-deformation']),
  claim_ceiling:'route-deformation-record-not-truth-proof'
});
export const GOLDEN_EGG_GEOMETRY_DESIGN_RECEIPT='783fdf0c6fa0a75607e23845700c0963bca6e575';
const EMPIRICAL_CLASSES=new Set(['VALIDATION_GATED_DEPLOYED_BOUNDARY_OBSERVED','PUBLIC_EMPIRICAL_CASE']);
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const nonempty=v=>typeof v==='string'&&v.length>0;
const exactSurface=(s,name,e)=>s&&s.measured===true&&s.name===name&&s.episode_id===e;
const empirical=a=>a&&EMPIRICAL_CLASSES.has(a.evidence_class);

function normalizeRoutes(episode,errors){
  const departure=episode?.departure||{};
  if(!nonempty(departure.departure_id)||!nonempty(departure.custody_id)||!nonempty(departure.comparison_frame_id))errors.push('INVALID_SHARED_DEPARTURE');
  if(!Array.isArray(episode?.routes)||episode.routes.length!==2){errors.push('EXACTLY_TWO_ROUTES_REQUIRED');return {control:null,protectedRoute:null};}
  const control=episode.routes.find(r=>r?.role==='control')||null;
  const protectedRoute=episode.routes.find(r=>r?.role==='protected')||null;
  if(!control||!protectedRoute)errors.push('CONTROL_AND_PROTECTED_ROLES_REQUIRED');
  for(const r of [control,protectedRoute]){
    if(!r)continue;
    if(!nonempty(r.route_id)||!nonempty(r.return_id)||r.return_observed!==true)errors.push(`INCOMPLETE_${String(r.role||'route').toUpperCase()}_ROUTE`);
    if(r.departure_id!==departure.departure_id||r.custody_id!==departure.custody_id||r.comparison_frame_id!==departure.comparison_frame_id)errors.push('ROUTE_SHARED_ORIGIN_MISMATCH');
  }
  if(control&&protectedRoute&&control.route_id===protectedRoute.route_id)errors.push('SHARED_ORIGIN_MUST_NOT_COLLAPSE_ROUTE_IDENTITY');
  if(control&&protectedRoute&&control.return_id===protectedRoute.return_id)errors.push('MATCHED_RETURNS_MUST_RETAIN_DISTINCT_ROUTE_CUSTODY');
  return {control,protectedRoute};
}

function flattenArtifacts(episode,errors){
  const artifacts=Array.isArray(episode?.artifacts)?episode.artifacts:[];
  const seen=new Set();
  const packets=[];
  for(const a of artifacts){
    if(!a||!nonempty(a.source_id)){errors.push('INVALID_ARTIFACT_SOURCE');continue;}
    if(seen.has(a.source_id))errors.push('DUPLICATE_SOURCE_ID');
    seen.add(a.source_id);
    if(a.episode_id!==episode.episode_id)errors.push('CROSS_EPISODE_ARTIFACT_TRANSPLANT');
    if(a.custody_id!==episode.departure?.custody_id)errors.push('ARTIFACT_CUSTODY_MISMATCH');
    const surfaces=Array.isArray(a.measurements)?a.measurements:[];
    for(const s of surfaces)if(s?.measured===true&&s.episode_id!==episode.episode_id)errors.push('CROSS_EPISODE_MEASUREMENT_TRANSPLANT');
    packets.push({source_id:a.source_id,episode_id:a.episode_id,evidence_class:a.evidence_class,surfaces});
  }
  return packets;
}

function empiricalSurface(episode,name){
  for(const a of episode.artifacts||[]){
    if(!empirical(a))continue;
    for(const s of a.measurements||[])if(exactSurface(s,name,episode.episode_id))return s;
  }
  return null;
}

function empiricalExactSurfacePresence(episode,name){
  return (episode.artifacts||[]).some(a=>EMPIRICAL_CLASSES.has(a?.evidence_class)&&(a.measurements||[]).some(s=>exactSurface(s,name,episode.episode_id)));
}

function geometryWitnessPass(episode){
  const s=empiricalSurface(episode,'geometry');
  return !!s&&s.value===1&&s.empirical_binding===true&&nonempty(s.geometry_ref);
}

function matchedReturnWitnessPass(episode,control,protectedRoute){
  const s=empiricalSurface(episode,'matched_return');
  return !!s&&s.value===1&&s.return_pair_observed===true&&s.control_route_id===control?.route_id&&s.protected_route_id===protectedRoute?.route_id&&s.comparison_frame_id===episode.departure?.comparison_frame_id;
}

function childMessage(status,errors){
  if(errors.includes('CROSS_EPISODE_ARTIFACT_TRANSPLANT')||errors.includes('CROSS_EPISODE_MEASUREMENT_TRANSPLANT'))return 'THAT THREAD CAME FROM ANOTHER JOURNEY.';
  if(status==='INADMISSIBLE')return 'THE THREADS DO NOT SHARE ONE JOURNEY.';
  if(status==='HELD')return 'THIS CLOTH IS STILL MISSING A THREAD.';
  if(status==='FAILED')return 'THE THREADS RETURNED, BUT THE MEASURE DID NOT HOLD.';
  return 'ALL FIVE THREADS RETURNED TO ONE JOURNEY. THIS IS A CANDIDATE, NOT THE EGG.';
}

export function evaluateLoomGoldenEggAcquisitionEpisode(episode){
  const errors=[];
  if(!episode||!nonempty(episode.episode_id))errors.push('IMMUTABLE_EPISODE_ID_REQUIRED');
  if(episode?.research_only!==true)errors.push('RESEARCH_ONLY_FLAG_REQUIRED');
  const {control,protectedRoute}=normalizeRoutes(episode,errors);
  const packets=flattenArtifacts(episode||{},errors);
  const closure=evaluateGoldenEggEvidenceClosure(packets);
  const state=closure.episodes.find(e=>e.episode_id===episode?.episode_id)||null;
  if(state?.required_conflicts?.length)errors.push('CONTRADICTORY_REQUIRED_MEASUREMENT');
  const hasExactGeometry=empiricalExactSurfacePresence(episode||{},'geometry');
  const hasExactReturn=empiricalExactSurfacePresence(episode||{},'matched_return');
  const geometryOk=geometryWitnessPass(episode||{});
  const matchedReturnOk=matchedReturnWitnessPass(episode||{},control,protectedRoute);
  if(hasExactGeometry&&!geometryOk)errors.push('MALFORMED_EMPIRICAL_GEOMETRY_WITNESS');
  if(hasExactReturn&&!matchedReturnOk)errors.push('MALFORMED_MATCHED_RETURN_WITNESS');
  const required=state?.exact_required_surfaces||[];
  const allFive=GOLDEN_EGG_OPERATIONAL_SURFACES.every(x=>required.includes(x));
  let status='HELD';
  if(errors.length)status='INADMISSIBLE';
  else if(allFive&&state?.thresholds_pass!==true)status='FAILED';
  else if(allFive&&geometryOk&&matchedReturnOk&&state?.operational_return_eligible===true)status='CANDIDATE';
  const missing=GOLDEN_EGG_OPERATIONAL_SURFACES.filter(x=>!required.includes(x));
  return freeze({
    schema:LOOM_GOLDEN_EGG_ACQUISITION_SCHEMA,
    exact_earned_parent:LOOM_GOLDEN_EGG_ACQUISITION_PARENT,
    loom_source_custody:LOOM_RUNTIME_SOURCE_CUSTODY,
    episode_id:episode?.episode_id||null,
    status,
    child_message:childMessage(status,errors),
    errors:[...new Set(errors)],
    route_contract:{
      shared_departure_id:episode?.departure?.departure_id||null,
      shared_custody_id:episode?.departure?.custody_id||null,
      comparison_frame_id:episode?.departure?.comparison_frame_id||null,
      control_route_id:control?.route_id||null,
      protected_route_id:protectedRoute?.route_id||null,
      route_identity_distinct:!!control&&!!protectedRoute&&control.route_id!==protectedRoute.route_id
    },
    exact_required_surfaces:required,
    operational_missing:missing,
    thresholds_pass:state?.thresholds_pass===true,
    geometry_witness_pass:geometryOk,
    matched_return_witness_pass:matchedReturnOk,
    parent_operational_return_eligible:state?.operational_return_eligible===true,
    laws:{
      loom_observation_not_golden_egg_adjudication:true,
      holonomy_not_truth_proof:true,
      route_deformation_not_causal_proof:true,
      shared_origin_not_route_identity:true,
      synthetic_geometry_not_empirical_return_witness:true,
      recovery_tail_not_matched_counterfactual_return:true,
      observed_validation_circuit_not_golden_egg_metric_episode:true,
      five_surfaces_present_not_golden_egg_earned:true,
      loom_rename_intent_not_current_repository_name:true,
      science_ancestry_not_source_custody:true
    },
    golden_egg_earned:false,
    merge_authority:false,
    production_authority:false,
    live_loom_mutated:false
  });
}

const m=(name,e,value,extra={})=>({name,episode_id:e,value,measured:true,...extra});
export function canonicalLoomGoldenEggEpisode({observer=0.1,reconstruction=0.1,joining=0.05,includeGeometry=true,includeReturn=true}={}){
  const e='loom-ge-acq-e1',custody='custody-e1',frame='frame-e1';
  const measurementsA=[m('observer',e,observer),m('reconstruction',e,reconstruction)];
  const measurementsB=[m('joining',e,joining)];
  if(includeGeometry)measurementsB.push(m('geometry',e,1,{empirical_binding:true,geometry_ref:'g-observed-e1'}));
  if(includeReturn)measurementsB.push(m('matched_return',e,1,{return_pair_observed:true,control_route_id:'route-0',protected_route_id:'route-I',comparison_frame_id:frame}));
  return {
    episode_id:e,research_only:true,
    departure:{departure_id:'departure-e1',custody_id:custody,comparison_frame_id:frame},
    routes:[
      {role:'control',route_id:'route-0',departure_id:'departure-e1',custody_id:custody,comparison_frame_id:frame,return_id:'return-0',return_observed:true},
      {role:'protected',route_id:'route-I',departure_id:'departure-e1',custody_id:custody,comparison_frame_id:frame,return_id:'return-I',return_observed:true}
    ],
    geometry_design_ref:{receipt:GOLDEN_EGG_GEOMETRY_DESIGN_RECEIPT,evidence_class:'SYNTHETIC_RESEARCH_GEOMETRY',acquisition_credit:0},
    artifacts:[
      {source_id:'artifact-A',episode_id:e,custody_id:custody,evidence_class:'PUBLIC_EMPIRICAL_CASE',measurements:measurementsA},
      {source_id:'artifact-B',episode_id:e,custody_id:custody,evidence_class:'PUBLIC_EMPIRICAL_CASE',measurements:measurementsB}
    ]
  };
}

export function runLoomGoldenEggAcquisitionContract(){
  const candidate=evaluateLoomGoldenEggAcquisitionEpisode(canonicalLoomGoldenEggEpisode());
  const held=evaluateLoomGoldenEggAcquisitionEpisode(canonicalLoomGoldenEggEpisode({includeReturn:false}));
  const failed=evaluateLoomGoldenEggAcquisitionEpisode(canonicalLoomGoldenEggEpisode({observer:0.9}));
  const parentPass=P.passed===true&&P.golden_egg_earned===false;
  const statusPass=candidate.status==='CANDIDATE'&&held.status==='HELD'&&failed.status==='FAILED';
  const custodyPass=LOOM_RUNTIME_SOURCE_CUSTODY.commit==='d652c5e151471be7e40ff6a08936ba26c0cef1ad'&&LOOM_RUNTIME_SOURCE_CUSTODY.blob==='695d22ec77339bc54512fe6a6a7c0203240ff135'&&LOOM_RUNTIME_SOURCE_CUSTODY.claim_ceiling==='route-deformation-record-not-truth-proof';
  const separationPass=candidate.golden_egg_earned===false&&candidate.live_loom_mutated===false&&candidate.parent_operational_return_eligible===true;
  const passed=parentPass&&statusPass&&custodyPass&&separationPass;
  return freeze({
    schema:LOOM_GOLDEN_EGG_ACQUISITION_SCHEMA,
    exact_earned_parent:LOOM_GOLDEN_EGG_ACQUISITION_PARENT,
    loom_source_custody:LOOM_RUNTIME_SOURCE_CUSTODY,
    statuses:{candidate:candidate.status,held:held.status,failed:failed.status},
    candidate,
    laws:candidate.laws,
    candidate_theorem:passed?'A_LOOM_COMPATIBLE_GOLDEN_EGG_ACQUISITION_EPISODE_CAN_BIND_NON_EQUIVALENT_CONTROL_AND_PROTECTED_ROUTES_TO_ONE_IMMUTABLE_SHARED_DEPARTURE_CUSTODY_AND_COMPARISON_FRAME_AND_ADMIT_SPLIT_EMPIRICAL_L_R_J_G_C_ARTIFACTS_ONLY_WITHIN_THAT_EPISODE_WHILE_DISTINGUISHING_HELD_FAILED_INADMISSIBLE_AND_CANDIDATE_WITHOUT_EARNING_THE_GOLDEN_EGG_OR_MUTATING_THE_LIVE_LOOM':'NOT_EARNED',
    golden_egg_earned:false,
    live_loom_mutated:false,
    merge_authority:false,
    production_authority:false,
    passed
  });
}

export const LOOM_GOLDEN_EGG_ACQUISITION_CERTIFICATE=runLoomGoldenEggAcquisitionContract();
