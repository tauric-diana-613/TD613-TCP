import {
  HOLONOMY_LOOM_ADVISORY_RULES
} from './holonomy-loom-advisory-policy.js';
import {
  LOCAL_POCKET_CANONICAL_ROUTE_MODE,
  LOCAL_POCKET_EXPORT_SCHEMA,
  LOCAL_POCKET_TRANSPORT_FORBIDDEN_KEYS
} from './holonomy-loom-local-pocket-policy.js';
import {
  atlasPortableRouteKey,
  auditPortablePayloadVocabulary,
  buildPortableReturnCandidate,
  compilePortableAiaProjection,
  revalidatePortableReturn
} from './portable-aia-three-route-invariance.js';

export const MARROWLINE_POCKET_HOSTED_CARRY_CASE_SCHEMA = 'td613.marrowline.pocket-hosted-carry-case/v0.1';
export const MARROWLINE_TRANSPORT_RECEIPT_SCHEMA = 'td613.marrowline.transport-receipt/v0.1-finite-canonical-tokens';
export const MARROWLINE_RETURN_ENVELOPE_SCHEMA = 'td613.marrowline.return-envelope/v0.1-canonical-action-only';

export const MARROWLINE_CARRY_CASE_TOKENS = Object.freeze({
  source_boundary_token: 'LOCAL_POCKET_PREFLIGHT_BOUNDARY',
  transport_action_token: 'COPY_POCKET_PACKET',
  arrival_boundary_token: 'TD613_HOSTED_AIA_BOUNDARY'
});

const HOSTED_ROUTE_MODE = 'TD613_HOSTED';

const POCKET_PACKET_KEYS = Object.freeze([
  'schema',
  'portable_findings',
  'release_authority',
  'human_closure_required'
]);

const TRANSPORT_RECEIPT_KEYS = Object.freeze([
  'schema',
  'source_boundary_token',
  'transport_action_token',
  'arrival_boundary_token',
  'finding_rule_ids',
  'finding_count',
  'release_authority',
  'human_closure_required',
  'raw_message_carried',
  'local_binding_carried',
  'provider_call_performed',
  'production_mutation'
]);

const RETURN_ENVELOPE_KEYS = Object.freeze([
  'schema',
  'source_boundary_token',
  'rule_id',
  'claimed_action_class',
  'trusted',
  'release_authority',
  'must_revalidate'
]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function assertPlainObject(value, label) {
  if (!isPlainObject(value)) throw new TypeError(`${label} must be an object`);
}

function assertExactKeys(value, allowed, label) {
  assertPlainObject(value, label);
  const actual = Object.keys(value).sort();
  const expected = [...allowed].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw new TypeError(`${label} fields must match the canonical finite schema`);
  }
}

function collectStrings(value, into = []) {
  if (typeof value === 'string') into.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, into));
  else if (isPlainObject(value)) Object.values(value).forEach((item) => collectStrings(item, into));
  return into;
}

