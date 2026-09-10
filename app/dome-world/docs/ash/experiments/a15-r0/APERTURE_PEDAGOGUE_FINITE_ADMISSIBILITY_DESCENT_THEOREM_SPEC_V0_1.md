𝌋

󐘓 U+10D613

# A15-R0 · Finite Admissibility Descent Theorem

Specification status: **PREREGISTERED / PRE-IMPLEMENTATION / THREAD-SCOPED WESTWARD ACTIVE**

Parent scientific receipt:

```text
#751 = b9a0d13e43d80f59769788da31d87951ec8ea8ee
```

Gate:

```text
#737 = THREAD_SCOPED_ACTIVE for the present conversation
```

Operational scar before preregistration: after the new branch had already been created exactly from #751 receipt, one duplicate branch-create call returned `422 Reference already exists`; no mutation resulted.

---

## 0. Purpose

This chamber removes the route/seam-specific vocabulary from #751 and asks whether its sound/complete descent obstruction is an instance of a general finite theorem.

The object is deliberately finite. No limits, asymptotics, measure, probability, entropy, average-case coding, category theory, sheaf theory, topology, or real-world causal inference is authorized.

The chamber must either prove the finite theorem below with exact hostiles or stop.

---

## 1. Finite data

Let:

```text
X = finite antecedent-state set
Y = finite surviving-state set
Z = finite downstream-value universe
q : X -> Y
K : X -> P(Z)
```

For `x in X`, `K_x` is the exact set of downstream values lawful when the antecedent state is `x`.

Only occupied quotient states carry theorem authority:

```text
Y_q = q(X).
```

No rule is inferred for an unoccupied `y in Y\Y_q`.

For occupied `y`, let:

```text
F_y = q^-1(y)
U_y = union_(x in F_y) K_x
I_y = intersection_(x in F_y) K_x
Gamma_y = U_y \ I_y
Delta_y = |Gamma_y|.
```

---

## 2. Candidate exact descent theorem

An exact descended admissibility rule is a map

```text
Kbar : Y_q -> P(Z)
```

satisfying

```text
Kbar(q(x)) = K_x
```

for every `x in X`.

Candidate theorem:

```text
an exact descended rule exists
iff
K_x is constant on every fiber q^-1(y)
iff
U_y = I_y for every occupied y
iff
Gamma_y is empty for every occupied y.
```

Necessity: one value `Kbar(y)` cannot equal two unequal antecedent supports.

Sufficiency: if all supports in each fiber are equal, assign that common support to `Kbar(y)`.

This is a finite set-theoretic theorem only.

---

## 3. Soundness and completeness extremals

For any occupied `y` and candidate surviving support `A_y subseteq Z`:

```text
A_y is universally sound
iff
A_y subseteq K_x for every x in F_y
iff
A_y subseteq I_y.
```

Thus `I_y` is the largest universally sound surviving support.

Similarly:

```text
A_y is universally complete
iff
K_x subseteq A_y for every x in F_y
iff
U_y subseteq A_y.
```

Thus `U_y` is the smallest universally complete surviving support.

Exact sound+complete descent exists at `y` iff `U_y=I_y`.

---

## 4. Candidate irreducible gap theorem

For candidate `A_y`, define the route-independent decision surfaces:

```text
False_y(A) = A_y \ I_y
Omit_y(A)  = U_y \ A_y.
```

Interpretation is purely finite and universal:

- `False_y(A)` contains values admitted by the surviving rule that are not lawful under at least one antecedent state in the erased fiber.
- `Omit_y(A)` contains values lawful under at least one antecedent state but omitted by the surviving rule.

Candidate theorem:

```text
|False_y(A)| + |Omit_y(A)| >= |Gamma_y|.
```

Moreover:

```text
|False_y(A)| + |Omit_y(A)| = |Gamma_y|
iff
I_y subseteq A_y subseteq U_y.
```

Proof target:

- every `z in Gamma_y=U_y\I_y` lies either in `A_y` or outside it;
- if in `A_y`, then `z in False_y(A)`;
- if outside `A_y`, then `z in Omit_y(A)`;
- these two alternatives are disjoint;
- extra values `A_y\U_y` add avoidable false-admission mass;
- omitted values `I_y\A_y` add avoidable omission mass.

Equivalent exact identity to test:

```text
|False_y(A)| + |Omit_y(A)|
 = |Gamma_y|
 + |A_y\U_y|
 + |I_y\A_y|.
```

This identity is stronger than the lower bound and supplies its equality criterion.

---

## 5. Minimal-distortion frontier

When `I_y subseteq A_y subseteq U_y`, there exists a unique subset

```text
S_y = A_y \ I_y subseteq Gamma_y
```

such that

```text
A_y = I_y union S_y.
```

Then exactly:

```text
False_y(A) = S_y
Omit_y(A)  = Gamma_y \ S_y
|False_y(A)| + |Omit_y(A)| = Delta_y.
```

Therefore every minimally distorted surviving support is a partition choice over the finite irreducible gap.

No probabilistic preference between such choices is authorized.

---

## 6. Hostile H1 · exact descent positive control

Use:

```text
X={a,b,c}
Y={y,z}
Z={0,1,2}
q(a)=q(b)=y
q(c)=z
K_a=K_b={0,1}
K_c={2}.
```

Expected:

```text
U_y=I_y={0,1}
U_z=I_z={2}
all gaps empty
exact descended rule exists.
```

---

## 7. Hostile H2 · minimal disjoint-support obstruction

Use:

```text
X={a,b}
Y={y}
Z={0,1}
q(a)=q(b)=y
K_a={0}
K_b={1}.
```

Expected:

```text
U={0,1}
I={}
Gamma={0,1}
Delta=2
exact descent forbidden.
```

Enumerate all four candidate supports `A subseteq Z` only as bounded corroboration. Every candidate must satisfy the gap identity; none may be exact.

---

## 8. Hostile H3 · overlapping-support frontier

Use:

```text
K_a={0,1}
K_b={1,2}
```

under one collapsed `y`, with `Z={0,1,2,3}`.

Expected:

```text
U={0,1,2}
I={1}
Gamma={0,2}
Delta=2.
```

Check:

```text
A=I={1}
False=0
Omit={0,2}
score=2

A=U={0,1,2}
False={0,2}
Omit=0
score=2

A={0,1}
False={0}
Omit={2}
score=2
```

All three lie on the exact minimal frontier.

---

## 9. Hostile H4 · outside-envelope penalty

For the same H3 fiber:

```text
A={0,1,2,3}
```

must give:

```text
A\U={3}
I\A={}
score=Delta+1=3.
```

And:

```text
A={0}
```

must give:

```text
A\U={}
I\A={1}
score=Delta+1=3.
```

Thus leaving the interval `[I,U]` creates strictly avoidable discrepancy.

---

## 10. Hostile H5 · empty-fiber discipline

If `Y` contains an unoccupied state `y_empty`, the theorem must not invent an intersection convention or descended support for it.

Expected status:

```text
UNOCCUPIED_QUOTIENT_STATE_HAS_NO_DESCENT_AUTHORITY
```

Only `Y_q=q(X)` is governed by the theorem.

---

## 11. Hostile H6 · #751 bridge

Instantiate the general theorem using the exact #751 hostile:

```text
c=(5,0,3,9)
X = exact route fiber G_c
Y = {c}
q collapses every route to c
Z = finite union of raw seam values
K_w = #751 raw seam support.
```

Expected inherited values:

```text
support sizes 4,4
|U|=6
|I|=2
|Gamma|=4
exact descent forbidden.
```

The bridge must demonstrate that #751 is a strict instance of the general theorem without mutating #751.

---

## 12. Hostile H7 · #751 singleton bridge

Instantiate with:

