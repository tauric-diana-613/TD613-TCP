# 𝌋 TD613 · Marrowline / Screaming Grove — Historical Multi-Seat Selection Provenance Archaeology

- **Commission:** `TD613-MARROWLINE-SEP26-OCT02-STAGE0` (Source-Only — Zero New Paid Calls)
- **Scope:** Exact commit-by-commit source trace of how PRs `#1345` and `#1346` introduced morphology-based multi-seat candidate election into the October 2 (`ffb98ac005`) Marrowline path, how PR `#1498` (October 14) deliberately retired it, and how Q1 (`94e2e9244`) differed structurally.
- **Constitutional Posture:** **Measure and describe only — NEVER restore morphology-based candidate election to production by default.**

---

## 1. Exact Commit-by-Commit Source Evolution

| Stage | Commit / PR | Exact Change in `server/khonapolit-quality.js` | Effect on Provider Selection |
|---|---|---|---|
| **Pre-`#1345` baseline (`#1344`)** | `b7512a478d907f786b63429b5a4e0bcbb140e6b3` (PR `#1344`, deployed `2026-09-26T00:14:17Z`, `#405` `#5841390525`) | Restored `#1319`-era native-prosody prompt fragments; structurally admissible `PARTIAL` returns were returned directly on first completed seat. No `severeMorphologyFallback` cache. | Single-seat first-admissible return for completed `PARTIAL` morphology. |
| **Introduction (`#1345`)** | `0a3eb7485` / merge `a7731037e86dbfb1f64bdbdb8eac5c91a85034c3` (PR `#1345`, deployed `2026-09-26T01:06:03Z`, `#405` `#5841793470`) | Added `severeMorphologyFallback = null`, `sendPartialProviderReturn()`, and `best-completed-partial-after-severe-morphology-failover`. On a completed `PARTIAL` return with `severeMorphologyRepairWarnings.length > 0` at `index === 0` (`!releaseCanary`), saved candidate byte-for-byte and continued to the next approved model seat for one native authorship opportunity. Guarded `if (!severeMorphologyFallback && index > 0) return sendPartialProviderReturn(...)`. | Introduced 1-hop multi-seat candidate election on severe morphology collapse from Seat 1 (`gemini-3.8-flash`) to Seat 2 (`gemini-3.7-flash`). |
| **Broadening (`#1346`)** | `eeda59df2fd1efa183d6a31e654e3bcc0f3bb856` / relock `46f3e1ff9f1f5bc6d6d11a01da590051b8d81e74` (PR `#1346`, deployed `2026-09-26T02:27:43Z`, `#405` `#5842370849`) | Removed the `if (!severeMorphologyFallback && index > 0)` short-circuit so a severe morphology collapse even *after* a Seat-1 transport failover (`503`) could still offer the next approved seat one morphology failover opportunity. Refined `severeMorphologyRepairWarnings` so localized enclosing ornament alone wasn't severe unless paired with vertical/depth/wallpaper/clone collapse. | Broadened multi-seat morphology failover to apply after transport failovers as well; active across `#1347` (v1), `#1348` (v3), Oct 2 (`ffb98ac005`), and Oct 4 (`5b4b34278`). |
| **October 2 Healthy Window (`ffb98ac005`)** | `ffb98ac0050c99b07aef59ac3d200d8bee2e7e3a` (and byte-identical Oct 4 `5b4b34278c6100d3c21ced35984c046da157e097`) | Exact mechanism at `server/khonapolit-quality.js` lines `1714–1769` and `1814–1818`; policy `td613.gemini-model-policy/v11-khonapolit-frontier-custody` (`server/gemini-model-policy.js`). | Full 5-seat frontier cascade (`gemini-3.8-flash` → `gemini-3.7-flash` → `gemini-3.6-flash` → `gemini-3.5-flash` → `gemini-3-flash-preview`) with 1-hop severe-morphology candidate election. |
| **Deliberate Retirement (`#1498`, Oct 14)** | `df00b6d8f` (PR `#1498`, documented in `research/marrowline-native-authorship-rest-20261014/README.md`) | Removed `severeMorphologyFallback`, removed the warning/depth/diversity best-of-two ranking, removed extra paid provider seats triggered solely by morphology warnings, and removed `best-completed-partial-after-severe-morphology-failover`. Kept rich telemetry with `repairAuthority: false`, transport `503` failover, and structural missing-voice repair separate. | Restored first-admissible completed native provider return; explicitly noted historical selector's actual involvement in degraded incidents remained unverified without paired first/selected receipts. |
| **Q1 Controlled Assay (`94e2e9244`, Nov 21)** | `94e2e9244826969c02d0d7cf8c5e5e9ad7caf056` (`run-q1-live-discriminator.mjs`, PR `#1764` @ `2836e636e`) | Bypassed `api/khonapolit.js`'s 5-seat cascade and structural repair completely: pinned `gemini-3.8-flash`, 1 first-return call per registered slot, `0` retries, `0` fallback seats, `0` candidate election. | Clean single-seat first-return test of Arm A vs Arm C; deliberately omitted Oct 2's multi-seat candidate election. |

