#!/usr/bin/env node
/**
 * scripts/audit-classification-replay.mjs
 * 
 * Classification Replay-Stability Perturbation Assay Harness (TD613 Exteriority Observatory · Section X)
 * 
 * Prevents ordinary deterministic reruns from being promoted to "replay stability".
 * Formally evaluates a classification rule against declared perturbation families
 * (whitespace jitter, JSON key reordering, harmless comment insertion, line ending changes).
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const PERTURBATION_FAMILIES = [
  'WHITESPACE_JITTER',
  'JSON_KEY_REORDERING',
  'COMMENT_MUTATION',
  'NEWLINE_NORMALIZATION_LF_CRLF',
  'PROPERTY_ORDER_PERMUTATION'
];

/**
 * Apply a declared harmless perturbation to input data without semantic distortion.
 * @param {string} text
 * @param {string} family
 * @returns {string} perturbed text
 */
export function applyPerturbation(text, family) {
  switch (family) {
    case 'WHITESPACE_JITTER':
      // Add trailing spaces to non-empty lines
      return text.split('\n').map(l => l.length > 0 ? l + ' ' : l).join('\n');
    case 'JSON_KEY_REORDERING':
      try {
        const obj = JSON.parse(text);
        if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
          const keys = Object.keys(obj).reverse();
          const reordered = {};
          for (const k of keys) reordered[k] = obj[k];
          return JSON.stringify(reordered, null, 2);
        }
      } catch {}
      return text;
    case 'NEWLINE_NORMALIZATION_LF_CRLF':
      return text.replace(/\r?\n/g, '\r\n');
    case 'COMMENT_MUTATION':
      return '// [replay-stability-perturbation-probe]\n' + text;
    default:
      return text;
  }
}

/**
 * Audit a classification replay experiment.
 * @param {object} assaySpec
 * @param {Function} classifierFn
 * @returns {object} assay report
 */
export function runClassificationReplayAssay(assaySpec, classifierFn) {
  const inputEvidence = assaySpec.frozen_input_evidence || '';
  const declaredFamilies = assaySpec.declared_perturbation_family || [];
  const baselineClassification = classifierFn(inputEvidence);

  const results = [];
  let isStableAcrossAll = true;

  for (const family of declaredFamilies) {
    const perturbedText = applyPerturbation(inputEvidence, family);
    const postClassification = classifierFn(perturbedText);

    const changedCoordinates = [];
    const invariantCoordinates = [];

    const keys = Object.keys(baselineClassification);
    for (const k of keys) {
      if (JSON.stringify(baselineClassification[k]) === JSON.stringify(postClassification[k])) {
        invariantCoordinates.push(k);
      } else {
        changedCoordinates.push({
          coordinate: k,
          before: baselineClassification[k],
          after: postClassification[k]
        });
      }
    }

    const familyStable = changedCoordinates.length === 0;
    if (!familyStable) isStableAcrossAll = false;

    results.push({
      perturbation_family: family,
      is_stable: familyStable,
      classification_before: baselineClassification,
      classification_after: postClassification,
      changed_coordinates: changedCoordinates,
      invariant_coordinates: invariantCoordinates
    });
  }

  const finalStatus = declaredFamilies.length === 0 
    ? 'HELD_NO_PERTURBATIONS_DECLARED'
    : (isStableAcrossAll ? 'REPLAY_STABILITY_WITNESSED' : 'REPLAY_STABILITY_FALSIFIED');

  return {
    assay_id: assaySpec.assay_id || 'TD613-REPLAY-ASSAY',
    target: assaySpec.target || 'UNKNOWN',
    status: finalStatus,
    aperture_disposition: finalStatus === 'REPLAY_STABILITY_WITNESSED' ? 'STABLE' : 'HELD',
    decision_rule: assaySpec.decision_rule || 'Classification must remain invariant across all declared perturbation families.',
    perturbation_results: results
  };
}

// CLI entrypoint
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const specPath = process.argv[2];
  if (!specPath) {
    console.error('Usage: node scripts/audit-classification-replay.mjs <replay-spec.json>');
    process.exit(1);
  }

  const spec = JSON.parse(fs.readFileSync(specPath, 'utf8'));
  // Default mock classifier: returns length and character set presence
  const defaultClassifier = (txt) => ({
    has_carriage: txt.includes('carriage') || txt.includes('governed'),
    has_rest: txt.includes('REST') || txt.includes('DONE'),
    character_class: txt.length > 0 ? 'NON_EMPTY' : 'EMPTY'
  });

  const report = runClassificationReplayAssay(spec, defaultClassifier);
  console.log(JSON.stringify(report, null, 2));
}
