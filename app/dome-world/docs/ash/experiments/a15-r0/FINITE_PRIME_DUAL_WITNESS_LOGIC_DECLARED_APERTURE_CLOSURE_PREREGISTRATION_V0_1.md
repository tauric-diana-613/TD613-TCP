# A15-R0 · Finite Prime-Dual Witness Logic / Declared-Aperture Closure

Status: **PREREGISTERED BEFORE CHILD IMPLEMENTATION / THEOREM UNEARNED**.

Exact earned scientific parent: **#892 / `5e1c459bccd58ba89e6a218198e69d8d1518424e` / TD613 Consolidated Validation run 2397 / 33327765320 SUCCESS**.

#889/#891/#893 are witness-routing only where applicable and carry zero theorem ancestry. #890/#891 remain quarantined outside this lineage.

## Question

For each earned finite witness class with declared witness universe `U`, define the inherited-origin identification predicate on selected families `W subseteq U` by

```text
I(W)=1  iff  the residual transport set is {id}.
```

#888 earned that this is exactly the transport-hypergraph transversal predicate. #892 earned that the inclusion-minimal identifying families and the inclusion-minimal unlabelled transport-obstruction clutter are blocker duals.

This chamber asks whether those two antichains are exact, irredundant prime normal forms for the **entire declared finite origin-identification truth surface**, and therefore whether further enumeration of the same witness-family lattice can add any new origin-identification truth value.

## Frozen objects

For each declared class `c`:

- `U_c`: its frozen #888/#892 witness universe.
- `E_c`: the #892 minimal unlabelled transport-obstruction clutter.
- `M_c`: the #888/#892 inclusion-minimal inherited-origin-identifying witness families.
- `I_c(W)`: the earned inherited-origin identification truth value for `W subseteq U_c`.

No witness is added, removed, renamed, reweighted, or given new semantics in this chamber.

## Preregistered theorem candidate

For every declared class and every `W subseteq U`:

```text
I(W)
  = OR_{M in M} [M subseteq W]
  = AND_{E in E} [W intersects E].
```

Equivalently, with Boolean variables `x_w=1 iff w in W`:

```text
I(x)
  = OR_{M in M} AND_{w in M} x_w
  = AND_{E in E} OR_{w in E} x_w.
```

The first expression is the monotone minimal-success DNF. The second is the monotone minimal-obstruction CNF.

Because `M=b(E)` and `E=b(M)` are antichains, the candidate further requires both forms to be irredundant:

1. For each `M in M`, deleting the DNF term `M` must change the truth value at `W=M`.
2. For each `E in E`, deleting the CNF clause `E` must change the truth value at `W=U\E`.

The CNF witness is valid only if `U\E` intersects every other clutter edge; the child must verify this extensionally rather than assume it.

## Canonical finite closure claim

If all preregistered equalities and irredundancy witnesses pass, then within the fixed declared tuple

```text
(F, G action, inherited custody point, U, origin-identification question)
```

the entire finite Boolean truth surface is determined by either antichain alone:

```text
M  <blocker duality>  E.
```

Therefore any further brute-force enumeration of **subfamilies of the same U for the same origin-identification predicate** is mathematically redundant with respect to truth values of `I`.

This is the proposed **declared-aperture rest certificate**. It is deliberately local and finite.

## Required execution burden

The child must audit all frozen family rows represented by the four declared classes, with the exact inherited total expected from #892:

```text
1,049,664 selected witness families.
```

For every family it must compare:

- parent earned identification truth,
- prime DNF evaluation,
- prime CNF evaluation.

All mismatch counters must be zero.

It must also produce one explicit irredundancy witness for every minimal DNF term and every minimal CNF clause and require zero failed witnesses.

## Independent hostile requirement

The hostile path must not trust the child normal-form evaluator. Before importing the child it must independently rebuild the finite predicate from earned parent data and independently evaluate the two normal forms or an equivalent dual certificate. It must compare exact per-class counts and mismatch ledgers.

## Preregistered laws if exact-head witnessed

```text
DECLARED_ORIGIN_IDENTIFICATION_TRUTH_EQUALS_MINIMAL_SUCCESS_DNF
DECLARED_ORIGIN_IDENTIFICATION_TRUTH_EQUALS_MINIMAL_OBSTRUCTION_CNF
MINIMAL_SUCCESS_DNF_AND_MINIMAL_OBSTRUCTION_CNF_ARE_BLOCKER_DUAL
PRIME_DUAL_FORMS_ARE_IRREDUNDANT_ON_THE_DECLARED_FINITE_WITNESS_UNIVERSE
EITHER_PRIME_ANTICHAIN_DETERMINES_THE_COMPLETE_DECLARED_ORIGIN_IDENTIFICATION_TRUTH_SURFACE
FURTHER_SUBFAMILY_ENUMERATION_OF_THE_SAME_DECLARED_APERTURE_CANNOT_ADD_NEW_ORIGIN_IDENTIFICATION_TRUTH_VALUES
```

## Mandatory membranes / nonclaims

```text
FINITE_DECLARED_APERTURE_CLOSURE != UNIVERSAL_SCIENTIFIC_COMPLETENESS
PRIME_DUAL_IDENTIFICATION_LOGIC != COMPLETE_WITNESS_SEMANTICS
BLOCKER_DUAL_RECOVERY != TRANSPORT_LABEL_RECOVERY
BLOCKER_RECONSTRUCTION_OF_OBSTRUCTIONS != CANONICAL_RECONSTRUCTION_OF_ORIGIN
UNPOINTED_EQUIVARIANT_SECTION_OBSTRUCTION != POINTED_WITNESS_SEPARATION_OBSTRUCTION
STRUCTURAL_IDENTIFICATION != CUSTODIAL_DESIGNATION
IDENTIFIABILITY != INHERITANCE
REFINED_IDENTIFIABILITY != ANTERIOR_IDENTIFIABILITY
MONOTONE_BOOLEAN_NORMAL_FORM != SHANNON_INFORMATION_THEORY
PRIME_TERM_COUNT != MINIMUM_BIT_LENGTH
OBSTRUCTION_CLAUSE != PHYSICAL_BARRIER
HYPERGRAPH_EDGE != CAUSAL_RELATION
METRIC_ISOMETRY_ACTION != PHYSICAL_DYNAMICS
FREE_TRANSITIVE_FINITE_ACTION != GAUGE_THEORY
ORIENTATION_FIBRE != HIDDEN_STATE_SPACE
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
```

Changing the aperture/witness universe, fibre/action, custody point, target predicate, empirical regime, or semantic question opens a new scientific problem and is outside this rest certificate.

No merge, deployment, publication, production, release, Vercel, A16/Proto-Loom, physical gauge theory, Shannon/channel theorem, or universal inverse-problem theorem is authorized or implied.

**PREREGISTERED. UNEARNED UNTIL EXACT-HEAD SUCCESS.**

Sealed ⟐