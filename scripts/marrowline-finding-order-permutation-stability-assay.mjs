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

export const MARROWLINE_FINDING_ORDER_PERMUTATION_STABILITY_ASSAY_SCHEMA = 'td613.marrowline.finding-order-permutation-stability-assay/v0.1-local-only';

export const MARROWLINE_FINDING_ORDER_PERMUTATIONS = Object.freeze([
  Object.freeze({ id: 'P_AB', order: Object.freeze(['A', 'B']) }),
  Object.freeze({ id: 'P_BA', order: Object.freeze(['B', 'A']) })
]);

const FORBIDDEN_PERMUTATION_TRANSPORT_KEYS = Object.freeze(new Set([
  'slot',
  'slot_index',
  'slot_to_rule',
  'slot_to_rule_map',
  'alias_map',
  'original_index',
  'original_slot',
  'permutation',
  'permutation_id',
  'permutation_history',
  'reorder_history',
  'schedule',
  'schedule_index',
  'prior_packet',
  'prior_packet_identity',
  'previous_packet',
  'previous_packet_identity',
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

export function canonicalFindingOrderSurfaceJson(value) {
  return JSON.stringify(stable(value));
}

function describeSurface(value) {
  const json = canonicalFindingOrderSurfaceJson(value);
  return Object.freeze({
    sha256: crypto.createHash('sha256').update(json, 'utf8').digest('hex'),
    bytes: Buffer.byteLength(json, 'utf8')
  });
}

function sameSurface(left, right) {
  return left.sha256 === right.sha256 && left.bytes === right.bytes;
}

function collectForbiddenTransportKeys(value, path = 'transport', into = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectForbiddenTransportKeys(item, `${path}[${index}]`, into));
    return into;
  }
  if (!value || typeof value !== 'object') return into;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_PERMUTATION_TRANSPORT_KEYS.has(String(key).toLowerCase())) into.push(`${path}.${key}`);
    collectForbiddenTransportKeys(child, `${path}.${key}`, into);
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

function expectedRuleOrder(order, fixtures) {
  return order.map(label => fixtures[label].spec.rule_id);
}

function hostedByRule(carryCase) {
  return Object.freeze(Object.fromEntries(
    carryCase.receipt.finding_rule_ids.map((ruleId, index) => [ruleId, carryCase.hosted_portable_findings[index]])
  ));
}

function expectCrossBindingRejection(carryCase, wrongBinding, envelope, label) {
  try {
    revalidateMarrowlineReturn(carryCase, wrongBinding, envelope);
  } catch (error) {
    if (!(error instanceof TypeError) || !/local binding does not match portable projection/.test(String(error.message || ''))) throw error;
    return Object.freeze({ label, rejected: true, error: error.message });
  }
  throw new Error(`${label} cross-binding was accepted`);
}

function buildPermutationCase(permutation, fixtures) {
  const portableFindings = permutation.order.map(label => fixtures[label].pocketProjection.portable_payload);
  const packet = Object.freeze({
    schema: LOCAL_POCKET_EXPORT_SCHEMA,
    portable_findings: Object.freeze(portableFindings),
    release_authority: false,
    human_closure_required: true
  });
  const carryCase = buildMarrowlinePocketHostedCarryCase(packet);
  const expected = expectedRuleOrder(permutation.order, fixtures);
  if (canonicalFindingOrderSurfaceJson(carryCase.receipt.finding_rule_ids) !== canonicalFindingOrderSurfaceJson(expected)) {
    throw new Error(`${permutation.id} Carry Case silently reordered findings`);
  }
  if (carryCase.hosted_portable_findings.length !== permutation.order.length) {
    throw new Error(`${permutation.id} Hosted finding count drifted`);
  }

  const hosted = hostedByRule(carryCase);
  for (const label of permutation.order) {
    const ruleId = fixtures[label].spec.rule_id;
    if (canonicalFindingOrderSurfaceJson(hosted[ruleId]) !== canonicalFindingOrderSurfaceJson(fixtures[label].hostedProjection.portable_payload)) {
      throw new Error(`${permutation.id} Hosted projection drifted for ${label}`);
    }
  }

  const matchingEnvelopes = {};
  const mismatchEnvelopes = {};
  const matchingResults = {};
  const mismatchResults = {};
  for (const label of ['A', 'B']) {
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
      throw new Error(`${permutation.id} ${label} matching decision drifted: ${matchingResults[label].status}`);
    }
    if (mismatchResults[label].status !== 'HOLD') {
      throw new Error(`${permutation.id} ${label} mismatch decision drifted: ${mismatchResults[label].status}`);
    }
  }

  const controls = Object.freeze({
    A_with_B_binding: expectCrossBindingRejection(carryCase, fixtures.B.localBinding, matchingEnvelopes.A, `${permutation.id}:A_with_B_binding`),
    B_with_A_binding: expectCrossBindingRejection(carryCase, fixtures.A.localBinding, matchingEnvelopes.B, `${permutation.id}:B_with_A_binding`)
  });

  const transport = Object.freeze({ source_packet: packet, carry_case: carryCase });
  const forbiddenTransportPaths = collectForbiddenTransportKeys(transport);
  if (forbiddenTransportPaths.length > 0) {
    throw new Error(`${permutation.id} transport accumulated positional/permutation history: ${forbiddenTransportPaths.join(', ')}`);
  }
  if (/sha256:/i.test(canonicalFindingOrderSurfaceJson(transport))) {
    throw new Error(`${permutation.id} transport accumulated a digest carrier`);
  }

  return Object.freeze({
    permutation_id: permutation.id,
    order: permutation.order,
    expected_rule_order: Object.freeze(expected),
    packet,
    carryCase,
    hosted,
    matchingEnvelopes: Object.freeze(matchingEnvelopes),
    mismatchEnvelopes: Object.freeze(mismatchEnvelopes),
    matchingResults: Object.freeze(matchingResults),
    mismatchResults: Object.freeze(mismatchResults),
    controls,
    forbiddenTransportPaths: Object.freeze([...forbiddenTransportPaths])
  });
}

