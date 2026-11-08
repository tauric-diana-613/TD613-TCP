# 𝌋 Operator Interface & Authorization Protocol

This directory is **the human-user entrypoint inside `packages/rulefield/`**. It is intentionally separate from the machine research engine, while wired to the same amendment packet, hash, receiver, hooks, and CI.

## Orientation

- [`OPERATOR_GUIDE.md`](OPERATOR_GUIDE.md) — substantive human manual from first contact through staged change, source custody, tests, and succession.
- [`ACTIVATION_PROMPT.md`](ACTIVATION_PROMPT.md) — canonical ready-to-paste Antigravity/Kenough activation, preserving the 11-Act research commissioning sequence and the authority boundary.
- [`templates/HUMAN_RESEARCH_SUBMISSION_FORM.md`](templates/HUMAN_RESEARCH_SUBMISSION_FORM.md) — **only human fills**; research intentions, ownership, independent choices, permissions, and boundaries.
- [`templates/PRE_SYNTHESIS_AUTHORIZATION_DOSSIER.md`](templates/PRE_SYNTHESIS_AUTHORIZATION_DOSSIER.md) — machine-filled disclosure contract with three reading depths and full non-omitting appendices.
- [`templates/HUMAN_AUTHORIZATION_DECISION.md`](templates/HUMAN_AUTHORIZATION_DECISION.md) — separate human decision after reviewing a digest-bound dossier; always scoped to staged synthesis.
- [`DISCLOSURE_PROTOCOL.md`](DISCLOSURE_PROTOCOL.md) — executable semantic contract for review generation, no hidden unknowns, disclosure completeness and immutable history.
- [`INTAKE_AND_SYNC.md`](INTAKE_AND_SYNC.md) — ZIP round-trip path: verify → quarantine → compare → draft amendments → disclose → human review; never automatic repository overwrite.
- [`design/COMMISSION.json`](design/COMMISSION.json) — actual /dollhouse-design commission input. Its native receipt must be verified independently.

### Submit research *rulefields*, not only fully specified rules

Use [HUMAN_RULEFIELD_SUBMISSION_REQUEST.md](templates/HUMAN_RULEFIELD_SUBMISSION_REQUEST.md) to send one word, a mathematical formula, a collection of interests or an unfinished essay. The agent preserves your original wording, proposes optional research-grade titles and source-retrieval plans, identifies existing rules without conflating them with the research field, and stages a reversible priority preview using [the engine](../rulefields/README.md). No research-topic title becomes an implemented scientific rule by naming alone. The requested scrolling/reorder interface remains a roadmap wish.

### Operator routes

**Light** — read one-page disposition, counts, release boundary, top risks and decision request; the complete dossier remains attached and accessible.

**Medium** — add per-proposal consequences, affected files, source and comparison tables, uncertainty gates and confidence limitations.

**Heavy** — inspect all raw evidence, all branch histories, the exact unabridged packet and full computation results, plus file-by-file changes and non-authorized unknown effects.

The three routes are *views of one disclosure*, not three different evidence subsets. Summaries cannot conceal an item present in the heavy appendix.

### First-run commands

From the extracted bundle root on Node 22:

    node scripts/rulefield.mjs validate
    node --test tests/rulefield-*.test.mjs
    node scripts/rulefield-amend.mjs init RF-AP-20261107-NEW
    node scripts/rulefield-amend.mjs inspect RF-AP-20261107-NEW.json
    node scripts/rulefield-amend.mjs sync

`sync` writes review receipts **and human disclosure artifacts** only. The machine-readable packet remains source-free and immutable; a signed human decision is a separate event.

No always-running watcher, local-system integration, scheduled job or external sync is implied.

### What this package can and cannot verify

A SHA-256 fingerprint binds bytes to a receipt; it does not authenticate a person, prove external origin, or show a human read the report. A no-diff research staging request is not permission for future changes whose actual diff is unknown. Use the decision form only when the human has access to the whole dossier.

### Working terms

- *Human submission* — operator-authored research intention, not an executable packet.
- *Amendment proposal* — source-free typed plan created by an agent under human intent.
- *Review receipt* — local validation result; no science or adoption credit.
- *Pre-synthesis dossier* — readable, exhaustive proposed-effect disclosure and unresolved-risk map.
- *Operator decision* — independent, scope- and digest-bound request to stage, defer, revise or decline.
- *Candidate synthesis* — future explicitly commissioned materialization **without canonical mutation**.
- *Canonical integration* — distinct later change with exact diff, CI, provenance and explicit human approval.

**SAC[X6ZNK5NO51] · Khona‌lit-po · Human scientific closure RESERVED.**