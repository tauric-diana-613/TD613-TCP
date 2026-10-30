// TD613 Experiment B · Live Model Calibration Runner
// Conducts real-model C1-C4 paired shakedown with independent scoring oracle and genuine token tracking.

import fs from 'node:fs';
import path from 'node:path';
import { runArm2AModular } from '../02_four_arm_harness/run-arm2a-modular.mjs';
import { runArm2BMatchedUnion } from '../02_four_arm_harness/run-arm2b-matched-union.mjs';
import { EvaluatorOracle } from './evaluator-oracle.mjs';

function readJson(relPath) {
  const absPath = path.resolve(relPath);
  return JSON.parse(fs.readFileSync(absPath, 'utf8'));
}

async function main() {
  console.log('================================================================');
  console.log('𝌋 TD613 · EXPERIMENT B SOURCE-FREE LIVE MODEL CALIBRATION');
  console.log('================================================================');

  const fixturesDir = 'docs/research/experiment-b-preflight/01_calibration_fixtures';
  const fixtures = {
    c1_mech: readJson(`${fixturesDir}/c1_damped_harmonic_oscillator.json`),
    c1_elec: readJson(`${fixturesDir}/c1_series_rlc_circuit.json`),
    c2_logistic: readJson(`${fixturesDir}/c2_logistic_population_growth.json`),
    c2_mm: readJson(`${fixturesDir}/c2_michaelis_menten_kinetics.json`),
    c2_pos: readJson(`${fixturesDir}/c2_positive_control_linear_decay.json`),
    c3_staged: readJson(`${fixturesDir}/c3_staged_resonance_perturbation.json`),
    c4_incomplete: readJson(`${fixturesDir}/c4_incomplete_boundary_system.json`),
    c4_sufficient: readJson(`${fixturesDir}/c4_sufficient_boundary_system.json`),
    c5_wendbine: readJson(`${fixturesDir}/c5_wendbine_snapshot_manifest.json`)
  };

  const oracle = new EvaluatorOracle(fixtures);

  console.log('\n>>> PHASE 1: EXECUTING LIVE ARM 2A (MODULAR JURISDICTIONAL REASONER)...');
  const arm2aResults = await runArm2AModular(fixtures);

  console.log('\n>>> PHASE 2: EXECUTING LIVE ARM 2B (MATCHED NATIVE UNION REASONER)...');
  const arm2bResults = await runArm2BMatchedUnion(fixtures);

  console.log('\n>>> PHASE 3: BLINDED ORACLE EVALUATION...');
  // Randomly assign Alpha and Beta
  const flip = Math.random() < 0.5;
  const blindedMap = flip
    ? { ARM_ALPHA: { raw: arm2aResults, true_arm: 'ARM_2A_MODULAR' }, ARM_BETA: { raw: arm2bResults, true_arm: 'ARM_2B_MATCHED_UNION' } }
    : { ARM_ALPHA: { raw: arm2bResults, true_arm: 'ARM_2B_MATCHED_UNION' }, ARM_BETA: { raw: arm2aResults, true_arm: 'ARM_2A_MODULAR' } };

  const alphaScores = oracle.scoreArm({ arm_label: 'ARM_ALPHA', ...blindedMap.ARM_ALPHA.raw });
  const betaScores = oracle.scoreArm({ arm_label: 'ARM_BETA', ...blindedMap.ARM_BETA.raw });

  // Unblind results
  const arm2aFinalScore = blindedMap.ARM_ALPHA.true_arm === 'ARM_2A_MODULAR' ? alphaScores : betaScores;
  const arm2bFinalScore = blindedMap.ARM_ALPHA.true_arm === 'ARM_2B_MATCHED_UNION' ? alphaScores : betaScores;

  console.log('\n================================================================');
  console.log('EVALUATION RESULTS SUMMARY:');
  console.log(`Arm 2A (Modular): Passed ${arm2aFinalScore.total_passed}/${arm2aFinalScore.total_conditions} conditions`);
  console.log(`Arm 2B (Union):   Passed ${arm2bFinalScore.total_passed}/${arm2bFinalScore.total_conditions} conditions`);
  console.log('================================================================\n');

  // Compute total token consumption
  const totalTokens2A = arm2aResults.traces.reduce((acc, t) => acc + (t.provider_usage.total_tokens || 0), 0);
  const totalTokens2B = arm2bResults.traces.reduce((acc, t) => acc + (t.provider_usage.total_tokens || 0), 0);

  // Save traces
  const tracesDir = 'docs/research/experiment-b-preflight/03_calibration_execution/traces';
  if (!fs.existsSync(tracesDir)) fs.mkdirSync(tracesDir, { recursive: true });

  fs.writeFileSync(`${tracesDir}/live_arm2a_traces.json`, JSON.stringify(arm2aResults.traces, null, 2));
  fs.writeFileSync(`${tracesDir}/live_arm2b_traces.json`, JSON.stringify(arm2bResults.traces, null, 2));

  const receipt = {
    schema: 'td613.experiment-b.live-calibration-receipt/v1',
    timestamp: new Date().toISOString(),
    commission: 'TD613_Experiment_B_Live_Model_Calibration_2026-10-29',
    covenant: 'Tauric Diana — Crimean heritage custodianship · Khona‌lit-po',
    disposition: 'B_LIVE_CALIBRATION_READY_FOR_INDEPENDENT_REVIEW',
    execution_mode: 'AUTHENTIC_LIVE_MODEL_INFERENCE',
    model_provider: 'Google Gemini API (v1beta)',
    model_version: arm2aResults.model_name,
    sampling_configuration: {
      temperature: 0.0,
      max_output_tokens: 4096
    },
    evaluator_oracle: {
      scoring_mode: 'BLINDED_INDEPENDENT_EVALUATION',
      unblinding_key: flip ? 'ALPHA=2A, BETA=2B' : 'ALPHA=2B, BETA=2A'
    },
    arms_evaluated: [
      {
        arm_id: 'ARM_2A_MODULAR',
        architecture: 'FOUR_STAGE_JURISDICTIONAL_PIPELINE',
        total_episodes: arm2aResults.traces.length,
        total_tokens_consumed: totalTokens2A,
        all_conditions_passed: arm2aFinalScore.all_passed,
        conditions: {
          c1_mathematical_correspondence: arm2aFinalScore.c1_evaluation,
          c2_false_twin_and_control: arm2aFinalScore.c2_evaluation,
          c3_epistemic_revision: arm2aFinalScore.c3_evaluation,
          c4_abstention_and_control: arm2aFinalScore.c4_evaluation
        }
      },
      {
        arm_id: 'ARM_2B_MATCHED_UNION',
        architecture: 'FLAT_UNCHAMBERED_NATIVE_UNION',
        total_episodes: arm2bResults.traces.length,
        total_tokens_consumed: totalTokens2B,
        all_conditions_passed: arm2bFinalScore.all_passed,
        conditions: {
          c1_mathematical_correspondence: arm2bFinalScore.c1_evaluation,
          c2_false_twin_and_control: arm2bFinalScore.c2_evaluation,
          c3_epistemic_revision: arm2bFinalScore.c3_evaluation,
          c4_abstention_and_control: arm2bFinalScore.c4_evaluation
        }
      }
    ],
    cognitive_comparison: {
      accuracy_delta: arm2aFinalScore.total_passed - arm2bFinalScore.total_passed,
      modular_passed_rate: `${arm2aFinalScore.total_passed}/4`,
      union_passed_rate: `${arm2bFinalScore.total_passed}/4`,
      token_overhead_ratio: totalTokens2A / Math.max(1, totalTokens2B)
    },
    standing_invariants: {
      challenge_corpus_quarantined: true,
      empirical_acquisition_credit: 0,
      human_closure_reserved: true,
      gate_e_held: true
    }
  };

  const receiptPath = 'docs/research/experiment-b-preflight/03_calibration_execution/LIVE_CALIBRATION_EXECUTION_RECEIPT.json';
  fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
  console.log(`Live calibration receipt written to ${receiptPath}`);
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
