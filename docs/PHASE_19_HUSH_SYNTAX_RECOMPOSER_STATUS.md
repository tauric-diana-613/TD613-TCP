# Phase 19 Status — Hush Syntax Recomposer

Phase 19 adds syntax-aware recomposition to Hush so transformed outputs preserve claim truth and protected literals while changing the sentence architecture that carries them.

The phase targets the dominant post-Phase-18 leak: source-body attachment through copied sentence skeletons. Phase 18 and 18.1 measure and block exact or near-exact source-body copying. Phase 19 moves upstream by building a writer layer that creates source-detached candidates before scoring.

## What changed

Phase 19 adds:

- `app/engine/hush-claim-roles.js`
- `app/engine/hush-literal-placement.js`
- `app/engine/hush-syntax-plan.js`
- `app/engine/hush-syntax-recomposer.js`
- `app/engine/hush-syntax-shift.js`
- `app/engine/hush-claim-integrity.js`

It updates:

- `app/engine/hush-swap.js`
- `app/engine/hush-release-policy.js`
- `app/engine/hush-candidate-cleanroom.js`

## Pipeline

```text
Message
→ Meaning Plan
→ Claim Role Map
→ Literal Placement Map
→ Realization Plan
→ Syntax Plan
→ Syntax Recomposer Candidates
→ Claim Integrity Check
→ Cleanroom
→ Syntax Shift Scoring
→ Source Residue Scoring
→ Naturalness Review
→ Hush Candidate Ranking
→ Release Policy
→ Output / Needs Review / Blocked
```

## Local guarantees

Phase 19 is local review infrastructure. It improves syntax-level transformation quality under bounded assumptions.

It does not claim anonymity, untraceability, platform-proof behavior, publication safety, or identity outcomes.

## Doctrine

Exact copy is not transformation.
Wrapper-only phrasing is not transformation.
Tail-stuffed evidence is not custody.
Dropped caveats are not simplification.
Dropped negations are not style.
High naturalness is not enough.
High mask match is not enough.
Truth without syntax detachment is still source-body exposure.

## Acceptance pressure

Phase 19 passes only if Hush can preserve claim truth, protected literals, caveats, negations, dates, and evidence relationships while reducing source-body retention through syntax recomposition.

The matrix must continue to enforce:

- unchanged emitted outputs: `0`
- wrapper-only emitted outputs: `0`
- emitted claim-integrity failures: `0`
- average copied run below the Phase 18 severe band

Sealed ⟐
