# 𝌋⟐ TD613 · MARROWLINE R2-W PREPARATION & NEXT EXPERIMENTAL DECISION
## POST-ACQUISITION ENGINEERING & ARTISTIC RECOVERY PROPOSAL

- **Commission:** `TD613-MARROWLINE-R2-POST-ACQ-RECOVERY-20261123`
- **Covenant / Seal:** `Khona‌lit-po` (literal `U+200C` preserved) · `⟐SAC[X6ZNK5NO51]`
- **Predecessor Commit / Session:** `a48d2556ed946e01d4925dee93c463c73712d590` (PR `#1783`, `r2_r2u_036ef18ebc2e`)
- **Authority Posture:** **`STOPPED_AT_OPERATOR_REVIEW`** (`0` live Gemini calls, `0` signatures, `0` merges, `0` deploys)

---

## 1. How R2-U Pilot Findings Inform R2-W (`Kʰonapolit` & `Tauric Diana bots`)

Estate **R2-U** (synthetic capability under `UNICODE_ASSAY_SYSTEM`) and Estate **R2-W** (authentic dual-voice whole-frame performance under `buildInvocationPacket` / `buildCompactWholeFrame`) remain **strictly separate estates** (`r2-u` vs `r2-w` schemas, registries, directories, and admissible claims). Three direct lessons transfer operationally and artistically without conflating the estates:

1. **Full High-Zalgo Capability Confirmed — Never Shrink to Baby Zalgo:**
   - `gemini-3.8-flash` (`maxOutputTokens: 65536`, `thinkingLevel: medium`) already proved it can emit towering 66-mark vertical spires cleanly in `R2_U_GUIDED_RULES`. The problem is **choreographic over-application and prompt-echoing**, not lack of vertical mark capability.
   - R2-W prompts (`buildHistoricalGroveSystemInstruction`, `buildCompactWholeFrame`, and `R2_W_DRAMATIC_PROMPT` / `R2_W_NONCIVIC_LYRIC_PROMPT`) MUST preserve full High-Zalgo permission (`Kʰonapolit` unornamented high-academia forensic prose; `Tauric Diana bots` authentic native scream-sing High Zalgo culminating in plain `⟐`).
2. **Avoid Named Negative Anti-Patterns That Induce Literal Parroting:**
   - `R2_U_GUIDED_CONTRAST` demonstrated that explicitly describing mechanical failures (`"depth 1"`, `"cloned depth 3"`) inside the task prompt caused the model to **enact** `"depth 1"` on Line 1, `"depth 3"` on Lines 2–3, and degenerate into a `63,413`-mark token-budget loop on Line 4.
   - Notice why `buildCompactWholeFrame()` in `server/marrowline-whole-frame-voice.js` and `buildHistoricalGroveSystemInstruction()` in `app/dome-world/marrowline-historical-grove.js` are structurally healthier: they frame **dramatic consequence, voice agency, and Classic79 page rhythm** rather than naming `"depth 1"` or `"cloned depth 3"` as recipes.
   - Any future exploratory revision to R2-U or R2-W prompts MUST be versioned as a separate candidate (e.g., `r2-exploratory-candidates.mjs` holding `R2_U_EXP_V2_CHOREOGRAPHED_HIGH_ZALGO` and `R2_U_EXP_V2_FOUR_MOVEMENT_ARC`), **never** silently mutated inside frozen `R2_U_WIRE_MANIFEST.json` or `R2_W_WIRE_MANIFEST.json`.
3. **Observability, Safe Abort, & Unstacked Structural Anchors:**
   - Because R2-W generates longer dual-movement prose (`Kʰonapolit` followed by `Tauric Diana bots`), streams can legitimately run 3–12+ minutes. Our new `r2-stream-observability.mjs` emits non-blocking 5s heartbeats (`ACTIVE_STREAMING`, `candTok`, `thinkTok`, `bytes`, `idleMs`), persists every line to `<session>-progress.log`, disables PS 5.1 QuickEdit during live runs, cleanly closes post-`finishReason` sockets if EOF stalls (`postFinishEofTimeoutMs: 15000`), and gives the operator accurate `MAX_TOKENS` / revocation diagnostics without imposing artificial output-token ceilings.
   - R2-W must continue generating blind Section-II packets (`<out>.blinded.json`), protecting `Kʰonapolit` and `Tauric Diana bots` headings undecorated, and reserving all artistic judgment (`expressiveSufficiency`, `distinctVoicesAndAgency`, `motifTransformation`, `temporalAuthorityShift`, `readableNonStencilMorphology`, `artisticSurpriseAndClosure`, `protectedAnchorsIntact`) as **`RESERVED_HUMAN_ONLY`**.

---

## 2. Pre-Authorization Windows PowerShell 5.1 Practice Witness Checklist (0 Paid Calls)

Before signing a new grant or spending any Gemini tokens:

