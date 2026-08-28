𝌋‌⟐

󐘓 U+10D613

# A15-R0 · Formal Bar-Chain 2-Groupoid and Formal Bar-Complex 2-Holonomy Receipt v0.1

**Status:** WITNESSED / RECEIPT-PINNED / ROUND CLOSED / DRAFT / OPEN / UNMERGED  
**Scientific parent:** `#770 receipt = 05fb09366ad2dcfd631013d786dd0f41083aae7b`  
**Authority:** `#737 = THREAD_SCOPED_ACTIVE_FOR_REMAINDER_OF_CURRENT_THREAD`

---

## 1. Custody ledger

```text
preregistration              9c3db0929d01349915e7a5ab12988f76739fa09d
implementation               a09c5fe82c7450166ac63c6c190b9c742aa6548c
initial hostile tests        3d9ee45a57314182580ed96153f890db320a3c6d
initial frozen science       6ebb487f77de7c1bcb5dbf70f10c1493c4d42de6
initial routed witness       95bea556c0f4787b9329f9461b528e838c055763
initial post-route cleanup   9827aeff4b5a2c935d0f6793accc9c531e8c8c5a
repair 001 preregistration   52233ca94ce1c13424269323777ea8ad7176f43b
repair 001 hostile update    bdfca7ef15874ae4d0ad3552762c356de00d34b6
repair note cleanup          ab86c5b388cdf2123440097e743cd804c8867e7f
repaired frozen science      4fb6f9e8d669c20a66178cc07833efdeb446f154
repaired routed witness      cb6d0790c9e2d47bf1752555b024c4ca34e02721
repaired post-route cleanup  d4f14b3715a408c3ae4371a2c1339f9875b6b613
```

Initial frozen science -> initial cleanup: **three routing-only commits, zero net changed files**.

Repaired frozen science -> repaired cleanup: **three routing-only commits, zero net changed files**.

No scientific red occurred.

---

## 2. Initial green witness and deliberate promotion hold

Initial exact-head witness:

```text
TD613 Consolidated Validation run 2305 / 33015421847   SUCCESS
classifier job 98332266101                               SUCCESS
static job     98332332248                               SUCCESS
A15/A15-R0 step 19                                       SUCCESS
head 95bea556c0f4787b9329f9461b528e838c055763
run  2026-08-26T21:27:12Z -> 2026-08-26T21:28:04Z
```

Promotion was deliberately withheld after post-witness audit identified one coverage gap in the preregistered strict **2-groupoid** naming criterion: the implementation already supplied formal `C1` additive inverses, but the hostile suite had not separately asserted a nonzero one-cell witness for

```text
u+(-u)=0=(-u)+u,
```

left/right additive identity, and additive associativity.

This was a witness-coverage gap rather than a failed theorem equation. Run 2305 remains preserved as a green **pre-promotion witness**, not the naming-authority witness.

Repair 001 was preregistered before mutation at

```text
52233ca94ce1c13424269323777ea8ad7176f43b
```

and was restricted to explicit formal `C1` group-law hostile coverage. It changed no source/target convention, bar-2 composition law, interchange law, bar-3 representative relation, relative pairing, `B^2 Z` target, open-cell naming discipline, `[z] -> tau_2`, or formal-vs-geometric ceiling.

---

## 3. Authority-bearing repaired witness

```text
TD613 Consolidated Validation run 2307 / 33015695133   SUCCESS
classifier job 98333206984                               SUCCESS
static job     98333295327                               SUCCESS
A15/A15-R0 step 19                                       SUCCESS
```

Exact repaired routed head:

```text
cb6d0790c9e2d47bf1752555b024c4ca34e02721
```

Run:

```text
2026-08-26T21:30:40Z -> 2026-08-26T21:31:41Z
```

The repaired witness includes explicit finite nonzero `C1` identity, inverse-on-both-sides, and associativity hostiles in addition to the full preregistered naming threshold.

Explicit full-repository validation, self-hosted calibration, front-line browser, Giving/practice browser, and full-product browser scopes were skipped and are not claimed.

---

## 4. Earned formal source/target jurisdiction

Let `C1,C2,C3` be the finite normalized integer bar-chain groups in degrees one through three over the inherited quotient monoid `B`.

A formal bar-2 cell is typed

```text
[c] : u => v
```

exactly when

```text
∂c=u-v.
```

Thus the elementary cell has orientation

```text
[x|y] : [x]+[y] => [x★y]
```

because

