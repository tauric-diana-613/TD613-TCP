import assert from 'node:assert/strict';
import {
  canonicalLoomPreMeasurementShell,
  canonicalPreregisteredLoomRoutePair,
  preregisterLoomRoutePair,
  stampOperationalMeasurements,
  evaluateFrozenLoomRoutePair
} from '../app/dome-world/previews/a15-r0/loom-route-pair-preregistration.js';
import { canonicalLoomRouteContextRecord } from '../app/dome-world/previews/a15-r0/loom-route-context-noncredit-adapter.js';
import { canonicalLoomGoldenEggEpisode } from '../app/dome-world/previews/a15-r0/loom-golden-egg-same-episode-acquisition.js';

const shell=canonicalLoomPreMeasurementShell();
const record=canonicalLoomRouteContextRecord(shell,{record_type:'route-deformation'});
record.recorded_at='2026-09-02T00:00:00Z';

const alreadyMeasured=canonicalLoomGoldenEggEpisode();
const measuredRecord=canonicalLoomRouteContextRecord(alreadyMeasured,{record_type:'route-deformation'});
measuredRecord.recorded_at='2026-09-02T00:00:00Z';
const posthoc=preregisterLoomRoutePair(alreadyMeasured,[measuredRecord],'2026-09-02T00:00:10Z');
assert.equal(posthoc.status,'INADMISSIBLE');
assert.ok(posthoc.errors.includes('PREREGISTRATION_REQUIRES_ZERO_OPERATIONAL_MEASUREMENTS'));

const lateContext={...record,recorded_at:'2026-09-02T00:00:20Z'};
const lateFreeze=preregisterLoomRoutePair(shell,[lateContext],'2026-09-02T00:00:10Z');
assert.equal(lateFreeze.status,'INADMISSIBLE');
assert.ok(lateFreeze.errors.includes('LOOM_CONTEXT_MUST_PRECEDE_ROUTE_PAIR_FREEZE'));

const prereg=canonicalPreregisteredLoomRoutePair();
const candidate=stampOperationalMeasurements(canonicalLoomGoldenEggEpisode(),'2026-09-02T00:01:00Z');

const swapped=structuredClone(candidate);
const c=swapped.routes.find(r=>r.role==='control');
const p=swapped.routes.find(r=>r.role==='protected');
[c.route_id,p.route_id]=[p.route_id,c.route_id];
const swappedResult=evaluateFrozenLoomRoutePair(prereg,swapped);
assert.equal(swappedResult.status,'INADMISSIBLE');
assert.ok(swappedResult.errors.includes('FROZEN_ROUTE_PAIR_IDENTITY_DRIFT'));

const frameDrift=structuredClone(candidate);
frameDrift.departure.comparison_frame_id='frame-posthoc';
frameDrift.routes.forEach(r=>{r.comparison_frame_id='frame-posthoc';});
for(const artifact of frameDrift.artifacts||[])for(const m of artifact.measurements||[]){if(m.name==='matched_return')m.comparison_frame_id='frame-posthoc';}
const frameResult=evaluateFrozenLoomRoutePair(prereg,frameDrift);
assert.equal(frameResult.status,'INADMISSIBLE');
assert.ok(frameResult.errors.includes('FROZEN_ROUTE_PAIR_IDENTITY_DRIFT'));

const early=stampOperationalMeasurements(canonicalLoomGoldenEggEpisode(),'2026-09-02T00:00:05Z');
const earlyResult=evaluateFrozenLoomRoutePair(prereg,early);
assert.equal(earlyResult.status,'INADMISSIBLE');
assert.ok(earlyResult.errors.some(e=>e.startsWith('MEASUREMENT_NOT_AFTER_FREEZE_')));

const missing=structuredClone(candidate);
delete missing.artifacts[0].measurements[0].measured_at;
const missingResult=evaluateFrozenLoomRoutePair(prereg,missing);
assert.equal(missingResult.status,'INADMISSIBLE');
assert.ok(missingResult.errors.includes('MEASURED_AT_REQUIRED_OBSERVER'));

const badFreeze=preregisterLoomRoutePair(shell,[record],'not-a-time');
assert.equal(badFreeze.status,'INADMISSIBLE');
assert.ok(badFreeze.errors.includes('VALID_PREREGISTRATION_TIME_REQUIRED'));

console.log('A15-R0 Loom route-pair preregistration hostile tests passed.');
