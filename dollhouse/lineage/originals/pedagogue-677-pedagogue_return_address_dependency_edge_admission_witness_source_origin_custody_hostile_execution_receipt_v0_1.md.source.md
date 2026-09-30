# Pedagogue Return Address · Dependency-Edge Admission Witness Source-Origin Custody · Hostile Execution Receipt v0.1

**Status:** SEALED EXECUTION RECEIPT / ATTACK-ONLY / NOT PROMOTED  
**Candidate:** `E8_DEPENDENCY_EDGE_ADMISSION_WITNESS_SOURCE_ORIGIN_CUSTODY`  
**Assay:** Return Address  
**Schema:** `td613.pedagogue.dependency-edge-admission-witness-source-origin-custody-hostile/v0.1`

## 1. Exact lineage

```text
E7 sealed receipt
6200e9b86844e23692fe125cd3d10df47b14ffab

E8 preregistration
ad009c6dd3d0a93b5a42bd2c9eab167c021b8403

E8 evaluator
ebfbda5ddefc74970806488960f8fbd373dcb8e3

E8 hostile science head
aa385c1108d0528f57f7ca7e24e0a772e8226add
```

The science head was witnessed by `TD613 Consolidated Validation` run **1924 / 32546722351**, static job **96966379006**. The static constitutional job completed `SUCCESS`; step 18, `Validate Ash A15 empirical profile journeys and A15-R0 research field`, completed `SUCCESS`. Explicit full-repository validation, self-hosted calibration, front-line browser shards, Giving/practice browser witness, and full-product browser witness were all `SKIPPED`.

## 2. Result provenance

```text
RESULT_PROVENANCE = LITERAL_CI_STDOUT_RECOVERED
LITERAL_STDOUT_BLOCK_RECOVERED = true
```

Unlike the E6 and E7 receipts, the E8 result block was recovered directly from the witnessed static job log. The receipt below therefore preserves observed CI stdout rather than reconstructing the verdict from source.

### Exact emitted result block

```json
{
  "ok": true,
  "schema": "td613.pedagogue.dependency-edge-admission-witness-source-origin-custody-hostile/v0.1",
  "inherited_e7_verdict": "DEPENDENCY_EDGE_ADMISSION_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_CLERK_WAS_ALREADY_THERE",
  "inherited_e7_source_origin_verdict": "E7_SOURCE_ORIGIN_INSUFFICIENCY_ESTABLISHED",
  "e8_verdict": "DEPENDENCY_EDGE_ADMISSION_WITNESS_SOURCE_ORIGIN_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_RETURN_ADDRESS",
  "e8_defeat_conditions": [],
  "RA01_e7_status": "ADMIT_NON_ANTICIPATING_DEPENDENCY_EDGE_ADMISSION_WITNESS",
  "RA01_e8_status": "REFUSE_SOURCE_ORIGIN_UNIDENTIFIED",
  "RA01_W2": "REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT",
  "RA02_status": "ADMIT_SYNTHETIC_SOURCE_ORIGIN_BOUND_WITNESS",
  "RA02_W2": "ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT",
  "RA03_status": "REFUSE_SOURCE_ORIGIN_INTERNAL_SELF_ATTESTATION",
  "RA04_status": "REFUSE_SOURCE_ORIGIN_TARGET_MISMATCH",
  "RA05_status": "ABSTAIN_SOURCE_ORIGIN_ANCHOR_STALE",
  "RA06_status": "ABSTAIN_CONFLICTING_SOURCE_ORIGIN_ANCHORS",
  "RA07_invariant": true,
  "RA08_duplicate_amplification": false,
  "RA09_status": "REFUSE_SOURCE_ORIGIN_INTERNAL_SELF_ATTESTATION",
  "RA10_status": "REFUSE_E7_NON_ANTICIPATING_ACQUISITION_INVALID",
  "RA11_status": "REFUSE_UNACCEPTED_SOURCE_ORIGIN_CLASS",
  "RA12_status": "ADMIT_SYNTHETIC_SOURCE_ORIGIN_BOUND_WITNESS",
  "next_learning_action_if_survives": "STOP_SYNTHETIC_SOURCE_ORIGIN_LANE_AND_REQUIRE_NEW_HUMAN_GESTURE_FOR_LIVE_EXTERNAL_SOURCE_OBSERVABILITY",
  "deployment_performed": false,
  "release_authority": false
}
```

## 3. Exact bounded verdict

```text
E7_SOURCE_ORIGIN_INSUFFICIENCY_ESTABLISHED

DEPENDENCY_EDGE_ADMISSION_WITNESS_SOURCE_ORIGIN_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_RETURN_ADDRESS

defeat_conditions = []
```

## 4. Strong falsifier actually established

RA01 and RA02 hold the E7 timing predicate constant and vary only bounded source-origin custody.

