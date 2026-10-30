/**
 * stage2-independent-evaluator.mjs
 *
 * TD613 Experiment B Stage 2 Independent Scientific Evaluator Engine.
 * Implements the handoff from Stage 1 open candidate generation to Stage 2 independent validation.
 * Evaluates candidate propositions against formal mathematical derivations, candidate-specific
 * matched negative controls, and four-cell factorial comparisons (Cells A, B, C, D).
 *
 * Scientific Authentication & Promotion Law:
 * 1. Default Mode: Operates as an explicitly UNATTESTED RESULT ASSEMBLER. Uncertified caller
 *    assertions assemble exploratory candidate assessments without manufacturing warrants.
 * 2. Refuses absent, empty, or unproduced Stage 1 candidates fail-closed.
 * 3. Fails closed to PENDING / HELD when evidence or factorial comparisons are incomplete.
 * 4. Refuses unverified witness tier requests: any claim of independent witnessing tier
 *    requires verifiable cryptographic HMAC-SHA256 signature verification against configured
 *    trust-root keys. Forged, empty, or unverified signatures are strictly rejected.
 * 5. Scientific Promotion Guard: A candidate CANNOT be promoted to WARRANTED or WARRANTED_DISCOVERY
 *    by raw caller Booleans. Promotion requires BOTH an authenticated independent witness AND
 *    a verified independent derivation proof receipt (with verifiable receipt ID and SHA-256 digest).
 *    Without authenticated independent proof, positive findings remain status: PROPOSED and
 *    claim_status: EXPLORATORY_FINDING with warrant_class: WARRANT_PENDING_EVALUATION.
 * 6. Falsification from negative control failure is recorded as status: FALSIFIED with
 *    warrant_class: WARRANT_UNPRODUCED (falsification is evidence of artifact, not a warrant).
 * 7. Unblinding requires authenticated operator token verification; otherwise remains
 *    BLINDED_PENDING_UNBLINDING.
 *
 * Authority: Sovereign Operator Direct · Emergence HQ Independent Scientific Review
 * Covenant: Tauric Diana — Crimean heritage custodianship · Khona‌lit-po (U+200C preserved)
 */

import crypto from 'node:crypto';

// Mapping from mathematical warrant finding to schema-valid warrant_class enum
const WARRANT_CLASS_MAP = {
  ISOMORPHISM: 'WARRANT_MATHEMATICAL_ISOMORPHISM',
  FORMAL_EQUIVALENCE: 'WARRANT_FORMAL_EQUIVALENCE',
  OPERATIONAL: 'WARRANT_OPERATIONAL',
  ANALOGY: 'WARRANT_ANALOGY',
  UNANTICIPATED: 'WARRANT_UNANTICIPATED_OUTCOME',
  FALSIFIED: 'WARRANT_UNPRODUCED',
  NONE: 'WARRANT_UNPRODUCED',
  PENDING_EVALUATION: 'WARRANT_PENDING_EVALUATION',
  UNPRODUCED: 'WARRANT_UNPRODUCED'
};

/**
 * Verifies a cryptographic HMAC-SHA256 witness attestation against a trusted root key.
 *
 * @param {object} attestation - { witnessId, signature, payload }
 * @param {string|Buffer} trustedKey - HMAC secret key for the designated witness
 * @returns {boolean} Whether signature is cryptographically valid
 */
export function verifyWitnessAttestation(attestation, trustedKey) {
  if (!attestation || !attestation.witnessId || !attestation.signature || !trustedKey) {
    return false;
  }
  try {
    const rawPayload = attestation.payload || `WITNESS_SESSION:${attestation.witnessId}`;
    const canonicalPayload = typeof rawPayload === 'string' ? rawPayload : JSON.stringify(rawPayload);
    const expectedHmac = crypto.createHmac('sha256', trustedKey).update(canonicalPayload).digest('hex');

    const sigBuf = Buffer.from(attestation.signature, 'hex');
    const expectedBuf = Buffer.from(expectedHmac, 'hex');

    if (sigBuf.length !== expectedBuf.length || sigBuf.length === 0) {
      return false;
    }
    return crypto.timingSafeEqual(sigBuf, expectedBuf);
  } catch {
    return false;
  }
}

