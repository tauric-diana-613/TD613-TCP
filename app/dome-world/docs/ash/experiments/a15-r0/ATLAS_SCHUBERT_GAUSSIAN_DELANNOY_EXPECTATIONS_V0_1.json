{
  "schema": "td613.dome-world.atlas-schubert-gaussian-delannoy.expectations/v0.1",
  "status": "PREREGISTERED_PREIMPLEMENTATION_THEOREM_UNEARNED",
  "parent": {
    "pr": 971,
    "receipt": "00b3772c46181747dbb5f7101a5a11f7bf4ba6b9",
    "validation_run": 2446,
    "validation_run_id": 33580185534,
    "result": "SUCCESS"
  },
  "definition": "G_(a,b)(q,t)=sum over earned nonzero Mobius intervals f<=e of q^r(f) t^(r(e)-r(f)), with a=d-1 and b=k",
  "word_model": "sum over binary pivot words w with a zeros and b ones of q^r(w)(1+t)^des10(w)",
  "closed_form": "sum_s q^(s(s-1)/2) GaussianMultinomial_q(a+b-s; a-s,b-s,s) t^s",
  "recurrence": "G(a,b)=G(a-1,b)+q^a G(a,b-1)+t q^(a-1) G(a-1,b-1)",
  "boundaries": ["G(0,b)=1", "G(a,0)=1"],
  "formal_window": {
    "d_min": 1,
    "d_max": 7,
    "k_min": 0,
    "k_max": 5,
    "cells": 42,
    "pivot_words": 1715,
    "marked_descent_objects": 9912,
    "t_slices": 112,
    "rectangular_coefficient_slots": 1428,
    "bounded_transpose_controls": 36
  },
  "specializations": {
    "t_zero": "earned #963 Gaussian Schubert polynomial",
    "q_one": "earned #971 Delannoy/Mobius-support polynomial",
    "t_minus_one": "q^(ab)",
    "t_minus_q": "1"
  },
  "slice_reciprocity": "C_s(q)=q^(ab-s) C_s(q^-1)",
  "transpose_symmetry": "G_(a,b)(q,t)=G_(b,a)(q,t) on bounded executable square 0<=a,b<=5",
  "anchor_d7_k3": {
    "a": 6,
    "b": 3,
    "rank": 18,
    "q1_t_coefficients": [84, 168, 105, 20],
    "q2_t0": "788035",
    "q2_t1": "1644634",
    "q2_t_minus1": "262144",
    "q2_t_minus2": "1"
  },
  "expected_failures": 0,
  "claims_not_made": [
    "physical_two_dimensions",
    "temporal_q_reversal",
    "probability_model",
    "basis_free_canonical_geometry",
    "functorial_duality",
    "asymptotic_geometry",
    "runtime_scheduling",
    "new_universal_mobius_cancellation_theorem",
    "merge_authority"
  ]
}
