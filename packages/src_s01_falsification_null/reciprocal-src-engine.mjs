/**
 * 𝌋 TD613 · Reciprocal SRC–Encyclopedia Engine (Condition S3 Candidate)
 * 
 * Candidate reciprocal architecture coupling:
 * 1. Pinned Native SRC Methods
 * 2. SQLite / Relational State Store (EmptyEncyclopediaReceiverV3)
 * 3. Monotone Least Fixed Point (LFP) Claim Grounding
 * 4. Dual-State Shadow Graph (Admitted vs Rejected attempts)
 * 5. UTF-8 Byte Span Validation & Chronological Precedence Guards
 * 6. Lineage Hash Verification & Tombstoned Non-Retroactive Withdrawal
 * 7. Real-Time Dynamic Re-adjudication & Trajectory Event Telemetry
 * 8. Canonical Terminal Graph Extraction & Resource Instrumentation
 * 
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import crypto from 'node:crypto';
import {
  runProjectiveRouting,
  runPhase2Tomography,
  runPhase2ContextRoles,
  runNativeQuery,
} from '../src_reciprocal_expedition/native_atlas/src-native-methods.mjs';
import {
  EmptyEncyclopediaReceiverV3,
} from '../src_reciprocal_expedition/receiver/empty-encyclopedia-receiver-v3.mjs';
import {
  BoundaryAttemptGraphV3,
  RELATION_STATES,
} from '../src_reciprocal_expedition/shadow_graph/shadow_graph_engine_v3.mjs';

function sha256(str) {
  return crypto.createHash('sha256').update(str, 'utf8').digest('hex');
}

export class ReciprocalSrcEngine {
  constructor() {
    this.receiver = new EmptyEncyclopediaReceiverV3({ databasePath: ':memory:' });
    this.receiver.initialize({ memory: true });
    this.shadowGraph = new BoundaryAttemptGraphV3();
    this.sourceRoots = new Map();
    this.rules = new Map();
    this.tombstones = new Map();
    this.withdrawalLog = [];
    this.trajectoryEvents = [];
    this.resourceCounters = {
      iterations_count: 0,
      source_reads_count: 0,
      events_processed_count: 0,
      readjudication_cycles_count: 0,
      execution_duration_ms: 0,
    };
  }

  logTrajectory(eventType, eventData) {
    this.trajectoryEvents.push({
      sequence: this.trajectoryEvents.length + 1,
      eventType,
      eventData,
      timestamp: new Date().toISOString(),
    });
    this.resourceCounters.events_processed_count++;
  }

  // 1. Native SRC Method Wrappers
  executeNativeProjective(docs, options = {}) {
    this.resourceCounters.source_reads_count += docs.length;
    this.logTrajectory('NATIVE_PROJECTIVE_INVOKED', { docCount: docs.length });
    const res = runProjectiveRouting(docs, options);
    // Align with Python native numeral stripping in CH-02
    if (res && res.cues) {
      for (const cue of res.cues) {
        if (cue.normalized_target) {
          cue.normalized_target = cue.normalized_target.replace(/\s+(iv|v|vi|vii|viii|ix|x|\d+)$/i, '').trim();
        }
      }
    }
    return res;
  }

  executeNativeTomography(liftTransformations, options = {}) {
    this.resourceCounters.source_reads_count += liftTransformations.length;
    this.logTrajectory('NATIVE_TOMOGRAPHY_INVOKED', { liftCount: liftTransformations.length });
    return runPhase2Tomography(liftTransformations, options);
  }

  executeNativeContextRoles(inputs, declaredContexts = []) {
    this.resourceCounters.source_reads_count += inputs.length;
    this.logTrajectory('NATIVE_CONTEXT_ROLES_INVOKED', { inputCount: inputs.length });
    return runPhase2ContextRoles(inputs, declaredContexts);
  }

  executeNativeQuery(params) {
    this.resourceCounters.source_reads_count++;
    this.logTrajectory('NATIVE_QUERY_INVOKED', { action: params.action });
    return runNativeQuery(params);
  }

  // 2. Relational & Shadow Graph Operations
  recordAttempt(params) {
    const res = this.shadowGraph.recordAttempt(params);
    this.logTrajectory('RELATION_ATTEMPT_RECORDED', {
      from: params.from,
      to: params.to,
      type: params.relation_type,
      state: res.state,
      reason: res.reason,
    });
    return res;
  }

  admitDelayedTarget(nodeId, metadata = {}, warrantParamsMap = {}) {
    this.admitSourceRoot({
      rootId: nodeId,
      text: metadata.text || `# Node ${nodeId}`,
      metadata,
      warrantParamsMap,
    });
    this.shadowGraph.admitDelayedNode(nodeId, metadata, warrantParamsMap);
    this.logTrajectory('DELAYED_TARGET_READJUDICATED', { nodeId });
    this.resourceCounters.readjudication_cycles_count++;
  }

  // 3. Source Root Admission & Custody
  admitSourceRoot({ rootId, text, metadata = {}, warrantParamsMap = {} }) {
    this.resourceCounters.source_reads_count++;
    if (this.tombstones.has(rootId)) {
      throw new Error(`[FAIL_CLOSED] ROOT_ID_PERMANENTLY_WITHDRAWN: Root ${rootId} cannot be re-admitted.`);
    }
    if (this.sourceRoots.has(rootId)) {
      const existing = this.sourceRoots.get(rootId);
      if (existing.status === 'WITHDRAWN') {
        throw new Error(`[FAIL_CLOSED] ROOT_ID_PERMANENTLY_WITHDRAWN: Root ${rootId} has been withdrawn.`);
      }
      return existing;
    }

    const byteDigest = sha256(text);
    const rootRecord = {
      rootId,
      text,
      byteDigest,
      metadata: Object.freeze({ ...metadata }),
      admittedAt: new Date().toISOString(),
      status: 'ADMITTED',
    };

    this.sourceRoots.set(rootId, rootRecord);

    try {
      this.receiver.admitSource({
        source_id: rootId,
        source_uri: `fixture://src/${rootId}`,
        body_text: text,
        declared_sha256: byteDigest,
        content_type: 'text/markdown; charset=utf-8',
        acquired_date: metadata.created || new Date().toISOString(),
        provenance_summary: metadata.title || 'Provenance Root',
      });
    } catch {
      // Receiver may enforce distinct constraints
    }

    this.shadowGraph.registerNode(rootId, {
      title: metadata.title,
      created_at: metadata.created || new Date().toISOString(),
      sha256: byteDigest,
    }, true);

    this.logTrajectory('SOURCE_ROOT_ADMITTED', { rootId, byteDigest });

    // Automatic re-adjudication check
    const candidateAttemptIds = this.shadowGraph.targetIndex.get(rootId);
    if (candidateAttemptIds && candidateAttemptIds.size > 0) {
      const readjResult = this.shadowGraph.admitDelayedNode(rootId, metadata, warrantParamsMap);
      this.logTrajectory('DYNAMIC_READJUDICATION_TRIGGERED', {
        rootId,
        readjudicatedCount: candidateAttemptIds.size,
        admittedCount: readjResult.admitted.length,
      });
      this.resourceCounters.readjudication_cycles_count++;
    }

    return rootRecord;
  }

  registerRule(ruleId, ruleDef) {
    this.rules.set(ruleId, Object.freeze({ ruleId, ...ruleDef }));
    this.logTrajectory('RULE_REGISTERED', { ruleId, conclusion: ruleDef.conclusionId });
  }

  // 4. Monotone Least Fixed Point
  computeLeastFixedPoint(maxIterations = 50) {
    const grounded = new Map();
    for (const [rootId, root] of this.sourceRoots.entries()) {
      if (root.status === 'ADMITTED') {
        grounded.set(rootId, {
          claimId: rootId,
          grounded: true,
          derivationDepth: 0,
          sourceRoots: [rootId],
          warrant: 'AXIOMATIC_SOURCE_ROOT',
        });
      }
    }

    let iterations = 0;
    let progress = true;

    while (progress && iterations < maxIterations) {
      this.resourceCounters.iterations_count++;
      progress = false;
      iterations++;

      for (const [ruleId, rule] of this.rules.entries()) {
        const { premises = [], conclusionId, warrant = 'CONSTRUCTIVE_MODUS_PONENS' } = rule;
        if (grounded.has(conclusionId)) continue;

        const allPremisesGrounded = premises.every(p => grounded.has(p));
        if (allPremisesGrounded) {
          const premiseRecords = premises.map(p => grounded.get(p));
          const maxDepth = premiseRecords.reduce((max, r) => Math.max(max, r.derivationDepth), 0);
          const roots = Array.from(new Set(premiseRecords.flatMap(r => r.sourceRoots)));

          grounded.set(conclusionId, {
            claimId: conclusionId,
            grounded: true,
            derivationDepth: maxDepth + 1,
            sourceRoots: roots,
            warrant,
            derivedViaRule: ruleId,
          });
          progress = true;
          this.logTrajectory('CLAIM_GROUNDED_IN_LFP', { conclusionId, derivationDepth: maxDepth + 1, ruleId });
        }
      }
    }

    grounded.iteration_exhausted = progress && iterations >= maxIterations;
    grounded.completed_iterations = iterations;
    this.logTrajectory('LFP_CLOSURE_COMPLETED', { totalGrounded: grounded.size, iterations });
    return grounded;
  }

  // 5. Source Root Withdrawal & Dynamic Cascading Invalidation
  withdrawSourceRoot(rootId, reason = 'EXPLICIT_SOURCE_WITHDRAWAL') {
    const root = this.sourceRoots.get(rootId);
    if (!root || root.status === 'WITHDRAWN') {
      throw new Error(`[WITHDRAWAL_ERROR] Root ${rootId} does not exist or is already withdrawn.`);
    }

    root.status = 'WITHDRAWN';

    const affectedClaims = new Set();
    const queue = [rootId];

    while (queue.length > 0) {
      const current = queue.shift();
      for (const [ruleId, rule] of this.rules.entries()) {
        if (rule.premises && rule.premises.includes(current)) {
          if (!affectedClaims.has(rule.conclusionId)) {
            affectedClaims.add(rule.conclusionId);
            queue.push(rule.conclusionId);
          }
        }
      }
    }

    const previousSha = this.withdrawalLog.length > 0
      ? this.withdrawalLog[this.withdrawalLog.length - 1].tombstoneSha256
      : '0000000000000000000000000000000000000000000000000000000000000000';

    const timestamp = new Date().toISOString();
    const invalidatedClaimsList = Array.from(affectedClaims).sort();
    const payload = JSON.stringify({
      sequence: this.withdrawalLog.length + 1,
      rootId,
      rootBytesSha256: root.byteDigest,
      reason,
      invalidatedCount: invalidatedClaimsList.length,
      invalidatedClaims: invalidatedClaimsList,
      timestamp,
      previousTombstoneSha: previousSha,
    });
    const tombstoneSha256 = sha256(payload);

    const tombstone = Object.freeze({
      tombstoneId: `tombstone-${rootId}-${Date.now()}`,
      sequence: this.withdrawalLog.length + 1,
      rootId,
      rootBytesSha256: root.byteDigest,
      reason,
      invalidatedClaims: invalidatedClaimsList,
      timestamp,
      previousTombstoneSha: previousSha,
      tombstoneSha256,
    });

    this.tombstones.set(rootId, tombstone);
    this.withdrawalLog.push(tombstone);
    this.logTrajectory('SOURCE_ROOT_WITHDRAWN', { rootId, invalidatedCount: invalidatedClaimsList.length });
    return tombstone;
  }

  verifyWithdrawalLedgerIntegrity() {
    let prevSha = '0000000000000000000000000000000000000000000000000000000000000000';
    for (let i = 0; i < this.withdrawalLog.length; i++) {
      const entry = this.withdrawalLog[i];
      if (entry.sequence !== i + 1) return false;
      if (entry.previousTombstoneSha !== prevSha) return false;

      const payload = JSON.stringify({
        sequence: entry.sequence,
        rootId: entry.rootId,
        rootBytesSha256: entry.rootBytesSha256,
        reason: entry.reason,
        invalidatedCount: entry.invalidatedClaims.length,
        invalidatedClaims: entry.invalidatedClaims,
        timestamp: entry.timestamp,
        previousTombstoneSha: entry.previousTombstoneSha,
      });
      if (sha256(payload) !== entry.tombstoneSha256) return false;
      prevSha = entry.tombstoneSha256;
    }
    return true;
  }

  detectConjunctiveCircularity() {
    const groundable = new Set();
    for (const [rId, root] of this.sourceRoots.entries()) {
      if (root.status === 'ADMITTED') groundable.add(rId);
    }

    let progress = true;
    while (progress) {
      progress = false;
      for (const [rId, rule] of this.rules.entries()) {
        const { premises = [], conclusionId } = rule;
        if (premises.every(p => groundable.has(p)) && !groundable.has(conclusionId)) {
          groundable.add(conclusionId);
          progress = true;
        }
      }
    }

    const ungroundedRules = [];
    for (const [rId, rule] of this.rules.entries()) {
      if (!groundable.has(rule.conclusionId)) {
        ungroundedRules.push(rule);
      }
    }

    const ungroundedEdges = new Map();
    for (const rule of ungroundedRules) {
      for (const p of rule.premises) {
        if (!ungroundedEdges.has(p)) ungroundedEdges.set(p, new Set());
        ungroundedEdges.get(p).add(rule.conclusionId);
      }
    }

    const visited = new Set();
    const recStack = new Set();
    const circularNodes = new Set();

    const dfs = node => {
      visited.add(node);
      recStack.add(node);

      const neighbors = ungroundedEdges.get(node) || [];
      for (const n of neighbors) {
        if (!visited.has(n)) {
          if (dfs(n)) return true;
        } else if (recStack.has(n)) {
          circularNodes.add(n);
          circularNodes.add(node);
          return true;
        }
      }
      recStack.delete(node);
      return false;
    };

    for (const node of ungroundedEdges.keys()) {
      if (!visited.has(node)) dfs(node);
    }

    const result = {
      hasCycle: circularNodes.size > 0,
      circularNodes: Array.from(circularNodes),
      ungroundedCount: ungroundedRules.length,
    };

    this.logTrajectory('CIRCULARITY_CHECKED', result);
    return result;
  }

  // 6. Canonical Terminal Graph Extractor (SRC-R03)
  exportCanonicalTerminalGraph() {
    const nodes = [];
    for (const [nId, n] of this.shadowGraph.nodes.entries()) {
      nodes.push({ id: nId, type: n.node_type || 'DOCUMENT', admitted: n.admitted });
    }
    nodes.sort((a, b) => a.id.localeCompare(b.id));

    const edges = [];
    for (const [edgeKey, aIds] of this.shadowGraph.edgeAttempts.entries()) {
      const lastAttempt = this.shadowGraph.attempts.get(aIds[aIds.length - 1]);
      if (lastAttempt && lastAttempt.state === RELATION_STATES.ADMITTED) {
        edges.push({
          edgeKey,
          from: lastAttempt.from,
          to: lastAttempt.to,
          relation_type: lastAttempt.relation_type,
          warrant: lastAttempt.warrant,
        });
      }
    }
    edges.sort((a, b) => a.edgeKey.localeCompare(b.edgeKey));

    const roots = [];
    for (const [rId, r] of this.sourceRoots.entries()) {
      roots.push({
        rootId: rId,
        byteDigest: r.byteDigest,
        status: r.status,
      });
    }
    roots.sort((a, b) => a.rootId.localeCompare(b.rootId));

    const rejections = [];
    for (const [aId, a] of this.shadowGraph.attempts.entries()) {
      if (a.state === RELATION_STATES.ATTEMPTED_REJECTED) {
        rejections.push({
          attemptId: aId,
          from: a.from,
          to: a.to,
          relation_type: a.relation_type,
          reason: a.reason,
        });
      }
    }
    rejections.sort((a, b) => a.attemptId.localeCompare(b.attemptId));

    const pendingAttempts = Array.from(this.shadowGraph.attempts.values()).filter(a => a.state === RELATION_STATES.PENDING_READJUDICATION);

    return Object.freeze({
      nodes,
      edges,
      roots,
      rejections,
      unresolvedCount: pendingAttempts.length,
      canonicalDigest: sha256(JSON.stringify({ nodes, edges, roots, rejections })),
    });
  }
}
