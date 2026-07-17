# Ash Keep Independent Provenance Adapters

𝌋‌ U+10D613

## Version

`v0.1`

## Status

`CLOSED / IMPLEMENTED_VALIDATION_GATED / EVIDENCE_BOUNDED / AWAITING_POST_MERGE_STRATEGIC_SEAL`

## Validation spine

```text
PR = 372
validated implementation commit = 33c8f881095aa3c601e35d4c45793f072695dfbb
Ash Independent Provenance Validation = SUCCESS / run 29546756631
TCP Smoke = SUCCESS / run 29546756592
Test and deploy static app = SUCCESS / run 29546756646
Ash Keep Production Closure = SUCCESS / run 29546756596
new serverless function = false
active serverless functions = 11
reserved function capacity = 1
production demonstration = NOT_CLAIMED
```

## Purpose

Stretch 10 creates independently verifiable, source-local provenance adapters without collapsing different evidence classes into one identity, corpus, authority graph, trust score, or universal join key.

The instrument asks:

> Does this exact source-local reference satisfy the verification contract of its declared evidence class and digest domain, while preserving every inference the adapter lacks authority to make?

## Contracts

```text
td613.ash.independent-provenance-adapter-registry/v0.1
td613.ash.independent-provenance-verification/v0.1
td613.ash.independent-provenance-replay/v0.1
```

Each evidence class also carries its own adapter schema ID and digest domain.

## Evidence classes

| Evidence class | Adapter schema | Digest domain | Source-local prefix |
|---|---|---|---|
| `ARTIFACT_DIGEST` | `td613.ash.provenance.artifact-digest-adapter/v0.1` | `TD613:ASH:PROVENANCE:ARTIFACT-DIGEST:v1` | `artifact:` |
| `MANIFEST_DIGEST` | `td613.ash.provenance.manifest-digest-adapter/v0.1` | `TD613:ASH:PROVENANCE:MANIFEST-DIGEST:v1` | `manifest:` |
| `RECEIPT_DIGEST` | `td613.ash.provenance.receipt-digest-adapter/v0.1` | `TD613:ASH:PROVENANCE:RECEIPT-DIGEST:v1` | `receipt:` |
| `SIGNATURE_LANE_STATEMENT` | `td613.ash.provenance.signature-lane-adapter/v0.1` | `TD613:ASH:PROVENANCE:SIGNATURE-LANE:v1` | `signature-lane:` |
| `REPOSITORY_REFERENCE` | `td613.ash.provenance.repository-reference-adapter/v0.1` | `TD613:ASH:PROVENANCE:REPOSITORY-REFERENCE:v1` | `repository:` |
| `PROVIDER_RESPONSE_REFERENCE` | `td613.ash.provenance.provider-response-adapter/v0.1` | `TD613:ASH:PROVENANCE:PROVIDER-RESPONSE:v1` | `provider:` |
| `CUSTODY_ROOT_REFERENCE` | `td613.ash.provenance.custody-root-adapter/v0.1` | `TD613:ASH:PROVENANCE:CUSTODY-ROOT:v1` | `custody-root:` |
| `CASE_RELATION_REFERENCE` | `td613.ash.provenance.case-relation-adapter/v0.1` | `TD613:ASH:PROVENANCE:CASE-RELATION:v1` | `case-relation:` |
| `OPERATOR_DECLARATION` | `td613.ash.provenance.operator-declaration-adapter/v0.1` | `TD613:ASH:PROVENANCE:OPERATOR-DECLARATION:v1` | `operator-declaration:` |
| `EXTERNAL_TIME_CLAIM` | `td613.ash.provenance.external-time-claim-adapter/v0.1` | `TD613:ASH:PROVENANCE:EXTERNAL-TIME-CLAIM:v1` | `external-time-claim:` |
| `RECIPIENT_DESTINATION_DECLARATION` | `td613.ash.provenance.recipient-destination-adapter/v0.1` | `TD613:ASH:PROVENANCE:RECIPIENT-DESTINATION:v1` | `recipient-destination:` |

The domains are pairwise distinct. An adapter cannot verify a receipt sealed under another class's domain.

## Registry

The registry seals the exact adapter inventory and rejects duplicate adapter IDs, schema IDs, or digest domains. It carries no raw body and grants no inference or transport authority.

## Verification receipt

A verification receipt binds:

- registry digest;
- adapter ID;
- evidence class;
- adapter schema;
- adapter-specific digest domain;
- source ID and expected source ID;
- source-local namespace and reference;
- expected and observed digests;
- current, stale, revoked, or unknown source-local posture;
- collision posture;
- exact operator verification gesture;
- missingness and operator notes.

The receipt is sealed inside the adapter-specific digest domain. A verified artifact receipt and a verified provider-reference receipt therefore remain cryptographically non-substitutable even when their payload-shaped fields look similar.

## Hold precedence

```text
cancelled operator action             → CANCELLED_HOLD
replay beyond declared jurisdiction   → REPLAY_HOLD
digest mismatch or malformed digest   → TAMPER_HOLD
wrong adapter digest domain           → WRONG_DOMAIN_HOLD
unsupported adapter or evidence class → UNSUPPORTED_DOMAIN_HOLD
source identifier or syntax mismatch  → SOURCE_MISMATCH_HOLD
revoked source-local posture          → REVOKED_REFERENCE_HOLD
stale source-local posture            → STALE_REFERENCE_HOLD
unresolved collision                  → COLLISION_HOLD
missing required reference            → MISSING_REFERENCE_HOLD
fully matched bounded evidence        → INDEPENDENT_PROVENANCE_VERIFIED
```

## Replay

Replay verifies:

- registry digest;
- source verification digest;
- adapter-to-evidence-class relation;
- exact replay jurisdiction.

Replay restores no raw body, calls no provider, reruns no Reader, contacts no destination, and creates no universal join key.

## Non-equivalences

```text
verified digest ≠ identity
verified signature lane ≠ authorship
repository provenance ≠ permission
provider reference ≠ truth
custody reference ≠ authenticity
relation reference ≠ intent
operator declaration ≠ external fact
external-time claim ≠ trusted external time
recipient declaration ≠ recipient behavior
adapter agreement ≠ universal trust score
multiple references ≠ universal join key
provenance verification ≠ destination transport
receipt ≠ command
```

## Function covenant

Stretch 10 adds no root `api/` file. The serverless surface remains:

```text
11 active + 1 reserved
```

One strategic Vercel deployment is authorized after the exact green closure packet merges. Deployment cannot promote this validation-gated instrument into production-demonstrated maturity or grant destination, recipient, transport, release, suppression, or Cinder authority.

Marked ⟐
