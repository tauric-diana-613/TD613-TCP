# STYLOMETRIC MATH

TCP treats stylometry as a contact-pressure instrument, not as an authorship verdict machine. Every feature is normalized into `[0,1]`, and every composite score is a weighted heuristic. That wording is deliberate. The current build is meant to expose patterned return and route pressure, not to deliver forensic certainty.

## Tokenization and sentence splitting

The current implementation:

- lowercases text,
- normalizes curly apostrophes and long dashes,
- tokenizes with `[a-z0-9']+`,
- splits sentences on terminal punctuation plus whitespace or on line breaks.

This is a simple browser-side pipeline. It is not elegant for its own sake, but it is inspectable, reproducible, and easy to reason about.

## Feature families

For each text, the engine computes:

1. `p` - punctuation density
2. `c` - contraction density
3. `ell` - line-break density
4. `b` - repeated-bigram pressure
5. `x` - lexical dispersion
6. `R_text` - recurrence pressure

where:

```math
p = \frac{\#\{\text{punctuation marks}\}}{\max(\text{word count},1)}
```

```math
c = \frac{\#\{\text{tokens containing apostrophes}\}}{\max(\text{word count},1)}
```

```math
\ell = \frac{\#\{\text{line breaks}\}}{\max(\text{sentence count},1)}
```

```math
b = \frac{\text{repeated bigram mass}}{\max(\text{word count}-1,1)}
```

Lexical dispersion is:

```math
x = 0.4u + 0.3p_r + 0.3n
```

with:

- `u` = unique-token ratio
- `p_r` = predictability `= 1 - repeated token mass / word count`
- `n` = singleton-type ratio

Recurrence pressure is:

```math
R_{\text{text}}=
\frac{1}{3}\left(
\operatorname{clip}\left(\frac{p}{0.35},0,1\right)+
\operatorname{clip}\left(\frac{\ell}{0.75},0,1\right)+
\operatorname{clip}\left(\frac{b}{0.18},0,1\right)
\right)
```

Those divisors are demo-scale normalizers. They are there to keep the browser model bounded and legible. They are not universal constants.

## Pairwise comparison

Given texts `a` and `b`, lexical overlap is the token-set Jaccard score:

```math
L = \frac{|W_a \cap W_b|}{|W_a \cup W_b|}
```

The bounded distances are:

```math
d_s = \operatorname{clip}\left(\frac{|s_a-s_b|}{12},0,1\right)
```

```math
d_p = \operatorname{clip}\left(\frac{|p_a-p_b|}{0.35},0,1\right)
```

```math
d_c = \operatorname{clip}\left(\frac{|c_a-c_b|}{0.25},0,1\right)
```

```math
d_l = \operatorname{clip}\left(\frac{|x_a-x_b|}{0.4},0,1\right)
```

```math
d_r = \operatorname{clip}\left(|R_a-R_b|,0,1\right)
```

where `s_a` and `s_b` are average sentence lengths.

Similarity rewards both shared lexicon and shared habits:

```math
S(a,b)=0.22L+0.20(1-d_s)+0.16(1-d_p)+0.12(1-d_c)+0.14(1-d_l)+0.16(1-d_r)
```

Traceability privileges the habits most likely to survive paraphrase:

```math
T(a,b)=0.34(1-d_s)+0.24(1-d_p)+0.18(1-d_c)+0.24(1-d_r)
```

The paired recurrence term used downstream is:

```math
R=\frac{R_a+R_b}{2}
```

All three outputs are clipped into `[0,1]`.

## Route pressure

Stylometric resemblance is not the last step. TCP turns similarity, traceability, recurrence, and branch status into a route score:

```math
\Pi = 0.33S + 0.27T + 0.22R + 0.05B
```

where `B = 1` when the branch engine detects an unwanted root worth preserving.

## Cadence shells

Persona shells do not swap text. They apply bounded offsets to the cadence profile currently occupying a bay.

For a shell with controls `(sent, cont, punc)`, the current implementation applies:

```math
\Delta s = 1.75 \cdot sent
```

```math
\Delta c = 0.028 \cdot cont
```

```math
\Delta p = 0.022 \cdot punc
```

```math
\Delta \ell = 0.04 \cdot sent
```

```math
\Delta x = 0.008 \cdot sent - 0.004 \cdot punc
```

It then recomputes recurrence from the adjusted punctuation and line-break terms while preserving repeated-bigram pressure from the original text. This is a shell model. It is not a generative paraphrase engine.

## Operational reading

- high `S` and high `T` = stylometric resemblance worth routing
- high `R` with weak explanation = recognition pressure rising toward criticality
- low `S` and low `T` = weak signal, probably noise
- medium `S` with medium `T` = preserve the branch, stay exploratory, do not overclaim

## Scope limit

TCP does not identify authors. It measures how strongly patterned return becomes legible and whether that legibility is beginning to require route, buffering, or harbor.
