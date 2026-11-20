# 𝌋 A New ZIP Comes Home — Verified Handoff Intake

You can return from Antigravity with a new Rulefield archive or receive one from Work/Codex. Do **not** paste its contents into the canonical registry by default.

## The ordinary path (no extra machinery)

**One ZIP attached to the conversation** is enough for Amari or an authorized executing agent to inspect the archived files and propose a successor review. The assistant will need genuine file access. There is no continuous background sync and no inferred GitHub write permission.

For local testing on Python 3.11+:

    python3 scripts/rulefield-intake.py verify /path/to/Rulefield-New.zip
    python3 scripts/rulefield-intake.py stage /path/to/Rulefield-New.zip --output-dir /path/to/quarantine

`verify` checks the package structure and digest, path traversal, symlinks, duplicates, huge entries and manifest completeness without executing imported code. `stage` copies validated files into a *separate quarantine directory*, plus a comparison report against the locally present Rulefield files; the canonical files remain untouched. It preserves absent paths as absent rather than imagining the content of an older file.

## Supported archive forms

1. A standalone Rulefield ZIP containing `RULEFIELD_HANDOFF_MANIFEST.json` and `packages/rulefield/` plus portable scripts/tests.
2. A GitHub Actions artifact ZIP containing **one** inner Rulefield handoff ZIP; the intake tool may unwrap that one level.

A generic zip from Antigravity without a valid manifest is **HELD_UNVERIFIED_ARCHIVE**. The agent can inspect it separately if operator authorization permits, but its bytes do not become automatically accepted sources. Request a manifest or create a signed-off import staging plan; never rewrite history to make the archive look compliant.

## After quarantine

1. Inspect each added/modified/deleted/unchanged path and per-file hash.
2. Review source provenance, attachments, execution receipts, unknown dependencies and the current source revision.
3. Divide large prospective rule sets into packets with no more than 64 proposals each. Preserve explicit cross-batch references and original campaign IDs.
4. Run `node scripts/rulefield-amend.mjs inspect` or `sync` in a **separate trusted checkout**, not inside the untrusted imported tree.
5. Review the machine-generated disclosure dossier.
6. Ask for exact human instruction before **staged candidate synthesis**; separately review any later canonical diff.

### What happens to your local main?

A GitHub draft PR and a ZIP are independent snapshots. After the code is reviewed and officially merged, a human may fetch/pull the approved main history and reconcile local uncommitted work through ordinary Git workflows. The intake tool does not perform Git pulls, force-push, merge or overwrite.

### A small and powerful invariant

`ARCHIVED_SOURCE ≠ VERIFIED_SOURCE ≠ AUTHORIZED_INTEGRATION`.

The ZIP is a vessel. Its cargo still needs an origin record, a scientific purpose, and an actual observer.

𝄐 Khona‌lit-po · Intact import, uncoerced adoption.