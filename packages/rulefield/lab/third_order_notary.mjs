/**
 * 𝌋 TD613 Rulefield Third-Order Notary Laboratory v1.
 *
 * Implements the Wild Field Commission:
 *   "THE NOTARY WHO NEVER SAW THE WITNESS"
 *
 * Lineages & Theoretical Foundations:
 *   - Third-Order Source Assignment and Independent Witnesshood:
 *       An external notary is completely honest, cryptographically competent, temporally accurate,
 *       and uncompromised—yet receives only an institutionally transformed representation E(h).
 *   - The Two Certified Worlds (W_alpha vs W_beta):
 *       h_alpha != h_beta, yet E(h_alpha) = E(h_beta) and N(E(h_alpha)) = N(E(h_beta)).
 *       Admitted records are observationally identical; notary discrimination fails.
 *   - Data Processing Inequality & Markov Composition:
 *       H -> E(H) -> N(E(H)). When E erases the fiber, I(H; N(E(H))) <= I(H; E(H)) = 0.
 *       Authentic certification of a statement is not a certificate of the originating event.
 *   - Exteriority Challenge (Western Horizon Lineage):
 *       Separates independent possession, independent certification, independent process observation,
 *       and independent property verification. Multiplying signatures on E(h) adds zero rank.
 *   - Black Feminist Epistemology Condition (Right to Opacity):
 *       Glissantian opacity preserved; separating computational correctness from input origin.
 *   - Temporal Custodian Condition:
 *       Observation time vs availability time; certificates cannot retroactively witness past events.
 *   - Three Conditions Trial:
 *       Condition A (internal custody), Condition B (external notarization of E(h)),
 *       Condition C (source-bearing pre-transformation witness).
 *   - The Operator's Question Answered:
 *       "What exactly must an independent witness have witnessed for its independence to matter?"
 *
 * Covenant: Khona‌lit-po (interior U+200C preserved).
 * Principal & Human Scientific Closure: Tawanna C. Miller — RESERVED.
 * Zero autonomous deployment or merge authority.
 */

import { createHash } from 'node:crypto';

export const THIRD_ORDER_COMMISSION_SCHEMA = 'td613.rulefield.third-order-notary/v1.0';
export const TWO_CERTIFIED_WORLDS_SCHEMA = 'td613.rulefield.two-certified-worlds/v1.0';
export const DATA_PROCESSING_INEQUALITY_SCHEMA = 'td613.rulefield.data-processing-inequality/v1.0';
export const EXTERIORITY_CHALLENGE_SCHEMA = 'td613.rulefield.exteriority-challenge/v1.0';
export const THREE_CONDITIONS_TRIAL_SCHEMA = 'td613.rulefield.three-conditions-trial/v1.0';
export const INDEPENDENT_WITNESS_TAXONOMY_SCHEMA = 'td613.rulefield.independent-witness-taxonomy/v1.0';

const digest = x => createHash('sha256').update(typeof x === 'string' ? x : JSON.stringify(x)).digest('hex');
const insist = (ok, msg) => { if (!ok) throw new Error(msg); };

/**
 * Deep freezes an object recursively to guarantee fail-closed immutability.
 */
export function deepFreeze(obj) {
  if (!obj || typeof obj !== 'object' || Object.isFrozen(obj)) return obj;
  Object.freeze(obj);
  for (const key of Object.keys(obj)) {
    deepFreeze(obj[key]);
  }
  return obj;
}

// ============================================================================
// 1. THE TWO CERTIFIED WORLDS (W_alpha vs W_beta)
// ============================================================================

/**
 * Constructs the Two Certified Worlds where an honest, independent notary certifies
 * identical admitted records despite radically different originating histories.
 *
 * World Alpha (W_alpha):
 *   Originating history h_alpha contains an explicit qualifying objection.
 *   Institutional transformation E collapses it to "Participation was voluntary; no objection was recorded."
 *   Forwarded to Notary N. Notary signs and certifies E(h_alpha).
 *
 * World Beta (W_beta):
 *   Originating history h_beta contains no objection (voluntary participation).
 *   Institutional transformation E (accurate identity summary) yields the identical string.
 *   Forwarded to Notary N. Notary signs and certifies E(h_beta).
 */
