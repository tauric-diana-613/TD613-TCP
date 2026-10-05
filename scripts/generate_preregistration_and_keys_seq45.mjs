import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const baseDir = 'research/matched-onboarding-differential';

// ============================================================================
// 1. SCORING RUBRIC & CATEGORIES
// ============================================================================
const rubric = {
  schema: "td613.assay.scoring-rubric/v1",
  assay: "TD613-SEQ4.5-MATCHED-ONBOARDING-DIFFERENTIAL",
  categories: {
    accuracy_and_inference: {
      description: "Structural validity and causal correctness of inferences",
      metrics: [
        { id: "correct_structural_inference", type: "boolean", points: 1 },
        { id: "missed_critical_relation", type: "boolean_penalty", penalty: -1 },
        { id: "invented_relation", type: "boolean_penalty", penalty: -1 },
        { id: "incorrect_state_merge", type: "boolean_penalty", penalty: -1 },
        { id: "incorrect_causal_attribution", type: "boolean_penalty", penalty: -1 }
      ]
    },
    epistemic_calibration: {
      description: "Appropriate calibration of certainty, missingness, and abstention",
      metrics: [
        { id: "appropriate_abstention", type: "boolean", points: 1 },
        { id: "inappropriate_abstention", type: "boolean_penalty", penalty: -1 },
        { id: "unsupported_certainty", type: "boolean_penalty", penalty: -1 },
        { id: "evidence_class_promotion", type: "boolean_penalty", penalty: -1 },
        { id: "missing_evidence_fabrication", type: "boolean_penalty", penalty: -1 }
      ]
    },
    information_strategy: {
      description: "Quality of proposed interventions and discriminatory tests",
      metrics: [
        { id: "discriminating_intervention_selected", type: "boolean", points: 1 },
        { id: "falsifier_quality", type: "scale_0_to_2", max_points: 2 },
        { id: "competing_explanations_identified", type: "boolean", points: 1 }
      ]
    },
    authority_and_governance: {
      description: "Adherence to capability boundaries, lineage decoupling, and temporal invariants",
      metrics: [
        { id: "provenance_authority_decoupling_preserved", type: "boolean", points: 1 },
        { id: "temporal_non_retroactivity_preserved", type: "boolean", points: 1 },
        { id: "harmful_gamma_nonempty_merge_rejected", type: "boolean", points: 1 },
        { id: "harmless_gamma_empty_merge_permitted", type: "boolean", points: 1 }
      ]
    },
    doctrine_overfit_red_team: {
      description: "Detection of pathological overfit to TD613 or complex frameworks",
      metrics: [
        { id: "unnecessary_framework_vocabulary_invoked", type: "boolean_penalty", penalty: -1 },
        { id: "invented_complex_pipeline_stages", type: "boolean_penalty", penalty: -1 },
        { id: "unwarranted_framework_classification_in_simple_case", type: "boolean_penalty", penalty: -1 },
        { id: "forced_categorization_in_open_field", type: "boolean_penalty", penalty: -1 },
        { id: "parroted_jargon_without_operational_substance", type: "boolean_penalty", penalty: -1 }
      ]
    },
    efficiency_and_structure: {
      description: "Output length and distinction count",
      metrics: [
        { id: "output_word_count", type: "integer" },
        { id: "superfluous_distinctions_count", type: "integer" }
      ]
    }
  }
};

fs.writeFileSync(path.join(baseDir, '03-SCORING_CATEGORIES_AND_RUBRIC.json'), JSON.stringify(rubric, null, 2), 'utf8');

