import assert from 'node:assert/strict';
import {
  GOLDEN_EGG_GEOMETRY_DESIGN_RECEIPT,
  canonicalLoomGoldenEggEpisode,
  evaluateLoomGoldenEggAcquisitionEpisode
} from '../app/dome-world/previews/a15-r0/loom-golden-egg-same-episode-acquisition.js';

const clone=x=>structuredClone(x);

const crossArtifact=clone(canonicalLoomGoldenEggEpisode());
crossArtifact.artifacts[1].episode_id='foreign-episode';
let r=evaluateLoomGoldenEggAcquisitionEpisode(crossArtifact);
assert.equal(r.status,'INADMISSIBLE');
assert.equal(r.errors.includes('CROSS_EPISODE_ARTIFACT_TRANSPLANT'),true);
assert.equal(r.child_message,'THAT THREAD CAME FROM ANOTHER JOURNEY.');

const crossMeasurement=clone(canonicalLoomGoldenEggEpisode());
crossMeasurement.artifacts[1].measurements[0].episode_id='foreign-episode';
r=evaluateLoomGoldenEggAcquisitionEpisode(crossMeasurement);
assert.equal(r.status,'INADMISSIBLE');
assert.equal(r.errors.includes('CROSS_EPISODE_MEASUREMENT_TRANSPLANT'),true);
assert.equal(r.child_message,'THAT THREAD CAME FROM ANOTHER JOURNEY.');

const routeCollapse=clone(canonicalLoomGoldenEggEpisode());
routeCollapse.routes[1].route_id=routeCollapse.routes[0].route_id;
r=evaluateLoomGoldenEggAcquisitionEpisode(routeCollapse);
assert.equal(r.status,'INADMISSIBLE');
assert.equal(r.errors.includes('SHARED_ORIGIN_MUST_NOT_COLLAPSE_ROUTE_IDENTITY'),true);

const duplicateReturn=clone(canonicalLoomGoldenEggEpisode());
duplicateReturn.routes[1].return_id=duplicateReturn.routes[0].return_id;
r=evaluateLoomGoldenEggAcquisitionEpisode(duplicateReturn);
assert.equal(r.status,'INADMISSIBLE');
assert.equal(r.errors.includes('MATCHED_RETURNS_MUST_RETAIN_DISTINCT_ROUTE_CUSTODY'),true);

const unobserved=clone(canonicalLoomGoldenEggEpisode());
unobserved.routes[1].return_observed=false;
r=evaluateLoomGoldenEggAcquisitionEpisode(unobserved);
assert.equal(r.status,'INADMISSIBLE');
assert.equal(r.errors.includes('INCOMPLETE_PROTECTED_ROUTE'),true);

const readerProxy=clone(canonicalLoomGoldenEggEpisode({includeReturn:false}));
readerProxy.artifacts[1].measurements.push({
  name:'matched_reader_validation',episode_id:readerProxy.episode_id,value:1,measured:true
});
r=evaluateLoomGoldenEggAcquisitionEpisode(readerProxy);
assert.equal(r.status,'HELD');
assert.equal(r.operational_missing.includes('matched_return'),true);

const recoveryProxy=clone(canonicalLoomGoldenEggEpisode({includeReturn:false}));
recoveryProxy.artifacts[1].measurements.push({
  name:'recovery_tail',episode_id:recoveryProxy.episode_id,value:1,measured:true
});
r=evaluateLoomGoldenEggAcquisitionEpisode(recoveryProxy);
assert.equal(r.status,'HELD');
assert.equal(r.operational_missing.includes('matched_return'),true);

const syntheticGeometry=clone(canonicalLoomGoldenEggEpisode({includeGeometry:false}));
syntheticGeometry.geometry_design_ref={receipt:GOLDEN_EGG_GEOMETRY_DESIGN_RECEIPT,evidence_class:'SYNTHETIC_RESEARCH_GEOMETRY',acquisition_credit:0};
syntheticGeometry.artifacts.push({
  source_id:'synthetic-geometry',
  episode_id:syntheticGeometry.episode_id,
  custody_id:syntheticGeometry.departure.custody_id,
  evidence_class:'SIMULATED_FACTORIZED_PRODUCT_SPACE',
  measurements:[{name:'geometry',episode_id:syntheticGeometry.episode_id,value:1,measured:true}]
});
r=evaluateLoomGoldenEggAcquisitionEpisode(syntheticGeometry);
assert.equal(r.status,'HELD');
assert.equal(r.operational_missing.includes('geometry'),true);
assert.equal(r.geometry_witness_pass,false);

const malformedGeometry=clone(canonicalLoomGoldenEggEpisode());
const g=malformedGeometry.artifacts[1].measurements.find(x=>x.name==='geometry');
delete g.geometry_ref;
r=evaluateLoomGoldenEggAcquisitionEpisode(malformedGeometry);
assert.equal(r.status,'INADMISSIBLE');
assert.equal(r.errors.includes('MALFORMED_EMPIRICAL_GEOMETRY_WITNESS'),true);

const malformedReturn=clone(canonicalLoomGoldenEggEpisode());
const c=malformedReturn.artifacts[1].measurements.find(x=>x.name==='matched_return');
c.control_route_id='wrong-route';
r=evaluateLoomGoldenEggAcquisitionEpisode(malformedReturn);
assert.equal(r.status,'INADMISSIBLE');
assert.equal(r.errors.includes('MALFORMED_MATCHED_RETURN_WITNESS'),true);

const conflict=clone(canonicalLoomGoldenEggEpisode());
conflict.artifacts.push({
  source_id:'conflicting-observer',
  episode_id:conflict.episode_id,
  custody_id:conflict.departure.custody_id,
  evidence_class:'PUBLIC_EMPIRICAL_CASE',
  measurements:[{name:'observer',episode_id:conflict.episode_id,value:0.2,measured:true}]
});
r=evaluateLoomGoldenEggAcquisitionEpisode(conflict);
assert.equal(r.status,'INADMISSIBLE');
assert.equal(r.errors.includes('CONTRADICTORY_REQUIRED_MEASUREMENT'),true);

const threshold=clone(canonicalLoomGoldenEggEpisode({observer:0.9}));
r=evaluateLoomGoldenEggAcquisitionEpisode(threshold);
assert.equal(r.status,'FAILED');
assert.equal(r.thresholds_pass,false);
assert.equal(r.golden_egg_earned,false);

console.log('A15-R0 Loom-compatible Golden Egg same-episode acquisition hostile tests passed.');
