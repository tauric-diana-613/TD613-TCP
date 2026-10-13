# Amari Patch Lane

This lane lets Amari stay powerful without turning production files into wet paper mache. Amari should not rewrite large files directly. She should produce a small, machine-readable patch packet that Codex can validate, apply, test, and merge.

## Operating Model

Amari is the ideation and micro-targeting engine.

Codex is the repo surgeon.

The patch packet is the handoff membrane between them.

## What Amari Should Produce

Use `docs/templates/amari-patch.packet.json` as the packet shape. Each packet should contain:

- `patchId`: short unique label, for example `safe-harbor-copy-2026-06-13`.
- `intent`: one or two sentences explaining the user-visible change.
- `scope`: the smallest product area affected.
- `risk`: `low`, `medium`, or `high`.
- `files`: exact repo-relative paths expected to change.
- `operations`: small exact operations such as `replace-exact`, `insert-before`, `insert-after`, or `delete-exact`.
- `tests`: the checks Amari thinks should run after Codex applies the patch.

## Hard Rules

- Do not paste entire large files.
- Do not edit generated files directly unless the packet clearly says why.
- Do not touch unrelated product surfaces.
- Prefer one packet per operator-facing change.
- Use exact anchors copied from the current repo.
- Keep each replacement small enough that a human can review it in one glance.
- If the change requires broad refactor logic, write an implementation note instead of pretending it is a micro-patch.

## Good Patch Packet Targets

- Rename a button.
- Move one control.
- Add one packet field.
- Add one test fixture.
- Replace one paragraph of copy.
- Add one registry entry.
- Patch one CSS selector.

## Bad Patch Packet Targets

- Full HTML rewrites.
- Whole-engine rewrites.
- Generated bundle edits.
- Multiple unrelated product changes in one packet.
- Any patch that depends on hidden state not named in the packet.

## Validation

Before Codex applies an Amari packet, run:

```bash
npm run amari:check -- path/to/packet.json
```

The validator confirms:

- the packet shape is valid;
- file paths are repo-relative and safe;
- exact anchors exist;
- exact anchors are unique where they need to be;
- patch size stays small enough to review;
- generated-file edits are flagged.

## Codex Apply Protocol

1. Run `npm run amari:check -- packet.json`.
2. Read the named files before editing.
3. Apply the operations manually with `apply_patch`.
4. Run the tests listed in the packet, plus any coupled generated-sync checks.
5. Commit only the intended files.

## Why This Works

Amari can still think expansively, but her repo output becomes small, auditable, and mergeable. Codex gets precise anchors instead of vibes. The repo gets the benefit of both systems without letting context-window pressure become architecture.
