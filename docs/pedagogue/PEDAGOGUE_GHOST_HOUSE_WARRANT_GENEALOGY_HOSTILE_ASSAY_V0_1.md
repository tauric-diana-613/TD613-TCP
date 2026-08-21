# Pedagogue Ghost House — Warrant Genealogy & Provenance-Custody Hostile Assay v0.1

Status: **AUTHORED / PRE-EXECUTION / BOUNDED SYNTHETIC HOSTILE RESEARCH / OPERATOR-ADMITTED / NOT PROMOTED**

Schema: `td613.pedagogue.warrant-genealogy-ghost-house-hostile/v0.1`

Research surface: PR `#677`

Inherited candidate under attack: `C1_DECLARED_DERIVATIONAL_CLOSURE`

New preregistered candidate: `C2_WARRANT_GENEALOGY_CUSTODY`

The operator has admitted declared derivational closure / warrant provenance as the next hostile research target and granted broad research/design authority inside the repository. This assay exercises that authority only inside the bounded #677 research lane. It creates no product, shared-engine, workflow, browser, merge, deployment, release, or production authority. Issue #405 remains the sole Vercel release membrane and requires a separate explicit operator gesture.

---

## 0. Why this chamber exists

The previous hostile chamber killed two simpler formulations:

```text
GENERIC_H1_FALSIFIED
STRICT_TYPED_NON_AMPLIFICATION_FALSIFIED_BY_LAWFUL_DERIVATIONAL_GAIN
```

The surviving bounded candidate was:

```text
C1 = declared derivational closure
```

with the research question:

> Is the output warrant inside the declared replayable closure of admitted evidence and admissible derivations, with provenance sufficient to reconstruct how that warrant entered the closure?

The phrase **with provenance sufficient to reconstruct** now becomes the blade.

C1 presently returns a closure set plus a flat `derivations_used` list. That is enough to show that some eligible rules fired. It is not yet established that the receipt preserves the ancestry of a particular warrant, all alternative lawful ancestries, conflict state, replay evidence, or invalidation after support disappears.

This assay therefore attacks not whether fixed-point closure can exist, but whether the inherited C1 object is sufficient as a **warrant-provenance custody grammar**.

---

## 1. Playful house labels are mnemonic, not ontology

The hostile family is arranged as a dollhouse / haunted-house mnemonic because play is authorized and useful. The room names do not carry scientific authority. Every room has a stable formal case ID and deterministic synthetic contract.

```text
Nursery        -> GH01_SEEDLESS_CYCLE
Staircase      -> GH02_MULTI_STEP_ANCESTRY
Twin Bedroom   -> GH03_MULTIPLE_VALID_LINEAGES
Mirror Room    -> GH04_RULE_RENAME_ORDER_INVARIANCE
Costume Closet -> GH05_FAKE_REPLAY_NAME_TAG
Attic          -> GH06_CONTRADICTORY_HEIRS
Basement       -> GH07_RETRACTION_GHOST_WARRANT
Good Twin      -> GH08_VALID_PLUS_INVALID_COMPETING_ROUTE
Blank Room     -> GH09_UNSUPPORTED_WARRANT
```

The house is a memory aid. The case IDs are the assay.

---

## 2. Two candidate readings frozen before execution

### C1 · inherited declared derivational closure

Frozen exactly as witnessed in the prior chamber:

```text
A warrant is admitted when it is primitive or produced by a rule whose:
predeclared = true
admissible = true
replayable = true
and whose typed prerequisites are present.
```

The inherited implementation may not be rewritten inside this assay to save it.

### C2 · Warrant Genealogy Custody

Preregistered before executor authoring:

```text
A warrant may be admitted only when it is primitive or has at least one
witnessed derivational lineage from admitted primitive evidence.

Every admitted derived warrant must retain enough lineage structure to show:
- which semantic derivation relation produced it;
- which prerequisite warrants parent that derivation;
- which replay witness matches that semantic relation;
- all distinct lawful lineages that independently support the same warrant;
- which candidate lineages were rejected and why.

Rule identifiers and serialization order may label receipts but may not choose
which semantic lineage survives.

A seedless derivational cycle may not bootstrap warrant.

If all supporting ancestry for a derived warrant disappears after retraction,
the warrant must disappear on recomputation; ghost warrant persistence is forbidden.

A boolean `replayable=true` label is not itself a replay witness.

If a preregistered contradiction set has more than one conflicting warrant in
closure, closure membership alone may not manufacture unique consequence
authority. The evaluator must abstain on the conflicted warrant family.
```

Candidate status:

```text
ATTACK_ONLY_NOT_PROMOTED
presumption_of_survival = false
```

This name — **Warrant Genealogy** — is an assay ontology, not a Pedagogue law.

---

## 3. Formal bounded object

Let:

```text
P = primitive typed warrants carried by declared evidence records
R = candidate derivation rules
S(r) = canonical semantic signature of rule r
W(r) = replay witness presented for r
Cl(P,R) = finite derivational closure
G(w) = preserved lawful lineage set for warrant w
X = preregistered contradiction families
```

