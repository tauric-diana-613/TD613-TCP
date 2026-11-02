# Native observability redpen and adoption handoff

Source-free candidate above reviewed PR #1626 HEAD `43f769a4b1d554c10da31467273a1ce528305aa2`. [Amari's finding](https://github.com/tauric-diana-613/TD613-TCP/pull/1626#issuecomment-6566996830) was read in full. Gate F HELD; OBSERVATIONAL_ADOPTION_V1.md remains unchanged and PROPOSED.

## Corrected boundary

The injected Boolean cases test Flight's handling of supplied adverse evidence; they never proved six native detectors. Successful nativeTransport now supplies TD613_NATIVE_OBSERVABILITY_V1 in both result.observations and completeEvidence.nativeObservability. Its six broad adverse-condition fields remain UNKNOWN, not false. It separately identifies the observed completed native turn/verified terminal bytes, matched requested runtime and submitted-text byte count/SHA-256. These observations do not prove effective provider retention or semantic completeness.

Existing parser and physical capture refusals remain exceptions. A transport refusal now carries a bounded, non-secret typed reason into a durable NATIVE_PATH_REFUSED journal record before UNCERTAIN_CALL_HOLD. No partial or failed answer becomes COMPLETED. Full delivered stdout/stderr remain in TRANSPORT_CHUNK records; actual private capture-service records remain separate. A failure before bytes arrive is not represented as if a provider response had been captured. Unknown exception text is replaced with a generic refusal classification, not exported as possibly sensitive prose.

| Condition | Actual supported evidence/path | Limit |
|---|---|---|
| Native turn failure / incomplete terminal record | Existing error/turn.failed event refusal; missing/duplicate completion, nonzero exit or unverifiable terminal result refuses. Raw delivered JSONL/errors are retained. | A completed event does not prove that provider-hidden work or intended content was complete. Successful broad incompleteTurn remains UNKNOWN. |
| Extra post-terminal activity | Existing NATIVE_POST_TERMINAL_EVENT_REFUSED; typed refusal reaches Flight and journal. | No fabricated compaction flag is inferred from it. |
| Truncation/final conflict | Existing invalid/oversized JSONL, missing/stale/reused/wrong-dispatch/conflicting terminal bytes and capture mismatch refusals. | Equality proves consistency of captured representations, not that a provider did not truncate before emitting both. Broad truncation remains UNKNOWN. |
| Compaction | Unsupported events remain rejected by the existing allowlist. | No supported compaction-specific event was established here. An unknown event is a refusal, not a positive diagnosis of compaction. Hidden compaction remains UNKNOWN. |
| Context/provider errors | Existing error/turn.failed refusal and complete raw provider-error evidence. | Error prose is not keyword-matched into a fabricated contextError detector. Hidden context loss remains UNKNOWN. |
| Submitted-source omission | Parent render checks exact source-prefix membership/order and content presence; genuine protected broker revalidates authenticated members and manifest commitments. Exact rendered text and source-prefix/history commitments are journaled. | These checks concern submitted sources, not actual retained attention context. Native sourceOmission remains UNKNOWN. |
| Runtime/treatment differences | Parent frozen configuration/runtime digest checks; native requested-runtime comparison; paired scheduling and existing policy/resource invariants. | No single response proves equal hidden compute or all cross-arm opportunities. Native unequalOpportunity remains UNKNOWN. |

The parser, allowed events, terminal-file comparison, physical capture authority, provider route, model/effort, numerical policy, finite arithmetic and experimental estimand were not changed. No new event fields, success marker, provider detector or safety attestation is assumed. Native observation code is parent-side evidence bookkeeping, not an independent provider witness.

The runner now validates observational schedule/resource invariants immediately after plan/policy validation, before protected environment guards, runtime import or archive admission. This reuses the existing validator; no grant or inventory is generated.

## Targeted verification

Command: `node scripts/experiment-b-operational/run-source-free-linux-tests.mjs` — pinned offline Linux Node 24.4.0, **54/54 passed**, zero credential mounts, network none, invented fixtures only. The receipt includes source-closure digest. Existing focused CI also runs `node --test --test-name-pattern='B-CODEX-0[1237]' tests/test-experiment-b-codex-integration.test.mjs` (four directly affected parser cases). Exact-head CI state is recorded in the Draft PR, separately from local evidence.

Two focused regressions were added: nativeTransport → actual parser refusal → Flight HOLD → authenticated close/reopen without a second dispatch; and observational resource mismatch refusal before protected admission. The existing successful native capture test now asserts UNKNOWN fields, parent prompt commitment and absence of false safety flags. Existing strict/observational separation, complete-source, replay, adverse-flag, capture and kernel tests remain applicable. No historical qualification, tokenizer search or Docker/auth/gateway/kernel rebuilding was performed. No failed test outcome is omitted; this targeted run passed on its first execution.

## Final human-adoption summary — PROPOSED, NOT SIGNED

The operator can prospectively adopt the observational estimand/claim restrictions, matched requested Sol xhigh, retained full four-arm/factorial/order/control opportunities, unrestricted attributed candidate mathematics, exact replay, zero retries/fallback and subscription-only/USD 0 additional paid-API posture. The 500K documented native default, 450K client planning guard and 25K planning reservation remain distinct from provider enforcement. Engineering authority has not adopted these choices.

Actual complete-study numerical A/window/accounting values, authenticated source order and replication/analysis decisions require the authorized private inventory/schedule and substantive scientific decision. No corpus measurement or statistical power is invented. Provider privacy/retention/source-disclosure terms require human acceptance. Actual custody, admission/hash/escrow/re-admission authority and final frozen inference grants remain separate.

Independent GPT-6 Astra Max remains proposed: actual separately controlled evaluator principal, credentials/roots, complete blinded workload, independent semantic/proof/falsification/novelty/counterexample review and finite spending/recovery are not provisioned by this correction. No generator self-certification. Claude Opus 5.5 High/Antigravity remains reserved for Postflight. The conditional two-call native witness remains unexecuted pending its existing independent pre-dispatch acceptance; it is not authorized by this handoff.

No protected ZIP access, model request, paid inference, signing, evaluator execution, unblinding, merge or deployment occurred. Engineering thread remains active under the operator's retirement condition.

Tauric Diana · Khona‌lit-po · Human closure reserved · Sealed ⟐
