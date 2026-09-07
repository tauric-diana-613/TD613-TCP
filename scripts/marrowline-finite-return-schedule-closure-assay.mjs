import crypto from 'node:crypto';

import { LOCAL_POCKET_EXPORT_SCHEMA } from '../app/dome-world/holonomy-loom-local-pocket-policy.js';
import {
  buildMarrowlinePocketHostedCarryCase,
  buildMarrowlineReturnEnvelope,
  revalidateMarrowlineReturn
} from '../app/dome-world/marrowline-pocket-hosted-carry-case.js';
import {
  compilePortableAiaLocalBinding,
  compilePortableAiaProjection
} from '../app/dome-world/portable-aia-three-route-invariance.js';
import { MARROWLINE_MULTIPLEXED_FINDING_SPECS } from './marrowline-multiplexed-finding-isolation-assay.mjs';
import { runMarrowlineDuplicatePositionPermutationClosureAssay } from './marrowline-duplicate-position-permutation-closure-assay.mjs';

export const MARROWLINE_FINITE_RETURN_SCHEDULE_CLOSURE_ASSAY_SCHEMA =
  'td613.marrowline.finite-return-schedule-closure-assay/v0.2-local-only';

export const MARROWLINE_FINITE_RETURN_SCHEDULES = Object.freeze([
  Object.freeze({
    id: 'AB',
    steps: Object.freeze([
      Object.freeze({ label: 'A', mode: 'MATCH' }),
      Object.freeze({ label: 'B', mode: 'MATCH' })
    ])
  }),
  Object.freeze({
    id: 'BA',
    steps: Object.freeze([
      Object.freeze({ label: 'B', mode: 'MATCH' }),
      Object.freeze({ label: 'A', mode: 'MATCH' })
    ])
  }),
  Object.freeze({
    id: 'A_ONLY',
    steps: Object.freeze([Object.freeze({ label: 'A', mode: 'MATCH' })]),
    omitted_sibling: 'B'
  }),
  Object.freeze({
    id: 'B_ONLY',
    steps: Object.freeze([Object.freeze({ label: 'B', mode: 'MATCH' })]),
    omitted_sibling: 'A'
  }),
  Object.freeze({
    id: 'AAB',
    steps: Object.freeze([
      Object.freeze({ label: 'A', mode: 'MATCH' }),
      Object.freeze({ label: 'A', mode: 'MATCH' }),
      Object.freeze({ label: 'B', mode: 'MATCH' })
    ]),
    repeated_label: 'A'
  }),
  Object.freeze({
    id: 'BBA',
    steps: Object.freeze([
      Object.freeze({ label: 'B', mode: 'MATCH' }),
      Object.freeze({ label: 'B', mode: 'MATCH' }),
      Object.freeze({ label: 'A', mode: 'MATCH' })
    ]),
    repeated_label: 'B'
  }),
  Object.freeze({
    id: 'A_HOLD_B',
    steps: Object.freeze([
      Object.freeze({ label: 'A', mode: 'MISMATCH' }),
      Object.freeze({ label: 'B', mode: 'MATCH' })
    ]),
    hold_label: 'A',
    protected_sibling: 'B'
  }),
  Object.freeze({
    id: 'B_HOLD_A',
    steps: Object.freeze([
      Object.freeze({ label: 'B', mode: 'MISMATCH' }),
      Object.freeze({ label: 'A', mode: 'MATCH' })
    ]),
    hold_label: 'B',
    protected_sibling: 'A'
  })
]);

export const MARROWLINE_FINITE_RETURN_REPLAY_ORDER = Object.freeze([
  'B_HOLD_A',
  'A_HOLD_B',
  'BBA',
  'AAB',
  'B_ONLY',
  'A_ONLY',
  'BA',
  'AB'
]);

const FORBIDDEN_PORTABLE_SCHEDULE_KEYS = Object.freeze(new Set([
  'return_ordinal',
  'return_index',
  'schedule',
  'schedule_id',
  'schedule_index',
  'prior_return',
  'prior_return_marker',
  'previous_return',
  'completion',
  'completion_map',
  'completion_state',
  'duplicate_return',
  'duplicate_return_counter',
  'duplicate_return_count',
  'sibling_closure',
  'sibling_closure_token',
  'sibling_authorization',
  'sibling_authority',
  'replay',
  'replay_token',
  'nonce',
  'history',
  'route_history',
  'receipt_chain',
  'accumulated_digest',
  'prior_digest',
  'local_binding'
]));

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