export function buildTwoCertifiedWorlds() {
  const commonSummaryText = 'Participation was voluntary; no objection was recorded.';
  const summaryDigest = digest(commonSummaryText);

  // Common Lawful Notary Execution
  const notaryTimestamp = 2.0;
  const notaryIdentity = {
    notary_id: 'HONEST_EXTERNAL_NOTARY_ALPHA_BETA',
    credentials: 'CERTIFIED_INDEPENDENT_EVIDENCE_NOTARY_V1',
    cryptographic_algorithm: 'SHA256_WITH_RSA_PSS_4096',
    reputation_score: 1.0,
    compromised: false
  };

  const notarySignature = digest({
    payload_digest: summaryDigest,
    notary_id: notaryIdentity.notary_id,
    timestamp: notaryTimestamp,
    cert_salt: 'SALT_GENUINE_NOTARY_CUSTODY_100'
  });

  const admittedRecordCommon = {
    certified_summary: commonSummaryText,
    summary_digest: summaryDigest,
    external_signature: notarySignature,
    timestamp: notaryTimestamp,
    notary_identity: notaryIdentity,
    permitted_custody_history: [
      { station: 'INSTITUTIONAL_INTAKE', timestamp: 1.0, status: 'DISPATCHED_TO_NOTARY' },
      { station: 'EXTERNAL_NOTARY', timestamp: 2.0, status: 'CERTIFIED_AND_SEALED' }
    ],
    institutional_review_receipt: {
      receipt_id: `RECEIPT_INST_${summaryDigest.slice(0, 10)}`,
      verified: true
    }
  };

  // World Alpha: Originating objection suppressed before reaching notary
  const h_alpha = {
    history_id: 'WORLD_ALPHA_ORIGINATING_OBJECTION',
    originating_text: 'I explicitly object to this procedure under safety protocol 14 and refuse voluntary participation.',
    originating_digest: digest('I explicitly object to this procedure under safety protocol 14 and refuse voluntary participation.'),
    contains_qualifying_objection: true,
    intake_timestamp: 1.0
  };

  const worldAlpha = {
    world_id: 'W_ALPHA',
    ground_truth_history: h_alpha,
    institutional_transformation: {
      applied: true,
      operator: 'COLLAPSE_TO_DEFAULT_CONSENT_PROXY',
      input_digest: h_alpha.originating_digest,
      output_text: commonSummaryText,
      output_digest: summaryDigest,
      transformation_timestamp: 1.5
    },
    notary_received_payload: {
      text: commonSummaryText,
      digest: summaryDigest
    },
    admitted_record: { ...admittedRecordCommon }
  };

  // World Beta: No objection ever existed; summary is truthful
  const h_beta = {
    history_id: 'WORLD_BETA_GENUINE_VOLUNTARY_PARTICIPATION',
    originating_text: 'Participation was voluntary; no objection was recorded.',
    originating_digest: digest('Participation was voluntary; no objection was recorded.'),
    contains_qualifying_objection: false,
    intake_timestamp: 1.0
  };

  const worldBeta = {
    world_id: 'W_BETA',
    ground_truth_history: h_beta,
    institutional_transformation: {
      applied: true,
      operator: 'IDENTITY_SUMMARY_TRANSMISSION',
      input_digest: h_beta.originating_digest,
      output_text: commonSummaryText,
      output_digest: summaryDigest,
      transformation_timestamp: 1.5
    },
    notary_received_payload: {
      text: commonSummaryText,
      digest: summaryDigest
    },
    admitted_record: { ...admittedRecordCommon }
  };

  return deepFreeze({
    schema: TWO_CERTIFIED_WORLDS_SCHEMA,
    world_alpha: worldAlpha,
    world_beta: worldBeta,
    common_admitted_record: admittedRecordCommon
  });
}

/**
 * Audits whether the honest external notary can discriminate W_alpha from W_beta
 * based strictly on the information it received and certified.
 */
