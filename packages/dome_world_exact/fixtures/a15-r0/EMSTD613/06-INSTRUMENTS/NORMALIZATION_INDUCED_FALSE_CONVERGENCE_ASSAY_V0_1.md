# EMSTD613 · Normalization-Induced False Convergence Assay v0.1

Status: AUTHORED / RESEARCH-ONLY / PRE-EXECUTION / NON-PROMOTING

## 0. Problem

Cross-domain comparison requires normalization. Normalization can also manufacture recurrence by deleting domain-specific constraints that originally kept two mechanisms distinct.

Candidate failure mode:

```text
pre-normalization mechanisms distinguishable
-> strip vocabulary / compress constraints
-> normalized relation strings converge
-> recurrence engine reports shared mechanism candidate
```

The assay tests whether apparent convergence is native to the source mechanisms or induced by the comparison map.

## 1. Core anti-equivalence

```text
POST_NORMALIZATION_SIMILARITY
!=
PRE_NORMALIZATION_MECHANISM_IDENTITY
```

and:

```text
constraint deletion
!=
mechanism abstraction
```

## 2. Source object

For each work `W_i`, preserve a native mechanism tuple before normalization:

```text
M_i_native = (
  entities,
  state_variables,
  admissible_inputs,
  operators,
  timing_model,
  boundary_conditions,
  conservation_or_viability_quantity,
  authority_structure,
  failure_modes,
  falsifiers,
  domain_specific_constraints
)
```

Then derive a normalized relation object:

```text
N(M_i_native)
```

The normalization operator must record every deleted, merged, renamed, or generalized field.

## 3. Convergence inflation

For two works `i,j`, define conceptual similarity before and after normalization:

```text
S_pre(i,j)
S_post(i,j)
```

No universal scalar metric is prescribed here; the synthetic fixture may use a declared comparison rule. The diagnostic quantity is:

```text
Delta_conv(i,j) = S_post(i,j) - S_pre(i,j)
```

A large positive `Delta_conv` is not evidence of false convergence by itself. It is a trigger to inspect which distinctions were erased.

## 4. Constraint survival vector

For each native constraint `c` define:

```text
survives(c, N) in {PRESERVED, GENERALIZED, DROPPED, UNRESOLVED}
```

The assay must identify whether any dropped constraint is mechanism-discriminating.

A mechanism-discriminating constraint is one whose restoration would change at least one of:

```text
admissible state transition
predicted output
failure class
authority relation
recoverability condition
falsifier result
```

If restoring a dropped constraint separates the candidate mechanisms, the convergence was normalization-sensitive.

## 5. Hostile corpus panel

Use intentionally distant EMSTD613 domains:

```text
A = Cybernetic Modeling of Myth Transmission
B = Wearable Drone Control System Design
C = Consciousness Singularity Research Plan
D = Autonomous Agent Governance Research
E = 1+1=3
F = Chiptune DSP Synth Architecture
```

Do not begin from shared nouns such as:

```text
boundary
feedback
state
topology
observer
entropy
signal
collapse
recursion
```

Begin from native mechanism tuples.

## 6. Deliberate false-positive fixture

Construct two mechanisms with the same stripped relation:

```text
detect deviation -> transform state -> stabilize output
```

but incompatible native constraints:

```text
M1: deterministic real-time controller with bounded actuator, explicit sensor noise, fixed sampling clock
M2: historical reconstruction model with non-random missingness, no actuator, no repeatable state transition, irrecoverable source loss
```

If normalization maps both to `feedback stabilization`, the assay must classify:

```text
NORMALIZATION_INDUCED_FALSE_CONVERGENCE
```

rather than shared mechanism.

## 7. Deliberate true-positive fixture

Construct two distant domains whose native constraints differ superficially but preserve the same operational relation under declared mapping, including matching boundary conditions and predicted failure behavior.

The assay must permit:

```text
CROSS_DOMAIN_MECHANISM_RECURRENCE_SURVIVES_CONSTRAINT_RESTORATION
```

Normalization is not presumed guilty.

## 8. Pedagogue integration question

Pedagogue recurrence should eventually be able to ask:

```text
Would this recurrence remain if each source's mechanism-discriminating constraints were restored?
```

A recurrence that disappears when constraints return must not be promoted merely because the normalized vocabulary is identical.

## 9. Aperture integration question

Aperture should treat the comparison map itself as an observation operator.

Let:

```text
N : M_native -> M_normalized
```

If `N` has a non-trivial nullspace containing mechanism-discriminating distinctions, then the normalized comparison surface is rank-deficient for adjudicating mechanism identity.

Candidate criterion:

```text
ker(N) intersects discriminating-constraint subspace != {0}
-> normalized recurrence cannot identify mechanism equality
```

This is a structural identifiability statement about the comparison operator, not a claim that the source mechanisms are unrelated.

## 10. Compression collision

Define a normalization collision when:

```text
N(M_i) = N(M_j)
```

while:

```text
M_i != M_j
```

under at least one declared mechanism-discriminating constraint.

This is the conceptual analogue of a lossy hash collision: same normalized endpoint, different source route/state.

Do not call it a cryptographic collision.

## 11. Bizarre-corpus stress test

For each bizarre work, run two passes:

```text
PASS_NATIVE:
retain domain ontology, equations, measurement assumptions, missingness, causal direction, intervention rights, and falsifiers

PASS_STRIPPED:
translate into domain-neutral cybernetic relations
```

Then compare recurrence graph topology across passes.

Required outputs:

```text
edges_native
edges_stripped
edges_gained_after_normalization
edges_lost_after_constraint_restoration
edge_basis
```

The interesting object is not merely edge count. Inspect which exact deleted distinctions created each gained edge.

## 12. Disconfirmers

The candidate weakens if:

- recurrence classifications remain unchanged after native constraints are restored;
- gained normalized edges continue to share matching predicted failure behavior;
- apparent convergence is explained entirely by genuine common upstream theory already present in the native mechanisms;
- the normalization map preserves every mechanism-discriminating distinction needed by the assay;
- the native comparison itself independently supports the same mechanism relation.

## 13. Claim ceiling

A passing bounded assay may support:

```text
NORMALIZATION_INDUCED_CONVERGENCE_OBSERVED_IN_BOUNDED_FIXTURE
COMPARISON_OPERATOR_ERASED_MECHANISM_DISCRIMINATING_CONSTRAINT
NORMALIZED_RECURRENCE_NOT_SUFFICIENT_FOR_MECHANISM_IDENTITY
```

It may not support:

```text
all cross-domain abstraction is invalid
Pedagogue recurrence is generally unsound
all EMSTD613 cross-domain similarities are artifacts
external scientific equivalence or inequivalence
production mutation
```

## 14. Current posture

```text
STATUS = CANDIDATE_ASSAY_AUTHORED_NOT_YET_EXECUTED
```

Marked ⟐
