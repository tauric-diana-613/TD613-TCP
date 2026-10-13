import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const workflow = readFileSync('.github/workflows/td613-ci.yml', 'utf8');
const job = workflow.split('\n  gemini_observation:\n')[1];
assert.ok(job);
assert.match(job, /if: github.event_name == 'workflow_dispatch' && inputs.mode == 'gemini-observation' && github.ref == 'refs\/heads\/main'/);
assert.match(job, /environment: gemini-observation/);
assert.match(job, /permissions:\n      contents: read/);
assert.match(job, /ref: \$\{\{ github.sha \}\}/);
assert.match(job, /persist-credentials: false/);
assert.match(job, /GEMINI_API_KEY: \$\{\{ secrets.GEMINI_API_KEY \}\}/);
assert.equal((job.match(/GEMINI_API_KEY/g) || []).length, 2);
assert.deepEqual([...job.matchAll(/^        run: (.*)$/gm)].map(m => m[1]),
  ['node scripts/observe-gemini-models.mjs > gemini-observation.json']);
assert.match(job, /path: gemini-observation.json\n/);
assert.match(job, /name: gemini-observation-\$\{\{ github.sha \}\}-\$\{\{ github.run_id \}\}-\$\{\{ github.run_attempt \}\}/);
assert.doesNotMatch(job, /write|generateContent|npm |vercel|deploy|pull_request/);
assert.match(workflow, /scope:\n    name: Classify exact-head browser witness scope\n    if: github.event_name != 'workflow_dispatch' \|\| inputs.mode != 'gemini-observation'/);
assert.match(workflow, /inputs.mode == 'gemini-observation' && github.run_id \|\| 'validation'/);

const baseEnv = {
  PATH: process.env.PATH, TD613_GEMINI_OBSERVATION_ACTIONS: 'true',
  GITHUB_EVENT_NAME: 'workflow_dispatch', GITHUB_REF: 'refs/heads/main',
  GITHUB_SHA: 'a'.repeat(40), GITHUB_RUN_ID: '1234', GITHUB_RUN_ATTEMPT: '2'
};
const execute = (env = {}, mode = 'valid') => {
  const preload = `globalThis.fetch = async (url, options) => {
    if (new URL(url).pathname !== '/v1beta/models' || options.method) throw Error('unexpected provider method');
    return {ok:true,status:200,json:async()=>({models:[{name:'models/'+${JSON.stringify(mode === 'echo' ? 'synthetic-private-key' : 'fixture-text')},supportedGenerationMethods:['generateContent']}]})};
  };`;
  return spawnSync(process.execPath, ['--import', `data:text/javascript,${encodeURIComponent(preload)}`,
    'scripts/observe-gemini-models.mjs'], { env: { ...baseEnv, ...env }, encoding: 'utf8' });
};
const valid = execute({ GEMINI_API_KEY: 'synthetic-private-key' });
assert.equal(valid.status, 0, valid.stderr);
const receipt = JSON.parse(valid.stdout);
assert.equal(receipt.complete, true);
assert.deepEqual(receipt.models, ['fixture-text']);
assert.deepEqual(receipt.custody, { sourceSha: 'a'.repeat(40), runId: '1234', runAttempt: '2',
  environment: 'gemini-observation', event: 'workflow_dispatch', ref: 'refs/heads/main' });
assert.ok(Number.isFinite(Date.parse(receipt.startedAt)));
assert.ok(Date.parse(receipt.completedAt) >= Date.parse(receipt.startedAt));
assert.equal(valid.stdout.includes('synthetic-private-key'), false);
assert.equal(valid.stderr, '');
const absent = execute();
assert.equal(absent.status, 1);
assert.equal(JSON.parse(absent.stdout).error, 'missing-gemini-api-key');
for (const env of [{GITHUB_EVENT_NAME:'pull_request'}, {GITHUB_REF:'refs/heads/other'},
  {GITHUB_SHA:'stale'}, {GITHUB_RUN_ID:'bad'}, {GITHUB_RUN_ATTEMPT:'0'}]) {
  const result = execute(env);
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stdout).error, 'invalid-actions-observation-context');
}
const echo = execute({GEMINI_API_KEY:'synthetic-private-key'}, 'echo');
assert.equal(echo.status, 1);
assert.equal(JSON.parse(echo.stdout).error, 'credential-echo-rejected');
assert.equal(echo.stdout.includes('synthetic-private-key'), false);
console.log('gemini-observation-dispatch.test.mjs passed');