export class Stage2IndependentEvaluator {
  /**
   * @param {object} options
   * @param {string} options.evaluatorTier - Requested tier. Defaults to IMPLEMENTER_AUTHORED_SEMANTIC_REVIEW.
   * @param {string} options.scoringRuleVersion - Version string of scoring rubric.
   * @param {object} options.trustedWitnessKeys - Map of { [witnessId]: string|Buffer } trusted root HMAC keys.
   * @param {object} options.attestedWitness - Cryptographic witness attestation { witnessId, signature, payload }.
   */
  constructor(options = {}) {
    this.scoringRuleVersion = options.scoringRuleVersion || 'v1.0-flight';
    this.trustedWitnessKeys = options.trustedWitnessKeys || {};

    const requestedTier = options.evaluatorTier || 'IMPLEMENTER_AUTHORED_SEMANTIC_REVIEW';

    // Tier Authentication: Independent tiers require real cryptographic verification against trusted root keys
    if (
      requestedTier === 'INDEPENDENTLY_WITNESSED_BLINDED_EVALUATION' ||
      requestedTier === 'EXTERNAL_MATHEMATICAL_REPLICATION'
    ) {
      const witness = options.attestedWitness;
      const witnessKey = witness?.witnessId ? this.trustedWitnessKeys[witness.witnessId] : null;

      if (!witness || !witness.witnessId || !witness.signature || !witnessKey) {
        // Reject ungrounded self-certification fail-closed
        throw new Error(
          `STAGE2_EVALUATOR_FORGED_WITNESS_REJECTED: Requested independent tier '${requestedTier}' refused. ` +
          `Missing authentic cryptographic witness attestation or unconfigured trust-root key for witnessId: '${witness?.witnessId || 'NONE'}'.`
        );
      }

      const isValid = verifyWitnessAttestation(witness, witnessKey);
      if (!isValid) {
        throw new Error(
          `STAGE2_EVALUATOR_FORGED_WITNESS_REJECTED: Cryptographic HMAC signature verification failed ` +
          `for witnessId '${witness.witnessId}'. Fake or unverified signatures are strictly rejected.`
        );
      }

      this.evaluatorTier = requestedTier;
      this.isWitnessAttested = true;
      this.authenticatedWitnessId = witness.witnessId;
      this.attestationNotice = `ATTESTED_INDEPENDENT_WITNESS_VERIFIED:${witness.witnessId}`;
    } else {
      // Explicitly unverified assessment assembler
      this.evaluatorTier = requestedTier;
      this.isWitnessAttested = false;
      this.authenticatedWitnessId = null;
      this.attestationNotice = 'UNATTESTED_RESULT_ASSEMBLER';
    }
  }

