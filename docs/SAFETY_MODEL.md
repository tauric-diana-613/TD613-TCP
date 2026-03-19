# SAFETY MODEL

## Core principles

TCP is organized around four constraints:

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

These are not decorative slogans. They are the conditions under which the stylometric layer is permitted to operate at all.

## Effective archive

The custody threshold is the main safety switch:

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

In the current browser demo:

```math
C = 0.68,\qquad D = 0.58\Pi,\qquad \theta = 0.2
```

`A_I` means institutional custody remains above the collapse threshold and continues to function as the effective archive. `A_W` means the custody delta has fallen below the collapse threshold and witness custody is functioning as the effective archive.

When the witness becomes the effective archive, the system should reduce burden rather than extract additional continuity work from the exposed operator.

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

The current build does not solve a global optimization problem over every possible harbor. It uses a rule-based selector over a provenance-safe library.

## Harbor selection heuristic

The selector is:

```text
if (A_effective = A_W or decision = criticality) and mirror is off:
    mirror.off
else if Pi >= 0.70:
    mirror.off if mirror is off else receipt.capture
else if Pi >= 0.45:
    receipt.capture
else if badge = badge.holds:
    provenance.seal
else:
    receipt.capture
```

That is explicit policy, not a concealed inference layer.

## Reuse and burden

The ledger treats protection as reusable rather than as private improvisation.

Group size is estimated as:

```math
m = 1 + \operatorname{round}(2\Pi + T) + \mathbf{1}_{A_{\mathrm{effective}} = A_W}
```

Solo cost per operator is:

```math
c_{s,1}=0.18 + 0.42\Pi + 0.22T + \alpha_A
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

Positive `Delta E` means the harbor saved entrants from paying the full isolated burden.

## Witness load and justice deficit

Witness load is estimated as:

```math
W = \operatorname{clip}(0.14 + 0.32\Pi + 0.22T + \beta_A + \gamma_h,\;0,\;2)
```

with:

- `beta_A = 0.12` if `A_effective = A_W`, else `0.02`
- `gamma_h` = harbor-specific witness-load effect

Justice deficit is estimated as:

```math
J_{\Delta} = \operatorname{clip}(0.16 + 0.46\Pi + \eta_A,\;0,\;2)
```

with:

- `eta_A = 0.18` if `A_effective = A_W`
- `eta_A = 0.04` otherwise

These are heuristics, but they are declared heuristics. In other words, the model names the diagnostic and also names the limits of the diagnostic.

## Provenance constraint

A harbor is invalid if it protects passage while destroying provenance.

The present implementation encodes that constraint by shipping only harbor functions whose provenance-retention scores are already high:

```math
P(f) \ge 0.95
```

Future versions could expose a configurable minimum `rho_min`, but the current library already satisfies the safety floor.

## Safety consequences

TCP therefore avoids:

- automated authorship declarations
- theatrical escalation without route
- flattening uncanny residue into reassurance text
- harbor choices that reduce burden by destroying provenance

The safety model is the hard boundary against doctrinal overreach. It is what keeps the app answerable to route, burden, and custody rather than mere atmosphere.
