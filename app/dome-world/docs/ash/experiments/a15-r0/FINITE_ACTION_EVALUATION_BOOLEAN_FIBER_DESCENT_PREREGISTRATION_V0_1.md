# A15-R0 · Finite Action-Evaluation Boolean Fiber Descent / Coordinate-Irreducibility Preregistration v0.1

Status: PREREGISTERED BEFORE THEOREM IMPLEMENTATION. Research-only. No merge/deploy/release/publication/Vercel authority.

Exact earned scientific parent:

`#898 / ec837736399e2b5e65c281c1fc88f18cc99709ad / TD613 Consolidated Validation run 2401 SUCCESS`

## Fixed inherited finite object

Let `Q={A,B,T,M,R}` be the earned five-role task topology and let `M_diag` be the complete earned set of 128 continuous/order-preserving task endomorphisms from #876/#898.

For each calibration subset `S subseteq Q`, define the evaluation map

`E_S(f)=f|_S`

and equivalence relation / action-fiber partition

`f ~_S g iff E_S(f)=E_S(g)`.

Write `Pi_S` for the corresponding partition/equivalence relation on the 128 actions.

Define calibration closure

`cl_M(S)={q in Q : for all f,g in M_diag, f|_S=g|_S implies f(q)=g(q)}`.

Define action-evaluation rank

`r_eval=min{|S| : E_S is injective on M_diag}`.

Partition refinement uses the equivalence-relation order: a finer partition has the smaller equivalence relation.

## Frozen theorem targets

1. Exactly 32 calibration subsets are enumerated and produce exactly 32 distinct evaluation partitions.
2. `cl_M(S)=S` for every one of the 32 subsets.
3. Therefore no calibration coordinate is functionally determined by any subset omitting it.
4. Every one of the 80 Boolean Hasse additions `S -> S union {q}` strictly refines the action partition.
5. The map `S -> Pi_S` is an order-reversing embedding of the Boolean lattice `B5` into the equivalence-relation lattice on the 128 actions.
6. Stronger frozen lattice target, for all 1,024 ordered pairs `(S,T)`:
   - `Pi_(S union T) = Pi_S meet Pi_T` where meet is relation intersection;
   - `Pi_(S intersect T) = Pi_S join Pi_T` where join is equivalence closure of relation union.
   Thus the 32 evaluation partitions form an order-reversing Boolean sublattice isomorphic to `B5`.
7. Exactly one subset is action-identifying: `Q` itself. Hence `r_eval=5`.
8. Combining only already-earned #898 ranks with this new finite result gives the strict tri-rank ladder:

`r_sep=1 < r_eval=5 < r_gen^atom=11`.

This means state discrimination, arbitrary-action identification, and full action generation are three non-equivalent finite sufficiency notions in this fixture.

## Frozen 32-subset partition census

`subset : class_count / maximum_fiber`

- EMPTY: 1 / 128
- A: 5 / 84
- B: 5 / 44
- T: 5 / 36
- M: 5 / 44
- R: 5 / 84
- AB: 19 / 32
- AT: 10 / 36
- AM: 10 / 21
- AR: 10 / 48
- BT: 19 / 16
- BM: 24 / 14
- BR: 10 / 21
- TM: 19 / 16
- TR: 10 / 36
- MR: 19 / 32
- ABT: 37 / 16
- ABM: 42 / 8
- ABR: 26 / 12
- ATM: 26 / 9
- ATR: 16 / 16
- AMR: 26 / 12
- BTM: 72 / 4
- BTR: 26 / 9
- BMR: 42 / 8
- TMR: 37 / 16
- ABTM: 98 / 4
- ABTR: 46 / 4
- ABMR: 64 / 3
- ATMR: 46 / 4
- BTMR: 98 / 4
- ABTMR: 128 / 1

## Frozen four-coordinate deletion fibers

Omit A / observe BTMR:
- 98 classes
- max fiber 4
- spectrum `1:76, 2:18, 4:4`
- 22 ambiguous classes / 52 actions in ambiguous classes / 42 colliding unordered action pairs.

Omit B / observe ATMR:
- 46 classes
- max fiber 4
- spectrum `1:6, 2:19, 4:21`
- 40 ambiguous classes / 122 actions in ambiguous classes / 145 colliding unordered action pairs.

Omit T / observe ABMR:
- 64 classes
- max fiber 3
- spectrum `1:16, 2:32, 3:16`
- 48 ambiguous classes / 112 actions in ambiguous classes / 80 colliding unordered action pairs.

Omit M / observe ABTR:
- 46 classes
- max fiber 4
- spectrum `1:6, 2:19, 4:21`
- 40 ambiguous classes / 122 actions in ambiguous classes / 145 colliding unordered action pairs.

Omit R / observe ABTM:
- 98 classes
- max fiber 4
- spectrum `1:76, 2:18, 4:4`
- 22 ambiguous classes / 52 actions in ambiguous classes / 42 colliding unordered action pairs.

Frozen consequence: every coordinate is necessary for total action identification, while deletion harm is strongly anisotropic.

## Frozen execution burden

- 3,125 self-functions.
- 78,125 order-relation preservation checks.
- 128 continuous endomorphisms.
- 32 calibration subsets.
- 4,096 subset/action signature evaluations.
- 32 closure computations across 5 coordinates.
- 80 Hasse-cover strict-refinement checks.
- 1,024 ordered subset-pair order/refinement checks.
- 1,024 ordered meet identities.
- 1,024 ordered join identities.
- 31 proper-subset noninjectivity checks.
- 5 four-coordinate deletion fiber audits.

## Mandatory membranes

`ACTION_EVALUATION_PARTITION != TASK_TOPOLOGY`
`BOOLEAN_EVALUATION_SUBLATTICE != BOOLEAN_TASK_SPACE`
`CALIBRATION_COORDINATE != PHYSICAL_SENSOR`
`ACTION_EVALUATION_RANK != SHANNON_BIT_LENGTH`
`ACTION_EVALUATION_RANK != ACTION_GENERATING_RANK`
`ACTION_EVALUATION_RANK != STATE_SEPARATION_RANK`
`ACTION_IDENTIFICATION != SOURCE_IDENTIFICATION`
`CONTINUOUS_TASK_ENDOMORPHISM != MODEL_WEIGHT_UPDATE`
`FINITE_ACTION_MONOID != PHYSICAL_DYNAMICS`
`COORDINATE_IRREDUCIBILITY != UNIVERSAL_FEATURE_MINIMALITY`
`STRICT_PARTITION_REFINEMENT != CAUSAL_INFORMATION_GAIN`
`FIBER_CARDINALITY != ENTROPY`
`BOOLEAN_LATTICE_EMBEDDING != QUANTUM_LOGIC`
`CALIBRATION_APERTURE != RETENTION_POLICY`
`FULL_FIVE_POINT_CALIBRATION != UNIVERSAL_EXPERIMENTAL_SUFFICIENCY`
`WITNESS_ROUTING != SCIENTIFIC_ANCESTRY`

A RED leaves scientific authority at exact earned #898. A GREEN exact-head consolidated witness may earn only this finite declared theorem.

Sealed ⟐