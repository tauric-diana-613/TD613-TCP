import {
  HOLONOMY_LOOM_PROVIDER_ADVISORY_SCHEMA,
  HOLONOMY_LOOM_ADVISORY_ROUTE_MODES,
  HOLONOMY_LOOM_ADVISORY_RULES,
  canonicalLoomAdvisoryFinding
} from './holonomy-loom-advisory-policy.js';

export const PORTABLE_AIA_SCHEMA = 'td613.portable-aia/v0.2-born-minimized';
export const PORTABLE_AIA_PAYLOAD_SCHEMA = 'td613.portable-aia.payload/v0.2-finite-canonical-tokens';
export const PORTABLE_AIA_LOCAL_BINDING_SCHEMA = 'td613.portable-aia.local-binding/v0.1-local-only';
export const PORTABLE_AIA_RETURN_SCHEMA = 'td613.portable-aia.return-candidate/v0.2-canonical-action-only';
export const PORTABLE_AIA_ATLAS_QUOTIENT_SCHEMA = 'td613.portable-aia.atlas-route-quotient/v0.1';

export const PORTABLE_AIA_ATLAS_RECEIVERS = Object.freeze([
  'POLICY_ONLY',
  'BOUNDARY_AWARE'
]);

const ALLOWED_PROJECTION_INPUT_KEYS = Object.freeze([
  'ruleId',
  'routeMode'
]);

const LOCAL_BINDING_ONLY_KEYS = Object.freeze([
  'policyDigest',
  'sourceStateDigest'
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
  'prompt_transcript',
  'receiptId',
  'receipt_id'
]);

const ROUTE_BOUNDARY_TOKENS = Object.freeze({
  TD613_HOSTED: Object.freeze({
    execution_posture: 'HOSTED_LOCAL_FIRST',
    source_ingress_position: 'TD613_HOST_CONTEXT',
    advisory_transition: 'EXPLICIT_DISCLOSED_PROVIDER_OPTION'
  }),
  LOCAL_POCKET: Object.freeze({
    execution_posture: 'LOCAL_PREFLIGHT',
    source_ingress_position: 'BEFORE_OPTIONAL_REMOTE_INGRESS',
    advisory_transition: 'EXPLICIT_REMOTE_TRANSITION_REQUIRED'
  }),
  CHATGPT_THREAD_COMPANION: Object.freeze({
    execution_posture: 'POST_INGRESS_COMPANION',
    source_ingress_position: 'AFTER_UPSTREAM_THREAD_INGRESS',
    advisory_transition: 'ONWARD_HOST_CONTEXT_ONLY'
  })
});

const CANONICAL_ACTION_CLASSES = Object.freeze([
  ...new Set(Object.values(HOLONOMY_LOOM_ADVISORY_RULES).map((rule) => rule.action_class))
]);

function safe(value = '') {
  return String(value ?? '').trim();
}

function requireDigest(value, label) {
  const text = safe(value);
  if (!/^sha256:[a-f0-9]{64}$/i.test(text)) throw new TypeError(`${label} must be sha256:<64 hex>`);
  return text.toLowerCase();
}

function assertProjection(projection = {}) {
  if (projection?.schema !== PORTABLE_AIA_SCHEMA || projection?.portable_payload?.schema !== PORTABLE_AIA_PAYLOAD_SCHEMA) {
    throw new TypeError('portable AIA v0.2 projection required');
  }
}

function rejectUnknownProjectionInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('portable AIA input must be an object');
  for (const key of Object.keys(input)) {
    if (FORBIDDEN_CARRIER_KEYS.includes(key)) throw new TypeError(`${key} is forbidden on the portable AIA projection route`);
    if (LOCAL_BINDING_ONLY_KEYS.includes(key)) throw new TypeError(`${key} is local-binding-only and cannot enter the portable payload compiler`);
    if (!ALLOWED_PROJECTION_INPUT_KEYS.includes(key)) throw new TypeError(`unsupported portable AIA field: ${key}`);
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

function routeBoundaryFor(routeMode) {
  const tokens = ROUTE_BOUNDARY_TOKENS[routeMode];
  if (!tokens) throw new TypeError('unsupported routeMode');
  return tokens;
}

function canonicalActionClass(value) {
  const token = safe(value).toUpperCase();
  if (!CANONICAL_ACTION_CLASSES.includes(token)) throw new TypeError('unsupported claimedActionClass');
  return token;
}

function collectStrings(value, into = []) {
  if (typeof value === 'string') into.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, into));
  else if (value && typeof value === 'object') Object.values(value).forEach((item) => collectStrings(item, into));
  return into;
}

