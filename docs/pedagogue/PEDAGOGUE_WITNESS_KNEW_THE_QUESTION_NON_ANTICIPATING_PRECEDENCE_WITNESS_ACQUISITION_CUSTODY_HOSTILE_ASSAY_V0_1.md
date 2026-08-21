# Pedagogue Witness Knew the Question — Non-Anticipating Precedence Witness Acquisition Custody Hostile Assay v0.1

Status: **PREREGISTERED / PRE-EXECUTION / ATTACK-ONLY / NOT PROMOTED**

Schema: `td613.pedagogue.precedence-witness-non-anticipating-acquisition-custody-hostile/v0.1`

Candidate descendant:

```text
C13_PRECEDENCE_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY
```

Assay name:

```text
Witness Knew the Question
```

Research surface: PR `#677`

Parent scientific receipt:

```text
C12 Witness Arrived With the Defendant receipt
6b9326ac8634451b708bedd57838509a6b1d69de
```

## 0. Why this chamber is earned

C12 established a bounded protocol-order distinction:

```text
pre-admitted witness state before bridge submission
!=
co-submitted witness ledger
```

But C12 does not represent the moment when the bridge hypothesis/proposal becomes known. A hostile caller can decide the desired bridge, fabricate witness material tailored to that bridge, admit the witness one protocol tick before bridge submission, and satisfy C12.

Therefore:

```text
admitted before bridge submission != acquired before bridge proposal
pre-admitted != non-anticipating acquisition
protocol-before != epistemically-before
admission event != evidence-acquisition event
just-in-time admission != acquisition independence
```

This chamber attacks only that missing relation.

## 1. Claim ceiling

C13 is a **bounded synthetic non-anticipation protocol candidate**.

It may establish only:

> Inside this evaluator, witness material used to support a specific precedence bridge was registered in a sealed acquisition episode before that bridge proposal became available to the protocol.

It does **not** establish:

```text
real-world source honesty
external provenance
external chronological truth
unbiased sampling
causal independence
institutional independence
human authorship
cryptographic authentication
physical acquisition time
source identity
truth of the witness content
```

Even a witness acquired before an internal proposal may have been fabricated for reasons outside the protocol.

Therefore:

```text
pre-proposal acquisition in protocol != honest external source
non-anticipation relative to this proposal != global independence
protocol acquisition order != physical chronology
```

## 2. Frozen three-stage protocol

The candidate must expose evaluator-controlled protocol capabilities for three conceptually distinct stages.

### Stage A — acquisition episode

Witness material is registered into a sealed acquisition episode.

Required properties:

```text
acquisition capability is evaluator-issued
visible clone does not recreate acquisition authority
serialization does not recreate acquisition authority
mutation after closure is refused
caller-declared time/epoch strings do not create authority
```

### Stage B — bridge proposal

The specific precedence bridge question/claim becomes available to the evaluator through a sealed proposal capability.

The proposal contains the material bridge claim to be evaluated; proposal IDs are labels only.

### Stage C — admission/submission/evaluation

The evaluator may translate a valid Stage-A acquisition episode into the inherited C12 witness-admission path and may submit the Stage-B bridge only after proposal creation.

For C13 authority, the required order is:

```text
acquisition_episode_closed
< bridge_proposal_created
< inherited_bridge_submission
```

C12 may still admit a witness acquired after the proposal but before submission. C13 must refuse that narrower just-in-time case.

## 3. Frozen dispositions

Required bounded statuses:

```text
ADMIT_NON_ANTICIPATING_PRECEDENCE_WITNESS
REFUSE_POST_PROPOSAL_PRECEDENCE_WITNESS
REFUSE_UNRECOGNIZED_ACQUISITION_EPISODE
REFUSE_UNRECOGNIZED_BRIDGE_PROPOSAL
```

Inherited C11/C12 material-binding, revocation, cycle, and no-bridge refusals must remain intact.

## 4. Strong falsifier — KQ01 · Witness Knew the Question

Use the same material witness ledger and precedence bridge in two protocol orderings.

### Case A · witness acquired before the question

```text
1. Stage A closes witness acquisition episode
2. Stage B creates bridge proposal
3. Stage C evaluates proposal using the earlier acquisition episode
```

Expected C13 posture:

```text
ADMIT_NON_ANTICIPATING_PRECEDENCE_WITNESS
```

### Case B · witness knew the question

```text
1. Stage B creates bridge proposal
2. Stage A then registers otherwise materially valid witness records tailored to that known proposal
3. inherited C12 witness admission still occurs before bridge submission
4. bridge is submitted/evaluated
```

