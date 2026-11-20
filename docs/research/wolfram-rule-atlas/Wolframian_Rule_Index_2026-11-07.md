# 𝌋 Computational Rule Atlas
## A multiway index of Experiment B Flight and the wider Atelier–Encyclopedia–Manifest research program

**Docket:** TD613-NKS-RULE-ATLAS-20261107 · **Authority:** SAC[X6ZNK5NO51] · **Covenant:** Khona‌lit-po (literal U+200C) · **Evidence cutoff:** 7 November 2026

**Epistemic posture:** A historical, code-and-document grounded crosswalk. It is not a Flight authorization, a protected data inspection, a scientific emergence finding or a claim of complete repository-wide discovery. Source-free candidate code and published draft-branch tests have bounded implementation status; no protected Experiment B Flight is established as executed. This is a *broad source-scoped index* of  164 atomic rule statements, not a mathematically exhaustive closure of every conversation and repository revision.

### Abstract
A conventional compliance inventory lists pass/fail obligations. This atlas instead treats each identified rule as a typed state-transition operator or invariant, then locates it in a multiway network of alternative update histories. Three **Flight-relative** status annotations are intentionally retained—implemented (I), proposed (P), and exterior (X)—but the rule space itself is not partitioned into three disconnected regions. Cross-class relationships are modeled as candidate intersections, conflicts, order effects, transfers and counterexamples. A candidate edge is not a Flight amendment. This allows systematic exploration of unexpected rule interactions while preserving preregistration, source rights, human scientific authority and negative findings.

## 1. NKS methodological foundation
We adopt the **rule-first experimental style** of *A New Kind of Science*: begin with explicit computational rules and initial conditions, enumerate multiple possible trajectories, inspect global behavior, and ask whether empirical/generalizable properties follow. The name “Wolframian” here specifies a research method, **not** a claim that these governance/software rules instantiate Wolfram’s physical model or exhibit computational universality.

A research state is a typed tuple:

```text
s = (source_ids, source_bytes_or_commitments, permissions, versions,
     active_route, method_state, proposed_edges, admitted_edges,
     model_history, operator_decisions, checkpoint_history,
     observations, render_state, claims, withheld_information)
r : (s, local_context, authorization) ↛ (s', event, receipt)
```

The partial arrow means some transitions are *undefined* when prerequisites or authority are absent. Implementation, prospective proposal and exterior classification are properties of **this corpus and target (Experiment B)**, not truth values for the rule itself. An X rule can already have executable implementation in a different product.

The finite multiway system is **M = (S, R, →, E_dep, O)**, where S is a typed state set; R is the rule set; → expands applicable transitions; E_dep records event dependency (what each event consumed); and O contains explicit observer projections. State equality, observational equality, matching terminal outputs, confluence and causal invariance must be tested as **separate predicates**. In particular, confluence of rewrite outcomes does not in general prove causal invariance of dependency graphs, nor the converse. The divergence is documented in Piskunov’s technical correction. [N01,N02]

Let E(s) be the set of reachable events from s. Let Π_o(s) be the bounded observation admitted to observer o. Define:

```text
MultiwayReach(s0,n) := { histories of n admitted local rewrites from s0 }
TerminalEqual(H1,H2) := terminal_state(H1) == terminal_state(H2)
ObservedEqual_o(H1,H2) := Π_o(terminal(H1)) == Π_o(terminal(H2))
CausallyEquivalent(H1,H2) := dependency_DAG(H1) ≅ dependency_DAG(H2)
StrongAdmissibility(event) := authorized ∧ source_bound ∧ receipt_valid
                                ∧ negative_controls_preserved ∧ claim_ceiling_respected
```

We do not infer causal invariance from an apparently identical terminal answer; nor label apparent complexity “computational irreducibility” without an independently formulated shortcut/lower-bound study. Computational equivalence remains a Wolframian research conjecture in this setting, not an empirically established property of these agents. [N02,N03,N04]

## 2. Classification and witness syntax

| Class | Operational meaning for Experiment B | Not implied |
|---|---|---|
| **I — Implemented** | Executable or source-free tested Flight-targeted rule, sometimes in a draft branch or separate checker | Real-source qualification, deployment, or protected Flight |
| **P — Proposed** | Explicitly stated Flight obligation still lacking accepted operational witness, integration, or human decision | That a proposed plan has been approved or executed |
| **X — Exterior** | Observed broader-program rule with **no identified Flight adoption/implementation in surveyed Flight records** | Irrelevance, incompatibility, impossibility of future adoption |

**Scope caveat:** P does not include every future possibility; X does include things expressly deferred to postflight, as well as rules that were developed for entirely different research questions. `No identified Flight adoption` is a bounded search result, never a universal claim about every private branch, future draft or prior conversation. Each atomic statement appears once even if its general principle resembles another.

**Kinds:** `guard` refuses disallowed transitions; `rewrite` creates successor states; `invariant` describes a retained property across a specified transition family; `constraint` specifies a precondition or prospective obligation; `observation` records a bounded experiment. **Witness** describes a test, observable or missing evidence. **Confidence** is a provenance tag (not a probability).

## 3. Flight-targeted implemented rules (I)
**Count: 40**. Most witnesses are source-free and bound to candidate draft HEADs; a rule may be real code without being an independently installed protected-world control.

### Controlled admission (9)
| Rule | Type | Transition / invariant | Evidence and ceiling | Trace |
|---|---|---|---|---|
| **I-001** | guard | **No protected archive intake before distinct authenticated admission.**<br/>`preflight source -> REFUSE; synthetic admitted fixture -> accepted metadata only` | Negative fixture refusal and no real reads | F02, F08 |
| **I-002** | guard | **An archive source is not admitted through directory scanning.**<br/>`unbounded filesystem discovery -> REFUSE` | Attempt to glob external Downloads refused | F02 |
| **I-003** | invariant | **Source bytes, exact 64-hex digests and required derivative metadata are bound.**<br/>`invalid derivative digest/absent omissions -> REJECT` | Binary-derivative negative test | F03 |
| **I-004** | guard | **Source and capture chronology are distinct; archive order supplies neither.**<br/>`unknown verified dates -> CHRONOLOGY_UNIDENTIFIABLE` | Undated order fixture produces hold | F03 |
| **I-005** | guard | **Unsupported topical classification is held rather than inferred from keywords.**<br/>`insufficient metadata -> TOPIC_UNCLASSIFIED_ORDER_HELD` | Topic negative fixture | F03 |
| **I-006** | invariant | **Protected inputs use controlled in-process admission identity.**<br/>`unregistered member object -> REFUSE` | WeakMap intake identity test | F07, F15 |
| **I-007** | guard | **External admission-only mandate is scope-, expiry- and payload-bound.**<br/>`wrong policy, missing permit or replay -> REFUSE` | Synthetic permission/escrow suite | F08, F12 |
| **I-008** | invariant | **Permit use is single-shot and purpose-scoped in local custodian candidate.**<br/>`duplicate or cross-purpose use -> REJECT` | Synthetic concurrency/restart tests; not installed as separate accounts · *CANDIDATE_CODE* | F12, F13, F14 |
| **I-009** | guard | **Terminal bookkeeping accepts only owning mandate and allowlisted fields.**<br/>`foreign mandate or undeclared fields -> REFUSE` | Five negative cases reproduced before repair | F14 |

