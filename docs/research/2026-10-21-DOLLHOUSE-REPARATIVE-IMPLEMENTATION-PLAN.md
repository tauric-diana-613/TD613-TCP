# TD613 · Dollhouse reparative implementation plan · P0 plan-armed handoff

**𝌋 U+10D613 · October 21, 2026 · PLAN_ONLY / SOURCE_BOUND · ⟐**

## Authority and identity
- Baseline: `main@78c7ea6b974e176611fb2ed4d0c59649ebf05f62` at drafting. Re-read `AGENTS.md` and fresh `main` before mutation.
- This branch and its draft PR contain only a planning/activation scaffold. They are **not** authority to change product code, run external provider experiments, spend credits, merge or deploy.
- The Orchestrator coordinates, never grants itself evidence, human consent, release permission or precedence over a valid qualified role hold. Temporal Custodian is the fifth bounded role, not a sixth decision-maker.

## Input corpus and integrity
Original evidence supplied to the planning discussion (do not silently pretend these files live on GitHub):
- `TD613_Dollhouse_Seven_Lane_Repair_Plan_2026-10-21.md`; SHA-256 `0b0800f6045661ef97433ab26161ec77f1eb381e755ede53c7a1d457b68e1313` (historical proposed plan; superseded where amended).
- `TD613_Stage01_Sedgwickian_Repair_Assessment_2026-10-21.md`; SHA-256 `5ba571cec78c4138b81f1a1a34c9b852f9f92e3b361011a4a9208ed520adbde6` (reparative amendment).
- `LOOM_CAPABILITY_FIDELITY_STAGE01_EVIDENCE(1).zip`; SHA-256 `ec08b2abc2b1b4920b4e98766680a50127c28dcbc7179be1ad16f2ad21bf55af` (144 internally hash-matched archive members; provenance not independently authenticated).
- `Mathematical_Audit_Concepts_and_Evidence_Index_v1_3(2).json`; SHA-256 `771c081d857300dda64c9bcd30ddc565c8a2f3a26694dab7a2415d1c0032432d` (532 indexed headwords, 49 formulas, 46 evidence records, 28 crosswalks, 37 unresolved questions, 88 anchors; not 532 discoveries).
- `Aperture_v3_2-alpha(20261021-225614).html`; SHA-256 `fe75d6d64d5181e8c157c2f93cfa7a89cedf1421ac317a8986abb3ca96a4d518` (operator's reference instrument; compare with installed Aperture before promotion).

These external conversation attachments need to be obtained as unchanged files by the operator in the Antigravity working environment before asserting direct byte comparison. Until then use repository anchors below and mark attachment comparisons `HELD_INPUT_UNAVAILABLE`. Do not commit personal/private source packets or entire archival ZIP without separate review.

Stage 01's reported census: 260 unique capability entries, 678 selected inert original-source copies; dispositions are 119 BOUNDED_WITNESSED, 77 ARCHIVED_ONLY, 18 EXTERNAL_MEASUREMENT_HELD, 16 EXECUTABLE_OFFLINE, 16 SPECIFIED_UNIMPLEMENTED, 8 INTEGRATED_UNEXPOSED, 6 OPERATOR_ACCESSIBLE. The overall estate remains `HELD_UNRESOLVED_LINEAGE`. **Do a delta against this census, not another exhaustive reinventory.**

## Canonical grounding
Read in order: `AGENTS.md`, `DOLLHOUSE.md`, `PEDAGOGUE.md`, `APERTURE.md`, `ATLAS.md`, `FADT.md`, `dollhouse/lineage/README.md`, `SEQUENCE_6_STAGING.md`, `docs/sequence-6/SURVIVOR_MAP_AND_ARCHITECTURE_FREEZE.md`, and `docs/research/2026-10-04-dollhouse-orchestration-episode-1428-x.md`.

Particular implementation sources:
- Pedagogue: `app/engine/pedagogue-design-gate.js`, `pedagogue-institutional-time.js`, `pedagogue-lineage-second-pass.js`, `pedagogue-research-transfer.js`, `pedagogue-gesture-consequence.js`.
- Aperture: `app/engine/aperture-v32-typed-epistemic-deficit.js`, `aperture-v31-temporal-tomography.js`, `dollhouse-witness-plan.js`, `app/aperture/release.json`, and `app/aperture/tool.html`; standalone `v3.2-alpha` retains `HELD_NOT_YET_WITNESSED` replay stability absent a new valid test.
- Atlas/FADT: `app/engine/dollhouse-atlas-fadt.js`, `dollhouse-continuity-audit.js`; original Atlas/FADT shortcuts and immutable lineage. Archived code is not runtime-loaded by virtue of being listed.
- Temporal Custodian: old candidate commit `88f128c75cd8efd58db9a77249f293e69d08762e` and stricter candidate `248242c89160825c97d27c7c0ccc2d9d6d19ec5a`; inspect `app/engine/dollhouse-temporal-custodian.js`, `TEMPORAL_CUSTODIAN.md`, and its ledger schema/test, preserving candidate status until integrated and tested. Old all-HELD false PASS was already addressed by v0.2 declared required phases; **test its actual adequacy**, do not reinvent the patch.
- Dollhouse/Orchestrator: `app/engine/dollhouse-agent-registry.js`, `dollhouse-case-dossier.js`, `dollhouse-claim-ceilings.js`, `dollhouse-closure-auditor.js`, `scripts/export-dollhouse.mjs`, `scripts/run-dollhouse-ablation-experiment.mjs`, `tests/dollhouse-orchestration-invariants.test.mjs`.

## Admission gates — must remain independent
**R1 · Source/integrity.** Demonstrate digest identity and correct algorithm labeling; retain historically mislabeled FNV-like `sha256:` bytes as evidence rather than authenticating them. Caller-declared equal hashes are not verified equality. Separate source revision, custody head, content ancestry, detached model output, and external provenance. Preserve `L_leakage` vs `L_latent`, `C` clock vs matched return vs closure score, separate A15/A20 labels. Unmerged sources remain unmerged.

**R2 · Positive reparative capacity.** Separately assess six capacities: *retrievability, attributable provenance, interpretability, transmissibility, contestability, repairability.* Also record allowed task completion, actual selectable disclosure, number of extra private restatements, elapsed time, ability to correct held results without fresh unrelated disclosure, and visible rest/exit. No average can wash out a loss. Five harm indicators (access failure, custodial collapse, provenance disruption, algorithmic suppression, documentary harm) are diagnostic candidates—not inferred intent.

**R3 · Receiver-relative inverse problem.** Preregister fully fictional private-advice, sensitive-investigation and creative-authorship scenarios and inert-installation control; preserve local truth keys, per-model/version experimental conditions, matched no-Loom baseline, withheld-source canaries, versioned probes, timing, and both utility and disclosure. Text instructions are not foreign-host enforcement; provider memory/training remains unobserved. The Golden Egg E* same-episode five-surface goal stays independent and UNEARNED.

## Seven engineering lanes (P1–P7), with P0 reconciliation
**P0 · Delta & failing witness.** Reconcile Stage 01's 260-entry census to fresh source and candidate `d197edca`; preserve October 4 R1–R4 as historical. Reproduce current FNV-label/caller-equality hazard and existing isolated SHI Receipts fixture RED without claiming live exploitation. Verify mounted Aperture oracle digest if present. Record initial `HELD`s.

**P1 · Pedagogue.** Promote discoverable full temporal/lineage/research route when actual inputs warrant it; retain gesture-only route separately. Test ACTION_BEFORE_NOTICE, premature naming, omitted Rest/Exit, positive preemption gap, missing clock and identical final state with distinct histories. Operator must be able to understand and finish a permitted task; no invented clock.

**P2 · Aperture.** Compare v3.2 42 scan families/25 lanes as a declarative interface against executable handlers; no single score, lexical shortcut, or headless HTML-as-agent-brain. Test rank vs conditioning, missing/invalid covariance, nullity vs stability, abstain/reject/ask-nothing, replay and controlled widening. Pair five harm candidates with six knowledge-survival capacities, ability to contest a decision, and a useful next observation.

**P3 · Atlas.** Select exact original modules for route-history, identity, incidence, marked transport/holonomy and faithful receiver reconstruction, with dependencies and hostile controls. Preserve unknown external origin. Different historical paths with identical final strings must yield appropriately distinct conclusions; permitted return must be usable. Do not silently execute archives or merge unmerged research.

**P4 · FADT.** Preserve exact finite descent `U_y=I_y` criterion and nonempty gap witnesses. Add a *least-restrictive lawful assistance* analysis under declared supports: what help remains permitted, and which additional observation could resolve a missing distinction? Test forbidden widening, lawful successful task, unsafe overgeneralization, absent supports.

**P5 · Temporal Custodian.** Compare old `88f128c` and strict `248242c`; test all HELD, all PASS, missing required phases, late failure after PASS, retroactive mutation, right-censored timestamps, episode prefix, valid correction leading to later legitimate completion. A local PASS never entails whole-route PASS. No retrospective rewrite; no self-granted merge or execution.

**P6 · Dollhouse.** Register five separately callable roles with distinct typed inputs, evidence statuses, optional absent inputs, original-source pointers, and operator-visible changes. Preserve inert archive. Expose task-relevant dispatch; don't simply expand agent word counts. Compare no-Dollhouse baseline and 5-role results with evidence-source de-duplication.

**P7 · Orchestrator.** Compose typed role results and disagreements, respect qualified holds, preserve chronology and exact-source receipts; require positive reparative-outcome assessment, task utility, disclosure and human burden. Blind ablation: full five-role vs minus-one plus no-Dollhouse; avoid conflating model agreement with independent evidence or an apparent PASS with admitted return.

## Ordered implementation rests
1. `REST-00` — read-only baseline and evidence reconciliation; freeze R1 hazard, existing RED, unchanged Stage 01 IDs.
2. `REST-01` — smallest end-to-end synthetic operator-benefit route (Lab → Aperture → Pedagogue → FADT → Atlas → Temporal → orchestrated human review).
3. `REST-02` — each doll's source-to-call-site rehydration under independent hostile fixtures and ablations.
4. `REST-03` — controlled receiver trials **only with new operator authorization**.
5. `REST-04` — optional scholarly archive concordance and publication preparation, distinct from product credit.

After every rest create a dated append-only receipt: exact commit, changed files, bounded observation, failure and adversarial result, witness class, alternatives, corrected vs remaining outcomes, six capacity statuses, and next missing observation. Explicit `PASS`, `HELD`, `FAILED` classification. Later success cannot rewrite an earlier failure.

## Worktree / PR policy
Antigravity primary in **Planning Mode** first; independent role-specific read-only analyses; only operator-approved small implementation changes in separately owned worktrees and reviewed PRs. One integrator; no parallel edits to same path. The plan PR remains draft and plan-only; implementation PRs should be separately bounded. Do not autonomously spawn detached OpenAI review, production trials, issue #405 release gestures, merge, or deploy. The current `AGENTS.md` overrides conflicting historical activation prose. 
