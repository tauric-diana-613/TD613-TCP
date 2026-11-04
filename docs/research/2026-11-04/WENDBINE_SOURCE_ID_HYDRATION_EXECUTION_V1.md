# 𝌋 TD613 · Wendbine actual source acquisition from the pinned 2,062-ID manifest

**Status:** source-free engineering candidate pending exact-head CI. **This document alone is not a live acquisition receipt.**

**Principal:** Tawanna C. Miller · `tauric.diana.613`  
**Covenant:** Tauric Diana — Crimean heritage custodianship · Khona‌lit-po (interior U+200C preserved)  
**Branch:** `research/wendbine-manifest-id-hydration-v1-20261104`  
**Parent:** PR #1667, `0237ee211f3d4b63a359769d55232b0cd50fb6dc`

## Corrected diagnosis

The November 4 desktop inventory found no qualifying historical plaintext export in the searched Windows directories. That failure tests **local custody locations**, not public archival source availability. It does not justify another search for an operator-held file the system never created.

The original Wendbine research branch #1134 contains a content-addressed 2,062-identifier registry; its exact file SHA-256 is `9ae84260dfed9d3d1b6d26ba55a41ce75e2ed0e3527cf2fb253a7ee2142e54ac`. Independently, Arctic Shift documents `GET /api/posts/ids?ids=...`, accepting up to 500 known public Reddit post IDs per request: https://github.com/ArthurHeitmann/arctic_shift/blob/master/api/README.md . The new local tool uses bounded batches of 25 by default, verifies every returned source ID and author/community, and distinguishes actual archived full text, title-only observations, unavailable IDs, and failed acquisition.

**This is a historical archive observation route, not a fresh author-signature witness.** Later moderator filtering, current visibility and author deletion are separate evidentiary questions. Removal metadata in an archival payload does not cause preserved full text to be discarded. Placeholder bodies are never passed off as original prose. Full raw provider responses and exact request observations remain on the operator's private local disk.

## Exact source inputs

- Code: `scripts/wendbine-manifest-id-hydrator-v1.py`
- Public-ID manifest at original Wendbine PR #1134 detached worktree:
  `packages/dome_world_exact/fixtures/a15-r0/WENDBINE/01-MANIFESTS/phase2/manifestations.jsonl`
- Original Wendbine pinned commit: `4dcb3ac45d5a14f1db2c2f9e0733ed2d1a7121c1`
- Original SRC pinned commit: `b3e69acf587d534eeef2e01d0bb5bdbdecdbd320`
- Original Em pinned commit: `70b5a0f9e94626cba6068f41c6117e7978800bbd`

No original branch history should be merged, rewritten, or relocated. Do not use the empty main branch as a substitute for the historical manifest.

## Independent discovery outside the pinned registry

The pinned registry begins **2026-09-09T00:22:19Z** and ends **2026-11-04T01:39:56Z**. Earlier public Wendbine material is independently indexed, including a June 6, 2026 thread absent from the pinned 2,062 IDs; publicly discoverable posts also appear in December 2025. Thus the pinned registry must never be presented as first-publication or full-historical coverage.

The new `scripts/wendbine-archive-discover-source-ids-v1.py` makes bounded, author- and subreddit-scoped historical search requests, splits saturated 100-result time windows recursively, and records even a saturated one-second interval as **HELD** instead of claiming that all posts were found. It writes **only IDs and raw provider response bytes to the operator's private disk**; its `extra-ids.json` is labeled separate from and subordinate to the exact-pinned native ID registry.

Use **two disjoint discovery workspaces** before the final ID hydration:

```powershell
python -B -m unittest discover -s tests -p 'test_wendbine_archive_discover_source_ids_v1.py' -v
python -B scripts/wendbine-archive-discover-source-ids-v1.py --public-manifest "<PINNED-WENDBINE-WORKTREE>\packages\dome_world_exact\fixtures\a15-r0\WENDBINE\01-MANIFESTS\phase2\manifestations.jsonl" --private-workspace "<NEW-LOCAL-PRIVATE-RESEARCH-DIRECTORY>\discover-before-sept09" --since "2025-01-01T00:00:00Z" --until "2026-09-09T00:22:19Z"
python -B scripts/wendbine-archive-discover-source-ids-v1.py --public-manifest "<PINNED-WENDBINE-WORKTREE>\packages\dome_world_exact\fixtures\a15-r0\WENDBINE\01-MANIFESTS\phase2\manifestations.jsonl" --private-workspace "<NEW-LOCAL-PRIVATE-RESEARCH-DIRECTORY>\discover-after-nov04" --since "2026-11-04T01:39:56Z" --until "<ACTUAL-UTC-NOW-AT-EXECUTION>"
```

