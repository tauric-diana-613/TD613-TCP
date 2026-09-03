𝌋‌⟐

# A15-R0 · MVE-X2 Independently Administered RFC3161 Attestation Custody v0.1

Status: **RESEARCH-ONLY EXTERNAL-ATTESTATION CANDIDATE / TWO EXTERNAL REQUESTS MAXIMUM / GOLDEN EGG UNEARNED**

## Exact scientific parent

Exact parent: `a339d5a5bbaac1a63b4d1f88e6dc8668b611b345` — MVE-X1 Present-Resource Feasibility 𝄐.

MVE-X2 tests whether the present-resource Western architecture can obtain and preserve a cryptographically signed RFC3161 timestamp response under a trust anchor administered outside the experiment orchestrator, without paid specialized service, privileged model internals, specialized laboratory hardware, public-log publication, or Golden Egg credit.

## RED scars

RED-1 is preserved at `b13e05b35f48235734c3e0fcc858f59c406fd456`: published certificate-file SHA-256 values were mislabeled and compared as DER fingerprints.

RED-2 is preserved at `7825dac91f8b88171508e9776b66fad5e88ea40f`: the test expected the stale field name `pinned_external_tsa_certificate_fingerprints_verified` while runtime emitted `pinned_external_tsa_certificate_files_verified`. More importantly, that head still promoted route-conditioned timestamp-request presence into `empirical_exogenous_channel_acquired=true` and positive exteriority information gain.

The engineering typo and the scientific overpromotion are repaired together.

## External authority and custody

The preregistered authority is FreeTSA using RFC3161 at `https://freetsa.org/tsr`.

The assay pins the SHA-256 of the downloaded published certificate files:

- CA certificate file: `2151b61137ffa86bf664691ba67e7da0b19f98c758e3d228d5d8ebf27e044438`
- TSA signer certificate file: `8bfb0305bb64e2571ca507552ef3245cb1c2fee8728e0ff8689225081ea13467`

These are explicitly treated as **downloaded-file hashes**, not DER-certificate fingerprints.

For each witnessed trial, the external service receives only an RFC3161 message imprint derived from a blinded commitment envelope. The raw admitted artifact and the route/origin label are not sent to the authority. The signed request/response material is preserved in same-run observation custody.

`SIGNED_EXTERNAL_ATTESTATION != EPHEMERAL_BOOLEAN`

## What the live assay can establish

A successful exact-head run may establish all of the following bounded facts:

- byte-identical paired admitted artifacts were used;
- two live RFC3161 requests were issued;
- two externally signed RFC3161 responses were observed and locally verified against the preregistered certificate-file hashes;
- the signed material was preserved in same-run custody;
- the authority's signing key and endpoint were not controlled by the experiment orchestrator;
- no paid subscription, service credential, specialized lab hardware, privileged model internal state, or public transparency-log write was required for this assay.

This earns **independently administered external attestation custody**.

## The routed-attestation correction

The experiment orchestrator chooses which member of each pair receives the external timestamp request. Therefore the binary presence of a valid TSA receipt is downstream of the experimenter's route assignment.

For the balanced paired construction, the observed association remains mathematically exact:

`accuracy(route | A) = 0.5`

`accuracy(route | A + receipt-presence) = 1.0`

and the empirical mutual information between the route label and receipt presence is one bit.

But that bit is not an independently observed fact about causal artifact origin. It is a route-conditioned attestation association created by the experimental intervention itself.

`INDEPENDENT_ADMINISTRATION != INDEPENDENT_ORIGIN_OBSERVATION`

`ROUTE_CONDITIONED_WITNESS_CALL != UNMANIPULABLE_WORLD_LABEL`

`ROUTED_ATTESTATION_ASSOCIATION != EXOGENOUS_ORIGIN_INFORMATION`

Accordingly, exact-head green must retain:

