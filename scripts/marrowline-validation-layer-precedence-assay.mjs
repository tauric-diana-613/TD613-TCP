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
import { runMarrowlineFiniteReturnScheduleClosureAssay } from './marrowline-finite-return-schedule-closure-assay.mjs';

export const MARROWLINE_VALIDATION_LAYER_PRECEDENCE_ASSAY_SCHEMA =
  'td613.marrowline.validation-layer-precedence-assay/v0.1-local-only';

export const MARROWLINE_VALIDATION_LAYER_SUFFIX_CLASSES = Object.freeze([
  'S0_CLEAN_CANONICAL',
  'S1_GLOBAL_FORBIDDEN_KEY',
  'S2_GLOBAL_DIGEST_STRING',
  'S3_SEQUENTIAL_UNSUPPORTED_RULE',
  'S4_SEQUENTIAL_SAFE_SHAPE_DRIFT'
]);

export const MARROWLINE_VALIDATION_LAYER_HOSTILE_CASE_IDS = Object.freeze([
  'EARLY_S0', 'EARLY_S1', 'EARLY_S2', 'EARLY_S3', 'EARLY_S4',
  'LATE_S0', 'LATE_S1', 'LATE_S2', 'LATE_S3', 'LATE_S4'
]);

export const MARROWLINE_VALIDATION_LAYER_REPLAY_ORDER = Object.freeze([
  'LATE_S4', 'LATE_S3', 'LATE_S2', 'LATE_S1', 'LATE_S0',
  'EARLY_S4', 'EARLY_S3', 'EARLY_S2', 'EARLY_S1', 'EARLY_S0'
]);

const RULES = Object.freeze({
  A: 'EMAIL_IDENTIFIER',
  B: 'USER_DECLARED_PROTECTED_TERM',
  C: 'PRIVATE_KEY_BLOCK'
});

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

export function canonicalValidationLayerPrecedenceJson(value) {
  return JSON.stringify(stable(value));
}

function describe(value) {
  const json = canonicalValidationLayerPrecedenceJson(value);
  return Object.freeze({
    sha256: crypto.createHash('sha256').update(json, 'utf8').digest('hex'),
    bytes: Buffer.byteLength(json, 'utf8')
  });
}

function projection(ruleId) {
  return compilePortableAiaProjection({ ruleId, routeMode: 'LOCAL_POCKET' });
}

function packet(findings) {
  return Object.freeze({
    schema: LOCAL_POCKET_EXPORT_SCHEMA,
    portable_findings: Object.freeze([...findings]),
    release_authority: false,
    human_closure_required: true
  });
}

function bindingFor(proj, policyHex, stateHex) {
  return compilePortableAiaLocalBinding(proj, {
    policyDigest: `sha256:${policyHex.repeat(64)}`,
    sourceStateDigest: `sha256:${stateHex.repeat(64)}`
  });
}

function mismatchAction(action) {
  return action === 'CHANGE' ? 'REMOVE' : 'CHANGE';
}

function buildFixture() {
  const A = projection(RULES.A);
  const B = projection(RULES.B);
  const C = projection(RULES.C);
  const bindings = Object.freeze({
    A: bindingFor(A, 'a', '1'),
    B: bindingFor(B, 'b', '2'),
    C: bindingFor(C, 'c', '3')
  });
  const canonical = Object.freeze({ A, B, C, bindings });

  const suffixes = Object.freeze({
    S0: C.portable_payload,
    S1: Object.freeze({ ...C.portable_payload, raw_message: 'TD613_SUFFIX_CANARY' }),
    S2: Object.freeze({ ...C.portable_payload, note: 'sha256:613613' }),
    S3: Object.freeze({ rule_id: 'TD613_UNSUPPORTED_SUFFIX_RULE' }),
    S4: Object.freeze({ ...C.portable_payload, note: 'SAFE_SHAPE_DRIFT' })
  });

  return Object.freeze({ ...canonical, suffixes });
}

function expectReject(sourcePacket) {
  try {
    const carryCase = buildMarrowlinePocketHostedCarryCase(sourcePacket);
    return Object.freeze({
      rejected: false,
      error: null,
      carry_case_returned: true,
      transport_receipt_returned: Boolean(carryCase?.receipt),
      hosted_findings_returned: Array.isArray(carryCase?.hosted_portable_findings)
    });
  } catch (error) {
    if (!(error instanceof TypeError)) throw error;
    return Object.freeze({
      rejected: true,
      error: String(error.message || ''),
      carry_case_returned: false,
      transport_receipt_returned: false,
      hosted_findings_returned: false
    });
  }
}

