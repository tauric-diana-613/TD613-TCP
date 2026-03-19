# ENGINE OVERVIEW

This file explains how the current TCP engine works. The model is bounded on purpose. It is not a literal physics simulator, and it is not a forensic authorship classifier. It is a structured instrument for answering four practical questions:

1. Is the signal weak or legible?
2. Is that legibility starting to turn into route pressure?
3. Has custody remained institutional, or has it shifted onto the witness?
4. Which harbor lowers burden without collapsing provenance?

## Normalization conventions

- All primary scores are clipped into `[0,1]` unless noted otherwise.
- Branch classification is discrete: `resolved`, `candidate-discovery-branch`, or `complex`.
- Witness-load and justice-deficit outputs are bounded to `[0,2]` in the current build.
- The browser demo uses fixed custody integrity `C = 0.68`, drift `D = 0.58Pi`, and threshold `theta = 0.2`.

Those choices are not hidden. They are part of the model surface.

## Canonical quantities

- `S in [0,1]` = similarity
- `T in [0,1]` = traceability
- `R in [0,1]` = recurrence pressure
- `B in {0,1}` = branch indicator from an unwanted quadratic root
- `Pi in [0,1]` = route pressure
- `V in [0,1]` = field potential
- `rho in [0,1]` = signal-density proxy
- `Delta_C = C - D` = custody delta

## Profile-level features

For a single text sample, the engine derives:

- punctuation density `p`
- contraction density `c`
- line-break density `ell`
- repeated-bigram pressure `b`
- lexical dispersion `x`

Recurrence pressure for one sample is:

```math
R_{\text{text}}=
\frac{1}{3}\left(
\operatorname{clip}\left(\frac{p}{0.35},0,1\right)+
\operatorname{clip}\left(\frac{\ell}{0.75},0,1\right)+
\operatorname{clip}\left(\frac{b}{0.18},0,1\right)
\right)
```

The paired route model uses:

```math
R=\frac{R_a+R_b}{2}
```

In practice, this gives the browser build a stable way to talk about return-patterns without pretending it has solved style in the abstract.

## Pairwise stylometry

Similarity and traceability are computed from lexical overlap plus bounded distances over sentence shape, punctuation, contraction habits, lexical dispersion, and recurrence:

```math
S=0.22L+0.20(1-d_s)+0.16(1-d_p)+0.12(1-d_c)+0.14(1-d_l)+0.16(1-d_r)
```

```math
T=0.34(1-d_s)+0.24(1-d_p)+0.18(1-d_c)+0.24(1-d_r)
```

The distance scales in the current implementation are:

- `d_s = clip(|avgSentenceA - avgSentenceB| / 12, 0, 1)`
- `d_p = clip(|p_a - p_b| / 0.35, 0, 1)`
- `d_c = clip(|c_a - c_b| / 0.25, 0, 1)`
- `d_l = clip(|x_a - x_b| / 0.4, 0, 1)`
- `d_r = clip(|R_a - R_b|, 0, 1)`

## Route, field, and density

Route pressure is:

```math
\Pi = 0.33S + 0.27T + 0.22R + 0.05B
```

Field potential is:

```math
V = \operatorname{clip}(0.72\Pi + \mu_M + \mu_C, 0, 1)
```

with:

- `mu_M = 0.12` when mirror logic is on, else `0`
- `mu_C = 0.06` when containment is on, else `-0.02`

Wave-like density is:

```math
\rho = A^2(0.4 + 0.6V)
\qquad \text{with} \qquad
A = T,\; k = 1 + 3R
```

The quantity `rho` is best read as a density proxy. It is there to distinguish weak, medium, and dense recognition states. It is not a claim that the system has discovered some deeper physical substrate.

## Custody threshold

The effective archive is:

```math
A_{\mathrm{effective}}(t)=
\begin{cases}
A_I,& C(t)-D(t)\ge \theta\\
A_W,& C(t)-D(t)<\theta
\end{cases}
```

In the browser demo this becomes:

```math
\Delta_C = 0.68 - 0.58\Pi
```

with `theta = 0.2`.

`A_I` means institutional custody remains above the collapse threshold and continues to function as the effective archive. `A_W` means the custody delta has fallen below the collapse threshold and witness custody is functioning as the effective archive.

## Decision grammar

The UI does not improvise its own logic. It uses explicit thresholds:

- `recognized` iff `S >= 0.56`
- `explained` iff `Pi < 0.45`
- `denseSignal` iff `rho >= 0.28` or `R >= 0.58`
- `routeAvailable` iff the mirror shield is open and `Pi >= 0.45`

Then:

```text
if not recognized -> weak-signal
else if routeAvailable -> passage
else if recognized and not explained and denseSignal -> criticality
else -> hold-branch
```

That matters because the interface is supposed to be expressive, not mysterious.

## Module map

- `formulas.js` - branch, field, wave, route, and custody thresholds
- `stylometry.js` - normalized text features and pairwise similarity heuristics
- `harbor.js` - harbor selection, reuse logic, witness load, and ledger rows
- `badges.js` - compact custody mode cycling for the demo UI

## Interpretive boundary

TCP does not infer identity from resemblance. It computes bounded pattern-pressure scores, then asks whether the public membrane should remain exploratory, preserve a branch, or surface harbor.