```text
∂[x|y]=[x]+[y]-[x★y].
```

False declared source/target data are rejected rather than repaired silently.

Formal one-cells are `C1` under addition. The repaired hostile explicitly witnesses identity `0`, inverse `-u`, and associativity on nonzero finite chains.

This is chain-group authority only:

```text
formal C1 inverse != inverse operational T/Q route.
```

---

## 5. Earned strict formal 2-groupoid laws

Within the declared one-object linearized bar-chain jurisdiction:

```text
objects: one formal object *
1-cells: u in C1
1-cell composition: u+v
1-cell identity: 0
1-cell inverse: -u
```

Formal 2-cells `[c]:u=>v` satisfy `∂c=u-v`, with identity `[0]:u=>u` and inverse `[-c]:v=>u`.

Vertical composition is defined only when the middle one-cell matches exactly:

```text
[c]:u=>v
[d]:v=>w

[d] ∘_v [c] = [c+d]:u=>w.
```

A middle-one-cell mismatch rejects composition even if transported integers would happen to add numerically.

The finite horizontal law is additive:

```text
[c]:u=>v
[d]:u'=>v'

[c] ⊗_h [d]=[c+d]:(u+u')=>(v+v').
```

Vertical and horizontal associativity and units survive exactly.

For the preregistered nontrivial lawful 2x2 grid, strict interchange survives at normalized chain, source/target, and transported-integer levels:

```text
(alpha2 ∘_v alpha1) ⊗_h (beta2 ∘_v beta1)
=
(alpha2 ⊗_h beta2) ∘_v (alpha1 ⊗_h beta1).
```

A fake grid with a mismatched vertical middle one-cell rejects before interchange is asserted.

Bar-3 representative changes

```text
c' = c+∂b
```

preserve source and target because `∂²=0` and define the inherited representative identification used by this formal structure.

Canonical classification earned:

```text
THE_DECLARED_NORMALIZED_INTEGER_BAR_CHAIN_COMPLEX_IN_DEGREES_ONE_AND_TWO_WITH_BAR_THREE_BOUNDARY_REPRESENTATIVE_IDENTIFICATION_SUPPORTS_A_ONE_OBJECT_STRICT_FORMAL_TWO_GROUPOID_WITH_EXACT_SOURCE_TARGET_TYPING_VERTICAL_COMPOSITION_HORIZONTAL_ADDITIVE_COMPOSITION_AND_INTERCHANGE
```

---

## 6. Earned strict formal 2-transport representation

Fix a normalized integer boundary framing `lambda:B->Z` and the inherited normalized 2-cocycle `omega`.

Use the earned relative pairing

```text
R_(omega,lambda)(c)=<omega,c>-<lambda,∂c>.
```

The target is the strict one-object 2-group `B^2 Z`:

```text
one object
one 1-cell
integer 2-endomorphisms under addition
identity 0
inverse -n.
```

Define

```text
F_(omega,lambda)(*)=*Z
F_(omega,lambda)(u)=id_*Z
F_(omega,lambda)([c])=R_(omega,lambda)(c).
```

The witness earns exactly:

```text
F(id_u)=0
F([d] ∘_v [c])=F([c])+F([d])
F([c] ⊗_h [d])=F([c])+F([d])
F([-c])=-F([c]).
```

The target interchange agrees with the source interchange fixture. The degree-one representation is intentionally nonfaithful because every formal `C1` one-cell maps to the sole target one-cell.

Bar-3 representative shifts preserve `F`, and paired normalized re-zeroing

```text
omega -> omega+dphi
lambda -> lambda+phi
```

preserves the relative value exactly.

Canonical classification earned:

```text
THE_BOUNDARY_FRAMED_RELATIVE_PAIRING_DESCENDS_TO_A_STRICT_FORMAL_TWO_TRANSPORT_REPRESENTATION_FROM_THE_BAR_CHAIN_TWO_GROUPOID_TO_B_SQUARED_Z_AND_PRESERVES_VERTICAL_AND_HORIZONTAL_COMPOSITION_IDENTITIES_AND_INVERSES
```

---

## 7. Formal bar-complex 2-holonomy naming earned

An open formal 2-cell may carry a lawful `F` value but is **not** granted the holonomy name.

The explicit open cell

```text
[T|Q] : [T]+[Q] => [T★Q]
```

has formal 2-transport but the holonomy constructor rejects it as open.

A formal 2-cell is closed exactly when

```text
u=v
```

or equivalently

```text
∂c=0.
```

