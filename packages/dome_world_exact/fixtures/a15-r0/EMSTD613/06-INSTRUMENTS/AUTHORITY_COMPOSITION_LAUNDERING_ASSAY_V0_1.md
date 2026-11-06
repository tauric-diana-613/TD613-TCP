# EMSTD613 · Authority Composition Laundering Assay v0.1

Status: AUTHORED / RESEARCH-ONLY / PRE-EXECUTION / NON-PROMOTING

## 0. Freefall question

If authority provenance is a graph, can individually valid local edges compose into an invalid global permission?

This assay targets a laundering surface:

```text
valid local edge A
+ valid local edge B
+ valid local edge C
!=
valid composed authority path
```

The problem is not forged identity. It is compositional overreach.

## 1. Source relation

EMSTD613 autonomous-agent governance material describes capability chains with monotonic attenuation: downstream holders may add restrictions but may not regain rights removed upstream. It also describes non-compensable validator vetoes and context envelopes carrying execution lineage.

Those structures motivate, but do not prove, the following candidate for TD613/Dome-World.

## 2. Authority composition operator

Let authority edges be typed:

```text
E_i = (grantor, grantee, right_set, object_scope, deficit_scope, time_scope, parent, caveats)
```

Define path composition only when adjacency and scope compatibility hold:

```text
E_1 ∘ E_2 ∘ ... ∘ E_n
```

A composed path is admissible only if every downstream right is contained within the effective upstream intersection:

```text
Rights(E_n) ⊆ ⋂_{i=1}^{n-1} EffectiveRights(E_i)
```

and object/deficit/time scopes remain compatible.

## 3. Laundering pattern A · split-scope recombination

Two parents independently grant:

```text
P1 -> X : read O
P2 -> X : propose O
```

X emits a downstream edge:

```text
X -> Y : mutate O
```

No single parent granted mutate; the union of unrelated rights must not synthesize a stronger right.

Candidate anti-law:

```text
UNION_OF_PARTIAL_RIGHTS != AUTHORITY_TO_INVENT_SUPERSET_RIGHT
```

## 4. Laundering pattern B · jurisdiction stitching

```text
P1 -> X : mutate within deficit D1
P2 -> X : mutate within deficit D2
```

X presents:

```text
mutate across D1 ∪ D2 without a cross-jurisdiction grant
```

Same action label does not erase deficit boundaries.

## 5. Laundering pattern C · temporal stitching

```text
E_old valid at t0..t1
E_new valid at t2..t3
```

A system reconstructs a fictional continuous authority interval:

```text
t0..t3
```

because the endpoint rights look identical.

Candidate anti-law:

```text
DISJOINT_VALIDITY_WINDOWS != CONTINUOUS_PERMISSION
```

## 6. Laundering pattern D · restoration graft

A held right is restored under a new scope, then silently grafted to the old broader scope because both share the same right name.

```text
old: mutate {A,B}
HOLD
restore: mutate {A}
current surface displays 'mutate'
```

String equality launders scope loss.

## 7. Laundering pattern E · cross-object transitivity

```text
P -> X : release O1
X -> Y : release O2
```

A downstream route treats `release` as transitive across governed objects despite no authority bridge between O1 and O2.

## 8. Pedagogue devastation pass

Pedagogue must attack every apparent authority path with:

1. Which exact right survives the intersection of all parent edges?
2. Which scope dimension changed silently: object, deficit, time, consequence, or actor?
3. Did multiple weak permissions get unioned into one stronger permission?
4. Did identical labels conceal different scope vectors?
5. Did a route gap get compressed into fictional continuity?
6. What edge would have to exist for the composed path to be lawful, and is that edge actually witnessed?

Pedagogue may name the missing edge but may not fabricate it.

## 9. Aperture audit

Aperture asks whether current receipts can distinguish:

```text
CLEAN_COMPOSITION
SCOPE_UNION_LAUNDERING
JURISDICTION_STITCHING
TEMPORAL_STITCHING
RESTORATION_GRAFT
CROSS_OBJECT_TRANSITIVITY
UNRESOLVED
```

If the observation surface exposes only current right labels, Aperture must preserve non-identifiability of composition history.

## 10. Failure criterion for a future implementation

Fail any authority graph evaluator if:

```text
rights are unioned where intersection is required
missing parent edges default to permissive
scope dimensions are dropped during composition
same right label substitutes for same right tuple
expired windows are bridged by endpoint equality
restoration inherits pre-HOLD breadth without explicit grant
object identity is ignored
```

## 11. Relation to authority debt

A path may produce authority debt even when every local edge parses correctly.

Define:

```text
composition_debt(path) = true
```

when local validity does not yield globally admissible composition.

Thus:

```text
LOCAL_EDGE_VALIDITY != GLOBAL_PATH_VALIDITY
```

## 12. Claim ceiling

A passing bounded assay may support only:

```text
AUTHORITY_COMPOSITION_REQUIRES_SCOPE_PRESERVATION_IN_FIXTURE
LOCAL_EDGE_VALIDITY_NOT_SUFFICIENT_FOR_GLOBAL_AUTHORITY_PATH_IN_FIXTURE
AUTHORITY_COMPOSITION_DEBT_CANDIDATE
```

It may not support:

```text
current TD613 exploit
external compromise
universal capability-security theorem
production mutation
```

## 13. Current posture

```text
STATUS = CANDIDATE_ASSAY_AUTHORED_NOT_YET_EXECUTED
```

Marked ⟐
