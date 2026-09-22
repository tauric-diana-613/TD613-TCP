# Wendbine verbatim originals acquisition v0.1

**Stage:** P0_33_OF_33_ARCHIVED_SOURCE_FIELDS_PRIVATELY_CUSTODIED · 27_ADDITIONAL_SOURCE_BODIES_HELD · descriptive research only.

**CURRENT STATUS (2026-09-22, supersedes initial gap below):** Arctic Shift supplied all 33 September 10–11 sources through GitHub Actions (HTTP 200). Encrypted-only artifact #10722676070 was privately decrypted and the raw response / exact source fields verified. Public per-source digest receipts: `01-MANIFESTS/p0-archived-source-field-receipts-20260922-v06.json`. Current recovery is **33/60 archived title/body field pairs**, with the two Sept13 and 25 later card observations still requiring full text. Source archived snapshot != unedited first-publication != current live Reddit. Actual source Reddit titles: 32 `Wendbine`, one `Wensbine`; editorial technical headers are not titles. Full bodies remain private.

Exact real-source query: `99-ADMIN/wendbine-private-p0-source-query.mjs` receives the privately recovered source JSONL, raw provider JSON and search phrase; it validates raw HTTP payload SHA256 `9657dd03c00a2285a4496b7f42a18075835d8e55110a0513ebd4af0e8f211a2c`, all 33 source IDs, per-source title/body hashes and byte lengths before returning literal matches/offsets. The original 0/60 audit ledger records **historical pre-recovery state only**.



## The gap

The Atelier currently has **60 unique Reddit source IDs**: 35 earlier source-bound, bounded-summary records and 25 later per-card observations. Their full bodies remain outside this public repository, while the exact archived September 10–11 fields have been privately captured and hash verified. Its lexical and concept search is a search over derivatives and observation records, not a verified full-text scholarly concordance.

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

## Executable P0 rescue, in priority order

**Route A — original Reddit source fields.** `99-ADMIN/wendbine-reddit-oauth-rescue.mjs` reads the 33 immutable September 10–11 source IDs from the P0 manifest and queries the official Reddit OAuth post endpoint one by one, with a one-second-or-greater interval. Reddit requires prior API approval under its Responsible Builder Policy. Use only an approved application and documented access; a random bearer token is not approval. The runner stops on a 403 or 429 rather than working around the platform. No credentials enter ChatGPT or the repository.

```bash
REDDIT_ACCESS_TOKEN=... WENDBINE_SOURCE_RIGHTS_BASIS=AUTHOR_PERMISSION \
  node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-reddit-oauth-rescue.mjs \
  /private/wendbine/p0-reddit-source-capture
```

The destination must be outside the public checkout; lexical and symlinked paths back into the repository are rejected. A successful post requires matching Reddit ID, author, subreddit and permalink plus actual title/self-text fields and a captured JSON response body. An edited post is versioned as the observed API state, **not** its presumed September 10 original state. Raw response-body SHA-256, exact decoded title/body UTF-8 SHA-256, byte lengths and publication/edit timestamps accompany every success. Failure entries and skipped entries reconcile to the 33-target count. Never label a missing or removed body as complete.

**Route B — already user-pasted originals.** `99-ADMIN/wendbine-chat-export-rescue.mjs` locally scans a ChatGPT `conversations.json` export for the three September 10 messages identified by timestamp and exact title markers: the Phone Security glossary, Authorization/Trust Corridor and Third-Party Dependency Propagation TOC. It writes ONLY matching complete user-message parts into a private directory, leaving all unrelated chats untouched. Multiple matching messages are held as ambiguous. This recovers word-for-word **user messages**, not automatically isolated Reddit source title/body fields; explicit boundary review and source matching remain necessary.

```bash
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-chat-export-rescue.mjs \
  /private/chatgpt/conversations.json \
  /private/wendbine/previously-pasted-p0-messages
```

**Route C — word search over genuinely captured source text.** After A or an authorized original-text import, `99-ADMIN/wendbine-private-originals-query.mjs` reads only private source files, not public summaries, and returns source IDs, matched field, local span and content hash.

