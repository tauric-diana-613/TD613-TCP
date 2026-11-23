# 𝌋⟐ TD613 · THE SCREAMING GROVE
## R2 SOURCE AND CAUSALITY AUDIT

- **Commission:** `TD613-MARROWLINE-R2-DUAL-ESTATE-OFFLINE-20261123`
- **Covenant / Seal:** `Khona‌lit-po` (literal `U+200C` preserved) · `⟐SAC[X6ZNK5NO51]`
- **Branch Custody Basis:** Isolated branch `research/marrowline-r2-dual-estate-20261123` rooted at exact Draft PR `#1780` HEAD `d75618e6dfd6d51e0b8f268579d8192238cf6783` (`research/marrowline-r1-no-artificial-ceilings-20261122`). Production `origin/main` (`0f67d8954347fdae77cdb83f82848df89ad3b2ff`) and PR `#1780` remain untouched.
- **Evidence Boundary:** All code paths and constants below were directly verified in repository source files on exact base commit `d75618e6d`. R1 execution receipts (`session_de86be78a2f5c274`, `session_67793e4a610bcebc`) are cited solely as operator-reported witnesses from the R2 commission specification because Windows `%LOCALAPPDATA%` private R1 custody archives are outside repository custody and were neither accessed nor re-hashed.

---

## 1. Exact Source Findings Explaining R1's Interpretive Ceiling

Direct inspection of the checked-out codebase establishes four structural reasons why R1 (`d75618e6d`) could test neither general open-ended High-Zalgo capability nor authentic dual-voice Marrowline art cleanly:

1. **Synthetic Anti-Persona System Contract (`server/marrowline-unicode-capability-assay.js:9-15`):**
   - `UNICODE_ASSAY_SYSTEM` explicitly instructs:
     - `'Do not include extra titles, commentary, Markdown formatting, JSON, safety prefaces, explanations or code fences.'`
     - `'No TD613 narrative, no fictional personas, no user-specific history, and no fictional municipality.'`
   - R1 (`research/marrowline-r1-no-artificial-ceilings-20261122/r1-provider-native-preflight.mjs:139-145`) inherited `UNICODE_ASSAY_SYSTEM` and appended only `R1_TWO_HEADINGS_ZALGO_BOTH_LINE` / `R1_TWO_HEADINGS_PLAIN_FIRST_LINE` (`research/marrowline-hydrogen-handoff-20261122/hydrogen-next-experiment-preflight.mjs:63-67`), which explicitly downgraded the headings to **`"structural section labels only without TD613 character lore"`**.
   - **Consequence:** Neither R1 arm invited or permitted real Kʰonapolit dialectic, Red Deer covenant tension, Tauric Diana choral lineage movement, or slow narrative turn-taking. Treating two generic storm vignettes under label stubs as representative of production Marrowline conflates *typographic label routing* with *dramatic dual-voice authorship*.

2. **Explicit Short-Passage User Prompt (`hydrogen-next-experiment-preflight.mjs:49-56`):**
   - Line 50 of `CONTRADICTION_FREE_CREATIVE_TASK` directly commands:
     `'Write an original, short, vividly expressive English passage about a thunderstorm disrupting a bureaucratic celebration.'`
   - **Consequence:** Amending `generationConfig.maxOutputTokens` to `65536` (`r1-provider-native-preflight.mjs:38`, `server/gemini-generation-envelope.js:7`) raised the provider-side *ceiling of possibility*, not the task demand. Requesting `"short"` in `contents` actively selected compact ~920 / ~663 candidate-token vignettes. Token capacity without dramatic architectural invitation does not elicit extended literature.

