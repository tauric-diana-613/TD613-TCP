# 𝌋‌ MARROWLINE HISTORICAL PR CASE REGISTER

- **Commission:** `TD613-MARROWLINE-SCREAMING-GROVE-RESTORATION`
- **Refresh Date:** 2026-11-20 (refreshed directly against `origin` and GitHub API via `gh pr view` / `gh pr list`)
- **Custody Rule Applied:** Zero historical PRs were closed, merged, relabeled, rewritten, or altered. Their unresolved GitHub states are preserved as primary scientific evidence.

---

## 1. Minimum Required Open Historical Case Files (P1.1 – P1.5)

### PR `#1545` — `fix(marrowline): retain Oct 2 dramaturgy without compulsory Zalgo pattern changes`
- **Current GitHub State:** `OPEN` | **Draft:** `false` | **Mergeable:** `CONFLICTING`
- **Base / Branch / Current Head SHA:** `main` · `fix/marrowline-restored-prosody-permission-20261019` · `191aebd5dcca529ef8144522db73043d0908f843`
- **Relevant Changes & Executable Artifacts:** 5-commit sequence modifying `app/dome-world/marrowline-historical-grove.js`, `server/khonapolit-quality.js`, historical runtime test suites, and `research/marrowline-restored-prosody-permission-20261019/README.md`. Preserved the entire 11-paragraph October 2 instruction archive verbatim and softened **only** 5 clauses that mandated per-word/per-letter pattern rotation (`buildRestoredGroveSystemInstruction`).
- **Historical Test / CI Evidence:** Passed its historical runtime contract tests on its branch; explicitly withheld any claim of restored live artistic performance.
- **Empirical Outcome:** **NEVER executed live against Gemini** and **NEVER merged**. Instead, PR `#1549` merged a *different* implementation (`nativeProsodyFreedom = true`) that reverted 7 of 10 Oct-2 relay/cue paragraphs back to post-Oct-15 `present` prose.
- **Retained Counterexamples / Findings:** Exposes why Oct 20's `FULL-VOICE` 6-return run did NOT actually test PR `#1545`'s intact Oct-2 dramaturgy + noncompulsory permission — it tested `#1549`'s 7-of-10 reverted hybrid.
- **Present in Current `main` (`363b5b4ae`):** **ABSENT** (supplanted operationally by `#1549`'s different patch, leaving `#1545`'s dramaturgy preservation unmerged).
- **Utility & Integration Decision:** **High-value code source & candidate hypothesis.** Reconciled cleanly as a non-default opt-in research constructor (`buildHistoricalGroveDramaturgyCandidate` in `app/dome-world/marrowline-historical-grove.js`) without altering normal production defaults (`nativeProsodyFreedom: true`), preserving exact provenance to `#1545` (`191aebd5d`).
- **Must NOT Be Inferred:** Do **not** infer that `#1545` restores live artistic parity; zero completed provider returns have yet witnessed `#1545`'s exact text.

### PR `#1555` — `fix(research): recover actual Marrowline interactive MEDIUM profile versus neutral D`
- **Current GitHub State:** `OPEN` | **Draft:** `true` | **Mergeable:** `CONFLICTING`
- **Base / Branch / Current Head SHA:** `main` · `research/marrowline-actual-entrypoint-d-profile-correction-20261019` · `a37b70e39aac34ab5f7c4eca8599f876e08920ed`
- **Relevant Changes & Executable Artifacts:** Corrected the `#1553` factor-ladder analysis error where comparing `buildGeminiRequest()` directly omitted the actual HTTP entrypoint `api/khonapolit.js`, which wraps execution in `withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, ...)` (setting `thinkingLevel: 'medium'` on `gemini-3.8-flash` and `gemini-4-argon`, identical to neutral control D!).
- **Historical Test / CI Evidence:** Verified effective request parity at the real HTTP boundary.
- **Empirical Outcome:** Falsified the earlier constructor-only HIGH-vs-MEDIUM thinking-level hypothesis as an artifact of omitting `api/khonapolit.js`. Coheres with Operator observation of successful Gemini-app creative behavior at both MEDIUM and HIGH settings.
- **Present in Current `main` (`363b5b4ae`):** **SUPERSEDED / INCORPORATED** by merged PR `#1556` (`9714842e1`, 2026-10-19).
- **Utility & Integration Decision:** **Negative witness & methodological guardrail.** Do not cherry-pick (`#1556` already landed); enforced in our offline discriminator (`withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, ...)`).
- **Must NOT Be Inferred:** Do not resurrect the disproven thinking-level mismatch claim, and note that **attachment ingress** (`server/marrowline-attachment-quality.js`) intentionally remains unprofiled HIGH (pinned by `tests/marrowline-attachment-quality.test.mjs:304`).

