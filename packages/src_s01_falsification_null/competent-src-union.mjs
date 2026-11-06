/**
 * 𝌋 TD613 · SRC S-01 Competent Native-Method Union Comparator (Condition S2)
 * 
 * A competently equipped comparator combining the native SignalRupture methods
 * and the Empty Encyclopedia Receiver V3 without reciprocal feedback loops.
 * 
 * Equipped with:
 * - Native projective routing & lexical explore cue matching
 * - Native phase 2 tomography (score refusal enforced)
 * - Native contextual role assertions (intrinsic typing prohibited)
 * - Empty Encyclopedia Receiver V3 (fatal UTF-8, span validation, relational store)
 * - Boundary Attempt Graph V3 (rejected attempt retention, default-deny)
 * - Monotone Least Fixed Point (dynamic depth bound, fail-closed non-convergence)
 * - Immutable source root registry & tombstone reuse prohibition
 * - Tamper-evident cryptographic SHA-256 hash-chained withdrawal ledger
 * - Conjunctive cycle detection with groundability closure
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

function sha256(data) {
  return crypto.createHash('sha256').update(String(data)).digest('hex');
}

export class CompetentSrcUnionComparator {
  constructor(options = {}) {
    this.receiver = new EmptyEncyclopediaReceiverV3();
    this.receiver.initialize({ memory: true });
    this.shadowGraph = new BoundaryAttemptGraphV3();
    this.sourceRoots = new Map();
    this.tombstones = new Map();
    this.withdrawalLog = [];
    this.rules = new Map();
    this.inferredClaims = new Map();
    this.options = options;
  }

  admitSourceRoot({ rootId, text, metadata = {} }) {
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

    return rootRecord;
  }

  executeNativeProjective(documents, catalog = []) {
    return runProjectiveRouting(documents, catalog);
  }

  executeNativeTomography(liftCandidates) {
    return runPhase2Tomography(liftCandidates);
  }

  executeNativeContextRoles(compilerInputs, recompilationEdges) {
    return runPhase2ContextRoles(compilerInputs, recompilationEdges);
  }

  recordAttempt(params) {
    return this.shadowGraph.recordAttempt(params);
  }

  admitDelayedNode(nodeId, metadata = {}, warrantParamsMap = {}) {
    return this.shadowGraph.admitDelayedNode(nodeId, metadata, warrantParamsMap);
  }

  registerRule(ruleId, ruleDef) {
    this.rules.set(ruleId, { ruleId, ...ruleDef });
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

    // Tarjan or DFS cycle check
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

    return {
      hasCycle: circularNodes.size > 0,
      circularNodes: Array.from(circularNodes),
      ungroundedCount: ungroundedRules.length,
    };
  }
}