function assertPerRuleInvariant(ab, ba, fixtures) {
  for (const label of ['A', 'B']) {
    const ruleId = fixtures[label].spec.rule_id;
    if (canonicalFindingOrderSurfaceJson(ab.hosted[ruleId]) !== canonicalFindingOrderSurfaceJson(ba.hosted[ruleId])) {
      throw new Error(`${label} Hosted projection changed under packet permutation`);
    }
    if (canonicalFindingOrderSurfaceJson(ab.matchingEnvelopes[label]) !== canonicalFindingOrderSurfaceJson(ba.matchingEnvelopes[label])) {
      throw new Error(`${label} matching return envelope changed under packet permutation`);
    }
    if (canonicalFindingOrderSurfaceJson(ab.mismatchEnvelopes[label]) !== canonicalFindingOrderSurfaceJson(ba.mismatchEnvelopes[label])) {
      throw new Error(`${label} mismatch return envelope changed under packet permutation`);
    }
    if (canonicalFindingOrderSurfaceJson(ab.matchingResults[label]) !== canonicalFindingOrderSurfaceJson(ba.matchingResults[label])) {
      throw new Error(`${label} matching decision changed under packet permutation`);
    }
    if (canonicalFindingOrderSurfaceJson(ab.mismatchResults[label]) !== canonicalFindingOrderSurfaceJson(ba.mismatchResults[label])) {
      throw new Error(`${label} mismatch decision changed under packet permutation`);
    }
  }
}