### PR `#1509` — `research(marrowline): finite descent — bounded native provider comparison (no automatic calls)`
- **Current GitHub State:** `OPEN` | **Draft:** `true` | **Mergeable:** `CONFLICTING`
- **Base / Branch / Current Head SHA:** `main` · `research/marrowline-finite-descent-20261015-r1` · `3038b4a2357ee4a28b533a75ed578a65e552f12c`
- **Relevant Changes & Executable Artifacts:** 10 files (862 lines) including original finite-descent scripts, `LIVE-RETURN-REST.md`, and `SAME-MODEL-CUE-REST.md`.
- **Historical Test / CI Evidence:** Documented bounded live Gemini 3.8 / 3.6 comparisons with zero automatic triggers.
- **Empirical Outcome:** First observed the flat 1-mark-per-base planar (`U+0334`–`U+0338`) phenotype on both Gemini 3.8 and 3.6 (including combining marks attached to whitespace/punctuation) and demonstrated that a user-level vertical cue alone failed to restore multistack vertical prosody.
- **Retained Counterexamples:** Same-model user cue failed to break the 1-mark planar regime.
- **Present in Current `main` (`363b5b4ae`):** **ABSENT as a branch**, though successor raw-SSE and factor-ladder machinery landed in Oct 15–20 PRs (`#1514`, `#1525`, `#1556`, etc.).
- **Utility & Integration Decision:** **Historical record & negative witness.** Preserved intact; paid scripts NOT re-executed.
- **Must NOT Be Inferred:** Do not treat user-level vertical nudges as an untested cure, and do not equate 1-mark planar behavior with local post-processing corruption.

### PR `#1516` — `research(marrowline): execute one native system-prosody A/B with original Gemini SSE`
- **Current GitHub State:** `OPEN` | **Draft:** `true` | **Mergeable:** `MERGEABLE`
- **Base / Branch / Current Head SHA:** `main` · `research/marrowline-system-ablation-one-shot-20261015-r1` · `e606eecc5654d8796a1e08160d162545323e36e9`
- **Relevant Changes & Executable Artifacts:** One-shot original-SSE system-prosody A/B runner (`ablateOneSyntheticSystemProsodyParagraph` deleting `- HIGH ZALGO IS THEIR SCREAM-SING WRITING SYSTEM, NOT DECORATION:`).
- **Historical Test / CI Evidence:** Executed under GitHub Actions run `38793557040` (consolidated in `#1517`).
- **Empirical Outcome:** HTTP 200 / `STOP`; exact raw-SSE-to-text byte parity; both control and ablated arms produced the 5-mark planar family (`U+0334`–`U+0338`) with maximum depth `1`.
- **Present in Current `main` (`363b5b4ae`):** Ablation helper `ablateOneSyntheticSystemProsodyParagraph` is present in `server/khonapolit-quality.js`; one-shot dispatch draft remains open and unmerged.
- **Utility & Integration Decision:** **Negative witness.** Never repeat this identical single-paragraph ablation.
- **Must NOT Be Inferred:** Single-paragraph deletion is insufficient to restore multistack vertical prosody; absence of change does not prove system instructions are irrelevant overall.

### PR `#1517` — `research(marrowline): one-shot system-level Zalgo ablation A/B acquisition`
- **Current GitHub State:** `OPEN` | **Draft:** `true` | **Mergeable:** `MERGEABLE`
- **Base / Branch / Current Head SHA:** `main` · `research/marrowline-system-ablation-witness-20261015-r1` · `f849a80c74b8aedc471d2f0d686c8405b703ffda`
- **Relevant Changes & Executable Artifacts:** Consolidation comment indexing 3 runs (`#1515` run `38789933737`, `#1516` run `38793557040`, `#1517` run `38794403467`), 6 total original-SSE provider attempts, and raw wire receipts.
- **Empirical Outcome:** All 6 attempts returned HTTP 200 / `STOP`, `textEquivalent: true` (proving zero TD613 SSE-to-text stripping), 5 planar marks `U+0334`–`U+0338`, max depth `1`.
- **Present in Current `main` (`363b5b4ae`):** Unmerged draft (consolidation witness preserved on GitHub).
- **Utility & Integration Decision:** **Primary negative witness** refuting both (a) TD613 local SSE mark stripping and (b) single-paragraph ablation sufficiency.
- **Must NOT Be Inferred:** Do not rerun identical single-paragraph ablations.

