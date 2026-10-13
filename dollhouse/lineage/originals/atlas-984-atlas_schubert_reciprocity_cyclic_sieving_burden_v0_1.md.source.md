# A15-R0 · Atlas Schubert Reciprocity C2 Cyclic-Sieving Burden v0.1

Status: FROZEN EXECUTABLE BURDEN / THEOREM UNEARNED.

Exact earned parent:
`#976 / 5cdbbd3713ccf5798523ff96d6db75df0367fadd / run 2451 / 33594016328 SUCCESS`.

Frozen exact window: `1<=d<=7`, `0<=k<=5`, `0<=s<=min(d-1,k)`.

Required totals:
- 42 cells;
- 112 gap slices;
- 9,912 support objects;
- 190 fixed objects;
- 4,861 nonfixed two-cycles;
- 68 slices with fixed points;
- 44 slices without fixed points.

For each slice define
`H_(a,b,s)(q)=q^(-s(s-1)/2)[t^s]G_(a,b)(q,t)`.

Required exact identities:
1. `H(1)=|X_(a,b,s)|`;
2. `H(-1)=|Fix(J_s)|`;
3. direct fixed-object enumeration agrees with the parity/multinomial law;
4. `|X|=|Fix|+2*nonfixed_orbits`;
5. the unnormalized slice differs at `q=-1` by `(-1)^(s(s-1)/2)` and at least one frozen control must be negative before normalization;
6. more than one odd part among `(a-s,b-s,s)` forces both direct fixed count and `H(-1)` to zero.

Closed fixed-count candidate:
If at most one of `a-s`, `b-s`, `s` is odd,

`Fix = multinomial(floor((a+b-s)/2); floor((a-s)/2),floor((b-s)/2),floor(s/2))`.

Otherwise `Fix=0`.

Canonical implementation must derive `H(q)` from the earned #973 q-slice and enumerate support/fixed objects from the earned #976 involution surface.

Hostile implementation must independently enumerate words/marks and evaluate the parity/multinomial law without calling the canonical fixed-count helper.

Membranes:
`Q_MINUS_ONE_EVALUATION != PHYSICAL_NEGATIVE_FIELD_SIZE`
`C2_CYCLIC_SIEVING != TEMPORAL_PERIODICITY`
`ROOT_OF_UNITY_EVALUATION != RUNTIME_CLOCK`
`FIXED_POINT_COUNT != BASIS_FREE_FIXED_GEOMETRY`
`GAUSSIAN_MULTINOMIAL_CSP != NEW_GENERAL_CSP_THEOREM`
`FINITE_WINDOW_CSP != ASYMPTOTIC_SYMMETRY`
`SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY`

Sealed ⟐
