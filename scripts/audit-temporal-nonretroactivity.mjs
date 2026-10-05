#!/usr/bin/env node
/**
 * scripts/audit-temporal-nonretroactivity.mjs
 * 
 * Temporal Non-Retroactivity Auditor (TD613 Exteriority Observatory · Section VIII)
 * 
 * Enforces the hard temporal laws:
 *   LATER RECONSTRUCTIBILITY != EARLIER OBSERVABILITY
 *   LATER CLOSURE != EARLIER KNOWLEDGE
 * 
 * Validates that later evidence appends CORRECTION, REFINEMENT, or RECLASSIFICATION
 * without altering or erasing antecedent historical observation entries.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

/**
 * Valid amendment types
 */
export const ALLOWED_AMENDMENT_TYPES = ['CORRECTION', 'REFINEMENT', 'RECLASSIFICATION'];

/**
 * Validate temporal progression and immutability across an array of historical ledger entries.
 * @param {Array<object>} entries
 * @param {Array<object>} baselineEntries (optional prior snapshot to check for mutations)
 * @returns {object} audit report
 */
export function auditTemporalLedger(entries, baselineEntries = null) {
  const violations = [];
  const validatedEntries = [];

  if (!Array.isArray(entries) || entries.length === 0) {
    return {
      is_valid: false,
      violations: ['Ledger entries must be a non-empty array.'],
      entry_count: 0
    };
  }

  // 1. If baseline is provided, ensure all baseline entries exist identically in current entries
  if (baselineEntries && Array.isArray(baselineEntries)) {
    for (let i = 0; i < baselineEntries.length; i++) {
      const base = baselineEntries[i];
      const curr = entries.find(e => e.entry_id === base.entry_id);

      if (!curr) {
        violations.push({
          type: 'HISTORICAL_ENTRY_DELETED',
          entry_id: base.entry_id,
          message: `Antecedent entry ${base.entry_id} was removed from the ledger.`
        });
        continue;
      }

      // Check core immutable fields
      const coreFields = ['t_sequence', 'timestamp', 'state', 'observation', 'registered_event', 'authority'];
      for (const field of coreFields) {
        if (JSON.stringify(base[field]) !== JSON.stringify(curr[field])) {
          violations.push({
            type: 'RETROACTIVE_HISTORICAL_MUTATION',
            entry_id: base.entry_id,
            field,
            original_value: base[field],
            mutated_value: curr[field],
            message: `Field '${field}' of historical entry ${base.entry_id} was mutated retroactively. LATER_CLOSURE != EARLIER_KNOWLEDGE.`
          });
        }
      }
    }
  }

  // 2. Check each entry's internal structure and amendments
  let prevTimestamp = null;
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    if (!entry.entry_id || !entry.t_sequence || !entry.timestamp || !entry.observation) {
      violations.push({
        type: 'MALFORMED_ENTRY',
        index: i,
        message: `Entry at index ${i} lacks required historical fields (entry_id, t_sequence, timestamp, observation).`
      });
      continue;
    }

    if (entry.retroactive_rewrite_forbidden !== true) {
      violations.push({
        type: 'LAW_AFFIRMATION_MISSING',
        entry_id: entry.entry_id,
        message: `Entry ${entry.entry_id} must affirm retroactive_rewrite_forbidden: true.`
      });
    }

    // Timestamp monotonicity check
    const currentTs = new Date(entry.timestamp).getTime();
    if (!isNaN(currentTs) && prevTimestamp !== null && currentTs < prevTimestamp) {
      violations.push({
        type: 'TEMPORAL_MONOTONICITY_INVERSION',
        entry_id: entry.entry_id,
        message: `Entry ${entry.entry_id} timestamp (${entry.timestamp}) is earlier than predecessor timestamp.`
      });
    }
    if (!isNaN(currentTs)) {
      prevTimestamp = currentTs;
    }

    // Validate amendments
    if (entry.amendments && Array.isArray(entry.amendments)) {
      for (const amendment of entry.amendments) {
        if (!ALLOWED_AMENDMENT_TYPES.includes(amendment.amendment_type)) {
          violations.push({
            type: 'INVALID_AMENDMENT_TYPE',
            entry_id: entry.entry_id,
            amendment_type: amendment.amendment_type,
            message: `Amendment type '${amendment.amendment_type}' is invalid. Must be one of: ${ALLOWED_AMENDMENT_TYPES.join(', ')}.`
          });
        }
        if (!amendment.appended_at || !amendment.note || !amendment.appended_by) {
          violations.push({
            type: 'MALFORMED_AMENDMENT',
            entry_id: entry.entry_id,
            message: `Amendment on entry ${entry.entry_id} lacks required fields (appended_at, appended_by, note).`
          });
        }
      }
    }

    validatedEntries.push(entry.entry_id);
  }

  return {
    is_valid: violations.length === 0,
    entry_count: entries.length,
    validated_entries: validatedEntries,
    violations
  };
}

// CLI entrypoint
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const ledgerPath = process.argv[2];
  const baselinePath = process.argv[3] || null;

  if (!ledgerPath) {
    console.error('Usage: node scripts/audit-temporal-nonretroactivity.mjs <ledger.json> [baseline-ledger.json]');
    process.exit(1);
  }

  const ledgerContent = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
  const entries = Array.isArray(ledgerContent) ? ledgerContent : (ledgerContent.entries || []);

  let baselineEntries = null;
  if (baselinePath && fs.existsSync(baselinePath)) {
    const baseContent = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
    baselineEntries = Array.isArray(baseContent) ? baseContent : (baseContent.entries || []);
  }

  const report = auditTemporalLedger(entries, baselineEntries);
  console.log(JSON.stringify(report, null, 2));

  if (!report.is_valid) {
    console.error(`\n[FAIL · TEMPORAL_NON_RETROACTIVITY_BREACH] Observed ${report.violations.length} temporal invariant violation(s).`);
    process.exit(2);
  }
}
