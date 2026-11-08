#!/usr/bin/env node
/**
 * 𝌋 TD613 · THE ACCIDENT OF INHERITANCE (Palace of Unborn Futures, Act II)
 * Calibration Pilot Runner (`ACT2_PILOT_48`: 48 Base Worlds x 6 Grid Cells = 288 Trajectories = 2,016 Episodes)
 *
 * Evaluates numerical stability, policy distinctiveness, attainable utilities, observation costs,
 * ceiling/floor absence, non-retroactivity, and Proxy secret-vault isolation BEFORE freezing
 * the confirmatory protocol.
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256Hex, round4 } from '../src/prng.mjs';
import { WORLD_FAMILIES, generateBaseWorldSuite } from '../src/world-generator.mjs';
import { PRIMARY_POLICIES, REFERENCE_CONTROLS } from '../src/authority-policies.mjs';
import {
  evaluateSuiteAcrossGrid,
  summarizePolicyRows,
  computeClusteredPairedContrast,
} from '../src/evaluator-and-stats.mjs';
import { ACT2_MASTER_SEEDS, PILOT_GRID_6 } from '../src/grid-definitions.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const RECEIPT_PATH = path.join(PKG_ROOT, 'receipts', 'pilot-48-receipt.json');

const t0 = Date.now();
const suite = generateBaseWorldSuite({
  suiteName: 'ACT2_PILOT_48',
  masterSeed: ACT2_MASTER_SEEDS.PILOT_48_WORLD_SEED,
  totalWorlds: 48,
});

const evalOut = evaluateSuiteAcrossGrid({
  suite,
  gridCells: PILOT_GRID_6,
  evaluationSeed: ACT2_MASTER_SEEDS.PILOT_48_EVAL_SEED,
  horizonTicks: 24,
  probeBudget: 6,
});

const allPolicies = [...PRIMARY_POLICIES, ...REFERENCE_CONTROLS];
const overallByPolicy = {};
for (const pol of allPolicies) {
  overallByPolicy[pol] = summarizePolicyRows(
    evalOut.episode_rows.filter(r => r.policy_id === pol)
  );
}

const byFamilyAndPolicy = {};
for (const fam of WORLD_FAMILIES) {
  byFamilyAndPolicy[fam] = {};
  for (const pol of allPolicies) {
    byFamilyAndPolicy[fam][pol] = summarizePolicyRows(
      evalOut.episode_rows.filter(r => r.family === fam && r.policy_id === pol)
    );
  }
}

const byGridCellDeltaU = {};
for (const cell of PILOT_GRID_6) {
  const mon = evalOut.episode_rows.filter(
    r => r.grid_cell_id === cell.cell_id && r.policy_id === 'A_MONUMENTALISTS'
  );
  const evi = evalOut.episode_rows.filter(
    r => r.grid_cell_id === cell.cell_id && r.policy_id === 'B_EVIDENTIALISTS'
  );
  byGridCellDeltaU[cell.cell_id] = computeClusteredPairedContrast({
    rowsA: mon,
    rowsB: evi,
    metricFn: r => r.utility,
    seed: `${ACT2_MASTER_SEEDS.PILOT_48_EVAL_SEED}::pilot_cell_${cell.cell_id}`,
  });
}

// Qualification diagnostics
const hasAnyNaN = evalOut.episode_rows.some(
  r => !Number.isFinite(r.utility) || !Number.isFinite(r.signed_regret)
);
const primaryMeans = PRIMARY_POLICIES.map(p => overallByPolicy[p].mean_utility);
const distinctPrimaryMeans = new Set(primaryMeans).size === PRIMARY_POLICIES.length;
const noCeilingOrFloor = primaryMeans.every(u => u > 0.25 && u < 0.92);
const oracleUpper = overallByPolicy.CTRL_DYNAMIC_ORACLE.mean_utility;
const randomFloor = overallByPolicy.CTRL_RANDOM.mean_utility;

const qualificationChecks = {
  numerical_stability_finite: !hasAnyNaN,
  iso_pi_clusters_verified_12_of_12: suite.cluster_verifications.every(c => c.all_four_pi_equal),
  zero_unauthorized_vault_reads: evalOut.vault_access_ledger.unauthorized_investigator_reads === 0,
  history_immutability_verified: evalOut.immutability_recomputations_verified === 48 * 6 * 6 * 2,
  primary_policies_distinct: distinctPrimaryMeans,
  no_ceiling_or_floor_collapse: noCeilingOrFloor,
  oracle_strictly_above_primary_policies: primaryMeans.every(u => u < oracleUpper),
  primary_policies_strictly_above_random: primaryMeans.every(u => u > randomFloor),
};

const allQualified = Object.values(qualificationChecks).every(Boolean);
const pilotWorldIdsDigest = sha256Hex(
  JSON.stringify(suite.publicWorlds.map(w => w.world_public_id))
);
const pilotEpisodeDigest = sha256Hex(JSON.stringify(evalOut.episode_rows));

const receipt = {
  schema: 'td613.accident-of-inheritance.pilot-48-receipt/v1.0',
  experiment_id: 'TD613-PALACE-ACT2-ACCIDENT-OF-INHERITANCE-20261105',
  stage: 'CALIBRATION_PILOT_48',
  covenant: 'Khona‌lit-po',
  authorization_ref: 'SAC[X6ZNK5NO51]',
  supervision_mode: 'INTERNALLY_SEPARATED_SINGLE_SUPERVISING_MODEL',
  paid_api_calls: 0,
  execution_duration_ms: Date.now() - t0,
  world_seed: ACT2_MASTER_SEEDS.PILOT_48_WORLD_SEED,
  eval_seed: ACT2_MASTER_SEEDS.PILOT_48_EVAL_SEED,
  n_base_worlds: suite.total_worlds,
  n_iso_pi_clusters: suite.cluster_verifications.length,
  n_grid_cells: PILOT_GRID_6.length,
  n_trajectories: suite.total_worlds * PILOT_GRID_6.length,
  n_episodes: evalOut.episode_rows.length,
  pilot_world_ids_sha256: pilotWorldIdsDigest,
  pilot_episode_rows_sha256: pilotEpisodeDigest,
  qualification_checks: qualificationChecks,
  qualified_for_confirmatory_freeze: allQualified,
  vault_access_ledger: evalOut.vault_access_ledger,
  cluster_verifications: suite.cluster_verifications,
  overall_by_policy: overallByPolicy,
  by_family_and_policy: byFamilyAndPolicy,
  principal_contrast_mon_minus_evi_by_pilot_cell: byGridCellDeltaU,
};

fs.mkdirSync(path.dirname(RECEIPT_PATH), { recursive: true });
fs.writeFileSync(RECEIPT_PATH, JSON.stringify(receipt, null, 2) + '\n', 'utf8');

console.log('=== ACT II CALIBRATION PILOT (48 WORLDS x 6 CELLS = 2,016 EPISODES) ===');
console.log(`Qualified for Confirmatory Freeze: ${allQualified}`);
console.log('Qualification Checks:', JSON.stringify(qualificationChecks, null, 2));
console.log('\nOverall Policy Summary:');
for (const pol of allPolicies) {
  const s = overallByPolicy[pol];
  console.log(
    `  ${pol.padEnd(24)} | U=${s.mean_utility.toFixed(4)} | Regret=${s.mean_signed_regret.toFixed(4)} | ErrBefore=${String(s.mean_error_rate_before_available).padEnd(6)} | ErrAfter=${String(s.mean_error_rate_after_available).padEnd(6)} | Probes=${s.mean_probes_used.toFixed(2)} | FalseClaim=${s.false_claim_rate.toFixed(4)}`
  );
}
console.log('\nFamily Utility Matrix (Mon / Evi / Prov / Cust / NoHist):');
for (const fam of WORLD_FAMILIES) {
  const f = byFamilyAndPolicy[fam];
  console.log(
    `  ${fam.padEnd(32)} | Mon=${f.A_MONUMENTALISTS.mean_utility.toFixed(4)} | Evi=${f.B_EVIDENTIALISTS.mean_utility.toFixed(4)} | Prov=${f.C_PROVISIONALISTS.mean_utility.toFixed(4)} | Cust=${f.D_TEMPORAL_CUSTODIANS.mean_utility.toFixed(4)} | NoHist=${f.CTRL_NO_HISTORY.mean_utility.toFixed(4)}`
  );
}
console.log('\nPilot Cell Principal Contrast ΔU = E[U_Mon - U_Evi]:');
for (const [cid, st] of Object.entries(byGridCellDeltaU)) {
  console.log(
    `  ${cid.padEnd(38)} | ΔU=${st.mean_diff.toFixed(4)} [${st.ci95_low.toFixed(4)}, ${st.ci95_high.toFixed(4)}] p=${st.two_sided_p_value.toFixed(5)}`
  );
}

if (!allQualified) {
  process.exit(1);
}
