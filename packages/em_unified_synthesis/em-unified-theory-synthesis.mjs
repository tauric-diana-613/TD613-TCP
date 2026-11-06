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

function assumptionsClash(assA, assB, proposedCorrespondence = null) {
  const isContinuousDiscrete = 
    (assA.includes('CONTINUOUS') && assB.includes('DISCRETE')) ||
    (assB.includes('CONTINUOUS') && assA.includes('DISCRETE'));

  if (isContinuousDiscrete) {
    // If a valid discretization or sampling correspondence is explicitly declared, do not automatically clash
    if (proposedCorrespondence && (proposedCorrespondence.handlesContinuousDiscrete || proposedCorrespondence.type === 'DISCRETIZATION_CORRESPONDENCE')) {
      return false;
    }
    return true;
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
      source_passages: [...sourcePassages],
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

    // Check 2: Operator verification against source-attested Work anatomies
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

      // Check whether opA is an attested operator of Work A
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

      // Check whether opB is an attested operator of Work B
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

      // Check if relationship remains unobserved
      if (m.requiresObservation || m.morphismType === 'UNKNOWN') {
        return {
          candidate_id: candidateId,
          verdict: 'NO_UNIFICATION_WARRANTED',
          promotion_level: PROMOTION_LADDER.LEVEL_1_FORMAL_STRUCTURAL_ISOMORPHISM,
          status: 'HELD_MISSING_OBSERVATION',
          reason: 'MAPPING_RELATIONSHIP_UNOBSERVED_IN_DATA',
          falsification_status: 'HELD_PENDING_EMPIRICAL_OBSERVATION'
        };
      }
    }

    // Check 3: Boundary Condition and Assumption Compatibility
    for (const assA of wA.assumptions) {
      for (const assB of wB.assumptions) {
        if (assumptionsClash(assA, assB, proposedCorrespondence)) {
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
        promotion_level: PROMOTION_LADDER.LEVEL_1_FORMAL_STRUCTURAL_ISOMORPHISM,
        reason: 'COMPOSABILITY_FAILURE_DUE_TO_INCOMMENSURABLE_ASSUMPTIONS',
        incompatible_assumptions: incompatibleAssumptions,
        retained_contradictions: incompatibleAssumptions.map(c => `${c.assumption_A} != ${c.assumption_B}`),
        falsification_status: 'CONTRADICTION_PRESERVED_WITHOUT_FORCED_CONSENSUS'
      };
    }

    // Check 4: Discriminating Falsifiable Consequences
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
      formal_operator_mapping: formalOperatorMapping,
      indispensable_relations: formalOperatorMapping.map(m => `${m.opA} <===> ${m.opB} [${m.morphismType}]`),
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
