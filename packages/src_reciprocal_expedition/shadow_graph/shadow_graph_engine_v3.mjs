/**
 * 𝌋 TD613 · Boundary Attempt Graph (Shadow Graph Engine v3)
 * 
 * Default-Deny Warrant Enforcement, Relation-Specific Chronology, and Strict Re-adjudication.
 * Addressing Review Findings S21-F01 and S21-F02.
 * 
 * Invariants:
 * 1. Attempt(u, v) does NOT imply Warrant(u -> v) or Existence(v).
 * 2. Default-Deny: Any warrant string not matching an explicit registered warrant contract
 *    is rejected with UNRECOGNIZED_OR_FABRICATED_WARRANT_DENIED.
 * 3. Relation-Specific Chronology:
 *    - Forward routing / causal relations require t_target > t_source.
 *    - Historical citations (PREEXISTING_OR_CONTEMPORANEOUS) legitimately reference earlier sources (t_target <= t_source).
 * 4. Two-Phase Re-adjudication: Delayed node admission places candidates in PENDING_READJUDICATION
 *    before predicate validation.
 * 5. Retained Event History: Complete append-style transition trajectory preserved per edge key.
 */

import crypto from 'node:crypto';

export const RELATION_STATES = {
  ADMITTED: 'ADMITTED',
  ATTEMPTED_REJECTED: 'ATTEMPTED_REJECTED',
  NEVER_GENERATED: 'NEVER_GENERATED',
  WITHHELD_LACK_OF_EVIDENCE: 'WITHHELD_LACK_OF_EVIDENCE',
  WITHDRAWN_SCOPE_CHANGE: 'WITHDRAWN_SCOPE_CHANGE',
  AWAITING_UNRESOLVED_EXTERNAL: 'AWAITING_UNRESOLVED_EXTERNAL',
  PENDING_READJUDICATION: 'PENDING_READJUDICATION',
};

export const WARRANT_CONTRACTS = {
  EXACT_FORWARD_EXPLORE_CUE: {
    contract_id: 'WARRANT_EXACT_FORWARD_EXPLORE_CUE/v1',
    allowed_relation_types: ['EXPLORE_PROJECTIVE'],
    temporal_rule: 'STRICTLY_FORWARD', // requires t_target > t_source
    validate: (params = {}) => {
      if (params.cue_verified !== true) {
        return { valid: false, reason: 'EXPLORE_CUE_NOT_VERIFIED' };
      }
      if (!params.adjudicator_receipt_id) {
        return { valid: false, reason: 'ADJUDICATOR_RECEIPT_ID_REQUIRED' };
      }
      if (!params.evidence_coordinates) {
        return { valid: false, reason: 'EVIDENCE_COORDINATES_REQUIRED' };
      }
      return { valid: true };
    },
  },
  VERIFIED_GROUNDED_SPAN_WARRANT: {
    contract_id: 'WARRANT_GROUNDED_SPAN/v1',
    allowed_relation_types: ['GROUNDED_SPAN_CO_OCCURRENCE'],
    temporal_rule: 'STRICTLY_FORWARD',
    validate: (params = {}) => {
      if (params.span_verified !== true) {
        return { valid: false, reason: 'SPAN_EVIDENCE_NOT_VERIFIED' };
      }
      if (!params.adjudicator_receipt_id) {
        return { valid: false, reason: 'ADJUDICATOR_RECEIPT_ID_REQUIRED' };
      }
      if (!params.evidence_coordinates) {
        return { valid: false, reason: 'EVIDENCE_COORDINATES_REQUIRED' };
      }
      return { valid: true };
    },
  },
  HISTORICAL_RETROSPECTIVE_CITATION: {
    contract_id: 'WARRANT_HISTORICAL_CITATION/v1',
    allowed_relation_types: ['HISTORICAL_CITATION', 'RETROSPECTIVE_REFERENCE'],
    temporal_rule: 'PREEXISTING_OR_CONTEMPORANEOUS', // t_target <= t_source is legitimate citation!
    validate: (params = {}) => {
      if (params.citation_verified !== true) {
        return { valid: false, reason: 'BIBLIOGRAPHIC_CITATION_NOT_VERIFIED' };
      }
      if (!params.adjudicator_receipt_id) {
        return { valid: false, reason: 'ADJUDICATOR_RECEIPT_ID_REQUIRED' };
      }
      return { valid: true };
    },
  },
  CONTEMPORANEOUS_CROSS_REFERENCE: {
    contract_id: 'WARRANT_CONTEMPORANEOUS_CROSS_REFERENCE/v1',
    allowed_relation_types: ['CROSS_REFERENCE'],
    temporal_rule: 'ANY_RELATION',
    validate: (params = {}) => {
      if (params.cross_reference_verified !== true) {
        return { valid: false, reason: 'CROSS_REFERENCE_EVIDENCE_NOT_VERIFIED' };
      }
      if (!params.adjudicator_receipt_id) {
        return { valid: false, reason: 'ADJUDICATOR_RECEIPT_ID_REQUIRED' };
      }
      return { valid: true };
    },
  },
};

