# TCP — The Cadence Playground

TCP is a static, local browser tool for experimenting with cadence recognition, custody-aware routing, and safe-harbor logic under the TD613 framework.

This build creates a lightweight engine for branch / field / wave / harbor reasoning, schemas, examples, and documentation. The point is not generic stylometry; the point is to stage **recognition before explanation** without letting recognition collapse into extraction.

## What ships

- `app/` — runnable static web app
- `copy/` — interface microcopy and route language
- `example/` — sample canonical artifact, badge state, ledger rows, and route events
- `schemas/` — JSON schemas for core payloads
- `docs/` — theory, physics engine, stylometric math, safety model, and Em/TIC bridge notes
- `scripts/` — sample validation tooling
- `tests/` — no-dependency Node tests for core formulas
- `original/` — preserved uploaded prototype for archival comparison

## Core design law

```text
If recognition exceeds explanation, preserve the branch until routing catches up.
```

## Quick start

### Option 1: open directly
Open `app/index.html` in a browser.

### Option 2: serve locally
```bash
cd tcp-repository
python3 -m http.server 8000
# then open http://localhost:8000/app/
```

### Option 3: validate sample payloads
```bash
node scripts/validate-samples.mjs
node tests/formulas.test.mjs
node tests/harbor.test.mjs
node tests/stylometry.test.mjs
```

## Repository stance

TCP is built as a **public membrane** around a larger custodial architecture. It does not diagnose, clinically intervene, or promise truth from resemblance alone. It demonstrates:

- how patterned recurrence becomes legible,
- how recognition can harden into criticality when no route exists,
- how reusable harbor functions lower witness burden while preserving provenance.

## Theory anchors

1. **Branch / unwanted solution** — do not auto-discard the awkward remainder.
2. **Wave / recognition pressure** — resemblance is not yet passage.
3. **Harbor / witness-archive threshold** — when institutions degrade route and provenance, burden externalizes onto the witness.

## Primary abstractions

- `badge.holds` — compact custody token
- `mirror.off` — anti-reflective safe passage harbor
- `routePressure` — recognition outpacing route
- `recurrencePressure` — return-density proxy
- `provenanceRetention` — passage validity threshold
- `reuseGain` — burden prevented by reusable harbor functions

## Notes for GitHub

- No build step is required.
- All logic is ESM JavaScript with zero runtime dependencies.
- JSON schemas are draft 2020-12 style but can be adapted.
- A simple GitHub Pages deployment workflow is included.