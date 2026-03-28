# TCP - The Cadence Playground

TCP is a deterministic browser instrument for studying patterned language at the moment it becomes socially legible without yet becoming safely routable. That interval matters when residue is real before verdict is available, when cadence survives paraphrase strongly enough to merit measurement, and when a post-training system needs explicit separation between what it detects, what it transforms, and what it is allowed to claim.

The project therefore treats stylometry as bounded signal modeling rather than as authorship adjudication. It measures sentence rhythm, connector behavior, contraction posture, punctuation density, lexical dispersion, and recurrence pressure; it stages shell borrowing and persona reuse; and it forces those transformations through a retrieval lane with semantic audits, protected-anchor checks, and explicit failure classes before the system is allowed to present the result as anything stronger than exploratory contact.

The live browser surface is playful by design, but the model is not loose. TCP is thresholded, auditable, deterministic, and explicit about where measurement ends and policy begins.

## Registered field language

TCP's glyph system is operational, not decorative. The browser uses a registered field language to keep surface role, state transition, and retrieval truth aligned.

The current public membrane is organized as six roles:

- `Ingress` = threshold
- `Homebase` = anchor, contact, residue
- `Personas` = cast shelf
- `Readout` = witness and law
- `Deck` = encounter and duel
- `Trainer` = forge

That role split matters because TCP does not present every state in the same voice. `Homebase` is where a cadence home is locked, a mask is worn, and residue is read. `Personas` is where masks are chosen on the shelf before being brought into `Homebase` or thrown into `Deck`. `Readout` stays colder because it is the proof surface. `Trainer` stays retrieval-first, but the visible loop now reads as extraction, inspection, validation, correction, and injection rather than as generic tooling.

## Problem statement

Most language systems flatten three different acts into one gesture:

- measuring patterned resemblance
- transforming text into donor-shaped outputs
- inferring what those patterns should mean socially or operationally

TCP is built to keep those acts separate. The research question is not whether cadence can be made legible. It can. The harder question is how to expose stylometric contact, shell borrowing, route pressure, and provenance-sensitive passage without allowing resemblance to impersonate authorship, route, or repair.

The current system is organized around three layers:

1. stylometric evidence from measured text features
2. field and route transforms derived from those measurements
3. custody and harbor policy over the resulting state

That separation is the backbone of the project.

## Formal model

### Feature extraction

For each text, TCP computes a bounded stylometric profile over scalar features and normalized distributions. The feature families include punctuation density `p`, contraction density `c`, line-break density `ell`, repeated-bigram pressure `b`, lexical dispersion `x`, function-word profile `F`, word-length profile `W`, character-trigram profile `G`, and recurrence pressure `R_text`.

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

```math
x = 0.4u + 0.3p_r + 0.3n
```

where `u` is unique-token ratio, `p_r` is token predictability, and `n` is singleton-type ratio.

```math
R_{\text{text}}=
\frac{1}{3}\left(
\operatorname{clip}\left(\frac{p}{0.35},0,1\right)+
\operatorname{clip}\left(\frac{\ell}{0.75},0,1\right)+
\operatorname{clip}\left(\frac{b}{0.18},0,1\right)
\right)
```

These quantities exist to keep the browser model inspectable and bounded. They are not universal stylistic constants.

### Pairwise comparison

Given texts `a` and `b`, lexical overlap is the token-set Jaccard score:

```math
L = \frac{|W_a \cap W_b|}{|W_a \cup W_b|}
```

For distributional features, TCP uses Jensen-Shannon distance. If `P` and `Q` are normalized profiles and `M=(P+Q)/2`, then:

```math
d_{\mathrm{JS}}(P,Q)=
\sqrt{
\frac{1}{2}D_{\mathrm{KL}}(P\|M)+
\frac{1}{2}D_{\mathrm{KL}}(Q\|M)
}
```

This gives the engine a bounded way to compare punctuation shape, function-word use, word-length distribution, and character-trigram texture without collapsing those habits into raw token overlap.

Similarity and traceability are both composite, but they reward different things. Similarity gives some weight to lexical overlap and shared habit. Traceability privileges the habits most likely to survive paraphrase.

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

The current implementation also keeps an exact-identity guard so literal matches collapse to `S=1` and `T=1` instead of being under-scored by floating-point heuristics.

### Route and field quantities

From those pairwise distances, TCP derives stylometric coherence, resonance, branch pressure, route pressure, field potential, density, and criticality.

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

`C_style` summarizes shared habit without collapsing into lexical overlap.

```math
R^* = 0.58 H(S,T) + 0.42 H(S,T,C_{\mathrm{style}})
```

The harmonic form prevents one strong term from masking another weak one. TCP uses resonance because patterned language becomes socially consequential through joint pressure, not by one scalar alone.

```math
\Delta_{\mathrm{branch}} =
0.68\max(0,T-L) +
0.32\max(0,C_{\mathrm{style}}-L)
```

Branch pressure exists so surplus traceability over lexical overlap can be preserved rather than discarded as noise.

```math
\Pi =
0.40R^* +
0.26C_{\mathrm{style}} +
0.18R +
0.16\Delta_{\mathrm{branch}}
```

