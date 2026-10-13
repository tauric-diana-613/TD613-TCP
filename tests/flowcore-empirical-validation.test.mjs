import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import { webcrypto } from 'node:crypto';

import {
  VALIDATION_CONDITIONS,
  VALIDATION_METRICS,
  compileValidationProtocol,
  compileValidationTrial,
  compareValidationConditions,
  compileAdverseFindings,
  compileValidationBundle,
  assessChildPilotEligibility
} from '../app/engine/flowcore-empirical-validation.js';

const fixture = () => JSON.parse(fs.readFileSync('app/dome-world/fixtures/pedagogue/flowcore-validation-synthetic-pipeline.json', 'utf8'));

async function compileSynthetic() {
  const data = fixture();
  const protocol = await compileValidationProtocol(data.protocol, { ...data.determinism.protocol, cryptoImpl: webcrypto });
  const trials = [];
  for (let index = 0; index < data.observations.length; index += 1) {
    trials.push(await compileValidationTrial(protocol, data.observations[index], { ...data.determinism.trials[index], cryptoImpl: webcrypto }));
  }
  const bundle = await compileValidationBundle(protocol, trials, { ...data.determinism.bundle, cryptoImpl: webcrypto });
  return { data, protocol, trials, bundle };
}

test('P9 protocol fixes adult-first conditions, metrics, consent, and privacy boundaries', async () => {
  const data = fixture();
  const protocol = await compileValidationProtocol(data.protocol, { ...data.determinism.protocol, cryptoImpl: webcrypto });
  assert.equal(protocol.baseline_cohort, 'ADULT_OPERATORS_FIRST');
  assert.deepEqual(protocol.conditions, VALIDATION_CONDITIONS);
  assert.deepEqual(protocol.metrics, VALIDATION_METRICS);
  assert.equal(protocol.consent.voluntary_participation_required, true);
  assert.equal(protocol.consent.withdrawal_without_penalty, true);
  assert.equal(protocol.consent.covert_telemetry, false);
  assert.equal(protocol.consent.hidden_ranking, false);
  assert.equal(protocol.consent.stable_participant_identity, false);
  assert.equal(protocol.data_boundary.raw_case_content_allowed, false);
  assert.equal(protocol.data_boundary.artifact_bytes_allowed, false);
  assert.equal(protocol.data_boundary.network_transport_required, false);
  assert.equal(protocol.child_pilot.initially_allowed, false);
  assert.equal(protocol.authority.child_pilot_authorized, false);
  assert.equal(protocol.closure.status, 'OPEN');
});

test('P9 rejects incomplete conditions, child-first protocols, and identifying fields', async () => {
  const data = fixture();
  await assert.rejects(() => compileValidationProtocol({ ...data.protocol, conditions: VALIDATION_CONDITIONS.slice(0, 2) }, { ...data.determinism.protocol, cryptoImpl: webcrypto }), /three canonical conditions/i);
  await assert.rejects(() => compileValidationProtocol({ ...data.protocol, baseline_cohort: 'CHILDREN_FIRST' }, { ...data.determinism.protocol, cryptoImpl: webcrypto }), /adult operators first/i);
  await assert.rejects(() => compileValidationProtocol({ ...data.protocol, learner_id: 'forbidden' }, { ...data.determinism.protocol, cryptoImpl: webcrypto }), /forbidden/i);
});

test('synthetic trials preserve ephemeral references and never become human evidence', async () => {
  const { trials } = await compileSynthetic();
  assert.equal(trials.length, 3);
  for (const trial of trials) {
    assert.equal(trial.synthetic_pipeline_only, true);
    assert.equal(trial.cohort, 'ADULT_OPERATOR');
    assert.equal(trial.session_reference_is_stable_identity, false);
    assert.equal(trial.source_boundary.raw_case_content_included, false);
    assert.equal(trial.source_boundary.artifact_bytes_included, false);
    assert.equal(trial.source_boundary.quoted_participant_language_included, false);
    assert.equal(trial.empirical_authority.counts_as_human_evidence, false);
    assert.equal(trial.empirical_authority.counts_as_child_pilot_evidence, false);
    assert.equal(trial.empirical_authority.establishes_causation, false);
    assert.match(trial.trial_digest, /^sha256:[0-9a-f]{64}$/);
  }
});

