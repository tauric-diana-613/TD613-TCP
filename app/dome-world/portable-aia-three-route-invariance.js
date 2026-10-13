import {
  HOLONOMY_LOOM_ADVISORY_ROUTE_MODES,
  canonicalLoomAdvisoryFinding
} from './holonomy-loom-advisory-policy.js';

export const PORTABLE_AIA_SCHEMA = 'td613.portable-aia/v0.1';
export const PORTABLE_AIA_RETURN_SCHEMA = 'td613.portable-aia.return-candidate/v0.1';

const ALLOWED_INPUT_KEYS = Object.freeze([
  'ruleId',
  'routeMode',
  'policyDigest',
  'sourceStateDigest',
  'receiptId'
]);

const FORBIDDEN_CARRIER_KEYS = Object.freeze([
  'rawSource',
  'raw_source',
  'rawDraft',
  'raw_draft',
  'rawMessage',
  'raw_message',
  'priorThread',
  'prior_thread',
  'conversationHistory',
  'conversation_history',
  'selectedText',
  'selected_text',
  'matchedValue',
  'matched_value',
  'promptTranscript',
  'prompt_transcript'
]);

function safe(value = '') {
  return String(value ?? '').trim();
}

function requireDigest(value, label) {
  const text = safe(value);
  if (!/^sha256:[a-f0-9]{64}$/i.test(text)) throw new TypeError(`${label} must be sha256:<64 hex>`);
  return text.toLowerCase();
}

function rejectUnknownInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('portable AIA input must be an object');
  for (const key of Object.keys(input)) {
    if (FORBIDDEN_CARRIER_KEYS.includes(key)) throw new TypeError(`${key} is forbidden on the portable AIA projection route`);
    if (!ALLOWED_INPUT_KEYS.includes(key)) throw new TypeError(`unsupported portable AIA field: ${key}`);
  }
}

function presentationFor(routeMode) {
  if (routeMode === 'TD613_HOSTED') {
    return Object.freeze({ host: 'TD613.com hosted', posture: 'reference-realization', explanationDoor: 'Kʰonapolit optional WHY' });
  }
  if (routeMode === 'LOCAL_POCKET') {
    return Object.freeze({ host: 'local pocket', posture: 'preflight-local', explanationDoor: 'local explanation optional' });
  }
  return Object.freeze({ host: 'private ChatGPT thread companion', posture: 'post-ingress-onward-companion', explanationDoor: 'host explanation optional' });
}

export function compilePortableAiaProjection(input = {}) {
  rejectUnknownInput(input);
  const routeMode = safe(input.routeMode).toUpperCase();
  if (!HOLONOMY_LOOM_ADVISORY_ROUTE_MODES.includes(routeMode)) throw new TypeError('unsupported routeMode');

  const finding = canonicalLoomAdvisoryFinding(input.ruleId, routeMode);
  const invariant = Object.freeze({
    policy_digest: requireDigest(input.policyDigest, 'policyDigest'),
    rule_id: finding.rule_id,
    evidence_class: finding.evidence_class,
    action_class: finding.action_class,
    source_state_digest: requireDigest(input.sourceStateDigest, 'sourceStateDigest'),
    release_authority: false,
    human_closure_required: true,
    receipt_semantics: 'route-bound'
  });

  return Object.freeze({
    schema: PORTABLE_AIA_SCHEMA,
    route_mode: routeMode,
    receipt_id: safe(input.receiptId) || null,
    invariant,
    presentation: presentationFor(routeMode),
    authority: Object.freeze({
      loom_release: false,
      host_release: false,
      provider_release: false,
      source_mutation: false,
      deployment: false
    }),
    claim_ceiling: routeMode === 'CHATGPT_THREAD_COMPANION'
      ? 'post-ingress-onward-governance-only-no-pre-ingress-secrecy-claim'
      : 'bounded-portable-aia-projection-only'
  });
}

export function governanceInvariant(projection = {}) {
  if (projection?.schema !== PORTABLE_AIA_SCHEMA || !projection.invariant) throw new TypeError('portable AIA projection required');
  return projection.invariant;
}

export function buildPortableReturnCandidate(projection = {}, candidate = {}) {
  if (projection?.schema !== PORTABLE_AIA_SCHEMA) throw new TypeError('portable AIA projection required');
  const allowed = ['claimedActionClass', 'sourceHost'];
  for (const key of Object.keys(candidate || {})) {
    if (!allowed.includes(key)) throw new TypeError(`unsupported return-candidate field: ${key}`);
  }
  return Object.freeze({
    schema: PORTABLE_AIA_RETURN_SCHEMA,
    source_route_mode: projection.route_mode,
    source_host: safe(candidate.sourceHost) || projection.presentation.host,
    claimed_action_class: safe(candidate.claimedActionClass).toUpperCase(),
    trusted: false,
    release_authority: false,
    must_revalidate: true
  });
}

export function revalidatePortableReturn(projection = {}, candidate = {}) {
  if (projection?.schema !== PORTABLE_AIA_SCHEMA) throw new TypeError('portable AIA projection required');
  if (candidate?.schema !== PORTABLE_AIA_RETURN_SCHEMA) throw new TypeError('portable AIA return candidate required');
  const matches = candidate.claimed_action_class === projection.invariant.action_class;
  return Object.freeze({
    status: matches ? 'PRESENT_TO_HUMAN' : 'HOLD',
    canonical_action_class: projection.invariant.action_class,
    candidate_action_class: candidate.claimed_action_class,
    candidate_trusted: false,
    release_authority: false,
    human_closure_required: true,
    reason: matches ? 'candidate_matches_canonical_action_but_remains_advisory' : 'candidate_action_differs_from_canonical_loom_policy'
  });
}
