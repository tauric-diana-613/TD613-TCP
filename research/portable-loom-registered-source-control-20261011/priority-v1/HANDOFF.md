# Explicit Priority repair — mechanical handoff

Tawanna C. Miller remains author and operator. This implementation and proposed protocol are assistant-authored by Amari, 2026-10-11. Status: ACTIVATED_BY_DIRECT_OPERATOR. The current instruction authorizes repeated repair attempts; the first batch is capped at five distinct one-call runs (r06–r10), USD2.50 reserved total. This is a concrete repair candidate; the provider capacity outcome remains untested.

The retained r05 request omitted the service-tier field. The current Google REST reference supports top-level `serviceTier: "priority"` on the existing GenerateContent route. r06 adds exactly that field. Priority is intended to improve scheduling and can be downgraded by Google; it does not guarantee success. No billing-account investigation or alternate provider route is required. Each policy retains its own one-call USD0.50 ceiling. After a retained/reconciled 503, close the failed run, wait 30 seconds, then enroll the next declared identity. Ambiguous transport holds progression until its existing call is reconciled. Stop this batch on the first complete answer capture, irrespective of conformance or tier outcome.

Frozen prompt: `../next-protocol-v1/PROMPT.txt`, SHA-256 `d703dcebb9869152df5d95541bbe5400d1ed9b92d1f11565aa10c9382cfd35c6`. Frozen scoring SHA-256 `af7b5637019ca0693fa4916d2b164e167a579d0f5f8cccffbe93e44eb15a0bff`. Provider request: `PROVIDER_REQUEST.body.json`, SHA-256 `2c56385a77b9cf62a51fbdf1ecb328afb5d80ad267919229cfee057496dab8b2`. Compare parsed old/new bodies: only the root serviceTier field changes. The run ID is in the outer relay and ledger; historical prompt labels retain their original bytes.

Keep the registered practice source `registered_fee_source_v1`, its supplied USD120 answer, registration commitment and selected scope. Expected missing-information list is empty for this task. Apply the unchanged inspector plus every frozen semantic acceptance item: separate review-body qualification; required receipt keys/source accounting/missingness; no adjacent contradictory assertion; exactly one terminal footer after receipt with required coordinates. A passing declaration remains NOT_ADMITTED and establishes no independent source authenticity or hidden provider processing.

New routing acceptance is separate from answer conformance: at least one recognized provider report of priority in `x-gemini-service-tier` or retained `usageMetadata.serviceTier`, with no conflict, unrecognized or unspecified report. Reported standard means ROUTING_HOLD for Priority, even if the answer passes. Missing/conflicting reports mean ROUTING_HOLD. Retain complete answers, errors, raw bytes and charges in every case. A reported tier is not independent verification of scheduling or billing.

## Validation before activation

From a clean checkout of the proposed head, run these actual commands and retain TAP, counts, exit status and source SHA:

```bash
node --test --test-reporter=tap tests/portable-loom-receiver-conformance.test.mjs
node --test --test-reporter=tap tests/loom-assay-transport.test.mjs tests/loom-assay-budget.test.mjs tests/loom-assay-primary-run.test.mjs tests/a20-activation-offline.test.mjs tests/portable-loom-receiver-conformance.test.mjs tests/registered-source-control-activation.test.mjs
node --test tests/loom-assay-budget-bundle.test.mjs
python neon/functions/loom-assay-budget/build-and-verify.py /absolute/clean-checkout EXACT_40_CHARACTER_HEAD /absolute/new-bundle-directory
```

`registered-source-control-activation.test.mjs` imports the Priority regressions, so the existing bounded CI command executes them. The Neon ledger imports the same source validator; inserting a row into an older deployment is insufficient. Vercel includeFiles already selects the unchanged manifest/prompt and this supplement; no packaging-glob expansion is needed. Successful CI must include actual contract and budget-ZIP jobs, not an empty green workflow.

## Activation and execution