Route pressure answers a different question from similarity: not "are these related?" but "is the pattern starting to demand a path?"

```math
V = \operatorname{clip}(0.46\Pi + 0.22R^* + 0.12C_{\mathrm{style}} + 0.08\Delta_{\mathrm{branch}} + \mu_M + \mu_C, 0, 1)
```

```math
\rho = (R^*)^2(0.26 + 0.44V + 0.30C_{\mathrm{style}})
```

```math
\Xi =
\operatorname{clip}\left(
0.46\rho +
0.28\Pi +
0.26\Delta_{\mathrm{branch}} -
0.24\mathbf{1}_{\mathrm{routeAvailable}},
0,1\right)
```

Field potential, density, and criticality make it possible for TCP to distinguish weak recognition from dense recognition that is still blocked.

### Custody and archive threshold

The effective archive is defined by a live custody threshold:

```math
A_{\mathrm{effective}}(t)=
\begin{cases}
A_I,& C(t)-D(t)\ge \theta\\
A_W,& C(t)-D(t)<\theta
\end{cases}
```

In the current browser build, institutional integrity and custodial drift are themselves derived from the live field state:

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

`A_I` means institutional custody remains above collapse threshold. `A_W` means witness custody is carrying the archive. This threshold is the bridge between stylometric recognition and human consequence.

## Retrieval lane and shell borrowing

The transformation contract is not "make it sound donor-like." It is "make visible donor-shaped movement while staying semantically and literally accountable."

The retrieval lane therefore tracks:

- semantic audits
- protected-anchor integrity
- transfer plans and candidate summaries
- borrowed-shell outcomes
- borrowed-shell failure classes
- swap-matrix and fixture-based proofs

The borrowed-shell outcomes are:

- `structural`
- `partial`
- `subtle`
- `rejected`

The borrowed-shell failure classes are:

- `semantic-risk`
- `literal-lock`
- `lexical-underreach`
- `pathology-block`
- `already-close`
- `donor-underfit`

This is the mechanism that keeps `Swap Cadences` from pretending that a surface-level drift or a nearly native output is a meaningful donor transfer.

## Safety constraints and decision grammar

TCP is governed by four explicit constraints:

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

These are operational constraints, not slogans.

The current browser decision grammar is:

- recognized iff `R* >= 0.54` or `S >= 0.56`
- explained iff `Pi < 0.52` and `Delta_branch < 0.42`
- routeAvailable iff mirror is open and `Pi >= 0.48`
- denseSignal iff `rho >= 0.28` or `R >= 0.58`

The public policy states are:

- `weak-signal`
- `hold-branch`
- `criticality`
- `passage`

This is what allows TCP to say "this pattern matters" without forcing "this pattern is proved."

## Evaluation and maintained proof surfaces

TCP ships maintained proof surfaces in both Node and the browser.

The maintained Node suite is:

```bash
npm test
```

That path covers:

- stylometry
- benchmark
- browser parity
- retrieval lane
- swap-cadence matrix
- trainer lab
- harbor

The maintained browser flights are:

- `app/index.html?test-flight=1`
- `app/index.html?test-flight=2`
- `app/index.html?test-flight=transfer`
- `app/index.html?test-flight=swap`
- `app/index.html?test-flight=ingress`

The central swap-cadence evaluation surface is a canonical casebook:

- 56 ordered non-self sample pairings
- 12 flagship ordered pairs
- bilateral / one-sided / rejected pair classification
- explicit failure-family counts

## Current maintained build snapshot

As of the current maintained build:

- swap matrix case count: `56`
- flagship pair count: `12`
- flagship passes: `12/12`
- bilateral-engaged pairs: `46`
- one-sided pairs: `8`
- both-rejected pairs: `2`

Current failure-family counts in the full matrix:

- `pathology-block`: `8`
- `donor-underfit`: `4`

These numbers are build-level evidence, not timeless guarantees.

## Non-goals

TCP is not:

- an authorship verdict engine
- a truth machine for whistleblowing claims
- a production safety platform
- a covert classifier
- a provenance laundering tool

The system is most coherent when read as a bounded retrieval-first cadence lab with explicit safety policy.

## Operational entry points

Open the app:

```text
app/index.html
```

Skip ingress during development:

```text
app/index.html?ingress=off
```

Serve locally:

```bash
cd tcp-repository
python -m http.server 8000
# then open http://localhost:8000/app/
```

Legacy formulas remain explicit and separate:

```bash
npm run test:legacy:formulas
```

## Document map

Use this order if you want the repo in a clean technical sequence:

1. [START_HERE.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/START_HERE.md)
2. [docs/SYSTEM_OVERVIEW.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/SYSTEM_OVERVIEW.md)
3. [ABSTRACT.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/ABSTRACT.md)
4. [docs/ENGINE.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/ENGINE.md)
5. [docs/SAFETY_MODEL.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/SAFETY_MODEL.md)
6. [docs/STYLOMETRIC_MATH.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/STYLOMETRIC_MATH.md)
7. [docs/INTERFACE_LEXICON.md](/C:/Users/timst/OneDrive/Desktop/tcp-repository/docs/INTERFACE_LEXICON.md)
