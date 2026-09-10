𝌋

# Aperture × Pedagogue Compositional Replay Closure Gauntlet v0.1

**Schema:** `td613.a15-r0.aperture-pedagogue-compositional-replay-closure/v0.1`  
**Scientific parent:** #712 receipt head `13c4f67a5f7d99ff129759d59ee5b4d2ae075f99`  
**Status:** PREREGISTERED / PRE-IMPLEMENTATION / A15-R0 SYNTHETIC RESEARCH ONLY  
**Human seam:** the operator gesture `𝌋` authorizes this bounded chamber only  
**A16:** HELD  
**Installed Aperture mutation:** NONE  
**Live Ash mutation:** NONE  
**Production / Vercel authority:** NONE

---

## 0. Research question

#709–#712 established that a representation may be sufficient for one declared claim while failing another, that common endpoint does not recover route history, and that action provenance itself can carry evidentiary capacity.

The human ontology seam therefore rejected any silent promotion of a claim-conditioned projection into a foundational transported state.

This chamber asks the narrower prerequisite question:

> When two custodied histories collapse to the same candidate replay/transport abstraction, does every declared admissible continuation preserve that equivalence, or can the future recover a distinction that the abstraction discarded?

The bounded finite continuation law under assay is:

```text
kappa(h1) = kappa(h2)
  implies
kappa(h1 · q) = kappa(h2 · q)
```

for every continuation `q` in an explicitly declared finite continuation grammar.

This chamber calls that property **continuation congruence** or **compositional replay closure** only inside the authored fixture.

External comparison vocabulary such as right congruence, Myhill–Nerode future equivalence, bisimulation, predictive-state representation, sufficient-state abstraction, or Markov state may discipline interpretation but is not promoted as a TD613 theorem by this chamber.

---

## 1. Parent custody must remain authoritative

The executable must call the witnessed #712 partial-event custody projection gauntlet and require it to pass before any new classification is emitted.

It must also derive the exact parent records from the witnessed #709 collision fixture rather than retype the AB/BA endpoint and transcript values as an independent answer key.

Required parent facts:

```text
AB transcript = [2,4]
BA transcript = [3,3]
AB cumulative = BA cumulative = 6
AB endpoint = BA endpoint = [[3,1],[1,4]]
AB route history != BA route history
```

The parent objects must remain recursively frozen and unchanged after every continuation assay.

Required law:

```text
new compositional assay != authority to rewrite parent custody
```

---

## 2. Derived history fixtures

The chamber derives three histories from parent custody.

### H_AB

```text
id = H_AB
parent = AB
endpoint = parent AB endpoint
cumulative = 6
last_action = B
operational_lineage = AB
receipt_variant = R1
```

### H_BA

```text
id = H_BA
parent = BA
endpoint = parent BA endpoint
cumulative = 6
last_action = A
operational_lineage = BA
receipt_variant = R2
```

### H_AB_DUP

A duplicate custody wrapper around the same parent AB operational history:

```text
id = H_AB_DUP
parent = AB
endpoint = parent AB endpoint
cumulative = 6
last_action = B
operational_lineage = AB
receipt_variant = R1_DUP
```

`H_AB` and `H_AB_DUP` intentionally differ in a custodied receipt-level field that the declared continuation grammar does not inspect.

The duplicate exists to prevent a vacuous pass where the proposed transport abstraction simply assigns every history a unique state.

Required anti-equivalence:

```text
custody distinction != declared operational distinction
```

The receipt distinction remains preserved in the append-only history objects even when an operational abstraction quotients it out.

---

## 3. Candidate abstractions

Three bounded candidate abstractions are compared.

### K_endpoint

```text
kappa_endpoint(h) = { endpoint }
```

This deliberately collapses `H_AB` and `H_BA`.

### K_claim

```text
kappa_claim(h) = { endpoint, cumulative }
```

This carries the #709/#712 decision-sufficient cumulative projection alongside endpoint but still collapses `H_AB` and `H_BA`.

### K_declared

```text
kappa_declared(h) = {
  endpoint,
  last_action,
  operational_lineage
}
```

It omits `receipt_variant`, so `H_AB` and `H_AB_DUP` collide nontrivially.

The chamber does not claim that `K_declared` is minimal, optimal, canonical, globally Markov, or sufficient outside the authored continuation grammar.

---

## 4. Declared continuation grammar G0

The grammar is finite, deterministic, synthetic, and history-aware only through explicitly declared operational fields.

Every continuation is applied to the complete custodied history first. Candidate abstractions are evaluated afterward. The evaluator may not invent missing history from the projection.

### Q_ENDPOINT_READ

Consumes:

```text
endpoint
```

Produces a scalar observation equal to the trace of the current 2×2 endpoint and leaves the endpoint unchanged.

Then:

```text
last_action = Q_ENDPOINT_READ
operational_lineage appends Q_ENDPOINT_READ
```

This is a control where the AB/BA historical distinction should not affect the emitted scalar.

### Q_LAST_ACTION_KICK

