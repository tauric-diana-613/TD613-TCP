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

export const MARROWLINE_CARTESIAN_FINDING_DECISION_SEPARABILITY_ASSAY_SCHEMA = 'td613.marrowline.cartesian-finding-decision-separability-assay/v0.1-local-only';

export const MARROWLINE_CARTESIAN_DECISION_VECTORS = Object.freeze([
  Object.freeze({
    id: 'MATCH_MATCH',
    action_mode: Object.freeze({ A: 'MATCH', B: 'MATCH' }),
    expected_status: Object.freeze({ A: 'PRESENT_TO_HUMAN', B: 'PRESENT_TO_HUMAN' })
  }),
  Object.freeze({
    id: 'MATCH_MISMATCH',
    action_mode: Object.freeze({ A: 'MATCH', B: 'MISMATCH' }),
    expected_status: Object.freeze({ A: 'PRESENT_TO_HUMAN', B: 'HOLD' })
  }),
  Object.freeze({
    id: 'MISMATCH_MATCH',
    action_mode: Object.freeze({ A: 'MISMATCH', B: 'MATCH' }),
    expected_status: Object.freeze({ A: 'HOLD', B: 'PRESENT_TO_HUMAN' })
  }),
  Object.freeze({
    id: 'MISMATCH_MISMATCH',
    action_mode: Object.freeze({ A: 'MISMATCH', B: 'MISMATCH' }),
    expected_status: Object.freeze({ A: 'HOLD', B: 'HOLD' })
  })
]);

const PRIMARY_VECTOR_ORDER = Object.freeze([
  'MATCH_MATCH',
  'MATCH_MISMATCH',
  'MISMATCH_MATCH',
  'MISMATCH_MISMATCH'
]);

const REPLAY_VECTOR_ORDER = Object.freeze([
  'MISMATCH_MISMATCH',
  'MISMATCH_MATCH',
  'MATCH_MISMATCH',
  'MATCH_MATCH'
]);

const FORBIDDEN_TRANSPORT_KEYS = Object.freeze(new Set([
  'status',
  'decision',
  'decision_state',
  'decision_matrix',
  'vector',
  'vector_id',
  'vector_index',
  'whole_case_status',
  'case_status',
  'shared_status',
  'quarantine',
  'quarantine_token',
  'sibling_status',
  'sibling_result',
  'sibling_action',
  'prior_vector',
  'previous_vector',
  'schedule',
  'schedule_index',
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

export function canonicalCartesianSurfaceJson(value) {
  return JSON.stringify(stable(value));
}

function describeSurface(value) {
  const json = canonicalCartesianSurfaceJson(value);
  return Object.freeze({
    sha256: crypto.createHash('sha256').update(json, 'utf8').digest('hex'),
    bytes: Buffer.byteLength(json, 'utf8')
  });
}

function collectForbiddenTransportKeys(value, path = 'transport', into = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectForbiddenTransportKeys(item, `${path}[${index}]`, into));
    return into;
  }
  if (!value || typeof value !== 'object') return into;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_TRANSPORT_KEYS.has(String(key).toLowerCase())) into.push(`${path}.${key}`);
    collectForbiddenTransportKeys(child, `${path}.${key}`, into);
  }
  return into;
}

function fixtureFor(spec) {
  const pocketProjection = compilePortableAiaProjection({ ruleId: spec.rule_id, routeMode: 'LOCAL_POCKET' });
  const hostedProjection = compilePortableAiaProjection({ ruleId: spec.rule_id, routeMode: 'TD613_HOSTED' });
  if (pocketProjection.invariant.action_class !== spec.matching_action) {
    throw new Error(`${spec.label} canonical action drifted from inherited multiplexed finding specification`);
  }
  const localBinding = compilePortableAiaLocalBinding(pocketProjection, {
    policyDigest: `sha256:${spec.policy_digest_hex.repeat(64)}`,
    sourceStateDigest: `sha256:${spec.source_digest_hex.repeat(64)}`
  });
  return Object.freeze({ spec, pocketProjection, hostedProjection, localBinding });
}

function buildSharedFixture() {
  const A = fixtureFor(MARROWLINE_MULTIPLEXED_FINDING_SPECS.A);
  const B = fixtureFor(MARROWLINE_MULTIPLEXED_FINDING_SPECS.B);
  const packet = Object.freeze({
    schema: LOCAL_POCKET_EXPORT_SCHEMA,
    portable_findings: Object.freeze([A.pocketProjection.portable_payload, B.pocketProjection.portable_payload]),
    release_authority: false,
    human_closure_required: true
  });
  const carryCase = buildMarrowlinePocketHostedCarryCase(packet);
  if (carryCase.receipt.finding_count !== 2) throw new Error(`Cartesian shared Carry Case finding_count drifted: ${carryCase.receipt.finding_count}`);
  if (JSON.stringify(carryCase.receipt.finding_rule_ids) !== JSON.stringify(['EMAIL_IDENTIFIER', 'USER_DECLARED_PROTECTED_TERM'])) {
    throw new Error(`Cartesian shared Carry Case rule order drifted: ${JSON.stringify(carryCase.receipt.finding_rule_ids)}`);
  }
  if (carryCase.receipt.local_binding_carried !== false || carryCase.receipt.release_authority !== false || carryCase.receipt.human_closure_required !== true) {
    throw new Error('Cartesian shared Carry Case widened authority or transported local binding');
  }
  if (canonicalCartesianSurfaceJson(carryCase.hosted_portable_findings[0]) !== canonicalCartesianSurfaceJson(A.hostedProjection.portable_payload)) {
    throw new Error('Cartesian Hosted A projection drifted');
  }
  if (canonicalCartesianSurfaceJson(carryCase.hosted_portable_findings[1]) !== canonicalCartesianSurfaceJson(B.hostedProjection.portable_payload)) {
    throw new Error('Cartesian Hosted B projection drifted');
  }
  return Object.freeze({ A, B, packet, carryCase });
}

