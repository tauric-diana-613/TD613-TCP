# A15-R0 · Commuting Erasure Diamond Gap Decomposition · Receipt v0.1

󐘓 U+10D613

Status: **WITNESSED / RECEIPT-PINNED / ROUND CLOSED / DRAFT / OPEN / UNMERGED**

## Authority and ancestry

```text
Westward gate                 #737 · Activation 003
parent scientific chamber     #756 · finite sequential-erasure gap monotonicity
parent receipt                 40bcc658bf34a2f31e5f1b20bcc51fe1d9d9c0ba
preregistration                bbf615b37cdc0541980a1edaee787177ce6d5511
frozen scientific head        0d73dd9912d15371c2c8878d92b410402f252172
routed witness head           13c668fa25a19aa2c7c4f1e9972cc44a9c5f3828
post-routing cleanup          5c3122f28bfafabadad5f99e327a0a1f6ea873ab
```

Preregistration preceded implementation.

Routing was metadata-only. Comparing frozen science `0d73dd99...` to cleanup `5c3122f2...` yields:

```text
ahead_by = 2
behind_by = 0
changed files = 0
```

Therefore the temporary witness-routing add/remove commits produced zero net scientific mutation.

## Authority-bearing witness

```text
TD613 Consolidated Validation
run              2272 / 33000866766   SUCCESS
classifier job   98281975501           SUCCESS
static job       98282104465           SUCCESS
A15/A15-R0 step 19                      SUCCESS
```

Run interval:

```text
2026-08-26T18:36:05Z -> 2026-08-26T18:37:09Z
```

No scientific red occurred. The exact-head static log includes:

```text
Ash A15-R0 #760 commuting erasure diamond gap decomposition tests passed.
Ash A15-R0 #760 commuting erasure diamond gap decomposition hardening tests passed.
```

Full-repository, self-hosted calibration, Giving/practice browser, front-line browser, and full-product browser scopes were not required for this finite algebraic chamber and are not claimed as theorem evidence.

## Earned finite theorem

Let finite maps form a commuting erasure diamond

```text
X --q_A--> Y_A --r_A--> W
|                       ^
|                       |
q_B                     r_B
|                       |
v                       |
Y_B --------------------
```

with common composite

```text
p = r_A o q_A = r_B o q_B : X -> W.
```

Each antecedent `x in X` carries exact lawful support `K_x subseteq Z`.

For either factorization alpha in `{A,B}`, define intermediate admissibility objects on occupied `q_alpha` fibers:

```text
U^alpha_y
I^alpha_y
Gamma^alpha_y = U^alpha_y \ I^alpha_y.
```

At each occupied terminal `w`, define direct composite objects over `p^-1(w)`:

```text
U^p_w
I^p_w
Gamma^p_w = U^p_w \ I^p_w.
```

Then finite set associativity over the identical composite fiber gives exactly:

```text
union_{y:r_alpha(y)=w} U^alpha_y = U^p_w
intersection_{y:r_alpha(y)=w} I^alpha_y = I^p_w
```

for both paths. Hence:

```text
Gamma^{A->W}_w = Gamma^{B->W}_w = Gamma^p_w.
```

The terminal admissibility endpoint is therefore invariant under lawful finite factorizations of the same composite erasure.

## Path-sensitive decomposition of one invariant terminal wound

Using #756's decomposition, for either factorization alpha define:

```text
H^alpha_w = union_{y:r_alpha(y)=w} Gamma^alpha_y
C^alpha_w = Gamma^p_w \ H^alpha_w.
```

Pointwise for `z in Gamma^p_w`:

```text
z in H^alpha_w
iff
some intermediate q_alpha-fiber inside p^-1(w) is z-mixed.
```

And:

```text
z in C^alpha_w
iff
every occupied q_alpha-fiber inside p^-1(w) is z-homogeneous
and at least two such fibers have opposite settled z-values.
```

Therefore:

```text
Gamma^p_w = H^alpha_w disjoint-union C^alpha_w.
```

Define the finite parallel-path decomposition defect:

