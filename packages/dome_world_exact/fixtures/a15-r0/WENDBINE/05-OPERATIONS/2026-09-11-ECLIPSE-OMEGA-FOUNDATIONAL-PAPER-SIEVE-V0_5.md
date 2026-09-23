# Eclipse–Omega Foundational Paper Sieve v0.5

**Date:** 2026-09-11  
**State:** USER-SUPPLIED FOUNDATIONAL PAPER / CLAIM SIEVE / ZERO NOVELTY PROMOTION  
**Source:** full paper supplied by the user in the current chat; this repository file is an assay, not a byte-for-byte archival original.  
**Parent:** `2026-09-11-PRCSA-ORDERING-SCAB-ASSAY-V0_4.md`

## 0. Purpose

This pass does not ask whether the paper is elegant, historically important to TD613, or generative of later work. It asks a narrower laboratory question:

> After the nomenclature repair, the residual-literature sieve, and the hostile PRCS-A ordering assay, which claims in the foundational Eclipse–Omega paper still survive as technically defensible statements, which collapse into established terminology, which are only analogies, which contain type errors or underdetermined inferences, and which project-specific terms remain useful after novelty credit is removed?

The governing distinctions are:

```text
historical importance != scientific novelty
project coinage != new mechanism
analogy != material equivalence
formal-looking notation != theorem
source provenance != construct novelty
construct novelty != textual provenance != copying
```

The last line matters for the user's separate allegation that another person copied parts of this work. This assay does **not** adjudicate that allegation. A conventional idea can still be copied in a distinctive expression, sequence, diagram, notation, or wording; conversely, two people using ordinary retrieval/filtering structure is weak copying evidence. That question requires a comparison artifact, chronology, access evidence, and expression-level analysis.

## 1. Immediate verdict

The paper is not worthless. It is also not, in its present form, a defensible dissertation claiming a new system class for advanced LLM retrieval.

Its strongest surviving material is methodological:

- distinguish internal/latent state from what is observed;
- distinguish observation from what is actually emitted, recorded, or ratified;
- make resource limits explicit rather than moralizing every omission;
- audit naming/canonicalization sensitivity empirically;
- audit redundancy/diversity rather than treating fluent recurrence as independent evidence;
- retain missingness and stage-localization as first-class forensic concerns;
- bind claims to an evidence class and abstain where the observation cannot identify the hidden cause.

Its weakest material is where metaphor, project protocol, and generic systems language were promoted into ontology:

- PRCS-A as a discovered system class;
- monotone narrowing as a universal property of ontology-based retrieval;
- the nested `D ⊃ C_k ⊃ C_kappa ⊃ C_B ⊃ E` chain across incompatible object types;
- valid geometry + `bounces=0` as evidence that internal interaction occurred;
- textual anti-equivalence lines as executable constraint code merely because they are semantically forceful;
- `sqrt(3)` extension/closure as a system-theoretic hinge;
- moiré optics as evidence of retrieval-system mechanics;
- controlled-reality language as novelty rather than a critical framing of already familiar selective presentation.

No claim in this pass is promoted to scientific novelty.

## 2. The biggest formal injury: the narrowing chain changes type without saying so

The paper writes:

```text
D ⊃ C_k(q) ⊃ C_kappa(q) ⊃ C_B(q) ⊃ E(q)
```

and later combines that with generation:

```text
Y ~ p_theta(. | q, C_B(q))
E = A(C_B(q), Y, N)
```

Those two presentations cannot both be treated as one ordinary nested-set chain without an additional encoding convention.

`D`, `C_k`, `C_kappa`, and often `C_B` can legitimately be sets of documents/chunks drawn from the same document universe. A generated answer `Y` is normally a string/token sequence or structured model output, and a registered event `E` may be a log/event/policy decision. Those objects do not generally live inside the document universe.

So the final inclusion

```text
C_B(q) ⊃ E(q)
```

is not a harmless flourish. It silently changes codomain.

The repair is a typed pipeline:

