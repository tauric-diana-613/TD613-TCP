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

export const MARROWLINE_ROUND_TRIP_MEMORYLESSNESS_ASSAY_SCHEMA = 'td613.marrowline.round-trip-memorylessness-assay/v0.1-local-only';
export const MARROWLINE_ROUND_TRIP_MEMORYLESSNESS_CYCLE_COUNT = 3;

const RULE_ID = 'EMAIL_IDENTIFIER';
const MATCHING_ACTION = 'CHANGE';
const MISMATCH_ACTION = 'REMOVE';

const FORBIDDEN_HISTORY_KEYS = Object.freeze(new Set([
  'cycle',
  'cycle_count',
  'cycle_index',
  'history',
  'route_history',
  'journey',
  'journey_history',
  'itinerary',
  'boundary_history',
  'prior_boundary',
  'previous_boundary',
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

export function canonicalSurfaceJson(value) {
  return JSON.stringify(stable(value));
}

function digestUtf8(text) {
  return crypto.createHash('sha256').update(text, 'utf8').digest('hex');
}

function describeSurface(value) {
  const json = canonicalSurfaceJson(value);
  return Object.freeze({
    sha256: digestUtf8(json),
    bytes: Buffer.byteLength(json, 'utf8')
  });
}

function collectForbiddenHistoryKeys(value, path = 'transport', into = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectForbiddenHistoryKeys(item, `${path}[${index}]`, into));
    return into;
  }
  if (!value || typeof value !== 'object') return into;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_HISTORY_KEYS.has(String(key).toLowerCase())) into.push(`${path}.${key}`);
    collectForbiddenHistoryKeys(child, `${path}.${key}`, into);
  }
  return into;
}

function canonicalFixture() {
  const sourceProjection = compilePortableAiaProjection({ ruleId: RULE_ID, routeMode: 'LOCAL_POCKET' });
  const packet = Object.freeze({
    schema: LOCAL_POCKET_EXPORT_SCHEMA,
    portable_findings: Object.freeze([clone(sourceProjection.portable_payload)]),
    release_authority: false,
    human_closure_required: true
  });
  const localBinding = compilePortableAiaLocalBinding(sourceProjection, {
    policyDigest: `sha256:${'a'.repeat(64)}`,
    sourceStateDigest: `sha256:${'b'.repeat(64)}`
  });
  return Object.freeze({ sourceProjection, packet, localBinding });
}

function executeCycle(fixture) {
  const carryCase = buildMarrowlinePocketHostedCarryCase(fixture.packet);
  const returnEnvelope = buildMarrowlineReturnEnvelope(carryCase, {
    ruleId: RULE_ID,
    claimedActionClass: MATCHING_ACTION
  });
  const result = revalidateMarrowlineReturn(carryCase, fixture.localBinding, returnEnvelope);
  const transport = Object.freeze({
    source_packet: fixture.packet,
    carry_case: carryCase,
    return_envelope: returnEnvelope
  });
  const forbiddenHistoryKeys = collectForbiddenHistoryKeys(transport);
  const transportJson = canonicalSurfaceJson(transport);

  if (forbiddenHistoryKeys.length > 0) {
    throw new Error(`portable route accumulated history keys: ${forbiddenHistoryKeys.join(', ')}`);
  }
  if (/sha256:/i.test(transportJson)) throw new Error('portable route accumulated a digest carrier');
  if (result.status !== 'PRESENT_TO_HUMAN') throw new Error(`matching round trip did not PRESENT_TO_HUMAN: ${result.status}`);
  if (result.candidate_trusted !== false || result.release_authority !== false || result.human_closure_required !== true || result.local_binding_retained !== true) {
    throw new Error('round-trip revalidation widened trust/authority or dropped local binding retention');
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
    forbidden_history_keys: Object.freeze([...forbiddenHistoryKeys])
  });
}

function allSame(cycles, selector) {
  const values = cycles.map(selector);
  return values.every((value) => value === values[0]);
}

