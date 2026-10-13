# Dollhouse · canonical shortcuts and portable kit

This discoverable folder points into the canonical repository sources. It keeps
the four audit roles separate and avoids maintaining drifting copies of them.

| Role | Canonical entry | Bounded job |
| --- | --- | --- |
| Pedagogue | [PEDAGOGUE.md](../PEDAGOGUE.md) | Consequence order, route burden, practice and gesture-to-consequence audit |
| Aperture | [APERTURE.md](../APERTURE.md) | Observation, reconstruction deficit and falsifier-driven witness planning |
| Atlas | [ATLAS.md](../ATLAS.md) | Receiver/control invariance and continuity differences |
| FADT | [FADT.md](../FADT.md) | Exact finite support after conditioning-state erasure |

Start with [DOLLHOUSE.md](../DOLLHOUSE.md) and [AGENTS.md](../AGENTS.md). Reports
remain distinct inside a case dossier; agreement grants neither execution nor
release authority. Historical production-trial listeners remain retired.

The [research lineage index](lineage/README.md) and
[pinned source catalogue](lineage/source-records.json) preserve the distinction
between original research, archived original bytes and installed runtime
adapters. All 678 selected originals accompany the kit losslessly; immutable
repository archives provide sources beyond that selection. Unmerged research
stays unmerged research.

## Export a revision-bound kit

From the repository root, with Node 22 or newer and Git available, choose a
**new directory outside the repository**, whose parent already exists:

```bash
node scripts/export-dollhouse.mjs /absolute/new-dollhouse-kit
```

The default requires every bundled file to match the committed HEAD. During an
explicitly uncommitted review, use:

```bash
node scripts/export-dollhouse.mjs /absolute/new-review-kit --allow-working-tree
```

That manifest says `WORKING_TREE_CANDIDATE`, names every changed bundled file,
and records the HEAD/tree anchors separately from exact exported SHA256 bytes.
Those anchors provide local references, not authenticated external origin.
Once changes are committed, export again to a new directory for exact committed
bundled bytes. Existing directories are never overwritten.

The exporter copies an explicit entrypoint allowlist and its static relative
ES-module dependency closure, preserving paths. Missing files, path escapes,
symlinks, dynamic dependencies and external packages produce HOLD. V8 parses
modules without executing them. No npm installation occurs; the generated
package declares only `type: module`, with no lifecycle scripts or dependencies.
The kit is bounded to 2,048 files, 32 MB overall and 2 MB per file. Archived
JavaScript, tests and other supporting text retain exact original bytes in inert
`.source.md` members; packaging them never imports or executes their contents.
Secrets, user records, `.git`, `node_modules`, live provider runners, deployments
and the full browser Aperture installation remain outside this kit.

The new folder can be compressed with an ordinary archive tool and shared. It
contains canonical role documentation, bounded operational adapters, offline
audit runners, the lineage catalogue, its declared local original records and
the source/hash manifest. Archived originals are checked against declared
SHA256 and Git blob object identities. These checks establish consistency of
the carried bytes with those declarations; upstream authenticity remains a
separate question. No catalogue URL triggers retrieval or research execution.
Linked source documents may discuss
larger repository lanes; their presence never claims those lanes were packaged.

## Verify and use the exported kit

From its root:

```bash
node scripts/export-dollhouse.mjs --verify .
node scripts/run-dollhouse-agent-audit.mjs atlas 3
node scripts/run-dollhouse-agent-audit.mjs fadt 5
node scripts/run-dollhouse-portable-roundtrip.mjs 3 companion EXPLAIN_STATE
node scripts/run-pedagogue-design-gate.mjs /absolute/fictional-fixture.json
```

The runners use declared fictional scenes or an operator-supplied fixture.
They perform no live provider calls. SHA256 equality witnesses integrity of the
carried bytes; source authentication, host enforcement, empirical exteriority
and Golden Egg acquisition require their own independent evidence.

Human closure remains required. ⟐
