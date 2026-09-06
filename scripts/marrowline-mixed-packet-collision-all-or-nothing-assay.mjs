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
import {
  canonicalDuplicateCollisionSurfaceJson,
  runMarrowlineDuplicateRuleCollisionRejectionAssay
} from './marrowline-duplicate-rule-collision-rejection-assay.mjs';

export const MARROWLINE_MIXED_PACKET_COLLISION_ALL_OR_NOTHING_ASSAY_SCHEMA =
  'td613.marrowline.mixed-packet-collision-all-or-nothing-assay/v0.1-local-only';

export const MARROWLINE_MIXED_PACKET_COLLISIONS = Object.freeze([
  Object.freeze({ id: 'D_ABA', labels: Object.freeze(['A', 'B', 'A']), repeated_rule_id: 'EMAIL_IDENTIFIER', valid_prefix_rule_ids: Object.freeze(['EMAIL_IDENTIFIER', 'USER_DECLARED_PROTECTED_TERM']) }),
  Object.freeze({ id: 'D_BAB', labels: Object.freeze(['B', 'A', 'B']), repeated_rule_id: 'USER_DECLARED_PROTECTED_TERM', valid_prefix_rule_ids: Object.freeze(['USER_DECLARED_PROTECTED_TERM', 'EMAIL_IDENTIFIER']) })
]);

const FORBIDDEN_MIXED_TRANSPORT_KEYS = Object.freeze(new Set([
  'validated_prefix','partial_commit','partial_result','rejected_tail','surviving_sibling','surviving_sibling_id',
  'duplicate','duplicate_count','collision','collision_id','collision_history','rejected_rule','rejected_rule_id',
  'occurrence','occurrence_id','occurrence_index','schedule','schedule_index','nonce','timestamp','history','route_history','receipt_chain'
]));

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
}

export function canonicalMixedPacketCollisionSurfaceJson(value) {
  return JSON.stringify(stable(value));
}

function describeSurface(value) {
  const json = canonicalMixedPacketCollisionSurfaceJson(value);
  return Object.freeze({
    sha256: crypto.createHash('sha256').update(json, 'utf8').digest('hex'),
    bytes: Buffer.byteLength(json, 'utf8')
  });
}

function collectForbidden(value, path='transport', into=[]) {
  if (Array.isArray(value)) {
    value.forEach((item,index)=>collectForbidden(item, `${path}[${index}]`, into));
    return into;
  }
  if (!value || typeof value !== 'object') return into;
  for (const [key, child] of Object.entries(value)) {
    if (FORBIDDEN_MIXED_TRANSPORT_KEYS.has(String(key).toLowerCase())) into.push(`${path}.${key}`);
    collectForbidden(child, `${path}.${key}`, into);
  }
  return into;
}

function fixtureFor(spec) {
  const pocketProjection = compilePortableAiaProjection({ ruleId: spec.rule_id, routeMode: 'LOCAL_POCKET' });
  const hostedProjection = compilePortableAiaProjection({ ruleId: spec.rule_id, routeMode: 'TD613_HOSTED' });
  if (pocketProjection.invariant.action_class !== spec.matching_action) throw new Error(`${spec.label} canonical action drifted`);
  const localBinding = compilePortableAiaLocalBinding(pocketProjection, {
    policyDigest: `sha256:${spec.policy_digest_hex.repeat(64)}`,
    sourceStateDigest: `sha256:${spec.source_digest_hex.repeat(64)}`
  });
  return Object.freeze({ spec, pocketProjection, hostedProjection, localBinding });
}

function fixtures() {
  return Object.freeze({
    A: fixtureFor(MARROWLINE_MULTIPLEXED_FINDING_SPECS.A),
    B: fixtureFor(MARROWLINE_MULTIPLEXED_FINDING_SPECS.B)
  });
}

function buildPacket(labels, fixtureMap) {
  return Object.freeze({
    schema: LOCAL_POCKET_EXPORT_SCHEMA,
    portable_findings: Object.freeze(labels.map((label)=>fixtureMap[label].pocketProjection.portable_payload)),
    release_authority: false,
    human_closure_required: true
  });
}