export function runMarrowlineRoundTripMemorylessnessAssay() {
  const fixture = canonicalFixture();
  const rawCycles = Array.from(
    { length: MARROWLINE_ROUND_TRIP_MEMORYLESSNESS_CYCLE_COUNT },
    () => executeCycle(fixture)
  );

  const carryCaseByteIdentical = allSame(rawCycles, cycle => cycle.surfaces.carry_case.sha256)
    && allSame(rawCycles, cycle => cycle.surfaces.carry_case.bytes);
  const returnEnvelopeByteIdentical = allSame(rawCycles, cycle => cycle.surfaces.return_envelope.sha256)
    && allSame(rawCycles, cycle => cycle.surfaces.return_envelope.bytes);
  const packetByteIdentical = allSame(rawCycles, cycle => cycle.surfaces.source_packet.sha256)
    && allSame(rawCycles, cycle => cycle.surfaces.source_packet.bytes);
  const combinedTransportByteIdentical = allSame(rawCycles, cycle => cycle.surfaces.combined_transport.sha256)
    && allSame(rawCycles, cycle => cycle.surfaces.combined_transport.bytes);

  if (!carryCaseByteIdentical || !returnEnvelopeByteIdentical || !packetByteIdentical || !combinedTransportByteIdentical) {
    throw new Error('fixed canonical input diverged across bounded round-trip cycles');
  }

  const referenceCarry = rawCycles[0].transport.carry_case;
  const mismatchEnvelope = buildMarrowlineReturnEnvelope(referenceCarry, {
    ruleId: RULE_ID,
    claimedActionClass: MISMATCH_ACTION
  });
  const mismatchResult = revalidateMarrowlineReturn(referenceCarry, fixture.localBinding, mismatchEnvelope);
  if (mismatchResult.status !== 'HOLD') throw new Error('mismatch sensitivity control failed to HOLD');
  if (describeSurface(mismatchEnvelope).sha256 === rawCycles[0].surfaces.return_envelope.sha256) {
    throw new Error('return-envelope sensitivity control failed to distinguish a changed canonical action');
  }

  const alternateProjection = compilePortableAiaProjection({ ruleId: 'EXACT_TIMESTAMP', routeMode: 'LOCAL_POCKET' });
  const alternatePacket = Object.freeze({
    schema: LOCAL_POCKET_EXPORT_SCHEMA,
    portable_findings: Object.freeze([clone(alternateProjection.portable_payload)]),
    release_authority: false,
    human_closure_required: true
  });
  const alternateCarry = buildMarrowlinePocketHostedCarryCase(alternatePacket);
  if (describeSurface(alternateCarry).sha256 === rawCycles[0].surfaces.carry_case.sha256) {
    throw new Error('carry-case sensitivity control failed to distinguish a changed canonical rule');
  }

  const cycles = rawCycles.map((cycle, index) => Object.freeze({
    assay_cycle_index: index + 1,
    assay_local_only: true,
    surfaces: cycle.surfaces,
    revalidation: cycle.revalidation,
    forbidden_history_keys: cycle.forbidden_history_keys
  }));

  return Object.freeze({
    schema: MARROWLINE_ROUND_TRIP_MEMORYLESSNESS_ASSAY_SCHEMA,
    status: 'PASS',
    assay_local_only: true,
    cycle_count: MARROWLINE_ROUND_TRIP_MEMORYLESSNESS_CYCLE_COUNT,
    portable_cycle_index: false,
    route_history_carried: false,
    packet_byte_identical: packetByteIdentical,
    carry_case_byte_identical: carryCaseByteIdentical,
    return_envelope_byte_identical: returnEnvelopeByteIdentical,
    combined_transport_byte_identical: combinedTransportByteIdentical,
    canonical_surface: cycles[0].surfaces,
    cycles: Object.freeze(cycles),
    controls: Object.freeze({
      mismatch_action_status: mismatchResult.status,
      mismatch_return_distinguishable: true,
      alternate_rule_carry_case_distinguishable: true
    }),
    authority: Object.freeze({
      release_authority: false,
      human_closure_required: true,
      provider_call_performed: false,
      production_mutation: false
    }),
    claim_ceiling: 'bounded-three-cycle-compositional-memorylessness-only',
    seal: '⟐'
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(`${JSON.stringify(runMarrowlineRoundTripMemorylessnessAssay(), null, 2)}\n`);
}