test('P9 rejects non-adult trials, stable identities, raw content, and malformed metrics', async () => {
  const data = fixture();
  const protocol = await compileValidationProtocol(data.protocol, { ...data.determinism.protocol, cryptoImpl: webcrypto });
  const base = data.observations[0];
  await assert.rejects(() => compileValidationTrial(protocol, { ...base, cohort: 'CHILD' }, { ...data.determinism.trials[0], cryptoImpl: webcrypto }), /adult operator/i);
  await assert.rejects(() => compileValidationTrial(protocol, { ...base, user_id: 'stable' }, { ...data.determinism.trials[0], cryptoImpl: webcrypto }), /forbidden/i);
  await assert.rejects(() => compileValidationTrial(protocol, { ...base, raw_content: 'case text' }, { ...data.determinism.trials[0], cryptoImpl: webcrypto }), /forbidden/i);
  await assert.rejects(() => compileValidationTrial(protocol, { ...base, metrics: { ...base.metrics, confidence_calibration_millipoints: 1001 } }, { ...data.determinism.trials[0], cryptoImpl: webcrypto }), /confidence_calibration/i);
});

test('condition comparison reports counts without causal promotion or participant scores', async () => {
  const { trials } = await compileSynthetic();
  const comparison = compareValidationConditions(trials);
  assert.equal(comparison.all_conditions_present, true);
  assert.equal(comparison.human_adult_trial_count, 0);
  assert.equal(comparison.synthetic_trial_count, 3);
  assert.equal(comparison.causal_claim_allowed, false);
  assert.equal(comparison.user_level_score_emitted, false);
  assert.equal(comparison.automatic_winner_selected, false);
  const full = comparison.conditions.find(item => item.condition === 'C_FULL_AIA_PEDAGOGUE');
  assert.equal(full.causal_route_explanation_successes, 1);
  assert.equal(full.missingness_recognition_successes, 1);
  assert.equal(full.station_ownership_recognition_successes, 1);
  assert.equal(full.recovery_successes, 1);
});

test('adverse findings remain publishable and cannot trigger automatic redesign', async () => {
  const { trials } = await compileSynthetic();
  const findings = compileAdverseFindings(trials);
  assert.ok(findings.finding_count >= 6);
  assert.ok(findings.findings.some(item => item.kind === 'ABANDONMENT'));
  assert.ok(findings.findings.some(item => item.kind === 'ROUTE_REPORTED_COERCIVE'));
  assert.ok(findings.findings.some(item => item.kind === 'DIFFERENCE_REPORTED_FLATTENED'));
  assert.equal(findings.publication_required, true);
  assert.equal(findings.suppress_unfavorable_results, false);
  assert.equal(findings.automatic_redesign_command, false);
  assert.equal(findings.human_review_required, true);
});

test('synthetic-only bundle keeps empirical promotion and child pilot held', async () => {
  const { bundle } = await compileSynthetic();
  assert.equal(bundle.evidence_posture.human_adult_evidence_present, false);
  assert.equal(bundle.evidence_posture.synthetic_pipeline_only, true);
  assert.equal(bundle.evidence_posture.empirical_promotion_evidence_complete, false);
  assert.equal(bundle.promotion.empirical_exit_gate_passed, false);
  assert.equal(bundle.promotion.reason, 'HUMAN_VOLUNTARY_ADULT_EVIDENCE_ABSENT');
  assert.equal(bundle.promotion.merge_may_satisfy_empirical_gate, false);
  assert.equal(bundle.promotion.deployment_may_satisfy_empirical_gate, false);
  assert.equal(bundle.child_pilot.eligible, false);
  assert.equal(bundle.child_pilot.synthetic_trials_count_as_adult_evidence, false);
  assert.equal(bundle.child_pilot.vulnerable_ash_cases_allowed, false);
  assert.equal(bundle.authority.child_pilot_authorized, false);
  assert.equal(bundle.authority.automatic_redesign_authorized, false);
  assert.equal(bundle.closure.status, 'OPEN');
});

