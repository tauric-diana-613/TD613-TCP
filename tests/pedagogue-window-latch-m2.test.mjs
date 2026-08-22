import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import {
  assertWindowLatchLiveAuthority,
  buildWindowLatchCustodyObservation,
  classifyLatePropertyLookup,
  classifyWindowLatchLifecycle,
  observeWindowLatchOnce,
  writeWindowLatchCustodyArtifact
} from '../scripts/pedagogue-window-latch-m2.mjs';
import {
  independentlyReplayWindowLatch
} from '../scripts/pedagogue-window-latch-m2-independent-replay.mjs';

const armPath = 'docs/pedagogue/M2_WINDOW_LATCH_LIVE_RUN_ARMED';
const artifactPath = 'artifacts/pedagogue-observation-custody/m2-window-latch-observation.json';

function socket({ present = true, authorized = true, destroyed = false } = {}) {
  return {
    present,
    constructor_name: present ? 'TLSSocket' : null,
    encrypted: present,
    authorized_property_present: present,
    authorized_value: present ? authorized : null,
    authorization_error_present: false,
    destroyed: present ? destroyed : null
  };
}

function noSocket() {
  return {
    present: false,
    constructor_name: null,
    encrypted: false,
    authorized_property_present: false,
    authorized_value: null,
    authorization_error_present: false,
    destroyed: null
  };
}

function raw(overrides = {}) {
  return {
    request_completed: true,
    response_available: true,
    response_status: 200,
    redirected: false,
    response_body_limit_exceeded: false,
    body_sha256: 'b'.repeat(64),
    body_bytes: 613,
    explicit_reject_unauthorized_true: true,
    request_reused_socket: false,
    request_socket_present: true,
    secure_connect_observed: true,
    callback_response_socket_present: true,
    callback_response_socket: socket(),
    retained_callback_socket_same_as_request_socket: true,
    end_response_socket_present: true,
    end_response_socket_same_as_callback_socket: true,
    end_response_socket: socket(),
    retained_callback_socket_at_end: socket(),
    request_error_observed: false,
    request_error_code: null,
    ...overrides
  };
}

const fakeEnv = {
  TD613_SCIENCE_HEAD: 'a'.repeat(40),
  TD613_WORKFLOW_RUN_ID: '613',
  TD613_WORKFLOW_RUN_NUMBER: '1941',
  TD613_WORKFLOW_RUN_ATTEMPT: '1',
  TD613_WORKFLOW_NAME: 'TD613 Consolidated Validation',
  TD613_WORKFLOW_JOB: 'contracts'
};

test('M2 synthetic falsifier fixture independently classifies the end-time authorized socket', async () => {
  const observation = raw();
  assert.deepEqual(classifyLatePropertyLookup(observation), { supported: false, falsified: true });
  assert.ok(classifyWindowLatchLifecycle(observation).includes('CALLBACK_AUTH_TRUE_END_RESPONSE_SOCKET_AUTH_TRUE'));

  const custody = await buildWindowLatchCustodyObservation(
    observation,
    fakeEnv,
    new Date('2026-08-22T07:13:00.000Z')
  );
  const replay = independentlyReplayWindowLatch(custody, {
    scienceHead: 'a'.repeat(40),
    workflowRunId: '613',
    workflowRunNumber: '1941',
    workflowRunAttempt: '1'
  });
  assert.equal(replay.ok, true);
  assert.equal(replay.mechanism_disposition, 'LATE_PROPERTY_LOOKUP_APERTURE_FALSIFIED_IN_EXACT_RUN');
  assert.equal(replay.external_request_count, 1);
  assert.equal(replay.second_observation_performed, false);
});

test('M2 synthetic support fixture preserves retained authorization when response.socket disappears', async () => {
  const observation = raw({
    secure_connect_observed: false,
    end_response_socket_present: false,
    end_response_socket_same_as_callback_socket: false,
    end_response_socket: noSocket(),
    retained_callback_socket_at_end: socket({ authorized: true, destroyed: true })
  });
  assert.deepEqual(classifyLatePropertyLookup(observation), { supported: true, falsified: false });
  const classes = classifyWindowLatchLifecycle(observation);
  assert.ok(classes.includes('CALLBACK_AUTH_TRUE_END_RESPONSE_SOCKET_UNAVAILABLE_RETAINED_AUTH_TRUE'));
  assert.ok(classes.includes('END_RESPONSE_SOCKET_PROPERTY_UNAVAILABLE'));

  const custody = await buildWindowLatchCustodyObservation(
    observation,
    fakeEnv,
    new Date('2026-08-22T07:13:00.000Z')
  );
  const replay = independentlyReplayWindowLatch(custody, {
    scienceHead: 'a'.repeat(40),
    workflowRunId: '613',
    workflowRunNumber: '1941',
    workflowRunAttempt: '1'
  });
  assert.equal(replay.ok, true);
  assert.equal(replay.mechanism_disposition, 'LATE_PROPERTY_LOOKUP_APERTURE_SUPPORTED_IN_EXACT_RUN');
});

test('M2 custody rejects retroactive laundering by preserving run 1932 as unresolved', async () => {
  const custody = await buildWindowLatchCustodyObservation(
    raw(),
    fakeEnv,
    new Date('2026-08-22T07:13:00.000Z')
  );
  const tampered = structuredClone(custody);
  tampered.historical_run_1932_status = 'REPAIRED';
  const replay = independentlyReplayWindowLatch(tampered, {
    scienceHead: 'a'.repeat(40),
    workflowRunId: '613',
    workflowRunNumber: '1941',
    workflowRunAttempt: '1'
  });
  assert.equal(replay.ok, false);
  assert.ok(replay.failures.includes('RUN_1932_ANTI_RETROACTIVITY_BROKEN'));
  assert.ok(replay.failures.includes('CUSTODY_DIGEST_MISMATCH'));
});

test('M2 live instrument fails closed before network I/O when human arm or GitHub PR context is absent', async () => {
  assert.throws(
    () => assertWindowLatchLiveAuthority({ GITHUB_ACTIONS: 'false', GITHUB_EVENT_NAME: 'pull_request' }, true),
    /WINDOW_LATCH_LIVE_REQUEST_NOT_ARMED/
  );
  await assert.rejects(
    observeWindowLatchOnce({ GITHUB_ACTIONS: 'true', GITHUB_EVENT_NAME: 'push' }),
    /WINDOW_LATCH_LIVE_REQUEST_NOT_ARMED/
  );
});

test('M2 live Window Latch executes only in GitHub Actions while the one-shot arm exists', {
  skip: !(process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_EVENT_NAME === 'pull_request' && existsSync(armPath))
}, async () => {
  const custody = await writeWindowLatchCustodyArtifact(artifactPath, process.env);
  assert.equal(custody.external_request_count, 1);
  assert.equal(custody.second_observation_performed, false);
  assert.equal(custody.historical_run_1932_status, 'UNRESOLVED_NOT_RECONSTRUCTED');
  assert.equal(custody.target.attempts, 1);
  assert.equal(custody.release_authority, false);
});
