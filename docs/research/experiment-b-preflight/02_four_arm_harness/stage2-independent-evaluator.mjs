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
 *    a verified independent derivation proof receipt with cryptographically bound proof digest.
 * 6. Proof Binding Digest: Deterministic domain-separated canonical encoding of candidate proposition,
 *    candidate ID, exact evidence spans, derivation proof bytes, negative control outcome, protocol ID,
 *    reviewer identity, and active episode ID. Candidate substitution, altered mathematical premises,
 *    swapped negative controls, or replayed receipts across episodes strictly fail closed.
 * 7. Authentic Authority Separation: Preserves the distinction between:
 *    a) Cryptographic integrity of a proof document;
 *    b) Authenticity and independence of the reviewer;
 *    c) Mathematical correctness of the derivation itself.
 *    Implementer-authored receipts cannot confer independent scientific authority.
 * 8. RCA-01 Scaffolding Investigation: A candidate appearing under negative controls triggers an
 *    independently examinable scaffolding-artifact investigation. Falsification is preserved when
 *    mathematics is disproven, but a valid formal proof may survive even when representation-induced
 *    discovery fails.
 * 9. Unblinding requires authenticated operator token verification; otherwise remains
 *    BLINDED_PENDING_UNBLINDING.
 *
 * Authority: Sovereign Operator Direct · Emergence HQ Independent Scientific Review
 * Covenant: Tauric Diana — Crimean heritage custodianship · Khona‌lit-po (U+200C preserved)
 */

import crypto from 'node:crypto';

// Mapping from mathematical warrant finding to schema-valid warrant_class enum
export const WARRANT_CLASS_MAP = {
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

function canonicalJsonStringify(obj) {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJsonStringify).join(',') + ']';
  }
  const keys = Object.keys(obj).sort();
  return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalJsonStringify(obj[k])).join(',') + '}';
}

/**
 * Computes a deterministic domain-separated proof-binding digest for a candidate proposition.
 *
 * @param {object} params
 * @param {string} params.candidateId
 * @param {string} params.propositionSummary
 * @param {Array<object>} params.evidenceSpans - [{ file|documentId, startByte, endByte, spanSha256 }]
 * @param {string|Buffer} params.derivationProofBytes
 * @param {object} params.negativeControlOutcome - { controlId, rejected, details }
 * @param {string} [params.protocolIdentity]
 * @param {string} params.reviewerIdentity
 * @param {string} params.episodeId
 * @returns {object} { bindingDigest, canonicalPayload, proofSha256 }
 */
export function computeProofBindingDigest(params = {}) {
  const {
    candidateId,
    propositionSummary,
    evidenceSpans = [],
    derivationProofBytes,
    negativeControlOutcome,
    protocolIdentity = 'TD613-EXP-B-PREREGISTERED-PROTOCOL-20261029',
    reviewerIdentity,
    episodeId
  } = params;

  const sortedSpans = [...evidenceSpans].sort((a, b) => {
    const fileA = a.file || a.documentId || '';
    const fileB = b.file || b.documentId || '';
    if (fileA !== fileB) return fileA.localeCompare(fileB);
    return (a.start_byte ?? a.startByte ?? 0) - (b.start_byte ?? b.startByte ?? 0);
  }).map(s => ({
    file: s.file || s.documentId || '',
    start_byte: s.start_byte ?? s.startByte ?? 0,
    end_byte: s.end_byte ?? s.endByte ?? 0,
    span_sha256: s.span_sha256 || s.spanSha256 || crypto.createHash('sha256').update(s.spanText || s.text || '').digest('hex')
  }));

  const proofBuf = Buffer.isBuffer(derivationProofBytes)
    ? derivationProofBytes
    : Buffer.from(String(derivationProofBytes || ''), 'utf8');
  const proofSha256 = crypto.createHash('sha256').update(proofBuf).digest('hex');

  const canonicalPayload = {
    domain_separator: 'TD613_PROOF_BINDING_v1',
    candidate_id: String(candidateId || '').trim(),
    proposition_summary: String(propositionSummary || '').trim(),
    evidence_spans: sortedSpans,
    proof_sha256: proofSha256,
    negative_control_outcome: {
      control_id: negativeControlOutcome?.controlId || negativeControlOutcome?.control_id || 'NONE',
      rejected: Boolean(negativeControlOutcome?.rejected),
      details: String(negativeControlOutcome?.details || '')
    },
    protocol_identity: String(protocolIdentity || '').trim(),
    reviewer_identity: String(reviewerIdentity || '').trim(),
    episode_id: String(episodeId || '').trim()
  };

  const canonicalString = canonicalJsonStringify(canonicalPayload);
  const bindingDigest = crypto.createHash('sha256').update(Buffer.from(canonicalString, 'utf8')).digest('hex');

  return {
    bindingDigest,
    canonicalPayload,
    proofSha256
  };
}