When a discovery run is interrupted by an actual provider error, repeat that **same** command and workspace with `--resume`. Missing/empty archive search is not evidence of historical nonexistence. Intervals before January 2025 remain outside the commissioned discovery horizon and explicitly unverified.

Then supply both source-labeled discovery files to the known-ID hydrator in its one private output workspace:

```powershell
python -B scripts/wendbine-manifest-id-hydrator-v1.py --public-manifest "<PINNED-WENDBINE-WORKTREE>\packages\dome_world_exact\fixtures\a15-r0\WENDBINE\01-MANIFESTS\phase2\manifestations.jsonl" --private-workspace "<NEW-LOCAL-PRIVATE-RESEARCH-DIRECTORY>\wendbine-hydration-20261104" --extra-ids "<PRIVATE-RESEARCH-DIRECTORY>\discover-before-sept09\extra-ids.json" --extra-ids "<PRIVATE-RESEARCH-DIRECTORY>\discover-after-nov04\extra-ids.json" --batch-size 25
```

Every batch receipt is now tied to the digest of the **full pinned-plus-discovered ID universe**. Changing the discovery set during an interrupted sync will cause resume to refuse rather than silently skip or reassign sources. The resulting SQLite corpus has explicit source archive provenance and remains **observed archive coverage**, never a demonstrated complete origin archive or author-signed original.

## One-pass Windows desktop Work execution

Fetch and pin this PR's **actual reviewed exact HEAD**, create a detached worktree for it, and independently pin Wendbine #1134/SRC #731/Em #962. Re-run the new source-free tests and confirm exact-head consolidated CI.

Use **an existing private local directory OUTSIDE the repository**, with sufficient disk space. Create one new empty output workspace. The following commands are one-line PowerShell examples with operator-resolved absolute paths; the placeholders are not real directories:

```powershell
python -B -m unittest discover -s tests -p 'test_wendbine_manifest_id_hydrator_v1.py' -v
# Execute the preceding two-window discovered-ID hydration command here; do not rerun pinned-only hydration in the same output workspace.
```

If an actual network failure interrupts a batch, preserve the completed batch files in the same private workspace and repeat the identical command with `--resume`. **Do not bypass rate limits, access controls or security barriers.** Do not treat timeout, 403, missing provider IDs or unexpected response shape as proof a source was never published. Stop only the unsupported operation and report the exact blocker.

The tool produces locally, only after the bounded ID batch process completes:
- `archive-batches/*.json` — exact observed archive-return bytes (private plaintext, NOT to GitHub)
- `archive-batches/*.receipt.json` — requested source IDs, UTC acquisition time, source response hash, byte count
- `wendbine-captures.jsonl` — source- and hash-labeled actual observed title and body, with no invented body reconstruction
- `hydrate-receipt.json` — IDs requested/returned, actual observed bodies, title-only material, held IDs, evidence ceilings
- `unreturned-or-held-ids.json` — exact held IDs and reasons (private local forensic reconciliation)

Follow by importing these *actual* archive observations into the existing operator-local custody reader. Use `--since` and `--until` as the genuine publication interval supported by the manifest and retrieval receipt. This example uses the historically observed span September 2026 through November 4, 2026, with an exclusive cutoff on November 5:

```powershell
python -B scripts/wendbine-local-capture-intake-v1.py import --manifest "<PRIVATE-RESEARCH-WORKSPACE>\wendbine-captures.jsonl" --db "<PRIVATE-RESEARCH-WORKSPACE>\wendbine-custody-v1.sqlite" --since "2026-01-01T00:00:00Z" --until "2026-11-05T00:00:00Z" --custody-basis "independently archived public post-ID observations, fetched through known-ID read-only archive endpoint"
python -B scripts/wendbine-local-capture-intake-v1.py history-exact --db "<PRIVATE-RESEARCH-WORKSPACE>\wendbine-custody-v1.sqlite" "𝌋"
python -B scripts/wendbine-local-capture-intake-v1.py history-lexical --db "<PRIVATE-RESEARCH-WORKSPACE>\wendbine-custody-v1.sqlite" "topology"
python -B scripts/wendbine-live-research-index-v1.py --db "<PRIVATE-RESEARCH-WORKSPACE>\wendbine-custody-v1.sqlite" status
python -B scripts/wendbine-source-coverage-adjudicator-v1.py --db "<PRIVATE-RESEARCH-WORKSPACE>\wendbine-custody-v1.sqlite" --public-manifest "<PINNED-WENDBINE-WORKTREE>\packages\dome_world_exact\fixtures\a15-r0\WENDBINE\01-MANIFESTS\phase2\manifestations.jsonl" --since "2026-01-01T00:00:00Z" --until "2026-11-05T00:00:00Z"
```

Then execute Universal exact and audit queries with `--src-checkout`, `--em-checkout` and `--wendbine-db` set to the pinned and operator-local paths, as specified in the existing #1664 mandate. Demonstrate early, middle and recent exact source readback, title-only preservation, archive body offset/hashes, source-ID coverage, and source-grounded hyperlink topology. Report SRC and Em native-method parities separately.

## Separate operator-requested disposal of obsolete encrypted Wendbine ZIPs

The live text recovery must **never rely on decrypting or reopening** the two obsolete encrypted ZIP handoffs. Following operator's explicit previous destruction directive, run the separately bounded cleanup in the same authorized Windows Work session **only after** exact-target verification:

| Captured obsolete handoff | GitHub Actions artifact ID | Required ZIP bytes | Required ZIP SHA-256 |
| --- | ---: | ---: | --- |
| November 2, 2026 | `13166173531` | `11753731` | `f8e3a09e0344b40aa6b56fbd5ef24c793dc02b056e24506568ba63456f7b92c1` |
| November 4, 2026 | `13288781055` | `12220904` | `4804fabd2a2deb29652d21debc96a2a4feb3e1847aa66346d99dab560de20aeb` |

The prior Windows receipt identified two byte/hash-matched local copies of each handoff and verified GitHub artifact metadata. **Re-check paths, bytes, hashes and GitHub metadata immediately before any deletion.** Inspect available custody/preservation notices for an *affirmative* legal or institutional hold; a specific identified hold precludes that deletion. Do not impose an impossible metaphysical proof that no undiscovered hold exists as a substitute for the operator's already explicit disposition instruction. If there is no conflicting recorded preservation obligation in the available custody record, delete **only the exact matched four known local ciphertext files** and the two verified GitHub Actions artifact IDs, recording each API response and the known/excluded copy scope. Keep metadata manifests, non-secret receipts, original source methods, SRC and Em histories, database, and unconnected archives intact. If GitHub permissions forbid Actions deletion, preserve precise failure status instead of claiming success. Distinguish logical removal from physical SSD or remote backup erasure.

This subsection authorizes no decryption, recovery of protected original ZIP bodies, indiscriminate filesystem search, archive restoration, or wholesale cleanup.

## Acceptance and final report

**A successful CI run certifies software behavior against invented provider responses, not actual retrieval.** For a live outcome require actual body/title counts; hashes and a few bounded authorized quotations; manifest-ID reconciliation; distinct error/missing categories; provider batch provenance; real Universal readback; and a sanitized receipt of the exact original Git heads. Any provider refusal or incomplete coverage retains an explicit HELD/INCOMPLETE classification, while successfully imported evidence remains searchable.

Do not publish full post bodies, raw responses, private JSONL or SQLite, copyright-protected bulk text or protected research sources to GitHub. Local archive copies and their provenance remain separate from the old encrypted Wendbine ZIP artifacts and the still-open disposal disposition.

**No GitHub merge, production deployment, Experiment B Flight, scientific claim promotion, private-data disclosure or unauthorized access is implied by this staged method.**

𝄐 Khona‌lit-po · Human scientific closure RESERVED ⟐
