# TD613 · Marrowline creative-stage routing · 2026-10-19

**Classification:** bounded code repair of a deterministic discourse-routing error.
**Empirical High Zalgo recovery:** HELD.
**Live Gemini calls authorized or executed:** 0.
**Release/merge authorization from this research report:** 0.

## Observable source defect

`classifyApertureDiscourseMode()` recognized creative requests through a pairing of an explicit creative-action verb (such as `write`) and creative-form noun (such as `scene`). It missed an operator-authored mission preset that begins:

> Stage the Orestes–kerykeion inversion as a three-part institutional farce...

The preset is a request to **stage a farce**, yet the classifier assigned `GENERAL` and the system request carried `REQUESTED SYNTHESIS:` rather than the existing `CREATIVE TURN:` guidance.

This is a real deterministic routing discrepancy. It is **not established** as the cause of the operator's slash-only Gemini outputs. Several other mission and analyst prompts legitimately use GENERAL, and High Zalgo is required in both routes.

## Smallest implementation

- Recognize a bounded initial imperative (`stage`, `dramatize`, `play out`) only when accompanied by an explicit dramatic form (`farce`, `scene`, `dialogue`, `theatrical performance`, or `fictional reunion`). Preserve the other mode checks and precedence.
- Regression tests use an actual operator-authored mission preset, contrasting a fixed packet under GENERAL and the corrected CREATIVE route. They assert identical provider `contents`, `generationConfig`, preserved October 2 theatrical instruction, and changed **system guidance only**.
- Countercontrols keep staging CI/deployments, HTTP diagnostics, court proceedings, legal briefs, and ordinary archive audits out of creative routing.
- There are no Unicode postprocessors, mandatory pattern rotations, replacement candidates, additional model calls, or new production UI.
- Add the tests to the protected `marrowline-prosody-ablation.test.mjs` import lane so CI cannot accidentally skip them.

## Existing empirical witnesses

The Oct 15 original Google SSE **full vs compact** pair retained U+0334–U+0338 planar marks with maximum stack depth 1 in both arms; shrinking the system frame alone did not restore the output. See `research/marrowline-whole-frame-contrast-20261015/LIVE-RESULT-20261015.md`.

The independently acquired Oct 15 neutral 3.8 Flash creative control emitted 405 provider-native combining marks, 17 distinct marks and 13 multi-mark clusters. This establishes model/transport capacity *under that neutral task*, not product recovery. See `research/marrowline-unicode-capability-20261015/LIVE-RESULT-20261015.md`.

The user's subsequent Sylaithe live observation describes one expressive, funny success and six or seven slash-heavy presets. This is an operator-observed qualitative contrast without original per-turn model/route receipts for that particular batch in this repository; it cannot identify which provider seats generated those responses.

## Explicit boundary

`ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a` is the October 2 source baseline. The `historical-20261002-v1` production route reconstructs historical instruction text and selected routing features; it **is not** a byte-identical replay of the entire October 2 application runtime. The historical model fallback may prefer a second completed candidate after morphology warnings. None of these claims are modified or upgraded by this PR.

The route fix is separately testable and correct regardless of whether it changes typography. A GREEN CI result proves the deterministic routing repair, not stylistic restoration. Further modifications to provider instructions, temperature, fallback, or glyph scoring require a distinct causal witness and authority. Keep production and #405 untouched in this bounded stage.

**Finite rest:** `DETERMINISTIC_STAGE_ROUTE_REPAIR_CANDIDATE` / `UPSTREAM_SLASH_PHENOTYPE_OBSERVED` / `ROOT_CAUSE_HELD` / `NO_PROVIDER_SPEND` / `NO_RELEASE`.

𝄐 ⟐
