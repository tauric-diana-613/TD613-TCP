# 𝌋‌ MARROWLINE DOLLHOUSE AUDIT AND SPECIALIST FINDINGS RECEIPT

- **Commission:** `TD613-MARROWLINE-SCREAMING-GROVE-RESTORATION`
- **Date:** 2026-11-20
- **Primary Engineering Integrator:** Antigravity primary agent (Gemini 4 Neon XHigh)
- **Skill Dispatched:** `.agents/skills/dollhouse-audit/SKILL.md` (`scripts/run-dollhouse-skill-audit.mjs --strict-provenance`) + five leaf specialist agents + TD613 Dollhouse Orchestrator
- **Branch / Worktree:** `research/marrowline-screaming-grove-restoration-20261120` (`C:/td613-worktrees/marrowline-screaming-grove-restoration-20261120`)
- **Audited Source Revisions:**
  - Baseline commit audited by all 5 leaf specialists: `6cf64d17d82f727bb918be6869f313a3342e530c`
  - Post-specialist hardening commit re-audited by strict-provenance engine & Orchestrator: `bc5467246f12b0598f89d681e4a4450c4733eace`
- **Archived Raw Engine Receipts:**
  - `dollhouse-engine-receipt-baseline-bc5467246.json` (`dollhouse-audit-1795200755756-c7b9f32a`)
  - `dollhouse-engine-receipt-global-hold-bc5467246.json` (`dollhouse-audit-1795200756869-d0506412`)

---

## 1. Skill & Engine Verification (P2.4 Checklist)

1. **Skill loaded:** Verified `.agents/skills/dollhouse-audit/SKILL.md`, `.agents/skills/dollhouse-audit/references/cli.md`, `.agents/skills/dollhouse-audit/references/examples.md`, and `scripts/run-dollhouse-skill-audit.mjs` directly inside the isolated worktree.
2. **Domain engine tests verified:** `npm run test:dollhouse:audits` + all 12 Dollhouse specialist/Atlas suites passed **`220/220`** (`0` failures).
3. **Exact-head strict provenance verified:** Both engine runs on `bc5467246f12b0598f89d681e4a4450c4733eace` returned:
   - `source_revision_verified: true`
   - `git_commit_verified: true`
   - `is_exact_checkout_match: true`
   - `worktree_cleanliness_verified: true`
   - `current_head_source_equivalence: "EXACT_CHECKOUT_IDENTICAL"`
4. **Verified File SHA-256 Manifest at `bc5467246`:**
   - `server/marrowline-completion.js`: `16f59db959f28d0246e77f31b4b94b1bdcf732926d99f81f274b45ce5612f221`
   - `server/khonapolit-quality.js`: `f75769f09700687cf57f51488ca4bba70b2abbc303430cdfaff63d16b9847e48`
   - `server/marrowline-attachment-quality.js`: `db26d8d8de77a605dceb578becbf5122ba8d78f3d07f0254bf8f0f9292716937`
   - `app/engine/aperture-v3-task-intent.js`: `b38b1e6d6c88d12d2338b2b30c25ca3909fd24e9bdf32a5ec3a567c612326e5d`
   - `app/dome-world/khonapolit-relay.js`: `4546f2021b5b50745b77a73a34711c09b51bba4c9cbf022cd079b07e3abb79d2`
   - `app/dome-world/marrowline-historical-grove.js`: `df8d2206b04e76f409dead068a75ea6d64869c6c7a342bde6961c05a6fbb0f98`
   - `tests/marrowline-screaming-grove-restoration.test.mjs`: `878b36cbd8675c97dc87bb7c65c7b275f6e29048766f20d5fefcd88195205e65`
   - `research/marrowline-screaming-grove-restoration-20261120/MARROWLINE_EFFECTIVE_REQUEST_PARITY.json`: `27d1acb979e62b51719605663c64c27e698a1dbb84bf8e693da7d08c20b00037`

---

## 2. Deterministic Engine Runs (Split Verdicts Preserved)

