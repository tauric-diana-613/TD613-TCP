# A15-R0 · Atlas Schubert Reciprocity Cyclic Sieving Preregistration v0.1

Status: PREREGISTRATION ONLY / THEOREM UNEARNED / DRAFT / OPEN / UNMERGED.

Exact earned scientific parent:
`#976 / 5cdbbd3713ccf5798523ff96d6db75df0367fadd / run 2451 / 33594016328 SUCCESS / A15-R0 step 19 SUCCESS / downstream 20–30 SUCCESS / CLOSED / UNMERGED`.

## Question

Does the earned order-two fixed-cell involution `J_s` on the gap-s Gaussian–Delannoy support realize a genuine C2 cyclic-sieving phenomenon after removal of the earned triangular q-shift?

For `a=d-1`, `b=k`, fixed gap `s`, let

`C_(a,b,s)(q) = [t^s] G_(a,b)(q,t)`

from earned #973, and define the normalized polynomial

`H_(a,b,s)(q) = q^(-s(s-1)/2) C_(a,b,s)(q)`.

By #973,

`H_(a,b,s)(q) = GaussianMultinomial_q(a+b-s; a-s,b-s,s)`.

Let `X_(a,b,s)` be the earned #976 support objects of gap s and let `C2=<J_s>` act by the earned involution.

## Candidate cyclic-sieving identities

Require exactly:

`H(1) = |X|`,

`H(-1) = |Fix(J_s)|`.

Since the acting group has order two, these two root-of-unity evaluations are the complete cyclic-sieving requirement for `(X,C2,H)`.

The theorem must be witnessed object-first, not inferred only from Gaussian-multinomial folklore.

## Candidate closed fixed-point formula

The q=-1 Gaussian-multinomial specialization predicts:

- fixed count is zero whenever more than one of the parts `a-s`, `b-s`, `s` is odd;
- otherwise

`|Fix(J_s)| = multinomial(floor((a+b-s)/2); floor((a-s)/2), floor((b-s)/2), floor(s/2))`.

The executable burden must verify this formula against the exact earned #976 fixed objects for every frozen `(d,k,s)` slice.

## Required controls

1. `H(1)` must equal the exact gap-s support census from #976.
2. `H(-1)` must equal the exact fixed-object census from direct endpoint/mark equality under `J_s`.
3. The closed parity/multinomial formula must equal both `H(-1)` and the direct fixed-object census.
4. The unnormalized slice `C_s(-1)` must generally differ by the sign `(-1)^(s(s-1)/2)`; the assay must include a control where forgetting normalization gives a negative value.
5. A slice with more than one odd part must give zero fixed objects and zero `H(-1)`.
6. A nontrivial slice with fixed objects must demonstrate exact orbit decomposition `|X| = |Fix| + 2*(number of nonfixed J-orbits)`.
7. The theorem remains finite-window / fixed-flag / combinatorial.

## Hostile membranes

`Q_MINUS_ONE_EVALUATION != PHYSICAL_NEGATIVE_FIELD_SIZE`
`C2_CYCLIC_SIEVING != TEMPORAL_PERIODICITY`
`ROOT_OF_UNITY_EVALUATION != RUNTIME_CLOCK`
`FIXED_POINT_COUNT != BASIS_FREE_FIXED_GEOMETRY`
`GAUSSIAN_MULTINOMIAL_CSP != NEW_GENERAL_CSP_THEOREM`
`FINITE_WINDOW_CSP != ASYMPTOTIC_SYMMETRY`
`SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY`

No merge, deploy, release, publication, Vercel, physical time, causal periodicity, negative field interpretation, basis-free geometry, or general cyclic-sieving claim.

Sealed ⟐