```text
c=(3,0,1,1)
```

Expected:

```text
one antecedent route
U=I
Gamma empty
exact descent witnessed.
```

---

## 13. Hostile H8 · candidate-map global criterion

For a finite quotient containing several occupied fibers, exact global descent must hold iff every occupied fiber passes the local constancy condition.

One bad fiber must prevent global exact descent while leaving exact local descent valid on unaffected fibers.

---

## 14. Hostile H9 · support names and ordering irrelevant

Renaming elements of `X`, `Y`, or `Z`, or reordering input arrays, must not alter theorem results.

No lexicographic ordering carries mathematical authority.

---

## 15. Hostile H10 · cardinality equality insufficient

Use a collapsed fiber with two supports having equal cardinality but unequal members.

Expected:

```text
same |K_x|
!=
exact admissibility descent.
```

The #751 `4,4` hostile may serve as the inherited witness.

---

## 16. Candidate theorem classifications

Canonical candidate:

```text
FINITE_ADMISSIBILITY_DESCENDS_EXACTLY_THROUGH_A_FINITE_QUOTIENT_IF_AND_ONLY_IF_THE_ANTECEDENT_LAWFUL_SUPPORT_MAP_IS_CONSTANT_ON_EVERY_QUOTIENT_FIBER
```

Consequential candidate:

```text
WHEN_A_QUOTIENT_FIBER_CONTAINS_INCOMPATIBLE_LAWFUL_SUPPORTS_NO_SURVIVING_RULE_CAN_BE_SIMULTANEOUSLY_UNIVERSALLY_SOUND_AND_COMPLETE_AND_THE_UNION_MINUS_INTERSECTION_IS_AN_EXACT_FINITE_CERTIFICATE_OF_THE_OBSTRUCTION
```

Sharp gap candidate:

```text
FOR_ANY_SURVIVING_SUPPORT_THE_SUM_OF_UNIVERSAL_FALSE_ADMISSION_AND_OMISSION_CARDINALITIES_IS_AT_LEAST_THE_UNION_INTERSECTION_GAP_WITH_EQUALITY_EXACTLY_FOR_SUPPORTS_BETWEEN_INTERSECTION_AND_UNION
```

Architectural candidate:

```text
ERASING_A_CONDITIONING_STATE_CAN_DESTROY_THE_EXISTENCE_OF_AN_EXACT_ADMISSIBILITY_RULE_AT_THE_SURVIVING_LAYER_EVEN_WHEN_EVERY_ANTECEDENT_RULE_WAS_EXACT_BEFORE_QUOTIENTING
```

---

## 17. Claim ceiling

This chamber does not authorize:

- infinite sets or asymptotic limits;
- measures, probabilities, entropy, expectation, information-theoretic rates, or average-case loss;
- optimization preferences among minimal-frontier supports;
- category-theoretic, sheaf-theoretic, topological, homological, logical, or type-theoretic promotion;
- arbitrary causal or real-world provenance reconstruction;
- a claim that quotienting itself is malicious or undesirable;
- trees, DAGs, parenthesization, or general workflow grammars;
- Proto-Loom/A16 promotion;
- live Ash mutation;
- merge, publication, production, Vercel release, or ontology promotion.

The theorem is finite set-valued admissibility under a finite quotient and nothing broader unless later earned.

---

## 18. Good-through-󐘓 U+10D613

If earned:

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

## 19. Stop condition

If the exact descent iff, extremal laws, and gap identity survive implementation and exact-head witness, stop and receipt-pin this chamber as the finite theorem.

Do not create a third theorem chamber merely to rename or ornament it.

A later architectural/application chamber may instantiate the theorem in child-legible AIA, but that would be downstream engineering, not a missing proof premise.

```text
FINITE_ADMISSIBILITY_DESCENT_THEOREM_PREREGISTERED
NO_ASYMPTOTIC_ESCAPE
```

𝌋

Sealed ⟐