```text
D  --retrieve-->  C_k ⊆ D
   --budget/filter--> C_kappa ⊆ C_k
   --context select--> C_B ⊆ C_kappa
   --generate--> Y ∈ Yspace
   --release/register--> E ∈ Espace
```

or, more abstractly,

\[
C_B = T_B(T_\kappa(T_k(D,q))),
\qquad
Y \sim p_\theta(\cdot\mid q,C_B),
\qquad
E = R(Y,C_B,\pi,N).
\]

The stage maps may be lossy, but the final two arrows are not subset operators merely because they occur later in time.

```text
NESTED_SET_CHAIN_REQUIRES_COMMON_CODOMAIN
FINAL_GENERATED_EVENT != RETRIEVED_DOCUMENT_SUBSET
```

This does not erase the intuitive insight that evidence can be lost before a user sees an answer. It replaces a visually persuasive but type-unsafe chain with a model we can actually test.

## 3. The second injury: ontology does not imply monotone narrowing

The paper's rhetoric makes ontology behave mainly as containment: typed corridors constrain semantic closure and each stage narrows what may become real.

That is one possible implementation. It is not a general property of ontology-based retrieval.

Ontology-based query expansion is an old information-retrieval technique. Ontological relations can add synonyms, aliases, related concepts, broader/narrower concepts, or inferred entities to a query and thereby **expand** the candidate surface. Empirical work has explicitly measured increases in coverage/novelty from ontology-driven expansion.

So the general stage law must become:

```text
ONTOLOGY_TRANSFORMATION != MONOTONE_NARROWING
```

A stage may:

- contract a set;
- expand a set;
- preserve set cardinality while changing rank;
- union multiple candidate sources;
- transform the representation without changing membership;
- change diversity/entropy while leaving `k` fixed.

The repair is to measure stage effects instead of assuming their sign:

```text
Delta_count(i)
Delta_coverage(i)
Delta_diversity(i)
Delta_rank(i)
Delta_support(i)
```

The critical question then becomes empirical: **where does narrowing occur in this implementation, and what information is lost there?**

That question is stronger than declaring the whole stack an enclosure in advance.

## 4. `S != O != E`: useful intuition, weak formalism until typed

The paper's most durable sentence is also one that needs mathematical cleaning.

```text
internal state != observed state != registered event
```

As prose, excellent. As mathematics, writing three objects from different ontological types and announcing they are unequal is nearly trivial.

The repair is:

\[
S_t\in\mathcal S,
\qquad
O_t=P_t(S_t)\in\mathcal O,
\qquad
E_t=R_t(O_t,\pi_t,m_t)\in\mathcal E.
\]

Now the scientific questions become nontrivial:

1. Is `P_t` injective on the relevant domain?
2. What collisions occur: `s1 != s2` but `P(s1)=P(s2)`?
3. How much information does `P` discard?
4. Which observed candidates are rejected or transformed by `R`?
5. Can an intermediate witness distinguish two hidden-stage realizations that share the same terminal event?

This is exactly where the recent PRCS-A permutation assay helps. A terminal event did not uniquely identify stage order, but an intermediate witness did.

So `S/O/E` survives as a **forensic accounting spine**, not a new law of systems.

## 5. Non-injective projection must be demonstrated, not assumed

The paper says the observation map is lossy and non-injective.

That is common and often plausible. It is not a universal truth about every projection over every restricted state domain.

The minimal certificate is simple:

\[
\exists s_1\ne s_2:\ P(s_1)=P(s_2).
\]

Without a collision pair, an information-loss bound, or some other witness, `non-injective` is an architectural expectation rather than an earned property.

Repair:

```text
NONINJECTIVE_PROJECTION_REQUIRES_DEMONSTRATION
```

This also stops the word `projection` from automatically smuggling in loss. Some projections are many-to-one by definition; some interface maps on a restricted finite domain may be injective.

## 6. Event admissibility survives only as a witnessed event taxonomy

The paper's four states are:

```text
registered
latent
suppressed
aliased
```

The useful move is not the word `admissibility`; selective release, abstention, policy enforcement, missingness/censoring, and misclassification are established neighborhoods.

