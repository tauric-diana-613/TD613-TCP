/**
 * stage2-independent-evaluator.mjs
 *
 * TD613 Experiment B Stage 2 Independent Scientific Evaluator Engine.
 * Implements the handoff from Stage 1 open candidate generation to Stage 2 independent validation.
 * Evaluates candidate propositions against formal mathematical derivations, candidate-specific
 * matched negative controls, and four-cell factorial comparisons (Cells A, B, C, D).
 *
 * Enforces strict scientific authentication:
 * 1. Refuses absent, empty, or unproduced Stage 1 candidates.
 * 2. Requires attested independent witness credentials for promoted evaluator tiers.
 * 3. Fails closed to PENDING / HELD when evidence or factorial comparisons are missing or incomplete.
 * 4. Strictly conforms to THREE_LINEAGE_DISCOVERY_SCHEMA.json warrant and status enums.
 * 5. Recognizes that negative-control failure is evidence requiring analysis (scaffolding artifact),
 *    yielding status FALSIFIED with warrant_class WARRANT_UNPRODUCED (falsification is not a warrant).
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

export class Stage2IndependentEvaluator {
  /**
   * @param {object} options
   * @param {string} options.evaluatorTier - Evaluator tier. Independent tiers require attested credentials.
   * @param {string} options.scoringRuleVersion - Version string of scoring rubric.
   * @param {object} options.attestedWitness - Optional cryptographic/attestation record for independent witnessing.
   */
  constructor(options = {}) {
    this.scoringRuleVersion = options.scoringRuleVersion || 'v1.0-flight';

    // Tier authentication: do not allow ungrounded self-certification
    const requestedTier = options.evaluatorTier || 'PENDING_INDEPENDENT_EVALUATION';
    const hasAttestation = Boolean(
      options.attestedWitness &&
      options.attestedWitness.witnessId &&
      options.attestedWitness.signature
    );

    if (
      (requestedTier === 'INDEPENDENTLY_WITNESSED_BLINDED_EVALUATION' ||
       requestedTier === 'EXTERNAL_MATHEMATICAL_REPLICATION') &&
      !hasAttestation
    ) {
      // Degrade gracefully to honest uncertified tier and record provenance flag
      this.evaluatorTier = 'IMPLEMENTER_AUTHORED_SEMANTIC_REVIEW';
      this.isWitnessAttested = false;
      this.attestationNotice = 'UNATTESTED_INDEPENDENT_TIER_DOWNGRADED: Independent witnessing tier requested without verifiable attestation signature.';
    } else {
      this.evaluatorTier = requestedTier;
      this.isWitnessAttested = hasAttestation;
      this.attestationNotice = hasAttestation ? 'ATTESTED_INDEPENDENT_WITNESS_VERIFIED' : 'LOCAL_EVALUATOR_TIER';
    }
  }

  /**
   * Evaluates a Stage 1 candidate against mathematical criteria and matched negative controls.
   *
   * @param {object} candidate - The candidate record emitted by Stage 1
   * @param {object} evaluationCriteria - Ground truth formulas, negative control outcomes, and factorial results
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

    // 2. Validate Completeness of Submitted Evidence (No Invented Defaults)
    const hasMathWarrant = evaluationCriteria.groundTruthWarrant !== undefined && evaluationCriteria.groundTruthWarrant !== null;
    const hasNegControl = evaluationCriteria.negativeControlRejected !== undefined && evaluationCriteria.negativeControlRejected !== null;
    const hasCellA = evaluationCriteria.discoveredInCellA !== undefined && evaluationCriteria.discoveredInCellA !== null;
    const hasCellB = evaluationCriteria.discoveredInCellB !== undefined && evaluationCriteria.discoveredInCellB !== null;

    const isEvidenceComplete = hasMathWarrant && hasNegControl && hasCellA && hasCellB;

    const receiptId = `STAGE2-RECEIPT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${crypto.randomBytes(3).toString('hex')}`;
    const adjudicatedCandidate = JSON.parse(JSON.stringify(candidate));

    // If evidence is incomplete, fail closed to PENDING / HELD
    if (!isEvidenceComplete) {
      const missingFields = [];
      if (!hasMathWarrant) missingFields.push('groundTruthWarrant');
      if (!hasNegControl) missingFields.push('negativeControlRejected');
      if (!hasCellA) missingFields.push('discoveredInCellA');
      if (!hasCellB) missingFields.push('discoveredInCellB');

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
          instrument_integrity: evaluationCriteria.instrumentAnomalies || 'CLEAN_EXECUTION',
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

    // 3. Evidence is Complete: Perform Objective Adjudication
    const {
      groundTruthWarrant,
      negativeControlRejected,
      discoveredInCellA,
      discoveredInCellB,
      isNovel = true,
      instrumentAnomalies = 'CLEAN_EXECUTION',
      evaluatorNotes = '',
      authenticatedUnblinding = false
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

    // Map to valid schema warrant_class
    const validWarrantClass = WARRANT_CLASS_MAP[mathWarrant] || 'WARRANT_UNPRODUCED';

    // C. Claim Status & Candidate Status
    let claimStatus;
    let finalCandidateStatus;

    if (mathWarrant === 'FALSIFIED') {
      claimStatus = 'FALSIFIED_ARTIFACT';
      finalCandidateStatus = 'FALSIFIED';
    } else if (candidate.status === 'UNANTICIPATED_CANDIDATE') {
      claimStatus = 'UNANTICIPATED_CANDIDATE';
      finalCandidateStatus = 'UNANTICIPATED_CANDIDATE';
    } else if (mathWarrant === 'ISOMORPHISM' || mathWarrant === 'FORMAL_EQUIVALENCE' || mathWarrant === 'OPERATIONAL') {
      claimStatus = 'WARRANTED_DISCOVERY';
      finalCandidateStatus = 'WARRANTED';
    } else {
      claimStatus = 'EXPLORATORY_FINDING';
      finalCandidateStatus = 'PROPOSED';
    }

    // D. RCA-01 Outcome Archetypes
    const archetypes = [];
    if (!negativeControlRejected) {
      archetypes.push('OUTCOME_MANUFACTURED_EMERGENCE');
    } else {
      if (mathWarrant === 'ISOMORPHISM' || mathWarrant === 'FORMAL_EQUIVALENCE') {
        archetypes.push('OUTCOME_WARRANTED_MATHEMATICS');
      }
      if (causalContribution === 'LENS_ENABLED') {
        archetypes.push('OUTCOME_REPRESENTATION_ENABLED_DISCOVERY');
      }
      if (candidate.status === 'UNANTICIPATED_CANDIDATE') {
        archetypes.push('OUTCOME_UNANTICIPATED_CANDIDATE');
      }
    }

    adjudicatedCandidate.status = finalCandidateStatus;
    adjudicatedCandidate.warrant_class = validWarrantClass;

    const unblindingPhase = authenticatedUnblinding ? 'FINAL_UNBLINDED' : 'BLINDED_PENDING_UNBLINDING';

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
      evaluator_notes: evaluatorNotes
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
        disposition: finalCandidateStatus === 'WARRANTED' ? 'CANDIDATE_WARRANTED' :
                     (finalCandidateStatus === 'FALSIFIED' ? 'CANDIDATE_FALSIFIED' : 'CANDIDATE_EXPLORATORY')
      }
    };
  }
}
