# 𝌋‌ MARROWLINE NATIVE PROSODY FORENSIC PARITY REPORT

- **Commission:** `TD613-MARROWLINE-SCREAMING-GROVE-RESTORATION`
- **Date:** 2026-11-20
- **Scope:** Separating mark diversity, glyph-depth uniformity, mechanical stencils, structural voice boundaries, restrained single-register artistry, and the observational dynamical model without constructing a stencil decorator or style gate.

---

## 1. Observational Dynamical Framing and Epistemic Boundary (Section VII)

Marrowline's conditioning process can be analyzed observationally as a constrained generative system:

$$Y_t \sim P_\theta(\,\cdot \mid C_t, H_t, G_t, M_t)$$

where:
- $C_t$ is the current operator prompt, task context, and any staged attachments;
- $H_t$ is the retained raw conversational history passed in `contents`;
- $G_t$ is the effective governing system instruction, Aperture task-intent guidance, and relay cue;
- $M_t$ is the actual callable Gemini model, serving/caching state, and effective HTTP `generationConfig`;
- $Y_t$ is the verbatim provider-authored UTF-8 return prior to any local parsing or rendering.

**Strict Epistemic Boundary:** This conditional distribution is an **abstract observational model**, not a claim of access to Gemini's hidden weights, sampling internals, or external entities. Nonlinear, thermodynamic, oscillator, phason, or topological metaphors (including the Operator's blue–orange relational logic) are valuable for generating falsifiable hypotheses about regime transitions — e.g., why identical $(C_t, H_t, G_t)$ can bifurcate between a depth-1 planar basin and a depth-3 uniform-stencil basin — but they **never** dictate a Unicode mark schedule, authorize local Zalgo post-processing, or verify contact with external entities.

---

## 2. Four Distinct Native-Prosody Regimes Observed Across Historical Evidence

| Regime | Representative Witness | Mark Count / Distinct Marks | Per-Base Depth Behavior | Structural & Literary Assessment |
|---|---|---|---|---|
| **1. Operator-Accepted Varied Historical Grove** | Sept 24 Atlas screenshots `01`–`03` (`docs/research/2026-09-24-native-prosody-atlas/`) | Visually diverse across three distinct styles (towering multi-line eruptions, restrained quiet texture, asymmetric dramatic spikes) | Non-uniform, phrase-responsive, including both sustained quiet fields and deep colliding verticals | Operator-accepted artistic witnesses (visual only; raw UTF-8 Oct 2 provider text not preserved in repo). |
| **2. Flat Planar 1-Mark Basin** | Oct 15–20 PR `#1509`, `#1515`–`#1517`, `FULL-VOICE` Slots 1–4 | Low species diversity (`5` planar/slash marks `U+0334`–`U+0338`) | Constant depth `1` (`markedDepthTransitions = 0`), often marking whitespace/punctuation | Structurally passes two-voice headings; artistically flat and visually repetitive. |
| **3. High-Diversity Uniform-Depth Mechanical Stencil** | Oct 20 `FULL-VOICE` Slot 5 (`RESTORED_FORENSIC`, `cachedContentTokenCount: 4875`) | High total marks (`3,033`) and high species count (`94` distinct combining scalars) | **Invariant depth `3`** on `1,011/1,011` marked bases (`constantMarkedDepth = 3`, `markedDepthTransitions = 0`), following a fixed 3-position grammar | **Central expressive failure (Finding 4 / H7):** defeats naive mark-count and species-diversity metrics while remaining mechanically uniform. |
| **4. Restrained / Sustained Single-Register Artistry** | Sept 24 Atlas screenshot `02` & Section VII restraint control (`tests/marrowline-screaming-grove-restoration.test.mjs`) | Moderate/low marks, shallow or quiet sustained register | Deliberate restraint without violent height jumps | **Must remain structurally admissible and never vetoed**; prevents new metrics from turning into stylistic overcontrol. |

---

## 3. Why Mark Diversity Alone Fails — And How Descriptive Telemetry Fixes Visibility Without Overcontrol

