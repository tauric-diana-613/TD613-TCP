import crypto from 'node:crypto';

import {
  LOCAL_POCKET_EXPORT_SCHEMA
} from '../app/dome-world/holonomy-loom-local-pocket-policy.js';
import {
  buildMarrowlinePocketHostedCarryCase,
  buildMarrowlineReturnEnvelope,
  revalidateMarrowlineReturn
} from '../app/dome-world/marrowline-pocket-hosted-carry-case.js';
import {
  compilePortableAiaLocalBinding,
  compilePortableAiaProjection
} from '../app/dome-world/portable-aia-three-route-invariance.js';

export const MARROWLINE_MULTIPLEXED_FINDING_ISOLATION_ASSAY_SCHEMA = 'td613.marrowline.multiplexed-finding-isolation-assay/v0.1-local-only';

export const MARROWLINE_MULTIPLEXED_FINDING_SPECS = Object.freeze({
  A: Object.freeze({
    label: 'A',
    rule_id: 'EMAIL_IDENTIFIER',
    matching_action: 'CHANGE',
    mismatch_action: 'REMOVE',
    policy_digest_hex: '1',
    source_digest_hex: '2'
  }),
  B: Object.freeze({
    label: 'B',
    rule_id: 'USER_DECLARED_PROTECTED_TERM',
    matching_action: 'REMOVE',
    mismatch_action: 'CHANGE',
    policy_digest_hex: '3',
    source_digest_hex: '4'
  })
});

export const MARROWLINE_MULTIPLEXED_PATTERNS = Object.freeze([
  Object.freeze({
    id: 'PATTERN_1',
    execution_order: Object.freeze(['A', 'B']),
    action_mode: Object.freeze({ A: 'MATCH', B: 'MISMATCH' }),
    expected_status: Object.freeze({ A: 'PRESENT_TO_HUMAN', B: 'HOLD' })
  }),
  Object.freeze({
    id: 'PATTERN_2',
    execution_order: Object.freeze(['B', 'A']),
    action_mode: Object.freeze({ A: 'MISMATCH', B: 'MATCH' }),
    expected_status: Object.freeze({ A: 'HOLD', B: 'PRESENT_TO_HUMAN' })
  })
]);

const FORBIDDEN_SHARED_TRANSPORT_KEYS = Object.freeze(new Set([
  'status',
  'decision',
  'decision_state',
  'sibling_status',
  'sibling_action',
  'prior_sibling',
  'previous_sibling',
  'schedule',
  'schedule_index',
  'pattern',
  'pattern_index',
  'history',
  'route_history',
  'receipt_chain',
  'nonce',
  'timestamp'
]));

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

export function canonicalMultiplexedSurfaceJson(value) {
  return JSON.stringify(stable(value));
}

function describeSurface(value) {
  const json = canonicalMultiplexedSurfaceJson(value);
  return Object.freeze({
    sha256: crypto.createHash('sha256').update(json, 'utf8').digest('hex'),
    bytes: Buffer.byteLength(json, 'utf8')
  });
}

function collectForbiddenSharedTransportKeys(value, path = 'transport', into = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectForbiddenSharedTransportKeys(item, `${path}[${index}]`, into));
    return into;
  }
  if (!value || typeof value !== 'object') return into;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_SHARED_TRANSPORT_KEYS.has(String(key).toLowerCase())) into.push(`${path}.${key}`);
    collectForbiddenSharedTransportKeys(child, `${path}.${key}`, into);
  }
  return into;
}

function fixtureFor(spec) {
  const pocketProjection = compilePortableAiaProjection({ ruleId: spec.rule_id, routeMode: 'LOCAL_POCKET' });
  const hostedProjection = compilePortableAiaProjection({ ruleId: spec.rule_id, routeMode: 'TD613_HOSTED' });
  if (pocketProjection.invariant.action_class !== spec.matching_action) {
    throw new Error(`${spec.label} canonical action does not match preregistered matching action`);
  }
  const localBinding = compilePortableAiaLocalBinding(pocketProjection, {
    policyDigest: `sha256:${spec.policy_digest_hex.repeat(64)}`,
    sourceStateDigest: `sha256:${spec.source_digest_hex.repeat(64)}`
  });
  return Object.freeze({ spec, pocketProjection, hostedProjection, localBinding });
}

function sharedFixture() {
  const A = fixtureFor(MARROWLINE_MULTIPLEXED_FINDING_SPECS.A);
  const B = fixtureFor(MARROWLINE_MULTIPLEXED_FINDING_SPECS.B);
  const packet = Object.freeze({
    schema: LOCAL_POCKET_EXPORT_SCHEMA,
    portable_findings: Object.freeze([A.pocketProjection.portable_payload, B.pocketProjection.portable_payload]),
    release_authority: false,
    human_closure_required: true
  });
  const carryCase = buildMarrowlinePocketHostedCarryCase(packet);
  return Object.freeze({ A, B, packet, carryCase });
}

