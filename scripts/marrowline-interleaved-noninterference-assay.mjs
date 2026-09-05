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

export const MARROWLINE_INTERLEAVED_NONINTERFERENCE_ASSAY_SCHEMA = 'td613.marrowline.interleaved-noninterference-assay/v0.1-local-only';

export const MARROWLINE_INTERLEAVED_PACKET_SPECS = Object.freeze({
  A: Object.freeze({
    label: 'A',
    rule_id: 'EMAIL_IDENTIFIER',
    matching_action: 'CHANGE',
    mismatch_action: 'REMOVE',
    policy_digest_hex: 'a',
    source_digest_hex: 'b'
  }),
  B: Object.freeze({
    label: 'B',
    rule_id: 'USER_DECLARED_PROTECTED_TERM',
    matching_action: 'REMOVE',
    mismatch_action: 'CHANGE',
    policy_digest_hex: 'c',
    source_digest_hex: 'd'
  })
});

export const MARROWLINE_INTERLEAVED_SCHEDULES = Object.freeze([
  Object.freeze(['A', 'B', 'A']),
  Object.freeze(['B', 'A', 'B'])
]);

const FORBIDDEN_INTERFERENCE_KEYS = Object.freeze(new Set([
  'sequence',
  'sequence_index',
  'schedule',
  'schedule_index',
  'step',
  'step_index',
  'history',
  'route_history',
  'journey',
  'journey_history',
  'itinerary',
  'boundary_history',
  'prior_boundary',
  'previous_boundary',
  'prior_packet',
  'previous_packet',
  'prior_rule',
  'previous_rule',
  'prior_action',
  'previous_action',
  'receipt_chain',
  'prior_receipt',
  'previous_receipt',
  'receipt_id',
  'nonce',
  'timestamp'
]));

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

export function canonicalInterferenceSurfaceJson(value) {
  return JSON.stringify(stable(value));
}

function digestUtf8(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

function describeSurface(value) {
  const json = canonicalInterferenceSurfaceJson(value);
  return Object.freeze({
    sha256: digestUtf8(json),
    bytes: Buffer.byteLength(json, 'utf8')
  });
}

function collectForbiddenInterferenceKeys(value, path = 'transport', into = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectForbiddenInterferenceKeys(item, `${path}[${index}]`, into));
    return into;
  }
  if (!value || typeof value !== 'object') return into;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_INTERFERENCE_KEYS.has(String(key).toLowerCase())) into.push(`${path}.${key}`);
    collectForbiddenInterferenceKeys(child, `${path}.${key}`, into);
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
  return Object.freeze({ spec, sourceProjection, packet, localBinding });
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
  const forbiddenPaths = collectForbiddenInterferenceKeys(transport);
  const transportJson = canonicalInterferenceSurfaceJson(transport);

  if (forbiddenPaths.length > 0) {
    throw new Error(`${fixture.spec.label} portable route accumulated interference/history keys: ${forbiddenPaths.join(', ')}`);
  }
  if (/sha256:/i.test(transportJson)) throw new Error(`${fixture.spec.label} portable route accumulated a digest carrier`);
  if (result.status !== 'PRESENT_TO_HUMAN') throw new Error(`${fixture.spec.label} matching return did not PRESENT_TO_HUMAN: ${result.status}`);
  if (result.candidate_trusted !== false || result.release_authority !== false || result.human_closure_required !== true || result.local_binding_retained !== true) {
    throw new Error(`${fixture.spec.label} widened return authority or lost local binding retention`);
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
    forbidden_interference_paths: Object.freeze([...forbiddenPaths])
  });
}

export function buildMarrowlineInterleavedManifest(packetLabel) {
  const spec = MARROWLINE_INTERLEAVED_PACKET_SPECS[String(packetLabel || '').trim().toUpperCase()];
  if (!spec) throw new TypeError('unsupported interleaved packet label');
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
      production_mutation: false,
      deployment_authority: false
    })
  });
}

function sameSurface(left, right, key) {
  return left.surfaces[key].sha256 === right.surfaces[key].sha256
    && left.surfaces[key].bytes === right.surfaces[key].bytes;
}

function assertOuterIdentity(scheduleLabel, steps, expectedLabel) {
  const first = steps[0];
  const last = steps[2];
  for (const key of ['source_packet', 'carry_case', 'return_envelope', 'combined_transport']) {
    if (!sameSurface(first, last, key)) {
      throw new Error(`${scheduleLabel} ${expectedLabel} outer occurrences diverged on ${key}`);
    }
  }
}

