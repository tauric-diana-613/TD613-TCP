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

export const MARROWLINE_PACKET_POPULATION_STABILITY_ASSAY_SCHEMA =
  'td613.marrowline.packet-population-stability-assay/v0.1-local-only';

export const MARROWLINE_PACKET_POPULATIONS = Object.freeze([
  Object.freeze({ id: 'P_A', members: Object.freeze(['A']) }),
  Object.freeze({ id: 'P_B', members: Object.freeze(['B']) }),
  Object.freeze({ id: 'P_AB', members: Object.freeze(['A', 'B']) })
]);

const FORBIDDEN_POPULATION_TRANSPORT_KEYS = Object.freeze(new Set([
  'sibling_present',
  'sibling_presence',
  'population',
  'population_id',
  'population_history',
  'membership_history',
  'removed_member',
  'removed_member_id',
  'prior_cardinality',
  'previous_cardinality',
  'packet_ancestry',
  'slot',
  'slot_index',
  'slot_to_rule',
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
  return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
}

export function canonicalPacketPopulationSurfaceJson(value) {
  return JSON.stringify(stable(value));
}

function describeSurface(value) {
  const json = canonicalPacketPopulationSurfaceJson(value);
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
    if (FORBIDDEN_POPULATION_TRANSPORT_KEYS.has(String(key).toLowerCase())) into.push(`${path}.${key}`);
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

function hostedByRule(carryCase) {
  return Object.freeze(Object.fromEntries(
    carryCase.receipt.finding_rule_ids.map((ruleId, index) => [ruleId, carryCase.hosted_portable_findings[index]])
  ));
}

function expectAbsentSiblingRejection(carryCase, fixture, label) {
  try {
    buildMarrowlineReturnEnvelope(carryCase, {
      ruleId: fixture.spec.rule_id,
      claimedActionClass: fixture.spec.matching_action
    });
  } catch (error) {
    if (!(error instanceof TypeError) || !/not carried into Hosted AIA/.test(String(error.message || ''))) throw error;
    return Object.freeze({ label, rejected: true, error: error.message });
  }
  throw new Error(`${label} absent sibling was accepted into return construction`);
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

function buildPopulationCase(population, fixtures) {
  const portableFindings = population.members.map(label => fixtures[label].pocketProjection.portable_payload);
  const packet = Object.freeze({
    schema: LOCAL_POCKET_EXPORT_SCHEMA,
    portable_findings: Object.freeze(portableFindings),
    release_authority: false,
    human_closure_required: true
  });
  const carryCase = buildMarrowlinePocketHostedCarryCase(packet);
  const expectedRuleIds = population.members.map(label => fixtures[label].spec.rule_id);

  if (canonicalPacketPopulationSurfaceJson(carryCase.receipt.finding_rule_ids) !==
      canonicalPacketPopulationSurfaceJson(expectedRuleIds)) {
    throw new Error(`${population.id} carried unexpected finding membership`);
  }
  if (carryCase.receipt.finding_count !== population.members.length ||
      carryCase.hosted_portable_findings.length !== population.members.length) {
    throw new Error(`${population.id} finding_count drifted`);
  }

  const hosted = hostedByRule(carryCase);
  const matchingEnvelopes = {};
  const mismatchEnvelopes = {};
  const matchingResults = {};
  const mismatchResults = {};

  for (const label of population.members) {
    const fixture = fixtures[label];
    if (canonicalPacketPopulationSurfaceJson(hosted[fixture.spec.rule_id]) !==
        canonicalPacketPopulationSurfaceJson(fixture.hostedProjection.portable_payload)) {
      throw new Error(`${population.id} Hosted projection drifted for ${label}`);
    }

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
      throw new Error(`${population.id} ${label} matching decision drifted: ${matchingResults[label].status}`);
    }
    if (mismatchResults[label].status !== 'HOLD') {
      throw new Error(`${population.id} ${label} mismatch decision drifted: ${mismatchResults[label].status}`);
    }
  }

  let absentSibling = null;
  let recovery = null;
  if (population.members.length === 1) {
    const present = population.members[0];
    const absent = present === 'A' ? 'B' : 'A';
    absentSibling = expectAbsentSiblingRejection(carryCase, fixtures[absent], `${population.id}:${absent}_absent`);
    const replayEnvelope = buildMarrowlineReturnEnvelope(carryCase, {
      ruleId: fixtures[present].spec.rule_id,
      claimedActionClass: fixtures[present].spec.matching_action
    });
    const replayResult = revalidateMarrowlineReturn(carryCase, fixtures[present].localBinding, replayEnvelope);
    if (canonicalPacketPopulationSurfaceJson(replayEnvelope) !==
        canonicalPacketPopulationSurfaceJson(matchingEnvelopes[present])) {
      throw new Error(`${population.id} absent-sibling rejection poisoned lawful return envelope`);
    }
    if (canonicalPacketPopulationSurfaceJson(replayResult) !==
        canonicalPacketPopulationSurfaceJson(matchingResults[present])) {
      throw new Error(`${population.id} absent-sibling rejection poisoned lawful revalidation`);
    }
    recovery = Object.freeze({
      present,
      envelope_unchanged: true,
      result_unchanged: true,
      status: replayResult.status
    });
  }

  let crossBindingsRejected = null;
  if (population.id === 'P_AB') {
    crossBindingsRejected = Object.freeze({
      A_with_B_binding: expectCrossBindingRejection(
        carryCase, fixtures.B.localBinding, matchingEnvelopes.A, 'P_AB:A_with_B_binding'
      ),
      B_with_A_binding: expectCrossBindingRejection(
        carryCase, fixtures.A.localBinding, matchingEnvelopes.B, 'P_AB:B_with_A_binding'
      )
    });
  }

  const transport = Object.freeze({ source_packet: packet, carry_case: carryCase });
  const forbiddenTransportPaths = collectForbiddenTransportKeys(transport);
  if (forbiddenTransportPaths.length > 0) {
    throw new Error(`${population.id} transport accumulated population history: ${forbiddenTransportPaths.join(', ')}`);
  }
  if (/sha256:/i.test(canonicalPacketPopulationSurfaceJson(transport))) {
    throw new Error(`${population.id} transport accumulated a digest carrier`);
  }

  return Object.freeze({
    population_id: population.id,
    members: population.members,
    packet,
    carryCase,
    hosted,
    matchingEnvelopes: Object.freeze(matchingEnvelopes),
    mismatchEnvelopes: Object.freeze(mismatchEnvelopes),
    matchingResults: Object.freeze(matchingResults),
    mismatchResults: Object.freeze(mismatchResults),
    absentSibling,
    recovery,
    crossBindingsRejected,
    forbiddenTransportPaths: Object.freeze([...forbiddenTransportPaths])
  });
}

function assertPerRulePopulationInvariant(singletonCase, pairCase, label, fixtures) {
  const ruleId = fixtures[label].spec.rule_id;
  for (const [surfaceName, singletonValue, pairValue] of [
    ['Hosted projection', singletonCase.hosted[ruleId], pairCase.hosted[ruleId]],
    ['matching envelope', singletonCase.matchingEnvelopes[label], pairCase.matchingEnvelopes[label]],
    ['mismatch envelope', singletonCase.mismatchEnvelopes[label], pairCase.mismatchEnvelopes[label]],
    ['matching result', singletonCase.matchingResults[label], pairCase.matchingResults[label]],
    ['mismatch result', singletonCase.mismatchResults[label], pairCase.mismatchResults[label]]
  ]) {
    if (canonicalPacketPopulationSurfaceJson(singletonValue) !== canonicalPacketPopulationSurfaceJson(pairValue)) {
      throw new Error(`${label} ${surfaceName} changed with sibling presence`);
    }
  }
}

export function runMarrowlinePacketPopulationStabilityAssay() {
  const fixtures = buildFixtures();
  const populations = Object.freeze(Object.fromEntries(
    MARROWLINE_PACKET_POPULATIONS.map(population => [
      population.id,
      buildPopulationCase(population, fixtures)
    ])
  ));

  const a = populations.P_A;
  const b = populations.P_B;
  const ab = populations.P_AB;

  for (const [singletonId, singleton] of [['P_A', a], ['P_B', b]]) {
    if (sameSurface(describeSurface(singleton.packet), describeSurface(ab.packet))) {
      throw new Error(`${singletonId} source packet collapsed with P_AB`);
    }
    if (sameSurface(describeSurface(singleton.carryCase), describeSurface(ab.carryCase))) {
      throw new Error(`${singletonId} Carry Case collapsed with P_AB`);
    }
  }

  assertPerRulePopulationInvariant(a, ab, 'A', fixtures);
  assertPerRulePopulationInvariant(b, ab, 'B', fixtures);

  if (!a.absentSibling?.rejected || !b.absentSibling?.rejected) {
    throw new Error('Absent sibling rejection did not close');
  }
  if (!a.recovery?.envelope_unchanged || !a.recovery?.result_unchanged ||
      !b.recovery?.envelope_unchanged || !b.recovery?.result_unchanged) {
    throw new Error('Absent-sibling rejection poisoned lawful present-finding recovery');
  }

  const caseReport = value => Object.freeze({
    population_id: value.population_id,
    members: value.members,
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
    matching_statuses: Object.freeze(Object.fromEntries(
      Object.entries(value.matchingResults).map(([label, result]) => [label, result.status])
    )),
    mismatch_statuses: Object.freeze(Object.fromEntries(
      Object.entries(value.mismatchResults).map(([label, result]) => [label, result.status])
    )),
    absent_sibling_rejected: value.absentSibling?.rejected ?? null,
    absent_sibling_error: value.absentSibling?.error ?? null,
    recovery: value.recovery,
    cross_bindings_rejected: value.crossBindingsRejected
      ? value.crossBindingsRejected.A_with_B_binding.rejected && value.crossBindingsRejected.B_with_A_binding.rejected
      : null,
    forbidden_transport_paths: value.forbiddenTransportPaths,
    release_authority: value.carryCase.receipt.release_authority,
    human_closure_required: value.carryCase.receipt.human_closure_required,
    local_binding_carried: value.carryCase.receipt.local_binding_carried
  });

  const perRule = Object.freeze({
    A: Object.freeze({
      rule_id: fixtures.A.spec.rule_id,
      hosted_surface: describeSurface(a.hosted[fixtures.A.spec.rule_id]),
      matching_envelope: describeSurface(a.matchingEnvelopes.A),
      mismatch_envelope: describeSurface(a.mismatchEnvelopes.A),
      local_binding: describeSurface(fixtures.A.localBinding),
      matching_result: describeSurface(a.matchingResults.A),
      mismatch_result: describeSurface(a.mismatchResults.A)
    }),
    B: Object.freeze({
      rule_id: fixtures.B.spec.rule_id,
      hosted_surface: describeSurface(b.hosted[fixtures.B.spec.rule_id]),
      matching_envelope: describeSurface(b.matchingEnvelopes.B),
      mismatch_envelope: describeSurface(b.mismatchEnvelopes.B),
      local_binding: describeSurface(fixtures.B.localBinding),
      matching_result: describeSurface(b.matchingResults.B),
      mismatch_result: describeSurface(b.mismatchResults.B)
    })
  });

  return Object.freeze({
    schema: MARROWLINE_PACKET_POPULATION_STABILITY_ASSAY_SCHEMA,
    status: 'PASS',
    assay_local_only: true,
    populations: Object.freeze({
      P_A: caseReport(a),
      P_B: caseReport(b),
      P_AB: caseReport(ab)
    }),
    per_rule: perRule,
    source_packets_population_distinguishable: true,
    carry_cases_population_distinguishable: true,
    hosted_projection_population_invariant: true,
    matching_envelope_population_invariant: true,
    mismatch_envelope_population_invariant: true,
    matching_decision_population_invariant: true,
    mismatch_decision_population_invariant: true,
    absent_sibling_rejected: true,
    absent_sibling_rejection_nonpoisoning: true,
    cross_bindings_rejected_pair: true,
    hidden_population_state_carried: false,
    browser_persistence_required: false,
    authority: Object.freeze({
      release_authority: false,
      human_closure_required: true,
      provider_call_performed: false,
      production_mutation: false
    }),
    claim_ceiling: 'bounded-two-rule-singleton-pair-packet-population-stability-only',
    seal: '⟐'
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(`${JSON.stringify(runMarrowlinePacketPopulationStabilityAssay(), null, 2)}\n`);
}