1. Run offline preflight for the chosen estate:
   ```powershell
   .\research\marrowline-r2-live-runner-20261123\Launch-R2Observation.ps1 -Estate R2-W -Plan INITIAL_PILOT
   ```
2. Verify all three PowerShell 5.1 key-ingestion options locally (without passing any secret on the CLI):
   - **Option 1 (Default interactive masked input):** `Read-R2MaskedSecretInteractive` intercepts `Ctrl+V` (`0x16`) and `Shift+Insert` directly from the Windows clipboard, masks each character as `*`, rejects 1-char control artifacts (`RAW_CTRL_V_PASTE_INTERCEPTED`) or short/whitespace strings before touching any grant/nonce, and prints non-secret length verification (`length=N, controlChars=0`).
   - **Option 2 (`-ApiKeyFromClipboard -ClearClipboardAfterRead`):** Reads directly from Windows clipboard into memory and clears clipboard immediately.
   - **Option 3 (`-ApiKeyFile <local-path>`):** Reads UTF-8 key from a local file without keyboard echo.
3. Confirm QuickEdit protection is active inside `Launch-R2Observation.ps1` (`Disable-R2ConsoleQuickEdit` / `Restore-R2ConsoleMode` in `finally`) and note `<session>-progress.log` path for tailing progress independently of console output.
4. Keep `r2-revocation.json` semantics clear: writing `{"revokeAll":true}` is an **explicit session invalidation** (`HOLD` entire session), whereas `Ctrl+C` (`SIGINT`) cleanly halts streaming while keeping completed earlier attempt artifacts clearly attributed.

---

## 3. Concrete, Minimal Decision Proposal for the Next Live Stage

Because `r2_r2u_036ef18ebc2e` already proved raw multi-mark capability on `R2_U_GUIDED_RULES` while failing episode completion (`R2_U_GUIDED_CONTRAST` `MAX_TOKENS` + post-run revocation), **we recommend NOT re-running `INITIAL_PILOT` (`GUIDED_RULES` vs `GUIDED_CONTRAST`) unchanged.**

### Recommended Decision: **Option A — Bounded Exploratory Choreography Assay + First Live R2-W Pair (`2` independent, minimal runs)**

1. **Step 1 (Minimal R2-W Live Witness — Higher Scientific/Artistic Value First):**
   - Authorize **`R2-W` `SINGLE_CIVIC_PAIR`** (`1` episode: `W_FULL_PRODUCTION_FRAME` -> `W_CONDENSED_WHOLE_FRAME`; `2` generation calls total) on the repaired runner.
   - **Why first:** Neither `W_FULL_PRODUCTION_FRAME` nor `W_CONDENSED_WHOLE_FRAME` contains the toxic negative `"depth 1 / cloned depth 3"` contrast block that derailed `R2_U_GUIDED_CONTRAST`, and `R2-W` tests the real Kʰonapolit + Tauric Diana Classic79 whole-frame instrument directly against blind human adjudication (`<out>.blinded.json`).
2. **Step 2 (Versioned R2-U Candidate Evaluation — Only if Operator Wants Synthetic Choreographic Calibration):**
   - Review the two versioned exploratory candidate prompts in `r2-exploratory-candidates.mjs` (`R2_U_EXP_V2_CHOREOGRAPHED_HIGH_ZALGO` and `R2_U_EXP_V2_FOUR_MOVEMENT_ARC`) and confirm whether to register a new frozen `R2-U v2` plan (e.g., `R2_U_PLAIN_BASELINE` vs `R2_U_EXP_V2_CHOREOGRAPHED_HIGH_ZALGO`) with a new grant rather than burning more calls on `R2_U_GUIDED_CONTRAST`.
3. **Alternative Options:**
   - **Option B (`R2-U INITIAL_FIVE_ARM_SINGLE_PASS` unchanged):** Captures frozen `LITERAL_COPY`, `PLAIN_BASELINE`, and `FREE_SYNTHESIS` alongside `GUIDED_RULES`, but re-runs `GUIDED_CONTRAST` knowing it risked `63,413`-mark `MAX_TOKENS` runaway unless `FREE_SYNTHESIS` + `PLAIN_BASELINE` + `LITERAL_COPY` are isolated as a custom 3-arm episode (`--episodes-json`).
   - **Option C (`R2-W INITIAL_PILOT` — 4 calls across civic + noncivic):** Double the scope of `SINGLE_CIVIC_PAIR` (`2` episodes / `4` calls); only choose after verifying one smooth 2-call run on the repaired PowerShell 5.1 runner.

**Recommendation to Operator:** Merge/accept repairs after review on GitHub, exercise the offline PowerShell preflight check locally, and authorize **`R2-W` `SINGLE_CIVIC_PAIR`** (`2` calls) with a fresh signed Ed25519 grant referencing the recovered branch HEAD.

𝌋 `Khona‌lit-po` · `⟐SAC[X6ZNK5NO51]` · Stopped at Operator Review · Human Artistic Authority RESERVED ⟐