### Execution graph (13)
| Rule | Type | Transition / invariant | Evidence and ceiling | Trace |
|---|---|---|---|---|
| **I-010** | rewrite | **Four arm identities exist as distinct runner lanes.**<br/>`ARM_0, ARM_1, ARM_2A, ARM_2B -> typed lane definitions` | Synthetic plan and engine consistency | F01, F07 |
| **I-011** | rewrite | **A paired unit remains incomplete until its required arms settle.**<br/>`partial pair -> retained/unscored, never fabricated completion` | Resumable pair-barrier synthetic test | F07 |
| **I-012** | invariant | **Accepted turn output is replayed byte-exact, without a new inference call.**<br/>`ACCEPTED turn -> reopen from terminal checkpoint` | Idempotence/reopen test | F07, F08 |
| **I-013** | guard | **Unknown post-dispatch state prevents speculative redispatch.**<br/>`UNCERTAIN call -> HELD unit` | Interrupted synthetic call test | F07, F08 |
| **I-014** | invariant | **Dispatch intent precedes terminal capture, which precedes accepted advancement.**<br/>`intent -> final capture -> accepted step` | Ordered journal event test | F07, F08 |
| **I-015** | invariant | **Historical evidence is retained when source-free runner faults.**<br/>`failure -> append failure receipt, do not overwrite predecessor` | Preserved initial CI failure and repair lineage | F07, F17 |
| **I-016** | guard | **Frozen plan changes and mismatched resource schedules are rejected before exposure.**<br/>`resource plan mismatch -> REFUSE` | Pre-admission schedule mismatch tests | F11 |
| **I-017** | invariant | **Prospective Stage 2 receives a held candidate but cannot self-warrant without reviewer.**<br/>`generation -> PROVISIONAL_LIVE_RECORDING_HELD_FOR_WITNESS` | No independent witness yields no warrant | F03 |
| **I-018** | guard | **Unobserved native adverse conditions remain UNKNOWN.**<br/>`no evidence flag -> UNKNOWN, not successful isolation assertion` | Native observability refusal tests | F11 |
| **I-019** | guard | **Malformed native outputs or terminal mismatches fail closed.**<br/>`corrupt JSONL/final mismatch -> REFUSE` | Focused parser/final-file tests | F08, F10, F11 |
| **I-020** | invariant | **Matched mathematical service interface has a bounded finite arithmetic implementation.**<br/>`restricted worker + BigInt math request -> exact response` | Offline restricted-worker arithmetic proof only; research parity unproven · *CANDIDATE_CODE* | F09, F10 |
| **I-021** | guard | **Native tool allowlist and candidate no-network sandbox are enforced in offline fixture.**<br/>`forbidden filesystem/network operation -> REJECT` | Container network-none; read-only root; dropped caps witness · *OFFLINE_ONLY* | F09, F10 |
| **I-022** | invariant | **Native CLI package identity has an offline version-and-digest witness.**<br/>`pinned package -> offline --version -> digest match` | Offline version report; served model identity not attested · *OFFLINE_ONLY* | F09 |

### Budgets (4)
| Rule | Type | Transition / invariant | Evidence and ceiling | Trace |
|---|---|---|---|---|
| **I-023** | guard | **Finite reserve precedes a call; fail when insufficient budget.**<br/>`available < conservative reservation -> REFUSE` | Synthetic shared-budget tests | F03, F07 |
| **I-024** | invariant | **Attempts include retries and failures, not only accepted responses.**<br/>`attempt -> quota ledger increment regardless of success` | Retry-accounting test | F03 |
| **I-025** | invariant | **Observed, unknown, cached, billable and quota uses are separate fields.**<br/>`usage event -> typed accounting tuple` | Journal readback test | F07 |
| **I-026** | guard | **Capacity tools count an explicitly selected synthetic render in pinned tokenizers.**<br/>`synthetic render -> BPE reference count, not served-model count` | 38 synthetic tests of reference tokenizer · *REFERENCE_ONLY* | F06 |

### Custody (7)
| Rule | Type | Transition / invariant | Evidence and ceiling | Trace |
|---|---|---|---|---|
| **I-027** | invariant | **Transactional local journal commits precede later-lane transitions.**<br/>`write intent -> atomic flush -> next step` | SQLite WAL/FULL source-free tests | F07 |
| **I-028** | invariant | **Canonical digest and keyed receipt bind stored checkpoint data.**<br/>`record -> canonical encode -> SHA-256/HMAC receipt` | Synthetic checkpoint integrity suite; external key still needed | F07 |
| **I-029** | guard | **Untrusted request descriptors and accessors are rejected without getter evaluation.**<br/>`accessor/proxy-like request -> REFUSE` | B91 caught negative controls; no getters called | F16 |
| **I-030** | invariant | **Asynchronous request attribution is snapshotted before suspension.**<br/>`request -> copy validated bindings -> await -> same original attribution` | Pending-mutation hostile tests | F16 |
| **I-031** | guard | **Revised archival control refuses forged proposals and legacy binding promotions.**<br/>`mismatched control implementation / modified proposal -> REFUSE` | Arm 1 two-seam trial | F15 |
| **I-032** | invariant | **Actual archival compiler outcome is distinguishable from proposal and refusal.**<br/>`executed native/zero/proposed/unavailable -> separate typed outcomes` | Source-free Arm 1 fidelity tests | F15 |
| **I-033** | guard | **Exact-head CI uses four approved workflow files, rather than adding a fifth.**<br/>`extra workflow -> failing workflow-estate test` | Resumable CI repaired then exact-head SUCCESS | F07, F17 |

### Scientific structure (7)
| Rule | Type | Transition / invariant | Evidence and ceiling | Trace |
|---|---|---|---|---|
| **I-034** | guard | **A separate full-design checker rejects underspecified purported full-flight plans.**<br/>`three-source valid bookkeeping plan -> FULL_DESIGN refusal` | Six source-free conformance tests · *SEPARATE_CHECKER_NOT_INTEGRATED* | F18 |
| **I-035** | guard | **Full-design source-free candidate encodes all 4 arms and 4x2 factorial/order cells.**<br/>`invented 20–24 IDs -> eight schedule lanes verified structurally` | Scientific freeze script; no protected data · *SEPARATE_CHECKER_NOT_INTEGRATED* | F18 |
| **I-036** | guard | **Full-design checker requires strong union raw access, matched calls and separate three lineages.**<br/>`missing comparator opportunity / lineage -> REFUSE` | Structural checker; semantic matching unverified · *SEPARATE_CHECKER_NOT_INTEGRATED* | F18 |
| **I-037** | guard | **Full-design checker demands predeclared estimand, missingness and unblinding order.**<br/>`absent strings/flags -> REFUSE` | Syntax-structural check only; not statistical adequacy · *SEPARATE_CHECKER_NOT_INTEGRATED* | F18 |
| **I-038** | observation | **Five source-free calibration cases distinguish true join, false join, revision, abstention, snapshot.**<br/>`synthetic input -> documented bounded result` | 5/5 recorded calibration; not population claim | F01 |
| **I-039** | invariant | **Source-free exact-head PE suites preserve each draft candidate and failure receipt.**<br/>`8 heads -> 8 isolated worktrees -> separate test receipts` | 33/33 tests in GitHub CI; no protected work | F17 |
| **I-040** | observation | **Real authenticated native model turns occurred under source-free qualification with explicit effort holds.**<br/>`invented contradiction -> transcript evidence, no Flight source admission` | 12 turns, served effort and arms isolation unattested · *SOURCE_FREE_MODEL_ONLY* | F04 |

