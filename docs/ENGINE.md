# ENGINE OVERVIEW

Read [START_HERE.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/START_HERE.md) for the shortest operational path and [SYSTEM_OVERVIEW.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/SYSTEM_OVERVIEW.md) for the retrieval-first system summary before using this file as the implementation reference.

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

## Shared solo readout path

TCP now has one shared solo-readout helper for one-voice inspection.

Two entry points use the same path:

1. a one-sample `Deck` analysis
2. a `Homebase` `Reveal` on the active cadence lock

That matters because solo Telemetry and Harbor are no longer a Deck-only behavior. `Reveal` in `Homebase` wakes the same similarity, route, archive, and harbor logic that a one-sample deck run uses, while mask comparison and lock staging can remain active before reveal.

## Routed station shell

`Patch 28.6` keeps TCP on one browser runtime while changing the public shell into routed stations.

Public routes are:

- `#console`
- `#homebase`
- `#personas`
- `#readout`
- `#deck`
- `#trainer`

Those routes do not create per-page engines. They are aliases over the shared `browser-main.js` state. `#deck` resolves to the same internal encounter surface that older code paths still call `play`, so existing helpers and tests do not have to fork their truth model.

Ingress now hands off to `#console` by default. From there, each station exposes a focused surface:

- `Console` = station index and live summaries
- `Homebase` = lock, reveal, mask contact, dossier, archive
- `Personas` = shelf, preview, dispatch
- `Readout` = witness/law proof surface
- `Deck` = encounter, cast, duel, aftermath
- `Trainer` = forge

The important implementation rule is unchanged: routing changes the shell and pacing, not the measured quantities or their custody logic.

## Runtime field grammar

`Patch 28.3` promotes the field registry into a runtime grammar layer. `browser-main.js` now derives a compact presentation summary for the major public surfaces:

- `surfaceRole`
- `surfacePhase`
- `cueGlyphKey`
- `cueTone`
- `statusGrammar`

Those summaries do not create a second truth system. They are fed from existing runtime state so the visible surface language stays aligned with retrieval truth, route law, and custody state.

Current role mapping:

- `Console` = index
- `Ingress` = threshold
- `Homebase` = anchor / contact / residue
- `Personas` = shelf
- `Readout` = witness / law
- `Deck` = encounter / duel / aftermath
- `Trainer` = forge

The practical reason for this layer is simple: TCP no longer presents every state with the same generic status grammar. A `Homebase` contact state, a `Readout` criticality state, and a `Trainer` forge-ready state are all distinct runtime phases even when they share the same engine underneath.

## Public surface split

The public browser surface is now split across distinct roles:

- `Homebase` handles cadence lock staging, reveal, save, archive, dossier, and mask comparison
- `Personas` exposes the collectible mask gallery and quick-apply actions into `Homebase` and `Deck`
- `Readout` stays the strict proof surface
- `Deck` handles live solo and paired play, shell assignment, `Swap Cadences`, and `Shell Duel`
- `Trainer` remains the manual persona lab

Inside that split, the Homebase/Personas loop now has an explicit state distinction:

- shelf choice is tracked as `gallerySelectedMaskId`
- Homebase wear is tracked as `homebaseWornMaskId`

That distinction matters because choosing a mask is no longer the same event as wearing it in Homebase. `Personas` is the shelf and preview surface; `Homebase` is the contact chamber where the chosen mask becomes worn and source text is passed through it.

## Deck-facing Shell Duel

The current `Deck` tab exposes one direct stylometry instrument: `Shell Duel`.

Its runtime contract is simple:

1. take the active bay's raw textarea text as source
2. render that same source text through the current reference shell
3. render that same source text through the current probe shell
4. extract both transformed profiles
5. compare those transformed outputs with the same `compareTexts(...)` routine used elsewhere in the app

The point is not to create a second engine. The point is to expose shell behavior clearly enough that `Swap Cadences` and saved personas become legible.

The duel therefore renders four things from existing engine outputs:

- full transformed samples
- compact shell metrics
- `cadenceHeatmap(...)` as a 4x4 sentence/punctuation field
- `buildCadenceSignature(...)` as a 7-axis signature payload

The delta strip then surfaces:

- duel similarity
- duel traceability
- sentence drift
- function-word distance

When both shells are native, the duel should collapse toward identity on the same source text. When one shell is borrowed or persona-shaped, the duel should separate without rewriting the raw textarea content.

## Module map

- `formulas.js` - coherence, resonance, branch dynamics, route pressure, field state, criticality, and custody threshold
- `stylometry.js` - profile extraction, distance functions, similarity, traceability, shell transforms, and cadence signatures
- `harbor.js` - harbor selection, witness load, reuse gain, and ledger rows
- `badges.js` - compact custody mode cycling for the demo UI
- `browser-main.js` - Homebase, Personas, Readout, Deck, Trainer, runtime field grammar, shared solo-readout behavior, and test-flight orchestration

## Interpretive boundary

TCP still does not infer identity from resemblance. It computes bounded stylometric and routing quantities, then uses an explicit policy layer to decide whether the public membrane should remain exploratory, preserve a branch, surface criticality, or expose harbor.