function sha256(data) {
  return crypto.createHash('sha256').update(String(data)).digest('hex');
}

export class BoundaryAttemptGraphV3 {
  constructor() {
    this.nodes = new Map(); // nodeId -> nodeRecord
    this.attempts = new Map(); // attemptId -> attemptRecord
    this.edgeAttempts = new Map(); // edgeKey -> Array of attemptIds (retained event history)
    this.targetIndex = new Map(); // targetNodeId -> Set of attemptIds (O(1) candidate lookup)
    this.sourceIndex = new Map(); // sourceNodeId -> Set of attemptIds
    this.comparisonUniverse = new Set(); // Set of edgeKeys declared as universe of inquiry
  }

  registerNode(nodeId, metadata = {}, admitted = true) {
    const existing = this.nodes.get(nodeId);
    const now = new Date().toISOString();
    this.nodes.set(nodeId, {
      id: nodeId,
      admitted: Boolean(admitted),
      metadata,
      created_at: metadata.created_at || (existing ? existing.created_at : now),
      registered_at: existing ? existing.registered_at : now,
      updated_at: now,
    });
  }

  isNodeAdmitted(nodeId) {
    const n = this.nodes.get(nodeId);
    return Boolean(n && n.admitted);
  }

  getNode(nodeId) {
    return this.nodes.get(nodeId);
  }

  /**
   * Evaluates relation-specific temporal rules.
   */
  evaluateTemporalConstraint(temporalRule, fromNode, toNode) {
    if (!fromNode || !toNode || !fromNode.created_at || !toNode.created_at) {
      return { valid: true, classification: 'UNKNOWN_CHRONOLOGY' };
    }

    const srcTime = new Date(fromNode.created_at).getTime();
    const tgtTime = new Date(toNode.created_at).getTime();

    if (isNaN(srcTime) || isNaN(tgtTime)) {
      return { valid: true, classification: 'UNPARSABLE_CHRONOLOGY' };
    }

    const temporalDelta = tgtTime - srcTime;
    let classification = 'CONTEMPORANEOUS';
    if (temporalDelta > 0) {
      classification = 'LATER'; // target is later than source
    } else if (temporalDelta < 0) {
      classification = 'PREEXISTING'; // target is earlier than source
    }

    if (temporalRule === 'STRICTLY_FORWARD') {
      if (temporalDelta <= 0) {
        return {
          valid: false,
          classification,
          reason: 'FORWARD_ROUTING_CANNOT_ROUTE_TO_PREEXISTING_TARGET',
        };
      }
    } else if (temporalRule === 'PREEXISTING_OR_CONTEMPORANEOUS') {
      // Historical citation: a document cites work that ALREADY exists!
      if (temporalDelta > 0) {
        return {
          valid: false,
          classification,
          reason: 'ANACHRONISTIC_CITATION_TARGET_CREATED_AFTER_SOURCE',
        };
      }
    }

    return { valid: true, classification };
  }

