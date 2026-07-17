import assert from 'node:assert/strict';
import fs from 'node:fs';
import {ENVIRONMENT_GROUPS,compileEnvironmentProfile,compileSensorBundle,compileSensorObservation} from '../app/engine/ash-stretch12-r02-environment.js';
import {compileRouteIntervention,compileRouteWeather,compileWeatherSeries,verifyRouteWeather} from '../app/engine/ash-stretch12-r02-flowcore.js';

const now=()=>new Date('2026-07-17T12:00:00.000Z');
async function profile(routeClass,overrides={}){
  const observations=[];
  for(const group of ENVIRONMENT_GROUPS){
    const fields=group==='B'?{cloud_sync:overrides.cloud_sync??false}:group==='D'?{device_management:overrides.device_management??false}:group==='A'?{workspace_administrator:overrides.workspace_administrator??false}:group==='P'?{backup_retention:overrides.backup_retention??false,version_history:false,indexing:false,preview_cache:false,recipient_copies:false,deletion_verification:false}:group==='T'?{transport_method:overrides.transport_method||'local_inter_process',plaintext_active:overrides.plaintext_active??false}:{[`observed_${group}`]:true};
    for(const [field,value] of Object.entries(fields)) observations.push(await compileSensorObservation({case_id:'case_weather',environment_id:`env_${routeClass}`,sensor_id:`${group}_${field}`,group,field,value,source_status:'OBSERVED',observed_at:now().toISOString(),fresh_until:'2026-07-18T00:00:00.000Z'},{now}));
  }
  const bundle=await compileSensorBundle({case_id:'case_weather',environment_id:`env_${routeClass}`,observations,compiled_at:now().toISOString()},{now});
  return compileEnvironmentProfile({case_id:'case_weather',environment_id:`env_${routeClass}`,route_class:routeClass,sensor_bundle:bundle,created_at:now().toISOString()},{now});
}

const local=await profile('LOCAL_DRIVE');
const weather=await compileRouteWeather({environment_profile:local,assay_summary:{reader_count:1,origin_verified:true,custody_verified:true,purpose_reference:'purpose:1',projection_digest:'sha256:projection',reader_ensemble_reference:'readers:1',claim_ceiling:'BOUNDED',metadata_recovery_upper:0.1,metadata_threshold:0.2},created_at:now().toISOString()},{now});
assert.equal(await verifyRouteWeather(weather),true);
assert.equal(weather.universal_score,null);
assert.equal(weather.automatic_release,false);
assert.equal(weather.automatic_ash_action,false);
assert.equal(weather.prediction_authorized,false);
assert.equal(weather.intervention,'BOUNDED_PACKET_REVIEW');

const offline=await profile('OFFLINE_LOCAL_MODEL');
const mismatch=await compileRouteWeather({environment_profile:offline,assay_summary:{provider_action:true,origin_verified:true,custody_verified:true,purpose_reference:'p',projection_digest:'d',reader_ensemble_reference:'r',claim_ceiling:'c'},created_at:now().toISOString()},{now});
assert.equal(mismatch.components.torsion.state,'MISMATCH');
assert.equal(mismatch.hard_hold,true);
assert.equal(mismatch.intervention,'REST_AND_REOBSERVE');

const synced=await profile('LOCAL_DRIVE',{cloud_sync:true,backup_retention:true});
const humid=await compileRouteWeather({environment_profile:synced,assay_summary:{origin_verified:true,custody_verified:true,purpose_reference:'p',projection_digest:'d',reader_ensemble_reference:'r',claim_ceiling:'c'},created_at:now().toISOString()},{now});
assert.equal(humid.intervention,'DISABLE_SYNC_AND_RETEST');
const intervention=await compileRouteIntervention(mismatch,{}, {now});
assert.equal(intervention.requires_human_gesture,true);
assert.equal(intervention.automatic_release,false);
const series=await compileWeatherSeries({case_id:'case_weather',receipts:[weather,mismatch],created_at:now().toISOString()},{now});
assert.equal(series.transition_count,1);
await assert.rejects(()=>compileRouteWeather({environment_profile:local,artifact_bytes:'forbidden'}),/artifact-blind/);
const source=fs.readFileSync('app/dome-world/ash-stretch12-r02-flowcore-weather.js','utf8');
assert.match(source,/No scalar average may conceal a dangerous component/);
assert.doesNotMatch(source,/fetch\(|indexedDB|localStorage/);
console.log('ash-stretch12-r02-b.test.mjs passed');
