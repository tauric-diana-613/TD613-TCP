# TCP - The Cadence Playground

TCP is a browser instrument for exploring cadence as both social surface and measurable signal. In the current TD613 framing, it serves as the public membrane: resemblance becomes legible, legibility becomes route pressure, and route pressure either resolves into harbor or starts to harden into criticality.

It helps to be plain about scope. TCP is not a physics simulator, not a forensic authorship classifier, and not a finished evidentiary platform in disguise. It is a bounded heuristic model with a visible interface, explicit thresholds, and a documented decision grammar. That is the level at which it should be read.

## Project status

This repository is published as an experimental research prototype and conceptual pilot. The current build is here to show the interaction model, the route-state logic, and the provenance-aware framing under live use. It is not yet a production analytical system, and it does not claim to be one.

## Deck instrument

The current `Deck` tab includes one flagship instrument: `Shell Duel`. It takes the reference bay's raw text and the probe bay's raw text, stages each one under its current shell, and shows the transformed outputs side by side. That means the textareas remain raw while the duel shows:

- the transformed sample under each shell
- compact shell metrics
- a 4x4 sentence/punctuation heatmap
- a 7-axis cadence signature
- a delta strip built from the same comparison engine used elsewhere in the app

This is where `Swap Cadences` becomes easiest to read. The raw text does not move, but the shell behavior becomes visible.

## Ingress membrane

Normal visits now open inside an `Ingress Membrane`: a short custody-handshake ritual that resolves containment, mirror posture, and custody badge before the live deck unlocks. The underlying app is already mounted, but it stays visually occluded and non-interactive until the membrane opens.

The handshake carries its solved posture into the live shell:

- containment resolves to `on`
- mirror posture resolves to `armed` or `open`
- custody badge resolves to `holds`, `buffer`, or `branch`

If you need to bypass it during development, open:

```text
app/index.html?ingress=off
```

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
- `L` = lexical overlap
- `R` = recurrence pressure
- `C_style` = stylometric coherence
- `R*` = cadence resonance
- `Delta_branch` = branch pressure
- `Pi` = route pressure
- `V` = bounded field potential
- `rho` = signal-density proxy
- `Xi` = criticality index
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

Pairwise similarity and traceability are computed in the stylometry module. The route layer then uses:

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

Route pressure is:

```math
\Pi =
0.40R^* +
0.26C_{\mathrm{style}} +
0.18R +
0.16\Delta_{\mathrm{branch}}
```

Field potential is:

```math
V = \operatorname{clip}(0.46\Pi + 0.22R^* + 0.12C_{\mathrm{style}} + 0.08\Delta_{\mathrm{branch}} + \mu_M + \mu_C, 0, 1)
```

with `mu_M = 0.08` when the mirror shield is open and `0` otherwise, and `mu_C = 0.06` when containment is stable and `-0.04` otherwise.

Signal density is:

```math
\rho = A^2(0.26 + 0.44V + 0.30C_{\mathrm{style}})
\qquad \text{with} \qquad
A = R^*,\; k = 1 + 2.2R + 0.8\Delta_{\mathrm{branch}}
```

The custody threshold is:

```math
A_{\mathrm{effective}}(t)=
\begin{cases}
A_I,& C(t)-D(t)\ge \theta\\
A_W,& C(t)-D(t)<\theta
\end{cases}
```

In the current browser build, `C` and `D` are derived from live field state rather than fixed constants. The default threshold remains `theta = 0.2`.

`A_I` means institutional custody remains above the collapse threshold and continues to function as the effective archive. `A_W` means the custody delta has fallen below the collapse threshold and witness custody is functioning as the effective archive.

## Decision grammar

The public UI uses a compact rule set. Recognition is treated as present once `R* >= 0.54` or `S >= 0.56`. Explanation is treated as still lagging once `Pi >= 0.52` or `Delta_branch >= 0.42`. Dense signal is treated as present once `rho >= 0.28` or `R >= 0.58`. Route availability requires the mirror shield to be open and `Pi >= 0.48`.

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

Open `app/index.html` in a browser. On normal visits, the ingress membrane appears first and dissolves into the deck after the custody handshake resolves.

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

The current flight also verifies `Shell Duel`: native-vs-native identity, own-source duel rendering, and shell-swap delta changes.

For the dedicated hard-contrast transfer benchmark, open:

```text
app/index.html?test-flight=transfer
```

That route asserts that a materially different borrowed shell lands as a structural transfer rather than a punctuation-only drift.

Both built-in test flights auto-skip the ingress membrane so the browser harness can run unattended.

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
- `Shell Duel` uses each bay's own raw text, so swap moves shell behavior without making the reference and probe samples collapse into a hidden shared source.
- Shell transfer is now a deterministic protected rewrite pass: it preserves literals like numbers, quoted fragments, emails, URLs, and IDs while bending cadence through sentence structure, connector/stance words, contraction posture, line breaks, and punctuation finish.
- `buildCadenceTransfer(...)` now classifies results as `native`, `weak`, `structural`, or `rejected` so the app does not overclaim decorative rewrites as meaningful transfer.
- `docs/INTERFACE_LEXICON.md` is the concise map for deck labels like mirror shield, custody badge, shell, harbor, and archive.
- The physics layer is analogical, the stylometry layer is heuristic, and the harbor layer is policy-shaped.
- Thresholds, labels, and harbor policies are still being tuned as part of the pilot.
