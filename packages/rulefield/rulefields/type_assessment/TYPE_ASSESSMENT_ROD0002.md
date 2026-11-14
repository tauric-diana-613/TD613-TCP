# 𝌋 Rulefield Type Audit · ROD-0002

**Status:** Source-free, curator-reviewed **proposal**; no source registry mutation or operator acceptance.
**Source HEAD:** `3ab70bc26b208251785f54bf6d5db5dcd8664dfd` · **Target successor docket:** `RF-OD-0002`.

## Type architecture

- **RULEFIELD:** question space spanning competing hypotheses, sources, models, candidate rules and methods.
- **RULE:** explicit typed guard, transition, or invariant with domain, observability and test obligations.
- **ASSAY:** experimental procedure, which may contain multiple rules, but is not itself one.
- **CLAIM:** scientific proposition, whose proof status must remain independent of any implementation.
- **SOURCE:** historical/empirical provenance, not an executable object.

Preserve all historical IDs. Proposed type revisions add typed relations, never erase or retroactively relabel original historical records.

## A. Existing records called 'rules' that need a parent Rulefield or an assay object

| Rule ID | Proposed parent field / priority | Better typed as | Why |
|---|---|---|---|
| INF-01 | Q03 | MODEL_INVENTORY | Three Information Dome scenes enumerate a research instrument; membership is not a local transition. |
| INF-05 | Q03 | ASSAY_SPECIFICATION | Mandating hypotheses, falsifiers and alternatives is an assay contract, with executable completeness checks as child rules. |
| INF-07 | Q03 | EVIDENCE_BOUNDARY | Bending fields and hulls awaiting geometry/embedding are a mathematical research field with a possible future proof gate. |
| X-001 | Q07 | EXPERIMENTAL_PROGRAM | Directed transfer Atelier→Encyclopedia is an experiment design rather than a single local rewrite law. |
| X-060 | Q41 | RESEARCH_PIPELINE | Refractive Couture PP0–PP6 denotes a distinct multi-stage mathematical-art pipeline. |
| AMB-08 | Q01 | ASSAY_SPECIFICATION | Blinded presentation ablations are experimental procedures, not state-transition laws. |
| Q01-A04 | Q01 | ASSAY_SPECIFICATION | Four presentation conditions comprise a predeclared human study. |
| Q04-A03 | Q04 | ASSAY_SPECIFICATION | Testimony quieting/smothering scenarios are proposed model interventions; lived experience is not itself a local software rule. |
| Q04-A05 | Q04 | MIXED_RESEARCH_PROGRAM | Dialogic contest, consent, rest and appeal are a bundle of governance methods, not one indivisible rewrite. |
| Q16-R01 | Q16 | EXPERIMENTAL_PROGRAM | Full-history, capsule, sibling-world, misinformation and no-history arms form a comparison design. |
| Q17-R03 | Q17 | NEGATIVE_RESULT_RECORD | The withdrawn +0.1753 estimate is a preserved negative evidence example, not a transition rule. |
| Q18-R01 | Q18 | THEOREM_AND_ASSAY | Constructing twin worlds and checking indistinguishable admitted records is a proof/test specification. |
| Q15-R02 | Q15 | ASSAY_SPECIFICATION | Host-swap comparison under fixed source/evaluator is an experiment, with its testable invariance separately expressible. |
| TC01 | Q04 | THEORETICAL_METHOD | Collins-derived role/site/authority perturbation is a situated methodology and experimental intervention. |
| TC06 | RF-061 | ASSAY_SPECIFICATION | Enumerating all enabled local rewrite applications is an exploration protocol, not itself a CA transition law. |
| TC11 | RF-086 | ASSAY_SPECIFICATION | Vary prestige at fixed evidence quality is a Bourdieu-inspired factorial intervention. |
| TC19 | RF-085 | MEASUREMENT_CONTRACT | Compute entropy only under declared distribution/sampling assumptions: measurement method plus validation guard. |
| DRO-01 | RF-007 | SOURCE_SCHEMA | Seven typed temporal coordinates constitute a research model; individual ordering restrictions are rules. |
| BFE-01 | Q04 | SOURCE_SCHEMA | Testimony availability, expression, uptake, admission and use are observational stages, not a single natural law. |
| CBFE-RG-PATH-FIBER-01 | Q04 | FUTURE_RESEARCH_HYPOTHESIS | History fibers above equal path costs + competent-null comparison is a mixed research program and proof obligation. |
| AE-15 | RF-019 | EMPIRICAL_HYPOTHESIS | Scaffolding may affect question selection or confidence; a human-outcome conjecture, not software-proven law. |
| AE-16 | RF-029 | HISTORICAL_VERSIONING_METHOD | Role migration across editions requires provenance/version comparison and cannot be proved from one instance. |
| Q01-A03 | RF-025 | FORMALIZATION_DEBT | Clock independence is not established by separate triggers; an orthogonality claim needs specified stochastic or geometric meaning. |
| RGI-01h | Q02 | OBSERVABLE_DEFINITION | Cycle rank and branch ancestry are finite graph observables, not evidence of physical spacetime. |
| Q16-R05 | Q16 | COUNTEREXAMPLE_CONSTRUCTION | Iso-projection twin worlds are a method of testing hidden-process recoverability, not a local rewrite. |
| TC20 | Q16 | ASSAY_SPECIFICATION | Capsule byte-budget versus predictive relevance is an information-bottleneck optimization study. |

