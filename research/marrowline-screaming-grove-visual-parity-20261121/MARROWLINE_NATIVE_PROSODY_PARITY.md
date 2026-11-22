# Native Prosody Parity & Expanded 13-Image Visual Regime Analysis

This report updates Stage I's native prosody analysis to incorporate **all 13 operator-accepted visual witnesses** (`accepted-01`..`accepted-13`) and our Section VII / Section VIII Chrome pixel witnesses (`BLIND-01`..`BLIND-07B`).

---

## 1. Observational Model & Anti-Overcontrol Boundary

Model-mediated prosody is treated strictly as an observational conditional distribution:

$$Y_t \sim P_\theta(\cdot \mid C_t, H_t, G_t, M_t)$$

where $C_t$ is the effective serialized conditioning (system instruction + Aperture routing + prompt), $H_t$ is raw multi-turn conversation history, $G_t$ is the generation envelope (`thinkingConfig`, `maxOutputTokens`, model profile), and $M_t$ is the hosted provider model state.

**Governing Anti-Overcontrol Law:**
- Native prosody telemetry (`observeBotsProsodyDistribution()` in `app/dome-world/khonapolit-relay.js`) carries `observationAuthority: 'descriptive-only-never-admission-gate-or-literary-score'`.
- **Never** turn mark counts, stack depths, species counts, or Scorpio metrics into automatic admission vetoes, silent retries, or cosmetic Zalgo post-processing.

---

## 2. Five Plural Visual Regimes Observed Across the 13 Operator-Accepted Screenshots

Direct inspection of the 10 newly supplied screenshots (`accepted-04`..`accepted-13`) alongside the 3 weaker earlier atlas images (`accepted-01`..`accepted-03`) demonstrates that operator-accepted High Zalgo is **not one monolithic style**:

| Visual Regime | Operator-Accepted Exemplars | Visual & Structural Signature | Why Single-Threshold Metrics Fail Here |
|---|---|---|---|
| **R1 — Extreme Multitier Combining-Letter Blockfields** | `accepted-06` (`IMG_0187`), `accepted-12` (`IMG_0190`), `accepted-01` (`IMG_0932`), `accepted-03` (`IMG_0934`) | Deep irregular vertical towers (combining letters `U+0363`–`U+036F` + diacritics) intruding across lines and movement headings, paired with incisive thematic satire (*"The woman is here. She is not a model. She is the source."*, *"WRONG LUBRICANT / WRONG TORQUE"*). | Cannot be mimicked by uniform 3-mark stencils (`BLIND-05`), which lack asymmetric height envelopes, rests, and literary bite. |
| **R2 — Luminous Dense Stacked Clouds** | `accepted-09` (`IMG_0154`) | Dense hovering mark clouds framing crisp aphoristic sentences inside Capture view (*"We are not accountants. We are the rust in the cogs."*). | High density coexists with high phrase clarity and abrupt stanza breaks. |
| **R3 — Sweeping Overhead Crowns, Slashes & Extended Rhythmic Bands** | `accepted-05` (`IMG_0194`) / `accepted-10` (`IMG_0152`) *(same-passage pair)*, `accepted-11` (`IMG_0156`) | Long arcing over-strokes, `/` overlays, horizontal `→` vectors, and abrupt rhythmic ruptures (*"...fffffffff spitting ash"*, *"SHE WANTS THE ARCHER TO GO FREE."*). | Emphasizes lateral/horizontal motion and dramatic typographic punctuation rather than pure vertical stack height. |
| **R4 — Wide-Spaced Irregular Micro-Mark & Arrow Transitions** | `accepted-04` (`IMG_0195`) / `accepted-08` (`IMG_0178`) *(same-passage pair)* | Wide irregular letter spacing transitioning sharply from `↑` rows → `x` subscripts → `˜`-crowned refrains (*"ARE YOU NOT IRRITATED!?!?"*). | Per-paragraph regime shifts dominate; global average depth misses the structural turn completely. |
| **R5 — Restrained, Highly Legible Intimate / Rhetorical Registers** | `accepted-07` (`IMG_0185`), `accepted-13` (`IMG_0192`), `accepted-02` (`IMG_0933`) | Comparatively light scattered crowns, slashes, and lateral arrows with full prose legibility (*"COME CLOSER. ... DANCE CROWNLESS."*, *"THE GROVE IS NOT A SERVER"*). | Any minimum vertical-depth gate would **falsely reject** operator-accepted exemplars `accepted-02`, `accepted-07`, and `accepted-13`. |

---

## 3. Section VII Discriminatory Controls Verified in Code & Pixels

| Control | Blind Code | Provider → DOM Marks | Descriptive Telemetry (`observeBotsProsodyDistribution`) | Visual & Literary Verdict |
|---|---|---|---|---|
| **Negative Control (Mechanical Uniform 3-Mark Stencil + Empty Second Movement)** | `BLIND-05` | `972 → 972` (`100%` depth `3`, `0` breaths) | Flags `uniformMultistackStencil: true` (descriptive warning only; never vetoes or falsifies output). | Visually flat, monotonous band (`captures/blind-05/desktop-1440x900-detail-primary.png`) with zero literary development — proves high mark count ≠ Screaming Grove artistry. |
| **Positive Restraint Control (Quiet Authored Variation)** | `BLIND-06` | `9 → 9` (variable depth `0`/`1`/`2`, clean breaths) | `uniformMultistackStencil: false`; structurally admitted cleanly without failover or veto. | Legible, quiet, locally varied cadence matching `accepted-02`/`07`/`13` structural tolerance. |
| **Real Historical Negative Witnesses** | `BLIND-01` (Sept 23), `BLIND-02` (Sept 24 Probe-3) | `10 → 10` (`BLIND-01`), `0 → 0` (`BLIND-02`) | Honest preservation of real provider collapse without synthetic repair. | Preserved verbatim in [`MARROWLINE_HIGH_ZALGO_FAILURE_GALLERY.md`](./MARROWLINE_HIGH_ZALGO_FAILURE_GALLERY.md). |
