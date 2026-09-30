{
  "schema": "td613.dome-world.atlas-matroidal-receiver-closure-basis-exchange.expectations/v0.1",
  "parent_receipt": "ae53ebdc5fa970c162768fb694e826edc23fb0bb",
  "ground_set_size": 4,
  "subset_count": 16,
  "D": {
    "rank": 1,
    "rank_frequency": {"0": 4, "1": 12},
    "independent_masks": [0, 2, 4],
    "basis_masks": [2, 4],
    "circuit_masks": [1, 6, 8],
    "loop_indices": [0, 3],
    "nonloop_parallel_pairs": [[1, 2]],
    "steinitz_true_antecedents": 16,
    "steinitz_failures": 0,
    "basis_exchange_obligations": 2,
    "basis_exchange_failures": 0,
    "matroid_type": "U_1_2_PLUS_TWO_LOOPS"
  },
  "Q": {
    "rank": 2,
    "rank_frequency": {"0": 2, "1": 6, "2": 8},
    "independent_masks": [0, 1, 2, 3, 4, 5, 6],
    "basis_masks": [3, 5, 6],
    "circuit_masks": [7, 8],
    "loop_indices": [3],
    "nonloop_parallel_pairs": [],
    "steinitz_true_antecedents": 30,
    "steinitz_failures": 0,
    "basis_exchange_obligations": 6,
    "basis_exchange_failures": 0,
    "matroid_type": "U_2_3_PLUS_ONE_LOOP"
  },
  "combined_burden": {
    "extensivity_checks": 32,
    "idempotence_checks": 32,
    "monotonicity_candidate_pairs": 512,
    "monotonicity_inclusion_premises": 162,
    "steinitz_candidate_triples": 512,
    "steinitz_true_antecedents": 46,
    "rank_closure_equivalence_checks": 128,
    "rank_submodularity_pairs": 512,
    "basis_exchange_obligations": 8
  },
  "all_failure_counts": 0,
  "physical_matroid_claimed": false
}