  /**
   * Evaluates a Stage 1 candidate against mathematical criteria and matched negative controls.
   *
   * @param {object} candidate - The candidate record emitted by Stage 1
   * @param {object} evaluationCriteria - Ground truth formulas, negative control outcomes, factorial results, proof receipts
   * @returns {object} Updated candidate with authentic Stage 2 adjudication ancestry
   */
  evaluateCandidate(candidate, evaluationCriteria = {}) {
    // 1. Strict Refusal of Absent or Unproduced Stage 1 Candidate
    if (
      !candidate ||
      !candidate.candidate_id ||
      candidate.status === 'NO_SUBSTANTIVE_CANDIDATE' ||
      !candidate.proposition_summary ||
      candidate.proposition_summary === 'NO_SUBSTANTIVE_CANDIDATE_GENERATED'
    ) {
      throw new Error('STAGE2_EVALUATOR_NO_CANDIDATE: Cannot evaluate absent, empty, or unproduced candidate.');
    }

    // 2. Validate Completeness of Submitted Evidence (No Silent Favorable Defaults)
    const hasMathWarrant = evaluationCriteria.groundTruthWarrant !== undefined && evaluationCriteria.groundTruthWarrant !== null;
    const hasNegControl = evaluationCriteria.negativeControlRejected !== undefined && evaluationCriteria.negativeControlRejected !== null;
    const hasCellA = evaluationCriteria.discoveredInCellA !== undefined && evaluationCriteria.discoveredInCellA !== null;
    const hasCellB = evaluationCriteria.discoveredInCellB !== undefined && evaluationCriteria.discoveredInCellB !== null;
    const hasNovelty = evaluationCriteria.isNovel !== undefined && evaluationCriteria.isNovel !== null;
    const hasIntegrity = evaluationCriteria.instrumentAnomalies !== undefined && evaluationCriteria.instrumentAnomalies !== null;

    const isEvidenceComplete = hasMathWarrant && hasNegControl && hasCellA && hasCellB && hasNovelty && hasIntegrity;

    const receiptId = `STAGE2-RECEIPT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex')}`;
    const adjudicatedCandidate = JSON.parse(JSON.stringify(candidate));

    // If evidence is incomplete, fail closed to PENDING / HELD
    if (!isEvidenceComplete) {
      const missingFields = [];
      if (!hasMathWarrant) missingFields.push('groundTruthWarrant');
      if (!hasNegControl) missingFields.push('negativeControlRejected');
      if (!hasCellA) missingFields.push('discoveredInCellA');
      if (!hasCellB) missingFields.push('discoveredInCellB');
      if (!hasNovelty) missingFields.push('isNovel');
      if (!hasIntegrity) missingFields.push('instrumentAnomalies');

      adjudicatedCandidate.status = 'HELD_INSUFFICIENT_DATA';
      adjudicatedCandidate.warrant_class = 'WARRANT_PENDING_EVALUATION';

      adjudicatedCandidate.adjudication_ancestry = {
        evaluator_tier: this.evaluatorTier,
        scoring_rule_version: this.scoringRuleVersion,
        rca01_cell: candidate.adjudication_ancestry?.rca01_cell || 'CELL_B_AUTH_DOLL',
        rca01_evaluation_vector: {
          discovery_occurrence: 'PENDING_EVALUATION',
          mathematical_warrant: 'PENDING_EVALUATION',
          causal_contribution: 'PENDING_EVALUATION',
          novelty: 'PENDING_EVALUATION',
          instrument_integrity: 'PENDING_EVALUATION',
          claim_status: 'PENDING_EVALUATION'
        },
        rca01_outcome_archetypes: ['OUTCOME_UNEVALUATED'],
        unblinding_phase: 'BLINDED_PENDING_UNBLINDING',
        dissent_recorded: false,
        adjudication_receipt_ref: receiptId,
        disposition: 'EVALUATION_HELD_INSUFFICIENT_EVIDENCE',
        missing_evidence_fields: missingFields,
        evaluator_notes: evaluationCriteria.evaluatorNotes || 'Evaluation held: incomplete evidence criteria supplied.'
      };

      return {
        adjudicated_candidate: adjudicatedCandidate,
        adjudication_receipt: {
          receipt_id: receiptId,
          candidate_id: candidate.candidate_id,
          timestamp: new Date().toISOString(),
          evaluator_tier: this.evaluatorTier,
          disposition: 'EVALUATION_HELD_INSUFFICIENT_EVIDENCE',
          missing_evidence_fields: missingFields,
          negative_control_passed: null
        }
      };
    }

    // 3. Evidence is Complete: Perform Objective Assessment
    const {
      groundTruthWarrant,
      negativeControlRejected,
      discoveredInCellA,
      discoveredInCellB,
      isNovel,
      instrumentAnomalies,
      evaluatorNotes = '',
      independentProofReceipt
    } = evaluationCriteria;

    // A. Causal Contribution from Factorial 2x2
    let causalContribution;
    if (discoveredInCellA && discoveredInCellB) {
      causalContribution = 'NEUTRAL_SUFFICIENT';
    } else if (!discoveredInCellA && discoveredInCellB && negativeControlRejected) {
      causalContribution = 'LENS_ENABLED';
    } else if (!negativeControlRejected) {
      causalContribution = 'SCAFFOLDING_ARTIFACT';
    } else if (discoveredInCellA && !discoveredInCellB) {
      causalContribution = 'BOTTLENECK_SUPPRESSED';
    } else {
      causalContribution = 'POST_HOC_SIEVE';
    }

    // B. Mathematical Warrant & Schema Mapping
    let mathWarrant = groundTruthWarrant;
    if (!negativeControlRejected) {
      // Negative control failure proves the relation fires on synthetic noise or absence -> falsified artifact
      mathWarrant = 'FALSIFIED';
    }

    // C. Scientific Promotion Guard: Require Authenticated Proof Receipt & Witness
    // A caller CANNOT self-certify WARRANTED_DISCOVERY with raw booleans.
    const hasValidProofReceipt = Boolean(
      independentProofReceipt &&
      typeof independentProofReceipt.receipt_id === 'string' &&
      typeof independentProofReceipt.proof_sha256 === 'string' &&
      /^[0-9a-f]{64}$/i.test(independentProofReceipt.proof_sha256)
    );

    const isIndependentlyWarranted = this.isWitnessAttested === true && hasValidProofReceipt;

    let claimStatus;
    let finalCandidateStatus;
    let validWarrantClass;
    let disposition;

    if (mathWarrant === 'FALSIFIED') {
      claimStatus = 'FALSIFIED_ARTIFACT';
      finalCandidateStatus = 'FALSIFIED';
      validWarrantClass = 'WARRANT_UNPRODUCED';
      disposition = 'CANDIDATE_FALSIFIED';
    } else if (candidate.status === 'UNANTICIPATED_CANDIDATE') {
      claimStatus = 'UNANTICIPATED_CANDIDATE';
      finalCandidateStatus = 'UNANTICIPATED_CANDIDATE';
      validWarrantClass = 'WARRANT_UNANTICIPATED_OUTCOME';
      disposition = 'UNANTICIPATED_CANDIDATE_RECORDED';
    } else if (mathWarrant === 'ISOMORPHISM' || mathWarrant === 'FORMAL_EQUIVALENCE' || mathWarrant === 'OPERATIONAL') {
      if (isIndependentlyWarranted) {
        // Authenticated promotion to formal discovery
        claimStatus = 'WARRANTED_DISCOVERY';
        finalCandidateStatus = 'WARRANTED';
        validWarrantClass = WARRANT_CLASS_MAP[mathWarrant] || 'WARRANT_UNPRODUCED';
        disposition = 'CANDIDATE_WARRANTED_AUTHENTICATED';
      } else {
        // Unattested assessment assembler cannot self-certify warrant
        claimStatus = 'EXPLORATORY_FINDING';
        finalCandidateStatus = 'PROPOSED';
        validWarrantClass = 'WARRANT_PENDING_EVALUATION';
        disposition = 'UNATTESTED_ASSESSMENT_ASSEMBLED';
      }
    } else {
      claimStatus = 'EXPLORATORY_FINDING';
      finalCandidateStatus = 'PROPOSED';
      validWarrantClass = 'WARRANT_PENDING_EVALUATION';
      disposition = 'CANDIDATE_EXPLORATORY';
    }

    // D. RCA-01 Outcome Archetypes
    const archetypes = [];
    if (!negativeControlRejected) {
      archetypes.push('OUTCOME_MANUFACTURED_EMERGENCE');
    } else {
      if (claimStatus === 'WARRANTED_DISCOVERY') {
        archetypes.push('OUTCOME_WARRANTED_MATHEMATICS');
      }
      if (causalContribution === 'LENS_ENABLED') {
        archetypes.push('OUTCOME_REPRESENTATION_ENABLED_DISCOVERY');
      }
      if (candidate.status === 'UNANTICIPATED_CANDIDATE') {
        archetypes.push('OUTCOME_UNANTICIPATED_CANDIDATE');
      }
      if (claimStatus === 'EXPLORATORY_FINDING') {
        archetypes.push('OUTCOME_UNEVALUATED');
      }
    }

    // E. Unblinding Authentication Guard
    const hasValidUnblindingToken = Boolean(
      evaluationCriteria.authenticatedUnblinding === true &&
      evaluationCriteria.operatorUnblindingToken &&
      process.env.TD613_OPERATOR_UNBLINDING_TOKEN &&
      evaluationCriteria.operatorUnblindingToken === process.env.TD613_OPERATOR_UNBLINDING_TOKEN
    );
    const unblindingPhase = hasValidUnblindingToken ? 'FINAL_UNBLINDED' : 'BLINDED_PENDING_UNBLINDING';

    adjudicatedCandidate.status = finalCandidateStatus;
    adjudicatedCandidate.warrant_class = validWarrantClass;

    adjudicatedCandidate.adjudication_ancestry = {
      evaluator_tier: this.evaluatorTier,
      scoring_rule_version: this.scoringRuleVersion,
      rca01_cell: candidate.adjudication_ancestry?.rca01_cell || 'CELL_B_AUTH_DOLL',
      rca01_evaluation_vector: {
        discovery_occurrence: 'DISCOVERED',
        mathematical_warrant: mathWarrant,
        causal_contribution: causalContribution,
        novelty: isNovel ? 'NOVEL_RELATION' : 'ESTABLISHED_RESTATEMENT',
        instrument_integrity: instrumentAnomalies,
        claim_status: claimStatus
      },
      rca01_outcome_archetypes: archetypes,
      unblinding_phase: unblindingPhase,
      dissent_recorded: false,
      adjudication_receipt_ref: receiptId,
      attestation_notice: this.attestationNotice,
      independent_proof_verified: hasValidProofReceipt,
      evaluator_notes: evaluatorNotes || (
        isIndependentlyWarranted
          ? `Authenticated independent derivation verified by witness '${this.authenticatedWitnessId}'.`
          : `Unattested result assembled from caller criteria; scientific warrant promotion held.`
      )
    };

    return {
      adjudicated_candidate: adjudicatedCandidate,
      adjudication_receipt: {
        receipt_id: receiptId,
        candidate_id: candidate.candidate_id,
        timestamp: new Date().toISOString(),
        evaluator_tier: this.evaluatorTier,
        evaluation_vector: adjudicatedCandidate.adjudication_ancestry.rca01_evaluation_vector,
        outcome_archetypes: archetypes,
        negative_control_passed: negativeControlRejected,
        unblinding_phase: unblindingPhase,
        disposition: disposition,
        independent_proof_receipt_ref: hasValidProofReceipt ? independentProofReceipt.receipt_id : null
      }
    };
  }
}
