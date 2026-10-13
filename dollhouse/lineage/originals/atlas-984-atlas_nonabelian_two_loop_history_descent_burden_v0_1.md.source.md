𝌋⟐

# Atlas Nonabelian Two-Loop History Descent · Execution Burden v0.1

Status: **FROZEN BEFORE IMPLEMENTATION**.

Parent: `#908 / 34d55447a798c24599bc84402ceef2ce29849247`.

The child implementation and hostile must reconstruct rather than trust prose labels.

## Required inherited reconstruction

1. Import exact earned #908 and require `passed=true`.
2. Reconstruct the four-point fiber `F2^2`.
3. Reconstruct `A_transport` and `B_transport` from the declared earned maps.
4. Close `<A,B>` under composition.
5. Verify:
   - group size 8;
   - all elements bijective;
   - all elements have two-sided inverses;
   - `A^2=id`;
   - `B^2=id`;
   - `AB` has exact order four;
   - at least one ordered product pair fails to commute.
6. Recompute all 64 ordered group commutators.
7. Recompute the derived subgroup and require exact size two.
8. Construct all four derived-subgroup cosets in `G`.
9. Verify quotient multiplication is well-defined and commutative.
10. Verify all three nonidentity quotient elements have order two.

## Exact free-word window

Independently generate every freely reduced word over

```text
{a,A,b,B}
```

of length `0..4`, forbidding only immediate inverse cancellation.

Required counts:

```text
[1,4,12,36,108]
161 total
```

Do not generate all `4^4` strings and call them reduced histories without checking the reduction condition.

## Word-to-holonomy evaluation

For all 161 words:

- evaluate the exact transport map under `a->A_transport`, `A->A_transport^-1`, `b->B_transport`, `B->B_transport^-1`;
- assign holonomy class only by exact map equality;
- assign abelianized class only by exact derived-subgroup coset equality;
- retain visible endpoint as the inherited constant Moss Lantern endpoint.

Required class counts:

```text
word = 161
holonomy = 8
abelianized = 4
visible = 1
```

Required sorted population multisets:

```text
holonomy:    [33,32,28,28,12,12,8,8]
abelianized: [65,56,20,20]
```

## Pair surface

Audit all

```text
C(161,2)=12,880
```

unordered distinct word pairs.

Required exact categories:

```text
same holonomy = 1,968
same abelianized = 4,000
same abelianized but different holonomy = 2,032
different abelianized = 8,880
```

For each same-holonomy pair, compose both histories with all eight future group continuations and require exact resulting-map equality:

```text
1,968 * 8 = 15,744
```

Required future-continuation mismatches: `0`.

## Strict global witnesses

The hostile must verify independently:

```text
word_to_holonomy:
  reduced word `aa` is not the empty word
  rho(aa)=id

holonomy_to_abelianized:
  commutator word `abAB` maps to nonidentity Hol_gamma
  id and Hol_gamma lie in the same derived-subgroup coset

abelianized_to_visible:
  rho(a) lies outside the identity derived-subgroup coset
  visible endpoint(a)=visible endpoint(empty)
```

Because the transport generators are involutions, `A` and `B` letters are inverse symbols in the free domain even though their fiber maps coincide with the forward-generator maps. The domain/history distinction must remain visible.

## Required scars

The tests must reject any child that collapses the following distinctions:

```text
FREE_WORD_INVERSE_SYMBOL != DISTINCT_FIBER_MAP_WHEN_GENERATOR_IS_INVOLUTIVE
EXACT_WORD_HISTORY != HOLONOMY_OPERATOR_HISTORY
HOLONOMY_OPERATOR_HISTORY != ABELIANIZED_HISTORY
ABELIANIZED_HISTORY != VISIBLE_ENDPOINT_HISTORY
GLOBAL_OPERATOR_EQUALITY != ONE_POINT_FIBER_EQUALITY
D8_CLASSIFICATION != PHYSICAL_DIHEDRAL_SYMMETRY
FINITE_WINDOW != GLOBAL_PROOF
```

No authority widening is permitted.

Sealed ⟐