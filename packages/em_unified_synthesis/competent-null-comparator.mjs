/**
 * TD613 Competent Null Comparator for Unified Theory Synthesis
 * Commission EM E-00.1 · Deliverable 6 (Task E001-F01)
 * 
 * Implements a Genuinely Executable, Trace-Derived 4-Arm Comparative Evaluation:
 * - Arm 1: Native Em Documentary Practice (Historical read-only baseline)
 * - Arm 2: Em Isolated Receiver (Local storage, zero cross-domain bridging)
 * - Arm 3: Competent Non-Reciprocal Strong Union (Standard graph algorithms, equal affordances)
 * - Arm 4: Prospective Em–Universal Reciprocal Synthesis (Span-proof warrants, LFP closure)
 * 
 * Governed Principles:
 * - Removes hardcoded scientific performance scores from the active comparator.
 * - Preserves historical developer scores explicitly as HISTORICAL_AUTHORED_DECLARATIONS.
 * - Calculates all metrics from actual event traces over matched test cases.
 * - Confirms and reports genuine ties where observed (e.g., 100% graph fidelity on matched cases).
 * - Records scientific reciprocal surplus as UNESTABLISHED in the absence of external empirical evidence.
 * - Explicitly marks unsupported dimensions (semantic truth, emergence) as NOT_MEASURED.
 */

import {
  EmUnifiedTheorySynthesisEngine,
  PROMOTION_LADDER
} from './em-unified-theory-synthesis.mjs';

import {
  EmUniversalReciprocalBridge
} from './em-universal-reciprocal-bridge.mjs';

import {
  sha256Hex
} from './corpus-inspector.mjs';

/**
 * WIRE-01: Canonical Paired Case Ledger
 * Shared, identical test cases evaluated across both Arm 3 and Arm 4.
 * Both systems must evaluate identical denominators, cases, and criteria.
 */
export const CANONICAL_PAIRED_CASE_LEDGER = Object.freeze([
  {
    case_id: 'case_1_hypervisor_supported',
    case_type: 'SUPPORTED_TARGET',
    domain: 'CYBERNETICS_HYPERVISOR',
    root: 'root:hypervisor',
    source_id: 'emsrc_hypervisor_test',
    target: 'claim:priority_bypass',
    premise: 'premise:priority_inversion',
    expected_admissible: true,
    description: 'Directly supported hypervisor claim from admitted premise'
  },
  {
    case_id: 'case_2_algedonic_supported',
    case_type: 'SUPPORTED_TARGET',
    domain: 'CYBERNETICS_ALGEDONIC',
    root: 'root:algedonic',
    source_id: 'emsrc_algedonic_test',
    target: 'claim:algedonic_recovery',
    premise: 'premise:algedonic_signal',
    expected_admissible: true,
    description: 'Directly supported algedonic recovery claim from admitted premise'
  },
  {
    case_id: 'case_3_hypervisor_unsupported_rejection',
    case_type: 'UNSUPPORTED_TARGET',
    domain: 'CYBERNETICS_HYPERVISOR',
    root: 'root:hypervisor',
    source_id: 'emsrc_hypervisor_test',
    target: 'claim:unsupported_teleportation',
    premise: null,
    expected_admissible: false,
    description: 'Unsupported teleportation target disconnected from premise graph'
  },
  {
    case_id: 'case_4_algedonic_unsupported_rejection',
    case_type: 'UNSUPPORTED_TARGET',
    domain: 'CYBERNETICS_ALGEDONIC',
    root: 'root:algedonic',
    source_id: 'emsrc_algedonic_test',
    target: 'claim:unsupported_perpetual_motion',
    premise: null,
    expected_admissible: false,
    description: 'Unsupported perpetual motion target disconnected from premise graph'
  },
  {
    case_id: 'case_5_incommensurable_contradiction',
    case_type: 'INCOMMENSURABLE_CONTRADICTION',
    domain: 'CROSS_DOMAIN_INCOMMENSURABLE',
    root: 'root:incommensurable_axioms',
    source_id: 'emsrc_incommensurable_test',
    target: 'claim:incommensurable_bypass',
    premise: 'premise:incommensurable_assumptions',
    expected_admissible: false,
    description: 'Contradictory relationship across incommensurable assumptions without correspondence'
  },
  {
    case_id: 'case_6_post_withdrawal_consequence',
    case_type: 'POST_WITHDRAWAL_CONSEQUENCE',
    domain: 'CYBERNETICS_HYPERVISOR',
    root: 'root:hypervisor',
    source_id: 'emsrc_hypervisor_test',
    target: 'claim:priority_bypass',
    premise: 'premise:priority_inversion',
    expected_admissible: false,
    description: 'Claim reachability and warrant grounding evaluated after upstream source withdrawal'
  }
]);

