{
  "schema": "td613.dome-world.atlas-schubert-mobius-incidence.expectations/v0.1",
  "parent_receipt": "f083e506f2a16f1d98b3af9a9b963d65694efc47",
  "status": "PREREGISTERED_PREIMPLEMENTATION_THEOREM_UNEARNED",
  "claim": "the fixed-flag Atlas Schubert closure-poset Möbius coefficient is supported exactly on comparable intervals whose proper-prefix gaps and pivot displacements are all Boolean; on that support the coefficient is the parity sign of the rank gap",
  "formal_window": {
    "d_min": 1,
    "d_max": 7,
    "k_min": 0,
    "k_max": 5,
    "cells": 42,
    "ordered_composition_pairs": 376467,
    "ordered_comparable_pairs": 113828,
    "mobius_nonzero": 9912,
    "mobius_positive": 4977,
    "mobius_negative": 4935,
    "mobius_zero_comparable": 103916,
    "expected_recursive_formula_mismatches": 0
  },
  "anchor_d7_k3": {
    "labels": 84,
    "closure_incidences": 2520,
    "mobius_nonzero": 377,
    "mobius_positive": 189,
    "mobius_negative": 188
  },
  "candidate_law": {
    "comparable_required": true,
    "prefix_gap_values": [0, 1],
    "pivot_gap_values": [0, 1],
    "nonzero_value": "(-1)^(m(upper)-m(lower))",
    "otherwise": 0,
    "partition_translation": "lambda(upper)/lambda(lower) is an antichain in the finite k x (d-1) rectangle grid, equivalently a rook strip"
  },
  "independent_witness": {
    "method": "defining Möbius recurrence over the earned closure relation",
    "may_use_candidate_formula": false,
    "may_use_boolean_gap_predicate": false,
    "may_use_partition_antichain_predicate": false
  },
  "expected_failures": 0,
  "basis_free_canonical_geometry_claimed": false,
  "functorial_equivalence_claimed": false,
  "physical_claimed": false,
  "causal_reversal_claimed": false,
  "merge_authority": false
}