function assertPacketDistinguishability(a, b) {
  for (const key of ['source_packet', 'carry_case', 'return_envelope', 'combined_transport']) {
    if (a.surfaces[key].sha256 === b.surfaces[key].sha256 && a.surfaces[key].bytes === b.surfaces[key].bytes) {
      throw new Error(`A/B sensitivity collapsed on ${key}`);
    }
  }
}

export function runMarrowlineInterleavedNoninterferenceAssay() {
  const fixtures = Object.freeze({
    A: fixtureFor(MARROWLINE_INTERLEAVED_PACKET_SPECS.A),
    B: fixtureFor(MARROWLINE_INTERLEAVED_PACKET_SPECS.B)
  });

  const baseline = Object.freeze({
    A: executeFixture(fixtures.A),
    B: executeFixture(fixtures.B)
  });
  assertPacketDistinguishability(baseline.A, baseline.B);

  const schedules = MARROWLINE_INTERLEAVED_SCHEDULES.map((schedule, scheduleIndex) => {
    const rawSteps = schedule.map(label => executeFixture(fixtures[label]));
    const scheduleLabel = schedule.join('→');
    assertOuterIdentity(scheduleLabel, rawSteps, schedule[0]);
    for (const step of rawSteps) {
      const baselineStep = baseline[schedule[rawSteps.indexOf(step)]];
      if (!baselineStep) throw new Error(`${scheduleLabel} lost canonical packet baseline`);
    }
    return Object.freeze({
      assay_schedule_index: scheduleIndex + 1,
      assay_local_only: true,
      schedule: Object.freeze([...schedule]),
      steps: Object.freeze(rawSteps.map((step, stepIndex) => Object.freeze({
        assay_step_index: stepIndex + 1,
        assay_packet_label: schedule[stepIndex],
        assay_local_only: true,
        surfaces: step.surfaces,
        revalidation: step.revalidation,
        forbidden_interference_paths: step.forbidden_interference_paths
      })))
    });
  });

  for (const schedule of schedules) {
    for (const step of schedule.steps) {
      const canonical = baseline[step.assay_packet_label];
      for (const key of ['source_packet', 'carry_case', 'return_envelope', 'combined_transport']) {
        if (step.surfaces[key].sha256 !== canonical.surfaces[key].sha256 || step.surfaces[key].bytes !== canonical.surfaces[key].bytes) {
          throw new Error(`${schedule.schedule.join('→')} step ${step.assay_step_index} diverged from ${step.assay_packet_label} canonical ${key}`);
        }
      }
    }
  }

  const mismatchControls = {};
  for (const label of ['A', 'B']) {
    const fixture = fixtures[label];
    const carryCase = baseline[label].transport.carry_case;
    const mismatchEnvelope = buildMarrowlineReturnEnvelope(carryCase, {
      ruleId: fixture.spec.rule_id,
      claimedActionClass: fixture.spec.mismatch_action
    });
    const mismatchResult = revalidateMarrowlineReturn(carryCase, fixture.localBinding, mismatchEnvelope);
    if (mismatchResult.status !== 'HOLD') throw new Error(`${label} mismatch sensitivity control failed to HOLD`);
    mismatchControls[label] = Object.freeze({
      status: mismatchResult.status,
      return_envelope_distinguishable: describeSurface(mismatchEnvelope).sha256 !== baseline[label].surfaces.return_envelope.sha256
    });
    if (!mismatchControls[label].return_envelope_distinguishable) {
      throw new Error(`${label} mismatch return-envelope sensitivity collapsed`);
    }
  }

  return Object.freeze({
    schema: MARROWLINE_INTERLEAVED_NONINTERFERENCE_ASSAY_SCHEMA,
    status: 'PASS',
    assay_local_only: true,
    packet_labels: Object.freeze(['A', 'B']),
    portable_schedule_index: false,
    prior_packet_identity_carried: false,
    route_history_carried: false,
    baseline: Object.freeze({
      A: baseline.A.surfaces,
      B: baseline.B.surfaces
    }),
    packets_distinguishable: true,
    outer_occurrences_byte_identical: true,
    schedule_steps_match_packet_baseline: true,
    schedules: Object.freeze(schedules),
    controls: Object.freeze({
      A: mismatchControls.A,
      B: mismatchControls.B
    }),
    authority: Object.freeze({
      release_authority: false,
      human_closure_required: true,
      provider_call_performed: false,
      production_mutation: false
    }),
    claim_ceiling: 'bounded-two-packet-two-schedule-interleaved-noninterference-only',
    seal: '⟐'
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(`${JSON.stringify(runMarrowlineInterleavedNoninterferenceAssay(), null, 2)}\n`);
}
