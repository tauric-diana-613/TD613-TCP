# Pedagogue Witness Arrived With the Defendant — Precedence Witness Pre-Admission Protocol Custody Hostile Assay v0.1

Status: **PREREGISTERED / PRE-EXECUTION / ATTACK-ONLY / NOT PROMOTED**

Schema: `td613.pedagogue.precedence-witness-pre-admission-protocol-custody-hostile/v0.1`

Candidate descendant:

```text
C12_PRECEDENCE_WITNESS_PRE_ADMISSION_PROTOCOL_CUSTODY
```

Assay name:

```text
Witness Arrived With the Defendant
```

Research surface: PR `#677`

Parent scientific receipt:

```text
C11 Self-Inking Stamp receipt
8961b7aa754a3c20841dfa51cc08ea2523e45f72
```

## 0. Why this chamber is earned

C11 separated a precedence bridge from the witness-ledger records said to support it. That defeated C10's self-authored witness chain.

But the C11 evaluator accepts one invocation containing all three surfaces:

```text
membership_records
precedence_bridges
witness_ledger
```

A caller can therefore construct a bridge and a materially matching witness ledger together. C11 tests whether witness records are present and correctly bound; it does not test whether those records were admitted into a witness state before the bridge submission existed.

This assay attacks that distinction only.

```text
separate argument != pre-admitted custody
ledger record presence != prior protocol admission
co-submitted witness != pre-admitted witness
object separation != protocol-order separation
material consistency != admission chronology
```

## 1. Claim ceiling

C12 is a **bounded synthetic protocol-order candidate**.

It may establish only:

> Inside this evaluator, a bridge can consume witness authority only from a witness state admitted in an earlier protocol phase, rather than from witness records co-submitted with that bridge.

It does **not** establish:

```text
external chronological truth
honest witness origin
institutional independence
real-world timestamp authority
cryptographic authentication
causal precedence
physical time
human authorship
source identity
external trust root
```

An earlier protocol phase can still contain fabricated material. Therefore:

```text
pre-admitted in protocol != externally independent
protocol order != source honesty
```

Those remain possible later attack surfaces.

## 2. Frozen candidate grammar

The candidate must expose two distinct phases.

### Phase A — witness admission

A bounded admission operation consumes witness records and returns a sealed witness-state capability.

Required properties:

```text
admission happens before bridge submission in evaluator-controlled protocol order
state is immutable after admission
record material is bound into the state
caller-declared epoch strings do not create pre-admission authority
plain-object cloning does not recreate admission authority
serialization does not recreate admission authority
```

### Phase B — bridge submission/evaluation

A bridge may cite witness IDs/material already carried by a valid Phase-A state.

A raw witness ledger supplied beside the bridge is not a substitute for the earlier admitted state.

Required bounded dispositions:

```text
ADMIT_PRE_ADMITTED_PRECEDENCE_WITNESS
REFUSE_CO_SUBMITTED_PRECEDENCE_WITNESS
REFUSE_UNRECOGNIZED_PRE_ADMISSION_STATE
REFUSE_LATE_PRECEDENCE_WITNESS_ADMISSION
```

The exact implementation may add narrower refusal statuses, but may not silently weaken these preregistered distinctions.

## 3. Strong falsifier — WD01

Construct two cases with materially equivalent precedence claim and witness records.

### Case A · witness already in the courthouse

```text
1. witness records are admitted through Phase A
2. evaluator returns a sealed admitted witness state
3. only afterward is the precedence bridge submitted
4. bridge references the already-admitted witness material
```

Expected C12 posture:

```text
ADMIT_PRE_ADMITTED_PRECEDENCE_WITNESS
```

### Case B · witness arrived with the defendant

```text
1. precedence bridge exists
2. otherwise materially valid witness records are supplied together with that bridge
3. no earlier evaluator-issued admitted witness state exists
```

Frozen inherited C11 expectation:

```text
C11 admits Case B when the co-submitted witness ledger is present, materially bound, non-revoked, and otherwise valid.
```

Frozen C12 expectation:

```text
REFUSE_CO_SUBMITTED_PRECEDENCE_WITNESS
```

Strong falsifier success requires both facts in the same run:

```text
C11_co_submitted_bridge_admitted = true
C12_co_submitted_bridge_admitted = false
```

while Case A remains admitted.

If C12 cannot preserve Case A while refusing Case B, the candidate is falsified.

## 4. Twelve frozen hostile rooms

### WD01 · Witness Arrived With the Defendant
Strong falsifier above.

### WD02 · Counterfeit Admission Card
Create a plain object with the same visible fields as a legitimate admitted witness state but without a real Phase-A admission event.