```text
D_w(A,B) = H^A_w symmetric-difference H^B_w.
```

Because `H` and `C` are complementary inside the same invariant `Gamma^p_w`:

```text
D_w(A,B)
= H^A_w △ H^B_w
= C^A_w △ C^B_w.
```

Thus one terminal admissibility wound may be factorization invariant while the inherited-versus-cross-settled genealogy of that wound is factorization sensitive.

## Mandatory role-swap hostile

Frozen finite witness:

```text
X={x1,x2,x3,x4}
Z={a,b}
W={w}

K_x1={a,b}
K_x2={a}
K_x3={b}
K_x4={}
```

Path A partition:

```text
A1={x1,x2}
A2={x3,x4}
```

Path B partition:

```text
B1={x1,x3}
B2={x2,x4}.
```

Exact witnessed result:

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

Both terminal gap values swap inherited/cross-settled role between the two lawful factorizations while terminal authority remains exactly unchanged.

## Refinement law

If the intermediate partition induced by path A refines path B inside a common terminal fiber, then exactly:

```text
H^A_w subseteq H^B_w
C^B_w subseteq C^A_w.
```

Refining intermediate state can convert locally mixed inherited debt into cross-settled disagreement; coarsening can convert cross-settled disagreement into inherited local mixedness.

The test suite contains a strict finite refinement witness.

## Controls

The chamber also witnessed:

```text
identical induced partition under relabeling -> D=empty
terminal exact descent Gamma=empty -> H=C=D=empty
noncommuting composite -> abstain
antecedent support mismatch across purported paths -> abstain
multiple terminal states -> endpoint invariance checked terminal-by-terminal
```

## Canonical classification

```text
FINITE_COMMUTING_ERASURE_DIAMONDS_HAVE_FACTORIZATION_INVARIANT_TERMINAL_ADMISSIBILITY_GAPS_BUT_CAN_HAVE_FACTORIZATION_SENSITIVE_INHERITED_VS_CROSS_SETTLED_GAP_DECOMPOSITIONS_WITH_EXACT_PARALLEL_PATH_DEFECT
```

## Westward bearing earned

This chamber earns the following finite pre-holonomy bearing:

```text
same antecedent system
+ same composite quotient
+ same terminal state
+ same terminal admissibility authority
!=
same decomposition provenance of the terminal wound.
```

The surviving path-sensitive quantity is a derived decomposition defect over **parallel quotient paths**, not a return transformation around a lawful operational loop.

Therefore:

```text
endpoint flatness != path provenance flatness
commuting quotient diamond != operational loop
parallel-path decomposition defect != holonomy
parallel-path decomposition defect != curvature
```

#718's strict endpoint-mass monotonicity obstruction to nonempty operational T/Q loops remains untouched and continues to quarantine fake closure produced only by projection.

## Claim ceiling

This chamber does not earn:

- operational closed paths;
- inverse transport;
- groupoids;
- connection;
- loop endomorphism;
- holonomy;
- curvature;
- Berry / quantum analogy;
- gauge structure;
- category/sheaf/type-theory promotion;
- asymptotics, probability, entropy, or stochastic data processing;
- erased antecedent identity recovery;
- Proto-Loom / A16;
- live Ash mutation;
- merge, publication, production, or Vercel release.

No H8 or horizon farming occurred.

## Earned stop

```text
FINITE_COMMUTING_ERASURE_DIAMOND_GAP_DECOMPOSITION_ROUND_CLOSED
TERMINAL_ADMISSIBILITY_ENDPOINT_INVARIANCE_EARNED
PARALLEL_PATH_WOUND_DECOMPOSITION_DEFECT_EARNED
REFINEMENT_MONOTONICITY_EARNED
PRE_HOLONOMY_BEARING_EARNED_WITHOUT_LOOP_PROMOTION
HUMAN_𝄐_REQUIRED_BEFORE_ANY_COMPOSITIONAL_PARALLEL_PATH_DEFECT_TRANSPORT_OR_PASTED_DIAMOND_AUDITION
```

󐘓 U+10D613

𝌋

Receipt-pinned ⟐