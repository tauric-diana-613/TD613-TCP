/**
 * 𝌋 TD613 · Competent Strong-Union Comparator (V2)
 * 
 * Version 2 Equalized Null Condition for the Manifest Reciprocal Warrant Gate.
 * Equalizes the Strong Union condition by providing the identical mathematical and
 * algorithmic facilities previously provided exclusively to the Manifest condition:
 * 
 * 1. Source-rooted least-fixed-point (LFP) reasoning (P0 := authenticated roots; P* := lfp(T)).
 * 2. Acquisition-lineage deduplication (mapping duplicate records to shared acquisition IDs).
 * 3. Dependency and conjunction tracking (multi-premise conjunctive rules vs independent corroboration).
 * 4. History-preserving source withdrawal with dynamic cascading invalidation and tombstone logging.
 * 5. Seal and live source-byte verification (epoch handles and live query-time byte verification).
 * 6. Circular citation detection (isolating unrooted mutual citation cycles from P*).
 * 7. Equal access to identical permitted records, metadata bounds, and methodological resources.
 * 
 * Null Hypothesis:
 * Manifest's observed research capability can be reproduced by a competently equipped union
 * of its constituent methods.
 * 
 * Authority: SAC[X6ZNK5NO51]
 * Covenant: Khona‌lit-po (literal U+200C interior retained)
 */

import crypto from 'node:crypto';
import { WendbineEmptyEncyclopediaReceiver } from '../wendbine_reciprocal_expedition/receiver/wendbine-empty-receiver.mjs';
import { UniversalAtelierReceiver } from '../universal_atelier/receiver/universal-atelier-receiver.mjs';
import { openBoundEpoch, queryBoundEpoch } from '../wendbine_reciprocal_expedition/wendbine-sourcebound-epoch.mjs';

