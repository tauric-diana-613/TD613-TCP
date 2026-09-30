# Pedagogue Self-Inking Stamp — Revision Precedence Witness Ledger Custody Hostile Assay v0.1

Status: **PREREGISTERED / PRE-EXECUTION / ATTACK-ONLY / HUMAN-GATED**

Schema: `td613.pedagogue.revision-precedence-witness-ledger-custody-hostile-assay/v0.1`

Research surface: PR `#677`

## 0. Inherited result under attack

Notary Ribbon established, in its bounded preregistered family:

```text
MEMBERSHIP_EPOCH_BUNDLE_C9_FALSIFIED_AS_BRIDGE_AWARE_SUFFICIENT_FORM
REVISION_PRECEDENCE_BRIDGE_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_NOTARY_RIBBON
```

C10 correctly rejects a bridge whose supplied replay digest does not match its supplied witness chain. But the bridge itself currently supplies the entire witness chain and every input needed to recompute that digest.

Candidate under attack:

```text
C10_REVISION_PRECEDENCE_BRIDGE_CUSTODY
```

Candidate descendant:

```text
C11_REVISION_PRECEDENCE_WITNESS_LEDGER_CUSTODY
Display name: Revision Precedence Witness Ledger Custody
Assay name: Self-Inking Stamp
status = ATTACK_ONLY_NOT_PROMOTED
presumption_of_survival = false
```

## 1. Preregistered insufficiency

A self-consistent bridge can fabricate plausible witness-token strings, set `replayable=true`, recompute C10's public deterministic digest, and satisfy C10 without those witness tokens being independently held anywhere.

The attack freezes C10's material revision identity, bundle semantics, cycle refusal, and precedence-resolution rule. It varies only whether the bridge's claimed witness chain is independently present and materially bound in a separate witness ledger.

Core distinctions:

```text
checksum consistency != independent witness custody
self-consistency != provenance
witness-token string != witnessed event
replayable label != replay source
bridge describes a witness chain != bridge owns an independent witness chain
```

## 2. Candidate C11 witness ledger

The bridge remains a C10-compatible object. Its `witness_chain[]` contains witness IDs.

A separate immutable witness ledger contains records with at least:

```text
witness_id
witness_kind
semantic_event_key
epoch
from_revision_fingerprint | null
to_revision_fingerprint | null
observed_revision_fingerprint | null
revoked
```

Allowed bounded witness kinds:

```text
REVISION_OBSERVED
PRECEDENCE_BIND_OBSERVED
```

For a bridge `A → B`, an admissible witness ledger chain must contain, in the bridge-declared witness-ID order:

```text
1. REVISION_OBSERVED materially bound to A
2. REVISION_OBSERVED materially bound to B
3. PRECEDENCE_BIND_OBSERVED materially bound to A → B
```

Every record must match the bridge's `semantic_event_key` and `epoch`, and every referenced witness ID must exist exactly once and be unrevoked.

The bridge's C10 replay digest is still checked. C11 adds independent ledger custody; it does not promote that digest into cryptographic authenticity.

## 3. Candidate C11 rule

A C10 bridge may contribute precedence only when both layers hold:

```text
C10 bridge-integrity checks pass
AND
all bridge witness IDs resolve to an independently supplied admissible witness-ledger chain
```

Candidate bridge statuses:

```text
ADMIT_LEDGER_WITNESSED_REVISION_PRECEDENCE_BRIDGE
REFUSE_SELF_ATTESTED_REVISION_PRECEDENCE_BRIDGE
REFUSE_MISSING_PRECEDENCE_WITNESS_RECORD
REFUSE_MISBOUND_PRECEDENCE_WITNESS_RECORD
REFUSE_REVOKED_PRECEDENCE_WITNESS_RECORD
REFUSE_DUPLICATE_PRECEDENCE_WITNESS_ID
```

A bridge cannot create, rewrite, or implicitly hydrate witness-ledger records.

## 4. Strong falsifier

### SI01 · The Notary Carves Her Own Stamp

Use the same contradictory BLUE same-epoch membership bundle and the same visible precedence claim:

```text
WITHDRAW → ADMIT
```

Construct Bridge A with witness IDs:

```text
W_FROM
W_TO
W_BIND
```

and provide an external ledger containing three matching, unrevoked, materially bound witness records.

Construct Bridge B with the same visible precedence payload and a different plausible witness chain:

```text
FAKE_FROM
FAKE_TO
FAKE_BIND
```

Bridge B computes a fully matching C10 replay digest over its fabricated nonempty chain. No corresponding external witness-ledger records exist.

Required inherited C10 witness:

```text
Bridge A = admitted by C10
Bridge B = admitted by C10
```

Required C11 result:

```text
Bridge A = ADMIT_LEDGER_WITNESSED_REVISION_PRECEDENCE_BRIDGE
Bridge B = REFUSE_SELF_ATTESTED_REVISION_PRECEDENCE_BRIDGE
current_active = true
```

If C10 does not admit the self-consistent fabricated bridge, the claimed C10 self-attestation insufficiency is not established in this run.

If C11 admits Bridge B, C11 is defeated.

## 5. Hostile family

### SI01 · The Notary Carves Her Own Stamp
Self-consistent fabricated witness chain versus independently held witness chain.

### SI02 · Rename the Ribbon
Change only `bridge_id`. C11 witness-ledger admission and current state must remain invariant.

### SI03 · Rename the Membership Records
Change only membership IDs. Material revision fingerprints, witness-ledger bindings, and result must remain invariant.

### SI04 · Reverse the Filing Order
Reverse membership-record, bridge, and witness-ledger input order. Result must remain invariant.

