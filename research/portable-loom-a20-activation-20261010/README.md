# TD613 Portable Loom A20 · activation source proposal

**DRAFT · NOT FROZEN · NOT ENROLLED · NO PROVIDER CALLS · NO MERGE/DEPLOY AUTHORITY**

This branch begins at the verified production relock `8963055900e63c95437c9198b9556c77d81551f6`. It adds only the proposed A20 first-configured-receiver run `portable-loom-first-receiver-20261010-a20`, under the historical program ID `portable-loom-first-receiver-20261009`. Existing A4–A19 identities and budgets are preserved. The proposed A20 program ceiling is **88 total reservations, $11 total reserved**, with **four A20 calls maximum, $1.00 local A20 reservation maximum, and $0.25 per-call limit**. These are reservation caps, not expected API charges. The historical A19 ceiling remains $10. No Neon deployment, enrollment, provider call, reservation, admission, merge or release was authorized by this source review.

## Exactly permitted A20 trial order

1. `FIRST_CONFIGURED_RECEIVER-R06-1`, turn 0
2. `FIRST_CONFIGURED_RECEIVER-R06-1`, turn 1, only after this run's successful R06 turn 0
3. `FIRST_CONFIGURED_RECEIVER-R02-1`, turn 0
4. `FIRST_CONFIGURED_RECEIVER-R02-1`, turn 1, only after this run's successful R02 turn 0

Historical suffix strings are unchanged. Only the full turn-0 digest is rebound to the reviewed artifact. The reviewed Markdown SHA-256 is `fcb4d3d82f4919d23c13d729144ffb21860e07b292d0f384dd9e63cecda92021` (Git blob `f050bdb481519b5fecb54ab4743b50cd9e9f36ac`). The R06 and R02 first-user message SHA-256 values are `84aaa820bc379234d8ba45ebc9cf1015131e749b9833cb5750a05ef69c0ab0f4` and `7302afa1b99699517e132157fd99453f1db9e2112082262fada10e7a2316d7e2` respectively. The A20 manifest has no comparison cases and only these two receiver cases. A20 policy restricts trial/turn identity further.

## Files and boundary

- `server/loom-assay-contract.js`: A20-only run ID/program bounds, trial scope, per-call reservation ceiling; earlier program contracts unchanged.
- `server/loom-assay-run-config.json`: adds one proposed run ID, retains existing access digest, URL and authorization reference; this is not itself an execution authorization.
- `server/loom-assay.js`: exact A20 run chooses `TRIAL_MANIFEST_A20.json`, historical runs choose original manifest.
- `vercel.json`: includes proposed A20 manifest and reviewed candidate in the API's serverless bundle; Git auto-deploy stays disabled.
- `research/portable-loom-server-transport-20261009/server-client.mjs`: chooses A20 manifest for A20 and insists same-run `capture.run_id` for predecessor; captures now record their run ID.
- `neon/functions/loom-assay-budget/ledger.mjs`: explicit A20 $0.25 per-call guard in addition to `reservationNanos` and transaction-locked shared total; no historic row mutation.
- `tests/portable-loom-a20-activation.test.mjs`: deterministic A20 boundaries and exact digest tests. No network/provider calls.

The existing Neon Functions deployment does **not** gain this proposal's validator simply because the GitHub branch exists. A distinct reviewed source deployment/configuration step is required in a later, explicitly authorized phase. The handler also requires `request.protocol_commit` to equal the actually deployed `VERCEL_GIT_COMMIT_SHA`; do not use this research branch's transient head as a fictional deployed source identity.

## Executable preflight, later phase only

A later authorization must name the exact validated and deployed protocol commit, run, total maximum and per-call ceiling, 4-call plan/fallback, stop rule, and execution phase. Before enrollment verify current live Neon totals, 88/$11 prospective membership, current `loomassaybudget` function runtime binding, exact deployed manifest and candidate hashes, model parameters, actual caller build, credential fingerprint, exact wire cost, source lock, and zero-reservation new run. On any HOLD stop globally, do not retry, and leave future calls UNATTEMPTED. The current grant authorizes none of those actions.

**Review outcome sought:** `A20_DESIGN_REVIEWED; EXECUTION_NOT_AUTHORIZED`. This draft PR is not a request for merge or #405 release.
