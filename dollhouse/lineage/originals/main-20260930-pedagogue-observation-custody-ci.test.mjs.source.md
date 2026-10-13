import test from 'node:test';
import assert from 'node:assert/strict';
import { buildSameRunCiObservation } from '../scripts/pedagogue-observation-custody-ci.mjs';
import { independentlyReplayObservation } from '../scripts/pedagogue-observation-custody-independent-replay.mjs';

const exactHead = 'b'.repeat(40);
const env = {
  TD613_SCIENCE_HEAD: exactHead,
  TD613_WORKFLOW_RUN_ID: '32560000000',
  TD613_WORKFLOW_RUN_ATTEMPT: '1',
  TD613_WORKFLOW_RUN_NUMBER: '1940',
  TD613_WORKFLOW_NAME: 'TD613 Consolidated Validation',
  TD613_WORKFLOW_JOB: 'contracts'
};

test('O1 CI writer seals exact head, run id, run number, and attempt before persistence', () => {
  const observation = buildSameRunCiObservation(env);
  assert.equal(observation.science_head, exactHead);
  assert.equal(observation.execution.workflow_run_id, '32560000000');
  assert.equal(observation.execution.workflow_run_number, '1940');
  assert.equal(observation.execution.workflow_run_attempt, '1');
  assert.equal(observation.external_request_count, 0);
  assert.equal(observation.second_observation_performed, false);
});

test('independent verifier recomputes custody and classification without serializer replay', () => {
  const observation = buildSameRunCiObservation(env);
  const report = independentlyReplayObservation(observation, {
    scienceHead: exactHead,
    workflowRunId: '32560000000',
    workflowRunNumber: '1940',
    workflowRunAttempt: '1'
  });
  assert.equal(report.ok, true);
  assert.equal(report.disposition, 'INDEPENDENT_EXACT_RUN_REPLAY_SURVIVES');
  assert.equal(report.semantic_result_invariant, true);
  assert.equal(report.duplicate_copy_unique_observation_count, 1);
  assert.equal(report.duplicate_copy_adds_authority, false);
});

test('independent verifier rejects a detached run number even when the payload is otherwise valid', () => {
  const observation = buildSameRunCiObservation(env);
  const report = independentlyReplayObservation(observation, {
    scienceHead: exactHead,
    workflowRunId: '32560000000',
    workflowRunNumber: '1941',
    workflowRunAttempt: '1'
  });
  assert.equal(report.ok, false);
  assert.ok(report.failures.includes('workflow_run_number_MISMATCH'));
});