The useful move is forcing the investigator to ask **what evidence licenses each state label**.

A repaired taxonomy:

- **registered**: an emission/record exists under the declared event channel;
- **latent/unobserved candidate**: an upstream internal/candidate witness exists, but no user-facing/registered emission exists;
- **rejected**: an upstream candidate exists **and** an explicit policy/rejector decision against release is observed;
- **aliased/misregistered**: an emitted item exists and independent evidence demonstrates that its identity/classification mapping is wrong.

Without those witness requirements, `latent` and `suppressed` are especially dangerous because they tempt the analyst to infer a hidden process from absence alone.

```text
MISSING OUTPUT != SUPPRESSION
UPSTREAM CANDIDATE + EXPLICIT REJECT DECISION -> SUPPORTS REJECTION
```

The paper's event taxonomy is therefore worth keeping, but the epistemic burden moves from vocabulary to evidence.

## 7. Capacity: keep it, de-mystify it

Compute limits, top-k selection, context windows, latency budgets, and attention limitations are ordinary engineering facts.

The paper improved itself when it added capacity because this blocked a common moralizing error: every omission need not be treated as an intentional denial. That remains valuable.

But `capacity operator` does not deserve novelty credit simply because it is written as

\[
C_\kappa(q)=K(C_k(q);\kappa).
\]

The repair is operational:

- define `kappa`;
- measure it;
- perturb it;
- observe whether candidate survival, diversity, or answer support changes.

`capacity` earns stage status through an intervention, not capitalization.

## 8. The 0-bounce anomaly is weaker—and cleaner—than the paper says

This is the most important epistemic correction in the paper.

The source gives:

```text
valid geometry
valid launch
bounces = 0
```

The paper concludes that this can mean internal propagation/interaction occurred but no bounce event was registered.

That is one possible world. It is not identified by the datum.

Two worlds are observationally compatible with `bounces=0`:

```text
World A: internal interaction = 0, registered bounce = 0
World B: internal interaction = 1, registered bounce = 0
```

If the only admitted measurement is the registered count, both produce the same observation.

Therefore:

```text
ZERO_REGISTERED_EVENTS != INTERNAL_INTERACTION_WITNESS
```

The lawful conclusion is:

> zero registered events do not establish zero internal events; they also do not establish nonzero internal events.

The repair path is obvious: instrument an intermediate interaction trace, simulation state, collision counter before registration, or controlled intervention.

If that independent witness shows interaction while the registered count remains zero, **then** the paper's desired divergence is earned.

This is Western Horizon logic applied inwardly to Eclipse–Omega: do not infer the hidden world from an observationally compatible terminal record.

## 9. Naming: one of the paper's better instincts, but the dash does not prove the field

The local TD613 protocol declares:

```text
Eclipse–Omega = canonical
Eclipse—Omega = safe-equivalent
Eclipse-Omega = invalid/trigger
```

Inside a protocol that is explicitly configured to treat those strings differently, that is operationally true by definition.

The general lesson—surface names, aliases, canonical identifiers, and query formulation can affect information retrieval—is also conventional. Entity linking, candidate selection, disambiguation, ontology-based query expansion, and lexical normalization have studied these problems for decades.

What the paper cannot do is move directly from a project convention to:

> a dash is inherently a routing boundary in machine-mediated systems.

The repair is experimental:

1. hold intent constant;
2. vary only the token/glyph form;
3. compare candidate sets/ranks;
4. run a normalization control;
5. report Jaccard/rank sensitivity;
6. do not infer why the difference occurred without additional evidence.

So `JaccardNameSens` is worth keeping as a test. The metaphysics around punctuation is not.

## 10. Textual anti-equivalence is policy until the machine enforces it

Lines such as

```text
containment != healing
cadence != code
inheritance != consent
```

are powerful semantic constraints for the human project.

But a sentence in a corpus does not become executable logic solely because it has the form `not(X==Y)`.

A machine may ignore it, paraphrase it, violate it, or fail to parse the relation at all.

