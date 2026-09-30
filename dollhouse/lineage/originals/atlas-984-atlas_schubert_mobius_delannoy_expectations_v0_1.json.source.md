{
  "schema": "td613.dome-world.atlas-schubert-mobius-delannoy.expectations/v0.1",
  "parent_receipt": "776c6ef78011157d3458daf924bbb7cda7566785",
  "status": "PREREGISTERED_PREIMPLEMENTATION_THEOREM_UNEARNED",
  "formal_window": {
    "d_min": 1,
    "d_max": 7,
    "k_min": 0,
    "k_max": 5,
    "cells": 42,
    "support_polynomial_aggregate": [1715, 3829, 3101, 1099, 161, 7],
    "mobius_nonzero": 9912,
    "mobius_positive": 4977,
    "mobius_negative": 4935,
    "signed_total": 42,
    "reflexive_support": 1715,
    "cover_support": 3829,
    "higher_noncover_support": 4368
  },
  "anchor_d7_k3": {
    "m": 6,
    "k": 3,
    "polynomial": [84, 168, 105, 20],
    "labels": 84,
    "covers": 168,
    "nonzero": 377,
    "positive": 189,
    "negative": 188,
    "signed": 1
  },
  "candidate_bijection": {
    "source": "nonzero Mobius interval represented as a lower pivot word with a marked subset of actual 10 descents",
    "forward": "marked 10 -> D, unconsumed 0 -> E, unconsumed 1 -> N",
    "inverse": "E -> 0, N -> 1, D -> marked 10; simultaneously swap marked 10 to 01 for upper word",
    "rank_gap": "number of diagonal D steps",
    "mobius_sign": "(-1)^(number of diagonal D steps)"
  },
  "coefficient_formula": "c_s=(d+k-1-s)!/((d-1-s)!(k-s)!s!)",
  "weighted_recurrence": "M(m,k;t)=M(m-1,k;t)+M(m,k-1;t)+t*M(m-1,k-1;t)",
  "specializations": {
    "t0": "binomial(d+k-1,k)",
    "coefficient_t1": "earned upward-cover count",
    "t1": "Delannoy(d-1,k)=nonzero Mobius support count",
    "t_minus_1": 1
  },
  "transpose_symmetry": "M_{d,k}(t)=M_{k+1,d-1}(t)",
  "expected_failures": 0,
  "physical_trajectory_claimed": false,
  "causal_jump_claimed": false,
  "probability_claimed": false,
  "basis_free_canonical_geometry_claimed": false,
  "functorial_equivalence_claimed": false,
  "merge_authority": false
}