Frozen inherited C12 expectation:

```text
C12 admits because witness admission precedes bridge submission.
```

Frozen C13 expectation:

```text
REFUSE_POST_PROPOSAL_PRECEDENCE_WITNESS
```

Strong falsifier success requires in the same run:

```text
C12_post_proposal_pre_submission_witness_admitted = true
C13_post_proposal_witness_admitted = false
C13_pre_proposal_witness_admitted = true
```

If C13 cannot preserve Case A while refusing Case B, the candidate is falsified.

## 5. Twelve frozen hostile rooms

### KQ01 · Witness Knew the Question
Strong matched-order falsifier above.

### KQ02 · Counterfeit Acquisition Episode
Clone all visible fields of a legitimate acquisition episode without an evaluator-issued capability.

Expected:

```text
REFUSE_UNRECOGNIZED_ACQUISITION_EPISODE
```

### KQ03 · Acquisition Episode Mutation
Attempt to mutate a legitimate sealed acquisition episode after closure.

Expected: immutable refusal; no changed witness material.

### KQ04 · Proposal-ID Rename
Change only the proposal label/ID while preserving bridge and membership material and acquisition order.

Expected: same scientific disposition.

```text
proposal_id != authority
```

### KQ05 · Bridge-ID Rename
Rename only bridge ID while preserving material bridge endpoints and witness bindings.

Expected: same disposition/current semantic state.

### KQ06 · Witness-ID Rename With Preserved Material
Construct an independently acquired pre-proposal episode with consistently renamed witness IDs but identical material bindings, and a correspondingly renamed bridge witness list/digest.

Expected: same scientific disposition.

```text
witness_id != acquisition authority
```

### KQ07 · Input Reversal
Reverse membership/bridge list ordering where applicable.

Expected: no authority from serialization order.

### KQ08 · Counterfeit / Serialized Proposal Capability
Clone or serialize/replay a legitimate bridge proposal and present the reconstruction as though it were evaluator-issued.

Expected:

```text
REFUSE_UNRECOGNIZED_BRIDGE_PROPOSAL
```

### KQ09 · Pre-Proposal but Misbound Witness
The acquisition episode genuinely precedes proposal, but witness records bind the wrong material revision endpoint(s).

Expected: inherited material misbinding refusal remains. Early acquisition cannot cure bad evidence.

### KQ10 · Opposite Pre-Proposal Supported Bridges
Opposite precedence directions each have valid acquisition episodes predating their proposals.

Expected:

```text
ABSTAIN_CONFLICTING_OR_CYCLIC_REVISION_PRECEDENCE
```

Non-anticipation does not manufacture a winner.

### KQ11 · Pre-Proposal Revoked Witness
Witness acquisition precedes proposal but a required witness record is revoked.

Expected: inherited revocation refusal remains.

### KQ12 · Null / No-Bridge Control
A valid pre-proposal acquisition episode with a proposal containing no precedence bridge must not invent precedence or membership consequence.

Expected: no synthetic bridge authority and no scalar aggregation.

## 6. Frozen defeat conditions

C13 is defeated in this bounded family if any of the following occurs:

1. post-proposal witness acquisition is admitted as non-anticipating support;
2. a counterfeit acquisition episode is accepted;
3. a counterfeit proposal capability is accepted;
4. mutation after acquisition closure changes authority;
5. proposal ID, bridge ID, witness ID, membership ID, or input ordering gains independent authority;
6. pre-proposal status overrides inherited material misbinding or revocation refusal;
7. opposite valid precedence directions are forced into a unique winner;
8. an acquisition episode/proposal with no bridge invents precedence;
9. scalar trust/confidence aggregation becomes required;
10. authority membranes widen.

## 7. Frozen candidate verdicts

Allowed bounded dispositions:

```text
PRECEDENCE_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_WITNESS_KNEW_THE_QUESTION
PRECEDENCE_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY_CANDIDATE_FALSIFIED_IN_BOUNDED_WITNESS_KNEW_THE_QUESTION
```

Presumption of survival:

```text
false
```

CI green may accompany either scientific verdict.

## 8. Authority membrane

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

## 9. Preregistered scientific question

Not:

> Is this witness true?

Not:

> Did this witness physically exist first in the world?

But:

> Did this evaluator register the witness material before the specific bridge proposal became available, or can evidence selected after the question is known still masquerade as non-anticipating support merely because it was admitted before final bridge submission?

That is the whole chamber. No external-provenance crown is available here.