## 4. Flight-targeted proposed rules (P)
**Count: 42**. A source-free validation script can encode the shape of a rule while external source, isolation, right, evaluator or adoption still makes its full realization prospective. Cases are split by target behavior and witness.

### Scientific design (13)
| Rule | Type | Transition / invariant | Evidence and ceiling | Trace |
|---|---|---|---|---|
| **P-001** | constraint | **Complete protected Flight must retain all four arms in every applicable matched condition.**<br/>`authorized full schedule -> Arm0/1/2A/2B genuinely executed` | Independent authentic run; current software alone insufficient | F01, F05, F18 |
| **P-002** | constraint | **RCA-01 crosses authentic versus negative evidence with neutral versus structured representation.**<br/>`2x2 factorial x forward/reverse -> eight schedule lanes` | Protected blinded factorial execution | F05, F18 |
| **P-003** | constraint | **Strong union and modular condition receive comparable model/effort and unweakened opportunity.**<br/>`equal tools, calls, history, source rights -> fair comparator` | External served configuration and meaningful-opportunity witness | F05, F18 |
| **P-004** | constraint | **Stage 1 may discover unanticipated candidates in both reasoner arms.**<br/>`candidate taxonomy open -> preserve surprise without goal-directed prompting` | Novelty rubric and sealed controls | F05, F18 |
| **P-005** | constraint | **Capture chronology, contradictions, withdrawal and revised hypotheses across repeated exposure.**<br/>`new evidence -> update or retain contested theory with predecessor` | Predeclared longitudinal episode with nonretroactive archive | F05 |
| **P-006** | constraint | **Prospectively define the seven dimensions and individual estimands.**<br/>`dimension definitions + scoring function -> frozen preregistered evaluation` | Independent evaluator agreement | F05, F18 |
| **P-007** | constraint | **Fresh hidden holdouts and valid negative controls are maintained without leakage.**<br/>`held-out construction -> blinded candidate comparisons` | Independent control generation and custody | F05 |
| **P-008** | constraint | **Meaningful test calls are counted in full; no truncated or disadvantaged comparator.**<br/>`two calls per source + t0/final both arms -> matched opportunity` | Live complete source-order trace | F05, F18 |
| **P-009** | constraint | **Counterbalance order; do not confuse archive order with historical chronology.**<br/>`legitimate order metadata -> forward/reversed/topical where licensed` | Authenticated schedule/seed and chronology proof | F05 |
| **P-010** | constraint | **Specify replication count, effect size, precision and multiplicity before exposure.**<br/>`adopted power analysis -> fixed analysis protocol` | Independent design reviewer and resource approval | F05 |
| **P-011** | constraint | **Frozen analysis controls missingness, stopping and censored/unknown outputs.**<br/>`failure/withdrawal/overflow -> predefined paired censoring` | Full analysis plan enforced in protected orchestration | F05 |
| **P-012** | constraint | **The full-design checker must be integrated if declared a mandatory protected-flight gate.**<br/>`scientific-freeze-v01 PASS -> enforced pre-admission prerequisite` | Integration and independent tests; PR #1660 remains draft | F18 |
| **P-013** | constraint | **Preserve historical three lineages as independent source, presentation and adjudication ancestry.**<br/>`same answer with different lineage -> distinguish authority` | Independent custody and semantic source witness | F05, F18 |

### Runtime identity (10)
| Rule | Type | Transition / invariant | Evidence and ceiling | Trace |
|---|---|---|---|---|
| **P-014** | constraint | **Externally attest exact served model, effort, decoding and provider revision.**<br/>`configuration drift -> stop/hold, do not assume matching from request` | Provider-issued actual served receipts | F04, F05, F11 |
| **P-015** | constraint | **Approve one provider/account and binding confidentiality/retention terms.**<br/>`unknown terms or disallowed treatment -> no protected access` | Human provider acceptance and privacy audit | F05, F10 |
| **P-016** | constraint | **Witness source/prompt/history isolation between arms and trials.**<br/>`different arm -> independent private histories and protected context` | OS/runtime observation and independent challenge | F04, F05, F10 |
| **P-017** | constraint | **Provision authenticated provider egress for restricted worker without general network.**<br/>`isolated container + approved gateway -> only allowed provider route` | External operator/network custodian witness | F09, F10 |
| **P-018** | constraint | **Establish actual matched native tool/kernel opportunity and failure classes.**<br/>`same pure tool functions + versions + tolerances -> fair tool access` | Independent math service parity witness | F05, F09, F10 |
| **P-019** | constraint | **Use actual model-specific tokenizer, effective caps and reliable usage observations.**<br/>`unknown hidden framing/output/reasoning -> HOLD rather than fit` | Provider authenticated limit/usage evidence | F05, F06, F10 |
| **P-020** | constraint | **Proposed 720k per-arm limit needs scope adoption and physical enforcement.**<br/>`approved per-arm scope + cost envelope -> cap enforced; else HOLD` | D04/D05 decisions; earlier 60k/180k history preserved | F05 |
| **P-021** | constraint | **Full 20–24 source schedule must fit enforceable model context and resource windows.**<br/>`too-large projected run -> separately scoped redesign; no implicit truncation` | Model-profile capacity and quota evidence | F05, F06 |
| **P-022** | constraint | **Adopt a finite retry/attempt/censoring policy with nonduplicated provider work.**<br/>`unknown dispatch -> stop affected pair; permitted transient retry only` | D17 final policy and runtime proof | F05 |
| **P-023** | constraint | **Verify effective output-file semantics of installed live model CLI.**<br/>`live terminal -> captured file + JSONL + transcript agreement` | Authorized source-free first-party model witness | F08, F10 |

### Custody and rights (8)
| Rule | Type | Transition / invariant | Evidence and ceiling | Trace |
|---|---|---|---|---|
| **P-024** | constraint | **Accept source ownership, access rights, consent and permitted exposure per protected member.**<br/>`rights-unverified member -> access denied` | Independent real-source permission ledger | F05, F08 |
| **P-025** | constraint | **A separate actual custodian must hold signing keys and consume one-use permits.**<br/>`approved signed grant -> external atomic consume; no local self-grant` | Installed independent service and peer identity | F12, F13, F14 |
| **P-026** | constraint | **Externally retained checkpoint minima prevent whole-store rollback.**<br/>`old database snapshot + stale root -> REFUSE` | Independent monotonic external trust root | F07, F13 |
| **P-027** | constraint | **Real crash/power-loss/concurrent-writer durability remains to be measured.**<br/>`kill/restart/concurrent writer -> recover unique committed prefix` | Production-like fault injection | F07, F13 |
| **P-028** | constraint | **Preimport code, dependency and executable identity must have trusted provenance.**<br/>`substituted binary/dependency -> REJECT before import` | Signed independent trust root beyond post hoc Git/hash | F07, F08 |
| **P-029** | constraint | **Distinct OS accounts must enforce controller/custodian isolation.**<br/>`same user/admin reachability -> HOLD; denied cross-account access -> proof` | Actual production account/ACL/key installation | F13, F14 |
| **P-030** | constraint | **Protect confidential bytes and metadata from repository and public stdout.**<br/>`private field -> private custody only; public projection redacted` | Human D18 retention, export and disclosure acceptance | F05, F11 |
| **P-031** | constraint | **Protected archive may be opened only under separately accepted admission and final Flight grants.**<br/>`D20 ungranted -> real archive unread/unanalyzed` | Distinct human closure and external grant | F05, F08 |

