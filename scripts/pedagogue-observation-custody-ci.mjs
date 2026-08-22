import { buildObservation, sealObservationPayload, writeObservationFile } from './pedagogue-observation-custody.mjs';

function requireValue(value, name) {
  const text = String(value ?? '').trim();
  if (!text) throw new TypeError(`${name} is required for same-run custody binding`);
  return text;
}

export function buildSameRunCiObservation(env = process.env) {
  const scienceHead = requireValue(
    env.TD613_SCIENCE_HEAD || env.GITHUB_HEAD_SHA || env.GITHUB_SHA,
    'science_head'
  );
  const workflowRunId = requireValue(
    env.TD613_WORKFLOW_RUN_ID || env.GITHUB_RUN_ID,
    'workflow_run_id'
  );
  const workflowRunAttempt = requireValue(
    env.TD613_WORKFLOW_RUN_ATTEMPT || env.GITHUB_RUN_ATTEMPT,
    'workflow_run_attempt'
  );
  const workflowRunNumber = requireValue(
    env.TD613_WORKFLOW_RUN_NUMBER || env.GITHUB_RUN_NUMBER,
    'workflow_run_number'
  );
  const workflowName = requireValue(
    env.TD613_WORKFLOW_NAME || env.GITHUB_WORKFLOW,
    'workflow_name'
  );
  const jobName = requireValue(
    env.TD613_WORKFLOW_JOB || env.GITHUB_JOB,
    'job_name'
  );

  const base = buildObservation({
    scienceHead,
    workflowRunId,
    workflowRunAttempt,
    workflowName,
    jobName
  });
  const payload = structuredClone(base);
  delete payload.custody;
  payload.execution.workflow_run_number = workflowRunNumber;
  return sealObservationPayload(payload);
}

export async function writeSameRunCiObservation(filePath, env = process.env) {
  const observation = buildSameRunCiObservation(env);
  await writeObservationFile(filePath, observation);
  return observation;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('usage: pedagogue-observation-custody-ci.mjs <artifact-json-path>');
    process.exitCode = 64;
  } else {
    writeSameRunCiObservation(filePath)
      .then((observation) => {
        process.stdout.write(`${JSON.stringify({
          written: filePath,
          science_head: observation.science_head,
          workflow_run_id: observation.execution.workflow_run_id,
          workflow_run_number: observation.execution.workflow_run_number,
          payload_sha256: observation.custody.payload_sha256
        })}\n`);
      })
      .catch((error) => {
        console.error(error?.stack || error);
        process.exitCode = 1;
      });
  }
}
