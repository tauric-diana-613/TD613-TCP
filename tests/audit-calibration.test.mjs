// Audit calibration runner. Reads tests/audit-calibration/labels.mjs (a
// human-judged set of source/donor/output triples), runs the engine's
// audit signals on each, and reports whether the audit's pass/fail bar
// agrees with the human label.
//
// Three reports:
//   1. Agreement at the current bar (the same bar held-out + retrieval use).
//   2. Per-signal precision/recall against the labels — does each
//      individual signal correlate with "preserves"?
//   3. propositionCoverage threshold sweep — at what coverage cutoff does
//      the audit best agree with human judgment?
//
// Reporting-only — does not gate npm test. The starter labels are
// Claude-authored and explicitly non-authoritative; the user should
// review and re-label as needed (see labels.mjs header).

import {
  buildSemanticAuditBundle,
  countConjunctionStacks,
  countRepeatedWordBoundaries,
  segmentTextToIR
} from '../app/engine/stylometry.js';
import { AUDIT_LABELS } from './audit-calibration/labels.mjs';

const COVERAGE_FLOOR = 0.85;
const ANCHOR_FLOOR = 0.95;

function auditOutput(record) {
  const ir = segmentTextToIR(record.sourceText, { literals: [], text: record.sourceText });
  const bundle = buildSemanticAuditBundle(ir, record.outputText, { literals: [] });
  return {
    propositionCoverage: Number(bundle.semanticAudit.propositionCoverage ?? 1),
    actorCoverage: Number(bundle.semanticAudit.actorCoverage ?? 1),
    actionCoverage: Number(bundle.semanticAudit.actionCoverage ?? 1),
    objectCoverage: Number(bundle.semanticAudit.objectCoverage ?? 1),
    protectedAnchorIntegrity: Number(bundle.protectedAnchorAudit.protectedAnchorIntegrity ?? 1),
    conjunctionStackCount: countConjunctionStacks(record.outputText),
    repeatedWordBoundaryCount: countRepeatedWordBoundaries(record.outputText),
    textDiffers: record.outputText !== record.sourceText
  };
}

function passesCurrentBar(audit) {
  return (
    audit.propositionCoverage >= COVERAGE_FLOOR &&
    audit.protectedAnchorIntegrity >= ANCHOR_FLOOR &&
    audit.conjunctionStackCount === 0 &&
    audit.repeatedWordBoundaryCount === 0 &&
    audit.textDiffers
  );
}

function counts(records, predicate) {
  return records.reduce((acc, r) => acc + (predicate(r) ? 1 : 0), 0);
}

function precisionRecallF1(tp, fp, fn) {
  const precision = (tp + fp) === 0 ? 0 : tp / (tp + fp);
  const recall = (tp + fn) === 0 ? 0 : tp / (tp + fn);
  const f1 = (precision + recall) === 0 ? 0 : (2 * precision * recall) / (precision + recall);
  return { precision, recall, f1 };
}

const annotated = AUDIT_LABELS.map((record) => ({
  ...record,
  audit: auditOutput(record),
  humanPreserves: record.label === 'preserves'
}));

console.log(`audit calibration: ${annotated.length} labeled cases`);
console.log(`  ${counts(annotated, (r) => r.humanPreserves)} labeled 'preserves' / ${counts(annotated, (r) => !r.humanPreserves)} labeled 'breaks'`);
console.log();

// === Report 1: agreement at current bar ===
console.log('--- agreement at current bar ---');
console.log('  bar: propositionCoverage>=0.85, protectedAnchorIntegrity>=0.95, conjunctionStackCount=0,');
console.log('       repeatedWordBoundaryCount=0, text!=source');
let auditPassMatchesHuman = 0;
let auditPassDisagreesHuman = 0;
let auditFailMatchesHuman = 0;
let auditFailDisagreesHuman = 0;
for (const r of annotated) {
  const auditPasses = passesCurrentBar(r.audit);
  const human = r.humanPreserves;
  if (auditPasses && human) auditPassMatchesHuman += 1;
  else if (auditPasses && !human) auditPassDisagreesHuman += 1;
  else if (!auditPasses && !human) auditFailMatchesHuman += 1;
  else auditFailDisagreesHuman += 1;
  const verdict = (auditPasses === human) ? 'OK' : 'MISMATCH';
  console.log(`  ${verdict.padEnd(8)} ${r.id.padEnd(50)} audit=${auditPasses ? 'pass' : 'fail'} / human=${r.label}  cov=${r.audit.propositionCoverage.toFixed(3)} conj=${r.audit.conjunctionStackCount} echo=${r.audit.repeatedWordBoundaryCount}`);
}
const total = annotated.length;
const agreement = (auditPassMatchesHuman + auditFailMatchesHuman) / Math.max(1, total);
console.log();
console.log(`  agreement: ${auditPassMatchesHuman + auditFailMatchesHuman}/${total} (${(agreement * 100).toFixed(1)}%)`);
console.log(`  audit-pass + human-preserves (true positive):  ${auditPassMatchesHuman}`);
console.log(`  audit-pass + human-breaks    (false positive): ${auditPassDisagreesHuman}`);
console.log(`  audit-fail + human-preserves (false negative): ${auditFailDisagreesHuman}`);
console.log(`  audit-fail + human-breaks    (true negative):  ${auditFailMatchesHuman}`);
const currentPRF1 = precisionRecallF1(auditPassMatchesHuman, auditPassDisagreesHuman, auditFailDisagreesHuman);
console.log(`  precision: ${currentPRF1.precision.toFixed(3)}  recall: ${currentPRF1.recall.toFixed(3)}  F1: ${currentPRF1.f1.toFixed(3)}`);
console.log();

