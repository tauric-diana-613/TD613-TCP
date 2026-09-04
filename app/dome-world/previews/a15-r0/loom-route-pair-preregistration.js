import { GOLDEN_EGG_OPERATIONAL_SURFACES } from './golden-egg-evidence-closure-nogo.js';
import {
  canonicalLoomGoldenEggEpisode,
  evaluateLoomGoldenEggAcquisitionEpisode
} from './loom-golden-egg-same-episode-acquisition.js';
import {
  bindLoomRouteContext,
  canonicalLoomRouteContextRecord
} from './loom-route-context-noncredit-adapter.js';

export const LOOM_ROUTE_PAIR_PREREG_SCHEMA='td613.dome-world.loom-route-pair-preregistration/v0.1';
export const LOOM_ROUTE_PAIR_PREREG_PARENT='33e65722681eef3b13a64942c082ef73f0ad3f68';
const EMPIRICAL_CLASSES=new Set(['VALIDATION_GATED_DEPLOYED_BOUNDARY_OBSERVED','PUBLIC_EMPIRICAL_CASE']);
const ISO_Z=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const validTime=v=>typeof v==='string'&&ISO_Z.test(v)&&Number.isFinite(Date.parse(v));
const unique=a=>[...new Set(a)];

function routeTuple(episode){
  const control=(episode?.routes||[]).find(r=>r?.role==='control')||{};
  const protectedRoute=(episode?.routes||[]).find(r=>r?.role==='protected')||{};
  return freeze({
    episode_id:episode?.episode_id||null,
    departure_id:episode?.departure?.departure_id||null,
    custody_id:episode?.departure?.custody_id||null,
    comparison_frame_id:episode?.departure?.comparison_frame_id||null,
    control_route_id:control.route_id||null,
    protected_route_id:protectedRoute.route_id||null,
    control_return_id:control.return_id||null,
    protected_return_id:protectedRoute.return_id||null
  });
}

function sameTuple(a,b){return JSON.stringify(a)===JSON.stringify(b);}
function exactEmpiricalMeasurements(episode){
  const out=[];
  for(const artifact of episode?.artifacts||[]){
    if(!EMPIRICAL_CLASSES.has(artifact?.evidence_class))continue;
    for(const m of artifact.measurements||[]){
      if(m?.measured===true&&GOLDEN_EGG_OPERATIONAL_SURFACES.includes(m.name)&&m.episode_id===episode.episode_id)out.push(m);
    }
  }
  return out;
}

export function preregisterLoomRoutePair(episodeShell,loom_records=[],frozen_at){
  const errors=[];
  if(!validTime(frozen_at))errors.push('VALID_PREREGISTRATION_TIME_REQUIRED');
  const parent=evaluateLoomGoldenEggAcquisitionEpisode(episodeShell);
  if(parent.exact_required_surfaces.length!==0)errors.push('PREREGISTRATION_REQUIRES_ZERO_OPERATIONAL_MEASUREMENTS');
  const context=bindLoomRouteContext(episodeShell,loom_records);
  if(context.context_status!=='BOUND_CONTEXT')errors.push('LOOM_CONTEXT_MUST_BE_ADMISSIBLY_BOUND');
  for(const record of loom_records){
    if(!validTime(record?.recorded_at))errors.push('LOOM_CONTEXT_RECORDED_AT_REQUIRED');
    else if(validTime(frozen_at)&&Date.parse(record.recorded_at)>Date.parse(frozen_at))errors.push('LOOM_CONTEXT_MUST_PRECEDE_ROUTE_PAIR_FREEZE');
  }
  const tuple=routeTuple(episodeShell);
  const status=errors.length?'INADMISSIBLE':'FROZEN';
  return freeze({
    schema:LOOM_ROUTE_PAIR_PREREG_SCHEMA,
    exact_parent:LOOM_ROUTE_PAIR_PREREG_PARENT,
    status,
    errors:unique(errors),
    frozen_at:validTime(frozen_at)?frozen_at:null,
    route_tuple:tuple,
    context_record_ids:loom_records.map(r=>r?.record_id||null),
    context_status:context.context_status,
    exact_required_surfaces_at_freeze:parent.exact_required_surfaces,
    empirical_credit:0,
    golden_egg_earned:false,
    live_loom_mutated:false,
    merge_authority:false,
    production_authority:false,
    laws:{
      context_may_inform_design_not_supply_evidence:true,
      preregistration_must_precede_required_measurement:true,
      frozen_route_identity_not_posthoc_reselectable:true,
      preregistration_not_empirical_credit:true,
      selection_freeze_not_golden_egg_earned:true
    }
  });
}

