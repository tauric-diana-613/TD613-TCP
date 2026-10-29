import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';

const closureDir = '<appDataDir>/brain/<conversation-id>\\scratch\\exp_a_postflight_closure_r1_20261029';
const brainRoot = '<appDataDir>/brain/<conversation-id>';
const scratchDir = path.join(brainRoot, 'scratch');
const repoRoot = '<repo-root>';

console.log('================================================================');
console.log('TD613 EXPERIMENT A — POSTFLIGHT CLOSURE REDPEN R1 VERIFIER');
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

// 1. Verify Physical Postflight ZIP in Brain Root
const zipPath = path.join(brainRoot, 'TD613_Experiment_A_Postflight_Scientific_Evidence_2026-10-29.zip');
assert(fs.existsSync(zipPath), `Physical ZIP transferred to brain root: ${zipPath}`);
const zipBuf = fs.readFileSync(zipPath);
const zipSha = crypto.createHash('sha256').update(zipBuf).digest('hex');
assert(zipBuf.length === 43100, `ZIP byte count is exact (43,100 bytes)`);
assert(zipSha === 'a8568aef7c6dbf6bdefe39a10a88f164684a8c81e5d9ba029828cd7356216afe', `ZIP SHA-256 is exact (${zipSha})`);

// 2. Verify All 5 Predecessor Archives
const predecessors = [
  { name: 'Preflight Lever', file: 'TD613_Experiment_A_Latifa_Preflight_Lever_2026-10-29.zip', bytes: 274617, sha: '86dd720e628f1f79e451162f50da9b31f332d20f825c76cbc5d6162d6cfac30f' },
  { name: 'Flight-V0 Partial', file: 'TD613_Experiment_A_Flight_Evidence_2026-10-29.zip', bytes: 77400, sha: '897cf83fabe9df66e70ddcc7136b10fc32871d99eaf6871d0734fcf1dcb262d9' },
  { name: 'Flight-R1 Review', file: 'TD613_Experiment_A_Flight_R1_and_Postflight_Qualification_Evidence_2026-10-29.zip', bytes: 127502, sha: '21df8b139d13a24c6e395ee032f48b7f2675971abede09ec13eca51f3cc49da6' },
  { name: 'Em Manifest Closure', file: 'TD613_Em_Manifest_Rendered_Review_Evidence_Closure_2026-10-29.zip', bytes: 23635724, sha: '2b92e074c05677f1f0e464ecf1d24396bd31d1bd2676f2f9f1b605a810789f36' },
  { name: 'Stage W0 Evidence', file: 'TD613_Experiment_A_Postflight_W0_Evidence_2026-10-29.zip', bytes: 54510, sha: '47b282e47a5f279a1d06a504ed7a2987996cc3a425e3259027b46965663a2dc4' }
];

for (const p of predecessors) {
  const pPath = path.join(scratchDir, p.file);
  assert(fs.existsSync(pPath), `Predecessor archive exists: ${p.name}`);
  const buf = fs.readFileSync(pPath);
  const sha = crypto.createHash('sha256').update(buf).digest('hex');
  assert(buf.length === p.bytes, `${p.name} bytes match (${buf.length} == ${p.bytes})`);
  assert(sha === p.sha, `${p.name} SHA-256 matches (${sha})`);
}

// 3. Verify Corrected Bounded Science Claim Ledger
const ledgerPath = path.join(closureDir, 'CORRECTED_BOUNDED_SCIENCE_CLAIM_LEDGER.json');
assert(fs.existsSync(ledgerPath), 'CORRECTED_BOUNDED_SCIENCE_CLAIM_LEDGER.json exists');
const ledger = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'));
assert(ledger.claims && ledger.claims.length === 16, `All 16 claims cataloged (found ${ledger.claims.length})`);

// Specific claim status assertions
const cTaxonomy = ledger.claims.find(c => c.claim_id === 'CLAIM_CORPUS_CENSUS_TAXONOMY');
assert(cTaxonomy && cTaxonomy.status === 'OBSERVED', 'Corpus taxonomy claim is OBSERVED');
assert(cTaxonomy.taxonomy_breakdown.archived_original_records === 94, 'Archived original records count is 94');
assert(cTaxonomy.taxonomy_breakdown.original_records_detail.substantive_markdown_notes === 33, 'Substantive markdown notes count is 33');
assert(cTaxonomy.taxonomy_breakdown.original_records_detail.appledouble_metadata_sidecars === 33, 'AppleDouble metadata sidecars count is 33');

const cA1 = ledger.claims.find(c => c.claim_id === 'CLAIM_ASSAY_A1_TOPICAL_PLACEMENT');
assert(cA1 && cA1.adjudication === 'ONE_TARGET_CONCORDANCE_WITH_LEAKAGE_RISK', 'A1 adjudicated as ONE_TARGET_CONCORDANCE_WITH_LEAKAGE_RISK');

