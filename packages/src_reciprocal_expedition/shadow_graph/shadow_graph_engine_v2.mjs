/**
 * 𝌋 TD613 · Boundary Attempt Graph (Shadow Graph Engine v2)
 * 
 * Safe, High-Fidelity Implementation addressing Review Finding A-S2-F05:
 * 1. Target-keyed index (this.targetIndex) for O(1) candidate lookup in admitDelayedNode,
 *    distinguishing lookup from O(k) processing of k recovered edges.
 * 2. Strict explicit state transition authority: Forbids auto-promotion of rejected attempts.
 *    Re-evaluates full warrant, non-retroactivity chronology, and source admission.
 *    Rejected citations with invalid chronology or missing evidence warrant REMAIN REJECTED.
 * 3. Immutable attempt records with complete history: Does not overwrite edge maps on subsequent attempts.
 * 4. Declared comparison universe: Formally instantiates and measures NEVER_GENERATED relations.
 */

import crypto from 'node:crypto';

export const RELATION_STATES = {
  ADMITTED: 'ADMITTED',
  ATTEMPTED_REJECTED: 'ATTEMPTED_REJECTED',
  NEVER_GENERATED: 'NEVER_GENERATED',
  WITHHELD_LACK_OF_EVIDENCE: 'WITHHELD_LACK_OF_EVIDENCE',
  WITHDRAWN_SCOPE_CHANGE: 'WITHDRAWN_SCOPE_CHANGE',
  AWAITING_UNRESOLVED_EXTERNAL: 'AWAITING_UNRESOLVED_EXTERNAL',
};

function sha256(data) {
  return crypto.createHash('sha256').update(String(data)).digest('hex');
}

