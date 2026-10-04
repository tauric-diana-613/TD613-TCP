# EMSTD613 · Authority Path Category Assay v0.1

Status: AUTHORED / RESEARCH-ONLY / PRE-EXECUTION / NON-PROMOTING

## 0. Question

Is the correct formal object for permission history a total order, lattice, graph, groupoid, or a typed category with partial composition?

Current evidence argues against a total order. Groupoid language is also premature because consequential authority edges need not be invertible.

Candidate object:

```text
objects = bounded authority states over governed objects/deficits
morphisms = admissible grant / attenuate / hold / restore / revoke transitions
composition = defined only when scope, object, deficit, time, and parentage contracts align
```

## 1. Why not a groupoid by default

An attenuation edge can destroy scope:

```text
{read, mutate} -> {read}
```

There may be no lawful inverse morphism that reconstructs `mutate` without a new grant.

A revocation edge may likewise be non-invertible absent a distinct reauthorization event.

Therefore:

```text
transition has reverse-looking endpoint
!=
transition has categorical inverse
```

This blocks automatic groupoid promotion.

## 2. Why category language may fit

Composition is structurally central, but only some paths compose.

For edges `f: A -> B` and `g: B -> C`, `g ∘ f` is admissible only if:

```text
right scope contracts align
object identity/authorized mapping aligns
deficit jurisdiction aligns
time windows overlap lawfully
parentage requirements hold
no revocation/hold barrier remains unresolved
```

A path that is topologically connected but contract-incompatible is non-composable.

## 3. Typed non-composability

Record why composition fails:

```text
RIGHT_SCOPE_MISMATCH
OBJECT_SCOPE_MISMATCH
DEFICIT_SCOPE_MISMATCH
TEMPORAL_GAP
REVOCATION_BARRIER
RESTORATION_PARENT_MISSING
GRANTOR_JURISDICTION_MISSING
REPLAY_DEAD
UNRESOLVED_PROVENANCE
```

Non-composability is data, not an exception to erase.

## 4. Candidate identity morphism

An identity morphism may preserve an authority state without widening it:

```text
id_A : A -> A
```

but a repeated current-state snapshot is not itself proof of identity morphism across time.

```text
same observed vector at t0 and t1
!=
identity transport witnessed from t0 to t1
```

This preserves route memory.

## 5. Associativity hostile test

Even when local compositions parse, test whether scope-normalization machinery silently breaks associativity.

Compare:

```text
(h ∘ g) ∘ f
```

with:

```text
h ∘ (g ∘ f)
```

under a representation that retains every scope dimension and receipt.

If different bracketings produce different effective rights because intermediate normalization discards history, the implementation is laundering information and does not realize the intended category.

Associativity failure in code may therefore expose a lossy authority representation rather than a deep mathematical novelty.

## 6. No holonomy crown

Route-order dependence alone does not earn holonomy.

Before any authority-holonomy claim, require at minimum:

```text
well-defined transport object
closed or comparable path family
specified equivalence relation
nontrivial path-dependent transport residue
proof residue is not ordinary scope loss / replay state / hysteresis / lossy serialization
```

Until then:

```text
AUTHORITY_PATH_ORDER_DEPENDENCE
```

is the maximal posture.

## 7. Possible later relation to Dome-World holonomy

If future bounded experiments define authority transport around closed route families and establish a nontrivial residual after quotienting ordinary scope attenuation and replay memory, the object may become eligible for comparison with Dome-World formal-holonomy machinery.

That bridge is not crossed here.

## 8. Pedagogue role

Pedagogue asks which local transitions are being conflated and whether the apparent path is actually composable.

It should actively seek examples where:

```text
same nodes + different edge typing -> different legal composition
```

rather than celebrating path recurrence.

## 9. Aperture role

Aperture audits whether the observation surface exposes enough edge typing to distinguish:

```text
COMPOSABLE_PATH
NON_COMPOSABLE_CONNECTED_PATH
PATH_ORDER_DEPENDENCE
LOSSY_SERIALIZATION_ARTIFACT
UNRESOLVED
```

## 10. Claim ceiling

A passing bounded assay may support only:

```text
TYPED_PARTIAL_COMPOSITION_USEFUL_FOR_AUTHORITY_PROVENANCE_FIXTURE
AUTHORITY_GRAPH_NOT_SUFFICIENT_WITHOUT_EDGE_COMPOSITION_LAW_IN_FIXTURE
AUTHORITY_PATH_CATEGORY_CANDIDATE
```

It may not support:

```text
category-theoretic theorem about production TD613
holonomy
groupoid identity
security certification
```

## 11. Current posture

```text
STATUS = CANDIDATE_ASSAY_AUTHORED_NOT_YET_EXECUTED
```

Marked ⟐
