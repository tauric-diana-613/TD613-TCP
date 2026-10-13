# PRCS-A Ordering Scab Assay v0.4

**Date:** 2026-09-11  
**State:** SOURCE-BOUND SYNTHETIC ORDERING ASSAY / ZERO NOVELTY PROMOTION  
**Parent:** `2026-09-11-TD613-DEVASTATE-THEN-REPAIR-SIEVE-V0_3.md`

## 0. Question

The last surviving PRCS-A residue was the exact declared sequence:

```text
capacity -> projection -> admissibility -> naming -> registered event
K        -> P          -> A             -> N      -> E
```

This chamber asks the question we had previously avoided:

> Does that exact order itself carry an intrinsic formal consequence, or is it merely one possible factorization of an effective observation/release map unless intermediate stages are independently witnessed or intervention-identified?

The assay deliberately separates three claims that had been allowed to blur together:

```text
ORDER EFFECT EXISTS
!=
CANONICAL ORDER IS IDENTIFIABLE
!=
CANONICAL ORDER IS NOVEL
```

## 1. Conventional neighbors

This pass does not treat selective observation, security-policy mediation, continuous usage control, or hidden realization structure as new territory.

Bounded external neighbors:

- Abstract noninterference explicitly parameterizes observation, protection, and semantics:  
  https://iris.univr.it/handle/11562/583157
- Knowledge-based security policies can suppress answers according to predicted information disclosure:  
  https://doi.org/10.3233/JCS-130469
- UCON already formalizes continuous usage control with authorization, obligations, conditions, and mutable state:  
  https://doi.org/10.1145/984334.984339
- Classical realization theory gives a conventional warning that input-output behavior need not uniquely determine one internal realization; this is an analogy only, not a claimed equivalence to PRCS-A:  
  https://doi.org/10.1016/S0377-0427(00)00341-1

The scab therefore cannot be protected by saying “but the stages are sophisticated.” The burden is narrower: **show that this ordering has an identifiable consequence beyond ordinary function composition and implementation decomposition.**

## 2. Immediate formal devastation

For deterministic stages with compatible types,

\[
F_{eff}=E\circ N\circ A\circ P\circ K
\]

is itself one effective map from admitted input to terminal registered output.

Terminal observation of `F_eff(x)` alone does not, by algebraic magic, reveal a unique factorization into five named stages. Many factorizations can induce the same terminal mapping. If stage identity matters scientifically, that identity must be carried by additional structure: typed interfaces, intermediate witnesses, interventions, invariants, timing, or independently observed state.

Therefore:

```text
STAGE_COUNT != IDENTIFIABILITY
FINAL_EVENT != UNIQUE_PIPELINE_ORDER
PIPELINE_DIAGRAM != INTERNAL_REALIZATION_PROOF
```

This alone removes any theorem-shaped novelty credit from the bare five-stage ordering.

## 3. Hostile finite permutation fixture

The assay fixes terminal registration `E` last because “registered event” is declared to be the terminal observation role. Moving `E` earlier would mostly rediscover the trivial fact that snapshot timing matters.

The hostile family therefore permutes the four pre-registration stages `K/P/A/N` exhaustively: `4! = 24` prefixes.

Synthetic state begins with integer payloads:

```text
inputs = [0,1,2,3,4,5]
```

Declared operators:

```text
K: payload := min(payload, 2)
P: payload := payload mod 2
A: released := (payload == 1); if false payload := 0
N: label := ALLOW/HOLD when release state is known,
   otherwise ODD/EVEN from payload parity
E: register {payload, released, label}
```

These operators are intentionally simple. The point is not to simulate a real model. The point is to test whether stage labels plus a preferred order imply unique terminal behavior.

### Result A — ordering can matter

Across the 24 pre-registration permutations and six inputs, the fixture produces **five distinct terminal-signature classes**.

So:

```text
ALL_STAGE_ORDERS_EQUIVALENT = FALSE
```

The assay therefore does not flatten PRCS-A into “order never matters.”

