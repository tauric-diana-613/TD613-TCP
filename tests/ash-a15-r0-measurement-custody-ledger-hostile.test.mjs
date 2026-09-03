import assert from 'node:assert/strict';
import {
  canonicalCustodyEpisode,
  sealMeasurementCustodyLedger,
  verifyMeasurementCustodyLedger,
  adjudicateSealedMeasurementCustody
} from '../app/dome-world/previews/a15-r0/measurement-custody-ledger.js';
import { canonicalPreregisteredLoomRoutePair } from '../app/dome-world/previews/a15-r0/loom-route-pair-preregistration.js';

const prereg=canonicalPreregisteredLoomRoutePair();
const original=canonicalCustodyEpisode();
const ledger=await sealMeasurementCustodyLedger(prereg,original,'2026-09-02T00:02:10Z');
assert.equal(ledger.status,'SEALED');

async function mustRejectMutation(label,mutate,expected='SEALED_MEASUREMENT_SET_MISMATCH'){
  const copy=structuredClone(original);
  mutate(copy);
  const verification=await verifyMeasurementCustodyLedger(prereg,ledger,copy);
  assert.equal(verification.status,'INADMISSIBLE',`${label} must fail custody verification.`);
  assert.ok(verification.errors.includes(expected)||verification.errors.includes('LEDGER_ROOT_MISMATCH'),`${label} must expose custody mismatch.`);
  const adjudication=await adjudicateSealedMeasurementCustody(prereg,ledger,copy);
  assert.equal(adjudication.status,'INADMISSIBLE',`${label} must not retain acquisition status after seal mismatch.`);
  assert.equal(adjudication.golden_egg_earned,false);
}

await mustRejectMutation('equal-value source substitution',copy=>{copy.artifacts[0].source_id='artifact-A-replacement';});
await mustRejectMutation('measurement identity replacement',copy=>{copy.artifacts[0].measurements[0].measurement_id='m-observer-replacement';});
await mustRejectMutation('numeric value mutation',copy=>{copy.artifacts[0].measurements[0].value=0.2;});
await mustRejectMutation('geometry metadata mutation',copy=>{
  const m=copy.artifacts.flatMap(a=>a.measurements).find(x=>x.name==='geometry');
  m.geometry_ref='g-post-seal-replacement';
});
await mustRejectMutation('matched-return metadata mutation',copy=>{
  const m=copy.artifacts.flatMap(a=>a.measurements).find(x=>x.name==='matched_return');
  m.control_route_id='route-post-seal';
});
await mustRejectMutation('measurement deletion',copy=>{
  for(const a of copy.artifacts)a.measurements=a.measurements.filter(m=>m.name!=='matched_return');
});

const rootDrift=structuredClone(ledger);
rootDrift.sealed_at='2026-09-02T00:02:11Z';
const rootCheck=await verifyMeasurementCustodyLedger(prereg,rootDrift,original);
assert.equal(rootCheck.status,'INADMISSIBLE');
assert.ok(rootCheck.errors.includes('LEDGER_ROOT_MISMATCH'));

const duplicate=canonicalCustodyEpisode();
const joining=duplicate.artifacts.flatMap(a=>a.measurements).find(m=>m.name==='joining');
const geometry=duplicate.artifacts.flatMap(a=>a.measurements).find(m=>m.name==='geometry');
geometry.measurement_id=joining.measurement_id;
const duplicateLedger=await sealMeasurementCustodyLedger(prereg,duplicate,'2026-09-02T00:02:10Z');
assert.equal(duplicateLedger.status,'INADMISSIBLE');
assert.ok(duplicateLedger.errors.includes('DUPLICATE_MEASUREMENT_ID'));

const backwards=canonicalCustodyEpisode();
const observer=backwards.artifacts.flatMap(a=>a.measurements).find(m=>m.name==='observer');
observer.recorded_at='2026-09-02T00:00:59Z';
const backwardsLedger=await sealMeasurementCustodyLedger(prereg,backwards,'2026-09-02T00:02:10Z');
assert.equal(backwardsLedger.status,'INADMISSIBLE');
assert.ok(backwardsLedger.errors.includes('RECORDED_BEFORE_MEASURED_OBSERVER'));

const earlySeal=await sealMeasurementCustodyLedger(prereg,canonicalCustodyEpisode(),'2026-09-02T00:02:04Z');
assert.equal(earlySeal.status,'INADMISSIBLE');
assert.ok(earlySeal.errors.some(e=>e.startsWith('MEASUREMENT_NOT_RECORDED_BEFORE_SEAL_')));

const partial=canonicalCustodyEpisode({surfaces:['observer','reconstruction']});
const ledger1=await sealMeasurementCustodyLedger(prereg,partial,'2026-09-02T00:01:10Z');
assert.equal(ledger1.status,'SEALED');
const retro=canonicalCustodyEpisode();
const retroJoining=retro.artifacts.flatMap(a=>a.measurements).find(m=>m.name==='joining');
retroJoining.measured_at='2026-09-02T00:01:04Z';
retroJoining.recorded_at='2026-09-02T00:01:05Z';
const retroLedger=await sealMeasurementCustodyLedger(prereg,retro,'2026-09-02T00:02:10Z',{previous_ledger:ledger1});
assert.equal(retroLedger.status,'INADMISSIBLE');
assert.ok(retroLedger.errors.includes('RETROACTIVE_INSERTION_AFTER_PRIOR_SEAL'));

const replacedPrefix=canonicalCustodyEpisode();
replacedPrefix.artifacts[0].source_id='artifact-A-equal-value-replacement';
const replacedLedger=await sealMeasurementCustodyLedger(prereg,replacedPrefix,'2026-09-02T00:02:10Z',{previous_ledger:ledger1});
assert.equal(replacedLedger.status,'INADMISSIBLE');
assert.ok(replacedLedger.errors.includes('APPEND_ONLY_PREFIX_VIOLATION'));

console.log('A15-R0 same-episode measurement custody ledger hostile tests passed.');
