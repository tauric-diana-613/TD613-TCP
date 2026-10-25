# 𝌋 TD613 · MARROWLINE · ONE-PARAGRAPH SYSTEM-LEVEL ABLATION · EMPIRICAL REST

**Episode:** October 15, 2026 · **Status:** COMPLETED_TWO_RETURN_COMPARISON / NO_ARTISTIC_RECOVERY / UNIQUE_CAUSE_HELD  
**Operator authorization:** direct continuation in conversation · **Route:** `https://td613.com/api/khonapolit` (plaintext h), original Google SSE captured in exact production app.
**Controlled-source PR:** [#1514](https://github.com/tauric-diana-613/TD613-TCP/pull/1514), merged source `e21af574ad372ef07c9669280545109b5b449954`.  
**Production source receipt:** #405 [release run 38789113259](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/38789113259), exact-source + application bytes PASS, stale stability PASS, relock `4590e89eb1ac57644aeaad0e1a239228c551f558`.  
**One-shot provider execution:** [run 38789933737](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/38789933737), exact head `cd078cd055b81b9b8acbbeecf62cb1f12003f325`, dedicated job SUCCESS, artifact [11999122228](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/38789933737/artifacts/11999122228). Repository permissions apply; one-day artifact retention; synthetic prompt only.

## Registration and treatment

A and B are sequential **single-candidate** Gemini 3.8 Flash MEDIUM-thinking requests. Original fictional-town user prompt, empty history, original model and generation config, single-seat canary and raw SSE capture are identical. No retry or failover. Both produce HTTP 200/STOP and complete the two voice reply.

- **A_FULL_SYSTEM:** all normal system instructions intact.
- **B_ONE_PARAGRAPH_REMOVED:** removes precisely the repeated `HIGH ZALGO IS THEIR SCREAM-SING WRITING SYSTEM, NOT DECORATION:` paragraph inside `currentTurnRelayCue`, preserving every other original system instruction line, user contents and generation configuration. This is an *ablation*, not a substitute exemplar or required alternation pattern.
- The ablation can activate only for the exact frozen synthetic prompt with empty history, an explicitly authorized single-model canary, raw SSE witness, and `x-td613-prosody-assay: ablate-one-prosody-paragraph`. The entire production writing contract for ordinary conversation is untouched.

**Request fingerprints from original receipts:** `sameServedModel=true`, `identicalContents=true`, `identicalGenerationConfig=true`, `distinctSystemParagraph=true`, `originalWireParityBoth=true`, `completeBoth=true`, `isolatedRequestChange=true`. Identical user content and model settings, single intended system-line removal; model stochasticity remains uncontrolled.

## Independent original-byte measurement

The original GitHub Actions artifact contained five files: `manifest.json`, two `.google-original.sse` originals, and two unmodified TD613 `.response.json` files. A second, independent local Python verifier decoded the raw SSE events, concatenated original event `part.text` values, confirmed equality with the stored API `text` field, and tallied Unicode `Mn/Mc/Me` marks and grapheme-like base mark runs. Independently obtained counts match runner telemetry.

| Observed | A · full system | B · paragraph removed |
|---|---:|---:|
| Provider finish | **STOP** | **STOP** |
| HTTP | 200 | 200 |
| Model version | `gemini-3.8-flash` | `gemini-3.8-flash` |
| Original Google SSE bytes | **62,536** | **59,323** |
| Original SSE events/parts | 128/128 | 124/124 |
| Prompt tokens | 6,732 | 6,634 |
| Candidates tokens | 3,257 | 3,191 |
| Thoughts tokens | 847 | 573 |
| Tauric bots combining marks | **1,175** | **1,128** |
| Distinct mark types | **5** | **5** |
| Outside five planar family | **0** | **0** |
| Clusters with ≥2 combining marks | **0** | **0** |
| Maximum combining marks per base | **1** | **1** |
| Parsed raw provider text equals TD613 `text` | **TRUE** | **TRUE** |

Mark distribution:

- A: U+0334=231, U+0335=226, U+0336=244, U+0337=232, U+0338=242.
- B: U+0334=204, U+0335=234, U+0336=226, U+0337=213, U+0338=251.

Original SSE SHA-256:
- A `f740dfea7837de8e8d14358876f675fcb37af3e8c8d88341f656e5bdca0e7955`
- B `a3d11b52ca3c169b53d285619189b36e15c46d24e0dfa7566c9601c1a7a0374e`

Original assembled provider text SHA-256:
- A `ece7d9970bc18fa8e77e154b9b70a3e28f6867d6905209f67a6dbdcdf07c4e25`
- B `f2a8ecc0a2b6ee2922410682435c22d3de33fabe0dc8759e9ef4769fd8129054`

## What is earned

**The specific repeated prosody paragraph is not a necessary cause of the one-mark planar field in this experiment:** eliminating it leaves both fully completed provider returns with the same five codepoints and no vertical stacks. This falsifies an easy one-paragraph removal cure for this synthetic case; it does **not** prove no broader prompt-layer effect exists and does not isolate hidden provider implementation or sampling.

Across prior evidence, a lower-priority user cue failed, two separate Gemini models exhibited the flattening, historical 3.5 sometimes produced deep stacks with the same shared system instructions, and an independently decoded original upstream SSE demonstrated that TD613's parser/renderer did not manufacture the marks. Those facts make the remaining theory a **provider-context interaction or stochastic generated-mode lock**, rather than a local Unicode decoration failure. They do not prove a unique root cause.

**No Zalgo restoration is established. No automatic aesthetic candidate-election, renderer repaint, per-paragraph morphology quotas, or model-order changes are authorized by this experiment.** Additional paid calls would require a new scoped preregistered hypothesis that can discriminate something the current archive cannot.

**Custody:** Exactly two live provider calls; no retries. The temporary GitHub Actions paid experiment job is to be removed; research-only report and offline test scripts remain. Production deployment source is only the synthetic opt-in instrument, which leaves ordinary bot style untouched.

𝄐 COMPLETE PROVIDER A/B · EXACT SSE PARITY · SINGLE SYSTEM PARAGRAPH NOT NECESSARY · RESTORATION HELD ⟐