export function sha256(data) {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'utf8');
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export class CompetentStrongUnionComparator {
  constructor({
    comparatorId = 'td613.competent-strong-union/v2',
    epochSnapshotId = null,
  } = {}) {
    this.comparatorId = comparatorId;
    this.epochSnapshotId = epochSnapshotId || `csu_epoch_${Date.now()}`;
    this.stateVersion = 1;

    // Integrated receivers
    this.wendbineReceiver = new WendbineEmptyEncyclopediaReceiver();
    this.universalReceiver = new UniversalAtelierReceiver();

    // Equalized Algorithmic State
    this.roots = new Map();           // root_id -> RootRecord (P0 seeds)
    this.records = new Map();         // record_id -> RecordMetadata
    this.derivationRules = new Map(); // rule_id -> DerivationRule
    this.claims = new Map();          // claim_id -> UnionClaim
    this.withdrawalLog = [];          // Immutable audit trail of withdrawals
    this.boundEpochs = new Map();     // handle -> EpochBinding
  }

  // =========================================================================
  // 1. Seal & Source-Byte Verification (Query-time integrity check)
  // =========================================================================
  bindEpoch({ rootPath, snapshotId, sealId }) {
    const binding = openBoundEpoch({
      wendbineRoot: rootPath,
      snapshotId,
      expectedSealId: sealId,
    });
    this.boundEpochs.set(binding.epochHandle, binding);
    return binding;
  }

  verifyEpochBytes(epochHandle, relativeFilePath) {
    if (!epochHandle || !this.boundEpochs.has(epochHandle)) {
      throw new Error('FORGED_OR_UNBOUND_EPOCH: Handle not recognized in epoch registry.');
    }
    const binding = this.boundEpochs.get(epochHandle);
    return queryBoundEpoch({
      epochHandle,
      relativeFilePath,
    });
  }

  // =========================================================================
  // 2. Source Admission & Root Grounding (P0)
  // =========================================================================
  admitSourceRoot({
    root_id,
    source_id,
    raw_bytes,
    lineage = {},
    evidence_class = 'SOURCE_EXPLICIT_OR_DIRECT_PARAPHRASE',
    acquisition_id = null,
  }) {
    if (!root_id || !source_id) {
      throw new Error('ROOT_AND_SOURCE_ID_REQUIRED');
    }

    // Source-custody wall: prevent overwriting or resurrecting withdrawn roots
    if (this.roots.has(root_id)) {
      const existing = this.roots.get(root_id);
      if (existing.status === 'WITHDRAWN' || existing.status === 'SUPERSEDED') {
        throw new Error(`ROOT_ID_PERMANENTLY_WITHDRAWN: Source root '${root_id}' was withdrawn and cannot be re-admitted or resurrected.`);
      }
      throw new Error(`ROOT_ID_ALREADY_EXISTS: Source root '${root_id}' is already admitted and cannot be overwritten.`);
    }
    if (this.withdrawalLog.some((t) => t.root_id === root_id)) {
      throw new Error(`ROOT_ID_TOMBSTONED_REUSE_PROHIBITED: Source root '${root_id}' exists in the immutable withdrawal ledger.`);
    }

    const buf = Buffer.isBuffer(raw_bytes) ? raw_bytes : Buffer.from(String(raw_bytes), 'utf8');
    if (buf.length === 0) {
      throw new Error('EMPTY_SOURCE_ROOT_BYTES_REFUSED: Zero-length root bytes cannot ground warrants.');
    }
    const digest = sha256(buf);

    const rootRecord = {
      root_id,
      source_id,
      raw_bytes: buf,
      sha256: digest,
      byte_length: buf.length,
      lineage: {
        ...lineage,
        source_id,
        epoch_snapshot_id: this.epochSnapshotId,
      },
      acquisition_id: acquisition_id || `acq:${sha256(`${source_id}:${lineage.manifestation_id || ''}`)}`,
      evidence_class,
      status: 'ACTIVE',
      admitted_at: new Date().toISOString(),
      authority_class: 'AUTHENTICATED_SOURCE_ROOT',
    };

    this.roots.set(root_id, rootRecord);
    this.stateVersion++;
    return rootRecord;
  }

  // =========================================================================
  // 3. Dependency & Conjunction Tracking (Rules: premises -> head)
  // =========================================================================
  addDerivationRule({
    rule_id,
    head_claim_id,
    premise_ids,
    rule_type = 'DIRECT_WARRANT', // 'DIRECT_WARRANT' | 'CONJUNCTION' | 'CORROBORATION' | 'CITATION'
    receipt_id = null,
  }) {
    if (!rule_id || !head_claim_id || !Array.isArray(premise_ids) || premise_ids.length === 0) {
      throw new Error('INVALID_DERIVATION_RULE_SPECIFICATION');
    }

    const rule = {
      rule_id,
      head_claim_id,
      premise_ids: [...premise_ids],
      rule_type,
      receipt_id: receipt_id || `rcpt:csu_rule:${sha256(`${rule_id}:${head_claim_id}`).slice(0, 16)}`,
      status: 'ADMITTED',
      registered_at: new Date().toISOString(),
    };

    this.derivationRules.set(rule_id, rule);
    this.stateVersion++;
    return rule;
  }

  registerClaim({
    claim_id,
    claim_text,
    supporting_bytes = null,
    derivation_premises = [],
    receipt = null,
  }) {
    if (!claim_id || !claim_text) {
      throw new Error('CLAIM_ID_AND_TEXT_REQUIRED');
    }

    const claim = {
      claim_id,
      claim_text,
      state_version: this.stateVersion,
      supporting_bytes: supporting_bytes ? Buffer.from(supporting_bytes) : null,
      derivation_premises: [...derivation_premises],
      receipt: receipt || `rcpt:csu_claim:${sha256(claim_id).slice(0, 16)}`,
      authority_class: 'DERIVED_WARRANT',
      created_at: new Date().toISOString(),
    };

    this.claims.set(claim_id, claim);
    return claim;
  }

  // =========================================================================
  // 4. Circular Citation Detection (Conjunctive Groundability Closure)
  // =========================================================================
  detectCircularUngrounded() {
    const circularSet = new Set();

    // 1. Compute groundable nodes under conjunctive semantics:
    // A node is groundable iff all premises of at least one admitted rule are groundable.
    const groundableNodes = new Set();
    for (const [rId, root] of this.roots.entries()) {
      if (root.status === 'ACTIVE') {
        groundableNodes.add(rId);
      }
    }

    let expanded = true;
    while (expanded) {
      expanded = false;
      for (const [, rule] of this.derivationRules.entries()) {
        if (rule.status !== 'ADMITTED') continue;
        if (groundableNodes.has(rule.head_claim_id)) continue;
        const allPremisesGroundable = rule.premise_ids.every((p) => groundableNodes.has(p));
        if (allPremisesGroundable) {
          groundableNodes.add(rule.head_claim_id);
          expanded = true;
        }
      }
    }

    // 2. Build dependency adjacency among non-groundable nodes
    const ungroundedAdj = new Map();
    for (const [, rule] of this.derivationRules.entries()) {
      if (rule.status !== 'ADMITTED') continue;
      // Head is ungroundable
      if (!groundableNodes.has(rule.head_claim_id)) {
        for (const p of rule.premise_ids) {
          if (!groundableNodes.has(p)) {
            if (!ungroundedAdj.has(p)) ungroundedAdj.set(p, []);
            ungroundedAdj.get(p).push(rule.head_claim_id);
          }
        }
      }
    }

    // 3. DFS cycle detection over ungrounded subgraph
    const visited = new Map();
    const pathStack = [];
    const inStack = new Set();

    const dfs = (node) => {
      visited.set(node, 1);
      inStack.add(node);
      pathStack.push(node);

      const neighbors = ungroundedAdj.get(node) || [];
      for (const nbr of neighbors) {
        if (inStack.has(nbr)) {
          const cycleStart = pathStack.indexOf(nbr);
          const cycleNodes = pathStack.slice(cycleStart);
          for (const cn of cycleNodes) {
            circularSet.add(cn);
          }
        } else if (!visited.has(nbr)) {
          dfs(nbr);
        }
      }

      pathStack.pop();
      inStack.delete(node);
      visited.set(node, 2);
    };

    for (const node of ungroundedAdj.keys()) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }

    return circularSet;
  }

  // =========================================================================
  // 5. Monotone Least Fixed Point (P*) Claim Grounding & Acquisition Deduplication
  // =========================================================================
  computeLeastFixedPoint() {
    // 1. Seed P0 with active source roots
    const P0 = new Map();
    for (const [rId, root] of this.roots.entries()) {
      if (root.status === 'ACTIVE') {
        P0.set(rId, {
          id: rId,
          type: 'ROOT',
          supporting_roots: new Set([rId]),
          acquisition_ids: new Set([root.acquisition_id]),
          derivations: [[rId]],
          proof_count: 1,
        });
      }
    }

    const circularUngrounded = this.detectCircularUngrounded();
    const P = new Map(P0);
    let changed = true;
    let iteration = 0;
    // Dynamic iteration bound: any monotone extension on a finite graph converges
    // in at most |claims| + |rules| + 1 steps.
    const maxIterations = Math.max(1000, this.claims.size + this.derivationRules.size + 1);

    while (changed && iteration < maxIterations) {
      changed = false;
      iteration++;

      for (const [ruleId, rule] of this.derivationRules.entries()) {
        if (rule.status !== 'ADMITTED') continue;

        const headId = rule.head_claim_id;
        const premises = rule.premise_ids;

        // Skip head if in circular ungrounded loop
        if (circularUngrounded.has(headId)) continue;

        // Check if ALL premises are supported in P
        const allPremisesSupported = premises.every((pId) => P.has(pId));
        if (!allPremisesSupported) continue;

        // Collect all supporting roots and acquisition lineages across premises
        const combinedRoots = new Set();
        const combinedAcquisitions = new Set();
        const premiseDerivations = [];

        for (const pId of premises) {
          const pInfo = P.get(pId);
          pInfo.supporting_roots.forEach((r) => combinedRoots.add(r));
          pInfo.acquisition_ids.forEach((a) => combinedAcquisitions.add(a));
          premiseDerivations.push(pInfo.derivations);
        }

        // Must have at least one genuine source root in lineage
        if (combinedRoots.size === 0) continue;

        const existing = P.get(headId);
        if (!existing) {
          P.set(headId, {
            id: headId,
            type: 'DERIVED_CLAIM',
            supporting_roots: combinedRoots,
            acquisition_ids: combinedAcquisitions,
            derivations: [[...premises, headId]],
            rule_types: [rule.rule_type],
            rules_used: [ruleId],
            // Acquisition deduplication:
            // Conjunction = 1 proof requiring all premises.
            // Corroboration = count of distinct independent acquisition IDs.
            proof_count: rule.rule_type === 'CONJUNCTION' ? 1 : combinedAcquisitions.size,
          });
          changed = true;
        } else {
          // Merge alternative derivation / corroboration
          let newlyAdded = false;
          for (const r of combinedRoots) {
            if (!existing.supporting_roots.has(r)) {
              existing.supporting_roots.add(r);
              newlyAdded = true;
            }
          }
          for (const a of combinedAcquisitions) {
            if (!existing.acquisition_ids.has(a)) {
              existing.acquisition_ids.add(a);
              newlyAdded = true;
            }
          }
          if (newlyAdded) {
            existing.derivations.push([...premises, headId]);
            existing.rules_used.push(ruleId);
            existing.proof_count = existing.acquisition_ids.size;
            changed = true;
          }
        }
      }
    }

    if (changed) {
      throw new Error(`LFP_CONVERGENCE_INCOMPLETE_DEPTH_EXCEEDED: Least fixed point did not converge within ${maxIterations} iterations. Refusing to emit ungrounded partial state.`);
    }

    return {
      P0: new Set(P0.keys()),
      P,
      iterations: iteration,
      circularUngrounded,
    };
  }

  /**
   * Verifies the cryptographic hash-chain integrity of the withdrawal ledger.
   */
  verifyWithdrawalLedgerIntegrity() {
    let prevHash = 'GENESIS_TOMBSTONE_ROOT';
    for (let i = 0; i < this.withdrawalLog.length; i++) {
      const entry = this.withdrawalLog[i];
      if (entry.sequence !== i + 1) {
        throw new Error(`WITHDRAWAL_LEDGER_TAMPERED: Sequence mismatch at index ${i}. Expected ${i + 1}, found ${entry.sequence}.`);
      }
      if (entry.previous_tombstone_sha256 !== prevHash) {
        throw new Error(`WITHDRAWAL_LEDGER_TAMPERED: Hash chain broken at index ${i}. Expected ${prevHash}, found ${entry.previous_tombstone_sha256}.`);
      }
      const { tombstone_id, tombstone_sha256, ...payload } = entry;
      const expectedHash = sha256(JSON.stringify(payload));
      if (tombstone_sha256 !== expectedHash) {
        throw new Error(`WITHDRAWAL_LEDGER_TAMPERED: Payload hash invalid at index ${i}.`);
      }
      prevHash = tombstone_sha256;
    }
    return { valid: true, count: this.withdrawalLog.length, head_hash: prevHash };
  }

  // =========================================================================
  // 6. History-Preserving Source Withdrawal with Dynamic Cascading Invalidation
  // =========================================================================
  withdrawSourceRoot({
    root_id,
    reason = 'OPERATOR_WITHDRAWAL',
    withdrawn_by = 'SAC[X6ZNK5NO51]',
  }) {
    const root = this.roots.get(root_id);
    if (!root) {
      throw new Error(`ROOT_NOT_FOUND: ${root_id}`);
    }
    if (root.status === 'WITHDRAWN') {
      return { alreadyWithdrawn: true, root_id };
    }

    // Compute P* before withdrawal
    const priorLFP = this.computeLeastFixedPoint();

    const previousState = root.status;
    root.status = 'WITHDRAWN';
    this.stateVersion++;

    // Recompute P* after withdrawal
    const currentLFP = this.computeLeastFixedPoint();

    // Invalidate affected claims
    const invalidatedClaims = [];
    for (const [claimId, priorInfo] of priorLFP.P.entries()) {
      if (priorInfo.type === 'ROOT') continue;
      if (!currentLFP.P.has(claimId)) {
        invalidatedClaims.push({
          claim_id: claimId,
          reason: `All supporting roots were invalidated or withdrawn (lost root: ${root_id}).`,
          previous_supporting_roots: Array.from(priorInfo.supporting_roots),
        });
      }
    }

    const previous_tombstone_sha256 = this.withdrawalLog.length > 0
      ? this.withdrawalLog[this.withdrawalLog.length - 1].tombstone_sha256
      : 'GENESIS_TOMBSTONE_ROOT';

    const tombstonePayload = {
      sequence: this.withdrawalLog.length + 1,
      previous_tombstone_sha256,
      root_id,
      reason,
      withdrawn_by,
      previous_state: previousState,
      new_state: 'WITHDRAWN',
      state_version: this.stateVersion,
      withdrawn_at: new Date().toISOString(),
      invalidated_claims_count: invalidatedClaims.length,
      invalidated_claims: invalidatedClaims,
    };

    const tombstone_sha256 = sha256(JSON.stringify(tombstonePayload));

    const tombstone = Object.freeze({
      tombstone_id: `tomb:${tombstone_sha256.slice(0, 16)}`,
      tombstone_sha256,
      ...tombstonePayload,
    });

    this.withdrawalLog.push(tombstone);

    return {
      success: true,
      tombstone,
      active_roots_remaining: currentLFP.P0.size,
      active_grounded_claims_remaining: currentLFP.P.size - currentLFP.P0.size,
      invalidated_claims: invalidatedClaims,
    };
  }

  // =========================================================================
  // 7. Warrant Query Operation
  // =========================================================================
  queryWarrant(claim_id) {
    const lfp = this.computeLeastFixedPoint();
    const isCircular = lfp.circularUngrounded.has(claim_id);
    const inP = lfp.P.has(claim_id);

    if (isCircular) {
      return {
        grounded: false,
        status: 'CIRCULAR_UNGROUNDED',
        claim_id,
        supporting_roots: [],
        independent_corroborations: 0,
        explanation: 'Claim belongs to a mutual circular citation cycle with no path to authenticated source roots.',
      };
    }

    if (!inP) {
      return {
        grounded: false,
        status: 'UNSUPPORTED',
        claim_id,
        supporting_roots: [],
        independent_corroborations: 0,
        explanation: 'Claim has no valid derivation path from authenticated source roots.',
      };
    }

    const pInfo = lfp.P.get(claim_id);
    return {
      grounded: true,
      status: 'GROUNDED_WARRANT',
      claim_id,
      supporting_roots: Array.from(pInfo.supporting_roots),
      acquisition_lineages: Array.from(pInfo.acquisition_ids),
      independent_corroborations: pInfo.proof_count,
      is_conjunction: pInfo.rule_types?.includes('CONJUNCTION') || false,
      explanation: `Claim successfully grounded in ${pInfo.supporting_roots.size} authenticated source root(s) across ${pInfo.acquisition_ids.size} independent acquisition(s).`,
    };
  }
}
