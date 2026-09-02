import {
  LOOM_RUNTIME_SOURCE_CUSTODY,
  LOOM_GOLDEN_EGG_ACQUISITION_SCHEMA,
  canonicalLoomGoldenEggEpisode,
  evaluateLoomGoldenEggAcquisitionEpisode
} from './loom-golden-egg-same-episode-acquisition.js';
import { GOLDEN_EGG_OPERATIONAL_SURFACES } from './golden-egg-evidence-closure-nogo.js';

export const LOOM_ROUTE_CONTEXT_NONCREDIT_SCHEMA='td613.dome-world.loom-route-context-noncredit-adapter/v0.1';
export const LOOM_ROUTE_CONTEXT_SCIENCE_PARENT='22c49c9b4f4e322924aa660984674d47fc9a0fb9';
export const LOOM_ROUTE_CONTEXT_INSTALLATION_PARENT='5acce3d1729eb3087bc997e87288fbd91b2a2a5c';
export const LOOM_ROUTE_CONTEXT_SOURCE_CUSTODY=LOOM_RUNTIME_SOURCE_CUSTODY;
export const LOOM_ROUTE_CONTEXT_ALLOWED_TYPES=Object.freeze([
  ...LOOM_RUNTIME_SOURCE_CUSTODY.receives,
  ...LOOM_RUNTIME_SOURCE_CUSTODY.preserves,
  ...LOOM_RUNTIME_SOURCE_CUSTODY.emits
]);
export const LOOM_ROUTE_CONTEXT_FORBIDDEN_CLAIMS=Object.freeze([
  'authorship-proof-claim',
  'identity-proof-claim',
  'truth-proof-claim',
  'causal-proof-claim',
  'empirical-surface-claim',
  'golden-egg-completion-claim'
]);

const ALLOWED_TYPES=new Set(LOOM_ROUTE_CONTEXT_ALLOWED_TYPES);
const FORBIDDEN_CLAIMS=new Set(LOOM_ROUTE_CONTEXT_FORBIDDEN_CLAIMS);
const EMPIRICAL_CLASSES=new Set(['VALIDATION_GATED_DEPLOYED_BOUNDARY_OBSERVED','PUBLIC_EMPIRICAL_CASE']);
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const nonempty=v=>typeof v==='string'&&v.length>0;
const unique=a=>[...new Set(a)];

function routeIds(episode){return new Set((episode?.routes||[]).map(r=>r?.route_id).filter(nonempty));}
function operationalDeclaration(record){
  const names=[];
  for(const key of ['measurements','surfaces']){
    for(const item of Array.isArray(record?.[key])?record[key]:[]){
      if(item&&GOLDEN_EGG_OPERATIONAL_SURFACES.includes(item.name))names.push(item.name);
    }
  }
  return unique(names);
}

