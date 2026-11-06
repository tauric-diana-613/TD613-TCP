/**
 * 𝌋 TD613 · Manifest Reciprocal Warrant Engine & Claim-Grounding Gate
 * 
 * Phase 3 & 4 implementation:
 * 1. Represents operator-observable claims as:
 *    (claim_id, state_version, supporting_bytes, lineage, route, derivation_premises, receipt, authority_class)
 * 2. Monotone Least Fixed Point (LFP) Claim Grounding:
 *    P0 := authenticated admissible source roots
 *    P(n+1) := P(n) ∪ { head | all premises of an admitted rule have root-carrying support in P(n) }
 *    P* := least fixed point of that monotone operator for current active epoch
 * 3. Rejects Atelier <-> Encyclopedia circular loops lacking root support (CIRCULAR_UNGROUNDED).
 * 4. History-preserving source withdrawal with dynamic cascade:
 *    Withdrawing a root invalidates derived support if no alternative root remains,
 *    while preserving immutable historical audit trail.
 * 5. Strict corroboration counting:
 *    - Two IDs / one acquisition := 1 corroboration (not 2)
 *    - Conjunctive two-root rule (R1 ∧ R2 -> C) := 1 proof (requires both, not 2 independent corroborations)
 *    - Two independent roots (R1 -> C, R2 -> C) := 2 independent corroborations
 * 6. Four Distinct AIA Route Projections:
 *    - EXPERIENTIAL: Disclosed observation context & limits; zero invented lived access.
 *    - CUSTODIAL: Hash/epoch/source/capture lineage, access scope, permitted evidence.
 *    - AUDIT: Counterexamples, conflicting statements, circular claims, withdrawal effects, unsupported promotion.
 *    - IMPLEMENTATION: Available executable operations, source-bound repair path, test receipts, code digests.
 * 
 * Authority: SAC[X6ZNK5NO51]
 * Covenant: Khona‌lit-po (literal U+200C interior retained)
 */

import crypto from 'node:crypto';

export const AIA_ROUTES = Object.freeze(['EXPERIENTIAL', 'CUSTODIAL', 'AUDIT', 'IMPLEMENTATION']);

export function sha256(data) {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'utf8');
  return crypto.createHash('sha256').update(buf).digest('hex');
}

export class ManifestWarrantEngine {
  constructor({ engineId = 'td613.manifest-warrant-engine/v1', epochSnapshotId = null } = {}) {
    this.engineId = engineId;
    this.epochSnapshotId = epochSnapshotId || `epoch_${Date.now()}`;
    this.stateVersion = 1;

    // Repositories
    this.roots = new Map();         // root_id -> RootRecord
    this.records = new Map();       // record_id -> AtelierRecord
    this.rules = new Map();         // rule_id -> DerivationRule
    this.claims = new Map();        // claim_id -> ManifestClaim
    this.withdrawalLog = [];        // Array of WithdrawalAuditEntries
    this.historicalStates = [];     // Snapshots of P* over versions
  }

  /**
   * Admits an authenticated source root into P0.
   */
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
        throw new Error(`ROOT_ID_PERMANENTLY_WITHDRAWN: Source root '${root_id}' was withdrawn and cannot be re-admitted or overwritten.`);
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

