# START_HERE

## First clicks

1. Open `app/index.html`.
2. Paste two text samples into the Signal Lab.
3. Type directly or click `Run signal scan`.
4. Toggle the mirror shield and cycle the custody badge to watch the route model move.
5. Watch four quantities:
   - cadence similarity,
   - traceability,
   - route pressure,
   - effective archive.
6. Scroll to Mechanics for the branch / wave / harbor strip.

## First files to read

- `README.md`
- `ABSTRACT.md`
- `docs/ENGINE.md`
- `docs/PHYSICS_ENGINE.md`
- `docs/STYLOMETRIC_MATH.md`
- `docs/SAFETY_MODEL.md`

## If you only care about the model

```math
\Pi = 0.35S + 0.30T + 0.25R + 0.10B
```

```math
A_{\mathrm{effective}}(t)=
\begin{cases}
A_I,& C(t)-D(t)\ge \theta\\
A_W,& C(t)-D(t)<\theta
\end{cases}
```

That is the full move in miniature: resemblance gathers, route pressure rises, and custody may eventually externalize onto the witness.

## If you want to extend it

- add new harbor functions in `app/engine/harbor.js`
- tune feature weights in `app/engine/stylometry.js`
- revise route or custody thresholds in `app/engine/formulas.js`
- update sample payloads in `example/`