  /**
   * Records an attempt under strict DEFAULT-DENY warrant contracts.
   */
  recordAttempt({
    from,
    to,
    relation_type,
    proposed_warrant,
    warrant_params = {},
    provenance = 'CUE_HARVEST',
    attempt_timestamp,
  }) {
    const edgeKey = `${from}->${to}:${relation_type}`;
    const timestamp = attempt_timestamp || new Date().toISOString();
    const attemptId = `att:${sha256(`${edgeKey}:${timestamp}:${this.attempts.size}`).slice(0, 16)}`;

    const fromNode = this.getNode(from);
    const toNode = this.getNode(to);

    const fromAdmitted = this.isNodeAdmitted(from);
    const toAdmitted = this.isNodeAdmitted(to);

    let state = RELATION_STATES.ADMITTED;
    let reason = 'ALL_ENDPOINTS_AND_WARRANT_CONTRACT_VERIFIED';
    let temporalClassification = 'UNKNOWN';

    // 1. Endpoint Admission Gates
    if (!fromAdmitted) {
      state = RELATION_STATES.ATTEMPTED_REJECTED;
      reason = `SOURCE_ENDPOINT_UNADMITTED: ${from}`;
    } else if (!toAdmitted) {
      if (toNode && toNode.metadata && toNode.metadata.expected_gap) {
        state = RELATION_STATES.AWAITING_UNRESOLVED_EXTERNAL;
        reason = `TARGET_EXPECTED_BUT_UNRESOLVED: ${to}`;
      } else {
        state = RELATION_STATES.ATTEMPTED_REJECTED;
        reason = `TARGET_ENDPOINT_UNADMITTED: ${to}`;
      }
    } else {
      // 2. DEFAULT-DENY Warrant Contract Lookup
      const contract = WARRANT_CONTRACTS[proposed_warrant];
      if (!contract) {
        state = RELATION_STATES.ATTEMPTED_REJECTED;
        reason = `UNRECOGNIZED_OR_FABRICATED_WARRANT_DENIED: ${proposed_warrant}`;
      } else if (!contract.allowed_relation_types.includes(relation_type)) {
        state = RELATION_STATES.ATTEMPTED_REJECTED;
        reason = `WARRANT_RELATION_MISMATCH: ${proposed_warrant} does not govern ${relation_type}`;
      } else {
        // 3. Relation-Specific Temporal Evaluation
        const chrono = this.evaluateTemporalConstraint(contract.temporal_rule, fromNode, toNode);
        temporalClassification = chrono.classification;

        if (!chrono.valid) {
          state = RELATION_STATES.ATTEMPTED_REJECTED;
          reason = chrono.reason;
        } else {
          // 4. Predicate Validation
          const val = contract.validate(warrant_params || {});

          if (!val.valid) {
            state = RELATION_STATES.ATTEMPTED_REJECTED;
            reason = val.reason;
          }
        }
      }
    }

    const attemptRecord = {
      attempt_id: attemptId,
      edge_key: edgeKey,
      from,
      to,
      relation_type,
      state,
      reason,
      proposed_warrant,
      temporal_classification: temporalClassification,
      admitted_warrant: state === RELATION_STATES.ADMITTED ? proposed_warrant : null,
      provenance,
      recorded_at: timestamp,
      history: [
        {
          transition: 'INITIAL_EVALUATION',
          state,
          reason,
          timestamp,
        },
      ],
    };

    this.attempts.set(attemptId, attemptRecord);

    if (!this.edgeAttempts.has(edgeKey)) {
      this.edgeAttempts.set(edgeKey, []);
    }
    this.edgeAttempts.get(edgeKey).push(attemptId);

    if (!this.targetIndex.has(to)) {
      this.targetIndex.set(to, new Set());
    }
    this.targetIndex.get(to).add(attemptId);

    if (!this.sourceIndex.has(from)) {
      this.sourceIndex.set(from, new Set());
    }
    this.sourceIndex.get(from).add(attemptId);

    return attemptRecord;
  }

