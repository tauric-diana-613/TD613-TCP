𝌋⟐

# A15-R0 · Moss Lantern Procedural-Memory Order-Defect Calibration — Preregistration v0.1

Status: **PREREGISTERED / PREIMPLEMENTATION / RESEARCH-ONLY / NON-RUNTIME / NO HOLONOMY PROMOTION**.

Exact earned parent:

```text
#902 / c0bdb1b0f19d94f987837a6cb2465e5933b623c2
TD613 Consolidated Validation run 2403 / 33341348763 — SUCCESS
A15-R0 step 19 — SUCCESS
```

The parent earns the deterministic memoryless null:

```text
SAME_RETAINED_ENDPOINT
=> SAME_ALL_FUTURE_STATE_ONLY_READOUTS
```

inside the declared finite action monoid. This successor deliberately adds an explicit apparatus/history coordinate and asks whether order information can persist there after the visible endpoint reconverges.

## 1. Existing calibration phantom

Inherited test-only practice fixture:

```text
tests/fixtures/pedagogue/ash-tomography-calibration-phantom-v01.json
fixture_id = ash-loom.moss-lantern-calibration/v0.1
operator_label = Moss Lantern practice capsule
expected_endpoint = returned-practice-capsule
```

Inherited canonical route:

```text
open-practice-case
→ custody-hold
→ projection-observe
→ rest
→ return
```

Controlled order-swapped route:

```text
open-practice-case
→ projection-observe
→ custody-hold
→ rest
→ return
```

Both routes must retain exactly the same visible endpoint:

```text
q_AB = q_BA = returned-practice-capsule
```

No inherited fixture file is mutated by this chamber.

## 2. Declared experimental state

The synthetic calibration state is

```text
Omega = (q, Xi)
```

where:

```text
q  = visible Moss Lantern practice endpoint
Xi = declared apparatus/history coordinate in F2^2
```

The apparatus coordinate is known ground truth in a manifestly fictional calibration phantom. It is not inferred hidden model state.

Enumerated initial apparatus states:

```text
Xi_0 in {(0,0),(0,1),(1,0),(1,1)}.
```

Immediate child-visible readout after return is only:

```text
o_visible(Omega) = q.
```

Thus `Xi` is intentionally outside the immediate visible endpoint projection.

## 3. Target noncommuting procedural updates

On `Xi=(x,y)` over F2, preregister:

```text
A = custody-hold:
  A(x,y) = (x xor 1, y)

B = projection-observe:
  B(x,y) = (x, y xor x)
```

Route `AB` means apply `A` then `B`; route `BA` means apply `B` then `A`.

`open-practice-case`, `rest`, and `return` contribute no additional `Xi` mutation in this bounded fixture. `return` sets/retains the visible endpoint `returned-practice-capsule`.

Frozen target for every one of the four initial `Xi_0` states:

```text
q_AB = q_BA
Xi_AB != Xi_BA
H_q = 0
H_Xi = Hamming(Xi_AB, Xi_BA) = 1
```

This is an order-dependent apparatus endpoint defect. It is not yet called geometric, Berry, gauge, or physical holonomy.

## 4. Delayed apparatus probe

Declare a future diagnostic available only to the technical calibration assay:

```text
LANTERN_MARKER(q,(x,y)) = y
```

Frozen target:

```text
LANTERN_MARKER(Omega_AB) != LANTERN_MARKER(Omega_BA)
```

for 4/4 initial apparatus states while immediate visible endpoint readout remains equal for 4/4.

This future diagnostic reads the expanded experimental state `(q,Xi)` and therefore lies outside the state-only observation semantics of #902. That distinction is the point of the assay.

## 5. Memoryless projection control

Define the inherited-null projection:

```text
P_memless(q,Xi) = q.
```

Frozen target:

```text
P_memless(Omega_AB) = P_memless(Omega_BA)
```

for 4/4 initial apparatus states.