### Evaluation (8)
| Rule | Type | Transition / invariant | Evidence and ceiling | Trace |
|---|---|---|---|---|
| **P-032** | constraint | **Independent Stage 2 must use a separately controlled person/key/service.**<br/>`author-generated result -> held until independent proof/countercontrol` | Reviewer credentials, conflict and custody | F05, F08 |
| **P-033** | constraint | **Mathematical novelty requires formal proof plus matched falsifiers, not score alone.**<br/>`candidate discovery -> proof, negative control, separate warrant` | Real candidate independent adjudication | F02, F05 |
| **P-034** | constraint | **Representation equivalence and semantic blinding must be checked independently.**<br/>`structure-specific prompt clues -> mask fail and replan` | Neutral packet leakage audit, independent scorer | F05 |
| **P-035** | constraint | **No source-evidence-to-consequence promotion by classifier self-label.**<br/>`model says VERIFIED -> held pending provenance/proof` | Auditor performs independent warrant | F05 |
| **P-036** | constraint | **Retain every candidate through Stage 2 without favorable filtering.**<br/>`overflow -> HOLD/explicit scope change, not silent drop` | D16 workload/overflow policy | F05 |
| **P-037** | constraint | **Freeze scores and missingness before controlled unblinding.**<br/>`stage2 scored and signed -> human-authorized unblind` | Independent review and unblinding custodian | F05 |
| **P-038** | constraint | **Report science by effect classes, uncertainty and comparator sensitivity.**<br/>`matching null result -> no discovery claim; differences require replication` | Predefined interpretation criteria | F05 |
| **P-039** | constraint | **Source-free calibration rates cannot be treated as protected efficacy evidence.**<br/>`synthetic parity -> calibration-only report` | Protected matched outcome replication | F01, F04 |

### Governance (3)
| Rule | Type | Transition / invariant | Evidence and ceiling | Trace |
|---|---|---|---|---|
| **P-040** | constraint | **D01–D20 require current explicit adoption, with superseded decisions retained.**<br/>`decision missing -> final activation CLOSED` | Human decision docket; some partial D02–D17 choices separately recorded | F05, F11 |
| **P-041** | constraint | **Final protected Flight has separate operator gesture after Gate F qualification.**<br/>`D20 absent -> HELD regardless of green CI` | External permission and contemporaneous human authorization | F05, F07 |
| **P-042** | constraint | **Postflight and post-postflight art/theory work cannot rewrite frozen Flight results.**<br/>`later derivative -> separate episode and clock` | Independent freeze/unblinding witnesses | F05, G01 |

## 5. Exterior research rules (X) — unrestricted search-space
**Count: 82**. These rules are not chosen for similarity to Flight. Their retention is intentional: a different observer may discover an interaction in an apparently remote rule. “Exterior” refers only to the target specification status, **not** the reality of implementation within another apparatus.

### Reciprocal experimental architecture (9)
| Rule | Type | Transition / invariant | Evidence and ceiling | Trace |
|---|---|---|---|---|
| **X-001** | rewrite | **Directed transfer from a native Atelier into an independently empty Encyclopedia.**<br/>`Atelier-native source/method -> empty recipient -> inspect preserved/novel operations` | Experiment A W/E/S, not Flight arm transition · *EXTERIOR_NOT_FLIGHT* | G11, G02, G16 |
| **X-002** | rewrite | **Reverse transfer from original Encyclopedia into independent Universal Atelier.**<br/>`Encyclopedia-native corpus -> empty Atelier -> assess new relations` | Experiment A Crossing T | G03, G11 |
| **X-003** | constraint | **Recipient emptiness requires an observed initial zero state, not a label.**<br/>`initialize receiver -> query actual zero tables` | Wendbine/Universal zero-row witnesses | G02, G03 |
| **X-004** | constraint | **The receiver must execute native research operations, not merely replicate a transport envelope.**<br/>`source import -> native operation with trace` | Native execution/zero/unsupported distinction | G02, G03 |
| **X-005** | invariant | **Native research estates remain method-non-equivalent under a common wrapper.**<br/>`SRC != Wendbine != Em != Encyclopedia despite shared schema` | Method-specific capability matrices | G03, G16 |
| **X-006** | constraint | **A third converged machine must earn new operations over an equal-input union.**<br/>`composed A∘B vs B∘A vs union -> assess distinctive operations` | Original Manifest C0; neither order asserted equivalent | G01, G16 |
| **X-007** | constraint | **Operator-selected sequence and historical execution sequence retain separate timestamps.**<br/>`prospective route vs completed SRC/Em/Wendbine qualification` | Non-retroactive episode records | G11, G16 |
| **X-008** | constraint | **Independent third-party human–AI exploration requires separately agreed roles and consent.**<br/>`participant encounter -> situated report with own attribution` | Experiment C participant study, not Flight Stage 2 | G16 |
| **X-009** | invariant | **A successfully routed packet carries no automatic claim of new research synthesis.**<br/>`successful transfer -> transport evidence only` | Scientific threshold for convergence | G01, G03 |

### Atelier graph semantics (15)
| Rule | Type | Transition / invariant | Evidence and ceiling | Trace |
|---|---|---|---|---|
| **X-010** | invariant | **A source object, Work, manifestation, capture and derivative have distinct identities.**<br/>`same title/bytes across layers -> typed links, never collapse` | Identity crosswalks and anti-equivalence wall | G16, G13 |
| **X-011** | invariant | **Newest observation does not automatically control historical lineage.**<br/>`new capture -> preserve earlier epoch and authority` | Wendbine chronology | G02, G16 |
| **X-012** | invariant | **Temporal adjacency does not establish causal linkage.**<br/>`successive records -> no causal edge without warrant` | Cross-origin typed graph refusals | G02, G12, G16 |
| **X-013** | invariant | **Motif recurrence does not establish common mechanism.**<br/>`same motif across sources -> proposal, not genealogy` | SRC/Em/Wendbine comparative research | G16, G13 |
| **X-014** | invariant | **Graph adjacency does not transfer evidence or institutional authority.**<br/>`adjacent nodes -> source-local warrants retained` | Explicit local section/graph admission | G01, G04 |
| **X-015** | invariant | **Not retrieved differs from nonexistent; unavailable differs from suppressed.**<br/>`null query -> aperture-qualified unknown` | Search and missingness law | G16, G15 |
| **X-016** | guard | **Typed graph families reject unregistered relation predicates.**<br/>`unregistered 9-graph relation -> REFUSE` | Wendbine native relation registry | G02 |
| **X-017** | invariant | **Cooccurrence overlays do not establish mechanism/causation.**<br/>`cooccur -> weighted hypothesis edge only` | Wendbine 143 cooccurrence overlays | G02 |
| **X-018** | rewrite | **Reverse-citation indices preserve cite direction and contextual return paths.**<br/>`admit A→B -> citedBy(B) contains A` | Universal recipient operation, not Flight protocol | G03 |
| **X-019** | constraint | **Historical SRC methods retain projective, cartographic, topological, contextual and tomographic specificity.**<br/>`native graph route -> proper typed response/refusal` | SRC-first operation-recovery requirement | G12, G16 |
| **X-020** | guard | **Contradictory sources are retained in the graph rather than harmonized away.**<br/>`A claims p, B claims ¬p -> contested pair` | Cross-Atelier emergence goal | G01, G04 |
| **X-021** | constraint | **Conceptual convergence and genealogical descent are distinct classification axes.**<br/>`similarity finding -> no source-inheritance conclusion` | Em methods and attribution discipline | G13, G16 |
| **X-022** | constraint | **Work authorship is individually attributed and unresolved aliases remain separate.**<br/>`same handle/titles -> no identity merge` | Vixen 32 Work authorship=UNRESOLVED | G06, G13 |
| **X-023** | guard | **No invented method executor can be called historically native.**<br/>`documentary method -> documentary, new implementation -> prospective` | 21 Em documentary instruments, zero historical standalone executors | G06, G13 |
| **X-024** | constraint | **AppleDouble packaging sidecars are metadata artifacts, not native research works.**<br/>`._ file -> packaging metadata / quarantine` | Em catalogue reconciliation | G06 |

