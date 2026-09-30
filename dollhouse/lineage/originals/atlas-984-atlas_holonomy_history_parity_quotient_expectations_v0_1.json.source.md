{
  "schema": "td613.a15-r0.atlas-holonomy-history-parity-quotient-expectations/v0.1",
  "parent_receipt": "6df04aebd040fd16c8f67188a61dd6380956c46e",
  "loop_generator": "gamma",
  "history_domain": "integer loop powers gamma^n",
  "visible_receiver": {
    "image_size": 1,
    "kernel": "Z",
    "history_classes": 1
  },
  "apparatus_receiver": {
    "generator_order": 2,
    "image_size": 2,
    "kernel": "2Z",
    "history_classes": 2,
    "quotient": "Z/2Z",
    "equivalence": "n congruent m mod 2"
  },
  "strict_receiver_history_split": true,
  "window": {
    "min": -8,
    "max": 8,
    "size": 17,
    "even": 9,
    "odd": 8,
    "unordered_distinct_pairs": 136,
    "same_parity_pairs": 64,
    "opposite_parity_pairs": 72,
    "winding_by_fiber_evaluations": 68,
    "same_parity_future_transport_marker_comparisons": 2048,
    "opposite_parity_immediate_marker_comparisons": 288
  },
  "required_witnesses": {
    "same_class": [[0,2],[0,-2],[1,3],[1,-1]],
    "different_class": [[0,1],[1,2]]
  },
  "required_losses": {
    "winding_magnitude_reconstructed": false,
    "winding_sign_reconstructed": false,
    "exact_route_reconstructed": false
  },
  "required_mismatches": {
    "same_parity_action_mismatches": 0,
    "same_parity_future_readout_mismatches": 0,
    "opposite_parity_immediate_readout_failures": 0,
    "visible_endpoint_divergences": 0
  }
}
