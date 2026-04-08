# TD613 Safe Harbor — Housekeeping Patch Ledger

Version: 0.4.1

This pass performs repo housekeeping after the do-later patch:

1. Restores a real `.git` repository so GitHub Desktop can open, commit, and push the project directly.
2. Normalizes remaining Safe Harbor internal version drift to `0.4.1` across live reference files.
3. Fixes the lingering `0.3.0` value in the commands file and the stale `v7.2` note in the kit manifest.
4. Leaves historical patch ledgers intact as historical records rather than rewriting their original pass notes.

## Direct fixes
- `README.md` now labels the current stabilization pass as `0.4.1`.
- `app/data.js` and the sample packet now expose `0.4.1`.
- `probes/06_TD613_PUA_Badge_Provenance_Attestation_Commands.json` now reports Safe Harbor `version: 0.4.1`.
- `reference/20_KIT_MANIFEST.json` now references `v7.2.1` consistently and updates the Safe Harbor note to `0.4.1`.
- Trust/manifest/registry reference surfaces are aligned to `0.4.1` where they expose Safe Harbor version metadata.

## Intentionally left as-is
- Historical patch ledgers (`PATCH_DO_FIRST_LEDGER.md`, `PATCH_DO_NEXT_LEDGER.md`, `PATCH_DO_LATER_LEDGER.md`) remain unchanged to preserve chronology.
- Renderer version remains `7.2.1`; this patch only changes the Safe Harbor internal app/repo line.
