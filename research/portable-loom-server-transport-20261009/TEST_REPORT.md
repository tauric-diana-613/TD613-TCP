# Standard Portable Loom — bounded server transport verification

The missing compatible Gemini transport is implemented and remotely published. It carries the exact corrected standard packet, keeps the Gemini credential server-side, reserves each call against an immutable numerical budget, and retains exact response bytes. It makes one provider request per authorized call, with no fallback or retry. It does not admit returned work to Loom custody.

## Immutable source and artifact coordinates

- Branch: `research/portable-loom-server-transport-20261009`
- Verified transport source: `600580858627609608ebf725cf0ddb9d98945809`
- Initial transport source: `bbdecb48c1f95726fe52ae9d30bedb821a2b5b74`
- Predecessor kit publication: `f0c496bfac114e4314f4a16c0518d806acc638d9`
- Corrected kit source: `0bf0ba2e42be2e9dcfed2bb4fcdb03f2ff77d2bf`
- Corrected Markdown: 91,514 bytes; SHA-256 `2d9c23bb6ad26430bcf4fd2a52e9aa5e876a1546265a00087cdb7e7e4f1c1872`
- Corrected archive: 612,662 bytes; SHA-256 `974f59722b609a137985c40201bbc29f0c1dd55a31f847399f2fe0ab74fce9bf`

The kit is unchanged by this transport patch. The publication commit containing this report is separate from the verified source coordinate. Any future deployment and enrolled policy must bind the actual reviewed deployment commit.

## Executed results

| Retained execution | Source | Result | Interpretation |
|---|---|---|---|
| `engineering-001` | Initial transport | 26 passed, 1 failed | All 23 initial transport/ledger checks passed. Release hygiene stopped on a tracked `lib/` module omitted by the sparse checkout. |
| `engineering-002` | Verified source | 27 passed, 1 failed | All 24 current transport/ledger checks passed, along with API, generation-envelope and workflow checks. Release hygiene stopped on a tracked Safe Harbor file omitted by the sparse checkout. |
| `engineering-003` | Same verified source | 5 passed, 0 failed | Only the failed release-hygiene check was rerun after restoring the full tracked `app/` tree. Its static checks passed for 11 deployed function files and 10 overrides; all five imported browser-epoch source tests passed. |

There are **32 successful named checks across the two final-source executions**, with the combined run's environment failure retained and resolved by the focused rerun. This is not a claim that one combined invocation or full remote CI was GREEN. No source edits were needed for either missing-file failure. Each attempt retains its pre-execution request, exact stdout/stderr, timestamps, exit code, source hashes and raw-byte digests.

The earlier development run's two integer-representation assertion failures are recorded in `DEVELOPMENT_FINDINGS.json`. That record is a reported observation from the actual tool transcript, not a recreated raw execution receipt. The assertions were corrected to compare exact integer values, without changing the ledger's financial arithmetic.

## Earned engineering claims

- The full corrected portable packet reaches the registered Gemini request without the native dialogue input envelope or automatic structural repair.
- Missing authorization, numerical limits, pricing, expiry, wrong artifact/source, added tools, unregistered trial, duplicate call and unavailable predecessor fail closed in the tested paths.
- A separate workload-authenticated Neon function owns budget metadata. Transactional reservations bind call identity, policy commitment, previous actual answer digests, call count and integer nanoUSD ceiling. Provider prompts, answers and credentials are excluded from the ledger.
- Embedded PostgreSQL executes the migration, reservation/completion SQL, constraints and transaction rollback. The harness serializes one connection: it does **not** establish deployed Neon behavior or multi-instance locking.
- Provider failure, response overflow, wrong declared model, excess reported usage, credential echo and failed completion retain a failure/HOLD rather than creating a successful trial or retry. Partial byte captures are identified as partial.
- The local client retains exact request and response bytes, verifies the wrapper and raw provider content, rejects fixture continuations and refuses to overwrite an existing attempt. Mock fetches remain `LOCAL_STRUCTURAL_TEST`.
- Dedicated API dispatch, package inclusion and the focused CI lane are present. Existing interactive dispatch remains separately contracted.

## Operational boundaries and remaining bindings

Evidence class: **LOCAL_STRUCTURAL_TEST**. Live model-generation calls: **0**. Actual receiver trials: **0**. Deployed Neon invocation, production relay, browser witness, physical-device witness, independent external witness and settled-spend verification: **UNPERFORMED**. Full remote CI: **NOT_RUN**. No merge, deployment, Issue #405 operation, credential extraction, ChatGPT account binding or historical assay rerun occurred.

The prepared migration and functions have not been deployed. `POLICY.template.json` intentionally holds source/expiry/pricing/numerical USD ceiling unset. The next primary receiver plan is 54 calls; the distinct comparison plan is 180 calls. This implementation supports only the first configured receiver through Gemini. A second provider remains unimplemented. Comparative execution additionally requires a retained-server-capture admission adapter; the old direct-provider loader is not silently reused.

An exact artifact/model/source binding, numerical financial ceiling, runtime capability enrollment and applicable deployment authorization are needed before live execution. [ACTIVATION.md](ACTIVATION.md) contains the concrete activation steps. It preserves the existing Vercel workload law and governed release membrane. Publication and these local tests grant no release authority, independent provider-observation claim or scientific promotion.

Status: **TRANSPORT_SOURCE_VERIFIED; LIVE_RECEIVER_ASSAY_NOT_EXECUTED**.

Machine-readable evidence: [EVIDENCE_RECEIPT.json](EVIDENCE_RECEIPT.json). Raw attempts: `raw/engineering-001`, `raw/engineering-002`, `raw/engineering-003`.