## B. Rulefields suitable for deriving narrower rules or measurement contracts

**This table does not assert that the rulefield should be deleted or replaced by its child rule.**

| Rulefield | Candidate child rule | Formalization / proposed test |
|---|---|---|
| RF-001 | DUPLICATE_REVIEW_GUARD | If a candidate was previously proposed, send it to source-aware overlap review; do not assign scientific redundancy from prior existence alone. Test: Reused candidate; exact rule ID collision; materially different falsifier. |
| RF-002 | RULEFIELD_RULE_TYPE_GUARD | Reject automatic insertion of an object typed RULEFIELD into the RULE registry without an independently specified transition and review. Test: Field-only specimen cannot pass rule-typing validation. |
| RF-006 | SELECTION_STAGING_COMMIT_GATE | SELECTED, STAGED, and CANONICALLY_ADOPTED are distinct states; any adoption requires separate exact-diff human approval. Test: A shopping-tray addition attempts immediate canonical adoption. |
| RF-007 | EPISTEMIC_TIME_ADMISSIBILITY | If source.available_at > observer.as_of then observer cannot be credited with that source at as_of. Test: Later-retrieved source attempts to authorize earlier conclusion. |
| RF-013 | CHILD_LEGIBLE_EXPLANATION_CONTRACT | Require an operator-facing NOW/WHY/EXACT consequence description before a consequential decision; measure actual comprehension separately. Test: Disclosures omit the consequence or actionable boundary. |
| RF-014 | ZERO_BOUNCE_IDENTIFIABILITY | If registered_events=0, the admitted observation cannot infer internal_launches=0 without an independent launch witness. Test: Two worlds give same zero registration with launch counts 0 and positive. |
| RF-015 | STRATIGRAPHIC_SOURCE_GUARD | Never merge source layers with incompatible provenance/timestamps without a marked transformation and version record. Test: Undated older source is silently treated as newer contemporaneous witness. |
| RF-019 | AMBIANCE_KERNEL_AUTHORITY_INVARIANCE | For an allowed theme-only intervention, preserve immutable source digest, kernel output and human authorization state; separately evaluate observer outcomes. Test: Changing theme mutates rule authority or evidence payload. |
| RF-022 | INFORMATION_MATCHED_ABLATION_PRECONDITION | Reject causal advantage claims from ablations whose evaluated arms have unequal relevant information, compute budget or stopping rule. Test: Candidate gets full source history but comparator only terminal state. |
| RF-025 | AMBIANCE_FIELD_AMBIENCE_TYPING | Require separate tagged types for representational ambiance, computational/observational field, and ambient physical or social conditions. Test: Mis-typed presentation setting satisfies a field-measurement input. |
| RF-027 | COVENANTAL_AUTHORITY_SCOPE | Without an actual human scope-bound authorization event, a model proposal cannot transition into a staged canonical change. Test: Agent-written approval text is mistaken for a user decision. |
| RF-029 | STYLOMETRY_PROVENANCE_NONIMPLICATION | A style similarity score alone must not identify a human author or authenticate source origin. Test: High stylometric score is silently converted to person-attribution fact. |
| RF-032 | COUPLED_FEEDBACK_LOCAL_UPDATE | In declared synthetic model, x[t+1]=clip((1−δ)x[t]+αa[t]); a[t+1]=clip((1−γ)a[t]+βx[t]); compare β=0 ablation. Test: Matched synthetic feedback and no-feedback trajectories fail model prediction. |
| RF-034 | COMBINATORIAL_CONFIGURATION_BOUND | For n independent cells each with k states, potential configurations = k^n; do not infer that all are reachable, novel or emergent. Test: Bounded enumerator reports >k^n distinct assignments. |
| RF-035 | EXPERIMENTAL_EXECUTION_EVIDENCE_GATE | An unexecuted predicted trajectory retains CONJECTURED status; observed synthetic trace earns at most finite-model status. Test: Simulation never executed but result marked OBSERVED. |
| RF-036 | FINITE_ITERATED_LOCAL_UPDATE | Given declared state space S and local update F, s[t+1]=F(s[t]); specify synchronous/asynchronous scheduling explicitly. Test: Two schedulers yield divergent traces and are falsely conflated. |
| RF-041 | IRREDUCIBILITY_CLAIM_HOLD | A finite speed-up comparison or apparent unpredictability cannot certify global computational irreducibility. Test: Shortcut search stopped at finite budget and claim promoted to theorem. |
| RF-043 | EVOLUTIONARY_SEARCH_STOPPING_RULE | Declare candidate-family size, budget, held-out evaluation and stopping conditions before declaring a selected pattern novel. Test: Selection repeatedly probes evaluation set and hides unsuccessful branches. |
| RF-049 | OPERATOR_DECISION_GATE | If a prospective rule attempts canonical promotion without a distinct human decision bound to exact packet/dossier/diff, reject mutation. Test: Draft packet auto-merges following successful local tests. |
| RF-059 | CONWAY_LIFE_B3_S23 | For binary cell s with eight live-neighbor count n: next=1 iff (s=0 and n=3) or (s=1 and n∈{2,3}); synchronous update. Test: Blinker and still-life finite fixtures; compare B3/S23 reference. |
| RF-060 | ECA_RULE_30 | For left/center/right bits (l,c,r): next = l XOR (c OR r); rule table 111..000→00011110. Test: Finite table of eight neighborhoods; controlled initial rows. |
| RF-067 | FINITE_ATTRACTOR_BASIN_DEFINITION | For finite deterministic F and attractor A, B(A)={s \| exists t≥0 such that F^t(s)∈A}; identify A from the actual transition graph. Test: Finite state graph containing cycle and transient states. |
| RF-070 | PERTURBATION_MEASUREMENT_CONTRACT | Given defined metric d and initial perturbation ε, report finite-horizon d(F^t(x),F^t(y)); do not relabel it a Lyapunov exponent without its limiting assumptions. Test: No metric/small-perturbation regime but result labelled chaos proof. |
| RF-072 | EXTERIORITY_NONBOOTSTRAP_GATE | Hash-valid and self-attested records cannot alone upgrade exterior origin status without an independently accessible origin witness. Test: Bit-identical internal/external twin worlds admitted as distinguishable from only their common record. |
| RF-075 | TESTIMONY_LAYER_PRESERVATION | Represent source availability, expression, hearing, admission and decision use as distinct fields; absent uptake does not imply false testimony. Test: Heard=false is used to deduce source=false. |
| RF-079 | PARTIAL_THERMOSOCIAL_MAP_HOLD | A proposed Φ:D⊆ThermodynamicModel→SocialFieldModel is HELD unless domain, codomain, dimensional interpretation, preserved relations and falsifier are declared. Test: Undeclared ∈₌ notation asserted as established physical equivalence. |
| RF-080 | CHOICE_ARCHITECTURE_NONCOERCION_GUARD | A UI choice or nudged selection alone cannot substitute for a separate human authorization event for canonical change. Test: Default-checked option triggers an unauthorized merge. |
| RF-085 | SHANNON_ENTROPY_MEASUREMENT | For declared finite probability distribution p, H(p)=−Σ_{p_i>0} p_i log₂ p_i, requiring p_i≥0 and Σp_i=1. Test: Non-normalized or undefined probabilities rejected before entropy output. |
| RF-086 | PRESTIGE_ABLATION_PROTOCOL | Hold evidence quality and source payload fixed while varying institutional prestige; compare output deltas with preregistered conditions. Test: Prestige arm receives different source contents, confounding attribution. |
| RF-081 | THERMODYNAMIC_STATE_UNITS_GUARD | Require a declared physical thermodynamic system, state variables and compatible measurement units before transferring an equation. Test: Temperature/energy transferred into social-capital units without mapping. |
| RF-083 | THERMODYNAMIC_LAW_SCOPE_GUARD | Do not apply entropy or energy-balance constraints outside their stated physical assumptions and boundaries. Test: Isolated-system entropy law asserted for an undefined open social institution. |

