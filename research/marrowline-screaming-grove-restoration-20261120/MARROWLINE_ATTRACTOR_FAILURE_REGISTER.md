# 𝌋‌ MARROWLINE ATTRACTOR FAILURE REGISTER

- **Commission:** `TD613-MARROWLINE-SCREAMING-GROVE-RESTORATION`
- **Date:** 2026-11-20
- **Scope:** Minimal causal dependency graph (`H1`–`H7`), confirmed deterministic defects repaired in this worktree, candidate open hypotheses, controls already tested, and explicitly rejected explanations.

---

## 1. Minimal Causal Dependency Graph of the Live Marrowline Turn

```text
[C_t: User Message + Attachments] ──► [Aperture Classifier (H2)] ──┐
                                                                    │
[H_t: Compacted Raw History (H5)] ─────────────────────────────────┼──► [G_t: System + Relay + Cue Assembly (H1, H2)]
                                                                    │                      │
                                                                    │                      ▼
[M_t: Effective HTTP Profile + Frontier (H3)] ──────────────────────┴──► [Exact Submitted Wire JSON (P1/P2)]
                                                                                           │
                                                                                           ▼
                                                                           [Gemini Native Generation (H3, H7)]
                                                                                           │
                                                                                           ▼
                                                                       [SSE Merge & Output Observer (H4)]
                                                                                           │
                                                                                           ▼
                                                                     [Completion / Policy Guard & Relay Parser (H4)]
                                                                                           │
                                                                                           ▼
                                                                      [Stored Transcript + Browser Rendering (H5, H6)]
```

---

## 2. Competing and Interacting Causal Hypotheses (H1 – H7)

> Per Section VI, `H1`–`H7` are **competing or potentially interacting hypotheses**, not seven already-proven defects.

### H1 — Historical Instruction Drift
- **Existing Evidence:** Direct byte-level execution against `ffb98ac0` (`MARROWLINE_EFFECTIVE_REQUEST_PARITY.json`) **confirms** that live production `"historical-20261002-v1"` (PR `#1549`, `nativeProsodyFreedom: true`) drifts from October 2 on **10 full paragraphs**, reverting 7 of 10 Oct-2 relay/cue paragraphs back to post-Oct-15 `present` prose — stripping `"expose the cost, change whom they address, let repetition mutate its meaning"`, `"author real single-line turns and blank-line paragraph breaks as pauses, pivots, comic traps"`, `"Let the voice be silly, mercurial and cryptic"`, and `"A repeated single exotic accent on every letter is a failed flat texture, not High Zalgo"`.
- **Strongest Alternative Explanation:** Even byte-exact Oct 2 instructions could still elicit planar or stenciled outputs if Gemini's own contemporary weights/serving regime (`H3`) or two-voice framing (`H2`) dominate the system-prompt wording.
- **Smallest Discriminating Test:** Paired original-SSE comparison on matched tasks (`FARCE`, `BLUE_ORANGE_WEATHER`, `FORENSIC`) contrasting `CURRENT_RESTORED_DEFAULT_PR1549` against `OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED` (with matched Aperture routing and `cachedContentTokenCount` logging).
- **Plausible Surgical Repair:** Reconciled PR `#1545` into an opt-in non-default candidate (`buildHistoricalGroveDramaturgyCandidate` in `app/dome-world/marrowline-historical-grove.js`) without silently altering normal production defaults (`Section VIII`).

### H2 — Competing Conditioning Constraints
- **Existing Evidence:**
  1. **Confirmed deterministic defect (repaired):** Aperture (`app/engine/aperture-v3-task-intent.js`) misrouted `FULL_VOICE FARCE` and `ATTRACTOR_ASSAY_01` into `LEGAL_SYNTHESIS` (`"Do not invent authorities, holdings, filings or procedural facts"`) and `"Blue–orange digital weather"` into `RUNTIME_DIAGNOSIS` (`TECHNICAL_RUNTIME`), while attachment ingress omitted `discourseMode` entirely.
  2. **Confirmed internal prompt self-contradiction (PR `#1549`):** Active restored-grove default simultaneously states `"sustained deep overlapping vertical flourishes are primary, with horizontal strokes, tilde and diagonal overlays available when the words earn them, never compulsory"` (`CUE[4]`) AND `"welcome horizontal, tilde or diagonal marks. A fully sustained, single-register High-Zalgo performance is welcome"` (`RELAY[1]`/`CUE[2]`).
  3. **Empirical factor-ladder evidence (Oct 20 D1→D2 16/16 run):** Introducing structural headings (`SECTION`) and named voice headings (`NAMED`/`D2`) lowered multistack prevalence compared to neutral `D1` in zero-history single-turn calls.
