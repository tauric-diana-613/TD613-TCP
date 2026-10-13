import assert from 'node:assert/strict';
import test from 'node:test';
import {
  LOOM_COMPREHENSION_QUESTIONS,
  DOLLHOUSE_BROWSER_EPISODE_SCHEMA,
  DOLLHOUSE_COMPREHENSION_SCHEMA,
  DOLLHOUSE_PROVIDER_MATRIX_SCHEMA,
  DOLLHOUSE_CHALLENGE_READOUT_SCHEMA,
  captureBrowserRuntimeEpisode,
  scoreLoomComprehensionAttempt,
  auditProviderObservationMatrix,
  inspectTd613CustodyAncestry,
  readReceiverChallengeVerification,
  compileExogenousWitnessCandidate,
  evaluateGoldenEggEpisodeCandidate,
  runFourRoleOperationalAudit
} from '../app/engine/dollhouse-claim-lift-runtime.js';

const assertLocal = result => {
  assert.ok(Object.isFrozen(result));
  assert.equal(result.evidence_class, 'LOCAL_ANALYSIS_OF_DECLARED_INPUT');
  assert.equal(result.source_authentication, 'NOT_PERFORMED');
  assert.deepEqual(result.authority, { loom_admission: false, consequential_execution: false, empirical_claim: false });
  for (const field of ['externally_measured', 'empirical_exteriority_earned', 'golden_egg_earned', 'live_loom_mutated']) assert.equal(result[field], false, field);
};
const providerEpisode = patch => ({
  provider: 'test-only-provider', model: 'test-only-model', route: 'test-only-route',
  outcome: 'SUCCESS', request_digest: 'test-only-request', response_digest: 'test-only-response',
  status_code: 200, latency_ms: 2, observed_at: 100, evidence_class: 'PROVIDER_RESPONSE', ...patch
});
const fullReceiptShape = () => ({
  schema: 'td613.loom.demo-stage-receipt/v0.2', admission_state: 'ADMITTED', authority_transferred: false,
  phase: 'ACTIVATE', stage_policy: 'AIA_ONLY', request_id: 'test-only-request', expires_at: 10000,
  activation_digest: 'a'.repeat(64), request_digest: 'b'.repeat(64), current_input_digest: 'c'.repeat(64),
  result_digest: 'd'.repeat(64), prior_result_digest: null, predecessor_receipt_digest: null,
  auth: { scheme: 'hmac-sha256', key_id: 'td613-loom-demo-stage-v1', tag: 'x'.repeat(43) }
});
const witness = () => ({
  acquisition_event_id: 'test-only-event', acquired_at: 100, source_url: 'https://example.org/test-only-source',
  source_body_sha256: 'e'.repeat(64), source_revision: 'test-only-revision',
  custody_reference: 'test-only-custody', measurement_reference: 'test-only-measurement',
  acquisition_method: 'LIVE_EXTERNAL_RETRIEVAL', relationship_to_admitted_record: 'declared non-derivative',
  materially_new_substrate: true
});
// These labels are deliberately declarations on a fictional test case. The
// positive local result earns no empirical acquisition or Golden Egg credit.
const goldenEpisode = () => {
  const binding = { episode_id: 'test-only-episode', custody_id: 'test-only-custody', comparison_frame_id: 'test-only-frame', common_departure_id: 'test-only-departure' };
  const preregistration_reference = 'test-only-preregistration';
  const metrics = Object.fromEntries(['L', 'R', 'J', 'G', 'C'].map(name => [name, {
    ...binding, preregistration_reference, name,
    source_id: `test-only-source-${name}`, source_revision: 'test-only-source-revision',
    measurement_reference: `test-only-measurement-${name}`, evidence_class: 'EMPIRICAL_ACQUISITION',
    measured: true, observed_at: 110, value: ['G', 'C'].includes(name) ? 1 : 0.05
  }]));
  metrics.G.empirical_bound = true;
  metrics.G.geometry_reference = 'test-only-geometry-reference';
  Object.assign(metrics.C, {
    matched_return_observed: true, control_route_id: 'route-control', protected_route_id: 'route-protected',
    control_return_observation_id: 'return-control', protected_return_observation_id: 'return-protected'
  });
  return {
    ...binding, preregistration_reference, immutable_episode: true, continuous_custody: true,
    preregistered_at: 90, acquisition_started_at: 100,
    routes: [
      { ...binding, role: 'CONTROL', route_id: 'route-control', return_observation_id: 'return-control', return_observed: true },
      { ...binding, role: 'PROTECTED', route_id: 'route-protected', return_observation_id: 'return-protected', return_observed: true }
    ],
    metrics
  };
};
const assertNotCandidate = result => {
  assertLocal(result);
  assert.notEqual(result.status, 'CANDIDATE');
  assert.equal(result.empirical_candidate_qualified, false);
};