function resultSurface(carryCase, proj, localBinding) {
  const matchingEnvelope = buildMarrowlineReturnEnvelope(carryCase, {
    ruleId: proj.invariant.rule_id,
    claimedActionClass: proj.invariant.action_class
  });
  const mismatchEnvelope = buildMarrowlineReturnEnvelope(carryCase, {
    ruleId: proj.invariant.rule_id,
    claimedActionClass: mismatchAction(proj.invariant.action_class)
  });
  const matchingResult = revalidateMarrowlineReturn(carryCase, localBinding, matchingEnvelope);
  const mismatchResult = revalidateMarrowlineReturn(carryCase, localBinding, mismatchEnvelope);
  if (matchingResult.status !== 'PRESENT_TO_HUMAN' || mismatchResult.status !== 'HOLD') {
    throw new Error(`lawful return drifted for ${proj.invariant.rule_id}`);
  }
  return Object.freeze({
    hosted: describe(carryCase.hosted_portable_findings.find(item => item.rule_id === proj.invariant.rule_id)),
    matching_envelope: describe(matchingEnvelope),
    mismatch_envelope: describe(mismatchEnvelope),
    matching_result: describe(matchingResult),
    mismatch_result: describe(mismatchResult),
    matching_status: matchingResult.status,
    mismatch_status: mismatchResult.status
  });
}

function buildLawfulSurface(fixture, kind) {
  if (kind === 'P_AB') {
    const sourcePacket = packet([fixture.A.portable_payload, fixture.B.portable_payload]);
    const carryCase = buildMarrowlinePocketHostedCarryCase(sourcePacket);
    return Object.freeze({
      source_packet: describe(sourcePacket),
      carry_case: describe(carryCase),
      finding_rule_ids: carryCase.receipt.finding_rule_ids,
      finding_count: carryCase.receipt.finding_count,
      A: resultSurface(carryCase, fixture.A, fixture.bindings.A),
      B: resultSurface(carryCase, fixture.B, fixture.bindings.B),
      release_authority: carryCase.receipt.release_authority,
      human_closure_required: carryCase.receipt.human_closure_required,
      local_binding_carried: carryCase.receipt.local_binding_carried
    });
  }
  const sourcePacket = packet([fixture.C.portable_payload]);
  const carryCase = buildMarrowlinePocketHostedCarryCase(sourcePacket);
  return Object.freeze({
    source_packet: describe(sourcePacket),
    carry_case: describe(carryCase),
    finding_rule_ids: carryCase.receipt.finding_rule_ids,
    finding_count: carryCase.receipt.finding_count,
    C: resultSurface(carryCase, fixture.C, fixture.bindings.C),
    release_authority: carryCase.receipt.release_authority,
    human_closure_required: carryCase.receipt.human_closure_required,
    local_binding_carried: carryCase.receipt.local_binding_carried
  });
}

function same(left, right) {
  return canonicalValidationLayerPrecedenceJson(left) === canonicalValidationLayerPrecedenceJson(right);
}

function assertLawfulStable(baseline, observed, label) {
  if (!same(baseline, observed)) throw new Error(`${label} poisoned later lawful construction`);
}

function assertPairMatches1064(pair) {
  const parent = runMarrowlineFiniteReturnScheduleClosureAssay().shared_case;
  const comparable = Object.freeze({
    source_packet: pair.source_packet,
    carry_case: pair.carry_case,
    hosted_by_rule: Object.freeze({
      EMAIL_IDENTIFIER: pair.A.hosted,
      USER_DECLARED_PROTECTED_TERM: pair.B.hosted
    }),
    matching_envelopes: Object.freeze({ A: pair.A.matching_envelope, B: pair.B.matching_envelope }),
    mismatch_envelopes: Object.freeze({ A: pair.A.mismatch_envelope, B: pair.B.mismatch_envelope }),
    matching_results: Object.freeze({ A: pair.A.matching_result, B: pair.B.matching_result }),
    mismatch_results: Object.freeze({ A: pair.A.mismatch_result, B: pair.B.mismatch_result })
  });
  for (const key of Object.keys(comparable)) {
    if (!same(comparable[key], parent[key])) throw new Error(`P_AB drifted from #1064 parent at ${key}`);
  }
}

