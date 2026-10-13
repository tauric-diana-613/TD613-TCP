# TD613 · Observation Custody / Witness Preservation Hostile Assay v0.1

U+10D613

Status: **PREREGISTERED / PRE-EXECUTION / HUMAN-GATED / NO WORKFLOW MUTATION YET / NO EXTERNAL REQUEST AUTHORITY**

## 0. Why this assay exists

PR #677 terminated its internal hostile sequence at M2 `Window Latch` because the experiment executed successfully while the decisive runner-dependent lifecycle classification did not survive onto a safely retrievable closure surface.

The new question is therefore not another TLS-mechanism hypothesis.

It is:

> Can a runner-dependent scientific classification be preserved as a durable exact-run evidence object in the same execution that observes it, such that later claim construction does not depend on ephemeral console output or a replacement observation?

This assay is about **observation custody**, not about proving the missing M2 result retroactively.

## 1. Anti-retroactivity law

The missing run-1932 lifecycle classification remains unresolved.

Forbidden:

```text
new instrumentation → retroactive claim about run 1932
new run → substitute result for run 1932
source reconstruction → pretend runtime value was observed
CI green → choose an unrecovered scientific branch
```

Any future execution is a new witness with a new run identity.

## 2. Candidate under attack

Candidate research object:

```text
O1 = same-run durable observation custody
status = ATTACK_ONLY_NOT_PROMOTED
presumption_of_survival = false
```

Candidate rule:

A runtime scientific classification may support later claim construction only when the same execution serializes a structured evidence object before the ephemeral observation context disappears, binds that object to the exact run/head/fixture/instrument identity available to the execution, and exposes the object through a durable post-run retrieval surface without requiring a second observation of the external target.

This is a candidate custody rule, not a universal provenance theorem.

## 3. Minimal evidence object

The first implementation candidate must preserve a structured JSON object containing at minimum:

```text
schema
science_head
workflow/run identifier available at execution time
fixture/spec version
instrument/evaluator version
observation timestamp as runner metadata only
runtime classification
raw bounded fields needed to recompute that classification
claim ceiling
external_request_count
second_observation_performed = false
```

Where a run identifier is not reliably available inside the process, that absence must remain explicit rather than fabricated. Post-run association may bind GitHub artifact metadata to the exact workflow run only if the association is deterministic and does not alter the scientific payload.

## 4. Strong falsifiers

The candidate fails if any of the following occurs.

### OC01 · Console-only success

The runtime prints the decisive classification but does not preserve a durable structured object.

Required disposition:

```text
FAIL_OBSERVATION_NOT_DURABLY_CUSTODIED
```

### OC02 · Artifact without raw support

A durable object preserves only a verdict label while omitting the bounded raw fields necessary to recompute the classification.

Required disposition:

```text
FAIL_VERDICT_ONLY_ARTIFACT_NOT_REPLAYABLE
```

### OC03 · Detached artifact

A durable object exists but cannot be bound to the exact science head / execution identity / fixture version.

Required disposition:

```text
ABSTAIN_ARTIFACT_EXECUTION_BINDING_INCOMPLETE
```

### OC04 · Replacement-observation laundering

A post-run recovery path performs a second external request and uses that result to fill the missing first-run classification.

Required disposition:

```text
REJECT_REPLACEMENT_OBSERVATION_AS_ORIGINAL_WITNESS
```

### OC05 · Green-badge laundering

The workflow succeeds but the scientific evidence object is missing or malformed.

Required disposition:

```text
INFRASTRUCTURE_SUCCESS_SCIENTIFIC_WITNESS_MISSING
```

### OC06 · Mutable artifact

The evidence object can be silently rewritten after observation without producing a distinct custody identity.

Required disposition:

```text
REJECT_MUTABLE_OBSERVATION_CUSTODY
```

### OC07 · Serialization-order dependence

Equivalent JSON field ordering or nonsemantic serialization changes alter scientific disposition.

Required disposition:

```text
semantic_result_invariant = true
```

### OC08 · Duplicate artifact amplification

Duplicating the same exact observation artifact must not increase confidence, authority, or evidence depth.

Required distinction:

```text
duplicate custody copies != new observation
```

### OC09 · Failure-run preservation positive control

A deliberately failing scientific test writes the structured observation before process exit and the existing failure-artifact lane preserves it.

This is a positive control for the repository's already-existing `upload-artifact` failure behavior, not proof of the success-run path.

### OC10 · Success-run preservation strong control

A successful bounded scientific execution must preserve the same class of structured observation on a durable post-run surface. If the repository currently uploads diagnostics only on failure, the candidate must not pretend success-run evidence durability has been established.

This is the principal implementation pressure exposed by the current workflow.

## 5. Repository-specific starting fact

Current `TD613 Consolidated Validation` already contains an artifact upload step named `Preserve diagnostics only when held`, guarded by `if: failure()`.

Therefore:

```text
failure-path artifact custody = existing repository capability
success-path scientific observation custody = not established by that step
```

The first implementation should prefer extending an existing workflow/artifact surface rather than creating a fifth durable workflow.

This preregistration does **not** itself authorize a workflow mutation. Any implementation must preserve the existing four-workflow estate and pass the workflow-estate/release-membrane contracts.

## 6. Cheapest-first execution posture

When implementation is human-admitted:

```text
1. pure serializer / schema contract
2. deterministic replay from preserved object
3. failure-path positive control using existing artifact behavior
4. success-path artifact custody
5. exact-run retrieval witness
6. only then repeat an M2-class runtime observation as a NEW run
```

No browser witness is required unless browser behavior becomes part of the implementation.

No live external request is required to test steps 1–5.

## 7. Claim ceiling

This assay cannot establish:

```text
truth of external source content
source identity
source honesty
physical origin
institutional independence
cryptographic authenticity unless separately implemented and tested
universal GitHub Actions artifact guarantees
universal observability theorem
TLS mechanism
retroactive M2 result
H2
H3
M×D / M×P / D×P / M×D×P
APERTURE_V32_REPLAY_STABILITY
production authority
release authority
```

## 8. Success condition

The candidate survives only if a later exact-run closure process can retrieve the same-run structured observation object and recompute the scientific classification without:

```text
second external observation
source-code inference substituted for runtime evidence
console-log dependence
manual transcription of the decisive fields
scalar confidence aggregation
```

Candidate surviving verdict, if earned:

```text
SAME_RUN_DURABLE_OBSERVATION_CUSTODY_CANDIDATE_SURVIVES_BOUNDED_WITNESS_PRESERVATION_FAMILY
```

This verdict would remain `ATTACK_ONLY_NOT_PROMOTED`.

## 9. Next action after this preregistration

```text
HUMAN_REVIEW_OBSERVATION_CUSTODY_PREREGISTRATION
→ implement smallest existing-workflow-compatible serializer/artifact path
→ execute cheap hostile family
→ seal exact receipt
→ only then decide whether a new M2-class runtime observation is scientifically earned
```

No Vercel deployment is part of this program.

U+10D613

Sealed ⟐
