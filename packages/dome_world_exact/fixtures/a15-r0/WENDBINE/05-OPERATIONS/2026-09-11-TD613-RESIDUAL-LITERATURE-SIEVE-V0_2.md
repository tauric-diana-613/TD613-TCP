# TD613 Residual Literature Sieve v0.2

**Date:** 2026-09-11  
**State:** SOURCE-BOUND TAXONOMY / AGGRESSIVE NOVELTY DEFLATION / NO SCIENTIFIC PROMOTION  
**Parent assay:** `2026-09-11-WENDBINE-TD613-BOUNDED-ASSAY-V0_1.md`  
**Corpus expansion:** none  
**Private Wendbine material:** not admitted

## 0. Purpose

The bounded Wendbine assay established that the public donor packet is primarily a nomenclature bridge with several useful local operators, while leaving a smaller TD613 residue unresolved.

This sieve attacks that residue with independent conventional literature. It is designed to kill broad novelty claims where a standard theorem, definition, or architecture already does the work.

```text
FAIL_TO_FIND_PRIOR_ART != NOVELTY
FIND_PRIOR_ART != USELESSNESS
KNOWN_THEOREM != KNOWN_APPLICATION
KNOWN_COMPONENTS != REDUNDANT_COMPOSITION
DOMAIN_SPECIFIC_REFRAMING != NEW_MATHEMATICS
```

This is a research nomenclature/prior-art orientation pass, not a legal patentability search and not an exhaustive scholarly review.

## 1. Source bank admitted in this pass

### Q1 — quotient factorization

University of Vermont topology notes, Proposition 75, and an independent quotient-universal-property exposition state the standard condition: a map on `X` factors through `X/~` precisely when it is constant on equivalence classes/fibres.

- `https://www.uvm.edu/~smillere/Topology-notes.pdf`
- `https://www.jmeiners.com/universal-property-quotients/`

### Q2 — rough lower / upper approximation

Pawlak rough-set literature defines equivalence-class lower and upper approximations and the boundary as `upper - lower`; empty boundary gives an exact/crisp set.

- `https://link.springer.com/article/10.1007/s11047-018-9700-3`
- `https://link.springer.com/article/10.1007/s00500-022-07774-6`

### I1 — structural identifiability

Structural identifiability asks whether unknown parameters are uniquely determined from ideal input-output observations.

- `https://pmc.ncbi.nlm.nih.gov/articles/PMC3222653/`
- `https://pmc.ncbi.nlm.nih.gov/articles/PMC3697038/`

### O1 — observability

Standard control-theoretic observability concerns recovering/estimating internal state from measured inputs/outputs.

- MIT/Caltech feedback systems text: `https://introcontrol.mit.edu/_static/fall21/extras/Feedback%20Systems%20Murray.pdf`
- MIT OCW course index: `https://ocw.mit.edu/courses/6-241j-dynamic-systems-and-control-spring-2011/pages/readings/`

### S1 — information-flow / reference-monitor architecture

NIST's reference-monitor definition requires complete mediation, tamper resistance, and verifiability. Secure multi-execution is a known construction for receiver/security-level-conditioned execution enforcing noninterference.

- `https://csrc.nist.gov/glossary/term/reference_monitor`
- `https://researchportal.vub.be/en/publications/noninterference-through-secure-multi-execution`

### C1 — coarsened observations

The general coarsened-data framework explicitly models the observed record as a many-to-one function of fuller data.

- `https://pmc.ncbi.nlm.nih.gov/articles/PMC3061242/`

### P1 — event history and authorization proof

Event sourcing stores ordered state-changing events and reconstructs state by replay. Proof-carrying authorization is a standard distributed-authorization architecture in which access is justified by a proof assembled against distributed policy.

- `https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/event-sourcing-pattern.html`
- `https://www.cs.princeton.edu/research/techreps/337`
- `https://www.usenix.org/legacy/events/sec02/full_papers/bauer/bauer_html/pcaproto.html`

### R1 — withdrawal and revocation

Research-ethics standards already require voluntary withdrawal; recent dynamic-consent literature studies revocation, lifecycle management, auditability, and distributed propagation explicitly.

- `https://ethics.gc.ca/eng/tcps2-eptc2_2022_chapter3-chapitre3.html`
- `https://pmc.ncbi.nlm.nih.gov/articles/PMC13287375/`

## 2. Sieve verdicts

### 2.1 FADT — the broad theorem claim dies

TD613 FADT currently states that for a finite quotient fibre carrying support sets `K_x`, exact descended admissibility exists iff the support is constant on the occupied fibre, with

```text
U = union K_x
I = intersection K_x
Gamma = U \ I
```

