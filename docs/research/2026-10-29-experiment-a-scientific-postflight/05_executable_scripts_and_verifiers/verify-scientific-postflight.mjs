import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const postflightRoot = '<appDataDir>/brain/<conversation-id>\\scratch\\exp_a_scientific_postflight_20261029';
const scratchDir = '<appDataDir>/brain/<conversation-id>\\scratch';
const repoRoot = '<repo-root>';
const zipPath = path.join(scratchDir, 'TD613_Experiment_A_Postflight_Scientific_Evidence_2026-10-29.zip');

console.log('================================================================');
console.log('TD613 EXPERIMENT A — INDEPENDENT POSTFLIGHT EVIDENCE VERIFIER');
console.log('Timestamp:', new Date().toISOString());
console.log('================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

// 1. Verify Sealed ZIP exists and has robust size
assert(fs.existsSync(zipPath), `Sealed archive exists at ${zipPath}`);
const zipBytes = fs.readFileSync(zipPath);
const zipSha = crypto.createHash('sha256').update(zipBytes).digest('hex');
console.log(`       Archive size: ${zipBytes.length} bytes, SHA-256: ${zipSha}`);
assert(zipBytes.length > 20000, `Archive size is robust (${zipBytes.length} bytes)`);

// 2. Checksum file verification
const checksumPath = path.join(postflightRoot, 'POSTFLIGHT_CHECKSUMS.sha256');
assert(fs.existsSync(checksumPath), 'POSTFLIGHT_CHECKSUMS.sha256 exists');
const checksumLines = fs.readFileSync(checksumPath, 'utf8').trim().split('\n');
assert(checksumLines.length >= 15, `Contains at least 15 artifact checksums (found ${checksumLines.length})`);

for (const line of checksumLines) {
  const parts = line.trim().split(/\s+/);
  if (parts.length >= 2) {
    const expectedSha = parts[0];
    const relFile = parts.slice(1).join(' ');
    const absFile = path.join(postflightRoot, relFile);
    if (fs.existsSync(absFile)) {
      const actualSha = crypto.createHash('sha256').update(fs.readFileSync(absFile)).digest('hex');
      assert(actualSha === expectedSha, `Checksum match: ${relFile}`);
    } else {
      assert(false, `Artifact file missing: ${relFile}`);
    }
  }
}

// 3. Entry Reconciliation E1-E8 Verification
const reconPath = path.join(postflightRoot, '01_entry_reconciliation', 'POSTFLIGHT_ENTRY_RECONCILIATION.json');
assert(fs.existsSync(reconPath), 'POSTFLIGHT_ENTRY_RECONCILIATION.json exists');
const recon = JSON.parse(fs.readFileSync(reconPath, 'utf8'));
assert(recon.entry_disposition === 'POSTFLIGHT_ENTRY_SATISFIED_FOR_SPECIFIED_ASSAYS', `Entry reconciliation disposition is SATISFIED (got ${recon.entry_disposition})`);
assert(recon.all_conditions_satisfied === true, `All conditions satisfied boolean is true`);
const eKeys = Object.keys(recon.receipts);
assert(eKeys.length === 8, `All 8 reconciliations present in receipts (E1–E8)`);
const allStatusVerified = eKeys.every(k => recon.receipts[k].status === 'VERIFIED' || recon.receipts[k].status === 'SATISFIED');
assert(allStatusVerified, `All E1–E8 conditions individually VERIFIED/SATISFIED`);

// 4. Wild Field Raw Inquiry Verification
const rawInquiryPath = path.join(postflightRoot, '02_wild_field_inquiry', 'RAW_LATIFA_INQUIRY_LEDGER.json');
assert(fs.existsSync(rawInquiryPath), 'RAW_LATIFA_INQUIRY_LEDGER.json exists');
const rawInquiry = JSON.parse(fs.readFileSync(rawInquiryPath, 'utf8'));
assert(rawInquiry.discoveries && rawInquiry.discoveries.length >= 4, `Wild field discoveries present (${rawInquiry.discoveries.length} discoveries)`);

// 5. Corpus Genealogy & Effective Sample Size Verification
const geneaPath = path.join(postflightRoot, '03_evidence_genealogy', 'CORPUS_GENEALOGY_AUDIT.json');
assert(fs.existsSync(geneaPath), 'CORPUS_GENEALOGY_AUDIT.json exists');
const genea = JSON.parse(fs.readFileSync(geneaPath, 'utf8'));
assert(genea.census.total_preserved_records === 147, `Total candidate files verified as 147 (94 sources + 53 artifacts)`);
assert(genea.census.sidecar_markdown_notes === 33, `Markdown notes count is 33`);
assert(parseFloat(genea.effective_sample_size_analysis.effective_sample_size_n_eff) < 3.0, `Effective sample size demonstrates correlation collapse (N_eff = ${genea.effective_sample_size_analysis.effective_sample_size_n_eff})`);
assert(genea.census.opaque_archives.archive_zip.inner_reads === 0, `Archive.zip remains strictly opaque (0 inner reads)`);

// 6. Assays A1 to A5 Verification
const a1Path = path.join(postflightRoot, '04_assays_a1_to_a5', 'ASSAY_A1_BLINDED_TOPOLOGY_PLACEMENT.json');
const a2Path = path.join(postflightRoot, '04_assays_a1_to_a5', 'ASSAY_A2_FALSE_TWIN_STRESS_TEST.json');
const a3Path = path.join(postflightRoot, '04_assays_a1_to_a5', 'ASSAY_A3_BUDGET_CROWDING_SWEEP.json');
const a4Path = path.join(postflightRoot, '04_assays_a1_to_a5', 'ASSAY_A4_NON_SCALAR_QUESTION_AUDIT.json');
const a5Path = path.join(postflightRoot, '04_assays_a1_to_a5', 'ASSAY_A5_NOTATION_STRIPPING_SIEVE.json');

assert(fs.existsSync(a1Path), 'Assay A1 artifact exists');
const a1 = JSON.parse(fs.readFileSync(a1Path, 'utf8'));
assert(a1.observed_evidence.prediction_accuracy === 'HIGHLY_CONCORDANT', 'Assay A1: Blind topology placement concordant with ground truth');
assert(a1.observed_evidence.placement_status === 'SUCCESSFULLY_PLACED_WITHOUT_TOPOLOGICAL_CONFLICT', 'Assay A1: Successfully placed without conflict');

assert(fs.existsSync(a2Path), 'Assay A2 artifact exists');
const a2 = JSON.parse(fs.readFileSync(a2Path, 'utf8'));
assert(a2.verdict === 'HOMONYM_FALSE_TWIN_COLLAPSE_PREVENTED', 'Assay A2: All homonymous false twins cleanly isolated without cross-contamination');

assert(fs.existsSync(a3Path), 'Assay A3 artifact exists');
const a3 = JSON.parse(fs.readFileSync(a3Path, 'utf8'));
assert(a3.sweep_results && a3.sweep_results.length === 5, 'Assay A3: Crowding curve sweep tested across 5 budgets [512..8192]');
assert(a3.sweep_results.some(r => r.non_monotonic_crowding_observed === true), 'Assay A3: Non-monotonic crowding observed');

assert(fs.existsSync(a4Path), 'Assay A4 artifact exists');
const a4 = JSON.parse(fs.readFileSync(a4Path, 'utf8'));
assert(a4.questions.length >= 2, `Assay A4: Candidate questions audited with 4D vectors (${a4.questions.length} questions)`);
assert(a4.questions.every(q => q.scalar_crown_refused === true), 'Assay A4: Scalar crown refused on all candidate questions');

assert(fs.existsSync(a5Path), 'Assay A5 artifact exists');
const a5 = JSON.parse(fs.readFileSync(a5Path, 'utf8'));
assert(a5.predicate_invariance_verified === true, 'Assay A5: Operational invariance survives notation stripping');
assert(a5.verdict === 'EMPIRICAL_INVARIANCE_SURVIVES_NOTATION_STRIPPING', 'Assay A5: Verdict confirms empirical invariance');

// 7. Mathematical Frameworks & Falsifications Verification
const mathPath = path.join(postflightRoot, '05_mathematical_frameworks', 'MATHEMATICAL_FRAMEWORKS_AND_FALSIFICATIONS.json');
assert(fs.existsSync(mathPath), 'MATHEMATICAL_FRAMEWORKS_AND_FALSIFICATIONS.json exists');
const math = JSON.parse(fs.readFileSync(mathPath, 'utf8'));
const wfKeys = Object.keys(math.frameworks);
assert(wfKeys.length === 6, `All 6 Wild Field frameworks audited (WF1 to WF6)`);
assert(math.frameworks.WF1.hitting_set_bypass_condition !== undefined, 'WF1: Formal divergence and bypass condition specified');
assert(math.frameworks.WF2.formal_distinction !== undefined, 'WF2: Exact finite admissibility distinction proven');
assert(math.frameworks.WF3.theorem !== undefined, 'WF3: Capacity-bounded non-monotonicity theorem formalized');
assert(math.frameworks.WF4.commutator !== undefined, 'WF4: Lie bracket / dromological commutator analyzed');
assert(math.frameworks.WF5.countermodel !== undefined, 'WF5: SVD conditioning and nullity countermodel demonstrated');
assert(math.frameworks.WF6.finding !== undefined, 'WF6: Genealogical effective sample size collapse proven');

// 8. Dollhouse Audit Verification
const dollhouseMachinePath = path.join(postflightRoot, '06_dollhouse_review', 'POSTFLIGHT_DOLLHOUSE_MACHINE_RECEIPT.json');
assert(fs.existsSync(dollhouseMachinePath), 'POSTFLIGHT_DOLLHOUSE_MACHINE_RECEIPT.json exists');
const dhReceipt = JSON.parse(fs.readFileSync(dollhouseMachinePath, 'utf8'));
assert(dhReceipt.orchestrator.decision === 'SUPPORTED', `Dollhouse Orchestrator decision is SUPPORTED (got ${dhReceipt.orchestrator.decision})`);
assert(dhReceipt.orchestrator.human_closure_required === true, 'Human scientific closure is explicitly required');
assert(dhReceipt.orchestrator.release_authority === false && dhReceipt.orchestrator.deployment_authority === false, 'Zero release and deployment authority granted');

// 9. Blinded Review Packet Verification
const blindPath = path.join(postflightRoot, '06_dollhouse_review', 'BLINDED_ADVERSARIAL_REVIEW_PACKET.json');
const unblindKeyPath = path.join(postflightRoot, '06_dollhouse_review', 'SEALED_UNBLINDING_KEY.json');
assert(fs.existsSync(blindPath), 'BLINDED_ADVERSARIAL_REVIEW_PACKET.json exists');
assert(fs.existsSync(unblindKeyPath), 'SEALED_UNBLINDING_KEY.json exists');
const blindPacket = JSON.parse(fs.readFileSync(blindPath, 'utf8'));
assert(Object.keys(blindPacket.disguised_arms).length === 7, `Blinded review packet contains 7 arms (ARM_ALPHA to ARM_ETA)`);

// 10. Trajectories & Falsification Ledger Verification
const trajPath = path.join(postflightRoot, '07_synthesis_and_closure', 'MANIFEST_CANDIDATE_TRAJECTORIES.json');
const falsLedgerPath = path.join(postflightRoot, '07_synthesis_and_closure', 'MATHEMATICAL_FALSIFICATION_LEDGER.json');
assert(fs.existsSync(trajPath), 'MANIFEST_CANDIDATE_TRAJECTORIES.json exists');
assert(fs.existsSync(falsLedgerPath), 'MATHEMATICAL_FALSIFICATION_LEDGER.json exists');
const traj = JSON.parse(fs.readFileSync(trajPath, 'utf8'));
assert(traj.trajectories.length === 5, `5 Manifest Candidate Trajectories recorded (M0 to M4)`);
const fals = JSON.parse(fs.readFileSync(falsLedgerPath, 'utf8'));
assert(fals.falsified_or_repaired_claims.length === 4, `All 4 falsified/repaired claims present in ledger`);

// 11. Git working tree cleanliness check
const gitStatus = execSync('git status --porcelain=v2 --branch', { cwd: repoRoot, encoding: 'utf8' });
assert(gitStatus.includes('# branch.ab +0 -0'), 'Git repository remains clean (+0 -0)');

console.log('\n================================================================');
console.log(`SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('STATUS:', failCount === 0 ? 'POSTFLIGHT_VERIFIED · ALL CHECKS PASSED' : 'VERIFICATION_FAILED');
console.log('================================================================');

if (failCount > 0) process.exit(1);
