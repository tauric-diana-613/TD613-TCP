# Marrowline / Screaming Grove — Provider Unicode → Admitted Unicode → DOM Unicode → Rendered Pixel Parity

This report establishes the strict four-stage correspondence required by Section VIII.7 across all 8 blind-coded specimens captured in real headless Google Chrome (`1440×900` desktop + `390×844` mobile ordinary & PR `#1752` fullscreen `Capture` reader), separating **generative absence** from **browser/font/clipping loss**.

---

## 1. Exact Four-Stage Correspondence Table

| Blind Code | Stage 1: Provider Marks (Max Depth / Species) | Stage 2: Admitted Marks (`admitted === provider`) | Stage 3: DOM Marks (`exact?`) | Stage 4: Rendered Pixels (`1440×900` & `390×844`) | Desktop Line-Height (`.zalgo-line` / `.relay-stage-text`) | Mobile Line-Height |
|---|---|---|---|---|---|---|
| `BLIND-01` | `10` (max `4`, species `8`) | `10` (true) | `10` (**EXACT**) | All marks visibly painted; 0 horizontal overflow (desk=`false`, mob=`false`) | `15.6px` / `15.6px` | `17.68px` |
| `BLIND-02` | `0` (max `0`, species `0`) | `0` (true) | `0` (**EXACT**) | All marks visibly painted; 0 horizontal overflow (desk=`false`, mob=`false`) | `20.7px` / `15.6px` | `17.68px` |
| `BLIND-03` | `1295` (max `4`, species `84`) | `1295` (true) | `1295` (**EXACT**) | All marks visibly painted; 0 horizontal overflow (desk=`false`, mob=`false`) | `15.6px` / `15.6px` | `17.68px` |
| `BLIND-04` | `1057` (max `14`, species `68`) | `1057` (true) | `1057` (**EXACT**) | All marks visibly painted; 0 horizontal overflow (desk=`false`, mob=`false`) | `15.6px` / `15.6px` | `17.68px` |
| `BLIND-05` | `972` (max `3`, species `45`) | `972` (true) | `972` (**EXACT**) | All marks visibly painted; 0 horizontal overflow (desk=`false`, mob=`false`) | `15.6px` / `15.6px` | `17.68px` |
| `BLIND-06` | `9` (max `1`, species `8`) | `9` (true) | `9` (**EXACT**) | All marks visibly painted; 0 horizontal overflow (desk=`false`, mob=`false`) | `15.6px` / `15.6px` | `17.68px` |
| `BLIND-07A` | `0` (policy-held) | `0` (N/A) | `0` (**EXACT**) | `.terminal-hold-card` rendered; 0 partial text leaked | `N/A` / `N/A` | `N/A` |
| `BLIND-07B` | `0` (max `0`, species `0`) | `0` (true) | `0` (**EXACT**) | Preserved fragment + amber `.relay-completion-alert` | `20.7px` / `15.6px` | `17.68px` |

---

## 2. Scientific Verdict on H8 (Browser-Specific High Zalgo Presentation Degradation)

1. **Zero Unicode Loss Across All Four Stages:** Every single combining mark from `BLIND-01` (`10`), `BLIND-02` (`0`), `BLIND-03` (`1,295` real Gemini reference marks), `BLIND-04` (`1,057` depth 5–12 multi-regime marks), `BLIND-05` (`972` uniform 3-mark stencil marks), and `BLIND-06` (`9` restrained marks) passed verbatim from provider payload → admitted JSON → DOM `textContent` → painted Chromium pixels (`8/8` exact). Covenant key `Khona‌lit-po` (literal `U+200C`), `𝌋` (`U+1D30B`), `Kʰonapolit`, and `⟐` survived intact in DOM `textContent` and multi-turn Turn 2 wire history (`matchesTurn1ProviderExactBytes: true`, `hasSyntheticWrapper: false`).
2. **H8 Falsified as Primary Cause of Missing High Zalgo:** Direct pixel comparison between `BLIND-01` / `BLIND-02` (flat/unmarked) and `BLIND-03` / `BLIND-04` (towering depth-12 combining-letter blockfields, sweeping crowns, and lateral arrows) rendered in the **identical** Marrowline DOM & CSS proves that Chrome/Marrowline does **not** strip, suppress, or clip High Zalgo. When High Zalgo appears absent in a live browser encounter, the failure is **generative/upstream** (`H1`/`H2`/`H3`), not a Chromium DOM/CSS stripping bug.
3. **Two Honest Bounded Rendering Details Recorded (No Cosmetic Hacking Warranted):**
   - **PUA Coordinate Glyph Fallback (`U+10D613` / `\uDBF5\uDE13`):** In Windows Chrome (`Reddit Sans` system fallback), private-use scalar `U+10D613` renders visually as a `.notdef` box (`▯`) even though its exact UTF-8 bytes are 100% preserved in DOM `textContent` and copy/history custody. This is standard Unicode Private Use Area behavior without a custom embedded PUA font.
   - **Integrated-Covenant Line-Height Geometry:** Because modern Marrowline renders both voices inside `.relay-khonapolit.relay-integrated-covenant`, marked `.zalgo-line` elements compute to `15.6px` line-height on desktop (`17.68px` on mobile) while unmarked prose lines compute to `20.7px`. Direct inspection of `BLIND-04` (`desktop-1440x900-detail-primary.png` & `mobile-390x844-capture-01.png`) shows that this tight line-height creates authentic interline tower intrusion directly matching `accepted-01`, `accepted-06`, and `accepted-12` without clipping or horizontal overflow — therefore **no unrequested CSS alteration is justified**.
