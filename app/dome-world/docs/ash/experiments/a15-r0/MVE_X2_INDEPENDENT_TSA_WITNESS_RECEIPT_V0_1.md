𝌋‌⟐

# A15-R0 · MVE-X2 Independently Administered RFC3161 Witness v0.1

Status: **PREREGISTERED EXTERNAL-WITNESS EMPIRICAL CANDIDATE / RESEARCH-ONLY / TWO EXTERNAL REQUESTS MAXIMUM / GOLDEN EGG UNEARNED**

## Exact scientific parent

Exact parent: `a339d5a5bbaac1a63b4d1f88e6dc8668b611b345` — MVE-X1 Present-Resource Feasibility 𝄐.

MVE-X1 executed the first real bounded origin-observability pilot using byte-identical admitted artifacts and a process-separated loopback socket event channel. It deliberately held independent governance and empirical exogenous-channel acquisition false.

MVE-X2 changes exactly one burden:

**the new witness channel must now be issued under a cryptographic trust anchor administered outside the TD613 experiment orchestrator.**

## Funding criticism converted into a hostile test

The practical criticism is no longer that the bounded architecture is literally impossible. The live objection is that the stronger external-witness experiment may require institutional money, specialized laboratory hardware, privileged model internals, a paid external service, or publication infrastructure.

MVE-X2 therefore preregisters a zero-paid-specialized-service route using a currently public RFC3161 Time Stamp Authority.

External source checked before preregistration on 2026-09-02:

- FreeTSA homepage: `https://freetsa.org/index_en.php`
- FreeTSA Certification Practice Statement: `https://www.freetsa.org/freetsa_cps.html`
- RFC3161 endpoint: `https://freetsa.org/tsr`

The public service describes itself as a free Time Stamp Authority and publishes the current 2026 TSA and CA certificate material. The experiment does **not** infer legal admissibility, regulatory trust status, or universal institutional independence from that description.

Pinned certificate fingerprints from the published CPS:

- FreeTSA CA certificate SHA-256 over DER: `2151b61137ffa86bf664691ba67e7da0b19f98c758e3d228d5d8ebf27e044438`
- FreeTSA TSA signer certificate SHA-256 over DER: `8bfb0305bb64e2571ca507552ef3245cb1c2fee8728e0ff8689225081ea13467`

If either runtime certificate differs from the preregistered fingerprint, the experiment fails.

## Bounded route variable

`Ω_X2 ∈ { LOCAL_ONLY, FREETSA_RFC3161_WITNESSED }`

This is a bounded route/witness-participation variable. It is not a metaphysical source ontology and it is not a proof of who causally produced the admitted artifact.

`BOUNDED_ROUTE_WITNESS_VARIABLE != UNIVERSAL_ARTIFACT_ORIGIN`

## Identical admitted artifact A

For each challenge pair `q_i`, both routes produce the same artifact bytes and the same SHA-256 digest:

`A_i(LOCAL_ONLY) = A_i(FREETSA_RFC3161_WITNESSED)`.

The pilot rejects any pair lacking byte identity.

Therefore the A-only origin classifier remains fixed at chance for the balanced paired episode:

`accuracy(Ω_X2 | A) = 0.5`.

## Independently issued channel X

The witnessed route creates a blinded commitment envelope containing only:

- experiment schema;
- episode identifier;
- pair identifier;
- SHA-256 digest of A;
- fresh random witness nonce.

The raw artifact is not placed in that envelope. The origin class label is not placed in that envelope.

OpenSSL then constructs an RFC3161 TimeStampRequest over the envelope. RFC3161 transmits the message imprint, not the source artifact bytes.

FreeTSA returns the external TimeStampResponse. The pilot verifies that response locally with OpenSSL against the preregistered FreeTSA CA and TSA signer certificate fingerprints.

The two RFC3161 requests and signed responses are also preserved in the same workflow run under `artifacts/pedagogue-observation-custody/mve-x2-rfc3161-observation.json`. The custody record stores request/response bytes as base64 plus their digests and pinned trust-anchor fingerprints; it does not store raw A, origin labels, or the private witness nonce. The repository's existing observation-custody upload step then preserves that JSON as a short-retention workflow artifact.

`SIGNED_EXTERNAL_WITNESS != EPHEMERAL_BOOLEAN`

The scored side channel is:

`X_i = valid externally signed RFC3161 receipt ∈ { false, true }`.

Only the FREETSA_RFC3161_WITNESSED route may possess a valid external receipt.

## Request ceiling

The entire empirical chamber is limited to exactly two timestamp requests: one witnessed route in each of two paired challenges.

This ceiling exists to avoid turning a research assay into gratuitous external-service load.

`EXTERNAL_WITNESS_ACQUISITION != SERVICE_ABUSE`

## Expected bounded result

For two balanced pairs:

`A-only route accuracy = 0.5`.

If both witnessed trials return valid signed RFC3161 responses and neither local-only trial does, then:

`A+X route accuracy = 1.0`

and:

`I(Ω_X2 ; X | A) = 1 bounded bit`.

On exact-head green, this may earn a bounded empirical statement that a positive conditional-information channel beyond byte-identical A was actively acquired from a cryptographically distinct externally administered authority during the experiment.

## What independent means here

The experimenter controls:

- the challenge generation;
- route selection;
- the salted commitment construction;
- whether a request is sent;
- local verification and adjudication code.

The experimenter does **not** control:

- the FreeTSA service endpoint;
- the FreeTSA TSA signing private key;
- the preregistered FreeTSA certificate chain.

The runtime evidence of that distinction is a signed RFC3161 response that verifies under a preregistered trust anchor different from the experiment orchestrator's own keys.

This supports bounded independently administered witness acquisition. It does not establish universal sociological, legal, or metaphysical independence.

`DISTINCT_EXTERNAL_TRUST_ANCHOR != UNIVERSAL_INDEPENDENCE_THEOREM`

## Cost membrane

The chamber requires:

- Node 22 already present in the repository validator;
- OpenSSL already present on the ordinary Ubuntu runner;
- ordinary HTTPS egress;
- SHA-256;
- two requests to a publicly described free RFC3161 service.

It requires no paid TSA account, service credential, proprietary detector, novel hardware, quantum apparatus, privileged model state, Vercel mutation, production deployment, or school-purchased laboratory instrument.

This establishes only:

`NO_PAID_SPECIALIZED_SERVICE_REQUIRED_FOR_THIS_ASSAY`.

It does **not** claim that GitHub runners, institutional networking, electricity, labor, or the internet have zero economic cost.

`ZERO_PAID_SPECIALIZED_SERVICE_FEE != ZERO_TOTAL_INFRASTRUCTURE_COST`

## Publication membrane

MVE-X2 must not write to a public transparency log. It sends only an RFC3161 message imprint and receives a timestamp response.

No raw TD613 research artifact, source file, Golden Egg datum, private nonce, or origin label may be published to an external log.

`EXTERNAL_WITNESS_ACQUISITION != PUBLICATION_AUTHORITY`

## Falsification conditions

The chamber goes RED if any of the following occur:

- paired A artifacts differ;
- either preregistered certificate fingerprint does not match runtime certificate material;
- OpenSSL cannot verify the RFC3161 response against the exact request and pinned trust material;
- either of the two witnessed routes lacks a valid response;
- either signed request/response pair is not preserved in same-run observation custody;
- the external witness receives a raw artifact or origin label;
- the A-only classifier exceeds chance because route information leaked into A;
- A+X does not exceed chance;
- `I(Ω_X2;X|A) <= 0`;
- a paid subscription or service credential is required;
- specialized lab hardware or privileged model internals are required;
- a public transparency log is written;
- the receipt is promoted into causal proof of the production origin of A;
- Golden Egg credit is introduced.

## Claim ceiling

Even on green:

`EXTERNALLY_SIGNED_RFC3161_RECEIPT != CAUSAL_PRODUCTION_ORIGIN_PROOF`

`ROUTE_CONDITIONED_WITNESS_CALL != UNMANIPULABLE_WORLD_LABEL`

`DISTINCT_TRUST_ANCHOR != UNIVERSAL_GOVERNANCE_INDEPENDENCE`

`BOUNDED_EMPIRICAL_EXTERIORITY_INFORMATION_GAIN != UNIVERSAL_EXTERNALITY`

`EXOGENOUS_CHANNEL_ACQUISITION != GOLDEN_EGG_MEASUREMENT`

`EXTERNAL_WITNESS_ACQUISITION != MERGE_OR_DEPLOYMENT_AUTHORITY`

The exact Golden Egg surfaces remain `[]` and empirical Golden Egg credit remains `0`.

## Earned theorem candidate

`A_BOUNDED_ROUTE_ORIGIN_EXPERIMENT_CAN_ACQUIRE_POSITIVE_CONDITIONAL_INFORMATION_BEYOND_BYTE_IDENTICAL_ADMITTED_ARTIFACT_A_FROM_AN_EXTERNALLY_SIGNED_RFC3161_WITNESS_X_ISSUED_UNDER_A_DISTINCT_PREREGISTERED_TRUST_ANCHOR_WITHOUT_PAID_SPECIALIZED_LAB_INFRASTRUCTURE_WHILE_NOT_PROVING_THE_CAUSAL_PRODUCTION_ORIGIN_OF_A`.

## Expected state on exact-head green

```text
status = MVE_X2_INDEPENDENT_RFC3161_WITNESS_EARNED
rest_symbol = 𝄐
external_tsa_experiment_executed = true
byte_identical_admitted_artifact_observed = true
externally_signed_rfc3161_receipts_observed = true
pinned_external_trust_anchor_verified = true
signed_external_witness_material_preserved_in_same_run_custody = true
independently_governed_external_witness_acquired = true
empirical_exogenous_channel_acquired = true
bounded_empirical_exteriority_information_gain_measured = true
empirical_exteriority_scope = BOUNDED_ROUTE_WITNESS_ONLY
a_only_origin_accuracy = 0.5
a_plus_x_origin_accuracy = 1.0
bounded_conditional_origin_information_bits = 1.0
paid_specialized_service_required = false
external_origin_of_admitted_artifact_proven = false
universal_externality_claim = false
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

**THE SCHOOL DID NOT BUY A LAB. THE WITNESS SIGNED THE HASH.**

Expected rest:

**WESTERN HORIZON: X CROSSED AN INSTITUTIONAL BOUNDARY AND CAME BACK SIGNED.**

𝄐

Sealed ⟐