1. Preserve this sealed protocol, exact successful CI head, clean tree and direct operator activation for the first batch: five sequential calls / $2.50 bound, each run one call / $0.50. Historical r05 $0.30 authorization and CLOSED status grant no new slots. `EXECUTION_AUTHORIZATION.json` retains the direct interactive instruction and this prospective batch bound.
2. Protected-merge only that verified head. Verify current main. Submit one governed issue405 gesture `/td613-vercel-release PRODUCTION EXACT_40_CHARACTER_MAIN_SHA`. Accept only exact-source, application-byte, stability, post-witness and relock PASS receipts. Keep source-packet, transient runtime and relock commits separate. No direct Vercel deploy or Git auto-deploy.
3. Build the locked Neon validator ZIP from the actual release runtime commit using the builder above. Require extracted-ZIP startup success, dependency metadata and matching SHA. Upload/deploy that verified ZIP to existing `late-glade-40477105` / `br-round-union-b5v3ludi` / `loomassaybudget`; preserve OIDC verifier. Verify the active completed deployment. Neon is the durable budget service, not an inference runner.
4. Check out the actual deployed `VERCEL_GIT_COMMIT_SHA` cleanly. Record the fresh direct operator activation as a new external JSON file with status `ACTIVATED_BY_DIRECT_OPERATOR`, operator `Tawanna C. Miller`, authority_class `INTERACTIVE_OPERATOR_DIRECT`, the actual instruction and recorded_at, this PROTOCOL.json SHA-256, provider_requests=5, reservation_ceiling_usd=2.5, automatic_retries=0, manual_retries=4, fresh_enrollments=5, vercel_deployments=1, neon_validator_deployments=1, detached_delegation=false. This is a bounded activation record; do not manufacture the operator instruction.

```bash
node research/portable-loom-registered-source-control-20261011/priority-v1/prepare-priority.mjs /absolute/new-r06-preparation /absolute/direct-activation.json portable-loom-registered-source-control-20261011-r06
```

This command prepares inert policy/request/enrollment files and expires the policy six hours later, strictly before the 2027 pricing change. It sends nothing and reads no credential. Apply its parameterized enrollment once, read back the policy/hash/status/zero counts, and retain the prospective freeze before acquisition. If the runtime or price window cannot bind, HOLD before enrollment or sending.

5. Recover the existing caller capability only from its authorized private record into private child environment `TD613_LOOM_ASSAY_TOKEN`; never print it or archive it. Set only the approved provider fingerprint through `TD613_LOOM_ASSAY_EXPECTED_CREDENTIAL_SHA256`. Confirm GET `https://td613.com/api/khonapolit?operation=loom-assay-credential` has the expected key fingerprint `51efc3d87cdffc4fb2869519ff4fa12b10ce179ba79d3976f6094cf741681c39` and exact runtime commit. Retain paid-credit instruction. Caller capability authenticates relay; deployed `GEMINI_API_KEY` authenticates Google; fresh Vercel OIDC authenticates Neon. Do not exchange these roles.
6. Use the server client once. It POSTs `https://td613.com/api/khonapolit?operation=loom-assay`; the server POSTs `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent` with `x-goog-api-key`. No chat, Interactions, Vertex or gateway substitution.

```bash
node research/portable-loom-server-transport-20261009/server-client.mjs call /absolute/new-r06-preparation/policy.json /absolute/new-r06-preparation/request.json /absolute/new-r06-attempt
```

Keep medium thinking, output cap32768, provider deadline240000ms, client wait280000ms and Vercel maxDuration300s. Continue any running process through its session mechanism. Never launch another request because a tool yielded.

7. Stop the individual run after its one request. Stop the batch on a complete answer, including a negative answer. A complete 503 error may advance to the next distinct declared run only after reconciliation, closure and 30-second backoff. Maximum one reservation; conservative reservation USD0.491184 under USD0.50, input bound200000, output including thinking32768, response cap2000000 bytes. Automatic retries zero; at most four prospectively declared manual follow-up attempts across separate runs. Preserve every failed reservation. On ambiguous transport, inspect the same attempt, call key and Neon completion first; do not resend.
8. Retain relay request/response bytes, provider body and raw provider response, capture.json, response/answer hashes, tier report, immutable runtime identity, ledger before/after, completion and guarded closure. Score acquisition, answer and routing separately. Close the run preserving actual reservations and status. Never refund, reuse, relabel or delete a failed call.
9. Seal a new acquisition supplement with SHA256 manifest, then higher-model substantive assay. Preserve A20's four captures and both source-registration HOLDs, all earlier failures, r03 negative conformance, r04 and r05 source identities and NOT_ADMITTED status. Do not rewrite any old archive or generalize reliability from this one-call check.

Order: sealed protocol → offline validation → exact-head green CI → protected merge/source verification → specifically necessary governed release → runtime/policy/credential binding and verified Neon validator → fresh bounded enrollment → up to five sequential attempts, stopping first complete capture → reconciliation/closure → sealed acquisition → substantive assay.
