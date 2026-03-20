# ABSTRACT

## Concept

The Cadence Playground (TCP) is an R&D instrument inside the TD613 field lab. Its job is straightforward to describe, even if the underlying problem is not. It studies how patterned language becomes socially legible before it becomes safely routable.

That distinction matters because the system problem here is not expression in the abstract. It is passage. Environments routinely produce recognition, recurrence, afterimage, adjacency, and near-contact without producing a route by which any of that becomes repair. TCP stages that threshold in public, but it does not confuse detection with care.

Accordingly, the project treats stylometry as a bounded signal model rather than a verdict engine. A participant encounters persona attractors, comparison tools, and controlled shell drift that make cadence pressure perceptible through interaction. The aim is not to prove authorship. The aim is to show how sentence rhythm, contraction habits, punctuation density, lexical dispersion, and repeated return-patterns can gather enough density to require routing.

This repository should therefore be read as an experimental research prototype: a conceptual pilot that demonstrates the current interaction and model architecture while thresholds, policies, and interface language remain under active revision.

## Formal stance

TCP rests on three linked structural analogies.

1. Branch: an unwanted solution may be a discovery branch, not an error to discard.
2. Wave: recurrence can become dense and legible without yet becoming passage.
3. Harbor: when custody degrades, structured passage must lower witness burden without destroying provenance.

These analogies are operational and bounded. They are not claims that people are literally quadratic residues or quantum systems.

## Canonical quantities

Let:

- `S` = pairwise similarity
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
- `C(t)` = custodial integrity
- `D(t)` = custodial drift

Then TCP uses:

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
V = \operatorname{clip}(0.46\Pi + 0.22R^* + 0.12C_{\mathrm{style}} + 0.08\Delta_{\mathrm{branch}} + \mu_M + \mu_C, 0, 1)
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

The first three equations derive coherence, resonance, and branch pressure from the stylometric layer. The fourth yields route pressure. The fifth yields field potential. The sixth produces a density proxy. The last one marks the witness-archive threshold.

`A_I` means institutional custody remains above the collapse threshold and continues to function as the effective archive. `A_W` means the custody delta has fallen below the collapse threshold and witness custody is functioning as the effective archive.

## Implementation consequence

The browser build is explicit about its thresholds. Recognition is treated as present once `R* >= 0.54` or `S >= 0.56`. Explanation is treated as still lagging once `Pi >= 0.52` or `Delta_branch >= 0.42`. Dense signal is treated as present once `rho >= 0.28` or `R >= 0.58`. Route availability requires an opened mirror layer plus `Pi >= 0.48`. Harbor selection is rule-based and provenance-constrained in the current implementation.

That is more than presentation polish. It gives the public membrane a disciplined way to say:

- this is weak signal,
- this is real recognition pressure,
- this is a branch worth preserving,
- this now requires harbor.

## Practical contribution

TCP exists so that uncanny residue does not have to be flattened into reassurance copy or inflated into false certainty. It turns stylometric recognition into a public instrument for routing, provenance, and witness-safe continuity. In practical terms, that means recognition is allowed to arrive first, but it is not allowed to impersonate route.