function expectLateCollisionRejection(spec, packet) {
  let carryCase = null;
  try {
    carryCase = buildMarrowlinePocketHostedCarryCase(packet);
  } catch (error) {
    const expected = `duplicate portable finding: ${spec.repeated_rule_id}`;
    if (!(error instanceof TypeError) || String(error.message || '') !== expected) throw error;
    return Object.freeze({
      collision_id: spec.id,
      labels: spec.labels,
      repeated_rule_id: spec.repeated_rule_id,
      valid_prefix_rule_ids: spec.valid_prefix_rule_ids,
      source_packet: describeSurface(packet),
      rejected: true,
      error: error.message,
      carry_case_returned: false,
      transport_receipt_returned: false,
      hosted_findings_returned: false
    });
  }
  throw new Error(`${spec.id} late mixed collision returned a partial or complete Carry Case: ${canonicalMixedPacketCollisionSurfaceJson(carryCase)}`);
}

function hostedByRule(carryCase) {
  return Object.freeze(Object.fromEntries(carryCase.receipt.finding_rule_ids.map((ruleId,index)=>[ruleId,carryCase.hosted_portable_findings[index]])));
}

function buildLawfulPair(id, fixtureMap) {
  const packet = buildPacket(['A','B'], fixtureMap);
  const carryCase = buildMarrowlinePocketHostedCarryCase(packet);
  const hosted = hostedByRule(carryCase);
  const matchingEnvelopes = {};
  const mismatchEnvelopes = {};
  const matchingResults = {};
  const mismatchResults = {};
  for (const label of ['A','B']) {
    const f=fixtureMap[label];
    matchingEnvelopes[label]=buildMarrowlineReturnEnvelope(carryCase,{ruleId:f.spec.rule_id,claimedActionClass:f.spec.matching_action});
    mismatchEnvelopes[label]=buildMarrowlineReturnEnvelope(carryCase,{ruleId:f.spec.rule_id,claimedActionClass:f.spec.mismatch_action});
    matchingResults[label]=revalidateMarrowlineReturn(carryCase,f.localBinding,matchingEnvelopes[label]);
    mismatchResults[label]=revalidateMarrowlineReturn(carryCase,f.localBinding,mismatchEnvelopes[label]);
    if (matchingResults[label].status !== 'PRESENT_TO_HUMAN') throw new Error(`${id} ${label} lawful match drifted`);
    if (mismatchResults[label].status !== 'HOLD') throw new Error(`${id} ${label} lawful mismatch drifted`);
  }
  const transport={source_packet:packet,carry_case:carryCase};
  const forbidden=collectForbidden(transport);
  if (forbidden.length) throw new Error(`${id} accumulated mixed-collision state: ${forbidden.join(', ')}`);
  if (/sha256:/i.test(canonicalMixedPacketCollisionSurfaceJson(transport))) throw new Error(`${id} accumulated digest carrier`);
  return Object.freeze({
    id,
    finding_rule_ids: carryCase.receipt.finding_rule_ids,
    finding_count: carryCase.receipt.finding_count,
    source_packet: describeSurface(packet),
    carry_case: describeSurface(carryCase),
    hosted_by_rule: Object.freeze(Object.fromEntries(Object.entries(hosted).map(([ruleId,value])=>[ruleId,describeSurface(value)]))),
    matching_envelopes: Object.freeze(Object.fromEntries(Object.entries(matchingEnvelopes).map(([label,value])=>[label,describeSurface(value)]))),
    mismatch_envelopes: Object.freeze(Object.fromEntries(Object.entries(mismatchEnvelopes).map(([label,value])=>[label,describeSurface(value)]))),
    matching_results: Object.freeze(Object.fromEntries(Object.entries(matchingResults).map(([label,value])=>[label,describeSurface(value)]))),
    mismatch_results: Object.freeze(Object.fromEntries(Object.entries(mismatchResults).map(([label,value])=>[label,describeSurface(value)]))),
    matching_statuses: Object.freeze(Object.fromEntries(Object.entries(matchingResults).map(([label,value])=>[label,value.status]))),
    mismatch_statuses: Object.freeze(Object.fromEntries(Object.entries(mismatchResults).map(([label,value])=>[label,value.status]))),
    forbidden_transport_paths: Object.freeze([...forbidden]),
    release_authority: carryCase.receipt.release_authority,
    human_closure_required: carryCase.receipt.human_closure_required,
    local_binding_carried: carryCase.receipt.local_binding_carried
  });
}