export function runMarrowlineFindingOrderPermutationStabilityAssay() {
  const fixtures = buildFixtures();
  const cases = Object.freeze(Object.fromEntries(
    MARROWLINE_FINDING_ORDER_PERMUTATIONS.map(permutation => [permutation.id, buildPermutationCase(permutation, fixtures)])
  ));
  const ab = cases.P_AB;
  const ba = cases.P_BA;

  const abPacket = describeSurface(ab.packet);
  const baPacket = describeSurface(ba.packet);
  const abCarry = describeSurface(ab.carryCase);
  const baCarry = describeSurface(ba.carryCase);
  if (sameSurface(abPacket, baPacket)) throw new Error('Source packet permutation collapsed to one byte surface');
  if (sameSurface(abCarry, baCarry)) throw new Error('Carry Case permutation collapsed to one byte surface');

  assertPerRuleInvariant(ab, ba, fixtures);

  const slotZero = Object.freeze({
    P_AB: Object.freeze({
      rule_id: ab.carryCase.receipt.finding_rule_ids[0],
      hosted_surface: describeSurface(ab.carryCase.hosted_portable_findings[0])
    }),
    P_BA: Object.freeze({
      rule_id: ba.carryCase.receipt.finding_rule_ids[0],
      hosted_surface: describeSurface(ba.carryCase.hosted_portable_findings[0])
    })
  });
  if (slotZero.P_AB.rule_id === slotZero.P_BA.rule_id) throw new Error('slot 0 was incorrectly treated as invariant finding identity');
  if (sameSurface(slotZero.P_AB.hosted_surface, slotZero.P_BA.hosted_surface)) throw new Error('slot 0 Hosted surface failed to change identity across packet permutation');

  const perRule = {};
  for (const label of ['A', 'B']) {
    const ruleId = fixtures[label].spec.rule_id;
    perRule[label] = Object.freeze({
      rule_id: ruleId,
      hosted_surface: describeSurface(ab.hosted[ruleId]),
      matching_envelope: describeSurface(ab.matchingEnvelopes[label]),
      mismatch_envelope: describeSurface(ab.mismatchEnvelopes[label]),
      local_binding: describeSurface(fixtures[label].localBinding),
      matching_status: ab.matchingResults[label].status,
      mismatch_status: ab.mismatchResults[label].status,
      matching_result: describeSurface(ab.matchingResults[label]),
      mismatch_result: describeSurface(ab.mismatchResults[label])
    });
  }

  const caseReport = value => Object.freeze({
    permutation_id: value.permutation_id,
    order: value.order,
    finding_rule_ids: value.carryCase.receipt.finding_rule_ids,
    source_packet: describeSurface(value.packet),
    carry_case: describeSurface(value.carryCase),
    hosted_by_rule: Object.freeze(Object.fromEntries(Object.entries(value.hosted).map(([ruleId, hosted]) => [ruleId, describeSurface(hosted)]))),
    matching_envelopes: Object.freeze({ A: describeSurface(value.matchingEnvelopes.A), B: describeSurface(value.matchingEnvelopes.B) }),
    mismatch_envelopes: Object.freeze({ A: describeSurface(value.mismatchEnvelopes.A), B: describeSurface(value.mismatchEnvelopes.B) }),
    matching_statuses: Object.freeze({ A: value.matchingResults.A.status, B: value.matchingResults.B.status }),
    mismatch_statuses: Object.freeze({ A: value.mismatchResults.A.status, B: value.mismatchResults.B.status }),
    cross_bindings_rejected: value.controls.A_with_B_binding.rejected && value.controls.B_with_A_binding.rejected,
    forbidden_transport_paths: value.forbiddenTransportPaths,
    release_authority: value.carryCase.receipt.release_authority,
    human_closure_required: value.carryCase.receipt.human_closure_required,
    local_binding_carried: value.carryCase.receipt.local_binding_carried
  });

  return Object.freeze({
    schema: MARROWLINE_FINDING_ORDER_PERMUTATION_STABILITY_ASSAY_SCHEMA,
    status: 'PASS',
    assay_local_only: true,
    permutations: Object.freeze({ P_AB: caseReport(ab), P_BA: caseReport(ba) }),
    per_rule: Object.freeze(perRule),
    slot_zero: slotZero,
    source_packets_order_distinguishable: true,
    carry_cases_order_distinguishable: true,
    hosted_projection_rule_invariant: true,
    matching_envelope_rule_invariant: true,
    mismatch_envelope_rule_invariant: true,
    matching_decision_rule_invariant: true,
    mismatch_decision_rule_invariant: true,
    cross_bindings_rejected_both_permutations: true,
    slot_zero_identity_changes_with_permutation: true,
    hidden_permutation_state_carried: false,
    browser_persistence_required: false,
    authority: Object.freeze({
      release_authority: false,
      human_closure_required: true,
      provider_call_performed: false,
      production_mutation: false
    }),
    claim_ceiling: 'bounded-two-finding-two-permutation-rule-bound-stability-only',
    seal: '⟐'
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(`${JSON.stringify(runMarrowlineFindingOrderPermutationStabilityAssay(), null, 2)}\n`);
}