function vectorById(id) {
  const vector = MARROWLINE_CARTESIAN_DECISION_VECTORS.find(candidate => candidate.id === id);
  if (!vector) throw new Error(`Unknown Cartesian vector: ${id}`);
  return vector;
}

function buildEnvelope(shared, label, actionMode) {
  const finding = shared[label];
  const claimedActionClass = actionMode === 'MATCH' ? finding.spec.matching_action : finding.spec.mismatch_action;
  return buildMarrowlineReturnEnvelope(shared.carryCase, {
    ruleId: finding.spec.rule_id,
    claimedActionClass
  });
}

function executeVector(shared, vector, executionOrder) {
  const beforeCarry = describeSurface(shared.carryCase);
  const envelopes = Object.freeze({
    A: buildEnvelope(shared, 'A', vector.action_mode.A),
    B: buildEnvelope(shared, 'B', vector.action_mode.B)
  });
  const envelopeBefore = Object.freeze({ A: describeSurface(envelopes.A), B: describeSurface(envelopes.B) });
  const results = {};

  for (const label of executionOrder) {
    results[label] = revalidateMarrowlineReturn(shared.carryCase, shared[label].localBinding, envelopes[label]);
  }

  const afterCarry = describeSurface(shared.carryCase);
  const envelopeAfter = Object.freeze({ A: describeSurface(envelopes.A), B: describeSurface(envelopes.B) });
  if (beforeCarry.sha256 !== afterCarry.sha256 || beforeCarry.bytes !== afterCarry.bytes) {
    throw new Error(`${vector.id} mutated the shared Carry Case`);
  }

  for (const label of ['A', 'B']) {
    if (envelopeBefore[label].sha256 !== envelopeAfter[label].sha256 || envelopeBefore[label].bytes !== envelopeAfter[label].bytes) {
      throw new Error(`${vector.id} mutated ${label} return envelope`);
    }
    if (results[label].status !== vector.expected_status[label]) {
      throw new Error(`${vector.id} ${label} expected ${vector.expected_status[label]} observed ${results[label].status}`);
    }
    if (results[label].candidate_trusted !== false || results[label].release_authority !== false ||
        results[label].human_closure_required !== true || results[label].local_binding_retained !== true) {
      throw new Error(`${vector.id} ${label} widened authority or lost local binding retention`);
    }
  }

  return Object.freeze({
    vector_id: vector.id,
    assay_local_only: true,
    execution_order: Object.freeze([...executionOrder]),
    action_mode: vector.action_mode,
    statuses: Object.freeze({ A: results.A.status, B: results.B.status }),
    expected_statuses: vector.expected_status,
    carry_case_unchanged: true,
    envelopes_unchanged: true,
    envelope_surfaces: envelopeBefore,
    authority_closed: true
  });
}

function runSchedule(shared, vectorOrder, reverseFindingOrder) {
  return Object.freeze(vectorOrder.map((id, index) => {
    const executionOrder = ((index % 2 === 0) !== reverseFindingOrder) ? ['A', 'B'] : ['B', 'A'];
    return executeVector(shared, vectorById(id), executionOrder);
  }));
}

function keyedVectors(vectors) {
  return Object.fromEntries(vectors.map(vector => [vector.vector_id, vector]));
}

function wrongBindingControl(shared, envelope, wrongBinding, label) {
  try {
    revalidateMarrowlineReturn(shared.carryCase, wrongBinding, envelope);
  } catch (error) {
    if (!(error instanceof TypeError) || !/local binding does not match portable projection/.test(String(error.message || ''))) throw error;
    return Object.freeze({ label, rejected: true, error: error.message });
  }
  throw new Error(`${label} wrong-rule local binding was accepted`);
}

function assertCoordinateSensitivity(primaryById) {
  const mm = primaryById.MATCH_MATCH.statuses;
  const mx = primaryById.MATCH_MISMATCH.statuses;
  const xm = primaryById.MISMATCH_MATCH.statuses;
  const xx = primaryById.MISMATCH_MISMATCH.statuses;

  const checks = Object.freeze({
    A_match_B_changes_only_B: mm.A === mx.A && mm.B !== mx.B,
    A_mismatch_B_changes_only_B: xm.A === xx.A && xm.B !== xx.B,
    B_match_A_changes_only_A: mm.B === xm.B && mm.A !== xm.A,
    B_mismatch_A_changes_only_A: mx.B === xx.B && mx.A !== xx.A
  });
  if (!Object.values(checks).every(Boolean)) {
    throw new Error(`Cartesian coordinate sensitivity collapsed: ${JSON.stringify(checks)}`);
  }
  return checks;
}

