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

For each text, the engine computes a small stylometric profile made of scalar features and normalized distributions:

1. `p` - punctuation density
2. `c` - contraction density
3. `ell` - line-break density
4. `b` - repeated-bigram pressure
5. `x` - lexical dispersion
6. `F` - function-word profile
7. `W` - word-length profile
8. `G` - character-trigram profile
9. `R_text` - recurrence pressure

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

The function-word profile is a normalized frequency vector over a fixed small list of high-frequency structural terms and short discourse connectors:

```math
F_i = \frac{\#\{\text{function word } i\}}{\max(\text{word count},1)}
```

In the current build, that inventory includes core articles, pronouns, and short connector words such as `because`, `since`, `though`, `yet`, `so`, `then`, `when`, `while`, `also`, `only`, `still`, `just`, `really`, and `maybe`. This is still a heuristic inventory, but it gives the engine a better read on short connective habits that often survive paraphrase.

The word-length profile is a normalized histogram over the buckets `1-2`, `3-4`, `5-6`, `7-8`, and `9+`:

```math
W_k = \frac{\#\{\text{tokens in bucket } k\}}{\max(\text{word count},1)}
```

The character-trigram profile is computed over normalized lowercase text with spacing collapsed:

```math
G_{\tau} = \frac{\#\{\text{trigram } \tau\}}{\max(\text{trigram count},1)}
```

## Pairwise comparison

Given texts `a` and `b`, lexical overlap is the token-set Jaccard score:

```math
L = \frac{|W_a \cap W_b|}{|W_a \cup W_b|}
```

The scalar bounded distances are:

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

For distributional features, TCP uses Jensen-Shannon distance. If `P` and `Q` are normalized profiles and `M=(P+Q)/2`, then:

```math
d_{\mathrm{JS}}(P,Q)=
\sqrt{
\frac{1}{2}D_{\mathrm{KL}}(P\|M)+
\frac{1}{2}D_{\mathrm{KL}}(Q\|M)
}
```

This is used for:

- punctuation-shape distance `d_m`
- function-word distance `d_f`
- word-length distance `d_w`
- character-trigram distance `d_g`

Similarity rewards both shared lexicon and shared habits:

```math
S(a,b)=
0.08L+
0.12(1-d_s)+
0.08(1-d_{\sigma})+
0.08(1-d_p)+
0.10(1-d_m)+
0.08(1-d_c)+
0.16(1-d_f)+
0.08(1-d_w)+
0.16(1-d_g)+
0.03(1-d_l)+
0.03(1-d_r)
```

Traceability privileges the habits most likely to survive paraphrase:

```math
T(a,b)=
0.16(1-d_s)+
0.12(1-d_{\sigma})+
0.10(1-d_p)+
0.14(1-d_m)+
0.12(1-d_c)+
0.18(1-d_f)+
0.08(1-d_w)+
0.08(1-d_g)+
0.02(1-d_r)
```

where `d_{\sigma}` is sentence-length spread distance.

The paired recurrence term used downstream is:

```math
R=\frac{R_a+R_b}{2}
```

All three outputs are clipped into `[0,1]`.

There is also an explicit identity guard: if the normalized texts match exactly and every stylometric distance collapses to zero, then the current implementation forces `S=1` and `T=1` rather than letting floating-point heuristics under-score an exact match.

## Shell-text transfer

The current transfer contract is `buildCadenceTransfer(text, shell, options?)`. It returns the transformed text together with source, target, and output profiles, changed dimensions, protected-literal count, pass log, `transferClass`, quality-gate result, and transfer notes.

`applyCadenceToText(text, shell)` remains as the compatibility wrapper that returns only the transformed text.

TCP treats shell transfer as a strict-preserve cadence rewrite. That means:

- literal content is protected before rewrite
- cadence may shift sentence shape, clause joins/splits, connector choice, contraction posture, line-break texture, and punctuation finish
- content-word paraphrase is out of scope

Protected spans include digit-bearing tokens, dates/times, URLs, emails, handles, quoted substrings, all-caps acronyms, and mixed-case IDs. Those spans are replaced with placeholders before the rewrite passes and restored exactly afterward.

The deterministic pass order is:

1. sentence structure
2. clause join/split
3. connector and stance lexicon
4. contraction/auxiliary posture
5. line-break texture
6. punctuation finish
7. cleanup and literal restore

The lexicon pack remains intentionally narrow. It operates over structural or stance-bearing terms such as:

- `because / since / as`
- `but / though / yet`
- `when / while / once`
- `this / that`
- `just / simply`
- `really / actually`
- `maybe / perhaps`
- `I am / I'm`
- `will not / won't`
- `that is / that's`

The quality gate rejects a transfer if protected literals fail to restore, duplicate chunks appear, connector sequences repeat, or a materially different target collapses into punctuation-only drift. In those cases TCP falls back to the safer result rather than presenting a weak rewrite as a meaningful cadence shift.

The transfer classifier is intentionally small:

- `native` - no shell rewrite was applied
- `weak` - the source and donor were close enough that the transfer stayed subtle
- `structural` - at least one structural cadence dimension plus one additional non-punctuation dimension moved
- `rejected` - the donor/source gap was material, but the engine could not land a safe structural rewrite

## Route pressure

Stylometric resemblance is not the last step. TCP derives three intermediate quantities before it computes route pressure:

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

The route score is then:

```math
\Pi =
0.40R^* +
0.26C_{\mathrm{style}} +
0.18R +
0.16\Delta_{\mathrm{branch}}
```

where `H` denotes the harmonic mean and `L` is lexical overlap.

## Cadence shells

Persona shells do not overwrite the raw textarea contents. They generate an effective in-flight sample and TCP profiles that effective sample directly.

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

The text-transform layer then applies bounded structural edits, such as contraction expansion or collapse and sentence-join or sentence-split behavior, to create the effective sample that is actually scored. This is still a shell model, not a full paraphrase engine, but it is more honest than shifting the metrics without shifting the compared sample.

## Operational reading

- high `S` and high `T` = stylometric resemblance worth routing
- high `R` with weak explanation = recognition pressure rising toward criticality
- low `S` and low `T` = weak signal, probably noise
- medium `S` with medium `T` = preserve the branch, stay exploratory, do not overclaim

## Scope limit

TCP does not identify authors. It measures how strongly patterned return becomes legible and whether that legibility is beginning to require route, buffering, or harbor.
