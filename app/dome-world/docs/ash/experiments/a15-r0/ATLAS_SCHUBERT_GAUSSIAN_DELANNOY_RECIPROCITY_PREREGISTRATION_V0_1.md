# A15-R0 · Atlas Schubert Gaussian–Delannoy Reciprocity Preregistration v0.1

Status: PREREGISTRATION ONLY / THEOREM UNEARNED / DRAFT / OPEN / UNMERGED.

Exact earned scientific parent:
`#973 / 235770c9984c74e0b518fe69577bf1ceb1404fd3 / run 2450 / 33590887847 SUCCESS / A15-R0 step 19 SUCCESS / downstream 20–30 SUCCESS / CLOSED / UNMERGED`.

## Question

Does the earned q-reciprocity of each t-slice admit an exact Atlas-level involution on nonzero Möbius intervals, rather than remaining a coefficient identity only?

For fixed rectangle parameters `a=d-1`, `b=k`, fixed gap `s`, and a nonzero Möbius interval `(f,e)`, seek an involution `J_s` on the gap-s support such that

`gap(J_s(f,e)) = s`,

`r(lower(J_s(f,e))) = ab - s - r(f)`,

and `J_s^2 = id`.

If such an involution exists, then the earned slice reciprocity

`C_s(q) = q^(ab-s) C_s(q^-1)`

is witnessed term-by-term by Atlas support pairing, not merely by Gaussian-multinomial palindromicity.

## Candidate construction

Use the binary pivot-word rectangle model inherited from #971/#973. A gap-s survivor is a word together with s pairwise nonadjacent marked `10` descents. Define the candidate complement pairing by 180-degree rectangle complement on the underlying lattice path, together with transport of each marked descent to the complementary marked descent in the reversed/complemented word.

Equivalent marked-word map candidate:

1. reverse the binary word;
2. complement bits `0 <-> 1`;
3. transport each marked `10` pair through the reversal/complement map;
4. decode the result back to the Atlas interval using the earned #971 marked-descent correspondence.

The candidate must remain inside the same `(a,b,s)` cell.

## Required identities

For every frozen nonzero interval:

- exact support preservation;
- exact gap preservation;
- involution: `J_s(J_s(I)) = I`;
- lower-rank complement: `r_low(I) + r_low(J_s(I)) = ab - s`;
- fixed-point characterization, when present, occurs only at `2 r_low = ab-s`;
- coefficient reciprocity follows by direct orbit summation.

## Hostile controls

The assay must reject weaker operations that preserve counts but not interval structure:

- reverse only;
- complement only;
- endpointwise rectangle complement without marked-descent transport;
- any map that preserves `q=1` support counts but breaks lower-rank complement;
- any map that changes the gap `s`;
- any map that swaps rectangle parameters rather than staying inside the fixed `(a,b)` cell.

Independent checks must compare:

1. marked-word construction;
2. interval encode/decode round-trip;
3. direct rank arithmetic from earned #963 grading;
4. coefficientwise reciprocity from earned #973 polynomial slices.

## Membranes

`POLYNOMIAL_RECIPROCITY != TERM_BY_TERM_INVOLUTION`
`PATH_COMPLEMENT != PHYSICAL_TIME_REVERSAL`
`RECTANGLE_COMPLEMENT != BASIS_FREE_DUALITY`
`FIXED_FLAG_INVOLUTION != CANONICAL_GEOMETRIC_DUALITY`
`SUPPORT_PAIRING != CAUSAL_PAIRING`
`FINITE_INVOLUTION != ASYMPTOTIC_SYMMETRY`
`SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY`

No merge, deploy, release, publication, Vercel, physical duality, causal reversal, time reversal, probability interpretation, or basis-free canonicality follows.

Sealed ⟐