export function canonicalFiniteReturnScheduleSurfaceJson(value) {
  return JSON.stringify(stable(value));
}

function describeSurface(value) {
  const json = canonicalFiniteReturnScheduleSurfaceJson(value);
  return Object.freeze({
    sha256: crypto.createHash('sha256').update(json, 'utf8').digest('hex'),
    bytes: Buffer.byteLength(json, 'utf8')
  });
}

function sameSurface(left, right) {
  return left.sha256 === right.sha256 && left.bytes === right.bytes;
}

function collectForbiddenPortableScheduleKeys(value, path = 'portable', into = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectForbiddenPortableScheduleKeys(item, `${path}[${index}]`, into));
    return into;
  }
  if (!value || typeof value !== 'object') return into;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_PORTABLE_SCHEDULE_KEYS.has(String(key).toLowerCase())) into.push(`${path}.${key}`);
    collectForbiddenPortableScheduleKeys(child, `${path}.${key}`, into);
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
  if (carryCase.receipt.finding_count !== 2) throw new Error(`Finite schedule Carry Case finding_count drifted: ${carryCase.receipt.finding_count}`);
  if (JSON.stringify(carryCase.receipt.finding_rule_ids) !== JSON.stringify(['EMAIL_IDENTIFIER', 'USER_DECLARED_PROTECTED_TERM'])) {
    throw new Error(`Finite schedule Carry Case rule order drifted: ${JSON.stringify(carryCase.receipt.finding_rule_ids)}`);
  }
  if (carryCase.receipt.release_authority !== false || carryCase.receipt.human_closure_required !== true ||
      carryCase.receipt.local_binding_carried !== false || carryCase.receipt.provider_call_performed !== false ||
      carryCase.receipt.production_mutation !== false) {
    throw new Error('Finite schedule Carry Case authority/local-binding membrane widened');
  }

  const envelopes = Object.freeze({
    A: Object.freeze({
      MATCH: buildMarrowlineReturnEnvelope(carryCase, { ruleId: A.spec.rule_id, claimedActionClass: A.spec.matching_action }),
      MISMATCH: buildMarrowlineReturnEnvelope(carryCase, { ruleId: A.spec.rule_id, claimedActionClass: A.spec.mismatch_action })
    }),
    B: Object.freeze({
      MATCH: buildMarrowlineReturnEnvelope(carryCase, { ruleId: B.spec.rule_id, claimedActionClass: B.spec.matching_action }),
      MISMATCH: buildMarrowlineReturnEnvelope(carryCase, { ruleId: B.spec.rule_id, claimedActionClass: B.spec.mismatch_action })
    })
  });

  const baseline = Object.freeze({
    A: Object.freeze({
      MATCH: revalidateMarrowlineReturn(carryCase, A.localBinding, envelopes.A.MATCH),
      MISMATCH: revalidateMarrowlineReturn(carryCase, A.localBinding, envelopes.A.MISMATCH)
    }),
    B: Object.freeze({
      MATCH: revalidateMarrowlineReturn(carryCase, B.localBinding, envelopes.B.MATCH),
      MISMATCH: revalidateMarrowlineReturn(carryCase, B.localBinding, envelopes.B.MISMATCH)
    })
  });

  for (const label of ['A', 'B']) {
    if (baseline[label].MATCH.status !== 'PRESENT_TO_HUMAN') throw new Error(`${label} canonical matching return drifted`);
    if (baseline[label].MISMATCH.status !== 'HOLD') throw new Error(`${label} canonical mismatch return drifted`);
    for (const mode of ['MATCH', 'MISMATCH']) {
      const result = baseline[label][mode];
      if (result.candidate_trusted !== false || result.release_authority !== false ||
          result.human_closure_required !== true || result.local_binding_retained !== true) {
        throw new Error(`${label} ${mode} result widened authority or lost retained local binding`);
      }
    }
  }

  return Object.freeze({ A, B, packet, carryCase, envelopes, baseline });
}

function snapshot(shared) {
  return Object.freeze({
    carry_case: describeSurface(shared.carryCase),
    local_bindings: Object.freeze({
      A: describeSurface(shared.A.localBinding),
      B: describeSurface(shared.B.localBinding)
    }),
    envelopes: Object.freeze({
      A_MATCH: describeSurface(shared.envelopes.A.MATCH),
      A_MISMATCH: describeSurface(shared.envelopes.A.MISMATCH),
      B_MATCH: describeSurface(shared.envelopes.B.MATCH),
      B_MISMATCH: describeSurface(shared.envelopes.B.MISMATCH)
    })
  });
}

