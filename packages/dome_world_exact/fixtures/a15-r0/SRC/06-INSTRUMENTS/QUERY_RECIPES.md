# Sealed query recipes

Every recipe begins by resolving one matching `atelier_snapshot_id` and `seal_id` from the public and private projections. Every returned result carries that epoch. An absent, mismatched, or unverified epoch stops the query.

These recipes are read-only. They do not authorize archive mutation, scientific promotion, repository review, publication, or release.

## Ten representative traversals

1. **Custody chain** — resolve a work ID through edition → manifestation → capture → blob/derivative → page or paragraph locator. Stop on every unresolved join.
2. **Cross-surface work identity** — list each manifestation and capture separately; never infer one body from a matching title or DOI.
3. **Authority jurisdiction** — return every applicable witnessed formulation by scope. Select none unless an exact `CURRENT_CONTROLS` or `SUPERSEDES_SCOPE` edge exists.
4. **Promissory object** — resolve an expected-object ID to its exact state and witnessed resolver evidence. `OPEN_UNRESOLVED` is a complete answer.
5. **Compiler context** — traverse compiler → input → contextual role assertion; report `rho(work | architecture, scope, time)`, never an intrinsic work role.
6. **Evidence independence** — traverse claim → supporting works → evidence units → ancestry and separate data/method/case/result-generation dimensions. Work count is not evidence-lineage count.
7. **Reference integrity** — compare source-bibliography, semantic-body, and archive-reconstructed edges without repairing the source record.
8. **Order discordance** — materialize historical, conceptual, navigational, and operational projections separately. Opposing paths across unlike projections are not a cycle.
9. **Three-corpus traversal** — query formal, fictional, and governance/provenance labels as overlapping views and preserve each occurrence's role and source span.
10. **Surface withdrawal** — remove one platform from the query view and report identity, text, chronology, relation, lineage, and authority recoverability separately.

## CLI form

```text
python 99-ADMIN/srcquery.py \
  --snapshot-id <atelier_snapshot_id> \
  --seal-id <seal_id> \
  summary
```

Other bounded forms:

```text
... resolve <stable-entity-id>
... authority <subject-id> [--scope <scope-text>]
```

The authority command intentionally has no “latest” option.

## AIA route binding

- `EXPERIENTIAL` — chronology, concepts, multi-corpus traversal, and route-conditioned reading.
- `CUSTODIAL` — bytes, hashes, captures, rights, availability, and disappearance receipts.
- `AUDIT` — contradictions, evidence ancestry, compilers, authority, claims, hypotheses, and falsifiers.
- `IMPLEMENTATION` — schemas, deterministic runners, validators, tests, and query recipes.

Route selection is explicit. A query may compare routes only when it names the comparison and keeps every route's authority and evidence status intact.
