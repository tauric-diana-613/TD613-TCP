# Proposed Codex Flight amendment · NOT ADOPTED

This is a prospective difference specification against baseline 50cc9d161f8f72c2d4b6ea33ece17ace88f35eff. It changes neither that document nor PR #1616. All decisions in OPERATOR_DECISIONS.md are unapproved. No exposure may occur until Tawanna separately approves the final configuration and execution authority after independent review.

## Matched configuration candidates

| Setting | Medium reference proposal | High alternative proposal | Evidence / uncertainty |
|---|---|---|---|
| Requested model | gpt-6.1-sol | gpt-6.1-sol | Both arms must use the identical requested identifier and approved served revision policy. No immutable served snapshot established. |
| Requested effort | medium | high | Child requests in PR #1616 used medium. The operator reports High for the outer chat. Effective provider effort is not independently attested by either. |
| Mode/tier | Explicitly frozen standard mode and one service tier | Same within the High block | No silent pro, fast, fallback or model migration. Whether CLI exposes an effective receipt for each setting remains unresolved. |
| Context | Proposed total input cap 64,000 per call; no silent truncation/compaction | Same cap | A deliberately conservative design bound, not a measured capacity guarantee. |
| Output | Proposed hard 4,096 total generated tokens per call, including reasoning if provider accounting nests it there | Same cap | Word limits and output-schema validation are not hard generation caps. Enforcement is not demonstrated. |
| Sampling | Platform-default decoding recorded as unknown where unexposed | Same | Do not label it temperature 0 or deterministic. Unsupported sampling controls require explicit prospective waiver or a capable approved route. |
| History | Fresh ephemeral calls with explicit exact arm-local replay | Same | Provider persistence is a separate alternative, not an implied property of replay. |

Published documentation states that gpt-6.1-sol supports Medium and High, has a 1,050,000-token model context specification and 128,000 maximum output, with a 500K default context in Codex. These published limits are not effective limits attested for this installed CLI/account. [Official model specification](https://developers.openai.com/api/docs/models/gpt-6.1-sol), retrieved 2026-11-01.

The configuration reference documents model_context_window, model_auto_compact_token_limit and memories.use_memories. It does not establish that setting them prevents all hidden state. A search of the fetched page did not find model_max_output_tokens; that is not proof no other limit mechanism exists. [Official configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference), retrieved 2026-11-01.

Every future receipt must separate requested, locally resolved, provider-reported and independently attested values. Record CLI binary/config/instructions/catalog digests, effective tool manifests, auth-route class without secrets, model identifiers, effort/mode/tier, context and compaction configuration, usage semantics and source/prompt/output hashes. If an indispensable field is absent, do not fill it from a requested string. An HQ waiver of an unavailable attestation must narrow the resulting scientific claim explicitly; it cannot manufacture evidence.

## Material differences requiring prospective approval

| ID | Historical Gemini REST preregistration | Proposed Codex-native condition / consequence |
|---|---|---|
| A01 | Gemini 2.5 Flash, or operator-granted Flash-Lite; Google v1beta REST | OpenAI-hosted Codex CLI route and gpt-6.1-sol. New provider/model condition; no pooling as identical historical observations. |
| A02 | Temperature 0 requested | Unexposed decoding recorded unknown; repeatability and statistical interpretation change. |
| A03 | Explicit 4,096 per-call output request | Same intended ceiling, but hard enforcement and reasoning-token semantics must be established. |
| A04 | REST contexts under request construction | Explicit replay plus opaque CLI harness; persistent provider history is not assumed. |
| A05 | 2A two jurisdiction calls, 2B one union call per document | Primary proposal gives 2B an additional fully capable verification pass. Historical asymmetry retained separately. |
| A06 | 15 calls / 60,000 tokens per arm | Earlier prospective 180,000 steer retained; current operator correction is 720,000 (4 × 180,000), with 540,000 superseded. No per-condition reset or retroactive cure. Full schedule remains infeasible. |
| A07 | Retry HTTP 5xx/transport only, at most three | Native transient categories must be frozen; all attempted/uncertain calls consume reserved capacity. Global reserve may stop earlier. |
| A08 | REST-oriented shared governor and USD estimate | Native total tokens/attempts plus subscription/quota accounting; no Gemini USD governor or assumed zero monetary cost. |
| A09 | Source access through baseline protected objects or authorized physical paths | New authenticated broker boundary across process; no serialization promotion of WeakMap membership. |
| A10 | Typed namespaces and intended bottleneck | Full available evidence replay to 2A first jurisdiction and 2B; only handoffs to 2A second jurisdiction; exact topology frozen. |
| A11 | Same verification/falsification tools | Same pinned deterministic kernel services available to both arms; raw internal engine/charter/answer-key files remain inaccessible. |
| A12 | RCA-01 authentic/negative × neutral/Dollhouse; architecture sometimes mapped onto cells | Fully crossed architecture and RCA cells proposed to avoid framing confounding; requires neutral-function equivalence review. |
| A13 | Order sensitivity, replication/statistical surplus objective | Explicit multiple orders and fresh histories; run replication counts, power and multiplicity remain unapproved. |
| A14 | Independent Stage 2 with authenticated witness | Separate credentials and non-generator presentation/proof verification required; semantic clues and same-account review from #1616 not promoted. |
| A15 | Existing signed ZIP admission / in-process capability | Confidential process-transfer envelope, receiver authentication and final consumed-byte binding are proposed, unimplemented. |
| A16 | Existing no-merge/release and three-lineage rules | Preserved; Stage 2 stays in Flight, later creative programs cannot influence frozen Flight. |

The original seven dimensions, four arm roles, warrant distinctions, unknown-discovery parity, candidate-specific controls, source-order inquiry, three lineages, lawful nulls and reserved human closure are unchanged scientific aims. See SOURCES.md B01–B04. This proposal may be accepted, rejected or revised only prospectively by the named authorities; it is not executable authorization.
