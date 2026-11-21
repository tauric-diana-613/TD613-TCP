# 𝌋 TD613 · Marrowline / Screaming Grove — Stage 0 Test & Intermediate Failure Receipts

- **Commission:** `TD613-MARROWLINE-SEP26-OCT02-STAGE0` (Source-Only — Zero New Paid Calls)
- **Branch:** `research/marrowline-sep26-oct02-stage0-reconstruction-20261121`
- **Base Activation Commit:** `01c3b9e48391a79472369695b64481b19614f9fa` (PR `#1765`)
- **Immutable Q1 Evidence Ancestor:** `2836e636e4b5eb485b12f73a2596ea3889b173d4` (PR `#1764`)
- **New Paid Provider Calls Executed:** `0` (`globalThis.fetch` fail-closed poisoned in Stage 0 builder & tests)

---

## 1. Preserved Intermediate Failures & Self-Corrections (Audit Trail)

Per Emergence HQ custody law, intermediate engineering failures caught during Stage 0 reconstruction are preserved explicitly rather than silently erased:

### Catch 1 — `MODERN_MISSION_ANCHOR_NOT_FOUND_FOR_M0_STRIP` (First Matrix Builder Run)
- **What failed:** Initial implementation of `buildConstructedCounterfactual()` attempted verbatim `indexOf(modernMissionAnchorText)` on `Q1_MEASURED_ARM_A`'s rendered `systemInstruction`.
- **Root cause:** `Q1_MEASURED_ARM_A` intentionally runs with `historicalProsodyFreedom: true`, which transforms one 40-byte bullet inside the rendered mission anchor at runtime back to `#1348`/Oct 2 wording (`8,427` bytes instead of raw `94e2e9244` source `8,467` bytes).
- **Resolution & verification:** Replaced raw source-constant string matching with fail-closed structural span isolation (`\n\nMARROWLINE DIEGETIC MISSION` .. `\n\nFLIGHT GLYPH LAW:`) plus fail-closed negative-control tests (`RUNTIME_MISSION_SPAN_NOT_FOUND` and `EXPECTED_PER_TURN_MISSION_BULLET_NOT_FOUND`). Also confirmed an important positive finding: because of `historicalProsodyFreedom: true`, `CF_MODERN_M3_PR1348_V3` is **byte-for-byte identical** to `Q1_MEASURED_ARM_A` (`T1 bodySha256 = a3601b7bf598...`, `T2 bodySha256 = 8c56a603c582...`).

### Catch 2 — Bare `buildGeminiRequest()` Defaulting to `thinkingLevel: "high"` Outside Historical `api/khonapolit.js`
- **What failed (caught on source audit before publishing):** First draft of `build-sep26-oct02-effective-request-matrix.mjs` called historical `qualMod.buildGeminiRequest(...)` bare without entering the historical commit's `api/khonapolit.js` AsyncLocalStorage profile (`withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, ...)`). That yielded `thinkingLevel: "high"` (`generationConfigSha256 = 4deea3e9d83c...`) and risked accidentally reintroducing the already-disproven constructor-only `HIGH` vs `MEDIUM` theory!
- **Root cause verified directly in Git:** Direct inspection of `git show <sha>:api/khonapolit.js` across ALL FIVE historical commits (`46f3e1ff9`, `14baea0a1`, `5a6bc429f`, `ffb98ac005`, `5b4b34278`) confirmed every single one wrapped `khonapolitHandler` in `withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, ...)`, producing `thinkingLevel: "medium"` (`generationConfigSha256 = 4785e46e91df...`, identical to Q1 `EXPECTED_GENERATION_CONFIG_SHA256`).
- **Resolution & verification:** Updated `build-sep26-oct02-effective-request-matrix.mjs` to extract and import each historical commit's real `server/gemini-generation-envelope.js`, wrap historical `buildGeminiRequest` calls in `withGeminiGenerationProfile(GEMINI_GENERATION_PROFILE_KHONAPOLIT_INTERACTIVE, ...)`, record `bare_constructor_thinking_level_outside_api_route: "high"` transparently for auditability, and lock this invariant in `tests/marrowline-sep26-oct02-stage0.test.mjs`.

