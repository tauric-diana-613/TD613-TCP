# TD613 Safe Harbor — Do First Patch Ledger

This patch applies the first stabilization pass across the Safe Harbor repo.

## Completed in this pass

1. Removed auto-unvault behavior and replaced it with an explicit **Mint Staged Packet** action.
2. Converted operator bypass into a distinct **packetless operator shell** state.
3. Removed the hardcoded client-side bypass secret; public ship now expects a locally configured operator token hash.
4. Normalized lifecycle language toward:
   - `staged`
   - `sealed`
   - `harbor-eligible`
   - `exported`
   - `verified`
5. Renamed `packet_checksum` to `packet_hash_sha256` throughout the Safe Harbor packet model and UI.

## Files changed

- `README.md`
- `index.html`
- `app/data.js`
- `app/main.js`
- `docs/ARCHITECTURE.md`
- `docs/HOOKS.md`
- `schemas/td613-safe-harbor.packet.schema.json`
- `examples/td613-safe-harbor.packet.sample.json`
- `PATCH_DO_FIRST_LEDGER.md` (new)

## Key behavioral changes

### Ingress membrane
- The third lane no longer auto-opens the vault.
- Once all three lanes are held, the interface enters `triad-ready` and waits for explicit staging.
- A new **Mint Staged Packet** button performs the stage transition.

### Operator bypass
- Bypass no longer pretends a packet exists.
- Bypass opens a packetless operator shell only.
- Public ship contains no hardcoded password/token.
- Bypass requires a local operator token hash, supplied by config or session storage.

### Packet model
- Packet field renamed to `packet_hash_sha256`.
- Receipt state now uses `staged` / `sealed`.
- Export gate now prefers `guarded` / `harbor-eligible`.

## Explicitly left for the next pass

- Verify / manifest / offline capsule canon drift.
- `.git` removal from shipped archive.
- Full version-label alignment across TD613 release surfaces.
- Tightening public/operator/dev boundaries beyond the membrane fixes.
- Wiring advanced probe building directly to staged packet state.
- Replacing placeholder badge-number issuance.
- Full sig-lane integration after packet lifecycle stabilizes.