function validateRecord(record,episode,seen,errors){
  if(!record||typeof record!=='object'){errors.push('INVALID_LOOM_CONTEXT_RECORD');return;}
  if(!nonempty(record.record_id)){errors.push('LOOM_RECORD_ID_REQUIRED');return;}
  if(seen.has(record.record_id))errors.push('DUPLICATE_LOOM_RECORD_ID');
  seen.add(record.record_id);
  if(record.research_only!==true)errors.push('LOOM_CONTEXT_RESEARCH_ONLY_REQUIRED');
  if(record.station!=='loom')errors.push('LOOM_STATION_REQUIRED');
  if(!ALLOWED_TYPES.has(record.record_type))errors.push('UNRECOGNIZED_LOOM_RECORD_TYPE');
  if(record.claim_ceiling!==LOOM_RUNTIME_SOURCE_CUSTODY.claim_ceiling)errors.push('LOOM_CLAIM_CEILING_MISMATCH');
  if(record.source_custody?.commit!==LOOM_RUNTIME_SOURCE_CUSTODY.commit||record.source_custody?.blob!==LOOM_RUNTIME_SOURCE_CUSTODY.blob)errors.push('LOOM_SOURCE_CUSTODY_MISMATCH');
  if(record.episode_id!==episode?.episode_id)errors.push('LOOM_CONTEXT_EPISODE_MISMATCH');
  if(record.custody_id!==episode?.departure?.custody_id)errors.push('LOOM_CONTEXT_CUSTODY_MISMATCH');
  if(record.departure_id!==episode?.departure?.departure_id)errors.push('LOOM_CONTEXT_DEPARTURE_MISMATCH');
  if(!routeIds(episode).has(record.route_id))errors.push('LOOM_CONTEXT_ROUTE_NOT_IN_EPISODE');
  if(record.empirical_credit!==0)errors.push('LOOM_CONTEXT_EMPIRICAL_CREDIT_MUST_BE_ZERO');
  if(EMPIRICAL_CLASSES.has(record.evidence_class))errors.push('LOOM_CONTEXT_CANNOT_USE_EMPIRICAL_EVIDENCE_CLASS');
  if(Array.isArray(record.measurements)&&record.measurements.length>0)errors.push('LOOM_CONTEXT_CANNOT_DECLARE_MEASUREMENTS');
  const declared=operationalDeclaration(record);
  if(declared.length>0)errors.push('LOOM_CONTEXT_CANNOT_DECLARE_OPERATIONAL_SURFACES');
  if(FORBIDDEN_CLAIMS.has(record.claim))errors.push('LOOM_CONTEXT_FORBIDDEN_AUTHORITY_CLAIM');
}

export function bindLoomRouteContext(episode,loom_records=[]){
  if(!Array.isArray(loom_records))throw new TypeError('Loom route context requires an array of records');
  const parent=evaluateLoomGoldenEggAcquisitionEpisode(episode);
  const before=Object.freeze([...parent.exact_required_surfaces]);
  const errors=[];
  const seen=new Set();
  for(const record of loom_records)validateRecord(record,episode,seen,errors);
  const afterParent=evaluateLoomGoldenEggAcquisitionEpisode(episode);
  const after=Object.freeze([...afterParent.exact_required_surfaces]);
  const status=errors.length?'INADMISSIBLE':'BOUND_CONTEXT';
  return freeze({
    schema:LOOM_ROUTE_CONTEXT_NONCREDIT_SCHEMA,
    acquisition_schema:LOOM_GOLDEN_EGG_ACQUISITION_SCHEMA,
    science_parent:LOOM_ROUTE_CONTEXT_SCIENCE_PARENT,
    installation_parent:LOOM_ROUTE_CONTEXT_INSTALLATION_PARENT,
    loom_source_custody:LOOM_ROUTE_CONTEXT_SOURCE_CUSTODY,
    episode_id:episode?.episode_id||null,
    context_status:status,
    errors:unique(errors),
    record_ids:loom_records.map(r=>r?.record_id||null),
    record_types:loom_records.map(r=>r?.record_type||null),
    acquisition_credit:0,
    empirical_surfaces_added:Object.freeze([]),
    parent_status_before:parent.status,
    parent_status_after:afterParent.status,
    exact_required_surfaces_before:before,
    exact_required_surfaces_after:after,
    parent_status_preserved:parent.status===afterParent.status,
    exact_required_surfaces_preserved:JSON.stringify(before)===JSON.stringify(after),
    golden_egg_earned:false,
    live_loom_mutated:false,
    merge_authority:false,
    production_authority:false,
    laws:{
      loom_context_not_empirical_measurement:true,
      motif_return_not_matched_return:true,
      cloth_map_not_geometry_measurement:true,
      holonomy_not_truth_proof:true,
      route_deformation_not_causal_proof:true,
      anti_equivalence_edge_not_physical_separation:true,
      source_custody_not_science_parent:true,
      installation_parent_not_science_parent:true,
      context_binding_not_acquisition_credit:true
    },
    child_message:errors.length
      ? 'THE LOOM RECORD DOES NOT HAVE AUTHORITY TO BECOME A MEASUREMENT.'
      : 'THE LOOM REMEMBERS THE JOURNEY, BUT MEMORY DOES NOT BECOME A MEASUREMENT.'
  });
}

