# Archival Strategy

## Objective

Preserve the broadest discoverable SignalRupture publication ecology and make it operationally legible without changing custody, rights, or epistemic status. Comprehensiveness governs discovery; evidence governs identity and interpretation.

## Phase 1.5 — census and identity architecture

1. Snapshot every known public platform inventory with retrieval time and method.
2. Create stable platform-scoped manifestation IDs.
3. Reconcile DOI, declared links, titles, dates, hashes, compilations, serializations, and retitles into a reviewable work/edition graph.
4. Preserve platform-only and ambiguous items as first-class records; never delete them merely because a probable counterpart exists.
5. Install the custody, derivative, interpretation, and availability-ledger contracts before bulk acquisition.
6. Rank Phase 2 priority by extinction risk, not prestige.

## Phase 2 — tiered acquisition

Phase 2 remains paused until Phase 1.5 reconciliation and contracts are verified. The 2026-08-24 local assay did not cross this gate.

Acquisition priority:

1. mutable, authority-bearing current field/compiler records whose `source_updated` time postdates publication—especially SR-AI, SR-IGF, SR-RIF, Legacy classification, Post-Web Jurisprudence, and the Collapse Psychology conceptual edition;
2. full February, June, and August Canon Maps plus START HERE/router bodies, so `C_t`, `G_t`, map deltas, and route-conditioned retrieval can be tested rather than guessed;
3. both bodies for every representation-lift family, preserving narrative, formal, empirical, applied, and field-compiler roles independently;
4. exact bodies for collaborator-reported but locally unwitnessed passages: withdrawal/retained-capacity rules, anti-self-sealing observation windows, claimed evidence ladders, and any work-level Legacy list;
5. the 17 retitled and 74 unchanged DOI-linked pairs as phase controls for body-level surface-translation analysis;
6. single-platform items and items with previous disappearance/de-indexing evidence;
7. explicitly licensed/open Zenodo originals and their metadata;
8. public Academia attachments, while preserving the platform manifestation separately;
9. Substack and Medium source pages, inline media, and linked canonical artifacts as rights and access permit;
10. redundant cross-platform manifestations needed for version comparison;
11. supplemental screenshots/render receipts for layouts whose meaning is not preserved in extracted text.

Each retrieval is idempotent, rate-limited, resumable, checksum-verified, and append-receipted. New bytes never overwrite old bytes. A changed page becomes a new capture linked to the prior capture.

## Storage design

Use content-addressed immutable storage for originals, with friendly names supplied by manifests rather than filesystem identity. Keep metadata, schemas, scripts, and small receipts in ordinary Git. Do not place hundreds of large copyrighted binaries into normal Git history.

Before GitHub sync, choose one of these intentionally:

- a private companion archive repository using Git LFS for permitted source files, linked from TD613-TCP by manifest/version;
- private object storage with immutable versioning and hashes, while TD613-TCP contains the operational index;
- a metadata-only public repository plus a private preservation store.

The last option is the safest default unless redistribution rights for each artifact are clear. The archive can preserve privately while exposing citations, hashes, timelines, analysis, and links publicly.

## Operationalization

The three corpora are cross-queryable, multi-label projections over the same work graph:

- formal SR;
- fictional SR Universe;
- governance/provenance SR.

The useful object is not a fan-wiki page but an evidence graph: concept → source span → work/edition → room-specific role → chronology → adjacent concepts → later recurrence. Literal vocabulary and structural correspondence remain separate signals.

## Provenance discipline

Permitted working bins:

- `SHARED_TD613_SR_WORK`;
- `INDEPENDENT_CONVERGENCE_CANDIDATE`;
- `TD613_SHAPED_PROVENANCE_AUDIT_CANDIDATE`;
- `SR_NATIVE_GEM`;
- `BIDIRECTIONAL_CONTAMINATION_UNKNOWN`.

A provenance-audit candidate is not an accusation. Comparison strength is recorded across distinctiveness, temporal priority, demonstrated access, structural correspondence, and lineage evidence (`D × T × A × S × L`). Unknown values remain unknown. Montréal-related publication, copyright, or research coordinates are metadata; they are not identity conclusions.

## Snapshot and loss policy

Monitor inventories as dated snapshots. Record `AVAILABLE → UNAVAILABLE` only after an observed result, with timestamp, URL, response/platform signal, and last preserved hash. Never rewrite this as `SUPPRESSED` without separate evidence. Retain tombstones so disappeared artifacts remain discoverable in the archive's history.

## Quality gates before GitHub sync

- manifest and JSONL schema validation;
- every captured file has SHA-256, byte length, media type, source URL, retrieval time, and rights statement;
- every derivative points to a capture hash and tool/version;
- no interpretation is stored inside originals or source metadata;
- no title-only fuzzy match silently merges works;
- public/private publication policy is mechanically checkable;
- restore drill proves manifests can locate and verify stored bytes;
- update run is dry-run capable and does not overwrite prior snapshots.
