# Wendbine Public Relational Continuity Atelier

> **Independent public-surface research fixture.** Wendbine materials remain the work of their stated public poster(s). TD613 and TD613-TCP claim no authorship, ownership, origin, derivation, affiliation, endorsement, or authority over the source posts.

This Atelier is modeled after the **SRC operational research atelier** and the **EMSTD613 Lineage Atelier**, but it is neither a copy of their research question nor a donor-import lane.

Its core research question remains:

> Can a relational architecture be reconstructed from a bounded stream of serialized public outputs without treating semantic resemblance as private state, motive, hidden memory, lineage, or authority?

Operationally, Wendbine now carries the SRC lesson all the way through: **capture, custody, deterministic compilation, and deterministic retrieval are separate but equally required surfaces.**

## PRIMARY-SOURCE ACQUISITION — CURRENT 60/60

**All 60 individually indexed Reddit source objects have been recovered from Arctic Shift, privately restored, and checked against the actual raw archive responses and exact title/self-text hashes.** The original September 10–11 P0 cohort contributes 33 nonempty text bodies; the September 13 pair contributes two; the later 25 cards contribute 23 nonempty text bodies and **two verified empty-self-text media/link posts**. Thus the **private word-search corpus has 58 text bodies and two media/link source records**. The media files themselves remain separately unacquired. No full third-party source bodies are committed to public GitHub.

