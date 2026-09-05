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

export const MARROWLINE_RETURN_PERMUTATION_ISOLATION_ASSAY_SCHEMA = 'td613.marrowline.return-permutation-isolation-assay/v0.1-local-only';

export const MARROWLINE_RETURN_PERMUTATION_SCHEDULES = Object.freeze([
  Object.freeze({ id: 'AB', sequence: Object.freeze(['A_MATCH', 'B_MATCH']) }),
  Object.freeze({ id: 'BA', sequence: Object.freeze(['B_MATCH', 'A_MATCH']) }),
  Object.freeze({ id: 'A_ONLY', sequence: Object.freeze(['A_MATCH']), omitted: 'B' }),
  Object.freeze({ id: 'B_ONLY', sequence: Object.freeze(['B_MATCH']), omitted: 'A' }),
  Object.freeze({ id: 'AAB', sequence: Object.freeze(['A_MATCH', 'A_MATCH', 'B_MATCH']) }),
  Object.freeze({ id: 'BBA', sequence: Object.freeze(['B_MATCH', 'B_MATCH', 'A_MATCH']) }),
  Object.freeze({ id: 'A_BHOLD_A', sequence: Object.freeze(['A_MATCH', 'B_HOLD', 'A_MATCH']) }),
  Object.freeze({ id: 'B_AHOLD_B', sequence: Object.freeze(['B_MATCH', 'A_HOLD', 'B_MATCH']) })
]);

const FORBIDDEN_PORTABLE_KEYS = Object.freeze(new Set([
  'return_ordinal',
  'return_index',
  'schedule',
  'schedule_id',
  'schedule_index',
  'prior_return',
  'previous_return',
  'duplicate',
  'duplicate_count',
  'completion',
  'completion_map',
  'sibling_closure',
  'sibling_authority',
  'replay',
  'replay_token',
  'receipt_chain',
  'history',
  'route_history',
  'nonce',
  'timestamp'
]));

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

export function canonicalReturnPermutationJson(value) {
  return JSON.stringify(stable(value));
}

function describeSurface(value) {
  const json = canonicalReturnPermutationJson(value);
  return Object.freeze({
    sha256: crypto.createHash('sha256').update(json, 'utf8').digest('hex'),
    bytes: Buffer.byteLength(json, 'utf8')
  });
}

function collectForbiddenPortableKeys(value, path = 'transport', into = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectForbiddenPortableKeys(item, `${path}[${index}]`, into));
    return into;
  }
  if (!value || typeof value !== 'object') return into;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_PORTABLE_KEYS.has(String(key).toLowerCase())) into.push(`${path}.${key}`);
    collectForbiddenPortableKeys(child, `${path}.${key}`, into);
  }
  return into;
}

