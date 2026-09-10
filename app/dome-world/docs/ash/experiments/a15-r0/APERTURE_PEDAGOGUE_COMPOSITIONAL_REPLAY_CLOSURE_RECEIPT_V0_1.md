# A15-R0 · Aperture × Pedagogue Compositional Replay Closure Receipt v0.1

𝌋 TD613 · Tauric Diana 613

**Status:** WITNESSED / BOUNDED SYNTHETIC RESULT / HUMAN PATH-OBJECT SEAM REACHED  
**Scientific parent:** #712 receipt `13c4f67a5f7d99ff129759d59ee5b4d2ae075f99`  
**Preregistration commit:** `81b99005db658f012ca5d7fd46d924f8d22d3f5e`  
**Exact scientific witness head:** `c5c4f4d47cf00484b693a625e24ae0391a23d62b`  
**Workflow:** `TD613 Consolidated Validation`  
**Authoritative run:** `32677475237` · run number `2070`  
**Static contract job:** `97288161317`  
**Outcome:** SUCCESS  
**Browser/full-repository/self-hosted lanes:** skipped in authoritative run; not required for this assay.

---

## 1. Research question

The chamber tested whether a candidate custody-derived replay abstraction deserves stronger consideration as a compositional state inside a declared finite continuation grammar.

The preregistered finite law was:

```text
kappa(h1) = kappa(h2)
  implies
kappa(h1 · q) = kappa(h2 · q)
```

for every continuation `q` admitted by finite grammar `G0`.

The question was deliberately narrower than path transport:

```text
projection collision now
!=
lawful state equivalence under future continuation
```

No path object, category, groupoid, transport functor, connection, loop endomorphism, holonomy, or curvature was assumed.

---

## 2. Parent custody and derived histories

The executable required the witnessed #712 partial-event-custody gauntlet and #709 transcript-compression collision gauntlet to pass before emitting any new result.

The AB/BA facts were derived from parent custody:

```text
AB transcript = [2,4]
BA transcript = [3,3]
AB cumulative = BA cumulative = 6
AB endpoint = BA endpoint = [[3,1],[1,4]]
AB route history != BA route history
```

The chamber then constructed three frozen history wrappers:

```text
H_AB:
  endpoint = [[3,1],[1,4]]
  cumulative = 6
  last_action = B
  operational_lineage = AB
  receipt_variant = R1

H_BA:
  endpoint = [[3,1],[1,4]]
  cumulative = 6
  last_action = A
  operational_lineage = BA
  receipt_variant = R2

H_AB_DUP:
  same operational history as H_AB
  receipt_variant = R1_DUP
```

`H_AB_DUP` preserved a distinct custody-level receipt variant while sharing the declared operational fields of `H_AB`. It therefore prevented a vacuous pass obtained by assigning every custodied history a unique transported state.

Earned distinction:

```text
custody distinction
!=
declared operational distinction
```

The receipt-level difference remains in custody even when a bounded operational quotient omits it.

---

## 3. Candidate abstractions

The preregistered candidates were:

```text
K_endpoint = { endpoint }

K_claim = {
  endpoint,
  cumulative
}

K_declared = {
  endpoint,
  last_action,
  operational_lineage
}
```

`K_endpoint` and `K_claim` both collapse `H_AB` and `H_BA` before continuation.

`K_declared` separates `H_AB` from `H_BA` but intentionally collapses the distinct custody objects `H_AB` and `H_AB_DUP`.

No minimal, optimal, canonical, Markov, predictive-state, bisimulation, causal-state, or state-minimization claim follows from these authored candidates.

---

## 4. Declared finite continuation grammar G0

The frozen grammar contained exactly:

```text
Q_ENDPOINT_READ
Q_LAST_ACTION_KICK
Q_LINEAGE_PARITY
```

The primary hostile, `Q_LAST_ACTION_KICK`, consumes the previous `last_action` and perturbs different endpoint coordinates for previous action `A` versus `B`.

Starting from the common AB/BA endpoint:

```text
H_AB · Q_LAST_ACTION_KICK
  -> [[3,1],[1,5]]

H_BA · Q_LAST_ACTION_KICK
  -> [[4,1],[1,4]]
```

