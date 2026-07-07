# TD613 Diagnostics

Diagnostics are tiered so agents can get fast confidence without turning every patch into a release audit.

## Default Path

Use this for ordinary work:

```bash
npm run diag:smoke
npm run diag:recommend
```

`diag:smoke` checks the diagnostics corpus, section runner contract, and staging behavior. It does not publish or overwrite `reports/diagnostics/latest.*`.

`diag:recommend` inspects changed files and prints focused commands. It does not run tests.

## Focused Checks

Run the focused check for the subsystem you touched:

| Changed area | Command |
| --- | --- |
| Aperture | `npm run diag:focus -- --area=aperture` |
| Dome-World | `npm run diag:focus -- --area=dome-world` |
| Hush | `npm run diag:focus -- --area=hush` |
| Safe Harbor / Flight | `npm run diag:focus -- --area=safe-harbor` |
| Generated browser bundles | `npm run diag:focus -- --area=generated` |

Focused checks may stage temporary diagnostics snapshots, but they must not publish maintained reports.

## Release Reports

Use this only when you intend to refresh maintained diagnostics reports:

```bash
npm run diag:release
```

This runs the maintained diagnostics battery, publishes:

- `reports/diagnostics/latest.json`
- `reports/diagnostics/latest.md`
- `reports/diagnostics/*.latest.json`
- `reports/diagnostics/*.latest.md`

Then it runs the release-report assertions.

## Deep Audit

Use this only for an intentional deep audit:

```bash
npm run diag:full
```

`diag:full` starts a fresh full diagnostics battery and publishes maintained reports. It is not required for ordinary patches, UI fixes, small docs edits, or focused subsystem work.

`diag:battery` remains as a compatibility alias for `diag:full`.

## Rules

- Do not make `diag:full` a default GitHub gate.
- Do not run release/full diagnostics just to prove a small patch.
- Do run release diagnostics before publishing refreshed checked-in diagnostics reports.
- If a focused check fails because of known stale coverage outside the touched area, record it and run the direct focused test that covers the changed behavior.