function buildEnvelope(shared, label, mode) {
  const fixture = shared[label];
  const action = mode === 'MATCH' ? fixture.spec.matching_action : fixture.spec.mismatch_action;
  return buildMarrowlineReturnEnvelope(shared.carryCase, {
    ruleId: fixture.spec.rule_id,
    claimedActionClass: action
  });
}

function assertSharedCase(shared) {
  const receipt = shared.carryCase.receipt;
  if (receipt.finding_count !== 2) throw new Error(`shared Carry Case finding_count drifted: ${receipt.finding_count}`);
  if (JSON.stringify(receipt.finding_rule_ids) !== JSON.stringify(['EMAIL_IDENTIFIER', 'USER_DECLARED_PROTECTED_TERM'])) {
    throw new Error(`shared Carry Case rule order drifted: ${JSON.stringify(receipt.finding_rule_ids)}`);
  }
  if (receipt.release_authority !== false || receipt.human_closure_required !== true || receipt.local_binding_carried !== false) {
    throw new Error('shared Carry Case authority/local-binding membrane widened');
  }
  if (shared.carryCase.hosted_portable_findings.length !== 2) throw new Error('shared Carry Case lost a Hosted finding');
  const hostedA = canonicalMultiplexedSurfaceJson(shared.carryCase.hosted_portable_findings[0]);
  const hostedB = canonicalMultiplexedSurfaceJson(shared.carryCase.hosted_portable_findings[1]);
  if (hostedA !== canonicalMultiplexedSurfaceJson(shared.A.hostedProjection.portable_payload)) throw new Error('Hosted A projection drifted');
  if (hostedB !== canonicalMultiplexedSurfaceJson(shared.B.hostedProjection.portable_payload)) throw new Error('Hosted B projection drifted');
  if (hostedA === hostedB) throw new Error('Hosted A/B finding distinguishability collapsed');
}

function executePattern(shared, pattern) {
  const beforeCarry = describeSurface(shared.carryCase);
  const envelopes = Object.freeze({
    A: buildEnvelope(shared, 'A', pattern.action_mode.A),
    B: buildEnvelope(shared, 'B', pattern.action_mode.B)
  });
  const envelopeBefore = Object.freeze({ A: describeSurface(envelopes.A), B: describeSurface(envelopes.B) });
  const results = {};

  for (const label of pattern.execution_order) {
    results[label] = revalidateMarrowlineReturn(shared.carryCase, shared[label].localBinding, envelopes[label]);
  }

  const afterCarry = describeSurface(shared.carryCase);
  const envelopeAfter = Object.freeze({ A: describeSurface(envelopes.A), B: describeSurface(envelopes.B) });
  if (beforeCarry.sha256 !== afterCarry.sha256 || beforeCarry.bytes !== afterCarry.bytes) {
    throw new Error(`${pattern.id} mutated the shared Carry Case`);
  }
  for (const label of ['A', 'B']) {
    if (envelopeBefore[label].sha256 !== envelopeAfter[label].sha256 || envelopeBefore[label].bytes !== envelopeAfter[label].bytes) {
      throw new Error(`${pattern.id} mutated ${label} return envelope`);
    }
    if (results[label].status !== pattern.expected_status[label]) {
      throw new Error(`${pattern.id} ${label} expected ${pattern.expected_status[label]} observed ${results[label].status}`);
    }
    if (results[label].candidate_trusted !== false || results[label].release_authority !== false ||
        results[label].human_closure_required !== true || results[label].local_binding_retained !== true) {
      throw new Error(`${pattern.id} ${label} widened authority or lost local binding retention`);
    }
  }

  return Object.freeze({
    pattern_id: pattern.id,
    assay_local_only: true,
    execution_order: pattern.execution_order,
    action_mode: pattern.action_mode,
    statuses: Object.freeze({ A: results.A.status, B: results.B.status }),
    expected_statuses: pattern.expected_status,
    carry_case_unchanged: true,
    sibling_envelopes_unchanged: true,
    results: Object.freeze({
      A: Object.freeze({
        status: results.A.status,
        candidate_trusted: results.A.candidate_trusted,
        release_authority: results.A.release_authority,
        human_closure_required: results.A.human_closure_required,
        local_binding_retained: results.A.local_binding_retained
      }),
      B: Object.freeze({
        status: results.B.status,
        candidate_trusted: results.B.candidate_trusted,
        release_authority: results.B.release_authority,
        human_closure_required: results.B.human_closure_required,
        local_binding_retained: results.B.local_binding_retained
      })
    }),
    envelope_surfaces: Object.freeze({ A: envelopeBefore.A, B: envelopeBefore.B })
  });
}

