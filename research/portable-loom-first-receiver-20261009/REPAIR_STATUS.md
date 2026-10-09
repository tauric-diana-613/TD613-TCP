# Portable Loom relay repair — ready for a separate release decision

The original production relay attempt is preserved at `3713d62a707de7e93e5c33836a8f6d75c216ec26`. It returned `ASSAY_BUDGET_WORKLOAD_UNCONFIGURED` before Gemini generation. Independent ledger inspection found zero reserved calls, zero reserved cost and zero provider-call rows; the original run remains HELD. [The original result](./REPORT.md) is unchanged.

The request-identity repair is [PR #1439](https://github.com/tauric-diana-613/TD613-TCP/pull/1439), branch `fix/portable-loom-request-oidc-20261009`, exact source head `80eee40531d6ae5e3f77dc04a1ee78ebaf74f914`, based on `916ed6cfc6f21f49d30198c407f57c6f9ed0b0d0`. The relay now reuses the existing header-first workload identity reader per request. Missing or rejected identity still blocks generation, and the resolved workload token is excluded from prompt and public response bytes. The portable Markdown and case endpoints are unchanged.

| Verification | Result | Evidence scope |
|---|---|---|
| Focused final local checks | 33 passed, 0 failed | LOCAL_STRUCTURAL_TEST; mocked provider |
| CI bounded transport and SQL ledger checks | 34 passed, 0 failed | LOCAL_STRUCTURAL_TEST; local ledger and mocked provider |
| [Exact-head consolidated CI](https://github.com/tauric-diana-613/TD613-TCP/actions/runs/37955218539) | SUCCESS; run 5194 | Required selected contracts passed |
| Browser journey | NOT_RUN for this repair | Browser witness steps skipped by scope selection |
| Repair production deployment | NOT_RUN | PR remains open and unmerged |
| Gemini response under repaired relay | NOT_RUN | No follow-on enrollment or provider call |

The machine-readable [CI receipt](./OIDC_REPAIR_CI_RECEIPT.json) binds the actual head and retained job-log excerpt. Local raw TAP and source digests are in the repair commit's `research/portable-loom-oidc-repair-20261009/raw/local-003/`. The first two failed mock fixtures and subsequent fixture-only correction remain disclosed in that branch; they are not erased.

The proposed run `portable-loom-first-receiver-20261009-a2` is prepared and inactive. Its fresh capability stays private. Its pending policy intentionally lacks authorization, deployed source and expiry. The proposed scope remains the same corrected Markdown, 54 calls, Gemini 3.8 Flash and a USD 10 maximum token-charge ceiling. The stopped attempt would remain separately retained without additional independent-case credit.

A fresh direct operator grant is required for merging/releasing this repair and executing the separately retained attempt. The earlier release gesture is already consumed. Root [AGENTS.md](https://github.com/tauric-diana-613/TD613-TCP/blob/916ed6cfc6f21f49d30198c407f57c6f9ed0b0d0/AGENTS.md) states: “The release gate permits one deployment per gesture.” The prospective [assay protocol](https://github.com/tauric-diana-613/TD613-TCP/blob/7e7cf4d6490fcdc68584764a63f3198302f7fc39/docs/research/PORTABLE_LOOM_PROSPECTIVE_ASSAY_PROTOCOL.md) states: “Primary retries: zero.” It allows an authorized retry only as a separately retained attempt. This receipt supplies no authorization.

No second release, receiver retry, comparison, second provider, historical rerun, detached delegation, custody admission or scientific promotion occurred.
