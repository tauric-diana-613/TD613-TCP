# A15-R0 · Atlas Marked 2-Section Reconstruction Exactness · Execution Burden v0.1

𝌋⟐

The implementation must derive, not assume, the preregistered census.

## Enumeration

- Enumerate all `C(7,3)=35` labeled 3-subsets.
- Enumerate all 1-, 2-, 3-, and 4-block families.
- Admit only families whose every distinct block pair intersects in at most one ground element.
- Expected admitted counts: `35,385,1575,2310`, total `4305`.

## Exact accounting

Across admitted families require:

- total blocks `14770`;
- linearity pair checks `18970`;
- raw 7-by-block membership evaluations `103390`;
- incidence-neighborhood entries `28245`;
- overlap edges `17010`;
- marked-clique profile `3360` families with zero marks and `945` with one mark;
- total marks `945`.

## Receiver construction

For each admitted family derive:

1. exact incidence-neighborhood multiset over the union-grounded elements;
2. overlap graph edge set;
3. all incidence supports of cardinality at least 3 as concurrency marks.

## Reconstruction

From receiver data only:

1. emit one incidence neighborhood for each marked support;
2. mark every graph edge contained in a marked support as covered;
3. emit one degree-2 incidence neighborhood for each uncovered graph edge;
4. for each block vertex `i`, compute `shared_i = marks_containing_i + uncovered_edges_incident_i`;
5. reject if `shared_i > 3`;
6. emit exactly `3-shared_i` singleton neighborhoods `{i}`;
7. canonical-sort the reconstructed incidence-neighborhood multiset.

Require exact equality with the raw canonical incidence-neighborhood multiset in all 4305 admitted families.

## Structural checks

For every admitted family also require:

- no overlap edge is covered by two different marks;
- every marked support is a clique in the overlap graph;
- every block receives exactly three reconstructed incidences;
- reconstructed union-ground size equals raw union-ground size.

## Negative controls

- nonlinear `{012,013}`: receiver/reconstruction mismatch required;
- nonuniform `{0123,045}`: fixed-3-uniform reconstructor rejection required;
- isolated declaration: `{012}` on ground `{0,1,2}` and the same block on `{0,1,2,3}` must produce identical marked 2-section receiver while differing declared ground cardinality.

The chamber must not upgrade these finite checks into universal hypergraph reconstruction, physical-network, source-provenance, or runtime claims.

Sealed ⟐