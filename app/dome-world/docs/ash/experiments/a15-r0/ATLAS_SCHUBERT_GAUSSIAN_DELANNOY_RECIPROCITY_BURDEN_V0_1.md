# A15-R0 · Atlas Schubert Gaussian–Delannoy Reciprocity Burden v0.1

Status: FROZEN EXECUTABLE BURDEN / THEOREM UNEARNED.

Parent: `#973 / 235770c9984c74e0b518fe69577bf1ceb1404fd3 / run 2450 SUCCESS`.

Preserved failed preregistration: v0.1 reverse+complement candidate exits fixed `(a,b)` cells when `a != b`.

Corrected candidate: `J(w,u)=(reverse(u), reverse(w))` with transported mark starts `p -> n-2-p`.

Frozen exact window: `1<=d<=7`, `0<=k<=5`.

Required totals:
- formal cells: 42;
- earned marked-descent support objects: 9,912;
- exact fixed objects under J: 190;
- fixed-cell preservation failures: 0;
- support preservation failures: 0;
- transported-mark failures: 0;
- gap preservation failures: 0;
- involution failures: 0;
- lower-rank complement failures: 0;
- upper-rank complement failures: 0;
- slice histogram reciprocity failures: 0;
- fixed-point rank failures: 0.

The implementation must derive support objects from binary words and marked `10` descents, not from the closed q-polynomial coefficients.

An independent hostile test must reconstruct transformed intervals endpoint-first and compare them against the earned #969/#971 support condition rather than trusting the canonical involution helper.

Hostile controls:
1. reverse+complement must be shown to leave the fixed cell on at least one asymmetric cell;
2. `reverse(lower)` as new lower endpoint must fail support/rank complement on a nontrivial control;
3. endpoint reversal without swapping endpoint roles must fail;
4. mark offset `n-1-p` must fail exact transported descent validation;
5. coefficientwise palindromicity alone does not count as involution evidence.

Membranes:
`FAILED_PREREGISTRATION != RED_CONSTITUTIONAL_WITNESS`
`POLYNOMIAL_RECIPROCITY != TERM_BY_TERM_INVOLUTION`
`ENDPOINT_REVERSAL != PHYSICAL_TIME_REVERSAL`
`FIXED_FLAG_INVOLUTION != CANONICAL_GEOMETRIC_DUALITY`
`FINITE_PAIRING != CAUSAL_PAIRING`
`SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY`

Sealed ⟐
