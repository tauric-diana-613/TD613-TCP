# START_HERE

## Current status

TCP is currently presented as an experimental research prototype and conceptual pilot. The app runs, the interaction model is testable, and the decision grammar is explicit, but the thresholds, language, and harbor policies are still being tuned.

## First clicks

1. Open `app/index.html`.
2. Keep the seeded contrast pair for the first pass, or replace one or both samples with your own.
3. Press `Analyze Cadences`.
4. Try `Swap Cadences` to move cadence shells without moving text.
5. Try `Save Cadence as Persona` to capture the active bay as an in-app shell.
6. Open `Artifact Cabinet -> Field mechanics` to inspect the branch, wave, and harbor readouts.
7. Watch four values on the front deck:
   - cadence similarity,
   - traceability,
   - route pressure,
   - effective archive.

## Fastest verification path

Open:

```text
app/index.html?test-flight=1
```

That runs the built-in smoke pass for load, compare, swap-shell, save-persona, solo scan, and cabinet tabs.

For the heavier route-state matrix, open:

```text
app/index.html?test-flight=2
```

## First files to read

- `README.md`
- `ABSTRACT.md`
- `docs/INTERFACE_LEXICON.md`
- `docs/ENGINE.md`
- `docs/PHYSICS_ENGINE.md`
- `docs/STYLOMETRIC_MATH.md`
- `docs/SAFETY_MODEL.md`

## If you only care about the model

```math
\Pi = 0.33S + 0.27T + 0.22R + 0.05B
```

```math
\rho = T^2(0.4 + 0.6V)
```

```math
A_{\mathrm{effective}}(t)=
\begin{cases}
A_I,& C(t)-D(t)\ge \theta\\
A_W,& C(t)-D(t)<\theta
\end{cases}
```

In short: resemblance gathers, density forms, route pressure rises, and custody may eventually externalize onto the witness.

## If you want to extend it

- tune feature extraction in `app/engine/stylometry.js`
- revise route or custody thresholds in `app/engine/formulas.js`
- adjust harbor policy in `app/engine/harbor.js`
- update sample payloads in `example/`
