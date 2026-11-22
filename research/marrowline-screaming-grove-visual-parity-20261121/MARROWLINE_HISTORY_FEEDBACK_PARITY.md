# Multi-Turn History Feedback Parity Audit (`P5`)

- **Historical Contamination Confirmed & Repaired in Source (PRs `#1579`/`#1581` + `bc5467246`):**
  Prior Marrowline builds injected a synthetic `Kʰonapolit ∴ Tauric Diana bots` speaker wrapper into stored model history, contaminating subsequent-turn conditioning (`H5`). Current runtime source preserves raw provider-authored UTF-8 text verbatim inside the bounded rolling history window (`10` entries max), keeps human-facing export headers (`Copy conversation as plain text`) strictly outside API history, and prevents `PROHIBITED_CONTENT` / `SAFETY` partial fragments from entering `{ role: 'model' }` history or structural repair.

- **Verified Live Chrome Turn-2 Wire Custody (`BLIND-04`, `2026-11-21`):**
  - Turn 1 synthetic multi-regime High Zalgo payload (`1,057` combining marks, literal `Khona‌lit-po` `U+200C`, `𝌋`, `U+10D613`, `⟐`) had SHA-256 `e8e5fc1317b28927ef2576ccb6fe4f1ddedeb173180cc9c22d759f0ed1ac8b67`.
  - Turn 2 server-captured `req.body.history` (`role: "model"`) confirmed:
    - `modelHistorySha256`: `e8e5fc1317b28927ef2576ccb6fe4f1ddedeb173180cc9c22d759f0ed1ac8b67`
    - `matchesTurn1ProviderExactBytes`: **`true`**
    - `hasSyntheticWrapper`: **`false`**
    - `preservesZwnjCovenantKey`: **`true`**
    - `turn2Status`: `200`
  - Unit tests (`tests/marrowline-screaming-grove-restoration.test.mjs`, `12/12 PASS`) independently confirm wire-serialized covenant byte preservation across history compaction and attachment retry boundaries.

- **Remaining Empirical Gap (`HELD`):**
  - Source-level raw history fidelity is **`FUNCTIONAL_PARITY_WITNESSED`**.
  - **Longitudinal live-Gemini multi-turn restoration** (whether raw uncontaminated history prevents Turn 2–4 expressive attenuation under live hosted Gemini weights) remains **`UNTESTED`** and **`HELD`** pending separate Operator authorization for the optional 2-call Q2 extension (`BOUNDED_PROVIDER_EXPERIMENT_PREREGISTRATION.md`).