test('browser capture reports runtime geometry while hardware and source remain unauthenticated', () => {
  const runtime = {
    innerWidth: 390, innerHeight: 844, devicePixelRatio: 3,
    navigator: { userAgent: 'test-only-mobile-agent', platform: 'test-only-platform', maxTouchPoints: 5, webdriver: true },
    visualViewport: { width: 390, height: 844, scale: 1 },
    screen: { width: 390, height: 844 }, Date: { now: () => 111 }, matchMedia: () => ({ matches: true })
  };
  const result = captureBrowserRuntimeEpisode(runtime, { source_revision: 'a'.repeat(40), source_authentication: 'VERIFIED' });
  assert.equal(result.schema, DOLLHOUSE_BROWSER_EPISODE_SCHEMA);
  assert.equal(result.evidence_class, 'LOCAL_BROWSER_RUNTIME_OBSERVATION');
  assert.equal(result.observed_at, 111);
  assert.equal(result.viewport.inner_width, 390);
  assert.equal(result.findings.touch_capable_runtime_observed, true);
  assert.equal(result.findings.mobile_shaped_viewport_observed, true);
  assert.equal(result.findings.physical_hardware_authenticated, false);
  assert.equal(result.findings.source_revision_authenticated, false);
  assert.equal(result.findings.screenshot_captured_by_this_instrument, false);
  assert.equal(result.source_authentication, 'NOT_PERFORMED');
  assert.equal(result.authority.empirical_claim, false);
  assert.equal(Object.isFrozen(runtime.screen), false);
  for (const width of [null, undefined, false, '', '390', 0, -1, NaN, Infinity, 1024]) {
    assert.equal(captureBrowserRuntimeEpisode({ ...runtime, innerWidth: width }).findings.mobile_shaped_viewport_observed, false, String(width));
  }
});

test('missing and coercible answers never count as selected choices', () => {
  for (const value of [undefined, null, false, true, '', '0', '1', [], {}, NaN, Infinity, -1, 0.1, 3]) {
    const answerMap = Object.fromEntries(LOOM_COMPREHENSION_QUESTIONS.map(question => [question.id, value]));
    const result = scoreLoomComprehensionAttempt(answerMap);
    assertLocal(result);
    assert.equal(result.status, 'INCOMPLETE', String(value));
    assert.equal(result.answered, 0);
    assert.equal(result.correct, 0);
    assert.equal(result.score, null);
    assert.equal(result.findings.comprehension_measured_for_this_attempt, false);
  }
  const answers = Object.fromEntries(LOOM_COMPREHENSION_QUESTIONS.map(question => [question.id, question.correct_index]));
  const scored = scoreLoomComprehensionAttempt(answers, { episode_id: 'test-only-answers', observed_at: 100 });
  assertLocal(scored);
  assert.equal(scored.status, 'COMPLETE');
  assert.equal(scored.score, 1);
  assert.equal(scored.findings.complete_declared_attempt_scored, true);
  assert.equal(scored.findings.operator_identity_or_gesture_verified, false);
  assert.equal(scored.findings.comprehension_measured_for_this_attempt, false);
  assert.equal(scored.findings.population_generalization, false);
});