  /**
   * Late admission of a previously missing node.
   * Separates PENDING_READJUDICATION from final ADMITTED state.
   * Strictly evaluates the Default-Deny warrant contract.
   */
  admitDelayedNode(nodeId, metadata = {}, warrantParamsMap = {}) {
    this.registerNode(nodeId, metadata, true);
    const toNode = this.getNode(nodeId);
    const now = new Date().toISOString();

    const candidateAttemptIds = this.targetIndex.get(nodeId);
    if (!candidateAttemptIds || candidateAttemptIds.size === 0) {
      return { candidates_evaluated: 0, admitted: [], retained_rejected: [] };
    }

    const admitted = [];
    const retainedRejected = [];

    for (const attemptId of candidateAttemptIds) {
      const attempt = this.attempts.get(attemptId);
      if (!attempt) continue;

      if (
        attempt.state !== RELATION_STATES.ATTEMPTED_REJECTED &&
        attempt.state !== RELATION_STATES.AWAITING_UNRESOLVED_EXTERNAL
      ) {
        continue;
      }

      // Transition to transitional PENDING_READJUDICATION state
      attempt.state = RELATION_STATES.PENDING_READJUDICATION;
      attempt.history.push({
        transition: 'ENTER_PENDING_READJUDICATION',
        state: RELATION_STATES.PENDING_READJUDICATION,
        reason: 'TARGET_NODE_ADMITTED_REOPENING_EVALUATION',
        timestamp: now,
      });

      const fromNode = this.getNode(attempt.from);
      const fromAdmitted = this.isNodeAdmitted(attempt.from);

      // 1. Source Admission Check
      if (!fromAdmitted) {
        attempt.state = RELATION_STATES.ATTEMPTED_REJECTED;
        attempt.reason = `SOURCE_ENDPOINT_STILL_UNADMITTED: ${attempt.from}`;
        attempt.history.push({
          transition: 'READJUDICATION_FAILED_SOURCE_UNADMITTED',
          state: attempt.state,
          reason: attempt.reason,
          timestamp: now,
        });
        retainedRejected.push(attempt);
        continue;
      }

      // 2. Default-Deny Warrant Lookup
      const contract = WARRANT_CONTRACTS[attempt.proposed_warrant];
      if (!contract) {
        attempt.state = RELATION_STATES.ATTEMPTED_REJECTED;
        attempt.reason = `UNRECOGNIZED_OR_FABRICATED_WARRANT_DENIED: ${attempt.proposed_warrant}`;
        attempt.history.push({
          transition: 'READJUDICATION_FAILED_UNKNOWN_WARRANT',
          state: attempt.state,
          reason: attempt.reason,
          timestamp: now,
        });
        retainedRejected.push(attempt);
        continue;
      }

      // 3. Relation-Specific Temporal Evaluation
      const chrono = this.evaluateTemporalConstraint(contract.temporal_rule, fromNode, toNode);
      attempt.temporal_classification = chrono.classification;

      if (!chrono.valid) {
        attempt.state = RELATION_STATES.ATTEMPTED_REJECTED;
        attempt.reason = chrono.reason;
        attempt.history.push({
          transition: 'READJUDICATION_FAILED_TEMPORAL_VIOLATION',
          state: attempt.state,
          reason: attempt.reason,
          timestamp: now,
        });
        retainedRejected.push(attempt);
        continue;
      }

      // 4. Predicate Validation
      const specificParams = warrantParamsMap[attempt.attempt_id] || {};
      const val = contract.validate(specificParams);

      if (!val.valid) {
        attempt.state = RELATION_STATES.ATTEMPTED_REJECTED;
        attempt.reason = val.reason;
        attempt.history.push({
          transition: 'READJUDICATION_FAILED_PREDICATE_REJECTED',
          state: attempt.state,
          reason: attempt.reason,
          timestamp: now,
        });
        retainedRejected.push(attempt);
        continue;
      }

      // All criteria verified -> Promoted to ADMITTED
      attempt.state = RELATION_STATES.ADMITTED;
      attempt.reason = 'TARGET_LATE_ADMITTED_AND_WARRANT_CONTRACT_VERIFIED';
      attempt.admitted_warrant = attempt.proposed_warrant;
      attempt.history.push({
        transition: 'PROMOTION_TO_ADMITTED',
        state: RELATION_STATES.ADMITTED,
        reason: attempt.reason,
        timestamp: now,
      });
      admitted.push(attempt);
    }

    return {
      candidates_evaluated: candidateAttemptIds.size,
      admitted,
      retained_rejected: retainedRejected,
    };
  }

