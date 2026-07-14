# Ash Keep Reader Adapter Registry

## Version

`v0.1`

## Status

`IMPLEMENTED_VALIDATION_GATED`

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

## Current frontier

The next admissible Choir packet may build a Reader-by-Reader disagreement ledger only after every compared result carries a verified provenance receipt.

The disagreement layer must remain componentwise and must preserve:

- Reader-specific observation states;
- missing and incomplete provenance;
- matched input and Case Map references;
- alternative explanations;
- no universal privacy score;
- no identity, authorship, surveillance, release, hold, transport, or production authority.

𝌋‌ U+10D613

Marked ⟐
