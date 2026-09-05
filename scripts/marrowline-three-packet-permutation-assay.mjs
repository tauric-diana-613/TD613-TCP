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

export const MARROWLINE_THREE_PACKET_PERMUTATION_ASSAY_SCHEMA =
  'td613.marrowline.three-packet-permutation-noninterference-assay/v0.1-local-only';

export const MARROWLINE_THREE_PACKET_SPECS = Object.freeze({
  A: Object.freeze({
    label: 'A', rule_id: 'EMAIL_IDENTIFIER', matching_action: 'CHANGE', mismatch_action: 'REMOVE',
    policy_digest_hex: 'a', source_digest_hex: 'b'
  }),
  B: Object.freeze({
    label: 'B', rule_id: 'USER_DECLARED_PROTECTED_TERM', matching_action: 'REMOVE', mismatch_action: 'CHANGE',
    policy_digest_hex: 'c', source_digest_hex: 'd'
  }),
  C: Object.freeze({
    label: 'C', rule_id: 'PRIVATE_KEY_BLOCK', matching_action: 'REMOVE', mismatch_action: 'CHANGE',
    policy_digest_hex: 'e', source_digest_hex: 'f'
  })
});

export const MARROWLINE_THREE_PACKET_PERMUTATIONS = Object.freeze([
  Object.freeze(['A', 'B', 'C']),
  Object.freeze(['A', 'C', 'B']),
  Object.freeze(['B', 'A', 'C']),
  Object.freeze(['B', 'C', 'A']),
  Object.freeze(['C', 'A', 'B']),
  Object.freeze(['C', 'B', 'A'])
]);

const SURFACE_KEYS = Object.freeze(['source_packet', 'carry_case', 'return_envelope', 'combined_transport']);
const FORBIDDEN_PERMUTATION_KEYS = Object.freeze(new Set([
  'sequence', 'sequence_index', 'schedule', 'schedule_index', 'step', 'step_index',
  'position', 'position_index', 'permutation', 'permutation_index',
  'history', 'route_history', 'journey', 'journey_history', 'itinerary', 'boundary_history',
  'prior_boundary', 'previous_boundary', 'prior_packet', 'previous_packet', 'prior_rule', 'previous_rule',
  'prior_action', 'previous_action', 'prior_schedule', 'previous_schedule',
  'prior_permutation', 'previous_permutation', 'receipt_chain', 'prior_receipt', 'previous_receipt',
  'receipt_id', 'nonce', 'timestamp'
]));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

export function canonicalPermutationSurfaceJson(value) {
  return JSON.stringify(stable(value));
}

function describeSurface(value) {
  const json = canonicalPermutationSurfaceJson(value);
  return Object.freeze({
    sha256: crypto.createHash('sha256').update(json, 'utf8').digest('hex'),
    bytes: Buffer.byteLength(json, 'utf8')
  });
}

function collectForbiddenPermutationKeys(value, path = 'transport', into = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectForbiddenPermutationKeys(item, `${path}[${index}]`, into));
    return into;
  }
  if (!value || typeof value !== 'object') return into;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_PERMUTATION_KEYS.has(String(key).toLowerCase())) into.push(`${path}.${key}`);
    collectForbiddenPermutationKeys(child, `${path}.${key}`, into);
  }
  return into;
}

function fixtureFor(spec) {
  const sourceProjection = compilePortableAiaProjection({ ruleId: spec.rule_id, routeMode: 'LOCAL_POCKET' });
  if (sourceProjection.invariant.action_class !== spec.matching_action) {
    throw new Error(`${spec.label} preregistered action does not match canonical policy`);
  }
  const packet = Object.freeze({
    schema: LOCAL_POCKET_EXPORT_SCHEMA,
    portable_findings: Object.freeze([clone(sourceProjection.portable_payload)]),
    release_authority: false,
    human_closure_required: true
  });
  const localBinding = compilePortableAiaLocalBinding(sourceProjection, {
    policyDigest: `sha256:${spec.policy_digest_hex.repeat(64)}`,
    sourceStateDigest: `sha256:${spec.source_digest_hex.repeat(64)}`
  });
  return Object.freeze({ spec, packet, localBinding });
}

