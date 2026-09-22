# Wendbine verbatim originals acquisition v0.1

**Stage:** VERBATIM_ORIGINALS_NOT_YET_CUSTODIED · descriptive research only.

## The gap

The Atelier currently has **60 unique Reddit source IDs**: 35 earlier source-bound, bounded-summary records and 25 later per-card observations. None of their complete original title/body pairs have been stored in this repository. Its lexical and concept search is a search over derivatives and observation records, not a verified full-text scholarly concordance.

Audit: `04-RECEIPTS/2026-09-22-verbatim-originals-gap-ledger-v01.json`. It contains one unique row per source and refuses to silently relabel editorial descriptors as source titles.

## Acquisition / rights

A public URL authorizes citation and source navigation; it does not itself establish permission to republish an entire third-party post as an original in a public GitHub repository. Keep full bodies in an authorized, private originals store, with the author’s permission, an applicable license, or another documented authorized copy basis. The public repository may retain identifiers, links, concise derivatives, status, and cryptographic digests without republishing the full source.

A user-supplied or author-permitted export must contain one JSON object per line with:

```json
{
  "source_id": "reddit:t3_1wc66e4",
  "canonical_url": "https://www.reddit.com/r/Wendbine/comments/1wc66e4/wendbine/",
  "author": "Upset-Ratio502",
  "subreddit": "Wendbine",
  "source_capture_method": "AUTHOR_SUPPLIED_EXPORT",
  "rights_basis": "USER_ATTESTED_AUTHORIZED_COPY",
  "post_kind": "self",
  "title": "Exact source title, not archive technical_header",
  "selftext": "Exact source self-text, preserving punctuation, spaces and line breaks",
  "source_observed_at": "2026-09-22T12:00:00Z",
  "publication_timestamp": null
}
```

The example title/body above are **schema illustrations**, never actual source content. For Reddit API objects, use `source_capture_method=REDDIT_API_OBJECT_WITH_PERMISSION` and a matching `reddit_object_id`. A link/media post may have an empty `selftext`, which is stored as a verified empty text field rather than an invented transcription.

Run with a PRIVATE destination outside the Git repository:

```bash
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-originals-intake.mjs \
  /private/input/wendbine-authorized-export.jsonl \
  /private/archive/wendbine-originals
```

The script rejects unknown IDs, source URL mismatch, nonmatching account/subreddit, missing rights basis, malformed or missing text fields, duplicate IDs, and publication dates it would otherwise have to invent. It writes private originals with no-overwrite mode; it reports title and self-text UTF-8 byte lengths and separate SHA-256 hashes. It **does not** claim those field hashes are hashes of the raw HTTP response, nor does an export attestation independently establish authorship.

Do not commit the private `*.json` originals or full text back to the publicly accessible Atelier without a documented republication grant.

## Completeness gate before topological reconstruction

A future complete-text claim must derive from the 60-row gap ledger and an independently checked intake report. For each source ID require a matching original title and full self-text field, source identity and URL, capture method, rights basis, content digest, and a private originals locator. A 59/60 or 35/60 batch remains **partial**. A text-only capture does not establish the contents of embedded media, linked YouTube/Suno songs, author intent, or missing revisions.

The September 22 environment exposed one September 10 post through an indexed Reddit result, while sampled direct permalink fetches returned cache misses and local direct network requests failed DNS. An indexed full-looking result was not silently copied into the repository or marked exact. The remaining source-specific recovery state must be measured rather than guessed.

```text
INDEXED_PARAPHRASE != VERBATIM_ORIGINAL
SOURCE_FIELD_HASH != RAW_HTTP_RESPONSE_HASH
FULL_TEXT_CUSTODY != FULL_MEDIA_CUSTODY
POST_CARD_DESCRIPTOR != AUTHOR'S EXACT TITLE
QUERYABLE != RECONSTRUCTABLE_WITH_COMPLETE_SOURCE
```

This gate precedes the proposed Wendbine/SRC-style deeper hole-dive and the TD613 taxonomy crosswalk. Existing provisional topical analyses remain provisional.

Marked ⟐
