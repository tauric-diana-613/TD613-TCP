/**
 * TD613 Prospective Em Unified Theory Synthesis Instrument
 * Commission EM E-00.1 · Deliverables 4 & 5 (Tasks E001-F02 & E001-F04)
 * 
 * Implements a falsifiable, source-bound Unified Theory Synthesis Engine
 * grounded in Em's native documentary research methodology.
 * 
 * Core Invariants:
 * - Separates caller-authored proposals from source-attested facts.
 * - Enforces verified, source-linked operator definitions and domain/codomain types.
 * - Rejects empty maps, invented operator names, and unsupported morphism labels.
 * - Retains HELD_MISSING_OBSERVATION where mathematical relationships remain unobserved.
 * - Permits continuous-discrete correspondences when an explicit mapping is demonstrated.
 * - Preserves capacity to return NO_UNIFICATION_WARRANTED indefinitely.
 * - Implements dependency-aware non-retroactive theory withdrawal with immutable snapshots.
 */

import crypto from 'node:crypto';

export class TheorySynthesisError extends Error {
  constructor(code, message, details = {}) {
    super(`[${code}] ${message}`);
    this.code = code;
    this.details = details;
  }
}

export function sha256Hex(buf) {
  const b = Buffer.isBuffer(buf) ? buf : Buffer.from(String(buf), 'utf8');
  return crypto.createHash('sha256').update(b).digest('hex');
}

export const PROMOTION_LADDER = {
  LEVEL_0_SUPERFICIAL_ANALOGY: 'SUPERFICIAL_ANALOGY',
  LEVEL_1_FORMAL_STRUCTURAL_ISOMORPHISM: 'FORMAL_STRUCTURAL_ISOMORPHISM',
  LEVEL_2_COMPOSABLE_THEORY_CANDIDATE: 'COMPOSABLE_THEORY_CANDIDATE',
  LEVEL_3_FALSIFIABLE_UNIFIED_FRAMEWORK: 'FALSIFIABLE_UNIFIED_FRAMEWORK'
};

export const SUPPORTED_MORPHISMS = new Set([
  'HOMOMORPHIC_INTERVENTION',
  'ISOMORPHISM',
  'FUNCTOR',
  'SURJECTIVE_REDUCTION',
  'MEASURE_PRESERVING_FLOW',
  'DISCRETIZATION_CORRESPONDENCE'
]);

export const LAWFUL_DISCRETIZATION_METHODS = new Set([
  'RUNGE_KUTTA_SAMPLING',
  'NYQUIST_SHANNON_SAMPLING',
  'ZERO_ORDER_HOLD',
  'POINCARE_SECTION'
]);

function assumptionsClash(assA, assB, proposedCorrespondence = null) {
  const isContinuousDiscrete = 
    (assA.includes('CONTINUOUS') && assB.includes('DISCRETE')) ||
    (assB.includes('CONTINUOUS') && assA.includes('DISCRETE'));

  if (isContinuousDiscrete) {
    // Caller-supplied continuous/discrete correspondence flag cannot by itself establish lawful discretization.
    // Must provide formal discretization method, positive step size, and bounded error guarantee.
    const isFormalCorrespondence =
      proposedCorrespondence &&
      typeof proposedCorrespondence === 'object' &&
      proposedCorrespondence.type === 'DISCRETIZATION_CORRESPONDENCE' &&
      LAWFUL_DISCRETIZATION_METHODS.has(proposedCorrespondence.discretization_method) &&
      typeof proposedCorrespondence.step_size === 'number' &&
      proposedCorrespondence.step_size > 0 &&
      Boolean(proposedCorrespondence.bounded_error_guarantee);

    if (isFormalCorrespondence) {
      return false; // Formal discretization correspondence verified
    }
    return true; // Clash preserved fail-closed!
  }

  return (
    (assA.includes('DETERMINISTIC_REALTIME') && assB.includes('NON_STATIONARY_HEURISTIC')) ||
    (assB.includes('DETERMINISTIC_REALTIME') && assA.includes('NON_STATIONARY_HEURISTIC')) ||
    (assA.includes('ZERO_LATENCY') && assB.includes('VARIABLE_DELAY')) ||
    (assB.includes('ZERO_LATENCY') && assA.includes('VARIABLE_DELAY'))
  );
}

