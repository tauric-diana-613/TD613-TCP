# A15-R0 · Atlas HNF–Schubert Digit Bijection · Burden v0.1

Parent: exact earned #958 / `879f68feb64214259f10b70cc194eb43f659ff55`.

## Required executable claims

1. Validate row-HNF input at determinant `p^k` and recover unique exponent composition `e`.
2. Construct the stars-and-bars pivot word `1^e1 0 1^e2 ... 0 1^ed`.
3. Expand every HNF residue into exact base-p digits and place them into the corresponding pre-pivot nonpivot reverse-RREF coordinates.
4. Validate the resulting reverse-RREF representative over `F_p`.
5. Invert the map by recovering `e` from pivot blocks and recombining digits into HNF residues.
6. Prove exact two-sided roundtrip on the frozen exhaustive window:
   - `p=2`, `d=1..4`, `k=0..3`;
   - `p=3`, `d=1..3`, `k=0..3`.
   This window contains exactly 28 `(p,d,k)` cells and 3210 orbit/Grassmannian points.
7. For each frozen cell, require unique image keys and count equality with the earned #958 Gaussian-binomial count.
8. Hostile independently enumerate reverse-RREF Grassmannian representatives from pivot subsets and field-coordinate assignments, then require inverse/forward roundtrip into valid HNFs.
9. Preserve an explicit non-naive-reduction scar: distinct index-`p^k` HNFs with identical whole-matrix reduction mod `p` must map to distinct Grassmannian points when higher base-p digits differ.
10. Preserve all parent membranes and the new coordinate-dependence membranes.

## Required exact anchor

At `p=2,d=7,k=3`, the map type has domain/codomain cardinality `788035=[9 choose 3]_2`; exhaustive enumeration of that large cell is not required. A deterministic nontrivial HNF sample must roundtrip exactly.

## Nonclaims

No basis-free canonicality, no natural transformation, no functorial equivalence, no claim that receiver dynamics live over `F_p`, no global composite-index bijection, no physical interpretation of Grassmannian coordinates, and no claim that the construction is naive matrix reduction modulo `p`.

Expected failures: `0`.

Sealed ⟐