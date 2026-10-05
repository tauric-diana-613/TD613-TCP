#!/usr/bin/env node
/**
 * scripts/audit-claim-ceiling.mjs
 * 
 * Claim-Ceiling Enforcement Engine (TD613 Exteriority Observatory · Section VII)
 * 
 * Rejects or downgrades illegal epistemic promotions.
 * Evaluates claims against available evidence classes without scalar scoring.
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Known forbidden promotion rules mapping pattern -> violation code & required downgrade.
 */
export const FORBIDDEN_PROMOTION_RULES = [
  {
    id: 'R4_TO_CAPABILITY_BOUND',
    pattern: /(r4|one-continuation|route closure).*(only permits 1|forbids continuation|terminal capability|capability bound)/i,
    requiredEvidenceClass: 'FORMAL_PROTOCOL_SPECIFICATION',
    forbiddenPhrases: ['only permits 1 continuation', 'forbids continuation 2', 'proved terminal capability bound', 'system forbids continuation 2'],
    enforcedCeiling: 'OBSERVER_TRAVERSAL_SCOPE_ONLY',
    rationale: 'An observer traversing one continuation witnesses client cessation at t1; it does not witness whether the runtime physically forbade a second continuation.'
  },
  {
    id: 'SAME_HOST_TO_EXOGENOUS',
    pattern: /(subagent|spawn_subagent|same-host|local cleanroom).*(exogenous|external witness|independent receiver)/i,
    requiredEvidenceClass: 'EXOGENOUS_RECEIVER_INSPECTION',
    forbiddenPhrases: ['exogenous witness', 'independent external verification', 'exterior reproduction'],
    enforcedCeiling: 'LOCAL_SAME_HOST_RECONSTRUCTION_ONLY',
    rationale: 'Same-host subagents share operating system, local network, file systems, and environment variables; they cannot witness exogenous exteriority.'
  },
  {
    id: 'TESTS_TO_PRODUCTION_VALIDITY',
    pattern: /(green test|tests pass|all passed|exit code 0).*(production valid|production ready|safe for production|production verified)/i,
    requiredEvidenceClass: 'PRODUCTION_RELOCK_RECEIPT',
    forbiddenPhrases: ['production ready', 'production valid', 'production verified'],
    enforcedCeiling: 'AUTOMATED_SUITE_CONFORMANCE_ONLY',
    rationale: 'Automated test suite execution in mock or JSDOM environments does not measure live production network behavior, workload identity, or human safety.'
  },
  {
    id: 'PATCH_APPLY_TO_RUNTIME_BEHAVIOR',
    pattern: /(patch apply|git apply|reconstruct cleanly).*(runtime behavior|live execution verified|behavior witnessed)/i,
    requiredEvidenceClass: 'EXTERNAL_CI_RUNNER_EXECUTION',
    forbiddenPhrases: ['runtime behavior verified', 'behavior witnessed'],
    enforcedCeiling: 'SOURCE_RECONSTRUCTION_ONLY',
    rationale: 'Successful text reconstruction of a patch establishes syntactic application, not runtime execution or behavioral invariant survival.'
  },
  {
    id: 'R3_TO_HUMAN_COMPREHENSION',
    pattern: /(r3|remote execution|ci runner).*(human comprehension|human understanding|ergonomically verified|user accepted)/i,
    requiredEvidenceClass: 'HUMAN_FACING_BROWSER_WITNESS',
    forbiddenPhrases: ['human comprehension verified', 'ergonomically verified', 'intuitively understood'],
    enforcedCeiling: 'AUTOMATED_BEHAVIORAL_SURVIVAL_ONLY',
    rationale: 'Remote automated execution cannot observe or establish human cognition, usability, or psychological acceptance.'
  },
  {
    id: 'MAPPING_TO_WITNESSED_SURVIVAL',
    pattern: /(constructed mapping|declared mapping|schema alignment).*(witnessed semantic survival|proven semantic survival)/i,
    requiredEvidenceClass: 'EXOGENOUS_RECEIVER_INSPECTION',
    forbiddenPhrases: ['witnessed semantic survival', 'proven semantic survival'],
    enforcedCeiling: 'SYNTACTIC_CORRESPONDENCE_HYPOTHESIS_ONLY',
    rationale: 'Constructing an ontology map establishes a structural hypothesis; semantic survival requires an empirical receiver challenge.'
  },
  {
    id: 'SUFFICIENT_TO_MINIMAL',
    pattern: /(sufficient representation|preserves distinctions).*(minimal basis|mathematically minimal|unique basis)/i,
    requiredEvidenceClass: 'EXOGENOUS_RECEIVER_INSPECTION',
    forbiddenPhrases: ['minimal basis', 'mathematically minimal', 'unique basis'],
    enforcedCeiling: 'SUFFICIENT_REPRESENTATION_ONLY',
    rationale: 'Demonstrating that an 8-action basis separates lawful supports proves sufficiency, not mathematical minimality or uniqueness.'
  },
  {
    id: 'NO_INTENTIONAL_CALL_TO_UNCHANGED',
    pattern: /(no intentional remote call|offline harness).*(remote state proven unchanged|remote custody intact)/i,
    requiredEvidenceClass: 'PRODUCTION_RELOCK_RECEIPT',
    forbiddenPhrases: ['remote state proven unchanged', 'remote custody intact'],
    enforcedCeiling: 'CLIENT_ABSTENTION_ATTESTATION_ONLY',
    rationale: 'Refraining from issuing an outbound network request witnesses client behavior only; it does not audit remote server state.'
  },
  {
    id: 'IDENTICAL_RUNS_TO_REPLAY_STABILITY',
    pattern: /(two matching executions|deterministic rerun|consecutive passes).*(replay stability established|classification replay stable)/i,
    requiredEvidenceClass: 'EXTERNAL_CI_RUNNER_EXECUTION',
    forbiddenPhrases: ['classification replay stability established', 'replay stability proven'],
    enforcedCeiling: 'DETERMINISTIC_REPETITION_ONLY',
    rationale: 'Replay stability requires a formal perturbation assay across declared noise coordinates, not unperturbed deterministic reruns.'
  },
  {
    id: 'UNMERGED_PR_TO_MAIN',
    pattern: /(pr #1433|green pr|validation run #\d+).*(merged to main|part of main|main contains)/i,
    requiredEvidenceClass: 'PRODUCTION_RELOCK_RECEIPT',
    forbiddenPhrases: ['merged to main', 'part of main', 'main contains'],
    enforcedCeiling: 'ISOLATED_PR_CANDIDACY_ONLY',
    rationale: 'An open green pull request is an unmerged branch; treating it as part of main misrepresents repository custody.'
  }
];

/**
 * Evaluate a structured claim record against claim-ceiling rules.
 * @param {object} claimRecord
 * @returns {object} evaluation outcome
 */
export function evaluateClaimRecord(claimRecord) {
  const statement = claimRecord.claim_statement || '';
  const evidenceClass = claimRecord.evidence_class || 'UNKNOWN';
  const supportingReceipts = claimRecord.supporting_receipt_ids || [];
  const unmeasured = claimRecord.unmeasured_coordinates || [];

  const violations = [];
  let verdict = 'VALID';
  let enforcedCeiling = claimRecord.claim_statement;
  const rationales = [];

  for (const rule of FORBIDDEN_PROMOTION_RULES) {
    const matchesPattern = rule.pattern.test(statement);
    const usesForbiddenPhrase = rule.forbiddenPhrases.some(p => statement.toLowerCase().includes(p.toLowerCase()));

    if (matchesPattern || usesForbiddenPhrase) {
      if (evidenceClass !== rule.requiredEvidenceClass) {
        violations.push({
          rule_id: rule.id,
          required_evidence_class: rule.requiredEvidenceClass,
          actual_evidence_class: evidenceClass,
          forbidden_phrases_found: rule.forbiddenPhrases.filter(p => statement.toLowerCase().includes(p.toLowerCase())),
          rationale: rule.rationale,
          enforced_ceiling: rule.enforcedCeiling
        });
        rationales.push(rule.rationale);
        enforcedCeiling = rule.enforcedCeiling;
      }
    }
  }

  if (violations.length > 0) {
    verdict = 'REJECTED';
  } else if (unmeasured.length > 0) {
    // If the claim is valid but unmeasured coordinates exist, check if wording acknowledges bounds
    verdict = 'VALID';
  }

  return {
    claim_id: claimRecord.claim_id,
    claim_statement: statement,
    evidence_class: evidenceClass,
    supporting_receipt_ids: supportingReceipts,
    unmeasured_coordinates: unmeasured,
    allowed_wording: claimRecord.allowed_wording || [],
    forbidden_promotion: claimRecord.forbidden_promotion || [],
    evaluation_disposition: {
      verdict,
      violations,
      enforced_ceiling: enforcedCeiling,
      rationale: rationales.join(' | ') || 'Claim stays within bounded evidence class.'
    }
  };
}

/**
 * Audit an array of claim records.
 * @param {Array<object>} claimRecords
 * @returns {object} audit report
 */
export function auditClaimLedger(claimRecords) {
  const evaluated = claimRecords.map(evaluateClaimRecord);
  const total = evaluated.length;
  const valid = evaluated.filter(c => c.evaluation_disposition.verdict === 'VALID').length;
  const rejected = evaluated.filter(c => c.evaluation_disposition.verdict === 'REJECTED').length;
  const downgraded = evaluated.filter(c => c.evaluation_disposition.verdict === 'DOWNGRADED').length;

  return {
    total_claims: total,
    valid_count: valid,
    rejected_count: rejected,
    downgraded_count: downgraded,
    claims: evaluated
  };
}

// CLI entrypoint
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error('Usage: node scripts/audit-claim-ceiling.mjs <claims.json>');
    process.exit(1);
  }

  const content = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const records = Array.isArray(content) ? content : (content.claims || [content]);
  const report = auditClaimLedger(records);
  console.log(JSON.stringify(report, null, 2));

  if (report.rejected_count > 0) {
    console.error(`\n[FAIL · CLAIM_CEILING_BREACH] ${report.rejected_count} claim(s) attempted forbidden promotions.`);
    process.exit(2);
  }
}