export class BoundaryAttemptGraphV2 {
  constructor() {
    this.nodes = new Map(); // nodeId -> { id, admitted, metadata, created_at, registered_at }
    this.attempts = new Map(); // attemptId -> attemptRecord
    this.edgeAttempts = new Map(); // edgeKey -> Array of attemptIds (preserves full history without overwriting)
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
   * Records an attempt to establish a research relation between two nodes.
   * Preserves attempt history without overwriting previous attempts for the same edge.
   */
  recordAttempt({ from, to, relation_type, proposed_warrant, provenance = 'CUE_HARVEST', attempt_timestamp }) {
    const edgeKey = `${from}->${to}:${relation_type}`;
    const timestamp = attempt_timestamp || new Date().toISOString();
    const attemptId = `att:${sha256(`${edgeKey}:${timestamp}:${this.attempts.size}`).slice(0, 16)}`;

    const fromNode = this.getNode(from);
    const toNode = this.getNode(to);

    const fromAdmitted = this.isNodeAdmitted(from);
    const toAdmitted = this.isNodeAdmitted(to);

    let state = RELATION_STATES.ADMITTED;
    let reason = 'ALL_ENDPOINTS_AND_CRITERIA_VERIFIED';

    // Chronology evaluation
    let chronologicalViolation = false;
    if (fromNode && toNode && fromNode.created_at && toNode.created_at) {
      const srcTime = new Date(fromNode.created_at).getTime();
      const tgtTime = new Date(toNode.created_at).getTime();
      if (!isNaN(srcTime) && !isNaN(tgtTime) && tgtTime <= srcTime) {
        chronologicalViolation = true;
      }
    }

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
    } else if (chronologicalViolation || proposed_warrant === 'PREEXISTING_CHRONOLOGY') {
      state = RELATION_STATES.ATTEMPTED_REJECTED;
      reason = 'CHRONOLOGICAL_INVERSION_BLOCKED';
    } else if (proposed_warrant === 'UNWARRANTED_NOISE') {
      state = RELATION_STATES.ATTEMPTED_REJECTED;
      reason = 'UNWARRANTED_COOCCURRENCE_REJECTED';
    } else if (proposed_warrant === 'BELOW_EVIDENCE_CEILING') {
      state = RELATION_STATES.WITHHELD_LACK_OF_EVIDENCE;
      reason = 'INSUFFICIENT_EVIDENCE_FOR_ADMISSION';
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

    // Store in immutable attempt store
    this.attempts.set(attemptId, attemptRecord);

    // Multi-attempt history per edgeKey (NO OVERWRITING)
    if (!this.edgeAttempts.has(edgeKey)) {
      this.edgeAttempts.set(edgeKey, []);
    }
    this.edgeAttempts.get(edgeKey).push(attemptId);

    // Maintain O(1) indices
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
   * Performs O(1) lookup of target candidate attempts, followed by O(k) rigorous re-evaluation
   * of the k candidates.
   * 
   * CRITICAL INVARIANT: Rejects auto-promotion. Chronological inversion or invalid warrant
   * must remain rejected even after target admission.
   */
  admitDelayedNode(nodeId, metadata = {}) {
    this.registerNode(nodeId, metadata, true);
    const toNode = this.getNode(nodeId);
    const now = new Date().toISOString();

    // O(1) candidate lookup via targetIndex
    const candidateAttemptIds = this.targetIndex.get(nodeId);
    if (!candidateAttemptIds || candidateAttemptIds.size === 0) {
      return { candidates_evaluated: 0, admitted: [], retained_rejected: [] };
    }

    const admitted = [];
    const retainedRejected = [];

    // O(k) evaluation of candidate attempts
    for (const attemptId of candidateAttemptIds) {
      const attempt = this.attempts.get(attemptId);
      if (!attempt) continue;

      // Only re-evaluate attempts that were waiting or rejected due to unadmitted endpoint
      if (
        attempt.state !== RELATION_STATES.ATTEMPTED_REJECTED &&
        attempt.state !== RELATION_STATES.AWAITING_UNRESOLVED_EXTERNAL
      ) {
        continue;
      }

      const fromNode = this.getNode(attempt.from);
      const fromAdmitted = this.isNodeAdmitted(attempt.from);

      // Re-evaluate Source Admission
      if (!fromAdmitted) {
        attempt.reason = `SOURCE_ENDPOINT_STILL_UNADMITTED: ${attempt.from}`;
        attempt.history.push({
          transition: 'RE_EVALUATION_SOURCE_UNADMITTED',
          state: attempt.state,
          reason: attempt.reason,
          timestamp: now,
        });
        retainedRejected.push(attempt);
        continue;
      }

      // Re-evaluate Chronological Non-Retroactivity (t_target > t_source)
      let chronoViolation = false;
      if (fromNode && toNode && fromNode.created_at && toNode.created_at) {
        const sTime = new Date(fromNode.created_at).getTime();
        const tTime = new Date(toNode.created_at).getTime();
        if (!isNaN(sTime) && !isNaN(tTime) && tTime <= sTime) {
          chronoViolation = true;
        }
      }

      if (chronoViolation || attempt.proposed_warrant === 'PREEXISTING_CHRONOLOGY') {
        attempt.state = RELATION_STATES.ATTEMPTED_REJECTED;
        attempt.reason = 'CHRONOLOGICAL_INVERSION_BLOCKED_ON_LATE_ADMISSION';
        attempt.history.push({
          transition: 'RE_EVALUATION_CHRONOLOGY_BLOCKED',
          state: RELATION_STATES.ATTEMPTED_REJECTED,
          reason: attempt.reason,
          timestamp: now,
        });
        retainedRejected.push(attempt);
        continue;
      }

      // Re-evaluate Warrant Validity (Reject noise and insufficient evidence)
      if (attempt.proposed_warrant === 'UNWARRANTED_NOISE') {
        attempt.state = RELATION_STATES.ATTEMPTED_REJECTED;
        attempt.reason = 'UNWARRANTED_NOISE_REMAINS_REJECTED';
        attempt.history.push({
          transition: 'RE_EVALUATION_NOISE_REJECTED',
          state: RELATION_STATES.ATTEMPTED_REJECTED,
          reason: attempt.reason,
          timestamp: now,
        });
        retainedRejected.push(attempt);
        continue;
      }

      if (attempt.proposed_warrant === 'BELOW_EVIDENCE_CEILING') {
        attempt.state = RELATION_STATES.WITHHELD_LACK_OF_EVIDENCE;
        attempt.reason = 'INSUFFICIENT_EVIDENCE_REMAINS_WITHHELD';
        attempt.history.push({
          transition: 'RE_EVALUATION_WITHHELD',
          state: RELATION_STATES.WITHHELD_LACK_OF_EVIDENCE,
          reason: attempt.reason,
          timestamp: now,
        });
        retainedRejected.push(attempt);
        continue;
      }

      // If all checks pass (source admitted, target admitted, valid chronology, valid warrant)
      attempt.state = RELATION_STATES.ADMITTED;
      attempt.reason = 'TARGET_LATE_ADMITTED_AND_ALL_CRITERIA_VERIFIED';
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

  /**
   * Declares a ground-truth universe of inquiry to measure NEVER_GENERATED relations.
   */
  declareComparisonUniverse(potentialEdges) {
    for (const pe of potentialEdges) {
      const key = `${pe.from}->${pe.to}:${pe.relation_type}`;
      this.comparisonUniverse.add(key);
    }
  }

  /**
   * Computes exact edge counts across all 6 epistemic relation states.
   */
  getEpistemicStateCensus() {
    const counts = {};
    for (const s of Object.values(RELATION_STATES)) {
      counts[s] = 0;
    }

    // 1. Count attempts by their current effective state
    // To avoid double-counting multi-attempts of the same edgeKey, evaluate effective latest state per edge
    for (const [edgeKey, attemptIds] of this.edgeAttempts.entries()) {
      const latestAttemptId = attemptIds[attemptIds.length - 1];
      const latestAttempt = this.attempts.get(latestAttemptId);
      if (latestAttempt) {
        counts[latestAttempt.state] = (counts[latestAttempt.state] || 0) + 1;
      }
    }

    // 2. Count relations in comparison universe that were NEVER_GENERATED
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