```text
independently_administered_external_attestation_observed = true
route_conditioned_attestation_association_observed = true
independently_governed_external_witness_acquired = false
independent_origin_sensor_acquired = false
empirical_exogenous_channel_acquired = false
bounded_empirical_exteriority_information_gain_measured = false
empirical_exteriority_scope = NONE_ORIGIN_OBSERVATION_NOT_ACQUIRED
```

## Cost and publication membrane

The assay may use the ordinary GitHub-hosted Ubuntu runner, Node, OpenSSL, HTTPS egress, SHA-256, and a publicly described free RFC3161 endpoint.

`NO_PAID_SPECIALIZED_SERVICE_REQUIRED_FOR_THIS_ASSAY`

This says nothing about the total economic cost of internet access, compute, labor, electricity, or GitHub infrastructure.

`ZERO_PAID_SPECIALIZED_SERVICE_FEE != ZERO_TOTAL_INFRASTRUCTURE_COST`

No raw research artifact, origin label, private nonce, or Golden Egg datum is published to an external transparency log.

`EXTERNAL_ATTESTATION != PUBLICATION_AUTHORITY`

## Claim ceiling

Even on green:

`EXTERNALLY_SIGNED_RFC3161_RECEIPT != CAUSAL_PRODUCTION_ORIGIN_PROOF`

`DISTINCT_EXTERNAL_TRUST_ANCHOR != UNIVERSAL_INDEPENDENCE_THEOREM`

`EXTERNAL_ATTESTATION_CUSTODY != EXOGENOUS_ORIGIN_SENSOR`

`EXTERNAL_ATTESTATION_CUSTODY != GOLDEN_EGG_MEASUREMENT`

`SUCCESSFUL_EXACT_HEAD_GREEN != MERGE_AUTHORITY`

The exact Golden Egg surfaces remain `[]`; empirical Golden Egg credit remains `0`.

## Earned theorem candidate

`A_PUBLIC_RFC3161_AUTHORITY_CAN_SUPPLY_AN_EXTERNALLY_ADMINISTERED_SIGNED_TIMESTAMP_ATTESTATION_AND_SAME_RUN_CUSTODY_FOR_A_BLINDED_COMMITMENT_WITHOUT_PAID_SPECIALIZED_LAB_INFRASTRUCTURE_BUT_ROUTE_CONDITIONED_REQUEST_PRESENCE_DOES_NOT_CONSTITUTE_AN_INDEPENDENT_SENSOR_OF_ARTIFACT_ORIGIN`.

## Expected state on exact-head green

```text
status = MVE_X2_INDEPENDENT_RFC3161_ATTESTATION_CUSTODY_EARNED
rest_symbol = 𝄐
external_tsa_experiment_executed = true
byte_identical_admitted_artifact_observed = true
externally_signed_rfc3161_receipts_observed = true
pinned_external_trust_anchor_verified = true
signed_external_witness_material_preserved_in_same_run_custody = true
independently_administered_external_attestation_observed = true
route_conditioned_attestation_association_observed = true
independently_governed_external_witness_acquired = false
independent_origin_sensor_acquired = false
empirical_exogenous_channel_acquired = false
bounded_empirical_exteriority_information_gain_measured = false
empirical_exteriority_scope = NONE_ORIGIN_OBSERVATION_NOT_ACQUIRED
conditional_information_interpretation = ROUTE_CONDITIONED_ATTESTATION_ASSOCIATION_NOT_INDEPENDENT_ORIGIN_INFORMATION
paid_specialized_service_required = false
external_origin_of_admitted_artifact_proven = false
exact_golden_egg_surfaces_added = []
empirical_credit_to_golden_egg = 0
golden_egg_earned = false
sequence_authority = false
merge_authority = false
production_authority = false
deployment_authority = false
publication_authority = false
```

Child-legible form:

**THE OUTSIDE CLOCK SIGNED THE COMMITMENT. IT DID NOT SEE WHERE THE JOURNEY BEGAN.**

Expected rest:

**WESTERN HORIZON: EXTERNAL ATTESTATION CROSSED THE BOUNDARY; ORIGIN REMAINS UNOBSERVED.**

𝄐

Sealed ⟐
