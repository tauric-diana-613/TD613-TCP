import { GOLDEN_EGG_OPERATIONAL_SURFACES } from './golden-egg-evidence-closure-nogo.js';
import { canonicalLoomGoldenEggEpisode } from './loom-golden-egg-same-episode-acquisition.js';
import {
  canonicalPreregisteredLoomRoutePair,
  evaluateFrozenLoomRoutePair
} from './loom-route-pair-preregistration.js';

export const MEASUREMENT_CUSTODY_LEDGER_SCHEMA='td613.dome-world.same-episode-measurement-custody-ledger/v0.1';
export const MEASUREMENT_CUSTODY_LEDGER_PARENT='a425d0f27ce36de84b45917b6a84261ac1e7251c';
const EMPIRICAL_CLASSES=new Set(['VALIDATION_GATED_DEPLOYED_BOUNDARY_OBSERVED','PUBLIC_EMPIRICAL_CASE']);
const ISO_Z=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const freeze=v=>{if(v&&typeof v==='object'&&!Object.isFrozen(v)){Object.values(v).forEach(freeze);Object.freeze(v);}return v;};
const nonempty=v=>typeof v==='string'&&v.length>0;
const validTime=v=>typeof v==='string'&&ISO_Z.test(v)&&Number.isFinite(Date.parse(v));
const unique=a=>[...new Set(a)];

function canonicalize(value){
  if(Array.isArray(value))return value.map(canonicalize);
  if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().filter(k=>value[k]!==undefined).map(k=>[k,canonicalize(value[k])]));
  return value;
}

function canonicalJson(value){return JSON.stringify(canonicalize(value));}
async function sha256(value){
  const bytes=new TextEncoder().encode(typeof value==='string'?value:canonicalJson(value));
  const digest=await globalThis.crypto.subtle.digest('SHA-256',bytes);
  return `sha256:${[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('')}`;
}

function preregistrationProjection(prereg){
  return {
    schema:prereg?.schema||null,
    exact_parent:prereg?.exact_parent||null,
    status:prereg?.status||null,
    frozen_at:prereg?.frozen_at||null,
    route_tuple:prereg?.route_tuple||null,
    context_record_ids:prereg?.context_record_ids||[],
    empirical_credit:prereg?.empirical_credit??null
  };
}

function measurementEnvelope(artifact,measurement){
  return canonicalize({
    measurement_id:measurement?.measurement_id||null,
    source_id:artifact?.source_id||null,
    artifact_episode_id:artifact?.episode_id||null,
    artifact_custody_id:artifact?.custody_id||null,
    evidence_class:artifact?.evidence_class||null,
    measurement
  });
}

function exactEmpiricalPairs(episode){
  const out=[];
  for(const artifact of episode?.artifacts||[]){
    if(!EMPIRICAL_CLASSES.has(artifact?.evidence_class))continue;
    for(const measurement of artifact.measurements||[]){
      if(measurement?.measured===true&&GOLDEN_EGG_OPERATIONAL_SURFACES.includes(measurement.name)&&measurement.episode_id===episode.episode_id)out.push({artifact,measurement});
    }
  }
  return out;
}

async function compileEntries(prereg,episode,sealed_at,errors){
  const seenSource=new Set();
  const seenMeasurement=new Set();
  for(const artifact of episode?.artifacts||[]){
    if(!EMPIRICAL_CLASSES.has(artifact?.evidence_class))continue;
    if(!nonempty(artifact.source_id))errors.push('SOURCE_ID_REQUIRED');
    else if(seenSource.has(artifact.source_id))errors.push('DUPLICATE_SOURCE_ID');
    else seenSource.add(artifact.source_id);
  }
  const entries=[];
  for(const {artifact,measurement} of exactEmpiricalPairs(episode)){
    if(!nonempty(measurement.measurement_id))errors.push(`MEASUREMENT_ID_REQUIRED_${measurement.name.toUpperCase()}`);
    else if(seenMeasurement.has(measurement.measurement_id))errors.push('DUPLICATE_MEASUREMENT_ID');
    else seenMeasurement.add(measurement.measurement_id);
    if(!validTime(measurement.measured_at))errors.push(`MEASURED_AT_REQUIRED_${measurement.name.toUpperCase()}`);
    if(!validTime(measurement.recorded_at))errors.push(`RECORDED_AT_REQUIRED_${measurement.name.toUpperCase()}`);
    if(validTime(measurement.measured_at)&&validTime(measurement.recorded_at)&&Date.parse(measurement.recorded_at)<Date.parse(measurement.measured_at))errors.push(`RECORDED_BEFORE_MEASURED_${measurement.name.toUpperCase()}`);
    if(validTime(prereg?.frozen_at)&&validTime(measurement.measured_at)&&Date.parse(measurement.measured_at)<=Date.parse(prereg.frozen_at))errors.push(`MEASUREMENT_NOT_AFTER_FREEZE_${measurement.name.toUpperCase()}`);
    if(validTime(sealed_at)&&validTime(measurement.recorded_at)&&Date.parse(measurement.recorded_at)>=Date.parse(sealed_at))errors.push(`MEASUREMENT_NOT_RECORDED_BEFORE_SEAL_${measurement.name.toUpperCase()}`);
    const envelope=measurementEnvelope(artifact,measurement);
    const digest=await sha256(envelope);
    entries.push(freeze({
      measurement_id:measurement.measurement_id||null,
      source_id:artifact.source_id||null,
      name:measurement.name,
      measured_at:measurement.measured_at||null,
      recorded_at:measurement.recorded_at||null,
      digest,
      envelope
    }));
  }
  entries.sort((a,b)=>String(a.recorded_at).localeCompare(String(b.recorded_at))||String(a.measurement_id).localeCompare(String(b.measurement_id)));
  return entries;
}

