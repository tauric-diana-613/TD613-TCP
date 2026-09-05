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

export const MARROWLINE_CROSS_BINDING_REJECTION_NONPOISONING_ASSAY_SCHEMA = 'td613.marrowline.cross-binding-rejection-nonpoisoning-assay/v0.1-local-only';

export const MARROWLINE_CROSS_BINDING_HOSTILE_SCHEDULES = Object.freeze([
  Object.freeze({ id: 'A_REJECT_THEN_A_B', attack: 'A', wrong_binding: 'B', recovery_order: Object.freeze(['A', 'B']) }),
  Object.freeze({ id: 'B_REJECT_THEN_B_A', attack: 'B', wrong_binding: 'A', recovery_order: Object.freeze(['B', 'A']) }),
  Object.freeze({ id: 'A_REJECT_THEN_B_A', attack: 'A', wrong_binding: 'B', recovery_order: Object.freeze(['B', 'A']) }),
  Object.freeze({ id: 'B_REJECT_THEN_A_B', attack: 'B', wrong_binding: 'A', recovery_order: Object.freeze(['A', 'B']) })
]);

const REPLAY_SCHEDULE_ORDER = Object.freeze([
  'B_REJECT_THEN_A_B',
  'A_REJECT_THEN_B_A',
  'B_REJECT_THEN_B_A',
  'A_REJECT_THEN_A_B'
]);

const FORBIDDEN_TRANSPORT_KEYS = Object.freeze(new Set([
  'failure_count',
  'attack_index',
  'attack_id',
  'rejected_binding',
  'rejected_binding_identity',
  'prior_failure',
  'previous_failure',
  'poison',
  'poison_marker',
  'quarantine',
  'quarantine_token',
  'sibling_result',
  'route_history',
  'retry_token',
  'receipt_chain',
  'nonce',
  'timestamp',
  'history'
]));

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

export function canonicalCrossBindingSurfaceJson(value) {
  return JSON.stringify(stable(value));
}

function describeSurface(value) {
  const json = canonicalCrossBindingSurfaceJson(value);
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
  if (carryCase.receipt.finding_count !== 2) throw new Error(`Cross-binding shared Carry Case finding_count drifted: ${carryCase.receipt.finding_count}`);
  if (JSON.stringify(carryCase.receipt.finding_rule_ids) !== JSON.stringify(['EMAIL_IDENTIFIER', 'USER_DECLARED_PROTECTED_TERM'])) {
    throw new Error(`Cross-binding shared Carry Case rule order drifted: ${JSON.stringify(carryCase.receipt.finding_rule_ids)}`);
  }
  const envelopes = Object.freeze({
    A: buildMarrowlineReturnEnvelope(carryCase, { ruleId: A.spec.rule_id, claimedActionClass: A.spec.matching_action }),
    B: buildMarrowlineReturnEnvelope(carryCase, { ruleId: B.spec.rule_id, claimedActionClass: B.spec.matching_action })
  });
  const baseline = Object.freeze({
    A: revalidateMarrowlineReturn(carryCase, A.localBinding, envelopes.A),
    B: revalidateMarrowlineReturn(carryCase, B.localBinding, envelopes.B)
  });
  for (const label of ['A', 'B']) {
    if (baseline[label].status !== 'PRESENT_TO_HUMAN' || baseline[label].candidate_trusted !== false ||
        baseline[label].release_authority !== false || baseline[label].human_closure_required !== true ||
        baseline[label].local_binding_retained !== true) {
      throw new Error(`Cross-binding baseline ${label} widened authority or failed matching revalidation`);
    }
  }
  return Object.freeze({ A, B, packet, carryCase, envelopes, baseline });
}

function snapshot(shared) {
  return Object.freeze({
    carry_case: describeSurface(shared.carryCase),
    local_bindings: Object.freeze({ A: describeSurface(shared.A.localBinding), B: describeSurface(shared.B.localBinding) }),
    envelopes: Object.freeze({ A: describeSurface(shared.envelopes.A), B: describeSurface(shared.envelopes.B) })
  });
}