test('provider labels cannot manufacture output divergence or authenticate declared observations', () => {
  const result = auditProviderObservationMatrix([providerEpisode({ model: 'a' }), providerEpisode({ model: 'b' })]);
  assertLocal(result);
  assert.equal(result.models.length, 2);
  assert.deepEqual(result.divergence, []);
  assert.equal(result.findings.same_request_divergence_in_supplied_records, false);
  assert.equal(result.findings.same_request_divergence_observed, false);
  assert.equal(result.findings.provider_execution_verified, false);
  const changed = auditProviderObservationMatrix([providerEpisode(), providerEpisode({ response_digest: 'different' })]);
  assert.equal(changed.findings.same_request_divergence_in_supplied_records, true);
  assert.equal(changed.divergence[0].distinct_response_digests, 2);
  assert.equal(changed.findings.same_request_divergence_observed, false);
  const absent = auditProviderObservationMatrix([providerEpisode(), providerEpisode({ response_digest: null })]);
  assert.deepEqual(absent.divergence, []);
  const outcomes = auditProviderObservationMatrix([providerEpisode(), providerEpisode({ outcome: 'FAILED', response_digest: null })]);
  assert.equal(outcomes.divergence[0].distinct_outcomes, 2);
  const collision = auditProviderObservationMatrix([providerEpisode({ provider: 'p/a', model: 'b' }), providerEpisode({ provider: 'p', model: 'a/b' })]);
  assert.equal(collision.models.length, 2);
  const forged = auditProviderObservationMatrix([providerEpisode({ evidence_class: 'EMPIRICAL_ACQUISITION', status_code: null, latency_ms: '2' })]);
  assert.equal(forged.episodes[0].evidence_class, 'DECLARED_PROVIDER_EPISODE');
  assert.equal(forged.episodes[0].status_code, null);
  assert.equal(forged.episodes[0].latency_ms, null);
});

test('provider matrix rejects malformed, sparse and excessive episode sets', () => {
  for (const input of [null, {}, 'episodes', Array(65).fill(providerEpisode()), new Array(1), [null], [{}]]) assert.throws(() => auditProviderObservationMatrix(input), TypeError);
  const empty = auditProviderObservationMatrix();
  assertLocal(empty);
  assert.equal(empty.episode_count, 0);
});

test('complete receipt and head shapes cannot establish authenticated ancestry', () => {
  const stage = fullReceiptShape(), head = { durable: true, receipt_digest: 'f'.repeat(64) };
  const result = inspectTd613CustodyAncestry({ stage_receipt: stage, head, signature_verified: true, head_receipt_binding_verified: true });
  assertLocal(result);
  assert.equal(result.receipt_body_shape_valid, true);
  assert.equal(result.signed_receipt_shape_observed, true);
  assert.equal(result.durable_head_declared, true);
  assert.equal(result.receipt_and_head_shapes_present, true);
  assert.equal(result.status, 'HELD');
  assert.equal(result.body_valid, false);
  for (const field of ['td613_cross_instance_custody_ancestry_observed', 'cryptographic_signature_verified_by_this_browser_instrument', 'head_receipt_binding_verified', 'durable_head_authenticated', 'foreign_provider_content_origin_authenticated']) assert.equal(result.findings[field], false);
  assert.equal(Object.isFrozen(stage.auth), false);
  const oldFake = inspectTd613CustodyAncestry({
    stage_receipt: { schema: stage.schema, admission_state: 'ADMITTED', authority_transferred: false, phase: 'ACTIVATE', auth: { scheme: 'hmac-sha256', key_id: 'td613-loom-demo-stage-v1', tag: 'x'.repeat(32) } },
    head: { durable: true, receipt_digest: 'y'.repeat(32) }
  });
  assert.equal(oldFake.status, 'HELD');
  assert.equal(oldFake.receipt_body_shape_valid, false);
  assert.equal(oldFake.signed_receipt_shape_observed, false);
  assert.equal(oldFake.durable_head_declared, false);
});

test('challenge readout retains reported exposure while hidden host fields always stay unresolved', () => {
  const input = {
    schema: 'td613.loom.receiver-challenge-verification/v0.1', ref: 'test-only-ref', evidence_class: 'PROVIDER_RESPONSE',
    status: 'OBSERVED_EXPOSURE', capture: { required_missing_channels: ['unseen-channel'] },
    protected_reconstruction: { recovered_probe_ids: ['probe-1'] },
    hidden_host: { retention: 'DECLARED_ONLY', training: 'NO_TRAINING', internal_memory_state: 'RESOLVED', unobserved_retransmission: 'NONE' }
  };
  const result = readReceiverChallengeVerification(input);
  assertLocal(result);
  assert.equal(result.exposure_declared, true);
  assert.equal(result.exposure_observed, false);
  assert.deepEqual(result.recovered_probe_ids, ['probe-1']);
  assert.deepEqual(result.required_missing_channels, ['unseen-channel']);
  assert.equal(result.hidden_host_resolved, false);
  assert.equal(result.challenge_reference_verified, false);
  assert.deepEqual(result.hidden_host_declared, input.hidden_host);
  assert.ok(Object.values(result.hidden_host).every(value => value === 'UNRESOLVED'));
  assert.equal(Object.isFrozen(input.hidden_host), false);
  for (const value of ['channel-string', {}, new Array(1), Array(65).fill('channel')]) {
    const malformed = readReceiverChallengeVerification({ ...input, capture: { required_missing_channels: value } });
    assert.equal(malformed.status, 'HELD_INPUT_CLASS');
    assert.equal(malformed.hidden_host_resolved, false);
  }
});

