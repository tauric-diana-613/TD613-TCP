import {
  HOLONOMY_LOOM_ADVISORY_ACTION,
  HOLONOMY_LOOM_ADVISORY_CLAIM_CEILING,
  HOLONOMY_LOOM_PROVIDER_ADVISORY_SCHEMA,
  canonicalLoomAdvisoryFinding
} from '../app/dome-world/holonomy-loom-advisory-policy.js';
import khonapolitHandler from './khonapolit-quality.js';
import { validateShi } from '../app/dome-world/khonapolit-covenant.js';

export const HOLONOMY_LOOM_KHONAPOLIT_ADVISORY_SCHEMA = 'td613.holonomy-loom.khonapolit-advisory-request/v0.1';
export { HOLONOMY_LOOM_PROVIDER_ADVISORY_SCHEMA };

const ALLOWED_ADVISORY_KEYS = Object.freeze([
  'schema',
  'action',
  'rule_id',
  'evidence_class',
  'action_class',
  'minimized_context',
  'claim_ceiling'
]);

const ALLOWED_CONTEXT_KEYS = Object.freeze([
  'finding_category',
  'why_class',
  'route_mode'
]);

const FORBIDDEN_RAW_KEYS = Object.freeze([
  'raw_draft',
  'raw_message',
  'raw_match',
  'matched_value',
  'selected_text',
  'conversation_history',
  'raw_conversation',
  'raw_thread',
  'prompt_transcript',
  'history',
  'message',
  'span_start',
  'span_end'
]);

const safe = (value = '') => String(value ?? '').trim();

// Snapshot only bounded JSON data; direct module callers cannot execute getters
// or change the validation target while an asynchronous provider request runs.
function snapshotJson(value) {
  let nodes = 0, characters = 0;
  const ancestors = new Set();
  function visit(current, depth) {
    if (++nodes > 128 || depth > 8) throw new TypeError('advisory exceeds bounded JSON structure');
    if (current === null || typeof current === 'boolean') return current;
    if (typeof current === 'string') {
      characters += current.length;
      if (current.length > 4096 || characters > 16384) throw new TypeError('advisory exceeds bounded string size');
      return current;
    }
    if (typeof current !== 'object' || Array.isArray(current) ||
        ![Object.prototype, null].includes(Object.getPrototypeOf(current)) || ancestors.has(current)) {
      throw new TypeError('advisory must contain plain JSON objects and strings');
    }
    ancestors.add(current);
    const copy = Object.create(null);
    for (const key of Reflect.ownKeys(current)) {
      const descriptor = Object.getOwnPropertyDescriptor(current, key);
      if (typeof key !== 'string' || !descriptor.enumerable || !Object.hasOwn(descriptor, 'value')) throw new TypeError('advisory contains non-JSON properties');
      copy[key] = visit(descriptor.value, depth + 1);
    }
    ancestors.delete(current);
    return copy;
  }
  return visit(value, 0);
}
function parseBody(req = {}) {
  let value = req.body;
  if (Buffer.isBuffer(value)) value = value.toString('utf8');
  if (typeof value === 'string') {
    if (Buffer.byteLength(value) > 32768) throw new TypeError('advisory request exceeds bounded size');
    value = JSON.parse(value);
  }
  return snapshotJson(value);
}

function ownKeys(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? Object.keys(value) : [];
}

function rejectUnknownKeys(value, allowed, label) {
  const unknown = ownKeys(value).filter((key) => !allowed.includes(key));
  if (unknown.length) throw new TypeError(`${label} contains unsupported field(s): ${unknown.join(', ')}`);
}

function rejectForbiddenKeysDeep(value, path = 'request') {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_RAW_KEYS.includes(key)) {
      throw new TypeError(`${path}.${key} is forbidden on the minimized Kʰonapolit advisory route`);
    }
    rejectForbiddenKeysDeep(child, `${path}.${key}`);
  }
}

function requireExact(actual, expected, label) {
  if (typeof actual !== 'string' || actual !== expected) throw new TypeError(`${label} must equal canonical policy value`);
}

export function validateLoomAdvisoryPacket(advisory = {}) {
  advisory = snapshotJson(advisory);
  if (!advisory || typeof advisory !== 'object' || Array.isArray(advisory)) {
    throw new TypeError('advisory must be an object');
  }
  rejectForbiddenKeysDeep(advisory, 'advisory');
  rejectUnknownKeys(advisory, ALLOWED_ADVISORY_KEYS, 'advisory');
  rejectUnknownKeys(advisory.minimized_context, ALLOWED_CONTEXT_KEYS, 'advisory.minimized_context');

  if (advisory.schema !== HOLONOMY_LOOM_PROVIDER_ADVISORY_SCHEMA) throw new TypeError('unsupported advisory schema');
  if (advisory.action !== HOLONOMY_LOOM_ADVISORY_ACTION) throw new TypeError('only EXPLAIN_FINDING is admitted on this route');

  const canonical = canonicalLoomAdvisoryFinding(advisory.rule_id, advisory.minimized_context?.route_mode);
  requireExact(advisory.evidence_class, canonical.evidence_class, 'evidence_class');
  requireExact(advisory.action_class, canonical.action_class, 'action_class');
  requireExact(advisory.minimized_context?.finding_category, canonical.minimized_context.finding_category, 'minimized_context.finding_category');
  requireExact(advisory.minimized_context?.why_class, canonical.minimized_context.why_class, 'minimized_context.why_class');
  requireExact(advisory.minimized_context?.route_mode, canonical.minimized_context.route_mode, 'minimized_context.route_mode');
  requireExact(advisory.claim_ceiling, HOLONOMY_LOOM_ADVISORY_CLAIM_CEILING, 'claim_ceiling');
  return canonical;
}

