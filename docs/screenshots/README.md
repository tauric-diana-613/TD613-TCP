# Screenshots

This directory holds visual captures of the live chambers, used to
illustrate the audience-facing READMEs. None are committed yet — the
plan deferred capture to a single user-driven session because there's
no headless browser tooling installed (jsdom is text-only, and adding
playwright purely for screenshots would contradict Phase B's "no
native browser binaries" choice).

## What to capture

Four screenshots cover the most useful visual ground for a first-time
visitor. Capture at viewport size 1280×800 so they read well embedded
in markdown.

| Filename | Where | Why |
|----------|-------|-----|
| `gateway-hero.png` | `app/index.html` (skip ingress) | First impression — the chamber index and Aperture preview tile. |
| `safe-harbor-staged-packet.png` | `app/safe-harbor/index.html` after staging a packet | The SHI # mint, the canonical header preview, and the forensic schema panel — exactly what the Safe Harbor README's worked-example section describes in JSON. |
| `aperture-audit-ledger.png` | `app/aperture/index.html` after running an audit | The 13-signal Aperture audit drawer that the Aperture README diagrams in ASCII. |
| `deck-cadence-swap.png` | `app/deck.html` after a swap-cadences pass | The duel side-by-side that defines what "swap cadences" actually means visually. |

## Capture procedure

```bash
# 1. Serve locally
npm run serve

# 2. In the browser, open each chamber at 1280x800 and prepare the state
#    described in the table above.
# 3. Capture (macOS Cmd+Shift+4, then Space, then click the window;
#    Linux Shift+PrtScn region select; Windows Snipping Tool).
# 4. Save each PNG into this directory with the exact filename from the
#    table.
# 5. Reference them from the audience READMEs:
#       ![Gateway hero](../../docs/screenshots/gateway-hero.png)
```

The Safe Harbor README and Aperture README are written to work without
images — they have ASCII diagrams and a worked JSON example. The
screenshots are an additive layer; missing them does not break either
document.

## What's *not* welcome here

- **Stale captures.** If the UI changes meaningfully, recapture rather
  than letting the screenshot drift. A misleading screenshot is worse
  than no screenshot.
- **Zoomed-in detail crops.** This directory is for full-chamber views
  that establish what the room looks like. Detail crops belong inline
  in their relevant doc, not as primary illustrations.
- **Personal data.** Use the example samples and corpus, not real
  attestation content from a private use of the app.