function hostileDefinitions(fixture) {
  const early = Object.freeze([fixture.A.portable_payload, fixture.A.portable_payload]);
  const late = Object.freeze([fixture.A.portable_payload, fixture.B.portable_payload, fixture.A.portable_payload]);
  const suffixByClass = Object.freeze({
    S0: fixture.suffixes.S0,
    S1: fixture.suffixes.S1,
    S2: fixture.suffixes.S2,
    S3: fixture.suffixes.S3,
    S4: fixture.suffixes.S4
  });
  const definitions = [];
  for (const [prefixName, prefix] of [['EARLY', early], ['LATE', late]]) {
    for (const suffixName of ['S0', 'S1', 'S2', 'S3', 'S4']) {
      definitions.push(Object.freeze({
        id: `${prefixName}_${suffixName}`,
        prefix_name: prefixName,
        suffix_name: suffixName,
        source_packet: packet([...prefix, suffixByClass[suffixName]])
      }));
    }
  }
  return Object.freeze(definitions);
}

function classifyExpected(definition) {
  if (definition.suffix_name === 'S1') return 'PACKET_WIDE_FORBIDDEN_KEY';
  if (definition.suffix_name === 'S2') return 'PACKET_WIDE_DIGEST_STRING';
  return 'SEQUENTIAL_DUPLICATE';
}

function assertHostileError(definition, rejection) {
  if (!rejection.rejected || rejection.carry_case_returned || rejection.transport_receipt_returned || rejection.hosted_findings_returned) {
    throw new Error(`${definition.id} returned partial transport`);
  }
  const suffixIndex = definition.prefix_name === 'EARLY' ? 2 : 3;
  if (definition.suffix_name === 'S1') {
    const expected = `Pocket packet.portable_findings[${suffixIndex}].raw_message is forbidden on the carry-case route`;
    if (rejection.error !== expected) throw new Error(`${definition.id} packet-wide forbidden-key precedence drifted: ${rejection.error}`);
    return;
  }
  if (definition.suffix_name === 'S2') {
    const expected = `Pocket packet.portable_findings[${suffixIndex}].note contains a digest-like transport carrier`;
    if (rejection.error !== expected) throw new Error(`${definition.id} packet-wide digest precedence drifted: ${rejection.error}`);
    return;
  }
  if (rejection.error !== 'duplicate portable finding: EMAIL_IDENTIFIER') {
    throw new Error(`${definition.id} sequential duplicate masking drifted: ${rejection.error}`);
  }
}

function executeHostile(fixture, definition, pairBaseline, cBaseline) {
  const rejection = expectReject(definition.source_packet);
  assertHostileError(definition, rejection);
  const pairRecovery = buildLawfulSurface(fixture, 'P_AB');
  const cRecovery = buildLawfulSurface(fixture, 'P_C');
  assertLawfulStable(pairBaseline, pairRecovery, `${definition.id} P_AB recovery`);
  assertLawfulStable(cBaseline, cRecovery, `${definition.id} P_C recovery`);
  return Object.freeze({
    case_id: definition.id,
    prefix_name: definition.prefix_name,
    suffix_name: definition.suffix_name,
    expected_validation_layer: classifyExpected(definition),
    source_packet: describe(definition.source_packet),
    rejection,
    pair_recovery_stable: true,
    c_recovery_stable: true,
    partial_transport_returned: false
  });
}

function reachabilityControls(fixture) {
  const cleanPacket = packet([fixture.A.portable_payload, fixture.C.portable_payload]);
  const cleanCarry = buildMarrowlinePocketHostedCarryCase(cleanPacket);
  if (!same(cleanCarry.receipt.finding_rule_ids, [RULES.A, RULES.C])) throw new Error('S0 reachability control drifted');

  const controls = Object.freeze({
    S0: Object.freeze({ admitted: true, error: null, finding_rule_ids: cleanCarry.receipt.finding_rule_ids }),
    S1: expectReject(packet([fixture.A.portable_payload, fixture.suffixes.S1])),
    S2: expectReject(packet([fixture.A.portable_payload, fixture.suffixes.S2])),
    S3: expectReject(packet([fixture.A.portable_payload, fixture.suffixes.S3])),
    S4: expectReject(packet([fixture.A.portable_payload, fixture.suffixes.S4]))
  });

  const expected = Object.freeze({
    S1: 'Pocket packet.portable_findings[1].raw_message is forbidden on the carry-case route',
    S2: 'Pocket packet.portable_findings[1].note contains a digest-like transport carrier',
    S3: 'portable_findings[1] has unsupported rule_id',
    S4: 'portable_findings[1] differs from canonical Local Pocket projection'
  });
  for (const key of ['S1', 'S2', 'S3', 'S4']) {
    if (!controls[key].rejected || controls[key].error !== expected[key]) {
      throw new Error(`${key} reachability control failed: ${controls[key].error}`);
    }
  }
  return controls;
}

