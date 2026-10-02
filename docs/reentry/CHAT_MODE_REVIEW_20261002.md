# Chat-mode adversarial review · Portable Loom re-entry

Date: 2026-10-02 UTC  
PR: #1406  
Review mode: **single-reviewer role-based analysis**. This review does not manufacture new independent Pedagogue/Aperture/Atlas/FADT collaborators. Earlier independent role findings remain preserved under their original source/time scopes.

## Decision

**SOURCE_CANDIDATE_GREEN_WITHIN_LOCAL_CUSTODY_SCOPE · HUMAN_REVIEW_REQUIRED · MERGE HELD · RELEASE HELD.**

The repaired application source is `a9f89a980adeba30046acea2b13187a6b4d271cc`, tree `0c328a6ea42b45beef432909920647533b8cf849`. GitHub Actions run [37038296667](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/37038296667) completed success against that exact head. Its returned-work custody contract step reported 150 passed / 0 failed. The Actions artifact `bounded-layout-a9f89a980adeba30046acea2b13187a6b4d271cc` is bound by `sha256:baddc100aaa42aa1770b08cb1c0a790de68c56ea1d94294d2f6930cf045c1aa7`. Its re-entry receipt reports exact committed application bytes, Chromium PASS at 1280×900 and 390×844, synthetic foreign captures, zero live provider calls, and no measured human comprehension.

Issue #737 remains provisioning-only: merge authority 0, #405 release authority 0, Vercel deployment authority 0. No merge, provider, deployment or release gesture occurred in this review. #405 remains unchanged.

## Defect found and repaired

The normal UI records Challenge evidence before Check, but the public custodian engine still accepted arbitrary `input.challenge` directly inside `check()`. That created an anti-erasure bypass: an adverse direct attachment could produce a HELD candidate without entering `challenge_history`; a caller could then omit it and submit a later clean direct attachment, which could become an admission candidate.

The repair requires every non-null attached Challenge to match exact evidence already retained for the active excursion. Otherwise Check adds `UNREGISTERED_ATTACHED_CHALLENGE`. The hostile regression now performs adverse-direct-attachment → later-clean-direct-attachment and requires both checks to remain HELD. The valid attachment test first calls `recordChallenge()` and only then rechecks that same retained evidence.

This is an implementation defect repair, not a widened claim. It narrows the engine to the repository's already-declared history law.

## Role-based adversarial reading

**Pedagogue.** The repair changes no operator-facing gesture order. The exact-head rendered route still passes Check≠Admit, candidate-specific acknowledgment, visible consequence, malformed inline HOLD/focus, rest/expiry/discard, new-root consent revocation, and review-only reload. This supplies observed UI behavior under the synthetic harness, not comprehension.

**Aperture.** The bypass incorrectly allowed supplied evidence to affect admissibility without becoming part of the retained observation history. Requiring exact retained evidence restores the distinction between supplied capture, registered episode, recomputed qualification and unresolved foreign state. Foreign origin/execution remains unresolved.

**Atlas.** Root/policy/anchor equality alone cannot place an assay into the current excursion relation. The attached episode now needs a retained current-excursion relation before it can participate in Check. Anchor-only and retired-excursion episodes remain archived without future-task coverage.

**FADT.** Before repair, erasing the unretained adverse direct attachment could collapse two histories to the same later clean representation while lawful support differed. After repair, unregistered direct attachments map to HELD; the admission-capable support requires the retained current-excursion history coordinate.

## Ten success coordinates after review

1. **Candidate.** Live process-local custody; recomputed seed integrity; immutable inherited policy; unexpired pre-egress task/source registrations; complete ordered bound returns; answer commitments; explicit operator rule-review declaration; all linked retained Challenge history. An attached Challenge also needs exact prior retention for this excursion.
2. **Evidence class.** Local registration, local supplied capture, recomputed integrity/comparison, local custody transition and declared receiver/operator fields remain distinct. Foreign origin, execution and hidden host state remain unresolved.
3. **HOLDs.** Import/reload authority, seed policy extension/weakening, missing registration/review/capture, incomplete/out-of-order return, wrong root/policy/anchor/excursion/intent/task/source/answer, stale capability/head, expiry/reversed clock, linked pending/exposure/HOLD Challenge, and unregistered attached Challenge.
4. **Ancestry advance.** Only the exact issued `ADMISSION_CANDIDATE` plus current revision/state/excursion/head, reviewed candidate ref, `ADMIT_RETURNED_WORK`, `accept_unresolved:true`, and final expiry/CAS guard. Descendants install as one local atomic batch.
5. **Replay/substitution/inheritance.** Excursion/intent commitments, exact per-turn bindings, complete range, WeakMap issued-object capability, consumed-root registry, revision/head CAS, frozen root policy and fresh source selection. Global copied-session forks remain unresolved.
6. **Unprovable here.** Foreign execution/enforcement, semantic obedience, exhaustive source use, hidden retention/training/memory/retransmission, universal secrecy/non-reconstructability, human comprehension, physical-device behavior, globally latest fork, exteriority and Golden Egg.
7. **Operator encounter.** Check remains visibly separate from Admit; head-changing consequence and unresolved claims precede exact-candidate acknowledgment; successful admission shows new head/count; rest preserves deadline; discard preserves admitted history; new-root replacement exposes consequence + private Save + bound acknowledgment.
8. **Continuation.** A new excursion reanchors at the latest locally admitted descendant under the same root/rules. New source selection begins empty. The public continuation carrier supplies the latest admitted answer plus only explicitly chosen latest-turn sources and grants no admission authority.
9. **Challenge descendant.** Current retained native v0.2 unit accepted; shadow/noncurrent units rejected; literal, standalone and joined classifications remain distinct; Challenge never advances head; scope never silently covers future turns; attached recheck needs exact retained current-excursion evidence.
10. **Recovery.** GitHub preserves source, tests, role findings, historical defects, exact-source Actions evidence and this review. Private exports remain review-only. Durable/restored admission authority still requires an independent custody witness.

## Evidence boundary

The old exact-source coordinate `7f7008f99ce8dd563ce31c34e2ff3d6bf76d9f8c` and its evidence-only head `dbf1a7630c3d2630f9bd3c5485e5b9aada0a9970` remain historical after the engine-byte repair. They are not relabeled as witnesses for `a9f89a980adeba30046acea2b13187a6b4d271cc`.

The new exact-source browser witness is CI-executed evidence read from GitHub Actions/artifact output; this Chat session did not become an independent browser witness by reading it. The 390px posture is a simulated viewport, not a physical-device witness.

## Remaining stronger research coordinates

Authenticated durable recovery, independent custody/host witnesses, and operator-bound capture remain separate stronger coordinates. Runtime `HELD_INPUT_CLASS` remains where captured gesture traces or semantic-field objects are absent. Western Horizon remains intact: deterministic transformations of the admitted record do not supply an exogenous witness.

Reality retains final jurisdiction.
