# Manifests

`candidate-corpus.jsonl` is the working catalog. It is generated from public Zenodo metadata and contains one JSON object per source record.

`zenodo-pages/` contains unmodified API-response snapshots used to reproduce the catalog. `integrity-ledger.jsonl` is written only after an original has been retrieved and hashed locally.

The candidate corpus is not an assertion by this vault that every item is canonical. It is the broad, author-linked discovery set awaiting cross-platform reconciliation.

See `CATALOG_METHOD.md` for the cross-platform unit model and current census. Platform-specific pointer catalogs live in `platforms/`; conservative exact-title clusters and the retitle/platform-only review queue live in `crosswalk/`.
`SCHEMA.md` defines the work → edition → manifestation → capture model. Machine-checkable contracts live in `schemas/`. DOI links and public download pointers are evidence layers; neither is a completed local acquisition.

Nothing in a filename containing `platform-only` is a final exclusivity finding. It means only that no sufficiently strong title-level match has yet been established.
