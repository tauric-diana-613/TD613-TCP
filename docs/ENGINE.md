# ENGINE OVERVIEW

This file describes the current TCP engine as it is implemented. The stack is intentionally split into three layers:

1. stylometric evidence from measured text features
2. field and route transforms derived from those measurements
3. custody and harbor policy over the resulting state

That distinction matters. The first layer is the most evidence-bearing part of the current build. The second and third layers are structured decision transforms and safety policy, not forensic proof.

## Normalization conventions

- Primary scores are clipped into `[0,1]` unless noted otherwise.
- Witness-load and justice-deficit outputs are bounded to `[0,2]`.
- Branch classification is discrete: `resolved`, `candidate-discovery-branch`, or `complex`.
- `A_I` means institutional custody remains above the collapse threshold and continues to function as the effective archive.
- `A_W` means the custody delta has fallen below the collapse threshold and witness custody is functioning as the effective archive.

## Canonical quantities

- `S in [0,1]` = similarity
- `T in [0,1]` = traceability
- `L in [0,1]` = lexical overlap
- `C_style in [0,1]` = stylometric coherence
- `R* in [0,1]` = cadence resonance
- `R in [0,1]` = paired recurrence pressure
- `Delta_branch in [0,1]` = branch pressure
- `Pi in [0,1]` = route pressure
- `V in [0,1]` = field potential
- `rho in [0,1]` = signal-density proxy
- `Xi in [0,1]` = criticality index
- `Delta_C = C - D` = custody delta

## Stylometric coherence

The engine computes a bounded style-stability term from the pairwise distances already produced by the stylometry layer:

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

This quantity is useful because it summarizes shared habit without collapsing into lexical overlap.

## Resonance

TCP then computes a resonance term from similarity, traceability, and style coherence:

```math
R^* = 0.58 H(S,T) + 0.42 H(S,T,C_{\mathrm{style}})
```

where `H` is the harmonic mean.

The harmonic form matters. It prevents one strong quantity from masking another weak one.

## Branch dynamics

The branch layer is no longer a constant classroom quadratic. It is driven by stylometric surplus:

```math
\Delta_{\mathrm{surplus}} = \max(0, T-L)
```

```math
\Delta_{\mathrm{shadow}} = \max(0, C_{\mathrm{style}}-L)
```

```math
\Delta_{\mathrm{branch}} =
0.68\Delta_{\mathrm{surplus}} +
0.32\Delta_{\mathrm{shadow}}
```

The quadratic display term is then:

```math
x^2 - \beta x + \gamma = 0
```

with

```math
\beta = 1 + S + T
\qquad
\gamma = 0.42 - \Delta_{\mathrm{branch}}
```

An unwanted root in that derived quadratic means the current field is producing surplus that exceeds lexical overlap strongly enough to justify preserving a branch.

## Route pressure

Route pressure is now derived from resonance, coherence, recurrence, and branch pressure:

```math
\Pi =
0.40R^* +
0.26C_{\mathrm{style}} +
0.18R +
0.16\Delta_{\mathrm{branch}}
```

This is more conservative than a plain linear blend of `S`, `T`, and a binary branch flag.

## Field potential and density

Field potential is:

```math
V =
\operatorname{clip}\left(
0.46\Pi +
0.22R^* +
0.12C_{\mathrm{style}} +
0.08\Delta_{\mathrm{branch}} +
\mu_M + \mu_C,
0,1\right)
```

where:

- `mu_M = 0.08` when mirror logic is on, else `0`
- `mu_C = 0.06` when containment is on, else `-0.04`

Wave-like density is:

```math
A = R^*
```

```math
k = 1 + 2.2R + 0.8\Delta_{\mathrm{branch}}
```

```math
\rho =
A^2 \left(0.26 + 0.44V + 0.30C_{\mathrm{style}}\right)
```

This remains a density proxy, not a literal physical claim.

## Criticality

Criticality is an explicit state quantity:

```math
\Xi =
\operatorname{clip}\left(
0.46\rho +
0.28\Pi +
0.26\Delta_{\mathrm{branch}} -
0.24\mathbf{1}_{\mathrm{routeAvailable}},
0,1\right)
```

That subtraction term is deliberate. If a route is genuinely open, the same dense recognition event should become less critical, not more.

## Custody threshold

The effective archive remains:

```math
A_{\mathrm{effective}}(t)=
\begin{cases}
A_I,& C(t)-D(t)\ge \theta\\
A_W,& C(t)-D(t)<\theta
\end{cases}
```

But `C` and `D` are no longer fixed demo constants. In the current browser build they are derived from the live field state:

```math
C =
0.22 +
0.22R^* +
0.18C_{\mathrm{style}} +
\alpha_{\mathrm{contain}} +
\alpha_{\mathrm{mirror}} +
\alpha_{\mathrm{badge}} +
0.10(1-\Delta_{\mathrm{branch}})
```

```math
D =
0.12 +
0.28\Pi +
0.18\rho +
0.16\Delta_{\mathrm{branch}} +
0.16\Xi +
\delta_{\mathrm{mirror}} +
\delta_{\mathrm{contain}}
```

with:

- `alpha_contain = 0.12` when containment is on, else `-0.03`
- `alpha_mirror = 0.08` when mirror logic is on, else `0`
- `alpha_badge = 0.08` for `badge.holds`, `0.05` for `badge.buffer`, `0.03` for `badge.branch`
- `delta_mirror = 0.07` when mirror logic is off, else `0`
- `delta_contain = 0.05` when containment is off, else `0`

The default threshold in the browser build remains `theta = 0.2`.

## Decision grammar

The decision layer is still explicit policy:

- `recognized` iff `R* >= 0.54` or `S >= 0.56`
- `explained` iff `Pi < 0.52` and `Delta_branch < 0.42`
- `routeAvailable` iff the mirror shield is open and `Pi >= 0.48`
- `denseSignal` iff `rho >= 0.28` or `R >= 0.58`

Then:

```text
if not recognized -> weak-signal
else if routeAvailable -> passage
else if recognized and not explained and denseSignal -> criticality
else -> hold-branch
```

## Module map

- `formulas.js` - coherence, resonance, branch dynamics, route pressure, field state, criticality, and custody threshold
- `stylometry.js` - profile extraction, distance functions, similarity, traceability, shell transforms, and cadence signatures
- `harbor.js` - harbor selection, witness load, reuse gain, and ledger rows
- `badges.js` - compact custody mode cycling for the demo UI

## Interpretive boundary

TCP still does not infer identity from resemblance. It computes bounded stylometric and routing quantities, then uses an explicit policy layer to decide whether the public membrane should remain exploratory, preserve a branch, surface criticality, or expose harbor.