For C2, a rule is lineage-eligible only if:

```text
predeclared(r) = true
admissible(r) = true
replayable(r) = true
W(r).status = WITNESSED_SYNTHETIC
W(r).semantic_signature = S(r)
```

No numeric confidence, certainty, trust, utility, authority magnitude, probability, rank, or scalar consequence score exists in this object.

A semantic signature is a deterministic canonical relation over sorted typed prerequisites and the produced warrant. It is not a cryptographic identity claim and not an external-world proof.

---

## 4. GH01 · Nursery · seedless-cycle attack

Rules:

```text
X -> Y
Y -> X
```

Primitive seed set:

```text
P = {}
```

Required result for both C1 and C2:

```text
X absent
Y absent
```

Defeat condition:

```text
SEEDLESS_CYCLE_BOOTSTRAPPED_WARRANT
```

This is a positive control for least-fixed-point behavior.

---

## 5. GH02 · Staircase · multi-step ancestry

Primitive warrants:

```text
MEASUREMENT:A
MEASUREMENT:B
MEASUREMENT:D
```

Witnessed rules:

```text
A + B -> IDENTIFIABILITY:C
C + D -> DECISION:E
```

Required C2 result:

```text
DECISION:E admitted
G(E) reconstructs the second rule
G(E) points to IDENTIFIABILITY:C and MEASUREMENT:D
G(C) reconstructs the first rule
G(C) points to MEASUREMENT:A and MEASUREMENT:B
```

A flat statement that `R1` and `R2` fired somewhere is not, by itself, the success criterion for C2.

Defeat condition:

```text
MULTI_STEP_ANCESTRY_NOT_RECONSTRUCTABLE
```

---

## 6. GH03 · Twin Bedroom · multiple valid lineages

Two semantically distinct witnessed routes produce the same output:

```text
MEASUREMENT:A + MEASUREMENT:B -> IDENTIFIABILITY:W
MEASUREMENT:C + MEASUREMENT:D -> IDENTIFIABILITY:W
```

All four primitives are present.

Required C2 result:

```text
IDENTIFIABILITY:W admitted
lawful_lineage_count(W) = 2
both semantic lineage signatures preserved
```

Central C1 attack:

The inherited closure implementation skips a later rule when `closure.has(rule.produces)` is already true. If it records only one ancestry, the closure set may remain correct while custody is incomplete.

Defeat class for C1-as-provenance object:

```text
ALTERNATIVE_LAWFUL_LINEAGE_ERASED
```

---

## 7. GH04 · Mirror Room · rule rename/order invariance

Repeat GH03 twice with identical semantic rules and identical evidence.

Run A names the first semantic route so it sorts before the second.
Run B swaps only the rule identifiers and serialization order.

No typed prerequisite, produced warrant, replay relation, or evidence content changes.

Required invariant:

```text
semantic lineage set before = semantic lineage set after
requested-warrant disposition before = after
```

A rule name may appear as receipt metadata. It may not determine which lawful ancestry is remembered.

Strong C1 falsifier:

```text
closure set invariant
AND
recorded derivation provenance changes solely because rule IDs were renamed
```

Defeat condition:

```text
PROVENANCE_SELECTED_BY_RULE_NAME_OR_SERIALIZATION
```

This is the primary hostile blade.

---

## 8. GH05 · Costume Closet · fake replay name tag

Construct a rule with:

```text
predeclared = true
admissible = true
replayable = true
```

but provide either no replay witness or a replay witness whose semantic signature does not match the rule relation.

C1 is expected to reveal whether the boolean label alone is currently sufficient for admission.

C2 must refuse the derivation with:

```text
REFUSE_UNWITNESSED_DERIVATION
```

and preserve the rejected rule with an explicit reason.

Earned distinction under attack:

```text
declared replayability != witnessed replayability
```

Defeat condition for C2:

```text
REPLAYABLE_LABEL_LAUNDERED_AS_REPLAY_WITNESS
```

---

## 9. GH06 · Attic · contradictory heirs

Predeclare a contradiction family:

```text
[DECISION:ALLOW, DECISION:DENY]
```

Provide separate witnessed derivations that lawfully place both warrants in closure.

C1 membership behavior is observed but not rewritten.

C2 required posture when either conflicted warrant is requested:

```text
ABSTAIN_CONTRADICTORY_DERIVATIONAL_SUPPORT
conflicting_warrants = [DECISION:ALLOW, DECISION:DENY]
```

No lexical rule name, insertion order, or later request chooses a winner.

This assay does not claim that all contradictions are binary or that a universal logic of inconsistency has been established. The contradiction set is an explicit bounded fixture.

Defeat condition:

```text
CONTRADICTION_MEMBERSHIP_MANUFACTURED_UNIQUE_AUTHORITY
```

---

## 10. GH07 · Basement · retraction / ghost warrant

Build GH02, then retract primitive support `MEASUREMENT:B` and recompute from the remaining admitted evidence.

Before retraction:

```text
IDENTIFIABILITY:C present
DECISION:E present
```

After retraction:

```text
IDENTIFIABILITY:C absent
DECISION:E absent
```

