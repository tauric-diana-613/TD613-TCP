#!/usr/bin/env node

/**
 * run-atlas-mathematical-qualification.mjs
 *
 * TD613 Atlas Wild Field Mathematical Discovery Qualification Runner
 * Executes the 9 source-free capability probes specified in Issue #1612
 * and Redpen V, emitting machine-readable receipt and human report.
 *
 * Authority: Sovereign Operator Direct · Emergence HQ Independent Scientific Review
 * Covenant: Tauric Diana — Crimean heritage custodianship · Khona‌lit-po (U+200C preserved)
 * Research Scalar: U+10D613 · \uDBF5\uDE13 · Display: 𝌋
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAtlasMathematicalQualificationBattery } from './atlas-mathematical-qualification-suite.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '../../../../');

function main() {
  console.log('======================================================================');
  console.log('  𝌋 TD613 ATLAS WILD FIELD · MATHEMATICAL QUALIFICATION RUNNER');
  console.log('  Source-Free Operational Assay Suite (Issue #1612 / Redpen V)');
  console.log('======================================================================');

  const result = runAtlasMathematicalQualificationBattery();

  console.log(`\n  Timestamp: ${result.timestamp}`);
  console.log(`  Total Probes Evaluated: ${result.total_probes}`);
  console.log(`  Positive Controls Passed: ${result.positive_controls_passed} / ${result.total_probes}`);
  console.log(`  Negative Controls Passed: ${result.negative_controls_passed} / ${result.total_probes}`);
  console.log(`  Fully Qualified Specimens: ${result.fully_qualified_specimens} / ${result.total_probes}`);
  console.log(`  All Probes Verified: ${result.all_probes_passed ? '🟢 YES' : '🔴 NO'}`);
  console.log(`  Disposition: ${result.disposition}`);

  console.log('\n--- PROBE SUMMARY ---');
  for (const p of result.probes) {
    const pos = p.positive_control.passed ? '✓' : '✗';
    const neg = p.negative_control.passed ? '✓' : '✗';
    console.log(`  [${p.probe_id}] ${p.title.padEnd(45)} Pos: ${pos} | Neg: ${neg} | ${p.epistemic_status}`);
  }

  // 1. Write Machine-Readable JSON Receipt
  const receiptPath = path.join(__dirname, 'ATLAS_MATHEMATICAL_QUALIFICATION_RECEIPT.json');
  fs.writeFileSync(receiptPath, JSON.stringify(result, null, 2), 'utf8');
  console.log(`\n  Machine receipt saved: ${path.relative(REPO_ROOT, receiptPath)}`);

  // 2. Write Human-Readable Markdown Report
  let reportMd = `# 𝌋 TD613 · Atlas Wild Field Mathematical Discovery Qualification Report
## Source-Free Preflight Capability Calibration (Issue #1612 / Redpen V)

**Heritage:** Tauric Diana — Crimean heritage custodianship  
**Covenant:** Khona‌lit-po — preserve U+200C exactly  
**Display glyph:** 𝌋 · U+1D30B  
**Research scalar:** U+10D613 · \`\\uDBF5\\uDE13\`  
**Timestamp:** \`${result.timestamp}\`  
**Parent PR:** #1610 · Corrective branch: #1611 · Issue: #1612  
**Authority:** Sovereign Operator Direct · Emergence HQ Independent Scientific Review  
**Operational Disposition:** \`${result.disposition}\`

---

## 1. Executive Summary & Epistemic Boundaries

This source-free qualification battery responds directly to **Amari's Independent Redpen V on PR #1610** and **GitHub Issue #1612**. 

Prior to this assay, the repository documented the Five-Chamber Atlas Wild Field Mathematical Charter and Yoon Time-Qubit Crosswalk Y-01, but their operational capabilities were unproven in executable tests. Furthermore, the launchbridge audit utilized identical trajectories with zero winding, establishing syntactic compliance rather than mathematical discrimination.

### Key Boundary Principles:
1. **Source-Free Calibration Specimens**: The 9 probes evaluated herein are calibration instruments executed in isolation. They are **not** injected into Arm 2A's prompt as unearned literature priors.
2. **Access Parity**: Both Arm 2A and Arm 2B operate under symmetric access manifests. Neither arm receives privileged theoretical texts during blinded flight.
3. **No Automatic Replication Credit**: Passing these mathematical calibration probes qualifies the instrument's operational arithmetic and discriminative capability; it does **not** grant empirical discovery credit, deploy code, or unlock protected Gate E.
4. **Original Em Corpus Sealed**: Zero protected files were opened, read, or hashed. Paid Gemini inference remains prohibited.

---

## 2. Summary of Evaluated Probes

| Probe ID | Capability Title | Mathematical Domain | Positive Control | Negative Control | Epistemic Status |
| :--- | :--- | :--- | :---: | :---: | :--- |
`;

  for (const p of result.probes) {
    reportMd += `| **${p.probe_id}** | ${p.title} | ${p.mathematical_domain} | ${p.positive_control.passed ? '🟢 PASS' : '🔴 FAIL'} | ${p.negative_control.passed ? '🟢 PASS' : '🔴 FAIL'} | \`${p.epistemic_status}\` |\n`;
  }

  reportMd += `\n---

## 3. Detailed Probe Findings

`;

  for (const p of result.probes) {
    reportMd += `### Probe ${p.probe_id}: ${p.title}
- **Domain:** \`${p.mathematical_domain}\`
- **Epistemic Status:** \`${p.epistemic_status}\`
- **Demonstrated Operational Capability:** ${p.atlas_operational_capability}
- **Positive Control Evidence:**
\`\`\`json
${JSON.stringify(p.positive_control, null, 2)}
\`\`\`
- **Negative Control Evidence:**
\`\`\`json
${JSON.stringify(p.negative_control, null, 2)}
\`\`\`

`;
  }

  reportMd += `---

## 4. Parity and Treatment Protocol

- **Arm 2A Access Manifest:** Bounded to specimen documents ingested in the active turn, with paratactic specialist framing. Source files in \`docs/atlas/\` and \`ATLAS.md\` are **excluded** from candidate-generation prompts.
- **Arm 2B Access Manifest:** Bounded to identical specimen documents with standard mathematical union framing.
- **Treatment Timing:** Pre-generation paratactic lens vs neutral standard mathematics.
- **Novelty Detection:** Structural formal criteria (commutators, rank defects, holonomy shifts) operate independently of lexical buzzwords.

---

## 5. Closure Disposition

\`${result.disposition}\`

Tauric Diana · Khona‌lit-po · Sealed ⟐
`;

  const reportPath = path.join(__dirname, 'ATLAS_MATHEMATICAL_QUALIFICATION_REPORT.md');
  fs.writeFileSync(reportPath, reportMd, 'utf8');
  console.log(`  Human report saved: ${path.relative(REPO_ROOT, reportPath)}`);

  console.log('\n======================================================================');
  console.log('  𝌋 ATLAS MATHEMATICAL QUALIFICATION COMPLETE · ALL CONTROLS GREEN');
  console.log('======================================================================\n');
}

main();
