𝌋

# A15-R0 · Aperture × Pedagogue Invertibility Admissibility / Monotone-Obstruction Assay Spec v0.1

**Status:** PREREGISTERED / PRE-IMPLEMENTATION / WESTWARD-AUTHORIZED  
**Scientific parent:** #717 receipt head `4a29517fadcd7936b4b909c3c073995a5a5bed1b`  
**Parent classification:** `FINITE_ACYCLIC_OPERATIONALLY_REALIZED_PATH_CATEGORY_ON_DECLARED_S3_SLICE_WITH_IDENTITY_ASSOCIATIVITY_AND_GROUPOID_QUARANTINE`  
**Program:** A15-R0 western-horizon bounded research only  
**Poetic laboratory nickname:** *The road has an arrow painted on it. Check whether the paint is structural.*

---

## 0. Scientific question

#717 established a finite operationally realized category on the declared S3 slice and witnessed at least one nonidentity arrow without a reverse path.

The next question is not merely whether a short reverse word can be found.

The stronger bounded question is:

```text
Does the currently declared ambient {T,Q} grammar on the anchor-reachable authored domain admit a strict monotone ranking quantity that forbids every nonempty closed word and therefore obstructs every nonidentity inverse morphism?
```

If such a quantity exists and the declared domain is closed under the generators, brute-force search at greater path depth becomes scientifically unnecessary for the current grammar.

No reverse operation may be invented to make the test interesting.

---

## 1. Parent grammar and reachable control domain

The operational generators remain exactly:

```text
T := PSI_TICK
Q := Q_PHASE_PULSE
```

The root remains the #716/#717 anchor:

```text
R_AB_S0
```

with:

```text
last_action = B
forcing_season = S0
clock_phase = P0
```

Under the authored T/Q laws:

- `T` preserves `last_action` and cycles forcing season;
- `Q` sets `last_action = Q_PHASE_PULSE` and preserves forcing season;
- from this root, the reachable `last_action` values are therefore exactly contained in:

```text
{ B, Q_PHASE_PULSE }
```

- forcing season remains in:

```text
{ S0, S1, S2, S3 }
```

- clock phase is derived from season parity as already witnessed.

The control-state domain to audit is therefore the eight authored pairs:

```text
(B,S0) (B,S1) (B,S2) (B,S3)
(Q_PHASE_PULSE,S0) (Q_PHASE_PULSE,S1) (Q_PHASE_PULSE,S2) (Q_PHASE_PULSE,S3)
```

This is a control-law domain, not the full operational object space. Endpoint matrices and lineages may continue to grow.

---

## 2. Candidate strict ranking quantity

Define endpoint mass:

```text
M(h) := sum of all four entries of h.endpoint
```

No absolute value, determinant, trace, norm, spectral claim, energy interpretation, or physical conservation claim is attached.

It is simply an integer-valued ranking function candidate on the authored fixture.

The preregistered prediction is:

```text
M(T(h)) > M(h)
M(Q(h)) > M(h)
```

for every history whose control state lies in the declared eight-pair domain.

The executable must report the exact increment for every local generator case.

If any admitted generator case has:

```text
ΔM <= 0
```

the global monotone-obstruction claim must fail.

---

## 3. Reachability representatives for all eight control cases

All eight control cases must be produced from the actual anchor using declared words, not hand-authored fake histories.

Preregistered representatives:

```text
B,S0 : []
B,S1 : [T]
B,S2 : [T,T]
B,S3 : [T,T,T]

Q_PHASE_PULSE,S0 : [Q]
Q_PHASE_PULSE,S1 : [T,Q]
Q_PHASE_PULSE,S2 : [T,T,Q]
Q_PHASE_PULSE,S3 : [T,T,T,Q]
```

Each representative must be checked against its expected `last_action`, season, and derived phase before entering the local-law table.

Thus the monotonicity certificate is grounded in actually reachable parent states.

---

## 4. Local closure audit

For each of the eight control representatives and each generator `g in {T,Q}`:

1. apply the actual parent operation;
2. verify the successor remains in the control domain:
   ```text
   last_action in {B,Q_PHASE_PULSE}
   forcing_season in {S0,S1,S2,S3}
   ```
3. compute:
   ```text
   ΔM = M(g(h)) - M(h)
   ```