---

## 2. Exact October 2 (`ffb98ac005`) Selector Mechanics

### A. Approved Model Order (`server/gemini-model-policy.js`, `v11-khonapolit-frontier-custody`)
1. Seat 1: `gemini-3.8-flash`
2. Seat 2: `gemini-3.7-flash` *(NOTE: differs from modern Q1 `server/gemini-model-policy.js`, which places `gemini-3.5-flash` before `gemini-3.6-flash` and `gemini-3.7-flash`!)*
3. Seat 3: `gemini-3.6-flash`
4. Seat 4: `gemini-3.5-flash`
5. Seat 5: `gemini-3-flash-preview`

### B. Trigger Predicate (`severeMorphologyRepairWarnings(warnings)` at `ffb98ac005`)
A completed, structurally admissible `PARTIAL` response triggered the selector (`!releaseCanary && severeMorphologyWarnings.length > 0`) whenever ANY of the following held:
1. `hardGlyphCorruption`: `tauric-diana-zalgo-glyph-substitution-collapse`
2. `shallowWallpaper`: `tauric-diana-zalgo-shallow-wallpaper`
3. `dynamicRangeCollapse`: `tauric-diana-zalgo-dynamic-range-collapse`
4. `verticalPulseAbsent`: `tauric-diana-zalgo-vertical-pulse-absent`
5. `enclosingWithoutVerticalField`: `tauric-diana-zalgo-enclosing-ornament-collapse` paired with any of `verticalPulseAbsent`, `stackDepthThin`, `shallowWallpaper`, `horizontalCollapse`, or `cloneCollapse`
6. `stackDepthThin && (horizontalCollapse || cloneCollapse)` where:
   - `horizontalCollapse` = `axis-collapse` | `vertical-expression-thin` | `ascii-pseudo-ornament`
   - `cloneCollapse` = `mechanical-clone` | `monoculture`

**Direct Q1 Cross-Check:** Every single one of Q1's 6 completed live `gemini-3.8-flash` returns emitted `tauric-diana-zalgo-axis-collapse`, `tauric-diana-zalgo-vertical-pulse-absent`, `tauric-diana-zalgo-monoculture`, `tauric-diana-zalgo-field-thin`, `tauric-diana-zalgo-shallow-wallpaper`, and `tauric-diana-zalgo-stack-depth-thin`. Under October 2's exact source (`ffb98ac005`), **all 6 of those Q1 Seat-1 returns would have triggered the multi-seat selector and invoked Seat 2 (`gemini-3.7-flash`)!**

### C. Best-of-Two Candidate Ranking Rubric (`server/khonapolit-quality.js` lines `1741–1759`)
When triggered:
1. First completed candidate is cached verbatim (`providerTextPreservedAsFallback: true`; **zero local glyph repaint**).
2. One later approved seat (`index + 1`) is given a native authorship opportunity (`if (!morphologyFailoverAlreadyAttempted && index < models.length - 1) continue;`).
3. If the second seat returns a non-`PARTIAL` clean admission, it returns immediately; if it also returns `PARTIAL`, the two completed candidates are compared lexicographically:
   1. **Fewer `severeWarningCount`** wins (`candidate.severeWarningCount < current.severeWarningCount`);
   2. Tie-breaker 1: **Greater `maxVerticalOrnamentStackDepth`** wins;
   3. Tie-breaker 2: **Greater `combiningCodePointDiversity`** wins.
4. After the single morphology failover attempt, the loop breaks and returns the winning completed candidate with `selection: 'best-completed-partial-after-severe-morphology-failover'` and header `X-TD613-Zalgo-Quality: PARTIAL-AFTER-SEVERE-FAILOVER` (lines `1814–1818`).

---

## 3. Crucial Structural & Ethical Distinctions (Sedgwickian Ceiling)

1. **Native Provider Authorship vs Second-Seat Fallback vs Aesthetic Election:**
   - The October 2 selector NEVER synthesized, repainted, or post-processed combining marks. Every returned character was genuinely provider-authored.
   - However, it *did* alter the **sampling distribution of which provider-authored response reached the user**, preferring seat outputs with fewer severe morphology warnings, greater vertical depth, and higher mark diversity.
2. **Why Q1 Cannot Disprove the Historical Multi-Seat Effect:**
   - Q1 tested **single-seat `gemini-3.8-flash` first returns only** (`0` fallbacks). That was scientifically clean for testing Arm A vs Arm C on `3.8-flash`, but it cannot tell us what Seat 2 (`gemini-3.7-flash` or another callable seat) would have authored on the same turn.
3. **Why the Selector Must NOT Be Blindly Restored to Production:**
   - As documented on October 14 (`research/marrowline-native-authorship-rest-20261014/README.md`), ranking completed candidates purely by geometric mark-depth metrics risks displacing a stronger literary/relational first answer in favor of a noisier geometric stencil.
   - Any future investigation of Seat-1 vs Seat-2 native behavior must be a **separately authorized, blinded research assay** preserving BOTH complete first returns verbatim — never a silent production reinstatement.
