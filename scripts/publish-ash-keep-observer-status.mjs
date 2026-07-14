const ALLOWED_STATES = new Set(['pending', 'success', 'failure', 'error']);
const CONTEXT = 'Ash Keep Deployed Observation';
const API_VERSION = '2022-11-28';

function required(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

const token = required('GITHUB_TOKEN');
const repository = required('GITHUB_REPOSITORY');
const sha = required('TD613_OBSERVED_COMMIT');
const state = required('TD613_OBSERVER_STATUS_STATE').toLowerCase();
const targetUrl = required('TD613_OBSERVER_RUN_URL');
const description = required('TD613_OBSERVER_STATUS_DESCRIPTION');

if (!/^[0-9a-f]{40}$/i.test(sha)) throw new Error('TD613_OBSERVED_COMMIT must be a full commit SHA.');
if (!ALLOWED_STATES.has(state)) throw new Error(`Unsupported observer status state: ${state}`);
if (!/^https:\/\/github\.com\//.test(targetUrl)) throw new Error('TD613_OBSERVER_RUN_URL must be a GitHub HTTPS URL.');
if (description.length > 140) throw new Error('Observer status description exceeds GitHub’s 140-character limit.');

const endpoint = `https://api.github.com/repos/${repository}/statuses/${sha}`;
const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    accept: 'application/vnd.github+json',
    authorization: `Bearer ${token}`,
    'x-github-api-version': API_VERSION,
    'user-agent': 'td613-ash-keep-observer'
  },
  body: JSON.stringify({
    state,
    target_url: targetUrl,
    description,
    context: CONTEXT
  })
});

if (!response.ok) {
  const body = await response.text();
  throw new Error(`Observer status publication failed (${response.status}): ${body.slice(0, 1000)}`);
}

const result = await response.json();
process.stdout.write(`${JSON.stringify({
  schema: 'td613.ash-keep.observer-status-publication/v0.1',
  context: CONTEXT,
  state: result.state,
  target_url: result.target_url,
  observed_commit: sha,
  status_id: result.id,
  promotion_authorized: false
}, null, 2)}\n`);
