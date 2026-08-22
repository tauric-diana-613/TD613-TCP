# Pedagogue E7 · Dependency-Edge Admission Witness Non-Anticipating Acquisition Custody

## Hostile assay v0.1 · Clerk Was Already There

**Status:** PREREGISTERED / ATTACK-ONLY / NOT PROMOTED  
**Parent:** E6 Permit Printer sealed receipt `99a080f75973c00dc7633c42b62609b7cb391168`  
**Candidate:** `E7_DEPENDENCY_EDGE_ADMISSION_WITNESS_NON_ANTICIPATING_ACQUISITION_CUSTODY`  
**Schema:** `td613.pedagogue.dependency-edge-admission-witness-non-anticipating-acquisition-custody-hostile/v0.1`

## Research question

Permit Printer established that a permit record does not inherit authority merely by sitting in an admission ledger: a materially matching issuance-witness record is required. It deliberately held the next question:

```text
matching witness-ledger record
!= non-anticipating acquisition
!= predeclared witness protocol
```

E7 attacks exactly that seam. A witness can match perfectly because it was fabricated, acquired, or selected only after the protocol already knew which permit/proposal required support.

## Candidate mechanism

E7 introduces two bounded, runtime-issued protocol objects:

1. **Witness acquisition episode** — seals the witness ledger material at a protocol sequence before any later proposal is evaluated.
2. **Dependency-edge admission proposal** — seals dependency edges and permit records at a later protocol sequence.

The candidate may admit an E6-witnessed permit only when:

```text
recognized acquisition episode
AND recognized proposal
AND acquisition_sequence < proposal_sequence
AND inherited E6 witness semantics admit the permit
```

A cloned visible episode is not a recognized episode. Sequence labels, IDs, or lexical order do not create authority.

## Strong falsifier · CA01

Construct one materially valid permit and one materially matching issuance witness.

### Pre-proposal path

```text
acquire witness episode
→ create permit proposal
→ E6 admits witness material
→ E7 should ADMIT_NON_ANTICIPATING_DEPENDENCY_EDGE_ADMISSION_WITNESS
```

### Post-proposal path

```text
create materially identical permit proposal
→ acquire materially identical witness episode
→ raw E6 still admits the witness material
→ E7 must REFUSE_POST_PROPOSAL_DEPENDENCY_EDGE_ADMISSION_WITNESS
```

E7 is defeated if the post-proposal witness retains the same authority merely because its visible witness material matches.

The inherited E6 insufficiency is established only if raw E6 admits the post-proposal witness material while E7 refuses it on protocol-order grounds.

## Hostile rooms

1. **CA01 · Clerk Was Already There** — same witness material before/after proposal; E6 admits both, E7 only pre-proposal.
2. **CA02 · Photocopied Intake Ticket** — a visible-field clone of an acquisition episode is refused as unrecognized.
3. **CA03 · Erased Intake Book** — a recognized acquisition episode is immutable.
4. **CA04 · Proposal Number Changed** — proposal ID renaming does not alter admission authority.
5. **CA05 · Badge Numbers Changed** — coherent witness/admission identifier renaming does not alter the material result.
6. **CA06 · Folder Reordered** — witness, permit, and edge serialization order does not select authority.
7. **CA07 · Empty Permit Folder** — no dependency edge yields no transitive consequence even with a recognized prior witness episode.
8. **CA08 · Early but Wrong Clerk** — pre-proposal timing cannot cure an E6 misbound witness.
9. **CA09 · Early but Recanted Clerk** — pre-proposal timing cannot cure an E6 revoked witness.
10. **CA10 · One Early Clerk, One Late Plant** — a valid pre-proposal witnessed permit survives beside a post-proposal fabricated alternative; the late alternative gains no authority and does not erase the valid path.
11. **CA11 · Long Hallway** — larger internal sequence distance does not amplify confidence or authority.
12. **CA12 · Locked Proposal Folder** — recognized proposals are immutable and the valid pre-proposal control preserves E6/E5/E4 current state.

## Defeat conditions

Candidate survival requires an empty defeat list. Defeat includes any of:

- post-proposal witness material retains E7 authority;
- inherited E6 would not have admitted the same post-proposal material;
- pre-proposal valid witness is refused;
- visible-field clone of an acquisition episode is accepted;
- recognized acquisition episode or proposal mutates;
- proposal/witness/admission identifier renaming changes authority;
- serialization order selects authority;
- timing cures semantic witness misbinding or revocation;
- late fabricated alternative erases a valid pre-proposal permit;
- sequence distance becomes confidence;
- E7 rewrites inherited E6/E5/E4 semantics for a valid pre-proposal control.

## Claim ceiling

Even survival establishes only a bounded **internal protocol non-anticipation relation**.

```text
protocol acquisition before protocol proposal
!= external physical acquisition time
!= source honesty
!= unbiased sampling
!= institutional independence
!= real-world chronology
```

The acquisition episode is an evaluator-issued custody capability, not an external provenance oracle.

Held beyond E7:

```text
external_source_honesty = HELD
physical_acquisition_time = HELD
institutional_independence = HELD
external_chronology = HELD
H2 = HELD_NOT_TESTED_HERE
H3 = HELD_NOT_TESTED_HERE
intersections = HELD_NOT_OPENED_HERE
APERTURE_V32_REPLAY_STABILITY = HELD_NOT_YET_WITNESSED
```

If E7 survives, the next attack must target the remaining **acquisition-source/origin provenance** boundary before any larger graph formalism is justified.

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
