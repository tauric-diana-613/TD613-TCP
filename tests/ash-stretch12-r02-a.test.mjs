import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  ENVIRONMENT_GROUPS,
  compileSensorObservation,
  compileSensorBundle,
  compileEnvironmentProfile,
  environmentChanged,
  replayEnvironmentProfile,
  verifyEnvironmentProfile
} from '../app/engine/ash-stretch12-r02-environment.js';

const now = () => new Date('2026-07-17T12:00:00.000Z');
const base = { case_id:'case_apeq', environment_id:'env_local', observed_at:'2026-07-17T11:00:00.000Z', fresh_until:'2026-07-18T00:00:00.000Z' };
const observations = [];
for (const [index, group] of ENVIRONMENT_GROUPS.entries()) {
  observations.push(await compileSensorObservation({
    ...base, sensor_id:`sensor_${group}`, group, field:`field_${group}`, value: group === 'R' ? 'LOCAL_DRIVE' : true,
    source_status:'OBSERVED', provenance:{source_class:'OBSERVED',reference:`fixture:${index}`}, claim_ceiling:'TEST_FIXTURE_ONLY'
  }, { now }));
}
const bundle = await compileSensorBundle({ case_id:'case_apeq', environment_id:'env_local', observations, compiled_at:now().toISOString() }, { now });
assert.equal(bundle.artifact_blind, true);
assert.deepEqual(bundle.missing_groups, []);

const profile = await compileEnvironmentProfile({ case_id:'case_apeq', environment_id:'env_local', route_class:'LOCAL_DRIVE', sensor_bundle:bundle, created_at:now().toISOString() }, { now });
assert.equal(profile.coverage.state, 'BOUNDED_COMPLETE');
assert.equal(profile.automatic_release, false);
assert.equal(profile.endpoint_integrity_claimed, false);
assert.equal(await verifyEnvironmentProfile(profile), true);
assert.equal((await replayEnvironmentProfile(profile, bundle, { now })).deterministic, true);

const managedObservations = await Promise.all(observations.map(item => compileSensorObservation({
  ...item, record_id:undefined, record_digest:undefined, environment_id:'env_managed', sensor_id:`${item.sensor_id}_m`
}, { now })));
const managed = await compileEnvironmentProfile({
  case_id:'case_apeq', environment_id:'env_managed', route_class:'PUBLIC_SECTOR_MANAGED_PROVIDER',
  sensor_bundle:await compileSensorBundle({case_id:'case_apeq',environment_id:'env_managed',observations:managedObservations,compiled_at:now().toISOString()},{now})
}, { now });
assert.ok(managed.hard_holds.includes('ROUTE_PUBLIC_SECTOR_MANAGED_PROVIDER_HARD_HOLD'));

const changed = await compileSensorObservation({...base,sensor_id:'sensor_B_changed',group:'B',field:'cloud_sync',value:true,source_status:'OBSERVED'},{now});
const changedBundle = await compileSensorBundle({case_id:'case_apeq',environment_id:'env_local',observations:[...observations.filter(item=>item.group!=='B'),changed],compiled_at:now().toISOString()},{now});
const changedProfile = await compileEnvironmentProfile({case_id:'case_apeq',environment_id:'env_local',route_class:'LOCAL_DRIVE',sensor_bundle:changedBundle,created_at:now().toISOString()},{now});
assert.equal(environmentChanged(profile, changedProfile).prior_eligibility_revoked, true);

await assert.rejects(() => compileSensorBundle({case_id:'case_apeq',environment_id:'env_local',observations,artifact_bytes:'forbidden'}), /artifact-blind|Unverified|unsupported/i);
const fixtureBank = JSON.parse(fs.readFileSync('app/dome-world/fixtures/ash-stretch12-r02-environments.json','utf8'));
assert.equal(fixtureBank.profiles.length, 11);
const courtSource = fs.readFileSync('app/dome-world/ash-stretch12-r02-environment-court.js','utf8');
for (const token of ['Environment Court · S12-A','unknown does not default safe','HARD HOLD']) assert.ok(courtSource.includes(token));
assert.doesNotMatch(courtSource, /fetch\(|indexedDB|localStorage/);
console.log('ash-stretch12-r02-a.test.mjs passed');