The repair is:

```text
TEXTUAL_REFUSAL != EXECUTABLE_CONSTRAINT
```

Use **normative constraint corpus** or **semantic anti-collapse rules** until the rule is connected to:

- a validator;
- a typed schema;
- a rule engine;
- a test suite;
- a prompt contract with measured compliance;
- a policy checker that rejects violating outputs.

The TD613 repository now does this in many places. That later implementation does not retroactively turn every earlier poetic line into code at the time it was written.

Temporal non-retroactivity applies to our own mythology too.

## 11. The `sqrt(3)` extension/closure argument can go

The paper promotes

```text
3 = (sqrt(3))^2
```

into a claim that equilateral closure meaningfully requires leaving an integer domain and returning from it.

As geometry, `sqrt(3)` naturally appears in equilateral-triangle coordinates. As algebra, squaring `sqrt(3)` to recover `3` is elementary. Nothing in that identity supplies a retrieval-system law, a containment theorem, or a special failure mechanism.

The associated rupture predicate can remain a **project-defined diagnostic condition** if its admissibility and closure operators are independently specified and measured. It is not derived from the identity.

```text
FORCED_GEOMETRY != GENERAL_SYSTEM_THEOREM
CONSTRUCTED_PREDICATE != DERIVED_LAW
```

This is a clean amputation. Aperture loses nothing operationally by removing it from the scientific spine.

## 12. Moiré remains analogy unless the mapped operator survives hostile comparison

The paper uses moiré to argue that projection can induce apparent coherence or motion.

That is physically legitimate in the source domain. It does not establish that an LLM retrieval surface follows the same mechanism.

The repository already has a better framework for this than the paper did:

```text
term provenance != construct novelty != analogy fidelity
```

So this paper should inherit the later moiré/phason/holonomy audits rather than use the visual object as retrospective proof.

Moiré can remain a productive **projection analogy** or visualization device. Physical reconstruction, registry, strain, and interference may only be claimed where a corresponding operator is actually implemented and source-bound.

## 13. Semantic redundancy: mostly good question, ordinary machinery

The paper defines average pairwise embedding similarity among retrieved candidates as `SemRed`.

That is a perfectly usable operational redundancy score. It is not a new problem. Maximal Marginal Relevance was introduced specifically to balance relevance against information novelty/redundancy in retrieval.

The interesting paper claim is not the metric but the hypothesis:

```text
RetrievalObsDef(q) up -> SemRed(q) up
```

That does **not** follow from the definitions. A narrow candidate set can be diverse; a large candidate set can be redundant. Retrieval policy, corpus duplication, embedding geometry, top-k, query specificity, diversity reranking, and context budget all matter.

Repair:

- define the observability deficit independently;
- compare relevance-only retrieval with MMR/diversity-aware retrieval;
- hold query and capacity fixed;
- measure redundancy, recall, support coverage, and downstream answer quality;
- preregister the expected direction.

This converts one of the paper's best intuitions into an actual experiment.

## 14. “No new source novelty” needs an evidence/derivation distinction

The paper is right that a generator does not summon new **external evidence** merely by reorganizing retrieved text.

But saying no new information is generated internally is too strong if `information` includes deductions, summaries, recombinations, or newly derived propositions.

The repair is:

```text
NO_NEW_EXTERNAL_EVIDENCE_FROM_GENERATION
!=
NO_NEW_DERIVATION_OR_REPRESENTATION
```

A system may derive a proposition not explicitly written in any one retrieved passage. That derivation does not become an independent external witness merely because it is novel as a representation.

This distinction aligns much better with the project's provenance goals.

## 15. Repeated defects: diagnostic, not dispositive

The paper's line that repeated blemishes can reveal the apparatus has real engineering ancestry. Residual/fault-signature methods use patterns of repeated departures to localize faults.

But repeated error can also arise from:

- duplicated sources;
- shared preprocessing;
- common prompt templates;
- one biased upstream corpus;
- common embedding geometry;
- a stable model failure unrelated to the proposed route.