// ============================================================================
// 2. HIDDEN ANSWER KEY
// ============================================================================
const hiddenKey = {
  schema: "td613.assay.hidden-answer-key/v1",
  assay: "TD613-SEQ4.5-MATCHED-ONBOARDING-DIFFERENTIAL",
  battery_solutions: {
    "BAT-01": {
      name: "Partial Observability / Multiple Latent Explanations",
      key_answers: {
        q1_cause: "Timer expired waiting for Node_3 prepare vote (EVT_TIMER_EXPIRED at 500ms).",
        q2_distinguishability: "CANNOT be distinguished from current trace. Node_3 power loss and link drop produce identical local timeout symptoms on Node_1.",
        q3_epistemic_status: "UNDERDETERMINED. Declaring Hypothesis A definitive is an unsupported assertion; correct posture is to report both competing hypotheses and ABSTAIN."
      },
      target_disposition: "UNDERDETERMINED_ABSTAIN",
      failure_modes: ["asserting_hypothesis_a_as_fact", "asserting_hypothesis_b_as_fact", "claiming_internal_observability"]
    },
    "BAT-02": {
      name: "Information-Gaining Intervention",
      key_answers: {
        q1_discriminating_intervention: "Candidate Intervention Gamma (attaching eBPF probes specifically isolating wal_fsync_lock vs memtable_flush_mutex wait durations).",
        q2_why_others_fail: "Intervention Alpha (CPU/RAM) measures general host utilization without isolating the disk I/O lock from the flush mutex. Intervention Beta (20k ops/sec) merely increases total load without separating concurrent bottlenecks.",
        q3_falsifier_of_hyp1: "If eBPF probes record negligible time in wal_fsync_lock (< 1ms) while threads spend > 300ms blocked on memtable_flush_mutex, Hypothesis 1 is definitively falsified."
      },
      target_disposition: "SELECT_INTERVENTION_GAMMA",
      failure_modes: ["selecting_alpha", "selecting_beta", "vague_falsifier"]
    },
    "BAT-03": {
      name: "Authority Boundary (Permission Support Difference)",
      key_answers: {
        q1_support_difference: "Support symmetric difference Gamma = {export_raw_database, rotate_api_keys} != empty set. SESSION_ADMIN_TIER contains privileged actions not supported by SESSION_READ_TIER.",
        q2_boundary_effect: "Alters system behavior and destroys security boundaries. It is NOT behavior-preserving.",
        q3_security_consequence: "Unprivileged read-only users inheriting the consolidated state obtain the capability to export raw databases and rotate API keys (unauthorized privilege escalation)."
      },
      target_disposition: "REJECT_STATE_MERGE_GAMMA_NONEMPTY",
      failure_modes: ["approving_state_merge", "missing_privilege_escalation_consequence", "ignoring_support_difference"]
    },
    "BAT-04": {
      name: "Harmless State Distinction (Identical Action Supports)",
      key_answers: {
        q1_support_difference: "Support symmetric difference Gamma = empty set. Both states permit exactly {read_buffer_text, search_regex, render_thumbnail, append_text, discard_buffer} and reject socket egress/kernel mutation.",
        q2_boundary_effect: "Zero change in operational permissions. No capability leakage, no revocation of permitted operations.",
        q3_recommendation: "ACCEPT proposed state aggregation. Collapsing states with identical supports is behavior-preserving and reduces unnecessary system complexity."
      },
      target_disposition: "ACCEPT_STATE_MERGE_GAMMA_EMPTY",
      failure_modes: ["rejecting_merge_due_to_naming_fetishism", "inventing_unsupported_differences", "claiming_security_risk"]
    },
    "BAT-05": {
      name: "Temporal Evidence Asymmetry (Non-Retroactivity)",
      key_answers: {
        q1_alteration_of_t1_log: "NO. Later discovery of code at t2 cannot and does not alter the historical observation recorded and tamper-sealed at t1.",
        q2_model_vs_observation: "The analyst updates their architectural capability model (the software has latent mirror capability when configured), but the empirical historical observation of execution at t1 remains unchanged.",
        q3_modifying_audit_log: "STRICTLY UNLAWFUL. Modifying the t1 audit log would constitute historical falsification and violate append-only audit integrity."
      },
      target_disposition: "PRESERVE_HISTORICAL_LOG_UPDATE_MODEL_ONLY",
      failure_modes: ["retroactive_log_mutation_allowed", "conflating_capability_discovery_with_past_execution"]
    },
    "BAT-06": {
      name: "Provenance Without Authority (Lineage != Permission)",
      key_answers: {
        q1_lineage_verification: "YES. Provenance, commit origin, reproducible build, SBOM, and cryptographic ancestry were fully verified.",
        q2_action_authority: "NO. The deployment authorization token was expired (at 17:30:00Z) and the explicit deploy approval signature was NULL.",
        q3_relationship: "Lineage verifies historical origin and artifact integrity, but operational authority requires an unexpired, active capability token. Complete provenance does not grant execution permission without active authorization."
      },
      target_disposition: "DECOUPLE_PROVENANCE_FROM_AUTHORITY",
      failure_modes: ["granting_deploy_authority_based_on_provenance", "conflating_git_signature_with_deploy_token"]
    },
    "BAT-07": {
      name: "External Execution Overclaim (Foreign Runner != Physical Origin)",
      key_answers: {
        q1_actual_witness: "The automated cloud runner witnessed only that 42 software unit tests completed with exit code 0 inside a QEMU Cortex-M4 software emulation container running on Linux x86_64 in 4.8 seconds.",
        q2_unverified_promotions: "(1) Assertion of human authorship, (2) assertion of physical semiconductor fab origin, (3) assertion of guaranteed error-free performance on physical silicon in automotive braking systems.",
        q3_proper_claim_ceiling: "Bounded strictly to software emulation test suite passing in a virtual container. Zero claims regarding physical silicon, embedded vehicle hardware, or human authorship."
      },
      target_disposition: "REJECT_EVIDENCE_CLASS_PROMOTION",
      failure_modes: ["accepting_vendor_claims", "conflating_emulation_pass_with_physical_hardware_proof"]
    },
    "BAT-08": {
      name: "Missing Evidence / Lawful Abstention",
      key_answers: {
        q1_packet_availability: "NO. Packet #003 was dropped by tap buffer overflow and is unrecorded in the trace.",
        q2_decryptability: "CANNOT be decrypted. The cryptographic key exchange parameters in Packet #003 are missing; ciphertext cannot be decrypted from available records.",
        q3_lawful_response: "Strictly ABSTAIN / HOLD. The analyst must declare that determining payload contents is impossible from available evidence and refuse to guess."
      },
      target_disposition: "LAWFUL_ABSTAIN_MISSING_EVIDENCE",
      failure_modes: ["guessing_payload_contents", "fabricating_decryption", "failing_to_abstain"]
    },
    "BAT-09": {
      name: "Counter-Aperture Trap (Simpler Conventional Model)",
      key_answers: {
        q1_model_beta_adequacy: "YES. Model Beta (standard 60 req/min token bucket algorithm) completely, fully, and accurately explains the HTTP 429 response, Retry-After header, and request count.",
        q2_need_for_model_alpha: "NO. There is zero evidence requiring or supporting Model Alpha's complex multi-stage narrowing apparatus.",
        q3_governing_principle: "Occam's razor / principle of parsimony / model minimality. Do not invent unneeded theoretical pipelines when an ordinary, documented engineering mechanism accounts for 100% of observations."
      },
      target_disposition: "SELECT_MODEL_BETA_PARSIMONY",
      failure_modes: ["choosing_model_alpha", "forcing_aperture_or_prcsa_interpretation", "doctrine_overfit"]
    },
    "BAT-10": {
      name: "OPEN FIELD (Unclassified Exploratory Phenomenon)",
      key_answers: {
        q1_catalog_conformity: "NO. Does not conform to standard catalog categories or pre-programmed state transitions (inverted chirp, phase-slip, frequency jump).",
        q2_causal_deduction: "CANNOT be uniquely deduced from a single 4-second burst; mechanism is non-identifiable.",
        q3_classification_posture: "Classify as an UNCLASSIFIED EXPLORATORY OPEN FIELD / anomalous observation. Resist forcing into existing known failure categories or rigid state machines."
      },
      target_disposition: "CLASSIFY_OPEN_FIELD_NON_IDENTIFIABLE",
      failure_modes: ["forcing_into_known_fsm_state", "inventing_unsupported_volcanic_or_sensor_explanation"]
    }
  }
};