Thus histories collapsed by endpoint-only or endpoint-plus-current-cumulative views become distinguishable under the same declared lawful continuation.

---

## 5. Endpoint-only abstraction failed continuation congruence

Before continuation:

```text
K_endpoint(H_AB) = K_endpoint(H_BA)
```

After the same `Q_LAST_ACTION_KICK`:

```text
K_endpoint(H_AB · Q_LAST_ACTION_KICK)
!=
K_endpoint(H_BA · Q_LAST_ACTION_KICK)
```

Classification:

```text
ENDPOINT_ONLY_ABSTRACTION_FAILS_DECLARED_CONTINUATION_CONGRUENCE
```

This extends the earlier common-endpoint warning into a future-composition hostile:

```text
same endpoint now
!=
same lawful continuation class
```

inside this authored grammar.

---

## 6. Current claim-sufficient abstraction also failed

Before continuation:

```text
K_claim(H_AB) = K_claim(H_BA)
```

because endpoint and cumulative response both collide.

After the same history-sensitive continuation, the successor endpoints differ, so the successor `K_claim` states differ.

Classification:

```text
CLAIM_SUFFICIENT_ABSTRACTION_FAILS_DECLARED_CONTINUATION_CONGRUENCE
```

Earned anti-equivalence:

```text
claim sufficient now
!=
compositionally closed state later
```

This is the chamber's strongest negative result against silently promoting #709/#712 claim-conditioned projections into foundational transport state.

---

## 7. Richer declared operational abstraction passed G0 non-vacuously

`K_declared` retains endpoint, previous action identity, and operational lineage while omitting `receipt_variant`.

The non-singleton fiber:

```text
{ H_AB, H_AB_DUP }
```

survived every preregistered continuation in `G0` with representative-independent successor projection.

The executable therefore constructed a finite abstract update table:

```text
U_q : K_declared_state -> K_declared_state
```

for each `q in G0`, with every representative of a common `K_declared` class yielding the same successor `K_declared` class.

Classification:

```text
DECLARED_OPERATIONAL_ABSTRACTION_PASSES_FINITE_CONTINUATION_CONGRUENCE_OVER_G0
```

The result is explicitly non-vacuous because at least one class contains two distinct custodied histories.

Earned distinction:

```text
ledger used to witness quotient validity
!=
ledger reread required to disambiguate every abstract update
```

inside the authored finite grammar only.

---

## 8. Grammar-widening hostile defeated the same quotient

`Q_RECEIPT_SENSITIVE` was preregistered outside `G0`.

It consumes the previously operationally irrelevant `receipt_variant` and perturbs `R1` and `R1_DUP` differently.

Before the widened continuation:

```text
K_declared(H_AB) = K_declared(H_AB_DUP)
```

After `Q_RECEIPT_SENSITIVE`:

```text
K_declared(H_AB · Q_RECEIPT_SENSITIVE)
!=
K_declared(H_AB_DUP · Q_RECEIPT_SENSITIVE)
```

Classification:

```text
COMPOSITIONAL_CLOSURE_IS_GRAMMAR_RELATIVE_IN_AUTHORED_FIXTURE
```

Earned law:

```text
closed under declared grammar
!=
closed under every future grammar
```

If a future TD613 chamber admits receipt-sensitive continuations, the abstraction must be refined or the system must abstain. The earlier `G0` closure result cannot silently expand its jurisdiction.

---

## 9. Parent-custody nonmutation

The executable snapshotted the inherited #712 result and #709 universe before and after the continuation assay.

The snapshots remained identical and recursively frozen.

Every successor history was freshly constructed.

Therefore:

```text
operational quotient
!=
custody deletion authority
```

and:

```text
new compositional assay
!=
authority to rewrite parent custody
```

---

## 10. Witness routing and visible scars

The scientific branch was temporarily based on locked `main` only because the existing consolidated workflow listens for pull-request events targeting `main`.

The scientific head remained:

```text
c5c4f4d47cf00484b693a625e24ae0391a23d62b
```

No executable scientific value changed during routing.

Two non-authoritative routing runs remain visible:

```text
run 2068 / 32677371651 -> CANCELLED
run 2069 / 32677379339 -> CANCELLED
```