/**
 * Creates an authenticated independent proof receipt.
 */
export function createIndependentProofReceipt(params, secretKey) {
  const { bindingDigest, proofSha256 } = computeProofBindingDigest(params);
  const signature = secretKey
    ? crypto.createHmac('sha256', secretKey).update(`PROOF_RECEIPT:${bindingDigest}`).digest('hex')
    : null;

  return {
    receipt_id: params.receiptId || `PROOF-RECEIPT-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    proof_sha256: proofSha256,
    proof_binding_digest: bindingDigest,
    reviewer_identity: params.reviewerIdentity,
    reviewer_authority_class: params.reviewerAuthorityClass || 'INDEPENDENT_EXTERNAL_REVIEWER',
    protocol_identity: params.protocolIdentity || 'TD613-EXP-B-PREREGISTERED-PROTOCOL-20261029',
    episode_id: params.episodeId,
    derivation_proof_bytes: params.derivationProofBytes || '',
    negative_control_outcome: params.negativeControlOutcome || null,
    signature,
    timestamp: new Date().toISOString()
  };
}

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
    } else if (requestedTier === 'PROVISIONAL_LIVE_RECORDING_HELD_FOR_WITNESS') {
      // R3-01: Provisional live candidate generation phase prior to independent witness adjudication
      this.evaluatorTier = requestedTier;
      this.isWitnessAttested = false;
      this.authenticatedWitnessId = null;
      this.attestationNotice = 'PROVISIONAL_UNWITNESSED_GENERATION: Independent scientific warrant strictly withheld until authentic witness attestation.';
    } else {
      // Explicitly unverified assessment assembler
      this.evaluatorTier = requestedTier;
      this.isWitnessAttested = false;
      this.authenticatedWitnessId = null;
      this.attestationNotice = 'UNATTESTED_RESULT_ASSEMBLER';
    }
  }

  /**
   * Evaluates a Stage 1 candidate against mathematical criteria, proof receipts, and matched negative controls.
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

    // R3-01: Provisional live candidate generation phase prior to independent witness adjudication
    if (this.evaluatorTier === 'PROVISIONAL_LIVE_RECORDING_HELD_FOR_WITNESS') {
      adjudicatedCandidate.status = 'HELD_PENDING_INDEPENDENT_EVALUATOR_WITNESS';
      adjudicatedCandidate.warrant_class = 'WARRANT_PENDING_INDEPENDENT_WITNESS';
      adjudicatedCandidate.adjudication_ancestry = {
        evaluator_tier: this.evaluatorTier,
        scoring_rule_version: this.scoringRuleVersion,
        receipt_id: receiptId,
        timestamp: new Date().toISOString(),
        independent_warrant_conferred: false,
        attestation_notice: this.attestationNotice,
        human_closure_status: 'HELD_PENDING_OPERATOR_AND_EXTERNAL_REVIEW'
      };
      return {
        receipt_id: receiptId,
        adjudicated_candidate: adjudicatedCandidate,
        independent_warrant_conferred: false,
        status: 'HELD_PENDING_INDEPENDENT_EVALUATOR_WITNESS',
        reason: 'Candidate recorded under live blinded flight; independent scientific warrant strictly withheld until external witness review.'
      };
    }

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
      independentProofReceipt,
      episodeId = 'Flight-Default-Episode'
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

    // B. Mathematical Warrant & Proof Binding Verification
    let mathWarrant = groundTruthWarrant;
    const firedOnNegativeControl = !negativeControlRejected;

    let hasValidProofReceipt = false;
    let proofBindingMismatch = false;

    if (independentProofReceipt) {
      // 1. Enforce Authority Separation: Implementer receipts cannot self-certify independent authority
      const authClass = independentProofReceipt.reviewer_authority_class || 'IMPLEMENTER';
      if (authClass === 'IMPLEMENTER' || authClass === 'SELF_CERTIFIED') {
        throw new Error(
          `STAGE2_EVALUATOR_IMPLEMENTER_PROOF_REJECTED: Receipt reviewer authority class '${authClass}' ` +
          `cannot confer independent scientific warrant. External or independently witnessed authority is required.`
        );
      }

      // 2. Validate cryptographic proof binding digest against candidate premises
      const evidenceSpans = candidate.evidence_ancestry?.physical_byte_spans || evaluationCriteria.evidenceSpans || [];
      const proofBytes = independentProofReceipt.derivation_proof_bytes || '';

      const expectedBinding = computeProofBindingDigest({
        candidateId: candidate.candidate_id,
        propositionSummary: candidate.proposition_summary,
        evidenceSpans,
        derivationProofBytes: proofBytes,
        negativeControlOutcome: {
          controlId: evaluationCriteria.negativeControlId || independentProofReceipt.negative_control_outcome?.controlId || independentProofReceipt.negative_control_outcome?.control_id || 'NC-MATCHED-01',
          rejected: negativeControlRejected,
          details: evaluationCriteria.negativeControlDetails !== undefined ? evaluationCriteria.negativeControlDetails : (independentProofReceipt.negative_control_outcome?.details || '')
        },
        protocolIdentity: independentProofReceipt.protocol_identity || 'TD613-EXP-B-PREREGISTERED-PROTOCOL-20261029',
        reviewerIdentity: independentProofReceipt.reviewer_identity || this.authenticatedWitnessId,
        episodeId: evaluationCriteria.episodeId || episodeId
      });

      if (independentProofReceipt.episode_id && (evaluationCriteria.episodeId || episodeId) && independentProofReceipt.episode_id !== (evaluationCriteria.episodeId || episodeId)) {
        proofBindingMismatch = true;
        throw new Error(
          `STAGE2_EVALUATOR_PROOF_BINDING_MISMATCH: Proof receipt episode_id '${independentProofReceipt.episode_id}' does not match evaluation episode '${evaluationCriteria.episodeId || episodeId}'. Replay across episodes is prohibited.`
        );
      }

      if (independentProofReceipt.proof_binding_digest !== expectedBinding.bindingDigest) {
        proofBindingMismatch = true;
        throw new Error(
          `STAGE2_EVALUATOR_PROOF_BINDING_MISMATCH: Computed proof binding digest does not match receipt. ` +
          `Candidate proposition, evidence spans, derivation proof, negative control, or episode was altered or replayed.`
        );
      }

      if (independentProofReceipt.proof_sha256 && independentProofReceipt.proof_sha256 !== expectedBinding.proofSha256) {
        throw new Error(
          `STAGE2_EVALUATOR_PROOF_SHA_MISMATCH: Derivation proof bytes SHA-256 does not match receipt proof_sha256.`
        );
      }

      hasValidProofReceipt = true;
    }

    const isIndependentlyWarranted = this.isWitnessAttested === true && hasValidProofReceipt;

    let claimStatus;
    let finalCandidateStatus;
    let validWarrantClass;
    let disposition;
    const archetypes = [];

    // C. RCA-01 Scaffolding Investigation & Falsification Law
    if (firedOnNegativeControl) {
      // Negative control failure: representation discovery is an artifact of scaffolding
      causalContribution = 'SCAFFOLDING_ARTIFACT';
      archetypes.push('OUTCOME_MANUFACTURED_EMERGENCE');

      // Amari Redpen B-05: Preserve formal proof when established; do not equate all negative-control
      // failures with disproof of authentic mathematics.
      const hasFormalMath = (groundTruthWarrant === 'ISOMORPHISM' || groundTruthWarrant === 'FORMAL_EQUIVALENCE') && isIndependentlyWarranted;

      if (hasFormalMath) {
        // Formal mathematical derivation is verified, but discovery was a scaffolding artifact
        archetypes.push('OUTCOME_WARRANTED_MATHEMATICS');
        claimStatus = 'EXPLORATORY_FINDING';
        finalCandidateStatus = 'HELD_INSUFFICIENT_DATA'; // Held for scaffolding investigation
        validWarrantClass = WARRANT_CLASS_MAP[groundTruthWarrant] || 'WARRANT_FORMAL_EQUIVALENCE';
        disposition = 'SCAFFOLDING_ARTIFACT_INVESTIGATION_TRIGGERED';
      } else {
        // Both representation and mathematical assertion failed
        claimStatus = 'FALSIFIED_ARTIFACT';
        finalCandidateStatus = 'FALSIFIED';
        validWarrantClass = 'WARRANT_UNPRODUCED';
        disposition = 'CANDIDATE_FALSIFIED';
      }
    } else if (candidate.status === 'UNANTICIPATED_CANDIDATE') {
      claimStatus = 'UNANTICIPATED_CANDIDATE';
      finalCandidateStatus = 'UNANTICIPATED_CANDIDATE';
      validWarrantClass = 'WARRANT_UNANTICIPATED_OUTCOME';
      disposition = 'UNANTICIPATED_CANDIDATE_RECORDED';
      archetypes.push('OUTCOME_UNANTICIPATED_CANDIDATE');
    } else if (mathWarrant === 'ISOMORPHISM' || mathWarrant === 'FORMAL_EQUIVALENCE' || mathWarrant === 'OPERATIONAL') {
      if (isIndependentlyWarranted) {
        // Authenticated promotion to formal discovery
        claimStatus = 'WARRANTED_DISCOVERY';
        finalCandidateStatus = 'WARRANTED';
        validWarrantClass = WARRANT_CLASS_MAP[mathWarrant] || 'WARRANT_UNPRODUCED';
        disposition = 'CANDIDATE_WARRANTED_AUTHENTICATED';
        archetypes.push('OUTCOME_WARRANTED_MATHEMATICS');
        if (causalContribution === 'LENS_ENABLED') {
          archetypes.push('OUTCOME_REPRESENTATION_ENABLED_DISCOVERY');
        }
      } else {
        // Unattested assessment assembler cannot self-certify warrant
        claimStatus = 'EXPLORATORY_FINDING';
        finalCandidateStatus = 'PROPOSED';
        validWarrantClass = 'WARRANT_PENDING_EVALUATION';
        disposition = 'UNATTESTED_ASSESSMENT_ASSEMBLED';
        archetypes.push('OUTCOME_UNEVALUATED');
      }
    } else {
      claimStatus = 'EXPLORATORY_FINDING';
      finalCandidateStatus = 'PROPOSED';
      validWarrantClass = 'WARRANT_PENDING_EVALUATION';
      disposition = 'CANDIDATE_EXPLORATORY';
      archetypes.push('OUTCOME_UNEVALUATED');
    }

    if (archetypes.length === 0) {
      archetypes.push('OUTCOME_UNEVALUATED');
    }

    // D. Unblinding Guard: Requires verified operator unblinding token
    let unblindingPhase = 'BLINDED_PENDING_UNBLINDING';
    if (evaluationCriteria.authenticatedUnblinding === true) {
      const operatorToken = evaluationCriteria.operatorUnblindingToken;
      const trustedEnvToken = process.env.TD613_OPERATOR_UNBLINDING_TOKEN;

      if (operatorToken && trustedEnvToken && operatorToken === trustedEnvToken) {
        unblindingPhase = 'FINAL_UNBLINDED';
      }
    }

    // E. Assemble Adjudicated Candidate
    adjudicatedCandidate.status = finalCandidateStatus;
    adjudicatedCandidate.warrant_class = validWarrantClass;

    adjudicatedCandidate.adjudication_ancestry = {
      evaluator_tier: this.evaluatorTier,
      scoring_rule_version: this.scoringRuleVersion,
      rca01_cell: candidate.adjudication_ancestry?.rca01_cell || (discoveredInCellA ? 'CELL_A_AUTH_NEUT' : 'CELL_B_AUTH_DOLL'),
      rca01_evaluation_vector: {
        discovery_occurrence: !negativeControlRejected ? 'FALSIFIED_REPRESENTATION' : (discoveredInCellB ? 'DISCOVERED' : 'MISSED'),
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
      disposition,
      evaluator_notes: evaluatorNotes || (this.isWitnessAttested ? 'Independently evaluated and attested' : 'Unattested semantic assembly')
    };

    return {
      adjudicated_candidate: adjudicatedCandidate,
      adjudication_receipt: {
        receipt_id: receiptId,
        candidate_id: candidate.candidate_id,
        timestamp: new Date().toISOString(),
        evaluator_tier: this.evaluatorTier,
        is_witness_attested: this.isWitnessAttested,
        authenticated_witness_id: this.authenticatedWitnessId,
        independent_proof_receipt_ref: independentProofReceipt ? independentProofReceipt.receipt_id : null,
        disposition,
        claim_status: claimStatus,
        causal_contribution: causalContribution,
        negative_control_passed: negativeControlRejected,
        unblinding_phase: unblindingPhase
      }
    };
  }
}
