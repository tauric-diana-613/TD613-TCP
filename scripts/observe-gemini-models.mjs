import { listGeminiGenerateContentModels } from '../server/gemini-model-policy.js';

// Read-only provider metadata, never generateContent or a production deployment.
const actions = process.env.TD613_GEMINI_OBSERVATION_ACTIONS === 'true';
const sourceSha = process.env.GITHUB_SHA || null;
const runId = process.env.GITHUB_RUN_ID || null;
const runAttempt = process.env.GITHUB_RUN_ATTEMPT || null;
if (actions && (process.env.GITHUB_EVENT_NAME !== 'workflow_dispatch'
  || process.env.GITHUB_REF !== 'refs/heads/main'
  || !/^[a-f0-9]{40}$/.test(sourceSha || '')
  || !/^[1-9][0-9]*$/.test(runId || '')
  || !/^[1-9][0-9]*$/.test(runAttempt || ''))) {
  console.log(JSON.stringify({ schema: 'td613.gemini-model-list-observation/v0.1',
    ok: false, complete: false, models: [], error: 'invalid-actions-observation-context' }));
  process.exit(1);
}
const startedAt = new Date().toISOString();
const listing = await listGeminiGenerateContentModels(process.env.GEMINI_API_KEY, { force: true });
const receipt = {
  schema: 'td613.gemini-model-list-observation/v0.1',
  source: 'https://generativelanguage.googleapis.com/v1beta/models',
  custody: actions ? {
    sourceSha, runId, runAttempt, environment: 'gemini-observation',
    event: 'workflow_dispatch', ref: 'refs/heads/main'
  } : null,
  startedAt,
  completedAt: new Date().toISOString(),
  ...listing,
  claimCeiling: 'credential-scoped-model-listing-not-quota-quality-routing-or-release-authority',
  exclusions: ['quota', 'quality', 'routing-superiority', 'future-availability',
    'provider-release', 'production-readiness', 'empirical-exteriority', 'golden-egg-completion']
};
const serialized = JSON.stringify(receipt, null, 2);
const key = process.env.GEMINI_API_KEY?.trim();
if (key && serialized.includes(key)) {
  console.log(JSON.stringify({ schema: receipt.schema, ok: false, complete: false,
    models: [], error: 'credential-echo-rejected' }));
  process.exitCode = 1;
} else {
  console.log(serialized);
  if (!listing.ok) process.exitCode = 1;
}
