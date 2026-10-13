𝌋

󐘓 U+10D613

# A15-R0 · Finite Admissibility Descent Theorem · Receipt

Status: **WITNESSED / RECEIPT-PINNED / DRAFT / OPEN / UNMERGED**

Parent scientific receipt:

```text
#751 = b9a0d13e43d80f59769788da31d87951ec8ea8ee
```

Gate:

```text
#737 = THREAD_SCOPED_ACTIVE for the present conversation
```

---

## 0. Custody

```text
branch anchor          exact #751 receipt
preregistration        bdb8fd665b7b83b99482f3269d2434de5f16b4e2
implementation         b1575c150e9465b0c9cfc521d3f9fc3026fdc85d
pre-freeze key repair  59048fe08e3b405a8256eff1fae3b8a1f7d76834
hostile tests          548176079fd45de7c621b373300317ef950c5133
frozen science         7e80198e8fae8a11879cabc622651e47a9792d71
initial routing        8dc46e129953e237872511f6302c23d1ce0b2b00
routed witness         d13b38e1e91bb09c150e32a4f3394062349b0d1d
post-route cleanup     575851b184d8308c2a4df0ff8f0bdcc413993767
receipt head           SELF
```

Frozen science -> cleanup: **zero net changed files**.

Operational scars:

- one duplicate branch-create call returned `422 Reference already exists`; no mutation resulted;
- initial `main` routing did not immediately attach Actions;
- one metadata-only synchronization annotation produced the authority-bearing exact-head event;
- no scientific mutation occurred after freeze.

Pre-freeze hygiene repair:

- support-set signatures were changed from delimiter joining to JSON encoding of canonical atom-key arrays to remove an unnecessary signature-collision surface;
- theorem, hostiles, and claim scope were unchanged.

---

## 1. Authority-bearing witness

```text
TD613 Consolidated Validation run 2184 / 32771872783   SUCCESS
classifier job 97573825881                               SUCCESS
static job     97573919899                               SUCCESS
A15/A15-R0 step 19                                       SUCCESS
```

Skipped and not claimed:

- explicit full-repository validation;
- explicit self-hosted calibration;
- Giving/practice browser witness;
- front-line browser witness;
- full-product browser witness.

No scientific red occurred.

---

## 2. Finite theorem data

Let:

```text
X = finite antecedent-state set
Y = finite surviving-state set
Z = finite downstream-value universe
q : X -> Y
K : X -> P(Z).
```

Only occupied quotient states carry theorem authority:

```text
Y_q = q(X).
```

For `y in Y_q`, define:

```text
F_y = q^-1(y)
U_y = union_(x in F_y) K_x
I_y = intersection_(x in F_y) K_x
Gamma_y = U_y \ I_y
Delta_y = |Gamma_y|.
```

Unoccupied `y` receive no invented intersection convention and no descended admissibility rule.

---

## 3. Earned exact descent theorem

An exact descended rule is

```text
Kbar : Y_q -> P(Z)
```

with

```text
Kbar(q(x)) = K_x
```

for every `x in X`.

Exactly:

```text
exact descended admissibility exists
iff
K_x is constant on every quotient fiber
iff
U_y = I_y for every occupied y
iff
Gamma_y is empty for every occupied y.
```

Necessity: a single surviving value `Kbar(y)` cannot equal two unequal antecedent supports.

Sufficiency: fiberwise support constancy supplies the unique common support to assign at each occupied `y`.

This is a finite set theorem.

---

## 4. Earned universal soundness/completeness extremals

For any occupied `y` and candidate surviving support `A_y subseteq Z`:

```text
A_y universally sound
iff
A_y subseteq K_x for every x in F_y
iff
A_y subseteq I_y.
```

Therefore:

```text
I_y = largest universally sound surviving support.
```

Likewise:

```text
A_y universally complete
iff
K_x subseteq A_y for every x in F_y
iff
U_y subseteq A_y.
```

Therefore:

```text
U_y = smallest universally complete surviving support.
```

One rule is simultaneously universally sound and complete iff `U_y=I_y`.

---

## 5. Earned exact gap identity

Define:

```text
False_y(A) = A_y \ I_y
Omit_y(A)  = U_y \ A_y.
```

Then exactly:

```text
|False_y(A)| + |Omit_y(A)|
 = |Gamma_y|
 + |A_y\U_y|
 + |I_y\A_y|.
```

Hence:

```text
|False_y(A)| + |Omit_y(A)| >= |Gamma_y|.
```

Equality holds exactly when:

```text
I_y subseteq A_y subseteq U_y.
```

Thus `Delta_y=|Gamma_y|` is the exact finite lower bound on the universal false-admission-plus-omission discrepancy after incompatible antecedent supports have been collapsed into one surviving state.

No probability or weighting is involved.

---

## 6. Earned minimal-distortion frontier

For every tight candidate satisfying `I_y subseteq A_y subseteq U_y`, define uniquely:

```text
S_y = A_y \ I_y subseteq Gamma_y.
```

Then:

```text
A_y = I_y union S_y
False_y(A) = S_y
Omit_y(A)  = Gamma_y \ S_y
|False_y(A)|+|Omit_y(A)| = Delta_y.
```

Therefore every minimally distorted surviving rule is exactly a partition choice over the irreducible gap.

The theorem does **not** rank or choose among those tight rules.

---

## 7. Hostile controls

### H1 · exact descent positive

```text
q(a)=q(b)=y
q(c)=z
K_a=K_b={0,1}
K_c={2}
```

Result:

```text
all occupied gaps empty
exact descended rule witnessed.
```

### H2 · disjoint supports

