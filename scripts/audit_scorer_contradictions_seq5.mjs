import fs from 'node:fs';
import path from 'node:path';

const baseDir = 'research/sequence-5-differential-replication';
const rawDir = path.join(baseDir, '11-RAW_RECEIVER_OUTPUTS');
const rawManifest = JSON.parse(fs.readFileSync(path.join(rawDir, 'raw-outputs-sha256.json'), 'utf8'));

const s1 = JSON.parse(fs.readFileSync(path.join(baseDir, '10-BLIND_SEMANTIC_SCORER_1.json'), 'utf8'));
const s2 = JSON.parse(fs.readFileSync(path.join(baseDir, '10-BLIND_SEMANTIC_SCORER_2.json'), 'utf8'));

const positiveRegex = /\b(correct|correctly|properly|accurate|accurately|enforced|identified|preserved|upheld|exhibited)\b/i;
const negativeRegex = /\b(failed|missed|falsely|violated|miscalibrated|compromised)\b/i;

const auditReport = {
  assay: "TD613-SEQ5-ASSAY-20261005",
  stage: "SCORER_CONTRADICTION_AUDIT",
  timestamp: new Date().toISOString(),
  runs_audited: Object.keys(s1.evaluations).length,
  total_evaluations: Object.keys(s1.evaluations).length * 16 * 2,
  hash_mismatches: [],
  contradictions_s1: [],
  contradictions_s2: [],
  contradiction_count: 0,
  audit_status: "PENDING"
};

for (const [blindToken, run1] of Object.entries(s1.evaluations)) {
  const run2 = s2.evaluations[blindToken];
  const manifestEntry = Object.values(rawManifest).find(m => m.blind_token === blindToken);

  // Check 1: SHA-256 match across scorers and raw manifest
  if (run1.sha256 !== run2.sha256 || run1.sha256 !== manifestEntry.sha256) {
    auditReport.hash_mismatches.push({
      blind_token: blindToken,
      s1_sha: run1.sha256,
      s2_sha: run2.sha256,
      raw_sha: manifestEntry ? manifestEntry.sha256 : null
    });
  }

  // Check 2: Scorer 1 note vs score polarity
  for (const [itemId, itemData] of Object.entries(run1.items)) {
    const score = itemData.structural_score;
    const note = itemData.notes;

    const hasPositive = positiveRegex.test(note);
    const hasNegative = negativeRegex.test(note);

    if (score === 0 && hasPositive && !hasNegative) {
      auditReport.contradictions_s1.push({
        blind_token: blindToken,
        item_id: itemId,
        score: score,
        note: note,
        violation: "POSITIVE_SCORER_NOTE_ZERO_SCORE"
      });
      auditReport.contradiction_count++;
    }

    if (score === 1 && hasNegative && !hasPositive) {
      auditReport.contradictions_s1.push({
        blind_token: blindToken,
        item_id: itemId,
        score: score,
        note: note,
        violation: "NEGATIVE_SCORER_NOTE_FULL_SCORE"
      });
      auditReport.contradiction_count++;
    }
  }

  // Check 3: Scorer 2 note vs score polarity
  for (const [itemId, itemData] of Object.entries(run2.items)) {
    const score = itemData.calibration_score;
    const note = itemData.notes;

    const hasPositive = positiveRegex.test(note);
    const hasNegative = negativeRegex.test(note);

    if (score === 0 && hasPositive && !hasNegative) {
      auditReport.contradictions_s2.push({
        blind_token: blindToken,
        item_id: itemId,
        score: score,
        note: note,
        violation: "POSITIVE_SCORER_NOTE_ZERO_SCORE"
      });
      auditReport.contradiction_count++;
    }

    if (score === 1 && hasNegative && !hasPositive) {
      auditReport.contradictions_s2.push({
        blind_token: blindToken,
        item_id: itemId,
        score: score,
        note: note,
        violation: "NEGATIVE_SCORER_NOTE_FULL_SCORE"
      });
      auditReport.contradiction_count++;
    }
  }
}

const passed = auditReport.contradiction_count === 0 && auditReport.hash_mismatches.length === 0;
auditReport.audit_status = passed ? "AUDIT_PASSED_ZERO_CONTRADICTIONS" : "AUDIT_FAILED_CONTRADICTIONS_DETECTED";

fs.writeFileSync(path.join(baseDir, '12-SCORER_CONTRADICTION_AUDIT.json'), JSON.stringify(auditReport, null, 2));

console.log(`SCORER CONTRADICTION AUDIT:`);
console.log(`Runs audited: ${auditReport.runs_audited}`);
console.log(`Total evaluations audited: ${auditReport.total_evaluations}`);
console.log(`Hash mismatches: ${auditReport.hash_mismatches.length}`);
console.log(`Contradictions detected: ${auditReport.contradiction_count}`);
console.log(`Status: ${auditReport.audit_status}`);

if (!passed) {
  process.exit(1);
}
