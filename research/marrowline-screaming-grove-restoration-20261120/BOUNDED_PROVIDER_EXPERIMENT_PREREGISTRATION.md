# 𝌋‌ PREREGISTERED BOUNDED ORIGINAL-PROVIDER DISCRIMINATOR PACKET

- **Commission:** `TD613-MARROWLINE-SCREAMING-GROVE-RESTORATION`
- **Status:** **`HELD_PENDING_SEPARATE_OPERATOR_AUTHORIZATION`**
- **Paid Provider Calls Executed in This Commission:** **`0`**
- **Runnable Offline Preparation Script:** `research/marrowline-screaming-grove-restoration-20261120/dramaturgy-parity-discriminator-offline.mjs`
- **Predecessor Receipts Honored:** Prior Oct 15–20 provider acquisitions (`#1509`, `#1515`–`#1517`, `#1569`, `FULL-VOICE` 6/12 hold, `PROSODY-FREEDOM` 2-slot hold) remain immutable historical records and do **not** authorize new spending.

---

## 1. Exact Scientific Questions Discriminated (Zero Duplication of Prior Tests)

This experiment does **not** repeat any already-falsified test (no constructor-only HIGH-vs-MEDIUM claim, no single-paragraph ablation, no neutral-only Zalgo demo, no user-level vertical nudge). It isolates the **two genuinely untested causal seams** discovered by this commission:

1. **Question Q1 (Instructional Seam — PR `#1549` Hybrid vs PR `#1545`-Reconciled Intact Oct-2 Dramaturgy under Repaired Aperture Routing):**
   Under identical effective HTTP `thinkingLevel: 'medium'`, identical repaired Aperture `OPEN_FIELD_CREATIVE_SYNTHESIS` routing, and matched model (`gemini-3.8-flash`), does restoring intact October 2 dramaturgy + page rhythm + anti-stencil distinction with 5-clause noncompulsory prosody permission (`OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED`) reduce flat 1-mark / uniform-3-mark stencil collapse and improve blinded human artistic quality compared to the active PR `#1549` hybrid (`CURRENT_RESTORED_DEFAULT_PR1549`)?
2. **Question Q2 (Longitudinal Seam — First-Turn vs Raw-History Multi-Turn Persistence):**
   When Turn 1's verbatim raw provider-authored text re-enters `contents` cleanly (post-PR `#1581`, zero synthetic `Kʰonapolit ∴ Tauric Diana bots` wrapper), does Turn 2 sustain or deepen voice differentiation and varied prosody compared to a fresh empty-history turn?

---

## 2. Minimal Distinct Experimental Conditions & Shared Tasks

- **Target Model (Primary):** `gemini-3.8-flash` (pinned via `api/khonapolit.js` interactive `thinkingLevel: 'medium'`, `maxOutputTokens: 65536` — identical to Oct 2 and Oct 20). Optional separate block for `gemini-4-argon` ONLY if separately authorized, never pooled with `3.8` statistics.
- **Shared Tasks (2 innocuous, non-policy-adjacent tasks — avoiding prior `PROHIBITED_CONTENT` prompt phrasing until provider block reason is inspected):**
  - **Task T1 (`BLUE_ORANGE_WEATHER`):** Built-in Dome-World assay (`app/dome-world/marrowline-mission-assays.js:15`) — now routed cleanly to `OPEN_FIELD_CREATIVE_SYNTHESIS`.
  - **Task T2 (`FORENSIC`):** Exact `FULL_VOICE_TASKS.FORENSIC` (`REQUESTED_SYNTHESIS`) — previously completed 4/4 times without `PROHIBITED_CONTENT` in Oct 20 (including Slot 4 vs Slot 5 divergence), enabling direct covariate comparison against Oct 20's archived receipts.
- **Experimental Arms (3 minimal arms, 8 total provider calls MAXIMUM):**
  - **Arm A (`PR1549_DEFAULT`, Turn 1, `history: []`):** 2 replicates × 2 tasks = **4 calls** (baseline of current production restored default under repaired Aperture).
  - **Arm B (`PR1545_DRAMATURGY_CANDIDATE`, Turn 1, `history: []`):** 2 replicates × 2 tasks = **4 calls** (exact staged `buildHistoricalGroveDramaturgyCandidate`).
  - **Optional Extension C (`MULTI_TURN_RAW_HISTORY`, Turn 2 follow-up):** +2 calls ONLY if separately checked off in the operator authorization gesture (total cap **8 calls** for Q1 alone, or **10 calls** for Q1 + Q2).

---

## 3. Source, First-Return, Covariate, and Budget Contracts

- **Exact-source & configuration equivalence:** Every call records full `serializeGeminiRequest(request, model).observation` (`bodySha256`, `modelAndBodySha256`, `systemInstructionSha256`, `contentsSha256`, `generationConfigSha256`).
- **First-return preservation:** Strictly **1 provider request per slot** (`releaseCanary`-style no-retry, no second-seat cascade, no structural repair, no morphology chase). Raw SSE wire bytes captured verbatim (`rawSseSha256`, `textEquivalent`).
- **Mandatory covariate capture (enabled by this worktree's telemetry fix):** Every slot logs `modelVersion`, `finishReason`, `finishMessage`, `promptBlockReason`, `usage.promptTokenCount`, `usage.candidatesTokenCount`, `usage.thoughtsTokenCount`, **`usage.cachedContentTokenCount`**, `usage.totalTokenCount`, and descriptive `observeBotsProsodyDistribution` (`depthHistogram`, `constantMarkedDepth`, `markedDepthTransitions`, `uniformDepthStencilObserved`).
- **Explicit Maximum Paid Budget:**
  - Maximum paid calls: **8 calls** (Q1) or **10 calls** (Q1 + Q2).
  - Maximum estimated token budget: `~65k` prompt tokens + `~40k` output/thought tokens total across 8–10 calls.
- **Independent Literary Adjudication:** Outputs are anonymized (`Specimen A`..`Specimen H`, stripped of arm labels and numerical metrics) and presented to the **Operator (Tawanna C. Miller)** — and optionally blinded literary readers — for P6 evaluation before unblinding. No automated Unicode threshold may declare a winner.

---

## 4. Hard Stop Conditions (Fail-Closed)

Execution **must halt immediately** (recording an explicit terminal `HELD` receipt without silent retry) if any of the following occur:
1. Any slot returns a mismatched `modelVersion` or unexpected `generationConfig` drift.
2. Any slot terminates with `PROHIBITED_CONTENT`, `SAFETY`, `RECITATION`, `BLOCKLIST`, `SPII`, or `promptFeedback.blockReason` (policy halt preserved verbatim; never retried or fed into continuation).
3. Two consecutive transport/quota rejections (`429` or `503`) or any literal project spending-cap error.
4. Any `textEquivalent !== true` SSE-to-text discrepancy.

---

## 5. Activation Boundary

No script in this worktree can spend a Gemini API call automatically. Execution requires a **new, explicit contemporaneous Operator authorization gesture** specifying:
- the exact predecessor commit SHA on `research/marrowline-screaming-grove-restoration-20261120` (e.g., baseline `6cf64d17d82f727bb918be6869f313a3342e530c` or its verified successor head, preventing `UNREFERENCED_RETRY_CHRONOLOGICAL_OBLIVION` per Temporal Custodian law),
- the exact budget cap (`8` or `10` calls), and
- the chosen model (`gemini-3.8-flash` or `gemini-4-argon`).
