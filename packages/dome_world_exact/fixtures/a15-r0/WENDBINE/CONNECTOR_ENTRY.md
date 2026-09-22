# Wendbine Atelier connector entry

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

This fallback is **implemented and synthetic-tested, not a verified live 33-post recovery**: this chat's direct API requests could not reach the hosts. The primary-source custody number remains 0/33 for September 10–11 until an authorized private capture succeeds and produces a verifiable receipt. Provider availability, text completeness, source version and current Reddit removal status remain separate questions.

See `06-INSTRUMENTS/WENDBINE_VERBATIM_ORIGINALS_ACQUISITION_V0_1.md` for documented endpoints, private acquisition command and exact claim ceilings.

## Foundational primary-source rescue · P0

### Executable original-text rescue, not another empty-ledger pass

P0 acquisition now has three runnable, isolated instruments: `99-ADMIN/wendbine-reddit-oauth-rescue.mjs` (approved, throttled Reddit OAuth post-by-post acquisition of **all 33** source IDs, raw JSON and exact field hashes outside Git); `99-ADMIN/wendbine-chat-export-rescue.mjs` (local-only extraction of the **three previously user-pasted September 10 source-message candidates**, no unrelated chat export); and `99-ADMIN/wendbine-private-originals-query.mjs` (word search of genuinely acquired private original text rather than paraphrases). Full instructions and rights/access requirements: `06-INSTRUMENTS/WENDBINE_VERBATIM_ORIGINALS_ACQUISITION_V0_1.md`.

The public search index can reveal substantial passages but cannot certify complete original title/body bytes. The current environment lacks approved Reddit API credentials and direct container networking; execution therefore remains **SOURCE_ACQUISITION_NOT_EXECUTED_WITH_LIVE_AUTHORITY**, P0 exact-originals status **0/33**, until actual private capture receipts exist. A green implementation/test gate must not be mistaken for a successful 33-post acquisition.

`SOURCE_FETCHER_READY != SOURCE_FETCH_SUCCEEDED` · `PRIOR_CHAT_MESSAGE_RECOVERED != ORIGINAL_BODY_SPAN_VERIFIED` · `PRIVATE_ORIGINAL_QUERY != PUBLIC_SUMMARY_QUERY`.



The **September 10–11 original 33 posts (21 + 12)** are the first-priority recovery cohort, explicitly ahead of the September 13 additions and September 22 card-level observations. Every source has its own immutable URL and exact-originals status in `01-MANIFESTS/foundational-sept10-11-originals-rescue-v01.json`.

A fresh source search independently exposed at least partial original text for five of those 33, including the Phone Security glossary, the third-party-dependency program, dependency-induced observability loss, state-estimation error, and topology drift. **Search-visible text is a discovery witness, not a complete or byte-verified original.** Full title/body custody for P0 remains **0/33**; no original is fabricated or promoted from its archive descriptor.

Recover and validate P0 first. Only after adequate original-title/body custody and source-version review may the provisional topical derivatives be used for a source-led SRC-style hole-dive or proposed TD613 terminology crosswalk. Keep hypothetical system-boundary explanations distinct from evidence of a specific platform implementation.

```text
P0_FOUNDATIONAL_SOURCE != LATER_DERIVATIVE
INDEX_DISCOVERY != EXACT_ORIGINAL_CUSTODY
POST_CONTENT != PROOF_OF_HIDDEN_PLATFORM_PROCESS
```

## Full-text original custody: explicit gap (September 22)

Additional exact-text recovery leads are cataloged in `04-RECEIPTS/2026-09-22-prior-chat-originals-recovery-leads-v01.json`: two September 16 user-pasted complete “MAD SCIENTISTS IN A BUBBLE” transcriptions (Reddit-context and separate Facebook-linked context). Their exact message bytes and canonical cross-platform source IDs remain unavailable in this session. Do not substitute a title match for source identity or fabricate a transcription from memory.



**The existing 60 source IDs are searchable derivatives or card observations, not 60 word-for-word originals.** Source title/body pairs currently verified and stored: **0/60**. The full-text gap is enumerated individually in `04-RECEIPTS/2026-09-22-verbatim-originals-gap-ledger-v01.json`. A search-indexed example does not constitute exact original custody, and sampled direct Reddit permalink fetches were cache-missing.

`06-INSTRUMENTS/WENDBINE_VERBATIM_ORIGINALS_ACQUISITION_V0_1.md` describes authorized recapture. `99-ADMIN/wendbine-originals-intake.mjs` validates author-supplied or otherwise authorized original fields, preserves their exact decoded text/whitespace in a **private location outside GitHub**, hashes titles and self-text independently, refuses duplicate or mismatched source IDs, and reports partial coverage transparently. The public repository stores only a source audit and non-infringing metadata pending source rights.

`INDEXED_PARAPHRASE != VERBATIM_ORIGINAL` · `FULL_TEXT_CUSTODY != FULL_MEDIA_CUSTODY` · `PRIVATE_RESEARCH_COPY != PUBLIC_REPUBLICATION_PERMISSION`.

The SRC-style deep topological reconstruction and TD613 vocabulary transfer remain HELD pending adequate source-text acquisition; prior topology maps are explicitly provisional derivatives.

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