function executeFixture(fixture) {
  const carryCase = buildMarrowlinePocketHostedCarryCase(fixture.packet);
  const returnEnvelope = buildMarrowlineReturnEnvelope(carryCase, {
    ruleId: fixture.spec.rule_id,
    claimedActionClass: fixture.spec.matching_action
  });
  const result = revalidateMarrowlineReturn(carryCase, fixture.localBinding, returnEnvelope);
  const transport = Object.freeze({
    source_packet: fixture.packet,
    carry_case: carryCase,
    return_envelope: returnEnvelope
  });
  const forbiddenPaths = collectForbiddenPermutationKeys(transport);
  const transportJson = canonicalPermutationSurfaceJson(transport);

  if (forbiddenPaths.length > 0) {
    throw new Error(`${fixture.spec.label} portable route accumulated permutation/history keys: ${forbiddenPaths.join(', ')}`);
  }
  if (/sha256:/i.test(transportJson)) throw new Error(`${fixture.spec.label} portable route accumulated a digest carrier`);
  if (result.status !== 'PRESENT_TO_HUMAN') throw new Error(`${fixture.spec.label} matching return did not PRESENT_TO_HUMAN`);
  if (result.candidate_trusted !== false || result.release_authority !== false
      || result.human_closure_required !== true || result.local_binding_retained !== true) {
    throw new Error(`${fixture.spec.label} widened return authority or lost retained-local binding`);
  }

  return Object.freeze({
    transport,
    surfaces: Object.freeze({
      source_packet: describeSurface(fixture.packet),
      carry_case: describeSurface(carryCase),
      return_envelope: describeSurface(returnEnvelope),
      combined_transport: describeSurface(transport)
    }),
    revalidation: Object.freeze({
      status: result.status,
      candidate_trusted: result.candidate_trusted,
      release_authority: result.release_authority,
      human_closure_required: result.human_closure_required,
      local_binding_retained: result.local_binding_retained
    }),
    forbidden_permutation_paths: Object.freeze([...forbiddenPaths])
  });
}

export function buildMarrowlineThreePacketManifest(packetLabel) {
  const label = String(packetLabel || '').trim().toUpperCase();
  const spec = MARROWLINE_THREE_PACKET_SPECS[label];
  if (!spec) throw new TypeError('unsupported three-packet label');
  const fixture = fixtureFor(spec);
  const carryCase = buildMarrowlinePocketHostedCarryCase(fixture.packet);
  const matchingEnvelope = buildMarrowlineReturnEnvelope(carryCase, {
    ruleId: spec.rule_id,
    claimedActionClass: spec.matching_action
  });
  const mismatchEnvelope = buildMarrowlineReturnEnvelope(carryCase, {
    ruleId: spec.rule_id,
    claimedActionClass: spec.mismatch_action
  });
  return Object.freeze({
    schema: 'td613.marrowline.pocket-hosted-carry-case-artifact/v0.1',
    source_packet: fixture.packet,
    carry_case: carryCase,
    matching_return: Object.freeze({
      envelope: matchingEnvelope,
      result: revalidateMarrowlineReturn(carryCase, fixture.localBinding, matchingEnvelope)
    }),
    mismatching_return: Object.freeze({
      envelope: mismatchEnvelope,
      result: revalidateMarrowlineReturn(carryCase, fixture.localBinding, mismatchEnvelope)
    }),
    authority: Object.freeze({
      release_authority: false,
      human_closure_required: true,
      provider_call_performed: false,
      production_mutation: false
    })
  });
}

function assertSurfaceEquals(left, right, context) {
  for (const key of SURFACE_KEYS) {
    if (left[key].sha256 !== right[key].sha256 || left[key].bytes !== right[key].bytes) {
      throw new Error(`${context} diverged on ${key}`);
    }
  }
}

function assertPairwiseDistinguishable(baseline) {
  for (const [left, right] of [['A', 'B'], ['A', 'C'], ['B', 'C']]) {
    for (const key of SURFACE_KEYS) {
      if (baseline[left].surfaces[key].sha256 === baseline[right].surfaces[key].sha256
          && baseline[left].surfaces[key].bytes === baseline[right].surfaces[key].bytes) {
        throw new Error(`${left}/${right} sensitivity collapsed on ${key}`);
      }
    }
  }
}

function crossBindingControls(fixtures, baseline) {
  const controls = [];
  for (const sourceLabel of ['A', 'B', 'C']) {
    for (const bindingLabel of ['A', 'B', 'C']) {
      if (sourceLabel === bindingLabel) continue;
      const fixture = fixtures[sourceLabel];
      let rejected = false;
      let errorName = null;
      try {
        revalidateMarrowlineReturn(
          baseline[sourceLabel].transport.carry_case,
          fixtures[bindingLabel].localBinding,
          baseline[sourceLabel].transport.return_envelope
        );
      } catch (error) {
        rejected = true;
        errorName = error?.name || 'Error';
      }
      if (!rejected) throw new Error(`${sourceLabel} accepted ${bindingLabel} retained-local binding`);
      controls.push(Object.freeze({ source_packet: sourceLabel, foreign_binding: bindingLabel, rejected, error_name: errorName }));
    }
  }
  return Object.freeze(controls);
}

