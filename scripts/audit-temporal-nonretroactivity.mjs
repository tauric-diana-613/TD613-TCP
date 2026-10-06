#!/usr/bin/env node
/**
 * scripts/audit-temporal-nonretroactivity.mjs
 * 
 * Temporal Non-Retroactivity Auditor (TD613 Temporal Custodian)
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

export const ALLOWED_AMENDMENT_TYPES = ['CORRECTION', 'REFINEMENT', 'RECLASSIFICATION'];

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
  let prevSequence = -1;
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];

    if (!entry.entry_id || entry.t_sequence === undefined || !entry.timestamp || !entry.observation) {
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

    // Sequence monotonicity check
    const currentSeq = parseInt(String(entry.t_sequence).replace(/\D/g, ''), 10);
    if (!isNaN(currentSeq)) {
      if (currentSeq <= prevSequence) {
        violations.push({
          type: 'TEMPORAL_SEQUENCE_INVERSION',
          entry_id: entry.entry_id,
          t_sequence: entry.t_sequence,
          prev_sequence: prevSequence,
          message: `Sequence ${entry.t_sequence} is not monotonically increasing after ${prevSequence}.`
        });
      }
      prevSequence = currentSeq;
    }

    // Timestamp monotonicity check
    const currentTs = new Date(entry.timestamp).getTime();
    if (!isNaN(currentTs)) {
      if (prevTimestamp !== null && currentTs < prevTimestamp) {
        violations.push({
          type: 'TEMPORAL_MONOTONICITY_INVERSION',
          entry_id: entry.entry_id,
          timestamp: entry.timestamp,
          prev_timestamp: new Date(prevTimestamp).toISOString(),
          message: `Timestamp ${entry.timestamp} moves backwards in time relative to predecessor.`
        });
      }
      prevTimestamp = currentTs;
    }

    // Check amendments
    if (entry.amendments) {
      if (!Array.isArray(entry.amendments)) {
        violations.push({
          type: 'MALFORMED_AMENDMENTS',
          entry_id: entry.entry_id,
          message: `Amendments for entry ${entry.entry_id} must be an array.`
        });
      } else {
        for (let a = 0; a < entry.amendments.length; a++) {
          const amd = entry.amendments[a];
          if (!ALLOWED_AMENDMENT_TYPES.includes(amd.amendment_type)) {
            violations.push({
              type: 'INVALID_AMENDMENT_TYPE',
              entry_id: entry.entry_id,
              amendment_type: amd.amendment_type,
              message: `Amendment type '${amd.amendment_type}' is not permitted. Allowed: ${ALLOWED_AMENDMENT_TYPES.join(', ')}.`
            });
          }
          if (!amd.appended_at || !amd.appended_by || !amd.note) {
            violations.push({
              type: 'INCOMPLETE_AMENDMENT',
              entry_id: entry.entry_id,
              index: a,
              message: `Amendment ${a} of entry ${entry.entry_id} lacks required audit trail fields (appended_at, appended_by, note).`
            });
          }
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

// CLI runner if invoked directly
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) {
  const targetFile = process.argv[2];
  if (!targetFile) {
    console.error('Usage: node scripts/audit-temporal-nonretroactivity.mjs <temporal-ledger.json> [baseline-ledger.json]');
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(targetFile, 'utf8'));
  const entries = Array.isArray(raw) ? raw : raw.entries;

  let baselineEntries = null;
  if (process.argv[3]) {
    const rawBase = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
    baselineEntries = Array.isArray(rawBase) ? rawBase : rawBase.entries;
  }

  const report = auditTemporalLedger(entries, baselineEntries);
  console.log(JSON.stringify(report, null, 2));

  if (!report.is_valid) {
    process.exit(1);
  }
}