function assertSnapshotSame(before, after, label) {
  if (!sameSurface(before.carry_case, after.carry_case)) throw new Error(`${label} mutated the shared Carry Case`);
  for (const finding of ['A', 'B']) {
    if (!sameSurface(before.local_bindings[finding], after.local_bindings[finding])) {
      throw new Error(`${label} mutated ${finding} local binding`);
    }
  }
  for (const envelope of ['A_MATCH', 'A_MISMATCH', 'B_MATCH', 'B_MISMATCH']) {
    if (!sameSurface(before.envelopes[envelope], after.envelopes[envelope])) {
      throw new Error(`${label} mutated ${envelope} return envelope`);
    }
  }
}

function resultSummary(result) {
  return Object.freeze({
    status: result.status,
    canonical_action_class: result.canonical_action_class,
    candidate_action_class: result.candidate_action_class,
    candidate_trusted: result.candidate_trusted,
    release_authority: result.release_authority,
    human_closure_required: result.human_closure_required,
    local_binding_retained: result.local_binding_retained
  });
}

function assertCanonicalResult(shared, label, mode, result, context) {
  const baseline = shared.baseline[label][mode];
  if (canonicalFiniteReturnScheduleSurfaceJson(result) !== canonicalFiniteReturnScheduleSurfaceJson(baseline)) {
    throw new Error(`${context} ${label} ${mode} drifted from canonical return result`);
  }
}

function executeSchedule(shared, schedule) {
  const before = snapshot(shared);
  const observations = [];

  for (const step of schedule.steps) {
    const result = revalidateMarrowlineReturn(
      shared.carryCase,
      shared[step.label].localBinding,
      shared.envelopes[step.label][step.mode]
    );
    assertCanonicalResult(shared, step.label, step.mode, result, schedule.id);
    observations.push(Object.freeze({
      label: step.label,
      mode: step.mode,
      result: resultSummary(result)
    }));
  }

  let omittedSiblingProbe = null;
  if (schedule.omitted_sibling) {
    const label = schedule.omitted_sibling;
    const result = revalidateMarrowlineReturn(shared.carryCase, shared[label].localBinding, shared.envelopes[label].MATCH);
    assertCanonicalResult(shared, label, 'MATCH', result, `${schedule.id} omitted sibling control`);
    omittedSiblingProbe = Object.freeze({ label, result: resultSummary(result), remained_canonical: true });
  }

  if (schedule.repeated_label) {
    const repeated = observations.filter(item => item.label === schedule.repeated_label && item.mode === 'MATCH');
    if (repeated.length !== 2 || canonicalFiniteReturnScheduleSurfaceJson(repeated[0].result) !== canonicalFiniteReturnScheduleSurfaceJson(repeated[1].result)) {
      throw new Error(`${schedule.id} repeated return drifted across identical local revalidation`);
    }
    const sibling = schedule.repeated_label === 'A' ? 'B' : 'A';
    const siblingObservation = observations.find(item => item.label === sibling && item.mode === 'MATCH');
    if (!siblingObservation || canonicalFiniteReturnScheduleSurfaceJson(siblingObservation.result) !== canonicalFiniteReturnScheduleSurfaceJson(resultSummary(shared.baseline[sibling].MATCH))) {
      throw new Error(`${schedule.id} repeated ${schedule.repeated_label} authorized or drifted sibling ${sibling}`);
    }
  }

  if (schedule.hold_label && schedule.protected_sibling) {
    const hold = observations.find(item => item.label === schedule.hold_label && item.mode === 'MISMATCH');
    const sibling = observations.find(item => item.label === schedule.protected_sibling && item.mode === 'MATCH');
    if (!hold || hold.result.status !== 'HOLD') throw new Error(`${schedule.id} local HOLD failed`);
    if (!sibling || canonicalFiniteReturnScheduleSurfaceJson(sibling.result) !== canonicalFiniteReturnScheduleSurfaceJson(resultSummary(shared.baseline[schedule.protected_sibling].MATCH))) {
      throw new Error(`${schedule.id} local HOLD drifted sibling ${schedule.protected_sibling}`);
    }
  }

  const after = snapshot(shared);
  assertSnapshotSame(before, after, schedule.id);

  return Object.freeze({
    schedule_id: schedule.id,
    execution: Object.freeze(schedule.steps.map(step => `${step.label}:${step.mode}`)),
    observations: Object.freeze(observations),
    omitted_sibling_probe: omittedSiblingProbe,
    carry_case_unchanged: true,
    local_bindings_unchanged: true,
    canonical_envelopes_unchanged: true,
    authority_closed: true
  });
}

