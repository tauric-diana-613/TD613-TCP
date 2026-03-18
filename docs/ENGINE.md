# ENGINE OVERVIEW

TCP uses a bounded signal-field-harbor model. The engine is not a literal physics simulator and not a forensic authorship classifier. It is a structured instrument for answering four questions:

1. Is the signal weak or legible?
2. Is legibility turning into route pressure?
3. Has custody remained institutional or shifted onto the witness?
4. Which harbor lowers burden without collapsing provenance?

## Canonical quantities

- `S in [0,1]` = similarity
- `T in [0,1]` = traceability
- `R in [0,1]` = recurrence pressure
- `B in {0,1}` = branch indicator from an unwanted quadratic root
- `Pi in [0,1]` = route pressure
- `V in [0,1]` = field potential
- `rho in [0,1]` = signal density proxy
- `Delta_C = C - D` = custody delta

The engine computes:

```math
\Pi = 0.35S + 0.30T + 0.25R + 0.10B
```

```math
V = \operatorname{clip}(0.72\Pi + \mu_M + \mu_C, 0, 1)
```

```math
\rho = A^2(0.4 + 0.6V)
\qquad \text{with} \qquad
A = T,\; k = 1 + 3R
```

```math
A_{\mathrm{effective}}(t)=
\begin{cases}
A_I,& C(t)-D(t)\ge \theta\\
A_W,& C(t)-D(t)<\theta
\end{cases}
```

## Module map

- `formulas.js` - branch, field, wave, route, and custody thresholds
- `stylometry.js` - normalized text features and pairwise similarity heuristics
- `harbor.js` - harbor selection, reuse logic, witness load, and ledger rows
- `badges.js` - compact custody mode cycling for the demo UI

## Decision grammar

The UI does not invent its own route logic. It asks the engine for:

1. stylometric features,
2. branch status,
3. field potential and density,
4. route pressure,
5. effective archive,
6. harbor recommendation,
7. ledger preview.

This keeps the shell expressive while the model stays explicit.