function exactPrefix(previous,current){
  if(previous.length>current.length)return false;
  for(let i=0;i<previous.length;i++)if(canonicalJson(previous[i])!==canonicalJson(current[i]))return false;
  return true;
}

export async function sealMeasurementCustodyLedger(prereg,episode,sealed_at,{previous_ledger=null}={}){
  const errors=[];
  if(prereg?.status!=='FROZEN')errors.push('FROZEN_ROUTE_PAIR_PREREGISTRATION_REQUIRED');
  if(!validTime(sealed_at))errors.push('VALID_LEDGER_SEAL_TIME_REQUIRED');
  const temporal=evaluateFrozenLoomRoutePair(prereg,episode);
  if(temporal.status==='INADMISSIBLE')errors.push(...temporal.errors.map(e=>`TEMPORAL_${e}`));
  const preregistration_digest=await sha256(preregistrationProjection(prereg));
  const entries=await compileEntries(prereg,episode,sealed_at,errors);
  if(previous_ledger){
    if(previous_ledger.status!=='SEALED')errors.push('PREVIOUS_LEDGER_MUST_BE_SEALED');
    if(previous_ledger.preregistration_digest!==preregistration_digest)errors.push('PREREGISTRATION_DIGEST_DRIFT');
    if(!exactPrefix(previous_ledger.entries||[],entries))errors.push('APPEND_ONLY_PREFIX_VIOLATION');
    if(validTime(previous_ledger.sealed_at)&&validTime(sealed_at)&&Date.parse(sealed_at)<=Date.parse(previous_ledger.sealed_at))errors.push('LEDGER_SEAL_TIME_MUST_ADVANCE');
    for(const entry of entries.slice((previous_ledger.entries||[]).length)){
      if(validTime(previous_ledger.sealed_at)&&validTime(entry.recorded_at)&&Date.parse(entry.recorded_at)<=Date.parse(previous_ledger.sealed_at))errors.push('RETROACTIVE_INSERTION_AFTER_PRIOR_SEAL');
    }
  }
  const predecessor_root=previous_ledger?.ledger_root||null;
  const root_payload={schema:MEASUREMENT_CUSTODY_LEDGER_SCHEMA,exact_parent:MEASUREMENT_CUSTODY_LEDGER_PARENT,preregistration_digest,predecessor_root,sealed_at,entries};
  const ledger_root=await sha256(root_payload);
  return freeze({
    schema:MEASUREMENT_CUSTODY_LEDGER_SCHEMA,
    exact_parent:MEASUREMENT_CUSTODY_LEDGER_PARENT,
    status:errors.length?'INADMISSIBLE':'SEALED',
    errors:unique(errors),
    preregistration_digest,
    predecessor_root,
    sealed_at:validTime(sealed_at)?sealed_at:null,
    entry_count:entries.length,
    entries,
    ledger_root,
    temporal_status:temporal.status,
    empirical_credit_from_ledger:0,
    golden_egg_earned:false,
    live_loom_mutated:false,
    merge_authority:false,
    production_authority:false,
    laws:{
      measurement_value_not_measurement_identity:true,
      equal_value_source_substitution_not_same_measurement:true,
      sealed_ledger_not_mutable_packet:true,
      append_only_extension_not_replacement:true,
      digest_integrity_not_empirical_validity:true,
      ledger_seal_not_golden_egg_earned:true
    }
  });
}

export async function verifyMeasurementCustodyLedger(prereg,ledger,episode){
  const errors=[];
  if(ledger?.status!=='SEALED')errors.push('SEALED_LEDGER_REQUIRED');
  const expectedPrereg=await sha256(preregistrationProjection(prereg));
  if(ledger?.preregistration_digest!==expectedPrereg)errors.push('PREREGISTRATION_DIGEST_MISMATCH');
  const compiledErrors=[];
  const entries=await compileEntries(prereg,episode,ledger?.sealed_at,compiledErrors);
  errors.push(...compiledErrors);
  if(!Array.isArray(ledger?.entries)||canonicalJson(ledger.entries)!==canonicalJson(entries))errors.push('SEALED_MEASUREMENT_SET_MISMATCH');
  const root_payload={schema:MEASUREMENT_CUSTODY_LEDGER_SCHEMA,exact_parent:MEASUREMENT_CUSTODY_LEDGER_PARENT,preregistration_digest:expectedPrereg,predecessor_root:ledger?.predecessor_root||null,sealed_at:ledger?.sealed_at||null,entries};
  const expectedRoot=await sha256(root_payload);
  if(ledger?.ledger_root!==expectedRoot)errors.push('LEDGER_ROOT_MISMATCH');
  return freeze({
    schema:MEASUREMENT_CUSTODY_LEDGER_SCHEMA,
    exact_parent:MEASUREMENT_CUSTODY_LEDGER_PARENT,
    status:errors.length?'INADMISSIBLE':'VERIFIED',
    errors:unique(errors),
    expected_preregistration_digest:expectedPrereg,
    expected_ledger_root:expectedRoot,
    entry_count:entries.length,
    empirical_credit_from_verification:0
  });
}

