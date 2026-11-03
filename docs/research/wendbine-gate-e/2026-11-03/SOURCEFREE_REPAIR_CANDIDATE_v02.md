# 𝌋 TD613 · Wendbine Gate E · Stage E-R0.2 source-free repair candidate

**3 November 2026 · Operator: Tawanna C. Miller (`tauric.diana.613`) · Covenant: Khona‌lit-po (U+200C)**

## Scope and custody ceiling

This is an isolated **source-free verification and query-kernel candidate** responding to the independent 3 November Gate E adversarial audit. It does **not** integrate the Work-authored offline decrypt/restorer, modify PR #1134, fetch encrypted artifacts, index private originals, publish third-party text, issue #1308 sync commands, or activate Experiment B.

Frozen baseline to preserve:

- Wendbine Draft PR #1134 exact HEAD: `a8a619378f5a47137a8bd7d1765d47571f383e1e`.
- November 2 snapshot: `wendbine-20261102175835-2861f2e0326f`.
- November 2 seal: `wendbine-seal:2861f2e0326fef26db241bf888c194ceb40a16131ad48e98149d7511b443a5dd`.
- Work audit package SHA-256: `ab27303c394ad838abaf97f00c9d38dd3f1b8fdc187f96c5b6fc3c66b105f132`.
- Independent adverse findings: GE-R01–R05 and GE-Q01–Q03.

**Do not execute this module on protected original bodies.** Its source-free fixtures are invented and its interface does not constitute an authorized local restore application.

## Implemented synthetic remedies

1. **GE-R01:** differentiate `TITLE_HASH_ONLY_PUBLIC_RESEARCH_PROJECTION` from an exact public title. Validate private title against captured SHA-256 while keeping the public manifest null. Synthetic 27-record positive and exact-title tamper negative.
2. **GE-R02:** require identical response SHA-256, response byte length and object index across public capture, private post and raw archive batch; reject orphan batches and duplicates.
3. **GE-R03:** fatal UTF-8 decoding before JSON parsing; invalid bytes fail closed without replacement decoding.
4. **GE-R04:** bind source creation, edit/retrieval coordinates, provider, body/media flags and capture/version clocks; reject incompatible same-observation-time current versions.
5. **GE-R05 (partial):** require manifest-linked PRIVATE_ONLY rights, a caller-supplied independent public epoch trust assertion and an explicit local query authorization predicate. Full host security, real rights grants and durable withdrawal remain **HELD**.
6. **GE-Q01:** case-sensitive exact byte matching with original UTF-8 offsets and half-open byte spans. Case-folded search remains unsupported until independently verified original-offset maps exist.
7. **GE-Q02:** enumerate all matching occurrences and date records with bounded presentation pages, full cardinalities and HMAC-authenticated query/epoch/dataset-bound cursors. Source-specific denied reads report rights gaps rather than complete zero.
8. **GE-Q03 (partial):** verify a reopened JSONL byte buffer against an **independently supplied** SHA-256, length, count, and exact epoch; detect tampering/truncation. This is a primitive, not a transactional host writer or independent trust-root implementation.

## How to exercise

`node --test tests/wendbine-gatee-sourcefree-v02.test.mjs`

Ten source-free challenge groups passed locally under **Node 22.16.0** before publication. The Git object identities must be compared to the tested local bytes, and **independent exact-head CI/review is required** before acceptance. A passing test means only that the named synthetic assertions exercised the candidate.

## Required negative acceptance before any real restoration

**R05 host/custody security:** independently authenticated public seal from a pinned commit; encrypted artifact and local private key retained wholly offline; publication rights and source-level query/export grants; host-specific Windows ACL, symlink/reparse-point/path traversal and race checks; finite memory/storage bounds; atomic staging, fsync, committed-index manifest, disk-full/interruption rollback, no silent overwrite, and independent post-restart trust root.

**Q03 durable query:** close/reopen using a separately anchored receipt and recheck the index before every session; test rights withdrawal and stale cursors after changing the eligible source set. The current query cursor binds **data and query**, but per-session authorization changes are an external-host responsibility. Do not infer end-to-end rights security from these pure functions.

**Producer/validator schema parity:** run independent, source-free fixtures with exact public capture/v2 and version-observation shapes, hash-only title projections, same-time archive conflicts and backfill/edited-state cases. The current ten tests are not a complete correctness proof.

**Historical coverage:** source acquisition begins September 9, 2026. Prior history, comments and offsite media require separately scoped lawful acquisition. The November 2 cumulative sealed epoch should be retained. Incremental chronological sync with bounded overlap and backfill is a separate engineering track, not part of this PR.

## Governing dispositions

`SOURCE_FREE_KERNEL_TESTS_10_OF_10_PASS` (locally executed; exact-head CI unobserved at creation)

`FULL_RESTORER_NOT_COMMISSIONED_HERE`

`REAL_PRIVATE_RESTORE_HELD`

`FULL_QUERY_AND_RIGHTS_PARITY_HELD`

`NOVEMBER_2_SEALED_EPOCH_UNTOUCHED`

`STAGE_III_POST_REST_UNTOUCHED`

`EXPERIMENT_B_FLIGHT_HELD`

Human authorship, source admission, scientific interpretation, merge, deployment and final release RESERVED.

𝄐 Khona‌lit-po · Sealed ⟐SAC[X6ZNK5NO51]
