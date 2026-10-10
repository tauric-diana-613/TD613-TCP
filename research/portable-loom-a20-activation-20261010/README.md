# TD613 · Portable Loom A20 — prospective activation source proposal

**State:** REVIEW-ONLY · DRAFT_NOT_FROZEN · EXECUTION_NOT_AUTHORIZED

Target run `portable-loom-first-receiver-20261010-a20`; R06-1 t0→t1, then R02-1 t0→t1. The selected R02/R06 suffixes come unchanged from the historic manifest at production relock `8963055900e63c95437c9198b9556c77d81551f6`. Each first-user message is rebound to the reviewed candidate SHA-256 `fcb4d3d82f4919d23c13d729144ffb21860e07b292d0f384dd9e63cecda92021`; no prior-run predecessor is admissible.

- Base PR #1449 merged; production relock unchanged. This draft branch is **not** production.
- Candidate exact bytes: 92,370 bytes; Git blob `f050bdb481519b5fecb54ab4743b50cd9e9f36ac`.
- Manifest `TRIAL_MANIFEST_A20.json`: two receiver families only, max 2 turns each.
- R02 t0 SHA256: `7302afa1b99699517e132157fd99453f1db9e2112082262fada10e7a2316d7e2`; R06 t0 SHA256: `84aaa820bc379234d8ba45ebc9cf1015131e749b9833cb5750a05ef69c0ab0f4`.
- Historical 88/$10 A19 program unchanged. Prospective A20 shared **88/$11**, local **4/$1**, **$0.25 per call**. Original design pessimistic $0.52203750 remains recorded as an estimate, not an API invoice.
- Read-only Neon last observed 19 HELD runs, 83 reservations, $9.47417175 reserved, 0 ACTIVE. **Reread before enrollment.** No consumption or refund inferred from actual provider charges.
- Model and decoding unchanged: Gemini 3.8 Flash, medium, temperature null, top-p null, no tools/retrieval, 8192 output, zero automatic retries.
- Production source route requires new reviewed commit and release. Neon budget function likewise requires a separate prospective deployed update. `main` and live services are unchanged during this draft.
- A20 execution requires new contemporaneous authorization stating protocol SHA, $11 shared / $1 A20 / $0.25 per-call, four calls, fallback and first-HOLD stop. **This task does not authorize enrollment, freeze, provider invocation, merge, issue #405 release, deployment, or admission.**
- The 55-test corrected offline inspector from PR #1449 and the 4 new local A20 structural tests are distinct validation strata. Check GitHub exact-head CI before treating PR proposal as structurally reviewable.

## Scientific ceiling

A/P: receipt text and governance uptake; B: captured-answer receipt conformance; C: independent byte/custody integrity. Missing source IDs are an honest semantic PASS only if expressed as missing with task HOLD; they never create origin registration. Four purposive outputs are not a population reliability estimate.

## Held operations

- No A20 `POLICY` is frozen, no run enrolled, no reserved call, no provider output.
- A20 provider request turn-1 hashes necessarily remain dynamic until fresh same-run turn-0 answers exist.
- Pending exact reviewed route commit and actual deployed source / Neon function receipts.
- Separate execution authorization required.

𝄐 A20_DESIGN_REVIEWED · EXECUTION_NOT_AUTHORIZED ⟐