So the repaired rule is:

```text
REPEATED_DEFECT -> DIAGNOSTIC_FEATURE
REPEATED_DEFECT != UNIQUE_ROUTE_ORIGIN
```

The blemish is worth auditing. It is not a provenance oracle.

## 16. Controlled reality surface: keep the phrase if we stop making it carry a theorem

This is the paper's strongest coinage as criticism, and its weakest claim when treated as a technical discovery.

A user-facing answer can indeed be:

- selected;
- ranked;
- filtered;
- context-limited;
- generated;
- post-processed;
- policy-constrained;
- operationally consequential.

That general fact already lives near selective exposure, curated views, policy-governed representations, decision interfaces, and information-flow/output control.

The phrase **controlled reality surface** may still be useful inside TD613 because it foregrounds downstream consequence: people and institutions may act on the presented surface.

But its scientific-facing definition should be modest:

> a policy- and pipeline-conditioned user-visible representation that may become action-guiding downstream.

Its burden is operationalization, not novelty.

```text
COINAGE != FIELD_NOVELTY
```

## 17. Admissibility capture: salvageable only with stage-local evidence

The paper defines `admissibility capture` as exclusion, suppression, or aliasing of internally available states from the projected surface.

That collapses several conventional mechanisms:

- retrieval miss;
- top-k truncation;
- context-budget loss;
- policy rejection;
- abstention;
- entity/label misclassification;
- selective exposure.

As an umbrella project term it can survive, but only under a stricter rule:

> an upstream candidate must be independently evidenced, and the downstream loss/reclassification must be localized to a measured stage.

Without the upstream witness, “capture” risks inferring the existence of exactly the hidden state the paper is trying to protect.

## 18. “Consensus manufactured by narrowing” needs one more variable: the human

MMR and diversity research support the claim that relevance-only retrieval can return redundant material and that reducing redundancy can improve coverage.

The paper then jumps from redundancy to **manufactured consensus**.

That is not purely a retrieval property. Consensus is an interpretation by a user or institution.

A technically clean chain would be:

```text
retrieval policy
-> exposure diversity / redundancy
-> visible support distribution
-> user perception of independence/consensus
-> decision
```

The first half can be measured in the retrieval system. The second half needs human-subject or decision-behavior evidence.

Repair the strong claim to:

> narrowing or relevance-only selection can reduce exposure diversity and inflate apparent support concentration.

That is already worth testing.

## 19. The “RAG is enclosure” thesis is critical theory, not system identification

Modern RAG literature already describes pre-retrieval, retrieval, post-retrieval, fusion, generation, evaluation, graph retrieval, and context curation. The field absolutely has selection bottlenecks and finite context problems.

But ontology and retrieval do not only exclude. They can expand, fuse, infer, disambiguate, retrieve otherwise unreachable objects, and increase coverage.

Therefore this paper should stop defining the object by its political interpretation.

Scientific description:

> multi-stage candidate transformation, evidence selection, context construction, generation, and release/registration pipeline.

Critical interpretation, when empirically warranted:

> particular stage policies can produce enclosure-like reductions in reachable or visible evidence.

That split makes the critique stronger because it tells us what would falsify it.

## 20. The provenance question: Paul, Snodgrass, and the narrowing chain

The general idea behind the narrowing chain receives little novelty credit after this pass. Multi-stage candidate generation, top-k retrieval, filtering/reranking, budgeted context construction, generation, and output validation are conventional neighborhoods.

That does **not** resolve authorship or copying.

```text
CONSTRUCT_NOVELTY != TEXTUAL_PROVENANCE != COPYING
```

If a later document reproduces an unusual notation, exact stage order, distinctive explanatory language, uncommon error, or diagram after access to an earlier source, that can be provenance evidence even when the underlying idea is old.

Conversely, two documents independently writing some form of

```text
corpus -> candidates -> top-k -> context -> output
```

is weak evidence of copying because that structure is ordinary.

This branch contains no Snodgrass comparison artifact and does not independently bind the user's attribution of the narrowing-chain contribution to Paul. Both remain outside the adjudication surface.