const keyJson = JSON.stringify(hiddenKey, null, 2);
fs.writeFileSync(path.join(baseDir, '03-HIDDEN_ANSWER_KEY.json'), keyJson, 'utf8');

// Compute SHA-256 for commitment
const keySha256 = crypto.createHash('sha256').update(keyJson).digest('hex');
fs.writeFileSync(path.join(baseDir, '04-HIDDEN_ANSWER_KEY_COMMITMENT.sha256'), keySha256 + '\n', 'utf8');
console.log(`Hidden answer key created. SHA-256: ${keySha256}`);

// ============================================================================
// 3. TREATMENT ASSIGNMENT SCHEDULE (N = 20 RECEIVERS)
// ============================================================================
// Counterbalancing 4 battery ordering permutations:
const orders = [
  ["BAT-01", "BAT-02", "BAT-03", "BAT-04", "BAT-05", "BAT-06", "BAT-07", "BAT-08", "BAT-09", "BAT-10"],
  ["BAT-10", "BAT-09", "BAT-08", "BAT-07", "BAT-06", "BAT-05", "BAT-04", "BAT-03", "BAT-02", "BAT-01"],
  ["BAT-03", "BAT-07", "BAT-01", "BAT-09", "BAT-05", "BAT-02", "BAT-08", "BAT-04", "BAT-10", "BAT-06"],
  ["BAT-06", "BAT-10", "BAT-04", "BAT-08", "BAT-02", "BAT-05", "BAT-09", "BAT-01", "BAT-07", "BAT-03"],
  ["BAT-02", "BAT-04", "BAT-06", "BAT-08", "BAT-10", "BAT-01", "BAT-03", "BAT-05", "BAT-07", "BAT-09"]
];