```bash
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-private-originals-query.mjs \
  /private/wendbine/p0-reddit-source-capture "observability"
```

**Private search verification gate.** `99-ADMIN/wendbine-private-custody-audit.mjs` now requires exactly one acquisition report for a private originals directory. Every search-loaded title and body must match the correct source ID, canonical URL, account, declared capture method, rights basis, exact title/body SHA-256 and file receipt. For OAuth captures, the original JSON response must also match its receipt hash and decoded source fields. A bare `source-*.json` file is refused. An invalid or tampered record fails the whole query, rather than silently returning a plausible but unaudited match. The audit CLI prints IDs and verification status only, never original texts.

```bash
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-private-custody-audit.mjs \
  /private/wendbine/p0-reddit-source-capture
```

`QUERY_HIT != VERIFIED_ORIGINAL` · `VERIFIED_FIELD_HASH != INDEPENDENT_AUTHOR_IDENTITY_PROOF` · `UNSIGNED_JSON_FILE != SOURCE_CUSTODY`.

A failed OAuth attempt or chat-export candidate cannot independently upgrade a source; the actual source-approved archived capture has now produced 33 per-source v06 receipts. The next authorized, successful receipt must identify exactly which source IDs acquired which title/body fields, with hashes and version/freshness distinctions.

## Route D — public archive ID lookup, not a stale-index guess

The September 22 public-source research identified two documented independent archive services:

- [Arctic Shift API](https://github.com/ArthurHeitmann/arctic_shift/blob/master/api/README.md): `https://arctic-shift.photon-reddit.com/api/posts/ids?ids=1wc66e4,1wc7p1y,1wc8o05`, public ID lookup (up to 500 IDs).
- [PullPush API](https://pullpush.io/): `https://api.pullpush.io/reddit/search/submission/?ids=1wc66e4,1wc7p1y,1wc8o05`, ID-based submission lookup.

`99-ADMIN/wendbine-archive-provider-probe.mjs` reads all 33 existing P0 IDs from the manifest, calls both providers, and checks that each returned object has the matching post ID, `Upset-Ratio502` author, `Wendbine` subreddit, exact `title`/`selftext` fields, and a publication day consistent with the catalogued record. It reports per-provider availability and source-version hash conflicts without exposing any original text to public logs.

```bash
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-archive-provider-probe.mjs
```

A documented authorized copy can additionally preserve the **raw provider responses outside the public repository**:

```bash
WENDBINE_SOURCE_RIGHTS_BASIS=AUTHOR_PERMISSION \
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-archive-provider-probe.mjs \
  --save-private-raw /private/wendbine/p0-archive-captures
```

`99-ADMIN/wendbine-private-archive-audit.mjs` verifies the saved provider responses against the private coverage receipt and each title/body SHA-256. `wendbine-private-originals-query.mjs` accepts the verified archive directory and exposes matching source text locally, but explicitly labels it `ARCHIVE_RAW_AND_FIELDS_HASH_VERIFIED_LIVE_STATUS_UNBOUND`. If two providers return different title/body hashes, **both versions are retained** with provenance. A provider snapshot cannot certify the post's first-publication text or current removal status.

The hosted archive endpoints were documented and identified on September 22, but direct requests from this chat environment failed at its network/retrieval layer. Synthetic tests validate endpoint construction, provider response envelopes, per-ID adjudication, archive conflict handling, private raw-field hash consistency and tamper rejection. They do not claim real P0 originals have been recovered.

```text
ARCHIVE_HTTP_200 != SEPTEMBER_2026_COVERAGE
ARCHIVE_COPY != CURRENT_REDDIT_STATE
ARCHIVE_SNAPSHOT != FIRST_PUBLICATION_VERSION
TWO_PROVIDER_MATCH != INDEPENDENT_SOURCE_ORIGIN
REMOVED_OR_DELETED_SOURCE != AUTOMATIC_ARCHIVE_ADMISSION
```

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