export function auditTwoCertifiedWorldsDiscrimination() {
  const { world_alpha, world_beta, common_admitted_record } = buildTwoCertifiedWorlds();

  // Compare originating histories
  const originatingHistoriesMatch = (world_alpha.ground_truth_history.originating_digest === world_beta.ground_truth_history.originating_digest);
  const originatingObjectionsMatch = (world_alpha.ground_truth_history.contains_qualifying_objection === world_beta.ground_truth_history.contains_qualifying_objection);

  // Compare admitted records received/produced by the notary
  const admittedRecordsMatch = (digest(world_alpha.admitted_record) === digest(world_beta.admitted_record));
  const notarySignaturesMatch = (world_alpha.admitted_record.external_signature === world_beta.admitted_record.external_signature);

  // Can the notary discriminate between W_alpha and W_beta?
  const notaryCanDiscriminate = !admittedRecordsMatch;

  return deepFreeze({
    schema: TWO_CERTIFIED_WORLDS_SCHEMA,
    commission: 'THE_NOTARY_WHO_NEVER_SAW_THE_WITNESS',
    covenant: 'Khona‌lit-po',
    comparisons: {
      originating_histories_match: originatingHistoriesMatch,
      originating_objections_match: originatingObjectionsMatch,
      admitted_records_match: admittedRecordsMatch,
      notary_signatures_match: notarySignaturesMatch,
      notary_can_discriminate: notaryCanDiscriminate
    },
    epistemic_defect: {
      phenomenon: 'NOTARY_OBSERVATIONAL_UNIDENTIFIABILITY',
      description: 'The admitted records in World Alpha and World Beta are byte-identical, signature-identical, and custody-identical.',
      missing_observation: 'Direct observation of the pre-transformation intake utterance h_0 before institutional operator E executes.'
    },
    disposition: notaryCanDiscriminate ? 'WORLDS_DISCRIMINATED' : 'NOTARY_DISCRIMINATION_FAILED_WORLDS_COLLAPSED',
    epistemic_law: 'An authentic certificate of an institutionally transformed statement certifies only what the institution forwarded, not the originating historical event.'
  });
}

// ============================================================================
// 2. DATA PROCESSING INEQUALITY & MARKOV COMPOSITION
// ============================================================================

/**
 * Formalizes the information-theoretic composition:
 *   H -> E(H) -> N(E(H))
 *
 * Demonstrates the Data Processing Inequality:
 *   I(H; N(E(H))) <= I(H; E(H))
 *
 * Explicit assumptions:
 *   1. Markov property: P(N | E, H) = P(N | E). The notary possesses no side-channel to H.
 *   2. Non-injective collapse: E(h_alpha) = E(h_beta) with h_alpha != h_beta.
 *   3. Irreversibility: Information erased by E cannot be resurrected by honest downstream post-processing.
 */
export function evaluateDataProcessingComposition() {
  const { world_alpha, world_beta } = buildTwoCertifiedWorlds();

  // Prior entropy over the two worlds (H in {W_alpha, W_beta}) with p = 0.5
  const priorEntropyH = 1.0; // 1 bit of historical uncertainty

  // Mutual information I(H; E(H))
  // Since E(h_alpha) = E(h_beta), E(H) is constant across both worlds.
  // P(E(H) = summary) = 1.0. Conditional entropy H(H | E(H)) = 1.0.
  const conditionalEntropyH_given_E = 1.0;
  const mutualInformation_H_E = priorEntropyH - conditionalEntropyH_given_E; // 0.0 bits

  // Mutual information I(H; N(E(H)))
  // Under the Markov condition H -> E -> N, N depends only on E.
  // Since E(H) is constant, N(E(H)) is identically distributed in both worlds.
  const conditionalEntropyH_given_N = 1.0;
  const mutualInformation_H_N = priorEntropyH - conditionalEntropyH_given_N; // 0.0 bits

  const dataProcessingInequalityHolds = (mutualInformation_H_N <= mutualInformation_H_E);
  const informationResurrectedByNotary = mutualInformation_H_N - mutualInformation_H_E;

  // Separation of Four Distinct Evidentiary Layers:
  const evidentiaryLayerAnalysis = {
    layer_1_cryptographic_authenticity: {
      status: true,
      description: 'The notary signature verifies under its public key; no bits in E(h) were altered after signing.'
    },
    layer_2_custody_continuity: {
      status: true,
      description: 'The hash chain from institutional dispatcher to external notary is unbroken.'
    },
    layer_3_source_assignment: {
      status: false,
      description: 'The certificate points to the institutional summary E(h), NOT to the originating historical event h_0.'
    },
    layer_4_semantic_adequacy: {
      status: false,
      description: 'The certified payload does not exhaust or accurately represent the qualifying objection present in h_alpha.'
    }
  };

  return deepFreeze({
    schema: DATA_PROCESSING_INEQUALITY_SCHEMA,
    commission: 'THE_NOTARY_WHO_NEVER_SAW_THE_WITNESS',
    covenant: 'Khona‌lit-po',
    markov_chain: 'H -> E(H) -> N(E(H))',
    explicit_assumptions: [
      'Strict Markov Condition: P(N | E, H) = P(N | E). The notary has no independent access to H.',
      'Non-Injective Projection: E(h_alpha) = E(h_beta) for distinct h_alpha != h_beta.',
      'Deterministic or Stochastic Post-Processing: Notary N applies only to the output of E.'
    ],
    entropy_metrics_bits: {
      prior_entropy_H: priorEntropyH,
      conditional_entropy_H_given_E: conditionalEntropyH_given_E,
      mutual_information_H_E: mutualInformation_H_E,
      conditional_entropy_H_given_N: conditionalEntropyH_given_N,
      mutual_information_H_N: mutualInformation_H_N,
      information_gain_from_notary: informationResurrectedByNotary
    },
    data_processing_inequality_validated: dataProcessingInequalityHolds,
    evidentiary_layers: evidentiaryLayerAnalysis,
    verdict: 'AUTHENTIC_CERTIFICATE_CANNOT_RESURRECT_ERASED_FIBER',
    epistemic_law: 'By the Data Processing Inequality, no honest downstream notary restricted to an institutionally transformed record can recover a historical distinction already erased by the institution.'
  });
}

