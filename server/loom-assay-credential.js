import { authorizeLoomAssayRequest, loadApprovedRunConfiguration } from './loom-assay.js';
import { requireThat, sha256 } from './loom-assay-contract.js';

const schema = 'td613.loom.assay-credential-observation/v1';
function send(res, status, body) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.statusCode = status;
  res.end(JSON.stringify({ schema, provider_requests: 0, ledger_operations: 0, ...body }));
}

// This operation observes the deployed key, never calls a provider or ledger,
// and never grants execution authority to a held assay run.
export function createLoomAssayCredentialHandler({ environment = process.env } = {}) {
  return (req, res) => {
    if (req.method !== 'GET') {
      res.setHeader('Allow', 'GET');
      return send(res, 405, { status: 'HELD', error: 'ASSAY_CREDENTIAL_GET_REQUIRED' });
    }
    try {
      const auth = authorizeLoomAssayRequest(req, environment);
      const source = environment.VERCEL_GIT_COMMIT_SHA;
      requireThat(typeof source === 'string' && /^[a-f0-9]{40}$/.test(source)
        && req.headers?.['x-td613-expected-source'] === source, 'ASSAY_DEPLOYED_SOURCE_MISMATCH');
      const key = environment.GEMINI_API_KEY;
      requireThat(typeof key === 'string' && key.length > 0, 'ASSAY_PROVIDER_UNCONFIGURED');
      const expected = req.headers?.['x-td613-expected-credential-sha256'];
      requireThat(expected === undefined || typeof expected === 'string' && /^[a-f0-9]{64}$/.test(expected),
        'ASSAY_CREDENTIAL_EXPECTATION_MALFORMED');
      const fingerprint = sha256(key);
      const matches = expected === undefined ? null : fingerprint === expected;
      const body = {
        status: matches === false ? 'HELD' : 'OBSERVED',
        ...(matches === false ? { error: 'ASSAY_CREDENTIAL_FINGERPRINT_MISMATCH' } : {}),
        observed_at: new Date().toISOString(),
        source_commit: source,
        vercel_environment: ['production', 'preview', 'development'].includes(environment.VERCEL_ENV)
          ? environment.VERCEL_ENV : null,
        provider: 'GEMINI_GENERATE_CONTENT',
        provider_origin: 'https://generativelanguage.googleapis.com',
        credential_env: 'GEMINI_API_KEY',
        credential_sha256: fingerprint,
        expected_credential_matches: matches,
        google_project_id: null,
        billing_tier: 'UNVERIFIED',
        receipt_authority: 'Server-observed credential fingerprint and declared deployment source; no project, billing, quota, custody admission or assay execution authority'
      };
      const serialized = JSON.stringify(body);
      requireThat(![key, auth.token, environment.VERCEL_OIDC_TOKEN].filter(Boolean)
        .some(secret => serialized.includes(secret)), 'ASSAY_PROTECTED_CREDENTIAL_ECHO');
      return send(res, matches === false ? 409 : 200, body);
    } catch (error) {
      const code = /^ASSAY_[A-Z_]+$/.test(error.message) ? error.message : 'ASSAY_CREDENTIAL_OBSERVATION_HELD';
      return send(res, code === 'ASSAY_UNAUTHORIZED' ? 401 : code === 'ASSAY_DISABLED' ? 503 : 409,
        { status: 'HELD', error: code });
    }
  };
}

export default function handler(req, res) {
  try {
    const configuration = loadApprovedRunConfiguration();
    requireThat(!process.env.TD613_LOOM_ASSAY_ACCESS_SHA256
      || process.env.TD613_LOOM_ASSAY_ACCESS_SHA256 === configuration.access_sha256, 'ASSAY_CONFIGURATION_CONFLICT');
    return createLoomAssayCredentialHandler({ environment: {
      ...process.env, TD613_LOOM_ASSAY_ACCESS_SHA256: configuration.access_sha256
    } })(req, res);
  } catch {
    return send(res, 503, { status: 'HELD', error: 'ASSAY_CONFIGURATION_UNAVAILABLE' });
  }
}
