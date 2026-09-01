# A15-R0 · Atlas Capacity-Vector Marked 2-Section Reconstruction · Execution Burden v0.1

Frozen before implementation.

## Algebraic burden
Implementation must expose one reconstructor using a per-block positive integer capacity vector `c_i`; it may not branch on global uniformity. For every admitted linear union-grounded incidence system:

- every degree>=3 incidence support is reconstructed from a declared mark;
- every overlap edge covered by a mark is covered exactly once;
- every uncovered overlap edge reconstructs exactly one degree-2 incidence support;
- for each block `i`, `private_i = c_i - shared_i` must be a nonnegative integer;
- reconstructed support multiset must equal the raw ground-element incidence-neighborhood multiset exactly.

## Exhaustive nonuniform assay
Ground `{0,...,6}`. Candidate blocks: all 2-, 3-, and 4-subsets, 91 total. Candidate families: all 1-, 2-, and 3-block subfamilies.

Exact ambient candidate count:
- 91 singleton families;
- 4,095 two-block families;
- 121,485 three-block families;
- 125,671 total.

If every pair is checked without early exit, pair-linearity candidate checks = 368,550.

Expected admitted surface:
- admitted families = 27,426;
- by block count = 91 / 2,275 / 25,060;
- total admitted block occurrences = 79,821;
- raw ground/block membership evaluations = 558,747;
- total union-grounded incidence-neighborhood entries = 161,287;
- total overlap edges = 57,820;
- total concurrency marks = 2,345;
- mark-count profile = `{0:25081,1:2345}`;
- nonuniform admitted = 23,765;
- marked admitted = 2,345;
- nonuniform marked = 2,100;
- exact round-trip successes = 27,426;
- failures = 0.

## Capacity-label necessity hostile
Controls A and B must be reconstructed from raw set systems before importing the child.

A = `[{0,1},{0,2,3,4},{2,5,6}]` with vertex capacities `[2,4,3]`.
B = `[{0,1,3,4},{0,2},{2,5,6}]` with vertex capacities `[4,2,3]`.

Required:
- same unmarked overlap graph (path on 3 vertices);
- same sorted capacity multiset `[2,3,4]`;
- exactly 2 graph automorphisms/isomorphisms between path graphs;
- 0 graph isomorphisms preserve attached capacities;
- raw incidence-neighborhood multisets differ;
- receiver with attached capacities reconstructs each exactly.

## Negative theorem boundaries
Retain nonlinearity and degree-zero ground boundaries from ancestry. Do not claim capacity labeling repairs nonlinear edge multiplicity. Do not claim isolated degree-zero ground elements become visible.

Sealed ⟐