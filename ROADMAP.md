# Roadmap

What is in flight, what is pending, and what is currently red. Use this
alongside [`KNOWN_FAILURES.md`](KNOWN_FAILURES.md) and individual
chamber READMEs.

## Recently shipped

- **Phase A** (commits `d1ff8a4`, `f1ca344`, `a3ce6ed`)
  - Dropped sessionStorage dual-write of the gateway/aperture handoff.
  - Archived six PATCH_*_LEDGER files to `app/safe-harbor/_archive/ledgers/`.
  - Added [`CONTRIBUTING.md`](CONTRIBUTING.md) plus a commit-msg hook
    that rejects placeholder messages (`Patch X.Y.Z`, `WIP`, empty).
- **Phase B** (commits `966f638` through `01bc323`)
  - Re-synced `browser-engine.js` and the 18 retrieval-lane fixtures.
  - Added a JSDOM-based smoke test for every chamber HTML (project's
    first runtime test dependency, `jsdom`).
  - Wired CI to run `npm test` before deploying to GitHub Pages.

## In flight

Nothing right now. Phase B closed; next phase needs to be picked up
deliberately.

## Pending

### Phase C — Engine vocabulary externalization

`inferDiscourseOntology` and three sibling functions in
`app/engine/generator-v2.js` carry fixture-leaning vocabulary
(`unit`, `onboarding`, `motel`, `plumber`, `cabinet`, etc.) inside
their regex bodies. That couples the engine to a specific corpus and
makes new fixtures an engine change rather than a data change.

The fix: extract the vocabulary into
`app/engine/data/discourse-ontology.json` and have the four functions
load from it. No behavioral change required — the existing
`tests/generator-v2.test.mjs` assertions pin the expected outputs.

### Phase D — Aperture monolith refactor

`app/aperture/index.html` is one 8200-line file with nine inline
`<script>` blocks. Five of them version-stamp themselves
(`aperture-v100-script` through `td613-aperture-gateway-embed-script`)
and each monkey-patches `window.createTCPHandoffPacket`,
`window.updateUI`, and `window.resetSystem` from the previous block.
The chain works empirically but is one missed `originalX` capture
away from corruption.

- **D1** — split each inline script into its own file in
  `app/aperture/scripts/`. No logic change.
- **D2** — replace the five-deep wrapper chain on each global with an
  explicit `composeChain(layers, base)` registry pattern. Layers
  declare themselves; composition runs once at the end.

## Currently red (tracked, not gating)

Three engine-regression tests in
[`KNOWN_FAILURES.md`](KNOWN_FAILURES.md):

- `tests/trainer-lab.test.mjs` — semantic audit floor below 0.85
- `tests/trainer-browser.test.mjs` — fingerprint snapshot drift
- `tests/persona-gallery.test.mjs` — gallery fingerprint snapshot drift

All three trace back to operator additions in Patch 33.7.1 shifting
engine output past existing thresholds and snapshots. They are
quarantined into `npm run test:known-failing` so `npm test` (and CI)
stays honest about new regressions.

## What this roadmap is not

This is not a feature list. The chambers (`Deck`, `Trainer`, `Readout`,
`Homebase`, `Personas`, `Aperture`, `Safe Harbor`) are stable
operationally; the work named above is structural cleanup so future
changes land cleanly. New feature design lives in plan files, not here.