export class EmUnifiedTheorySynthesisEngine {
  constructor(options = {}) {
    this.covenant = 'Khona\u200Clit-po';
    this.authority = 'SAC[X6ZNK5NO51]';
    this.extractedWorks = new Map();
    this.synthesizedTheories = new Map();
    this.tombstonedTheories = new Map();
    this.immutableSnapshots = new Map();
    this.synthesisLedger = [];
    this.authenticatedSources = new Map();

    if (options.authenticatedSources) {
      if (options.authenticatedSources instanceof Map) {
        for (const [id, src] of options.authenticatedSources.entries()) {
          this.registerAuthenticatedSource(src);
        }
      } else if (Array.isArray(options.authenticatedSources)) {
        for (const src of options.authenticatedSources) {
          this.registerAuthenticatedSource(src);
        }
      }
    }
    if (options.bridge) {
      this.registerBridge(options.bridge);
    }
  }

  /**
   * Registers an independently authenticated source record against which operator passages are verified.
   */
  registerAuthenticatedSource({ sourceId, filename, rawBytes, sha256 = null }) {
    if (!sourceId || !rawBytes) {
      throw new TheorySynthesisError('SOURCE_ID_AND_BYTES_REQUIRED', 'sourceId and rawBytes are required for source registration.');
    }
    const buf = Buffer.isBuffer(rawBytes) ? Buffer.from(rawBytes) : Buffer.from(String(rawBytes), 'utf8');
    const computedDigest = sha256Hex(buf);
    if (sha256 && sha256 !== computedDigest) {
      throw new TheorySynthesisError('AUTHENTICATED_SOURCE_DIGEST_MISMATCH', `Provided sha256 ${sha256} does not match computed digest ${computedDigest}.`);
    }
    const record = {
      source_id: sourceId,
      filename: filename || sourceId,
      raw_bytes: buf,
      byte_length: buf.length,
      sha256: computedDigest,
      registered_at: new Date().toISOString()
    };
    this.authenticatedSources.set(sourceId, record);
    return record;
  }

  /**
   * Registers admitted sources from an EmUniversalReciprocalBridge into the authenticated registry.
   */
  registerBridge(bridge) {
    if (bridge && bridge.admittedEmSources instanceof Map) {
      for (const [id, rec] of bridge.admittedEmSources.entries()) {
        this.registerAuthenticatedSource({
          sourceId: rec.source_id,
          filename: rec.filename,
          rawBytes: rec.raw_bytes,
          sha256: rec.sha256
        });
      }
    }
  }

  /**
   * Internal verification of operator attestation against registered authenticated sources.
   */
  _verifyOperatorAttestation(sourceId, coordinates, declaredDigest, quotedText) {
    if (!sourceId) {
      return {
        isAttested: false,
        status: 'MISSING_SOURCE_ID',
        unauthenticated_source: true,
        details: 'Operator attestation lacks source_id.'
      };
    }

    const authSource = this.authenticatedSources.get(sourceId);
    if (!authSource) {
      return {
        isAttested: false,
        source_id: sourceId,
        status: 'UNAUTHENTICATED_SOURCE',
        unauthenticated_source: true,
        passage_coordinates: coordinates,
        content_digest: declaredDigest,
        quoted_text: quotedText,
        details: `Source '${sourceId}' is not registered in the independent authenticated source registry.`
      };
    }

    const start = coordinates?.start !== undefined ? coordinates.start : (coordinates?.byteOffset !== undefined ? coordinates.byteOffset : 0);
    const length = coordinates?.length !== undefined ? coordinates.length : (coordinates?.end !== undefined ? coordinates.end - start : (quotedText ? quotedText.length : 0));
    const end = coordinates?.end !== undefined ? coordinates.end : (start + length);

    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end > authSource.byte_length || start >= end) {
      return {
        isAttested: false,
        source_id: sourceId,
        status: 'COORDINATES_OUT_OF_BOUNDS',
        out_of_bounds: true,
        passage_coordinates: { start, end },
        content_digest: declaredDigest,
        quoted_text: quotedText,
        details: `Passage coordinates [${start}, ${end}] out of bounds for authenticated source of length ${authSource.byte_length}.`
      };
    }

