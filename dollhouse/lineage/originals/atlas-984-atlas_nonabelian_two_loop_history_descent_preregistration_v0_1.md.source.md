𝌋⟐

# A15-R0 · Atlas Nonabelian Two-Loop History Descent

Status: **PREREGISTERED / PREIMPLEMENTATION / THEOREM UNEARNED / NO MERGE**.

## Exact earned parent

```text
#908 / 34d55447a798c24599bc84402ceef2ce29849247
TD613 Consolidated Validation run 2406 / 33348252528 — SUCCESS
A15-R0 step 19 — SUCCESS
```

#908 earned the one-generator loop-power history quotient `Z -> C2`. This successor does not enlarge that single-loop claim by rhetoric. It declares a new two-loop based history domain and asks how much exact word history survives through successively coarser receivers.

## Declared based history object

Synthetic bouquet base graph:

```text
B = S1_a ∨ S1_b
basepoint = v0
```

Exact reduced loop-word history domain:

```text
F(a,b) = free group on based loops a,b
alphabet = {a,A,b,B}
A=a^-1
B=b^-1
```

Fiber remains the earned Moss Lantern apparatus fiber:

```text
Xi = F2^2.
```

Transport representation:

```text
rho : F(a,b) -> Aut(Xi)
rho(a)=A_transport : (x,y)->(x xor 1,y)
rho(b)=B_transport : (x,y)->(x,y xor x)
```

The inverse letters map to the already-earned two-sided inverses. In this fixture both generators are involutions, so `rho(A)=rho(a)` and `rho(B)=rho(b)`.

## Candidate nonabelian holonomy image

The representation image is the exact generated transport group already reconstructed at #906:

```text
G = im(rho) = <A_transport,B_transport>
|G| = 8
```

Frozen additional finite group targets:

```text
A_transport^2 = id
B_transport^2 = id
order(A_transport B_transport) = 4
G is nonabelian
```

Therefore the fixed finite group is candidate-isomorphic to the dihedral group of order eight:

```text
G ~= D8
```

This is a finite abstract group classification only.

## Candidate abelianized receiver

Let

```text
G'=[G,G].
```

Inherited #906 target:

```text
|G'|=2
G'={id,Hol_gamma}
```

Define

```text
pi_ab : G -> G/G'.
```

Frozen targets:

```text
|G/G'| = 4
quotient multiplication commutative
all three nonidentity quotient elements have order 2
G/G' ~= C2 x C2
```

## Four receiver levels

```text
R_word(w) = exact freely reduced word w
R_hol(w)  = rho(w) in G
R_ab(w)   = pi_ab(rho(w)) in G/G'
R_q(w)    = returned-practice-capsule
```

Candidate strict descent:

```text
EXACT_WORD_HISTORY
  -> NONABELIAN_HOLONOMY_HISTORY
  -> ABELIANIZED_HOLONOMY_HISTORY
  -> VISIBLE_ENDPOINT_HISTORY
```

with global image sizes:

```text
R_word : infinite free-group history domain
R_hol  : 8 classes
R_ab   : 4 classes
R_q    : 1 class
```

No claim is made that the free-group domain equals any live route space.

## Required global strict witnesses

### Exact word -> holonomy loss

```text
a^2 != e in F(a,b)
rho(a^2)=id
```

So exact reduced-word history is strictly finer than holonomy history.

### Holonomy -> abelianized loss

```text
[a,b]=a b a^-1 b^-1
rho([a,b]) = Hol_gamma != id
pi_ab(Hol_gamma)=pi_ab(id)
```

So nonabelian holonomy history is strictly finer than abelianized history.

### Abelianized -> visible loss

```text
pi_ab(rho(a)) != pi_ab(id)
R_q(a)=R_q(e)
```

So abelianized history is strictly finer than the visible endpoint receiver.

## Future-continuation law

For any two exact words `u,v` with

```text
rho(u)=rho(v),
```

and any future loop word `z`, homomorphism composition gives

```text
rho(uz)=rho(vz).
```

