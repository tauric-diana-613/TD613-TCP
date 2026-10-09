# Standard Loom first receiver — retained transport HOLD

The governed activation completed, but the first receiver attempt stopped before Gemini generation. Production returned HTTP 409 with `ASSAY_BUDGET_WORKLOAD_UNCONFIGURED`. The independent Neon metadata query showed zero reserved calls, zero reserved cost and zero retained provider-call rows. The run was explicitly marked HELD afterward. No primary retry occurred.

| Measure | Result |
|---|---:|
| Planned receiver calls | 54 |
| Actual TD613 relay attempts | 1 |
| Server-reported Gemini requests | 0 |
| Captured receiver answers | 0 |
| Reserved token cost | USD 0 |
| Unattempted calls | 53 |

The activation is merged in [PR #1438](https://github.com/tauric-diana-613/TD613-TCP/pull/1438). Exact-head GREEN is `3474a14acc2f585e8dcf6b5e8d104a7ac5ea4181`. The [successful Issue #405 receipt](https://github.com/tauric-diana-613/TD613-TCP/issues/405#issuecomment-6084181733) binds reviewed packet `fd75425c36f65210dc7fb10e685e5b272bae370a`, actual deployment `5581af7812dc0f5fcf2b65c11ad09da045f0940e` and relock `916ed6cfc6f21f49d30198c407f57c6f9ed0b0d0`.

The preregistered binding was remotely verified at `a768d834e0f57089e2feacbde3d0650101db4aed` before enrollment or the first request. The exact corrected Markdown remains SHA-256 `2d9c23bb6ad26430bcf4fd2a52e9aa5e876a1546265a00087cdb7e7e4f1c1872`.

The defect is a missed production identity handoff: the new relay read the build/local environment variable, while Function identity arrives on the request header. The repository's existing custody reader already handles that header. A separately prepared repair reuses that reader and tests rotation, rejection and credential exclusion. It does not change the portable artifact or any case endpoint.

R01-1 is HELD_EVIDENCE_GAP; all remaining trials are NOT_RUN. None of the twelve semantic endpoints can be assessed. The captured schema's ACTUAL_RECEIVER_TEST label cannot supply nonexistent provider-output evidence: this is an actual relay-boundary attempt with no receiver answer. Footer denominator is zero, Gate behavior is unassessed, and settled invoice evidence is unavailable. Local code tests, production release verification and receiver behavior retain their separate scopes.

All exact request/provider-wire/response/capture bytes, registration, progress, stopped completion and ledger receipts are retained. The stopped attempt is preserved. A proposed follow-on uses a new inactive run, fresh private capability and separately frozen authorization; it requires a new operator grant, one governed repair release and new exact-source enrollment. No comparison, second provider, historical assay, custody admission or scientific promotion was executed.