export function runMarrowlineThreePacketPermutationAssay() {
  const fixtures = Object.freeze(Object.fromEntries(
    Object.entries(MARROWLINE_THREE_PACKET_SPECS).map(([label, spec]) => [label, fixtureFor(spec)])
  ));
  const baseline = Object.freeze(Object.fromEntries(
    Object.entries(fixtures).map(([label, fixture]) => [label, executeFixture(fixture)])
  ));
  assertPairwiseDistinguishable(baseline);

  const positionCounts = { A: [0, 0, 0], B: [0, 0, 0], C: [0, 0, 0] };
  const schedules = MARROWLINE_THREE_PACKET_PERMUTATIONS.map((schedule, permutationIndex) => {
    const steps = schedule.map((label, positionIndex) => {
      const observed = executeFixture(fixtures[label]);
      assertSurfaceEquals(observed.surfaces, baseline[label].surfaces,
        `${schedule.join('→')} position ${positionIndex + 1} ${label}`);
      positionCounts[label][positionIndex] += 1;
      return Object.freeze({
        assay_position_index: positionIndex + 1,
        assay_packet_label: label,
        assay_local_only: true,
        surfaces: observed.surfaces,
        revalidation: observed.revalidation,
        forbidden_permutation_paths: observed.forbidden_permutation_paths
      });
    });
    return Object.freeze({
      assay_permutation_index: permutationIndex + 1,
      assay_local_only: true,
      schedule: Object.freeze([...schedule]),
      steps: Object.freeze(steps)
    });
  });

  for (const [label, counts] of Object.entries(positionCounts)) {
    if (counts.some((count) => count !== 2)) throw new Error(`${label} did not occupy each permutation position exactly twice`);
  }

  const mismatchControls = {};
  for (const label of ['A', 'B', 'C']) {
    const fixture = fixtures[label];
    const carryCase = baseline[label].transport.carry_case;
    const mismatchEnvelope = buildMarrowlineReturnEnvelope(carryCase, {
      ruleId: fixture.spec.rule_id,
      claimedActionClass: fixture.spec.mismatch_action
    });
    const result = revalidateMarrowlineReturn(carryCase, fixture.localBinding, mismatchEnvelope);
    if (result.status !== 'HOLD') throw new Error(`${label} mismatch sensitivity control failed to HOLD`);
    mismatchControls[label] = Object.freeze({
      status: result.status,
      return_envelope_distinguishable:
        describeSurface(mismatchEnvelope).sha256 !== baseline[label].surfaces.return_envelope.sha256
    });
    if (!mismatchControls[label].return_envelope_distinguishable) {
      throw new Error(`${label} mismatch return-envelope sensitivity collapsed`);
    }
  }

  const crossBindings = crossBindingControls(fixtures, baseline);
  if (baseline.B.surfaces.return_envelope.sha256 === baseline.C.surfaces.return_envelope.sha256) {
    throw new Error('B/C shared REMOVE action collapsed rule-bound return identity');
  }

  return Object.freeze({
    schema: MARROWLINE_THREE_PACKET_PERMUTATION_ASSAY_SCHEMA,
    status: 'PASS',
    assay_local_only: true,
    packet_labels: Object.freeze(['A', 'B', 'C']),
    permutation_count: 6,
    observed_step_count: 18,
    portable_permutation_index: false,
    portable_position_index: false,
    prior_packet_identity_carried: false,
    prior_permutation_history_carried: false,
    route_history_carried: false,
    baseline: Object.freeze({ A: baseline.A.surfaces, B: baseline.B.surfaces, C: baseline.C.surfaces }),
    packets_pairwise_distinguishable: true,
    shared_remove_action_did_not_collapse_identity: true,
    schedule_steps_match_packet_baseline: true,
    position_coverage: Object.freeze({
      A: Object.freeze([...positionCounts.A]),
      B: Object.freeze([...positionCounts.B]),
      C: Object.freeze([...positionCounts.C])
    }),
    schedules: Object.freeze(schedules),
    controls: Object.freeze({
      mismatch: Object.freeze(mismatchControls),
      cross_binding: crossBindings
    }),
    authority: Object.freeze({
      release_authority: false,
      human_closure_required: true,
      provider_call_performed: false,
      production_mutation: false
    }),
    claim_ceiling: 'bounded-three-packet-all-six-permutation-serialized-position-noninterference-only',
    seal: '⟐'
  });
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  process.stdout.write(`${JSON.stringify(runMarrowlineThreePacketPermutationAssay(), null, 2)}\n`);
}