### SI05 · Missing Ledger Page
Delete one witness record named by an otherwise C10-valid bridge.

Expected:

```text
REFUSE_MISSING_PRECEDENCE_WITNESS_RECORD
```

### SI06 · Wrong Stamp on Right Page
Keep all witness IDs present but bind one `REVISION_OBSERVED` record to the wrong revision fingerprint.

Expected:

```text
REFUSE_MISBOUND_PRECEDENCE_WITNESS_RECORD
```

### SI07 · Revoked Witness
A required witness-ledger record is present but revoked.

Expected:

```text
REFUSE_REVOKED_PRECEDENCE_WITNESS_RECORD
```

### SI08 · Duplicate Witness ID
Two ledger records claim the same witness ID.

Expected:

```text
REFUSE_DUPLICATE_PRECEDENCE_WITNESS_ID
```

No lexical winner.

### SI09 · Alternative Good and Fake Chains
Two bridges assert the same visible precedence. One has a valid independent witness chain; one is self-attested. Rejecting the fake must not erase the independently supported bridge or its result.

### SI10 · Inherited Cycle Control
Two opposite precedence bridges, each independently ledger-witnessed, must retain C10's:

```text
ABSTAIN_CONFLICTING_OR_CYCLIC_REVISION_PRECEDENCE
```

Independent witnessing does not cure contradictory precedence.

### SI11 · Witness-Ledger Compaction
A compact list of witness IDs is not custody-equivalent to the full materially bound witness records.

```text
witness-ID equality != witness-ledger provenance equality
```

### SI12 · Sealed Witness Mutation
A sealed witness-ledger record is immutable.

Expected:

```text
SEALED_PRECEDENCE_WITNESS_RECORD_IMMUTABLE
```

## 6. Candidate verdicts

Possible inherited verdicts:

```text
REVISION_PRECEDENCE_BRIDGE_C10_FALSIFIED_AS_INDEPENDENT_WITNESS_CUSTODY_SUFFICIENT_FORM
C10_SELF_ATTESTATION_INSUFFICIENCY_NOT_ESTABLISHED_IN_THIS_RUN
```

Possible C11 verdicts:

```text
REVISION_PRECEDENCE_WITNESS_LEDGER_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_SELF_INKING_STAMP
REVISION_PRECEDENCE_WITNESS_LEDGER_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_SELF_INKING_STAMP
```

CI green is not the scientific verdict. Candidate survival and falsification are both legitimate outcomes; tests fail only for broken assay machinery or constitutional regression.

## 7. Defeat conditions

C11 is defeated by any of:

```text
SELF_ATTESTED_BRIDGE_ADMITTED_WITHOUT_LEDGER
MISSING_WITNESS_RECORD_ADMITTED
MISBOUND_WITNESS_RECORD_ADMITTED
REVOKED_WITNESS_RECORD_RETAINS_AUTHORITY
DUPLICATE_WITNESS_ID_ARBITRATED_LEXICALLY
BRIDGE_ID_RENAME_CHANGES_AUTHORITY
MEMBERSHIP_ID_RENAME_CHANGES_AUTHORITY
INPUT_ORDER_SELECTS_WITNESS_AUTHORITY
VALID_CHAIN_ERASED_BY_FAKE_ALTERNATIVE
INHERITED_CYCLE_REFUSAL_LOST
WITNESS_LEDGER_COMPACTION_OVERCLAIMS_PROVENANCE
SEALED_PRECEDENCE_WITNESS_RECORD_MUTATED
```

## 8. Frozen scope and holds

```text
C10 material revision fingerprint = FIXED
C10 same-epoch bridge resolution = FIXED
C10 cycle refusal = FIXED
bridge replay digest = RETAINED_AS_BOUNDED_INTEGRITY_CHECK
external witness ledger = NEW ATTACK SURFACE
membership_id authority = FORBIDDEN
bridge_id authority = FORBIDDEN
witness_id lexical authority = FORBIDDEN
sampling = FORBIDDEN
scalar aggregation = FORBIDDEN
product mutation = FORBIDDEN
shared Pedagogue engine mutation = FORBIDDEN
workflow mutation = FORBIDDEN
browser execution = FORBIDDEN
merge = FORBIDDEN
deployment = FORBIDDEN
release = FORBIDDEN
```

```text
H2 = HELD_NOT_TESTED_HERE
H3 = HELD_NOT_TESTED_HERE
M×D = HELD
M×P = HELD
D×P = HELD
M×D×P = HELD
APERTURE_V32_REPLAY_STABILITY = HELD_NOT_YET_WITNESSED
```

## 9. Claim ceiling

This assay does not establish:

```text
cryptographic authenticity
real-world witness identity or testimony reliability
external attestation infrastructure
distributed consensus
physical or causal time order
serializability theorem
event-sourcing completeness
temporal-database completeness
provenance algebra
proof theory
category / lattice / sheaf structure
connection / curvature / holonomy
quantum identity
autonomous scientific authority
```

The witness ledger is a bounded synthetic custody fixture, not a real-world trust root.

## 10. Authority membrane

```text
research_target_admitted_by_operator = true
major_research_decisions_self_authorized_in_pr677_lane = true
product_mutation = false
shared_pedagogue_engine_mutation = false
workflow_mutation = false
browser_execution = false
merge_performed = false
deployment_performed = false
deployment_authority = false
release_authority = false
vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true
promotion_authority = false
```

𝌋 A notary may carry a ribbon. She may not carve the witness, stamp the witness, file the witness, and then cite herself as the independent observer. ⟐