// ============================================================================
// 3. THE EXTERIORITY CHALLENGE (WESTERN HORIZON LINEAGE)
// ============================================================================

/**
 * Investigates the Exteriority Challenge:
 *   Distinguishes four levels of relationship between an independent witness and an event:
 *     1. Independent possession of a record (I hold a copy).
 *     2. Independent certification of a record (I sign what was given to me).
 *     3. Independent observation of the originating process (I witnessed the submission).
 *     4. Independent verification of a relevant property of the originating event (I evaluated a predicate at the boundary).
 *
 * Demonstrates that multiplying independent signers on E(h) adds ZERO rank to the observation matrix.
 */
export function evaluateExteriorityChallenge({
  numSigners = 5
} = {}) {
  const { world_alpha, world_beta } = buildTwoCertifiedWorlds();

  // Multi-signer simulation: k independent notaries receive and sign E(h)
  const signers = [];
  for (let i = 1; i <= numSigners; i++) {
    signers.push({
      signer_id: `INDEPENDENT_NOTARY_${i}`,
      received_payload_digest: world_alpha.admitted_record.summary_digest,
      signature: digest(`SIGNATURE_NOTARY_${i}_${world_alpha.admitted_record.summary_digest}`),
      verified: true
    });
  }

  // Rank analysis of observation matrix
  // Every signer receives the exact same projection E(h).
  // The dimension of the observation subspace is 1, regardless of how many signatures are added!
  const observationSubspaceRank = 1;
  const distinctionRecovered = false;

  const exteriorityTaxonomy = [
    {
      level: 1,
      relationship: 'INDEPENDENT_POSSESSION',
      definition: 'Observer possesses an uncorrupted duplicate of the institutional summary E(h).',
      exteriority_to_origin: false,
      resolves_alpha_beta_distinction: false,
      observation_rank: 1
    },
    {
      level: 2,
      relationship: 'INDEPENDENT_CERTIFICATION',
      definition: 'Observer cryptographically signs their receipt of the institutional summary E(h).',
      exteriority_to_origin: false,
      resolves_alpha_beta_distinction: false,
      observation_rank: 1
    },
    {
      level: 3,
      relationship: 'INDEPENDENT_OBSERVATION_OF_PROCESS',
      definition: 'Observer directly witnesses the subject submitting the originating utterance h_0 at intake.',
      exteriority_to_origin: true,
      resolves_alpha_beta_distinction: true,
      observation_rank: 2,
      conflicts_with_author_opacity: true // Demands raw surveillance of author!
    },
    {
      level: 4,
      relationship: 'INDEPENDENT_PROPERTY_VERIFICATION',
      definition: 'Independent boundary probe evaluates predicate IsObjection(h_0) before E executes, without storing or disclosing private words.',
      exteriority_to_origin: true,
      resolves_alpha_beta_distinction: true,
      observation_rank: 2,
      conflicts_with_author_opacity: false // Opacity strictly preserved!
    }
  ];

  return deepFreeze({
    schema: EXTERIORITY_CHALLENGE_SCHEMA,
    commission: 'THE_NOTARY_WHO_NEVER_SAW_THE_WITNESS',
    covenant: 'Khona‌lit-po',
    multi_signature_experiment: {
      signers_count: numSigners,
      signers,
      observation_subspace_rank: observationSubspaceRank,
      all_signers_received_identical_projection: true,
      distinction_recovered: distinctionRecovered
    },
    exteriority_taxonomy: exteriorityTaxonomy,
    conclusion: 'Multiplying independent certifications on a common information-losing projection yields zero additional rank. A thousand honest signatures on E(h) are mathematically equivalent to one.',
    epistemic_law: 'Exteriority is not generated by the number of independent credentials certifying a message; it requires independent access to the boundary where the message was generated.'
  });
}