export function evaluateFrozenLoomRoutePair(preregistration,measuredEpisode){
  const errors=[];
  if(preregistration?.status!=='FROZEN')errors.push('VALID_FROZEN_PREREGISTRATION_REQUIRED');
  const currentTuple=routeTuple(measuredEpisode);
  if(preregistration?.route_tuple&&!sameTuple(preregistration.route_tuple,currentTuple))errors.push('FROZEN_ROUTE_PAIR_IDENTITY_DRIFT');
  const measurements=exactEmpiricalMeasurements(measuredEpisode);
  for(const m of measurements){
    if(!validTime(m.measured_at))errors.push(`MEASURED_AT_REQUIRED_${m.name.toUpperCase()}`);
    else if(validTime(preregistration?.frozen_at)&&Date.parse(m.measured_at)<=Date.parse(preregistration.frozen_at))errors.push(`MEASUREMENT_NOT_AFTER_FREEZE_${m.name.toUpperCase()}`);
  }
  const parent=evaluateLoomGoldenEggAcquisitionEpisode(measuredEpisode);
  return freeze({
    schema:LOOM_ROUTE_PAIR_PREREG_SCHEMA,
    exact_parent:LOOM_ROUTE_PAIR_PREREG_PARENT,
    preregistration_status:preregistration?.status||null,
    status:errors.length?'INADMISSIBLE':parent.status,
    errors:unique(errors),
    route_tuple_preserved:preregistration?.route_tuple?sameTuple(preregistration.route_tuple,currentTuple):false,
    exact_required_surfaces:parent.exact_required_surfaces,
    measurement_count:measurements.length,
    all_measurements_after_freeze:errors.every(e=>!e.startsWith('MEASURED_AT_REQUIRED_')&&!e.startsWith('MEASUREMENT_NOT_AFTER_FREEZE_')),
    empirical_credit_from_preregistration:0,
    parent_acquisition_status:parent.status,
    golden_egg_earned:false,
    live_loom_mutated:false,
    merge_authority:false,
    production_authority:false
  });
}

export function canonicalLoomPreMeasurementShell(){
  const episode=canonicalLoomGoldenEggEpisode();
  episode.artifacts=[];
  return episode;
}

export function stampOperationalMeasurements(episode,measured_at){
  const copy=structuredClone(episode);
  for(const artifact of copy.artifacts||[])for(const m of artifact.measurements||[]){
    if(GOLDEN_EGG_OPERATIONAL_SURFACES.includes(m?.name))m.measured_at=measured_at;
  }
  return copy;
}

export function canonicalPreregisteredLoomRoutePair(){
  const shell=canonicalLoomPreMeasurementShell();
  const record=canonicalLoomRouteContextRecord(shell,{record_type:'route-deformation'});
  record.recorded_at='2026-09-02T00:00:00Z';
  return preregisterLoomRoutePair(shell,[record],'2026-09-02T00:00:10Z');
}

export function runLoomRoutePairPreregistration(){
  const prereg=canonicalPreregisteredLoomRoutePair();
  const measured=stampOperationalMeasurements(canonicalLoomGoldenEggEpisode(),'2026-09-02T00:01:00Z');
  const adjudication=evaluateFrozenLoomRoutePair(prereg,measured);
  const passed=prereg.status==='FROZEN'&&prereg.exact_required_surfaces_at_freeze.length===0&&prereg.empirical_credit===0&&adjudication.status==='CANDIDATE'&&adjudication.route_tuple_preserved&&adjudication.all_measurements_after_freeze&&adjudication.empirical_credit_from_preregistration===0&&adjudication.golden_egg_earned===false;
  return freeze({
    schema:LOOM_ROUTE_PAIR_PREREG_SCHEMA,
    exact_parent:LOOM_ROUTE_PAIR_PREREG_PARENT,
    preregistration:prereg,
    adjudication,
    candidate_theorem:passed?'LOOM_CONTEXT_MAY_PREREGISTER_ROUTE_PAIR_IDENTITY_BEFORE_REQUIRED_EMPIRICAL_MEASUREMENT_BUT_POST_MEASUREMENT_RESELECTION_OR_IDENTITY_DRIFT_IS_INADMISSIBLE_AND_PREREGISTRATION_CONFERS_ZERO_EMPIRICAL_CREDIT':'NOT_EARNED',
    golden_egg_earned:false,
    live_loom_mutated:false,
    merge_authority:false,
    production_authority:false,
    passed
  });
}

export const LOOM_ROUTE_PAIR_PREREGISTRATION_CERTIFICATE=runLoomRoutePairPreregistration();