C2 must report both as invalidated descendants.

Defeat condition:

```text
GHOST_WARRANT_SURVIVED_SUPPORT_RETRACTION
```

This is recomputation semantics only. It does not install a live mutable truth-maintenance system.

---

## 11. GH08 · Good Twin · one valid route + one fake route

Two routes target the same warrant.

One route carries a matching witnessed replay signature.
The other carries the same boolean eligibility labels but a mismatched replay witness.

The fake route is deliberately named so lexical sorting would encounter it first.

Required C2 result:

```text
requested warrant admitted through valid route
valid semantic lineage preserved
fake route excluded from lawful lineage
fake route retained in rejected-rules receipt
```

The candidate must neither overrefuse the warrant nor launder the fake route because another lawful route exists.

Defeat conditions:

```text
VALID_ROUTE_LOST_BECAUSE_FAKE_ROUTE_SORTED_FIRST
INVALID_ROUTE_LAUNDERED_BY_SHARED_OUTPUT
```

---

## 12. GH09 · Blank Room · unsupported warrant

Request a warrant with no primitive support and no witnessed valid derivation.

Required C2 result:

```text
REFUSE_AUTHORITY_OUTSIDE_WARRANT_GENEALOGY
```

This prevents the richer provenance object from becoming a universal permission machine.

---

## 13. Inherited constitutional controls

The new chamber must not regress the prior corpses or refusal law.

The executor must inherit the prior #677 hostile receipt and preserve:

```text
STRICT_TYPED_NON_AMPLIFICATION_FALSIFIED_BY_LAWFUL_DERIVATIONAL_GAIN
exact decision-loss tie = NO_UNIQUE_SELECTION_DECISION_LOSS_TIE
lexical tie-break used = false
undeclared decision loss = refuse
conflicting losses without aggregation = refuse
unsupported/missing aggregation = refuse
post-hoc decision-loss mutation = non-confirmatory
incomplete uncertainty = ABSTAIN_NOISE_GEOMETRY_INCOMPLETE
invalid uncertainty = REJECT_INVALID_NOISE_GEOMETRY
scalar trust/confidence/certainty/robustness crowns = refuse
```

H2, H3, and M×D / M×P / D×P / M×D×P remain held in this chamber.

---

## 14. Preregistered verdict logic

### C1 bounded falsification scope

C1 is falsified **as a provenance-sufficient custody formalism in this bounded family** if one or more of the following are observed:

```text
alternative lawful lineage erased
recorded provenance selected by rule name/order
boolean replayable label admits an unwitnessed/mismatched derivation
contradictory consequence warrants both receive ordinary derivational permission with no conflict posture
```

The verdict string is frozen as:

```text
DECLARED_DERIVATIONAL_CLOSURE_C1_FALSIFIED_AS_PROVENANCE_SUFFICIENT_FORM
```

This does not mean finite fixed-point closure is mathematically false or useless.

### C2 bounded survival

C2 survives only if every GH01–GH09 requirement and every inherited constitutional control passes.

Frozen survival verdict:

```text
WARRANT_GENEALOGY_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_GHOST_HOUSE
```

Frozen falsification verdict:

```text
WARRANT_GENEALOGY_CUSTODY_CANDIDATE_FALSIFIED
```

A clean falsification is a successful scientific outcome.

---

## 15. No mid-assay rescue

No definition repair is allowed after observing the result.

In particular, do not:

- change C1 to preserve all derivations after seeing GH03/GH04;
- redefine `replayable=true` as a replay witness after seeing GH05;
- add conflict semantics to C1 after seeing GH06;
- add retraction semantics only after seeing GH07;
- hide a C2 failure behind a confidence score or weighted aggregate;
- invoke category theory, lattices, monotonicity, capability algebra, proof theory, truth-maintenance systems, or database provenance as authority for survival.

Those literatures may later help name or compare a surviving mechanism. They are not substitute evidence.

---

## 16. Claim ceiling

This chamber may establish only bounded synthetic statements about the authored fixture.

It does **not** establish:

```text
universal logic of inference
universal proof theory
universal database provenance law
truth-maintenance completeness
category-theoretic structure
lattice structure
monotonicity law
defeasible-logic completeness
physical causality
connection / curvature / holonomy
quantum identity
human trustworthiness
autonomous scientific authority
```

Play is authorized. Ontology promotion is not implied by a cute room name.

---

## 17. Authority membrane

```text
research_target_admitted_by_operator = true
major_research_decisions_may_be_self_authorized_in_this_lane = true
product_mutation = false
shared_pedagogue_engine_mutation = false
workflow_mutation = false
browser_execution = false
merge_performed_by_this_preregistration = false
deployment_authority = false
release_authority = false
vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true
promotion_authority = false
human_closure_required_for_production = true
```

The assay may continue through preregistration, executor, hostile test, exact-head witness, repair of assay/test brittleness, receipt sealing, and subsequent bounded research chambers without returning for a human decision unless a distinct authority boundary is actually reached. Vercel remains outside that grant.

𝌋 The Ghost House is open. The dolls may move; the ancestry ledger may not lie. ⟐