  withdrawNode(nodeId, reason = 'EXPLICIT_SOURCE_WITHDRAWAL') {
    const node = this.nodes.get(nodeId);
    if (!node) return [];
    node.admitted = false;
    node.withdrawn_at = new Date().toISOString();

    const affectedAttempts = [];
    const sourceAttempts = this.sourceIndex.get(nodeId) || new Set();
    const targetAttempts = this.targetIndex.get(nodeId) || new Set();
    const allLinkedAttemptIds = new Set([...sourceAttempts, ...targetAttempts]);

    const now = new Date().toISOString();
    for (const attId of allLinkedAttemptIds) {
      const att = this.attempts.get(attId);
      if (att && att.state === RELATION_STATES.ADMITTED) {
        att.state = RELATION_STATES.WITHDRAWN_SCOPE_CHANGE;
        att.reason = `${reason}: dependent on withdrawn node ${nodeId}`;
        att.history.push({
          transition: 'WITHDRAWN_SCOPE_CHANGE',
          state: RELATION_STATES.WITHDRAWN_SCOPE_CHANGE,
          reason: att.reason,
          timestamp: now,
        });
        affectedAttempts.push(att);
      }
    }
    return affectedAttempts;
  }

  declareComparisonUniverse(potentialEdges) {
    for (const pe of potentialEdges) {
      const key = `${pe.from}->${pe.to}:${pe.relation_type}`;
      this.comparisonUniverse.add(key);
    }
  }

  getEpistemicStateCensus() {
    const counts = {};
    for (const s of Object.values(RELATION_STATES)) {
      counts[s] = 0;
    }

    for (const [edgeKey, attemptIds] of this.edgeAttempts.entries()) {
      const latestAttemptId = attemptIds[attemptIds.length - 1];
      const latestAttempt = this.attempts.get(latestAttemptId);
      if (latestAttempt) {
        counts[latestAttempt.state] = (counts[latestAttempt.state] || 0) + 1;
      }
    }

    let neverGeneratedCount = 0;
    for (const edgeKey of this.comparisonUniverse) {
      if (!this.edgeAttempts.has(edgeKey)) {
        neverGeneratedCount++;
      }
    }
    counts[RELATION_STATES.NEVER_GENERATED] = neverGeneratedCount;

    return {
      total_nodes: this.nodes.size,
      admitted_nodes: Array.from(this.nodes.values()).filter(n => n.admitted).length,
      withdrawn_nodes: Array.from(this.nodes.values()).filter(n => n.withdrawn_at).length,
      total_attempts_recorded: this.attempts.size,
      distinct_edges_attempted: this.edgeAttempts.size,
      comparison_universe_size: this.comparisonUniverse.size,
      counts_by_epistemic_state: counts,
    };
  }
}