function assertSnapshotSame(before, after, label) {
  if (!sameSurface(before.carry_case, after.carry_case)) throw new Error(`${label} mutated shared Carry Case`);
  for (const finding of ['A', 'B']) {
    if (!sameSurface(before.local_bindings[finding], after.local_bindings[finding])) throw new Error(`${label} mutated ${finding} local binding`);
    if (!sameSurface(before.envelopes[finding], after.envelopes[finding])) throw new Error(`${label} mutated ${finding} canonical return envelope`);
  }
}

function expectCrossBindingRejection(shared, attack, wrongBinding) {
  try {
    revalidateMarrowlineReturn(shared.carryCase, shared[wrongBinding].localBinding, shared.envelopes[attack]);
  } catch (error) {
    if (!(error instanceof TypeError) || !/local binding does not match portable projection/.test(String(error.message || ''))) throw error;
    return Object.freeze({ rejected: true, error: error.message });
  }
  throw new Error(`${attack} with ${wrongBinding} local binding was accepted`);
}

function executeHostileSchedule(shared, schedule) {
  const before = snapshot(shared);
  const rejection = expectCrossBindingRejection(shared, schedule.attack, schedule.wrong_binding);
  const afterRejection = snapshot(shared);
  assertSnapshotSame(before, afterRejection, `${schedule.id} rejected crossing`);

  const recovery = {};
  for (const label of schedule.recovery_order) {
    recovery[label] = revalidateMarrowlineReturn(shared.carryCase, shared[label].localBinding, shared.envelopes[label]);
    if (canonicalCrossBindingSurfaceJson(recovery[label]) !== canonicalCrossBindingSurfaceJson(shared.baseline[label])) {
      throw new Error(`${schedule.id} poisoned lawful ${label} revalidation after rejected crossing`);
    }
  }

  const afterRecovery = snapshot(shared);
  assertSnapshotSame(before, afterRecovery, `${schedule.id} recovery`);

  const sibling = schedule.attack === 'A' ? 'B' : 'A';
  if (canonicalCrossBindingSurfaceJson(recovery[sibling]) !== canonicalCrossBindingSurfaceJson(shared.baseline[sibling])) {
    throw new Error(`${schedule.id} poisoned untouched sibling ${sibling}`);
  }

  return Object.freeze({
    schedule_id: schedule.id,
    assay_local_only: true,
    attack: schedule.attack,
    wrong_binding: schedule.wrong_binding,
    rejected: rejection.rejected,
    rejection_error: rejection.error,
    recovery_order: schedule.recovery_order,
    recovery_statuses: Object.freeze({ A: recovery.A.status, B: recovery.B.status }),
    carry_case_unchanged: true,
    local_bindings_unchanged: true,
    canonical_envelopes_unchanged: true,
    attacked_finding_recovered_to_baseline: canonicalCrossBindingSurfaceJson(recovery[schedule.attack]) === canonicalCrossBindingSurfaceJson(shared.baseline[schedule.attack]),
    sibling_unpoisoned: canonicalCrossBindingSurfaceJson(recovery[sibling]) === canonicalCrossBindingSurfaceJson(shared.baseline[sibling]),
    authority_closed: true
  });
}

function scheduleById(id) {
  const found = MARROWLINE_CROSS_BINDING_HOSTILE_SCHEDULES.find(item => item.id === id);
  if (!found) throw new Error(`Unknown cross-binding hostile schedule: ${id}`);
  return found;
}

function keyedSchedules(items) {
  return Object.fromEntries(items.map(item => [item.schedule_id, item]));
}

