{
  "schema": "td613.dome-world.atlas-receiver-matroid-minors-fault-tolerance-expectations/v0.1",
  "parent_receipt": "431898a8bc7f14c466f401d71dfe20feaaf7c447",
  "ground_set": ["q00", "q01", "q10", "q11"],
  "D": {
    "full_rank": 1,
    "rank_preserving_deletion_masks": [0,1,2,3,4,5,8,9,10,11,12,13],
    "rank_destroying_deletion_masks": [6,7,14,15],
    "cocircuit_masks": [6],
    "rank_preserving_by_deletion_size": [1,4,5,2,0],
    "rank_destroying_by_deletion_size": [0,0,1,2,1],
    "single_deletion_ranks": [1,1,1,1],
    "deletion_distance": 2,
    "coloop_indices": [],
    "deletion_minor_type_frequency": {
      "U_1_2_PLUS_ONE_LOOP": 2,
      "U_1_1_PLUS_TWO_LOOPS": 2
    },
    "contraction_minor_type_frequency": {
      "U_1_2_PLUS_ONE_LOOP": 2,
      "U_0_3": 2
    }
  },
  "Q": {
    "full_rank": 2,
    "rank_preserving_deletion_masks": [0,1,2,4,8,9,10,12],
    "rank_destroying_deletion_masks": [3,5,6,7,11,13,14,15],
    "cocircuit_masks": [3,5,6],
    "rank_preserving_by_deletion_size": [1,4,3,0,0],
    "rank_destroying_by_deletion_size": [0,0,3,4,1],
    "single_deletion_ranks": [2,2,2,2],
    "deletion_distance": 2,
    "coloop_indices": [],
    "deletion_minor_type_frequency": {
      "U_2_3": 1,
      "U_2_2_PLUS_ONE_LOOP": 3
    },
    "contraction_minor_type_frequency": {
      "U_2_3": 1,
      "U_1_2_PLUS_ONE_LOOP": 3
    }
  },
  "combined": {
    "deletion_masks_evaluated": 32,
    "single_element_minors": 16,
    "minor_rank_values": 128,
    "minor_normalization_checks": 16,
    "minor_rank_upper_bound_checks": 128,
    "minor_monotonicity_candidate_pairs": 1024,
    "minor_monotonicity_inclusion_premises": 432,
    "minor_submodularity_pairs": 1024,
    "cross_control_bridge_isomorphism_obligations": 6,
    "expected_failure_total": 0
  },
  "candidate_laws": {
    "all_single_coordinate_deletions_preserve_full_rank": true,
    "both_deletion_distances_equal_two": true,
    "cocircuit_multiplicity_differs": true,
    "Q_nonloop_contractions_match_D_loop_minors": true,
    "D_nonloop_contractions_collapse_to_U_0_3": true
  }
}