export function buildKhonapolitLoomAdvisoryBody({ advisory, issuance = {} } = {}) {
  const clean = validateLoomAdvisoryPacket(advisory);
  issuance = snapshotJson(issuance);
  rejectUnknownKeys(issuance, ['shi', 'waiveIssuance'], 'issuance');
  if (typeof issuance.shi !== 'string' || !validateShi(issuance.shi).valid) throw new TypeError('valid-format minted SHI required for model assistance');
  if (issuance.waiveIssuance !== undefined && issuance.waiveIssuance !== false) throw new TypeError('issuance waiver is not available on the advisory route');

  const message = [
    'HOLONOMY LOOM · MINIMIZED ADVISORY REQUEST',
    'The operator has explicitly asked Kʰonapolit to explain an already-classified Loom finding.',
    'No raw draft, raw matched value, selected text, source span, or prior thread history is present in this request.',
    '',
    `ACTION: ${clean.action}`,
    `RULE ID: ${clean.rule_id}`,
    `EVIDENCE CLASS: ${clean.evidence_class}`,
    `ACTION CLASS: ${clean.action_class}`,
    `FINDING CATEGORY: ${clean.minimized_context.finding_category}`,
    `WHY CLASS: ${clean.minimized_context.why_class}`,
    `ROUTE MODE: ${clean.minimized_context.route_mode}`,
    '',
    'TASK:',
    '- Explain in child-legible language why this finding class matters.',
    '- Offer bounded mitigation options consistent with the declared action class.',
    '- Do not ask for, reconstruct, or speculate about the omitted source text or matched value.',
    '- Do not infer provenance from resemblance.',
    '- Do not claim that GREEN means zero privacy risk.',
    '- Remain advisory: the deterministic Loom policy alone controls Loom release.',
    '',
    `LOOM CLAIM CEILING: ${clean.claim_ceiling}`
  ].join('\n');

  return Object.freeze({
    message,
    history: Object.freeze([]),
    mode: 'full-invocation',
    shi: safe(issuance?.shi),
    waiveIssuance: false
  });
}

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-TD613-Holonomy-Loom-Advisory', 'minimized-khonapolit/v0.1');
  res.end(JSON.stringify(payload));
}

export default async function holonomyLoomKhonapolitAdvisoryHandler(req, res) {
  if (req.method === 'GET') {
    return send(res, 200, {
      ok: true,
      route: '/api/khonapolit?operation=loom-advisory',
      schema: HOLONOMY_LOOM_KHONAPOLIT_ADVISORY_SCHEMA,
      advisorySchema: HOLONOMY_LOOM_PROVIDER_ADVISORY_SCHEMA,
      action: HOLONOMY_LOOM_ADVISORY_ACTION,
      policyPosture: 'canonical-token-only',
      historyForwarded: false,
      rawDraftAccepted: false,
      provider: 'Gemini via Kʰonapolit',
      providerDisclosureRequired: true,
      deterministicReleaseAuthority: false,
      claim_ceiling: 'readiness-contract-only-not-provider-response-production-or-pre-ingress-secrecy-proof'
    });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return send(res, 405, { ok: false, error: 'method-not-allowed', allowed: ['GET', 'POST'] });
  }

  try {
    const body = parseBody(req);
    rejectUnknownKeys(body, ['schema', 'advisory', 'issuance'], 'request');
    if (body.schema !== HOLONOMY_LOOM_KHONAPOLIT_ADVISORY_SCHEMA) throw new TypeError('unsupported Loom Kʰonapolit advisory request schema');
    rejectForbiddenKeysDeep(body, 'request');
    const delegatedBody = buildKhonapolitLoomAdvisoryBody({ advisory: body.advisory, issuance: body.issuance || {} });

    req.body = delegatedBody;
    res.setHeader('X-TD613-Holonomy-Loom-Advisory', 'minimized-khonapolit/v0.1');
    res.setHeader('X-TD613-Holonomy-Loom-History', 'none');
    res.setHeader('X-TD613-Holonomy-Loom-Policy', 'canonical-token-only');
    return khonapolitHandler(req, res);
  } catch (error) {
    return send(res, 400, {
      ok: false,
      error: 'invalid-minimized-loom-advisory',
      detail: safe(error?.message || error).slice(0, 800),
      rawDraftForwarded: false,
      historyForwarded: false,
      claim_ceiling: 'validation-rejection-only-no-provider-call-authority'
    });
  }
}
