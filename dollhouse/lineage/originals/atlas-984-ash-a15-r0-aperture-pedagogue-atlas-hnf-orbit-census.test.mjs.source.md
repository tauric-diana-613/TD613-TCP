import assert from 'node:assert/strict';
import {
  ATLAS_HNF_ORBIT_CENSUS_SCHEMA,
  ATLAS_HNF_ORBIT_CENSUS_PARENT_RECEIPT,
  atlasHnfOrbitCount,
  atlasHnfOrbitCensusCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-hnf-orbit-census.js';

const c=atlasHnfOrbitCensusCertificate();
assert.equal(ATLAS_HNF_ORBIT_CENSUS_SCHEMA,'td613.dome-world.atlas-hnf-orbit-census/v0.1');
assert.equal(ATLAS_HNF_ORBIT_CENSUS_PARENT_RECEIPT,'445f84887306be89cf2167f66fe26c3162daff18');
assert.equal(c.parent_exact,true);
assert.deepEqual(c.profiles[1],['1','1','1','1','1','1','1','1']);
assert.deepEqual(c.profiles[2],['1','3','4','7','6','12','8','15']);
assert.deepEqual(c.profiles[3],['1','7','13','35','31','91','57','155']);
assert.deepEqual(c.profiles[7],['1','127','1093','10795','19531','138811','137257','788035']);
assert.equal(c.profile_failures,0);
assert.equal(c.coprime_pairs_per_dimension,46);
assert.equal(c.multiplicativity_controls,230);
assert.equal(c.multiplicativity_failures,0);
assert.equal(c.prime_power_controls,75);
assert.equal(c.prime_power_failures,0);
assert.deepEqual(c.non_complete_multiplicativity_control,{a_2_4:'7',a_2_2_squared:'9',passed:true});
assert.equal(atlasHnfOrbitCount(3,8),'155');
assert.equal(atlasHnfOrbitCount(7,8),'788035');
assert.equal(c.laws.multiplicative,true);
assert.equal(c.laws.completely_multiplicative,false);
assert.equal(c.laws.raw_receiver_count_claimed,false);
assert.equal(c.laws.analytic_continuation_claimed,false);
assert.equal(c.laws.shannon_claimed,false);
assert.equal(c.passed,true);

console.log('Ash A15-R0 Atlas HNF orbit census canonical tests passed.');