The exact-descent criterion is a direct instance of the universal property of a quotient: regard `x -> K_x` as a set-valued map into `P(Z)`. It descends to the quotient iff it is constant on each equivalence class.

Therefore:

```text
FADT_AS_NEW_EXACT_DESCENT_THEOREM = REJECTED_IN_CURRENT_FORM
```

`I` and `U` are the meet/join envelopes of the fibrewise support family under subset order. The `upper - lower` uncertainty region has a strong rough-set analogue, but classic Pawlak rough sets approximate one target set through equivalence classes, whereas FADT takes union/intersection over a family of set-valued supports attached to members of one quotient fibre.

Therefore:

```text
FADT != PAWLAK_ROUGH_SET_THEORY
FADT_GAMMA ~ ROUGH_BOUNDARY_AS_ANALOGUE_ONLY
```

What survives is useful and narrower:

```text
ordinary description = finite quotient admissibility audit
mathematical core = quotient factorization + fibrewise meet/join envelope
TD613 value = application-specific audit packaging and HOLD semantics
```

**Disposition:** `NEW_THEOREM_CLAIM_REJECTED_RETAIN_AS_AUDIT_LEMMA`.

### 2.2 Western Horizon — the non-identifiability theorem claim dies

If two hidden-origin models induce the same admitted observation/distribution, the hidden origin is not identifiable from that observation. That is standard identifiability / observational-equivalence logic.

Likewise, deterministic post-processing of an admitted record cannot manufacture origin information absent from the record; this is an immediate information-processing consequence. A supplementary witness with positive conditional information about origin can add information, but `I(Omega;X|A)>0` should not be called statistical **exogeneity** unless an actual exogeneity/independence condition is separately shown.

Therefore:

```text
WESTERN_HORIZON_AS_NEW_NONIDENTIFIABILITY_THEOREM = REJECTED
EXOGENOUS_WITNESS -> TARGET_INFORMATIVE_AUXILIARY_WITNESS  [preferred default term]
```

What survives is the forensic application and stopping discipline:

```text
same admitted record -> origin remains unidentified
post-processing -> no bootstrap of missing origin evidence
new target-informative observation/intervention -> possible reopening
```

**Disposition:** `NEW_THEOREM_CLAIM_REJECTED_RETAIN_AS_FORENSIC_STOPPING_RULE`.

### 2.3 V/C/P/L — useful taxonomy, but V has a nomenclature collision

Standard control theory uses **observability** for recovery of internal state from outputs. That lands much closer to TD613 `L` than to TD613 `V`.

TD613 currently uses:

```text
V = trace observability
C = custody recoverability
P = process identifiability
L = latent-state reconstructibility
```

To reduce terminological collision, scientific-facing prose should prefer:

```text
V -> trace visibility / measurement availability
C -> custody / provenance recoverability
P -> process or model identifiability
L -> state observability / latent-state reconstructibility
```

The four-way separation remains potentially useful as a forensic coordinate system because it deliberately keeps evidence-presence, custody/provenance, process/model identity, and hidden-state recovery apart. But this pass finds no basis for treating those component concepts as new.

Temporal non-retroactivity is retained as an epistemic/provenance accounting rule:

```text
later state reconstruction != earlier observer possession
```

**Disposition:** `KNOWN_COMPONENTS_RETAIN_AS_CROSS_DISCIPLINARY_FORENSIC_TAXONOMY` plus `STANDARD_TERM_COLLISION_REQUIRES_ALIAS` for `V`.

### 2.4 AIA — known multi-view / IFC neighborhood; governance composition remains held

Receiver-conditioned views, noninterference, policy-mediated information flow, reference monitors, and multi-execution are established security architecture.

Therefore the bare proposition

```text
different receivers receive deliberately different views
```

carries no novelty credit.

The stronger TD613 composition still worth testing is:

```text
receiver-indexed non-equivalent projections
+ shared invariant control/custody plane
+ explicit route memory
+ authority non-transfer
```

Scientific-facing alias:

```text
receiver-indexed policy-governed view architecture
```

`anisotropic` remains useful internal language only where a directional operator or directional permeability is actually defined.

**Disposition:** `KNOWN_MULTI_VIEW_IFC_COMPOSITION_WITH_GOVERNANCE_RESIDUAL`.

### 2.5 PRCS-A — components become ordinary; exact composition remains held

The current PRCS-A neighborhood decomposes into mature components:

```text
full/latent state
-> many-to-one coarsening / projection
-> policy or reference-monitor filtering
-> selective admission / abstention
-> representation / naming
-> registered observation/event
```