export function canonicalLoomRouteContextRecord(episode,{record_type='route-deformation',role='protected',record_id='loom-context-r1'}={}){
  const route=(episode?.routes||[]).find(r=>r?.role===role)||(episode?.routes||[])[0]||{};
  return {
    record_id,
    research_only:true,
    station:'loom',
    record_type,
    episode_id:episode?.episode_id,
    custody_id:episode?.departure?.custody_id,
    departure_id:episode?.departure?.departure_id,
    route_id:route.route_id,
    source_custody:{commit:LOOM_RUNTIME_SOURCE_CUSTODY.commit,blob:LOOM_RUNTIME_SOURCE_CUSTODY.blob},
    claim_ceiling:LOOM_RUNTIME_SOURCE_CUSTODY.claim_ceiling,
    evidence_class:'LOOM_ROUTE_CONTEXT',
    empirical_credit:0,
    payload:{motif:'return-with-difference',route_deformation:'context-only'}
  };
}

export function runLoomRouteContextNoncreditAdapter(){
  const heldEpisode=canonicalLoomGoldenEggEpisode({includeReturn:false});
  const candidateEpisode=canonicalLoomGoldenEggEpisode();
  const held=bindLoomRouteContext(heldEpisode,[canonicalLoomRouteContextRecord(heldEpisode,{record_type:'motif-return'})]);
  const candidate=bindLoomRouteContext(candidateEpisode,[canonicalLoomRouteContextRecord(candidateEpisode,{record_type:'route-deformation'})]);
  const heldPass=held.context_status==='BOUND_CONTEXT'&&held.parent_status_before==='HELD'&&held.parent_status_after==='HELD'&&held.exact_required_surfaces_preserved&&held.acquisition_credit===0;
  const candidatePass=candidate.context_status==='BOUND_CONTEXT'&&candidate.parent_status_before==='CANDIDATE'&&candidate.parent_status_after==='CANDIDATE'&&candidate.exact_required_surfaces_preserved&&candidate.golden_egg_earned===false;
  const custodyPass=LOOM_RUNTIME_SOURCE_CUSTODY.commit==='d652c5e151471be7e40ff6a08936ba26c0cef1ad'&&LOOM_RUNTIME_SOURCE_CUSTODY.blob==='695d22ec77339bc54512fe6a6a7c0203240ff135';
  const parentPass=LOOM_ROUTE_CONTEXT_SCIENCE_PARENT==='22c49c9b4f4e322924aa660984674d47fc9a0fb9'&&LOOM_ROUTE_CONTEXT_INSTALLATION_PARENT==='5acce3d1729eb3087bc997e87288fbd91b2a2a5c';
  const passed=heldPass&&candidatePass&&custodyPass&&parentPass;
  return freeze({
    schema:LOOM_ROUTE_CONTEXT_NONCREDIT_SCHEMA,
    science_parent:LOOM_ROUTE_CONTEXT_SCIENCE_PARENT,
    installation_parent:LOOM_ROUTE_CONTEXT_INSTALLATION_PARENT,
    loom_source_custody:LOOM_ROUTE_CONTEXT_SOURCE_CUSTODY,
    held,
    candidate,
    candidate_theorem:passed?'LOOM_ROUTE_CONTEXT_CAN_BIND_TO_A_SHARED_ACQUISITION_EPISODE_WITH_ZERO_EMPIRICAL_CREDIT_AND_WITHOUT_CHANGING_PARENT_ACQUISITION_STATUS_OR_EXACT_OPERATIONAL_SURFACES':'NOT_EARNED',
    golden_egg_earned:false,
    live_loom_mutated:false,
    merge_authority:false,
    production_authority:false,
    passed
  });
}

export const LOOM_ROUTE_CONTEXT_NONCREDIT_CERTIFICATE=runLoomRouteContextNoncreditAdapter();
