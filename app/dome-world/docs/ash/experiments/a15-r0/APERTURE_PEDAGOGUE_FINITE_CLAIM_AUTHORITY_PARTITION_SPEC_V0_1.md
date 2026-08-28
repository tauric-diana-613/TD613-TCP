𝌋

󐘓 U+10D613

# A15-R0 · Finite Claim-Authority Partition

Specification status: **PREREGISTERED / PRE-IMPLEMENTATION / HUMAN-LEGIBLE APPLICATION CHAMBER**

Parent scientific receipt:

```text
#752 = 11eec2d52c7e1aa722e8664c0df4cd1a61d704f1
```

Gate:

```text
#737 = THREAD_SCOPED_ACTIVE for the present conversation
```

## 0. Purpose

#752 proves when exact admissibility survives finite quotienting and measures the irreducible union/intersection gap when it does not. This chamber asks the first architectural question after the theorem:

> What is the coarsest exact child-legible presentation of **universal claim authority** available at the surviving layer?

This chamber does not alter #752. It instantiates its finite theorem into an exact presentation law.

## 1. Declared finite object

Let `X,Y,Z` be finite sets, `q:X->Y`, and `K_x subseteq Z` exact antecedent lawful supports. For occupied `y in q(X)`, inherit from #752:

```text
U_y = union_(x in q^-1(y)) K_x
I_y = intersection_(x in q^-1(y)) K_x
Gamma_y = U_y\I_y.
```

Define three authority regions:

```text
ALL_y       = I_y
NONE_y      = Z\U_y
DEPENDENT_y = Gamma_y.
```

Candidate partition theorem:

```text
Z = ALL_y disjoint_union NONE_y disjoint_union DEPENDENT_y.
```

Exact semantics for every `z in Z`:

```text
z in ALL_y
iff
z is lawful for every antecedent x in q^-1(y).

z in NONE_y
iff
z is unlawful for every antecedent x in q^-1(y).

z in DEPENDENT_y
iff
there exist x1,x2 in q^-1(y)
with z lawful under x1 and unlawful under x2.
```

The fourth Boolean signature `lawful_for_all && unlawful_for_all` is impossible for occupied quotient fibers.

## 2. Candidate coarsest-exact authority theorem

Call a finite presentation classifier `C_y:Z->L` **universal-authority exact** when its output label is sufficient to recover both predicates:

```text
P_all(z)  = [z lawful under every antecedent in q^-1(y)]
P_none(z) = [z unlawful under every antecedent in q^-1(y)].
```

Candidate theorem:

```text
Any universal-authority-exact classifier must separate any two values whose
(P_all,P_none) signatures differ.
```

The three-region classifier above groups exactly equal signatures. Therefore it is the unique coarsest exact authority partition up to label renaming.

Consequently:

```text
minimum exact label count at y
=
number of nonempty sets among {ALL_y, NONE_y, DEPENDENT_y}.
```

In particular, when all three are nonempty, no exact two-label presentation exists.

## 3. Binary certainty lower bound

Fix semantic binary labels:

```text
UNIVERSALLY_ADMISSIBLE
UNIVERSALLY_INADMISSIBLE
```

A total binary presentation must assign every `z in Z` one of those two universal claims.

For every `z in DEPENDENT_y`, both universal claims are false. Therefore every total binary universal-claim presentation makes at least

```text
|DEPENDENT_y| = |Gamma_y|
```

false universal claims.

The bound is tight: label `ALL_y` admissible, `NONE_y` inadmissible, and choose either binary claim arbitrarily on each dependent value. Exactly the dependent values remain false.

Candidate classification:

```text
BINARY_CERTAINTY_ERROR_MIN_y = |Gamma_y|.
```

This is a finite deterministic presentation lower bound, not probability, entropy, calibration, or expected loss.

## 4. Primary three-region hostile

Synthetic finite quotient:

```text
X={a,b}
Y={y}
q(a)=q(b)=y
Z={0,1,2,3}
K_a={0,1}
K_b={0,2}
```

Then exactly:

```text
ALL_y={0}
DEPENDENT_y={1,2}
NONE_y={3}
```

All three authority classes are nonempty.

Required witness:

```text
minimum exact label count = 3
minimum false universal claims under any total semantic binary presentation = 2 = |Gamma_y|.
```

## 5. Exact-descent positive control

```text
X={a,b}
Y={y}
q(a)=q(b)=y
Z={0,1,2}
K_a=K_b={0,1}
```

Then:

```text
ALL_y={0,1}
DEPENDENT_y=empty
NONE_y={2}
```

Exact descent already holds by #752, and the authority partition correctly collapses to two nonempty statuses. No mandatory third label is claimed when the dependent region is empty.

## 6. #751/#752 bridge requirement

The implementation must accept a finite quotient/support instance directly and must also expose a bridge helper capable of classifying the inherited #751 route-erasure supports when supplied with an explicit finite ambient `Z`.

No bridge may infer erased route identity or fabricate values outside the supplied ambient set.

## 7. Child-legible rendering covenant

Exact rendering labels may be phrased:

```text
LAWFUL UNDER EVERY SURVIVING ANTECEDENT
UNLAWFUL UNDER EVERY SURVIVING ANTECEDENT
DEPENDS ON ERASED CONDITIONING INFORMATION
```

The third label is not `unknown` in the generic sense. It is a witnessed finite disagreement class.

Good-through-󐘓 U+10D613:

```text
mixed antecedent authority must remain visibly mixed
binary presentation may not launder conditioning dependence into certainty
unoccupied quotient states receive no claim authority
presentation exactness does not recover erased provenance
three-way authority status is about surviving universal jurisdiction, not ontological truth
```

## 8. Claim ceiling

This chamber does **not** claim:

- probability, confidence, entropy, calibration, or Bayesian uncertainty;
- infinite/asymptotic results;
- general three-valued logic semantics;
- Kleene/Priest/fuzzy logic equivalence;
- category/sheaf/type theory;
- causal reconstruction or actor identity;
- arbitrary UX optimality or human-factors optimality;
- Proto-Loom/A16 promotion;
- live Ash mutation;
- merge, publication, production, Vercel, or ontology promotion.

## 9. Earned stop condition

The chamber closes only if exact-head CI witnesses all of:

1. the three authority regions partition the finite ambient set exactly;
2. their universal semantics are exact;
3. the coarsest-exact classifier criterion holds;
4. minimum exact label count equals the number of nonempty authority regions;
5. the binary universal-claim error minimum equals `|Gamma_y|`;
6. the three-region hostile and exact-descent control both pass;
7. the #751/#752 bridge remains exact without provenance fabrication.

If earned, classify:

```text
FINITE_CLAIM_AUTHORITY_PARTITION_ROUND_CLOSED
TERNARY_AUTHORITY_PARTITION_IS_THE_UNIQUE_COARSEST_EXACT_UNIVERSAL_CLAIM_PRESENTATION
BINARY_CERTAINTY_ERROR_MINIMUM_EQUALS_THE_IRREDUCIBLE_DESCENT_GAP
CHILD_LEGIBLE_AIA_AUTHORITY_SURFACE_EARNED
```

𝌋

Sealed ⟐