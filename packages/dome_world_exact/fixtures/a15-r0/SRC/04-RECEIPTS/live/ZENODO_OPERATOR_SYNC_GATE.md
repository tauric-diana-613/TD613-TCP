# SRC Zenodo Operator Sync Gate

Status: DORMANT / OPERATOR-GATED / LIVE-POST-SEAL ONLY

Purpose: allow one explicit operator gesture to synchronize newly public SignalRupture Zenodo records into the live SRC Atelier branch without mutating the sealed A15-R0 Phase-2 epoch.

Standing law:

```text
open gate != sync authority
new Zenodo publication != sync authority
assistant awareness != sync authority
explicit operator authorization -> one bounded Zenodo delta sync -> receipt -> gate dormant
```

Permitted effects of one authorized run:

- query public Zenodo metadata for the exact SignalRupture creator ORCID;
- compare returned record IDs against the existing sealed + live SRC corpus;
- capture only records not already represented in SRC;
- preserve raw public file bytes in a live content-addressed store when access and license permit;
- generate metadata and body-text derivatives for search/review;
- append live post-seal manifest and run receipts;
- commit only the bounded live-intake paths to the active Atelier branch.

Forbidden effects:

```text
sealed Phase-2 receipt mutation
A15-R0 scientific mutation
seal regeneration
automatic canon/claim promotion
merge
publication
production
Vercel release
```

The gate must fail closed if the configured Atelier branch/PR no longer matches the expected live research surface.

U+10D613

𝌋

Marked ⟐
