# 𝌋 TD613 · WENDBINE INDEPENDENT HISTORICAL CAPTURE INTAKE

**Status:** Source-free local importer candidate. **Not a claim that any genuine Wendbine record has been imported.**  
**Author/custody authority:** Tawanna C. Miller · Tauric Diana / Khona‌lit-po (preserve U+200C). Human interpretation and closure reserved.  
**Research branch:** `research/wendbine-local-custody-import-v1-20261104`, stacked on #1665.

## Governing epistemic rules

An independent historical capture, a post's present display, a platform moderation action, and an author's voluntary deletion are **distinct observations**. The Atelier shall not erase or rewrite a retained historical capture merely because the platform later filters or ceases to serve that post. The platform's live API does not determine the lab's provenance, classification, canonical research interpretation or independent custody.

That separation does not grant a new right to access protected accounts, bypass technical access restrictions, distribute copyrighted text or disregard applicable law. Platform-specific access rules apply when an acquisition route uses that platform, and are never silently promoted into universal laboratory governance.

This importer uses **only operator-supplied local plaintext captures**. It performs no network request, archive decryption, provider authentication, GitHub upload or old ZIP restoration. It does not claim that a local source declaration proves independent origin or first-ever publication.

## Data contract

A local UTF-8 `.jsonl` or `.ndjson` contains **one independent capture per line**. Every row uses `schema = "td613.wendbine.local-capture/v1"` and the fields:

- `capture_id` — stable unique capture-observation ID.
- `source_id` — exact `reddit:t3_<post-id>`; `author` is `Upset-Ratio502`, `subreddit` is `Wendbine`.
- `source_system`, `source_locator` — actual local archive/screenshot/export provenance supplied by operator; not automatically authenticated.
- `published_at_utc`, `captured_at_utc` — explicit UTC timestamps. Captured cannot precede publication.
- `title`, `selftext` — **actual retained historical text**, not a title-only metadata approximation or `[removed]` placeholder.
- `title_sha256`, `body_sha256` — SHA-256 of the exact UTF-8 field bytes; invalid hashes refuse the record.
- `later_visibility_state` — one of `LATER_STATUS_UNKNOWN`, `VISIBLE_AT_CAPTURE_REPORTED`, `PLATFORM_FILTERED_REPORTED`, `PLATFORM_REMOVED_REPORTED`, `AUTHOR_DELETED_REPORTED`, `OTHER_UNAVAILABLE_REPORTED`. These labels are *reported states*, not evidence of actor intent. An unknown remains unknown.
- Optional boolean `is_self`, `is_video`, and optional `outbound_url`.

Never manufacture source text from the public 2,062-ID registry. Compare admitted actual source IDs against it later with `wendbine-source-coverage-adjudicator-v1.py`. Keep missing records HELD.

## Source-local execution

Use an isolated verified review checkout on the authorized Windows workstation. Keep the manifest and SQLite database in separately designated operator-local custody folders, not inside Git-tracked repository paths. Confirm paths, intended retention and source provenance. Do not read encrypted ZIPs.

```powershell
python -B -m unittest discover -s tests -p 'test_wendbine_local_capture_intake_v1.py' -v
python -B scripts/wendbine-local-capture-intake-v1.py import --manifest '<absolute-operator-local-path>\wendbine-captures.jsonl' --db '<absolute-private-path>\wendbine-custody-v1.sqlite' --since '2026-01-01T00:00:00Z' --until '<actual-UTC-exclusive-cutoff>' --custody-basis 'operator-held independent historical source observations'
python -B scripts/wendbine-local-capture-intake-v1.py history-exact --db '<absolute-private-path>\wendbine-custody-v1.sqlite' '𝌋'
python -B scripts/wendbine-local-capture-intake-v1.py history-lexical --db '<absolute-private-path>\wendbine-custody-v1.sqlite' 'topology'
python -B scripts/wendbine-live-research-index-v1.py --db '<absolute-private-path>\wendbine-custody-v1.sqlite' status
```


The core index stores a deterministic earliest-observed capture per source for compatibility with existing Wendbine/Universal read-only retrieval; `capture_versions` and the dedicated `capture_fts` store and search **every** admitted historical capture of that source, even if edited or later reported filtered. Each historical version has its own title and body BLOBs, SHA-256, capture time, source label and declared custody basis. A conflicting publication time, mutated byte hash, duplicate capture ID or unsupported status blocks admission.

## Acceptance and remaining limits

Demand observed original title and body exact readback; word-for-word UTF-8 byte spans, title/body hashes, date enumeration; all-version lexical queries; synthetic adversarial failures; public-ID coverage with held missing IDs; and Universal source-label fidelity. Provide aggregate counts, hashes and bounded non-sensitive citations to GitHub. Do not upload the raw private source body manifest or SQLite DB.

Neither this script nor a successful synthetic test proves that a local plaintext manifest exists. No source corpus is created until that manifest is actually supplied, verified and ingested. This script does not turn an encrypted ZIP into text, claim a current deleted-post authorization, execute SRC's complete native geometries, or establish full Universal scientific parity. Preserve all four states separately in the outcome report.

**Old ZIP disposal:** independently verified file identities and retention holds remain a separate local-custody operation. Do not conflate a source-text rebuild with ciphertext deletion.

𝄐 Khona‌lit-po · Independent custody preserved · Human closure reserved ⟐
