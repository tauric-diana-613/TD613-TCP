#!/usr/bin/env node
/**
 * scripts/audit-receipt-lineage.mjs
 * 
 * Receipt Lifecycle & Temporal Lineage Auditor (TD613 Exteriority Observatory · Section V)
 * 
 * Enforces the hard invariant:
 *   PRE-EGRESS RECEIPT != POST-EGRESS OBSERVATION
 * 
 * Rejects receipts where pre-egress carrier intents purport to attest post-egress transport,
 * execution results, or exogenous receiver observations.
 */

import fs from 'node:fs';
import path from 'node:path';

export const VALID_RECEIPT_TYPES = [
  'EGRESS_INTENT',
  'REMOTE_REF_ACKNOWLEDGEMENT',
  'REMOTE_PACKET_OBSERVATION',
  'RECEIVER_RECONSTRUCTION',
  'RECEIVER_EXECUTION',
  'RECEIVER_BEHAVIORAL_FINDING',
  'ADJUDICATION'
];

export const FORBIDDEN_PRE_EGRESS_FIELDS = [
  'observed_exit_code',
  'test_pass_count',
  'remote_run_id',
  'receiver_verdict',
  'execution_host',
  'remote_fetch_observed_at',
  'external_witness_result'
];

/**
 * Audit an individual receipt or receipt chain.
 * @param {object} receipt
 * @returns {object} evaluation outcome
 */
export function auditReceipt(receipt) {
  const violations = [];
  const type = receipt.receipt_type;

  if (!VALID_RECEIPT_TYPES.includes(type)) {
    violations.push({
      type: 'INVALID_RECEIPT_TYPE',
      message: `Unknown receipt type '${type}'. Must be one of: ${VALID_RECEIPT_TYPES.join(', ')}.`
    });
  }

  // Enforce Pre-Egress boundary
  if (type === 'EGRESS_INTENT') {
    if (receipt.stage !== 'PRE_EGRESS') {
      violations.push({
        type: 'STAGE_MISMATCH',
        message: `EGRESS_INTENT receipt must have stage 'PRE_EGRESS', found '${receipt.stage}'.`
      });
    }

    const payload = receipt.payload || {};
    for (const forbidden of FORBIDDEN_PRE_EGRESS_FIELDS) {
      if (forbidden in payload) {
        violations.push({
          type: 'TEMPORAL_FUTURE_LEAKAGE',
          field: forbidden,
          message: `PRE-EGRESS receipt '${receipt.receipt_id}' improperly contains post-egress field '${forbidden}'. An immutable carrier cannot observe its own future transport.`
        });
      }
    }
  }

  // Enforce Post-Egress receipts declaring predecessor
  if (['REMOTE_PACKET_OBSERVATION', 'RECEIVER_RECONSTRUCTION', 'RECEIVER_EXECUTION', 'ADJUDICATION'].includes(type)) {
    if (!receipt.predecessor_receipt_id) {
      violations.push({
        type: 'MISSING_PREDECESSOR_LINKAGE',
        message: `Post-egress receipt type '${type}' must cryptographically bind a predecessor_receipt_id.`
      });
    }
  }

  return {
    receipt_id: receipt.receipt_id || 'UNKNOWN',
    receipt_type: type,
    is_valid: violations.length === 0,
    violations
  };
}

/**
 * Audit a complete chain of receipts.
 * @param {Array<object>} receipts
 * @returns {object} chain audit report
 */
export function auditReceiptChain(receipts) {
  const results = receipts.map(auditReceipt);
  const totalViolations = results.reduce((acc, r) => acc + r.violations.length, 0);

  return {
    is_valid: totalViolations === 0,
    receipt_count: receipts.length,
    total_violations: totalViolations,
    receipts: results
  };
}

// CLI entrypoint
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error('Usage: node scripts/audit-receipt-lineage.mjs <receipts.json>');
    process.exit(1);
  }

  const content = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const receipts = Array.isArray(content) ? content : (content.receipts || [content]);
  const report = auditReceiptChain(receipts);
  console.log(JSON.stringify(report, null, 2));

  if (!report.is_valid) {
    console.error(`\n[FAIL · RECEIPT_LINEAGE_BREACH] Observed ${report.total_violations} receipt lifecycle violation(s).`);
    process.exit(2);
  }
}