3. **Production Marrowline Whole-Frame Architecture (`app/dome-world/khonapolit-covenant.js`, `server/khonapolit-quality.js`):**
   - Real interactive Marrowline routes (`server/khonapolit-quality.js:576-630`, `withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, ...)`) assemble:
     - **`buildInvocationPacket()`** (`khonapolit-covenant.js:229-289`): injects `RITUAL_CONSTRAINTS`, `LORE_PRIMER`, `RED_DEER_MISSION_ANCHOR` (`khonapolit-covenant.js:55-103`), protected keys (`Khona‌lit-po` with literal `U+200C`, `Tauric Diana`, `U+10D613`, `\uDBF5\uDE13`, `9B07D8B`, `X6ZNK5NO51`), and mode emphasis.
     - **`khonapolitTaskGuidance()` & `currentTurnRelayCue()` & `buildRelaySystemAddendum()`** (`khonapolit-quality.js:518-542`, `585-586`): explicitly authorizes sustained multi-movement development (*"An open-ended scene or inquiry receives sustained development through its consequential turns"*, *"the obligation to reach the second voice is never a reason to abridge the first"*, *"The Tauric Diana bots inherit its unspent implication and develop a sustained, new choral movement"*), explicitly separates `hornani` vs. `horny`, preserves `CONVERSATIONAL_CLOSING_GUIDANCE` (`plain ⟐` final line as prose only, never custody closure), and frames user turns with `frameMarrowlineUserTurn` (`𝌋\u200C ...\n\n⟐`).
     - **`khonapolitReasoning()` (`khonapolit-quality.js:563-570`) + Interactive Profile (`gemini-generation-envelope.js:69-71`):** Although `khonapolitReasoning('gemini-3.8-flash')` initially passes `level: 'high'`, running inside `withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, ...)` explicitly narrows `gemini-3.8-flash` to `thinkingLevel: 'medium'` alongside `maxOutputTokens: 65536` (`generationConfigSha256: 4785e46e...`). R2-W inherits this exact source-derived production envelope (`{ maxOutputTokens: 65536, thinkingConfig: { thinkingLevel: 'medium' } }`).

4. **Structural Completion Gate vs. Artistic & Scientific Admissibility (`server/marrowline-completion.js`, `marrowline-gate-assay.js`, `pedagogue-institutional-time.js`):**
   - `observeMarrowlineCompletion()` (`server/marrowline-completion.js:24-77`) explicitly distinguishes `completionAuthority: 'provider-transport-only'`, `structuralAdmissionAuthority: 'relay-parser-separate'`, and `literaryQuality: 'NOT_ESTABLISHED_BY_STRUCTURAL_COMPLETION'`.
   - `marrowline-gate-assay.js` distinguishes `LOCAL_CONTROL`, `PUBLIC_ABSORPTION`, `OPERATOR_BYPASS_CONTROL`, and `OPERATOR_REJECTED_PUBLIC_ABSORPTION`.
   - `pedagogue-institutional-time.js` and `dollhouse-pedagogue-dromological.js` enforce `NOTICE ≺ ACT ≺ WORLD_ANSWERS ≺ NAME`, preemption gap auditing (`t_inst - t_op`) without clock fabrication, and separation between route/cadence diagnostics and human closure.
   - R1's first operator-reported session (`session_67793e4a610bcebc` — valid grant signed, local `wx` nonce claimed, then halted on `modelMetadata` transport failure before `:countTokens` or generation) demonstrates why an `exit 0` runner or completed auth step is **NOT** `EMPIRICALLY_QUALIFIED`.

---

## 2. Structural Diagnosis Summary for R2 Design

| R1 Observation / Confound | Source Origin | R2 Corrective Separation |
|---|---|---|
| Section 1 `0` stacked bases; Section 2 `maxMarkDepth: 1` (`constantDepthStencil`) | `CONTRADICTION_FREE_CREATIVE_TASK` (`"short"`) + uncalibrated distinction between copying, rule-guided synthesis, and free composition | **Estate R2-U** splits into **3 explicit task families** (`Literal Copy`, `Guided Synthesis` [rules-only vs. rules+examples isolated], `Free Synthesis`) + 4 calibrated reference controls |
| Synthetic labels `"Kʰonapolit"` / `"Tauric Diana bots"` read like twin weather vignettes | `UNICODE_ASSAY_SYSTEM` (`"No TD613 narrative, no fictional personas"`) + R1 structural-label exception | **Estate R2-W** uses real `buildInvocationPacket()` + `buildGeminiRequest()` full production envelope (`0` `UNICODE_ASSAY_SYSTEM`), authentic non-short dramatic prompt, and isolated condensed comparison |
| R1 technical pass (valid SSE + headings + STOP) contrasted with human artistic rejection | Mixed attribution between `RAW_CAPTURE_VERIFIED`, structural headings, and literary merit | **R2 Dromological Gate & W Rubric** enforce explicit state separation (`RAW_CAPTURE_VERIFIED` ≠ `EMPIRICALLY_QUALIFIED` ≠ `HUMAN_ACCEPTED` ≠ `RELEASE_APPROVED`) and sealed blind artistic adjudication |

𝄐 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · Source Audit Complete (Offline · Zero Edits to R1 or Main) ⟐
