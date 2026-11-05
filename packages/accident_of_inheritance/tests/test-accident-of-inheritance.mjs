/**
 * 𝌋 TD613 · THE ACCIDENT OF INHERITANCE (Palace of Unborn Futures, Act II)
 * Comprehensive Fail-Closed Automated Verification Suite (`node:test`)
 *
 * Verifies all methodological, custody, statistical, and predecessor-errata invariants:
 *   1. Self-referential frozen confirmatory lock (`14/14` files including `run-confirmatory-192.mjs`).
 *   2. Strict repository isolation (`0` bytes altered in frozen Palace Act I, Capstone, or Atelier).
 *   3. Covenant preservation (`Khona\u200Clit-po` literal `U+200C` across manifests, receipts, and docs)
 *      and zero executable delegation tokens.
 *   4. Fail-closed 8-coordinate temporal lattice (`TEMPORAL_RETROACTIVITY_VIOLATION` on every reversal)
 *      and `AvailabilityMembrane` withholding of `t_available > t_decision` plus chronological sorting.
 *   5. Dynamic JavaScript `Proxy` secret-vault isolation (`DYNAMIC_VAULT_ACCESS_VIOLATION` on
 *      unauthorized property read or `Object.keys`, and `0` unauthorized reads in confirmatory receipt).
 *   6. Live `UniversalAtelierReceiver` 64-hex `projection_digest` equality across 4-world Iso-Π clusters
 *      and byte-identical permissible history across all 4 primary civilizations.
 *   7. Exhaustive `CTRL_DYNAMIC_ORACLE` dominance (`proportion_exceeding_oracle === 0`) and unclipped regret.
 *   8. Phipson–Smyth non-zero permutation p-values (`p >= 1/(M+1) > 0`) and exact 2^K enumeration (`K <= 16`).
 *   9. Exact 24-permutation source-standing invariance (`0.0000` for Evidentialists, Provisionalists,
 *      and Temporal Custodians; positive status swing for Monumentalists).
 *  10. Matched 148-byte Dead Civilization packets (`<= 160B`) and `ENV_4` universal mimicry failure.
 *  11. Constructive verification of all `12/12` adversarial counterexamples (`ADV_01`–`ADV_12`).
 *  12. Supervision classification (`INTERNALLY_SEPARATED_SINGLE_SUPERVISING_MODEL`, `paid_api_calls === 0`).
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { sha256Hex } from '../src/prng.mjs';
import {
  createTemporalStamp,
  AvailabilityMembrane,
  createVaultAccessLedger,
  createInstrumentedSecretVault,
  withAuthorizedVaultRole,
  assertPacketContainsNoSecrets,
} from '../src/temporal-lattice.mjs';
import {
  WORLD_FAMILIES,
  SOURCE_STANDINGS,
  generateBaseWorldSuite,
} from '../src/world-generator.mjs';
import {
  PRIMARY_POLICIES,
  computeHistoricalLogPrior,
  softmaxFromLogScores,
} from '../src/authority-policies.mjs';
import {
  evaluateSuiteAcrossGrid,
  computeClusteredPairedContrast,
} from '../src/evaluator-and-stats.mjs';
import { CONFIRMATORY_GRID_18 } from '../src/grid-definitions.mjs';
import { runAdversarialCounterexamplesSuite } from '../src/adversarial-counterexamples.mjs';
import { verifyFrozenConfirmatoryLock } from '../scripts/run-confirmatory-192.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PKG_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(PKG_ROOT, '..', '..');
const EXPECTED_COVENANT = 'Khona\u200Clit-po';

test('1. Frozen confirmatory lock verifies all 14 locked files including run-confirmatory-192.mjs itself', () => {
  const { lock, verifiedFiles } = verifyFrozenConfirmatoryLock();
  assert.equal(lock.locked_files_count, 14);
  assert.equal(verifiedFiles.length, 14);
  assert.equal(lock.supervision_classification, 'INTERNALLY_SEPARATED_SINGLE_SUPERVISING_MODEL');

  const runnerIncluded = verifiedFiles.some(
    f => f.path === 'packages/accident_of_inheritance/scripts/run-confirmatory-192.mjs'
  );
  assert.equal(runnerIncluded, true, 'Confirmatory runner must be covered by frozen lock manifest');
});

test('2. Strict isolation: zero modifications to Palace Act I, Four-Crossing Capstone, Universal Atelier, or app/', () => {
  const diffOut = execSync(
    'git diff fb47927c3c7cd5264a3cf9900e90e24868e5c0bb -- packages/palace_of_unborn_futures packages/four_crossing_capstone packages/universal_atelier app scripts tests',
    { cwd: REPO_ROOT, encoding: 'utf8' }
  ).trim();
  assert.equal(diffOut, '', 'Protected predecessor packages and shared engine directories must have zero byte diff');
});

test('3. Covenant interior U+200C preserved and zero executable delegation mentions emitted', () => {
  const filesToCheck = [
    'README.md',
    'preregistration/preregistration-manifest-act2-v1.json',
    'preregistration/frozen-confirmatory-lock-act2.json',
    'receipts/pilot-48-receipt.json',
    'receipts/confirmatory-192-receipt.json',
    'receipts/source-standing-factorial-receipt.json',
    'receipts/dead-civilization-wing-receipt.json',
    'receipts/adversarial-counterexamples-receipt.json',
    'docs/00_INHERITED_PALACE_ACT1_ERRATA_AND_REVIEW_AUDIT.md',
    'docs/01_PREREGISTRATION_AND_HYPOTHESIS_REGISTER.md',
    'docs/07_CONFIRMATORY_RESULTS_AND_RESPONSE_SURFACES.md',
    'docs/10_ADVERSARIAL_COUNTEREXAMPLES_AND_NEGATIVE_REGISTER.md',
    'docs/11_THE_ACCIDENT_OF_INHERITANCE_MANUSCRIPT.md',
    'lab/accident-of-inheritance-lab.html',
  ];

  const forbiddenMention = '@' + 'codex';
  for (const rel of filesToCheck) {
    const raw = fs.readFileSync(path.join(PKG_ROOT, rel), 'utf8');
    assert.equal(
      raw.includes(EXPECTED_COVENANT),
      true,
      `Missing literal Khona\\u200Clit-po (with interior U+200C) in ${rel}`
    );
    assert.equal(
      raw.toLowerCase().includes(forbiddenMention),
      false,
      `Executable mention token forbidden in ${rel}`
    );
  }
});

test('4. Eight-coordinate temporal lattice fails closed on retroactivity and withholds unmatured observations', () => {
  const valid = createTemporalStamp({
    t_event: 2,
    t_observed: 4,
    t_admitted: 7,
    t_available: 8,
    t_decision: 9,
    t_action: 9,
  });
  assert.equal(valid.t_available, 8);

  assert.throws(
    () => createTemporalStamp({ t_event: 5, t_observed: 4, t_admitted: 6, t_available: 6 }),
    /TEMPORAL_RETROACTIVITY_VIOLATION/
  );
  assert.throws(
    () => createTemporalStamp({ t_event: 3, t_observed: 5, t_admitted: 4, t_available: 6 }),
    /TEMPORAL_RETROACTIVITY_VIOLATION/
  );
  assert.throws(
    () => createTemporalStamp({ t_event: 3, t_observed: 4, t_admitted: 6, t_available: 5 }),
    /TEMPORAL_RETROACTIVITY_VIOLATION/
  );
  assert.throws(
    () => createTemporalStamp({ t_event: 3, t_observed: 4, t_admitted: 6, t_available: 6, t_decision: 5 }),
    /TEMPORAL_RETROACTIVITY_VIOLATION/
  );
  assert.throws(
    () =>
      createTemporalStamp({
        t_event: 3,
        t_observed: 4,
        t_admitted: 6,
        t_available: 6,
        t_decision: 7,
        t_action: 6,
      }),
    /TEMPORAL_RETROACTIVITY_VIOLATION/
  );

  // Out-of-order enqueueing and future withholding check
  const membrane = new AvailabilityMembrane([]);
  membrane.enqueueObservation({
    obs_id: 'OBS_LATE_AVAIL',
    obs_kind: 'AMBIENT_MONITOR',
    scalar_value: 1.5,
    temporal_coordinates: createTemporalStamp({ t_event: 2, t_observed: 4, t_admitted: 8, t_available: 8 }),
  });
  membrane.enqueueObservation({
    obs_id: 'OBS_EARLY_AVAIL',
    obs_kind: 'DIAGNOSTIC_PROBE',
    probe_id: 'PROBE_P0',
    scalar_value: 2.1,
    temporal_coordinates: createTemporalStamp({ t_event: 5, t_observed: 5, t_admitted: 5, t_available: 5 }),
  });

  const visibleAt6 = membrane.getAuthorizedRecordsAt(6);
  assert.equal(visibleAt6.length, 1);
  assert.equal(visibleAt6[0].obs_id, 'OBS_EARLY_AVAIL');
  assert.ok(membrane.withheld_future_records_count >= 1);

  const visibleAt9 = membrane.getAuthorizedRecordsAt(9);
  assert.equal(visibleAt9.length, 2);
  assert.equal(visibleAt9[0].obs_id, 'OBS_EARLY_AVAIL');
  assert.equal(visibleAt9[1].obs_id, 'OBS_LATE_AVAIL');
});

test('5. Dynamic Proxy secret vault blocks unauthorized investigator property reads and key enumeration', () => {
  const ledger = createVaultAccessLedger();
  const vault = createInstrumentedSecretVault(
    {
      world_public_id: 'TEST_W0',
      canary: 'TD613_ACT2_SECRET_VAULT_CANARY',
      true_initial_slot: 'M_SLOT_2',
    },
    ledger
  );

  // Investigator context (no authorized role on stack) -> throws DYNAMIC_VAULT_ACCESS_VIOLATION
  assert.throws(() => vault.true_initial_slot, /DYNAMIC_VAULT_ACCESS_VIOLATION/);
  assert.equal(ledger.unauthorized_investigator_reads, 1);

  assert.throws(() => Object.keys(vault), /DYNAMIC_VAULT_ACCESS_VIOLATION/);
  assert.equal(ledger.unauthorized_investigator_reads, 2);

  // Authorized roles increment respective counters cleanly
  const slotSim = withAuthorizedVaultRole('WORLD_OBSERVATION_SIMULATOR', () => vault.true_initial_slot);
  assert.equal(slotSim, 'M_SLOT_2');
  assert.equal(ledger.simulator_property_reads, 1);

  const slotOracle = withAuthorizedVaultRole('DYNAMIC_SYNTHETIC_ORACLE', () => vault.true_initial_slot);
  assert.equal(slotOracle, 'M_SLOT_2');
  assert.equal(ledger.oracle_property_reads, 1);

  // Mutation always blocked even inside authorized role
  assert.throws(
    () =>
      withAuthorizedVaultRole('POST_EPISODE_SCORER', () => {
        vault.true_initial_slot = 'M_SLOT_0';
      }),
    /SECRET_VAULT_IMMUTABLE/
  );
});

test('6. Live UniversalAtelierReceiver 64-hex Iso-Π cluster digests and byte-identical history across policies', () => {
  const miniSuite = generateBaseWorldSuite({
    suiteName: 'TEST_MINI_24',
    masterSeed: 'TD613_TEST_MINI_SEED_613',
    totalWorlds: 24, // 6 families x 1 cluster x 4 worlds = 24 base worlds
  });
  assert.equal(miniSuite.publicWorlds.length, 24);
  assert.equal(miniSuite.vaultLedger.unauthorized_investigator_reads, 0);

  // Group by cluster_public_id and verify identical 64-hex projection_digest across all 4 quartet worlds
  const byCluster = new Map();
  for (const pubW of miniSuite.publicWorlds) {
    assertPacketContainsNoSecrets(pubW);
    assert.match(pubW.terminal_graph_pi.projection_digest, /^[a-f0-9]{64}$/);
    if (!byCluster.has(pubW.cluster_public_id)) byCluster.set(pubW.cluster_public_id, []);
    byCluster.get(pubW.cluster_public_id).push(pubW);
  }
  assert.equal(byCluster.size, 6);
  for (const quartet of byCluster.values()) {
    assert.equal(quartet.length, 4);
    const digests = new Set(quartet.map(q => q.terminal_graph_pi.projection_digest));
    assert.equal(digests.size, 1, 'All 4 worlds in an Iso-Π quartet must share an identical projection_digest');
  }

  // Evaluate across a grid cell via production pipeline: checks SHA-256 history immutability & dynamic oracle dominance
  const evalOut = evaluateSuiteAcrossGrid({
    suite: miniSuite,
    gridCells: [CONFIRMATORY_GRID_18[9]], // H_MOD__L3_MODERATE__V_ACCELERATED
    evaluationSeed: 'TD613_TEST_EVAL_613',
  });
  assert.equal(evalOut.episode_rows.length, 24 * 7);
  assert.equal(evalOut.immutability_recomputations_verified, 24 * 6 * 2);
  assert.equal(miniSuite.vaultLedger.unauthorized_investigator_reads, 0);
  for (const row of evalOut.episode_rows) {
    assert.equal(row.exceeded_oracle, 0, `${row.policy_id} cannot exceed exhaustive dynamic oracle`);
    assert.ok(row.signed_regret >= -1e-9, 'Signed regret vs dynamic oracle must be non-negative');
  }
});

test('7. Phipson–Smyth permutation p-value lower bound (never 0.0) and exact 2^K enumeration for K <= 16', () => {
  // K = 8 clusters -> exact 2^8 = 256 enumeration
  const exactRowsA = [];
  const exactRowsB = [];
  for (let k = 0; k < 8; k++) {
    exactRowsA.push({
      world_public_id: `W_${k}`,
      grid_cell_id: 'G0',
      cluster_public_id: `C_${k}`,
      utility: 0.85,
    });
    exactRowsB.push({
      world_public_id: `W_${k}`,
      grid_cell_id: 'G0',
      cluster_public_id: `C_${k}`,
      utility: 0.35,
    });
  }
  const resExact = computeClusteredPairedContrast({
    rowsA: exactRowsA,
    rowsB: exactRowsB,
    seed: 'TEST_EXACT_8',
  });
  assert.equal(resExact.permutation_method, 'EXACT_2_POW_8_CLUSTER_SIGNFLIP');
  assert.equal(resExact.total_permutations, 256);
  assert.equal(resExact.two_sided_p_value, round6(2 / 256));
  assert.ok(resExact.two_sided_p_value > 0);

  // K = 24 clusters -> Phipson–Smyth Monte Carlo (b + 1) / (M + 1) > 0 even when b = 0
  const mcRowsA = [];
  const mcRowsB = [];
  for (let k = 0; k < 24; k++) {
    mcRowsA.push({
      world_public_id: `MW_${k}`,
      grid_cell_id: 'G0',
      cluster_public_id: `MC_${k}`,
      utility: 0.92,
    });
    mcRowsB.push({
      world_public_id: `MW_${k}`,
      grid_cell_id: 'G0',
      cluster_public_id: `MC_${k}`,
      utility: 0.22,
    });
  }
  const resMc = computeClusteredPairedContrast({
    rowsA: mcRowsA,
    rowsB: mcRowsB,
    seed: 'TEST_MC_24',
    nPerm: 2048,
  });
  assert.equal(resMc.sampled_exceedances, 0);
  assert.ok(resMc.two_sided_p_value > 0, 'Monte Carlo p-value must never be 0');
  assert.ok(Math.abs(resMc.two_sided_p_value - round6(1 / 2049)) < 1e-5);
});

function round6(x) {
  return Math.round(x * 1e6) / 1e6;
}

test('8. Exact 24-permutation source-standing invariance holds for Evidentialists, Provisionalists, and Custodians', () => {
  const slots = ['M_SLOT_0', 'M_SLOT_1', 'M_SLOT_2', 'M_SLOT_3'];
  const fourClaims = slots.map((slot, idx) => ({
    claim_id: `PERM_CLAIM_${idx}`,
    source_standing: SOURCE_STANDINGS[idx],
    conditioning_regime_tag: 'REGIME_SIG_ALPHA',
    temporal_coordinates: createTemporalStamp({
      t_event: -20,
      t_observed: -19,
      t_admitted: -16,
      t_available: -16,
    }),
    calibration_metrics: {
      measured_calibration_score: 0.85,
      sample_replicates: 30,
      reproducibility_pass_rate: 0.9,
      residual_variance: 0.05,
      independently_calibrated: true,
    },
    log_likelihood_by_slot: {
      M_SLOT_0: idx === 0 ? 1.4 : -0.6,
      M_SLOT_1: idx === 1 ? 1.4 : -0.6,
      M_SLOT_2: idx === 2 ? 1.4 : -0.6,
      M_SLOT_3: idx === 3 ? 1.4 : -0.6,
    },
  }));
  const perms = [];
  function permute(arr, m = []) {
    if (arr.length === 0) perms.push(m);
    else {
      for (let i = 0; i < arr.length; i++) {
        const next = arr.slice();
        const picked = next.splice(i, 1);
        permute(next, m.concat(picked));
      }
    }
  }
  permute([...SOURCE_STANDINGS]);
  assert.equal(perms.length, 24);

  for (const policyId of PRIMARY_POLICIES) {
    let baselineProbs = null;
    let maxShift = 0;
    for (const p of perms) {
      const relabeled = fourClaims.map((c, idx) => ({ ...c, source_standing: p[idx] }));
      const { logPrior } = computeHistoricalLogPrior({
        policyId,
        historicalClaims: relabeled,
        tDecision: 0,
      });
      const probs = softmaxFromLogScores(logPrior);
      if (!baselineProbs) {
        baselineProbs = probs;
      } else {
        for (const s of Object.keys(probs)) {
          maxShift = Math.max(maxShift, Math.abs(probs[s] - baselineProbs[s]));
        }
      }
    }

    if (policyId === 'A_MONUMENTALISTS') {
      assert.ok(maxShift > 0.25, 'Monumentalists must respond strongly to source standing permutations');
    } else {
      assert.equal(
        maxShift,
        0,
        `${policyId} must have exact 0.0000 posterior shift across all 24 standing permutations`
      );
    }
  }
});

test('9. Confirmatory, Pilot, Standing, and Dead-Civilization receipts satisfy all integrity and ceiling invariants', () => {
  const conf = JSON.parse(
    fs.readFileSync(path.join(PKG_ROOT, 'receipts', 'confirmatory-192-receipt.json'), 'utf8')
  );
  assert.equal(conf.frozen_lock_verified, true);
  assert.equal(conf.locked_files_verified_count, 14);
  assert.equal(conf.pilot_disjointness_verified, true);
  assert.equal(conf.n_base_worlds, 192);
  assert.equal(conf.n_iso_pi_clusters, 48);
  assert.equal(conf.n_grid_cells, 18);
  assert.equal(conf.n_episodes, 24192);
  assert.equal(conf.paid_api_calls, 0);
  assert.equal(conf.independent_external_blinding, false);
  assert.equal(conf.external_empirical_replication, false);
  assert.equal(conf.vault_access_ledger.unauthorized_investigator_reads, 0);

  for (const [cond, summary] of Object.entries(conf.overall_by_policy)) {
    assert.equal(summary.proportion_exceeding_oracle, 0, `${cond} exceeded oracle in confirmatory run`);
  }

  for (const contrast of Object.values(conf.global_pairwise_contrasts)) {
    assert.ok(contrast.two_sided_p_value > 0, 'Global contrast p-value must be strictly positive');
  }

  const deadCiv = JSON.parse(
    fs.readFileSync(path.join(PKG_ROOT, 'receipts', 'dead-civilization-wing-receipt.json'), 'utf8')
  );
  assert.equal(deadCiv.matched_active_packet_bytes, 148);
  assert.ok(deadCiv.matched_active_packet_bytes <= deadCiv.max_packet_budget_bytes);
  // ENV_4 deceptive mimicry must defeat all arms
  for (const arm of Object.values(deadCiv.summary_by_environment.ENV_4_DECEPTIVE_INVARIANT_MIMIC)) {
    assert.equal(arm.stage_4_successful_action_rate, 0);
    assert.ok(arm.mean_utility < 0);
  }
});

test('10. All 12 constructive adversarial counterexamples (ADV_01..ADV_12) execute and verify cleanly', () => {
  const adv = runAdversarialCounterexamplesSuite();
  assert.equal(adv.total_counterexamples, 12);
  assert.equal(adv.verified_counterexamples, 12);
  assert.equal(adv.all_counterexamples_verified, true);
  assert.equal(adv.no_single_globally_optimal_policy_confirmed, true);
  for (const c of adv.cases) {
    assert.equal(c.verified, true, `Counterexample ${c.case_id} failed verification`);
  }
});
