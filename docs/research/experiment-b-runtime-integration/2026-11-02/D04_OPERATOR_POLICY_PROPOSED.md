# D04 final feasibility and consolidated proposed operator decision

**PROPOSED — NOT ADOPTED — NOT SIGNED. Gate F HELD.**

Governing implementation: PR #1625 at `6e129060d1eb03c06de87b46269bfa26bbfd3eb6`; its 51-test CI and reported 13-case offline integration remain unchanged historical evidence. [Amari's full adjudication](https://github.com/tauric-diana-613/TD613-TCP/pull/1625#issuecomment-6566509589) was read in full. This is one documentation-only closure instrument, not another docket, implementation package, qualification study or execution grant.

## Evidence determination

1. [Official Sol documentation](https://developers.openai.com/api/docs/models/gpt-6.1-sol) corroborates a 500,000-token default in Codex/ChatGPT Work. API context/output specifications do not establish native subscription hard limits.
2. The reviewed native cache records default context 500000, maximum client override 872000 and usable percentage 95. Reviewed native source derives default automatic compaction at 90% of context, hence a 450000 client retention guard. Neither 872000 nor the API envelope is adopted as an override. The guard is a client-side retention constraint, not a provider attestation.
3. [Official public tiktoken mapping at revision 212b893ba940cba53476851103d2e5c1d0020c6e](https://github.com/openai/tiktoken/blob/212b893ba940cba53476851103d2e5c1d0020c6e/tiktoken/model.py) has no explicit Sol entry or matching GPT-6 prefix. Its GPT-5 mapping cannot establish GPT-6.1 Sol tokenization. The pinned fetched mapping matched the inspected main content. Installation of that package would not itself repair this absent model mapping. No eligible model-matched offline instrument was established by this bounded inspection. No token-count API was called.
4. For a byte-based BPE that partitions text into nonempty byte sequences without expansion, the number of ordinary tokens is at most the UTF-8 byte count: every token consumes at least one byte. This is a conditional mathematical bound on specified text, not evidence that Sol uses that mapping. Special/structural tokens and preprocessing must be bounded separately. The current UTF8_BYTES_PLUS_ENVELOPE_BOUND_V1 validator correctly refuses missing mapping and full-envelope evidence; no digest or allowance was invented.
5. A deterministic private inspection measured the selected catalog's complete model_messages JSON object as 63318 UTF-8 bytes, SHA-256 `191792753f8532b509e65464df326b5b4741e88c4cd4f6a62584961d48f5b4e6`. This is a serialization of that metadata object, NOT the serialized model request or a token count. Actual prompt bytes, catalog instructions, typed tool definitions, replay histories and settings are observable components. Native-generated developer/permission/environment blocks, tool framing/intermediate messages and any provider-added/transformed material prevent that object alone from representing the complete wire envelope. No complete-envelope upper bound was established.
6. The pinned native configuration schema exposes context/auto-compaction controls and tool_output_token_limit, but no total max_output_tokens control. The latter tool limit governs retained tool output, not all model output or hidden reasoning. The [supported configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference) likewise did not establish a native total-output ceiling. API max_output_tokens semantics cannot be imported into this route. No live enforcement claim is made.
7. [Official reasoning guidance](https://developers.openai.com/api/docs/guides/reasoning) recommends at least 25000 tokens of reasoning/output headroom for initial experimentation. This supports a planning reservation, not a demonstrated maximum or a guarantee of adequacy at xhigh.

The native-source review already carried by #1625 establishes observable serialization and capture code paths, not a supported offline dump/count of the complete provider request. Source/configuration evidence cannot measure genuinely hidden provider transformations. No new native process was asked to start a model turn. A local Python package-presence diagnostic was unavailable; no conclusion about its installed packages is inferred from that failure.

## Single recommended finite policy — PROPOSED

Adopt the following as a conditional observational policy, explicitly accepting its limitations. It is not a claim that present runtime validators can already dispatch under it.

* Primary treatment: identical requested `gpt-6.1-sol`, `xhigh`, native route, tool catalog, deterministic arithmetic, resource rules and evidence standard for both reasoning architectures. No fallback, delegated reasoning or silent settings changes.
* Context: retain the documented 500000 native planning envelope and strictly avoid reaching the 450000 pinned client compaction guard. Do not lower the intended corpus or choose a smaller arbitrary study context to obtain readiness.
* Measurement: retain exact complete prompt/replay/source-prefix bytes and an inventory of every observable native instruction/tool/serialization component. Use exact model-matched counting only if evidenced. Otherwise record component UTF-8 byte lengths as an **observable size proxy**, not an exact count or certified full-request upper bound. An evidence-backed non-expanding tokenizer plus a complete bounded envelope may later support the existing conservative counter. Missing hidden overhead remains explicitly UNKNOWN; it is never assigned a made-up number.
* Reserve 25000 tokens per turn for hidden reasoning, visible output and formatting as the initial matched **planning reservation**. The derived prospective input/envelope planning space is strictly below 425000 (450000 minus 25000), not a 425000 raw-source allowance. This test is executable only when the complete counted/bounded envelope is eligible; a byte proxy cannot certify it. The reservation is not an enforced stop and is not evidence that larger discovery outputs are impossible or invalid.
* If complete hidden accounting cannot be supplied, recommend an explicitly adopted conditional observational standard: use the full preserved inputs and documented client envelope; retain all observable evidence; make no exact served-token, hard-cap, fixed-compute or guaranteed-no-hidden-compaction claim. Before any protected exposure, Amari must accept whether residual unobservable compaction risk is compatible with the primary estimand. If actual lossless provider-side retention is indispensable, that particular claim remains unestablished and Flight stays held; a waiver cannot turn it into a proven fact.
* Actual context overflow, visible compaction, truncation, incomplete response, configuration drift, capture conflict or comparable usage exceeding its accepted bound causes HOLD. Retain complete captured evidence and completed accepted turns. Do not shorten history, omit documents, cull candidates, switch architectures or retry an uncertain dispatch. If the full strong-union turn cannot fit, hold the affected comparison without substituting a smaller study.
* Complete oversized final/JSONL records follow the existing refusal/custody rules. Do not trim to fit. A reservation overrun is an administrative/resource event, not automatic scientific invalidation of a retained complete answer.
* Subscription-only; additional paid-API authority USD 0. Zero retries/fallback are recommended prospectively. Let L be the frozen complete lane schedule and n(l) its actual admitted source count. Per-arm scheduled requests S = sum over L of (2*n(l)+2), preserving baseline, two meaningful turns/document and synthesis. Primary episode attempt ceiling A = 2*S, not an independently chosen corpus-size guess. Window attempts cannot exceed remaining A or genuine confirmed quota. No quota reset enlarges cumulative A.
* A finite planning-ledger ceiling of A*450000 context-reservation units is recommended, with an initial per-attempt planning reservation of 450000; these are conservative administrative reservations, not measured tokens or a hard upper bound on hidden provider work. Report actual available usage separately, cached input once, with explicit reasoning inclusion semantics. If actual chargeable/accounted usage exceeds reserved authority, stop subsequent dispatches and adjudicate the overrun; no guarantee against an individual hidden overrun is asserted. Releasing/reallocating unused authority requires the frozen accounting rule, never an automatic quota reset.
* A, the private episode schedule, scientific replication count and independent Stage 2 allocation must be numerically instantiated and adopted before execution. Unknown corpus measurements, statistical power or evaluator workload are not supplied by this formula. Stage 2 has its own finite ceiling; no unbounded review grant is implied.

This preserves full corpus access and matched meaningful opportunities. It does **not** prove equal hidden compute. The existing implementation's stronger D04 evidence gate remains unchanged. If the operator adopts the conditional observational standard instead, a targeted reviewed policy implementation must encode precisely that adoption before dispatch. No new software defect was demonstrated in this commission.

## Consolidated existing D01–D20 decision instrument

Every row below has status **PROPOSED**. Engineering activity already authorized by the current commission is distinct from adoption of these protected-execution decisions. This table carries the original IDs; it neither issues authority nor replaces historical dockets.

### Group A — Scientific configuration and analysis

| ID | PROPOSED decision | Unresolved adoption/binding |
|---|---|---|
| D02 | Matched Sol xhigh for Arms 2A/2B; explicit native profile and drift HOLD. | Accept actual route/profile evidence and identity standard before exposure. |
| D03 | Accept only configuration/receipt-level observations where provider identity/decoding attestations are unavailable. | Waive exact served-revision, exact hidden-compute and unavailable decoding claims expressly; never fabricate them. |
| D04 | Adopt the single finite policy above, distinguishing reservation, measured use, proxy and unknowns. | Choose the conditional observational standard or retain the stronger evidence requirement; actual finite schedule/accounting values still require adoption. |
| D06 | Preserve the full four-arm corpus study; no microstudy substitution. | Private membership and complete frozen schedule after separately lawful admission; no corpus commitment invented now. |
| D07 | Preserve matched meaningful opportunities and unweakened strong union. | Same kernel/context/output/account rules and explicit architecture-specific visibility. |
| D08 | Preserve both architectures across all preregistered authentic/control and neutral/Dollhouse factorial cells. | Exact complete templates and independently reviewed representation equivalence. |
| D09 | Preserve authenticated source orders, holdout/withdrawal, false twins and metadata rules. | Exact private orders/seeds and handling of unavailable chronology; no invented metadata. |
| D10 | Preserve seven dimensions, endpoints and analysis distinctions. | Actual run count, precision/power, multiplicity, randomization and stopping/missingness decision remains unselected; no arbitrary number offered. |
| D11 | Exact accepted-final replay, source-prefix commitments and arm-specific histories; no silent compaction. | Accept provider-hidden retention limitation explicitly or hold the corresponding causal claim. |
| D13 | Retain accepted add/subtract/multiply/GCD, 8/request, 512 digits, tolerance zero, complete receipts. Admit unrestricted UNANTICIPATED_CANDIDATE text. | Preserve actual matched availability and independent proof/novelty review; authentic archival Arm 1 remains separately required. |

The seven dimensions remain intellectual relations; contradiction/chronology/revision/prior preservation; alternative mathematics/falsification; methods/reconstruction/questions; order/holdout/withdrawal/false twins; authorship/provenance/lineages; and surplus against strong union. No outcomes are amended.

### Group B — Custody, privacy and independent Stage 2

| ID | PROPOSED decision | Unresolved adoption/binding |
|---|---|---|
| D01 | Native first-party subscription route only, no Gemini/paid fallback. | Actual account eligibility, privacy/data-retention terms and permitted protected disclosure require operator acceptance; subscription is not confidentiality attestation. |
| D12 | Keep authenticated physical-member custody and reviewed admission-only/inference separation. | Custodian-controlled initial hash/admission/manifest escrow and fresh authorized physical re-admission remain separate; ZIP stays sealed here. |
| D14 | Proposed independent evaluator GPT-6 Astra Max, separately controlled principal/credentials/roots. | Actual evaluator accepts model/effort, independence, competence, conflicts and finite recoverable execution policy; generator credentials are insufficient. |
| D15 | Freeze complete blinded packets, negative controls, semantic equivalence/leakage review and proof/counterexample/novelty procedures. | Independent substantive review and authentic receipts, not Boolean proof claims. |
| D16 | Retain every candidate; HOLD overflow without favorable selection. | Evaluator must adopt finite workload/spending limits after actual workload is known; no unknown candidate count is fabricated. |
| D18 | Private custody, checkpoint keys/anchors, retention/deletion and minimum aggregate reporting. | Operator-specific access/retention and separate publication decisions; no protected corpus commitments or private account data in this document. |
| D19 | Unblinding only after frozen Stage 2 judgments and separate authorization. | Human custodian and conditions reserved. Claude Opus 5.5 High/Antigravity remains separate Postflight; no execution now. |

### Group C — Finite resources, continuity and final authorization

| ID | PROPOSED decision | Unresolved adoption/binding |
|---|---|---|
| D05 | Prospectively adopt resource-governance amendment: finite episode/window/Stage 2 authority; historical token caps remain historical, not automatic invalidity rules. | Express amendment adoption and instantiated finite A/reservation ceilings. No hidden per-window reset or unlimited consumption grant. |
| D17 | Preserve authenticated durable checkpoints and paired completion; never rerun accepted turns; HOLD uncertain calls. Recommend zero retries. | Freeze permitted definitive-no-execution treatment, resource overrun handling, anchors and unchanged-treatment continuation across genuinely confirmed quota windows. |
| D20 | Final execution authority only after independent acceptance and operator adoption of all material conditions. | Distinct custodian admission and frozen inference grants, real external atomic dispatch authority and genuine trust roots. No signature, grant or credential is supplied here. |

The previously conditional invented-input witness remains at most one terminal request per reasoning environment, zero retries/fallback and USD 0 additional API authority; it is not executable under this document. Independent pre-dispatch acceptance must include the actual native custom-profile route, retention, effort and retry semantics. No new request for routine engineering permission is made.

## Finite conclusion

**D04_IRREDUCIBLE_PROVIDER_LIMITATION_IDENTIFIED.** A complete model-matched native pre-count and enforced native output-plus-reasoning ceiling were not established. The precise consequence is to exclude claims of exact served tokens, guaranteed provider hard ceilings, equal hidden compute and independently proven hidden retention from any observational comparison unless new authentic evidence establishes them. It does not erase the full intended architectural comparison, source custody, observed outputs, independent mathematical review or the already accepted software/D13 evidence.

The next decision is operator adoption, after Amari's review, of the explicit conditional observational standard and finite planning policy, or retention of the stronger requirement for the affected claim. Neither choice opens Gate F or authorizes protected exposure by itself. This is not a request for another capacity study.

No runtime code was changed, tests/CI were not rerun, and no model turn, paid API, ZIP operation, signature, Stage 2 inference, merge, deployment or unblinding occurred. Existing implementation CI remains tied to its exact original head, not this documentation follow-up.

Tauric Diana · Khona‌lit-po · Human scientific authority reserved · Sealed ⟐
