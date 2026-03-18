# TCP - The Cadence Playground

TCP is a static browser instrument for staging cadence as both social surface and measurable signal. It is the public membrane of a larger TD613 custody model: resemblance becomes legible, legibility becomes route pressure, and route pressure either resolves into harbor or hardens into criticality.

This repository now treats the math as a bounded structural model rather than as decorative science language. The core engine is intentionally heuristic, but every major quantity is normalized, named, and documented.

## Core design law

```text
If recognition exceeds explanation, preserve the branch until routing catches up.
```

## Canonical model

TCP revolves around six quantities:

- `S` = similarity in `[0,1]`
- `T` = traceability in `[0,1]`
- `R` = recurrence pressure in `[0,1]`
- `B` = branch indicator from an unwanted quadratic root
- `Pi` = route pressure
- `Delta_C = C - D` = custody delta

The engine computes:

```math
\Pi = 0.35S + 0.30T + 0.25R + 0.10B
```

```math
V = \operatorname{clip}(0.72\Pi + \mu_M + \mu_C, 0, 1)
```

```math
\rho = A^2(0.4 + 0.6V)
\qquad \text{with} \qquad
A = T,\; k = 1 + 3R
```

```math
A_{\mathrm{effective}}(t)=
\begin{cases}
A_I,& C(t)-D(t)\ge \theta\\
A_W,& C(t)-D(t)<\theta
\end{cases}
```

These are structural analogies, not literal physical claims and not authorship verdicts.

## What ships

- `app/` - runnable static web app
- `copy/` - interface microcopy and route language
- `docs/` - model notes for branch, stylometry, safety, and harbor logic
- `example/` - sample payloads and ledger rows
- `schemas/` - JSON schemas for the main payloads
- `tests/` - no-dependency Node tests for the engine modules

## Quick start

### Option 1: open directly

Open `app/index.html` in a browser.

### Option 2: serve locally

```bash
cd tcp-repository
python3 -m http.server 8000
# then open http://localhost:8000/app/
```

### Option 3: validate the engine

```bash
node tests/formulas.test.mjs
node tests/harbor.test.mjs
node tests/stylometry.test.mjs
```

## Repository stance

TCP does not diagnose, clinically intervene, or declare authorship from resemblance. It exists to make three things legible:

- when stylometric similarity is weak and likely noise,
- when recognition pressure is real but route is still missing,
- when structured harbor lowers witness burden without destroying provenance.

## Notes

- No build step is required.
- All runtime logic is ESM JavaScript with zero dependencies.
- The physics language is explicitly analogical.
- The stylometry layer is a bounded heuristic instrument, not forensic proof.