| Engine Run | Invocation ID | Exit Code | Orchestrator Decision | Consensus | Key Findings / Preserved Holds |
|---|---|---|---|---|---|
| **Deterministic Repair Baseline** (`MARROWLINE_SCREAMING_GROVE_DETERMINISTIC_REPAIR_BASELINE`) | `dollhouse-audit-1795200755756-c7b9f32a` | `0` | `SUPPORTED` (source/contract scope only) | `UNANIMOUS_SUPPORT` | All 5 engines verified (`0` infractions). Preserves nested hold `APERTURE:classification_replay_stability = HELD_NOT_YET_WITNESSED`, `empirical_replication_count = 0`, `release_authority = false`, `human_closure_required = true`. |
| **Global Artistic Closure Hold Check** (`MARROWLINE_SCREAMING_GROVE_GLOBAL_ARTISTIC_CLOSURE_HOLD_CHECK`) | `dollhouse-audit-1795200756869-d0506412` | `1` | **`HELD`** | **`HELD_DISSENT`** | Preserves 4 structural vetoes: `APERTURE` (`STRUCTURAL_RANK_DEFICIT`, `no_scalar_crown: true`), `ATLAS` (`HOLD_HOLONOMY_HISTORY_PARITY_FAILED` on shared `RESTORED_GROVE_LABEL`), `FADT` (`ILLEGAL_ACTION_GRANT_UNDER_ERASED_CONDITIONING` under erased finishReason), `TEMPORAL_CUSTODIAN` (`veto_authority: LOCAL_PASS_PLUS_GLOBAL_ROUTE_REGRESSION` holding `PAID_PROVIDER_DISCRIMINATOR: HELD` & `HUMAN_ARTISTIC_CLOSURE: HELD`). |

---

## 3. Participating Dollhouse Specialists, Concrete Catches & Disposition

All five leaf specialists ran read-only against commit `6cf64d17d` (`0` concurrent worktree edits, `0` paid calls), surfaced real code/test/citation catches that were patched and verified in commit `bc5467246`, and were then reconciled by `dollhouse-orchestrator`:

