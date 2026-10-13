# Pedagogue E8 · Dependency-Edge Admission Witness Source-Origin Custody

## Hostile assay v0.1 · Return Address

**Status:** PREREGISTERED / ATTACK-ONLY / NOT PROMOTED  
**Parent:** E7 Clerk Was Already There sealed receipt `6200e9b86844e23692fe125cd3d10df47b14ffab`  
**Candidate:** `E8_DEPENDENCY_EDGE_ADMISSION_WITNESS_SOURCE_ORIGIN_CUSTODY`  
**Schema:** `td613.pedagogue.dependency-edge-admission-witness-source-origin-custody-hostile/v0.1`

## Research question

E7 established a bounded internal non-anticipation relation: an evaluator-issued witness-acquisition episode may precede the evaluator-issued permit proposal. E7 explicitly does not establish where the witness material came from.

```text
pre-proposal acquisition != independently admitted source origin
```

A witness can arrive before the proposal and still have been fabricated inside the same protocol before the question was asked.

## Candidate mechanism

E8 composes two already-bounded mechanisms rather than inventing a new provenance ontology:

1. E7 must first admit the acquisition as non-anticipating relative to the permit proposal.
2. E1 Open Window must admit a scoped synthetic exogenous observation bound to the exact witness-material fingerprint and field `SOURCE_ORIGIN_CLASS`.
3. The admitted origin value must equal `ADMITTED_EXTERNAL_ORIGIN`.

Only then may E8 preserve the inherited witness consequence.

```text
E7 non-anticipating acquisition
AND E1 scoped source-origin anchor
AND anchor target == witness-material fingerprint
AND observed origin == ADMITTED_EXTERNAL_ORIGIN
→ bounded E8 source-origin custody
```

## Strong falsifier · RA01/RA02 pair

Use the same E7-valid pre-proposal witness acquisition and the same permit proposal.

### RA01 · No return address

```text
E7 = ADMIT_NON_ANTICIPATING_DEPENDENCY_EDGE_ADMISSION_WITNESS
source-origin anchor = absent
E8 must refuse source-origin authority
W2 must not inherit transitive authority through E8
```

### RA02 · Registered return address

```text
same E7-valid acquisition
+ matching admitted synthetic exogenous source-origin anchor
→ E8 = ADMIT_SYNTHETIC_SOURCE_ORIGIN_BOUND_WITNESS
→ inherited W2 authority preserved
```

E7 source-origin insufficiency is established only if RA01 demonstrates that E7 alone would admit the witness while E8 refuses the same witness solely for missing source-origin custody.

## Hostile rooms

1. **RA01 · No Return Address** — E7-valid witness without origin anchor loses E8 authority.
2. **RA02 · Registered Return Address** — matching admitted synthetic exogenous origin anchor preserves authority.
3. **RA03 · Address Written by the Occupant** — `INTERNAL_ASSERTION` cannot establish external origin.
4. **RA04 · Right Street, Wrong House** — origin anchor bound to another witness-material fingerprint is refused.
5. **RA05 · Yesterday's Postmark** — stale origin anchor cannot support current source-origin custody.
6. **RA06 · Two Return Addresses** — contradictory current source-origin observations abstain.
7. **RA07 · Brass Nameplate Shuffle** — anchor-ID renaming and serialization order do not change semantic authority.
8. **RA08 · Duplicate Postage** — duplicate semantically identical origin anchors do not amplify authority or confidence.
9. **RA09 · 'External' Written in Crayon** — textual scope label `EXTERNAL` cannot convert an internal assertion into admitted source origin.
10. **RA10 · Late Clerk With Perfect Return Address** — a valid source-origin anchor cannot cure E7 post-proposal acquisition.
11. **RA11 · Registered Internal Origin** — a scoped anchor observing an unaccepted origin value does not satisfy the candidate.
12. **RA12 · Laminated Return Card** — synthetic origin anchors are immutable within this bounded fixture; the valid control preserves inherited E7/E6/E5/E4 state.

## Defeat conditions

Candidate survival requires an empty defeat list. Defeat includes any of:

- E7 source-origin insufficiency is not established;
- missing origin anchor preserves E8 transitive authority;
- valid matching origin anchor is refused;
- internal self-attestation establishes external origin;
- wrong-target or stale origin anchor preserves authority;
- conflicting origins are arbitrated rather than abstained;
- anchor ID or serialization order selects authority;
- duplicate anchors amplify confidence;
- textual scope labels create origin authority;
- source-origin evidence cures post-proposal acquisition;
- an unaccepted origin value is treated as accepted external origin;
- the synthetic origin fixture mutates or valid control changes inherited current state.

## Claim ceiling

Even survival establishes only a bounded synthetic source-origin custody relation under the already-authorized Open Window fixture grammar.

```text
admitted synthetic source-origin anchor
!= authenticated live source
!= source honesty
!= physical origin
!= institutional independence
!= real-world chronology
```

E8 does not open a live source adapter and does not upgrade `source_kind = ADMITTED_EXOGENOUS_OBSERVATION` into cryptographic, institutional, or physical proof.

If E8 survives, this synthetic lane reaches a real wall: further claims about actual source identity, honesty, physical acquisition, institutional independence, or external chronology require a materially new live external observability surface and therefore a new explicit human gesture.

Held beyond E8:

```text
live_external_source_adapter = false
source_authenticated = false
source_honesty = HELD
physical_origin = HELD
institutional_independence = HELD
external_chronology = HELD
H2 = HELD_NOT_TESTED_HERE
H3 = HELD_NOT_TESTED_HERE
intersections = HELD_NOT_OPENED_HERE
APERTURE_V32_REPLAY_STABILITY = HELD_NOT_YET_WITNESSED
```

## Authority membrane

```text
candidate_status = ATTACK_ONLY_NOT_PROMOTED
promotion_authority = false
product_mutation = false
shared_pedagogue_engine_mutation = false
workflow_mutation = false
browser_execution = false
merge_performed = false
deployment_performed = false
release_authority = false
vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true
```