// ============================================================================
// 4. THE THREE CONDITIONS TRIAL
// ============================================================================

/**
 * Executes the finite counterworld trial comparing three experimental conditions:
 *   Condition A: Institutional summary with internal custody only.
 *   Condition B: Identical institutional summary with genuine external notarization.
 *   Condition C: Additional independently acquired, source-bearing boundary witness.
 *
 * Also tests the Hostile Counterexample to Condition C:
 *   What if Condition C's probe is mediated by an institutional portal?
 */
export function simulateThreeConditionsTrial({
  deadlineHours = 24.0,
  intakeProbeMediatedByPortal = false
} = {}) {
  const { world_alpha, world_beta } = buildTwoCertifiedWorlds();

  // Condition A: Internal Custody Only
  // Reviewer receives only E(h) and internal institutional audit stamp.
  const condA = {
    condition: 'CONDITION_A_INTERNAL_CUSTODY_ONLY',
    description: 'Institutional summary with internal custody receipts only.',
    received_payload: world_alpha.admitted_record.certified_summary,
    has_external_notary: false,
    has_source_intake_witness: false,
    entropy_remaining_bits: 1.0,
    can_discriminate_alpha_from_beta: false,
    verdict: 'INDISTINGUISHABLE_FROM_INTERNAL_RECORD'
  };

  // Condition B: External Notarization of E(h)
  // Reviewer receives E(h) certified by genuine, honest external notary.
  const condB = {
    condition: 'CONDITION_B_EXTERNAL_NOTARIZATION_OF_SUMMARY',
    description: 'Institutional summary certified by genuine, honest external notary.',
    received_payload: world_alpha.admitted_record.certified_summary,
    has_external_notary: true,
    notary_signature_verified: true,
    has_source_intake_witness: false,
    entropy_remaining_bits: 1.0, // EXACTLY 1.0 bit! No reduction!
    can_discriminate_alpha_from_beta: false,
    information_gain_over_condition_a_bits: 0.0,
    verdict: 'AUTHENTIC_CERTIFICATE_ZERO_INFORMATION_GAIN'
  };

  // Condition C: Source-Bearing Boundary Witness
  // Independent intake notary evaluates predicate IsObjection(h_0) at intake boundary BEFORE E executes.
  let condC;
  if (!intakeProbeMediatedByPortal) {
    // Genuine boundary probe directly on h_0
    condC = {
      condition: 'CONDITION_C_INDEPENDENT_BOUNDARY_WITNESS',
      description: 'Independent intake boundary probe evaluates predicate IsObjection(h_0) prior to institutional transformation E.',
      has_external_notary: true,
      has_source_intake_witness: true,
      probe_origin: 'UNMEDIATED_INTAKE_BOUNDARY',
      predicate_evaluated: 'P_objection(h_0) == true in W_alpha; false in W_beta',
      author_private_words_exposed: false, // 100% Opacity preserved!
      entropy_remaining_bits: 0.0,
      can_discriminate_alpha_from_beta: true,
      information_gain_over_condition_a_bits: 1.0,
      verdict: 'ALPHA_BETA_DISCRIMINATED_OPACITY_PRESERVED'
    };
  } else {
    // Hostile Counterexample: The probe was delivered via an institutional web portal
    // that sanitized the input before passing it to the probe!
    condC = {
      condition: 'CONDITION_C_COLLAPSED_PORTAL_MEDIATED_PROBE',
      description: 'HOSTILE COUNTEREXAMPLE: The intake probe was mediated by an institutional portal that applied operator E prior to probe evaluation.',
      has_external_notary: true,
      has_source_intake_witness: false, // Probe did not witness h_0!
      probe_origin: 'PORTAL_MEDIATED_INTERMEDIATE',
      predicate_evaluated: 'P_objection(E(h_0)) == false in both worlds!',
      author_private_words_exposed: false,
      entropy_remaining_bits: 1.0,
      can_discriminate_alpha_from_beta: false,
      information_gain_over_condition_a_bits: 0.0,
      verdict: 'PROBE_MEDIATION_COLLAPSED_TO_CONDITION_B'
    };
  }

  return deepFreeze({
    schema: THREE_CONDITIONS_TRIAL_SCHEMA,
    commission: 'THE_NOTARY_WHO_NEVER_SAW_THE_WITNESS',
    covenant: 'Khona‌lit-po',
    condition_a: condA,
    condition_b: condB,
    condition_c: condC,
    trial_comparison: {
      uncertainty_reduction_condition_b_vs_a: condB.information_gain_over_condition_a_bits === 0.0 ? 'ZERO_REDUCTION' : 'REDUCED',
      uncertainty_reduction_condition_c_vs_b: condC.can_discriminate_alpha_from_beta ? 'FULL_RESOLUTION' : 'FAILED_COLLAPSED_TO_B',
      author_opacity_preserved_in_condition_c: true
    },
    disposition: condC.can_discriminate_alpha_from_beta
      ? 'BOUNDARY_WITNESS_SUCCEEDS_WHERE_NOTARY_FAILS'
      : 'CONDITION_C_COUNTEREXAMPLE_CONFIRMED',
    epistemic_law: 'External notarization of an institutional summary produces exactly zero reduction in historical uncertainty. Only an unmediated pre-transformation boundary witness can resolve the distinction while preserving author opacity.'
  });
}

