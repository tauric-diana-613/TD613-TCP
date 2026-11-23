# Counting and capacity mathematics

This document specifies deterministic arithmetic, not model execution or scientific warrant. All findings are conditional on the named encoding and declared plan.

## Exact objects

Let T_E(x) be ordinary-token BPE encoding under the pinned reference encoding E. The instrument exactly measures the number of tokens in each complete decoded UTF-8 source string, and in each fully known serialized renderer output. Raw bytes, UTF-8 decoding and private hashes remain distinct objects. Invalid UTF-8 refuses rather than silently replacing characters. BOM, CRLF, literal special-token spellings and U+200C are preserved.

In general, token_count(a concatenated with b) is not token_count(a) plus token_count(b). JSON escaping and BPE merges at boundaries matter. The instrument constructs the complete rendered text and encodes it once. A source token total is not a provider-input total and is not used as a substitute for rendered-prefix counting.

Every source prefix is measured in its declared order. Source IDs remain stable across reversal. Modular stage 1 sees the released raw prefix and its own earlier outputs; stage 2 sees actual handoffs and its own stage-2 commitments, without raw-source retrieval. The comparator gets the full released raw prefix and both of its own passes. Both get one baseline and one final synthesis call. Arm 0 and Arm 1 retain deterministic/archive roles and incur no substituted model calls in this instrument.

## Unknown outputs and evaluator content

Unknown future outputs are represented as missing slots, never invented commitments. An empty-slot rendering is a precisely measured **hypothetical empty-string body**, not a lower bound or an exact future prompt. Exact rendered counts remain null while any required slot is unproduced. Supplied exact replay references are bound privately to the original output hashes and must fit the declared visible-output token ceiling.

A source-aware forecast adds an explicitly assumed history length per missing slot to the hypothetical body count. This is only a sensitivity calculation; token additivity is not asserted. Changes to effort, model, prefix length or real output form may invalidate its empirical usefulness.

For a conditional worst-case bound, let L be the maximum UTF-8 byte length of a token in E's verified merge table. The instrument verifies all 256 byte fallback tokens. If a future visible output truly consists of at most O tokens under this same encoding, its byte length is at most O times L. JSON escaping expands a well-formed string by at most a factor of six in UTF-8 bytes, excluding quotes already present in the empty-slot body. Because byte-fallback BPE tokens cannot outnumber text bytes, for m missing slots a conservative local body bound is:

**body_tokens ≤ empty_body_UTF8_bytes + 6 × m × O × L.**

This intentionally loose bound is conditional on the output cap and encoding actually applying. It does not bound unrelated provider headers or model-specific hidden state. If it exceeds the input cap, the run cannot be promised to fit; the instrument does not truncate it. Known exact bodies above the declared input cap are flagged directly.

Independent evaluator templates are also rendered. Candidate/proof/control payloads are normally unknown before generation. Their upper bound remains null unless a separate explicit future payload-byte bound is supplied; they are not automatically constrained by the generator's output cap. Supplied complete review packets can be counted exactly as local text. Semantic audit receives neutral candidate strings, not arm labels. This does not verify losslessness, masking or reviewer independence. Evaluator reference encoding is separately selectable; absent independent evaluator model mapping remains a hold.

## Calls, retries and capacities

For D documents and K = orders × evidence/representation conditions × run replications, proposed matched generation calls per arm are K × (2D + 2). Both architectures are crossed with the four RCA-01 cells; the four cells do not replace the four original arm roles. The instrument verifies complete permutations and identical generation opportunity counts. Full-scope plans require 20–24 documents and all twelve order/evidence/representation combinations. Other plans are explicitly labeled separate scopes.

For base calls C and fractional reserve r, reserved attempts are C + ceil(rC). A per-call maximum of three transient retries would permit up to 4C attempts if every call failed repeatedly, but does not override the smaller aggregate reserve. These two quantities are reported separately. No answer repair, substantive retry or automatic escalation occurs.

The imposed conditional generation envelope is reserved_attempts × (total_input_ceiling + total_output_ceiling). It is an admissibility envelope only if the caller actually enforces the limits, including hidden work. This static instrument always leaves hard-control verification false. The private source/template bound and unknown provider overhead remain separate findings.

Stage 2 allocates a declared candidate cap, calls per candidate and total-token cap per review call, plus shared semantic-audit calls. Candidate and audit retry pools are reserved separately. Shared audit tokens are divided equally between arms and rounded upward if necessary; call counts themselves are not split into fractional calls. Overflow holds candidates rather than selecting favorable results. Reviewer independence and proof correctness are outside arithmetic.

## Observed-reference forecast and scope alternatives

PR #1616 reported input+output 72,206 over six 2A turns, 74,144 over six 2B turns, and 13,163 for its separate review. Means are 12,034.333... and 12,357.333... per reasoning call. Multiplication by reserved attempts is a reference-rate forecast, not a source measurement or a lower bound. It transfers measured rates only from the recorded child model/effort requests. Other model/effort conditions are explicitly marked unmatched reference transfers, never new measurements.

For the PR #1617 three-document example, each arm has eight generation calls and ten reserved attempts. At input cap 52,000 and output cap 4,096, the generation envelope is 560,960. Five candidates, three calls each, 20% candidate retry reserve and 8,000 tokens per call yield 144,000 per arm. Two shared audit attempts at 8,000 each add 8,000 per arm. Total: **712,960 per arm** against the corrected prospective 720,000 ceiling. The demo also flags unbounded overhead, unknown history and model mapping, so fitting this arithmetic does not qualify the run.

The historical 60,000 exceedance and earlier prospective 180,000 remain preserved. The corrected later 720,000 steer is prospective only. The source-free matrix reports separate 3-, 20- and 24-document synthetic configurations. It never selects a subset of a real corpus; a different document count requires a separately approved source set and scientific scope.