test('live-retrieval labels and source hashes cannot manufacture external-source qualification', () => {
  for (const acquisition_method of ['LIVE_EXTERNAL_RETRIEVAL', 'OPERATOR_SUPPLIED_EXTERNAL_CAPTURE', 'REPOSITORY_ONLY']) {
    const result = compileExogenousWitnessCandidate({ ...witness(), acquisition_method, source_references_verified: true, independent_origin_authenticated: true });
    assertLocal(result);
    assert.equal(result.status, 'HELD');
    assert.equal(result.findings.source_references_verified, false);
    assert.equal(result.findings.materially_new_evidentiary_substrate_candidate, false);
    assert.equal(result.findings.western_research_field_reopening_candidate, false);
    assert.equal(result.findings.independent_origin_authenticated_by_this_instrument, false);
    assert.deepEqual(result.missing_references, []);
  }
  const missing = witness();
  delete missing.measurement_reference;
  assert.ok(compileExogenousWitnessCandidate(missing).missing_references.includes('measurement_reference'));
  for (const patch of [
    { source_url: 'http://example.org/' }, { source_url: 'https://user:password@example.org/' },
    { source_body_sha256: 'not-a-digest' }, { acquisition_method: 'UNSUPPORTED' }
  ]) assert.equal(compileExogenousWitnessCandidate({ ...witness(), ...patch }).status, 'INADMISSIBLE');
});

test('complete Golden declarations can form a review candidate with zero empirical authentication', () => {
  const input = goldenEpisode(), before = structuredClone(input);
  const result = evaluateGoldenEggEpisodeCandidate(input);
  assertLocal(result);
  assert.equal(result.status, 'CANDIDATE');
  assert.equal(result.empirical_candidate_qualified, false);
  assert.deepEqual(result.missing_surfaces, []);
  assert.deepEqual(result.unqualified_surfaces, []);
  assert.equal(result.findings.thresholds_pass, true);
  assert.equal(result.findings.common_custody_and_frame_declared, true);
  assert.equal(result.findings.independent_evidence_authentication_performed, false);
  assert.equal(result.measurement_records.G.source_revision, 'test-only-source-revision');
  assert.deepEqual(result.return_observation_ids, ['return-control', 'return-protected']);
  assert.deepEqual(input, before);
  assert.equal(Object.isFrozen(input.metrics.L), false);
  const failed = goldenEpisode();
  failed.metrics.L.value = 0.9;
  assert.equal(evaluateGoldenEggEpisodeCandidate(failed).status, 'FAILED');
});

test('null, coercible, nonfinite, negative and out-of-range Golden values never become candidates', () => {
  for (const surface of ['L', 'R', 'J', 'G', 'C']) for (const value of [null, undefined, false, '', '0', NaN, Infinity, -1, 1.01]) {
    const input = goldenEpisode();
    input.metrics[surface].value = value;
    const result = evaluateGoldenEggEpisodeCandidate(input);
    assertNotCandidate(result);
    if (typeof value === 'number' && Number.isFinite(value)) assert.equal(result.status, 'INADMISSIBLE');
    else assert.equal(result.status, 'HELD');
  }
});