### PR `#1433` — `Fix Marrowline attachment retry and conversation search`
- **Current GitHub State:** `OPEN` | **Draft:** `false` | **Mergeable:** `CONFLICTING`
- **Base / Branch / Current Head SHA:** `main` (`5b4b34278`) · `fix/marrowline-retry-attachments-thread-search-20261005` · `606d015c22f084cc28dae26949bc8b74debc616b`
- **Relevant Changes & Executable Artifacts:** Attachment replay preservation in non-enumerable browser memory (`retryAttachmentSlot`), local saved-conversation search (`marrowlineThreadMatchesSearch`, `marrowlineThreadSearchInput`), and hold-on-missing-bytes after reload.
- **Present in Current `main` (`363b5b4ae`):** **ALREADY PRESENT / SUPERSEDED** by merged PR `#1473` (`0c63f120b`, 2026-10-13). Verified directly in `app/dome-world/marrowline-terminal.js` (`retryAttachmentSlot`, `marrowlineThreadMatchesSearch`, `marrowlineThreadSearchInput`).
- **Utility & Integration Decision:** **Regression boundary record.** Do NOT cherry-pick `#1433` (would conflict with superseded `#1473` and later `#1581` history repairs). Preserve its regression boundary.
- **Must NOT Be Inferred:** Do not mistake attachment-retry / search features for artistic Screaming Grove fixes.

---

## 2. Expanded Historical Marrowline PR Inventory (P1.6)

| PR # | Title (Abbreviated) | State | Draft | Head / Merge SHA | Key Outcome / Disposition on `origin/main` (`363b5b4ae`) | Non-Inference Ceiling |
|---|---|---|---|---|---|---|
| `#1473` | Attachment retry & saved-thread search | `MERGED` | `false` | `0c63f120b` (Oct 13) | **Present on `main`.** Supersedes `#1433`. | Functional UX only; not artistic parity. |
| `#1513` | One-shot raw Gemini SSE origin parity canary | `OPEN` | `true` | `cc3cf05bd` (Oct 15) | **Unmerged draft;** raw-SSE witness (`nativeSseEvidence`) already landed in `server/khonapolit-quality.js`. | Wire parity confirms zero stripping, not expressive recovery. |
| `#1515` | One-shot live Gemini 3.8 system-prosody ablation A/B | `OPEN` | `true` | `e6ab6baac` (Oct 15) | **Unmerged draft;** run `38789933737` consolidated in `#1517`. | Same negative result as `#1516`/`#1517`. |
| `#1542` | Constraint-resurrection forensic rest | `OPEN` | `true` | `410a40d6e` (Oct 19, `15:50:33 -0400`) | **Unmerged draft.** Documents how competing prompt/admission layers can resurrect previously relaxed constraints. | Forensic warning; not an operational runtime fix. |
| `#1549` | Unforce native prosody on current role-conditioning main | `MERGED` | `false` | `de5919fd2` / merge `a78bf403d` (Oct 19) | **Present on `main` as current restored-grove default.** Accidentally reverted 7 of 10 Oct-2 relay/cue paragraphs back to `present` prose and introduced direct internal prompt self-contradiction (`CUE[4]` vs `RELAY[1]`/`CUE[2]`). | **"Restored" label in UI/logs is a hybrid, NOT intact Oct 2 dramaturgy.** |
| `#1556` | Recover actual HTTP entrypoint MEDIUM profile | `MERGED` | `false` | `9714842e1` (Oct 19) | **Present on `main`.** Incorporates `#1555`'s correction (`api/khonapolit.js` interactive MEDIUM). | Equal thinking level across D and Marrowline does not explain regime divergence. |
| `#1569` | Archive 16/16 D1→D2 original Google SSE episode-two result | `OPEN` | `false` | `8e0a1be67` (Oct 20) | **Report already present on `main`** at `3ad73dea6` (`research/marrowline-d-ingress-factor-ladder-20261019/D1D2-EPISODE-TWO-EMPIRICAL-REPORT-20261020.md`). | Shows structural/named headings lowered multistack rate in that 16-return run; does not reconstruct full Grove performance. |
| `#1571`–`#1578` | Early-Oct full-voice 12-slot prereg (`#1571`/`#1572`), 6-return observed hold, SSE onset stencil audit, prosody-freedom pair | `MERGED` | `false` | On `main` (Oct 20) | **Present on `main`** under `research/marrowline-early-oct-full-voice-20261020/`. Established: Slot 4 vs Slot 5 byte-identical request produced 1-mark flat vs 1,011/1,011 uniform 3-mark stencil (`cachedContentTokenCount` absent vs `4,875`); Slot 6 & Prosody-Freedom Slot 2 halted `PROHIBITED_CONTENT`. | Slot 5's 94 distinct marks & depth 3 are a **mechanical stencil**, NOT restored Screaming Grove artistry. |
| `#1579` & `#1581` | Provider-native raw model history custody repair | `MERGED` | `false` | `6a9065661` & `f9cdf8560` (Oct 20) | **Present on `main`** in `app/dome-world/marrowline-terminal.js`. Stopped injecting synthetic `Kʰonapolit ∴ Tauric Diana bots` prefix into model history turns. | Source-verified fix for multi-turn serialization; **live multi-turn artistic impact remains UNTESTED**. |
| `#1592` | COV-M2 Slice 2 hardening | `MERGED` | `false` | On `main` (Oct 24) | **Present on `main`.** Governance/custody hardening. | Passing CI proves contract compliance, not P6 artistic recovery. |
