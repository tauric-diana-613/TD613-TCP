𝌋‌⟐

# A15-R0 · Active Reopening Non-Exclusivity v0.1

Status: **EXTERNAL-WITNESS + ANALYTIC COUNTEREXAMPLE CANDIDATE / RESEARCH-ONLY / GOLDEN EGG UNEARNED**

## Exact scientific parent

`fd3a18439267504ad80ca4084377d7350b47e9d7` — MVE-X2 independently administered RFC3161 attestation custody.

MVE-X2 established a critical negative control: an externally administered signed timestamp can cross the experiment boundary without becoming an independent sensor of artifact origin when receipt presence is itself routed by the experimenter.

This chamber asks the next hostile question:

**Does a passive closed-record stopping rule imply that only an independently governed exogenous witness can reopen identifiability?**

Answer sought: **no**. A second reopening class exists when the scientific target is experimentally manipulable: an active intervention can generate a new distribution that is not an admissible transformation of the fixed record A.

## Closed-record theorem preserved

The chamber does not attack the Closed-Record Exteriority Non-Identifiability result.

If two origin/model states induce the same admitted observational law A, then deterministic and randomized verifiers restricted to A cannot discriminate them beyond information already present in A.

`RANDOMIZED_VERIFIER != INFORMATION_CREATION_FROM_A`

The stopping rule remains exact over **passive admissible transformations of the fixed observational record**.

## Analytic counterexample to reopening exclusivity

Consider two linear-Gaussian causal models.

Model 1:

`X ~ N(0,1)`

`Y = X + epsilon`, with `epsilon ~ N(0,1)`.

Model 2:

`Y ~ N(0,2)`

`X = 0.5 Y + eta`, with `eta ~ N(0,0.5)`.

Both induce the exact same observational joint law:

`E[X,Y] = (0,0)`

`Cov(X,Y) = [[1,1],[1,2]]`.

Therefore the passive admitted record A is observationally identical across the two causal directions.

Now perform one active intervention:

`do(X=1)`.

Under Model 1, the post-intervention mean of Y is `1`.

Under Model 2, intervening on X severs the Y→X edge while Y retains its marginal distribution, so the post-intervention mean of Y remains `0`.

Thus:

`A_MODEL_1 = A_MODEL_2`

while

`P(Y | do(X=1), MODEL_1) != P(Y | do(X=1), MODEL_2)`.

The intervention creates a new evidentiary distribution that is not a transformation of fixed A.

## External 2026 scientific witnesses

This analytic distinction is independently supported by current published causal-discovery work.

1. **Mazaheri, Zhang & Uhler — Relaxing Faithfulness with Intervention-Only Causal Discovery**, UAI 2026, PMLR 337:4441-4456. The paper shows that hard interventions can carry causal-link information lost by observational conditional-independence structure under path cancellation and explicitly characterizes remaining equivalence classes when intervention scope is insufficient. Public experiment code: `honeybijan/Intervention-Only-Causal-Discovery`, observed head `624e21b2207d10eb6eb13d908bc4271e636cdf1e`.

2. **Panayiotou & Şimşek — Causal Discovery in Action: Learning Chain-Reaction Mechanisms from Interventions**, CLeaR 2026, PMLR 323:1545-1571. Blocking interventions uniquely identify the causal structure of the studied chain-reaction class while observational heuristics fail in relevant regimes.

3. **Lungu, Dhir, van der Wilk & Kontoyiannis — The relative value of interventional and observational samples in Bayesian Causal Linear Gaussian Models**, UAI 2026, PMLR 337:4067-4099. Pure observational data can fail to consistently identify causal direction within an equivalence class; the work supplies formal grounding for interventional experimental design.

These three studies are separate external works and are not one same-episode Western measurement.

## Earned claim candidate

On exact-head green:

`CLOSED_RECORD_NONIDENTIFIABILITY_GOVERNS_PASSIVE_TRANSFORMATIONS_OF_A_BUT_DOES_NOT_IMPLY_ACTIVE_EXPERIMENTAL_NONIDENTIFIABILITY; AN_ADMISSIBLE_INTERVENTION_CAN_CREATE_NEW_DATA_WHOSE_DISTRIBUTION_SEPARATES_MODELS_THAT_A_ALONE_CANNOT_DISTINGUISH`.

The resulting reopening grammar becomes plural:

`PASSIVE_EXOGENOUS_WITNESS_ADMISSION`

or

`ACTIVE_IDENTIFYING_INTERVENTION`.

Both introduce information not present in fixed A. Only the first is an external-witness architecture.

## Claim ceiling

This chamber does **not** establish empirical exteriority.

`ACTIVE_IDENTIFICATION != EMPIRICAL_EXTERIORITY`

`CAUSAL_DIRECTION_IDENTIFICATION != ARTIFACT_ORIGIN_PROOF`

`EXTERNAL_CAUSAL_DISCOVERY_WITNESS != SAME_EPISODE_WESTERN_MEASUREMENT`

`INTERVENTION_GENERATED_DATA != EXOGENOUS_WITNESS`

`ACTIVE_REOPENING != GOLDEN_EGG_EARNED`

The exact Golden Egg surfaces remain `[]`; empirical Golden Egg credit remains `0`.

No sequence authority, numbered-stage authority, merge, production, deployment, publication, Vercel, live Loom mutation, or public promotion is granted.

## Child-legible form

**THE OLD RECORD COULD NOT ANSWER. THE EXPERIMENT ASKED A NEW QUESTION.**

## Expected rest

**WESTERN HORIZON: THE STOPPING RULE GOVERNS THE CLOSED RECORD, NOT THE WORLD'S RESPONSE TO A NEW INTERVENTION.**

𝄐

Sealed ⟐