| Role & Conversation ID | Initial Verdict on `6cf64d17d` | Concrete Catches Surfaced | Remediation in `bc5467246` | Preserved Open Holds |
|---|---|---|---|---|
| **Aperture** (`58c7dc01-ddd5-47a7-abe5-1a2f875316be`) | `SUPPORTED` (baseline) / `HELD` (global closure) | (1) Legal prompts citing `"systems hearing"`/`"horror-comedy register"` leaked to `CREATIVE`; `"Diagnose why Vercel returns 502"` dropped to `GENERAL`. (2) `botsMovement.eligibleBaseCount` included 15-char `"Tauric Diana bots"` heading; `uniformDepthStencilObserved` flipped `true` on extended 3-line depth-1 restraint control and `false` on 99/100 depth-3 stencil. (3) `mergeGeminiStreamPayload` overwrote `usageMetadata`/`promptFeedback` per SSE chunk. | **All 3 patched & regression-tested** (`aperture-v3-task-intent.js`, `khonapolit-relay.js`, `khonapolit-quality.js`, `tests/marrowline-screaming-grove-restoration.test.mjs`). | `STRUCTURAL_RANK_DEFICIT`, `no_scalar_crown: true`, `classification_replay_stability = HELD_NOT_YET_WITNESSED`, `ARTISTIC_CLOSURE_RESERVED`. |
| **FADT** (`35a2025a-9967-46d9-acfe-876afc13e92e`) | `CONDITIONALLY SUPPORTED` (text) / `HELD` (residual erasures) | (1) `promptBlockReason` paired with `finishReason === 'STOP'` set `complete: true` (`marrowline-completion.js:52`). (2) Mixed policy-terminated + `503`/`429` seat failures erased `observedStatuses` and transport counts. (3) Attachment route overwrote `MAX_TOKENS` `outputAdmission` without forcing `NOT_LOCKED`/`downstreamAdmitted: false`, and omitted `finishReason === 'STOP'` check on terminal continuation. | **All 3 patched & regression-tested** (`marrowline-completion.js`, `khonapolit-quality.js`, `marrowline-attachment-quality.js`, `tests/marrowline-screaming-grove-restoration.test.mjs`). | Attachment ingress intentionally omits `groveTrial` & uses unprofiled `HIGH` thinking (pinned by test contract); non-policy non-`STOP` (`OTHER`/`LANGUAGE`) on initial attachment return remains a separate contract seam. |
| **Pedagogue** (`1415ce7d-6db4-4160-a92e-4e052adc83dd`) | `SUPPORTED` (bounded source/restraint discipline) / `HELD` (live/browser/artistic) | Confirmed untouched production default, descriptive-only `observeBotsProsodyDistribution`, Section VII controls, and rest/exit preservation; live operator cadence returned `NOT_EVALUATED` (`INPUT_MISSING`, never synthesized). | No code defect; holds preserved verbatim. | Live browser witness (`UNEXERCISED`), live provider parity (`UNTESTED`), `ARTISTIC_CLOSURE_RESERVED`. |
| **Atlas** (`b0ee9fd1-3394-4eaa-89da-e645c186a2dd`) | `BOUNDED PASS` (offline P0/P1/P5) / `HELD` (live P3/P5/P6) | (1) `MARROWLINE_HISTORY_FEEDBACK_PARITY.md` claimed test verified `𝌋`, `U+10D613`, `⟐` through `serializeGeminiRequest`, which were missing from the test string. (2) Clarify PR `#1549` vs `ORDINARY_CURRENT` is `4` differing paragraphs by unordered set vs `71/150` line positions due to `relayAddendum`/`relayCue` order swap. | **Both patched & verified** (`tests/marrowline-screaming-grove-restoration.test.mjs`, `MARROWLINE_OCT02_HISTORICAL_PARITY.md`). | Shared-label `HOLD_HOLONOMY_HISTORY_PARITY_FAILED` (Oct 2 vs PR `#1549`), attachment `groveTrial` omission, 10-entry rolling history bound, `0` live multi-turn post-`#1581` turns. |
| **Temporal Custodian** (`3c0e6c5b-ac37-4e79-8677-090b3d33f3f7`) | `PASS` (5-phase baseline) / `HELD` (`LOCAL_PASS_PLUS_GLOBAL_ROUTE_REGRESSION`) | Verified zero Argon retro-projection into `ffb98ac0` (Argon first landed `2026-10-14` in `6af8564d5`). Flagged minor register slips (`#1571`/`#1572` omitted from `#1573–#1578`, `#1542` dated Oct 18 vs Oct 19) and required explicit predecessor SHA binding in preregistration. | **All 3 patched** (`MARROWLINE_HISTORICAL_PR_CASE_REGISTER.md`, `BOUNDED_PROVIDER_EXPERIMENT_PREREGISTRATION.md`). | `LOCAL_PASS_PLUS_GLOBAL_ROUTE_REGRESSION` veto holding `PAID_PROVIDER_DISCRIMINATOR: HELD` and `HUMAN_ARTISTIC_CLOSURE: HELD`. |
| **Orchestrator** (`f9edfc36-b2b0-45e2-81c6-4437904d8c0f`) | Adjudicated split verdict (`SUPPORTED` baseline / `HELD_DISSENT` global) | Reconciled all 5 specialists + `bc5467246` engine receipts without smoothing any veto. Recommended **`DETERMINISTIC_RUNTIME_REPAIR_VERIFIED`** while keeping `CREATIVE_CANDIDATE_READY_FOR_HITL` `HELD` and `HISTORICAL_ARTISTIC_PARITY_ACCEPTED_BY_OPERATOR` strictly `RESERVED`. | Final adjudication aligned verbatim in `MARROWLINE_RESTORATION_ADJUDICATION.md`. | `SHARED_ACQUISITION != INDEPENDENT_REPLICATION` (`empirical_replication_count = 0`); all specialist holds preserved. |

---

## 4. Replication Discipline, Unavailable Capabilities & Zero-Authority Boundary

- **Replication Accounting:** `SHARED_ACQUISITION != INDEPENDENT_REPLICATION`; **`empirical_replication_count = 0`**. Six Dollhouse roles inspecting one shared source/offline estate add zero independent empirical replication.
- **Unavailable / Unexercised Capabilities (Explicitly Disclosed):**
  - **Local `jsdom` browser tests & Python Pillow prosody atlas tests:** Absent from fresh isolated worktree local environment; deferred to exact-head GitHub Actions CI.
  - **Live desktop / `~390px` browser witness:** **`UNEXERCISED`** (zero browser screenshots, focus traces, or live DOM inspections claimed).
  - **Paid Gemini provider observation:** **`HELD`** (`0` paid calls spent).
  - **`/dollhouse-design` skill:** Deliberately **not invoked** per Section P2.4 (primary restoration is a causal source/runtime investigation, not a visual UI redesign).
- **Authority Declaration:** `release_authority: false` · `deployment_authority: false` · `paid_execution_authority: false` · `human_closure_required: true`.
