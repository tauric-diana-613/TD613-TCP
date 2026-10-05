#!/usr/bin/env node
/**
 * scripts/audit-authority-support.mjs
 * 
 * FADT Finite Admissibility & Authority-Support Auditor (TD613 Exteriority Observatory · Section IX)
 * 
 * Computes:
 *   U = Union of antecedent lawful supports
 *   I = Intersection of antecedent lawful supports
 *   Gamma = U \ I (Lawful support distinction gap)
 * 
 * Explicitly marks minimality status:
 *   SUFFICIENT / INSUFFICIENT
 *   MINIMALITY_UNPROVEN / MINIMALITY_WITNESSED
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Compute set union of arrays of strings.
 * @param {Array<Array<string>>} sets
 * @returns {Array<string>}
 */
export function computeUnion(sets) {
  const union = new Set();
  for (const s of sets) {
    for (const item of s) {
      union.add(item);
    }
  }
  return Array.from(union).sort();
}

/**
 * Compute set intersection of arrays of strings.
 * @param {Array<Array<string>>} sets
 * @returns {Array<string>}
 */
export function computeIntersection(sets) {
  if (sets.length === 0) return [];
  let intersection = new Set(sets[0]);
  for (let i = 1; i < sets.length; i++) {
    const current = new Set(sets[i]);
    intersection = new Set(Array.from(intersection).filter(x => current.has(x)));
  }
  return Array.from(intersection).sort();
}

/**
 * Compute set difference: A \ B
 * @param {Array<string>} setA
 * @param {Array<string>} setB
 * @returns {Array<string>}
 */
export function computeDifference(setA, setB) {
  const setBLookup = new Set(setB);
  return setA.filter(x => !setBLookup.has(x)).sort();
}

/**
 * Audit a single quotient candidate given antecedent lawful supports.
 * @param {object} candidate
 * @returns {object} evaluated candidate with U, I, Gamma, and minimality status
 */
export function auditQuotientCandidate(candidate) {
  const coordinate = candidate.erased_conditioning_coordinate;
  const supportsObj = candidate.antecedent_supports || {};
  const supportKeys = Object.keys(supportsObj);
  const supportArrays = supportKeys.map(k => supportsObj[k]);

  const union_U = computeUnion(supportArrays);
  const intersection_I = computeIntersection(supportArrays);
  const gamma_gap = computeDifference(union_U, intersection_I);

  // If Gamma is non-empty, erasing the conditioning coordinate collapses distinct lawful supports into one,
  // causing illegal escalation unless an explicit boundary restores distinguishing authority.
  const hasCollapseObstruction = gamma_gap.length > 0;
  const descent_status = hasCollapseObstruction ? 'DESCENT_OBSTRUCTED' : 'DESCENT_ADMISSIBLE';

  // Check if representation is sufficient to separate actions
  const sufficiency_status = candidate.sufficiency_status || (hasCollapseObstruction ? 'SUFFICIENT' : 'INSUFFICIENT');

  // Enforce the rule: Sufficiency NEVER implies Minimality
  let minimality_status = candidate.minimality_status || 'MINIMALITY_UNPROVEN';
  if (candidate.asserted_minimality === true && !candidate.minimality_witness_proof) {
    minimality_status = 'MINIMALITY_UNPROVEN';
  }

  return {
    erased_conditioning_coordinate: coordinate,
    antecedent_supports: supportsObj,
    union_U,
    intersection_I,
    gamma_gap,
    descent_status,
    sufficiency_status,
    minimality_status,
    notes: hasCollapseObstruction
      ? `Erasing '${coordinate}' causes Gamma gap of [${gamma_gap.join(', ')}]. Boundary membrane required to preserve finite quotient.`
      : `Erasing '${coordinate}' preserves antecedent supports exactly without escalation.`
  };
}

/**
 * Audit full authority support specification.
 * @param {object} spec
 * @returns {object} audit report
 */
export function auditAuthoritySupportSpec(spec) {
  const candidates = spec.quotient_candidates || [];
  const evaluated = candidates.map(auditQuotientCandidate);

  return {
    evaluation_id: spec.evaluation_id || 'TD613-FADT-EVAL',
    target_model: spec.target_model || 'UNKNOWN',
    actions: spec.actions || [],
    states: spec.states || [],
    total_candidates: evaluated.length,
    obstructed_count: evaluated.filter(c => c.descent_status === 'DESCENT_OBSTRUCTED').length,
    admissible_count: evaluated.filter(c => c.descent_status === 'DESCENT_ADMISSIBLE').length,
    quotient_candidates: evaluated
  };
}

// CLI entrypoint
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error('Usage: node scripts/audit-authority-support.mjs <authority-spec.json>');
    process.exit(1);
  }

  const specContent = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const report = auditAuthoritySupportSpec(specContent);
  console.log(JSON.stringify(report, null, 2));
}