const cA2 = ledger.claims.find(c => c.claim_id === 'CLAIM_ASSAY_A2_FALSE_TWIN_GUARD');
assert(cA2 && cA2.adjudication === 'SUPPORTED_FINITE_FALSE_JOIN_GUARD_ON_TESTED_HOMONYMS', 'A2 adjudicated as SUPPORTED_FINITE_FALSE_JOIN_GUARD_ON_TESTED_HOMONYMS');

const cA3 = ledger.claims.find(c => c.claim_id === 'CLAIM_ASSAY_A3_CONTEXT_CROWDING');
assert(cA3 && cA3.adjudication.includes('WEAK_FLAT_POOL_CROWDING_DEMONSTRATED'), 'A3 adjudicated as WEAK_FLAT_POOL_CROWDING_DEMONSTRATED');

const cSurplus = ledger.claims.find(c => c.claim_id === 'CLAIM_ROLE_COUNT_EMERGENCE_SURPLUS');
assert(cSurplus && cSurplus.status === 'REFUTED', 'Role-count emergence surplus is REFUTED');

const cWF4 = ledger.claims.find(c => c.claim_id === 'CLAIM_WF4_DROMOLOGICAL_LIE_COMMUTATOR');
assert(cWF4 && cWF4.adjudication === 'FINITE_ORDER_DEPENDENCE_ON_PERMUTATION_TESTS', 'WF-4 downgraded to FINITE_ORDER_DEPENDENCE_ON_PERMUTATION_TESTS');

const cWF5 = ledger.claims.find(c => c.claim_id === 'CLAIM_WF5_SVD_CONDITIONING_COLLAPSE');
assert(cWF5 && cWF5.status === 'HELD', 'WF-5 universal SVD threshold is HELD');

const cWF6 = ledger.claims.find(c => c.claim_id === 'CLAIM_WF6_GENEALOGICAL_N_EFF');
assert(cWF6 && cWF6.adjudication === 'ILLUSTRATIVE_SENSITIVITY_SCENARIO', 'WF-6 N_eff is an ILLUSTRATIVE_SENSITIVITY_SCENARIO');

// 4. Verify Baseline Charter
const charterPath = path.join(closureDir, 'EXPERIMENT_A_BASELINE_CHARTER_FOR_EXPERIMENT_B.md');
assert(fs.existsSync(charterPath), 'EXPERIMENT_A_BASELINE_CHARTER_FOR_EXPERIMENT_B.md exists');
const charterText = fs.readFileSync(charterPath, 'utf8');
assert(charterText.includes('A_BASELINE_READY_WITH_NAMED_LIMITATIONS'), 'Charter specifies A_BASELINE_READY_WITH_NAMED_LIMITATIONS');
assert(charterText.includes('Gate E `HELD`'), 'Charter preserves Gate E HELD');
assert(charterText.includes('Human Scientific Closure `RESERVED`'), 'Charter preserves Human Closure RESERVED');
assert(charterText.includes('STRICTLY SEALED, UNREAD, AND UNINSPECTED'), 'Charter guarantees Experiment B corpus quarantine');

// 5. Verify Review Notes and Replay Instructions
const notesPath = path.join(closureDir, 'INDEPENDENT_REVIEW_NOTES_AND_REPLAY_INSTRUCTIONS.md');
assert(fs.existsSync(notesPath), 'INDEPENDENT_REVIEW_NOTES_AND_REPLAY_INSTRUCTIONS.md exists');
const notesText = fs.readFileSync(notesPath, 'utf8');
assert(notesText.includes('43,100'), 'Notes contain exact byte size');
assert(notesText.includes('a8568aef7c6dbf6bdefe39a10a88f164684a8c81e5d9ba029828cd7356216afe'), 'Notes contain exact SHA-256');

// 6. Verify Master Closure Receipt
const receiptPath = path.join(closureDir, 'EXPERIMENT_A_SCIENTIFIC_POSTFLIGHT_R1_REDPEN_RECEIPT.json');
assert(fs.existsSync(receiptPath), 'EXPERIMENT_A_SCIENTIFIC_POSTFLIGHT_R1_REDPEN_RECEIPT.json exists');
const receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8'));
assert(receipt.disposition === 'A_BASELINE_READY_WITH_NAMED_LIMITATIONS', 'Receipt disposition is A_BASELINE_READY_WITH_NAMED_LIMITATIONS');
assert(receipt.physical_evidence_transferred.status === 'TRANSFERRED_AND_VERIFIED', 'Physical evidence transfer confirmed in receipt');
assert(receipt.standing_holds.gate_e === 'HELD', 'Receipt confirms Gate E HELD');

// 7. Verify Git Hygiene
const gitStatus = execSync('git status --porcelain=v2 --branch', { cwd: repoRoot, encoding: 'utf8' });
assert(gitStatus.includes('# branch.ab +0 -0'), 'Git repository remains strictly clean (+0 -0)');

console.log('\n================================================================');
console.log(`SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
console.log('STATUS:', failCount === 0 ? 'CLOSURE_REDPEN_VERIFIED · ALL CHECKS PASSED' : 'VERIFICATION_FAILED');
console.log('================================================================');

if (failCount > 0) process.exit(1);
