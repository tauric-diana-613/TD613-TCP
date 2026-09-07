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
import {
  MARROWLINE_MULTIPLEXED_FINDING_SPECS
} from './marrowline-multiplexed-finding-isolation-assay.mjs';
import {
  canonicalPacketPopulationSurfaceJson,
  runMarrowlinePacketPopulationStabilityAssay
} from './marrowline-packet-population-stability-assay.mjs';

export const MARROWLINE_DUPLICATE_RULE_COLLISION_REJECTION_ASSAY_SCHEMA =
  'td613.marrowline.duplicate-rule-collision-rejection-assay/v0.1-local-only';

export const MARROWLINE_DUPLICATE_RULE_COLLISIONS = Object.freeze([
  Object.freeze({ id: 'D_AA', labels: Object.freeze(['A', 'A']), rule_id: 'EMAIL_IDENTIFIER' }),
  Object.freeze({ id: 'D_BB', labels: Object.freeze(['B', 'B']), rule_id: 'USER_DECLARED_PROTECTED_TERM' })
]);

const FORBIDDEN_COLLISION_TRANSPORT_KEYS = Object.freeze(new Set([
  'duplicate',
  'duplicate_count',
  'collision',
  'collision_id',
  'collision_history',
  'rejected_rule',
  'rejected_rule_id',
  'prior_cardinality',
  'previous_cardinality',
  'occurrence',
  'occurrence_id',
  'occurrence_index',
  'alias',
  'alias_map',
  'schedule',
  'schedule_index',
  'nonce',
  'timestamp',
  'history',
  'route_history',
  'receipt_chain'
]));

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

export function canonicalDuplicateCollisionSurfaceJson(value) {
  return JSON.stringify(stable(value));
}

function describeSurface(value) {
  const json = canonicalDuplicateCollisionSurfaceJson(value);
  return Object.freeze({
    sha256: crypto.createHash('sha256').update(json, 'utf8').digest('hex'),
    bytes: Buffer.byteLength(json, 'utf8')
  });
}

function collectForbiddenCollisionKeys(value, path = 'transport', into = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectForbiddenCollisionKeys(item, `${path}[${index}]`, into));
    return into;
  }
  if (!value || typeof value !== 'object') return into;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_COLLISION_TRANSPORT_KEYS.has(String(key).toLowerCase())) into.push(`${path}.${key}`);
    collectForbiddenCollisionKeys(child, `${path}.${key}`, into);
  }
  return into;
}

function fixtureFor(spec) {
  const pocketProjection = compilePortableAiaProjection({ ruleId: spec.rule_id, routeMode: 'LOCAL_POCKET' });
  const hostedProjection = compilePortableAiaProjection({ ruleId: spec.rule_id, routeMode: 'TD613_HOSTED' });
  if (pocketProjection.invariant.action_class !== spec.matching_action) {
    throw new Error(`${spec.label} canonical action drifted from inherited finding specification`);
  }
  const localBinding = compilePortableAiaLocalBinding(pocketProjection, {
    policyDigest: `sha256:${spec.policy_digest_hex.repeat(64)}`,
    sourceStateDigest: `sha256:${spec.source_digest_hex.repeat(64)}`
  });
  return Object.freeze({ spec, pocketProjection, hostedProjection, localBinding });
}

function buildFixtures() {
  return Object.freeze({
    A: fixtureFor(MARROWLINE_MULTIPLEXED_FINDING_SPECS.A),
    B: fixtureFor(MARROWLINE_MULTIPLEXED_FINDING_SPECS.B)
  });
}

function buildPacket(labels, fixtures) {
  return Object.freeze({
    schema: LOCAL_POCKET_EXPORT_SCHEMA,
    portable_findings: Object.freeze(labels.map((label) => fixtures[label].pocketProjection.portable_payload)),
    release_authority: false,
    human_closure_required: true
  });
}

function expectDuplicateRejection(collision, packet) {
  try {
    buildMarrowlinePocketHostedCarryCase(packet);
  } catch (error) {
    const expected = `duplicate portable finding: ${collision.rule_id}`;
    if (!(error instanceof TypeError) || String(error.message || '') !== expected) throw error;
    return Object.freeze({
      collision_id: collision.id,
      rule_id: collision.rule_id,
      source_packet: describeSurface(packet),
      rejected: true,
      error: error.message,
      carry_case_returned: false
    });
  }
  throw new Error(`${collision.id} duplicate-rule collision was accepted into Carry Case construction`);
}

function hostedByRule(carryCase) {
  return Object.freeze(Object.fromEntries(
    carryCase.receipt.finding_rule_ids.map((ruleId, index) => [ruleId, carryCase.hosted_portable_findings[index]])
  ));
}

