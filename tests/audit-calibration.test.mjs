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

// === Report 4: learned audit (opt-in via ANTHROPIC_API_KEY or LEARNED_AUDIT_MOCK) ===
// The deterministic bar above is bag-overlap-based; it doesn't see hallucinated
// sentences, contrast-flipped connectors, dropped conditionals, or corrupted
// compounds. Asking Claude Opus 4.7 to judge meaning preservation directly
// gives us a calibrated bar against the same human labels — at the cost of
// (a) crossing the offline-deterministic line and (b) per-call cost.
//
// Two activation paths:
//   - ANTHROPIC_API_KEY set: real path, calls the API.
//   - LEARNED_AUDIT_MOCK=1: mock path, reads hand-written judgments from
//     tests/audit-calibration/mock-judgments.mjs. Useful for demonstrating
//     the harness when no API key is available; agreement is high by
//     construction since the mock judge and the labeler are the same author.
const learnedMode = process.env.ANTHROPIC_API_KEY
  ? 'real'
  : (process.env.LEARNED_AUDIT_MOCK ? 'mock' : 'off');
if (learnedMode !== 'off') {
  if (learnedMode === 'mock') {
    console.log('--- learned audit (MOCK — frozen hand-written judgments, not the LLM) ---');
    console.log('  bar: judgment.label === "preserves"');
    console.log('  caveat: mock judgments come from the same author as the labels, so agreement');
    console.log('          is high by construction. Use ANTHROPIC_API_KEY for a live measurement.');
  } else {
    console.log('--- learned audit (Claude Opus 4.7 via Anthropic API) ---');
    console.log('  bar: judgment.label === "preserves"');
  }
  let assessMeaningPreservation;
  try {
    if (learnedMode === 'mock') {
      ({ assessMeaningPreservation } = await import('./audit-calibration/mock-judgments.mjs'));
    } else {
      ({ assessMeaningPreservation } = await import('../app/engine/learned-audit.js'));
    }
  } catch (err) {
    console.log(`  could not load learned-audit module: ${err && err.message ? err.message : err}`);
    console.log('reporting-only; does not gate npm test. labels are Claude-authored starter set, not authoritative.');
    console.log('add labels in tests/audit-calibration/labels.mjs to refine calibration.');
    process.exit(0);
  }
  const learnedResults = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalCacheReadTokens = 0;
  let totalCacheCreationTokens = 0;
  for (const r of annotated) {
    try {
      const judgment = await assessMeaningPreservation({
        sourceText: r.sourceText,
        outputText: r.outputText,
        options: { labelId: r.id }
      });
      const passed = judgment.label === 'preserves';
      const verdict = (passed === r.humanPreserves) ? 'OK' : 'MISMATCH';
      learnedResults.push({ id: r.id, judgment, passed, humanPreserves: r.humanPreserves });
      console.log(`  ${verdict.padEnd(8)} ${r.id.padEnd(50)} llm=${judgment.label.padEnd(9)} score=${judgment.meaning_preserved.toFixed(2)}  / human=${r.label}`);
      if (judgment.issues && judgment.issues.length) {
        console.log(`           issues: ${judgment.issues.join('; ')}`);
      }
      if (judgment.reasoning) {
        console.log(`           reasoning: ${judgment.reasoning}`);
      }
      totalInputTokens += judgment.input_tokens;
      totalOutputTokens += judgment.output_tokens;
      totalCacheReadTokens += judgment.cache_read_tokens;
      totalCacheCreationTokens += judgment.cache_creation_tokens;
    } catch (err) {
      console.log(`  ERROR    ${r.id.padEnd(50)} ${err && err.message ? err.message : err}`);
    }
  }
  console.log();
  if (learnedResults.length) {
    let llmTp = 0, llmFp = 0, llmFn = 0, llmTn = 0;
    for (const lr of learnedResults) {
      if (lr.passed && lr.humanPreserves) llmTp += 1;
      else if (lr.passed && !lr.humanPreserves) llmFp += 1;
      else if (!lr.passed && lr.humanPreserves) llmFn += 1;
      else llmTn += 1;
    }
    const learnedAgreement = (llmTp + llmTn) / Math.max(1, learnedResults.length);
    const learnedPRF1 = precisionRecallF1(llmTp, llmFp, llmFn);
    console.log(`  agreement: ${llmTp + llmTn}/${learnedResults.length} (${(learnedAgreement * 100).toFixed(1)}%)`);
    console.log(`  audit-pass + human-preserves (true positive):  ${llmTp}`);
    console.log(`  audit-pass + human-breaks    (false positive): ${llmFp}`);
    console.log(`  audit-fail + human-preserves (false negative): ${llmFn}`);
    console.log(`  audit-fail + human-breaks    (true negative):  ${llmTn}`);
    console.log(`  precision: ${learnedPRF1.precision.toFixed(3)}  recall: ${learnedPRF1.recall.toFixed(3)}  F1: ${learnedPRF1.f1.toFixed(3)}`);
    console.log();
    console.log('  comparison vs deterministic bar:');
    console.log(`    deterministic F1 = ${currentPRF1.f1.toFixed(3)}  (precision=${currentPRF1.precision.toFixed(3)} recall=${currentPRF1.recall.toFixed(3)} agreement=${(agreement * 100).toFixed(1)}%)`);
    console.log(`    learned       F1 = ${learnedPRF1.f1.toFixed(3)}  (precision=${learnedPRF1.precision.toFixed(3)} recall=${learnedPRF1.recall.toFixed(3)} agreement=${(learnedAgreement * 100).toFixed(1)}%)`);
    console.log();
    console.log('  token usage across the run:');
    console.log(`    input: ${totalInputTokens}  output: ${totalOutputTokens}`);
    console.log(`    cache_read: ${totalCacheReadTokens}  cache_creation: ${totalCacheCreationTokens}`);
    console.log('    (high cache_read = system prompt is being reused across calls — good)');
  } else {
    console.log('  no successful judgments; nothing to summarize.');
  }
  console.log();
} else {
  console.log('--- learned audit ---');
  console.log('  skipping (no learned-audit mode active)');
  console.log('  to run real path:  export ANTHROPIC_API_KEY=... && npm run test:calibration');
  console.log('  to run mock path:  LEARNED_AUDIT_MOCK=1 npm run test:calibration');
  console.log();
}

console.log('reporting-only; does not gate npm test. labels are Claude-authored starter set, not authoritative.');
console.log('add labels in tests/audit-calibration/labels.mjs to refine calibration.');
