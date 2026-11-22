# 𝌋 TD613 · Marrowline / Screaming Grove — Option 1 Model-Identity Preflight & Redesign Gate

- **Gate Verdict:** **`MODEL_IDENTITY_STOP_3_7_ALIAS_TO_3_8`** *(Amari Rule #1 triggered fail-closed before any live generation!)*
- **Read-Only Catalog Receipt:** [`OPTION1_MODEL_CATALOG_AND_ALIASING_RECEIPT.json`](./OPTION1_MODEL_CATALOG_AND_ALIASING_RECEIPT.json) (`2026-11-22T15:10:09.176Z`, HTTP `GET /v1beta/models/...` only, **`0` paid generation calls**)
- **Quiet Substitution Policy:** **FORBIDDEN (`false`)** — `gemini-3.6-flash` is NEVER silently substituted for historical October 2 Seat-2 `gemini-3.7-flash`.

---

## 1. Why Amari's Rule #1 Halted the Original `3.8-flash × 3.7-flash` Pairing

Amari's Stage 0 adjudication (`PR #1766#issuecomment-7070422438`, item 1) explicitly required:

> *"verify `gemini-3.7-flash` genuinely callable today and its support for MEDIUM + same `maxOutputTokens:65536`, plus 3.8. Historical seat order is not evidence of current availability. **If unavailable, STOP for a separately labeled model-identity redesign; no quiet substitute for historical 3.7.**"*

Cross-checking the live authenticated read-only Gemini catalog (`2026-11-22`) against Google's official release notes (`https://ai.google.dev/gemini-api/docs/changelog`) and TD613's own October 15 audit (`research/marrowline-multipart-repair-20261015/README.md`, line 28) uncovered **two critical pre-execution facts**:

### Fact A — Live Discovery Returns HTTP `200`, But `gemini-3.7-flash` Is Deprecated and Auto-Routed to `gemini-3.8-flash` Since October 8, 2026
| Historical Oct 2 Seat (`ffb98ac005`) | Live `GET /v1beta/models/{id}` (`2026-11-22`) | `outputTokenLimit` / `thinking` | Actual Upstream Routing Status (`ai.google.dev` + Oct 15 TD613 Audit) | Eligible as Independent Arm Today? |
|---|---|---|---|---|
| **Seat 1:** `gemini-3.8-flash` | `200 OK` (`version: "3.0"`) | `65536` / `true` | **ACTIVE flagship, non-aliased** (`thinking_level`: `low`, `medium`, `high`; default `medium`) | **YES** |
| **Seat 2:** `gemini-3.7-flash` | `200 OK` (`version: "3.7-flash-08-2026"`) | `65536` / `true` | **DEPRECATED `2026-10-08` — automatically routed to `gemini-3.8-flash`** (responses return `modelVersion: "gemini-3.8-flash"`) | **NO (`BLOCKED_BY_UPSTREAM_ALIAS`)** |
| **Seat 3:** `gemini-3.6-flash` | `200 OK` (`version: "3.6-flash-07-2026"`) | `65536` / `true` | **ACTIVE previous-generation production model, non-aliased** (default `thinking_level`: `medium`) | **YES *(only as explicitly labeled Redesign A — NOT historical Seat 2)*** |
| **Seat 4:** `gemini-3.5-flash` | `200 OK` (`version: "3.5-flash-05-2026"`) | `65536` / `true` | **DEPRECATED `2026-10-08` — automatically routed to `gemini-3.6-flash`** | **NO (`BLOCKED_BY_UPSTREAM_ALIAS`)** |
| **Seat 5:** `gemini-3-flash-preview` | `200 OK` (`version: "3-flash-preview-12-2025"`) | `65536` / `true` | **ACTIVE preview, non-aliased** | **YES *(optional older preview comparator)*** |

**Scientific Consequence:** Executing a `gemini-3.8-flash` × `gemini-3.7-flash` factorial today would **NOT** test independent historical `gemini-3.7-flash`. Under Q1's strict `STOP_1_MODEL_IDENTITY_HOLD`, the very first `gemini-3.7-flash` slot returning `modelVersion: "gemini-3.8-flash"` halts the run; weakening `STOP_1` would silently run `gemini-3.8-flash` against itself!

**Historical Note (Non-Causal Boundary):** During the Operator's September 30–October 4 healthy High-Zalgo window, `gemini-3.7-flash` was STILL an independent Seat 2 model. On **October 8, 2026**, Google silently began routing `gemini-3.7-flash` → `gemini-3.8-flash` (and `gemini-3.5-flash` → `gemini-3.6-flash`) with zero TD613 commits. This explains why live historical `3.7-flash` is no longer directly callable today (without claiming by itself that the October 8 alias caused the regression).

### Fact B — Historical Oct 2 `server/gemini-generation-envelope.js` Sent `LOW` Thinking to Seats 2–5 (`3.7`, `3.6`, `3.5`, `3-flash-preview`)
Direct inspection of `git show ffb98ac005:server/gemini-generation-envelope.js` (lines `69–74`, unchanged in modern `server/gemini-generation-envelope.js`) revealed:
- Inside `khonapolit-interactive`, `gemini-3.8-flash` resolved `thinkingLevel: "medium"`.
- Inside `khonapolit-interactive`, `gemini-3.7-flash`, `gemini-3.6-flash`, `gemini-3.5-flash`, and `gemini-3-flash-preview` all resolved **`thinkingLevel: "low"`**!
- Therefore, in any **matched-config 2×2 factorial**, pinning BOTH models to **`thinkingLevel: "medium"`** (`generationConfigSha256 = 4785e46e91dfc32f5742dc9fc4ce7414142d62335c7a29e56c1e7e89a1d4ab34`) is a clean, unconfounded **constructed contemporary counterfactual** isolating model identity from thinking tier — NOT a literal replay of historical Oct 2 Seat-2 `low` fallback!

---

## 2. Three Explicit Redesign Choices for Human Operator & Amari Adjudication

Because `gemini-3.7-flash` is blocked by upstream auto-routing to `gemini-3.8-flash`, the executable harness (`run-option1-20slot-discriminator.mjs`) **refuses** `--design-profile=BLOCKED_HISTORICAL_3_7` fail-closed and stages **Redesign A** completely source-hashed while presenting all three clean options for explicit Operator + Amari decision:

| Redesign Option | Exact Design & Slot Count | What Causal Axis It Tests | Tradeoffs & Provenance Label |
|---|---|---|---|
| **Redesign A *(Pre-wired, source-hashed & verified in this PR)* — `OPTION1_REV_A_38_VS_36_CONSTRUCTED`** | **20 slots:** `{CURRENT_HYBRID_A, LITERAL_OCT02_H2}` × `{gemini-3.8-flash, gemini-3.6-flash}` × `{T1, T2}` × `2` reps (`16` Marrowline) + `{gemini-3.8-flash, gemini-3.6-flash}` × `2` reps Oct 15 Task D neutral creative control (`4` neutral), palindromically counterbalanced (`mean slot = 10.50` across every factor), matched `thinkingLevel: "medium"` & `maxOutputTokens: 65536`. | Tests (1) **contemporaneous full-envelope effect (`A` vs `H2`) on `3.8-flash`**, (2) **independent previous-generation Gemini 3.x Flash model effect (`3.8-flash` vs historical Oct 2 Seat-3 `3.6-flash`)** & `model × envelope` interaction at matched `MEDIUM`, and (3) **contemporaneous neutral vertical-stack capability** on both models! | Explicitly labeled **`CONSTRUCTED_CONTEMPORARY_MODEL_IDENTITY_REDESIGN`** (`NOT_HISTORICAL_OCT02_SEAT_2_3_7`). `STOP_1` halts immediately if `3.6-flash` ever returns a different `modelVersion` (or if HTTP `400` rejects `medium`, with zero silent downgrade to `low`). |
| **Redesign B *(Single-Model Alternative)* — `OPTION1_REV_B_38_ONLY_10SLOT`** | **10 slots:** `gemini-3.8-flash` ONLY (`CURRENT_HYBRID_A` vs `LITERAL_OCT02_H2` × `{T1, T2}` × `2` reps = `8` Marrowline + `2` Oct 15 Task D neutral creative controls). | Pure contemporaneous test of full-envelope (`A` vs `H2`) and Nov-2026 neutral capability on `gemini-3.8-flash` alone, without introducing `gemini-3.6-flash`. | Smaller scope; does NOT test cross-model Gemini 3.x behavior if `3.8-flash` flattens under both `A` and `H2`. |
| **Redesign C *(Thinking-Tier Alternative)* — `OPTION1_REV_C_38_MEDIUM_VS_LOW_20SLOT`** | **20 slots:** `{CURRENT_HYBRID_A, LITERAL_OCT02_H2}` × `{gemini-3.8-flash @ medium, gemini-3.8-flash @ low}` × `{T1, T2}` × `2` reps (`16`) + `4` neutral controls (`2` `medium`, `2` `low`). | Directly tests whether `gemini-generation-envelope.js`'s **`MEDIUM` vs `LOW` thinking tier** (the ONLY effective-request difference left between Seat 1 `3.8` and aliased Seat 2 `3.7→3.8` after Oct 8!) alters High-Zalgo flattening on `3.8-flash`. | Isolates thinking tier on `3.8-flash`; does NOT test a distinct older model checkpoint like `3.6-flash`. |

*(Note: **No dollar spending ceiling and no aggregate token-budget ceiling** apply to any separately authorized future study. Executing ANY of Redesign A, B, or C requires a fresh, explicit exact-HEAD Operator authorization.)*
