# TD613 · Emergence HQ Surgical Repair Evidence Receipt

**Scope:** Source-free Vixen V4.1, PR #1718 successor to `884b989b7faf7aba3f432ec3552266719a9a2fff`. One small production code correction and documentary reconciliation; no merge or scientific promotion.

## Confirmed regression and minimal correction

**SR-01**: In `renderProtocolsView()`'s TRACKS branch, an inline `readerEl.querySelectorAll('[data-open-ref]')` handler was registered on buttons that were subsequently registered by `bindRefButtons(readerEl)` at the bottom of the renderer. This double registration triggered two history replacements and one unintended scroll-to-top call on a Track-linked Instrument click. Remove the Track-specific handler; the existing common binder becomes the sole click owner. In `openRecordById`, preserve scroll on same-department Work and Protocol reference navigation while retaining deliberate department transitions.

**SR-02:** Canonical embedded instrument-family taxonomy is:
- F1 · CLAIM-CEILING & ANTI-LAUNDERING SIEVES: 6
- F2 · AUTHORITY GEOMETRY & PATH CATEGORIES: 7
- F3 · LINEAGE & OPERATOR / CLOCK CUSTODY: 4
- F4 · CONTROL-PLANE SEPARATION & HYSTERESIS: 4

**SR-03:** Use the fuller ~19 KB Astra commission from the previously canonical GitHub/ZIP packet as source, not the separate shorter loose prompt. Preserve its creative authority and correct C5 as Sui-Generis Frontier.

**SR-04:** Explicitly separate Git-verified historical artifact identities from conflicting reported 640,649-byte intermediate digests. The two reported SHA-256 strings are not interchangeable.

## Independent Chromium negative-control results (scripted browser-loaded HTML)

| Viewport width | Predecessor replace / push / scroll | Surgical successor replace / push / scroll | Other observations |
|---|---|---|---|
| 1440px | 2 / 0 / 1 | 0 / 1 / 0 | Correct linked instrument, hash, reader and selection; no page errors |
| 390px | 2 / 0 / 1 | 0 / 1 / 0 | Same outcome |
| 320px | 2 / 0 / 1 | 0 / 1 / 0 | Same outcome |

For all six runs, automatic requests logged: `0`; desktop/mobile viewport horizontal overflow: `false`; all selected instrument IDs matched the target URL and reader. See `BROWSER_NEGATIVE_CONTROL_RECEIPT.json` and `repro_browser.py`.

**Execution limits:** Chromium test uses `page.set_content` because localhost / file:// navigation is sandbox restricted here. Real browser Back/Forward and physical local file launch remain Kenough-recorded, not independently replicated by this session. Node/JSDOM full suite and GitHub CI are not asserted to have been rerun. An unmerged PR commit is not production deployment.

**Independent scientific ceiling:** Human scientific and creative closure remains RESERVED; source-free manuscript bodies remain unavailable; `empirical_replication_count = 0`.