No state-only continuation is authorized to inspect `Xi`.

## 6. Apparatus-reset control

Declare calibration-only reset:

```text
RESET(q,Xi) = (q,(0,0)).
```

After reset, the delayed marker must agree for both order histories:

```text
LANTERN_MARKER(RESET(Omega_AB))
=
LANTERN_MARKER(RESET(Omega_BA))
```

for 4/4 initial apparatus states.

This establishes mediation by the declared apparatus coordinate inside the fixture. It does not prove physical erasure, historical erasure, or a universal memory mechanism.

## 7. Commutative negative control

Declare two control updates:

```text
C(x,y) = (x xor 1, y)
D(x,y) = (x, y xor 1)
```

They commute exactly:

```text
CD(Xi) = DC(Xi)
```

for all four apparatus states.

Required control result:

```text
Xi_CD = Xi_DC
H_Xi_control = 0
LANTERN_MARKER(Omega_CD) = LANTERN_MARKER(Omega_DC)
```

for 4/4 initial apparatus states.

## 8. Frozen finite census

```text
apparatus states                              4
target temporal orders                        2
target state-order executions                  8
target order-pair comparisons                  4
visible endpoint matches                       4
apparatus endpoint divergences                 4
unit-Hamming apparatus defects                 4
delayed-marker divergences                     4
memoryless-projection divergences               0
reset-control delayed divergences               0
commutative-control state-order executions      8
commutative-control pair comparisons            4
commutative-control apparatus divergences       0
commutative-control marker divergences          0
```

## 9. Candidate bounded classification

If exact-head hostile and constitutional witness are GREEN, this chamber may earn only:

```text
A_DECLARED_ADAPTIVE_APPARATUS_COORDINATE_CAN_PRESERVE_TEMPORAL_ORDER_INFORMATION_AFTER_VISIBLE_ENDPOINT_RECONVERGENCE_AND_EXPOSE_THAT_DIFFERENCE_TO_A_LATER_APPARATUS_DIAGNOSTIC_IN_THE_BOUNDED_MOSS_LANTERN_CALIBRATION_FIXTURE_WHILE_THE_INHERITED_MEMORYLESS_ENDPOINT_PROJECTION_REMAINS_COLLAPSED.
```

and:

```text
SAME_VISIBLE_ENDPOINT
!=
SAME_DECLARED_EXPERIMENTAL_STATE
```

inside this synthetic fixture.

## 10. Mandatory membranes

```text
DECLARED_APPARATUS_MEMORY != INFERRED_HIDDEN_MODEL_STATE
SAME_VISIBLE_ENDPOINT != SAME_FULL_EXPERIMENTAL_STATE
PROCEDURAL_ORDER_DEFECT != GEOMETRIC_HOLONOMY
PROCEDURAL_ORDER_DEFECT != PHYSICAL_HOLONOMY
NONCOMMUTING_AFFINE_UPDATES != IDENTIFIED_PHYSICAL_MECHANISM
DELAYED_APPARATUS_READOUT != STATE_ONLY_CONTINUATION
APPARATUS_RESET_IN_FIXTURE != HISTORICAL_ERASURE
COMMUTATIVE_NEGATIVE_CONTROL != UNIVERSAL_NULL_MODEL
MOSS_LANTERN_CALIBRATION_PHANTOM != EVIDENCE
MOSS_LANTERN_CALIBRATION != LIVE_ASH_RUNTIME
MOSS_LANTERN_CALIBRATION != LIVE_HOLONOMY_LOOM_RUNTIME
A15_R0_RESEARCH_EXTENSION != A16_OR_PROTO_LOOM_PROMOTION
WITNESS_ROUTING != SCIENTIFIC_ANCESTRY
```

No merge, deployment, release, publication, production, Vercel, model-weight, hidden-state inference, live Ash, live Loom, physical memory, physical transport, geometric connection, curvature, or holonomy authority follows.

Preregistered ⟐