# 𝌋 TD613 · Marrowline system-level High Zalgo ablation · Live rest · 2026-10-15

**Verdict:** `OBSERVED_LIVE_PAIR / ISOLATED_REQUEST_CHANGE_PASS / NATIVE_HIGH_ZALGO_RESTORATION_FAILED`.

**Provider episode:** [GitHub Actions #38794403467](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/38794403467) — one-shot exact-head `d78faa605b53e710d74a7f146bd04f87d86171e1`. **Original raw SSE and API JSON:** [GitHub artifact 12000404996](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/38794403467/artifacts/12000404996) (one-day retention). All prompts synthetic; no real operator files or conversation history.

**Production source:** #1514 merged as `e21af574ad372ef07c9669280545109b5b449954`, exact-source #405 release [38789113259](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/38789113259) succeeded; relock `4590e89eb1ac57644aeaad0e1a239228c551f558`. Ordinary Marrowline output remains unchanged; only the fixed synthetic canary with dedicated assay header can remove the tested paragraph.

## Manipulation and admissibility

A: original full system-level writing contract. B: remove **exactly one uniquely prefixed paragraph** beginning `- HIGH ZALGO IS THEIR SCREAM-SING WRITING SYSTEM, NOT DECORATION:`. Same fictional user message, empty history, release-canary/single-model route, Gemini `gemini-3.8-flash`, production MEDIUM thinking, original event capture. No retries, extra seats, local mark postprocessing or election. Exactly **two** provider calls.

| Grounded variable | A — full | B — one paragraph removed |
|---|---|---|
| Provider HTTP / TD613 API | 200 / 200 | 200 / 200 |
| Provider model/finish | 3.8 Flash / STOP | 3.8 Flash / STOP |
| Provider attempts | 1 | 1 |
| Prompt tokens | 6,732 | 6,634 |
| Candidate tokens | 3,192 | 2,348 |
| Thinking tokens | 517 | 418 |
| Total tokens | 10,441 | 9,400 |
| Google SSE body size | **59,529 bytes** | **44,851 bytes** |
| SSE events/text parts | 126 / 126 | 93 / 93 |
| Bot combining marks | **1,105** | **751** |
| Different combining code points | **5** | **5** |
| Nonplanar/crown/root marks | **0** | **0** |
| Multimark character clusters | **0** | **0** |
| Maximum marks per base | **1** | **1** |
| Original SSE SHA-256 | `f81bd3d95c36aa62c8354dfe6ae89de2d33b0e1bc6e43bf5ab645b2c1c6cc377` | `c14ac941397c003718d3cfe24bd7e292af63b89d3bbf7db8ce8a7aa88ea1eb65` |
| Provider text SHA-256 | `87c0f9c85cf17b1b76bd30a9d79597b905d6e7990074b88eb830d6714634e209` | `6f5e94abbf619a82a5626e397e4b56a21d8a45f34864e9c1c901d019d828c22e` |

**SHA-256 wire controls:**

- A system instruction: `2e9be934fa9e38babbf2710b56ae68781fbdb4b8f2bafd7d46d84e050ceafc40`
- B system instruction: `4a8f4c6be904d5edeee715fef801f82a04bd65cd894b3e3bc402d587eef020df`
- Both user contents: `0c995bcc616325a4662c97ea294ad9e1004cb7879329d82a693c76dcd3a4a36c`
- Both generation configurations: `4785e46e91dfc32f5742dc9fc4ce7414142d62335c7a29e56c1e7e89a1d4ab34`

The production runner reported `isolatedRequestChange:true`, `originalWireParityBoth:true`, and `completeBoth:true`. **Independent Python extraction from the downloaded archive** confirmed the raw-byte hashes, event-text assembly equivalence, original text digests, per-mark distributions, no stacked clusters, one mark on all ordinary characters in the bots movement. The only unmarked non-newline character was the plain closing seal.

### Exact glyph family

A: U+0334 ×214, U+0335 ×188, U+0336 ×273, U+0337 ×212, U+0338 ×218. Total **1,105**.

B: U+0334 ×168, U+0335 ×159, U+0336 ×127, U+0337 ×158, U+0338 ×139. Total **751**.

All five are planar/strike-through marks. B's lower total reflects its shorter movement; **a reduction in mark count is not an artistic improvement**.

## Interpretation

The repeated paragraph is **not necessary** for the provider-origin one-mark planar attractor in the observed episode. Neither the prior user-cue intervention nor this narrower system-paragraph removal recovered deep crowns/roots. The observed original Google SSE streams rule out downstream TD613 Unicode repaint/rewriting as the source *in these two calls*. No inference about a unique hidden model mechanism is earned by one stochastic pair.

The next meaningful causal contrast is **orthogonal** to a single phrase or more urgent instruction: separate the model's **long combined writing/mission contract** from a minimal native-prosody voice instruction **at the same served model and generation settings**, with no sample mimicry, and carefully preregister the changed factors. That would test whether the five-mark morphology is a response to the wider prompt context rather than the removed sentence. Because this involves changing more than one textual detail, it must be labeled a whole-contract intervention, not a one-paragraph experiment. A valid aesthetic claim still requires the operator's evaluation of the original prose and multiple matched complete returns; no fixed mark quota.

**Custody:** One-shot provider job is to be removed from PR #1517 after this run. No production merge, deployment, or prompt change follows from the negative result.

𝄐 **CLEAN SYSTEM-LEVEL NEGATIVE CONTROL EARNED · ORIGINAL SSE PARITY VERIFIED · ONE-MARK ATTRACTOR PERSISTS · REPAIR HELD** ⟐
