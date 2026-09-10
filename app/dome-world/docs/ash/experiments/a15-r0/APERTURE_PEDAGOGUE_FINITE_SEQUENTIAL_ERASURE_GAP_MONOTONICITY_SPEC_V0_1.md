𝌋

󐘓 U+10D613

# A15-R0 · Finite Sequential-Erasure Gap Monotonicity

Status: **PREREGISTERED / PRE-IMPLEMENTATION / DRAFT / UNMERGED**

Parent scientific receipt:

```text
#755 = ce28f7002feec256ecea191e829a2cbff7afd3b4
```

Gate:

```text
#737 = THREAD_SCOPED_ACTIVE for the present conversation
```

## Declared finite object

Let `X,Y,W,Z` be finite sets. Let

```text
q : X -> Y
r : Y -> W
```

be finite information-loss maps, and let every antecedent `x in X` carry an exact lawful support `K_x subseteq Z`.

Only occupied states are assigned authority.

Define:

```text
Y_q = q(X)
W_rq = r(Y_q).
```

For each occupied first-stage state `y in Y_q`:

```text
U_y = union_{x in q^-1(y)} K_x
I_y = intersection_{x in q^-1(y)} K_x
Gamma_y = U_y \ I_y.
```

For each occupied second-stage state `w in W_rq`, let

```text
J_w = { y in Y_q : r(y)=w }.
```

The composite quotient is `r∘q : X -> W`. Define its exact support geometry:

```text
U2_w = union_{x in (r∘q)^-1(w)} K_x
I2_w = intersection_{x in (r∘q)^-1(w)} K_x
Gamma2_w = U2_w \ I2_w.
```

## Preregistered theorem A · exact composition identities

For every occupied `w`:

```text
U2_w = union_{y in J_w} U_y
I2_w = intersection_{y in J_w} I_y.
```

Hence every first-stage gap survives any later erasure that contains it:

```text
Gamma_y subseteq Gamma2_w
```

for every `y in J_w`.

Therefore:

```text
|Gamma2_w| >= max_{y in J_w} |Gamma_y|.
```

Further erasure cannot shrink an already existing exact admissibility gap.

## Preregistered theorem B · inherited/new-gap decomposition

Define the inherited gap support:

```text
H_w = union_{y in J_w} Gamma_y.
```

Define the new cross-settled disagreement support:

```text
C_w = Gamma2_w \ H_w.
```

Then exactly:

```text
Gamma2_w = H_w disjoint-union C_w
|Gamma2_w| = |H_w| + |C_w|.
```

Moreover `z in C_w` iff all of the following hold:

1. `z` is settled at every first-stage state in `J_w`, i.e. for every `y in J_w`, either `z in I_y` or `z notin U_y`;
2. at least one `y+ in J_w` has `z in I_y+`;
3. at least one `y- in J_w` has `z notin U_y-`.

Thus `C_w` is precisely the set of values whose first-stage authority was individually exact everywhere but mutually incompatible across first-stage states later erased together.

## Consequence · new debt from locally exact states

It is possible that

```text
Gamma_y = empty for every y in J_w
```

while

```text
Gamma2_w != empty.
```

In that case the entire second-stage gap is new cross-settled disagreement:

```text
Gamma2_w = C_w.
```

Primary hostile:

```text
X={a,b}
q(a)=y0
q(b)=y1
r(y0)=r(y1)=w
K_a={0}
K_b={1}

Gamma_y0=empty
Gamma_y1=empty
Gamma2_w={0,1}
C_w={0,1}.
```

So a later erasure can create exact claim-authority debt even when every immediately prior surviving state had zero local gap.

## Non-additivity hostile

Gap cardinalities across first-stage states must not be naively summed.

Example:

```text
K_a={0,1}, K_b={0}     under y0 -> Gamma_y0={1}
K_c={0,1}, K_d={0}     under y1 -> Gamma_y1={1}
r(y0)=r(y1)=w

H_w={1}
Gamma2_w={1}
```

so

```text
|Gamma2_w|=1 != |Gamma_y0|+|Gamma_y1|=2.
```

The exact lower bound is set inclusion / maximum cardinality, not additive debt accounting.

## No-new-gap control

If all first-stage states in `J_w` are exact and agree on the same settled support, then:

```text
Gamma_y=empty for every y
C_w=empty
Gamma2_w=empty.
```

## Architectural interpretation ceiling

Within this finite construction:

```text
additional information loss cannot repair an already witnessed admissibility disagreement;
```

and can create a new disagreement by collapsing previously exact but mutually incompatible surviving states.

No probability/entropy/data-processing inequality claim, no stochastic monotonicity theorem, no causal/provenance reconstruction, no infinite/asymptotic theorem, no category/sheaf/type-theory promotion, no arbitrary DAG theorem, no Proto-Loom/A16, no live Ash mutation, and no merge/publication/production/Vercel/ontology authority follows.

𝌋

Sealed ⟐