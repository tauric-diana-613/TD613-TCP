import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';

const ALLOWED_STATES = new Set(['pending', 'success', 'failure', 'error']);
const ALLOWED_CONTEXTS = new Set([
  'Ash Keep Deployed Observation',
  'Ash Lifecycle Deployed Observation',
  'Ash Custodian Return Local Observation',
  'Ash Custodian Return Deployed Observation',
  'Ash Choir Calibration Validation',
  'Ash Hush Intervention Validation',
  'Aperture Composition Validation',
  'Aperture Composition Constitution Validation'
]);
const DEFAULT_CONTEXT = 'Ash Keep Deployed Observation';
const API_VERSION = '2022-11-28';
const ARTIFACT_ROOT = path.resolve('artifacts');

function required(name) {
  const value = String(process.env[name] || '').trim();
  if (!value) throw new Error(`${name} is required.`);
  return value;
}
function sha256(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`;
}

const token = required('GITHUB_TOKEN');
const repository = required('GITHUB_REPOSITORY');
const sha = required('TD613_OBSERVED_COMMIT');
const state = required('TD613_OBSERVER_STATUS_STATE').toLowerCase();
const targetUrl = required('TD613_OBSERVER_RUN_URL');
const description = required('TD613_OBSERVER_STATUS_DESCRIPTION');
const context = String(process.env.TD613_OBSERVER_STATUS_CONTEXT || DEFAULT_CONTEXT).trim();
const receiptPath = String(process.env.TD613_OBSERVER_STATUS_RECEIPT_PATH || '').trim();

if (!/^[0-9a-f]{40}$/i.test(sha)) throw new Error('TD613_OBSERVED_COMMIT must be a full commit SHA.');
if (!ALLOWED_STATES.has(state)) throw new Error(`Unsupported observer status state: ${state}`);
if (!ALLOWED_CONTEXTS.has(context)) throw new Error(`Unsupported observer status context: ${context}`);
if (!/^https:\/\/github\.com\//.test(targetUrl)) throw new Error('TD613_OBSERVER_RUN_URL must be a GitHub HTTPS URL.');
if (description.length > 140) throw new Error('Observer status description exceeds GitHub’s 140-character limit.');

const endpoint = `https://api.github.com/repos/${repository}/statuses/${sha}`;
const response = await fetch(endpoint, {
  method: 'POST',
  headers: {
    accept: 'application/vnd.github+json',
    authorization: `Bearer ${token}`,
    'x-github-api-version': API_VERSION,
    'user-agent': 'td613-ash-observer'
  },
  body: JSON.stringify({ state, target_url: targetUrl, description, context })
});
if (!response.ok) {
  const body = await response.text();
  throw new Error(`Observer status publication failed (${response.status}): ${body.slice(0, 1000)}`);
}

const result = await response.json();
const receiptBody = {
  schema: 'td613.ash.observer-status-publication/v0.3',
  context,
  state: result.state,
  description: result.description,
  target_url: result.target_url,
  observed_commit: sha,
  status_id: result.id,
  created_at: result.created_at || null,
  updated_at: result.updated_at || null,
  source_status: 'OBSERVED_GITHUB_COMMIT_STATUS',
  promotion_authorized: false
};
const serializedBody = `${JSON.stringify(receiptBody, null, 2)}\n`;
const receipt = { ...receiptBody, receipt_sha256: sha256(serializedBody) };
const serializedReceipt = `${JSON.stringify(receipt, null, 2)}\n`;

if (receiptPath) {
  const resolvedReceiptPath = path.resolve(receiptPath);
  if (!resolvedReceiptPath.startsWith(`${ARTIFACT_ROOT}${path.sep}`)) throw new Error('Observer status receipt path must remain inside artifacts/.');
  await fs.mkdir(path.dirname(resolvedReceiptPath), { recursive: true });
  await fs.writeFile(resolvedReceiptPath, serializedReceipt, 'utf8');
}
process.stdout.write(serializedReceipt);
