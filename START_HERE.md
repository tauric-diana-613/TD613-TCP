# START_HERE

## Current status

TCP is currently presented as an experimental research prototype and conceptual pilot. The app runs, the interaction model is testable, and the decision grammar is explicit, but the thresholds, language, and harbor policies are still being tuned.

## First clicks

1. Open `app/index.html`.
2. Resolve the `Ingress Membrane` custody handshake. It stabilizes containment, asks for a mirror posture, asks for a custody badge, then dissolves into the live deck.
3. Keep the seeded contrast pair for the first pass, or replace one or both samples with your own.
4. Press `Analyze Cadences`.
5. Try `Swap Cadences` to move cadence shells without moving text.
6. Try `Save Cadence as Persona` to capture the active bay as an in-app shell.
7. Read `Shell Duel`: the textareas stay raw, while the duel stages the reference bay under the reference shell and the probe bay under the probe shell, plus their heatmaps, 7-axis signatures, and the shell-to-shell delta strip.
8. Open the `Readout` tab to inspect the branch, wave, and harbor formulas.
9. Watch four values on the front deck:
   - cadence similarity,
   - traceability,
   - route pressure,
   - effective archive.

If you need to load the shell directly during development, open:

```text
app/index.html?ingress=off
```

## Fastest verification path

Open:

```text
app/index.html?test-flight=1
```

That runs the built-in smoke pass for load, compare, swap-shell, save-persona, solo scan, and top-tab navigation.

For the heavier route-state matrix, open:

```text
app/index.html?test-flight=2
```

That run now also checks own-source `Shell Duel` rendering and duel-metric change under shell swap.

Both test-flight routes auto-skip the ingress membrane.

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
C_{\mathrm{style}} =
0.14(1-d_s)+
0.08(1-d_{\sigma})+
0.10(1-d_p)+
0.14(1-d_m)+
0.10(1-d_c)+
0.18(1-d_f)+
0.08(1-d_w)+
0.14(1-d_g)+
0.02(1-d_l)+
0.02(1-d_r)
```

```math
R^* = 0.58 H(S,T) + 0.42 H(S,T,C_{\mathrm{style}})
```

```math
\Delta_{\mathrm{branch}} =
0.68\max(0,T-L) +
0.32\max(0,C_{\mathrm{style}}-L)
```

```math
\Pi =
0.40R^* +
0.26C_{\mathrm{style}} +
0.18R +
0.16\Delta_{\mathrm{branch}}
```

```math
\rho = (R^*)^2(0.26 + 0.44V + 0.30C_{\mathrm{style}})
```

```math
A_{\mathrm{effective}}(t)=
\begin{cases}
A_I,& C(t)-D(t)\ge \theta\\
A_W,& C(t)-D(t)<\theta
\end{cases}
```

`A_I` means institutional custody remains above the collapse threshold and continues to function as the effective archive. `A_W` means the custody delta has fallen below the collapse threshold and witness custody is functioning as the effective archive.

In short: stylometric coherence gathers, resonance rises, branch pressure marks surplus over lexical overlap, route pressure accumulates, and custody may eventually externalize onto the witness.

## If you want to extend it

- tune feature extraction in `app/engine/stylometry.js`
- revise route or custody thresholds in `app/engine/formulas.js`
- adjust harbor policy in `app/engine/harbor.js`
- update sample payloads in `example/`