export function runMarrowlineCrossBindingRejectionNonpoisoningAssay() {
  const shared = buildSharedFixture();
  const transport = Object.freeze({ source_packet: shared.packet, carry_case: shared.carryCase });
  const forbiddenTransportPaths = collectForbiddenTransportKeys(transport);
  if (forbiddenTransportPaths.length > 0) {
    throw new Error(`Cross-binding transport accumulated failure/history state: ${forbiddenTransportPaths.join(', ')}`);
  }
  if (/sha256:/i.test(canonicalCrossBindingSurfaceJson(transport))) {
    throw new Error('Cross-binding transport accumulated a digest carrier');
  }

  const initial = snapshot(shared);
  const primary = Object.freeze(MARROWLINE_CROSS_BINDING_HOSTILE_SCHEDULES.map(schedule => executeHostileSchedule(shared, schedule)));
  const replay = Object.freeze(REPLAY_SCHEDULE_ORDER.map(id => executeHostileSchedule(shared, scheduleById(id))));
  const primaryById = keyedSchedules(primary);
  const replayById = keyedSchedules(replay);

  for (const schedule of MARROWLINE_CROSS_BINDING_HOSTILE_SCHEDULES) {
    const first = primaryById[schedule.id];
    const second = replayById[schedule.id];
    if (!first || !second) throw new Error(`Cross-binding replay omitted schedule ${schedule.id}`);
    const comparable = value => Object.freeze({
      rejected: value.rejected,
      recovery_statuses: value.recovery_statuses,
      attacked_finding_recovered_to_baseline: value.attacked_finding_recovered_to_baseline,
      sibling_unpoisoned: value.sibling_unpoisoned,
      carry_case_unchanged: value.carry_case_unchanged,
      local_bindings_unchanged: value.local_bindings_unchanged,
      canonical_envelopes_unchanged: value.canonical_envelopes_unchanged
    });
    if (canonicalCrossBindingSurfaceJson(comparable(first)) !== canonicalCrossBindingSurfaceJson(comparable(second))) {
      throw new Error(`${schedule.id} changed under reversed schedule replay`);
    }
  }

  const final = snapshot(shared);
  assertSnapshotSame(initial, final, 'Cross-binding full assay');

  return Object.freeze({
    schema: MARROWLINE_CROSS_BINDING_REJECTION_NONPOISONING_ASSAY_SCHEMA,
    status: 'PASS',
    assay_local_only: true,
    shared_case: Object.freeze({
      finding_count: shared.carryCase.receipt.finding_count,
      finding_rule_ids: shared.carryCase.receipt.finding_rule_ids,
      source_packet: describeSurface(shared.packet),
      carry_case: initial.carry_case,
      local_bindings: initial.local_bindings,
      canonical_envelopes: initial.envelopes,
      hosted_findings: Object.freeze({
        A: describeSurface(shared.carryCase.hosted_portable_findings[0]),
        B: describeSurface(shared.carryCase.hosted_portable_findings[1])
      }),
      local_binding_carried: shared.carryCase.receipt.local_binding_carried,
      release_authority: shared.carryCase.receipt.release_authority,
      human_closure_required: shared.carryCase.receipt.human_closure_required,
      forbidden_transport_paths: Object.freeze([...forbiddenTransportPaths])
    }),
    baseline: Object.freeze({ A: shared.baseline.A, B: shared.baseline.B }),
    primary_schedules: primary,
    replay_schedules: replay,
    cross_bindings_rejected: true,
    carry_case_unchanged_after_rejection: true,
    local_bindings_unchanged_after_rejection: true,
    canonical_envelopes_unchanged_after_rejection: true,
    attacked_findings_recover_to_baseline: primary.every(item => item.attacked_finding_recovered_to_baseline),
    siblings_unpoisoned: primary.every(item => item.sibling_unpoisoned),
    replay_order_invariant: true,
    portable_failure_state_carried: false,
    browser_persistence_required: false,
    authority: Object.freeze({
      release_authority: false,
      human_closure_required: true,
      provider_call_performed: false,
      production_mutation: false
    }),
    claim_ceiling: 'bounded-two-finding-sequential-cross-binding-rejection-nonpoisoning-only',
    seal: '⟐'
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(`${JSON.stringify(runMarrowlineCrossBindingRejectionNonpoisoningAssay(), null, 2)}\n`);
}