function scheduleById(id) {
  const found = MARROWLINE_FINITE_RETURN_SCHEDULES.find(item => item.id === id);
  if (!found) throw new Error(`Unknown finite return schedule: ${id}`);
  return found;
}

function keyedSchedules(items) {
  return Object.fromEntries(items.map(item => [item.schedule_id, item]));
}

function expectWrongBindingRejection(shared, envelopeLabel, bindingLabel) {
  try {
    revalidateMarrowlineReturn(shared.carryCase, shared[bindingLabel].localBinding, shared.envelopes[envelopeLabel].MATCH);
  } catch (error) {
    if (!(error instanceof TypeError) || !/local binding does not match portable projection/.test(String(error.message || ''))) throw error;
    return Object.freeze({ rejected: true, error: error.message });
  }
  throw new Error(`${envelopeLabel} matching return accepted ${bindingLabel} sibling binding`);
}

function runWrongBindingControls(shared) {
  const before = snapshot(shared);
  const AWithB = expectWrongBindingRejection(shared, 'A', 'B');
  const BWithA = expectWrongBindingRejection(shared, 'B', 'A');
  const afterRejections = snapshot(shared);
  assertSnapshotSame(before, afterRejections, 'Finite schedule wrong-binding controls');

  const recovery = Object.freeze({
    A: revalidateMarrowlineReturn(shared.carryCase, shared.A.localBinding, shared.envelopes.A.MATCH),
    B: revalidateMarrowlineReturn(shared.carryCase, shared.B.localBinding, shared.envelopes.B.MATCH)
  });
  assertCanonicalResult(shared, 'A', 'MATCH', recovery.A, 'wrong-binding recovery');
  assertCanonicalResult(shared, 'B', 'MATCH', recovery.B, 'wrong-binding recovery');
  const afterRecovery = snapshot(shared);
  assertSnapshotSame(before, afterRecovery, 'Finite schedule wrong-binding recovery');

  return Object.freeze({
    A_with_B_binding: AWithB,
    B_with_A_binding: BWithA,
    lawful_recovery: Object.freeze({ A: resultSummary(recovery.A), B: resultSummary(recovery.B) }),
    transport_unchanged: true,
    local_bindings_unchanged: true,
    nonpoisoning: true
  });
}

function assertMatchesParent1062(shared) {
  const parent = runMarrowlineDuplicatePositionPermutationClosureAssay();
  const parentBaseline = parent.forward.recoveries.D_AAB;
  const current = Object.freeze({
    source_packet: describeSurface(shared.packet),
    carry_case: describeSurface(shared.carryCase),
    hosted_by_rule: Object.freeze({
      EMAIL_IDENTIFIER: describeSurface(shared.carryCase.hosted_portable_findings[0]),
      USER_DECLARED_PROTECTED_TERM: describeSurface(shared.carryCase.hosted_portable_findings[1])
    }),
    matching_envelopes: Object.freeze({
      A: describeSurface(shared.envelopes.A.MATCH),
      B: describeSurface(shared.envelopes.B.MATCH)
    }),
    mismatch_envelopes: Object.freeze({
      A: describeSurface(shared.envelopes.A.MISMATCH),
      B: describeSurface(shared.envelopes.B.MISMATCH)
    }),
    matching_results: Object.freeze({
      A: describeSurface(shared.baseline.A.MATCH),
      B: describeSurface(shared.baseline.B.MATCH)
    }),
    mismatch_results: Object.freeze({
      A: describeSurface(shared.baseline.A.MISMATCH),
      B: describeSurface(shared.baseline.B.MISMATCH)
    })
  });
  for (const key of Object.keys(current)) {
    if (canonicalFiniteReturnScheduleSurfaceJson(current[key]) !== canonicalFiniteReturnScheduleSurfaceJson(parentBaseline[key])) {
      throw new Error(`Finite return schedule lawful P_AB drifted from #1062 parent at ${key}`);
    }
  }
  return current;
}