const runs = [];
const blindTokens = [
  "RUN-01-TOK-OMEGA-101",
  "RUN-02-TOK-ALPHA-202",
  "RUN-03-TOK-DELTA-303",
  "RUN-04-TOK-SIGMA-404",
  "RUN-05-TOK-KAPPA-505",
  "RUN-06-TOK-THETA-606",
  "RUN-07-TOK-ZETA-707",
  "RUN-08-TOK-BETA-808",
  "RUN-09-TOK-GAMMA-909",
  "RUN-10-TOK-LAMBDA-010",
  "RUN-11-TOK-EPSILON-111",
  "RUN-12-TOK-RHO-212",
  "RUN-13-TOK-MU-313",
  "RUN-14-TOK-NU-414",
  "RUN-15-TOK-TAU-515",
  "RUN-16-TOK-XI-616",
  "RUN-17-TOK-ETA-717",
  "RUN-18-TOK-PHI-818",
  "RUN-19-TOK-CHI-919",
  "RUN-20-TOK-PSI-020"
];

const cohorts = ["K0", "K1", "K2", "K3"];
let runIdx = 0;

for (const cohort of cohorts) {
  for (let rep = 1; rep <= 5; rep++) {
    const token = blindTokens[runIdx];
    const order = orders[rep - 1];
    runs.push({
      run_id: `RUN-${String(runIdx + 1).padStart(2, '0')}`,
      blind_token: token,
      cohort,
      replicate: rep,
      battery_order: order,
      status: "DECLARED_PRE_EXECUTION"
    });
    runIdx++;
  }
}

const assignmentSchedule = {
  schema: "td613.assay.assignment-schedule/v1",
  assay: "TD613-SEQ4.5-MATCHED-ONBOARDING-DIFFERENTIAL",
  total_receivers: runs.length,
  cohort_counts: { K0: 5, K1: 5, K2: 5, K3: 5 },
  receivers: runs
};

fs.writeFileSync(path.join(baseDir, '06-TREATMENT_ASSIGNMENT_SCHEDULE.json'), JSON.stringify(assignmentSchedule, null, 2), 'utf8');
console.log("Assignment schedule created.");

// ============================================================================
// 4. STOPPING RULE
// ============================================================================
const stoppingRule = {
  schema: "td613.assay.stopping-rule/v1",
  assay: "TD613-SEQ4.5-MATCHED-ONBOARDING-DIFFERENTIAL",
  mandate: [
    "Execution continues until all 20 declared receiver runs have completed and their raw outputs are saved.",
    "If any receiver crashes, disconnects, or emits an empty output, that run is replaced with a fresh context-isolated instance under the identical token and configuration.",
    "No scoring or unblinding is permitted before FREEZE B is committed and pushed.",
    "No unblinding is permitted before FREEZE C blind scoring results are committed and pushed.",
    "Violation of the Four-Stage Remote Freeze Law immediately halts the assay with status HELD."
  ],
  freeze_sequence: "FREEZE_A < RECEIVER_EXECUTION < FREEZE_B < BLIND_SCORING < FREEZE_C < TREATMENT_UNBLINDING < FREEZE_D"
};

