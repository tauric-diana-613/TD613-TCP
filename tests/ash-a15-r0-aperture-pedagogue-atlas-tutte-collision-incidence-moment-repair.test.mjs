import assert from 'node:assert/strict';
import {
  ATLAS_TUTTE_COLLISION_INCIDENCE_MOMENT_REPAIR_SCHEMA,
  ATLAS_TUTTE_COLLISION_INCIDENCE_MOMENT_REPAIR_PARENT_RECEIPT,
  atlasTutteCollisionIncidenceMomentRepairCertificate,
} from '../app/dome-world/previews/a15-r0/atlas-tutte-collision-incidence-moment-repair.js';

const c=atlasTutteCollisionIncidenceMomentRepairCertificate();

assert.equal(ATLAS_TUTTE_COLLISION_INCIDENCE_MOMENT_REPAIR_SCHEMA,'td613.dome-world.atlas-tutte-collision-incidence-moment-repair/v0.1');
assert.equal(ATLAS_TUTTE_COLLISION_INCIDENCE_MOMENT_REPAIR_PARENT_RECEIPT,'2b06eb8d2262135ed6b111dc103867c2d7e973af');
assert.equal(c.parent_exact,true);
assert.deepEqual(c.M_disj.circuit_hyperplanes,[7,56]);
assert.deepEqual(c.M_meet.circuit_hyperplanes,[7,25]);
assert.deepEqual(c.M_disj.labeled_incidence_degrees,[1,1,1,1,1,1]);
assert.deepEqual(c.M_meet.labeled_incidence_degrees,[2,1,1,1,1,0]);
assert.deepEqual(c.M_disj.sorted_incidence_degrees,[1,1,1,1,1,1]);
assert.deepEqual(c.M_meet.sorted_incidence_degrees,[2,1,1,1,1,0]);
assert.equal(c.M_disj.m1,6);
assert.equal(c.M_meet.m1,6);
assert.equal(c.M_disj.m2,6);
assert.equal(c.M_meet.m2,8);
assert.equal(c.M_disj.pair_overlap_from_degrees,0);
assert.equal(c.M_disj.pair_overlap_from_moments,0);
assert.equal(c.M_disj.pair_overlap_direct,0);
assert.equal(c.M_meet.pair_overlap_from_degrees,1);
assert.equal(c.M_meet.pair_overlap_from_moments,1);
assert.equal(c.M_meet.pair_overlap_direct,1);
assert.deepEqual(c.receiver_ladder.class_counts,{R0:1,R1:1,R2:2});
assert.equal(c.receiver_ladder.incidence_moment_separation_depth,2);
assert.equal(c.receiver_ladder.extra_scalar_coordinates_needed_after_tutte,1);
assert.equal(c.receiver_ladder.first_moment_adds_no_separation,true);
assert.equal(c.receiver_ladder.second_moment_repairs_declared_collision,true);
assert.equal(c.overlap_identity.equality_checks,4);
assert.equal(c.overlap_identity.failures,0);
assert.deepEqual(c.relabeling,{
  permutations_per_control:720,
  total_relabelings:1440,
  incidence_membership_evaluations:17280,
  invariant_checks:5760,
  failures:0,
});
assert.deepEqual(c.aggregate_burden,{
  base_incidence_membership_evaluations:24,
  relabeling_incidence_membership_evaluations:17280,
  receiver_signatures:6,
  overlap_exact_equalities:4,
  relabelings:1440,
});
assert.equal(c.laws.first_incidence_moment_preserves_collision,true);
assert.equal(c.laws.second_incidence_moment_separates_collision,true);
assert.equal(c.laws.declared_incidence_moment_separation_depth_is_two,true);
assert.equal(c.laws.second_moment_excess_recovers_overlap,true);
assert.equal(c.laws.relabeling_invariant,true);
assert.equal(c.laws.complete_matroid_invariant_claimed,false);
assert.equal(c.laws.universal_required_moment_order_claimed,false);
assert.equal(c.laws.universal_classifier_claimed,false);
assert.equal(c.laws.physical_sensor_incidence_claimed,false);
assert.equal(c.laws.shannon_information_claimed,false);
assert.equal(c.laws.causal_interaction_claimed,false);
assert.equal(c.laws.lossless_compression_claimed,false);
assert.equal(c.passed,true);

console.log('Ash A15-R0 Atlas Tutte collision incidence-moment repair canonical contract passed.');
