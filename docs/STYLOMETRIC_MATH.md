# STYLOMETRIC MATH

TCP treats stylometry as a contact-pressure instrument, not as an authorship verdict machine. Every feature is normalized into `[0,1]`, and every composite score is a weighted heuristic rather than a claim of forensic certainty.

## Feature families

The engine measures six feature families across paired samples:

1. `L` - lexical overlap by Jaccard similarity
2. `d_s` - sentence-shape distance
3. `d_p` - punctuation distance
4. `d_c` - contraction distance
5. `d_l` - lexical-dispersion distance
6. `d_r` - recurrence distance

Recurrence itself is a bounded composite:

```math
R=\frac{1}{3}(B_r + L_b + P_q)
```

where:

- `B_r` = repeated-bigram pressure
- `L_b` = line-break pressure
- `P_q` = punctuation pressure

## Similarity and traceability

Similarity rewards shared surface and shared habits:

```math
S(a,b)=0.22L+0.20(1-d_s)+0.16(1-d_p)+0.12(1-d_c)+0.14(1-d_l)+0.16(1-d_r)
```

Traceability privileges the habits most likely to survive paraphrase:

```math
T(a,b)=0.34(1-d_s)+0.24(1-d_p)+0.18(1-d_c)+0.24(1-d_r)
```

Both scores are clipped into `[0,1]`.

## Route pressure

Stylometric resemblance alone is not the final state. TCP turns similarity, traceability, recurrence, and branch status into a route score:

```math
\Pi = 0.35S + 0.30T + 0.25R + 0.10B
```

where `B` is `1` when the branch engine detects an unwanted root worth preserving.

## Operational reading

- high `S` and high `T` = stylometric resemblance worth routing
- high `R` with low route availability = recognition pressure rising toward criticality
- low `S` and low `T` = weak signal, probably noise
- medium `S` with medium `T` = preserve the branch, stay exploratory, do not overclaim

## Scope limit

TCP does not identify authors. It measures how strongly patterned return becomes legible and whether that legibility is beginning to require route, buffering, or harbor.