export function runMarrowlineFiniteReturnScheduleClosureAssay() {
  const shared = buildSharedFixture();
  const parentSurface = assertMatchesParent1062(shared);
  const initial = snapshot(shared);

  const portableSurfaces = Object.freeze({
    source_packet: shared.packet,
    carry_case: shared.carryCase,
    return_envelopes: shared.envelopes
  });
  const forbiddenPortablePaths = collectForbiddenPortableScheduleKeys(portableSurfaces);
  if (forbiddenPortablePaths.length > 0) {
    throw new Error(`Finite return schedule leaked schedule/completion state into portable surfaces: ${forbiddenPortablePaths.join(', ')}`);
  }
  if (/sha256:/i.test(canonicalFiniteReturnScheduleSurfaceJson({ source_packet: shared.packet, carry_case: shared.carryCase }))) {
    throw new Error('Finite return schedule transport accumulated a digest carrier');
  }

  const primary = Object.freeze(MARROWLINE_FINITE_RETURN_SCHEDULES.map(schedule => executeSchedule(shared, schedule)));
  const replay = Object.freeze(MARROWLINE_FINITE_RETURN_REPLAY_ORDER.map(id => executeSchedule(shared, scheduleById(id))));
  const primaryById = keyedSchedules(primary);
  const replayById = keyedSchedules(replay);

  for (const schedule of MARROWLINE_FINITE_RETURN_SCHEDULES) {
    const first = primaryById[schedule.id];
    const second = replayById[schedule.id];
    if (!first || !second) throw new Error(`Finite return replay omitted schedule ${schedule.id}`);
    if (canonicalFiniteReturnScheduleSurfaceJson(first) !== canonicalFiniteReturnScheduleSurfaceJson(second)) {
      throw new Error(`${schedule.id} changed under second deterministic family order`);
    }
  }

  const controls = runWrongBindingControls(shared);
  const final = snapshot(shared);
  assertSnapshotSame(initial, final, 'Finite return schedule full assay');

  return Object.freeze({
    schema: MARROWLINE_FINITE_RETURN_SCHEDULE_CLOSURE_ASSAY_SCHEMA,
    status: 'PASS',
    assay_local_only: true,
    schedule_ids: Object.freeze(MARROWLINE_FINITE_RETURN_SCHEDULES.map(item => item.id)),
    primary_order: Object.freeze(MARROWLINE_FINITE_RETURN_SCHEDULES.map(item => item.id)),
    replay_order: MARROWLINE_FINITE_RETURN_REPLAY_ORDER,
    shared_case: Object.freeze({
      finding_count: shared.carryCase.receipt.finding_count,
      finding_rule_ids: shared.carryCase.receipt.finding_rule_ids,
      source_packet: parentSurface.source_packet,
      carry_case: parentSurface.carry_case,
      hosted_by_rule: parentSurface.hosted_by_rule,
      matching_envelopes: parentSurface.matching_envelopes,
      mismatch_envelopes: parentSurface.mismatch_envelopes,
      matching_results: parentSurface.matching_results,
      mismatch_results: parentSurface.mismatch_results,
      local_binding_carried: shared.carryCase.receipt.local_binding_carried,
      release_authority: shared.carryCase.receipt.release_authority,
      human_closure_required: shared.carryCase.receipt.human_closure_required,
      forbidden_portable_schedule_paths: Object.freeze([...forbiddenPortablePaths])
    }),
    primary_schedules: primary,
    replay_schedules: replay,
    controls,
    lawful_pair_matches_1062_parent: true,
    return_order_identity_stable: true,
    sibling_omission_no_closure_transfer: true,
    repeated_return_no_sibling_authorization: true,
    local_hold_no_sibling_decision_drift: true,
    finite_schedule_no_portable_memory: true,
    shared_carry_case_unchanged_across_schedules: true,
    local_bindings_unchanged_across_schedules: true,
    canonical_envelopes_unchanged_across_schedules: true,
    wrong_rule_binding_rejected: true,
    wrong_binding_nonpoisoning: true,
    family_replay_invariant: true,
    portable_schedule_state_carried: false,
    browser_persistence_required: false,
    authority: Object.freeze({
      release_authority: false,
      human_closure_required: true,
      provider_call_performed: false,
      production_mutation: false
    }),
    claim_ceiling: 'bounded-two-finding-eight-schedule-return-nontransfer-decision-stability-only',
    seal: '⟐'
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(`${JSON.stringify(runMarrowlineFiniteReturnScheduleClosureAssay(), null, 2)}\n`);
}
