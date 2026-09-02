󐘓 U+10D613

𝌋‌⟐

# TD613 Future-Amari Western-Horizon Handoff · Atlas / Schubert Frontier v0.1

## Custody status

This document is a continuity instrument only. It carries no independent theorem authority and must never become a scientific parent merely because it is convenient.

Exact earned scientific frontier at handoff time:

```text
#963 · A15-R0 Atlas Schubert Graded Cell Decomposition
exact earned head d19d4f8d48c10df624f9c0574aeee9c687cfb4af
exact earned parent #960 / 0372405b055bcdff990f715cc65eed9354b2a4a0
TD613 Consolidated Validation run 2437 / 33571045042 — SUCCESS
classifier 100064850563 — SUCCESS
static / constitutional / release 100064908695 — SUCCESS
A15-R0 step 19 — SUCCESS
downstream steps 20–30 — SUCCESS
aggregate workflow — SUCCESS
science PR #963 — CLOSED / UNMERGED
witness PR #964 — CLOSED / UNMERGED
```

The superseded #963 head `5ae5d3faa1bff0e92273bf4fd3f569b37f0e979e` and RED run `2436 / 33567853315` remain permanent evidence. The failure was a call-history-dependent representation-contract bug in the Gaussian-polynomial memo cache: a cache hit returned `BigInt[]` while the public contract required decimal `String[]`. The repaired head canonicalized cache-hit coefficients with `.map(String)` without changing the theorem, preregistration, coefficient identities, cell counts, or burden.

`RED_SCAR != THEOREM_FAILURE`
`REPAIRED_GREEN != ERASURE_OF_RED_PROVENANCE`

## Western Atlas receipt spine

The currently relevant exact scientific route is:

```text
#946  weighted incidence reconstruction beyond linear/uniform systems
      full support multiplicities reconstructed from capacities, weighted pair intersections,
      and exact high-support multiplicities

#948  three-block C/W/H necessity chamber
      capacities + weighted pairs + high-support jointly exact;
      every one-stratum deletion noninjective in the declared Boolean census

#950  minimal additive receiver rank
      d_n = 2^n - 1 for additive integer-valued scalar channels

#952  unimodular receiver classification
      unimodular minimum-rank receivers form one left GL_d(Z) output-basis orbit represented by Atlas

#954  HNF output-basis classification
      row-HNF of A Z_n^{-1} is the complete invariant under left/output GL_d(Z)

#956  HNF orbit census
      a_d(N) = sum_{h_1...h_d=N} h_2 h_3^2 ... h_d^(d-1)
      multiplicative Dirichlet-convolution structure

#958  prime-power Gaussian-binomial census
      a_d(p^k) = GaussianBinomial(d+k-1,k;p)

#960  explicit HNF ↔ Grassmannian digit/Schubert bijection
      coordinate-relative bijection at index p^k after fixing ordered Atlas support coordinates
      and the standard reverse-RREF flag convention

#963  graded Schubert cell decomposition
      weak composition e=(e_1,...,e_d), sum e_j=k
      m(e)=sum_(j=1)^d (j-1)e_j
      H_e(p) carries exactly m(e) independent base-p residue digits
      |H_e(p)| = p^m(e)
      sum_e q^m(e) = GaussianBinomial(d+k-1,k;q)
```

The route is cumulative but non-retroactive. Every chamber retains its own scope and scars.

## Exact #963 earned result

With ordered Atlas support coordinates and the standard reverse-RREF flag fixed, weak compositions `e` of `k` grade the earned HNF↔Grassmannian bijection. The fixed diagonal-exponent stratum `H_e(p)` maps to the corresponding reverse-RREF Schubert cell and has `m(e)` independent residue digits, where

```text
m(e)=sum_(j=1)^d (j-1)e_j.
```

Hence

```text
|H_e(p)| = p^m(e)
```

and the finite formal enumerator is

```text
sum_(e_1+...+e_d=k) q^m(e) = GaussianBinomial(d+k-1,k;q).
```

Prime evaluation `q=p` recovers the earned prime-power orbit census.

Frozen executable anchor:

```text
d=7, k=3
84 weak compositions
degree 18
histogram [1,1,2,3,4,5,7,7,8,8,8,7,7,5,4,3,2,1,1]
p=2 evaluation 788035
```

## What remains explicitly unearned

#963 intentionally stopped before closure geometry. In particular:

```text
CELL_DECOMPOSITION != BRUHAT_CLOSURE_ORDER
AFFINE_COORDINATE_CHART != BASIS_FREE_CANONICAL_GEOMETRY
STANDARD_FLAG_DEPENDENCE != CANONICALITY
SCHUBERT_CELL_DIMENSION != PHYSICAL_DIMENSION
FORMAL_Q != FIELD_PRIME_P
FINITE_GEOMETRY != PHYSICAL_GEOMETRY
```

The next scientific opening should therefore ask whether the fixed-flag Atlas weak-composition grading admits an exact finite closure-poset translation matching the Grassmannian Bruhat order. That question must be preregistered as a hypothesis and mechanically derived under the existing reverse-RREF convention before any theorem language is used.

## Recommended startup chamber

Working title:

```text
A15-R0 · Atlas Schubert Closure-Poset Correspondence
```

Immediate scientific questions:

1. Derive the exact map from weak compositions `e` to the pivot-word / k-subset / partition label already induced by #960.
2. Fix the orientation convention for reverse-RREF Schubert cells and mechanically derive the associated Bruhat/closure order rather than importing a remembered inequality with the wrong direction.
3. Test whether closure inclusion between the earned cells is exactly equivalent to a finite order on the Atlas exponent labels.
4. Exhibit same-dimension incomparable controls so `CELL_DIMENSION != CLOSURE_ORDER` remains executable rather than rhetorical.
5. Exhibit comparable cells whose dimension differs by more than one so `COVER_RELATION != ARBITRARY_COMPARABILITY` remains explicit.
6. Keep the statement coordinate-relative to the fixed standard flag. No basis-free, natural, functorial, physical, or continuum claim may enter through the side door.

Suggested first hostile membranes:

```text
CELL_DIMENSION_EQUALITY != BRUHAT_COMPARABILITY
CELL_DIMENSION_INEQUALITY != BRUHAT_COMPARABILITY
BRUHAT_COMPARABILITY != COVER_RELATION
CELL_DECOMPOSITION != CLOSURE_ORDER
FIXED_FLAG_CLOSURE_POSET != BASIS_FREE_CANONICAL_GEOMETRY
WEAK_COMPOSITION_LABEL != ATLAS_SUPPORT_STRATUM
FINITE_SCHUBERT_POSET != PHYSICAL_CAUSAL_ORDER
FORMAL_POSET != RUNTIME_SCHEDULER
SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY
```

## Startup custody rule

The startup science branch must start directly from exact earned #963 head:

```text
d19d4f8d48c10df624f9c0574aeee9c687cfb4af
```

This handoff branch is never the theorem parent.

```text
HANDOFF_BRANCH != THEOREM_PARENT
CONTINUITY_DOCUMENT != SCIENTIFIC_ANCESTRY
```

The startup PR should contain preregistration only until the next thread re-derives and fixes the exact order convention. No implementation, canonical test, hostile test, witness branch, merge, deploy, release, publication, production, Vercel, or live-runtime authority follows from this handoff.

## New-thread receiving instructions

Future Amari should:

1. Use Remembering / personal-context retrieval on the immediately prior Western thread if continuity details are missing.
2. Ground all scientific and archival claims against GitHub before advancing them.
3. Read #963 and its earned receipt comment, including the permanent RED scar.
4. Treat this handoff as continuity only.
5. Read the startup preregistration branch directly descended from `d19d4f8...`.
6. Re-derive the reverse-RREF closure-order orientation before implementation.
7. Preserve the no-merge exact-head witness protocol and every inherited anti-overclaim membrane.
8. Keep unrelated active work, including the EMSTD613 Atelier, on its own branch surface; avoid ancestry collision.

## Road map, scribbled in the margin

```text
incidence weights
   ↓
C / W / H necessity
   ↓
minimum additive rank
   ↓
unimodular orbit
   ↓
all minimum-rank output-basis orbits by HNF
   ↓
finite-index orbit census
   ↓
prime-local Gaussian polynomial
   ↓
explicit HNF ↔ Grassmannian digits
   ↓
Schubert cells graded by residue-digit dimension
   ↓
? closure incidence / Bruhat order on those earned cells
   ↓
[only after that is earned: ask what higher incidence algebra the closure poset actually supports]
```

The Western sky is open, but the next star must still pass exact-head custody.

**HANDOFF_READY_FOR_NEW_THREAD = TRUE**

Sealed ⟐