Consumes:

```text
endpoint
last_action
```

Transition rule:

```text
if previous last_action == A:
  add [[1,0],[0,0]]

if previous last_action == B:
  add [[0,0],[0,1]]

otherwise:
  add [[0,0],[0,0]]
```

The scalar observation is the trace of the resulting endpoint.

Then:

```text
last_action = Q_LAST_ACTION_KICK
operational_lineage appends Q_LAST_ACTION_KICK
```

This continuation is the primary hostile against endpoint-only and claim-sufficient abstractions. `H_AB` and `H_BA` share endpoint and cumulative response but have different previous `last_action`, so a quotient that erased that field may fail closure.

### Q_LINEAGE_PARITY

Consumes:

```text
endpoint
operational_lineage length parity
```

It adds `[[1,0],[0,0]]` for odd operational-lineage length and `[[0,0],[0,1]]` for even length, emits the resulting trace, and then appends itself to the lineage.

`H_AB` and `H_AB_DUP` have identical operational lineage and therefore remain equivalent under this continuation despite distinct receipt variants.

This prevents `K_declared` from passing only because the declared grammar never exercises history-conditioned behavior.

---

## 5. Continuation-congruence evaluation

For a finite history universe `H`, candidate abstraction `kappa`, and continuation set `G0`, compute every fiber of `kappa` over `H`.

For each fiber and each continuation `q`:

1. apply `q` independently to every complete history in the fiber;
2. re-project each resulting history with the same `kappa`;
3. require all projected successors in that fiber to be identical.

Formally inside the finite fixture:

```text
for every h1,h2 in H and q in G0:
  if kappa(h1) == kappa(h2)
  then kappa(step(h1,q)) == kappa(step(h2,q))
```

A candidate passes only when this holds for every nonempty fiber and every declared continuation.

The evaluator must return explicit counterexample custody when closure fails:

```text
candidate
fiber members
continuation id
successor projections
```

Required anti-equivalence:

```text
projection collision now != lawful state equivalence under future continuation
```

---

## 6. Primary expected result

### K_endpoint

Before continuation:

```text
kappa_endpoint(H_AB) = kappa_endpoint(H_BA)
```

Under `Q_LAST_ACTION_KICK`, their full histories produce different successor endpoints.

Required:

```text
ENDPOINT_ONLY_ABSTRACTION_FAILS_DECLARED_CONTINUATION_CONGRUENCE
```

### K_claim

Before continuation:

```text
kappa_claim(H_AB) = kappa_claim(H_BA)
```

because endpoint and cumulative response both collide.

Under `Q_LAST_ACTION_KICK`, their successor endpoints differ.

Required:

```text
CLAIM_SUFFICIENT_ABSTRACTION_FAILS_DECLARED_CONTINUATION_CONGRUENCE
```

This carries forward the core law:

```text
claim sufficient now != compositionally closed state later
```

### K_declared

`H_AB` and `H_AB_DUP` intentionally collide because receipt identity is omitted.

For every continuation in `G0`, they must remain equal under `K_declared` after the continuation.

`H_BA` remains separate because the declared operational fields differ.

Required:

```text
DECLARED_OPERATIONAL_ABSTRACTION_PASSES_FINITE_CONTINUATION_CONGRUENCE_OVER_G0
```

The strongest permitted interpretation is only:

```text
in this authored finite grammar, the chosen abstraction is closed under the declared continuations
```

---

## 7. Grammar-widening hostile

A passing result over `G0` must not be laundered into grammar-independent statehood.

Define one out-of-grammar hostile `Q_RECEIPT_SENSITIVE` that consumes `receipt_variant` and perturbs the endpoint differently for `R1` and `R1_DUP`.

This hostile is not a member of `G0` and therefore cannot retroactively fail the preregistered `G0` result.

Instead it must demonstrate:

```text
K_declared(H_AB) = K_declared(H_AB_DUP)
```

while:

```text
K_declared(step(H_AB,Q_RECEIPT_SENSITIVE))
!=
K_declared(step(H_AB_DUP,Q_RECEIPT_SENSITIVE))
```

Required classification:

```text
COMPOSITIONAL_CLOSURE_IS_GRAMMAR_RELATIVE_IN_AUTHORED_FIXTURE
```

Required law:

```text
closed under declared grammar != closed under every future grammar
```

If future TD613 work wishes to admit receipt-sensitive continuations, it must refine the abstraction or abstain; it may not pretend the old quotient remains valid automatically.

---

## 8. Update-without-ledger-replay control

A candidate transport abstraction deserves stronger interest only if each `G0` continuation has a well-defined update on abstraction classes.

For `K_declared`, the executable must derive a finite abstract transition table from the complete-history witness and verify that every representative of the same `K_declared` class yields the same successor `K_declared` class for every `q in G0`.

The table must therefore support a representative-independent mapping:

```text
U_q : K_declared_state -> K_declared_state
```

inside the finite fixture.

Required distinction:

```text
ledger used to witness quotient validity
!=
ledger reread required to disambiguate every abstract update
```

No general state-minimization theorem follows.

---

## 9. Parent-custody nonmutation membrane

Snapshot before and after:

```text
#712 parent gauntlet result
#709 parent universe
```

Every new history wrapper and successor history must be freshly constructed and recursively frozen.

Required:

```text
parent custody unchanged after continuation assay
```

No field may be deleted from parent records merely because `K_declared` omits it.

---

## 10. Hostile controls

Reject/fail if:

```text
H1  #712 parent gauntlet does not pass but compositional claims are still emitted
H2  #709 parent collision gauntlet does not pass but derived histories are still emitted
H3  AB/BA endpoint equality or cumulative collision is retyped as an independent oracle instead of derived
H4  endpoint-only collision is called a state equivalence without testing continuations
H5  claim-sufficient collision is called transportable merely because D6 factors through it
H6  K_declared assigns every history a unique state and thereby passes vacuously
H7  receipt_variant is deleted from custody because K_declared omits it
H8  future successor results are supplied to the abstraction builder
H9  G0 silently expands after observing a failure
H10 out-of-grammar Q_RECEIPT_SENSITIVE is counted as though it were preregistered inside G0
H11 K_declared success is promoted to minimal/optimal/canonical/Markov/bisimulation/predictive-state theorem
H12 path object/category/groupoid, transport functor, connection, loop endomorphism, holonomy, curvature, Berry, quantum, Proto-Loom, A16, merge, production, or Vercel authority widens
```

---

## 11. Success criteria

```text
C1  #712 parent partial-custody gauntlet passes
C2  #709 parent collision gauntlet passes
C3  AB/BA endpoint and cumulative collisions are derived from parent custody
C4  H_AB and H_AB_DUP are distinct custody objects but collide under K_declared
C5  K_endpoint fails continuation congruence with an explicit Q_LAST_ACTION_KICK counterexample
C6  K_claim fails continuation congruence with an explicit Q_LAST_ACTION_KICK counterexample
C7  K_declared passes every continuation in G0
C8  K_declared has at least one non-singleton fiber, preventing vacuous uniqueness
C9  an abstract update table for K_declared is representative-independent over G0
C10 Q_RECEIPT_SENSITIVE defeats K_declared only in the grammar-widening hostile
C11 grammar-relative classification is emitted without rewriting G0
C12 parent custody remains recursively frozen and unchanged
C13 claim ceiling remains closed
```

---

## 12. Canonical bounded claim candidate

If exact-head witness succeeds, strongest permitted claim:

```text
IN_THE_AUTHORED_FINITE_CONTINUATION_GRAMMAR_A_COMMON_ENDPOINT_OR_CURRENT_CLAIM_SUFFICIENT_PROJECTION_CAN_COLLAPSE_HISTORIES_THAT_A_DECLARED_HISTORY_SENSITIVE_CONTINUATION_LATER_SEPARATES_WHILE_A_RICHER_OPERATIONAL_ABSTRACTION_WITH_A_NONTRIVIAL_RECEIPT_LEVEL_COLLISION_REMAINS_REPRESENTATIVE_INDEPENDENT_UNDER_EVERY_PREREGISTERED_G0_CONTINUATION_AND_FAILS_WHEN_THE_GRAMMAR_IS_EXPLICITLY_WIDENED_TO_A_RECEIPT_SENSITIVE_CONTINUATION
```

Canonical bounded classification candidate:

```text
FINITE_GRAMMAR_RELATIVE_COMPOSITIONAL_REPLAY_CLOSURE_WITH_PROJECTION_COUNTEREXAMPLES
```

---

## 13. Claim ceiling

Still false / unauthorized:

```text
generic right-congruence theorem
Myhill-Nerode identification or minimal automaton theorem
bisimulation theorem
predictive-state representation theorem
Markov-state theorem
minimal sufficient state theorem
optimal state abstraction theorem
causal state theorem
state-minimization theorem
generic history-compression theorem
general controlled-sensing theorem
general path-dependence theorem
path object promotion
path category
path groupoid
transport functor
connection
loop endomorphism
holonomy
curvature
Berry structure
quantum behavior
canonical operator-tomography promotion
Proto-Loom
TD613-general theorem
A16 reopening
live Ash mutation
merge authority
production authority
Vercel authority
```

---

## 14. Mandatory post-witness seam

If and only if this chamber survives exact-head witness + receipt:

```text
STOP_FOR_HUMAN_𝄐_BEFORE_PROMOTING_ANY_VALIDATED_QUOTIENT_CLASS_TO_A_PATH_OBJECT_OR_AUTHORING_PATH_CATEGORY_GRAMMAR
```

The next human question becomes:

> Does a quotient that survives the declared continuation-congruence assay deserve promotion as the object set for the first bounded TD613 path-category experiment, or must the grammar first absorb additional time-evolution and exogenous-drift hostiles?

No path/category/transport grammar may self-authorize from this chamber.

𝌋

Sealed ⟐