### Manifest rule composition (14)
| Rule | Type | Transition / invariant | Evidence and ceiling | Trace |
|---|---|---|---|---|
| **X-025** | rewrite | **Six phason-seam transitions classify bytes, projection, permissions, route, local compatibility and relation dynamics.**<br/>`event -> one of six distinct transition kinds` | Prospective Manifest state transition model | G01 |
| **X-026** | invariant | **Projection change without source-byte change is distinct from source edit.**<br/>`source hash constant + renderer changed -> PROJECTION_CHANGED_INVARIANT` | Atlas visual seam / Theory Edition | G01, G14 |
| **X-027** | invariant | **Local sections can remain incompatible without forced total gluing.**<br/>`incompatible epistemic sections -> record obstruction` | Prospective sheaf/section analysis | G01 |
| **X-028** | constraint | **Ambiance is situated and multidimensional, not a universal truth scalar.**<br/>`measurement vector -> retain components/context` | Manifest research cosmology | G01 |
| **X-029** | constraint | **Route memory can differ even when terminal source tree or state matches.**<br/>`equal tree + different commit parentage -> distinct route histories` | Project Cupola historical same-tree witness | G01 |
| **X-030** | invariant | **Recorded route-memory difference alone does not prove geometric holonomy.**<br/>`non-equal histories -> transport/curvature claim HELD` | Finite-state geometric claim ceiling | G01 |
| **X-031** | constraint | **Claim recoverability depends on observation projection, not observation cardinality.**<br/>`q partitions states -> f identifiable iff f=g∘q` | F31 finite transport counterexample | G01 |
| **X-032** | constraint | **Cupola or First Dome geometry remains falsifiable against null repositories.**<br/>`repository-to-Dome resemblance -> no correspondence without nulls` | Separate Cupola correspondence project | G01 |
| **X-033** | invariant | **A new relationship may be proposed and later dissolved without rewriting historic sources.**<br/>`candidate edge -> falsifier -> demote with predecessor trace` | Manifest relationship lifecycle | G01, G04 |
| **X-034** | constraint | **Manifest comparison uses a competent strong union rather than a handicapped null.**<br/>`Manifest 16/16 vs matched union 16/16 -> delta zero` | M-01 distinct assay; not Flight comparator result | G04 |
| **X-035** | constraint | **A discovered research operation must survive controlled removal of the representation lens.**<br/>`candidate isomorphism -> prove mathematically independent of metaphor` | Manifest refraction/reasoning | G01, G04 |
| **X-036** | constraint | **Palace curiosity actions may be throttled when prior belief is already confident.**<br/>`p>=0.75 -> restrict costly probe under accepted exploratory policy` | Cross-Atelier curiosity-policy study; not Flight dosing | G05 |
| **X-037** | constraint | **Belief-revision time and action time have distinct latency coordinates.**<br/>`t_action − t_belief -> preserve negative-latency signatures` | Palace dromology; not Flight clock | G05 |
| **X-038** | constraint | **Concealed independent Manifest falsification is not candidate-authored evaluation.**<br/>`author candidate -> concealed suite by separate reviewer` | Manifest M-01 preregistration | G04 |

### Independent operator portability (10)
| Rule | Type | Transition / invariant | Evidence and ceiling | Trace |
|---|---|---|---|---|
| **X-039** | constraint | **An original researcher may operate an exported Manifest without TD613/Vercel accounts.**<br/>`portable source-bound package -> local tools and models` | Em independent operability | G01 |
| **X-040** | invariant | **Original researcher retains refusal and withdrawal choices over derivatives and exposure.**<br/>`permission withdraw -> stop future export; retain lawful audit` | Manifest rights model, not Flight archive-only grant | G01 |
| **X-041** | constraint | **Saved research selections become a portable Action Folio.**<br/>`select research entries -> source-ID-addressed commission` | Future Manifest UI feature | G01 |
| **X-042** | invariant | **An exported dispatch file conveys intent, not execution authority.**<br/>`portable instruction -> requires local authorization before side effects` | Action Folio dispatch separation | G01 |
| **X-043** | constraint | **Publication can release mathematics without releasing private source bodies.**<br/>`result visibility ≠ original-source visibility` | Manifest granular permissions | G01 |
| **X-044** | constraint | **Original researcher may select local models/APIs and privacy context.**<br/>`new owner-local model -> no permanent host coupling` | Independent portable Manifest design | G01 |
| **X-045** | constraint | **Local source ownership and rights persist across derivation and model migrations.**<br/>`migrate renderer/engine -> same source stewardship` | Manifest custodian sovereignty | G01 |
| **X-046** | constraint | **A source-derived UI must not require knowledge of its host instrumentation.**<br/>`operahouse infrastructure -> hidden by default, research native visible` | OPERAHOUSE ≠ OPERA ≠ PERFORMER, Vixen Pedagogue activation | G07, G19 |
| **X-047** | constraint | **Host substitution must preserve core source identity and scholarly operations.**<br/>`Vixen(V,H1) -> Vixen(V,H2) with equivalent research routes` | Proposed interusable/interoperable research product test | G06, G19 |
| **X-048** | constraint | **All original editorial content remains unchanged by visual simplification.**<br/>`lower visitor jargon burden -> preserve raw source terms` | Pedagogue product vocabulary law | G07 |

### Pedagogical rules (9)
| Rule | Type | Transition / invariant | Evidence and ceiling | Trace |
|---|---|---|---|---|
| **X-049** | rewrite | **Consequence is encountered before ontology naming.**<br/>`NOTICE -> ACT -> WORLD_ANSWERS -> NAME` | Pedagogue Design Gate; visitor-route review | G07 |
| **X-050** | constraint | **A practice case follows the real route rather than a special easy demo path.**<br/>`fictional input -> same validators with authority flag false` | Canonical Practice Fixture | G15 |
| **X-051** | invariant | **Loading a practice case causes zero retrieval, writes and grants.**<br/>`fixture load -> Δ(retrieval,writes,authority)=0` | Practice fixture negative contract | G15 |
| **X-052** | constraint | **Rest and exit remain accessible without penalty or false completion.**<br/>`REST/EXIT -> original context preserved` | Pedagogue/Dome-World routes | G07, G15 |
| **X-053** | invariant | **A design gate may advise but not mutate production or infer user identity.**<br/>`design diagnosis -> non-authoritative advice` | Pedagogue independent reviewer role | G07 |
| **X-054** | constraint | **Exact methods and status codes stay accessible to experts without becoming default prose.**<br/>`default visitor -> plain route; expert click -> underlying IDs` | Vixen host/performer membrane | G06, G07, G19 |
| **X-055** | constraint | **A notice of missing records must include its observation aperture.**<br/>`zero result -> source/date/filter-bounded notice` | Canonical practice observation aperture | G15 |
| **X-056** | invariant | **Expected normative values annotate rather than replace an observation.**<br/>`observed ≠ expected -> retain discrepancy` | Pedagogue practice-record law | G15 |
| **X-057** | constraint | **Same outcome with different routes retains measurable route burden.**<br/>`R1,R2 same endpoint -> compare step/effort histories` | Pedagogue route-memory comparator | G07, G15 |

