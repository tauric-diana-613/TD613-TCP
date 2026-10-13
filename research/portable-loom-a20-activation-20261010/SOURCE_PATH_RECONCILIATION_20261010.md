# TD613 · A20 source-path reconciliation (additive erratum)

**Scope:** Post-GREEN mechanical packaging correction to draft PR #1450. Design, receiver prompts, candidate bytes, candidate SHA-256, historical research, prior runs, program reservations, and execution authority remain unchanged. No merge, freeze, enrollment, reservation, provider request, Neon deployment, Vercel release, or custody admission is authorized.

## Observation

The Vercel function `api/khonapolit.js` carried an obsolete A20 candidate path:

`research/portable-loom-a20-activation-20261010/portable-loom-conformance-candidate.md`

That location is absent at the reviewed branch head. The tracked file and the live `TRIAL_MANIFEST_A20.json` actually locate the candidate at:

`research/portable-loom-a20-activation-20261010/candidate-reviewed/portable-loom-conformance-candidate.md`

The original design archive and original activation-proposal evidence ZIP retain earlier historical path declarations, including in their proposal manifest/plan. Those immutable snapshots are left untouched, preserving their SHA commitments. Their obsolete path references do not override the amended live source manifest. This note records, rather than silently rewrites, that disparity.

## Reconciliation

- Change only Vercel's A20 `includeFiles` candidate entry to match the *live* A20 manifest artifact path.
- Align the separately governed exact-string Vercel route-contract test with that correction.
- Add read-only regression assertions to A20 offline tests, including the test invoked in the exact-head consolidated CI. The guard checks that every listed Vercel-carried file exists and the manifest-selected candidate matches its SHA-256.
- Preserve candidate SHA-256 `fcb4d3d82f4919d23c13d729144ffb21860e07b292d0f384dd9e63cecda92021`, Git blob `f050bdb481519b5fecb54ab4743b50cd9e9f36ac`, all historical suffixes, trial order, and prospective budget.

## Evidence ceiling and future gates

Passing these static checks establishes source-level path integrity and offline content binding, **not** actual inclusion in a built Vercel deployment. Before enabling A20 execution, an authorized build/deployment must attest its carried manifest/candidate hashes and deployed source commit. The Neon `loomassaybudget` function must be updated separately, and its live validated code/hash and prospective budget controls witnessed before a fresh run can be enrolled. After those independent witnesses, a new contemporaneous execution authorization is still required.

**State:** DRAFT SOURCE CORRECTION ONLY; EXECUTION NOT AUTHORIZED.