function keyed(items) {
  return Object.fromEntries(items.map(item => [item.case_id, item]));
}

export function runMarrowlineValidationLayerPrecedenceAssay() {
  const fixture = buildFixture();
  const pairBaseline = buildLawfulSurface(fixture, 'P_AB');
  const cBaseline = buildLawfulSurface(fixture, 'P_C');
  assertPairMatches1064(pairBaseline);

  const definitions = hostileDefinitions(fixture);
  if (!same(definitions.map(item => item.id), MARROWLINE_VALIDATION_LAYER_HOSTILE_CASE_IDS)) {
    throw new Error('frozen ten-case hostile matrix drifted');
  }

  const reachability = reachabilityControls(fixture);
  const primary = Object.freeze(definitions.map(def => executeHostile(fixture, def, pairBaseline, cBaseline)));
  const byId = Object.fromEntries(definitions.map(def => [def.id, def]));
  const replay = Object.freeze(MARROWLINE_VALIDATION_LAYER_REPLAY_ORDER.map(id => executeHostile(fixture, byId[id], pairBaseline, cBaseline)));
  const primaryById = keyed(primary);
  const replayById = keyed(replay);
  for (const id of MARROWLINE_VALIDATION_LAYER_HOSTILE_CASE_IDS) {
    if (!same(primaryById[id], replayById[id])) throw new Error(`${id} changed across deterministic replay`);
  }

  const globalCases = primary.filter(item => ['S1', 'S2'].includes(item.suffix_name));
  const maskedCases = primary.filter(item => ['S3', 'S4'].includes(item.suffix_name));
  const cleanCases = primary.filter(item => item.suffix_name === 'S0');
  if (!globalCases.every(item => item.expected_validation_layer.startsWith('PACKET_WIDE_'))) throw new Error('global preaudit classification incomplete');
  if (!maskedCases.every(item => item.rejection.error === 'duplicate portable finding: EMAIL_IDENTIFIER')) throw new Error('sequential suffix masking incomplete');
  if (!cleanCases.every(item => item.rejection.error === 'duplicate portable finding: EMAIL_IDENTIFIER')) throw new Error('clean suffix duplicate class drifted');

  return Object.freeze({
    schema: MARROWLINE_VALIDATION_LAYER_PRECEDENCE_ASSAY_SCHEMA,
    status: 'PASS',
    assay_local_only: true,
    exact_hostile_case_ids: MARROWLINE_VALIDATION_LAYER_HOSTILE_CASE_IDS,
    suffix_classes: MARROWLINE_VALIDATION_LAYER_SUFFIX_CLASSES,
    primary_order: MARROWLINE_VALIDATION_LAYER_HOSTILE_CASE_IDS,
    replay_order: MARROWLINE_VALIDATION_LAYER_REPLAY_ORDER,
    primary_cases: primary,
    replay_cases: replay,
    reachability_controls: reachability,
    lawful_baselines: Object.freeze({ P_AB: pairBaseline, P_C: cBaseline }),
    packet_wide_preaudit_preempts_lexically_earlier_duplicate: true,
    sequential_suffix_violations_masked_by_earlier_duplicate: true,
    clean_suffix_preserves_duplicate_class: true,
    reachability_controls_confirm_suffix_classes: true,
    no_partial_transport_from_hostile_matrix: true,
    lawful_pair_matches_1064_parent: true,
    lawful_c_recovery_stable: true,
    primary_replay_invariant: true,
    portable_validation_history_carried: false,
    browser_persistence_required: false,
    authority: Object.freeze({
      release_authority: false,
      human_closure_required: true,
      provider_call_performed: false,
      production_mutation: false
    }),
    claim_ceiling: 'bounded-two-prefix-five-suffix-validation-layer-precedence-only',
    seal: '⟐'
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  process.stdout.write(`${JSON.stringify(runMarrowlineValidationLayerPrecedenceAssay(), null, 2)}\n`);
}
