𝌋

# TD613 · A15-R0 · #735 post-witness repair preregistration 001

󐘓 U+10D613

Status: **FROZEN BEFORE REPAIR / RED WITNESS PRESERVED / THEOREM TARGET UNCHANGED**

Parent chamber: #734 receipt head `6bc000024f02e5780910ee24694561d5dc542003`
Original #735 preregistration: `69cbc26189e920f153c5e1ac8cfc727cb77d665e`
Red routed head: `c095c451eb8d8c0992deeed2c1cf5b634b0db8c4`
Red workflow: TD613 Consolidated Validation run `2159` / `32750447567`
Red static job: `97506013020`
Failing surface: step 19, `Validate Ash A15 empirical profile journeys and A15-R0 research field`

## Observed scar

All four enclosing Node test-runner subtests completed successfully, after which the runner reported asynchronous activity containing:

```text
AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
+ actual - expected

+ -0
- 0
```

The #735 chamber contains the direct exact assertion

```js
assert.equal(assay.primitive_descent_failure.s_right, 0);
```

and the route primitive is authored as `-P`.  The already-witnessed parent coordinate for `QTT` has `P(QTT)=0`; JavaScript therefore represents `-P(QTT)` as IEEE-754 negative zero.  `node:assert/strict` distinguishes `-0` from `0` through SameValue/Object.is semantics.

This is an implementation-representation defect at the integer/JavaScript boundary.  It does not alter the preregistered algebraic statement, because the declared coefficient object is the mathematical integers, in which zero has a unique representative.

## Frozen repair

Only the following scientific implementation repair is authorized:

1. Canonicalize the route primitive so mathematical zero is emitted as JavaScript `+0`:

```text
s(w) = -P(w), represented canonically with s(w)=0 whenever P(w)=0.
```

2. Strengthen the hostile test to require `Object.is(assay.primitive_descent_failure.s_right, 0) === true`, so the exact representation defect cannot recur silently.

3. Re-run the same #735 theorem witness.  The repair may not modify the bar chain, quotient relation, cocycle, coefficient ring, pairing, canonical classification, or claim ceiling.

## Unchanged theorem target

The chamber continues to test exactly:

```text
z=[T|T]+[TT|Q]-[Q|T]-[QT|T]
∂z=0
<ω,z>=2
ω(x,y)=t(x)(E(y)+O(y))
```

and the route-level primitive descent obstruction:

```text
P(TTQ)=2
P(QTT)=0
s=-P is exact upstairs but not single-valued on the quotient fiber.
```

No full H² census, mod-p classification, group completion, operational loop, holonomy, curvature, higher-moment hierarchy, Proto-Loom, merge, production, or Vercel action is introduced by this repair.

The red run remains authority-bearing negative evidence for the pre-repair JavaScript representation.  A later green run may witness only the repaired exact head; it may not erase run 2159.

𝌋

Sealed ⟐
