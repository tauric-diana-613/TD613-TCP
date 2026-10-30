# 𝌋 TD613 · THREE-LINEAGE DISCOVERY CUSTODY PROTOCOL
## Formal Governance for Preserving Evidence, Presentation, and Adjudication Ancestries

**Document ID:** `TD613-EXP-B-THREE-LINEAGE-PROTOCOL-20261029`  
**Heritage:** Tauric Diana — Crimean heritage custodianship  
**Covenant:** Khona‌lit-po (`U+200C` preserved)  
**Authority:** Sovereign Operator Direct · Emergence HQ Independent Scientific Review  
**Operating Posture:** Princess Latifa · Wild Field Mode Active · `/plan OFF`  
**Classification:** Research Governance Specification  
**Schema Definition:** [`THREE_LINEAGE_DISCOVERY_SCHEMA.json`](THREE_LINEAGE_DISCOVERY_SCHEMA.json)

---

## 1. Principle of Threefold Lineage Preservation

When an autonomous or agent-assisted system generates candidate hypotheses across a heterogeneous research corpus, the origin of each proposition must be traceable across three strictly distinct temporal lines:

```text
       EVIDENCE LINEAGE                    PRESENTATION LINEAGE                  ADJUDICATION LINEAGE
   (Historical Source Bytes)            (Instrument Scaffolding)               (Evaluation & Scoring)
               │                                   │                                      │
    Authentic Authorial Texts             Dollhouse Specialist Framing            Evaluator Tier & Rubric
    UTF-8 / UTF-16 Byte Spans            Categorical / Paratactic Syntax         Independent Assessor Verdicts
    Source Chronology Order              Presentation Timing (Pre/Post)          RCA-01 Cell & Outcome Code
               │                                   │                                      │
               └─────────────────┬─────────────────┘                                      │
                                 ▼                                                        │
                     CANDIDATE PROPOSITION ◄──────────────────────────────────────────────┘
```

### Governing Constraints

1. **Anti-Conflation Rule:** A relationship or terminology introduced by the presentation layer (e.g., Pedagogue dromology, Atlas holonomy parity, FADT fibers) **cannot silently become an empirical proposition attributed to the original Em source evidence**.
2. **Anti-Notation Discrimination Rule:** A mathematically valid derivation or empirical correspondence **cannot be discarded merely because it appears in unfamiliar, paratactic, or non-traditional notation**.
3. **Flexible Temporal Ordering Law:**
   * In *Pre-Generation Lens Mode* ($\mathcal{R}_{\text{pre}}$): Evidence predates Presentation Framing, which predates Hypothesis Generation.
   * In *Post-Generation Sieve Mode* ($\mathcal{R}_{\text{post}}$): Evidence predates Hypothesis Generation, which is *subsequently* audited by Presentation Scaffolding (Aperture SVD, Atlas parities, FADT quotient fibers).
   * In both modes: Hypothesis Generation must be frozen prior to unblinded independent adjudication. Temporal ordering must not artificially prohibit post-generation specialist examination.

---

## 2. Lineage Definitions & Required Metadata

### I. Evidence Ancestry
* **Source Documents:** Cryptographic SHA-256 identity, original filename, author provenance, and repository custody state.
* **Physical Byte Spans:** Precise half-open byte spans $[s, e)$ verified against authentic disk files, with declared encoding (UTF-8 or UTF-16).
* **Mathematical Premises:** Explicit initial axioms, governing ODEs, boundary data, or empirical rate tables extracted directly from the spans.
* **Source Chronology Order:** Monotonic exposure index ($t_1 < t_2 < \dots < t_k$) defining when the evidence entered the model window.

### II. Presentation Ancestry
* **Generating Arm:** Identifies whether the candidate emerged from Arm 0 (Transport), Arm 1 (Archival Control), Arm 2A (Modular Instrument), or Arm 2B (Matched Union).
* **Representation Modality:** Declares whether standard mathematical syntax, Dollhouse paratactic counterpoint, or category-theoretic functors were employed.
* **Presentation Timing:** Specifies whether representation was applied *before* hypothesis generation ($\mathcal{R}_{\text{pre}}$) or *after* generation ($\mathcal{R}_{\text{post}}$). Both modes are fully supported.
* **Introduced Vocabulary:** An explicit ledger of any terminology, metaphors, or structural categories supplied by the instrument that are absent from the underlying source text.