Thus holonomy-equivalent histories remain equivalent under every future two-loop holonomy continuation.

Conversely, unequal holonomy operators are distinct at the Holonomy/Atlas technical receiver because the receiver retains the complete fiber automorphism, not merely one fiber endpoint.

## Frozen hostile word window

The hostile assay must independently generate every freely reduced word of length at most four:

```text
length 0:   1
length 1:   4
length 2:  12
length 3:  36
length 4: 108
total:    161
```

Required distinct image counts:

```text
exact word histories = 161
holonomy classes = 8
abelianized classes = 4
visible classes = 1
```

Required holonomy-class population multiset:

```text
[33,32,28,28,12,12,8,8]
```

Required abelianized-class population multiset:

```text
[65,56,20,20]
```

Required pair census:

```text
unordered distinct word pairs = 12,880
same-holonomy pairs = 1,968
same-abelianized pairs = 4,000
same-abelianized but different-holonomy pairs = 2,032
different-abelianized pairs = 8,880
```

For every same-holonomy pair in this window, every one of the eight future group continuations must preserve equal holonomy action:

```text
1,968 * 8 = 15,744 future continuation checks
0 mismatches required
```

The hostile window is a finite implementation assay. The global quotient claims rest on the declared homomorphism, finite exact image group, derived subgroup, and explicit strict witnesses; they are not extrapolated from length four.

## Candidate bounded 𝄐

If exact-head GREEN:

```text
THE_DECLARED_TWO_LOOP_MOSS_LANTERN_HISTORY_REPRESENTATION_FACTORS_THE_FREE_BASED_LOOP_WORD_DOMAIN_THROUGH_AN_EIGHT_ELEMENT_NONABELIAN_FORMAL_HOLONOMY_GROUP_THEN_A_FOUR_ELEMENT_ABELIANIZATION_AND_FINALLY_A_ONE_CLASS_VISIBLE_ENDPOINT_RECEIVER_WITH_EACH_DESCENT_STRICTLY_LOSSY_IN_THE_FIXED_SYNTHETIC_FIXTURE.
```

and:

```text
FUTURE_FORMAL_HOLONOMY_CONTINUATION_EQUIVALENCE_IS_EXACTLY_STABLE_UNDER_EQUALITY_OF_THE_RETAINED_GLOBAL_HOLONOMY_OPERATOR_EVEN_WHEN_EXACT_LOOP_WORD_HISTORY_HAS_ALREADY_BEEN_LOST.
```

## Mandatory membranes

```text
FREE_GROUP_LOOP_WORD != LIVE_ROUTE_HISTORY
NONABELIAN_FORMAL_HOLONOMY_GROUP != PHYSICAL_SYMMETRY_GROUP
D8_CLASSIFICATION != PHYSICAL_DIHEDRAL_SYMMETRY
GROUP_ABELIANIZATION != INFORMATION_THEORETIC_COMPRESSION
COMMUTATOR_SUBGROUP != PHYSICAL_CURVATURE
EXACT_WORD_LOSS != HISTORICAL_SOURCE_ERASURE
GLOBAL_HOLONOMY_OPERATOR != SINGLE_FIBER_ENDPOINT
HOLONOMY_EQUIVALENCE != EXACT_ROUTE_EQUIVALENCE
ABELIANIZED_HISTORY != COMPLETE_HOLONOMY_HISTORY
VISIBLE_ENDPOINT_HISTORY != APPARATUS_HISTORY
FINITE_WORD_WINDOW != PROOF_BY_SAMPLING
FORMAL_DISCRETE_HOLONOMY != GEOMETRIC_OR_PHYSICAL_HOLONOMY
ATLAS_REGISTRATION != LIVE_RUNTIME_STATE
A15_R0_RESEARCH_EXTENSION != PROTO_LOOM_OR_A16_PROMOTION
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
```

No merge, deployment, release, publication, production, Vercel, live Ash/Loom, physical topology, physical symmetry, gauge/Berry structure, continuum holonomy, operational inverse, source provenance, Proto-Loom, or A16 authority.

Sealed ⟐