Prior quality diagnostics measured aggregate combining-mark counts, distinct scalar species, and deep cluster counts. As Oct 20 Slot 5 demonstrated, a model can satisfy high species diversity (`94` marks) and `100%` stacked coverage (`depth = 3`) while locking into a mechanical per-letter 3-slot template (`0` depth transitions across `1,011` bases).

In this commission, `observeBotsProsodyDistribution(botsSectionText)` was added to `app/dome-world/khonapolit-relay.js` and attached to `assessIntegratedTransmission().botsMovement`:
- Computes the exact per-base depth histogram (`depthHistogram`), `markedDepths`, `constantMarkedDepth`, `markedDepthTransitions`, `markedWhitespaceBases`, and `uniformDepthStencilObserved` (`markedBases >= 24 && constantMarkedDepth !== null && markedDepthTransitions === 0`) strictly over the **Tauric Diana bots body** (excluding `Kʰonapolit` and excluding the standalone heading line).
- Carries an immutable boundary marker: `observationAuthority: 'descriptive-only-never-admission-gate-or-literary-score'`.
- **Never rejects, retries, repaints, or scores** a response.
- Simultaneously, `server/khonapolit-quality.js` was repaired so `nativeMarkUnderflow` evaluates `relay.admission.botsMovement.eligibleBaseCount` (bots movement only) rather than whole-response `eligibleBaseCount` (which previously counted `Kʰonapolit`'s undecorated prose against short poetic bot movements).

---

## 4. Verification of Mandatory Controls (Section VII)

Both mandatory controls are enforced as automated regression tests in `tests/marrowline-screaming-grove-restoration.test.mjs`:

1. **Negative Control (Uniform 3-Mark Mechanical Stencil + Empty Second Movement):**
   - Contains `>= 24` distinct combining scalars across above/mid/below zones, `maxDepth === 3`, `stackedBases >= 60`, two valid headings, and an intellectually empty repetitive second movement.
   - Verified behavior: passes structural heading admission (`admissible: true`, because headings are structural), is explicitly flagged as `constantMarkedDepth: 3`, `markedDepthTransitions: 0`, `uniformDepthStencilObserved: true`, carries `observationAuthority: 'descriptive-only-never-admission-gate-or-literary-score'`, and is **explicitly refused** any `ARTISTIC_RESTORATION` classification.
2. **Restraint Control (Quiet Shallow Poetic Bots Movement):**
   - Long undecorated `Kʰonapolit` analysis followed by a short, restrained 2-line poetic `Tauric Diana bots` movement (`eligibleBaseCount < 80`, shallow deliberate marks).
   - Verified behavior: remains structurally `admissible: true`, `uniformDepthStencilObserved: false`, and in live-mocked `khonapolitHandler` triggers **zero** second-seat failover or cosmetic retry (1 provider call total, original provider UTF-8 bytes returned verbatim).

---

## 5. Same-Episode Source Fidelity & Prompt-Contradiction Diagnosis

Comparison of the active PR `#1549` production restored-grove default against real October 2 (`ffb98ac0`) and staged PR `#1545`-reconciled `buildHistoricalGroveDramaturgyCandidate` (`MARROWLINE_EFFECTIVE_REQUEST_PARITY.json`) reveals a direct conditioning contradiction in the currently active default:
- `CUE[4]` still preserves the Oct-2 priority: *"sustained deep overlapping vertical flourishes are primary, with horizontal strokes, tilde and diagonal overlays available when the words earn them, never compulsory."*
- Yet PR `#1549`'s reverted `RELAY[1]` and `CUE[2]` simultaneously instruct: *"welcome horizontal, tilde or diagonal marks. A fully sustained, single-register High-Zalgo performance is welcome"* and *"Do not interpret repeated native morphology as inherently inferior artistry."*
- By contrast, the staged `buildHistoricalGroveDramaturgyCandidate` preserves Oct 2's anti-stencil distinction (*"a mechanical stencil is not an authored recurring motif"* and *"A repeated single exotic accent on every letter is a failed flat texture, not High Zalgo"*) alongside noncompulsory permission (*"Above/below combinations, stack depths and clean intervals may persist, repeat, deepen or change as the bots choose"*). Whether this removes stencil lock-in in live Gemini generation remains an **empirical question** (`UNTESTED`), explicitly deferred to operator-authorized bounded observation.
