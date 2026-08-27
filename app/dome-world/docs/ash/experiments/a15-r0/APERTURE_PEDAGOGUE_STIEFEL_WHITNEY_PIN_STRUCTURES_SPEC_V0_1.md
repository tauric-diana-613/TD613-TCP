𝌋‌⟐

󐘓 U+10D613

# A15-R0 · Tangent Splitting, Stiefel-Whitney Profile, and Pin± Structures · Spec v0.1

Status: **PREREGISTERED / DRAFT / UNMERGED / THEOREM AUTHORITY UNEARNED**

Scientific parent:

```text
#775 receipt = 39b8f6e8ba319154378d03c28a1bf42c02870de1
```

This chamber depends only on witnessed #775 plus standard mapping-torus, Whitney-product, and Pin-structure obstruction theorems. It does **not** depend on #778/#780/#781/#782/#783/#784/#785/#786.

## 1. Inherited parent data

Witnessed #775 gives

```text
G = Z² ⋊_swap Z
BB ≃ K(G,1)
H1(G;Z) ≅ Z²
```

and uses the mapping torus of the coordinate swap on `T²` as a classifying-space model.

Let

```text
f:T²→T²,
f(x,y)=(y,x)
```

with derivative/linear monodromy

```text
A=[[0,1],[1,0]].
```

The candidate closed mapping-torus model is

```text
M_f=T²×[0,1]/(x,1)~(f(x),0).
```

No operational-route or physical-spacetime meaning is inferred from this model.

## 2. Preregistered tangent splitting

The matrix `A` has integral-real invariant eigenlines

```text
L_+ = R<(1,1)>   eigenvalue +1
L_- = R<(1,-1)>  eigenvalue -1.
```

The vertical tangent bundle of the mapping torus is therefore candidate-isomorphic to

```text
V ≅ ε_+ ⊕ L_w,
```

where `ε_+` is a trivial real line bundle and `L_w` is the sign/Möbius line pulled back from the base circle. The tangent line along the mapping-torus base is also trivial, so candidate

```text
TM_f ≅ ε² ⊕ L_w.
```

The corresponding orientation character is

```text
w(t,E,O)=(-1)^t.
```

Let

```text
u = p^*(a) ∈ H¹(M_f;F2),
```

where `a` is the generator of `H¹(S¹;F2)` and `p:M_f→S¹` is the mapping-torus projection.

Candidate:

```text
w1(TM_f)=u≠0.
```

## 3. Preregistered Stiefel-Whitney profile

Using the Whitney product formula and

```text
w(ε)=1
w(L_w)=1+u,
```

candidate

```text
w(TM_f)=1+u.
```

Hence

```text
w1=u≠0
w2=0
w3=0.
```

Because `u=p^*(a)` and `a²=0` on `S¹`, candidate

```text
u²=w1²=0.
```

Consequential scar:

```text
NONORIENTABLE_TANGENT_BUNDLE
!=
NONZERO_HIGHER_STIEFEL_WHITNEY_CLASSES.
```

All nonorientability is concentrated in the single orientation line factor `L_w`.

## 4. Preregistered Pin± consequences

Use the standard obstruction criteria

```text
Pin+ exists  iff w2=0
Pin- exists  iff w2+w1²=0.
```

With the candidate profile above,

```text
w2=0
w2+w1²=0,
```

so candidate

```text
M_f admits both Pin+ and Pin- structures.
```

Since `w1≠0`, candidate

```text
M_f is not orientable and admits no Spin structure.
```

Because witnessed `H1(G;Z)=Z²`, candidate

```text
H¹(M_f;F2)≅F2².
```

When a Pin± lift exists, its isomorphism classes form an `H¹(M_f;F2)` torsor. Therefore candidate

```text
#Pin+ structures = 4
#Pin- structures = 4.
```

This count is a count of isomorphism classes of tangential lifts for the candidate manifold model, not physical states.

## 5. Independent consistency checks

The chamber must independently verify:

```text
det(A)=-1
A(1,1)=(1,1)
A(1,-1)=-(1,-1)
```

and the orientation character must be a homomorphism under the exact inherited #775 fraction-group multiplication.

The mod-two Euler/Stiefel-Whitney top class `w3` is candidate zero, consistent with mapping-torus Euler characteristic zero. This is a consistency check only, not the proof of the tangent splitting.

## 6. Mandatory hostiles

```text
det(A)=+1                                  REJECT
both eigenlines have eigenvalue +1         REJECT
TM_f≈ε³                                    REJECT
w1=0                                       REJECT
w2≠0                                       REJECT
w1²≠0                                      REJECT
w3≠0                                       REJECT
Pin+ obstruction treated as w2+w1²         REJECT
Pin- obstruction treated as w2 only        REJECT
Spin structure promoted despite w1≠0       REJECT
Pin structures counted as physical states  REJECT
point-group reflection = bar 2-holonomy    REJECT
tangent splitting = operational route split REJECT
```

## 7. Candidate classifications — UNEARNED

```text
THE_SWAP_MAPPING_TORUS_TANGENT_BUNDLE_SPLITS_AS_TWO_TRIVIAL_LINES_PLUS_THE_PARITY_ORIENTATION_LINE
THE_TOTAL_STIEFEL_WHITNEY_CLASS_IS_ONE_PLUS_THE_BASE_ORIENTATION_CLASS_U
W_ONE_EQUALS_U_IS_NONZERO_WHILE_W_TWO_W_THREE_AND_W_ONE_SQUARED_VANISH
THE_MAPPING_TORUS_MODEL_ADMITS_BOTH_PIN_PLUS_AND_PIN_MINUS_STRUCTURES_BUT_NO_SPIN_STRUCTURE
EACH_PIN_TYPE_FORMS_AN_H_ONE_F_TWO_TORSOR_WITH_FOUR_ISOMORPHISM_CLASSES
ALL_NONORIENTABILITY_IS_CONCENTRATED_IN_A_SINGLE_REAL_LINE_BUNDLE_FACTOR
STIEFEL_WHITNEY_AND_PIN_STRUCTURE_PROFILE_EARNED
```

No classification is promoted without a lawful constitutional witness.

## 8. Hard ceilings

```text
Pin structure != physical fermion sector
Spin obstruction != particle-spin claim
Stiefel-Whitney class != TD613 physical field
orientation line != physical chirality field
mapping-torus tangent bundle != operational route tangent bundle
characteristic class != formal bar-complex 2-holonomy
geometric tangent splitting != physical spacetime decomposition
```

#718 remains alive.

Collision membrane:

```text
#778/#780/#781/#782/#783/#784/#785/#786 untouched / unearned
SRC #731/#758/#759 untouched
SRC #771 untouched
#767 untouched
no fifth workflow
no merge
no publication
no production
no Vercel
```

𝌋‌⟐

Sealed ⟐
