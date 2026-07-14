# Ash Keep Reader Adapter Registry

## Version

`v0.1`

## Status

`IMPLEMENTED_VALIDATION_GATED`

Repository state: `MERGED_ON_MAIN`

Merge commit: `b0b600a07c8343311cdde50c2f250881e7f6091c`

## Purpose

The Reader Adapter Registry gives Choir a bounded provenance spine before any cross-Reader disagreement analysis is attempted.

It records which adapter contract was used to admit a Reader result into the local research workflow. It does not execute Readers, contact providers, transport case material, infer identity, attribute authorship, estimate real surveillance probability, prohibit release, or activate an automatic hold.

## Three separate objects

### 1. Adapter registry

Schema:

```text
td613.aperture.reader-adapter-registry/v0.1
```

The registry seals:

- adapter ID, class, and version;
- accepted Reader classes;
- allowed acquisition routes;
- allowed execution environments;
- provider-receipt requirement;
- source status;
- explicit non-authority fields.

Supported adapter classes:

```text
DETERMINISTIC_REFERENCE
LOCAL_RUNTIME
IMPORTED_RESULT
SYNTHETIC_FIXTURE
```

Supported acquisition routes:

```text
LOCAL_GENERATED
IMPORTED_FILE
IMPORTED_TEXT
PROVIDER_RECEIPT_REFERENCE
SYNTHETIC_FIXTURE
```

Supported declared execution environments:

```text
BROWSER_LOCAL
NODE_LOCAL
EXTERNAL_PROVIDER
DECLARED_FIXTURE
```

The registry performs no Reader execution and no provider call.

### 2. Reader result provenance receipt

Schema:

```text
td613.aperture.reader-result-provenance/v0.1
```

The receipt binds:

- registry digest;
- adapter ID, class, and version;
- Reader ID, class, version, and digest;
- Case Map and Route Memory digests;
- Reader-input digest;
- Reader-result digest;
- result schema, reference, and observation state;
- acquisition route and receipt reference;
- declared execution environment and executor class;
- execution and provider receipt references;
- fixture status;
- source status, missingness, alternatives, and open questions.

The receipt carries no raw Reader input and no raw Reader result.

A result becomes:

```text
PROVENANCE_BOUND
```

when the registered adapter relation is valid and every required provider receipt is present.

A result becomes:

```text
PROVENANCE_INCOMPLETE
```

when the adapter contract requires a provider receipt but that receipt is unavailable. The incomplete result may remain sealed for review. Missing provenance is preserved rather than erased or upgraded.

### 3. Provenance replay receipt

Schema:

```text
td613.aperture.reader-result-provenance-replay/v0.1
```

Replay verifies:

- provenance digest;
- registry digest;
- adapter-to-Reader relation.

Replay does not restore raw input, restore raw output, rerun the Reader, call a provider, mutate storage, or authorize transport or release.

## Non-equivalences

```text
registered adapter ≠ trusted Reader
registered adapter ≠ Reader execution
acquisition route ≠ execution environment
provider receipt ≠ truth
provider receipt ≠ authorship proof
provenance bound ≠ result correct
provenance incomplete ≠ result false
fixture status ≠ external observation
replay verified ≠ Reader rerun
Reader disagreement ≠ identity attribution
Reader disagreement ≠ surveillance probability
receipt ≠ command
```

## Authority boundary

Every registry, provenance, and replay object carries or inherits the following posture:

```text
reader_execution_performed_by_registry = false
provider_call_performed_by_registry = false
network_called_by_registry = false
storage_mutated_by_registry = false
transport_authorized = false
release_authorized = false
identity_inference_authorized = false
authorship_attribution_authorized = false
surveillance_probability_authorized = false
prediction_authorized = false
automatic_hold = false
recommendation_not_command = true
```

## Validation fixtures

The first validation bank covers:

1. a verified local deterministic adapter and result;
2. an imported external result with a required provider receipt;
3. an imported external result missing its required receipt, preserved as `PROVENANCE_INCOMPLETE`;
4. digest tampering;
5. replay verification without Reader re-execution;
6. replay hold after registry mutation;
7. rejected Reader-class mismatch;
8. rejected acquisition-route mismatch;
9. schema-level enforcement of all non-authority fields.

## Validation and aftercare evidence

Reader provenance PR:

```text
#290
```

Validation head:

```text
f70757517d8effecad616ecbffe2b21d3bebfa89
```

Merge commit:

```text
b0b600a07c8343311cdde50c2f250881e7f6091c
```

Validation runs:

```text
Ash Keep Choir Test = 29370348510
Ash Keep Production Closure = 29370348382
Dome-World Phase IV = 29370348470
TCP Smoke = 29370348297
Test and deploy static app = 29370348414
```

Post-merge deployed Ash aftercare:

```text
observer run = 29370525244
evidence artifact = 8325870766
artifact SHA-256 = sha256:8ede7d290498fa48488d2ab5193dbbbc7c09c9779cb26d3dc832775c830c4b90
```

The deployed aftercare establishes that the provenance spine did not disturb Ash Keep’s production posture. It does not production-demonstrate the registry, execute any Reader, contact any provider, or validate the truth of any result.

## Known hardening debt

The v0.1 compiler validates adapter acquisition routes and execution environments case-insensitively, while the first implementation stores the caller-provided enum casing. Canonical uppercase fixtures pass and seal consistently. A future hardening packet must normalize those stored enum arrays before sealing and add mixed-case permutation tests.

This debt blocks no current canonical fixture. It must be closed before a disagreement receipt treats registry digests from independently authored adapter declarations as semantically interchangeable.

## Current frontier

The next admissible Choir packet may build a Reader-by-Reader disagreement ledger only after every compared result carries a verified provenance receipt.

The disagreement layer must remain componentwise and must preserve:

- Reader-specific observation states;
- missing and incomplete provenance;
- matched Case Map, Route Memory, input, and result-schema references;
- alternative explanations;
- mixed-case adapter normalization as a preflight invariant;
- no universal privacy score;
- no identity, authorship, surveillance, release, hold, transport, provider-call, or production authority.

𝌋‌ U+10D613

Marked ⟐
