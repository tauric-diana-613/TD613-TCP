import assert from 'node:assert/strict';
import {
  LOOM_ROUTE_PAIR_PREREGISTRATION_CERTIFICATE as C,
  canonicalLoomPreMeasurementShell,
  canonicalPreregisteredLoomRoutePair,
  stampOperationalMeasurements,
  evaluateFrozenLoomRoutePair
} from '../app/dome-world/previews/a15-r0/loom-route-pair-preregistration.js';
import { canonicalLoomGoldenEggEpisode } from '../app/dome-world/previews/a15-r0/loom-golden-egg-same-episode-acquisition.js';

assert.equal(C.passed,true,'Loom route-pair preregistration certificate must pass.');
assert.equal(C.exact_parent,'33e65722681eef3b13a64942c082ef73f0ad3f68');
assert.equal(C.preregistration.status,'FROZEN');
assert.equal(C.preregistration.exact_required_surfaces_at_freeze.length,0);
assert.equal(C.preregistration.empirical_credit,0);
assert.equal(C.adjudication.status,'CANDIDATE');
assert.equal(C.adjudication.route_tuple_preserved,true);
assert.equal(C.adjudication.all_measurements_after_freeze,true);
assert.equal(C.adjudication.empirical_credit_from_preregistration,0);
assert.equal(C.golden_egg_earned,false);

const shell=canonicalLoomPreMeasurementShell();
assert.equal(shell.artifacts.length,0,'Canonical preregistration shell must contain zero empirical artifact packets.');
const prereg=canonicalPreregisteredLoomRoutePair();
const measured=stampOperationalMeasurements(canonicalLoomGoldenEggEpisode(),'2026-09-02T00:05:00Z');
const result=evaluateFrozenLoomRoutePair(prereg,measured);
assert.equal(result.status,'CANDIDATE');
assert.equal(result.parent_acquisition_status,'CANDIDATE');
assert.equal(result.measurement_count,5);
assert.equal(result.golden_egg_earned,false);

console.log('A15-R0 Loom route-pair preregistration canonical tests passed.');