function fixtureFor(spec) {
  const pocketProjection = compilePortableAiaProjection({ ruleId: spec.rule_id, routeMode: 'LOCAL_POCKET' });
  const hostedProjection = compilePortableAiaProjection({ ruleId: spec.rule_id, routeMode: 'TD613_HOSTED' });
  if (pocketProjection.invariant.action_class !== spec.matching_action) {
    throw new Error(`${spec.label} canonical action drifted from earned multiplexed parent`);
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
  const envelopes = Object.freeze({
    A_MATCH: buildMarrowlineReturnEnvelope(carryCase, { ruleId: A.spec.rule_id, claimedActionClass: A.spec.matching_action }),
    A_HOLD: buildMarrowlineReturnEnvelope(carryCase, { ruleId: A.spec.rule_id, claimedActionClass: A.spec.mismatch_action }),
    B_MATCH: buildMarrowlineReturnEnvelope(carryCase, { ruleId: B.spec.rule_id, claimedActionClass: B.spec.matching_action }),
    B_HOLD: buildMarrowlineReturnEnvelope(carryCase, { ruleId: B.spec.rule_id, claimedActionClass: B.spec.mismatch_action })
  });
  return Object.freeze({ A, B, packet, carryCase, envelopes });
}

function labelForToken(token) {
  if (token.startsWith('A_')) return 'A';
  if (token.startsWith('B_')) return 'B';
  throw new Error(`unknown return token: ${token}`);
}

function executeToken(shared, token) {
  const label = labelForToken(token);
  const envelope = shared.envelopes[token];
  const result = revalidateMarrowlineReturn(shared.carryCase, shared[label].localBinding, envelope);
  const expected = token.endsWith('_MATCH') ? 'PRESENT_TO_HUMAN' : 'HOLD';
  if (result.status !== expected) throw new Error(`${token} expected ${expected}, observed ${result.status}`);
  if (result.candidate_trusted !== false || result.release_authority !== false ||
      result.human_closure_required !== true || result.local_binding_retained !== true) {
    throw new Error(`${token} widened authority or lost local binding retention`);
  }
  return Object.freeze({
    assay_token: token,
    assay_label: label,
    assay_local_only: true,
    status: result.status,
    result_surface: describeSurface(result),
    candidate_trusted: result.candidate_trusted,
    release_authority: result.release_authority,
    human_closure_required: result.human_closure_required,
    local_binding_retained: result.local_binding_retained
  });
}

function executeSchedule(shared, schedule, baseline) {
  const carryBefore = describeSurface(shared.carryCase);
  const envelopeBefore = Object.fromEntries(Object.entries(shared.envelopes).map(([key, value]) => [key, describeSurface(value)]));
  const steps = schedule.sequence.map(token => executeToken(shared, token));
  const carryAfter = describeSurface(shared.carryCase);
  const envelopeAfter = Object.fromEntries(Object.entries(shared.envelopes).map(([key, value]) => [key, describeSurface(value)]));

  if (carryBefore.sha256 !== carryAfter.sha256 || carryBefore.bytes !== carryAfter.bytes) {
    throw new Error(`${schedule.id} mutated the shared Carry Case`);
  }
  for (const key of Object.keys(shared.envelopes)) {
    if (envelopeBefore[key].sha256 !== envelopeAfter[key].sha256 || envelopeBefore[key].bytes !== envelopeAfter[key].bytes) {
      throw new Error(`${schedule.id} mutated return envelope ${key}`);
    }
  }
  for (const step of steps) {
    const expectedSurface = baseline[step.assay_token];
    if (step.result_surface.sha256 !== expectedSurface.sha256 || step.result_surface.bytes !== expectedSurface.bytes) {
      throw new Error(`${schedule.id} ${step.assay_token} result changed with return schedule`);
    }
  }

  if (schedule.id === 'AAB' && canonicalReturnPermutationJson(steps[0]) !== canonicalReturnPermutationJson(steps[1])) {
    throw new Error('AAB duplicate A revalidation was not deterministic');
  }
  if (schedule.id === 'BBA' && canonicalReturnPermutationJson(steps[0]) !== canonicalReturnPermutationJson(steps[1])) {
    throw new Error('BBA duplicate B revalidation was not deterministic');
  }
  if (schedule.id === 'A_BHOLD_A' && canonicalReturnPermutationJson(steps[0]) !== canonicalReturnPermutationJson(steps[2])) {
    throw new Error('interposed B HOLD changed A matching result');
  }
  if (schedule.id === 'B_AHOLD_B' && canonicalReturnPermutationJson(steps[0]) !== canonicalReturnPermutationJson(steps[2])) {
    throw new Error('interposed A HOLD changed B matching result');
  }

  return Object.freeze({
    schedule_id: schedule.id,
    assay_local_only: true,
    sequence: schedule.sequence,
    omitted_sibling: schedule.omitted || null,
    observed_step_count: steps.length,
    observed_labels: Object.freeze(steps.map(step => step.assay_label)),
    steps: Object.freeze(steps),
    carry_case_unchanged: true,
    envelopes_unchanged: true,
    omitted_sibling_result_created: false,
    portable_schedule_state_created: false
  });
}

function wrongBindingControl(shared, token, wrongBinding, label) {
  try {
    revalidateMarrowlineReturn(shared.carryCase, wrongBinding, shared.envelopes[token]);
  } catch (error) {
    if (!(error instanceof TypeError) || !/local binding does not match portable projection/.test(String(error.message || ''))) {
      throw error;
    }
    return Object.freeze({ label, rejected: true, error: error.message });
  }
  throw new Error(`${label} wrong-rule local binding was accepted`);
}

export function runMarrowlineReturnPermutationIsolationAssay() {
  const shared = sharedFixture();
  if (shared.carryCase.receipt.finding_count !== 2) throw new Error('return permutation assay lost two-finding shared case');
  if (JSON.stringify(shared.carryCase.receipt.finding_rule_ids) !== JSON.stringify(['EMAIL_IDENTIFIER', 'USER_DECLARED_PROTECTED_TERM'])) {
    throw new Error('return permutation assay shared rule order drifted');
  }

  const transport = Object.freeze({ source_packet: shared.packet, carry_case: shared.carryCase, return_envelopes: shared.envelopes });
  const forbiddenPortablePaths = collectForbiddenPortableKeys(transport);
  if (forbiddenPortablePaths.length > 0) {
    throw new Error(`portable return surface accumulated schedule/duplicate/completion state: ${forbiddenPortablePaths.join(', ')}`);
  }
  const transportJson = canonicalReturnPermutationJson(transport);
  if (/sha256:/i.test(transportJson)) throw new Error('portable return surface accumulated a digest carrier');

  const baselineResults = Object.freeze({
    A_MATCH: executeToken(shared, 'A_MATCH'),
    A_HOLD: executeToken(shared, 'A_HOLD'),
    B_MATCH: executeToken(shared, 'B_MATCH'),
    B_HOLD: executeToken(shared, 'B_HOLD')
  });
  const baseline = Object.freeze(Object.fromEntries(Object.entries(baselineResults).map(([key, value]) => [key, value.result_surface])));

  const carryCaseSurface = describeSurface(shared.carryCase);
  const schedules = MARROWLINE_RETURN_PERMUTATION_SCHEDULES.map(schedule => executeSchedule(shared, schedule, baseline));
  const carryAfterAllSchedules = describeSurface(shared.carryCase);
  if (carryCaseSurface.sha256 !== carryAfterAllSchedules.sha256 || carryCaseSurface.bytes !== carryAfterAllSchedules.bytes) {
    throw new Error('bounded return schedules mutated the shared Carry Case');
  }

  const byId = Object.fromEntries(schedules.map(schedule => [schedule.schedule_id, schedule]));
  if (byId.A_ONLY.observed_labels.join(',') !== 'A' || byId.A_ONLY.omitted_sibling !== 'B') {
    throw new Error('A_ONLY omission control drifted');
  }
  if (byId.B_ONLY.observed_labels.join(',') !== 'B' || byId.B_ONLY.omitted_sibling !== 'A') {
    throw new Error('B_ONLY omission control drifted');
  }
  if (byId.AAB.steps[0].result_surface.sha256 !== byId.AAB.steps[1].result_surface.sha256) {
    throw new Error('A duplicate result surface diverged');
  }
  if (byId.BBA.steps[0].result_surface.sha256 !== byId.BBA.steps[1].result_surface.sha256) {
    throw new Error('B duplicate result surface diverged');
  }

  const controls = Object.freeze({
    A_with_B_binding: wrongBindingControl(shared, 'A_MATCH', shared.B.localBinding, 'A_with_B_binding'),
    B_with_A_binding: wrongBindingControl(shared, 'B_MATCH', shared.A.localBinding, 'B_with_A_binding')
  });

  return Object.freeze({
    schema: MARROWLINE_RETURN_PERMUTATION_ISOLATION_ASSAY_SCHEMA,
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
      return_envelopes: Object.freeze(Object.fromEntries(Object.entries(shared.envelopes).map(([key, value]) => [key, describeSurface(value)]))),
      local_binding_carried: shared.carryCase.receipt.local_binding_carried,
      release_authority: shared.carryCase.receipt.release_authority,
      human_closure_required: shared.carryCase.receipt.human_closure_required,
      forbidden_portable_state_paths: Object.freeze([...forbiddenPortablePaths])
    }),
    baseline_results: baseline,
    schedules: Object.freeze(schedules),
    controls,
    order_invariant_for_observed_matching_returns: true,
    sibling_omission_created_no_portable_closure_state: true,
    duplicate_return_transferred_no_sibling_authority: true,
    interposed_hold_changed_no_sibling_match_result: true,
    shared_carry_case_unchanged_across_schedules: true,
    wrong_rule_binding_rejected: true,
    portable_return_ordinal_carried: false,
    portable_duplicate_counter_carried: false,
    portable_completion_map_carried: false,
    replay_protection_claimed: false,
    exactly_once_semantics_claimed: false,
    authority: Object.freeze({
      release_authority: false,
      human_closure_required: true,
      provider_call_performed: false,
      production_mutation: false
    }),
    claim_ceiling: 'bounded-two-finding-return-order-omission-repetition-nontransfer-only',
    seal: '⟐'
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(`${JSON.stringify(runMarrowlineReturnPermutationIsolationAssay(), null, 2)}\n`);
}