Expected:

```text
REFUSE_UNRECOGNIZED_PRE_ADMISSION_STATE
```

Visible snapshot equality must not create protocol provenance.

### WD03 · Admission Card Mutation
Attempt to mutate a legitimate admitted witness state after Phase A.

Expected: mutation refused; state remains unchanged and sealed.

### WD04 · Bridge-ID Rename
Rename only `bridge_id` while preserving material bridge content and the same legitimate admitted witness state.

Expected: same scientific disposition.

```text
bridge_id != pre-admission authority
```

### WD05 · Membership-ID Rename
Rename only membership record identifiers while preserving material revision content.

Expected: same disposition/current semantic state.

```text
membership_id != pre-admission authority
```

### WD06 · Witness-ID Renaming With Preserved Admitted Material
Construct an independently admitted equivalent witness state using consistently renamed witness IDs but identical material witness bindings.

Expected: the scientific result is invariant to lexical witness-ID choice.

```text
witness_id != pre-admission authority
```

### WD07 · Input Reversal
Reverse membership and bridge list order where applicable.

Expected: no authority from serialization order.

### WD08 · Late Admission
Register/submit the bridge first, then attempt to admit supporting witness records afterward for that already-submitted bridge.

Expected:

```text
REFUSE_LATE_PRECEDENCE_WITNESS_ADMISSION
```

Later witness admission may not travel backward and authorize an already submitted bridge inside the bounded protocol.

### WD09 · Pre-Admitted but Misbound Witness
Witness state is genuinely pre-admitted, but its records bind the wrong revision endpoint(s).

Expected: inherited C11 material-binding refusal remains intact. Pre-admission does not cure misbinding.

### WD10 · Opposite Pre-Admitted Bridges
Two opposite precedence directions each possess otherwise valid pre-admitted witness support.

Expected: inherited cycle/conflict refusal remains:

```text
ABSTAIN_CONFLICTING_OR_CYCLIC_REVISION_PRECEDENCE
```

Earlier admission does not manufacture a winner.

### WD11 · Serialized Snapshot Replay
Serialize/clone the visible fields of a legitimate admitted witness state and present the reconstruction as though it were the original admission capability.

Expected:

```text
REFUSE_UNRECOGNIZED_PRE_ADMISSION_STATE
```

This room tests protocol capability provenance only; it is not a cryptographic claim.

### WD12 · Null / No-Bridge Control
A valid pre-admitted witness state with no precedence bridge must not generate a bridge, membership change, or synthetic consequence by itself.

Expected: no invented precedence and no scalar authority.

## 5. Frozen defeat conditions

C12 is defeated in this bounded family if any of the following occurs:

1. co-submitted witness material is admitted without a prior protocol admission state;
2. a counterfeit visible clone is treated as a valid prior admission state;
3. bridge ID, membership ID, witness ID, or input ordering acquires independent authority;
4. late witness admission retroactively authorizes an already submitted bridge;
5. pre-admission overrides inherited material misbinding refusal;
6. opposite valid precedence directions are forced into a unique winner;
7. a witness state alone invents precedence;
8. the candidate requires scalar confidence/trust aggregation;
9. authority membranes widen.

## 6. Frozen candidate verdicts

Allowed bounded dispositions:

```text
PRECEDENCE_WITNESS_PRE_ADMISSION_PROTOCOL_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_WITNESS_ARRIVED_WITH_DEFENDANT
PRECEDENCE_WITNESS_PRE_ADMISSION_PROTOCOL_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_WITNESS_ARRIVED_WITH_DEFENDANT
```

Presumption of survival:

```text
false
```

CI green may accompany either scientific verdict.

## 7. Authority membrane

```text
candidate_status = ATTACK_ONLY_NOT_PROMOTED
promotion_authority = false
product_mutation = false
shared_pedagogue_engine_mutation = false
browser_execution = false
workflow_mutation = false
merge_performed = false
deployment_performed = false
release_authority = false
vercel_release_requires_issue_405_and_new_explicit_operator_gesture = true

H2 = HELD_NOT_TESTED_HERE
H3 = HELD_NOT_TESTED_HERE
intersections = HELD_NOT_OPENED_HERE
APERTURE_V32_REPLAY_STABILITY = HELD_NOT_YET_WITNESSED
```

## 8. Preregistered scientific question

Not:

> Is this witness true?

Not:

> Is this witness independent in the world?

But:

> Did this bounded protocol require the witness state to be admitted before the bridge submission, or can a bridge still bring its own supporting witness book through the door in the same transaction?

That is the whole chamber. No temporal perfume beyond it.