function canonicalPortableVocabulary() {
  const vocabulary = new Set([
    PORTABLE_AIA_PAYLOAD_SCHEMA,
    HOLONOMY_LOOM_PROVIDER_ADVISORY_SCHEMA
  ]);
  for (const rule of Object.values(HOLONOMY_LOOM_ADVISORY_RULES)) {
    vocabulary.add(rule.rule_id);
    vocabulary.add(rule.evidence_class);
    vocabulary.add(rule.action_class);
  }
  for (const routeTokens of Object.values(ROUTE_BOUNDARY_TOKENS)) {
    for (const token of Object.values(routeTokens)) vocabulary.add(token);
  }
  return vocabulary;
}

export function compilePortableAiaProjection(input = {}) {
  rejectUnknownProjectionInput(input);
  const routeMode = safe(input.routeMode).toUpperCase();
  if (!HOLONOMY_LOOM_ADVISORY_ROUTE_MODES.includes(routeMode)) throw new TypeError('unsupported routeMode');

  const finding = canonicalLoomAdvisoryFinding(input.ruleId, routeMode);
  const invariant = Object.freeze({
    policy_schema_token: finding.schema,
    rule_id: finding.rule_id,
    evidence_class: finding.evidence_class,
    action_class: finding.action_class,
    release_authority: false,
    human_closure_required: true,
    receipt_semantics: 'route-bound'
  });

  const portablePayload = Object.freeze({
    schema: PORTABLE_AIA_PAYLOAD_SCHEMA,
    policy_schema_token: finding.schema,
    rule_id: finding.rule_id,
    evidence_class: finding.evidence_class,
    action_class: finding.action_class,
    route_boundary: routeBoundaryFor(routeMode),
    release_authority: false,
    human_closure_required: true
  });

  return Object.freeze({
    schema: PORTABLE_AIA_SCHEMA,
    route_mode: routeMode,
    invariant,
    portable_payload: portablePayload,
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

export function compilePortableAiaLocalBinding(projection = {}, input = {}) {
  assertProjection(projection);
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new TypeError('local binding input must be an object');
  for (const key of Object.keys(input)) {
    if (!LOCAL_BINDING_ONLY_KEYS.includes(key)) throw new TypeError(`unsupported local-binding field: ${key}`);
  }
  return Object.freeze({
    schema: PORTABLE_AIA_LOCAL_BINDING_SCHEMA,
    route_mode: projection.route_mode,
    rule_id: projection.invariant.rule_id,
    policy_digest: requireDigest(input.policyDigest, 'policyDigest'),
    source_state_digest: requireDigest(input.sourceStateDigest, 'sourceStateDigest'),
    portable: false,
    provider_context: false,
    must_remain_local: true
  });
}

export function governanceInvariant(projection = {}) {
  assertProjection(projection);
  return projection.invariant;
}

export function auditPortablePayloadVocabulary(projection = {}) {
  assertProjection(projection);
  const strings = collectStrings(projection.portable_payload);
  const vocabulary = canonicalPortableVocabulary();
  const unexpected = strings.filter((value) => !vocabulary.has(value));
  return Object.freeze({
    schema: 'td613.portable-aia.payload-vocabulary-audit/v0.1',
    ok: unexpected.length === 0,
    finite_canonical_vocabulary: true,
    unexpected: Object.freeze([...unexpected]),
    digest_token_present: strings.some((value) => /^sha256:/i.test(value)),
    route_mode_present: strings.includes(projection.route_mode),
    presentation_host_present: strings.includes(projection.presentation.host),
    release_authority: false
  });
}

export function buildPortableReturnCandidate(projection = {}, candidate = {}) {
  assertProjection(projection);
  if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) throw new TypeError('return candidate must be an object');
  const allowed = ['claimedActionClass'];
  for (const key of Object.keys(candidate)) {
    if (!allowed.includes(key)) throw new TypeError(`unsupported return-candidate field: ${key}`);
  }
  return Object.freeze({
    schema: PORTABLE_AIA_RETURN_SCHEMA,
    source_route_mode: projection.route_mode,
    source_host: projection.presentation.host,
    claimed_action_class: canonicalActionClass(candidate.claimedActionClass),
    trusted: false,
    release_authority: false,
    must_revalidate: true
  });
}

function assertLocalBindingMatches(projection, binding) {
  if (binding?.schema !== PORTABLE_AIA_LOCAL_BINDING_SCHEMA) throw new TypeError('portable AIA local binding required');
  if (binding.route_mode !== projection.route_mode || binding.rule_id !== projection.invariant.rule_id) {
    throw new TypeError('local binding does not match portable projection');
  }
  if (binding.portable !== false || binding.provider_context !== false || binding.must_remain_local !== true) {
    throw new TypeError('local binding authority membrane invalid');
  }
}

export function revalidatePortableReturn(projection = {}, binding = {}, candidate = {}) {
  assertProjection(projection);
  assertLocalBindingMatches(projection, binding);
  if (candidate?.schema !== PORTABLE_AIA_RETURN_SCHEMA) throw new TypeError('portable AIA return candidate required');
  const matches = candidate.claimed_action_class === projection.invariant.action_class;
  return Object.freeze({
    status: matches ? 'PRESENT_TO_HUMAN' : 'HOLD',
    canonical_action_class: projection.invariant.action_class,
    candidate_action_class: candidate.claimed_action_class,
    candidate_trusted: false,
    release_authority: false,
    human_closure_required: true,
    local_binding_retained: true,
    reason: matches ? 'candidate_matches_canonical_action_but_remains_advisory' : 'candidate_action_differs_from_canonical_loom_policy'
  });
}

function policyReceiverKey(projection) {
  const invariant = governanceInvariant(projection);
  return [
    invariant.policy_schema_token,
    invariant.rule_id,
    invariant.evidence_class,
    invariant.action_class,
    invariant.release_authority ? '1' : '0',
    invariant.human_closure_required ? '1' : '0',
    invariant.receipt_semantics
  ].join('|');
}

function boundaryReceiverKey(projection) {
  assertProjection(projection);
  const boundary = projection.portable_payload.route_boundary;
  return [
    boundary.execution_posture,
    boundary.source_ingress_position,
    boundary.advisory_transition
  ].join('|');
}

export function atlasPortableRouteKey(projection = {}, receiver = 'POLICY_ONLY') {
  assertProjection(projection);
  const receiverToken = safe(receiver).toUpperCase();
  if (!PORTABLE_AIA_ATLAS_RECEIVERS.includes(receiverToken)) throw new TypeError('unsupported Atlas portable receiver');
  return receiverToken === 'POLICY_ONLY'
    ? policyReceiverKey(projection)
    : boundaryReceiverKey(projection);
}

export function atlasPortableRouteQuotient(projections = [], receiver = 'POLICY_ONLY') {
  if (!Array.isArray(projections) || projections.length === 0) throw new TypeError('non-empty portable projection array required');
  const receiverToken = safe(receiver).toUpperCase();
  if (!PORTABLE_AIA_ATLAS_RECEIVERS.includes(receiverToken)) throw new TypeError('unsupported Atlas portable receiver');

  const classes = new Map();
  for (const projection of projections) {
    const key = atlasPortableRouteKey(projection, receiverToken);
    if (!classes.has(key)) classes.set(key, []);
    classes.get(key).push(projection.route_mode);
  }

  return Object.freeze({
    schema: PORTABLE_AIA_ATLAS_QUOTIENT_SCHEMA,
    receiver: receiverToken,
    input_count: projections.length,
    class_count: classes.size,
    classes: Object.freeze([...classes.entries()].map(([key, members]) => Object.freeze({
      key,
      members: Object.freeze([...members])
    }))),
    route_label_used_in_key: false,
    presentation_used_in_key: false,
    raw_source_used_in_key: false,
    external_truth_claimed: false,
    physical_geometry_claimed: false,
    release_authority: false
  });
}