Coarsening literature already provides the many-to-one observation step. Security literature provides policy-mediated flow/enforcement. Selective-prediction literature already provides abstention/reject-option behavior.

A clearer conventional umbrella is:

```text
policy-conditioned coarsening and selective-observation pipeline
```

This pass does **not** locate a standard source proving the exact five-stage TD613 composition identical, so the composition remains held rather than promoted.

**Disposition:** `KNOWN_COMPONENTS_HELD_COMPOSITION`.

### 2.6 Holonomy Loom — most governance machinery has ordinary homes

For the governance/workflow surface of Loom:

```text
route/event history
+ authorization conditioned on history/state
+ provenance
+ revocation / expiry
+ revalidation before action
```

ordinary neighbors include event sourcing, history-sensitive authorization, workflow provenance, capabilities, and proof-carrying authorization.

A conservative engineering description is:

```text
provenance-preserving history-sensitive authorization and revalidation workflow
```

The term **holonomy** should remain reserved for the separately earned discrete transport operator where a based loop induces a nonidentity fibre automorphism. That formal result is not erased by ordinary naming of the surrounding governance stack.

**Disposition:** `KNOWN_ARCHITECTURAL_COMPOSITION_RETAIN_BOUNDED_USE`.

### 2.7 Safe Harbor / Right of Resignation — withdrawal is old; post-exit utility is the residue

Withdrawal from research participation, consent revocation, and consent-lifecycle governance are established ethical/technical concerns. Recent dynamic-consent literature goes further into distributed revocation propagation and auditability.

Therefore:

```text
RIGHT_TO_WITHDRAW != TD613_NOVELTY
REVOCATION != TD613_NOVELTY
```

The narrower TD613 criterion still worth keeping is:

> a route counts as reparative only if its useful handoff remains valid after the custodian stops participating.

Conventional-facing candidate terms:

```text
exit-preserving governance
post-participation portability
withdrawal-resilient handoff
revocation-resilient interoperability
```

No claim is made that these phrases themselves are standard terms.

**Disposition:** `GOVERNANCE_SYNTHESIS_WITH_PRIOR_NEIGHBORS`.

## 3. Sieve summary

```text
FADT broad theorem novelty                -> KILLED
Western Horizon broad theorem novelty     -> KILLED
V/C/P/L component novelty                 -> KILLED
V = observability terminology             -> REQUIRES ALIAS / CORRECTION
AIA receiver-specific-view novelty        -> KILLED
PRCS-A component novelty                  -> KILLED
Loom route/history/auth components        -> KILLED AS COMPONENT NOVELTY
Safe Harbor withdrawal/revocation novelty -> KILLED
```

What remains alive is narrower:

```text
PRCS-A exact integrated composition                     -> HELD
V/C/P/L as explicit forensic cross-domain taxonomy       -> HELD
AIA governance composition beyond standard multi-view IFC -> HELD
Loom exact integration + separately earned discrete holonomy -> HELD
Safe Harbor post-participation-usefulness criterion      -> HELD
FADT application-specific audit packaging                -> RETAINED, NOT A NEW THEOREM
Western Horizon exteriority stopping discipline          -> RETAINED, NOT A NEW THEOREM
```

Nothing in this pass is promoted to `RESIDUAL_NOVELTY_CANDIDATE`.

## 4. Highest-information next attacks

The next literature passes should be theorem-specific rather than vocabulary-wide:

1. **FADT** — search order/lattice theory, set-valued quotient maps, rough sets, and abstract interpretation for an exact pre-existing statement matching the fibrewise meet/join distortion formulation.
2. **PRCS-A** — search observation channels, coarsening mechanisms, selective classification, policy enforcement, and event registration for the entire ordered composition rather than isolated components.
3. **V/C/P/L** — search digital forensics, system identification, provenance, observability and epistemic-time literature for an existing explicit four-coordinate separation.
4. **AIA** — compare against multi-view databases, multilevel security, decentralized information-flow control, secure multi-execution, and receiver-dependent channel semantics.
5. **Safe Harbor** — compare the post-participation-usefulness criterion against data portability, research withdrawal, dynamic consent, revocation propagation, institutional handoff, and exit-right literature.

The correct stopping rule remains:

```text
NOT_FOUND_YET != NOVEL
FOUND_PARENT != BURY_COMPOSITION
```

## 5. Branch posture

The Wendbine Atelier branch is a frozen research surface, not the current production base. `main` advanced after this Atelier branch split. This sieve does not overwrite, rebase, merge, or deploy those newer runtime changes.

Reconciliation with current main is a separate engineering action requiring its own exact-head check.

Marked ⟐
