#!/usr/bin/env node
/**
 * scripts/audit-exteriority-ladder.mjs
 * 
 * Exteriority Observatory Ladder Auditor (TD613 Exteriority Observatory · Section IV)
 * 
 * Audits structured ladder configurations and enforces hard barriers against
 * scalar promotion and false equivalence across R0..R3.5 coordinates.
 */

import fs from 'node:fs';
import path from 'node:path';

export const ORDERED_COORDINATES = [
  'R0', 'R1', 'R2', 'R2.5', 'R3.0', 'R3.1', 'R3.2', 'R3.3', 'R3.4', 'R3.5'
];

export const VALID_STATUSES = [
  'UNMEASURED', 'PASS', 'PASS_WITH_SCOPE', 'FAIL', 'HELD', 'INADMISSIBLE', 'PARTIAL', 'OBSERVED_PARTIAL'
];

/**
 * Validate an exteriority ladder object.
 * @param {object} ladderDoc
 * @returns {object} audit report
 */
export function auditExteriorityLadder(ladderDoc) {
  const violations = [];
  const coords = ladderDoc.ladder_coordinates || {};

  // 1. Check all coordinates exist
  for (const c of ORDERED_COORDINATES) {
    if (!coords[c]) {
      violations.push({
        type: 'MISSING_COORDINATE',
        coordinate: c,
        message: `Ladder coordinate ${c} is required.`
      });
      continue;
    }

    const item = coords[c];
    if (!VALID_STATUSES.includes(item.status)) {
      violations.push({
        type: 'INVALID_STATUS',
        coordinate: c,
        status: item.status,
        message: `Coordinate ${c} has invalid status '${item.status}'.`
      });
    }

    // 2. Validate receiver independence
    if (['R3.0', 'R3.1', 'R3.2', 'R3.3', 'R3.4'].includes(c) && item.status.startsWith('PASS')) {
      if (item.source && item.receiver && item.source.toLowerCase().includes('antigravity') && item.receiver.toLowerCase().includes('antigravity')) {
        violations.push({
          type: 'SELF_CERTIFICATION_PROMOTION',
          coordinate: c,
          message: `Coordinate ${c} claims PASS but lists same-system source and receiver '${item.source}'. Producer assertion != External witness.`
        });
      }
    }
  }

  // 3. Enforce promotion barriers
  // Barrier A: R2 cannot promote to R3
  if (coords.R2 && coords.R2.status === 'PASS' && coords['R3.0'] && coords['R3.0'].status === 'PASS') {
    if (coords['R3.0'].receiver === coords.R2.receiver) {
      violations.push({
        type: 'R2_TO_R3_FALSE_EQUIVALENCE',
        message: `R2 receiver matches R3.0 receiver ('${coords.R2.receiver}'). Same-host cleanroom cannot witness exogenous acquisition.`
      });
    }
  }

  // Barrier B: Source reconstruction (R3.2) cannot promote to Execution (R3.3)
  if (coords['R3.2'] && coords['R3.2'].status === 'PASS' && coords['R3.3'] && coords['R3.3'].status === 'UNMEASURED') {
    if (ladderDoc.claimed_behavior === 'EXECUTED') {
      violations.push({
        type: 'RECONSTRUCTION_TO_EXECUTION_PROMOTION',
        message: `R3.2 source reconstruction PASS cannot be promoted to execution claims when R3.3 is UNMEASURED.`
      });
    }
  }

  // Barrier C: R3.4 cannot claim human comprehension
  if (coords['R3.4'] && (coords['R3.4'].status === 'PASS' || coords['R3.4'].status === 'PASS_WITH_SCOPE')) {
    if (coords['R3.4'].claim_ceiling && coords['R3.4'].claim_ceiling.toLowerCase().includes('human')) {
      violations.push({
        type: 'AUTOMATION_TO_HUMAN_COMPREHENSION_PROMOTION',
        message: `R3.4 automated behavioral survival cannot claim human comprehension or physical usability.`
      });
    }
  }

  // 4. Verify unmeasured coordinates list contains obligatory items
  const obligatoryUnmeasured = [
    'HUMAN_COMPREHENSION',
    'PHYSICAL_DEVICE_BEHAVIOR',
    'LIVE_PROVIDER_EQUIVALENCE',
    'PRODUCTION_RUNTIME_EQUIVALENCE',
    'NEON_CUSTODY_STATE',
    'GENERAL_PRODUCT_USABILITY'
  ];

  const unmeasuredList = ladderDoc.unmeasured_coordinates || [];
  const missingObligatory = obligatoryUnmeasured.filter(u => !unmeasuredList.includes(u));

  if (missingObligatory.length > 0) {
    violations.push({
      type: 'OMITTED_UNMEASURED_BOUNDARIES',
      missing: missingObligatory,
      message: `The ladder must explicitly declare all unmeasured coordinates: ${missingObligatory.join(', ')}.`
    });
  }

  return {
    is_valid: violations.length === 0,
    target: ladderDoc.evaluated_target || 'UNKNOWN',
    base_commit: ladderDoc.base_commit || 'UNKNOWN',
    coordinate_count: Object.keys(coords).length,
    violations
  };
}

// CLI entrypoint
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error('Usage: node scripts/audit-exteriority-ladder.mjs <ladder.json>');
    process.exit(1);
  }

  const ladderDoc = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const report = auditExteriorityLadder(ladderDoc);
  console.log(JSON.stringify(report, null, 2));

  if (!report.is_valid) {
    console.error(`\n[FAIL · LADDER_INTEGRITY_BREACH] Observed ${report.violations.length} ladder integrity violation(s).`);
    process.exit(2);
  }
}