    const actualSlice = authSource.raw_bytes.subarray(start, end);
    const actualDigest = sha256Hex(actualSlice);
    const actualText = actualSlice.toString('utf8');

    const digestMismatch = Boolean(declaredDigest && declaredDigest !== actualDigest);
    const textMismatch = Boolean(quotedText && quotedText !== actualText);

    if (digestMismatch || textMismatch) {
      return {
        isAttested: false,
        source_id: sourceId,
        passage_coordinates: { start, end },
        content_digest: declaredDigest,
        expected_digest: actualDigest,
        quoted_text: quotedText,
        actual_text: actualText,
        status: 'DIGEST_OR_TEXT_MISMATCH',
        digest_mismatch: true,
        details: digestMismatch
          ? `Passage content digest '${declaredDigest}' does not match authenticated source byte digest '${actualDigest}'.`
          : `Quoted text does not match authenticated source byte slice.`
      };
    }

    return {
      isAttested: true,
      source_id: sourceId,
      passage_coordinates: { start, end },
      content_digest: actualDigest,
      quoted_text: actualText,
      status: 'SOURCE_ATTESTED'
    };
  }

  /**
   * Capability 1: Extracts structural anatomy from an identified Work with verified operator attestation.
   */
  extractWorkAnatomy({
    workId,
    title,
    domain,
    sourcePassages = [],
    objects = [],
    operators = [],
    variables = [],
    constraints = [],
    assumptions = [],
    boundaryConditions = {},
    empiricalClaims = []
  }) {
    if (!workId || !title || !domain) {
      throw new TheorySynthesisError('WORK_METADATA_REQUIRED', 'workId, title, and domain are required.');
    }

    const processedOperators = [];
    const operatorNames = [];

    for (const op of operators) {
      if (typeof op === 'string') {
        const matchingPassage = sourcePassages.find(p =>
          p.operator === op ||
          (p.span_text && p.span_text.includes(op.split('.')[0])) ||
          (p.claimSummary && p.claimSummary.includes(op.split('.')[0]))
        ) || (sourcePassages.length > 0 ? sourcePassages[0] : null);

        let attestation = null;
        let isAttested = false;

        if (matchingPassage && matchingPassage.source_id && sourcePassages.length > 0) {
          const quoted = matchingPassage.span_text || matchingPassage.quoted_text || op;
          const declaredDigest = matchingPassage.span_sha256 || matchingPassage.content_digest || (quoted ? sha256Hex(quoted) : null);
          const coords = {
            start: matchingPassage.start !== undefined ? matchingPassage.start : (matchingPassage.byteOffset || 0),
            end: matchingPassage.end !== undefined ? matchingPassage.end : ((matchingPassage.byteOffset || 0) + (matchingPassage.length || quoted.length)),
            byteOffset: matchingPassage.byteOffset,
            length: matchingPassage.length
          };
          const res = this._verifyOperatorAttestation(matchingPassage.source_id, coords, declaredDigest, quoted);
          attestation = res;
          isAttested = res.isAttested;
        }

        processedOperators.push({
          name: op,
          domain_type: 'GenericDomain',
          codomain_type: 'GenericCodomain',
          source_attestation: attestation,
          is_source_attested: isAttested
        });
        operatorNames.push(op);
      } else if (op && typeof op === 'object' && op.name) {
        let attestation = null;
        let isAttested = false;

        if (op.source_attestation) {
          const sa = op.source_attestation;
          const coords = sa.passage_coordinates || { start: sa.start, end: sa.end, byteOffset: sa.byteOffset, length: sa.length };
          const res = this._verifyOperatorAttestation(sa.source_id, coords, sa.content_digest, sa.quoted_text);
          attestation = res;
          isAttested = res.isAttested;
        } else if (sourcePassages.length > 0) {
          const matchingPassage = sourcePassages.find(p =>
            p.operator === op.name ||
            (p.span_text && p.span_text.includes(op.name.split('.')[0])) ||
            (p.claimSummary && p.claimSummary.includes(op.name.split('.')[0]))
          ) || sourcePassages[0];

          if (matchingPassage && matchingPassage.source_id) {
            const quoted = matchingPassage.span_text || matchingPassage.quoted_text || op.name;
            const declaredDigest = matchingPassage.span_sha256 || matchingPassage.content_digest || (quoted ? sha256Hex(quoted) : null);
            const coords = {
              start: matchingPassage.start !== undefined ? matchingPassage.start : (matchingPassage.byteOffset || 0),
              end: matchingPassage.end !== undefined ? matchingPassage.end : ((matchingPassage.byteOffset || 0) + (matchingPassage.length || quoted.length)),
              byteOffset: matchingPassage.byteOffset,
              length: matchingPassage.length
            };
            const res = this._verifyOperatorAttestation(matchingPassage.source_id, coords, declaredDigest, quoted);
            attestation = res;
            isAttested = res.isAttested;
          }
        }

        processedOperators.push({
          name: op.name,
          domain_type: op.domain_type || 'GenericDomain',
          codomain_type: op.codomain_type || 'GenericCodomain',
          source_attestation: attestation,
          is_source_attested: isAttested
        });
        operatorNames.push(op.name);
      }
    }

    const anatomy = {
      work_id: workId,
      title,
      domain,
      source_passages: [...sourcePassages],
      objects: [...objects],
      operators: operatorNames,
      processed_operators: processedOperators,
      variables: [...variables],
      constraints: [...constraints],
      assumptions: [...assumptions],
      boundary_conditions: { ...boundaryConditions },
      empirical_claims: [...empiricalClaims],
      extracted_at: new Date().toISOString()
    };

    this.extractedWorks.set(workId, anatomy);
    this.synthesisLedger.push({
      action: 'WORK_ANATOMY_EXTRACTED',
      work_id: workId,
      domain
    });

    return anatomy;
  }

  /**
   * Capabilities 2, 3, 4, 7, 10: Evaluates cross-domain synthesis between two Works.
   * Enforces verified operator validation, incommensurability checks, and candidate formulation.
   */
  synthesizeCrossDomainCandidate({
    candidateId,
    workAId,
    workBId,
    proposedBridgeHypothesis,
    sharedMotifVocabulary = [],
    formalOperatorMapping = [],
    proposedCorrespondence = null,
    proposedPredictions = []
  }) {
    const wA = this.extractedWorks.get(workAId);
    const wB = this.extractedWorks.get(workBId);

    if (!wA || !wB) {
      throw new TheorySynthesisError('WORKS_NOT_FOUND', `Works ${workAId} or ${workBId} not extracted.`);
    }

    const incompatibleAssumptions = [];
    const competingExplanations = [];

    // Check 1: Empty operator mapping check
    if (!formalOperatorMapping || formalOperatorMapping.length === 0) {
      return {
        candidate_id: candidateId,
        verdict: 'NO_UNIFICATION_WARRANTED',
        promotion_level: PROMOTION_LADDER.LEVEL_0_SUPERFICIAL_ANALOGY,
        reason: 'SUPERFICIAL_MOTIF_CONVERGENCE_WITHOUT_FORMAL_OPERATOR_MAPPING',
        shared_vocabulary: sharedMotifVocabulary,
        missing: ['FORMAL_OPERATOR_MAPPING', 'DISCRIMINATING_OBSERVATION'],
        falsification_status: 'REFUSED_FAIL_CLOSED'
      };
    }

    // Check 2: Operator existence and morphism typing on Works
    for (const m of formalOperatorMapping) {
      if (!m.opA || !m.opB) {
        return {
          candidate_id: candidateId,
          verdict: 'NO_UNIFICATION_WARRANTED',
          promotion_level: PROMOTION_LADDER.LEVEL_0_SUPERFICIAL_ANALOGY,
          reason: 'INCOMPLETE_OPERATOR_PAIR',
          details: 'Both opA and opB are required in each mapping entry.',
          falsification_status: 'REFUSED_FAIL_CLOSED'
        };
      }

      // Check whether opA is declared on Work A
      if (!wA.operators.includes(m.opA)) {
        return {
          candidate_id: candidateId,
          verdict: 'NO_UNIFICATION_WARRANTED',
          promotion_level: PROMOTION_LADDER.LEVEL_0_SUPERFICIAL_ANALOGY,
          reason: 'INVENTED_OPERATOR_NAME_REJECTED',
          details: `Operator '${m.opA}' is not an attested operator of Work '${wA.title}' (${wA.work_id}).`,
          falsification_status: 'REFUSED_UNATTESTED_OPERATOR'
        };
      }

      // Check whether opB is declared on Work B
      if (!wB.operators.includes(m.opB)) {
        return {
          candidate_id: candidateId,
          verdict: 'NO_UNIFICATION_WARRANTED',
          promotion_level: PROMOTION_LADDER.LEVEL_0_SUPERFICIAL_ANALOGY,
          reason: 'INVENTED_OPERATOR_NAME_REJECTED',
          details: `Operator '${m.opB}' is not an attested operator of Work '${wB.title}' (${wB.work_id}).`,
          falsification_status: 'REFUSED_UNATTESTED_OPERATOR'
        };
      }

      // Check morphism label support
      if (!m.morphismType || !SUPPORTED_MORPHISMS.has(m.morphismType)) {
        return {
          candidate_id: candidateId,
          verdict: 'NO_UNIFICATION_WARRANTED',
          promotion_level: PROMOTION_LADDER.LEVEL_0_SUPERFICIAL_ANALOGY,
          reason: 'UNSUPPORTED_MORPHISM_LABEL_REJECTED',
          details: `Morphism label '${m.morphismType}' is unsupported or lacks mathematical definition.`,
          falsification_status: 'REFUSED_UNSUPPORTED_MORPHISM'
        };
      }

      // Check invented mathematical relationships
      if (m.morphismType === 'MAGIC_TRANSMUTATION' || m.unsupportedMathematicalRelationship) {
        return {
          candidate_id: candidateId,
          verdict: 'NO_UNIFICATION_WARRANTED',
          promotion_level: PROMOTION_LADDER.LEVEL_0_SUPERFICIAL_ANALOGY,
          reason: 'INVENTED_MATHEMATICAL_RELATIONSHIP_REJECTED',
          details: `Mathematical relationship asserted in mapping lacks formal typing proof.`,
          falsification_status: 'REFUSED_INVENTED_RELATIONSHIP'
        };
      }
    }

    // Check 3: Boundary Condition and Assumption Compatibility
    let hasContinuousDiscreteConflict = false;
    for (const assA of wA.assumptions) {
      for (const assB of wB.assumptions) {
        if (assumptionsClash(assA, assB, proposedCorrespondence)) {
          if ((assA.includes('CONTINUOUS') && assB.includes('DISCRETE')) ||
              (assB.includes('CONTINUOUS') && assA.includes('DISCRETE'))) {
            hasContinuousDiscreteConflict = true;
          }
          incompatibleAssumptions.push({
            assumption_A: assA,
            assumption_B: assB,
            conflict: 'INCOMMENSURABLE_ASSUMPTION_PARADOX'
          });
        }
      }
    }

    if (incompatibleAssumptions.length > 0) {
      const isUnverifiedCorrespondence = hasContinuousDiscreteConflict &&
        proposedCorrespondence &&
        (!proposedCorrespondence.discretization_method || !LAWFUL_DISCRETIZATION_METHODS.has(proposedCorrespondence.discretization_method));

      return {
        candidate_id: candidateId,
        verdict: 'NO_UNIFICATION_WARRANTED',
        promotion_level: PROMOTION_LADDER.LEVEL_1_FORMAL_STRUCTURAL_ISOMORPHISM,
        reason: isUnverifiedCorrespondence
          ? 'UNVERIFIED_CONTINUOUS_DISCRETE_CORRESPONDENCE_REJECTED'
          : 'COMPOSABILITY_FAILURE_DUE_TO_INCOMMENSURABLE_ASSUMPTIONS',
        incompatible_assumptions: incompatibleAssumptions,
        retained_contradictions: incompatibleAssumptions.map(c => `${c.assumption_A} != ${c.assumption_B}`),
        falsification_status: 'CONTRADICTION_PRESERVED_WITHOUT_FORCED_CONSENSUS'
      };
    }

    // Check 4: Source Attestation & Provenance of Operators
    if (wA.source_passages.length === 0 || wB.source_passages.length === 0) {
      const emptyWork = wA.source_passages.length === 0 ? wA : wB;
      return {
        candidate_id: candidateId,
        verdict: 'NO_UNIFICATION_WARRANTED',
        promotion_level: PROMOTION_LADDER.LEVEL_0_SUPERFICIAL_ANALOGY,
        reason: 'EMPTY_SOURCE_PASSAGES_CANNOT_ATTEST_OPERATORS',
        details: `Work '${emptyWork.title}' (${emptyWork.work_id}) contains zero source passages to attest operators.`,
        falsification_status: 'REFUSED_EMPTY_SOURCE_PASSAGES'
      };
    }

    for (const m of formalOperatorMapping) {
      const opRecordA = wA.processed_operators ? wA.processed_operators.find(o => o.name === m.opA) : null;
      const opRecordB = wB.processed_operators ? wB.processed_operators.find(o => o.name === m.opB) : null;

      // 1. Unauthenticated source: caller-supplied passages/hashes cannot certify operators without independent registry record
      if (opRecordA?.source_attestation?.unauthenticated_source || opRecordB?.source_attestation?.unauthenticated_source) {
        return {
          candidate_id: candidateId,
          verdict: 'NO_UNIFICATION_WARRANTED',
          status: 'HELD_UNVERIFIED',
          promotion_level: PROMOTION_LADDER.LEVEL_0_SUPERFICIAL_ANALOGY,
          reason: 'UNAUTHENTICATED_SOURCE_ATTESTATION_REJECTED',
          details: 'Caller-supplied source passages, hashes, and quotations cannot independently certify operators without an independently registered authenticated source record.',
          falsification_status: 'HELD_UNVERIFIED_SOURCE'
        };
      }

      // 2. Digest or text mismatch against authenticated source bytes
      if (opRecordA?.source_attestation?.digest_mismatch || opRecordB?.source_attestation?.digest_mismatch) {
        return {
          candidate_id: candidateId,
          verdict: 'NO_UNIFICATION_WARRANTED',
          status: 'HELD_UNVERIFIED',
          promotion_level: PROMOTION_LADDER.LEVEL_0_SUPERFICIAL_ANALOGY,
          reason: 'SOURCE_QUOTATION_DIGEST_MISMATCH_REJECTED',
          details: 'Passage content digest does not match authenticated source byte slice.',
          falsification_status: 'REFUSED_DIGEST_MISMATCH'
        };
      }

      // 3. Out of bounds coordinates against authenticated source
      if (opRecordA?.source_attestation?.out_of_bounds || opRecordB?.source_attestation?.out_of_bounds) {
        return {
          candidate_id: candidateId,
          verdict: 'NO_UNIFICATION_WARRANTED',
          status: 'HELD_UNVERIFIED',
          promotion_level: PROMOTION_LADDER.LEVEL_0_SUPERFICIAL_ANALOGY,
          reason: 'SOURCE_COORDINATES_OUT_OF_BOUNDS_REJECTED',
          details: 'Passage coordinates exceed authenticated source byte boundary.',
          falsification_status: 'REFUSED_OUT_OF_BOUNDS'
        };
      }

      // 4. Missing operator attestation
      if (!opRecordA?.is_source_attested || !opRecordB?.is_source_attested) {
        return {
          candidate_id: candidateId,
          verdict: 'NO_UNIFICATION_WARRANTED',
          status: 'HELD_UNVERIFIED',
          promotion_level: PROMOTION_LADDER.LEVEL_0_SUPERFICIAL_ANALOGY,
          reason: 'OPERATOR_LACKS_VERIFIED_SOURCE_ATTESTATION',
          details: 'Operator definition lacks verified source passage coordinates and content digest in registered authenticated source.',
          falsification_status: 'REFUSED_UNATTESTED_OPERATOR'
        };
      }

      // 5. Check if relationship remains unobserved or unverified
      if (m.requiresObservation || m.morphismType === 'UNKNOWN' || m.unverified) {
        return {
          candidate_id: candidateId,
          verdict: 'NO_UNIFICATION_WARRANTED',
          status: 'HELD_UNVERIFIED',
          promotion_level: PROMOTION_LADDER.LEVEL_1_FORMAL_STRUCTURAL_ISOMORPHISM,
          reason: 'MAPPING_RELATIONSHIP_UNVERIFIED_OR_UNOBSERVED',
          falsification_status: 'HELD_PENDING_EMPIRICAL_OBSERVATION'
        };
      }
    }

    // Check 5: Discriminating Falsifiable Consequences
    if (!proposedPredictions || proposedPredictions.length === 0) {
      return {
        candidate_id: candidateId,
        verdict: 'NO_UNIFICATION_WARRANTED',
        promotion_level: PROMOTION_LADDER.LEVEL_1_FORMAL_STRUCTURAL_ISOMORPHISM,
        reason: 'LACKS_DISCRIMINATING_FALSIFIABLE_PREDICTIONS',
        falsification_status: 'REFUSED_NO_TESTABLE_PREDICTION'
      };
    }

    // Competing explanations
    competingExplanations.push({
      model_id: 'COMPETITOR_NULL_SEPARATE_SYSTEMS',
      description: 'The two domains operate as decoupled parallel mechanisms without shared theoretical laws.'
    });
    competingExplanations.push({
      model_id: 'COMPETITOR_COMMON_SOURCE_METAPHOR',
      description: 'Apparent resemblance is an artifact of shared cybernetic literature terminology (Ashby/Beer), not physical equivalence.'
    });

    // Derive source root dependencies
    const sourceRootIds = [
      ...wA.source_passages.map(p => p.source_id),
      ...wB.source_passages.map(p => p.source_id)
    ].filter(Boolean);

    const now = new Date().toISOString();
    const candidateTheory = {
      candidate_id: candidateId,
      version: 1,
      verdict: 'COMPOSABLE_THEORY_CANDIDATE_ADMITTED',
      promotion_level: PROMOTION_LADDER.LEVEL_2_COMPOSABLE_THEORY_CANDIDATE,
      work_A: { id: wA.work_id, domain: wA.domain, title: wA.title },
      work_B: { id: wB.work_id, domain: wB.domain, title: wB.title },
      source_roots: sourceRootIds,
      proposed_hypothesis: proposedBridgeHypothesis,
      formal_operator_mapping: formalOperatorMapping.map(m => ({
        ...m,
        operator_attestation_status: 'SOURCE_ATTESTED',
        mathematical_morphism_status: m.formal_proof ? 'MATHEMATICALLY_DEMONSTRATED' : 'HELD_UNVERIFIED',
        mathematical_validity: m.formal_proof ? 'PROVEN' : 'HELD_UNVERIFIED'
      })),
      indispensable_relations: formalOperatorMapping.map(m => `${m.opA} <===> ${m.opB} [${m.morphismType}]`),
      discretization_correspondence: proposedCorrespondence ? {
        ...proposedCorrespondence,
        mathematical_validity: proposedCorrespondence.formal_proof ? 'MATHEMATICALLY_DEMONSTRATED' : 'HELD_UNVERIFIED'
      } : null,
      mathematical_validity_status: 'HELD_UNVERIFIED',
      falsifiable_consequences: proposedPredictions,
      competing_models: competingExplanations,
      discriminating_observation_required: `Empirical assay testing whether ${proposedPredictions[0].metric} exceeds null baseline by ${proposedPredictions[0].minimum_effect}`,
      status: 'ACTIVE_CANDIDATE',
      claim_ceiling: 'PROSPECTIVE_RESEARCH_HYPOTHESIS_ONLY_NOT_TD613_LAW',
      human_closure_required: true,
      created_at: now,
      updated_at: now,
      snapshots: []
    };

    // Store immutable snapshot of initial admission
    const snapshot0 = JSON.parse(JSON.stringify(candidateTheory));
    candidateTheory.snapshots.push({
      snapshot_index: 0,
      timestamp: now,
      state: snapshot0
    });
    this.immutableSnapshots.set(`${candidateId}:0`, snapshot0);

    this.synthesizedTheories.set(candidateId, candidateTheory);
    this.synthesisLedger.push({
      action: 'CANDIDATE_THEORY_ADMITTED',
      candidate_id: candidateId,
      level: PROMOTION_LADDER.LEVEL_2_COMPOSABLE_THEORY_CANDIDATE
    });

    return candidateTheory;
  }

  /**
   * Non-retroactively withdraws a candidate theory upon negative test or source retraction.
   */
  withdrawTheory(candidateId, reason, disconfirmingWitness) {
    const theory = this.synthesizedTheories.get(candidateId);
    if (!theory) {
      throw new TheorySynthesisError('THEORY_NOT_FOUND', `Theory ${candidateId} not found.`);
    }

    const now = new Date().toISOString();
    const tombstone = {
      tombstone_id: `tombstone:${candidateId}:${Date.now()}`,
      candidate_id: candidateId,
      version: theory.version,
      prior_status: theory.status,
      withdrawn_at: now,
      withdrawal_reason: reason,
      disconfirming_witness: disconfirmingWitness,
      non_retroactive: true
    };

    theory.status = 'WITHDRAWN';
    theory.tombstone = tombstone;
    theory.updated_at = now;
    theory.version += 1;

    // Save immutable snapshot of post-withdrawal state
    const snapshotWithdrawn = JSON.parse(JSON.stringify(theory));
    theory.snapshots.push({
      snapshot_index: theory.snapshots.length,
      timestamp: now,
      state: snapshotWithdrawn
    });
    this.immutableSnapshots.set(`${candidateId}:${theory.snapshots.length - 1}`, snapshotWithdrawn);

    this.tombstonedTheories.set(candidateId, tombstone);
    this.synthesisLedger.push({
      action: 'THEORY_WITHDRAWN',
      candidate_id: candidateId,
      reason,
      tombstone_id: tombstone.tombstone_id
    });

    return tombstone;
  }

  /**
   * Dependency-aware lifecycle: cascades source withdrawal to all dependent theories.
   */
  propagateSourceWithdrawal(withdrawnSourceId, reason) {
    const affectedTheories = [];

    for (const [candId, theory] of this.synthesizedTheories.entries()) {
      if (theory.status === 'ACTIVE_CANDIDATE' && theory.source_roots && theory.source_roots.includes(withdrawnSourceId)) {
        const tombstone = this.withdrawTheory(
          candId,
          `DEPENDENT_SOURCE_WITHDRAWN: ${reason}`,
          `Underlying source root ${withdrawnSourceId} retracted`
        );
        affectedTheories.push({
          candidate_id: candId,
          tombstone_id: tombstone.tombstone_id
        });
      }
    }

    return {
      withdrawn_source_id: withdrawnSourceId,
      cascaded_theories_count: affectedTheories.length,
      affected_theories: affectedTheories
    };
  }

  /**
   * Retrieves an immutable historical snapshot by candidate ID and snapshot index.
   */
  getHistoricalSnapshot(candidateId, snapshotIndex = 0) {
    const key = `${candidateId}:${snapshotIndex}`;
    const snap = this.immutableSnapshots.get(key);
    if (!snap) {
      throw new TheorySynthesisError('SNAPSHOT_NOT_FOUND', `Snapshot ${key} not found.`);
    }
    return JSON.parse(JSON.stringify(snap));
  }
}