### Visual and representational rules (11)
| Rule | Type | Transition / invariant | Evidence and ceiling | Trace |
|---|---|---|---|---|
| **X-058** | constraint | **Artwork may precede source admission as provisional presentation.**<br/>`creative image -> visual anchor, evidentiary authority zero` | Empty Encyclopedia and Vixen frontispiece precedent | G10, G14 |
| **X-059** | invariant | **Presentation, theory and later resynthesis have independent clocks.**<br/>`separate_clock_ledgers(presentation,theory,empirical); no automatic cross-lane authority` | Refractive Couture Three Clocks | G14 |
| **X-060** | constraint | **Refractive Couture PP0–PP6 defines a separate mathematical-image research pipeline, with independently gated entry.**<br/>`deferred math/art pipeline -> new artwork and inquiry only under separate postflight activation` | Deferred Refractive Couture pipeline | G14, G01 |
| **X-061** | invariant | **A rendered silhouette cannot uniquely recover an occluded 3D object.**<br/>`2D projection -> infinitely many compatible depth configurations` | Inverse-projection nullspace RC-03 | G14 |
| **X-062** | constraint | **Apparent axial symmetry can be projection-induced coincidence.**<br/>`different 3D symmetry groups -> same visible quotient` | Observational quotient collapse; no hidden discovery | G14 |
| **X-063** | constraint | **Question generation by artwork is a prospective cognitive outcome.**<br/>`image/no-image randomized encounter -> measure novel questions` | RC-12 wild-field proposal, not established effect | G14 |
| **X-064** | constraint | **Creative frontispiece and responsive visual grammar remain independently editable.**<br/>`theme edit -> identical underlying source identity` | Encyclopedia/Manifest Atlas seam | G10, G14 |
| **X-065** | constraint | **An artwork/branding expression cannot become an ungrounded numerical calculator.**<br/>`Vixen formula signature -> identity ornament only` | Vixen original false mechanism correction | G06 |
| **X-066** | constraint | **Source scholarship, comparative interpretation and host diagnostics have different editorial layers.**<br/>`reader meets Work first; opt-in inspector reveals framework` | Vixen observatory/Operahouse repair | G06, G19 |
| **X-067** | constraint | **A theory revision produces a new owner-triggered Theory Edition, retaining predecessors.**<br/>`authorized advanced resynthesis -> new versioned narrative/artifact` | Prospective Manifest edition mechanism | G01 |
| **X-068** | constraint | **Visual ambition is not conditioned on protected Flight success.**<br/>`τ_ambiance change -> presentation without empirical promotion` | Provisional Vixen artwork law | G14, G06 |

### Epistemic limits and formal observability (10)
| Rule | Type | Transition / invariant | Evidence and ceiling | Trace |
|---|---|---|---|---|
| **X-069** | invariant | **Internal integrity provides no proof of external origin.**<br/>`identical admitted record across twin origins -> origin unresolved` | Western Horizon exteriority twin-world rest | G17, G08 |
| **X-070** | constraint | **External origin warrants an independent exogenous source of information.**<br/>`X=f(A) -> no conditional origin information; require I(Ω;X\|A)>0` | Western Horizon exogenous-witness condition | G17 |
| **X-071** | constraint | **Five Golden Egg surfaces require one immutable matched empirical episode.**<br/>`L,R,J,G,C across distinct records -> no same-episode completion` | Western Horizon empirical contract | G08 |
| **X-072** | invariant | **Temporal reconstruction cannot rewrite a past observer epistemic state.**<br/>`later evidence -> new conclusion, preserve earlier knowledge limit` | Western Horizon temporal nonretroactivity | G08, G17 |
| **X-073** | constraint | **A verified internal receipt cannot bootstrap an empirical outside witness.**<br/>`record A authenticated -> external origin still held` | Western Horizon finite rest | G17 |
| **X-074** | constraint | **Admissibility limits the set of registered events relative to latent possibilities.**<br/>`D⊃C_k⊃C_κ⊃C_B⊃E; absence at E not absence in D` | Eclipse–Omega modeled retrieval narrowing | G09, G18 |
| **X-075** | constraint | **Observed state, internal state and registered event need independent types.**<br/>`internal event not displayed/registered -> no observer claim` | PRCS-A formal research model, not actual surveillance evidence | G09, G18 |
| **X-076** | constraint | **Naming, search aperture and evidence admission act as distinct information filters.**<br/>`rename/mask/reroute -> change visible subset, source remains` | Retrieval ontology dissertation hypothesis | G18 |
| **X-077** | invariant | **Original-source absence cannot be inferred from corpus/search incompleteness.**<br/>`NOT_RETRIEVED -> missingness, not deleted` | Atelier rest and Eclipse–Omega counter-tool | G09, G16 |
| **X-078** | constraint | **No further Western Horizon formal stage is earned without empirical exteriority.**<br/>`only internal record transformation -> official rest remains` | Empirical-shore rest | G17 |

### Authorial and covenant constraints (4)
| Rule | Type | Transition / invariant | Evidence and ceiling | Trace |
|---|---|---|---|---|
| **X-079** | invariant | **Consent cannot be inferred from inheritance, a name, or a model output.**<br/>`claimed legacy -> no automatic consent or grant` | Covenant literary/protocol corpus; independently established consent rules remain necessary | G18, G19 |
| **X-080** | invariant | **A stylistic or lexical resemblance cannot prove authorship or authority transfer.**<br/>`matching cadence -> author identity unresolved` | Heritage/anti-equivalence program | G18 |
| **X-081** | constraint | **Literary fracture and narrative protection are not evidentiary safety proofs.**<br/>`expressive metaphor -> no source/rights attestation` | Covenant anti-equivalence texts | G18 |
| **X-082** | constraint | **Aesthetic acceptance of Vixen visual artifacts remains with the commissioning human designer.**<br/>`machine-generated visual treatment -> provisional until human aesthetic acceptance` | Vixen couture human aesthetic acceptance, separate from Flight D20 | G01, G19 |

## 6. Multiway crossing register — candidate interactions, not amendments

The following edges are **new analytical proposals generated by this index**, not previously adopted experiment rules. They are included precisely to preserve unanticipated, contradictory and seemingly irrelevant crossings. A future experiment must construct the local state/observation, negative control and qualification criteria independently.