- P0 public source/hash witness: `01-MANIFESTS/p0-archived-source-field-receipts-20260922-v06.json` (GitHub run #4189; 33/33; raw SHA-256 `9657dd03c00a2285a4496b7f42a18075835d8e55110a0513ebd4af0e8f211a2c`).
- P1/P2 public source/hash witness: `01-MANIFESTS/p1p2-archived-source-field-receipts-20260922-v07.json` (GitHub run #4212; 27/27; raw SHA-256 `819a3610fe4846f79489ca084793e7d7322658f0cdf3be2af62e99e5f34c1b85`).
- Exact archived Reddit titles: `Wendbine` in 59 source objects and `Wensbine` in one; the old technical headers remain expressly editorial descriptors.
- In the private research runtime, raw P0 and P1/P2 responses and verified title/body fields are joined in a **60-source SQLite FTS5 index**. The public `wendbine-query.mjs` still searches bounded derivatives, not full original bodies.
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

## Official status

This branch contains the first repository-resident Wendbine Atelier and remains **Draft / open / unmerged**.

Research-only. No merge, deployment, identity adjudication, private-corpus intake, or scientific promotion authority follows from the fixture.

## Source lineage

### Base snapshot

```text
snapshot_id = wendbine-public-reddit-48h-20260911T092700Z-v01
requested window = 2026-09-09T09:27:00Z .. 2026-09-11T09:27:00Z
surface = public Reddit only
community = r/Wendbine
source-bound public posts = 33
full Reddit bodies copied = false
private Google-group material admitted = false
coverage = PUBLIC_SEARCH_SNAPSHOT_NOT_EXHAUSTIVE_CENSUS
```

### Append-only Sept. 13 delta

```text
snapshot_id = wendbine-public-reddit-delta-20260913T234421Z-v02
additional source-bound public posts = 2
hydrated source-bound public Reddit corpus = 35
```

The two Sept. 13 source-bound additions are:

- `reddit:t3_1wfliaj` — Failure-Driven Comparative Engineering Discipline
- `reddit:t3_1wfmmo7` — Builder Discipline — Correlation, Provenance, and Repair Paths

Source registries store canonical URLs, publication precision actually exposed, technical headers, bounded normalized summaries, concept tags, and typed source observations. They do **not** mirror full Reddit post bodies.

## September 16 public-profile observation and capture scar

A later public-profile synchronization observed a bounded first page containing:

```text
observed cards = 25
text-excerpt cards = 14
media-only or unhydrated cards = 11
next-page link observed = true
next-page retrieval = CACHE_MISS_NOT_SYNCED
```

The original Sept. 16 capture persisted the aggregate snapshot but **zero per-card records**. Git archaeology identifies the creating commit as `05f674ec811350e477f011731ff662da2bf57cd2`; the loss occurred at capture rather than through later deletion.

The defect is now preserved as explicit, queryable archival debt:

`04-RECEIPTS/2026-09-16-public-profile-card-loss-ledger-v01.json`

```text
state = ARCHIVAL_DEBT_EXPLICIT_PER_CARD_PAYLOAD_NOT_PERSISTED
observed cards = 25
persisted per-card records = 0
explicit capture debt = 25
```

A later recovery pass may append source-bound historical records only when an independent public surface exposes sufficient canonical binding. The archive may never invent the lost card IDs, ordering, or individual text/media assignments.

```text
OBSERVED_CARD_COUNT != PERSISTED_PER_CARD_RECORD_SET
AGGREGATE_OBSERVATION != INDIVIDUAL_SOURCE_IDENTITY
RECOVERY_ATTEMPT != RECOVERY_SUCCESS
MISSING_PER_CARD_RECORD != CARD_DID_NOT_EXIST
```

## Architecture

```text
WENDBINE/
├── 01-MANIFESTS
├── 02-ORIGINALS/public-reddit
├── 03-DERIVATIVES
├── 04-RECEIPTS
├── 05-OPERATIONS
├── 06-INSTRUMENTS
├── 07-ARCHIVE-LEDGER
├── 08-EXTERNAL-CORPORA
└── 99-ADMIN
```

SRC contributes the non-collapse wall, typed route discipline, deterministic query/compiler posture, and source/evidence separation.

EMSTD613 contributes provenance-preserving intake, source/work distinction, explicit human-provenance state, comparison without lineage collapse, and red-team disconfirmation posture.

Wendbine adds a **serialized-public-topology** problem: the same bounded corpus may contain explicit dependencies, continuity references, corrections, programmatic sequencing, recurring concepts, and source-declared synthesis.

## Read-only query surface

The Atelier must be searchable without requiring a future operator to know a filename, source ID, or exact title in advance.

```bash
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-query.mjs summary
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-query.mjs search "repair path provenance" --mode lexical
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-query.mjs search "failure reconstruction" --mode semantic
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-query.mjs recent --sources
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-query.mjs resolve reddit:t3_1wfmmo7
```

The query surface indexes persisted Atelier material across manifests, derivatives, receipts, operations, instruments, archive ledger, external corpora, and root declarations.

Lexical mode supports ordinary word and normalized phrase retrieval. Semantic mode is deterministic **concept-relational retrieval** over declared concepts, source-explicit relations, technical headers, bounded summaries, and the remaining persisted record text. It is not an embedding oracle and carries no causal authority.

Human-facing aliases `PAUL`, `Upset-Ratio502`, and `Wendbine` are reversible retrieval conveniences for the public Reddit source records.

```text
QUERY_MATCH != SOURCE_PROMOTION
SEMANTIC_MATCH != CAUSAL_RELATION
RECENCY != AUTHORITY
DISPLAY_ALIAS != PERSON_IDENTITY != OPERATOR_IDENTITY != AUTHORITY
HELD_RECORD_RETRIEVABLE != HELD_RECORD_PROMOTED
```

See `06-INSTRUMENTS/WENDBINE_QUERY_RECIPES_V0_1.md`.

## Capture reconciliation contract

A synchronization is not complete merely because a page-level count was observed.

For each bounded public listing:

```text
observed_card_count
=
persisted_per_card_observations
+ explicitly_receipted_capture_failures
```

Any unexplained remainder fails as `FAILED_CAPTURE_RECONCILIATION`.

Every card gets a durable observation at the strongest evidence class actually available during the pass. Text-bound cards may carry bounded summaries; media-only or unhydrated cards remain semantically unpromoted but still persist as observations. A visible but unsuccessfully hydrated card may never disappear simply because relation promotion cannot proceed.

```text
PERSISTED_OBSERVATION != SOURCE_PROMOTION
HELD != ERASED
UNHYDRATED != UNOBSERVED
```

See:

- `06-INSTRUMENTS/WENDBINE_SYNC_CAPTURE_CONTRACT_V0_1.md`
- `99-ADMIN/wendbine-capture-contract.mjs`
- `tests/wendbine-capture-reconciliation.test.mjs`

The Sept. 16 loss ledger is the permanent hostile fixture for this rule.

## Core membranes

```text
PUBLIC_POST != AUTHOR_INTENT
PUBLIC_POST_TOPOLOGY != PRIVATE_STATE
SERIALIZED_CONTINUITY != SHARED_HIDDEN_MEMORY
EXPLICIT_CROSS_REFERENCE != MODEL_INFERRED_EDGE
SEMANTIC_RESEMBLANCE != STATE_PERSISTENCE
STATE_PERSISTENCE != EXTERNAL_ORCHESTRATION
SAME_TOKEN != SAME_OPERATOR
CONVENTIONAL_DOMAIN_LANGUAGE != WENDBINE_PROVENANCE
TD613_COMPARABLE != TD613_DERIVED
SOURCE_ASSERTION != ARCHIVE_OBSERVATION != ATELIER_INFERENCE
```

The user-supplied handle binding `u/Upset-Ratio502` is stored as `HUMAN_PROVENANCE`; this Atelier does not adjudicate the poster's civil/legal identity, and no such adjudication is necessary to compile or query the public architecture.

## Typed topology

The compiler keeps relation families distinct:

```text
G_D = dependency topology
G_A = authority / permission / trust
G_F = information and metadata flow
G_I = identity / continuity / entity alignment
G_T = temporal / program / version relations
G_P = provenance / custody / ancestry
G_R = reconstruction / estimation / recovery
G_O = observation boundary / observability
G_X = cross-relation interaction or source-declared synthesis
```

Therefore:

```text
G_D != G_A != G_F != G_I != G_T != G_P != G_R != G_O != G_X
```

`G_COOCCURRENCE` is generated separately and carries no causal meaning.

## Compiled result

The admitted public record contains source-bound dependencies and corrections rather than merely a bag of repeated vocabulary. The base and append-only delta include an explicit security-layer base, authorization/trust corridor, third-party dependency program, source-declared synthesis, observability and state-estimation material, provenance and recovery relations, operational-digital-twin boundaries, EchoCore correction, and a later failure/repair discipline.

That supports a bounded archive observation of **serialized public architectural continuity**. It does not establish hidden state continuity, private shared memory, author motive, real-person identity, cross-actor orchestration, or any institutional/TD613 relationship.

## Compiler

```bash
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-compile.mjs
```

The compiler consumes normalized public-source manifests and typed relation registries. It emits deterministic topology containing source nodes, concept nodes, typed source-bound relations, recurrent concepts, and a non-causal co-occurrence overlay.

See:

- `06-INSTRUMENTS/WENDBINE_PUBLIC_CORPUS_COMPILER_V0_1.md`
- `06-INSTRUMENTS/HELD_OUT_RECONSTRUCTION_PROTOCOL_V0_1.md`

## Executable regression surfaces

- `tests/wendbine-public-atelier-compiler.test.mjs`
- `tests/wendbine-sticker-nomenclature.test.mjs`
- `tests/wendbine-public-refresh-v04.test.mjs`
- `tests/wendbine-query-surface.test.mjs`
- `tests/wendbine-capture-reconciliation.test.mjs`
- `tests/wendbine-entry-contract.test.mjs`
- `tests/wendbine-account-card-sync-v05.test.mjs`

These are imported by `tests/ash-a15-r0-review-hardening.test.mjs` into consolidated validation.

## September 22 account-card sync — individually queryable

The current cached public `r/Wendbine/new` listing yielded **25 distinct post cards** displaying `u/Upset-Ratio502`. Every visible card URL now has its own JSONL observation; two media-only cards remain indexed without invented content. Individual post pages were cache-missing, so these are card-level observations, with publication day/time and full post detail unbound. The cached listing does not establish an exhaustive current account census.

- `01-MANIFESTS/public-reddit-account-card-source-registry-20260922-v05.jsonl` — all 25 records.
- `01-MANIFESTS/public-reddit-account-card-sync-20260922-v05.json` — coverage and limits.
- `04-RECEIPTS/2026-09-22-public-account-card-capture-reconciliation-v05.json` — 25 observed, 25 persisted, zero unexplained.
- `04-RECEIPTS/2026-09-22-linked-audiovisual-discovery-v01.json` — separate Suno/YouTube lane, presently HELD pending account-to-channel/video binding.

The **35 older fully hydrated sources** remain a separate evidence class. This pass does not retroactively reconstruct the 25 missing Sept. 16 card identities. Read-only query results expose `date_basis`: `RETRIEVAL_DAY` for these new card observations, never an invented `PUBLICATION_DAY`.

```text
CARD_LEVEL_SOURCE_OBSERVATION != FULL_POST_HYDRATION
RETRIEVAL_DAY != PUBLICATION_DAY
MEDIA_THEME_RESEMBLANCE != VERIFIED_YOUTUBE_ATTRIBUTION
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

## Authority

```text
research_only = true
donor_import = false
private_group_intake = false
author_intent_adjudication = false
real_person_identity_adjudication = false
TD613_scientific_promotion = false
merge_authority = false
deployment_authority = false
human_closure_required = true
```

Marked ⟐
