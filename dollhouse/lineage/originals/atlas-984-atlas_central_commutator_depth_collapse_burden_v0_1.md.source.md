# A15-R0 · Atlas Central-Commutator Depth Collapse · Execution Burden v0.1

Status: **FROZEN PREIMPLEMENTATION BURDEN**.

Parent: exact earned #910 head `6343ced7cf274b5f3981cfcb68e3a255447ffcd6`.

The implementation and hostile must reconstruct the finite transport group rather than trust parent counts as raw constants.

## Required finite work

```text
fiber states                                      4
candidate transport group elements                8
ordered group multiplication checks              64
ordered first-commutator checks                  64
center commute-relation checks                   64
derived x group centrality checks                16
gamma_2 x group lower-central commutators        16
derived x derived second-derived commutators      4
left-normed triple commutators                  512
right-normed triple commutators                 512
```

Required first-commutator distribution:

```text
identity       40
nonidentity    24
distinct values 2
```

Required exact subgroup profile:

```text
|G|             8
|G'|            2
|Z(G)|          2
G' = Z(G)
|gamma_3(G)|    1
|G^(2)|         1
```

Required classifications:

```text
nilpotency class = 2
solvable derived length = 2
```

Class 2 is exact because `G'` is nontrivial and `gamma_3(G)` is trivial.

## Free-word hostile controls

The hostile independently constructs free reduction and inverse-word operations on the alphabet `{a,A,b,B}`.

Required reduced words:

```text
[a,b]      -> abAB
[[a,b],a]  -> abABabaBAA
[[a,b],b]  -> abAbaBAB
```

All are nonempty freely reduced words.

Representation outcomes:

```text
rho(abAB)          != id
rho(abABabaBAA)     = id
rho(abAbaBAB)       = id
```

Also preserve the already-earned independent kernel witness:

```text
aa != empty free word
rho(aa)=id
```

so no implementation may silently promote `gamma_3(F2) subset ker(rho)` into `gamma_3(F2)=ker(rho)`.

## Negative / membrane controls

The hostile must fail if any of the following occurs:

- the transport group is reconstructed with size other than 8;
- first commutators have more than two values or a distribution other than 40/24;
- the derived subgroup is trivial;
- the center differs from the derived subgroup;
- any `[G',G]` commutator is nonidentity;
- any triple commutator is nonidentity;
- either triple free-history witness reduces to the empty word;
- the first free commutator maps to identity;
- the implementation claims kernel equality;
- inherited #910 replay fails.

No sampling inference is permitted: all group, center, commutator, and triple-commutator surfaces are exhaustively finite.
