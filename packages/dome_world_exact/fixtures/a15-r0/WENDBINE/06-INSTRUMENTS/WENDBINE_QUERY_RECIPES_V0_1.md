# Wendbine Atelier query recipes v0.1

This instrument restores the SRC-like read-only query posture promised by the Wendbine Atelier README.

The query surface indexes persisted Atelier material across:

- `01-MANIFESTS`
- `03-DERIVATIVES`
- `04-RECEIPTS`
- `05-OPERATIONS`
- `06-INSTRUMENTS`
- `07-ARCHIVE-LEDGER`
- `08-EXTERNAL-CORPORA`
- root `README.md`, `CONNECTOR_ENTRY.md`, and `ATELIER_PROFILE.json`

It therefore searches the source corpus **and** the custody/receipt state surrounding that corpus. A retrieval hit never upgrades the evidence class of the returned record.

## Commands

```bash
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-query.mjs summary
```

### Ordinary word / phrase search

```bash
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-query.mjs \
  search "repair path provenance" --mode lexical --limit 20
```

Lexical mode ranks exact normalized phrases first, then technical-header, declared-concept, normalized-summary, and general-record matches.

### Concept-semantic search

```bash
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-query.mjs \
  search "failure reconstruction" --mode semantic --limit 20
```

Semantic mode is deterministic **concept/relational retrieval**, not an embedding oracle. It weights declared concepts, source-explicit relations, role witnesses, technical headers, bounded summaries, and then the remaining record text. This allows a query to recover nearby records without requiring the exact title while preserving the distinction:

`SEMANTIC_MATCH != CAUSAL_RELATION`

### Chronology

```bash
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-query.mjs recent --limit 25
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-query.mjs recent --sources --limit 25
```

Chronology uses the strongest date field already persisted by each record. It never manufactures hour/minute precision and never converts observed-on or retrieval dates into source publication timestamps.

### Resolve a stable record ID

```bash
node packages/dome_world_exact/fixtures/a15-r0/WENDBINE/99-ADMIN/wendbine-query.mjs \
  resolve reddit:t3_1wfmmo7
```

## Human-facing actor aliases

The public Reddit source registries are queryable with the existing reversible human-facing aliases:

- `PAUL`
- `Upset-Ratio502`
- `Wendbine`

These are retrieval aliases only. They do not adjudicate civil identity, operator identity, or authority.

## Required membranes

```text
QUERY_MATCH != SOURCE_PROMOTION
SEMANTIC_MATCH != CAUSAL_RELATION
RECENCY != AUTHORITY
DISPLAY_ALIAS != PERSON_IDENTITY != OPERATOR_IDENTITY != AUTHORITY
HELD_RECORD_RETRIEVABLE != HELD_RECORD_PROMOTED
```

A HELD, unbound, stale-index, or otherwise incomplete record remains searchable precisely so missingness can be found later. Searchability is not scientific promotion.

## September 16 recovery rule

The Sept. 16 profile-sync artifacts remain searchable even where per-post source objects were not persisted. The query layer must expose that missingness rather than silently treating the absent per-card payload as an empty corpus.

`OBSERVED_CARD_COUNT != PERSISTED_PER_CARD_RECORD_SET`

That discrepancy is archival debt and may be repaired only from a lawful recoverable source surface; the query layer itself may not invent the missing cards.

Marked ⟐