test('human adult evidence remains necessary but never sufficient for automatic child authorization', async () => {
  const data = fixture();
  const protocol = await compileValidationProtocol(data.protocol, { ...data.determinism.protocol, cryptoImpl: webcrypto });
  const trials = [];
  for (let index = 0; index < data.observations.length; index += 1) {
    const observation = {
      ...data.observations[index],
      evidence_class: 'HUMAN_VOLUNTARY_ADULT',
      metrics: {
        ...data.observations[index].metrics,
        causal_route_explanation: true,
        missingness_recognition: true,
        station_ownership_recognition: true,
        recovery_success: true,
        abandonment: false
      },
      qualitative: {
        ...data.observations[index].qualitative,
        coercive_route_reported: false,
        difference_flattened_reported: false
      }
    };
    trials.push(await compileValidationTrial(protocol, observation, { ...data.determinism.trials[index], idSeed: `${data.determinism.trials[index].idSeed}:human`, cryptoImpl: webcrypto }));
  }
  const bundle = await compileValidationBundle(protocol, trials, { ...data.determinism.bundle, idSeed: `${data.determinism.bundle.idSeed}:human`, cryptoImpl: webcrypto });
  const eligibility = assessChildPilotEligibility(bundle);
  assert.equal(eligibility.adult_evidence_complete, true);
  assert.equal(eligibility.safety_clear, true);
  assert.equal(eligibility.clarity_clear, true);
  assert.equal(eligibility.eligible, true);
  assert.equal(eligibility.human_authorization_still_required, true);
  assert.equal(bundle.authority.child_pilot_authorized, false);
  assert.equal(bundle.promotion.empirical_exit_gate_passed, false);
});

test('P9 protocol, trials, and bundle are deterministic under frozen inputs', async () => {
  const left = await compileSynthetic();
  const right = await compileSynthetic();
  assert.equal(left.protocol.protocol_id, right.protocol.protocol_id);
  assert.deepEqual(left.trials.map(item => item.trial_digest), right.trials.map(item => item.trial_digest));
  assert.equal(left.bundle.bundle_id, right.bundle.bundle_id);
  assert.equal(left.bundle.bundle_digest, right.bundle.bundle_digest);
  assert.deepEqual(left.bundle.adverse_findings, right.bundle.adverse_findings);
});

test('P9 lab exposes conditions, adverse findings, privacy, mobile, and reduced-motion boundaries', () => {
  const html = fs.readFileSync('app/dome-world/flowcore-validation-lab.html', 'utf8');
  const js = fs.readFileSync('app/dome-world/flowcore-validation-lab.js', 'utf8');
  const css = fs.readFileSync('app/dome-world/flowcore-validation-lab.css', 'utf8');
  const schema = JSON.parse(fs.readFileSync('app/dome-world/schemas/flowcore-validation-v01.schema.json', 'utf8'));
  assert.match(html, /data-condition-nav/);
  assert.match(html, /Adult operators first/);
  assert.match(html, /No covert telemetry/);
  assert.match(html, /Synthetic pipeline output does not count as human evidence/);
  for (const control of ['data-rest', 'data-return', 'data-replay', 'data-exit']) assert.match(html, new RegExp(control));
  assert.match(js, /compileValidationBundle/);
  assert.match(js, /Adverse findings/);
  assert.match(js, /Child-pilot gate/);
  assert.match(js, /Promotion hold/);
  assert.doesNotMatch(js, /requestAnimationFrame|localStorage|indexedDB/);
  assert.match(css, /max-width: 390px/);
  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.equal(schema.$id, 'td613.flowcore.validation/v0.1');
});