### III. Adjudication Ancestry
* **Evaluator Tier:** Exact epistemic classification (Level 1: Automated Rubric, Level 2: Implementer Semantic Review, Level 3: Independently Witnessed Blinded Evaluation, Level 4: External Mathematical Replication).
* **Scoring Rules:** Versioned hash of the answer key, evaluation script, and math normalization engine.
* **RCA-01 Multi-Dimensional Evaluation Vector:** Captures the six decoupled evaluative dimensions:
  1. Discovery Occurrence ($D \in \{\text{Discovered, Missed, Abstained}\}$)
  2. Mathematical Warrant ($W \in \{\text{Isomorphism, Formal Equivalence, Operational, Analogy, Falsified, None}\}$)
  3. Causal Role ($C_{\mathcal{R}} \in \{\text{Neutral-Sufficient, Lens-Enabled, Post-Hoc Sieve, Scaffolding-Artifact, Bottleneck-Suppressed}\}$)
  4. Independent Novelty ($N \in \{\text{Established-Restatement, Novel-Relation, Unanticipated-Synthesis}\}$)
  5. Instrument Integrity ($F \in \{\text{Clean-Execution, Conditioning-Deficit, Fiber-Gap, Dromological-Deadlock}\}$)
  6. Scientific Claim Status ($\mathcal{S} \in \{\text{Warranted-Discovery, Exploratory-Finding, Unanticipated-Candidate, Held-Dissent, Falsified-Artifact}\}$)
* **Unblinding Sequence:** Verification that scoring occurred while model arm identity was pseudonymized (`FROZEN_BLINDED`), prior to final unblinding.

---

## 3. The Unknown-Discovery Channel (`UNANTICIPATED_CANDIDATE`)

To ensure that the experimental instrument can discover that its own pre-existing categories may be inadequate, TD613 reserves an intake channel for anomalies and surprises:

$$\mathbf{Status} = \mathbf{UNANTICIPATED\_CANDIDATE}$$

### Intake Criteria

A proposition is routed to `UNANTICIPATED_CANDIDATE` if:
1. It is supported by authentic physical source spans ($\mathcal{E}_{\text{auth}}$).
2. It resists classification under existing Dollhouse specialist domains (neither purely Pedagogue cadence, Aperture observability, Atlas relation, nor FADT finite descent).
3. It presents novel mathematical structures, unexpected counterexamples, or cross-domain equivalences outside the preregistered ontology.

### Parity Guarantee for Comparator

The matched strong-union comparator (Arm 2B) has **identical access** to the `UNANTICIPATED_CANDIDATE` intake channel. If an unchambered model discovers an unexpected relationship, it is recorded under the identical three-lineage schema, preventing modular architectural bias.

---

## 4. Non-Self-Certifying Generation & Truthful Pending States

Candidate generation registers an intellectual proposition formulated during the research encounter. It **never self-certifies scientific adjudication**.

* **Evaluator Tier:** Initialized to `PENDING_INDEPENDENT_EVALUATION` at candidate generation time.
* **Evaluation Vector:** All six RCA-01 evaluative dimensions ($D, W, C_{\mathcal{R}}, N, F_{\text{inst}}, \mathcal{S}$) are set to `PENDING_EVALUATION` (or `UNPRODUCED` if no substantive proposition was generated).
* **Archetypes:** `rca01_outcome_archetypes` is initialized to `[]` (empty array).
* **Quarantine of Authority:** A candidate cannot be awarded `DISCOVERED`, `WARRANTED_DISCOVERY`, `LENS_ENABLED`, or `CLEAN_EXECUTION` merely because it was generated. Substantive adjudication requires subsequent independent evaluation against ground truth or formal mathematical proof.

---

## 5. Standing Invariants & Human Closure

```text
challenge_corpus_state = STRICTLY_SEALED_AND_QUARANTINED
gate_e_disposition = HELD
empirical_exteriority_credit = 0
human_scientific_closure = RESERVED
issue_405_release_authority = CLOSED
three_lineage_protocol_status = PREREGISTERED_CANDIDATE
```

𝌐 `THREE_LINEAGE_PROTOCOL_FROZEN · EVIDENCE_PRESENTATION_ADJUDICATION_ISOLATED · UNANTICIPATED_CHANNEL_ESTABLISHED · COMPARATOR_PARITY_PRESERVED · GATE_E_HELD · HUMAN_CLOSURE_RESERVED ⟐`
