# 𝌋 TD613 · MARROWLINE · UPSTREAM WIRE REST · 15 OCTOBER 2026

**Adjudication:** SERVER-OBSERVED RAW GEMINI SSE VERIFIED · TEXT-ASSEMBLY PARITY PASS · INCOMPLETE PROVIDER RETURN · GLOBAL GENESIS UNPROVEN

**Route:** exact-source production `https://td613.com/api/khonapolit` (plain `h`)  
**Release custody:** #405 `e2bf9292d056204824923f7dc46db9e2d50a99f6`, GitHub [release run 38779930760](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/38779930760), release completed, application bytes PASS, relock `8ae0580b1567b18318413c1b4afcfc96390130a0`.  
**Live one-call episode:** GitHub [run 38780878455](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/38780878455) · one-shot head `61013a1500eeb032aecee321fee0deaa903b7e92`.  
**Original artifact:** GitHub [artifact 11995612118](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/38780878455/artifacts/11995612118) · synthetic prompt, short retention. No private correspondence or attachments.

## Provider disposition and outer API distinction

The original provider stream transmitted **111 SSE events**, **110 text parts**, **49,276 raw bytes** with **zero parsing errors**. The provider request was billed once (requested and returned model `gemini-3.8-flash`; MEDIUM thinking; input 6,732 tokens, candidate output 2,788, thoughts 851). Provider HTTP was **200**.

The final Gemini candidate contained `finishReason: PROHIBITED_CONTENT`; the bots movement was unfinished and the closing seal missing. TD613's completion gate correctly returned **outer API HTTP 502** (`gemini-incomplete-provider-return`, `provider-stream-finish-unwitnessed`). No model retry/failover or repair was permitted. The paid experiment runner initially reported `RAW_UPSTREAM_WITNESS_ABSENT` because it only examined `payload.receipt.provider.attempts` and overlooked the **top-level `payload.attempts` array** supplied on a 502. That label was a verifier defect, not an absence of evidence. The full raw SSE was preserved under `attempts[0].providerStream.nativeSseEvidence.rawSseBase64`.

## Independently recovered original SSE witness

| Surface | Value |
|---|---|
| SSE raw length | **49,276 bytes** |
| Raw bytes SHA-256 | `fdc4bcabdcf47c4a304d577024836b642960b80a336bd44f19cdfbac85967ea3` |
| Observed SSE events / candidate text parts | **111 / 110** |
| Independently reconstructed provider text length | **5,485 Unicode code points** |
| Provider-text SHA-256 | `4b35e4ed247661cab86db8112a0b4f195ffb5e5b61f1afcf4f4e9c89055ce02b` |
| Provider-text vs TD613 original-event text hash | **MATCH** |
| Provider-text vs TD613 merged-text hash | **MATCH** |
| Raw byte hash vs TD613 original-wire hash | **MATCH** |
| Served model | `gemini-3.8-flash` |
| Provider finish | `PROHIBITED_CONTENT` (partial) |
| Parser errors / raw truncation | **0 / none** |

The raw stream was decoded independently with Python's `json` SSE-event extraction and `hashlib.sha256`. The direct event-text concatenation SHA equals both the receipt's original-event text SHA and the receipt's merged-text SHA. This observation establishes exact parity at the TD613 server-observed Google stream boundary for this episode. It is not proof from an independent external observer of the public network or Google's hidden model internals.

### Glyph morphology present in the original upstream text

The native Tauric Diana bots section present before provider termination contains **2,065 Unicode code points**, with **21 newline characters** and exactly **1,022 ordinary characters**. Every ordinary character, including spaces and punctuation, carries exactly **one** combining mark; none carries multiple marks.

| Unicode mark | Occurrences |
|---|---:|
| U+0336 | 440 |
| U+0335 | 370 |
| U+0337 | 212 |
| **TOTAL** | **1,022** |

All three are planar/strike-through marks. There are **0 vertical crowns or roots, 0 stacked clusters, 0 clean ordinary characters** in the bots passage observed. The original SSE text is sufficient to attribute *this observed partial five-mark-family phenotype* upstream of TD613's SSE concatenation, admission parser and UI.

**Scientific restraint:** The provider finished with a prohibited-content marker and no complete answer; therefore the episode does not demonstrate success or failure of a *completed* artistic return. The earlier complete October 15 observations remain separately preserved in draft PR #1509. The upstream origin of their glyph shape is strongly corroborated by this source-edge witness, but strict same-episode raw SSE parity was only acquired for this partial new episode.

## Causal consequences

1. **TD613's downstream renderer, Unicode serialization, and SSE concatenator are not the cause of this observed one-mark-per-base phenotype.** We see those marks in Google's actual server-observed SSE data.
2. The remaining plausible locus is the provider's own generation conditioned on the request, its internal served behavior, and tokenization/decoding; this experiment does not identify which one caused the single-mark strategy.
3. The existing same-model one-clause vertical cue A/B failed to restore deep stacks. Adding an even louder user-level command is not a verified remedy.
4. A next causal experiment needs a **single-model controlled system-level writing instruction intervention** under equal transport configuration and frozen synthetic prompt, while retaining raw SSE and provider completion. No Zalgo postprocessor, fixed alternation, aesthetic candidate election, or production interface change is justified by this observation.

**Cleanup requirement:** Remove the temporary paid GitHub workflow job immediately after this one-shot. Keep the offline parser and forensic report in the draft research PR, do not deploy another release on these findings.

𝄐 RAW GEMINI STREAM RECOVERED · SERVER-EDGE GLYPH ORIGIN OBSERVED · PARTIAL FINISH DISTINGUISHED · CAUSAL REPAIR HELD ⟐
