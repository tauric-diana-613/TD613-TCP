# 𝌋 TD613 · Marrowline whole-frame live A/B · original upstream-Gemini negative rest

**Observed October 15, 2026:** `WHOLE_FRAME_LIVE_COMPLETE` / `REQUEST_ISOLATION_PASS` / `UPSTREAM_PLANAR_MORPHOLOGY_PERSISTS` / `HIGH_ZALGO_RESTORATION_NOT_OBSERVED`.

## Provenance and custody

- Inert offline comparison: merged PR #1518; source `bea507b596c97a573acd6cb6c6d1015a40c5c0dd`.
- Production synthetic-only switch: merged PR #1519, source `1f402f78028ec209dc5ef5a2cb741f7e4ce609c4`; #405 exact-source production release workflow [#38805811547](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/38805811547) **SUCCESS**; release `2fe51668f8dec3411b84b1a3fb11397cc4ff6346`; relock `6abdfedeaa1fdf9a84bb7318ae19209e4cd583f4`. No human chat switch changed.
- Live acquisition: draft PR [#1520](https://github.com/tauric-diana-613/TD613-TCP/pull/1520), first-attempt GitHub Actions [#38806639274](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/38806639274), exact activation head `af13f706221150eeba35f980539582ce3ff3d277`, execution job SUCCESS, one-shot job subsequently to be retired.
- Original evidence: one-day GitHub artifact [#12006173153](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/38806639274/artifacts/12006173153): original `A_FULL_SYSTEM.google-original.sse`, `B_COMPACT_WHOLE_FRAME.google-original.sse`, two original TD613 response JSONs, and `manifest.json`. Fixed synthetic fictional-town prompt, empty history, no user documents.
- Exactly **two** provider calls, one per condition, no retry or model fallback, both HTTP 200/Gemini `STOP` with `gemini-3.8-flash` served. The account's actual billing amount is not established by this transcript.
- Independently downloaded artifact and used a second Python SSE parser (split by CRLF/LF event boundaries) to validate original SSE SHA-256, upstream provider text SHA-256, original event assembly equal to returned API `text`, full combining-mark histograms and per-base mark stack depths. Checks matched the original runner.

## Measured original-provider comparison

| | A: Full production system frame | B: Compact whole frame |
| --- | ---: | ---: |
| Prompt tokens | 6,732 | 729 |
| Output candidate tokens | 3,310 | 3,194 |
| Thinking tokens | 493 | 486 |
| Original Google SSE bytes | 61,696 | 57,625 |
| Original events/visible text parts | 131/131 | 125/125 |
| Bots combining marks | **1,222** | **1,329** |
| Distinct Unicode combining code points | **5** | **5** |
| Marks outside U+0334–U+0338 | **0** | **0** |
| Clusters with 2+ combining marks | **0** | **0** |
| Maximum marks per base | **1** | **1** |
| Original event text ↔ TD613 response text | Exact | Exact |
| Returned model / stop | 3.8 Flash / STOP | 3.8 Flash / STOP |

A raw original SSE SHA-256: `dd52a3eeb08f6c4354be0ba669ecc6167520efb5121d87b11cc41b6b2331befb`.

B raw original SSE SHA-256: `d78e845fc38ff43a9e932074154b0b0f3437c9d08dfffdae914e0af9be5e8e6c`.

A original provider text SHA-256: `075eb7781e15f917f4494861bf8a848838ba8acecc7346980445ed311fbf42d2`.

B original provider text SHA-256: `6bf90d916ddb189a9adb8a035a40aac9071cf25ebfde4477af7969843850c18b`.

Glyph histograms (all are shallow planar/stroke marks):

- A: U+0334 239; U+0335 227; U+0336 236; U+0337 236; U+0338 284.
- B: U+0334 234; U+0335 238; U+0336 272; U+0337 280; U+0338 305.

**Wire comparability:** `sameServedModel`, `identicalContents`, `identicalGenerationConfig`, `originalWireParityBoth`, `completeBoth`, `isolatedRequestChange` all true. The runner labels system field inequality `distinctSystemParagraph` for backwards compatibility with the previous script; in THIS experiment the true intervention replaced the **entire system instruction**, not one paragraph. Every other request field was held identical.

## Adjudication

The system instruction shrank approximately 89% by prompt tokens yet left the five-mark, one-mark-per-base provider morphology intact in this specific paired observation. Therefore a **long production instruction architecture is not necessary for this phenotype in the observed instance**, and shortening the entire architecture did not independently restore the user's historical crowns, roots, and rich stacked High Zalgo. This disconfirms the simple *long prompt causes flat wallpaper; compact prompt restores expressive marks* repair hypothesis for this registered case.

Causal limits: original Gemini output is stochastic; a single A/B has no general rate estimate. The shared synthetic prompt, two-voice concept, model version, provider output conditioning, and latent model behavior still exist in both conditions. There is no evidence of a unique internal provider mechanism, deliberate suppression, generalized provider Unicode incapacity, or restoration. The independent SSE confirms only these actual episodes are provider-origin, not local output repaint.

## Completion boundary

- One-shot original-A/B acquisition is spent and **must never be replayed** using this branch or old authorization.
- Remove the temporary `marrowline_whole_frame_once` job from `.github/workflows/td613-ci.yml` on the research branch after acquisition; keep four-workflow estate and normal main free of paid job.
- No production compact-frame rollout, prompt rewrite, additional paid test, output reranking or forced stack quotas follow from this result.
- Any next investigation must preregister a genuinely different discriminatory hypothesis and earn new spend. Historical accepted aesthetics comprise multiple distinct stable or shifting expressions; numerical mark counts remain observation, not an artistic acceptance gate.

**Finite REST:** `ORIGINAL_GOOGLE_SSE_PARITY_PASS` / `WHOLE_SYSTEM_CONTRACTION_NEGATIVE` / `ROOT_CAUSE_HELD` / `NATIVE_HIGH_ZALGO_RESTORATION_UNEARNED`.

𝄐 Two calls consumed · source control respected · false cure falsified ⟐