function buildLawfulCase(id, labels, fixtures) {
  const packet = buildPacket(labels, fixtures);
  const carryCase = buildMarrowlinePocketHostedCarryCase(packet);
  const hosted = hostedByRule(carryCase);
  const matchingEnvelopes = {};
  const mismatchEnvelopes = {};
  const matchingResults = {};
  const mismatchResults = {};

  for (const label of labels) {
    const fixture = fixtures[label];
    matchingEnvelopes[label] = buildMarrowlineReturnEnvelope(carryCase, {
      ruleId: fixture.spec.rule_id,
      claimedActionClass: fixture.spec.matching_action
    });
    mismatchEnvelopes[label] = buildMarrowlineReturnEnvelope(carryCase, {
      ruleId: fixture.spec.rule_id,
      claimedActionClass: fixture.spec.mismatch_action
    });
    matchingResults[label] = revalidateMarrowlineReturn(carryCase, fixture.localBinding, matchingEnvelopes[label]);
    mismatchResults[label] = revalidateMarrowlineReturn(carryCase, fixture.localBinding, mismatchEnvelopes[label]);
    if (matchingResults[label].status !== 'PRESENT_TO_HUMAN') {
      throw new Error(`${id} ${label} matching recovery drifted: ${matchingResults[label].status}`);
    }
    if (mismatchResults[label].status !== 'HOLD') {
      throw new Error(`${id} ${label} mismatch recovery drifted: ${mismatchResults[label].status}`);
    }
  }

  const transport = Object.freeze({ source_packet: packet, carry_case: carryCase });
  const forbiddenTransportPaths = collectForbiddenCollisionKeys(transport);
  if (forbiddenTransportPaths.length > 0) {
    throw new Error(`${id} transport accumulated collision history: ${forbiddenTransportPaths.join(', ')}`);
  }
  if (/sha256:/i.test(canonicalDuplicateCollisionSurfaceJson(transport))) {
    throw new Error(`${id} transport accumulated a digest carrier`);
  }

  return Object.freeze({
    id,
    labels: Object.freeze([...labels]),
    packet,
    carryCase,
    hosted,
    matchingEnvelopes: Object.freeze(matchingEnvelopes),
    mismatchEnvelopes: Object.freeze(mismatchEnvelopes),
    matchingResults: Object.freeze(matchingResults),
    mismatchResults: Object.freeze(mismatchResults),
    forbiddenTransportPaths: Object.freeze([...forbiddenTransportPaths])
  });
}

function reportLawfulCase(value) {
  return Object.freeze({
    id: value.id,
    labels: value.labels,
    finding_rule_ids: value.carryCase.receipt.finding_rule_ids,
    finding_count: value.carryCase.receipt.finding_count,
    source_packet: describeSurface(value.packet),
    carry_case: describeSurface(value.carryCase),
    hosted_by_rule: Object.freeze(Object.fromEntries(
      Object.entries(value.hosted).map(([ruleId, hosted]) => [ruleId, describeSurface(hosted)])
    )),
    matching_envelopes: Object.freeze(Object.fromEntries(
      Object.entries(value.matchingEnvelopes).map(([label, envelope]) => [label, describeSurface(envelope)])
    )),
    mismatch_envelopes: Object.freeze(Object.fromEntries(
      Object.entries(value.mismatchEnvelopes).map(([label, envelope]) => [label, describeSurface(envelope)])
    )),
    matching_results: Object.freeze(Object.fromEntries(
      Object.entries(value.matchingResults).map(([label, result]) => [label, describeSurface(result)])
    )),
    mismatch_results: Object.freeze(Object.fromEntries(
      Object.entries(value.mismatchResults).map(([label, result]) => [label, describeSurface(result)])
    )),
    matching_statuses: Object.freeze(Object.fromEntries(
      Object.entries(value.matchingResults).map(([label, result]) => [label, result.status])
    )),
    mismatch_statuses: Object.freeze(Object.fromEntries(
      Object.entries(value.mismatchResults).map(([label, result]) => [label, result.status])
    )),
    forbidden_transport_paths: value.forbiddenTransportPaths,
    release_authority: value.carryCase.receipt.release_authority,
    human_closure_required: value.carryCase.receipt.human_closure_required,
    local_binding_carried: value.carryCase.receipt.local_binding_carried
  });
}

function assertMatchesParentPopulation(recoveryReport, parentPopulation, label) {
  for (const key of ['finding_rule_ids', 'finding_count', 'source_packet', 'carry_case', 'hosted_by_rule',
    'matching_envelopes', 'mismatch_envelopes', 'matching_statuses', 'mismatch_statuses']) {
    if (canonicalDuplicateCollisionSurfaceJson(recoveryReport[key]) !== canonicalPacketPopulationSurfaceJson(parentPopulation[key])) {
      throw new Error(`${label} lawful surface drifted from #1059 parent at ${key}`);
    }
  }
}

