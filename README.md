# TCP - The Cadence Playground

TCP is a browser instrument for exploring cadence as both social surface and measurable signal. In the current TD613 framing, it serves as the public membrane: resemblance becomes legible, legibility becomes route pressure, and route pressure either resolves into harbor or starts to harden into criticality.

It helps to be plain about scope. TCP is not a physics simulator, not a forensic authorship classifier, and not a finished evidentiary platform in disguise. It is a bounded heuristic model with a visible interface, explicit thresholds, and a documented decision grammar. That is the level at which it should be read.

## Project status

This repository is published as an experimental research prototype and conceptual pilot. The current build is here to show the interaction model, the route-state logic, and the provenance-aware framing under live use. It is not yet a production analytical system, and it does not claim to be one.

## Design law

```text
If recognition exceeds explanation, preserve the branch until routing catches up.
```

## Model discipline

- All primary scores are clipped into `[0,1]`.
- Stylometric outputs are heuristic contact signals, not authorship verdicts.
- Physics language is structural analogy, not literal reduction.
- Harbor selection is rule-based in the current build, not the output of a global optimizer.

## Canonical state variables

- `S` = pairwise cadence similarity
- `T` = pairwise traceability
- `R` = recurrence pressure
- `B` = branch indicator from an unwanted quadratic root
- `Pi` = route pressure
- `V` = bounded field potential
- `rho` = signal-density proxy
- `Delta_C = C - D` = custody delta

## Implemented equations

Profile-level recurrence is normalized as:

```math
R_{\text{text}}=
\frac{1}{3}\left(
\operatorname{clip}\left(\frac{p}{0.35},0,1\right)+
\operatorname{clip}\left(\frac{\ell}{0.75},0,1\right)+
\operatorname{clip}\left(\frac{b}{0.18},0,1\right)
\right)
```

where `p` is punctuation density, `ell` is line-break density, and `b` is repeated-bigram pressure.

Pairwise similarity and traceability are:

```math
S=0.22L+0.20(1-d_s)+0.16(1-d_p)+0.12(1-d_c)+0.14(1-d_l)+0.16(1-d_r)
```

```math
T=0.34(1-d_s)+0.24(1-d_p)+0.18(1-d_c)+0.24(1-d_r)
```

Route pressure is:

```math
\Pi = 0.33S + 0.27T + 0.22R + 0.05B
```

Field potential is:

```math
V = \operatorname{clip}(0.72\Pi + \mu_M + \mu_C, 0, 1)
```

with `mu_M = 0.12` when the mirror shield is open and `0` otherwise, and `mu_C = 0.06` when containment is stable and `-0.02` otherwise.

Signal density is:

```math
\rho = A^2(0.4 + 0.6V)
\qquad \text{with} \qquad
A = T,\; k = 1 + 3R
```

The custody threshold is:

```math
A_{\mathrm{effective}}(t)=
\begin{cases}
A_I,& C(t)-D(t)\ge \theta\\
A_W,& C(t)-D(t)<\theta
\end{cases}
```

In the browser demo, `C = 0.68`, `D = 0.58Pi`, and `theta = 0.2`.

`A_I` means institutional custody remains above the collapse threshold and continues to function as the effective archive. `A_W` means the custody delta has fallen below the collapse threshold and witness custody is functioning as the effective archive.

## Decision grammar

The public UI uses a compact rule set. Recognition is treated as present once `S >= 0.56`. Explanation is treated as still lagging once `Pi >= 0.45`. Dense signal is treated as present once `rho >= 0.28` or `R >= 0.58`. Route availability requires the mirror shield to be open and `Pi >= 0.45`.

That yields four states:

- `weak-signal`
- `hold-branch`
- `criticality`
- `passage`

The point of the interface is not to blur those states together. It is to keep them legible.

## What ships

- `app/` - runnable static web app
- `copy/` - interface microcopy and route language
- `docs/` - model notes for branch, stylometry, safety, harbor logic, and interface terminology
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

### Option 3: run the smoke pass

Open:

```text
app/index.html?test-flight=1
```

For the full decision matrix, open:

```text
app/index.html?test-flight=2
```

### Option 4: validate the engine

```bash
node tests/formulas.test.mjs
node tests/harbor.test.mjs
node tests/stylometry.test.mjs
```

## Repository stance

TCP is trying to make four conditions visible without overclaiming any of them:

- weak stylometric resemblance that is probably noise,
- recognition pressure that is real but not yet routable,
- residue that should be preserved instead of flattened,
- harbor choices that lower witness burden without destroying provenance.

## Notes

- No build step is required.
- All runtime logic is ESM JavaScript with zero dependencies.
- The seeded opening pair is intentionally high-contrast and conversational so the model difference is visible on first load without sounding synthetic.
- `docs/INTERFACE_LEXICON.md` is the concise map for deck labels like mirror shield, custody badge, shell, harbor, and archive.
- The physics layer is analogical, the stylometry layer is heuristic, and the harbor layer is policy-shaped.
- Thresholds, labels, and harbor policies are still being tuned as part of the pilot.
