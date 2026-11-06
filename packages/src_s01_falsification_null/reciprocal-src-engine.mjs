/**
 * 𝌋 TD613 · SRC S-01 Reciprocal SRC–Encyclopedia Engine (Condition S3)
 * 
 * Integrated reciprocal research route between the SignalRupture Atelier
 * and the Empty Encyclopedia Receiver V3 with live feedback, dynamic two-phase
 * re-adjudication, and warrant-conditioned traversal.
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
  WARRANT_CONTRACTS,
} from '../src_reciprocal_expedition/shadow_graph/shadow_graph_engine_v3.mjs';

function sha256(data) {
  return crypto.createHash('sha256').update(String(data)).digest('hex');
}

export class ReciprocalSrcEngine {
  constructor(options = {}) {
    this.receiver = new EmptyEncyclopediaReceiverV3();
    this.receiver.initialize({ memory: true });
    this.shadowGraph = new BoundaryAttemptGraphV3();
    this.sourceRoots = new Map();
    this.tombstones = new Map();
    this.withdrawalLog = [];
    this.rules = new Map();
    this.inferredClaims = new Map();
    this.trajectoryEvents = [];
    this.options = options;
  }

  logTrajectory(eventType, details = {}) {
    this.trajectoryEvents.push({
      sequence: this.trajectoryEvents.length + 1,
      eventType,
      details,
      timestamp: new Date().toISOString(),
    });
  }

  admitSourceRoot({ rootId, text, metadata = {}, warrantParamsMap = {} }) {
    if (this.tombstones.has(rootId)) {
      throw new Error(`[ROOT_ID_PERMANENTLY_WITHDRAWN] Cannot re-admit withdrawn root ${rootId}`);
    }
    if (this.sourceRoots.has(rootId)) {
      throw new Error(`[ROOT_ID_ALREADY_EXISTS] Root ID ${rootId} is already admitted.`);
    }

    const utf8Buf = Buffer.from(text, 'utf8');
    const bytesSha256 = sha256(utf8Buf);

    const rootRecord = {
      rootId,
      text,
      bytesSha256,
      byteLength: utf8Buf.length,
      metadata: Object.freeze({ ...metadata }),
      status: 'ADMITTED',
      admittedAt: new Date().toISOString(),
    };

    this.sourceRoots.set(rootId, rootRecord);

    // Register node in Shadow Graph
    this.shadowGraph.registerNode(rootId, {
      created_at: metadata.created || rootRecord.admittedAt,
      ...metadata,
    }, true);

    // Ingest into receiver
    this.receiver.admitSource({
      source_id: rootId,
      declared_title: metadata.title || rootId,
      platform: metadata.platform || 'LOCAL_RESEARCH_SYNTHETIC',
      normalized_body: text,
      created_at: metadata.created || rootRecord.admittedAt,
    });

    this.logTrajectory('SOURCE_ROOT_ADMITTED', { rootId, bytesSha256 });

    // Reciprocal Phase: re-adjudicate any pending candidate edges waiting for this node!
    const newlyAdmitted = this.shadowGraph.admitDelayedNode(rootId, metadata, warrantParamsMap);
    if (newlyAdmitted && newlyAdmitted.admitted.length > 0) {
      this.logTrajectory('PENDING_EDGES_READJUDICATED', { rootId, count: newlyAdmitted.admitted.length });
    }

    return rootRecord;
  }

  admitDelayedNode(nodeId, metadata = {}, warrantParamsMap = {}) {
    const res = this.shadowGraph.admitDelayedNode(nodeId, metadata, warrantParamsMap);
    this.logTrajectory('DELAYED_NODE_ADMITTED', { nodeId, admittedCount: res.admitted.length });
    return res;
  }

  executeNativeProjective(documents, catalog = []) {
    const res = runProjectiveRouting(documents, catalog);
    this.logTrajectory('PROJECTIVE_ROUTING_EXECUTED', {
      cuesCount: res.cue_count,
      linksCount: res.candidate_link_count,
    });
    return res;
  }

  executeNativeTomography(liftCandidates) {
    const res = runPhase2Tomography(liftCandidates);
    this.logTrajectory('TOMOGRAPHY_EXECUTED', { candidateCount: res.candidate_count });
    return res;
  }

  executeNativeContextRoles(compilerInputs, recompilationEdges) {
    const res = runPhase2ContextRoles(compilerInputs, recompilationEdges);
    this.logTrajectory('CONTEXT_ROLES_EXECUTED', { roleCount: res.role_count });
    return res;
  }

  recordAttempt(params) {
    const res = this.shadowGraph.recordAttempt(params);
    this.logTrajectory('RELATION_ATTEMPT_RECORDED', {
      sourceId: params.source_id,
      targetId: params.target_id,
      relationType: params.relation_type,
      state: res.state,
    });
    return res;
  }

  registerRule(ruleId, ruleDef) {
    this.rules.set(ruleId, { ruleId, ...ruleDef });
    this.logTrajectory('RULE_REGISTERED', { ruleId });
  }

  computeLeastFixedPoint() {
    const P0 = new Map();
    for (const [rId, root] of this.sourceRoots.entries()) {
      if (root.status === 'ADMITTED') {
        P0.set(rId, {
          claimId: rId,
          sourceRootId: rId,
          type: 'ROOT_ASSERTION',
          grounded: true,
          derivationDepth: 0,
          parents: [],
        });
      }
    }

    const currentP = new Map(P0);
    let changed = true;
    let iteration = 0;
    const maxIterations = Math.max(1000, this.rules.size + 10);

    while (changed) {
      iteration++;
      if (iteration > maxIterations) {
        throw new Error(
          `[LFP_CONVERGENCE_INCOMPLETE_DEPTH_EXCEEDED] Least fixed point non-convergence after ${maxIterations} passes.`
        );
      }
      changed = false;

      for (const [rId, rule] of this.rules.entries()) {
        const { premises = [], conclusionId } = rule;
        const allPremisesSatisfied = premises.every(p => currentP.has(p));

        if (allPremisesSatisfied && !currentP.has(conclusionId)) {
          const maxParentDepth = Math.max(
            ...premises.map(p => currentP.get(p).derivationDepth)
          );
          currentP.set(conclusionId, {
            claimId: conclusionId,
            derivedViaRule: rId,
            derivationDepth: maxParentDepth + 1,
            parents: [...premises],
            grounded: true,
          });
          changed = true;
        }
      }
    }

    this.inferredClaims = currentP;
    this.logTrajectory('LFP_COMPUTED', { groundedClaimsCount: currentP.size, iterations: iteration });
    return currentP;
  }

  withdrawSourceRoot(rootId, reason = 'EXPLICIT_SOURCE_WITHDRAWAL') {
    const root = this.sourceRoots.get(rootId);
    if (!root) {
      throw new Error(`[SOURCE_ROOT_NOT_FOUND] Cannot withdraw unknown root ${rootId}`);
    }

    const priorLFP = this.computeLeastFixedPoint();
    root.status = 'WITHDRAWN';
    this.sourceRoots.delete(rootId);

    const newLFP = this.computeLeastFixedPoint();
    const invalidated = [];
    for (const [cId, claim] of priorLFP.entries()) {
      if (!newLFP.has(cId)) {
        invalidated.push(cId);
      }
    }

    const prevTombstoneSha =
      this.withdrawalLog.length > 0
        ? this.withdrawalLog[this.withdrawalLog.length - 1].tombstoneSha256
        : '0000000000000000000000000000000000000000000000000000000000000000';

    const timestamp = new Date().toISOString();
    const tombstonePayload = JSON.stringify({
      sequence: this.withdrawalLog.length + 1,
      rootId,
      rootBytesSha256: root.bytesSha256,
      reason,
      invalidatedCount: invalidated.length,
      invalidatedClaims: invalidated,
      timestamp,
      previousTombstoneSha: prevTombstoneSha,
    });
    const tombstoneSha256 = sha256(tombstonePayload);

    const tombstoneRecord = Object.freeze({
      sequence: this.withdrawalLog.length + 1,
      rootId,
      rootBytesSha256: root.bytesSha256,
      reason,
      invalidatedClaims: Object.freeze(invalidated),
      timestamp,
      previousTombstoneSha: prevTombstoneSha,
      tombstoneSha256,
    });

    this.tombstones.set(rootId, tombstoneRecord);
    this.withdrawalLog.push(tombstoneRecord);

    this.logTrajectory('SOURCE_ROOT_WITHDRAWN', { rootId, invalidatedCount: invalidated.length });
    return tombstoneRecord;
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
    // 1. Compute groundability closure
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

    // 2. Identify ungrounded rules and detect cycles
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
}
