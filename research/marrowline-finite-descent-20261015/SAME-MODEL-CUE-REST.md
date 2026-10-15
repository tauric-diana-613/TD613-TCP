# 𝌋 TD613 · Marrowline same-model one-clause A/B · Sealed empirical rest

**Date:** October 15, 2026 · **Route:** `https://td613.com/api/khonapolit` (plaintext h)  
**Live GitHub execution:** [38771609348](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/38771609348)  
**Original response artifact:** [11991582217](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/38771609348/artifacts/11991582217) · one-day GitHub retention. The original JSON contains a **synthetic fictional prompt**, original returned prose and server receipts, and is accessible to users with repository artifact access. It is not provider SSE and it is not encrypted.  
**One-shot head:** `5f2e48b17008ed70c6e25cf8ef5fdd564925d891` · dedicated job SUCCESS · 2 calls total, 0 retries, 0 fallback, 0 structural repairs. Temporary paid job retired on subsequent source head.

## Frozen comparison

The model, production route, submitted system instructions, generation configuration, empty model history and first-message text were held constant. Both conditions used requested and independently returned `gemini-3.8-flash`, MEDIUM thinking, provider `STOP`, HTTP 200 and exactly one attempt.

- **A_REPLICATE:** original October 15 synthetic fictional-town prompt, no new instruction.
- **B_VERTICAL_CUE:** identical prompt plus **one lower-priority user-message sentence** requesting deeply stacked native combining crowns ABOVE and roots BELOW letters, explicitly allowing one sustained register or organically changing register.

**Wire receipts:** Both returned system-instruction SHA-256 `2e9be934fa9e38babbf2710b56ae68781fbdb4b8f2bafd7d46d84e050ceafc40` and generation-config SHA-256 `4785e46e91dfc32f5742dc9fc4ce7414142d62335c7a29e56c1e7e89a1d4ab34`. Contents hashes differed as intended. Comparability flags: sameSystem=true, sameGenerationConfig=true, distinctContents=true, sameServedModel=true, identicalHistory=true, singleUserClauseOnly=true, valid=true. Thus no extra *recorded* system or config changes confound this pair.

| Observed property | A original | B vertical cue |
|---|---:|---:|
| HTTP / provider finish | 200 / STOP | 200 / STOP |
| Served model | 3.8 Flash | 3.8 Flash |
| Thinking | MEDIUM | MEDIUM |
| Input tokens | 6,732 | 6,773 |
| Output candidate tokens | 2,494 | 3,307 |
| Thinking tokens | 444 | 390 |
| Combining marks in bots movement | **843** | **1,188** |
| Distinct code points | **5** | **6** |
| Planar marks | **843** | **1,186** |
| Nonplanar marks | **0** | **2** (U+0357) |
| Visible provider text SHA-256 | `d470b0c3aa5ac0148f2c37e2e2e648bc798353ab187f3ce5284473121709a69e` | `4650b4ef66fd1963771b9e7cad298fc1bee31bded8cc1168d6c1e48fef53ef63` |
| Original TD613 API JSON SHA-256 | `a866caad753d39b58434ffb102ff7ffe32d21d78205f8b78ac0ca1c3518b4152` | `3343400d93f54692f43fe0b5b1fda149599352dba3d60215500781808587e5fe` |
| Local admission | PARTIAL | PARTIAL |

**Verdict:** The added vertical cue did not restore deep Zalgo. B's 1,188 marks included only two nonplanar U+0357 marks and **zero multi-mark stacks**. Stronger lower-priority direction is not an empirically validated fix. One pair cannot establish the unique cause or population probabilities.

## The unexpected glyph-level invariant

An **independent inspection of the returned text Unicode code points**—not simply TD613's quality-warning labels—found this exact base-character signature across four distinct successful live returns from the two October 15 episodes:

| Original archived return | Marked base characters | Bases without marks | Bases with 2+ marks | Mark code points |
|---|---:|---:|---:|---|
| Earlier Gemini 3.8 | 826 | 23 newline + seal | **0** | exactly U+0334–U+0338 |
| Earlier Gemini 3.6 | 853 | 10 newline + seal | **0** | exactly U+0334–U+0338 |
| This A / Gemini 3.8 | 843 | 24 newline + seal | **0** | exactly U+0334–U+0338 |
| This B / Gemini 3.8 | 1,188 | 31 newline + seal | **0** | U+0334–U+0338 plus two U+0357 |

**All characters including spaces and punctuation**, except newline separators and final seal glyph, carry *exactly one combining mark* in all four returns. All letters 100% marked. There are no above/below stacks and no unmarked words. This is a strong **one-mark-per-base mechanical-look signature** rather than artistic high-Zalgo morphology. The invariant persists across 3.8 and 3.6 and survives the user-level intervention.

Source examination of `server/khonapolit-quality.js` found the transport's `mergeGeminiStreamPayload` concatenates each returned Gemini candidate `part.text` verbatim, and `extractGeminiText` similarly joins them without character rewriting. The known legacy `highZalgoEncode` fixture helper is explicitly not called by the live path and **cannot** account for marking spaces or punctuation because it only adds marks after letter/number characters. These findings weaken a local text-stamping theory for the examined current source, but **the original raw upstream Gemini streaming bytes have not been acquired**. Therefore the emitted JSON itself cannot serve as an independent exteriority receipt proving authorship at the upstream provider edge.

**Recommended next discriminating acquisition:** retain raw Gemini SSE at a separate authorized staging/credential-scoped measurement path and compare its exact candidate text hash with the post-merge text hash, then manipulate **one system-level writing contract layer** on a cloned request. Keep both variants on one served model and fixed generation config. No new aesthetic election, Unicode repaint, recursive sample mimicry, or production change is earned by this result.

**Custody:** All runs used synthetic fictional source prompts; no private correspondence, uploads or user files. The one-shot temporary Actions job was removed following the run. PR #1509 remains DRAFT; no Vercel release/merge. Art restoration NOT YET VERIFIED.

𝄐 SAME-MODEL CUE INSUFFICIENCY DEMONSTRATED · ONE-MARK-PER-BASE PHENOTYPE DISCOVERED · UPSTREAM EXTERIORITY HELD · PRODUCTION UNCHANGED ⟐