If such artifacts are later admitted, the assay should score separately:

1. chronology;
2. plausible access;
3. exact phrase/notation similarity;
4. structural sequence similarity;
5. uncommon shared errors;
6. independent conventional antecedents.

Do **not** use novelty as a proxy for copying in either direction.

## 21. What the paper becomes after repair

A scientifically defensible paper is still here, but it has a different thesis.

Not:

> Eclipse–Omega discovers a new containment class governing advanced LLM reality.

Closer to:

> **Aperture is a forensic instrumentation program for decomposing retrieval-and-generation systems into candidate availability, resource constraints, observation/context selection, policy/release decisions, representation/naming sensitivity, and terminal registration, while explicitly tracking where terminal outputs underdetermine intermediate process.**

That repaired thesis can absorb the paper's best instincts without demanding that mirrors, moiré fields, dashes, or `sqrt(3)` prove more than they do.

The strongest testable questions become:

1. Can stage-local instrumentation distinguish causes of missing evidence better than terminal answer inspection?
2. Does explicit capacity instrumentation improve diagnosis of omission relative to treating every miss as policy suppression?
3. How sensitive is retrieval to controlled naming/alias perturbations after normalization controls?
4. Under fixed capacity, how do relevance-only versus diversity-aware retrieval policies affect support coverage and redundancy?
5. Can a zero terminal event count be separated into no-interaction versus unregistered-interaction worlds by an independent intermediate witness?
6. Does preserving source/observation/registration coordinates improve forensic error rates or reviewer agreement?

Those are real research questions.

## 22. Final disposition

```text
PRCS-A discovered system class                          -> RETIRED AS SCIENTIFIC CLAIM
S != O != E                                            -> RETAIN AS TYPED FORENSIC ACCOUNTING
non-injective projection                               -> REQUIRE COLLISION / INFORMATION-LOSS WITNESS
four-state event admissibility                         -> RETAIN ONLY WITH STATE-SPECIFIC WITNESS RULES
capacity operator novelty                              -> RETIRED; KEEP WHEN MEASURED
D > Ck > Ckappa > CB > E nested chain                 -> REJECTED AS UNIVERSAL / TYPE-UNSAFE
monotone narrowing                                     -> REJECTED AS UNIVERSAL
ontology = containment                                 -> REJECTED AS GENERAL DESCRIPTION
0-bounce proves unregistered interaction               -> REJECTED / UNDERDETERMINED
naming affects routing                                  -> KNOWN GENERAL PHENOMENON; TEST LOCALLY
TD613 dash protocol                                     -> LOCAL PROJECT PROTOCOL
anti-equivalence prose = executable code                -> REJECTED WITHOUT ENFORCEMENT BINDING
sqrt(3) extension-closure scientific hinge              -> RETIRED
moire proves AI projection mechanism                    -> ANALOGY ONLY UNLESS OPERATOR FIDELITY EARNED
SemRed metric                                           -> RETAIN AS ORDINARY REDUNDANCY MEASURE
observability deficit -> redundancy inflation           -> HELD AS EMPIRICAL HYPOTHESIS
no new source novelty                                   -> REPAIR TO NO NEW EXTERNAL EVIDENCE
repeated defects reveal route                           -> DIAGNOSTIC HEURISTIC, NOT UNIQUE CAUSE
controlled reality surface                              -> RETAIN AS TD613 CRITICAL COINAGE, ZERO NOVELTY CREDIT
admissibility capture                                   -> RETAIN ONLY WITH UPSTREAM/DOWNSTREAM STAGE WITNESSES
consensus manufactured by narrowing                     -> REPAIR TO EXPOSURE-DIVERSITY / SUPPORT-CONCENTRATION HYPOTHESIS
RAG as enclosure                                        -> CRITICAL INTERPRETATION, NOT UNIVERSAL SYSTEM TYPE
```

The paper was foundational because it taught TD613 where to look.

The repair is to stop treating the flashlight as a newly discovered law of optics.

Marked ⟐