// === Report 2: per-signal correlation ===
console.log('--- per-signal correlation with human label ---');
const breaks = annotated.filter((r) => !r.humanPreserves);
const preserves = annotated.filter((r) => r.humanPreserves);
console.log('  signal                      | mean(preserves) | mean(breaks) | spread');
function meanField(records, field) {
  if (!records.length) return 0;
  return records.reduce((acc, r) => acc + r.audit[field], 0) / records.length;
}
const signalRows = [
  ['propositionCoverage', 'propositionCoverage'],
  ['actionCoverage', 'actionCoverage'],
  ['objectCoverage', 'objectCoverage'],
  ['protectedAnchorIntegrity', 'protectedAnchorIntegrity'],
  ['conjunctionStackCount', 'conjunctionStackCount'],
  ['repeatedWordBoundaryCount', 'repeatedWordBoundaryCount']
];
for (const [label, field] of signalRows) {
  const meanP = meanField(preserves, field);
  const meanB = meanField(breaks, field);
  const spread = (meanP - meanB).toFixed(3);
  console.log(`  ${label.padEnd(28)}|     ${meanP.toFixed(3).padEnd(8)}    |    ${meanB.toFixed(3).padEnd(7)}   | ${spread}`);
}
console.log('  (positive spread → signal higher on preserves; negative → signal higher on breaks)');
console.log();

// === Report 3: propositionCoverage threshold sweep ===
console.log('--- propositionCoverage threshold sweep ---');
console.log('  (other gates held at conjunctionStackCount=0, repeatedWordBoundaryCount=0,');
console.log('   protectedAnchorIntegrity>=0.95, text!=source — only coverage threshold varies)');
console.log('  threshold | TP  FP  FN  TN  | precision  recall    F1');
const thresholds = [];
for (let t = 0.70; t <= 0.99; t += 0.025) thresholds.push(Math.round(t * 1000) / 1000);
let bestF1 = -1;
let bestThreshold = COVERAGE_FLOOR;
for (const threshold of thresholds) {
  let tp = 0, fp = 0, fn = 0, tn = 0;
  for (const r of annotated) {
    const passes = (
      r.audit.propositionCoverage >= threshold &&
      r.audit.protectedAnchorIntegrity >= ANCHOR_FLOOR &&
      r.audit.conjunctionStackCount === 0 &&
      r.audit.repeatedWordBoundaryCount === 0 &&
      r.audit.textDiffers
    );
    if (passes && r.humanPreserves) tp += 1;
    else if (passes && !r.humanPreserves) fp += 1;
    else if (!passes && r.humanPreserves) fn += 1;
    else tn += 1;
  }
  const { precision, recall, f1 } = precisionRecallF1(tp, fp, fn);
  if (f1 > bestF1) { bestF1 = f1; bestThreshold = threshold; }
  const marker = threshold === COVERAGE_FLOOR ? ' ← current' : '';
  console.log(`  ${threshold.toFixed(3)}     | ${String(tp).padEnd(2)}  ${String(fp).padEnd(2)}  ${String(fn).padEnd(2)}  ${String(tn).padEnd(2)}  | ${precision.toFixed(3)}     ${recall.toFixed(3)}     ${f1.toFixed(3)}${marker}`);
}
console.log();
console.log(`  best F1 against this label set: ${bestF1.toFixed(3)} at coverage threshold ${bestThreshold.toFixed(3)}`);
console.log(`  (current threshold ${COVERAGE_FLOOR.toFixed(3)} F1 = ${precisionRecallF1(auditPassMatchesHuman, auditPassDisagreesHuman, auditFailDisagreesHuman).f1.toFixed(3)})`);
console.log();
console.log('reporting-only; does not gate npm test. labels are Claude-authored starter set, not authoritative.');
console.log('add labels in tests/audit-calibration/labels.mjs to refine calibration.');
