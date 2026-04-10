# SAFETY MODEL

Read [SYSTEM_OVERVIEW.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/SYSTEM_OVERVIEW.md) for the system-level frame and [ENGINE.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/ENGINE.md) for the live implementation details. This file is the policy boundary.

## Core principles

TCP is organized around four explicit constraints:

```math
\text{Recognition} \neq \text{Repair}
```

```math
\text{Similarity} \neq \text{Authorship}
```

```math
\text{Recognition without route} \rightarrow \text{criticality}
```

```math
\text{Recognition with harbor} \rightarrow \text{passage with provenance}
```

```math
\text{Generator miss} \rightarrow \text{explicit hold docket, not silent source fallback}
```

These are not slogans pasted onto the engine after the fact. They are the conditions under which the policy layer is allowed to operate.

## Generator safety boundary

The current default writer is Generator V2. That changes the safety boundary in one important way:

- the writer is allowed to miss
- the miss must be exposed explicitly
- the system is not allowed to hide that miss by quietly flattening back toward source and calling the result safe

In practice, that means a valid miss now appears as `generationDocket.status = held` with a visible hold class such as:

- `below-rewrite-bar`
- `hard-anchor-failure`
- `semantic-failure`
- `pathology`

That behavior is part of the safety model, not just the UX.

## Effective archive

The current build still uses the threshold grammar

```math
\Delta_C = C - D
```

```math
A_{\mathrm{effective}}(t)=
\begin{cases}
A_I,& \Delta_C \ge \theta\\
A_W,& \Delta_C < \theta
\end{cases}
```

but `C` and `D` are now derived from the live field state rather than fixed placeholder constants.

Institutional integrity is:

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

Custodial drift is:

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

The browser build currently keeps `theta = 0.2`.

`A_I` means institutional custody remains above the collapse threshold and continues to function as the effective archive. `A_W` means the custody delta has fallen below the collapse threshold and witness custody is functioning as the effective archive.

## Harbor library

The current implementation ships three harbor functions:

- `mirror.off`
  - provenance retention `= 0.95`
  - witness-load effect `= -0.18`
  - coordination overhead `= 0.22`
- `receipt.capture`
  - provenance retention `= 0.98`
  - witness-load effect `= -0.09`
  - coordination overhead `= 0.18`
- `provenance.seal`
  - provenance retention `= 0.99`
  - witness-load effect `= -0.05`
  - coordination overhead `= 0.12`

The selector is rule-based. It is a safety policy over a provenance-safe library, not a concealed optimization oracle.

## Harbor selection heuristic

The current selector is:

```text
if (A_effective = A_W or decision = criticality or Xi >= 0.60) and mirror is off:
    mirror.off
else if decision = passage:
    receipt.capture if routeAvailable else mirror.off
else if Pi >= 0.72 or Xi >= 0.52:
    mirror.off if mirror is off else receipt.capture
else if Delta_branch >= 0.42 or Pi >= 0.46:
    receipt.capture
else if badge = badge.holds:
    provenance.seal
else:
    receipt.capture
```

This is intentionally conservative. Criticality and witness-archive conditions bias the selector toward de-reflection and structured buffering rather than theatrical escalation.

## Reuse and burden

Group size is estimated as:

```math
m =
1 +
\operatorname{round}\left(
1.6\Pi +
0.7T +
1.1\Xi +
0.8\Delta_{\mathrm{branch}}
\right) +
\mathbf{1}_{A_{\mathrm{effective}} = A_W}
```

Solo cost per operator is:

```math
c_{s,1} =
0.16 +
0.34\Pi +
0.18T +
0.16\Xi +
0.12\Delta_{\mathrm{branch}} +
\alpha_A
```

with:

- `alpha_A = 0.12` if `A_effective = A_W`
- `alpha_A = 0.04` otherwise

Total solo burden is:

```math
E_{\mathrm{solo}} = m \cdot c_{s,1}
```

Shared harbor burden is:

```math
E_{\mathrm{harbor}} = c_{s,1} + \omega_h \log_2(m+1)
```

where `omega_h` is the selected harbor's coordination overhead.

Reuse gain is:

```math
\Delta E = \max(0, E_{\mathrm{solo}} - E_{\mathrm{harbor}})
```

Positive `Delta E` means the current harbor prevented entrants from paying the full isolated burden.

## Witness load and justice deficit

Witness load is estimated as:

```math
W =
\operatorname{clip}\left(
0.12 +
0.28\Pi +
0.14T +
0.20\Xi +
0.14\Delta_{\mathrm{branch}} +
\beta_A +
\gamma_h,
0,2\right)
```

with:

- `beta_A = 0.14` if `A_effective = A_W`, else `0.02`
- `gamma_h` = harbor-specific witness-load effect

Justice deficit is:

```math
J_{\Delta} =
\operatorname{clip}\left(
0.10 +
0.34\Xi +
0.22\Delta_{\mathrm{branch}} +
0.18\Pi +
\eta_A,
0,2\right)
```

with:

- `eta_A = 0.16` if `A_effective = A_W`
- `eta_A = 0.04` otherwise

These are heuristics, but they are declared heuristics. That matters. TCP is explicit about where it is measuring and where it is applying policy.

## Aperture boundary

`TD613 Aperture` now audits and registers the generated surface after candidate generation. In the default writer path it should:

- verify exact anchors
- verify semantic continuity
- surface warning signals
- register the landed counter-record

It should not silently co-author the passage, erase a strong candidate in favor of a flatter one, or suppress ordinary pressure by reenacting a selective-admissibility regime in software.

## Provenance constraint

A harbor is invalid if it lowers burden by destroying provenance.

The present build encodes that by using only harbor functions whose provenance-retention scores already satisfy:

```math
P(f) \ge 0.95
```

That is not yet a user-configurable constrained optimizer. It is a fixed safety floor over the shipping library.

## Safety consequences

TCP therefore avoids:

- automated authorship declarations
- interpreting route pressure as proof
- flattening uncanny residue into reassurance copy
- offering passage while leaving the route state buffered
- lowering witness burden by laundering provenance
- hiding a weak or broken write behind a near-source non-event

The safety model is not there to make the app sound serious. It is there to keep the app from pretending that stylometric legibility is the same thing as custodial care.