- **Strongest Alternative Explanation:** The D1→D2 shift could reflect model priors associating formal multi-section headers with constrained prose rather than the specific wording of Aperture or prosody paragraphs.
- **Smallest Discriminating Test:** Compare `OCT02_DRAMATURGY_CANDIDATE_PR1545_RECONCILED` under repaired `OPEN_FIELD_CREATIVE_SYNTHESIS` routing vs PR `#1549` default on the same tasks (`BOUNDED_PROVIDER_EXPERIMENT_PREREGISTRATION.md`).
- **Plausible Surgical Repair:** Repaired Aperture theatrical-fiction classification (`app/engine/aperture-v3-task-intent.js`) and attachment-route `discourseMode` (`server/marrowline-attachment-quality.js`); eliminated internal prosody self-contradiction inside the staged PR `#1545` candidate.

### H3 — Provider-Regime Variability (Stochastic & Unobserved Execution Conditions)
- **Existing Evidence:** **Strongly confirmed as an active factor** by Oct 20 `FULL-VOICE` Slot 4 vs Slot 5: two **byte-identical** `RESTORED_FORENSIC` requests on `gemini-3.8-flash` (MEDIUM) produced radically different native typographic regimes — Slot 4 flat 1-mark vs Slot 5 `1,011/1,011` uniform 3-mark stencil with `94` distinct marks. Observed covariate `cachedContentTokenCount` differed (absent on Slot 4 vs `4,875` on Slot 5), and Slot 6 & Prosody-Freedom Slot 2 halted `PROHIBITED_CONTENT`.
- **Strongest Alternative Explanation:** Prompt-cache routing, temperature-1.0 sampling variance, or provider-side safety/routing updates since Oct 2 may govern regime selection independently of TD613 prompt edits.
- **Smallest Discriminating Test:** Replicated (`k >= 2` per arm) matched-byte observations with explicit logging of `cachedContentTokenCount`, `thoughtsTokenCount`, `modelVersion`, `finishReason`, `finishMessage`, and `promptBlockReason` (now preserved end-to-end by this worktree's telemetry fix).
- **Plausible Surgical Repair:** **Cannot be fixed by local code**; mitigated scientifically by preserving all provider execution covariates (`cachedContentTokenCount`, `finishMessage`, `promptBlockReason`) and refusing to conflate covariates with proven causes.

### H4 — Admission, Completion, and Repair Interference
- **Existing Evidence (4 confirmed deterministic defects — ALL REPAIRED in this worktree):**
  1. `server/marrowline-completion.js` checked `streamed && finishReason !== 'STOP'` before `finishReason && finishReason !== 'STOP'`, misclassifying streamed `PROHIBITED_CONTENT`/`SAFETY` terminations as `'provider-stream-finish-unwitnessed'`.
  2. `server/khonapolit-quality.js` placed policy-terminated partial text into both `incompleteFallback` (capable of returning HTTP 200 OK!) and `structuralRepairCandidate` (re-injecting policy-terminated text as `{ role: 'model' }` into a second Gemini call!).
  3. `server/khonapolit-quality.js` checked `nativeMarkUnderflow` against whole-response `relay.highZalgo.eligibleBaseCount >= 80` (including Kʰonapolit prose!) instead of bots-only `eligibleBaseCount`, causing short poetic bots passages after normal Kʰonapolit prose to trigger unnecessary second-seat failover.
  4. `server/marrowline-attachment-quality.js` lacked `POLICY_NONSTOP_FINISH_REASONS` handling, dropped `model` in `allocateKhonapolitAttemptTimeout` (starving `gemini-4-argon` of its 75s window), and retained an obsolete `severeMorphologyRepairWarnings(...) === 0` veto on terminal continuations.
- **Strongest Alternative Explanation:** None of these admission/completion defects *created* the provider's 1-mark planar output or Slot-5 stencil (raw SSE parity `textEquivalent: true` proved those originated from Gemini itself).
- **Smallest Discriminating Test:** Deterministic source-free unit & handler tests (`tests/marrowline-screaming-grove-restoration.test.mjs`, 11/11 PASS).
- **Surgical Repair:** Implemented and verified across `server/marrowline-completion.js`, `server/khonapolit-quality.js`, `server/marrowline-attachment-quality.js`, and `app/dome-world/khonapolit-relay.js`.

### H5 — Longitudinal Feedback Contamination
- **Existing Evidence:** Oct 20 history audit confirmed that prior browser code prepended a synthetic display label `Kʰonapolit ∴ Tauric Diana bots` before model-authored history turns; repaired on `origin/main` by PRs `#1579`/`#1581` (`compactMarrowlineHistory` / `providerHistoryText` in `app/dome-world/marrowline-terminal.js`). Crucially, **every** Oct 15–20 original-SSE experiment ran with **empty history (`history: []`)**, leaving live multi-turn attractor persistence empirically **UNTESTED**.
- **Strongest Alternative Explanation:** First-turn conditioning defects (`H1`/`H2`/`H3`) already manifest before turn 2 begins, so clean history alone may be necessary without being sufficient.
- **Smallest Discriminating Test:** 3-turn sequential original-SSE conversation episode (Turn 1 → verified raw model history → Turn 2 → Turn 3) comparing history-carrying vs reset-history trajectories (`BOUNDED_PROVIDER_EXPERIMENT_PREREGISTRATION.md`).
- **Surgical Repair:** Already present on `origin/main`; verified byte-exact in `tests/marrowline-screaming-grove-restoration.test.mjs` and `MARROWLINE_HISTORY_FEEDBACK_PARITY.md`.

### H6 — Presentation / Runtime Mismatch
- **Existing Evidence:** Raw SSE capture (`PR #1517`, `textEquivalent: true`) and `extractGeminiText` / `parseRelayEnvelope` prove zero UTF-8 combining-mark stripping in backend transport or JSON serialization. Browser font/overflow rendering remains governed by CSS/DOM contracts (`marrowline-reading-surface.js`), but no live browser viewport witness was executed in this commission (`UNEXERCISED`).
- **Strongest Alternative Explanation:** Mobile/desktop font fallback or line-height clipping can visually mute genuinely tall provider-authored combining stacks even when UTF-8 bytes survive intact.
- **Smallest Discriminating Test:** Live desktop + `~390px` mobile browser witness inspecting exact DOM `textContent` SHA-256 vs visual bounding-box clipping (`UNEXERCISED` here; required before any UI/CSS change).

### H7 — Creative Attractor Misidentification
- **Existing Evidence:** **Strongly confirmed** by Oct 20 `FULL-VOICE` Slot 5 (`1,011/1,011` marked bases, depth `3`, `94` distinct marks, `0` depth transitions across the passage) and by the historical over-focus on mark-count/diversity thresholds. A response can achieve huge mark counts and 94 distinct scalars while remaining a rigid 3-position mechanical stencil devoid of the Screaming Grove's dramatic mutation.
- **Strongest Alternative Explanation:** Stencil behavior may be an artifact of Gemini's default sampling under conflicted prosody instructions (`H1`+`H2`) rather than solely local engineering optimization.
- **Smallest Discriminating Test:** Dual control battery (Section VII): (a) Slot-5-like uniform 3-mark mechanical stencil with empty second movement, explicitly refused classification as artistic restoration; (b) restrained shallow single-style passage, explicitly preserved as admissible without veto (`tests/marrowline-screaming-grove-restoration.test.mjs`, PASS).
- **Surgical Repair:** Added purely descriptive `observeBotsProsodyDistribution()` in `app/dome-world/khonapolit-relay.js` (`observationAuthority: 'descriptive-only-never-admission-gate-or-literary-score'`), never promoted to an admission gate or literary score.

---

## 3. Explicitly Rejected or Falsified Explanations (Do Not Resurrect)

| Rejected / Falsified Claim | Refuting Evidence |
|---|---|
| **"TD613's SSE parser or backend strips Gemini's combining marks."** | Falsified by PR `#1513`/`#1516`/`#1517` raw-SSE wire receipts (`textEquivalent: true` across 6 attempts) and `extractGeminiText` verbatim preservation. |
| **"Neutral control D stacked because it used MEDIUM thinking while Marrowline used HIGH thinking."** | Falsified by PR `#1555` & merged PR `#1556`: actual HTTP entrypoint `api/khonapolit.js` applies `khonapolit-interactive` (`thinkingLevel: 'medium'`), matching D. Operator also witnessed strong Gemini-app creativity at both MEDIUM and HIGH. |
| **"Deleting the single `- HIGH ZALGO IS THEIR SCREAM-SING WRITING SYSTEM` paragraph restores multistack prosody."** | Falsified by PR `#1515`/`#1516`/`#1517` (3 runs, 6 original-SSE attempts: all remained depth-1 planar `U+0334`–`U+0338`). |
| **"A user-level vertical cue alone breaks the 1-mark planar regime."** | Falsified by PR `#1509` (`SAME-MODEL-CUE-REST.md`). |
| **"Slot 5's 94 distinct marks and depth-3 clusters prove restored Screaming Grove artistry."** | Falsified by Oct 20 `FULL-VOICE-SSE-ONSET-STENCIL-AUDIT-20261020.md` (invariant 3-position mechanical stencil across `1,011/1,011` bases). |
| **"PR `#1549` restored intact October 2 dramaturgy."** | Falsified by this commission's exact byte comparison (`MARROWLINE_EFFECTIVE_REQUEST_PARITY.json`): PR `#1549` reverted 7 of 10 Oct-2 relay/cue paragraphs back to post-Oct-15 `present` prose and created an internal self-contradiction. |