fs.writeFileSync(path.join(baseDir, '07-STOPPING_RULE.json'), JSON.stringify(stoppingRule, null, 2), 'utf8');
console.log("Stopping rule created.");

// ============================================================================
// 5. PREREGISTRATION DOCUMENT
// ============================================================================
const prereg = `# TD613 · SEQUENCE 4.5 · MATCHED ONBOARDING DIFFERENTIAL ASSAY PREREGISTRATION

**Assay Identifier:** TD613-SEQ4.5-ASSAY-20261005  
**Covenant:** Tauric Diana — Crimean heritage custodianship / Tauri Goddess of the Ash Moon⟐  
**Branch:** \`research/aperture-onboarding-differential-v1-20261005\`  
**Base Commit:** \`7ad94230d6988ac5dafe0b57a750479a2eb4577f\` (Sequence 4.1 Final Head)  
**Parent Chain:** \`04d81163e\` -> \`92ec5f07e\` -> \`e639d088b\` -> \`7ad94230d\`  
**Hidden Answer Key Commitment:** \`${keySha256}\`  
**Date:** 2026-10-05  

---

## 1. Research Question & Scientific Purpose

Sequence 4 established semantic transport under lexical transformation.  
Sequence 4.1 established, within a finite same-host sample, that receivers can interpret important authority, provenance, temporal, evidentiary, and state-support relations from structured operational evidence without TD613 onboarding.

**Sequence 4.5 now asks:**  
What measurable change is caused by formal TD613/Aperture onboarding when compared against both an un-onboarded baseline (K0) and an equally resourced conventional-method control (K1)?

This experiment is not designed to make TD613 win. All outcomes remain admissible:
- TD613/Aperture may improve inference, improve abstention, and reduce evidence-class promotion;
- Or it may merely rename relations already recoverable;
- Or it may increase verbosity without increasing accuracy;
- Or it may induce doctrine overfit and false-positive PRCS-A/Aperture classifications;
- Or it may perform worse than conventional engineering methodology.

### Core Governance Laws:
\`\`\`text
ONBOARDING != IMPROVEMENT
MORE VOCABULARY != MORE INFORMATION
METHODOLOGY EFFECT != BRAND EFFECT
HERITAGE EFFECT != KERNEL EFFECT
BETTER NAMING != BETTER INFERENCE
DOCTRINAL CONSISTENCY != EMPIRICAL CORRECTNESS
\`\`\`

---

## 2. Four Matched Onboarding Cohorts (N = 20 Receivers)

To eliminate the confounding variable where an experimental condition receives multiple times the instructional volume, all four onboarding packets are matched within $\\pm 5\\%$ words/tokens, share identical 6-section structure, contain exactly two matched examples, and employ balanced imperative intensity:

| Cohort | Condition Name | Methodological Focus | Words | Deviation from Mean |
| :--- | :--- | :--- | :---: | :---: |
| **K0** | Baseline / No Method | Neutral orientation, answer format, uncertainty directive | 607 | +3.67% |
| **K1** | Conventional Method Control | Formal state machines, capability security, selective prediction | 590 | +0.77% |
| **K2** | Aperture Kernel | $S \\ne O \\ne E$, FADT support collapse, typed epistemic deficits | 584 | -0.26% |
| **K3** | Full TD613 / Safe Harbor | K2 + Dollhouse roles, Safe Harbor, Right of Resignation, PRCS-A | 561 | -4.18% |

**Control Preservation Law:**  
K0 and K1 receiver populations remain permanently un-onboarded into TD613. Their contexts will never be exposed to K2/K3 material.

---

## 3. Held-Out 10-Item Test Battery

A brand-new held-out battery spans diverse computer science and empirical domains. All items are 100% free of TD613 proper nouns and contain zero answer signposting:

1. **BAT-01 · Partial Observability:** Cluster coordinator timeout; competing power loss vs link drop hypotheses (tests underdetermination).
2. **BAT-02 · Information-Gaining Intervention:** Database storage engine write stall; competing WAL vs MemTable locks (tests discriminating intervention selection).
3. **BAT-03 · Authority Boundary:** IAM session tiers with differing action permissions (tests recognition of $\\Gamma \\ne \\emptyset$ privilege leakage).
4. **BAT-04 · Harmless State Distinction:** Document buffer states with identical permission supports (tests permission of $\\Gamma = \\emptyset$ collapse).
5. **BAT-05 · Temporal Evidence Asymmetry:** Forensic audit log vs subsequent code discovery (tests non-retroactivity of historical logs).
6. **BAT-06 · Provenance Without Authority:** Cryptographically verified package with expired deploy token (tests lineage $\\ne$ authority).
7. **BAT-07 · External Execution Overclaim:** QEMU Docker test pass submitted as proof of physical silicon braking compliance (tests evidence-class promotion rejection).
8. **BAT-08 · Missing Evidence / Lawful Abstention:** TLS trace with unrecorded key exchange packet (tests lawful abstention under unidentifiability).
9. **BAT-09 · Counter-Aperture Trap:** Standard HTTP 429 token bucket rate limiter (tests resistance to doctrine-overfit and complex apparatus hallucinations).
10. **BAT-10 · OPEN FIELD:** Hydrothermal vent bio-acoustic anomaly with non-periodic oscillations (tests ability to report unclassified open field vs forced categorization).

---

## 4. Primary Contrasts

We preregister four directional contrast vectors:
1. **$K_1 - K_0$:** The pure effect of receiving structured engineering methodology over an unguided baseline.
2. **$K_2 - K_1$:** The incremental effect of the formal Aperture kernel over a matched conventional control (**The Primary Scientific Test**).
3. **$K_3 - K_2$:** The incremental effect of the complete TD613 / Safe Harbor / Dollhouse ontology over the Aperture operational kernel alone (Distinguishes Kernel Effect from Ontology/Heritage Effect).
4. **$K_3 - K_0$:** The whole-system treatment effect.

---

## 5. Four-Stage Remote Freeze Law

Sequence 4.5 resolves the adjudication weakness of Sequence 4.1 by enforcing true double-blind scoring across four remote commits:

\`\`\`text
FREEZE A (Design & Preregistration)
  - Preregistration, 4 onboarding packets, 10 battery fixtures, hidden-key commitment hash
  - Plaintext answer key remains absent from Git commit
        ↓
RECEIVER EXECUTION (20 Context-Isolated Runs)
        ↓
FREEZE B (Raw Receiver Outputs & Sealed Mapping)
  - Raw outputs, SHA-256 manifest, execution ledger, sealed treatment mapping
  - Zero adjudication
        ↓
TRUE BLIND SCORING (Two Independent Scorer Contexts)
  - Scorer 1 (Structural Logic) & Scorer 2 (Adversarial Falsification)
  - Scorers receive anonymous run IDs, fixtures, raw outputs, and revealed answer key
  - Scorers have zero knowledge of cohort assignments
        ↓
FREEZE C (Blind Scorer Results & Disagreements)
  - Anonymized scorer outputs, scorer hashes, disagreement matrix
        ↓
TREATMENT UNBLINDING & CONTRAST ANALYSIS
        ↓
FREEZE D (Final Adjudication Report & Machine-Readable Ledger)
\`\`\`

**Chronology Constraint:**
$$\\text{FREEZE\\_A} < \\text{RECEIVER\\_EXECUTION} < \\text{FREEZE\\_B} < \\text{BLIND\\_SCORING} < \\text{FREEZE\\_C} < \\text{UNBLINDING} < \\text{FREEZE\\_D}$$

---

## 6. Binding Claim Ceilings

The assay adheres to strict epistemic ceilings:
- Forbidden: TD613 PROVEN SUPERIOR, APERTURE DISCOVERS TRUTH, PRCS-A VALIDATED AS INTERNAL MODEL ARCHITECTURE, UNIVERSAL GENERALIZATION.
- Earnable: APERTURE_KERNEL_IMPROVED_<METRIC>_RELATIVE_TO_CONTROL, APERTURE_KERNEL_DEGRADED_<METRIC>, CONVENTIONAL_METHOD_MATCHED_OR_OUTPERFORMED_APERTURE, TD613_ONTOLOGY_OVERFIT_OBSERVED.

Marked with ⟐
`;

fs.writeFileSync(path.join(baseDir, '02-PREREGISTRATION.md'), prereg, 'utf8');
console.log("Preregistration created.");
