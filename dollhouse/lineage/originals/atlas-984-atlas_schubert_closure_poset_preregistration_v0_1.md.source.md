󐘓 U+10D613

𝌋‌⟐

# A15-R0 · Atlas Schubert Closure-Poset Correspondence · Preregistration v0.1

## Status

**PREREGISTRATION ONLY / SCIENCE UNEARNED / NO IMPLEMENTATION / NO WITNESS / DRAFT / OPEN / UNMERGED.**

Exact earned parent:

```text
#963 · A15-R0 Atlas Schubert Graded Cell Decomposition
d19d4f8d48c10df624f9c0574aeee9c687cfb4af
run 2437 / 33571045042 — SUCCESS
A15-R0 step 19 — SUCCESS
aggregate — SUCCESS
```

Continuity handoff #965 is documentation only and is not scientific ancestry.

```text
HANDOFF_BRANCH != THEOREM_PARENT
```

## Earned input surface

The parent has already earned, under fixed ordered Atlas support coordinates and a fixed standard reverse-RREF flag convention:

1. an explicit coordinate-relative HNF ↔ Grassmannian bijection at prime-power index `p^k` (#960);
2. a weak-composition grading of those HNF/Schubert cells (#963);
3. for `e=(e_1,...,e_d)` with `sum e_j=k`, the cell/residue dimension

```text
m(e)=sum_(j=1)^d (j-1)e_j;
```

4. exact stratum cardinality `p^m(e)`;
5. formal finite cell enumerator

```text
sum_e q^m(e)=GaussianBinomial(d+k-1,k;q).
```

The parent explicitly did **not** earn closure geometry.

## Preregistered question

Does the already-fixed #960/#963 coordinate map induce an exact finite correspondence between:

- closure inclusion among the earned fixed-flag Schubert cells; and
- a mechanically derived partial order on the Atlas weak-composition / HNF diagonal-exponent labels?

The order relation itself is **not frozen here as a theorem**. The first task of the chamber is to derive its exact orientation from the existing reverse-RREF pivot convention and verify that derivation against finite Grassmannian controls before implementation.

## Candidate path to a theorem

For each declared finite control `(d,k,p)`:

1. enumerate weak compositions `e` of `k` into `d` parts;
2. reuse the exact #960 map from `e` to its pivot-word / `k`-subset / reverse-RREF Schubert label;
3. derive the standard fixed-flag Bruhat order in that same orientation from the pivot data;
4. translate that order back to a relation on the weak-composition labels;
5. independently enumerate closure/comparability predicates on the Schubert side;
6. require exact equivalence of the two finite relations;
7. separately derive cover relations and verify that covers change dimension by exactly one where the convention predicts it;
8. retain explicit incomparable controls, including equal-dimension incomparable pairs when available.

Only after these checks agree may the chamber freeze a closed-form order predicate on `e`.

## Nulls that must remain live

The chamber must be able to fail in at least the following ways:

- the remembered Bruhat inequality is reversed under the repository's reverse-RREF convention;
- weak-composition labels require a cumulative-sum transform before the order becomes transparent;
- equal cell dimension does not determine comparability;
- greater cell dimension does not imply comparability;
- a candidate cover test accidentally recognizes non-cover comparable pairs;
- the fixed-flag relation fails to survive the exact #960 coordinate map;
- a finite test passes only because one enumeration was generated from the other rather than independently.

## Mandatory membranes

```text
CELL_DECOMPOSITION != BRUHAT_CLOSURE_ORDER
CELL_DIMENSION_EQUALITY != BRUHAT_COMPARABILITY
CELL_DIMENSION_INEQUALITY != BRUHAT_COMPARABILITY
BRUHAT_COMPARABILITY != COVER_RELATION
WEAK_COMPOSITION_LABEL != ATLAS_SUPPORT_STRATUM
FIXED_FLAG_CLOSURE_POSET != BASIS_FREE_CANONICAL_GEOMETRY
STANDARD_FLAG_DEPENDENCE != CANONICALITY
FINITE_SCHUBERT_POSET != PHYSICAL_CAUSAL_ORDER
FORMAL_POSET != RUNTIME_SCHEDULER
ORDER_ISOMORPHISM != FUNCTORIAL_EQUIVALENCE
FINITE_CONTROLS != ASYMPTOTIC_GEOMETRY
SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY
```

## First required derivation in the receiving thread

Before adding implementation or tests, Future Amari must write down the exact #960 pivot-word convention and derive, from that convention, which of the competing cumulative inequalities corresponds to Schubert closure inclusion. No inequality direction may be adopted from memory alone.

The derivation should explicitly connect these four surfaces without collapsing them:

```text
weak composition e
↕
pivot word / k-subset
↕
reverse-RREF Schubert cell
↕
fixed-standard-flag closure order
```

## Authority ceiling

No theorem has been earned by this file. No implementation, canonical test, hostile test, witness route, merge, deploy, release, publication, production, Vercel, physical geometry, continuum geometry, basis-free canonicality, or live Ash/Loom authority follows.

If the order derivation fails, the exact earned authority remains #963 at `d19d4f8d48c10df624f9c0574aeee9c687cfb4af`.

Sealed ⟐