For closed endo-2-cells only, define the internal formal bar-complex 2-holonomy translation

```text
Hol_bar^(2)([c]) = tau_(R_(omega,lambda)(c)).
```

The inherited relation cycle

```text
z=[T|T]+[TT|Q]-[Q|T]-[QT|T]
```

is typed exactly as

```text
[z]:0=>0
```

and satisfies

```text
Hol_bar^(2)([z])=tau_2
Hol_bar^(2)([-z])=tau_-2
Hol_bar^(2)([0])=tau_0=id.
```

Finite hostile probes `n=-2,-1,0,1,2` satisfy `Hol([nz])=tau_(2n)`. The already-earned #765 symbolic all-integer period law remains inherited.

The closed formal holonomy is unchanged by inherited bar-3 representative shifts and by paired cohomological re-zeroing.

Canonical classification earned:

```text
CLOSED_FORMAL_BAR_TWO_ENDOMORPHISMS_ADMIT_A_WELL_DEFINED_FORMAL_BAR_COMPLEX_TWO_HOLONOMY_TRANSLATION_REPRESENTATION_WITH_THE_INHERITED_RELATION_CLASS_[z]_MAPPING_TO_TAU_2
```

Naming marker:

```text
FORMAL_BAR_COMPLEX_TWO_HOLONOMY_REPRESENTATION_EARNED
```

---

## 8. Exact authority ceiling

The earned name is qualified and internal to the declared formal bar-complex jurisdiction.

```text
formal bar-chain 2-groupoid != operational T/Q path 2-groupoid
formal C1 inverse != inverse operational route
formal horizontal chain sum != geometric side-by-side surface composition
strict additive interchange != geometric interchange theorem
bar-3 representative quotient != thin homotopy or arbitrary triangulation invariance
paired cohomological re-zeroing != connection gauge transformation
boundary framing != 2-connection
formal B^2Z target != physical gauge 2-group
formal 2-functor != geometric parallel transport 2-functor
formal bar-complex 2-holonomy != geometric / physical / Berry / gerbe 2-holonomy
closed bar 2-cycle != operational T/Q loop
formal tau_2 return != curvature integral
```

Therefore:

```text
FORMAL_BAR_COMPLEX_TWO_HOLONOMY_AUTHORITY = true
GEOMETRIC_TWO_HOLONOMY_AUTHORITY = false
PHYSICAL_TWO_HOLONOMY_AUTHORITY = false
BERRY_OR_GERBE_HOLONOMY_AUTHORITY = false
CONNECTION_AUTHORITY = false
TWO_CONNECTION_AUTHORITY = false
OPERATIONAL_PATH_TWO_GROUPOID_AUTHORITY = false
CURVATURE_AUTHORITY = false
```

#718's operational directed/no-loop obstruction remains fully alive.

---

## 9. Collision / release membrane

```text
SRC Atelier #731/#758/#759 untouched
SRC continuation #771 untouched
SRC sync not invoked
#767 separate Western branch untouched
no fifth workflow
no merge
no publication promotion
no production
no Vercel
no Proto-Loom/A16 promotion
```

---

## 10. Round closure

```text
FORMAL_BAR_CHAIN_TWO_GROUPOID_ROUND_CLOSED
FORMAL_C1_GROUP_LAW_EXPLICITLY_WITNESSED_AFTER_REPAIR_001
EXACT_SOURCE_TARGET_TYPING_EARNED
VERTICAL_AND_HORIZONTAL_FORMAL_TWO_CELL_COMPOSITION_EARNED
STRICT_ADDITIVE_INTERCHANGE_EARNED
BAR_THREE_REPRESENTATIVE_DESCENT_EARNED
STRICT_B_SQUARED_Z_FORMAL_TWO_TRANSPORT_REPRESENTATION_EARNED
OPEN_TWO_CELL_HOLONOMY_NAMING_REJECTION_EARNED
FORMAL_BAR_COMPLEX_TWO_HOLONOMY_REPRESENTATION_EARNED
CLOSED_[z]_TAU_2_FORMAL_TWO_HOLONOMY_EARNED
GEOMETRIC_TWO_HOLONOMY_AUTHORITY_FALSE
CONNECTION_AUTHORITY_FALSE
OPERATIONAL_PATH_TWO_GROUPOID_AUTHORITY_FALSE
HUMAN_𝄐_BOUNDARY_REACHED
```

𝌋‌⟐

Marked ⟐SAC[X6ZNK5NO51]