```text
RA01 · NO LAWFUL SOURCE-ORIGIN ANCHOR
valid pre-proposal E7 witness
→ E7 = ADMIT_NON_ANTICIPATING_DEPENDENCY_EDGE_ADMISSION_WITNESS
→ E8 = REFUSE_SOURCE_ORIGIN_UNIDENTIFIED
→ W2 = REFUSE_CURRENT_WARRANT_NO_ACTIVE_LAWFUL_SUPPORT

RA02 · MATCHING SYNTHETIC SOURCE-ORIGIN ANCHOR
same bounded E7-valid timing posture
+ admitted matching synthetic source-origin observation
→ E8 = ADMIT_SYNTHETIC_SOURCE_ORIGIN_BOUND_WITNESS
→ W2 = ADMIT_CURRENT_WARRANT_WITH_TRANSITIVE_LAWFUL_SUPPORT
```

Therefore, within this synthetic assay:

```text
pre-proposal acquisition != independently admitted source origin
E7 timing validity != E8 source-origin validity
source-origin admission may preserve inherited consequence only within its exact bounded scope
```

## 5. RA01–RA12 observed reconciliation

- **RA01 · Return Address Missing:** E7 still admits the non-anticipating witness, while E8 refuses source-origin authority as `REFUSE_SOURCE_ORIGIN_UNIDENTIFIED`; W2 remains unsupported.
- **RA02 · Return Address Present:** a matching admitted synthetic source-origin observation yields `ADMIT_SYNTHETIC_SOURCE_ORIGIN_BOUND_WITNESS`; inherited W2 support is preserved.
- **RA03 · Address Written by Sender:** internal source-origin self-attestation is refused as `REFUSE_SOURCE_ORIGIN_INTERNAL_SELF_ATTESTATION`.
- **RA04 · Address Belongs to Another House:** wrong-target origin evidence is refused as `REFUSE_SOURCE_ORIGIN_TARGET_MISMATCH`.
- **RA05 · Old Forwarding Label:** stale origin evidence abstains as `ABSTAIN_SOURCE_ORIGIN_ANCHOR_STALE`.
- **RA06 · Two Return Addresses:** conflicting source-origin observations abstain as `ABSTAIN_CONFLICTING_SOURCE_ORIGIN_ANCHORS`.
- **RA07 · Envelope Renamed/Reordered:** semantic authority is invariant under identifier/serialization perturbation (`RA07_invariant = true`).
- **RA08 · Duplicate Return Address:** duplicating semantically identical source-origin evidence does not amplify authority (`RA08_duplicate_amplification = false`).
- **RA09 · Decorative EXTERNAL Stamp:** an internal assertion remains refused despite exterior-looking metadata: `REFUSE_SOURCE_ORIGIN_INTERNAL_SELF_ATTESTATION`.
- **RA10 · Perfect Address, Late Clerk:** valid source-origin evidence cannot cure failure of the inherited E7 non-anticipation predicate: `REFUSE_E7_NON_ANTICIPATING_ACQUISITION_INVALID`.
- **RA11 · Unaccepted Origin Class:** a source-origin value outside the preregistered accepted class is refused as `REFUSE_UNACCEPTED_SOURCE_ORIGIN_CLASS`.
- **RA12 · Sealed Valid Control:** the valid bounded composition remains `ADMIT_SYNTHETIC_SOURCE_ORIGIN_BOUND_WITNESS` under the sealed control.

## 6. Claim ceiling

E8 establishes only the consequence of composing two bounded synthetic predicates: E7 internal non-anticipating acquisition and an admitted scoped synthetic source-origin observation.

```text
admitted synthetic source-origin anchor
!= authenticated live source
!= source honesty
!= physical source origin
!= unbiased sampling
!= institutional independence
!= real-world chronology
```

The synthetic source-origin primitive is an admitted test observable. It is not a production trust root, external institutional attestation, cryptographic source authentication, or proof that the represented source is honest or physically where the fixture says it is.

Held beyond this receipt:

```text
live_external_source_adapter = false
external_source_authenticated = false
external_physical_origin_claim = false
source_honesty_claim = false
unbiased_sampling_claim = false
institutional_independence_claim = false
real_world_chronology_claim = false
universal_graph_semantics = false
H2 = HELD_NOT_TESTED_HERE
H3 = HELD_NOT_TESTED_HERE
intersections = HELD_NOT_OPENED_HERE
APERTURE_V32_REPLAY_STABILITY = HELD_NOT_YET_WITNESSED
```

## 7. Terminal synthetic seam

The E8 emitted next action is exact:

`STOP_SYNTHETIC_SOURCE_ORIGIN_LANE_AND_REQUIRE_NEW_HUMAN_GESTURE_FOR_LIVE_EXTERNAL_SOURCE_OBSERVABILITY`

Accordingly:

```text
NEXT_SYNTHETIC_SOURCE_ORIGIN_MUTATION = NOT_EARNED
LIVE_EXTERNAL_SOURCE_OBSERVABILITY = HUMAN_GESTURE_REQUIRED
REAL_INSTITUTIONAL_ATTESTATION = HUMAN_GESTURE_REQUIRED
INTERSECTION_PROGRAM = HUMAN_GESTURE_REQUIRED
```

Another internal ledger, token, capability, checksum, or synthetic label would not widen the evidence jurisdiction established here. Further source-authenticity research requires a genuinely new observability surface and separate human authorization.

## 8. Authority membrane

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

No product, shared Pedagogue engine, workflow, browser, merge, deployment, release, or Vercel mutation is authorized or performed by this receipt.
