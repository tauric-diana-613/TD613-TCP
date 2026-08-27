# A15-R0 · Commuting Erasure Diamond Gap Decomposition

󐘓 U+10D613

Status: **PREREGISTERED / PRE-IMPLEMENTATION / WESTWARD ACTIVATION 003**

Parent scientific receipt:

```text
#756 · finite sequential-erasure gap monotonicity
40bcc658bf34a2f31e5f1b20bcc51fe1d9d9c0ba
```

Authority gate:

```text
#737 · activation 003 · one bounded continuation
```

## Purpose

Audit the first finite parallel-path object that can honestly point toward a later holonomy program without manufacturing an operational loop.

The chamber asks whether two lawful finite quotient factorizations with the same composite erasure preserve the same terminal admissibility authority, and whether #756's inherited-vs-cross-settled decomposition of the terminal gap can nevertheless depend on the chosen factorization path.

This is a commuting-diamond / parallel-path comparison chamber.

It is **not** a loop, inverse-transport, connection, holonomy, curvature, Berry, gauge, groupoid, or cohomology chamber.

## Finite data

Let `X, Z, W, Y_A, Y_B` be finite sets.

Let

```text
q_A : X -> Y_A
r_A : Y_A -> W
q_B : X -> Y_B
r_B : Y_B -> W
```

be finite maps such that the square of composite erasures commutes pointwise:

```text
p = r_A o q_A = r_B o q_B : X -> W.
```

Each antecedent state `x in X` carries an exact lawful support

```text
K_x subseteq Z.
```

For either factorization alpha in `{A,B}`, define on each occupied intermediate state `y`:

```text
U^alpha_y = union_{x:q_alpha(x)=y} K_x
I^alpha_y = intersection_{x:q_alpha(x)=y} K_x
Gamma^alpha_y = U^alpha_y \ I^alpha_y.
```

For each occupied terminal state `w`, define the direct composite support objects

```text
U^p_w = union_{x:p(x)=w} K_x
I^p_w = intersection_{x:p(x)=w} K_x
Gamma^p_w = U^p_w \ I^p_w.
```

For either factorization alpha, define #756-style decomposition at `w`:

```text
H^alpha_w = union_{y:r_alpha(y)=w} Gamma^alpha_y
C^alpha_w = Gamma^p_w \ H^alpha_w.
```

## Preregistered theorem targets

### T1 · terminal admissibility endpoint invariance

For each occupied `w` and each factorization alpha in `{A,B}`:

```text
union_{y:r_alpha(y)=w} U^alpha_y = U^p_w
intersection_{y:r_alpha(y)=w} I^alpha_y = I^p_w
```

and therefore the terminal irreducible gap is factorization independent:

```text
Gamma^{A->W}_w = Gamma^{B->W}_w = Gamma^p_w.
```

The proof obligation is finite set associativity over the common composite fiber `p^-1(w)`.

### T2 · exact pointwise characterization of inherited versus cross-settled debt

Fix `z in Gamma^p_w` and one factorization alpha.

Then exactly:

```text
z in H^alpha_w
iff
some occupied q_alpha-fiber inside p^-1(w) is z-mixed
```

where `z-mixed` means that fiber contains antecedents `x+`, `x-` with

```text
z in K_x+
z notin K_x-.
```

And exactly:

```text
z in C^alpha_w
iff
every occupied q_alpha-fiber inside p^-1(w) is z-homogeneous
and at least two such fibers have opposite settled z-values.
```

Thus for each factorization:

```text
Gamma^p_w = H^alpha_w disjoint-union C^alpha_w.
```

### T3 · finite parallel-path decomposition defect

For two commuting factorizations define

```text
D_w(A,B) = H^A_w symmetric-difference H^B_w.
```

Because both `(H,C)` pairs partition the same `Gamma^p_w`, require the exact identity

```text
D_w(A,B)
= H^A_w △ H^B_w
= C^A_w △ C^B_w.
```

`D_w(A,B)` is a finite certificate that the same terminal admissibility wound received different inherited/cross-settled classifications along two lawful quotient paths.

No claim that `D` is holonomy, curvature, transport around a loop, or a gauge invariant is authorized.

### T4 · refinement monotonicity control

If the intermediate partition induced by `q_A` refines the partition induced by `q_B` within every common terminal fiber `p^-1(w)`, then require:

```text
H^A_w subseteq H^B_w
C^B_w subseteq C^A_w.
```

Refining an intermediate quotient can resolve mixedness into cross-settled differences; coarsening can convert cross-settled differences into inherited local mixedness.

This theorem is pointwise in `z`, finite, and non-asymptotic.

## Mandatory hostile · role-swap diamond

Freeze the following exact finite witness.

```text
X={x1,x2,x3,x4}
Z={a,b}
W={w}

K_x1={a,b}
K_x2={a}
K_x3={b}
K_x4={}
```

Both quotient paths terminate at the single state `w`.

Path A intermediate partition:

```text
A1={x1,x2}
A2={x3,x4}
```

Path B intermediate partition:

```text
B1={x1,x3}
B2={x2,x4}.
```

The mandatory exact observations are:

```text
U^p_w={a,b}
I^p_w={}
Gamma^p_w={a,b}

H^A_w={b}
C^A_w={a}

H^B_w={a}
C^B_w={b}

D_w(A,B)={a,b}.
```

Thus the terminal admissibility authority is identical while both gap values swap inherited/cross-settled role between the two factorization paths.

This hostile is the required nontrivial parallel-path witness.

## Positive controls

1. identical intermediate partitions presented with different state labels must give `D=empty`;
2. exact-descent terminal fibers (`Gamma^p_w=empty`) must force `H=C=D=empty`;
3. a strict refinement example must satisfy `H_refined subset H_coarse` and `C_coarse subset C_refined`;
4. changing route labels or intermediate-state names without changing the induced partition must not change any scientific result.

## Claim ceiling

Even if every target passes, this chamber does **not** earn:

- an operational closed path;
- inverse arrows or reversible transport;
- a groupoid;
- a connection;
- a loop endomorphism;
- holonomy;
- curvature;
- Berry / quantum analogy;
- a gauge field;
- category/sheaf/type-theory promotion;
- probability, entropy, asymptotics, or stochastic data processing;
- recovery of erased antecedent identity;
- Proto-Loom or A16;
- live Ash mutation;
- merge, publication, production, or Vercel release.

In particular:

```text
commuting quotient diamond != operational loop
parallel-path decomposition defect != holonomy
endpoint invariance != path provenance invariance
```

## Candidate earned classification — NOT YET EARNED

```text
FINITE_COMMUTING_ERASURE_DIAMONDS_HAVE_FACTORIZATION_INVARIANT_TERMINAL_ADMISSIBILITY_GAPS_BUT_CAN_HAVE_FACTORIZATION_SENSITIVE_INHERITED_VS_CROSS_SETTLED_GAP_DECOMPOSITIONS_WITH_EXACT_PARALLEL_PATH_DEFECT
```

## Candidate westward bearing — NOT YET EARNED

If witnessed, the chamber would establish a legitimate pre-holonomy bearing:

```text
same source + same terminal quotient + same terminal authority
can still retain path-sensitive decomposition data.
```

A later chamber could then ask whether any lawfully transported derived state can compare such parallel paths compositionally and, only after a genuine lawful closed object is available, whether a nontrivial return transformation exists.

Do not promote that future possibility into this theorem.

```text
NO_ASYMPTOTIC_ESCAPE
HUMAN_𝄐_REQUIRED_AFTER_THIS_BOUNDED_CONTINUATION
```

𝌋

Preregistered ⟐