export function runMarrowlineCartesianFindingDecisionSeparabilityAssay() {
  const shared = buildSharedFixture();
  const carryCaseSurface = describeSurface(shared.carryCase);
  const transport = Object.freeze({ source_packet: shared.packet, carry_case: shared.carryCase });
  const forbiddenPaths = collectForbiddenTransportKeys(transport);
  const transportJson = canonicalCartesianSurfaceJson(transport);
  if (forbiddenPaths.length > 0) throw new Error(`Cartesian transport accumulated decision/vector/history state: ${forbiddenPaths.join(', ')}`);
  if (/sha256:/i.test(transportJson)) throw new Error('Cartesian transport accumulated a digest carrier');

  const primary = runSchedule(shared, PRIMARY_VECTOR_ORDER, false);
  const replay = runSchedule(shared, REPLAY_VECTOR_ORDER, true);
  const primaryById = keyedVectors(primary);
  const replayById = keyedVectors(replay);

  for (const vector of MARROWLINE_CARTESIAN_DECISION_VECTORS) {
    const first = primaryById[vector.id];
    const second = replayById[vector.id];
    if (!first || !second) throw new Error(`Cartesian schedule omitted vector ${vector.id}`);
    if (canonicalCartesianSurfaceJson(first.statuses) !== canonicalCartesianSurfaceJson(second.statuses)) {
      throw new Error(`${vector.id} status vector changed under replay order`);
    }
    if (canonicalCartesianSurfaceJson(first.envelope_surfaces) !== canonicalCartesianSurfaceJson(second.envelope_surfaces)) {
      throw new Error(`${vector.id} return-envelope surfaces changed under replay order`);
    }
  }

  const sensitivity = assertCoordinateSensitivity(primaryById);
  const canonicalMatchA = buildEnvelope(shared, 'A', 'MATCH');
  const canonicalMatchB = buildEnvelope(shared, 'B', 'MATCH');
  const controls = Object.freeze({
    A_with_B_binding: wrongBindingControl(shared, canonicalMatchA, shared.B.localBinding, 'A_with_B_binding'),
    B_with_A_binding: wrongBindingControl(shared, canonicalMatchB, shared.A.localBinding, 'B_with_A_binding')
  });

  const finalCarryCaseSurface = describeSurface(shared.carryCase);
  if (canonicalCartesianSurfaceJson(carryCaseSurface) !== canonicalCartesianSurfaceJson(finalCarryCaseSurface)) {
    throw new Error('Cartesian schedules or controls mutated the shared Carry Case');
  }

  return Object.freeze({
    schema: MARROWLINE_CARTESIAN_FINDING_DECISION_SEPARABILITY_ASSAY_SCHEMA,
    status: 'PASS',
    assay_local_only: true,
    shared_case: Object.freeze({
      finding_count: shared.carryCase.receipt.finding_count,
      finding_rule_ids: shared.carryCase.receipt.finding_rule_ids,
      source_packet: describeSurface(shared.packet),
      carry_case: carryCaseSurface,
      hosted_findings: Object.freeze({
        A: describeSurface(shared.carryCase.hosted_portable_findings[0]),
        B: describeSurface(shared.carryCase.hosted_portable_findings[1])
      }),
      hosted_findings_distinguishable: canonicalCartesianSurfaceJson(shared.carryCase.hosted_portable_findings[0]) !== canonicalCartesianSurfaceJson(shared.carryCase.hosted_portable_findings[1]),
      local_binding_carried: shared.carryCase.receipt.local_binding_carried,
      release_authority: shared.carryCase.receipt.release_authority,
      human_closure_required: shared.carryCase.receipt.human_closure_required,
      forbidden_transport_paths: Object.freeze([...forbiddenPaths])
    }),
    primary_schedule: primary,
    replay_schedule: replay,
    coordinate_sensitivity: sensitivity,
    controls,
    all_four_cartesian_corners_observed: true,
    per_finding_coordinate_separable: true,
    shared_carry_case_unchanged: true,
    replay_order_invariant: true,
    wrong_rule_binding_rejected: true,
    whole_case_status_carried: false,
    portable_vector_state_carried: false,
    sibling_result_carried: false,
    browser_persistence_required: false,
    authority: Object.freeze({
      release_authority: false,
      human_closure_required: true,
      provider_call_performed: false,
      production_mutation: false
    }),
    claim_ceiling: 'bounded-two-finding-one-carry-case-four-corner-cartesian-decision-separability-only',
    seal: '⟐'
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(`${JSON.stringify(runMarrowlineCartesianFindingDecisionSeparabilityAssay(), null, 2)}\n`);
}