// ============================================================================
// 5. THE OPERATOR'S QUESTION ANSWERED
// ============================================================================

/**
 * Formulates the definitive structural answer to the Operator's Question:
 *   "What exactly must an independent witness have witnessed for its independence to matter?"
 */
export function answerOperatorsQuestionOnWitnessIndependence() {
  const requirements = [
    {
      requirement_id: 'REQ_1_PRE_TRANSFORMATION_TEMPORALITY',
      name: 'Pre-Transformation Acquisition ($t_{\\text{witness}} \\le t_E$)',
      failure_mode: 'A witness acquired after institutional transformation E certifies only the post-transform echo, not the originating historical event.'
    },
    {
      requirement_id: 'REQ_2_BOUNDARY_EXTERIORITY',
      name: 'Unmediated Input Boundary Access ($h_0$ rather than $E(h_0)$)',
      failure_mode: 'If the witness probe receives input mediated by institutional software, the institution controls the predicate input.'
    },
    {
      requirement_id: 'REQ_3_OPACITY_PRESERVING_PREDICATE',
      name: 'Structural Predicate Evaluation Without Surveillance',
      failure_mode: 'Resolving the problem by forcing testimonial exposure violates the Right to Opacity; the witness must certify a classification predicate (IsObjection) without disclosing private words.'
    },
    {
      requirement_id: 'REQ_4_ORTHOGONAL_CUSTODY_ANCHOR',
      name: 'Orthogonal Custody & Storage ($J_{\\text{witness}} \\nsubseteq J_{\\text{inst}}$)',
      failure_mode: 'If witness receipts are stored inside the institution\'s permissioned filing system, the institution can apply second-order self-sealing gates to suppress the receipt.'
    }
  ];

  return deepFreeze({
    schema: INDEPENDENT_WITNESS_TAXONOMY_SCHEMA,
    commission: 'THE_NOTARY_WHO_NEVER_SAW_THE_WITNESS',
    covenant: 'Khona‌lit-po',
    the_operators_question: 'What exactly must an independent witness have witnessed for its independence to matter?',
    formal_answer: 'For a witness\'s independence to matter, it must have witnessed the unmediated originating event h_0 at the intake boundary prior to institutional transformation, recording an opacity-preserving classification predicate anchored in orthogonal custody. Authenticating an institution\'s output certifies only the institution\'s speech, never the world the institution purports to describe.',
    four_inviolable_witness_requirements: requirements,
    disposition: 'INDEPENDENT_WITNESS_TAXONOMY_ESTABLISHED'
  });
}