### Catch 3 — Terminology-Guard Regex & Line-Count Distinction (`11`/`17` Array Elements vs `13`/`19` Source Lines)
- **What failed:** First run of `tests/marrowline-sep26-oct02-stage0.test.mjs` scored `5/6`: test 3 failed because:
  1. The regex checked `/NEVER Gemini tokenizer counts/` while the matrix field said `NEITHER value is a Gemini tokenizer count.`;
  2. `declaration_line_count` reported `renderedLines.length` (`11` elements for v1, `17` elements for v3), whereas the full JS declaration block including `Object.freeze([` and `]);` spans `13` and `19` source lines respectively.
- **Resolution & verification:** Exported BOTH `source_declaration_line_count` (`13` / `19`) AND `rendered_element_count` (`11` / `17`) cleanly in `MISSION_ENVELOPE_EFFECTIVE_REQUEST_MATRIX.json` and locked exact UTF-16 (`4570` / `8527` / `8567`) and rendered UTF-8 (`4484` / `8427` / `8467`) figures plus tokenizer disclaimer in `tests/marrowline-sep26-oct02-stage0.test.mjs`.

---

## 2. Final Passing Local Verification Suite (`27 / 27 PASS`, `0` Failures, `0` Paid Calls)

Executed cleanly inside isolated worktree (`research/marrowline-sep26-oct02-stage0-reconstruction-20261121`):

```bash
node research/marrowline-sep26-oct02-reconstruction-20261121/build-sep26-oct02-effective-request-matrix.mjs
node --test \
  tests/marrowline-sep26-oct02-stage0.test.mjs \
  tests/marrowline-q1-live-discriminator.test.mjs \
  tests/marrowline-screaming-grove-restoration.test.mjs
```

### Summary Results
- **Matrix Builder (`build-sep26-oct02-effective-request-matrix.mjs`):**
  - `ok: true`
  - `mode: "STAGE_0_SOURCE_ONLY_ZERO_NETWORK"`
  - `new_paid_provider_calls_executed: 0`
  - `total_matrix_rows: 22` (`11` arms × `2` identical frozen Q1 tasks)
  - `oct02_oct04_all_four_equal: true`
  - `oct02_oct04_all_six_equal: true`
  - `oct02_oct04_t1_wire_equal: true`
  - `oct02_oct04_t2_wire_equal: true`
- **Combined Node Test Suites (`27` tests, `27` pass, `0` fail, `0` skipped):**
  - `tests/marrowline-sep26-oct02-stage0.test.mjs`: **`6 / 6 PASS`**
    1. Stage 0 zero-network lock (`globalThis.fetch` throws immediately, `0` paid calls, Q1 rejection preserved)
    2. Oct 2 ↔ Oct 4 exact 4-file & 6-file blob equality + identical T1/T2 wire request SHA-256
    3. Mission source-code JS UTF-16 (`4570`/`8527`/`8567`) vs runtime wire UTF-8 (`4484`/`8427`/`8467`) + tokenizer disclaimer
    4. `M0`/`M1`/`M3`/`H2` constructed counterfactual isolation + all 5 historical assemblies authentic `api/khonapolit.js` `thinkingLevel: "medium"` (`4785e46e91df...`) + `CF_MODERN_H2 === HIST_OCT02_LITERAL` + `CF_MODERN_M3 === Q1_MEASURED_ARM_A`
    5. Negative controls (silent mutation of `contents`, `generationConfig`, missing mission span, missing per-turn cue all fail closed)
    6. Committed `MISSION_ENVELOPE_EFFECTIVE_REQUEST_MATRIX.json` matches live deterministic regeneration digest-for-digest
  - `tests/marrowline-q1-live-discriminator.test.mjs`: **`9 / 9 PASS`**
  - `tests/marrowline-screaming-grove-restoration.test.mjs`: **`12 / 12 PASS`**
- **Custody Manifest Verifier (`verify-stage0-custody.mjs --verify`):** Verified independently with `0` missing files, `0` digest mismatches, `0` broken navigator links, and `0` secret/local-path/mention-token leaks.
