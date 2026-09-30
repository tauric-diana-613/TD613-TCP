# Pedagogue Identifiability-Deficit Targeting Receipt · v0.1

**Program:** A15-R0 phase-free research field  
**Status:** WITNESSED / BOUNDED SYNTHETIC SUPPORT / RESEARCH-ONLY  
**Witnessed science head:** `ed7c654444f36b0af2885dc83c2055adfccce262`  
**GitHub Actions run:** `1819` · run id `32317574369`  
**Static witness job:** `96273059804`  
**Browser witnesses:** skipped by scope; no browser/UI surface changed  
**Production/Vercel:** untouched / deployment held

## 0. Breakpoint

This receipt seals the first A15-R0 experiment in which Pedagogue used the **declared local identifiability deficit of an inverse problem** to determine what kind of next synthetic observation could reduce that deficit.

The result is not a theorem of optimal experiment design. It is a bounded operational validation in two authored synthetic contexts.

The major transition is:

```text
uncertainty diagnosed
→ current operator/Jacobian rank deficit exposed
→ nullspace retained as the admitted blind-direction receipt
→ predeclared candidate observations tested for rank lift
→ renamed/already-spanned observations receive zero credit
→ a rank-augmenting next synthetic question is proposed
→ original insufficiency remains historically intact
```

Pedagogue did not execute the proposed observation. No oracle identity was consulted.

## 1. Exact emitted CI receipt

Run 1819 emitted:

```json
{
  "ok": true,
  "schema": "td613.ash.a15-r0.identifiability-deficit-targeting/v0.1",
  "context_a_rank_before": 2,
  "context_a_nullity_before": 1,
  "context_a_null_direction": [2, 2, -3],
  "context_a_selected_probe": "C1",
  "context_a_selected_rank_lift": 1,
  "context_b_initial_rank": 1,
  "context_b_initial_nullity": 2,
  "context_b_first_probe": "G_13",
  "context_b_second_probe": "G_23",
  "context_b_final_rank": 3,
  "context_b_final_nullity": 0,
  "cross_context_status": "IDENTIFIABILITY_DEFICIT_TARGETING_VALIDATED_IN_TWO_BOUNDED_SYNTHETIC_CONTEXTS",
  "candidate_mechanism_id": "LOCAL_IDENTIFIABILITY_DEFICIT_GUIDES_PREDECLARED_PROBE_SELECTION",
  "next_learning_action": "TEST_CONDITIONING_AND_NOISY_NEAR_SINGULAR_CASES_BEFORE_ANY_DESIGN_HEURISTIC_PROMOTION",
  "promotion_authority": false
}
```

## 2. Context A · partially unknown state–instrument geometry

The hostile self-calibration point used

```text
J_c = [1   2   2
       2   1   2
       1  -1   0]
```

with

```text
rank(J_c)=2
nullity(J_c)=1.
```

A declared null direction was

```text
n_c = [2,2,-3]^T
```

and satisfied

```text
J_c n_c = 0.
```

Candidate gradients behaved as predeclared:

```text
C1 = θx       ; ∇C1=[2,0,2] ; rank lift = 1
C2 = x+y      ; ∇C2=[1,1,0] ; rank lift = 1
C3 = x+θy=P1  ; ∇C3=[1,2,2] ; rank lift = 0
```

`C3` therefore remained locally redundant despite having a distinct candidate label. Deterministic tie-breaking selected `C1`; the selector did not claim global optimality.

## 3. Context B · known-forward repeated-direction geometry

The second context began with three copies of the same relational row:

```text
J_0 = [1 1 0
       1 1 0
       1 1 0]
```

with

```text
rank(J_0)=1
nullity(J_0)=2.
```

A renamed duplicate left rank unchanged. Two genuinely new relational rows contracted the deficit sequentially:

```text
rank 1 / nullity 2
→ add G_13
rank 2 / nullity 1
→ add G_23
rank 3 / nullity 0.
```

The duplicate row never acquired rank-lift credit merely through repetition or renaming.

## 4. Bounded reusable relation candidate

A15-R0 may retain the following as a **research-refinement candidate**, not a universal law:

> When a declared local inverse problem is rank deficient, a candidate observation can improve local identifiability only insofar as it constrains a direction the current observation operator leaves unresolved. Renaming or repeating an already-spanned observation cannot reduce nullity.

Operationally, this fixture used rank lift as the primary decision criterion and nullspace sensitivity as an explanatory receipt.

## 5. What this does not prove

The witness does **not** establish any of the following:

```text
optimal experimental design
active-learning theorem
global identifiability
stable reconstruction under noise
nonlinear identifiability
blind tomography
operator tomography
physical tomography
physical sensor calibration/control
autonomous experiment execution
connection
curvature
holonomy
quantum behavior
Proto-Loom
A16 succession
production authority
```

Full local rank can coexist with terrible conditioning. A near-singular problem may technically have full rank while becoming practically unrecoverable under finite noise. That unresolved distinction is now the next hostile boundary.

## 6. Pedagogue state

```text
hydration = ALLOWED
cross-context operational refinement = SUPPORTED_IN_TWO_BOUNDED_SYNTHETIC_CONTEXTS
pedagogue_law_promoted = false
promotion_authority = false
automatic_measurement_execution = false
oracle_identity_consulted = false
production_mutated = false
live_ash_binding = false
```

This receipt therefore records a new ability of the research metabolism without widening Pedagogue's authority.

## 7. Next held experiment

Do not advance directly from rank lift to an experiment-design heuristic.

The next authorized research question remains:

```text
TEST_CONDITIONING_AND_NOISY_NEAR_SINGULAR_CASES_BEFORE_ANY_DESIGN_HEURISTIC_PROMOTION
```

That experiment must distinguish at least:

```text
full rank + well conditioned
full rank + near singular / poorly conditioned
rank deficient
```

under matched finite noise/budget, and must permit the conclusion that a rank-augmenting probe can still be a poor practical measurement.

## 8. Closure

The major breakpoint is not that Pedagogue can choose `C1`.

It is that Pedagogue now has an executable, authority-bounded way to ask:

> **What direction of the admitted latent problem can my current observations not distinguish, and which predeclared next question would actually constrain that blind direction?**

The machine has moved from diagnosing uncertainty to proposing the next synthetic question from the geometry/linear algebra of its own admitted ignorance—while preserving the original insufficiency receipt and refusing execution authority.

**Human closure required.**
