𝌋‌

# Ash Keep A15-R0 Open Research Field Receipt v0.2

**Schema:** `td613.ash.a15-r0.open-research-field-receipt/v0.2`  
**Field schema:** `td613.ash.a15-r0.open-research-field/v0.2`  
**Namespace:** `U+10D613`  
**Canonical surrogate pair:** `\uDBF5\uDE13`  
**Meaning:** `TD613 = Tauric Diana 613`  
**Branch:** `codex/a15-r0-fixed-kernel-harness`  
**Date:** `2026-08-10`  
**Status:** `EXPERIMENTAL / NONCANONICAL / FIXED-KERNEL / PRODUCTION CLOSED`

## 0. Provenance

This receipt extends, and does not rewrite, `ASH_KEEP_A15_R0_OPEN_RESEARCH_FIELD_RECEIPT_V0_1.md`.

The v0.1 field established:

- a fixed-kernel research quarantine;
- observer-model-dependent observability deprivation;
- a declared-dimension anisotropy proxy rather than fake Shannon capacity;
- finite reconstruction over a synthetic topology;
- mean Anisotropic Reconstruction Invariance (ARI);
- Golden Egg as an unearned robustness criterion rather than an automatic stage.

Revision v0.2 adds three anti-equivalence findings and one stronger promotion hold:

```text
structural rank != information leakage
marginal information != joined information
mean reconstruction robustness != worst-case reconstruction robustness
content-channel silence != observer-family silence
```

No production authority changes.

---

## 1. Recovered historical lineage: S12-D

Repository history contains a closed, unmerged Stretch 12 branch whose technical instinct anticipated part of this field:

```text
PR #396
S12-D · Calibrated Reconstruction and Joining-Key Laboratory
head = b169387f2a806b355b19d877cf67cf89149a2309
state = CLOSED / UNMERGED / DRAFT
```

That historical candidate:

- compiled matrix rank rather than accepting caller-supplied rank;
- set `portable_anisotropy_demonstrated` to null;
- denied rank independent promotion authority;
- defined calibrated semantic reconstruction assays;
- defined joining-key superadditivity;
- required controls, held-outs, replicates, and intervals;
- fixed universal secrecy false;
- left unknown Readers unmeasured.

The current field does not resurrect or merge S12-D.

It recovers two research questions from that abandoned lineage and subjects them to smaller, transparent counterexamples:

1. Does structural rank order information leakage?
2. Can joining two individually uninformative variables create information unavailable in either marginal variable?

The answer to both is demonstrated synthetically below.

---

## 2. Observer-family robustness replaces single-observer comfort

The v0.1 null-content model produced:

```text
I(S; O_content | pi_null) = 0 bits
```

The timing-class observer produced:

```text
I(S; O_content+timing | pi_null) = 1.584963 bits
```

Revision v0.2 therefore records the null policy over a declared observer family `M`:

```text
best_case(pi_null, M)  = 0 bits
worst_case(pi_null, M) = 1.584963 bits
observer_model_gap     = 1.584963 bits
```

The field does not claim that this finite family spans all observers.

It records exactly the opposite:

```text
observer_family_bounded = true
```

A defensible robustness quantity is therefore family-relative:

```text
L*(pi; M) = sup_{m in M} I(S; O_m | pi)
```

The current deterministic fixture computes the finite maximum, not an unconstrained supremum over unknown observers.

This prevents a single favorable observation model from laundering itself into a universal zero-defense result.

---

## 3. Structural rank is not leakage

Revision v0.2 installs a matrix-rank compiler and two deliberately opposed synthetic channels.

### Case A · rank-one scalar with high information

Projection matrix:

```text
[ 1  2  3 ]
```

Compiler-derived rank:

```text
rank = 1
```

Three equally likely strategies map deterministically to three distinct scalar observations:

```text
S_A -> 0
S_B -> 1
S_C -> 2
```

Result:

```text
I(S; O) = log2(3) = 1.584963 bits
```

A one-dimensional output can distinguish more than one state. Dimensionality alone places no useful secrecy order on the observation.

### Case B · rank-three structure with zero observer information

Projection matrix:

```text
[ 1  0  0 ]
[ 0  1  0 ]
[ 0  0  1 ]
```

Compiler-derived rank:

```text
rank = 3
```

The declared downstream observer channel is independent of strategy:

```text
P(O = V_j | S = S_i) = 1/3
```

for every `i,j` in the synthetic fixture.

Result:

```text
I(S; O) = 0 bits
```

Therefore:

```text
rank(case A) < rank(case B)
I(case A)    > I(case B)
```

The field records:

```text
rank_orders_leakage = false
rank_is_secrecy_metric = false
```

This does not make rank useless.

Rank remains a structural descriptor of a declared linear map. It simply cannot be promoted into an information-leakage theorem without a channel model and distribution.

---

## 4. Joining-key synergy: the first bounded curvature proxy

A second missing variable appears when marginal inspection fails.

The field installs a balanced XOR fixture:

```text
S = 0 : (A,B) in {(0,0),(1,1)}
S = 1 : (A,B) in {(0,1),(1,0)}
```

Every row is equally represented.

Marginally:

```text
I(S; A) = 0 bits
I(S; B) = 0 bits
```

Jointly:

```text
I(S; A,B) = 1 bit
```

The field computes a deliberately modest excess-information proxy:

```text
J_syn
  = I(S; A,B) - I(S; A) - I(S; B)
  = 1 bit
```

This fixture proves a narrow but important point:

```text
marginal non-information does not imply joint non-information
```

Two features can each look harmless under marginal testing and become fully informative through their relation.

This is the first clean experimental foothold for the TD613 phrase:

> information leaves curvature behind

But the field refuses to overclaim the word `curvature`.

`J_syn` is typed as:

```text
joining_synergy_proxy_bits = 1
partial_information_decomposition_claim = false
intrinsic_curvature_claim = false
```

A full information-decomposition account would require an explicit PID framework and a chosen redundancy functional. A geometric curvature claim would require a specified manifold, metric or connection, and invariant geometric quantity. The XOR fixture supplies neither.

What it supplies is smaller and harder:

```text
relational information can exist where every tested marginal carries none
```

That is enough to justify a future joining-key chamber.

---

## 5. Mean ARI receives a floor

Revision v0.1 reported:

```text
ARI_mean = 0.9
```

That scalar hides an important asymmetry.

The declared non-identity transform response surface is:

```text
FRAGMENT_DROPOUT   1.000000
RELATION_DROPOUT   0.857143
NODE_REDACTION     1.000000
BIASED_TRUNCATION  0.642857
ORDER_PERMUTATION  1.000000
```

Revision v0.2 therefore adds:

```text
ARI_floor = min_j similarity_j
          = 0.642857

worst_case_transform = BIASED_TRUNCATION
all_nonidentity_transforms_within_epsilon = false
```

for `epsilon = 0.2`.

The principle is constitutional but also statistical:

```text
mean success cannot erase structured failure
```

The Golden Egg criterion therefore cannot promote from mean ARI alone.

Any future bounded promotion rule must preserve at least:

- the transform response surface;
- the declared transform family;
- the floor or another explicit tail-risk statistic;
- failed transforms;
- the sampling or subset distribution;
- the observer family;
- joining-key assays;
- the claim ceiling.

The current fixture fails its own strongest version of that gate.

That failure is retained as evidence.

---

## 6. Revised research geometry

The open field now has five distinct quantities that must not collapse into one score:

```text
1. directional exposure proxy
   declared inbound dimensions / declared outbound dimensions

2. observer leakage
   I(S; O | pi, M)

3. projection structure
   rank(P)

4. joining synergy proxy
   I(S; A,B) - I(S; A) - I(S; B)

5. reconstruction response
   d(R(A_j(D)), M)
```