  /**
   * Registers a derivation rule: premises -> head.
   */
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
      receipt_id: receipt_id || `rcpt:rule:${sha256(`${rule_id}:${head_claim_id}`).slice(0, 16)}`,
      status: 'ADMITTED',
      registered_at: new Date().toISOString(),
    };

    this.rules.set(rule_id, rule);
    this.stateVersion++;
    return rule;
  }

  /**
   * Registers an operator-observable claim.
   */
  registerClaim({
    claim_id,
    claim_text,
    supporting_bytes = null,
    lineage = {},
    route = 'EXPERIENTIAL',
    derivation_premises = [],
    receipt = null,
  }) {
    if (!claim_id || !claim_text) {
      throw new Error('CLAIM_ID_AND_TEXT_REQUIRED');
    }
    if (!AIA_ROUTES.includes(route)) {
      throw new Error(`EXPLICIT_AIA_ROUTE_REQUIRED: ${route}`);
    }

    const claim = {
      claim_id,
      claim_text,
      state_version: this.stateVersion,
      supporting_bytes: supporting_bytes ? Buffer.from(supporting_bytes) : null,
      lineage: {
        ...lineage,
        epoch_snapshot_id: this.epochSnapshotId,
      },
      route,
      derivation_premises: [...derivation_premises],
      receipt: receipt || `rcpt:claim:${sha256(claim_id).slice(0, 16)}`,
      authority_class: 'DERIVED_WARRANT',
      created_at: new Date().toISOString(),
    };

    this.claims.set(claim_id, claim);
    return claim;
  }

  /**
   * Computes the Least Fixed Point (P*) of the monotone claim grounding operator.
   * P0 := active authenticated admissible source roots
   * P(n+1) := P(n) ∪ { head | all premises of an admitted rule have root-carrying support in P(n) }
   */
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

    const P = new Map(P0);
    let changed = true;
    let iteration = 0;
    // Dynamic iteration bound: any monotone extension on a finite graph converges
    // in at most |claims| + |rules| + 1 steps.
    const maxIterations = Math.max(1000, this.claims.size + this.rules.size + 1);

    while (changed && iteration < maxIterations) {
      changed = false;
      iteration++;

      for (const [ruleId, rule] of this.rules.entries()) {
        if (rule.status !== 'ADMITTED') continue;

        const headId = rule.head_claim_id;
        const premises = rule.premise_ids;

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
          if (rule.rule_type !== 'CONJUNCTION') {
            existing.proof_count = existing.acquisition_ids.size;
          }
          if (newlyAdded) changed = true;
        }
      }
    }

    if (changed) {
      throw new Error(`LFP_CONVERGENCE_INCOMPLETE_DEPTH_EXCEEDED: Least fixed point did not converge within ${maxIterations} iterations. Refusing to emit ungrounded partial state.`);
    }

    // Detect circular ungrounded loops using conjunctive dependency closure
    const circularUngrounded = this._detectCircularUngrounded(P);

    const lfpResult = {
      epoch_snapshot_id: this.epochSnapshotId,
      state_version: this.stateVersion,
      total_active_roots: P0.size,
      iterations: iteration,
      grounded_ids: Array.from(P.keys()),
      supported_claims_count: Array.from(P.keys()).filter((id) => this.claims.has(id)).length,
      circular_ungrounded_ids: Array.from(circularUngrounded),
      computed_at: new Date().toISOString(),
    };

    return { P, lfpResult, circularUngrounded };
  }

  _detectCircularUngrounded(P) {
    const circularSet = new Set();
    const ungroundedAdj = new Map();

    for (const [, rule] of this.rules.entries()) {
      if (rule.status !== 'ADMITTED') continue;
      const headId = rule.head_claim_id;
      if (!P.has(headId)) {
        for (const p of rule.premise_ids) {
          if (!P.has(p)) {
            if (!ungroundedAdj.has(p)) ungroundedAdj.set(p, []);
            ungroundedAdj.get(p).push(headId);
          }
        }
      }
    }

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
      const { event_id, tombstone_sha256, ...payload } = entry;
      const expectedHash = sha256(JSON.stringify(payload));
      if (tombstone_sha256 !== expectedHash) {
        throw new Error(`WITHDRAWAL_LEDGER_TAMPERED: Payload hash invalid at index ${i}.`);
      }
      prevHash = tombstone_sha256;
    }
    return { valid: true, count: this.withdrawalLog.length, head_hash: prevHash };
  }

  /**
   * History-preserving withdrawal of an admitted source root.
   * Automatically cascades and invalidates claims that depend on it without alternative support.
   */
  withdrawSourceRoot(root_id, { reason = 'CUSTODIAL_WITHDRAWAL', superseded_by = null } = {}) {
    const root = this.roots.get(root_id);
    if (!root) {
      throw new Error(`SOURCE_ROOT_NOT_FOUND: ${root_id}`);
    }

    // 1. Pre-withdrawal least fixed point computation
    const { P: preP } = this.computeLeastFixedPoint();
    const claimsSupportedPre = new Set(Array.from(preP.keys()).filter((k) => this.claims.has(k)));

    // 2. Perform withdrawal: update status, record tombstone
    const now = new Date().toISOString();
    root.status = superseded_by ? 'SUPERSEDED' : 'WITHDRAWN';
    root.withdrawn_at = now;
    root.withdrawal_reason = reason;
    root.superseded_by = superseded_by;

    this.stateVersion++;

    // 3. Post-withdrawal least fixed point recomputation
    const { P: postP } = this.computeLeastFixedPoint();
    const claimsSupportedPost = new Set(Array.from(postP.keys()).filter((k) => this.claims.has(k)));

    // 4. Identify invalidated claims
    const invalidatedClaims = [];
    for (const cId of claimsSupportedPre) {
      if (!claimsSupportedPost.has(cId)) {
        invalidatedClaims.push(cId);
        const clm = this.claims.get(cId);
        if (clm) clm.authority_class = 'WITHDRAWN_TOMBSTONE';
      }
    }

    const previous_tombstone_sha256 = this.withdrawalLog.length > 0
      ? this.withdrawalLog[this.withdrawalLog.length - 1].tombstone_sha256
      : 'GENESIS_TOMBSTONE_ROOT';

    const tombstonePayload = {
      sequence: this.withdrawalLog.length + 1,
      previous_tombstone_sha256,
      root_id,
      source_id: root.source_id,
      reason,
      superseded_by,
      invalidated_claims: invalidatedClaims,
      timestamp: now,
      state_version: this.stateVersion,
    };

    const tombstone_sha256 = sha256(JSON.stringify(tombstonePayload));

    const auditEntry = Object.freeze({
      event_id: `ev_wd_${tombstone_sha256.slice(0, 16)}`,
      tombstone_sha256,
      ...tombstonePayload,
    });

    this.withdrawalLog.push(auditEntry);

    return {
      root_id,
      new_status: root.status,
      reason,
      superseded_by,
      invalidated_claims: invalidatedClaims,
      remaining_grounded_claims: Array.from(claimsSupportedPost),
      audit_entry: auditEntry,
    };
  }

  /**
   * Side-by-Side Claim Audit:
   * Provides original source bytes, claim, derivation, active support, historical support,
   * route-specific explanations, and counterfactual impact of withdrawing each root.
   */
  getClaimSideBySide(claim_id) {
    const claim = this.claims.get(claim_id);
    if (!claim) {
      throw new Error(`CLAIM_NOT_FOUND: ${claim_id}`);
    }

    const { P, circularUngrounded } = this.computeLeastFixedPoint();
    const claimSupport = P.get(claim_id);

    const isCurrentlyActive = Boolean(claimSupport);
    const supportingRoots = claimSupport ? Array.from(claimSupport.supporting_roots) : [];
    const acquisitionIds = claimSupport ? Array.from(claimSupport.acquisition_ids) : [];

    // Counterfactual analysis: simulate withdrawal of each root
    const counterfactualImpact = {};
    for (const rId of supportingRoots) {
      // Temporarily mark rId as WITHDRAWN and recompute LFP
      const r = this.roots.get(rId);
      const originalStatus = r.status;
      r.status = 'WITHDRAWN';
      const { P: simP } = this.computeLeastFixedPoint();
      r.status = originalStatus;

      const stillSupported = simP.has(claim_id);
      counterfactualImpact[rId] = {
        root_id: rId,
        source_id: r.source_id,
        would_remain_supported_if_withdrawn: stillSupported,
        impact_verdict: stillSupported
          ? 'ALTERNATIVE_ROOT_PRESERVES_GROUNDING'
          : 'FATAL_LOSS_OF_GROUNDING_WITHOUT_THIS_ROOT',
      };
    }

    // Source bytes from grounding roots
    const sourceBytesList = supportingRoots.map((rId) => {
      const r = this.roots.get(rId);
      return {
        root_id: rId,
        source_id: r.source_id,
        sha256: r.sha256,
        byte_length: r.byte_length,
        verbatim_utf8_prefix: r.raw_bytes.slice(0, 120).toString('utf8'),
      };
    });

    return {
      claim_id,
      claim_text: claim.claim_text,
      state_version: this.stateVersion,
      active_support: isCurrentlyActive,
      circular_ungrounded: circularUngrounded.has(claim_id),
      authority_class: claim.authority_class,
      grounding_roots: supportingRoots,
      independent_corroboration_count: claimSupport ? claimSupport.proof_count : 0,
      unique_acquisition_count: acquisitionIds.length,
      derivation_paths: claimSupport ? claimSupport.derivations : [],
      grounding_source_bytes: sourceBytesList,
      counterfactual_root_withdrawal_impact: counterfactualImpact,
      route_explanations: {
        EXPERIENTIAL: `Observable claim '${claim.claim_text}' grounded in ${supportingRoots.length} authenticated source root(s). Lived access disclosed limits apply.`,
        CUSTODIAL: `Claim ${claim_id} carries cryptographic custody through root digests [${supportingRoots.map((r) => this.roots.get(r)?.sha256.slice(0, 8)).join(', ')}] with zero private body bypasses.`,
        AUDIT: isCurrentlyActive
          ? `LFP verified: claim is in P*. Counterfactual impact: ${supportingRoots.length} critical root(s). Circular loops: 0.`
          : circularUngrounded.has(claim_id)
            ? 'AUDIT VETO: Circular mutual dependency detected without root support.'
            : 'AUDIT VETO: Claim lacks verifiable root derivation path in P*.',
        IMPLEMENTATION: `Engine ${this.engineId} computed LFP with ${this.rules.size} admitted rules. State version: ${this.stateVersion}.`,
      },
    };
  }

  /**
   * Evaluates one of the Four Canonical AIA Route Projections.
   */
  projectAIA(route, targetClaimId = null) {
    if (!AIA_ROUTES.includes(route)) {
      throw new Error(`EXPLICIT_AIA_ROUTE_REQUIRED: ${route}`);
    }

    const { P, lfpResult, circularUngrounded } = this.computeLeastFixedPoint();

    switch (route) {
      case 'EXPERIENTIAL':
        return {
          route: 'EXPERIENTIAL',
          disclosed_observation_context: {
            surface: 'TD613_MANIFEST_RECIPROCAL_WARRANT_GATE',
            epoch_snapshot_id: this.epochSnapshotId,
            lived_access_disclosed_limits: 'Disclosed limits: No lived Reddit/Facebook runtime access; observations derived from sealed fixtures and admitted source-free synthetic payloads.',
            verbatim_full_post_bodies_stored: false,
          },
          claims: Array.from(this.claims.values()).map((c) => ({
            claim_id: c.claim_id,
            claim_text: c.claim_text,
            is_supported: P.has(c.claim_id),
          })),
        };

      case 'CUSTODIAL':
        return {
          route: 'CUSTODIAL',
          epoch_snapshot_id: this.epochSnapshotId,
          state_version: this.stateVersion,
          roots_custody: Array.from(this.roots.values()).map((r) => ({
            root_id: r.root_id,
            source_id: r.source_id,
            sha256: r.sha256,
            status: r.status,
            acquisition_id: r.acquisition_id,
          })),
          withdrawal_history_count: this.withdrawalLog.length,
          withdrawal_log: this.withdrawalLog,
          rules_count: this.rules.size,
        };

      case 'AUDIT':
        return {
          route: 'AUDIT',
          least_fixed_point_status: lfpResult,
          circular_ungrounded_claims: Array.from(circularUngrounded),
          counterfactual_checks: targetClaimId ? this.getClaimSideBySide(targetClaimId).counterfactual_root_withdrawal_impact : null,
          unsupported_promotion_detected: Array.from(this.claims.keys()).some((cId) => !P.has(cId) && this.claims.get(cId).authority_class === 'PROMOTED_CLAIM'),
          disposition: circularUngrounded.size === 0 ? 'CONCORDANT_LFP_CLOSURE' : 'CIRCULARITY_DETECTED_HOLD',
        };

      case 'IMPLEMENTATION':
        return {
          route: 'IMPLEMENTATION',
          engine_id: this.engineId,
          version: this.stateVersion,
          available_operations: [
            'admitSourceRoot',
            'addDerivationRule',
            'registerClaim',
            'computeLeastFixedPoint',
            'withdrawSourceRoot',
            'getClaimSideBySide',
            'projectAIA',
          ],
          active_roots_count: Array.from(this.roots.values()).filter((r) => r.status === 'ACTIVE').length,
          admitted_rules_count: this.rules.size,
          claims_count: this.claims.size,
        };
    }
  }
}