export async function adjudicateSealedMeasurementCustody(prereg,ledger,episode){
  const verification=await verifyMeasurementCustodyLedger(prereg,ledger,episode);
  const parent=evaluateFrozenLoomRoutePair(prereg,episode);
  const status=verification.status==='VERIFIED'?parent.status:'INADMISSIBLE';
  return freeze({
    schema:MEASUREMENT_CUSTODY_LEDGER_SCHEMA,
    exact_parent:MEASUREMENT_CUSTODY_LEDGER_PARENT,
    status,
    verification_status:verification.status,
    verification_errors:verification.errors,
    parent_acquisition_status:parent.status,
    ledger_root:ledger?.ledger_root||null,
    entry_count:verification.entry_count,
    empirical_credit_from_ledger:0,
    golden_egg_earned:false,
    live_loom_mutated:false,
    merge_authority:false,
    production_authority:false
  });
}

const SCHEDULE=Object.freeze({
  observer:['m-observer','2026-09-02T00:01:00Z','2026-09-02T00:01:01Z'],
  reconstruction:['m-reconstruction','2026-09-02T00:01:02Z','2026-09-02T00:01:03Z'],
  joining:['m-joining','2026-09-02T00:02:00Z','2026-09-02T00:02:01Z'],
  geometry:['m-geometry','2026-09-02T00:02:02Z','2026-09-02T00:02:03Z'],
  matched_return:['m-matched-return','2026-09-02T00:02:04Z','2026-09-02T00:02:05Z']
});

export function canonicalCustodyEpisode({surfaces=GOLDEN_EGG_OPERATIONAL_SURFACES}={}){
  const keep=new Set(surfaces);
  const episode=structuredClone(canonicalLoomGoldenEggEpisode());
  for(const artifact of episode.artifacts){
    artifact.measurements=artifact.measurements.filter(m=>keep.has(m.name));
    for(const m of artifact.measurements){
      const [measurement_id,measured_at,recorded_at]=SCHEDULE[m.name];
      m.measurement_id=measurement_id;
      m.measured_at=measured_at;
      m.recorded_at=recorded_at;
    }
  }
  episode.artifacts=episode.artifacts.filter(a=>a.measurements.length>0);
  return episode;
}

export async function runMeasurementCustodyLedger(){
  const prereg=canonicalPreregisteredLoomRoutePair();
  const partial=canonicalCustodyEpisode({surfaces:['observer','reconstruction']});
  const ledger1=await sealMeasurementCustodyLedger(prereg,partial,'2026-09-02T00:01:10Z');
  const complete=canonicalCustodyEpisode();
  const ledger2=await sealMeasurementCustodyLedger(prereg,complete,'2026-09-02T00:02:10Z',{previous_ledger:ledger1});
  const verification=await verifyMeasurementCustodyLedger(prereg,ledger2,complete);
  const adjudication=await adjudicateSealedMeasurementCustody(prereg,ledger2,complete);
  const passed=ledger1.status==='SEALED'&&ledger1.entry_count===2&&ledger2.status==='SEALED'&&ledger2.entry_count===5&&ledger2.predecessor_root===ledger1.ledger_root&&verification.status==='VERIFIED'&&adjudication.status==='CANDIDATE'&&adjudication.golden_egg_earned===false;
  return freeze({
    schema:MEASUREMENT_CUSTODY_LEDGER_SCHEMA,
    exact_parent:MEASUREMENT_CUSTODY_LEDGER_PARENT,
    partial_ledger:ledger1,
    complete_ledger:ledger2,
    verification,
    adjudication,
    candidate_theorem:passed?'A_PREREGISTERED_ROUTE_PAIR_CAN_ACCEPT_APPEND_ONLY_SOURCE_BOUND_DIGESTED_MEASUREMENTS_WHOSE_SEALED_CUSTODY_MUST_VERIFY_EXACTLY_BEFORE_ACQUISITION_ADJUDICATION_AND_POST_SEAL_REPLACEMENT_CONFERS_NO_VALID_STATUS':'NOT_EARNED',
    golden_egg_earned:false,
    live_loom_mutated:false,
    merge_authority:false,
    production_authority:false,
    passed
  });
}

export const MEASUREMENT_CUSTODY_LEDGER_CERTIFICATE=await runMeasurementCustodyLedger();