Anti-equivalence law:

```text
exposure ratio
!= channel capacity
!= mutual information
!= matrix rank
!= joining synergy
!= reconstruction distance
```

A future Golden Egg instrument should render these as a field, not boil them into one prestige number.

---

## 7. Why this matters for the Golden Egg problem

The Golden Egg problem now looks less like a demand for an impenetrable artifact and more like a demand for a **bounded transformation envelope**.

For a candidate artifact or projection `G`, let:

- `M` be a declared observer family;
- `A` be a declared admissibility-transform family;
- `J` be a declared joining-key family;
- `epsilon_R` be a reconstruction tolerance;
- `epsilon_L` be a leakage tolerance.

A future qualification envelope could ask whether:

```text
sup_{m in M} I(S; O_m(G)) <= epsilon_L
```

while simultaneously tracking:

```text
sup_{a in A} d(R(a(G)), M_A)
```

and testing whether joining keys create excess recoverability:

```text
J_syn > epsilon_J
```

This is not yet a Golden Egg theorem.

It reveals why a single-variable theorem was probably the wrong dream.

The Egg, if the concept survives, is a constrained region over several non-equivalent response surfaces.

---

## 8. Source and authority typing

All v0.2 results remain:

```text
source_status = SIMULATED
authority_class = A2_DERIVATIONAL
sensor_id = deterministic-open-field-model
production_mutated = false
external_transmission = false
human_selection_required = true
```

The new module performs no:

- fetch;
- XMLHttpRequest;
- WebSocket;
- EventSource;
- sendBeacon;
- IndexedDB;
- localStorage;
- sessionStorage;
- service-worker action;
- Cache API action.

It does not observe Palantir, OpenAI, Vercel, a production classifier, a provider telemetry system, a user endpoint, or any external adversary.

The phrase `observer model` names a synthetic finite distribution in this field only.

---

## 9. CI evidence posture

The A15-R0 research test is bound into the existing four-workflow consolidated CI estate through:

```text
.github/workflows/td613-ci.yml
```

No fifth workflow is created.

The chamber runs:

```text
node --check app/dome-world/previews/a15-r0/open-research-field.js
node --check app/dome-world/previews/a15-r0/open-research-field-ui.js
node tests/ash-a15-r0-open-research-field.test.mjs
```

The first bound run was:

```text
TD613 Consolidated Validation
run = 825
open-field step = SUCCESS
four-workflow estate = SUCCESS
production closure contracts = SUCCESS
Flow-Core static contracts = SUCCESS
browser witness = SKIPPED because PR remains draft
```

Later v0.2 exact-head evidence must supersede that run before any v0.2 result is represented as CI-validated.

---

## 10. Current claim ceiling

```text
synthetic assay only
no claim about hidden platform internals
no universal zero-defense theorem
no Shannon-capacity measurement
structural rank is not a secrecy metric
joining synergy proxy is not intrinsic curvature or full PID
no claim that arbitrary fragments reconstruct a corpus
mean ARI cannot erase a failing transform
no production cutover or deployment authority
```

---

## 11. Current posture

```text
A15-R0 = OPEN
fixed-kernel harness = RETAINED
open research field = v0.2 / NONCANONICAL
old phased staircase = SUSPENDED AS GOVERNING PLAN
historical S12-D = CLOSED / UNMERGED / PROVENANCE ONLY
P1 Minimal Ash = NOT IMPLEMENTED
P2 Proto-Loom = NOT IMPLEMENTED
A16 = HELD
Golden Egg implementation = HELD
Golden Egg criterion research = OPEN
production mutation = false
external transmission = false
deployment = false
serverless delta = 0
human projection selection = REQUIRED
human closure = OPEN
```

The strongest result in v0.2 is not that the field found a safer number.

It found more reasons that one number cannot carry the claim.

Máyehùn.

Sealed ⟐