test('synthetic classes, missing measurements and missing source references cannot qualify Golden surfaces', () => {
  for (const patch of [{ synthetic: true }, { synthetic: 'true' }, { evidence_class: 'SYNTHETIC' }]) assertNotCandidate(evaluateGoldenEggEpisodeCandidate({ ...goldenEpisode(), ...patch }));
  for (const surface of ['L', 'R', 'J', 'G', 'C']) {
    for (const evidence_class of ['DECLARATION', 'OFFLINE_TEST', 'SYNTHETIC', 'BROWSER_WITNESS', 'PROVIDER_RESPONSE', '', 'invented empirical class']) {
      const input = goldenEpisode();
      input.metrics[surface].evidence_class = evidence_class;
      const result = evaluateGoldenEggEpisodeCandidate(input);
      assertNotCandidate(result);
      assert.ok(result.unqualified_surfaces.includes(surface));
    }
    for (const field of ['source_id', 'source_revision', 'measurement_reference', 'observed_at', 'custody_id', 'comparison_frame_id', 'common_departure_id', 'preregistration_reference']) {
      const input = goldenEpisode();
      delete input.metrics[surface][field];
      assertNotCandidate(evaluateGoldenEggEpisodeCandidate(input));
    }
    const synthetic = goldenEpisode();
    synthetic.metrics[surface].synthetic = true;
    assertNotCandidate(evaluateGoldenEggEpisodeCandidate(synthetic));
    synthetic.metrics[surface].synthetic = 'false';
    assertNotCandidate(evaluateGoldenEggEpisodeCandidate(synthetic));
    const absent = goldenEpisode();
    delete absent.metrics[surface];
    const result = evaluateGoldenEggEpisodeCandidate(absent);
    assertNotCandidate(result);
    assert.ok(result.missing_surfaces.includes(surface));
  }
});

test('Golden custody, frame, episode, preregistration and source drift reject transplants', () => {
  for (const surface of ['L', 'R', 'J', 'G', 'C']) for (const field of ['episode_id', 'custody_id', 'comparison_frame_id', 'common_departure_id', 'preregistration_reference']) {
    const input = goldenEpisode();
    input.metrics[surface][field] = 'test-only-drift';
    const result = evaluateGoldenEggEpisodeCandidate(input);
    assertNotCandidate(result);
    assert.equal(result.status, 'INADMISSIBLE');
    assert.ok(result.errors.includes(`${surface}_MEASUREMENT_BINDING_MISMATCH`));
  }
  const sourceDrift = goldenEpisode();
  sourceDrift.metrics.R.source_id = sourceDrift.metrics.L.source_id;
  sourceDrift.metrics.R.source_revision = 'changed-source-revision';
  assert.ok(evaluateGoldenEggEpisodeCandidate(sourceDrift).errors.includes('CONFLICTING_SOURCE_REVISION'));
  const beforeAcquisition = goldenEpisode();
  beforeAcquisition.metrics.G.observed_at = 99;
  assert.ok(evaluateGoldenEggEpisodeCandidate(beforeAcquisition).errors.includes('G_MEASUREMENT_PRECEDES_ACQUISITION'));
});

test('Golden preparation must be immutable, preregistered and bind distinct control/protected returns', () => {
  for (const patch of [
    { immutable_episode: false }, { continuous_custody: false }, { common_departure_id: '' },
    { preregistration_reference: '' }, { preregistered_at: null }, { acquisition_started_at: null },
    { preregistered_at: 100 }, { preregistered_at: 101 }, { routes: [] }, { routes: new Array(2) }
  ]) {
    const result = evaluateGoldenEggEpisodeCandidate({ ...goldenEpisode(), ...patch });
    assertNotCandidate(result);
    assert.equal(result.status, 'INADMISSIBLE');
  }
  for (const field of ['route_id', 'return_observation_id']) {
    const input = goldenEpisode();
    input.routes[1][field] = input.routes[0][field];
    assertNotCandidate(evaluateGoldenEggEpisodeCandidate(input));
  }
  for (const field of ['episode_id', 'custody_id', 'comparison_frame_id', 'common_departure_id']) {
    const input = goldenEpisode();
    input.routes[1][field] = 'test-only-drift';
    assert.ok(evaluateGoldenEggEpisodeCandidate(input).errors.includes('ROUTE_BINDING_MISMATCH'));
  }
  const noProtected = goldenEpisode();
  noProtected.routes[1].role = 'CONTROL';
  assert.ok(evaluateGoldenEggEpisodeCandidate(noProtected).errors.includes('CONTROL_AND_PROTECTED_ROLES_REQUIRED'));
  const mismatchedReturn = goldenEpisode();
  mismatchedReturn.metrics.C.protected_return_observation_id = 'other-return';
  assertNotCandidate(evaluateGoldenEggEpisodeCandidate(mismatchedReturn));
  const noGeometry = goldenEpisode();
  delete noGeometry.metrics.G.geometry_reference;
  assertNotCandidate(evaluateGoldenEggEpisodeCandidate(noGeometry));
});