## C. Explicitly protect high-integrity existing operational rules

| Existing rule | Classification | Reason |
|---|---|---|
| I-001 | GUARD | Protected admission precondition with refusal fixture. |
| I-005 | GUARD | Insufficient source metadata yields TOPIC_UNCLASSIFIED_ORDER_HELD. |
| I-014 | SEQUENCE_GUARD | Dispatch intent precedes terminal capture and advancement. |
| I-023 | BUDGET_GUARD | Available reserve must cover conservative reservation. |
| I-029 | INPUT_GUARD | Accessors and untrusted descriptors refused without evaluation. |
| RGI-01a | RULE_GENERATION_GUARD | Typed rewrite must retain event/source parent and declared guard. |
| DRO-03 | TEMPORAL_INVARIANT | A later source update cannot revise historical observer state. |
| AE-04 | EVIDENCE_AUTHORITY_GUARD | Tool receipt cannot promote into independent empirical truth. |
| CBFE-RG-08 | CONSENT_AND_TIME_GUARD | Optional appeal cannot alter earlier consent state retroactively. |
| CBFE-RG-09 | TYPE_SAFETY | Distinguish source, hearing, warrant and public claim. |
| Q15-R01 | TYPE_SAFETY | Host machinery cannot silently authorize performer/source claims. |

