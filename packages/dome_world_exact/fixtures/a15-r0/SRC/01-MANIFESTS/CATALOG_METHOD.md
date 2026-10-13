# Catalog Method

## Unit distinctions

The vault never treats these as interchangeable:

- **platform artifact** — one published record, upload, post, story, or version on one platform;
- **source file** — a downloadable binary attached to a platform artifact;
- **title cluster** — records joined by conservative title normalization;
- **work** — an intellectual object established by DOI, content, version, lineage, or human adjudication;
- **edition/version** — a materially identifiable state of a work;
- **manifestation** — one platform's presentation of a work or edition;
- **capture** — bytes retrieved from a manifestation at a recorded time;
- **corpus room** — one or more analytical roles assigned to a work;
- **seam artifact** — material whose useful content crosses corpus rooms.

## Public census snapshot

Snapshot date: 2026-08-23 (America/New_York)

- Zenodo: 442 public author-linked records.
- Academia.edu: 499 rendered public records: 469 uploaded items with public download links and 30 metadata-only pages explicitly marked not uploaded by Academia.
- Substack: 257 public archive posts.
- Medium: 210 rendered public stories.
- Total platform artifacts: 1,408.
- Exact normalized-title clusters: 691.
- Exact-title clusters visible on only one platform: 255.
- Of those 255, a conservative title-similarity pass flags 118 as possible retitles or related editions.

The current provisional distinct-work band is therefore approximately 573–691, but it is **not a final count**. Content fingerprints, DOI extraction, compilation/version relationships, and human review may narrow it further or split composite works.

## Matching authority

Match strength, from strongest to weakest:

1. same DOI/version relationship;
2. same cryptographic content hash;
3. explicit cross-platform source link or author-declared edition relationship;
4. high-confidence full-title match;
5. conservative fuzzy-title candidate;
6. thematic similarity only.

Only levels 1–4 may automatically establish a shared work identity. Level 5 enters review. Level 6 never merges works.
A shared DOI relates manifestations but does not erase platform-specific text, dates, framing, or attachments. A shared title is never proof that the bytes are identical.

## Two clocks

Every record preserves `published_at` for source chronology and `retrieved_at` / `imported_at` for archive custody chronology. Git commit time is never substituted for publication time.

## Platform files

- `candidate-corpus.jsonl` — Zenodo source-of-truth metadata.
- `platforms/academia.jsonl` — 499 public Academia record pointers.
- `platforms/substack.jsonl` — 257 public Substack post pointers.
- `platforms/medium.jsonl` — 210 public Medium story pointers.
- `platforms/substack-doi-links.jsonl` — 91 Substack posts with observed DOI links.
- `platforms/academia-download-pointers.jsonl` — 499 Academia records: 469 observed public download pointers and 30 public metadata pages whose detail pages explicitly state that the paper was not uploaded.
- `crosswalk/exact-title-crosswalk.jsonl` — conservative exact normalized-title clusters.
- `crosswalk/fuzzy-and-platform-only-review.jsonl` — review queue, not a conclusion ledger.
- `crosswalk/doi-links.jsonl` — 91 observed Substack-to-Zenodo DOI relationships; all resolved in this snapshot.

## Known limitations

Platform counts are a dated public snapshot. Platforms can add, remove, reorder, or conceal items. The Academia and Medium counts were obtained by expanding their rendered public profiles to a stable endpoint. OpenAlex currently reports fewer works and is treated as a lagging discovery aid, not the corpus authority.