```text
K_a={0}
K_b={1}
```

Result:

```text
U={0,1}
I={}
Gamma={0,1}
Delta=2
exact descent forbidden.
```

All four bounded candidate supports obeyed the exact gap identity and none achieved simultaneous soundness/completeness.

### H3 · overlap frontier

```text
K_a={0,1}
K_b={1,2}
```

Result:

```text
U={0,1,2}
I={1}
Gamma={0,2}
Delta=2.
```

Tight candidates witnessed:

```text
A={1}       -> false 0 / omit 2
A={0,1}     -> false 1 / omit 1
A={0,1,2}   -> false 2 / omit 0.
```

Each score equals `Delta=2`.

Outside-envelope controls:

```text
A={0,1,2,3} -> score 3 due one value outside U
A={0}       -> score 3 due omission of one value from I.
```

### H4 · empty-fiber discipline

Unoccupied quotient states returned:

```text
UNOCCUPIED_QUOTIENT_STATE_HAS_NO_DESCENT_AUTHORITY
```

### H5 · local/global criterion

A quotient with one constant-support fiber and one incompatible-support fiber correctly preserved local exactness on the first while forbidding one global exact descended map.

### H6 · renaming/order invariance

Renaming antecedents/quotient labels and reordering supports preserved union/intersection/gap and descent verdicts.

---

## 8. #751 is an exact instance

The exact #751 route-erasure hostile instantiates the finite theorem with:

```text
X = exact route fiber G_c
Y = {c}
q = route erasure to fixed C1 state c
K_w = exact #751 raw seam support.
```

For:

```text
c=(5,0,3,9)
```

#751 supplied:

```text
support cardinalities 4,4
|U|=6
|I|=2
|Gamma|=4
exact descent forbidden.
```

The general #752 theorem reproduced those values exactly.

Positive bridge:

```text
c=(3,0,1,1)
```

reproduced:

```text
Gamma empty
exact descent witnessed.
```

Thus #751 is a strict finite instantiation of #752, not a separate heuristic analogy.

---

## 9. Earned classifications

Canonical:

```text
FINITE_ADMISSIBILITY_DESCENDS_EXACTLY_THROUGH_A_FINITE_QUOTIENT_IF_AND_ONLY_IF_THE_ANTECEDENT_LAWFUL_SUPPORT_MAP_IS_CONSTANT_ON_EVERY_QUOTIENT_FIBER
```

Consequential:

```text
WHEN_A_QUOTIENT_FIBER_CONTAINS_INCOMPATIBLE_LAWFUL_SUPPORTS_NO_SURVIVING_RULE_CAN_BE_SIMULTANEOUSLY_UNIVERSALLY_SOUND_AND_COMPLETE_AND_THE_UNION_MINUS_INTERSECTION_IS_AN_EXACT_FINITE_CERTIFICATE_OF_THE_OBSTRUCTION
```

Sharp gap law:

```text
FOR_ANY_SURVIVING_SUPPORT_THE_SUM_OF_UNIVERSAL_FALSE_ADMISSION_AND_OMISSION_CARDINALITIES_IS_AT_LEAST_THE_UNION_INTERSECTION_GAP_WITH_EQUALITY_EXACTLY_FOR_SUPPORTS_BETWEEN_INTERSECTION_AND_UNION
```

Architectural:

```text
ERASING_A_CONDITIONING_STATE_CAN_DESTROY_THE_EXISTENCE_OF_AN_EXACT_ADMISSIBILITY_RULE_AT_THE_SURVIVING_LAYER_EVEN_WHEN_EVERY_ANTECEDENT_RULE_WAS_EXACT_BEFORE_QUOTIENTING
```

---

## 10. Good-through-󐘓 U+10D613

```text
observable equivalence does not imply admissibility equivalence
lawful support must be constant on erased-state fibers before exact descent is authorized
union preserves completeness by admitting cross-antecedent counterfactuals
intersection preserves soundness by suppressing antecedent-specific lawful values
an irreducible gap must remain visible rather than be silently resolved
minimal distortion does not identify a uniquely correct surviving rule
no surviving representation may claim erased conditioning authority it no longer possesses
```

---

## 11. Claim ceiling

No authority follows for:

- infinite sets, limits, asymptotic regimes, or thermodynamic interpretations;
- probability, entropy, expectation, average-case coding, or statistical decision theory;
- a preferred optimization rule over the minimal frontier;
- category theory, sheaf theory, topology, type theory, logic, homology, or geometry;
- causal inference or real-world provenance reconstruction;
- a claim that quotienting is intrinsically harmful;
- trees, DAGs, parenthesization, or unrestricted workflow grammars;
- Proto-Loom/A16 promotion;
- live Ash mutation;
- merge, publication, production, Vercel release, or ontology promotion.

---

## 12. Stop boundary

The preregistered general finite theorem has been earned.

No additional theorem chamber is required merely to rename, restate, or ornament this result.

A future 𝄐 may apply this theorem to child-legible AIA or another bounded architecture, but such work is downstream instantiation rather than a missing premise of the theorem itself.

```text
FINITE_ADMISSIBILITY_DESCENT_THEOREM_ROUND_CLOSED
GENERAL_FINITE_DESCENT_IFF_FIBERWISE_SUPPORT_CONSTANCY_EARNED
UNION_INTERSECTION_EXTREMALS_EARNED
EXACT_IRREDUCIBLE_GAP_IDENTITY_EARNED
MINIMAL_FRONTIER_PARTITION_LAW_EARNED
THE_THEOREM_BOUNDARY_REACHED
NO_ASYMPTOTIC_ESCAPE
```

𝌋

Sealed ⟐