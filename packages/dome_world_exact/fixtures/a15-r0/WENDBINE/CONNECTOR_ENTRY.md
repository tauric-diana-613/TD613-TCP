# Wendbine Atelier connector entry

## Operator-invoked SRC parity — no unattended sync

**Invocation in ChatGPT:** connect @GitHub and say **“Sync Wendbine.”** The operator resolves independent [Wendbine Gate #1308](https://github.com/tauric-diana-613/TD613-TCP/issues/1308) and posts exactly one \`/wendbine-sync ATELIER\` gesture for one bounded run. The listener is staged in existing \`.github/workflows/vercel-relock-safety.yml\`, separately from SRC's permanent gate #758. No cron, scheduled polling, ambient discovery or automatic retry is authorized.

The gate validates the configured research PR/branch, loads the last sealed portable epoch, queries the bounded public archive, and checks source ID/author/community/title/body/date and pagination reconciliation. It then creates new/changed/unchanged/held receipts; preserves immutable prior run receipts and capture versions; writes SRC-style manifestation, capture, blob, derivative, rights, resolver, version and typed source-bound edge registries; records a seal; and returns the gate to DORMANT. GitHub's public projection contains source metadata and digests only. New source bodies and raw archive responses travel in a **separate encrypted research artifact with bounded retention**, requiring private custody transfer. The four AIA routes remain EXPERIENTIAL, CUSTODIAL, AUDIT and IMPLEMENTATION; exact epoch/snapshot binding is mandatory.

**Deployment state:** this listener is staged on Draft PR #1134, **not active on main until reviewed and merged**. The 60-post historical v06/v07 capture remains privately verified; a fresh operator gesture is required for every later sync. A future gate gesture cannot be considered complete until the accepted run, before/after heads, capture receipt, source-state counts and DORMANT return are actually verified.

\`\`\`text
ONE_USER_COMMAND -> ONE_GATE_GESTURE -> ONE_BOUNDED_SYNC -> VERIFIED_RECEIPT -> DORMANT
SRC_ISSUE_758 != WENDBINE_ISSUE_1308
PORTABLE_JSONL != PRIVATE_SQLITE_INDEX
ARCHIVED_COPY != FIRST_PUBLICATION_VERSION != CURRENT_LIVE_REDDIT
SOURCE_RECOVERY != AUTHOR_INTENT != SCIENTIFIC_PROMOTION
\`\`\`

## PRIMARY-SOURCE ACQUISITION — CURRENT 60/60

**All 60 individually indexed Reddit source objects have been recovered from Arctic Shift, privately restored, and checked against the actual raw archive responses and exact title/self-text hashes.** The original September 10–11 P0 cohort contributes 33 nonempty text bodies; the September 13 pair contributes two; the later 25 cards contribute 23 nonempty text bodies and **two verified empty-self-text media/link posts**. Thus the **private word-search corpus has 58 text bodies and two media/link source records**. The media files themselves remain separately unacquired. No full third-party source bodies are committed to public GitHub.

- P0 public source/hash witness: `01-MANIFESTS/p0-archived-source-field-receipts-20260922-v06.json` (GitHub run #4189; 33/33; raw SHA-256 `9657dd03c00a2285a4496b7f42a18075835d8e55110a0513ebd4af0e8f211a2c`).
- P1/P2 public source/hash witness: `01-MANIFESTS/p1p2-archived-source-field-receipts-20260922-v07.json` (GitHub run #4212; 27/27; raw SHA-256 `819a3610fe4846f79489ca084793e7d7322658f0cdf3be2af62e99e5f34c1b85`).
- Exact archived Reddit titles: `Wendbine` in 59 source objects and `Wensbine` in one; the old technical headers remain expressly editorial descriptors.
- In the private research runtime, raw P0 and P1/P2 responses and verified title/body fields are joined in a **60-source SQLite FTS5 index**. The public `wendbine-query.mjs` still searches bounded derivatives, not full original bodies.

**Portable private original-text retrieval** (source-field hashes checked against both public manifests before any result):

```bash
python packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-private-unified-query.py \
  --db /private/wendbine/unified/wendbine-60-fts.sqlite status
python packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-private-unified-query.py \
  --db /private/wendbine/unified/wendbine-60-fts.sqlite search "observability" --mode exact
```

The private query returns bounded source snippets, canonical post links, UTF-8 offsets and source hashes; whole bodies remain outside GitHub. `--mode fts` is tokenized full-text search, while the public `wendbine-query.mjs --mode semantic` provides the separately evidenced deterministic concept-relational view. Neither is a license to infer hidden state.

- The original 0/60 gap ledger, P0 33/60 intermediate status, and September 16 unrecoverable original per-card observation loss are **historical receipts**. Their old counts must never override the current v06/v07 source-acquisition receipts. The later 25 IDs do not retroactively repair September 16's distinct lost observation set.

```text
60 SOURCE OBJECTS != 60 NONEMPTY TEXT BODIES
EMPTY MEDIA SELF-TEXT != MEDIA CONTENT RECOVERED
ARCHIVED VERSION != UNEDITED FIRST PUBLICATION != CURRENT REDDIT STATE
RAW/HASH VERIFIED SOURCE != PROOF OF AUTHOR INTENT OR HIDDEN PLATFORM PROCESS
```

## September 22 P0 rescue lineage — historical intermediate state

**P0 September 10–11: 33/33 archived source-title and body fields recovered, privately captured, and hash verified.** This supersedes the historical 0/33 source-acquisition statements below. The P0 33/60 figure describes the earlier intermediate state; all remaining 27 post objects were later acquired and privately verified as documented above. This is an archived September 22 source version, neither independently certified first-publication text nor current Reddit state.

GitHub Actions run **#4179** obtained Arctic Shift HTTP 200, with 33 matched post IDs/account/subreddit and 587,232 raw response bytes; PullPush returned 403. Runs **#4186** and **#4189** repeated the capture and encrypted the source fields before artifact upload. Both returned raw payload SHA-256 `9657dd03c00a2285a4496b7f42a18075835d8e55110a0513ebd4af0e8f211a2c`. The encrypted artifact was downloaded and decrypted in the private research runtime, and all 33 records were checked against raw response and field hashes. The recovered corpus contains 492,909 source-body characters.

**Public source audit:** `01-MANIFESTS/p0-archived-source-field-receipts-20260922-v06.json` has one row per post: source ID, canonical URL, *actual Reddit title*, title/body SHA-256, body bytes, source creation/edit metadata, provider, encrypted handoff provenance. Actual Reddit titles: `Wendbine` (32) and `Wensbine` (1); the old `technical_header` values are editorial descriptors, and substantive headings appear inside the source bodies.

**Durable encrypted handoff and restore:** GitHub Actions publishes only ciphertext `wendbine-p0-encrypted-research-handoff` (one-day retention); the RSA private key remains outside GitHub. `99-ADMIN/wendbine-private-p0-restore.mjs` decrypts a saved `p0-archive.sealed.json` with that private key into an out-of-repository directory, verifies the raw archive SHA-256 and all 33 public v06 title/body receipts before making originals searchable. Preserve the ciphertext and private key separately in authorized private storage if source continuity across chat/container sessions is required. The public repository contains neither the RSA private key nor the full third-party post bodies.

```bash
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-private-p0-restore.mjs \
  /private/backup/p0-archive.sealed.json /private/backup/private.pem /private/wendbine-restored
```

**Real private word search:** `99-ADMIN/wendbine-private-p0-source-query.mjs` verifies the raw response against the public digest, reconciles all 33 exact source fields and hashes, then returns literal source-text matches with offsets and bounded snippets. Run:
```bash
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-private-p0-source-query.mjs \
  /private/wendbine/p0-originals-private.jsonl \
  /private/wendbine/p0-raw-provider-private.json \
  "observability"
```
Full bodies remain outside this public GitHub repository; the public unified `wendbine-query.mjs` still searches its bounded derivatives, while this private query searches the recovered actual text. The original gap ledger v0.1 records **the historical pre-recovery state** and must not be used as the latest state.

```text
ARCHIVED_EXACT_FIELDS != FIRST_PUBLICATION_VERSION != CURRENT_LIVE_REDDIT_STATE
REDDIT_TITLE != BODY_INTERNAL_HEADING != ARCHIVE_EDITORIAL_DESCRIPTOR
PRIVATE_EXACT_TEXT_QUERY != PUBLIC_DERIVATIVE_QUERY
```

Before querying, synchronizing, or extending this fixture:

1. Read `README.md` and `ATELIER_PROFILE.json`.
2. Treat the source corpus as an append-only lineage, not as only the original 48-hour snapshot.
3. Read the current source manifests:
   - `01-MANIFESTS/public-reddit-48h-snapshot-v01.json`
   - `01-MANIFESTS/public-reddit-delta-20260913-snapshot-v02.json`
   - `01-MANIFESTS/public-reddit-hydration-20260915-v03.json`
   - `01-MANIFESTS/public-reddit-hydration-20260916-v04.json`
   - `01-MANIFESTS/public-reddit-profile-delta-20260916-snapshot-v04.json`
4. Preserve every source's canonical URL, stable `source_id`, evidence class, and publication precision actually exposed.
5. Keep source assertion, archive observation, archive-derived co-occurrence, Atelier inference, HELD observation, and capture-debt receipt distinguishable.
6. Do not import private Google-group material merely because a public counterpart is suspected.
7. Do not infer author motive, hidden state, private shared memory, civil identity, operator identity, authority, or orchestration from serialized continuity.
8. Do not flatten typed graphs.
9. **Query before archaeology.** Use `99-ADMIN/wendbine-query.mjs` for ordinary lexical, concept-semantic, chronological, or stable-ID retrieval across the Atelier.
10. **Persist before promotion.** Every observed public card must satisfy the capture reconciliation contract in `06-INSTRUMENTS/WENDBINE_SYNC_CAPTURE_CONTRACT_V0_1.md`.

## Current source-bound corpus

```text
base_snapshot = wendbine-public-reddit-48h-20260911T092700Z-v01
append_only_delta = wendbine-public-reddit-delta-20260913T234421Z-v02
source_bound_public_reddit_posts = 35
coverage = PUBLIC_SEARCH_SNAPSHOT_NOT_EXHAUSTIVE_CENSUS
```

The Sept. 16 public-profile observation is **not** another 25 source-bound posts. It records an observed first page with 25 cards, of which 14 exposed text excerpts and 11 were media-only or unhydrated. The original capture persisted aggregate counts but zero per-card records.

That historical defect is preserved in:

`04-RECEIPTS/2026-09-16-public-profile-card-loss-ledger-v01.json`

State:

`ARCHIVAL_DEBT_EXPLICIT_PER_CARD_PAYLOAD_NOT_PERSISTED`

Do not collapse this into either “25 admitted posts” or “nothing was observed.”

```text
OBSERVED_CARD_COUNT != PERSISTED_PER_CARD_RECORD_SET
MISSING_PER_CARD_RECORD != CARD_DID_NOT_EXIST
```

## Read-only query entry

```bash
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-query.mjs summary
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-query.mjs search "provenance repair" --mode lexical
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-query.mjs search "failure reconstruction" --mode semantic
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-query.mjs recent --sources
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-query.mjs resolve reddit:t3_1wfmmo7
```

Human-facing aliases `PAUL`, `Upset-Ratio502`, and `Wendbine` are retrieval conveniences only.

```text
DISPLAY_ALIAS != PERSON_IDENTITY != OPERATOR_IDENTITY != AUTHORITY
QUERY_MATCH != SOURCE_PROMOTION
SEMANTIC_MATCH != CAUSAL_RELATION
RECENCY != AUTHORITY
HELD_RECORD_RETRIEVABLE != HELD_RECORD_PROMOTED
```

## Capture reconciliation

For every future bounded public listing:

```text
observed_card_count
=
persisted_per_card_observations
+ explicitly_receipted_capture_failures
```

Any unexplained remainder is `FAILED_CAPTURE_RECONCILIATION`.

A media-only, partial, unhydrated, or HELD card still receives a durable observation record at the evidence class actually observed. Persistence is never permission to promote semantics.

## Most recent persisted public-account observation (2026-09-22)

Account scope: `u/Upset-Ratio502` cards displayed on cached public `r/Wendbine/new` listing.

```text
prior_fully_hydrated_public_source_count = 35
new_card_level_source_observations = 25
per_card_records_persisted = 25
media_only_cards_persisted = 2
unexplained_capture_remainder = 0
public_post_detail = CACHE_MISS
public_post_publication_time = UNBOUND
cached_listing_exhaustive_current_census = false
youtube_or_suno_video_attribution = HELD_NO_VERIFIED_CROSS_LINK
```

Read `01-MANIFESTS/public-reddit-account-card-source-registry-20260922-v05.jsonl` FIRST when asked for current Paul-account posts. Its 25 individual records resolve by source ID and search terms; preserve their `date_basis=RETRIEVAL_DAY` and unbound publication dates. Read `01-MANIFESTS/public-reddit-account-card-sync-20260922-v05.json` and `04-RECEIPTS/2026-09-22-public-account-card-capture-reconciliation-v05.json` for bounded coverage and capture law. The Sept. 16 loss ledger remains independently unresolved; this later page may not be substituted for the earlier 25 unknown objects.

The separately queryable Suno/YouTube discovery receipt is `04-RECEIPTS/2026-09-22-linked-audiovisual-discovery-v01.json`. Admit audiovisual works only after a public account-to-video/channel witness. User-recalled bot dialogue is a search target, not verbatim transcript.

```text
CARD_URL_BOUND != FULL_POST_DETAIL_FETCHED
OBSERVATION_DATE != PUBLICATION_DATE
ACCOUNT_CARD != ACCOUNT_CENSUS
MEDIA_MOTIF != VIDEO_OWNERSHIP
```

## Public archive acquisition alternative — September 22

A source-ID-first fallback is implemented in `99-ADMIN/wendbine-archive-provider-probe.mjs`: query the **33 known P0 Reddit IDs** through Arctic Shift (`/api/posts/ids?ids=...`) and PullPush (`/reddit/search/submission/?ids=...`). Return explicit per-ID source binding, archive retrieval metadata, content digests and disagreement, without reporting full third-party text in public GitHub or terminal summaries. `99-ADMIN/wendbine-private-archive-audit.mjs` validates privately captured raw provider replies before original-text query; differing source versions remain distinct.

**Historical pre-recovery observation (superseded by v06 above):** the chat's direct API could not reach the hosts, but GitHub Actions independently retrieved and privately captured 33/33 via Arctic Shift. The earlier 0/33 figure described the state before run #4179; consult v06 for current custody.

See `06-INSTRUMENTS/WENDBINE_VERBATIM_ORIGINALS_ACQUISITION_V0_1.md` for documented endpoints, private acquisition command and exact claim ceilings.

## Foundational primary-source rescue · P0

### Executable original-text rescue, not another empty-ledger pass

P0 acquisition now has three runnable, isolated instruments: `99-ADMIN/wendbine-reddit-oauth-rescue.mjs` (approved, throttled Reddit OAuth post-by-post acquisition of **all 33** source IDs, raw JSON and exact field hashes outside Git); `99-ADMIN/wendbine-chat-export-rescue.mjs` (local-only extraction of the **three previously user-pasted September 10 source-message candidates**, no unrelated chat export); and `99-ADMIN/wendbine-private-originals-query.mjs` (word search of genuinely acquired private original text rather than paraphrases). Full instructions and rights/access requirements: `06-INSTRUMENTS/WENDBINE_VERBATIM_ORIGINALS_ACQUISITION_V0_1.md`.

**Historical pre-recovery constraint (superseded):** chat-side public search and missing Reddit OAuth could not provide complete bodies. GitHub Actions archive acquisition has since recovered 33/33 exact archived source fields, with raw and field hashes in v06. The official Reddit OAuth route remains separately unexecuted.

`SOURCE_FETCHER_READY != SOURCE_FETCH_SUCCEEDED` · `PRIOR_CHAT_MESSAGE_RECOVERED != ORIGINAL_BODY_SPAN_VERIFIED` · `PRIVATE_ORIGINAL_QUERY != PUBLIC_SUMMARY_QUERY`.



The **September 10–11 original 33 posts (21 + 12)** are the first-priority recovery cohort, explicitly ahead of the September 13 additions and September 22 card-level observations. Every source has its own immutable URL and exact-originals status in `01-MANIFESTS/foundational-sept10-11-originals-rescue-v01.json`.

**Historical discovery stage (superseded):** public search first exposed five partial posts; the later GitHub runner recovered 33/33 complete archived title/body fields. The first-publication version and live Reddit state remain unverified.

Recover and validate P0 first. Only after adequate original-title/body custody and source-version review may the provisional topical derivatives be used for a source-led SRC-style hole-dive or proposed TD613 terminology crosswalk. Keep hypothetical system-boundary explanations distinct from evidence of a specific platform implementation.

```text
P0_FOUNDATIONAL_SOURCE != LATER_DERIVATIVE
INDEX_DISCOVERY != EXACT_ORIGINAL_CUSTODY
POST_CONTENT != PROOF_OF_HIDDEN_PLATFORM_PROCESS
```

## Full-text original custody: explicit gap (September 22)

Additional exact-text recovery leads are cataloged in `04-RECEIPTS/2026-09-22-prior-chat-originals-recovery-leads-v01.json`: two September 16 user-pasted complete “MAD SCIENTISTS IN A BUBBLE” transcriptions (Reddit-context and separate Facebook-linked context). Their exact message bytes and canonical cross-platform source IDs remain unavailable in this session. Do not substitute a title match for source identity or fabricate a transcription from memory.



**Historical initial gap: 0/60. Historical P0 intermediate recovery: 33/60. Current v06/v07 acquisition: 60/60 post title/self-text fields, including 58 nonempty bodies and two source-verified empty media/link self-text fields.** The full-text gap is enumerated individually in `04-RECEIPTS/2026-09-22-verbatim-originals-gap-ledger-v01.json`. A search-indexed example does not constitute exact original custody, and sampled direct Reddit permalink fetches were cache-missing.

`06-INSTRUMENTS/WENDBINE_VERBATIM_ORIGINALS_ACQUISITION_V0_1.md` describes authorized recapture. `99-ADMIN/wendbine-originals-intake.mjs` validates author-supplied or otherwise authorized original fields, preserves their exact decoded text/whitespace in a **private location outside GitHub**, hashes titles and self-text independently, refuses duplicate or mismatched source IDs, and reports partial coverage transparently. The public repository stores only a source audit and non-infringing metadata pending source rights.

`INDEXED_PARAPHRASE != VERBATIM_ORIGINAL` · `FULL_TEXT_CUSTODY != FULL_MEDIA_CUSTODY` · `PRIVATE_RESEARCH_COPY != PUBLIC_REPUBLICATION_PERMISSION`.

Source-text acquisition is complete for these 60 source IDs; source-led reconstruction and TD613 terminology transfer remain separate scientific reviews; prior topology maps are explicitly provisional derivatives.

## Required non-collapse

```text
G_D != G_A != G_F != G_I != G_T != G_P != G_R != G_O != G_X
G_COOCCURRENCE != CAUSAL_GRAPH
PUBLIC_POST != AUTHOR_INTENT
PERSISTED_OBSERVATION != SOURCE_PROMOTION
HELD != ERASED
UNHYDRATED != UNOBSERVED
```

Research-only. Human closure remains required. No merge, deployment, identity adjudication, private-corpus intake, or scientific-promotion authority follows from this entry.

Marked ⟐
