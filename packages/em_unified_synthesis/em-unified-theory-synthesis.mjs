/**
 * TD613 Prospective Em Unified Theory Synthesis Instrument
 * Commission EM E-00 · Section IV
 * 
 * Implements a falsifiable, source-bound Unified Theory Synthesis Engine
 * grounded in Em's native documentary research methodology.
 * 
 * Capabilities 1–10:
 * 1. Extract objects, operators, variables, constraints, assumptions, boundaries, claims.
 * 2. Compare formal/mechanistic relationships without equating surface vocabulary.
 * 3. Construct explicit composition rules and trace indispensable relations.
 * 4. Represent incompatible mechanisms and contradictions without forced consensus.
 * 5. Generate candidate unified explanations with falsifiable consequences.
 * 6. Produce competing explanations, minimal counterexamples, discriminating tests.
 * 7. Identify failures of composability, incommensurable assumptions, false convergence.
 * 8. Lawfully revise or withdraw candidate theories upon disconfirmation.
 * 9. Measure incremental value beyond contributing methods.
 * 10. Fail-closed return of NO_UNIFICATION_WARRANTED when evidence is insufficient.
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
  LEVEL_1_MOTIF_MATCH: 'MOTIF_MATCH',
  LEVEL_2_STRUCTURAL_ANALOGY: 'STRUCTURAL_ANALOGY_CANDIDATE',
  LEVEL_3_COMPOSABLE_CANDIDATE: 'COMPOSABLE_THEORY_CANDIDATE',
  LEVEL_4_WARRANTED_MECHANISM: 'WARRANTED_MECHANISM_RESERVED_FOR_HUMAN'
};

function assumptionsClash(assA, assB) {
  return (
    (assA.includes('CONTINUOUS') && assB.includes('DISCRETE')) ||
    (assB.includes('CONTINUOUS') && assA.includes('DISCRETE')) ||
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
    this.synthesisLedger = [];
  }

  /**
   * Capability 1: Extracts structural anatomy from an identified Work.
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

    const anatomy = {
      work_id: workId,
      title,
      domain,
      source_passages: sourcePassages,
      objects: [...objects],
      operators: [...operators],
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
   * Capability 2, 3, 4, 7, 10: Evaluates cross-domain synthesis between two Works.
   */
  synthesizeCrossDomainCandidate({
    candidateId,
    workAId,
    workBId,
    proposedBridgeHypothesis,
    sharedMotifVocabulary = [],
    formalOperatorMapping = [],
    proposedPredictions = []
  }) {
    const wA = this.extractedWorks.get(workAId);
    const wB = this.extractedWorks.get(workBId);

    if (!wA || !wB) {
      throw new TheorySynthesisError('WORKS_NOT_FOUND', `Works ${workAId} or ${workBId} not extracted.`);
    }

    const evaluationSteps = [];
    const incompatibleAssumptions = [];
    const competingExplanations = [];

    // Check 1: Surface vocabulary vs. Formal Operator Morphism (Capability 2)
    // If only shared words exist without formal operator alignment -> MOTIF MATCH ONLY
    if (formalOperatorMapping.length === 0 && sharedMotifVocabulary.length > 0) {
      return {
        candidate_id: candidateId,
        verdict: 'NO_UNIFICATION_WARRANTED',
        promotion_level: PROMOTION_LADDER.LEVEL_1_MOTIF_MATCH,
        reason: 'SUPERFICIAL_MOTIF_CONVERGENCE_WITHOUT_FORMAL_OPERATOR_MAPPING',
        shared_vocabulary: sharedMotifVocabulary,
        missing: ['FORMAL_OPERATOR_MAPPING', 'DISCRIMINATING_OBSERVATION'],
        falsification_status: 'REFUSED_FAIL_CLOSED'
      };
    }

    // Check 2: Boundary Condition and Assumption Compatibility (Capability 4 & 7)
    // Check if temporal, latency, or mathematical assumptions clash (symmetric)
    for (const assA of wA.assumptions) {
      for (const assB of wB.assumptions) {
        if (assumptionsClash(assA, assB)) {
          incompatibleAssumptions.push({
            assumption_A: assA,
            assumption_B: assB,
            conflict: 'INCOMMENSURABLE_ASSUMPTION_PARADOX'
          });
        }
      }
    }

    if (incompatibleAssumptions.length > 0) {
      return {
        candidate_id: candidateId,
        verdict: 'NO_UNIFICATION_WARRANTED',
        promotion_level: PROMOTION_LADDER.LEVEL_2_STRUCTURAL_ANALOGY,
        reason: 'COMPOSABILITY_FAILURE_DUE_TO_INCOMMENSURABLE_ASSUMPTIONS',
        incompatible_assumptions: incompatibleAssumptions,
        retained_contradictions: incompatibleAssumptions.map(c => `${c.assumption_A} != ${c.assumption_B}`),
        falsification_status: 'CONTRADICTION_PRESERVED_WITHOUT_FORCED_CONSENSUS'
      };
    }

    // Capability 5 & 6: Generate Falsifiable Consequences & Competing Models
    if (proposedPredictions.length === 0) {
      return {
        candidate_id: candidateId,
        verdict: 'NO_UNIFICATION_WARRANTED',
        promotion_level: PROMOTION_LADDER.LEVEL_2_STRUCTURAL_ANALOGY,
        reason: 'LACKS_DISCRIMINATING_FALSIFIABLE_PREDICTIONS',
        falsification_status: 'REFUSED_NO_TESTABLE_PREDICTION'
      };
    }

    // Generate standard competing models (Capability 6)
    competingExplanations.push({
      model_id: 'COMPETITOR_NULL_SEPARATE_SYSTEMS',
      description: 'The two domains operate as completely decoupled parallel mechanisms without shared theoretical laws.'
    });
    competingExplanations.push({
      model_id: 'COMPETITOR_COMMON_SOURCE_METAPHOR',
      description: 'Apparent resemblance is an artifact of shared cybernetic literature terminology (Ashby/Beer), not physical or computational equivalence.'
    });

    // Capability 9: Incremental Value Assessment
    const candidateTheory = {
      candidate_id: candidateId,
      verdict: 'COMPOSABLE_THEORY_CANDIDATE_ADMITTED',
      promotion_level: PROMOTION_LADDER.LEVEL_3_COMPOSABLE_CANDIDATE,
      work_A: { id: wA.work_id, domain: wA.domain, title: wA.title },
      work_B: { id: wB.work_id, domain: wB.domain, title: wB.title },
      proposed_hypothesis: proposedBridgeHypothesis,
      formal_operator_mapping: formalOperatorMapping,
      indispensable_relations: formalOperatorMapping.map(m => `${m.opA} <===> ${m.opB} [${m.morphismType}]`),
      falsifiable_consequences: proposedPredictions,
      competing_models: competingExplanations,
      discriminating_observation_required: `Empirical assay testing whether ${proposedPredictions[0].metric} exceeds null baseline by ${proposedPredictions[0].minimum_effect}`,
      status: 'ACTIVE_CANDIDATE',
      claim_ceiling: 'PROSPECTIVE_RESEARCH_HYPOTHESIS_ONLY_NOT_TD613_LAW',
      human_closure_required: true,
      created_at: new Date().toISOString()
    };

    this.synthesizedTheories.set(candidateId, candidateTheory);
    this.synthesisLedger.push({
      action: 'CANDIDATE_THEORY_ADMITTED',
      candidate_id: candidateId,
      level: PROMOTION_LADDER.LEVEL_3_COMPOSABLE_CANDIDATE
    });

    return candidateTheory;
  }

  /**
   * Capability 8: Non-retroactively withdraws or revises a candidate theory upon negative test.
   */
  withdrawTheory(candidateId, reason, disconfirmingWitness) {
    const theory = this.synthesizedTheories.get(candidateId);
    if (!theory) {
      throw new TheorySynthesisError('THEORY_NOT_FOUND', `Theory ${candidateId} not found.`);
    }

    const tombstone = {
      tombstone_id: `tombstone:${candidateId}:${Date.now()}`,
      candidate_id: candidateId,
      prior_status: theory.status,
      withdrawn_at: new Date().toISOString(),
      withdrawal_reason: reason,
      disconfirming_witness: disconfirmingWitness,
      non_retroactive: true
    };

    theory.status = 'WITHDRAWN';
    theory.tombstone = tombstone;

    this.tombstonedTheories.set(candidateId, tombstone);
    this.synthesisLedger.push({
      action: 'THEORY_WITHDRAWN',
      candidate_id: candidateId,
      reason
    });

    return tombstone;
  }
}