function wrongBindingControl(shared, envelope, wrongBinding, label) {
  try {
    revalidateMarrowlineReturn(shared.carryCase, wrongBinding, envelope);
  } catch (error) {
    if (!(error instanceof TypeError) || !/local binding does not match portable projection/.test(String(error.message || ''))) {
      throw error;
    }
    return Object.freeze({ label, rejected: true, error: error.message });
  }
  throw new Error(`${label} wrong-rule local binding was accepted`);
}

export function runMarrowlineMultiplexedFindingIsolationAssay() {
  const shared = sharedFixture();
  assertSharedCase(shared);

  const carryCaseSurface = describeSurface(shared.carryCase);
  const transport = Object.freeze({ source_packet: shared.packet, carry_case: shared.carryCase });
  const forbiddenPaths = collectForbiddenSharedTransportKeys(transport);
  const transportJson = canonicalMultiplexedSurfaceJson(transport);
  if (forbiddenPaths.length > 0) throw new Error(`shared transport accumulated decision/history state: ${forbiddenPaths.join(', ')}`);
  if (/sha256:/i.test(transportJson)) throw new Error('shared transport accumulated a digest carrier');

  const patterns = MARROWLINE_MULTIPLEXED_PATTERNS.map(pattern => executePattern(shared, pattern));

  if (patterns[0].statuses.A !== 'PRESENT_TO_HUMAN' || patterns[0].statuses.B !== 'HOLD') {
    throw new Error('Pattern 1 collapsed per-finding decision isolation');
  }
  if (patterns[1].statuses.A !== 'HOLD' || patterns[1].statuses.B !== 'PRESENT_TO_HUMAN') {
    throw new Error('Pattern 2 collapsed per-finding decision isolation');
  }

  const canonicalMatchA = buildEnvelope(shared, 'A', 'MATCH');
  const canonicalMatchB = buildEnvelope(shared, 'B', 'MATCH');
  const controls = Object.freeze({
    A_with_B_binding: wrongBindingControl(shared, canonicalMatchA, shared.B.localBinding, 'A_with_B_binding'),
    B_with_A_binding: wrongBindingControl(shared, canonicalMatchB, shared.A.localBinding, 'B_with_A_binding')
  });

  const sharedSurfaceAfter = describeSurface(shared.carryCase);
  if (carryCaseSurface.sha256 !== sharedSurfaceAfter.sha256 || carryCaseSurface.bytes !== sharedSurfaceAfter.bytes) {
    throw new Error('opposed patterns or controls mutated the shared Carry Case');
  }

  return Object.freeze({
    schema: MARROWLINE_MULTIPLEXED_FINDING_ISOLATION_ASSAY_SCHEMA,
    status: 'PASS',
    assay_local_only: true,
    packet_labels: Object.freeze(['A', 'B']),
    shared_case: Object.freeze({
      finding_count: shared.carryCase.receipt.finding_count,
      finding_rule_ids: shared.carryCase.receipt.finding_rule_ids,
      source_packet: describeSurface(shared.packet),
      carry_case: carryCaseSurface,
      hosted_findings: Object.freeze({
        A: describeSurface(shared.carryCase.hosted_portable_findings[0]),
        B: describeSurface(shared.carryCase.hosted_portable_findings[1])
      }),
      hosted_findings_distinguishable: true,
      local_binding_carried: shared.carryCase.receipt.local_binding_carried,
      release_authority: shared.carryCase.receipt.release_authority,
      human_closure_required: shared.carryCase.receipt.human_closure_required,
      forbidden_shared_transport_paths: Object.freeze([...forbiddenPaths])
    }),
    patterns: Object.freeze(patterns),
    controls,
    all_four_status_controls_observed: true,
    shared_carry_case_unchanged_across_patterns: true,
    sibling_decision_isolation: true,
    wrong_rule_binding_rejected: true,
    portable_decision_state_carried: false,
    prior_sibling_status_carried: false,
    browser_persistence_required: false,
    authority: Object.freeze({
      release_authority: false,
      human_closure_required: true,
      provider_call_performed: false,
      production_mutation: false
    }),
    claim_ceiling: 'bounded-two-finding-one-carry-case-opposed-pattern-isolation-only',
    seal: '⟐'
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(`${JSON.stringify(runMarrowlineMultiplexedFindingIsolationAssay(), null, 2)}\n`);
}
