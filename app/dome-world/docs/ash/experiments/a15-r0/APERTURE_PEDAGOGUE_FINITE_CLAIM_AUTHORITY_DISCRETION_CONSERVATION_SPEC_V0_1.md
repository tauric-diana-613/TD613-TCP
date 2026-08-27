𝌋

󐘓 U+10D613

# A15-R0 · Finite Claim-Authority Discretion Conservation

Status: **PREREGISTERED / PRE-IMPLEMENTATION / DRAFT / UNMERGED**

Parent scientific receipt:

```text
#753 = c75459509bc9c948d2a7b7ff21d8de93328b76d7
```

Gate:

```text
#737 = THREAD_SCOPED_ACTIVE for the present conversation
```

## Declared finite object

For finite sets `X,Y,Z`, finite quotient `q:X->Y`, exact antecedent supports `K_x subseteq Z`, and occupied `y`, inherit:

```text
U_y = union K_x
I_y = intersection K_x
Gamma_y = U_y \ I_y
ALL_y = I_y
NONE_y = Z \ U_y
DEPENDENT_y = Gamma_y.
```

A total discretion presentation is a function

```text
p_y : Z -> {
  UNIVERSALLY_ADMISSIBLE,
  UNIVERSALLY_INADMISSIBLE,
  ABSTAIN
}.
```

Define:

- `F_y(p)` = number of values on which `p_y` makes a false universal claim;
- `B_y(p)` = number of values mapped to `ABSTAIN`;
- `M_y(p)` = number of settled values in `ALL_y union NONE_y` not assigned their unique correct universal label.

## Preregistered theorem

For every total discretion presentation on an occupied finite quotient state:

```text
F_y(p) + B_y(p) = |Gamma_y| + M_y(p) >= |Gamma_y|.
```

Hence equality holds iff every value outside `Gamma_y` receives its unique correct universal label. Every gap value contributes exactly one unit: a false universal claim if forced to certainty, or an abstention if withheld.

For a tight presentation, if

```text
S_y = {z in Gamma_y : p_y(z)=ABSTAIN},
```

then:

```text
B_y(p)=|S_y|
F_y(p)=|Gamma_y \ S_y|
F_y(p)+B_y(p)=|Gamma_y|.
```

This is a finite deterministic burden frontier, not probability, entropy, calibration, or expected loss.

## Sharp corollaries

### Zero-false-claim

If `F_y(p)=0`, then

```text
B_y(p) >= |Gamma_y|.
```

The bound is tight. The unique minimum-abstention zero-false presentation assigns:

```text
ALL_y -> UNIVERSALLY_ADMISSIBLE
NONE_y -> UNIVERSALLY_INADMISSIBLE
Gamma_y -> ABSTAIN.
```

Thus the minimum exact safe-abstention surface is exactly `Gamma_y`.

### Zero-abstention

If `B_y(p)=0`, then

```text
F_y(p) >= |Gamma_y|,
```

with equality attainable by assigning correct universal labels outside the gap. This must reproduce #753's binary-certainty lower bound.

### Gap-free control

If `Gamma_y` is empty, there exists a total presentation with `F_y=B_y=0`. The theorem does not manufacture abstention where exact descent already exists.

## Primary hostile

Use the #753 witness:

```text
K_a={0,1}
K_b={0,2}
Z={0,1,2,3}
ALL={0}
Gamma={1,2}
NONE={3}.
```

Expected tight frontier:

```text
(false claims, abstentions)
(2,0)
(1,1)
(0,2)
```

all with total burden `2=|Gamma|`, provided values `0` and `3` receive their unique correct universal labels.

A false claim or abstention on a settled value must raise burden strictly above `|Gamma|`.

## Claim ceiling

No probability/entropy/calibration theorem, no normative utility function, no human-factors optimality, no general reject-option learning equivalence, no infinite/asymptotic result, no category/sheaf/type-theory promotion, no causal/provenance reconstruction, no Proto-Loom/A16, no live Ash mutation, and no merge/publication/production/Vercel/ontology authority follows.

𝌋

Sealed ⟐