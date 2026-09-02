import assert from 'node:assert/strict';
import {
  LOOM_ROUTE_CONTEXT_NONCREDIT_CERTIFICATE as C,
  LOOM_ROUTE_CONTEXT_SCIENCE_PARENT,
  LOOM_ROUTE_CONTEXT_INSTALLATION_PARENT,
  canonicalLoomRouteContextRecord,
  bindLoomRouteContext
} from '../app/dome-world/previews/a15-r0/loom-route-context-noncredit-adapter.js';
import { canonicalLoomGoldenEggEpisode } from '../app/dome-world/previews/a15-r0/loom-golden-egg-same-episode-acquisition.js';

assert.equal(C.passed,true,'Loom route-context non-credit certificate must pass.');
assert.equal(C.science_parent,'22c49c9b4f4e322924aa660984674d47fc9a0fb9');
assert.equal(C.installation_parent,'5acce3d1729eb3087bc997e87288fbd91b2a2a5c');
assert.equal(LOOM_ROUTE_CONTEXT_SCIENCE_PARENT,C.science_parent);
assert.equal(LOOM_ROUTE_CONTEXT_INSTALLATION_PARENT,C.installation_parent);

const heldEpisode=canonicalLoomGoldenEggEpisode({includeReturn:false});
const before=structuredClone(heldEpisode);
const heldRecord=canonicalLoomRouteContextRecord(heldEpisode,{record_type:'motif-return'});
const held=bindLoomRouteContext(heldEpisode,[heldRecord]);
assert.deepEqual(heldEpisode,before,'Binding Loom context must not mutate the acquisition episode.');
assert.equal(held.context_status,'BOUND_CONTEXT');
assert.equal(held.parent_status_before,'HELD');
assert.equal(held.parent_status_after,'HELD','A motif-return must not substitute for matched_return.');
assert.equal(held.acquisition_credit,0);
assert.deepEqual(held.empirical_surfaces_added,[]);
assert.equal(held.exact_required_surfaces_preserved,true);
assert.equal(held.laws.motif_return_not_matched_return,true);
assert.equal(held.golden_egg_earned,false);

const noGeometry=canonicalLoomGoldenEggEpisode({includeGeometry:false});
const cloth=canonicalLoomRouteContextRecord(noGeometry,{record_type:'cloth-map'});
cloth.payload={geometry:'visually-suggestive-but-context-only'};
const geometricHold=bindLoomRouteContext(noGeometry,[cloth]);
assert.equal(geometricHold.context_status,'BOUND_CONTEXT');
assert.equal(geometricHold.parent_status_before,'HELD');
assert.equal(geometricHold.parent_status_after,'HELD','A cloth-map must not substitute for empirical geometry.');
assert.equal(geometricHold.laws.cloth_map_not_geometry_measurement,true);

const candidateEpisode=canonicalLoomGoldenEggEpisode();
const routeRecord=canonicalLoomRouteContextRecord(candidateEpisode,{record_type:'route-deformation'});
const candidate=bindLoomRouteContext(candidateEpisode,[routeRecord]);
assert.equal(candidate.context_status,'BOUND_CONTEXT');
assert.equal(candidate.parent_status_before,'CANDIDATE');
assert.equal(candidate.parent_status_after,'CANDIDATE');
assert.equal(candidate.golden_egg_earned,false,'Context binding must not upgrade a Golden Egg candidate into the Egg.');
assert.equal(candidate.live_loom_mutated,false);
assert.equal(candidate.merge_authority,false);
assert.equal(candidate.production_authority,false);

console.log('A15-R0 Loom route-context non-credit adapter canonical tests passed.');
