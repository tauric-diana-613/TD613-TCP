{
  "schema": "td613.dome-world.atlas-tutte-collision-incidence-moment-repair.expectations/v0.1",
  "parent_receipt": "2b06eb8d2262135ed6b111dc103867c2d7e973af",
  "parent_run": {
    "run_number": 2418,
    "run_id": 33450084910,
    "a15_r0_step_19": "success",
    "aggregate": "success"
  },
  "ground_set_size": 6,
  "control_count": 2,
  "common_tutte": {
    "0,1": 4,
    "0,2": 3,
    "0,3": 1,
    "1,0": 4,
    "1,1": 2,
    "2,0": 3,
    "3,0": 1
  },
  "M_disj": {
    "circuit_hyperplanes": [7,56],
    "labeled_incidence_degrees": [1,1,1,1,1,1],
    "sorted_incidence_degrees": [1,1,1,1,1,1],
    "m1": 6,
    "m2": 6,
    "pair_overlap_from_moments": 0,
    "direct_intersection_profile": [0]
  },
  "M_meet": {
    "circuit_hyperplanes": [7,25],
    "labeled_incidence_degrees": [2,1,1,1,1,0],
    "sorted_incidence_degrees": [2,1,1,1,1,0],
    "m1": 6,
    "m2": 8,
    "pair_overlap_from_moments": 1,
    "direct_intersection_profile": [1]
  },
  "receiver_ladder": {
    "R0_tutte_class_count": 1,
    "R1_tutte_m1_class_count": 1,
    "R2_tutte_m1_m2_class_count": 2,
    "incidence_moment_separation_depth": 2,
    "extra_scalar_coordinates_needed_after_tutte": 1
  },
  "relabeling": {
    "permutations_per_control": 720,
    "total_relabelings": 1440,
    "incidence_membership_evaluations": 17280,
    "expected_failures": 0
  },
  "overlap_identity": {
    "controls_checked": 2,
    "expected_failures": 0
  },
  "negative_authority": {
    "complete_matroid_invariant_claimed": false,
    "universal_required_moment_order_claimed": false,
    "universal_classifier_claimed": false,
    "physical_sensor_incidence_claimed": false,
    "shannon_information_claimed": false,
    "causal_interaction_claimed": false,
    "lossless_compression_claimed": false
  }
}