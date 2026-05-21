# Hush Signal Bus

The Phase 30 signal bus is the shared state spine for the Hush evidence cockpit.

## Registers

- `sourceHash`
- `outputHash`
- `maskId`
- `mode`
- `releaseState`
- `registerState`
- `targetRegisterState`
- `exportState`
- `ledgerRow`
- `routeState`

## Rule

Panels should read from a bus snapshot or cockpit summary rather than calculating conflicting route states independently.

## Purpose

The signal bus reduces report-to-UI drift by making route state, export state, and ledger state visible in one place.