function sameRecovery(left, right) {
  const keys = ['finding_rule_ids', 'finding_count', 'source_packet', 'carry_case', 'hosted_by_rule',
    'matching_envelopes', 'mismatch_envelopes', 'matching_results', 'mismatch_results',
    'matching_statuses', 'mismatch_statuses', 'forbidden_transport_paths'];
  return keys.every((key) => canonicalDuplicateCollisionSurfaceJson(left[key]) === canonicalDuplicateCollisionSurfaceJson(right[key]));
}

export function runMarrowlineDuplicateRuleCollisionRejectionAssay() {
  const fixtures = buildFixtures();
  const parent = runMarrowlinePacketPopulationStabilityAssay();

  const packetAA = buildPacket(['A', 'A'], fixtures);
  const packetBB = buildPacket(['B', 'B'], fixtures);

  const aa1 = expectDuplicateRejection(MARROWLINE_DUPLICATE_RULE_COLLISIONS[0], packetAA);
  const pA1 = reportLawfulCase(buildLawfulCase('P_A_AFTER_D_AA_1', ['A'], fixtures));
  const pABAfterAA = reportLawfulCase(buildLawfulCase('P_AB_AFTER_D_AA', ['A', 'B'], fixtures));
  const aa2 = expectDuplicateRejection(MARROWLINE_DUPLICATE_RULE_COLLISIONS[0], packetAA);
  const pA2 = reportLawfulCase(buildLawfulCase('P_A_AFTER_D_AA_2', ['A'], fixtures));

  const bb1 = expectDuplicateRejection(MARROWLINE_DUPLICATE_RULE_COLLISIONS[1], packetBB);
  const pB1 = reportLawfulCase(buildLawfulCase('P_B_AFTER_D_BB_1', ['B'], fixtures));
  const pABAfterBB = reportLawfulCase(buildLawfulCase('P_AB_AFTER_D_BB', ['A', 'B'], fixtures));
  const bb2 = expectDuplicateRejection(MARROWLINE_DUPLICATE_RULE_COLLISIONS[1], packetBB);
  const pB2 = reportLawfulCase(buildLawfulCase('P_B_AFTER_D_BB_2', ['B'], fixtures));

  for (const [recovery, parentPopulation, label] of [
    [pA1, parent.populations.P_A, 'P_A_AFTER_D_AA_1'],
    [pA2, parent.populations.P_A, 'P_A_AFTER_D_AA_2'],
    [pB1, parent.populations.P_B, 'P_B_AFTER_D_BB_1'],
    [pB2, parent.populations.P_B, 'P_B_AFTER_D_BB_2'],
    [pABAfterAA, parent.populations.P_AB, 'P_AB_AFTER_D_AA'],
    [pABAfterBB, parent.populations.P_AB, 'P_AB_AFTER_D_BB']
  ]) {
    assertMatchesParentPopulation(recovery, parentPopulation, label);
  }

  if (!sameRecovery(pA1, pA2)) throw new Error('Repeated D_AA rejection poisoned P_A replay');
  if (!sameRecovery(pB1, pB2)) throw new Error('Repeated D_BB rejection poisoned P_B replay');
  if (!sameRecovery(pABAfterAA, pABAfterBB)) throw new Error('Collision identity changed later lawful P_AB recovery');
  if (canonicalDuplicateCollisionSurfaceJson(aa1) !== canonicalDuplicateCollisionSurfaceJson(aa2)) {
    throw new Error('D_AA rejection receipt drifted across repeated collision');
  }
  if (canonicalDuplicateCollisionSurfaceJson(bb1) !== canonicalDuplicateCollisionSurfaceJson(bb2)) {
    throw new Error('D_BB rejection receipt drifted across repeated collision');
  }

  return Object.freeze({
    schema: MARROWLINE_DUPLICATE_RULE_COLLISION_REJECTION_ASSAY_SCHEMA,
    status: 'PASS',
    assay_local_only: true,
    collisions: Object.freeze({ D_AA: aa1, D_BB: bb1 }),
    recoveries: Object.freeze({
      P_A_AFTER_D_AA_1: pA1,
      P_AB_AFTER_D_AA: pABAfterAA,
      P_A_AFTER_D_AA_2: pA2,
      P_B_AFTER_D_BB_1: pB1,
      P_AB_AFTER_D_BB: pABAfterBB,
      P_B_AFTER_D_BB_2: pB2
    }),
    duplicate_a_rejected: true,
    duplicate_b_rejected: true,
    collisions_fail_before_carry_case: true,
    lawful_surfaces_match_parent: true,
    repeated_collision_nonpoisoning: true,
    collision_identity_does_not_change_pair_recovery: true,
    matching_decision_invariant: true,
    mismatch_decision_invariant: true,
    hidden_collision_state_carried: false,
    browser_persistence_required: false,
    authority: Object.freeze({
      release_authority: false,
      human_closure_required: true,
      provider_call_performed: false,
      production_mutation: false
    }),
    claim_ceiling: 'bounded-two-rule-duplicate-collision-rejection-nonpoisoning-only'
  });
}
