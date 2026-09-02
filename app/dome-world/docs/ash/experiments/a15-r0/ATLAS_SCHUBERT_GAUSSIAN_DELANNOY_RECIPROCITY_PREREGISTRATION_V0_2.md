# A15-R0 · Atlas Schubert Gaussian–Delannoy Reciprocity Preregistration v0.2

Status: CORRECTED PREREGISTRATION ONLY / THEOREM UNEARNED / DRAFT / OPEN / UNMERGED.

Exact earned scientific parent:
`#973 / 235770c9984c74e0b518fe69577bf1ceb1404fd3 / run 2450 / 33590887847 SUCCESS`.

## Preserved failed v0.1 candidate

The v0.1 proposal `reverse(word) + complement bits` is rejected before implementation because it swaps zero/one multiplicities and therefore exits the fixed `(a,b)` cell whenever `a != b`.

`FAILED_PREREGISTRATION != RED_CONSTITUTIONAL_WITNESS`
`CANDIDATE_REJECTION_BEFORE_IMPLEMENTATION != THEOREM_REPAIR`

The v0.1 file remains preserved unchanged.

## Corrected candidate involution

Represent a nonzero Möbius interval by its earned #971 marked-descent object:

- lower pivot word `w`, with `a` zeros and `b` ones;
- a disjoint marked set `M` of `10` descents;
- upper pivot word `u = swap_M(w)`, obtained by changing every marked `10` to `01`;
- gap `s = |M|`.

Define

`J(w,u) = (reverse(u), reverse(w))`.

Equivalently on marked words:

- `lower' = reverse(upper)`;
- a marked pair beginning at position `p` maps to a marked `10` beginning at `n-2-p`, where `n=a+b`;
- `upper' = reverse(lower)`.

No bit complement occurs.

## Required exact identities

For every frozen nonzero interval in `1<=d<=7`, `0<=k<=5`:

1. fixed-cell preservation: `lower'` and `upper'` each retain exactly `a` zeros and `b` ones;
2. support preservation: `lower' -> upper'` is again a nonzero Möbius interval;
3. marked-descent transport is exact;
4. gap preservation: `s(J(I))=s(I)`;
5. involution: `J(J(I))=I` endpointwise and markwise;
6. lower-rank complement:
   `r(lower(I)) + r(lower(J(I))) = ab-s`;
7. upper-rank complement:
   `r(upper(I)) + r(upper(J(I))) = ab+s`;
8. coefficientwise q-reciprocity follows by direct orbit census in each `(d,k,s)` slice;
9. fixed points may occur only when `2*r(lower)=ab-s` and must satisfy exact endpoint reversal conditions.

The rank law follows mechanically from the binary-word identity

`r(reverse(x)) = ab-r(x)`

combined with `r(upper)=r(lower)+s`.

## Independent burden

The executable assay must enumerate all 9,912 earned #971 marked-descent support objects and verify the involution directly, then independently reconstruct each t-slice histogram from paired lower ranks and compare coefficientwise with the earned #973 slice.

Hostile controls must demonstrate failure of:

- v0.1 reverse+complement;
- reverse(lower) used as the new lower endpoint;
- endpoint reversal without swapping endpoint roles;
- mark transport using `n-1-p` instead of `n-2-p`;
- transpose-cell escape disguised as reciprocity.

## Membranes

`FAILED_PREREGISTRATION != RED_CONSTITUTIONAL_WITNESS`
`POLYNOMIAL_RECIPROCITY != TERM_BY_TERM_INVOLUTION`
`ENDPOINT_REVERSAL != PHYSICAL_TIME_REVERSAL`
`RECTANGLE_COMPLEMENT != BASIS_FREE_DUALITY`
`FIXED_FLAG_INVOLUTION != CANONICAL_GEOMETRIC_DUALITY`
`SUPPORT_PAIRING != CAUSAL_PAIRING`
`FINITE_INVOLUTION != ASYMPTOTIC_SYMMETRY`
`SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY`

No merge, deploy, release, publication, Vercel, physical time reversal, causal reversal, basis-free duality, probability interpretation, or asymptotic claim.

Sealed ⟐