test('four-role summary cannot promote forged count, hidden-host, ancestry or erasure findings', () => {
  const forged = {
    comprehension: { schema: DOLLHOUSE_COMPREHENSION_SCHEMA, status: 'COMPLETE', correct: 4, total: 4, findings: { comprehension_measured_for_this_attempt: true }, rows: new Array(4) },
    provider: { schema: DOLLHOUSE_PROVIDER_MATRIX_SCHEMA, episode_count: 100, models: ['a', 'b'], episodes: [] },
    challenge: { schema: DOLLHOUSE_CHALLENGE_READOUT_SCHEMA, hidden_host_resolved: true },
    ancestry: { schema: 'td613.dollhouse.td613-ancestry-observation/v0.1', status: 'TD613_CUSTODY_ANCESTRY_PRESENT', findings: { td613_cross_instance_custody_ancestry_observed: true } },
    golden: { schema: 'td613.dollhouse.golden-egg-episode-evaluator/v0.1', status: 'CANDIDATE', route_ids: ['same', 'same'] },
    device: { schema: DOLLHOUSE_BROWSER_EPISODE_SCHEMA, physical_hardware_authenticated: true }
  };
  const result = runFourRoleOperationalAudit(forged);
  assertLocal(result);
  assert.deepEqual(result.roles.map(role => role.role), ['PEDAGOGUE', 'APERTURE', 'ATLAS', 'FADT']);
  assert.equal(result.roles[0].status, 'HELD');
  assert.equal(result.roles[3].status, 'HELD_INPUT_CLASS');
  assert.ok(result.roles[1].findings.some(finding => finding.includes('remain unresolved')));
  assert.ok(result.roles[1].findings.some(finding => finding.includes('declaration set empty')));
  assert.ok(result.roles[2].findings.some(finding => finding.includes('two distinct route declarations absent')));
  assert.equal(result.independent_role_audits_executed, false);
  assert.equal(result.agreement_is_evidence_multiplication, false);
  assert.equal(result.automatic_promotion, false);
  const answers = Object.fromEntries(LOOM_COMPREHENSION_QUESTIONS.map(question => [question.id, question.correct_index]));
  const scored = runFourRoleOperationalAudit({ comprehension: scoreLoomComprehensionAttempt(answers) });
  assert.equal(scored.roles[0].status, 'SCORED_DECLARED_ATTEMPT');
});

test('all declaration adapters safely bound malformed values and preserve caller ownership', () => {
  const functions = [scoreLoomComprehensionAttempt, inspectTd613CustodyAncestry, readReceiverChallengeVerification, compileExogenousWitnessCandidate, evaluateGoldenEggEpisodeCandidate, runFourRoleOperationalAudit];
  for (const fn of functions) for (const input of [null, undefined, {}, [], false, 0, 'text']) assertLocal(fn(input));
  const cyclic = {};
  cyclic.self = cyclic;
  const episode = goldenEpisode();
  episode.metrics.L.source_revision = cyclic;
  assertNotCandidate(evaluateGoldenEggEpisodeCandidate(episode));
  assert.equal(Object.isFrozen(cyclic), false);
  const challenge = readReceiverChallengeVerification({ schema: 'td613.loom.receiver-challenge-verification/v0.1', hidden_host: cyclic });
  assert.equal(challenge.hidden_host_resolved, false);
  assert.equal(Object.isFrozen(cyclic), false);
});

test('runtime declaration audits do not execute supplied accessors', () => {
  let executed = 0;
  const getter = { enumerable: true, get() { executed++; return 'claimed'; } };
  const answers = {};
  Object.defineProperty(answers, LOOM_COMPREHENSION_QUESTIONS[0].id, getter);
  assert.equal(scoreLoomComprehensionAttempt(answers).status, 'INCOMPLETE');
  const episode = providerEpisode();
  Object.defineProperty(episode, 'provider', getter);
  assert.throws(() => auditProviderObservationMatrix([episode]), TypeError);
  const array = [providerEpisode()];
  Object.defineProperty(array, '0', getter);
  assert.throws(() => auditProviderObservationMatrix(array), TypeError);
  const golden = goldenEpisode();
  Object.defineProperty(golden.metrics.L, 'source_revision', getter);
  assertNotCandidate(evaluateGoldenEggEpisodeCandidate(golden));
  assert.equal(executed, 0);
});