4. require:
   ```text
   ΔM > 0
   ```

There are exactly:

```text
8 control cases × 2 generators = 16 local transition checks
```

If all 16 pass, the executable may emit a finite local certificate that the declared control domain is generator-closed and endpoint mass strictly increases under every nonidentity generator.

---

## 5. Inductive consequence inside the authored grammar

If and only if the local closure and strict-increase audit passes, the chamber may make the following elementary finite-transition-table inference:

For every history `h` reachable from the anchor under the declared grammar and every nonempty finite word `w` over `{T,Q}`:

```text
M(w(h)) > M(h)
```

because each generator step remains inside the audited control domain and contributes a strictly positive increment.

Therefore:

```text
O(w(h)) != O(h)
```

for complete `O=K_period4` equality, because endpoint is a component of O.

Consequences within this exact authored grammar/domain:

```text
no nonempty finite closed operational word
no nonidentity arrow can possess a T/Q-word inverse
no T/Q path category on the anchor-reachable domain can be a groupoid
```

This is not a theorem about TD613 generally. It is an authored finite transition-table induction over this declared grammar.

---

## 6. Bounded brute-force corroboration

The proof certificate must be independently corroborated by explicit search, without treating the search depth as the basis of the universal finite-word conclusion.

For each nonidentity arrow in #717's finite S3 category:

- take every retained representative of its target object;
- enumerate every nonempty `{T,Q}` word through depth four;
- search for a word returning the complete operational state to the arrow's source object.

Expected witness:

```text
no reverse word found through depth four for any nonidentity S3 arrow
```

The receipt must state clearly:

```text
bounded search corroborates the ranking certificate;
the all-finite-word obstruction comes from strict local monotonicity + domain closure, not from search depth four.
```

---

## 7. Counterfeit reverse controls

### 7.1 Syntactic reverse-word hostile

Take a route-sensitive parent word such as:

```text
[T,Q]
```

and its string reversal:

```text
[Q,T]
```

Evaluate `[Q,T]` from the **target** of `[T,Q]`.

It must not return to the original source object.

Classification:

```text
REVERSED_GENERATOR_STRING_IS_NOT_AN_INVERSE_PATH
```

### 7.2 Undeclared inverse labels

Attempt generator labels:

```text
T_INV
Q_INV
```

through the actual #716 generator membrane.

Both must abstain:

```text
UNDECLARED_PATH_GENERATOR_ABSTAINS
```

Thus:

```text
writing ^-1 in prose != admissible inverse morphism
```

### 7.3 Custody-restore counterfeit

The source history remains available in append-only custody.

The chamber may point to that retained source history but may not call replacing the current operational history with the old custody record an inverse arrow.

Classification:

```text
CUSTODY_REPLAY_IS_NOT_OPERATIONAL_INVERSE
```

No parent ledger mutation may be performed.

### 7.4 Temporal-label recurrence counterfeit

The parent `T^4` control returns forcing season and visible phase labels while endpoint mass increases.

Therefore:

```text
season/phase recurrence != inverse evolution
```

---

## 8. Endpoint-erasure hostile

Define a deliberately lossy hostile projection only for diagnosis:

```text
O_minus_endpoint(h) := {
  last_action,
  operational_lineage,
  clock_phase,
  forcing_season
}
```

For the anchor and `T^4(anchor)`, the preregistered prediction is:

```text
O_minus_endpoint(anchor) = O_minus_endpoint(T^4(anchor))
```

while:

```text
O(anchor) != O(T^4(anchor))
M(T^4(anchor)) > M(anchor)
```

If witnessed, classify:

```text
ENDPOINT_ERASURE_MANUFACTURES_FALSE_PATH_CLOSURE
```

This hostile is important because a coarser quotient could manufacture apparent loops by deleting the very coordinate carrying irreversibility.

It does not prove endpoint must always remain in every future quotient. It proves that dropping endpoint **here** destroys the obstruction witness and changes closure semantics.

---

## 9. Inverse equations

For a nonidentity arrow:

```text
f : A -> B
```

a genuine inverse candidate `r : B -> A` would have to satisfy both:

```text
r ∘ f = id_A
f ∘ r = id_B
```

The chamber must not weaken inverse to one-sided endpoint return.