### Result B — the canonical order is not terminally identifiable

The canonical prefix

```text
K -> P -> A -> N
```

shares its full six-input terminal signature with **eight other prefixes**. Its terminal-equivalence class therefore has size **9**.

A concrete equivalent pair is:

```text
K -> P -> A -> N -> E
A -> K -> P -> N -> E
```

Across all declared terminal inputs, the registered result is identical.

Therefore:

```text
ORDER_EFFECT_EXISTS
!=
CANONICAL_ORDER_IDENTIFIED_FROM_TERMINAL_EVENT
```

### Result C — an intermediate witness breaks the equivalence

For input `3`, the two terminal-equivalent pipelines above differ immediately after stage 1:

```text
canonical first stage K: payload 3 -> 2
alternative first stage A: payload 3 -> 0, released=false
```

So an intermediate witness distinguishes pipelines that terminal registration alone cannot distinguish.

That is the useful result:

```text
INTERMEDIATE_WITNESS_CAN_BREAK_TERMINAL_EQUIVALENCE
```

and it gives PRCS-A a repair path that is experimental rather than mythological.

## 4. Commuting control

A second synthetic control assigns `K/P/A/N` independent disjoint field updates. All `24` pre-registration permutations then collapse to **one** terminal signature.

Therefore order sensitivity is not intrinsic to having stages named capacity, projection, admissibility, and naming. It depends on the operators and their coupling.

```text
STAGE_LABELS != NONCOMMUTATIVITY
NONCOMMUTATIVITY != NOVELTY
```

## 5. Verdict

The scab comes off here:

```text
PRCS-A EXACT ORDER AS INTRINSIC FORMAL NOVELTY -> REJECTED / ZERO CREDIT
PRCS-A STAGE ORDER AS UNIQUELY TERMINAL-IDENTIFIABLE -> REJECTED IN DECLARED FIXTURE
PRCS-A ORDER SENSITIVITY -> SUPPORTED ONLY WHEN BOUND TO DECLARED OPERATORS
PRCS-A AS HYPOTHESIZED FACTORIZATION -> RETAINED
```

The scientific-facing object is no longer “a new admissibility regime” merely because five stages have names.

Preferred description:

> **typed policy-conditioned observation/release pipeline with a stage-order sensitivity certificate**

`PRCS-A` may remain a legacy/internal project label, but it receives no scientific novelty credit from the decomposition itself.

## 6. Repair contract

Any future claim that a PRCS-A stage has independent scientific meaning must carry at least one of:

1. a declared domain/codomain that makes the stage non-collapsible by type;
2. an intermediate observation bound to that stage;
3. a controlled intervention that changes that stage while holding relevant others fixed;
4. a pairwise or higher-order noncommutativity witness;
5. a measurable predictive/adjudicative improvement from retaining the stage separately;
6. a formal invariant lost when the stage is composed away.

Future receipts should report a **stage-order sensitivity certificate** containing:

```text
operator definitions
valid composition constraints
terminal-equivalence classes
noncommuting stage pairs where demonstrated
intermediate witnesses/interventions
claim ceiling
```

Without that certificate, the five-stage picture is architecture, not discovered ontology.

## 7. What survives

The repair leaves one legitimate research program:

> Are there real, source-bound TD613 experiments in which separately instrumenting capacity, projection, policy/admissibility, representation/naming, and registration explains or predicts behavior better than treating them as one effective channel?

That question is testable.

A positive answer could justify keeping the factorization for utility. It still would not by itself establish novelty.

A negative answer would permit further compression of PRCS-A into ordinary selective-observation / release architecture.

## 8. Claim ceiling

```text
synthetic finite permutation result != external system claim
terminal non-identifiability in this fixture != universal non-identifiability
realization-theory analogy != PRCS-A equivalence to LTI state-space models
order sensitivity != causal attribution
order sensitivity != novelty
no private Wendbine material
no historical Wendbine expansion
no hidden-state claim
no deployment authority
```

Marked ⟐