function assertNoForbiddenTransportCarrier(value, path = 'transport') {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoForbiddenTransportCarrier(item, `${path}[${index}]`));
    return;
  }
  if (!isPlainObject(value)) {
    if (typeof value === 'string' && /sha256:/i.test(value)) {
      throw new TypeError(`${path} contains a digest-like transport carrier`);
    }
    return;
  }
  for (const [key, child] of Object.entries(value)) {
    if (LOCAL_POCKET_TRANSPORT_FORBIDDEN_KEYS.includes(key)) {
      throw new TypeError(`${path}.${key} is forbidden on the carry-case route`);
    }
    assertNoForbiddenTransportCarrier(child, `${path}.${key}`);
  }
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!isPlainObject(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

function sameCanonicalValue(left, right) {
  return JSON.stringify(stable(left)) === JSON.stringify(stable(right));
}

function canonicalPocketProjection(ruleId) {
  return compilePortableAiaProjection({
    ruleId,
    routeMode: LOCAL_POCKET_CANONICAL_ROUTE_MODE
  });
}

function canonicalHostedProjection(ruleId) {
  return compilePortableAiaProjection({
    ruleId,
    routeMode: HOSTED_ROUTE_MODE
  });
}

function validatePocketPacket(packet) {
  assertExactKeys(packet, POCKET_PACKET_KEYS, 'Pocket packet');
  assertNoForbiddenTransportCarrier(packet, 'Pocket packet');
  if (packet.schema !== LOCAL_POCKET_EXPORT_SCHEMA) throw new TypeError('wrong Local Pocket export schema');
  if (!Array.isArray(packet.portable_findings)) throw new TypeError('portable_findings must be an array');
  if (packet.release_authority !== false) throw new TypeError('Pocket packet release authority must remain false');
  if (packet.human_closure_required !== true) throw new TypeError('Pocket packet must require human closure');

  const seen = new Set();
  const validated = [];
  for (const [index, finding] of packet.portable_findings.entries()) {
    assertPlainObject(finding, `portable_findings[${index}]`);
    const ruleId = String(finding.rule_id || '').trim();
    if (!HOLONOMY_LOOM_ADVISORY_RULES[ruleId]) throw new TypeError(`portable_findings[${index}] has unsupported rule_id`);
    if (seen.has(ruleId)) throw new TypeError(`duplicate portable finding: ${ruleId}`);
    seen.add(ruleId);

    const sourceProjection = canonicalPocketProjection(ruleId);
    const sourceAudit = auditPortablePayloadVocabulary(sourceProjection);
    if (!sourceAudit.ok || sourceAudit.digest_token_present || sourceAudit.route_mode_present || sourceAudit.presentation_host_present) {
      throw new TypeError(`canonical Local Pocket projection failed vocabulary audit: ${ruleId}`);
    }
    if (!sameCanonicalValue(finding, sourceProjection.portable_payload)) {
      throw new TypeError(`portable_findings[${index}] differs from canonical Local Pocket projection`);
    }

    const hostedProjection = canonicalHostedProjection(ruleId);
    const policySourceKey = atlasPortableRouteKey(sourceProjection, 'POLICY_ONLY');
    const policyHostedKey = atlasPortableRouteKey(hostedProjection, 'POLICY_ONLY');
    const boundarySourceKey = atlasPortableRouteKey(sourceProjection, 'BOUNDARY_AWARE');
    const boundaryHostedKey = atlasPortableRouteKey(hostedProjection, 'BOUNDARY_AWARE');

    if (policySourceKey !== policyHostedKey) throw new TypeError(`policy invariant drifted across carry-case route: ${ruleId}`);
    if (boundarySourceKey === boundaryHostedKey) throw new TypeError(`Pocket and Hosted boundary classes collapsed: ${ruleId}`);

    validated.push(Object.freeze({
      rule_id: ruleId,
      source_projection: sourceProjection,
      hosted_projection: hostedProjection,
      policy_equivalent: true,
      boundary_distinguishable: true
    }));
  }

  return Object.freeze(validated);
}

function buildTransportReceipt(validated) {
  return Object.freeze({
    schema: MARROWLINE_TRANSPORT_RECEIPT_SCHEMA,
    source_boundary_token: MARROWLINE_CARRY_CASE_TOKENS.source_boundary_token,
    transport_action_token: MARROWLINE_CARRY_CASE_TOKENS.transport_action_token,
    arrival_boundary_token: MARROWLINE_CARRY_CASE_TOKENS.arrival_boundary_token,
    finding_rule_ids: Object.freeze(validated.map((item) => item.rule_id)),
    finding_count: validated.length,
    release_authority: false,
    human_closure_required: true,
    raw_message_carried: false,
    local_binding_carried: false,
    provider_call_performed: false,
    production_mutation: false
  });
}

export function auditMarrowlineTransportReceipt(receipt = {}) {
  assertExactKeys(receipt, TRANSPORT_RECEIPT_KEYS, 'Marrowline transport receipt');
  assertNoForbiddenTransportCarrier(receipt, 'Marrowline transport receipt');
  const vocabulary = new Set([
    MARROWLINE_TRANSPORT_RECEIPT_SCHEMA,
    ...Object.values(MARROWLINE_CARRY_CASE_TOKENS),
    ...Object.keys(HOLONOMY_LOOM_ADVISORY_RULES)
  ]);
  const unexpected = collectStrings(receipt).filter((token) => !vocabulary.has(token));
  return Object.freeze({
    ok: unexpected.length === 0,
    finite_canonical_vocabulary: true,
    unexpected: Object.freeze([...unexpected]),
    release_authority: false
  });
}

export function buildMarrowlinePocketHostedCarryCase(packet = {}) {
  const validated = validatePocketPacket(packet);
  const receipt = buildTransportReceipt(validated);
  const receiptAudit = auditMarrowlineTransportReceipt(receipt);
  if (!receiptAudit.ok) throw new TypeError('Marrowline transport receipt escaped canonical token vocabulary');

  return Object.freeze({
    schema: MARROWLINE_POCKET_HOSTED_CARRY_CASE_SCHEMA,
    receipt,
    hosted_portable_findings: Object.freeze(validated.map((item) => item.hosted_projection.portable_payload)),
    atlas: Object.freeze({
      receiver_policy: 'POLICY_ONLY',
      receiver_boundary: 'BOUNDARY_AWARE',
      finding_count: validated.length,
      policy_equivalent: validated.every((item) => item.policy_equivalent),
      boundary_distinguishable: validated.every((item) => item.boundary_distinguishable),
      route_label_used_in_key: false,
      presentation_used_in_key: false,
      raw_message_used_in_key: false
    }),
    authority: Object.freeze({
      release_authority: false,
      human_closure_required: true,
      provider_call_performed: false,
      production_mutation: false,
      deployment_authority: false
    })
  });
}

function assertCarryCase(carryCase) {
  if (carryCase?.schema !== MARROWLINE_POCKET_HOSTED_CARRY_CASE_SCHEMA) {
    throw new TypeError('Marrowline Pocket→Hosted carry case required');
  }
  assertExactKeys(carryCase.receipt, TRANSPORT_RECEIPT_KEYS, 'Marrowline transport receipt');
  if (carryCase.receipt.source_boundary_token !== MARROWLINE_CARRY_CASE_TOKENS.source_boundary_token ||
      carryCase.receipt.transport_action_token !== MARROWLINE_CARRY_CASE_TOKENS.transport_action_token ||
      carryCase.receipt.arrival_boundary_token !== MARROWLINE_CARRY_CASE_TOKENS.arrival_boundary_token ||
      carryCase.receipt.release_authority !== false ||
      carryCase.receipt.human_closure_required !== true ||
      carryCase.receipt.raw_message_carried !== false ||
      carryCase.receipt.local_binding_carried !== false ||
      carryCase.receipt.provider_call_performed !== false ||
      carryCase.receipt.production_mutation !== false) {
    throw new TypeError('Marrowline carry-case receipt membrane invalid');
  }
}

export function buildMarrowlineReturnEnvelope(carryCase = {}, input = {}) {
  assertCarryCase(carryCase);
  assertPlainObject(input, 'return envelope input');
  const allowed = ['ruleId', 'claimedActionClass'];
  for (const key of Object.keys(input)) {
    if (!allowed.includes(key)) throw new TypeError(`unsupported return envelope input: ${key}`);
  }
  const ruleId = String(input.ruleId || '').trim();
  if (!carryCase.receipt.finding_rule_ids.includes(ruleId)) throw new TypeError('return rule_id was not carried into Hosted AIA');

  const hostedProjection = canonicalHostedProjection(ruleId);
  const canonicalCandidate = buildPortableReturnCandidate(hostedProjection, {
    claimedActionClass: input.claimedActionClass
  });

  return Object.freeze({
    schema: MARROWLINE_RETURN_ENVELOPE_SCHEMA,
    source_boundary_token: MARROWLINE_CARRY_CASE_TOKENS.arrival_boundary_token,
    rule_id: ruleId,
    claimed_action_class: canonicalCandidate.claimed_action_class,
    trusted: false,
    release_authority: false,
    must_revalidate: true
  });
}

function validateReturnEnvelope(carryCase, envelope) {
  assertExactKeys(envelope, RETURN_ENVELOPE_KEYS, 'Marrowline return envelope');
  assertNoForbiddenTransportCarrier(envelope, 'Marrowline return envelope');
  if (envelope.schema !== MARROWLINE_RETURN_ENVELOPE_SCHEMA) throw new TypeError('wrong Marrowline return envelope schema');
  if (envelope.source_boundary_token !== MARROWLINE_CARRY_CASE_TOKENS.arrival_boundary_token) throw new TypeError('return envelope source boundary mismatch');
  if (!carryCase.receipt.finding_rule_ids.includes(envelope.rule_id)) throw new TypeError('return envelope rule_id not present in carry case');
  if (envelope.trusted !== false || envelope.release_authority !== false || envelope.must_revalidate !== true) {
    throw new TypeError('return envelope authority membrane invalid');
  }
}

export function revalidateMarrowlineReturn(carryCase = {}, localBinding = {}, envelope = {}) {
  assertCarryCase(carryCase);
  validateReturnEnvelope(carryCase, envelope);

  const sourceProjection = canonicalPocketProjection(envelope.rule_id);
  const hostedProjection = canonicalHostedProjection(envelope.rule_id);
  const canonicalCandidate = buildPortableReturnCandidate(hostedProjection, {
    claimedActionClass: envelope.claimed_action_class
  });
  const result = revalidatePortableReturn(sourceProjection, localBinding, canonicalCandidate);

  return Object.freeze({
    status: result.status,
    canonical_action_class: result.canonical_action_class,
    candidate_action_class: result.candidate_action_class,
    candidate_trusted: false,
    release_authority: false,
    human_closure_required: true,
    local_binding_retained: true
  });
}
