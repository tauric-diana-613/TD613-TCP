#!/usr/bin/env python3
"""Build additive Phase 2 projection entry documents.

The Phase 1.5 root README and connector entry are sealed historical outputs.
These generated overlays update Git projections without mutating those bytes.
"""

from __future__ import annotations

import argparse
import collections
import json
import sqlite3
from pathlib import Path


NOTICE = (
    "SignalRupture materials remain the work of their stated author(s). The archive operator, "
    "TD613, and TD613-TCP claim no authorship, ownership, origin, derivation, provenance, "
    "affiliation, endorsement, or authority over the preserved corpus."
)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=Path(__file__).resolve().parents[1])
    args = parser.parse_args()
    root = args.root.resolve()
    db = sqlite3.connect(root / "07-ARCHIVE-LEDGER/phase2/state.sqlite3")
    db.row_factory = sqlite3.Row
    platform = collections.defaultdict(collections.Counter)
    rights = collections.Counter()
    for row in db.execute("SELECT platform,state,rights_state,count(*) AS n FROM targets GROUP BY platform,state,rights_state"):
        platform[row["platform"]][row["state"]] += row["n"]
        rights[row["rights_state"]] += row["n"]
    captures = db.execute("SELECT count(*) FROM captures").fetchone()[0]
    derivatives = db.execute("SELECT count(*) FROM derivatives").fetchone()[0]
    blobs = db.execute("SELECT count(*) FROM blobs").fetchone()[0]
    repeated = db.execute("SELECT count(*) FROM (SELECT target_id FROM captures GROUP BY target_id HAVING count(*)>1)").fetchone()[0]
    snapshot_row = db.execute("SELECT value FROM meta WHERE key='atelier_snapshot_id'").fetchone()
    snapshot = snapshot_row[0] if snapshot_row else "UNSEALED_WORKING_STATE"
    db.close()

    overlay = root / "99-ADMIN/projection-overlays"
    overlay.mkdir(parents=True, exist_ok=True)
    status_lines = []
    for name in sorted(platform):
        states = ", ".join(f"{state}={count}" for state, count in sorted(platform[name].items()))
        status_lines.append(f"- `{name}`: {sum(platform[name].values())} targets ({states})")

    readme = f"""# SRC operational research atelier

> **Independent preservation fixture.** {NOTICE}

This sealed TD613-TCP projection is the query surface for snapshot `{snapshot}`. The desktop vault remains custody authority. Read `CONNECTOR_ENTRY.md` before any corpus query.

## Phase 2 preservation status

The cross-platform census still contains 1,408 platform artifacts—442 Zenodo records, 499 Academia records, 257 Substack posts, and 210 Medium stories—and does not equate those manifestations with distinct intellectual works.

Acquisition outcomes at projection build time:

{chr(10).join(status_lines)}

- captures: {captures}
- unique content-addressed blobs: {blobs}
- searchable derivatives: {derivatives}
- repeated-target observations preserved for recovery audit: {repeated}
- rights states: {json.dumps(dict(sorted(rights.items())), sort_keys=True)}

`AUTH_REQUIRED`, `PARTIAL`, and unavailable embedded-media outcomes are terminal observations, not evidence of suppression. No authentication, CAPTCHA, paywall, robots restriction, or access control was bypassed.

## Non-collapse wall

```text
work multiplicity
!= evidence multiplicity
!= representation multiplicity
!= authority multiplicity
```

Also preserve: `work != edition != manifestation != capture != blob != derivative`; historical, conceptual, navigational, and operational graphs are distinct; existence, visibility, retrievability, provenance, lineage, and authority are distinct; newest publication is not controlling authority.

## Four explicit AIA routes

- **EXPERIENTIAL** — chronology, concepts, three-corpus traversal, route-conditioned reading.
- **CUSTODIAL** — captures, hashes, licenses, availability, and disappearance receipts.
- **AUDIT** — contradictions, evidence lineage, compilers, authority, candidates, and falsifiers.
- **IMPLEMENTATION** — schemas, deterministic runners, validators, and query recipes.

Route selection is explicit. This fixture transfers no authority, imports no TD613 scientific claim, exposes no web application, and requires human closure.
"""

    connector = f"""# SRC connector entry

> **Independent preservation fixture.** {NOTICE}

## Mandatory epoch binding

Resolve `04-RECEIPTS/phase2/current-seal.json` in `tauric-diana-613/TD613-TCP`. Open a session only when both `seal_id` and `atelier_snapshot_id` are present and the projection seal verifies. Every query result, hypothesis packet, and proposed patch must carry both values.

```text
desktop vault = custody authority
sealed TD613-TCP projection = query authority for epoch S_k
unsealed working state != connector query authority
```

Never join epochs implicitly. An explicit cross-epoch assay must name both seals and every crossed identifier. On absence or mismatch return `SEAL_EPOCH_UNAVAILABLE` and stop.

## Resolution path

1. Read `01-MANIFESTS/phase2/interface-registry.json`.
2. Resolve identifiers through `01-MANIFESTS/phase2/entity-resolver-v2.jsonl`.
3. Follow work → edition → manifestation → capture → derivative/source span without skipping layers.
4. Treat opaque `src-private-locator:*` values as evidence that a body was verified in desktop custody at the named seal. They disclose no path and confer no connector access; return `PRIVATE_UNAVAILABLE` when the body is absent from TD613-TCP.
5. Treat `PLACEHOLDER`, `OPEN_UNRESOLVED`, `PRIVATE_UNAVAILABLE`, and contradictions as terminal query states until new evidence is sealed.
6. Search formal theory, fictional universe, and governance/provenance as overlapping projections, never exclusive bins.

## Current is authority, not chronology

Seek an exact `CURRENT_CONTROLS` or scope-specific `SUPERSEDES_SCOPE` path. Without one, return all applicable witnessed formulations with dates, scopes, authority states, and evidence. This rule is forbidden:

```text
sorted(records, key=date)[-1] => controlling formulation
```

Newest manifestation is a chronological fact. A controlling formulation is an authority relation.

## Non-collapse requirements

- work, evidence, representation, and authority multiplicities remain separate;
- historical, conceptual, navigational, operational, manifestation, bibliography, and authority graphs remain separate;
- every evidence-independence assertion names ancestry, basis, data/method/case/result-generation dimensions, and unresolved shared inputs;
- source declaration, archive observation, archive inference, hypothesis, and researcher proposal remain separate;
- unavailable never means suppressed;
- theorem label never means proof or empirical validation;
- contradiction is a receipt, not permission to repair;
- model/archive edges remain candidates until exact source-span evidence and human/Amari disposition exist.

## Query opening

Begin by returning the matched seal and coverage state, target/capture counts by platform and rights state, unresolved expected objects, compiler and authority-jurisdiction maps, evidence-lineage groups, and highest-value open tomography trails. Then ask which trail to enter.

You have read/query/proposal authority only. Do not infer mutation, review, merge, release, publication, or TD613 scientific-promotion authority. Repository changes require a `td613-amari-patch/v1` proposal with exact paths, anchors, evidence IDs, claim ceiling, and rollback conditions.
"""
    (overlay / "README.md").write_text(readme, encoding="utf-8")
    (overlay / "CONNECTOR_ENTRY.md").write_text(connector, encoding="utf-8")
    print(json.dumps({"snapshot": snapshot, "captures": captures, "derivatives": derivatives, "repeated_targets": repeated}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
