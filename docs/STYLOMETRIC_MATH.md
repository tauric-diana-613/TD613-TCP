# STYLOMETRIC MATH

TCP treats stylometry as a **contact-pressure instrument**, not as an authorship verdict engine.

## Feature families

1. **Lexical overlap** — surface vocabulary shared across samples.
2. **Sentence-shape distance** — divergence in average sentence length.
3. **Punctuation distance** — divergence in pause and clause rhythm.
4. **Contraction distance** — divergence in compression / informality habits.
5. **Lexical-dispersion distance** — divergence in repetition versus novelty.
6. **Recurrence pressure** — repeated bigrams, line-break density, and return-pattern intensity.

## Comparison model

Let `S(a,b)` be pairwise similarity and `T(a,b)` be traceability.

```math
S(a,b)=w_1L+w_2(1-d_s)+w_3(1-d_p)+w_4(1-d_c)+w_5(1-d_l)+w_6(1-d_r)
```

where:
- `L` = lexical Jaccard overlap
- `d_s` = sentence distance
- `d_p` = punctuation distance
- `d_c` = contraction distance
- `d_l` = lexical-dispersion distance
- `d_r` = recurrence distance

Traceability privileges the habits most likely to survive paraphrase:

```math
T(a,b)=u_1(1-d_s)+u_2(1-d_p)+u_3(1-d_c)+u_4(1-d_r)
```

Recurrence pressure is a bounded proxy for how strongly patterned return is gathering:

```math
R=rac{1}{3}(B+L+P)
```

where:
- `B` = repeated-bigram pressure
- `L` = line-break pressure
- `P` = punctuation-return pressure

## Operational reading

- High `S` + high `T` = strong stylometric resemblance worth routing.
- High `R` without route = recognition pressure rising toward criticality.
- Low `S` + low `T` = weak signal, likely noise.
- High `R` + low explanation = preserve the branch until routing catches up.