Run 2069 came from an unnecessary `ready_for_review` routing pulse. Because the full stacked ancestry was visible against `main`, that event admitted front-line browser shards. The mistake was not laundered as extra evidence.

The PR was returned to Draft and closed/reopened at the same exact scientific head. Same-head workflow concurrency cancelled the noisy run and admitted the authoritative reopened-event witness:

```text
run 2070 / 32677475237 -> SUCCESS
static job 97288161317 -> SUCCESS
```

In authoritative run 2070:

```text
front-line browser matrix -> SKIPPED
Giving/practice browser witness -> SKIPPED
explicit full-repository validation -> SKIPPED
explicit self-hosted calibration -> SKIPPED
```

The consolidated static job recorded success through the full static estate, including:

```text
Validate Ash A15 empirical profile journeys and A15-R0 research field -> SUCCESS
```

After run 2070 settled, #713 was restored to scientific parent #712.

The routing error and correction remain part of custody because:

```text
failed or noisy routing attempt
!=
permission to rewrite experimental history
```

---

## 11. Canonical bounded classification and claim

Classification:

```text
FINITE_GRAMMAR_RELATIVE_COMPOSITIONAL_REPLAY_CLOSURE_WITH_PROJECTION_COUNTEREXAMPLES
```

Strongest permitted bounded claim:

```text
IN_THE_AUTHORED_FINITE_CONTINUATION_GRAMMAR_A_COMMON_ENDPOINT_OR_CURRENT_CLAIM_SUFFICIENT_PROJECTION_CAN_COLLAPSE_HISTORIES_THAT_A_DECLARED_HISTORY_SENSITIVE_CONTINUATION_LATER_SEPARATES_WHILE_A_RICHER_OPERATIONAL_ABSTRACTION_WITH_A_NONTRIVIAL_RECEIPT_LEVEL_COLLISION_REMAINS_REPRESENTATIVE_INDEPENDENT_UNDER_EVERY_PREREGISTERED_G0_CONTINUATION_AND_FAILS_WHEN_THE_GRAMMAR_IS_EXPLICITLY_WIDENED_TO_A_RECEIPT_SENSITIVE_CONTINUATION
```

---

## 12. Claim ceiling

This receipt does **not** earn:

- a generic right-congruence theorem;
- Myhill–Nerode identification or a minimal-automaton theorem;
- a bisimulation theorem;
- a predictive-state-representation theorem;
- a Markov-state theorem;
- a minimal sufficient state or optimal state-abstraction theorem;
- a causal-state or state-minimization theorem;
- a generic history-compression theorem;
- a general controlled-sensing or path-dependence theorem;
- path-object promotion;
- a path category or path groupoid;
- a transport functor or connection;
- a loop endomorphism;
- holonomy or curvature;
- Berry structure or quantum behavior;
- canonical operator-tomography promotion;
- Proto-Loom;
- a TD613-general theorem;
- A16 reopening;
- live Ash mutation;
- merge, production, or Vercel authority.

External mathematical vocabulary remains comparison discipline only.

---

## 13. Human path-object seam

The chamber establishes something narrower and more useful than a premature transport claim:

```text
some present-time projections are too lossy to define future continuation classes
```

while:

```text
a richer custody-derived operational abstraction can support representative-independent finite updates over an explicitly declared grammar
```

without becoming globally canonical.

The next decision is therefore genuinely constitutional rather than cosmetic:

```text
STOP_FOR_HUMAN_𝄐_BEFORE_PROMOTING_ANY_VALIDATED_QUOTIENT_CLASS_TO_A_PATH_OBJECT_OR_AUTHORING_PATH_CATEGORY_GRAMMAR
```

The human seam must choose between at least two scientifically defensible routes:

```text
A. promote the validated G0 quotient only as the object set for a first bounded path-category composition assay

B. widen the continuation grammar first with exogenous-time / no-question drift controls before allowing any path-object promotion
```

No choice is made by this receipt.

The ledger remembers the walk.
The quotient has now shown that, within one declared grammar, it can continue a walk without asking the ledger to reconstruct distinctions the quotient itself erased.
Whether that earns the name path object remains human-gated.

𝌋

Sealed ⟐