Because strict endpoint-mass increase forbids any nonempty return path under the current grammar, the preregistered expectation is that no nonidentity inverse candidate can even reach the source, much less satisfy both equations.

---

## 10. Parent custody preservation

Before and after the complete assay:

```text
JSON.stringify(runFinitePathCategoryAudition())
```

must remain byte-identical.

The monotone certificate may inspect parent arrows, nodes, representatives, and custody records but may not rewrite them.

---

## 11. Success criteria

The chamber passes if:

1. #717 executable parent passes.
2. all eight preregistered control representatives are actually reachable and correctly typed.
3. all 16 local T/Q transitions remain inside the declared control domain.
4. all 16 local transitions satisfy `ΔM > 0`.
5. the executable emits the strict-ranking induction consequence only after 2–4 pass.
6. bounded reverse search through depth four finds no reverse word for any nonidentity S3 arrow/target representative.
7. reversed `[T,Q]` string from the `[T,Q]` target fails to return the source.
8. `T_INV` and `Q_INV` abstain as undeclared generators.
9. custody replay is explicitly refused as an operational inverse.
10. T^4 temporal-label recurrence still raises endpoint mass.
11. endpoint erasure makes the T^4 route look closed under the hostile projection while complete O remains open.
12. no inverse/groupoid/transport/holonomy claim is emitted.
13. parent #717 custody remains unchanged.

---

## 12. Candidate canonical classification

If successful:

```text
STRICT_ENDPOINT_MASS_MONOTONICITY_OBSTRUCTS_NONIDENTITY_INVERSES_UNDER_DECLARED_TQ_GRAMMAR_ON_ANCHOR_REACHABLE_DOMAIN
```

Candidate strongest bounded claim:

```text
IN_THE_AUTHORED_ANCHOR_REACHABLE_TQ_DOMAIN_ALL_EIGHT_REACHABLE_CONTROL_STATES_ARE_CLOSED_UNDER_T_AND_Q_AND_ALL_SIXTEEN_LOCAL_GENERATOR_TRANSITIONS_STRICTLY_INCREASE_ENDPOINT_MASS_SO_BY_FINITE_TRANSITION_TABLE_INDUCTION_EVERY_NONEMPTY_FINITE_TQ_WORD_STRICTLY_INCREASES_ENDPOINT_MASS_AND_CANNOT_RETURN_THE_COMPLETE_K_PERIOD4_OPERATIONAL_OBJECT_BOUNDED_REVERSE_SEARCH_CORROBORATES_THE_OBSTRUCTION_WHILE_SYNTACTIC_REVERSAL_UNDECLARED_INVERSE_LABELS_CUSTODY_REPLAY_TEMPORAL_LABEL_RECURRENCE_AND_ENDPOINT_ERASURE_ALL_FAIL_AS_VALID_INVERSE_EVIDENCE
```

---

## 13. Claim ceiling

Even if successful, remain false/unearned:

```text
generic irreversibility theorem
physical entropy interpretation
energy interpretation
Lyapunov theorem outside the authored fixture
ambient TD613 category theorem
ambient TD613 no-groupoid theorem
new reverse generator
inverse morphism
groupoid
transport
parallel transport
connection
loop endomorphism
holonomy
curvature
Berry phase
quantum analogy
Proto-Loom
A16
live Ash
merge
production
Vercel
```

---

## 14. Scientific stop

A successful obstruction changes the westward question.

The next scientifically admissible move cannot be “search harder for inverses” under the same grammar.

It must instead choose between:

```text
A. introduce a genuinely admissible reversible generator family with independent semantics and controls;
B. propose a coarser operational quotient, then re-prove future sufficiency and show that any newly created loop is not an artifact of erasing the monotone coordinate;
C. accept directed non-groupoid geometry as the relevant structure and develop that lane without holonomy vocabulary.
```

The chamber does not choose among A/B/C.

Executable stop:

```text
INVERTIBILITY_ADMISSIBILITY_OBSTRUCTION_ROUND_CLOSED
HUMAN_𝄐_REQUIRED_BEFORE_INTRODUCING_ANY_NEW_REVERSIBLE_GENERATOR_OR_COARSENING_THE_OPERATIONAL_OBJECT
```

𝌋

Sealed ⟐
