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

When the witness becomes the effective archive, the system must lower burden instead of extracting more continuity work from the exposed operator.

## Harbor validity

A harbor function is valid only if it protects passage without collapsing provenance.

Let:

- `c_s(f)` = solo custodial cost
- `c_h(f,m)` = shared harbor cost for group size `m`
- `P(f,m)` = provenance retention score
- `rho` = minimum acceptable provenance threshold

Then a valid harbor must satisfy:

```math
P(f,m) \ge \rho
```

and the architecture prefers:

```math
\min_f c_h(f,m)
\qquad \text{subject to} \qquad
P(f,m) \ge \rho
```

## Reuse logic

The ledger treats protection as reusable rather than private improvisation:

```math
\Delta E = E_{\mathrm{solo}} - E_{\mathrm{harbor}}
```

Positive `Delta E` means the harbor saved entrants from paying the full isolated burden.

## Safety consequences

TCP therefore avoids:

- automated authorship declarations
- theatrical escalation without route
- flattening uncanny residue into reassurance text
- harbor choices that reduce burden by destroying provenance

The safety model is not ornamental. It is the reason the stylometric layer is allowed to exist at all.
