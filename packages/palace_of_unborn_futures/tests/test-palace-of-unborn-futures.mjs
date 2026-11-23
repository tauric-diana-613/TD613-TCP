/**
 * 𝌋 TD613 · THE PALACE OF UNBORN FUTURES
 * Executable Verification & Hostile Regression Suite (`node:test`)
 *
 * Verifies cryptographic pre-confirmatory locks, Experiment A zero-diff preservation,
 * Iso-Π Quartet equality, fail-closed secret-vault isolation, UTF-8 byte budgets,
 * working-memory immutability, non-renaming ontology gates, privacy side-channel assays,
 * FADT regime-shift counterexamples, and governance claim ceilings.
 *
 * Authority: SAC[X6ZNK5NO51] · Covenant: Khona‌lit-po
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import { sha256Hex } from '../src/prng.mjs';
import { generateSyntheticWorldSuite } from '../src/world-generator.mjs';
import { encodeInheritanceCapsule } from '../src/capsule-compressor.mjs';
import {
  COMPETING_CONDITIONS,
  assertNoSecretLeakage,
  prepareConditionInheritance,
} from '../src/heirs-and-policies.mjs';
import { verifyPredicateNonRenaming } from '../src/evaluator.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(PKG_ROOT, '..', '..');

test('1. Pre-confirmatory SHA-256 lock matches all 8 frozen source & pilot artifacts byte-for-byte', () => {
  const lockPath = path.join(PKG_ROOT, 'preregistration', 'frozen-confirmatory-lock.json');
  const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
  const entries = Object.entries(lock.locked_artifacts);
  assert.equal(entries.length, 8);

  for (const [relPath, expected] of entries) {
    const raw = fs.readFileSync(path.join(PKG_ROOT, relPath));
    assert.equal(raw.length, expected.bytes, `Byte length mismatch on locked ${relPath}`);
    assert.equal(sha256Hex(raw), expected.sha256, `SHA-256 mismatch on locked ${relPath}`);
  }
});

test('2. Frozen Experiment A predecessor commits exist intact with zero diff outside packages/palace_of_unborn_futures', () => {
  for (const sha of [
    '20df004c4997689d33ed614b42ab8b683c1da22a',
    'b69c39b17700e511b24a0ffa903bd1dcc6f266b3',
    '24b57b1b2d0b69ccaf94bdcea9c4a8e7ef73247c',
  ]) {
    const objType = execFileSync('git', ['cat-file', '-t', sha], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
    }).trim();
    assert.equal(objType, 'commit', `Expected commit object for ${sha}`);
  }

  const expADiff = execFileSync(
    'git',
    ['diff', 'b69c39b17700e511b24a0ffa903bd1dcc6f266b3', '--', 'packages/four_crossing_capstone', 'packages/universal_atelier'],
    { cwd: REPO_ROOT, encoding: 'utf8' }
  ).trim();
  assert.equal(expADiff, '', 'Frozen Experiment A directories must have zero diff');
});

test('3. Synthetic world generator enforces Iso-Π Quartet equality, distinct histories, and authentic Exile donors', () => {
  const miniSuite = generateSyntheticWorldSuite({
    suiteName: 'UNIT_TEST_SUITE',
    masterSeed: 'TD613_PALACE_UNIT_TEST_SEED_01',
    totalWorlds: 16,
  });

  assert.equal(miniSuite.publicWorlds.length, 16);
  assert.equal(miniSuite.quartet_verifications.length, 4);

  for (const qp of miniSuite.quartet_verifications) {
    assert.equal(qp.all_four_pi_equal, true, `Quartet ${qp.quartet_id} broke Π(G) equality`);
    assert.equal(qp.distinct_history_digests, 4, `Quartet ${qp.quartet_id} collapsed history digests`);
  }

  const worldById = new Map(miniSuite.publicWorlds.map(w => [w.world_public_id, w]));
  for (const w of miniSuite.publicWorlds) {
    assertNoSecretLeakage(w);
    const donor = worldById.get(w.exile_donor_world_public_id);
    assert.ok(donor, 'Exile donor world must exist in same quartet');
    assert.notEqual(donor.world_public_id, w.world_public_id);
    assert.equal(donor.terminal_graph_pi.digest, w.terminal_graph_pi.digest);
    assert.equal(
      sha256Hex(JSON.stringify(w.exile_authentic_foreign_history)),
      sha256Hex(JSON.stringify(donor.permissible_full_history)),
      'Exile history must be byte-identical to authentic sibling donor history'
    );
  }
});

test('4. Secret-vault taint guard fails closed on canary strings and forbidden answer-key properties', () => {
  assert.throws(
    () => assertNoSecretLeakage({ nested: { note: 'TD613_SECRET_VAULT_DO_NOT_EXPOSE_TO_INVESTIGATOR' } }),
    /SECRET_LEAKAGE_VIOLATION/
  );
  for (const forbiddenKey of [
    'true_mechanism_slot',
    'true_mechanism_archetype',
    'true_sensitive_attribute_S',
    'holdout_ground_truth_outputs',
    'optimal_probe_id',
    'structural_parameters',
  ]) {
    assert.throws(
      () => assertNoSecretLeakage({ payload: { [forbiddenKey]: 'leak' } }),
      /SECRET_LEAKAGE_VIOLATION/,
      `Expected assertNoSecretLeakage to reject ${forbiddenKey}`
    );
  }
});

test('5. Trained capsule codec enforces <= 96B and <= 256B limits and fails closed on overflow', () => {
  const codec = JSON.parse(
    fs.readFileSync(path.join(PKG_ROOT, 'receipts', 'trained-capsule-codec-v1.json'), 'utf8')
  );
  assert.equal(codec.trained_exclusively_on_suite, 'PILOT_48');
  assert.equal(codec.confirmatory_worlds_touched, 0);

  const miniSuite = generateSyntheticWorldSuite({
    suiteName: 'CAPSULE_BUDGET_TEST',
    masterSeed: 'TD613_PALACE_UNIT_TEST_SEED_02',
    totalWorlds: 16,
  });

  for (const w of miniSuite.publicWorlds) {
    const cap96 = encodeInheritanceCapsule({
      worldPublicId: w.world_public_id,
      historyRecords: w.permissible_full_history,
      trainedCodec: codec,
      budgetBytes: 96,
    });
    assert.ok(cap96.byte_length <= 96, `96B capsule exceeded budget: ${cap96.byte_length}`);

    const cap256 = encodeInheritanceCapsule({
      worldPublicId: w.world_public_id,
      historyRecords: w.permissible_full_history,
      trainedCodec: codec,
      budgetBytes: 256,
    });
    assert.ok(cap256.byte_length <= 256, `256B capsule exceeded budget: ${cap256.byte_length}`);

    assert.throws(
      () =>
        encodeInheritanceCapsule({
          worldPublicId: w.world_public_id,
          historyRecords: w.permissible_full_history,
          trainedCodec: codec,
          budgetBytes: 32,
        }),
      /CAPSULE_BUDGET_EXCEEDED/
    );
  }
});

test('6. VI_REVISIONISTS selective forgetting obeys tight/standard budgets without mutating audit history', () => {
  const codec = JSON.parse(
    fs.readFileSync(path.join(PKG_ROOT, 'receipts', 'trained-capsule-codec-v1.json'), 'utf8')
  );
  const miniSuite = generateSyntheticWorldSuite({
    suiteName: 'REV_IMMUTABILITY_TEST',
    masterSeed: 'TD613_PALACE_UNIT_TEST_SEED_03',
    totalWorlds: 16,
  });

  for (const w of miniSuite.publicWorlds) {
    const beforeSha = sha256Hex(JSON.stringify(w.permissible_full_history));
    for (const cond of COMPETING_CONDITIONS) {
      const inh96 = prepareConditionInheritance({
        conditionId: cond,
        publicWorld: w,
        trainedCodec: codec,
        budgetBytes: 96,
      });
      const inh256 = prepareConditionInheritance({
        conditionId: cond,
        publicWorld: w,
        trainedCodec: codec,
        budgetBytes: 256,
      });
      if (cond === 'III_HEIRS' || cond === 'VI_REVISIONISTS') {
        assert.ok(inh96.retained_bytes <= 96, `${cond} exceeded 96B: ${inh96.retained_bytes}`);
        assert.ok(inh256.retained_bytes <= 256, `${cond} exceeded 256B: ${inh256.retained_bytes}`);
      }
    }
    const afterSha = sha256Hex(JSON.stringify(w.permissible_full_history));
    assert.equal(afterSha, beforeSha, 'Immutable permissible_full_history was mutated');
  }
});

test('7. Non-renaming ontology gate rejects single-variable renamings and accepts genuine higher-order/holonomy predicates', () => {
  for (let coordIdx = 0; coordIdx < 3; coordIdx++) {
    for (const invert of [false, true]) {
      const check = verifyPredicateNonRenaming({
        kind: 'RENAMED_SINGLE_COORD',
        coord_idx: coordIdx,
        invert,
      });
      assert.equal(check.valid_extension, false);
      assert.equal(check.is_trivial_renaming, true);
      assert.equal(check.min_conditional_entropy_bits, 0);
    }
  }

  const mod3Check = verifyPredicateNonRenaming({
    kind: 'COMPOSITE_MOD3',
    c1: 1,
    c2: 2,
    target_r: 1,
  });
  assert.equal(mod3Check.valid_extension, true);
  assert.equal(mod3Check.is_trivial_renaming, false);
  assert.ok(mod3Check.min_conditional_entropy_bits >= 0.20);

  const latchCheck = verifyPredicateNonRenaming({
    kind: 'PATH_HOLONOMY_LATCH',
    trigger_prev_a1: 2,
  });
  assert.equal(latchCheck.valid_extension, true);
  assert.equal(latchCheck.is_trivial_renaming, false);
  assert.ok(latchCheck.min_conditional_entropy_bits >= 0.20);
});

test('8. Confirmatory 96-world and privacy disclosure receipts satisfy separation, noninferiority, and side-channel invariants', () => {
  const conf = JSON.parse(
    fs.readFileSync(path.join(PKG_ROOT, 'receipts', 'confirmatory-96-receipt.json'), 'utf8')
  );
  const priv = JSON.parse(
    fs.readFileSync(path.join(PKG_ROOT, 'receipts', 'privacy-disclosure-receipt.json'), 'utf8')
  );

  assert.equal(conf.supervision_mode, 'INTERNALLY_SEPARATED_SINGLE_SUPERVISING_MODEL');
  assert.equal(conf.independent_external_blinding, false);
  assert.equal(conf.disjointness_audit_vs_pilot_48.shared_world_ids, 0);
  assert.equal(conf.disjointness_audit_vs_pilot_48.shared_terminal_pi_digests, 0);
  assert.equal(conf.disjointness_audit_vs_pilot_48.shared_history_digests, 0);

  assert.equal(conf.vault_access_audit_log.competing_conditions_secret_access_count, 0);
  assert.equal(conf.vault_access_audit_log.random_control_secret_access_count, 0);
  assert.equal(conf.vault_access_audit_log.oracle_control_secret_access_count, 192);

  assert.equal(
    conf.results_by_budget.B_STANDARD_256B.paired_contrasts.heirs_minus_archivists_noninferiority.noninferiority_supported,
    true
  );

  // Naive key redaction leaks 100% via side-channels while typed capsules drop to ~25% chance (0 MM bits)
  assert.equal(
    priv.representations.NAIVE_KEY_REDACTED_CONTROL.attacks_on_confirmatory_96.ATK_3_STRONG_BAYESIAN_SIDECHANNEL.attack_accuracy,
    1.0
  );
  assert.equal(
    priv.representations.HEIRS_CAPSULE_256B.attacks_on_confirmatory_96.ATK_3_STRONG_BAYESIAN_SIDECHANNEL.miller_madow_corrected_mi_bits,
    0
  );
  assert.equal(
    priv.representations.HEIRS_CAPSULE_96B.attacks_on_confirmatory_96.ATK_3_STRONG_BAYESIAN_SIDECHANNEL.miller_madow_corrected_mi_bits,
    0
  );
});

test('9. Forbidden Wing and 10 Adversarial Challenges verify counterexamples and self-falsification', () => {
  const fw = JSON.parse(
    fs.readFileSync(path.join(PKG_ROOT, 'receipts', 'forbidden-wing-receipt.json'), 'utf8')
  );
  const ch = JSON.parse(
    fs.readFileSync(path.join(PKG_ROOT, 'receipts', 'adversarial-challenges-receipt.json'), 'utf8')
  );

  assert.equal(ch.total_challenges_executed, 10);
  assert.equal(ch.challenges.length, 10);

  const c03 = ch.challenges.find(c => c.challenge_id.startsWith('CHALLENGE_03'));
  assert.ok(c03.fadt_regime_shift_heirs_256B_utility < c03.amnesiacs_baseline_utility);

  const e3Counter = fw.exploratory_investigations.E3_THE_ONTOLOGICAL_PRISON.adversarial_opposite_counter_case;
  assert.equal(e3Counter.rupture_detection_rate_on_gf5, 1.0);
  assert.equal(e3Counter.valid_invention_rate_on_gf5, 0.0);

  const e4 = fw.exploratory_investigations.E4_THE_INTERROGATIVE_INHERITANCE;
  assert.equal(e4.classification, 'POST_HOC_EXPLORATORY_DISCOVERED_IN_PILOT');
  assert.equal(e4.positive_finding.mild_2_65_sigma_skeptic_rescues_utility, false);
  assert.equal(e4.positive_finding.corroboration_gated_rescues_near_amnesiacs, false);
});

test('10. Covenant Khona\\u200Clit-po, Dollhouse Design firebreak, and Dollhouse Audit ceilings hold strictly', () => {
  const paper = fs.readFileSync(
    path.join(PKG_ROOT, 'docs', '09_THE_PALACE_OF_UNBORN_FUTURES_PAPER.md'),
    'utf8'
  );
  assert.ok(
    paper.includes('THE PALACE OF UNBORN FUTURES:\n# COUNTERFACTUAL SCIENTIFIC INHERITANCE AND THE LIMITS OF FINITE RESEARCH MEMORY')
  );
  assert.ok(paper.includes('Khona\u200Clit-po'), 'Paper must preserve literal U+200C in Khona\\u200Clit-po');

  const designReceipt = JSON.parse(
    fs.readFileSync(path.join(PKG_ROOT, 'receipts', 'dollhouse-design-receipt.json'), 'utf8')
  );
  assert.equal(designReceipt.output_contract.requested_deliverables, 1);

  const auditReceipt = JSON.parse(
    fs.readFileSync(path.join(PKG_ROOT, 'receipts', 'dollhouse-audit-receipt-palace.json'), 'utf8')
  );
  assert.equal(auditReceipt.orchestrator.decision, 'SUPPORTED');
  assert.equal(auditReceipt.orchestrator.consensus, 'UNANIMOUS_SUPPORT');
  assert.equal(auditReceipt.empirical_replication_count, 0);
  assert.equal(auditReceipt.orchestrator.release_authority, false);
  assert.equal(auditReceipt.orchestrator.deployment_authority, false);
  assert.equal(auditReceipt.orchestrator.human_closure_required, true);
});