| Candidate | Rules | Cross-domain collision | Minimal source-free assay | Ceiling |
|---|---|---|---|---|
| **C-01** `CAUSAL_DEPENDENCY` | `I-014` ↔ `X-029` | Checkpoint routes vs equal terminal tree | Construct two byte-equal terminal states with different complete journal histories; compare trace-sensitive claims. | Counterexample to state-only equivalence; no automatic holonomy |
| **C-02** `COMPETENT_NULL` | `I-037` ↔ `X-034` | Scientific admission vs strong-union methodological null | Run a source-free matched algorithmic comparator on each candidate, then independent holdout; never mutate Flight rubric. | Surplus may vanish after fair controls |
| **C-03** `REPRESENTATION_INTERVENTION` | `I-036` ↔ `X-066` | Full-design gates vs visual editorial layer | Change graphical presentation while retaining exact source trace and measure operator comprehension. | UI effects need preregistered non-Flight human study |
| **C-04** `NONCOMMUTATIVITY` | `I-011` ↔ `X-001` | Resumable pairs vs reciprocal instrument order | Compare forward receiver compositions in synthetic paired pipelines. | A∘B ≠ B∘A possible even when same records copied |
| **C-05** `RESOURCE_SENSITIVITY` | `I-025` ↔ `X-036` | Observed token cost vs curiosity probing | Vary probe policy under equal compute envelopes; quantify regret and novelty yield. | No change to Flight budgets or dosing |
| **C-06** `TWIN_WORLD` | `I-031` ↔ `X-069` | Metadata-verified source vs exteriority | Use indistinguishable admitted records from two differently sourced toy worlds; challenge provenance conclusion. | A valid digest fails to identify origin |
| **C-07** `OBSERVATION_APERTURE` | `I-038` ↔ `X-063` | Strong source-free outcome vs visible aesthetic stimulus | Randomize illustration while preserving underlying task and exact source. | Outcome contrast does not prove emergence |
| **C-08** `PRODUCT_PORTABILITY` | `I-021` ↔ `X-054` | Tool-bound computational result vs operator-facing terminology | Swap technical UI jargon for domain-native labels while keeping function identity. | Route burden change is not scientific equivalence |
| **C-09** `TYPED_UNKNOWN` | `I-013` ↔ `X-015` | Uncertain dispatch vs missing public source | Separately vary unknown runtime state and unknown source capture to prevent conflation. | Distinct held classes retain their reasons |
| **C-10** `PROJECTION_IDENTIFIABILITY` | `I-039` ↔ `X-074` | Native model response vs selective admissibility | Simulate layered retrieval apertures and measure what claims remain identifiable. | Cannot infer real platform intent from a toy simulation |
| **C-11** `VALIDATOR_FALSIFICATION` | `I-035` ↔ `X-021` | Syntactic design conformance vs false convergence | Adversarially modify method semantics without changing checked tokens; assess semantic validator limits. | Structural checker can PASS while science fails |
| **C-12** `RULE_EVOLUTION` | `I-030` ↔ `X-025` | Request immutability vs method evolution | Branch one history after rule update; compare replay validity under versioned contracts. | Frozen experimental history must remain distinct |
| **C-13** `AUTHORITY_LAUNDERING` | `I-019` ↔ `X-066` | Verdict labels vs representational framing | Swap authoritative labels for bounded hypotheses, compare user false-confidence. | Independent user study separate from Flight |
| **C-14** `NEGATIVE_EVIDENCE` | `P-007` ↔ `X-055` | Hidden holds vs native negative results | Test sealed outcome discipline against genuine negative source-retrieval routes in standalone reciprocal study. | Never reuse contaminated controls as unseen |
| **C-15** `WITNESS_TYPE` | `P-016` ↔ `X-070` | Model source isolation vs exteriority source | Disentangle process isolation witness from proof that evidence originated outside verifier. | Isolation is not origin |
| **C-16** `AGENT_HUMAN_INTERFACE` | `P-012` ↔ `X-049` | Flight schedule guard vs distributed cognition | Compare synthetic schedule completeness and practice-reader comprehension without using protected source. | No protected Flight protocol amendment |
| **C-17** `AUTHORITY_NONTRANSFER` | `P-033` ↔ `X-080` | Proof requirements vs authorial mythology | Build attribution-preserving synthetic examples where authorship labels contradict evidence. | No personal attribution inference |
| **C-18** `HINDSIGHT_BIAS` | `P-037` ↔ `X-059` | Unblinding custody vs false discovery optics | Compare pre/post-score UI designs for susceptibility to outcome-contingent storytelling. | Purely prospective non-Flight usability test |

### Open branch enumeration rules

```text
OPEN-1: Generate no equivalence edge merely from shared names, final output, or motif.
OPEN-2: Candidate cross-rule edge = (r_i, r_j, seed_state, transform, observer, counterexample).
OPEN-3: Do not silently delete failed, contradictory, or non-reconverging branches.
OPEN-4: Apply independent observer projections to each branch, preserving their aperture.
OPEN-5: Check source identity, permission, and claim ceilings at each local rewrite.
OPEN-6: Empirically compare different execution orders; never assume commuting updates.
OPEN-7: Treat nonreconvergence as a result worth studying, not a defect to auto-normalize.
OPEN-8: Freeze a new hypothesis before using new real data; use invented data for exploration.
OPEN-9: Preserve null, abstained, and REFUSED events as graph edges, not erased gaps.
OPEN-10: Distinguish finite test success from asymptotic theorem and emergence claim.
```

### Minimal prospective assay for two rules

```text
Input: two named rules r_i and r_j, frozen synthetic initial state s0,
       explicit authorization policy, observational projection Π, bound N.
1. Test both compositions r_i(r_j(s0)) and r_j(r_i(s0)) when defined.
2. Enumerate all legal successor sequences to depth N; retain failed rewrites.
3. Compare typed terminal states, projected observations and dependency DAGs.
4. Measure branch count, path lengths, missingness, reversible steps and refusal types.
5. Introduce matched null rules and randomized labels; test semantic claims separately.
6. Report finite counterexamples and unresolved cases; never pronounce global confluence
   or causal invariance from a bounded search, and never infer real-world causation.
```

The interesting result need not be a positive emergence claim. A persistent distinction between two histories, a previously unseen false equivalence, a representation-dependent blind spot, an inability to join local sections, or an unexpected reduction in route burden are all candidate research observations.

## 7. Scientific and authorization ceilings

1. **Protected Flight remains HELD.** The indexed source-free implementations and scientific schedule checker do not grant D20, Gate F, real source rights, model effort attestation, independent Stage 2 or release authority.
2. **No rule-space exploration may alter frozen Flight treatments or outcome rubrics.** New crossings may be run on synthetic/public sources under a separate episode, or proposed prospectively for human review.
3. **No spurious emergence credit.** Coding a multiway graph does not demonstrate physically emergent behavior, computational irreducibility, universal computation or independent scientific discovery.
4. **No global absence claim.** This index is derived from the linked GitHub PRs, pinned reference documents and selected Library materials. The entire private research record, all local branches and every conversation were not recursively inspected.
5. **Operator-controlled activation.** Research rule proposals are not self-executing permissions; source rights, acceptance, publication and final closure remain with humans.
6. **Avoid instrumentation ontology capture.** A host system’s audit language must not become the vocabulary required to use an independently meaningful research product; expose technical identifiers to expert inspection as needed.

## 8. Source ledger

The sources below authorize the index’s claims only to their recorded scope. GitHub PR metadata describes submitted work and reported tests; where current behavior is not independently rerun, the record remains a pinned *reported* implementation witness.