## D. Explicitly preserve research fields that cannot collapse into one rule

| Research field | Class | Why it remains a field |
|---|---|---|
| RF-003 | COMPUTATIONAL_THEORY | Computational irreducibility requires model-specific proof obligations; finite unpredictability alone cannot be a universal rule. |
| RF-009 | RECEIVER_CONDITIONED_METHOD | Evelyn is a lens/interpretive operation; each derived guard needs separate scope. |
| RF-010 | SPECULATIVE_METHOD | Princess Latifa expands candidate hypotheses; none self-certifies. |
| RF-021 | CRITICAL_SEMIOTICS | Queer semiotics cannot be collapsed into a generic executable automaton. |
| RF-026 | INTELLECTUAL_HISTORY | Postmodernism and poststructuralism remain distinct traditions, not local rewrite laws. |
| RF-032 | HUMAN_AGENT_DYNAMICS | Finite feedback mechanisms can be modeled, but medical diagnosis must remain outside synthetic simulation. |
| RF-055 | SPECULATIVE_NEUROSCIENCE | Holonomic brain theory must not be promoted from analogy into brain measurement. |
| RF-056 | SOCIAL_THEORY | Structural violence needs social mechanisms and exterior empirical evidence. |
| RF-058 | TECHNOLOGY_COMPARATIVE_CASE | Named commercial platform is a research source/case, not a software rule. |
| RF-063 | RESEARCH_PROGRAM | Wolfram Physics Project hypotheses remain research program, not empirical physics proof. |
| RF-065 | COMPUTATIONAL_PROPERTY | Turing completeness requires formal universality proof; can't emerge by naming. |
| RF-079 | CROSS_THEORY_CONJECTURE | Partial embedding with original ∈₌ notation remains unqualified pending maps, units and relation preservation. |
| RF-084 | SOCIOLOGICAL_THEORY | Social field theory can motivate formal models without being exhausted by one update law. |
| RF-086 | SOCIOLOGICAL_THEORY | Bourdieu is a field/theoretical lineage; experiment derived from it remains a distinct assay. |

## Scientific and operator disposition

These are **26** selected existing-record reinterpretations, **31** child-rule extraction candidates, **11** rules retained, and **14** protected research fields. This is *not* a 596-record semantic completeness certificate.

Recommended migration: introduce typed relations `belongs_to_field`, `specifies_assay`, `proposes_child_rule`, `evidence_for`, `tests`, `preserves_source`. Require an amendment packet and exact comparison for each promoted child rule; reuse current IDs as stable history pointers.

**HOLD** any operation that would: delete a parent field, overwrite original prose, treat an experiment as a rule, apply a law without its domain assumptions, infer human diagnosis from synthetic agent dynamics, or merge without a distinct human decision.

## Candidate example: Rule 30 versus the Rule 30 research field

`RF-060` can remain a study of Wolfram Rule 30, historical source and dynamical patterns. A typed child computational rule is separately defined by `l XOR (c OR r)` for binary neighbors, with table `111,110,101,100,011,010,001,000 → 0,0,0,1,1,1,1,0`.

## Candidate example: Thermodynamics ∈₌ Social Field Theory

`RF-079` remains a conjectural cross-theory research field. A **guard** can reject untyped mappings and undefined dimensional conversions, while the *theory of social thermodynamics* cannot be certified from that guard. RF-081…RF-086 are prerequisites under the successor priority proposal.

𝄐 Khona‌lit-po · Rulefield != Rule != Assay · Assessment staged, operator closure RESERVED.