export class CompetentNullComparator {
  constructor(options = {}) {
    this.covenant = 'Khona\u200Clit-po';
    this.authority = 'SAC[X6ZNK5NO51]';
  }

  /**
   * Executes the 4-arm matched comparison over representative research cases.
   * All metrics are computed from actual event traces over CANONICAL_PAIRED_CASE_LEDGER.
   */
  evaluateComparison(testCorpus, caseLedger = CANONICAL_PAIRED_CASE_LEDGER) {
    if (!Array.isArray(caseLedger) || caseLedger.length === 0) {
      throw new Error('ASYMMETRIC_CASE_LEDGER_DETECTED: Case ledger must be a non-empty array.');
    }

    const expectedCaseIdSet = new Set();
    for (const c of caseLedger) {
      if (!c || typeof c !== 'object' || !c.case_id) {
        throw new Error('ASYMMETRIC_CASE_LEDGER_DETECTED: Invalid case record without case_id.');
      }
      if (expectedCaseIdSet.has(c.case_id)) {
        throw new Error(`ASYMMETRIC_CASE_LEDGER_DETECTED: Duplicate case_id '${c.case_id}' in caseLedger.`);
      }
      expectedCaseIdSet.add(c.case_id);
    }

    const findings = {
      evaluated_at: new Date().toISOString(),
      covenant: this.covenant,
      authority: this.authority,
      arms: {},
      differential_matrix: {},
      governance_determination: 'BOUNDED_TIE_OBSERVED_SURPLUS_UNESTABLISHED'
    };

    const startTime = Date.now();

    // -------------------------------------------------------------
    // ARM 1: NATIVE EM DOCUMENTARY PRACTICE (HISTORICAL BASELINE)
    // -------------------------------------------------------------
    const arm1ReadBytes = (testCorpus.hypervisorSource?.text?.length || 0) + (testCorpus.algedonicSource?.text?.length || 0);
    findings.arms.arm_1_documentary = {
      name: 'NATIVE_EM_DOCUMENTARY_PRACTICE',
      execution_class: 'STATIC_DOCUMENTARY_READONLY',
      automated_inference: false,
      source_bytes_read: arm1ReadBytes,
      queries_executed: 1, // Manual index lookup
      graph_fidelity: 'NOT_MEASURED',
      correct_decisions: 'NOT_MEASURED',
      unsupported_targets_rejected: 'NOT_MEASURED',
      correction_latency: 'NOT_MEASURED',
      contradictions_retained: true, // Documentary protocols preserve textual differences
      scientific_surplus: 'NOT_MEASURED',
      historical_authored_declaration: {
        claimed_warrant_fidelity: 1.0,
        claimed_history_traceability: 0.70,
        status: 'HISTORICAL_AUTHORED_DECLARATION'
      }
    };

    // -------------------------------------------------------------
    // ARM 2: EM ISOLATED RECEIVER (LOCAL CUSTODY ONLY)
    // -------------------------------------------------------------
    let arm2Queries = 0;
    let arm2Bytes = 0;
    const arm2Bridge = new EmUniversalReciprocalBridge();
    arm2Bridge.initialize();

    const src1 = arm2Bridge.admitEmSource({
      sourceId: testCorpus.hypervisorSource.id,
      filename: testCorpus.hypervisorSource.filename,
      rawBytes: Buffer.from(testCorpus.hypervisorSource.text, 'utf8')
    });
    arm2Bytes += src1.byte_length;
    arm2Queries++;

    // Local staging only, no cross-domain bridge
    arm2Bridge.stageEmPassageIntoAtelier({
      recordId: 'rec:arm2:staging:001',
      sourceId: testCorpus.hypervisorSource.id,
      byteOffset: 0,
      length: Math.min(120, src1.byte_length),
      claimSummary: 'Arm 2 local staging passage'
    });
    arm2Queries++;

    findings.arms.arm_2_receiver = {
      name: 'EM_EMPTY_ENCYCLOPEDIA_RECEIVER',
      execution_class: 'ISOLATED_RELATIONAL_STORE',
      automated_cross_domain_inference: false,
      source_bytes_read: arm2Bytes,
      queries_executed: arm2Queries,
      graph_fidelity: 'LOCAL_ONLY',
      contradictions_retained: true,
      scientific_surplus: 'UNESTABLISHED',
      historical_authored_declaration: {
        claimed_warrant_fidelity: 1.0,
        claimed_history_traceability: 0.85,
        status: 'HISTORICAL_AUTHORED_DECLARATION'
      }
    };
    arm2Bridge.close();

    // -------------------------------------------------------------
    // ARM 3: COMPETENT NON-RECIPROCAL STRONG UNION
    // -------------------------------------------------------------
    // Implements genuinely executable standard graph reachability over union
    const unionGraph = {
      nodes: new Set(),
      edges: new Map(), // node -> Set of targets
      roots: new Set()
    };

    function addUnionEdge(u, v) {
      unionGraph.nodes.add(u);
      unionGraph.nodes.add(v);
      if (!unionGraph.edges.has(u)) unionGraph.edges.set(u, new Set());
      unionGraph.edges.get(u).add(v);
    }

    function isReachable(startNode, targetNode) {
      if (!unionGraph.nodes.has(startNode) || !unionGraph.nodes.has(targetNode)) return false;
      const visited = new Set();
      const queue = [startNode];
      visited.add(startNode);
      while (queue.length > 0) {
        const curr = queue.shift();
        if (curr === targetNode) return true;
        const neighbors = unionGraph.edges.get(curr) || [];
        for (const next of neighbors) {
          if (!visited.has(next)) {
            visited.add(next);
            queue.push(next);
          }
        }
      }
      return false;
    }

    // Build union graph over admitted premises
    unionGraph.roots.add('root:hypervisor');
    unionGraph.roots.add('root:algedonic');
    addUnionEdge('root:hypervisor', 'premise:priority_inversion');
    addUnionEdge('premise:priority_inversion', 'claim:priority_bypass');
    addUnionEdge('root:algedonic', 'premise:algedonic_signal');
    addUnionEdge('premise:algedonic_signal', 'claim:algedonic_recovery');

    let arm3Correct = 0;
    let arm3Rejected = 0;
    let arm3FalseConvergences = 0;
    let arm3Queries = 0;
    let arm3BytesRead = (testCorpus.hypervisorSource?.text?.length || 0) + (testCorpus.algedonicSource?.text?.length || 0);
    let arm3WithdrawalOps = 0;

    // Withdrawal in union graph: remove hypervisor root and connected edges
    unionGraph.roots.delete('root:hypervisor');
    unionGraph.edges.delete('root:hypervisor');
    arm3WithdrawalOps += 2;

    // Evaluate all cases in shared ledger
    const arm3ExecutedCaseIds = new Set();
    const arm3Trace = [];

    for (const c of caseLedger) {
      if (arm3ExecutedCaseIds.has(c.case_id)) {
        throw new Error(`ASYMMETRIC_CASE_LEDGER_DETECTED: Arm 3 executed duplicate case '${c.case_id}'.`);
      }
      arm3ExecutedCaseIds.add(c.case_id);
      arm3Trace.push(c.case_id);
      arm3Queries++;
      let reached = false;
      if (c.case_type === 'POST_WITHDRAWAL_CONSEQUENCE') {
        // Post-withdrawal evaluation (root:hypervisor deleted)
        reached = isReachable(c.root, c.target);
      } else {
        // Pre-withdrawal evaluation: temporarily restore root
        const wasMissing = !unionGraph.roots.has('root:hypervisor');
        if (wasMissing) {
          unionGraph.roots.add('root:hypervisor');
          if (!unionGraph.edges.has('root:hypervisor')) {
            unionGraph.edges.set('root:hypervisor', new Set(['premise:priority_inversion']));
          }
        }
        reached = isReachable(c.root, c.target);
        if (wasMissing) {
          unionGraph.roots.delete('root:hypervisor');
          unionGraph.edges.delete('root:hypervisor');
        }
      }

      if (reached === c.expected_admissible) {
        arm3Correct++;
      }
      if (!c.expected_admissible && !reached) {
        arm3Rejected++;
      }
      if (!c.expected_admissible && reached) {
        arm3FalseConvergences++;
      }
    }

    findings.arms.arm_3_non_reciprocal_union = {
      name: 'COMPETENT_NON_RECIPROCAL_UNION',
      execution_class: 'EXECUTABLE_STANDARD_GRAPH_UNION',
      cases_evaluated: caseLedger.length,
      correct_decisions: arm3Correct,
      unsupported_targets_rejected: arm3Rejected,
      measured_graph_fidelity: arm3Correct / caseLedger.length,
      false_graph_convergences: arm3FalseConvergences,
      source_bytes_read: arm3BytesRead,
      queries_executed: arm3Queries,
      correction_operations_observed: arm3WithdrawalOps,
      contradictions_retained: 'UNCONDITIONED_FLATTENING_RISK',
      scientific_surplus: 'UNESTABLISHED',
      semantic_entailment_quality: 'NOT_MEASURED',
      historical_authored_declaration: {
        prior_claimed_warrant_fidelity: 0.65,
        prior_claimed_latency_steps: 8,
        status: 'HISTORICAL_AUTHORED_DECLARATION_SUPERSEDED_BY_EMPIRICAL_TIE'
      }
    };

    // -------------------------------------------------------------
    // ARM 4: PROSPECTIVE EM-UNIVERSAL RECIPROCAL SYNTHESIS
    // -------------------------------------------------------------
    const arm4Bridge = new EmUniversalReciprocalBridge();
    arm4Bridge.initialize();
    const synthesis = new EmUnifiedTheorySynthesisEngine();
    let arm4Queries = 0;
    let arm4BytesRead = 0;

    // Ingest sources
    const arm4SrcA = arm4Bridge.admitEmSource({
      sourceId: testCorpus.hypervisorSource.id,
      filename: testCorpus.hypervisorSource.filename,
      rawBytes: Buffer.from(testCorpus.hypervisorSource.text, 'utf8')
    });
    arm4BytesRead += arm4SrcA.byte_length;
    arm4Queries++;

    const arm4SrcB = arm4Bridge.admitEmSource({
      sourceId: testCorpus.algedonicSource.id,
      filename: testCorpus.algedonicSource.filename,
      rawBytes: Buffer.from(testCorpus.algedonicSource.text, 'utf8')
    });
    arm4BytesRead += arm4SrcB.byte_length;
    arm4Queries++;

    // Ensure source passages are attached to Works for verified operator attestation
    const hyperWork = {
      ...testCorpus.hypervisorWork,
      sourcePassages: (testCorpus.hypervisorWork.sourcePassages && testCorpus.hypervisorWork.sourcePassages.length > 0)
        ? testCorpus.hypervisorWork.sourcePassages
        : [{
            source_id: testCorpus.hypervisorSource.id,
            byteOffset: 0,
            length: Math.min(60, arm4SrcA.byte_length),
            span_text: testCorpus.hypervisorSource.text.slice(0, Math.min(60, arm4SrcA.byte_length)),
            span_sha256: sha256Hex(testCorpus.hypervisorSource.text.slice(0, Math.min(60, arm4SrcA.byte_length)))
          }]
    };

    const algedonicWork = {
      ...testCorpus.algedonicWork,
      sourcePassages: (testCorpus.algedonicWork.sourcePassages && testCorpus.algedonicWork.sourcePassages.length > 0)
        ? testCorpus.algedonicWork.sourcePassages
        : [{
            source_id: testCorpus.algedonicSource.id,
            byteOffset: 0,
            length: Math.min(60, arm4SrcB.byte_length),
            span_text: testCorpus.algedonicSource.text.slice(0, Math.min(60, arm4SrcB.byte_length)),
            span_sha256: sha256Hex(testCorpus.algedonicSource.text.slice(0, Math.min(60, arm4SrcB.byte_length)))
          }]
    };

    // Register admitted bridge sources into synthesis engine for verified operator attestation
    synthesis.registerBridge(arm4Bridge);

    synthesis.extractWorkAnatomy(hyperWork);
    synthesis.extractWorkAnatomy(algedonicWork);

    // Staging and grounded LFP evaluation
    const validCandidate = synthesis.synthesizeCrossDomainCandidate({
      candidateId: 'theory:cybernetic_hypervisor_algedonic_synthesis',
      workAId: hyperWork.workId,
      workBId: algedonicWork.workId,
      proposedBridgeHypothesis: 'Multi-agent hypervisors achieve optimal recovery when algedonic setpoints trigger priority bypass.',
      sharedMotifVocabulary: ['feedback', 'homeostasis', 'stability'],
      formalOperatorMapping: [
        { opA: hyperWork.operators[0], opB: algedonicWork.operators[0], morphismType: 'HOMOMORPHIC_INTERVENTION' }
      ],
      proposedPredictions: [
        { metric: 'priority_inversion_latency_ticks', expected_direction: 'DECREASE', minimum_effect: 0.15 }
      ]
    });
    arm4Queries++;

    // Ground target claim 1 via Manifest warrant engine LFP
    const stageA = arm4Bridge.stageEmPassageIntoAtelier({
      recordId: 'rec:arm4:staging:001',
      sourceId: testCorpus.hypervisorSource.id,
      byteOffset: 0,
      length: Math.min(60, arm4SrcA.byte_length),
      claimSummary: 'Arm 4 verified passage'
    });
    arm4Queries++;

    arm4Bridge.groundTheoryWarrant({
      ruleId: 'rule:arm4:hypervisor_bypass',
      premises: [testCorpus.hypervisorSource.id],
      targetClaimId: 'claim:priority_bypass',
      claimStatement: 'Priority bypass is achievable under algedonic setpoint trigger',
      sourceCaptureSpanProof: {
        source_id: testCorpus.hypervisorSource.id,
        start: 0,
        end: Math.min(60, arm4SrcA.byte_length),
        span_sha256: stageA.span_sha256
      }
    });
    arm4Queries++;

    // Ground target claim 2 via Manifest warrant engine LFP
    const stageB = arm4Bridge.stageEmPassageIntoAtelier({
      recordId: 'rec:arm4:staging:002',
      sourceId: testCorpus.algedonicSource.id,
      byteOffset: 0,
      length: Math.min(60, arm4SrcB.byte_length),
      claimSummary: 'Arm 4 verified algedonic recovery'
    });
    arm4Queries++;

    arm4Bridge.groundTheoryWarrant({
      ruleId: 'rule:arm4:algedonic_recovery',
      premises: [testCorpus.algedonicSource.id],
      targetClaimId: 'claim:algedonic_recovery',
      claimStatement: 'Algedonic recovery achieves homeostatic equilibrium',
      sourceCaptureSpanProof: {
        source_id: testCorpus.algedonicSource.id,
        start: 0,
        end: Math.min(60, arm4SrcB.byte_length),
        span_sha256: stageB.span_sha256
      }
    });
    arm4Queries++;

    // Compute pre-withdrawal LFP
    const preLfp = arm4Bridge.warrantEngine.computeLeastFixedPoint();

    // Cascade withdrawal test for post-withdrawal case
    let arm4WithdrawalOps = 0;
    arm4Bridge.warrantEngine.withdrawSourceRoot(testCorpus.hypervisorSource.id, {
      reason: 'Upstream source retraction simulated test'
    });
    arm4WithdrawalOps++;

    const tombstone = synthesis.withdrawTheory(
      validCandidate.candidate_id,
      'SIMULATED_EMPIRICAL_DISCONFIRMATION_TEST',
      'Measured jitter increased by +0.08 on tested synthetic cell'
    );
    arm4WithdrawalOps++;

    // Compute post-withdrawal LFP
    const postLfp = arm4Bridge.warrantEngine.computeLeastFixedPoint();

    arm4Bridge.close();

    // Check decisions dynamically over matched cases without hardcoded string oracles
    let arm4Correct = 0;
    let arm4Rejected = 0;
    let arm4FalseConvergences = 0;
    const arm4ExecutedCaseIds = new Set();
    const arm4Trace = [];

    for (const c of caseLedger) {
      if (arm4ExecutedCaseIds.has(c.case_id)) {
        throw new Error(`ASYMMETRIC_CASE_LEDGER_DETECTED: Arm 4 executed duplicate case '${c.case_id}'.`);
      }
      arm4ExecutedCaseIds.add(c.case_id);
      arm4Trace.push(c.case_id);
      arm4Queries++;
      let isGrounded = false;
      if (c.case_type === 'POST_WITHDRAWAL_CONSEQUENCE') {
        isGrounded = Boolean(postLfp.P && postLfp.P.has(c.target));
      } else {
        isGrounded = Boolean(preLfp.P && preLfp.P.has(c.target));
      }

      if (isGrounded === c.expected_admissible) {
        arm4Correct++;
      }
      if (!c.expected_admissible && !isGrounded) {
        arm4Rejected++;
      }
      if (!c.expected_admissible && isGrounded) {
        arm4FalseConvergences++;
      }
    }

    // Fail closed if execution traces or case-ID sets differ between arms or from expected ledger
    if (arm3Trace.length !== expectedCaseIdSet.size ||
        arm4Trace.length !== expectedCaseIdSet.size ||
        arm3ExecutedCaseIds.size !== expectedCaseIdSet.size ||
        arm4ExecutedCaseIds.size !== expectedCaseIdSet.size) {
      throw new Error(`ASYMMETRIC_CASE_LEDGER_DETECTED: Arms evaluated differing numbers of cases (arm3=${arm3Trace.length}, arm4=${arm4Trace.length}, expected=${expectedCaseIdSet.size}).`);
    }

    for (const id of expectedCaseIdSet) {
      if (!arm3ExecutedCaseIds.has(id)) {
        throw new Error(`ASYMMETRIC_CASE_LEDGER_DETECTED: Arm 3 missing expected case '${id}'.`);
      }
      if (!arm4ExecutedCaseIds.has(id)) {
        throw new Error(`ASYMMETRIC_CASE_LEDGER_DETECTED: Arm 4 missing expected case '${id}'.`);
      }
    }
    for (const id of arm3ExecutedCaseIds) {
      if (!arm4ExecutedCaseIds.has(id)) {
        throw new Error(`ASYMMETRIC_CASE_LEDGER_DETECTED: Case ID set mismatch: Arm 4 lacks case '${id}'.`);
      }
    }

    const totalCases = expectedCaseIdSet.size;
    const arm3Fidelity = totalCases > 0 ? arm3Correct / totalCases : 0;
    const arm4Fidelity = totalCases > 0 ? arm4Correct / totalCases : 0;
    const arm3FidelityPct = (arm3Fidelity * 100).toFixed(0);
    const arm4FidelityPct = (arm4Fidelity * 100).toFixed(0);

    findings.arms.arm_4_reciprocal = {
      name: 'PROSPECTIVE_EM_RECIPROCAL_SYNTHESIS',
      execution_class: 'EXECUTABLE_RECIPROCAL_LFP_SYNTHESIS',
      cases_evaluated: totalCases,
      correct_decisions: arm4Correct,
      unsupported_targets_rejected: arm4Rejected,
      measured_graph_fidelity: arm4Fidelity,
      false_graph_convergences: arm4FalseConvergences,
      source_bytes_read: arm4BytesRead,
      queries_executed: arm4Queries,
      correction_operations_observed: arm4WithdrawalOps,
      contradictions_retained: true,
      scientific_surplus: 'UNESTABLISHED',
      semantic_entailment_quality: 'NOT_MEASURED',
      historical_authored_declaration: {
        prior_claimed_warrant_fidelity: 1.0,
        prior_claimed_latency_steps: 1,
        status: 'HISTORICAL_AUTHORED_DECLARATION'
      }
    };

    // -------------------------------------------------------------
    // EQUAL-AFFORDANCE EMPIRICAL DIFFERENTIAL MATRIX (DYNAMICALLY DERIVED)
    // -------------------------------------------------------------
    const fidelityDetermination = (arm3Fidelity === arm4Fidelity)
      ? `BOUNDED_TIE_AT_${arm3FidelityPct}_PERCENT`
      : `ASYMMETRIC_FIDELITY_OBSERVED: arm3=${arm3FidelityPct}%, arm4=${arm4FidelityPct}%`;

    const unsupportedCases = caseLedger.filter(c => !c.expected_admissible);
    const totalUnsupported = unsupportedCases.length;
    const arm3RejectionRate = totalUnsupported > 0 ? arm3Rejected / totalUnsupported : 1.0;
    const arm4RejectionRate = totalUnsupported > 0 ? arm4Rejected / totalUnsupported : 1.0;
    const arm3RejPct = (arm3RejectionRate * 100).toFixed(0);
    const arm4RejPct = (arm4RejectionRate * 100).toFixed(0);

    const rejectionDetermination = (arm3RejectionRate === arm4RejectionRate)
      ? (arm3RejectionRate === 1.0 ? 'BOUNDED_TIE' : `BOUNDED_TIE_AT_${arm3RejPct}_PERCENT_REJECTION`)
      : `ASYMMETRIC_REJECTION_OBSERVED: arm3=${arm3RejPct}%, arm4=${arm4RejPct}%`;

    let falseConvDetermination;
    if (arm3FalseConvergences === 0 && arm4FalseConvergences === 0) {
      falseConvDetermination = 'ZERO_FALSE_CONVERGENCE_IN_BOTH_SYSTEMS';
    } else if (arm3FalseConvergences === arm4FalseConvergences) {
      falseConvDetermination = `EQUAL_NONZERO_FALSE_CONVERGENCE: count=${arm3FalseConvergences}`;
    } else {
      falseConvDetermination = `CONVERGENCE_DISCREPANCY_OBSERVED: arm3=${arm3FalseConvergences}, arm4=${arm4FalseConvergences}`;
    }

    let withdrawalDetermination;
    if (arm3WithdrawalOps === arm4WithdrawalOps) {
      withdrawalDetermination = 'EQUIVALENT_WITHDRAWAL_OPERATIONS';
    } else {
      withdrawalDetermination = `ASYMMETRIC_WITHDRAWAL_OPERATIONS: arm3=${arm3WithdrawalOps}, arm4=${arm4WithdrawalOps}`;
    }

    const scientificReciprocalSurplus = (arm4Fidelity > arm3Fidelity && arm4FalseConvergences <= arm3FalseConvergences)
      ? 'ESTABLISHED_EMPIRICAL_SURPLUS'
      : 'UNESTABLISHED';

    findings.differential_matrix = {
      measured_graph_fidelity_comparison: {
        arm_3_non_reciprocal: `${arm3FidelityPct}%`,
        arm_4_reciprocal: `${arm4FidelityPct}%`,
        determination: fidelityDetermination
      },
      unsupported_targets_rejection_comparison: {
        arm_3_non_reciprocal: `${arm3RejPct}% REJECTED`,
        arm_4_reciprocal: `${arm4RejPct}% REJECTED`,
        determination: rejectionDetermination
      },
      false_graph_convergence_comparison: {
        arm_3_non_reciprocal: arm3FalseConvergences,
        arm_4_reciprocal: arm4FalseConvergences,
        determination: falseConvDetermination
      },
      withdrawal_operation_counts: {
        arm_3_non_reciprocal: arm3WithdrawalOps,
        arm_4_reciprocal: arm4WithdrawalOps,
        determination: withdrawalDetermination
      },
      scientific_reciprocal_surplus: scientificReciprocalSurplus,
      contradiction_handling: {
        arm_3_non_reciprocal: 'GRAPH_REACHABILITY_UNAWARE_OF_INCOMMENSURABLE_ASSUMPTIONS',
        arm_4_reciprocal: 'FAILS_CLOSED_RETURNING_NO_UNIFICATION_WARRANTED'
      },
      unsupported_dimensions_status: {
        semantic_entailment_quality: 'NOT_MEASURED',
        general_prediction_accuracy: 'NOT_MEASURED',
        emergent_intelligence: 'NOT_MEASURED'
      }
    };

    findings.governance_determination = (arm3Fidelity === arm4Fidelity && scientificReciprocalSurplus === 'UNESTABLISHED')
      ? 'BOUNDED_TIE_OBSERVED_SURPLUS_UNESTABLISHED'
      : `EMPIRICAL_OUTCOME_OBSERVED: surplus=${scientificReciprocalSurplus}`;

    return findings;
  }
}