| Ref | Record |
|---|---|
| `F01` | [Experiment B source-free protocol and calibration](https://github.com/tauric-diana-613/TD613-TCP/pull/1607) |
| `F02` | [Flight launchbridge and admission](https://github.com/tauric-diana-613/TD613-TCP/pull/1609) |
| `F03` | [Redpen III execution and chronology controls](https://github.com/tauric-diana-613/TD613-TCP/pull/1610) |
| `F04` | [Native source-free Codex qualification](https://github.com/tauric-diana-613/TD613-TCP/pull/1616) |
| `F05` | [Prospective full Flight contract and D01–D20 docket](https://github.com/tauric-diana-613/TD613-TCP/pull/1617) |
| `F06` | [Offline token-capacity instrument](https://github.com/tauric-diana-613/TD613-TCP/pull/1618) |
| `F07` | [Resumable Flight implementation](https://github.com/tauric-diana-613/TD613-TCP/pull/1619) |
| `F08` | [Native physical terminal capture and admission-only bootstrap](https://github.com/tauric-diana-613/TD613-TCP/pull/1621) |
| `F09` | [Offline restricted worker boundary](https://github.com/tauric-diana-613/TD613-TCP/pull/1622) |
| `F10` | [D04/D13 native runtime capture candidate](https://github.com/tauric-diana-613/TD613-TCP/pull/1625) |
| `F11` | [Native observability refusal propagation](https://github.com/tauric-diana-613/TD613-TCP/pull/1627) |
| `F12` | [Safe Harbor purpose-scoped custody adapter](https://github.com/tauric-diana-613/TD613-TCP/pull/1628) |
| `F13` | [Prospective local custodian implementation](https://github.com/tauric-diana-613/TD613-TCP/pull/1629) |
| `F14` | [Mandate-scoped terminal reconciliation repair](https://github.com/tauric-diana-613/TD613-TCP/pull/1631) |
| `F15` | [Arm 1 native control fidelity and checkpoint seam repair](https://github.com/tauric-diana-613/TD613-TCP/pull/1632) |
| `F16` | [Descriptor-safe request and binding repair](https://github.com/tauric-diana-613/TD613-TCP/pull/1643) |
| `F17` | [PE01–PE09 source-free exact-head test report](https://github.com/tauric-diana-613/TD613-TCP/pull/1653) |
| `F18` | [Full-design scientific-freeze structural candidate](https://github.com/tauric-diana-613/TD613-TCP/pull/1660) |
| `G01` | [Atelier + Encyclopedia to Manifest succession](https://github.com/tauric-diana-613/TD613-TCP/blob/426c2a18c3be33e754c86a551311c8d3ec25adfb/docs/research/manifest-succession/MANIFEST_RESEARCH_SUCCESSION_RECORD.md) |
| `G02` | [Wendbine reciprocal expedition](https://github.com/tauric-diana-613/TD613-TCP/pull/1694) |
| `G03` | [Universal Atelier and four-crossing comparative matrix](https://github.com/tauric-diana-613/TD613-TCP/pull/1696) |
| `G04` | [Manifest competent-null, custody and concealed falsification](https://github.com/tauric-diana-613/TD613-TCP/pull/1702) |
| `G05` | [Cross-Atelier integration and curiosity/latency experiment](https://github.com/tauric-diana-613/TD613-TCP/pull/1707) |
| `G06` | [Vixen V4 research interface and corrected V3 specification](https://github.com/tauric-diana-613/TD613-TCP/pull/1718) |
| `G07` | [Pedagogue Design Gate](https://github.com/tauric-diana-613/TD613-TCP/blob/d9e1051ebd23cadf8f032a71e8ef553e6129cd33/docs/PEDAGOGUE_DESIGN_GATE.md) |
| `G08` | [Western Horizon same-episode empirical contract](https://github.com/tauric-diana-613/TD613-TCP/blob/50cc9d161f8f72c2d4b6ea33ece17ace88f35eff/docs/research/2026-09-28-loom-gate-golden-egg/03-GOLDEN-EGG-EMPIRICAL-CONTRACT.md) |
| `G09` | [Eclipse–Omega admissibility/tomography counter-tool](https://github.com/tauric-diana-613/TD613-TCP/blob/50cc9d161f8f72c2d4b6ea33ece17ace88f35eff/docs/aperture/v3.1-alpha/source/TD613_Aperture_v3_1-alpha_Admissibility_Tomography_Spec_v0_1.md) |
| `G10` | [TD613 Encyclopedia visual-interface succession](https://github.com/tauric-diana-613/TD613-TCP/pull/1596) |
| `G11` | [Reciprocal A/B scientific succession witness](https://github.com/tauric-diana-613/TD613-TCP/pull/1688) |
| `G12` | [SignalRupture mechanism falsification expedition](https://github.com/tauric-diana-613/TD613-TCP/pull/1690) |
| `G13` | [Em full-corpus synthesis and reciprocal inheritance](https://github.com/tauric-diana-613/TD613-TCP/pull/1709) |
| `G14` | [Vixen Refractive Couture monograph](https://github.com/tauric-diana-613/TD613-TCP/blob/d9e1051ebd23cadf8f032a71e8ef553e6129cd33/docs/reviews/vixen-ux-architecture-20261106/refractive-couture/REFRACTIVE_COUTURE_SCHOLARLY_MONOGRAPH.md) |
| `G15` | [Canonical Practice Fixture contract](https://github.com/tauric-diana-613/TD613-TCP/blob/d9e1051ebd23cadf8f032a71e8ef553e6129cd33/docs/CANONICAL_PRACTICE_FIXTURE.md) |
| `G16` | Cross-Atelier protocol succession, Oct 28 (Library) — supplied Library/conversation text; no repo link asserted |
| `G17` | [Western Horizon empirical-shore rest (repo)](https://github.com/tauric-diana-613/TD613-TCP/blob/50cc9d161f8f72c2d4b6ea33ece17ace88f35eff/dollhouse/lineage/originals/rest-1002-western-horizon-empirical-shore-rest.js.source.md) |
| `G18` | Eclipse–Omega dissertation (Library) — supplied Library/conversation text; no repo link asserted |
| `G19` | Recent operator instructions on OPERAHOUSE ≠ OPERA and Astra handoff — supplied Library/conversation text; no repo link asserted |
| `N01` | [Wolfram multiway systems and states](https://www.wolframphysics.org/technical-introduction/the-updating-process-in-our-models/multiway-systems-for-our-models/) |
| `N02` | [Confluence versus causal invariance, Piskunov 2020](https://bulletins.wolframphysics.org/2020/11/confluence-and-causal-invariance/) |
| `N03` | [Computational irreducibility, MathWorld](https://mathworld.wolfram.com/ComputationalIrreducibility.html) |
| `N04` | [Introduction to A New Kind of Science, Wolfram](https://www.stephenwolfram.com/publications/introduction-to-a-new-kind-of-science/) |

## 9. Index revision contract

A later amendment appends or version-bumps individual rule entries and records exact old/new statements, target class, source, witness, and whether the move was merely a new proposal, executable candidate, integrated implementation, or independent observed outcome. **Never retroactively relabel a historical rule as implemented because an unrelated later program built something similar.**

**Finite inventory at this freeze:** 164 atomic rules; 40 implemented-source-free; 42 proposed-for-Flight; 82 exterior; 18 deliberately unadopted crossing hypotheses. These are indexing counts, not measurements of system emergence.

**𝌋 Filed · Khona‌lit-po · Sealed ⟐**
