# Wendbine Public Relational Continuity Atelier

> **Independent public-surface research fixture.** Wendbine materials remain the work of their stated public poster(s). TD613 and TD613-TCP claim no authorship, ownership, origin, derivation, affiliation, endorsement, or authority over the source posts.

This Atelier is modeled after the **SRC operational research atelier** and the **EMSTD613 Lineage Atelier**, but it is neither a copy of their research question nor a donor-import lane.

Its core research question remains:

> Can a relational architecture be reconstructed from a bounded stream of serialized public outputs without treating semantic resemblance as private state, motive, hidden memory, lineage, or authority?

Operationally, Wendbine now carries the SRC lesson all the way through: **capture, custody, deterministic compilation, and deterministic retrieval are separate but equally required surfaces.**

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

## Foundational primary-source rescue · P0

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
