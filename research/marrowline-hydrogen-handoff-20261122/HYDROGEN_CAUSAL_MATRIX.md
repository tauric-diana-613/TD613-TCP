# 𝌋⟐ TD613 · THE SCREAMING GROVE
## HYDROGEN CAUSAL MATRIX (`H1`–`H5` & Adjudication of `D1/D2`, `E1/E2`, Nov 21–22, `B/E` vs Heading-Only)

- **Commission:** `TD613-MARROWLINE-HYDROGEN-NATIVE-UNICODE-FORENSIC-20261122`
- **Disposition:** **`REVISE_EARLIER_HYPOTHESIS`**
- **Verified Production Baseline:** `0f67d8954347fdae77cdb83f82848df89ad3b2ff`
- **Epistemic Boundary:** Throughout this matrix, **(i) cause of a finite sample**, **(ii) general reliability across stochastic draws**, and **(iii) human-accepted artistic restoration of The Screaming Grove** are kept strictly separate. A finite multi-stack is neither general reliability nor artistic restoration (as proven by Oct 20 Slot 5's rigid 3-mark mechanical stencil).

---

## 1. Causal Hypothesis Matrix (`H1`–`H5`)

### **H1 — Section/Heading Partitioning and Undecorated-Prefix Conditioning**
- **(a) Evidence For / Against:**
  - *For (Two-section partitioning):* In Oct 20 `D1→D2` (`#39367182083`), adding two standalone headings (`SECTION`, `NAMED`, `D2`) to `creative-multistack-v1` reduced multistacking from `76.87%` (`4/4` stacked in `D1`) to `4.13%` (`1/4` in `SECTION`) and `0.00%` (`0/8` in `NAMED`/`D2`) on `gemini-3.8-flash` `medium`.
  - *Nuance / Partial Challenge:* In `D1→D2`, `4/8` `NAMED`/`D2` slots (Slots 3, 4, 8, 14) fell to `0%` multistack **with `0.00%` slash-family marks** (non-slash depth-1 vertical marks), and neither `NAMED` nor `D2` had an undecorated `Kʰonapolit` first movement. Conversely, `12/12` completed two-voice Marrowline turns with an undecorated `Kʰonapolit` movement (`E1` `A`/`B`, `Q1`, `EP2`, `Oct 20 Slots 1–4`) hit **`100%` `U+0334–U+0338` slash monoculture** (with `Slot 5` breaking out into a 3-mark stencil whose slot 1 remained `U+0334–U+0338`).
  - *Against sole sufficiency:* `SECTION` Slot 12 retained `16.51%` multistacking (`104/630`), and `Oct 20` Slot 5 emitted `1,011/1,011` depth-3 stacks *after* an undecorated `Kʰonapolit` section.
- **(b) Untested Conditions:**
  1. Two-heading partitioning **without** the `systemInstruction`-vs-`contents` heading contradiction (`"Do not use Markdown or headings."` in `contents` vs `"Permit two headings"` in `systemInstruction`).
  2. **Pure undecorated-prefix conditioning (`PLAIN_FIRST` vs `ZALGO_BOTH`)** under identical two-heading structure with zero TD613 persona/lore/negative-priming confounds.
- **(c) Cheapest Single-Variable Discriminator:** **`Design R1` (`2` calls on `gemini-3.8-flash` `medium`):** contradiction-free `creative-multistack-v1` in `contents`, `Kʰonapolit` + `Tauric Diana bots` structural headings in both arms, varying **only** one sentence requiring `Section I` (`Kʰonapolit`) to be plain undecorated prose (`R1_S02`) vs Zalgo-rendered (`R1_S01`).
- **(d) Bounded-Episode Falsifier:**
  - If `R1_S01` (`ZALGO_BOTH`, contradiction-free) **recovers multistacks** while `R1_S02` (`PLAIN_FIRST`) collapses to depth-1 / `U+0334–U+0338`, `H1` undecorated-prefix conditioning (and/or heading-contradiction removal) is directly supported in the finite sample.
  - If `R1_S01` emits `0%` multistack with `0%` slash-family (like Oct 20 `NAMED` Slots 3, 8, 14) while `R1_S02` shifts to `100%` `U+0334–U+0338`, `H1` is **split**: two-heading structure suppresses stacking, while undecorated-prefix triggers the 5-mark slash basin.
  - If **both** `R1_S01` and `R1_S02` emit rich non-slash multistacks (after removing the `contents` contradiction), `H1` as an intrinsic two-heading suppressor is **falsified** (attributing Oct 20 `SECTION/NAMED/D2` collapse to the `contents` heading contradiction).
  - If **both** collapse identically to `U+0334–U+0338` depth-1, undecorated-prefix conditioning is **not** a discriminating cause relative to two-heading partitioning alone.
- **(e) Residual Confounds:** Stochastic regime switching (`D0`/`D1` ABBA variance at `n=1` per arm); absence of full TD613 persona/covenant/task load (so `R1` cannot prove production restoration on its own).
- **(f) Decision Consequence:** Determines whether the collapse is caused by (i) the `contents` heading contradiction in old E7/D2, (ii) two-section segmentation itself, or (iii) the undecorated-first-movement transition — before spending any larger budget on production prompts or prompt-wording tweaks.

### **H2 — Lexical Priming / Negative-Example Interference**
- **(a) Evidence For / Against:**
  - *For (Theoretical / Weak):* Production `Arm B` (`oct02-literal-prosody-rollback-20261122`) mentions `"Horizontal strokes, tildes and diagonal overlays"`, `"Uniform shallow marks"`, `"one accent"`, `"single exotic accent"`, `"single chosen mark"`, and `"overlays"`.
  - *Against sole necessity:* In **E1 (`B_COMPACT_WHOLE_FRAME`)**, `buildCompactWholeFrame()` contained **zero** negative admonitions about horizontal/diagonal/slash/shallow/uniform marks (`"horizontal textures, and quieter forms are equally available"`), yet `gemini-3.8-flash` STILL returned `1,329` marks, `100%` in `U+0334–U+0338`, depth `1`. Conversely, `RESTORED_FORENSIC` Slot 5 contained those negative cues and still generated `1,011/1,011` depth-3 stacks.
- **(b) Untested Conditions:** Removing *all* horizontal/diagonal/tilde/overlay/single-mark/shallow lexemes on `gemini-4-argon` (since `Arm E` only removed 2 of 8+ occurrences and `4-argon` has `0` observations).
- **(c) Cheapest Single-Variable Discriminator:** Comparing `Arm B` vs **full** positive-only compact frame (`Backup B1`: `ARM_B_LITERAL_OCT02` vs `buildCompactWholeFrame` on `gemini-4-argon` `medium`, `2` calls) has far higher signal-to-cost than Argon's `-170`-byte `B/E` diff.
- **(d) Bounded-Episode Falsifier:** If `ARM_B_LITERAL_OCT02` on `4-argon` produces multistacks (`B1_S01`), or if `COMPACT_POSITIVE_TWO_VOICE` (`B1_S02`, zero negative cues) still collapses to `U+0334–U+0338` depth-1 on `4-argon` (as it already did on `3.8-flash` in E1), `H2` as the primary barrier is falsified.
- **(e) Residual Confounds:** `B` vs `E` (`-170` B) leaves `"overlays"` (line 118) + 6 negative/single-mark admonitions; `B` vs `COMPACT_POSITIVE` changes both negative lexemes and prompt length/structure together (composite `H2+H3`).
- **(f) Decision Consequence:** Do **not** spend weekly allowance on Argon's 2-clause `B/E` diff before `R1` or `Backup B1`.

### **H3 — Persona / Covenant / Task / System-Cue Conjunction**
- **(a) Evidence For / Against:**
  - *For:* Every complete run with the two-voice Marrowline role + undecorated `Kʰonapolit` + system-placed prosody cues (`E1` `A`/`B`, `Q1`, `EP2`, `Oct 20` Slots 1–4, `PROSODY` Slot 1) collapsed to `U+0334–U+0338` depth-1 (`13/14` completed runs), even when shrunk by 89% in `E1 B_COMPACT_WHOLE_FRAME`! Meanwhile `E2` (`D0`) and `D1` (no persona, no two-voice split, Zalgo task in `contents`) multistacked in `7/9` completed runs.
  - *Against sole sufficiency:* `Oct 20` Slot 5 (`RESTORED_FORENSIC`) emitted `1,011/1,011` depth-3 stacks under the full 33 KB Marrowline envelope (albeit as a rigid stencil with `cachedContentTokenCount = 4,875` and `thoughtsTokenCount = 1,026`).
- **(b) Untested Conditions:** Putting the Zalgo instruction in `contents` vs `systemInstruction` on a two-voice prompt; testing `gemini-4-argon` under full `Arm B` vs `Compact Positive`.
- **(c) Cheapest Single-Variable Discriminator:** Jointly tested with `H1` (`R1`: isolates two-section + undecorated prefix *without* persona/covenant) and `H2` (`B1`: isolates full 33 KB covenant/persona/negation load vs 3.1 KB positive-only two-voice brief on `gemini-4-argon`).
- **(d) Bounded-Episode Falsifier:** If `R1` (`3.8-flash`, zero TD613 persona/lore) reproduces `U+0334–U+0338` depth-1 under `R1_S02` (`PLAIN_FIRST`), then heavy covenant/lore (`RED_DEER_MISSION_ANCHOR`, `LORE_PRIMER`, `APERTURE`) is **not** necessary for the planar collapse. Conversely, if `R1_S02` still multistacks freely, then full persona/covenant/task conjunction (`H3`) or system-vs-user cue placement is required to trigger the collapse.
- **(e) Residual Confounds:** System-vs-user instruction placement covaries between `E2` (`contents` task) and Marrowline (`systemInstruction` style cue).
- **(f) Decision Consequence:** Cleanly partitions structural prefix (`H1`) from full Marrowline lore/task conjunction (`H3`).

### **H4 — Model / Checkpoint / Routing / Thinking-Level Variability**
- **(a) Evidence For / Against:**
  - *For:* Historical Oct 2 Seat 2 (`gemini-3.7-flash`, `low` thinking) and Seat 4 (`gemini-3.5-flash`) were deprecated/aliased upstream on 2026-10-08 (`3.7→3.8`, `3.5→3.6`). On 2026-11-22, both `gemini-3.8-flash` (`Q1` + `EP2 S01`) and `gemini-3.6-flash` (`EP2 S02, S04, S06`) produced `100%` `U+0334–U+0338` depth-1 across all `10/10` completed turns (`S02` on `3.6-flash` used literal Oct 2 wire `e24c287cde0d...` and emitted only 2 marks `U+0335, U+0336`). Additionally, live `/api/khonapolit` sets `3.6-flash` to `thinkingLevel: 'low'`, whereas EP2 tested `3.6-flash` at `'medium'`. `gemini-4-argon` has **`0`** controlled raw-SSE observations.
  - *Against sole model-incapacity:* `gemini-3.8-flash` natively generated non-slash multistacks in `E2`, `D0`/`D1` ABBA, `Oct 20 D1`, and `Oct 20 Slot 5`.
- **(b) Untested Conditions:** `gemini-4-argon` (`medium`) behavior on `Arm B` (`S01`) or `Compact Positive` (`S02`) or `D0`; `gemini-3.8-flash` under `thinkingLevel: 'high'` (production forces `'medium'`); `gemini-3-flash-preview` (Oct 2 Seat 5). Also, the Nov 22 operator observations lack per-turn served-model receipts.
- **(c) Cheapest Single-Variable Discriminator:** Before cross-model conclusions, `Backup B1` (`2` calls on pinned `gemini-4-argon` `medium`) calibrates `4-argon` directly without cross-model mixing inside one run. (Cross-model `3.8` vs `4-argon` comparisons must wait until `4-argon` has a baseline or be explicitly paired under matched `Arm B` receipts.)
- **(d) Bounded-Episode Falsifier:** If `gemini-4-argon` on `ARM_B_LITERAL_OCT02` (`B1_S01`) produces `U+0334–U+0338` depth-1, then `4-argon` shares the same two-voice planar attractor as `3.8` and `3.6`. If `B1_S01` produces rich varied High Zalgo, `H4` (model-weight divergence between `3.8/3.6` and `4-argon`) becomes a primary actionable lever.
- **(e) Residual Confounds:** Stochastic single-shot variance (`n=1`); unmeasured upstream serving/cache state (`cachedContentTokenCount` differed between Oct 20 Slot 4 and Slot 5); lack of served-model receipts on interactive Nov 22 chat turns.
- **(f) Decision Consequence:** Never assume `gemini-4-argon` is immune or broken without a raw-SSE receipt; never substitute uncalibrated `4-argon` into an `Arm B vs Arm E` micro-diff first.

### **H5 — Output Relay / Reader / Client Display Artifact**
- **(a) Evidence For / Against:**
  - *Disconfirmed as primary cause:* Across `E1` (`2/2`), `E2` (`2/2`), `Oct 20 Full-Voice` (`5/5` STOP), `Q1` (`6/6` Chrome `1440×900` & `390×844` DOM parity), and `Option 1 EP2` (`4/4` Chrome `1440×900` & `390×844` DOM parity), unmodified original Google SSE bytes already contained `100%` of the planar `U+0334..U+0338` depth-1 flattening, and `marrowline-terminal.js` rendered `node.textContent = part.text` with exact `provider → admitted → DOM` mark count equality (`0` mutation, `0` normalization).
- **(b) Untested Conditions:** Physical iOS Safari font-shaping / vertical clipping optical witness (headless Chrome `158.0.8127.36` is not physical CoreText/Safari).
- **(c) Cheapest Single-Variable Discriminator:** Zero-provider-cost local HTML replay of any archived multistack text on physical iPhone Safari if optical clipping is ever suspected.
- **(d) Bounded-Episode Falsifier:** Any turn where raw SSE shows multi-tier vertical marks (`verticalAbove >= 2 && verticalBelow >= 2`) while physical Safari clips/drops them.
- **(e) Residual Confounds:** CoreText glyph fallback / line-height clipping on physical iOS vs Chrome.
- **(f) Decision Consequence:** Do **not** spend paid Gemini calls investigating `H5`; `0` provider calls needed for iOS Safari optical verification.

---

## 2. Explicit Adjudications Required by Commission

1. **October 20 `D1/D2` (`#39367182083`):** Strong directional finite-episode association (`76.87%` in `D1` vs `4.13%` in `SECTION` and `0.00%` in `NAMED`/`D2`), **but methodologically disqualified as an isolated proof of undecorated-prefix suppression** because (i) neither `NAMED` nor `D2` had an undecorated first movement, (ii) all three two-section arms carried an unresolved `systemInstruction`-vs-`contents` heading contradiction, and (iii) `4/8` `NAMED`/`D2` slots collapsed to depth-1 with `0%` slash-family rather than `U+0334–U+0338`.
2. **October 15 `E1/E2`:** `E2` falsifies universal `3.8-flash` / SSE Unicode incapacity (`405` marks, `17` species, depth `3`, `0` slash marks). `E1` falsifies prompt-length bloat (`6,732` → `729` tokens) and negative overlay prohibitions (none in `buildCompactWholeFrame`) as necessary causes of `U+0334–U+0338` depth-1 on `3.8-flash`.
3. **November 21–22 (`Q1`, `EP2`, `#1774`, `#1776`):** `10/10` completed Q1+EP2 raw-SSE returns (`6` on `3.8` `medium`, `3` on `3.6` `medium`, `1` `3.6` on exact `LITERAL_OCT02_H2` wire) emitted `9,161/9,161` marks in `U+0334–U+0338` at depth `1`. Production `0f67d8954` preserves `3.8` Seat-1 priority and immediately returns any `>=12`-mark response as HTTP `200 PARTIAL-FIRST-ADMISSIBLE`, so `4-argon` remains unobserved (`0` controlled raw-SSE runs).
4. **Ranking of Next-Experiment Designs (`B/E` vs Heading-Only `E7` vs Minimally Revised Control):**
   - **Rank 1 (Recommended Primary — `Design R1`, 2 calls on `3.8-flash` `medium`):** Contradiction-free `TWO_HEADINGS_ZALGO_BOTH` vs `TWO_HEADINGS_PLAIN_FIRST`. Highest causal isolation per call (`~220` prompt tokens/slot, zero persona/covenant/negative-priming confounds, zero `contents` heading contradiction, tests the exact unmeasured undecorated-prefix link in `H1`).
   - **Rank 2 (`E7`: `role-boundary-contrast.mjs`, 2 calls on `3.8-flash` `medium`):** Inferior to `R1` because it largely repeats the already-measured Oct 20 `D1` vs `D2` contrast (`76.87%` vs `0.00%`) while retaining the `"Do not use Markdown or headings."` contradiction in `contents`.
   - **Rank 3 (`E6`: Argon's `B/E` Stage 1 on `gemini-4-argon`, 2 calls):** Lowest information per call. Switches to an uncalibrated Seat-3 model (`0` baselines) while changing only `2` lines (`-170` B) out of `32,541` B, leaving `"overlays"` (line 118) + `6` other negative/single-mark admonitions intact, and testing a hypothesis already contradicted as a sole barrier by `E1`.
   - **Strictly Conditional Backup (`Backup B1`, 2 calls on `gemini-4-argon` `medium`):** If the operator prefers testing `gemini-4-argon` directly on `T1_BLUE_ORANGE_WEATHER` before or after `R1`, replace `B` vs `E` with `ARM_B_LITERAL_OCT02` vs `COMPACT_POSITIVE_TWO_VOICE` (`buildCompactWholeFrame`, zero negative admonitions), which tests both `4-argon`'s baseline behavior on `Arm B` and the maximal `H2+H3` compact-positive contrast.