function sameLawful(left,right) {
  const keys=['finding_rule_ids','finding_count','source_packet','carry_case','hosted_by_rule','matching_envelopes','mismatch_envelopes','matching_results','mismatch_results','matching_statuses','mismatch_statuses','forbidden_transport_paths'];
  return keys.every((key)=>canonicalMixedPacketCollisionSurfaceJson(left[key])===canonicalMixedPacketCollisionSurfaceJson(right[key]));
}

function assertMatchesParent(recovery,parent) {
  const keys=['finding_rule_ids','finding_count','source_packet','carry_case','hosted_by_rule','matching_envelopes','mismatch_envelopes','matching_statuses','mismatch_statuses'];
  for (const key of keys) {
    if (canonicalMixedPacketCollisionSurfaceJson(recovery[key]) !== canonicalDuplicateCollisionSurfaceJson(parent[key])) {
      throw new Error(`Lawful P_AB drifted from #1060 parent at ${key}`);
    }
  }
}

export function runMarrowlineMixedPacketCollisionAllOrNothingAssay() {
  const f=fixtures();
  const parent=runMarrowlineDuplicateRuleCollisionRejectionAssay();
  const packetABA=buildPacket(['A','B','A'],f);
  const packetBAB=buildPacket(['B','A','B'],f);

  const aba1=expectLateCollisionRejection(MARROWLINE_MIXED_PACKET_COLLISIONS[0],packetABA);
  const p1=buildLawfulPair('P_AB_AFTER_D_ABA_1',f);
  const bab=expectLateCollisionRejection(MARROWLINE_MIXED_PACKET_COLLISIONS[1],packetBAB);
  const p2=buildLawfulPair('P_AB_AFTER_D_BAB',f);
  const aba2=expectLateCollisionRejection(MARROWLINE_MIXED_PACKET_COLLISIONS[0],packetABA);
  const p3=buildLawfulPair('P_AB_AFTER_D_ABA_2',f);

  for (const p of [p1,p2,p3]) assertMatchesParent(p,parent.recoveries.P_AB_AFTER_D_AA);
  if (!sameLawful(p1,p2) || !sameLawful(p1,p3)) throw new Error('Late mixed collision poisoned subsequent lawful P_AB recovery');
  if (canonicalMixedPacketCollisionSurfaceJson(aba1) !== canonicalMixedPacketCollisionSurfaceJson(aba2)) throw new Error('D_ABA rejection receipt drifted across replay');

  return Object.freeze({
    schema: MARROWLINE_MIXED_PACKET_COLLISION_ALL_OR_NOTHING_ASSAY_SCHEMA,
    status: 'PASS',
    assay_local_only: true,
    collisions: Object.freeze({D_ABA:aba1,D_BAB:bab}),
    recoveries: Object.freeze({P_AB_AFTER_D_ABA_1:p1,P_AB_AFTER_D_BAB:p2,P_AB_AFTER_D_ABA_2:p3}),
    late_duplicate_a_rejected: true,
    late_duplicate_b_rejected: true,
    valid_prefix_never_returns_partial_carry_case: true,
    no_transport_receipt_from_rejected_packet: true,
    no_hosted_findings_from_rejected_packet: true,
    lawful_pair_matches_parent: true,
    repeated_mixed_collision_nonpoisoning: true,
    collision_identity_does_not_change_pair_recovery: true,
    hidden_prefix_state_carried: false,
    browser_persistence_required: false,
    authority: Object.freeze({release_authority:false,human_closure_required:true,provider_call_performed:false,production_mutation:false}),
    claim_ceiling: 'bounded-two-rule-late-duplicate-mixed-packet-construction-all-or-nothing-only'
  });
}
